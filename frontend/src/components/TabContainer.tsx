import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import type { StoredChordSheet } from "@/storage/types";
import ChordSheetList from "./chord-sheet-list";
import { SearchTab } from "@/search";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { deleteChordSheet } from "@/storage/stores/chord-sheets/operations";
import { toast } from "@/hooks/use-toast";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";

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
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  // Local state to track the last search URL for tab switching
  const [lastSearchUrl, setLastSearchUrl] = useState<string | null>(null);

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

  const handleSongSelect = (storedChordSheet: StoredChordSheet) => {

    // For My Chord Sheets: Navigate directly to chord sheet page
    if (storedChordSheet.artist && storedChordSheet.title) {
      // Create URL-friendly slugs using Unicode-aware function
      const artistSlug = toSlug(storedChordSheet.artist);
      const songSlug = toSlug(storedChordSheet.title);

      const targetUrl = `/${artistSlug}/${songSlug}`;
      // Pass a minimal Song object for navigation state
      navigate(targetUrl, {
        state: {
          song: {
            path: storedChordSheet.path,
            title: storedChordSheet.title,
            artist: storedChordSheet.artist
          }
        }
      });
    } else {
      // Fallback for chord sheets without proper artist/title structure
      navigate(`/${encodeURIComponent(storedChordSheet.path)}`, {
        state: {
          song: {
            path: storedChordSheet.path,
            title: storedChordSheet.title,
            artist: storedChordSheet.artist
          }
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

    if (!songToDelete) {
      console.error('Song not found for deletion:', songPath);
      return;
    }

    try {
      // Use pure database operation
      await deleteChordSheet(songPath);

      toast({
        title: "Chord sheet removed",
        description: `"${songToDelete.title}" has been removed from My Chord Sheets`,
      });

      // Refresh the data from IndexedDB (this updates the UI)
      await setMySongs();

      // Clear selection if the deleted song was selected
      if (selectedSong?.path === songPath) {
        setSelectedSong(null);
      }
    } catch (error) {
      console.error('Failed to remove chord sheet:', error);
      toast({
        title: "Remove failed",
        description: `Failed to remove "${songToDelete.title}". Please try again.`,
        variant: "destructive"
      });
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
          />
        </div>
        <div style={{ display: activeTab === "upload" ? "block" : "none" }}>
          <UploadTab
            chordDisplayRef={chordDisplayRef}
            onSaveUploadedSong={handleSaveUploadedChordSheet}
          />
        </div>
        <div style={{ display: activeTab === "my-chord-sheets" ? "block" : "none" }}>
          <ChordSheetList
            chordSheets={myChordSheets}
            onChordSheetSelect={handleSongSelect}
            onDeleteChordSheet={handleChordSheetDelete}
            onUploadClick={() => handleTabChange("upload")}
          />
        </div>
      </div>
    </Tabs>
  );
};

export default TabContainer;
