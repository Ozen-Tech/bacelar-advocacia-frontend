// src/components/MainLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';

// Ícones placeholder. Vamos usar ícones reais depois.
const HomeIcon = () => <span>🏠</span>;
const ListIcon = () => <span>📄</span>;
const DashboardIcon = () => <span>📊</span>;
const ProfileIcon = () => <span>👤</span>;

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Início' },
  { path: '/prazos', icon: ListIcon, label: 'Prazos' },
  { path: '/dashboard-geral', icon: DashboardIcon, label: 'Dashboard Geral' },
  { path: '/perfil', icon: ProfileIcon, label: 'Meu Perfil' },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-bacelar-black text-white">
      {/* Barra de Navegação Lateral */}
      <aside className="flex w-20 flex-col items-center space-y-8 bg-bacelar-gray-dark py-8">
        <div className="text-3xl font-bold text-bacelar-gold">B</div>
        <nav className="flex flex-col items-center space-y-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // O `&.active` é um seletor especial do Tailwind que aplica a classe
              // apenas quando o NavLink está ativo (URL correspondente)
              className="text-bacelar-gray-light transition hover:text-bacelar-gold [&.active]:text-bacelar-gold"
              title={item.label}
            >
              <item.icon />
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal da Página */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* O React Router irá renderizar a página da rota atual aqui */}
      </main>
    </div>
  );
}