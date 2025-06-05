import React from 'react';
import { SearchResultItem } from "@/utils/search-result-item";
import { Song } from "@/types/song";
import ArtistResults from "@/components/ArtistResults";
import GroupedSongResults from "@/components/GroupedSongResults";
import { Artist } from '@/types/artist';
import SearchResultsSection from "@/components/SearchResultsSection";

interface SearchResultsLayoutProps {
  artists: Artist[];
  songs: SearchResultItem[];
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  onArtistSelect?: (artist: Artist) => void;
}

const SearchResultsLayout: React.FC<SearchResultsLayoutProps> = ({
  artists,
  songs = [],
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
    <div className="flex flex-col gap-8 w-full">
      {hasArtists && (
        <SearchResultsSection title="Artist Results">
          <ArtistResults artists={artists} onArtistSelect={onArtistSelect} />
        </SearchResultsSection>
      )}
      
      {hasSongs && (
        <SearchResultsSection title="Songs by Artist">
          <GroupedSongResults songs={songs} onView={onView} onDelete={onDelete} />
        </SearchResultsSection>
      )}
    </div>
  );
};

export default SearchResultsLayout;
