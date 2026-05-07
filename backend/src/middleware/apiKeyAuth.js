/**
 * API Key Authentication Middleware
 * Validates API key for ESP32 and external IoT devices
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // Skip auth for health check and documentation
  if (req.path === '/health' || req.path === '/api-docs') {
    return next();
  }

  if (!apiKey) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'API key is missing',
      timestamp: new Date().toISOString(),
    });
  }

  const validApiKey = process.env.API_KEY || 'your-secret-api-key-for-esp32';

  if (apiKey !== validApiKey) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      statusCode: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

module.exports = {
  apiKeyAuth,
};
