import { useEffect, useId, useRef } from 'react';

function BottomSheet({
  open,
  title,
  onClose,
  children,
  fullHeight = false,
  footer = null,
  labelledBy,
}) {
  const titleId = useId();
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const focusable = sheetRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-root" role="presentation">
      <button type="button" className="sheet-backdrop" aria-label="Close panel" onClick={onClose} />
      <div
        ref={sheetRef}
        className={`bottom-sheet${fullHeight ? ' is-full' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <footer className="sheet-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export default BottomSheet;
