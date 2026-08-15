/**
 * Props interface for SearchResultsSection component
 */

export interface SearchResultsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  count?: number;
  /**
   * How many were found when only some are shown, so a trimmed section says so
   * rather than looking like the whole of it.
   */
  total?: number;
  /**
   * Rendered on the title's own row, at the end. Used for the sort control, so
   * that it sits level with the first section's heading rather than adding a row
   * of its own above the results.
   */
  action?: React.ReactNode;
  /**
   * Whether the section starts open. Search results start closed so that three
   * long lists arrive as three headings; one artist's own songs start open,
   * being the whole point of that page.
   */
  defaultOpen?: boolean;
}
