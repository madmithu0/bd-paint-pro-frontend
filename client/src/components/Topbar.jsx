import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';
import api from '../api';

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications?unreadOnly=true');
        if (active && typeof data?.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Ignore transient fetch errors
      }
    };
    fetchUnread();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4">
      <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
          M
        </div>
        <span className="font-bold text-lg hidden sm:inline">MistriPro</span>
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, materials, teams..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </form>

      <div className="flex items-center gap-2.5 shrink-0">
        <LanguageToggle />
        <DarkModeToggle />

        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-700 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm font-medium hidden lg:inline max-w-[110px] truncate">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
