import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChordSheetFixtureLoader } from '@/storage/testing/chord-sheet-fixture-loader';

describe('IndexedDBHookCacheCoordinator Integration', () => {
  const wonderwallChordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');

  beforeEach(async () => {
    // Mock fetch for testing
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(wonderwallChordSheet)
      }) as Promise<Response>
    );
  });

  afterEach(async () => {
    vi.resetAllMocks();
  });

  it('should load fixture data correctly', async () => {
    expect(wonderwallChordSheet.title).toBe('Wonderwall');
    expect(wonderwallChordSheet.artist).toBe('Oasis');
    expect(wonderwallChordSheet.songKey).toBe('G');
    expect(wonderwallChordSheet.guitarCapo).toBe(2);
  });

  it('should parse storage key correctly', async () => {
    // Test that the parse storage key utility works
    const { parseStorageKey } = await import('../utils/parse-storage-key');
    
    // The parse function expects format: "artist-title" 
    const parsed = parseStorageKey('oasis-wonderwall');
    
    expect(parsed.artist).toBe('oasis');
    expect(parsed.title).toBe('wonderwall');
  });
});
