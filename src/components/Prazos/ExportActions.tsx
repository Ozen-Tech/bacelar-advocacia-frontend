// src/components/Prazos/ExportActions.tsx
import { useState } from 'react';
import { DeadlinePublic } from '../../schemas/deadline';
import BacelarLogo from '../../assets/bacelar-logo.png';

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
        <title>Relatório de Prazos - Bacelar Legal Intelligence</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
            position: relative;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(212, 175, 55, 0.1);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
            white-space: nowrap;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #d4af37;
            border-radius: 10px;
            position: relative;
            z-index: 1;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
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
        <div class="watermark">BACELAR LEGAL INTELLIGENCE</div>
        <div class="header">
          <h1>BACELAR LEGAL INTELLIGENCE</h1>
          <p>Relatório de Prazos - ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Total de prazos: ${data.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Processo</th>
              <th>Descrição</th>
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
    
    // Criar conteúdo XML para Excel com marca d'água
    const excelContent = `
      <?xml version="1.0"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">
        <Styles>
          <Style ss:ID="watermark">
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
            <Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#D4AF37"/>
            <Interior ss:Color="#1A1A1A" ss:Pattern="Solid"/>
          </Style>
          <Style ss:ID="header">
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
            <Font ss:FontName="Arial" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
            <Interior ss:Color="#D4AF37" ss:Pattern="Solid"/>
          </Style>
        </Styles>
        <Worksheet ss:Name="Prazos">
          <Table>
            <Row>
              <Cell ss:MergeAcross="7" ss:StyleID="watermark"><Data ss:Type="String">BACELAR LEGAL INTELLIGENCE</Data></Cell>
            </Row>
            <Row>
              <Cell ss:StyleID="header"><Data ss:Type="String">Processo</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Descrição</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Data de Vencimento</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Classificação</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Status</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Partes</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Responsável</Data></Cell>
              <Cell ss:StyleID="header"><Data ss:Type="String">Criado em</Data></Cell>
            </Row>
            ${data.map(prazo => `
              <Row>
                <Cell><Data ss:Type="String">${prazo.process_number || ''}</Data></Cell>
                <Cell><Data ss:Type="String">${prazo.task_description || ''}</Data></Cell>
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
        className="flex items-center gap-2 px-4 py-2 bg-bacelar-gold text-bacelar-black font-semibold rounded-lg hover:bg-bacelar-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-bacelar-black border-t-transparent"></div>
            Exportando...
          </>
        ) : (
          'Exportar Dados'
        )}
        {selectedDeadlines.length > 0 && (
          <span className="bg-bacelar-black text-bacelar-gold text-xs px-2 py-1 rounded-full font-bold">
            {selectedDeadlines.length}
          </span>
        )}
      </button>

      {showExportMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-bacelar-gray-dark rounded-lg shadow-2xl border border-bacelar-gold/30 z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-3 text-sm text-bacelar-gold font-semibold border-b border-bacelar-gold/20 bg-bacelar-gray-dark/50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {selectedDeadlines.length > 0 
                  ? `${selectedDeadlines.length} prazos selecionados`
                  : `${deadlines.length} prazos disponíveis`
                }
              </div>
            </div>
            
            <button
              onClick={exportToCSV}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-bacelar-gold/10 flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Exportar CSV</div>
                <div className="text-xs text-bacelar-gray-light">Planilha compatível com Excel</div>
              </div>
            </button>
            
            <button
              onClick={exportToExcel}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-bacelar-gold/10 flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Exportar Excel</div>
                <div className="text-xs text-bacelar-gray-light">Formato nativo do Microsoft Excel</div>
              </div>
            </button>
            
            <button
              onClick={exportToPDF}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-bacelar-gold/10 flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Exportar PDF</div>
                <div className="text-xs text-bacelar-gray-light">Relatório formatado para impressão</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}