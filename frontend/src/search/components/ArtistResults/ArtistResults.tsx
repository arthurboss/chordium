import React from 'react';
import { ListChildComponentProps } from 'react-window';
import { Artist } from '@chordium/types';

import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import ArtistItem from "@/components/ArtistItem";

import { CARD_HEIGHTS } from "@/constants/ui-constants";
import { ArtistResultsProps } from './ArtistResults.types';

const VIRTUALIZATION_THRESHOLD = 30;

const ArtistResults: React.FC<ArtistResultsProps> = ({ artists, onArtistSelect }) => {
 if (!artists || artists.length === 0) return null;

 const isVirtualized = artists.length >= VIRTUALIZATION_THRESHOLD;

 if (isVirtualized) {
  return (
   <VirtualizedListWithArrow
    items={artists}
    itemHeight={CARD_HEIGHTS.RESULT_CARD}
    renderItem={({ index, style, item }: ListChildComponentProps & { item: Artist }) => (
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
