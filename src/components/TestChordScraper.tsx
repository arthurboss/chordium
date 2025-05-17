import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChordDisplay from '@/components/ChordDisplay';
import SongChordDetails from '@/components/SongChordDetails';
import { storeChordUrl } from '@/utils/session-storage-utils';

const TestChordScraper = () => {
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
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.content) {
        throw new Error('No chord sheet content found');
      }
      
      setChordData(data);
      
      // Example of how to navigate to the clean URL format
      if (data.artist && data.song) {
        const artistSlug = data.artist.toLowerCase().replace(/\s+/g, '-');
        const songSlug = data.song.toLowerCase().replace(/\s+/g, '-');
        
        // Add a "Go to Clean URL" button
        console.log(`Clean URL: /chord/${artistSlug}/${songSlug}`);
        storeChordUrl(artistSlug, songSlug, url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chord sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chord Scraper Test</h2>
      
      <div className="flex gap-2 mb-6">
        <Input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Enter Cifra Club URL (e.g., https://www.cifraclub.com.br/artist/song/)"
          className="flex-1"
        />
        <Button onClick={handleScrape} disabled={loading}>
          {loading ? 'Loading...' : 'Scrape Chords'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-800 rounded-md">
          Error: {error}
        </div>
      )}
      
      {chordData && (
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">
            {chordData.artist} - {chordData.song}
          </h3>
          
          {chordData.artist && chordData.song && (
            <div className="mb-4">
              <Button 
                onClick={() => {
                  const artistSlug = chordData.artist.toLowerCase().replace(/\s+/g, '-');
                  const songSlug = chordData.song.toLowerCase().replace(/\s+/g, '-');
                  // Store URL in session storage before navigating
                  storeChordUrl(artistSlug, songSlug, url);
                  window.location.href = `/chord/${artistSlug}/${songSlug}`;
                }}
              >
                Go to Clean URL (without query parameter)
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
  );
};

export default TestChordScraper;
