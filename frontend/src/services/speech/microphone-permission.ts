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

/**
 * Whether the microphone is already granted, so a press can start listening at
 * once rather than asking first.
 *
 * "Denied" and "not yet asked" are both false: neither can hear anything without
 * the reader being asked, which is the same next step either way.
 */
export async function isMicrophoneGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    const granted = status.state === 'granted';
    remember(granted);
    return granted;
  } catch {
    return remembered();
  }
}

/**
 * Asks for the microphone and lets it go again immediately.
 *
 * The stream itself is not wanted: the recogniser opens its own. All this leaves
 * behind is the grant, so that the press after this one can start listening with
 * the microphone already open.
 */
export async function requestMicrophone(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    remember(true);
  } catch (cause) {
    remember(false);
    throw new MicrophoneUnavailableError(String(cause));
  }
}

/**
 * Called when a recognition is refused for want of permission, so that a grant
 * withdrawn in browser settings after the fact is asked for again rather than
 * assumed from what was remembered.
 */
export function forgetMicrophoneGrant(): void {
  remember(false);
}
