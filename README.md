# Political Compass

An interactive political-compass instrument built around a deep-space navigation aesthetic. The v1 application will let a user place people, parties, organizations, and ideologies on a two-axis chart and keep the chart locally on their device.

## Current phase

Phase 1 is the visual foundation: the chart surface, quadrant atmosphere, coordinate scale, compass rose, legend, and responsive shell. Interaction and entity management are intentionally staged for later phases.

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

## Deployment

Netlify uses `npm run build`, publishes `dist`, and sends unknown routes to `index.html` for the single-page application.
