import { useRef, useEffect } from "react";

// Components
import { ChordSheetContent } from "./components/ChordSheetContent";
import ChordDisplay from "@/components/ChordDisplay";
import { PageHeader } from "@/components/PageHeader";
import { ChordMetadata } from "@/components/ChordDisplay/ChordMetadata";

// Hooks
import { useChordSheetData } from "./hooks/useChordSheetData";
import { useChordSheetActions } from "./hooks/useChordSheetActions";

// Utils
import { extractTitleAndArtistFromUrl } from "./utils/url-parser";

// Types
import type { ChordSheetPageProps } from "./ChordSheetPage.types";

/**
 * ChordSheetPage component - Unified chord sheet display with all rendering states
 * 
 * Handles all rendering states (loading, error, success) and pre-rendering mode
 * in a single unified approach that visualizes all possible outputs.
 * 
 * @param isPrerenderMode - When true, renders with loading states for pre-rendering
 */
export const ChordSheetPage = ({ isPrerenderMode = false }: ChordSheetPageProps) => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  // Custom hooks for data and actions
  const { path, routeParams, chordSheetResult, chordSheetData, isSaved, setIsSaved } = useChordSheetData();
  const { handleBack, handleSave, handleDelete } = useChordSheetActions(
    chordSheetData,
    path,
    isSaved,
    setIsSaved
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ============================================================================
  // UNIFIED RENDERING LOGIC - All possible outputs visualized here
  // ============================================================================

  // Determine the current state and what to display
  const isPreRenderMode = isPrerenderMode;
  const isLoading = chordSheetResult.isLoading;
  const hasError = chordSheetResult.error;
  const hasNoData = !chordSheetResult.metadata;
  const hasValidData = chordSheetData && chordSheetResult.metadata;

  // Determine title and artist based on state
  let displayTitle: string;
  let displayArtist: string;
  let onBackHandler: () => void;

  if (isPreRenderMode) {
    // Pre-render mode: Generic loading state
    displayTitle = "Loading...";
    displayArtist = "Loading...";
    onBackHandler = handleBack;
  } else if (hasValidData) {
    // Success state: Use actual data
    displayTitle = chordSheetData.chordSheet.title;
    displayArtist = chordSheetData.chordSheet.artist;
    onBackHandler = handleBack;
  } else {
    // Loading/Error state: Use URL-derived values
    const { title, artist } = extractTitleAndArtistFromUrl(routeParams);
    displayTitle = title;
    displayArtist = artist;
    onBackHandler = handleBack;
  }

  // Create mock chord sheet for loading states
  const mockChordSheet = {
    title: displayTitle,
    artist: displayArtist,
    songKey: "Loading...",
    guitarTuning: ["E", "A", "D", "G", "B", "E"],
    guitarCapo: 0,
    songChords: ""
  };

  // ============================================================================
  // SINGLE RETURN PATH - All states handled in one place
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <div className="animate-fade-in flex flex-col">
          {/* Page Header - Always present */}
          <PageHeader
            onBack={onBackHandler}
            title={displayTitle}
          />

          {/* Chord Metadata - Always present */}
          <div className="py-2 sm:py-4 px-4">
            <ChordMetadata chordSheet={hasValidData ? chordSheetData.chordSheet : mockChordSheet} />
          </div>

          {/* Chord Display - Different content based on state */}
          {hasValidData ? (
            // SUCCESS STATE: Show actual content with full functionality
            <ChordSheetContent
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
              onUpdate={() => {}}
              hideDeleteButton={!isSaved}
              hideSaveButton={isSaved}
              isFromMyChordSheets={isSaved}
              useProgressiveLoading={chordSheetResult.isFromAPI}
              loadContent={chordSheetResult.loadContent}
              isContentLoading={chordSheetResult.isContentLoading}
            />
          ) : (
            // LOADING/ERROR/PRE-RENDER STATE: Show loading structure
            <ChordDisplay
              ref={chordDisplayRef}
              chordSheet={mockChordSheet}
              content=""
              isLoading={true}
            />
          )}
        </div>
      </main>
    </div>
  );
};
