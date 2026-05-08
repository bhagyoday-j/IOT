/**
 * AI Routes
 * AI prediction endpoints
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { validate, schemas } = require('../middleware/validation');
const { aiPredictionLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/multerConfig');

/**
 * POST /api/v1/ai/predict-disease
 * Predict plant disease based on sensor data and optional image
 * Body: temperature, humidity, moisture, ph, deviceId
 * File: image (optional)
 */
router.post(
  '/predict-disease',
  aiPredictionLimiter,
  upload.single('image'),
  validate(schemas.predictDisease),
  aiController.predictDisease
);

/**
 * POST /api/v1/ai/suggest-crop
 * Suggest crops based on environmental conditions
 * Body: temperature, humidity, moisture, ph, deviceId, location (optional)
 */
router.post(
  '/suggest-crop',
  aiPredictionLimiter,
  validate(schemas.suggestCrop),
  aiController.suggestCrop
);

/**
 * GET /api/v1/ai/predictions/:deviceId
 * Get prediction history for a device
 * Query params: type (disease|crop), limit
 */
router.get('/predictions/:deviceId', aiController.getPredictionHistory);

module.exports = router;
