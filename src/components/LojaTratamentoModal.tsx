import React, { useState } from 'react';
import { 
  Package, User, Phone, MessageCircle, CheckCircle2, Clock, 
  Store, AlertCircle, Printer, X, Check, ShieldCheck, DollarSign,
  ClipboardCheck, Calendar, FileText, ChevronRight
} from 'lucide-react';
import { PedidoLoja, ItemChecklistSeparacao, HistoricoEventoPedido } from '../data/lojaVirtualData';
import { Button } from '../utils/sharedHelpers';

interface LojaTratamentoModalProps {
  order: PedidoLoja;
  onClose: () => void;
  onSaveOrder: (updatedOrder: PedidoLoja, eventTitle: string, eventDesc: string) => Promise<void>;
  churchName?: string;
  churchPhone?: string;
  currentUser?: any;
}

export default function LojaTratamentoModal({
  order,
  onClose,
  onSaveOrder,
  churchName = 'Igreja',
  churchPhone = '',
  currentUser
}: LojaTratamentoModalProps) {
  const [checklist, setChecklist] = useState<{ [productId: string]: boolean }>(() => {
    const map: { [productId: string]: boolean } = {};
    (order.itens || []).forEach(item => {
      const found = order.checklist_separacao?.find(c => c.produto_id === item.produto_id);
      map[item.produto_id] = found ? found.separado : false;
    });
    return map;
  });

  const [statusEntrega, setStatusEntrega] = useState<PedidoLoja['status_entrega']>(order.status_entrega);
  const [statusPagamento, setStatusPagamento] = useState<PedidoLoja['status_pagamento']>(order.status_pagamento);
  const [notasInternas, setNotasInternas] = useState(order.notas_internas || '');
  const [responsavelSeparacao, setResponsavelSeparacao] = useState(order.responsavel_separacao || currentUser?.nome || '');
  const [isSaving, setIsSaving] = useState(false);

  // Separation stats
  const totalItensCount = order.itens?.length || 0;
  const separatedCount = Object.values(checklist).filter(Boolean).length;
  const isAllSeparated = totalItensCount > 0 && separatedCount === totalItensCount;
  const separationPct = totalItensCount > 0 ? Math.round((separatedCount / totalItensCount) * 100) : 0;

  const handleToggleItem = (productId: string) => {
    setChecklist(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCheckAll = () => {
    const nextState = !isAllSeparated;
    const newMap: { [productId: string]: boolean } = {};
    order.itens?.forEach(item => {
      newMap[item.produto_id] = nextState;
    });
    setChecklist(newMap);
  };

  const handleConfirmPayment = async () => {
    setStatusPagamento('pago');
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: PedidoLoja = {
        ...order,
        status_pagamento: 'pago',
        data_pagamento_confirmado: now,
        responsavel_pagamento: currentUser?.nome || 'Operador',
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Pagamento Confirmado',
        `Pagamento de R$ ${order.valor_total.toFixed(2)} confirmado por ${currentUser?.nome || 'Operador'}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceToSeparation = async () => {
    setStatusEntrega('separacao');
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: PedidoLoja = {
        ...order,
        status_entrega: 'separacao',
        responsavel_separacao: responsavelSeparacao || currentUser?.nome || 'Operador',
        data_separacao: now,
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Iniciada Separação dos Itens',
        `Pedido em separação por ${responsavelSeparacao || currentUser?.nome || 'Operador'}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceToReady = async () => {
    setStatusEntrega('pronto_retirada');
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const newChecklist: ItemChecklistSeparacao[] = order.itens.map(item => ({
        produto_id: item.produto_id,
        separado: !!checklist[item.produto_id],
        separado_por: currentUser?.nome || 'Operador',
        separado_em: now
      }));
      const updated: PedidoLoja = {
        ...order,
        status_entrega: 'pronto_retirada',
        checklist_separacao: newChecklist,
        responsavel_separacao: responsavelSeparacao || currentUser?.nome || 'Operador',
        data_pronto_retirada: now,
        notas_internas: notasInternas,
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Pronto para Retirada na Igreja',
        `Separação 100% concluída. Pacote aguardando retirada pelo membro na igreja.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceToDelivered = async () => {
    setStatusEntrega('entregue');
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: PedidoLoja = {
        ...order,
        status_entrega: 'entregue',
        data_entrega: now,
        responsavel_entrega: currentUser?.nome || 'Operador',
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Pedido Entregue ao Comprador',
        `Entrega física realizada com sucesso por ${currentUser?.nome || 'Operador'}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Deseja realmente cancelar este pedido? Os itens serão estornados para o estoque.")) return;
    setStatusEntrega('cancelado');
    setStatusPagamento('cancelado');
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: PedidoLoja = {
        ...order,
        status_entrega: 'cancelado',
        status_pagamento: 'cancelado',
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Pedido Cancelado',
        `Pedido cancelado por ${currentUser?.nome || 'Operador'}. Itens estornados ao estoque.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const newChecklist: ItemChecklistSeparacao[] = order.itens.map(item => ({
        produto_id: item.produto_id,
        separado: !!checklist[item.produto_id],
        separado_por: currentUser?.nome || 'Operador',
        separado_em: checklist[item.produto_id] ? now : undefined
      }));
      const updated: PedidoLoja = {
        ...order,
        status_entrega: statusEntrega,
        status_pagamento: statusPagamento,
        checklist_separacao: newChecklist,
        responsavel_separacao: responsavelSeparacao,
        notas_internas: notasInternas,
        data_atualizacao: now
      };
      await onSaveOrder(
        updated,
        'Atualização Geral de Tratamento',
        `Dados do pedido e checklist salvos por ${currentUser?.nome || 'Operador'}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp notification
  const handleNotifyWhatsApp = (tipo: 'recebido' | 'pago' | 'separado' | 'pronto' | 'entregue') => {
    const phone = (order.cliente_telefone || '').replace(/\D/g, '');
    if (!phone) {
      alert("Telefone do cliente não cadastrado.");
      return;
    }
    let msg = '';
    if (tipo === 'recebido') {
      msg = `Paz do Senhor, ${order.cliente_nome}! Recebemos seu Pedido #${order.numero_pedido} na Loja da Igreja (${churchName}). Estamos conferindo os itens e o pagamento. Em breve daremos novas atualizações!`;
    } else if (tipo === 'pago') {
      msg = `Paz do Senhor, ${order.cliente_nome}! O pagamento do seu Pedido #${order.numero_pedido} no valor de R$ ${order.valor_total.toFixed(2)} foi CONFIRMADO com sucesso! Seus produtos já foram encaminhados para a separação.`;
    } else if (tipo === 'separado') {
      msg = `Olá, ${order.cliente_nome}! Os itens do seu Pedido #${order.numero_pedido} acabaram de ser separados e embalados pela equipe da igreja.`;
    } else if (tipo === 'pronto') {
      msg = `Paz do Senhor, ${order.cliente_nome}! 🎉 SEU PEDIDO #${order.numero_pedido} ESTÁ PRONTO PARA RETIRADA na igreja!\nLocal: ${order.local_retirada}.\nVocê já pode passar para retirar com a nossa equipe. Deus abençoe!`;
    } else {
      msg = `Paz do Senhor, ${order.cliente_nome}! Confirmamos que seu Pedido #${order.numero_pedido} foi entregue. Muito obrigado por apoiar o ministério da igreja!`;
    }
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const printSeparationSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha de Separação - Pedido #${order.numero_pedido}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #111; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .badge { display: inline-block; padding: 4px 8px; font-weight: bold; font-size: 12px; background: #eee; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f2f2f2; }
            .box { width: 18px; height: 18px; border: 2px solid #000; display: inline-block; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
            .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${churchName} - GUIA DE SEPARAÇÃO & ENTREGA</h2>
            <p><strong>Pedido:</strong> #${order.numero_pedido} | <strong>Data:</strong> ${new Date(order.data_pedido).toLocaleString('pt-BR')}</p>
            <p><strong>Comprador:</strong> ${order.cliente_nome} | <strong>WhatsApp:</strong> ${order.cliente_telefone}</p>
            <p><strong>Local de Retirada:</strong> ${order.local_retirada}</p>
            <p><strong>Status Pagamento:</strong> ${order.status_pagamento.toUpperCase()} | <strong>Valor Total:</strong> R$ ${order.valor_total.toFixed(2)}</p>
            ${order.observacoes ? `<p><strong>Obs do Membro:</strong> ${order.observacoes}</p>` : ''}
          </div>

          <h3>ITENS PARA CONFERÊNCIA FÍSICA NO ESTOQUE:</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">Conf.</th>
                <th>Item / Descrição</th>
                <th style="width: 60px;">Qtd.</th>
                <th style="width: 100px;">Valor Unit.</th>
                <th style="width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.itens.map(i => `
                <tr>
                  <td style="text-align: center;"><div class="box"></div></td>
                  <td><strong>${i.nome}</strong></td>
                  <td style="text-align: center; font-weight: bold;">${i.quantidade}x</td>
                  <td>R$ ${i.preco_unitario.toFixed(2)}</td>
                  <td>R$ ${i.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${notasInternas ? `<p style="margin-top: 15px;"><strong>Local do Pacote / Obs da Separação:</strong> ${notasInternas}</p>` : ''}

          <div class="footer" style="margin-top: 50px;">
            <div class="sig-line">Separado por (Responsável)</div>
            <div class="sig-line">Recebido por (Membro/Comprador)</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* TOPO / HEADER */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <Package size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Tratamento do Pedido #{order.numero_pedido}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  statusEntrega === 'entregue' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                  statusEntrega === 'pronto_retirada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                  statusEntrega === 'separacao' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                  statusEntrega === 'cancelado' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                }`}>
                  {statusEntrega === 'entregue' ? '✅ Entregue' :
                   statusEntrega === 'pronto_retirada' ? '📦 Pronto p/ Retirada' :
                   statusEntrega === 'separacao' ? '⏳ Em Separação' :
                   statusEntrega === 'cancelado' ? '❌ Cancelado' : '📥 Recebido / Novo'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Recebido do Portal de Membros em {new Date(order.data_pedido).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printSeparationSlip}
              title="Imprimir Guia de Separação / Comprovante"
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* STEPPER VISUAL DA ESTEIRA */}
        <div className="px-6 py-4 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center justify-between text-xs">
            {/* Etapa 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                statusEntrega !== 'cancelado' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                1
              </div>
              <span className="font-bold text-[11px] mt-1 text-slate-700 dark:text-slate-300">Recebido</span>
            </div>

            <div className={`h-1 flex-1 ${statusPagamento === 'pago' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

            {/* Etapa 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                statusPagamento === 'pago' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                2
              </div>
              <span className="font-bold text-[11px] mt-1 text-slate-700 dark:text-slate-300">Pagamento Ok</span>
            </div>

            <div className={`h-1 flex-1 ${statusEntrega === 'separacao' || statusEntrega === 'pronto_retirada' || statusEntrega === 'entregue' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

            {/* Etapa 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                statusEntrega === 'separacao' || statusEntrega === 'pronto_retirada' || statusEntrega === 'entregue' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                3
              </div>
              <span className="font-bold text-[11px] mt-1 text-slate-700 dark:text-slate-300">Separação</span>
            </div>

            <div className={`h-1 flex-1 ${statusEntrega === 'pronto_retirada' || statusEntrega === 'entregue' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

            {/* Etapa 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                statusEntrega === 'pronto_retirada' || statusEntrega === 'entregue' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                4
              </div>
              <span className="font-bold text-[11px] mt-1 text-slate-700 dark:text-slate-300">Pronto Retirada</span>
            </div>

            <div className={`h-1 flex-1 ${statusEntrega === 'entregue' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

            {/* Etapa 5 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                statusEntrega === 'entregue' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                5
              </div>
              <span className="font-bold text-[11px] mt-1 text-slate-700 dark:text-slate-300">Entregue</span>
            </div>
          </div>
        </div>

        {/* CORPO PRINCIPAL COM SCROLL */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* SEÇÃO 1: COMPRADOR E PAGAMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Comprador */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-indigo-600" /> Dados do Comprador
                </h4>
                <button
                  type="button"
                  onClick={() => handleNotifyWhatsApp('recebido')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                >
                  <MessageCircle size={13} /> WhatsApp
                </button>
              </div>

              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[11px] block">Nome do Membro:</span>
                  <strong className="text-slate-800 dark:text-white text-sm">{order.cliente_nome}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">WhatsApp / Telefone:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{order.cliente_telefone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tipo:</span>
                    <span className="font-bold uppercase text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {order.tipo_cliente}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Local Escolhido para Retirada:</span>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Store size={14} className="text-amber-600 shrink-0" />
                    <span>{order.local_retirada}</span>
                  </div>
                </div>
                {order.observacoes && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 italic">
                    <strong>Obs do Membro:</strong> "{order.observacoes}"
                  </div>
                )}
              </div>
            </div>

            {/* Card Pagamento */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600" /> Conferência de Pagamento
                </h4>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  statusPagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {statusPagamento === 'pago' ? 'Confirmado / Pago' : 'Pendente de Conferência'}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Valor Total do Pedido:</span>
                  <strong className="text-xl font-black font-mono text-emerald-600">
                    R$ {order.valor_total.toFixed(2)}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Forma Escolhida:</span>
                  <strong className="uppercase bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                    {order.forma_pagamento === 'pix' ? '💠 Pix' :
                     order.forma_pagamento === 'cartao_retirada' ? '💳 Cartão na Retirada' : '💵 Dinheiro na Retirada'}
                  </strong>
                </div>

                {order.data_pagamento_confirmado && (
                  <div className="text-[11px] text-slate-500">
                    Confirmado em {new Date(order.data_pagamento_confirmado).toLocaleString('pt-BR')} por {order.responsavel_pagamento || 'Operador'}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {statusPagamento !== 'pago' ? (
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isSaving}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Check size={14} /> Confirmar Pagamento (Pago)
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={16} /> Pagamento 100% OK
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNotifyWhatsApp('pago')}
                        className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                      >
                        Enviar Recibo no WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: CHECKLIST DE SEPARAÇÃO FÍSICA DOS ITENS */}
          <div className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-indigo-600" />
                  Separação Física & Montagem do Pacote
                </h4>
                <p className="text-xs text-slate-400">
                  Marque cada produto após conferir e embalar fisicamente.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {separatedCount} de {totalItensCount} itens separados ({separationPct}%)
                </span>
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 underline cursor-pointer"
                >
                  {isAllSeparated ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isAllSeparated ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: `${separationPct}%` }}
              />
            </div>

            {/* Lista de Itens com Checkbox */}
            <div className="space-y-2.5">
              {order.itens?.map((item) => {
                const isItemSeparated = !!checklist[item.produto_id];

                return (
                  <div
                    key={item.produto_id}
                    onClick={() => handleToggleItem(item.produto_id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isItemSeparated
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isItemSeparated
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 border-slate-300 text-transparent'
                      }`}>
                        <Check size={14} />
                      </div>

                      {item.foto && (
                        <img 
                          src={item.foto} 
                          alt={item.nome} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                        />
                      )}

                      <div>
                        <h5 className={`text-xs font-bold ${isItemSeparated ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                          {item.nome}
                        </h5>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.quantidade}x un. • R$ {item.preco_unitario.toFixed(2)} cada
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <strong className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                        R$ {item.subtotal.toFixed(2)}
                      </strong>
                      <span className={`block text-[10px] font-bold ${isItemSeparated ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isItemSeparated ? 'Item Separado ✓' : 'Aguardando Separação'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Informações da Separação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Responsável pela Separação:
                </label>
                <input
                  type="text"
                  value={responsavelSeparacao}
                  onChange={e => setResponsavelSeparacao(e.target.value)}
                  placeholder="Nome do irmão/secretário que separou"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Localização do Pacote / Observações Internas:
                </label>
                <input
                  type="text"
                  value={notasInternas}
                  onChange={e => setNotasInternas(e.target.value)}
                  placeholder="Ex: Sacola #12 na estante da secretaria"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Ações da Separação */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {statusEntrega === 'novo' && (
                <button
                  type="button"
                  onClick={handleAdvanceToSeparation}
                  disabled={isSaving}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock size={14} /> Iniciar Separação
                </button>
              )}

              {statusEntrega !== 'pronto_retirada' && statusEntrega !== 'entregue' && (
                <button
                  type="button"
                  onClick={handleAdvanceToReady}
                  disabled={isSaving}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Store size={14} /> Concluir Separação & Pronto para Retirada
                </button>
              )}

              {statusEntrega === 'pronto_retirada' && (
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleNotifyWhatsApp('pronto')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <MessageCircle size={14} /> Avisar Membro no WhatsApp que está Pronto
                  </button>

                  <button
                    type="button"
                    onClick={handleAdvanceToDelivered}
                    disabled={isSaving}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                  >
                    <CheckCircle2 size={14} /> Confirmar Entrega ao Membro
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO 3: LINHA DO TEMPO / HISTÓRICO DE AUDITORIA */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} /> Histórico de Andamento & Auditoria
            </h4>

            <div className="space-y-2">
              {order.historico_status && order.historico_status.length > 0 ? (
                order.historico_status.map((ev, i) => (
                  <div key={ev.id || i} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-slate-800 dark:text-white block">{ev.titulo}</strong>
                      <span className="text-slate-500 text-[11px]">{ev.descricao}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(ev.data).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  Pedido registrado no portal em {new Date(order.data_pedido).toLocaleString('pt-BR')}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={isSaving || statusEntrega === 'cancelado'}
            className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar Pedido & Estornar Estoque
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-xl cursor-pointer"
            >
              Fechar
            </button>
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
