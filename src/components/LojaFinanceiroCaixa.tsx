import React, { useState, useMemo } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Filter, Search, 
  CheckCircle, Clock, AlertTriangle, XCircle, ShoppingBag, Landmark, 
  ArrowRight, Printer, Receipt, FileText, MessageCircle, Eye, 
  TrendingUp, BarChart3, Tag, Building2, User, Phone, Check, 
  ChevronRight, RefreshCw, Layers, ShieldCheck, Download
} from 'lucide-react';
import { 
  PedidoLoja, ProdutoLoja, TransferenciaCaixaLoja 
} from '../data/lojaVirtualData';
import { Button } from '../utils/sharedHelpers';
import LojaComprovanteTransferenciaModal from './LojaComprovanteTransferenciaModal';
import LojaDocumentoFiscalModal from './LojaDocumentoFiscalModal';

interface LojaFinanceiroCaixaProps {
  pedidos: PedidoLoja[];
  transferencias: TransferenciaCaixaLoja[];
  igrejaData: any;
  user: any;
  centrosCusto?: any[];
  congregacoes?: any[];
  onEfetuarTransferencia: (dados: {
    valor: number;
    destino_conta: string;
    centro_custo_id?: string;
    congregacao_id?: string;
    categoria_financeiro: string;
    forma_transferencia: 'transferencia_interna' | 'pix' | 'deposito' | 'dinheiro';
    observacoes?: string;
    data_transferencia: string;
  }) => Promise<TransferenciaCaixaLoja | null>;
  onOpenOrderDetails?: (pedido: PedidoLoja) => void;
}

