// Comprehensive database test script for version 6 with migration
// Run this in the browser console after opening the app

async function runFullDatabaseTest() {
  console.log('🔍 RUNNING COMPREHENSIVE DATABASE TESTS FOR VERSION 6');
  console.log('=' * 60);
  
  try {
    // Test 1: Database Migration
    console.log('\n📈 TEST 1: DATABASE MIGRATION');
    await testDatabaseMigration();
    
    // Test 2: Cache Key Normalization
    console.log('\n🔑 TEST 2: CACHE KEY NORMALIZATION');
    await testCacheKeyNormalization();
    
    // Test 3: Saved Field Filtering
    console.log('\n💾 TEST 3: SAVED FIELD FILTERING');
    await testSavedFieldFiltering();
    
    // Test 4: Search Cache Functionality
    console.log('\n🔍 TEST 4: SEARCH CACHE FUNCTIONALITY');
    await testSearchCacheFunctionality();
    
    console.log('\n✅ ALL TESTS COMPLETED');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

async function testDatabaseMigration() {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onupgradeneeded = (event) => {
      console.log(`📈 Database upgrade: ${event.oldVersion} -> ${event.newVersion}`);
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      console.log('Object stores:', Array.from(db.objectStoreNames));
      
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const chordSheetsStore = transaction.objectStore('chordSheets');
      
      console.log('Available indexes:', Array.from(chordSheetsStore.indexNames));
      
      // Check if saved index exists and works
      if (chordSheetsStore.indexNames.contains('saved')) {
        console.log('✅ Saved index exists');
        
        const getAllRequest = chordSheetsStore.getAll();
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          console.log('Total records:', records.length);
          
          // Check saved field types
          const savedFieldTypes = records.reduce((acc, record) => {
            const type = typeof record.saved;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          
          console.log('Saved field types:', savedFieldTypes);
          
          if (savedFieldTypes.boolean > 0) {
            console.log('⚠️ Found boolean saved values - migration needed');
          } else {
            console.log('✅ All saved values are numbers');
          }
          
          db.close();
          resolve();
        };
      } else {
        console.log('❌ Saved index not found');
        db.close();
        resolve();
      }
    };
    
    dbRequest.onerror = () => {
      console.error('❌ Database error:', dbRequest.error);
      resolve();
    };
  });
}

async function testCacheKeyNormalization() {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        
        console.log('🔑 CHECKING CACHE KEY FORMATS:');
        console.log('Total records:', records.length);
        
        const keyFormats = {
          normalized: 0,
          legacy: 0,
          invalid: 0
        };
        
        const sampleKeys = [];
        
        records.forEach(record => {
          const key = record.id;
          sampleKeys.push(key);
          
          // Check if key matches normalized format (artist_name-song_title)
          if (/^[a-z0-9_]+-[a-z0-9_]+$/.test(key)) {
            keyFormats.normalized++;
          } else if (key.includes('|') || key.includes(' ')) {
            keyFormats.legacy++;
          } else {
            keyFormats.invalid++;
          }
        });
        
        console.log('Key format distribution:', keyFormats);
        console.log('Sample keys:', sampleKeys.slice(0, 5));
        
        if (keyFormats.normalized === records.length) {
          console.log('✅ All cache keys are normalized');
        } else {
          console.log('⚠️ Found non-normalized cache keys');
        }
        
        db.close();
        resolve();
      };
    };
  });
}

async function testSavedFieldFiltering() {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      if (!store.indexNames.contains('saved')) {
        console.log('❌ Saved index not found - filtering test skipped');
        db.close();
        resolve();
        return;
      }
      
      const savedIndex = store.index('saved');
      
      // Test filtering by saved = 1
      const savedRequest = savedIndex.getAll(1);
      savedRequest.onsuccess = () => {
        const savedRecords = savedRequest.result;
        console.log('💾 Saved records (saved = 1):', savedRecords.length);
        
        // Test filtering by saved = 0
        const unsavedRequest = savedIndex.getAll(0);
        unsavedRequest.onsuccess = () => {
          const unsavedRecords = unsavedRequest.result;
          console.log('📄 Unsaved records (saved = 0):', unsavedRecords.length);
          
          // Verify all saved values are numbers
          const allRecords = [...savedRecords, ...unsavedRecords];
          const hasInvalidSavedValues = allRecords.some(record => 
            typeof record.saved !== 'number' || (record.saved !== 0 && record.saved !== 1)
          );
          
          if (hasInvalidSavedValues) {
            console.log('❌ Found invalid saved values');
          } else {
            console.log('✅ All saved values are valid numbers (0 or 1)');
          }
          
          db.close();
          resolve();
        };
      };
    };
  });
}

async function testSearchCacheFunctionality() {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('searchCache')) {
        console.log('❌ Search cache store not found');
        db.close();
        resolve();
        return;
      }
      
      const transaction = db.transaction(['searchCache'], 'readonly');
      const store = transaction.objectStore('searchCache');
      
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        console.log('🔍 Search cache records:', records.length);
        console.log('Available indexes:', Array.from(store.indexNames));
        
        if (records.length > 0) {
          console.log('Sample search record:', {
            id: records[0].id,
            query: records[0].query,
            searchType: records[0].searchType,
            dataSource: records[0].dataSource,
            timestamp: records[0].timestamp,
            resultCount: records[0].results?.length || 0
          });
        }
        
        db.close();
        resolve();
      };
    };
  });
}

// Utility function to add a test record with boolean saved (for migration testing)
async function addTestRecordWithBooleanSaved() {
  console.log('🧪 ADDING TEST RECORD WITH BOOLEAN SAVED');
  
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readwrite');
      const store = transaction.objectStore('chordSheets');
      
      const testRecord = {
        id: 'test-migration-boolean-saved',
        artist: 'Test Artist',
        title: 'Test Migration Song',
        saved: true, // boolean value to test migration
        timestamp: Date.now(),
        chordSheet: { songChords: 'C G Am F' },
        dataSource: 'test',
        version: '1.0.0'
      };
      
      const addRequest = store.put(testRecord);
      
      addRequest.onsuccess = () => {
        console.log('✅ Test record added successfully');
        db.close();
        resolve();
      };
      
      addRequest.onerror = () => {
        console.error('❌ Failed to add test record:', addRequest.error);
        db.close();
        resolve();
      };
    };
  });
}

// Utility to clear the database and force a fresh migration
async function clearDatabaseForMigrationTest() {
  console.log('🗑️ CLEARING DATABASE FOR MIGRATION TEST');
  
  return new Promise((resolve) => {
    const deleteRequest = indexedDB.deleteDatabase('Chordium');
    
    deleteRequest.onsuccess = () => {
      console.log('✅ Database cleared successfully');
      resolve();
    };
    
    deleteRequest.onerror = () => {
      console.error('❌ Failed to clear database:', deleteRequest.error);
      resolve();
    };
  });
}

// Run the full test suite
console.log('📋 AVAILABLE FUNCTIONS:');
console.log('- runFullDatabaseTest() - Run all database tests');
console.log('- testDatabaseMigration() - Test database migration');
console.log('- testCacheKeyNormalization() - Test cache key formats');
console.log('- testSavedFieldFiltering() - Test saved field filtering');
console.log('- testSearchCacheFunctionality() - Test search cache');
console.log('- addTestRecordWithBooleanSaved() - Add test record with boolean saved');
console.log('- clearDatabaseForMigrationTest() - Clear database for migration test');
console.log('\n🚀 Starting full test suite...');

// Auto-run the full test suite
runFullDatabaseTest();
