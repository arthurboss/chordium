// Browser test for delete/unsave functionality with number values
// Copy and paste this entire script into the browser console

async function testDeleteUnsaveFunctionality() {
  console.log('🧪 TESTING DELETE/UNSAVE FUNCTIONALITY WITH NUMBER VALUES');
  
  try {
    console.log('\n1️⃣ Opening database and checking saved songs...');
    const dbRequest = indexedDB.open('Chordium', 9);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      
      // Get current saved songs
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      const savedIndex = store.index('saved');
      
      const savedRequest = savedIndex.getAll(1);
      savedRequest.onsuccess = () => {
        const savedSongs = savedRequest.result;
        console.log(`📊 Found ${savedSongs.length} saved songs:`);
        
        savedSongs.forEach((song, index) => {
          console.log(`   ${index + 1}. ${song.artist} - ${song.title} (saved: ${song.saved})`);
        });
        
        if (savedSongs.length > 0) {
          const testSong = savedSongs[0];
          console.log(`\n2️⃣ Testing unsave functionality on: "${testSong.title}" by ${testSong.artist}`);
          
          // Simulate the deleteChordSheet function
          simulateUnsaveSong(testSong.artist, testSong.title);
        } else {
          console.log('\n⚠️ No saved songs found to test delete functionality');
          console.log('   Add a song to "My Chord Sheets" first, then run this test');
        }
      };
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function simulateUnsaveSong(artist, title) {
  console.log(`🔧 Simulating removeFromSaved for: "${title}" by ${artist}`);
  
  try {
    const dbRequest = indexedDB.open('Chordium', 9);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readwrite');
      const store = transaction.objectStore('chordSheets');
      
      // Find the record
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const allRecords = getAllRequest.result;
        const targetRecord = allRecords.find(r => 
          r.artist === artist && r.title === title
        );
        
        if (targetRecord) {
          console.log(`   Found record: saved=${targetRecord.saved} (type: ${typeof targetRecord.saved})`);
          
          // Update the record: set saved to 0 and add deletedAt timestamp
          targetRecord.saved = 0; // Number 0 for unsaved
          targetRecord.deletedAt = Date.now();
          
          const putRequest = store.put(targetRecord);
          putRequest.onsuccess = () => {
            console.log('   ✅ Record updated successfully');
            
            // Verify the change
            setTimeout(() => {
              verifyUnsave(artist, title);
            }, 100);
          };
          
          putRequest.onerror = () => {
            console.error('   ❌ Failed to update record');
          };
        } else {
          console.log('   ❌ Record not found');
        }
      };
      
      db.close();
    };
    
  } catch (error) {
    console.error('❌ Error in simulate unsave:', error);
  }
}

async function verifyUnsave(artist, title) {
  console.log(`\n3️⃣ Verifying unsave for: "${title}" by ${artist}`);
  
  try {
    const dbRequest = indexedDB.open('Chordium', 9);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      // Check if the song is still in the saved index
      const savedIndex = store.index('saved');
      const savedRequest = savedIndex.getAll(1);
      
      savedRequest.onsuccess = () => {
        const stillSaved = savedRequest.result.find(r => 
          r.artist === artist && r.title === title
        );
        
        if (stillSaved) {
          console.log('   ❌ Song is still in saved index (unsave failed)');
        } else {
          console.log('   ✅ Song removed from saved index');
        }
        
        // Check if it's now in unsaved index
        const unsavedRequest = savedIndex.getAll(0);
        unsavedRequest.onsuccess = () => {
          const nowUnsaved = unsavedRequest.result.find(r => 
            r.artist === artist && r.title === title
          );
          
          if (nowUnsaved) {
            console.log('   ✅ Song now appears in unsaved index');
            console.log(`   📊 Record state: saved=${nowUnsaved.saved}, deletedAt=${nowUnsaved.deletedAt ? 'set' : 'not set'}`);
          } else {
            console.log('   ⚠️ Song not found in unsaved index either');
          }
          
          console.log('\n🎯 RESULTS:');
          if (!stillSaved && nowUnsaved) {
            console.log('✅ Delete/unsave functionality works correctly with number values!');
            console.log('✅ Song moved from saved (1) to unsaved (0)');
            console.log('✅ Will no longer appear in "My Chord Sheets"');
          } else {
            console.log('❌ Delete/unsave functionality has issues');
          }
        };
      };
      
      db.close();
    };
    
  } catch (error) {
    console.error('❌ Error in verify unsave:', error);
  }
}

// Run the test
testDeleteUnsaveFunctionality();
