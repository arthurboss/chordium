import { useEffect, useState } from 'react';

// Global variables (can be updated at runtime)
export let FOOTER_HEIGHT = 0;
export let NAVBAR_HEIGHT = 0;

// Function to update the global variables by measuring DOM elements
export function updateLayoutHeights() {
  const footer = document.querySelector('footer');
  const navbar = document.querySelector('header');
  FOOTER_HEIGHT = footer ? footer.getBoundingClientRect().height : 0;
  NAVBAR_HEIGHT = navbar ? navbar.getBoundingClientRect().height : 0;
}

// React hook to get the current heights and keep them updated
export function useLayoutHeights() {
  const [heights, setHeights] = useState({
    footer: FOOTER_HEIGHT,
    navbar: NAVBAR_HEIGHT,
  });

  useEffect(() => {
    function handleResize() {
      updateLayoutHeights();
      setHeights({
        footer: FOOTER_HEIGHT,
        navbar: NAVBAR_HEIGHT,
      });
    }
    // Initial measurement
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return heights;
}
