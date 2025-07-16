import { describe, it, expect, vi } from 'vitest';
import { FetchErrorHandler } from '../fetch-error-handler';

describe('FetchErrorHandler', () => {
  let errorHandler: FetchErrorHandler;

  beforeEach(() => {
    errorHandler = new FetchErrorHandler();
  });

  describe('formatFetchError', () => {
    it('should handle abort errors with timeout message', () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      
      const message = errorHandler.formatFetchError(abortError);
      
      expect(message).toBe('Request timed out. The server might be busy or the connection is slow.');
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Network connection failed');
      
      const message = errorHandler.formatFetchError(error);
      
      expect(message).toBe('Network connection failed');
    });

    it('should handle unknown error types', () => {
      const unknownError = { someProperty: 'value' };
      
      const message = errorHandler.formatFetchError(unknownError);
      
      expect(message).toBe('Failed to load chord sheet. Please try again later.');
    });

    it('should add reconstruction hint for cifraclub URLs', () => {
      const error = new Error('Not found');
      const url = 'https://www.cifraclub.com.br/eagles/hotel-california/';
      const isReconstructed = true;
      
      const message = errorHandler.formatFetchError(error, url, isReconstructed);
      
      expect(message).toBe('Not found (Note: Using a URL reconstructed from the artist and song parameters)');
    });

    it('should not add hint for explicit URLs', () => {
      const error = new Error('Server error');
      const url = 'https://www.cifraclub.com.br/eagles/hotel-california/';
      const isReconstructed = false;
      
      const message = errorHandler.formatFetchError(error, url, isReconstructed);
      
      expect(message).toBe('Server error');
    });

    it('should not add hint for non-cifraclub URLs', () => {
      const error = new Error('Invalid URL');
      const url = 'https://example.com/song';
      const isReconstructed = true;
      
      const message = errorHandler.formatFetchError(error, url, isReconstructed);
      
      expect(message).toBe('Invalid URL');
    });
  });
});
