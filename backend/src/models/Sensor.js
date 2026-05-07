/**
 * Sensor Model
 * Stores IoT sensor data from agricultural devices
 */

const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
      min: [-50, 'Temperature cannot be below -50°C'],
      max: [70, 'Temperature cannot exceed 70°C'],
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity is required'],
      min: [0, 'Humidity cannot be below 0%'],
      max: [100, 'Humidity cannot exceed 100%'],
    },
    moisture: {
      type: Number,
      required: [true, 'Moisture is required'],
      min: [0, 'Moisture cannot be below 0%'],
      max: [100, 'Moisture cannot exceed 100%'],
    },
    ph: {
      type: Number,
      required: [true, 'pH value is required'],
      min: [0, 'pH cannot be below 0'],
      max: [14, 'pH cannot exceed 14'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'sensors',
  }
);

// Index for efficient queries
sensorSchema.index({ deviceId: 1, timestamp: -1 });

const Sensor = mongoose.model('Sensor', sensorSchema);

module.exports = Sensor;
