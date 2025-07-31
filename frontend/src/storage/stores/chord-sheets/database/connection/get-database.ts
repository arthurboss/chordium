/**
 * Database connection singleton for chord sheets storage
 */

import initializeDatabase from './initialization.js';

let databasePromise: Promise<IDBDatabase> | null = null;
let database: IDBDatabase | null = null;

/**
 * @returns Promise that resolves to IDBDatabase instance
 * @throws {Error} When database connection fails
 */
export default function getDatabase(): Promise<IDBDatabase> {
  // If we have a valid cached database connection, return it
  if (database && !database.objectStoreNames.contains('chordSheets')) {
    // Database schema is invalid, reset
    database = null;
    databasePromise = null;
  }
  
  if (database) {
    return Promise.resolve(database);
  }

  // If we already have a pending initialization, return it
  if (databasePromise !== null) {
    return databasePromise;
  }

  // Initialize new database connection
  databasePromise = initializeDatabase().then(db => {
    // Cache the successful connection
    database = db;
    
    // Handle database close events
    db.onclose = () => {
      database = null;
      databasePromise = null;
    };
    
    // Handle database error events
    db.onerror = () => {
      database = null;
      databasePromise = null;
    };
    
    return db;
  }).catch(error => {
    // Reset on error so next call can retry
    databasePromise = null;
    database = null;
    throw error;
  });
  
  return databasePromise;
}
