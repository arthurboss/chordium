import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChordSheetViewer from "@/components/ChordSheetViewer";
import SongChordDetails from "@/components/SongChordDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useChordSheet } from "@/hooks/useChordSheet";
import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { GUITAR_TUNINGS } from "@/types/guitarTuning";
import { useNavigationHistory } from "@/hooks/use-navigation-history";
import { useAddToMyChordSheets } from "@/hooks/useAddToMyChordSheets";
import { getAllChordSheets, removeChordSheetByPath } from "@/cache";
import { toast } from "@/hooks/use-toast";

// UI state interface for local song data with loading and error states  
interface LocalSongData extends ChordSheet {
  loading: boolean;
  error: string | null;
}

const ChordViewer = () => {
  const { artist, song, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBackToSearch } = useNavigationHistory();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const addToMyChordSheets = useAddToMyChordSheets();

  const [localSongData, setLocalSongData] = useState<LocalSongData | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Get Song object from navigation state (if passed from search results)
  const navigationSong = location.state?.song as Song | undefined;

  // Determine if this song is actually in "My Chord Sheets" by checking storage
  const [isFromMyChordSheets, setIsFromMyChordSheets] = useState(false);

  useEffect(() => {
    const checkMyChordSheets = async () => {
      // Determine if this is a My Chord Sheets route based on the URL path, not navigation state
      const isMyChordSheetsRoute = window.location.pathname.startsWith('/my-chord-sheets');
      setIsFromMyChordSheets(isMyChordSheetsRoute);
    };

    checkMyChordSheets();
  }, [navigationSong?.path]);

  // Get chord data from server (for search results only)
  // Skip server fetch for My Chord Sheets context
  // Pass the original song path from navigation state for accurate fetching (path only, not full URL)
  const originalSongPath = navigationSong?.path;
  const chordData = useChordSheet(originalSongPath);

  // Load song from My Chord Sheets if this is a My Chord Sheets route
  useEffect(() => {
    if (isFromMyChordSheets && artist && song) {
      setIsLoadingLocal(true);

      const loadSongFromMyChordSheets = async () => {
        try {
          // Get all chord sheets using IndexedDB storage
          const allChordSheets = await getAllChordSheets();

          const artistName = decodeURIComponent(artist.replace(/-/g, ' '));
          const songName = decodeURIComponent(song.replace(/-/g, ' '));

          // Find the chord sheet directly by matching artist and title
          const foundChordSheet = allChordSheets.find(cs => {
            const chordSheetArtist = cs.artist?.toLowerCase() ?? '';
            const chordSheetTitle = cs.title?.toLowerCase() ?? '';
            return chordSheetArtist.includes(artistName.toLowerCase()) || 
                   chordSheetTitle.includes(songName.toLowerCase()) ||
                   chordSheetTitle === songName.toLowerCase();
          });

          if (foundChordSheet) {
            const localData: LocalSongData = {
              ...foundChordSheet,
              loading: false,
              error: null
            };

            setLocalSongData(localData);
          } else {
            setLocalSongData({
              title: songName,
              artist: artistName,
              songChords: '',
              songKey: '',
              guitarTuning: GUITAR_TUNINGS.STANDARD,
              guitarCapo: 0,
              loading: false,
              error: `Chord sheet "${songName}" by "${artistName}" not found in My Chord Sheets`
            });
          }
        } catch (error) {
          console.error('Error loading chord sheet from My Chord Sheets:', error);
          setLocalSongData({
            title: song ?? '',
            artist: artist ?? '',
            songChords: '',
            songKey: '',
            guitarTuning: GUITAR_TUNINGS.STANDARD,
            guitarCapo: 0,
            loading: false,
            error: 'Failed to load chord sheet from My Chord Sheets'
          });
        }

        setIsLoadingLocal(false);
      };

      loadSongFromMyChordSheets();
    }
  }, [isFromMyChordSheets, artist, song]);

  // Helper to normalize data for UI consumption
  const getCurrentChordData = () => {
    if (isFromMyChordSheets && localSongData) {
      return {
        ...localSongData,
        loading: isLoadingLocal
      };
    }
    
    // Convert ChordSheet from hook to LocalSongData-like structure for UI
    // Preserve the actual loading and error state from the hook
    return {
      ...chordData,
      loading: chordData.loading,
      error: chordData.error
    };
  };

  const currentChordData = getCurrentChordData();

  // Handle back navigation
  const handleBack = () => {
    if (isFromMyChordSheets) {
      // If viewing from My Chord Sheets, go back to My Chord Sheets tab
      navigate('/my-chord-sheets');
    } else {
      // If viewing from search results, go back to search
      navigateBackToSearch();
    }
  };

  // Add chord sheet to My Chord Sheets
  const handleSaveChordSheet = (path: string) => {
    addToMyChordSheets(currentChordData, path);
  };

  // Delete song from My Chord Sheets
  const handleDeleteSong = async (path: string) => {
    const songTitle = currentChordData.title;

    try {
      // Delete from storage using the IndexedDB key (path)
      await removeChordSheetByPath(path);

      // Show toast notification
      toast({
        title: "Chord sheet deleted",
        description: `"${songTitle}" has been removed from My Chord Sheets`
      });

      // Navigate back to My Chord Sheets
      navigate('/');
    } catch (error) {
      console.error('Failed to delete chord sheet:', error);
      toast({
        title: "Error",
        description: "Failed to delete chord sheet",
        variant: "destructive"
      });
    }
  };

  if (currentChordData.loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <LoadingState message="Loading chord sheet..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentChordData.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <ErrorState error={`Failed to load chord sheet: ${currentChordData.error}`} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 overflow-x-hidden max-w-3xl mx-auto">
        <SongChordDetails
          songKey={currentChordData.songKey}
          tuning={Array.isArray(currentChordData.guitarTuning) ? currentChordData.guitarTuning.join('-') : 'Standard'}
          capo={currentChordData.guitarCapo !== undefined ? currentChordData.guitarCapo.toString() : '0'}
        />
        <ChordSheetViewer
          chordSheet={currentChordData}
          chordContent={currentChordData.songChords}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={isFromMyChordSheets ? handleDeleteSong : handleSaveChordSheet}
          onUpdate={() => { }}
          backButtonLabel={isFromMyChordSheets ? "Back to My Chord Sheets" : "Back to Search"}
          deleteButtonLabel={isFromMyChordSheets ? "Remove from My Chord Sheets" : "Add to My Chord Sheets"}
          deleteButtonVariant={isFromMyChordSheets ? "destructive" : "default"}
          hideDeleteButton={false}
          path={navigationSong?.path}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
