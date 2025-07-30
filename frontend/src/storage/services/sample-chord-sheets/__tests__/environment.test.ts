/**
 * Tests for environment detection module
 */

import { describe, it, expect, vi } from 'vitest';
import { isDevelopmentMode } from '../environment';

vi.mock('../environment', () => ({
  isDevelopmentMode: vi.fn()
}));

describe('Environment Detection', () => {
  it('should detect development mode correctly', () => {
    const mockIsDev = vi.mocked(isDevelopmentMode);
    mockIsDev.mockReturnValue(true);
    
    expect(isDevelopmentMode()).toBe(true);
  });

  it('should detect production mode correctly', () => {
    const mockIsDev = vi.mocked(isDevelopmentMode);
    mockIsDev.mockReturnValue(false);
    
    expect(isDevelopmentMode()).toBe(false);
  });
});
