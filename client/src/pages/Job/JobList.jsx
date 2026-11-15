import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, Layers } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function JobList() {
  const { role } = useAuth();
  const { success, error } = useToast();
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const { data } = await api.get('/jobs', { params });
      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}/status`, { status: newStatus });
      success(`Job status updated to ${newStatus}.`);
      fetchJobs();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/assign`);
      success('Job accepted and assigned.');
      fetchJobs();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to accept job.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Track slot divisions, Mistri counts, per-Mistri equal shares, and live status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {(role === 'Customer' || role === 'Agent') && (
            <Link
              to="/jobs/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              <PlusCircle size={16} />
              <span>Create Job</span>
            </Link>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Jobs Found"
          emptyDescription="No jobs match the selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => {
            const mistriCount = Math.max(Number(job.mistriCount) || 1, 1);
            const totalMistriPool = Number(job.price || 0) * 0.8;
            const perMistriShare = totalMistriPool / mistriCount;
            const slotCount = Math.max(Math.ceil((Number(job.sqft) || 0) / 450), 1);

            return (
              <Card key={job._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">{job.sqft} Sqft</span>
                      {job.isMistriOnly && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">
                          Mistri-Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(job.createdAt)} • {job.totalDays || (job.sqft / 450).toFixed(2)} Days
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Layers size={12} /> Slots
                    </span>
                    <p className="font-bold mt-0.5">{slotCount} Slots</p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Users size={12} /> Mistris
                    </span>
                    <p className="font-bold mt-0.5">{mistriCount} Assigned</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Per-Mistri (80%)</span>
                    <p className="font-bold text-emerald-600 mt-0.5">{formatTaka(perMistriShare)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                  <span className="font-bold text-base text-blue-600">{formatTaka(job.price)}</span>

                  <div className="flex items-center gap-2">
                    {role === 'Mistri' && job.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptJob(job._id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Accept Job
                      </button>
                    )}

                    {(role === 'Mistri' || role === 'Agent') &&
                      ['Assigned', 'In Progress'].includes(job.status) && (
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}

                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
