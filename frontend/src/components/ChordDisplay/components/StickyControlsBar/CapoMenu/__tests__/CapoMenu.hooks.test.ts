import { renderHook, act } from '@testing-library/react';
import { useCapoMenu } from '../CapoMenu.hooks';
import { vi } from 'vitest';

describe('useCapoMenu', () => {
  const defaultProps = {
    capo: 0,
    setCapo: vi.fn(),
    defaultCapo: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      expect(result.current.uiCapoLevel).toBe(0);
      expect(result.current.isAltered).toBe(false);
      expect(result.current.animationDirection).toBe('up');
      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(true); // Capo at 0, so decrement disabled
    });

    it('should increment capo correctly', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      act(() => {
        result.current.handleIncrement();
      });

      expect(defaultProps.setCapo).toHaveBeenCalledWith(1);
      expect(result.current.uiCapoLevel).toBe(1);
      expect(result.current.isAltered).toBe(false); // isAltered is based on capo !== defaultCapo, not uiCapoLevel
      expect(result.current.animationDirection).toBe('up');
    });

    it('should decrement capo correctly', () => {
      const props = { ...defaultProps, capo: 1 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setCapo).toHaveBeenCalledWith(0);
      expect(result.current.uiCapoLevel).toBe(0);
      expect(result.current.isAltered).toBe(true); // capo (1) !== defaultCapo (0)
      expect(result.current.animationDirection).toBe('down');
    });

    it('should reset to default capo', () => {
      const props = { ...defaultProps, capo: 5 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleReset();
      });

      expect(defaultProps.setCapo).toHaveBeenCalledWith(0);
      expect(result.current.uiCapoLevel).toBe(0);
      expect(result.current.isAltered).toBe(true); // capo (5) !== defaultCapo (0)
    });
  });

  describe('capo limits (0-11)', () => {
    it('should disable increment when at max capo level (11)', () => {
      const props = { ...defaultProps, capo: 11 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.disableIncrement).toBe(true);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should disable decrement when at min capo level (0)', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(true);
    });

    it('should not increment when at max capo level (11)', () => {
      const props = { ...defaultProps, capo: 11 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleIncrement();
      });

      expect(defaultProps.setCapo).not.toHaveBeenCalled();
    });

    it('should not decrement when at min capo level (0)', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setCapo).not.toHaveBeenCalled();
    });

    it('should clamp capo increment to maximum (11)', () => {
      const props = { ...defaultProps, capo: 10 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleIncrement();
      });

      expect(defaultProps.setCapo).toHaveBeenCalledWith(11);
    });

    it('should clamp capo decrement to minimum (0)', () => {
      const props = { ...defaultProps, capo: 1 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setCapo).toHaveBeenCalledWith(0);
    });
  });

  describe('UI level calculation', () => {
    it('should calculate UI level correctly when capo equals default', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      expect(result.current.uiCapoLevel).toBe(0);
      expect(result.current.isAltered).toBe(false);
    });

    it('should calculate UI level correctly when capo is above default', () => {
      const props = { ...defaultProps, capo: 3 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.uiCapoLevel).toBe(3);
      expect(result.current.isAltered).toBe(true);
    });

    it('should calculate UI level correctly when capo is below default', () => {
      const props = { ...defaultProps, capo: 0, defaultCapo: 2 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.uiCapoLevel).toBe(-2);
      expect(result.current.isAltered).toBe(true);
    });

    it('should update UI level when capo changes externally', () => {
      const { result, rerender } = renderHook(
        ({ capo }) => useCapoMenu({ ...defaultProps, capo }),
        { initialProps: { capo: 0 } }
      );

      expect(result.current.uiCapoLevel).toBe(0);

      rerender({ capo: 5 });

      expect(result.current.uiCapoLevel).toBe(5);
      expect(result.current.isAltered).toBe(true);
    });

    it('should update UI level when defaultCapo changes', () => {
      const { result, rerender } = renderHook(
        ({ defaultCapo }) => useCapoMenu({ ...defaultProps, defaultCapo }),
        { initialProps: { defaultCapo: 0 } }
      );

      expect(result.current.uiCapoLevel).toBe(0);

      rerender({ defaultCapo: 3 });

      expect(result.current.uiCapoLevel).toBe(-3);
      expect(result.current.isAltered).toBe(true);
    });
  });

  describe('animation direction', () => {
    it('should set animation direction to up when incrementing', () => {
      const { result } = renderHook(() => useCapoMenu(defaultProps));

      act(() => {
        result.current.handleIncrement();
      });

      expect(result.current.animationDirection).toBe('up');
    });

    it('should set animation direction to down when decrementing', () => {
      const props = { ...defaultProps, capo: 1 };
      const { result } = renderHook(() => useCapoMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(result.current.animationDirection).toBe('down');
    });
  });

  describe('edge cases', () => {
    it('should handle negative capo values gracefully', () => {
      const props = { ...defaultProps, capo: -1 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.uiCapoLevel).toBe(-1);
      expect(result.current.isAltered).toBe(true);
      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(true);
    });

    it('should handle capo values above 11 gracefully', () => {
      const props = { ...defaultProps, capo: 15 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.uiCapoLevel).toBe(15);
      expect(result.current.isAltered).toBe(true);
      expect(result.current.disableIncrement).toBe(true);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should handle different default capo values', () => {
      const props = { ...defaultProps, capo: 5, defaultCapo: 3 };
      const { result } = renderHook(() => useCapoMenu(props));

      expect(result.current.uiCapoLevel).toBe(2);
      expect(result.current.isAltered).toBe(true);
    });
  });
});
