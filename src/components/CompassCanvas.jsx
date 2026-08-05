import { forwardRef, useRef } from 'react';
import { CHART_BOUNDS, formatCoordinate, svgToWorld, worldToSvg } from '../lib/coordinates.js';
import CompassRose from './CompassRose.jsx';
import EntityMarker from './EntityMarker.jsx';

const TICK_VALUES = Array.from({ length: 11 }, (_, index) => -10 + index * 2);
const QUADRANT_LABELS = [
  { text: 'LIBERTARIAN LEFT', x: 132, y: 148, anchor: 'start' },
  { text: 'LIBERTARIAN RIGHT', x: 868, y: 148, anchor: 'end' },
  { text: 'AUTHORITARIAN LEFT', x: 132, y: 872, anchor: 'start' },
  { text: 'AUTHORITARIAN RIGHT', x: 868, y: 872, anchor: 'end' },
];

const CompassCanvas = forwardRef(function CompassCanvas({
  entities = [],
  selectedEntityId,
  pingKey,
  onCanvasClick,
  onMarkerClick,
  onMarkerPointerDown,
}, ref) {
  const { left, top, right, bottom } = CHART_BOUNDS;
  const chartSize = right - left;
  const pointerDown = useRef(null);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    pointerDown.current = { x: event.clientX, y: event.clientY };
  };

  const handleCanvasClick = (event) => {
    if (event.target.closest?.('[data-entity-marker]')) return;

    const start = pointerDown.current;
    pointerDown.current = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;

    const svg = ref?.current;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const svgPoint = {
      x: ((event.clientX - bounds.left) / bounds.width) * 1000,
      y: ((event.clientY - bounds.top) / bounds.height) * 1000,
    };

    if (svgPoint.x < left || svgPoint.x > right || svgPoint.y < top || svgPoint.y > bottom) return;
    onCanvasClick(svgToWorld(svgPoint));
  };

  return (
    <svg
      ref={ref}
      className="compass-canvas"
      viewBox="0 0 1000 1000"
      role="img"
      aria-labelledby="compass-title compass-description"
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handlePointerDown}
      onClick={handleCanvasClick}
    >
      <title id="compass-title">Political compass coordinate instrument</title>
      <desc id="compass-description">
        An interactive four-quadrant chart with economic Left to Right on the horizontal axis and
        governmental Authoritarian to Libertarian on the vertical axis.
      </desc>

      <defs>
        <linearGradient id="quadrant-cranberry" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C4485C" stopOpacity="0.2" />
          <stop offset="1" stopColor="#C4485C" stopOpacity="0.07" />
        </linearGradient>
        <linearGradient id="quadrant-steel" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E6B99" stopOpacity="0.18" />
          <stop offset="1" stopColor="#3E6B99" stopOpacity="0.07" />
        </linearGradient>
        <linearGradient id="quadrant-moss" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5B8C5A" stopOpacity="0.18" />
          <stop offset="1" stopColor="#5B8C5A" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="quadrant-amber" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#D4A24C" stopOpacity="0.19" />
          <stop offset="1" stopColor="#D4A24C" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id="origin-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#C9A661" stopOpacity="0.15" />
          <stop offset="0.46" stopColor="#C9A661" stopOpacity="0.04" />
          <stop offset="1" stopColor="#C9A661" stopOpacity="0" />
        </radialGradient>
        <filter id="axis-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="marker-clip">
          <circle r="21" cx="0" cy="0" />
        </clipPath>
      </defs>

      <rect width="1000" height="1000" fill="#0F1420" />
      <rect x={left} y={top} width={chartSize / 2} height={chartSize / 2} fill="url(#quadrant-moss)" />
      <rect x={500} y={top} width={chartSize / 2} height={chartSize / 2} fill="url(#quadrant-amber)" />
      <rect x={left} y={500} width={chartSize / 2} height={chartSize / 2} fill="url(#quadrant-cranberry)" />
      <rect x={500} y={500} width={chartSize / 2} height={chartSize / 2} fill="url(#quadrant-steel)" />

      <g className="chart-border" aria-hidden="true">
        <rect x={left} y={top} width={chartSize} height={chartSize} fill="none" />
      </g>

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

      <g className="axis-lines" filter="url(#axis-glow)" aria-hidden="true">
        <line x1={left - 22} y1={500} x2={right + 22} y2={500} />
        <line x1={500} y1={top - 22} x2={500} y2={bottom + 22} />
      </g>

      <g className="axis-ticks" aria-hidden="true">
        {TICK_VALUES.map((value) => {
          const { x } = worldToSvg({ economic: value, social: 0 });
          const { y } = worldToSvg({ economic: 0, social: value });
          return (
            <g key={`tick-${value}`}>
              <line x1={x} y1={493} x2={x} y2={507} />
              <line x1={493} y1={y} x2={507} y2={y} />
              {value !== 0 && (
                <>
                  <text className="axis-number" x={x} y={528} textAnchor="middle">
                    {formatCoordinate(value)}
                  </text>
                  <text className="axis-number" x={518} y={y + 3} textAnchor="start">
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
        <text className="axis-label axis-label-left" x={74} y={505} textAnchor="middle">LEFT</text>
        <text className="axis-label axis-label-right" x={926} y={505} textAnchor="middle">RIGHT</text>
        <text className="axis-label axis-label-top" x={500} y={63} textAnchor="middle">LIBERTARIAN</text>
        <text className="axis-label axis-label-bottom" x={500} y={950} textAnchor="middle">AUTHORITARIAN</text>
        <text className="axis-sub-label" x={500} y={81} textAnchor="middle">GOVERNMENTAL</text>
        <text className="axis-sub-label" x={500} y={934} textAnchor="middle">GOVERNMENTAL</text>
      </g>

      <circle className="origin-halo" cx={500} cy={500} r={148} fill="url(#origin-halo)" aria-hidden="true" />
      <CompassRose />

      {pingKey > 0 && (
        <circle key={pingKey} className="sonar-ping" cx="500" cy="500" r="38" aria-hidden="true" />
      )}

      <g className="entity-layer" aria-label="Plotted entities">
        {entities.map((entity) => (
          <EntityMarker
            key={entity.id}
            entity={entity}
            selected={entity.id === selectedEntityId}
            onClick={onMarkerClick}
            onPointerDown={onMarkerPointerDown}
          />
        ))}
      </g>

      <g className="instrument-corner-marks" aria-hidden="true">
        <path d="M 100 122 V 100 H 122" />
        <path d="M 878 100 H 900 V 122" />
        <path d="M 100 878 V 900 H 122" />
        <path d="M 878 900 H 900 V 878" />
      </g>
    </svg>
  );
});

export default CompassCanvas;
