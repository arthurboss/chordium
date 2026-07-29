import ChordSheetViewer from "@/components/ChordSheetViewer";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import StyleToolbar from "@/components/StyleToolbar";
import { Card } from "@/components/ui/card";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";
import { storeArtistDisplayName } from "@/search/utils/artist/artist-display-name-cache";
import type { Song } from "../types/song";
import type { ChordSheet, SongMetadata } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";
import { useChordDisplaySettings } from "@/hooks/use-chord-display-settings";
import { useCapoTranspose } from "@/hooks/useCapoTranspose";
import { useChordEditor } from "@/hooks/use-chord-editor";
import { Pencil, Music, Guitar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JamQRModal } from "@/features/jam-session/components/JamQRModal";
import { guitarTuningToString, mapStringToGuitarTuning } from "@/utils/guitar-tuning-utils";

export interface UpdatedSongData {
  songChords: string;
  title: string;
  artist: string;
  songKey: string;
  guitarTuning: ChordSheet["guitarTuning"];
  guitarCapo: number;
}

interface SongViewerProps {
  song: { song: Song; chordSheet: ChordSheet & SongMetadata };
  chordContent?: string;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onSave?: () => void;
  onUpdate: (data: UpdatedSongData) => void;
  hideDeleteButton?: boolean;
  hideSaveButton?: boolean;
  isFromMyChordSheets?: boolean;
  useProgressiveLoading?: boolean;
  loadContent?: () => Promise<void>;
  isContentLoading?: boolean;
  onViewModeChange?: (viewMode: string) => void;
  initialViewMode?: string;
  /** A distinct full arrangement (with tabs) is available to toggle to. */
  hasFullArrangement?: boolean;
  /** Whether the full arrangement is currently displayed. */
  showFull?: boolean;
  /** Toggle between simplified and full arrangements. */
  onToggleArrangement?: (showFull: boolean) => void;
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
  hasFullArrangement = false,
  showFull = false,
  onToggleArrangement,
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(14);
  const [viewMode, setViewMode] = useState(initialViewMode || "tabs-on");

  const { content: lazyContent, isContentLoading: isLazyContentLoading } = useLazyChordSheet({
    path: isFromMyChordSheets ? songObj.path : "",
  });

  const chordContentToDisplay = useMemo(() => {
    if (directChordContent) return directChordContent;
    if (isFromMyChordSheets) return lazyContent || "";
    return chordSheet.songChords || "";
  }, [directChordContent, isFromMyChordSheets, lazyContent, chordSheet.songChords]);

  const chordSheetToDisplay = useMemo(() => chordSheet, [chordSheet]);

  const {
    transpose,
    setTranspose,
    defaultTranspose,
    capo,
    setCapo,
    defaultCapo,
  } = useChordDisplaySettings(
    chordContentToDisplay,
    chordSheetToDisplay.songKey,
    chordSheetToDisplay.guitarCapo,
    initialViewMode
  );

  const {
    handleCapoChange,
    handleTransposeChange,
    getCapoDisableStates,
    getTransposeDisableStates,
  } = useCapoTranspose({ capo, setCapo, transpose, setTranspose });

  const effectiveTranspose = transpose - (capo - defaultCapo);

  // Editable metadata buffer (title/artist/key/tuning/capo).
  const [editTitle, setEditTitle] = useState(chordSheetToDisplay.title ?? "");
  const [editArtist, setEditArtist] = useState(chordSheetToDisplay.artist ?? "");
  const [editSongKey, setEditSongKey] = useState(chordSheetToDisplay.songKey ?? "");
  const [editTuning, setEditTuning] = useState(guitarTuningToString(chordSheetToDisplay.guitarTuning));
  const [editCapo, setEditCapo] = useState(chordSheetToDisplay.guitarCapo ?? 0);

  const handleSaveWithMeta = useCallback(
    (content: string) => {
      onUpdate({
        songChords: content,
        title: editTitle || "Untitled Song",
        artist: editArtist || "Unknown Artist",
        songKey: editSongKey,
        guitarTuning: mapStringToGuitarTuning(editTuning),
        guitarCapo: editCapo,
      });
    },
    [onUpdate, editTitle, editArtist, editSongKey, editTuning, editCapo]
  );

  const {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    updateEditContent,
    handleSaveEdits: saveEdits,
  } = useChordEditor(chordContentToDisplay, handleSaveWithMeta);

