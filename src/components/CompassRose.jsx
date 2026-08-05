const TICK_ANGLES = Array.from({ length: 24 }, (_, index) => index * 15);

function CompassRose() {
  return (
    <g className="compass-rose" aria-hidden="true">
      <circle className="rose-ring rose-ring-outer" cx="500" cy="500" r="91" />
      <circle className="rose-ring rose-ring-mid" cx="500" cy="500" r="67" />
      <circle className="rose-ring rose-ring-inner" cx="500" cy="500" r="12" />

      {TICK_ANGLES.map((angle) => (
        <line
          className={angle % 45 === 0 ? 'rose-tick rose-tick-major' : 'rose-tick'}
          key={angle}
          x1="500"
          y1="407"
          x2="500"
          y2={angle % 45 === 0 ? '416' : '413'}
          transform={`rotate(${angle} 500 500)`}
        />
      ))}

      <path className="rose-needle rose-needle-vertical" d="M 500 414 L 510 490 L 500 500 L 490 490 Z" />
      <path className="rose-needle rose-needle-vertical rose-needle-muted" d="M 500 586 L 510 510 L 500 500 L 490 510 Z" />
      <path className="rose-needle rose-needle-horizontal" d="M 414 500 L 490 490 L 500 500 L 490 510 Z" />
      <path className="rose-needle rose-needle-horizontal rose-needle-muted" d="M 586 500 L 510 490 L 500 500 L 510 510 Z" />
      <circle className="rose-center" cx="500" cy="500" r="4" />
      <circle className="rose-center-dot" cx="500" cy="500" r="1.3" />
    </g>
  );
}

export default CompassRose;
