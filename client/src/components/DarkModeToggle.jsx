import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store';

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useStore();

  return (
    <button
      type="button"
      onClick={() => setDarkMode((prev) => !prev)}
      aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={darkMode ? 'Light Mode' : 'Dark Mode'}
      className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-700 dark:text-amber-400"
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
