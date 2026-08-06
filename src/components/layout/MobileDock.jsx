import { Maximize2, Plus, RotateCcw, Search } from 'lucide-react';

function MobileDock({
  onBrowse,
  onAdd,
  onFit,
  onMore,
  placementMode,
}) {
  return (
    <nav className="mobile-dock" aria-label="Primary actions">
      <button type="button" className="dock-btn" onClick={onBrowse}>
        <Search size={20} strokeWidth={1.75} />
        <span>Browse</span>
      </button>
      <button
        type="button"
        className={`dock-btn dock-primary${placementMode ? ' is-active' : ''}`}
        onClick={onAdd}
      >
        <Plus size={20} strokeWidth={1.75} />
        <span>{placementMode ? 'Placing…' : 'Add'}</span>
      </button>
      <button type="button" className="dock-btn" onClick={onFit}>
        <RotateCcw size={20} strokeWidth={1.75} />
        <span>Fit</span>
      </button>
      <button type="button" className="dock-btn" onClick={onMore}>
        <Maximize2 size={20} strokeWidth={1.75} />
        <span>More</span>
      </button>
    </nav>
  );
}

export default MobileDock;
