/**
 * Database connection singleton for chord sheets storage
 */

import initializeDatabase from './initialization.js';

let databasePromise: Promise<IDBDatabase> | null = null;

/**
 * @returns Promise that resolves to IDBDatabase instance
 * @throws {Error} When database connection fails
 */
export default function getDatabase(): Promise<IDBDatabase> {
  if (databasePromise !== null) {
    return databasePromise;
  }

  databasePromise = initializeDatabase();
  return databasePromise;
}
