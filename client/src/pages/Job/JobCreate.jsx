import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// PRICE CONFIG - পরে Admin থেকে change হবে
const PRICE_PER_SQFT = 12; // Mistri Only Price per Sqft
const MATERIAL_PER_SQFT = 18; // Company Material সহ
const PER_DAY_SQFT = 450;

const JobCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', address: '', phone: '', sqft: '',
    materialSource: 'company', // company | customer
    hasAgent: 'no', agentName: '', agentPhone: '',
    description: '', slot: 'morning',
  });
  const [photos, setPhotos] = useState([]); // Job Photo
  const [wallPhotos, setWallPhotos] = useState([]); // Wall Photo
  const [wallProblems, setWallProblems] = useState({ nona: false, damp: false, fatol: false });
  const [coupon, setCoupon] = useState('');

  const sqft = parseFloat(form.sqft) || 0;

  // === AUTO CALCULATE ===
  const calc = useMemo(() => {
    const mistriPrice = sqft * PRICE_PER_SQFT;
    const materialCost = form.materialSource === 'customer' ? 0 : sqft * MATERIAL_PER_SQFT;
    const total = mistriPrice + materialCost;
    // 450 Sqft Per Day
    const days = sqft / PER_DAY_SQFT;
    // Mistri Count Auto: 1 Mistri = 450 sqft/day, min 1, ceil
    const mistriCount = sqft === 0 ? 0 : Math.max(1, Math.ceil(days));
    // Auto Slot Divide: প্রতি Slot এ 450 sqft
    const slotsNeeded = Math.ceil(sqft / PER_DAY_SQFT) || 0;
    // Share: Mistri 80% Equal Split
    const mistriShare = mistriPrice * 0.80;
    const perMistriShare = mistriCount ? mistriShare / mistriCount : 0;
    // Agent থাকলে Platform 15% + Agent 5%, না থাকলে Platform 20%
    const platformShare = form.hasAgent === 'yes' ? mistriPrice * 0.15 : mistriPrice * 0.20;
    const agentShare = form.hasAgent === 'yes' ? mistriPrice * 0.05 : 0;

    return { mistriPrice, materialCost, total, days, mistriCount, slotsNeeded, mistriShare, perMistriShare, platformShare, agentShare };
  }, [sqft, form.materialSource, form.hasAgent]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'job') setPhotos([...photos, ...files]);
    else setWallPhotos([...wallPhotos, ...files]);
  };

  // Wall Nona Damp Fatol Auto Show - Photo name / AI detect simulation
  const detectWallProblem = () => {
    // Real এ AI / Manual থেকে আসবে, এখন checkbox থেকে show
    return wallProblems;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sqft) return toast.error('Sqft দিন');
    if (!form.address) return toast.error('Address দিন');
    if (!form.phone) return toast.error('Phone দিন');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('sqft', sqft);
    fd.append('mistriPrice', calc.mistriPrice);
    fd.append('materialCost', calc.materialCost);
    fd.append('totalPrice', calc.total);
    fd.append('days', calc.days);
    fd.append('mistriCount', calc.mistriCount);
    fd.append('perMistriShare', calc.perMistriShare);
    fd.append('platformShare', calc.platformShare);
    fd.append('agentShare', calc.agentShare);
    fd.append('wallProblems', JSON.stringify(wallProblems));
    fd.append('coupon', coupon);
    photos.forEach((f) => fd.append('photos', f));
    wallPhotos.forEach((f) => fd.append('wallPhotos', f));

    setLoading(true);
    try {
      const { data } = await api.post('/jobs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Job Created!');
      navigate(`/jobs/${data?.job?._id || data?._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Job Create Failed');
    } finally { setLoading(false); }
  };

  const wall = detectWallProblem();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Create</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">

        <input name="title" value={form.title} onChange={handleChange} placeholder="Job Title - Ex: 2 Room Paint" className="w-full border rounded-lg p-3" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Full Address *" className="w-full border rounded-lg p-3" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone *" className="w-full border rounded-lg p-3" required />

        {/* Sqft Input */}
        <div>
          <label className="font-bold">Sqft Input *</label>
          <input type="number" name="sqft" value={form.sqft} onChange={handleChange} placeholder="Ex: 100, 1000" className="w-full border rounded-lg p-3 mt-1 text-xl font-bold" required />
          <p className="text-xs text-gray-500 mt-1">100 Sqft = 0.22 Day • 450 Sqft = 1 Day</p>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="font-bold">Job Photo Upload</label>
          <input type="file" multiple accept="image/*" onChange={(e) => handlePhoto(e, 'job')} className="w-full border rounded-lg p-2 mt-1" />
          <div className="flex gap-2 mt-2 flex-wrap">{photos.map((f, i) => <img key={i} src={URL.createObjectURL(f)} className="w-20 h-20 object-cover rounded" alt="" />)}</div>
        </div>

        {/* Material Source */}
        <div>
          <label className="font-bold">Material Source Select</label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setForm({ ...form, materialSource: 'company' })} className={`flex-1 py-2 rounded-lg border ${form.materialSource === 'company' ? 'bg-blue-600 text-white' : ''}`}>Company দিবে</button>
            <button type="button" onClick={() => setForm({ ...form, materialSource: 'customer' })} className={`flex-1 py-2 rounded-lg border ${form.materialSource === 'customer' ? 'bg-green-600 text-white' : ''}`}>Customer দিবে</button>
          </div>
          {form.materialSource === 'customer' && <p className="text-sm text-green-600 mt-1 font-bold">✓ Material Cost Zero - Mistri Only Price Calculate হবে</p>}
        </div>

        {/* Agent Yes No */}
        <div>
          <label className="font-bold">Agent আছে?</label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setForm({ ...form, hasAgent: 'yes' })} className={`flex-1 py-2 rounded-lg border ${form.hasAgent === 'yes' ? 'bg-orange-500 text-white' : ''}`}>Yes - Agent আছে</button>
            <button type="button" onClick={() => setForm({ ...form, hasAgent: 'no' })} className={`flex-1 py-2 rounded-lg border ${form.hasAgent === 'no' ? 'bg-gray-800 text-white' : ''}`}>No - Agent নাই</button>
          </div>
          {form.hasAgent === 'yes' && (
            <div className="flex gap-2 mt-2">
              <input name="agentName" value={form.agentName} onChange={handleChange} placeholder="Agent Name" className="flex-1 border rounded-lg p-3" />
              <input name="agentPhone" value={form.agentPhone} onChange={handleChange} placeholder="Agent Phone" className="flex-1 border rounded-lg p-3" />
            </div>
          )}
        </div>

        {/* Wall Photo + Nona Damp Fatol */}
        <div className="border rounded-xl p-3 bg-yellow-50">
          <label className="font-bold">Wall Photo Upload</label>
          <input type="file" multiple accept="image/*" onChange={(e) => handlePhoto(e, 'wall')} className="w-full border rounded-lg p-2 mt-1 bg-white" />
          <div className="flex gap-3 mt-3">
            {['nona', 'damp', 'fatol'].map((k) => (
              <label key={k} className="flex items-center gap-1 text-sm capitalize"><input type="checkbox" checked={wallProblems[k]} onChange={() => setWallProblems({ ...wallProblems, [k]: !wallProblems[k] })} /> {k === 'nona' ? 'নোনা' : k === 'damp' ? 'Damp' : 'ফাটল'}</label>
            ))}
          </div>
          {/* Wall Problem Auto Show */}
          {(wall.nona || wall.damp || wall.fatol) && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {wall.nona && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">⚠️ নোনা ধরা</span>}
              {wall.damp && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">💧 Damp</span>}
              {wall.fatol && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">🧱 ফাটল</span>}
            </div>
          )}
        </div>

        {/* Slot */}
        <div>
          <label className="font-bold">Slot Select</label>
          <select name="slot" value={form.slot} onChange={handleChange} className="w-full border rounded-lg p-3 mt-1">
            <option value="morning">Morning (8AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 4PM)</option>
            <option value="fullday">Full Day</option>
          </select>
        </div>

        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon Code (Optional)" className="w-full border rounded-lg p-3" />
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Description..." className="w-full border rounded-lg p-3" />

        {/* PRICE AUTO CALCULATE SHOW */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
          <h3 className="font-bold text-base">💰 Price Auto Calculate</h3>
          <div className="flex justify-between"><span>Mistri Only Price ({sqft} × ৳{PRICE_PER_SQFT})</span><b>৳{calc.mistriPrice.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Material Cost {form.materialSource === 'customer' ? '(Customer - Zero)' : `(${sqft} × ৳${MATERIAL_PER_SQFT})`}</span><b>৳{calc.materialCost.toLocaleString()}</b></div>
          <div className="flex justify-between border-t pt-1"><span>Total Price</span><b className="text-blue-700 text-lg">৳{calc.total.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>450 Sqft Per Day → Day</span><b>{calc.days.toFixed(2)} Day {sqft === 100 && '(100 Sqft = 0.22 Day)'}</b></div>
          <div className="flex justify-between"><span>Mistri Count Auto</span><b>{calc.mistriCount} জন</b></div>
          <div className="flex justify-between"><span>Auto Slot Divide</span><b>{calc.slotsNeeded} Slot ({form.slot})</b></div>
          <div className="flex justify-between"><span>Per Mistri Share (80% Equal)</span><b>৳{calc.perMistriShare.toFixed(0)}</b></div>
          <div className="flex justify-between"><span>{form.hasAgent === 'yes' ? 'Platform 15% + Agent 5%' : 'Platform 20%'}</span><b>৳{calc.platformShare.toFixed(0)} {form.hasAgent === 'yes' && `+ Agent ৳${calc.agentShare.toFixed(0)}`}</b></div>
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">{loading ? 'Creating...' : `Create Job - ৳${calc.total.toLocaleString()}`}</button>
      </form>
    </div>
  );
};

export default JobCreate;