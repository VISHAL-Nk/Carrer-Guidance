import { Router } from "express";
import jwt from "jsonwebtoken";
import UserProfile from "../models/UserProfile.models.js";
import User from "../models/User.models.js";

const profileRouter = Router();

profileRouter.put('/', async(req, res) => {
    try {
        const profileData = req.body;
        if (!profileData || Object.keys(profileData).length === 0) {
            return res.status(400).json({ message: 'Profile data is required' });
        }
        if(!profileData.stream && profileData.class === "10th"){
            profileData.stream = "None";
        }
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        const userId = decoded.userId;

        // Check if profile already exists for the user
        const existingProfile = await UserProfile.findById(userId);
        if (!existingProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Update existing profile
        existingProfile.dob = profileData.dob || existingProfile.dob;
        existingProfile.gender = profileData.gender || existingProfile.gender;
        existingProfile.location = profileData.location || existingProfile.location;
        existingProfile.class = profileData.class || existingProfile.class;
        existingProfile.stream = profileData.stream || existingProfile.stream;

        const newProfile = existingProfile;

        await newProfile.save();
        
        // Update profile completion status
        const user = await User.findById(userId);
        if (user) {
            const { percentage, isComplete } = await user.calculateProfileCompletion();
            res.status(201).json({ 
                message: 'Profile updated successfully', 
                profile: newProfile,
                profileCompletion: {
                    isComplete: isComplete,
                    percentage: percentage
                }
            });
        } else {
            res.status(201).json({ message: 'Profile updated successfully', profile: newProfile });
        }

    } catch (error) {
        let errorMessage = 'Server error';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        console.error('Error creating profile:', error);
        res.status(500).json({ message: errorMessage });
    }
});

// Get profile completion status
profileRouter.get('/completion', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        const userId = decoded.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { percentage, isComplete } = await user.calculateProfileCompletion();
        
        res.status(200).json({
            profileCompletion: {
                isComplete: isComplete,
                percentage: percentage
            }
        });

    } catch (error) {
        console.error('Error getting profile completion:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user profile
profileRouter.get('/', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        const userId = decoded.userId;
        const profile = await UserProfile.findById(userId);
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const user = await User.findById(userId);
        const { percentage, isComplete } = await user.calculateProfileCompletion();

        res.status(200).json({
            profile: profile,
            profileCompletion: {
                isComplete: isComplete,
                percentage: percentage
            }
        });

    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default profileRouter;