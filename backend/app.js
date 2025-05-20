import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/api.js';
import logger from './utils/logger.js';
import puppeteerService from './services/puppeteer.service.js';

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupProcessHandlers();
  }

  setupMiddlewares() {
    this.app.use(cors(config.cors));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', apiRoutes);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  setupProcessHandlers() {
    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      
      try {
        await puppeteerService.close();
        logger.info('Puppeteer service closed');
        
        if (this.server) {
          this.server.close(() => {
            logger.info('Server closed');
            process.exit(0);
          });
        }
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle process termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown();
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  async start() {
    try {
      // Initialize Puppeteer service
      await puppeteerService.init();
    } catch (error) {
      logger.error('Failed to initialize Puppeteer service:', error);
      process.exit(1);
    }
    // Start the server
    const port = config.server.port;
    this.server = this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
    return this.server;
  }
}

const appInstance = new App();
const app = appInstance.app;

export { app, appInstance as default };
