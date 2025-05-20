import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Send JSON response
  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `Cannot ${req.method} ${req.path}`
    }
  });
};

export { errorHandler, notFoundHandler };
