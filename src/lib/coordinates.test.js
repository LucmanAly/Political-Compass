import { describe, expect, it } from 'vitest';
import {
  clampCoordinate,
  formatCoordinate,
  quadrantForCoordinates,
  svgToWorld,
  worldToSvg,
} from './coordinates.js';

describe('coordinate contract', () => {
  it('maps the origin to the center of the SVG', () => {
    expect(worldToSvg({ economic: 0, social: 0 })).toEqual({ x: 500, y: 500 });
  });

  it('maps right and libertarian upward', () => {
    expect(worldToSvg({ economic: 10, social: 10 })).toEqual({ x: 900, y: 100 });
    expect(worldToSvg({ economic: -10, social: -10 })).toEqual({ x: 100, y: 900 });
  });

  it('round-trips coordinates without changing their meaning', () => {
    const coordinate = { economic: -6.25, social: 4.5 };
    expect(svgToWorld(worldToSvg(coordinate))).toEqual(coordinate);
  });

  it('clamps invalid and out-of-range values at the data boundary', () => {
    expect(clampCoordinate(14)).toBe(10);
    expect(clampCoordinate(-14)).toBe(-10);
    expect(clampCoordinate('not a number')).toBe(0);
  });

  it('assigns all four quadrant names using the documented sign convention', () => {
    expect(quadrantForCoordinates(-2, -2)).toBe('authoritarian-left');
    expect(quadrantForCoordinates(2, -2)).toBe('authoritarian-right');
    expect(quadrantForCoordinates(-2, 2)).toBe('libertarian-left');
    expect(quadrantForCoordinates(2, 2)).toBe('libertarian-right');
    expect(quadrantForCoordinates(0, 0)).toBe('origin');
  });

  it('formats instrument readouts with a visible sign', () => {
    expect(formatCoordinate(-3.2)).toBe('−3.2');
    expect(formatCoordinate(5.8)).toBe('+5.8');
    expect(formatCoordinate(0)).toBe('0.0');
  });
});
