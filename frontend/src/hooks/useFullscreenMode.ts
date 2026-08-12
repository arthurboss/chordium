import { useState, useEffect } from 'react';

export function useFullscreenMode() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = () => {
    const elem = document.getElementById('chord-sheet-viewer');
    if (!isFullscreen) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.error('Fullscreen request failed:', err));
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error('Exit fullscreen failed:', err));
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return { isFullscreen, toggle };
}
