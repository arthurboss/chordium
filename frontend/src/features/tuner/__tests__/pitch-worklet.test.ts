import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Exercises the worklet's detection end to end, through the processor itself
 * rather than a copy of its maths, by standing in for the AudioWorklet scope it
 * expects: a base class, a sample rate, and the registration call it hands its
 * processor to on the way in.
 */
const SAMPLE_RATE = 44100;
const QUANTUM = 128;

interface Processor {
  process(inputs: Float32Array[][]): boolean;
}

let ProcessorClass: new () => Processor;
let messages: Array<{ type: string; frequency: number | null }>;

beforeAll(async () => {
  messages = [];
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.AudioWorkletProcessor = class {
    port = { postMessage: (data: { type: string; frequency: number | null }) => messages.push(data) };
  };
  globals.sampleRate = SAMPLE_RATE;
  globals.registerProcessor = (_name: string, processor: new () => Processor) => {
    ProcessorClass = processor;
  };
  await import('../pitch-worklet');
});

/** Feeds a generated signal in 128-frame quanta and returns what was reported. */
function run(sampleAt: (index: number) => number, quanta = 200): Array<number | null> {
  messages.length = 0;
  const processor = new ProcessorClass();
  let index = 0;
  for (let q = 0; q < quanta; q++) {
    const block = new Float32Array(QUANTUM);
    for (let i = 0; i < QUANTUM; i++) block[i] = sampleAt(index++);
    processor.process([[block]]);
  }
  return messages.map((m) => m.frequency);
}

function lastReported(values: Array<number | null>): number | null {
  return values.length === 0 ? null : values[values.length - 1];
}

function centsApart(actual: number, expected: number): number {
  return Math.abs(1200 * Math.log2(actual / expected));
}

const sine = (freq: number, amplitude = 0.3) => (i: number) =>
  amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);

describe('pitch worklet', () => {
  // Standard tuning, which is the whole range that has to be right.
  const STRINGS = [
    ['low E', 82.41],
    ['A', 110.0],
    ['D', 146.83],
    ['G', 196.0],
    ['B', 246.94],
    ['high E', 329.63],
  ] as const;

  it.each(STRINGS)('reads %s within a cent', (_name, freq) => {
    const reported = lastReported(run(sine(freq)));
    expect(reported).not.toBeNull();
    expect(centsApart(reported!, freq)).toBeLessThan(1);
  });

  it('reads a string tuned flat as flat, not as the nearest note', () => {
    // 30 cents under the low E: the offset a tuner exists to show, and near the
    // edge of what smoothing is allowed to pull towards a neighbour.
    const flat = 82.41 * Math.pow(2, -30 / 1200);
    const reported = lastReported(run(sine(flat)));
    expect(reported).not.toBeNull();
    expect(centsApart(reported!, flat)).toBeLessThan(2);
  });

  it('reports the fundamental of a harmonic-rich string, not the octave above', () => {
    // A plucked low E with a second harmonic louder than its own fundamental,
    // plus third and fourth. This is what defeats naive autocorrelation: the
    // strongest correlation sits at the octave, so the old implementation would
    // report ~165Hz here.
    const fundamental = 82.41;
    const reported = lastReported(
      run((i) => {
        const t = (2 * Math.PI * i) / SAMPLE_RATE;
        return (
          0.15 * Math.sin(t * fundamental) +
          0.3 * Math.sin(t * fundamental * 2) +
          0.2 * Math.sin(t * fundamental * 3) +
          0.1 * Math.sin(t * fundamental * 4)
        );
      })
    );
    expect(reported).not.toBeNull();
    expect(centsApart(reported!, fundamental)).toBeLessThan(5);
  });

  it('reports nothing for silence', () => {
    expect(run(() => 0).every((f) => f === null)).toBe(true);
  });

  it('reports nothing for broadband noise', () => {
    // Deterministic pseudo-noise, so a failure here is reproducible.
    let seed = 12345;
    const noise = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return (seed / 0x7fffffff - 0.5) * 0.6;
    };
    const reported = run(noise);
    const detected = reported.filter((f) => f !== null).length;
    // Noise has no period to find; the odd frame may still clear the threshold,
    // but a needle cannot be driven by a handful out of this many.
    expect(detected).toBeLessThan(reported.length * 0.1);
  });

  it('holds a steady note steady', () => {
    // What "not twitchy" means, measured: once settled, consecutive readings of
    // an unchanging note must not wander.
    const readings = run(sine(196.0)).filter((f): f is number => f !== null);
    const settled = readings.slice(Math.floor(readings.length / 2));
    const spread = Math.max(...settled) - Math.min(...settled);
    expect(centsApart(196.0 + spread, 196.0)).toBeLessThan(1);
  });

  it('hears a note too quiet for a fixed gate to have passed', () => {
    // RMS ~0.0085, under the 0.01 threshold this used to gate on outright, which
    // is the softly fingerpicked note the old gate simply refused to read.
    const reported = lastReported(run(sine(196.0, 0.012)));
    expect(reported).not.toBeNull();
    expect(centsApart(reported!, 196.0)).toBeLessThan(2);
  });

  it('hears a quiet note over the quiet room it is played in', () => {
    // Room tone first, so the floor settles on it, then a soft note on top. Both
    // are well under the old fixed threshold.
    let seed = 999;
    const room = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return (seed / 0x7fffffff - 0.5) * 0.002;
    };
    const noteStart = SAMPLE_RATE * 2;
    const note = sine(146.83, 0.01);
    const reported = lastReported(run((i) => (i < noteStart ? room() : note(i) + room()), 900));
    expect(reported).not.toBeNull();
    expect(centsApart(reported!, 146.83)).toBeLessThan(3);
  });

  it('does not gate off partway through a held note', () => {
    // What the frozen floor exists to prevent: were the estimate to keep learning
    // while the gate was open, it would climb into the note and shut on it.
    const readings = run(sine(110.0, 0.05), 900);
    const settled = readings.slice(Math.floor(readings.length / 4));
    expect(settled.every((f) => f !== null)).toBe(true);
  });

  it('holds the gate shut against a room too loud for the note', () => {
    // Noise at ~25x the level of the note buried in it. The floor learns the room
    // during the opening silence, and the margin above it is what keeps this from
    // reading as a string.
    let seed = 4242;
    const room = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return (seed / 0x7fffffff - 0.5) * 0.004;
    };
    const reported = run((i) => room() + 0.0002 * Math.sin((2 * Math.PI * 196 * i) / SAMPLE_RATE), 900);
    const detected = reported.filter((f) => f !== null).length;
    expect(detected).toBeLessThan(reported.length * 0.1);
  });

  it('follows a peg being turned rather than lagging behind it', () => {
    // A string wound up ~80 cents and then held. Swept by accumulating phase
    // rather than by switching frequency outright: a peg turn slides the pitch
    // continuously, where a hard switch would also inject a phase discontinuity
    // that no real string produces and that only the median has to survive.
    const from = 110.0;
    const to = 110.0 * Math.pow(2, 80 / 1200);
    const sweepStart = SAMPLE_RATE * 0.5;
    const sweepEnd = SAMPLE_RATE * 1.0;

    let phase = 0;
    const reported = lastReported(
      run((i) => {
        const progress = Math.min(1, Math.max(0, (i - sweepStart) / (sweepEnd - sweepStart)));
        phase += (2 * Math.PI * (from + (to - from) * progress)) / SAMPLE_RATE;
        return 0.3 * Math.sin(phase);
      }, 600)
    );

    expect(reported).not.toBeNull();
    expect(centsApart(reported!, to)).toBeLessThan(3);
  });
});
