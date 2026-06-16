export interface ChordSheet {
  /** Plain-text chord sheet content (chords + lyrics). Always present. */
  songChords: string;
  /** Pre-rendered HTML from the source page. Optional — only present for scraped sheets. */
  rawHtml?: string;
}
