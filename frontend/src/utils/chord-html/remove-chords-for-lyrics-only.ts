export function removeChordsForLyricsOnly(html: string): string {
  let result = html
    .split('\n')
    .map(line => {
      const stripped = line.replace(/<b>[^<]*<\/b>/g, '').trimStart();
      if (/<b>/.test(line) && /^[\s()\[\]]*$/.test(stripped)) return null;
      return stripped;
    })
    .filter(line => line !== null)
    .join('\n');

  result = result.replace(/(<span class="section-title">[^<]*<\/span>\n+)+(<span class="section-title">)/g, '$2');
  result = result.replace(/(<span class="section-title">[^<]*<\/span>\n*)+$/, '');
  result = result.replace(/\n(<span class="section-title">)/g, '\n\n$1');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/^\n+/, '');
  return result;
}
