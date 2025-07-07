// Debug script to test cache and save functionality
// Run this with: node debug-cache-issues.js

console.log('🔍 Starting cache and save debugging...');

// Mock browser APIs for Node.js
global.IDBVersionChangeEvent = function() {};
global.IDBKeyRange = {
  only: (value) => ({ only: value }),
  bound: (lower, upper) => ({ lower, upper })
};

// Mock fetch for search results
global.fetch = async (url) => {
  console.log('📡 Mock fetch called:', url);
  if (url.includes('/api/artists')) {
    return {
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([
        { name: 'Test Artist', songs: [{ title: 'Test Song', path: 'test-path' }] }
      ]))
    };
  }
  return { ok: false };
};

// Test search cache
async function testSearchCache() {
  console.log('\n🔍 Testing Search Cache...');
  
  try {
    // Import the search cache
    const { cacheSearchResults, getCachedSearchResults } = await import('./src/cache/implementations/search-cache/index.js');
    
    console.log('✅ Search cache modules imported');
    
    // Test caching
    const testResults = [
      { name: 'Test Artist', songs: [{ title: 'Test Song', path: 'test-path' }] }
    ];
    
    console.log('💾 Caching test results...');
    await cacheSearchResults('Test Artist', null, testResults);
    console.log('✅ Results cached');
    
    // Test retrieval
    console.log('🔍 Retrieving cached results...');
    const cached = await getCachedSearchResults('Test Artist', null);
    console.log('📋 Cached results:', cached);
    
    if (cached && cached.length > 0) {
      console.log('✅ Search cache working correctly');
    } else {
      console.log('❌ Search cache not working - no results retrieved');
    }
    
  } catch (error) {
    console.error('❌ Search cache test failed:', error);
  }
}

// Test chord sheet saving
async function testChordSheetSaving() {
  console.log('\n💾 Testing Chord Sheet Saving...');
  
  try {
    // Import required modules
    const { addChordSheet } = await import('./src/utils/chord-sheet-storage/addChordSheet.js');
    const { ChordSheetRepository } = await import('./src/storage/repositories/chord-sheet-repository.js');
    
    console.log('✅ Chord sheet modules imported');
    
    // Test saving
    const testChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist', 
      songChords: 'Am F C G\nTest lyrics with chords',
      songKey: 'Am',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0
    };
    
    console.log('💾 Saving test chord sheet...');
    await addChordSheet(testChordSheet);
    console.log('✅ Chord sheet saved');
    
    // Test retrieval and check saved status
    const repository = new ChordSheetRepository();
    await repository.initialize();
    
    const saved = await repository.isSaved('Test Artist', 'Test Song');
    console.log('🔍 Is saved?', saved);
    
    const retrieved = await repository.get('Test Artist', 'Test Song');
    console.log('📋 Retrieved chord sheet:', retrieved ? 'Found' : 'Not found');
    
    await repository.close();
    
    if (saved && retrieved) {
      console.log('✅ Chord sheet saving working correctly');
    } else {
      console.log('❌ Chord sheet saving not working properly');
    }
    
  } catch (error) {
    console.error('❌ Chord sheet saving test failed:', error);
  }
}

// Run tests
async function runTests() {
  await testSearchCache();
  await testChordSheetSaving();
  console.log('\n🏁 Debugging complete');
}

runTests().catch(console.error);
