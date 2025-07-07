import { describe, it, expect } from 'vitest';
import { generateUnifiedCacheKey } from '../unified-cache-key-generator';

describe('generateUnifiedCacheKey', () => {
  it('should generate correct key for basic artist and title', () => {
    const key = generateUnifiedCacheKey('The Beatles', 'Hey Jude');
    expect(key).toBe('the_beatles-hey_jude');
  });

  it('should handle special characters correctly', () => {
    const key = generateUnifiedCacheKey('AC/DC', 'Back in Black');
    expect(key).toBe('ac_dc-back_in_black');
  });

  it('should handle diacritics (Portuguese chars)', () => {
    const key = generateUnifiedCacheKey('Natiruts', 'Quero Ser Feliz Também');
    expect(key).toBe('natiruts-quero_ser_feliz_tambem');
  });

  it('should handle complex case from your example', () => {
    const key = generateUnifiedCacheKey('CPM 22', 'Dias Atrás'); 
    expect(key).toBe('cpm_22-dias_atras');
  });

  it('should handle punctuation and quotes', () => {
    const key = generateUnifiedCacheKey('Pink Floyd', 'Wish You Were Here');
    expect(key).toBe('pink_floyd-wish_you_were_here');
  });

  it('should handle parentheses and brackets', () => {
    const key = generateUnifiedCacheKey('Eagles', 'Hotel California (Live)');
    expect(key).toBe('eagles-hotel_california_live');
  });

  it('should handle multiple spaces and normalize them', () => {
    const key = generateUnifiedCacheKey('  Pearl   Jam  ', '  Better   Man  ');
    expect(key).toBe('pearl_jam-better_man');
  });

  it('should return empty string for invalid inputs', () => {
    expect(generateUnifiedCacheKey('', 'title')).toBe('');
    expect(generateUnifiedCacheKey('artist', '')).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(generateUnifiedCacheKey(null as any, 'title')).toBe('');
  });

  it('should handle numbers correctly', () => {
    const key = generateUnifiedCacheKey('U2', 'One');
    expect(key).toBe('u2-one');
  });

  it('should handle artists with numbers and special chars', () => {
    const key = generateUnifiedCacheKey('Foo Fighters', 'Learn to Fly');
    expect(key).toBe('foo_fighters-learn_to_fly');
  });
});
