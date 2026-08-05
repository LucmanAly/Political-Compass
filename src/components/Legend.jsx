import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const QUADRANTS = [
  {
    key: 'authoritarian-left',
    name: 'Authoritarian Left',
    detail: 'Economic equality · centralized power',
    color: '#C4485C',
  },
  {
    key: 'authoritarian-right',
    name: 'Authoritarian Right',
    detail: 'Market hierarchy · centralized power',
    color: '#3E6B99',
  },
  {
    key: 'libertarian-left',
    name: 'Libertarian Left',
    detail: 'Economic equality · individual freedom',
    color: '#5B8C5A',
  },
  {
    key: 'libertarian-right',
    name: 'Libertarian Right',
    detail: 'Market hierarchy · individual freedom',
    color: '#D4A24C',
  },
];

function Legend({ open, onToggle }) {
  return (
    <section className={`legend-panel ${open ? 'is-open' : 'is-collapsed'}`} aria-label="Quadrant legend">
      <button
        className="legend-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="quadrant-legend"
        onClick={onToggle}
      >
        <span className="legend-title-wrap">
          <span className="eyebrow">QUADRANT LEGEND</span>
          <span className="legend-title">Four fields of position</span>
        </span>
        <span className="legend-toggle-icon" aria-hidden="true">
          {open ? <ChevronDown size={15} strokeWidth={1.5} /> : <ChevronUp size={15} strokeWidth={1.5} />}
        </span>
      </button>

      {open && (
        <motion.div
          id="quadrant-legend"
          className="legend-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {QUADRANTS.map((quadrant) => (
            <div className="legend-row" key={quadrant.key}>
              <span className="legend-swatch" style={{ '--swatch-color': quadrant.color }} />
              <span className="legend-copy">
                <strong>{quadrant.name}</strong>
                <small>{quadrant.detail}</small>
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

export default Legend;
