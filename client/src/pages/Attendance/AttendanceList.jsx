import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Check, X, ExternalLink } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

export default function AttendanceList() {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get('/attendance');
      setRecords(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApproval = async (id, status) => {
    try {
      await api.put(`/attendance/${id}/approve`, { status });
      success(`Attendance marked as ${status}.`);
      fetchAttendance();
    } catch (err) {
      error(err.response?.data?.message || 'Approval update failed.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/attendance"
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Attendance Logs & GPS Verification</h1>
          <p className="text-xs text-gray-500">
            Review worker check-in photos, GPS map coordinates, and approval status
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Attendance Records"
          emptyDescription="Worker GPS check-ins will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {records.map((item) => {
            const lat = item.gps?.latitude ?? item.latitude;
            const lng = item.gps?.longitude ?? item.longitude;

            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-base">{item.user?.name || 'Mistri Worker'}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.createdAt, true)}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status || 'Pending'}
                  </span>
                </div>

                {item.photo && (
                  <img
                    src={item.photo}
                    alt="Attendance check-in"
                    className="w-full h-44 object-cover rounded-lg my-3 border border-gray-200 dark:border-slate-800"
                  />
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMap({ lat, lng, user: item.user?.name })}
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <MapPin size={14} />
                    <span>
                      {lat && lng ? `${lat}, ${lng}` : 'View GPS Map'}
                    </span>
                  </button>

                  {(role === 'Customer' || role === 'Agent') &&
                    (!item.status || item.status === 'Pending') && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproval(item._id, 'Approved')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproval(item._id, 'Rejected')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedMap)}
        onClose={() => setSelectedMap(null)}
        title={`GPS Location • ${selectedMap?.user || 'Worker'}`}
        hideFooter
      >
        {selectedMap && (
          <div className="space-y-3">
            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800">
              <iframe
                title="Worker GPS Map"
                width="100%"
                height="100%"
                src={`https://google.com{selectedMap.lat},${selectedMap.lng}&z=15&output=embed`}
              />
            </div>
            <a
              href={`https://google.com{selectedMap.lat},${selectedMap.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
