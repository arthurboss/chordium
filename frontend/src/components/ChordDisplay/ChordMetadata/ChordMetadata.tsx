import React from 'react';
import { MetadataBadge } from './MetadataBadge';
import type { ChordMetadataProps } from './ChordMetadata.types';

/**
 * ChordMetadata component for displaying musical metadata
 * 
 * Renders artist and tuning information using reusable MetadataBadge components.
 * Each metadata item is displayed as a labeled badge with consistent styling.
 * 
 * @param chordSheet - Chord sheet object containing all metadata
 */
export const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet }) => {
  // Handle undefined/null values gracefully
  const tuning = chordSheet.guitarTuning 
    ? (Array.isArray(chordSheet.guitarTuning)
        ? chordSheet.guitarTuning.join('-')
        : chordSheet.guitarTuning)
    : 'Standard';

  const capoValue = chordSheet.guitarCapo !== undefined && chordSheet.guitarCapo !== null
    ? chordSheet.guitarCapo.toString()
    : 'None';

  return (
    <div className='grid [grid-template-columns:max-content_1fr] sm:[grid-template-columns:repeat(4,_min-content)] gap-y-1 gap-x-4 w-full sm:justify-between text-xs'>
      <MetadataBadge
        label="Artist:"
        value={chordSheet.artist || 'Unknown'}
      />
      <MetadataBadge
        label="Song Key:"
        value={chordSheet.songKey || 'Unknown'}
      />
      <MetadataBadge
        label="Guitar Tuning:"
        value={tuning}
      />
      <MetadataBadge
        label="Guitar Capo:"
        value={capoValue}
      />
    </div>
  );
};
