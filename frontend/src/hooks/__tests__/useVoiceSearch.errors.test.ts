import { vi } from 'vitest';

const toastError = vi.hoisted(() => vi.fn());
const canListen = vi.hoisted(() => vi.fn());
const requiresDownloadConsent = vi.hoisted(() => vi.fn());
const resolveRecognizerKind = vi.hoisted(() => vi.fn());
const createRecognizer = vi.hoisted(() => vi.fn());
const isMicrophoneGranted = vi.hoisted(() => vi.fn());
const forgetMicrophoneGrant = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({ toast: { error: toastError } }));

// Keys stand in for the copy, so a message only needs to be distinguishable.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: 'en', t: (key: string) => key },
  }),
}));

vi.mock('@/services/speech/get-recognizer', () => ({
  canListen,
  requiresDownloadConsent,
  resolveRecognizerKind,
  createRecognizer,
}));

vi.mock('@/services/speech/microphone-permission', () => ({
  isMicrophoneGranted,
  forgetMicrophoneGrant,
  requestMicrophone: vi.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useVoiceSearch } from '../useVoiceSearch';
import { MicrophoneUnavailableError, RecognizerUnavailableError } from '@/services/speech/types';

/**
 * A failure used to leave the button quietly sliding back to where it started, so a
 * reader had no way of telling whether anything had been heard.
 */
describe('useVoiceSearch failures are shown to the reader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canListen.mockReturnValue(true);
    requiresDownloadConsent.mockResolvedValue(false);
    resolveRecognizerKind.mockReturnValue('native');
    isMicrophoneGranted.mockResolvedValue(true);
  });

  /**
   * Listens, then settles however the test asks. The outcome is built inside listen so
   * that a rejection is created only once there is something about to handle it: built
   * ahead of time it would sit unhandled in between and be reported as such.
   */
  function listenWith(outcome: () => Promise<string>) {
    createRecognizer.mockReturnValue({
      id: 'native',
      listen: () => ({ stop: vi.fn(), abort: vi.fn(), transcript: outcome() }),
    });
  }

  async function startedHook() {
    const hook = renderHook(() => useVoiceSearch({ onTranscript: vi.fn() }));
    await waitFor(() => expect(hook.result.current.state).toBe('idle'));
    await act(async () => {
      hook.result.current.start();
    });
    return hook;
  }

  it('says the microphone was refused, which the reader can act on', async () => {
    listenWith(() => Promise.reject(new MicrophoneUnavailableError('refused')));

    await startedHook();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('notifications:voiceMicrophoneDenied', {
        description: 'notifications:voiceMicrophoneDeniedDesc',
      })
    );
  });

  it('asks for the microphone again once it has been refused', async () => {
    listenWith(() => Promise.reject(new MicrophoneUnavailableError('refused')));

    const { result } = await startedHook();

    await waitFor(() => expect(result.current.state).toBe('needs-permission'));
    expect(forgetMicrophoneGrant).toHaveBeenCalled();
  });

  it('says any other failure differently, since the reader cannot act on it', async () => {
    listenWith(() => Promise.reject(new RecognizerUnavailableError('broke')));

    await startedHook();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('notifications:voiceSearchFailed', {
        description: 'notifications:voiceSearchFailedDesc',
      })
    );
  });

  /**
   * Cleared once shown, so that the same failure twice running is said twice rather
   * than going unmentioned the second time for not having changed.
   */
  it('says the same failure again when it happens again', async () => {
    listenWith(() => Promise.reject(new RecognizerUnavailableError('broke')));
    const { result } = await startedHook();
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(result.current.error).toBeNull());
    listenWith(() => Promise.reject(new RecognizerUnavailableError('broke')));
    await waitFor(() => expect(result.current.state).toBe('idle'));
    await act(async () => {
      result.current.start();
    });

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(2));
  });

  it('says nothing where there was no failure', async () => {
    listenWith(() => Promise.resolve('hotel california'));

    await startedHook();

    await waitFor(() => expect(toastError).not.toHaveBeenCalled());
  });
});
