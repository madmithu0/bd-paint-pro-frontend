import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import SearchBar from '../../components/SearchBar';
import Loading from '../../components/Loading';

export default function ChatList() {
  const { error } = useToast();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/chat');
        if (active) {
          setConversations(Array.isArray(data?.conversations) ? data.conversations : []);
        }
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load chat list.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchConversations();
    return () => {
      active = false;
    };
  }, [error]);

  const filteredChats = conversations.filter((c) => {
    const name = (c.peer?.name || '').toLowerCase();
    return name.includes(filter.toLowerCase());
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Communicate directly with Customers, Mistris, Agents, and Merchants
        </p>
      </div>

      <SearchBar
        value={filter}
        onChange={setFilter}
        placeholder="Filter conversations by user name..."
      />

      {filteredChats.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Active Conversations"
          emptyDescription="Start a chat from any assigned job or team member profile."
        />
      ) : (
        <Card noPadding>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredChats.map((chat) => {
              const peer = chat.peer || {};
              return (
                <Link
                  key={peer._id || chat._id}
                  to={`/chat/${peer._id}`}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{peer.name || 'User'}</p>
                        {peer.role && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-semibold">
                            {peer.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {chat.lastMessage || 'Media attachment'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[11px] text-gray-400">
                      {formatDate(chat.updatedAt)}
                    </span>
                    {chat.unreadCount > 0 ? (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    ) : (
                      <MessageSquare size={14} className="text-gray-300" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
