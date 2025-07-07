// TDD: Trace the exact data flow from repository to UI
// Run this in the browser console to see where the bug occurs

async function tddTraceDataFlow() {
  console.log('🔍 TDD: TRACING DATA FLOW FROM DATABASE TO UI');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 6);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      
      console.log('\n1️⃣ RAW DATABASE QUERY SIMULATION:');
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      const savedIndex = store.index('saved');
      
      // Step 1: What does savedIndex.getAll(1) return?
      const savedRequest = savedIndex.getAll(1);
      
      savedRequest.onsuccess = () => {
        const dbRecords = savedRequest.result;
        console.log('savedIndex.getAll(1) returned:', dbRecords.length, 'records');
        dbRecords.forEach(record => {
          console.log(`  - ${record.title} (saved: ${record.saved})`);
        });
        
        console.log('\n2️⃣ REPOSITORY.getAllSaved() SIMULATION:');
        // Step 2: Simulate recordFromDB conversion
        const convertedRecords = dbRecords.map(dbRecord => ({
          ...dbRecord,
          saved: dbRecord.saved === 1 // Convert number to boolean
        }));
        
        console.log('After recordFromDB conversion:');
        convertedRecords.forEach(record => {
          console.log(`  - ${record.title} (saved: ${record.saved}, type: ${typeof record.saved})`);
        });
        
        // Step 3: Extract chord sheets (final result of getAllSaved)
        const chordSheets = convertedRecords.map(record => record.chordSheet);
        
        console.log('\n3️⃣ FINAL getAllSaved() RESULT:');
        console.log('Chord sheets returned:', chordSheets.length);
        chordSheets.forEach(cs => {
          if (cs) {
            console.log(`  - ${cs.title} by ${cs.artist}`);
          }
        });
        
        console.log('\n4️⃣ UI DATA CONVERSION (getChordSheets -> chordSheetToSong):');
        // Step 4: Simulate what getMyChordSheetsAsSongs does
        console.log('getMyChordSheetsAsSongs() calls:');
        console.log('  -> getChordSheets() (calls repository.getAllSaved())');
        console.log('  -> maps each ChordSheet through chordSheetToSong()');
        
        // Simulate chordSheetToSong conversion
        const songs = chordSheets.map(chordSheet => {
          if (!chordSheet) return null;
          return {
            title: chordSheet.title,
            artist: chordSheet.artist,
            path: `${chordSheet.artist?.toLowerCase().replace(/\s+/g, '-')}-${chordSheet.title?.toLowerCase().replace(/\s+/g, '-')}`
          };
        }).filter(song => song !== null);
        
        console.log('\nFinal UI Song objects:');
        songs.forEach(song => {
          console.log(`  - ${song.title} by ${song.artist}`);
        });
        
        console.log('\n🎯 TDD ASSERTION:');
        const hasUnsavedSong = songs.some(song => song.title === 'Test Unsaved Song');
        
        if (hasUnsavedSong) {
          console.log('❌ BUG FOUND: Test Unsaved Song appears in final UI data');
          console.log('   This means the bug is NOT in getAllSaved() method');
          console.log('   The bug must be elsewhere in the data flow');
        } else {
          console.log('✅ DATA FLOW CORRECT: Test Unsaved Song filtered out properly');
          console.log('   If you still see it in UI, the bug is in React state/caching');
        }
        
        console.log('\n5️⃣ VERIFY WHAT UI CURRENTLY SHOWS:');
        console.log('Check the My Chord Sheets tab in the UI now.');
        console.log('Expected songs based on getAllSaved():');
        songs.forEach(song => console.log(`  - ${song.title}`));
        
        db.close();
      };
    };
    
  } catch (error) {
    console.error('❌ TDD trace failed:', error);
  }
}

// Check if there might be stale React state
async function tddCheckReactState() {
  console.log('\n🔄 TDD: CHECKING FOR REACT STATE ISSUES');
  
  console.log('Possible causes if UI shows wrong data:');
  console.log('1. React state not refreshing after repository changes');
  console.log('2. useSampleSongs hook has stale data');
  console.log('3. Browser cache/local storage interference');
  console.log('4. Multiple repository instances with different data');
  console.log('');
  console.log('Try refreshing the page and check again.');
  console.log('If problem persists, the issue is in the repository logic.');
}

console.log('🚀 Starting TDD data flow trace...');
tddTraceDataFlow();

setTimeout(() => {
  tddCheckReactState();
}, 3000);
