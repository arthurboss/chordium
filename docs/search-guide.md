# Search Guide

Behavior reference for the search UI. For request/response shapes, see [Search & Artist-Songs Requests](./dev-guides/search-types.md).

## Results

A query is matched against artists and songs at once. The response is split into up to three sections, each shown only if it has matches:

- **Artists**: acts whose name matches.
- **Songs**: songs whose title matches, most relevant first.
- **Lyrics matches**: songs that match by lyrics rather than title, kept separate so a phrase common in lyrics can't crowd out a title match.

## Drilling Into a Section

Selecting a section (e.g. "Artists") replaces the overview with that section's full list, its own filter box, and a sort control (Relevance / A to Z / Z to A). Only one view renders at a time: the overview, or the drilled-into section.

## Opening an Artist

Reachable only from the Artists section. Opens the artist's own page (`/:artist`) with their full song list, same filter and sort controls. The Artists section's filter text does not carry over.

## Filtering

Scoped to whatever list is currently on screen (a drilled section, or an artist's songs), matched against title and, for songs, artist. Client-side only: no request is made while typing. Clearing it restores the full list.

## Back Navigation

Retraces exactly one step:

- Artist's own songs -> the Artists section (the only place it could have been opened from), not the overview.
- Drilled-into section -> the overview.
- Overview -> wherever search was entered from.

A chord sheet's own back button returns to the artist's song list with the filter cleared; **Back** from there returns to the Artists section.

## Clear

Resets the query, all results, and the URL.

## URL

- `?q=<query>` reflects the submitted query.
- `&section=<key>` reflects a drilled-into section; added and removed client-side, no new request.
- A new search resets any drilled-into section back to the overview.
- The URL changes only on submit, or when drilling in/out of a section: never while typing or filtering.
