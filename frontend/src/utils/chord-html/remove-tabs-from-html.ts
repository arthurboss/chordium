export function removeTabsFromHtml(html: string): string {
  // Remove each "Tab - <title>" section wholesale: header, chord annotations,
  // "Parte N de M" labels, dash lines, fret-hand arrows — everything up to
  // the next header or the end of the content. Stripping only the specific
  // tab artifacts (below) left chord-annotation lines behind with no header,
  // which reads as broken content rather than a hidden section.
  let result = html.replace(/<span class="section-title">\s*[Tt]ab\b[^<]*<\/span>[\s\S]*?(?=<span class="section-title">|$)/g, '');

  // Fallback for content scraped before every tab run was guaranteed a
  // "Tab -" header: strip the tab artifacts piecemeal wherever they still
  // appear outside of one.
  result = result.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
  result = result.replace(/(​|&ZeroWidthSpace;)/g, '');
  result = result.replace(/<span class="section-title">\s*[Tt]ab\b[^<]*<\/span>\n*/g, '');

  // Remove standalone tab-part labels ("Parte 1 de 3") left over from tab blocks.
  // The source capitalizes "de" inconsistently ("Parte 01 De 04" vs "Parte 02 de 04").
  result = result.replace(/^[ \t]*Parte \d+ [Dd]e \d+[ \t]*$\n?/gm, '');

  // Remove orphaned tab-string lines (e.g. "E|-----|") that sit outside a
  // tablatura span, optionally wrapped in a tab-info span.
  result = result.replace(/^(?:<span class="tab-info">)?[ \t]*[EADGBe]\|[-\d][^\n]*$\n?/gm, '');

  // Remove orphaned fret-hand direction indicator rows (e.g. "↓  ↑ ↓") that
  // sit outside a tablatura span, right below the tab lines they annotate.
  result = result.replace(/^[ \t]*[↓↑][ \t↓↑]*$\n?/gm, '');

  result = result.replace(/<span class="section-title">[^<]*<\/span>\n+(?=\s*(?:<span class="section-title">|$))/g, '');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
  result = result.replace(/^\n+/, '');
  return result;
}
