import { formatCoordinate } from '../../lib/coordinates.js';
import { ENTITY_TYPE_LABELS, getInitials } from '../../lib/entities.js';
import { sortEntitiesByName } from '../../lib/filters.js';

function EntityList({ entities, selectedId, onSelect, emptyMessage = 'No entities match.' }) {
  const sorted = sortEntitiesByName(entities);

  if (!sorted.length) {
    return <p className="entity-list-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="entity-list" role="listbox" aria-label="Entities">
      {sorted.map((entity) => {
        const selected = entity.id === selectedId;
        return (
          <li key={entity.id}>
            <button
              type="button"
              className={`entity-list-item${selected ? ' is-selected' : ''}`}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(entity)}
            >
              <span className="entity-list-avatar" aria-hidden="true">
                {entity.imageUrl
                  ? <img src={entity.imageUrl} alt="" />
                  : getInitials(entity.name)}
              </span>
              <span className="entity-list-copy">
                <strong>{entity.name}</strong>
                <small>
                  {ENTITY_TYPE_LABELS[entity.type]}
                  {' · '}
                  <span className="coord-value">
                    {formatCoordinate(entity.economic)} / {formatCoordinate(entity.social)}
                  </span>
                </small>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default EntityList;
