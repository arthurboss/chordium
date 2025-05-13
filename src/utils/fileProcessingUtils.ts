import { getDocument } from 'pdfjs-dist';
import { readFileAsArrayBuffer } from './pdf/pdfUtils';
import { extractMetadata } from './pdf/extractMetadata';
import { extractPdfContent } from './pdf/extractContent';
import { formatPdfChordSheet } from './chordFormatterUtils';

export interface ProcessedFile {
  content: string;
  fileName: string;
  error?: Error;
}

// Check if file is PDF based on name or type
export const isPdfFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.pdf') || file.type === 'application/pdf';
};

// Check if file is TXT based on name or type
export const isTxtFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.txt') || file.type === 'text/plain';
};

// Process text file
export const processTxtFile = (file: File): Promise<ProcessedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve({
          content: event.target.result as string,
          fileName: file.name
        });
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
};

// Process PDF file
export const processPdfFile = async (file: File, isPdfJsReady: boolean): Promise<ProcessedFile> => {
  if (!isPdfJsReady) {
    throw new Error('PDF.js library is not ready yet. Please try again in a moment.');
  }
  
  try {
    // Create a regex for Cifra Club text
    const cifraClubRegex = /cifra\s*club|www\.cifraclub\.com|cifraclub\.com/i;
    const isCifraClub = file.name.toLowerCase().includes('cifra club');
    
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Get PDF document
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    // Extract metadata from PDF
    const metadata = await extractMetadata(pdf, file.name, cifraClubRegex);
    
    // Extract content from PDF
    const pdfContent = await extractPdfContent(pdf);
    
    // Format the extracted content
    const pdfText = formatPdfChordSheet(pdfContent, {
      songTitle: metadata.songTitle,
      artistName: metadata.artistName,
      isCifraClub
    });
    
    return {
      content: pdfText,
      fileName: file.name
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error instanceof Error ? error : new Error('Unknown error processing PDF');
  }
};
