import { forwardRef, useRef } from 'react';
import { CHART_BOUNDS, formatCoordinate, svgToWorld, worldToSvg } from '../../lib/coordinates.js';
import EntityMarker from './EntityMarker.jsx';

const TICK_VALUES = Array.from({ length: 11 }, (_, index) => -10 + index * 2);

const QUADRANT_LABELS = [
  { text: 'Libertarian Left', x: 140, y: 150, anchor: 'start' },
  { text: 'Libertarian Right', x: 860, y: 150, anchor: 'end' },
  { text: 'Authoritarian Left', x: 140, y: 868, anchor: 'start' },
  { text: 'Authoritarian Right', x: 860, y: 868, anchor: 'end' },
];

const CompassCanvas = forwardRef(function CompassCanvas({
  entities = [],
  selectedEntityId,
  placementPoint = null,
  interactive = true,
  zoomScale = 1,
  showAllLabels = false,
  onCanvasClick,
  onCanvasPointerMove,
  onMarkerSelect,
  onMarkerPointerDown,
}, ref) {
  const { left, top, right, bottom } = CHART_BOUNDS;
  const chartSize = right - left;
  const pointerDown = useRef(null);

  const clientToWorld = (clientX, clientY) => {
    const svg = ref?.current;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    const svgPoint = {
      x: ((clientX - bounds.left) / bounds.width) * 1000,
      y: ((clientY - bounds.top) / bounds.height) * 1000,
    };
    if (svgPoint.x < left || svgPoint.x > right || svgPoint.y < top || svgPoint.y > bottom) {
      return null;
    }
    return svgToWorld(svgPoint);
  };

  const handlePointerDown = (event) => {
    if (!interactive || event.button !== 0) return;
    pointerDown.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event) => {
    if (!onCanvasPointerMove) return;
    onCanvasPointerMove(clientToWorld(event.clientX, event.clientY));
  };

  const handlePointerLeave = () => {
    onCanvasPointerMove?.(null);
  };

  const handleCanvasClick = (event) => {
    if (!interactive) return;
    if (event.target.closest?.('[data-entity-marker]')) return;

    const start = pointerDown.current;
    pointerDown.current = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;

    const world = clientToWorld(event.clientX, event.clientY);
    if (!world) return;
    onCanvasClick?.(world);
  };

  const dense = entities.length > 18 && zoomScale < 1.4;
  const showLabel = (entity) => {
    if (showAllLabels) return true;
    if (entity.id === selectedEntityId) return true;
    if (dense) return false;
    return zoomScale >= 1.05 || entities.length <= 12;
  };

  // Draw selected marker last so it sits above overlaps.
  const orderedEntities = selectedEntityId
    ? [
      ...entities.filter((entity) => entity.id !== selectedEntityId),
      ...entities.filter((entity) => entity.id === selectedEntityId),
    ]
    : entities;

  return (
    <svg
      ref={ref}
      className="compass-canvas"
      viewBox="0 0 1000 1000"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="compass-title compass-description"
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleCanvasClick}
    >
      <title id="compass-title">Political compass</title>
      <desc id="compass-description">
        Four-quadrant chart. Economic axis runs left to right from −10 to +10.
        Social axis runs authoritarian (bottom) to libertarian (top) from −10 to +10.
      </desc>

      <defs>
        <clipPath id="marker-clip">
          <circle r="18" cx="0" cy="0" />
        </clipPath>
      </defs>

      {/* Page wash */}
      <rect width="1000" height="1000" className="chart-page" />

      {/* Quadrants — libertarian up, authoritarian down */}
      <rect className="quad quad-ll" x={left} y={top} width={chartSize / 2} height={chartSize / 2} />
      <rect className="quad quad-lr" x={500} y={top} width={chartSize / 2} height={chartSize / 2} />
      <rect className="quad quad-al" x={left} y={500} width={chartSize / 2} height={chartSize / 2} />
      <rect className="quad quad-ar" x={500} y={500} width={chartSize / 2} height={chartSize / 2} />

      <rect className="chart-border" x={left} y={top} width={chartSize} height={chartSize} fill="none" />

      <g className="grid-lines" aria-hidden="true">
        {TICK_VALUES.map((value) => {
          const { x } = worldToSvg({ economic: value, social: 0 });
          const { y } = worldToSvg({ economic: 0, social: value });
          return (
            <g key={value}>
              <line x1={x} y1={top} x2={x} y2={bottom} />
              <line x1={left} y1={y} x2={right} y2={y} />
            </g>
          );
        })}
      </g>

      <g className="axis-lines" aria-hidden="true">
        <line x1={left - 18} y1={500} x2={right + 18} y2={500} />
        <line x1={500} y1={top - 18} x2={500} y2={bottom + 18} />
      </g>

      <g className="axis-ticks" aria-hidden="true">
        {TICK_VALUES.map((value) => {
          const { x } = worldToSvg({ economic: value, social: 0 });
          const { y } = worldToSvg({ economic: 0, social: value });
          return (
            <g key={`tick-${value}`}>
              <line x1={x} y1={494} x2={x} y2={506} />
              <line x1={494} y1={y} x2={506} y2={y} />
              {value !== 0 && (
                <>
                  <text className="axis-number" x={x} y={524} textAnchor="middle">
                    {formatCoordinate(value)}
                  </text>
                  <text className="axis-number" x={512} y={y + 3.5} textAnchor="start">
                    {formatCoordinate(value)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </g>

      <g className="quadrant-labels" aria-hidden="true">
        {QUADRANT_LABELS.map((label) => (
          <text key={label.text} x={label.x} y={label.y} textAnchor={label.anchor}>
            {label.text}
          </text>
        ))}
      </g>

      <g className="axis-labels" aria-hidden="true">
        <text className="axis-label" x={72} y={505} textAnchor="middle">Left</text>
        <text className="axis-label" x={928} y={505} textAnchor="middle">Right</text>
        <text className="axis-label" x={500} y={62} textAnchor="middle">Libertarian</text>
        <text className="axis-label" x={500} y={948} textAnchor="middle">Authoritarian</text>
      </g>

      <circle className="origin-dot" cx={500} cy={500} r={3.5} aria-hidden="true" />

      <g className="entity-layer" aria-label="Plotted entities">
        {orderedEntities.map((entity) => (
          <EntityMarker
            key={entity.id}
            entity={entity}
            selected={entity.id === selectedEntityId}
            interactive={interactive}
            showLabel={showLabel(entity)}
            scale={zoomScale}
            onSelect={onMarkerSelect}
            onPointerDown={onMarkerPointerDown}
          />
        ))}
      </g>

      {placementPoint && (() => {
        const point = worldToSvg(placementPoint);
        return (
          <g className="placement-preview" transform={`translate(${point.x} ${point.y})`} aria-hidden="true">
            <circle className="placement-ring" r="26" />
            <circle className="placement-dot" r="5" />
            <text className="placement-coords" x="0" y="42" textAnchor="middle">
              {formatCoordinate(placementPoint.economic)} · {formatCoordinate(placementPoint.social)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
});

export default CompassCanvas;
