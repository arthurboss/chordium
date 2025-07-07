// Browser script to fix sample songs in database
// Copy and paste this entire script into the browser console

async function fixSampleSongs() {
  console.log('🔧 FIXING SAMPLE SONGS IN DATABASE');
  
  try {
    console.log('\n1️⃣ Opening database and checking current state...');
    const dbRequest = indexedDB.open('Chordium', 9);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      
      // First, let's see what we have
      const readTransaction = db.transaction(['chordSheets'], 'readonly');
      const readStore = readTransaction.objectStore('chordSheets');
      
      const getAllRequest = readStore.getAll();
      getAllRequest.onsuccess = () => {
        const allRecords = getAllRequest.result;
        console.log('📊 Current database state:');
        console.log(`   Total records: ${allRecords.length}`);
        
        // Find sample songs (Wonderwall and Hotel California)
        const sampleSongs = allRecords.filter(r => 
          (r.artist === 'Oasis' && r.title === 'Wonderwall') ||
          (r.artist === 'Eagles' && r.title === 'Hotel California')
        );
        
        console.log(`   Sample songs found: ${sampleSongs.length}`);
        sampleSongs.forEach(song => {
          console.log(`     - ${song.artist} - ${song.title} (saved: ${song.saved}, type: ${typeof song.saved})`);
        });
        
        // Check if they need fixing
        const needsFixing = sampleSongs.filter(s => typeof s.saved !== 'number' || s.saved !== 1);
        
        if (needsFixing.length === 0) {
          console.log('✅ All sample songs already have correct saved values (1)');
          
          // Test the index query
          const savedIndex = readStore.index('saved');
          const indexRequest = savedIndex.getAll(1);
          indexRequest.onsuccess = () => {
            const savedRecords = indexRequest.result;
            const savedSampleSongs = savedRecords.filter(r => 
              (r.artist === 'Oasis' && r.title === 'Wonderwall') ||
              (r.artist === 'Eagles' && r.title === 'Hotel California')
            );
            console.log(`✅ Index query returns ${savedSampleSongs.length} sample songs`);
            if (savedSampleSongs.length > 0) {
              console.log('🎉 Sample songs are working correctly!');
            } else {
              console.log('⚠️ Sample songs not returned by index query');
            }
          };
        } else {
          console.log(`🔧 Need to fix ${needsFixing.length} sample songs...`);
          
          // Fix the sample songs
          const writeTransaction = db.transaction(['chordSheets'], 'readwrite');
          const writeStore = writeTransaction.objectStore('chordSheets');
          
          needsFixing.forEach(song => {
            console.log(`🔧 Fixing ${song.artist} - ${song.title}`);
            song.saved = 1; // Set to number 1
            writeStore.put(song);
          });
          
          writeTransaction.oncomplete = () => {
            console.log('✅ Sample songs fixed! Refresh "My Chord Sheets" to see them.');
          };
          
          writeTransaction.onerror = () => {
            console.error('❌ Failed to fix sample songs');
          };
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

// Run the fix
fixSampleSongs();
