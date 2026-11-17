import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [sqft, setSqft] = useState(450);
  const [mode, setMode] = useState('complete'); // 'complete' | 'mistriOnly'

  const ratePerSqft = mode === 'complete' ? 18 : 10;
  const estimatedCost = Math.round(sqft * ratePerSqft);
  const estimatedDays = (sqft / 450).toFixed(2);
  const mistriCount = Math.max(1, Math.ceil(sqft / 900));

  const featuredMistris = [
    { name: 'Ariful Islam', role: 'Master Painter', rating: '4.9', jobs: 142, ring: 'from-pink-500 via-red-500 to-yellow-500' },
    { name: 'Kamrul Hasan', role: 'Damp & Nona Expert', rating: '4.8', jobs: 98, ring: 'from-indigo-500 via-purple-500 to-pink-500' },
    { name: 'Sajibur Rahman', role: 'Exterior Specialist', rating: '5.0', jobs: 215, ring: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { name: 'Tanvir Ahmed', role: 'Putty & Primer Pro', rating: '4.9', jobs: 119, ring: 'from-amber-400 via-orange-500 to-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* VIBRANT SOCIAL-STYLE HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>VERIFIED 450 SQFT/DAY • ESCROW PROTECTED</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Smart Wall Painting &amp; Repair with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-pink-200">
                Verified Mistris
              </span>
            </h1>

            <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Instant 450 Sqft/day auto-duration calculator, AI Nona/Damp/Fatol wall damage detection, digital OTP contracts, and 100% bKash/Nagad escrow safety.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/signup"
                className="px-6 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm shadow-xl shadow-indigo-950/30 transition transform hover:-translate-y-0.5"
              >
                Get Started Free →
              </Link>
              <Link
                to="/services"
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition"
              >
                Explore Services
              </Link>
            </div>
            {/* Social Proof Stats Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-md mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
                <div className="text-lg sm:text-xl font-extrabold text-white">450</div>
                <div className="text-[11px] text-indigo-100">Sqft / Day Standard</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
                <div className="text-lg sm:text-xl font-extrabold text-amber-300">100%</div>
                <div className="text-[11px] text-indigo-100">Escrow Safe Pay</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
                <div className="text-lg sm:text-xl font-extrabold text-emerald-300">AI Scan</div>
                <div className="text-[11px] text-indigo-100">Nona &amp; Damp Check</div>
              </div>
            </div>
          </div>

          {/* Right Live Interactive 450 Sqft Calculator Card */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-white/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                  Instant Live Estimator
                </span>
                <h2 className="text-lg font-extrabold text-slate-900">
                  450 Sqft Auto-Calculator
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                100 Sqft = 0.22 Day
              </span>
            </div>

            {/* Package Switcher Pills */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setMode('complete')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'complete'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                With Paint (৳18/Sqft)
              </button>
              <button
                type="button"
                onClick={() => setMode('mistriOnly')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'mistriOnly'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mistri-Only (৳10/Sqft)
              </button>
            </div>

            {/* Sqft Range Slider */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Wall Area Size</span>
                <span className="text-indigo-600 text-sm font-extrabold">{sqft} Sqft</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>100 Sqft</span>
                <span>2,500 Sqft</span>
                <span>5,000 Sqft</span>
              </div>
            </div>

            {/* Calculated Output Boxes */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-3 text-center">
                <div className="text-[10px] font-bold uppercase text-indigo-500">Est. Cost</div>
                <div className="text-base sm:text-lg font-extrabold text-indigo-950 mt-0.5">
                  ৳{estimatedCost.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-3 text-center">
                <div className="text-[10px] font-bold uppercase text-pink-500">Duration</div>
                <div className="text-base sm:text-lg font-extrabold text-pink-950 mt-0.5">
                  {estimatedDays} Days
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-3 text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-600">Mistris</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-950 mt-0.5">
                  {mistriCount} Pro
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-purple-500/30 transition"
            >
              Book This Estimate Now →
            </Link>
          </div>
        </div>
      </section>
      {/* INSTAGRAM-STYLE VERIFIED MISTRI STORIES STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Top Verified Mistris • Live Ready
            </span>
            <Link to="/services" className="text-xs font-bold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredMistris.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 transition"
              >
                <div className={`p-0.5 rounded-full bg-gradient-to-tr ${m.ring} shrink-0`}>
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm border-2 border-white">
                    {m.name.charAt(0)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{m.role}</div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">
                    ★ {m.rating} • {m.jobs} Jobs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COLORFUL FEATURE CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-blue-500/30">
              450
            </div>
            <h3 className="text-base font-extrabold text-slate-900">450 Sqft Auto-Calculator</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Exact timeline and Mistri count calculation (100 Sqft = 0.22 Day) with zero hidden charges or manual guesswork.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-pink-500/30">
              ৳
            </div>
            <h3 className="text-base font-extrabold text-slate-900">bKash &amp; Nagad Live Escrow</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Funds remain safely locked in escrow until job completion OTP verification, then auto-split fairly (Mistri 80%).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-emerald-500/30">
              AI
            </div>
            <h3 className="text-base font-extrabold text-slate-900">AI Wall Damage &amp; GPS</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Smart detection for Nona, Damp, and Fatol repairs with live GPS worker check-in and digital OTP contracts.
            </p>
          </div>
        </div>
      </section>
      {/* TRANSPARENT PRICING CARDS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-8">
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
            Flexible Packages
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Transparent Service Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose between Full Material Package or Mistri-Only Labour
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mistri-Only Card */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 shadow-sm hover:border-pink-400 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Mistri-Only Labour</h3>
                <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-bold">
                  You Provide Paint
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-pink-600">৳ 10.00</span>
                <span className="text-xs font-bold text-slate-500">/ Sqft</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Zero material cost enforced
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> 450 Sqft/day verified productivity
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Customer provides own paint &amp; tools
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-6 block w-full py-3 text-center rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold text-xs uppercase tracking-wider transition"
            >
              Book Mistri-Only
            </Link>
          </div>

          {/* Complete Paint Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-7 border-2 border-indigo-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-extrabold uppercase">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Complete Paint &amp; Repair</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-amber-300">৳ 18.00</span>
                <span className="text-xs font-bold text-indigo-200">/ Sqft</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs text-indigo-100 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">✓</span> Branded paint, putty &amp; primer included
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">✓</span> AI Nona, Damp &amp; Fatol wall inspection
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">✓</span> 30% or 50% flexible escrow advance payment
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-6 block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition"
            >
              Book Complete Package →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
