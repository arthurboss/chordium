import { useState, useEffect, useRef, useCallback } from "react";

export type TunerStatus = "idle" | "listening" | "error";

export interface PitchResult {
  frequency: number | null;
  note: string | null;
  octave: number | null;
  cents: number | null; // -50 to +50, 0 = in tune
  isInTune: boolean;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4_FREQ = 440;
const A4_MIDI = 69;
const IN_TUNE_THRESHOLD = 5; // cents

function frequencyToNoteInfo(freq: number): Omit<PitchResult, "frequency"> {
  const midiNote = 12 * Math.log2(freq / A4_FREQ) + A4_MIDI;
  const roundedMidi = Math.round(midiNote);
  const cents = Math.round((midiNote - roundedMidi) * 100);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
    isInTune: Math.abs(cents) <= IN_TUNE_THRESHOLD,
  };
}

// Autocorrelation-based pitch detection
function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  const MIN_FREQ = 60;
  const MAX_FREQ = 1400;

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // too quiet

  const correlations = new Float32Array(MAX_SAMPLES);
  for (let lag = 0; lag < MAX_SAMPLES; lag++) {
    let sum = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.floor(sampleRate / MIN_FREQ);

  let bestLag = -1;
  let bestVal = -Infinity;
  let i = minLag;
  while (i < maxLag) {
    if (correlations[i] > bestVal) {
      bestVal = correlations[i];
      bestLag = i;
    }
    i++;
  }

  if (bestLag === -1 || bestVal < correlations[0] * 0.5) return null;

  // Parabolic interpolation for sub-sample accuracy
  const y1 = correlations[bestLag - 1] ?? 0;
  const y2 = correlations[bestLag];
  const y3 = correlations[bestLag + 1] ?? 0;
  const denom = 2 * (2 * y2 - y1 - y3);
  const refinedLag = denom === 0 ? bestLag : bestLag + (y3 - y1) / denom;

  return sampleRate / refinedLag;
}

export function usePitchDetector() {
  const [status, setStatus] = useState<TunerStatus>("idle");
  const [pitch, setPitch] = useState<PitchResult>({
    frequency: null,
    note: null,
    octave: null,
    cents: null,
    isInTune: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setStatus("idle");
    setPitch({ frequency: null, note: null, octave: null, cents: null, isInTune: false });
  }, []);

  const start = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setStatus("listening");

      const tick = () => {
        if (!analyserRef.current || !bufferRef.current) return;
        analyserRef.current.getFloatTimeDomainData(bufferRef.current);
        const freq = detectPitch(bufferRef.current, ctx.sampleRate);
        if (freq !== null) {
          const info = frequencyToNoteInfo(freq);
          setPitch({ frequency: Math.round(freq * 10) / 10, ...info });
        } else {
          setPitch((prev) => ({ ...prev, frequency: null }));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { status, pitch, errorMessage, start, stop };
}
