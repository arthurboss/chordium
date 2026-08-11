import ChordSheetViewer from "@/components/ChordSheetViewer";
import PageHeader from "@/components/PageHeader";
import ChordMetadata from "@/components/ChordDisplay/ChordMetadata";
import StyleToolbar from "@/components/StyleToolbar";
import VersionToggle from "@/components/VersionToggle";
import { Card } from "@/components/ui/card";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";
import { storeArtistDisplayName } from "@/search/utils/artist/artist-display-name-cache";
import type { Song } from "../types/song";
import type { ChordSheet, SongMetadata } from "@/types/chordSheet";
import { useLazyChordSheet } from "@/storage/hooks/use-lazy-chord-sheet";
import { useChordDisplaySettings } from "@/hooks/use-chord-display-settings";
import { useCapoTranspose } from "@/hooks/useCapoTranspose";
import { useChordEditor } from "@/hooks/use-chord-editor";
import { useLyricsVersion } from "@/hooks/useLyricsVersion";
import { extractLyricsFromChordSheet } from "@/utils/extract-lyrics";
import { Pencil, Music, Guitar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveChordSheet } from "@/features/jam-session/useActiveChordSheet";
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
  hasFullArrangement?: boolean;
  showFull?: boolean;
  onToggleArrangement?: (showFull: boolean) => void;
  simplifiedChordSheet?: { songChords: string; rawHtml?: string };
  showLyrics?: boolean;
  onLyricsToggle?: (show: boolean) => void;
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
  simplifiedChordSheet,
  showLyrics = false,
  onLyricsToggle,
}: SongViewerProps) => {
  const { song: songObj, chordSheet } = song;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [fontSize, setFontSize] = useState(14);
  const [viewMode, setViewMode] = useState(initialViewMode || "tabs-on");
  const [version, setVersion] = useState<'simplified' | 'full' | 'lyrics'>(showLyrics ? 'lyrics' : 'simplified');

  const { content: lazyContent, isContentLoading: isLazyContentLoading } = useLazyChordSheet({
    path: isFromMyChordSheets ? songObj.path : "",
  });

  const chordContentToDisplay = useMemo(() => {
    if (directChordContent) return directChordContent;
    if (isFromMyChordSheets) return lazyContent || "";
    return chordSheet.songChords || "";
  }, [directChordContent, isFromMyChordSheets, lazyContent, chordSheet.songChords]);

  const chordSheetToDisplay = useMemo(() => chordSheet, [chordSheet]);

  const { setActive: setActiveShareable } = useActiveChordSheet();

  // The sung words come from the chord sheet itself, which is the version being
  // followed along to, so no separate lyrics source is fetched.
  const sourceLyrics = useMemo(
    () => extractLyricsFromChordSheet(chordSheetToDisplay.rawHtml, chordContentToDisplay),
    [chordSheetToDisplay.rawHtml, chordContentToDisplay]
  );

  const {
    displayLyrics,
    showTranslation,
    setShowTranslation,
    hasTranslation,
    status: translationStatus,
    downloadProgress,
    acceptDownload,
    retry: retryTranslation,
  } = useLyricsVersion({
    path: songObj.path,
    lyrics: sourceLyrics,
  });

  // ChordSheetViewer renders from chordSheet.rawHtml/songChords, so the words to
  // show have to replace those (rawHtml dropped) to be displayed at all. Without
  // any, fall through to the chord sheet and let lyrics-only view mode strip the
  // chords.
  const lyricsChordSheet = useMemo(() => {
    if (version !== 'lyrics' || !displayLyrics) return null;
    return { ...chordSheetToDisplay, songChords: displayLyrics, rawHtml: undefined };
  }, [version, displayLyrics, chordSheetToDisplay]);

  const hasTabs = useMemo(() => {
    if (chordSheetToDisplay.rawHtml?.includes("tablatura")) return true;
    return (chordContentToDisplay || "").includes("[TAB]");
  }, [chordSheetToDisplay.rawHtml, chordContentToDisplay]);

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

  useEffect(() => {
    if (isEditing) return;
    updateEditContent(chordContentToDisplay);
    setEditTitle(chordSheetToDisplay.title ?? "");
    setEditArtist(chordSheetToDisplay.artist ?? "");
    setEditSongKey(chordSheetToDisplay.songKey ?? "");
    setEditTuning(guitarTuningToString(chordSheetToDisplay.guitarTuning));
    setEditCapo(chordSheetToDisplay.guitarCapo ?? 0);
  }, [chordContentToDisplay, chordSheetToDisplay, isEditing, updateEditContent]);

  useEffect(() => {
    if (isEditing || !chordContentToDisplay) {
      setActiveShareable(null);
      return;
    }
    setActiveShareable({
      chordSheet: { ...chordSheetToDisplay, songChords: chordContentToDisplay },
      simplifiedChordSheet: simplifiedChordSheet
        ? { ...chordSheetToDisplay, ...simplifiedChordSheet }
        : undefined,
      songPath: songObj.path,
    });
  }, [
    isEditing,
    chordSheetToDisplay,
    chordContentToDisplay,
    simplifiedChordSheet,
    songObj.path,
    setActiveShareable,
  ]);

  useEffect(() => () => setActiveShareable(null), [setActiveShareable]);

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

  const isSaved = isEditing ? false : isFromMyChordSheets && !hideDeleteButton;

  const finalIsContentLoading = useProgressiveLoading
    ? isContentLoading
    : isLazyContentLoading;

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleVersionChange = (newVersion: 'simplified' | 'full' | 'lyrics') => {
    setVersion(newVersion);
    onLyricsToggle?.(newVersion === 'lyrics');
    
    if (newVersion === 'lyrics') {
      setViewMode('lyrics-only');
      onViewModeChange?.('lyrics-only');
    } else if (newVersion === 'full') {
      setViewMode('tabs-on');
      onViewModeChange?.('tabs-on');
      onToggleArrangement?.(true);
    } else {
      setViewMode('tabs-on');
      onViewModeChange?.('tabs-on');
      onToggleArrangement?.(false);
    }
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
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-10 w-10 rounded-full"
            onClick={() => setIsEditing((e) => !e)}
            title={isEditing ? t("chordSheet.cancelEditing") : t("chordSheet.editChordSheet")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
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
          hasTabs={hasTabs}
          isLyricsMode={version === 'lyrics'}
          hasTranslation={hasTranslation}
          showTranslation={showTranslation}
          onToggleTranslation={() => setShowTranslation(!showTranslation)}
          translationStatus={translationStatus}
          translationProgress={downloadProgress}
          onAcceptTranslationDownload={acceptDownload}
          onRetryTranslation={retryTranslation}
        />
      </Card>

      {!isEditing && (
        <VersionToggle
          version={version}
          onVersionChange={handleVersionChange}
          hasFullArrangement={hasFullArrangement}
        />
      )}

      {isEditing && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Music className="h-3.5 w-3.5" />
            {t("arrangementToggle.editingIndicator", { 
              arrangement: t(version === 'full' ? "arrangementToggle.full" : version === 'lyrics' ? "lyrics.lyrics" : "arrangementToggle.simplified")
            })}
          </div>
        </div>
      )}

      <ChordSheetViewer
        ref={chordDisplayRef}
        chordSheet={lyricsChordSheet ?? chordSheetToDisplay}
        content={lyricsChordSheet ? lyricsChordSheet.songChords : chordContentToDisplay}
        isLoading={finalIsContentLoading}
        effectiveTranspose={effectiveTranspose}
        fontSize={fontSize}
        viewMode={version === 'lyrics' ? 'lyrics-only' : viewMode}
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
