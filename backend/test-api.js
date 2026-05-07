/**
 * Quick API Verification using built-in modules
 */

const https = require('https');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/sensors/latest/DEVICE_001',
  method: 'GET',
  headers: {
    'x-api-key': 'your-secret-api-key-for-esp32',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Sensor Latest Data Response:\n');
      console.log('Structure:');
      console.log(`  - success: ${response.success}`);
      console.log(`  - statusCode: ${response.statusCode}`);
      console.log(`  - data type: ${typeof response.data}`);
      console.log(`  - data keys: ${Object.keys(response.data).join(', ')}`);
      console.log('\nActual Data:');
      console.log(`  - Temperature: ${response.data.temperature?.toFixed(2)}°C`);
      console.log(`  - Humidity: ${response.data.humidity?.toFixed(1)}%`);
      console.log(`  - Moisture: ${response.data.moisture?.toFixed(1)}%`);
      console.log(`  - pH: ${response.data.ph?.toFixed(2)}`);
      console.log(`  - Timestamp: ${response.data.timestamp}`);
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.on('error', (e) => {
  // Try HTTP instead
  const http = require('http');
  const httpOptions = { ...options };
  const httpReq = http.request(httpOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Sensor Latest Data Response:\n');
        console.log('Structure:');
        console.log(`  - success: ${response.success}`);
        console.log(`  - statusCode: ${response.statusCode}`);
        console.log(`  - data type: ${typeof response.data}`);
        console.log(`  - data keys: ${Object.keys(response.data).join(', ')}`);
        console.log('\nActual Data:');
        console.log(`  - Temperature: ${response.data.temperature?.toFixed(2)}°C`);
        console.log(`  - Humidity: ${response.data.humidity?.toFixed(1)}%`);
        console.log(`  - Moisture: ${response.data.moisture?.toFixed(1)}%`);
        console.log(`  - pH: ${response.data.ph?.toFixed(2)}`);
        console.log(`  - Timestamp: ${response.data.timestamp}`);
      } catch (e) {
        console.error('Parse error:', e.message, '\nRaw response:', data);
      }
    });
  });
  httpReq.on('error', (e) => console.error('HTTP request error:', e.message));
  httpReq.end();
});

req.end();
