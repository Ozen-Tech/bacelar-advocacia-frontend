// src/components/MainLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
// Importa os ícones reais que usaremos
import { Home, ListChecks, LayoutDashboard, User, Bell } from 'lucide-react';

const navItems = [
  // A rota '/' agora aponta para o Dashboard, então usamos o ícone Home para ele.
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/prazos', icon: ListChecks, label: 'Prazos' },
  // Desativado por enquanto, pois o dashboard geral já está em '/'
  // { path: '/dashboard-geral', icon: LayoutDashboard, label: 'Dashboard Geral' }, 
  { path: '/perfil', icon: User, label: 'Meu Perfil' },
  { path: '/notificacoes', icon: Bell, label: 'Notificações' }, // Adiciona link para Notificações
];

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-bacelar-black text-white">
      {/* Barra de Navegação Lateral */}
      <aside className="flex w-20 flex-col items-center space-y-8 bg-bacelar-gray-dark py-8">
        <div className="text-3xl font-serif text-bacelar-gold">B</div>
        <nav className="flex flex-1 flex-col items-center justify-center space-y-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // O Tailwind tem um seletor especial que funciona com NavLink do React Router:
              // `aria-[current=page]` é o atributo que o NavLink usa para indicar a página ativa.
              className="rounded-lg p-2 text-bacelar-gray-light transition-colors hover:bg-bacelar-gold/10 hover:text-bacelar-gold aria-[current=page]:bg-bacelar-gold/10 aria-[current=page]:text-bacelar-gold"
              title={item.label}
              end // Adicionar 'end' na rota raiz evita que ela fique ativa em todas as sub-rotas
            >
              <item.icon size={24} />
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal da Página */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* O React Router renderiza a página ativa aqui */}
      </main>
    </div>
  );
}