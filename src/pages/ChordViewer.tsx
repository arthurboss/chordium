import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import SongChordDetails from "@/components/SongChordDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useChordSheet, ChordSheetData } from "@/hooks/useChordSheet";
import { useNavigationHistory } from "@/hooks/use-navigation-history";
import { useAddToMySongs } from "@/hooks/useAddToMySongs";
import { getSongs, migrateSongsFromOldStorage } from "@/utils/unified-song-storage";
import { loadSampleSongs } from "@/utils/sample-songs";
import { extractSongMetadata } from "@/utils/metadata-extraction";

const ChordViewer = () => {
  const { artist, song, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBackToSearch } = useNavigationHistory();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const addToMySongs = useAddToMySongs();
  
  const [localSongData, setLocalSongData] = useState<ChordSheetData | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  
  // Determine if this is from "My Songs" based on the route
  const isFromMySongs = location.pathname.startsWith('/my-songs/');
  
  // Get chord data from server (for search results only)
  // Skip server fetch for My Songs context
  const chordData = useChordSheet();
  
  // Load song from My Songs if this is a My Songs route
  useEffect(() => {
    if (isFromMySongs && artist && song) {
      setIsLoadingLocal(true);
      
      const loadSongFromMySongs = async () => {
        try {
          // Ensure data migration has occurred
          migrateSongsFromOldStorage();
          
          // Get all songs using unified storage
          const allSongs = getSongs();
          const sampleSongs = await loadSampleSongs();
          
          // Combine sample songs and user songs
          const songs = [...sampleSongs, ...allSongs];
          
          const artistName = decodeURIComponent(artist.replace(/-/g, ' '));
          const songName = decodeURIComponent(song.replace(/-/g, ' '));
          
          // Find the song in My Songs by matching artist and title
          const foundSong = songs.find(s => {
            const songArtist = s.artist?.toLowerCase() ?? '';
            const songTitle = s.title?.toLowerCase() ?? '';
            return songArtist.includes(artistName.toLowerCase()) || songTitle.includes(songName.toLowerCase()) ||
                   songTitle === songName.toLowerCase();
          });
          
          if (foundSong) {
            // Extract metadata from the song content
            const metadata = extractSongMetadata(foundSong.path);
            
            setLocalSongData({
              content: foundSong.path,
              artist: foundSong.artist ?? metadata.artist ?? artistName,
              song: foundSong.title ?? metadata.title ?? songName,
              key: metadata.songKey ?? '',
              tuning: metadata.guitarTuning ?? '',
              capo: metadata.guitarTuning?.includes('Capo') ? metadata.guitarTuning : '',
              loading: false,
              error: null
            });
          } else {
            setLocalSongData({
              content: '',
              artist: artistName,
              song: songName,
              key: '',
              tuning: '',
              capo: '',
              loading: false,
              error: `Song "${songName}" by "${artistName}" not found in My Songs`
            });
          }
        } catch (error) {
          console.error('Error loading song from My Songs:', error);
          setLocalSongData({
            content: '',
            artist: artist,
            song: song,
            key: '',
            tuning: '',
            capo: '',
            loading: false,
            error: 'Failed to load song from My Songs'
          });
        }
        
        setIsLoadingLocal(false);
      };
      
      loadSongFromMySongs();
    }
  }, [isFromMySongs, artist, song]);
  
  // Use local data for My Songs, server data for search results
  const currentChordData = isFromMySongs ? 
    (localSongData || { loading: isLoadingLocal, error: null, content: '', artist: '', song: '', key: '', tuning: '', capo: '' }) : 
    chordData;
    
  // Handle back navigation
  const handleBack = () => {
    if (isFromMySongs) {
      // If viewing from My Songs, go back to My Songs tab
      navigate('/my-songs');
    } else {
      // If viewing from search results, go back to search
      navigateBackToSearch();
    }
  };
  
  // Format the title based on available data
  const formatTitle = () => {
    if (artist && song) {
      return `${decodeURIComponent(artist.replace(/-/g, ' '))} - ${decodeURIComponent(song.replace(/-/g, ' '))}`;
    } else if (id) {
      return `Chord Sheet`;
    }
    return 'Chord Sheet';
  };
  
  // Create song data object from chord sheet data
  const createSongData = () => {
    return {
      id: uuidv4(),
      title: currentChordData.song ?? formatTitle(),
      artist: currentChordData.artist ?? '',
      path: currentChordData.content ?? '',
      key: currentChordData.key,
      tuning: currentChordData.tuning,
      capo: currentChordData.capo
    };
  };
  
  // Add song to My Songs
  const handleSaveSong = () => {
    const songData = createSongData();
    addToMySongs(songData);
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
  
  const songData = createSongData();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 overflow-x-hidden max-w-3xl mx-auto">
        <SongChordDetails 
          songKey={currentChordData.key}
          tuning={currentChordData.tuning}
          capo={currentChordData.capo}
        />
        <SongViewer 
          song={songData}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={isFromMySongs ? undefined : handleSaveSong}  
          onUpdate={() => {}}         
          backButtonLabel={isFromMySongs ? "Back to My Songs" : "Back to Search"}
          deleteButtonLabel={isFromMySongs ? undefined : "Add to My Songs"}
          deleteButtonVariant="default"
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
