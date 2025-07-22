import { useRef, useEffect } from "react";
import { useTabStatePersistence } from "../hooks/useTabStatePersistence";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import SongList from "./SongList";
import SongViewer from "./SongViewer";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { handleDeleteChordSheetFromUI, handleUpdateChordSheetFromUI, handleSaveNewChordSheetFromUI } from "@/utils/chord-sheet-storage";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: Song[];
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

const TabContainer = ({ 
  activeTab, 
  setActiveTab, 
  myChordSheets, 
  setMySongs,
  selectedSong,
  setSelectedSong
}: TabContainerProps) => {
  const navigate = useNavigate();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const { getTabState, setTabState } = useTabStatePersistence();

  // Example: Persist myChordSheets state (e.g., scroll position)
  const myChordSheetsTabState = getTabState<{ scroll: number }>("my-chord-sheets", { scroll: 0 });
  const setMyChordSheetsTabState = (state: { scroll: number }) => setTabState("my-chord-sheets", state);

  // Scroll to chord display when needed
  useEffect(() => {
    if (selectedSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong]);
  
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
    
    // For My Chord Sheets: Navigate to /my-chord-sheets/:artist/:song and pass Song object as state
    if (song.artist && song.title) {
      // Create URL-friendly slugs using Unicode-aware function
      const artistSlug = toSlug(song.artist);
      const songSlug = toSlug(song.title);
      
      const targetUrl = `/my-chord-sheets/${artistSlug}/${songSlug}`;
      // Pass the Song object as navigation state so ChordViewer can use it directly
      navigate(targetUrl, {
        state: {
          song: song
        }
      });
    } else {
      // Fallback for songs without proper artist/title structure
      setSelectedSong(song);
      navigate(`/my-chord-sheets?song=${encodeURIComponent(song.path)}`, {
        state: {
          song: song
        }
      });
    }
  };
  
  const handleSaveUploadedChordSheet = (content: string, title: string) => {
    handleSaveNewChordSheetFromUI(content, title, setMySongs, navigate, setActiveTab);
  };
  
  const handleChordSheetUpdate = (content: string) => {
    handleUpdateChordSheetFromUI(content, selectedSong, myChordSheets, setMySongs, setSelectedSong);
  };
  
  const handleChordSheetDelete = (songPath: string) => {
    handleDeleteChordSheetFromUI(songPath, myChordSheets, setMySongs, selectedSong, setSelectedSong);
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
      {/* Always render all tab contents, hide inactive with CSS for persistence */}
      <div style={{ display: activeTab === "search" ? "block" : "none" }}>
        <SearchTab
          setMySongs={setMySongs}
          setActiveTab={setActiveTab}
          setSelectedSong={setSelectedSong}
          myChordSheets={myChordSheets}
        />
      </div>
      <div style={{ display: activeTab === "upload" ? "block" : "none" }}>
        <UploadTab
          chordDisplayRef={chordDisplayRef}
          onSaveUploadedSong={handleSaveUploadedChordSheet}
        />
      </div>
      <div style={{ display: activeTab === "my-chord-sheets" ? "block" : "none" }}>
        {selectedSong ? (
          <SongViewer
            song={{
              song: selectedSong,
              chordSheet: unifiedChordSheetCache.getCachedChordSheet(selectedSong.artist, selectedSong.title) || {
                title: selectedSong.title,
                artist: selectedSong.artist,
                songChords: '',
                songKey: '',
                guitarTuning: GUITAR_TUNINGS.STANDARD,
                guitarCapo: 0
              }
            }}
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
            tabState={myChordSheetsTabState}
            setTabState={setMyChordSheetsTabState}
          />
        )}
      </div>
      </div>
    </Tabs>
  );
};

export default TabContainer;
