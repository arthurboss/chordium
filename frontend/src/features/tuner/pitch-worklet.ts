/// <reference lib="webworker" />

/**
 * The AudioWorklet globals.
 *
 * TypeScript ships no lib for these: a worklet runs in its own scope, separate
 * from the window and from a worker, and they exist nowhere else. Declared here
 * rather than pulled in as a dependency, since this is the only file that runs
 * in that scope. Mirrors the identical declaration in vad-worklet.ts - each
 * worklet file is compiled as its own module (moduleDetection: "force"), so the
 * two do not collide as global ambient declarations would.
 */
declare abstract class AudioWorkletProcessor {
  /** Channel back to the AudioWorkletNode on the main thread. */
  readonly port: MessagePort;
}

declare function registerProcessor(
  name: string,
  processor: new () => AudioWorkletProcessor
): void;

/** Sample rate of the audio context the worklet was created in. */
declare const sampleRate: number;

/** Samples held for analysis. Split between the comparison window and the lag
 *  range searched across it, so it has to hold both (see WINDOW_SIZE). */
const BUFFER_SIZE = 2048;
/** Samples compared against themselves at each candidate lag. Half the buffer,
 *  leaving the other half as room for the lag to slide into without running off
 *  the end. 1024 samples is ~23ms, several cycles of even the lowest string. */
const WINDOW_SIZE = BUFFER_SIZE / 2;
/** Samples accumulated between estimates. ~23ms at 44.1kHz, which is both a
 *  smooth enough update rate for a needle and long enough to keep the O(n^2)
 *  difference function off the audio thread's critical path. */
const HOP_SIZE = 1024;
const MIN_FREQ = 60;
const MAX_FREQ = 1400;
/**
 * The noise gate is relative to the room rather than to a fixed level.
 *
 * One hardcoded threshold is wrong in both directions at once: high enough to
 * ignore a fan is high enough to ignore a softly fingerpicked note, and low
 * enough to hear that note is low enough to open on the fan. So the quiet is
 * measured instead, and the gate sits a multiple above whatever it turns out to
 * be.
 *
 * Levels below are RMS of the DC-blocked input. They are not the values a
 * reference implementation measuring further down its own chain would use: a
 * gain stage or a band-pass ahead of the measurement moves all of them.
 */
/** Weight of each frame in the running estimate of the quiet. ~1.5s to settle at
 *  this hop, slow enough that a note cannot drag the floor up behind it. */
const NOISE_FLOOR_ALPHA = 0.015;
/** Above this, a frame is too loud to be the room and is not learned from. The
 *  estimate would otherwise climb into whatever is being played and shut the
 *  gate on it. */
const NOISE_FLOOR_LEARN_CEILING = 0.005;
const NOISE_FLOOR_MIN = 0.00017;
const NOISE_FLOOR_MAX = 0.017;
/**
 * How far above the floor the gate opens, and how far it falls back before
 * closing. Two thresholds rather than one, because a signal sitting exactly on a
 * single threshold chatters the gate open and shut frame after frame.
 *
 * Bass strings need a wider margin: room noise is mostly low, so down there the
 * floor is closer to the signal it has to be told apart from.
 */
const LOW_STRING_HZ = 180;
const RATIO_OPEN_LOW = 5.0;
const RATIO_CLOSE_LOW = 3.0;
const RATIO_OPEN_HIGH = 3.5;
const RATIO_CLOSE_HIGH = 2.0;
/** Floors under the relative thresholds, so a silent room cannot learn its way
 *  down to opening the gate on nothing at all. */
const GATE_ABSOLUTE_OPEN = 0.0013;
const GATE_ABSOLUTE_CLOSE = 0.00067;
/** Frames below the closing threshold before the gate shuts. ~930ms: long enough
 *  that a note dipping mid-decay does not shut it and immediately reopen. */
const GATE_CLOSE_FRAMES = 40;
/**
 * YIN's absolute threshold. The first lag whose normalized difference dips below
 * this is taken as the period, rather than the deepest dip anywhere - which is
 * the whole point of YIN over plain autocorrelation. A string's second harmonic
 * often correlates *better* than its fundamental, so "deepest dip" reports the
 * octave above; "first dip good enough" reports the fundamental. 0.15 is the
 * value de Cheveigne & Kawahara settled on and what production tuners use.
 */
const YIN_THRESHOLD = 0.15;
/** Corner frequency of the DC blocker. Below every note this listens for, so it
 *  removes offset and handling rumble without touching a real fundamental. */
