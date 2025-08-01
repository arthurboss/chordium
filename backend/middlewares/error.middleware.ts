import logger from '../utils/logger.js';
import type { ErrorHandler, NotFoundHandler } from '../types/express.types.js';

const errorHandler: ErrorHandler = (err, req, res, next) => {
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

const notFoundHandler: NotFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `Cannot ${req.method} ${req.path}`
    }
  });
};

export { errorHandler, notFoundHandler };
