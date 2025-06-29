import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('localStorage test', () => {
  beforeEach(() => {
    // Setup localStorage mock for each test
    setupLocalStorageMock();
  });

  it('should work with localStorage directly', () => {
    // Test basic localStorage functionality
    console.log('Initial localStorage check:', localStorage.getItem('test-key'));
    
    localStorage.setItem('test-key', 'test-value');
    console.log('After setting test-key:', localStorage.getItem('test-key'));
    
    const data = { message: 'hello', number: 42 };
    localStorage.setItem('test-json', JSON.stringify(data));
    console.log('After setting test-json:', localStorage.getItem('test-json'));
    
    expect(localStorage.getItem('test-key')).toBe('test-value');
  });
});
