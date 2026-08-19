const TAB_TITLE_REGEX = /^(?:tab|dedilhado)\b/i;

function isTabHeaderLine(line: string): boolean {
  const match = line.match(/<span class="section-title">\s*([^<]*)<\/span>/);
  return !!match && TAB_TITLE_REGEX.test(match[1].trim());
}

/**
 * Whether a line still belongs to a tab run in progress: dash-drawn tab
 * lines, "Parte N de M" labels, fret-hand direction rows, blank lines, or a
 * chord-only annotation line that itself precedes more tab content (as
 * opposed to one that precedes the section's real lyrics, which should stay).
 */
function isTabRunContinuation(lines: string[], i: number): boolean {
  const line = lines[i];
  const trimmed = line.trim();
  if (trimmed === '') return true;
  if (line.includes('<span class="tablatura">') || line.includes('<span class="cnt">') || line.includes('</span></span>')) {
    return true;
  }
  if (/Parte \d+ [Dd]e \d+/.test(line)) return true;
  if (/^[EBGDAe]\|[-\d]/.test(trimmed)) return true;
  if (/^[ \t]*[↓↑][ \t↓↑]*$/.test(line)) return true;
  if (/^(?:<b>[^<]*<\/b>\s*)+$/.test(trimmed)) {
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j >= lines.length) return false;
    const next = lines[j];
    return (
      next.includes('<span class="tablatura">') ||
      next.includes('<span class="cnt">') ||
      /Parte \d+ [Dd]e \d+/.test(next) ||
      /^[EBGDAe]\|[-\d]/.test(next.trim())
    );
  }
  return false;
}

export function removeTabsFromHtml(html: string): string {
  // Remove each "Tab -"/"Dedilhado -" section's tab run wholesale: the
  // header plus every line that's part of the tab run itself. Stops as soon
  // as it reaches genuine lyric/chord content instead of jumping to the next
  // header, since a section's real lyrics sometimes resume right after its
  // tab block with no header of their own separating the two (the source
  // shares one header, e.g. "[Primeira Parte]", between a leading tab block
  // and the lyrics that follow it) — removing "to the next header" would
  // have deleted those lyrics along with the tab.
  const lines = html.split('\n');
  const kept: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (isTabHeaderLine(lines[i])) {
      i++;
      while (i < lines.length && isTabRunContinuation(lines, i)) i++;
      continue;
    }
    kept.push(lines[i]);
    i++;
  }
  let result = kept.join('\n');

  // Fallback for a tablatura span with no governing "Tab -"/"Dedilhado -"
  // header at all (e.g. content scraped before every tab run was guaranteed
  // one) — strip the tab artifacts piecemeal wherever they still appear.
  result = result.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
  result = result.replace(/(​|&ZeroWidthSpace;)/g, '');
  result = result.replace(/<span class="section-title">\s*(?:[Tt]ab|[Dd]edilhado)\b[^<]*<\/span>\n*/g, '');
  result = result.replace(/^[ \t]*Parte \d+ [Dd]e \d+[ \t]*$\n?/gm, '');
  result = result.replace(/^(?:<span class="tab-info">)?[ \t]*[EADGBe]\|[-\d][^\n]*$\n?/gm, '');
  result = result.replace(/^[ \t]*[↓↑][ \t↓↑]*$\n?/gm, '');

  // A header now immediately followed by another header (or the end) is an
  // orphan left bare by the removal above — e.g. a section that was 100%
  // tab content has nothing left under its own header once the tab run is
  // gone, so drop it too.
  result = result.replace(/<span class="section-title">[^<]*<\/span>\n+(?=\s*(?:<span class="section-title">|$))/g, '');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
  result = result.replace(/^\n+/, '');
  return result;
}
