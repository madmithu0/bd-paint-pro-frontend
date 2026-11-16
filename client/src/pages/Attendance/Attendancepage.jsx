import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Camera, CheckCircle2, ListChecks } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function AttendancePage() {
  const { success, error } = useToast();

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchActiveJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        if (!active) return;
        const activeJobs = Array.isArray(data?.jobs)
          ? data.jobs.filter((j) => ['Assigned', 'In Progress'].includes(j.status))
          : [];
        setJobs(activeJobs);
        if (activeJobs.length > 0) setJobId(activeJobs[0]._id);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load assigned jobs.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchActiveJobs();
    return () => {
      active = false;
    };
  }, [error]);

  const captureGpsLocation = () => {
    if (!navigator.geolocation) {
      error('GPS geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
        });
        setGpsLoading(false);
        success('Live GPS coordinates captured.');
      },
      () => {
        setGpsLoading(false);
        error('Unable to capture GPS location. Please enable location permission.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!jobId) {
      error('Select an active job first.');
      return;
    }
    if (!coords) {
      error('Capture live GPS location before submitting attendance.');
      return;
    }
    if (!photo) {
      error('Upload a live work-site selfie/photo.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('photo', photo);

      await api.post('/attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Daily GPS attendance check-in recorded.');
      setPhoto(null);
      setPreviewUrl('');
    } catch (err) {
      error(err.response?.data?.message || 'Attendance check-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Worker GPS Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Verify work-site presence with live GPS coordinates and site photo
          </p>
        </div>

        <Link
          to="/attendance/list"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 self-start"
        >
          <ListChecks size={16} />
          <span>Attendance Records</span>
        </Link>
      </div>

      <Card title="Daily Site Check-In">
        <form onSubmit={handleCheckIn} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Active Assigned Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              required
            >
              <option value="">-- Select Active Job --</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.sqft} Sqft • {job.address || job._id.slice(-6)}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin size={16} className="text-blue-600" />
                <span>Live GPS Location</span>
              </p>
              {coords ? (
                <p className="text-xs font-mono text-emerald-600 mt-1">
                  Lat: {coords.lat}, Lng: {coords.lng} (±{coords.accuracy}m)
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Coordinates not captured yet</p>
              )}
            </div>

            <button
              type="button"
              onClick={captureGpsLocation}
              disabled={gpsLoading}
              className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {gpsLoading ? 'Locating...' : coords ? 'Refresh GPS' : 'Capture GPS'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Work Site Photo Proof</label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 transition">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Site proof preview"
                  className="max-h-48 rounded-lg object-cover"
                />
              ) : (
                <div className="text-center space-y-1">
                  <Camera size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
                    Tap to capture or upload site photo
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !coords || !photo}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 size={18} />
            <span>{submitting ? 'Submitting Attendance...' : 'Submit Check-In'}</span>
          </button>
        </form>
      </Card>
    </div>
  );
}
