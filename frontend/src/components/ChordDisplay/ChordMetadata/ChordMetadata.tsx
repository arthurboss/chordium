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
    <div className='grid [grid-template-columns:max-content_1fr] sm:[grid-template-columns:repeat(4,_min-content)] gap-y-1 gap-x-4 w-full sm:justify-between text-xs'>
      <MetadataBadge
        label="Artist:"
        value={chordSheet.artist}
      />
      <MetadataBadge
        label="Song Key:"
        value={chordSheet.songKey}
      />
      <MetadataBadge
        label="Guitar Tuning:"
        value={tuning}
      />
      <MetadataBadge
        label="Guitar Capo:"
        value={chordSheet.guitarCapo.toString()}
      />
    </div>
  );
};

export default ChordMetadata;
