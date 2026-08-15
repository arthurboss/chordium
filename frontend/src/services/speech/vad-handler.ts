/**
 * Sets up voice activity detection using an AudioWorklet.
 * Detects when speech starts/ends and notifies via callbacks.
 */
export interface VADCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onEnergy?: (rms: number, noiseFloor: number) => void;
}

export async function setupVAD(
  source: AudioNode,
  context: AudioContext,
  callbacks?: VADCallbacks
): Promise<{ processor: AudioWorkletNode; disconnect: () => void }> {
  try {
    // Register the worklet module
    await context.audioWorklet.addModule(new URL('./vad-worklet.ts', import.meta.url).href);

    const processor = new AudioWorkletNode(context, 'vad-processor');

    processor.port.onmessage = (event) => {
      if (event.data.type === 'speech-start') {
        callbacks?.onSpeechStart?.();
      } else if (event.data.type === 'speech-end') {
        callbacks?.onSpeechEnd?.();
      } else if (event.data.type === 'energy') {
        callbacks?.onEnergy?.(event.data.rms, event.data.noiseFloor);
      }
    };

    source.connect(processor);
    processor.connect(context.destination);

    return {
      processor,
      disconnect: () => {
        processor.disconnect();
        source.disconnect(processor);
      },
    };
  } catch (error) {
    console.error('Failed to set up VAD:', error);
    // If AudioWorklet setup fails, gracefully continue without VAD
    return {
      processor: null as unknown as AudioWorkletNode,
      disconnect: () => {},
    };
  }
}
