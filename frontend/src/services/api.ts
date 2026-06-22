import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterData, CreateRoomData, Room, User, AuthResponse, ApiResponse } from '../types';

const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${window.location.origin}/api`;
};

const API_URL: string = getApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData: RegisterData): Promise<AxiosResponse<AuthResponse>> => 
    api.post<AuthResponse>('/auth/register', userData),
  
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  getMe: (): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get<ApiResponse<User>>('/auth/me'),
};

export const roomService = {
  list: (): Promise<AxiosResponse<ApiResponse<Room[]>>> => 
    api.get<ApiResponse<Room[]>>('/rooms'),
  
  create: (data: CreateRoomData): Promise<AxiosResponse<ApiResponse<Room>>> => 
    api.post<ApiResponse<Room>>('/rooms', data),
  
  join: (roomId: string): Promise<AxiosResponse<ApiResponse<Room>>> => 
    api.post<ApiResponse<Room>>(`/rooms/join/${roomId}`),
  
  get: (roomId: string): Promise<AxiosResponse<ApiResponse<Room>>> => 
    api.get<ApiResponse<Room>>(`/rooms/${roomId}`),
  
  leave: (roomId: string): Promise<AxiosResponse<ApiResponse<{ message: string }>>> => 
    api.post<ApiResponse<{ message: string }>>(`/rooms/leave/${roomId}`),
};

export default api;