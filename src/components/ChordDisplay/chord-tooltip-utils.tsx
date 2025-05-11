import { ChordWithTooltip } from './ChordTooltip';

/**
 * Helper function to render a chord with tooltip
 * @param chord - The chord name to render
 * @returns JSX element with chord and its diagram
 */
export const renderChord = (chord: string): JSX.Element => {
  // Generate a unique ID for each chord instance based on chord name + random value
  // This ensures uniqueness even for same chord name (like hotel-california)
  const uniqueKey = `${chord}-${Math.random().toString(36).substring(2, 9)}`;
  return <ChordWithTooltip key={uniqueKey} chord={chord} />;
};
