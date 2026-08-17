/// <reference lib="webworker" />

/**
 * The AudioWorklet globals.
 *
 * TypeScript ships no lib for these: a worklet runs in its own scope, separate
 * from the window and from a worker, and they exist nowhere else. Declared here
 * rather than pulled in as a dependency, since this is the only file that runs
 * in that scope.
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

/**
 * AudioWorklet for energy-based voice activity detection.
 *
 * Continuously analyzes audio energy, tracks an adaptive noise floor,
 * and signals speech/silence detection to the main thread.
 */
class VADProcessor extends AudioWorkletProcessor {
  private energyThreshold: number;
  private noiseFloor: number;
  private speechStarted: boolean;
  private silenceDuration: number;
  private readonly SILENCE_THRESHOLD_MS: number;

  constructor() {
    super();
    this.energyThreshold = 0.02;
    this.noiseFloor = 0.001;
    this.speechStarted = false;
    this.silenceDuration = 0;
    this.SILENCE_THRESHOLD_MS = 500;

    this.port.onmessage = (event) => {
      if (event.data.type === 'update-threshold') {
        this.energyThreshold = event.data.threshold;
      }
    };
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
    const input = inputs[0]?.[0];
    if (!input) return true;

    let sumSquares = 0;
    for (let i = 0; i < input.length; i++) {
      sumSquares += input[i] * input[i];
    }
    const rms = Math.sqrt(sumSquares / input.length);

    // Adaptive noise floor: when energy is low, it's likely noise; track slowly
    if (rms < this.noiseFloor) {
      this.noiseFloor = rms * 0.9 + this.noiseFloor * 0.1;
    } else {
      // Keep noise floor from rising too fast during speech
      this.noiseFloor = Math.max(rms * 0.01, this.noiseFloor * 0.99);
    }

    const isSpeech = rms > this.noiseFloor + this.energyThreshold;

    if (isSpeech) {
      this.silenceDuration = 0;
      if (!this.speechStarted) {
        this.speechStarted = true;
        this.port.postMessage({ type: 'speech-start', rms });
      }
    } else {
      this.silenceDuration += (input.length / sampleRate) * 1000;
      if (this.speechStarted && this.silenceDuration > this.SILENCE_THRESHOLD_MS) {
        this.speechStarted = false;
        this.port.postMessage({ type: 'speech-end', rms });
      }
    }

    this.port.postMessage({ type: 'energy', rms, noiseFloor: this.noiseFloor, isSpeech });

    return true;
  }
}

registerProcessor('vad-processor', VADProcessor);
