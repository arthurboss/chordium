import { vi } from 'vitest';

const toastError = vi.hoisted(() => vi.fn());
const canListen = vi.hoisted(() => vi.fn());
const requiresDownloadConsent = vi.hoisted(() => vi.fn());
const resolveRecognizerKind = vi.hoisted(() => vi.fn());
const createRecognizer = vi.hoisted(() => vi.fn());
const getMicrophonePermission = vi.hoisted(() => vi.fn());
const getMicrophoneResetPlatform = vi.hoisted(() => vi.fn(() => 'chrome'));
const forgetMicrophoneGrant = vi.hoisted(() => vi.fn());
const requestMicrophone = vi.hoisted(() => vi.fn());
const releaseMicrophone = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({ toast: { error: toastError, dismiss: vi.fn() } }));

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
  getMicrophonePermission,
  getMicrophoneResetPlatform,
  forgetMicrophoneGrant,
  requestMicrophone,
  releaseMicrophone,
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
    getMicrophonePermission.mockResolvedValue('granted');
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

  it('says the microphone is missing, which is not something settings will fix', async () => {
    listenWith(() => Promise.reject(new MicrophoneUnavailableError('no device', false)));

    await startedHook();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('notifications:voiceMicrophoneDenied', {
        description: 'notifications:voiceMicrophoneDeniedDesc',
      })
    );
  });

  it('asks for the microphone again where it went missing rather than being refused', async () => {
    listenWith(() => Promise.reject(new MicrophoneUnavailableError('no device', false)));

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

/**
 * The reader presses once: the prompt answers, and what they say next is already
 * being heard. Asking and then waiting to be asked again was a press that earned
 * nothing.
 */
describe('useVoiceSearch listens as soon as the microphone is allowed', () => {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] };

  beforeEach(() => {
    vi.clearAllMocks();
    canListen.mockReturnValue(true);
    requiresDownloadConsent.mockResolvedValue(false);
    resolveRecognizerKind.mockReturnValue('native');
    // Not yet allowed, so the first press is the one that asks.
    getMicrophonePermission.mockResolvedValue('prompt');
    requestMicrophone.mockResolvedValue(stream);
    createRecognizer.mockReturnValue({
      id: 'native',
      listen: () => ({ stop: vi.fn(), abort: vi.fn(), transcript: new Promise<string>(() => {}) }),
    });
  });

  async function pressOnce() {
    const hook = renderHook(() => useVoiceSearch({ onTranscript: vi.fn() }));
    await waitFor(() => expect(hook.result.current.state).toBe('needs-permission'));
    await act(async () => {
      hook.result.current.start();
    });
    return hook;
  }

  it('begins listening on the same press that asked', async () => {
    const { result } = await pressOnce();

    await waitFor(() => expect(result.current.state).toBe('listening'));
  });

  /**
   * Released only once listening holds the device itself, so it never goes down and
   * comes back up in between, which is what left the first recording silent.
   */
  it('keeps the microphone open across the handover', async () => {
    await pressOnce();

    await waitFor(() => expect(createRecognizer).toHaveBeenCalled());
    expect(releaseMicrophone).not.toHaveBeenCalled();
  });

  /**
   * Some browsers insist the press itself begins the recognition, and refuse one
   * started after an await. That is our attempt failing, not the reader's, so it is
   * left ready to be pressed rather than reported.
   */
  it('waits to be pressed again where the browser refuses to start itself', async () => {
    createRecognizer.mockReturnValue({
      id: 'native',
      listen: () => {
        throw new Error('not allowed without a gesture');
      },
    });

    const { result } = await pressOnce();

    await waitFor(() => expect(result.current.state).toBe('idle'));
    expect(toastError).not.toHaveBeenCalled();
    expect(releaseMicrophone).toHaveBeenCalled();
  });
});

/**
 * A refused microphone cannot be asked for again: the browser answers no without so
 * much as a prompt. Only browser settings undo it, and an average reader does not know
 * where those are, so the way back has to be spelled out or voice search is over for
 * them for good.
 */
describe('useVoiceSearch explains a refused microphone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canListen.mockReturnValue(true);
    requiresDownloadConsent.mockResolvedValue(false);
    resolveRecognizerKind.mockReturnValue('native');
    getMicrophoneResetPlatform.mockReturnValue('ios');
  });

  it('says so on the button, rather than inviting a press that does nothing', async () => {
    getMicrophonePermission.mockResolvedValue('denied');

    const { result } = renderHook(() => useVoiceSearch({ onTranscript: vi.fn() }));

    await waitFor(() => expect(result.current.state).toBe('blocked'));
  });

  it('gives the steps for this browser, and keeps them until dismissed', async () => {
    getMicrophonePermission.mockResolvedValue('denied');
    const { result } = renderHook(() => useVoiceSearch({ onTranscript: vi.fn() }));
    await waitFor(() => expect(result.current.state).toBe('blocked'));

    await act(async () => {
      result.current.start();
    });

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'notifications:voiceMicrophoneBlocked',
        expect.objectContaining({
          description: 'notifications:voiceMicrophoneBlockedIos',
          duration: Infinity,
        })
      )
    );
  });

  /**
   * Refused at the prompt rather than beforehand, which is the mistaken tap this is
   * really for: the reader meant to allow it and hit the wrong button.
   */
  it('explains itself when the prompt itself is refused', async () => {
    getMicrophonePermission.mockResolvedValue('prompt');
    requestMicrophone.mockRejectedValue(new MicrophoneUnavailableError('refused', true));
    const { result } = renderHook(() => useVoiceSearch({ onTranscript: vi.fn() }));
    await waitFor(() => expect(result.current.state).toBe('needs-permission'));

    await act(async () => {
      result.current.start();
    });

    await waitFor(() => expect(result.current.state).toBe('blocked'));
    expect(toastError).toHaveBeenCalledWith(
      'notifications:voiceMicrophoneBlocked',
      expect.objectContaining({ description: 'notifications:voiceMicrophoneBlockedIos' })
    );
  });
});
