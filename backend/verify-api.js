/**
 * Verify Backend API Responses
 * Check that API is returning correct data structure
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const API_KEY = 'your-secret-api-key-for-esp32';
const DEVICE_ID = 'DEVICE_001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

async function verifyAPI() {
  try {
    console.log('🔍 Verifying API responses...\n');

    // 1. Check latest sensor data
    console.log('1️⃣  Checking /sensors/latest/:deviceId');
    const latestRes = await api.get(`/sensors/latest/${DEVICE_ID}`);
    console.log('✅ Response structure:');
    console.log(`   - success: ${latestRes.data.success}`);
    console.log(`   - statusCode: ${latestRes.data.statusCode}`);
    console.log(`   - data keys: ${Object.keys(latestRes.data.data).join(', ')}`);
    console.log(`   - Sample data:`, {
      temperature: latestRes.data.data.temperature?.toFixed(2),
      humidity: latestRes.data.data.humidity?.toFixed(1),
      moisture: latestRes.data.data.moisture?.toFixed(1),
      ph: latestRes.data.data.ph?.toFixed(2),
    });
    console.log('');

    // 2. Check sensor history
    console.log('2️⃣  Checking /sensors/history/:deviceId');
    const historyRes = await api.get(`/sensors/history/${DEVICE_ID}?hours=24`);
    console.log('✅ Response structure:');
    console.log(`   - success: ${historyRes.data.success}`);
    console.log(`   - data.data is array: ${Array.isArray(historyRes.data.data.data)}`);
    console.log(`   - data.count: ${historyRes.data.data.count}`);
    console.log(`   - First record keys: ${Object.keys(historyRes.data.data.data[0]).join(', ')}`);
    console.log('');

    // 3. Check prediction history
    console.log('3️⃣  Checking /history/predictions/:deviceId');
    const predictionRes = await api.get(`/history/predictions/${DEVICE_ID}`);
    console.log('✅ Response structure:');
    console.log(`   - success: ${predictionRes.data.success}`);
    console.log(`   - data.predictions is array: ${Array.isArray(predictionRes.data.data.predictions)}`);
    console.log(`   - data.count: ${predictionRes.data.data.count}`);
    if (predictionRes.data.data.predictions.length > 0) {
      const pred = predictionRes.data.data.predictions[0];
      console.log(`   - First prediction:`, {
        type: pred.type,
        result_keys: Object.keys(pred.result).join(', '),
        prediction: pred.result?.prediction,
        confidence: pred.result?.confidence,
        solution: pred.result?.solution?.substring(0, 50) + '...',
      });
    }
    console.log('');

    console.log('✨ All API endpoints verified!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

verifyAPI();
