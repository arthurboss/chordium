import { jest } from '@jest/globals';

/**
 * Mock Supabase Client
 * Provides mocked implementations for Supabase client methods
 */

interface SupabaseResponse<T = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T | null;
  error: Error | null;
}

interface MockSupabaseClient {
  from: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  select: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  ilike: jest.MockedFunction<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Helper methods for tests
  mockSuccess(data: any): MockSupabaseClient; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockError(error: any): MockSupabaseClient; // eslint-disable-line @typescript-eslint/no-explicit-any
  mockThrow(error: any): MockSupabaseClient; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Mock Supabase client
export const supabase: MockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  
  // Mock successful response
  mockSuccess: function(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.select.mockImplementation(() => ({
      ilike: () => ({
        data,
        error: null
      })
    }));
    return this;
  },
  
  // Mock error response
  mockError: function(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.select.mockImplementation(() => ({
      ilike: () => ({
        data: null,
        error
      })
    }));
    return this;
  },
  
  // Mock throw error
  mockThrow: function(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.select.mockImplementation(() => {
      throw error;
    });
    return this;
  }
};

export const createClient: jest.MockedFunction<any> = jest.fn(() => supabase); // eslint-disable-line @typescript-eslint/no-explicit-any
