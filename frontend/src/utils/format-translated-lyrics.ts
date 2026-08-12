export function formatSingleScreenLyrics(original: string, translated: string): string {
  const originalLines = original.split(n);
  const translatedLines = translated.split(n);
  
  const lines = [];
  const maxLines = Math.max(originalLines.length, translatedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || ;
    const transLine = translatedLines[i] || ;
    
    if (origLine.trim()) {
      lines.push(origLine);
      if (transLine.trim() && transLine !== origLine) {
        lines.push(`<span class="text-primary font-medium">${transLine}</span>`);
      }
    } else if (transLine.trim()) {
      lines.push(`<span class="text-primary font-medium">${transLine}</span>`);
    }
  }
  
  return lines.join(n);
}
