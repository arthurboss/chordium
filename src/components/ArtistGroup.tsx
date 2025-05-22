import React from "react";
import { SearchResultItem } from "@/utils/search-result-item";
import { SongData } from "@/types/song";
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import SongItem from "@/components/SongItem";
import { ListChildComponentProps } from "react-window";
import { CARD_HEIGHTS } from "@/constants/ui-constants";

interface ArtistGroupProps {
  artist: string;
  songs: SearchResultItem[];
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
  virtualized?: boolean;
}

const VIRTUALIZATION_THRESHOLD = 10; // Lower threshold for better performance

const ArtistGroup: React.FC<ArtistGroupProps> = ({ artist, songs, onView, onDelete, virtualized }) => {
  // Calculate a reasonable height for the song list
  const listHeight = Math.min(
    CARD_HEIGHTS.RESULT_CARD * 5, // Max 5 items tall
    CARD_HEIGHTS.RESULT_CARD * songs.length // Or actual height if less than 5 items
  );

  return (
    <div className="mb-8">
      <h3 className="text-md font-semibold mb-2 px-1">{artist}</h3>
      
      {virtualized && songs.length >= VIRTUALIZATION_THRESHOLD ? (
        <div style={{ height: listHeight, width: '100%' }}>
          <VirtualizedListWithArrow
            items={songs}
            itemHeight={CARD_HEIGHTS.RESULT_CARD}
            height={listHeight}
            renderItem={({ index, style, item }: ListChildComponentProps & { item: SearchResultItem }) => (
              <SongItem 
                key={index}
                item={item} 
                onView={onView} 
                onDelete={onDelete} 
                style={style} 
              />
            )}
            showArrow={false} // Only outer list should show arrow
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {songs.map((item, index) => (
            <SongItem 
              key={index}
              item={item} 
              onView={onView} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistGroup;
