import { useEffect, useState } from 'react';
import api from '../api';

export default function useKill() {
  const [killed, setKilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    api.get('/kill/status', { signal: controller.signal })
      .then((res) => {
        if (!mounted) return;
        setKilled(res?.data?.killed === true);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        setError(err?.message || 'Kill check failed');
        setKilled(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return { killed, loading, error, isKilled: killed };
}