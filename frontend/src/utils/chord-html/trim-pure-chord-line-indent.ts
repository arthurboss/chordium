function isPureChordLine(line: string): boolean {
  const stripped = line.replace(/<b>[^<]*<\/b>/g, '').trimStart();
  return stripped === '' && /<b>/.test(line);
}

/**
 * A pure chord line immediately above a real lyric line is a chord-position
 * row -- its leading whitespace is meaningful column alignment (e.g. a chord
 * placed mid-word) and must be preserved. Only an indented chord line with no
 * paired lyric below it (a standalone instrumental line, or the last line of
 * the sheet) has meaningless indentation left over from the source markup.
 */
export function trimPureChordLineIndent(html: string): string {
  const lines = html.split('\n');
  return lines
    .map((line, index) => {
      if (line.trimStart() === line) return line;
      if (!isPureChordLine(line)) return line;
      const next = lines[index + 1];
      if (next !== undefined && next.trim() !== '' && !isPureChordLine(next)) return line;
      return line.trimStart();
    })
    .join('\n');
}
