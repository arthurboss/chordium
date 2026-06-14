const MIN_CONTINUATION = 8;

function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, '');
}

function getStringPrefix(plain: string): string {
  const match = plain.match(/^([A-Ga-g]#?\|)/);
  return match ? match[1] : '';
}

function sliceHtmlByPlainIndex(html: string, start: number, end: number): string {
  let plainIdx = 0;
  let resultStart = -1;
  let resultEnd = html.length;
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    if (html[i] === '<') {
      inTag = true;
      continue;
    }
    if (html[i] === '>') {
      inTag = false;
      continue;
    }
    if (inTag) continue;

    if (plainIdx === start && resultStart === -1) {
      resultStart = i;
      while (resultStart > 0 && html[resultStart - 1] === '>') {
        const tagStart = html.lastIndexOf('<', resultStart - 1);
        if (tagStart >= 0) resultStart = tagStart;
        else break;
      }
    }
    if (plainIdx === end) {
      resultEnd = i;
      break;
    }
    plainIdx++;
  }

  if (resultStart === -1) return '';

  let slice = html.substring(resultStart, resultEnd);
  const opens = (slice.match(/<b>/g) || []).length;
  const closes = (slice.match(/<\/b>/g) || []).length;
  for (let i = 0; i < opens - closes; i++) {
    slice += '</b>';
  }
  const leadingCloses = (slice.match(/^(<\/b>)/g) || []).length;
  for (let i = 0; i < leadingCloses; i++) {
    slice = '<b>' + slice;
  }

  return slice;
}

function splitTabBlock(tabContent: string, maxCols: number): string {
  const lines = tabContent.split('\n');
  if (lines.length === 0 || maxCols <= 0) return tabContent;

  const plainLines = lines.map(l => stripHtmlTags(l));
  const maxLen = Math.max(...plainLines.map(l => l.length));

  if (maxLen <= maxCols) return tabContent;

  const prefixes = plainLines.map(l => getStringPrefix(l));
  const maxPrefixLen = Math.max(...prefixes.map(p => p.length));

  const continuationCols = maxCols - maxPrefixLen;

  const rawRemainder = maxLen - maxCols;
  const firstChunkCols = (rawRemainder > 0 && rawRemainder < MIN_CONTINUATION)
    ? maxLen - MIN_CONTINUATION
    : maxCols;

  const result: string[] = [];
  let col = 0;
  let isFirst = true;

  while (col < maxLen) {
    const chunkCols = isFirst ? firstChunkCols : continuationCols;
    const remaining = maxLen - (col + chunkCols);
    const chunkEnd = (remaining > 0 && remaining < MIN_CONTINUATION) ? maxLen : col + chunkCols;
    const chunk: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const plain = plainLines[i];
      if (plain.length <= col) {
        chunk.push('');
        continue;
      }

      let sliced = sliceHtmlByPlainIndex(lines[i], col, chunkEnd);
      if (!isFirst && prefixes[i]) {
        sliced = prefixes[i] + sliced;
      }
      chunk.push(sliced);
    }

    while (chunk.length > 0 && chunk[chunk.length - 1].trim() === '') {
      chunk.pop();
    }

    if (chunk.some(l => l.trim() !== '')) {
      result.push(chunk.join('\n'));
    }

    col = chunkEnd;
    isFirst = false;
  }

  return result.join('\n\n');
}

export function processTabBlocks(html: string, maxCols: number): string {
  if (maxCols <= 0) return html;

  return html.replace(
    /(<span class="cnt">)([\s\S]*?)(<\/span>)/g,
    (_match, openTag, content, closeTag) => {
      return openTag + splitTabBlock(content, maxCols) + closeTag;
    }
  );
}
