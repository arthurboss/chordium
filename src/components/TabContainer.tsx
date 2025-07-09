import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import SongList from "./SongList";
import SongViewer from "./SongViewer";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: Song[];
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  demoSong: Song | null;
}

const TabContainer = ({ 
  activeTab, 
  setActiveTab, 
  myChordSheets, 
  setMySongs,
  selectedSong,
  setSelectedSong,
  demoSong
}: TabContainerProps) => {
  const navigate = useNavigate();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  
  // Scroll to chord display when needed
  useEffect(() => {
    if (selectedSong || demoSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong, demoSong]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedSong(null);
    
    if (value === "upload") {
      navigate("/upload");
    } else if (value === "search") {
      navigate("/search");
    } else if (value === "my-chord-sheets") {
      navigate("/my-chord-sheets");
    }
  };
  
  const handleSongSelect = (song: Song) => {
    console.log('🎵 [TabContainer] handleSongSelect called with:', song);
    
    // For My Chord Sheets: Navigate to /my-chord-sheets/:artist/:song and pass Song object as state
    if (song.artist && song.title) {
      // Create URL-friendly slugs using Unicode-aware function
      const artistSlug = toSlug(song.artist);
      const songSlug = toSlug(song.title);
      
      const targetUrl = `/my-chord-sheets/${artistSlug}/${songSlug}`;
      console.log('🎯 [TabContainer] Navigating to:', targetUrl, 'with song data:', song);
      // Pass the Song object as navigation state so ChordViewer can use it directly
      navigate(targetUrl, {
        state: {
          song: song
        }
      });
    } else {
      // Fallback for songs without proper artist/title structure
      console.log('🔄 [TabContainer] Using fallback navigation for:', song.path);
      setSelectedSong(song);
      navigate(`/my-chord-sheets?song=${encodeURIComponent(song.path)}`, {
        state: {
          song: song
        }
      });
    }
  };
  
  const handleSaveUploadedChordSheet = (content: string, title: string) => {
    // TODO: Replace with IndexedDB storage implementation
    // handleSaveNewChordSheetFromUI(content, title, setMySongs, navigate, setActiveTab);
    console.warn('Save chord sheet not implemented - needs IndexedDB replacement');
  };
  
  const handleChordSheetUpdate = (content: string) => {
    // TODO: Replace with IndexedDB storage implementation
    // handleUpdateChordSheetFromUI(content, selectedSong, myChordSheets, setMySongs, setSelectedSong);
    console.warn('Update chord sheet not implemented - needs IndexedDB replacement');
  };
  
  const handleChordSheetDelete = (songPath: string) => {
    // TODO: Replace with IndexedDB storage implementation
    // handleDeleteChordSheetFromUI(songPath, myChordSheets, setMySongs, selectedSong, setSelectedSong);
    console.warn('Delete chord sheet not implemented - needs IndexedDB replacement');
  };

  // Handle keyboard navigation for the tabs
  const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList 
        className="grid w-full grid-cols-[repeat(auto-fit,_minmax(0,_1fr))]" 
        role="tablist"
        {...cyAttr("tabs-list")}
      >
        <TabsTrigger 
          value="my-chord-sheets" 
          className="text-xs sm:text-sm" 
          onKeyDown={(e) => handleKeyDown(e, "my-chord-sheets")}
          {...cyAttr("tab-my-chord-sheets")}
        >
          My Chord Sheets
        </TabsTrigger>
        <TabsTrigger 
          value="search" 
          className="text-xs sm:text-sm" 
          onKeyDown={(e) => handleKeyDown(e, "search")}
          {...cyAttr("tab-search")}
        >
          Search
        </TabsTrigger>
        <TabsTrigger 
          value="upload" 
          className="text-xs sm:text-sm" 
          onKeyDown={(e) => handleKeyDown(e, "upload")}
          {...cyAttr("tab-upload")}
        >
          Upload
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-4 sm:mt-6">
        <TabsContent value="search" className="focus-visible:outline-none focus-visible:ring-0">
          <SearchTab 
            setMySongs={setMySongs}
            setActiveTab={setActiveTab}
            setSelectedSong={setSelectedSong}
            myChordSheets={myChordSheets}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="focus-visible:outline-none focus-visible:ring-0">
          <UploadTab 
            chordDisplayRef={chordDisplayRef}
            onSaveUploadedSong={handleSaveUploadedChordSheet}
          />
        </TabsContent>
        
        <TabsContent value="my-chord-sheets" className="focus-visible:outline-none focus-visible:ring-0">
          {selectedSong ? (
            <SongViewer 
              song={selectedSong}
              chordDisplayRef={chordDisplayRef}
              onBack={() => setSelectedSong(null)}
              onDelete={handleChordSheetDelete}
              onUpdate={handleChordSheetUpdate}
            />
          ) : (
            <SongList 
              songs={myChordSheets}
              onSongSelect={handleSongSelect}
              onDeleteSong={handleChordSheetDelete}
              onUploadClick={() => handleTabChange("upload")}
            />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabContainer;
