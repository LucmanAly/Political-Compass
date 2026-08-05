export const WORLD_LIMIT = 10;
export const SVG_CENTER = 500;
export const SVG_UNITS_PER_COORDINATE = 40;

export const CHART_BOUNDS = Object.freeze({
  left: 100,
  top: 100,
  right: 900,
  bottom: 900,
});

export function clampCoordinate(value, minimum = -WORLD_LIMIT, maximum = WORLD_LIMIT) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(maximum, Math.max(minimum, numericValue));
}

export function worldToSvg({ economic, social }) {
  return {
    x: SVG_CENTER + clampCoordinate(economic) * SVG_UNITS_PER_COORDINATE,
    y: SVG_CENTER - clampCoordinate(social) * SVG_UNITS_PER_COORDINATE,
  };
}

export function svgToWorld({ x, y }) {
  return {
    economic: clampCoordinate((Number(x) - SVG_CENTER) / SVG_UNITS_PER_COORDINATE),
    social: clampCoordinate((SVG_CENTER - Number(y)) / SVG_UNITS_PER_COORDINATE),
  };
}

export function quadrantForCoordinates(economic, social) {
  const horizontal = clampCoordinate(economic);
  const vertical = clampCoordinate(social);

  if (horizontal === 0 && vertical === 0) {
    return 'origin';
  }

  if (vertical >= 0) {
    return horizontal <= 0 ? 'libertarian-left' : 'libertarian-right';
  }

  return horizontal <= 0 ? 'authoritarian-left' : 'authoritarian-right';
}

export function formatCoordinate(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue === 0) {
    return '0.0';
  }

  const absoluteValue = Math.abs(numericValue).toFixed(1);
  return numericValue > 0 ? `+${absoluteValue}` : `−${absoluteValue}`;
}
