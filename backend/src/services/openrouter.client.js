/**
 * OpenRouter AI Client
 * Integrates with OpenRouter API for AI model access
 * Supports multiple models via unified interface
 */

const axios = require('axios');

class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.siteUrl = process.env.SITE_URL || 'http://localhost:5000';
    this.siteName = 'Smart Agriculture IoT';

    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not set in environment variables');
    }
  }

  /**
   * Call OpenRouter API with specified model
   * @param {String} model - Model name (e.g., 'openai/gpt-3.5-turbo')
   * @param {Array} messages - Message history in OpenAI format
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<String>} API response content
   */
  async callModel(model, messages, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const payload = {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
        ...options,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Invalid response from OpenRouter API');
    } catch (error) {
      console.error('❌ OpenRouter API Error:', error.message);
      throw new Error(`OpenRouter API call failed: ${error.message}`);
    }
  }

  /**
   * Analyze plant disease from sensor data and optional image description
   * @param {Object} sensorData - Temperature, humidity, moisture, pH
   * @param {String} deviceId - IoT device ID
   * @param {String} plantDescription - Optional image or plant description
   * @returns {Promise<Object>} Disease analysis with recommendations
   */
  async analyzePlantDisease(sensorData, deviceId, plantDescription = null) {
    try {
      const { temperature, humidity, moisture, ph } = sensorData;

      const prompt = `
You are an expert agricultural disease detection AI. Analyze the following environmental conditions and plant status:

Environmental Data:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Soil Moisture: ${moisture}%
- Soil pH: ${ph}

${plantDescription ? `Plant Description/Image Analysis:\n${plantDescription}\n` : ''}

Based on these conditions, provide:
1. Most likely disease/condition (if any)
2. Confidence level (0-100%)
3. Treatment solution
4. 3-4 specific recommendations

Respond in JSON format only:
{
  "disease": "disease name",
  "confidence": 85,
  "solution": "treatment steps",
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

      const response = await this.callModel(
        'openai/gpt-3.5-turbo',
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 500,
        }
      );

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ Disease analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate crop recommendations based on environmental conditions
   * @param {Object} conditions - Temperature, humidity, moisture, pH, location
   * @returns {Promise<Object>} Crop recommendations with details
   */
  async recommendCrops(conditions) {
    try {
      const { temperature, humidity, moisture, ph, location = 'Unknown' } = conditions;

      const prompt = `
You are an expert agricultural consultant. Based on these environmental conditions, recommend suitable crops:

Environmental Conditions:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Soil Moisture: ${moisture}%
- Soil pH: ${ph}
- Location: ${location}

Provide 5 crop recommendations ranked by suitability.

Respond in JSON format only:
{
  "crops": [
    {
      "name": "crop name",
      "suitability": "High/Medium/Low",
      "confidence": 90,
      "reason": "why this crop suits these conditions",
      "growthPeriod": "XX days",
      "waterNeeds": "Low/Medium/High"
    }
  ],
  "topCrop": "best crop for these conditions",
  "generalAdvice": "overall farming advice"
}`;

      const response = await this.callModel(
        'openai/gpt-3.5-turbo',
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          temperature: 0.4,
          max_tokens: 800,
        }
      );

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ Crop recommendation error:', error);
      throw error;
    }
  }

  /**
   * Get detailed farming advice for current conditions
   * @param {Object} sensorData - Current sensor readings
   * @param {String} cropType - Type of crop being grown
   * @returns {Promise<Object>} Detailed farming advice
   */
  async getFarmingAdvice(sensorData, cropType) {
    try {
      const { temperature, humidity, moisture, ph } = sensorData;

      const prompt = `
You are an expert farmer advisor. Provide detailed advice for growing ${cropType} given these current conditions:

Current Conditions:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Soil Moisture: ${moisture}%
- Soil pH: ${ph}

Provide advice in the following areas:
1. Immediate actions needed (if any)
2. Watering schedule recommendation
3. Fertilization needs
4. Pest/disease prevention
5. Expected yield impact

Respond in JSON format:
{
  "immediateActions": ["action1", "action2"],
  "wateringAdvice": "recommendation",
  "fertilization": "recommendation",
  "pestPrevention": "recommendations",
  "yieldImpact": "positive/neutral/negative - reason"
}`;

      const response = await this.callModel(
        'openai/gpt-3.5-turbo',
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          temperature: 0.5,
          max_tokens: 600,
        }
      );

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ Farming advice error:', error);
      throw error;
    }
  }

  /**
   * Get available models from OpenRouter
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch models:', error.message);
      return [];
    }
  }

  /**
   * Check API health and verify key is valid
   * @returns {Promise<Boolean>} True if API is accessible
   */
  async healthCheck() {
    try {
      const response = await this.callModel(
        'openai/gpt-3.5-turbo',
        [
          {
            role: 'user',
            content: 'Say "ok" only',
          },
        ],
        {
          max_tokens: 10,
          temperature: 0,
        }
      );

      return response && response.length > 0;
    } catch (error) {
      console.error('❌ OpenRouter health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new OpenRouterClient();
