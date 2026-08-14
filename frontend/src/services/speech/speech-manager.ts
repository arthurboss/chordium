/**
 * Hands the reader over to the language manager in the header, which is where a
 * spoken search is set up, and says when what the device can hear has changed.
 *
 * The search bar sits far from that component in the tree and only needs to nudge
 * it, so the request travels through the window rather than through props. This
 * mirrors how a song asks for a translation it cannot yet have.
 */

const OPEN_REQUEST = 'chordium:open-voice-setup';
const MODEL_CHANGED = 'chordium:speech-model-changed';

export function openVoiceSetup(): void {
  window.dispatchEvent(new Event(OPEN_REQUEST));
}

export function onVoiceSetupRequested(handler: () => void): () => void {
  window.addEventListener(OPEN_REQUEST, handler);
  return () => window.removeEventListener(OPEN_REQUEST, handler);
}

/**
 * Announced once a download or a removal has changed what can be heard, so a
 * search bar waiting on it enables itself instead of asking again.
 */
export function announceSpeechModelChanged(): void {
  window.dispatchEvent(new Event(MODEL_CHANGED));
}

export function onSpeechModelChanged(handler: () => void): () => void {
  window.addEventListener(MODEL_CHANGED, handler);
  return () => window.removeEventListener(MODEL_CHANGED, handler);
}
