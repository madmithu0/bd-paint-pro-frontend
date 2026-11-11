import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | job | support

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chats', { params: { filter: filter === 'all' ? '' : filter } });
      setChats(data?.chats || data?.conversations || data || []);
    } catch {
      toast.error('Chat List Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchChats(); }, [filter]);

  const filtered = chats.filter((c) => {
    const name = c.otherUser?.name || c.participant?.name || c.title || '';
    const lastMsg = c.lastMessage?.text || c.lastMessage || '';
    return (name + lastMsg).toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = chats.reduce((s, c) => s + (c.unreadCount || 0), 0);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Chats {totalUnread > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread} Unread</span>}</h1>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Chat..." className="w-full border rounded-lg p-3 mb-3" />

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {['all', 'unread', 'job', 'support'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-5xl">💬</p>
          <p className="text-gray-400 mt-2">কোনো Chat নাই</p>
          <Link to="/jobs" className="text-blue-600 text-sm">Job দেখে Chat শুরু করুন</Link>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((chat) => {
          const other = chat.otherUser || chat.participant || {};
          const chatId = chat._id || chat.chatId;
          return (
            <Link key={chatId} to={`/chats/${chatId}`} className={`bg-white rounded-xl shadow p-3 flex gap-3 items-center ${chat.unreadCount > 0 ? 'border-l-4 border-blue-600' : ''}`}>
              <div className="relative">
                <img src={other.avatar || 'https://via.placeholder.com/48'} className="w-12 h-12 rounded-full object-cover" alt="" />
                {other.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-bold truncate">{other.name || chat.title || 'Chat'}</p>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage?.text || chat.lastMessage || 'No message yet'} {chat.jobTitle ? `• ${chat.jobTitle}` : ''}</p>
                <p className="text-xs text-gray-400">{chat.type || 'Job Chat'} • {chat.jobId ? `Job: ${chat.jobId}` : ''}</p>
              </div>
              {chat.unreadCount > 0 && <span className="bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">{chat.unreadCount}</span>}
            </Link>
          );
        })}
      </div>

      {/* New Chat Button */}
      <Link to="/support" className="fixed bottom-20 right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg">+</Link>
    </div>
  );
};

export default ChatList;