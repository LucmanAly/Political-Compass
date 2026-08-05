import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Save, Upload, X } from 'lucide-react';
import { clampCoordinate, formatCoordinate } from '../lib/coordinates.js';
import { ENTITY_TYPES } from '../lib/entities.js';
import { fileToDataUrl } from '../lib/image.js';

function draftFromEntity(entity, initialCoordinates) {
  return {
    name: entity?.name || '',
    type: entity?.type || 'person',
    imageUrl: entity?.imageUrl || '',
    economic: entity?.economic ?? initialCoordinates?.economic ?? 0,
    social: entity?.social ?? initialCoordinates?.social ?? 0,
    notes: entity?.notes || '',
  };
}

function EntityPanel({ mode, entity, initialCoordinates, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => draftFromEntity(entity, initialCoordinates));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setDraft(draftFromEntity(entity, initialCoordinates));
    setError('');
  }, [entity?.id, initialCoordinates?.economic, initialCoordinates?.social]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      updateDraft('imageUrl', await fileToDataUrl(file));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = draft.name.trim();

    if (!name) {
      setError('Give this position a name before saving.');
      return;
    }

    onSave({
      ...draft,
      name,
      economic: clampCoordinate(draft.economic),
      social: clampCoordinate(draft.social),
      notes: draft.notes.trim(),
    });
  };

  return (
    <>
      <button type="button" className="panel-backdrop" onClick={onCancel} aria-label="Close entity panel" />
      <motion.aside
        className="entity-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        aria-label={mode === 'edit' ? 'Edit entity' : 'Add entity'}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">{mode === 'edit' ? 'POSITION AMENDMENT' : 'NEW POSITION'}</p>
            <h2>{mode === 'edit' ? 'Edit entity' : 'Add to the chart'}</h2>
          </div>
          <button type="button" className="panel-close" onClick={onCancel} aria-label="Close panel">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        <form className="entity-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="entity-name">
            Name
            <input
              id="entity-name"
              type="text"
              value={draft.name}
              onChange={(event) => updateDraft('name', event.target.value)}
              placeholder="e.g. Jane Doe"
              autoFocus
            />
          </label>

          <label className="field-label" htmlFor="entity-type">
            Type
            <select id="entity-type" value={draft.type} onChange={(event) => updateDraft('type', event.target.value)}>
              {ENTITY_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
            </select>
          </label>

          <div className="field-label">
            Image <span className="field-optional">optional</span>
            <div
              className="image-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
            >
              <div className="image-preview">
                {draft.imageUrl ? <img src={draft.imageUrl} alt="Selected entity" /> : <ImagePlus size={19} strokeWidth={1.3} />}
              </div>
              <div className="image-drop-copy">
                <button type="button" className="upload-button" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={13} strokeWidth={1.5} /> {uploading ? 'Processing…' : 'Upload image'}
                </button>
                <span>or drop a file here</span>
              </div>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                type="file"
                accept="image/*"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>
            <input
              className="image-url-input"
              type="url"
              value={draft.imageUrl.startsWith('data:') ? '' : draft.imageUrl}
              onChange={(event) => updateDraft('imageUrl', event.target.value)}
              placeholder="Paste an image URL"
            />
          </div>

          <fieldset className="coordinate-fields">
            <legend>Coordinates <span>drag the marker or set a precise value</span></legend>
            <CoordinateField
              label="Economic"
              value={draft.economic}
              onChange={(value) => updateDraft('economic', value)}
              left="Left"
              right="Right"
            />
            <CoordinateField
              label="Social / governmental"
              value={draft.social}
              onChange={(value) => updateDraft('social', value)}
              left="Authoritarian"
              right="Libertarian"
            />
          </fieldset>

          <label className="field-label" htmlFor="entity-notes">
            Notes <span className="field-optional">optional</span>
            <textarea
              id="entity-notes"
              value={draft.notes}
              onChange={(event) => updateDraft('notes', event.target.value)}
              maxLength={240}
              rows={3}
              placeholder="A short description or source note"
            />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="panel-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="save-button"><Save size={14} strokeWidth={1.5} /> Save position</button>
          </div>
        </form>
      </motion.aside>
    </>
  );
}

function CoordinateField({ label, value, onChange, left, right }) {
  return (
    <div className="coordinate-field">
      <div className="coordinate-field-heading">
        <span>{label}</span>
        <strong>{formatCoordinate(value)}</strong>
      </div>
      <div className="coordinate-range-labels"><span>{left}</span><span>{right}</span></div>
      <input
        type="range"
        min="-10"
        max="10"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      <input
        className="coordinate-number"
        type="number"
        min="-10"
        max="10"
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} exact value`}
      />
    </div>
  );
}

export default EntityPanel;
