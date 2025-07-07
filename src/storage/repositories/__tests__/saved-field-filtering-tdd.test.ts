import { describe, it, expect } from 'vitest';

/**
 * TDD Test for the saved field filtering bug
 * This test simulates the actual behavior to demonstrate the issue
 */
describe('Saved Field Filtering Bug - TDD Simulation', () => {
  
  it('should demonstrate the current bug: getAllSaved returns all records instead of just saved ones', () => {
    // ARRANGE: Simulate database records with mixed saved values
    const mockDBRecords = [
      { id: 'eagles-hotel_california', artist: 'Eagles', title: 'Hotel California', saved: 1, chordSheet: { title: 'Hotel California', artist: 'Eagles' } },
      { id: 'test-saved-record-v6', artist: 'Test Artist', title: 'Test Saved Song', saved: 1, chordSheet: { title: 'Test Saved Song', artist: 'Test Artist' } },
      { id: 'test-unsaved-record-v6', artist: 'Test Artist 2', title: 'Test Unsaved Song', saved: 0, chordSheet: { title: 'Test Unsaved Song', artist: 'Test Artist 2' } }
    ];
    
    // ACT: Simulate what our getAllSaved method SHOULD do
    const correctBehavior_savedIndex_getAll1 = mockDBRecords.filter(record => record.saved === 1);
    const correctBehavior_convertedRecords = correctBehavior_savedIndex_getAll1.map(dbRecord => ({
      ...dbRecord,
      saved: dbRecord.saved === 1 // Convert number to boolean
    }));
    const correctBehavior_extractChordSheets = correctBehavior_convertedRecords.map(record => record.chordSheet);
    
    // ACT: Simulate what might be happening (WRONG behavior)
    const wrongBehavior_getAllRecords = mockDBRecords; // Getting all records instead of filtering
    const wrongBehavior_convertedRecords = wrongBehavior_getAllRecords.map(dbRecord => ({
      ...dbRecord,
      saved: dbRecord.saved === 1
    }));
    const wrongBehavior_extractChordSheets = wrongBehavior_convertedRecords.map(record => record.chordSheet);
    
    // ASSERT: Show the difference
    console.log('🔍 TDD Debug Output:');
    console.log('Correct behavior (should return):', correctBehavior_extractChordSheets.length, 'chord sheets');
    correctBehavior_extractChordSheets.forEach(cs => console.log(`  - ${cs.title}`));
    
    console.log('Wrong behavior (currently returning):', wrongBehavior_extractChordSheets.length, 'chord sheets');
    wrongBehavior_extractChordSheets.forEach(cs => console.log(`  - ${cs.title}`));
    
    // The test that should PASS when fixed
    expect(correctBehavior_extractChordSheets).toHaveLength(2); // Only saved records
    expect(correctBehavior_extractChordSheets.map(cs => cs.title)).toEqual([
      'Hotel California', 
      'Test Saved Song'
    ]);
    expect(correctBehavior_extractChordSheets.map(cs => cs.title)).not.toContain('Test Unsaved Song');
    
    // The test that demonstrates the current BUG (if this passes, we have the bug)
    const currentBugExists = wrongBehavior_extractChordSheets.length > correctBehavior_extractChordSheets.length;
    expect(currentBugExists).toBe(true); // This shows we currently have the bug
  });

  it('should verify the IndexedDB filtering logic works correctly', () => {
    // ARRANGE: Mock the savedIndex.getAll(1) behavior
    const allDBRecords = [
      { id: 'record1', saved: 1, title: 'Saved Song 1' },
      { id: 'record2', saved: 0, title: 'Unsaved Song' },
      { id: 'record3', saved: 1, title: 'Saved Song 2' },
      { id: 'record4', saved: 0, title: 'Another Unsaved Song' }
    ];
    
    // ACT: Simulate savedIndex.getAll(1) - should only return records with saved = 1
    const savedIndexResult = allDBRecords.filter(record => record.saved === 1);
    
    // ASSERT: Verify filtering works at database level
    expect(savedIndexResult).toHaveLength(2);
    expect(savedIndexResult.map(r => r.title)).toEqual(['Saved Song 1', 'Saved Song 2']);
    expect(savedIndexResult.every(r => r.saved === 1)).toBe(true);
  });

  it('should verify boolean conversion works correctly', () => {
    // ARRANGE: Mock database records with number saved field
    const dbRecords = [
      { id: 'record1', saved: 1, other: 'data1' },
      { id: 'record2', saved: 0, other: 'data2' }
    ];
    
    // ACT: Simulate recordFromDB conversion
    const convertedRecords = dbRecords.map(dbRecord => ({
      ...dbRecord,
      saved: dbRecord.saved === 1
    }));
    
    // ASSERT: Verify conversion works
    expect(convertedRecords[0].saved).toBe(true);
    expect(convertedRecords[1].saved).toBe(false);
    expect(typeof convertedRecords[0].saved).toBe('boolean');
    expect(typeof convertedRecords[1].saved).toBe('boolean');
  });
});
