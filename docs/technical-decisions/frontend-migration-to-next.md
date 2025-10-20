# Technical Decision: Frontend Migration to Next.js

## Date

2025-10-20

## Decision

Migrate frontend to Next.js.

## Context

The current setup uses Vite for development and production builds, with React Router for routing, but:

- **fresh start**: the app has started as an exploration of AI capabilities, which added a lot of unnecessary code and tooling that only pollute and increases the build. Although a fresh start isn't ideal due to effort, timing matters. The app isn't mainstream, so it's easier to migrate now.
- **routing**: the current setup has barely grown and already is complex to handle it, as it uses react-router
- **rendering**: the current setup has a prerender script to handle SSR templates for the pages, but since ISR has been taken in consideration for the search page, since it will include an
index for artist search (which needs updates over time), the prerender script will not be enough, and the current setup will need to be updated to handle ISR. Custom handling this isn't the way to go.
- **API routes**: Potential to consolidate Express routes into Next.js API routes, for a unified backend.
- **deployment**: Next.js has a more straightforward deployment strategy, as it can be deployed as a static site, or as a serverless function, or as a serverless function with a database. Since the app is already deployed on Vercel, moving to Next.js turns it into a seamless experience.
- **learing experience**: Next.js can't be ignored as currently the market demands experience on it.

Considering the points above, looking at the future perspective of the app and the fact that it is still in an MVP version, the decision to migrate