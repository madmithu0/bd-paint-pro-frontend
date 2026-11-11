export function formatCurrency(amount, currency = 'BDT', locale = 'en-BD') {
  const n = Number(amount) || 0;
  if (currency === 'BDT') return `৳${n.toLocaleString(locale)}`;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString(locale)}`;
  }
}

export function formatNumber(n, decimals = 0) {
  return (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

export function formatPercent(value, decimals = 1) {
  return `${(Number(value) || 0).toFixed(decimals)}%`;
}

export function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('01')) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return String(phone);
}

export function truncate(str, max = 50) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? `${s.slice(0, max)}...` : s;
}

export function capitalize(str) {
  if (!str) return '';
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}