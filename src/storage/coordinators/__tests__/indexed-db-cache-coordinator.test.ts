import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';
import { TestableChordSheetRepository } from '../../testing/testable-chord-sheet-repository';

describe('IndexedDBCacheCoordinator', () => {
  let repository: TestableChordSheetRepository;

  beforeEach(async () => {
    repository = new TestableChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.clear();
    await repository.close();
  });

  it('should store and retrieve chord sheet using fixture data', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    
    await repository.store('Oasis', 'Wonderwall', chordSheet, { saved: false });
    
    const retrieved = await repository.get('Oasis', 'Wonderwall');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.chordSheet.title).toBe('Wonderwall');
    expect(retrieved?.chordSheet.artist).toBe('Oasis');
    expect(retrieved?.chordSheet.songKey).toBe('G');
    expect(retrieved?.chordSheet.guitarCapo).toBe(2);
    expect(retrieved?.metadata.saved).toBe(false);
  });

  it('should handle saved chord sheets', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    await repository.store('Eagles', 'Hotel California', chordSheet, { saved: true });
    
    const retrieved = await repository.get('Eagles', 'Hotel California');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.chordSheet.title).toBe('Hotel California');
    expect(retrieved?.chordSheet.artist).toBe('Eagles');
    expect(retrieved?.chordSheet.songKey).toBe('Bm');
    expect(retrieved?.metadata.saved).toBe(true);
  });
});
