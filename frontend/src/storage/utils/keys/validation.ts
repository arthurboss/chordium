/**
 * Key validation utilities
 */

import { KEY_FORMATS } from "./formats";

/**
 * Validates that a key follows the expected format
 * @param key - The key to validate
 * @param type - The expected key type
 * @returns true if key format is valid
 */
export function validateKeyFormat(
  key: string,
  type: keyof typeof KEY_FORMATS
): boolean {
  switch (type) {
    case "chordSheet":
    case "songSearch":
      // Should contain exactly one slash (artist-path/song-path)
      return key.includes("/") && key.split("/").length === 2;
    case "artistSearch":
      // Should not contain slashes (just artist-path)
      return !key.includes("/") && key.length > 0;
    default:
      return false;
  }
}
