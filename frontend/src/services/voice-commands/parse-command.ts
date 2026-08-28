export type VoiceCommand =
  | { type: 'transpose'; semitones: number }
  | { type: 'key'; key: string }
  | { type: 'capo'; fret: number }
  | { type: 'search'; query: string }
  | { type: 'unknown' };

const CHORD_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function normalizeChord(input: string): string | null {
  const clean = input.toUpperCase().trim();
  const match = clean.match(/^([A-G])([#b])?(.*)$/);
  if (!match) return null;
  const [, note, modifier] = match;
  if (CHORD_NOTES.includes(note)) return note + (modifier || '');
  return null;
}

export function parseCommand(transcript: string): VoiceCommand {
  const lower = transcript.toLowerCase();

  const transposeMatch = lower.match(/transpose\s+(up|down)\s+(\d+)/i);
  if (transposeMatch) {
    const direction = transposeMatch[1] === 'up' ? 1 : -1;
    const semitones = parseInt(transposeMatch[2]) * direction;
    return { type: 'transpose', semitones };
  }

  const keyMatch = lower.match(/(?:change|set|key to|in)\s+([A-G][#b]?)/i);
  if (keyMatch) {
    const key = normalizeChord(keyMatch[1]);
    if (key) return { type: 'key', key };
  }

  const capoMatch = lower.match(/capo\s+(\d+)/i);
  if (capoMatch) {
    return { type: 'capo', fret: parseInt(capoMatch[1]) };
  }

  if (lower.includes('search') || lower.includes('find')) {
    return { type: 'search', query: transcript };
  }

  return { type: 'unknown' };
}
