import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';

export default function useFetch(url, options = {}) {
  const { auto = true, params = null } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const paramsKey = JSON.stringify(params || {});

  const fetchData = useCallback(async () => {
    if (!url) return null;
    if (!mountedRef.current) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params: params ? JSON.parse(paramsKey) : undefined });
      const payload = res?.data ?? null;
      if (mountedRef.current) setData(payload);
      return payload;
    } catch (err) {
      const msg = err?.message || 'Fetch failed';
      if (mountedRef.current) setError(msg);
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    if (auto && url) fetchData().catch(() => {});
    return () => { mountedRef.current = false; };
  }, [auto, url, fetchData]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, error, refetch, setData };
}