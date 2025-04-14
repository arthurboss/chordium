
import React from 'react';

interface ChordDiagramProps {
  chordName: string;
}

// A simplified catalog of basic guitar chord fingerings
// This could be expanded to include more chords and variations
const CHORD_DIAGRAMS: Record<string, {
  positions: (number | 'x')[];
  fingers: (number | null)[];
  barres?: { fret: number, stringFrom: number, stringTo: number }[];
  baseFret?: number;
}> = {
  // Major chords
  'C': {
    positions: [0, 1, 0, 2, 3, 'x'],
    fingers: [0, 1, 0, 2, 3, null],
  },
  'D': {
    positions: ['x', 'x', 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
  },
  'E': {
    positions: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  'F': {
    positions: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ fret: 1, stringFrom: 0, stringTo: 5 }],
  },
  'G': {
    positions: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  'A': {
    positions: ['x', 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
  },
  'B': {
    positions: ['x', 2, 4, 4, 4, 2],
    fingers: [null, 1, 2, 3, 4, 1],
    barres: [{ fret: 2, stringFrom: 1, stringTo: 5 }],
  },
  
  // Minor chords
  'Am': {
    positions: ['x', 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
  },
  'Bm': {
    positions: ['x', 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
    barres: [{ fret: 2, stringFrom: 1, stringTo: 5 }],
  },
  'Cm': {
    positions: ['x', 3, 5, 5, 4, 3],
    fingers: [null, 1, 3, 4, 2, 1],
    barres: [{ fret: 3, stringFrom: 1, stringTo: 5 }],
  },
  'Dm': {
    positions: ['x', 'x', 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
  },
  'Em': {
    positions: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  'Fm': {
    positions: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    barres: [{ fret: 1, stringFrom: 0, stringTo: 5 }],
  },
  'Gm': {
    positions: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    barres: [{ fret: 3, stringFrom: 0, stringTo: 5 }],
  },
  
  // Common 7th chords
  'C7': {
    positions: [0, 1, 3, 2, 3, 'x'],
    fingers: [0, 1, 3, 2, 4, null],
  },
  'D7': {
    positions: ['x', 'x', 0, 2, 1, 2],
    fingers: [null, null, 0, 2, 1, 3],
  },
  'E7': {
    positions: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
  },
  'G7': {
    positions: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
  },
  'A7': {
    positions: ['x', 0, 2, 0, 2, 0],
    fingers: [null, 0, 2, 0, 3, 0],
  },
  
  // Common sus chords
  'Asus4': {
    positions: ['x', 0, 2, 2, 3, 0],
    fingers: [null, 0, 1, 2, 3, 0],
  },
  'Dsus4': {
    positions: ['x', 'x', 0, 2, 3, 3],
    fingers: [null, null, 0, 1, 2, 3],
  },
  'Esus4': {
    positions: [0, 2, 2, 2, 0, 0],
    fingers: [0, 1, 2, 3, 0, 0],
  },
};

const ChordDiagram: React.FC<ChordDiagramProps> = ({ chordName }) => {
  // Remove any suffixes for better chord matching (like /G in D/G)
  const baseChord = chordName.split('/')[0];
  
  // Find the chord diagram, default to C if not found
  const diagram = CHORD_DIAGRAMS[baseChord] || CHORD_DIAGRAMS['C'];
  
  // SVG dimensions
  const width = 120;
  const height = 150;
  const stringSpacing = 20;
  const fretSpacing = 24;
  const topMargin = 40;
  const leftMargin = 10;
  
  // Calculate number of frets to display
  const frets = 5;
  
  // Rendering the chord diagram as SVG
  return (
    <div className="flex flex-col items-center p-2">
      <h3 className="text-center font-bold mb-2">{chordName}</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Chord name */}
        <text x={width / 2} y={20} textAnchor="middle" className="font-medium">{baseChord}</text>
        
        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line 
            key={`string-${i}`}
            x1={leftMargin + i * stringSpacing}
            y1={topMargin}
            x2={leftMargin + i * stringSpacing}
            y2={topMargin + fretSpacing * frets}
            stroke="black"
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}
        
        {/* Frets */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line 
            key={`fret-${i}`}
            x1={leftMargin}
            y1={topMargin + i * fretSpacing}
            x2={leftMargin + 5 * stringSpacing}
            y2={topMargin + i * fretSpacing}
            stroke="black"
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}
        
        {/* String/fret markers (finger positions) */}
        {diagram.positions.map((pos, stringIndex) => {
          // Reverse string order to match standard guitar tab notation (low E to high E)
          const actualStringIndex = 5 - stringIndex;
          
          if (pos === 'x') {
            // 'X' for muted strings
            return (
              <text
                key={`marker-${stringIndex}`}
                x={leftMargin + actualStringIndex * stringSpacing}
                y={topMargin - 10}
                textAnchor="middle"
                fontSize="12"
              >
                X
              </text>
            );
          } else if (pos === 0) {
            // Open string circle
            return (
              <circle
                key={`marker-${stringIndex}`}
                cx={leftMargin + actualStringIndex * stringSpacing}
                cy={topMargin - 10}
                r={5}
                stroke="black"
                strokeWidth={1}
                fill="none"
              />
            );
          } else {
            // Finger position dot
            return (
              <circle
                key={`marker-${stringIndex}`}
                cx={leftMargin + actualStringIndex * stringSpacing}
                cy={topMargin + (pos - 0.5) * fretSpacing}
                r={7}
                fill="black"
              />
            );
          }
        })}
        
        {/* Barre indicators */}
        {diagram.barres?.map((barre, index) => {
          const startString = 5 - barre.stringTo;
          const endString = 5 - barre.stringFrom;
          return (
            <rect
              key={`barre-${index}`}
              x={leftMargin + startString * stringSpacing - 7}
              y={topMargin + (barre.fret - 0.5) * fretSpacing - 7}
              width={(endString - startString) * stringSpacing + 14}
              height={14}
              rx={7}
              fill="black"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ChordDiagram;
