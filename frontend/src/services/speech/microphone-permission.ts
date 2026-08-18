import { MicrophoneUnavailableError } from './types';

/**
 * Settles microphone permission before a recognition is started.
 *
 * The browser's own recogniser opens the microphone itself, so nothing here is
 * needed to record. It exists because of *when* that happens: starting a
 * recognition has to be the first thing a press does, with nothing awaited before
 * it, or Safari refuses it for want of a user gesture. On a first ever press that
 * leaves the recognition running against a microphone that is not open yet, while
 * the reader is still answering the permission prompt, and it hears nothing at all.
 *
 * Asking separately, in a press of its own, is what lets permission be waited for.
 */

/**
 * Remembered because Safari will not answer permissions.query() for the
 * microphone, and asking getUserMedia() to find out would show the very prompt
 * being asked about. A grant survives reloads, so a remembered one is worth more
 * than a prompt the reader did not ask for.
 */
const GRANTED_KEY = 'chordium_microphone_granted';

function remember(granted: boolean): void {
  try {
    if (granted) localStorage.setItem(GRANTED_KEY, '1');
    else localStorage.removeItem(GRANTED_KEY);
  } catch {
    // Private modes refuse storage. Costs a prompt next time, nothing worse.
  }
}

function remembered(): boolean {
  try {
    return localStorage.getItem(GRANTED_KEY) === '1';
  } catch {
    return false;
  }
}

/** What the browser will say about the microphone before anything is asked of it. */
export type MicrophonePermission = 'granted' | 'denied' | 'prompt';

/**
 * Where the microphone stands, so that a press can start listening at once, ask, or
 * explain itself, rather than all three looking the same.
 *
 * Refused is worth telling apart from not yet asked: a press cannot undo a refusal,
 * and asking again would silently do nothing, so the reader has to be told where to
 * undo it instead.
 *
 * Safari will not answer, and asking getUserMedia to find out would show the very
 * prompt being asked about. A remembered grant stands in there, and a refusal cannot
 * be known ahead of a press at all: it surfaces when one is refused.
 */
export async function getMicrophonePermission(): Promise<MicrophonePermission> {
  try {
    const status = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    const state = status.state as MicrophonePermission;
    remember(state === 'granted');
    return state;
  } catch {
    return remembered() ? 'granted' : 'prompt';
  }
}

/**
 * Asks for the microphone and hands back the open stream.
 *
 * The stream is not what was wanted, since the recogniser opens its own. It is handed
 * back rather than closed here so that the caller decides when to let go, which
 * matters: Android hands the microphone to one holder at a time, so ours has to be
 * released before listening reaches for it, or its recogniser starts against a device
 * it cannot have and reports silence. Desktop shares it happily and does not care
 * either way.
 *
 * The caller owns it, and must release it with `releaseMicrophone`.
 */
export async function requestMicrophone(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    remember(true);
    return stream;
  } catch (cause) {
    remember(false);
    throw new MicrophoneUnavailableError(String(cause), isRefusal(cause));
  }
}

/**
 * Whether the browser refused rather than failed. A refusal is the reader's, and can
 * only be undone in browser settings; anything else is the device's, and telling them
 * to change a setting would send them after something that is not there.
 */
function isRefusal(cause: unknown): boolean {
  if (!(cause instanceof Error)) return false;
  return cause.name === 'NotAllowedError' || cause.name === 'SecurityError';
}

/** Which browser's route back to a refused microphone should be described. */
export type MicrophoneResetPlatform = 'ios' | 'safari' | 'android' | 'chrome' | 'firefox' | 'generic';

/**
 * Which set of steps will get the reader back to a working microphone.
 *
 * By platform rather than by browser, because that is what decides where the setting
 * lives: every browser on iOS is the same WebKit underneath and shares one place to
 * change it, whoever wrapped it.
 */
export function getMicrophoneResetPlatform(): MicrophoneResetPlatform {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const ua = nav?.userAgent ?? '';
  // An iPad says Macintosh, and gives itself away by having a touchscreen.
  const isIos = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav?.maxTouchPoints ?? 0) > 1);
  if (isIos) return 'ios';
  if (/Firefox\/|FxiOS/.test(ua)) return 'firefox';
  if (/Android/.test(ua)) return 'android';
  if (/Chrome|Chromium|Edg|OPR/.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  return 'generic';
}

/**
 * Lets go of a stream from `requestMicrophone`, closing the device with it, so that
 * whatever listens next can have it.
 */
export function releaseMicrophone(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Called when a recognition is refused for want of permission, so that a grant
 * withdrawn in browser settings after the fact is asked for again rather than
 * assumed from what was remembered.
 */
export function forgetMicrophoneGrant(): void {
  remember(false);
}
