import { afterEach, describe, expect, it, vi } from 'vitest';
import { isNativeRecognizerSupported } from '../native-recognizer';

/**
 * The guard is what keeps the microphone button from appearing where it could not
 * work, so both halves of it are worth pinning down.
 */
describe('isNativeRecognizerSupported', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is supported wherever the API exists in a secure context', () => {
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', class {});
    expect(isNativeRecognizerSupported()).toBe(true);
  });

  it('is supported through the prefixed name older builds use', () => {
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', undefined);
    vi.stubGlobal('webkitSpeechRecognition', class {});
    expect(isNativeRecognizerSupported()).toBe(true);
  });

  it('is unsupported over plain http, where the microphone is refused', () => {
    vi.stubGlobal('isSecureContext', false);
    vi.stubGlobal('SpeechRecognition', class {});
    expect(isNativeRecognizerSupported()).toBe(false);
  });

  it('is unsupported where the API is absent altogether', () => {
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', undefined);
    vi.stubGlobal('webkitSpeechRecognition', undefined);
    expect(isNativeRecognizerSupported()).toBe(false);
  });
});

/**
 * On-device recognition kills the renderer process on Chromium builds that
 * advertise SpeechRecognition without providing media.mojom.OnDeviceSpeechRecognition
 * (Samsung Internet, Perplexity's Comet). The crash is below the JS layer and so
 * cannot be caught, which is why it must never be asked for in the first place.
 */
describe('on-device recognition', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('never probes SpeechRecognition.available()', async () => {
    const available = vi.fn().mockResolvedValue('available');
    class Recognition {
      static available = available;
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult = null;
      onerror = null;
      onend: (() => void) | null = null;
      start() {
        this.onend?.();
      }
      stop() {}
      abort() {}
    }
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', Recognition);

    const { createNativeRecognizer } = await import('../native-recognizer');
    await createNativeRecognizer().listen('en').transcript;

    expect(available).not.toHaveBeenCalled();
  });

  it('never sets processLocally on the recognition it starts', async () => {
    const seen: Record<string, unknown> = {};
    class Recognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult = null;
      onerror = null;
      onend: (() => void) | null = null;
      start() {
        Object.assign(seen, { ...this });
        this.onend?.();
      }
      stop() {}
      abort() {}
    }
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', Recognition);

    const { createNativeRecognizer } = await import('../native-recognizer');
    await createNativeRecognizer().listen('en').transcript;

    expect(seen).not.toHaveProperty('processLocally');
  });
});

/**
 * Safari holds the microphone after a recognition has ended, so the reader was left
 * shown as being listened to long after their search had come back, with nothing on
 * the page that would stop it. Chrome lets go by itself, which is why this only
 * showed there.
 */
describe('letting go of the microphone', () => {
  afterEach(() => vi.unstubAllGlobals());

  /** A recognition that records what was asked of it and can be driven by hand. */
  function stubRecognition() {
    const calls: string[] = [];
    class Recognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onend: (() => void) | null = null;
      static latest: Recognition | null = null;
      constructor() {
        Recognition.latest = this;
      }
      start() {
        calls.push('start');
      }
      stop() {
        calls.push('stop');
      }
      abort() {
        calls.push('abort');
      }
    }
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', Recognition);
    return { calls, get current() { return Recognition.latest!; } };
  }

  it('lets go once the recognition reports itself ended', async () => {
    const stub = stubRecognition();
    const { createNativeRecognizer } = await import('../native-recognizer');

    const session = createNativeRecognizer().listen('en');
    stub.current.onend?.();
    await session.transcript;

    expect(stub.calls).toContain('abort');
  });

  /** Aborting twice, or after it has already ended, must not reach for it again. */
  it('lets go only once, however often it is asked', async () => {
    const stub = stubRecognition();
    const { createNativeRecognizer } = await import('../native-recognizer');

    const session = createNativeRecognizer().listen('en');
    stub.current.onend?.();
    await session.transcript;
    session.abort();
    session.abort();

    expect(stub.calls.filter((call) => call === 'abort')).toHaveLength(1);
  });

  /**
   * Abandoning a session has to settle it too, or whoever is waiting on the transcript
   * waits for good. A reader who changed their mind said nothing, so it settles empty.
   */
  it('settles empty when abandoned, rather than leaving the caller waiting', async () => {
    const stub = stubRecognition();
    const { createNativeRecognizer } = await import('../native-recognizer');

    const session = createNativeRecognizer().listen('en');
    session.abort();

    await expect(session.transcript).resolves.toBe('');
  });

  /**
   * Asking it to stop is asking for what it heard, so the microphone stays until the
   * recognition itself reports ended: letting go here would cut off the answer.
   */
  it('does not let go merely because it was asked to stop', async () => {
    const stub = stubRecognition();
    const { createNativeRecognizer } = await import('../native-recognizer');

    const session = createNativeRecognizer().listen('en');
    session.stop();

    expect(stub.calls).toContain('stop');
    expect(stub.calls).not.toContain('abort');
  });
});
