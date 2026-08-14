const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Pairs every sung line with its translation, as chord HTML so the translated lines
 * can be told apart and coloured.
 *
 * Both translators work a line at a time and put the blank lines back afterwards, so
 * the two texts hold the same sung lines in the same order. Pairing walks that order
 * rather than trusting line numbers to match, since a run of blank lines can be
 * collapsed on the way through and would put every later line against the wrong one.
 */
export function interleaveTranslation(original: string, translated: string): string {
  const pending = translated.split('\n').filter((line) => line.trim());

  return original
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '';
      const counterpart = pending.shift();
      const sung = escapeHtml(line);
      // Running out means the two texts disagree on how many lines they have, and
      // the words alone are worth more than the words against the wrong translation.
      if (!counterpart) return sung;
      return `${sung}\n<span class="lyrics-translation">${escapeHtml(counterpart)}</span>`;
    })
    .join('\n');
}
