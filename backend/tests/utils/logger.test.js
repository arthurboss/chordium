import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import logger from '../../utils/logger.js';

describe('Logger Utils', () => {
  let consoleSpy;
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    // Create spies for all console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    // Restore all spies
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('info method', () => {
    it('should log info messages with [INFO] prefix', () => {
      const message = 'Test info message';
      const args = ['arg1', 'arg2'];

      logger.info(message, ...args);

      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test info message', 'arg1', 'arg2');
    });

    it('should handle empty strings', () => {
      logger.info('');
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] ');
    });

    it('should handle Unicode characters', () => {
      const unicodeMessage = 'Test with emojis 🎵🎸 and special chars ñáéíóú';
      logger.info(unicodeMessage);
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${unicodeMessage}`);
    });

    it('should handle punctuation-heavy text', () => {
      const punctuationMessage = '!@#$%^&*()_+-=[]{}|;:",./<>?';
      logger.info(punctuationMessage);
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${punctuationMessage}`);
    });

    it('should handle objects and arrays as additional arguments', () => {
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      logger.info('Message with objects', obj, arr);
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Message with objects', obj, arr);
    });

    it('should handle null and undefined arguments', () => {
      logger.info('Message', null, undefined);
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Message', null, undefined);
    });
  });

  describe('error method', () => {
    it('should log error messages with [ERROR] prefix', () => {
      const message = 'Test error message';
      const error = new Error('Sample error');

      logger.error(message, error);

      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Test error message', error);
    });

    it('should handle Error objects', () => {
      const error = new Error('Sample error');
      logger.error('An error occurred:', error);
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] An error occurred:', error);
    });

    it('should handle stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      logger.error('Error with stack:', error);
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error with stack:', error);
    });

    it('should handle empty error messages', () => {
      logger.error('');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] ');
    });
  });

  describe('warn method', () => {
    it('should log warning messages with [WARN] prefix', () => {
      const message = 'Test warning message';
      const details = 'Additional warning details';

      logger.warn(message, details);

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Test warning message', details);
    });

    it('should handle long warning messages', () => {
      const longMessage = 'A'.repeat(1000);
      logger.warn(longMessage);
      expect(consoleSpy.warn).toHaveBeenCalledWith(`[WARN] ${longMessage}`);
    });

    it('should handle special characters in warnings', () => {
      const specialMessage = 'Warning: File "test.txt" contains \n newlines and \t tabs';
      logger.warn(specialMessage);
      expect(consoleSpy.warn).toHaveBeenCalledWith(`[WARN] ${specialMessage}`);
    });
  });

  describe('debug method', () => {
    it('should log debug messages with [DEBUG] prefix in development environment', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
      const debugData = { userId: 123, action: 'test' };

      logger.debug(message, debugData);

      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Test debug message', debugData);
    });

    it('should not log debug messages in production environment', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';

      logger.debug(message);

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      const message = 'Test debug message';

      logger.debug(message);

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages in test environment', () => {
      process.env.NODE_ENV = 'test';
      const message = 'Test debug message';

      logger.debug(message);

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should handle complex debug data in development', () => {
      process.env.NODE_ENV = 'development';
      const complexData = {
        user: { id: 1, name: 'Test User' },
        request: { method: 'GET', url: '/api/test' },
        performance: { duration: 150 }
      };

      logger.debug('Complex debug data', complexData);

      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Complex debug data', complexData);
    });
  });

  describe('edge cases', () => {
    it('should handle very long messages', () => {
      const veryLongMessage = 'A'.repeat(10000);
      logger.info(veryLongMessage);
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${veryLongMessage}`);
    });

    it('should handle messages with newlines and tabs', () => {
      const multilineMessage = 'Line 1\nLine 2\n\tIndented line';
      logger.info(multilineMessage);
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${multilineMessage}`);
    });

    it('should handle circular reference objects gracefully', () => {
      const circular = { name: 'test' };
      circular.self = circular;
      
      // This should not throw an error when passed to logger
      expect(() => {
        logger.info('Circular object', circular);
      }).not.toThrow();
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Circular object', circular);
    });

    it('should handle multiple mixed argument types', () => {
      const mixedArgs = [
        'string',
        123,
        true,
        null,
        undefined,
        { key: 'value' },
        [1, 2, 3],
        new Date('2023-01-01')
      ];

      logger.info('Mixed arguments', ...mixedArgs);

      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Mixed arguments', ...mixedArgs);
    });
  });

  describe('logger object structure', () => {
    it('should have all required methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should be the default export', () => {
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
    });
  });
});
