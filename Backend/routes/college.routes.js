import { Router } from "express";
import jwt from "jsonwebtoken";
import { collegeAfter10, collegeAfter12 } from "../data/collegeData.js";
import UserProfile from "../models/UserProfile.models.js";

const collegeRouter = Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid authentication token' });
    }
};

// GET /api/v1/colleges - Get colleges based on user's class
collegeRouter.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search, location, type } = req.query;
        
        // Get user profile to determine class
        const userProfile = await UserProfile.findById(userId);
        
        if (!userProfile || !userProfile.class) {
            return res.status(400).json({ 
                message: 'User profile incomplete. Please complete your profile to view colleges.' 
            });
        }

        // Select appropriate college data based on class
        let colleges = userProfile.class === '10th' ? collegeAfter10 : collegeAfter12;
        
        // Apply filters
        if (search) {
            const searchTerm = search.toLowerCase();
            colleges = colleges.filter(college => 
                college.collegeName.toLowerCase().includes(searchTerm) ||
                college.location.toLowerCase().includes(searchTerm)
            );
        }
        
        if (location) {
            colleges = colleges.filter(college => 
                college.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        
        if (type) {
            colleges = colleges.filter(college => 
                college.CollegeType.toLowerCase().includes(type.toLowerCase())
            );
        }

        // Get unique locations and types for filter options
        const allColleges = userProfile.class === '10th' ? collegeAfter10 : collegeAfter12;
        const locations = [...new Set(allColleges.map(college => college.location))].sort();
        const types = [...new Set(allColleges.map(college => college.CollegeType))].sort();

        res.json({
            success: true,
            data: {
                colleges,
                totalCount: colleges.length,
                userClass: userProfile.class,
                filters: {
                    locations,
                    types
                }
            }
        });

    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
});

// GET /api/v1/colleges/stats - Get college statistics
collegeRouter.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userProfile = await UserProfile.findById(userId);
        
        if (!userProfile || !userProfile.class) {
            return res.status(400).json({ 
                message: 'User profile incomplete.' 
            });
        }

        const colleges = userProfile.class === '10th' ? collegeAfter10 : collegeAfter12;
        
        // Calculate statistics
        const stats = {
            totalColleges: colleges.length,
            byType: colleges.reduce((acc, college) => {
                acc[college.CollegeType] = (acc[college.CollegeType] || 0) + 1;
                return acc;
            }, {}),
            byLocation: colleges.reduce((acc, college) => {
                acc[college.location] = (acc[college.location] || 0) + 1;
                return acc;
            }, {}),
            userClass: userProfile.class
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching college stats:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
});

export default collegeRouter;
