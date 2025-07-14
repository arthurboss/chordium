/**
 * Generic error message formatter
 * Can be reused for any API/fetch error handling
 * Follows SRP: Single responsibility of error message formatting
 */

export interface ErrorInfo {
  error: unknown;
  context?: string;
  isReconstructedUrl?: boolean;
}

/**
 * Formats error messages in a user-friendly way
 * @param errorInfo - Error information object
 * @returns Formatted error message string
 */
export function formatErrorMessage(errorInfo: ErrorInfo): string {
  const { error, context, isReconstructedUrl } = errorInfo;
  
  let errorMessage: string;

  if (error instanceof DOMException && error.name === "AbortError") {
    errorMessage = "Request timed out. The server might be busy or the connection is slow.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "Failed to load chord sheet. Please try again later.";
  }

  // Add context-specific hints
  if (context && isReconstructedUrl) {
    errorMessage += ` (Note: Using a URL reconstructed from the artist and song parameters)`;
  }

  return errorMessage;
}
