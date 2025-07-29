/**
 * Database name and version configuration for IndexedDB
 */

/** Database name for IndexedDB */
export const DB_NAME = 'Chordium';

/** Database version for IndexedDB */
export const DB_VERSION = 1; // Reset to 1 after deleting old database

/**
 * Delete the existing IndexedDB database to start fresh
 * This is needed when we want to reset the database version
 */
export const deleteDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onerror = () => reject(new Error(`Failed to delete database: ${deleteRequest.error?.message || 'Unknown error'}`));
    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onblocked = () => {
      reject(new Error('Database deletion blocked - close all tabs and connections'));
    };
  });
}
