import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import connectDB from './database/mongoose.js';
import dotenv from 'dotenv';
import { securityHeaders } from './middleware/security.js';
import { logger, requestLogger } from './utils/logger.js';
import profileRouter from './routes/profile.routes.js';

// Load environment variables
dotenv.config();

// Environment validation
const requiredEnvVars = ['JWT_SECRET', 'TWILIO_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Trust proxy for accurate IP addresses (if behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // We handle CSP in our custom middleware
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'http://localhost:5173', 
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Custom security headers
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// Body parsing middleware with limits
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            logger.warn('Invalid JSON received', { ip: req.ip, error: e.message });
            res.status(400).json({ message: 'Invalid JSON format' });
            return;
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profile', profileRouter);

app.get('/api/v1', (req, res) => {
    res.json({
        message: 'API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            health: '/health'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    logger.warn('404 - Route not found', { url: req.originalUrl, method: req.method, ip: req.ip });
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error', { 
        error: error.message, 
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });
    
    if (res.headersSent) {
        return next(error);
    }
    
    res.status(error.status || 500).json({
        message: NODE_ENV === 'production' ? 'Internal server error' : error.message,
        ...(NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
    logger.info(`Server started successfully`, {
        port: PORT,
        environment: NODE_ENV,
        nodeVersion: process.version
    });
    connectDB();
});

// Set server timeout
server.timeout = 30000; // 30 seconds

export default app;