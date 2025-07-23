import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Song } from "@chordium/types";
import { formatSearchResult } from "@/search/utils";

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
        onView={(path) => onView(song)} // ResultCard passes path, but we still call onView with song
        onDelete={() => onDelete(song.path)}
        path={song.path}
        deleteButtonIcon="plus"
        deleteButtonLabel={`Add ${song.title}`}
        viewButtonIcon="view"
        viewButtonLabel="View Chords"
        isDeletable={true}
        compact={true}
        song={song} // Pass the song object for enhanced navigation
      />
    </div>
  );
};

export default React.memo(SongItem);
