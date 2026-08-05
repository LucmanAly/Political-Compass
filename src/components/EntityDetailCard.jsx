import { motion } from 'framer-motion';
import { Edit3, MapPin, Trash2, X } from 'lucide-react';
import { formatCoordinate } from '../lib/coordinates.js';
import { ENTITY_TYPE_LABELS, getInitials } from '../lib/entities.js';

function EntityDetailCard({ entity, onClose, onEdit, onDelete }) {
  if (!entity) {
    return null;
  }

  return (
    <motion.aside
      className="entity-detail-card"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-label={`${entity.name} details`}
    >
      <button type="button" className="detail-close" onClick={onClose} aria-label="Close entity details">
        <X size={15} strokeWidth={1.5} />
      </button>
      <div className="detail-heading">
        <div className="detail-avatar">
          {entity.imageUrl ? <img src={entity.imageUrl} alt="" /> : <span>{getInitials(entity.name)}</span>}
        </div>
        <div className="detail-title">
          <span className="eyebrow">{ENTITY_TYPE_LABELS[entity.type]}</span>
          <h2>{entity.name}</h2>
        </div>
      </div>
      <div className="detail-coordinate">
        <MapPin size={13} strokeWidth={1.5} aria-hidden="true" />
        <span>Ec {formatCoordinate(entity.economic)} · Soc {formatCoordinate(entity.social)}</span>
      </div>
      {entity.notes && <p className="detail-notes">{entity.notes}</p>}
      <div className="detail-actions">
        <button type="button" className="detail-edit-button" onClick={() => onEdit(entity)}>
          <Edit3 size={14} strokeWidth={1.5} /> Edit
        </button>
        <button type="button" className="detail-delete-button" onClick={() => onDelete(entity)}>
          <Trash2 size={14} strokeWidth={1.5} /> Delete
        </button>
      </div>
    </motion.aside>
  );
}

export default EntityDetailCard;
