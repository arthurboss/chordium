import ChordSheetViewer from "@/components/ChordSheetViewer";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import StyleToolbar from "@/components/StyleToolbar";
import { Card } from "@/components/ui/card";
import { RefObject, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";
import type { Song } from "../types/song";
import type { ChordSheet, SongMetadata } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";
import { JamQRModal } from "@/features/jam-session/components/JamQRModal";
import { useChordDisplaySettings } from "@/hooks/use-chord-display-settings";
import { useCapoTranspose } from "@/hooks/useCapoTranspose";

interface SongViewerProps {
  song: { song: Song; chordSheet: ChordSheet & SongMetadata };
  chordContent?: string;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onSave?: () => void;
  onUpdate: (content: string) => void;
  hideDeleteButton?: boolean;
  hideSaveButton?: boolean;
  isFromMyChordSheets?: boolean;
  useProgressiveLoading?: boolean;
  loadContent?: () => Promise<void>;
  isContentLoading?: boolean;
  onViewModeChange?: (viewMode: string) => void;
  initialViewMode?: string;
}

const SongViewer = ({
  song,
  chordContent: directChordContent,
  chordDisplayRef,
  onBack,
  onDelete,
  onSave,
  onUpdate,
  hideDeleteButton = false,
  hideSaveButton = false,
  isFromMyChordSheets = false,
  useProgressiveLoading = false,
  loadContent,
  isContentLoading,
  onViewModeChange,
  initialViewMode,
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(14);
  const [viewMode, setViewMode] = useState(initialViewMode || 'tabs-on');

  const { content: lazyContent, isContentLoading: isLazyContentLoading } = useLazyChordSheet({
    path: isFromMyChordSheets ? songObj.path : ''
  });

  const chordContentToDisplay = useMemo(() => {
    if (directChordContent) return directChordContent;
    if (isFromMyChordSheets) return lazyContent || '';
    return chordSheet.songChords || '';
  }, [directChordContent, isFromMyChordSheets, lazyContent, chordSheet.songChords]);

  const chordSheetToDisplay = useMemo(() => chordSheet, [chordSheet]);

  const {
    transpose,
    setTranspose,
    defaultTranspose,
    capo,
    setCapo,
    defaultCapo,
  } = useChordDisplaySettings(chordContentToDisplay, chordSheetToDisplay.songKey, chordSheetToDisplay.guitarCapo, initialViewMode);

  const {
    handleCapoChange,
    handleTransposeChange,
    getCapoDisableStates,
    getTransposeDisableStates,
  } = useCapoTranspose({ capo, setCapo, transpose, setTranspose });

  const effectiveTranspose = transpose - (capo - defaultCapo);

  const handleAction = () => {
    if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(songObj.path);
    } else if (!hideSaveButton && !isFromMyChordSheets && onSave) {
      onSave();
    }
  };

  const shouldShowActionButton =
    (isFromMyChordSheets && !hideDeleteButton) ||
    (!hideSaveButton && !isFromMyChordSheets && !!onSave);

  const finalIsContentLoading = useProgressiveLoading
    ? isContentLoading
    : isLazyContentLoading;

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const title = chordSheetToDisplay.title;
  const artist = chordSheetToDisplay.artist;

  const handleArtistClick = useCallback(() => {
    const artistSlug = songObj.path.split("/")[0];
    sessionStorage.removeItem("chordium_search_query");
    try {
      sessionStorage.setItem(ARTIST_DISPLAY_NAME_KEY, JSON.stringify({ path: artistSlug, displayName: artist }));
    } catch {}
    navigate(`/${artistSlug}`);
  }, [artist, navigate, songObj.path]);

  return (
    <main id="page-chord-viewer" className="flex-1 w-full max-w-3xl mx-auto py-8 px-4 animate-fade-in flex flex-col gap-4">
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton && handleAction}
        isSaved={shouldShowActionButton && isFromMyChordSheets}
        title={title}
        artist={artist}
        onArtistClick={artist ? handleArtistClick : undefined}
        rightContent={
          chordContentToDisplay && (
            <JamQRModal chordSheet={{ ...chordSheetToDisplay, songChords: chordContentToDisplay }} />
          )
        }
        metadata={
          <ChordMetadata
            chordSheet={chordSheetToDisplay}
            controls={{
              transpose,
              defaultTranspose,
              handleTransposeChange,
              getTransposeDisableStates,
              capo,
              defaultCapo,
              handleCapoChange,
              getCapoDisableStates,
              songKey: chordSheetToDisplay.songKey,
            }}
          />
        }
      />
      <Card className="overflow-hidden">
        <StyleToolbar
          fontSize={fontSize}
          setFontSize={setFontSize}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
        />
      </Card>

      <ChordSheetViewer
        ref={chordDisplayRef}
        chordSheet={chordSheetToDisplay}
        content={chordContentToDisplay}
        onSave={onUpdate}
        isLoading={finalIsContentLoading}
        effectiveTranspose={effectiveTranspose}
        fontSize={fontSize}
        viewMode={viewMode}
      />
    </main>
  );
};

export default SongViewer;
