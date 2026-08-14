/** Both recognisers expect mono PCM at this rate. */
export const TARGET_SAMPLE_RATE = 16000;

/**
 * Averages the channels so a stereo recording keeps both sides rather than
 * dropping one, which on some devices is the quieter of the two.
 */
function toMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);

  const mixed = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < samples.length; i += 1) mixed[i] += samples[i];
  }
  for (let i = 0; i < mixed.length; i += 1) mixed[i] /= buffer.numberOfChannels;
  return mixed;
}

/**
 * Linear resampling, used only when the browser hands back a rate other than the
 * one that was asked for. It is cruder than a windowed filter, but speech at
 * this length is unaffected and it needs no dependency.
 */
function resample(samples: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return samples;

  const ratio = from / to;
  const output = new Float32Array(Math.round(samples.length / ratio));
  for (let i = 0; i < output.length; i += 1) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, samples.length - 1);
    output[i] = samples[left] + (samples[right] - samples[left]) * (position - left);
  }
  return output;
}

/**
 * Decodes a recording into the mono 16 kHz PCM the recognisers take.
 *
 * The container is whatever this browser's MediaRecorder chose, and it is the
 * same browser decoding it, so no format negotiation is needed. Asking the
 * context for 16 kHz usually gets the resampling done during decode; where it is
 * ignored, the fallback above finishes the job.
 */
export async function decodeRecording(blob: Blob): Promise<Float32Array> {
  const bytes = await blob.arrayBuffer();
  const context = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  try {
    const decoded = await context.decodeAudioData(bytes);
    return resample(toMono(decoded), decoded.sampleRate, TARGET_SAMPLE_RATE);
  } finally {
    void context.close();
  }
}
