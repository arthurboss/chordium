// Mock Supabase client
export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  // Mock successful response
  mockSuccess: function(data) {
    this.select.mockImplementation(() => ({
      ilike: () => ({
        data,
        error: null
      })
    }));
    return this;
  },
  // Mock error response
  mockError: function(error) {
    this.select.mockImplementation(() => ({
      ilike: () => ({
        data: null,
        error
      })
    }));
    return this;
  },
  // Mock throw error
  mockThrow: function(error) {
    this.select.mockImplementation(() => {
      throw error;
    });
    return this;
  }
};

export const createClient = jest.fn(() => supabase);
