import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  forgetMicrophoneGrant,
  getMicrophonePermission,
  getMicrophoneResetPlatform,
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

/** A rejection of the shape getUserMedia gives, which is told apart by its name. */
function failWith(name: string): Error {
  const cause = new Error(name);
  cause.name = name;
  return cause;
}

/**
 * Settling permission before a recognition starts is the whole point of this, so what
 * counts as settled is worth pinning down: a first press that starts listening while
 * the prompt is still up hears nothing at all.
 */
describe('getMicrophonePermission', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('is granted where the browser says so, so a press can listen at once', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
    });
    expect(await getMicrophonePermission()).toBe('granted');
  });

  it('is still to be asked where the reader has not been', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
    });
    expect(await getMicrophonePermission()).toBe('prompt');
  });

  /**
   * Told apart from not yet asked, because a press cannot undo it: asking again is
   * refused without a prompt, so the reader has to be sent to browser settings.
   */
  it('is refused where it was refused, which no press can undo', async () => {
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    });
    expect(await getMicrophonePermission()).toBe('denied');
  });

  /**
   * Safari will not answer for the microphone, and asking getUserMedia to find out
   * would show the very prompt being asked about, so a past grant is remembered. A
   * refusal cannot be known there ahead of a press at all.
   */
  it('falls back to a remembered grant where the browser will not say', async () => {
    useWorkingLocalStorage();
    const unanswered = {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
    };
    vi.stubGlobal('navigator', unanswered);
    expect(await getMicrophonePermission()).toBe('prompt');

    vi.stubGlobal('navigator', {
      ...unanswered,
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
    });
    await requestMicrophone();

    expect(await getMicrophonePermission()).toBe('granted');
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

  it('marks a refusal as refused, since only that can be undone in settings', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(failWith('NotAllowedError')) },
    });

    await expect(requestMicrophone()).rejects.toMatchObject({
      name: 'MicrophoneUnavailableError',
      denied: true,
    });
  });

  /**
   * A device with no microphone is not a refusal, and sending that reader to a
   * setting would send them after something that is not there.
   */
  it('does not call a missing microphone a refusal', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(failWith('NotFoundError')) },
    });

    await expect(requestMicrophone()).rejects.toMatchObject({ denied: false });
  });

  it('reports any failure as a microphone failure the reader is told about', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(failWith('NotAllowedError')) },
    });

    await expect(requestMicrophone()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
  });

  it('does not remember a grant that was refused', async () => {
    useWorkingLocalStorage();
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(failWith('NotAllowedError')) },
    });

    await expect(requestMicrophone()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
    expect(await getMicrophonePermission()).toBe('prompt');
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
 * Which steps to give depends on where the setting lives, which is a matter of
 * platform rather than of browser: every browser on iOS is the same WebKit underneath
 * and shares one place to change it.
 */
describe('getMicrophoneResetPlatform', () => {
  afterEach(() => vi.unstubAllGlobals());

  const AGENTS: Array<[string, string, string]> = [
    [
      'ios',
      'iPhone Safari',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ],
    [
      'ios',
      'Chrome on iOS, which is WebKit underneath',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1',
    ],
    [
      'safari',
      'Safari on macOS',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    ],
    [
      'android',
      'Chrome on Android',
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    ],
    [
      'chrome',
      'Chrome on a desktop',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    [
      'firefox',
      'Firefox on a desktop',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    ],
  ];

  it.each(AGENTS)('describes %s for %s', (platform, _name, userAgent) => {
    vi.stubGlobal('navigator', { userAgent, maxTouchPoints: 0 });
    expect(getMicrophoneResetPlatform()).toBe(platform);
  });

  /** An iPad claims to be a Mac, and gives itself away by having a touchscreen. */
  it('describes ios for an iPad claiming to be a Mac', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      maxTouchPoints: 5,
    });
    expect(getMicrophoneResetPlatform()).toBe('ios');
  });

  it('falls back to something true of every browser', () => {
    vi.stubGlobal('navigator', { userAgent: 'some browser nobody has heard of', maxTouchPoints: 0 });
    expect(getMicrophoneResetPlatform()).toBe('generic');
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
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockRejectedValue(new TypeError('unsupported')) },
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
    });
    await requestMicrophone();
    expect(await getMicrophonePermission()).toBe('granted');

    forgetMicrophoneGrant();

    expect(await getMicrophonePermission()).toBe('prompt');
  });
});
