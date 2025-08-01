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
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import { useDatabaseReady } from "@/storage/hooks/useDatabaseReady";

/**
 * Loads and manages chord sheet data with smart caching strategy
 * 
 * Provides unified access to chord sheets regardless of their storage state
 * (saved by user vs cached from API). Handles database initialization timing
 * and sample chord sheet path resolution automatically.
 * 
 * @param params - Hook parameters containing path identifier
 * @returns Chord sheet data with loading state and saved flag
 */
export function useChordSheet({ path }: UseChordSheetParams): UseChordSheetResult {
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wait for database to be ready before proceeding
  const { isReady: isDatabaseReady, error: databaseError } = useDatabaseReady();

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
          // Not found in storage - will implement API fetch in next phase
          setChordSheet(null);
          setIsSaved(false);
          setError("Chord sheet not found in storage. API fetch not yet implemented.");
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
  }, [path, isDatabaseReady, databaseError]);

  return { chordSheet, isSaved, isLoading, error };
}
