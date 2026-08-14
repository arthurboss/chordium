import { describe, expect, it } from 'vitest';
import { parseVoiceQuery } from '../parse-voice-query';

describe('parseVoiceQuery', () => {
  it('puts a bare phrase in the song field, where the search is free text', () => {
    expect(parseVoiceQuery('Hotel California Eagles')).toEqual({
      artist: '',
      song: 'Hotel California Eagles',
    });
  });

  it('splits an English phrase on "by" into song and artist', () => {
    expect(parseVoiceQuery('Hotel California by Eagles')).toEqual({
      artist: 'Eagles',
      song: 'Hotel California',
    });
  });

  it('splits on the separator of the reader\'s own language', () => {
    expect(parseVoiceQuery('Wonderwall von Oasis', 'de')).toEqual({
      artist: 'Oasis',
      song: 'Wonderwall',
    });
    expect(parseVoiceQuery('Garota de Ipanema por Tom Jobim', 'pt-BR')).toEqual({
      artist: 'Tom Jobim',
      song: 'Garota de Ipanema',
    });
  });

  it('leaves "de" alone, since it is an ordinary word in a title', () => {
    // Splitting here would ask for a song called "Garota" by "Ipanema" and find
    // nothing; the whole phrase as free text finds the song.
    expect(parseVoiceQuery('Garota de Ipanema', 'pt-BR')).toEqual({
      artist: '',
      song: 'Garota de Ipanema',
    });
    expect(parseVoiceQuery('Bailando de Enrique Iglesias', 'es')).toEqual({
      artist: '',
      song: 'Bailando de Enrique Iglesias',
    });
  });

  it('understands a separator from another language, so the app setting need not match', () => {
    expect(parseVoiceQuery('Wonderwall by Oasis', 'de')).toEqual({
      artist: 'Oasis',
      song: 'Wonderwall',
    });
  });

  it('drops the punctuation the models add to what they hear', () => {
    expect(parseVoiceQuery('Wonderwall.')).toEqual({ artist: '', song: 'Wonderwall' });
    expect(parseVoiceQuery('Hotel California by Eagles?')).toEqual({
      artist: 'Eagles',
      song: 'Hotel California',
    });
  });

  it('collapses the spacing of a hesitant transcript', () => {
    expect(parseVoiceQuery('  Tame   Impala  ')).toEqual({ artist: '', song: 'Tame Impala' });
  });

  it('keeps a title containing a separator inside a longer word intact', () => {
    // "Vonda" begins with the German separator but is not one, so the phrase is not
    // split there.
    expect(parseVoiceQuery('Vonda Shepard', 'de')).toEqual({ artist: '', song: 'Vonda Shepard' });
    expect(parseVoiceQuery('Byrds', 'en')).toEqual({ artist: '', song: 'Byrds' });
  });

  it('does not split when one side would be empty', () => {
    expect(parseVoiceQuery('by')).toEqual({ artist: '', song: 'by' });
    expect(parseVoiceQuery('by Eagles')).toEqual({ artist: '', song: 'by Eagles' });
  });

  it('returns nothing for a recording that produced no words', () => {
    expect(parseVoiceQuery('')).toEqual({ artist: '', song: '' });
    expect(parseVoiceQuery('   ')).toEqual({ artist: '', song: '' });
    expect(parseVoiceQuery('...')).toEqual({ artist: '', song: '' });
  });

  it('splits on the first separator, so the artist keeps the rest of the phrase', () => {
    expect(parseVoiceQuery('Live by Night by The Killers')).toEqual({
      artist: 'Night by The Killers',
      song: 'Live',
    });
  });

  it('falls back through a regional language to its base', () => {
    expect(parseVoiceQuery('Garota de Ipanema por Tom Jobim', 'pt-PT')).toEqual({
      artist: 'Tom Jobim',
      song: 'Garota de Ipanema',
    });
  });
});
