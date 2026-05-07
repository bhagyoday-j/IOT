/**
 * Sensor Service Layer
 * Contains business logic for sensor data management
 */

const Sensor = require('../models/Sensor');

class SensorService {
  /**
   * Save sensor data to database
   * @param {Object} sensorData - Sensor reading data
   * @returns {Promise<Object>} Saved sensor document
   */
  static async saveSensorData(sensorData) {
    try {
      const sensor = new Sensor(sensorData);
      await sensor.save();
      return sensor;
    } catch (error) {
      console.error('❌ Sensor save error:', error);
      throw new Error(`Failed to save sensor data: ${error.message}`);
    }
  }

  /**
   * Get latest sensor data for a device
   * @param {String} deviceId - IoT device ID
   * @returns {Promise<Object>} Latest sensor reading
   */
  static async getLatestSensorData(deviceId) {
    try {
      const sensor = await Sensor.findOne({ deviceId }).sort({ timestamp: -1 });

      if (!sensor) {
        throw new Error('No sensor data found for this device');
      }

      return sensor;
    } catch (error) {
      console.error('❌ Sensor fetch error:', error);
      throw new Error(`Failed to fetch sensor data: ${error.message}`);
    }
  }

  /**
   * Get sensor data history with date range
   * @param {String} deviceId - IoT device ID
   * @param {Date} startDate - Start date for range
   * @param {Date} endDate - End date for range
   * @param {Number} limit - Number of records to fetch
   * @param {Number} skip - Number of records to skip
   * @returns {Promise<Object>} Sensor history with count
   */
  static async getSensorHistory(deviceId, startDate = null, endDate = null, limit = 50, skip = 0) {
    try {
      const query = { deviceId };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const data = await Sensor.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      const count = await Sensor.countDocuments(query);

      return {
        data,
        count,
        limit,
        skip,
        total: count,
      };
    } catch (error) {
      console.error('❌ Sensor history fetch error:', error);
      throw new Error(`Failed to fetch sensor history: ${error.message}`);
    }
  }

  /**
   * Get sensor statistics for a device
   * @param {String} deviceId - IoT device ID
   * @param {Date} startDate - Start date for range
   * @param {Date} endDate - End date for range
   * @returns {Promise<Object>} Sensor statistics
   */
  static async getSensorStatistics(deviceId, startDate = null, endDate = null) {
    try {
      const query = { deviceId };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const stats = await Sensor.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$deviceId',
            avgTemperature: { $avg: '$temperature' },
            avgHumidity: { $avg: '$humidity' },
            avgMoisture: { $avg: '$moisture' },
            avgPh: { $avg: '$ph' },
            maxTemperature: { $max: '$temperature' },
            minTemperature: { $min: '$temperature' },
            maxHumidity: { $max: '$humidity' },
            minHumidity: { $min: '$humidity' },
            maxMoisture: { $max: '$moisture' },
            minMoisture: { $min: '$moisture' },
            maxPh: { $max: '$ph' },
            minPh: { $min: '$ph' },
            readingCount: { $sum: 1 },
          },
        },
      ]);

      if (stats.length === 0) {
        throw new Error('No sensor data found for statistics');
      }

      return stats[0];
    } catch (error) {
      console.error('❌ Statistics error:', error);
      throw new Error(`Failed to calculate statistics: ${error.message}`);
    }
  }

  /**
   * Delete old sensor data
   * @param {Date} beforeDate - Delete records before this date
   * @returns {Promise<Object>} Delete result
   */
  static async deleteOldData(beforeDate) {
    try {
      const result = await Sensor.deleteMany({
        timestamp: { $lt: new Date(beforeDate) },
      });

      return result;
    } catch (error) {
      console.error('❌ Delete error:', error);
      throw new Error(`Failed to delete old data: ${error.message}`);
    }
  }
}

module.exports = SensorService;
