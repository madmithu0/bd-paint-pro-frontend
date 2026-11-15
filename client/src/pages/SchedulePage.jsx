import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import useToast from '../hooks/useToast';
import api from '../api';
import { formatDate } from '../format';
import Card from '../components/Card';
import Loading from '../components/Loading';

export default function SchedulePage() {
  const { success, error } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({ jobId: '', date: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [schedRes, jobRes] = await Promise.all([api.get('/schedules'), api.get('/jobs')]);
      setSchedules(Array.isArray(schedRes.data?.schedules) ? schedRes.data.schedules : []);
      setJobs(Array.isArray(jobRes.data?.jobs) ? jobRes.data.jobs : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.jobId || !formData.date) {
      error('Select a job and scheduled date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/schedules', formData);
      success('Job schedule added.');
      setFormData({ jobId: '', date: '', note: '' });
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/schedules/${id}`, { status });
      success('Schedule status updated.');
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Update failed.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Work Schedule & Timeline</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Plan and track daily work slots across assigned jobs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Add Schedule Slot">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Job</label>
              <select
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                required
              >
                <option value="">-- Choose Job --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.sqft} Sqft ({job.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Work Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Task Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="e.g., Wall scraping & primer coat"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              <Plus size={16} />
              <span>{submitting ? 'Saving...' : 'Schedule Job'}</span>
            </button>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card title="Scheduled Calendar List">
            {schedules.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No scheduled slots found.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {schedules.map((item) => (
                  <div key={item._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 mt-0.5">
                        <CalendarIcon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{formatDate(item.date)}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {item.note || 'Standard 450 Sqft daily work slot'}
                        </p>
                      </div>
                    </div>

                    <select
                      value={item.status || 'Scheduled'}
                      onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
