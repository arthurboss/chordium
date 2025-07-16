import React from 'react';
import { Guitar, Music, Music2, Music3 } from 'lucide-react';

export const SearchLoadingState: React.FC = () => (
  <div className="p-8 text-center">
    <div className="flex items-center justify-center gap-2">
      {[
        { Icon: Guitar, size: 32 },
        { Icon: Music3, size: 24 },
        { Icon: Music, size: 24 },
        { Icon: Music2, size: 24 },
      ].map(({ Icon, size }, index) => (
        <div
          key={index}
          className="animate-bounce"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        >
          <Icon 
            size={size} 
            className="text-chord opacity-80"
          />
        </div>
      ))}
    </div>
    <p className="text-sm text-muted-foreground mt-4">
      Searching for music...
    </p>
  </div>
);

export default SearchLoadingState;
