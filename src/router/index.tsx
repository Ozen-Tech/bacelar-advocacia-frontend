// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import PrazosPage from '../pages/Prazos';
import ProtectedRoute from './ProtectedRoute';
import PrazoDetailPage from '../pages/PrazoDetail';

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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}