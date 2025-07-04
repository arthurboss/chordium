import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestableChordSheetRepository } from '../../testing/testable-chord-sheet-repository';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';

describe('ChordSheetRepository', () => {
  let repository: TestableChordSheetRepository;

  beforeEach(async () => {
    repository = new TestableChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.clear();
    await repository.close();
  });

  it('should store chord sheet using fixture data', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    
    await repository.store('Oasis', 'Wonderwall', chordSheet, { saved: false });
    
    const stored = await repository.get('Oasis', 'Wonderwall');
    
    expect(stored).toBeDefined();
    expect(stored?.chordSheet.title).toBe('Wonderwall');
    expect(stored?.chordSheet.artist).toBe('Oasis');
    expect(stored?.chordSheet.songKey).toBe('G');
    expect(stored?.chordSheet.guitarCapo).toBe(2);
    expect(stored?.metadata.saved).toBe(false);
  });

  it('should store multiple chord sheets from fixtures', async () => {
    const wonderwall = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    const hotelCalifornia = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    await repository.store('Oasis', 'Wonderwall', wonderwall, { saved: false });
    await repository.store('Eagles', 'Hotel California', hotelCalifornia, { saved: true });
    
    const all = await repository.getAll();
    
    expect(all).toHaveLength(2);
    expect(all.find(r => r.chordSheet.title === 'Wonderwall')).toBeDefined();
    expect(all.find(r => r.chordSheet.title === 'Hotel California')).toBeDefined();
  });
});
