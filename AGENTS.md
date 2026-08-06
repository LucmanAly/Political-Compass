# Political Compass — project rules

## Product boundary

This is a personal, local-first political compass. Keep the interaction clear, tactile, and focused on the chart. Do not introduce authentication, analytics, advertising, or a backend.

## Stack and structure

- React + Vite is the application shell.
- Visual system lives in modular CSS under `src/styles/` with tokens in `tokens.css`.
- Use SVG for the chart surface. Coordinate math belongs in `src/lib/coordinates.js`, not inside presentation components.
- Keep persistence behind `src/lib/store.js`. Components must not write to `localStorage` directly.
- `react-zoom-pan-pinch` owns pan/zoom. Prefer CSS over animation libraries.

## Coordinate contract

- Economic: `-10` is Left and `+10` is Right.
- Social/governmental: `-10` is Authoritarian and `+10` is Libertarian.
- Positive social values render upward on the chart because screen Y increases downward.
- Coordinates are always clamped to `[-10, 10]` at the data boundary.

## Storage contract

- Key: `political-compass.entities.v1`
- On-disk shape: plain JSON array of entities (v1 compatibility)
- Migration accepts envelope `{ schemaVersion|version, entities }` without overwriting empty user charts with samples
- Fresh install only (missing key) seeds `SAMPLE_ENTITIES`

## Design contract

- Editorial civic atlas: warm paper surfaces, charcoal text, restrained brick primary action
- Chart is the workspace; chrome supports it rather than competing with it
- Desktop: header + sidebar + chart + inspector
- Mobile: chart between top bar and bottom dock; tools in bottom sheets
- Placement mode for add; intentional move on mobile; drag threshold on desktop
- Serif for title/headings; sans for UI; monospace only for coordinates
- Touch targets ≥ 44×44 CSS pixels; respect safe-area insets and `prefers-reduced-motion`

## Quality

- Run `npm test` and `npm run build` before publishing
- Under GitHub Actions, Vite `base` is `/Political-Compass/`
- Update `PROGRESS.md` when shipping a meaningful milestone