const HIGHPASS_HZ = 50;
/**
 * Estimates kept for the median. An octave misread on a pluck's attack is a lone
 * outlier among its neighbours, so a median discards it outright where an average
 * would let it pull the needle. Five frames is ~115ms of history, which costs
 * ~46ms of lag - below the point where a needle starts to feel disconnected from
 * the string.
 */
const MEDIAN_WINDOW = 5;
/**
 * How far a new estimate may sit from the smoothed value before smoothing is
 * abandoned and the needle jumps. Past this it is a different string being
 * played, not jitter around the current one, and easing across would crawl the
 * needle through every note in between.
 */
const SNAP_CENTS = 60;
/**
 * Base smoothing coefficients, by register. A low string is both the most prone
 * to a wandering reading - its fundamental is weak next to its harmonics and a
 * given wobble spans more of a cent - and the least likely to be moving fast, so
 * it is damped harder than the treble strings, which have to stay responsive.
 */
const LOW_REGISTER_HZ = 200;
const LOW_REGISTER_SMOOTHING = 0.12;
const HIGH_REGISTER_SMOOTHING = 0.3;
/**
 * How hard smoothing is applied once the note is essentially in tune, and how
 * close counts as essentially. This is what a tuner is judged on: the last few
 * cents are where the reader is watching closest and where an unsteady needle
 * makes them chase a target that will not sit still.
 */
const NEAR_CENTRE_CENTS = 8;
const NEAR_CENTRE_DAMPING = 0.3;
/**
 * Frames a reading is held through before the needle is let go. A plucked string
 * decays below the noise gate long before it stops being the note being tuned,
 * and dropping out the instant it dips there is what makes a tuner flicker
 * between a note and nothing. ~185ms, short enough not to outlive a muted string.
 */
const GATE_RELEASE_FRAMES = 8;

/**
 * YIN pitch detection.
 *
 * Replaces the naive autocorrelation this file used to run (a port of the widely
 * copied cwilso/PitchDetect demo), which picked the strongest correlation peak
 * anywhere in range and so reported the octave above whenever a harmonic beat the
 * fundamental. YIN instead normalizes the difference function by the mean
 * difference so far, which makes an absolute threshold meaningful, and takes the
 * *first* lag to clear it.
 *
 * Returns null rather than a low-confidence guess when nothing clears the
 * threshold - the silence and noise between notes has no pitch to report, and
 * inventing one for it is what makes a tuner feel twitchy.
 *
 * Expects the caller to have decided there is a signal worth analyzing at all
 * (see PitchProcessor.gateIsOpen).
 */
function detectPitch(buffer: Float32Array, sampleRateHz: number): number | null {
  const minLag = Math.max(2, Math.floor(sampleRateHz / MAX_FREQ));
  // Capped at the slack left over past the comparison window, so the furthest
  // lag still reads real samples instead of off the end of the buffer.
  const maxLag = Math.min(Math.floor(sampleRateHz / MIN_FREQ), BUFFER_SIZE - WINDOW_SIZE);
  if (minLag >= maxLag) return null;

  // Squared difference between the window and itself delayed by each lag. A true
  // period lines the signal up with itself, driving this towards zero.
  const diff = new Float32Array(maxLag + 1);
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < WINDOW_SIZE; i++) {
      const delta = buffer[i] - buffer[i + lag];
      sum += delta * delta;
    }
    diff[lag] = sum;
  }

  // Cumulative mean normalized difference: each lag divided by the average of
  // every lag up to it. Scales out overall signal level, so YIN_THRESHOLD means
  // the same thing whether the string was plucked hard or brushed.
  const normalized = new Float32Array(maxLag + 1);
  normalized[0] = 1;
  let runningSum = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    runningSum += diff[lag];
    normalized[lag] = runningSum === 0 ? 1 : (diff[lag] * lag) / runningSum;
  }

  let bestLag = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (normalized[lag] < YIN_THRESHOLD) {
      // The threshold is cleared on the way into a dip, not at its lowest point.
      // Walking down to the bottom is what the interpolation below then refines.
      while (lag + 1 <= maxLag && normalized[lag + 1] < normalized[lag]) lag++;
      bestLag = lag;
      break;
    }
  }
  if (bestLag === -1) return null;

  // Parabolic interpolation through the dip and its neighbours. The period is
  // rarely a whole number of samples, and a lag rounded to one is worth several
  // cents on its own - this is where sub-cent accuracy actually comes from.
  const y1 = normalized[bestLag - 1] ?? normalized[bestLag];
  const y2 = normalized[bestLag];
  const y3 = normalized[bestLag + 1] ?? normalized[bestLag];
  const denom = 2 * (2 * y2 - y1 - y3);
  const refinedLag = denom === 0 ? bestLag : bestLag + (y3 - y1) / denom;
  if (refinedLag <= 0) return null;

  const frequency = sampleRateHz / refinedLag;
  // Interpolation can nudge an edge-of-range lag past the range itself.
  if (frequency < MIN_FREQ || frequency > MAX_FREQ) return null;
  return frequency;
}

