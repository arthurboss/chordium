import { describe, it, expect } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger.info method
 * Validates info-level logging functionality with proper prefixes and argument handling
 */

describe('logger.info', () => {
  const getTestContext = useLoggerTestSetup();

  it('should log info messages with [INFO] prefix', () => {
    const { consoleSpy } = getTestContext();
    const message = 'Test info message';
    const args = ['arg1', 'arg2'];

    logger.info(message, ...args);

    expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test info message', 'arg1', 'arg2');
  });

  it('should handle empty strings', () => {
    const { consoleSpy } = getTestContext();
    
    logger.info('');
    
    expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] ');
  });

  it('should handle Unicode characters', () => {
    const { consoleSpy } = getTestContext();
    const unicodeMessage = 'Test with emojis 🎵🎸 and special chars ñáéíóú';
    
    logger.info(unicodeMessage);
    
    expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${unicodeMessage}`);
  });

  it('should handle punctuation-heavy text', () => {
    const { consoleSpy } = getTestContext();
    const punctuationMessage = '!@#$%^&*()_+-=[]{}|;:",./<>?';
    
    logger.info(punctuationMessage);
    
    expect(consoleSpy.log).toHaveBeenCalledWith(`[INFO] ${punctuationMessage}`);
  });

  it('should handle objects and arrays as additional arguments', () => {
    const { consoleSpy } = getTestContext();
    const obj = { key: 'value' };
    const arr = [1, 2, 3];
    
    logger.info('Message with objects', obj, arr);
    
    expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Message with objects', obj, arr);
  });

  it('should handle null and undefined arguments', () => {
    const { consoleSpy } = getTestContext();
    
    logger.info('Message', null, undefined);
    
    expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Message', null, undefined);
  });
});
