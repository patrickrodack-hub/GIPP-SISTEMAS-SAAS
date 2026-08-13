import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  X,
  Users,
  DollarSign,
  Calendar,
  UserPlus,
  Receipt,
  BookOpen,
  Sparkles,
  HeartHandshake,
  Baby,
  GraduationCap,
  Car,
  FileText,
  CheckCircle2,
  Award,
  Zap,
  Send,
  Gamepad2,
  Package,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Building2,
  Sliders,
  Check,
  Search
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface ShortcutItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: any;
  color: string;
  bg: string;
  badge?: string;
  action: () => void;
}

export function FloatingActionButton() {
  const context = useContext(ChurchContext) as any;

  if (!context) return null;

  const {
    view,
    setView,
    user,
    db,
    addToast,
    openModal,
    addDoc,
    collection,
    dbFirestore,
    appId,
    osTheme
  } = context;

  const [isOpen, setIsOpen] = useState(false);
  const [quickModal, setQuickModal] = useState<'none' | 'membro' | 'financeiro' | 'visitante' | 'evento' | 'oracao'>('none');
  const [saving, setSaving] = useState(false);

  // Quick Form States
  const [membroForm, setMembroForm] = useState({ nome: '', telefone: '', cargo: 'Membro', status: 'Ativo' });
  const [finForm, setFinForm] = useState({ tipo: 'Entrada', valor: '', categoria: 'Dízimo', descricao: '', data: new Date().toISOString().split('T')[0] });
  const [visForm, setVisForm] = useState({ nome: '', telefone: '', data: new Date().toISOString().split('T')[0], observacao: '' });
  const [evtForm, setEvtForm] = useState({ titulo: '', data: new Date().toISOString().split('T')[0], hora: '19:30', local: 'Templo Sede', categoria: 'Culto' });
  const [oracaoForm, setOracaoForm] = useState({ nome: user?.nome || '', pedido: '', sigiloso: false });

  const fabRef = useRef<HTMLDivElement>(null);

  // Close FAB when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl + Space to open FAB
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Do not display if user is not logged in or in fullscreen interativo mode
  if (!user || view === 'portal_interativo') {
    return null;
  }

  // Helper to trigger custom action & notify
  const triggerQuickAction = (id: string, defaultNav?: string) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('gipp:quick-action', { detail: { action: id, view } }));
    if (defaultNav) {
      setView(defaultNav);
    }
  };

  // Quick Action Handlers for saving data
  const handleSaveQuickMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membroForm.nome.trim()) {
      addToast('Informe ao menos o nome do membro.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros'), {
          ...membroForm,
          createdAt: new Date().toISOString(),
          cadastradoPor: user.nome || 'FAB Atalho'
        });
      }
      addToast(`Membro "${membroForm.nome}" cadastrado com sucesso!`, 'success');
      setMembroForm({ nome: '', telefone: '', cargo: 'Membro', status: 'Ativo' });
      setQuickModal('none');
      if (view === 'cad_membro') {
        window.dispatchEvent(new CustomEvent('gipp:refresh-data'));
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao cadastrar membro rápido.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickFinanceiro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finForm.valor || parseFloat(finForm.valor) <= 0) {
      addToast('Informe um valor válido para o lançamento.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), {
          ...finForm,
          valor: parseFloat(finForm.valor),
          createdAt: new Date().toISOString(),
          registradoPor: user.nome || 'FAB Atalho'
        });
      }
      addToast(`Lançamento de R$ ${finForm.valor} salvo com sucesso!`, 'success');
      setFinForm({ tipo: 'Entrada', valor: '', categoria: 'Dízimo', descricao: '', data: new Date().toISOString().split('T')[0] });
      setQuickModal('none');
      if (view.startsWith('fin_')) {
        window.dispatchEvent(new CustomEvent('gipp:refresh-data'));
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar lançamento financeiro.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickVisitante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visForm.nome.trim()) {
      addToast('Informe o nome do visitante.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitantes'), {
          ...visForm,
          createdAt: new Date().toISOString(),
          atendidoPor: user.nome || 'FAB Atalho'
        });
      }
      addToast(`Visitante "${visForm.nome}" registrado com sucesso!`, 'success');
      setVisForm({ nome: '', telefone: '', data: new Date().toISOString().split('T')[0], observacao: '' });
      setQuickModal('none');
    } catch (err) {
      console.error(err);
      addToast('Erro ao registrar visitante.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtForm.titulo.trim()) {
      addToast('Informe o título do evento/culto.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'agenda'), {
          ...evtForm,
          createdAt: new Date().toISOString(),
          criadoPor: user.nome || 'FAB Atalho'
        });
      }
      addToast(`Evento "${evtForm.titulo}" agendado com sucesso!`, 'success');
      setEvtForm({ titulo: '', data: new Date().toISOString().split('T')[0], hora: '19:30', local: 'Templo Sede', categoria: 'Culto' });
      setQuickModal('none');
    } catch (err) {
      console.error(err);
      addToast('Erro ao agendar evento.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickOracao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracaoForm.pedido.trim()) {
      addToast('Escreva seu pedido de oração.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'pedidos_oracao'), {
          ...oracaoForm,
          createdAt: new Date().toISOString(),
          membroId: user.id || 'anon'
        });
      }
      addToast('Pedido de oração enviado aos intercessores!', 'success');
      setOracaoForm({ nome: user?.nome || '', pedido: '', sigiloso: false });
      setQuickModal('none');
    } catch (err) {
      console.error(err);
      addToast('Erro ao enviar pedido de oração.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Define module-specific shortcuts
  const getContextualShortcuts = (): ShortcutItem[] => {
    switch (view) {
      case 'cad_membro':
      case 'acessos_portal':
        return [
          {
            id: 'membro_rapido',
            label: 'Novo Membro Rápido',
            sublabel: 'Cadastrar nome e telefone',
            icon: UserPlus,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            badge: 'Pop-up',
            action: () => { setQuickModal('membro'); setIsOpen(false); }
          },
          {
            id: 'cartao_membro',
            label: 'Emitir Cartão / Credencial',
            sublabel: 'Gerar carteirinha com QR Code',
            icon: Award,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            action: () => triggerQuickAction('cartao_membro', 'carteirinha_studio')
          },
          {
            id: 'relatorios_membros',
            label: 'Exportar Lista de Membros',
            sublabel: 'Relatório estatístico em PDF',
            icon: FileText,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 hover:bg-blue-500/20',
            action: () => triggerQuickAction('relatorios_membros', 'relatorios')
          }
        ];

      case 'fin_entrada':
      case 'fin_saida':
      case 'fin_dre':
      case 'fin_conciliacao':
      case 'fin_carnes':
      case 'fin_utilitarios':
        return [
          {
            id: 'lançamento_rapido',
            label: 'Novo Lançamento Rápido',
            sublabel: 'Entrada ou saída direta',
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            badge: 'Valores',
            action: () => { setQuickModal('financeiro'); setIsOpen(false); }
          },
          {
            id: 'carne_dizimo',
            label: 'Lançar Carnê de Dízimos',
            sublabel: 'Gerar parcelas de contribuição',
            icon: Receipt,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
            action: () => triggerQuickAction('carne_dizimo', 'fin_carnes')
          },
          {
            id: 'conciliacao',
            label: 'Conciliação Bancária',
            sublabel: 'Conferência de extrato',
            icon: TrendingUp,
            color: 'text-teal-500',
            bg: 'bg-teal-500/10 hover:bg-teal-500/20',
            action: () => triggerQuickAction('conciliacao', 'fin_conciliacao')
          }
        ];

      case 'visitantes':
        return [
          {
            id: 'visitante_rapido',
            label: 'Cadastrar Visitante Rápido',
            sublabel: 'Nome, contato e data',
            icon: UserPlus,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 hover:bg-amber-500/20',
            badge: 'Recepção',
            action: () => { setQuickModal('visitante'); setIsOpen(false); }
          },
          {
            id: 'mensagem_boas_vindas',
            label: 'Mensagem de Boas-Vindas',
            sublabel: 'Disparo rápido por e-mail/WhatsApp',
            icon: MessageSquare,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 hover:bg-blue-500/20',
            action: () => triggerQuickAction('mensagem_boas_vindas', 'email_interno')
          }
        ];

      case 'secretaria_integrada':
      case 'secretaria_livro_atas':
        return [
          {
            id: 'agendar_evento',
            label: 'Agendar Culto / Evento',
            sublabel: 'Data, hora e local',
            icon: Calendar,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
            badge: 'Agenda',
            action: () => { setQuickModal('evento'); setIsOpen(false); }
          },
          {
            id: 'nova_ata',
            label: 'Nova Ata de Reunião',
            sublabel: 'Livro oficial de atas',
            icon: FileText,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 hover:bg-amber-500/20',
            action: () => triggerQuickAction('nova_ata', 'secretaria_livro_atas')
          },
          {
            id: 'novo_certificado',
            label: 'Novo Certificado',
            sublabel: 'Batismo, apresentação, curso',
            icon: Award,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            action: () => triggerQuickAction('novo_certificado', 'secretaria_certificados')
          }
        ];

      case 'cad_celula':
        return [
          {
            id: 'agendar_celula',
            label: 'Relatório Semanal de Célula',
            sublabel: 'Presença, visitantes e ofertas',
            icon: Layers,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            badge: 'Célula',
            action: () => triggerQuickAction('relatorio_celula', 'cad_celula')
          },
          {
            id: 'agendar_evento',
            label: 'Agendar Encontro de Célula',
            sublabel: 'Data e anfitrião',
            icon: Calendar,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
            action: () => { setQuickModal('evento'); setIsOpen(false); }
          }
        ];

      case 'secretaria_ebd':
        return [
          {
            id: 'chamada_ebd',
            label: 'Registrar Frequência / Chamada',
            sublabel: 'Chamada rápida por classe',
            icon: GraduationCap,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 hover:bg-blue-500/20',
            badge: 'EBD',
            action: () => triggerQuickAction('chamada_ebd', 'secretaria_ebd')
          },
          {
            id: 'membro_rapido',
            label: 'Matricular Novo Aluno',
            sublabel: 'Cadastro expresso de aluno',
            icon: UserPlus,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            action: () => { setQuickModal('membro'); setIsOpen(false); }
          }
        ];

      case 'curso_teologia':
      case 'gestao_cursos':
        return [
          {
            id: 'consultar_licao',
            label: 'Apostilas da Declaração de Fé',
            sublabel: 'Ver material CPAD / CGADB',
            icon: BookOpen,
            color: 'text-teal-500',
            bg: 'bg-teal-500/10 hover:bg-teal-500/20',
            badge: 'CPAD',
            action: () => triggerQuickAction('consultar_licao', 'curso_teologia')
          },
          {
            id: 'aluno_teologia',
            label: 'Nova Matrícula Teológica',
            sublabel: 'Inscrição de alunos',
            icon: GraduationCap,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            action: () => triggerQuickAction('aluno_teologia', 'gestao_cursos')
          }
        ];

      case 'assistente_ai':
        return [
          {
            id: 'esboco_pregacao',
            label: 'Gerar Esboço de Pregação',
            sublabel: 'Auxiliar sermões pentecostais',
            icon: Sparkles,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            badge: 'IA Pastoral',
            action: () => triggerQuickAction('esboco_pregacao', 'assistente_ai')
          },
          {
            id: 'estudo_biblico',
            label: 'Perguntar ao Teólogo IA',
            sublabel: 'Exegese e síntese doutrinária',
            icon: BookOpen,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
            action: () => triggerQuickAction('estudo_biblico', 'assistente_ai')
          }
        ];

      case 'salinha_kids':
        return [
          {
            id: 'kids_checkin',
            label: 'Check-in Expresso Criança',
            sublabel: 'Etiqueta e responsabilidade',
            icon: Baby,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10 hover:bg-rose-500/20',
            badge: 'Kids',
            action: () => triggerQuickAction('kids_checkin', 'salinha_kids')
          }
        ];

      default:
        // Generic defaults for Portal or other modules
        if (view.startsWith('portal_')) {
          return [
            {
              id: 'pedir_oracao',
              label: 'Pedido de Oração Rápido',
              sublabel: 'Enviar intercessão à igreja',
              icon: HeartHandshake,
              color: 'text-rose-500',
              bg: 'bg-rose-500/10 hover:bg-rose-500/20',
              badge: 'Espiritual',
              action: () => { setQuickModal('oracao'); setIsOpen(false); }
            },
            {
              id: 'ler_biblia',
              label: 'Abrir Bíblia Sagrada',
              sublabel: 'Leitura e busca de versículos',
              icon: BookOpen,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10 hover:bg-amber-500/20',
              action: () => triggerQuickAction('ler_biblia', 'portal_biblia')
            },
            {
              id: 'jogos_interativos',
              label: 'Módulo Interativo (Jogos)',
              sublabel: 'Tetris, Show da Fé, Escape',
              icon: Gamepad2,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
              action: () => triggerQuickAction('jogos_interativos', 'portal_interativo')
            }
          ];
        }

        return [
          {
            id: 'membro_rapido',
            label: 'Novo Membro Rápido',
            sublabel: 'Cadastro expresso',
            icon: UserPlus,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            badge: 'Atalho',
            action: () => { setQuickModal('membro'); setIsOpen(false); }
          },
          {
            id: 'lançamento_rapido',
            label: 'Lançamento Financeiro',
            sublabel: 'Entrada / Dízimo / Oferta',
            icon: DollarSign,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 hover:bg-blue-500/20',
            action: () => { setQuickModal('financeiro'); setIsOpen(false); }
          },
          {
            id: 'agendar_evento',
            label: 'Agendar Culto / Evento',
            sublabel: 'Gravar na agenda da igreja',
            icon: Calendar,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            action: () => { setQuickModal('evento'); setIsOpen(false); }
          },
          {
            id: 'assistente_ai_quick',
            label: 'Perguntar à Pastoral IA',
            sublabel: 'Dúvidas doutrinárias e pregações',
            icon: Sparkles,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10 hover:bg-amber-500/20',
            action: () => triggerQuickAction('assistente_ai_quick', 'assistente_ai')
          }
        ];
    }
  };

  const contextualShortcuts = getContextualShortcuts();

  // Get readable active module title
  const getModuleTitle = () => {
    switch (view) {
      case 'cad_membro': return 'Membros';
      case 'fin_entrada': return 'Entradas Financeiras';
      case 'fin_saida': return 'Saídas Financeiras';
      case 'secretaria_integrada': return 'Secretaria';
      case 'visitantes': return 'Visitantes';
      case 'cad_celula': return 'Células / Grupos';
      case 'secretaria_ebd': return 'EBD Escola Bíblica';
      case 'curso_teologia': return 'Universidade Teológica';
      case 'assistente_ai': return 'Pastoral IA';
      case 'salinha_kids': return 'Salinha Kids';
      default: return 'GIPP Atalhos';
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON (FAB) CONTAINER */}
      <div
        ref={fabRef}
        className="fixed bottom-44 md:bottom-28 right-5 md:right-8 z-[9000] no-print select-none"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-16 right-0 w-80 md:w-88 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden mb-2"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Zap size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-tight text-white uppercase">Ações Rápidas Contextuais</h3>
                    <p className="text-[10px] text-emerald-400 font-extrabold truncate">Módulo: {getModuleTitle()}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Ctrl+Space
                </span>
              </div>

              {/* Contextual Action Items List */}
              <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 flex items-center justify-between">
                  <span>Atalhos Recomendados</span>
                  <span className="text-[8px] font-semibold text-slate-500">Toque para executar</span>
                </div>
                {contextualShortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <button
                      key={shortcut.id}
                      onClick={shortcut.action}
                      title={`${shortcut.label}: ${shortcut.sublabel || 'Executar ação rápida'}`}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all duration-200 text-left group cursor-pointer border border-transparent hover:border-slate-700/60 ${shortcut.bg} relative`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0 ${shortcut.color} group-hover:scale-110 transition-transform`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-100 group-hover:text-white transition-colors truncate">
                              {shortcut.label}
                            </span>
                            {shortcut.badge && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                {shortcut.badge}
                              </span>
                            )}
                          </div>
                          {shortcut.sublabel && (
                            <p className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 truncate">
                              {shortcut.sublabel}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>

              {/* Global Quick Action Switcher */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-950/80 grid grid-cols-2 gap-1.5 text-center">
                <button
                  onClick={() => { setQuickModal('membro'); setIsOpen(false); }}
                  title="Abrir modal para cadastro expresso de novo membro"
                  className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={12} className="text-emerald-400" /> + Membro
                </button>
                <button
                  onClick={() => { setQuickModal('financeiro'); setIsOpen(false); }}
                  title="Abrir modal para registro rápido de dízimo ou oferta"
                  className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign size={12} className="text-blue-400" /> + Dízimo/Oferta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN FAB BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group h-14 w-14 md:h-15 md:w-15 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer border border-white/20 active:scale-95 ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40 rotate-90'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-500/35 hover:scale-105'
          }`}
          title="Atalhos Rápidos Contextuais (Ctrl+Espaço)"
        >
          {isOpen ? (
            <X size={26} className="transition-transform duration-300" />
          ) : (
            <>
              <Plus size={28} className="transition-transform duration-300 group-hover:rotate-90" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* QUICK FORM MODALS (LIGHTWEIGHT POPUPS) */}
      <AnimatePresence>
        {quickModal !== 'none' && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden relative p-6"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setQuickModal('none')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* MEMBRO RÁPIDO MODAL */}
              {quickModal === 'membro' && (
                <form onSubmit={handleSaveQuickMembro} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                      <UserPlus size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Cadastrar Membro Rápido</h3>
                      <p className="text-xs text-slate-400 font-medium">Preenchimento expresso sem mudar de tela</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={membroForm.nome}
                      onChange={e => setMembroForm({ ...membroForm, nome: e.target.value })}
                      placeholder="Ex: Pr. João da Silva"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={membroForm.telefone}
                        onChange={e => setMembroForm({ ...membroForm, telefone: e.target.value })}
                        placeholder="(00) 90000-0000"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Função / Cargo</label>
                      <select
                        value={membroForm.cargo}
                        onChange={e => setMembroForm({ ...membroForm, cargo: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-emerald-500 outline-none"
                      >
                        <option value="Membro">Membro</option>
                        <option value="Congregado">Congregado</option>
                        <option value="Diácono">Diácono</option>
                        <option value="Presbítero">Presbítero</option>
                        <option value="Evangelista">Evangelista</option>
                        <option value="Pastor">Pastor</option>
                        <option value="Líder">Líder</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setQuickModal('none'); setView('cad_membro'); }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Formulário Completo
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Gravando...' : <><Check size={16} /> Cadastrar Membro</>}
                    </button>
                  </div>
                </form>
              )}

              {/* FINANCEIRO RÁPIDO MODAL */}
              {quickModal === 'financeiro' && (
                <form onSubmit={handleSaveQuickFinanceiro} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                      <DollarSign size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Lançamento Financeiro Rápido</h3>
                      <p className="text-xs text-slate-400 font-medium">Registo de entradas, dízimos e despesas</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tipo *</label>
                      <select
                        value={finForm.tipo}
                        onChange={e => setFinForm({ ...finForm, tipo: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-blue-500 outline-none"
                      >
                        <option value="Entrada">Entrada (Receita)</option>
                        <option value="Saída">Saída (Despesa)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={finForm.valor}
                        onChange={e => setFinForm({ ...finForm, valor: e.target.value })}
                        placeholder="0,00"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Categoria</label>
                      <select
                        value={finForm.categoria}
                        onChange={e => setFinForm({ ...finForm, categoria: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-blue-500 outline-none"
                      >
                        <option value="Dízimo">Dízimo</option>
                        <option value="Oferta">Oferta de Culto</option>
                        <option value="Oferta de Missões">Oferta de Missões</option>
                        <option value="Construção / Reforma">Construção / Reforma</option>
                        <option value="Energia / Água / Net">Energia / Água / Net</option>
                        <option value="Manutenção">Manutenção Geral</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Data</label>
                      <input
                        type="date"
                        value={finForm.data}
                        onChange={e => setFinForm({ ...finForm, data: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Descrição / Observação</label>
                    <input
                      type="text"
                      value={finForm.descricao}
                      onChange={e => setFinForm({ ...finForm, descricao: e.target.value })}
                      placeholder="Ex: Dízimo cultos domingo ou conta luz"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setQuickModal('none'); setView('fin_entrada'); }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Painel Completo
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Gravando...' : <><Check size={16} /> Salvar Lançamento</>}
                    </button>
                  </div>
                </form>
              )}

              {/* VISITANTE RÁPIDO MODAL */}
              {quickModal === 'visitante' && (
                <form onSubmit={handleSaveQuickVisitante} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                      <UserPlus size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Cadastrar Visitante</h3>
                      <p className="text-xs text-slate-400 font-medium">Recepção e boas-vindas do culto</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Visitante *</label>
                    <input
                      type="text"
                      required
                      value={visForm.nome}
                      onChange={e => setVisForm({ ...visForm, nome: e.target.value })}
                      placeholder="Ex: Maria das Dores"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Telefone / Whats</label>
                      <input
                        type="text"
                        value={visForm.telefone}
                        onChange={e => setVisForm({ ...visForm, telefone: e.target.value })}
                        placeholder="(00) 90000-0000"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Data da Visita</label>
                      <input
                        type="date"
                        value={visForm.data}
                        onChange={e => setVisForm({ ...visForm, data: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setQuickModal('none'); setView('visitantes'); }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Módulo Visitantes
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Gravando...' : <><Check size={16} /> Salvar Visitante</>}
                    </button>
                  </div>
                </form>
              )}

              {/* EVENTO RÁPIDO MODAL */}
              {quickModal === 'evento' && (
                <form onSubmit={handleSaveQuickEvento} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Agendar Evento / Culto</h3>
                      <p className="text-xs text-slate-400 font-medium">Inclusão direta na agenda da igreja</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Título do Culto / Evento *</label>
                    <input
                      type="text"
                      required
                      value={evtForm.titulo}
                      onChange={e => setEvtForm({ ...evtForm, titulo: e.target.value })}
                      placeholder="Ex: Culto de Doutrina e Ensino"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-bold focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Data</label>
                      <input
                        type="date"
                        value={evtForm.data}
                        onChange={e => setEvtForm({ ...evtForm, data: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Horário</label>
                      <input
                        type="time"
                        value={evtForm.hora}
                        onChange={e => setEvtForm({ ...evtForm, hora: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setQuickModal('none'); setView('secretaria_integrada'); }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Agenda Completa
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Gravando...' : <><Check size={16} /> Gravar Evento</>}
                    </button>
                  </div>
                </form>
              )}

              {/* ORAÇÃO RÁPIDO MODAL */}
              {quickModal === 'oracao' && (
                <form onSubmit={handleSaveQuickOracao} className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                      <HeartHandshake size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Pedido de Oração</h3>
                      <p className="text-xs text-slate-400 font-medium">Envio direto para os intercessores</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Escreva seu pedido *</label>
                    <textarea
                      required
                      rows={3}
                      value={oracaoForm.pedido}
                      onChange={e => setOracaoForm({ ...oracaoForm, pedido: e.target.value })}
                      placeholder="Descreva seu pedido de oração (família, saúde, libertação, causas impossíveis)..."
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs font-bold focus:border-rose-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <input
                      type="checkbox"
                      id="sigiloso"
                      checked={oracaoForm.sigiloso}
                      onChange={e => setOracaoForm({ ...oracaoForm, sigiloso: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="sigiloso" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Pedido Sigiloso (Apenas Pastores)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuickModal('none')}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Enviando...' : <><Send size={15} /> Enviar Pedido</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
