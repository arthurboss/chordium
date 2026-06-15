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
