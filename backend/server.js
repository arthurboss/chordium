import app from './app.js';
import logger from './utils/logger.js';

let server;

// Start the server
const startServer = async () => {
  try {
    server = await app.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown function
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  if (server && server.close) {
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  } else {
    logger.info('No server to close.');
    process.exit(0);
  }
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));  // Ctrl+C
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));  // Terminal closed

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Start the application
startServer();
