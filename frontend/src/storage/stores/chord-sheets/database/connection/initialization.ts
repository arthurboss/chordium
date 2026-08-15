import { DB_NAME, DB_VERSION } from "../../../../core/config/database";
import { handleIndexedDBMigrations } from "./migration-handler";

/**
 * @returns Promise that resolves to initialized IDBDatabase
 * @throws {Error} When database setup fails
 */
export default async function initializeDatabase(): Promise<IDBDatabase> {
  try {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () =>
        reject(
          new Error(
            `Failed to open database: ${request.error?.message || "Unknown error"}`
          )
        );
      // Another tab holding the previous version blocks the upgrade. Report it
      // rather than waiting for a release that may never come.
      request.onblocked = () =>
        reject(
          new Error(
            "Database upgrade is blocked by another open tab. Close it and reload."
          )
        );
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const target = event.target as IDBOpenDBRequest;
        const db = target.result;
        const oldVersion = event.oldVersion || 0;
        const newVersion = event.newVersion || DB_VERSION;
        handleIndexedDBMigrations(db, oldVersion, newVersion, target.transaction);
      };
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to setup database");
  }
}
