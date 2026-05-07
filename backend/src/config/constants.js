/**
 * Application Constants
 * Centralized configuration constants
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const PREDICTION_TYPES = {
  DISEASE: 'disease',
  CROP: 'crop',
};

const ERROR_MESSAGES = {
  INVALID_REQUEST: 'Invalid request data',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_FILE: 'Invalid file format',
  DUPLICATE_ENTRY: 'Duplicate entry found',
};

const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully',
  DATA_FETCHED: 'Data fetched successfully',
  PREDICTION_GENERATED: 'Prediction generated successfully',
  DATA_DELETED: 'Data deleted successfully',
};

module.exports = {
  HTTP_STATUS,
  PREDICTION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
