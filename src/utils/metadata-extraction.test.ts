import { describe, it, expect } from 'vitest';
import { extractSongMetadata } from './metadata-extraction';

const exampleEN = `Paramore - The Only Exception\n\nAfinação: E A D G B D#\n[Intro] B  F#m6  E7M\n...`;
const examplePT = `Leonardo Gonçalves - Brilhar Por Ti\n\n[Intro] E  A9  E  A9  B4\n...`;
const exampleHeader = `Song: Wonderwall\nArtist: Oasis\nKey: F#m\nTuning: Standard\n[Intro] Em7  G  Dsus4  A7sus4`;

// New test cases for edge cases
const introInArtist = `Intro - The Band\nSong: Welcome\nKey: C\nTuning: Standard\n[Intro] C  G  F`;
const introInTitle = `Artist: The Group\nSong: The Intro Song\nKey: D\nTuning: Drop D\n[Intro] D  A  G`;
const noSectionMarker = `Song: No Section\nArtist: No Marker\nKey: E\nTuning: E A D G B E\nVerse 1\nE  A  B`;
const sectionMarkerWithSpaces = `Song: Spaced\nArtist: Marker\nKey: G\nTuning: Open G\n   [Intro]   \nG  D  C`;

describe('extractSongMetadata', () => {
  it('extracts metadata from English header', () => {
    const meta = extractSongMetadata(exampleHeader);
    expect(meta.title).toBe('Wonderwall');
    expect(meta.artist).toBe('Oasis');
    expect(meta.songKey).toBe('F#m');
    expect(meta.guitarTuning?.toLowerCase()).toContain('standard');
  });

  it('extracts metadata from filename (EN)', () => {
    const meta = extractSongMetadata(exampleEN, 'Paramore - The Only Exception.txt');
    expect(meta.title).toBe('The Only Exception');
    expect(meta.artist).toBe('Paramore');
    expect(meta.guitarTuning).toBe('E A D G B D#');
  });

  it('extracts metadata from filename (PT)', () => {
    const meta = extractSongMetadata(examplePT, 'Leonardo Gonçalves - Brilhar Por Ti.txt');
    expect(meta.title).toBe('Brilhar Por Ti');
    expect(meta.artist).toBe('Leonardo Gonçalves');
    expect(meta.guitarTuning).toBeUndefined();
    expect(meta.songKey).toBeUndefined();
  });

  it('does not extract random chords as tuning or key', () => {
    const content = `Song: Test\n[Intro] E  A9  E  A9  B4\nE9\nC#m7\nB9\nF#m7`;
    const meta = extractSongMetadata(content, 'Test - Song.txt');
    expect(meta.guitarTuning).toBeUndefined();
    expect(meta.songKey).toBeUndefined();
  });

  it('does not treat "Intro" in artist as section marker', () => {
    const meta = extractSongMetadata(introInArtist);
    expect(meta.artist).toBe('Intro - The Band');
    expect(meta.title).toBe('Welcome');
    expect(meta.songKey).toBe('C');
    expect(meta.guitarTuning?.toLowerCase()).toContain('standard');
  });

  it('does not treat "Intro" in title as section marker', () => {
    const meta = extractSongMetadata(introInTitle);
    expect(meta.artist).toBe('The Group');
    expect(meta.title).toBe('The Intro Song');
    expect(meta.songKey).toBe('D');
    expect(meta.guitarTuning?.toLowerCase()).toContain('drop d');
  });

  it('handles files with no section marker', () => {
    const meta = extractSongMetadata(noSectionMarker);
    expect(meta.title).toBe('No Section');
    expect(meta.artist).toBe('No Marker');
    expect(meta.songKey).toBe('E');
    expect(meta.guitarTuning).toBe('E A D G B E');
  });

  it('handles section marker with extra spaces', () => {
    const meta = extractSongMetadata(sectionMarkerWithSpaces);
    expect(meta.title).toBe('Spaced');
    expect(meta.artist).toBe('Marker');
    expect(meta.songKey).toBe('G');
    expect(meta.guitarTuning?.toLowerCase()).toContain('open g');
  });
});
