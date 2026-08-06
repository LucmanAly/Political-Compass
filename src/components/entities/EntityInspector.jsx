import { Edit3, MapPin, Move, Trash2, X } from 'lucide-react';
import { formatCoordinate } from '../../lib/coordinates.js';
import { ENTITY_TYPE_LABELS, getInitials } from '../../lib/entities.js';

function EntityInspector({
  entity,
  onClose,
  onEdit,
  onDelete,
  onMove,
  showMove = false,
  asSheet = false,
}) {
  if (!entity) return null;

  const description = String(entity.notes || '').trim();

  const content = (
    <>
      <header className="inspector-header">
        <div className="inspector-heading">
          <span className="inspector-avatar" aria-hidden="true">
            {entity.imageUrl
              ? <img src={entity.imageUrl} alt="" />
              : getInitials(entity.name)}
          </span>
          <div>
            <p className="eyebrow">{ENTITY_TYPE_LABELS[entity.type]}</p>
            <h2>{entity.name}</h2>
          </div>
        </div>
        {!asSheet && (
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
            <X size={18} strokeWidth={1.75} />
          </button>
        )}
      </header>

      <div className="inspector-coords">
        <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="coord-value">
          Ec {formatCoordinate(entity.economic)} · Soc {formatCoordinate(entity.social)}
        </span>
      </div>

      <section className="inspector-description" aria-label="Description">
        <h3 className="inspector-description-label">Description</h3>
        {description ? (
          <p className="inspector-notes">{description}</p>
        ) : (
          <p className="inspector-notes is-muted">
            No short description yet. Use Edit to add one or two lines about this position.
          </p>
        )}
      </section>

      <div className="inspector-actions">
        <button type="button" className="btn btn-secondary" onClick={() => onEdit(entity)}>
          <Edit3 size={15} strokeWidth={1.75} /> Edit
        </button>
        {showMove && (
          <button type="button" className="btn btn-secondary" onClick={() => onMove?.(entity)}>
            <Move size={15} strokeWidth={1.75} /> Move
          </button>
        )}
        <button type="button" className="btn btn-danger" onClick={() => onDelete(entity)}>
          <Trash2 size={15} strokeWidth={1.75} /> Delete
        </button>
      </div>
    </>
  );

  if (asSheet) return content;

  return (
    <aside className="entity-inspector" aria-label={`${entity.name} details`}>
      {content}
    </aside>
  );
}

export default EntityInspector;
