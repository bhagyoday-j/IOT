/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Middleware imports
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const { apiKeyAuth } = require('./middleware/apiKeyAuth');
const { requestLogger, customLogger } = require('./middleware/logging');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes imports
const sensorRoutes = require('./routes/sensor.routes');
const aiRoutes = require('./routes/ai.routes');
const historyRoutes = require('./routes/history.routes');

// Initialize Express app
const app = express();

// ============================================
// SECURITY & TRUST PROXY MIDDLEWARE
// ============================================
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// ============================================
// REQUEST PARSING MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// LOGGING MIDDLEWARE
// ============================================
app.use(requestLogger);
app.use(customLogger);

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
}));

// ============================================
// API VERSION & DOCUMENTATION
// ============================================
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Smart Agriculture API - v1.0.0',
    version: 'v1',
    endpoints: {
      sensors: '/api/v1/sensors',
      ai: '/api/v1/ai',
      history: '/api/v1/history',
    },
    documentation: {
      sensors: {
        'POST /api/v1/sensors/data': 'Submit sensor data',
        'GET /api/v1/sensors/latest/:deviceId': 'Get latest sensor data',
        'GET /api/v1/sensors/history/:deviceId': 'Get sensor history',
        'GET /api/v1/sensors/statistics/:deviceId': 'Get sensor statistics',
      },
      ai: {
        'POST /api/v1/ai/predict-disease': 'Predict disease from sensor data + image',
        'POST /api/v1/ai/suggest-crop': 'Get crop recommendations',
        'GET /api/v1/ai/predictions/:deviceId': 'Get prediction history',
      },
      history: {
        'GET /api/v1/history/predictions/:deviceId': 'Get all predictions',
        'GET /api/v1/history/summary/:deviceId': 'Get prediction summary',
        'DELETE /api/v1/history/predictions/:deviceId/:predictionId': 'Delete prediction',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// RATE LIMITING
// ============================================
app.use('/api/', apiLimiter);

// ============================================
// API KEY AUTHENTICATION
// ============================================
app.use('/api/', apiKeyAuth);

// ============================================
// API ROUTES
// ============================================
const API_VERSION = process.env.API_VERSION || 'v1';
const basePath = `/api/${API_VERSION}`;

app.use(`${basePath}/sensors`, sensorRoutes);
app.use(`${basePath}/ai`, aiRoutes);
app.use(`${basePath}/history`, historyRoutes);

// ============================================
// 404 NOT FOUND
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

module.exports = app;
