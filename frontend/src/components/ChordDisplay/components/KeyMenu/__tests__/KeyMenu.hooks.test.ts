import { renderHook, act } from '@testing-library/react';
import { useKeyMenu } from '../KeyMenu.hooks';
import type { KeyMenuProps } from '../KeyMenu.types';
import { vi } from 'vitest';

describe('useKeyMenu', () => {
  const defaultProps: KeyMenuProps = {
    transpose: 0,
    setTranspose: vi.fn(),
    defaultTranspose: 0,
    songKey: 'C',
    title: 'Test Key Menu'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useKeyMenu(defaultProps));

      expect(result.current.uiTransposeLevel).toBe(0);
      expect(result.current.isAltered).toBe(false);
      expect(result.current.animationDirection).toBe('up');
      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should increment transpose correctly', () => {
      const { result } = renderHook(() => useKeyMenu(defaultProps));

      act(() => {
        result.current.handleIncrement();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(1);
      expect(result.current.uiTransposeLevel).toBe(1);
      expect(result.current.isAltered).toBe(true);
      expect(result.current.animationDirection).toBe('up');
    });

    it('should decrement transpose correctly', () => {
      const props = { ...defaultProps, transpose: 1 };
      const { result } = renderHook(() => useKeyMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(0);
      expect(result.current.uiTransposeLevel).toBe(-1); // uiTransposeLevel starts at 0 and decrements
      expect(result.current.isAltered).toBe(true); // isAltered is based on uiTransposeLevel !== 0
      expect(result.current.animationDirection).toBe('down');
    });

    it('should reset to default transpose', () => {
      const props = { ...defaultProps, transpose: 5 };
      const { result } = renderHook(() => useKeyMenu(props));

      act(() => {
        result.current.handleReset();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(0);
      expect(result.current.uiTransposeLevel).toBe(0);
      expect(result.current.isAltered).toBe(false);
    });
  });

  describe('transpose limits', () => {
    it('should disable increment when at max transpose level (+11)', () => {
      const props = { ...defaultProps, transpose: 0 };
      const { result } = renderHook(() => useKeyMenu(props));

      // Simulate reaching max level by incrementing 11 times
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleIncrement();
        });
      }

      expect(result.current.disableIncrement).toBe(true);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should disable decrement when at min transpose level (-11)', () => {
      const props = { ...defaultProps, transpose: 0 };
      const { result } = renderHook(() => useKeyMenu(props));

      // Simulate reaching min level by decrementing 11 times
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleDecrement();
        });
      }

      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(true);
    });

    it('should reset to default when incrementing at max level', () => {
      const props = { ...defaultProps, transpose: 0 };
      const { result } = renderHook(() => useKeyMenu(props));

      // First reach max level
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleIncrement();
        });
      }

      // Then try to increment again (should reset)
      act(() => {
        result.current.handleIncrement();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(0);
      expect(result.current.uiTransposeLevel).toBe(0);
    });

    it('should reset to default when decrementing at min level', () => {
      const props = { ...defaultProps, transpose: 0 };
      const { result } = renderHook(() => useKeyMenu(props));

      // First reach min level
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleDecrement();
        });
      }

      // Then try to decrement again (should reset)
      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(0);
      expect(result.current.uiTransposeLevel).toBe(0);
    });
  });

  describe('capo-transpose linking', () => {
    it('should disable increment when capo is at minimum (0) and linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 0,
        transpose: 5
      };
      const { result } = renderHook(() => useKeyMenu(props));

      expect(result.current.disableIncrement).toBe(true);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should disable decrement when capo is at maximum (11) and linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 11,
        transpose: -5
      };
      const { result } = renderHook(() => useKeyMenu(props));

      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(true);
    });

    it('should allow increment when capo is not at minimum and linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 5,
        transpose: 5
      };
      const { result } = renderHook(() => useKeyMenu(props));

      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should allow decrement when capo is not at maximum and linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 5,
        transpose: -5
      };
      const { result } = renderHook(() => useKeyMenu(props));

      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should prioritize transpose limits over capo limits when not linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: false,
        capo: 0, // Capo at min, but not linked
        transpose: 0
      };
      const { result } = renderHook(() => useKeyMenu(props));

      // Simulate reaching max transpose level
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleIncrement();
        });
      }

      expect(result.current.disableIncrement).toBe(true); // Because transpose is at max
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should handle edge case: capo at 0, transpose at -11, linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 0,
        transpose: 0
      };
      const { result } = renderHook(() => useKeyMenu(props));

      // Simulate reaching min transpose level
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleDecrement();
        });
      }

      expect(result.current.disableIncrement).toBe(true); // Capo at min
      expect(result.current.disableDecrement).toBe(true); // Transpose at min
    });

    it('should handle edge case: capo at 11, transpose at 11, linked', () => {
      const props = {
        ...defaultProps,
        capoTransposeLinked: true,
        capo: 11,
        transpose: 0
      };
      const { result } = renderHook(() => useKeyMenu(props));

      // Simulate reaching max transpose level
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.handleIncrement();
        });
      }

      expect(result.current.disableIncrement).toBe(true); // Transpose at max
      expect(result.current.disableDecrement).toBe(true); // Capo at max
    });
  });

  describe('animation direction', () => {
    it('should set animation direction to up when incrementing', () => {
      const { result } = renderHook(() => useKeyMenu(defaultProps));

      act(() => {
        result.current.handleIncrement();
      });

      expect(result.current.animationDirection).toBe('up');
    });

    it('should set animation direction to down when decrementing', () => {
      const props = { ...defaultProps, transpose: 1 };
      const { result } = renderHook(() => useKeyMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(result.current.animationDirection).toBe('down');
    });
  });
});
