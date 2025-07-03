import { describe, it, expect } from 'vitest';
import { parseStorageKey } from '../parse-storage-key';

describe('parseStorageKey', () => {
  it('should parse a normal storage key with artist and title', () => {
    const result = parseStorageKey('eagles-hotel_california');
    
    expect(result).toEqual({
      artist: 'eagles',
      title: 'hotel california'
    });
  });

  it('should replace underscores with spaces in artist and title', () => {
    const result = parseStorageKey('the_rolling_stones-paint_it_black');
    
    expect(result).toEqual({
      artist: 'the rolling stones',
      title: 'paint it black'
    });
  });

  it('should handle multiple dashes by using the last one as separator', () => {
    const result = parseStorageKey('guns-n-roses-sweet_child_o_mine');
    
    expect(result).toEqual({
      artist: 'guns-n-roses',
      title: 'sweet child o mine'
    });
  });

  it('should handle storage key with no dash by using whole string as artist', () => {
    const result = parseStorageKey('metallica');
    
    expect(result).toEqual({
      artist: 'metallica',
      title: ''
    });
  });

  it('should handle storage key with dash at the end', () => {
    const result = parseStorageKey('eagles-');
    
    expect(result).toEqual({
      artist: 'eagles',
      title: ''
    });
  });

  it('should handle storage key with dash at the beginning', () => {
    const result = parseStorageKey('-hotel_california');
    
    expect(result).toEqual({
      artist: '',
      title: 'hotel california'
    });
  });

  it('should handle empty string', () => {
    const result = parseStorageKey('');
    
    expect(result).toEqual({
      artist: '',
      title: ''
    });
  });

  it('should handle complex artist names with dashes and underscores', () => {
    const result = parseStorageKey('red_hot_chili_peppers-under_the_bridge');
    
    expect(result).toEqual({
      artist: 'red hot chili peppers',
      title: 'under the bridge'
    });
  });

  it('should handle single character artist and title', () => {
    const result = parseStorageKey('a-b');
    
    expect(result).toEqual({
      artist: 'a',
      title: 'b'
    });
  });

  it('should handle only dashes', () => {
    const result = parseStorageKey('---');
    
    expect(result).toEqual({
      artist: '--',
      title: ''
    });
  });
});
