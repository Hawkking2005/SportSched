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
    axios.defaults.headers.common['Authorization'] = `Token ${response.data.key}`;
  }
  return response.data;
};

export const register = async (userData) => {
  return await axios.post(`${API_URL}auth/registration/`, userData);
};

export const logout = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await axios.post(`${API_URL}auth/logout/`, {}, {
        headers: { 'Authorization': `Token ${token}` }
      });
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
};

// Facility services
export const getFacilities = async () => {
  return await api.get('facilities/');
};

export const getFacility = async (id) => {
  return await api.get(`facilities/${id}/`);
};

// Court services
export const getCourt = async (id) => {
  return await api.get(`courts/${id}/`);
};

export const getCourts = async (facilityId) => {
  return await api.get(`facilities/${facilityId}/courts/`);
};

// TimeSlot services
export const getTimeSlots = async (courtId, date) => {
  return await api.get('timeslots/', {
    params: { court_id: courtId, date }
  });
};

// Reservation services
export const createReservation = async (timeSlotId) => {
  return await api.post('reservations/', { time_slot: timeSlotId });
};

export const getReservations = async () => {
  return await api.get('reservations/');
};

export const cancelReservation = async (id) => {
  return await api.delete(`reservations/${id}/`);
};

export default api;