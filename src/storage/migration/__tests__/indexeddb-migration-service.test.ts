import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestableIndexedDBMigrationService } from '../../testing/testable-indexeddb-migration-service';

describe('IndexedDBMigrationService', () => {
  let migrationService: TestableIndexedDBMigrationService;
  let mockLocalStorage: Map<string, string>;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = new Map();
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage.get(key) ?? null,
        setItem: (key: string, value: string) => mockLocalStorage.set(key, value),
        removeItem: (key: string) => mockLocalStorage.delete(key),
        clear: () => mockLocalStorage.clear()
      },
      writable: true
    });

    migrationService = new TestableIndexedDBMigrationService();
    mockLocalStorage.clear();
  });

  it('should return early if migration already completed', async () => {
    // Mark migration as completed
    mockLocalStorage.set('chordium-indexeddb-migration-completed', 'true');

    const result = await migrationService.migrate();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.skippedCount).toBe(0);
  });

  it('should check migration completion status', () => {
    expect(migrationService.isMigrationCompleted()).toBe(false);

    mockLocalStorage.set('chordium-indexeddb-migration-completed', 'true');
    expect(migrationService.isMigrationCompleted()).toBe(true);
  });

  it('should clean up localStorage keys', async () => {
    // Add some localStorage keys
    mockLocalStorage.set('chordium-chord-sheet-cache', 'data');
    mockLocalStorage.set('my-chord-sheets', 'data');
    mockLocalStorage.set('other-key', 'data');

    await migrationService.cleanupLocalStorage();

    // Migration-related keys should be removed
    expect(mockLocalStorage.has('chordium-chord-sheet-cache')).toBe(false);
    expect(mockLocalStorage.has('my-chord-sheets')).toBe(false);
    
    // Other keys should remain
    expect(mockLocalStorage.has('other-key')).toBe(true);
  });

  it('should support dry-run cleanup', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    mockLocalStorage.set('chordium-chord-sheet-cache', 'data');
    mockLocalStorage.set('my-chord-sheets', 'data');

    await migrationService.cleanupLocalStorage(true);

    // Keys should still exist in dry-run mode
    expect(mockLocalStorage.has('chordium-chord-sheet-cache')).toBe(true);
    expect(mockLocalStorage.has('my-chord-sheets')).toBe(true);
    
    // Should have logged what would be removed
    expect(consoleSpy).toHaveBeenCalledWith('Would remove localStorage key: chordium-chord-sheet-cache');
    expect(consoleSpy).toHaveBeenCalledWith('Would remove localStorage key: my-chord-sheets');
    
    consoleSpy.mockRestore();
  });

  it('should handle empty localStorage gracefully', async () => {
    // No localStorage data to migrate
    const result = await migrationService.migrate();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.skippedCount).toBe(0);
  });

  it('should mark migration as completed after successful run', async () => {
    // Ensure migration is not marked as completed initially
    expect(migrationService.isMigrationCompleted()).toBe(false);

    // Run migration
    await migrationService.migrate();

    // Should be marked as completed
    expect(migrationService.isMigrationCompleted()).toBe(true);
  });

  it('should provide interface validation', () => {
    // Test that the service has the expected interface
    expect(typeof migrationService.migrate).toBe('function');
    expect(typeof migrationService.isMigrationCompleted).toBe('function');
    expect(typeof migrationService.cleanupLocalStorage).toBe('function');
  });

  it('should handle migration service initialization', () => {
    // Service should be instantiable
    const newService = new TestableIndexedDBMigrationService();
    expect(newService).toBeInstanceOf(TestableIndexedDBMigrationService);
  });

  it('should provide structured migration results', async () => {
    const result = await migrationService.migrate();

    // Result should have the expected structure
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('migratedCount');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('skippedCount');
    
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.migratedCount).toBe('number');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(typeof result.skippedCount).toBe('number');
  });
});
