import { describe, expect, it } from 'vitest';
import { isNativeRecognizerSupported } from '../native-recognizer';

/**
 * Disabled outright: several Chromium forks (Samsung Internet, and Perplexity's
 * Comet, which reports an unmodified Chrome user agent) crash the renderer process
 * the instant SpeechRecognition is constructed, so the API's mere presence cannot
 * be trusted. Voice search always falls back to the bundled local model instead.
 */
describe('isNativeRecognizerSupported', () => {
  it('is always unsupported, regardless of what the browser advertises', () => {
    expect(isNativeRecognizerSupported()).toBe(false);
  });
});
