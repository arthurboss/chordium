/**
 * Cleans up a spoken phrase so it can be searched for as typed.
 *
 * Whisper punctuates what it hears, which the search would otherwise take
 * literally; a trailing stop is the common case for a phrase said on its own.
 *
 * Nothing else is interpreted. The search takes an artist and a title together in
 * one string, so "Hotel California by Eagles" is a perfectly good query as it
 * stands and does not need taking apart first.
 */
export function tidyTranscript(text: string): string {
  return text
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
