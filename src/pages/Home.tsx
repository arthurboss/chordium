
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ChordDisplay from "@/components/ChordDisplay";
import FileUploader from "@/components/FileUploader";
import Footer from "@/components/Footer";

interface SampleSong {
  id: string;
  title: string;
  artist: string;
  content: string;
}

// Sample songs for demo purposes
const sampleSongs: SampleSong[] = [
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
  const [activeTab, setActiveTab] = useState("search");
  const [demoSong, setDemoSong] = useState<SampleSong | null>(null);

  // Check for query parameters on mount
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const songId = query.get("song");
    
    if (songId) {
      const found = sampleSongs.find(song => song.id === songId);
      if (found) {
        setDemoSong(found);
        setActiveTab("demo");
      }
    } else if (query.get("q")) {
      setActiveTab("search");
    } else if (location.pathname === "/upload") {
      setActiveTab("upload");
    }
  }, [location]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL when changing tabs
    if (value === "upload") {
      navigate("/upload");
    } else if (value === "demo" && demoSong) {
      navigate(`/?song=${demoSong.id}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-3 py-4 sm:px-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">ChordFlow</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Find and display guitar chords for your favorite songs
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="search" className="text-xs sm:text-sm">Search</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">Upload File</TabsTrigger>
            <TabsTrigger value="demo" className="text-xs sm:text-sm">Demo Songs</TabsTrigger>
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
                <FileUploader onFileContent={setUploadedContent} />
                
                {uploadedContent && (
                  <div className="mt-6 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-3 text-center">Uploaded Chord Sheet</h2>
                    <ChordDisplay content={uploadedContent} />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="demo" className="focus-visible:outline-none focus-visible:ring-0">
              {demoSong ? (
                <div className="animate-fade-in">
                  <ChordDisplay 
                    title={demoSong.title} 
                    artist={demoSong.artist} 
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
                      <CardFooter className="bg-muted/50 px-4 py-2">
                        <button 
                          className="text-chord hover:underline font-medium text-sm"
                          onClick={() => {
                            setDemoSong(song);
                            navigate(`/?song=${song.id}`);
                          }}
                        >
                          View Chords
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
