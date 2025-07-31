// src/services/api.ts (VERSÃO FINAL DE PRODUÇÃO)
import axios from 'axios';

// FORÇAMOS a URL correta e segura do backend em produção.
const baseURL = 'https://bacelar-api.onrender.com';

// Log para depuração no console do navegador.
console.log(`[API Service] Base URL configurada para: ${baseURL}`);

// Instância para requisições públicas (login)
const publicApi = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

// Instância para requisições privadas (que precisam de token)
const privateApi = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

// Interceptor que adiciona o token de autenticação em cada chamada da `privateApi`
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { publicApi };
export default privateApi; // Exporta a instância privada como padrão