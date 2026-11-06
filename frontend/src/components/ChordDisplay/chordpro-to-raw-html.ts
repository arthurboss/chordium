import type { ChordProDocument, ChordProLine } from '@/utils/chordpro/types';
import { parseChordPro } from '@/utils/chordpro/parse';
import { toPlainLyricAndChordColumns, renderChordLineText } from '@/utils/chordpro/layout';
import { translateSectionTitle } from './song-chords-to-raw-html';

/**
 * Escapes HTML-special characters in dynamic text content before it is
 * interpolated into a raw HTML string. Only ever apply this to *content*,
 * never to the markup this module inserts itself.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders a chord-only line (e.g. "[Em7] [G] [D4]") as plain baseline chord
 * spans, space-separated. There's no lyric to anchor to, so chords render as
 * visible text, not positioned markup.
 */
function renderChordOnlyLine(line: Extract<ChordProLine, { type: 'lyrics' }>): string {
  const { chords } = toPlainLyricAndChordColumns(line);
  const chordLineText = renderChordLineText(chords);
  return escapeHtml(chordLineText).replace(/\S+/g, (chord) => `<b>${chord}</b>`);
}

/**
 * Renders a `ChordProLine` of type 'lyrics' using ghost-text positioning:
 * an invisible duplicate of the lyric text with each chord positioned inline
 * at its exact character index, so the browser's own text layout keeps chords
 * pixel-aligned above the lyric regardless of font. This avoids padding the
 * text content with spaces (which bloat the HTML and become visible in
 * monospace), and works correctly for proportional fonts too.
 *
 * A line with no chords renders as plain lyric text. A chord-only line
 * (no lyric) renders as visible chord spans.
 */
function renderLyricsLine(line: Extract<ChordProLine, { type: 'lyrics' }>): string {
  const { lyric, chords } = toPlainLyricAndChordColumns(line);
  let escapedLyric = escapeHtml(lyric);
  if (chords.length === 0) return escapedLyric;
  if (lyric.trim() === '') return renderChordOnlyLine(line);

  const ghostParts: string[] = [];
  let pendingChords: string[] = [];

  const flushPendingChords = () => {
    if (pendingChords.length === 0) return;
    ghostParts.push(
      '<span class="chord-anchor">' +
        pendingChords.map((chord) => `<b>${escapeHtml(chord)}</b>`).join(' ') +
        '</span>'
    );
    pendingChords = [];
  };

  for (const segment of line.segments) {
    if (segment.chord !== undefined) pendingChords.push(segment.chord);
    if (segment.lyric !== '') {
      flushPendingChords();
      ghostParts.push('<span class="chord-ghost">' + escapeHtml(segment.lyric) + '</span>');
    }
  }
  flushPendingChords();

  // Strip leading whitespace from the final lyric output so indentation
  // from the original format doesn't appear in the rendered HTML.
  escapedLyric = escapedLyric.replace(/^\s+/, '');

  const chordRow = '<span class="chord-row">' + ghostParts.join('') + '</span>';
  return chordRow + escapedLyric;
}

/**
 * Converts a parsed ChordProDocument into the same HTML shape the legacy
 * `songChordsToRawHtml` converter produces, so downstream `processHtml` /
 * `chord-html/*` / `tab-splitting.ts` transforms keep working unchanged:
 * - chords wrapped in `<b>...</b>`, on their own line above the lyric line
 * - section titles as `<span class="section-title">...</span>`
 * - tab blocks as `<span class="tablatura"><span class="cnt">...</span></span>`
 *
 * Unlike the legacy converter, this one HTML-escapes all dynamic text
 * (chord names and lyrics) since ChordPro `songChords` can contain
 * user-edited free text.
 */
function renderDocument(doc: ChordProDocument): string {
  const result: string[] = [];
  let tabBuffer: string[] | null = null;
  let justRenderedSectionTitle = false;

  const flushTabBuffer = () => {
    if (tabBuffer !== null) {
      result.push('<span class="tablatura"><span class="cnt">' + tabBuffer.join('\n') + '</span></span>');
      tabBuffer = null;
    }
  };

  for (const line of doc.lines) {
    if (line.type === 'tab') {
      if (tabBuffer === null) tabBuffer = [];
      tabBuffer.push(escapeHtml(line.content));
      justRenderedSectionTitle = false;
      continue;
    }

    flushTabBuffer();

    switch (line.type) {
      case 'lyrics':
        result.push(renderLyricsLine(line));
        justRenderedSectionTitle = false;
        break;
      case 'comment':
        result.push('<span class="section-title">' + escapeHtml(translateSectionTitle(line.text)) + '</span>');
        justRenderedSectionTitle = true;
        break;
      case 'empty':
        // A blank line directly under a section title is a scraper artifact
        // (some source markup has one, some doesn't) rather than intentional
        // spacing -- skip it so section titles render with consistent
        // spacing regardless of which convention the source used.
        if (justRenderedSectionTitle) continue;
        result.push('');
        break;
      case 'directive':
        // Unknown directives have no established rendering — skip silently
        // rather than leaking raw `{name: value}` text into the output.
        break;
      default:
        break;
    }
  }

  flushTabBuffer();

  return result.join('\n');
}

/**
 * Converts ChordPro-formatted text (`[G]Saying I [C]love you`,
 * `{comment: Intro}`, `{start_of_tab}`/`{end_of_tab}` blocks) into the raw
 * HTML shape consumed by `ChordSheetPre` / `processHtml`.
 */
export function chordProToRawHtml(chordProText: string): string {
  const doc = parseChordPro(chordProText);
  return renderDocument(doc);
}
