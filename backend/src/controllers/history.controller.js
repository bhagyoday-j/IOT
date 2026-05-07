/**
 * History Controller
 * Handles prediction history endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const Prediction = require('../models/Prediction');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');

/**
 * GET /api/v1/history/predictions/:deviceId
 * Get all predictions for a device
 */
const getPredictionsByDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { type, limit = 50, skip = 0, sortBy = 'createdAt' } = req.query || {};

  const query = { deviceId };
  if (type) query.type = type;

  const predictions = await Prediction.find(query)
    .sort({ [sortBy]: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const count = await Prediction.countDocuments(query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: {
      predictions,
      count,
      limit: parseInt(limit),
      skip: parseInt(skip),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/history/predictions/:deviceId/:predictionId
 * Get specific prediction details
 */
const getPredictionById = asyncHandler(async (req, res) => {
  const { deviceId, predictionId } = req.params;

  const prediction = await Prediction.findOne({
    _id: predictionId,
    deviceId,
  });

  if (!prediction) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      statusCode: HTTP_STATUS.NOT_FOUND,
      message: 'Prediction not found',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: prediction,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/history/summary/:deviceId
 * Get summary statistics of predictions
 */
const getPredictionSummary = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { days = 30 } = req.query || {};

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const summary = await Prediction.aggregate([
    {
      $match: {
        deviceId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$result.confidence' },
      },
    },
  ]);

  const totalPredictions = await Prediction.countDocuments({
    deviceId,
    createdAt: { $gte: startDate },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: {
      period: `${days} days`,
      totalPredictions,
      summary,
      fromDate: startDate,
      toDate: new Date(),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * DELETE /api/v1/history/predictions/:deviceId/:predictionId
 * Delete a specific prediction
 */
const deletePrediction = asyncHandler(async (req, res) => {
  const { deviceId, predictionId } = req.params;

  const result = await Prediction.findOneAndDelete({
    _id: predictionId,
    deviceId,
  });

  if (!result) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      statusCode: HTTP_STATUS.NOT_FOUND,
      message: 'Prediction not found',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_DELETED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getPredictionsByDevice,
  getPredictionById,
  getPredictionSummary,
  deletePrediction,
};
