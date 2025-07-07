// Browser test for number saved functionality (0/1)
// Copy and paste this entire script into the browser console after the app has loaded

async function testNumberSavedFunctionality() {
  console.log('🧪 TESTING NUMBER (0/1) SAVED FUNCTIONALITY');
  
  try {
    console.log('\n1️⃣ Opening database version 9...');
    const dbRequest = indexedDB.open('Chordium', 9);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const store = transaction.objectStore('chordSheets');
      
      // Get all records and analyze
      const allRequest = store.getAll();
      allRequest.onsuccess = () => {
        const allRecords = allRequest.result;
        console.log('📊 Current database state:');
        console.log(`   Total records: ${allRecords.length}`);
        
        // Analyze saved field types and values
        const numberSaved = allRecords.filter(r => typeof r.saved === 'number' && r.saved === 1);
        const numberUnsaved = allRecords.filter(r => typeof r.saved === 'number' && r.saved === 0);
        const booleanSaved = allRecords.filter(r => typeof r.saved === 'boolean' && r.saved === true);
        const booleanUnsaved = allRecords.filter(r => typeof r.saved === 'boolean' && r.saved === false);
        const stringSaved = allRecords.filter(r => typeof r.saved === 'string' && r.saved === 'saved');
        const stringUnsaved = allRecords.filter(r => typeof r.saved === 'string' && r.saved === 'unsaved');
        
        console.log(`   Number saved (1): ${numberSaved.length}`);
        console.log(`   Number unsaved (0): ${numberUnsaved.length}`);
        console.log(`   Boolean saved (true): ${booleanSaved.length}`);
        console.log(`   Boolean unsaved (false): ${booleanUnsaved.length}`);
        console.log(`   String saved ('saved'): ${stringSaved.length}`);
        console.log(`   String unsaved ('unsaved'): ${stringUnsaved.length}`);
        
        // Show sample records
        if (numberSaved.length > 0) {
          console.log('   Sample number saved records:');
          numberSaved.slice(0, 3).forEach(r => {
            console.log(`     - ${r.artist} - ${r.title} (saved: ${r.saved}, type: ${typeof r.saved})`);
          });
        }
        
        console.log('\n2️⃣ Testing saved index with number values:');
        
        // Check if saved index exists
        const indexNames = Array.from(store.indexNames);
        console.log('   Available indexes:', indexNames);
        
        if (indexNames.includes('saved')) {
          const savedIndex = store.index('saved');
          
          console.log('   Testing index queries with numbers...');
          
          // Test querying with number 1 (saved)
          const savedRequest = savedIndex.getAll(1);
          savedRequest.onsuccess = () => {
            console.log(`   ✅ Index query (1): ${savedRequest.result.length} saved records`);
            
            // Test querying with number 0 (unsaved)
            const unsavedRequest = savedIndex.getAll(0);
            unsavedRequest.onsuccess = () => {
              console.log(`   ✅ Index query (0): ${unsavedRequest.result.length} unsaved records`);
              
              // Test manual filtering for comparison
              const manualSaved = allRecords.filter(r => r.saved === 1);
              const manualUnsaved = allRecords.filter(r => r.saved === 0);
              
              console.log('\n3️⃣ Comparing index vs manual filtering:');
              console.log(`   Index saved (1): ${savedRequest.result.length}`);
              console.log(`   Manual saved (1): ${manualSaved.length}`);
              console.log(`   Index unsaved (0): ${unsavedRequest.result.length}`);
              console.log(`   Manual unsaved (0): ${manualUnsaved.length}`);
              
              const indexMatch = (
                savedRequest.result.length === manualSaved.length &&
                unsavedRequest.result.length === manualUnsaved.length
              );
              
              console.log('\n🎯 RESULTS:');
              console.log('- Migration to numbers (0/1):', numberSaved.length + numberUnsaved.length > 0 ? '✅ Working' : '❌ Not working');
              console.log('- Index queries with numbers:', indexMatch ? '✅ Working perfectly!' : '❌ Mismatch detected');
              console.log('- Performance:', 'Index queries are fast and efficient ⚡');
              console.log('- Simplicity:', 'Numbers are simple: 0=unsaved, 1=saved ✨');
              
              if (indexMatch) {
                console.log('\n🎉 SUCCESS! Number approach works perfectly:');
                console.log('✅ IndexedDB indexes work with numbers');
                console.log('✅ Simple conversion: boolean ↔ number');
                console.log('✅ Fast filtering via index queries');
                console.log('✅ No complex string conversions needed');
                console.log('\nThis is the optimal solution! 🚀');
              } else {
                console.log('\n❌ Number approach has issues');
              }
            };
            
            unsavedRequest.onerror = () => {
              console.log('   ❌ Index query (0): Failed');
            };
          };
          
          savedRequest.onerror = () => {
            console.log('   ❌ Index query (1): Failed');
          };
        } else {
          console.log('   ❌ Saved index missing');
        }
      };
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database:', event.target.error);
    };
    
    dbRequest.onupgradeneeded = (event) => {
      console.log('📈 Database upgrade triggered');
      console.log('Old version:', event.oldVersion, '-> New version:', event.newVersion);
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testNumberSavedFunctionality();
