import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-extrabold text-blue-600">404</p>
      <h1 className="text-2xl font-bold mt-3 text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mt-2">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
      >
        <Home size={16} />
        <span>Return Home</span>
      </Link>
    </div>
  );
}
