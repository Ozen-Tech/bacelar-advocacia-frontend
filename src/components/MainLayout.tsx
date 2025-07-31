import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ListChecks, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const { logout } = useAuth(); // 2. Pegar a função de logout do contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // 3. Redirecionar para o login após o logout
  };

  return (
    <div className="flex h-screen bg-bacelar-black text-white">
      <aside className="flex w-20 flex-col items-center justify-between bg-bacelar-gray-dark py-8">
        {/* Ícone principal e navegação */}
        <div className="flex flex-col items-center space-y-8">
          <div className="text-3xl font-serif text-bacelar-gold">B</div>
          <nav className="flex flex-col items-center space-y-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="rounded-lg p-2 text-bacelar-gray-light transition-colors hover:bg-bacelar-gold/10 hover:text-bacelar-gold aria-[current=page]:bg-bacelar-gold/10 aria-[current=page]:text-bacelar-gold"
                title={item.label}
                end
              >
                <item.icon size={24} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* --- O BOTÃO DE SAIR --- */}
        <div className="pb-4">
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-bacelar-gray-light transition-colors hover:bg-red-500/10 hover:text-red-500"
            title="Sair"
          >
            <LogOut size={24} />
          </button>
        </div>
        {/* -------------------- */}
      </aside>

      {/* Conteúdo Principal da Página */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* O React Router renderiza a página ativa aqui */}
      </main>
    </div>
  );
}