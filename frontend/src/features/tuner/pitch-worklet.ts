/// <reference lib="webworker" />

/**
 * The AudioWorklet globals.
 *
 * TypeScript ships no lib for these: a worklet runs in its own scope, separate
 * from the window and from a worker, and they exist nowhere else. Declared here
 * rather than pulled in as a dependency, since this is the only file that runs
 * in that scope. Mirrors the identical declaration in vad-worklet.ts - each
 * worklet file is compiled as its own module (moduleDetection: "force"), so the
 * two do not collide as global ambient declarations would.
 */
declare abstract class AudioWorkletProcessor {
  /** Channel back to the AudioWorkletNode on the main thread. */
  readonly port: MessagePort;
}

declare function registerProcessor(
  name: string,
  processor: new () => AudioWorkletProcessor
): void;

/** Sample rate of the audio context the worklet was created in. */
declare const sampleRate: number;

/** Samples analyzed per pitch estimate. Large enough to hold a full cycle of the
 *  lowest string this tuner listens for (low E2 ≈ 82 Hz needs ≈ 538 samples at
 *  44.1 kHz per cycle; autocorrelation wants several). */
const BUFFER_SIZE = 2048;
/** Samples accumulated between estimates. Running the O(n^2) autocorrelation on
 *  every 128-sample quantum would burn far more CPU than the needle needs; once
 *  per ~1024 samples (~23ms at 44.1kHz) is still smooth. */
const HOP_SIZE = 1024;
const MIN_FREQ = 60;
const MAX_FREQ = 1400;
/** Below this RMS, treat the input as silence rather than guessing a pitch. */
const RMS_SILENCE_THRESHOLD = 0.01;

/**
 * Autocorrelation-based pitch detection with parabolic interpolation for
 * sub-sample accuracy. Ported unchanged from the original main-thread
 * implementation that ran this on an AnalyserNode snapshot polled with
 * requestAnimationFrame - only where it runs has moved, not the math.
 */
function detectPitch(buffer: Float32Array, sampleRateHz: number): number | null {
  const size = buffer.length;
  const maxSamples = Math.floor(size / 2);

  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < RMS_SILENCE_THRESHOLD) return null; // too quiet

  const correlations = new Float32Array(maxSamples);
  for (let lag = 0; lag < maxSamples; lag++) {
    let sum = 0;
    for (let i = 0; i < maxSamples; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  const minLag = Math.floor(sampleRateHz / MAX_FREQ);
  const maxLag = Math.floor(sampleRateHz / MIN_FREQ);

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

  return sampleRateHz / refinedLag;
}

/**
 * AudioWorklet for pitch detection.
 *
 * Runs the same autocorrelation analysis that used to run on the main thread via
 * an AnalyserNode snapshot polled with requestAnimationFrame, moved to the audio
 * rendering thread so UI jank or paint load can never degrade tuning accuracy.
 * Samples arrive in fixed 128-frame quanta; they are folded into a rolling ring
 * buffer and analyzed every HOP_SIZE samples instead of on every quantum.
 */
class PitchProcessor extends AudioWorkletProcessor {
  private readonly ring: Float32Array;
  private writeIndex: number;
  private samplesSinceDetection: number;

  constructor() {
    super();
    this.ring = new Float32Array(BUFFER_SIZE);
    this.writeIndex = 0;
    this.samplesSinceDetection = 0;
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0];
    if (!input) return true;

    for (let i = 0; i < input.length; i++) {
      this.ring[this.writeIndex] = input[i];
      this.writeIndex = (this.writeIndex + 1) % BUFFER_SIZE;
    }
    this.samplesSinceDetection += input.length;

    if (this.samplesSinceDetection >= HOP_SIZE) {
      this.samplesSinceDetection = 0;

      // Unwrap the ring into chronological order - the autocorrelation assumes
      // a contiguous buffer.
      const ordered = new Float32Array(BUFFER_SIZE);
      for (let i = 0; i < BUFFER_SIZE; i++) {
        ordered[i] = this.ring[(this.writeIndex + i) % BUFFER_SIZE];
      }

      const frequency = detectPitch(ordered, sampleRate);
      this.port.postMessage({ type: 'pitch', frequency });
    }

    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
