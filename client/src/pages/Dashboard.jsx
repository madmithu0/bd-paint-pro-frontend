import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Wallet, Users, PlusCircle, ArrowUpRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import api from '../api';
import { formatTaka, formatDate } from '../format';
import Card from '../components/Card';
import Chart from '../components/Chart';
import Loading from '../components/Loading';

export default function Dashboard() {
  const { user, role } = useAuth();
  const { error } = useToast();

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalAmount: 0,
    totalTeams: 0,
    recentJobs: [],
    monthlyChart: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const [jobRes, walletRes, teamRes] = await Promise.all([
          api.get('/jobs?limit=5'),
          api.get('/wallet'),
          api.get('/teams'),
        ]);

        if (!active) return;

        const jobs = Array.isArray(jobRes.data?.jobs) ? jobRes.data.jobs : [];
        const totalJobs = jobRes.data?.total ?? jobs.length;
        const totalAmount =
          role === 'Customer'
            ? Number(walletRes.data?.totalSpent || 0)
            : Number(walletRes.data?.totalEarnings || walletRes.data?.balance || 0);
        const teams = Array.isArray(teamRes.data?.teams) ? teamRes.data.teams : [];

        setStats({
          totalJobs,
          totalAmount,
          totalTeams: teams.length,
          recentJobs: jobs.slice(0, 5),
          monthlyChart: Array.isArray(jobRes.data?.monthlyChart) ? jobRes.data.monthlyChart : [],
        });
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load dashboard summary.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [role, error]);

  if (loading) {
    return <Loading variant="skeleton" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Account Role: <span className="font-semibold text-blue-600">{role}</span>
          </p>
        </div>

        {(role === 'Customer' || role === 'Agent') && (
          <Link
            to="/jobs/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition self-start"
          >
            <PlusCircle size={18} />
            <span>Create New Job</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Total Jobs
              </p>
              <p className="text-2xl font-bold mt-1">{stats.totalJobs}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Briefcase size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                {role === 'Customer' ? 'Total Taka Spending' : 'Total Taka Earnings'}
              </p>
              <p className="text-2xl font-bold mt-1">{formatTaka(stats.totalAmount)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
              <Wallet size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Total Teams
              </p>
              <p className="text-2xl font-bold mt-1">{stats.totalTeams}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
              <Users size={22} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Jobs"
          action={
            <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          {stats.recentJobs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 py-6 text-center">
              No recent jobs found.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {stats.recentJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {job.sqft} Sqft • {job.isMistriOnly ? 'Mistri-Only' : 'With Material'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(job.createdAt)} • {job.totalDays} Days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatTaka(job.price)}</p>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-medium">
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Activity Overview">
          <Chart type="bar" data={stats.monthlyChart} />
        </Card>
      </div>
    </div>
  );
}
