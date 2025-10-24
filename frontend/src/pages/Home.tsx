import { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import TabContainer from "@/components/TabContainer";
import { Song } from "@/types/song";
import { useTabNavigation } from "@/hooks/use-tab-navigation";

import { useChordSheets } from "@/storage/hooks";

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
  const { myChordSheets, refreshMyChordSheets } = useChordSheets();

  // Use the tab navigation hook for URL parameters and navigation
  useTabNavigation({
    myChordSheets,
    setActiveTab,
    activeTab, // Pass current activeTab state to the hook
    setSelectedSong
  });

  return (
    <main className="w-full max-w-3xl mx-auto flex-1 container px-3 py-4 sm:px-4 sm:py-6">
      {/* Development Banner */}
      {process.env.NODE_ENV === 'production' && (
        <div className="text-center bg-primary/30 border-x-4 border-primary p-3 mb-4 rounded shadow-sm">
          <strong>Note:</strong> This app is in development. Some features may not work as expected.
        </div>
      )}
      <TabContainer
        activeTab={activeTab} // Ensure this uses the activeTab state variable
        setActiveTab={setActiveTab}
        myChordSheets={myChordSheets}
        setMySongs={refreshMyChordSheets}
        selectedSong={selectedSong}
        setSelectedSong={setSelectedSong}
      />
    </main>
  );
};

export default Home;
