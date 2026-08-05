import { useState, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
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
  const onOpenChange = (open: boolean) => { setIsOpen(open); if (!open) setScanMode(false); };

  const title = scanMode ? t('jamSession.scanQrCode') : t('jamSession.jamSession');
  const description = scanMode
    ? t('jamSession.pointAtQrCode')
    : t(chordSheet ? 'jamSession.shareOrJoinDescription' : 'jamSession.joinDescription');

  const trigger = (
    <Button
      variant="outline"
      className="h-10 w-10 rounded-full"
      title={t('jamSession.jamSession')}
      aria-label={t('jamSession.jamSession')}
    >
      <ScanLine className="h-4 w-4" />
    </Button>
  );

  const body: ReactNode = scanMode ? (
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
  );

  // The QR plus both join options is taller than a small phone screen, so the
  // body scrolls rather than overflowing past the edges. `min-h-0` lets the
  // scroll container shrink inside the flex column instead of forcing the
  // wrapper to grow.
  const scrollableBody = (
    <div className="flex flex-col items-center gap-4 overflow-y-auto overscroll-contain min-h-0 py-4">
      {body}
    </div>
  );

  // On phones this is a bottom sheet: it opens next to the thumb and can use
  // the full width, which a centered modal cannot without being cramped.
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 rounded-t-xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
        >
          <SheetHeader className="shrink-0 text-left">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="sr-only">{description}</SheetDescription>
          </SheetHeader>
          {scrollableBody}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 w-[calc(100vw_-_2rem)] sm:max-w-[380px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        {scrollableBody}
      </DialogContent>
    </Dialog>
  );
}
