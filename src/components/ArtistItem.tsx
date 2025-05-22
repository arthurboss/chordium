import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Artist } from '@/types/artist';

interface ArtistItemProps {
  item: Artist;
  style?: React.CSSProperties;
}

const ArtistItem: React.FC<ArtistItemProps> = ({ item, style }) => {
  return (
    <div style={style} key={item.url}>
      <ResultCard
        icon="user"
        title={item.displayName}
        onView={() => window.open(item.url, '_blank')}
        idOrUrl={item.url}
        viewButtonIcon="external"
        viewButtonLabel="See Artist Songs"
        isDeletable={false}
        compact
      />
    </div>
  );
};

export default React.memo(ArtistItem);
