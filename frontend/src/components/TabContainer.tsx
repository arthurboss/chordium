import { useRef, useEffect, useState } from "react";
import { useTabStatePersistence } from "../hooks/useTabStatePersistence";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchState } from "@/context/SearchStateContext";

import { Song } from "../types/song";
import type { StoredChordSheet } from "@/storage/types";
import SongList from "./SongList";
import SongViewer from "./SongViewer";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { deleteChordSheet } from "@/storage/services";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: StoredChordSheet[];
  setMySongs: () => Promise<void>; // This is actually the refresh function
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
  const location = useLocation();
  const { searchState } = useSearchState();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const { getTabState, setTabState } = useTabStatePersistence();

  // Local state to track the last search URL for tab switching
  const [lastSearchUrl, setLastSearchUrl] = useState<string | null>(null);

  // Example: Persist myChordSheets state (e.g., scroll position)
  const myChordSheetsTabState = getTabState<{ scroll: number }>("my-chord-sheets", { scroll: 0 });
  const setMyChordSheetsTabState = (state: { scroll: number }) => setTabState("my-chord-sheets", state);

  // Track when we're on a search-related page and store the URL
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Store URL if it's a search page or an artist page (not basic app tabs)
    if (location.pathname === '/search' ||
      (!location.pathname.startsWith('/my-chord-sheets') &&
        !location.pathname.startsWith('/upload') &&
        location.pathname !== '/')) {
      setLastSearchUrl(currentPath);
    }
  }, [location.pathname, location.search]);

  // Scroll to chord display when needed
  useEffect(() => {
    if (selectedSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong]);

  const navigateToSearch = () => {
    // First priority: use the stored search URL from local state
    if (lastSearchUrl) {
      navigate(lastSearchUrl);
      return;
    }

    // Fallback: construct from current search state
    if (searchState.artist || searchState.song) {
      const params = new URLSearchParams();
      if (searchState.artist) params.set('artist', toSlug(searchState.artist));
      if (searchState.song) params.set('song', toSlug(searchState.song));

      const searchUrl = `/search?${params.toString()}`;
      navigate(searchUrl);
      return;
    }

    // Final fallback: go to basic search page
    navigate("/search");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedSong(null);

    if (value === "upload") {
      navigate("/upload");
    } else if (value === "search") {
      navigateToSearch();
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
    // NOTE: Save functionality will be implemented with IndexedDB
    console.warn('Save functionality not yet implemented');
  };

  const handleChordSheetUpdate = (content: string) => {
    // NOTE: Update functionality will be implemented with IndexedDB
    console.warn('Update functionality not yet implemented');
  };

  const handleChordSheetDelete = async (songPath: string) => {
    // Find the song for user feedback
    const songToDelete = myChordSheets.find(song => song.path === songPath);
    const songTitle = songToDelete?.title || 'Unknown song';

    try {
      // Delete from IndexedDB using the service
      await deleteChordSheet(songPath, songTitle);

      // Refresh the data from IndexedDB (this updates the UI)
      await setMySongs();

      // Clear selection if the deleted song was selected
      if (selectedSong?.path === songPath) {
        setSelectedSong(null);
      }
    } catch (error) {
      // Error handling and user feedback is done by the service
      console.error('Delete operation failed:', error);
    }
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
                chordSheet: {
                  // NOTE: Chord sheet content loading will be implemented with IndexedDB
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
              hideDeleteButton={false}
              hideSaveButton={true}
              isFromMyChordSheets={true}
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
