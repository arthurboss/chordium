/**
 * Unit tests for DesktopControls capo-transpose linking logic
 * Tests the centralized linking logic without UI components
 */

import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';

// Mock the DesktopControls linking logic
const useDesktopControlsLinking = (
  initialCapo: number = 0,
  initialTranspose: number = 0,
  initialLinked: boolean = false
) => {
  const [capo, setCapo] = useState(initialCapo);
  const [transpose, setTranspose] = useState(initialTranspose);
  const [capoTransposeLinked, setCapoTransposeLinked] = useState(initialLinked);

  // Handle capo-transpose linking logic (copied from DesktopControls)
  const handleCapoChange = (newCapo: number) => {
    setCapo(newCapo);

    // If linked, adjust transpose inversely
    if (capoTransposeLinked) {
      const capoDifference = newCapo - capo;
      const newTranspose = transpose - capoDifference;
      
      // Clamp transpose to valid range (-11 to +11)
      const clampedTranspose = Math.max(-11, Math.min(11, newTranspose));
      
      setTranspose(clampedTranspose);
    }
  };

  const handleTransposeChange = (newTranspose: number) => {
    setTranspose(newTranspose);

    // If linked, adjust capo inversely
    if (capoTransposeLinked) {
      const transposeDifference = newTranspose - transpose;
      const newCapo = capo - transposeDifference;
      
      // Clamp capo to valid range (0-11)
      const clampedCapo = Math.max(0, Math.min(11, newCapo));
      
      setCapo(clampedCapo);
    }
  };

  // Calculate disable states for buttons based on linking
  const getCapoDisableStates = () => {
    if (!capoTransposeLinked) {
      return { disableIncrement: capo >= 11, disableDecrement: capo <= 0 };
    }
    
    // When linked, consider both capo and transpose limits
    return {
      disableIncrement: capo >= 11 || transpose <= -11,
      disableDecrement: capo <= 0 || transpose >= 11
    };
  };

  const getTransposeDisableStates = () => {
    if (!capoTransposeLinked) {
      return { disableIncrement: transpose >= 11, disableDecrement: transpose <= -11 };
    }
    
    // When linked, consider both capo and transpose limits
    return {
      disableIncrement: transpose >= 11 || capo <= 0,
      disableDecrement: transpose <= -11 || capo >= 11
    };
  };

  const handleToggleLink = () => {
    setCapoTransposeLinked(!capoTransposeLinked);
  };

  return {
    capo,
    transpose,
    capoTransposeLinked,
    handleCapoChange,
    handleTransposeChange,
    handleToggleLink,
    getCapoDisableStates,
    getTransposeDisableStates
  };
};

