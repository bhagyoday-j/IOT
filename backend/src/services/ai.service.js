/**
 * AI Service Layer
 * Contains business logic for AI predictions
 */

const Prediction = require('../models/Prediction');

class AIService {
  /**
   * Predict disease based on sensor data and image
   * @param {Object} sensorData - Temperature, humidity, moisture, pH
   * @param {String} deviceId - IoT device ID
   * @param {String} imageUrl - Path to uploaded image
   * @returns {Promise<Object>} Prediction result
   */
  static async predictDisease(sensorData, deviceId, imageUrl = null) {
    try {
      // Simulate AI model prediction
      // In production, integrate with TensorFlow.js, PyTorch API, or cloud service

      const { temperature, humidity, moisture, ph } = sensorData;

      // Mock disease detection logic
      let disease = 'Healthy';
      let confidence = 95;
      let solution = 'Continue regular maintenance';
      let recommendations = ['Monitor plant health daily', 'Maintain watering schedule'];

      // Simulate disease conditions based on sensor values
      if (humidity > 85 && moisture > 75) {
        disease = 'Powdery Mildew';
        confidence = 87;
        solution = 'Apply fungicide and reduce humidity';
        recommendations = [
          'Improve air circulation',
          'Reduce watering frequency',
          'Apply sulfur-based fungicide',
        ];
      } else if (temperature > 30 && humidity < 40) {
        disease = 'Spider Mites';
        confidence = 82;
        solution = 'Spray water and use miticide';
        recommendations = [
          'Increase humidity levels',
          'Apply neem oil',
          'Remove affected leaves',
        ];
      } else if (ph < 5 && moisture > 80) {
        disease = 'Root Rot';
        confidence = 85;
        solution = 'Improve drainage and adjust pH';
        recommendations = [
          'Improve soil drainage',
          'Reduce watering',
          'Apply fungicide to roots',
          'Raise soil pH',
        ];
      }

      // Save prediction to database
      const prediction = new Prediction({
        deviceId,
        type: 'disease',
        inputData: {
          ...sensorData,
          imageUrl,
        },
        result: {
          prediction: disease,
          confidence,
          solution,
          recommendations,
          metadata: {
            model: 'mock-disease-detection-v1',
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
   * Suggest crops based on environmental conditions
   * @param {Object} conditions - Temperature, humidity, moisture, pH, location
   * @returns {Promise<Object>} Crop recommendations
   */
  static async suggestCrop(conditions) {
    try {
      const { temperature, humidity, moisture, ph, location, deviceId } = conditions;

      // Mock crop recommendation logic
      const recommendedCrops = [];

      // Temperature-based recommendations
      if (temperature >= 20 && temperature <= 30) {
        recommendedCrops.push({
          crop: 'Tomato',
          suitability: 'High',
          confidence: 90,
          reason: 'Optimal temperature range',
        });
        recommendedCrops.push({
          crop: 'Cucumber',
          suitability: 'High',
          confidence: 88,
          reason: 'Warm weather crop',
        });
      } else if (temperature < 20) {
        recommendedCrops.push({
          crop: 'Broccoli',
          suitability: 'High',
          confidence: 92,
          reason: 'Cool weather crop',
        });
        recommendedCrops.push({
          crop: 'Lettuce',
          suitability: 'High',
          confidence: 90,
          reason: 'Prefers cooler temperatures',
        });
      } else if (temperature > 30) {
        recommendedCrops.push({
          crop: 'Sweet Potato',
          suitability: 'High',
          confidence: 89,
          reason: 'Thrives in hot climate',
        });
        recommendedCrops.push({
          crop: 'Okra',
          suitability: 'High',
          confidence: 87,
          reason: 'Heat-tolerant crop',
        });
      }

      // pH-based refinements
      if (ph >= 6 && ph <= 7.5) {
        recommendedCrops.push({
          crop: 'Wheat',
          suitability: 'High',
          confidence: 85,
          reason: 'Optimal pH range',
        });
      } else if (ph < 6) {
        recommendedCrops.push({
          crop: 'Potato',
          suitability: 'High',
          confidence: 83,
          reason: 'Tolerates acidic soil',
        });
      }

      // Remove duplicates and sort by confidence
      const uniqueCrops = Array.from(
        new Map(recommendedCrops.map((c) => [c.crop, c])).values()
      ).sort((a, b) => b.confidence - a.confidence);

      // Save recommendation to database
      const prediction = new Prediction({
        deviceId: deviceId || 'unknown',
        type: 'crop',
        inputData: conditions,
        result: {
          prediction: uniqueCrops.map((c) => c.crop).join(', '),
          confidence: Math.round(
            uniqueCrops.reduce((sum, c) => sum + c.confidence, 0) / uniqueCrops.length
          ),
          solution: 'Plant recommended crops based on your environmental conditions',
          recommendations: uniqueCrops.slice(0, 5).map((c) => `${c.crop} (${c.suitability})`),
          metadata: {
            model: 'mock-crop-recommendation-v1',
            crops: uniqueCrops,
            timestamp: new Date(),
          },
        },
      });

      await prediction.save();

      return {
        recommendations: uniqueCrops.slice(0, 5),
        topCrop: uniqueCrops[0],
        predictionId: prediction._id,
      };
    } catch (error) {
      console.error('❌ Crop suggestion error:', error);
      throw new Error(`Crop suggestion failed: ${error.message}`);
    }
  }

  /**
   * Get prediction history for a device
   * @param {String} deviceId - IoT device ID
   * @param {String} type - 'disease' or 'crop'
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
