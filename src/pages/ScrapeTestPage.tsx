import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChordDisplay from '@/components/ChordDisplay';
import SongChordDetails from '@/components/SongChordDetails';
import { storeChordUrl } from '@/utils/session-storage-utils';
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample URLs for testing
const TEST_URLS = [
  { label: 'Select an example...', value: '' },
  { label: 'Legião Urbana - Tempo Perdido', value: 'https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/' },
  { label: 'Metallica - Nothing Else Matters', value: 'https://www.cifraclub.com.br/metallica/nothing-else-matters/' },
  { label: 'Eric Clapton - Tears in Heaven', value: 'https://www.cifraclub.com.br/eric-clapton/tears-in-heaven/' },
  { label: 'John Mayer - Gravity', value: 'https://www.cifraclub.com.br/john-mayer/gravity/' },
];

const ScrapeTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chordData, setChordData] = useState<{
    content: string;
    capo: string;
    tuning: string;
    key: string;
    artist: string;
    song: string;
  } | null>(null);

  const handleScrape = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive"
      });
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.content) {
        throw new Error('No chord sheet content found');
      }
      
      setChordData(data);
      
      toast({
        title: "Success!",
        description: "Chord sheet successfully scraped",
        variant: "default"
      });
      
      // Store URL in session storage for potential navigation
      if (data.artist && data.song) {
        const artistSlug = data.artist.toLowerCase().replace(/\s+/g, '-');
        const songSlug = data.song.toLowerCase().replace(/\s+/g, '-');
        storeChordUrl(artistSlug, songSlug, url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chord sheet');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to load chord sheet',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Chord Scraper Test</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter a Cifra Club URL below to test the chord sheet scraper.
            <br />
            Example format: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs">https://www.cifraclub.com.br/artist-name/song-name/</code>
          </p>
          
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-col md:flex-row gap-2">
              <Input 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="Enter Cifra Club URL (e.g., https://www.cifraclub.com.br/artist/song/)"
                className="flex-1"
              />
              <Button 
                onClick={handleScrape} 
                disabled={loading} 
                className="w-full md:w-auto"
              >
                {loading ? 'Loading...' : 'Scrape Chords'}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Try an example:</span>
              <Select
                onValueChange={(value) => value && setUrl(value)}
                value=""
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select an example" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_URLS.slice(1).map((item, index) => (
                    <SelectItem key={index} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
              Error: {error}
            </div>
          )}
          
          {chordData && (
            <div className="border p-4 rounded-md shadow-sm animate-fade-in">
              <h3 className="text-lg font-semibold mb-2">
                {chordData.artist} - {chordData.song}
              </h3>
              
              {chordData.artist && chordData.song && (
                <div className="mb-4 flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => {
                      const artistSlug = chordData.artist.toLowerCase().replace(/\s+/g, '-');
                      const songSlug = chordData.song.toLowerCase().replace(/\s+/g, '-');
                      window.location.href = `/chord/${artistSlug}/${songSlug}`;
                    }}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    View with Clean URL
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const artistSlug = chordData.artist.toLowerCase().replace(/\s+/g, '-');
                      const songSlug = chordData.song.toLowerCase().replace(/\s+/g, '-');
                      
                      // Create a song object
                      const song = {
                        id: `song-${Date.now()}`,
                        title: chordData.song,
                        artist: chordData.artist,
                        path: chordData.content,
                        key: chordData.key,
                        tuning: chordData.tuning,
                        capo: chordData.capo,
                      };
                      
                      // Get current songs from localStorage using unified storage
                      const storageKey = 'chordium-user-saved-songs';
                      const existingSongs = JSON.parse(localStorage.getItem(storageKey) || '[]');
                      
                      // Add new song to the beginning
                      const updatedSongs = [song, ...existingSongs];
                      
                      // Save back to localStorage
                      localStorage.setItem(storageKey, JSON.stringify(updatedSongs));
                      
                      toast({
                        title: "Success!",
                        description: `${chordData.song} added to My Chord Sheets`,
                        variant: "default"
                      });
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Add to My Chord Sheets
                  </Button>
                </div>
              )}
              
              <SongChordDetails 
                songKey={chordData.key}
                tuning={chordData.tuning}
                capo={chordData.capo}
              />
              
              <div className="mt-4">
                <ChordDisplay 
                  title={chordData.song}
                  artist={chordData.artist}
                  content={chordData.content}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScrapeTestPage;
