// Browser cleanup script for duplicate records
// Run this in the browser console after starting the development server

async function cleanupDuplicateRecords() {
  console.log('🧹 CLEANING UP DUPLICATE RECORDS');
  
  try {
    // Import the duplicate cleaner
    const { cleanupDuplicateRecords: cleanup } = await import('/src/storage/utils/duplicate-record-cleaner.js');
    
    console.log('Starting cleanup process...');
    const result = await cleanup();
    
    console.log('✅ Cleanup completed!');
    console.log('📊 Cleanup Summary:');
    console.log(`- Records found: ${result.foundDuplicates.length}`);
    console.log(`- Records merged: ${result.mergedCount}`);
    console.log(`- Records kept: ${result.keptCount}`);
    console.log(`- Records deleted: ${result.deletedCount}`);
    
    if (result.foundDuplicates.length > 0) {
      console.log('\n🔍 Duplicate records found:');
      result.foundDuplicates.forEach(group => {
        console.log(`\n"${group.correctKey}" group:`);
        group.records.forEach(record => {
          console.log(`  - ${record.id} (saved: ${record.saved}, access: ${record.accessCount})`);
        });
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to cleanup duplicate records:', error);
    return null;
  }
}

// Also add a function to debug current state
async function debugCurrentState() {
  try {
    // Re-run the debug function to see current state
    return await debugIndexedDB();
  } catch (error) {
    console.error('❌ Failed to debug current state:', error);
    return null;
  }
}

// Make functions available globally
window.cleanupDuplicateRecords = cleanupDuplicateRecords;
window.debugCurrentState = debugCurrentState;

console.log('🔧 Cleanup utilities loaded!');
console.log('📝 Available commands:');
console.log('  - cleanupDuplicateRecords() - Remove duplicate records');
console.log('  - debugCurrentState() - Check current IndexedDB state');
