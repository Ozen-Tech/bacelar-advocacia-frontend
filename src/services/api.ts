// src/services/api.ts (VERSÃO FINAL E À PROVA DE FALHAS)
import axios from 'axios';

// 1. Obtém a variável de ambiente. Ela será uma string ou `undefined`.
const envBaseURL = import.meta.env.VITE_API_BASE_URL;

// 2. Lógica de decisão explícita para definir a URL base.
//    - Se a variável do ambiente existe E não é uma string vazia, use-a.
//    - Caso contrário, use a URL de desenvolvimento.
const baseURL = envBaseURL && envBaseURL !== ''
  ? envBaseURL
  : 'http://localhost:8000';

// 3. Imprimimos no console qual URL foi escolhida. Isso é essencial para depuração.
console.log(`[API Service] Base URL: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL, // Usamos a URL base que definimos acima.
});

// O interceptor adicionará o token a todas as requisições
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Garantimos que a URL completa começa com /api/v1
    config.url = `/api/v1${config.url}`;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


// Interceptor para requisições que não precisam de autenticação, como o login.
const publicApi = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

export { publicApi };
export default api;