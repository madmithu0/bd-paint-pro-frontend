import { useEffect, useRef } from 'react';

export default function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function usePreviousDistinct(value, compareFn) {
  const ref = useRef(undefined);
  const prevRef = useRef(undefined);

  useEffect(() => {
    const isSame = typeof compareFn === 'function'
      ? compareFn(ref.current, value)
      : ref.current === value;

    if (!isSame) {
      prevRef.current = ref.current;
      ref.current = value;
    }
  }, [value, compareFn]);

  return prevRef.current;
}