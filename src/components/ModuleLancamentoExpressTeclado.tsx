import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'motion/react';
import {
  Keyboard,
  Zap,
  CheckCircle2,
  DollarSign,
  User,
  Plus,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface LancamentoNumpad {
  id: string;
  matricula: string;
  nome: string;
  valor: number;
  tipo: 'Dízimo' | 'Oferta' | 'Fundo Missões';
  hora: string;
}

export default function ModuleLancamentoExpressTeclado() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [matricula, setMatricula] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'Dízimo' | 'Oferta' | 'Fundo Missões'>('Dízimo');

  const matriculaInputRef = useRef<HTMLInputElement>(null);
  const valorInputRef = useRef<HTMLInputElement>(null);

  const [historico, setHistorico] = useState<LancamentoNumpad[]>([
    { id: '1', matricula: '101', nome: 'Pr. Carlos Eduardo', valor: 250.00, tipo: 'Dízimo', hora: '18:50' },
    { id: '2', matricula: '102', nome: 'Pb. Roberto Santos', valor: 100.00, tipo: 'Oferta', hora: '18:52' }
  ]);

  useEffect(() => {
    // Focus no primeiro campo no carregamento
    matriculaInputRef.current?.focus();
  }, []);

  const handleKeyDownMatricula = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!matricula) {
        addToast('Digite a matrícula do membro!', 'warning');
        return;
      }
      valorInputRef.current?.focus();
    }
  };

  const handleKeyDownValor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const valNum = parseFloat(valor.replace(',', '.'));
      if (isNaN(valNum) || valNum <= 0) {
        addToast('Digite um valor válido!', 'warning');
        return;
      }

      const novo: LancamentoNumpad = {
        id: Date.now().toString(),
        matricula,
        nome: matricula === '101' ? 'Pr. Carlos Eduardo' : matricula === '102' ? 'Pb. Roberto Santos' : `Membro #${matricula}`,
        valor: valNum,
        tipo,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setHistorico([novo, ...historico]);
      addToast(`Lançamento de R$ ${valNum.toFixed(2)} registrado com sucesso! (Modo Teclado Express)`, 'success');

      // Reseta e volta para matrícula
      setMatricula('');
      setValor('');
      matriculaInputRef.current?.focus();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20">
            <Keyboard size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Visão Operador de Computador • Numpad High-Speed Entry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Caixa Express & Lançamento Contínuo Numpad
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Projetado para lançamento ultrarrápido sem necessidade do mouse: pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300 font-mono">ENTER</kbd> para pular de campo e efetivar a entrada.
            </p>
          </div>
        </div>
      </div>

      {/* Form Numpad */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Zap className="text-amber-400" size={20} /> Formulário Teclado Numérico (Atalhos ENTER / TAB)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-400">1. Matrícula do Membro (Numpad)</label>
            <input
              ref={matriculaInputRef}
              type="text"
              value={matricula}
              onChange={e => setMatricula(e.target.value)}
              onKeyDown={handleKeyDownMatricula}
              placeholder="Ex: 101 [Aperte ENTER]"
              className="w-full p-4 bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-2xl text-lg font-mono font-black text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-400">2. Valor do Dízimo / Oferta (R$)</label>
            <input
              ref={valorInputRef}
              type="text"
              value={valor}
              onChange={e => setValor(e.target.value)}
              onKeyDown={handleKeyDownValor}
              placeholder="Ex: 150.00 [Aperte ENTER]"
              className="w-full p-4 bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-2xl text-lg font-mono font-black text-emerald-400 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-400">3. Tipo de Lançamento</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as any)}
              className="w-full p-4 bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-2xl text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value="Dízimo">Dízimo Ministerial</option>
              <option value="Oferta">Oferta Voluntária</option>
              <option value="Fundo Missões">Fundo de Missões</option>
            </select>
          </div>
        </div>
      </div>

      {/* Histórico Recente de Entrada */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={20} /> Lançamentos Efetuados na Sessão</span>
          <span className="text-xs font-mono text-emerald-400">Total: R$ {historico.reduce((acc, h) => acc + h.valor, 0).toFixed(2)}</span>
        </h2>

        <div className="space-y-2">
          {historico.map(h => (
            <div key={h.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg">
                  #{h.matricula}
                </span>
                <div>
                  <h3 className="text-sm font-black font-sans text-white">{h.nome}</h3>
                  <span className="text-[10px] font-sans text-slate-400">{h.tipo} • {h.hora}</span>
                </div>
              </div>

              <span className="text-base font-black text-emerald-400">
                + R$ {h.valor.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
