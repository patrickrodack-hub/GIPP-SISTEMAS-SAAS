import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  BarChart2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleFluxoCaixaPreditivo() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast } = context || {};

  // Mock dados do caixa atual e despesas fixas
  const caixaAtual = 142800.00;
  const despesaFixaMensal = 32270.00;
  const arrecadacaoMediaMensal = 46550.00;

  // Calculo de Runway (Reserva Operacional em meses)
  const runwayMeses = (caixaAtual / (despesaFixaMensal || 1)).toFixed(1);

  // Projeção Preditiva 3 Meses (30, 60, 90 dias)
  const projecoes = [
    { periodo: 'Próximos 30 Dias (Setembro)', entPrev: 48200.00, saiPrev: 32500.00, saldoProj: caixaAtual + (48200 - 32500), status: 'Seguro' },
    { periodo: 'Próximos 60 Dias (Outubro - Campanha)', entPrev: 55000.00, saiPrev: 34000.00, saldoProj: caixaAtual + (48200 - 32500) + (55000 - 34000), status: 'Superávit Elevado' },
    { periodo: 'Próximos 90 Dias (Novembro)', entPrev: 45000.00, saiPrev: 33000.00, saldoProj: caixaAtual + (48200 - 32500) + (55000 - 34000) + (45000 - 33000), status: 'Seguro' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Activity size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CFO Executive • Projeção & Liquidez
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Fluxo de Caixa Preditivo (30, 60, 90 Dias)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Modelagem preditiva baseada em curva de dízimos e compromissos futuros. <strong className="text-emerald-400">Indicador de Runway Operacional</strong> da tesouraria.
            </p>
          </div>
        </div>
      </div>

      {/* Runway Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400">Saldo Disponível Hoje</span>
          <div className="text-3xl font-black text-emerald-400">
            R$ {caixaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 font-medium">Livre em contas correntes e aplicações</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-2 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase text-slate-400">Runway Operacional da Igreja</span>
          <div className="text-3xl font-black text-cyan-400 flex items-center gap-2">
            {runwayMeses} Meses <Zap size={20} className="text-amber-400 animate-bounce" />
          </div>
          <p className="text-xs text-slate-300">
            A igreja mantém reserva para cobrir <strong className="text-cyan-400">{runwayMeses} meses</strong> de despesas sem arrecadar dízimos.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400">Média de Arrecadação Mensal</span>
          <div className="text-3xl font-black text-blue-400">
            R$ {arrecadacaoMediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 font-medium">Estimativa com base nos últimos 12 meses</span>
        </div>
      </div>

      {/* Projeção de 30, 60 e 90 dias */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart2 className="text-emerald-400" size={20} /> Projeção de Liquidez Futura
        </h2>

        <div className="space-y-4">
          {projecoes.map((p, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {p.periodo}
                </span>
                <h3 className="text-base font-black text-white">Saldo Estimado: R$ {p.saldoProj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ArrowUpRight size={14} /> Entradas: R$ {p.entPrev.toFixed(2)}
                  </span>
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <ArrowDownRight size={14} /> Saídas: R$ {p.saiPrev.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 bg-emerald-950 border border-emerald-800 text-emerald-400 font-black text-xs rounded-xl">
                ✓ Status: {p.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
