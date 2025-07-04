import { describe, it, expect } from 'vitest';
import { generateChordSheetCacheKey } from '../generate-chord-sheet-cache-key';

describe('generateChordSheetCacheKey', () => {
  it('should generate cache key from artist and title', () => {
    const key = generateChordSheetCacheKey('The Beatles', 'Hey Jude');
    
    expect(key).toBe('the-beatles_hey-jude');
  });

  it('should handle special characters', () => {
    const key = generateChordSheetCacheKey('AC/DC', 'Back in Black');
    
    expect(key).toBe('ac-dc_back-in-black');
  });

  it('should handle empty strings', () => {
    const key = generateChordSheetCacheKey('', '');
    
    expect(key).toBe('_');
  });

  it('should trim whitespace', () => {
    const key = generateChordSheetCacheKey('  Pink Floyd  ', '  Wish You Were Here  ');
    
    expect(key).toBe('pink-floyd_wish-you-were-here');
  });
});
