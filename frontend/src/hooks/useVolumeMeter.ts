import { useEffect, useRef, useState } from 'react';

export interface VolumeMeterState {
  rms: number;
  noiseFloor: number;
  isSpeech: boolean;
}

/**
 * Hook for real-time volume metering from a media stream.
 * Returns current RMS energy and detects speech vs silence.
 */
export function useVolumeMeter(stream: MediaStream | null, enabled = true): VolumeMeterState {
  const [state, setState] = useState<VolumeMeterState>({ rms: 0, noiseFloor: 0.001, isSpeech: false });
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !enabled) return;

    const context = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
    const source = context.createMediaStreamSource(stream);
    const analyzer = context.createAnalyser();

    analyzer.fftSize = 2048;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const update = () => {
      analyzer.getByteFrequencyData(dataArray);

      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = dataArray[i] / 255;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      setState((prev) => ({
        ...prev,
        rms,
        isSpeech: rms > prev.noiseFloor + 0.02,
      }));

      animationIdRef.current = requestAnimationFrame(update);
    };

    animationIdRef.current = requestAnimationFrame(update);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      analyzer.disconnect();
      source.disconnect();
      context.close();
    };
  }, [stream, enabled]);

  return state;
}
