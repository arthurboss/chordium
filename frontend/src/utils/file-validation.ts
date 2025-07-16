/**
 * Validates if a file has an allowed extension
 */
export const isValidFileType = (file: File): boolean => {
  return file.name.endsWith('.txt') || file.name.endsWith('.text') || file.name.endsWith('.chord');
};
