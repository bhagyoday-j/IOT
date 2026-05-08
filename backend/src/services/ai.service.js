/**
 * AI Service Layer
 * Contains business logic for AI predictions using OpenRouter API
 */

const Prediction = require('../models/Prediction');
const openRouterClient = require('./openrouter.client');

class AIService {
  /**
   * Predict disease based on sensor data and image
   * @param {Object} sensorData - Temperature, humidity, moisture, pH
   * @param {String} deviceId - IoT device ID
   * @param {String} imageUrl - Path to uploaded image
   * @param {String} plantDescription - Optional plant description from image
   * @returns {Promise<Object>} Prediction result
   */
  static async predictDisease(sensorData, deviceId, imageUrl = null, plantDescription = null) {
    try {
      console.log(`🔍 Analyzing disease for device ${deviceId}...`);

      // Use OpenRouter API for AI-powered disease analysis
      const diseaseAnalysis = await openRouterClient.analyzePlantDisease(
        sensorData,
        deviceId,
        plantDescription
      );

      const { disease, confidence, solution, recommendations } = diseaseAnalysis;

      // Save prediction to database
      const prediction = new Prediction({
        deviceId,
        type: 'disease',
        inputData: {
          ...sensorData,
          imageUrl,
          plantDescription,
        },
        result: {
          prediction: disease,
          confidence,
          solution,
          recommendations,
          metadata: {
            model: 'openrouter-gpt-3.5-turbo',
            source: 'openrouter',
            timestamp: new Date(),
          },
        },
      });

      await prediction.save();

      return {
        disease,
        confidence,
        solution,
        recommendations,
        predictionId: prediction._id,
      };
    } catch (error) {
      console.error('❌ Disease prediction error:', error);
      throw new Error(`Disease prediction failed: ${error.message}`);
    }
  }

  /**
   * Suggest crops based on environmental conditions using OpenRouter AI
   * @param {Object} conditions - Temperature, humidity, moisture, pH, location, deviceId
   * @returns {Promise<Object>} Crop recommendations
   */
  static async suggestCrop(conditions) {
    try {
      const { deviceId = 'unknown' } = conditions;
      console.log(`🌾 Generating crop recommendations for device ${deviceId}...`);

      // Use OpenRouter API for AI-powered crop recommendations
      const cropRecommendations = await openRouterClient.recommendCrops(conditions);

      const { crops, topCrop, generalAdvice } = cropRecommendations;

      // Format recommendations for response
      const recommendations = crops.slice(0, 5).map((c) => `${c.name} (${c.suitability})`);

      // Save recommendation to database
      const prediction = new Prediction({
        deviceId,
        type: 'crop',
        inputData: conditions,
        result: {
          prediction: crops.map((c) => c.name).join(', '),
          confidence: Math.round(crops.reduce((sum, c) => sum + c.confidence, 0) / crops.length),
          solution: generalAdvice || 'Plant recommended crops based on your environmental conditions',
          recommendations,
          metadata: {
            model: 'openrouter-gpt-3.5-turbo',
            source: 'openrouter',
            crops: crops.slice(0, 5),
            timestamp: new Date(),
          },
        },
      });

      await prediction.save();

      return {
        recommendations: crops.slice(0, 5),
        topCrop,
        generalAdvice,
        predictionId: prediction._id,
      };
    } catch (error) {
      console.error('❌ Crop suggestion error:', error);
      throw new Error(`Crop suggestion failed: ${error.message}`);
    }
  }

  /**
   * Get farming advice based on sensor data and crop type
   * @param {Object} sensorData - Current sensor readings
   * @param {String} cropType - Type of crop being grown
   * @param {String} deviceId - IoT device ID
   * @returns {Promise<Object>} Detailed farming advice
   */
  static async getFarmingAdvice(sensorData, cropType, deviceId) {
    try {
      console.log(`🌱 Generating farming advice for ${cropType} on device ${deviceId}...`);

      // Use OpenRouter API for farming advice
      const advice = await openRouterClient.getFarmingAdvice(sensorData, cropType);

      // Save advice to database as a prediction
      const prediction = new Prediction({
        deviceId,
        type: 'advice',
        inputData: {
          ...sensorData,
          cropType,
        },
        result: {
          prediction: cropType,
          confidence: 85,
          solution: advice.yieldImpact || 'Farming advice generated',
          recommendations: advice.immediateActions || [],
          metadata: {
            model: 'openrouter-gpt-3.5-turbo',
            source: 'openrouter',
            advice,
            timestamp: new Date(),
          },
        },
      });

      await prediction.save();

      return {
        cropType,
        advice,
        predictionId: prediction._id,
      };
    } catch (error) {
      console.error('❌ Farming advice error:', error);
      throw new Error(`Farming advice failed: ${error.message}`);
    }
  }

  /**
   * Check OpenRouter API health
   * @returns {Promise<Boolean>} True if API is healthy
   */
  static async healthCheck() {
    try {
      return await openRouterClient.healthCheck();
    } catch (error) {
      console.error('❌ Health check error:', error);
      return false;
    }
  }

  /**
   * Get prediction history for a device
   * @param {String} deviceId - IoT device ID
   * @param {String} type - 'disease', 'crop', or 'advice'
   * @param {Number} limit - Number of records to fetch
   * @returns {Promise<Array>} Prediction history
   */
  static async getPredictionHistory(deviceId, type = null, limit = 20) {
    try {
      const query = { deviceId };
      if (type) query.type = type;

      const predictions = await Prediction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      return predictions;
    } catch (error) {
      console.error('❌ Prediction history fetch error:', error);
      throw new Error(`Failed to fetch prediction history: ${error.message}`);
    }
  }
}

module.exports = AIService;
