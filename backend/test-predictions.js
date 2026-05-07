/**
 * Test Prediction History API Response
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/history/predictions/DEVICE_001',
  method: 'GET',
  headers: {
    'x-api-key': 'your-secret-api-key-for-esp32',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Prediction History Response:\n');
      console.log('Top-level Structure:');
      console.log(`  - success: ${response.success}`);
      console.log(`  - statusCode: ${response.statusCode}`);
      console.log(`  - data keys: ${Object.keys(response.data).join(', ')}`);
      
      console.log('\nData.data Structure:');
      console.log(`  - predictions is array: ${Array.isArray(response.data.predictions)}`);
      console.log(`  - count: ${response.data.count}`);
      console.log(`  - limit: ${response.data.limit}`);
      
      if (response.data.predictions.length > 0) {
        const pred = response.data.predictions[0];
        console.log('\nFirst Prediction:');
        console.log(`  - _id: ${pred._id}`);
        console.log(`  - type: ${pred.type}`);
        console.log(`  - result keys: ${Object.keys(pred.result).join(', ')}`);
        console.log(`  - result.prediction: ${pred.result.prediction}`);
        console.log(`  - result.confidence: ${pred.result.confidence}`);
        console.log(`  - result.solution: ${pred.result.solution?.substring(0, 50)}...`);
        console.log(`  - createdAt: ${pred.createdAt}`);
      }
    } catch (e) {
      console.error('Parse error:', e.message, '\nRaw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.end();
