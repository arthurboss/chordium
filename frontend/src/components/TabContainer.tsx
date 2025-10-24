import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import type { StoredSongMetadata } from "@/storage/types";
import type { ChordSheet } from "@chordium/types";
import ChordSheetList from "./chord-sheet-list";
import { SearchTab } from "@/search";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { deleteChordSheet, storeChordSheet } from "@/storage/stores/chord-sheets/operations";
import { toast } from "@/hooks/use-toast";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: StoredSongMetadata[];
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
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  // Scroll to chord display when needed
  useEffect(() => {
    if (selectedSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong]);

  const navigateToSearch = () => {
    // Try to restore the last route from session storage
    try {
      const storedQuery = sessionStorage.getItem('chordium_search_query');
      if (storedQuery) {
        const { lastRoute } = JSON.parse(storedQuery);

        if (lastRoute) {
          // Navigate to the stored route (search with query or artist page)
          navigate(lastRoute);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore route from session storage:', error);
    }

    // Fallback: go to basic search page
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

  const handleSongSelect = (metadata: StoredSongMetadata) => {
    // For My Chord Sheets: Navigate directly to chord sheet page
    if (metadata.artist && metadata.title) {
      // Create URL-friendly slugs using Unicode-aware function
      const artistSlug = toSlug(metadata.artist);
      const songSlug = toSlug(metadata.title);

      const targetUrl = `/${artistSlug}/${songSlug}`;
      // Pass a minimal Song object for navigation state
      navigate(targetUrl, {
        state: {
          song: {
            path: metadata.path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });
    } else {
      // Fallback for chord sheets without proper artist/title structure
      navigate(`/${encodeURIComponent(metadata.path)}`, {
        state: {
          song: {
            path: metadata.path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });
    }
  };

  // Utility to map string tuning to enum value
  function mapStringToGuitarTuning(tuning: string) {
    const normalized = tuning.trim().toLowerCase();
    for (const key in GUITAR_TUNINGS) {
      if (
        key.toLowerCase() === normalized ||
        GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS].join('-').toLowerCase() === normalized.replace(/\s+/g, '-')
      ) {
        return GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS];
      }
    }
    return GUITAR_TUNINGS.STANDARD;
  }

  const handleSaveUploadedChordSheet = async (meta: {
    content: string;
    title: string;
    artist: string;
    songKey: string;
    guitarTuning: string;
    guitarCapo: number;
  }) => {
    try {
      // Use the provided guitarCapo value
      const guitarCapo = meta.guitarCapo || 0;

      // Map string tuning to enum value
      const mappedTuning = mapStringToGuitarTuning(meta.guitarTuning);

      // Create metadata and content objects
      const metadata = {
        title: meta.title || "Untitled Song",
        artist: meta.artist || "Unknown Artist",
        songKey: meta.songKey || "",
        guitarTuning: mappedTuning,
        guitarCapo
      };

      const content: ChordSheet = {
        songChords: meta.content
      };

      // Create a path for the chord sheet using artist and title
      const artistSlug = toSlug(metadata.artist);
      const titleSlug = toSlug(metadata.title);
      const path = `${artistSlug}/${titleSlug}`;

      // Store the chord sheet in IndexedDB as a saved chord sheet
      await storeChordSheet(metadata, content, true, path);

      // Show success notification
      toast({
        title: "Chord sheet saved",
        description: `"${metadata.title}" has been saved to My Chord Sheets`,
      });

      // Refresh the chord sheets list to show the new addition
      await setMySongs();

      // Navigate to the saved chord sheet
      navigate(`/${artistSlug}/${titleSlug}`, {
        state: {
          song: {
            path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to save uploaded chord sheet:', error);
      }
      toast({
        title: "Save failed",
        description: "Failed to save the chord sheet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChordSheetDelete = async (songPath: string) => {
    // Find the song for user feedback
    const songToDelete = myChordSheets.find(song => song.path === songPath);

    if (!songToDelete) {
      if (import.meta.env.DEV) {
        console.error('Song not found for deletion:', songPath);
      }
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
      if (import.meta.env.DEV) {
        console.error('Failed to remove chord sheet:', error);
      }
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
