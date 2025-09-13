import React from 'react';
import type { MetadataBadgeProps } from './MetadataBadge.types';

/**
 * MetadataBadge component for displaying a single metadata item
 * 
 * Renders a labeled badge with consistent styling for metadata display.
 * Used for displaying various types of musical metadata like artist, tuning, etc.
 * 
 * @param label - Label text to display (e.g., "Artist:", "Tuning:")
 * @param value - Value text to display
 */
export const MetadataBadge: React.FC<MetadataBadgeProps> = ({ label, value }) => {
  return (
    <div className="whitespace-nowrap">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="ml-2 font-medium">{value}</span>
    </div>
  );
};
