import { Search, X } from 'lucide-react';
import DataTools from '../data/DataTools.jsx';
import Legend from '../data/Legend.jsx';
import EntityFilters from '../entities/EntityFilters.jsx';
import EntityList from '../entities/EntityList.jsx';

function Sidebar({
  open,
  query,
  onQueryChange,
  activeTypes,
  onToggleType,
  entities,
  visibleEntities,
  selectedId,
  onSelectEntity,
  onExport,
  onImportFile,
  onClose,
  isDesktop,
}) {
  if (!open && isDesktop) {
    return null;
  }

  const body = (
    <>
      <div className="sidebar-search">
        <label className="search-field" htmlFor="entity-search">
          <Search size={15} strokeWidth={1.75} aria-hidden="true" />
          <input
            id="entity-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="icon-btn search-clear"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </label>
        <p className="result-count" aria-live="polite">
          {visibleEntities.length} of {entities.length}
        </p>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Types</h3>
        <EntityFilters activeTypes={activeTypes} onToggleType={onToggleType} />
      </div>

      <div className="sidebar-section sidebar-list-section">
        <h3 className="sidebar-section-title">Entities</h3>
        <EntityList
          entities={visibleEntities}
          selectedId={selectedId}
          onSelect={onSelectEntity}
          emptyMessage={
            entities.length === 0
              ? 'No entities yet. Add one or import a JSON file.'
              : 'Nothing matches your search or filters.'
          }
        />
      </div>

      <div className="sidebar-section">
        <Legend />
      </div>

      <div className="sidebar-section">
        <DataTools
          onExport={onExport}
          onImportFile={onImportFile}
          entityCount={entities.length}
        />
      </div>
    </>
  );

  if (!isDesktop) {
    // Mobile uses BottomSheet wrapper from App; render body only when open via parent.
    return <div className="sidebar-mobile-body">{body}</div>;
  }

  return (
    <aside className={`app-sidebar${open ? ' is-open' : ''}`} aria-label="Browse and tools">
      {body}
    </aside>
  );
}

export default Sidebar;
