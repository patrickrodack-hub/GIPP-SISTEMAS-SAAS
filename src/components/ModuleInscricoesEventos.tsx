import React, { useState, useContext, useEffect, useMemo } from 'react';
import { 
  CalendarDays, Users, QrCode, MessageSquare, BarChart3, 
  Sparkles, Layers, ShieldCheck, UserCheck, ArrowRight, ArrowLeft,
  HelpCircle, Settings, CheckCircle2, ChevronRight, RefreshCw,
  Printer, Smartphone, Calendar, Eye, X, Clock, MapPin, Check,
  Camera, Flame, AlertCircle, FileCheck
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';
import { 
  EventoItem, InscricaoItem, StatusPagamento, EVENTOS_INICIAIS, INSCRICOES_INICIAIS,
  formatEventDates, TIPOS_EVENTO_CONFIG 
} from '../data/eventosInscricoesData';
import { EventosAdminArea } from './inscricoes/EventosAdminArea';
import { InscricoesAdminTable } from './inscricoes/InscricoesAdminTable';
import { ComunicacaoInscritos } from './inscricoes/ComunicacaoInscritos';
import { CheckinScannerModal } from './inscricoes/CheckinScannerModal';
import { PortalMembroInscricoes } from './inscricoes/PortalMembroInscricoes';

interface ModuleInscricoesEventosProps {
  initialMode?: 'admin' | 'portal';
  portalOnly?: boolean;
  onClose?: () => void;
}

export default function ModuleInscricoesEventos({
  initialMode = 'admin',
  portalOnly = false,
  onClose,
}: ModuleInscricoesEventosProps) {
  const { db, setDbState, addToast, user } = useContext(ChurchContext);

  // If portalOnly is true, never allow switching to admin
  const isPortalMode = portalOnly || initialMode === 'portal';

  // Admin sub-tabs: eventos, inscricoes, comunicacao, checkin
  const [adminTab, setAdminTab] = useState<'eventos' | 'inscricoes' | 'comunicacao' | 'checkin'>('eventos');

  // Selected event filter for registrations table
  const [selectedEventoFilter, setSelectedEventoFilter] = useState<string>('todos');

  // Active check-in modal event
  const [checkinModalEvento, setCheckinModalEvento] = useState<EventoItem | null>(null);

  // Admin preview modal to test how members see the portal
  const [showMemberPreviewModal, setShowMemberPreviewModal] = useState(false);

  // Events & Registrations state (synced with db or localStorage or initial)
  const eventos: EventoItem[] = useMemo(() => {
    if (Array.isArray(db?.eventos) && db.eventos.length > 0) {
      return db.eventos;
    }
    try {
      const cached = localStorage.getItem('gipp_eventos');
      if (cached) return JSON.parse(cached);
    } catch {}
    return EVENTOS_INICIAIS;
  }, [db?.eventos]);

  const inscricoes: InscricaoItem[] = useMemo(() => {
    if (Array.isArray(db?.inscricoes_eventos) && db.inscricoes_eventos.length > 0) {
      return db.inscricoes_eventos;
    }
    try {
      const cached = localStorage.getItem('gipp_inscricoes_eventos');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INSCRICOES_INICIAIS;
  }, [db?.inscricoes_eventos]);

  const membros = useMemo(() => db?.membros || [], [db?.membros]);

  // Persist helper
  const saveEventos = (updated: EventoItem[]) => {
    if (setDbState) {
      setDbState((prev: any) => ({ ...prev, eventos: updated }));
    }
    try {
      localStorage.setItem('gipp_eventos', JSON.stringify(updated));
    } catch {}
  };

  const saveInscricoes = (updated: InscricaoItem[]) => {
    if (setDbState) {
      setDbState((prev: any) => ({ ...prev, inscricoes_eventos: updated }));
    }
    try {
      localStorage.setItem('gipp_inscricoes_eventos', JSON.stringify(updated));
    } catch {}
  };

  // Event handlers
  const handleSaveEvento = (evento: EventoItem) => {
    const exists = eventos.some((e) => e.id === evento.id);
    let updated: EventoItem[];
    if (exists) {
      updated = eventos.map((e) => (e.id === evento.id ? evento : e));
      addToast('Evento atualizado com sucesso!', 'success');
    } else {
      updated = [evento, ...eventos];
      addToast('Novo evento cadastrado com sucesso!', 'success');
    }
    saveEventos(updated);
  };

  const handleDeleteEvento = (eventoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento e seus registros?')) {
      const updatedEvts = eventos.filter((e) => e.id !== eventoId);
      const updatedIns = inscricoes.filter((i) => i.eventoId !== eventoId);
      saveEventos(updatedEvts);
      saveInscricoes(updatedIns);
      addToast('Evento excluído com sucesso.', 'info');
    }
  };

  const handleDuplicateEvento = (evento: EventoItem) => {
    const duplicated: EventoItem = {
      ...evento,
      id: `evt_${Date.now()}`,
      nome: `${evento.nome} (Cópia)`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    saveEventos([duplicated, ...eventos]);
    addToast('Evento duplicado com sucesso!', 'success');
  };

  // Registration handlers
  const handleSaveInscricao = (ins: InscricaoItem) => {
    const exists = inscricoes.some((i) => i.id === ins.id);
    let updated: InscricaoItem[];
    if (exists) {
      updated = inscricoes.map((i) => (i.id === ins.id ? ins : i));
      addToast('Inscrição atualizada com sucesso!', 'success');
    } else {
      updated = [ins, ...inscricoes];
      addToast('Inscrição adicionada com sucesso!', 'success');
    }
    saveInscricoes(updated);
  };

  const handleDeleteInscricao = (insId: string) => {
    if (window.confirm('Deseja realmente remover esta inscrição?')) {
      const updated = inscricoes.filter((i) => i.id !== insId);
      saveInscricoes(updated);
      addToast('Inscrição removida.', 'info');
    }
  };

  const handleTogglePagamento = (insId: string) => {
    const updated = inscricoes.map((ins) => {
      if (ins.id === insId) {
        const next: StatusPagamento = ins.statusPagamento === 'pago' ? 'nao_pago' : 'pago';
        return { ...ins, statusPagamento: next, valorPago: next === 'pago' ? (ins.valorPago || 50) : 0 };
      }
      return ins;
    });
    saveInscricoes(updated);
    addToast('Status de pagamento atualizado!', 'success');
  };

  const handleTogglePresenca = (insId: string) => {
    const updated = inscricoes.map((ins) => {
      if (ins.id === insId) {
        const next = !ins.presente;
        return {
          ...ins,
          presente: next,
          checkInEm: next ? new Date().toISOString() : undefined,
        };
      }
      return ins;
    });
    saveInscricoes(updated);
    addToast('Presença atualizada com sucesso!', 'success');
  };

  // Fast Check-in confirmation from scanner
  const handleCheckinConfirm = (insId: string) => {
    const updated = inscricoes.map((ins) => {
      if (ins.id === insId) {
        return {
          ...ins,
          presente: true,
          checkInEm: new Date().toISOString(),
        };
      }
      return ins;
    });
    saveInscricoes(updated);
  };

  // =========================================================================
  // 1. MEMBER PORTAL VIEW (Used strictly inside Portal de Membros)
  // No administrative toggles, no leadership options, 100% member-centric.
  // =========================================================================
  if (isPortalMode) {
    return (
      <div className="min-h-full bg-slate-50/70 p-4 md:p-8 font-sans space-y-6">
        {/* Portal de Membro Header */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-violet-500/25 shrink-0">
              <CalendarDays size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                  Portal do Membro
                </span>
                <span className="text-xs text-slate-400">• Cursos, Retiros & Conferências</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Inscrições Online & Eventos
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulte os eventos disponíveis, confirme sua inscrição com 1 clique e acesse seu voucher com QR Code.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Voltar ao Início</span>
            </button>
          )}
        </div>

        {/* Member Component */}
        <PortalMembroInscricoes
          user={user}
          eventos={eventos}
          inscricoes={inscricoes}
          onNovaInscricaoMembro={handleSaveInscricao}
          onCancelarInscricao={handleDeleteInscricao}
          igrejaNome={db?.igreja?.nome}
          igrejaPix={db?.igreja?.chave_pix}
          addToast={addToast}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. ÁREA ADMINISTRATIVA (Secretaria Eclesiástica / Gestão & Liderança)
  // Full leadership control: Eventos, Inscrições, Comunicação, Check-in
  // =========================================================================
  const totalInscritos = inscricoes.length;
  const totalPresentes = inscricoes.filter((i) => i.presente).length;
  const taxaPresenca = totalInscritos > 0 ? Math.round((totalPresentes / totalInscritos) * 100) : 0;

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-8 font-sans space-y-6">
      {/* Top Header - Secretaria Eclesiástica */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-violet-500/25 shrink-0">
            <CalendarDays size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                <ShieldCheck size={13} className="text-amber-600" />
                Secretaria Eclesiástica
              </span>
              <span className="text-xs text-slate-400 font-medium">• Área Administrativa (Gestão e Liderança)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Inscrições Online & Gestão de Eventos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Criação de eventos, gerenciamento de inscritos, disparo de comunicados e controle de check-in digital com QR Code.
            </p>
          </div>
        </div>

        {/* Leadership Actions */}
        <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
          {/* Quick Scanner Action */}
          <button
            onClick={() => {
              if (eventos.length > 0) {
                setCheckinModalEvento(eventos[0]);
              } else {
                addToast('Cadastre um evento primeiro para iniciar o check-in.', 'warning');
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-md shadow-violet-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Camera size={16} />
            <span>Scanner Check-in</span>
          </button>

          {/* Preview Member View Button */}
          <button
            onClick={() => setShowMemberPreviewModal(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-violet-700 bg-slate-100 hover:bg-violet-50 transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Visualizar exatamente como os membros visualizam o portal de inscrições"
          >
            <Eye size={15} className="text-slate-500" />
            <span>Prévia do Membro</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Fechar módulo"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAdminTab('eventos')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            adminTab === 'eventos'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays size={16} />
          <span>Cadastro de Eventos ({eventos.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('inscricoes')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            adminTab === 'inscricoes'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>Gerenciamento de Inscrições ({inscricoes.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('comunicacao')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            adminTab === 'comunicacao'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={16} />
          <span>Comunicação & WhatsApp</span>
        </button>

        <button
          onClick={() => setAdminTab('checkin')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            adminTab === 'checkin'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode size={16} />
          <span>Controle de Check-in & Frequência ({totalPresentes}/{totalInscritos})</span>
        </button>
      </div>

      {/* Admin Sub-Tab Contents */}
      {adminTab === 'eventos' && (
        <EventosAdminArea
          eventos={eventos}
          inscricoes={inscricoes}
          onSaveEvento={handleSaveEvento}
          onDeleteEvento={handleDeleteEvento}
          onDuplicateEvento={handleDuplicateEvento}
          onSelectEventoFilter={(evtId) => {
            setSelectedEventoFilter(evtId);
            setAdminTab('inscricoes');
          }}
          onOpenCheckin={(evtId) => {
            const ev = eventos.find((e) => e.id === evtId);
            if (ev) setCheckinModalEvento(ev);
          }}
          igrejaPix={db?.igreja?.chave_pix}
        />
      )}

      {adminTab === 'inscricoes' && (
        <InscricoesAdminTable
          inscricoes={inscricoes}
          eventos={eventos}
          membros={membros}
          selectedEventoFilter={selectedEventoFilter}
          onSelectEventoFilter={setSelectedEventoFilter}
          onSaveInscricao={handleSaveInscricao}
          onDeleteInscricao={handleDeleteInscricao}
          onTogglePagamento={handleTogglePagamento}
          onTogglePresenca={handleTogglePresenca}
          onOpenQrModal={(ins) => {
            const ev = eventos.find((e) => e.id === ins.eventoId);
            if (ev) setCheckinModalEvento(ev);
          }}
        />
      )}

      {adminTab === 'comunicacao' && (
        <ComunicacaoInscritos
          eventos={eventos}
          inscricoes={inscricoes}
          igrejaNome={db?.igreja?.nome}
          igrejaPix={db?.igreja?.chave_pix}
          addToast={addToast}
        />
      )}

      {adminTab === 'checkin' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total de Inscritos</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalInscritos}</p>
              <span className="text-[11px] text-slate-400">Todos os eventos cadastrados</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-emerald-600 font-bold uppercase">Presentes (Check-in)</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalPresentes}</p>
              <span className="text-[11px] text-emerald-500 font-medium">Validados na recepção</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-amber-600 font-bold uppercase">Ausentes / Pendentes</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{totalInscritos - totalPresentes}</p>
              <span className="text-[11px] text-slate-400">Aguardando confirmação</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-violet-600 font-bold uppercase">Taxa de Presença</span>
              <p className="text-2xl font-black text-violet-700 mt-1">{taxaPresenca}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${taxaPresenca}%` }}
                />
              </div>
            </div>
          </div>

          {/* Events Check-in Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Controle de Presença por Evento
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione o evento para abrir o scanner com leitura em tempo real e câmera de recepção.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventos.map((evt) => {
                const insEvt = inscricoes.filter((i) => i.eventoId === evt.id);
                const presEvt = insEvt.filter((i) => i.presente).length;
                const perc = insEvt.length > 0 ? Math.round((presEvt / insEvt.length) * 100) : 0;
                const config = TIPOS_EVENTO_CONFIG[evt.tipo] || TIPOS_EVENTO_CONFIG.curso;

                return (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-violet-300 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${config.badgeColor}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users size={12} /> {insEvt.length}/{evt.capacidadeMaxima}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                        {evt.nome}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5 truncate">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          {formatEventDates(evt.dataInicio, evt.dataFim)}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          {evt.horario}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          {evt.local}
                        </p>
                      </div>

                      {/* Presence mini progress */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-600">Presença: {presEvt}/{insEvt.length}</span>
                          <span className="font-black text-violet-700">{perc}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all" 
                            style={{ width: `${perc}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setCheckinModalEvento(evt)}
                        className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>Abrir Scanner</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedEventoFilter(evt.id);
                          setAdminTab('inscricoes');
                        }}
                        className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Ver lista de participantes"
                      >
                        <Users size={14} />
                        <span>Inscritos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Check-in Camera / Manual Scanner Modal */}
      {checkinModalEvento && (
        <CheckinScannerModal
          evento={checkinModalEvento}
          inscricoes={inscricoes}
          onCheckinConfirm={handleCheckinConfirm}
          onClose={() => setCheckinModalEvento(null)}
        />
      )}

      {/* Leadership Preview Modal: Visualizar como Membro */}
      {showMemberPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col p-4 md:p-8 overflow-hidden animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 flex-1 flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
            {/* Preview Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Modo de Pré-visualização da Secretaria
                </span>
                <span className="text-xs text-amber-700 hidden sm:inline">
                  — Esta é a visão exata que o membro terá no portal. Nenhuma ferramenta administrativa é exibida aqui.
                </span>
              </div>
              <button
                onClick={() => setShowMemberPreviewModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <X size={14} />
                <span>Fechar Prévia</span>
              </button>
            </div>

            {/* Member Portal Embedded View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/70">
              <PortalMembroInscricoes
                user={user}
                eventos={eventos}
                inscricoes={inscricoes}
                onNovaInscricaoMembro={handleSaveInscricao}
                onCancelarInscricao={handleDeleteInscricao}
                igrejaNome={db?.igreja?.nome}
                igrejaPix={db?.igreja?.chave_pix}
                addToast={addToast}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
