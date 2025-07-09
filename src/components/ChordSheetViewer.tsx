import { Button } from "@/components/ui/button";
import ChordDisplay from "@/components/ChordDisplay";
import { RefObject, useState, useEffect } from "react";
import { ChordSheet } from "../types/chordSheet";
import ChordHeader from './ChordDisplay/ChordHeader';

interface ChordSheetViewerProps {
  chordSheet: ChordSheet;
  chordContent?: string; // Direct chord content (for search results)
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (path: string) => void; // Pass the IndexedDB key (path) for deletion
  onUpdate: (content: string) => void;
  backButtonLabel?: string;
  deleteButtonLabel?: string;
  deleteButtonVariant?: "outline" | "destructive" | "default";
  hideDeleteButton?: boolean;
  path?: string; // The actual path from Song object (API response)
}

const ChordSheetViewer = ({
  chordSheet,
  chordContent: directChordContent,
  chordDisplayRef,
  onBack,
  onDelete,
  onUpdate,
  backButtonLabel = "Back to My Chord Sheets",
  deleteButtonLabel = "Delete Chord Sheet",
  deleteButtonVariant = "destructive",
  hideDeleteButton = false,
  path
}: ChordSheetViewerProps) => {
  const [chordContent, setChordContent] = useState<string>('');

  console.log('🎸 CHORD SHEET VIEWER DEBUG:');
  console.log('Received chordSheet prop:', chordSheet);
  console.log('ChordSheet title:', chordSheet.title);
  console.log('ChordSheet artist:', chordSheet.artist);
  console.log('Received path:', path);
  console.log('Direct chord content provided:', !!directChordContent);

  // Load chord sheet content - use direct content if provided, otherwise use from chordSheet
  useEffect(() => {
    const loadChordContent = async () => {
      console.log('🔍 LOADING CHORD CONTENT:');

      if (directChordContent) {
        console.log('✅ Using direct chord content (search result)');
        console.log('Direct content preview:', directChordContent.substring(0, 100) + '...');
        setChordContent(directChordContent);
        return;
      }

      // Use chord content from the ChordSheet object (for My Chord Sheets)
      console.log('✅ Using chord content from ChordSheet object');
      setChordContent(chordSheet.songChords || '');
    };

    loadChordContent();
  }, [chordSheet, directChordContent]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mr-2"
          tabIndex={0}
          aria-label={backButtonLabel}
        >
          {backButtonLabel}
        </Button>
        {!hideDeleteButton && (
          <Button
            size="sm"
            variant={deleteButtonVariant}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete button clicked, calling onDelete with path:', path);
              if (onDelete && path) {
                onDelete(path);
              } else {
                console.error('onDelete is not provided or path is missing!', { onDelete: !!onDelete, path });
              }
            }}
            tabIndex={0}
            aria-label={deleteButtonLabel || `Delete ${chordSheet.title}`}
          >
            {deleteButtonLabel || "Delete Chord Sheet"}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <ChordHeader
          title={chordSheet.title}
          artist={chordSheet.artist}
        />

        <div ref={chordDisplayRef} className="mt-6">
          <ChordDisplay
            content={chordContent}
            onSave={onUpdate}
            aria-label={`Chord sheet for ${chordSheet.title} by ${chordSheet.artist}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChordSheetViewer;
