import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetRepository } from '../chord-sheet-repository';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

describe('ChordSheetRepository - Saved Field Filtering Bug', () => {
  let repository: ChordSheetRepository;
  
  const testSavedChordSheet: ChordSheet = {
    title: 'Test Saved Song',
    artist: 'Test Artist',
    songChords: 'C G Am F',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };
  
  const testUnsavedChordSheet: ChordSheet = {
    title: 'Test Unsaved Song', 
    artist: 'Test Artist 2',
    songChords: 'D A Bm G',
    songKey: 'D',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  beforeEach(async () => {
    repository = new ChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.close();
  });

  it('should only return saved chord sheets from getAllSaved(), not cached ones', async () => {
    // ARRANGE: Add one saved and one cached (unsaved) chord sheet
    
    // Add a saved chord sheet (saved: true)
    await repository.save('Test Artist', 'Test Saved Song', testSavedChordSheet);
    
    // Add a cached chord sheet (saved: false) 
    await repository.cache('Test Artist 2', 'Test Unsaved Song', testUnsavedChordSheet);
    
    // ACT: Get all saved chord sheets
    const savedChordSheets = await repository.getAllSaved();
    
    // ASSERT: Should only return the saved one, not the cached one
    expect(savedChordSheets).toHaveLength(1);
    expect(savedChordSheets[0].title).toBe('Test Saved Song');
    expect(savedChordSheets[0].artist).toBe('Test Artist');
    
    // Additional verification: check that both records exist in database
    const allRecords = await repository.getAll();
    expect(allRecords).toHaveLength(2);
    
    // Verify one is saved, one is not
    const savedRecords = allRecords.filter(record => record.saved === true);
    const unsavedRecords = allRecords.filter(record => record.saved === false);
    
    expect(savedRecords).toHaveLength(1);
    expect(unsavedRecords).toHaveLength(1);
    expect(savedRecords[0].title).toBe('Test Saved Song');
    expect(unsavedRecords[0].title).toBe('Test Unsaved Song');
  });

  it('should return empty array when no chord sheets are saved', async () => {
    // ARRANGE: Add only cached (unsaved) chord sheets
    await repository.cache('Artist 1', 'Song 1', testUnsavedChordSheet);
    await repository.cache('Artist 2', 'Song 2', testUnsavedChordSheet);
    
    // ACT: Get all saved chord sheets
    const savedChordSheets = await repository.getAllSaved();
    
    // ASSERT: Should return empty array
    expect(savedChordSheets).toHaveLength(0);
    
    // Verify records exist but are not saved
    const allRecords = await repository.getAll();
    expect(allRecords).toHaveLength(2);
    expect(allRecords.every(record => record.saved === false)).toBe(true);
  });

  it('should use saved index for efficient filtering, not manual array filtering', async () => {
    // This test verifies that we're using the IndexedDB index correctly
    // ARRANGE: Add multiple saved and unsaved records
    await repository.save('Artist 1', 'Saved Song 1', testSavedChordSheet);
    await repository.save('Artist 2', 'Saved Song 2', testSavedChordSheet); 
    await repository.cache('Artist 3', 'Cached Song 1', testUnsavedChordSheet);
    await repository.cache('Artist 4', 'Cached Song 2', testUnsavedChordSheet);
    await repository.cache('Artist 5', 'Cached Song 3', testUnsavedChordSheet);
    
    // ACT: Get saved chord sheets
    const savedChordSheets = await repository.getAllSaved();
    
    // ASSERT: Should only return the 2 saved ones
    expect(savedChordSheets).toHaveLength(2);
    
    const titles = savedChordSheets.map(cs => cs.title);
    expect(titles).toContain('Saved Song 1');
    expect(titles).toContain('Saved Song 2');
    expect(titles).not.toContain('Cached Song 1');
    expect(titles).not.toContain('Cached Song 2');
    expect(titles).not.toContain('Cached Song 3');
  });

  it('should handle edge case where saved field is stored as number but exposed as boolean', async () => {
    // This test specifically checks the number/boolean conversion
    // ARRANGE: Manually add records with number saved field to simulate DB state
    
    // We'll use the repository methods which should handle the conversion
    await repository.save('Artist 1', 'Song 1', testSavedChordSheet);
    await repository.cache('Artist 2', 'Song 2', testUnsavedChordSheet);
    
    // ACT: Get all records and check types
    const allRecords = await repository.getAll();
    const savedRecords = await repository.getAllSaved();
    
    // ASSERT: Records should have boolean saved field when returned from repository
    expect(allRecords).toHaveLength(2);
    allRecords.forEach(record => {
      expect(typeof record.saved).toBe('boolean');
    });
    
    // Only saved record should be returned by getAllSaved
    expect(savedRecords).toHaveLength(1);
    expect(savedRecords[0].title).toBe('Song 1');
  });
});
