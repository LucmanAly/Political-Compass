import { quadrantForCoordinates, worldToSvg } from '../../lib/coordinates.js';
import { getInitials } from '../../lib/entities.js';

const QUADRANT_ACCENT = Object.freeze({
  'authoritarian-left': 'var(--quad-al)',
  'authoritarian-right': 'var(--quad-ar)',
  'libertarian-left': 'var(--quad-ll)',
  'libertarian-right': 'var(--quad-lr)',
  origin: 'var(--ink-secondary)',
});

const TYPE_SHAPE = Object.freeze({
  person: 'circle',
  party: 'diamond',
  organization: 'square',
  ideology: 'hex',
});

function TypeBadge({ type }) {
  const shape = TYPE_SHAPE[type] || 'circle';
  if (shape === 'diamond') {
    return <path className="marker-type-badge" d="M0 -7 L7 0 L0 7 L-7 0 Z" />;
  }
  if (shape === 'square') {
    return <rect className="marker-type-badge" x="-5.5" y="-5.5" width="11" height="11" rx="1.5" />;
  }
  if (shape === 'hex') {
    return <path className="marker-type-badge" d="M0 -7 L6 -3.5 L6 3.5 L0 7 L-6 3.5 L-6 -3.5 Z" />;
  }
  return <circle className="marker-type-badge" r="5.5" />;
}

function EntityMarker({
  entity,
  selected,
  interactive = true,
  showLabel = true,
  scale = 1,
  onSelect,
  onPointerDown,
}) {
  const { x, y } = worldToSvg(entity);
  const quadrant = quadrantForCoordinates(entity.economic, entity.social);
  const accent = QUADRANT_ACCENT[quadrant];
  const initials = getInitials(entity.name);
  // Counter-scale slightly so markers stay usable when zoomed far in/out.
  const visualScale = Math.min(1.35, Math.max(0.72, 1 / Math.sqrt(Math.max(scale, 0.5))));
  const imageSize = 36;
  const labelWidth = Math.max(64, Math.min(160, entity.name.length * 6.2 + 16));

  return (
    <g
      className={`entity-marker${selected ? ' is-selected' : ''}`}
      data-entity-marker="true"
      data-entity-id={entity.id}
      transform={`translate(${x} ${y}) scale(${visualScale})`}
      style={{ '--marker-accent': accent }}
      onClick={interactive ? (event) => {
        event.stopPropagation();
        onSelect?.(entity);
      } : undefined}
      onPointerDown={interactive ? (event) => {
        event.stopPropagation();
        onPointerDown?.(event, entity);
      } : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(entity);
        }
      } : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${entity.name}, economic ${entity.economic}, social ${entity.social}`}
      aria-pressed={selected || undefined}
    >
      <circle className="marker-hit" r="28" />
      <circle className="marker-body" r="22" />
      {entity.imageUrl ? (
        <image
          className="marker-image"
          href={entity.imageUrl}
          x={-imageSize / 2}
          y={-imageSize / 2}
          width={imageSize}
          height={imageSize}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#marker-clip)"
        />
      ) : (
        <text className="marker-initials" x="0" y="4.5" textAnchor="middle">
          {initials}
        </text>
      )}
      <circle className="marker-ring" r="22" />
      {selected && <circle className="marker-selected-ring" r="28" />}
      <g className="marker-type" transform="translate(15 -15)">
        <TypeBadge type={entity.type} />
      </g>
      {showLabel && (
        <g className="marker-label" transform="translate(0 36)">
          <rect x={-labelWidth / 2} y="-10" width={labelWidth} height="18" rx="2" />
          <text x="0" y="3" textAnchor="middle">{entity.name}</text>
        </g>
      )}
    </g>
  );
}

export default EntityMarker;
