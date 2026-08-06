function ToastStack({ toasts, onDismiss, onAction }) {
  if (!toasts?.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          <p>{toast.message}</p>
          <div className="toast-actions">
            {toast.actionLabel && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  onAction?.(toast);
                  onDismiss?.(toast.id);
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => onDismiss?.(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
