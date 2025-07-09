import { useRef, useEffect } from "react";
import { useTabNavigation } from "@/hooks/use-tab-navigation";
import { useSongSelection } from "@/hooks/use-song-selection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Song } from "../types/song";
import SongList from "./SongList";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { cyAttr } from "@/utils/test-utils";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: Song[];
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  demoSong: Song | null;
}

const TabContainer: React.FC<TabContainerProps> = ({
  activeTab,
  setActiveTab,
  myChordSheets,
  setMySongs,
  selectedSong,
  setSelectedSong,
  demoSong
}) => {
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const { handleTabChange, handleKeyDown } = useTabNavigation(setActiveTab, setSelectedSong);
  const { handleSongSelect } = useSongSelection(setSelectedSong);

  useEffect(() => {
    if (selectedSong || demoSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong, demoSong]);

  const handleSaveUploadedChordSheet = (content: string, title: string) => {
    // Placeholder for IndexedDB implementation
    console.warn('Save chord sheet not implemented - needs IndexedDB replacement');
  };

  const handleChordSheetUpdate = (content: string) => {
    // Placeholder for IndexedDB implementation
    console.warn('Update chord sheet not implemented - needs IndexedDB replacement');
  };

  const handleChordSheetDelete = (songPath: string) => {
    // Placeholder for IndexedDB implementation
    console.warn('Delete chord sheet not implemented - needs IndexedDB replacement');
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
            <div className="p-4 text-center">
              <p>Chord sheet display needs to be reimplemented with IndexedDB</p>
              <button onClick={() => setSelectedSong(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded">
                Back to Song List
              </button>
            </div>
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
}

export default TabContainer;
