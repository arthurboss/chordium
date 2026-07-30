export function removeTabsFromHtml(html: string): string {
  let result = html.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
  result = result.replace(/(​|&ZeroWidthSpace;)/g, '');

  // Remove tab-only section titles (e.g. "Tab - Solo Final") — they only label
  // a tab block, which is now gone.
  result = result.replace(/<span class="section-title">\s*[Tt]ab\b[^<]*<\/span>\n*/g, '');

  // Remove standalone tab-part labels ("Parte 1 de 3") left over from tab blocks.
  result = result.replace(/^[ \t]*Parte \d+ de \d+[ \t]*$\n?/gm, '');

  // Remove orphaned tab-string lines (e.g. "E|-----|") that sit outside a
  // tablatura span, optionally wrapped in a tab-info span.
  result = result.replace(/^(?:<span class="tab-info">)?[ \t]*[EADGBe]\|[-\d][^\n]*$\n?/gm, '');

  result = result.replace(/<span class="section-title">[^<]*<\/span>\n+(?=\s*(?:<span class="section-title">|$))/g, '');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
  result = result.replace(/^\n+/, '');
  return result;
}
