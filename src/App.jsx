import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Layers3, LockKeyhole, Maximize2, Minimize2, Plus, Sparkles } from 'lucide-react';
import CompassCanvas from './components/CompassCanvas.jsx';
import CompassViewport from './components/CompassViewport.jsx';
import ChartToolbar from './components/ChartToolbar.jsx';
import EntityDetailCard from './components/EntityDetailCard.jsx';
import EntityPanel from './components/EntityPanel.jsx';
import ImportReview from './components/ImportReview.jsx';
import Legend from './components/Legend.jsx';
import { useEntities } from './hooks/useEntities.js';
import { formatCoordinate, svgToWorld } from './lib/coordinates.js';
import { ENTITY_TYPES } from './lib/entities.js';
import { createExportPayload, mergeImportedEntities, parseImportText } from './lib/portable.js';
import { APP_VERSION, LAST_UPDATED_LABEL } from './lib/release.js';

function App() {
  const canvasRef = useRef(null);
  const {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    replaceEntities,
    storageError,
  } = useEntities();
  const [legendOpen, setLegendOpen] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [pingKey, setPingKey] = useState(0);
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState(() => new Set(ENTITY_TYPES.map((type) => type.value)));
  const [pendingImport, setPendingImport] = useState(null);
  const [transferNotice, setTransferNotice] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId) || null;
  const visibleEntities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entities.filter((entity) => (
      activeTypes.has(entity.type)
      && (!normalizedQuery || entity.name.toLowerCase().includes(normalizedQuery))
    ));
  }, [activeTypes, entities, query]);

  useEffect(() => {
    if (selectedEntityId && !visibleEntities.some((entity) => entity.id === selectedEntityId)) {
      setSelectedEntityId(null);
    }
  }, [selectedEntityId, visibleEntities]);

  useEffect(() => {
    if (!transferNotice) return undefined;
    const timeout = window.setTimeout(() => setTransferNotice(''), 4600);
    return () => window.clearTimeout(timeout);
  }, [transferNotice]);

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

  const exitFocusMode = useCallback(async () => {
    setFocusMode(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // CSS focus mode still exits if the browser rejects the native request.
      }
    }
  }, []);

  const enterFocusMode = async () => {
    setPanel(null);
    setSelectedEntityId(null);
    setPendingImport(null);
    setDraggingId(null);
    setFocusMode(true);

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // iOS and embedded browsers use the CSS full-viewport fallback.
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setFocusMode(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (focusMode) exitFocusMode();
        setPanel(null);
        setSelectedEntityId(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [exitFocusMode, focusMode]);

  const openAddPanel = (coordinates = { economic: 0, social: 0 }) => {
    setSelectedEntityId(null);
    setPanel({ mode: 'add', entity: null, initialCoordinates: coordinates });
  };

  const openEditPanel = (entity) => {
    setSelectedEntityId(entity.id);
    setPanel({ mode: 'edit', entity, initialCoordinates: null });
  };

  const toggleType = (type) => {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleExport = () => {
    const payload = createExportPayload(entities);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `political-compass-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setTransferNotice(`Exported ${entities.length} position${entities.length === 1 ? '' : 's'}.`);
  };

  const handleImportFile = async (file) => {
    if (file.size > 8 * 1024 * 1024) {
      setTransferNotice('That file is larger than the 8 MB import limit.');
      return;
    }

    try {
      const parsed = parseImportText(await file.text());
      setPendingImport({ ...parsed, fileName: file.name });
    } catch (error) {
      setTransferNotice(error.message);
    }
  };

  const handleMergeImport = () => {
    const result = mergeImportedEntities(entities, pendingImport.entities);
    replaceEntities(result.entities);
    setPendingImport(null);
    setTransferNotice(`Merged ${result.imported} new position${result.imported === 1 ? '' : 's'} into the chart.`);
  };

  const handleReplaceImport = () => {
    if (!window.confirm('Replace every current chart position with this imported file?')) return;
    replaceEntities(pendingImport.entities);
    setPendingImport(null);
    setSelectedEntityId(null);
    setTransferNotice(`Replaced the chart with ${pendingImport.entities.length} imported position${pendingImport.entities.length === 1 ? '' : 's'}.`);
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
    <div className={`app-shell ${draggingId ? 'is-dragging-marker' : ''} ${focusMode ? 'is-focus-mode' : ''}`}>
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
            <p className="eyebrow">FIELD INSTRUMENT · 03</p>
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
          <div className="topbar-actions">
            <button type="button" className="full-view-button" onClick={enterFocusMode} title="Open the compass in full view">
              <Maximize2 size={15} strokeWidth={1.7} /> <span>Full view</span>
            </button>
            <button type="button" className="add-entity-button" onClick={() => openAddPanel()}>
              <Plus size={15} strokeWidth={1.7} /> <span>Add entity</span>
            </button>
          </div>
        </motion.div>
      </header>

      <main className="canvas-stage">
        <ChartToolbar
          query={query}
          onQueryChange={setQuery}
          activeTypes={activeTypes}
          onToggleType={toggleType}
          visibleCount={visibleEntities.length}
          totalCount={entities.length}
          onExport={handleExport}
          onImportFile={handleImportFile}
        />
        <div className="canvas-frame">
          <CompassViewport
            markerDragging={Boolean(draggingId)}
            onZoom={() => setPingKey((current) => current + 1)}
            onTransformed={(_, state) => setZoomScale(state.scale)}
          >
            <CompassCanvas
              ref={canvasRef}
              entities={visibleEntities}
              selectedEntityId={selectedEntityId}
              pingKey={pingKey}
              interactive={!focusMode}
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
          <span>{visibleEntities.length} OF {entities.length} POSITIONS · {zoomScale.toFixed(1)}× FIELD</span>
          <span className="caption-rule" />
        </motion.div>

        <div className="origin-readout" aria-label="Origin coordinate">
          <Crosshair size={13} strokeWidth={1.5} aria-hidden="true" />
          <span>ORIGIN</span>
          <strong>Ec 0.0 · Soc 0.0</strong>
        </div>
      </main>

      {focusMode && (
        <button type="button" className="exit-focus-button" onClick={exitFocusMode} aria-label="Exit full view">
          <Minimize2 size={17} strokeWidth={1.7} aria-hidden="true" />
          <span>Exit full view</span>
        </button>
      )}

      <aside className="phase-note" aria-label="Current build status">
        <div className="phase-note-icon" aria-hidden="true">
          <Sparkles size={14} strokeWidth={1.5} />
        </div>
        <div>
          <p className="eyebrow">PHASE 03 · PORTABLE SURVEY</p>
          <p>Search, filter, and carry this chart with you as a validated JSON file.</p>
        </div>
      </aside>

      <div className="instrument-footer">
        <span><LockKeyhole size={12} strokeWidth={1.5} aria-hidden="true" /> LOCAL-FIRST · AUTOSAVED</span>
        <span className="release-stamp">VERSION {APP_VERSION} · LAST UPDATED {LAST_UPDATED_LABEL}</span>
        <span className="range-readout"><Layers3 size={12} strokeWidth={1.5} aria-hidden="true" /> RANGE −10 / +10</span>
      </div>

      {storageError && <div className="storage-warning" role="status">{storageError}</div>}
      {transferNotice && <div className="transfer-notice" role="status">{transferNotice}</div>}

      {entities.length > 0 && visibleEntities.length === 0 && (
        <div className="filter-empty-state" role="status">
          <p className="eyebrow">NO POSITIONS IN THIS FIELD</p>
          <p>Try a different name or turn another type back on.</p>
          <button type="button" onClick={() => { setQuery(''); setActiveTypes(new Set(ENTITY_TYPES.map((type) => type.value))); }}>
            Reset filters
          </button>
        </div>
      )}

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
        {pendingImport && (
          <ImportReview
            key={pendingImport.fileName}
            pending={pendingImport}
            onMerge={handleMergeImport}
            onReplace={handleReplaceImport}
            onCancel={() => setPendingImport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
