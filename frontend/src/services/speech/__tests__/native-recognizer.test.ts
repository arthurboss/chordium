import { afterEach, describe, expect, it, vi } from 'vitest';
import { isNativeRecognizerSupported } from '../native-recognizer';

/**
 * The guard is what keeps the microphone button from appearing where it could not
 * work, so both halves of it are worth pinning down.
 */
describe('isNativeRecognizerSupported', () => {
  const scope = globalThis as Record<string, unknown>;

  afterEach(() => {
    vi.unstubAllGlobals();
    delete scope.SpeechRecognition;
  });

  function stubRecognition(withProcessLocally: boolean) {
    class FakeRecognition {}
    if (withProcessLocally) {
      Object.defineProperty(FakeRecognition.prototype, 'processLocally', { value: false });
    }
    vi.stubGlobal('SpeechRecognition', FakeRecognition);
  }

  it('is supported when the build implements on-device recognition in a secure context', () => {
    vi.stubGlobal('isSecureContext', true);
    stubRecognition(true);
    expect(isNativeRecognizerSupported()).toBe(true);
  });

  it('is unsupported over plain http, where the microphone is refused', () => {
    vi.stubGlobal('isSecureContext', false);
    stubRecognition(true);
    expect(isNativeRecognizerSupported()).toBe(false);
  });

  it('is unsupported on a build that only recognises speech in the cloud', () => {
    vi.stubGlobal('isSecureContext', true);
    stubRecognition(false);
    expect(isNativeRecognizerSupported()).toBe(false);
  });

  it('is unsupported where the API is absent altogether', () => {
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('SpeechRecognition', undefined);
    vi.stubGlobal('webkitSpeechRecognition', undefined);
    expect(isNativeRecognizerSupported()).toBe(false);
  });
});
