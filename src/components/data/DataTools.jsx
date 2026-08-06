import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';

function DataTools({ onExport, onImportFile, entityCount = 0 }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onImportFile(file);
    event.target.value = '';
  };

  return (
    <section className="data-tools" aria-label="Import and export">
      <h3 className="sidebar-section-title">Data</h3>
      <p className="data-tools-hint">
        Your chart is saved in this browser. Export a JSON file to back it up or move it elsewhere.
      </p>
      <div className="data-tools-actions">
        <button type="button" className="btn btn-secondary" onClick={onExport} disabled={entityCount === 0}>
          <Download size={15} strokeWidth={1.75} /> Export JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} strokeWidth={1.75} /> Import
        </button>
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}

export default DataTools;
