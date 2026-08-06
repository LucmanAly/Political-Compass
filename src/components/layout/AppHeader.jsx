import { Maximize2, Menu, Minimize2, Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { APP_VERSION } from '../../lib/release.js';

function AppHeader({
  sidebarOpen,
  onToggleSidebar,
  onAdd,
  onFullView,
  fullViewActive,
  isDesktop,
  placementMode,
  onCancelPlacement,
}) {
  return (
    <header className="app-header">
      <div className="header-brand">
        {isDesktop && (
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <PanelLeftClose size={18} strokeWidth={1.75} /> : <PanelLeft size={18} strokeWidth={1.75} />}
          </button>
        )}
        {!isDesktop && (
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleSidebar}
            aria-label="Open browse panel"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
        )}
        <div className="brand-text">
          <h1>Political Compass</h1>
          <p className="brand-sub">Personal atlas · v{APP_VERSION}</p>
        </div>
      </div>

      <div className="header-actions">
        {placementMode && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancelPlacement}>
            Cancel placement
          </button>
        )}
        <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
          <Plus size={15} strokeWidth={1.75} />
          <span>Add</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onFullView}
          title={fullViewActive ? 'Exit full view' : 'Full view'}
        >
          {fullViewActive
            ? <Minimize2 size={15} strokeWidth={1.75} />
            : <Maximize2 size={15} strokeWidth={1.75} />}
          <span className="hide-sm">{fullViewActive ? 'Exit' : 'Full view'}</span>
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
