import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, UserMinus, Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function TeamList() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/teams');
      setTeams(Array.isArray(data?.teams) ? data.teams : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeLeader = async (teamId, newLeaderId) => {
    try {
      await api.put(`/teams/${teamId}/leader`, { leaderId: newLeaderId });
      success('Team leader updated.');
      fetchTeams();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change team leader.');
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      success('Member removed from team.');
      fetchTeams();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mistri Teams</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Manage team rosters, assign leaders, and coordinate equal-share jobs
          </p>
        </div>

        <Link
          to="/teams/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold self-start"
        >
          <Plus size={18} />
          <span>New Team</span>
        </Link>
      </div>

      {teams.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Teams Found"
          emptyDescription="Create a Mistri team to collaborate on larger Sqft jobs."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((team) => {
            const isLeader = team.leader?._id === user?._id || team.leader === user?._id;
            const members = Array.isArray(team.members) ? team.members : [];

            return (
              <Card
                key={team._id}
                title={team.name}
                subtitle={`Leader: ${team.leader?.name || 'Assigned'} • ${members.length} Members`}
                action={
                  <Link
                    to={`/teams/${team._id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Details →
                  </Link>
                }
              >
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5">
                    <Users size={13} />
                    <span>Member Roster</span>
                  </p>

                  {members.length === 0 ? (
                    <p className="text-xs text-gray-500">No members added yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {members.map((member) => {
                        const mId = member._id || member;
                        const isMemberLeader = mId === (team.leader?._id || team.leader);

                        return (
                          <div key={mId} className="py-2 flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{member.name || member.phone || mId}</span>
                              {isMemberLeader && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                  LEADER
                                </span>
                              )}
                            </div>

                            {isLeader && !isMemberLeader && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleChangeLeader(team._id, mId)}
                                  title="Promote to Leader"
                                  className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                                >
                                  <Shield size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(team._id, mId)}
                                  title="Remove Member"
                                  className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                                >
                                  <UserMinus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
