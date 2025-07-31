// src/services/api.ts
import axios from 'axios';

// --- A CORREÇÃO ESTÁ AQUI ---
// A baseURL precisa ser o endereço completo ATÉ o nosso prefixo de API.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Em dev, a API está em /

// Criamos a instância PRINCIPAL que aponta para o domínio
const rawApi = axios.create({
  baseURL: baseURL,
});

// Criamos uma SEGUNDA instância que opera dentro do nosso prefixo /api/v1
// E que carrega o token de autenticação
const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

// ------------------------------------
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { rawApi }; // Exportamos a instância raw para casos onde o prefixo não é necessário
export default api; // Exportamos a instância com /api/v1 como padrão