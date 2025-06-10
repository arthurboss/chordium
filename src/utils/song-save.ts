import { Song } from "../types/song";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

/**
 * Saves a new song to the user's collection
 */
export const handleSaveNewSong = (
  content: string,
  title: string,
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  navigate: NavigateFunction,
  setActiveTab: (tab: string) => void,
  artist?: string,
  key?: string,
  tuning?: string, 
  capo?: string
): void => {
  if (!content.trim()) {
    toast({
      title: "Error",
      description: "No content to save",
      variant: "destructive"
    });
    return;
  }
  
  const newSong: Song = {
    title: title || "Untitled Song",
    path: content,
    artist,
    key,
    tuning,
    capo
  };
  
  setMySongs(prev => [newSong, ...prev]);
  
  toast({
    title: "Song saved",
    description: `"${title || "Untitled Song"}" has been added to My Songs`
  });
  
  setActiveTab("my-songs");
  navigate("/my-songs");
};
