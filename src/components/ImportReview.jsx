import { motion } from 'framer-motion';
import { FileJson, GitMerge, Replace, X } from 'lucide-react';

function ImportReview({ pending, onMerge, onReplace, onCancel }) {
  return (
    <motion.aside
      className="import-review"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="false"
      aria-label="Review imported chart data"
    >
      <button type="button" className="import-review-close" onClick={onCancel} aria-label="Cancel import">
        <X size={14} strokeWidth={1.5} />
      </button>
      <div className="import-review-heading">
        <div className="import-review-icon"><FileJson size={16} strokeWidth={1.5} /></div>
        <div>
          <p className="eyebrow">IMPORT REVIEW</p>
          <h2>{pending.fileName}</h2>
        </div>
      </div>
      <p className="import-review-summary">
        Found <strong>{pending.entities.length}</strong> valid positions{pending.skipped ? ` · ${pending.skipped} duplicate/blank rows skipped` : ''}.
      </p>
      <div className="import-review-actions">
        <button type="button" className="import-merge-button" onClick={onMerge}><GitMerge size={14} strokeWidth={1.5} /> Merge into chart</button>
        <button type="button" className="import-replace-button" onClick={onReplace}><Replace size={14} strokeWidth={1.5} /> Replace chart</button>
      </div>
      <p className="import-review-footnote">Merge keeps your current positions. Replace requires a separate confirmation.</p>
    </motion.aside>
  );
}

export default ImportReview;
