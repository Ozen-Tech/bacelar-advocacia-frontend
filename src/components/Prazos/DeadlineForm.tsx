// src/components/Prazos/DeadlineForm.tsx
import { useState, FormEvent, useEffect } from 'react';
import api from '../../services/api';
import Input from '../Forms/Input';
import Select from '../Forms/Select';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';

interface DeadlineFormProps {
  deadline?: DeadlinePublic | null; // O prazo a ser editado (opcional)
  onSuccess: () => void; // Função para chamar após o sucesso
  users: UserPublic[];
}

export default function DeadlineForm({ deadline, onSuccess, users}: DeadlineFormProps) {
  // Estados para cada campo do formulário
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [type, setType] = useState('');
  const [parties, setParties] = useState('');
  const [status, setStatus] = useState('pendente');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Se um prazo for passado para edição, preenche o formulário
    if (deadline) {
      setTaskDescription(deadline.task_description);
      setDueDate(new Date(deadline.due_date).toISOString().slice(0, 16)); // Formato para datetime-local
      setProcessNumber(deadline.process_number || '');
      setType(deadline.type || '');
      setParties(deadline.parties || '');
      setStatus(deadline.status);
      setResponsibleUserId(deadline.responsible_user_id || '');
    }
  }, [deadline]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      task_description: taskDescription,
      due_date: new Date(dueDate).toISOString(),
      process_number: processNumber,
      type: type,
      parties: parties,
      status: status,
      responsible_user_id: responsibleUserId || null,
    };

    try {
      if (deadline) {
        // Se tem um 'deadline', estamos editando (PUT)
        await api.put(`/deadlines/${deadline.id}`, payload);
      } else {
        // Senão, estamos criando (POST)
        await api.post('/deadlines', payload);
      }
      onSuccess(); // Chama a função de sucesso para fechar o modal e atualizar a lista
    } catch (err) {
      setError('Ocorreu um erro ao salvar o prazo. Verifique os campos.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <label className="text-sm text-bacelar-gray-light">Descrição da Tarefa*</label>
        <Input 
          value={taskDescription} 
          onChange={(e) => setTaskDescription(e.target.value)} 
          required
        />
      </div>
      <div>
        <label className="text-sm text-bacelar-gray-light">Data de Vencimento*</label>
        <Input 
          type="datetime-local" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      <Input placeholder="Nº do Processo" value={processNumber} onChange={(e) => setProcessNumber(e.target.value)} />
      <Input placeholder="Tipo do Prazo" value={type} onChange={(e) => setType(e.target.value)} />
      <Input placeholder="Partes" value={parties} onChange={(e) => setParties(e.target.value)} />
      
      <div className="grid grid-cols-2 gap-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </Select>
        <Select value={responsibleUserId} onChange={(e) => setResponsibleUserId(e.target.value)}>
          <option value="">Selecione um Responsável</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-bacelar-gold px-6 py-2 font-bold text-bacelar-black transition hover:bg-bacelar-gold-light disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Prazo'}
        </button>
      </div>
    </form>
  );
}