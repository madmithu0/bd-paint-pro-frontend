import React, { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [justReconnected, setJustReconnected] = useState(false);

  const checkPendingQueue = () => {
    try {
      const raw = localStorage.getItem('offline_sync_queue');
      const queue = raw ? JSON.parse(raw) : [];
      setPendingCount(Array.isArray(queue) ? queue.length : 0);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    checkPendingQueue();

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      checkPendingQueue();
      setTimeout(() => setJustReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
      checkPendingQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(checkPendingQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !justReconnected && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2 text-xs font-medium text-center transition-colors z-50 ${
        !isOnline ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
      }`}
    >
      {!isOnline ? (
        <span>
          Offline Mode Active — Changes are saved locally and will sync automatically once connected
          {pendingCount > 0 ? ` (${pendingCount} queued)` : ''}.
        </span>
      ) : justReconnected ? (
        <span>Connection restored. Syncing queued offline data...</span>
      ) : (
        <span>Syncing {pendingCount} queued item(s)...</span>
      )}
    </div>
  );
}
