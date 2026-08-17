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
