import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import SongViewer, { type UpdatedSongData } from '@/components/SongViewer';
import { useChordSheetWithFallback } from '@/hooks/useChordSheetWithFallback';
import type { RouteParams } from './chord-viewer.types';

import { resolveChordSheetPath } from './utils/path-resolver';
import { type JamPayload, decodeChordSheet, JAM_QR_PREFIX } from '@/utils/chordSheetQR';
import { createChordSheetData } from './utils/chord-sheet-data';
import { extractNavigationData } from './utils/navigation-data';
import { resolveSimplifiedContentForFullEdit } from './utils/resolve-simplified-content';
import { persistFullArrangementOnSave } from './utils/persist-full-arrangement';

import { getLyrics, storeLyrics } from '@/storage/services/lyrics-storage';
import { useNavigation } from '@/hooks/navigation';
import { useChordSheetSave, useChordSheetDelete } from '@/storage/hooks';
import storeChordSheet from '@/storage/stores/chord-sheets/operations/store-chord-sheet';
import { storeFullChordSheet } from '@/storage/stores/chord-sheets/operations';
import { fetchFullSongFromAPI } from '@/services/api/fetch-song';

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

  // Holds edited song data so the view reflects saves without a page refresh.
  const [editedData, setEditedData] = useState<UpdatedSongData | null>(null);
  // Whether the full arrangement (with tabs) is currently displayed.
  const [showFull, setShowFull] = useState(false);
  // Holds an edit made to the full arrangement (separate from editedData, which
  // is the simplified override).
  const [fullEdited, setFullEdited] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(() => location.pathname.endsWith('/letra'));

  useEffect(() => {
    setEditedData(null);
    setShowFull(false);
    setFullEdited(null);
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

  // Background fetch lyrics
  useEffect(() => {
    if (!path) return;
    const fetchLyricsInBackground = async () => {
      try {
        const cached = await getLyrics(path);
        if (cached) return;
        const response = await fetch(`/api/cifraclub-lyrics?url=${encodeURIComponent(path)}`);
        if (response.ok) {
          const data = await response.json();
          await storeLyrics(path, data);
        }
      } catch (error) { }
    };
    fetchLyricsInBackground();
  }, [path]);
  
  // Mirror the displayed version in the URL, matching the source's own paths:
  // "/letra" for lyrics and "/simplificada" for the simplified arrangement.
  // The simplified suffix is only meaningful when a distinct full arrangement
  // exists, since otherwise the primary content already IS the full version.
  // replaceState avoids remounting the route, and window.location is read
  // instead of the router's location because replaceState leaves it stale.
  const showSimplified = !showLyrics && !showFull && chordSheetResult.hasFullArrangement;
  useEffect(() => {
    const current = window.location.pathname;
    const base = current.replace(/\/(letra|simplificada)$/, '');
    let suffix = '';
    if (showLyrics) suffix = '/letra';
    else if (showSimplified) suffix = '/simplificada';
    const next = base + suffix;
    if (next === current) return;
    window.history.replaceState(null, '', next + window.location.search);
  }, [showLyrics, showSimplified]);
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

    // Persist the full arrangement (with tabs) as saved too, so toggling to
    // it later doesn't require re-fetching.
    persistFullArrangementOnSave(
      path,
      chordSheetResult.hasFullArrangement,
      chordSheetResult.fullContent,
      { storeFullChordSheet, fetchFullSongFromAPI }
    );
  };
  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );

  const handleUpdate = useCallback(async (data: UpdatedSongData) => {
    const metadata = {
      title: data.title,
      artist: data.artist,
      songKey: data.songKey,
      guitarTuning: data.guitarTuning,
      guitarCapo: data.guitarCapo,
    };
    if (showFull) {
      // Editing the full arrangement: content goes to the full store; metadata
      // is shared, so persist it to the primary store's metadata too (keeping
      // the primary content untouched). Read the simplified content the same
      // way displayContent does below - editedData first - since
      // chordSheetResult.content is only populated once on mount and would
      // otherwise clobber a simplified edit just saved earlier this session.
      await storeFullChordSheet({ songChords: data.songChords }, path);
      await storeChordSheet(
        metadata,
        { songChords: resolveSimplifiedContentForFullEdit(editedData?.songChords, chordSheetResult.content?.songChords) },
        isSaved,
        path
      );
      setFullEdited(data.songChords);
    } else {
      // Editing the simplified (default) arrangement.
      await storeChordSheet(metadata, { songChords: data.songChords }, isSaved, path);
      setEditedData(data);
    }
  }, [isSaved, path, showFull, editedData, chordSheetResult.content]);

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

  const fullSheet = chordSheetResult.fullContent;

  // Choose which arrangement to display. Full arrangement uses its own content
  // and rawHtml; simplified uses the primary content (with edit override).
  let displayContent: string;
  let displayChordSheet: typeof chordSheetData.chordSheet;
  if (showFull && fullSheet) {
    displayContent = fullEdited ?? fullSheet.songChords;
    displayChordSheet = {
      ...chordSheetData!.chordSheet,
      songChords: fullEdited ?? fullSheet.songChords,
      // When the full arrangement was edited in plain text, drop the scraped
      // rawHtml so the edited text renders; otherwise keep it for tab rendering.
      rawHtml: fullEdited != null ? undefined : fullSheet.rawHtml,
    };
  } else {
    displayContent = editedData?.songChords ?? (chordSheetResult.content?.songChords ?? '');
    displayChordSheet = editedData != null
      ? {
          ...chordSheetData!.chordSheet,
          title: editedData.title,
          artist: editedData.artist,
          songKey: editedData.songKey,
          guitarTuning: editedData.guitarTuning,
          guitarCapo: editedData.guitarCapo,
          songChords: editedData.songChords,
          rawHtml: undefined,
        }
      : chordSheetData!.chordSheet;
  }

  return (
    <SongViewer
      song={{
        song: {
          title: displayChordSheet.title,
          artist: displayChordSheet.artist,
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
      hasFullArrangement={chordSheetResult.hasFullArrangement}
      showFull={showFull}
      onToggleArrangement={setShowFull}
      showLyrics={showLyrics}
      onLyricsToggle={setShowLyrics}
      // Only meaningful while the full arrangement is displayed: it is the
      // smaller payload the share dialog falls back to when the full one is
      // too large for a QR code.
      simplifiedChordSheet={
        showFull && chordSheetResult.content
          ? {
              songChords: editedData?.songChords ?? chordSheetResult.content.songChords,
              ...(chordSheetResult.content.rawHtml
                ? { rawHtml: chordSheetResult.content.rawHtml }
                : {}),
            }
          : undefined
      }
    />
  );
};

export default ChordViewer;
