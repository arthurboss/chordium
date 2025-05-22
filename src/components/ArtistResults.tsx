import React from 'react';
import { SearchResultItem } from "@/utils/search-result-item";
import { ListChildComponentProps } from 'react-window';
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import ArtistItem from "@/components/ArtistItem";
import { Artist } from '@/types/artist';

interface ArtistResultsProps {
  artists: Artist[];
  horizontal?: boolean;
}

const ARTIST_ITEM_HEIGHT = 120;
const VIRTUALIZATION_THRESHOLD = 30;

const ArtistResults: React.FC<ArtistResultsProps> = ({ artists, horizontal = false }) => {
  if (!artists || artists.length === 0) return null;
  
  const isVirtualized = !horizontal && artists.length >= VIRTUALIZATION_THRESHOLD;

  if (horizontal) {
    return (
      <div className="flex flex-row gap-4 overflow-x-auto pb-2">
        {artists.map((item, index) => (
          <div className="w-full max-w-xl flex-shrink-0" key={index}>
            <ArtistItem item={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isVirtualized) {
    return (
      <VirtualizedListWithArrow
        items={artists}
        itemHeight={ARTIST_ITEM_HEIGHT}
        renderItem={({ index, style, item }: ListChildComponentProps & { item: SearchResultItem }) => (
          <ArtistItem key={index} item={item} style={style} />
        )}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-2">
      {artists.map((item, index) => (
        <ArtistItem key={index} item={item} />
      ))}
    </div>
  );
};

export default ArtistResults;
