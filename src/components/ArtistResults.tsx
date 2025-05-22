import React from 'react';
import { SearchResultItem } from "@/utils/search-result-item";
import { ListChildComponentProps } from 'react-window';
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import ArtistItem from "@/components/ArtistItem";
import { Artist } from '@/types/artist';
import { CARD_HEIGHTS } from "@/constants/ui-constants";

interface ArtistResultsProps {
  artists: Artist[];
  horizontal?: boolean;
  onArtistSelect?: (artist: Artist) => void;
}

const VIRTUALIZATION_THRESHOLD = 30;

const ArtistResults: React.FC<ArtistResultsProps> = ({ artists, horizontal = false, onArtistSelect }) => {
  if (!artists || artists.length === 0) return null;
  
  const isVirtualized = !horizontal && artists.length >= VIRTUALIZATION_THRESHOLD;

  if (horizontal) {
    return (
      <div className="flex flex-row gap-4 overflow-x-auto pb-2">
        {artists.map((item, index) => (
          <div className="w-full flex-shrink-0" key={index}>
            <ArtistItem item={item} onArtistSelect={onArtistSelect} />
          </div>
        ))}
      </div>
    );
  }

  if (isVirtualized) {
    return (
      <VirtualizedListWithArrow
        items={artists}
        itemHeight={CARD_HEIGHTS.RESULT_CARD}
        renderItem={({ index, style, item }: ListChildComponentProps & { item: SearchResultItem }) => (
          <ArtistItem key={index} item={item} style={style} onArtistSelect={onArtistSelect} />
        )}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-2">
      {artists.map((item, index) => (
        <ArtistItem key={index} item={item} onArtistSelect={onArtistSelect} />
      ))}
    </div>
  );
};

export default ArtistResults;
