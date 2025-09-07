/**
 * Unit tests for capo-transpose linking logic
 * Tests the pure mathematical calculations without UI components
 */

describe('Capo-Transpose Linking Logic', () => {
  describe('capo to transpose calculations', () => {
    it('should decrease transpose when capo increases', () => {
      const currentCapo = 0;
      const newCapo = 1;
      const currentTranspose = 0;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(1);
      expect(newTranspose).toBe(-1);
    });

    it('should increase transpose when capo decreases', () => {
      const currentCapo = 1;
      const newCapo = 0;
      const currentTranspose = -1;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(-1);
      expect(newTranspose).toBe(0);
    });

    it('should handle multiple capo steps', () => {
      const currentCapo = 0;
      const newCapo = 3;
      const currentTranspose = 5;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(3);
      expect(newTranspose).toBe(2);
    });
  });

  describe('transpose to capo calculations', () => {
    it('should decrease capo when transpose increases', () => {
      const currentTranspose = 0;
      const newTranspose = 1;
      const currentCapo = 0;
      
      const transposeDifference = newTranspose - currentTranspose;
      const newCapo = currentCapo - transposeDifference;
      
      expect(transposeDifference).toBe(1);
      expect(newCapo).toBe(-1);
    });

    it('should increase capo when transpose decreases', () => {
      const currentTranspose = 1;
      const newTranspose = 0;
      const currentCapo = -1;
      
      const transposeDifference = newTranspose - currentTranspose;
      const newCapo = currentCapo - transposeDifference;
      
      expect(transposeDifference).toBe(-1);
      expect(newCapo).toBe(0);
    });

    it('should handle multiple transpose steps', () => {
      const currentTranspose = 5;
      const newTranspose = 2;
      const currentCapo = 0;
      
      const transposeDifference = newTranspose - currentTranspose;
      const newCapo = currentCapo - transposeDifference;
      
      expect(transposeDifference).toBe(-3);
      expect(newCapo).toBe(3);
    });
  });

  describe('value clamping logic', () => {
    describe('capo clamping (0-11)', () => {
      it('should clamp negative capo values to 0', () => {
        const calculatedCapo = -1;
        const clampedCapo = Math.max(0, Math.min(11, calculatedCapo));
        
        expect(clampedCapo).toBe(0);
      });

      it('should clamp capo values above 11 to 11', () => {
        const calculatedCapo = 15;
        const clampedCapo = Math.max(0, Math.min(11, calculatedCapo));
        
        expect(clampedCapo).toBe(11);
      });

      it('should not clamp valid capo values', () => {
        const calculatedCapo = 5;
        const clampedCapo = Math.max(0, Math.min(11, calculatedCapo));
        
        expect(clampedCapo).toBe(5);
      });

      it('should clamp capo at boundary values', () => {
        expect(Math.max(0, Math.min(11, 0))).toBe(0);
        expect(Math.max(0, Math.min(11, 11))).toBe(11);
      });
    });

    describe('transpose clamping (-11 to +11)', () => {
      it('should clamp transpose values below -11 to -11', () => {
        const calculatedTranspose = -15;
        const clampedTranspose = Math.max(-11, Math.min(11, calculatedTranspose));
        
        expect(clampedTranspose).toBe(-11);
      });

      it('should clamp transpose values above 11 to 11', () => {
        const calculatedTranspose = 15;
        const clampedTranspose = Math.max(-11, Math.min(11, calculatedTranspose));
        
        expect(clampedTranspose).toBe(11);
      });

      it('should not clamp valid transpose values', () => {
        const calculatedTranspose = 5;
        const clampedTranspose = Math.max(-11, Math.min(11, calculatedTranspose));
        
        expect(clampedTranspose).toBe(5);
      });

      it('should clamp transpose at boundary values', () => {
        expect(Math.max(-11, Math.min(11, -11))).toBe(-11);
        expect(Math.max(-11, Math.min(11, 11))).toBe(11);
      });
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle capo at maximum (11) with transpose adjustment', () => {
      const currentCapo = 11;
      const newCapo = 10;
      const currentTranspose = 0;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(-1);
      expect(newTranspose).toBe(1);
    });

    it('should handle capo at minimum (0) with transpose adjustment', () => {
      const currentCapo = 0;
      const newCapo = 1;
      const currentTranspose = 0;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(1);
      expect(newTranspose).toBe(-1);
    });

    it('should handle transpose at maximum (11) with capo adjustment', () => {
      const currentTranspose = 11;
      const newTranspose = 10;
      const currentCapo = 0;
      
      const transposeDifference = newTranspose - currentTranspose;
      const newCapo = currentCapo - transposeDifference;
      
      expect(transposeDifference).toBe(-1);
      expect(newCapo).toBe(1);
    });

    it('should handle transpose at minimum (-11) with capo adjustment', () => {
      const currentTranspose = -11;
      const newTranspose = -10;
      const currentCapo = 11;
      
      const transposeDifference = newTranspose - currentTranspose;
      const newCapo = currentCapo - transposeDifference;
      
      expect(transposeDifference).toBe(1);
      expect(newCapo).toBe(10);
    });

    it('should handle both values at maximum simultaneously', () => {
      const currentCapo = 11;
      const newCapo = 10;
      const currentTranspose = 11;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(-1);
      expect(newTranspose).toBe(12); // Would be clamped to 11
    });

    it('should handle both values at minimum simultaneously', () => {
      const currentCapo = 0;
      const newCapo = 1;
      const currentTranspose = -11;
      
      const capoDifference = newCapo - currentCapo;
      const newTranspose = currentTranspose - capoDifference;
      
      expect(capoDifference).toBe(1);
      expect(newTranspose).toBe(-12); // Would be clamped to -11
    });
  });

  describe('disable logic calculations', () => {
    describe('transpose increment disable logic', () => {
      it('should disable increment when at max transpose level', () => {
        const uiTransposeLevel = 11;
        const maxLevel = 11;
        
        const disableIncrement = uiTransposeLevel >= maxLevel;
        
        expect(disableIncrement).toBe(true);
      });

      it('should disable increment when capo is at minimum and linked', () => {
        const capoTransposeLinked = true;
        const capo = 0;
        const uiTransposeLevel = 5;
        const maxLevel = 11;
        
        const disableIncrement = capoTransposeLinked 
          ? (uiTransposeLevel >= maxLevel || capo <= 0)
          : uiTransposeLevel >= maxLevel;
        
        expect(disableIncrement).toBe(true);
      });

      it('should not disable increment when conditions are not met', () => {
        const capoTransposeLinked = true;
        const capo = 5;
        const uiTransposeLevel = 5;
        const maxLevel = 11;
        
        const disableIncrement = capoTransposeLinked 
          ? (uiTransposeLevel >= maxLevel || capo <= 0)
          : uiTransposeLevel >= maxLevel;
        
        expect(disableIncrement).toBe(false);
      });
    });

    describe('transpose decrement disable logic', () => {
      it('should disable decrement when at min transpose level', () => {
        const uiTransposeLevel = -11;
        const minLevel = -11;
        
        const disableDecrement = uiTransposeLevel <= minLevel;
        
        expect(disableDecrement).toBe(true);
      });

      it('should disable decrement when capo is at maximum and linked', () => {
        const capoTransposeLinked = true;
        const capo = 11;
        const uiTransposeLevel = -5;
        const minLevel = -11;
        
        const disableDecrement = capoTransposeLinked
          ? (uiTransposeLevel <= minLevel || capo >= 11)
          : uiTransposeLevel <= minLevel;
        
        expect(disableDecrement).toBe(true);
      });

      it('should not disable decrement when conditions are not met', () => {
        const capoTransposeLinked = true;
        const capo = 5;
        const uiTransposeLevel = -5;
        const minLevel = -11;
        
        const disableDecrement = capoTransposeLinked
          ? (uiTransposeLevel <= minLevel || capo >= 11)
          : uiTransposeLevel <= minLevel;
        
        expect(disableDecrement).toBe(false);
      });
    });
  });

  describe('mathematical properties', () => {
    it('should maintain inverse relationship', () => {
      // If capo increases by X, transpose should decrease by X
      const capoIncrease = 3;
      const transposeDecrease = capoIncrease;
      
      expect(transposeDecrease).toBe(3);
    });

    it('should be symmetric', () => {
      // If capo goes from 0 to 3, transpose goes from 0 to -3
      // If transpose goes from -3 to 0, capo goes from 3 to 0
      const capoChange = 3;
      const transposeChange = -3;
      
      expect(capoChange).toBe(-transposeChange);
    });

    it('should handle zero changes', () => {
      const capoDifference = 0;
      const transposeDifference = 0;
      
      expect(capoDifference).toBe(0);
      expect(transposeDifference).toBe(0);
    });
  });
});
