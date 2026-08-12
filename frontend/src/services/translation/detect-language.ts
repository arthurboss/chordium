import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from './types';

/**
 * Words that pull strongly towards one of the app's languages. Pairs that only
 * differ by spelling or accent do the real work here ("quando"/"cuando",
 * "sempre"/"siempre", "mais"/"más"), so Portuguese and Spanish stay apart;
 * words the two share are deliberately left out because they signal nothing.
 */
const MARKER_WORDS: Record<TranslatableLanguage, readonly string[]> = {
  en: [
    'the', 'and', 'you', 'that', 'with', 'have', 'this', 'what', 'would', 'your',
    'they', 'from', 'just', 'know', 'never', 'about', 'there', 'was', 'all', 'for',
    'not', 'but', 'can', 'how', 'say', 'are', 'been', 'could', 'she', 'him',
    // Short function words carry most of the signal in sparse, sung lines.
    'i', 'my', 'of', 'it', 'is', 'to', 'on', 'up', 'we', 'be',
    'at', 'by', 'do', 'go', 'if', 'out', 'now', 'here', 'when', 'through',
  ],
  es: [
    'pero', 'muy', 'siempre', 'cuando', 'todo', 'más', 'así', 'aquí', 'ella', 'años',
    'desde', 'ahora', 'mañana', 'corazón', 'quiero', 'hacia', 'nosotros', 'ustedes',
    'tienes', 'estoy', 'está', 'eres', 'mis', 'sus',
  ],
  'pt-BR': [
    'não', 'você', 'então', 'até', 'nós', 'muito', 'tudo', 'já', 'mais', 'assim',
    'aqui', 'coração', 'minha', 'meu', 'seu', 'quando', 'sempre', 'fazer', 'olhos',
    'estou', 'está', 'tem', 'vou', 'nem',
  ],
  de: [
    'und', 'ich', 'nicht', 'der', 'die', 'das', 'wie', 'wir', 'dass', 'mich',
    'dir', 'mir', 'auch', 'noch', 'immer', 'wenn', 'hast', 'bist', 'sein', 'schon',
    'aber', 'oder', 'eine', 'einen', 'mein', 'dein',
  ],
};

/** Characters that only one of these languages writes. */
const MARKER_CHARS: Partial<Record<TranslatableLanguage, readonly string[]>> = {
  es: ['ñ', '¿', '¡'],
  'pt-BR': ['ã', 'õ', 'ç'],
  de: ['ß', 'ä', 'ö', 'ü'],
};

/** Below this the text is too short or too ambiguous to call. */
const MINIMUM_SCORE = 3;

function scoreLanguage(words: string[], text: string, language: TranslatableLanguage): number {
  const markers = new Set(MARKER_WORDS[language]);
  let score = words.reduce((total, word) => (markers.has(word) ? total + 1 : total), 0);
  for (const char of MARKER_CHARS[language] ?? []) {
    // Accents are a strong signal from very few occurrences, so they count extra.
    score += text.split(char).length - 1 > 0 ? 2 : 0;
  }
  return score;
}

/**
 * Works out which of the app's languages a set of lyrics is written in.
 *
 * The words on a chord sheet are whatever the song is sung in, which is not the
 * source site's own language, so this is measured rather than assumed: getting
 * it wrong either offers a pointless translation or withholds a wanted one.
 * Returns null when the words give too little to go on.
 */
export function detectLyricsLanguage(lyrics: string): TranslatableLanguage | null {
  const text = lyrics.toLowerCase();
  const words = text.match(/[\p{L}'’]+/gu) ?? [];
  if (words.length === 0) return null;

  const ranked = TRANSLATABLE_LANGUAGES.map((language) => ({
    language,
    score: scoreLanguage(words, text, language),
  })).sort((a, b) => b.score - a.score);

  const [best, runnerUp] = ranked;
  if (best.score < MINIMUM_SCORE || best.score === runnerUp.score) return null;
  return best.language;
}
