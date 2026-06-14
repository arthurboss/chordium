const TABLATURA_SEPARATOR = /(<\/span><\/span>)\n(?=<span class="tablatura">)/g;
const CNT_SEPARATOR = /\n(?=<span class="cnt">)/g;

export function normalizeZeroWidthSpaces(html: string): string {
  return html
    .replace(TABLATURA_SEPARATOR, '$1​')
    .replace(CNT_SEPARATOR, '')
    .replace(/​{2,}/g, '​')
    .replace(/(&ZeroWidthSpace;){2,}/g, '&ZeroWidthSpace;');
}
