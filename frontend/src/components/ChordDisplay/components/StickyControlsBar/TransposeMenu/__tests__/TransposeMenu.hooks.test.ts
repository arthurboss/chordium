import { renderHook, act } from '@testing-library/react';
import { useTransposeMenu } from '../TransposeMenu.hooks';
import type { TransposeMenuProps } from '../TransposeMenu.types';
import { vi } from 'vitest';

describe('useTransposeMenu', () => {
  const defaultProps: TransposeMenuProps = {
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
      const { result } = renderHook(() => useTransposeMenu(defaultProps));

      expect(result.current.uiTransposeLevel).toBe(0);
      expect(result.current.isAltered).toBe(false);
      expect(result.current.animationDirection).toBe('up');
      expect(result.current.disableIncrement).toBe(false);
      expect(result.current.disableDecrement).toBe(false);
    });

    it('should increment transpose correctly', () => {
      const { result } = renderHook(() => useTransposeMenu(defaultProps));

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
      const { result } = renderHook(() => useTransposeMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(defaultProps.setTranspose).toHaveBeenCalledWith(0); // 1 - 1 = 0
      expect(result.current.uiTransposeLevel).toBe(0); // uiTransposeLevel reflects actual transpose level
      expect(result.current.isAltered).toBe(false); // isAltered is based on uiTransposeLevel !== 0
      expect(result.current.animationDirection).toBe('down');
    });

    it('should reset to default transpose', () => {
      const props = { ...defaultProps, transpose: 5 };
      const { result } = renderHook(() => useTransposeMenu(props));

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
      const { result } = renderHook(() => useTransposeMenu(props));

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
      const { result } = renderHook(() => useTransposeMenu(props));

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
      const { result } = renderHook(() => useTransposeMenu(props));

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
      const { result } = renderHook(() => useTransposeMenu(props));

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

  // Note: Capo-transpose linking logic is now handled in ControlsBar component
  // The KeyMenu hook only manages its own transpose limits

  describe('animation direction', () => {
    it('should set animation direction to up when incrementing', () => {
      const { result } = renderHook(() => useTransposeMenu(defaultProps));

      act(() => {
        result.current.handleIncrement();
      });

      expect(result.current.animationDirection).toBe('up');
    });

    it('should set animation direction to down when decrementing', () => {
      const props = { ...defaultProps, transpose: 1 };
      const { result } = renderHook(() => useTransposeMenu(props));

      act(() => {
        result.current.handleDecrement();
      });

      expect(result.current.animationDirection).toBe('down');
    });
  });
});
