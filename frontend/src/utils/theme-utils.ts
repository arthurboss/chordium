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

// Sample the browser's Canvas color and return its OKLCH hue.
// Falls back to 275 (royal violet) when Canvas is near-neutral (chroma < threshold).
const sRGBToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const getCanvasHue = (): number => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 275;

  // Draw Canvas system color into a 1×1 pixel
  ctx.fillStyle = 'Canvas';
  ctx.fillRect(0, 0, 1, 1);
  const [r8, g8, b8] = ctx.getImageData(0, 0, 1, 1).data;

  // sRGB [0,255] → linear [0,1]
  const r = sRGBToLinear(r8 / 255);
  const g = sRGBToLinear(g8 / 255);
  const b = sRGBToLinear(b8 / 255);

  // Linear sRGB → Oklab
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bk = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  const chroma = Math.sqrt(a * a + bk * bk);

  // If Canvas is near-neutral, fall back to brand default
  if (chroma < 0.015) return 275;

  const hue = (Math.atan2(bk, a) * 180) / Math.PI;
  return hue < 0 ? hue + 360 : hue;
};

// Write --hue to :root so all CSS palette tokens rotate with Canvas.
export const updateHue = (): void => {
  const hue = getCanvasHue();
  document.documentElement.style.setProperty('--hue', String(Math.round(hue)));
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
  updateHue();
};

// Suppress all transitions for one frame during theme switch so everything
// snaps instantly instead of animating from old theme colors to new.
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

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
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
