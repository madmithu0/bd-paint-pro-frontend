export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

export const isPhoneBD = (v) => /^01[3-9]\d{8}$/.test(String(v || '').replace(/[\s-]/g, ''));

export const isStrongPassword = (v) => {
  const s = String(v || '');
  return s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s);
};

export const isURL = (v) => {
  try {
    const u = new URL(String(v));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isEmpty = (v) => {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
};

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword, phone }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  else if (!isStrongPassword(password)) errors.password = 'Password must be 8+ chars with uppercase, lowercase & number';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (phone && !isPhoneBD(phone)) errors.phone = 'Invalid Bangladeshi phone number';
  return errors;
}

export function validateBooking({ pickup, dropoff, date, passengers }) {
  const errors = {};
  if (!pickup?.trim()) errors.pickup = 'Pickup location is required';
  if (!dropoff?.trim()) errors.dropoff = 'Drop-off location is required';
  if (!date) errors.date = 'Date is required';
  else if (new Date(date) < new Date()) errors.date = 'Date cannot be in the past';
  if (passengers != null && (passengers < 1 || passengers > 8)) errors.passengers = 'Passengers must be 1-8';
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0;
}