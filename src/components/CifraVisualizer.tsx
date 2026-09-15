import React from 'react';
import { isChordLine, isChordToken } from '../utils/musicChords';

interface CifraVisualizerProps {
  cifraText: string;
  fontSize?: number;
  stageMode?: boolean;
  twoColumns?: boolean;
  highlightColor?: string; // default orange
  className?: string;
}

export const CifraVisualizer: React.FC<CifraVisualizerProps> = ({
  cifraText,
  fontSize = 13,
  stageMode = false,
  twoColumns = false,
  highlightColor = 'orange',
  className = ''
}) => {
  if (!cifraText || !cifraText.trim()) {
    return (
      <div className="p-8 text-center text-slate-400 italic font-medium">
        Nenhuma cifra ou letra cadastrada para esta canção.
      </div>
    );
  }

  const lines = cifraText.split('\n');

  // Cores personalizadas conforme o modo de exibição
  const orangeChordColor = stageMode 
    ? 'text-orange-400 dark:text-orange-400 font-black drop-shadow-xs' 
    : 'text-[#ea580c] dark:text-orange-400 font-extrabold';

  const sectionTagColor = stageMode 
    ? 'text-cyan-400 font-black' 
    : 'text-indigo-600 dark:text-indigo-400 font-extrabold';

  const lyricColor = stageMode 
    ? 'text-zinc-100 font-medium' 
    : 'text-slate-800 dark:text-slate-200 font-medium';

  // Renderiza uma única linha com detecção inteligente de acordes e preservação de espaços
  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();

    // Linha vazia
    if (!trimmed) {
      return <div key={index} className="h-4" />;
    }

    // Se for cabeçalho puro de seção ex: [Intro], [Verso 1], [Refrão], [Ponte], [Solo], [Final]
    if (/^\s*\[[^\]]+\]\s*$/.test(line)) {
      return (
        <div 
          key={index} 
          className={`py-1 my-1.5 font-mono ${sectionTagColor} border-b border-dashed border-slate-200 dark:border-slate-800 max-w-max`}
        >
          {line}
        </div>
      );
    }

    // Se for tag de seção com acordes ex: [Intro] G  Em  C  D
    if (/^\s*\[[^\]]+\]\s+[A-G]/.test(line)) {
      const parts = line.split(/(\[[^\]]+\]|\s+)/g).filter(Boolean);
      return (
        <div key={index} className="font-mono whitespace-pre leading-relaxed tracking-wider">
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
    if (/\[[A-G][#b]?[^\]]*\]/.test(line)) {
      const parts = line.split(/(\[[A-G][#b]?[^\]]*\])/g);
      return (
        <div key={index} className="font-mono whitespace-pre leading-relaxed tracking-wider">
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
    if (isChordLine(line)) {
      // Divide preservando tokens e todos os espaços exatos
      const parts = line.split(/(\s+)/g).filter(Boolean);
      return (
        <div key={index} className="font-mono whitespace-pre leading-snug tracking-wider">
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
            // Token desconhecido na linha de cifra
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
    return (
      <div key={index} className={`font-mono whitespace-pre leading-relaxed tracking-wider ${lyricColor}`}>
        {line}
      </div>
    );
  };

  return (
    <div 
      className={`cifra-visualizer-content font-mono select-text transition-all ${twoColumns ? 'columns-1 md:columns-2 gap-8' : ''} ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, idx) => renderLine(line, idx))}
    </div>
  );
};

export default CifraVisualizer;
