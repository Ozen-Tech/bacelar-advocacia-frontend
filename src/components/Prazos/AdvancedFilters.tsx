// src/components/Prazos/AdvancedFilters.tsx
import { useState, FormEvent } from 'react';
import Input from '../Forms/Input';
import Select from '../Forms/Select';
import { UserPublic } from '../../schemas/user';

interface FilterState {
  search: string;
  type: string;
  responsibleId: string;
  classification: string;
  status: string;
  dueDateFrom: string;
  dueDateTo: string;
  daysUntilDue: string;
  processNumber: string;
  parties: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (name: string, value: string) => void;
  onFilterSubmit: (e: FormEvent) => void;
  users: UserPublic[];
  onClearFilters: () => void;
  onQuickFilter: (filterType: string) => void;
}

export default function AdvancedFilters({
  filters,
  onFilterChange,
  onFilterSubmit,
  users,
  onClearFilters,
  onQuickFilter
}: AdvancedFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickFilters = [
    { label: 'Hoje', value: 'today', color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Esta Semana', value: 'thisWeek', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { label: 'Próximos 15 dias', value: 'next15Days', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Críticos', value: 'critical', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Fatais', value: 'fatal', color: 'bg-red-700 hover:bg-red-800' },
    { label: 'Vencidos', value: 'overdue', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  const typeOptions = [
    'Recurso',
    'Manifestação',
    'Contestação',
    'Embargos',
    'Petição Inicial',
    'Tréplica',
    'Alegações Finais',
    'Cumprimento de Sentença',
    'Agravo',
    'Apelação'
  ];

  return (
    <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-6 space-y-6">
      {/* Filtros Rápidos */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Filtros Rápidos</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => onQuickFilter(filter.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors ${filter.color}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de Filtros */}
      <form onSubmit={onFilterSubmit} className="space-y-4">
        {/* Linha 1 - Filtros Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
              Busca Geral
            </label>
            <Input
              name="search"
              placeholder="Buscar em descrição, processo..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
              Tipo de Prazo
            </label>
            <Select
              name="type"
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
              Responsável
            </label>
            <Select
              name="responsibleId"
              value={filters.responsibleId}
              onChange={(e) => onFilterChange('responsibleId', e.target.value)}
            >
              <option value="">Todos os Responsáveis</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
              Classificação
            </label>
            <Select
              name="classification"
              value={filters.classification}
              onChange={(e) => onFilterChange('classification', e.target.value)}
            >
              <option value="">Todas as Classificações</option>
              <option value="normal">Normal</option>
              <option value="critico">Crítico</option>
              <option value="fatal">Fatal</option>
            </Select>
          </div>
        </div>

        {/* Botão para mostrar filtros avançados */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-bacelar-gold hover:text-bacelar-gold-light transition-colors text-sm font-medium"
          >
            {showAdvanced ? '▼ Ocultar Filtros Avançados' : '▶ Mostrar Filtros Avançados'}
          </button>
        </div>

        {/* Filtros Avançados */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-bacelar-gray-light/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Vencimento De
                </label>
                <Input
                  type="date"
                  name="dueDateFrom"
                  value={filters.dueDateFrom}
                  onChange={(e) => onFilterChange('dueDateFrom', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Vencimento Até
                </label>
                <Input
                  type="date"
                  name="dueDateTo"
                  value={filters.dueDateTo}
                  onChange={(e) => onFilterChange('dueDateTo', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Dias até Vencimento
                </label>
                <Select
                  name="daysUntilDue"
                  value={filters.daysUntilDue}
                  onChange={(e) => onFilterChange('daysUntilDue', e.target.value)}
                >
                  <option value="">Qualquer prazo</option>
                  <option value="1">Hoje</option>
                  <option value="3">Próximos 3 dias</option>
                  <option value="7">Próximos 7 dias</option>
                  <option value="15">Próximos 15 dias</option>
                  <option value="30">Próximos 30 dias</option>
                  <option value="overdue">Vencidos</option>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Número do Processo
                </label>
                <Input
                  name="processNumber"
                  placeholder="Ex: 1234567-89.2023.8.26.0001"
                  value={filters.processNumber}
                  onChange={(e) => onFilterChange('processNumber', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Partes
                </label>
                <Input
                  name="parties"
                  placeholder="Nome das partes envolvidas"
                  value={filters.parties}
                  onChange={(e) => onFilterChange('parties', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                  Status
                </label>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                >
                  <option value="">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            className="rounded-md bg-bacelar-gold px-6 py-2 font-bold text-bacelar-black transition hover:bg-bacelar-gold-light"
          >
            🔍 Aplicar Filtros
          </button>
          
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-md border border-bacelar-gray-light/30 px-6 py-2 font-medium text-bacelar-gray-light transition hover:border-bacelar-gray-light hover:text-white"
          >
            🗑️ Limpar Filtros
          </button>
        </div>
      </form>
    </div>
  );
}