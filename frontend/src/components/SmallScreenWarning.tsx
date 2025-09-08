import { memo } from 'react';

/**
 * Uses max-[319px]:flex to show only on screens smaller than 320px
 */
const SmallScreenWarning = memo(() => {
  return (
    <div className="hidden max-[319px]:flex fixed inset-0 z-50 flex items-center justify-center p-4 bg-white">
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
