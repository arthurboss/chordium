import React from 'react';
import { Button } from '../../ui/button';
import { HelpCircle } from 'lucide-react';
import { MarkdownDialog } from '../../ui/markdown-dialog';

// Import the MDX files directly as components
import Sections from '../../../assets/guides/sections.mdx';
import ChordNotation from '../../../assets/guides/chord-notation.mdx';
import Example from '../../../assets/guides/example.mdx';
import Tips from '../../../assets/guides/tips.mdx';

/**
 * Help button with markdown documentation dialog
 * Fixed to avoid maximum update depth issues
 */
const HelpButton: React.FC = () => {
  // Use a simple button with title attribute instead of a separate tooltip
  return (
    <div className="inline-block" title="Chord Sheet Formatting Guide">
      <MarkdownDialog
        title='Chord Sheet Formatting Guide'
        trigger={
          <Button 
            variant="outline" 
            size="sm" 
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center border"
            aria-label="Open chord sheet formatting guide"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        }
        mdxComponents={[
          { title: 'Sections', component: Sections },
          { title: 'Chords', component: ChordNotation },
          { title: 'Example', component: Example },
          { title: 'Tips', component: Tips }
        ]}
      />
    </div>
  );
};

export default React.memo(HelpButton);
