export function trimPureChordLineIndent(html: string): string {
  return html
    .split('\n')
    .map(line => {
      if (line.trimStart() === line) return line;
      const stripped = line.replace(/<b>[^<]*<\/b>/g, '').trimStart();
      return stripped === '' && /<b>/.test(line) ? line.trimStart() : line;
    })
    .join('\n');
}
