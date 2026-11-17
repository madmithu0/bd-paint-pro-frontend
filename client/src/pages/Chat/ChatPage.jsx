import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Square, CheckCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Loading from '../../components/Loading';

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { error } = useToast();

  const [messages, setMessages] = useState([]);
  const [peerName, setPeerName] = useState('Conversation');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/chat/${userId}`);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (data?.peer?.name) setPeerName(data.peer.name);
      await api.put(`/chat/${userId}/seen`).catch(() => {});
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load chat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      await api.post('/chat/send', {
        receiverId: userId,
        text: text.trim(),
      });
      setText('');
      fetchMessages();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files.item(0);
    if (!file) return;

    const formData = new FormData();
    formData.append('receiverId', userId);
    formData.append('media', file);
    formData.append('mediaType', 'image');

    setSending(true);
    try {
      await api.post('/chat/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMessages();
    } catch (err) {
      error(err.response?.data?.message || 'Photo upload failed.');
    } finally {
      setSending(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('receiverId', userId);
        formData.append('media', audioBlob, 'voice.webm');
        formData.append('mediaType', 'voice');

        setSending(true);
        try {
          await api.post('/chat/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          fetchMessages();
        } catch (err) {
          error(err.response?.data?.message || 'Voice message failed.');
        } finally {
          setSending(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      error('Microphone access denied or unavailable.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[78vh] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3">
        <Link
          to="/chat"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-bold text-base">{peerName}</h2>
          <span className="text-[11px] text-emerald-600 font-medium">Direct Encrypted Chat</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/60 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-12">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = (msg.sender?._id || msg.sender) === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col max-w-[75%] ${isMine ? 'ml-auto items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.mediaUrl && msg.mediaType === 'image' && (
                    <img
                      src={msg.mediaUrl}
                      alt="Chat attachment"
                      className="max-h-48 rounded-lg mb-1.5 object-cover"
                    />
                  )}
                  {msg.mediaUrl && msg.mediaType === 'voice' && (
                    <audio controls src={msg.mediaUrl} className="max-w-[220px] h-9" />
                  )}
                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                </div>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <span>{formatDate(msg.createdAt, true)}</span>
                  {isMine && (
                    <CheckCheck
                      size={13}
                      className={msg.seen ? 'text-blue-500' : 'text-gray-400'}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSendText}
        className="p-3 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
      >
        <label className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer">
          <ImageIcon size={20} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`p-2 rounded-lg transition ${
            recording
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
          title={recording ? 'Stop & Send Voice' : 'Record Voice Message'}
        >
          {recording ? <Square size={18} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
