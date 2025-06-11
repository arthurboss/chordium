import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import SongList from "./SongList";
import SongViewer from "./SongViewer";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { handleSaveNewSong } from "../utils/song-save";
import { handleUpdateSong } from "../utils/song-update";
import { handleDeleteSong } from "../utils/song-delete";
import { cyAttr } from "@/utils/test-utils";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mySongs: Song[];
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  demoSong: Song | null;
}

const TabContainer = ({ 
  activeTab, 
  setActiveTab, 
  mySongs, 
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
    } else if (value === "my-songs") {
      navigate("/my-songs");
    }
  };
  
  const handleSongSelect = (song: Song) => {
    // For My Songs: Navigate to /my-songs/:artist/:song
    if (song.artist && song.title) {
      // Create URL-friendly slugs
      const artistSlug = song.artist.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const songSlug = song.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      navigate(`/my-songs/${artistSlug}/${songSlug}`);
    } else {
      // Fallback for songs without proper artist/title structure
      setSelectedSong(song);
      navigate(`/my-songs?song=${encodeURIComponent(song.path)}`);
    }
  };
  
  const handleSaveUploadedSong = (content: string, title: string) => {
    handleSaveNewSong(content, title, setMySongs, navigate, setActiveTab);
  };
  
  const handleSongUpdate = (content: string) => {
    handleUpdateSong(content, selectedSong, mySongs, setMySongs, setSelectedSong);
  };
  
  const handleSongDelete = (songPath: string) => {
    handleDeleteSong(songPath, mySongs, setMySongs, selectedSong, setSelectedSong);
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
          value="my-songs" 
          className="text-xs sm:text-sm" 
          onKeyDown={(e) => handleKeyDown(e, "my-songs")}
          {...cyAttr("tab-my-songs")}
        >
          My Songs
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
          />
        </TabsContent>
        
        <TabsContent value="upload" className="focus-visible:outline-none focus-visible:ring-0">
          <UploadTab 
            chordDisplayRef={chordDisplayRef}
            onSaveUploadedSong={handleSaveUploadedSong}
          />
        </TabsContent>
        
        <TabsContent value="my-songs" className="focus-visible:outline-none focus-visible:ring-0">
          {selectedSong ? (
            <SongViewer 
              song={selectedSong}
              chordDisplayRef={chordDisplayRef}
              onBack={() => setSelectedSong(null)}
              onDelete={handleSongDelete}
              onUpdate={handleSongUpdate}
            />
          ) : (
            <SongList 
              songs={mySongs}
              onSongSelect={handleSongSelect}
              onDeleteSong={handleSongDelete}
              onUploadClick={() => handleTabChange("upload")}
            />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabContainer;
