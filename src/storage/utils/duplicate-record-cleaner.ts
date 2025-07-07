import { ChordSheetRepository } from '../repositories/chord-sheet-repository';
import { generateUnifiedCacheKey } from './unified-cache-key-generator';
import { ChordSheetRecord } from '../types/chord-sheet-record';

/**
 * Migration utility to clean up duplicate chord sheet records
 * caused by inconsistent ID generation functions
 */
export class DuplicateRecordCleaner {
  private readonly repository: ChordSheetRepository;

  constructor() {
    this.repository = new ChordSheetRepository();
  }

  /**
   * Find and merge duplicate records for the same song
   * Keeps the record with saved: true if it exists, otherwise keeps the most recent
   */
  async cleanupDuplicates(): Promise<{
    duplicatesFound: number;
    duplicatesRemoved: number;
    recordsUpdated: number;
  }> {
    await this.repository.initialize();
    
    try {
      // Get all records
      const allRecords = await this.getAllRecords();
      console.log(`🔍 Found ${allRecords.length} total records`);
      
      // Group records by their correct unified key  
      const groupedRecords = this.groupRecordsByUnifiedKey(allRecords);
      
      let duplicatesFound = 0;
      let duplicatesRemoved = 0;
      let recordsUpdated = 0;
      
      // Process each group
      for (const [unifiedKey, records] of groupedRecords.entries()) {
        if (records.length > 1) {
          duplicatesFound += records.length - 1;
          
          console.log(`\n🔍 Found ${records.length} duplicates for key: ${unifiedKey}`);
          records.forEach(r => console.log(`  - ID: ${r.id} | Saved: ${r.saved} | Artist: "${r.artist}" | Title: "${r.title}"`));
          
          // Merge duplicates
          const result = await this.mergeDuplicateRecords(unifiedKey, records);
          duplicatesRemoved += result.removed;
          recordsUpdated += result.updated;
        }
      }
      
      console.log(`\n✅ Cleanup complete:`);
      console.log(`📊 Duplicates found: ${duplicatesFound}`);
      console.log(`🗑️ Duplicates removed: ${duplicatesRemoved}`);
      console.log(`🔄 Records updated: ${recordsUpdated}`);
      
      return {
        duplicatesFound,
        duplicatesRemoved,
        recordsUpdated
      };
      
    } finally {
      await this.repository.close();
    }
  }

  /**
   * Get all chord sheet records from the database
   */
  private async getAllRecords(): Promise<ChordSheetRecord[]> {
    const db = await this.repository['connection'].initialize();
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as ChordSheetRecord[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Group records by their correct unified key
   */
  private groupRecordsByUnifiedKey(records: ChordSheetRecord[]): Map<string, ChordSheetRecord[]> {
    const groups = new Map<string, ChordSheetRecord[]>();
    
    for (const record of records) {
      const unifiedKey = generateUnifiedCacheKey(record.artist, record.title);
      
      if (!unifiedKey) {
        console.warn(`⚠️ Could not generate unified key for record:`, record);
        continue;
      }
      
      if (!groups.has(unifiedKey)) {
        groups.set(unifiedKey, []);
      }
      groups.get(unifiedKey)!.push(record);
    }
    
    return groups;
  }

  /**
   * Merge duplicate records, keeping the best one and removing others
   */
  private async mergeDuplicateRecords(
    unifiedKey: string, 
    records: ChordSheetRecord[]
  ): Promise<{ removed: number; updated: number }> {
    // Sort records by priority:
    // 1. Saved records first
    // 2. Most recently accessed
    // 3. Most recent timestamp
    const sortedRecords = records.sort((a, b) => {
      // Saved records have priority
      if (a.saved && !b.saved) return -1;
      if (!a.saved && b.saved) return 1;
      
      // Then by access count (higher is better)
      if (a.accessCount !== b.accessCount) {
        return b.accessCount - a.accessCount;
      }
      
      // Finally by timestamp (newer is better)
      return b.timestamp - a.timestamp;
    });
    
    const keepRecord = sortedRecords[0];
    const removeRecords = sortedRecords.slice(1);
    
    console.log(`📌 Keeping record: ${keepRecord.id} (saved: ${keepRecord.saved}, accessed: ${keepRecord.accessCount})`);
    
    // Update the kept record to use the correct unified key if needed
    let updated = 0;
    if (keepRecord.id !== unifiedKey) {
      console.log(`🔄 Updating record ID from "${keepRecord.id}" to "${unifiedKey}"`);
      
      // Delete old record
      await this.deleteRecord(keepRecord.id);
      
      // Create new record with correct ID
      const updatedRecord = { ...keepRecord, id: unifiedKey };
      await this.putRecord(updatedRecord);
      updated = 1;
    }
    
    // Remove duplicate records
    let removed = 0;
    for (const record of removeRecords) {
      console.log(`🗑️ Removing duplicate: ${record.id}`);
      await this.deleteRecord(record.id);
      removed++;
    }
    
    return { removed, updated };
  }

  /**
   * Delete a record by ID
   */
  private async deleteRecord(id: string): Promise<void> {
    const db = await this.repository['connection'].initialize();
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Put a record to the store
   */
  private async putRecord(record: ChordSheetRecord): Promise<void> {
    const db = await this.repository['connection'].initialize();
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Convenience function to run the duplicate cleanup
 */
export async function cleanupDuplicateChordSheets(): Promise<void> {
  const cleaner = new DuplicateRecordCleaner();
  await cleaner.cleanupDuplicates();
}
