import React, { useState, useEffect, useContext } from 'react';
import {
  Video, Users, Plus, Calendar, Clock, Copy, Check, ExternalLink,
  Shield, ShieldCheck, Settings, RefreshCw, Trash2, AlertCircle,
  Sparkles, Lock, Globe, MessageSquare, PhoneCall, Share2, Eye,
  HelpCircle, UserCheck, BookOpen, HeartHandshake, Mic, ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';
import {
  signInWithGoogleMeet,
  getMeetAccessToken,
  createGoogleMeetSpace,
  updateGoogleMeetSpaceConfig,
  getGoogleMeetSpace,
  GoogleMeetSpace,
  MeetSpaceConfig,
  signOutGoogleMeet,
  initMeetAuth
} from '../services/googleMeetService';

export interface ChurchMeeting {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: 'pastoral' | 'obreiros' | 'ebd' | 'louvor' | 'discipulado' | 'oracao' | 'jovens' | 'geral';
  spaceName: string; // e.g. "spaces/xyz"
  meetingUri: string; // e.g. "https://meet.google.com/xyz"
  meetingCode: string;
  accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  dataAgendada?: string; // YYYY-MM-DD
  horaAgendada?: string; // HH:mm
  criadoPorNome: string;
  criadoPorEmail?: string;
  criadoEm: string;
  status: 'ativa' | 'encerrada' | 'agendada';
  salaFixa?: boolean;
}

export default function ModuleGoogleMeet() {
  const { db, user, addToast, dbFirestore, appId, setDoc, doc, deleteDoc, isOnline } = useContext<any>(ChurchContext);

  // Authentication State
  const [accessToken, setAccessToken] = useState<string | null>(getMeetAccessToken());
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Meeting Management State
  const [meetings, setMeetings] = useState<ChurchMeeting[]>([]);
  const [activeTab, setActiveTab] = useState<'salas' | 'criar' | 'historico' | 'configuracoes'>('salas');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Meeting
  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formCategoria, setFormCategoria] = useState<ChurchMeeting['categoria']>('pastoral');
  const [formAccessType, setFormAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('OPEN');
  const [formTipo, setFormTipo] = useState<'imediata' | 'agendada'>('imediata');
  const [formData, setFormData] = useState('');
  const [formHora, setFormHora] = useState('');
  const [formSalaFixa, setFormSalaFixa] = useState(false);

  // Confirmation Modal State (MANDATORY for Mutating/Destructive operations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: '',
    onConfirm: () => {},
    isDestructive: false
  });

  // Initialize Auth Listener on mount
  useEffect(() => {
    const unsubscribe = initMeetAuth(
      (u, token) => {
        setGoogleUser(u);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load Saved Meetings from Church Context or Local Storage
  useEffect(() => {
    if (db?.reunioes_meet && Array.isArray(db.reunioes_meet)) {
      setMeetings(db.reunioes_meet);
    } else {
      try {
        const saved = localStorage.getItem('gipp_google_meetings');
        if (saved) {
          setMeetings(JSON.parse(saved));
        }
      } catch (err) {
        console.warn('Erro ao carregar reuniões locais:', err);
      }
    }
  }, [db?.reunioes_meet]);

  // Persist meetings helper
  const persistMeetings = async (updatedList: ChurchMeeting[]) => {
    setMeetings(updatedList);
    try {
      localStorage.setItem('gipp_google_meetings', JSON.stringify(updatedList));
      if (dbFirestore && appId && isOnline) {
        await setDoc(doc(dbFirestore, 'apps', appId, 'modulos_dados', 'reunioes_meet'), {
          lista: updatedList,
          ultimaAtualizacao: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Erro ao sincronizar reuniões no Firestore:', err);
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await signInWithGoogleMeet();
      setAccessToken(res.accessToken);
      setGoogleUser(res.user);
      addToast(`Conectado ao Google com sucesso: ${res.user.email || res.user.displayName}`, 'success');
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      addToast(err?.message || 'Falha ao autenticar com o Google.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google Sign-out
  const handleGoogleSignOut = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Desconectar Conta Google',
      description: 'Deseja desconectar a sua conta Google deste dispositivo? Você precisará fazer login novamente para gerar novas salas do Google Meet.',
      actionLabel: 'Desconectar',
      isDestructive: true,
      onConfirm: async () => {
        await signOutGoogleMeet();
        setAccessToken(null);
        setGoogleUser(null);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        addToast('Conta Google desconectada.', 'info');
      }
    });
  };

  // Create Google Meet Room
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      addToast('Por favor, informe o título da reunião.', 'warning');
      return;
    }

    if (!accessToken) {
      addToast('Por favor, faça login com sua conta Google primeiro.', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const config: MeetSpaceConfig = {
        accessType: formAccessType,
        entryPointAccess: 'ALL'
      };

      const meetSpace = await createGoogleMeetSpace(accessToken, config);

      const novaReuniao: ChurchMeeting = {
        id: 'meet_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        titulo: formTitulo.trim(),
        descricao: formDescricao.trim(),
        categoria: formCategoria,
        spaceName: meetSpace.name,
        meetingUri: meetSpace.meetingUri,
        meetingCode: meetSpace.meetingCode,
        accessType: formAccessType,
        dataAgendada: formTipo === 'agendada' ? formData : undefined,
        horaAgendada: formTipo === 'agendada' ? formHora : undefined,
        criadoPorNome: user?.nome || googleUser?.displayName || 'Líder GIPP',
        criadoPorEmail: user?.email || googleUser?.email || '',
        criadoEm: new Date().toISOString(),
        status: formTipo === 'agendada' ? 'agendada' : 'ativa',
        salaFixa: formSalaFixa
      };

      const updated = [novaReuniao, ...meetings];
      await persistMeetings(updated);

      addToast(`Sala do Google Meet criada: ${meetSpace.meetingCode}!`, 'success');
      
      // Reset form
      setFormTitulo('');
      setFormDescricao('');
      setFormData('');
      setFormHora('');
      setFormTipo('imediata');
      setActiveTab('salas');
    } catch (err: any) {
      console.error('Erro ao criar sala Meet:', err);
      // If token expired, clear it so user can re-auth
      if (err?.message?.includes('401') || err?.message?.includes('UNAUTHENTICATED')) {
        setAccessToken(null);
        addToast('Sua sessão do Google expirou. Por favor, conecte-se novamente.', 'error');
      } else {
        addToast(err?.message || 'Falha ao criar sala no Google Meet.', 'error');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Delete / Archive Meeting with User Confirmation
  const handleDeleteMeeting = (meeting: ChurchMeeting) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Sala de Videoconferência',
      description: `Tem certeza que deseja remover o registro da reunião "${meeting.titulo}" (${meeting.meetingCode})? O link deixará de ser exibido na lista da igreja.`,
      actionLabel: 'Excluir Sala',
      isDestructive: true,
      onConfirm: async () => {
        const filtered = meetings.filter(m => m.id !== meeting.id);
        await persistMeetings(filtered);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        addToast('Sala removida com sucesso.', 'info');
      }
    });
  };

  // Copy Meeting Link & Invite
  const handleCopyInvite = (meeting: ChurchMeeting) => {
    const dataFormatada = meeting.dataAgendada 
      ? `\n📅 *Data:* ${meeting.dataAgendada.split('-').reverse().join('/')} às ${meeting.horaAgendada || '19:30'}`
      : '\n⚡ *Reunião Imediata / Ao Vivo*';

    const textoConvite = `🏛️ *${(db?.igreja?.nome || 'ASSEMBLEIA DE DEUS GIPP').toUpperCase()}*
📹 *CONVITE PARA VIDEOCONFERÊNCIA GOOGLE MEET*

📌 *Tema:* ${meeting.titulo}
${meeting.descricao ? `📝 *Pauta:* ${meeting.descricao}` : ''}${dataFormatada}
🔗 *Link de Acesso:* ${meeting.meetingUri}
🔑 *Código da Reunião:* ${meeting.meetingCode}

_Acesse através de seu computador ou aplicativo Google Meet no celular. Que Deus abençoe!_`;

    navigator.clipboard.writeText(textoConvite).then(() => {
      setCopiedId(meeting.id);
      addToast('Convite copiado com sucesso! Pronto para colar no WhatsApp.', 'success');
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  const getCategoryBadge = (cat: ChurchMeeting['categoria']) => {
    switch (cat) {
      case 'pastoral':
        return { label: 'Gabinete Pastoral', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'obreiros':
        return { label: 'Reunião de Obreiros', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ebd':
        return { label: 'Escola Bíblica (EBD)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'discipulado':
        return { label: 'Discipulado', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'oracao':
        return { label: 'Clamor & Oração', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'louvor':
        return { label: 'Ministério de Louvor', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'jovens':
        return { label: 'Jovens & Adolescentes', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return { label: 'Geral', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Video size={34} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Workspace
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Meet API v2
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
                Central de Videoconferências Google Meet
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium mt-0.5">
                Crie salas virtuais seguras para reuniões de liderança, gabinete pastoral online, aulas da EBD e oração.
              </p>
            </div>
          </div>

          {/* Account Status / Login Button */}
          <div className="shrink-0 flex items-center gap-3">
            {accessToken ? (
              <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {googleUser?.photoURL ? (
                    <img src={googleUser.photoURL} alt="User" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <UserCheck size={18} />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{googleUser?.displayName || 'Google Conectado'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {googleUser?.email || 'API Meet Habilitada'}
                  </div>
                </div>
                <button
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Desconectar"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border border-slate-200 cursor-pointer active:scale-95"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isAuthenticating ? 'Conectando ao Google...' : 'Entrar com Google (Meet)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('salas')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'salas'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video size={16} />
            <span>Salas da Igreja ({meetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('criar')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'criar'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Plus size={16} />
            <span>Criar / Agendar Sala</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'configuracoes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Settings size={16} />
            <span>Sobre & Permissões</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SALAS DA IGREJA */}
      {activeTab === 'salas' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Video size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Nenhuma sala de videoconferência ativa</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Crie uma sala instantânea ou agende uma reunião para compartilhar o link com obreiros, alunos da EBD ou membros.
              </p>
              <button
                onClick={() => setActiveTab('criar')}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Criar Nova Sala Google Meet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((m) => {
                const badge = getCategoryBadge(m.categoria);
                const isCopied = copiedId === m.id;

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {m.salaFixa && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles size={10} /> Sala Fixa
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                        {m.titulo}
                      </h3>

                      {m.descricao && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {m.descricao}
                        </p>
                      )}

                      {/* Informações de Agendamento */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            {m.dataAgendada ? `${m.dataAgendada.split('-').reverse().join('/')} às ${m.horaAgendada || '19:30'}` : 'Reunião Imediata'}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {m.meetingCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <UserCheck size={11} />
                          <span>Criado por {m.criadoPorNome}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {/* Copiar Convite */}
                        <button
                          onClick={() => handleCopyInvite(m)}
                          className={`p-2 rounded-xl transition-all cursor-pointer border ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                          title="Copiar convite com texto formatado para WhatsApp"
                        >
                          {isCopied ? <Check size={16} /> : <Copy size={16} />}
                        </button>

                        {/* Excluir Sala */}
                        <button
                          onClick={() => handleDeleteMeeting(m)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                          title="Remover reunião"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Entrar na Reunião */}
                      <a
                        href={m.meetingUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Video size={14} />
                        <span>Entrar no Meet</span>
                        <ExternalLink size={12} className="opacity-70" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CRIAR / AGENDAR SALA */}
      {activeTab === 'criar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              Criar Nova Sala Google Meet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gere um link oficial do Google Meet autenticado pela sua conta para reuniões e transmissões da igreja.
            </p>
          </div>

          {!accessToken && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-2">
                <p className="font-bold">Conexão Google necessária:</p>
                <p>
                  Para criar links autênticos do Google Meet através da API oficial v2, conecte sua conta Google no topo desta tela.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Conectar Conta Google Agora
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateMeeting} className="space-y-5">
            {/* Título da Reunião */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título da Reunião / Assunto *
              </label>
              <input
                type="text"
                required
                value={formTitulo}
                onChange={e => setFormTitulo(e.target.value)}
                placeholder="Ex: Reunião Geral de Obreiros e Diáconos, Gabinete Pastoral..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Categoria & Tipo de Reunião */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Finalidade / Categoria
                </label>
                <select
                  value={formCategoria}
                  onChange={e => setFormCategoria(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="pastoral">Gabinete Pastoral Online</option>
                  <option value="obreiros">Reunião de Obreiros / Liderança</option>
                  <option value="ebd">Aula da Escola Bíblica (EBD Online)</option>
                  <option value="discipulado">Discipulado / Novos Convertidos</option>
                  <option value="oracao">Círculo de Oração / Vigília Online</option>
                  <option value="louvor">Ministério de Louvor / Coral</option>
                  <option value="jovens">Jovens & Adolescentes (UMAD/UAD)</option>
                  <option value="geral">Geral / Evento Especial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nível de Acesso (Privacidade)
                </label>
                <select
                  value={formAccessType}
                  onChange={e => setFormAccessType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="OPEN">Aberto (Qualquer pessoa com o link)</option>
                  <option value="TRUSTED">Confiável (Membros com e-mail cadastrado)</option>
                  <option value="RESTRICTED">Restrito (Requer aprovação do anfitrião)</option>
                </select>
              </div>
            </div>

            {/* Descrição / Pauta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pauta / Observações (Opcional)
              </label>
              <textarea
                rows={3}
                value={formDescricao}
                onChange={e => setFormDescricao(e.target.value)}
                placeholder="Descreva os temas que serão abordados nesta videoconferência..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Reunião Imediata vs Agendada */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoReuniao"
                    checked={formTipo === 'imediata'}
                    onChange={() => setFormTipo('imediata')}
                    className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">Reunião Imediata (Agora)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoReuniao"
                    checked={formTipo === 'agendada'}
                    onChange={() => setFormTipo('agendada')}
                    className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">Agendar para Data Futura</span>
                </label>
              </div>

              {formTipo === 'agendada' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Data da Reunião
                    </label>
                    <input
                      type="date"
                      required={formTipo === 'agendada'}
                      value={formData}
                      onChange={e => setFormData(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Horário de Início
                    </label>
                    <input
                      type="time"
                      required={formTipo === 'agendada'}
                      value={formHora}
                      onChange={e => setFormHora(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sala Fixa Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="chkSalaFixa"
                checked={formSalaFixa}
                onChange={e => setFormSalaFixa(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="chkSalaFixa" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Manter como sala permanente da igreja (ex: link padrão para gabinete pastoral semanal)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('salas')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Video size={16} />
                <span>{isCreating ? 'Gerando Sala no Google...' : 'Criar Sala no Google Meet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CONFIGURAÇÕES & PERMISSÕES */}
      {activeTab === 'configuracoes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck size={22} className="text-emerald-600" />
              Integração Oficial Google Workspace (Meet)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Informações sobre a API do Google Meet v2 e escopos de permissões ativos.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Escopos OAuth Ativos:</h4>
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-600">
                <li>https://www.googleapis.com/auth/meetings.space.created (Criar e gerenciar salas)</li>
                <li>https://www.googleapis.com/auth/meetings.space.readonly (Consultar informações das salas)</li>
                <li>https://www.googleapis.com/auth/meetings.space.settings (Gerenciar privacidade e acessos)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <h4 className="font-black text-emerald-900 flex items-center gap-1.5">
                <Shield size={16} className="text-emerald-700" /> Segurança e Privacidade:
              </h4>
              <p className="text-xs leading-relaxed">
                Todas as salas criadas são de propriedade de sua conta Google, protegidas por criptografia e acessíveis via link direto autenticado. O sistema armazena os links no banco de dados da igreja para permitir que a membresia e liderança acessem com facilidade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG (For Destructive / Mutating Actions) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{confirmModal.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmação de Segurança</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 rounded-xl text-white text-xs font-black transition-all shadow-md cursor-pointer active:scale-95 ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
