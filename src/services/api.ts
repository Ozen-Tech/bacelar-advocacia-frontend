// src/services/api.ts (VERSÃO DE DEPLOY URGENTE)
import axios from 'axios';

// --- CORREÇÃO DEFINITIVA ---
// Removemos a dependência de variáveis de ambiente do Vercel temporariamente.
// Nós estamos forçando o uso da URL de produção correta.
const baseURL = 'https://bacelar-api.onrender.com';

// Adicionamos um log para termos 100% de certeza do que está sendo usado.
console.log(`[API Service] Conectando à base: ${baseURL}`);

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});
// ----------------------------

// O interceptor de token continua igual.
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;