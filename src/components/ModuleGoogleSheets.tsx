import React, { useState, useEffect, useContext } from 'react';
import { 
  FileSpreadsheet, Plus, ExternalLink, RefreshCw, Trash2, Edit3, 
  Search, Check, AlertCircle, Sparkles, Download, Table, Database,
  Eye, Save, X, ArrowLeft, Layers, ShieldAlert, LogOut, CheckCircle2
} from 'lucide-react';
import { ChurchContext } from '../App';
import { 
  initWorkspaceAuth, 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken,
  signOutGoogleWorkspace,
  listGoogleSheets, 
  createGoogleSpreadsheet,
  getGoogleSpreadsheet,
  getGoogleSpreadsheetValues,
  updateGoogleSpreadsheetValues,
  deleteDriveFile,
  GoogleDriveFile,
  GoogleSpreadsheetMetadata
} from '../services/googleWorkspaceService';

export default function ModuleGoogleSheets() {
  const context = useContext(ChurchContext);
  const { db, addToast } = context || { db: {}, addToast: () => {} };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetsList, setSheetsList] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'viewer' | 'templates'>('list');

  // Selected Spreadsheet & Content
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [spreadsheetMetadata, setSpreadsheetMetadata] = useState<GoogleSpreadsheetMetadata | null>(null);
  const [selectedSheetTab, setSelectedSheetTab] = useState<string>('');
  const [cellData, setCellData] = useState<(string | number)[][]>([]);
  const [loadingCells, setLoadingCells] = useState(false);

  // New spreadsheet modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [creatingSheet, setCreatingSheet] = useState(false);

  // Confirmation Modal for Destructive Operations (Required by Skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete_file' | 'save_cells' | 'export_data';
    payload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'delete_file'
  });

  // Cell editing state
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingCells, setIsSavingCells] = useState(false);

  // Initialize auth
  useEffect(() => {
    const unsub = initWorkspaceAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    const token = getWorkspaceAccessToken();
    if (token) {
      setAccessToken(token);
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Fetch spreadsheets list when token is available
  useEffect(() => {
    if (accessToken) {
      loadSheets();
    }
  }, [accessToken]);

  const loadSheets = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const files = await listGoogleSheets(accessToken, searchQuery);
      setSheetsList(files);
    } catch (err: any) {
      console.error('Erro ao carregar planilhas:', err);
      addToast(err?.message || 'Falha ao buscar planilhas do Google Drive.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogleWorkspace();
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      addToast('Conectado com sucesso ao Google Sheets & Workspace!', 'success');
    } catch (err: any) {
      console.error('Erro de login:', err);
      addToast(err?.message || 'Não foi possível conectar a conta Google.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setCurrentUser(null);
    setAccessToken(null);
    setSheetsList([]);
    setSelectedFile(null);
    setSpreadsheetMetadata(null);
    setActiveTab('list');
    addToast('Desconectado do Google Workspace.', 'info');
  };

  // Open a sheet in the viewer
  const handleOpenSheet = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    setSelectedFile(file);
    setActiveTab('viewer');
    setLoadingCells(true);
    setHasUnsavedChanges(false);

    try {
      const meta = await getGoogleSpreadsheet(accessToken, file.id);
      setSpreadsheetMetadata(meta);
      const firstTab = meta.sheets?.[0]?.properties?.title || 'Página1';
      setSelectedSheetTab(firstTab);
      await loadSheetValues(file.id, firstTab);
    } catch (err: any) {
      console.error('Erro ao abrir planilha:', err);
      addToast(err?.message || 'Erro ao carregar os dados da planilha.', 'error');
    } finally {
      setLoadingCells(false);
    }
  };

  const loadSheetValues = async (fileId: string, sheetTitle: string) => {
    if (!accessToken) return;
    setLoadingCells(true);
    try {
      const values = await getGoogleSpreadsheetValues(accessToken, fileId, `${sheetTitle}!A1:Z100`);
      setCellData(values || []);
    } catch (err: any) {
      console.error('Erro ao carregar valores da aba:', err);
      addToast(err?.message || 'Erro ao carregar células.', 'error');
    } finally {
      setLoadingCells(false);
    }
  };

  const handleTabChange = async (tabTitle: string) => {
    if (!selectedFile) return;
    setSelectedSheetTab(tabTitle);
    await loadSheetValues(selectedFile.id, tabTitle);
  };

  // Create new blank or custom spreadsheet
  const handleCreateNew = async () => {
    if (!accessToken || !newSheetTitle.trim()) return;
    setCreatingSheet(true);
    try {
      const created = await createGoogleSpreadsheet(accessToken, newSheetTitle.trim(), ['Item', 'Categoria', 'Data', 'Valor (R$)', 'Observações']);
      addToast('Planilha criada com sucesso no seu Google Drive!', 'success');
      setShowCreateModal(false);
      setNewSheetTitle('');
      await loadSheets();
      // Open the new sheet
      handleOpenSheet({
        id: created.spreadsheetId,
        name: created.properties.title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        webViewLink: created.spreadsheetUrl
      });
    } catch (err: any) {
      console.error('Erro ao criar planilha:', err);
      addToast(err?.message || 'Falha ao criar planilha.', 'error');
    } finally {
      setCreatingSheet(false);
    }
  };

  // Create from preset templates
  const handleCreateFromTemplate = async (templateType: 'financas' | 'membros' | 'ebd' | 'patrimonio') => {
    if (!accessToken) return;
    setLoading(true);
    try {
      let title = '';
      let headers: string[] = [];
      let initialRows: (string | number)[][] = [];

      if (templateType === 'financas') {
        title = `Controle Financeiro & Dízimos - ${db?.igreja?.nome || 'Igreja'}`;
        headers = ['Data', 'Tipo', 'Categoria', 'Descrição / Membro', 'Valor (R$)', 'Forma de Pagamento', 'Status'];
        initialRows = [
          [new Date().toLocaleDateString('pt-BR'), 'Entrada', 'Dízimo', 'Dízimo Culto de Celebração', 1500.00, 'PIX', 'Confirmado'],
          [new Date().toLocaleDateString('pt-BR'), 'Entrada', 'Oferta', 'Oferta Geral do Culto', 450.00, 'Dinheiro', 'Confirmado'],
          [new Date().toLocaleDateString('pt-BR'), 'Saída', 'Utilidades', 'Energia Elétrica Templo Sede', 620.50, 'Boleto', 'Pago']
        ];
      } else if (templateType === 'membros') {
        title = `Rol de Membros & Liderança - ${db?.igreja?.nome || 'Igreja'}`;
        headers = ['Nome Completo', 'Cargo / Função', 'Telefone / WhatsApp', 'E-mail', 'Data de Batismo', 'Congregação'];
        const churchMembers = (db?.membros || []).slice(0, 10);
        if (churchMembers.length > 0) {
          initialRows = churchMembers.map((m: any) => [
            m.nome || '',
            m.cargo || m.funcao || 'Membro',
            m.telefone || '',
            m.email || '',
            m.data_batismo || '',
            m.congregacao || 'Sede'
          ]);
        } else {
          initialRows = [
            ['Pr. Presidente Exemplo', 'Pastor Presidente', '(11) 99999-0001', 'pastor@igreja.com.br', '10/05/2010', 'Sede'],
            ['Irmão Cooperador', 'Diácono', '(11) 99999-0002', 'diacono@igreja.com.br', '15/08/2018', 'Sede']
          ];
        }
      } else if (templateType === 'ebd') {
        title = `Escola Bíblica Dominical (EBD) - Frequência & Matrículas`;
        headers = ['Nome do Aluno', 'Classe', 'Professor', 'Presença Dom 1', 'Presença Dom 2', 'Presença Dom 3', 'Presença Dom 4', 'Bíblia', 'Revista'];
        initialRows = [
          ['Aluno Exemplo 1', 'Adultos - Doutrina', 'Pr. Professor', 'P', 'P', 'P', 'P', 'Sim', 'Sim'],
          ['Aluno Exemplo 2', 'Jovens - Fé Prática', 'Irmão Lider', 'P', 'F', 'P', 'P', 'Sim', 'Não']
        ];
      } else if (templateType === 'patrimonio') {
        title = `Inventário e Patrimônio Eclesiástico - ${db?.igreja?.nome || 'Igreja'}`;
        headers = ['Código', 'Item / Descrição', 'Categoria', 'Setor / Sala', 'Estado de Conservação', 'Valor Estimado (R$)'];
        initialRows = [
          ['PAT-001', 'Mesa de Som Digital 32 Canais', 'Áudio & Mídia', 'Nave Principal', 'Ótimo', 12500.00],
          ['PAT-002', 'Projetor Laser 4500 Lumens', 'Vídeo', 'Altar', 'Bom', 4800.00],
          ['PAT-003', 'Conjunto de Cadeiras Estofadas (100 un)', 'Mobiliário', 'Templo', 'Excelente', 15000.00]
        ];
      }

      const created = await createGoogleSpreadsheet(accessToken, title, headers, initialRows);
      addToast(`Planilha "${title}" criada com sucesso no Google Drive!`, 'success');
      await loadSheets();
      handleOpenSheet({
        id: created.spreadsheetId,
        name: created.properties.title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        webViewLink: created.spreadsheetUrl
      });
    } catch (err: any) {
      console.error('Erro ao criar modelo:', err);
      addToast(err?.message || 'Erro ao gerar planilha modelo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export existing system data to a new Google Sheet
  const handleExportSystemData = (type: 'membros' | 'entradas' | 'saidas' | 'patrimonio') => {
    let title = '';
    let description = '';
    let count = 0;

    if (type === 'membros') {
      count = (db?.membros || []).length;
      title = 'Exportar Rol de Membros para o Google Sheets';
      description = `Será criada uma nova planilha no seu Google Drive contendo os dados cadastrais de ${count} membros registrados no sistema.`;
    } else if (type === 'entradas') {
      count = (db?.fin_entradas || []).length;
      title = 'Exportar Dízimos e Entradas para o Google Sheets';
      description = `Será criada uma nova planilha no seu Google Drive com o histórico de ${count} lançamentos financeiros de entradas e dízimos.`;
    } else if (type === 'saidas') {
      count = (db?.fin_saidas || []).length;
      title = 'Exportar Saídas e Despesas para o Google Sheets';
      description = `Será criada uma nova planilha no seu Google Drive com o registro de ${count} pagamentos e saídas financeiras.`;
    } else if (type === 'patrimonio') {
      count = (db?.patrimonio || []).length;
      title = 'Exportar Patrimônio e Inventário para o Google Sheets';
      description = `Será criada uma nova planilha no seu Google Drive com ${count} itens de bens e patrimônio eclesiástico.`;
    }

    setConfirmModal({
      isOpen: true,
      title,
      description,
      actionType: 'export_data',
      payload: { type }
    });
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!accessToken) return;
    const { actionType, payload } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    if (actionType === 'delete_file') {
      const fileId = payload?.fileId;
      if (!fileId) return;
      setLoading(true);
      try {
        await deleteDriveFile(accessToken, fileId);
        addToast('Planilha excluída do Google Drive.', 'success');
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
          setSpreadsheetMetadata(null);
          setActiveTab('list');
        }
        await loadSheets();
      } catch (err: any) {
        console.error('Erro ao excluir planilha:', err);
        addToast(err?.message || 'Falha ao excluir planilha.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (actionType === 'save_cells') {
      if (!selectedFile || !selectedSheetTab) return;
      setIsSavingCells(true);
      try {
        await updateGoogleSpreadsheetValues(
          accessToken,
          selectedFile.id,
          `${selectedSheetTab}!A1`,
          cellData
        );
        setHasUnsavedChanges(false);
        addToast('Alterações salvas com sucesso no Google Sheets!', 'success');
      } catch (err: any) {
        console.error('Erro ao salvar células:', err);
        addToast(err?.message || 'Falha ao salvar modificações.', 'error');
      } finally {
        setIsSavingCells(false);
      }
    } else if (actionType === 'export_data') {
      const type = payload?.type;
      setLoading(true);
      try {
        let sheetTitle = '';
        let headers: string[] = [];
        let rows: (string | number)[][] = [];

        if (type === 'membros') {
          sheetTitle = `GIPP - Rol de Membros (${new Date().toLocaleDateString('pt-BR')})`;
          headers = ['Código', 'Nome Completo', 'CPF', 'Telefone', 'E-mail', 'Cargo', 'Estado Civil', 'Data Nascimento', 'Data Batismo', 'Congregação'];
          rows = (db?.membros || []).map((m: any) => [
            m.id || '',
            m.nome || '',
            m.cpf || '',
            m.telefone || '',
            m.email || '',
            m.cargo || m.funcao || 'Membro',
            m.estado_civil || '',
            m.data_nascimento || '',
            m.data_batismo || '',
            m.congregacao || 'Sede'
          ]);
        } else if (type === 'entradas') {
          sheetTitle = `GIPP - Entradas & Dízimos (${new Date().toLocaleDateString('pt-BR')})`;
          headers = ['Data', 'Tipo', 'Categoria', 'Membro / Pagador', 'Valor (R$)', 'Forma Pagamento', 'Observações'];
          rows = (db?.fin_entradas || []).map((e: any) => [
            e.data || '',
            e.tipo || 'Dízimo',
            e.categoria || 'Entrada Geral',
            e.membro_nome || e.nome || 'Anônimo',
            Number(e.valor || 0),
            e.forma_pagamento || 'PIX',
            e.observacao || ''
          ]);
        } else if (type === 'saidas') {
          sheetTitle = `GIPP - Saídas & Contas (${new Date().toLocaleDateString('pt-BR')})`;
          headers = ['Data Vencimento', 'Data Pagamento', 'Categoria', 'Favorecido / Fornecedor', 'Valor (R$)', 'Forma Pagamento', 'Status'];
          rows = (db?.fin_saidas || []).map((s: any) => [
            s.data_vencimento || s.data || '',
            s.data_pagamento || '',
            s.categoria || 'Despesa',
            s.favorecido || s.fornecedor || '',
            Number(s.valor || 0),
            s.forma_pagamento || 'Boleto',
            s.status || 'Pago'
          ]);
        } else if (type === 'patrimonio') {
          sheetTitle = `GIPP - Patrimônio Eclesiástico (${new Date().toLocaleDateString('pt-BR')})`;
          headers = ['Código', 'Descrição do Item', 'Categoria', 'Localização / Sala', 'Estado', 'Valor Estimado (R$)', 'Data Aquisição'];
          rows = (db?.patrimonio || []).map((p: any) => [
            p.codigo || p.id || '',
            p.nome || p.descricao || '',
            p.categoria || '',
            p.local || p.setor || '',
            p.estado || 'Bom',
            Number(p.valor || 0),
            p.data_aquisicao || ''
          ]);
        }

        const created = await createGoogleSpreadsheet(accessToken, sheetTitle, headers, rows);
        addToast(`Dados exportados com sucesso! Criada a planilha "${sheetTitle}".`, 'success');
        await loadSheets();
        handleOpenSheet({
          id: created.spreadsheetId,
          name: created.properties.title,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          webViewLink: created.spreadsheetUrl
        });
      } catch (err: any) {
        console.error('Erro ao exportar dados:', err);
        addToast(err?.message || 'Falha ao exportar dados para Google Sheets.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Cell edit handlers
  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: string | number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditingValue(currentValue !== undefined && currentValue !== null ? String(currentValue) : '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    const { row, col } = editingCell;
    const newData = [...cellData];
    
    // Ensure rows exist
    while (newData.length <= row) {
      newData.push([]);
    }
    // Ensure cols exist
    while (newData[row].length <= col) {
      newData[row].push('');
    }

    newData[row][col] = isNaN(Number(editingValue)) || editingValue.trim() === '' ? editingValue : Number(editingValue);
    setCellData(newData);
    setEditingCell(null);
    setHasUnsavedChanges(true);
  };

  // If not authenticated, render Google Sign-In Card
  if (!accessToken) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
            <FileSpreadsheet size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Integração Oficial com Google Sheets
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Conecte sua conta Google Workspace para criar, gerenciar, visualizar e sincronizar relatórios,
            dízimos, listas de membros e inventários da igreja diretamente em planilhas na nuvem com permissão do usuário.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="gsi-material-button w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isAuthenticating ? 'Conectando com o Google...' : 'Entrar com o Google'}</span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-8 border-t border-slate-150">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Database size={16} className="text-emerald-600"/>
                <span>Exportação Direta</span>
              </div>
              <p className="text-xs text-slate-500">Exporte membros, dízimos e tesouraria para novas planilhas em 1 clique.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Table size={16} className="text-emerald-600"/>
                <span>Visualizador Integrado</span>
              </div>
              <p className="text-xs text-slate-500">Visualize e edite células e abas diretamente no sistema sem sair da tela.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Sparkles size={16} className="text-emerald-600"/>
                <span>Modelos Eclesiásticos</span>
              </div>
              <p className="text-xs text-slate-500">Estruturas prontas para EBD, finanças de congregações e patrimônio.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
            <FileSpreadsheet size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Google Sheets</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Conectado como <strong className="text-slate-700">{currentUser?.displayName || currentUser?.email || 'Usuário Google'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {activeTab === 'viewer' && (
            <button
              onClick={() => setActiveTab('list')}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Voltar à Lista
            </button>
          )}

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Sparkles size={14} /> Modelos & Exportação
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Nova Planilha
          </button>

          <button
            onClick={handleSignOut}
            title="Desconectar conta Google"
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search & Refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar planilhas no Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSheets()}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={loadSheets}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Spreadsheets Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <RefreshCw className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
              <p className="text-sm font-bold text-slate-700">Buscando planilhas no Google Drive...</p>
            </div>
          ) : sheetsList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <FileSpreadsheet className="text-slate-300 mx-auto" size={48} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Nenhuma planilha encontrada</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Crie uma nova planilha ou utilize nossos modelos para começar a organizar as finanças e departamentos.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} /> Criar Primeira Planilha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheetsList.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="flex items-center gap-1">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir no Google Sheets Oficial"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: `Excluir "${file.name}"?`,
                              description: 'Esta ação moverá o arquivo para a lixeira do Google Drive com permissão do usuário.',
                              actionType: 'delete_file',
                              payload: { fileId: file.id }
                            });
                          }}
                          title="Excluir planilha"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                      {file.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Modificado em: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenSheet(file)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={12} /> Abrir & Editar
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Google Sheet
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates & Data Export Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-fade-in">
          {/* Eclesiastic Templates */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                Modelos de Planilhas Eclesiásticas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere instantaneamente planilhas estruturadas prontas para uso no seu Google Drive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    R$
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Controle Financeiro</h3>
                  <p className="text-xs text-slate-500 mb-4">Planilha de Dízimos, Ofertas, saídas por categoria e saldo mensal.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('financas')}
                  disabled={loading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Criar Planilha
                </button>
              </div>

              <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <Table size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Rol de Membros</h3>
                  <p className="text-xs text-slate-500 mb-4">Cadastro de membresia, cargos, batismo e contatos da igreja.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('membros')}
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Criar Planilha
                </button>
              </div>

              <div className="p-5 bg-gradient-to-br from-purple-50/50 to-white rounded-2xl border border-purple-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    EBD
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Escola Dominical</h3>
                  <p className="text-xs text-slate-500 mb-4">Chamada de alunos, frequência semanal e controle de revistas.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('ebd')}
                  disabled={loading}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Criar Planilha
                </button>
              </div>

              <div className="p-5 bg-gradient-to-br from-amber-50/50 to-white rounded-2xl border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    PAT
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Patrimônio & Bens</h3>
                  <p className="text-xs text-slate-500 mb-4">Inventário de instrumentos, som, móveis e equipamentos.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('patrimonio')}
                  disabled={loading}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Criar Planilha
                </button>
              </div>
            </div>
          </div>

          {/* Direct System Export */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Database className="text-emerald-600" size={20} />
                Exportar Dados Cadastrados para Google Sheets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie dados em tempo real da base de dados do sistema diretamente para planilhas no seu Drive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-black text-slate-800 text-sm block mb-1">Membros Ativos</span>
                  <span className="text-xs text-slate-500">{(db?.membros || []).length} registros disponíveis</span>
                </div>
                <button
                  onClick={() => handleExportSystemData('membros')}
                  className="mt-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Exportar Membros
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-black text-slate-800 text-sm block mb-1">Entradas & Dízimos</span>
                  <span className="text-xs text-slate-500">{(db?.fin_entradas || []).length} lançamentos</span>
                </div>
                <button
                  onClick={() => handleExportSystemData('entradas')}
                  className="mt-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Exportar Entradas
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-black text-slate-800 text-sm block mb-1">Despesas & Saídas</span>
                  <span className="text-xs text-slate-500">{(db?.fin_saidas || []).length} contas</span>
                </div>
                <button
                  onClick={() => handleExportSystemData('saidas')}
                  className="mt-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Exportar Saídas
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-black text-slate-800 text-sm block mb-1">Patrimônio da Igreja</span>
                  <span className="text-xs text-slate-500">{(db?.patrimonio || []).length} itens inventariados</span>
                </div>
                <button
                  onClick={() => handleExportSystemData('patrimonio')}
                  className="mt-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Exportar Bens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Viewer & Cell Editor */}
      {activeTab === 'viewer' && selectedFile && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-scale-in">
          {/* Viewer Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-base leading-tight">
                  {selectedFile.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Aba:</span>
                  <select
                    value={selectedSheetTab}
                    onChange={(e) => handleTabChange(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2 py-0.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {spreadsheetMetadata?.sheets?.map(s => (
                      <option key={s.properties.sheetId} value={s.properties.title}>
                        {s.properties.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Salvar alterações na planilha?',
                      description: 'As células modificadas serão gravadas diretamente no Google Sheets.',
                      actionType: 'save_cells'
                    });
                  }}
                  disabled={isSavingCells}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> {isSavingCells ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              )}

              {selectedFile.webViewLink && (
                <a
                  href={selectedFile.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} /> Abrir no Google Sheets
                </a>
              )}
            </div>
          </div>

          {/* Grid Table Display */}
          <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] custom-scrollbar">
            {loadingCells ? (
              <div className="py-20 text-center">
                <RefreshCw className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                <p className="text-xs font-bold text-slate-500">Carregando células da planilha...</p>
              </div>
            ) : cellData.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <Table size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Esta aba está vazia no momento.</p>
              </div>
            ) : (
              <table className="w-full border-collapse border border-slate-200 text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 border-r border-slate-200 w-12 text-center text-[10px] text-slate-400 bg-slate-150">
                      #
                    </th>
                    {cellData[0]?.map((_, colIdx) => (
                      <th key={colIdx} className="p-2.5 border-r border-slate-200 tracking-wider">
                        {String.fromCharCode(65 + (colIdx % 26))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cellData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 bg-slate-50">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, colIdx) => {
                        const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                        return (
                          <td
                            key={colIdx}
                            onClick={() => handleCellClick(rowIdx, colIdx, cell)}
                            className={`p-2 border-r border-slate-100 transition-colors cursor-pointer min-w-[120px] ${
                              isEditing ? 'bg-emerald-100/60 ring-2 ring-emerald-500' : 'hover:bg-slate-50'
                            }`}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={handleCellSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-full bg-white px-1.5 py-0.5 rounded text-xs text-slate-900 border border-emerald-400 focus:outline-none"
                              />
                            ) : (
                              <span className="text-slate-800 select-none block truncate">
                                {cell !== undefined && cell !== null ? String(cell) : ''}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dica: Clique em qualquer célula para editar seu conteúdo.</span>
            <span>{cellData.length} linhas carregadas</span>
          </div>
        </div>
      )}

      {/* Modal: Create New Spreadsheet */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <FileSpreadsheet size={20} />
                <span>Nova Planilha Google Sheets</span>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Título da Planilha
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Prestação de Contas Congresso 2026"
                value={newSheetTitle}
                onChange={(e) => setNewSheetTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNew}
                disabled={creatingSheet || !newSheetTitle.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creatingSheet ? 'Criando no Drive...' : 'Criar Planilha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Operations (Required by Skill) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                {confirmModal.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Confirmar e Prosseguir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
