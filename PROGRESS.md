# Progress

## v2.0 — Editorial civic atlas rebuild (2026-08-06)

Complete UI architecture and visual redesign while preserving domain contracts.

### Preserved
- Coordinate system (−10…+10, libertarian up)
- Entity model and sample data
- `localStorage` key `political-compass.entities.v1` (v1 array + envelope migration)
- Import/export format and validation
- Zoom/pan, full view, Netlify + GitHub Pages base path
- Domain tests for coordinates, entities, portable data

### New
- Desktop: header + collapsible sidebar + chart + inspector
- Mobile: full-width chart, bottom dock, bottom sheets
- Placement mode for adding entities
- Intentional move mode on mobile; drag threshold on desktop
- Undo for move/delete/import/edit
- Modular design tokens and CSS (paper/editorial palette)
- Filters, storage migration, and expanded test coverage

### Removed
- Field-instrument / deep-space chrome
- Framer Motion
- Tailwind CSS
- Ornamental compass rose, sonar, starfield atmosphere
