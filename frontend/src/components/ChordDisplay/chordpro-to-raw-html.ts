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
 * Renders a `ChordProLine` of type 'lyrics' as one or two HTML lines: a
 * chord-position line (chords wrapped in `<b>`, placed above the syllable
 * they annotate) followed by the plain lyric line -- the classic aligned
 * look every other part of the render pipeline (`trimPureChordLineIndent`,
 * `removeChordsForLyricsOnly`, tab-splitting) already expects. A line with
 * no chords at all renders as just the lyric text, unchanged.
 */
function renderLyricsLine(line: Extract<ChordProLine, { type: 'lyrics' }>): string {
  const { lyric, chords } = toPlainLyricAndChordColumns(line);
  const escapedLyric = escapeHtml(lyric);
  if (chords.length === 0) return escapedLyric;

  const chordLineText = renderChordLineText(chords);
  const chordLineHtml = escapeHtml(chordLineText).replace(
    /\S+/g,
    (chord) => `<b>${chord}</b>`
  );
  // A chord-only line (e.g. "[G]  [G/B]  [C9]") has no real lyric text --
  // just the whitespace that separated the chord brackets. Emitting that as
  // a second line renders a blank row with nothing on it.
  if (lyric.trim() === '') return chordLineHtml;
  return chordLineHtml + '\n' + escapedLyric;
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
