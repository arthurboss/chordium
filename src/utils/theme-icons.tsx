import { Laptop, Moon, Sun } from "lucide-react";
import React from "react";
import { type Theme } from "./theme-utils";

export interface ThemeIconItem {
  theme: Theme;
  icon: React.ReactNode;
  label: string;
}

export const themeIcons: ThemeIconItem[] = [
  {
    theme: 'light',
    icon: <Sun className="mr-2 h-4 w-4" />,
    label: 'Light'
  },
  {
    theme: 'dark',
    icon: <Moon className="mr-2 h-4 w-4" />,
    label: 'Dark'
  },
  {
    theme: 'system',
    icon: <Laptop className="mr-2 h-4 w-4" />,
    label: 'System'
  }
];

/**
 * Returns the icon for the current theme state based on whether dark mode is active
 */
export const getThemeToggleIcon = (isDark: boolean): React.ReactNode => {
  return isDark ? <Sun size={20} /> : <Moon size={20} />;
};

/**
 * Get theme icon by theme type - more efficient than conditionals
 * @param theme The theme to get the icon for
 * @param size Optional size for the icon (defaults to 20)
 */
export const getIconByTheme = (theme: Theme, size: number = 20): React.ReactNode => {
  const iconMap: Record<Theme, React.ReactNode> = {
    'light': <Sun size={size} />,
    'dark': <Moon size={size} />,
    'system': <Laptop size={size} />
  };
  
  return iconMap[theme];
};
