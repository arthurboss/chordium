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
  /**
   * Whether the section starts open. Search results start closed so that three
   * long lists arrive as three headings; one artist's own songs start open,
   * being the whole point of that page.
   */
  defaultOpen?: boolean;
  /**
   * Omits the divider below this section. Set on the last section in a list,
   * since the divider marks it off from the next heading rather than from its
   * own content, and there is no next heading after the last one.
   */
  hideDivider?: boolean;
}
