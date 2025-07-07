/**
 * IndexedDB Migration Integration
 * Provides a simple way to run the IndexedDB migration in production
 * Follows SRP: Single responsibility for migration coordination
 */

import { IndexedDBMigrationService } from './migration/indexeddb-migration-service';

/**
 * Production-ready migration runner
 * Call this on app startup to migrate localStorage data to IndexedDB
 */
export async function runIndexedDBMigration(): Promise<void> {
  const migrationService = new IndexedDBMigrationService();

  try {
    // Check if migration is needed
    if (migrationService.isMigrationCompleted()) {
      console.log('✅ IndexedDB migration already completed');
      return;
    }

    console.log('🔄 Starting IndexedDB migration...');
    
    // Run the migration
    const result = await migrationService.migrate();
    
    if (result.success) {
      console.log(`✅ IndexedDB migration successful: ${result.migratedCount} items migrated`);
      
      // Clean up localStorage (dry run first to log what will be removed)
      console.log('🧹 Cleaning up localStorage...');
      await migrationService.cleanupLocalStorage(true);
      await migrationService.cleanupLocalStorage(false);
      
    } else {
      console.error('❌ IndexedDB migration failed:', result.errors);
    }
    
  } catch (error) {
    console.error('❌ Migration runner error:', error);
  }
}

/**
 * Check if IndexedDB migration is needed
 * Useful for conditional migration logic
 */
export function isMigrationNeeded(): boolean {
  const migrationService = new IndexedDBMigrationService();
  return !migrationService.isMigrationCompleted();
}

/**
 * Migration status information
 */
export interface MigrationStatus {
  completed: boolean;
  hasLocalStorageData: boolean;
  migrationKeys: string[];
}

/**
 * Get migration status for debugging/monitoring
 */
export function getMigrationStatus(): MigrationStatus {
  const migrationService = new IndexedDBMigrationService();
  
  // Check for localStorage keys that would be migrated
  const migrationKeys = [
    'chordium-chord-sheet-cache',
    'chord-sheet-cache',
    'my-chord-sheets',
    'myChordSheets',
    'my-chord-sheets-cache'
  ].filter(key => localStorage.getItem(key) !== null);

  return {
    completed: migrationService.isMigrationCompleted(),
    hasLocalStorageData: migrationKeys.length > 0,
    migrationKeys
  };
}
