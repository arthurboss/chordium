/**
 * Custom error types for chord sheet storage operations
 * 
 * Provides specialized error classes for different storage failure scenarios
 * to enable better error handling and user feedback.
 */

/**
 * Base error class for all chord sheet storage operations
 */
export class ChordSheetStorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ChordSheetStorageError';
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseOperationError extends ChordSheetStorageError {
  constructor(operation: string, cause?: Error) {
    super(
      `Database operation failed: ${operation}`,
      operation,
      cause
    );
    this.name = 'DatabaseOperationError';
  }
}

/**
 * Error thrown when a chord sheet is not found in storage
 */
export class ChordSheetNotFoundError extends ChordSheetStorageError {
  constructor(songPath: string) {
    super(
      `Chord sheet not found: ${songPath}`,
      'get',
    );
    this.name = 'ChordSheetNotFoundError';
  }
}

/**
 * Error thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends ChordSheetStorageError {
  constructor(cause?: Error) {
    super(
      'Storage quota exceeded',
      'store',
      cause
    );
    this.name = 'StorageQuotaExceededError';
  }
}
