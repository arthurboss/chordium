// Test script to verify database migration from v5 to v6
// Run this in the browser console

async function testDatabaseMigration() {
  console.log('🔄 TESTING DATABASE MIGRATION');
  
  try {
    // First, let's check if we need to manually create some test data with boolean saved values
    // This would simulate the old version 5 format
    
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onupgradeneeded = (event) => {
      console.log('📈 Database upgrade needed:', event.oldVersion, '->', event.newVersion);
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      console.log('Object stores:', Array.from(db.objectStoreNames));
      
      // Check chordSheets store indexes
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const chordSheetsStore = transaction.objectStore('chordSheets');
      
      console.log('\n📇 CHORD SHEETS STORE INDEXES:');
      console.log('Available indexes:', Array.from(chordSheetsStore.indexNames));
      
      // Check if saved index exists
      if (chordSheetsStore.indexNames.contains('saved')) {
        console.log('✅ Saved index exists');
        
        // Test filtering by saved = 1
        const savedIndex = chordSheetsStore.index('saved');
        const savedRequest = savedIndex.getAll(1);
        
        savedRequest.onsuccess = () => {
          const savedRecords = savedRequest.result;
          console.log('\n💾 SAVED RECORDS (saved = 1):');
          console.log('Count:', savedRecords.length);
          
          savedRecords.forEach((record, index) => {
            console.log(`Record ${index + 1}:`, {
              id: record.id,
              artist: record.artist,
              title: record.title,
              saved: record.saved,
              savedType: typeof record.saved
            });
          });
        };
        
        // Test filtering by saved = 0
        const unsavedRequest = savedIndex.getAll(0);
        
        unsavedRequest.onsuccess = () => {
          const unsavedRecords = unsavedRequest.result;
          console.log('\n📄 UNSAVED RECORDS (saved = 0):');
          console.log('Count:', unsavedRecords.length);
          
          unsavedRecords.forEach((record, index) => {
            console.log(`Record ${index + 1}:`, {
              id: record.id,
              artist: record.artist,
              title: record.title,
              saved: record.saved,
              savedType: typeof record.saved
            });
          });
        };
      } else {
        console.log('❌ Saved index not found');
      }
      
      // Get all records to check saved field types
      const getAllRequest = chordSheetsStore.getAll();
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        console.log('\n🔍 ALL RECORDS SAVED FIELD CHECK:');
        console.log('Total records:', records.length);
        
        const savedFieldTypes = records.reduce((acc, record) => {
          const type = typeof record.saved;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        console.log('Saved field types:', savedFieldTypes);
        
        // Show some sample records
        const sampleRecords = records.slice(0, 3);
        sampleRecords.forEach((record, index) => {
          console.log(`Sample record ${index + 1}:`, {
            id: record.id,
            saved: record.saved,
            savedType: typeof record.saved
          });
        });
      };
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Database error:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

// Function to add a test record with boolean saved value (for testing migration)
async function addTestRecordWithBooleanSaved() {
  console.log('🧪 ADDING TEST RECORD WITH BOOLEAN SAVED');
  
  try {
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
      };
      
      addRequest.onerror = () => {
        console.error('❌ Failed to add test record:', addRequest.error);
        db.close();
      };
    };
    
  } catch (error) {
    console.error('❌ Failed to add test record:', error);
  }
}

// Run the migration test
testDatabaseMigration();

console.log('\n📋 AVAILABLE FUNCTIONS:');
console.log('- testDatabaseMigration() - Test database migration');
console.log('- addTestRecordWithBooleanSaved() - Add test record with boolean saved value');
