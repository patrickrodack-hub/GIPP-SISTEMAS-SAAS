import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface CentroCustoBudget {
  id: string;
  departamento: string;
  orcamentoAnual: number;
  gastoRealizado: number;
  compromissado: number; // Pedidos em análise
  responsavel: string;
}

export default function ModuleOrcamentoCentrosCusto() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [centros, setCentros] = useState<CentroCustoBudget[]>([
    {
      id: 'cc1',
      departamento: 'Mídia & Transmissão',
      orcamentoAnual: 24000.00,
      gastoRealizado: 14200.00,
      compromissado: 3450.00,
      responsavel: 'Jovem Amanda Lima'
    },
    {
      id: 'cc2',
      departamento: 'Louvor & Adoração',
      orcamentoAnual: 36000.00,
      gastoRealizado: 22100.00,
      compromissado: 1200.00,
      responsavel: 'Ev. Fernando Dias'
    },
    {
      id: 'cc3',
      departamento: 'Escola Dominical Infantil',
      orcamentoAnual: 12000.00,
      gastoRealizado: 5400.00,
      compromissado: 480.00,
      responsavel: 'Irmã Juliana Costa'
    },
    {
      id: 'cc4',
      departamento: 'Ação Social & Assistência',
      orcamentoAnual: 48000.00,
      gastoRealizado: 42000.00,
      compromissado: 4500.00,
      responsavel: 'Diácono Paulo Silva'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoDepto, setNovoDepto] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoResp, setNovoResp] = useState('');

  const totalOrcado = centros.reduce((acc, c) => acc + c.orcamentoAnual, 0);
  const totalRealizado = centros.reduce((acc, c) => acc + c.gastoRealizado, 0);
  const totalCompromissado = centros.reduce((acc, c) => acc + c.compromissado, 0);

  const handleCriarCentro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDepto || !novoValor) return;

    const item: CentroCustoBudget = {
      id: `cc_${Date.now()}`,
      departamento: novoDepto,
      orcamentoAnual: parseFloat(novoValor.replace(',', '.')) || 0,
      gastoRealizado: 0,
      compromissado: 0,
      responsavel: novoResp || 'Líder do Departamento'
    };

    setCentros([...centros, item]);
    setIsModalOpen(false);
    setNovoDepto('');
    setNovoValor('');
    setNovoResp('');
    addToast(`Centro de Custo "${item.departamento}" configurado com sucesso!`, 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20">
            <PieChart size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CFO Executive • Budget vs. Actual
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Orçamento x Realizado por Centro de Custo
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Definição de tetos orçamentários por departamento, acompanhamento de execução em tempo real e travas contra estouro de verba.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Novo Centro de Custo
        </button>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Orçamento Teto Aprovado</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            R$ {totalOrcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">Global para o exercício</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Realizado / Executado</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            R$ {totalRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">
            {((totalRealizado / (totalOrcado || 1)) * 100).toFixed(1)}% do orçamento consumido
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Compromissado (Cotações Pendentes)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            R$ {totalCompromissado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-400 font-bold">Reservado para autorizações</span>
        </div>
      </div>

      {/* Grid Centros de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centros.map(c => {
          const percExecutado = (c.gastoRealizado / (c.orcamentoAnual || 1)) * 100;
          const percTotalComCompromisso = ((c.gastoRealizado + c.compromissado) / (c.orcamentoAnual || 1)) * 100;
          const estaAlerta = percTotalComCompromisso >= 85;

          return (
            <div key={c.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                    Líder: {c.responsavel}
                  </span>
                  <h3 className="text-lg font-black text-white">{c.departamento}</h3>
                </div>

                {estaAlerta && (
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> Próximo do Teto
                  </span>
                )}
              </div>

              {/* Barra de Progresso do Orçamento */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Consumo da Verba</span>
                  <span className={percTotalComCompromisso > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                    {percTotalComCompromisso.toFixed(1)}% utilizado
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(percExecutado, 100)}%` }} />
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(percTotalComCompromisso - percExecutado, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Teto Anual</span>
                  <strong className="text-slate-200">R$ {c.orcamentoAnual.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Pago</span>
                  <strong className="text-emerald-400">R$ {c.gastoRealizado.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Saldo Livre</span>
                  <strong className="text-blue-400">R$ {(c.orcamentoAnual - c.gastoRealizado - c.compromissado).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Centro */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Criar Centro de Custo</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <form onSubmit={handleCriarCentro} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Departamento *</label>
                  <input
                    type="text"
                    required
                    value={novoDepto}
                    onChange={e => setNovoDepto(e.target.value)}
                    placeholder="Ex: Eventos & Congressos"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Teto Orçamentário Anual (R$) *</label>
                  <input
                    type="text"
                    required
                    value={novoValor}
                    onChange={e => setNovoValor(e.target.value)}
                    placeholder="Ex: 30000,00"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Líder Responsável</label>
                  <input
                    type="text"
                    value={novoResp}
                    onChange={e => setNovoResp(e.target.value)}
                    placeholder="Ex: Pb. André Luiz"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30">Salvar Centro</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
