/** How far along a recognition is, and at what: fetching, or transcribing. */
export type SpeechPhase = 'download' | 'transcribe';

export interface SpeechProgress {
  phase: SpeechPhase;
  ratio: number;
}

/**
 * One attempt at hearing a query, from the moment the microphone opens.
 *
 * Listening is a session rather than a single call because the reader decides when
 * they have finished speaking, and because the two backends capture audio
 * differently: the browser's recogniser listens to the input device itself, while
 * the downloaded model works from a recording the app makes. Both are stopped the
 * same way, which is all the caller needs to know.
 */
export interface RecognitionSession {
  /** Finishes listening and lets the transcript settle. */
  stop(): void;
  /** Gives up without waiting for a transcript. */
  abort(): void;
  /** The transcript, once listening has stopped. Empty when nothing was heard. */
  readonly transcript: Promise<string>;
}

/**
 * Turns speech into a search query. Two backends implement this: the browser's own
 * recogniser, and a model the app downloads for browsers without one.
 */
export interface Recognizer {
  /** Identifies which backend produced a transcript, for logging and tests. */
  readonly id: 'native' | 'local-model';
  /**
   * Opens the microphone and starts listening.
   *
   * Returns without awaiting anything, and every backend asks for the microphone
   * before it does anything else. Safari in particular only allows a recognition
   * that begins in the click that asked for it, and awaiting first spends that
   * click: the microphone opens and then nothing is ever heard. Whatever each
   * backend needs afterwards is awaited inside the session's transcript instead.
   *
   * @param language The app's current language, so the transcript comes back in it.
   */
  listen(language: string, onProgress?: (progress: SpeechProgress) => void): RecognitionSession;
}

/**
 * Thrown when a recogniser cannot run at all, as opposed to failing on one
 * recording. Callers treat this as "try the next recogniser".
 */
export class RecognizerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecognizerUnavailableError';
  }
}

/**
 * Thrown when the reader refused the microphone, or the device has none. Distinct
 * from the above because no other backend will do better, so there is nothing to
 * fall back to and the reader has to be told.
 */
export class MicrophoneUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MicrophoneUnavailableError';
  }
}
