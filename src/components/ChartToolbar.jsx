import { useRef } from 'react';
import { Download, Search, SlidersHorizontal, Upload, X } from 'lucide-react';
import { ENTITY_TYPE_LABELS, ENTITY_TYPES } from '../lib/entities.js';

const TYPE_COLORS = {
  person: '#C9A661',
  party: '#C4485C',
  organization: '#3E6B99',
  ideology: '#5B8C5A',
};

function ChartToolbar({ query, onQueryChange, activeTypes, onToggleType, visibleCount, totalCount, onExport, onImportFile }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onImportFile(file);
    event.target.value = '';
  };

  return (
    <section className="chart-toolbar" aria-label="Chart search and data tools">
      <div className="chart-search-row">
        <div className="chart-search-field">
          <Search size={14} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Find a position…"
            aria-label="Search entities by name"
          />
          {query && (
            <button type="button" className="clear-search-button" onClick={() => onQueryChange('')} aria-label="Clear search">
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <span className="chart-result-count" aria-live="polite">{visibleCount}/{totalCount}</span>
      </div>

      <div className="chart-toolbar-divider" />

      <div className="filter-heading">
        <span><SlidersHorizontal size={12} strokeWidth={1.5} aria-hidden="true" /> FILTER BY TYPE</span>
        <span className="filter-all-label">{activeTypes.size === ENTITY_TYPES.length ? 'ALL ON' : `${activeTypes.size} ON`}</span>
      </div>
      <div className="type-filter-list" role="group" aria-label="Entity type filters">
        {ENTITY_TYPES.map((type) => {
          const active = activeTypes.has(type.value);
          return (
            <button
              type="button"
              className={`type-filter-chip ${active ? 'is-active' : ''}`}
              key={type.value}
              aria-pressed={active}
              onClick={() => onToggleType(type.value)}
            >
              <span className="type-chip-dot" style={{ '--type-color': TYPE_COLORS[type.value] }} />
              {ENTITY_TYPE_LABELS[type.value]}
            </button>
          );
        })}
      </div>

      <div className="chart-data-actions">
        <button type="button" onClick={onExport}><Download size={13} strokeWidth={1.5} /> Export JSON</button>
        <button type="button" onClick={() => fileInputRef.current?.click()}><Upload size={13} strokeWidth={1.5} /> Import</button>
        <input ref={fileInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleFileChange} />
      </div>
    </section>
  );
}

export default ChartToolbar;
