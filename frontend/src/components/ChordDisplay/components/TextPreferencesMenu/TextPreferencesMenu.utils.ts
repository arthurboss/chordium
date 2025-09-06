import { TEXT_PREFERENCES_VALUES } from './TextPreferencesMenu.constants';

/**
 * Gets the display text for font spacing multiplier
 * 
 * @param fontSpacing - Current font spacing value
 * @returns Display text for the spacing multiplier
 */
export const getFontSpacingDisplay = (fontSpacing: number): string => {
  return TEXT_PREFERENCES_VALUES.spacingMultipliers[fontSpacing as keyof typeof TEXT_PREFERENCES_VALUES.spacingMultipliers] || 'x1';
};

/**
 * Checks if a view mode is currently active
 * 
 * @param currentMode - Current view mode
 * @param targetMode - Target view mode to check
 * @returns True if the target mode is active
 */
export const isViewModeActive = (currentMode: string, targetMode: string): boolean => {
  return currentMode === targetMode;
};

/**
 * Checks if a font style is currently active
 * 
 * @param currentStyle - Current font style
 * @param targetStyle - Target font style to check
 * @returns True if the target style is active
 */
export const isFontStyleActive = (currentStyle: string, targetStyle: string): boolean => {
  return currentStyle === targetStyle;
};
