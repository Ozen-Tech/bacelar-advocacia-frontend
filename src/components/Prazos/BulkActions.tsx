// src/components/Prazos/BulkActions.tsx
import { useState } from 'react';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import Select from '../Forms/Select';

interface BulkActionsProps {
  selectedDeadlines: string[];
  deadlines: DeadlinePublic[];
  users: UserPublic[];
  onBulkStatusChange: (deadlineIds: string[], newStatus: string) => void;
  onBulkResponsibleChange: (deadlineIds: string[], newResponsibleId: string) => void;
  onBulkDelete: (deadlineIds: string[]) => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedDeadlines,
  deadlines,
  users,
  onBulkStatusChange,
  onBulkResponsibleChange,
  onBulkDelete,
  onClearSelection
}: BulkActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkResponsible, setBulkResponsible] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedDeadlines.length === 0) {
    return null;
  }

  const selectedCount = selectedDeadlines.length;
  const selectedDeadlineObjects = deadlines.filter(d => selectedDeadlines.includes(d.id));

  const handleBulkStatusChange = () => {
    if (bulkStatus) {
      onBulkStatusChange(selectedDeadlines, bulkStatus);
      setBulkStatus('');
      onClearSelection();
    }
  };

  const handleBulkResponsibleChange = () => {
    if (bulkResponsible) {
      onBulkResponsibleChange(selectedDeadlines, bulkResponsible);
      setBulkResponsible('');
      onClearSelection();
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedDeadlines);
    setShowDeleteConfirm(false);
    onClearSelection();
  };

  return (
    <>
      {/* Barra de Ações em Lote */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-bacelar-gray-dark border border-bacelar-gold/30 rounded-lg shadow-2xl p-4 min-w-96">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-bacelar-gold text-bacelar-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {selectedCount}
              </div>
              <span className="text-white font-medium">
                {selectedCount} prazo{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-bacelar-gold hover:text-bacelar-gold-light transition-colors p-1"
                title="Mostrar/Ocultar Ações"
              >
                {showActions ? '▼' : '▶'}
              </button>
              
              <button
                onClick={onClearSelection}
                className="text-bacelar-gray-light hover:text-white transition-colors p-1"
                title="Limpar Seleção"
              >
                ✕
              </button>
            </div>
          </div>

          {showActions && (
            <div className="space-y-3 border-t border-bacelar-gray-light/20 pt-3">
              {/* Alterar Status em Lote */}
              <div className="flex items-center space-x-2">
                <Select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="flex-1"
                >
                  <option value="">Alterar Status...</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
                
                <button
                  onClick={handleBulkStatusChange}
                  disabled={!bulkStatus}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
                >
                  Aplicar
                </button>
              </div>

              {/* Alterar Responsável em Lote */}
              <div className="flex items-center space-x-2">
                <Select
                  value={bulkResponsible}
                  onChange={(e) => setBulkResponsible(e.target.value)}
                  className="flex-1"
                >
                  <option value="">Alterar Responsável...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Select>
                
                <button
                  onClick={handleBulkResponsibleChange}
                  disabled={!bulkResponsible}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
                >
                  Aplicar
                </button>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onBulkStatusChange(selectedDeadlines, 'concluido')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                >
                  ✓ Marcar como Concluído
                </button>
                
                <button
                  onClick={() => onBulkStatusChange(selectedDeadlines, 'pendente')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
                >
                  ⏳ Marcar como Pendente
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                >
                  🗑️ Excluir Selecionados
                </button>
              </div>

              {/* Resumo dos Selecionados */}
              <div className="text-xs text-bacelar-gray-light border-t border-bacelar-gray-light/20 pt-2">
                <div className="font-medium mb-1">Prazos Selecionados:</div>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {selectedDeadlineObjects.slice(0, 3).map(deadline => (
                    <div key={deadline.id} className="truncate">
                      • {deadline.task_description} ({deadline.process_number})
                    </div>
                  ))}
                  {selectedDeadlineObjects.length > 3 && (
                    <div className="text-bacelar-gold">
                      ... e mais {selectedDeadlineObjects.length - 3} prazo{selectedDeadlineObjects.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
                <p className="text-bacelar-gray-light text-sm">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white mb-3">
                Tem certeza que deseja excluir <strong>{selectedCount}</strong> prazo{selectedCount > 1 ? 's' : ''}?
              </p>
              
              <div className="bg-bacelar-gray-light/10 rounded p-3 max-h-32 overflow-y-auto">
                {selectedDeadlineObjects.map(deadline => (
                  <div key={deadline.id} className="text-sm text-bacelar-gray-light mb-1">
                    • {deadline.task_description}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-bacelar-gray-light/30 text-bacelar-gray-light rounded-md hover:border-bacelar-gray-light hover:text-white transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                Excluir Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}