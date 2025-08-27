// src/pages/Prazos/index.tsx
import { useEffect, useState, FormEvent } from 'react';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import Modal from '../../components/Shared/Modal';
import DeadlineForm from '../../components/Prazos/DeadlineForm';
import PrazosDashboard from '../../components/Prazos/PrazosDashboard';
import AdvancedFilters from '../../components/Prazos/AdvancedFilters';
import BulkActions from '../../components/Prazos/BulkActions';
import EnhancedTable from '../../components/Prazos/EnhancedTable';
import ExportActions from '../../components/Prazos/ExportActions';
import { UrgencyLegend } from '../../components/Prazos/UrgencyIndicator';
import DeadlineDetailsModal from '../../components/Prazos/DeadlineDetailsModal';
import { ExcelImport } from '../../components/Prazos/ExcelImport';
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
  const [_error, setError] = useState('');

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
    dueDateFrom: '',
    dueDateTo: '',
    daysUntilDue: '',
    processNumber: '',
    parties: ''
  });
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedDeadlineForDetails, setSelectedDeadlineForDetails] = useState<DeadlinePublic | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
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
        due_date_from: filters.dueDateFrom,
        due_date_to: filters.dueDateTo,
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

  // Efeito para reagir às mudanças nos filtros de data
  useEffect(() => {
    if (filters.dueDateFrom || filters.dueDateTo) {
      fetchPrazos();
    }
  }, [filters.dueDateFrom, filters.dueDateTo]);

  // Handler para atualizar o estado dos filtros
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handler para o submit do formulário de filtros
  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPrazos();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      responsibleId: '',
      classification: '',
      status: '',
      dueDateFrom: '',
      dueDateTo: '',
      daysUntilDue: '',
      processNumber: '',
      parties: ''
    });
    fetchPrazos();
  };

  const handleQuickFilter = (filterType: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const next15Days = new Date(today);
    next15Days.setDate(today.getDate() + 15);

    switch (filterType) {
      case 'today':
        setFilters(prev => ({
          ...prev,
          dueDateFrom: today.toISOString().split('T')[0],
          dueDateTo: today.toISOString().split('T')[0]
        }));
        break;
      case 'thisWeek':
        setFilters(prev => ({
          ...prev,
          dueDateFrom: today.toISOString().split('T')[0],
          dueDateTo: nextWeek.toISOString().split('T')[0]
        }));
        break;
      case 'next15Days':
        setFilters(prev => ({
          ...prev,
          dueDateFrom: today.toISOString().split('T')[0],
          dueDateTo: next15Days.toISOString().split('T')[0]
        }));
        break;
      case 'critical':
        setFilters(prev => ({ ...prev, classification: 'critico' }));
        break;
      case 'fatal':
        setFilters(prev => ({ ...prev, classification: 'fatal' }));
        break;
      case 'overdue':
        setFilters(prev => ({ ...prev, daysUntilDue: 'overdue' }));
        break;
    }
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

  const handleBulkStatusChange = async (deadlineIds: string[], newStatus: string) => {
    try {
      await Promise.all(
        deadlineIds.map(id => 
          api.put(`/deadlines/${id}`, { status: newStatus })
        )
      );
      fetchPrazos();
    } catch (error) {
      console.error('Erro ao alterar status em lote:', error);
    }
  };

  const handleBulkResponsibleChange = async (deadlineIds: string[], newResponsibleId: string) => {
    try {
      await Promise.all(
        deadlineIds.map(id => 
          api.put(`/deadlines/${id}`, { responsible_user_id: newResponsibleId })
        )
      );
      fetchPrazos();
    } catch (error) {
      console.error('Erro ao alterar responsável em lote:', error);
    }
  };

  const handleBulkDelete = async (deadlineIds: string[]) => {
    try {
      await Promise.all(
        deadlineIds.map(id => api.delete(`/deadlines/${id}`))
      );
      fetchPrazos();
    } catch (error) {
      console.error('Erro ao excluir prazos em lote:', error);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeadlineToDelete(null);
  };
  
  // Lógica de estilização

  const handleViewDetails = (deadline: DeadlinePublic) => {
    setSelectedDeadlineForDetails(deadline);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDeadlineForDetails(null);
  };

  return (
    <>
      <div className="flex flex-col space-y-6 document-watermark">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-light text-white">LISTA DE PRAZOS</h1>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                showDashboard 
                  ? 'bg-bacelar-gold/20 text-bacelar-gold hover:bg-bacelar-gold/30' 
                  : 'bg-bacelar-gray-dark text-bacelar-gray-light hover:bg-bacelar-gray-light/20'
              }`}
            >
              {showDashboard ? 'Ocultar Dashboard' : 'Mostrar Dashboard'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user?.profile === 'admin' && (
              <button 
                onClick={handleOpenCreateModal}
                className="rounded-md bg-bacelar-gold px-5 py-2 text-center font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
              >
                NOVO PRAZO
              </button>
            )}
          </div>
        </div>
        <div className="border-b border-bacelar-gold/20" />

        {/* Dashboard */}
        {showDashboard && (
          <div className="mb-6">
            <PrazosDashboard prazos={prazos} loading={loading} />
          </div>
        )}

        {/* Importação Excel - apenas para admins */}
        {user?.profile === 'admin' && (
          <div className="mb-6">
            <ExcelImport onImportComplete={fetchPrazos} />
          </div>
        )}

        {/* Ações em Lote */}
        {selectedDeadlines.length > 0 && (
          <div className="mb-4">
            <BulkActions
              selectedDeadlines={selectedDeadlines}
              deadlines={prazos}
              users={users}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkResponsibleChange={handleBulkResponsibleChange}
              onBulkDelete={handleBulkDelete}
              onClearSelection={() => setSelectedDeadlines([])}
            />
          </div>
        )}

        {/* Área de Controles - Filtros e Exportação */}
        <div className="bg-bacelar-gray-dark/50 rounded-lg p-4 border border-bacelar-gold/20">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <AdvancedFilters
                filters={filters}
                users={users}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onClearFilters={handleClearFilters}
                onQuickFilter={handleQuickFilter}
              />
            </div>
            <div className="flex items-center gap-3">
              <ExportActions 
                deadlines={prazos} 
                selectedDeadlines={selectedDeadlines}
              />
            </div>
          </div>
        </div>

        {/* Legenda de Urgência */}
        <div className="mb-4">
          <UrgencyLegend />
        </div>

        {/* Tabela Aprimorada */}
        <EnhancedTable
          deadlines={prazos}
          users={users}
          currentUser={user}
          selectedDeadlines={selectedDeadlines}
          onSelectionChange={setSelectedDeadlines}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onViewDetails={handleViewDetails}
          loading={loading}
        />
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

      {/* Modal de Detalhes do Prazo */}
      <DeadlineDetailsModal
        deadline={selectedDeadlineForDetails}
        users={users}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onUpdate={fetchPrazos}
      />
    </>
  );
}