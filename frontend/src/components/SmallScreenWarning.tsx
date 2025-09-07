import { memo } from 'react';

/**
 * React 19 optimized component with CSS-first approach
 * Uses CSS media queries for primary detection, JavaScript as fallback
 * Memoized to prevent unnecessary re-renders
 */
const SmallScreenWarning = memo(() => {
  return (
    <div className="small-screen-warning flex items-center justify-center p-4">
      <div className="text-center text-gray-800 max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">Screen Too Small</h1>
        <p className="text-lg">Please use a device with a bigger screen for the best experience.</p>
      </div>
    </div>
  );
});

SmallScreenWarning.displayName = 'SmallScreenWarning';

export default SmallScreenWarning;
