/**
 * Database connection utility for chord sheets store
 * 
 * Provides database connection management for chord sheet storage operations.
 * Reuses existing database configuration and ensures consistent schema.
 */

import { DB_NAME, DB_VERSION, deleteDatabase } from '../../../core/config/database';
import { STORES } from '../../../core/config/stores';
import { INDEXES } from '../../../core/config/indexes';

// Singleton to ensure we only initialize the database once
let databasePromise: Promise<IDBDatabase> | null = null;

/**
 * Get IndexedDB database connection with chord sheets store
 * 
 * Uses singleton pattern to ensure database is only created once per session.
 * First call deletes any existing database and creates a fresh one with version 1.
 * 
 * @returns Promise that resolves to IDBDatabase instance
 * @throws {Error} When database connection fails or upgrade is needed
 */
export const getDatabase = (): Promise<IDBDatabase> => {
  // Return existing promise if already initialized
  if (databasePromise !== null) {
    return databasePromise;
  }

  // Create and cache the database initialization promise
  databasePromise = initializeDatabase();
  return databasePromise;
};

/**
 * Initialize the database - only called once per session
 */
async function initializeDatabase(): Promise<IDBDatabase> {
  try {
    // First delete the existing database to start fresh
    await deleteDatabase();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(new Error(`Failed to open database: ${request.error?.message || 'Unknown error'}`));
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create chord sheets store with song path as key
        const store = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
        
        // Create indexes using the correct INDEXES configuration
        const indexes = INDEXES.chordSheets;
        store.createIndex('artist', indexes.artist, { unique: false });
        store.createIndex('title', indexes.title, { unique: false });
        store.createIndex('saved', indexes.saved, { unique: false });
        store.createIndex('lastAccessed', indexes.lastAccessed, { unique: false });
        store.createIndex('timestamp', indexes.timestamp, { unique: false });
        store.createIndex('expiresAt', indexes.expiresAt, { unique: false });
      };
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to setup database');
  }
}
