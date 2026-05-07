/**
 * History Routes
 * Prediction history and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

/**
 * GET /api/v1/history/predictions/:deviceId
 * Get all predictions for a device
 * Query params: type (disease|crop), limit, skip, sortBy
 */
router.get('/predictions/:deviceId', historyController.getPredictionsByDevice);

/**
 * GET /api/v1/history/predictions/:deviceId/:predictionId
 * Get specific prediction details
 */
router.get(
  '/predictions/:deviceId/:predictionId',
  historyController.getPredictionById
);

/**
 * GET /api/v1/history/summary/:deviceId
 * Get prediction summary and statistics
 * Query params: days (default: 30)
 */
router.get('/summary/:deviceId', historyController.getPredictionSummary);

/**
 * DELETE /api/v1/history/predictions/:deviceId/:predictionId
 * Delete a specific prediction
 */
router.delete(
  '/predictions/:deviceId/:predictionId',
  historyController.deletePrediction
);

module.exports = router;
