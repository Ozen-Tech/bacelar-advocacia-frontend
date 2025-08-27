import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ListChecks, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BacelarLogo from '../assets/bacelar-logo.png';

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
      <aside className="flex w-64 flex-col items-center justify-between bg-bacelar-gray-dark py-8">
        {/* Logo e navegação */}
        <div className="flex flex-col items-center space-y-8">
          {/* Logo da Bacelar Advocacia */}
          <div className="flex flex-col items-center">
            <img src={BacelarLogo} alt="Bacelar Advocacia" className="w-20 h-auto object-contain" />
          </div>
          <nav className="flex flex-col space-y-4 w-full px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 rounded-lg p-3 text-bacelar-gray-light transition-colors hover:bg-bacelar-gold/10 hover:text-bacelar-gold aria-[current=page]:bg-bacelar-gold/10 aria-[current=page]:text-bacelar-gold"
                end
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* --- O BOTÃO DE SAIR --- */}
        <div className="pb-4 w-full px-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full rounded-lg p-3 text-bacelar-gray-light transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
        {/* -------------------- */}
      </aside>

      {/* Conteúdo Principal da Página */}
      <main className="flex-1 overflow-y-auto p-8 watermark-background">
        <Outlet /> {/* O React Router renderiza a página ativa aqui */}
      </main>
    </div>
  );
}