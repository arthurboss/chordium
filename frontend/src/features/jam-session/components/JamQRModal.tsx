import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Loader2, Copy, Check } from 'lucide-react';
import type { ChordSheet, SongMetadata } from '@chordium/types';
import { encodeChordSheet, buildJamUrl } from '@/utils/chordSheetQR';
import { toast } from 'sonner';

interface JamQRModalProps {
  chordSheet: ChordSheet & SongMetadata;
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

export function JamQRModal({ chordSheet }: JamQRModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jamUrl, setJamUrl] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const encode = useCallback(async () => {
    setIsEncoding(true);
    try {
      const encoded = await encodeChordSheet(chordSheet);
      setJamUrl(buildJamUrl(encoded, chordSheet.artist, chordSheet.title));
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setIsEncoding(false);
    }
  }, [chordSheet]);

  useEffect(() => {
    if (isOpen && !jamUrl) {
      encode();
    }
  }, [isOpen, jamUrl, encode]);

  // Re-encode when chord sheet changes while modal is open
  useEffect(() => {
    if (isOpen) {
      setJamUrl(null);
      encode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chordSheet.songChords, chordSheet.title, chordSheet.artist]);

  const handleCopy = async () => {
    if (!jamUrl) return;

    // Try modern Clipboard API first (works on HTTPS)
    const ok = await copyToClipboard(jamUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
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
      toast.success('Link copied');
    } else {
      toast.info('Press Cmd+C / Ctrl+C to copy');
    }
  };

  const handleInputClick = () => {
    inputRef.current?.select();
    inputRef.current?.setSelectionRange(0, jamUrl?.length ?? 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-10 w-10 rounded-full"
          aria-label="Start Jam — share chord sheet via QR"
          title="Start Jam"
        >
          <QrCode className="h-4 w-4" />
          
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw_-_2rem)] sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Share Chord Sheet</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {isEncoding || !jamUrl ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generating QR code…</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border bg-white p-4">
                <QRCodeSVG
                  value={jamUrl}
                  size={240}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <p className="text-sm text-center text-muted-foreground px-2">
                Scan to load <strong>{chordSheet.title}</strong> on another device.
                Works offline — no internet needed.
              </p>

              <div className="flex gap-2 w-full">
                <input
                  ref={inputRef}
                  readOnly
                  value={jamUrl}
                  onClick={handleInputClick}
                  className="flex-1 min-w-0 text-xs font-mono px-2 py-1.5 rounded border bg-muted text-muted-foreground cursor-text"
                  aria-label="Shareable jam link"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  {copied
                    ? <Check className="h-4 w-4 text-green-600" />
                    : <Copy className="h-4 w-4" />
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
