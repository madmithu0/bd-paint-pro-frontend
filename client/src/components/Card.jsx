import React from 'react';

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}
