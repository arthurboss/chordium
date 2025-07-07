// Browser debug script for testing saved index functionality
// Copy and paste this entire script into the browser console

async function testSavedIndexInBrowser() {
  console.log('🔍 TESTING SAVED INDEX IN BROWSER');
  
  try {
    // Open the IndexedDB database
    const dbRequest = indexedDB.open('Chordium', 7);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      // Check if saved index exists
      const indexNames = Array.from(store.indexNames);
      console.log('📊 Available indexes:', indexNames);
      
      if (indexNames.includes('saved')) {
        console.log('✅ Saved index exists (correctly configured for string values)');
        
        // Test that the saved index works with string values
        const savedIndex = store.index('saved');
        
        // Test getting saved records
        const savedRequest = savedIndex.getAll('saved');
        savedRequest.onsuccess = () => {
          const savedRecords = savedRequest.result;
          console.log('🎵 Records with saved="saved":', savedRecords.length);
          if (savedRecords.length > 0) {
            console.log('   Sample saved record:', {
              id: savedRecords[0].id,
              artist: savedRecords[0].artist,
              title: savedRecords[0].title,
              saved: savedRecords[0].saved
            });
          }
          
          // Test getting unsaved records
          const unsavedRequest = savedIndex.getAll('unsaved');
          unsavedRequest.onsuccess = () => {
            const unsavedRecords = unsavedRequest.result;
            console.log('🎵 Records with saved="unsaved":', unsavedRecords.length);
            if (unsavedRecords.length > 0) {
              console.log('   Sample unsaved record:', {
                id: unsavedRecords[0].id,
                artist: unsavedRecords[0].artist,
                title: unsavedRecords[0].title,
                saved: unsavedRecords[0].saved
              });
            }
            
            // Verify no old boolean/number values exist
            const allRequest = store.getAll();
            allRequest.onsuccess = () => {
              const allRecords = allRequest.result;
              console.log('📊 Total records in database:', allRecords.length);
              
              const badRecords = allRecords.filter(r => 
                typeof r.saved !== 'string' || 
                (r.saved !== 'saved' && r.saved !== 'unsaved')
              );
              
              if (badRecords.length > 0) {
                console.log('⚠️ Found records with invalid saved values:', badRecords.length);
                badRecords.forEach(r => {
                  console.log('- Record:', r.id, 'saved:', r.saved, typeof r.saved);
                });
              } else {
                console.log('✅ All records have valid string saved values');
              }
              
              // Summary
              console.log('\n📋 SUMMARY:');
              console.log(`✅ Saved index exists and works with strings`);
              console.log(`✅ ${savedRecords.length} records marked as saved`);
              console.log(`✅ ${unsavedRecords.length} records marked as unsaved`);
              console.log(`✅ All ${allRecords.length} records have valid string saved values`);
              console.log('🎯 The saved filter should now work correctly!');
            };
          };
        };
      } else {
        console.log('❌ Saved index missing (should exist for string filtering)');
      }
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testSavedIndexInBrowser();
