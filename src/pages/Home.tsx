import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabContainer from "@/components/TabContainer";
import { Song } from "@/types/song";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import TestComponent from "@/components/TestComponent";
// import { useSampleSongs } from "@/hooks/use-sample-songs"; // ARCHIVED: sample songs now loaded via IndexedDB
import { useSearchRedirect } from "@/hooks/use-search-redirect";


import { getInitialTab } from "@/utils/get-initial-tab";

const Home = () => {
  const location = useLocation(); // Get location
  const [activeTab, setActiveTab] = useState(() => getInitialTab(location.pathname)); // Initialize based on path
  const [demoSong, setDemoSong] = useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  // TODO: Replace with IndexedDB-based sample song and chord sheet loading
  // const { sampleSongs, myChordSheets, setMySongs, refreshMySongs } = useSampleSongs(); // ARCHIVED
  const sampleSongs: Song[] = []; // Placeholder until IndexedDB implementation
  const myChordSheets: Song[] = [];
  const setMySongs = () => {};
  const refreshMySongs = () => {};
  useSearchRedirect();

  // Refresh My Chord Sheets when the active tab changes to my-chord-sheets
  useEffect(() => {
    if (activeTab === 'my-chord-sheets') {
      refreshMySongs();
    }
  }, [activeTab, refreshMySongs]);

  // Use the tab navigation hook for URL parameters and navigation
  useTabNavigation({
    sampleSongs,
    myChordSheets,
    setActiveTab,
    activeTab, // Pass current activeTab state to the hook
    setDemoSong,
    setSelectedSong
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="w-full max-w-3xl mx-auto flex-1 container px-3 py-4 sm:px-4 sm:py-6">
        <TabContainer 
          activeTab={activeTab} // Ensure this uses the activeTab state variable
          setActiveTab={setActiveTab}
          myChordSheets={myChordSheets}
          setMySongs={setMySongs}
          selectedSong={selectedSong}
          setSelectedSong={setSelectedSong}
          demoSong={demoSong}
        />
      </main>
      
      {/* Include test component for build optimization testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          <TestComponent />
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;
