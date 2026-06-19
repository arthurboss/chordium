import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const isDarkModeActive = (): boolean =>
  document.documentElement.classList.contains('dark');

export const isSystemThemeActive = (): boolean =>
  !localStorage.getItem('chordium-theme');

export const getSystemPreference = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getActiveTheme = (): Theme => {
  const theme = localStorage.getItem('chordium-theme');
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return 'system';
};

/**
 * Adds .uses-canvas when app theme matches OS preference so all CSS vars
 * derive from the real browser Canvas color. Removes it when they diverge,
 * falling back to the hardcoded --surface values in :root / .dark.
 */
export const updateCanvasMode = (): void => {
  const appIsDark = isDarkModeActive();
  const osIsDark = getSystemPreference() === 'dark';
  const matches = appIsDark === osIsDark;
  document.documentElement.classList.toggle('uses-canvas', matches);
};

// Suppress all transitions for one frame so theme switches are instant.
// Without this, elements with transition-colors (e.g. buttons) briefly
// animate from the old theme colors to the new ones, causing a visible blink.
const freezeTransitions = (fn: () => void): void => {
  const style = document.createElement('style');
  style.textContent = 'button, [role="button"] { transition: none !important; }';
  document.head.appendChild(style);
  fn();
  // Remove on the next frame — by then the new CSS vars are painted
  requestAnimationFrame(() => document.head.removeChild(style));
};

export const applySystemTheme = (): void => {
  if (getSystemPreference() === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const applyTheme = (theme: Theme): void => {
  freezeTransitions(() => {
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
    updateCanvasMode();
  });
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme>('system');

  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(isDarkModeActive());
      setActiveTheme(getActiveTheme());
      updateCanvasMode();
    };

    const savedTheme = localStorage.getItem('chordium-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      applySystemTheme();
    }

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (isSystemThemeActive()) {
        freezeTransitions(() => {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          updateCanvasMode();
        });
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

  return { isDark, activeTheme, setTheme };
};
