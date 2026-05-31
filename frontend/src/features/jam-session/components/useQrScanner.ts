import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { isChordiumJamUrl } from './jamScannerUtils';

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

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setHasCamera(false);
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }

    let rafId: number;
    let scanning = true;
    let detector: any = null;
    let frameCount = 0;

    // Use native BarcodeDetector if available, fall back to jsQR
    const hasBarcodeDetector = 'BarcodeDetector' in window;

    const initDetector = async () => {
      if (hasBarcodeDetector) {
        try {
          detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          setDebugStatus('using native BarcodeDetector');
        } catch {
          detector = null;
        }
      }
      if (!detector) {
        const { default: jsQR } = await import('jsqr');
        detector = { jsQR };
        setDebugStatus('using jsQR fallback');
      }
    };

    const tick = async () => {
      if (!scanning) return;

      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      frameCount++;
      if (frameCount % 30 === 0) {
        setDebugStatus(`scanning... ${video.videoWidth}x${video.videoHeight} frame#${frameCount}`);
      }

      try {
        let data: string | null = null;

        if (detector?.detect) {
          // Native BarcodeDetector — pass video element directly
          const codes = await detector.detect(video);
          if (codes.length > 0) data = codes[0].rawValue;
        } else if (detector?.jsQR) {
          // jsQR fallback — draw to canvas, extract imageData
          const w = video.videoWidth;
          const h = video.videoHeight;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const code = detector.jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
            if (code) data = code.data;
          }
        }

        if (data) {
          setDebugStatus('QR found: ' + data.slice(0, 50));
          scanning = false;
          const url = isChordiumJamUrl(data);
          if (url) {
            setTimeout(() => onDetectedRef.current(url), 200);
          } else {
            toast.error('Not a Chordium QR code');
          }
          return;
        }
      } catch {
        // detect() can throw on some frames — just retry
      }

      if (scanning) rafId = requestAnimationFrame(tick);
    };

    const init = async () => {
      try {
        setDebugStatus('requesting camera...');
        await initDetector();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!scanning) { stream.getTracks().forEach(t => t.stop()); return; }

        const video = videoRef.current;
        if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

        video.srcObject = stream;
        streamRef.current = stream;

        video.onloadedmetadata = () => {
          if (!scanning) return;
          video.play().then(() => {
            setHasCamera(true);
            setDebugStatus(`camera ready ${video.videoWidth}x${video.videoHeight}`);
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
