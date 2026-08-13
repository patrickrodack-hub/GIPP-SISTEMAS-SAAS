import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Printer,
  CheckCircle2,
  Award,
  BarChart3,
  PieChart,
  Tv,
  Calendar,
  Building2,
  Check
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModulePrestacaoContas() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [modoProjecao, setModoProjecao] = useState(false);

  // Totais do Balancete Mensal
  const balancete = {
    periodo: 'Julho / 2026',
    dataAssembleia: '10/08/2026',
    totalDizimos: 28450.00,
    totalOfertas: 12300.00,
    totalCampanhas: 5800.00,
    totalReceitas: 46550.00,
    
    despesasOperacionais: [
      { categoria: 'Aluguel & Manutenção Templos', valor: 8500.00 },
      { categoria: 'Energia, Água & Telecom', valor: 3420.00 },
      { categoria: 'Sustento Ministerial & Relatores', valor: 14000.00 },
      { categoria: 'Ação Social & Cestas Básicas', valor: 4200.00 },
      { categoria: 'Eventos & Escola Dominical Infantil', valor: 2150.00 }
    ],
    totalDespesas: 32270.00,
    saldoSuperavit: 14280.00,
    
    conselhoFiscal: [
      { nome: 'Ev. Fernando Dias', cargo: 'Presidente do Conselho Fiscal' },
      { nome: 'Pb. André Luiz', cargo: 'Relator Fiscal' },
      { nome: 'Diácono Roberto Alves', cargo: 'Membro Fiscal' }
    ]
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <FileText size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Assembleia Geral de Membros • Prestação de Contas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Caderno de Prestação de Contas & Balancete
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Geração em 1-clique do relatório financeiro consolidado com Parecer do Conselho Fiscal para votação em Assembleia Ordinária.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModoProjecao(!modoProjecao)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Tv size={16} className="text-emerald-400" /> Modo Projeção Telão
          </button>
          <button
            onClick={() => {
              window.print();
              addToast('Imprimindo Caderno de Balancete A4!', 'info');
            }}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} /> Imprimir Caderno A4
          </button>
        </div>
      </div>

      {/* KPI Balancete */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Entradas Totais ({balancete.periodo})</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            R$ {balancete.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Dízimos + Ofertas + Campanhas</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Saídas / Despesas Globais</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            R$ {balancete.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-400 font-bold">Custeio Operacional & Ação Social</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Superávit do Período</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            R$ {balancete.saldoSuperavit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-blue-400 font-bold">Saldo Positivo Retido em Caixa</span>
        </div>
      </div>

      {/* Visual Caderno de Prestação de Contas */}
      <div className={`p-8 bg-white text-slate-900 rounded-3xl shadow-2xl space-y-6 font-serif ${modoProjecao ? 'scale-105 my-8 border-4 border-emerald-500' : ''}`}>
        <div className="text-center border-b border-slate-300 pb-4 font-sans">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block">Igreja Evangélica Assembleia de Deus • GIPP</span>
          <h2 className="text-xl font-black text-slate-900 mt-1">BALANCETE FINANCEIRO & PRESTAÇÃO DE CONTAS</h2>
          <p className="text-xs text-slate-500 font-bold">Assembleia Geral Ordinária • Referência: {balancete.periodo}</p>
        </div>

        {/* DRE Simplificada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-black text-emerald-900 uppercase tracking-wider text-xs">1. DEMONSTRATIVO DE RECEITAS</h3>
            <div className="flex justify-between border-b border-emerald-200 pb-1">
              <span>Dízimos dos Membros:</span>
              <strong>R$ {balancete.totalDizimos.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between border-b border-emerald-200 pb-1">
              <span>Ofertas dos Cultos:</span>
              <strong>R$ {balancete.totalOfertas.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between border-b border-emerald-200 pb-1">
              <span>Campanhas & Projetos Especial:</span>
              <strong>R$ {balancete.totalCampanhas.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between font-black text-emerald-950 pt-2 text-sm">
              <span>TOTAL DE ENTRADAS:</span>
              <span>R$ {balancete.totalReceitas.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 space-y-2">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">2. DEMONSTRATIVO DE DESPESAS</h3>
            {balancete.despesasOperacionais.map((d, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-200 pb-1">
                <span>{d.categoria}:</span>
                <strong>R$ {d.valor.toFixed(2)}</strong>
              </div>
            ))}
            <div className="flex justify-between font-black text-slate-900 pt-2 text-sm">
              <span>TOTAL DE SAÍDAS:</span>
              <span>R$ {balancete.totalDespesas.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Parecer do Conselho Fiscal */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
            <CheckCircle2 size={18} /> PARECER FAVORÁVEL DO CONSELHO FISCAL
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-serif">
            Os membros do Conselho Fiscal abaixo assinados declaram que examinaram detidamente os livros caixas, comprovantes de despesas, extratos bancários e guias de dízimos do período de {balancete.periodo}, constatando a exatidão e idoneidade de todos os lançamentos. Recomendamos à Assembleia Geral a <strong>APROVAÇÃO INTEGRAL</strong> destas contas.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[10px]">
            {balancete.conselhoFiscal.map((membro, idx) => (
              <div key={idx}>
                <div className="w-24 h-0.5 bg-slate-800 mx-auto mb-1" />
                <strong className="block text-slate-900">{membro.nome}</strong>
                <span className="text-slate-500">{membro.cargo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
