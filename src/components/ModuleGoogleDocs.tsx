import React, { useState, useEffect, useContext } from 'react';
import { 
  FileText, Plus, ExternalLink, RefreshCw, Trash2, Edit3, 
  Search, Check, AlertCircle, Sparkles, Download, BookOpen,
  Eye, Save, X, ArrowLeft, ShieldAlert, LogOut, FileSignature,
  FileCheck2, ScrollText, Award
} from 'lucide-react';
import { ChurchContext } from '../App';
import { 
  initWorkspaceAuth, 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken,
  signOutGoogleWorkspace,
  listGoogleDocs, 
  createGoogleDocument,
  getGoogleDocument,
  appendGoogleDocumentText,
  deleteDriveFile,
  GoogleDriveFile,
  GoogleDocument
} from '../services/googleWorkspaceService';

export default function ModuleGoogleDocs() {
  const context = useContext(ChurchContext);
  const { db, addToast } = context || { db: {}, addToast: () => {} };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docsList, setDocsList] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'viewer' | 'templates'>('list');

  // Selected Doc & Content
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [docContent, setDocContent] = useState<GoogleDocument | null>(null);
  const [docPlainText, setDocPlainText] = useState<string>('');
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Append text state
  const [textToAppend, setTextToAppend] = useState('');
  const [isAppending, setIsAppending] = useState(false);

  // New doc modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);

  // Confirmation Modal for Destructive Operations (Required by Skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete_file' | 'append_text' | 'create_template';
    payload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'delete_file'
  });

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

  // Fetch docs list when token is available
  useEffect(() => {
    if (accessToken) {
      loadDocs();
    }
  }, [accessToken]);

  const loadDocs = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const files = await listGoogleDocs(accessToken, searchQuery);
      setDocsList(files);
    } catch (err: any) {
      console.error('Erro ao carregar documentos:', err);
      addToast(err?.message || 'Falha ao buscar documentos do Google Drive.', 'error');
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
      addToast('Conectado com sucesso ao Google Docs & Workspace!', 'success');
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
    setDocsList([]);
    setSelectedFile(null);
    setDocContent(null);
    setActiveTab('list');
    addToast('Desconectado do Google Workspace.', 'info');
  };

  // Open a doc in the viewer
  const handleOpenDoc = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    setSelectedFile(file);
    setActiveTab('viewer');
    setLoadingDoc(true);
    setTextToAppend('');

    try {
      const doc = await getGoogleDocument(accessToken, file.id);
      setDocContent(doc);

      // Extract raw text from doc structural elements
      let extracted = '';
      if (doc.body?.content) {
        for (const item of doc.body.content) {
          if (item.paragraph?.elements) {
            for (const elem of item.paragraph.elements) {
              if (elem.textRun?.content) {
                extracted += elem.textRun.content;
              }
            }
          }
        }
      }
      setDocPlainText(extracted);
    } catch (err: any) {
      console.error('Erro ao abrir documento:', err);
      addToast(err?.message || 'Erro ao carregar o conteúdo do documento.', 'error');
    } finally {
      setLoadingDoc(false);
    }
  };

  // Create new blank document
  const handleCreateNew = async () => {
    if (!accessToken || !newDocTitle.trim()) return;
    setCreatingDoc(true);
    try {
      const churchName = db?.igreja?.nome || 'Igreja Evangélica Assembleia de Deus';
      const initialHeader = `${churchName.toUpperCase()}\nSecretaria Pastoral e Geral\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
      const created = await createGoogleDocument(accessToken, newDocTitle.trim(), initialHeader);
      addToast('Documento criado com sucesso no seu Google Drive!', 'success');
      setShowCreateModal(false);
      setNewDocTitle('');
      await loadDocs();
      // Open the new doc
      handleOpenDoc({
        id: created.documentId,
        name: created.title,
        mimeType: 'application/vnd.google-apps.document',
        webViewLink: `https://docs.google.com/document/d/${created.documentId}/edit`
      });
    } catch (err: any) {
      console.error('Erro ao criar documento:', err);
      addToast(err?.message || 'Falha ao criar documento.', 'error');
    } finally {
      setCreatingDoc(false);
    }
  };

  // Create document from ecclesiastical templates (CGADB / CPAD)
  const handleCreateFromTemplate = async (templateKey: 'oficio' | 'carta_mudanca' | 'ata_reuniao' | 'certificado_obreiro' | 'apresentacao_crianca') => {
    if (!accessToken) return;
    const churchName = db?.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS';
    const pastorName = db?.igreja?.pastor_presidente || 'Pastor Presidente';
    const cnpj = db?.igreja?.cnpj || '00.000.000/0001-00';
    const cidade = db?.igreja?.cidade || 'São Paulo';
    const uf = db?.igreja?.uf || 'SP';
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    let title = '';
    let content = '';

    if (templateKey === 'oficio') {
      title = `Ofício Pastoral Nº 01/${new Date().getFullYear()} - ${churchName}`;
      content = `${churchName.toUpperCase()}\n` +
        `CNPJ: ${cnpj} | Ministério / CGADB\n` +
        `Gabinete da Presidência Pastoral\n\n` +
        `OFÍCIO PASTORAL Nº 01/${new Date().getFullYear()}\n\n` +
        `${cidade}-${uf}, ${dataAtual}.\n\n` +
        `A Sua Reverendíssima / Aos Cuidados de:\n` +
        `[Nome do Destinatário ou Instituição]\n` +
        `[Cargo / Função / Cidade]\n\n` +
        `Assunto: [Inserir o Assunto do Ofício]\n\n` +
        `Graça e Paz vos sejam multiplicadas da parte de Nosso Senhor e Salvador Jesus Cristo.\n\n` +
        `Por meio do presente instrumento eclesiástico, vimos mui respeitosamente solicitar/comunicar que [Descrever os detalhes da solicitação pastoral, permissão de uso de espaço, cooperação interdenominacional ou deliberação da diretoria].\n\n` +
        `Certos de contarmos com vossa habitual atenção e apreço fraternal no Senhor, renovamos nossos sinceros protestos de estima e consideração cristã.\n\n` +
        `Fraternalmente em Cristo Jesus,\n\n\n` +
        `_____________________________________________\n` +
        `${pastorName}\n` +
        `Pastor Presidente - ${churchName}\n`;
    } else if (templateKey === 'carta_mudanca') {
      title = `Carta de Recomendação e Mudança - ${churchName}`;
      content = `${churchName.toUpperCase()}\n` +
        `Secretaria Geral Eclesiástica | CGADB / CPAD\n\n` +
        `CARTA DE RECOMENDAÇÃO E MUDANÇA DE MEMBRESIA\n\n` +
        `À Amada Igreja Evangélica Assembleia de Deus em [Cidade de Destino - UF]\n` +
        `Aos Cuidados do Digníssimo Pastor [Nome do Pastor Destinatário]\n\n` +
        `Saudações no Senhor Jesus Cristo!\n\n` +
        `Pela presente, temos a honra e a grata satisfação de vos recomendar o(a) nosso(a) amado(a) irmão(ã) em Cristo:\n\n` +
        `Nome do(a) Membro: [Nome Completo do Membro]\n` +
        `Estado Civil: [Casado(a) / Solteiro(a)]\n` +
        `Data do Batismo em Águas: [DD/MM/AAAA] (Exclusivamente por Imersão)\n` +
        `Batismo no Espírito Santo: [Sim / Não]\n` +
        `Cargo / Função Eclesiástica: [Membro / Cooperador / Diácono / Presbítero]\n\n` +
        `Declaramos que o(a) referido(a) irmão(ã) tem mantido uma conduta exemplar, em plena comunhão com esta igreja local e com a Declaração de Fé da nossa denominação, não constando nada em nossos registros que desabone sua idoneidade moral ou espiritual.\n\n` +
        `Recomendamos-vos que o(a) recebaís no Senhor como convém aos santos.\n\n` +
        `${cidade}-${uf}, ${dataAtual}.\n\n\n` +
        `_____________________________________________          _____________________________________________\n` +
        `${pastorName} - Pastor Presidente                     Secretário(a) Geral da Igreja\n`;
    } else if (templateKey === 'ata_reuniao') {
      title = `Ata de Reunião da Diretoria e Obreiros - ${churchName}`;
      content = `${churchName.toUpperCase()}\n` +
        `Livro Oficial de Atas e Deliberações Pastorais\n\n` +
        `ATA DA REUNIÃO ORDINÁRIA DA DIRETORIA E CORPO DE OBREIROS Nº 01/${new Date().getFullYear()}\n\n` +
        `Aos [Dia] dias do mês de [Mês] do ano de ${new Date().getFullYear()}, às [Horário] horas, no templo sede da ${churchName}, sito à [Endereço da Igreja], sob a presidência do Reverendíssimo Pastor ${pastorName}, reuniu-se a Diretoria Executiva e o Ministério de Obreiros para deliberar sobre a seguinte ordem do dia:\n\n` +
        `PAUTA DA REUNIÃO:\n` +
        `1. Abertura com leitura bíblica e oração;\n` +
        `2. Prestação de contas financeiras da Tesouraria Geral;\n` +
        `3. Escala dos cultos de Santa Ceia e congregações filiais;\n` +
        `4. Calendário dos eventos, congressos e missões para o trimestre;\n` +
        `5. Assuntos gerais e encaminhamentos.\n\n` +
        `DELIBERAÇÕES E REGISTROS:\n` +
        `Iniciada a reunião com a oração conduzida pelo Pastor Presidente, procedeu-se à discussão dos temas da pauta, tendo sido aprovado por unanimidade que [Registrar decisões tomadas].\n\n` +
        `Nada mais havendo a tratar, lavrou-se a presente ata que, lida e achada conforme, vai devidamente assinada pela diretoria presente.\n\n` +
        `${cidade}-${uf}, ${dataAtual}.\n\n\n` +
        `_____________________________________________          _____________________________________________\n` +
        `${pastorName} - Pastor Presidente                     Secretário(a) da Reunião\n`;
    } else if (templateKey === 'certificado_obreiro') {
      title = `Certificado de Consagração de Obreiro - ${churchName}`;
      content = `${churchName.toUpperCase()}\n` +
        `Convenção Geral das Assembleias de Deus no Brasil\n\n` +
        `CERTIFICADO DE CONSAGRAÇÃO ECLESIÁSTICA\n\n` +
        `Certificamos que o amado irmão [NOME COMPLETO DO OBREIRO], havendo sido examinado na Santa Palavra de Deus e achado digno pelo testemunho de sua vida cristã e vocação ministerial, foi solenemente consagrado e investido no sagrado ofício de:\n\n` +
        `[ DIÁCONO / PRESBÍTERO / EVANGELISTA ]\n\n` +
        `conforme os preceitos das Sagradas Escrituras (1 Timóteo 3:1-13; Tito 1:5-9) e os Estatutos eclesiásticos desta igreja, com a imposição de mãos do Ministério Pastoral.\n\n` +
        `Dado e passado na sede da ${churchName}, aos ${dataAtual}.\n\n\n` +
        `_____________________________________________          _____________________________________________\n` +
        `${pastorName} - Pastor Presidente                     Pastor Vice-Presidente\n`;
    } else if (templateKey === 'apresentacao_crianca') {
      title = `Certidão de Apresentação de Criança - ${churchName}`;
      content = `${churchName.toUpperCase()}\n` +
        `Secretaria de Membresia e Registro Eclesiástico\n\n` +
        `CERTIDÃO DE APRESENTAÇÃO DE CRIANÇA AO SENHOR\n\n` +
        `Certificamos para os devidos fins que, aos [Dia] dias do mês de [Mês] de [Ano], foi apresentado(a) solenemente perante Deus e a Igreja reunida, conforme o costume bíblico (Lucas 2:22; Mateus 19:13-15):\n\n` +
        `A CRIANÇA: [Nome Completo da Criança]\n` +
        `Nascido(a) aos: [Data de Nascimento]\n` +
        `Filho(a) de: [Nome do Pai] e [Nome da Mãe]\n\n` +
        `Sendo impetrada sobre a vida desta criança a bênção apostólica em nome do Pai, do Filho e do Espírito Santo.\n\n` +
        `${cidade}-${uf}, ${dataAtual}.\n\n\n` +
        `_____________________________________________\n` +
        `${pastorName} - Pastor Celebrante\n`;
    }

    setLoading(true);
    try {
      const created = await createGoogleDocument(accessToken, title, content);
      addToast(`Documento "${title}" criado com sucesso no Google Docs!`, 'success');
      await loadDocs();
      handleOpenDoc({
        id: created.documentId,
        name: created.title,
        mimeType: 'application/vnd.google-apps.document',
        webViewLink: `https://docs.google.com/document/d/${created.documentId}/edit`
      });
    } catch (err: any) {
      console.error('Erro ao criar modelo:', err);
      addToast(err?.message || 'Erro ao gerar modelo no Google Docs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Append additional notes/paragraphs to the open doc
  const handleAppendText = async () => {
    if (!accessToken || !selectedFile || !textToAppend.trim()) return;

    setConfirmModal({
      isOpen: true,
      title: 'Inserir texto no Google Docs?',
      description: `O novo parágrafo será anexado ao final do documento "${selectedFile.name}" no Google Drive com permissão do usuário.`,
      actionType: 'append_text',
      payload: { text: textToAppend }
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
        addToast('Documento excluído do Google Drive.', 'success');
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
          setDocContent(null);
          setActiveTab('list');
        }
        await loadDocs();
      } catch (err: any) {
        console.error('Erro ao excluir documento:', err);
        addToast(err?.message || 'Falha ao excluir documento.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (actionType === 'append_text') {
      const text = payload?.text;
      if (!selectedFile || !text) return;
      setIsAppending(true);
      try {
        await appendGoogleDocumentText(accessToken, selectedFile.id, text);
        setTextToAppend('');
        addToast('Texto adicionado ao documento no Google Docs!', 'success');
        // Refresh document content
        await handleOpenDoc(selectedFile);
      } catch (err: any) {
        console.error('Erro ao inserir texto:', err);
        addToast(err?.message || 'Falha ao atualizar documento.', 'error');
      } finally {
        setIsAppending(false);
      }
    }
  };

  // If not authenticated, render Google Sign-In Card
  if (!accessToken) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl mx-auto flex items-center justify-center text-blue-600 mb-6 shadow-inner">
            <FileText size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Integração Oficial com Google Docs
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Conecte sua conta Google Workspace para criar, gerenciar, emitir cartas de recomendação,
            ofícios pastorais, atas de obreiros e certificados eclesiásticos diretamente no Google Docs.
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
                <FileSignature size={16} className="text-blue-600"/>
                <span>Cartas e Ofícios</span>
              </div>
              <p className="text-xs text-slate-500">Cartas de recomendação de membros e ofícios pastorais com layout padrão.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <ScrollText size={16} className="text-blue-600"/>
                <span>Livro de Atas</span>
              </div>
              <p className="text-xs text-slate-500">Atas de diretoria e assembleias gerais armazenadas com segurança no Google Drive.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Award size={16} className="text-blue-600"/>
                <span>Certificados</span>
              </div>
              <p className="text-xs text-slate-500">Certificados de consagração de obreiros e apresentação de crianças no altar.</p>
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
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <FileText size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Google Docs</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
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
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Sparkles size={14} /> Modelos Eclesiásticos
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Novo Documento
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
                placeholder="Buscar documentos no Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDocs()}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={loadDocs}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Docs Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <RefreshCw className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
              <p className="text-sm font-bold text-slate-700">Buscando documentos no Google Drive...</p>
            </div>
          ) : docsList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <FileText className="text-slate-300 mx-auto" size={48} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Nenhum documento encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Crie um novo documento ou utilize nossos modelos eclesiásticos para ofícios, atas e cartas.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} /> Criar Primeiro Documento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docsList.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center gap-1">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir no Google Docs Oficial"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: `Excluir "${file.name}"?`,
                              description: 'Esta ação moverá o documento para a lixeira do Google Drive com permissão do usuário.',
                              actionType: 'delete_file',
                              payload: { fileId: file.id }
                            });
                          }}
                          title="Excluir documento"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                      {file.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Modificado em: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenDoc(file)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={12} /> Visualizar & Redigir
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Google Doc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} />
                Modelos Oficiais de Documentos Eclesiásticos (CGADB / CPAD)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere documentos ministeriais no Google Docs formatados conforme os padrões das Assembleias de Deus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Ofício Pastoral */}
              <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Ofício Pastoral Oficial</h3>
                  <p className="text-xs text-slate-500 mb-4">Comunicação eclesiástica formal para autoridades civis e eclesiásticas.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('oficio')}
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Gerar no Google Docs
                </button>
              </div>

              {/* Carta de Mudança */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <FileSignature size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Carta de Recomendação & Mudança</h3>
                  <p className="text-xs text-slate-500 mb-4">Transferência de membros em plena comunhão e testemunho cristão.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('carta_mudanca')}
                  disabled={loading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Gerar no Google Docs
                </button>
              </div>

              {/* Ata de Reunião */}
              <div className="p-5 bg-gradient-to-br from-purple-50/50 to-white rounded-2xl border border-purple-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <ScrollText size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Ata de Reunião de Diretoria</h3>
                  <p className="text-xs text-slate-500 mb-4">Registro solene de assembleias, prestação de contas e decisões de obreiros.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('ata_reuniao')}
                  disabled={loading}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Gerar no Google Docs
                </button>
              </div>

              {/* Certificado de Obreiro */}
              <div className="p-5 bg-gradient-to-br from-amber-50/50 to-white rounded-2xl border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <Award size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Certificado de Consagração</h3>
                  <p className="text-xs text-slate-500 mb-4">Diploma de consagração de Diáconos, Presbíteros e Evangelistas.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('certificado_obreiro')}
                  disabled={loading}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Gerar no Google Docs
                </button>
              </div>

              {/* Apresentação de Crianças */}
              <div className="p-5 bg-gradient-to-br from-rose-50/50 to-white rounded-2xl border border-rose-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black mb-3 shadow-sm">
                    <FileCheck2 size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Apresentação de Crianças</h3>
                  <p className="text-xs text-slate-500 mb-4">Certidão de bênção e dedicação de bebês e crianças no altar.</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate('apresentacao_crianca')}
                  disabled={loading}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Gerar no Google Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doc Viewer & Append Text Area */}
      {activeTab === 'viewer' && selectedFile && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-scale-in">
          {/* Viewer Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-base leading-tight">
                  {selectedFile.name}
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  ID: {selectedFile.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedFile.webViewLink && (
                <a
                  href={selectedFile.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} /> Editar no Google Docs
                </a>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Content Preview */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Conteúdo do Documento
              </h3>

              {loadingDoc ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <RefreshCw className="animate-spin text-blue-600 mx-auto mb-3" size={28} />
                  <p className="text-xs font-bold text-slate-500">Carregando conteúdo...</p>
                </div>
              ) : (
                <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl font-serif text-sm text-slate-800 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
                  {docPlainText || 'Nenhum texto encontrado neste documento.'}
                </div>
              )}
            </div>

            {/* Append Paragraph Tool */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Adicionar Parágrafo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Insira novos textos e registros ao final do documento oficial.
                </p>
              </div>

              <textarea
                rows={6}
                placeholder="Digite o novo parágrafo ou despacho pastoral para anexar..."
                value={textToAppend}
                onChange={(e) => setTextToAppend(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />

              <button
                onClick={handleAppendText}
                disabled={isAppending || !textToAppend.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} />
                <span>{isAppending ? 'Gravando...' : 'Anexar Texto ao Documento'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Document */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <FileText size={20} />
                <span>Novo Documento Google Docs</span>
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
                Título do Documento
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Ata de Reunião de Obreiros 2026"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                disabled={creatingDoc || !newDocTitle.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creatingDoc ? 'Criando no Drive...' : 'Criar Documento'}
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
