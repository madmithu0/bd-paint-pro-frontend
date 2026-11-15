export const formatTaka = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return '৳ 0.00';
  return `৳ ${num.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  return date.toLocaleDateString('en-GB', options);
};

export const formatSqft = (sqft) => {
  const num = Number(sqft);
  if (Number.isNaN(num) || num < 0) return '0.00 Sqft';
  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} Sqft`;
};

export const calculateDaysFromSqft = (sqft) => {
  const num = Number(sqft);
  if (Number.isNaN(num) || num <= 0) return '0.00';
  return (num / 450).toFixed(2);
};
