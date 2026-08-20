import React, { useState, useEffect, useContext } from 'react';
import { 
  CheckSquare, Plus, Trash2, Edit3, Search, Check, AlertCircle, 
  Sparkles, Calendar, Clock, ListTodo, CheckCircle2, Circle, 
  Layers, ShieldAlert, LogOut, RefreshCw, X, Tag, ListOrdered,
  BookOpen, Heart, Landmark, Users
} from 'lucide-react';
import { ChurchContext } from '../App';
import { 
  initWorkspaceAuth, 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken,
  signOutGoogleWorkspace,
  listGoogleTaskLists,
  createGoogleTaskList,
  deleteGoogleTaskList,
  listGoogleTasks,
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
  clearCompletedGoogleTasks,
  GoogleTaskList,
  GoogleTask
} from '../services/googleWorkspaceService';

export default function ModuleGoogleTasks() {
  const { db, addToast } = useContext(ChurchContext) || { db: {}, addToast: () => {} };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Task Lists
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  
  // Tasks
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    notes: string;
    due: string;
  }>({
    title: '',
    notes: '',
    due: ''
  });
  const [creatingTask, setCreatingTask] = useState(false);

  // Confirmation Modal for Destructive Operations (Required by Skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete_task' | 'delete_list' | 'clear_completed';
    payload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'delete_task'
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

  // Fetch task lists on login
  useEffect(() => {
    if (accessToken) {
      loadTaskLists();
    }
  }, [accessToken]);

  // Fetch tasks when selected list changes
  useEffect(() => {
    if (accessToken && selectedListId) {
      loadTasks(selectedListId);
    }
  }, [accessToken, selectedListId]);

  const loadTaskLists = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const lists = await listGoogleTaskLists(accessToken);
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar listas de tarefas:', err);
      addToast(err?.message || 'Falha ao buscar listas de tarefas do Google.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (listId: string) => {
    if (!accessToken || !listId) return;
    setLoadingTasks(true);
    try {
      const items = await listGoogleTasks(accessToken, listId, true);
      setTasks(items);
    } catch (err: any) {
      console.error('Erro ao carregar tarefas:', err);
      addToast(err?.message || 'Falha ao buscar tarefas.', 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogleWorkspace();
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      addToast('Conectado com sucesso ao Google Tasks & Workspace!', 'success');
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
    setTaskLists([]);
    setTasks([]);
    setSelectedListId('');
    addToast('Desconectado do Google Tasks.', 'info');
  };

  // Create new task list
  const handleCreateList = async () => {
    if (!accessToken || !newListTitle.trim()) return;
    setCreatingList(true);
    try {
      const created = await createGoogleTaskList(accessToken, newListTitle.trim());
      addToast(`Lista "${created.title}" criada no Google Tasks!`, 'success');
      setShowNewListModal(false);
      setNewListTitle('');
      await loadTaskLists();
      setSelectedListId(created.id);
    } catch (err: any) {
      console.error('Erro ao criar lista:', err);
      addToast(err?.message || 'Falha ao criar lista de tarefas.', 'error');
    } finally {
      setCreatingList(false);
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    if (!accessToken || !selectedListId || !taskForm.title.trim()) return;
    setCreatingTask(true);
    try {
      const payload: Partial<GoogleTask> = {
        title: taskForm.title.trim(),
        notes: taskForm.notes.trim() || undefined,
        status: 'needsAction'
      };

      if (taskForm.due) {
        // Convert to RFC 3339 timestamp
        payload.due = new Date(taskForm.due).toISOString();
      }

      await createGoogleTask(accessToken, selectedListId, payload);
      addToast('Tarefa criada no Google Tasks!', 'success');
      setShowNewTaskModal(false);
      setTaskForm({ title: '', notes: '', due: '' });
      await loadTasks(selectedListId);
    } catch (err: any) {
      console.error('Erro ao criar tarefa:', err);
      addToast(err?.message || 'Falha ao adicionar tarefa.', 'error');
    } finally {
      setCreatingTask(false);
    }
  };

  // Toggle task completed/pending status
  const handleToggleTask = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId || !task.id) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      await updateGoogleTask(accessToken, selectedListId, task.id, {
        status: newStatus
      });
      addToast(newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa marcada como pendente.', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar tarefa:', err);
      addToast(err?.message || 'Erro ao sincronizar status.', 'error');
      await loadTasks(selectedListId);
    }
  };

  // Add Church Checklist Template
  const handleAddTemplateChecklist = async (templateType: 'ceia' | 'batismo' | 'tesouraria' | 'ebd' | 'visitas') => {
    if (!accessToken || !selectedListId) return;
    setLoadingTasks(true);

    let templateItems: Array<{ title: string; notes?: string }> = [];

    if (templateType === 'ceia') {
      templateItems = [
        { title: 'Preparar pães ázimos e suco de uva para a Santa Ceia', notes: 'Verificar bandejas e toalhas no templo sede' },
        { title: 'Escalar corpo de Diáconos e Presbíteros para servir a Ceia', notes: 'Garantir distribuição nas alas' },
        { title: 'Higienização e contagem dos cálices individuais', notes: 'Verificar estoque da copa' },
        { title: 'Seleção do repertório de hinos da harpa e louvor de comunhão', notes: 'Harpa Cristã (Hinos 115, 300, 301)' },
        { title: 'Separar elementos da Ceia para visita aos membros enfermos no lar', notes: 'Atendimento pastoral pós-culto' }
      ];
    } else if (templateType === 'batismo') {
      templateItems = [
        { title: 'Conferir lista dos candidatos aprovados na classe de batismo', notes: 'Total de irmãos aptos' },
        { title: 'Higienizar e encher o tanque batismal com água limpa', notes: 'Verificar temperatura e segurança' },
        { title: 'Separar becas/roupas batismais brancas e toalhas', notes: 'Tamanhos P, M, G, GG' },
        { title: 'Emitir e assinar os Certificados Oficiais de Batismo em Águas', notes: 'Assinatura do Pastor Presidente' },
        { title: 'Oração e instruções finais com os candidatos antes da descida às águas', notes: 'Testemunho público de fé' }
      ];
    } else if (templateType === 'tesouraria') {
      templateItems = [
        { title: 'Conferir relatórios de dízimos e ofertas do mês', notes: 'Cruzamento com envelopes e PIX' },
        { title: 'Conciliação dos extratos bancários da conta da igreja', notes: 'Verificar tarifas e repasses' },
        { title: 'Pagamento das contas de água, luz, internet e prebendas pastorais', notes: 'Comprovantes arquivados' },
        { title: 'Elaborar Balancete Financeiro Mensal para o Conselho Fiscal', notes: 'Apresentação em reunião' },
        { title: 'Envio de recibos para membros que solicitaram declaração de dízimo', notes: 'Secretaria e finanças' }
      ];
    } else if (templateType === 'ebd') {
      templateItems = [
        { title: 'Verificar estoque de revistas da EBD (CPAD) para o trimestre', notes: 'Classes de Crianças, Jovens e Adultos' },
        { title: 'Reunião pedagógica semanal com o corpo docente da EBD', notes: 'Alinhamento didático e oração' },
        { title: 'Separar material de apoio visual e bíblias para visitantes', notes: 'Recepção da Escola Bíblica' },
        { title: 'Conferência da chamada e apuração do percentual de presença', notes: 'Lançar no sistema GIPP' },
        { title: 'Organizar lanche infantil da Salinha Kids', notes: 'Frutas e sucos' }
      ];
    } else if (templateType === 'visitas') {
      templateItems = [
        { title: 'Levantar lista de irmãos hospitalizados e acamados', notes: 'Contato prévio com as famílias' },
        { title: 'Escalar equipe de oração e assistência social da igreja', notes: 'Visitação fraternal' },
        { title: 'Separar óleo da unção consagrado para a oração pelos enfermos (Tiago 5:14)', notes: 'Ministério pastoral' },
        { title: 'Entrega de cestas básicas para lares em vulnerabilidade', notes: 'Ação diaconal' }
      ];
    }

    try {
      for (const item of templateItems) {
        await createGoogleTask(accessToken, selectedListId, {
          title: item.title,
          notes: item.notes,
          status: 'needsAction'
        });
      }
      addToast(`Checklist adicionado com sucesso à lista!`, 'success');
      await loadTasks(selectedListId);
    } catch (err: any) {
      console.error('Erro ao adicionar checklist:', err);
      addToast(err?.message || 'Erro ao criar tarefas do checklist.', 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!accessToken) return;
    const { actionType, payload } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    if (actionType === 'delete_task') {
      const taskId = payload?.taskId;
      if (!selectedListId || !taskId) return;
      try {
        await deleteGoogleTask(accessToken, selectedListId, taskId);
        addToast('Tarefa excluída do Google Tasks.', 'success');
        await loadTasks(selectedListId);
      } catch (err: any) {
        console.error('Erro ao excluir tarefa:', err);
        addToast(err?.message || 'Falha ao excluir tarefa.', 'error');
      }
    } else if (actionType === 'delete_list') {
      const listId = payload?.listId;
      if (!listId) return;
      setLoading(true);
      try {
        await deleteGoogleTaskList(accessToken, listId);
        addToast('Lista excluída do Google Tasks.', 'success');
        setSelectedListId('');
        await loadTaskLists();
      } catch (err: any) {
        console.error('Erro ao excluir lista:', err);
        addToast(err?.message || 'Falha ao excluir lista de tarefas.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (actionType === 'clear_completed') {
      if (!selectedListId) return;
      setLoadingTasks(true);
      try {
        await clearCompletedGoogleTasks(accessToken, selectedListId);
        addToast('Tarefas concluídas foram limpas.', 'success');
        await loadTasks(selectedListId);
      } catch (err: any) {
        console.error('Erro ao limpar tarefas:', err);
        addToast(err?.message || 'Falha ao limpar tarefas concluídas.', 'error');
      } finally {
        setLoadingTasks(false);
      }
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.status === 'completed') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(query);
      const matchNotes = task.notes?.toLowerCase().includes(query);
      return matchTitle || matchNotes;
    }
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // If not authenticated, render Google Sign-In Card
  if (!accessToken) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-sky-50 border border-sky-100 rounded-3xl mx-auto flex items-center justify-center text-sky-600 mb-6 shadow-inner">
            <CheckSquare size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Integração Oficial com Google Tasks
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Conecte sua conta Google Workspace para gerenciar tarefas pastorais, escalas de cultos,
            checklists de Santa Ceia e batismo sincronizados em tempo real com seu Google Agenda e celular.
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
                <ListTodo size={16} className="text-sky-600"/>
                <span>Sincronização em Nuvem</span>
              </div>
              <p className="text-xs text-slate-500">Tarefas integradas diretamente à sua conta Google e acessíveis no app oficial.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Sparkles size={16} className="text-sky-600"/>
                <span>Checklists Eclesiásticos</span>
              </div>
              <p className="text-xs text-slate-500">Modelos prontos para Santa Ceia, Batismo, EBD e visitas aos enfermos.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                <Calendar size={16} className="text-sky-600"/>
                <span>Prazos & Lembretes</span>
              </div>
              <p className="text-xs text-slate-500">Datas de vencimento sincronizadas com o Google Agenda e notificações.</p>
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
          <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-600 shadow-inner">
            <CheckSquare size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Google Tasks</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase tracking-wider">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Conectado como <strong className="text-slate-700">{currentUser?.displayName || currentUser?.email || 'Usuário Google'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowNewTaskModal(true)}
            disabled={!selectedListId}
            className="px-4 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-black hover:bg-sky-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Plus size={14} /> Nova Tarefa
          </button>

          <button
            onClick={() => setShowNewListModal(true)}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Layers size={14} /> Nova Lista
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

      {/* Main Container: Lists Sidebar + Tasks Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Task Lists & Templates */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lists Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Minhas Listas
              </h2>
              <button
                onClick={loadTaskLists}
                className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                title="Recarregar listas"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
              {taskLists.map(list => (
                <div
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    selectedListId === list.id 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ListTodo size={14} />
                    <span className="truncate">{list.title}</span>
                  </div>
                  {taskLists.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          isOpen: true,
                          title: `Excluir lista "${list.title}"?`,
                          description: 'Todas as tarefas contidas nesta lista serão removidas do Google Tasks.',
                          actionType: 'delete_list',
                          payload: { listId: list.id }
                        });
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        selectedListId === list.id ? 'hover:bg-sky-700 text-white' : 'hover:bg-rose-50 text-rose-500'
                      }`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Church Checklist Templates */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-600" />
              Checklists Eclesiásticos
            </h2>
            <p className="text-[11px] text-slate-400">
              Insira rotinas completas na lista selecionada em um clique:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleAddTemplateChecklist('ceia')}
                disabled={loadingTasks || !selectedListId}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <div className="w-6 h-6 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                  <Landmark size={12} />
                </div>
                <span>Culto de Santa Ceia</span>
              </button>

              <button
                onClick={() => handleAddTemplateChecklist('batismo')}
                disabled={loadingTasks || !selectedListId}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <div className="w-6 h-6 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={12} />
                </div>
                <span>Batismo nas Águas</span>
              </button>

              <button
                onClick={() => handleAddTemplateChecklist('tesouraria')}
                disabled={loadingTasks || !selectedListId}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <CheckSquare size={12} />
                </div>
                <span>Fechamento Tesouraria</span>
              </button>

              <button
                onClick={() => handleAddTemplateChecklist('ebd')}
                disabled={loadingTasks || !selectedListId}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <div className="w-6 h-6 bg-purple-500/10 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <ListOrdered size={12} />
                </div>
                <span>Preparativos da EBD</span>
              </button>

              <button
                onClick={() => handleAddTemplateChecklist('visitas')}
                disabled={loadingTasks || !selectedListId}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <div className="w-6 h-6 bg-rose-500/10 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                  <Heart size={12} />
                </div>
                <span>Visitas Pastorais</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tasks View */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter & Action Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendentes ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Concluídas ({completedCount})
              </button>
            </div>

            {/* Search & Clear Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar tarefa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {completedCount > 0 && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Limpar tarefas concluídas?',
                      description: 'Todas as tarefas marcadas como concluídas nesta lista serão removidas permanentemente.',
                      actionType: 'clear_completed'
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Limpar Concluídas
                </button>
              )}
            </div>
          </div>

          {/* Tasks List Content */}
          {loadingTasks ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <RefreshCw className="animate-spin text-sky-600 mx-auto mb-3" size={32} />
              <p className="text-sm font-bold text-slate-700">Carregando tarefas do Google...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <CheckSquare className="text-slate-300 mx-auto" size={48} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Nenhuma tarefa encontrada</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Adicione sua primeira tarefa pastoral ou utilize os checklists eclesiásticos.
                </p>
              </div>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} /> Adicionar Tarefa
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl border p-4 shadow-sm transition-all flex items-start justify-between gap-4 group ${
                      isDone 
                        ? 'border-slate-200 bg-slate-50/60 opacity-75' 
                        : 'border-slate-200/80 hover:border-sky-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <span className={`text-sm font-bold block ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </span>

                        {task.notes && (
                          <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">
                            {task.notes}
                          </p>
                        )}

                        {task.due && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 pt-0.5">
                            <Calendar size={12} />
                            <span>Vence em: {new Date(task.due).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: `Excluir "${task.title}"?`,
                          description: 'Esta tarefa será excluída do Google Tasks com permissão do usuário.',
                          actionType: 'delete_task',
                          payload: { taskId: task.id }
                        });
                      }}
                      title="Excluir tarefa"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Task */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600 font-bold">
                <CheckSquare size={20} />
                <span>Nova Tarefa no Google Tasks</span>
              </div>
              <button 
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Visita ao Lar da Família Silva"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pauta / Detalhes / Observações
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes adicionais, contatos ou itens necessários..."
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data de Vencimento / Prazo
                </label>
                <input
                  type="date"
                  value={taskForm.due}
                  onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                disabled={creatingTask || !taskForm.title.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creatingTask ? 'Salvando...' : 'Adicionar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Task List */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600 font-bold">
                <Layers size={20} />
                <span>Nova Lista de Tarefas</span>
              </div>
              <button 
                onClick={() => setShowNewListModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nome da Lista
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Ministério de Louvor & Eventos"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewListModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                disabled={creatingList || !newListTitle.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creatingList ? 'Criando...' : 'Criar Lista'}
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
