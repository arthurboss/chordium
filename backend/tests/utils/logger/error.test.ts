import { describe, it, expect } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger.error method
 * Validates error-level logging functionality with proper prefixes and argument handling
 */

describe('logger.error', () => {
  const getTestContext = useLoggerTestSetup();

  it('should log error messages with [ERROR] prefix', () => {
    const { consoleSpy } = getTestContext();
    const message = 'Test error message';
    const args = ['error1', 'error2'];

    logger.error(message, ...args);

    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Test error message', 'error1', 'error2');
  });

  it('should handle Error objects as arguments', () => {
    const { consoleSpy } = getTestContext();
    const errorObj = new Error('Test error');
    
    logger.error('Error occurred', errorObj);
    
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error occurred', errorObj);
  });

  it('should handle stack traces in messages', () => {
    const { consoleSpy } = getTestContext();
    const stackMessage = 'Error at line 42\n    at function foo()\n    at module.exports';
    
    logger.error(stackMessage);
    
    expect(consoleSpy.error).toHaveBeenCalledWith(`[ERROR] ${stackMessage}`);
  });

  it('should handle error-like objects', () => {
    const { consoleSpy } = getTestContext();
    const errorLike = { name: 'CustomError', message: 'Something went wrong', code: 500 };
    
    logger.error('Custom error', errorLike);
    
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Custom error', errorLike);
  });

  it('should handle mixed argument types in error context', () => {
    const { consoleSpy } = getTestContext();
    const error = new Error('Test');
    const context = { userId: 123, action: 'fetch' };
    
    logger.error('Operation failed', error, context, 'additional info');
    
    expect(consoleSpy.error).toHaveBeenCalledWith(
      '[ERROR] Operation failed', 
      error, 
      context, 
      'additional info'
    );
  });
});
