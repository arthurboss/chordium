import { describe, it, expect } from '@jest/globals';
import { transformToGenericResults } from '../../../utils/result-transformers.js';

/**
 * Tests for transformToGenericResults
 */
describe('transformToGenericResults', () => {
  it('should remove Cifra Club suffix from titles', () => {
    const results = [
      { title: 'Some Result - Cifra Club', url: 'https://example.com/1' },
      { title: 'Another Result - Cifra Club', url: 'https://example.com/2' }
    ];

    const transformed = transformToGenericResults(results as any);

    expect(transformed).toEqual([
      { title: 'Some Result', url: 'https://example.com/1' },
      { title: 'Another Result', url: 'https://example.com/2' }
    ]);
  });

  it('should preserve other result properties', () => {
    const results = [
      { 
        title: 'Some Result - Cifra Club', 
        url: 'https://example.com/1',
        customProperty: 'test'
      }
    ];

    const transformed = transformToGenericResults(results as any);

    expect(transformed).toEqual([
      { 
        title: 'Some Result', 
        url: 'https://example.com/1',
        customProperty: 'test'
      }
    ]);
  });
});
