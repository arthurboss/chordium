import { formatCapoDisplay } from '../CapoMenu.utils';

describe('CapoMenu Utils', () => {
  describe('formatCapoDisplay', () => {
    it('should return capo as string when uiLevel is 0', () => {
      const result = formatCapoDisplay(5, 0);
      expect(result).toBe('5');
    });

    it('should return capo as string when uiLevel is not 0', () => {
      const result = formatCapoDisplay(3, 2);
      expect(result).toBe('3');
    });

    it('should handle zero capo', () => {
      const result = formatCapoDisplay(0, 0);
      expect(result).toBe('0');
    });

    it('should handle maximum capo', () => {
      const result = formatCapoDisplay(11, 0);
      expect(result).toBe('11');
    });

    it('should handle negative capo values', () => {
      const result = formatCapoDisplay(-1, 0);
      expect(result).toBe('-1');
    });

    it('should handle large capo values', () => {
      const result = formatCapoDisplay(15, 0);
      expect(result).toBe('15');
    });

    it('should handle decimal capo values', () => {
      const result = formatCapoDisplay(2.5, 0);
      expect(result).toBe('2.5');
    });

    it('should always return string representation', () => {
      const result1 = formatCapoDisplay(0, 0);
      const result2 = formatCapoDisplay(5, 3);
      const result3 = formatCapoDisplay(-2, -1);

      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(typeof result3).toBe('string');
    });

    it('should handle edge cases with uiLevel', () => {
      const result1 = formatCapoDisplay(5, 1);
      const result2 = formatCapoDisplay(5, -1);
      const result3 = formatCapoDisplay(5, 10);

      expect(result1).toBe('5');
      expect(result2).toBe('5');
      expect(result3).toBe('5');
    });
  });
});
