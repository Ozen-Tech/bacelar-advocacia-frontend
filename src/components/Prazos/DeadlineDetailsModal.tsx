// src/components/Prazos/DeadlineDetailsModal.tsx
import { useState, useRef } from 'react';
import { DeadlinePublic } from '../../schemas/deadline';
import { UserPublic } from '../../schemas/user';
import UrgencyIndicator from './UrgencyIndicator';
import api from '../../services/api';

interface DeadlineDetailsModalProps {
  deadline: DeadlinePublic | null;
  users: UserPublic[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

export default function DeadlineDetailsModal({
  deadline,
  users,
  isOpen,
  onClose,
  onUpdate
}: DeadlineDetailsModalProps) {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !deadline) return null;

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Não atribuído';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuário não encontrado';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('deadline_id', deadline.id);

        // Simular upload com progresso
        const response = await api.post(`/deadlines/${deadline.id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              ((progressEvent.loaded * 100) / (progressEvent.total || 1))
            );
            setUploadProgress(progress);
          },
        });

        // Adicionar arquivo à lista de anexos
        const newAttachment: AttachmentFile = {
          id: response.data.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: response.data.url,
          uploaded_at: new Date().toISOString()
        };

        setAttachments(prev => [...prev, newAttachment]);
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      alert('Erro ao fazer upload do arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) return;

    try {
      await api.delete(`/deadlines/${deadline.id}/attachments/${attachmentId}`);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao excluir anexo:', error);
      alert('Erro ao excluir anexo. Tente novamente.');
    }
  };

  const handleDownloadAttachment = (attachment: AttachmentFile) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bacelar-gray-dark border border-bacelar-gray-light/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bacelar-gray-light/20">
          <h2 className="text-2xl font-light text-white">Detalhes do Prazo</h2>
          <button
            onClick={onClose}
            className="text-bacelar-gray-light hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações Principais */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-bacelar-gold mb-4">Informações Gerais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                      Descrição da Tarefa
                    </label>
                    <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                      {deadline.task_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Data de Vencimento
                      </label>
                      <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {formatDate(deadline.due_date)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Urgência
                      </label>
                      <div className="bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        <UrgencyIndicator deadline={deadline} variant="badge" size="md" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Número do Processo
                      </label>
                      <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {deadline.process_number || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Descrição da Tarefa
                      </label>
                      <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {deadline.task_description || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Responsável
                      </label>
                      <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {getUserName(deadline.responsible_user_id)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Status
                      </label>
                      <div className="bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          deadline.status === 'concluido' ? 'bg-green-600 text-white' :
                          deadline.status === 'cancelado' ? 'bg-gray-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {deadline.status === 'concluido' ? 'Concluído' :
                           deadline.status === 'cancelado' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {deadline.parties && (
                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Partes
                      </label>
                      <p className="text-white bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {deadline.parties}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Criado em
                      </label>
                      <p className="text-bacelar-gray-light bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {formatDate(deadline.created_at)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-bacelar-gray-light mb-1">
                        Atualizado em
                      </label>
                      <p className="text-bacelar-gray-light bg-bacelar-gray-light/10 p-3 rounded border border-bacelar-gray-light/20">
                        {deadline.updated_at ? formatDate(deadline.updated_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico e Anexos */}
            <div className="space-y-6">
              {/* Histórico de Movimentações */}
              <div>
                <h3 className="text-lg font-medium text-bacelar-gold mb-4">Histórico de Movimentações</h3>
                <div className="bg-bacelar-gray-light/10 rounded border border-bacelar-gray-light/20 max-h-64 overflow-y-auto">
                  {deadline.history && deadline.history.length > 0 ? (
                    <div className="divide-y divide-bacelar-gray-light/20">
                      {deadline.history.map((item, index) => (
                        <div key={item.id || index} className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-bacelar-gold rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium">
                                {item.action_description}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-bacelar-gray-light">
                                  por {item.acting_user?.name || 'Sistema'}
                                </span>
                                <span className="text-sm text-bacelar-gray-light">•</span>
                                <span className="text-sm text-bacelar-gray-light">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-bacelar-gray-light">
                      <div className="text-4xl mb-2">📋</div>
                      <p>Nenhuma movimentação registrada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Anexos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-bacelar-gold">Anexos</h3>
                  <button
                    onClick={handleFileSelect}
                    disabled={isUploading}
                    className="px-4 py-2 bg-bacelar-gold text-bacelar-black rounded hover:bg-bacelar-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Enviando...' : '📎 Anexar Arquivo'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                />

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-bacelar-gray-light mb-1">
                      <span>Enviando arquivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-bacelar-gray-light/20 rounded-full h-2">
                      <div 
                        className="bg-bacelar-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Lista de Anexos */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attachments.length === 0 ? (
                    <div className="text-center py-8 text-bacelar-gray-light">
                      <div className="text-4xl mb-2">📎</div>
                      <p>Nenhum anexo encontrado</p>
                      <p className="text-sm">Clique em "Anexar Arquivo" para adicionar documentos</p>
                    </div>
                  ) : (
                    attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-bacelar-gray-light/10 rounded border border-bacelar-gray-light/20 hover:bg-bacelar-gray-light/20 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="text-2xl">
                            {attachment.type.includes('image') ? '🖼️' :
                             attachment.type.includes('pdf') ? '📄' :
                             attachment.type.includes('word') ? '📝' :
                             attachment.type.includes('excel') || attachment.type.includes('spreadsheet') ? '📊' :
                             '📎'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate" title={attachment.name}>
                              {attachment.name}
                            </p>
                            <p className="text-sm text-bacelar-gray-light">
                              {formatFileSize(attachment.size)} • {formatDate(attachment.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="p-2 text-bacelar-gold hover:text-bacelar-gold-light transition-colors"
                            title="Baixar"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-bacelar-gray-light/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-bacelar-gray-light/20 text-white rounded hover:bg-bacelar-gray-light/30 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}