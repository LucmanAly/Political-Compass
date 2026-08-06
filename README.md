# Political Compass

A personal, local-first political compass for placing and organizing **people**, **parties**, **organizations**, and **ideologies** on a two-axis chart.

The chart is the workspace. Search, filter, add, edit, move, and export stay close at hand without covering the map.

## Coordinate system

| Axis | Range | Meaning |
| --- | --- | --- |
| Economic | −10 → +10 | Left → Right |
| Social / governmental | −10 → +10 | Authoritarian → Libertarian |

Positive social values appear **upward** on the chart.

## Features

- Zoom and pan (wheel, pinch, drag)
- Fit-to-screen and full-view mode (Fullscreen API with CSS fallback)
- Entity markers with image or initials; type indicated by a small shape
- Placement mode for adding (tap empty chart only after pressing Add)
- Edit name, type, image, coordinates, and notes
- Desktop: drag markers to reposition
- Mobile: intentional Move action before repositioning
- Search by name and multi-select type filters
- Entity list that centers the chart on a result
- Quadrant legend
- Local autosave (`localStorage`) with existing-data compatibility
- Sample entities only on a genuine first visit
- Validated JSON import (merge or replace) and JSON export
- Undo for moves, deletes, imports, and edits
- Responsive desktop sidebar + mobile bottom dock / sheets

## Run locally

```bash
npm install
npm run dev
```

Checks:

```bash
npm test
npm run build
```

## Interaction model

### Desktop

- Compact header with product name, Add, and Full view
- Collapsible left sidebar: search, entity list, type filters, legend, import/export
- Large chart workspace
- Right inspector for selected entity details or the add/edit form
- Chart zoom controls: zoom in, zoom out, fit

### Mobile

- Chart fills the space between the top bar and bottom dock
- Dock: **Browse**, **Add**, **Fit**, **More**
- Browse, filters, legend, and data tools open in a single bottom sheet
- Entity details open in a sheet; add/edit uses a full-height sheet with sticky actions
- Minimum touch target 44×44 CSS pixels; safe-area insets respected

### Adding an entity

1. Press **Add** (placement mode)
2. Tap the desired chart location
3. Confirm coordinates in the form and save

Empty-space taps outside placement mode clear selection; they do not create entities.

## Data

Entities autosave under the key `political-compass.entities.v1` as a plain JSON array (v1 shape). A migration layer also accepts envelope payloads `{ schemaVersion, entities }` if introduced later.

Fields per entity:

- `id`, `name`, `type` (`person` | `party` | `organization` | `ideology`)
- `imageUrl` (URL or local data URL)
- `economic`, `social` (−10…+10)
- `notes`, `createdAt`

**Export** downloads a versioned envelope:

```json
{
  "format": "political-compass-entities",
  "version": 1,
  "exportedAt": "…",
  "entities": [ … ]
}
```

**Import** accepts that envelope or a plain array, validates and normalizes records, skips blanks/duplicates, and merges by default. Replace requires confirmation.

Images are resized in the browser; nothing leaves the device unless you export a file.

## Deployment

### Netlify

- Build: `npm run build`
- Publish: `dist`
- SPA fallback is configured in `netlify.toml`

### GitHub Pages

Configured in `.github/workflows/deploy.yml`. Pushes to `main` run tests, build, and deploy to:

https://lucmanaly.github.io/Political-Compass/

Vite sets `base` to `/Political-Compass/` under GitHub Actions and `/` for local development.

## Stack

- React 19 + Vite
- `react-zoom-pan-pinch` for chart navigation
- `lucide-react` for icons
- Vitest for domain tests
- No backend

## Project layout

```
src/
  App.jsx                 # orchestration
  components/
    chart/                # canvas, viewport, markers
    entities/             # list, form, filters, inspector
    layout/               # header, sidebar, mobile dock
    data/                 # legend, import, export tools
    ui/                   # sheets, toasts
  hooks/                  # entities, media query, fullscreen
  lib/                    # coordinates, entities, store, portable, filters
  styles/                 # design tokens + modular CSS
  data/sampleEntities.js
```
