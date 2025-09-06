import React from 'react';
import { Button } from '../../../ui/button';
import { Undo2 } from 'lucide-react';
import { useKeyMenu } from './KeyMenu.hooks';
import { formatKeyDisplay } from './KeyMenu.utils';
import { KEY_MENU_STYLES, KEY_MENU_LABELS } from './KeyMenu.constants';
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
  songKey
}) => {
  const {
    uiTransposeLevel,
    isAltered,
    handleIncrement,
    handleDecrement,
    handleReset
  } = useKeyMenu({ transpose, setTranspose, defaultTranspose });

  const keyDisplay = formatKeyDisplay(transpose, uiTransposeLevel, songKey);

  return (
    <div className={KEY_MENU_STYLES.container} title='Transpose Song Key'>
      {/* Decrement button */}
      <Button
        variant="ghost"
        size="sm"
        className={KEY_MENU_STYLES.decrementButton}
        onClick={handleDecrement}
      >
        <span className={KEY_MENU_STYLES.buttonText}>{KEY_MENU_LABELS.decrement}</span>
      </Button>

      {/* Vertical divider */}
      <div className={KEY_MENU_STYLES.verticalDivider} />

      {/* Key display */}
      <div className={KEY_MENU_STYLES.displayContainer}>
        <div className={KEY_MENU_STYLES.displayInner}>
          <span className={KEY_MENU_STYLES.keyName}>
            {keyDisplay.keyName}
          </span>
          {keyDisplay.transposeText && (
            <span className={KEY_MENU_STYLES.transposeText}>
              ({keyDisplay.transposeText})
            </span>
          )}
        </div>
      </div>

              {/* Reset button (Undo) - only show when altered */}
        {isAltered && (
          <Button
            variant="ghost"
            size="sm"
            className={KEY_MENU_STYLES.resetButton}
            onClick={handleReset}
            title={KEY_MENU_LABELS.resetTitle}
          >
            <Undo2 size={14} />
          </Button>
        )}

      {/* Vertical divider */}
      <div className={KEY_MENU_STYLES.verticalDivider} />

      {/* Increment button */}
      <Button
        variant="ghost"
        size="sm"
        className={KEY_MENU_STYLES.incrementButton}
        onClick={handleIncrement}
      >
        <span className={KEY_MENU_STYLES.buttonText}>{KEY_MENU_LABELS.increment}</span>
      </Button>
    </div>
  );
};

export default KeyMenu;
