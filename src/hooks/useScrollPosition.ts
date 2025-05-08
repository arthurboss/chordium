
import { useState, useEffect } from 'react';

export const useScrollPosition = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 100; // pixels from bottom to trigger the change

      setIsAtBottom(scrollPosition >= documentHeight - threshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isAtBottom };
};
