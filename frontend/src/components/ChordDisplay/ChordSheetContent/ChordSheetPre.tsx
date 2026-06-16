interface ChordSheetPreProps {
  html: string;
  fontFamily: string | undefined;
}

export function ChordSheetPre({ html, fontFamily }: ChordSheetPreProps) {
  return (
    <pre
      className="font-inherit whitespace-pre-wrap break-words"
      style={{ fontFamily: fontFamily ?? 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
