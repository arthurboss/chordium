import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SongData } from "../types/song";
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
  mySongs: SongData[];
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>;
  selectedSong: SongData | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>;
  demoSong: SongData | null;
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
  
  const handleSongSelect = (song: SongData) => {
    setSelectedSong(song);
    navigate(`/my-songs?song=${song.id}`);
  };
  
  const handleSaveUploadedSong = (content: string, title: string) => {
    handleSaveNewSong(content, title, setMySongs, navigate, setActiveTab);
  };
  
  const handleSongUpdate = (content: string) => {
    handleUpdateSong(content, selectedSong, mySongs, setMySongs, setSelectedSong);
  };
  
  const handleSongDelete = (songId: string) => {
    handleDeleteSong(songId, mySongs, setMySongs, selectedSong, setSelectedSong);
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
