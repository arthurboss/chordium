import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Song } from "@/types/song";
import { SearchResultItem } from "@/utils/search-result-item";
import { formatSearchResult } from "@/utils/search-results-utils";
import { formatReadableName } from "@/utils/search-grouping";

interface SongItemProps {
  item: SearchResultItem;
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  style?: React.CSSProperties;
}

const SongItem: React.FC<SongItemProps> = ({ item, onView, onDelete, style }) => {
  // Extract title and artist from URL if not present
  const songData = formatSearchResult(item);
  let title = songData.title;
  let artist = songData.artist;
  if (!title && item.url) {
    // Song title is the last segment in the URL (after artist)
    const urlParts = item.url.replace(/\/$/, '').split('/');
    if (urlParts.length > 1) {
      title = formatReadableName(urlParts[urlParts.length - 1]);
    }
  }
  if (!artist && item.url) {
    // Artist is the first segment after domain
    const urlParts = item.url.replace(/^https?:\/\/(www\.)?[^/]+\//, '').split('/');
    if (urlParts.length > 0) {
      artist = formatReadableName(urlParts[0]);
    }
  }
  return (
    <div style={style}>
      <ResultCard
        icon="music"
        title={title}
        subtitle={artist}
        onView={() => onView(songData)}
        onDelete={() => onDelete(songData.id)}
        idOrUrl={songData.id}
        deleteButtonIcon="plus"
        deleteButtonLabel={`Add ${title}`}
        viewButtonIcon="view"
        viewButtonLabel="View Chords"
        isDeletable={true}
        compact={true}
      />
    </div>
  );
};

export default React.memo(SongItem);
