import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Filter, CheckCircle2, Clock, Store, 
  DollarSign, MessageCircle, Eye, Printer, ChevronRight,
  ClipboardCheck, User, Phone, Check, AlertCircle, RefreshCw,
  Trash2, XCircle
} from 'lucide-react';
import { PedidoLoja } from '../data/lojaVirtualData';

interface LojaRecebimentoAreaProps {
  pedidos: PedidoLoja[];
  onOpenTratamento: (pedido: PedidoLoja) => void;
  onQuickUpdateStatus: (pedidoId: string, statusEntrega?: PedidoLoja['status_entrega'], statusPagamento?: PedidoLoja['status_pagamento']) => void;
  onCancelOrder?: (pedido: PedidoLoja) => void;
  onDeleteOrder?: (pedido: PedidoLoja) => void;
  churchName?: string;
}

export default function LojaRecebimentoArea({
  pedidos,
  onOpenTratamento,
  onQuickUpdateStatus,
  onCancelOrder,
  onDeleteOrder,
  churchName = 'Igreja'
}: LojaRecebimentoAreaProps) {
  const [stageFilter, setStageFilter] = useState<'todos_abertos' | 'novo' | 'pago' | 'separacao' | 'pronto_retirada' | 'entregue' | 'cancelado'>('todos_abertos');
  const [searchTerm, setSearchTerm] = useState('');

  // Counts by stage
  const counts = useMemo(() => {
    const novos = pedidos.filter(p => p.status_entrega === 'novo' && p.status_pagamento !== 'pago').length;
    const pagos = pedidos.filter(p => p.status_pagamento === 'pago' && (p.status_entrega === 'novo')).length;
    const separacao = pedidos.filter(p => p.status_entrega === 'separacao').length;
    const prontos = pedidos.filter(p => p.status_entrega === 'pronto_retirada').length;
    const entregues = pedidos.filter(p => p.status_entrega === 'entregue').length;
    const cancelados = pedidos.filter(p => p.status_entrega === 'cancelado').length;
    const abertos = pedidos.filter(p => p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado').length;

    return { novos, pagos, separacao, prontos, entregues, cancelados, abertos };
  }, [pedidos]);

  // Filtered orders
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => {
      const matchSearch = (p.numero_pedido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_telefone || '').includes(searchTerm);
      
      let matchStage = true;
      if (stageFilter === 'todos_abertos') {
        matchStage = p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado';
      } else if (stageFilter === 'novo') {
        matchStage = p.status_entrega === 'novo' && p.status_pagamento !== 'pago';
      } else if (stageFilter === 'pago') {
        matchStage = p.status_pagamento === 'pago' && p.status_entrega === 'novo';
      } else if (stageFilter === 'separacao') {
        matchStage = p.status_entrega === 'separacao';
      } else if (stageFilter === 'pronto_retirada') {
        matchStage = p.status_entrega === 'pronto_retirada';
      } else if (stageFilter === 'entregue') {
        matchStage = p.status_entrega === 'entregue';
      } else if (stageFilter === 'cancelado') {
        matchStage = p.status_entrega === 'cancelado';
      }

      return matchSearch && matchStage;
    });
  }, [pedidos, searchTerm, stageFilter]);

  const handleWhatsApp = (p: PedidoLoja) => {
    const phone = (p.cliente_telefone || '').replace(/\D/g, '');
    if (!phone) return;
    const msg = encodeURIComponent(
      `Paz do Senhor, ${p.cliente_nome}! Referente ao seu Pedido #${p.numero_pedido} na Loja da Igreja (${churchName}):\n` +
      `Status atual: ${p.status_entrega === 'pronto_retirada' ? 'PRONTO PARA RETIRADA NO TEMPLO! 📦' : p.status_entrega.toUpperCase()}\n` +
      `Valor: R$ ${p.valor_total.toFixed(2)} (${p.status_pagamento === 'pago' ? 'PAGO' : 'PAGAMENTO PENDENTE'}).\n` +
      `Local de Retirada: ${p.local_retirada}.`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* ESTEIRA DE STATUS EM CARDS INTERATIVOS (PIPELINE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          type="button"
          onClick={() => setStageFilter('todos_abertos')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'todos_abertos'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'todos_abertos' ? 'text-indigo-200' : 'text-slate-400'}`}>
            Em Aberto
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.abertos}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'todos_abertos' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Todos em andamento
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageFilter('novo')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'novo'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'novo' ? 'text-purple-200' : 'text-slate-400'}`}>
            1. Novos Recebidos
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.novos}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'novo' ? 'text-purple-100' : 'text-slate-400'}`}>
            Aguardando análise
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageFilter('pago')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'pago'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'pago' ? 'text-emerald-200' : 'text-slate-400'}`}>
            2. Pagos / A Separar
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.pagos}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'pago' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Pagamento aprovado
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageFilter('separacao')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'separacao'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'separacao' ? 'text-amber-200' : 'text-slate-400'}`}>
            3. Em Separação
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.separacao}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'separacao' ? 'text-amber-100' : 'text-slate-400'}`}>
            Montando pacotes
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageFilter('pronto_retirada')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'pronto_retirada'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'pronto_retirada' ? 'text-blue-200' : 'text-slate-400'}`}>
            4. Prontos p/ Retirada
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.prontos}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'pronto_retirada' ? 'text-blue-100' : 'text-slate-400'}`}>
            Aguardando membro
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageFilter('entregue')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            stageFilter === 'entregue'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-wider block ${stageFilter === 'entregue' ? 'text-teal-200' : 'text-slate-400'}`}>
            5. Entregues
          </span>
          <h4 className="text-xl font-black mt-0.5">{counts.entregues}</h4>
          <span className={`text-[10px] font-medium block ${stageFilter === 'entregue' ? 'text-teal-100' : 'text-slate-400'}`}>
            Concluídos com sucesso
          </span>
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filtrar por número do pedido, nome do membro ou WhatsApp..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* LISTAGEM DE PEDIDOS DA ESTEIRA */}
      <div className="space-y-3">
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p className="font-bold text-xs">Nenhum pedido encontrado nesta etapa da esteira.</p>
          </div>
        ) : (
          pedidosFiltrados.map((ped) => {
            const totalItens = (ped.itens || []).reduce((acc, item) => acc + item.quantidade, 0);
            const checklistCount = ped.checklist_separacao ? ped.checklist_separacao.filter(c => c.separado).length : 0;
            const totalItensTypes = ped.itens?.length || 0;
            const isSeparationComplete = totalItensTypes > 0 && checklistCount === totalItensTypes;

            return (
              <div
                key={ped.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* LADO ESQUERDO: INFO DO PEDIDO */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-800 dark:text-white">
                      #{ped.numero_pedido}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(ped.data_pedido).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* BADGE DE STATUS DA ENTREGA */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ped.status_entrega === 'entregue' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      ped.status_entrega === 'pronto_retirada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                      ped.status_entrega === 'separacao' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                      ped.status_entrega === 'cancelado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                    }`}>
                      {ped.status_entrega === 'entregue' ? '✅ Entregue' :
                       ped.status_entrega === 'pronto_retirada' ? '📦 Pronto p/ Retirada' :
                       ped.status_entrega === 'separacao' ? '⏳ Em Separação' :
                       ped.status_entrega === 'cancelado' ? '❌ Cancelado' : '📥 Recebido / Novo'}
                    </span>

                    {/* BADGE DE PAGAMENTO */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ped.status_pagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ped.status_pagamento === 'pago' ? '💳 Pago' : '⏳ Pagamento Pendente'}
                    </span>
                  </div>

                  {/* DADOS DO COMPRADOR */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <User size={12} className="text-indigo-600" /> {ped.cliente_nome}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone size={11} /> {ped.cliente_telefone}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                      <Store size={12} /> {ped.local_retirada}
                    </span>
                  </div>

                  {/* ITENS RESUMIDOS */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    {ped.itens?.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 shrink-0">
                        {item.quantidade}x {item.nome}
                      </span>
                    ))}
                    {ped.itens?.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{ped.itens.length - 4} outros
                      </span>
                    )}
                  </div>
                </div>

                {/* LADO DIREITO: VALOR E BOTÕES DE AÇÃO OPERACIONAL */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total do Pedido</span>
                    <strong className="text-lg font-black font-mono text-emerald-600">
                      R$ {ped.valor_total.toFixed(2)}
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Botão Rápido Contextual de Avanço de Etapa */}
                    {ped.status_pagamento !== 'pago' && ped.status_entrega !== 'cancelado' && (
                      <button
                        type="button"
                        onClick={() => onQuickUpdateStatus(ped.id, undefined, 'pago')}
                        title="Confirmar que o pagamento foi recebido"
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <DollarSign size={13} /> Confirmar Pagto
                      </button>
                    )}

                    {ped.status_pagamento === 'pago' && ped.status_entrega === 'novo' && (
                      <button
                        type="button"
                        onClick={() => onQuickUpdateStatus(ped.id, 'separacao')}
                        title="Iniciar separação física dos produtos"
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Package size={13} /> Iniciar Separação
                      </button>
                    )}

                    {ped.status_entrega === 'separacao' && (
                      <button
                        type="button"
                        onClick={() => onQuickUpdateStatus(ped.id, 'pronto_retirada')}
                        title="Marcar como pronto para retirada pelo membro"
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Pronto p/ Retirada
                      </button>
                    )}

                    {ped.status_entrega === 'pronto_retirada' && (
                      <button
                        type="button"
                        onClick={() => onQuickUpdateStatus(ped.id, 'entregue')}
                        title="Confirmar entrega do pedido ao membro"
                        className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={13} /> Concluir Entrega
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleWhatsApp(ped)}
                      title="Avisar no WhatsApp"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all border border-emerald-200 cursor-pointer"
                    >
                      <MessageCircle size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenTratamento(ped)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardCheck size={15} /> Tratar Pedido
                    </button>

                    {onCancelOrder && ped.status_entrega !== 'cancelado' && (
                      <button
                        type="button"
                        onClick={() => onCancelOrder(ped)}
                        title="Cancelar Pedido & Estornar Estoque"
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all border border-amber-200 cursor-pointer"
                      >
                        <XCircle size={16} />
                      </button>
                    )}

                    {onDeleteOrder && (
                      <button
                        type="button"
                        onClick={() => onDeleteOrder(ped)}
                        title="Excluir Pedido Definitivamente (Motor de Exclusão)"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
