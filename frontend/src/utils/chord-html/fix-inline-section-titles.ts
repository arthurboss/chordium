export function fixInlineSectionTitles(html: string): string {
  return html.replace(/(<span class="section-title">[^<]*<\/span>) +([^\n])/g, '$1\n$2');
}
