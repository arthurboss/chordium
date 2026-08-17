import { describe, it, expect } from 'vitest';
import { tidyTranscript } from '../tidy-transcript';

describe('tidyTranscript', () => {
  it('drops the full stop a recogniser adds to a phrase said on its own', () => {
    expect(tidyTranscript('Hotel California.')).toBe('Hotel California');
  });

  it('drops any run of trailing punctuation', () => {
    expect(tidyTranscript('Wonderwall?!')).toBe('Wonderwall');
    expect(tidyTranscript('Tempo Perdido...')).toBe('Tempo Perdido');
  });

  it('collapses runs of whitespace and trims the ends', () => {
    expect(tidyTranscript('  Hotel   California  ')).toBe('Hotel California');
  });

  it('keeps an artist and a title together, since the search takes both as one phrase', () => {
    expect(tidyTranscript('Hotel California by Eagles.')).toBe('Hotel California by Eagles');
  });

  it('leaves punctuation inside a title alone', () => {
    expect(tidyTranscript('Where Is My Mind? - Pixies')).toBe('Where Is My Mind? - Pixies');
  });

  it('returns an empty string when nothing was heard', () => {
    expect(tidyTranscript('')).toBe('');
    expect(tidyTranscript('   ')).toBe('');
  });
});
