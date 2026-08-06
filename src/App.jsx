import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChartConfig from './components/chart/ChartConfig.jsx';
import CompassCanvas from './components/chart/CompassCanvas.jsx';
import CompassViewport from './components/chart/CompassViewport.jsx';
import ImportReview from './components/data/ImportReview.jsx';
import Legend from './components/data/Legend.jsx';
import DataTools from './components/data/DataTools.jsx';
import EntityForm from './components/entities/EntityForm.jsx';
import EntityInspector from './components/entities/EntityInspector.jsx';
import AppHeader from './components/layout/AppHeader.jsx';
import MobileDock from './components/layout/MobileDock.jsx';
import Onboarding from './components/layout/Onboarding.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import BottomSheet from './components/ui/BottomSheet.jsx';
import ToastStack from './components/ui/ToastStack.jsx';
import { useEntities } from './hooks/useEntities.js';
import { useFullscreen } from './hooks/useFullscreen.js';
import { useIsDesktop } from './hooks/useMediaQuery.js';
import { formatCoordinate, svgToWorld, worldToSvg } from './lib/coordinates.js';
import { ENTITY_TYPES } from './lib/entities.js';
import { createDefaultTypeSet, filterEntities, toggleTypeInSet } from './lib/filters.js';
import { createExportPayload, mergeImportedEntities, parseImportText } from './lib/portable.js';
import { createToast } from './lib/toast.js';

const IMPORT_MAX_BYTES = 8 * 1024 * 1024;

