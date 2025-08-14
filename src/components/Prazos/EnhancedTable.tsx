// src/components/Prazos/EnhancedTable.tsx
import { useState, useMemo } from 'react';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import UrgencyIndicator from './UrgencyIndicator';

interface EnhancedTableProps {
  deadlines: DeadlinePublic[];
  users: UserPublic[];
  currentUser: UserPublic | null;
  selectedDeadlines: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (deadline: DeadlinePublic) => void;
  onDelete: (deadline: DeadlinePublic) => void;
  onViewDetails: (deadline: DeadlinePublic) => void;
  loading?: boolean;
}

type SortField = 'due_date' | 'task_description' | 'process_number' | 'type' | 'status' | 'classification';
type SortDirection = 'asc' | 'desc';

export default function EnhancedTable({
  deadlines,
  users,
  currentUser,
  selectedDeadlines,
  onSelectionChange,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false
}: EnhancedTableProps) {
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');

  // Função para ordenação
  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Tratamento especial para datas
      if (sortField === 'due_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [deadlines, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(sortedDeadlines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeadlines = sortedDeadlines.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedDeadlines.length === paginatedDeadlines.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(paginatedDeadlines.map(d => d.id));
    }
  };

  const handleSelectDeadline = (deadlineId: string) => {
    if (selectedDeadlines.includes(deadlineId)) {
      onSelectionChange(selectedDeadlines.filter(id => id !== deadlineId));
    } else {
      onSelectionChange([...selectedDeadlines, deadlineId]);
    }
  };

  const canEditOrDelete = (deadline: DeadlinePublic) => {
    return currentUser?.profile === 'admin' || deadline.responsible_user_id === currentUser?.id;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Não atribuído';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuário não encontrado';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '↕️';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const densityClasses = {
    compact: 'py-1 px-2 text-sm',
    normal: 'py-2 px-3',
    comfortable: 'py-3 px-4'
  };

  if (loading) {
    return (
      <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bacelar-gold"></div>
          <span className="ml-3 text-bacelar-gray-light">Carregando prazos...</span>
        </div>
      </div>
    );
  }

  if (deadlines.length === 0) {
    return (
      <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum prazo encontrado</h3>
        <p className="text-bacelar-gray-light">Tente ajustar os filtros ou adicione um novo prazo.</p>
      </div>
    );
  }

  return (
    <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 overflow-hidden">
      {/* Cabeçalho da Tabela */}
      <div className="p-4 border-b border-bacelar-gray-light/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">
              Prazos ({sortedDeadlines.length})
            </h3>
            
            {selectedDeadlines.length > 0 && (
              <span className="bg-bacelar-gold text-bacelar-black px-2 py-1 rounded text-sm font-medium">
                {selectedDeadlines.length} selecionado{selectedDeadlines.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Densidade */}
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as any)}
              className="bg-bacelar-gray-light/10 border border-bacelar-gray-light/20 rounded px-2 py-1 text-sm text-white"
            >
              <option value="compact">Compacto</option>
              <option value="normal">Normal</option>
              <option value="comfortable">Confortável</option>
            </select>
            
            {/* Itens por página */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-bacelar-gray-light/10 border border-bacelar-gray-light/20 rounded px-2 py-1 text-sm text-white"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bacelar-gray-light/5">
            <tr>
              <th className={`${densityClasses[density]} text-left`}>
                <input
                  type="checkbox"
                  checked={selectedDeadlines.length === paginatedDeadlines.length && paginatedDeadlines.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-bacelar-gray-light/30 bg-bacelar-gray-light/10 text-bacelar-gold focus:ring-bacelar-gold"
                />
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <button
                  onClick={() => handleSort('due_date')}
                  className="flex items-center space-x-1 text-bacelar-gray-light hover:text-white font-medium"
                >
                  <span>Vencimento</span>
                  <span>{getSortIcon('due_date')}</span>
                </button>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <span className="text-bacelar-gray-light font-medium">Partes</span>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <button
                  onClick={() => handleSort('process_number')}
                  className="flex items-center space-x-1 text-bacelar-gray-light hover:text-white font-medium"
                >
                  <span>Processo</span>
                  <span>{getSortIcon('process_number')}</span>
                </button>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center space-x-1 text-bacelar-gray-light hover:text-white font-medium"
                >
                  <span>Tipo</span>
                  <span>{getSortIcon('type')}</span>
                </button>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <span className="text-bacelar-gray-light font-medium">Responsável</span>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <span className="text-bacelar-gray-light font-medium">Urgência</span>
              </th>
              
              <th className={`${densityClasses[density]} text-left`}>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-bacelar-gray-light hover:text-white font-medium"
                >
                  <span>Status</span>
                  <span>{getSortIcon('status')}</span>
                </button>
              </th>
              
              <th className={`${densityClasses[density]} text-right`}>
                <span className="text-bacelar-gray-light font-medium">Ações</span>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedDeadlines.map((deadline) => (
              <tr 
                key={deadline.id}
                className={`border-t border-bacelar-gray-light/10 hover:bg-bacelar-gray-light/5 transition-colors ${
                  selectedDeadlines.includes(deadline.id) ? 'bg-bacelar-gold/10' : ''
                }`}
              >
                <td className={densityClasses[density]}>
                  <input
                    type="checkbox"
                    checked={selectedDeadlines.includes(deadline.id)}
                    onChange={() => handleSelectDeadline(deadline.id)}
                    className="rounded border-bacelar-gray-light/30 bg-bacelar-gray-light/10 text-bacelar-gold focus:ring-bacelar-gold"
                  />
                </td>
                
                <td className={`${densityClasses[density]} text-white font-medium`}>
                  {formatDate(deadline.due_date)}
                </td>
                
                <td className={`${densityClasses[density]} text-bacelar-gray-light`}>
                  <div className="max-w-xs truncate" title={deadline.parties || 'N/A'}>
                    {deadline.parties || 'N/A'}
                  </div>
                </td>
                
                <td className={`${densityClasses[density]} text-bacelar-gray-light`}>
                  {deadline.process_number || 'N/A'}
                </td>
                
                <td className={`${densityClasses[density]} text-bacelar-gray-light`}>
                  {deadline.type || 'N/A'}
                </td>
                
                <td className={`${densityClasses[density]} text-bacelar-gray-light`}>
                  {getUserName(deadline.responsible_user_id)}
                </td>
                
                <td className={densityClasses[density]}>
                  <UrgencyIndicator 
                    deadline={deadline} 
                    size={density === 'compact' ? 'sm' : 'md'}
                    variant="badge"
                  />
                </td>
                
                <td className={densityClasses[density]}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    deadline.status === 'concluido' ? 'bg-green-600 text-white' :
                    deadline.status === 'cancelado' ? 'bg-gray-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {deadline.status === 'concluido' ? 'Concluído' :
                     deadline.status === 'cancelado' ? 'Cancelado' : 'Pendente'}
                  </span>
                </td>
                
                <td className={`${densityClasses[density]} text-right`}>
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onViewDetails(deadline)}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Ver detalhes"
                    >
                      👁️
                    </button>
                    
                    {canEditOrDelete(deadline) && (
                      <>
                        <button
                          onClick={() => onEdit(deadline)}
                          className="p-1 text-bacelar-gold hover:text-bacelar-gold-light transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        
                        <button
                          onClick={() => onDelete(deadline)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-bacelar-gray-light/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-bacelar-gray-light">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedDeadlines.length)} de {sortedDeadlines.length} prazos
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-bacelar-gray-light/30 rounded text-sm text-white hover:text-bacelar-gold hover:border-bacelar-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-bacelar-gold text-bacelar-black font-medium'
                          : 'text-white hover:text-bacelar-gold hover:bg-bacelar-gold/10'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-bacelar-gray-light">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === totalPages
                          ? 'bg-bacelar-gold text-bacelar-black font-medium'
                          : 'text-white hover:text-bacelar-gold hover:bg-bacelar-gold/10'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-bacelar-gray-light/30 rounded text-sm text-white hover:text-bacelar-gold hover:border-bacelar-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}