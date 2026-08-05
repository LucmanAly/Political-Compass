# Political Compass progress

## Current status

Version 1.1 — True full-screen canvas cover: **promoted to main**

Repository: `LucmanAly/Political-Compass`  
Working branch: `develop` (follow-on work)  
Version: `1.1` (package version `1.1.0`)

Phase 2 was promoted to `main` at commit `566565f7cc793504df6efe69119a8763560e3e3d`. Phase 3 is now promoted to `main`; `develop` remains the active branch for follow-on work. The visual review limitation remains documented because the remote browser cannot reach workspace-local preview servers from this environment.

## Phase 3 checklist

- [x] Search entities by name
- [x] Multi-select type filters with visible-count feedback
- [x] Empty filtered-state recovery with reset action
- [x] Versioned JSON export with a stable file name
- [x] Import validation with duplicate and malformed-record handling
- [x] Merge import as the safe default
- [x] Explicit confirmation before replacing the current chart
- [x] Portable-data unit coverage — 12 tests passed across 3 files
- [x] Focus-visible, touch-target, and overscroll polish
- [x] Production build — Vite build passed
- [ ] Desktop and phone visual interaction review — blocked by workspace-local browser access
- [x] Publish the Phase 3 checkpoint to `develop` — commit `731fa9a6f84c4681b340ad513d82dbcd2b0b4150`
- [x] Promote the Phase 3 checkpoint to `main`
- [x] Configure GitHub Pages deployment from `main`
- [x] Add immersive Full View mode with native fullscreen and a CSS fallback
- [x] Keep the Full View text label visible on mobile with a 44px touch target
- [x] Add a bottom release stamp with Version 1.0 and the last-updated date
- [x] Establish the 1.0 → 1.1 → 1.2 release-numbering convention
- [x] Publish Version 1.0 to `develop`
- [x] Promote Version 1.0 to `main`
- [x] Expand the Full View canvas frame to the complete viewport
- [x] Automatically cover portrait and landscape screens without distorting the graph
- [x] Preserve pan access to cropped edges and retain pinch/scroll zoom
- [x] Add unit coverage for portrait, landscape, square, and invalid viewport dimensions
- [x] Override the zoom library's intrinsic 300×300 wrapper so the graph inherits the full viewport
- [x] Publish Version 1.1 to `develop`
- [x] Promote Version 1.1 to `main`

## Phase 3 boundary

Compare mode, starter-chart selection, Supabase sync, and public read-only links remain optional follow-on work. They are intentionally outside this checkpoint so the core chart stays fast and personal.

## Validation record

- `npm test` — passed, 4 test files / 16 tests.
- `npm run build` — passed, Vite generated `dist` successfully.
- `GITHUB_ACTIONS=true npm run build` — passed, generated asset URLs under `/Political-Compass/`.
- Version 1.0 release build — passed, 1,998 modules transformed with the Pages base path.
- Version 1.1 release build — passed, 1,999 modules transformed in both standard and Pages builds.
- Full View validation — controls are hidden, canvas expands, editing gestures are disabled, and pan/zoom remains available.
- Browser visual QA — not completed in this environment; the remote browser cannot connect to workspace-local preview servers.

## Handoff

Version 1.1 corrects Full View so the graph itself covers the complete screen instead of merely hiding the surrounding interface. The identical release tree is published to `develop` and `main`.
