// src/services/api.ts
import axios from 'axios';

// --- A MUDANÇA ESSENCIAL ESTÁ AQUI ---

// Pega a URL da variável de ambiente.
const apiUrlFromEnv = import.meta.env.VITE_API_BASE_URL;

// Lógica de decisão explícita:
// Se a variável de ambiente NÃO for definida, nós FORÇAMOS a URL de produção,
// pois o localhost só existe em desenvolvimento.
const baseURL = apiUrlFromEnv || 'https://bacelar-api.onrender.com';

console.log(`[API Service] Conectando à URL base: ${baseURL}`);

const api = axios.create({
  baseURL: `${baseURL}/api/v1`, // Adicionamos o /api/v1 aqui
});
// ----------------------------------------

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;