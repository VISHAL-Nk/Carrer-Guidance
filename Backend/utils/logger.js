import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

// Utility to sanitize log data (remove sensitive information)
const sanitizeLogData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'otp', 'authorization', 'cookie'];
    
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    
    // Mask email and phone for privacy
    if (sanitized.email) {
        sanitized.email = sanitized.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    }
    if (sanitized.phone) {
        sanitized.phone = sanitized.phone.replace(/(.{3}).*(.{4})/, '$1****$2');
    }
    
    return sanitized;
};

// Format log message
const formatLogMessage = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data: sanitizeLogData(data) }),
        pid: process.pid,
        hostname: process.env.HOSTNAME || 'localhost'
    };
    
    return JSON.stringify(logEntry);
};

// Write to log file
const writeToFile = (logMessage) => {
    const logFile = process.env.LOG_FILE_PATH || path.join(logsDir, 'app.log');
    const logLine = logMessage + '\n';
    
    fs.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

// Console output with colors
const consoleOutput = (level, message) => {
    const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[35m'  // Magenta
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[level]}[${level}]${reset} ${message}`);
};

// Logger functions
export const logger = {
    error: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.ERROR) {
            const logMessage = formatLogMessage('ERROR', message, data);
            writeToFile(logMessage);
            consoleOutput('ERROR', message);
        }
    },
    
    warn: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.WARN) {
            const logMessage = formatLogMessage('WARN', message, data);
            writeToFile(logMessage);
            consoleOutput('WARN', message);
        }
    },
    
    info: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            const logMessage = formatLogMessage('INFO', message, data);
            writeToFile(logMessage);
            consoleOutput('INFO', message);
        }
    },
    
    debug: (message, data = null) => {
        if (currentLogLevel >= LOG_LEVELS.DEBUG) {
            const logMessage = formatLogMessage('DEBUG', message, data);
            writeToFile(logMessage);
            consoleOutput('DEBUG', message);
        }
    }
};

// Express middleware for request logging
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length') || 0
        };
        
        if (res.statusCode >= 400) {
            logger.error(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
        } else {
            logger.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
        }
        
        return originalSend.call(this, data);
    };
    
    next();
};

export default logger;