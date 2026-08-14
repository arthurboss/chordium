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
