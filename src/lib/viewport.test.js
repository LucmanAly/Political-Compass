import { describe, expect, it } from 'vitest';
import { coverScaleForViewport } from './viewport.js';

describe('coverScaleForViewport', () => {
  it('fills a portrait viewport using its height', () => {
    expect(coverScaleForViewport(390, 844)).toBeCloseTo(844 / 390);
  });

  it('fills a landscape viewport using its width', () => {
    expect(coverScaleForViewport(844, 390)).toBeCloseTo(844 / 390);
  });

  it('keeps a square viewport at the normal fit scale', () => {
    expect(coverScaleForViewport(720, 720)).toBe(1);
  });

  it('falls back safely for invalid dimensions', () => {
    expect(coverScaleForViewport(0, 844)).toBe(1);
    expect(coverScaleForViewport(Number.NaN, 844)).toBe(1);
  });
});
