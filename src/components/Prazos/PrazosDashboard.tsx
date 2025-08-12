// src/components/Prazos/PrazosDashboard.tsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { DeadlinePublic } from '../../schemas/deadline';

interface DashboardStats {
  total: number;
  criticos: number;
  fatais: number;
  proximos: number;
  concluidos: number;
  pendentes: number;
  vencidos: number;
}

interface PrazosDashboardProps {
  prazos: DeadlinePublic[];
  loading: boolean;
}

export default function PrazosDashboard({ prazos, loading }: PrazosDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    criticos: 0,
    fatais: 0,
    proximos: 0,
    concluidos: 0,
    pendentes: 0,
    vencidos: 0
  });

  useEffect(() => {
    if (prazos.length > 0) {
      const now = new Date();
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const newStats = {
        total: prazos.length,
        criticos: prazos.filter(p => p.classification === 'critico' && p.status === 'pendente').length,
        fatais: prazos.filter(p => p.classification === 'fatal' && p.status === 'pendente').length,
        proximos: prazos.filter(p => {
          const dueDate = new Date(p.due_date);
          return dueDate <= next7Days && dueDate >= now && p.status === 'pendente';
        }).length,
        concluidos: prazos.filter(p => p.status === 'concluido').length,
        pendentes: prazos.filter(p => p.status === 'pendente').length,
        vencidos: prazos.filter(p => {
          const dueDate = new Date(p.due_date);
          return dueDate < now && p.status === 'pendente';
        }).length
      };
      
      setStats(newStats);
    }
  }, [prazos]);

  const StatCard = ({ title, value, color, icon, description }: {
    title: string;
    value: number;
    color: string;
    icon: string;
    description?: string;
  }) => (
    <div className={`bg-bacelar-gray-dark rounded-lg border ${color} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-bacelar-gray-light text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{loading ? '...' : value}</p>
          {description && (
            <p className="text-xs text-bacelar-gray-light mt-1">{description}</p>
          )}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  const urgentPrazos = prazos
    .filter(p => (p.classification === 'fatal' || p.classification === 'critico') && p.status === 'pendente')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (classification: string) => {
    switch (classification) {
      case 'fatal':
        return 'text-red-400';
      case 'critico':
        return 'text-yellow-400';
      default:
        return 'text-bacelar-gray-light';
    }
  };

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Prazos Fatais"
          value={stats.fatais}
          color="border-red-500/30"
          icon="🚨"
          description="Vencimento ≤ 2 dias"
        />
        <StatCard
          title="Prazos Críticos"
          value={stats.criticos}
          color="border-yellow-500/30"
          icon="⚠️"
          description="Vencimento ≤ 7 dias"
        />
        <StatCard
          title="Próximos 7 Dias"
          value={stats.proximos}
          color="border-blue-500/30"
          icon="📅"
          description="Vencimento próximo"
        />
        <StatCard
          title="Vencidos"
          value={stats.vencidos}
          color="border-red-600/30"
          icon="⏰"
          description="Já passaram do prazo"
        />
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Prazos"
          value={stats.total}
          color="border-bacelar-gold/30"
          icon="📋"
        />
        <StatCard
          title="Pendentes"
          value={stats.pendentes}
          color="border-orange-500/30"
          icon="⏳"
        />
        <StatCard
          title="Concluídos"
          value={stats.concluidos}
          color="border-green-500/30"
          icon="✅"
        />
      </div>

      {/* Lista de Prazos Urgentes */}
      {urgentPrazos.length > 0 && (
        <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            🔥 Prazos Mais Urgentes
          </h3>
          <div className="space-y-3">
            {urgentPrazos.map(prazo => (
              <div key={prazo.id} className="flex items-center justify-between p-3 bg-bacelar-black/30 rounded-lg border border-bacelar-gray-light/10">
                <div className="flex-1">
                  <p className="text-white font-medium truncate">{prazo.task_description}</p>
                  <p className="text-sm text-bacelar-gray-light">
                    Processo: {prazo.process_number || 'N/A'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-sm font-semibold ${getUrgencyColor(prazo.classification)}`}>
                    {prazo.classification.toUpperCase()}
                  </p>
                  <p className="text-xs text-bacelar-gray-light">
                    {formatDate(prazo.due_date.toString())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}