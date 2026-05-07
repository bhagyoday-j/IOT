/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per time window
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // 100 requests per window
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Sensor data submission rate limiter (more lenient for IoT devices)
const sensorDataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many sensor data submissions, please try again later.',
    timestamp: new Date().toISOString(),
  },
  keyGenerator: (req) => {
    // Use device ID from request body or params
    return req.body?.deviceId || req.params?.deviceId || req.ip;
  },
});

// AI prediction rate limiter (stricter)
const aiPredictionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    statusCode: 429,
    message: 'AI prediction limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

module.exports = {
  apiLimiter,
  sensorDataLimiter,
  aiPredictionLimiter,
};
