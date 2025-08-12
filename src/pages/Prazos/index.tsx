// src/pages/Prazos/index.tsx
import { useEffect, useState, FormEvent} from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import Input from '../../components/Forms/Input';
import Select from '../../components/Forms/Select';
import Modal from '../../components/Shared/Modal';
import DeadlineForm from '../../components/Prazos/DeadlineForm';
import { useAuth } from '../../context/AuthContext';

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
  
  // Estados para o Modal de Confirmação de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deadlineToDelete, setDeadlineToDelete] = useState<DeadlinePublic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Contexto de autenticação
  const { user } = useAuth();

  // Estado único para os Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    responsibleId: '',
    classification: '',
    status: '',
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
        classification: filters.classification,
        status: filters.status,
      });

      // Limpa parâmetros vazios para não poluir a URL
      params.forEach((value, key) => {
        if (!value) params.delete(key);
      });

      const response = await api.get<DeadlinePublic[]>(`/deadlines/?${params.toString()}`);
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
  
  // Funções para exclusão
  const handleOpenDeleteModal = (deadline: DeadlinePublic) => {
    setDeadlineToDelete(deadline);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteDeadline = async () => {
    if (!deadlineToDelete) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/deadlines/${deadlineToDelete.id}`);
      setIsDeleteModalOpen(false);
      setDeadlineToDelete(null);
      fetchPrazos(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao excluir prazo:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao excluir prazo';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeadlineToDelete(null);
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
          {user?.profile === 'admin' && (
            <button 
              onClick={handleOpenCreateModal}
              className="rounded-md bg-bacelar-gold px-4 py-2 font-semibold text-bacelar-black transition hover:bg-bacelar-gold-light"
            >
              + Novo Prazo
            </button>
          )}
        </div>
        <div className="border-b border-bacelar-gold/20" />

        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
          <Select name="classification" value={filters.classification} onChange={handleFilterChange}>
            <option value="">Todas as Classificações</option>
            <option value="normal">Normal</option>
            <option value="critico">Crítico</option>
            <option value="fatal">Fatal</option>
          </Select>
          <Select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </Select>
          <button 
            type="submit"
            className="rounded-md bg-bacelar-gold px-5 py-2 text-center font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            FILTRAR
          </button>
        </form>

        {/* Tabela de Prazos - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-bacelar-gray-light/20 text-bacelar-gray-light">
              <tr>
                <th scope="col" className="px-6 py-4">Processo</th>
                <th scope="col" className="px-6 py-4">Tipo de Prazo</th>
                <th scope="col" className="px-6 py-4">Data de Vencimento</th>
                <th scope="col" className="px-6 py-4">Classificação</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-bacelar-gray-light">Carregando prazos...</td></tr>
              ) : error ? (
                 <tr><td colSpan={6} className="py-8 text-center text-red-500">{error}</td></tr>
              ) : prazos.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-bacelar-gray-light">Nenhum prazo encontrado.</td></tr>
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
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800">
                      {prazo.status || 'pendente'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 space-x-2">
                    {(user?.profile === 'admin' || prazo.responsible?.id === user?.id) && (
                      <button 
                        onClick={() => handleOpenEditModal(prazo)}
                        className="rounded border border-bacelar-gold/50 px-4 py-1 text-xs text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                      >
                        EDITAR
                      </button>
                    )}
                    <Link 
                        to={`/prazos/${prazo.id}`} 
                        className="inline-block rounded border border-bacelar-gold/50 px-4 py-1 text-xs text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                    >
                        VER DETALHES
                    </Link>
                    {user?.profile === 'admin' && (
                      <button 
                        onClick={() => handleOpenDeleteModal(prazo)}
                        className="rounded border border-red-500/50 px-4 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-500"
                      >
                        EXCLUIR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards de Prazos - Mobile */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="py-8 text-center text-bacelar-gray-light">Carregando prazos...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : prazos.length === 0 ? (
            <div className="py-8 text-center text-bacelar-gray-light">Nenhum prazo encontrado.</div>
          ) : prazos.map(prazo => (
            <div key={prazo.id} className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-4 shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-mono text-white font-medium">{prazo.process_number || 'N/A'}</h3>
                <div className="flex space-x-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(prazo.classification)}`}>
                    {prazo.classification.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-bacelar-gray-light">
                <div><span className="font-medium text-white">Tipo:</span> {prazo.type || 'N/A'}</div>
                <div><span className="font-medium text-white">Vencimento:</span> {formatDate(prazo.due_date.toString())}</div>
                <div><span className="font-medium text-white">Status:</span> 
                  <span className="ml-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
                    {prazo.status || 'pendente'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                {(user?.profile === 'admin' || prazo.responsible?.id === user?.id) && (
                  <button 
                    onClick={() => handleOpenEditModal(prazo)}
                    className="flex-1 rounded border border-bacelar-gold/50 px-3 py-2 text-sm text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                  >
                    EDITAR
                  </button>
                )}
                <Link 
                  to={`/prazos/${prazo.id}`}
                  className="flex-1 text-center rounded border border-bacelar-gold/50 px-3 py-2 text-sm text-bacelar-gold/80 transition hover:border-bacelar-gold hover:text-bacelar-gold"
                >
                  DETALHES
                </Link>
                {user?.profile === 'admin' && (
                  <button 
                    onClick={() => handleOpenDeleteModal(prazo)}
                    className="flex-1 rounded border border-red-500/50 px-3 py-2 text-sm text-red-400 transition hover:border-red-500 hover:text-red-500"
                  >
                    EXCLUIR
                  </button>
                )}
              </div>
            </div>
          ))}
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
          users={users} 
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-bacelar-gray-light">
            Tem certeza que deseja excluir o prazo?
          </p>
          {deadlineToDelete && (
            <div className="bg-bacelar-gray-dark rounded-lg p-4 border border-bacelar-gray-light/20">
              <p className="text-white font-medium">
                {deadlineToDelete.task_description}
              </p>
              <p className="text-sm text-bacelar-gray-light mt-1">
                Processo: {deadlineToDelete.process_number || 'N/A'}
              </p>
              <p className="text-sm text-bacelar-gray-light">
                Vencimento: {formatDate(deadlineToDelete.due_date.toString())}
              </p>
            </div>
          )}
          <p className="text-red-400 text-sm">
            ⚠️ Esta ação não pode ser desfeita.
          </p>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="flex-1 rounded-md border border-bacelar-gray-light/30 px-4 py-2 text-bacelar-gray-light transition hover:border-bacelar-gray-light hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteDeadline}
              disabled={isDeleting}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}