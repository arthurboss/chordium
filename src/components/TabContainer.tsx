import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SongData } from "../types/song";
import SongList from "./SongList";
import SongViewer from "./SongViewer";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { handleSaveNewSong, handleUpdateSong, handleDeleteSong } from "../utils/song-actions";

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

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-[repeat(auto-fit,_minmax(0,_1fr))]" role="tablist">
        <TabsTrigger 
          value="my-songs" 
          className="text-xs sm:text-sm" 
          tabIndex={0} 
          aria-selected={activeTab === "my-songs"}
        >
          My Songs
        </TabsTrigger>
        <TabsTrigger 
          value="search" 
          className="text-xs sm:text-sm" 
          tabIndex={0} 
          aria-selected={activeTab === "search"}
        >
          Search
        </TabsTrigger>
        <TabsTrigger 
          value="upload" 
          className="text-xs sm:text-sm" 
          tabIndex={0} 
          aria-selected={activeTab === "upload"}
        >
          Upload
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-4 sm:mt-6">
        <TabsContent value="search" className="focus-visible:outline-none focus-visible:ring-0">
          <SearchTab />
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
