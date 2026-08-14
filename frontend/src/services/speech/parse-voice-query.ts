/**
 * What a spoken phrase asks for, in the terms the search itself takes: an artist,
 * a song, or both.
 */
export interface VoiceQuery {
  artist: string;
  song: string;
}

/**
 * The words a speaker puts between a song and the act that performs it, in each
 * language the app is shown in.
 *
 * Deliberately only the words that are rare inside a title. "de", "do" and "da"
 * are the ordinary way to say the same thing in Portuguese and Spanish, but they
 * are also ordinary words in titles, and "Garota de Ipanema" would be split into a
 * song called "Garota" by an artist called "Ipanema", which finds nothing. Failing
 * to split is the safer error of the two: the whole phrase then goes in as a title,
 * and that search is free text, so it still finds what was asked for.
 */
const SEPARATORS: Record<string, string[]> = {
  en: ['by'],
  es: ['por'],
  'pt-BR': ['por'],
  de: ['von'],
};

/** Every separator, so a phrase is understood whatever the app is set to. */
const ALL_SEPARATORS = Array.from(new Set(Object.values(SEPARATORS).flat()));

/**
 * Whisper and Moonshine both punctuate what they hear, which the search would
 * otherwise take literally. Trailing stops are the common case for a phrase said
 * on its own.
 */
function tidy(text: string): string {
  return text
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function separatorsFor(language: string): string[] {
  const own = SEPARATORS[language] ?? SEPARATORS[language.split('-')[0]] ?? [];
  // The speaker's own language is tried first so "de" reads as a separator for a
  // Spanish speaker before the English "by" is considered.
  return [...own, ...ALL_SEPARATORS.filter((word) => !own.includes(word))];
}

/**
 * Reads a transcript as a search.
 *
 * "Hotel California by Eagles" names both, and is split so each lands in its own
 * field, which searches for that pairing exactly. Anything else goes in as a song
 * title: that search is a free-text query against the source and comes back with
 * the artist alongside each result, so a phrase naming both without a separator
 * still finds what was asked for, whereas an artist search expects the name on
 * its own and would find nothing.
 *
 * @param language The app's current language, which decides the separator tried first.
 */
export function parseVoiceQuery(transcript: string, language = 'en'): VoiceQuery {
  const text = tidy(transcript);
  if (!text) return { artist: '', song: '' };

  for (const separator of separatorsFor(language)) {
    // Bounded by whitespace on both sides so it is a word of its own rather than
    // the start of one, keeping "Deutschland" from splitting on "de".
    const match = new RegExp(`^(.+?)\\s+${separator}\\s+(.+)$`, 'i').exec(text);
    if (match) {
      const song = tidy(match[1]);
      const artist = tidy(match[2]);
      if (song && artist) return { artist, song };
    }
  }

  return { artist: '', song: text };
}
