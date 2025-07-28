import { describe, it, expect } from '@jest/globals';
import logger from '../../../utils/logger.js';
import { useLoggerTestSetup } from './shared-setup.js';

/**
 * Tests for logger.warn method
 * Validates warning-level logging functionality with proper prefixes and argument handling
 */

describe('logger.warn', () => {
  const getTestContext = useLoggerTestSetup();

  it('should log warning messages with [WARN] prefix', () => {
    const { consoleSpy } = getTestContext();
    const message = 'Test warning message';
    const args = ['warn1', 'warn2'];

    logger.warn(message, ...args);

    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Test warning message', 'warn1', 'warn2');
  });

  it('should handle deprecation warnings', () => {
    const { consoleSpy } = getTestContext();
    const deprecationMessage = 'DEPRECATED: This method will be removed in v2.0';
    
    logger.warn(deprecationMessage);
    
    expect(consoleSpy.warn).toHaveBeenCalledWith(`[WARN] ${deprecationMessage}`);
  });

  it('should handle performance warnings with metrics', () => {
    const { consoleSpy } = getTestContext();
    const performanceData = { executionTime: 5000, threshold: 1000 };
    
    logger.warn('Slow operation detected', performanceData);
    
    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Slow operation detected', performanceData);
  });

  it('should handle configuration warnings', () => {
    const { consoleSpy } = getTestContext();
    const configWarning = 'Missing environment variable: API_KEY, using default';
    
    logger.warn(configWarning);
    
    expect(consoleSpy.warn).toHaveBeenCalledWith(`[WARN] ${configWarning}`);
  });

  it('should handle multiple warning contexts', () => {
    const { consoleSpy } = getTestContext();
    const context = { module: 'auth', function: 'validateToken' };
    const details = { token: '[REDACTED]', expiry: '2024-01-01' };
    
    logger.warn('Token expiring soon', context, details);
    
    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Token expiring soon', context, details);
  });
});
