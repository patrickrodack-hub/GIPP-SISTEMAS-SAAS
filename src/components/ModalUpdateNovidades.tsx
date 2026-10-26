import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, X, Music, BookOpen, ShieldCheck, 
  Layers, ArrowRight, Zap, Check, ChevronRight, Award,
  Flame, Megaphone, Laptop, Info
} from 'lucide-react';
import { 
  SystemUpdate, 
  getLatestSystemUpdate, 
  markUpdateAsSeen 
} from '../data/systemUpdatesData';

interface ModalUpdateNovidadesProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  userName?: string | null;
  customUpdate?: SystemUpdate | null;
}

export const ModalUpdateNovidades: React.FC<ModalUpdateNovidadesProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  customUpdate
}) => {
  const update = customUpdate || getLatestSystemUpdate();
  const [activeTab, setActiveTab] = useState<'destaques' | 'detalhes'>('destaques');

  // Fechar com a tecla ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    markUpdateAsSeen(userId);
    onClose();
  };

  const getHighlightIcon = (iconName: string) => {
    switch (iconName) {
      case 'music':
        return <Music className="w-5 h-5 text-amber-500" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'bell':
        return <Megaphone className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-700/60 flex flex-col overflow-hidden animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Superior com Gradiente Suave e Badge */}
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white overflow-hidden shrink-0">
          {/* Efeitos de Luz no Fundo */}
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-24 -bottom-10 w-32 h-32 bg-pink-500/15 rounded-full blur-xl pointer-events-none" />

          {/* Botão de Fechar no Topo Direito */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar (não mostrar novamente)"
          >
            <X size={20} />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-sm">
              <Sparkles size={13} className="text-slate-950" />
              SISTEMA ATUALIZADO
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-indigo-100 backdrop-blur-xs border border-white/20">
              Versão {update.version}
            </span>
            <span className="text-[11px] font-medium text-indigo-200">
              {update.releaseDate}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug pr-8 mt-1">
            {update.title}
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed mt-2 line-clamp-2">
            {update.summary}
          </p>

          {/* Abas Internas */}
          <div className="flex gap-2 mt-4 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('destaques')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'destaques'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Principais Destaques
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detalhes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'detalhes'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Lista Completa de Alterações
            </button>
          </div>
        </div>

        {/* Corpo de Conteúdo com Rolagem Fluida */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {activeTab === 'destaques' ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>O que há de novo para você</span>
                {userName && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold normal-case">
                    Olá, {userName.split(' ')[0]}!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {update.highlights.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-slate-100 dark:border-slate-600">
                          {getHighlightIcon(item.iconName)}
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                Registro Detalhado por Área (Changelog)
              </div>

              {update.categories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {cat.category}
                    </h4>
                  </div>
                  <ul className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                    {cat.items.map((line, lIdx) => (
                      <li key={lIdx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé com Informação de Não Repetição e Botão de Fechar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>Esta janela só aparece uma vez por atualização realizada.</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Entendi, Começar a Usar</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
