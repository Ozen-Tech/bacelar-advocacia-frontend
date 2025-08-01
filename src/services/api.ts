// src/services/api.ts
import axios from 'axios';

// A única "fonte da verdade". A URL base COMPLETA da nossa API.
const baseURL = 'https://bacelar-api.onrender.com/api/v1';

// Log para depuração, sempre útil
console.log(`[API Service] URL base configurada para: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
});

// O interceptor adiciona o token a TODAS as requisições enviadas por esta instância.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;