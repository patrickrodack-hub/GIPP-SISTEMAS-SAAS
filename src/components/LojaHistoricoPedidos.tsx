import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Filter, CheckCircle2, Clock, 
  Store, DollarSign, Printer, Eye, Calendar, User, Phone, XCircle
} from 'lucide-react';
import { PedidoLoja } from '../data/lojaVirtualData';

interface LojaHistoricoPedidosProps {
  pedidos: PedidoLoja[];
  onOpenTratamento: (pedido: PedidoLoja) => void;
  churchName?: string;
}

export default function LojaHistoricoPedidos({
  pedidos,
  onOpenTratamento,
  churchName = 'Igreja'
}: LojaHistoricoPedidosProps) {
  const [activeSubFilter, setActiveSubFilter] = useState<'todos' | 'em_aberto' | 'concluidos' | 'cancelados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'mes' | 'ano'>('todos');

  // Metrics
  const metricasHistorico = useMemo(() => {
    const totalRecebidos = pedidos.length;
    const emAberto = pedidos.filter(p => p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado');
    const concluidos = pedidos.filter(p => p.status_entrega === 'entregue');
    const cancelados = pedidos.filter(p => p.status_entrega === 'cancelado');

    const totalFaturadoConcluido = concluidos
      .filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + p.valor_total, 0);

    const totalEmAbertoValor = emAberto
      .reduce((acc, p) => acc + p.valor_total, 0);

    return {
      totalRecebidos,
      totalEmAberto: emAberto.length,
      totalConcluidos: concluidos.length,
      totalCancelados: cancelados.length,
      totalFaturadoConcluido,
      totalEmAbertoValor
    };
  }, [pedidos]);

  // Filtered orders
  const pedidosFiltrados = useMemo(() => {
    const now = new Date();

    return pedidos.filter(p => {
      const matchSearch = (p.numero_pedido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cliente_telefone || '').includes(searchTerm);

      let matchSub = true;
      if (activeSubFilter === 'em_aberto') {
        matchSub = p.status_entrega !== 'entregue' && p.status_entrega !== 'cancelado';
      } else if (activeSubFilter === 'concluidos') {
        matchSub = p.status_entrega === 'entregue';
      } else if (activeSubFilter === 'cancelados') {
        matchSub = p.status_entrega === 'cancelado';
      }

      let matchDate = true;
      if (dateFilter !== 'todos' && p.data_pedido) {
        const pedDate = new Date(p.data_pedido);
        if (dateFilter === 'hoje') {
          matchDate = pedDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'mes') {
          matchDate = pedDate.getMonth() === now.getMonth() && pedDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'ano') {
          matchDate = pedDate.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchSub && matchDate;
    });
  }, [pedidos, searchTerm, activeSubFilter, dateFilter]);

  const handlePrintHistory = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 4 CARDS RESUMO DO HISTÓRICO CONFORME SOLICITADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveSubFilter('todos')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubFilter === 'todos' 
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recebidos</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {metricasHistorico.totalRecebidos}
              </h3>
              <span className="text-[10px] text-slate-400">Todos os pedidos gerados</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveSubFilter('em_aberto')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubFilter === 'em_aberto' 
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pedidos em Aberto</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">
                {metricasHistorico.totalEmAberto}
              </h3>
              <span className="text-[10px] text-slate-400">Total: R$ {metricasHistorico.totalEmAbertoValor.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveSubFilter('concluidos')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubFilter === 'concluidos' 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Concluídos</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {metricasHistorico.totalConcluidos}
              </h3>
              <span className="text-[10px] text-slate-400">Faturado: R$ {metricasHistorico.totalFaturadoConcluido.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveSubFilter('cancelados')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubFilter === 'cancelados' 
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Cancelados</p>
              <h3 className="text-2xl font-black text-rose-500 mt-1">
                {metricasHistorico.totalCancelados}
              </h3>
              <span className="text-[10px] text-slate-400">Itens estornados ao estoque</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
              <XCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar no histórico por número, membro ou telefone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={activeSubFilter}
            onChange={e => setActiveSubFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="todos">Todos os Pedidos ({metricasHistorico.totalRecebidos})</option>
            <option value="em_aberto">Pedidos em Aberto ({metricasHistorico.totalEmAberto})</option>
            <option value="concluidos">Pedidos Concluídos ({metricasHistorico.totalConcluidos})</option>
            <option value="cancelados">Pedidos Cancelados ({metricasHistorico.totalCancelados})</option>
          </select>

          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="todos">Todo o Período</option>
            <option value="hoje">Apenas Hoje</option>
            <option value="mes">Este Mês</option>
            <option value="ano">Este Ano</option>
          </select>

          <button
            onClick={handlePrintHistory}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer size={14} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* TABELA DETALHADA DO HISTÓRICO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Pedido / Data</th>
                <th className="py-3.5 px-4">Comprador</th>
                <th className="py-3.5 px-4">Itens</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4">Pagamento</th>
                <th className="py-3.5 px-4">Status Atual</th>
                <th className="py-3.5 px-4">Retirada / Entrega</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    Nenhum pedido localizado no histórico com os filtros atuais.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((ped) => {
                  const totalItens = (ped.itens || []).reduce((acc, i) => acc + i.quantidade, 0);

                  return (
                    <tr key={ped.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-white block">
                          #{ped.numero_pedido}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ped.data_pedido).toLocaleDateString('pt-BR')} às {new Date(ped.data_pedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-white block">
                          {ped.cliente_nome}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ped.cliente_telefone}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-[11px]">
                          {totalItens} un.
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {ped.valor_total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ped.status_pagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ped.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ped.status_entrega === 'entregue' ? 'bg-emerald-100 text-emerald-800' :
                          ped.status_entrega === 'pronto_retirada' ? 'bg-blue-100 text-blue-800' :
                          ped.status_entrega === 'separacao' ? 'bg-amber-100 text-amber-800' :
                          ped.status_entrega === 'cancelado' ? 'bg-rose-100 text-rose-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {ped.status_entrega === 'entregue' ? 'Entregue' :
                           ped.status_entrega === 'pronto_retirada' ? 'Pronto Retirada' :
                           ped.status_entrega === 'separacao' ? 'Em Separação' :
                           ped.status_entrega === 'cancelado' ? 'Cancelado' : 'Recebido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                        {ped.local_retirada}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenTratamento(ped)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-lg transition-colors border border-indigo-200 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={13} /> Tratar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
