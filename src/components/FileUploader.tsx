import { useState, useRef, useEffect } from 'react';
import { FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
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
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const textItems = textContent.items;
        console.log(`Page ${i} has ${textItems.length} text items`);
        
        let lastY = null;
        let text = '';
        
        for (const item of textItems) {
          if ('str' in item) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              text += '\n';
            } else if (text.length > 0 && !text.endsWith('\n') && text[text.length - 1] !== ' ') {
              text += ' ';
            }
            
            text += item.str;
            lastY = item.transform[5];
          }
        }
        
        fullText += text + '\n\n';
      }
      
      console.log('Text extraction complete, formatting chord sheet...');
      const formattedText = formatPdfChordSheet(fullText, file.name);
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
  
  const formatPdfChordSheet = (text: string, fileName: string): string => {
    const isCifraClub = fileName.toLowerCase().includes('cifra club');
    console.log('Processing as Cifra Club PDF:', isCifraClub);
    
    // Extract metadata and format content
    let extractedTitle = '';
    let extractedArtist = '';
    
    // Split by lines and remove excessive whitespace
    let lines = text.split('\n').map(line => line.trim());
    
    // Remove empty lines
    lines = lines.filter(line => line.length > 0);
    
    // Look for common chord patterns
    const chordRegex = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;
    
    // Identify section headers (like [Verse], [Chorus], etc.)
    const sectionHeaderRegex = /(?:verse|chorus|bridge|intro|outro|solo|pre-chorus|interlude)/i;
    
    // Process the lines to better format chord sheets
    let formattedLines: string[] = [];
    let currentSection = '';
    
    if (isCifraClub) {
      // For Cifra Club PDFs, we need to extract title and artist from the beginning
      let startIndex = 0;
      let titleFound = false;
      let artistFound = false;
      
      // Find the Cifra Club header to get our starting point
      for (let i = 0; i < Math.min(15, lines.length); i++) {
        if (lines[i].toLowerCase().includes('cifra club')) {
          startIndex = i;
          break;
        }
      }
      
      // Extract title and artist from the first few lines after the Cifra Club header
      // Cifra Club format typically has the title on one line and artist on the next
      for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
        const line = lines[i].trim();
        
        // Skip the Cifra Club line itself
        if (line.toLowerCase().includes('cifra club')) {
          continue;
        }
        
        // Skip empty lines
        if (line.length === 0) {
          continue;
        }
        
        // First non-empty line after Cifra Club is typically the song title
        if (!titleFound) {
          extractedTitle = line;
          titleFound = true;
          console.log('Extracted title:', extractedTitle);
          continue;
        }
        
        // Second non-empty line is typically the artist
        if (titleFound && !artistFound) {
          // Check if this line doesn't look like a chord line or section header
          if (!line.match(chordRegex) && !sectionHeaderRegex.test(line)) {
            extractedArtist = line;
            artistFound = true;
            console.log('Extracted artist:', extractedArtist);
            break;
          }
        }
      }
      
      // Add the extracted title and artist as metadata at the top of the chord sheet
      if (titleFound) {
        formattedLines.push(`Title: ${extractedTitle}`);
      }
      
      if (artistFound) {
        formattedLines.push(`Artist: ${extractedArtist}`);
      }
      
      formattedLines.push(''); // Add an empty line after metadata
      
      // Find the actual content start (after the header and metadata)
      let contentStartIndex = startIndex;
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        // Look for indicators that we're past the header section
        if (sectionHeaderRegex.test(line) || 
            line.includes('tom:') || 
            line.includes('capo:') || 
            line.includes('afinação:') || 
            line.match(chordRegex)) {
          contentStartIndex = i;
          break;
        }
      }
      
      // Process the actual chord content
      for (let i = contentStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and page numbers
        if (line.length === 0 || /^\d+$/.test(line)) {
          continue;
        }
        
        // Check if this line might be a section header
        if (sectionHeaderRegex.test(line)) {
          const sectionName = line.trim().replace(/:/g, '');
          currentSection = `[${sectionName}]`;
          formattedLines.push(currentSection);
          continue;
        }
        
        // Check if line contains multiple chords (likely a chord line)
        const chordMatches = line.match(chordRegex);
        if (chordMatches && chordMatches.length >= 2) {
          formattedLines.push(line);
          continue;
        }
        
        // Regular line (lyrics or other content)
        formattedLines.push(line);
      }
    } else {
      // Generic PDF processing
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.length === 0) {
          continue;
        }
        
        if (sectionHeaderRegex.test(line)) {
          const sectionName = line.trim().replace(/:/g, '');
          currentSection = `[${sectionName}]`;
          formattedLines.push(currentSection);
          continue;
        }
        
        const chordMatches = line.match(chordRegex);
        if (chordMatches && chordMatches.length >= 2) {
          formattedLines.push(line);
          continue;
        }
        
        formattedLines.push(line);
      }
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
