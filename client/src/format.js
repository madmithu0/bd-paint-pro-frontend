export function formatTaka(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '৳ 0';
  return `৳ ${num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

export function formatTakaDecimal(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '৳ 0.00';
  return `৳ ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatSqft(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0 sqft';
  return `${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })} sqft`;
}

export function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-IN');
}