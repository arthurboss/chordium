import { useRef, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import SongViewer from "@/components/SongViewer";
import { useChordSheetWithFallback } from "@/hooks/useChordSheetWithFallback";
import { useJamSession } from "@/contexts/JamSessionContext";
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

  // Jam Session Hook
  const { sessionState, isSessionActive } = useJamSession();
  const isLiveSession = path === 'live' || path === 'session';

  // Fetch chord sheet data with API fallback
  const chordSheetResult = useChordSheetWithFallback(isLiveSession ? undefined : path);

  // Create complete chord sheet data object
  let chordSheetData = null;

  if (isLiveSession && isSessionActive) {
    chordSheetData = createChordSheetData(
      {
        title: sessionState.songTitle || 'Live Jam Session',
        artist: sessionState.songArtist || 'Connected Peer',
        songKey: 'C',
        guitarTuning: 'E Standard' as any, // Cast to avoid strict literal check for now
        guitarCapo: sessionState.capo,
      },
      {
        songChords: sessionState.songContent || ''
      },
      'live-session'
    );
  } else if (chordSheetResult.metadata) {
    chordSheetData = createChordSheetData(
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
    );
  }

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



  // Unified guard logic for standard mode
  if (!isLiveSession) {
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
  } else {
    // Live Session Guard
    if (!isSessionActive) {
      return (
        <ChordViewerError
          error="No active jam session. Please join a session first."
          navigation={navigation}
          onBack={handleBack}
        />
      );
    }
    // If waiting for content
    if (!chordSheetData || !sessionState.songContent) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center animate-pulse">
          <div>
            <h2 className="text-xl font-bold mb-2">Waiting for Host...</h2>
            <p className="text-muted-foreground">The host will share a chord sheet soon.</p>
          </div>
        </div>
      );
    }
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
          chordContent={isLiveSession ? (sessionState.songContent || '') : (chordSheetResult.content?.songChords ?? '')}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDelete}
          onSave={handleSave}
          onUpdate={() => { }}
          hideDeleteButton={!isSaved || isLiveSession}
          hideSaveButton={isSaved || isLiveSession}
          isFromMyChordSheets={isSaved}
          useProgressiveLoading={!isLiveSession && chordSheetResult.isFromAPI}
          loadContent={chordSheetResult.loadContent}
          isContentLoading={!isLiveSession && chordSheetResult.isContentLoading}
        />
      </main>
    </div>
  );
};

export default ChordViewer;
