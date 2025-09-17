import { Router } from "express";
import { collegeAfter10, collegeAfter12 } from "../data/collegeData.js";
import { logger } from "../utils/logger.js";

const collegeRouter = Router();

// Combine all college data
const allColleges = [...collegeAfter10, ...collegeAfter12];

// Get all colleges
collegeRouter.get('/', async (req, res) => {
    try {
        logger.info('College data requested');
        res.json({
            success: true,
            data: allColleges,
            count: allColleges.length
        });
    } catch (error) {
        logger.error('Error fetching college data', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get college by ID
collegeRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const college = allColleges.find(c => c.id === parseInt(id));
        
        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }
        
        logger.info('College data requested by ID', { collegeId: id });
        res.json({
            success: true,
            data: college
        });
    } catch (error) {
        logger.error('Error fetching college by ID', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get colleges after 10th
collegeRouter.get('/after-10th', async (req, res) => {
    try {
        logger.info('Colleges after 10th requested');
        res.json({
            success: true,
            data: collegeAfter10,
            count: collegeAfter10.length
        });
    } catch (error) {
        logger.error('Error fetching colleges after 10th', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get colleges after 12th
collegeRouter.get('/after-12th', async (req, res) => {
    try {
        logger.info('Colleges after 12th requested');
        res.json({
            success: true,
            data: collegeAfter12,
            count: collegeAfter12.length
        });
    } catch (error) {
        logger.error('Error fetching colleges after 12th', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default collegeRouter;
