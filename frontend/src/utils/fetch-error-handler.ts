/**
 * Generic error handling utilities for fetch operations
 * Reusable across different parts of the application
 * Follows SRP: Single responsibility of error formatting
 */
export class FetchErrorHandler {
  /**
   * Formats fetch errors into user-friendly messages
   * 
   * @param error - The error that occurred
   * @param fetchUrl - Optional URL that was being fetched
   * @param isReconstructed - Whether the URL was reconstructed from params
   * @returns string - Formatted error message
   */
  formatFetchError(
    error: unknown, 
    fetchUrl?: string, 
    isReconstructed?: boolean
  ): string {
    let errorMessage: string;

    if (error instanceof DOMException && error.name === 'AbortError') {
      errorMessage = 'Request timed out. The server might be busy or the connection is slow.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Failed to load chord sheet. Please try again later.';
    }

    // Add hint for reconstructed cifraclub URLs
    if (this.shouldAddReconstructionHint(fetchUrl, isReconstructed)) {
      errorMessage += ' (Note: Using a URL reconstructed from the artist and song parameters)';
    }

    return errorMessage;
  }

  /**
   * Determines if reconstruction hint should be added to error message
   * 
   * @param fetchUrl - The URL that was being fetched
   * @param isReconstructed - Whether the URL was reconstructed
   * @returns boolean - True if hint should be added
   */
  private shouldAddReconstructionHint(fetchUrl?: string, isReconstructed?: boolean): boolean {
    return !!(fetchUrl && 
             isReconstructed && 
             fetchUrl.includes('cifraclub.com.br'));
  }
}
