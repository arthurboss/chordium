import { useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import NavigationCard from "@/components/NavigationCard";
import { useChordSheet } from "@/hooks/use-chord-sheet";
import { useDatabaseReady } from "@/storage/hooks/useDatabaseReady";
import { ChordSheet } from "@/types/chordSheet";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";
import { deleteChordSheetByPath } from "@/utils/chord-sheet-storage";
import { generateChordSheetPath } from "@/utils/chord-sheet-path";
import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import { toast } from "@/hooks/use-toast";
import type { ChordSheetData } from './chord-viewer.types';

const ChordViewer = () => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { artist, song } = useParams();
  
  // Wait for database to be ready before accessing chord sheets
  const { isReady: isDatabaseReady, error: databaseError } = useDatabaseReady();
  
  // Extract navigation data from location state if available
  // Note: This maintains backward compatibility with existing navigation state
  // The navigation state contains the same path format as our URL parameters
  const navigationData = location.state?.song as { path: string; title: string; artist: string } | undefined;

  // Generate path for chord sheet lookup  
  const generatePath = () => {
    // Prioritize navigation state path if available (more reliable)
    if (navigationData?.path) {
      return navigationData.path;
    }
    
    // Fallback to URL parameters  
    if (artist && song) {
      // Use URL parameters to generate path in database format: artist/song
      const artistName = decodeURIComponent(artist.replace(/-/g, ' '));
      const songName = decodeURIComponent(song.replace(/-/g, ' '));
      return `${artistName.toLowerCase().replace(/\s+/g, '-')}/${songName.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return '';
  };

  const path = generatePath();
  
  // Only use the chord sheet hook when database is ready
  const chordSheetResult = useChordSheet({ path: isDatabaseReady ? path : '' });

  // Determine if this chord sheet is saved (comes from My Chord Sheets context)
  const isFromMyChordSheets = location.pathname.startsWith('/my-chord-sheets/');

  // Extract song title - prioritize navigation state, then chord data, fallback to URL params
  const getSongTitle = () => {
    if (navigationData?.title) return navigationData.title;
    if (chordSheetResult.chordSheet?.title) return chordSheetResult.chordSheet.title;
    if (song) return decodeURIComponent(song.replace(/-/g, ' '));
    return 'Chord Sheet';
  };

  // Extract artist name - prioritize navigation state, then chord data, fallback to URL params
  const getArtistName = () => {
    if (navigationData?.artist) return navigationData.artist;
    if (chordSheetResult.chordSheet?.artist && chordSheetResult.chordSheet.artist !== 'Unknown Artist') {
      return chordSheetResult.chordSheet.artist;
    }
    if (artist) return decodeURIComponent(artist.replace(/-/g, ' '));
    return '';
  };

  // Create chord sheet data object for display
  const createChordSheetData = (): ChordSheetData => {
    const songTitle = getSongTitle();
    const artistName = getArtistName();

    const chordSheet: ChordSheet = {
      title: songTitle,
      artist: artistName,
      songChords: chordSheetResult.chordSheet?.songChords ?? '',
      songKey: chordSheetResult.chordSheet?.songKey ?? '',
      guitarTuning: chordSheetResult.chordSheet?.guitarTuning ?? GUITAR_TUNINGS.STANDARD,
      guitarCapo: chordSheetResult.chordSheet?.guitarCapo ?? 0
    };

    return { chordSheet, path };
  };

  // Handle back navigation
  const handleBack = () => {
    if (isFromMyChordSheets) {
      navigate('/my-chord-sheets');
    } else {
      // Navigate back to search results or home
      navigate('/');
    }
  };

  // Save chord sheet to My Chord Sheets
  const handleSaveChordSheet = async () => {
    if (!chordSheetResult.chordSheet) return;
    
    try {
      const chordSheetData = createChordSheetData();
      // Store as saved chord sheet (saved: true)
      await storeChordSheet(chordSheetData.chordSheet, true, chordSheetData.path);
      
      toast({
        title: "Chord sheet saved",
        description: `"${chordSheetData.chordSheet.title}" has been added to My Chord Sheets`
      });
    } catch (error) {
      console.error('Failed to save chord sheet:', error);
      toast({
        title: "Save failed",
        description: "Failed to save chord sheet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete song from My Chord Sheets
  const handleDeleteSong = () => {
    const songPath = navigationData?.path || path;
    const songTitle = getSongTitle();

    // Delete from storage
    deleteChordSheetByPath(songPath);

    // Show toast notification
    toast({
      title: "Chord sheet deleted",
      description: `"${songTitle}" has been removed from My Chord Sheets`
    });

    // Navigate back to My Chord Sheets
    navigate('/my-chord-sheets');
  };

  // Handle database initialization errors
  if (databaseError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <NavigationCard onBack={handleBack} />
          <ErrorState error={`Database initialization failed: ${databaseError.message}`} />
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading while database is initializing or chord sheet is loading
  if (!isDatabaseReady || chordSheetResult.isLoading) {
    const loadingMessage = !isDatabaseReady ? "Initializing database..." : "Loading chord sheet...";
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <LoadingState message={loadingMessage} />
        </main>
        <Footer />
      </div>
    );
  }

  if (chordSheetResult.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <NavigationCard onBack={handleBack} />
          <ErrorState error={chordSheetResult.error} />
        </main>
        <Footer />
      </div>
    );
  }

  const chordSheetData = createChordSheetData();
  
  // Create compatibility layer for SongViewer (until SongViewer is refactored)
  const songViewerData = {
    song: {
      title: chordSheetData.chordSheet.title,
      artist: chordSheetData.chordSheet.artist,
      path: chordSheetData.path
    },
    chordSheet: chordSheetData.chordSheet
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <SongViewer
          song={songViewerData}
          chordContent={chordSheetResult.chordSheet?.songChords ?? ''}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDeleteSong}
          onSave={handleSaveChordSheet}
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
