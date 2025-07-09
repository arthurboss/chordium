export interface BasicSearchResult {
  title?: string;
  path: string;
  [key: string]: unknown;
}
// Centralized types for result filtering and validation

export interface ResultWithPath {
  path: string;
  [key: string]: unknown;
}
