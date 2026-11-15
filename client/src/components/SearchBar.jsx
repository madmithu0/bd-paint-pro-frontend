import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value.trim());
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    if (onSubmit) {
      onSubmit('');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className={`relative w-full ${className}`}>
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear Search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