  // Keep the editor buffers in sync with displayed content/metadata while not
  // editing, so re-opening the editor shows the latest (possibly just-saved) values.
  useEffect(() => {
    if (isEditing) return;
    updateEditContent(chordContentToDisplay);
    setEditTitle(chordSheetToDisplay.title ?? "");
    setEditArtist(chordSheetToDisplay.artist ?? "");
    setEditSongKey(chordSheetToDisplay.songKey ?? "");
    setEditTuning(guitarTuningToString(chordSheetToDisplay.guitarTuning));
    setEditCapo(chordSheetToDisplay.guitarCapo ?? 0);
  }, [chordContentToDisplay, chordSheetToDisplay, isEditing, updateEditContent]);

  const handleAction = () => {
    if (isEditing) {
      saveEdits();
    } else if (isFromMyChordSheets && !hideDeleteButton) {
      onDelete(songObj.path);
    } else if (!hideSaveButton && !isFromMyChordSheets && onSave) {
      onSave();
    }
  };

  const shouldShowActionButton =
    isEditing ||
    (isFromMyChordSheets && !hideDeleteButton) ||
    (!hideSaveButton && !isFromMyChordSheets && !!onSave);

  // isSaved controls which icon the action button shows:
  // true = trash (delete), false = save disk icon
  // When editing, show the save icon (false)
  const isSaved = isEditing ? false : isFromMyChordSheets && !hideDeleteButton;

  const finalIsContentLoading = useProgressiveLoading
    ? isContentLoading
    : isLazyContentLoading;

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const title = isEditing ? editTitle : chordSheetToDisplay.title;
  const artist = isEditing ? editArtist : chordSheetToDisplay.artist;

  const handleArtistClick = useCallback(() => {
    const artistSlug = songObj.path.split("/")[0];
    sessionStorage.removeItem("chordium_search_query");
    try {
      sessionStorage.setItem(
        ARTIST_DISPLAY_NAME_KEY,
        JSON.stringify({ path: artistSlug, displayName: artist })
      );
    } catch {}
    // Persist the displayName the song page is already showing, so /:artist
    // can reuse it later instead of re-deriving a name from DOM scraping or a
    // slug guess.
    void storeArtistDisplayName(artistSlug, artist);
    navigate(`/${artistSlug}`);
  }, [artist, navigate, songObj.path]);

  return (
    <main
      id="page-chord-viewer"
      className="flex-1 w-full max-w-3xl mx-auto py-8 px-4 animate-fade-in flex flex-col gap-4"
    >
      <PageHeader
        onBack={onBack}
        onAction={shouldShowActionButton ? handleAction : undefined}
        isSaved={isSaved}
        title={title}
        artist={artist}
        onArtistClick={!isEditing && artist ? handleArtistClick : undefined}
        isEditing={isEditing}
        onTitleChange={setEditTitle}
        onArtistChange={setEditArtist}
        rightContent={
          <>
            {!isEditing && chordContentToDisplay && (
              <JamQRModal
                chordSheet={{ ...chordSheetToDisplay, songChords: chordContentToDisplay }}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-10 w-10 rounded-full"
              onClick={() => setIsEditing((e) => !e)}
              title={isEditing ? "Cancel editing" : "Edit chord sheet"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        }
        metadata={
          <ChordMetadata
            chordSheet={chordSheetToDisplay}
            controls={isEditing ? undefined : {
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
            edit={isEditing ? {
              songKey: editSongKey,
              guitarTuning: editTuning,
              guitarCapo: editCapo,
              onSongKeyChange: setEditSongKey,
              onGuitarTuningChange: setEditTuning,
              onGuitarCapoChange: setEditCapo,
            } : undefined}
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

      {hasFullArrangement && !isEditing && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border p-0.5 text-sm">
            <button
              type="button"
              onClick={() => onToggleArrangement?.(false)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${!showFull ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Simplified arrangement (easier chords, no tabs)"
            >
              <Music className="h-3.5 w-3.5" />
              Simplified
            </button>
            <button
              type="button"
              onClick={() => onToggleArrangement?.(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${showFull ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Full arrangement (with tabs)"
            >
              <Guitar className="h-3.5 w-3.5" />
              Full
            </button>
          </div>
        </div>
      )}

      <ChordSheetViewer
        ref={chordDisplayRef}
        chordSheet={chordSheetToDisplay}
        content={chordContentToDisplay}
        isLoading={finalIsContentLoading}
        effectiveTranspose={effectiveTranspose}
        fontSize={fontSize}
        viewMode={viewMode}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editContent={editContent}
        setEditContent={setEditContent}
        handleSaveEdits={saveEdits}
      />
    </main>
  );
};

export default SongViewer;
