import ChordDisplay from "@/components/ChordDisplay";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import type { PreRenderedStructureProps } from "../ChordSheetPage.types";

/**
 * Pre-rendered structure component for chord sheet loading states
 * 
 * Displays the UI structure with loading placeholders while data is being fetched.
 * Used for both pre-rendering mode and loading states.
 */
export const ChordSheetPreRendered = ({ title, artist, chordDisplayRef, onBack }: PreRenderedStructureProps) => {
  const mockChordSheet = {
    title,
    artist,
    songKey: "Loading...",
    guitarTuning: ["E", "A", "D", "G", "B", "E"],
    guitarCapo: 0,
    songChords: ""
  };

  return (
    <div className="animate-fade-in flex flex-col">
      <PageHeader
        onBack={onBack}
        title={title}
      />
      <div className="py-2 sm:py-4 px-4">
        <ChordMetadata chordSheet={mockChordSheet} />
      </div>
      <ChordDisplay
        ref={chordDisplayRef}
        chordSheet={mockChordSheet}
        content=""
        isLoading={true}
      />
    </div>
  );
};
