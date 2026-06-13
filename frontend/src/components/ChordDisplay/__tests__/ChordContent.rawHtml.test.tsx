import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChordContent from '../ChordContent';
import { MORE_THAN_WORDS_RAW_HTML } from './__fixtures__/more-than-words';
import type { ChordSection } from '../types';

const noOpRenderChord = (chord: string) => <span>{chord}</span>;

const emptyContent: ChordSection[] = [];

describe('ChordContent – rawHtml rendering', () => {
  it('renders a <pre> element when rawHtml is provided', () => {
    const { container } = render(
      <ChordContent
        processedContent={emptyContent}
        rawHtml={MORE_THAN_WORDS_RAW_HTML}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="normal"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
  });

  it('does not render the processedContent div structure when rawHtml is provided', () => {
    const processedContent: ChordSection[] = [
      { type: 'section', title: 'Intro', lines: [{ type: 'lyrics', content: 'should not appear' }] },
    ];

    const { container } = render(
      <ChordContent
        processedContent={processedContent}
        rawHtml={MORE_THAN_WORDS_RAW_HTML}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="normal"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    expect(screen.queryByText('should not appear')).toBeNull();
    expect(container.querySelector('.chord-line')).toBeNull();
    expect(container.querySelector('.lyrics-line')).toBeNull();
  });

  it('renders <b> chord tags inside the <pre>', () => {
    const { container } = render(
      <ChordContent
        processedContent={emptyContent}
        rawHtml={MORE_THAN_WORDS_RAW_HTML}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="normal"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    const pre = container.querySelector('pre');
    const boldChords = pre!.querySelectorAll('b');
    expect(boldChords.length).toBeGreaterThan(0);
    expect(boldChords[0].textContent).toBe('G');
  });

  it('preserves span.tablatura elements inside the <pre>', () => {
    const { container } = render(
      <ChordContent
        processedContent={emptyContent}
        rawHtml={MORE_THAN_WORDS_RAW_HTML}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="normal"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre!.querySelector('span.tablatura')).not.toBeNull();
  });

  it('falls back to processedContent when rawHtml is absent', () => {
    const processedContent: ChordSection[] = [
      { type: 'section', title: '', lines: [{ type: 'lyrics', content: 'fallback lyric' }] },
    ];

    const { container } = render(
      <ChordContent
        processedContent={processedContent}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="normal"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    expect(screen.getByText('fallback lyric')).toBeTruthy();
    expect(container.querySelector('pre')).toBeNull();
  });

  it('falls back to processedContent in lyrics-only mode even when rawHtml is present', () => {
    const processedContent: ChordSection[] = [
      { type: 'section', title: '', lines: [{ type: 'lyrics', content: 'lyrics line' }] },
    ];

    render(
      <ChordContent
        processedContent={processedContent}
        rawHtml={MORE_THAN_WORDS_RAW_HTML}
        fontSize={16}
        fontSpacing={0}
        fontStyle=""
        viewMode="lyrics-only"
        hideGuitarTabs={false}
        renderChord={noOpRenderChord}
      />
    );

    expect(screen.getByText('lyrics line')).toBeTruthy();
  });
});
