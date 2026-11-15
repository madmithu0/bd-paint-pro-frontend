import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ version = 'v3.0.0 LOCK' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 text-sm text-gray-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-gray-900 dark:text-white">MistriPro Platform</span>
          <span className="hidden sm:inline">•</span>
          <span>Support: support@mistripro.com | +880 1700-000000</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          <Link to="/legal/terms" className="hover:text-blue-600">Terms</Link>
          <Link to="/legal/privacy" className="hover:text-blue-600">Privacy</Link>
          <Link to="/legal/refund" className="hover:text-blue-600">Refund Policy</Link>
          <Link to="/legal/faq" className="hover:text-blue-600">FAQ</Link>
          <Link to="/legal/contact" className="hover:text-blue-600">Contact</Link>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span>© {currentYear} All Rights Reserved</span>
          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-mono text-[11px] font-semibold">
            {version}
          </span>
        </div>
      </div>
    </footer>
  );
}
