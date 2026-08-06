let toastId = 0;

export function createToast(message, options = {}) {
  toastId += 1;
  return {
    id: toastId,
    message,
    tone: options.tone || 'info',
    duration: options.duration ?? 4200,
    actionLabel: options.actionLabel || '',
    onAction: options.onAction || null,
  };
}
