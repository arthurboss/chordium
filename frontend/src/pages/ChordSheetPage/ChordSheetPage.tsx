import { useRef, useEffect } from "react";

// Components
import { ChordSheetPreRendered } from "./components/ChordSheetPreRendered";
import { ChordSheetContent } from "./components/ChordSheetContent";

// Hooks
import { useChordSheetData } from "./hooks/useChordSheetData";
import { useChordSheetActions } from "./hooks/useChordSheetActions";

// Utils
import { extractTitleAndArtistFromUrl } from "./utils/url-parser";

// Types
import type { ChordSheetPageProps } from "./ChordSheetPage.types";

/**
 * ChordSheetPage component - Unified chord sheet display with pre-rendering support
 * 
 * Handles all rendering states (loading, error, success) and pre-rendering mode
 * in a single component following the Single Responsibility Principle.
 * 
 * @param isPrerenderMode - When true, renders with loading states for pre-rendering
 */
export const ChordSheetPage = ({ isPrerenderMode = false }: ChordSheetPageProps) => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  // Custom hooks for data and actions
  const { path, routeParams, chordSheetResult, chordSheetData, isSaved, setIsSaved } = useChordSheetData();
  const { handleBack, handlePreRenderBack, handleSave, handleDelete } = useChordSheetActions(
    chordSheetData,
    path,
    isSaved,
    setIsSaved
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // In pre-render mode, always show pre-rendered structure
  if (isPrerenderMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <ChordSheetPreRendered
            title="Loading..."
            artist="Loading..."
            chordDisplayRef={chordDisplayRef}
            onBack={handlePreRenderBack}
          />
        </main>
      </div>
    );
  }

  // For real routes, show pre-rendered structure while loading or if no data
  const shouldShowPreRenderedStructure = 
    chordSheetResult.isLoading || 
    !chordSheetResult.metadata || 
    chordSheetResult.error;

  if (shouldShowPreRenderedStructure) {
    const { title, artist } = extractTitleAndArtistFromUrl(routeParams);
    
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <ChordSheetPreRendered
            title={title}
            artist={artist}
            chordDisplayRef={chordDisplayRef}
            onBack={handlePreRenderBack}
          />
        </main>
      </div>
    );
  }

  // If we reach here, we have valid data to display
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <ChordSheetContent
          song={{
            song: {
              title: chordSheetData!.chordSheet.title,
              artist: chordSheetData!.chordSheet.artist,
              path: chordSheetData!.path
            },
            chordSheet: chordSheetData!.chordSheet
          }}
          chordContent={chordSheetResult.content?.songChords ?? ''}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDelete}
          onSave={handleSave}
          onUpdate={() => {}}
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
