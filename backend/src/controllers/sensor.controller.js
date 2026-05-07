/**
 * Sensor Controller
 * Handles sensor data endpoints
 */

const { asyncHandler } = require('../middleware/errorHandler');
const SensorService = require('../services/sensor.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constants');

/**
 * POST /api/v1/sensors/data
 * Submit sensor data from IoT device
 */
const submitSensorData = asyncHandler(async (req, res) => {
  const sensorData = req.validatedData;

  const result = await SensorService.saveSensorData(sensorData);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    statusCode: HTTP_STATUS.CREATED,
    message: SUCCESS_MESSAGES.DATA_SAVED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/sensors/latest/:deviceId
 * Get latest sensor reading for a device
 */
const getLatestSensorData = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const result = await SensorService.getLatestSensorData(deviceId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/sensors/history/:deviceId
 * Get sensor data history with optional date range
 */
const getSensorHistory = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { from, to, limit = 50, skip = 0 } = req.validatedQuery || {};

  const result = await SensorService.getSensorHistory(
    deviceId,
    from,
    to,
    parseInt(limit),
    parseInt(skip)
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: SUCCESS_MESSAGES.DATA_FETCHED,
    data: result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/sensors/statistics/:deviceId
 * Get sensor data statistics for analysis
 */
const getSensorStatistics = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { from, to } = req.query || {};

  const result = await SensorService.getSensorStatistics(deviceId, from, to);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    message: 'Statistics calculated successfully',
    data: result,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  submitSensorData,
  getLatestSensorData,
  getSensorHistory,
  getSensorStatistics,
};
