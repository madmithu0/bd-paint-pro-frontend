import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Support = () => {
  const [form, setForm] = useState({ name: '', phone: '', topic: 'job', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return toast.error('Message লিখুন');
    if (!form.phone.trim()) return toast.error('Phone দিন');
    setLoading(true);
    try {
      await api.post('/support', form);
      setSent(true);
      toast.success('Support Request Sent!');
    } catch {
      toast.error('Send Failed');
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto p-4 text-center py-16">
        <p className="text-6xl">✅</p>
        <h1 className="text-2xl font-bold mt-3">Request Sent!</h1>
        <p className="text-gray-500 mt-1">আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করবো।</p>
        <button onClick={() => { setSent(false); setForm({ name: '', phone: '', topic: 'job', message: '' }); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4">আরেকটা পাঠান</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">Support / Help</h1>
      <p className="text-sm text-gray-500">কোনো সমস্যা? আমাদের জানান</p>

      {/* Quick Contact */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <a href="tel:01700000000" className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl">📞</p><p className="font-bold text-sm mt-1">Call Us</p><p className="text-xs text-gray-500">01700-000000</p></a>
        <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl">💬</p><p className="font-bold text-sm mt-1">WhatsApp</p><p className="text-xs text-gray-500">Chat করুন</p></a>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow p-4 mt-4">
        <h3 className="font-bold mb-2">FAQ - সাধারণ প্রশ্ন</h3>
        <div className="space-y-2 text-sm">
          {[
            ['রং এর দাম কত?', 'Per Sqft ৪৫ টাকা থেকে শুরু। Calculator দিয়ে হিসাব করুন।'],
            ['Mistri কিভাবে পাবো?', 'Job Post করুন, Verified Mistri রা Apply করবে।'],
            ['Payment কিভাবে করবো?', 'bKash / Nagad / Cash - সব অপশন আছে।'],
            ['কাজ খারাপ হলে?', 'Report করুন, Admin দেখবে। Refund পাবেন।'],
          ].map(([q, a]) => (
            <details key={q} className="border rounded-lg p-2">
              <summary className="font-bold cursor-pointer">{q}</summary>
              <p className="text-gray-600 mt-1">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mt-4 space-y-3">
        <h3 className="font-bold">Message পাঠান</h3>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="আপনার নাম" className="w-full border rounded-lg p-3" />
        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone Number *" className="w-full border rounded-lg p-3" />
        <select value={form.topic} onChange={(e) => update('topic', e.target.value)} className="w-full border rounded-lg p-3">
          <option value="job">Job সমস্যা</option>
          <option value="payment">Payment সমস্যা</option>
          <option value="mistri">Mistri সমস্যা</option>
          <option value="other">অন্যান্য</option>
        </select>
        <textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="আপনার সমস্যা লিখুন..." rows={4} className="w-full border rounded-lg p-3" />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">{loading ? 'Sending...' : 'Send Message'}</button>
      </form>
    </div>
  );
};

export default Support;