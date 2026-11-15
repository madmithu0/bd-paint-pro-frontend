import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Wallet,
  MessageSquare,
  MapPin,
  Package,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/jobs/create', label: 'Create Job', icon: PlusCircle, roles: ['Customer', 'Agent'] },
    { to: '/jobs', label: 'Jobs', icon: Briefcase, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/teams', label: 'Teams', icon: Users, roles: ['Mistri', 'Agent'] },
    { to: '/wallet', label: 'Wallet', icon: Wallet, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/chat', label: 'Messages', icon: MessageSquare, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/attendance', label: 'Attendance', icon: MapPin, roles: ['Mistri', 'Agent'] },
    { to: '/materials', label: 'Materials', icon: Package, roles: ['Customer', 'Mistri', 'Merchant'] },
    { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['Customer', 'Mistri', 'Agent'] },
    { to: '/invoices', label: 'Invoices', icon: FileText, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
    { to: '/profile/mistri-verify', label: 'NID Verify', icon: UserCheck, roles: ['Mistri'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['Customer', 'Mistri', 'Agent', 'Merchant'] },
  ];

  const allowedItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-200 select-none`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-slate-800">
        {!collapsed && (
          <div className="truncate">
            <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
              {user?.role}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
