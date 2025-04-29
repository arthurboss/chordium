import React from 'react';
import { ChordContentProps, ChordLine } from './types';

const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

const ChordContent: React.FC<ChordContentProps> = ({
  processedContent,
  fontSize,
  fontSpacing,
  fontStyle,
  viewMode,
  hideGuitarTabs,
  renderChord,
}) => {
  // Determine font family based on fontStyle prop
  let fontFamily = undefined;
  if (fontStyle === 'serif') fontFamily = 'serif';
  else if (fontStyle === 'sans-serif') fontFamily = 'system-ui, sans-serif';
  else if (fontStyle === 'monospace') fontFamily = 'monospace';
  // Default: do not override
  return (
    <div 
      className="bg-white mb-4 p-4 sm:p-6 rounded-lg shadow-sm border"
      style={{ fontSize: `${fontSize}px`, letterSpacing: `${fontSpacing}em`, fontFamily }}
      data-testid="chord-content"
    >
      {processedContent.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.title && (
            <h2 className="section-header">{section.title}</h2>
          )}
          <div className="mb-5">
            {section.lines.map((line: ChordLine, lineIndex: number) => {
              if (line.type === 'tab' && hideGuitarTabs) return null;
              if (viewMode === "lyrics-only" && (line.type === 'chord' || line.type === 'tab')) return null;
              if (viewMode === "chords-only" && line.type === 'lyrics') return null;
              if (line.type === 'tab') {
                return (
                  <pre key={lineIndex} className="font-mono text-xs overflow-x-auto whitespace-pre mb-1 break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                    {line.content}
                  </pre>
                );
              } else if (line.type === 'chord') {
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
                  <div key={lineIndex} className="chord-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                    {parts.length > 0 ? parts : line.content}
                  </div>
                );
              } else if (line.type === 'lyrics') {
                return (
                  <div key={lineIndex} className="lyrics-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                    {line.content}
                  </div>
                );
              } else {
                return <div key={lineIndex} className="h-4" />;
              }
            })}
          </div>
        </div>
      ))}
      {processedContent.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No chord content to display
        </div>
      )}
    </div>
  );
};

export default ChordContent; 