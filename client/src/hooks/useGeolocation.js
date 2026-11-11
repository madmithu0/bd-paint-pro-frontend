import { useCallback, useEffect, useState } from 'react';

export default function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Failed to get location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (options.auto) getPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    position,
    coords: position,
    latitude: position?.latitude ?? null,
    longitude: position?.longitude ?? null,
    error,
    loading,
    getPosition,
    refresh: getPosition,
  };
}