import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runIndexedDBMigration, isMigrationNeeded, getMigrationStatus } from '../indexeddb-migration-runner';

describe('IndexedDB Migration Runner', () => {
  let mockLocalStorage: Map<string, string>;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

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

    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };

    mockLocalStorage.clear();
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it('should check if migration is needed', () => {
    expect(isMigrationNeeded()).toBe(true);

    // Mark migration as completed
    mockLocalStorage.set('chordium-indexeddb-migration-completed', 'true');
    expect(isMigrationNeeded()).toBe(false);
  });

  it('should get migration status', () => {
    // No localStorage data
    let status = getMigrationStatus();
    expect(status.completed).toBe(false);
    expect(status.hasLocalStorageData).toBe(false);
    expect(status.migrationKeys).toHaveLength(0);

    // Add some localStorage data
    mockLocalStorage.set('chordium-chord-sheet-cache', 'some data');
    mockLocalStorage.set('my-chord-sheets', 'some data');
    mockLocalStorage.set('other-key', 'other data');

    status = getMigrationStatus();
    expect(status.hasLocalStorageData).toBe(true);
    expect(status.migrationKeys).toHaveLength(2);
    expect(status.migrationKeys).toContain('chordium-chord-sheet-cache');
    expect(status.migrationKeys).toContain('my-chord-sheets');
    expect(status.migrationKeys).not.toContain('other-key');

    // Mark migration as completed
    mockLocalStorage.set('chordium-indexeddb-migration-completed', 'true');
    status = getMigrationStatus();
    expect(status.completed).toBe(true);
  });

  it('should skip migration if already completed', async () => {
    // Mark migration as completed
    mockLocalStorage.set('chordium-indexeddb-migration-completed', 'true');

    await runIndexedDBMigration();

    expect(consoleSpy.log).toHaveBeenCalledWith('✅ IndexedDB migration already completed');
  });

  it('should handle migration runner interface', () => {
    // Test that functions are available and return expected types
    expect(typeof runIndexedDBMigration).toBe('function');
    expect(typeof isMigrationNeeded).toBe('function');
    expect(typeof getMigrationStatus).toBe('function');

    const status = getMigrationStatus();
    expect(status).toHaveProperty('completed');
    expect(status).toHaveProperty('hasLocalStorageData');
    expect(status).toHaveProperty('migrationKeys');
    expect(typeof status.completed).toBe('boolean');
    expect(typeof status.hasLocalStorageData).toBe('boolean');
    expect(Array.isArray(status.migrationKeys)).toBe(true);
  });
});
