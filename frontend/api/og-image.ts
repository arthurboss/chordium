import { ImageResponse } from '@vercel/og';
import React from 'react';

export const config = {
  runtime: 'edge',
};

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_LEN = 120;

// Field lengths come straight from the request query on an edge function with
// no auth, so they're clamped rather than trusted before going on the card.
function clamp(text: string): string {
  return text.length > MAX_LEN ? `${text.slice(0, MAX_LEN - 1)}…` : text;
}

/**
 * Renders the `og:image`/`twitter:image` shown when a shared chord-sheet
 * link is pasted into WhatsApp, Slack, etc. Takes plain `title`/`artist`
 * query params rather than the link's `d` payload: `link-preview.ts` already
 * decoded that once, so this just draws the two strings it was given.
 */
export default function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clamp(searchParams.get('title') ?? 'Chordium');
  const artist = clamp(searchParams.get('artist') ?? '');

  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          backgroundColor: '#151022',
          color: '#f5f3ff',
          fontFamily: 'sans-serif',
          padding: 80,
          textAlign: 'center',
        },
      },
      React.createElement(
        'div',
        { style: { fontSize: 64, fontWeight: 700, lineHeight: 1.2 } },
        title
      ),
      artist &&
        React.createElement(
          'div',
          { style: { fontSize: 40, color: '#9b87f5' } },
          artist
        ),
      React.createElement(
        'div',
        { style: { fontSize: 28, color: '#7c7a8a', marginTop: 32 } },
        'Chordium'
      )
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
