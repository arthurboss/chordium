/**
 * Error types
 */

export interface ApiError {
  status: number;
  message: string;
  stack?: string;
}
