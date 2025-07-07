/**
 * Utility to clean up migration-related data that should no longer exist
 * This removes temporary migration flags and ensures clean state
 */
export const cleanupMigrationData = (): void => {
  console.log('🧹 Cleaning up migration data...');
  
  // Remove migration flag from localStorage (it's temporary)
  localStorage.removeItem('chordium-indexeddb-migration-completed');
  
  // Also clean up any legacy cache data that might still exist
  localStorage.removeItem('chordium-chord-sheet-cache');
  localStorage.removeItem('chord-sheet-cache');
  localStorage.removeItem('my-chord-sheets');
  localStorage.removeItem('myChordSheets');
  localStorage.removeItem('my-chord-sheets-cache');
  
  console.log('✅ Migration data cleanup completed');
};

/**
 * Check if there's any stale migration data
 */
export const hasStaleMigrationData = (): boolean => {
  const staleKeys = [
    'chordium-indexeddb-migration-completed',
    'chordium-chord-sheet-cache',
    'chord-sheet-cache',
    'my-chord-sheets',
    'myChordSheets',
    'my-chord-sheets-cache'
  ];
  
  return staleKeys.some(key => localStorage.getItem(key) !== null);
};

// Make cleanup function available globally for debugging
declare global {
  interface Window {
    cleanupMigrationData: () => void;
    hasStaleMigrationData: () => boolean;
  }
}

// Expose functions globally in browser environment
if (typeof window !== 'undefined') {
  window.cleanupMigrationData = cleanupMigrationData;
  window.hasStaleMigrationData = hasStaleMigrationData;
}
