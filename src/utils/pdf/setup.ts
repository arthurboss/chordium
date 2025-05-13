import { GlobalWorkerOptions, version } from 'pdfjs-dist';

/**
 * Setup the PDF.js worker
 * @returns Promise<boolean> Whether the setup was successful
 */
export async function setupPdfJs(): Promise<boolean> {
  try {
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('PDF.js worker set up with version:', version);
    return true;
  } catch (error) {
    console.error('Error setting up PDF.js worker:', error);
    return false;
  }
}
