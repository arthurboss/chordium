# Color System Overview

This brief outlines our design-aligned color tokens and how they map into Tailwind.

## Token tiers

1. **Foundation tokens** (CSS variables prefixed with `--neutral-*`, `--brand-*`, etc.)
   - Represent raw OKLCH values for the palette ramps.
   - Defined for both light and dark themes inside `frontend/src/theme/tokens.css`.
2. **Semantic tokens** (`--background`, `--primary`, `--destructive`, …)
   - Alias foundation tokens to communicate intent (surface, action, status).
   - Mirrored between light/dark themes to keep parity.
3. **Component tokens**
   - Used sparingly for areas like the sidebar or chord utilities where bespoke hues are required.

## Foundation palette snapshot

| Token              | Description                       | OKLCH                                                          |
| ------------------ | --------------------------------- | -------------------------------------------------------------- |
| `--neutral-0`      | Base white/ink depending on theme | `1 0 0` (light) / `0.9848 0 0` (dark)                          |
| `--neutral-5`      | Base background light             | `0.9872 0.0011 264.55`                                         |
| `--neutral-20`     | Subtle surface                    | `0.9676 0.0013 286.37` (light) / `0.3633 0.008 285.99` (dark)  |
| `--neutral-40`     | Mid neutral                       | `0.9197 0.004 286.32` (light) / `0.3151 0.0067 286.01` (dark)  |
| `--neutral-70`     | Muted text                        | `0.5519 0.0137 285.94`                                         |
| `--neutral-85`     | Secondary text                    | `0.2103 0.0059 285.88`                                         |
| `--neutral-90`     | Primary text                      | `0.2072 0.0395 265.52`                                         |
| `--brand-50`       | Primary brand hue                 | `0.7264 0.1588 305.88`                                         |
| `--brand-contrast` | On-brand text                     | `0.9848 0 0` (light) / `0.2103 0.0059 285.88` (dark)           |
| `--accent-50`      | Auxiliary accent                  | `0.9676 0.0013 286.37` (light) / `0.3151 0.0067 286.01` (dark) |
| `--error-60`       | Destructive/action warning        | `0.6368 0.2078 25.33` (light) / `0.3959 0.1331 25.72` (dark)   |

## Mapping into Tailwind

Tailwind consumes these tokens through the `extend.colors` section @frontend/tailwind.config

- `palette.*` exposes foundation values for reference and documentation.
- Semantic keys (`background`, `primary`, `muted`, etc.) power typical utility classes.
- Component buckets (`sidebar`, `chord`) capture bespoke needs while staying grouped.

For new colors, add the OKLCH value as a foundation token in `frontend/src/theme/tokens.css`, then map it to a semantic role before using it in components. This keeps designer intent explicit while remaining Tailwind-friendly.