function rootMeanSquare(buffer: Float32Array, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / length);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * How far a frequency sits from the nearest equal-tempered note, in cents. Which
 * note it is does not matter here - only that the reading is close to one, which
 * is where smoothing is allowed to become slow (see NEAR_CENTRE_DAMPING).
 */
function centsFromNearestNote(frequency: number): number {
  const semitones = 12 * Math.log2(frequency / 440);
  return Math.abs(semitones - Math.round(semitones)) * 100;
}

/**
 * AudioWorklet for pitch detection.
 *
 * Runs detection *and* the smoothing that used to be the display's problem, so
 * the main thread receives a value that is already stable enough to render as-is.
 * Both stages are cheap next to the difference function that precedes them, and
 * keeping them here means UI load can neither jitter the needle nor delay it.
 *
 * Samples arrive in fixed 128-frame quanta, are folded into a rolling ring buffer
 * and analyzed every HOP_SIZE samples rather than on every quantum.
 */
class PitchProcessor extends AudioWorkletProcessor {
  private readonly ring: Float32Array;
  private readonly ordered: Float32Array;
  private writeIndex: number;
  private samplesSinceDetection: number;

  /** DC blocker state: last input and last output of the one-pole highpass. */
  private lastSample: number;
  private lastFiltered: number;
  private readonly highpassCoeff: number;

  /** Recent estimates awaiting a median, oldest first. */
  private readonly history: number[];
  /** Last value reported, and the anchor the next one is smoothed towards. */
  private smoothed: number | null;
  /** Consecutive frames with nothing detected, counted towards the gate release. */
  private silentFrames: number;

  /** Running estimate of the room, and the gate standing on top of it. */
  private noiseFloor: number;
  private gateOpen: boolean;
  /** Consecutive frames under the closing threshold, counted towards shutting. */
  private belowCloseFrames: number;

  constructor() {
    super();
    this.ring = new Float32Array(BUFFER_SIZE);
    this.ordered = new Float32Array(BUFFER_SIZE);
    this.writeIndex = 0;
    this.samplesSinceDetection = 0;
    this.lastSample = 0;
    this.lastFiltered = 0;
    this.highpassCoeff = Math.exp((-2 * Math.PI * HIGHPASS_HZ) / sampleRate);
    this.history = [];
    this.smoothed = null;
    this.silentFrames = 0;
    // Seeded at the absolute opening threshold rather than at zero: until some
    // quiet has actually been heard, erring high keeps the gate from flying open
    // on the first frame of whatever noise the microphone starts in.
    this.noiseFloor = GATE_ABSOLUTE_OPEN;
    this.gateOpen = false;
    this.belowCloseFrames = 0;
  }

  /**
   * Eases the reported pitch towards a new estimate, by musical distance rather
   * than by hertz. The same few-hertz wobble is a wide, visible waver on the low
   * E and invisible up at the twelfth fret, so smoothing in hertz would tune the
   * needle's feel differently at either end of the neck; in cents it feels the
   * same everywhere.
   */
  private smooth(frequency: number): number {
    if (this.smoothed === null) {
      this.smoothed = frequency;
      return frequency;
    }

    const deviationCents = 1200 * Math.log2(frequency / this.smoothed);
    const magnitude = Math.abs(deviationCents);
    if (magnitude >= SNAP_CENTS) {
      this.smoothed = frequency;
      return frequency;
    }

    const base = frequency < LOW_REGISTER_HZ ? LOW_REGISTER_SMOOTHING : HIGH_REGISTER_SMOOTHING;
    // Nearby estimates are damped at the register's base rate and the coefficient
    // opens up towards a snap, so the needle settles on a held note but still
    // tracks a peg being turned.
    let alpha = base + (1 - base) * (magnitude / SNAP_CENTS);
    if (centsFromNearestNote(frequency) < NEAR_CENTRE_CENTS) alpha *= NEAR_CENTRE_DAMPING;

    this.smoothed *= Math.pow(2, (alpha * deviationCents) / 1200);
    return this.smoothed;
  }

