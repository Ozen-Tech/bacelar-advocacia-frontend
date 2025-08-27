// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // <-- GARANTA QUE ESTA LINHA EXISTA E ESTEJA CORRETA
import './styles/watermark.css' // Estilos de marca d'água
import { AppRouter } from './router';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <AppRouter /> {/* Usa o AppRouter em vez do App */}
    </AuthProvider>
  </React.StrictMode>
);