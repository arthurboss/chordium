import React from 'react';
import { ChordContentProps } from './types';
import { useContainerColumns } from './useContainerColumns';
import { processTabBlocks } from './tab-splitting';
import { songChordsToRawHtml } from './song-chords-to-raw-html';

const TABLATURA_SEPARATOR = /(<\/span><\/span>)\n(?=<span class="tablatura">)/g;
const CNT_SEPARATOR = /\n(?=<span class="cnt">)/g;
const SECTION_TITLE_RE = /<span class="section-title">[^<]*<\/span>/g;

function removeTabsFromHtml(html: string): string {
  let result = html.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
  result = result.replace(/(​|&ZeroWidthSpace;)/g, '');
  result = result.replace(/<span class="section-title">[^<]*<\/span>\n(?=\s*(?:<span class="section-title">|$))/g, '');
  result = result.replace(/^\n+|\n\n\n+/g, '\n');
  result = result.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
  result = result.replace(/^\n+/, '');
  return result;
}

const ChordContent: React.FC<ChordContentProps> = ({
  rawHtml,
  songChords,
  fontSize,
  fontSpacing,
  fontStyle,
  isLoading,
  viewMode = 'chords',
}) => {
  const { containerRef, maxCols } = useContainerColumns(rawHtml);

  let fontFamily: string | undefined = undefined;
  if (fontStyle === 'serif') fontFamily = 'serif';
  else if (fontStyle === 'sans-serif') fontFamily = 'system-ui, sans-serif';
  else if (fontStyle === 'monospace') fontFamily = 'monospace';

  const sourceHtml = rawHtml ?? (songChords ? songChordsToRawHtml(songChords) : undefined);

  let processedHtml = sourceHtml
    ? sourceHtml.replace(TABLATURA_SEPARATOR, '$1​').replace(CNT_SEPARATOR, '').replace(/​{2,}/g, '​').replace(/(&ZeroWidthSpace;){2,}/g, '&ZeroWidthSpace;')
    : undefined;

  if ((viewMode === 'tabs-off' || viewMode === 'lyrics-only') && processedHtml) {
    processedHtml = removeTabsFromHtml(processedHtml);
  }

  if (viewMode === 'lyrics-only' && processedHtml) {
    // Remove <b> tags (chords) entirely
    processedHtml = processedHtml.replace(/<b>[^<]*<\/b>/g, '');
    // Trim leading whitespace (chord alignment artifacts) and drop empty lines
    processedHtml = processedHtml
      .split('\n')
      .map(line => line.trimStart())
      .filter(line => line !== '')
      .join('\n');
    // Remove section titles immediately followed by another section title or end of string
    // (sections that had only chords and are now empty)
    processedHtml = processedHtml.replace(/(<span class="section-title">[^<]*<\/span>\n)+(<span class="section-title">)/g, '$2');
    processedHtml = processedHtml.replace(/(<span class="section-title">[^<]*<\/span>\n?)+$/, '');
    // Ensure exactly one blank line before each section title; strip any leading newline
    processedHtml = processedHtml.replace(/\n(<span class="section-title">)/g, '\n\n$1');
    processedHtml = processedHtml.replace(/^\n+/, '');
  }

  if (processedHtml && maxCols > 0) {
    processedHtml = processTabBlocks(processedHtml, maxCols);
  }

  const preStyle = { fontFamily: fontFamily ?? 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' };

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p className="text-sm">Loading chord content...</p>
      </div>
    );
  } else if (processedHtml) {
    content = (
      <pre
        className="font-inherit whitespace-pre-wrap break-words"
        style={preStyle}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  } else {
    content = (
      <div className="text-center py-8 text-muted-foreground">
        No chord content to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="chord-content-card bg-white dark:bg-[--card] mb-4 px-4 py-6 sm:px-6 rounded-lg shadow-sm border"
      style={{ "--content-font-size": `${fontSize}px`, letterSpacing: `${fontSpacing}em`, fontFamily } as React.CSSProperties}
    >
      {content}
    </div>
  );
};

export default ChordContent;
