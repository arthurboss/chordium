import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music, Info, Save, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  songTuning?: string;
  guitarTuning?: string;
  content: string;
  dateAdded: string;
}

const sampleSongs = [
  {
    id: "wonderwall",
    title: "Wonderwall",
    artist: "Oasis",
    content: `[Intro]
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4
Em7  G  Dsus4  A7sus4

[Verse 1]
Em7             G
Today is gonna be the day
              Dsus4                  A7sus4
That they're gonna throw it back to you
Em7               G
By now you should've somehow
              Dsus4            A7sus4
Realized what you gotta do
Em7                   G
I don't believe that anybody
       Dsus4       A7sus4          Em7  G  Dsus4  A7sus4
Feels the way I do about you now

[Verse 2]
Em7            G
Backbeat, the word is on the street
              Dsus4                 A7sus4
That the fire in your heart is out
Em7              G
I'm sure you've heard it all before
                 Dsus4             A7sus4
But you never really had a doubt
Em7                   G
I don't believe that anybody
       Dsus4       A7sus4          Em7
Feels the way I do about you now

[Pre-Chorus]
    C                D                Em
And all the roads we have to walk are winding
    C                   D                 Em
And all the lights that lead us there are blinding
C              D
There are many things that I would
G       D/F#  Em7
Like to say to you
      G        D
But I don't know how

[Chorus]
          C    Em7  G
Because maybe
                Em7        C        Em7  G
You're gonna be the one that saves me
    Em7  C  Em7  G
And after all
                Em7  C  Em7  G  Em7  G  Dsus4  A7sus4
You're my wonderwall`
  },
  {
    id: "hotel-california",
    title: "Hotel California",
    artist: "Eagles",
    content: `[Intro]
Bm  F#  A  E  G  D  Em  F#

[Verse 1]
Bm                        F#
On a dark desert highway, cool wind in my hair
A                               E
Warm smell of colitas, rising up through the air
G                         D
Up ahead in the distance, I saw a shimmering light
Em                                         F#
My head grew heavy and my sight grew dim, I had to stop for the night

[Verse 2]
Bm                            F#
There she stood in the doorway, I heard the mission bell
A                                           E
And I was thinking to myself, "This could be Heaven or this could be Hell"
G                              D
Then she lit up a candle and she showed me the way
Em                                       F#
There were voices down the corridor, I thought I heard them say

[Chorus]
G                         D
Welcome to the Hotel California
      F#                         Bm
Such a lovely place (Such a lovely place)
              G                   D
Such a lovely face  (such a lovely face)
G                               D
Plenty of room at the Hotel California
    Em                          F#
Any time of year (Any time of year)
              Bm      F#  A  E  G  D  Em  F#
You can find it here`
  },
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [uploadedArtist, setUploadedArtist] = useState("");
  const [uploadedSongTuning, setUploadedSongTuning] = useState("");
  const [uploadedGuitarTuning, setUploadedGuitarTuning] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [demoSong, setDemoSong] = useState<SongData | null>(null);
  const [mySongs, setMySongs] = useState<SongData[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  
  // Load songs from localStorage on mount
  useEffect(() => {
    try {
      const savedSongs = localStorage.getItem("mySongs");
      const savedVersion = localStorage.getItem("mySongsVersion");
      
      if (savedSongs) {
        // Version 1 is the current storage format
        if (savedVersion === "1") {
          setMySongs(JSON.parse(savedSongs));
        } else {
          // Handle older versions or initialize new storage
          setMySongs([]);
          localStorage.setItem("mySongsVersion", "1");
        }
      }
    } catch (e) {
      console.error("Error loading saved songs:", e);
      toast({
        title: "Error loading songs",
        description: "There was a problem loading your saved songs.",
        variant: "destructive"
      });
    }
  }, []);
  
  // Save songs to localStorage whenever they change
  useEffect(() => {
    try {
      const songsJson = JSON.stringify(mySongs);
      localStorage.setItem("mySongs", songsJson);
      localStorage.setItem("mySongsVersion", "1");
    } catch (e) {
      // Handle storage quota exceeded or other errors
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        toast({
          title: "Storage limit reached",
          description: "Unable to save more songs. Please delete some songs to free up space.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error saving songs",
          description: "There was a problem saving your changes.",
          variant: "destructive"
        });
      }
      console.error("Error saving songs:", e);
    }
  }, [mySongs]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const songId = query.get("song");
    
    if (songId) {
      const foundDemo = sampleSongs.find(song => song.id === songId);
      if (foundDemo) {
        setDemoSong({
          ...foundDemo,
          dateAdded: new Date().toISOString()
        });
        setActiveTab("demo");
        return;
      }
      
      const foundMySong = mySongs.find(song => song.id === songId);
      if (foundMySong) {
        setSelectedSong(foundMySong);
        setActiveTab("my-songs");
        return;
      }
    } 
    
    if (query.get("q")) {
      setActiveTab("search");
    } else if (location.pathname === "/upload") {
      setActiveTab("upload");
    }
  }, [location, mySongs]);

  useEffect(() => {
    if (selectedSong || demoSong || uploadedContent) {
      // Wait for the next frame to ensure the DOM is updated
      requestAnimationFrame(() => {
        if (chordDisplayRef.current) {
          const headerHeight = 72;
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
    
    // Clear upload states when switching to a different tab
    if (value !== "upload") {
      setUploadedContent("");
      setUploadedTitle("");
      setUploadedArtist("");
      setUploadedSongTuning("");
      setUploadedGuitarTuning("");
      setIsEditingMetadata(false);
    }
    
    if (value === "upload") {
      navigate("/upload");
    } else if (value === "demo" && demoSong) {
      navigate(`/?song=${demoSong.id}`);
    } else if (value === "my-songs") {
      navigate("/my-songs");
    } else {
      navigate("/");
    }
  };
  
  const handleFileUpload = (content: string, fileName: string) => {
    setUploadedContent(content);
    
    let extractedTitle = "";
    let extractedArtist = "";
    let extractedSongTuning = "";
    let extractedGuitarTuning = "";
    
    // Check for metadata in the content first (our PDF extractor adds these)
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.match(/^\[title\](.+)\[\/title\]$/i));
    const artistLine = lines.find(line => line.match(/^\[artist\](.+)\[\/artist\]$/i));
    const songTuningLine = lines.find(line => line.match(/^\[songtuning\](.+)\[\/songtuning\]$/i));
    const guitarTuningLine = lines.find(line => line.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i));
    
    if (titleLine) {
      const titleMatch = titleLine.match(/^\[title\](.+)\[\/title\]$/i);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].trim();
        console.log('Found title in content metadata:', extractedTitle);
      }
    }
    
    if (artistLine) {
      const artistMatch = artistLine.match(/^\[artist\](.+)\[\/artist\]$/i);
      if (artistMatch && artistMatch[1]) {
        extractedArtist = artistMatch[1].trim();
        console.log('Found artist in content metadata:', extractedArtist);
      }
    }

    if (songTuningLine) {
      const songTuningMatch = songTuningLine.match(/^\[songtuning\](.+)\[\/songtuning\]$/i);
      if (songTuningMatch && songTuningMatch[1]) {
        extractedSongTuning = songTuningMatch[1].trim();
        console.log('Found song tuning in content metadata:', extractedSongTuning);
      }
    }

    if (guitarTuningLine) {
      const guitarTuningMatch = guitarTuningLine.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i);
      if (guitarTuningMatch && guitarTuningMatch[1]) {
        extractedGuitarTuning = guitarTuningMatch[1].trim();
        console.log('Found guitar tuning in content metadata:', extractedGuitarTuning);
      }
    }
    
    // If metadata wasn't found, try to extract from filename (Cifra Club - Artist - Title format)
    if ((!extractedTitle || !extractedArtist) && fileName) {
      const fileNameWithoutExt = fileName.replace(/\.(pdf|PDF|txt|TXT|text|TEXT)$/, '')
                                       .replace(/\s*\(\d+\)$/, '');
      const parts = fileNameWithoutExt.split(" - ");
      
      if (parts.length >= 3 && parts[0].toLowerCase().includes('cifra club')) {
        // Filename has Cifra Club - Artist - Title format
        if (!extractedArtist) {
          extractedArtist = parts[1].trim();
          console.log('Extracted artist from filename:', extractedArtist);
        }
        if (!extractedTitle) {
          extractedTitle = parts[2].trim();
          console.log('Extracted title from filename:', extractedTitle);
        }
      } else if (parts.length >= 2) {
        // Filename has Artist - Title format
        if (!extractedArtist) {
          extractedArtist = parts[0].trim();
          console.log('Extracted artist from filename:', extractedArtist);
        }
        if (!extractedTitle) {
          extractedTitle = parts[1].trim();
          console.log('Extracted title from filename:', extractedTitle);
        }
      } else if (!extractedTitle) {
        // Just use filename as title if we don't have one yet
        extractedTitle = fileNameWithoutExt;
        console.log('Using filename as title:', extractedTitle);
      }
    }

    // Try to extract tuning information from content before [intro]
    if (!extractedSongTuning || !extractedGuitarTuning) {
      // Find the first line containing "intro" in any case
      const introIndex = lines.findIndex(line => line.toLowerCase().includes('intro'));
      if (introIndex > 0) {
        const preIntroLines = lines.slice(0, introIndex);
        
        // Look for tuning patterns in a more generic way
        for (const line of preIntroLines) {
          // Check for song tuning (Tom)
          if (!extractedSongTuning) {
            // Look for the first line containing "Tom" and extract everything after the colon/equals
            if (line.toLowerCase().includes('tom')) {
              const afterColon = line.split(/[:=]/)[1]?.trim();
              if (afterColon) {
                extractedSongTuning = afterColon;
                console.log('Found song tuning in content:', extractedSongTuning);
              }
            }
          }
          
          // Check for guitar tuning
          if (!extractedGuitarTuning) {
            // Look for lines containing 6 notes separated by spaces
            const tuningMatch = line.match(/((?:[A-G][#b]?\s+){5}[A-G][#b]?)/i);
            if (tuningMatch) {
              extractedGuitarTuning = tuningMatch[1].trim();
              console.log('Found guitar tuning in content:', extractedGuitarTuning);
            }
          }
        }
      }
    }
    
    // Remove the metadata lines and pre-intro content from the content if they were added by our PDF extractor
    if (titleLine || artistLine || songTuningLine || guitarTuningLine) {
      const filteredLines = lines.filter(line => 
        !line.match(/^\[title\](.+)\[\/title\]$/i) && 
        !line.match(/^\[artist\](.+)\[\/artist\]$/i) &&
        !line.match(/^\[songtuning\](.+)\[\/songtuning\]$/i) &&
        !line.match(/^\[guitartuning\](.+)\[\/guitartuning\]$/i));
      
      // Remove any empty lines at the beginning
      while (filteredLines.length > 0 && filteredLines[0].trim() === '') {
        filteredLines.shift();
      }
      
      // Find the first line containing "intro" in any case
      const introIndex = filteredLines.findIndex(line => line.toLowerCase().includes('intro'));
      if (introIndex > 0) {
        // Keep the intro line itself
        const introLine = filteredLines[introIndex];
        filteredLines.splice(0, introIndex);
        // Add back the intro line with proper formatting
        filteredLines.unshift('[intro]');
      }
      
      // Update the content without the metadata lines and pre-intro content
      const filteredContent = filteredLines.join('\n');
      setUploadedContent(filteredContent);
    }
    
    setUploadedTitle(extractedTitle || "Untitled Song");
    setUploadedArtist(extractedArtist || "");
    setUploadedSongTuning(extractedSongTuning);
    setUploadedGuitarTuning(extractedGuitarTuning);
  };
  
  const handleSaveUploadedSong = (content?: string, title?: string, artist?: string, songTuning?: string, guitarTuning?: string) => {
    // Use the provided content or fall back to the state value
    const songContent = content || uploadedContent;
    
    if (!songContent.trim()) {
      toast({
        title: "Error",
        description: "No content to save",
        variant: "destructive"
      });
      return;
    }
    
    // Use the provided title/artist or fall back to the state values
    const songTitle = title || uploadedTitle || "Untitled Song";
    const songArtist = artist || uploadedArtist || "";
    const songTuningValue = songTuning || uploadedSongTuning || "";
    const guitarTuningValue = guitarTuning || uploadedGuitarTuning || "";
    
    const newSong: SongData = {
      id: `song-${Date.now()}`,
      title: songTitle,
      artist: songArtist,
      songTuning: songTuningValue,
      guitarTuning: guitarTuningValue,
      content: songContent,
      dateAdded: new Date().toISOString()
    };
    
    // Update all states synchronously
    setMySongs(prev => [newSong, ...prev]);
    setSelectedSong(newSong);
    setActiveTab("my-songs");
    setUploadedContent("");
    setUploadedTitle("");
    setUploadedArtist("");
    setUploadedSongTuning("");
    setUploadedGuitarTuning("");
    setIsEditingMetadata(false);
    
    // Navigate after state updates
    navigate(`/my-songs?song=${newSong.id}`);
    
    toast({
      title: "Song saved",
      description: `"${songTitle}" has been added to My Songs`
    });
  };
  
  const handleUpdateSong = (content: string) => {
    if (!selectedSong) return;
    
    const updatedSongs = mySongs.map(song => {
      if (song.id === selectedSong.id) {
        return { ...song, content };
      }
      return song;
    });
    
    setMySongs(updatedSongs);
    setSelectedSong({ ...selectedSong, content });
    
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-3 py-4 sm:px-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Chordium</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Find and display guitar chords for your favorite songs
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
            <TabsTrigger value="search" className="text-xs sm:text-sm">Search</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">Upload</TabsTrigger>
            <TabsTrigger value="my-songs" className="text-xs sm:text-sm">My Songs</TabsTrigger>
            <TabsTrigger value="demo" className="text-xs sm:text-sm">Demo</TabsTrigger>
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
                    {!isEditingMetadata ? (
                      <div className="w-full max-w-3xl mx-auto">
                        <Card className="mb-6">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="song-title-input">Song Title *</Label>
                                    <Input 
                                      id="song-title-input" 
                                      value={uploadedTitle} 
                                      onChange={(e) => setUploadedTitle(e.target.value)} 
                                      placeholder="Enter song title"
                                      className="w-full h-10"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="song-artist-input">Artist *</Label>
                                    <Input 
                                      id="song-artist-input" 
                                      value={uploadedArtist} 
                                      onChange={(e) => setUploadedArtist(e.target.value)} 
                                      placeholder="Enter artist name"
                                      className="w-full h-10"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="song-tuning-input">Song Tuning</Label>
                                    <Input 
                                      id="song-tuning-input" 
                                      value={uploadedSongTuning} 
                                      onChange={(e) => setUploadedSongTuning(e.target.value)} 
                                      placeholder="e.g. C# minor"
                                      className="w-full h-10"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="guitar-tuning-input">Guitar Tuning</Label>
                                    <Input 
                                      id="guitar-tuning-input" 
                                      value={uploadedGuitarTuning} 
                                      onChange={(e) => setUploadedGuitarTuning(e.target.value)} 
                                      placeholder="e.g. Standard tuning"
                                      className="w-full h-10"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end items-end">
                                <Button 
                                  onClick={() => setIsEditingMetadata(true)}
                                  className="w-12 h-10 shrink-0"
                                  aria-label="Continue to edit"
                                  disabled={!uploadedTitle || !uploadedArtist}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <ChordDisplay 
                        ref={chordDisplayRef}
                        title={uploadedTitle} 
                        artist={uploadedArtist} 
                        songTuning={uploadedSongTuning}
                        guitarTuning={uploadedGuitarTuning}
                        content={uploadedContent} 
                        enableEdit={true}
                        onSave={handleSaveUploadedSong}
                        onReturn={() => setIsEditingMetadata(false)}
                      />
                    )}
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
                    >
                      Back to My Songs
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSong(selectedSong.id)}
                    >
                      Delete Song
                    </Button>
                  </div>
                  <div className="mt-6">
                    <ChordDisplay 
                      ref={chordDisplayRef}
                      title={selectedSong.title} 
                      artist={selectedSong.artist} 
                      songTuning={selectedSong.songTuning}
                      guitarTuning={selectedSong.guitarTuning}
                      content={selectedSong.content}
                      onSave={handleUpdateSong}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {mySongs.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {mySongs.map(song => (
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
                            >
                              View Chords
                            </button>
                            <button 
                              className="text-destructive hover:underline text-sm"
                              onClick={() => handleDeleteSong(song.id)}
                            >
                              Delete
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
                      >
                        Upload a chord sheet
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="demo" className="focus-visible:outline-none focus-visible:ring-0">
              {demoSong ? (
                <div className="animate-fade-in">
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDemoSong(null);
                        navigate("/");
                      }}
                    >
                      Back to Demo Songs
                    </Button>
                  </div>
                  <ChordDisplay 
                    ref={chordDisplayRef}
                    title={demoSong.title} 
                    artist={demoSong.artist} 
                    songTuning={demoSong.songTuning}
                    guitarTuning={demoSong.guitarTuning}
                    content={demoSong.content} 
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {sampleSongs.map(song => (
                    <Card key={song.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Music className="h-6 w-6 text-chord mt-1" />
                          <div>
                            <h3 className="font-semibold text-base">{song.title}</h3>
                            <p className="text-muted-foreground text-sm">{song.artist}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
                        <button 
                          className="text-chord hover:underline font-medium text-sm"
                          onClick={() => {
                            setDemoSong({
                              ...song,
                              dateAdded: new Date().toISOString()
                            });
                            navigate(`/?song=${song.id}`);
                          }}
                        >
                          View Chords
                        </button>
                        <button 
                          className="text-primary hover:underline text-sm"
                          onClick={() => {
                            const newSong = {
                              ...song,
                              id: `mysong-${Date.now()}`,
                              dateAdded: new Date().toISOString()
                            };
                            setMySongs(prev => [newSong, ...prev]);
                            toast({
                              title: "Song saved",
                              description: `"${song.title}" has been added to My Songs`
                            });
                          }}
                        >
                          Save
                        </button>
                      </CardFooter>
                    </Card>
                  ))}
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
