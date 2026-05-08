/**
 * Request Validation Middleware
 * Validates incoming requests using Joi
 */

const Joi = require('joi');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

// Validation schemas
const schemas = {
  sensorData: Joi.object({
    deviceId: Joi.string().trim().required(),
    temperature: Joi.number().min(-50).max(70).required(),
    humidity: Joi.number().min(0).max(100).required(),
    moisture: Joi.number().min(0).max(100).required(),
    ph: Joi.number().min(0).max(14).required(),
    timestamp: Joi.date().optional(),
  }),

  predictDisease: Joi.object({
    temperature: Joi.number().min(-50).max(70).required(),
    humidity: Joi.number().min(0).max(100).required(),
    moisture: Joi.number().min(0).max(100).required(),
    ph: Joi.number().min(0).max(14).required(),
    deviceId: Joi.string().trim().required(),
  }),

  suggestCrop: Joi.object({
    temperature: Joi.number().min(-50).max(70).required(),
    humidity: Joi.number().min(0).max(100).required(),
    moisture: Joi.number().min(0).max(100).required(),
    ph: Joi.number().min(0).max(14).required(),
    location: Joi.string().trim().optional(),
    deviceId: Joi.string().trim().required(),
  }),

  queryDateRange: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    limit: Joi.number().integer().min(1).max(1000).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }),
};

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: ERROR_MESSAGES.INVALID_REQUEST,
      details: error.details.map((d) => d.message),
      timestamp: new Date().toISOString(),
    });
  }

  req.validatedData = value;
  next();
};

// Query validation middleware
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    stripUnknown: true,
  });

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: ERROR_MESSAGES.INVALID_REQUEST,
      details: error.details.map((d) => d.message),
      timestamp: new Date().toISOString(),
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  validate,
  validateQuery,
  schemas,
};
