import React, { useState, useEffect } from 'react';
import api from '../api';

const DEFAULT_HOTLINE = import.meta.env.VITE_HOTLINE_NUMBER || '+8801700000000';
const DEFAULT_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '8801700000000';

const HotlineWidget = ({ compact = false, contextMessage = '' }) => {
  const [hotlinePhone, setHotlinePhone] = useState(DEFAULT_HOTLINE);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
  const [isOnline, setIsOnline] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHotlineConfig = async () => {
      try {
        const res = await api.get('/kill/status');
        if (isMounted && res.data && res.data.config) {
          if (res.data.config.hotlinePhone) {
            setHotlinePhone(res.data.config.hotlinePhone);
          }
          if (res.data.config.whatsappNumber) {
            setWhatsappNumber(res.data.config.whatsappNumber);
          }
          if (typeof res.data.config.hotlineActive === 'boolean') {
            setIsOnline(res.data.config.hotlineActive);
          }
        }
      } catch (_) {
        // Fallback to environment defaults silently
      }
    };

    fetchHotlineConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const encodedText = encodeURIComponent(
    contextMessage || 'Hello, I need help with painting service booking and rates.'
  );
  const whatsappUrl = `https://wa.me{whatsappNumber.replace(/\D/g, '')}?text=${encodedText}`;

  if (compact) {
    return (
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
            Need Help Before 30% Advance Payment?
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300">
            Talk directly to our support team for measurement, paint brand, or Mistri details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${hotlinePhone}`}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Call {hotlinePhone}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {expanded && (
        <div className="mb-2 w-64 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              24/7 Customer Hotline
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Call for instant Sqft estimate, site visit booking, or payment assistance.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={`tel:${hotlinePhone}`}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Call Now: {hotlinePhone}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="px-4 py-3 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        {expanded ? 'Close Support' : 'Hotline Help'}
      </button>
    </div>
  );
};

export default HotlineWidget;
