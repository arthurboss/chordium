import { useRef, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import SongViewer from "@/components/SongViewer";
import { useChordSheetWithFallback } from "@/hooks/useChordSheetWithFallback";
import type { RouteParams } from "./chord-viewer.types";

// Utils
import { resolveChordSheetPath } from "./utils/path-resolver";
import { createChordSheetData } from "./utils/chord-sheet-data";
import { extractNavigationData } from "./utils/navigation-data";

// Hooks
import { useNavigation } from "@/hooks/navigation";
import { useChordSheetSave, useChordSheetDelete } from "@/storage/hooks";

// Components
import { ChordViewerLoading } from "./components/chord-viewer-loading";
import { ChordViewerError } from "./components/chord-viewer-error";

/**
 * ChordViewer page component
 * Displays chord sheets with save/delete functionality and proper navigation
 */
const ChordViewer = () => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const routeParams = useParams() as RouteParams;
  const location = useLocation();

  // Try to get the path from navigation state first (most accurate)
  // Fall back to URL parameters if navigation state is not available
  const navigationData = extractNavigationData(location.state);
  const path = navigationData?.path || resolveChordSheetPath(routeParams);

  // Fetch chord sheet data with API fallback
  const chordSheetResult = useChordSheetWithFallback(path);

  // Create complete chord sheet data object (only if chord sheet exists)
  const chordSheetData = chordSheetResult.chordSheet
    ? createChordSheetData(chordSheetResult.chordSheet, path)
    : null;

  // Local state for saved status to update UI immediately after save
  const [isSaved, setIsSaved] = useState(
    chordSheetResult.chordSheet?.storage?.saved ?? false
  );

  // Keep isSaved in sync with chordSheetResult
  useEffect(() => {
    setIsSaved(chordSheetResult.chordSheet?.storage?.saved ?? false);
  }, [chordSheetResult.chordSheet?.storage?.saved]);

  // Auto-load from API if not found locally
  useEffect(() => {
    if (!chordSheetResult.chordSheet && !chordSheetResult.isFromAPI && !chordSheetResult.isLoading && path) {
      chordSheetResult.loadFromAPI();
    }
  }, [chordSheetResult.chordSheet, chordSheetResult.isFromAPI, chordSheetResult.isLoading, path, chordSheetResult.loadFromAPI]);

  // Navigation handlers
  const navigation = useNavigation();

  const handleBack = () => {
    return navigation.navigateBack();
  };

  // Chord sheet operations using focused hooks
  const { handleSave: baseHandleSave } = useChordSheetSave(chordSheetData);
  // Wrap handleSave to update local isSaved state immediately after save
  const handleSave = async () => {
    await baseHandleSave();
    setIsSaved(true);
  };
  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );



  // Unified guard logic: Only show loading, error, or missing data when not loading
  if (chordSheetResult.isLoading) {
    return <ChordViewerLoading />;
  } else if (chordSheetResult.error) {
    return (
      <ChordViewerError
        error={chordSheetResult.error}
        navigation={navigation}
        onBack={handleBack}
      />
    );
  } else if (!chordSheetData) {
    return (
      <ChordViewerError
        error="Chord sheet not found"
        navigation={navigation}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <SongViewer
          song={{
            song: {
              title: chordSheetData.chordSheet.title,
              artist: chordSheetData.chordSheet.artist,
              path: chordSheetData.path
            },
            chordSheet: chordSheetData.chordSheet
          }}
          chordContent={chordSheetResult.chordSheet?.songChords ?? ''}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDelete}
          onSave={handleSave}
          onUpdate={() => { }}
          hideDeleteButton={!isSaved}
          hideSaveButton={isSaved}
          isFromMyChordSheets={isSaved}
          useProgressiveLoading={chordSheetResult.isFromAPI}
          loadContent={chordSheetResult.loadContent}
          isContentLoading={chordSheetResult.isContentLoading}
        />
      </main>
    </div>
  );
};

export default ChordViewer;
