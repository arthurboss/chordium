import app from './app.js';
import logger from './utils/logger.js';

// Start the server
const startServer = async () => {
  try {
    await app.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
startServer();
