// Browser test for boolean saved functionality
// Copy and paste this entire script into the browser console after the app has loaded

async function testBooleanSavedFunctionality() {
  console.log('🧪 TESTING BOOLEAN SAVED FUNCTIONALITY');
  
  try {
    console.log('\n1️⃣ Opening database version 8...');
    const dbRequest = indexedDB.open('Chordium', 8);
    
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
        const booleanSaved = allRecords.filter(r => typeof r.saved === 'boolean' && r.saved === true);
        const booleanUnsaved = allRecords.filter(r => typeof r.saved === 'boolean' && r.saved === false);
        const stringSaved = allRecords.filter(r => typeof r.saved === 'string' && r.saved === 'saved');
        const stringUnsaved = allRecords.filter(r => typeof r.saved === 'string' && r.saved === 'unsaved');
        const numberSaved = allRecords.filter(r => typeof r.saved === 'number' && r.saved === 1);
        const numberUnsaved = allRecords.filter(r => typeof r.saved === 'number' && r.saved === 0);
        
        console.log(`   Boolean saved (true): ${booleanSaved.length}`);
        console.log(`   Boolean unsaved (false): ${booleanUnsaved.length}`);
        console.log(`   String saved ('saved'): ${stringSaved.length}`);
        console.log(`   String unsaved ('unsaved'): ${stringUnsaved.length}`);
        console.log(`   Number saved (1): ${numberSaved.length}`);
        console.log(`   Number unsaved (0): ${numberUnsaved.length}`);
        
        // Show sample records
        if (booleanSaved.length > 0) {
          console.log('   Sample boolean saved records:');
          booleanSaved.slice(0, 3).forEach(r => {
            console.log(`     - ${r.artist} - ${r.title} (saved: ${r.saved}, type: ${typeof r.saved})`);
          });
        }
        
        console.log('\n2️⃣ Testing manual filtering (what repository.getAllSaved() does):');
        const manualSavedFilter = allRecords.filter(r => r.saved === true);
        console.log(`   Manual filter found ${manualSavedFilter.length} saved records`);
        
        console.log('\n3️⃣ Testing saved index with different approaches:');
        
        // Check if saved index exists
        const indexNames = Array.from(store.indexNames);
        console.log('   Available indexes:', indexNames);
        
        if (indexNames.includes('saved')) {
          const savedIndex = store.index('saved');
          
          // Try different approaches to query boolean values
          console.log('   Trying different index query approaches...');
          
          // Approach 1: Try querying with boolean true
          try {
            const booleanRequest = savedIndex.getAll(true);
            booleanRequest.onsuccess = () => {
              console.log(`   Index query (true): ${booleanRequest.result.length} records`);
            };
            booleanRequest.onerror = () => {
              console.log('   Index query (true): Failed');
            };
          } catch (e) {
            console.log('   Index query (true): Error -', e.message);
          }
          
          // Approach 2: Try getting all values from index
          try {
            const allIndexRequest = savedIndex.getAll();
            allIndexRequest.onsuccess = () => {
              const indexResults = allIndexRequest.result;
              const indexSaved = indexResults.filter(r => r.saved === true);
              console.log(`   Index getAll(): ${indexResults.length} total, ${indexSaved.length} saved`);
            };
            allIndexRequest.onerror = () => {
              console.log('   Index getAll(): Failed');
            };
          } catch (e) {
            console.log('   Index getAll(): Error -', e.message);
          }
          
          // Approach 3: Try key range
          try {
            const keyRange = IDBKeyRange.only(true);
            const rangeRequest = savedIndex.getAll(keyRange);
            rangeRequest.onsuccess = () => {
              console.log(`   Index key range (true): ${rangeRequest.result.length} records`);
            };
            rangeRequest.onerror = () => {
              console.log('   Index key range (true): Failed');
            };
          } catch (e) {
            console.log('   Index key range (true): Error -', e.message);
          }
        }
        
        console.log('\n🎯 ANALYSIS:');
        console.log('- Migration to boolean values:', booleanSaved.length + booleanUnsaved.length > 0 ? '✅ Working' : '❌ Not working');
        console.log('- Manual filtering (what we use now):', manualSavedFilter.length > 0 ? '✅ Working' : '❌ Not working');
        console.log('- Index compatibility with booleans: Testing above...');
        
        console.log('\nTo complete the test:');
        console.log('1. Check the index query results above');
        console.log('2. Navigate to "My Chord Sheets" to see if UI works');
        console.log('3. Try saving/unsaving a song');
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
testBooleanSavedFunctionality();
