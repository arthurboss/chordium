import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChordSheet, SongMetadata } from '@chordium/types';
import { encodeChordSheet, buildJamUrl, buildPlainSongUrl } from '@/utils/chordSheetQR';
import { chooseJamShare, type JamShareMode } from '@/utils/jam-qr-capacity';
import { toast } from 'sonner';

type ShareableChordSheet = ChordSheet & SongMetadata;

interface JamShareQRProps {
  chordSheet: ShareableChordSheet;
  /**
   * The simplified arrangement, when the displayed one is the full version.
   * Used as a smaller fallback if the displayed arrangement will not fit.
   */
  simplifiedChordSheet?: ShareableChordSheet;
  /** Route of the song, for the link-only fallback. */
  songPath: string;
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Modern Clipboard API (HTTPS / localhost only)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }
  return false;
}

/**
 * QR code and copyable link for the chord sheet on screen.
 *
 * A QR code cannot hold an arbitrarily long song, so the payload degrades:
 * the displayed arrangement, else the simplified one, else a plain link that
 * needs a connection. Without this the encoder throws `RangeError: Data too
 * long` and takes the page down with it.
 */
export function JamShareQR({ chordSheet, simplifiedChordSheet, songPath }: JamShareQRProps) {
  const [jamUrl, setJamUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<JamShareMode>('displayed');
  const [isEncoding, setIsEncoding] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const encode = useCallback(async () => {
    setIsEncoding(true);
    try {
      const displayedUrl = buildJamUrl(
        await encodeChordSheet(chordSheet),
        chordSheet.artist,
        chordSheet.title
      );
      const simplifiedUrl = simplifiedChordSheet
        ? buildJamUrl(
            await encodeChordSheet(simplifiedChordSheet),
            simplifiedChordSheet.artist,
            simplifiedChordSheet.title
          )
        : undefined;

      const choice = chooseJamShare({
        displayedUrl,
        simplifiedUrl,
        plainUrl: buildPlainSongUrl(songPath),
      });
      setMode(choice.mode);
      setJamUrl(choice.url);
    } catch {
      toast.error(t('jamSession.qrFailed'));
    } finally {
      setIsEncoding(false);
    }
  }, [chordSheet, simplifiedChordSheet, songPath, t]);

  // Encode on mount, and again whenever the song content changes.
  useEffect(() => {
    encode();
  }, [encode]);

  const handleCopy = async () => {
    if (!jamUrl) return;

    // Try modern Clipboard API first (works on HTTPS)
    const ok = await copyToClipboard(jamUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('jamSession.linkCopied'));
      return;
    }

    // On HTTP: select the visible input and run execCommand on it directly.
    // execCommand requires the element to be focused and selected in the DOM.
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
    input.setSelectionRange(0, jamUrl.length);
    const didCopy = document.execCommand('copy');
    if (didCopy) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('jamSession.linkCopied'));
    } else {
      toast.info(t('jamSession.pressToCopy'));
    }
  };

  const handleInputClick = () => {
    inputRef.current?.select();
    inputRef.current?.setSelectionRange(0, jamUrl?.length ?? 0);
  };

  if (isEncoding || !jamUrl) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('jamSession.generatingQr')}</p>
      </div>
    );
  }

  const captions: Record<JamShareMode, string> = {
    displayed: t('jamSession.scanToLoad', { title: chordSheet.title }),
    simplified: t('jamSession.scanToLoadSimplified', { title: chordSheet.title }),
    link: t('jamSession.scanToOpenOnline', { title: chordSheet.title }),
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="rounded-lg border bg-white p-4">
        <QRCodeSVG value={jamUrl} size={240} level="M" includeMargin={false} />
      </div>

      <p className="text-sm text-center text-muted-foreground px-2">{captions[mode]}</p>

      <div className="flex gap-2 w-full">
        <input
          ref={inputRef}
          readOnly
          value={jamUrl}
          onClick={handleInputClick}
          className="flex-1 min-w-0 text-xs font-mono px-2 py-1.5 rounded-sm border bg-muted text-muted-foreground cursor-text"
          aria-label={t('jamSession.shareableLink')}
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0"
          onClick={handleCopy}
          title={t('jamSession.copy')}
        >
          {copied
            ? <Check className="h-4 w-4 text-green-600" />
            : <Copy className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
}
