// src/services/api.ts
import axios from 'axios';

const baseURL = 'https://bacelar-api.onrender.com';

console.log(`[API Service] Conectando à URL: ${baseURL}/api/v1`);

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ajuste simples para o login
const publicApi = axios.create({
    baseURL: `${baseURL}/api/v1`,
});

export { publicApi };
export default api;