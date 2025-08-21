/**
 * Database schema validation utilities
 */

import { STORES } from "../../../../core/config/stores";

/**
 * Validate that the database has the required object stores
 * @param db - The IndexedDB database instance to validate
 * @returns true if all required stores exist, false otherwise
 */
export function hasValidSchema(db: IDBDatabase): boolean {
  return (
    db.objectStoreNames.contains(STORES.CHORD_SHEETS) &&
    db.objectStoreNames.contains(STORES.SEARCH_CACHE)
  );
}
