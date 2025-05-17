import { useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import SongChordDetails from "@/components/SongChordDetails";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useChordSheet } from "@/hooks/useChordSheet";
import { useNavigationHistory } from "@/hooks/use-navigation-history";
import { useAddToMySongs } from "@/hooks/useAddToMySongs";

const ChordViewer = () => {
  const { artist, song, id } = useParams();
  const { navigateBackToSearch } = useNavigationHistory();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const addToMySongs = useAddToMySongs();
  
  // Get chord data
  const chordData = useChordSheet();
  
  // Handle back navigation to search results
  const handleBack = () => {
    navigateBackToSearch();
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
      title: chordData.song || formatTitle(),
      artist: chordData.artist || '',
      path: chordData.content || '',
      key: chordData.key,
      tuning: chordData.tuning,
      capo: chordData.capo
    };
  };
  
  // Add song to My Songs
  const handleSaveSong = () => {
    const songData = createSongData();
    addToMySongs(songData);
  };
  
  if (chordData.loading) {
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
  
  if (chordData.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <ErrorState error={`Failed to load chord sheet: ${chordData.error}`} />
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
          songKey={chordData.key}
          tuning={chordData.tuning}
          capo={chordData.capo}
        />
        <SongViewer 
          song={songData}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleSaveSong}  
          onUpdate={() => {}}         
          backButtonLabel="Back to Search"
          deleteButtonLabel="Add to My Songs"
          deleteButtonVariant="default"
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
