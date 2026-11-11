export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function debounce(fn, wait = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, limit = 300) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}

export function deepClone(obj) {
  if (obj == null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function groupBy(arr, keyFn) {
  return (arr || []).reduce((acc, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item?.[keyFn];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function sortBy(arr, key, order = 'asc') {
  return [...(arr || [])].sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function uniqueBy(arr, key) {
  const seen = new Set();
  return (arr || []).filter((item) => {
    const k = typeof key === 'function' ? key(item) : item?.[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(String(text));
  const ta = document.createElement('textarea');
  ta.value = String(text);
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

export function getInitials(name) {
  if (!name) return '?';
  return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function getAvatarColor(name) {
  const colors = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#DB2777', '#0891B2'];
  let hash = 0;
  for (const ch of String(name || '')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}