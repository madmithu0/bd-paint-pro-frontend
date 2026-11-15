import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export default function Loading({
  fullScreen = false,
  variant = 'spinner',
  message = 'Loading...',
  emptyTitle = 'No Data Available',
  emptyDescription = 'There are no records to display right now.',
  action = null,
}) {
  if (variant === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mb-3">
          <Inbox size={24} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{emptyTitle}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mt-1">{emptyDescription}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={`${
        fullScreen ? 'min-h-screen' : 'min-h-[240px]'
      } flex flex-col items-center justify-center gap-3 text-gray-600 dark:text-slate-400`}
    >
      <Loader2 size={32} className="animate-spin text-blue-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
