import React from 'react';
import BlinkingArrow from '../BlinkingArrow';
import { getJumpingAnimation } from './getJumpingAnimation';
import { ScrollArrowProps } from './ScrollArrow.types';
import { useAtBottom } from '@/hooks/useAtBottom';

/**
 * ScrollArrow
 *
 * A button component that displays a blinking arrow (up or down) for scroll navigation.
 * It automatically determines if the scrollable container is at the bottom and changes direction, label, and scroll behavior accordingly.
 *
 * @param parentRef - React ref to the scrollable container (HTMLElement)
 * @param getTotalSize - Function that returns the total scrollable height (e.g., from a virtualizer)
 * @param className - Additional CSS classes for styling
 * @param style - Inline styles for the button
 *
 * The button scrolls down by one viewport if not at the bottom, or scrolls to the top if at the bottom.
 * The arrow direction and accessible label are set automatically.
 */

const ScrollArrow: React.FC<ScrollArrowProps> = ({
  parentRef,
  getTotalSize,
  className = '',
  style = {},
}) => {
  const isAtBottom = useAtBottom({ ref: parentRef, getTotalSize });
  const direction = isAtBottom ? 'up' : 'down';
  const label = isAtBottom ? 'Scroll to top' : 'Scroll down';

  const handleClick = React.useCallback(() => {
    if (parentRef.current) {
      const el = parentRef.current;
      if (isAtBottom) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
      }
    }
  }, [isAtBottom, parentRef]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        className={`animate-pulse pointer-events-auto bg-transparent border-none outline-none rounded-full hover:text-primary ${className}`}
        style={{ animation: getJumpingAnimation(direction), ...style }}
        onClick={handleClick}
      >
        <BlinkingArrow direction={direction} label={label} />
      </button>
      <style>
        {`
        @keyframes moveDown {
          0% { transform: translateY(0); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0); }
        }
        @keyframes moveRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(12px); }
          100% { transform: translateX(0); }
        }
        @keyframes moveLeft {
          0% { transform: translateX(0); }
          50% { transform: translateX(-12px); }
          100% { transform: translateX(0); }
        }
        @keyframes moveUp {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
      `}
      </style>
    </>
  );
};

export default ScrollArrow;
