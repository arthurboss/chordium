export function isWakeWord(transcript: string): boolean {
  return /hey\s+chordium|hey\s+cord|chordium\s+listen/i.test(transcript);
}
