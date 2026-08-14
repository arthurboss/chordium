interface ChordSheetPreProps {
  html: string;
  fontFamily: string | undefined;
}

/**
 * Renders processed chord-sheet HTML inside a `<pre>` tag.
 * Uses `dangerouslySetInnerHTML` because the HTML comes from a trusted internal
 * pipeline (scraper → processHtml) and must preserve whitespace exactly.
 *
 * The size is left to the stylesheet rather than set here: an inline size would
 * outrank any rule, including the one fullscreen uses to fit the words to the width.
 */
export function ChordSheetPre({ html, fontFamily }: ChordSheetPreProps) {
  return (
    <pre
      className="font-inherit whitespace-pre-wrap break-words"
      style={{ fontFamily: fontFamily ?? 'inherit', letterSpacing: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
