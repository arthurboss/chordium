import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { handleSaveNewSong } from "@/utils/song-save";
import { useNavigate } from "react-router-dom";

interface AddToMySongsData {
  song: Song;
  chordSheet: ChordSheet;
  content: string; // The actual chord sheet content
}

export function useAddToMySongs(setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>, setActiveTab?: (tab: string) => void) {
  const navigate = useNavigate();
  
  return async (data: AddToMySongsData) => {
    const { song, chordSheet, content } = data;
    
    try {
      // Use provided content or generate from URL
      let finalContent = content || song.path;
      
      // If path looks like a URL, generate placeholder content using chordSheet data
      if (song.path.startsWith('http')) {
        finalContent = `# ${chordSheet.title || 'Untitled Song'}\n## ${chordSheet.artist || 'Unknown Artist'}\n\n...`;
      }
      
      // Create metadata based on chord sheet data
      let metadata = '';
      if (chordSheet.key) metadata += `Key: ${chordSheet.key}\n`;
      if (chordSheet.tuning) metadata += `Tuning: ${chordSheet.tuning}\n`;
      if (chordSheet.capo) metadata += `Capo: ${chordSheet.capo}\n`;
      
      // Add metadata if available
      if (metadata) {
        finalContent = `${metadata}\n\n${finalContent}`;
      }
      
      if (setMySongs && setActiveTab) {
        // User is on home page with state
        handleSaveNewSong(
          finalContent, 
          song.title, 
          setMySongs, 
          navigate, 
          setActiveTab,
          song.artist
        );
      } else {
        // User is on chord viewer page - use toast to show success and redirect
        // Use unified storage system to maintain consistency
        const { getSongs, saveSongs, migrateSongsFromOldStorage } = await import('@/utils/unified-song-storage');
        
        // Perform migration if needed to ensure data consistency
        migrateSongsFromOldStorage();
        
        const currentSongs = getSongs();
        
        // Create the new song (without chord metadata)
        const newSong: Song = {
          title: song.title || "Untitled Song",
          path: finalContent,
          artist: song.artist
        };
        
        // Save the updated songs list
        saveSongs([newSong, ...currentSongs]);
        
        // Show success toast
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Song added to My Songs',
          description: `${chordSheet.artist ? chordSheet.artist + ' - ' : ''}${chordSheet.title} has been added to your songs.`,
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
