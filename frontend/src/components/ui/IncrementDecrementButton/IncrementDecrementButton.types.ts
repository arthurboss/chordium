export interface IncrementDecrementButtonProps {
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset?: () => void;
  isAltered?: boolean;
  title?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  resetTitle?: string;
  className?: string;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
  animationDirection?: 'up' | 'down';
  digits?: string[]; // Made optional for display-only mode
  wheelValue?: string; // Optional separate value for wheel animation
  displayMode?: 'wheel' | 'static' | 'slide'; // New prop to control display mode
}
