import { describe, it, expect, beforeAll } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger structure and behavior
 * Validates logger object structure, method existence, and cross-method interactions
 */

describe('logger structure and behavior', () => {
  const getTestContext = useLoggerTestSetup();

  // Set development mode for debug logging in all tests
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
  });

  describe('logger object structure', () => {
    it('should have all required methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should be an object with expected structure', () => {
      expect(typeof logger).toBe('object');
      expect(logger).not.toBeNull();
      expect(logger).not.toBeUndefined();
    });

    it('should have consistent method signatures', () => {
      // All methods should accept a message and optional additional arguments
      expect(logger.info.length).toBe(1); // One required parameter (message)
      expect(logger.error.length).toBe(1);
      expect(logger.warn.length).toBe(1);
      expect(logger.debug.length).toBe(1);
    });
  });

  describe('method independence', () => {
    it('should not affect other methods when calling info', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('Info message');
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Info message');
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not affect other methods when calling error', () => {
      const { consoleSpy } = getTestContext();
      
      logger.error('Error message');
      
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not affect other methods when calling warn', () => {
      const { consoleSpy } = getTestContext();
      
      logger.warn('Warning message');
      
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not affect other methods when calling debug', () => {
      const { consoleSpy } = getTestContext();
      
      logger.debug('Debug message');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Debug message');
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });
  });

  describe('prefix consistency', () => {
    it('should use consistent prefix format across all methods', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('Test');
      logger.error('Test');
      logger.warn('Test');
      logger.debug('Test');
      
      expect(consoleSpy.log).toHaveBeenNthCalledWith(1, '[INFO] Test');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Test');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Test');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Test');
    });

    it('should maintain prefix format with empty messages', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('');
      logger.error('');
      logger.warn('');
      logger.debug('');
      
      expect(consoleSpy.log).toHaveBeenNthCalledWith(1, '[INFO] ');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] ');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] ');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] ');
    });
  });

  describe('concurrent usage', () => {
    it('should handle rapid successive calls', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('Message 1');
      logger.error('Message 2');
      logger.warn('Message 3');
      logger.debug('Message 4');
      logger.info('Message 5');
      
      expect(consoleSpy.log).toHaveBeenCalledTimes(2); // info calls only
      expect(consoleSpy.debug).toHaveBeenCalledTimes(1); // debug calls
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    });

    it('should maintain call order accuracy', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('First');
      logger.debug('Second');
      
      expect(consoleSpy.log).toHaveBeenNthCalledWith(1, '[INFO] First');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Second');
    });
  });
});
