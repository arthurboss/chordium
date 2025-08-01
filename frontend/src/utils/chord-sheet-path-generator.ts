/**
 * @deprecated Use chord-sheet-path utilities instead
 * This file provides backward compatibility exports
 */

export { 
  generateChordSheetPath as generateChordSheetId,
  parseChordSheetPath as parseChordSheetId,
  chordSheetPathToStoragePath as chordSheetIdToPath
} from "./chord-sheet-path";
