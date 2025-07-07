// Debug script to test the getAllSaved method specifically
// Run this in the browser console

async function debugGetAllSaved() {
  console.log('🔍 DEBUGGING getAllSaved METHOD');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      console.log('📇 Testing direct index access...');
      
      // Test the saved index directly (what our getAllSaved method should be doing)
      const savedIndex = store.index('saved');
      
      console.log('\n1️⃣ Testing savedIndex.getAll(1):');
      const savedRequest = savedIndex.getAll(1);
      
      savedRequest.onsuccess = () => {
        const savedRecords = savedRequest.result;
        console.log('Records from savedIndex.getAll(1):', savedRecords.length);
        savedRecords.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.artist} - ${record.title} (saved: ${record.saved})`);
        });
        
        console.log('\n2️⃣ Testing savedIndex.getAll(0):');
        const unsavedRequest = savedIndex.getAll(0);
        
        unsavedRequest.onsuccess = () => {
          const unsavedRecords = unsavedRequest.result;
          console.log('Records from savedIndex.getAll(0):', unsavedRecords.length);
          unsavedRecords.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.artist} - ${record.title} (saved: ${record.saved})`);
          });
          
          console.log('\n3️⃣ Testing store.getAll() and manual filtering:');
          const allRequest = store.getAll();
          
          allRequest.onsuccess = () => {
            const allRecords = allRequest.result;
            
            // Simulate the old way (manual filtering)
            const manualSavedRecords = allRecords.filter(record => record.saved === 1);
            const manualUnsavedRecords = allRecords.filter(record => record.saved === 0);
            
            console.log('All records:', allRecords.length);
            console.log('Manual filter (saved === 1):', manualSavedRecords.length);
            console.log('Manual filter (saved === 0):', manualUnsavedRecords.length);
            
            console.log('\n📊 COMPARISON:');
            console.log('Index getAll(1):', savedRecords.length);
            console.log('Manual filter === 1:', manualSavedRecords.length);
            console.log('Match?', savedRecords.length === manualSavedRecords.length ? '✅' : '❌');
            
            console.log('\n4️⃣ Testing boolean conversion (what our repository should return):');
            // Simulate recordFromDB conversion
            const convertedRecords = savedRecords.map(dbRecord => ({
              ...dbRecord,
              saved: dbRecord.saved === 1 // Convert number to boolean
            }));
            
            console.log('After boolean conversion:');
            convertedRecords.forEach((record, index) => {
              console.log(`  ${index + 1}. ${record.artist} - ${record.title} (saved: ${record.saved}, type: ${typeof record.saved})`);
            });
            
            db.close();
          };
        };
      };
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Database error:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Test the repository method directly if possible
async function testRepositoryGetAllSaved() {
  console.log('\n🧪 TESTING REPOSITORY getAllSaved METHOD');
  
  // This would test the actual repository method if we can access it
  // For now, let's simulate what it should be doing
  console.log('Note: This would test the actual ChordSheetRepository.getAllSaved() method');
  console.log('The method should:');
  console.log('1. Use savedIndex.getAll(1) to get records with saved = 1');
  console.log('2. Convert each record from number (0/1) back to boolean (false/true)');
  console.log('3. Return only the chordSheet property of each record');
}

console.log('🚀 Running getAllSaved debug...');
debugGetAllSaved();

setTimeout(() => {
  testRepositoryGetAllSaved();
}, 2000);
