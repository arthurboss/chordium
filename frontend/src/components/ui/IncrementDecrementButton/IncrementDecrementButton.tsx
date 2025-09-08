import React from 'react';
import { Button } from '../button';
import { Undo2 } from 'lucide-react';
import { INCREMENT_DECREMENT_BUTTON_STYLES, INCREMENT_DECREMENT_BUTTON_LABELS } from './IncrementDecrementButton.constants';
import type { IncrementDecrementButtonProps } from './IncrementDecrementButton.types';

/**
 * Generic IncrementDecrementButton component
 * Provides increment/decrement buttons with optional reset functionality
 * 
 * @param value - Current value to display
 * @param onIncrement - Function to call when increment button is clicked
 * @param onDecrement - Function to call when decrement button is clicked
 * @param onReset - Optional function to call when reset button is clicked
 * @param showReset - Whether to show the reset button
 * @param title - Optional title for the component
 * @param incrementLabel - Label for increment button (defaults to '+')
 * @param decrementLabel - Label for decrement button (defaults to '−')
 * @param resetTitle - Title for reset button tooltip
 * @param className - Additional CSS classes
 */
const IncrementDecrementButton: React.FC<IncrementDecrementButtonProps> = ({
  value,
  onIncrement,
  onDecrement,
  onReset,
  isAltered = false,
  title,
  incrementLabel = INCREMENT_DECREMENT_BUTTON_LABELS.increment,
  decrementLabel = INCREMENT_DECREMENT_BUTTON_LABELS.decrement,
  resetTitle = INCREMENT_DECREMENT_BUTTON_LABELS.resetTitle,
  className = '',
  disableIncrement = false,
  disableDecrement = false,
  animationDirection = 'up',
  digits = [],
  wheelValue,
  displayMode = 'wheel'
}) => {
  // Calculate wheel animation only if in wheel mode and digits are provided
  const shouldUseWheel = displayMode === 'wheel' && digits.length > 0;
  const animationValue = wheelValue || value;
  const currentIndex = shouldUseWheel ? digits.indexOf(animationValue) : -1;
  const wheelTransform = currentIndex >= 0 ? `translateY(-${currentIndex * 1.5}rem)` : 'translateY(0)';
  return (
    <div className={`${INCREMENT_DECREMENT_BUTTON_STYLES.container} ${className}`} title={title}>
      {/* Decrement button */}
      <Button
        variant="ghost"
        size="sm"
        className={disableDecrement ? INCREMENT_DECREMENT_BUTTON_STYLES.disabledButton : INCREMENT_DECREMENT_BUTTON_STYLES.decrementButton}
        onClick={disableDecrement ? undefined : onDecrement}
        disabled={disableDecrement}
      >
        <span className={INCREMENT_DECREMENT_BUTTON_STYLES.buttonText}>{decrementLabel}</span>
      </Button>

      {/* Vertical divider */}
      <div className={INCREMENT_DECREMENT_BUTTON_STYLES.verticalDivider} />

      {/* Value display - Mechanical Lock Wheel, Static Text, or Slide Transition */}
      <div className={INCREMENT_DECREMENT_BUTTON_STYLES.displayContainer}>
        <div className={INCREMENT_DECREMENT_BUTTON_STYLES.displayInner}>
          {shouldUseWheel ? (
            <div 
              className={INCREMENT_DECREMENT_BUTTON_STYLES.lockWheel}
              style={{ transform: wheelTransform }}
            >
              <div className={INCREMENT_DECREMENT_BUTTON_STYLES.digitsContainer}>
                {digits.map((digit, index) => (
                  <div key={index} className={INCREMENT_DECREMENT_BUTTON_STYLES.digit}>
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          ) : displayMode === 'slide' ? (
            <div className={INCREMENT_DECREMENT_BUTTON_STYLES.slideContainer}>
              {/* Current value with CSS animation */}
              <div 
                className={`${INCREMENT_DECREMENT_BUTTON_STYLES.slideText} ${
                  animationDirection === 'up' 
                    ? INCREMENT_DECREMENT_BUTTON_STYLES.slideTextUp 
                    : INCREMENT_DECREMENT_BUTTON_STYLES.slideTextDown
                }`}
                key={value} // Force re-render and animation restart when value changes
              >
                {value}
              </div>
            </div>
          ) : (
            <div className={INCREMENT_DECREMENT_BUTTON_STYLES.staticDisplay}>
              {(() => {
                // Parse complex values like "Cm (+½)" into main text and sub text
                const match = value.match(/^(.+?)\s*\((.+?)\)$/);
                if (match) {
                  const [, mainText, subText] = match;
                  return (
                    <>
                      <span className={INCREMENT_DECREMENT_BUTTON_STYLES.staticMainText}>
                        {mainText}
                      </span>
                      <span className={INCREMENT_DECREMENT_BUTTON_STYLES.staticSubText}>
                        ({subText})
                      </span>
                    </>
                  );
                }
                // Fallback for simple values
                return (
                  <span className={INCREMENT_DECREMENT_BUTTON_STYLES.staticMainText}>
                    {value}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Reset button - always visible but disabled when not altered */}
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          className={!isAltered ? INCREMENT_DECREMENT_BUTTON_STYLES.disabledResetButton : INCREMENT_DECREMENT_BUTTON_STYLES.resetButton}
          onClick={!isAltered ? undefined : onReset}
          disabled={!isAltered}
          title={resetTitle}
        >
          <Undo2 size={14} />
        </Button>
      )}

      {/* Vertical divider */}
      <div className={INCREMENT_DECREMENT_BUTTON_STYLES.verticalDivider} />

      {/* Increment button */}
      <Button
        variant="ghost"
        size="sm"
        className={disableIncrement ? INCREMENT_DECREMENT_BUTTON_STYLES.disabledButton : INCREMENT_DECREMENT_BUTTON_STYLES.incrementButton}
        onClick={disableIncrement ? undefined : onIncrement}
        disabled={disableIncrement}
      >
        <span className={INCREMENT_DECREMENT_BUTTON_STYLES.buttonText}>{incrementLabel}</span>
      </Button>
    </div>
  );
};

export default IncrementDecrementButton;
