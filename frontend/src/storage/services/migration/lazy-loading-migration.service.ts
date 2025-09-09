/**
 * Service to handle migration to lazy loading format
 */

import { getDatabase } from "../../stores/chord-sheets/database/connection";
import { migrateToLazyLoading } from "../../stores/chord-sheets/migrations/migrate-to-lazy-loading";

/**
 * Service to handle migration from legacy chord sheet storage to lazy loading format
 */
export class LazyLoadingMigrationService {
  private static migrationCompleted = false;
  private static migrationPromise: Promise<void> | null = null;

  /**
   * Ensures migration to lazy loading format is completed
   * This should be called once during app initialization
   * 
   * @returns Promise that resolves when migration is complete
   */
  static async ensureMigrationCompleted(): Promise<void> {
    if (this.migrationCompleted) {
      return;
    }

    if (this.migrationPromise) {
      return this.migrationPromise;
    }

    this.migrationPromise = this.performMigration();
    return this.migrationPromise;
  }

  /**
   * Performs the actual migration
   */
  private static async performMigration(): Promise<void> {
    try {
      const db = await getDatabase();
      await migrateToLazyLoading(db);
      this.migrationCompleted = true;
      console.log('Lazy loading migration completed successfully');
    } catch (error) {
      console.error('Lazy loading migration failed:', error);
      // Don't throw - let the app continue with the new schema
      // Users will just need to re-fetch their chord sheets
    }
  }

  /**
   * Checks if migration has been completed
   */
  static isMigrationCompleted(): boolean {
    return this.migrationCompleted;
  }
}
