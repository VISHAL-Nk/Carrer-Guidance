import { Router } from "express";
import bcryptjs from "bcryptjs";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import jwt from "jsonwebtoken";
import User from "../models/User.models.js";
import { 
    authRateLimit, 
    otpRateLimit, 
    registerRateLimit, 
    sanitizeInput 
} from "../middleware/security.js";
import { logger } from "../utils/logger.js";

const authRouter = Router();

// Validation utilities
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=\-])[A-Za-z\d@$!%*?&=\-]{8,}$/;

const validateEmail = (email) => emailRegex.test(email);
const validatePhone = (phone) => phoneRegex.test(phone);
const validatePassword = (password) => passwordRegex.test(password);
const validateName = (name) => name && name.trim().length >= 2 && name.trim().length <= 50;

// Temporary storage for registration data before OTP verification
// In production, use Redis or database
const pendingRegistrations = new Map();

// Cleanup expired pending registrations periodically
setInterval(() => {
    const now = new Date();
    for (const [phone, data] of pendingRegistrations.entries()) {
        if (now > data.otpExpiry) {
            pendingRegistrations.delete(phone);
        }
    }
}, 60000); // Clean every minute

authRouter.post('/register', registerRateLimit, sanitizeInput, async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password, confirmPassword, phone } = req.body;
        console.log(req.body);
        // Input validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({ 
                message: 'All required fields must be provided',
                required: ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone']
            });
        }
        
        // Validate name fields
        if (!validateName(firstName)) {
            return res.status(400).json({ message: 'First name must be 2-50 characters long' });
        }
        if (!validateName(lastName)) {
            return res.status(400).json({ message: 'Last name must be 2-50 characters long' });
        }
        if (middleName && !validateName(middleName)) {
            return res.status(400).json({ message: 'Middle name must be 2-50 characters long' });
        }
        
        // Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        
        // Validate phone
        if (!validatePhone(phone)) {
            return res.status(400).json({ message: 'Please provide a valid phone number' });
        }
        
        // Validate password
        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' 
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() }, 
                { phone: phone }
            ] 
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email or phone' });
        }
        
        // Check if there's already a pending registration for this phone
        if (pendingRegistrations.has(phone)) {
            const existing = pendingRegistrations.get(phone);
            if (new Date() < existing.otpExpiry) {
                return res.status(429).json({ 
                    message: 'OTP already sent. Please wait before requesting a new one.',
                    retryAfter: Math.ceil((existing.otpExpiry - new Date()) / 1000)
                });
            }
        }
        
        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 12);
        
        // Generate OTP
        const otp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false 
        });
        
        // Store registration data temporarily
        pendingRegistrations.set(phone, {
            firstName: firstName.trim(),
            middleName: middleName?.trim() || null,
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone.trim(),
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            attempts: 0
        });
        
        // Send OTP via SMS
        try {
            const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            
            logger.info('OTP sent successfully', { phone: phone.replace(/(.{3}).*(.{4})/, '$1****$2') });
            
        } catch (twilioError) {
            logger.error('SMS sending failed', { error: twilioError.message, phone: phone.replace(/(.{3}).*(.{4})/, '$1****$2') });
            pendingRegistrations.delete(phone);
            return res.status(503).json({ message: 'Failed to send verification code. Please try again.' });
        }
        
        res.status(200).json({ 
            message: 'Verification code sent successfully',
            expiresIn: 300 // 5 minutes in seconds
        });
        
    } catch (error) {
        logger.error('Registration error', { error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
});

authRouter.post('/login', authRateLimit, sanitizeInput, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Find user by email (case insensitive)
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your account first' });
        }
        
        // Validate password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '24h',
                issuer: 'sih',
                audience: 'students'
            }
        );
        
        // Set secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });
        
        logger.info('User logged in successfully', { email: user.email, userId: user._id });
        
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName
            },
            token
        });
        
    } catch (error) {
        logger.error('Login error', { error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
});

authRouter.post('/signout', (req, res) => {
    try {
        // Clear the token cookie with same options as when it was set
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        
        logger.info('User signed out successfully');
        
        res.status(200).json({ message: 'User signed out successfully' });
        
    } catch (error) {
        logger.error('Signout error', { error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
});

authRouter.post('/verifyOTP', otpRateLimit, sanitizeInput, async (req, res) => {
    try {
        const { phone, otp } = req.body;
        
        // Input validation
        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone and OTP are required' });
        }
        
        if (!validatePhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: 'OTP must be 6 digits' });
        }
        
        // Get pending registration data
        const registrationData = pendingRegistrations.get(phone);
        if (!registrationData) {
            return res.status(404).json({ message: 'No pending registration found for this phone number' });
        }
        
        // Check if OTP is expired
        if (new Date() > registrationData.otpExpiry) {
            pendingRegistrations.delete(phone);
            return res.status(410).json({ message: 'OTP has expired. Please register again.' });
        }
        
        // Rate limiting for OTP attempts
        if (registrationData.attempts >= 3) {
            pendingRegistrations.delete(phone);
            return res.status(429).json({ 
                message: 'Too many failed attempts. Please register again.' 
            });
        }
        
        // Verify OTP
        if (registrationData.otp !== otp) {
            registrationData.attempts += 1;
            pendingRegistrations.set(phone, registrationData);
            
            return res.status(400).json({ 
                message: 'Invalid OTP',
                attemptsRemaining: 3 - registrationData.attempts
            });
        }
        
        // Double-check user doesn't exist (race condition protection)
        const existingUser = await User.findOne({ 
            $or: [
                { email: registrationData.email }, 
                { phone: registrationData.phone }
            ] 
        });
        if (existingUser) {
            pendingRegistrations.delete(phone);
            return res.status(409).json({ message: 'User already exists' });
        }
        
        // Create user in database
        const newUser = new User({
            firstName: registrationData.firstName,
            middleName: registrationData.middleName,
            lastName: registrationData.lastName,
            email: registrationData.email,
            password: registrationData.password,
            phone: registrationData.phone,
            isVerified: true
        });
        
        await newUser.save();
        
        // Remove from pending registrations
        pendingRegistrations.delete(phone);
        
        logger.info('User registered successfully', { email: registrationData.email, userId: newUser._id });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                phone: newUser.phone,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        });
        
    } catch (error) {
        logger.error('OTP verification error', { error: error.message, stack: error.stack });
        
        if (error.code === 11000) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default authRouter;