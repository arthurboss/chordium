import { useState, useCallback, useEffect } from "react";
import { SongData } from "@/types/song";
import { fetchArtistSongs } from "@/utils/artist-utils";
import { cacheArtistSongs, getCachedArtistSongs, clearExpiredArtistCache } from "@/utils/artist-cache-utils";

interface UseArtistSongsProps {
  setParentLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useArtistSongs(props?: UseArtistSongsProps) {
  const [artistSongs, setArtistSongs] = useState<SongData[] | null>(null);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [currentArtistPath, setCurrentArtistPath] = useState<string | null>(null);
  
  // Clear expired cache entries when component mounts
  useEffect(() => {
    clearExpiredArtistCache();
  }, []);

  const handleArtistClick = useCallback(async (artistPath: string) => {
    if (artistLoading) return;
    
    // Save the current artist path for potential back navigation
    setCurrentArtistPath(artistPath);
    
    // Check if we have cached results first
    const cachedSongs = getCachedArtistSongs(artistPath);
    if (cachedSongs) {
      console.log('Using cached artist songs');
      setArtistSongs(cachedSongs);
      // Even if cached, ensure parent loading state is false if provided
      props?.setParentLoading?.(false);
      return;
    }
    
    setArtistLoading(true);
    props?.setParentLoading?.(true);
    setArtistError(null);
    
    try {
      const songs = await fetchArtistSongs(artistPath);
      setArtistSongs(songs);
      
      // Cache the songs
      cacheArtistSongs(artistPath, songs);
    } catch (e) {
      setArtistError(e instanceof Error ? e.message : 'Failed to fetch artist songs');
    } finally {
      setArtistLoading(false);
      props?.setParentLoading?.(false);
    }
  }, [artistLoading, props]);

  const resetArtistSongs = () => {
    setArtistSongs(null);
    setCurrentArtistPath(null);
  };

  return { 
    artistSongs, 
    artistLoading, 
    artistError, 
    handleArtistClick, 
    resetArtistSongs,
    currentArtistPath
  };
}
