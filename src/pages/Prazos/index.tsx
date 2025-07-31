// src/pages/Prazos/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // O import já estava aqui, perfeito!
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import Input from '../../components/Forms/Input';
import Select from '../../components/Forms/Select';
import Modal from '../../components/Shared/Modal'; 
import DeadlineForm from '../../components/Prazos/DeadlineForm'; 

// Helper para formatar a data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function PrazosPage() {
  const [prazos, setPrazos] = useState<DeadlinePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<DeadlinePublic | null>(null);

  // Estados para os Filtros
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [responsavel, setResponsavel] = useState('');

  // Lógica de busca de dados
  const fetchPrazos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: search,
        type: tipo,
        responsible_id: responsavel,
      });

      params.forEach((value, key) => {
        if (!value) params.delete(key);
      });

      const response = await api.get<DeadlinePublic[]>(`/deadlines?${params.toString()}`);
      setPrazos(response.data);
    } catch (err) {
      setError('Não foi possível carregar os prazos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrazos();
  }, []);

  const handleFilter = () => {
    fetchPrazos();
  };
  
  const handleOpenCreateModal = () => {
    setEditingDeadline(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (deadline: DeadlinePublic) => {
    setEditingDeadline(deadline);
    setIsModalOpen(true);
  };
  
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchPrazos(); 
  };
  
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fatal':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'critico': // A palavra 'crítico' do seu enum no backend pode chegar sem acento
      case 'crítico':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'concluido':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default:
        return 'bg-bacelar-gray-dark text-bacelar-gray-light border border-bacelar-gray-light/20';
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-light text-white">LISTA DE PRAZOS</h1>
          <button 
            onClick={handleOpenCreateModal}
            className="rounded-md bg-bacelar-gold px-4 py-2 font-semibold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            + Novo Prazo
          </button>
        </div>
        <div className="border-b border-bacelar-gold/20" />

        {/* FILTROS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input 
            placeholder="Pesquisar por processo ou tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos os Tipos</option>
            <option value="Recurso">Recurso</option>
            <option value="Manifestação">Manifestação</option>
            <option value="Contestação">Contestação</option>
            <option value="Embargos">Embargos</option>
          </Select>
          <Select value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
            <option value="">Todos os Responsáveis</option>
          </Select>
          <button 
            onClick={handleFilter}
            className="rounded-md bg-bacelar-gold px-5 py-2 text-center font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            FILTRAR
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-bacelar-gray-light/20 text-bacelar-gray-light">
              <tr>
                <th scope="col" className="px-6 py-4">Processo</th>
                <th scope="col" className="px-6 py-4">Tipo de Prazo</th>
                <th scope="col" className="px-6 py-4">Data de Vencimento</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Carregando prazos...</td></tr>
              ) : error ? (
                 <tr><td colSpan={5} className="text-center py-8 text-red-500">{error}</td></tr>
              ) : prazos.map(prazo => (
                <tr key={prazo.id} className="border-b border-bacelar-gray-dark hover:bg-bacelar-gray-dark/50">
                  <td className="whitespace-nowrap px-6 py-4 font-mono">{prazo.process_number || 'N/A'}</td>
                  <td className="whitespace-nowrap px-6 py-4">{prazo.type || 'N/A'}</td>
                  <td className="whitespace-nowrap px-6 py-4">{formatDate(prazo.due_date.toString())}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(prazo.classification)}`}>
                      {prazo.classification.toUpperCase()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 space-x-2">
                    <button 
                      onClick={() => handleOpenEditModal(prazo)}
                      className="border border-bacelar-gold/50 px-4 py-1 text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold text-xs rounded"
                    >
                      EDITAR
                    </button>

                    {/* --- A MUDANÇA ESTÁ AQUI --- */}
                    <Link 
                        to={`/prazos/${prazo.id}`} 
                        className="inline-block border border-bacelar-gold/50 px-4 py-1 text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold text-xs rounded"
                    >
                        VER DETALHES
                    </Link>
                    {/* --- FIM DA MUDANÇA --- */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDeadline ? "Editar Prazo" : "Criar Novo Prazo"}
      >
        <DeadlineForm 
          deadline={editingDeadline}
          onSuccess={handleSuccess}
        />
      </Modal>
    </>
  );
}