import { useState } from 'react';
import { getMaxTransposeLevel, getMinTransposeLevel } from './KeyMenu.utils';
import type { KeyMenuProps } from './KeyMenu.types';

/**
 * Custom hook for managing KeyMenu state and actions
 * 
 * @param transpose - Current transpose value in semitones
 * @param setTranspose - Function to update transpose value
 * @param defaultTranspose - Original song key value (defaults to 0)
 * @returns Object with state and action handlers
 */
export const useKeyMenu = ({ 
  transpose, 
  setTranspose, 
  defaultTranspose = 0,
  capoTransposeLinked = false,
  capo = 0
}: KeyMenuProps) => {
  // Track the UI transpose level (separate from actual transpose logic)
  const [uiTransposeLevel, setUiTransposeLevel] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');

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

  // Calculate disable states considering linked capo
  const disableIncrement = capoTransposeLinked 
    ? (uiTransposeLevel >= getMaxTransposeLevel() || capo <= 0) // Can't increment if at max transpose OR capo would go below 0
    : uiTransposeLevel >= getMaxTransposeLevel();
    
  const disableDecrement = capoTransposeLinked
    ? (uiTransposeLevel <= getMinTransposeLevel() || capo >= 11) // Can't decrement if at min transpose OR capo would go above 11
    : uiTransposeLevel <= getMinTransposeLevel();

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
