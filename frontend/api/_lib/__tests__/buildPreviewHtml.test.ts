import { describe, it, expect } from 'vitest';
import { buildPreviewHtml } from '../buildPreviewHtml';
import type { JamPayload } from '../types';

const TEMPLATE = `<!doctype html>
<html>
<head>
  <title>chordium</title>
  <meta name="description" content="View guitar chords without visual distractions." />
</head>
<body></body>
</html>`;

const PAYLOAD: JamPayload = {
  title: 'Neon',
  artist: 'John Mayer',
  songKey: 'C',
  guitarCapo: 0,
  guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  songChords: '[Verse]\nC D Em G',
};

describe('buildPreviewHtml', () => {
  it('returns the template unchanged when there is no payload', () => {
    expect(buildPreviewHtml(TEMPLATE, null, 'https://chordium.vercel.app/john-mayer/neon')).toBe(TEMPLATE);
  });

  it('injects title, description, and og/twitter tags from the payload', () => {
    const html = buildPreviewHtml(TEMPLATE, PAYLOAD, 'https://chordium.vercel.app/john-mayer/neon?d=abc');

    expect(html).toContain('<title>Neon — John Mayer | Chordium</title>');
    expect(html).toContain('property="og:title" content="Neon — John Mayer | Chordium"');
    expect(html).toContain('property="og:url" content="https://chordium.vercel.app/john-mayer/neon?d=abc"');
    expect(html).toContain('property="og:image" content="https://chordium.vercel.app/api/og-image?title=Neon&amp;artist=John+Mayer"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('escapes title/artist so a crafted payload cannot inject markup', () => {
    const malicious: JamPayload = {
      ...PAYLOAD,
      title: '<script>alert(1)</script>',
      artist: 'a" onmouseover="alert(1)',
    };

    const html = buildPreviewHtml(TEMPLATE, malicious, 'https://chordium.vercel.app/x/y');

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('onmouseover="alert(1)"');
    expect(html).toContain('&lt;script&gt;');
  });
});
