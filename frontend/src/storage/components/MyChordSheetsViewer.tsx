/**
 * My Chord Sheets Viewer Component
 * 
 * This component displays saved chord sheets from IndexedDB only.
 * It never fetches from backend and only shows locally saved content.
 * Completely isolated from search/fetch logic.
 */

import { useState, useEffect } from 'react';
import type { ChordSheet } from '@chordium/types';
import { getChordSheet } from "@/storage/stores/chord-sheets/operations";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import SongViewer from '@/components/SongViewer';
import type { MyChordSheetsViewerProps } from './types';

/**
 * Viewer component for My Chord Sheets that loads from IndexedDB only
 */
export function MyChordSheetsViewer(props: Readonly<MyChordSheetsViewerProps>) {
  const { selectedSong, chordDisplayRef, onBack, onDelete, onUpdate } = props;
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedChordSheet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only load from IndexedDB saved chord sheets - using pure operation
        const storedChordSheet = await getChordSheet(selectedSong.path);
        
        // Check if it exists and is saved (business logic in component)
        if (storedChordSheet?.storage?.saved) {
          // Convert to domain format
          const domainChordSheet = storedToChordSheet(storedChordSheet);
          setChordSheet(domainChordSheet);
        } else {
          // This shouldn't happen if UI is properly filtered, but handle gracefully
          setError('Chord sheet not found in saved items');
        }
      } catch (err) {
        setError('Failed to load chord sheet from storage');
        console.error('Error loading saved chord sheet:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedChordSheet();
  }, [selectedSong.path]);

  // Handle delete - convert to expected signature
  const handleDelete = () => {
    onDelete(selectedSong.path);
  };

  // Handle update - convert to expected signature  
  const handleUpdate = (content: string) => {
    onUpdate(content);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading saved chord sheet...</div>
      </div>
    );
  }

  if (error || !chordSheet) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to My Chord Sheets
        </button>
        <div className="text-red-600 text-center">
          {error || 'Chord sheet not available'}
        </div>
      </div>
    );
  }

  return (
    <SongViewer
      song={{
        song: selectedSong,
        chordSheet: chordSheet
      }}
      chordDisplayRef={chordDisplayRef}
      onBack={onBack}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      hideDeleteButton={false}
      hideSaveButton={true}
      isFromMyChordSheets={true}
    />
  );
}
