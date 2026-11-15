import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import useToast from '../hooks/useToast';

const TOAST_STYLES = {
  success: {
    container: 'bg-emerald-600 text-white border-emerald-700',
    icon: CheckCircle2,
  },
  error: {
    container: 'bg-red-600 text-white border-red-700',
    icon: AlertCircle,
  },
  warning: {
    container: 'bg-amber-500 text-slate-950 border-amber-600',
    icon: AlertTriangle,
  },
  info: {
    container: 'bg-slate-800 text-white border-slate-700',
    icon: Info,
  },
};

export default function Toast() {
  const { toast, clearToast } = useToast();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast || !toast.message) return null;

  const variant = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = variant.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <div
        role="alert"
        className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border ${variant.container}`}
      >
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Icon size={18} className="shrink-0" />
          <span>{toast.message}</span>
        </div>
        <button
          onClick={clearToast}
          aria-label="Close notification"
          className="p-1 rounded hover:bg-black/15 transition shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
