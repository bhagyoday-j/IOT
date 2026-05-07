/**
 * Logging Middleware
 * Logs HTTP requests and responses
 */

const morgan = require('morgan');

// Custom morgan format
const morganFormat = ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Request logging
const requestLogger = morgan(morganFormat, {
  skip: (req, res) => {
    return req.path === '/health';
  },
});

// Custom request/response logging
const customLogger = (req, res, next) => {
  const startTime = Date.now();

  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    console.log(`📨 [${req.method}] ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  requestLogger,
  customLogger,
};
