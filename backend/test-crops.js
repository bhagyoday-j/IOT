/**
 * Test Crop Suggestion API Response
 */

const http = require('http');

const payload = JSON.stringify({
  temperature: 24.82,
  humidity: 59.4,
  moisture: 56.3,
  ph: 7.67,
  location: 'Test Location'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/ai/suggest-crop',
  method: 'POST',
  headers: {
    'x-api-key': 'your-secret-api-key-for-esp32',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Crop Suggestion Response:\n');
      console.log('Top-level Structure:');
      console.log(`  - success: ${response.success}`);
      console.log(`  - statusCode: ${response.statusCode}`);
      console.log(`  - data keys: ${Object.keys(response.data).join(', ')}`);
      
      console.log('\nData Structure:');
      console.log(`  - data type: ${typeof response.data}`);
      if (response.data.crops) {
        console.log(`  - data.crops is array: ${Array.isArray(response.data.crops)}`);
        if (response.data.crops.length > 0) {
          console.log(`\nFirst Crop:`, response.data.crops[0]);
        }
      } else {
        console.log(`  - data keys: ${Object.keys(response.data).join(', ')}`);
      }
    } catch (e) {
      console.error('Parse error:', e.message, '\nRaw response:', data.substring(0, 300));
    }
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(payload);
req.end();
