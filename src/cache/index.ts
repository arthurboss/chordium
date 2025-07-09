// Main cache system exports
export { ChordSheetRepository } from "./storage/indexeddb/repositories/chord-sheet-repository";
export { SearchCacheRepository } from "./storage/indexeddb/repositories/search-cache-repository";
export { IndexedDBCacheCoordinator } from "./coordinators/indexed-db-cache-coordinator";

// Cache implementations
export { unifiedChordSheetCache } from "./implementations/unified-chord-sheet";

// Cache functions
export {
  cacheSearchResults,
  getCachedSearchResults,
  clearSearchCache,
  clearExpiredSearchCache,
} from "./implementations/search-cache";

export {
  cacheChordSheet,
  getCachedChordSheetByPath,
  clearChordSheetCache,
  clearExpiredChordSheetCache,
  getAllChordSheets,
  removeChordSheetByPath,
} from "./implementations/unified-chord-sheet";

// Types
export type { ChordSheetRecord, ChordSheetMetadata } from "./core/types";

// Cache utilities
export { saveChordSheet } from "./utils/saveChordSheet";
export { deleteChordSheet } from "./utils/deleteChordSheet";
export { debugCache, clearAllCaches } from "./utils/debug";
export {
  handleSaveNewChordSheetFromUI,
  handleUpdateChordSheetFromUI,
  handleDeleteChordSheetFromUI,
} from "./utils/ui-operations";
