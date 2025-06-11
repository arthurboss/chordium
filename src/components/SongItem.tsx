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
  const song = formatSearchResult(item);

  return (
    <div style={style}>
      <ResultCard
        icon="music"
        title={song.title}
        subtitle={song.artist}
        onView={() => onView(song)}
        onDelete={() => onDelete(song.path)}
        path={song.path}
        deleteButtonIcon="plus"
        deleteButtonLabel={`Add ${song.title}`}
        viewButtonIcon="view"
        viewButtonLabel="View Chords"
        isDeletable={true}
        compact={true}
      />
    </div>
  );
};

export default React.memo(SongItem);
