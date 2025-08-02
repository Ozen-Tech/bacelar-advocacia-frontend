import axios from 'axios';

// Determina se estamos no ambiente de produção da Vercel
const IS_PROD = import.meta.env.PROD;

// Define a baseURL baseada no ambiente
const baseURL = IS_PROD
  ? 'https://bacelar-api.onrender.com' // Sempre HTTPS em produção
  : 'http://localhost:8000';           // HTTP em desenvolvimento

console.log(`[API Service] Ambiente de Produção: ${IS_PROD}. Usando URL base: ${baseURL}`);

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

export default api;