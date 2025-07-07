// Simple IndexedDB debug - paste this in browser console
(async function() {
  console.log('🔍 CHECKING INDEXEDDB FOR DUPLICATES');
  
  const dbRequest = indexedDB.open('Chordium', 4);
  
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');
    
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result;
      console.log(`Found ${records.length} records:`);
      
      // Group by artist-title to find duplicates
      const groups = {};
      records.forEach(record => {
        const key = `${record.artist.toLowerCase()}-${record.title.toLowerCase()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(record);
      });
      
      // Show duplicates
      Object.entries(groups).forEach(([key, records]) => {
        if (records.length > 1) {
          console.log(`\n🔥 DUPLICATE: ${key} (${records.length} records)`);
          records.forEach(r => {
            console.log(`  - ID: ${r.id}, Saved: ${r.saved}, Access: ${r.accessCount}`);
          });
        }
      });
      
      // Show all record IDs for reference
      console.log('\n📝 All Record IDs:');
      records.forEach(r => {
        console.log(`${r.id} - ${r.artist}: ${r.title} (saved: ${r.saved})`);
      });
    };
    
    db.close();
  };
  
  dbRequest.onerror = (event) => {
    console.error('❌ Failed to open database:', event.target.error);
  };
})();
