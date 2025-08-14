import React, { useState } from 'react';
import api from '../../services/api';

interface ImportResult {
  message: string;
  imported_count: number;
  error_count: number;
  imported_deadlines: any[];
  errors: any[];
}

interface ExcelImportProps {
  onImportComplete: () => void;
}

export function ExcelImport({ onImportComplete }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Verifica se é um arquivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (validTypes.includes(selectedFile.type) || 
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/excel/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      
      // Se a importação foi bem-sucedida, atualiza a lista de prazos
      if (response.data.imported_count > 0) {
        onImportComplete();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Erro ao importar planilha. Tente novamente.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    // Reset do input file
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="bg-bacelar-gray-dark border border-bacelar-gray-light/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Importar Prazos da Planilha Excel
      </h3>
      
      <div className="space-y-4">
        {/* Instruções */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Formato da Planilha:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• <strong>Coluna A:</strong> Parte 1 (Autor)</li>
            <li>• <strong>Coluna B:</strong> Parte 2 (Réu/Advogado)</li>
            <li>• <strong>Coluna C:</strong> Número do Processo</li>
            <li>• <strong>Coluna D:</strong> Data e Descrição do Prazo (ex: "01/08/2025 Protocolar Inicial")</li>
            <li>• <strong>Coluna E:</strong> Vara/Juizado</li>
          </ul>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-3">
          <label htmlFor="excel-file" className="block text-sm font-medium text-bacelar-gray-light">
            Selecionar Planilha Excel
          </label>
          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-bacelar-gray-light
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-bacelar-gold file:text-bacelar-black
                     hover:file:bg-bacelar-gold-light
                     file:cursor-pointer cursor-pointer
                     bg-bacelar-gray-light/10 border border-bacelar-gray-light/30 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-bacelar-gold"
          />
          
          {file && (
            <p className="text-sm text-green-400">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-bacelar-gold text-bacelar-black font-medium rounded-lg
                     hover:bg-bacelar-gold-light disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-bacelar-black border-t-transparent"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Importar Prazos</span>
              </>
            )}
          </button>
          
          {(result || error) && (
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-bacelar-gray-light/30 text-bacelar-gray-light
                       hover:text-white hover:border-bacelar-gray-light rounded-lg transition-colors"
            >
              Nova Importação
            </button>
          )}
        </div>

        {/* Resultado da importação */}
        {result && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-300 font-medium mb-2">Importação Concluída!</h4>
            <div className="text-green-200 text-sm space-y-1">
              <p>• {result.imported_count} prazos importados com sucesso</p>
              {result.error_count > 0 && (
                <p className="text-yellow-300">• {result.error_count} linhas com erro</p>
              )}
            </div>
            
            {result.errors.length > 0 && (
              <details className="mt-3">
                <summary className="text-yellow-300 cursor-pointer hover:text-yellow-200">
                  Ver erros ({result.errors.length})
                </summary>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                      <strong>Linha {error.linha}:</strong> {error.erro}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-300 font-medium mb-2">Erro na Importação</h4>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}