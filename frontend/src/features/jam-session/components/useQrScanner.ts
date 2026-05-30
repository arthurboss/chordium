import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';
import { drawCorners, isChordiumJamUrl } from './jamScannerUtils';

interface UseQrScannerOptions {
  active: boolean;
  onDetected: (url: URL) => void;
}

export function useQrScanner({ active, onDetected }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setHasCamera(false);
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }

    let rafId: number;
    let scanning = true;
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      const video = videoRef.current;
      const overlay = canvasRef.current;
      if (!scanning || !video || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      offscreen.width = video.videoWidth;
      offscreen.height = video.videoHeight;
      offCtx?.drawImage(video, 0, 0);
      const imageData = offCtx?.getImageData(0, 0, offscreen.width, offscreen.height);

      if (imageData && overlay) {
        const overlayCtx = overlay.getContext('2d');
        overlay.width = offscreen.width;
        overlay.height = offscreen.height;
        overlayCtx?.clearRect(0, 0, overlay.width, overlay.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          if (overlayCtx) drawCorners(overlayCtx, code.location);
          const url = isChordiumJamUrl(code.data);
          if (url) {
            scanning = false;
            setTimeout(() => onDetected(url), 300);
          } else {
            scanning = false;
            toast.error('Not a Chordium QR code');
          }
          return;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (!scanning) { stream.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          streamRef.current = stream;
          setHasCamera(true);
          rafId = requestAnimationFrame(tick);
        }
      } catch {
        toast.error('Could not access camera. Please check permissions.');
        setHasCamera(false);
      }
    };

    init();

    return () => {
      scanning = false;
      cancelAnimationFrame(rafId);
      stop();
    };
  }, [active, onDetected, stop]);

  return { videoRef, canvasRef, hasCamera };
}
