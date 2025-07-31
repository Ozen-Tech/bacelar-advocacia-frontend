// src/pages/Prazos/index.tsx
import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import Input from '../../components/Forms/Input';
import Select from '../../components/Forms/Select';
import Modal from '../../components/Shared/Modal';
import DeadlineForm from '../../components/Prazos/DeadlineForm';

// Helper para formatar a data
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
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

  // Estado único para os Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    responsibleId: '',
  });
  
  // Estado para armazenar os usuários do filtro
  const [users, setUsers] = useState<UserPublic[]>([]);

  // Lógica de busca de dados (agora lê do estado `filters`)
  const fetchPrazos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: filters.search,
        type: filters.type,
        responsible_id: filters.responsibleId,
      });

      // Limpa parâmetros vazios para não poluir a URL
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

  // Efeito para carregar os dados iniciais (prazos e usuários)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const usersResponse = await api.get<UserPublic[]>('/users/');
        setUsers(usersResponse.data);
      } catch (err) {
        console.error("Falha ao buscar usuários para o filtro", err);
      }
      fetchPrazos(); // Busca os prazos após buscar os usuários
    };
    
    fetchInitialData();
  }, []); // Executa apenas uma vez

  // Handler para atualizar o estado dos filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handler para o submit do formulário de filtros
  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPrazos();
  };

  // Funções de controle do Modal
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
  
  // Lógica de estilização
  const getStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fatal':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'critico':
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

        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input 
            name="search"
            placeholder="Pesquisar..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <Select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">Todos os Tipos</option>
            <option value="Recurso">Recurso</option>
            <option value="Manifestação">Manifestação</option>
            <option value="Contestação">Contestação</option>
            <option value="Embargos">Embargos</option>
          </Select>
          <Select name="responsibleId" value={filters.responsibleId} onChange={handleFilterChange}>
            <option value="">Todos os Responsáveis</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </Select>
          <button 
            type="submit"
            className="rounded-md bg-bacelar-gold px-5 py-2 text-center font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            FILTRAR
          </button>
        </form>

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
                <tr><td colSpan={5} className="py-8 text-center text-bacelar-gray-light">Carregando prazos...</td></tr>
              ) : error ? (
                 <tr><td colSpan={5} className="py-8 text-center text-red-500">{error}</td></tr>
              ) : prazos.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-bacelar-gray-light">Nenhum prazo encontrado.</td></tr>
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
                      className="rounded border border-bacelar-gold/50 px-4 py-1 text-xs text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                    >
                      EDITAR
                    </button>
                    <Link 
                        to={`/prazos/${prazo.id}`} 
                        className="inline-block rounded border border-bacelar-gold/50 px-4 py-1 text-xs text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                    >
                        VER DETALHES
                    </Link>
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