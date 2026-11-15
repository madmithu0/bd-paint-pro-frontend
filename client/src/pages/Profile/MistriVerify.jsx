import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const MISTRI_SKILLS = [
  'Interior Wall Painting',
  'Exterior Weather Coating',
  'Putty & Primer Finishing',
  'Nona (Salinity) Chemical Treatment',
  'Damp Waterproofing Sealer',
  'Fatol (Crack) Repair',
];

export default function MistriVerify() {
  const { updateUser } = useAuth();
  const { success, error } = useToast();

  const [nidNumber, setNidNumber] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [nidFrontFile, setNidFrontFile] = useState(null);
  const [nidBackFile, setNidBackFile] = useState(null);
  const [statusInfo, setStatusInfo] = useState({ status: 'Unverified', rejectionReason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchVerifyStatus = async () => {
    try {
      const { data } = await api.get('/users/mistri-verify/status');
      if (data) {
        setStatusInfo({
          status: data.status || 'Unverified',
          rejectionReason: data.rejectionReason || '',
        });
        if (data.nidNumber) setNidNumber(data.nidNumber);
        if (Array.isArray(data.skills)) setSelectedSkills(data.skills);
        if (data.status === 'Verified') updateUser({ verifyStatus: true });
      }
    } catch {
      // Initial unverified state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifyStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanNid = nidNumber.replace(/\D/g, '');

    if (![10, 13, 17].includes(cleanNid.length)) {
      error('Enter a valid 10, 13, or 17-digit Bangladesh NID number.');
      return;
    }
    if (selectedSkills.length === 0) {
      error('Select at least one painting or wall repair skill.');
      return;
    }
    if (!nidFrontFile) {
      error('Upload a clear photo of the front side of your NID.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nidNumber', cleanNid);
      formData.append('skills', JSON.stringify(selectedSkills));
      formData.append('nidFront', nidFrontFile);
      if (nidBackFile) formData.append('nidBack', nidBackFile);

      await api.post('/users/mistri-verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('NID documents uploaded (ClamAV scanned) and submitted for verification.');
      fetchVerifyStatus();
    } catch (err) {
      error(err.response?.data?.message || 'Verification submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mistri NID & Skill Verification</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          All uploaded NID photos are scanned by ClamAV Antivirus and EXIF-stripped for security
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo.status === 'Verified' ? (
              <CheckCircle2 size={24} className="text-emerald-600" />
            ) : statusInfo.status === 'Rejected' ? (
              <AlertCircle size={24} className="text-red-600" />
            ) : (
              <Clock size={24} className="text-amber-500" />
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Verification Status</p>
              <p className="text-lg font-bold">{statusInfo.status}</p>
            </div>
          </div>
          <ShieldCheck size={28} className="text-blue-600" />
        </div>

        {statusInfo.status === 'Rejected' && statusInfo.rejectionReason && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <strong>Rejection Reason:</strong> {statusInfo.rejectionReason}
          </div>
        )}
      </Card>

      {statusInfo.status !== 'Verified' && (
        <Card title="Submit Verification Documents">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                National ID (NID) Number (10, 13, or 17 Digits)
              </label>
              <input
                type="text"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter NID Number"
                maxLength={17}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Verified Skills</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MISTRI_SKILLS.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-2 rounded-lg border text-left text-xs font-semibold transition ${
                        active
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NID Front Photo (Required)</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 text-center">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs font-medium truncate max-w-full">
                    {nidFrontFile ? nidFrontFile.name : 'Select Front Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setNidFrontFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">NID Back Photo (Optional)</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 text-center">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs font-medium truncate max-w-full">
                    {nidBackFile ? nidBackFile.name : 'Select Back Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setNidBackFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {submitting ? 'Scanning & Uploading...' : 'Submit NID for Approval'}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
