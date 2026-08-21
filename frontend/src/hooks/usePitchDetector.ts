import { useCallback, useEffect, useRef, useState } from 'react';
import {
  forgetMicrophoneGrant,
  getMicrophonePermission,
  releaseMicrophone,
  requestMicrophone,
} from '@/services/speech/microphone-permission';
import { MicrophoneUnavailableError } from '@/services/speech/types';
import { setupPitchDetection } from '@/features/tuner/pitch-handler';

/**
 * Where the tuner has got to:
 * - "idle": ready, waiting to be asked.
 * - "requesting": the microphone permission/prompt is being settled.
 * - "listening": the microphone is open and the worklet is analyzing audio.
 * - "blocked": the microphone was refused, and only browser settings can undo it.
 * - "error": the microphone could not be opened for some other reason.
 */
export type TunerStatus = 'idle' | 'requesting' | 'listening' | 'blocked' | 'error';

export interface PitchResult {
  frequency: number | null;
  note: string | null;
  octave: number | null;
  cents: number | null; // -50 to +50, 0 = in tune
  isInTune: boolean;
}

const EMPTY_PITCH: PitchResult = {
  frequency: null,
  note: null,
  octave: null,
  cents: null,
  isInTune: false,
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQ = 440;
const A4_MIDI = 69;
const IN_TUNE_THRESHOLD = 5; // cents

/**
 * Maps a frequency to the nearest note, octave and how far off in cents. Pure
 * math, so it stays on the main thread - only the pitch detection loop that
 * produces the frequency needed to move into the AudioWorklet.
 */
export function frequencyToNoteInfo(freq: number): Omit<PitchResult, 'frequency'> {
  const midiNote = 12 * Math.log2(freq / A4_FREQ) + A4_MIDI;
  const roundedMidi = Math.round(midiNote);
  const cents = Math.round((midiNote - roundedMidi) * 100);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
    isInTune: Math.abs(cents) <= IN_TUNE_THRESHOLD,
  };
}

/**
 * Listens to the microphone and reports the detected pitch, note and tuning
 * offset in real time.
 *
 * Pitch detection and the smoothing over it both run off the main thread in an
 * AudioWorklet (see pitch-worklet.ts / pitch-handler.ts), so UI jank cannot
 * degrade tuning accuracy and what arrives here is already stable enough to
 * render as it comes. Microphone access goes through the same permission module the
 * voice-search feature uses (services/speech/microphone-permission.ts) - it is
 * audio-source-agnostic despite the folder name, and already handles Safari's
 * user-gesture timing, Android's one-mic-at-a-time sharing, and telling a
 * refusal apart from "no device".
 */
export function usePitchDetector() {
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [pitch, setPitch] = useState<PitchResult>(EMPTY_PITCH);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const disconnectRef = useRef<(() => void) | null>(null);
  // Guards against overlapping start() calls (e.g. a second press while the
  // permission prompt from the first is still up).
  const startingRef = useRef(false);

  // Device labels are blank until a stream has been granted at least once, so
  // this only turns up anything real once listening has started - refreshed
  // again on devicechange for a mic plugged in mid-session.
  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === 'audioinput'));
    } catch {
      // Enumeration failing just leaves the picker empty; the browser default
      // device still works.
    }
  }, []);

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
  }, [refreshDevices]);

  const stop = useCallback(() => {
    disconnectRef.current?.();
    disconnectRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      releaseMicrophone(streamRef.current);
      streamRef.current = null;
    }

    setStatus('idle');
    setPitch(EMPTY_PITCH);
  }, []);

  const start = useCallback(async (deviceId?: string) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setStatus('requesting');

    try {
      const permission = await getMicrophonePermission();
      if (permission === 'denied') {
        setStatus('blocked');
        return;
      }

      const stream = await requestMicrophone(deviceId, { rawAudio: true });
      streamRef.current = stream;
      // The id actually in use, which is what the picker should show as
      // selected even on the very first, device-agnostic start.
      setSelectedDeviceId(stream.getAudioTracks()[0]?.getSettings().deviceId ?? deviceId ?? null);
      void refreshDevices();

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);

      const { disconnect } = await setupPitchDetection(source, ctx, {
        onPitch: (frequency) => {
          if (frequency === null) {
            setPitch((prev) => ({ ...prev, frequency: null }));
            return;
          }
          setPitch({
            frequency: Math.round(frequency * 10) / 10,
            ...frequencyToNoteInfo(frequency),
          });
        },
      });
      disconnectRef.current = disconnect;

      setStatus('listening');
    } catch (cause) {
      const unavailable = cause instanceof MicrophoneUnavailableError;
      // A grant withdrawn in browser settings after the fact leaves a
      // remembered one that is no longer true - drop it so the next press asks
      // again instead of assuming a grant that will keep failing.
      if (unavailable) forgetMicrophoneGrant();
      setStatus(unavailable && cause.denied ? 'blocked' : 'error');
      streamRef.current = null;
      audioContextRef.current = null;
      console.error('Tuner could not start:', cause);
    } finally {
      startingRef.current = false;
    }
  }, [refreshDevices]);

  // A microphone left open when the page moves on would keep recording, so
  // anything still running is torn down on the way out.
  useEffect(() => () => stop(), [stop]);

  const selectDevice = useCallback(
    (deviceId: string) => {
      stop();
      void start(deviceId);
    },
    [start, stop]
  );

  return { status, pitch, start, stop, devices, selectedDeviceId, selectDevice };
}
