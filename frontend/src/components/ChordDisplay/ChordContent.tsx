import React from 'react';
import { ChordContentProps } from './types';
import { useContainerColumns } from './useContainerColumns';
import { processTabBlocks } from './tab-splitting';
import { songChordsToRawHtml } from './song-chords-to-raw-html';

const TABLATURA_SEPARATOR = /(<\/span><\/span>)\n(?=<span class="tablatura">)/g;
const CNT_SEPARATOR = /\n(?=<span class="cnt">)/g;

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

  if (viewMode === 'tabs-off' && processedHtml) {
    processedHtml = processedHtml.replace(/<span class="tablatura"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, '');
    processedHtml = processedHtml.replace(/(​|&ZeroWidthSpace;)/g, '');
    processedHtml = processedHtml.replace(/<span class="section-title">[^<]*<\/span>\n(?=\s*(?:<span class="section-title">|$))/g, '');
    processedHtml = processedHtml.replace(/^\n+|\n\n\n+/g, '\n');
    processedHtml = processedHtml.replace(/\n+(<span class="section-title">[^<]*<\/span>)\n+/g, '\n\n$1\n');
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
