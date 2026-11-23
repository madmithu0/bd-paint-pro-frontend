import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Square, CheckCheck, Lock, CreditCard } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Loading from '../../components/Loading';
import HotlineWidget from '../../components/HotlineWidget';

export default function ChatPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const { user } = useAuth();
  const { error } = useToast();

  const [messages, setMessages] = useState([]);
  const [peerName, setPeerName] = useState('Conversation');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const query = jobId ? `?jobId=${encodeURIComponent(jobId)}` : '';
      const { data } = await api.get(`/chats/${userId}${query}`);
      setIsChatLocked(false);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (data?.peer?.name) setPeerName(data.peer.name);
      await api.patch(`/chats/seen/${userId}`).catch(() => {});
    } catch (err) {
      if (err.response?.status === 402 || err.response?.data?.locked) {
        setIsChatLocked(true);
        setLockMessage(
          err.response?.data?.message ||
            '30% advance payment is required before unlocking Mistri phone number and chatbox.'
        );
      } else {
        error(err.response?.data?.message || 'Failed to load chat.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, jobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || isChatLocked) return;

    setSending(true);
    try {
      await api.post('/chats/send', {
        receiverId: userId,
        jobId: jobId || undefined,
        message: text.trim(),
        text: text.trim(),
      });
      setText('');
      fetchMessages();
    } catch (err) {
      if (err.response?.status === 402 || err.response?.data?.locked) {
        setIsChatLocked(true);
      } else {
        error(err.response?.data?.message || 'Failed to send message.');
      }
    } finally {
      setSending(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files.item(0);
    if (!file || isChatLocked) return;

    const formData = new FormData();
    formData.append('receiverId', userId);
    if (jobId) formData.append('jobId', jobId);
    formData.append('media', file);
    formData.append('mediaType', 'image');
    setSending(true);
    try {
      await api.post('/chats/send', formData, {
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
    if (isChatLocked) return;
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
        if (jobId) formData.append('jobId', jobId);
        formData.append('media', audioBlob, 'voice.webm');
        formData.append('mediaType', 'voice');

        setSending(true);
        try {
          await api.post('/chats/send', formData, {
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
          <span className="text-[11px] text-emerald-600 font-medium">
            {isChatLocked ? 'Locked Pending 30% Advance' : 'Direct Encrypted Chat'}
          </span>
        </div>
      </div>

      {isChatLocked ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 dark:bg-slate-950/60">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock size={28} />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Chat & Contact Number Locked
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {lockMessage}
            </p>
          </div>
          {jobId && (
            <Link
              to={`/payment/advance/${jobId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
            >
              <CreditCard size={16} />
              <span>Pay 30% Advance to Unlock Now</span>
            </Link>
          )}
          <div className="w-full max-w-md pt-2">
            <HotlineWidget
              compact={true}
              contextMessage={`Hello, my chat is locked for Job ID ${jobId || 'N/A'}. Please assist with 30% advance.`}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/60 dark:bg-slate-950/40">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMine = (msg.sender?._id || msg.sender) === user?._id;
                const displayText = msg.text || msg.message;
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
                      {displayText && <p className="whitespace-pre-wrap break-words">{displayText}</p>}
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
        </>
      )}
    </div>
  );
}
