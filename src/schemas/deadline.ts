// src/schemas/deadline.ts
// Este arquivo ajuda o TypeScript a entender a "forma" de um prazo vindo da API


interface HistoryItem {
  id: string;
  action_description: string;
  created_at: Date;
  acting_user: {
      name: string;
  };
}

export interface DeadlinePublic {
    id: string;
    task_description: string;
    due_date: Date;
    process_number: string | null;
    type: string | null;
    parties: string | null;
    status: 'pendente' | 'concluido' | 'cancelado';
    classification: 'normal' | 'critico' | 'fatal';
    responsible_user_id: string | null;
    responsible: { id: string, name: string } | null;
    history: HistoryItem[]; 
    created_at: Date;
    updated_at: Date | null;
  }