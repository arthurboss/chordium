import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabContainer from "@/components/TabContainer";
import { Song } from "@/types/song";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import TestComponent from "@/components/TestComponent";
import { useSampleSongs } from "@/hooks/use-sample-songs";
import { useSearchRedirect } from "@/hooks/use-search-redirect";

// Function to determine initial tab based on path
const getInitialTab = (pathname: string): string => {
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/upload")) return "upload";
  if (pathname.startsWith("/my-chord-sheets")) return "my-chord-sheets";
  
  // Handle artist routes: /artist-name
  // Check if it's a direct artist path (not a song path like /artist/song)
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  if (pathSegments.length === 1 && pathSegments[0] !== '') {
    // This is likely an artist page, show search tab with artist selected
    return "search";
  }
  
  return "my-chord-sheets"; // Default
};

const Home = () => {
  const location = useLocation(); // Get location
  const [activeTab, setActiveTab] = useState(() => getInitialTab(location.pathname)); // Initialize based on path
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { myChordSheets, setMySongs, refreshMySongs } = useSampleSongs();
  useSearchRedirect();

  // Refresh My Chord Sheets when the active tab changes to my-chord-sheets
  useEffect(() => {
    if (activeTab === 'my-chord-sheets') {
      refreshMySongs();
    }
  }, [activeTab, refreshMySongs]);

  // Use the tab navigation hook for URL parameters and navigation
  useTabNavigation({
    myChordSheets,
    setActiveTab,
    activeTab, // Pass current activeTab state to the hook
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
