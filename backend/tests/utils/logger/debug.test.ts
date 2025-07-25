import { describe, it, expect, beforeEach } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger.debug method
 * Validates debug-level logging functionality with proper prefixes and argument handling
 */

describe('logger.debug', () => {
  const getTestContext = useLoggerTestSetup();

  beforeEach(() => {
    // Set development mode for debug logging
    process.env.NODE_ENV = 'development';
  });

  it('should log debug messages with [DEBUG] prefix', () => {
    const { consoleSpy } = getTestContext();
    const message = 'Test debug message';
    const args = ['debug1', 'debug2'];

    logger.debug(message, ...args);

    expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Test debug message', 'debug1', 'debug2');
  });

  it('should handle detailed debugging information', () => {
    const { consoleSpy } = getTestContext();
    const debugData = {
      function: 'processChords',
      parameters: { chordType: 'major', key: 'C' },
      timestamp: '2024-01-01T00:00:00Z',
      step: 'validation'
    };
    
    logger.debug('Processing step', debugData);
    
    expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Processing step', debugData);
  });

  it('should handle variable inspection', () => {
    const { consoleSpy } = getTestContext();
    const variables = {
      userId: 123,
      requestId: 'abc-123',
      payload: { action: 'search', query: 'test' }
    };
    
    logger.debug('Variable state', variables);
    
    expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Variable state', variables);
  });

  it('should handle function entry/exit debugging', () => {
    const { consoleSpy } = getTestContext();
    
    logger.debug('Entering function: searchChords', { query: 'Am', limit: 10 });
    
    expect(consoleSpy.debug).toHaveBeenCalledWith(
      '[DEBUG] Entering function: searchChords', 
      { query: 'Am', limit: 10 }
    );
  });

  it('should handle complex debugging scenarios', () => {
    const { consoleSpy } = getTestContext();
    const request = { method: 'GET', url: '/api/search' };
    const response = { status: 200, data: [] };
    const timing = { start: 1000, end: 1500 };
    
    logger.debug('Request completed', request, response, timing);
    
    expect(consoleSpy.debug).toHaveBeenCalledWith(
      '[DEBUG] Request completed', 
      request, 
      response, 
      timing
    );
  });
});
