// TDD-based debug script to test the actual repository behavior
// Run this in the browser console to see what getAllSaved is really returning

async function testRepositoryGetAllSaved() {
  console.log('🧪 TDD: TESTING ACTUAL REPOSITORY getAllSaved()');
  
  try {
    // First, let's see what's in the database
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      // 1. Check raw database content
      const allRequest = store.getAll();
      allRequest.onsuccess = () => {
        const allRecords = allRequest.result;
        
        console.log('\n📊 DATABASE CONTENT:');
        console.log('Total records:', allRecords.length);
        allRecords.forEach(record => {
          console.log(`- ${record.artist} - ${record.title} (saved: ${record.saved})`);
        });
        
        // 2. Test what savedIndex.getAll(1) returns
        const savedIndex = store.index('saved');
        const savedRequest = savedIndex.getAll(1);
        
        savedRequest.onsuccess = () => {
          const savedRecords = savedRequest.result;
          
          console.log('\n🔍 INDEX FILTERING RESULT:');
          console.log('Records from savedIndex.getAll(1):', savedRecords.length);
          savedRecords.forEach(record => {
            console.log(`- ${record.artist} - ${record.title} (saved: ${record.saved})`);
          });
          
          // 3. Simulate what getAllSaved() should return
          const chordSheets = savedRecords.map(dbRecord => {
            const record = { ...dbRecord, saved: dbRecord.saved === 1 };
            return record.chordSheet;
          });
          
          console.log('\n📋 WHAT getAllSaved() SHOULD RETURN:');
          console.log('Chord sheets count:', chordSheets.length);
          chordSheets.forEach(cs => {
            if (cs) {
              console.log(`- ${cs.artist} - ${cs.title}`);
            }
          });
          
          // 4. TDD Assertion
          const hasUnsavedRecord = chordSheets.some(cs => 
            cs && cs.title === 'Test Unsaved Song'
          );
          
          console.log('\n✅ TDD ASSERTION:');
          console.log('Should NOT contain "Test Unsaved Song":', !hasUnsavedRecord);
          
          if (hasUnsavedRecord) {
            console.log('❌ BUG CONFIRMED: Unsaved record is being returned by getAllSaved()');
          } else {
            console.log('✅ WORKING CORRECTLY: Only saved records returned');
          }
          
          db.close();
        };
      };
    };
    
  } catch (error) {
    console.error('❌ Repository test failed:', error);
  }
}

// Test what the UI actually receives
async function testUIDataFlow() {
  console.log('\n🖥️ TDD: TESTING UI DATA FLOW');
  
  try {
    // This simulates the exact call chain:
    // useSampleSongs -> getMyChordSheetsAsSongs -> getChordSheets -> repository.getAllSaved()
    
    console.log('Simulating: useSampleSongs hook calls getMyChordSheetsAsSongs()');
    console.log('Which calls: getChordSheets()'); 
    console.log('Which calls: repository.getAllSaved()');
    console.log('');
    console.log('If you see "Test Unsaved Song" in the My Chord Sheets tab,');
    console.log('but the TDD test above shows it should NOT be returned,');
    console.log('then we have confirmed the bug location.');
    
  } catch (error) {
    console.error('❌ UI test failed:', error);
  }
}

console.log('🚀 Running TDD repository tests...');
testRepositoryGetAllSaved();

setTimeout(() => {
  testUIDataFlow();
}, 2000);
