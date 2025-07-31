import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import SearchLoadingState from "@/components/SearchResults/SearchLoadingState";
import ErrorState from "@/components/ErrorState";
import NavigationCard from "@/components/NavigationCard";
import { deleteChordSheet, getChordSheet } from "@/storage/stores/chord-sheets/operations";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import { toast } from "@/hooks/use-toast";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
import type { Song, ChordSheet } from "@chordium/types";

const ChordViewer = () => {
  const { artist, song } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  
  // State for chord sheet data
  const [chordSheet, setChordSheet] = useState<ChordSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Song object from navigation state (if passed from search results)
  const navigationSong = location.state?.song as Song | undefined;

  // Generate path for chord sheet lookup
  const path = navigationSong?.path || (artist && song ? generateChordSheetId(artist, song) : undefined);

  // Load chord sheet data
  useEffect(() => {
    if (!path) {
      setError("No path provided for chord sheet");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadChordSheet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedChordSheet = await getChordSheet(path);
        
        if (cancelled) return;
        
        if (storedChordSheet?.storage?.saved) {
          const domainChordSheet = storedToChordSheet(storedChordSheet);
          setChordSheet(domainChordSheet);
        } else {
          setChordSheet(null);
          setError("Chord sheet not found");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading chord sheet:", err);
          setError("Failed to load chord sheet");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadChordSheet();

    return () => {
      cancelled = true;
    };
  }, [path]);

  const handleBack = () => {
    navigate("/my-chord-sheets");
  };

  const handleDelete = async () => {
    if (!chordSheet || !path) return;
    
    try {
      await deleteChordSheet(path);
      
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
  };

  if (!path) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <NavigationCard onBack={handleBack} />
          <ErrorState error="Invalid song path" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <SearchLoadingState />
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
          <NavigationCard onBack={handleBack} />
          <ErrorState error={error || "Chord sheet not found in saved items"} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <NavigationCard 
          onBack={handleBack}
          onDelete={handleDelete}
          showDeleteButton={true}
        />
        <SongViewer
          song={{ 
            song: navigationSong || { 
              ...chordSheet, 
              path: generateChordSheetId(chordSheet.artist, chordSheet.title) 
            }, 
            chordSheet 
          }}
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
