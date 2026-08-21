/**
 * Sets up real-time pitch detection using an AudioWorklet.
 * Reports the detected fundamental frequency (or null when nothing is heard) as
 * it changes.
 */
export interface PitchCallbacks {
  onPitch?: (frequency: number | null) => void;
}

export async function setupPitchDetection(
  source: AudioNode,
  context: AudioContext,
  callbacks?: PitchCallbacks
): Promise<{ processor: AudioWorkletNode; disconnect: () => void }> {
  // Register the worklet module. `?worker&url` (rather than the
  // `new URL(file, import.meta.url)` form vad-handler.ts uses) is deliberate:
  // audioWorklet.addModule() is not one of the constructors Vite's worker
  // plugin looks for (only `new Worker(...)` / `new SharedWorker(...)` are),
  // so a bare `new URL(...)` reference here is treated as a static asset and
  // copied byte-for-byte - shipping unrunnable raw TypeScript in production.
  // `?worker&url` forces the same worker-transform pipeline, transpiled to JS,
  // while still handing back a URL instead of a Worker instance.
  const workletUrl = (await import('./pitch-worklet.ts?worker&url')).default;
  await context.audioWorklet.addModule(workletUrl);

  const processor = new AudioWorkletNode(context, 'pitch-processor');

  processor.port.onmessage = (event) => {
    if (event.data.type === 'pitch') {
      callbacks?.onPitch?.(event.data.frequency);
    }
  };

  source.connect(processor);
  // The processor never writes to its output, so this stays silent - it exists
  // only to keep the node connected to a live audio graph, the same way
  // vad-handler.ts connects to the destination to keep the worklet running.
  processor.connect(context.destination);

  return {
    processor,
    disconnect: () => {
      processor.disconnect();
      source.disconnect(processor);
    },
  };
}
