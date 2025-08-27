// src/pages/Notifications/index.tsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, Bell } from 'lucide-react';

// Definimos a "forma" de uma notificação
interface Notification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

// Helper para formatar o tempo relativo
const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return "agora mesmo";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/');
      setNotifications(data);
    } catch (error) {
      console.error("Falha ao buscar notificações", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-as-read');
      // Re-busca as notificações para refletir o estado de 'lida'
      fetchNotifications();
    } catch (error) {
      console.error("Falha ao marcar como lidas", error);
    }
  };
  
  const NotificationIcon = ({ title }: { title: string }) => {
    if (title.toLowerCase().includes('crítico') || title.toLowerCase().includes('fatal')) {
      return <AlertTriangle className="h-6 w-6 text-bacelar-gold" />;
    }
    return <Bell className="h-6 w-6 text-bacelar-gold" />;
  };

  return (
    <div className="flex flex-col space-y-8 max-w-4xl mx-auto document-watermark">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-light text-white">NOTIFICAÇÕES</h1>
        <button 
          onClick={handleMarkAllAsRead}
          className="rounded-md bg-bacelar-gold/20 px-4 py-2 text-sm font-semibold text-bacelar-gold transition hover:bg-bacelar-gold/30"
        >
          Marcar todas como lidas
        </button>
      </div>
      <div className="border-b border-bacelar-gold/20" />

      <div className="flex flex-col space-y-4">
        {loading ? (
          <p>Carregando...</p>
        ) : notifications.length === 0 ? (
          <p className="text-bacelar-gray-light text-center py-8">Nenhuma notificação encontrada.</p>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              className={`flex items-start space-x-4 p-4 rounded-lg bg-bacelar-gray-dark transition ${!notif.is_read ? 'border-l-4 border-bacelar-gold' : 'opacity-60'}`}
            >
              <NotificationIcon title={notif.title} />
              <div className="flex-1">
                <p className="font-bold text-white">{notif.title}</p>
                <p className="text-sm text-bacelar-gray-light">{notif.body}</p>
              </div>
              <p className="text-xs text-bacelar-gray-light">{timeSince(new Date(notif.created_at))}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}