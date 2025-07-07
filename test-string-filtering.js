// TDD Test for String-based Saved Field Filtering (Version 7)
// Run this in the browser console

async function testStringBasedSavedFiltering() {
  console.log('🧪 TDD: TESTING STRING-BASED SAVED FIELD FILTERING (VERSION 7)');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 7);
    
    dbRequest.onupgradeneeded = (event) => {
      console.log(`📈 Database upgrade: ${event.oldVersion} -> ${event.newVersion}`);
      if (event.oldVersion < 7) {
        console.log('🔄 Migrating saved field from numbers to strings...');
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database version:', db.version);
      
      const transaction = db.transaction(['chordSheets'], 'readwrite');
      const store = transaction.objectStore('chordSheets');
      
      // First, add test records with string saved field
      const testSavedRecord = {
        id: 'test-string-saved-v7',
        artist: 'String Test Artist',
        title: 'String Test Saved Song',
        saved: 'saved', // String value
        timestamp: Date.now(),
        accessCount: 1,
        chordSheet: { songChords: 'C G Am F', artist: 'String Test Artist', title: 'String Test Saved Song' },
        dataSource: 'test',
        version: '1.0.0'
      };
      
      const testUnsavedRecord = {
        id: 'test-string-unsaved-v7',
        artist: 'String Test Artist 2',
        title: 'String Test Unsaved Song',
        saved: 'unsaved', // String value
        timestamp: Date.now(),
        accessCount: 1,
        chordSheet: { songChords: 'D A Bm G', artist: 'String Test Artist 2', title: 'String Test Unsaved Song' },
        dataSource: 'test',
        version: '1.0.0'
      };
      
      // Add the records
      const addSavedRequest = store.put(testSavedRecord);
      addSavedRequest.onsuccess = () => {
        console.log('✅ Added test saved record with string field');
        
        const addUnsavedRequest = store.put(testUnsavedRecord);
        addUnsavedRequest.onsuccess = () => {
          console.log('✅ Added test unsaved record with string field');
          
          // Now test the filtering
          setTimeout(() => {
            testStringFiltering(db);
          }, 100);
        };
      };
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Database error:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function testStringFiltering(db) {
  console.log('\n🔍 TESTING STRING-BASED INDEX FILTERING:');
  
  const transaction = db.transaction(['chordSheets'], 'readonly');
  const store = transaction.objectStore('chordSheets');
  
  // Test saved index with string values
  const savedIndex = store.index('saved');
  
  // Test filtering for 'saved' records
  const savedRequest = savedIndex.getAll('saved');
  savedRequest.onsuccess = () => {
    const savedRecords = savedRequest.result;
    console.log('\n💾 RECORDS WITH saved = "saved":');
    console.log('Count:', savedRecords.length);
    
    savedRecords.forEach(record => {
      console.log(`- ${record.artist} - ${record.title} (saved: "${record.saved}")`);
    });
    
    // Test filtering for 'unsaved' records
    const unsavedRequest = savedIndex.getAll('unsaved');
    unsavedRequest.onsuccess = () => {
      const unsavedRecords = unsavedRequest.result;
      console.log('\n📄 RECORDS WITH saved = "unsaved":');
      console.log('Count:', unsavedRecords.length);
      
      unsavedRecords.forEach(record => {
        console.log(`- ${record.artist} - ${record.title} (saved: "${record.saved}")`);
      });
      
      // TDD Assertions
      console.log('\n✅ TDD ASSERTIONS:');
      
      // Check for our test records
      const hasSavedTestRecord = savedRecords.some(r => r.id === 'test-string-saved-v7');
      const hasUnsavedTestRecord = unsavedRecords.some(r => r.id === 'test-string-unsaved-v7');
      
      console.log('Saved records contain test saved record:', hasSavedTestRecord ? '✅' : '❌');
      console.log('Unsaved records contain test unsaved record:', hasUnsavedTestRecord ? '✅' : '❌');
      
      // Check for no cross-contamination
      const savedHasUnsavedRecord = savedRecords.some(r => r.id === 'test-string-unsaved-v7');
      const unsavedHasSavedRecord = unsavedRecords.some(r => r.id === 'test-string-saved-v7');
      
      console.log('Saved records do NOT contain unsaved record:', !savedHasUnsavedRecord ? '✅' : '❌');
      console.log('Unsaved records do NOT contain saved record:', !unsavedHasSavedRecord ? '✅' : '❌');
      
      if (hasSavedTestRecord && hasUnsavedTestRecord && !savedHasUnsavedRecord && !unsavedHasSavedRecord) {
        console.log('\n🎉 SUCCESS: String-based filtering works perfectly!');
      } else {
        console.log('\n❌ FAILED: String-based filtering has issues');
      }
      
      db.close();
    };
  };
}

// Also test what happens to existing number records after migration
async function testMigrationResults() {
  console.log('\n🔄 TESTING MIGRATION RESULTS:');
  
  const dbRequest = indexedDB.open('Chordium', 7);
  
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');
    
    const allRequest = store.getAll();
    allRequest.onsuccess = () => {
      const allRecords = allRequest.result;
      
      console.log('📊 MIGRATION RESULTS:');
      
      const savedFieldTypes = allRecords.reduce((acc, record) => {
        const type = typeof record.saved;
        const value = record.saved;
        const key = `${type}:${value}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Saved field types and values:', savedFieldTypes);
      
      const hasNumbers = allRecords.some(r => typeof r.saved === 'number');
      const hasStrings = allRecords.some(r => typeof r.saved === 'string');
      
      console.log('Has number saved fields:', hasNumbers ? '❌ (should be migrated)' : '✅');
      console.log('Has string saved fields:', hasStrings ? '✅' : '❌');
      
      if (!hasNumbers && hasStrings) {
        console.log('✅ Migration successful: All saved fields are now strings');
      } else {
        console.log('❌ Migration incomplete: Still has number fields');
      }
      
      db.close();
    };
  };
}

console.log('🚀 Starting TDD string-based filtering test...');
testStringBasedSavedFiltering();

setTimeout(() => {
  testMigrationResults();
}, 3000);
