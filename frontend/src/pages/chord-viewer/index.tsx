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
import { ChordViewerError } from "./components/chord-viewer-error";
import LoadingState from "@/components/LoadingState";

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

  // Create complete chord sheet data object (only if metadata exists)
  const chordSheetData = chordSheetResult.metadata
    ? createChordSheetData(
      {
        title: chordSheetResult.metadata.title,
        artist: chordSheetResult.metadata.artist,
        songKey: chordSheetResult.metadata.songKey,
        guitarTuning: chordSheetResult.metadata.guitarTuning,
        guitarCapo: chordSheetResult.metadata.guitarCapo,
      },
      {
        songChords: chordSheetResult.content?.songChords || '',
      },
      path
    )
    : null;

  // Local state for saved status to update UI immediately after save
  const [isSaved, setIsSaved] = useState(
    chordSheetResult.metadata?.storage?.saved ?? false
  );

  // Keep isSaved in sync with chordSheetResult
  useEffect(() => {
    setIsSaved(chordSheetResult.metadata?.storage?.saved ?? false);
  }, [chordSheetResult.metadata?.storage?.saved]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-load from API if not found locally
  useEffect(() => {
    if (!chordSheetResult.chordSheet && !chordSheetResult.isFromAPI && !chordSheetResult.isLoading && path) {
      chordSheetResult.loadFromAPI();
    }
  }, [chordSheetResult, path]);

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
    return <LoadingState />
  } else if (chordSheetResult.error) {
    return (
      <ChordViewerError
        error={chordSheetResult.error}
        navigation={navigation}
        onBack={handleBack}
      />
    );
  } else if (!chordSheetResult.metadata) {
    return (
      <ChordViewerError
        error="Chord sheet not found"
        navigation={navigation}
        onBack={handleBack}
      />
    );
  }

  return (
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
        chordContent={chordSheetResult.content?.songChords ?? ''}
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
  );
};

export default ChordViewer;
