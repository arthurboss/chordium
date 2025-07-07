// Simple verification script to check saved filtering
// Run this in the browser console

async function verifyFilteringIssue() {
  console.log('🔍 VERIFYING FILTERING ISSUE');
  
  const dbRequest = indexedDB.open('Chordium', 6);
  
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');
    
    // Get all records first
    const allRequest = store.getAll();
    
    allRequest.onsuccess = () => {
      const allRecords = allRequest.result;
      
      console.log('📊 ALL RECORDS:');
      allRecords.forEach(record => {
        console.log(`- ${record.artist} - ${record.title} | saved: ${record.saved} (${typeof record.saved})`);
      });
      
      // Now use the index to get only saved = 1
      const savedIndex = store.index('saved');
      const savedRequest = savedIndex.getAll(1);
      
      savedRequest.onsuccess = () => {
        const savedRecords = savedRequest.result;
        
        console.log('\n💾 RECORDS FROM SAVED INDEX (saved = 1):');
        savedRecords.forEach(record => {
          console.log(`- ${record.artist} - ${record.title} | saved: ${record.saved} (${typeof record.saved})`);
        });
        
        // Check for the test record specifically
        const testRecord = allRecords.find(r => r.id === 'test-unsaved-record-v6');
        if (testRecord) {
          console.log('\n🧪 TEST UNSAVED RECORD:');
          console.log(`ID: ${testRecord.id}`);
          console.log(`Saved: ${testRecord.saved} (${typeof testRecord.saved})`);
          console.log(`Should appear in saved list: ${testRecord.saved === 1 ? 'YES' : 'NO'}`);
          
          const isInSavedList = savedRecords.some(r => r.id === 'test-unsaved-record-v6');
          console.log(`Actually appears in saved list: ${isInSavedList ? 'YES' : 'NO'}`);
          
          if (isInSavedList && testRecord.saved !== 1) {
            console.log('❌ PROBLEM: Unsaved record appears in saved list!');
          } else {
            console.log('✅ Filtering working correctly for test record');
          }
        } else {
          console.log('\n📝 Test unsaved record not found in database');
        }
        
        db.close();
      };
    };
  };
}

// Run the verification
verifyFilteringIssue();
