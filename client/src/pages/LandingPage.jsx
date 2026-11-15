import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Shield, Calculator, Clock, ArrowRight } from 'lucide-react';
import { formatTaka } from '../format';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'MistriPro | Verified Painting, Wall Repair & Construction Workforce';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Book NID-verified Mistris with 450 Sqft/day standard calculation, AI wall damage detection, and secure bKash/Nagad escrow payments.'
      );
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_title: 'LandingPage', page_path: '/' });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <div className="space-y-16 pb-12">
      <section className="max-w-6xl mx-auto pt-8 md:pt-14 px-4 text-center">
        <span className="inline-block px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4">
          Enterprise Workforce & Escrow Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Smart Wall Painting & Repair with Verified Mistris
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
          Instant 450 Sqft/day auto-duration calculator, AI Nona/Damp/Fatol detection, digital contracts, and 100% escrow-protected payouts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-300 dark:border-slate-700 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            Explore Services
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4">
            <Calculator size={22} />
          </div>
          <h3 className="text-lg font-bold mb-2">450 Sqft Auto-Calculator</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Exact timeline and Mistri count calculation (100 Sqft = 0.22 Day) with zero hidden charges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-4">
            <Shield size={22} />
          </div>
          <h3 className="text-lg font-bold mb-2">bKash & Nagad Live Escrow</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Funds remain safely locked in escrow until job completion OTP verification, then auto-split fairly.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4">
            <Clock size={22} />
          </div>
          <h3 className="text-lg font-bold mb-2">GPS Attendance & Contracts</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Live GPS worker check-in, photo proof, and automated digital contracts with OTP signatures.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Transparent Service Pricing</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Choose between Full Material Package or Mistri-Only Labour
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold">Mistri-Only Labour</h3>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">
              {formatTaka(10)} <span className="text-xs font-normal text-gray-500">/ Sqft</span>
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Zero material cost enforced</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>450 Sqft/day verified productivity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Customer provides own paint & tools</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-600">
            <h3 className="text-lg font-bold">Complete Paint & Repair</h3>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">
              {formatTaka(18)} <span className="text-xs font-normal text-gray-500">/ Sqft</span>
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Branded paint, putty & primer included</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>AI Nona, Damp & Fatol wall inspection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>30% or 50% flexible advance payment</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
