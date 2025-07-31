// src/router/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Se ainda estiver carregando a informação de auth, mostra uma tela de loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bacelar-black">
        <p className="text-bacelar-gold">Carregando...</p>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver autenticado, renderiza o Layout Principal
  // que por sua vez renderizará a página da rota atual (Dashboard, Prazos, etc.)
  return <MainLayout />;
}