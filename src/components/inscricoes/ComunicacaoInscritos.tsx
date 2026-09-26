import React, { useState } from 'react';
import { 
  MessageSquare, Mail, Send, CheckCircle, Clock, Copy, 
  Sparkles, Phone, Users, Calendar, AlertCircle, ExternalLink,
  ChevronRight, RefreshCw, Smartphone
} from 'lucide-react';
import { 
  EventoItem, InscricaoItem, MensagemTemplate, DisparoComunicacao,
  TEMPLATES_MENSAGENS_INICIAIS 
} from '../../data/eventosInscricoesData';

interface ComunicacaoInscritosProps {
  eventos: EventoItem[];
  inscricoes: InscricaoItem[];
  igrejaNome?: string;
  igrejaPix?: string;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ComunicacaoInscritos: React.FC<ComunicacaoInscritosProps> = ({
  eventos,
  inscricoes,
  igrejaNome = 'Igreja Sede',
  igrejaPix = 'Chave PIX da Igreja',
  addToast,
}) => {
  const [selectedEventoId, setSelectedEventoId] = useState<string>(eventos[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_confirmacao');
  const [canalEnvio, setCanalEnvio] = useState<'whatsapp' | 'email' | 'notificacao'>('whatsapp');
  const [customAssunto, setCustomAssunto] = useState('');
  const [customCorpo, setCustomCorpo] = useState('');
  const [filtroDestinatarios, setFiltroDestinatarios] = useState<'todos' | 'confirmados' | 'pendentes' | 'ausentes'>('todos');
  const [historicoDisparos, setHistoricoDisparos] = useState<DisparoComunicacao[]>([]);
  const [selectedInscritoPreview, setSelectedInscritoPreview] = useState<InscricaoItem | null>(null);

  const activeEvento = eventos.find((e) => e.id === selectedEventoId);
  const activeTemplate = TEMPLATES_MENSAGENS_INICIAIS.find((t) => t.id === selectedTemplateId);

  // Initialize template text if empty
  React.useEffect(() => {
    if (activeTemplate) {
      setCustomAssunto(activeTemplate.assunto);
      setCustomCorpo(activeTemplate.corpoTexto);
    }
  }, [selectedTemplateId]);

  // Inscritos elegíveis
  const inscritosDoEvento = inscricoes.filter((i) => i.eventoId === selectedEventoId);
  const destinatarios = inscritosDoEvento.filter((ins) => {
    if (filtroDestinatarios === 'confirmados') return ins.status === 'confirmado';
    if (filtroDestinatarios === 'pendentes') return ins.status === 'pendente' || ins.statusPagamento === 'nao_pago';
    if (filtroDestinatarios === 'ausentes') return !ins.presente;
    return ins.status !== 'cancelado';
  });

  const previewInscrito = selectedInscritoPreview || destinatarios[0] || {
    id: 'preview',
    nome: 'Irmão(ã) Participante',
    telefone: '(11) 98765-4321',
    email: 'membro@igreja.com',
    qrCodeToken: 'EVT-EXEMPLO-1234',
    status: 'confirmado',
    statusPagamento: 'pago',
  } as any;

  // Render text with interpolated tags
  const renderMessageText = (template: string, ins: any) => {
    if (!template) return '';
    return template
      .replace(/{nome}/g, ins.nome || 'Participante')
      .replace(/{evento}/g, activeEvento?.nome || 'Evento')
      .replace(/{data}/g, activeEvento?.dataInicio ? new Date(activeEvento.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data em breve')
      .replace(/{horario}/g, activeEvento?.horario || '19:30')
      .replace(/{local}/g, activeEvento?.local || 'Templo Central')
      .replace(/{valor}/g, activeEvento?.valorInscricao ? `R$ ${activeEvento.valorInscricao.toFixed(2)}` : 'Gratuito')
      .replace(/{codigo_checkin}/g, ins.qrCodeToken || 'TOKEN-QR')
      .replace(/{chave_pix}/g, activeEvento?.chavePix || igrejaPix || 'Pix da Igreja')
      .replace(/{status_pagamento}/g, ins.statusPagamento === 'pago' ? 'Confirmado / Pago' : ins.statusPagamento === 'isento' ? 'Gratuito / Isento' : 'Aguardando Pagamento')
      .replace(/{igreja}/g, igrejaNome);
  };

  const finalMessage = renderMessageText(customCorpo, previewInscrito);
  const finalSubject = renderMessageText(customAssunto, previewInscrito);

  // Send single WhatsApp
  const handleOpenSingleWhatsapp = (ins: InscricaoItem) => {
    const rawTel = (ins.telefone || '').replace(/\D/g, '');
    if (!rawTel) {
      addToast(`O inscrito ${ins.nome} não possui telefone cadastrado!`, 'warning');
      return;
    }
    const fullTel = rawTel.length <= 11 ? `55${rawTel}` : rawTel;
    const msg = renderMessageText(customCorpo, ins);
    const url = `https://api.whatsapp.com/send?phone=${fullTel}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Broadcast dispatch
  const handleExecutarDisparo = () => {
    if (destinatarios.length === 0) {
      addToast('Nenhum destinatário encontrado para este filtro!', 'warning');
      return;
    }

    const novoDisparo: DisparoComunicacao = {
      id: `disp_${Date.now()}`,
      eventoId: selectedEventoId,
      tipoCanal: canalEnvio,
      destinatariosCount: destinatarios.length,
      assunto: finalSubject,
      mensagem: finalMessage.slice(0, 150) + '...',
      enviadoPor: 'Liderança / Secretaria',
      dataEnvio: new Date().toISOString(),
    };

    setHistoricoDisparos([novoDisparo, ...historicoDisparos]);

    if (canalEnvio === 'whatsapp') {
      addToast(`Disparo WhatsApp pronto para ${destinatarios.length} inscritos! Você pode enviar individualmente ou abrir cada conversa.`, 'success');
    } else if (canalEnvio === 'email') {
      addToast(`Disparo de E-mail enviado com sucesso para ${destinatarios.length} inscritos!`, 'success');
    } else {
      addToast(`Notificação interna emitida para ${destinatarios.length} membros no aplicativo!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Central de Comunicação
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Comunicação e Disparador de Mensagens</h2>
            <p className="text-sm text-violet-100 mt-1 max-w-xl">
              Envie instruções, lembretes e QR Codes de confirmação diretamente para os inscritos via WhatsApp, E-mail ou Notificações no app.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-4 text-xs font-medium">
            <div>
              <p className="text-violet-200">Inscritos no Evento:</p>
              <p className="text-lg font-black text-white">{inscritosDoEvento.length}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-violet-200">Destinatários Selecionados:</p>
              <p className="text-lg font-black text-emerald-300">{destinatarios.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Settings Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Select Event and Channel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-violet-600" />
              <span>Configurações do Disparo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Evento</label>
                <select
                  value={selectedEventoId}
                  onChange={(e) => setSelectedEventoId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-violet-500/20"
                >
                  {eventos.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Público-Alvo</label>
                <select
                  value={filtroDestinatarios}
                  onChange={(e) => setFiltroDestinatarios(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="todos">Todos os Inscritos Ativos ({inscritosDoEvento.length})</option>
                  <option value="confirmados">Apenas Confirmados / Pagos</option>
                  <option value="pendentes">Apenas Pendentes de Pagamento</option>
                  <option value="ausentes">Apenas Ausentes (Não fizeram check-in)</option>
                </select>
              </div>
            </div>

            {/* Canal de Envio */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Canal de Envio</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCanalEnvio('whatsapp')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    canalEnvio === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Phone size={20} className={canalEnvio === 'whatsapp' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCanalEnvio('email')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    canalEnvio === 'email'
                      ? 'border-blue-500 bg-blue-50/70 text-blue-800 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mail size={20} className={canalEnvio === 'email' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="text-xs">E-mail</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCanalEnvio('notificacao')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    canalEnvio === 'notificacao'
                      ? 'border-purple-500 bg-purple-50/70 text-purple-800 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles size={20} className={canalEnvio === 'notificacao' ? 'text-purple-600' : 'text-slate-400'} />
                  <span className="text-xs">Notificação App</span>
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Modelos Prontos (Templates)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATES_MENSAGENS_INICIAIS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-violet-600 bg-violet-50 text-violet-800 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block truncate">{tpl.titulo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Editor */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Texto Personalizado da Mensagem</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Tags disponíveis: &#123;nome&#125;, &#123;evento&#125;, &#123;data&#125;, &#123;horario&#125;, &#123;local&#125;, &#123;codigo_checkin&#125;
              </span>
            </h3>

            {canalEnvio === 'email' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assunto do E-mail</label>
                <input
                  type="text"
                  value={customAssunto}
                  onChange={(e) => setCustomAssunto(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Corpo da Mensagem</label>
              <textarea
                rows={9}
                value={customCorpo}
                onChange={(e) => setCustomCorpo(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                {destinatarios.length} destinatários receberão esta mensagem
              </span>

              <button
                type="button"
                onClick={handleExecutarDisparo}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/25 active:scale-95 transition-all"
              >
                <Send size={16} />
                <span>Emitir Disparo em Lote</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="space-y-5">
          {/* Smartphone Simulator Preview */}
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl border border-slate-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-emerald-400" />
                <span className="text-xs font-bold">Pré-visualização do Envio</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">WhatsApp Real</span>
            </div>

            <div className="mt-4 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-slate-100 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {finalMessage}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Simulado para: <strong>{previewInscrito.nome}</strong></span>
              {previewInscrito.telefone && (
                <button
                  type="button"
                  onClick={() => handleOpenSingleWhatsapp(previewInscrito)}
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <ExternalLink size={12} />
                  <span>Testar no WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Individual Dispatch List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Envio Rápido Individual ({destinatarios.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {destinatarios.slice(0, 10).map((ins) => (
                <div
                  key={ins.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">{ins.nome}</p>
                    <p className="text-[10px] text-slate-500">{ins.telefone || ins.email || 'Sem contato'}</p>
                  </div>
                  <button
                    onClick={() => handleOpenSingleWhatsapp(ins)}
                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg shrink-0 transition-colors"
                    title="Enviar no WhatsApp deste participante com 1 clique"
                  >
                    <Send size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
