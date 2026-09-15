import React from 'react';
import { isChordLine, isChordToken } from '../utils/musicChords';

export interface CifraVisualizerProps {
  cifraText: string;
  fontSize?: number;
  stageMode?: boolean;
  twoColumns?: boolean;
  highlightColor?: string; // default orange
  className?: string;
  activeLineIndex?: number | null;
  onLineClick?: (index: number) => void;
  showFocusGuide?: boolean;
  showVerticalCursor?: boolean;
}

export const CifraVisualizer: React.FC<CifraVisualizerProps> = ({
  cifraText,
  fontSize = 13,
  stageMode = false,
  twoColumns = false,
  highlightColor = 'orange',
  className = '',
  activeLineIndex = null,
  onLineClick,
  showFocusGuide = true,
  showVerticalCursor = true
}) => {
  if (!cifraText || !cifraText.trim()) {
    return (
      <div className="p-8 text-center text-slate-400 italic font-medium">
        Nenhuma cifra ou letra cadastrada para esta canção.
      </div>
    );
  }

  const lines = cifraText.split('\n');

  // Cores personalizadas padrão
  const defaultOrangeChordColor = stageMode 
    ? 'text-orange-400 dark:text-orange-400 font-black drop-shadow-xs' 
    : 'text-[#ea580c] dark:text-orange-400 font-extrabold';

  const defaultSectionTagColor = stageMode 
    ? 'text-cyan-400 font-black' 
    : 'text-indigo-600 dark:text-indigo-400 font-extrabold';

  const defaultLyricColor = stageMode 
    ? 'text-zinc-100 font-medium' 
    : 'text-slate-800 dark:text-slate-200 font-medium';

  // Renderiza uma única linha com detecção inteligente de acordes e preservação de espaços
  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    const isActive = showFocusGuide && activeLineIndex === index;

    // Cores dinâmicas quando a linha está com o realce de foco ativo
    const orangeChordColor = isActive 
      ? 'text-amber-500 dark:text-amber-300 font-black drop-shadow-sm text-[1.03em]' 
      : defaultOrangeChordColor;

    const sectionTagColor = isActive
      ? 'text-cyan-400 dark:text-cyan-300 font-black drop-shadow-xs'
      : defaultSectionTagColor;

    const lyricColor = isActive 
      ? (stageMode ? 'text-white font-bold' : 'text-slate-950 dark:text-white font-bold') 
      : defaultLyricColor;

    // Linha vazia
    if (!trimmed) {
      return (
        <div 
          key={index} 
          data-line-index={index}
          onClick={() => onLineClick && onLineClick(index)}
          className={`h-4 transition-colors ${onLineClick ? 'cursor-pointer hover:bg-slate-500/5' : ''}`} 
        />
      );
    }

    let lineContent: React.ReactNode = null;

    // Se for cabeçalho puro de seção ex: [Intro], [Verso 1], [Refrão], [Ponte], [Solo], [Final]
    if (/^\s*\[[^\]]+\]\s*$/.test(line)) {
      lineContent = (
        <div className={`py-0.5 my-1 font-mono ${sectionTagColor} border-b border-dashed border-slate-300 dark:border-slate-800 max-w-max tracking-wide`}>
          {line}
        </div>
      );
    }
    // Se for tag de seção com acordes ex: [Intro] G  Em  C  D
    else if (/^\s*\[[^\]]+\]\s+[A-G]/.test(line)) {
      const parts = line.split(/(\[[^\]]+\]|\s+)/g).filter(Boolean);
      lineContent = (
        <div className="font-mono whitespace-pre leading-relaxed tracking-wider">
          {parts.map((part, i) => {
            if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
            if (/^\[[^\]]+\]$/.test(part)) {
              return <span key={i} className={sectionTagColor}>{part}</span>;
            }
            if (isChordToken(part)) {
              return <span key={i} className={orangeChordColor}>{part}</span>;
            }
            return <span key={i} className={lyricColor}>{part}</span>;
          })}
        </div>
      );
    }
    // Se a linha contiver acordes embutidos entre colchetes ex: "Santo [G] és meu [D] Deus"
    else if (/\[[A-G][#b]?[^\]]*\]/.test(line)) {
      const parts = line.split(/(\[[A-G][#b]?[^\]]*\])/g);
      lineContent = (
        <div className="font-mono whitespace-pre leading-relaxed tracking-wider">
          {parts.map((part, i) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const chord = part.slice(1, -1);
              return (
                <span key={i} className={orangeChordColor}>
                  [{chord}]
                </span>
              );
            }
            return <span key={i} className={lyricColor}>{part}</span>;
          })}
        </div>
      );
    }
    // Se for uma linha pura ou predominante de acordes sobrepostos à letra
    else if (isChordLine(line)) {
      const parts = line.split(/(\s+)/g).filter(Boolean);
      lineContent = (
        <div className="font-mono whitespace-pre leading-snug tracking-wider">
          {parts.map((part, i) => {
            if (/^\s+$/.test(part)) {
              return <span key={i}>{part}</span>;
            }
            if (isChordToken(part)) {
              return (
                <span key={i} className={orangeChordColor}>
                  {part}
                </span>
              );
            }
            return (
              <span key={i} className={stageMode ? 'text-zinc-400' : 'text-slate-600 dark:text-slate-400'}>
                {part}
              </span>
            );
          })}
        </div>
      );
    }
    // Linha normal de letra
    else {
      lineContent = (
        <div className={`font-mono whitespace-pre leading-relaxed tracking-wider ${lyricColor}`}>
          {line}
        </div>
      );
    }

    return (
      <div 
        key={index}
        data-line-index={index}
        onClick={() => onLineClick && onLineClick(index)}
        className={`group relative rounded-lg transition-all duration-150 ${
          onLineClick ? 'cursor-pointer' : ''
        } ${
          isActive
            ? stageMode
              ? 'bg-amber-500/20 text-amber-100 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.5)] pl-4 pr-3 py-1 my-1 ring-1 ring-amber-400/40'
              : 'bg-amber-100/90 dark:bg-amber-950/60 text-slate-950 dark:text-amber-100 shadow-xs ring-1 ring-amber-400 dark:ring-amber-500 pl-4 pr-3 py-1 my-1'
            : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40 px-2 py-0.5'
        }`}
        title={onLineClick ? 'Clique para focar nesta linha' : undefined}
      >
        {/* CURSOR DE FOCO VERTICAL / INDICADOR VISUAL NA LINHA ATIVA */}
        {isActive && (
          <div className="absolute -left-2 top-0 bottom-0 flex items-center select-none pointer-events-none">
            <span className="w-1.5 h-4/5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 ml-1 drop-shadow-xs">▶</span>
          </div>
        )}
        {lineContent}
      </div>
    );
  };

  return (
    <div 
      className={`cifra-container cifra-visualizer-content font-mono select-text transition-all relative ${
        showVerticalCursor ? 'pl-3' : ''
      } ${twoColumns ? 'columns-1 md:columns-2 gap-8' : ''} ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* TRILHO VERTICAL GUIA DE LEITURA (CURSOR VERTICAL) */}
      {showVerticalCursor && (
        <div 
          className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none rounded-full"
          title="Trilho de foco vertical"
        />
      )}

      {lines.map((line, idx) => renderLine(line, idx))}
    </div>
  );
};

export default CifraVisualizer;
