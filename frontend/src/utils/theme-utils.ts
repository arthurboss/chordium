import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const isDarkModeActive = (): boolean =>
  document.documentElement.classList.contains('dark');

export const isSystemThemeActive = (): boolean =>
  !localStorage.getItem('chordium-theme');

export const getSystemPreference = (): 'light' | 'dark' =>
  globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getActiveTheme = (): Theme => {
  const theme = localStorage.getItem('chordium-theme');
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return 'system';
};

const freezeTransitions = (fn: () => void): void => {
  document.documentElement.dataset.themeSwitching = '';
  fn();
  requestAnimationFrame(() => delete document.documentElement.dataset.themeSwitching);
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
  });
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme>('system');

  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(isDarkModeActive());
      setActiveTheme(getActiveTheme());
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

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (isSystemThemeActive()) {
        freezeTransitions(() => {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
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
