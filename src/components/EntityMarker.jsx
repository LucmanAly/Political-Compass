import { quadrantForCoordinates, worldToSvg } from '../lib/coordinates.js';
import { getInitials } from '../lib/entities.js';

const RING_COLORS = Object.freeze({
  'authoritarian-left': '#C4485C',
  'authoritarian-right': '#3E6B99',
  'libertarian-left': '#5B8C5A',
  'libertarian-right': '#D4A24C',
  origin: '#C9A661',
});

function EntityMarker({ entity, selected, interactive = true, onClick, onPointerDown }) {
  const { x, y } = worldToSvg(entity);
  const color = RING_COLORS[quadrantForCoordinates(entity.economic, entity.social)];
  const initials = getInitials(entity.name);
  const imageSize = 42;

  return (
    <g
      className={`entity-marker ${selected ? 'is-selected' : ''}`}
      data-entity-marker="true"
      data-entity-id={entity.id}
      transform={`translate(${x} ${y})`}
      onClick={interactive ? (event) => {
        event.stopPropagation();
        onClick(entity);
      } : undefined}
      onPointerDown={interactive ? (event) => {
        event.stopPropagation();
        onPointerDown(event, entity);
      } : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(entity);
        }
      } : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${entity.name}, ${entity.economic}, ${entity.social}`}
    >
      <circle className="marker-shadow" cx="2" cy="4" r="28" />
      <circle className="marker-halo" r="31" fill={color} />
      <circle className="marker-body" r="25" fill="#161e2b" />
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
        <text className="marker-initials" x="0" y="5" textAnchor="middle">
          {initials}
        </text>
      )}
      <circle className="marker-ring" r="25" stroke={color} />
      {selected && <circle className="marker-selected-ring" r="33" stroke={color} />}
      <g className="marker-label" transform="translate(0 42)">
        <rect x={Math.min(-86, -entity.name.length * 3.5)} y="-9" width={Math.max(72, entity.name.length * 7 + 18)} height="18" rx="2" />
        <text x="0" y="3" textAnchor="middle">{entity.name}</text>
      </g>
    </g>
  );
}

export default EntityMarker;
