import { Song } from "../types/song";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSearchParamsType } from "@/utils/search-utils";

interface TabNavigationProps {
  sampleSongs: Song[];
  myChordSheets: Song[];
  setActiveTab: (tab: string) => void;
  activeTab: string; // Added: current activeTab from Home's state
  setDemoSong: React.Dispatch<React.SetStateAction<Song | null>>;
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
    
    case path.startsWith("/my-chord-sheets"):
      // This includes /my-chord-sheets/artist/song routes - should stay in my-chord-sheets tab
      // Path-based routing takes priority over query parameters for My Chord Sheets
      return "my-chord-sheets";
    
    case path.startsWith("/search"):
      // Explicit search path
      return "search";
    
    case path.startsWith("/artist/"):
      // Artist songs from search results - show in search tab
      return "search";
    
    case path === "/":
      // Root path defaults to my-chord-sheets
      return "my-chord-sheets";
    
    default:
      // Handle search context based on query parameters only for non-specific paths
      if (getSearchParamsType(queryParams)) {
        return "search";
      }
      
      // Fallback for unknown paths, default to "my-chord-sheets"
      return "my-chord-sheets";
  }
};

/**
 * Handles song selection logic for My Chord Sheets tab
 */
const handleSongSelection = (
  songIdFromQuery: string,
  determinedTab: string,
  sampleSongs: Song[],
  myChordSheets: Song[],
  setDemoSong: React.Dispatch<React.SetStateAction<Song | null>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  // Only handle song selection if we're in my-chord-sheets tab
  if (determinedTab !== "my-chord-sheets") {
    return;
  }

  // Check sample songs first
  if (sampleSongs?.length > 0) {
    const foundDemo = sampleSongs.find((song) => song.path === songIdFromQuery);
    if (foundDemo) {
      setDemoSong({ ...foundDemo } as Song);
      setSelectedSong(null);
      return;
    }
  }

  // Check user's songs if not found in sample songs
  if (myChordSheets?.length > 0) {
    const foundMySong = myChordSheets.find(song => song.path === songIdFromQuery);
    if (foundMySong) {
      setSelectedSong(foundMySong);
      setDemoSong(null);
      return;
    }
  }

  // Song not found - could clear selections here if needed
  // setDemoSong(null);
  // setSelectedSong(null);
};

export const useTabNavigation = ({
  sampleSongs,
  myChordSheets,
  setActiveTab,
  activeTab, // Consumed here
  setDemoSong,
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
        sampleSongs,
        myChordSheets,
        setDemoSong,
        setSelectedSong
      );
    }
  }, [location, sampleSongs, myChordSheets, setActiveTab, activeTab, setDemoSong, setSelectedSong]);
};
