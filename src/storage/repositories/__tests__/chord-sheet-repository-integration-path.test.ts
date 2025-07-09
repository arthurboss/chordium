import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetRepository } from '../chord-sheet-repository';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';
import { generateUnifiedCacheKey } from '../../utils/unified-cache-key-generator';

describe('ChordSheetRepository - Integration with Path-Based Keys', () => {
  let repository: ChordSheetRepository;

  beforeEach(async () => {
    repository = new ChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.close();
  });

  it('should demonstrate path vs legacy key difference', async () => {
    // Generate path-based key to show the format
    const pathBasedKey = generateUnifiedCacheKey('Oasis', 'Wonderwall');
    
    console.log('Path-based key:', pathBasedKey);
    
    // Show that path-based key matches URL format
    expect(pathBasedKey).toBe('oasis/wonderwall');
    expect(pathBasedKey).toMatch(/^[a-z-]+\/[a-z-]+$/);
  });

  it('should be able to store and retrieve using path-based key via new methods', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    const path = 'oasis/wonderwall';
    
    // Store using new path-based method
    await repository.storeByPath(path, chordSheet, { saved: false });
    
    // Retrieve using new path-based method
    const stored = await repository.getByPath(path);
    
    expect(stored).toBeDefined();
    expect(stored?.chordSheet.title).toBe('Wonderwall');
    expect(stored?.chordSheet.artist).toBe('Oasis');
    expect(stored?.metadata.saved).toBe(false);
  });
});
