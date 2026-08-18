import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  canListen,
  createRecognizer,
  requiresDownloadConsent,
  resolveRecognizerKind,
} from '@/services/speech/get-recognizer';
import {
  forgetMicrophoneGrant,
  getMicrophonePermission,
  getMicrophoneResetPlatform,
  releaseMicrophone,
  requestMicrophone,
  type MicrophoneResetPlatform,
} from '@/services/speech/microphone-permission';
import { onSpeechModelChanged, openVoiceSetup } from '@/services/speech/speech-manager';
import { MicrophoneUnavailableError, type RecognitionSession } from '@/services/speech/types';

/**
 * Where a spoken search has got to:
 * - "unsupported": this browser cannot hear one at all.
 * - "needs-setup": it could, once the fallback model has been downloaded.
 * - "needs-permission": it could, once the reader has allowed the microphone.
 * - "blocked": the microphone was refused, and only browser settings can undo it.
 * - "idle": ready, waiting to be asked.
 * - "listening": the microphone is open.
 * - "working": listening has stopped and the words are being made out.
 */
export type VoiceSearchState =
  | 'unsupported'
  | 'needs-setup'
  | 'needs-permission'
  | 'blocked'
  | 'idle'
  | 'listening'
  | 'working';

/**
 * Given to every telling of a refused microphone, so that pressing again replaces the
 * one already up rather than stacking another behind it. Its own id and no wider, so
 * anything else with something to say still gets said.
 */
const BLOCKED_TOAST_ID = 'voice-microphone-blocked';

/**
 * Where each platform hides the setting. Spelled out rather than assembled from the
 * platform name so that every key can be found by searching for it.
 */
const RESET_HINTS: Record<MicrophoneResetPlatform, string> = {
  ios: 'notifications:voiceMicrophoneBlockedIos',
  safari: 'notifications:voiceMicrophoneBlockedSafari',
  android: 'notifications:voiceMicrophoneBlockedAndroid',
  chrome: 'notifications:voiceMicrophoneBlockedChrome',
  firefox: 'notifications:voiceMicrophoneBlockedFirefox',
  generic: 'notifications:voiceMicrophoneBlockedGeneric',
};

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
  // Held from the moment permission is granted until listening has its own hold on the
  // device, so that it is never taken down and brought back up in between.
  const heldStreamRef = useRef<MediaStream | null>(null);

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
    if (resolveRecognizerKind() === 'native') {
      const permission = await getMicrophonePermission();
      if (permission === 'denied') {
        setState('blocked');
        return;
      }
      if (permission === 'prompt') {
        setState('needs-permission');
        return;
      }
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

  const releaseHeldMicrophone = useCallback(() => {
    if (!heldStreamRef.current) return;
    releaseMicrophone(heldStreamRef.current);
    heldStreamRef.current = null;
  }, []);

  /**
   * Opens the microphone and hands back what was heard.
   *
   * Reports nothing when asked to stay quiet, which is how it is called straight after
   * a grant: a browser that wants the press itself will refuse that start, and saying
   * so would be reporting our own attempt as the reader's failure. The button is left
   * pulsing to invite the press instead.
   *
   * Returns whether listening began.
   */
  const beginListening = useCallback(
    (quietly = false) => {
      let retryCount = 0;
      const MAX_RETRIES = 1;

      const attempt = (): boolean => {
        let session: RecognitionSession;
        try {
          session = createRecognizer(resolveRecognizerKind()).listen(language);
        } catch (cause) {
          setState('idle');
          if (!quietly) setError('failed');
          releaseHeldMicrophone();
          console.error('Voice search could not start:', cause);
          return false;
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
            releaseHeldMicrophone();
            if (transcript) onTranscriptRef.current(transcript);
          })
          .catch((cause: unknown) => {
            sessionRef.current = null;
            releaseHeldMicrophone();
            const unavailable = cause instanceof MicrophoneUnavailableError;
            // A grant withdrawn in browser settings after the fact leaves a remembered
            // one that is no longer true, so it is dropped and asked for again rather
            // than kept and retried against a microphone that will keep refusing.
            if (unavailable) forgetMicrophoneGrant();
            const refused = unavailable && cause.denied;
            setState(refused ? 'blocked' : unavailable ? 'needs-permission' : 'idle');
            setError(refused ? 'blocked' : unavailable ? 'microphone' : 'failed');
            console.error('Voice search failed:', cause);
          });

        return true;
      };

      return attempt();
    },
    [language, releaseHeldMicrophone]
  );

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

    // Asking again would be refused without so much as a prompt, so the steps out of
    // it are repeated instead. Said on a press rather than on sight, since that is when
    // the reader has just asked to be heard and is looking for why they were not.
    if (state === 'blocked') {
      setError('blocked');
      return;
    }

    // Permission is the one thing here that has to be waited for, so it is asked for
    // on its own and listening follows it directly. The reader presses once: the
    // prompt answers, and what they say next is already being heard.
    if (state === 'needs-permission') {
      // A second press while the prompt is up would only ask twice, so it is dropped.
      // The state is left alone meanwhile: "working" would say the words are being
      // made out, which is not what is happening.
      if (requestingRef.current) return;
      requestingRef.current = true;
      void requestMicrophone()
        .then((stream) => {
          heldStreamRef.current = stream;
          // Quietly, because a browser that insists on the press itself will refuse
          // this and that is not a failure worth reporting: it leaves the button idle
          // and pulsing, which asks for the press it wants.
          if (!beginListening(true)) releaseHeldMicrophone();
        })
        .catch((cause: unknown) => {
          const refused = cause instanceof MicrophoneUnavailableError && cause.denied;
          if (refused) setState('blocked');
          setError(refused ? 'blocked' : 'microphone');
          console.error('The microphone was not allowed:', cause);
        })
        .finally(() => {
          requestingRef.current = false;
        });
      return;
    }

    if (state !== 'idle') return;

    beginListening();
  }, [beginListening, releaseHeldMicrophone, state]);

  // A microphone left open when the page moves on would keep recording, so any session
  // still running is abandoned on the way out.
  useEffect(
    () => () => {
      sessionRef.current?.abort();
      sessionRef.current = null;
      if (heldStreamRef.current) releaseMicrophone(heldStreamRef.current);
      heldStreamRef.current = null;
    },
    []
  );

  /**
   * A failure the reader can see, rather than a button that quietly slides back to
   * where it started and leaves them guessing whether it heard anything.
   *
   * Cleared once shown so that the same failure twice running is said twice: without
   * that, a second identical failure would not change the value and would go
   * unmentioned.
   */
  useEffect(() => {
    if (!error) return;
    if (error === 'blocked') {
      // Kept until dismissed: steps that fade before they are read are no steps at
      // all, and there is nothing to retry in the meantime.
      toast.error(i18n.t('notifications:voiceMicrophoneBlocked'), {
        id: BLOCKED_TOAST_ID,
        description: i18n.t(RESET_HINTS[getMicrophoneResetPlatform()]),
        duration: Infinity,
        action: {
          label: i18n.t('notifications:voiceMicrophoneBlockedDismiss'),
          onClick: () => toast.dismiss(BLOCKED_TOAST_ID),
        },
      });
    } else if (error === 'microphone') {
      toast.error(i18n.t('notifications:voiceMicrophoneDenied'), {
        description: i18n.t('notifications:voiceMicrophoneDeniedDesc'),
      });
    } else {
      toast.error(i18n.t('notifications:voiceSearchFailed'), {
        description: i18n.t('notifications:voiceSearchFailedDesc'),
      });
    }
    setError(null);
  }, [error, i18n]);

  return { state, error, start, stop };
}
