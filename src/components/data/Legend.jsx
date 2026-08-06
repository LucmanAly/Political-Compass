const QUADRANTS = [
  {
    key: 'authoritarian-left',
    name: 'Authoritarian Left',
    detail: 'Equality · centralized power',
    className: 'swatch-al',
  },
  {
    key: 'authoritarian-right',
    name: 'Authoritarian Right',
    detail: 'Hierarchy · centralized power',
    className: 'swatch-ar',
  },
  {
    key: 'libertarian-left',
    name: 'Libertarian Left',
    detail: 'Equality · individual freedom',
    className: 'swatch-ll',
  },
  {
    key: 'libertarian-right',
    name: 'Libertarian Right',
    detail: 'Hierarchy · individual freedom',
    className: 'swatch-lr',
  },
];

function Legend({ compact = false }) {
  return (
    <section className={`legend-block${compact ? ' is-compact' : ''}`} aria-label="Quadrant legend">
      {!compact && <h3 className="sidebar-section-title">Quadrants</h3>}
      <ul className="legend-list">
        {QUADRANTS.map((quadrant) => (
          <li key={quadrant.key} className="legend-row">
            <span className={`legend-swatch ${quadrant.className}`} aria-hidden="true" />
            <span className="legend-copy">
              <strong>{quadrant.name}</strong>
              {!compact && <small>{quadrant.detail}</small>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Legend;
