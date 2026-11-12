import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Hind Siliguri', Arial, sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      {/* NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎨</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, lineHeight: 1 }}>BD Paint Pro</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>বাংলাদেশের সেরা পেইন্ট সার্ভিস</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#0f172a', padding: '9px 14px', fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff' }}>লগইন</Link>
          <Link to="/signup" style={{ textDecoration: 'none', color: '#fff', padding: '9px 16px', fontWeight: 700, fontSize: 14, borderRadius: 10, background: '#ea580c' }}>সাইন আপ</Link>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '36px 20px 20px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#ffedd5', color: '#ea580c', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>✨ এখন খুলনাসহ সারা বাংলাদেশে</div>
        <h1 style={{ fontSize: 36, lineHeight: 1.2, fontWeight: 900, margin: '16px 0 10px' }}>আপনার বাসাকে<br />দিন <span style={{ color: '#ea580c' }}>নতুন রঙের</span><br />ছোঁয়া</h1>
        <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.6, margin: '0 0 22px' }}>প্রফেশনাল মিস্ত্রি, অরিজিনাল রঙ, স্বচ্ছ বিল আর সময়মতো কাজ। এখনই বুক করুন, দাম দেখুন, ইনভয়েস পান - সব এক জায়গায়।</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ textDecoration: 'none', background: '#ea580c', color: '#fff', padding: '14px 24px', borderRadius: 12, fontWeight: 800, fontSize: 16, boxShadow: '0 8px 20px rgba(234,88,12,0.3)' }}>🚀 ফ্রিতে শুরু করুন</Link>
          <Link to="/login" style={{ textDecoration: 'none', background: '#fff', color: '#0f172a', padding: '14px 24px', borderRadius: 12, fontWeight: 800, fontSize: 16, border: '1px solid #e2e8f0' }}>ড্যাশবোর্ড দেখুন</Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 22, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
          <span>⭐ 4.9 রেটিং</span><span>✅ 500+ কাজ সম্পন্ন</span><span>🛡️ 1 বছরের গ্যারান্টি</span>
        </div>
      </div>

      {/* IMAGE CARD */}
      <div style={{ padding: '10px 20px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24,#22c55e,#3b82f6)', borderRadius: 20, padding: 16, color: '#fff' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 16, color: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>আজকের অফার 🔥</b><span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>২০% ছাড়</span>
            </div>
            <p style={{ fontSize: 14, color: '#475569', margin: '8px 0 12px' }}>ফুল হাউস পেইন্টিং এ ২০% ছাড় চলছে। অফার শেষ হওয়ার আগেই বুক করুন।</p>
            <Link to="/signup" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 700 }}>এখনই বুক করুন →</Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '24px 20px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 16 }}>কেন BD Paint Pro?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['🎨', 'রঙের ক্যালকুলেটর', 'কতটুকু রঙ লাগবে হিসাব করুন'],
            ['🧑‍🎨', 'দক্ষ মিস্ত্রি', 'যাচাই করা প্রফেশনাল টিম'],
            ['🧾', 'স্বচ্ছ ইনভয়েস', 'লুকানো কোনো চার্জ নাই'],
            ['📅', 'সহজ শিডিউল', 'আপনার সময়মতো কাজ'],
            ['📊', 'রিপোর্ট', 'প্রতিদিনের কাজের আপডেট'],
            ['💬', 'সাপোর্ট', 'সকাল ৯টা - রাত ৯টা'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: '#fff', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 24 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER CTA */}
      <div style={{ padding: '10px 20px 30px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#0f172a', color: '#fff', borderRadius: 18, padding: 22 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>আজই শুরু করুন</h3>
          <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 16px' }}>অ্যাকাউন্ট খুলতে ১ মিনিটও লাগবে না।</p>
          <Link to="/signup" style={{ display: 'inline-block', textDecoration: 'none', background: '#ea580c', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 800 }}>অ্যাকাউন্ট খুলুন</Link>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>© 2026 BD Paint Pro • খুলনা, বাংলাদেশ • Version 1.0.0</p>
      </div>
    </div>
  );
}