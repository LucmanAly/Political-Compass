import { useEffect, useId, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { CHART_LAYER_TYPES } from '../../lib/entities.js';
import { createDefaultTypeSet } from '../../lib/filters.js';

function ChartConfig({ activeTypes, onChangeTypes }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const titleId = useId();
  const layerValues = CHART_LAYER_TYPES.map((layer) => layer.value);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const applyPrimaryLayers = (enabledPrimary) => {
    const next = new Set();
    enabledPrimary.forEach((value) => next.add(value));
    // Preserve organization visibility for user-created orgs.
    if (activeTypes.has('organization')) next.add('organization');
    onChangeTypes(next);
  };

  const allPrimaryOn = layerValues.every((value) => activeTypes.has(value));
  const activePrimaryCount = layerValues.filter((value) => activeTypes.has(value)).length;

  const toggleLayer = (value) => {
    const currentlyOn = activeTypes.has(value);
    if (currentlyOn) {
      if (activePrimaryCount <= 1) return; // keep at least one layer visible
      applyPrimaryLayers(layerValues.filter((layer) => layer !== value && activeTypes.has(layer)));
      return;
    }
    applyPrimaryLayers([
      ...layerValues.filter((layer) => activeTypes.has(layer)),
      value,
    ]);
  };

  const showAll = () => {
    onChangeTypes(createDefaultTypeSet());
  };

  const showOnly = (value) => {
    applyPrimaryLayers([value]);
  };

  return (
    <div className={`chart-config${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="chart-config-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        title="Configure chart layers"
        onClick={() => setOpen((current) => !current)}
      >
        <Settings2 size={17} strokeWidth={1.75} aria-hidden="true" />
        <span>Layers</span>
      </button>

      {open && (
        <div
          className="chart-config-panel"
          role="dialog"
          aria-labelledby={titleId}
        >
          <div className="chart-config-header">
            <h2 id={titleId}>Show on chart</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={showAll}
              disabled={allPrimaryOn}
            >
              All
            </button>
          </div>

          <p className="field-hint chart-config-hint">
            Choose persons, parties, philosophies, or all of them. The sidebar list matches this view.
          </p>

          <div className="chart-config-options" role="group" aria-label="Entity layers">
            {CHART_LAYER_TYPES.map((layer) => {
              const active = activeTypes.has(layer.value);
              return (
                <div key={layer.value} className={`chart-config-option${active ? ' is-active' : ''}`}>
                  <label className="chart-config-option-main">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleLayer(layer.value)}
                    />
                    <span>{layer.label}</span>
                  </label>
                  <button
                    type="button"
                    className="chart-config-only"
                    onClick={() => showOnly(layer.value)}
                    disabled={active && activePrimaryCount === 1}
                  >
                    Only
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartConfig;
