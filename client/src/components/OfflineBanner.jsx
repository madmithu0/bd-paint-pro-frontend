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
        !isOnline
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}
    >
      {!isOnline ? (
        <span>
          আপনি এখন অফলাইনে আছেন — আপনার তথ্য লোকাল ড্রাফটে সংরক্ষিত হচ্ছে এবং ইন্টারনেট এলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে
          {pendingCount > 0 ? ` (${pendingCount}টি অপেক্ষমাণ)` : ''}।
        </span>
      ) : justReconnected ? (
        <span>
          ইন্টারনেট সংযোগ ফিরে এসেছে! অপেক্ষমাণ তথ্য সার্ভারের সাথে সিঙ্ক হচ্ছে...
        </span>
      ) : (
        <span>
          অফলাইন কিউতে {pendingCount}টি তথ্য সিঙ্ক হওয়ার অপেক্ষায় আছে...
        </span>
      )}
    </div>
  );
}
