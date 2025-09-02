import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import type { StoredChordSheet } from "@/storage/types";
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
import { urlPersistenceService } from "@/services/url-persistence.service";

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

  // Debug log to see if TabContainer is rendered
  console.log('🔄 TabContainer: component rendered', {
    pathname: location.pathname,
    activeTab,
    lastSearchUrl: urlPersistenceService.getLastSearchUrl()
  });

  // Track when we're on a search-related page and store the URL
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    console.log('🔄 TabContainer: tracking URL:', {
      currentPath,
      pathname: location.pathname,
      search: location.search,
      isSearchPage: location.pathname === '/search',
      isMyChordSheets: location.pathname.startsWith('/my-chord-sheets'),
      isUpload: location.pathname.startsWith('/upload'),
      isRoot: location.pathname === '/',
      shouldStore: location.pathname === '/search' ||
        (!location.pathname.startsWith('/my-chord-sheets') &&
          !location.pathname.startsWith('/upload') &&
          location.pathname !== '/')
    });

    // Store URL if it's a search page or an artist page (not basic app tabs)
    if (location.pathname === '/search' ||
      (!location.pathname.startsWith('/my-chord-sheets') &&
        !location.pathname.startsWith('/upload') &&
        location.pathname !== '/')) {
      console.log('🔄 TabContainer: storing URL:', currentPath);
      urlPersistenceService.setLastSearchUrl(currentPath);
    } else {
      console.log('🔄 TabContainer: not storing URL (basic app tab)');
    }
  }, [location.pathname, location.search]);

  // Scroll to chord display when needed
  useEffect(() => {
    if (selectedSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong]);

  const navigateToSearch = () => {
    const lastSearchUrl = urlPersistenceService.getLastSearchUrl();
    console.log('🔄 TabContainer: navigateToSearch called, lastSearchUrl:', lastSearchUrl);
    
    // First priority: use the stored search URL from service
    if (lastSearchUrl) {
      // Check if the stored URL is an artist route (/:artist)
      const isArtistRoute = lastSearchUrl.startsWith('/') && 
        !lastSearchUrl.startsWith('/search') && 
        !lastSearchUrl.startsWith('/my-chord-sheets') && 
        !lastSearchUrl.startsWith('/upload') &&
        lastSearchUrl !== '/' &&
        lastSearchUrl.split('/').filter(segment => segment.length > 0).length === 1;
      
      console.log('🔄 TabContainer: URL analysis:', {
        lastSearchUrl,
        isArtistRoute,
        isSearchRoute: lastSearchUrl.startsWith('/search')
      });
      
      if (isArtistRoute) {
        // For artist routes, navigate directly to the artist URL
        // The search tab will handle artist routes properly
        console.log('🔄 TabContainer: navigating to artist route:', lastSearchUrl);
        navigate(lastSearchUrl);
        return;
      } else if (lastSearchUrl.startsWith('/search')) {
        // For search routes, navigate to the stored search URL
        console.log('🔄 TabContainer: navigating to search route:', lastSearchUrl);
        navigate(lastSearchUrl);
        return;
      }
    }

    // Final fallback: go to basic search page
    console.log('🔄 TabContainer: navigating to fallback search page');
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

      // Create a ChordSheet object with user-confirmed metadata
      const chordSheet: ChordSheet = {
        title: meta.title || "Untitled Song",
        artist: meta.artist || "Unknown Artist",
        songChords: meta.content,
        songKey: meta.songKey || "",
        guitarTuning: mappedTuning,
        guitarCapo
      };

      // Create a path for the chord sheet using artist and title
      const artistSlug = toSlug(chordSheet.artist);
      const titleSlug = toSlug(chordSheet.title);
      const path = `${artistSlug}/${titleSlug}`;

      // Store the chord sheet in IndexedDB as a saved chord sheet
      await storeChordSheet(chordSheet, true, path);

      // Show success notification
      toast({
        title: "Chord sheet saved",
        description: `"${chordSheet.title}" has been saved to My Chord Sheets`,
      });

      // Refresh the chord sheets list to show the new addition
      await setMySongs();

      // Navigate to the saved chord sheet
      navigate(`/${artistSlug}/${titleSlug}`, {
        state: {
          song: {
            path,
            title: chordSheet.title,
            artist: chordSheet.artist
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
