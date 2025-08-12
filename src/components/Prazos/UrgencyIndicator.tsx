// src/components/Prazos/UrgencyIndicator.tsx
import { DeadlinePublic } from '../../schemas/deadline';

interface UrgencyIndicatorProps {
  deadline: DeadlinePublic;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'dot' | 'bar' | 'card';
}

export default function UrgencyIndicator({ 
  deadline, 
  showLabel = true, 
  size = 'md',
  variant = 'badge'
}: UrgencyIndicatorProps) {
  const calculateDaysUntilDue = (dueDate: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (deadline: DeadlinePublic) => {
    if (deadline.status === 'concluido') {
      return {
        level: 'completed',
        label: 'Concluído',
        color: 'green',
        bgColor: 'bg-green-600',
        textColor: 'text-green-600',
        borderColor: 'border-green-600',
        icon: '✓',
        priority: 0
      };
    }

    if (deadline.status === 'cancelado') {
      return {
        level: 'cancelled',
        label: 'Cancelado',
        color: 'gray',
        bgColor: 'bg-gray-600',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-600',
        icon: '✕',
        priority: 0
      };
    }

    const daysUntilDue = calculateDaysUntilDue(deadline.due_date);
    
    if (daysUntilDue < 0) {
      return {
        level: 'overdue',
        label: `Vencido há ${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) > 1 ? 's' : ''}`,
        color: 'red',
        bgColor: 'bg-red-700',
        textColor: 'text-red-600',
        borderColor: 'border-red-600',
        icon: '⚠️',
        priority: 5,
        animate: true
      };
    }

    if (deadline.classification === 'fatal' || daysUntilDue === 0) {
      return {
        level: 'fatal',
        label: daysUntilDue === 0 ? 'Vence Hoje!' : 'Fatal',
        color: 'red',
        bgColor: 'bg-red-600',
        textColor: 'text-red-600',
        borderColor: 'border-red-600',
        icon: '🔥',
        priority: 4,
        animate: true
      };
    }

    if (deadline.classification === 'critico' || daysUntilDue <= 3) {
      return {
        level: 'critical',
        label: daysUntilDue <= 3 ? `${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}` : 'Crítico',
        color: 'orange',
        bgColor: 'bg-orange-600',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-600',
        icon: '⚡',
        priority: 3,
        animate: daysUntilDue <= 1
      };
    }

    if (daysUntilDue <= 7) {
      return {
        level: 'warning',
        label: `${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}`,
        color: 'yellow',
        bgColor: 'bg-yellow-600',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-600',
        icon: '⏰',
        priority: 2
      };
    }

    if (daysUntilDue <= 15) {
      return {
        level: 'upcoming',
        label: `${daysUntilDue} dias`,
        color: 'blue',
        bgColor: 'bg-blue-600',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-600',
        icon: '📅',
        priority: 1
      };
    }

    return {
      level: 'normal',
      label: `${daysUntilDue} dias`,
      color: 'gray',
      bgColor: 'bg-gray-600',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-600',
      icon: '📋',
      priority: 0
    };
  };

  const urgency = getUrgencyLevel(deadline);

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      dot: 'w-2 h-2',
      bar: 'h-1',
      text: 'text-xs'
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      dot: 'w-3 h-3',
      bar: 'h-2',
      text: 'text-sm'
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      dot: 'w-4 h-4',
      bar: 'h-3',
      text: 'text-base'
    }
  };

  const animationClass = urgency.animate ? 'animate-pulse' : '';

  switch (variant) {
    case 'dot':
      return (
        <div className="flex items-center space-x-2">
          <div 
            className={`${sizeClasses[size].dot} ${urgency.bgColor} rounded-full ${animationClass}`}
            title={urgency.label}
          />
          {showLabel && (
            <span className={`${sizeClasses[size].text} ${urgency.textColor} font-medium`}>
              {urgency.label}
            </span>
          )}
        </div>
      );

    case 'bar':
      return (
        <div className="w-full">
          <div 
            className={`w-full ${sizeClasses[size].bar} ${urgency.bgColor} rounded ${animationClass}`}
            title={urgency.label}
          />
          {showLabel && (
            <div className={`mt-1 ${sizeClasses[size].text} ${urgency.textColor} font-medium text-center`}>
              {urgency.label}
            </div>
          )}
        </div>
      );

    case 'card':
      return (
        <div className={`p-3 rounded-lg border-l-4 ${urgency.borderColor} bg-${urgency.color}-50 dark:bg-${urgency.color}-900/20 ${animationClass}`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{urgency.icon}</span>
            <div>
              <div className={`font-semibold ${urgency.textColor}`}>
                {urgency.level === 'overdue' ? 'VENCIDO' : urgency.level.toUpperCase()}
              </div>
              {showLabel && (
                <div className={`${sizeClasses[size].text} ${urgency.textColor} opacity-80`}>
                  {urgency.label}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'badge':
    default:
      return (
        <span 
          className={`inline-flex items-center space-x-1 ${sizeClasses[size].badge} ${urgency.bgColor} text-white font-semibold rounded-full ${animationClass}`}
          title={`Prioridade: ${urgency.priority}/5`}
        >
          <span>{urgency.icon}</span>
          {showLabel && <span>{urgency.label}</span>}
        </span>
      );
  }
}

// Componente auxiliar para mostrar legenda dos indicadores
export function UrgencyLegend() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const mockDeadlines: DeadlinePublic[] = [
     {
       id: '1',
       task_description: 'Concluído',
       process_number: '123',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'concluido',
       classification: 'normal',
       due_date: today,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     },
     {
       id: '2',
       task_description: 'Fatal',
       process_number: '124',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'pendente',
       classification: 'fatal',
       due_date: today,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     },
     {
       id: '3',
       task_description: 'Crítico',
       process_number: '125',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'pendente',
       classification: 'critico',
       due_date: tomorrow,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     },
     {
       id: '4',
       task_description: 'Próxima Semana',
       process_number: '126',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'pendente',
       classification: 'normal',
       due_date: nextWeek,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     },
     {
       id: '5',
       task_description: 'Próximo Mês',
       process_number: '127',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'pendente',
       classification: 'normal',
       due_date: nextMonth,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     },
     {
       id: '6',
       task_description: 'Vencido',
       process_number: '128',
       type: 'Recurso',
       parties: 'Exemplo',
       status: 'pendente',
       classification: 'normal',
       due_date: yesterday,
       responsible_user_id: '1',
       responsible: { id: '1', name: 'Usuário' },
       history: [],
       created_at: today,
       updated_at: today
     }
   ];

  return (
    <div className="bg-bacelar-gray-dark rounded-lg border border-bacelar-gray-light/20 p-4">
      <h3 className="text-white font-semibold mb-3">Legenda de Urgência</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mockDeadlines.map((deadline, index) => (
          <div key={index} className="flex items-center space-x-2">
            <UrgencyIndicator 
              deadline={deadline} 
              size="sm" 
              variant="dot"
              showLabel={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}