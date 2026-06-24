import React from 'react';
import { Button } from '../button';
import { X } from 'lucide-react';
import { INCREMENT_DECREMENT_BUTTON_STYLES, INCREMENT_DECREMENT_BUTTON_LABELS } from './IncrementDecrementButton.constants';
import type { IncrementDecrementButtonProps } from './IncrementDecrementButton.types';
import './IncrementDecrementButton.css';


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
  const shouldUseWheel = displayMode === 'wheel' && digits.length > 0;
  const animationValue = wheelValue || value;
  const currentIndex = shouldUseWheel ? digits.indexOf(animationValue) : -1;
  const wheelTransform = currentIndex >= 0 ? `translateY(-${currentIndex * 1.25}rem)` : 'translateY(0)';
  
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
                key={value}
              >
                {value}
              </div>
            </div>
          ) : (
            <div className={INCREMENT_DECREMENT_BUTTON_STYLES.staticDisplay}>
              {(() => {
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

      {/* Reset button - icon only, no border */}
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-5 w-5 p-0 flex-shrink-0 border-none ${!isAltered ? 'opacity-50' : ''}`}
          onClick={!isAltered ? undefined : onReset}
          disabled={!isAltered}
          title={resetTitle}
        >
          <X className="h-2 w-2 text-destructive" />
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
