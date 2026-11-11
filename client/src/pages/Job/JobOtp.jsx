import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const JobOtp = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); // Demo show - Real এ SMS যাবে
  const [type, setType] = useState('start'); // start | end
  const [timer, setTimer] = useState(0);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data?.job || data);
      // Already started হলে End OTP mode
      if (data?.job?.startTime || data?.startTime) setType('end');
    } catch {
      toast.error('Job Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [id]);

  // OTP Timer 60s
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Job Start OTP Generate
  const generateOtp = async (otpType) => {
    try {
      const { data } = await api.post(`/jobs/${id}/otp/generate`, { type: otpType });
      setGeneratedOtp(data?.otp || ''); // Dev only - Production এ remove
      setType(otpType);
      setTimer(60);
      toast.success(`${otpType === 'start' ? 'Start' : 'End'} OTP Sent to Customer`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP Generate Failed');
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 4 && otp.length !== 6) return toast.error('OTP দিন - 4 / 6 Digit');
    try {
      const { data } = await api.post(`/jobs/${id}/otp/verify`, { type, otp });
      toast.success(data?.message || `${type === 'start' ? 'Job Started!' : 'Job Ended!'}`);
      setOtp('');
      setGeneratedOtp('');
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong OTP');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  const isStarted = !!job.startTime;
  const isEnded = !!job.endTime;

  return (
    <div className="max-w-md mx-auto p-4">
      <Link to={`/jobs/${id}`} className="text-blue-600 text-sm">← Back to Job</Link>
      <h1 className="text-2xl font-bold mt-2">Job OTP</h1>

      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <p className="font-bold">{job.title || job.address}</p>
        <p className="text-sm text-gray-500">{job.sqft} Sqft • Status: <b className="capitalize">{job.status}</b></p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs">Start Time Save</p>
            <p className="font-bold">{job.startTime ? new Date(job.startTime).toLocaleString('bn-BD') : 'Not Started'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs">End Time Save</p>
            <p className="font-bold">{job.endTime ? new Date(job.endTime).toLocaleString('bn-BD') : 'Not Ended'}</p>
          </div>
        </div>
        {isEnded && <p className="text-center bg-green-100 text-green-700 py-2 rounded-lg mt-3 font-bold">✓ Job Completed - OTP Verified</p>}
      </div>

      {!isEnded && (
        <div className="bg-white rounded-xl shadow p-4 mt-3">
          {/* Type Select */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setType('start')} disabled={isStarted} className={`flex-1 py-2 rounded-lg font-bold ${type === 'start' ? 'bg-green-600 text-white' : 'bg-gray-100'} disabled:opacity-50`}>Start OTP</button>
            <button onClick={() => setType('end')} disabled={!isStarted} className={`flex-1 py-2 rounded-lg font-bold ${type === 'end' ? 'bg-red-600 text-white' : 'bg-gray-100'} disabled:opacity-50`}>End OTP</button>
          </div>

          {/* Generate Button */}
          <button onClick={() => generateOtp(type)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            {type === 'start' ? 'Job Start OTP Generate' : 'Job End OTP Generate'}
          </button>
          {timer > 0 && <p className="text-center text-sm text-gray-500 mt-2">Resend in {timer}s</p>}
          {generatedOtp && <p className="text-center text-xs text-gray-400 mt-1">Demo OTP: {generatedOtp} (SMS এ যাবে)</p>}

          {/* Verify */}
          <div className="mt-4">
            <label className="font-bold">OTP Verify - Customer এর OTP দিন</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="____" maxLength={6} inputMode="numeric" className="w-full border rounded-lg p-3 mt-1 text-center text-2xl font-bold tracking-[0.5em]" />
            <button onClick={verifyOtp} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-3">Verify OTP</button>
            <p className="text-xs text-gray-400 text-center mt-2">
              {type === 'start' ? 'Start OTP Verify হলে Start Time Save হবে' : 'End OTP Verify হলে End Time Save হবে + Payment Release হবে'}
            </p>
          </div>
        </div>
      )}

      {/* OTP History */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">OTP History</h3>
        <p className="text-sm">Start OTP: {job.startOtpVerified ? '✓ Verified' : '✗ Not Verified'}</p>
        <p className="text-sm">End OTP: {job.endOtpVerified ? '✓ Verified' : '✗ Not Verified'}</p>
      </div>
    </div>
  );
};

export default JobOtp;