export const APP_NAME = 'TripShare';
export const APP_TAGLINE = 'Share rides, save money, travel together';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

export const TRIP_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'card', label: 'Card' },
];

export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', seats: 4 },
  { value: 'suv', label: 'SUV', seats: 6 },
  { value: 'microbus', label: 'Microbus', seats: 8 },
  { value: 'bike', label: 'Bike', seats: 1 },
];

export const CITIES = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi',
  'Barishal', 'Rangpur', 'Mymensingh', "Cox's Bazar", 'Jessore',
];

export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10, MAX_LIMIT: 100 };

export const FARE = {
  BASE: 50,
  PER_KM: 15,
  PER_MINUTE: 2,
  MIN_FARE: 80,
  SERVICE_FEE_PERCENT: 10,
};

export function calculateFare(distanceKm, durationMin, vehicleType = 'sedan') {
  const multiplier = vehicleType === 'suv' ? 1.3 : vehicleType === 'microbus' ? 1.6 : vehicleType === 'bike' ? 0.6 : 1;
  const fare = (FARE.BASE + distanceKm * FARE.PER_KM + durationMin * FARE.PER_MINUTE) * multiplier;
  return Math.max(Math.round(fare), FARE.MIN_FARE);
}