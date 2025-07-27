import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the local IP address from the Expo output
// Change this to your computer's IP address shown in the Expo output
const BASE_URL = 'http://192.168.0.104:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // Note: Navigation should be handled by the component
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType?: 'PET_OWNER' | 'PET_PILOT';
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  
  refresh: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),
  
  logout: () => 
    api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (data: any) => 
    api.put('/users/profile', data),
  
  getPets: () => 
    api.get('/users/pets'),
  
  getBookings: (params?: any) => 
    api.get('/users/bookings', { params }),
};

// Pet API
export const petAPI = {
  create: (data: any) => 
    api.post('/pets', data),
  
  getAll: () => 
    api.get('/pets'),
  
  getById: (id: string) => 
    api.get(`/pets/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/pets/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/pets/${id}`),
};

// Booking API
export const bookingAPI = {
  create: (data: any) => 
    api.post('/bookings', data),
  
  getAll: (params?: any) => 
    api.get('/bookings', { params }),
  
  getById: (id: string) => 
    api.get(`/bookings/${id}`),
  
  cancel: (id: string) => 
    api.patch(`/bookings/${id}/cancel`),
  
  addMessage: (id: string, message: string) => 
    api.post(`/bookings/${id}/messages`, { message }),
};

export default api;