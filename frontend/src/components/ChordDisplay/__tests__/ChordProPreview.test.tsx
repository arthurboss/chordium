import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChordProPreview from '../ChordProPreview';

describe('ChordProPreview', () => {
  it('renders chords on a chord-position row above the plain lyric row, matching the saved display', () => {
    const { container } = render(<ChordProPreview text="[G]Saying I [C]love you" />);

    const chordSpans = container.querySelectorAll('span.chord');
    expect(chordSpans).toHaveLength(2);
    expect(chordSpans[0].textContent).toBe('G');
    expect(chordSpans[1].textContent).toBe('C');

    const chordLine = container.querySelector('.chord-line');
    expect(chordLine?.textContent).toBe('G        C');

    const lyricsLine = container.querySelector('.lyrics-line');
    expect(lyricsLine?.textContent).toBe('Saying I love you');
  });

  it('renders a lyric line with no chords as a single plain lyrics row', () => {
    const { container } = render(<ChordProPreview text="Just some plain lyrics" />);

    expect(container.querySelector('.chord-line')).toBeNull();
    const lyricsLine = container.querySelector('.lyrics-line');
    expect(lyricsLine?.textContent).toBe('Just some plain lyrics');
  });

  it('renders a comment as a section header', () => {
    const { container } = render(<ChordProPreview text="{comment: Intro}" />);

    const header = container.querySelector('.section-header');
    expect(header).not.toBeNull();
    expect(header?.textContent).toBe('Intro');
  });

  it('renders tab blocks with whitespace preserved', () => {
    const tab = ['{start_of_tab}', 'E|-0-1-2-|', 'B|-0-1-2-|', '{end_of_tab}'].join('\n');
    const { container } = render(<ChordProPreview text={tab} />);

    const pre = container.querySelector('pre.tablatura');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toBe('E|-0-1-2-|\nB|-0-1-2-|');
  });

  it('highlights fret-number digits on tab-string lines like chords, but not on chord-name annotation lines', () => {
    const tab = ['{start_of_tab}', '   C9      D', 'E|-0-1-2-|', '{end_of_tab}'].join('\n');
    const { container } = render(<ChordProPreview text={tab} />);

    const pre = container.querySelector('pre.tablatura');
    expect(pre?.textContent).toBe('   C9      D\nE|-0-1-2-|');

    const digitSpans = pre?.querySelectorAll('span.chord');
    expect(Array.from(digitSpans ?? []).map((s) => s.textContent)).toEqual(['0', '1', '2']);
  });

  it('does not execute or leak markup for chord/lyric text containing HTML-like characters', () => {
    const { container } = render(<ChordProPreview text='[G<x>]Say "hi" <b>now</b>' />);

    expect(container.querySelector('b')).toBeNull();
    const chordSpan = container.querySelector('span.chord');
    expect(chordSpan?.textContent).toBe('G<x>');
  });
});
