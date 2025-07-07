// Debug script to check IndexedDB contents
// Run this in the browser console

async function debugIndexedDB() {
  console.log('🔍 DEBUGGING INDEXEDDB CONTENTS');
  
  try {
    // Open the IndexedDB database
    const dbRequest = indexedDB.open('Chordium', 8); // Use version 8
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Database version:', db.version);
      console.log('Object stores:', Array.from(db.objectStoreNames));
      
      // Check chordSheets store
      const transaction = db.transaction(['chordSheets'], 'readonly');
      const chordSheetsStore = transaction.objectStore('chordSheets');
      
      const getAllRequest = chordSheetsStore.getAll();
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        console.log('\n🎵 CHORD SHEETS STORE:');
        console.log('Total records:', records.length);
        
        records.forEach((record, index) => {
          console.log(`\n--- Record ${index + 1} ---`);
          console.log('ID:', record.id);
          console.log('Artist:', record.artist);
          console.log('Title:', record.title);
          console.log('Saved:', record.saved);
          console.log('Timestamp:', new Date(record.timestamp).toISOString());
          console.log('Access Count:', record.accessCount);
          console.log('Data Source:', record.dataSource);
          console.log('Version:', record.version);
          
          // Show retention policy fields
          if (record.deletedAt) {
            console.log('Deleted At:', new Date(record.deletedAt).toISOString());
            console.log('Deletion Age (hours):', ((Date.now() - record.deletedAt) / (1000 * 60 * 60)).toFixed(1));
          }
          
          // Calculate expiration
          const now = Date.now();
          if (record.saved) {
            console.log('Expiration: Never (saved song)');
          } else if (record.deletedAt) {
            const expiresAt = record.deletedAt + (24 * 60 * 60 * 1000); // 1 day
            const hoursUntilExpiry = ((expiresAt - now) / (1000 * 60 * 60)).toFixed(1);
            console.log('Expiration: Deleted songs expire in', hoursUntilExpiry, 'hours');
          } else {
            const expiresAt = record.timestamp + (7 * 24 * 60 * 60 * 1000); // 7 days
            const hoursUntilExpiry = ((expiresAt - now) / (1000 * 60 * 60)).toFixed(1);
            console.log('Expiration: Cached songs expire in', hoursUntilExpiry, 'hours');
          }
        });
      };
      
      // Check searchCache store
      const searchCacheTransaction = db.transaction(['searchCache'], 'readonly');
      const searchCacheStore = searchCacheTransaction.objectStore('searchCache');
      
      const getSearchCacheRequest = searchCacheStore.getAll();
      getSearchCacheRequest.onsuccess = () => {
        const searchRecords = getSearchCacheRequest.result;
        console.log('\n🔍 SEARCH CACHE STORE:');
        console.log('Total records:', searchRecords.length);
        
        searchRecords.forEach((record, index) => {
          console.log(`\n--- Search Record ${index + 1} ---`);
          console.log('ID:', record.id);
          console.log('Query:', record.query);
          console.log('Results count:', record.results?.length || 0);
          console.log('Search Type:', record.searchType);
          
          // Handle different timestamp formats
          if (record.timestamp) {
            console.log('Timestamp:', new Date(record.timestamp).toISOString());
          } else if (record.metadata?.cachedAt) {
            console.log('Cached At:', new Date(record.metadata.cachedAt).toISOString());
            console.log('Expires At:', new Date(record.metadata.expiresAt).toISOString());
          } else {
            console.log('Timestamp: Not found');
          }
        });
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

// Test the saved index functionality
async function testSavedIndex() {
  console.log('\n🧪 TESTING SAVED INDEX FUNCTIONALITY');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 8); // Use new version
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
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
          
          // Test getting unsaved records
          const unsavedRequest = savedIndex.getAll('unsaved');
          unsavedRequest.onsuccess = () => {
            const unsavedRecords = unsavedRequest.result;
            console.log('🎵 Records with saved="unsaved":', unsavedRecords.length);
            
            // Verify no old boolean/number values exist
            const allRequest = store.getAll();
            allRequest.onsuccess = () => {
              const allRecords = allRequest.result;
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
            };
          };
        };
      } else {
        console.log('❌ Saved index missing (should exist for string filtering)');
      }
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database for index test:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Error testing saved index:', error);
  }
}

