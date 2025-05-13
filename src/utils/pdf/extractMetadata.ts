import { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';
import { ExtractedMetadata, TextItemWithPosition } from './types';

/**
 * Extract metadata from PDF and filename
 * @param pdf The PDF document
 * @param fileName The name of the file
 * @param cifraClubRegex Regex to filter out Cifra Club text
 * @returns Promise with the extracted metadata
 */
export async function extractMetadata(
  pdf: PDFDocumentProxy,
  fileName: string,
  cifraClubRegex: RegExp
): Promise<ExtractedMetadata> {
  let songTitle = '';
  let artistName = '';
  const isCifraClub = fileName.toLowerCase().includes('cifra club');
  
  // Try to extract from filename first for Cifra Club PDFs
  if (isCifraClub) {
    const filenameMetadata = extractMetadataFromFilename(fileName, cifraClubRegex);
    songTitle = filenameMetadata.songTitle;
    artistName = filenameMetadata.artistName;
  }
  
  // If metadata not found in filename, try to extract from first page
  if (isCifraClub && (!songTitle || !artistName)) {
    const firstPageMetadata = await extractMetadataFromFirstPage(pdf, cifraClubRegex);
    
    if (!songTitle) {
      songTitle = firstPageMetadata.songTitle;
    }
    if (!artistName) {
      artistName = firstPageMetadata.artistName;
    }
  }
  
  return { songTitle, artistName };
}

/**
 * Extract metadata from filename
 * @param fileName The name of the file
 * @param cifraClubRegex Regex to filter out Cifra Club text
 * @returns The extracted metadata
 */
export function extractMetadataFromFilename(
  fileName: string,
  cifraClubRegex: RegExp
): ExtractedMetadata {
  let songTitle = '';
  let artistName = '';
  
  // Clean filename
  let cleanFileName = fileName;
  cleanFileName = cleanFileName.replace(/\.(pdf|PDF)$/, '')  // Remove file extension
                             .replace(/\s*\(\d+\)$/, '');    // Remove duplicate number pattern
  
  // Parse parts
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
  
  return { songTitle, artistName };
}

/**
 * Extract metadata from first page
 * @param pdf The PDF document
 * @param cifraClubRegex Regex to filter out Cifra Club text
 * @returns Promise with the extracted metadata
 */
export async function extractMetadataFromFirstPage(
  pdf: PDFDocumentProxy,
  cifraClubRegex: RegExp
): Promise<ExtractedMetadata> {
  let songTitle = '';
  let artistName = '';
  
  try {
    const firstPage = await pdf.getPage(1);
    const textContent = await firstPage.getTextContent({
      includeMarkedContent: true
    });
    
    // Extract text items and their positions
    const textItems: TextItemWithPosition[] = textContent.items.map((item: TextItem) => {
      // Ensure the item has the required properties
      if (!item || typeof item !== 'object' || !('transform' in item)) {
        return { text: '', y: 0, x: 0 };
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
      songTitle = topLines[0].text;
      artistName = topLines[1].text;
      
      console.log('Extracted metadata from first page:');
      console.log('Title:', songTitle);
      console.log('Artist:', artistName);
    }
  } catch (error) {
    console.error('Error extracting metadata from first page:', error);
  }
  
  return { songTitle, artistName };
}
