import React, { useMemo } from 'react';
import { parseChordPro } from '@/utils/chordpro/parse';
import { toPlainLyricAndChordColumns, renderChordLineText } from '@/utils/chordpro/layout';
import type { ChordProLine } from '@/utils/chordpro/types';

interface ChordProPreviewProps {
  text: string;
}

/**
 * Renders one `{type: 'lyrics'}` line as safe React elements, matching the
 * read-only display's classic look: a chord-position row (each chord in a
 * `<span className="chord">`, placed above the syllable it annotates via
 * the same column math as `chordpro-to-raw-html.ts`) followed by the plain
 * lyric row. A line with no chords renders as just the lyric row.
 */
function LyricsLine({ line }: { line: Extract<ChordProLine, { type: 'lyrics' }> }) {
  const { lyric, chords } = toPlainLyricAndChordColumns(line);

  if (chords.length === 0) {
    return <div className="lyrics-line">{lyric}</div>;
  }

  const chordLineText = renderChordLineText(chords);
  // Split the chord-position text into alternating runs of whitespace and
  // chord tokens so each token becomes its own <span className="chord">
  // while inter-chord spacing renders as plain text (preserving alignment).
  const tokens = chordLineText.split(/(\S+)/g).filter((t) => t !== '');

  const chordRow = (
    <div className="chord-line">
      {tokens.map((token, index) =>
        token.trim() === '' ? (
          <React.Fragment key={index}>{token}</React.Fragment>
        ) : (
          <span key={index} className="chord">
            {token}
          </span>
        )
      )}
    </div>
  );

  // A chord-only line (e.g. "[G]  [G/B]  [C9]") has no real lyric text --
  // just the whitespace that separated the chord brackets. Rendering that
  // as a second row shows a blank line with nothing on it.
  if (lyric.trim() === '') return chordRow;

  return (
    <>
      {chordRow}
      <div className="lyrics-line">{lyric}</div>
    </>
  );
}

/** A renderable unit: either a single ChordProLine, or a run of consecutive tab lines grouped into one block. */
type PreviewItem =
  | { kind: 'line'; line: ChordProLine }
  | { kind: 'tab-block'; content: string };

/**
 * Groups consecutive `{type: 'tab'}` lines into a single block so they
 * render inside one `<pre>` with whitespace preserved across lines,
 * mirroring how `chordpro-to-raw-html.ts` groups tab lines into one
 * `<span class="tablatura"><span class="cnt">` block for the read-only path.
 */
function groupTabBlocks(lines: ChordProLine[]): PreviewItem[] {
  const items: PreviewItem[] = [];
  let tabBuffer: string[] | null = null;
  let justSawSectionTitle = false;

  const flush = () => {
    if (tabBuffer !== null) {
      items.push({ kind: 'tab-block', content: tabBuffer.join('\n') });
      tabBuffer = null;
    }
  };

  for (const line of lines) {
    if (line.type === 'tab') {
      if (tabBuffer === null) tabBuffer = [];
      tabBuffer.push(line.content);
      justSawSectionTitle = false;
      continue;
    }
    flush();
    // A blank line directly under a section title is a scraper artifact
    // (some source markup has one, some doesn't) rather than intentional
    // spacing -- skip it, matching chordpro-to-raw-html.ts's read-view fix.
    if (line.type === 'empty' && justSawSectionTitle) continue;
    justSawSectionTitle = line.type === 'comment';
    items.push({ kind: 'line', line });
  }
  flush();

  return items;
}

/**
 * Live preview of ChordPro-formatted text, rendered as safe React elements
 * (no `dangerouslySetInnerHTML`) since this is actively-typed user input.
 * Mirrors the exact layout `chordpro-to-raw-html.ts` produces for the
 * read-only render pipeline, so what you see while editing matches what
 * renders after saving.
 */
export default function ChordProPreview({ text }: ChordProPreviewProps) {
  const doc = useMemo(() => parseChordPro(text), [text]);
  const items = useMemo(() => groupTabBlocks(doc.lines), [doc]);

  return (
    <div className="chordpro-preview">
      {items.map((item, index) => {
        if (item.kind === 'tab-block') {
          return (
            <pre key={index} className="tablatura">
              {item.content}
            </pre>
          );
        }

        const { line } = item;
        switch (line.type) {
          case 'lyrics':
            return <LyricsLine key={index} line={line} />;
          case 'comment':
            return (
              <div key={index} className="section-header">
                {line.text}
              </div>
            );
          case 'empty':
            return <div key={index}>&nbsp;</div>;
          case 'directive':
            return null;
          default:
            return null;
        }
      })}
    </div>
  );
}
