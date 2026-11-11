import { useCallback, useEffect, useRef, useState } from 'react';

let toastId = 0;

export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    if (!message) return null;
    const id = ++toastId;
    const toast = { id, message: String(message), type, duration };
    setToasts((prev) => [...prev.slice(-2), toast]);
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg, duration) => show(msg, 'success', duration), [show]);
  const error = useCallback((msg, duration) => show(msg, 'error', duration), [show]);
  const warning = useCallback((msg, duration) => show(msg, 'warning', duration), [show]);
  const info = useCallback((msg, duration) => show(msg, 'info', duration), [show]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return { toasts, show, success, error, warning, info, dismiss, clear };
}