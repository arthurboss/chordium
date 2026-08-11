import { describe, it, expect } from 'vitest';
import { detectLyricsLanguage } from '../detect-language';

const ENGLISH = `Today is gonna be the day
That they're gonna throw it back to you
By now you should've somehow
Realized what you gotta do
I don't believe that anybody
Feels the way I do about you now`;

const PORTUGUESE = `Você já sabe que eu não vou embora
Então me diga tudo o que você quer
Meu coração está aqui esperando
Nós vamos fazer o que sempre quisemos
Até o dia em que eu não puder mais`;

const SPANISH = `Pero yo siempre te quiero mucho más
Cuando llega la mañana y todo está
Aquí en mi corazón desde ahora
Ella me dijo que los años pasan
Y así estoy esperando`;

const GERMAN = `Ich weiß nicht, wie das enden wird
Und wenn du mir noch immer sagst
Das ist nicht mein Problem, aber
Wir haben schon so oft dasselbe
Du bist mein und ich bin dein`;

describe('working out what language lyrics are in', () => {
  it('recognises each of the app languages', () => {
    expect(detectLyricsLanguage(ENGLISH)).toBe('en');
    expect(detectLyricsLanguage(PORTUGUESE)).toBe('pt-BR');
    expect(detectLyricsLanguage(SPANISH)).toBe('es');
    expect(detectLyricsLanguage(GERMAN)).toBe('de');
  });

  it('keeps Portuguese and Spanish apart', () => {
    // The two share most short words, so the call rests on the spellings that
    // differ; mixing them up would offer a translation into the same language.
    expect(detectLyricsLanguage(PORTUGUESE)).not.toBe('es');
    expect(detectLyricsLanguage(SPANISH)).not.toBe('pt-BR');
  });

  it('declines to guess when there is nothing to go on', () => {
    expect(detectLyricsLanguage('')).toBeNull();
    expect(detectLyricsLanguage('La la la\nOoh ooh\nNa na na')).toBeNull();
  });

  it('reads the real sample lyrics as English', () => {
    expect(
      detectLyricsLanguage(`On a dark desert highway
Cool wind in my hair
Warm smell of colitas
Rising up through the air
Up ahead in the distance
I saw a shimmering light`)
    ).toBe('en');
  });
});
