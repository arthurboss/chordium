/**
 * This is a compatibility bridge file for imports.
 * For better code organization, the PDF utility functions have been moved to the /pdf directory.
 * Import from those files directly for new code.
 */

// Re-export everything from the PDF utils module
export * from './pdf/index';

// For backward compatibility with existing code
export interface ExtractedPdfData {
  text: string;
  songTitle: string;
  artistName: string;
}

/**
 * @deprecated Use processPdfFile from fileProcessingUtils.ts instead
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdfData> {
  console.warn('extractTextFromPdf is deprecated. Use processPdfFile from fileProcessingUtils.ts instead');
  
  // Import dynamically to avoid circular dependencies
  const { readFileAsArrayBuffer } = await import('./pdf/pdfUtils');
  const { getDocument } = await import('pdfjs-dist');
  const { extractPdfContent } = await import('./pdf/extractContent');
  const { extractMetadata } = await import('./pdf/extractMetadata');
  
  // Read file as ArrayBuffer
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  // Get PDF document
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  
  // Create a regex for Cifra Club text
  const cifraClubRegex = /cifra\s*club|www\.cifraclub\.com|cifraclub\.com/i;
  
  // Extract metadata from PDF
  const metadata = await extractMetadata(pdf, file.name, cifraClubRegex);
  
  // Extract content from PDF
  const text = await extractPdfContent(pdf);
  
  return {
    text,
    songTitle: metadata.songTitle,
    artistName: metadata.artistName
  };
}
