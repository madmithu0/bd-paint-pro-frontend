import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data?.job || data);
    } catch {
      toast.error('Job Details Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  const sqft = job.sqft || 0;
  const days = sqft / 450; // Day Show = Sqft / 450
  const mistriCount = job.mistriCount || Math.max(1, Math.ceil(days));
  const mistriPrice = job.mistriPrice || job.totalPrice || 0;
  const materialCost = job.materialCost || 0;
  const total = job.totalPrice || mistriPrice + materialCost;
  const hasAgent = job.hasAgent === 'yes' || job.agentName;
  // Share Show Mistri 80% Equal Split
  const mistriTotalShare = mistriPrice * 0.80;
  const perMistriShare = job.perMistriShare || mistriTotalShare / mistriCount;
  const platformShare = hasAgent ? mistriPrice * 0.15 : mistriPrice * 0.20;
  const agentShare = hasAgent ? mistriPrice * 0.05 : 0;

  const photos = job.photos || job.images || [];
  const wall = job.wallProblems || {};
  // wallProblems string হলে parse
  let wallObj = wall;
  if (typeof wall === 'string') { try { wallObj = JSON.parse(wall); } catch { wallObj = {}; } }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/jobs" className="text-blue-600 text-sm">← Job List</Link>

      <div className="bg-white rounded-xl shadow p-5 mt-3">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{job.title || 'Job'}</h1>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs h-fit capitalize">{job.status}</span>
        </div>
        <p className="text-gray-500 mt-1">{job.address} • {job.phone}</p>

        {/* Mistri Only Badge */}
        {job.materialSource === 'customer' && (
          <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✓ MISTRI ONLY - Material Customer দিবে - Material Cost Zero</span>
        )}
        {job.materialSource === 'company' && (
          <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Company Material দিবে</span>
        )}
      </div>

      {/* Photo Gallery */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">📸 Photo Gallery ({photos.length})</h3>
        {photos.length > 0 ? (
          <>
            <img src={photos[activePhoto]} className="w-full h-64 object-cover rounded-xl" alt="Job" />
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {photos.map((p, i) => (
                <img key={i} src={p} onClick={() => setActivePhoto(i)} className={`w-16 h-16 object-cover rounded-lg cursor-pointer ${activePhoto === i ? 'ring-2 ring-blue-600' : ''}`} alt="" />
              ))}
            </div>
          </>
        ) : <p className="text-gray-400 text-sm">কোনো Photo নাই</p>}
      </div>

      {/* Price Breakup */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-3">💰 Price Breakup</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Sqft</span><b>{sqft} Sqft</b></div>
          <div className="flex justify-between"><span>Mistri Only Price</span><b>৳{mistriPrice.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Material Cost {job.materialSource === 'customer' ? '(Zero)' : ''}</span><b>৳{materialCost.toLocaleString()}</b></div>
          <div className="flex justify-between border-t pt-2"><span>Total Price</span><b className="text-lg text-blue-700">৳{total.toLocaleString()}</b></div>
        </div>
      </div>

      {/* Day / Mistri / Share */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-3">👷 Work Info & Share</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs">Day Show = Sqft / 450</p><p className="font-bold text-lg">{days.toFixed(2)} Day</p><p className="text-xs text-gray-400">100 Sqft = 0.22 Day</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs">Mistri Count Show</p><p className="font-bold text-lg">{mistriCount} জন</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs">Mistri Total Share (80%)</p><p className="font-bold">৳{mistriTotalShare.toFixed(0)}</p></div>
          <div className="bg-green-50 rounded-lg p-3"><p className="text-xs">Share Show - Per Mistri (Equal Split)</p><p className="font-bold text-green-700">৳{perMistriShare.toFixed(0)} / জন</p></div>
        </div>

        {/* Agent থাকলে 5% + Platform 15%, না থাকলে Platform 20% Auto Show */}
        <div className="mt-3 bg-yellow-50 rounded-lg p-3 text-sm space-y-1">
          <p className="font-bold">🤝 Agent / Platform Share Auto</p>
          {hasAgent ? (
            <>
              <div className="flex justify-between"><span>Agent আছে ({job.agentName || 'Agent'}) - 5%</span><b>৳{agentShare.toFixed(0)}</b></div>
              <div className="flex justify-between"><span>Platform - 15%</span><b>৳{platformShare.toFixed(0)}</b></div>
            </>
          ) : (
            <div className="flex justify-between"><span>Agent নাই - Platform - 20%</span><b>৳{platformShare.toFixed(0)}</b></div>
          )}
          <div className="flex justify-between border-t pt-1"><span>Mistri - 80% Equal Split</span><b>৳{mistriTotalShare.toFixed(0)} ÷ {mistriCount} = ৳{perMistriShare.toFixed(0)}</b></div>
        </div>
      </div>

      {/* Wall Problem Show */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">🧱 Wall Problem Show</h3>
        <div className="flex gap-2 flex-wrap">
          {wallObj.nona && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">⚠️ নোনা (Nona)</span>}
          {wallObj.damp && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">💧 Damp</span>}
          {wallObj.fatol && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">🧱 ফাটল (Fatol)</span>}
          {!wallObj.nona && !wallObj.damp && !wallObj.fatol && <p className="text-gray-400 text-sm">কোনো Wall Problem নাই - Wall ভালো আছে</p>}
        </div>
        {job.wallPhotos?.length > 0 && (
          <div className="flex gap-2 mt-3">{job.wallPhotos.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" alt="" />)}</div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Link to={`/jobs/${id}/otp`} className="flex-1 text-center bg-green-600 text-white py-3 rounded-lg font-bold">OTP Start / End</Link>
        <Link to={`/jobs/${id}/cancel`} className="flex-1 text-center bg-red-100 text-red-600 py-3 rounded-lg font-bold">Cancel Job</Link>
      </div>
    </div>
  );
};

export default JobDetails;