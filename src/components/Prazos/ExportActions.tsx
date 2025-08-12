// src/components/Prazos/ExportActions.tsx
import { useState } from 'react';
import { DeadlinePublic } from '../../schemas/deadline';

interface ExportActionsProps {
  deadlines: DeadlinePublic[];
  selectedDeadlines?: string[];
}

export default function ExportActions({ deadlines, selectedDeadlines = [] }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getExportData = () => {
    if (selectedDeadlines.length > 0) {
      return deadlines.filter(d => selectedDeadlines.includes(d.id));
    }
    return deadlines;
  };

  const exportToCSV = () => {
    setIsExporting(true);
    const data = getExportData();
    
    const headers = [
      'Processo',
      'Descrição',
      'Tipo',
      'Data de Vencimento',
      'Classificação',
      'Status',
      'Partes',
      'Responsável',
      'Criado em'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(prazo => [
        `"${prazo.process_number || ''}",`,
        `"${prazo.task_description || ''}",`,
        `"${prazo.type || ''}",`,
        `"${new Date(prazo.due_date).toLocaleDateString('pt-BR')}",`,
        `"${prazo.classification || ''}",`,
        `"${prazo.status || ''}",`,
        `"${prazo.parties || ''}",`,
        `"${prazo.responsible?.name || ''}",`,
        `"${new Date(prazo.created_at).toLocaleDateString('pt-BR')}"`
      ].join(''))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prazos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
    setShowExportMenu(false);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    const data = getExportData();
    
    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Prazos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1f2937; margin-bottom: 10px; }
          .header p { color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .urgent { background-color: #fef2f2; }
          .critical { background-color: #fef2f2; color: #dc2626; }
          .fatal { background-color: #7f1d1d; color: white; }
          .completed { background-color: #f0fdf4; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Prazos</h1>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Total de prazos: ${data.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Processo</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Vencimento</th>
              <th>Classificação</th>
              <th>Status</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(prazo => {
              const daysUntilDue = Math.ceil((new Date(prazo.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              let rowClass = '';
              if (prazo.classification === 'fatal') rowClass = 'fatal';
              else if (prazo.classification === 'critico') rowClass = 'critical';
              else if (daysUntilDue <= 3 && prazo.status === 'pendente') rowClass = 'urgent';
              else if (prazo.status === 'concluido') rowClass = 'completed';
              
              return `
                <tr class="${rowClass}">
                  <td>${prazo.process_number || 'N/A'}</td>
                  <td>${prazo.task_description || 'N/A'}</td>
                  <td>${prazo.type || 'N/A'}</td>
                  <td>${new Date(prazo.due_date).toLocaleDateString('pt-BR')}</td>
                  <td>${prazo.classification || 'N/A'}</td>
                  <td>${prazo.status || 'pendente'}</td>
                  <td>${prazo.responsible?.name || 'N/A'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Relatório gerado pelo Sistema de Gestão Jurídica - Bacelar Advocacia</p>
        </div>
      </body>
      </html>
    `;

    // Abrir nova janela para impressão/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    
    setIsExporting(false);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    setIsExporting(true);
    const data = getExportData();
    
    // Criar conteúdo XML para Excel
    const excelContent = `
      <?xml version="1.0"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">
        <Worksheet ss:Name="Prazos">
          <Table>
            <Row>
              <Cell><Data ss:Type="String">Processo</Data></Cell>
              <Cell><Data ss:Type="String">Descrição</Data></Cell>
              <Cell><Data ss:Type="String">Tipo</Data></Cell>
              <Cell><Data ss:Type="String">Data de Vencimento</Data></Cell>
              <Cell><Data ss:Type="String">Classificação</Data></Cell>
              <Cell><Data ss:Type="String">Status</Data></Cell>
              <Cell><Data ss:Type="String">Partes</Data></Cell>
              <Cell><Data ss:Type="String">Responsável</Data></Cell>
              <Cell><Data ss:Type="String">Criado em</Data></Cell>
            </Row>
            ${data.map(prazo => `
              <Row>
                <Cell><Data ss:Type="String">${prazo.process_number || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.task_description || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.type || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${new Date(prazo.due_date).toLocaleDateString('pt-BR')}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.classification || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.status || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.parties || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.responsible?.name || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${new Date(prazo.created_at).toLocaleDateString('pt-BR')}</Data></Cell>
              </Row>
            `).join('')}
          </Table>
        </Worksheet>
      </Workbook>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prazos_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
    setShowExportMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting || deadlines.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Exportando...' : 'Exportar'}
        {selectedDeadlines.length > 0 && (
          <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
            {selectedDeadlines.length}
          </span>
        )}
      </button>

      {showExportMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-gray-500 border-b">
              {selectedDeadlines.length > 0 
                ? `Exportar ${selectedDeadlines.length} selecionados`
                : `Exportar todos (${deadlines.length})`
              }
            </div>
            
            <button
              onClick={exportToCSV}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV
            </button>
            
            <button
              onClick={exportToExcel}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
              </svg>
              Exportar Excel
            </button>
            
            <button
              onClick={exportToPDF}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Exportar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}