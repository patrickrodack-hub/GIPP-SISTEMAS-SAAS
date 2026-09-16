import React, { useState } from 'react';
import { Music, X, Sparkles, Layers, Info, Check } from 'lucide-react';
import { 
  getScaleInfo, 
  MUSICAL_KEY_GROUPS, 
  MusicalScaleInfo 
} from '../utils/musicChords';

export interface ModalEscalaHarmonicaProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSelectKey?: (newKey: string) => void;
  songTitle?: string;
  stageMode?: boolean;
}

export const ModalEscalaHarmonica: React.FC<ModalEscalaHarmonicaProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSelectKey,
  songTitle,
  stageMode = false
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(currentKey || 'G');
  const [viewMode, setViewMode] = useState<'triades' | 'tetrades'>('triades');
  const [scaleTab, setScaleTab] = useState<'maior' | 'menor'>(() => {
    return currentKey?.toLowerCase().endsWith('m') ? 'menor' : 'maior';
  });
  const [minorVariant, setMinorVariant] = useState<'natural' | 'harmonica' | 'melodica'>('natural');

  // Atualiza a chave selecionada quando a prop mudar
  React.useEffect(() => {
    if (currentKey) {
      setSelectedKey(currentKey);
      setScaleTab(currentKey.toLowerCase().endsWith('m') ? 'menor' : 'maior');
    }
  }, [currentKey]);

  if (!isOpen) return null;

  const scaleInfo: MusicalScaleInfo = getScaleInfo(selectedKey);

  const handleKeyClick = (k: string) => {
    setSelectedKey(k);
    setScaleTab(k.toLowerCase().endsWith('m') ? 'menor' : 'maior');
    if (onSelectKey) {
      onSelectKey(k);
    }
  };

  const handleToggleTab = (tab: 'maior' | 'menor') => {
    setScaleTab(tab);
    if (tab === 'menor' && !scaleInfo.isMinor) {
      handleKeyClick(scaleInfo.relativeKey);
    } else if (tab === 'maior' && scaleInfo.isMinor) {
      handleKeyClick(scaleInfo.relativeKey);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`cifra-escala-container w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-scale-in transition-all ${
          stageMode 
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          stageMode 
            ? 'bg-zinc-950/80 border-zinc-800' 
            : 'bg-gradient-to-r from-violet-50 to-indigo-50/50 dark:from-slate-950 dark:to-indigo-950/30 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <Music size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Escalas & Campo Harmônico
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  scaleInfo.isMinor 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}>
                  {scaleInfo.isMinor ? 'Tom Menor' : 'Tom Maior'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {songTitle ? `Referência para: "${songTitle}"` : 'Teoria e Dicionário de Acordes do Ministério de Louvor'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* 1. SELEÇÃO DE TOM: SELETOR VISUAL MAIORES E MENORES COM RELATIVAS */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-500" />
                Selecione a Tonalidade:
              </label>

              {/* SELETOR VISUAL MAIORES / MENORES (SEGMENTED CONTROL) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleTab('maior')}
                  className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                    scaleTab === 'maior'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>🌟 Maiores</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleTab('menor')}
                  className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                    scaleTab === 'menor'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>🌙 Menores (Relativas)</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1 sm:gap-1.5">
                {(scaleTab === 'maior' ? MUSICAL_KEY_GROUPS[0].keys : MUSICAL_KEY_GROUPS[1].keys).map((k) => {
                  const isSelected = selectedKey === k;
                  const relKey = scaleTab === 'maior' ? getScaleInfo(k).relativeKey : getScaleInfo(k).relativeKey;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeyClick(k)}
                      className={`p-1.5 rounded-xl transition-all text-center cursor-pointer border flex flex-col items-center justify-center ${
                        isSelected
                          ? scaleTab === 'maior'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105 z-10'
                            : 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105 z-10'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black font-mono leading-tight">{k}</span>
                      <span className={`text-[8px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {relKey}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. CARD DO TOM ATUAL COM RELATIVA & FÓRMULA */}
          <div className={`p-4 rounded-2xl border ${
            stageMode 
              ? 'bg-zinc-800/80 border-zinc-700' 
              : 'bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-purple-500/10 border-violet-200 dark:border-violet-900/60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest block">
                  Escala Diatônica
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {scaleInfo.modeName}
                </h4>
              </div>

              {/* Botão de Relativa */}
              <button
                type="button"
                onClick={() => handleKeyClick(scaleInfo.relativeKey)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 hover:border-violet-500 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer group"
                title={`Mudar para a relativa ${scaleInfo.relativeKey}`}
              >
                <Layers size={13} className="text-violet-500 group-hover:rotate-180 transition-transform" />
                <span>
                  Relativa {scaleInfo.isMinor ? 'Maior' : 'Menor'}: <strong className="text-violet-600 dark:text-violet-400">{scaleInfo.relativeKey}</strong>
                </span>
              </button>
            </div>

            {/* Notas da Escala Diatônica */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Notas da Escala (Graus I ao VII):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {scaleInfo.scaleNotes.map((note, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs min-w-[42px]"
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][idx]}
                    </span>
                    <span className="text-sm font-black text-violet-600 dark:text-violet-400 font-mono">
                      {note}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escala Pentatônica */}
            <div className="mt-3 pt-3 border-t border-violet-200/60 dark:border-violet-900/40 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pentatônica {scaleInfo.isMinor ? 'Menor' : 'Maior'}:
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-indigo-600 dark:text-indigo-300">
                {scaleInfo.pentatonicNotes.map((p, i) => (
                  <span key={i} className="bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Se for tom menor, mostra Menor Harmônica e Menor Melódica */}
            {scaleInfo.isMinor && scaleInfo.harmonicMinorNotes && (
              <div className="mt-2.5 pt-2.5 border-t border-violet-200/60 dark:border-violet-900/40 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Menor Harmônica (7º sensível):
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {scaleInfo.harmonicMinorNotes.join(' - ')}
                  </span>
                </div>
                {scaleInfo.melodicMinorNotes && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Menor Melódica (6º e 7º):
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {scaleInfo.melodicMinorNotes.join(' - ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. CAMPO HARMÔNICO COMPLETO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-violet-600" />
                  Campo Harmônico de {scaleInfo.key}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Os acordes fundamentais para acompanhar, modular ou criar arranjos.
                </p>
              </div>

              {/* Toggle Tríades / Tétrades */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('triades')}
                  className={`px-2.5 py-1 rounded-lg font-black transition cursor-pointer ${
                    viewMode === 'triades'
                      ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Tríades (Simples)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tetrades')}
                  className={`px-2.5 py-1 rounded-lg font-black transition cursor-pointer ${
                    viewMode === 'tetrades'
                      ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Tétrades (com 7ª)
                </button>
              </div>
            </div>

            {/* Grid dos 7 Acordes do Campo Harmônico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {scaleInfo.harmonicField.map((chord, idx) => {
                const displayChord = viewMode === 'triades' ? chord.triad : chord.tetrad;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center flex flex-col justify-between transition hover:-translate-y-0.5 shadow-2xs ${
                      chord.quality === 'Maior'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                        : chord.quality === 'Menor'
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 text-blue-950 dark:text-blue-200'
                        : chord.quality === 'Dominante'
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                        : 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 text-purple-950 dark:text-purple-200'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase opacity-70 mb-1">
                      {chord.degree}
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono my-0.5 tracking-tight">
                      {displayChord}
                    </div>
                    <div className="text-[9px] font-bold opacity-80 mt-1 leading-tight line-clamp-2">
                      {chord.function.split('(')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dica Didática */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info size={16} className="text-violet-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Dica Ministerial:</strong> Se uma canção em <strong>{scaleInfo.key}</strong> estiver muito alta ou grave para o dirigente ou grupo vocal, clique em qualquer tom acima para transpor automaticamente toda a cifra e afinação sem perder a estrutura harmônica.
            </p>
          </div>
        </div>

        {/* Rodapé com botão de confirmação */}
        <div className={`p-4 border-t flex items-center justify-between ${
          stageMode 
            ? 'bg-zinc-950 border-zinc-800' 
            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="text-xs text-slate-500 font-medium">
            Tom Selecionado: <strong className="text-violet-600 dark:text-violet-400">{selectedKey}</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSelectKey) onSelectKey(selectedKey);
              onClose();
            }}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/20 transition active:scale-95 cursor-pointer"
          >
            <Check size={14} />
            <span>Aplicar Tom ({selectedKey})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
