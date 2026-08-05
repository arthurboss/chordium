import React, { useMemo } from 'react';
import { parseChordPro } from '@/utils/chordpro/parse';
import type { ChordProLine } from '@/utils/chordpro/types';

interface ChordProPreviewProps {
  text: string;
}

/**
 * Renders one `{type: 'lyrics'}` line as safe React elements: each chord in
 * a `<span className="chord">` (matching the `.chord` styling used elsewhere
 * for rendered chord tags) and each lyric run as a plain text node (React
 * escapes text nodes automatically).
 */
function LyricsLine({ line }: { line: Extract<ChordProLine, { type: 'lyrics' }> }) {
  return (
    <div className="chord-line">
      {line.segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.chord !== undefined && <span className="chord">{segment.chord}</span>}
          {segment.lyric}
        </React.Fragment>
      ))}
    </div>
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
      continue;
    }
    flush();
    items.push({ kind: 'line', line });
  }
  flush();

  return items;
}

/**
 * Live preview of ChordPro-formatted text, rendered as safe React elements
 * (no `dangerouslySetInnerHTML`) since this is actively-typed user input.
 * Companion to `chordpro-to-raw-html.ts`, which produces the equivalent
 * trusted HTML string for the read-only render pipeline.
 */
export default function ChordProPreview({ text }: ChordProPreviewProps) {
  const doc = useMemo(() => parseChordPro(text), [text]);
  const items = useMemo(() => groupTabBlocks(doc.lines), [doc]);

  return (
    <div className="chordpro-preview">
      {items.map((item, index) => {
        if (item.kind === 'tab-block') {
          return (
            <pre key={index} className="tablatura whitespace-pre font-mono text-sm">
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
