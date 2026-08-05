export function coverScaleForViewport(width, height) {
  const safeWidth = Number(width);
  const safeHeight = Number(height);

  if (!Number.isFinite(safeWidth) || !Number.isFinite(safeHeight) || safeWidth <= 0 || safeHeight <= 0) {
    return 1;
  }

  return Math.max(safeWidth, safeHeight) / Math.min(safeWidth, safeHeight);
}
