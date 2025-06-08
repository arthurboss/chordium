import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Song } from "@/types/song";
import { formatSearchResult } from "@/utils/format-search-result";

interface SongItemProps {
  item: Song;
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  style?: React.CSSProperties;
}

const SongItem: React.FC<SongItemProps> = ({ item, onView, onDelete, style }) => {
  // Process the song item to ensure consistent format
  const songData = formatSearchResult(item);
  
  return (
    <div style={style}>
      <ResultCard
        icon="music"
        title={songData.title}
        subtitle={songData.artist}
        onView={() => onView(songData)}
        onDelete={() => onDelete(songData.path)}
        idOrUrl={songData.path}
        deleteButtonIcon="plus"
        deleteButtonLabel={`Add ${songData.title}`}
        viewButtonIcon="view"
        viewButtonLabel="View Chords"
        isDeletable={true}
        compact={true}
      />
    </div>
  );
};

export default React.memo(SongItem);
