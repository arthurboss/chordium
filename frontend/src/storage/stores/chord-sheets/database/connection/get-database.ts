/**
 * Database connection singleton for chord sheets storage
 */

import initializeDatabase from "./initialization";
import { hasValidSchema } from "./schema-validator";

let databasePromise: Promise<IDBDatabase> | null = null;
let database: IDBDatabase | null = null;

/**
 * Reset the cached database connection and promise
 */
function resetConnection(): void {
  database = null;
  databasePromise = null;
}

/**
 * @returns Promise that resolves to IDBDatabase instance
 * @throws {Error} When database connection fails
 */
export default function getDatabase(): Promise<IDBDatabase> {
  // If we have a cached database, validate its schema
  if (database) {
    if (!hasValidSchema(database)) {
      // Database schema is invalid, reset and reinitialize
      resetConnection();
    } else {
      // Database is valid, return it
      return Promise.resolve(database);
    }
  }

  // If we already have a pending initialization, return it
  if (databasePromise !== null) {
    return databasePromise;
  }

  // Initialize new database connection
  databasePromise = initializeDatabase()
    .then((db) => {
      // Cache the successful connection
      database = db;

      // Handle database close and error events
      db.onclose = resetConnection;
      db.onerror = resetConnection;

      return db;
    })
    .catch((error) => {
      // Reset on error so next call can retry
      resetConnection();
      throw error;
    });

  return databasePromise;
}
