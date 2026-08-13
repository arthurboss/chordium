const PAGINATED_TAB = /<span class="tablatura"><span class="tab-info">([^<]*)<\/span>\s*<span class="cnt">([\s\S]*?)<\/span><\/span>/g;

const STRING_PREFIX = /^[EBGDAe]\|/;

// Zero-width characters survive in the scraped markup and are not whitespace as far as
// trim() is concerned, so they have to be discounted before asking what sits between
// two parts.
const INVISIBLE = /[\u200B-\u200D\uFEFF]/g;

/** Reads "Parte 2 de 3" and the like as the pair of numbers it carries. */
function readLabel(label: string): { part: number; total: number } | null {
  const match = label.match(/(\d+)\D+(\d+)/);
  if (!match) return null;
  const [, part, total] = match;
  return { part: Number(part), total: Number(total) };
}

/**
 * Joins one part onto another, line for line. A continuation repeats the string name it
 * carries on ("E|"), which has to go so the strings read as one run rather than starting
 * over halfway across.
 */
function appendPart(base: string[], addition: string[]): string[] {
  const height = Math.max(base.length, addition.length);
  const joined: string[] = [];
  for (let row = 0; row < height; row++) {
    const left = base[row] ?? '';
    const right = (addition[row] ?? '').replace(STRING_PREFIX, '');
    joined.push(left + right);
  }
  return joined;
}

/**
 * Rejoins tab blocks the source had already cut into parts.
 *
 * The source paginates a long tab to its own page width and labels the pieces, which says
 * nothing about the width it will be read at here. Left alone the pieces stay as narrow as
 * that source page, wasting the room fullscreen has and asking the reader to jump between
 * "Parte 1 de 3" and its continuation. Joined back into one run, the tab can then be
 * divided again for the width actually available, which is what processTabBlocks does.
 */
export function mergePaginatedTabs(html: string): string {
  const blocks = Array.from(html.matchAll(PAGINATED_TAB));
  if (blocks.length < 2) return html;

  let result = '';
  let cursor = 0;
  let index = 0;

  while (index < blocks.length) {
    const first = blocks[index];
    const label = readLabel(first[1]);

    // Anything not announcing itself as part one of several is left exactly as it is.
    if (!label || label.total < 2 || label.part !== 1) {
      index++;
      continue;
    }

    // Collect the run only while the parts keep counting up to the total promised, and
    // only while they actually sit next to each other: anything else between two parts
    // belongs to the song and must not be swallowed by joining them.
    const run = [first];
    while (run.length < label.total && index + run.length < blocks.length) {
      const previous = run[run.length - 1];
      const next = blocks[index + run.length];
      const between = html.slice((previous.index ?? 0) + previous[0].length, next.index ?? 0);
      if (between.replace(INVISIBLE, '').trim()) break;
      const nextLabel = readLabel(next[1]);
      if (!nextLabel || nextLabel.total !== label.total || nextLabel.part !== run.length + 1) break;
      run.push(next);
    }
    if (run.length < 2) {
      index++;
      continue;
    }

    const merged = run
      .map((block) => block[2].split('\n'))
      .reduce((joined, part) => appendPart(joined, part));

    const last = run[run.length - 1];
    const start = first.index ?? 0;
    const end = (last.index ?? 0) + last[0].length;
    result += html.slice(cursor, start);
    result += `<span class="tablatura"><span class="cnt">${merged.join('\n')}</span></span>`;
    cursor = end;
    index += run.length;
  }

  return result + html.slice(cursor);
}
