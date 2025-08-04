/**
 * Chord sheet data management hook
 * 
 * Implements smart loading strategy: IndexedDB → API → Cache
 * Handles database initialization and provides unified chord sheet access
 */

import { useState, useEffect } from "react";
import type { ChordSheet } from "@chordium/types";
import type { UseChordSheetResult, UseChordSheetParams } from "./use-chord-sheet.types";
import getChordSheet from "@/storage/stores/chord-sheets/operations/get-chord-sheet";
import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import { useDatabaseReady } from "@/storage/hooks/useDatabaseReady";
import { fetchChordSheetFromAPI } from "@/services/api/fetch-chord-sheet";

/**
 * Attempts to fetch chord sheet from API when not found in storage
 * Automatically stores fetched chord sheets in IndexedDB with saved: false
 */
async function fetchFromAPI(path: string): Promise<{ chordSheet: ChordSheet | null; error: string | null }> {
  try {
    const apiChordSheet = await fetchChordSheetFromAPI(path);
    
    if (apiChordSheet) {
      // Store the fetched chord sheet in IndexedDB with saved: false
      await storeChordSheet(apiChordSheet, false, path);
      return { chordSheet: apiChordSheet, error: null };
    } else {
      return { chordSheet: null, error: "Chord sheet not found" };
    }
  } catch (apiError) {
    console.error("API fetch failed:", apiError);
    return { chordSheet: null, error: "Failed to fetch chord sheet from server" };
  }
}

/**
 * Loads and manages chord sheet data with smart caching strategy
 * 
 * Provides unified access to chord sheets regardless of their storage state
 * (saved by user vs cached from API). Handles database initialization timing
 * and sample chord sheet path resolution automatically.
 * 
 * @param params - Hook parameters containing path identifier
 * @returns Chord sheet data with loading state, saved flag, and refetch function
 */
export function useChordSheet({ path }: UseChordSheetParams): UseChordSheetResult {
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  // Wait for database to be ready before proceeding
  const { isReady: isDatabaseReady, error: databaseError } = useDatabaseReady();

  // Function to force refetch from storage (useful after save operations)
  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    // If database isn't ready yet, keep loading
    if (!isDatabaseReady) {
      setIsLoading(true);
      setError(null);
      return;
    }
    
    // If database failed to initialize, show that error
    if (databaseError) {
      setIsLoading(false);
      setError(`Database initialization failed: ${databaseError.message}`);
      return;
    }
    
    // Now that database is ready, check if path is provided
    if (!path) {
      setChordSheet(null);
      setIsSaved(false);
      setIsLoading(false);
      setError("Path is required");
      return;
    }

    let cancelled = false;

    const loadChordSheet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try IndexedDB first (includes sample path resolution and DB initialization)
        const stored = await getChordSheet(path);
        
        if (cancelled) return;

        if (stored?.storage?.saved !== undefined) {
          // Found in storage - convert to domain model
          const domainChordSheet = storedToChordSheet(stored);
          setChordSheet(domainChordSheet);
          setIsSaved(stored.storage.saved);
        } else {
          // Not found in storage - try API fetch
          const apiResult = await fetchFromAPI(path);
          
          if (cancelled) return;
          
          if (apiResult.chordSheet && !apiResult.error) {
            // Successfully fetched and stored - get updated state from storage
            const storedAfterFetch = await getChordSheet(path);
            if (storedAfterFetch?.storage?.saved !== undefined) {
              const domainChordSheet = storedToChordSheet(storedAfterFetch);
              setChordSheet(domainChordSheet);
              setIsSaved(storedAfterFetch.storage.saved);
            } else {
              // Fallback - use the API result directly
              setChordSheet(apiResult.chordSheet);
              setIsSaved(false);
            }
          } else {
            // API fetch failed or returned no chord sheet
            setChordSheet(null);
            setIsSaved(false);
            setError(apiResult.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading chord sheet:", err);
          setError(err instanceof Error ? err.message : "Failed to load chord sheet");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadChordSheet();

    return () => {
      cancelled = true;
    };
  }, [path, isDatabaseReady, databaseError, refetchTrigger]);

  return { chordSheet, isSaved, isLoading, error, refetch };
}
