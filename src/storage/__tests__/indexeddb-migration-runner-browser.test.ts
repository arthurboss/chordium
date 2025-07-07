/**
 * Integration test for IndexedDB migration in browser environment
 * This test should be run in a browser/E2E environment where IndexedDB is available
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { runIndexedDBMigration, isMigrationNeeded, getMigrationStatus } from '../indexeddb-migration-runner';

// Skip these tests in Node.js environment since IndexedDB is not available
const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

describe.skipIf(!isBrowser)('IndexedDB Migration Runner - Browser Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should complete migration in browser environment', async () => {
    // Add some mock localStorage data
    const mockChordSheetCache = {
      items: [
        {
          key: 'test-artist_test-song',
          data: {
            artist: 'Test Artist',
            title: 'Test Song',
            content: '[D]Test content'
          },
          timestamp: Date.now(),
          accessCount: 1,
          saved: true
        }
      ]
    };
    
    localStorage.setItem('chordium-chord-sheet-cache', JSON.stringify(mockChordSheetCache));

    // Check initial status
    expect(isMigrationNeeded()).toBe(true);
    
    const initialStatus = getMigrationStatus();
    expect(initialStatus.completed).toBe(false);
    expect(initialStatus.hasLocalStorageData).toBe(true);
    expect(initialStatus.migrationKeys).toContain('chordium-chord-sheet-cache');

    // Run migration
    await runIndexedDBMigration();

    // Check final status
    expect(isMigrationNeeded()).toBe(false);
    
    const finalStatus = getMigrationStatus();
    expect(finalStatus.completed).toBe(true);
  });

  it('should skip migration if already completed', async () => {
    // Mark migration as completed
    localStorage.setItem('chordium-indexeddb-migration-completed', 'true');

    expect(isMigrationNeeded()).toBe(false);

    // Should complete quickly without doing anything
    const startTime = Date.now();
    await runIndexedDBMigration();
    const endTime = Date.now();
    
    // Should be very fast since it skips migration
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should handle empty localStorage gracefully', async () => {
    expect(isMigrationNeeded()).toBe(true);
    
    const status = getMigrationStatus();
    expect(status.hasLocalStorageData).toBe(false);
    expect(status.migrationKeys).toHaveLength(0);

    // Should complete successfully even with no data
    await runIndexedDBMigration();
    
    expect(isMigrationNeeded()).toBe(false);
  });
});

// Fallback test for Node.js environment
describe.skipIf(isBrowser)('IndexedDB Migration Runner - Node.js Environment', () => {
  it('should skip browser-only tests in Node.js', () => {
    expect(typeof indexedDB).toBe('undefined');
    console.log('IndexedDB not available in Node.js - browser tests skipped');
  });
});
