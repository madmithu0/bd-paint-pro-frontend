import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PaintBucket, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
          <PaintBucket size={24} />
          <span>BD Paint Pro</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/services" className="hover:text-blue-600 transition">Services</Link>
          <Link to="/contract" className="hover:text-blue-600 transition">Contract</Link>
          <Link to="/login" className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition">
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium">
          <Link to="/" onClick={() => setOpen(false)} className="block py-2">Home</Link>
          <Link to="/services" onClick={() => setOpen(false)} className="block py-2">Services</Link>
          <Link to="/contract" onClick={() => setOpen(false)} className="block py-2">Contract</Link>
          <div className="pt-2 flex gap-2">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-lg border border-blue-600 text-blue-600">
              Login
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-white">
              Signup
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
