/**
 * Debug version of the IndexedDB sample songs hook with logging
 * 
 * This helps us understand what's happening with the sample songs loading
 */

import { useState, useEffect } from "react";
import { SampleSongsService, indexedDBStorage } from "@/storage/services/sample-songs";

export function useDebugIndexedDB() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const debugSampleSongs = async () => {
      const logs: string[] = [];
      
      try {
        logs.push(`🔍 Starting IndexedDB debug check...`);
        logs.push(`📊 Environment: ${import.meta.env.MODE}`);
        logs.push(`🛠️ Dev mode: ${import.meta.env.DEV}`);
        
        // Test IndexedDB storage connection
        logs.push(`📚 Testing IndexedDB storage...`);
        const existingSongs = await indexedDBStorage.getAllSaved();
        logs.push(`📊 Found ${existingSongs.length} existing saved songs`);
        
        existingSongs.forEach((song, index) => {
          logs.push(`  ${index + 1}. ${song.artist} - ${song.title} (saved: ${song.storage.saved})`);
        });
        
        // Test sample songs service
        logs.push(`🎵 Testing sample songs service...`);
        const sampleSongsService = new SampleSongsService(indexedDBStorage);
        await sampleSongsService.loadSampleSongs();
        logs.push(`✅ Sample songs service completed`);
        
        // Check again after loading
        const songsAfterLoad = await indexedDBStorage.getAllSaved();
        logs.push(`📊 After loading: ${songsAfterLoad.length} saved songs`);
        
        songsAfterLoad.forEach((song, index) => {
          logs.push(`  ${index + 1}. ${song.artist} - ${song.title} (saved: ${song.storage.saved})`);
        });
        
      } catch (error) {
        logs.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
          logs.push(`📍 Stack trace: ${error.stack.split('\n')[0]}`);
        }
        console.error('Debug error:', error);
      }
      
      setDebugInfo(logs);
    };
    
    debugSampleSongs();
  }, []);

  return { debugInfo };
}
