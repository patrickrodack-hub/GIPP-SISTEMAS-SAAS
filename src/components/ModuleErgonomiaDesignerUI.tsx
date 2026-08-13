import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  Palette,
  Eye,
  Sliders,
  Sun,
  Moon,
  Maximize2,
  CheckCircle2,
  Type,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleErgonomiaDesignerUI() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [densidade, setDensidade] = useState<'Compacto' | 'Confortável' | 'Espaçoso'>('Confortável');
  const [temaCor, setTemaCor] = useState<'Escuro Slate' | 'Claro Ministerial' | 'Alto Contraste Projeção'>('Escuro Slate');
  const [fonteTamanho, setFonteTamanho] = useState<'Padrão' | 'Grande (+15%)' | 'Extra Grande (+30%)'>('Padrão');

  const handleSalvarPreferencias = () => {
    addToast('Preferências de Design e Ergonomia de Interface salvas com sucesso!', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-fuchsia-950 via-slate-900 to-purple-950 border border-fuchsia-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 shadow-lg shadow-fuchsia-500/20">
            <Palette size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                Visão Designer & UI/UX Specialist
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Ergonomia Visual, Densidade & Acessibilidade WCAG
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Ajustes de densidade de pixels, espaçamento entre componentes, paleta de alto contraste para telões de projeção e tipografia adaptativa.
            </p>
          </div>
        </div>

        <button
          onClick={handleSalvarPreferencias}
          className="px-5 py-3.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-fuchsia-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 size={18} /> Salvar Layout Ergonomico
        </button>
      </div>

      {/* Grid Opções de Ergonomia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Densidade de Dados */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <LayoutGrid size={18} className="text-fuchsia-400" /> Densidade do Layout
          </h2>
          <p className="text-xs text-slate-400">Ajuste o padding dos cards e tabelas para maior velocidade de leitura.</p>

          <div className="space-y-2 pt-2">
            {(['Compacto', 'Confortável', 'Espaçoso'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDensidade(d)}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  densidade === d
                    ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d} {densidade === d && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Tema & Contraste */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Eye size={18} className="text-fuchsia-400" /> Paleta & Contraste
          </h2>
          <p className="text-xs text-slate-400">Otimizado para monitores de escritório ou telões de projeção no culto.</p>

          <div className="space-y-2 pt-2">
            {(['Escuro Slate', 'Claro Ministerial', 'Alto Contraste Projeção'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTemaCor(t)}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  temaCor === t
                    ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} {temaCor === t && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Escala de Tipografia */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Type size={18} className="text-fuchsia-400" /> Tamanho das Fontes
          </h2>
          <p className="text-xs text-slate-400">Aumente o tamanho dos textos para facilitar a leitura sem cansaço visual.</p>

          <div className="space-y-2 pt-2">
            {(['Padrão', 'Grande (+15%)', 'Extra Grande (+30%)'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFonteTamanho(f)}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  fonteTamanho === f
                    ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f} {fonteTamanho === f && '✓'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
