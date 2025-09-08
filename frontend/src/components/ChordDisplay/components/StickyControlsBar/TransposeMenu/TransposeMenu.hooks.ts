import { useState, useEffect } from 'react';
import { getMaxTransposeLevel, getMinTransposeLevel } from './TransposeMenu.utils';
import type { TransposeMenuProps } from './TransposeMenu.types';

/**
 * Custom hook for managing TransposeMenu state and actions
 * 
 * @param transpose - Current transpose value in semitones
 * @param setTranspose - Function to update transpose value
 * @param defaultTranspose - Original song key value (defaults to 0)
 * @returns Object with state and action handlers
 */
export const useTransposeMenu = ({ 
  transpose, 
  setTranspose, 
  defaultTranspose = 0
}: TransposeMenuProps) => {
  // Track the UI transpose level (separate from actual transpose logic)
  const [uiTransposeLevel, setUiTransposeLevel] = useState(transpose - defaultTranspose);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');

  // Synchronize uiTransposeLevel with actual transpose value when it changes externally
  useEffect(() => {
    setUiTransposeLevel(transpose - defaultTranspose);
  }, [transpose, defaultTranspose]);

  const handleIncrement = () => {
    // Check if we're already at the maximum transpose level (+11 semitones)
    if (uiTransposeLevel >= getMaxTransposeLevel()) {
      // Reset to original key when reaching max
      setTranspose(defaultTranspose);
      setUiTransposeLevel(0);
      return;
    }
    
    const newTranspose = transpose + 1;
    const newUiLevel = uiTransposeLevel + 1;
    
    setAnimationDirection('up');
    setTranspose(newTranspose);
    setUiTransposeLevel(newUiLevel);
  };

  const handleDecrement = () => {
    // Check if we're already at the minimum transpose level (-11 semitones)
    if (uiTransposeLevel <= getMinTransposeLevel()) {
      // Reset to original key when reaching min
      setTranspose(defaultTranspose);
      setUiTransposeLevel(0);
      return;
    }
    
    const newTranspose = transpose - 1;
    const newUiLevel = uiTransposeLevel - 1;
    
    setAnimationDirection('down');
    setTranspose(newTranspose);
    setUiTransposeLevel(newUiLevel);
  };

  const handleReset = () => {
    setTranspose(defaultTranspose);
    setUiTransposeLevel(0);
  };

  // Calculate disable states based on transpose limits only
  const disableIncrement = uiTransposeLevel >= getMaxTransposeLevel();
  const disableDecrement = uiTransposeLevel <= getMinTransposeLevel();

  return {
    uiTransposeLevel,
    isAltered: uiTransposeLevel !== 0,
    handleIncrement,
    handleDecrement,
    handleReset,
    animationDirection,
    disableIncrement,
    disableDecrement
  };
};
