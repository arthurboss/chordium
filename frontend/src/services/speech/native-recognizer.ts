import {
  MicrophoneUnavailableError,
  RecognizerUnavailableError,
  type RecognitionSession,
  type Recognizer,
} from './types';

/**
 * The browser's own SpeechRecognition, preferred wherever it exposes the API
 * because it needs no download of ours, exactly as the browser's translator is
 * preferred over the model that backs it up.
 *
 * Recognition is left to the browser's default, which recognises through its
 * vendor. On-device recognition is deliberately never requested: asking for it
 * kills the renderer process outright on several Chromium builds. See
 * `createNativeRecognizer` below.
 */
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

function getConstructor(): SpeechRecognitionConstructor | null {
  const scope = globalThis as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/**
 * Whether the browser can hear a search at all.
 *
 * The secure-context check is not about privacy but about whether it can run: the
 * microphone is refused over plain http on anything but localhost, so without this
 * the button would offer a recognition that cannot start.
 */
export function isNativeRecognizerSupported(): boolean {
  if (typeof globalThis.isSecureContext === 'boolean' && !globalThis.isSecureContext) return false;
  return getConstructor() !== null;
}

export function createNativeRecognizer(): Recognizer {
  return {
    id: 'native',
    listen(language) {
      const Recognition = getConstructor();
      if (!Recognition) {
        throw new RecognizerUnavailableError('SpeechRecognition is not available');
      }

      const recognition = new Recognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      // On-device recognition is never asked for, neither by probing
      // SpeechRecognition.available({processLocally: true}) nor by setting
      // `processLocally` here. Both reach for media.mojom.OnDeviceSpeechRecognition,
      // and on Chromium builds that advertise the API without providing that
      // interface (Samsung Internet, and Perplexity's Comet) the browser kills the
      // renderer process on the spot: "No binder found for interface
      // media.mojom.OnDeviceSpeechRecognition". That happens below the JS layer, so
      // it cannot be caught, and Comet reports an unmodified Chrome user agent, so
      // affected builds cannot be told apart from a working one beforehand. Vendor
      // recognition, which is the default, works on all of them.

      let heard = '';

      /**
       * Lets go of the microphone, once and for all.
       *
       * Chrome releases the device by itself once a recognition ends. Aborting makes
       * that deterministic rather than left to it, and settles a session that was
       * abandoned instead of leaving whoever awaited the transcript waiting for good.
       * The handlers come off first, so that aborting cannot arrive back through them.
       *
       * It does not help Safari, and nothing here can. WebKit gives speech recognition
       * its own capture manager, separate from the one behind getUserMedia, and it
       * fails to unset the audio session once capture finishes: macOS and iOS go on
       * showing the microphone as in use until the tab is reloaded or closed. That is
       * https://bugs.webkit.org/show_bug.cgi?id=219671, filed in 2020 and still open on
       * current Safari as of August 2026.
       *
       * stop(), abort(), detaching the handlers, and releasing our own stream were each
       * confirmed on a real Safari to run without error and change nothing, so they are
       * not worth trying again. A reader on WebKit is told in words instead, from
       * useVoiceSearch.
       */
      let releasing = false;
      const release = () => {
        if (releasing) return;
        releasing = true;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {
          // Already finished, so there is nothing left to let go of.
        }
      };

      // Held so that abandoning a session settles it rather than leaving whoever is
      // waiting on the transcript waiting for good.
      let giveUp!: (transcript: string) => void;

      const transcript = new Promise<string>((resolve, reject) => {
        giveUp = resolve;
        recognition.onresult = (event) => {
          for (let i = 0; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) heard += result[0].transcript;
          }
        };
        // "no-speech" and "aborted" are ordinary outcomes of a reader who changed
        // their mind, so they settle empty rather than as failures.
        recognition.onerror = (event) => {
          const error = event.error ?? 'unknown';
          release();
          if (error === 'no-speech' || error === 'aborted') resolve('');
          // Told apart from any other failure so that the reader is asked for the
          // microphone again rather than shown a fault they cannot act on.
          else if (error === 'not-allowed' || error === 'service-not-allowed')
            reject(new MicrophoneUnavailableError(`The microphone was refused: ${error}`));
          else reject(new RecognizerUnavailableError(`Speech recognition failed: ${error}`));
        };
        // Settled on end rather than on the first result, so a recognition that
        // hears nothing finishes as an empty transcript instead of hanging.
        recognition.onend = () => {
          release();
          resolve(heard.trim());
        };
      });

      // Started in the same turn as the click, with nothing awaited in between.
      recognition.start();

      return {
        // Asking it to stop is asking for what it heard, so the microphone is let go
        // when the recognition reports itself ended rather than here.
        stop: () => recognition.stop(),
        abort: () => {
          release();
          giveUp('');
        },
        transcript,
      } satisfies RecognitionSession;
    },
  };
}
