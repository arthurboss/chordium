import React from 'react';
import IncrementDecrementButton from '../IncrementDecrementButton';
import { useKeyMenu } from './KeyMenu.hooks';
import { formatKeyDisplay } from './KeyMenu.utils';
import { ALL_POSSIBLE_KEY_NAMES } from '@/music/constants/musicalKeys';
import type { KeyMenuProps } from './KeyMenu.types';

/**
 * KeyMenu component for transposing chord sheets
 * Provides increment/decrement buttons and displays current key with transpose level
 * 
 * @param transpose - Current transpose value in semitones
 * @param setTranspose - Function to update transpose value
 * @param defaultTranspose - Original song key value (defaults to 0)
 */
const KeyMenu: React.FC<KeyMenuProps> = ({
  transpose,
  setTranspose,
  defaultTranspose = 0,
  songKey,
  title = "Transpose Song Key"
}) => {
  const {
    uiTransposeLevel,
    isAltered,
    handleIncrement,
    handleDecrement,
    handleReset,
    animationDirection
  } = useKeyMenu({ transpose, setTranspose, defaultTranspose });

  const keyDisplay = formatKeyDisplay(transpose, uiTransposeLevel, songKey);

  return (
    <>
      <div className={`text-xs text-muted-foreground mb-1 flex items-center justify-between gap-1 ${isAltered ? 'w-24' : 'w-20'}`}>
        <span>{title}</span>
        <span className="text-muted-foreground">
          {keyDisplay.transposeText && ` (${keyDisplay.transposeText})`}
        </span>
      </div>
      <IncrementDecrementButton
        value={keyDisplay.keyName} // Just the key name (e.g., "Cm")
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onReset={handleReset}
        isAltered={isAltered}
        title="Transpose Song Key"
        resetTitle="Reset to original song key"
        disableIncrement={false}
        disableDecrement={false}
        animationDirection={animationDirection}
        digits={ALL_POSSIBLE_KEY_NAMES} // Use all possible key names for mechanical lock wheel
      />
    </>
  );
};

export default KeyMenu;
