import React, { useMemo } from "react";
import { ListChildComponentProps } from "react-window";
import { SearchResultItem } from "@/utils/search-result-item";
import { Song } from "@/types/song";
import { groupSongsByArtist, GroupedSongs } from "@/utils/search-grouping";
import ArtistGroup from "@/components/ArtistGroup";
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";

interface GroupedSongResultsProps {
  songs: SearchResultItem[];
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
}

// Calculate a dynamic height based on the number of songs in each group
const calculateGroupHeight = (group: GroupedSongs): number => {
  const BASE_HEIGHT = 80; // Header + padding
  const SONG_HEIGHT = 120; // Height per song
  const MAX_VISIBLE_SONGS = 5; // Max number of songs to show without scrolling
  
  // For virtualized groups, we show a fixed height container
  if (group.songs.length > 10) {
    return BASE_HEIGHT + (SONG_HEIGHT * Math.min(MAX_VISIBLE_SONGS, 3));
  }
  
  // For smaller groups, show all songs
  return BASE_HEIGHT + (SONG_HEIGHT * Math.min(group.songs.length, MAX_VISIBLE_SONGS));
};

const GroupedSongResults: React.FC<GroupedSongResultsProps> = ({ songs, onView, onDelete }) => {
  const groups = useMemo(() => groupSongsByArtist(songs), [songs]);
  if (groups.length === 0) return null;

  // For a single artist group, just render it (no virtualization needed)
  if (groups.length === 1) {
    return (
      <div className="p-1">
        <ArtistGroup
          artist={groups[0].artist}
          songs={groups[0].songs}
          onView={onView}
          onDelete={onDelete}
          virtualized={groups[0].songs.length >= 10}
        />
      </div>
    );
  }
  
  // Virtualize artist groups when there are multiple artists
  return (
    <VirtualizedListWithArrow
      items={groups}
      itemHeight={300}
      renderItem={({ index, style, item }: ListChildComponentProps & { item: GroupedSongs }) => (
        <div style={style} key={item.artist}>
          <ArtistGroup
            artist={item.artist}
            songs={item.songs}
            onView={onView}
            onDelete={onDelete}
            virtualized={true}
          />
        </div>
      )}
      showArrow={true}
    />
  );
};

export default GroupedSongResults;
