// src/pages/PrazoDetail/index.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import { ArrowLeft } from 'lucide-react';

// Reutilizamos a função de formatar data
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PrazoDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const [deadline, setDeadline] = useState<DeadlinePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDeadline = async () => {
      try {
        setLoading(true);
        const response = await api.get<DeadlinePublic>(`/deadlines/${id}`);
        setDeadline(response.data);
      } catch (err) {
        setError('Não foi possível carregar os detalhes do prazo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadline();
  }, [id]);

  if (loading) {
    return <p className="text-bacelar-gold">Carregando detalhes do prazo...</p>;
  }

  if (error || !deadline) {
    return <p className="text-red-500">{error || 'Prazo não encontrado.'}</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <Link to="/prazos" className="flex items-center space-x-2 text-bacelar-gold hover:underline">
        <ArrowLeft size={16} />
        <span>Voltar para a lista</span>
      </Link>
      
      {/* Detalhes do Prazo */}
      <div className='p-6 rounded-lg bg-bacelar-gray-dark'>
        <h1 className="text-3xl font-light text-white">Detalhes do Prazo</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><span className='text-bacelar-gray-light'>Processo:</span> {deadline.process_number}</div>
          <div><span className='text-bacelar-gray-light'>Tipo:</span> {deadline.type}</div>
          <div><span className='text-bacelar-gray-light'>Partes:</span> {deadline.parties}</div>
          <div><span className='text-bacelar-gray-light'>Vencimento:</span> {formatDate(deadline.due_date)}</div>
          <div><span className='text-bacelar-gray-light'>Status:</span> {deadline.status}</div>
          <div><span className='text-bacelar-gray-light'>Responsável:</span> {deadline.responsible?.name || 'N/A'}</div>
        </div>
        <p className="mt-4"><span className='text-bacelar-gray-light'>Descrição:</span> {deadline.task_description}</p>
      </div>

      {/* Histórico de Alterações */}
      <div>
        <h2 className="text-2xl font-light text-white mb-4">Histórico de Alterações</h2>
        <div className="relative border-l-2 border-bacelar-gold/30 pl-6 space-y-8">
            {deadline.history.map((item, index) => (
                <div key={item.id} className="relative">
                    <div className="absolute -left-[34px] top-1 h-4 w-4 rounded-full bg-bacelar-gold" />
                    <p className="font-bold text-lg text-white">{item.action_description}</p>
                    <p className="text-sm text-bacelar-gray-light">{item.acting_user.name}</p>
                    <p className="text-xs text-bacelar-gray-light/70">{formatDate(item.created_at)}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}