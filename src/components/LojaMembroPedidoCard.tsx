import React, { useState } from 'react';
import { 
  PedidoLoja, HistoricoEventoPedido 
} from '../data/lojaVirtualData';
import { 
  CheckCircle2, Clock, Package, ShoppingBag, Store, MapPin, 
  MessageCircle, Printer, ChevronDown, ChevronUp, Bell, 
  AlertCircle, Check, Sparkles, XCircle, ArrowRight, FileText, Download
} from 'lucide-react';

interface LojaMembroPedidoCardProps {
  key?: React.Key;
  pedido: PedidoLoja;
  onViewReceipt: (p: PedidoLoja) => void;
  onViewFiscalDoc?: (p: PedidoLoja, tipo: 'nota_fiscal' | 'pedido_compra') => void;
  onWhatsApp: (p: PedidoLoja) => void;
  onCancelOrder?: (p: PedidoLoja) => void;
  churchName: string;
}

export default function LojaMembroPedidoCard({
  pedido,
  onViewReceipt,
  onViewFiscalDoc,
  onWhatsApp,
  onCancelOrder,
  churchName
}: LojaMembroPedidoCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // Determine active step index (0 to 4)
  const isCancelled = pedido.status_entrega === 'cancelado';
  let currentStep = 0;

  if (pedido.status_entrega === 'entregue') {
    currentStep = 4;
  } else if (pedido.status_entrega === 'pronto_retirada') {
    currentStep = 3;
  } else if (pedido.status_entrega === 'separacao') {
    currentStep = 2;
  } else if (pedido.status_pagamento === 'pago') {
    currentStep = 1;
  } else {
    currentStep = 0;
  }

  const steps = [
    { label: 'Recebido', desc: 'Aguardando validação' },
    { label: 'Pagamento', desc: 'Confirmado na igreja' },
    { label: 'Em Separação', desc: 'Separando produtos' },
    { label: 'Pronto Retirada', desc: 'Disponível no templo' },
    { label: 'Entregue', desc: 'Concluído' },
  ];

  return (
    <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
      pedido.status_entrega === 'pronto_retirada'
        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-sm'
        : pedido.status_entrega === 'entregue'
        ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40'
        : isCancelled
        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/40'
        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
    }`}>
      {/* CABEÇALHO DO PEDIDO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-sm text-slate-800 dark:text-white">
              Pedido #{pedido.numero_pedido}
            </span>

            {/* BADGE DE STATUS DE ENTREGA */}
            {pedido.status_entrega === 'pronto_retirada' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                <Sparkles size={11} /> Pronto para Retirada
              </span>
            )}
            {pedido.status_entrega === 'separacao' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 flex items-center gap-1">
                <Package size={11} /> Em Separação
              </span>
            )}
            {pedido.status_entrega === 'novo' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                <Clock size={11} /> Recebido
              </span>
            )}
            {pedido.status_entrega === 'entregue' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} /> Entregue
              </span>
            )}
            {pedido.status_entrega === 'cancelado' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 flex items-center gap-1">
                <XCircle size={11} /> Cancelado
              </span>
            )}

            {/* BADGE DE STATUS DE PAGAMENTO */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
              pedido.status_pagamento === 'pago'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
            }`}>
              {pedido.status_pagamento === 'pago' ? '💳 Pago' : '⏳ Pagamento Pendente'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-1">
            Realizado em {new Date(pedido.data_pedido).toLocaleDateString('pt-BR', { 
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })} • Forma: <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">{pedido.forma_pagamento.replace('_', ' ')}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total do Pedido</span>
            <span className="text-lg font-black font-mono text-emerald-600">
              R$ {pedido.valor_total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ESTEIRA VISUAL DE 5 ETAPAS (PROGRESS STEPPER) */}
      {!isCancelled ? (
        <div className="my-4 pt-1">
          <div className="grid grid-cols-5 gap-1 md:gap-2">
            {steps.map((st, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isFuture = idx > currentStep;

              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-full flex items-center mb-1.5">
                    {/* Linha esquerda */}
                    <div className={`flex-1 h-1 rounded-full ${
                      idx === 0 ? 'invisible' : (idx <= currentStep ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700')
                    }`} />
                    
                    {/* Círculo indicador */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 scale-110'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </div>

                    {/* Linha direita */}
                    <div className={`flex-1 h-1 rounded-full ${
                      idx === steps.length - 1 ? 'invisible' : (idx < currentStep ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700')
                    }`} />
                  </div>

                  <span className={`text-[10px] font-bold truncate max-w-full ${
                    isCurrent ? 'text-amber-700 dark:text-amber-400 font-black' : isPast ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                  }`}>
                    {st.label}
                  </span>
                  <span className="hidden md:block text-[9px] text-slate-400 mt-0.5 truncate max-w-full">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="my-3 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>Este pedido foi cancelado e não poderá ser retirado.</span>
        </div>
      )}

      {/* BANNER DE ORIENTAÇÃO AO MEMBRO CONFORME STATUS */}
      {pedido.status_entrega === 'pronto_retirada' && (
        <div className="my-3 p-3.5 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 dark:from-amber-950/40 dark:to-emerald-950/40 rounded-xl border border-amber-300 dark:border-amber-700/70 flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0 mt-0.5">
            <Store size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              🎉 Seu pedido está pronto para ser retirado na Igreja!
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Local indicado: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{pedido.local_retirada}</strong>.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Basta se dirigir à secretaria ou balcão da igreja e informar seu nome (<span className="font-semibold text-slate-700 dark:text-slate-300">{pedido.cliente_nome}</span>) ou o número <strong className="font-mono">#{pedido.numero_pedido}</strong>.
            </p>
          </div>
        </div>
      )}

      {pedido.status_entrega === 'separacao' && (
        <div className="my-3 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-2.5">
          <Package size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-bold">A equipe da igreja já está separando seus produtos!</span>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
              Assim que o pacote estiver conferido e pronto no balcão da igreja, você receberá a confirmação aqui.
            </p>
          </div>
        </div>
      )}

      {pedido.status_entrega === 'novo' && (
        <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-start gap-2.5">
          <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold">Pedido recebido com sucesso!</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Estamos conferindo os dados. Local de retirada registrado: <strong>{pedido.local_retirada}</strong>.
            </p>
          </div>
        </div>
      )}

      {pedido.status_entrega === 'entregue' && (
        <div className="my-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200">
            <span className="font-bold">Pedido entregue e concluído!</span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
              Obrigado por adquirir na loja da igreja e contribuir com as atividades locais.
            </p>
          </div>
        </div>
      )}

      {/* ITENS DA COMPRA (EXPANSÍVEL) */}
      <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowItems(!showItems)}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={14} className="text-amber-600" />
            <span>{pedido.itens.length} {pedido.itens.length === 1 ? 'produto comprado' : 'produtos comprados'}</span>
            {showItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Bell size={13} />
            <span>Notificações & Andamento ({(pedido.historico_status || []).length})</span>
            {showTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* LISTA DE ITENS EXPANDIDA */}
        {showItems && (
          <div className="mt-2.5 space-y-2">
            {pedido.itens.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.foto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                    alt={item.nome}
                    className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-white block">{item.nome}</strong>
                    <span className="text-[11px] text-slate-400">
                      {item.quantidade}x de R$ {item.preco_unitario.toFixed(2)}
                    </span>
                  </div>
                </div>
                <strong className="font-mono text-emerald-600 font-bold">
                  R$ {item.subtotal.toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        )}

        {/* LINHA DO TEMPO & NOTIFICAÇÕES EXPANDIDA */}
        {showTimeline && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-3">
            <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock size={12} /> Linha do Tempo de Atualizações
            </h5>

            {(!pedido.historico_status || pedido.historico_status.length === 0) ? (
              <p className="text-xs text-slate-400 italic">Pedido criado. Nenhuma atualização recente registrada.</p>
            ) : (
              <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {pedido.historico_status.map((evento) => (
                  <div key={evento.id} className="relative text-xs">
                    {/* Ponto na linha */}
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                    
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-800 dark:text-white font-bold">{evento.titulo}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evento.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {evento.descricao && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{evento.descricao}</p>
                    )}
                    {evento.responsavel && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Por: {evento.responsavel}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2 flex-wrap">
        {onCancelOrder && pedido.status_entrega !== 'cancelado' && pedido.status_entrega !== 'entregue' && (
          <button
            type="button"
            onClick={() => onCancelOrder(pedido)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer"
            title="Cancelar este pedido e devolver itens ao estoque"
          >
            <XCircle size={14} /> Cancelar Pedido
          </button>
        )}

        <button
          onClick={() => onWhatsApp(pedido)}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer"
          title="Falar com a equipe da igreja no WhatsApp"
        >
          <MessageCircle size={14} /> WhatsApp
        </button>

        <button
          type="button"
          onClick={() => onViewFiscalDoc ? onViewFiscalDoc(pedido, 'pedido_compra') : onViewReceipt(pedido)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Imprimir ou visualizar o Pedido de Compra Oficial"
        >
          <Printer size={14} className="text-slate-600 dark:text-slate-300" />
          <span>Pedido de Compra</span>
        </button>

        {pedido.status_pagamento === 'pago' && (
          <button
            type="button"
            onClick={() => onViewFiscalDoc ? onViewFiscalDoc(pedido, 'nota_fiscal') : onViewReceipt(pedido)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Visualizar e emitir a Nota Fiscal / Recibo Quitado"
          >
            <FileText size={14} />
            <span>Nota Fiscal (DAV)</span>
          </button>
        )}
      </div>
    </div>
  );
}
