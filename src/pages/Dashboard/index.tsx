// src/pages/Dashboard/index.tsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/Dashboard/StatCard';
import { AlertTriangle, Hourglass, CalendarClock } from 'lucide-react';
import StatusChart from '../../components/Dashboard/StatusChart';


// Definimos a "forma" dos dados que esperamos da API
interface DashboardData {
  criticos: number;
  fatais: number;
  proximos: number;
  status_counts: {
    pendente?: number;
    concluido?: number;
    cancelado?: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get<DashboardData>('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-bacelar-gold">Carregando dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  return (
    <div className="flex flex-col space-y-8 document-watermark">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-lg text-bacelar-gold font-medium mt-1">Bacelar Legal Intelligence</p>
        </div>
        <button className="rounded-md bg-bacelar-gold px-4 py-2 font-semibold text-bacelar-black transition hover:bg-bacelar-gold-light">
          + Novo Prazo
        </button>
      </div>
      
      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Prazos Críticos"
          value={stats?.criticos ?? 0}
          Icon={AlertTriangle}
        />
        <StatCard
          title="Prazos Fatais"
          value={stats?.fatais ?? 0}
          Icon={Hourglass}
        />
        <StatCard
          title="Prazos Próximos do Vencimento"
          value={stats?.proximos ?? 0}
          Icon={CalendarClock}
        />
      </div>

      <div className="rounded-lg bg-bacelar-gray-dark p-6">
        <h2 className="text-xl font-semibold">Visão Geral dos Prazos</h2>
        <div className="mt-4">
          {/* 2. USE O COMPONENTE DO GRÁFICO AQUI */}
          {stats && <StatusChart status_counts={stats.status_counts} />}
        </div>
      </div>
    </div>
  );
}