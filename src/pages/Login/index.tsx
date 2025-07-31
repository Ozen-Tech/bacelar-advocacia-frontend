// src/pages/Login/index.tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import publicApi from "../../services/api"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        // e use-a na chamada de login:
        const response = await publicApi.post('/auth/login', formData);
        const { access_token } = response.data;
        await login(access_token);
        navigate('/');
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Falha no login', err);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bacelar-black p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-8 rounded-lg bg-bacelar-gray-dark p-12 shadow-lg">
        
        <div className="text-4xl font-serif text-bacelar-gold">BACELAR</div>
        <div className="text-sm tracking-widest text-white/50">ADVOCACIA</div>

        {/* --- O FORMULÁRIO CORRIGIDO --- */}
        <form className="w-full space-y-8 pt-4" onSubmit={handleSubmit}>
          {/* Campo de Email Simplificado */}
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Estilos corrigidos:
            className="w-full border-0 border-b-2 border-bacelar-gray-light bg-transparent px-1 py-2 text-white placeholder-bacelar-gray-light focus:border-bacelar-gold focus:outline-none focus:ring-0"
            placeholder="E-mail" 
            required
          />

          {/* Campo de Senha Simplificado */}
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Estilos corrigidos:
            className="w-full border-0 border-b-2 border-bacelar-gray-light bg-transparent px-1 py-2 text-white placeholder-bacelar-gray-light focus:border-bacelar-gold focus:outline-none focus:ring-0"
            placeholder="Senha" 
            required
          />
          
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <button 
            type="submit"
            className="w-full rounded-md bg-bacelar-gold px-5 py-3 text-center font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            Login
          </button>
        </form>

        <a href="#" className="text-sm text-bacelar-gray-light hover:text-bacelar-gold">
          Esqueci minha senha
        </a>
      </div>
    </div>
  );
}