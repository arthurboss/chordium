import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Music, Info, Save, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ChordDisplay from "@/components/ChordDisplay";
import FileUploader from "@/components/FileUploader";
import Footer from "@/components/Footer";

interface SongData {
  id: string;
  title: string;
  artist?: string;
  path: string;
  dateAdded: string;
}

const sampleSong1Content = await fetch("/src/data/songs/wonderwall.txt").then(res =>
  res.text()
);
const sampleSong2Content = await fetch(
  "/src/data/songs/hotel-california.txt"
).then((res) => res.text());

const sampleSongs: Omit<SongData, "dateAdded">[] = [
  {
    id: "wonderwall",
    title: "Wonderwall",
    artist: "Oasis",
    path: sampleSong1Content,
  },
  { id: "hotel-california", title: "Hotel California", artist: "Eagles", path: sampleSong2Content },
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [activeTab, setActiveTab] = useState("my-songs");
  const [demoSong, setDemoSong] = useState<SongData | null>(null);
  const [mySongs, setMySongs] = useState<SongData[]>([...sampleSongs.map(song => ({...song, dateAdded: new Date().toISOString()}))]);

  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const savedSongs = localStorage.getItem("mySongs");
    const initialSongs = [...sampleSongs.map(song => ({...song, dateAdded: new Date().toISOString()}))]

    if (savedSongs) { 
      try {
        const parsedSongs = JSON.parse(savedSongs);
        const hasDemoSongs = initialSongs.every(initialSong => parsedSongs.some((parsedSong:SongData) => parsedSong.id === initialSong.id))
        if (!hasDemoSongs) {
          localStorage.setItem("mySongs", JSON.stringify([...initialSongs,...parsedSongs]));
          setMySongs([...initialSongs, ...parsedSongs]);
        } else {
          setMySongs(parsedSongs);
        }
        
      } catch (e) {
        console.error("Error loading saved songs:", e);
        setMySongs(initialSongs);
        localStorage.setItem("mySongs", JSON.stringify(initialSongs))

      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("mySongs", JSON.stringify(mySongs));
  }, [mySongs]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const songId = query.get("song");
    
    if (songId) {
        const foundDemo = sampleSongs.find((song) => song.id === songId);
        if (foundDemo) {
            setDemoSong({
          ...foundDemo,
          dateAdded: new Date().toISOString(),
          
        } as SongData); 
            
        setActiveTab("my-songs");
        return;
      }
      
      const foundMySong = mySongs.find(song => song.id === songId);
      if (foundMySong) {
        setSelectedSong(foundMySong);
        setActiveTab("my-songs");
        return;
      }
    }
    
    // Set active tab based on URL path
    const path = location.pathname;
    if (path === "/search") {
      setActiveTab("search");
    } else if (path === "/upload") {
      setActiveTab("upload");
    } else if (path === "/my-songs" || path === "/") {
      setActiveTab("my-songs");
    }
    
    // Additional handling for query parameters
    if (query.get("q")) {
      setActiveTab("search");
    }
  }, [location, mySongs]);

  useEffect(() => {
    if (selectedSong || demoSong || uploadedContent) {
      // Wait for the next frame to ensure the DOM is updated
      requestAnimationFrame(() => {
        if (chordDisplayRef.current) {
          const headerHeight = 80; // Increased from 48 to 80 to account for full header + title/artist section
          const elementPosition = chordDisplayRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [selectedSong, demoSong, uploadedContent]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedSong(null);
    
    if (value === "upload") {
      navigate("/upload");
    } else if (value === "search") {
      navigate("/search");
    } else if (value === "my-songs") {
      navigate("/my-songs");
    } else {
      navigate("/my-songs");
    }
  };
  
  const handleSaveUploadedSong = () => {
    if (!uploadedContent.trim()) {
      toast({
        title: "Error",
        description: "No content to save",
        variant: "destructive"
      });
      return;
    }
    
    const songTitle = uploadedTitle || "Untitled Song";
    const newSong: SongData = {
      id: `song-${Date.now()}`,
      title: songTitle,
      path: uploadedContent,
      dateAdded: new Date().toISOString()
    };
    
    setMySongs(prev => [newSong, ...prev]);
    setUploadedContent("");
    setUploadedTitle("");
    
    toast({
      title: "Song saved",
      description: `"${songTitle}" has been added to My Songs`
    });
    
    setActiveTab("my-songs");
    navigate("/my-songs");
  };
  
  const handleUpdateSong = (content: string) => {
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
  
  const handleDeleteSong = (songId: string) => {
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
  
  const handleFileUpload = (content: string, fileName: string) => {
    setUploadedContent(content);
    
    if (fileName) {
      const title = fileName.replace(/\.[^/.]+$/, "");
      setUploadedTitle(title);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-3 py-4 sm:px-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full max-w-lg mx-auto grid-cols-[repeat(auto-fit,_minmax(0,_1fr))]`} role="tablist">
            <TabsTrigger 
              value="my-songs" 
              className="text-xs sm:text-sm" 
              tabIndex={0} 
              aria-selected={activeTab === "my-songs"}
            >
              My Songs
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="text-xs sm:text-sm" 
              tabIndex={0} 
              aria-selected={activeTab === "search"}
            >
              Search
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="text-xs sm:text-sm" 
              tabIndex={0} 
              aria-selected={activeTab === "upload"}
            >
              Upload
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 sm:mt-6">
            <TabsContent value="search" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-4">
                <SearchBar />
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This is a demo application. In a real implementation, this would search online sources for chord sheets.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-4">
                <FileUploader onFileContent={(content, fileName) => handleFileUpload(content, fileName)} />
                
                {uploadedContent && (
                  <div className="mt-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold">Uploaded Chord Sheet</h2>
                      <Button 
                        onClick={handleSaveUploadedSong}
                        size="sm"
                        className="flex items-center gap-1"
                        tabIndex={0}
                        aria-label="Save to My Songs"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save to My Songs</span>
                      </Button>
                    </div>
                    <ChordDisplay 
                      ref={chordDisplayRef}
                      title={uploadedTitle || undefined}
                      content={uploadedContent} 
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my-songs" className="focus-visible:outline-none focus-visible:ring-0">
              {selectedSong ? (
                <div className="animate-fade-in">
                  <div className="flex items-center mb-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSong(null)}
                      className="mr-2"
                      tabIndex={0}
                      aria-label="Back to My Songs"
                    >
                      Back to My Songs
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSong(selectedSong.id)}
                      tabIndex={0}
                      aria-label={`Delete ${selectedSong?.title || 'song'}`}
                    >
                      Delete Song
                    </Button>
                  </div>
                  <div className="mt-6">
                    <ChordDisplay 
                      ref={chordDisplayRef}
                      title={selectedSong.title} 
                      artist={selectedSong.artist} 
                      content={selectedSong.path}
                      onSave={handleUpdateSong}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {mySongs.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {[...mySongs].reverse().map(song => (
                        <Card key={song.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <Music className="h-6 w-6 text-chord mt-1" />
                              <div>
                                <h3 className="font-semibold text-base">{song.title}</h3>
                                {song.artist && (
                                  <p className="text-muted-foreground text-sm">{song.artist}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(song.dateAdded).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
                            <button 
                              className="text-chord hover:underline font-medium text-sm"
                              onClick={() => {
                                setSelectedSong(song);
                                navigate(`/my-songs?song=${song.id}`);
                              }}
                              tabIndex={0}
                              aria-label={`View chords for ${song.title}`}
                            >
                              View Chords
                            </button>
                            <button 
                              className="text-destructive dark:text-red-500 hover:underline text-sm"
                              onClick={() => handleDeleteSong(song.id)}
                              tabIndex={0}
                              aria-label={`Delete ${song.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-3">You haven't saved any songs yet.</p>
                      <Button 
                        onClick={() => handleTabChange("upload")}
                        variant="outline"
                        tabIndex={0}
                        aria-label="Upload a chord sheet"
                      >
                        Upload a chord sheet
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
