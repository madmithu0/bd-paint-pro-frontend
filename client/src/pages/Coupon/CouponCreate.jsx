import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CouponCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent', // percent | fixed
    discountValue: '',
    minOrder: '',
    maxUses: '',
    expiryDate: '',
    isActive: true,
    applyTo: 'all', // all | mistri_only | first_order
  });

  const update = (key, val) => setForm({ ...form, [key]: val });

  // Random Coupon Code Generate
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'RONG';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    update('code', code);
    toast.success(`Generated: ${code}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon Code দিন');
    if (!form.discountValue) return toast.error('Discount Value দিন');
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) return toast.error('Percent 100 এর বেশি হবে না');

    setLoading(true);
    try {
      await api.post('/coupons', {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : 0,
      });
      toast.success('Coupon Created!');
      navigate('/coupons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Coupon Create Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to="/coupons" className="text-blue-600 text-sm">← Coupon List</Link>
      <h1 className="text-2xl font-bold mt-2">New Coupon Create</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 mt-3 space-y-4">
        {/* Code */}
        <div>
          <label className="font-bold">Coupon Code *</label>
          <div className="flex gap-2 mt-1">
            <input value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} placeholder="Ex: RONG50" className="flex-1 border rounded-lg p-3 uppercase" />
            <button type="button" onClick={generateCode} className="bg-gray-100 px-4 rounded-lg font-bold">Generate</button>
          </div>
        </div>

        <div>
          <label className="font-bold">Description</label>
          <input value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Ex: 50% OFF on First Order" className="w-full border rounded-lg p-3 mt-1" />
        </div>

        {/* Discount Type */}
        <div>
          <label className="font-bold">Discount Type</label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => update('discountType', 'percent')} className={`flex-1 py-2 rounded-lg font-bold ${form.discountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>% Percent</button>
            <button type="button" onClick={() => update('discountType', 'fixed')} className={`flex-1 py-2 rounded-lg font-bold ${form.discountType === 'fixed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>৳ Fixed Amount</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold">Discount Value *</label>
            <input type="number" value={form.discountValue} onChange={(e) => update('discountValue', e.target.value)} placeholder={form.discountType === 'percent' ? '10' : '500'} className="w-full border rounded-lg p-3 mt-1" />
          </div>
          <div>
            <label className="font-bold">Min Order (৳)</label>
            <input type="number" value={form.minOrder} onChange={(e) => update('minOrder', e.target.value)} placeholder="0" className="w-full border rounded-lg p-3 mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold">Max Uses</label>
            <input type="number" value={form.maxUses} onChange={(e) => update('maxUses', e.target.value)} placeholder="100" className="w-full border rounded-lg p-3 mt-1" />
          </div>
          <div>
            <label className="font-bold">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} className="w-full border rounded-lg p-3 mt-1" />
          </div>
        </div>

        {/* Apply To */}
        <div>
          <label className="font-bold">Apply To</label>
          <select value={form.applyTo} onChange={(e) => update('applyTo', e.target.value)} className="w-full border rounded-lg p-3 mt-1">
            <option value="all">All Jobs</option>
            <option value="mistri_only">Mistri Only Jobs</option>
            <option value="first_order">First Order Only</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} className="w-4 h-4" />
          <span className="font-bold">Active Coupon</span>
        </label>

        {/* Preview */}
        <div className="bg-yellow-50 rounded-xl p-3 text-sm">
          <p className="font-bold">Preview: {form.code || 'CODE'}</p>
          <p>{form.discountType === 'percent' ? `${form.discountValue || 0}% OFF` : `৳${form.discountValue || 0} OFF`} • Min Order ৳{form.minOrder || 0} • Max Uses {form.maxUses || '∞'}</p>
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Coupon'}
        </button>
      </form>
    </div>
  );
};

export default CouponCreate;