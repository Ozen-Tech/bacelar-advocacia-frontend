// src/pages/Profile/index.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Input from '../../components/Forms/Input';

export default function ProfilePage() {
  const { user, login } = useAuth(); // Usamos o 'login' para forçar a atualização dos dados do usuário
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Popula o formulário com os dados do usuário do contexto de autenticação
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || ''); // Assume que 'phone' pode ser nulo
    }
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    const payload = { name, email, phone };

    try {
      const response = await api.put('/users/me', payload);
      // Força a atualização dos dados do usuário no AuthContext
      // A função login busca o usuário novamente a partir do token
      const token = localStorage.getItem('authToken');
      if (token) {
        await login(token);
      }
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Falha ao atualizar o perfil', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-5xl font-serif text-bacelar-gold">{user?.name}</h1>
        <p className="text-bacelar-gray-light mt-1">{user?.profile.toUpperCase()}</p>
      </div>
      <div className="border-b border-bacelar-gold/20" />

      <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
        {/* Informações Pessoais */}
        <div className="p-8 bg-bacelar-gray-dark rounded-lg">
          <h2 className="text-xl font-bold mb-6 text-white">INFORMAÇÕES PESSOAIS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {/* Preferências e Ações */}
        <div className="p-8 bg-bacelar-gray-dark rounded-lg">
            <h2 className="text-xl font-bold mb-6 text-white">PREFERÊNCIAS</h2>
            {/* Aqui virão as preferências de notificação, etc. */}
            <p className="text-sm text-bacelar-gray-light">Configurações de notificação em breve.</p>
        </div>
        
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        
        <div className="flex justify-end space-x-4">
            <button type="button" className="px-6 py-2 text-bacelar-gray-light">Cancelar</button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-bacelar-gold px-6 py-2 font-bold text-bacelar-black transition hover:bg-bacelar-gold-light disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </form>
    </div>
  );
}