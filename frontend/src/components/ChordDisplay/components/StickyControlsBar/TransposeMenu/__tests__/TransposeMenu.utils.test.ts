import { formatKeyDisplay, getMaxTransposeLevel, getMinTransposeLevel } from '../TransposeMenu.utils';

describe('TransposeMenu Utils', () => {
  describe('formatKeyDisplay', () => {
    it('should return original song key when no transpose (uiLevel === 0)', () => {
      const result = formatKeyDisplay(0, 0, 'C');
      
      expect(result).toEqual({
        keyName: 'C',
        transposeText: null
      });
    });

    it('should return default key when no song key provided', () => {
      const result = formatKeyDisplay(0, 0);
      
      expect(result).toEqual({
        keyName: 'C',
        transposeText: null
      });
    });

    it('should format transpose text correctly for positive values', () => {
      const result1 = formatKeyDisplay(1, 1, 'C');
      expect(result1.transposeText).toBe('+½');

      const result2 = formatKeyDisplay(2, 2, 'C');
      expect(result2.transposeText).toBe('+1');

      const result3 = formatKeyDisplay(3, 3, 'C');
      expect(result3.transposeText).toBe('+1½');

      const result4 = formatKeyDisplay(4, 4, 'C');
      expect(result4.transposeText).toBe('+2');

      const result5 = formatKeyDisplay(5, 5, 'C');
      expect(result5.transposeText).toBe('+2½');

      const result6 = formatKeyDisplay(6, 6, 'C');
      expect(result6.transposeText).toBe('+3');

      const result7 = formatKeyDisplay(7, 7, 'C');
      expect(result7.transposeText).toBe('+3½');

      const result8 = formatKeyDisplay(8, 8, 'C');
      expect(result8.transposeText).toBe('+4');

      const result9 = formatKeyDisplay(9, 9, 'C');
      expect(result9.transposeText).toBe('+4½');

      const result10 = formatKeyDisplay(10, 10, 'C');
      expect(result10.transposeText).toBe('+5');

      const result11 = formatKeyDisplay(11, 11, 'C');
      expect(result11.transposeText).toBe('+5½');
    });

    it('should format transpose text correctly for negative values', () => {
      const result1 = formatKeyDisplay(-1, -1, 'C');
      expect(result1.transposeText).toBe('-½');

      const result2 = formatKeyDisplay(-2, -2, 'C');
      expect(result2.transposeText).toBe('-1');

      const result3 = formatKeyDisplay(-3, -3, 'C');
      expect(result3.transposeText).toBe('-1½');

      const result4 = formatKeyDisplay(-4, -4, 'C');
      expect(result4.transposeText).toBe('-2');

      const result5 = formatKeyDisplay(-5, -5, 'C');
      expect(result5.transposeText).toBe('-2½');

      const result6 = formatKeyDisplay(-6, -6, 'C');
      expect(result6.transposeText).toBe('-3');

      const result7 = formatKeyDisplay(-7, -7, 'C');
      expect(result7.transposeText).toBe('-3½');

      const result8 = formatKeyDisplay(-8, -8, 'C');
      expect(result8.transposeText).toBe('-4');

      const result9 = formatKeyDisplay(-9, -9, 'C');
      expect(result9.transposeText).toBe('-4½');

      const result10 = formatKeyDisplay(-10, -10, 'C');
      expect(result10.transposeText).toBe('-5');

      const result11 = formatKeyDisplay(-11, -11, 'C');
      expect(result11.transposeText).toBe('-5½');
    });

    it('should calculate transposed key names correctly', () => {
      // Test major key transposition
      const result1 = formatKeyDisplay(2, 2, 'C');
      expect(result1.keyName).toBe('D');

      const result2 = formatKeyDisplay(-1, -1, 'C');
      expect(result2.keyName).toBe('B');

      // Test minor key transposition
      const result3 = formatKeyDisplay(3, 3, 'Am');
      expect(result3.keyName).toBe('Cm'); // Am + 3 semitones = Cm

      const result4 = formatKeyDisplay(-2, -2, 'Am');
      expect(result4.keyName).toBe('Gm');
    });

    it('should preserve key quality (major/minor)', () => {
      // Major keys should stay major
      const majorResult = formatKeyDisplay(1, 1, 'F');
      expect(majorResult.keyName).toBe('F#');
      expect(majorResult.keyName.endsWith('m')).toBe(false);

      // Minor keys should stay minor
      const minorResult = formatKeyDisplay(1, 1, 'Fm');
      expect(minorResult.keyName).toBe('F#m');
      expect(minorResult.keyName.endsWith('m')).toBe(true);
    });

    it('should handle keys with explicit major/minor suffixes', () => {
      const majorResult = formatKeyDisplay(1, 1, 'F major');
      expect(majorResult.keyName).toBe('F#');

      const minorResult = formatKeyDisplay(1, 1, 'F minor');
      expect(minorResult.keyName).toBe('F#m');
    });

    it('should fallback to transpose value when no song key provided', () => {
      const result = formatKeyDisplay(3, 3);
      expect(result.keyName).toBe('Eb'); // semitonesToKeyName(3) returns 'Eb'
      expect(result.transposeText).toBe('+1½');
    });

    it('should handle edge cases', () => {
      // Test with empty string song key
      const result1 = formatKeyDisplay(0, 0, '');
      expect(result1.keyName).toBe('C');

      // Test with null song key
      const result2 = formatKeyDisplay(0, 0, null as any);
      expect(result2.keyName).toBe('C');
    });
  });

  describe('getMaxTransposeLevel', () => {
    it('should return 11', () => {
      expect(getMaxTransposeLevel()).toBe(11);
    });
  });

  describe('getMinTransposeLevel', () => {
    it('should return -11', () => {
      expect(getMinTransposeLevel()).toBe(-11);
    });
  });

  describe('transpose text formatting edge cases', () => {
    it('should handle zero transpose correctly', () => {
      const result = formatKeyDisplay(0, 0, 'C');
      expect(result.transposeText).toBe(null);
    });

    it('should handle large positive values', () => {
      const result = formatKeyDisplay(20, 20, 'C');
      expect(result.transposeText).toBe('+10');
    });

    it('should handle large negative values', () => {
      const result = formatKeyDisplay(-20, -20, 'C');
      expect(result.transposeText).toBe('-10');
    });

    it('should handle odd numbers correctly', () => {
      const result1 = formatKeyDisplay(13, 13, 'C');
      expect(result1.transposeText).toBe('+6½');

      const result2 = formatKeyDisplay(-13, -13, 'C');
      expect(result2.transposeText).toBe('-6½');
    });
  });
});
