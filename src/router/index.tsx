// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import PrazosPage from '../pages/Prazos';
import ProtectedRoute from './ProtectedRoute';
import PrazoDetailPage from '../pages/PrazoDetail';
import ProfilePage from '../pages/Profile'; // Importar Perfil
import NotificationsPage from '../pages/Notifications';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Todas as rotas dentro deste "path" são protegidas
  {
    path: '/',
    element: <ProtectedRoute />, // Nosso guardião de rotas
    children: [
      {
        path: '/', // Rota raiz (ex: site.com/)
        element: <DashboardPage />,
      },
      {
        path: '/prazos', // Rota de prazos (ex: site.com/prazos)
        element: <PrazosPage />,
      },
      {
        path: '/prazos/:id', // O ':id' é um parâmetro dinâmico
        element: <PrazoDetailPage />,
      },
      { path: '/perfil', element: <ProfilePage /> },
      { path: '/notificacoes', element: <NotificationsPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}