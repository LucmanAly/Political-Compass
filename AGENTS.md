# Political Compass — project rules

## Product boundary

This is a personal, local-first political-compass instrument. Keep the interaction fast, tactile, and visually distinctive. Do not introduce authentication, analytics, advertising, or a backend during v1.

## Stack and structure

- React + Vite is the application shell.
- Tailwind is available for layout utilities; the visual system lives in `src/styles.css` so the instrument remains easy to tune.
- Use SVG for the chart surface. Coordinate math belongs in `src/lib/coordinates.js`, not inside presentation components.
- Keep persistence behind a small adapter in `src/lib/store.js` when the data layer is added. Components must not write to `localStorage` directly.
- Framer Motion is reserved for restrained transitions. `react-zoom-pan-pinch` is the planned Phase 2 interaction layer.

## Coordinate contract

- Economic: `-10` is Left and `+10` is Right.
- Social/governmental: `-10` is Authoritarian and `+10` is Libertarian.
- Positive social values render upward on the chart because screen Y increases downward.
- Coordinates are always clamped to `[-10, 10]` at the data boundary.

## Design contract

- Background `#0F1420`; brass `#C9A661`.
- Quadrant washes stay translucent and atmospheric, never flat solid blocks.
- The compass rose is centered at the origin and remains the visual anchor.
- Display type uses Fraunces/Newsreader-like serif styling; UI uses Inter/IBM Plex Sans; numeric readouts use IBM Plex Mono/JetBrains Mono.
- The canvas is the interface. Avoid generic dashboard cards around it.
- Mobile touch targets must be at least 44px once controls are interactive.

## Phase discipline

- Work on `develop`; keep `main` releasable.
- Finish and validate one phase before starting the next.
- Update `PROGRESS.md` at every phase checkpoint with completed work, checks actually run, known limitations, and the next step.
- Do not claim browser, mobile, backend, or end-to-end validation unless it was actually performed.
- Keep nice-to-haves behind the v1 acceptance criteria.
