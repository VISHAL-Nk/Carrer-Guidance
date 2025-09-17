// question.router.js - Express Router for Career Guidance API

import express from 'express';
const router = express.Router();
import  { careerQuestions, calculateCareerPath, careerPaths } from '../data/question10.js';

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

// GET /api/questions - Get all career assessment questions
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        questions: careerQuestions,
        totalQuestions: careerQuestions.length,
        categories: [...new Set(careerQuestions.map(q => q.category))]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
      message: error.message
    });
  }
});

// GET /api/questions/:id - Get specific question by ID
router.get('/:id', (req, res) => {
  try {
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

// POST /api/questions/assess - Submit assessment and get career recommendation
router.post('/assess', validateAssessmentData, (req, res) => {
  try {
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
    res.status(500).json({
      success: false,
      error: 'Failed to process assessment',
      message: error.message
    });
  }
});

// GET /api/questions/career-paths - Get all available career paths
router.get('/career-paths', (req, res) => {
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

// POST /api/questions/save-result - Save assessment result (for future implementation)
router.post('/save-result', (req, res) => {
  try {
    const { assessmentId, studentId, result } = req.body;
    
    // Here you would typically save to database
    // For now, just return success response
    res.json({
      success: true,
      message: 'Assessment result saved successfully',
      data: {
        assessmentId: assessmentId || Date.now(),
        savedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save result',
      message: error.message
    });
  }
});

// GET /api/questions/stats - Get assessment statistics
router.get('/stats', (req, res) => {
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
router.use((error, req, res, next) => {
  console.error('Router Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;