/**
 * AI Controller
 * Handles AI prediction endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const AIService = require('../services/ai.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');

/**
 * POST /api/v1/ai/predict-disease
 * Predict plant disease based on sensor data and image
 */
const predictDisease = asyncHandler(async (req, res) => {
  const sensorData = req.validatedData;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await AIService.predictDisease(
    {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      moisture: sensorData.moisture,
      ph: sensorData.ph,
    },
    sensorData.deviceId,
    imageUrl
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    statusCode: HTTP_STATUS.CREATED,
    message: SUCCESS_MESSAGES.PREDICTION_GENERATED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/ai/suggest-crop
 * Suggest crops based on environmental conditions
 */
const suggestCrop = asyncHandler(async (req, res) => {
  const conditions = req.validatedData;

  const result = await AIService.suggestCrop(conditions);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    statusCode: HTTP_STATUS.CREATED,
    message: 'Crop recommendation generated successfully',
    data: result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/ai/predictions/:deviceId
 * Get prediction history for a device
 */
const getPredictionHistory = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { type, limit = 20 } = req.query || {};

  const result = await AIService.getPredictionHistory(deviceId, type, parseInt(limit));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  predictDisease,
  suggestCrop,
  getPredictionHistory,
};
