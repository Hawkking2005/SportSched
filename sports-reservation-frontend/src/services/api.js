// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}auth/login/`, { username, password });
  if (response.data.key) {
    localStorage.setItem('token', response.data.key);
  }
  return response.data;
};

export const register = async (userData) => {
  return await axios.post(`${API_URL}auth/registration/`, userData);
};

export const logout = async () => {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}auth/logout/`, {}, {
    headers: { Authorization: `Token ${token}` }
  });
  localStorage.removeItem('token');
};

// Facility services
export const getFacilities = async () => {
  return await api.get('facilities/');
};

export const getFacility = async (id) => {
  return await api.get(`facilities/${id}/`);
};

// TimeSlot services
export const getTimeSlots = async (facilityId, date) => {
  return await api.get('timeslots/', {
    params: { facility_id: facilityId, date }
  });
};

// Reservation services
export const createReservation = async (timeSlotId) => {
  return await api.post('reservations/', { time_slot: timeSlotId });
};

export const getMyReservations = async () => {
  return await api.get('reservations/');
};

export const cancelReservation = async (id) => {
  return await api.delete(`reservations/${id}/`);
};

export default api;