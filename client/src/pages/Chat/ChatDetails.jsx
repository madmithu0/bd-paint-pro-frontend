import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ChatDetails = () => {
  const { id } = useParams(); // Chat ID
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState(null);
  const bottomRef = useRef(null);
  const currentUserId = localStorage.getItem('userId') || '';

  const fetchChat = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chats/${id}`);
      setChat(data?.chat || data);
      setMessages(data?.messages || data?.chat?.messages || []);
      // Mark as Read
      await api.put(`/chats/${id}/read`).catch(() => {});
    } catch {
      toast.error('Chat Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchChat(); }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling - 5 sec পর পর নতুন Message Check
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const { data } = await api.get(`/chats/${id}/messages`);
        if (data?.messages) setMessages(data.messages);
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [id]);

  const handleSend = async () => {
    if (!text.trim() && !image) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('text', text);
      if (image) fd.append('image', image);
      const { data } = await api.post(`/chats/${id}/messages`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages([...messages, data?.message || data]);
      setText('');
      setImage(null);
    } catch {
      toast.error('Message Send Failed');
    } finally { setSending(false); }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!chat) return <div className="p-4 text-center">Chat পাওয়া যায়নি</div>;

  const other = chat.otherUser || chat.participant || {};

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-white shadow sticky top-0 z-10">
        <Link to="/chats" className="text-blue-600">←</Link>
        <img src={other.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="" />
        <div className="flex-1">
          <p className="font-bold">{other.name || chat.title || 'Chat'}</p>
          <p className="text-xs text-gray-500">{other.isOnline ? '🟢 Online' : 'Offline'} {chat.jobTitle ? `• ${chat.jobTitle}` : ''}</p>
        </div>
        <a href={`tel:${other.phone}`} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">📞 Call</a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Message নাই - Hi লিখে শুরু করুন 👋</p>}
        {messages.map((m) => {
          const isMe = (m.senderId?._id || m.senderId) === currentUserId || m.isMe;
          return (
            <div key={m._id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white shadow rounded-bl-none'}`}>
                {m.image && <img src={m.image} className="w-40 h-40 object-cover rounded-lg mb-1" alt="" />}
                {m.text && <p>{m.text}</p>}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-3 border-t space-y-2">
        {image && (
          <div className="flex items-center gap-2">
            <img src={URL.createObjectURL(image)} className="w-12 h-12 object-cover rounded" alt="" />
            <button onClick={() => setImage(null)} className="text-red-500 text-sm">Remove</button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="bg-gray-100 px-3 py-2 rounded-full cursor-pointer">📷<input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files[0])} /></label>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Message লিখুন..." className="flex-1 border rounded-full px-4 py-2" />
          <button onClick={handleSend} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold disabled:opacity-50">Send</button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['Hi, কাজ কখন শুরু করবেন?', 'Price কত?', 'আজ আসতে পারবেন?', 'Photo পাঠান'].map((q) => (
            <button key={q} onClick={() => setText(q)} className="whitespace-nowrap bg-gray-100 px-3 py-1 rounded-full text-xs">{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;