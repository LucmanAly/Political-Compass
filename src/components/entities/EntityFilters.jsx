import { ENTITY_TYPES } from '../../lib/entities.js';

function EntityFilters({ activeTypes, onToggleType }) {
  return (
    <div className="type-filters" role="group" aria-label="Filter by type">
      {ENTITY_TYPES.map((type) => {
        const active = activeTypes.has(type.value);
        return (
          <button
            type="button"
            key={type.value}
            className={`type-chip type-${type.value}${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onToggleType(type.value)}
          >
            <span className="type-chip-mark" aria-hidden="true" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}

export default EntityFilters;
