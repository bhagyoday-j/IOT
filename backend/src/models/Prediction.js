/**
 * Prediction Model
 * Stores AI predictions (disease and crop recommendations)
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['disease', 'crop'],
      required: [true, 'Prediction type is required'],
      index: true,
    },
    inputData: {
      temperature: Number,
      humidity: Number,
      moisture: Number,
      ph: Number,
      location: String,
      imageUrl: String,
    },
    result: {
      prediction: String,
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      solution: String,
      recommendations: [String],
      metadata: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'predictions',
  }
);

// Index for efficient queries
predictionSchema.index({ deviceId: 1, createdAt: -1 });
predictionSchema.index({ type: 1, createdAt: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
