/**
 * Sensor Routes
 * IoT sensor data endpoints
 */

const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const { validate, validateQuery, schemas } = require('../middleware/validation');
const { sensorDataLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/v1/sensors/data
 * Submit sensor data from IoT device
 * Headers: x-api-key (required)
 */
router.post(
  '/data',
  sensorDataLimiter,
  validate(schemas.sensorData),
  sensorController.submitSensorData
);

/**
 * GET /api/v1/sensors/latest/:deviceId
 * Get latest sensor reading for a device
 */
router.get('/latest/:deviceId', sensorController.getLatestSensorData);

/**
 * GET /api/v1/sensors/history/:deviceId
 * Get sensor data history with optional date range
 * Query params: from (ISO date), to (ISO date), limit, skip
 */
router.get(
  '/history/:deviceId',
  validateQuery(schemas.queryDateRange),
  sensorController.getSensorHistory
);

/**
 * GET /api/v1/sensors/statistics/:deviceId
 * Get sensor data statistics
 * Query params: from (ISO date), to (ISO date)
 */
router.get('/statistics/:deviceId', sensorController.getSensorStatistics);

module.exports = router;
