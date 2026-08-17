import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canListen,
  createRecognizer,
  requiresDownloadConsent,
  resolveRecognizerKind,
} from '@/services/speech/get-recognizer';
import {
  forgetMicrophoneGrant,
  isMicrophoneGranted,
  requestMicrophone,
} from '@/services/speech/microphone-permission';
import { onSpeechModelChanged, openVoiceSetup } from '@/services/speech/speech-manager';
import { MicrophoneUnavailableError, type RecognitionSession } from '@/services/speech/types';

/**
 * Where a spoken search has got to:
 * - "unsupported": this browser cannot hear one at all.
 * - "needs-setup": it could, once the fallback model has been downloaded.
 * - "needs-permission": it could, once the reader has allowed the microphone.
 * - "idle": ready, waiting to be asked.
 * - "listening": the microphone is open.
 * - "working": listening has stopped and the words are being made out.
 */
export type VoiceSearchState =
  | 'unsupported'
  | 'needs-setup'
  | 'needs-permission'
  | 'idle'
  | 'listening'
  | 'working';

interface UseVoiceSearchOptions {
  /** Called with the transcript, once there is one worth acting on. */
  onTranscript: (transcript: string) => void;
}

/**
 * Runs one spoken search at a time, from pressing the microphone to handing back what
 * was heard.
 *
 * Where the browser recognises speech itself the first press opens the microphone.
 * Where it does not, the first press asks for the download instead, so a reader who
 * never speaks to it is never charged for it.
 */
export function useVoiceSearch({ onTranscript }: UseVoiceSearchOptions) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  const [state, setState] = useState<VoiceSearchState>('unsupported');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<RecognitionSession | null>(null);
  // Guards against a second press asking for the microphone while the first prompt is
  // still up, which the state cannot express without misdescribing itself.
  const requestingRef = useRef(false);

  // Kept in a ref so a transcript arriving late calls the current handler rather than
  // the one that happened to be in scope when listening started.
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const assess = useCallback(async () => {
    if (!canListen()) {
      setState('unsupported');
      return;
    }
    if (await requiresDownloadConsent()) {
      setState('needs-setup');
      return;
    }
    // Only the browser's own recogniser needs asking ahead of the press. The model
    // opens the microphone itself and waits for the grant before it records, so it
    // has nothing to race.
    if (resolveRecognizerKind() === 'native' && !(await isMicrophoneGranted())) {
      setState('needs-permission');
      return;
    }
    setState('idle');
  }, []);

  useEffect(() => {
    void assess();
    // Re-checked when a download or removal elsewhere has changed the answer.
    return onSpeechModelChanged(() => void assess());
  }, [assess]);

  /**
   * Closing the microphone is where the waiting starts, so the state moves here
   * rather than when the transcript lands: by then there is nothing left to wait for.
   */
  const stop = useCallback(() => {
    if (!sessionRef.current) return;
    setState('working');
    sessionRef.current.stop();
  }, []);

  /**
   * Deliberately not an async function. Safari only allows a recognition that begins
   * in the click that asked for it, and an await anywhere before listening starts
   * spends that click: the microphone opens and nothing is ever heard. Everything
   * that has to be waited for is waited for after listening has begun.
   */
  const start = useCallback(() => {
    setError(null);

    // Setting up is its own step, done where the download can be explained and agreed
    // to rather than sprung on the reader by a press of the microphone.
    if (state === 'needs-setup') {
      openVoiceSetup();
      return;
    }

    // Asking is its own press, because it is the one thing here that has to be waited
    // for. A recognition started in this press would run while the prompt is still up
    // and hear nothing, which is the whole bug this avoids. The press after this one
    // starts listening with the microphone already open.
    if (state === 'needs-permission') {
      // The state is left alone while the prompt is up: "working" would say the words
      // are being made out, which is not what is happening. A second press would only
      // ask twice, so it is dropped instead.
      if (requestingRef.current) return;
      requestingRef.current = true;
      void requestMicrophone()
        .then(() => setState('idle'))
        .catch((cause: unknown) => {
          setError('microphone');
          console.error('The microphone was not allowed:', cause);
        })
        .finally(() => {
          requestingRef.current = false;
        });
      return;
    }

    if (state !== 'idle') return;

    let retryCount = 0;
    const MAX_RETRIES = 1;

    const attempt = () => {
      let session: RecognitionSession;
      try {
        session = createRecognizer(resolveRecognizerKind()).listen(language);
      } catch (cause) {
        setState('idle');
        setError('failed');
        console.error('Voice search could not start:', cause);
        return;
      }

      sessionRef.current = session;
      setState('listening');

      session.transcript
        .then((transcript) => {
          sessionRef.current = null;
          setState('idle');
          if (!transcript && retryCount < MAX_RETRIES) {
            retryCount++;
            attempt();
            return;
          }
          if (transcript) onTranscriptRef.current(transcript);
        })
        .catch((cause: unknown) => {
          sessionRef.current = null;
          const refused = cause instanceof MicrophoneUnavailableError;
          // A grant withdrawn in browser settings after the fact leaves a remembered
          // one that is no longer true, so it is dropped and asked for again rather
          // than kept and retried against a microphone that will keep refusing.
          if (refused) forgetMicrophoneGrant();
          setState(refused ? 'needs-permission' : 'idle');
          setError(refused ? 'microphone' : 'failed');
          console.error('Voice search failed:', cause);
        });
    };

    attempt();
  }, [language, state]);

  // A microphone left open when the page moves on would keep recording, so any session
  // still running is abandoned on the way out.
  useEffect(
    () => () => {
      sessionRef.current?.abort();
      sessionRef.current = null;
    },
    []
  );

  return { state, error, start, stop, clearError: () => setError(null) };
}
