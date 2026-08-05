import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Layers3, LockKeyhole, Sparkles } from 'lucide-react';
import CompassCanvas from './components/CompassCanvas.jsx';
import Legend from './components/Legend.jsx';
import { formatCoordinate } from './lib/coordinates.js';

function App() {
  const [legendOpen, setLegendOpen] = useState(true);

  return (
    <div className="app-shell">
      <div className="atmosphere atmosphere-one" aria-hidden="true" />
      <div className="atmosphere atmosphere-two" aria-hidden="true" />

      <header className="topbar">
        <motion.div
          className="brand-lockup"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="brand-emblem" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">FIELD INSTRUMENT · 01</p>
            <h1>Political Compass</h1>
          </div>
        </motion.div>

        <motion.div
          className="topbar-right"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="coordinate-readout" aria-label="Coordinate range">
            <span className="readout-label">COORDINATE SYSTEM</span>
            <div className="readout-values">
              <span>Ec <strong>{formatCoordinate(-10)}…{formatCoordinate(10)}</strong></span>
              <span>Soc <strong>{formatCoordinate(-10)}…{formatCoordinate(10)}</strong></span>
            </div>
          </div>
          <div className="calibration-state">
            <span className="state-dot" aria-hidden="true" />
            <span>CALIBRATED</span>
          </div>
        </motion.div>
      </header>

      <main className="canvas-stage">
        <div className="canvas-frame">
          <CompassCanvas />
        </div>

        <motion.div
          className="survey-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.35 }}
        >
          <span className="caption-rule" />
          <span>THE CHART IS THE INTERFACE</span>
          <span className="caption-rule" />
        </motion.div>

        <div className="origin-readout" aria-label="Origin coordinate">
          <Crosshair size={13} strokeWidth={1.5} aria-hidden="true" />
          <span>ORIGIN</span>
          <strong>Ec 0.0 · Soc 0.0</strong>
        </div>
      </main>

      <aside className="phase-note" aria-label="Current build status">
        <div className="phase-note-icon" aria-hidden="true">
          <Sparkles size={14} strokeWidth={1.5} />
        </div>
        <div>
          <p className="eyebrow">PHASE 01 · STATIC SURVEY</p>
          <p>Entity plotting arrives in the next calibration pass.</p>
        </div>
      </aside>

      <div className="instrument-footer">
        <span><LockKeyhole size={12} strokeWidth={1.5} aria-hidden="true" /> LOCAL-FIRST INSTRUMENT</span>
        <span><Layers3 size={12} strokeWidth={1.5} aria-hidden="true" /> RANGE −10 / +10</span>
      </div>

      <AnimatePresence initial={false}>
        <Legend open={legendOpen} onToggle={() => setLegendOpen((current) => !current)} />
      </AnimatePresence>
    </div>
  );
}

export default App;
