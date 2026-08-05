import type { ChordProDocument, ChordProLine } from '@/utils/chordpro/types';
import { parseChordPro } from '@/utils/chordpro/parse';
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

function renderLyricsLine(line: Extract<ChordProLine, { type: 'lyrics' }>): string {
  return line.segments
    .map((segment) => {
      const chordHtml = segment.chord !== undefined ? `<b>${escapeHtml(segment.chord)}</b>` : '';
      return chordHtml + escapeHtml(segment.lyric);
    })
    .join('');
}

/**
 * Converts a parsed ChordProDocument into the same HTML shape the legacy
 * `songChordsToRawHtml` converter produces, so downstream `processHtml` /
 * `chord-html/*` / `tab-splitting.ts` transforms keep working unchanged:
 * - chords wrapped in `<b>...</b>`
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
      continue;
    }

    flushTabBuffer();

    switch (line.type) {
      case 'lyrics':
        result.push(renderLyricsLine(line));
        break;
      case 'comment':
        result.push('<span class="section-title">' + escapeHtml(translateSectionTitle(line.text)) + '</span>');
        break;
      case 'empty':
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
