// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

// Definimos os tipos de dados para o usuário e o contexto
interface User {
  id: string;
  name: string;
  email: string;
  profile: 'admin' | 'advogado' | 'estagiario';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// O Provedor do Contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar os dados do usuário ao iniciar a aplicação
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const fetchUser = async () => {
    try {
      const response = await api.get<User>('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Falha ao buscar usuário, token inválido.', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('authToken', token);
    await fetchUser(); // Busca os dados do usuário após o login
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}