import React from 'react';
import { Button } from '../../ui/button';
import { Text, Music, AlignLeft } from 'lucide-react';
import { ViewModeSelectorProps } from '../hooks/types';

/**
 * A component for selecting view mode (normal, chords-only, lyrics-only)
 */
const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={viewMode === 'normal' ? 'default' : 'outline'} 
        size="sm" 
        className="min-w-[40px] flex items-center justify-center" 
        onClick={() => setViewMode('normal')} 
        title="Normal"
      >
        <Text size={18} />
      </Button>
      <Button 
        variant={viewMode === 'chords-only' ? 'default' : 'outline'} 
        size="sm" 
        className="min-w-[40px] flex items-center justify-center" 
        onClick={() => setViewMode('chords-only')} 
        title="Chords"
      >
        <Music size={18} />
      </Button>
      <Button 
        variant={viewMode === 'lyrics-only' ? 'default' : 'outline'} 
        size="sm" 
        className="min-w-[40px] flex items-center justify-center" 
        onClick={() => setViewMode('lyrics-only')} 
        title="Lyrics"
      >
        <AlignLeft size={18} />
      </Button>
    </div>
  );
};

export default ViewModeSelector;
