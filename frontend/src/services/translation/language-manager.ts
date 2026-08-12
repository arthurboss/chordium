/**
 * Hands the reader over to the language manager in the header, which is where
 * everything a translation needs is fetched, and says when what the device can
 * translate has changed.
 *
 * A song sits far from that component in the tree and only needs to nudge it, so
 * the request travels through the window rather than through props.
 */

const OPEN_REQUEST = 'chordium:open-language-manager';
const PACKS_CHANGED = 'chordium:translation-packs-changed';

export interface LanguageManagerRequest {
  /** The language the waiting lyrics are in, so that exact pair is fetched. */
  source?: string;
}

export function openLanguageManager(request: LanguageManagerRequest = {}): void {
  window.dispatchEvent(new CustomEvent(OPEN_REQUEST, { detail: request }));
}

export function onLanguageManagerRequested(
  handler: (request: LanguageManagerRequest) => void
): () => void {
  const listener = (event: Event) =>
    handler((event as CustomEvent<LanguageManagerRequest>).detail ?? {});
  window.addEventListener(OPEN_REQUEST, listener);
  return () => window.removeEventListener(OPEN_REQUEST, listener);
}

/**
 * Announced once a download or a removal has changed what can be translated, so
 * lyrics waiting on it carry on by themselves instead of asking again.
 */
export function announceTranslationPacksChanged(): void {
  window.dispatchEvent(new Event(PACKS_CHANGED));
}

export function onTranslationPacksChanged(handler: () => void): () => void {
  window.addEventListener(PACKS_CHANGED, handler);
  return () => window.removeEventListener(PACKS_CHANGED, handler);
}
