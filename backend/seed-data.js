/**
 * Seed Database with Sample Sensor Data
 * Run: node seed-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Sensor = require('./src/models/Sensor');
const Prediction = require('./src/models/Prediction');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agriculture';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Seeding database with sample data...\n');

    // Clear existing data
    await Sensor.deleteMany({});
    await Prediction.deleteMany({});
    console.log('✅ Cleared existing collections');

    // Generate sample sensor data for the last 24 hours
    const sensorData = [];
    const now = new Date();
    const deviceId = 'DEVICE_001';

    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      sensorData.push({
        deviceId,
        temperature: 22 + Math.random() * 8, // 22-30°C
        humidity: 45 + Math.random() * 35, // 45-80%
        moisture: 30 + Math.random() * 40, // 30-70%
        ph: 6.0 + Math.random() * 2.0, // 6.0-8.0
        lightIntensity: 300 + Math.random() * 700, // 300-1000 lux
        timestamp,
      });
    }

    const insertedSensors = await Sensor.insertMany(sensorData);
    console.log(`✅ Inserted ${insertedSensors.length} sensor records`);

    // Generate sample predictions
    const predictions = [
      {
        deviceId,
        type: 'disease',
        result: {
          prediction: 'Leaf Spot',
          confidence: 87,
          solution: 'Apply fungicide and improve air circulation',
          recommendations: ['Remove infected leaves', 'Reduce humidity', 'Apply copper-based fungicide'],
        },
      },
      {
        deviceId,
        type: 'crop',
        result: {
          prediction: 'Tomato',
          confidence: 92,
          solution: 'Optimal conditions for tomato cultivation',
          recommendations: ['Current conditions are ideal', 'Maintain temperature 22-28°C', 'Water consistently'],
        },
      },
    ];

    const insertedPredictions = await Prediction.insertMany(predictions);
    console.log(`✅ Inserted ${insertedPredictions.length} prediction records\n`);

    console.log('📊 Sample Data Summary:');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Sensor Records: ${insertedSensors.length}`);
    console.log(`   Prediction Records: ${insertedPredictions.length}`);
    console.log('\n✨ Database seeding completed!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
