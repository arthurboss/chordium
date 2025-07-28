import { describe, it, expect } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger edge cases and special scenarios
 * Validates logger behavior with unusual inputs and boundary conditions
 */

describe('logger edge cases', () => {
  const getTestContext = useLoggerTestSetup();

  describe('extremely long messages', () => {
    it('should handle very long strings without truncation', () => {
      const { consoleSpy } = getTestContext();
      const longMessage = 'A'.repeat(10000);
      
      logger.info(longMessage);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${longMessage}`);
    });

    it('should handle long messages with many arguments', () => {
      const { consoleSpy } = getTestContext();
      const longArgs = Array(100).fill(0).map((_, i) => `arg${i}`);
      
      logger.info('Message with many args', ...longArgs);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Message with many args', ...longArgs);
    });
  });

  describe('special JavaScript values', () => {
    it('should handle Symbol values', () => {
      const { consoleSpy } = getTestContext();
      const sym = Symbol('test');
      
      logger.info('Symbol test', sym);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Symbol test', sym);
    });

    it('should handle BigInt values', () => {
      const { consoleSpy } = getTestContext();
      const bigInt = BigInt('9007199254740991');
      
      logger.info('BigInt test', bigInt);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] BigInt test', bigInt);
    });

    it('should handle circular references in objects', () => {
      const { consoleSpy } = getTestContext();
      const circular: { name: string; self?: unknown } = { name: 'test' };
      circular.self = circular;
      
      logger.info('Circular reference test', circular);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Circular reference test', circular);
    });

    it('should handle functions as arguments', () => {
      const { consoleSpy } = getTestContext();
      const testFunction = () => 'test';
      
      logger.info('Function test', testFunction);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Function test', testFunction);
    });
  });

  describe('numeric edge cases', () => {
    it('should handle zero values', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('Zero test', 0, -0, 0.0);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Zero test', 0, -0, 0.0);
    });

    it('should handle infinity values', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('Infinity test', Infinity, -Infinity);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Infinity test', Infinity, -Infinity);
    });

    it('should handle NaN values', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('NaN test', NaN);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] NaN test', NaN);
    });
  });

  describe('whitespace and formatting', () => {
    it('should preserve leading and trailing whitespace', () => {
      const { consoleSpy } = getTestContext();
      const message = '   message with spaces   ';
      
      logger.info(message);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${message}`);
    });

    it('should handle newlines and tabs', () => {
      const { consoleSpy } = getTestContext();
      const message = 'Line 1\nLine 2\tTabbed content\r\nWindows line ending';
      
      logger.info(message);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${message}`);
    });

    it('should handle only whitespace messages', () => {
      const { consoleSpy } = getTestContext();
      
      logger.info('   \t\n   ');
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO]    \t\n   ');
    });
  });
});
