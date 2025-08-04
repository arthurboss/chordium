import React from 'react';
import { Song } from "@/types/song";
import ArtistResults from "@/components/ArtistResults";
import SongItem from "@/components/SongItem";
import { Artist } from '@/types/artist';
import SearchResultsSection from "@/components/SearchResultsSection";

interface SearchResultsLayoutProps {
  results: (Artist | Song)[];
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  onArtistSelect?: (artist: Artist) => void;
  hasSearched?: boolean;
}

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  results,
  onView,
  onDelete,
  onArtistSelect,
  hasSearched = false
}) => {
  // Separate artists and songs from unified results
  const artists = results.filter((item): item is Artist => 'displayName' in item);
  const songs = results.filter((item): item is Song => 'title' in item);
  
  const hasArtists = artists && artists.length > 0;
  const hasSongs = songs && songs.length > 0;
  // Handle empty results
  if (!hasArtists && !hasSongs && hasSearched) {
    return (
      <div className="p-8 text-center text-gray-500" data-cy="search-no-chord-sheets-found">
        No Chord Sheets were found.
      </div>
    );
  }
  // If there are no artists or songs and the user hasn't searched yet, render nothing.
  if (!hasArtists && !hasSongs && !hasSearched) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {hasArtists && (
        <SearchResultsSection title="Artist Results">
          <ArtistResults artists={artists} onArtistSelect={onArtistSelect} />
        </SearchResultsSection>
      )}
      
      {hasSongs && (
        <SearchResultsSection title="Songs">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {songs.map((song, index) => (
              <SongItem 
                key={`${song.path}-${index}`}
                item={song} 
                onView={onView} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        </SearchResultsSection>
      )}
    </div>
  );
};

export default SearchResultsLayout;
