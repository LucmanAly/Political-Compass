function ImportReview({ pending, onMerge, onReplace, onCancel }) {
  if (!pending) return null;

  return (
    <div className="import-review" role="dialog" aria-labelledby="import-review-title">
      <h2 id="import-review-title">Import data</h2>
      <p className="import-review-summary">
        Found <strong>{pending.entities.length}</strong> valid
        {pending.entities.length === 1 ? ' entity' : ' entities'}
        {pending.fileName ? ` in “${pending.fileName}”` : ''}
        {pending.skipped ? ` · ${pending.skipped} blank or duplicate rows skipped` : ''}.
      </p>
      <div className="import-review-actions">
        <button type="button" className="btn btn-primary" onClick={onMerge}>
          Merge into chart
        </button>
        <button type="button" className="btn btn-secondary" onClick={onReplace}>
          Replace chart
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="field-hint">
        Merge keeps your current entities. Replace asks for confirmation and overwrites the chart.
      </p>
    </div>
  );
}

export default ImportReview;
