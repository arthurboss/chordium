import React, { useMemo } from 'react';
import { ChordContentProps, ChordLineType, ChordSectionType } from './types';
import ChordSheet from './ChordSheet';
import { CHORD_REGEX } from '@/utils/chordProcessingUtils';

/**
 * Renders a line of chord content based on its type
 */
const ChordLine: React.FC<{
  line: ChordLineType;
  renderChord: (chord: string) => React.ReactNode;
  viewMode: string;
  hideGuitarTabs: boolean;
}> = React.memo(({ line, renderChord, viewMode, hideGuitarTabs }) => {
  // Return null for lines that should be hidden based on the view mode
  if (line.type === 'tab' && hideGuitarTabs) return null;
  if (viewMode === "lyrics-only" && (line.type === 'chord' || line.type === 'tab')) return null;
  if (viewMode === "chords-only" && line.type === 'lyrics') return null;
  
  if (line.type === 'tab') {
    return (
      <ChordSheet>
        {line.content}
      </ChordSheet>
    );
  } else if (line.type === 'chord') {
    // Process chord line to render chord diagrams
    let lastIndex = 0;
    const parts = [];
    let match;
    const chordRegexGlobal = new RegExp(CHORD_REGEX);
    
    while ((match = chordRegexGlobal.exec(line.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.content.substring(lastIndex, match.index));
      }
      parts.push(renderChord(match[0]));
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < line.content.length) {
      parts.push(line.content.substring(lastIndex));
    }
    
    return (
      <div className="chord-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
        {parts.length > 0 ? parts : line.content}
      </div>
    );
  } else if (line.type === 'lyrics') {
    return (
      <div className="lyrics-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
        {line.content}
      </div>
    );
  } else {
    // Empty line
    return <div className="h-4" />;
  }
});

/**
 * Renders a section with title and lines
 */
const ChordSection: React.FC<{
  section: ChordSectionType;
  renderChord: (chord: string) => React.ReactNode;
  viewMode: string;
  hideGuitarTabs: boolean;
}> = React.memo(({ section, renderChord, viewMode, hideGuitarTabs }) => {
  return (
    <div>
      {section.title && (
        <h2 className="section-header">{section.title}</h2>
      )}
      <div className="mb-5">
        {section.lines.map((line, lineIndex) => (
          <ChordLine 
            key={lineIndex}
            line={line}
            renderChord={renderChord}
            viewMode={viewMode}
            hideGuitarTabs={hideGuitarTabs}
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Main component for displaying chord content
 */
const ChordContent: React.FC<ChordContentProps> = ({
  processedContent,
  fontSize,
  fontSpacing,
  fontStyle,
  lineHeight,
  viewMode,
  hideGuitarTabs,
  renderChord,
}) => {
  // Determine font family based on fontStyle prop
  const fontFamily = useMemo(() => {
    if (fontStyle === 'serif') return 'serif';
    if (fontStyle === 'sans-serif') return 'system-ui, sans-serif';
    if (fontStyle === 'monospace') return 'monospace';
    return undefined;
  }, [fontStyle]);
  
  return (
    <div 
      className="bg-white mb-4 p-4 sm:p-6 rounded-lg shadow-sm border"
      style={{ fontSize: `${fontSize}px`, letterSpacing: `${fontSpacing}em`, fontFamily, lineHeight }}
    >
      {processedContent.map((section, sectionIndex) => (
        <ChordSection
          key={sectionIndex}
          section={section}
          renderChord={renderChord}
          viewMode={viewMode}
          hideGuitarTabs={hideGuitarTabs}
        />
      ))}
      
      {processedContent.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No chord content to display
        </div>
      )}
    </div>
  );
};

export default React.memo(ChordContent);