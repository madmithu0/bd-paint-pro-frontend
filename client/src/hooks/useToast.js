import { useCallback } from 'react';
import { useStore } from '../store';

export default function useToast() {
  const { toast, showToast, clearToast } = useStore();

  const success = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg) => showToast(msg, 'error'), [showToast]);
  const warning = useCallback((msg) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg) => showToast(msg, 'info'), [showToast]);

  return {
    toast,
    showToast,
    clearToast,
    success,
    error,
    warning,
    info,
  };
}
