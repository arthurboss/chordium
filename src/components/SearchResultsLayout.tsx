import React from 'react';
import { SearchResultItem } from "@/utils/search-result-item";
import { SongData } from "@/types/song";
import ArtistResults from "@/components/ArtistResults";
import GroupedSongResults from "@/components/GroupedSongResults";
import BlinkingArrow from "@/components/ui/BlinkingArrow";
import { Artist } from '@/types/artist';

interface SearchResultsLayoutProps {
  artists: Artist[];
  songs: SearchResultItem[];
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
  onArtistSelect?: (artist: Artist) => void;
}

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  artists,
  songs,
  onView,
  onDelete,
  onArtistSelect
}) => {
  const hasArtists = artists && artists.length > 0;
  const hasSongs = songs && songs.length > 0;
  
  // Handle empty results
  if (!hasArtists && !hasSongs) {
    return (
      <div className="p-8 text-center text-gray-500">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <>
      {/* Mobile layout */}
      <div className="flex flex-col gap-8 w-full md:hidden">
        {hasArtists && (
          <div className="w-full">
            <h2 className="text-lg font-medium mb-2">Artist Results</h2>
            <div className="relative overflow-x-auto pb-2">
              <ArtistResults artists={artists} horizontal onArtistSelect={onArtistSelect} />
              {artists.length > 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <BlinkingArrow direction="right" />
                </div>
              )}
            </div>
          </div>
        )}
        
        {hasSongs && (
          <div className="w-full">
            <h2 className="text-lg font-medium mb-2">Songs by Artist</h2>
            <GroupedSongResults songs={songs} onView={onView} onDelete={onDelete} />
          </div>
        )}
      </div>
      
      {/* Desktop layout */}
      <div className="hidden md:flex flex-col gap-8 w-full">
        {hasArtists && (
          <div>
            <h2 className="text-lg font-medium mb-2 text-center">Artist Results</h2>
            <ArtistResults artists={artists} onArtistSelect={onArtistSelect} />
          </div>
        )}
        
        {hasSongs && (
          <div>
            <h2 className="text-lg font-medium mb-2">Songs by Artist</h2>
            <GroupedSongResults songs={songs} onView={onView} onDelete={onDelete} />
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResultsLayout;
