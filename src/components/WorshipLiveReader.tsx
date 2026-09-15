import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, X, Sun, Moon, Columns, 
  Play, Pause, ArrowUp, ArrowDown, Music, Sparkles, Mic,
  List, Sliders, ChevronDown
} from 'lucide-react';
import { 
  SetlistCulto, SetlistMusicaItem, MusicaRepertorio 
} from '../data/repertorioData';
import { 
  transposeChordSheet, transposeNote, CHROMATIC_SHARPS, getSemitoneDifference 
} from '../utils/musicChords';
import { WorshipMetronome } from './WorshipMetronome';

interface WorshipLiveReaderProps {
  setlist: SetlistCulto;
  initialItemIndex?: number;
  allMusicas: MusicaRepertorio[];
  onClose: () => void;
}

export const WorshipLiveReader: React.FC<WorshipLiveReaderProps> = ({
  setlist,
  initialItemIndex = 0,
  allMusicas,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialItemIndex);
  const [stageMode, setStageMode] = useState<boolean>(() => {
    return localStorage.getItem('gipp_repertorio_stage_mode') === 'true';
  });
  const [twoColumns, setTwoColumns] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(15);
  const [showMetronome, setShowMetronome] = useState<boolean>(false);
  const [showIndexMenu, setShowIndexMenu] = useState<boolean>(false);

  // Manual transposition offset applied on top of tom_culto
  const [liveSemitonesOffset, setLiveSemitonesOffset] = useState<number>(0);

  // Auto-scroll state
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1 = lento, 2 = médio, 3 = rápido
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimRef = useRef<number | null>(null);

  const currentItem: SetlistMusicaItem | undefined = setlist.itens[currentIndex];
  
  // Find full song data from catalog to get chords
  const fullSongData: MusicaRepertorio | undefined = allMusicas.find(
    m => m.id === currentItem?.musica_id || m.titulo.toLowerCase().trim() === currentItem?.titulo.toLowerCase().trim()
  );

  // Reset live offset when switching songs
  useEffect(() => {
    setLiveSemitonesOffset(0);
    setIsAutoScrolling(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Space for scroll, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentIndex < setlist.itens.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsAutoScrolling(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, setlist.itens.length, onClose]);

  // Auto-scroll engine
  useEffect(() => {
    if (!isAutoScrolling || !scrollContainerRef.current) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    let lastTime = performance.now();
    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollContainerRef.current) {
        const pxPerSecond = scrollSpeed === 1 ? 22 : scrollSpeed === 2 ? 45 : 75;
        const scrollDelta = (pxPerSecond * delta) / 1000;
        scrollContainerRef.current.scrollTop += scrollDelta;

        const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
        if (scrollContainerRef.current.scrollTop >= maxScroll - 2) {
          setIsAutoScrolling(false);
          return;
        }
      }
      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-base text-slate-400">Nenhuma música cadastrada nesta Setlist.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl font-bold text-xs">
          Voltar
        </button>
      </div>
    );
  }

  // Base key calculation:
  // We determine base transposition from song's original key to tom_culto, plus any live offset.
  const originalKey = fullSongData?.tom || currentItem.tom_original || 'C';
  const targetCultoKey = currentItem.tom_culto || originalKey;
  const cultoDiff = getSemitoneDifference(originalKey, targetCultoKey);
  const totalTranspose = (cultoDiff + liveSemitonesOffset) % 12;

  // Compute current display key
  const effectiveCurrentKey = transposeNote(originalKey, totalTranspose);

  // Transpose chords
  const rawChords = fullSongData?.letra_cifra || 'Cifra ainda não cadastrada para esta canção.';
  const transposedChords = transposeChordSheet(rawChords, totalTranspose);

  const toggleStageMode = () => {
    setStageMode(prev => {
      const next = !prev;
      try { localStorage.setItem('gipp_repertorio_stage_mode', String(next)); } catch (_) {}
      return next;
    });
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-200 ${
      stageMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* TOP HEADER CONTROLS */}
      <header className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 select-none shadow-md backdrop-blur-md">
        {/* Left: Service Title & Navigation Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Fechar Modo Culto (Esc)"
          >
            <X size={18} />
          </button>

          {/* Quick Dropdown Song Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIndexMenu(!showIndexMenu)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-black text-amber-400 transition"
            >
              <span>{currentIndex + 1} / {setlist.itens.length}</span>
              <span className="truncate max-w-[120px] sm:max-w-[180px] text-white font-bold">{currentItem.titulo}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showIndexMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 mb-1 border-b border-slate-800">
                  Ordem do Culto ({setlist.tipo_culto})
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {setlist.itens.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowIndexMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition ${
                        idx === currentIndex
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[11px] opacity-75 font-bold">{idx + 1}.</span>
                        <span className="truncate font-bold">{item.titulo}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-black/20 shrink-0">
                        {item.tom_culto || item.tom_original}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Liturgical Moment Pill */}
          {currentItem.momento_liturgico && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              <Sparkles size={11} className="text-indigo-400" />
              {currentItem.momento_liturgico}
            </span>
          )}

          {/* Vocal Minister */}
          {currentItem.ministro_vocal && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-lg">
              <Mic size={11} className="text-amber-400" />
              {currentItem.ministro_vocal}
            </span>
          )}
        </div>

        {/* Center: Previous / Next Song Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black text-white transition active:scale-95"
            title="Música Anterior (Seta Esquerda)"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            type="button"
            disabled={currentIndex >= setlist.itens.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black transition active:scale-95 shadow-sm"
            title="Próxima Música (Seta Direita)"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Key Controls, Metronome, Auto-Scroll, Stage Mode */}
        <div className="flex items-center gap-1.5">
          {/* Key Selector & Transpose Buttons */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Tom:</span>
            <span className="font-mono font-black text-xs text-amber-400 min-w-[24px] text-center">
              {effectiveCurrentKey}
            </span>
            <button
              type="button"
              onClick={() => setLiveSemitonesOffset(prev => prev - 1)}
              className="w-5 h-5 rounded hover:bg-slate-700 text-slate-300 font-black text-xs flex items-center justify-center transition"
              title="Baixar 1 semitom (-1)"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setLiveSemitonesOffset(prev => prev + 1)}
              className="w-5 h-5 rounded hover:bg-slate-700 text-slate-300 font-black text-xs flex items-center justify-center transition"
              title="Subir 1 semitom (+1)"
            >
              +
            </button>
            {liveSemitonesOffset !== 0 && (
              <button
                type="button"
                onClick={() => setLiveSemitonesOffset(0)}
                className="text-[9px] text-amber-400 underline ml-0.5"
                title="Voltar ao tom programado do culto"
              >
                Reset
              </button>
            )}
          </div>

          {/* Compact Metronome / Tap */}
          <div className="hidden sm:block">
            <WorshipMetronome
              compact
              initialBpm={currentItem.bpm || fullSongData?.bpm || 72}
            />
          </div>

          {/* Auto-Scroll Controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition ${
                isAutoScrolling ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Rolar Cifra Automaticamente (Barra de Espaço)"
            >
              {isAutoScrolling ? <Pause size={13} /> : <Play size={13} />}
              <span className="hidden md:inline">{isAutoScrolling ? 'Pausar' : 'Rolar'}</span>
            </button>
            {isAutoScrolling && (
              <div className="flex gap-0.5 px-1">
                {([1, 2, 3] as const).map(spd => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setScrollSpeed(spd)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                      scrollSpeed === spd ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 rounded-xl px-1.5 py-1 text-slate-300 text-xs">
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              className="px-1.5 py-0.5 hover:text-white font-bold"
              title="Diminuir Fonte"
            >
              A-
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1">{fontSize}</span>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
              className="px-1.5 py-0.5 hover:text-white font-bold"
              title="Aumentar Fonte"
            >
              A+
            </button>
          </div>

          {/* Two-Columns Toggle */}
          <button
            type="button"
            onClick={() => setTwoColumns(!twoColumns)}
            className={`hidden lg:flex p-1.5 rounded-xl border transition ${
              twoColumns ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Visualização em 2 Colunas"
          >
            <Columns size={16} />
          </button>

          {/* Stage Mode (High Contrast Dark) */}
          <button
            type="button"
            onClick={toggleStageMode}
            className={`p-1.5 rounded-xl border transition ${
              stageMode ? 'bg-amber-400 border-amber-300 text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={stageMode ? 'Modo Palco Ativado (Alto Contraste)' : 'Ativar Modo Palco'}
          >
            {stageMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* ARRANGEMENT & TRANSITION NOTICE BANNER */}
      {currentItem.notas_arranjo && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 flex items-start gap-2.5 text-amber-200 text-xs shrink-0 backdrop-blur-xs">
          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-black uppercase tracking-wider text-[11px] text-amber-400 mr-2">
              Diretrizes de Arranjo & Transição:
            </strong>
            <span className="font-semibold text-slate-100">{currentItem.notas_arranjo}</span>
          </div>
          {currentItem.duracao_minutos && (
            <span className="text-[11px] font-bold text-amber-300/80 bg-black/30 px-2 py-0.5 rounded shrink-0">
              ⏱ {currentItem.duracao_minutos} min
            </span>
          )}
        </div>
      )}

      {/* CHORD & LYRICS SHEET DISPLAY AREA */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-12 py-6 scroll-smooth select-text"
      >
        <div className={`max-w-5xl mx-auto ${twoColumns ? 'columns-1 lg:columns-2 gap-8' : ''}`}>
          {/* Song Header Info on Paper */}
          <div className="mb-6 pb-4 border-b border-slate-800 break-inside-avoid">
            <div className="flex flex-wrap justify-between items-baseline gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {currentItem.titulo}
                </h1>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">
                  {currentItem.artista || fullSongData?.artista || 'Louvor Congregacional'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg">
                  Tom: {effectiveCurrentKey}
                  {currentItem.tom_culto !== originalKey && (
                    <span className="opacity-75 text-[10px] ml-1 font-semibold">(Orig: {originalKey})</span>
                  )}
                </span>
                {(currentItem.bpm || fullSongData?.bpm) && (
                  <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    {currentItem.bpm || fullSongData?.bpm} BPM
                  </span>
                )}
                {(currentItem.ritmo || fullSongData?.ritmo) && (
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    {currentItem.ritmo || fullSongData?.ritmo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CHORDS BODY */}
          <pre
            style={{ fontSize: `${fontSize}px` }}
            className={`font-mono leading-relaxed whitespace-pre-wrap transition-all select-text pb-24 ${
              stageMode ? 'text-amber-100 font-medium' : 'text-slate-200'
            }`}
          >
            {transposedChords}
          </pre>
        </div>
      </main>

      {/* FOOTER SERVICE PROGRESS BAR */}
      <footer className="px-4 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 truncate max-w-[200px] sm:max-w-md">
            {setlist.titulo}
          </span>
          <span className="text-[11px] text-slate-500">• {setlist.data.split('-').reverse().join('/')}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            Música {currentIndex + 1} de {setlist.itens.length}
          </span>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / setlist.itens.length) * 100}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
