// Test to verify that getAllSaved() method is working correctly
// Run this in the browser console

async function testGetAllSavedMethod() {
  console.log('🧪 TESTING getAllSaved() METHOD DIRECTLY');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      
      console.log('\n1️⃣ Manual verification - what should getAllSaved return:');
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      const savedIndex = store.index('saved');
      
      // This is exactly what our getAllSaved method should do
      const request = savedIndex.getAll(1);
      
      request.onsuccess = () => {
        const dbRecords = request.result;
        console.log(`Found ${dbRecords.length} records with saved = 1`);
        
        // Convert to chord sheets (like our method does)
        const chordSheets = dbRecords.map(dbRecord => {
          const record = { ...dbRecord, saved: dbRecord.saved === 1 };
          return record.chordSheet;
        });
        
        console.log(`Converted to ${chordSheets.length} chord sheets`);
        chordSheets.forEach((cs, index) => {
          if (cs) {
            console.log(`${index + 1}. ${cs.artist} - ${cs.title}`);
          }
        });
        
        console.log('\n2️⃣ Now checking if any records with saved = 0 exist:');
        const unsavedRequest = savedIndex.getAll(0);
        
        unsavedRequest.onsuccess = () => {
          const unsavedRecords = unsavedRequest.result;
          console.log(`Found ${unsavedRecords.length} records with saved = 0`);
          
          if (unsavedRecords.length > 0) {
            console.log('These should NOT appear in My Chord Sheets:');
            unsavedRecords.forEach((record, index) => {
              console.log(`${index + 1}. ${record.artist} - ${record.title} (saved: ${record.saved})`);
            });
          }
          
          console.log('\n3️⃣ EXPECTED BEHAVIOR:');
          console.log(`- My Chord Sheets should show: ${chordSheets.length} songs`);
          console.log(`- Should NOT show: ${unsavedRecords.length} unsaved songs`);
          
          if (unsavedRecords.length > 0 && chordSheets.length > 0) {
            console.log('\n❓ If you see both types in the UI, there might be:');
            console.log('1. A UI caching issue');
            console.log('2. Multiple data sources being used');
            console.log('3. The repository method not being called correctly');
          }
          
          db.close();
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

// Test if there's a UI refresh issue
async function testUIRefresh() {
  console.log('\n🔄 TESTING UI REFRESH ISSUE');
  
  console.log('To test if this is a UI refresh issue:');
  console.log('1. Go to the My Chord Sheets tab');
  console.log('2. Note how many songs you see');
  console.log('3. Refresh the page (F5)');
  console.log('4. Go back to My Chord Sheets tab');
  console.log('5. See if the count changes');
  console.log('');
  console.log('If the count changes after refresh, it\s a UI caching issue.');
  console.log('If it stays the same, the repository method is returning wrong data.');
}

console.log('🚀 Running getAllSaved method test...');
testGetAllSavedMethod();

setTimeout(() => {
  testUIRefresh();
}, 3000);
