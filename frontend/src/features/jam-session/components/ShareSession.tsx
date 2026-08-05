import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQRScanner } from './useQrScanner';
import { JamCameraView } from './JamCameraView';
import { JamManualInput } from './JamManualInput';
import { JamShareQR } from './JamShareQR';
import { useActiveChordSheet } from '../useActiveChordSheet';

export function ShareSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  // The song being viewed, if any. Absent on other routes and withdrawn while
  // editing, in which case the dialog offers joining only.
  const { chordSheet } = useActiveChordSheet();

  const handleDetected = useCallback((url: URL) => {
    navigator.vibrate?.(80);
    setScanMode(false);
    setIsOpen(false);
    navigate(`${url.pathname}?d=${encodeURIComponent(url.searchParams.get('d')!)}`);
  }, [navigate]);

  const { videoRef, canvasRef, hasCamera, debugStatus, triggerFocus } = useQRScanner({
    active: scanMode,
    onDetected: handleDetected,
  });

  const close = () => { setIsOpen(false); setScanMode(false); };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setScanMode(false); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full"
          title={t('jamSession.jamSession')}
          aria-label={t('jamSession.jamSession')}
        >
          <ScanLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw_-_2rem)] sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>
            {scanMode ? t('jamSession.scanQrCode') : t('jamSession.jamSession')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {scanMode ? (
            <>
              <JamCameraView videoRef={videoRef} canvasRef={canvasRef} hasCamera={hasCamera} debugStatus={debugStatus} onTapFocus={triggerFocus} />
              <p className="text-sm text-muted-foreground text-center">
                {t('jamSession.pointAtQrCode')}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setScanMode(false)}>
                {t('jamSession.back')}
              </Button>
            </>
          ) : (
            <>
              {chordSheet && (
                <>
                  <JamShareQR chordSheet={chordSheet} />
                  <div className="relative flex items-center w-full">
                    <div className="flex-grow border-t" />
                    <span className="px-4 text-sm text-muted-foreground">{t('jamSession.or')}</span>
                    <div className="flex-grow border-t" />
                  </div>
                </>
              )}
              <Button className="w-full" onClick={() => setScanMode(true)}>
                {t('jamSession.scanQrCode')}
              </Button>
              <div className="relative flex items-center w-full">
                <div className="flex-grow border-t" />
                <span className="px-4 text-sm text-muted-foreground">
                  {t('jamSession.orPasteLink')}
                </span>
                <div className="flex-grow border-t" />
              </div>
              <JamManualInput onNavigate={close} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
