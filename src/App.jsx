import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Layers3, LockKeyhole, Plus, Sparkles } from 'lucide-react';
import CompassCanvas from './components/CompassCanvas.jsx';
import CompassViewport from './components/CompassViewport.jsx';
import EntityDetailCard from './components/EntityDetailCard.jsx';
import EntityPanel from './components/EntityPanel.jsx';
import Legend from './components/Legend.jsx';
import { useEntities } from './hooks/useEntities.js';
import { formatCoordinate, svgToWorld } from './lib/coordinates.js';

function App() {
  const canvasRef = useRef(null);
  const {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    storageError,
  } = useEntities();
  const [legendOpen, setLegendOpen] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [pingKey, setPingKey] = useState(0);
  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId) || null;

  const getWorldPoint = useCallback((clientX, clientY) => {
    const svg = canvasRef.current;
    if (!svg) return { economic: 0, social: 0 };
    const bounds = svg.getBoundingClientRect();
    return svgToWorld({
      x: ((clientX - bounds.left) / bounds.width) * 1000,
      y: ((clientY - bounds.top) / bounds.height) * 1000,
    });
  }, []);

  useEffect(() => {
    if (!draggingId) return undefined;

    const handlePointerMove = (event) => {
      updateEntity(draggingId, getWorldPoint(event.clientX, event.clientY));
    };
    const handlePointerUp = () => setDraggingId(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, getWorldPoint, updateEntity]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setPanel(null);
        setSelectedEntityId(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const openAddPanel = (coordinates = { economic: 0, social: 0 }) => {
    setSelectedEntityId(null);
    setPanel({ mode: 'add', entity: null, initialCoordinates: coordinates });
  };

  const openEditPanel = (entity) => {
    setSelectedEntityId(entity.id);
    setPanel({ mode: 'edit', entity, initialCoordinates: null });
  };

  const handleSave = (draft) => {
    if (panel?.mode === 'edit') {
      updateEntity(panel.entity.id, draft);
      setSelectedEntityId(panel.entity.id);
    } else {
      const entity = addEntity(draft);
      setSelectedEntityId(entity.id);
    }
    setPanel(null);
  };

  const handleDelete = (entity) => {
    if (window.confirm(`Delete ${entity.name} from the chart?`)) {
      deleteEntity(entity.id);
      setSelectedEntityId(null);
      setPanel(null);
    }
  };

  const handleMarkerPointerDown = (event, entity) => {
    event.preventDefault();
    setDraggingId(entity.id);
    setSelectedEntityId(entity.id);
  };

  return (
    <div className={`app-shell ${draggingId ? 'is-dragging-marker' : ''}`}>
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
            <p className="eyebrow">FIELD INSTRUMENT · 02</p>
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
            <span>LIVE SURVEY</span>
          </div>
          <button type="button" className="add-entity-button" onClick={() => openAddPanel()}>
            <Plus size={15} strokeWidth={1.7} /> <span>Add entity</span>
          </button>
        </motion.div>
      </header>

      <main className="canvas-stage">
        <div className="canvas-frame">
          <CompassViewport
            markerDragging={Boolean(draggingId)}
            onZoom={() => setPingKey((current) => current + 1)}
            onTransformed={(_, state) => setZoomScale(state.scale)}
          >
            <CompassCanvas
              ref={canvasRef}
              entities={entities}
              selectedEntityId={selectedEntityId}
              pingKey={pingKey}
              onCanvasClick={(coordinates) => openAddPanel(coordinates)}
              onMarkerClick={(entity) => setSelectedEntityId(entity.id)}
              onMarkerPointerDown={handleMarkerPointerDown}
            />
          </CompassViewport>
        </div>

        <motion.div
          className="survey-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.35 }}
        >
          <span className="caption-rule" />
          <span>{entities.length} POSITIONS · {zoomScale.toFixed(1)}× FIELD</span>
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
          <p className="eyebrow">PHASE 02 · INTERACTIVE SURVEY</p>
          <p>Tap an empty field to add a position. Drag a marker to recalibrate it.</p>
        </div>
      </aside>

      <div className="instrument-footer">
        <span><LockKeyhole size={12} strokeWidth={1.5} aria-hidden="true" /> LOCAL-FIRST · AUTOSAVED</span>
        <span><Layers3 size={12} strokeWidth={1.5} aria-hidden="true" /> RANGE −10 / +10</span>
      </div>

      {storageError && <div className="storage-warning" role="status">{storageError}</div>}

      <AnimatePresence initial={false}>
        <Legend open={legendOpen} onToggle={() => setLegendOpen((current) => !current)} />
        {selectedEntity && !panel && (
          <EntityDetailCard
            key={selectedEntity.id}
            entity={selectedEntity}
            onClose={() => setSelectedEntityId(null)}
            onEdit={openEditPanel}
            onDelete={handleDelete}
          />
        )}
        {panel && (
          <EntityPanel
            key={`${panel.mode}-${panel.entity?.id || 'new'}`}
            mode={panel.mode}
            entity={panel.entity}
            initialCoordinates={panel.initialCoordinates}
            onSave={handleSave}
            onCancel={() => setPanel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
