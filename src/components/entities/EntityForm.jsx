import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { clampCoordinate, formatCoordinate } from '../../lib/coordinates.js';
import { ENTITY_TYPES } from '../../lib/entities.js';
import { fileToDataUrl } from '../../lib/image.js';

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

function EntityForm({
  mode = 'add',
  entity = null,
  initialCoordinates = null,
  onSave,
  onCancel,
  stickyActions = false,
  className = '',
}) {
  const [draft, setDraft] = useState(() => draftFromEntity(entity, initialCoordinates));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setDraft(draftFromEntity(entity, initialCoordinates));
    setError('');
  }, [entity?.id, initialCoordinates?.economic, initialCoordinates?.social, mode]);

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
      setError('Enter a name before saving.');
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
    <form className={`entity-form ${className}`.trim()} onSubmit={handleSubmit} noValidate>
      <div className="entity-form-fields">
        <label className="field" htmlFor="entity-name">
          <span className="field-label">Name</span>
          <input
            id="entity-name"
            type="text"
            value={draft.name}
            onChange={(event) => updateDraft('name', event.target.value)}
            placeholder="e.g. Jane Doe"
            autoComplete="off"
            autoFocus
            required
          />
        </label>

        <label className="field" htmlFor="entity-type">
          <span className="field-label">Type</span>
          <select
            id="entity-type"
            value={draft.type}
            onChange={(event) => updateDraft('type', event.target.value)}
          >
            {ENTITY_TYPES.map((type) => (
              <option value={type.value} key={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field-label">
            Image <span className="field-optional">optional</span>
          </span>
          <div
            className="image-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files?.[0]);
            }}
          >
            <div className="image-preview" aria-hidden="true">
              {draft.imageUrl
                ? <img src={draft.imageUrl} alt="" />
                : <ImagePlus size={20} strokeWidth={1.5} />}
            </div>
            <div className="image-drop-copy">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} strokeWidth={1.75} />
                {uploading ? 'Processing…' : 'Upload image'}
              </button>
              <span className="field-hint">JPEG or PNG, resized in your browser</span>
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
            placeholder="Or paste an image URL"
            aria-label="Image URL"
          />
        </div>

        <fieldset className="coordinate-fields">
          <legend>
            Coordinates
            <span className="field-hint">Use the sliders or type exact values from −10 to +10</span>
          </legend>
          <CoordinateField
            label="Economic"
            description="Left (−) to Right (+)"
            value={draft.economic}
            onChange={(value) => updateDraft('economic', value)}
            left="Left"
            right="Right"
          />
          <CoordinateField
            label="Social"
            description="Authoritarian (−) to Libertarian (+)"
            value={draft.social}
            onChange={(value) => updateDraft('social', value)}
            left="Authoritarian"
            right="Libertarian"
          />
        </fieldset>

        <label className="field" htmlFor="entity-notes">
          <span className="field-label">
            Description <span className="field-optional">optional</span>
          </span>
          <span className="field-hint">One or two short lines shown when this entity is selected.</span>
          <textarea
            id="entity-notes"
            value={draft.notes}
            onChange={(event) => updateDraft('notes', event.target.value)}
            maxLength={240}
            rows={3}
            placeholder="e.g. Centre-left party supporting a mixed economy and broader social rights."
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
      </div>

      <div className={`form-actions${stickyActions ? ' is-sticky' : ''}`}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {mode === 'edit' ? 'Save changes' : 'Save entity'}
        </button>
      </div>
    </form>
  );
}

function CoordinateField({ label, description, value, onChange, left, right }) {
  const numeric = Number(value);
  const display = Number.isFinite(numeric) ? numeric : 0;

  return (
    <div className="coordinate-field">
      <div className="coordinate-field-heading">
        <div>
          <span className="field-label">{label}</span>
          <span className="field-hint">{description}</span>
        </div>
        <strong className="coord-value">{formatCoordinate(display)}</strong>
      </div>
      <div className="coordinate-range-labels">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min="-10"
        max="10"
        step="0.1"
        value={display}
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

export default EntityForm;
