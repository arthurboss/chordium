import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

/**
 * Extract content from all PDF pages
 * @param pdf The PDF document
 * @returns Promise with the extracted text
 */
export async function extractPdfContent(pdf: PDFDocumentProxy): Promise<string> {
  let fullText = '';
  
  try {
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
  } catch (error) {
    console.error('Error extracting PDF content:', error);
  }
  
  return fullText;
}
