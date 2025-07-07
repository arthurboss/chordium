// Simple test for saved field filtering after migration to version 6
// Run this in the browser console

async function testSavedFieldFiltering() {
  console.log('💾 TESTING SAVED FIELD FILTERING WITH VERSION 6');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database version:', db.version);
      
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      console.log('📇 Available indexes:', Array.from(store.indexNames));
      
      if (!store.indexNames.contains('saved')) {
        console.log('❌ Saved index not found');
        db.close();
        return;
      }
      
      console.log('✅ Saved index exists');
      
      const savedIndex = store.index('saved');
      
      // Test saved = 1 (true)
      const savedRequest = savedIndex.getAll(1);
      savedRequest.onsuccess = () => {
        const savedRecords = savedRequest.result;
        console.log('\n💾 SAVED RECORDS (saved = 1):');
        console.log('Count:', savedRecords.length);
        
        if (savedRecords.length > 0) {
          const sample = savedRecords[0];
          console.log('Sample record:', {
            id: sample.id,
            artist: sample.artist,
            title: sample.title,
            saved: sample.saved,
            savedType: typeof sample.saved
          });
        }
        
        // Test saved = 0 (false)
        const unsavedRequest = savedIndex.getAll(0);
        unsavedRequest.onsuccess = () => {
          const unsavedRecords = unsavedRequest.result;
          console.log('\n📄 UNSAVED RECORDS (saved = 0):');
          console.log('Count:', unsavedRecords.length);
          
          if (unsavedRecords.length > 0) {
            const sample = unsavedRecords[0];
            console.log('Sample record:', {
              id: sample.id,
              artist: sample.artist,
              title: sample.title,
              saved: sample.saved,
              savedType: typeof sample.saved
            });
          }
          
          // Test total record count
          const allRequest = store.getAll();
          allRequest.onsuccess = () => {
            const allRecords = allRequest.result;
            console.log('\n📊 SUMMARY:');
            console.log('Total records:', allRecords.length);
            console.log('Saved records:', savedRecords.length);
            console.log('Unsaved records:', unsavedRecords.length);
            console.log('Sum check:', (savedRecords.length + unsavedRecords.length), '=', allRecords.length, '?', (savedRecords.length + unsavedRecords.length) === allRecords.length ? '✅' : '❌');
            
            // Check saved field types
            const savedFieldTypes = allRecords.reduce((acc, record) => {
              const type = typeof record.saved;
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {});
            
            console.log('Saved field types across all records:', savedFieldTypes);
            
            if (savedFieldTypes.number === allRecords.length) {
              console.log('✅ All saved fields are numbers');
            } else {
              console.log('❌ Found non-number saved fields');
            }
            
            db.close();
          };
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

// Add a test record to ensure we have data
async function addTestSavedRecord() {
  console.log('🧪 ADDING TEST SAVED RECORD');
  
  const dbRequest = indexedDB.open('Chordium', 6);
  
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');
    
    // Add a test saved record with number saved field
    const testRecord = {
      id: 'test-saved-record-v6',
      artist: 'Test Artist',
      title: 'Test Saved Song',
      saved: 1, // number value for saved = true
      timestamp: Date.now(),
      accessCount: 1,
      chordSheet: { songChords: 'C G Am F', artist: 'Test Artist', title: 'Test Saved Song' },
      dataSource: 'test',
      version: '1.0.0'
    };
    
    const addRequest = store.put(testRecord);
    
    addRequest.onsuccess = () => {
      console.log('✅ Test saved record added');
      
      // Add a test unsaved record
      const testUnsavedRecord = {
        id: 'test-unsaved-record-v6',
        artist: 'Test Artist 2',
        title: 'Test Unsaved Song',
        saved: 0, // number value for saved = false
        timestamp: Date.now(),
        accessCount: 1,
        chordSheet: { songChords: 'C G Am F', artist: 'Test Artist 2', title: 'Test Unsaved Song' },
        dataSource: 'test',
        version: '1.0.0'
      };
      
      const addUnsavedRequest = store.put(testUnsavedRecord);
      
      addUnsavedRequest.onsuccess = () => {
        console.log('✅ Test unsaved record added');
        console.log('🧪 Now run testSavedFieldFiltering() to verify filtering works');
        db.close();
      };
    };
    
    addRequest.onerror = () => {
      console.error('❌ Failed to add test record:', addRequest.error);
      db.close();
    };
  };
}

console.log('📋 AVAILABLE FUNCTIONS:');
console.log('- addTestSavedRecord() - Add test records with number saved field');
console.log('- testSavedFieldFiltering() - Test saved field filtering');
console.log('\n🚀 Adding test records first...');

// Auto-run: first add test records, then test filtering
addTestSavedRecord();

setTimeout(() => {
  console.log('\n🧪 Testing saved field filtering...');
  testSavedFieldFiltering();
}, 1000);