  /**
   * Whether this frame is loud enough to be worth analyzing, and folds it into the
   * estimate of the room if it is not.
   *
   * The estimate only learns while the gate is shut and the frame is quiet enough
   * to plausibly be the room: a note sounding would otherwise be averaged into
   * the very floor it has to stand above, walking the threshold up underneath it
   * until the gate closed on a string that was still ringing. Frozen while the
   * gate is open, for the same reason.
   */
  private gateIsOpen(rms: number): boolean {
    if (!this.gateOpen && rms < NOISE_FLOOR_LEARN_CEILING) {
      this.noiseFloor = this.noiseFloor * (1 - NOISE_FLOOR_ALPHA) + rms * NOISE_FLOOR_ALPHA;
      this.noiseFloor = Math.min(NOISE_FLOOR_MAX, Math.max(NOISE_FLOOR_MIN, this.noiseFloor));
    }

    // Which margin applies depends on the register, which is only known from the
    // last reading - the pitch of this frame is what the gate is deciding whether
    // to go and measure. With nothing played yet, the narrower treble margin is
    // the forgiving choice, and the next frame corrects it.
    const isLowString = this.smoothed !== null && this.smoothed < LOW_STRING_HZ;
    const openAt = Math.max(
      GATE_ABSOLUTE_OPEN,
      this.noiseFloor * (isLowString ? RATIO_OPEN_LOW : RATIO_OPEN_HIGH)
    );
    const closeAt = Math.max(
      GATE_ABSOLUTE_CLOSE,
      this.noiseFloor * (isLowString ? RATIO_CLOSE_LOW : RATIO_CLOSE_HIGH)
    );

    if (this.gateOpen) {
      if (rms >= closeAt) {
        this.belowCloseFrames = 0;
        return true;
      }
      if (++this.belowCloseFrames >= GATE_CLOSE_FRAMES) {
        this.gateOpen = false;
        this.belowCloseFrames = 0;
      }
      // Still analyzed on the way down: a decaying string is worth reading for as
      // long as anything can be made of it.
      return this.gateOpen;
    }

    if (rms >= openAt) {
      this.gateOpen = true;
      this.belowCloseFrames = 0;
      return true;
    }
    return false;
  }

  /** Drops the smoothing anchor and median history, so the next note is read on
   *  its own rather than eased across from whatever was played before it. */
  private reset(): void {
    this.history.length = 0;
    this.smoothed = null;
    this.silentFrames = 0;
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0];
    if (!input) return true;

    for (let i = 0; i < input.length; i++) {
      // One-pole DC blocker, applied as samples arrive. Removes the offset and
      // sub-audio rumble that would otherwise bias every difference below.
      const sample = input[i];
      const filtered = sample - this.lastSample + this.highpassCoeff * this.lastFiltered;
      this.lastSample = sample;
      this.lastFiltered = filtered;

      this.ring[this.writeIndex] = filtered;
      this.writeIndex = (this.writeIndex + 1) % BUFFER_SIZE;
    }
    this.samplesSinceDetection += input.length;

    if (this.samplesSinceDetection < HOP_SIZE) return true;
    this.samplesSinceDetection = 0;

    // Unwrap the ring into chronological order - the difference function assumes
    // a contiguous buffer.
    for (let i = 0; i < BUFFER_SIZE; i++) {
      this.ordered[i] = this.ring[(this.writeIndex + i) % BUFFER_SIZE];
    }

    const rms = rootMeanSquare(this.ordered, WINDOW_SIZE);
    const detected = this.gateIsOpen(rms) ? detectPitch(this.ordered, sampleRate) : null;
    if (detected === null) {
      this.silentFrames++;
      // Hold the last reading briefly, so a decaying string dipping under the
      // gate does not blink the needle off and straight back on again.
      if (this.smoothed !== null && this.silentFrames <= GATE_RELEASE_FRAMES) {
        this.port.postMessage({ type: 'pitch', frequency: this.smoothed });
        return true;
      }
      this.reset();
      this.port.postMessage({ type: 'pitch', frequency: null });
      return true;
    }

    this.silentFrames = 0;
    this.history.push(detected);
    if (this.history.length > MEDIAN_WINDOW) this.history.shift();

    const frequency = this.smooth(median(this.history));
    this.port.postMessage({ type: 'pitch', frequency });

    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
