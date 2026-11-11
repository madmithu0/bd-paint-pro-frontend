import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [form, setForm] = useState({
    appName: 'Rong Mistri',
    supportPhone: '',
    supportEmail: '',
    perSqftRate: 45,
    minOrderAmount: 500,
    serviceChargePercent: 5,
    mistriCommissionPercent: 10,
    deliveryCharge: 0,
    maintenanceMode: false,
    allowNewRegistration: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/settings');
      if (data?.settings) setForm({ ...form, ...data.settings });
    } catch {
      toast.error('Settings Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', form);
      toast.success('Settings Saved!');
    } catch {
      toast.error('Save Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold">App Settings</h1>

      <div className="bg-white rounded-xl shadow p-5 mt-3 space-y-4">
        <div>
          <label className="font-bold">App Name</label>
          <input value={form.appName} onChange={(e) => update('appName', e.target.value)} className="w-full border rounded-lg p-3 mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold">Support Phone</label>
            <input value={form.supportPhone} onChange={(e) => update('supportPhone', e.target.value)} placeholder="01XXXXXXXXX" className="w-full border rounded-lg p-3 mt-1" />
          </div>
          <div>
            <label className="font-bold">Support Email</label>
            <input value={form.supportEmail} onChange={(e) => update('supportEmail', e.target.value)} placeholder="support@rongmistri.com" className="w-full border rounded-lg p-3 mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold">Per Sqft Rate (৳)</label>
            <input type="number" value={form.perSqftRate} onChange={(e) => update('perSqftRate', Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
          </div>
          <div>
            <label className="font-bold">Min Order (৳)</label>
            <input type="number" value={form.minOrderAmount} onChange={(e) => update('minOrderAmount', Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold">Service Charge %</label>
            <input type="number" value={form.serviceChargePercent} onChange={(e) => update('serviceChargePercent', Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
          </div>
          <div>
            <label className="font-bold">Mistri Commission %</label>
            <input type="number" value={form.mistriCommissionPercent} onChange={(e) => update('mistriCommissionPercent', Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
          </div>
        </div>

        <div>
          <label className="font-bold">Delivery Charge (৳)</label>
          <input type="number" value={form.deliveryCharge} onChange={(e) => update('deliveryCharge', Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
        </div>

        <label className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-bold">Maintenance Mode</span>
          <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => update('maintenanceMode', e.target.checked)} className="w-5 h-5" />
        </label>

        <label className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="font-bold">Allow New Registration</span>
          <input type="checkbox" checked={form.allowNewRegistration} onChange={(e) => update('allowNewRegistration', e.target.checked)} className="w-5 h-5" />
        </label>

        {/* Calculator Preview */}
        <div className="bg-blue-50 rounded-xl p-3 text-sm">
          <p className="font-bold">Preview - 1000 Sqft Job:</p>
          <p>Base: ৳{(1000 * form.perSqftRate).toLocaleString()} • Service: ৳{(1000 * form.perSqftRate * form.serviceChargePercent / 100).toLocaleString()} • Total: ৳{(1000 * form.perSqftRate * (1 + form.serviceChargePercent / 100)).toLocaleString()}</p>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;