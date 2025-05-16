import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabContainer from "@/components/TabContainer";
import { SongData } from "@/types/song";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import TestComponent from "@/components/TestComponent";
import { useSampleSongs } from "@/hooks/use-sample-songs";
import { useSaveSongs } from "@/hooks/use-save-songs";
import { useSearchRedirect } from "@/hooks/use-search-redirect";

const Home = () => {
  const [activeTab, setActiveTab] = useState("my-songs");
  const [demoSong, setDemoSong] = useState<SongData | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const { sampleSongs, mySongs, setMySongs } = useSampleSongs();
  useSaveSongs(mySongs);
  useSearchRedirect();

  // Use the tab navigation hook for URL parameters and navigation
  useTabNavigation({
    sampleSongs,
    mySongs,
    setActiveTab,
    setDemoSong,
    setSelectedSong
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="w-full max-w-3xl mx-auto flex-1 container px-3 py-4 sm:px-4 sm:py-6">
        <TabContainer 
          activeTab={activeTab}
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
