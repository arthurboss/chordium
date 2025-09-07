import React from 'react';
import MetadataBadge from './MetadataBadge';
import type { ChordMetadataProps } from './ChordMetadata.types';

/**
 * ChordMetadata component for displaying musical metadata
 * 
 * Renders artist and tuning information using reusable MetadataBadge components.
 * Each metadata item is displayed as a labeled badge with consistent styling.
 * 
 * @param chordSheet - Chord sheet object containing all metadata
 */
const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet }) => {
  const tuning = Array.isArray(chordSheet.guitarTuning)
    ? chordSheet.guitarTuning.join('-')
    : chordSheet.guitarTuning;

  return (
    <div className='grid grid-cols-2 sm:[grid-template-columns:repeat(4,_min-content)] gap-2 w-full sm:justify-between text-xs'>
      <MetadataBadge 
        label="Artist:" 
        value={chordSheet.artist} 
      />
      <MetadataBadge 
        label="Tuning:" 
        value={tuning} 
      />
      <MetadataBadge 
        label="Key:" 
        value={chordSheet.songKey} 
      />
      <MetadataBadge 
        label="Capo:" 
        value={chordSheet.guitarCapo.toString()} 
      />
    </div>
  );
};

export default ChordMetadata;
