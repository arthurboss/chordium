import { DB_NAME, DB_VERSION } from "../../../../core/config/database";
import createSchema from "./create-schema";

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
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        createSchema(db);
      };
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to setup database");
  }
}
