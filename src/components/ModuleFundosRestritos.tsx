import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  DollarSign,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface FundoRestrito {
  id: string;
  nome: string;
  finalidade: string;
  saldoAtual: number;
  meta: number;
  corrimao: 'Missões' | 'Construção' | 'Ação Social' | 'Ação Jovem';
}

export default function ModuleFundosRestritos() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast } = context || {};

  const [fundos, setFundos] = useState<FundoRestrito[]>([
    {
      id: 'f1',
      nome: 'Fundo Carimbado de Missões Transculturais',
      finalidade: 'Ofertas destinadas exclusivamente ao sustento dos missionários no campo da África e Sertão.',
      saldoAtual: 34500.00,
      meta: 50000.00,
      corrimao: 'Missões'
    },
    {
      id: 'f2',
      nome: 'Fundo da Reforma & Expansão do Templo Sede',
      finalidade: 'Arrecadação de carnês de construção para troca do piso e climatização.',
      saldoAtual: 82000.00,
      meta: 120000.00,
      corrimao: 'Construção'
    },
    {
      id: 'f3',
      nome: 'Fundo Social Dorcas (Cestas Básicas)',
      finalidade: 'Aquisição mensal de alimentos e medicamentos para famílias necessitadas cadastradas.',
      saldoAtual: 12400.00,
      meta: 15000.00,
      corrimao: 'Ação Social'
    }
  ]);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fundoOrigem, setFundoOrigem] = useState('');
  const [fundoDestino, setFundoDestino] = useState('');
  const [valorTransf, setValorTransf] = useState('');
  const [justificativa, setJustificativa] = useState('');

  const handleTransferir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorTransf || !justificativa) {
      addToast('Preencha o valor e a justificativa para a transferência interna.', 'error');
      return;
    }

    addToast('Transferência entre fundos registrada no livro contábil com justificativa da diretoria!', 'success');
    setIsTransferOpen(false);
    setValorTransf('');
    setJustificativa('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/20">
            <Lock size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CFO Executive • Contabilidade Segregada
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Fundos Restritos & Ofertas Carimbadas
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Segregação rígida de ofertas de Missões, Construção e Ação Social. <strong className="text-purple-400">Proteção contra desvio de finalidade do recurso do doador</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsTransferOpen(true)}
          className="px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowRightLeft size={18} /> Transferência entre Fundos
        </button>
      </div>

      {/* Grid Fundos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fundos.map(f => {
          const percMeta = (f.saldoAtual / (f.meta || 1)) * 100;

          return (
            <div key={f.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {f.corrimao}
                </span>
                <Lock size={16} className="text-purple-400" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">{f.nome}</h3>
                <p className="text-xs text-slate-400 mt-1">{f.finalidade}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">Saldo Carimbado:</span>
                  <strong className="text-purple-400 font-black text-sm">
                    R$ {f.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(percMeta, 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block text-right">
                  Meta do Fundo: R$ {f.meta.toLocaleString('pt-BR')} ({percMeta.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Transferência */}
      <AnimatePresence>
        {isTransferOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Transferência entre Fundos Restritos</h3>
                <button onClick={() => setIsTransferOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <form onSubmit={handleTransferir} className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs space-y-1">
                  <strong className="block font-black flex items-center gap-1">
                    <AlertOctagon size={14} /> Alerta de Compliance
                  </strong>
                  A transferência entre fundos com destinação específica requer aprovação prévia em ata da Diretoria Executiva para evitar desvio de finalidade.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Valor a Transferir (R$) *</label>
                  <input
                    type="text"
                    required
                    value={valorTransf}
                    onChange={e => setValorTransf(e.target.value)}
                    placeholder="Ex: 5000,00"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Justificativa da Diretoria *</label>
                  <textarea
                    required
                    rows={3}
                    value={justificativa}
                    onChange={e => setJustificativa(e.target.value)}
                    placeholder="Descreva a ata de aprovação ou urgência da transferência..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsTransferOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-black shadow-lg">Registrar Transferência</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
