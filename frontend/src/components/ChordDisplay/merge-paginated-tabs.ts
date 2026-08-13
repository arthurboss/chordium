/**
 * A tab block, with whatever single span the source put in front of its content: a part
 * label, a heading, or nothing at all. All three shapes occur.
 */
const TAB_BLOCK =
  /<span class="tablatura">((?:<span class="(?:tab-info|section-title)">[^<]*<\/span>\s*)?)<span class="cnt">([\s\S]*?)<\/span><\/span>/g;

const HEADING = /^<span class="section-title">/;
const STRING_PREFIX = /^[EBGDAe]\|/;

// Zero-width characters survive in the scraped markup and are not whitespace as far as
// trim() is concerned, so they have to be discounted before asking what sits between
// two blocks.
const INVISIBLE = /[\u200B-\u200D\uFEFF]/g;

const plain = (line: string) => line.replace(/<[^>]*>/g, '').replace(INVISIBLE, '').trim();

/**
 * Which string each row draws, or a full stop for the rows that draw none, such as the
 * chords written above the tab.
 *
 * Rows are joined by position, so two blocks may only be joined when their rows line up:
 * one block carrying a chord row the next one lacks would otherwise append a string onto
 * the chords and leave the tab a row out for the rest of the song.
 */
function layout(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      const text = plain(line);
      return STRING_PREFIX.test(text) ? text[0] : '.';
    })
    .join('');
}

/**
 * Joins one block onto another, row by row. A continuation repeats the string name it
 * carries on ("E|"), which has to go so each string reads as one run rather than starting
 * over partway across. Rows are padded to the block's own width first, since a row that
 * stops short would otherwise pull everything after it out of column.
 */
function append(base: string[], addition: string[]): string[] {
  const width = Math.max(...base.map((row) => row.length), 0);
  const height = Math.max(base.length, addition.length);
  const joined: string[] = [];
  for (let row = 0; row < height; row++) {
    const left = (base[row] ?? '').padEnd(width, ' ');
    const right = (addition[row] ?? '').replace(STRING_PREFIX, '');
    joined.push(left + right);
  }
  return joined;
}

/**
 * Rejoins tab blocks the source had already cut into pieces.
 *
 * The source paginates a long tab to its own page width, which says nothing about the
 * width it will be read at here: left alone the pieces stay as narrow as that page,
 * wasting the room fullscreen has and asking the reader to jump between a piece and its
 * continuation. Joined back into one run, the tab can be divided again for the width
 * actually available, which is what processTabBlocks then does.
 *
 * The pieces are recognised by where they sit rather than by their labels, because the
 * labels cannot be trusted: they vary in case, sometimes lose their number altogether,
 * and plenty of continuation pieces carry none at all. Two blocks are the same tab when
 * nothing but space separates them and they draw the same number of strings; a heading
 * between them means a new tab has started, and ends the run.
 */
export function mergePaginatedTabs(html: string): string {
  const blocks = Array.from(html.matchAll(TAB_BLOCK));
  if (blocks.length < 2) return html;

  let result = '';
  let cursor = 0;
  let index = 0;

  while (index < blocks.length) {
    const first = blocks[index];
    const shape = layout(first[2]);
    const run = [first];

    while (index + run.length < blocks.length) {
      const previous = run[run.length - 1];
      const next = blocks[index + run.length];
      const between = html.slice((previous.index ?? 0) + previous[0].length, next.index ?? 0);
      // Anything at all between them belongs to the song and must not be swallowed.
      if (between.replace(INVISIBLE, '').trim()) break;
      // A heading introduces a new tab rather than continuing this one.
      if (HEADING.test(next[1])) break;
      // Rows that do not line up cannot be joined by position.
      if (layout(next[2]) !== shape) break;
      run.push(next);
    }

    if (run.length < 2) {
      index++;
      continue;
    }

    const merged = run.map((block) => block[2].split('\n')).reduce(append);
    // The first block's heading is kept; part labels describe a division that no longer
    // exists once the pieces are one run.
    const heading = HEADING.test(first[1]) ? first[1] : '';
    const last = run[run.length - 1];

    result += html.slice(cursor, first.index ?? 0);
    result += `<span class="tablatura">${heading}<span class="cnt">${merged.join('\n')}</span></span>`;
    cursor = (last.index ?? 0) + last[0].length;
    index += run.length;
  }

  return result + html.slice(cursor);
}
