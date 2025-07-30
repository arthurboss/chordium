import { useState, useEffect } from "react";
import { getDatabase } from "@/storage/stores/chord-sheets/database/connection";
import { getChordSheet } from "@/storage/stores/chord-sheets/operations";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import { SampleChordSheetsService, indexedDBStorage } from "@/storage/services/sample-chord-sheets";
import type { ChordSheet } from "@chordium/types";

/**
 * Hook that coordinates database initialization and sample loading
 * using traditional React patterns for reliability
 */
export function useChordSheetData(path: string) {
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Wait for database to be ready
        await getDatabase();
        
        // Step 2: Load samples in development mode (only runs once due to duplicate prevention)
        const sampleService = new SampleChordSheetsService(indexedDBStorage);
        await sampleService.loadSampleChordSheets();
        
        if (cancelled) return;
        
        // Step 3: Get the chord sheet
        const storedChordSheet = await getChordSheet(path);
        
        if (cancelled) return;
        
        if (storedChordSheet?.storage?.saved) {
          const domainChordSheet = storedToChordSheet(storedChordSheet);
          setChordSheet(domainChordSheet);
        } else {
          setChordSheet(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading chord sheet:", err);
          setError("Failed to load chord sheet from storage");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { chordSheet, isLoading, error };
}
