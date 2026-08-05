# Political Compass

An interactive political-compass instrument built around a deep-space navigation aesthetic. The v1 application lets a user place people, parties, organizations, and ideologies on a two-axis chart and keep the chart locally on their device.

## Current phase

Phase 3 adds name search, multi-select type filters, validated JSON portability, and a compact responsive chart toolbar. Phase 2 supplies smooth zoom/pan, local entity persistence, sample markers, marker dragging, quick-add, and the responsive add/edit workflow.

## Run locally

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm test
npm run build
```

## Coordinate system

- Economic: `-10` Left to `+10` Right.
- Social/governmental: `-10` Authoritarian to `+10` Libertarian.
- The positive social direction is drawn upward on the chart.

## Data behavior

Entities are autosaved to versioned browser `localStorage`. A fresh chart starts with five illustrative sample positions so the interaction layer is immediately testable. Images are resized into local data URLs; no image or entity data leaves the browser in v1.

Use **Export JSON** to download the current chart as a versioned `political-compass-YYYY-MM-DD.json` file. Imports accept that envelope (or a plain entity array), validate records, skip duplicates, and merge by default. Replacing the chart requires an explicit confirmation.

## Deployment

Netlify uses `npm run build`, publishes `dist`, and sends unknown routes to `index.html` for the single-page application.

GitHub Pages is also configured through `.github/workflows/deploy.yml`. Pushes to `main` run the tests, build `dist`, and deploy it to [`https://lucmanaly.github.io/Political-Compass/`](https://lucmanaly.github.io/Political-Compass/). The Vite base path switches automatically for the project-site URL while local development stays at `/`.
