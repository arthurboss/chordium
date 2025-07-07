// Debug script to check what records are actually being returned by getAllSaved
// Run this in the browser console

async function debugWhatIsInMyChordSheets() {
  console.log('🔍 DEBUGGING WHAT IS ACTUALLY RETURNED BY getAllSaved');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      console.log('\n1️⃣ RAW DATABASE CONTENT:');
      const allRequest = store.getAll();
      
      allRequest.onsuccess = () => {
        const allRecords = allRequest.result;
        console.log('Total records in database:', allRecords.length);
        
        allRecords.forEach((record, index) => {
          console.log(`${index + 1}. ${record.artist} - ${record.title}`);
          console.log(`   ID: ${record.id}`);
          console.log(`   Saved: ${record.saved} (${typeof record.saved})`);
          console.log(`   Should be in My Chord Sheets: ${record.saved === 1 ? 'YES' : 'NO'}`);
          console.log('');
        });
        
        console.log('\n2️⃣ SIMULATING getAllSaved() METHOD:');
        const savedIndex = store.index('saved');
        const savedRequest = savedIndex.getAll(1);
        
        savedRequest.onsuccess = () => {
          const savedRecords = savedRequest.result;
          console.log('Records returned by savedIndex.getAll(1):', savedRecords.length);
          
          savedRecords.forEach((dbRecord, index) => {
            // Simulate the recordFromDB conversion
            const record = {
              ...dbRecord,
              saved: dbRecord.saved === 1
            };
            
            console.log(`${index + 1}. ${record.artist} - ${record.title}`);
            console.log(`   Saved (after conversion): ${record.saved} (${typeof record.saved})`);
            console.log(`   Chord Sheet exists: ${record.chordSheet ? 'YES' : 'NO'}`);
            
            if (record.chordSheet) {
              console.log(`   Chord Sheet title: ${record.chordSheet.title}`);
              console.log(`   Chord Sheet artist: ${record.chordSheet.artist}`);
            }
            console.log('');
          });
          
          console.log('\n3️⃣ FINAL RESULT (what getAllSaved should return):');
          const chordSheets = savedRecords.map(dbRecord => {
            const record = { ...dbRecord, saved: dbRecord.saved === 1 };
            return record.chordSheet;
          });
          
          console.log('Chord sheets that would be returned:', chordSheets.length);
          chordSheets.forEach((chordSheet, index) => {
            if (chordSheet) {
              console.log(`${index + 1}. ${chordSheet.artist} - ${chordSheet.title}`);
            } else {
              console.log(`${index + 1}. NULL CHORD SHEET`);
            }
          });
          
          console.log('\n📊 SUMMARY:');
          console.log('Total DB records:', allRecords.length);
          console.log('Records with saved = 1:', savedRecords.length);
          console.log('Valid chord sheets returned:', chordSheets.filter(cs => cs).length);
          
          db.close();
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

// Also check what the UI is actually receiving
async function debugUIData() {
  console.log('\n🖥️ CHECKING WHAT THE UI RECEIVES');
  
  try {
    // This simulates getMyChordSheetsAsSongs function
    console.log('Simulating getMyChordSheetsAsSongs...');
    console.log('This function calls getChordSheets() which calls repository.getAllSaved()');
    console.log('Then converts each ChordSheet to a Song object');
    console.log('');
    console.log('If you see unexpected songs in the My Chord Sheets tab,');
    console.log('the issue might be:');
    console.log('1. Test records have saved = 0 but are still being returned');
    console.log('2. Boolean conversion is not working properly');
    console.log('3. Index is not filtering correctly');
  } catch (error) {
    console.error('❌ UI debug failed:', error);
  }
}

console.log('🚀 Running comprehensive debugging...');
debugWhatIsInMyChordSheets();

setTimeout(() => {
  debugUIData();
}, 3000);
