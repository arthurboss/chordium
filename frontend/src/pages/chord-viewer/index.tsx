import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import SongViewer from "@/components/SongViewer";
import { useChordSheetWithFallback } from "@/hooks/useChordSheetWithFallback";
import type { RouteParams } from "./chord-viewer.types";

// Utils
import { resolveChordSheetPath } from "./utils/path-resolver";
import { type JamPayload, decodeChordSheet, JAM_QR_PREFIX } from "@/utils/chordSheetQR";
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

  // Decode chord sheet from ?d= QR param if present
  const [searchParams] = useSearchParams();
  const [jamPayload, setJamPayload] = useState<JamPayload | null>(null);

  useEffect(() => {
    const d = searchParams.get('d');
    if (!d) return;
    decodeChordSheet(JAM_QR_PREFIX + d).then(payload => {
      if (payload) setJamPayload(payload);
    });
  }, [searchParams]);

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

  // Auto-load from API if not found locally (skip when jam QR param is present)
  const hasJamParam = searchParams.has('d');
  useEffect(() => {
    if (!hasJamParam && !chordSheetResult.chordSheet && !chordSheetResult.isFromAPI && !chordSheetResult.isLoading && path) {
      chordSheetResult.loadFromAPI();
    }
  }, [hasJamParam, chordSheetResult, path]);

  // Navigation handlers
  const navigation = useNavigation();

  const handleBack = () => {
    return navigation.navigateBack();
  };

  // Build chord sheet data from jam payload if present (for save functionality)
  const jamChordSheetData = jamPayload ? {
    chordSheet: {
      title: jamPayload.title,
      artist: jamPayload.artist,
      songKey: jamPayload.songKey,
      guitarTuning: (jamPayload.guitarTuning ?? ['E', 'A', 'D', 'G', 'B', 'E']) as [string, string, string, string, string, string],
      guitarCapo: jamPayload.guitarCapo,
      songChords: jamPayload.songChords,
    },
    path,
  } : null;

  // Chord sheet operations using focused hooks
  const { handleSave: baseHandleSave } = useChordSheetSave(chordSheetData ?? jamChordSheetData);
  // Wrap handleSave to update local isSaved state immediately after save
  const handleSave = async () => {
    await baseHandleSave();
    setIsSaved(true);
  };
  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );



  // When the chord sheet was loaded from a QR code, build the data directly from
  // the payload without going through the API / IndexedDB fallback chain.
  if (jamPayload && !chordSheetResult.metadata) {
    const jamChordSheet = {
      title: jamPayload.title,
      artist: jamPayload.artist,
      songKey: jamPayload.songKey,
      guitarTuning: jamPayload.guitarTuning ?? ['E', 'A', 'D', 'G', 'B', 'E'] as [string, string, string, string, string, string],
      guitarCapo: jamPayload.guitarCapo,
      songChords: jamPayload.songChords,
    };

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <SongViewer
            song={{
              song: { title: jamPayload.title, artist: jamPayload.artist, path },
              chordSheet: jamChordSheet,
            }}
            chordContent={jamPayload.songChords}
            chordDisplayRef={chordDisplayRef}
            onBack={handleBack}
            onDelete={handleDelete}
            onSave={handleSave}
            onUpdate={() => {}}
            hideDeleteButton={true}
            hideSaveButton={false}
          />
        </main>
      </div>
    );
  }

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
    </div>
  );
};

export default ChordViewer;
