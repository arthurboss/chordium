export function removeTabsFromHtml(html: string): string {
  let result = html.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
  result = result.replace(/(​|&ZeroWidthSpace;)/g, '');
  result = result.replace(/<span class="section-title">[^<]*<\/span>\n+(?=\s*(?:<span class="section-title">|$))/g, '');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
  result = result.replace(/^\n+/, '');
  return result;
}
