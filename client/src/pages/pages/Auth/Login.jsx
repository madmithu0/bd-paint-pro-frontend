import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [err, setErr] = useState('');

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '8px', fontSize: '15px', boxSizing: 'border-box' };
  const btnStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 'bold', marginTop: '14px', cursor: 'pointer', fontSize: '15px' };
  const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleLoginSuccess = () => {
    // ProtectedRoute এই token টা দেখে Dashboard এ ঢুকতে দেয়
    localStorage.setItem('token', 'user-token-' + Date.now());
    localStorage.setItem('role', role);
    localStorage.setItem('phone', phone);
    navigate('/dashboard');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '380px', padding: '24px', borderRadius: '16px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>BD Paint Pro</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>গ্রাহক / মিস্ত্রি / এজেন্ট লগইন</p>

        {!role ? (
          <div>
            <b>তুমি কে? 👇</b>
            <button style={btnStyle} onClick={() => setRole('agent')}>🤝 আমি Agent</button>
            <button style={btnStyle} onClick={() => setRole('mistri')}>🎨 আমি মিস্ত্রি</button>
            <button style={btnStyle} onClick={() => setRole('customer')}>🏠 আমি গ্রাহক</button>
            <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '16px', color: '#64748b' }}>
              Super Admin? <a href="/super-admin">এখানে চাপ দিন</a>
            </p>
          </div>
        ) : (
          <div>
            <b>ফোন নম্বর ভেরিফাই 📱 - {role === 'agent' ? 'Agent' : role === 'mistri' ? 'মিস্ত্রি' : 'গ্রাহক'}</b>
            <input style={inputStyle} placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            {!otp ? (
              <button style={btnStyle} onClick={() => {
                if (phone.length < 11) { setErr('সঠিক নম্বর দিন - 01XXXXXXXXX'); return; }
                const o = makeOtp(); setOtp(o); alert('তোমার OTP (Demo): ' + o); setErr('');
              }}>OTP পাঠান</button>
            ) : (
              <>
                <input style={inputStyle} placeholder="OTP দিন" value={otpInput} onChange={e => setOtpInput(e.target.value)} />
                <button style={btnStyle} onClick={() => {
                  if (otpInput === otp) { handleLoginSuccess(); } else setErr('OTP ভুল!');
                }}>ভেরিফাই →</button>
                <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>Demo OTP: {otp}</p>
              </>
            )}
            <button style={{ ...btnStyle, background: '#94a3b8' }} onClick={() => { setRole(''); setOtp(''); setOtpInput(''); setErr(''); }}>← পেছনে</button>
          </div>
        )}

        {err && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{err}</p>}
        <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '16px' }}>
          <a href="/signup" style={{ color: '#0f172a' }}>নতুন? Signup করুন</a>
        </p>
      </div>
    </div>
  );
}