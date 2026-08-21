import { useToast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/cn';

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg',
            toast.variant === 'success' ? 'bg-emerald-600' : 'bg-red-600',
          )}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-white/80 hover:text-white"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