// Function to clean up duplicate search cache entries
async function cleanupDuplicateSearchEntries() {
  console.log('\n🧹 CLEANING UP DUPLICATE SEARCH CACHE ENTRIES');
  
  try {
    const dbRequest = indexedDB.open('Chordium', 8);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        console.log('📊 Found', records.length, 'search cache records');
        
        // Group by normalized query to find duplicates
        const normalized = {};
        const toDelete = [];
        
        records.forEach(record => {
          // Normalize the query the same way we do in buildQueryKey
          const normalizedQuery = record.query
            .replace(/\/+$/, '') // Remove trailing slashes
            .replace(/[-\s]+/g, '_'); // Replace spaces and hyphens with underscores
          
          if (normalized[normalizedQuery]) {
            // This is a duplicate - mark for deletion (keep the newer one)
            const existing = normalized[normalizedQuery];
            const existingTime = existing.metadata?.cachedAt || existing.timestamp || 0;
            const currentTime = record.metadata?.cachedAt || record.timestamp || 0;
            
            if (currentTime > existingTime) {
              // Current record is newer, delete the existing one
              toDelete.push(existing.id);
              normalized[normalizedQuery] = record;
              console.log('🔄 Replacing older duplicate:', existing.id, '->', record.id);
            } else {
              // Existing record is newer, delete current one
              toDelete.push(record.id);
              console.log('🗑️ Deleting older duplicate:', record.id);
            }
          } else {
            normalized[normalizedQuery] = record;
          }
        });
        
        console.log('📊 Found', toDelete.length, 'duplicate records to delete');
        
        // Delete duplicates
        toDelete.forEach(id => {
          const deleteRequest = store.delete(id);
          deleteRequest.onsuccess = () => {
            console.log('✅ Deleted duplicate:', id);
          };
          deleteRequest.onerror = () => {
            console.error('❌ Failed to delete:', id, deleteRequest.error);
          };
        });
        
        if (toDelete.length === 0) {
          console.log('✅ No duplicates found');
        }
      };
      
      getAllRequest.onerror = () => {
        console.error('❌ Failed to get search cache records:', getAllRequest.error);
      };
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database for cleanup:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
  }
}

// Run the debug function
debugIndexedDB();

// Test search cache functionality
async function testSearchCache() {
  console.log('\n🧪 TESTING SEARCH CACHE FUNCTIONALITY');
  
  try {
    // Try to manually add a test search record
    const dbRequest = indexedDB.open('Chordium', 8);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      
      // Create a test record
      const testRecord = {
        id: 'search_test_query|',
        query: 'test query|',
        results: [{ title: 'Test Song', artist: 'Test Artist', path: 'test/path' }],
        timestamp: Date.now(),
        searchType: 'songs',
        dataSource: 'api',
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          version: '1.0'
        }
      };
      
      const addRequest = store.put(testRecord);
      addRequest.onsuccess = () => {
        console.log('✅ Test record added successfully');
        
        // Try to retrieve it
        const getRequest = store.get('search_test_query|');
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            console.log('✅ Test record retrieved:', getRequest.result);
          } else {
            console.log('❌ Test record not found');
          }
        };
      };
      
      addRequest.onerror = () => {
        console.error('❌ Failed to add test record:', addRequest.error);
      };
      
      db.close();
    };
    
    dbRequest.onerror = (event) => {
      console.error('❌ Failed to open database for search cache test:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ Error testing search cache:', error);
  }
}

// Also run the index test
setTimeout(() => {
  testSavedIndex();
}, 1000);

// Run cleanup after a short delay
setTimeout(() => {
  cleanupDuplicateSearchEntries();
}, 2000);

// Test search cache after cleanup
setTimeout(() => {
  testSearchCache();
}, 3000);
