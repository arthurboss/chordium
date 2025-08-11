import { useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import { useSingleChordSheet } from "@/storage/hooks/use-single-chord-sheet";
import type { RouteParams } from "./chord-viewer.types";

// Utils
import { resolveChordSheetPath } from "./utils/path-resolver";
import { createChordSheetData } from "./utils/chord-sheet-data";

// Hooks
import { useNavigation } from "@/hooks/use-navigation";
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

  // Convert URL parameters to chord sheet storage path
  const path = resolveChordSheetPath(routeParams);

  // Fetch single chord sheet data from IndexedDB
  const chordSheetResult = useSingleChordSheet({ path });

  // Create complete chord sheet data object (only if chord sheet exists)
  const chordSheetData = chordSheetResult.chordSheet
    ? createChordSheetData(chordSheetResult.chordSheet, path)
    : null;

  // Navigation handlers
  const navigation = useNavigation();
  const isFromMyChordSheets = chordSheetResult.chordSheet?.storage?.saved ?? false;

  const handleBack = () => {
    return navigation.navigateBack();
  };

  // Chord sheet operations using focused hooks
  const { handleSave } = useChordSheetSave(chordSheetData);
  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );

  // Loading state
  if (chordSheetResult.isLoading) {
    return <ChordViewerLoading />;
  }

  // Error state
  if (chordSheetResult.error) {
    return (
      <ChordViewerError
        error={chordSheetResult.error}
        navigation={navigation}
        onBack={handleBack}
      />
    );
  }

  // Guard against missing chord sheet data
  if (!chordSheetData) {
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
      <Header />
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
          hideDeleteButton={!isFromMyChordSheets}
          hideSaveButton={isFromMyChordSheets}
          isFromMyChordSheets={isFromMyChordSheets}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
