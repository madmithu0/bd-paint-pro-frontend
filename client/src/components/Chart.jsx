import React from 'react';

const DEFAULT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Chart({ type = 'bar', data = [], height = 200 }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
        No chart data available
      </div>
    );
  }

  const maxVal = Math.max(...safeData.map((d) => Number(d.value) || 0), 1);
  const totalVal = safeData.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 1;

  if (type === 'pie' || type === 'doughnut') {
    let cumulativePercent = 0;
    const gradientSegments = safeData.map((item, idx) => {
      const val = Number(item.value) || 0;
      const percent = (val / totalVal) * 100;
      const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      const start = cumulativePercent;
      cumulativePercent += percent;
      return `${color} ${start.toFixed(2)}% ${cumulativePercent.toFixed(2)}%`;
    });

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div
          className="relative w-40 h-40 rounded-full shrink-0"
          style={{ background: `conic-gradient(${gradientSegments.join(', ')})` }}
        >
          {type === 'doughnut' && (
            <div className="absolute inset-7 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200">
                {totalVal.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 w-full max-w-xs">
          {safeData.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = ((val / totalVal) * 100).toFixed(1);
            const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <div key={item.label || idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="truncate text-gray-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                  {val.toLocaleString()} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const width = 400;
    const points = safeData
      .map((item, idx) => {
        const x = safeData.length === 1 ? width / 2 : (idx / (safeData.length - 1)) * (width - 40) + 20;
        const y = height - 30 - ((Number(item.value) || 0) / maxVal) * (height - 50);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {safeData.map((item, idx) => {
            const x = safeData.length === 1 ? width / 2 : (idx / (safeData.length - 1)) * (width - 40) + 20;
            const y = height - 30 - ((Number(item.value) || 0) / maxVal) * (height - 50);
            return (
              <g key={item.label || idx}>
                <circle cx={x} cy={y} r="4" fill="#2563eb" />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-slate-400 text-[10px]"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="flex items-end gap-3 px-2" style={{ height: `${height}px` }}>
        {safeData.map((item, idx) => {
          const val = Number(item.value) || 0;
          const heightPct = Math.max((val / maxVal) * 100, 4);
          const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          return (
            <div key={item.label || idx} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                {val.toLocaleString()}
              </span>
              <div
                className="w-full max-w-[42px] rounded-t-md transition-all duration-300"
                style={{ height: `${heightPct}%`, backgroundColor: color }}
              />
              <span className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5 truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
