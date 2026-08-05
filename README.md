# Political Compass

An interactive political-compass instrument built around a deep-space navigation aesthetic. The v1 application lets a user place people, parties, organizations, and ideologies on a two-axis chart and keep the chart locally on their device.

## Current phase

Phase 2 adds smooth zoom/pan, local entity persistence, sample markers, marker dragging, quick-add, and a responsive add/edit workflow. Search, import/export, and final release hardening are reserved for Phase 3.

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

## Deployment

Netlify uses `npm run build`, publishes `dist`, and sends unknown routes to `index.html` for the single-page application.
