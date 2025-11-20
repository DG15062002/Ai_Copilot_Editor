// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Environment configuration
const PORT = process.env.PORT || 5005;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 30000;
const MAX_REQUEST_SIZE = process.env.MAX_REQUEST_SIZE || '10mb';

// Logger utility
const logger = {
  log: (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      timestamp,
      level,
      message,
      ...data,
      env: NODE_ENV
    }));
  },
  info: (msg, data) => logger.log('INFO', msg, data),
  error: (msg, data) => logger.log('ERROR', msg, data),
  warn: (msg, data) => logger.log('WARN', msg, data),
  debug: (msg, data) => NODE_ENV === 'development' && logger.log('DEBUG', msg, data)
};

// Initialize Express app
const app = express();

// Middleware - Security & Compression
app.use(helmet());
app.use(compression());

// Middleware - Parsing & CORS
app.use(bodyParser.json({ limit: MAX_REQUEST_SIZE }));
app.use(bodyParser.urlencoded({ limit: MAX_REQUEST_SIZE, extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware - Request timeout
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT);
  res.setTimeout(REQUEST_TIMEOUT);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
});

// Health check endpoint for Docker/orchestration
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// Ready check endpoint (more detailed)
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Validation middleware
const validateTextInput = (req, res, next) => {
  const { text } = req.body;
  
  if (!text) {
    logger.warn('Missing text field', { path: req.path });
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Text field is required',
      timestamp: new Date().toISOString()
    });
  }
  
  if (typeof text !== 'string') {
    logger.warn('Invalid text type', { path: req.path, type: typeof text });
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Text must be a string',
      timestamp: new Date().toISOString()
    });
  }
  
  if (text.trim().length === 0) {
    logger.warn('Empty text provided', { path: req.path });
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Text cannot be empty',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// AI Routes with validation
app.post('/api/make-shorter', validateTextInput, (req, res) => {
  try {
    const { text } = req.body;
    const result = `Shorter version of: ${text}`;
    
    logger.info('Make-shorter request processed', {
      inputLength: text.length,
      outputLength: result.length
    });
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in make-shorter endpoint', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? error.message : 'An error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/make-longer', validateTextInput, (req, res) => {
  try {
    const { text } = req.body;
    const result = `Longer version of: ${text}`;
    
    logger.info('Make-longer request processed', {
      inputLength: text.length,
      outputLength: result.length
    });
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in make-longer endpoint', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? error.message : 'An error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use((req, res) => {
  logger.warn('Not found', { method: req.method, path: req.path });
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred',
    timestamp: new Date().toISOString()
  });
});

// Create server instance
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', {
    port: PORT,
    environment: NODE_ENV,
    url: `http://0.0.0.0:${PORT}`
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: String(reason),
    promise: String(promise)
  });
});
