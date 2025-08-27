// src/components/Dashboard/StatusChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Definimos as cores para cada status, alinhadas com o design
const COLORS = {
  pendente: '#B99D6B', // bacelar-gold
  concluido: '#333333', // um cinza escuro para contraste
  expirado: '#8A8A8A', // bacelar-gray-light
  cancelado: '#8A8A8A', // o mesmo para cancelado
};

// Formata o nome do status para exibição (ex: 'pendente' -> 'Pendente')
const formatStatusName = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Tipo de dados que o componente espera receber
interface ChartData {
  status_counts: {
    [key: string]: number; // ex: { pendente: 5, concluido: 10 }
  };
}

export default function StatusChart({ status_counts }: ChartData) {
  // Transforma os dados da API no formato que o 'recharts' espera
  const data = Object.entries(status_counts).map(([name, value]) => ({
    name: formatStatusName(name),
    value,
  }));
  
  // Customização da legenda para combinar com o design
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col items-end space-y-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <span className="mr-2 text-sm text-bacelar-gray-light">{entry.value}</span>
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="document-watermark" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#CCCCCC'} />
            ))}
          </Pie>
          <Legend
            content={renderLegend}
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}