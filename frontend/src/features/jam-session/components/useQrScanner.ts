import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { isChordiumJamUrl } from './jamScannerUtils';

interface UseQRScannerOptions {
  active: boolean;
  onDetected: (url: URL) => void;
}

async function createDetector(): Promise<{ detect: (source: HTMLVideoElement) => Promise<string | null> }> {
  if ('BarcodeDetector' in window) {
    const formats = await (window as any).BarcodeDetector.getSupportedFormats();
    if (formats.includes('qr_code')) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      return {
        detect: async (video) => {
          const codes = await detector.detect(video);
          return codes.length > 0 ? codes[0].rawValue : null;
        },
      };
    }
  }

  // Fallback: jsQR via canvas
  const { default: jsQR } = await import('jsqr');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  return {
    detect: async (video) => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w === 0 || h === 0) return null;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
      return code?.data ?? null;
    },
  };
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
    let frameCount = 0;

    const init = async () => {
      try {
        setDebugStatus('initializing...');
        const detector = await createDetector();
        const isNative = 'BarcodeDetector' in window;
        setDebugStatus(isNative ? 'native BarcodeDetector' : 'jsQR fallback');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 }, focusMode: { ideal: 'continuous' } } as any,
          audio: false,
        });
        if (!scanning) { stream.getTracks().forEach(t => t.stop()); return; }

        const video = videoRef.current;
        if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

        video.srcObject = stream;
        streamRef.current = stream;

        await new Promise<void>((resolve) => { video.onloadedmetadata = () => resolve(); });
        if (!scanning) return;
        await video.play();

        // Request continuous autofocus if supported
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities?.focusMode?.includes('continuous')) {
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as any] });
        }

        setHasCamera(true);
        setDebugStatus(`ready ${video.videoWidth}x${video.videoHeight} (${isNative ? 'native' : 'jsQR'})`);

        const tick = async () => {
          if (!scanning) return;
          frameCount++;
          if (frameCount % 30 === 0) {
            setDebugStatus(`scanning... frame#${frameCount} (${isNative ? 'native' : 'jsQR'})`);
          }

          try {
            const data = await detector.detect(video);
            if (data) {
              setDebugStatus('found: ' + data.slice(0, 50));
              scanning = false;
              navigator.vibrate?.(80);
              const url = isChordiumJamUrl(data);
              if (url) {
                setTimeout(() => onDetectedRef.current(url), 200);
              } else {
                toast.error('Not a Chordium QR code');
              }
              return;
            }
          } catch {
            // detect can throw on bad frames
          }

          if (scanning) rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
      } catch (err) {
        setDebugStatus('error: ' + String(err));
        toast.error('Could not access camera.');
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

  const triggerFocus = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities?.() as any;
    if (capabilities?.focusMode?.includes('single-shot')) {
      track.applyConstraints({ advanced: [{ focusMode: 'single-shot' } as any] }).then(() => {
        // After single-shot focuses, go back to continuous
        setTimeout(() => {
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as any] }).catch(() => {});
        }, 1500);
      }).catch(() => {});
    }
  }, []);

  return { videoRef, canvasRef, hasCamera, debugStatus, triggerFocus };
}
