import React, { useState } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronUp, ChevronDown, 
  Target, Zap, Gauge, Sliders, ChevronRight
} from 'lucide-react';

export interface CifraScrollDockProps {
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  scrollSpeed: number; // Ex: 1.0, 1.5, 2.0
  onChangeScrollSpeed: (speed: number) => void;
  showFocusGuide: boolean;
  onToggleFocusGuide: () => void;
  activeLineIndex: number | null;
  totalLines?: number;
  onPrevLine?: () => void;
  onNextLine?: () => void;
  onResetToTop?: () => void;
  stageMode?: boolean;
  className?: string;
}

export const CifraScrollDock: React.FC<CifraScrollDockProps> = ({
  isAutoScrolling,
  onToggleAutoScroll,
  scrollSpeed,
  onChangeScrollSpeed,
  showFocusGuide,
  onToggleFocusGuide,
  activeLineIndex,
  totalLines = 0,
  onPrevLine,
  onNextLine,
  onResetToTop,
  stageMode = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Predefinições rápidas de velocidade
  const speedPresets = [0.5, 1.0, 1.5, 2.0, 3.0];

  const handleDecreaseSpeed = () => {
    const next = Math.max(0.5, Math.round((scrollSpeed - 0.25) * 100) / 100);
    onChangeScrollSpeed(next);
  };

  const handleIncreaseSpeed = () => {
    const next = Math.min(4.0, Math.round((scrollSpeed + 0.25) * 100) / 100);
    onChangeScrollSpeed(next);
  };

  return (
    <div 
      className={`cifra-scroll-dock select-none transition-all duration-300 pointer-events-auto ${className}`}
      id="cifra_autoscroll_dock_widget"
    >
      {/* MODO COMPACTO (Pílula Flutuante) */}
      {!isExpanded ? (
        <div 
          className={`flex items-center gap-1.5 p-1.5 rounded-2xl shadow-xl backdrop-blur-md border transition-all ${
            stageMode
              ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100 shadow-black/60'
              : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-slate-900/20'
          }`}
        >
          {/* BOTÃO PRINCIPAL DE INICIAR / PAUSAR SCROLL AUTOMÁTICO */}
          <button
            type="button"
            onClick={onToggleAutoScroll}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
              isAutoScrolling
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold shadow-amber-500/20'
            }`}
            title={isAutoScrolling ? 'Pausar Rolagem Automática (Espaço)' : 'Iniciar Rolagem Automática da Cifra'}
          >
            {isAutoScrolling ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span>{isAutoScrolling ? 'Pausar' : 'Auto-Scroll'}</span>
            <span className="text-[10px] px-1 py-0.2 bg-black/20 rounded-md font-mono">
              {scrollSpeed.toFixed(1)}x
            </span>
          </button>

          {/* Ajuste rápido de velocidade - e + */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleDecreaseSpeed}
              disabled={scrollSpeed <= 0.5}
              className="w-6 h-6 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-slate-700"
              title="Diminuir velocidade (-0.25x)"
            >
              -
            </button>
            <span className="text-[11px] font-mono font-black px-1.5 text-slate-800 dark:text-slate-200">
              {scrollSpeed.toFixed(1)}x
            </span>
            <button
              type="button"
              onClick={handleIncreaseSpeed}
              disabled={scrollSpeed >= 4.0}
              className="w-6 h-6 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-slate-700"
              title="Aumentar velocidade (+0.25x)"
            >
              +
            </button>
          </div>

          {/* Botão de alternar guia de foco da linha ativa */}
          <button
            type="button"
            onClick={onToggleFocusGuide}
            className={`w-7 h-7 flex items-center justify-center rounded-xl transition cursor-pointer border ${
              showFocusGuide
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-400/50'
                : 'bg-transparent text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={showFocusGuide ? 'Cursor de Foco Ativo (Visível)' : 'Ativar Cursor de Foco da Linha'}
          >
            <Target size={13} />
          </button>

          {/* Botão de Expandir Painel de Ajuste Completo */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Abrir Controles Completos de Rolagem e Foco"
          >
            <Sliders size={13} />
          </button>
        </div>
      ) : (
        /* MODO EXPANDIDO (Painel Completo com Sliders, Presets e Passo a Passo) */
        <div 
          className={`w-72 sm:w-80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border space-y-3 transition-all ${
            stageMode
              ? 'bg-zinc-900/95 border-zinc-700/90 text-zinc-100 shadow-black/80'
              : 'bg-white/98 dark:bg-slate-900/98 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl'
          }`}
        >
          {/* CABEÇALHO DO DOCK */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isAutoScrolling ? 'bg-emerald-500/20 text-emerald-500 animate-pulse' : 'bg-amber-500/20 text-amber-500'
              }`}>
                <Gauge size={13} />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide">Rolagem & Foco Musical</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isAutoScrolling ? `Rolando a ${scrollSpeed.toFixed(1)}x (${Math.round(25 * scrollSpeed)} px/s)` : 'Rolagem pausada'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Minimizar painel"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* BOTÃO PRINCIPAL DE AÇÃO (PLAY / PAUSE GIGANTE) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={onToggleAutoScroll}
              className={`col-span-3 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isAutoScrolling
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold shadow-amber-500/30'
              }`}
            >
              {isAutoScrolling ? (
                <>
                  <Pause size={14} />
                  <span>Pausar Rolagem</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Iniciar Rolagem</span>
                </>
              )}
            </button>

            {onResetToTop && (
              <button
                type="button"
                onClick={onResetToTop}
                className="py-2.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Voltar ao início da canção"
              >
                <RotateCcw size={13} />
                <span className="text-[10px]">Topo</span>
              </button>
            )}
          </div>

          {/* CONTROLE DE VELOCIDADE: SLIDER + PRESETS */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Zap size={11} className="text-amber-500" /> Velocidade:
              </span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                {scrollSpeed.toFixed(1)}x
              </span>
            </div>

            {/* Slider de velocidade */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.25"
                value={scrollSpeed}
                onChange={(e) => onChangeScrollSpeed(parseFloat(e.target.value) || 1.0)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 font-mono">4.0x</span>
            </div>

            {/* Botões rápidos de velocidade */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {speedPresets.map(spd => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onChangeScrollSpeed(spd)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black font-mono transition cursor-pointer ${
                    Math.abs(scrollSpeed - spd) < 0.05
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* CONTROLES DE FOCO E NAVEGAÇÃO DE LINHAS */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Target size={12} className="text-amber-500" /> Linha Ativa & Guia:
              </span>
              <button
                type="button"
                onClick={onToggleFocusGuide}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition cursor-pointer ${
                  showFocusGuide
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {showFocusGuide ? 'Ativado' : 'Desativado'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {activeLineIndex !== null ? `Linha ${activeLineIndex + 1}` : 'Nenhuma selecionada'}
                {totalLines > 0 && <span className="opacity-60"> / {totalLines}</span>}
              </span>

              <div className="flex items-center gap-1">
                {onPrevLine && (
                  <button
                    type="button"
                    onClick={onPrevLine}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
                    title="Linha anterior (Seta Cima)"
                  >
                    <ChevronUp size={13} />
                  </button>
                )}
                {onNextLine && (
                  <button
                    type="button"
                    onClick={onNextLine}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
                    title="Próxima linha (Seta Baixo)"
                  >
                    <ChevronDown size={13} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight pt-0.5">
              Dica: Você também pode clicar diretamente em qualquer linha da cifra para focar nela.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
