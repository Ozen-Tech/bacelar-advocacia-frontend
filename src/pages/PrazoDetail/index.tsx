// src/pages/PrazoDetail/index.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import { ArrowLeft, CheckCircle, Clock, FileText, UserCircle } from 'lucide-react';

// Helper de formatação de data mais completo
const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'Data indisponível';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Objeto para mapear o status/ação do histórico para um ícone
const historyIconMap: { [key: string]: React.ElementType } = {
  'Prazo criado.': FileText,
  'Prazo atualizado.': Clock,
  'Prazo concluído.': CheckCircle,
  'Responsável alterado.': UserCircle,
  // Adicione outros ícones para outras ações futuras
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
    return (
      <div>
        <p className="text-red-500">{error || 'Prazo não encontrado.'}</p>
        <Link to="/prazos" className="mt-4 flex items-center space-x-2 text-bacelar-gold hover:underline">
            <ArrowLeft size={16} />
            <span>Voltar para a lista</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 document-watermark">
      <Link to="/prazos" className="flex items-center space-x-2 text-bacelar-gold hover:underline">
        <ArrowLeft size={16} />
        <span>Voltar para a lista de prazos</span>
      </Link>
      
      {/* Container Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna de Detalhes (à esquerda) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className='p-8 rounded-lg bg-bacelar-gray-dark'>
            <h1 className="text-3xl font-light text-white mb-6">Detalhes do Prazo</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-base">
              <div><strong className='block font-medium text-bacelar-gray-light'>Processo:</strong> {deadline.process_number || 'Não informado'}</div>
              <div><strong className='block font-medium text-bacelar-gray-light'>Descrição da Tarefa:</strong> {deadline.task_description || 'Não informado'}</div>
              <div><strong className='block font-medium text-bacelar-gray-light'>Partes:</strong> {deadline.parties || 'Não informado'}</div>
              <div><strong className='block font-medium text-bacelar-gray-light'>Data de Vencimento:</strong> {formatDate(deadline.due_date)}</div>
              <div><strong className='block font-medium text-bacelar-gray-light'>Status:</strong> <span className="capitalize">{deadline.status}</span></div>
              <div><strong className='block font-medium text-bacelar-gray-light'>Responsável:</strong> {deadline.responsible?.name || 'Nenhum'}</div>
            </div>
            <div className='mt-6 pt-6 border-t border-bacelar-gray-light/20'>
              <strong className='block font-medium text-bacelar-gray-light mb-2'>Descrição da Tarefa:</strong>
              <p>{deadline.task_description}</p>
            </div>
          </div>
        </div>

        {/* Coluna do Histórico (à direita) */}
        <div className="lg:col-span-1 p-8 rounded-lg bg-bacelar-gray-dark">
          <h2 className="text-2xl font-light text-white mb-6">Histórico de Alterações</h2>
          <div className="relative border-l-2 border-bacelar-gold/30 pl-8 space-y-10">
              {deadline.history.length > 0 ? (
                deadline.history.map((item) => {
                    const Icon = historyIconMap[item.action_description] || Clock;
                    return (
                        <div key={item.id} className="relative">
                            <div className="absolute -left-[42px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-bacelar-gold text-bacelar-black">
                                <Icon size={18} />
                            </div>
                            <p className="font-bold text-lg text-white">{item.action_description}</p>
                            <p className="text-sm text-bacelar-gray-light">{item.acting_user.name}</p>
                            <p className="text-xs text-bacelar-gray-light/70">{formatDate(item.created_at)}</p>
                        </div>
                    )
                })
              ) : (
                <p className="text-sm text-bacelar-gray-light">Nenhum histórico de alterações encontrado.</p>
              )}
          </div>
        </div>
        
      </div>
    </div>
  );
}