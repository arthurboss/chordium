import { useRef, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { getSavedChordSheet } from "@/storage/services";
import { deleteChordSheet } from "@/storage/stores/chord-sheets/operations";
import { toast } from "@/hooks/use-toast";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
import type { Song, ChordSheet } from "@chordium/types";

const ChordViewer = () => {
  const { artist, song } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  // Song object from navigation state (if passed from search results)
  const navigationSong = location.state?.song as Song | undefined;

  // Local state for chord sheet data
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [chordSheetPath, setChordSheetPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChordSheet() {
      setIsLoading(true);
      setError(null);
      const path = navigationSong?.path || (artist && song ? generateChordSheetId(artist, song) : undefined);
      if (!path) {
        setError("Invalid song path");
        setIsLoading(false);
        return;
      }
      try {
        const savedChordSheet = await getSavedChordSheet(path);
        if (savedChordSheet) {
          setChordSheet(savedChordSheet);
          setChordSheetPath(path); // Store the path for delete operations
        } else {
          setError("Chord sheet not found in saved items");
        }
      } catch (err) {
        console.error("Error loading chord sheet:", err);
        setError("Failed to load chord sheet from storage");
      } finally {
        setIsLoading(false);
      }
    }
    loadChordSheet();
  }, [artist, song, navigationSong?.path]);

  const handleBack = () => {
    navigate("/my-chord-sheets");
  };

  const handleDelete = async () => {
    if (!chordSheet || !chordSheetPath) return;
    
    try {
      // Use pure database operation
      await deleteChordSheet(chordSheetPath);
      
      toast({
        title: "Chord sheet removed",
        description: `"${chordSheet.title}" has been removed from My Chord Sheets`,
      });
      
      navigate("/my-chord-sheets");
    } catch (error) {
      console.error('Failed to remove chord sheet:', error);
      toast({
        title: "Remove failed",
        description: `Failed to remove "${chordSheet.title}". Please try again.`,
        variant: "destructive"
      });
    }
  };  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <LoadingState message="Loading chord sheet..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !chordSheet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <ErrorState error={`Failed to load chord sheet: ${error || "Not found"}`} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <SongViewer
          song={{ song: navigationSong || { ...chordSheet, path: generateChordSheetId(chordSheet.artist, chordSheet.title) }, chordSheet }}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDelete}
          onUpdate={() => {}}
          hideDeleteButton={false}
          hideSaveButton={true}
          isFromMyChordSheets={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
