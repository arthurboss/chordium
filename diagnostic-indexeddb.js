/**
 * Diagnostic script for IndexedDB issues
 * Add this to your browser console to debug cache and saving issues
 */

console.log('🔍 IndexedDB Diagnostic Starting...');

// Check IndexedDB availability
if (!window.indexedDB) {
    console.error('❌ IndexedDB not available in this browser');
} else {
    console.log('✅ IndexedDB is available');
}

// Test IndexedDB connection
async function testIndexedDBConnection() {
    try {
        console.log('🔌 Testing IndexedDB connection...');
        
        // Try to open a test database
        const request = indexedDB.open('test-db', 1);
        
        return new Promise((resolve, reject) => {
            request.onerror = () => {
                console.error('❌ Failed to open IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log('✅ IndexedDB connection successful');
                const db = request.result;
                db.close();
                // Clean up test database
                indexedDB.deleteDatabase('test-db');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                console.log('🔄 Creating test database...');
                const db = event.target.result;
                // Create a test object store
                db.createObjectStore('test-store', { keyPath: 'id' });
            };
        });
    } catch (error) {
        console.error('❌ IndexedDB connection test failed:', error);
        throw error;
    }
}

// Test search cache specifically
async function testSearchCache() {
    try {
        console.log('\n🔍 Testing Search Cache...');
        
        // Import the search cache module
        const { searchCacheIndexedDB } = await import('/src/cache/implementations/search-cache/index.js');
        
        console.log('✅ Search cache module imported');
        
        // Test caching some data
        const testData = [
            { name: 'Diagnostic Artist', songs: [{ title: 'Diagnostic Song', path: 'diagnostic-path' }] }
        ];
        
        console.log('💾 Caching diagnostic data...');
        await searchCacheIndexedDB.cacheSearchResults('Diagnostic Artist', null, testData);
        console.log('✅ Data cached successfully');
        
        // Test retrieving the data
        console.log('🔍 Retrieving cached data...');
        const retrieved = await searchCacheIndexedDB.getCachedSearchResults('Diagnostic Artist', null);
        
        if (retrieved && retrieved.length > 0) {
            console.log('✅ Search cache working correctly:', retrieved);
        } else {
            console.log('❌ Search cache retrieval failed - no data returned');
        }
        
        // Clear the test data
        await searchCacheIndexedDB.clearAllCache();
        console.log('🧹 Test data cleared');
        
    } catch (error) {
        console.error('❌ Search cache test failed:', error);
        throw error;
    }
}

// Test chord sheet saving
async function testChordSheetSaving() {
    try {
        console.log('\n💾 Testing Chord Sheet Saving...');
        
        // Import chord sheet modules
        const { addChordSheet } = await import('/src/utils/chord-sheet-storage/addChordSheet.js');
        const { ChordSheetRepository } = await import('/src/storage/repositories/chord-sheet-repository.js');
        
        console.log('✅ Chord sheet modules imported');
        
        // Create test chord sheet
        const testChordSheet = {
            title: 'Diagnostic Song',
            artist: 'Diagnostic Artist',
            songChords: 'Am F C G\nDiagnostic lyrics',
            songKey: 'Am',
            guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
            guitarCapo: 0
        };
        
        console.log('💾 Saving diagnostic chord sheet...');
        await addChordSheet(testChordSheet);
        console.log('✅ Chord sheet saved');
        
        // Test retrieval and saved status
        const repository = new ChordSheetRepository();
        await repository.initialize();
        
        const isSaved = await repository.isSaved('Diagnostic Artist', 'Diagnostic Song');
        console.log('🔍 Is chord sheet saved?', isSaved);
        
        const retrieved = await repository.get('Diagnostic Artist', 'Diagnostic Song');
        console.log('📋 Retrieved chord sheet:', retrieved ? 'Found' : 'Not found');
        
        if (isSaved && retrieved) {
            console.log('✅ Chord sheet saving working correctly');
        } else {
            console.log('❌ Chord sheet saving failed');
            console.log('   - Is saved:', isSaved);
            console.log('   - Retrieved:', !!retrieved);
        }
        
        // Clean up
        if (retrieved) {
            const recordId = await repository.getRecord('Diagnostic Artist', 'Diagnostic Song');
            if (recordId) {
                await repository.delete(recordId.id);
                console.log('🧹 Test chord sheet deleted');
            }
        }
        
        await repository.close();
        
    } catch (error) {
        console.error('❌ Chord sheet saving test failed:', error);
        throw error;
    }
}

// Check current IndexedDB state
async function checkCurrentState() {
    try {
        console.log('\n📊 Checking Current IndexedDB State...');
        
        // Check if databases exist
        const databases = await indexedDB.databases();
        console.log('🗄️ Existing databases:', databases.map(db => db.name));
        
        // Check specific databases we use
        const expectedDatabases = ['ChordSheetDB', 'SearchCacheDB'];
        for (const dbName of expectedDatabases) {
            const exists = databases.some(db => db.name === dbName);
            console.log(`   ${exists ? '✅' : '❌'} ${dbName}: ${exists ? 'exists' : 'missing'}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to check database state:', error);
    }
}

// Run all diagnostics
async function runDiagnostics() {
    try {
        await testIndexedDBConnection();
        await checkCurrentState();
        await testSearchCache();
        await testChordSheetSaving();
        console.log('\n🎉 All diagnostics completed successfully!');
    } catch (error) {
        console.error('\n💥 Diagnostics failed:', error);
    }
}

// Auto-run diagnostics
runDiagnostics();
