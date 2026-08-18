import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  forgetMicrophoneGrant,
  isMicrophoneGranted,
  releaseMicrophone,
  requestMicrophone,
} from '../microphone-permission';
import { MicrophoneUnavailableError } from '../types';

/**
 * The shared test setup replaces localStorage with a stub that always reads back
 * null, so a remembered grant could never be observed through it. Tests that turn on
 * remembering install a working store of their own instead.
 */
function useWorkingLocalStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  });
}

/**
 * Settling permission before a recognition starts is the whole point of this, so what
 * counts as settled is worth pinning down: a first press that starts listening while
 * the prompt is still up hears nothing at all.
 */
describe('isMicrophoneGranted', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('is granted where the browser says so', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
    });
    expect(await isMicrophoneGranted()).toBe(true);
  });

  it('is not granted where the reader has yet to be asked', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
    });
    expect(await isMicrophoneGranted()).toBe(false);
  });

  it('is not granted where it was refused', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    });
    expect(await isMicrophoneGranted()).toBe(false);
  });

  /**
   * Safari will not answer for the microphone, and asking getUserMedia to find out
   * would show the very prompt being asked about, so a past grant is remembered.
   */
  it('falls back to a remembered grant where the browser will not say', async () => {
    useWorkingLocalStorage();
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
    });
    expect(await isMicrophoneGranted()).toBe(false);

    const stream = { getTracks: () => [{ stop: vi.fn() }] };
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    await requestMicrophone();

    expect(await isMicrophoneGranted()).toBe(true);
  });
});

describe('requestMicrophone', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  /**
   * Releasing it here would take the device down again, and listening that starts
   * straight afterwards would open against a microphone still being torn down and
   * hear nothing. That is the whole reason the caller is given it to hold.
   */
  it('hands the stream back still open, for listening to take over', async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const granted = await requestMicrophone();

    expect(granted).toBe(stream);
    expect(stop).not.toHaveBeenCalled();
  });

  it('reports a refusal as a microphone failure, which the reader can act on', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
    });

    await expect(requestMicrophone()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
  });

  it('does not remember a grant that was refused', async () => {
    useWorkingLocalStorage();
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
    });

    await expect(requestMicrophone()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
    expect(await isMicrophoneGranted()).toBe(false);
  });
});

describe('releaseMicrophone', () => {
  it('closes the device, once listening has its own hold on it', () => {
    const stop = vi.fn();

    releaseMicrophone({ getTracks: () => [{ stop }] } as unknown as MediaStream);

    expect(stop).toHaveBeenCalledTimes(1);
  });
});

/**
 * A grant withdrawn in browser settings after the fact would otherwise leave a
 * remembered one that is no longer true, and every press would be refused.
 */
describe('forgetMicrophoneGrant', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('drops a remembered grant so it is asked for again', async () => {
    useWorkingLocalStorage();
    const stream = { getTracks: () => [{ stop: vi.fn() }] };
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    await requestMicrophone();
    expect(await isMicrophoneGranted()).toBe(true);

    forgetMicrophoneGrant();

    expect(await isMicrophoneGranted()).toBe(false);
  });
});