function App() {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const importInputRef = useRef(null);
  const isDesktop = useIsDesktop();

  const {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    replaceEntities,
    storageError,
    canUndo,
    undo,
    snapshotForUndo,
  } = useEntities();

  const {
    active: fullView,
    enter: enterFullView,
    exit: exitFullView,
    toggle: toggleFullView,
  } = useFullscreen(stageRef);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheet, setMobileSheet] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [placementPoint, setPlacementPoint] = useState(null);
  const [moveModeId, setMoveModeId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [liveDragCoords, setLiveDragCoords] = useState(null);
  const [hoverCoords, setHoverCoords] = useState(null);
  const dragSession = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState(() => createDefaultTypeSet());
  const [pendingImport, setPendingImport] = useState(null);
  const [toasts, setToasts] = useState([]);

  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId) || null;
  const visibleEntities = useMemo(
    () => filterEntities(entities, { query, types: activeTypes }),
    [activeTypes, entities, query],
  );

  const pushToast = useCallback((message, options = {}) => {
    const toast = createToast(message, options);
    setToasts((current) => [...current, toast]);
    if (toast.duration > 0) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (selectedEntityId && !visibleEntities.some((entity) => entity.id === selectedEntityId)) {
      setSelectedEntityId(null);
    }
  }, [selectedEntityId, visibleEntities]);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
      setMobileSheet(null);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (storageError) {
      pushToast(storageError, { tone: 'error', duration: 6000 });
    }
  }, [storageError, pushToast]);

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
    const handlePointerMove = (event) => {
      const session = dragSession.current;
      if (!session) return;

      const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);

      if (!session.active) {
        // Require intentional movement before repositioning (avoids click = move).
        if (distance < 8) return;
        snapshotForUndo('move');
        session.active = true;
        setDraggingId(session.id);
      }

      const coords = getWorldPoint(event.clientX, event.clientY);
      session.lastCoords = coords;
      setLiveDragCoords(coords);
      updateEntity(session.id, coords);
    };

    const handlePointerUp = () => {
      const session = dragSession.current;
      dragSession.current = null;
      setDraggingId(null);
      setLiveDragCoords(null);
      setMoveModeId(null);

      if (session?.active) {
        const moved = session.lastCoords
          && (
            Math.abs(session.lastCoords.economic - session.origin.economic) > 0.05
            || Math.abs(session.lastCoords.social - session.origin.social) > 0.05
          );
        if (moved) {
          pushToast('Position updated', {
            tone: 'success',
            actionLabel: 'Undo',
            onAction: () => undo(),
          });
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [getWorldPoint, updateEntity, pushToast, undo, snapshotForUndo]);

  const beginDrag = useCallback((id, event, entity) => {
    dragSession.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      origin: { economic: entity.economic, social: entity.social },
      lastCoords: null,
      active: false,
    };
  }, []);

  const cancelPlacement = useCallback(() => {
    setPlacementMode(false);
    setPlacementPoint(null);
  }, []);

  const openAddFlow = useCallback(() => {
    setSelectedEntityId(null);
    setPanel(null);
    setPlacementMode(true);
    setPlacementPoint(null);
    if (!isDesktop) setMobileSheet(null);
    pushToast('Tap the chart to place a new entity', { tone: 'info', duration: 3200 });
  }, [isDesktop, pushToast]);

  const openEditPanel = useCallback((entity) => {
    setSelectedEntityId(entity.id);
    setPanel({ mode: 'edit', entity, initialCoordinates: null });
    setPlacementMode(false);
    setPlacementPoint(null);
    if (!isDesktop) setMobileSheet('form');
  }, [isDesktop]);

  const closePanel = useCallback(() => {
    setPanel(null);
    if (!isDesktop && mobileSheet === 'form') setMobileSheet(null);
  }, [isDesktop, mobileSheet]);

  const centerOnEntity = useCallback((entity) => {
    const point = worldToSvg(entity);
    const marker = canvasRef.current?.querySelector(`[data-entity-id="${entity.id}"]`);
    if (marker && viewportRef.current?.zoomToElement) {
      viewportRef.current.zoomToElement(marker);
    } else {
      viewportRef.current?.centerOnSvgPoint?.(point.x, point.y, Math.max(zoomScale, 1.4));
    }
  }, [zoomScale]);

  const handleSelectEntity = useCallback((entity) => {
    setSelectedEntityId(entity.id);
    setPanel(null);
    centerOnEntity(entity);
    if (!isDesktop) setMobileSheet('detail');
  }, [centerOnEntity, isDesktop]);

  const handleCanvasClick = useCallback((coordinates) => {
    if (placementMode) {
      setPlacementPoint(coordinates);
      setPanel({ mode: 'add', entity: null, initialCoordinates: coordinates });
      setPlacementMode(false);
      if (!isDesktop) setMobileSheet('form');
      return;
    }
    // Empty-space click clears selection (does not create).
    setSelectedEntityId(null);
    if (!isDesktop && mobileSheet === 'detail') setMobileSheet(null);
  }, [placementMode, isDesktop, mobileSheet]);

  const handleMarkerPointerDown = useCallback((event, entity) => {
    if (fullView) return;
    if (event.button !== 0) return;

    // Mobile: only allow reposition when Move was chosen for this entity.
    if (!isDesktop && moveModeId !== entity.id) return;

    event.preventDefault();
    setSelectedEntityId(entity.id);
    beginDrag(entity.id, event, entity);
  }, [beginDrag, fullView, isDesktop, moveModeId]);

  const handleMarkerSelect = useCallback((entity) => {
    setSelectedEntityId(entity.id);
    if (!isDesktop) setMobileSheet('detail');
  }, [isDesktop]);

  const handleSave = useCallback((draft) => {
    if (panel?.mode === 'edit' && panel.entity) {
      snapshotForUndo('edit');
      updateEntity(panel.entity.id, draft);
      setSelectedEntityId(panel.entity.id);
      pushToast(`Saved “${draft.name}”`, { tone: 'success', actionLabel: 'Undo', onAction: undo });
    } else {
      const entity = addEntity(draft);
      setSelectedEntityId(entity.id);
      pushToast(`Added “${draft.name}”`, { tone: 'success', actionLabel: 'Undo', onAction: undo });
    }
    setPanel(null);
    setPlacementPoint(null);
    setPlacementMode(false);
    if (!isDesktop) setMobileSheet(null);
  }, [panel, updateEntity, addEntity, pushToast, undo, isDesktop, snapshotForUndo]);

  const handleDelete = useCallback((entity) => {
    if (!window.confirm(`Delete “${entity.name}” from the chart?`)) return;
    deleteEntity(entity.id);
    setSelectedEntityId(null);
    setPanel(null);
    if (!isDesktop) setMobileSheet(null);
    pushToast(`Deleted “${entity.name}”`, {
      tone: 'success',
      actionLabel: 'Undo',
      onAction: undo,
    });
  }, [deleteEntity, isDesktop, pushToast, undo]);

  const handleExport = useCallback(() => {
    const payload = createExportPayload(entities);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `political-compass-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast(`Exported ${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}`, {
      tone: 'success',
    });
  }, [entities, pushToast]);

  const handleImportFile = useCallback(async (file) => {
    if (file.size > IMPORT_MAX_BYTES) {
      pushToast('That file is larger than the 8 MB import limit.', { tone: 'error' });
      return;
    }
    try {
      const parsed = parseImportText(await file.text());
      setPendingImport({ ...parsed, fileName: file.name });
      if (!isDesktop) setMobileSheet('import');
    } catch (error) {
      pushToast(error.message, { tone: 'error' });
    }
  }, [isDesktop, pushToast]);

  const handleMergeImport = useCallback(() => {
    const result = mergeImportedEntities(entities, pendingImport.entities);
    replaceEntities(result.entities, { undoLabel: 'import' });
    setPendingImport(null);
    if (!isDesktop) setMobileSheet(null);
    pushToast(
      `Merged ${result.imported} new ${result.imported === 1 ? 'entity' : 'entities'}`,
      { tone: 'success', actionLabel: 'Undo', onAction: undo },
    );
  }, [entities, pendingImport, replaceEntities, isDesktop, pushToast, undo]);

  const handleReplaceImport = useCallback(() => {
    if (!window.confirm('Replace every current entity with this imported file?')) return;
    replaceEntities(pendingImport.entities, { undoLabel: 'import' });
    setPendingImport(null);
    setSelectedEntityId(null);
    if (!isDesktop) setMobileSheet(null);
    pushToast(
      `Replaced chart with ${pendingImport.entities.length} ${pendingImport.entities.length === 1 ? 'entity' : 'entities'}`,
      { tone: 'success', actionLabel: 'Undo', onAction: undo },
    );
  }, [pendingImport, replaceEntities, isDesktop, pushToast, undo]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (fullView) {
        exitFullView();
        return;
      }
      if (placementMode) {
        cancelPlacement();
        return;
      }
      if (panel) {
        closePanel();
        return;
      }
      if (pendingImport) {
        setPendingImport(null);
        return;
      }
      if (moveModeId) {
        setMoveModeId(null);
        return;
      }
      setSelectedEntityId(null);
      if (!isDesktop) setMobileSheet(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [
    fullView,
    exitFullView,
    placementMode,
    cancelPlacement,
    panel,
    closePanel,
    pendingImport,
    moveModeId,
    isDesktop,
  ]);

  const enterImmersive = async () => {
    setPanel(null);
    setSelectedEntityId(null);
    setPendingImport(null);
    setDraggingId(null);
    setPlacementMode(false);
    setMobileSheet(null);
    await enterFullView();
  };

  const handleFullViewToggle = async () => {
    if (fullView) await exitFullView();
    else await enterImmersive();
  };

  const coordReadout = liveDragCoords || placementPoint || hoverCoords;
  const showOnboarding = entities.length === 0 && !panel && !placementMode;
  const filtersEmpty = entities.length > 0 && visibleEntities.length === 0;

  const formContent = panel ? (
    <EntityForm
      mode={panel.mode}
      entity={panel.entity}
      initialCoordinates={panel.initialCoordinates}
      onSave={handleSave}
      onCancel={() => {
        closePanel();
        setPlacementPoint(null);
      }}
      stickyActions={!isDesktop}
    />
  ) : null;

  return (
    <div
      className={[
        'app-shell',
        draggingId ? 'is-dragging-marker' : '',
        placementMode ? 'is-placement-mode' : '',
        fullView ? 'is-full-view' : '',
        isDesktop ? 'is-desktop' : 'is-mobile',
      ].filter(Boolean).join(' ')}
    >
      {!fullView && (
        <AppHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => {
            if (isDesktop) setSidebarOpen((open) => !open);
            else setMobileSheet((sheet) => (sheet === 'browse' ? null : 'browse'));
          }}
          onAdd={openAddFlow}
          onFullView={handleFullViewToggle}
          fullViewActive={fullView}
          isDesktop={isDesktop}
          placementMode={placementMode}
          onCancelPlacement={cancelPlacement}
        />
      )}

      <div className="app-body">
        {isDesktop && !fullView && (
          <Sidebar
            open={sidebarOpen}
            query={query}
            onQueryChange={setQuery}
            activeTypes={activeTypes}
            onToggleType={(type) => setActiveTypes((current) => toggleTypeInSet(current, type))}
            entities={entities}
            visibleEntities={visibleEntities}
            selectedId={selectedEntityId}
            onSelectEntity={handleSelectEntity}
            onExport={handleExport}
            onImportFile={handleImportFile}
            isDesktop
          />
        )}

        <main className="chart-workspace" ref={stageRef}>
          <div className="chart-frame">
            <CompassViewport
              ref={viewportRef}
              markerDragging={Boolean(draggingId)}
              compactControls={!isDesktop}
              onTransformed={(_, state) => setZoomScale(state.scale)}
            >
              <CompassCanvas
                ref={canvasRef}
                entities={visibleEntities}
                selectedEntityId={selectedEntityId}
                placementPoint={placementPoint}
                interactive={!fullView || true}
                zoomScale={zoomScale}
                onCanvasClick={handleCanvasClick}
                onCanvasPointerMove={setHoverCoords}
                onMarkerSelect={handleMarkerSelect}
                onMarkerPointerDown={handleMarkerPointerDown}
              />
            </CompassViewport>

            {coordReadout && (
              <div className="coord-readout" aria-live="polite">
                <span className="coord-value">
                  Ec {formatCoordinate(coordReadout.economic)}
                  {' · '}
                  Soc {formatCoordinate(coordReadout.social)}
                </span>
              </div>
            )}

            {!fullView && (
              <ChartConfig
                activeTypes={activeTypes}
                onChangeTypes={setActiveTypes}
              />
            )}

            {placementMode && (
              <div className="placement-banner" role="status">
                Tap the chart to place an entity
                <button type="button" className="btn btn-ghost btn-sm" onClick={cancelPlacement}>
                  Cancel
                </button>
              </div>
            )}

            {moveModeId && !isDesktop && (
              <div className="placement-banner" role="status">
                Drag the selected marker to move it
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMoveModeId(null)}
                >
                  Cancel
                </button>
              </div>
            )}

            {showOnboarding && !fullView && (
              <Onboarding
                onAdd={openAddFlow}
                onImport={() => importInputRef.current?.click()}
              />
            )}

            <input
              ref={importInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImportFile(file);
                event.target.value = '';
              }}
            />

            {filtersEmpty && (
              <div className="filter-empty" role="status">
                <p>No entities match your search or filters.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setQuery('');
                    setActiveTypes(createDefaultTypeSet());
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {fullView && (
            <button type="button" className="exit-full-view" onClick={exitFullView}>
              Exit full view
            </button>
          )}
        </main>

        {isDesktop && !fullView && selectedEntity && !panel && (
          <EntityInspector
            entity={selectedEntity}
            onClose={() => setSelectedEntityId(null)}
            onEdit={openEditPanel}
            onDelete={handleDelete}
          />
        )}

        {isDesktop && !fullView && panel && (
          <aside className="entity-inspector is-form" aria-label={panel.mode === 'edit' ? 'Edit entity' : 'Add entity'}>
            <header className="inspector-header">
              <h2>{panel.mode === 'edit' ? 'Edit entity' : 'Add entity'}</h2>
              <button type="button" className="icon-btn" onClick={closePanel} aria-label="Close form">
                ×
              </button>
            </header>
            {formContent}
          </aside>
        )}
      </div>

      {!isDesktop && !fullView && (
        <MobileDock
          placementMode={placementMode}
          onBrowse={() => setMobileSheet('browse')}
          onAdd={openAddFlow}
          onFit={() => viewportRef.current?.reset()}
          onMore={() => setMobileSheet('more')}
        />
      )}

      {/* Desktop import review overlay */}
      {pendingImport && isDesktop && (
        <div className="modal-layer">
          <button type="button" className="sheet-backdrop" aria-label="Cancel import" onClick={() => setPendingImport(null)} />
          <div className="modal-card">
            <ImportReview
              pending={pendingImport}
              onMerge={handleMergeImport}
              onReplace={handleReplaceImport}
              onCancel={() => setPendingImport(null)}
            />
          </div>
        </div>
      )}

      {/* Mobile sheets */}
      {!isDesktop && (
        <>
          <BottomSheet
            open={mobileSheet === 'browse'}
            title="Browse"
            onClose={() => setMobileSheet(null)}
            fullHeight
          >
            <Sidebar
              open
              query={query}
              onQueryChange={setQuery}
              activeTypes={activeTypes}
              onToggleType={(type) => setActiveTypes((current) => toggleTypeInSet(current, type))}
              entities={entities}
              visibleEntities={visibleEntities}
              selectedId={selectedEntityId}
              onSelectEntity={(entity) => {
                handleSelectEntity(entity);
              }}
              onExport={handleExport}
              onImportFile={handleImportFile}
              isDesktop={false}
            />
          </BottomSheet>

          <BottomSheet
            open={mobileSheet === 'more'}
            title="More"
            onClose={() => setMobileSheet(null)}
          >
            <div className="more-sheet">
              <DataTools
                onExport={handleExport}
                onImportFile={handleImportFile}
                entityCount={entities.length}
              />
              <Legend />
              <div className="more-actions">
                <button type="button" className="btn btn-secondary" onClick={handleFullViewToggle}>
                  Full view
                </button>
                {canUndo && (
                  <button type="button" className="btn btn-secondary" onClick={undo}>
                    Undo last change
                  </button>
                )}
              </div>
              <p className="field-hint">
                Types: {ENTITY_TYPES.map((type) => type.label).join(' · ')}
              </p>
            </div>
          </BottomSheet>

          <BottomSheet
            open={mobileSheet === 'detail' && Boolean(selectedEntity) && !panel}
            title="Details"
            onClose={() => {
              setMobileSheet(null);
              setSelectedEntityId(null);
            }}
          >
            {selectedEntity && (
              <EntityInspector
                entity={selectedEntity}
                asSheet
                showMove
                onClose={() => {
                  setMobileSheet(null);
                  setSelectedEntityId(null);
                }}
                onEdit={openEditPanel}
                onDelete={handleDelete}
                onMove={(entity) => {
                  setMoveModeId(entity.id);
                  setMobileSheet(null);
                  pushToast('Drag the marker to a new position', { tone: 'info' });
                }}
              />
            )}
          </BottomSheet>

          <BottomSheet
            open={mobileSheet === 'form' && Boolean(panel)}
            title={panel?.mode === 'edit' ? 'Edit entity' : 'Add entity'}
            onClose={() => {
              closePanel();
              setPlacementPoint(null);
            }}
            fullHeight
          >
            {formContent}
          </BottomSheet>

          <BottomSheet
            open={mobileSheet === 'import' && Boolean(pendingImport)}
            title="Import data"
            onClose={() => {
              setPendingImport(null);
              setMobileSheet(null);
            }}
          >
            {pendingImport && (
              <ImportReview
                pending={pendingImport}
                onMerge={handleMergeImport}
                onReplace={handleReplaceImport}
                onCancel={() => {
                  setPendingImport(null);
                  setMobileSheet(null);
                }}
              />
            )}
          </BottomSheet>
        </>
      )}

      <ToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        onAction={(toast) => toast.onAction?.()}
      />
    </div>
  );
}

export default App;
