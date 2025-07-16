// Display utility functions for Chordium app

/**
 * Interface extending Screen with the optional refresh property
 * This is used for modern browsers that support the Screen Refresh Rate API
 */
interface ScreenWithRefreshRate extends Screen {
  refresh?: number;
}

/**
 * Gets the display refresh rate using available browser APIs
 * Falls back to 60Hz if unable to determine
 * @returns A promise that resolves to the display's refresh rate in Hz
 */
export function getDisplayRefreshRate(): Promise<number> {
  return new Promise<number>((resolve) => {
    // Default to 60 if we can't determine the refresh rate
    const defaultFPS = 60;
    
    // Try to use the Screen Refresh Rate API if available
    if ('screen' in window && 'refresh' in (window.screen as ScreenWithRefreshRate)) {
      const screenWithRefresh = window.screen as ScreenWithRefreshRate;
      resolve(Math.max(screenWithRefresh.refresh || defaultFPS, defaultFPS));
      return;
    }
    
    // Fallback to requestAnimationFrame timing
    let frameCount = 0;
    let startTime: number;
    
    const countFrames = (timestamp: number) => {
      if (frameCount === 0) {
        startTime = timestamp;
        frameCount = 1;
        requestAnimationFrame(countFrames);
        return;
      }
      
      frameCount++;
      
      // Measure for ~1 second
      if (timestamp - startTime < 1000) {
        requestAnimationFrame(countFrames);
      } else {
        // Calculate FPS and resolve with the higher of calculated or default
        const calculatedFPS = Math.round((frameCount * 1000) / (timestamp - startTime));
        resolve(Math.max(calculatedFPS, defaultFPS));
      }
    };
    
    // Start immediately with fallback in case measurement fails
    setTimeout(() => resolve(defaultFPS), 1000);
    requestAnimationFrame(countFrames);
  });
}