export default function LojaFinanceiroCaixa({
  pedidos,
  transferencias,
  igrejaData,
  user,
  centrosCusto = [],
  congregacoes = [],
  onEfetuarTransferencia,
  onOpenOrderDetails
}: LojaFinanceiroCaixaProps) {
  // Sub-aba interna: 'vendas' ou 'transferencias'
  const [subTab, setSubTab] = useState<'vendas' | 'transferencias'>('vendas');

  // Filtros de Período
  const [periodoPreset, setPeriodoPreset] = useState<'hoje' | 'ontem' | '7dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'todos' | 'custom'>('mes_atual');
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Outros Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente' | 'cancelado'>('todos');
  const [formaPagamentoFilter, setFormaPagamentoFilter] = useState<string>('todas');

  // Modais
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [selectedComprovante, setSelectedComprovante] = useState<TransferenciaCaixaLoja | null>(null);
  const [fiscalDocModal, setFiscalDocModal] = useState<{ order: PedidoLoja; tipo: 'nota_fiscal' | 'pedido_compra' } | null>(null);
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(true);

  // Form State para Transferência
  const [transferValor, setTransferValor] = useState<string>('');
  const [transferDestino, setTransferDestino] = useState<string>('Tesouraria Geral - Caixa Central');
  const [transferCentroCusto, setTransferCentroCusto] = useState<string>('sede');
  const [transferCongregacao, setTransferCongregacao] = useState<string>('sede');
  const [transferCategoria, setTransferCategoria] = useState<string>('Vendas Loja Virtual / Cantina / Livraria');
  const [transferForma, setTransferForma] = useState<'transferencia_interna' | 'pix' | 'deposito' | 'dinheiro'>('transferencia_interna');
  const [transferData, setTransferData] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [transferObs, setTransferObs] = useState<string>('');
  const [transferError, setTransferError] = useState<string>('');

  // 1. CÁLCULO DO BALANÇO GERAL DO CAIXA DA LOJA
  const balancoGeral = useMemo(() => {
    // Total de vendas com pagamento confirmado
    const totalVendasPagas = pedidos
      .filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + (p.valor_total || 0), 0);

    // Total de vendas pendentes
    const totalVendasPendentes = pedidos
      .filter(p => p.status_pagamento === 'pendente')
      .reduce((acc, p) => acc + (p.valor_total || 0), 0);

    // Total de repasses efetuados para a igreja
    const totalTransferido = (transferencias || [])
      .filter(t => t.status !== 'estornada')
      .reduce((acc, t) => acc + (t.valor || 0), 0);

    // Saldo disponível no caixa da loja virtual
    const saldoDisponivel = Math.max(0, totalVendasPagas - totalTransferido);

    return {
      totalVendasPagas,
      totalVendasPendentes,
      totalTransferido,
      saldoDisponivel
    };
  }, [pedidos, transferencias]);

  // 2. APLICAÇÃO DOS FILTROS DE DATA / PERÍODO
  const handlePresetChange = (preset: 'hoje' | 'ontem' | '7dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'todos' | 'custom') => {
    setPeriodoPreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'hoje') {
      setDataInicio(todayStr);
      setDataFim(todayStr);
    } else if (preset === 'ontem') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      setDataInicio(yStr);
      setDataFim(yStr);
    } else if (preset === '7dias') {
      const past7 = new Date(now);
      past7.setDate(now.getDate() - 6);
      setDataInicio(past7.toISOString().split('T')[0]);
      setDataFim(todayStr);
    } else if (preset === 'mes_atual') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setDataInicio(firstDay);
      setDataFim(todayStr);
    } else if (preset === 'mes_anterior') {
      const firstDayPast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDayPast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setDataInicio(firstDayPast);
      setDataFim(lastDayPast);
    } else if (preset === 'ano_atual') {
      const firstDayYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      setDataInicio(firstDayYear);
      setDataFim(todayStr);
    } else if (preset === 'todos') {
      setDataInicio('2020-01-01');
      setDataFim('2099-12-31');
    }
  };

  // Pedidos Filtrados pelo Período e Critérios de Busca
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => {
      // Filtro de Data
      if (periodoPreset !== 'todos') {
        const pedDateStr = (p.data_pedido || '').split('T')[0];
        if (dataInicio && pedDateStr < dataInicio) return false;
        if (dataFim && pedDateStr > dataFim) return false;
      }

      // Filtro de Status de Pagamento
      if (statusFilter !== 'todos' && p.status_pagamento !== statusFilter) {
        return false;
      }

      // Filtro de Forma de Pagamento
      if (formaPagamentoFilter !== 'todas' && p.forma_pagamento !== formaPagamentoFilter) {
        return false;
      }

      // Busca por Texto (Cliente, Pedido, CPF, Telefone, Produtos)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = (p.cliente_nome || '').toLowerCase().includes(term);
        const matchNum = (p.numero_pedido || '').toLowerCase().includes(term);
        const matchPhone = (p.cliente_telefone || '').toLowerCase().includes(term);
        const matchCpf = (p.cliente_cpf || '').toLowerCase().includes(term);
        const matchProducts = (p.itens || []).some(item => (item.nome || '').toLowerCase().includes(term));

        if (!matchName && !matchNum && !matchPhone && !matchCpf && !matchProducts) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime());
  }, [pedidos, periodoPreset, dataInicio, dataFim, statusFilter, formaPagamentoFilter, searchTerm]);

  // 3. INDICADORES ESPECÍFICOS DO PERÍODO FILTRADO
  const metricasPeriodo = useMemo(() => {
    const totalVendasPeriodo = pedidosFiltrados.length;
    const faturamentoPeriodo = pedidosFiltrados
      .filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + (p.valor_total || 0), 0);

    const faturamentoPendentePeriodo = pedidosFiltrados
      .filter(p => p.status_pagamento === 'pendente')
      .reduce((acc, p) => acc + (p.valor_total || 0), 0);

    const ticketMedio = totalVendasPeriodo > 0 
      ? faturamentoPeriodo / (pedidosFiltrados.filter(p => p.status_pagamento === 'pago').length || 1)
      : 0;

    const totalItensVendidos = pedidosFiltrados
      .filter(p => p.status_pagamento === 'pago')
      .reduce((acc, p) => {
        const sumItens = (p.itens || []).reduce((iAcc, item) => iAcc + (item.quantidade || 0), 0);
        return acc + sumItens;
      }, 0);

    // Distribuição por Forma de Pagamento no Período (Apenas Pagos)
    const porForma = {
      pix: 0,
      cartao: 0,
      dinheiro: 0
    };

    pedidosFiltrados.filter(p => p.status_pagamento === 'pago').forEach(p => {
      if (p.forma_pagamento === 'pix') porForma.pix += p.valor_total || 0;
      else if (p.forma_pagamento === 'cartao_retirada') porForma.cartao += p.valor_total || 0;
      else if (p.forma_pagamento === 'dinheiro_retirada') porForma.dinheiro += p.valor_total || 0;
    });

    // Top 5 Produtos Mais Vendidos no Período
    const mapProdutos: { [key: string]: { nome: string; qtd: number; receita: number } } = {};
    pedidosFiltrados.filter(p => p.status_pagamento === 'pago').forEach(p => {
      (p.itens || []).forEach(item => {
        if (!mapProdutos[item.produto_id]) {
          mapProdutos[item.produto_id] = { nome: item.nome, qtd: 0, receita: 0 };
        }
        mapProdutos[item.produto_id].qtd += item.quantidade || 0;
        mapProdutos[item.produto_id].receita += (item.subtotal || (item.preco_unitario * item.quantidade) || 0);
      });
    });

    const topProdutos = Object.values(mapProdutos)
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 5);

    return {
      totalVendasPeriodo,
      faturamentoPeriodo,
      faturamentoPendentePeriodo,
      ticketMedio,
      totalItensVendidos,
      porForma,
      topProdutos
    };
  }, [pedidosFiltrados]);

  // 3.1 ANÁLISE TEMPORAL (HOJE / MÊS ATUAL / CONSOLIDADO MÊS A MÊS)
  const analiseTemporal = useMemo(() => {
    const hojeStr = new Date().toISOString().split('T')[0];
    const d = new Date();
    const anoAtual = d.getFullYear();
    const mesAtualPrefix = `${anoAtual}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    let qtdHoje = 0;
    let valorHoje = 0;
    let qtdMesAtual = 0;
    let valorMesAtual = 0;

    const mapaMeses: { [mesAno: string]: { mesAno: string; rotulo: string; qtd: number; total: number; itens: number } } = {};
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    pedidos.forEach(p => {
      const dataStr = (p.data_pedido || '').split('T')[0];
      const isPago = p.status_pagamento === 'pago';
      const valor = p.valor_total || 0;
      const numItens = (p.itens || []).reduce((acc, it) => acc + (it.quantidade || 0), 0);

      if (dataStr === hojeStr) {
        qtdHoje++;
        if (isPago) valorHoje += valor;
      }

      if (dataStr.startsWith(mesAtualPrefix)) {
        qtdMesAtual++;
        if (isPago) valorMesAtual += valor;
      }

      if (dataStr.length >= 7) {
        const chaveMes = dataStr.substring(0, 7);
        const [ano, mes] = chaveMes.split('-');
        const mesIdx = parseInt(mes, 10) - 1;
        const rotulo = `${mesesNomes[mesIdx] || mes}/${ano}`;

        if (!mapaMeses[chaveMes]) {
          mapaMeses[chaveMes] = { mesAno: chaveMes, rotulo, qtd: 0, total: 0, itens: 0 };
        }
        mapaMeses[chaveMes].qtd++;
        if (isPago) {
          mapaMeses[chaveMes].total += valor;
        }
        mapaMeses[chaveMes].itens += numItens;
      }
    });

    const listaMeses = Object.values(mapaMeses).sort((a, b) => b.mesAno.localeCompare(a.mesAno));

    return {
      qtdHoje,
      valorHoje,
      qtdMesAtual,
      valorMesAtual,
      listaMeses
    };
  }, [pedidos]);

  // Filtrar mês específico ao clicar
  const handleSelectMonth = (mesAno: string) => {
    const [ano, mes] = mesAno.split('-');
    const primeiroDia = `${ano}-${mes}-01`;
    const ultimoDiaNum = new Date(parseInt(ano, 10), parseInt(mes, 10), 0).getDate();
    const ultimoDia = `${ano}-${mes}-${String(ultimoDiaNum).padStart(2, '0')}`;
    
    setDataInicio(primeiroDia);
    setDataFim(ultimoDia);
    setPeriodoPreset('custom');
  };

  // Handlers para Abertura do Modal de Transferência
  const handleOpenTransferModal = () => {
    setTransferValor(balancoGeral.saldoDisponivel > 0 ? balancoGeral.saldoDisponivel.toFixed(2) : '');
    setTransferDestino('Tesouraria Geral - Caixa Central Sede');
    setTransferCategoria('Vendas Loja Virtual / Cantina / Livraria');
    setTransferData(new Date().toISOString().split('T')[0]);
    setTransferObs(`Repasse de receitas auferidas nas vendas da Loja Virtual da Igreja.`);
    setTransferError('');
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    const valNum = parseFloat(transferValor.replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) {
      setTransferError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (valNum > balancoGeral.saldoDisponivel + 0.001) {
      setTransferError(`O valor informado (R$ ${valNum.toFixed(2)}) ultrapassa o saldo disponível em caixa (R$ ${balancoGeral.saldoDisponivel.toFixed(2)}).`);
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const result = await onEfetuarTransferencia({
        valor: valNum,
        destino_conta: transferDestino,
        centro_custo_id: transferCentroCusto,
        congregacao_id: transferCongregacao,
        categoria_financeiro: transferCategoria,
        forma_transferencia: transferForma,
        data_transferencia: transferData,
        observacoes: transferObs
      });

      if (result) {
        setIsTransferModalOpen(false);
        setSelectedComprovante(result);
      }
    } catch (err: any) {
      console.error("Erro ao transferir:", err);
      setTransferError('Ocorreu um erro ao processar a transferência. Tente novamente.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // WhatsApp Helper
  const handleContactBuyerWhatsApp = (pedido: PedidoLoja) => {
    const phone = (pedido.cliente_telefone || '').replace(/\D/g, '');
    if (!phone) return;
    const message = encodeURIComponent(
      `Olá, ${pedido.cliente_nome}! Paz do Senhor.\n` +
      `Referente ao seu Pedido #${pedido.numero_pedido} na Loja da Igreja:\n` +
      `Status do Pagamento: ${pedido.status_pagamento.toUpperCase()}.\n` +
      `Valor Total: R$ ${pedido.valor_total.toFixed(2)}.\nDeus abençoe!`
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. BALANÇO GERAL DO CAIXA DA LOJA & AÇÃO DE TRANSFERÊNCIA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-indigo-500/10 pointer-events-none transform scale-150">
          <Landmark size={180} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
              <Landmark size={14} /> Caixa Comercial & Tesouraria da Loja
            </div>
            <div>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                Saldo Disponível para Repasse à Igreja
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl text-emerald-400">R$</span>
                <span>{balancoGeral.saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
              Valor acumulado de vendas confirmadas e pagas por membros e visitantes, pronto para ser transferido e creditado como receita oficial nas finanças da congregação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleOpenTransferModal}
              disabled={balancoGeral.saldoDisponivel <= 0}
              className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 cursor-pointer ${
                balancoGeral.saldoDisponivel > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <ArrowRight size={18} className="text-slate-950 font-black" />
              <span>Transferir Saldo para a Igreja</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              title="Imprimir Relatório Financeiro Timbrado"
            >
              <Printer size={16} /> Relatório Timbrado
            </button>
          </div>
        </div>

        {/* STATS RÁPIDAS DO BALANÇO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pago em Vendas</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                R$ {balancoGeral.totalVendasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Já Repassado à Igreja</span>
              <span className="text-lg font-black text-indigo-300 font-mono">
                R$ {balancoGeral.totalTransferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vendas Pendentes / A Receber</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                R$ {balancoGeral.totalVendasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGAÇÃO DE SUB-ABAS (VENDAS vs REPASSES) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSubTab('vendas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'vendas'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={16} /> Histórico Completo de Vendas ({pedidosFiltrados.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('transferencias')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'transferencias'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Receipt size={16} /> Repasses à Tesouraria da Igreja ({transferencias.length})
          </button>
        </div>

        {subTab === 'vendas' && (
          <div className="text-xs text-slate-500 font-medium">
            Período: <strong className="text-slate-800 dark:text-slate-200">{dataInicio}</strong> até <strong className="text-slate-800 dark:text-slate-200">{dataFim}</strong>
          </div>
        )}
      </div>

      {subTab === 'vendas' ? (
        <>
          {/* 3. FILTROS AVANÇADOS DE PERÍODO & PRESETS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Filter size={15} className="text-indigo-600" /> Selecione o Período de Vendas:
              </span>

              {/* Presets Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'hoje', label: 'Hoje (Dia)' },
                  { key: 'ontem', label: 'Ontem' },
                  { key: '7dias', label: 'Últimos 7 Dias' },
                  { key: 'mes_atual', label: 'Este Mês' },
                  { key: 'mes_anterior', label: 'Mês Anterior' },
                  { key: 'ano_atual', label: 'Este Ano' },
                  { key: 'todos', label: 'Todo o Histórico' },
                  { key: 'custom', label: 'Personalizado' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handlePresetChange(p.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      periodoPreset === p.key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intervalo de Datas Customizado & Filtros Secundários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setPeriodoPreset('custom'); }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setPeriodoPreset('custom'); }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={formaPagamentoFilter}
                  onChange={(e) => setFormaPagamentoFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todas">Todas as Formas</option>
                  <option value="pix">PIX Instantâneo</option>
                  <option value="cartao_retirada">Cartão na Retirada</option>
                  <option value="dinheiro_retirada">Dinheiro na Retirada</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status de Pagamento
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pago">Somente Pagos</option>
                  <option value="pendente">Somente Pendentes</option>
                  <option value="cancelado">Cancelados / Estornados</option>
                </select>
              </div>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative pt-1">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do comprador, telefone, CPF, artigo ou nº do pedido..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 4. CARDS DE DESEMPENHO: HOJE (DIA), MÊS ATUAL E PERÍODO SELECIONADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vendas de Hoje */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendas Hoje (Dia)</p>
                </div>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {analiseTemporal.qtdHoje} {analiseTemporal.qtdHoje === 1 ? 'venda' : 'vendas'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    R$ {analiseTemporal.valorHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('hoje')}
                    className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Filtrar
                  </button>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                <Clock size={22} />
              </div>
            </div>

            {/* Vendas do Mês Atual */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendas Este Mês</p>
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {analiseTemporal.qtdMesAtual} {analiseTemporal.qtdMesAtual === 1 ? 'venda' : 'vendas'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    R$ {analiseTemporal.valorMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('mes_atual')}
                    className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Filtrar
                  </button>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <Calendar size={22} />
              </div>
            </div>

            {/* Faturado no Período Selecionado */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtro Selecionado</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {metricasPeriodo.totalVendasPeriodo} pedidos
                </h3>
                <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  R$ {metricasPeriodo.faturamentoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pagos
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                <DollarSign size={22} />
              </div>
            </div>

            {/* Ticket Médio */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</p>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                  R$ {metricasPeriodo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  {metricasPeriodo.totalItensVendidos} itens comercializados
                </span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          {/* 4.1 COMPARATIVO & HISTÓRICO DE VENDAS MÊS A MÊS */}
          {analiseTemporal.listaMeses.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={17} />
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    Demonstrativo e Volume de Vendas Mês a Mês
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {showMonthlyBreakdown ? 'Ocultar Meses' : `Exibir (${analiseTemporal.listaMeses.length} meses)`}
                </button>
              </div>

              {showMonthlyBreakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
                  {analiseTemporal.listaMeses.map((m) => (
                    <div
                      key={m.mesAno}
                      onClick={() => handleSelectMonth(m.mesAno)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/70 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl transition-all cursor-pointer group"
                      title="Clique para filtrar apenas este mês"
                    >
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <span>{m.rotulo}</span>
                        <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-900 dark:text-white font-mono">
                        R$ {m.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{m.qtd} {m.qtd === 1 ? 'venda' : 'vendas'}</span>
                        <span>{m.itens} itens</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. DISTRIBUIÇÃO POR FORMA DE PAGAMENTO E PRODUTOS MAIS VENDIDOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Formas de Pagamento */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                Receita por Meio de Pagamento no Período
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> PIX Instantâneo
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      R$ {metricasPeriodo.porForma.pix.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${metricasPeriodo.faturamentoPeriodo > 0 ? (metricasPeriodo.porForma.pix / metricasPeriodo.faturamentoPeriodo) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Cartão na Retirada
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      R$ {metricasPeriodo.porForma.cartao.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${metricasPeriodo.faturamentoPeriodo > 0 ? (metricasPeriodo.porForma.cartao / metricasPeriodo.faturamentoPeriodo) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dinheiro em Espécie
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      R$ {metricasPeriodo.porForma.dinheiro.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${metricasPeriodo.faturamentoPeriodo > 0 ? (metricasPeriodo.porForma.dinheiro / metricasPeriodo.faturamentoPeriodo) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Produtos no Período */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag size={16} className="text-amber-500" />
                Artigos Mais Vendidos no Período
              </h4>

              {metricasPeriodo.topProdutos.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Nenhum produto vendido no período selecionado.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {metricasPeriodo.topProdutos.map((prod, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-black text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {prod.nome}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-emerald-600 font-mono block">
                          R$ {prod.receita.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {prod.qtd} {prod.qtd === 1 ? 'unidade' : 'unidades'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. TABELA DETALHADA DE HISTÓRICO FINANCEIRO COMPLETO */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Histórico Detalhado de Vendas
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Auditoria de compras com discriminação de data, comprador, itens adquiridos e forma de pagamento.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Exibindo <strong className="text-indigo-600 font-mono">{pedidosFiltrados.length}</strong> vendas no período
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Pedido / DAV</th>
                    <th className="py-3 px-4">Comprador</th>
                    <th className="py-3 px-4">O Que Comprou (Itens)</th>
                    <th className="py-3 px-4">Pagamento</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Ações / DAV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-bold">Nenhuma venda encontrada para o período selecionado.</p>
                        <p className="text-xs mt-1">Ajuste as datas ou limpe os filtros para visualizar mais registros.</p>
                      </td>
                    </tr>
                  ) : (
                    pedidosFiltrados.map((pedido) => (
                      <tr 
                        key={pedido.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => onOpenOrderDetails && onOpenOrderDetails(pedido)}
                      >
                        {/* Data / Hora */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(pedido.data_pedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Pedido / DAV */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            #{pedido.numero_pedido}
                          </span>
                          <span className="block text-[9px] text-slate-400 uppercase font-mono">
                            DAV-{(pedido.id || '').substring(0, 8)}
                          </span>
                        </td>

                        {/* Comprador */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {pedido.cliente_nome}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                              pedido.tipo_cliente === 'membro'
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                            }`}>
                              {pedido.tipo_cliente}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {pedido.cliente_telefone && <span>{pedido.cliente_telefone}</span>}
                            {pedido.cliente_cpf && <span>• CPF: {pedido.cliente_cpf}</span>}
                          </div>
                        </td>

                        {/* O que comprou */}
                        <td className="py-3.5 px-4 min-w-[200px] max-w-[280px]">
                          <div className="space-y-1">
                            {(pedido.itens || []).map((item, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
                                <span className="truncate">
                                  <strong className="text-indigo-600">{item.quantidade}x</strong> {item.nome}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  R$ {((item.subtotal || item.preco_unitario * item.quantidade) || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Forma de Pagamento */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {pedido.forma_pagamento === 'pix' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PIX
                            </span>
                          )}
                          {pedido.forma_pagamento === 'cartao_retirada' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Cartão Balcão
                            </span>
                          )}
                          {pedido.forma_pagamento === 'dinheiro_retirada' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Dinheiro
                            </span>
                          )}
                        </td>

                        {/* Valor Total */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                            R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Status de Pagamento */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {pedido.status_pagamento === 'pago' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                              <CheckCircle size={12} /> PAGO
                            </span>
                          ) : pedido.status_pagamento === 'cancelado' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                              <XCircle size={12} /> CANCELADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                              <Clock size={12} /> PENDENTE
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setFiscalDocModal({ order: pedido, tipo: 'nota_fiscal' })}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-all"
                              title="Visualizar DAV / Nota Fiscal Oficial"
                            >
                              <Printer size={15} />
                            </button>

                            {pedido.cliente_telefone && (
                              <button
                                type="button"
                                onClick={() => handleContactBuyerWhatsApp(pedido)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-all"
                                title="Enviar Mensagem WhatsApp ao Comprador"
                              >
                                <MessageCircle size={15} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onOpenOrderDetails && onOpenOrderDetails(pedido)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Visualizar Detalhes & Rastreio"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* 7. ABA DE REPASSES & TRANSFERÊNCIAS EFETUADAS PARA A IGREJA */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <Landmark size={18} className="text-emerald-600" />
                Histórico de Repasses à Tesouraria Geral
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Todos os repasses creditados no controle financeiro geral de entradas da igreja.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenTransferModal}
              disabled={balancoGeral.saldoDisponivel <= 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ArrowRight size={15} /> Novo Repasse de Saldo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3 px-4">Comprovante</th>
                  <th className="py-3 px-4">Data e Hora</th>
                  <th className="py-3 px-4">Valor Transferido</th>
                  <th className="py-3 px-4">Conta Destino</th>
                  <th className="py-3 px-4">Categoria Financeira</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Saldo Caixa Loja</th>
                  <th className="py-3 px-4 text-center">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transferencias.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Receipt size={36} className="mx-auto mb-2 opacity-40" />
                      <p className="font-bold">Nenhum repasse efetuado até o momento.</p>
                      <p className="text-xs mt-1">Quando você transferir saldo do caixa da loja para a conta da igreja, o registro e o comprovante aparecerão aqui.</p>
                    </td>
                  </tr>
                ) : (
                  transferencias.map((trf) => (
                    <tr key={trf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {trf.numero_comprovante}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(trf.data_transferencia).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(trf.data_transferencia).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-emerald-600 font-mono text-sm">
                          R$ {trf.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building2 size={13} className="text-indigo-500" />
                          {trf.destino_conta}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {trf.categoria_financeiro}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {trf.responsavel_nome}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="text-slate-400">De R$ {trf.saldo_anterior.toFixed(2)}</span>
                        <span className="text-emerald-600 font-bold block">Para R$ {trf.saldo_posterior.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedComprovante(trf)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Printer size={13} /> Ver Comprovante
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. MODAL DE TRANSFERÊNCIA DE SALDO PARA A TESOURARIA DA IGREJA */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Landmark size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Transferir Saldo para a Igreja
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lança o valor como ENTRADA no Financeiro Geral da Igreja
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Balanço Informativo */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Atual no Caixa da Loja</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  R$ {balancoGeral.saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTransferValor(balancoGeral.saldoDisponivel.toFixed(2))}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all"
              >
                Transferir Saldo Total
              </button>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 font-bold flex items-center gap-2">
                <AlertTriangle size={16} /> {transferError}
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor a Transferir (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balancoGeral.saldoDisponivel}
                    required
                    value={transferValor}
                    onChange={(e) => setTransferValor(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Conta / Caixa de Destino *
                  </label>
                  <select
                    value={transferDestino}
                    onChange={(e) => setTransferDestino(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Tesouraria Geral - Caixa Central Sede">Tesouraria Geral - Caixa Central Sede</option>
                    <option value="Banco Principal - Conta Corrente da Igreja">Banco Principal - Conta Corrente da Igreja</option>
                    <option value="Conta Bancária PIX Sede">Conta Bancária PIX Sede</option>
                    {congregacoes.map((c: any) => (
                      <option key={c.id} value={`Caixa Filial - ${c.nome}`}>{`Caixa Filial - ${c.nome}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Categoria de Entrada no Financeiro *
                  </label>
                  <input
                    type="text"
                    value={transferCategoria}
                    onChange={(e) => setTransferCategoria(e.target.value)}
                    placeholder="Ex: Vendas Loja Virtual / Cantina"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Forma de Repasse
                  </label>
                  <select
                    value={transferForma}
                    onChange={(e) => setTransferForma(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="transferencia_interna">Transferência Interna entre Caixas</option>
                    <option value="pix">PIX / Transferência Bancária</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="deposito">Depósito Bancário</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Data da Transferência
                  </label>
                  <input
                    type="date"
                    value={transferData}
                    onChange={(e) => setTransferData(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações / Justificativa
                </label>
                <textarea
                  rows={2}
                  value={transferObs}
                  onChange={(e) => setTransferObs(e.target.value)}
                  placeholder="Observações adicionais para a tesouraria geral..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Aviso do Sistema */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  <strong>Ação Automática:</strong> Ao confirmar, o valor será deduzido do caixa da loja e creditado instantaneamente como uma <strong>Entrada Financeira</strong> no módulo Financeiro da Igreja, com emissão do comprovante timbrado.
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTransfer ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Confirmar Transferência
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL DE COMPROVANTE TIMBRADO DE TRANSFERÊNCIA */}
      {selectedComprovante && (
        <LojaComprovanteTransferenciaModal
          isOpen={!!selectedComprovante}
          onClose={() => setSelectedComprovante(null)}
          transferencia={selectedComprovante}
          igrejaData={igrejaData}
        />
      )}

      {/* 10. MODAL DE DAV / DOCUMENTO FISCAL */}
      {fiscalDocModal && (
        <LojaDocumentoFiscalModal
          pedido={fiscalDocModal.order}
          tipoDocumento={fiscalDocModal.tipo}
          igreja={igrejaData}
          onClose={() => setFiscalDocModal(null)}
        />
      )}
    </div>
  );
}
