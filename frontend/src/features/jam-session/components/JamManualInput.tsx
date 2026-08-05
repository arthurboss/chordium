import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JAM_QR_PREFIX } from '@/utils/chordSheetQR';
import { isChordiumJamUrl } from './jamScannerUtils';

interface JamManualInputProps {
  onNavigate: () => void;
}

export function JamManualInput({ onNavigate }: JamManualInputProps) {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGo = async () => {
    if (!value.trim()) return;

    const url = isChordiumJamUrl(value.trim());
    if (url) {
      onNavigate();
      navigate(`${url.pathname}?d=${encodeURIComponent(url.searchParams.get('d')!)}`);
      return;
    }

    const encoded = value.startsWith(JAM_QR_PREFIX) ? value : JAM_QR_PREFIX + value;
    setIsLoading(true);
    try {
      const { decodeChordSheet } = await import('@/utils/chordSheetQR');
      const payload = await decodeChordSheet(encoded);
      if (!payload) throw new Error();
      const { normalizeNamePart } = await import('@/utils/chord-sheet-path');
      const path = `/${normalizeNamePart(payload.artist)}/${normalizeNamePart(payload.title)}`;
      onNavigate();
      navigate(`${path}?d=${encodeURIComponent(value.trim())}`);
    } catch {
      toast.error(t('jamSession.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Input
        placeholder={t('jamSession.jamLinkPlaceholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGo()}
        className="flex-1"
      />
      <Button onClick={handleGo} disabled={isLoading || !value.trim()}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('jamSession.go')}
      </Button>
    </div>
  );
}
