import { Plus, Upload } from 'lucide-react';

function Onboarding({ onAdd, onImport }) {
  return (
    <div className="onboarding-card" role="region" aria-label="Get started">
      <h2>Your chart is empty</h2>
      <p>
        Place people, parties, organizations, and ideologies on the economic and social axes.
        Everything stays on this device unless you export it.
      </p>
      <div className="onboarding-actions">
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <Plus size={16} strokeWidth={1.75} /> Add entity
        </button>
        <button type="button" className="btn btn-secondary" onClick={onImport}>
          <Upload size={16} strokeWidth={1.75} /> Import data
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
