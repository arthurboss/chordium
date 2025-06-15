import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import SongChordDetails from "@/components/SongChordDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useChordSheet, ChordSheetData } from "@/hooks/useChordSheet";
import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { GUITAR_TUNINGS } from "@/types/guitarTuning";
import { useNavigationHistory } from "@/hooks/use-navigation-history";
import { useAddToMySongs } from "@/hooks/useAddToMySongs";
import { getSongs, migrateSongsFromOldStorage, migrateChordContentFromPath, deleteSong } from "@/utils/unified-song-storage";
import { getCachedChordSheet } from "@/cache/implementations/chord-sheet-cache";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
import { loadSampleSongs } from "@/utils/sample-songs";
import { extractSongMetadata } from "@/utils/metadata-extraction";
import { toast } from "@/hooks/use-toast";

const ChordViewer = () => {
  const { artist, song, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBackToSearch } = useNavigationHistory();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const addToMySongs = useAddToMySongs();

  const [localSongData, setLocalSongData] = useState<ChordSheetData | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Get Song object from navigation state (if passed from search results)
  const navigationSong = location.state?.song as Song | undefined;

  console.log('🚀 CHORD VIEWER INITIALIZATION:');
  console.log('URL params - artist:', artist, 'song:', song, 'id:', id);
  console.log('Navigation state song:', navigationSong);

  // Determine if this song is actually in "My Songs" by checking storage
  const [isFromMySongs, setIsFromMySongs] = useState(false);

  useEffect(() => {
    const songs = getSongs();

    // Check if current song is in My Songs
    const songPath = navigationSong?.path || generateChordSheetId(artist || '', song || '');
    const isInMySongs = songs.some(s => s.path === songPath);
    setIsFromMySongs(isInMySongs);

    console.log('📋 Checking if song is in My Songs:');
    console.log('Song path:', songPath);
    console.log('Is in My Songs:', isInMySongs);
    console.log('My Songs count:', songs.length);
  }, [navigationSong?.path, artist, song]);

  // Get chord data from server (for search results only)
  // Skip server fetch for My Songs context
  // Pass the original song path from navigation state for accurate fetching (path only, not full URL)
  const originalSongPath = navigationSong?.path;
  console.log('🔗 Original song path from navigation state:', originalSongPath);
  const chordData = useChordSheet(undefined, originalSongPath);

  // Load song from My Songs if this is a My Songs route
  useEffect(() => {
    if (isFromMySongs && artist && song) {
      setIsLoadingLocal(true);

      const loadSongFromMySongs = async () => {
        try {
          // Ensure data migration has occurred
          migrateSongsFromOldStorage();
          migrateChordContentFromPath();

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
            console.log('🔍 FOUND SONG IN MY SONGS:');
            console.log('Found song object:', foundSong);
            console.log('Song path (CifraClub format):', foundSong.path);

            // Generate the proper cache key from artist and title
            const cacheKey = generateChordSheetId(foundSong.artist, foundSong.title);
            console.log('Generated cache key:', cacheKey);

            // Try to get the chord content from the cache using the proper cache key
            console.log('🏪 Trying to get cached chord sheet...');
            const cachedChordSheet = getCachedChordSheet(cacheKey);
            console.log('Cached chord sheet result:', cachedChordSheet);

            let content = '';
            let songKey = '';

            if (cachedChordSheet) {
              console.log('✅ Using cached chord sheet data');
              // Use cached chord sheet data
              content = cachedChordSheet.songChords;
              songKey = cachedChordSheet.songKey;
              console.log('Content from cache:', content?.substring(0, 100) + '...');
            } else {
              console.log('⚠️ No cached chord sheet found, using fallback (pre-migration data)');
              // Fallback: if migration hasn't occurred yet, foundSong.path might still contain content
              content = foundSong.path;
              const metadata = extractSongMetadata(foundSong.path);
              songKey = metadata.songKey ?? '';
              console.log('Content from fallback:', content?.substring(0, 100) + '...');
            }

            const localData = {
              content: content,
              artist: navigationSong?.artist || foundSong.artist || artistName,
              song: navigationSong?.title || foundSong.title || songName,
              songKey: songKey,
              guitarTuning: GUITAR_TUNINGS.STANDARD,
              guitarCapo: 0,
              loading: false,
              error: null
            };

            console.log('📋 Setting local song data:', localData);
            setLocalSongData(localData);
          } else {
            setLocalSongData({
              content: '',
              artist: navigationSong?.artist || artistName,
              song: navigationSong?.title || songName,
              songKey: '',
              guitarTuning: GUITAR_TUNINGS.STANDARD,
              guitarCapo: 0,
              loading: false,
              error: `Song "${songName}" by "${artistName}" not found in My Songs`
            });
          }
        } catch (error) {
          console.error('Error loading song from My Songs:', error);
          setLocalSongData({
            content: '',
            artist: navigationSong?.artist || artist,
            song: navigationSong?.title || song,
            songKey: '',
            guitarTuning: GUITAR_TUNINGS.STANDARD,
            guitarCapo: 0,
            loading: false,
            error: 'Failed to load song from My Songs'
          });
        }

        setIsLoadingLocal(false);
      };

      loadSongFromMySongs();
    }
  }, [isFromMySongs, artist, song, navigationSong?.artist, navigationSong?.title]);

  // Use local data for My Songs, server data for search results
  const currentChordData = isFromMySongs ?
    (localSongData || { loading: isLoadingLocal, error: null, content: '', artist: '', song: '', songKey: '', guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'], guitarCapo: 0 }) :
    chordData;

  console.log('🔄 CURRENT CHORD DATA SELECTION:');
  console.log('isFromMySongs:', isFromMySongs);
  console.log('localSongData:', localSongData);
  console.log('chordData (from server):', chordData);
  console.log('selectedCurrentChordData:', currentChordData);

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

  // Extract song title - prioritize navigation state, fallback to URL params
  const getSongTitle = () => {
    if (navigationSong?.title) {
      return navigationSong.title;
    }
    if (song) {
      return decodeURIComponent(song.replace(/-/g, ' '));
    }
    return 'Chord Sheet';
  };

  // Extract artist name - prioritize navigation state, fallback to URL params
  const getArtistName = () => {
    if (navigationSong?.artist) {
      return navigationSong.artist;
    }
    if (artist) {
      return decodeURIComponent(artist.replace(/-/g, ' '));
    }
    return '';
  };

  // Create song data object from chord sheet data
  const createSongData = () => {
    console.log('🎼 CREATE SONG DATA DEBUG:');
    console.log('currentChordData:', currentChordData);
    console.log('isFromMySongs:', isFromMySongs);
    console.log('navigationSong (from search result):', navigationSong);
    console.log('URL params - artist:', artist, 'songParam:', song, 'id:', id);

    // Use navigation Song object as primary source, fallback to URL/chord data
    const songTitle = navigationSong?.title || getSongTitle();
    const artistName = navigationSong?.artist || getArtistName();
    const cacheKey = artist && song ? generateChordSheetId(artist, song) : id || 'unknown';

    console.log('🏷️ Final song title (prioritizing navigation state):', songTitle);
    console.log('🎤 Final artist name (prioritizing navigation state):', artistName);
    console.log('🔑 Cache key for chord content:', cacheKey);

    const songObj: Song = {
      title: songTitle, // Use navigation Song object as primary source
      artist: artistName, // Use navigation Song object as primary source
      path: cacheKey // Use cache key, not chord content
    };

    console.log('💾 Created Song object:', songObj);

    const chordSheet: ChordSheet = {
      title: songTitle, // Use URL params - the song title from search result
      artist: artistName, // Use URL params - the artist name from search result
      songChords: currentChordData.content ?? '',
      songKey: currentChordData.songKey ?? '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: currentChordData.guitarCapo ?? 0
    };

    console.log('🎸 Created ChordSheet object:', chordSheet);

    return {
      song: songObj,
      chordSheet
    };
  };

  // Add song to My Songs
  const handleSaveSong = () => {
    const songData = createSongData();
    addToMySongs(songData);
  };

  // Delete song from My Songs
  const handleDeleteSong = () => {
    const songPath = navigationSong?.path || generateChordSheetId(artist || '', song || '');
    const songTitle = navigationSong?.title || getSongTitle();

    console.log('🗑️ Deleting song from My Songs:', songPath);

    // Delete from storage
    deleteSong(songPath);

    // Show toast notification
    toast({
      title: "Song deleted",
      description: `"${songTitle}" has been removed from My Songs`
    });

    // Navigate back to My Songs
    navigate('/');
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
          songKey={currentChordData.songKey}
          tuning={Array.isArray(currentChordData.guitarTuning) ? currentChordData.guitarTuning.join('-') : 'Standard'}
          capo={currentChordData.guitarCapo?.toString() || '0'}
        />
        <SongViewer
          song={songData.song}
          chordContent={isFromMySongs ? undefined : currentChordData.content}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={isFromMySongs ? handleDeleteSong : handleSaveSong}
          onUpdate={() => { }}
          backButtonLabel={isFromMySongs ? "Back to My Songs" : "Back to Search"}
          deleteButtonLabel={isFromMySongs ? "Remove from My Songs" : "Add to My Songs"}
          deleteButtonVariant={isFromMySongs ? "destructive" : "default"}
          hideDeleteButton={false}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
