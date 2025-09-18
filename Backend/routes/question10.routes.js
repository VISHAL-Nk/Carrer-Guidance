import express from 'express';
import jwt from 'jsonwebtoken';
import { careerQuestions, calculateCareerPath, careerPaths } from '../data/question10.js';
import UserProfile from '../models/UserProfile.models.js';

const questionRouter = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }
    
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

// Middleware for input validation
const validateAssessmentData = (req, res, next) => {
  const { responses, studentInfo } = req.body;
  
  if (!responses || !Array.isArray(responses)) {
    return res.status(400).json({
      error: 'Invalid responses format. Expected array of responses.'
    });
  }

  if (responses.length === 0) {
    return res.status(400).json({
      error: 'No responses provided.'
    });
  }

  // Validate each response
  for (let response of responses) {
    if (!response.questionId || !response.answer) {
      return res.status(400).json({
        error: 'Invalid response format. Each response must have questionId and answer.'
      });
    }
  }

  next();
};

// GET /api/v1/questions - Get all career assessment questions (only for 10th grade)
questionRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await UserProfile.findById(userId);
    
    if (!userProfile || !userProfile.class) {
      return res.status(400).json({ 
        message: 'User profile incomplete. Please complete your profile first.' 
      });
    }

    // Only allow 10th grade students to access questions
    if (userProfile.class !== '10th') {
      return res.status(403).json({
        success: false,
        message: 'Career guidance questionnaire is currently available only for 10th grade students.',
        userClass: userProfile.class,
        status: 'update_underway'
      });
    }

    res.json({
      success: true,
      data: {
        questions: careerQuestions,
        totalQuestions: careerQuestions.length,
        categories: [...new Set(careerQuestions.map(q => q.category))],
        userClass: userProfile.class
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
      message: error.message
    });
  }
});

// GET /api/v1/questions/:id - Get specific question by ID
questionRouter.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await UserProfile.findById(userId);
    
    if (!userProfile || userProfile.class !== '10th') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const questionId = parseInt(req.params.id);
    const question = careerQuestions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question',
      message: error.message
    });
  }
});

// POST /api/v1/questions/assess - Submit assessment and get career recommendation
questionRouter.post('/assess', authenticateToken, validateAssessmentData, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await UserProfile.findById(userId);
    
    if (!userProfile || userProfile.class !== '10th') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { responses, studentInfo } = req.body;
    
    // Calculate career path recommendation
    const result = calculateCareerPath(responses);
    
    // Prepare detailed response
    const assessment = {
      studentInfo: studentInfo || {},
      responses,
      totalQuestions: careerQuestions.length,
      answeredQuestions: responses.length,
      completionPercentage: Math.round((responses.length / careerQuestions.length) * 100),
      recommendation: {
        primaryPath: result.recommendedPath,
        pathDetails: result.pathDetails,
        scores: result.scores,
        confidence: Math.max(...Object.values(result.scores)) / (careerQuestions.length * 4) * 100 // Max possible score per question is 4
      },
      alternativePaths: Object.keys(result.scores)
        .filter(path => path !== result.recommendedPath)
        .sort((a, b) => result.scores[b] - result.scores[a])
        .slice(0, 2)
        .map(path => ({
          path,
          score: result.scores[path],
          details: careerPaths[path]
        })),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: assessment
    });
    
  } catch (error) {
    console.error('Error processing assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process assessment',
      message: error.message
    });
  }
});

// GET /api/v1/questions/career-paths - Get all available career paths
questionRouter.get('/career-paths', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        careerPaths,
        totalPaths: Object.keys(careerPaths).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch career paths',
      message: error.message
    });
  }
});

// GET /api/v1/questions/stats - Get assessment statistics
questionRouter.get('/stats', (req, res) => {
  try {
    const stats = {
      totalQuestions: careerQuestions.length,
      questionsByCategory: careerQuestions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {}),
      availableCareerPaths: Object.keys(careerPaths).length,
      careerPathNames: Object.keys(careerPaths).map(key => careerPaths[key].name)
    };

    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Error handling middleware
questionRouter.use((error, req, res, next) => {
  console.error('Router Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default questionRouter;