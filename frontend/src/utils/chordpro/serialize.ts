import type { ChordProDocument, ChordProLine } from './types';

/**
 * Serializes a single lyrics line's segments back into ChordPro's inline
 * `[chord]lyric[chord]lyric...` form.
 */
function serializeLyricsLine(line: Extract<ChordProLine, { type: 'lyrics' }>): string {
  return line.segments
    .map((segment) => (segment.chord !== undefined ? `[${segment.chord}]${segment.lyric}` : segment.lyric))
    .join('');
}

/**
 * Serializes a ChordProDocument back into ChordPro text. Inverse of `parseChordPro`.
 */
export function serializeChordPro(doc: ChordProDocument): string {
  const outputLines: string[] = [];
  let insideTab = false;

  for (const line of doc.lines) {
    if (line.type === 'tab') {
      if (!insideTab) {
        outputLines.push('{start_of_tab}');
        insideTab = true;
      }
      outputLines.push(line.content);
      continue;
    }

    if (insideTab) {
      outputLines.push('{end_of_tab}');
      insideTab = false;
    }

    switch (line.type) {
      case 'comment':
        outputLines.push(`{comment: ${line.text}}`);
        break;
      case 'directive':
        outputLines.push(line.value !== undefined ? `{${line.name}: ${line.value}}` : `{${line.name}}`);
        break;
      case 'empty':
        outputLines.push('');
        break;
      case 'lyrics':
        outputLines.push(serializeLyricsLine(line));
        break;
      default:
        break;
    }
  }

  if (insideTab) {
    outputLines.push('{end_of_tab}');
  }

  return outputLines.join('\n');
}
