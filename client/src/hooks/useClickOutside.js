import { useEffect, useRef } from 'react';

export default function useClickOutside(handler, active = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return undefined;
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handlerRef.current?.(e);
      }
    };
    const onTouchStart = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handlerRef.current?.(e);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handlerRef.current?.(e);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return ref;
}