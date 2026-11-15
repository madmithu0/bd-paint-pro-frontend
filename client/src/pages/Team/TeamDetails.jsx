import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, ShieldCheck } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function TeamDetails() {
  const { id } = useParams();
  const { error } = useToast();
  const [team, setTeam] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/teams/${id}`);
        if (!active) return;
        setTeam(data?.team || null);
        setAssignedJobs(Array.isArray(data?.jobs) ? data.jobs : []);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load team details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDetails();
    return () => {
      active = false;
    };
  }, [id, error]);

  if (loading) {
    return <Loading />;
  }

  if (!team) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Team Not Found"
        emptyDescription="The requested team could not be located."
      />
    );
  }

  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/teams"
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Created on {formatDate(team.createdAt)} • Equal 80% Mistri Split Active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Team Leader</p>
          <p className="text-base font-bold mt-1 flex items-center gap-1.5">
            <ShieldCheck size={17} className="text-blue-600" />
            <span>{team.leader?.name || 'N/A'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{team.leader?.phone}</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Roster</p>
          <p className="text-2xl font-bold mt-1">{members.length} Mistris</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Assigned Jobs</p>
          <p className="text-2xl font-bold mt-1">{assignedJobs.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Team Members" action={<Users size={18} className="text-blue-600" />}>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No members in roster.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {members.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{m.phone}</p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                    {m.verifyStatus ? 'NID Verified' : 'Pending Verify'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Assigned Jobs" action={<Briefcase size={18} className="text-blue-600" />}>
          {assignedJobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs assigned to this team yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {assignedJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="text-sm font-semibold">{job.sqft} Sqft</p>
                    <p className="text-xs text-gray-500">{job.totalDays} Days • {job.status}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{formatTaka(job.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
