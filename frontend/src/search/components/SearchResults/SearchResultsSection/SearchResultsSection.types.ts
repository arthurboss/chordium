/**
 * Props interface for SearchResultsSection component
 */

export interface SearchResultsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  count?: number;
  /**
   * Rendered on the title's own row, at the end. Used for the sort control, so
   * that it sits level with the first section's heading rather than adding a row
   * of its own above the results.
   */
  action?: React.ReactNode;
}
