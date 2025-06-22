import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabContainer from "@/components/TabContainer";
import { Song } from "@/types/song";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import TestComponent from "@/components/TestComponent";
import { useSampleSongs } from "@/hooks/use-sample-songs";
import { useSaveSongs } from "@/hooks/use-save-songs";
import { useSearchRedirect } from "@/hooks/use-search-redirect";

// Function to determine initial tab based on path
const getInitialTab = (pathname: string): string => {
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/upload")) return "upload";
  return "my-songs"; // Default
};

const Home = () => {
  const location = useLocation(); // Get location
  const [activeTab, setActiveTab] = useState(() => getInitialTab(location.pathname)); // Initialize based on path
  const [demoSong, setDemoSong] = useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { sampleSongs, mySongs, setMySongs, refreshMySongs } = useSampleSongs();
  useSaveSongs(mySongs);
  useSearchRedirect();

  // Refresh My Songs when the active tab changes to my-songs
  useEffect(() => {
    if (activeTab === 'my-songs') {
      refreshMySongs();
    }
  }, [activeTab, refreshMySongs]);

  // Use the tab navigation hook for URL parameters and navigation
  useTabNavigation({
    sampleSongs,
    mySongs,
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
          mySongs={mySongs}
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