describe('DesktopControls Linking Logic', () => {
  describe('capo to transpose linking', () => {
    it('should adjust transpose inversely when capo changes and linked', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 0, true));

      act(() => {
        result.current.handleCapoChange(2);
      });

      expect(result.current.capo).toBe(2);
      expect(result.current.transpose).toBe(-2); // Transpose decreases when capo increases
    });

    it('should not adjust transpose when capo changes and not linked', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 5, false));

      act(() => {
        result.current.handleCapoChange(3);
      });

      expect(result.current.capo).toBe(3);
      expect(result.current.transpose).toBe(5); // Transpose unchanged
    });

    it('should clamp transpose when capo change would exceed limits', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 10, true));

      act(() => {
        result.current.handleCapoChange(5);
      });

      expect(result.current.capo).toBe(5);
      expect(result.current.transpose).toBe(5); // Clamped from 5 to 5 (10 - 5 = 5, within limits)
    });

    it('should clamp transpose when capo change would go below -11', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, -10, true));

      act(() => {
        result.current.handleCapoChange(5);
      });

      expect(result.current.capo).toBe(5);
      expect(result.current.transpose).toBe(-11); // Clamped to -11
    });
  });

  describe('transpose to capo linking', () => {
    it('should adjust capo inversely when transpose changes and linked', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 0, true));

      act(() => {
        result.current.handleTransposeChange(3);
      });

      expect(result.current.transpose).toBe(3);
      expect(result.current.capo).toBe(0); // Capo decreases when transpose increases, but clamped to 0
    });

    it('should not adjust capo when transpose changes and not linked', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(5, 0, false));

      act(() => {
        result.current.handleTransposeChange(3);
      });

      expect(result.current.transpose).toBe(3);
      expect(result.current.capo).toBe(5); // Capo unchanged
    });

    it('should clamp capo when transpose change would exceed limits', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(5, 0, true));

      act(() => {
        result.current.handleTransposeChange(10);
      });

      expect(result.current.transpose).toBe(10);
      expect(result.current.capo).toBe(0); // Clamped from -5 to 0
    });

    it('should clamp capo when transpose change would go above 11', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(5, 0, true));

      act(() => {
        result.current.handleTransposeChange(-10);
      });

      expect(result.current.transpose).toBe(-10);
      expect(result.current.capo).toBe(11); // Clamped from 15 to 11
    });
  });

  describe('disable states calculation', () => {
    describe('when not linked', () => {
      it('should disable capo increment when at max (11)', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(11, 0, false));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(true);
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable capo decrement when at min (0)', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, 0, false));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(false);
        expect(disableStates.disableDecrement).toBe(true);
      });

      it('should disable transpose increment when at max (11)', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, 11, false));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(true);
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable transpose decrement when at min (-11)', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, -11, false));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(false);
        expect(disableStates.disableDecrement).toBe(true);
      });
    });

    describe('when linked', () => {
      it('should disable capo increment when capo at max OR transpose at min', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(11, 0, true));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(true); // Capo at max
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable capo increment when transpose at min even if capo not at max', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(5, -11, true));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(true); // Transpose at min
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable capo decrement when capo at min OR transpose at max', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, 0, true));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(false);
        expect(disableStates.disableDecrement).toBe(true); // Capo at min
      });

      it('should disable capo decrement when transpose at max even if capo not at min', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(5, 11, true));

        const disableStates = result.current.getCapoDisableStates();
        expect(disableStates.disableIncrement).toBe(false);
        expect(disableStates.disableDecrement).toBe(true); // Transpose at max
      });

      it('should disable transpose increment when transpose at max OR capo at min', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, 11, true));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(true); // Transpose at max
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable transpose increment when capo at min even if transpose not at max', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, 5, true));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(true); // Capo at min
        expect(disableStates.disableDecrement).toBe(false);
      });

      it('should disable transpose decrement when transpose at min OR capo at max', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(0, -11, true));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(true); // Capo at min
        expect(disableStates.disableDecrement).toBe(true); // Transpose at min
      });

      it('should disable transpose decrement when capo at max even if transpose not at min', () => {
        const { result } = renderHook(() => useDesktopControlsLinking(11, -5, true));

        const disableStates = result.current.getTransposeDisableStates();
        expect(disableStates.disableIncrement).toBe(false);
        expect(disableStates.disableDecrement).toBe(true); // Capo at max
      });
    });
  });

  describe('link toggle', () => {
    it('should toggle linking state', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 0, false));

      expect(result.current.capoTransposeLinked).toBe(false);

      act(() => {
        result.current.handleToggleLink();
      });

      expect(result.current.capoTransposeLinked).toBe(true);

      act(() => {
        result.current.handleToggleLink();
      });

      expect(result.current.capoTransposeLinked).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle both values at maximum simultaneously', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(11, 11, true));

      const capoDisableStates = result.current.getCapoDisableStates();
      const transposeDisableStates = result.current.getTransposeDisableStates();

      expect(capoDisableStates.disableIncrement).toBe(true);
      expect(capoDisableStates.disableDecrement).toBe(true);
      expect(transposeDisableStates.disableIncrement).toBe(true);
      expect(transposeDisableStates.disableDecrement).toBe(true);
    });

    it('should handle both values at minimum simultaneously', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, -11, true));

      const capoDisableStates = result.current.getCapoDisableStates();
      const transposeDisableStates = result.current.getTransposeDisableStates();

      expect(capoDisableStates.disableIncrement).toBe(true);
      expect(capoDisableStates.disableDecrement).toBe(true);
      expect(transposeDisableStates.disableIncrement).toBe(true);
      expect(transposeDisableStates.disableDecrement).toBe(true);
    });

    it('should handle mixed boundary conditions', () => {
      const { result } = renderHook(() => useDesktopControlsLinking(0, 11, true));

      const capoDisableStates = result.current.getCapoDisableStates();
      const transposeDisableStates = result.current.getTransposeDisableStates();

      expect(capoDisableStates.disableIncrement).toBe(false);
      expect(capoDisableStates.disableDecrement).toBe(true); // Capo at min
      expect(transposeDisableStates.disableIncrement).toBe(true); // Transpose at max
      expect(transposeDisableStates.disableDecrement).toBe(false);
    });
  });
});
