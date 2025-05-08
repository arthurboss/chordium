
import { useState } from 'react';
import { transposeChord } from '@/utils/chordUtils';
import { toast } from "@/hooks/use-toast";

// Enhanced chord regex pattern for better recognition
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

export interface ChordLine {
  type: 'chord' | 'lyrics' | 'tab' | 'empty';
  content: string;
}

export interface ChordSection {
  type: 'section';
  title: string;
  lines: ChordLine[];
}

export const useChordDisplay = (initialContent: string, onSave?: (content: string) => void) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(initialContent);

  // Process the chord content into sections and lines with chords highlighted
  const processContent = (rawContent: string) => {
    if (!rawContent) return [{ type: 'section', title: '', lines: [] }];
    
    const lines = rawContent.split('\n');
    const sections = [];
    let currentSection = { type: 'section', title: '', lines: [] };
    
    for (let line of lines) {
      // Detect section headers (e.g., [Chorus], [Verse], etc.)
      if (line.match(/^\[.*\]$/)) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { 
          type: 'section', 
          title: line.replace(/[\[\]]/g, ''), 
          lines: [] 
        };
      } else {
        // Process chord lines and guitar tabs
        if (line.trim() === '') {
          // Add empty line
          currentSection.lines.push({ type: 'empty', content: ' ' });
        } else {
          // Detect if this is a guitar tab line (contains |----|, e|---, etc.)
          const isTabLine = line.includes('|--') || 
                           line.includes('-|') || 
                           line.match(/^[eADGBE]\|/) || 
                           line.match(/^\|/) ||
                           line.match(/^\s*\d+\s*$/) || // Numbers only (fret markers)
                           line.match(/^[eADGBE]:/) || 
                           line.trim().length > 0 && line.trim().split('').every(c => 
                             ['-', '|', '/', '\\', '.', 'h', 'p', 'b', 'r', 's', 't', '(', ')', 
                              '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '\t'].includes(c));
  
          // Chord line detection - has chord patterns
          const hasChordPattern = line.match(CHORD_REGEX);
          const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
          
          if (isTabLine) {
            currentSection.lines.push({ type: 'tab', content: line });
          } else if ((nonSpaceRatio < 0.5 && hasChordPattern) || 
                    (line.length < 30 && hasChordPattern && line.split(CHORD_REGEX).filter(Boolean).every(s => s.trim() === ''))) {
            // Replace chords with transposed versions if needed
            if (transpose !== 0) {
              // Find chord patterns and transpose them
              line = line.replace(CHORD_REGEX, match => transposeChord(match, transpose));
            }
            
            currentSection.lines.push({ type: 'chord', content: line });
          } else {
            currentSection.lines.push({ type: 'lyrics', content: line });
          }
        }
      }
    }
    
    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const processedContent = processContent(editContent);
  
  // Generate options for the transpose selector
  const transposeOptions = Array.from({ length: 25 }, (_, i) => i - 12);
  
  // Handle saving edits
  const handleSaveEdits = () => {
    if (onSave) {
      onSave(editContent);
    }
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your chord sheet has been updated"
    });
  };
  
  // Handle download of chord sheet
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([editContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "chord-sheet.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your chord sheet is being downloaded"
    });
  };

  return {
    transpose,
    setTranspose,
    fontSize,
    setFontSize,
    fontSpacing,
    setFontSpacing,
    fontStyle,
    setFontStyle,
    viewMode,
    setViewMode,
    hideGuitarTabs,
    setHideGuitarTabs,
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    processedContent,
    transposeOptions,
    handleSaveEdits,
    handleDownload,
    CHORD_REGEX
  };
};
