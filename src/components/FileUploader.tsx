import { useState, useRef, useEffect } from 'react';
import { FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
}

interface PdfMetadata {
  info: {
    Producer?: string;
    Creator?: string;
    Title?: string;
    [key: string]: unknown;
  };
  metadata: unknown;
}

const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfJsReady, setIsPdfJsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupPdfJs = async () => {
      try {
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('PDF.js worker set up with version:', version);
        setIsPdfJsReady(true);
      } catch (error) {
        console.error('Error setting up PDF.js worker:', error);
        setIsPdfJsReady(false);
      }
    };
    
    setupPdfJs();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    if (!isPdfJsReady) {
      throw new Error('PDF.js is not initialized yet. Please try again in a moment.');
    }
    
    setIsLoading(true);
    console.log('Starting PDF extraction for:', file.name);
    
    try {
      const fileData = await readFileAsArrayBuffer(file);
      const pdf = await getDocument(fileData).promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      let songTitle = '';
      let artistName = '';
      let isCifraClub = false;
      
      // Check if it's a Cifra Club PDF
      isCifraClub = file.name.toLowerCase().includes('cifra club');
      
      // Regex to filter out Cifra Club related text
      const cifraClubRegex = /cifra\s*club/i;
      
      // For Cifra Club PDFs, try to extract metadata from filename first
      if (isCifraClub) {
        // Extract from filename pattern: "Cifra Club - Artist - Title.pdf" or "Cifra Club - Artist - Title (1).pdf"
        let cleanFileName = file.name;
        
        // First remove the file extension and any duplicate number pattern
        cleanFileName = cleanFileName.replace(/\.(pdf|PDF)$/, '')  // Remove file extension
                                   .replace(/\s*\(\d+\)$/, '');    // Remove duplicate number pattern
        
        const filenameParts = cleanFileName.split(' - ');
        if (filenameParts.length >= 3) {
          const potentialArtist = filenameParts[1].trim();
          const potentialTitle = filenameParts[2].trim();
          
          // Only use if they don't contain Cifra Club
          if (!cifraClubRegex.test(potentialTitle)) {
            songTitle = potentialTitle;
          }
          if (!cifraClubRegex.test(potentialArtist)) {
            artistName = potentialArtist;
          }
          
          console.log('Extracted metadata from filename:');
          console.log('Title:', songTitle);
          console.log('Artist:', artistName);
        }
      }
      
      // If metadata not found in filename, try to extract from first page
      if (isCifraClub && (!songTitle || !artistName)) {
        const firstPage = await pdf.getPage(1);
        const textContent = await firstPage.getTextContent({
          includeMarkedContent: true
        });
        
        // Extract text items and their positions
        const textItems = textContent.items.map((item: TextItem) => {
          // Ensure the item has the required properties
          if (!item || typeof item !== 'object' || !('transform' in item)) {
            return {
              text: '',
              y: 0,
              x: 0
            };
          }
          
          return {
            text: item.str || '',
            y: item.transform?.[5] || 0, // Y position of the text
            x: item.transform?.[4] || 0  // X position of the text
          };
        }).filter(item => {
          // Filter out empty items and Cifra Club text
          const text = item.text.trim();
          return text.length > 0 && !cifraClubRegex.test(text);
        });
        
        // Sort text items by Y position (top to bottom)
        textItems.sort((a, b) => b.y - a.y);
        
        // Find the first two non-empty lines at the top
        const topLines = textItems.slice(0, 2);
        
        if (topLines.length >= 2) {
          if (!songTitle) {
            songTitle = topLines[0].text;
          }
          if (!artistName) {
            artistName = topLines[1].text;
          }
          
          console.log('Extracted metadata from first page:');
          console.log('Title:', songTitle);
          console.log('Artist:', artistName);
        }
      }
      
      // Process all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
          includeMarkedContent: true
        });
        
        const textItems = textContent.items;
        console.log(`Page ${i} has ${textItems.length} text items`);
        
        let lastY = null;
        let text = '';
        let currentLine = '';
        
        for (const item of textItems) {
          if ('str' in item) {
            const itemY = item.transform[5];
            
            // Check if we're on a new line
            if (lastY !== null && Math.abs(itemY - lastY) > 5) {
              if (currentLine.trim()) {
                text += currentLine + '\n';
              }
              currentLine = '';
            }
            
            // Add the text to the current line
            currentLine += item.str;
            lastY = itemY;
          }
        }
        
        // Add the last line if it exists
        if (currentLine.trim()) {
          text += currentLine + '\n';
        }
        
        fullText += text + '\n\n';
      }
      
      console.log('Text extraction complete, formatting chord sheet...');
      const formattedText = formatPdfChordSheet(fullText, songTitle, artistName, isCifraClub);
      console.log('PDF processing complete');
      return formattedText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error extracting PDF text');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };
  
  const formatPdfChordSheet = (text: string, songTitle: string, artistName: string, isCifraClub: boolean): string => {
    console.log('Formatting chord sheet with metadata:');
    console.log('Title:', songTitle);
    console.log('Artist:', artistName);
    console.log('Is Cifra Club:', isCifraClub);
    
    // Split by lines and remove excessive whitespace
    const lines = text.split('\n').map(line => line.trim());
    
    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.length > 0);
    
    // Process the lines to better format chord sheets
    const formattedLines: string[] = [];
    
    // Add song metadata if available
    if (songTitle && artistName) {
      formattedLines.push(`[title]${songTitle}[/title]`);
      formattedLines.push(`[artist]${artistName}[/artist]`);
      formattedLines.push(''); // Add empty line after metadata
    }
    
    let currentSection = '';
    
    // Enhanced chord regex that includes common chord variations
    const chordRegex = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;
    
    // Section header regex
    const sectionHeaderRegex = /(?:verse|chorus|bridge|intro|outro|solo|pre-chorus|interlude)/i;
    
    // Tab line detection
    const isTabLine = (line: string): boolean => {
      // Check for common tab patterns
      const tabPatterns = [
        /^[-=]{3,}$/, // Lines of hyphens or equals
        /^[0-9hpsl/\\~]{3,}$/, // Numbers and tab symbols
        /^[x0-9]{6,}$/, // Multiple numbers or x's (muted strings)
        /^[A-G][#b]?\s*\|/ // Chord followed by bar
      ];
      return tabPatterns.some(pattern => pattern.test(line));
    };
    
    // Chord line detection
    const isChordLine = (line: string): boolean => {
      // Skip if it's a tab line
      if (isTabLine(line)) return false;
      
      // Count chord matches
      const chordMatches = line.match(chordRegex) || [];
      
      // Calculate chord density (chords per character)
      const chordDensity = chordMatches.length / line.length;
      
      // Check for common chord line characteristics
      const hasEnoughChords = chordMatches.length >= 2;
      const hasHighChordDensity = chordDensity > 0.1; // At least 10% of the line is chords
      const hasSpacedChords = line.match(/\s{2,}/) !== null; // Multiple spaces between chords
      
      return hasEnoughChords || (hasHighChordDensity && hasSpacedChords);
    };
    
    // Lyrics line detection
    const isLyricsLine = (line: string): boolean => {
      // Skip if it's a tab line or chord line
      if (isTabLine(line) || isChordLine(line)) return false;
      
      // Check for common lyrics characteristics
      const hasWords = line.match(/\b\w{2,}\b/g)?.length || 0;
      const wordDensity = hasWords / line.length;
      
      return hasWords >= 2 && wordDensity > 0.2; // At least 2 words and 20% word density
    };
    
    // Process lines with improved detection
    for (let i = 0; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i];
      
      // Skip page numbers
      if (/^\d+$/.test(line)) {
        continue;
      }
      
      // Check for section headers
      if (sectionHeaderRegex.test(line)) {
        const sectionName = line.trim().replace(/:/g, '');
        currentSection = `[${sectionName}]`;
        formattedLines.push(currentSection);
        continue;
      }
      
      // For Cifra Club PDFs, handle special cases
      if (isCifraClub) {
        // Skip metadata lines that we've already extracted
        if (i < 5 && (line === songTitle || line === artistName)) {
          continue;
        }
      }
      
      // Check for tab lines
      if (isTabLine(line)) {
        formattedLines.push(line);
        continue;
      }
      
      // Check for chord lines
      if (isChordLine(line)) {
        formattedLines.push(line);
        continue;
      }
      
      // Check for lyrics lines
      if (isLyricsLine(line)) {
        formattedLines.push(line);
        continue;
      }
      
      // If we can't determine the line type, include it anyway
      formattedLines.push(line);
    }
    
    return formattedLines.join('\n');
  };

  const processFile = async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type);
    
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    const isTxt = fileName.endsWith('.txt') || file.type === 'text/plain';
    
    if (!isPdf && !isTxt) {
      console.log('Invalid file format detected:', file.name, file.type);
      toast({
        title: "Invalid file format",
        description: "Please upload a text file (.txt) or a PDF file (.pdf)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    if (isTxt) {
      console.log('Processing as text file');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          onFileContent(event.target.result as string, file.name);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "There was a problem reading the file content",
          variant: "destructive",
        });
      };
      
      reader.readAsText(file);
    } else if (isPdf) {
      console.log('Processing as PDF file');
      try {
        if (!isPdfJsReady) {
          throw new Error('PDF.js library is not ready yet. Please try again in a moment.');
        }
        
        const pdfText = await extractTextFromPdf(file);
        onFileContent(pdfText, file.name);
      } catch (error) {
        console.error('PDF extraction error:', error);
        toast({
          title: "Error extracting PDF text",
          description: error instanceof Error ? error.message : "Failed to extract text from PDF",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg ${
          selectedFile ? 'p-3' : 'p-6'
        } text-center ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border'
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileUp className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium truncate">{selectedFile.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFile}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-full p-3 inline-block mb-3">
              <FileUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Upload a chord sheet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a text file or PDF here, or click to browse
            </p>
            <Button 
              variant="outline" 
              onClick={handleBrowseClick}
              className="mx-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Browse Files'}
            </Button>
            {!isPdfJsReady && (
              <p className="text-xs text-amber-500 mt-2">
                PDF support is initializing...
              </p>
            )}
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".txt,.pdf,application/pdf,text/plain"
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  );
};

export default FileUploader;
