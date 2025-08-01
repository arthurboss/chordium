import { Song } from "@chordium/types";
import type { StoredChordSheet } from "@/storage/types";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSearchParamsType } from "@/search/utils";

interface TabNavigationProps {
  myChordSheets: StoredChordSheet[];
  setActiveTab: (tab: string) => void;
  activeTab: string; // Added: current activeTab from Home's state
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

/**
 * Determines which tab should be active based on the current path and query parameters
 */
const determineActiveTab = (path: string, queryParams: URLSearchParams): string => {
  
  // Handle path-based routing first - paths take priority over query parameters
  switch (true) {
    case path.startsWith("/upload"):
      return "upload";
    
    case path.startsWith("/search"):
      // Explicit search path
      return "search";
    
    case path === "/":
      // Root path defaults to my-chord-sheets
      return "my-chord-sheets";
    
    default: {
      // Handle artist routes and chord sheet routes: /artist or /artist/song
      const pathSegments = path.split('/').filter(segment => segment.length > 0);
      
      if (pathSegments.length === 1 && pathSegments[0] !== '') {
        // This is an artist page: /artist-name - show search tab
        return "search";
      } else if (pathSegments.length === 2) {
        // This is a chord sheet page: /artist/song
        // For unified URLs, we'll default to my-chord-sheets tab
        // The ChordViewer component can handle navigation state for context
        return "my-chord-sheets";
      }
      
      // Handle search context based on query parameters only for non-specific paths
      if (getSearchParamsType(queryParams)) {
        return "search";
      }
      
      // Fallback for unknown paths, default to "my-chord-sheets"
      return "my-chord-sheets";
    }
  }
};

/**
 * Handles song selection logic for My Chord Sheets tab
 */
const handleSongSelection = (
  songIdFromQuery: string,
  determinedTab: string,
  myChordSheets: StoredChordSheet[],
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  // Only handle song selection if we're in my-chord-sheets tab
  if (determinedTab !== "my-chord-sheets") {
    return;
  }

  // Check user's songs (includes sample songs in dev mode)
  if (myChordSheets?.length > 0) {
    const foundMySong = myChordSheets.find(song => song.path === songIdFromQuery);
    if (foundMySong) {
      // Convert StoredChordSheet to Song for selection
      const songForSelection: Song = {
        path: foundMySong.path,
        title: foundMySong.title,
        artist: foundMySong.artist
      };
      setSelectedSong(songForSelection);
      return;
    }
  }

  // Song not found - clear selection
  setSelectedSong(null);
};

export const useTabNavigation = ({
  myChordSheets,
  setActiveTab,
  activeTab, // Consumed here
  setSelectedSong
}: TabNavigationProps): void => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const queryParams = new URLSearchParams(location.search);
    const songIdFromQuery = queryParams.get("song");

    // Determine the tab based on the current path and search parameters
    const determinedTab = determineActiveTab(currentPath, queryParams);
    
    // Update active tab if it has changed
    if (activeTab !== determinedTab) {
      setActiveTab(determinedTab);
    }

    // Handle song selection for My Chord Sheets tab
    if (songIdFromQuery) {
      handleSongSelection(
        songIdFromQuery,
        determinedTab,
        myChordSheets,
        setSelectedSong
      );
    }
  }, [location, myChordSheets, setActiveTab, activeTab, setSelectedSong]);
};
