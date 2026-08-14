import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canListen,
  createRecognizer,
  requiresDownloadConsent,
  resolveRecognizerKind,
} from '@/services/speech/get-recognizer';
import { onSpeechModelChanged, openVoiceSetup } from '@/services/speech/speech-manager';
import { MicrophoneUnavailableError, type RecognitionSession } from '@/services/speech/types';

/**
 * Where a spoken search has got to:
 * - "unsupported": this browser cannot hear one at all.
 * - "needs-setup": it could, once the fallback model has been downloaded.
 * - "idle": ready, waiting to be asked.
 * - "listening": the microphone is open.
 * - "working": listening has stopped and the words are being made out.
 */
export type VoiceSearchState = 'unsupported' | 'needs-setup' | 'idle' | 'listening' | 'working';

interface UseVoiceSearchOptions {
  /** Called with the transcript, once there is one worth acting on. */
  onTranscript: (transcript: string) => void;
}

/**
 * Runs one spoken search at a time, from pressing the microphone to handing back
 * what was heard.
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

  // Kept in a ref so a transcript arriving late calls the current handler rather
  // than the one that happened to be in scope when listening started.
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const assess = useCallback(async () => {
    if (!canListen()) {
      setState('unsupported');
      return;
    }
    setState((await requiresDownloadConsent()) ? 'needs-setup' : 'idle');
  }, []);

  useEffect(() => {
    void assess();
    // Re-checked when a download or removal elsewhere has changed the answer.
    return onSpeechModelChanged(() => void assess());
  }, [assess]);

  /**
   * Closing the microphone is where the waiting starts, so the state moves here
   * rather than when the transcript lands: by then there is nothing left to wait
   * for.
   */
  const stop = useCallback(() => {
    if (!sessionRef.current) return;
    setState('working');
    sessionRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    setError(null);

    // Setting up is its own step, done where the download can be explained and
    // agreed to rather than sprung on the reader by a press of the microphone.
    if (state === 'needs-setup') {
      openVoiceSetup();
      return;
    }
    if (state !== 'idle') return;

    try {
      const session = await createRecognizer(resolveRecognizerKind()).listen(language);
      sessionRef.current = session;
      setState('listening');

      // Settles once the words have been made out, which for the downloaded model
      // is a moment after the microphone closes and for the browser's own
      // recogniser is immediate.
      const transcript = await session.transcript;
      sessionRef.current = null;
      setState('idle');
      if (transcript) onTranscriptRef.current(transcript);
    } catch (cause) {
      sessionRef.current = null;
      setState('idle');
      setError(cause instanceof MicrophoneUnavailableError ? 'microphone' : 'failed');
      console.error('Voice search failed:', cause);
    }
  }, [language, state]);

  // A microphone left open when the page moves on would keep recording, so any
  // session still running is abandoned on the way out.
  useEffect(
    () => () => {
      sessionRef.current?.abort();
      sessionRef.current = null;
    },
    []
  );

  return { state, error, start, stop, clearError: () => setError(null) };
}
