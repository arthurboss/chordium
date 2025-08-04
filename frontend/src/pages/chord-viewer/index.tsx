import { useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import { useChordSheet } from "@/hooks/use-chord-sheet";
import type { RouteParams } from "./chord-viewer.types";

// Utils
import { resolveChordSheetPath } from "./utils/path-resolver";
import { createChordSheetData } from "./utils/chord-sheet-data";

// Hooks
import { useChordViewerNavigation } from "./hooks/use-chord-viewer-navigation";
import { useChordSheetSave } from "./hooks/use-chord-sheet-save";
import { useChordSheetDelete } from "./hooks/use-chord-sheet-delete";

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
  
  // Fetch chord sheet data (handles database readiness internally)
  const chordSheetResult = useChordSheet({ path });
  
  // Create complete chord sheet data object (only if chord sheet exists)
  const chordSheetData = chordSheetResult.chordSheet 
    ? createChordSheetData(chordSheetResult.chordSheet, path)
    : null;
  
  // Navigation handlers
  const navigation = useChordViewerNavigation();
  const isFromMyChordSheets = chordSheetResult.isSaved;
  
  const handleBack = () => {
    return isFromMyChordSheets 
      ? navigation.navigateToMyChordSheets() 
      : navigation.navigateToHome();
  };
  
  // Chord sheet operations using focused hooks
  const { handleSave } = useChordSheetSave(chordSheetData, chordSheetResult.refetch);
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
