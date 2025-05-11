import { SongData } from "../types/song";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const handleSaveNewSong = (
  content: string,
  title: string,
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>,
  navigate: NavigateFunction,
  setActiveTab: (tab: string) => void
): void => {
  if (!content.trim()) {
    toast({
      title: "Error",
      description: "No content to save",
      variant: "destructive"
    });
    return;
  }
  
  const newSong: SongData = {
    id: `song-${Date.now()}`,
    title: title || "Untitled Song",
    path: content,
    dateAdded: new Date().toISOString()
  };
  
  setMySongs(prev => [newSong, ...prev]);
  
  toast({
    title: "Song saved",
    description: `"${title || "Untitled Song"}" has been added to My Songs`
  });
  
  setActiveTab("my-songs");
  navigate("/my-songs");
};

export const handleUpdateSong = (
  content: string,
  selectedSong: SongData | null,
  mySongs: SongData[],
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>
): void => {
  if (!selectedSong) return;
  
  const updatedSongs = mySongs.map(song => {
    if (song.id === selectedSong.id) {
      return { ...song, path: content };
    }
    return song;
  });
  
  setMySongs(updatedSongs);
  setSelectedSong({ ...selectedSong, path: content });
  
  toast({
    title: "Song updated",
    description: `"${selectedSong.title}" has been updated`
  });
};

export const handleDeleteSong = (
  songId: string,
  mySongs: SongData[],
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>,
  selectedSong: SongData | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>
): void => {
  const songToDelete = mySongs.find(song => song.id === songId);
  if (!songToDelete) return;
  
  const updatedSongs = mySongs.filter(song => song.id !== songId);
  setMySongs(updatedSongs);
  
  if (selectedSong?.id === songId) {
    setSelectedSong(null);
  }
  
  toast({
    title: "Song deleted",
    description: `"${songToDelete.title}" has been removed from My Songs`
  });
};
