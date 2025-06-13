import { Song } from "@/types/song";
import { handleSaveNewSong } from "@/utils/song-save";
import { useNavigate } from "react-router-dom";

export function useAddToMySongs(setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>, setActiveTab?: (tab: string) => void) {
  const navigate = useNavigate();
  
  return async (song: Song) => {
    try {
      // Generate content if path is actually a URL (not content)
      let content = song.path;
      
      // If it looks like a URL, generate placeholder content
      if (song.path.startsWith('http')) {
        content = `# ${song.title || 'Untitled Song'}\n## ${song.artist || 'Unknown Artist'}\n\n...`;
      }
      
      // Create metadata based on song data
      let metadata = '';
      if (song.key) metadata += `Key: ${song.key}\n`;
      if (song.tuning) metadata += `Tuning: ${song.tuning}\n`;
      if (song.capo) metadata += `Capo: ${song.capo}\n`;
      
      // Add metadata if available
      if (metadata) {
        content = `${metadata}\n\n${content}`;
      }
      
      if (setMySongs && setActiveTab) {
        // User is on home page with state
        handleSaveNewSong(
          content, 
          song.title, 
          setMySongs, 
          navigate, 
          setActiveTab,
          song.artist,
          song.key,
          song.tuning,
          song.capo
        );
      } else {
        // User is on chord viewer page - use toast to show success and redirect
        // Use unified storage system to maintain consistency
        const { getSongs, saveSongs, migrateSongsFromOldStorage } = await import('@/utils/unified-song-storage');
        
        // Perform migration if needed to ensure data consistency
        migrateSongsFromOldStorage();
        
        const currentSongs = getSongs();
        
        // Create the new song
        const newSong: Song = {
          title: song.title || "Untitled Song",
          path: content,
          artist: song.artist,
          key: song.key,
          tuning: song.tuning,
          capo: song.capo
        };
        
        // Save the updated songs list
        saveSongs([newSong, ...currentSongs]);
        
        // Show success toast
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Song added to My Songs',
          description: `${song.artist ? song.artist + ' - ' : ''}${song.title} has been added to your songs.`,
          variant: 'default'
        });
        
        // Redirect to My Songs tab
        navigate('/my-songs');
      }
    } catch (err) {
      console.error("Error adding song to My Songs:", err);
      
      // Show error toast
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Error',
        description: 'Failed to add song to My Songs',
        variant: 'destructive'
      });
    }
  };
}
