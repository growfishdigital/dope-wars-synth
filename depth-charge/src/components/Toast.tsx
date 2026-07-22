import { useEffect } from 'react';
import type { Toast as ToastData } from '../engine/types';

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), 2200);
    return () => window.clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div className="dc-toast-wrap" role="status" aria-live="polite">
      <div className={`dc-toast dc-toast--${toast.tone}`} key={toast.id}>
        {toast.text}
      </div>
    </div>
  );
}
