interface ChordSheetPreProps {
  html: string;
  fontFamily: string | undefined;
}

/**
 * Renders processed chord-sheet HTML inside a `<pre>` tag.
 * Uses `dangerouslySetInnerHTML` because the HTML comes from a trusted internal
 * pipeline (scraper → processHtml) and must preserve whitespace exactly.
 */
export function ChordSheetPre({ html, fontFamily }: ChordSheetPreProps) {
  return (
    <pre
      className="font-inherit whitespace-pre-wrap break-words"
      style={{ fontFamily: fontFamily ?? 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
