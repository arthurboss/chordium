import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Checks if dark mode is currently active by examining document classes
 */
export const isDarkModeActive = (): boolean => {
  return document.documentElement.classList.contains('dark');
};

/**
 * Checks if theme is set to system preference (no localStorage theme)
 */
export const isSystemThemeActive = (): boolean => {
  return !localStorage.getItem('chordium-theme');
};

/**
 * Applies the appropriate theme to the document
 */
export const applyTheme = (theme: Theme): void => {
  switch (theme) {
    case 'light':
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chordium-theme', 'light');
      break;
    case 'dark':
      document.documentElement.classList.add('dark');
      localStorage.setItem('chordium-theme', 'dark');
      break;
    case 'system':
      localStorage.removeItem('chordium-theme');
      applySystemTheme();
      break;
  }
};

/**
 * Gets the current system color scheme preference
 */
export const getSystemPreference = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Applies the system theme preference
 */
export const applySystemTheme = (): void => {
  const systemPreference = getSystemPreference();
  if (systemPreference === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Gets the currently active theme
 */
export const getActiveTheme = (): Theme => {
  const theme = localStorage.getItem('chordium-theme');
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return 'system';
};

/**
 * Custom hook to manage theme state and handling
 */
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme>('system');
  
  // Initialize and manage theme
  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(isDarkModeActive());
      setActiveTheme(getActiveTheme());
    };
    
    // Initial theme setup on component mount
    const savedTheme = localStorage.getItem('chordium-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      applySystemTheme();
    }
    
    // Update states after DOM is modified
    updateThemeState();
    
    // Create mutation observer for class changes on the html element
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (isSystemThemeActive()) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // The MutationObserver will catch this and update the state
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);
  
  const setTheme = (theme: Theme) => {
    applyTheme(theme);
    setActiveTheme(theme);
    setIsDark(theme === 'dark' || (theme === 'system' && getSystemPreference() === 'dark'));
  };

  return {
    isDark,
    activeTheme,
    setTheme
  };
};
