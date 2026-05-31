import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';
import { drawCorners, isChordiumJamUrl } from './jamScannerUtils';

interface UseQRScannerOptions {
  active: boolean;
  onDetected: (url: URL) => void;
}

export function useQRScanner({ active, onDetected }: UseQRScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [debugStatus, setDebugStatus] = useState('');
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const frameCountRef = useRef(0);

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
    const offCtx = offscreen.getContext('2d');

    const tick = () => {
      if (!scanning) return;

      const video = videoRef.current;

      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      frameCountRef.current++;

      // Update debug status every 30 frames (~0.5s)
      if (frameCountRef.current % 30 === 0) {
        setDebugStatus(`scanning... ${w}x${h} frame#${frameCountRef.current}`);
      }

      if (!offCtx) { rafId = requestAnimationFrame(tick); return; }
      offscreen.width = w;
      offscreen.height = h;
      offCtx.drawImage(video, 0, 0, w, h);

      let imageData: ImageData;
      try {
        imageData = offCtx.getImageData(0, 0, w, h);
      } catch {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const overlay = canvasRef.current;
      if (overlay) {
        const overlayCtx = overlay.getContext('2d');
        if (overlayCtx) {
          overlay.width = w;
          overlay.height = h;
          overlayCtx.clearRect(0, 0, w, h);
        }
      }

      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });

      if (code?.data) {
        setDebugStatus('QR found: ' + code.data.slice(0, 40));
        const overlay = canvasRef.current;
        if (overlay) {
          const overlayCtx = overlay.getContext('2d');
          if (overlayCtx) drawCorners(overlayCtx, code.location);
        }
        scanning = false;
        const url = isChordiumJamUrl(code.data);
        if (url) {
          setTimeout(() => onDetectedRef.current(url), 300);
        } else {
          toast.error('Not a Chordium QR code');
        }
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    const init = async () => {
      try {
        setDebugStatus('requesting camera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!scanning) { stream.getTracks().forEach(t => t.stop()); return; }

        const video = videoRef.current;
        if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

        video.srcObject = stream;
        streamRef.current = stream;
        setDebugStatus('waiting for metadata...');

        video.onloadedmetadata = () => {
          if (!scanning) return;
          video.play().then(() => {
            setHasCamera(true);
            setDebugStatus(`camera ready ${video.videoWidth}x${video.videoHeight}`);
            frameCountRef.current = 0;
            rafId = requestAnimationFrame(tick);
          }).catch(err => {
            setDebugStatus('play error: ' + String(err));
          });
        };
      } catch (err) {
        setDebugStatus('camera error: ' + String(err));
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
  }, [active, stop]);

  return { videoRef, canvasRef, hasCamera, debugStatus };
}
