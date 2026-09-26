import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Clock, Users, QrCode, CheckCircle2, 
  Sparkles, DollarSign, X, ArrowRight, Download, Printer, 
  Send, AlertCircle, Copy, Check, ChevronRight, ShieldCheck,
  FileCheck, HelpCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  EventoItem, InscricaoItem, TIPOS_EVENTO_CONFIG, 
  IMAGENS_BANNER_PRESET, formatEventDates, generateEventCheckinToken 
} from '../../data/eventosInscricoesData';

interface PortalMembroInscricoesProps {
  user: any;
  eventos: EventoItem[];
  inscricoes: InscricaoItem[];
  onNovaInscricaoMembro: (inscricao: InscricaoItem) => void;
  onCancelarInscricao: (inscricaoId: string) => void;
  igrejaNome?: string;
  igrejaPix?: string;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const PortalMembroInscricoes: React.FC<PortalMembroInscricoesProps> = ({
  user,
  eventos,
  inscricoes,
  onNovaInscricaoMembro,
  onCancelarInscricao,
  igrejaNome = 'Igreja Sede',
  igrejaPix = '12.345.678/0001-90',
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'disponiveis' | 'minhas'>('disponiveis');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [selectedInscricaoModal, setSelectedInscricaoModal] = useState<InscricaoItem | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [sucessoModal, setSucessoModal] = useState<{ open: boolean; inscricao: InscricaoItem; evento: EventoItem } | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  // Identify member's registrations
  const minhasInscricoes = inscricoes.filter((ins) => {
    if (user?.id && ins.membroId === user.id) return true;
    if (user?.cpf && ins.cpf && ins.cpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, '')) return true;
    if (user?.email && ins.email && ins.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (user?.nome && ins.nome && ins.nome.toLowerCase().trim() === user.nome.toLowerCase().trim()) return true;
    return false;
  });

  const eventosAbertos = eventos.filter((e) => e.status === 'aberto' || e.status === 'em_breve');

  // Filtered available events
  const filteredEventos = eventosAbertos.filter((e) => {
    if (filtroTipo === 'todos') return true;
    return e.tipo === filtroTipo;
  });

  // Check if member is already registered in an event
  const isAlreadyRegistered = (eventoId: string) => {
    return minhasInscricoes.some((i) => i.eventoId === eventoId && i.status !== 'cancelado');
  };

  const getMyRegistrationForEvent = (eventoId: string) => {
    return minhasInscricoes.find((i) => i.eventoId === eventoId && i.status !== 'cancelado');
  };

  // 1-Click Fast Registration
  const handleInscreverSe = async (evt: EventoItem) => {
    if (isAlreadyRegistered(evt.id)) {
      addToast('Você já está inscrito neste evento!', 'info');
      const ins = getMyRegistrationForEvent(evt.id);
      if (ins) openQrModal(ins);
      return;
    }

    const insId = `ins_${Date.now()}`;
    const token = generateEventCheckinToken(evt.id, insId);

    // Generate QR Code data URL
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(token, { width: 300, margin: 2 });
    } catch {
      // fallback
    }

    const novaInscricao: InscricaoItem = {
      id: insId,
      eventoId: evt.id,
      membroId: user?.id,
      nome: user?.nome || 'Membro da Igreja',
      email: user?.email || '',
      telefone: user?.telefone || user?.celular || user?.whatsapp || '',
      cpf: user?.cpf || undefined,
      tipoParticipante: 'membro',
      dataInscricao: new Date().toISOString(),
      status: 'confirmado',
      statusPagamento: evt.valorInscricao === 0 ? 'isento' : 'nao_pago',
      valorPago: 0,
      formaPagamento: evt.valorInscricao === 0 ? 'isento' : 'pix',
      qrCodeToken: token,
      qrCodeDataUrl: qrDataUrl,
      presente: false,
    };

    onNovaInscricaoMembro(novaInscricao);
    setSucessoModal({ open: true, inscricao: novaInscricao, evento: evt });
    addToast('Inscrição realizada com sucesso!', 'success');
  };

  // Open QR Pass modal
  const openQrModal = async (ins: InscricaoItem) => {
    setSelectedInscricaoModal(ins);
    try {
      const url = await QRCode.toDataURL(ins.qrCodeToken, { width: 350, margin: 2 });
      setQrCodeDataUrl(url);
    } catch {
      setQrCodeDataUrl('');
    }
  };

  const handleCopyPix = (pixKey: string) => {
    navigator.clipboard.writeText(pixKey);
    setPixCopiado(true);
    addToast('Chave PIX copiada para a área de transferência!', 'success');
    setTimeout(() => setPixCopiado(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-md inline-block mb-3">
            Portal de Inscrições & Eventos
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Inscreva-se em Cursos, Retiros e Conferências
          </h1>
          <p className="text-sm md:text-base text-violet-100 mt-2 leading-relaxed">
            Olá, <strong className="text-white">{user?.nome || 'Membro'}</strong>! Participe dos eventos oficiais da nossa igreja com inscrição rápida em 1 clique e credencial digital com QR Code.
          </p>

          {/* Tab Selector */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('disponiveis')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'disponiveis'
                  ? 'bg-white text-violet-900 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              Eventos Disponíveis ({eventosAbertos.length})
            </button>

            <button
              onClick={() => setActiveTab('minhas')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'minhas'
                  ? 'bg-white text-violet-900 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              <span>Minhas Inscrições</span>
              {minhasInscricoes.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {minhasInscricoes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* VIEW 1: EVENTOS DISPONÍVEIS */}
      {activeTab === 'disponiveis' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['todos', 'curso', 'retiro', 'conferencia', 'workshop', 'vigilia'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  filtroTipo === tipo
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tipo === 'todos' ? 'Todos os Eventos' : TIPOS_EVENTO_CONFIG[tipo as any]?.label || tipo}
              </button>
            ))}
          </div>

          {/* Event Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEventos.map((evt) => {
              const registered = isAlreadyRegistered(evt.id);
              const countInscritos = inscricoes.filter((i) => i.eventoId === evt.id && i.status !== 'cancelado').length;
              const vagasRestantes = Math.max(0, evt.capacidadeMaxima - countInscritos);
              const pctOcupacao = Math.min(100, Math.round((countInscritos / (evt.capacidadeMaxima || 1)) * 100));
              const tipoCfg = TIPOS_EVENTO_CONFIG[evt.tipo] || TIPOS_EVENTO_CONFIG.outro;

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Banner */}
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={evt.imagem || IMAGENS_BANNER_PRESET[0]}
                        alt={evt.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Badge Tipo & Preço */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md bg-white/90 ${tipoCfg.textColor}`}>
                          {tipoCfg.label}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                          {evt.valorInscricao === 0 ? 'GRATUITO' : `R$ ${evt.valorInscricao.toFixed(2)}`}
                        </span>
                      </div>

                      {/* Dates at bottom */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-violet-300" />
                          <span>{formatEventDates(evt.dataInicio, evt.dataFim)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-violet-300" />
                          <span>{evt.horario}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-black text-lg text-slate-800 leading-snug group-hover:text-violet-600 transition-colors">
                        {evt.nome}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {evt.descricao}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-violet-500 shrink-0" />
                          <span className="truncate">{evt.local}</span>
                        </div>

                        {/* Vagas Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-400">
                              {vagasRestantes} vagas restantes
                            </span>
                            <span className={pctOcupacao >= 90 ? 'text-rose-600' : 'text-slate-600'}>
                              {countInscritos}/{evt.capacidadeMaxima} inscritos
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pctOcupacao >= 90 ? 'bg-rose-500' : 'bg-violet-600'
                              }`}
                              style={{ width: `${pctOcupacao}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0">
                    {registered ? (
                      <button
                        onClick={() => {
                          const ins = getMyRegistrationForEvent(evt.id);
                          if (ins) openQrModal(ins);
                        }}
                        className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all border border-emerald-200"
                      >
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Inscrito! Ver Credencial QR Code</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInscreverSe(evt)}
                        disabled={vagasRestantes <= 0}
                        className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                          vagasRestantes <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span>{vagasRestantes <= 0 ? 'Vagas Esgotadas' : 'Inscrever-se com 1 Clique'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MINHAS INSCRIÇÕES */}
      {activeTab === 'minhas' && (
        <div className="space-y-4">
          {minhasInscricoes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Você ainda não se inscreveu em nenhum evento</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Explore os cursos, retiros e conferências disponíveis na aba "Eventos Disponíveis" e garanta sua vaga com 1 clique!
              </p>
              <button
                onClick={() => setActiveTab('disponiveis')}
                className="mt-5 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors"
              >
                Ver Eventos Abertos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {minhasInscricoes.map((ins) => {
                const evt = eventos.find((e) => e.id === ins.eventoId);
                return (
                  <div
                    key={ins.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                            {evt?.tipo || 'Evento'}
                          </span>
                          <h3 className="text-base font-black text-slate-800 mt-1.5">{evt?.nome || 'Evento'}</h3>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                            ins.presente
                              ? 'bg-emerald-500 text-white'
                              : ins.statusPagamento === 'pago' || ins.statusPagamento === 'isento'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ins.presente ? 'Presença Confirmada' : ins.statusPagamento === 'pago' ? 'Confirmado' : ins.statusPagamento === 'isento' ? 'Gratuito' : 'Pendente Pix'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-violet-500 shrink-0" />
                          <span>{evt?.dataInicio ? new Date(evt.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : ''} • {evt?.horario}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-violet-500 shrink-0" />
                          <span className="truncate">{evt?.local}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          <QrCode size={14} className="text-slate-400 shrink-0" />
                          <span>Código: {ins.qrCodeToken}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => openQrModal(ins)}
                        className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <QrCode size={16} />
                        <span>Abrir QR Code Check-in</span>
                      </button>

                      <button
                        onClick={() => onCancelarInscricao(ins.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                        title="Cancelar inscrição"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL SUCESSO CELEBRAÇÃO */}
      {sucessoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-black text-slate-800">Inscrição Realizada com Sucesso!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sua vaga está garantida para <strong>{sucessoModal.evento.nome}</strong>.
            </p>

            {/* QR Code Preview */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {sucessoModal.inscricao.qrCodeDataUrl ? (
                <img
                  src={sucessoModal.inscricao.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-xl shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-white rounded-xl">
                  <QrCode size={64} className="text-slate-400" />
                </div>
              )}
              <p className="font-mono text-xs font-bold text-slate-600 mt-2">
                {sucessoModal.inscricao.qrCodeToken}
              </p>
            </div>

            {/* Pix Instructions if paid */}
            {sucessoModal.evento.valorInscricao > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs mb-4">
                <p className="font-bold text-amber-800 flex items-center gap-1.5">
                  <DollarSign size={14} /> Pagamento da Inscrição (R$ {sucessoModal.evento.valorInscricao.toFixed(2)})
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Chave PIX: <strong>{sucessoModal.evento.chavePix || igrejaPix}</strong>
                </p>
                <button
                  onClick={() => handleCopyPix(sucessoModal.evento.chavePix || igrejaPix)}
                  className="mt-2 text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>{pixCopiado ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSucessoModal(null);
                setActiveTab('minhas');
              }}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
            >
              Concluir e Ver Minhas Inscrições
            </button>
          </div>
        </div>
      )}

      {/* MODAL CREDENCIAL DIGITAL / QR CODE FULLSCREEN */}
      {selectedInscricaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedInscricaoModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              Credencial de Acesso Oficial
            </span>

            <h3 className="text-base font-black text-slate-800 mt-2">
              {eventos.find((e) => e.id === selectedInscricaoModal.eventoId)?.nome}
            </h3>

            {/* Big QR Code */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-xl" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <QrCode size={80} className="text-slate-400" />
                </div>
              )}
              <p className="font-mono text-xs font-bold text-slate-700 mt-2">
                {selectedInscricaoModal.qrCodeToken}
              </p>
            </div>

            {/* Participant Name */}
            <div className="text-xs text-slate-600 space-y-1 mb-5">
              <p className="font-black text-sm text-slate-800">{selectedInscricaoModal.nome}</p>
              <p className="text-[11px] text-slate-400">{igrejaNome}</p>
              <p className="text-[11px] font-bold text-emerald-600">
                {selectedInscricaoModal.presente ? 'Presença Já Validada na Portaria' : 'Apresente na Entrada do Evento'}
              </p>
            </div>

            <button
              onClick={() => setSelectedInscricaoModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Fechar Credencial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
