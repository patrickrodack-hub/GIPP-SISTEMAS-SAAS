import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Mail,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  Video,
  HardDrive,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  Send,
  Users,
  Check
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  initWorkspaceAuth,
  syncGippEventsToGoogleCalendar,
  syncGippTasksToGoogleTasks,
  sendEscalaConfirmationEmail,
  createGoogleCalendarEvent
} from '../services/googleWorkspaceService';

interface GoogleIntegrationsPanelProps {
  user?: any;
  db?: any;
  addToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const GoogleIntegrationsPanel: React.FC<GoogleIntegrationsPanelProps> = ({
  user,
  db,
  addToast
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync settings (saved in localStorage or db)
  const [autoSyncCalendar, setAutoSyncCalendar] = useState<boolean>(() => {
    return localStorage.getItem('gipp_google_sync_calendar') !== 'false';
  });
  const [autoSyncGmail, setAutoSyncGmail] = useState<boolean>(() => {
    return localStorage.getItem('gipp_google_sync_gmail') !== 'false';
  });
  const [autoSyncTasks, setAutoSyncTasks] = useState<boolean>(() => {
    return localStorage.getItem('gipp_google_sync_tasks') !== 'false';
  });
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(() => {
    return localStorage.getItem('gipp_google_last_sync');
  });

  // Interactive Gmail Escala Notification tool
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [escalaTipo, setEscalaTipo] = useState<'louvor' | 'portaria' | 'ebd' | 'obreiros' | 'midia' | 'recepcao' | 'culto_geral'>('ebd');
  const [escalaData, setEscalaData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [escalaHorario, setEscalaHorario] = useState<string>('09:00');
  const [escalaFuncao, setEscalaFuncao] = useState<string>('Professor(a) Titular');
  const [escalaObservacoes, setEscalaObservacoes] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Interactive Calendar Event Creator tool
  const [calEventTitle, setCalEventTitle] = useState('');
  const [calEventDate, setCalEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [calEventTimeStart, setCalEventTimeStart] = useState('19:00');
  const [calEventTimeEnd, setCalEventTimeEnd] = useState('21:00');
  const [calEventLocation, setCalEventLocation] = useState(db?.igreja?.nome || 'Templo Sede');
  const [creatingCalEvent, setCreatingCalEvent] = useState(false);

  const handleSendEscalaNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      if (addToast) addToast('Conecte sua conta do Google primeiro.', 'warning');
      return;
    }

    let targetEmail = customEmail.trim();
    let targetName = customName.trim() || 'Irmão(ã)';

    if (selectedMemberId) {
      const found = (db?.membros || []).find((m: any) => m.id === selectedMemberId);
      if (found) {
        targetName = found.nome;
        targetEmail = found.email || targetEmail;
      }
    }

    if (!targetEmail) {
      if (addToast) addToast('Informe um endereço de e-mail válido para envio.', 'warning');
      return;
    }

    try {
      setSendingEmail(true);
      await sendEscalaConfirmationEmail(accessToken, {
        toEmail: targetEmail,
        toName: targetName,
        escalaTipo,
        dataEscala: escalaData,
        horario: escalaHorario,
        funcao: escalaFuncao,
        igrejaNome: db?.igreja?.nome || 'Igreja Evangélica Assembleia de Deus',
        pastorNome: user?.nome || 'Pastor Presidente',
        observacoes: escalaObservacoes.trim() || undefined
      });

      if (addToast) addToast(`Notificação enviada com sucesso para ${targetName} (${targetEmail})!`, 'success');
      setEscalaObservacoes('');
    } catch (err: any) {
      if (addToast) addToast('Erro ao enviar e-mail via Gmail: ' + err.message, 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      if (addToast) addToast('Conecte sua conta do Google primeiro.', 'warning');
      return;
    }

    if (!calEventTitle.trim()) {
      if (addToast) addToast('Informe o título do evento.', 'warning');
      return;
    }

    try {
      setCreatingCalEvent(true);
      const startDateTime = `${calEventDate}T${calEventTimeStart}:00-03:00`;
      const endDateTime = `${calEventDate}T${calEventTimeEnd}:00-03:00`;

      await createGoogleCalendarEvent(accessToken, {
        summary: calEventTitle.trim(),
        description: `Evento oficial agendado pelo GIPP para ${db?.igreja?.nome || 'a Igreja'}.`,
        location: calEventLocation.trim(),
        start: { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' }
      });

      if (addToast) addToast(`Evento "${calEventTitle}" adicionado ao Google Calendar!`, 'success');
      setCalEventTitle('');
    } catch (err: any) {
      if (addToast) addToast('Erro ao criar evento no Calendar: ' + err.message, 'error');
    } finally {
      setCreatingCalEvent(false);
    }
  };

  useEffect(() => {
    const unsub = initWorkspaceAuth(
      (_googleUser, token) => {
        setAccessToken(token);
      },
      () => {
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const { user: gUser, accessToken: token } = await signInWithGoogleWorkspace();
      setAccessToken(token);
      setStatusMessage({
        text: `Conectado com sucesso como ${gUser.email || gUser.displayName || 'Usuário Google'}!`,
        type: 'success'
      });
      if (addToast) addToast('Google Workspace conectado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err?.message || 'Falha ao conectar com o Google Workspace.',
        type: 'error'
      });
      if (addToast) addToast(err?.message || 'Erro ao conectar conta Google.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOutGoogleWorkspace();
      setAccessToken(null);
      setStatusMessage({
        text: 'Conta do Google Workspace desconectada.',
        type: 'success'
      });
      if (addToast) addToast('Conta Google desconectada!', 'info');
    } catch (err: any) {
      setStatusMessage({ text: 'Erro ao desconectar conta Google.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (key: string, currentVal: boolean, setter: (v: boolean) => void) => {
    const next = !currentVal;
    setter(next);
    localStorage.setItem(key, String(next));
    if (addToast) addToast('Preferência de sincronização salva!', 'success');
  };

  const handleSyncAllNow = async () => {
    if (!accessToken) {
      if (addToast) addToast('Conecte sua conta do Google primeiro.', 'warning');
      return;
    }

    setSyncingAll(true);
    try {
      // 1. Sincronizar Eventos da Igreja para o Google Calendar
      const eventos = (db?.eventos || []).map((e: any) => ({
        title: e.titulo || e.nome || 'Culto Eclesiástico',
        description: `${e.descricao || 'Programação oficial da igreja.'} • Local: ${e.local || db?.igreja?.nome || 'Sede'}`,
        date: e.data || new Date().toISOString().split('T')[0],
        timeStart: e.horario || e.hora_inicio || '19:00',
        location: e.local || db?.igreja?.endereco || ''
      }));

      // Se não houver eventos cadastrados, criar eventos de exemplo da igreja
      if (eventos.length === 0) {
        eventos.push({
          title: 'Culto de Celebração & Família',
          description: 'Culto congregacional com ministração da Palavra e louvor.',
          date: new Date().toISOString().split('T')[0],
          timeStart: '19:00',
          location: db?.igreja?.nome || 'Templo Sede'
        });
      }

      await syncGippEventsToGoogleCalendar(accessToken, eventos.slice(0, 10));

      // 2. Sincronizar Tarefas
      const tarefas = (db?.tarefas || []).map((t: any) => ({
        title: t.titulo || t.nome || 'Tarefa Ministerial',
        description: t.descricao || 'Atribuição ministerial GIPP',
        dueDate: t.data_limite || t.data || undefined,
        completed: t.concluido || t.status === 'concluida'
      }));

      if (tarefas.length > 0) {
        await syncGippTasksToGoogleTasks(accessToken, tarefas.slice(0, 10));
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSyncDate(now);
      localStorage.setItem('gipp_google_last_sync', now);

      setStatusMessage({
        text: `Sincronização global concluída com sucesso (${now})!`,
        type: 'success'
      });
      if (addToast) addToast('Eventos e Tarefas sincronizados com o Google Workspace!', 'success');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err?.message || 'Erro durante a sincronização.',
        type: 'error'
      });
      if (addToast) addToast('Erro na sincronização com o Google.', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  const GOOGLE_SERVICES = [
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      category: 'Agenda & Eventos',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-900',
      description: 'Sincronização automática da escala de cultos, santas ceias, reuniões ministeriais e agenda pastoral.',
      link: 'https://calendar.google.com',
      scope: 'calendar, calendar.events'
    },
    {
      id: 'gmail',
      name: 'Gmail Eclesiástico',
      icon: Mail,
      category: 'Comunicação Oficial',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/40',
      borderColor: 'border-red-200 dark:border-red-900',
      description: 'Envio de convocações pastorais, confirmações de escalas aos membros e correspondência institucional.',
      link: 'https://mail.google.com',
      scope: 'gmail.send, gmail.readonly, gmail.compose'
    },
    {
      id: 'forms',
      name: 'Google Forms',
      icon: ClipboardList,
      category: 'Inscrições & Censo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-200 dark:border-purple-900',
      description: 'Geração e importação de formulários de matrículas na EBD, inscrições para batismo e cadastro de visitantes.',
      link: 'https://forms.google.com',
      scope: 'forms.body, forms.responses.readonly'
    },
    {
      id: 'classroom',
      name: 'Google Classroom',
      icon: GraduationCap,
      category: 'Ensino & Teologia',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-900',
      description: 'Importação e gestão de turmas, lições CPAD, notas e controle de frequência da EBD e Cursos de Obreiros.',
      link: 'https://classroom.google.com',
      scope: 'classroom.courses, classroom.coursework, classroom.rosters'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: HardDrive,
      category: 'Armazenamento em Nuvem',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-900',
      description: 'Guarda segura de certidões, fotos, relatórios estatísticos e backups criptografados da igreja.',
      link: 'https://drive.google.com',
      scope: 'drive, drive.file, drive.readonly'
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      category: 'Finanças & Tabelas',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-900',
      description: 'Exportação bidirecional de planilhas financeiras, balancetes de dízimos e lista de membros.',
      link: 'https://sheets.google.com',
      scope: 'spreadsheets, spreadsheets.readonly'
    },
    {
      id: 'docs',
      name: 'Google Docs',
      icon: FileText,
      category: 'Documentos & Ofícios',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-900',
      description: 'Geração e edição de atas de assembleia, cartas de recomendação pastoral e estatutos oficiais.',
      link: 'https://docs.google.com',
      scope: 'documents, documents.readonly'
    },
    {
      id: 'tasks',
      name: 'Google Tasks',
      icon: CheckSquare,
      category: 'Tarefas & Checklists',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
      borderColor: 'border-sky-200 dark:border-sky-900',
      description: 'Checklists de organização de cultos, compras da cantina e tarefas delegadas aos diáconos.',
      link: 'https://tasks.google.com',
      scope: 'tasks, tasks.readonly'
    },
    {
      id: 'meet',
      name: 'Google Meet',
      icon: Video,
      category: 'Videoconferências',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-200 dark:border-teal-900',
      description: 'Salas de reuniões de diretoria, aconselhamento pastoral online e transmissões fechadas.',
      link: 'https://meet.google.com',
      scope: 'meetings.space'
    }
  ];

  return (
    <div className="space-y-6 animate-entrance text-left">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Ecossistema Oficial Google Workspace
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Central de Conexão e Integrações Google
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Gerencie a autorização e o fluxo de dados entre o GIPP e as ferramentas do Google Workspace (Agenda, Gmail, Forms, Classroom, Drive, Sheets, Docs, Tasks e Meet).
            </p>
          </div>

          {/* Connection Action Box */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  accessToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {accessToken ? 'Conta Conectada' : 'Aguardando Login'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {accessToken ? 'Token de Acesso Ativo' : 'Nenhuma conta vinculada'}
                </p>
              </div>
            </div>

            {accessToken ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSyncAllNow}
                  disabled={syncingAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
                  <span>{syncingAll ? 'Sincronizando...' : 'Sincronizar Tudo'}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-400/30"
                >
                  <LogOut size={14} />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <LogIn size={15} />
                <span>{loading ? 'Conectando...' : 'Conectar Conta Google'}</span>
              </button>
            )}
          </div>
        </div>

        {lastSyncDate && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-indigo-200">
            <Clock size={13} />
            <span>Última sincronização global realizada em: <strong>{lastSyncDate}</strong></span>
          </div>
        )}
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertTriangle size={16} className="shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[11px] underline ml-4 hover:opacity-80"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Automated Sync Preferences */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Regras e Automatizações de Sincronização
            </h3>
            <p className="text-xs text-slate-500">
              Defina como o GIPP deve sincronizar tarefas, agendas e avisos com sua conta Google.
            </p>
          </div>
          <Zap size={20} className="text-indigo-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sincronizar Google Calendar
              </p>
              <p className="text-[10px] text-slate-500">
                Publicar novos eventos e cultos automaticamente na agenda Google dos obreiros.
              </p>
            </div>
            <button
              onClick={() =>
                handleToggleSetting('gipp_google_sync_calendar', autoSyncCalendar, setAutoSyncCalendar)
              }
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                autoSyncCalendar ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSyncCalendar ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Notificações via Gmail
              </p>
              <p className="text-[10px] text-slate-500">
                Disparar confirmação de escalas de louvor, portaria e EBD para os membros.
              </p>
            </div>
            <button
              onClick={() =>
                handleToggleSetting('gipp_google_sync_gmail', autoSyncGmail, setAutoSyncGmail)
              }
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                autoSyncGmail ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSyncGmail ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tarefas no Google Tasks
              </p>
              <p className="text-[10px] text-slate-500">
                Sincronizar checklists e tarefas eclesiásticas com o aplicativo Google Tasks.
              </p>
            </div>
            <button
              onClick={() =>
                handleToggleSetting('gipp_google_sync_tasks', autoSyncTasks, setAutoSyncTasks)
              }
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                autoSyncTasks ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSyncTasks ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Automations: Gmail & Calendar Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gmail Escala Notification Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Notificação de Escala via Gmail
                </h4>
                <p className="text-[11px] text-slate-500">
                  Envie a convocação ministerial formatada diretamente para a caixa de entrada do membro.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendEscalaNotification} className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Selecionar Membro
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={e => {
                      setSelectedMemberId(e.target.value);
                      const m = (db?.membros || []).find((x: any) => x.id === e.target.value);
                      if (m) {
                        setCustomName(m.nome);
                        if (m.email) setCustomEmail(m.email);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                  >
                    <option value="">-- Escolher da lista de membros --</option>
                    {(db?.membros || []).map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} {m.email ? `(${m.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    E-mail de Destino *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@gmail.com"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Ministério / Setor
                  </label>
                  <select
                    value={escalaTipo}
                    onChange={e => setEscalaTipo(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                  >
                    <option value="ebd">EBD (Escola Bíblica)</option>
                    <option value="louvor">Louvor & Adoração</option>
                    <option value="portaria">Portaria & Acolhimento</option>
                    <option value="obreiros">Obreiros & Diaconato</option>
                    <option value="midia">Mídia & Transmissão</option>
                    <option value="recepcao">Recepção</option>
                    <option value="culto_geral">Culto Oficial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Data da Escala
                  </label>
                  <input
                    type="date"
                    value={escalaData}
                    onChange={e => setEscalaData(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={escalaHorario}
                    onChange={e => setEscalaHorario(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Função / Atribuição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Professor da Classe Jovens / Vocal / Recepção"
                  value={escalaFuncao}
                  onChange={e => setEscalaFuncao(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Observações Pastorais (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chegar 15 minutos antes para oração no gabinete..."
                  value={escalaObservacoes}
                  onChange={e => setEscalaObservacoes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sendingEmail || !accessToken}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send size={13} className={sendingEmail ? 'animate-spin' : ''} />
                  <span>{sendingEmail ? 'Enviando...' : 'Enviar Convocação via Gmail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Calendar Quick Event Sync Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Agendar Evento no Google Calendar
                </h4>
                <p className="text-[11px] text-slate-500">
                  Crie e envie reuniões, cultos e ensaios diretamente para sua agenda do Google.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCalendarEvent} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Doutrina & Santa Ceia"
                  value={calEventTitle}
                  onChange={e => setCalEventTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={calEventDate}
                    onChange={e => setCalEventDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    value={calEventTimeStart}
                    onChange={e => setCalEventTimeStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    value={calEventTimeEnd}
                    onChange={e => setCalEventTimeEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Local / Templo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Templo Sede / Auditório Principal"
                  value={calEventLocation}
                  onChange={e => setCalEventLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={creatingCalEvent || !accessToken}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Calendar size={13} className={creatingCalEvent ? 'animate-spin' : ''} />
                  <span>{creatingCalEvent ? 'Criando...' : 'Adicionar ao Google Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Grid of Integrated Services */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Serviços Integrados do Google Workspace (9 Aplicativos)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOOGLE_SERVICES.map((srv) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={srv.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-2xl ${srv.bgColor} ${srv.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                        accessToken
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {accessToken ? 'Autorizado' : 'Pendente'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {srv.category}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                    {srv.scope}
                  </span>
                  <a
                    href={srv.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Abrir Google</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
