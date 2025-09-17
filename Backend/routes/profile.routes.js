import { Router } from "express";
import jwt from "jsonwebtoken";
import UserProfile from "../models/UserProfile.models.js";

const profileRouter = Router();

profileRouter.post('/', async(req, res) => {
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
        if (existingProfile) {
            return res.status(409).json({ message: 'Profile already exists for this user' });
        }

        // Create new profile
        const newProfile = new UserProfile({
            _id: userId,
            dob: profileData.dob,
            gender: profileData.gender,
            location: profileData.location,
            class: profileData.class,
            stream: profileData.stream
        });

        await newProfile.save();
        res.status(201).json({ message: 'Profile created successfully', profile: newProfile });

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

export default profileRouter;