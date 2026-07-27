import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import SongViewer from '@/components/SongViewer';
import { useChordSheetWithFallback } from '@/hooks/useChordSheetWithFallback';
import type { RouteParams } from './chord-viewer.types';

import { resolveChordSheetPath } from './utils/path-resolver';
import { type JamPayload, decodeChordSheet, JAM_QR_PREFIX } from '@/utils/chordSheetQR';
import { createChordSheetData } from './utils/chord-sheet-data';
import { extractNavigationData } from './utils/navigation-data';

import { useNavigation } from '@/hooks/navigation';
import { useChordSheetSave, useChordSheetDelete } from '@/storage/hooks';
import storeChordSheet from '@/storage/stores/chord-sheets/operations/store-chord-sheet';

import { ChordViewerLoading } from './components/chord-viewer-loading';
import { ChordViewerError } from './components/chord-viewer-error';

const ChordViewer = () => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const routeParams = useParams() as RouteParams;
  const location = useLocation();

  const navigationData = extractNavigationData(location.state);
  const path = navigationData?.path || resolveChordSheetPath(routeParams);

  const [activeViewMode, setActiveViewMode] = useState('tabs-on');

  const [searchParams] = useSearchParams();
  const [jamPayload, setJamPayload] = useState<JamPayload | null>(null);

  // Holds edited chord content so the view reflects saves without a page refresh.
  const [editedContent, setEditedContent] = useState<string | null>(null);

  useEffect(() => {
    setEditedContent(null);
  }, [path]);

  useEffect(() => {
    const d = searchParams.get('d');
    if (!d) return;
    decodeChordSheet(JAM_QR_PREFIX + d).then(payload => {
      if (payload) setJamPayload(payload);
    });
  }, [searchParams]);

  const chordSheetResult = useChordSheetWithFallback(path);

  const handleViewModeChange = useCallback((viewMode: string) => {
    setActiveViewMode(viewMode);
  }, []);

  const chordSheetData = chordSheetResult.metadata
    ? createChordSheetData(
        {
          title: chordSheetResult.metadata.title,
          artist: chordSheetResult.metadata.artist,
          songKey: chordSheetResult.metadata.songKey,
          guitarTuning: chordSheetResult.metadata.guitarTuning,
          guitarCapo: chordSheetResult.metadata.guitarCapo,
        },
        chordSheetResult.content ?? { songChords: '' },
        path
      )
    : null;

  const [isSaved, setIsSaved] = useState(
    chordSheetResult.metadata?.storage?.saved ?? false
  );

  useEffect(() => {
    setIsSaved(chordSheetResult.metadata?.storage?.saved ?? false);
  }, [chordSheetResult.metadata?.storage?.saved]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasJamParam = searchParams.has('d');
  useEffect(() => {
    if (!hasJamParam && (!chordSheetResult.chordSheet || !chordSheetResult.chordSheet.rawHtml) && !chordSheetResult.metadata?.storage?.saved && !chordSheetResult.isFromAPI && !chordSheetResult.isLoading && path) {
      chordSheetResult.loadFromAPI();
    }
  }, [hasJamParam, chordSheetResult, path]);

  const navigation = useNavigation();
  const handleBack = () => navigation.navigateBack();

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

  const { handleSave: baseHandleSave } = useChordSheetSave(chordSheetData ?? jamChordSheetData);
  const handleSave = async () => {
    await baseHandleSave();
    setIsSaved(true);
  };
  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );

  const handleUpdate = useCallback(async (updatedContent: string) => {
    if (!chordSheetData) return;
    const { title, artist, songKey, guitarTuning, guitarCapo } = chordSheetData.chordSheet;
    await storeChordSheet(
      { title, artist, songKey, guitarTuning, guitarCapo },
      { songChords: updatedContent },
      isSaved,
      path
    );
    setEditedContent(updatedContent);
  }, [chordSheetData, isSaved, path]);

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
    );
  }

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

  const displayContent = editedContent ?? (chordSheetResult.content?.songChords ?? '');

  // When an edit has been made, the edited plain text becomes the source of
  // truth; drop the stale scraped rawHtml so the new content renders.
  const displayChordSheet = editedContent != null
    ? { ...chordSheetData!.chordSheet, songChords: editedContent, rawHtml: undefined }
    : chordSheetData!.chordSheet;

  return (
    <SongViewer
      song={{
        song: {
          title: chordSheetData!.chordSheet.title,
          artist: chordSheetData!.chordSheet.artist,
          path: chordSheetData!.path
        },
        chordSheet: displayChordSheet
      }}
      chordContent={displayContent}
      chordDisplayRef={chordDisplayRef}
      onBack={handleBack}
      onDelete={handleDelete}
      onSave={handleSave}
      onUpdate={handleUpdate}
      hideDeleteButton={!isSaved}
      hideSaveButton={isSaved}
      isFromMyChordSheets={isSaved}
      useProgressiveLoading={chordSheetResult.isFromAPI}
      loadContent={chordSheetResult.loadContent}
      isContentLoading={chordSheetResult.isContentLoading}
      onViewModeChange={handleViewModeChange}
      initialViewMode={activeViewMode}
    />
  );
};

export default ChordViewer;
