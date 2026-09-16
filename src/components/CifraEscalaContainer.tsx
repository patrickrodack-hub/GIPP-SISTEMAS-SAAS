import React, { useState, useEffect } from 'react';
import { 
  Music, Sparkles, Layers, ArrowRightLeft, 
  ChevronDown, ChevronUp, Check, Info, 
  BookOpen, Hash
} from 'lucide-react';
import { 
  getScaleInfo, 
  getRelativeKey,
  MAJOR_MINOR_RELATIVE_PAIRS,
  CHROMATIC_SHARPS,
  CHROMATIC_MINORS_SHARPS,
  MusicalScaleInfo 
} from '../utils/musicChords';

export interface CifraEscalaContainerProps {
  currentKey: string;
  onTransposeToKey?: (newKey: string) => void;
  stageMode?: boolean;
  className?: string;
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

export const CifraEscalaContainer: React.FC<CifraEscalaContainerProps> = ({
  currentKey,
  onTransposeToKey,
  stageMode = false,
  className = '',
  defaultExpanded = true,
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedKey, setSelectedKey] = useState<string>(currentKey || 'C');
  const [viewChordMode, setViewChordMode] = useState<'triades' | 'tetrades'>('triades');
  const [scaleTypeTab, setScaleTypeTab] = useState<'maior' | 'menor'>('maior');
  const [minorScaleVariant, setMinorScaleVariant] = useState<'natural' | 'harmonica' | 'melodica'>('natural');

  // Sincroniza com a tonalidade atual da música se mudar externamente
  useEffect(() => {
    if (currentKey) {
      setSelectedKey(currentKey);
      const isMin = currentKey.toLowerCase().endsWith('m') && !currentKey.toLowerCase().endsWith('maj');
      setScaleTypeTab(isMin ? 'menor' : 'maior');
    }
  }, [currentKey]);

  const scaleInfo: MusicalScaleInfo = getScaleInfo(selectedKey);
  const relativeKey = scaleInfo.relativeKey;

  // Busca informações do par de relativas
  const relativePair = MAJOR_MINOR_RELATIVE_PAIRS.find(p => 
    p.major === selectedKey || p.minor === selectedKey ||
    p.major === scaleInfo.rootNote || p.minor === `${scaleInfo.rootNote}m`
  );

  const handleSelectKey = (key: string) => {
    setSelectedKey(key);
    const isMin = key.toLowerCase().endsWith('m') && !key.toLowerCase().endsWith('maj');
    setScaleTypeTab(isMin ? 'menor' : 'maior');
    if (onTransposeToKey) {
      onTransposeToKey(key);
    }
  };

  const handleToggleScaleType = (type: 'maior' | 'menor') => {
    setScaleTypeTab(type);
    if (type === 'menor' && !scaleInfo.isMinor) {
      // Se estava em maior e mudou para menor, seleciona a relativa menor
      const rel = scaleInfo.relativeKey;
      setSelectedKey(rel);
      if (onTransposeToKey) onTransposeToKey(rel);
    } else if (type === 'maior' && scaleInfo.isMinor) {
      // Se estava em menor e mudou para maior, seleciona a relativa maior
      const rel = scaleInfo.relativeKey;
      setSelectedKey(rel);
      if (onTransposeToKey) onTransposeToKey(rel);
    }
  };

  const handleSwitchToRelative = () => {
    if (relativeKey) {
      setSelectedKey(relativeKey);
      const isMin = relativeKey.toLowerCase().endsWith('m');
      setScaleTypeTab(isMin ? 'menor' : 'maior');
      if (onTransposeToKey) {
        onTransposeToKey(relativeKey);
      }
    }
  };

  return (
    <div 
      className={`cifra-escala-container rounded-2xl border transition-all select-none ${
        stageMode 
          ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100 shadow-md' 
          : 'bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-900/90 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
      } ${className}`}
    >
      {/* 1. CABEÇALHO PRINCIPAL DO PAINEL DE ESCALAS */}
      <div className={`p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 border-b ${
        stageMode ? 'border-zinc-800' : 'border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Music size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                Escalas Musicais & Campo Harmônico
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                scaleInfo.isMinor
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {scaleInfo.isMinor ? 'Tom Menor (Eólio)' : 'Tom Maior (Jônio)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Tom Selecionado: <strong className="text-violet-600 dark:text-violet-400 font-mono text-xs">{selectedKey}</strong>
              {relativePair && (
                <span className="hidden sm:inline ml-2 text-slate-400 dark:text-slate-500">
                  • {relativePair.accidentals}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CONTROLES RÁPIDOS DO CABEÇALHO */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SELETOR VISUAL MAIORES / MENORES (SEGMENTED CONTROL) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => handleToggleScaleType('maior')}
              className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                scaleTypeTab === 'maior'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🌟 Maiores</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleScaleType('menor')}
              className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                scaleTypeTab === 'menor'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🌙 Menores (Relativas)</span>
            </button>
          </div>

          {/* BOTÃO MUDAR PARA RELATIVA DIRETA */}
          <button
            type="button"
            onClick={handleSwitchToRelative}
            className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title={`Alternar para relativa direta: ${relativeKey}`}
          >
            <ArrowRightLeft size={12} className="text-violet-500" />
            <span className="hidden xs:inline">Relativa:</span>
            <strong className="font-mono">{relativeKey}</strong>
          </button>

          {/* BOTÃO APLICAR TOM NA CIFRA (SE TIVER HANDLER) */}
          {onTransposeToKey && selectedKey !== currentKey && (
            <button
              type="button"
              onClick={() => onTransposeToKey(selectedKey)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              title={`Transpor a cifra da música para ${selectedKey}`}
            >
              <Check size={12} />
              <span>Usar {selectedKey}</span>
            </button>
          )}

          {/* BOTÃO RECOLHER/EXPANDIR */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
              title={isExpanded ? "Recolher painel de escalas" : "Expandir painel de escalas"}
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. CONTEÚDO EXPANDÍVEL */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-4">
          {/* SELETOR DE NOTAS DA GRADE DE TONALIDADES (GRADE RESPONSIVA DE 12 NOTAS) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>
                {scaleTypeTab === 'maior' ? 'Selecione a Tonalidade Maior:' : 'Selecione a Tonalidade Menor (Relativa):'}
              </span>
              <span className="text-violet-600 dark:text-violet-400 font-mono text-[10px]">
                Fórmula: {scaleInfo.scaleFormula}
              </span>
            </div>

            {/* GRADE DE SELEÇÃO DOS 12 TONS */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1 sm:gap-1.5">
              {(scaleTypeTab === 'maior' ? CHROMATIC_SHARPS : CHROMATIC_MINORS_SHARPS).map((k) => {
                const isCurrent = selectedKey === k;
                const isSongKey = currentKey === k;
                // Encontra a relativa correspondente para exibir em subtexto
                const rel = getRelativeKey(k);

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleSelectKey(k)}
                    className={`p-1.5 sm:p-2 rounded-xl text-center transition-all cursor-pointer border relative flex flex-col items-center justify-center ${
                      isCurrent
                        ? scaleTypeTab === 'maior'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105 z-10'
                          : 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105 z-10'
                        : isSongKey
                        ? 'bg-violet-100 dark:bg-violet-950/70 border-violet-400 dark:border-violet-700 text-violet-900 dark:text-violet-200'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black font-mono leading-tight">
                      {k}
                    </span>
                    <span className={`text-[9px] font-bold ${
                      isCurrent ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {rel}
                    </span>

                    {/* Indicador se é o tom atual da música */}
                    {isSongKey && !isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500 ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRADE RESPONSIVA PRINCIPAL: NOTAS DA ESCALA DIATÔNICA (GRAUS I A VII) */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border ${
            stageMode 
              ? 'bg-zinc-800/70 border-zinc-700' 
              : 'bg-violet-50/40 dark:bg-slate-800/50 border-violet-200/70 dark:border-slate-700'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={13} className="text-violet-500" />
                  Notas da Escala de {scaleInfo.modeName}
                </span>
              </div>

              {/* Se for tom menor, permite alternar entre Menor Natural, Harmônica e Melódica */}
              {scaleInfo.isMinor && (
                <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setMinorScaleVariant('natural')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                      minorScaleVariant === 'natural' 
                        ? 'bg-amber-500 text-white font-black' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Natural
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinorScaleVariant('harmonica')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                      minorScaleVariant === 'harmonica' 
                        ? 'bg-amber-500 text-white font-black' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Harmônica (7º↑)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinorScaleVariant('melodica')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                      minorScaleVariant === 'melodica' 
                        ? 'bg-amber-500 text-white font-black' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Melódica (6º↑ 7º↑)
                  </button>
                </div>
              )}
            </div>

            {/* AS 7 NOTAS EM CARDS COM DESIGN DE GRADE RESPONSIVA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {(() => {
                let notesToDisplay = scaleInfo.scaleNotes;
                if (scaleInfo.isMinor && minorScaleVariant === 'harmonica' && scaleInfo.harmonicMinorNotes) {
                  notesToDisplay = scaleInfo.harmonicMinorNotes;
                } else if (scaleInfo.isMinor && minorScaleVariant === 'melodica' && scaleInfo.melodicMinorNotes) {
                  notesToDisplay = scaleInfo.melodicMinorNotes;
                }

                const degreeNames = ['I (Tônica)', 'II (Segunda)', 'III (Terça)', 'IV (Quarta)', 'V (Quinta)', 'VI (Sexta)', 'VII (Sétima)'];

                return notesToDisplay.map((note, idx) => (
                  <div 
                    key={idx}
                    className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-center shadow-2xs flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                      {degreeNames[idx].split(' ')[0]}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-violet-600 dark:text-violet-400 my-0.5">
                      {note}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                      {degreeNames[idx].split(' ')[1].replace(/[()]/g, '')}
                    </span>
                  </div>
                ));
              })()}
            </div>

            {/* PENTATÔNICA RÁPIDA EM FORMATO DE CHIPS */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Hash size={11} className="text-indigo-500" />
                Pentatônica {scaleInfo.isMinor ? 'Menor' : 'Maior'}:
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-indigo-600 dark:text-indigo-300">
                {scaleInfo.pentatonicNotes.map((p, i) => (
                  <span key={i} className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/80 shadow-2xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CAMPO HARMÔNICO COMPLETO EM GRADE (TRÍADES E TÉTRADES) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <Layers size={13} className="text-violet-600" />
                Campo Harmônico ({scaleInfo.key})
              </span>

              {/* Toggle Tríades / Tétrades */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                <button
                  type="button"
                  onClick={() => setViewChordMode('triades')}
                  className={`px-2 py-0.5 rounded font-black transition cursor-pointer ${
                    viewChordMode === 'triades'
                      ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Tríades
                </button>
                <button
                  type="button"
                  onClick={() => setViewChordMode('tetrades')}
                  className={`px-2 py-0.5 rounded font-black transition cursor-pointer ${
                    viewChordMode === 'tetrades'
                      ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Tétrades (7M / 7 / m7)
                </button>
              </div>
            </div>

            {/* GRADE RESPONSIVA DOS 7 GRAUS DO CAMPO HARMÔNICO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
              {scaleInfo.harmonicField.map((chord, idx) => {
                const chordName = viewChordMode === 'triades' ? chord.triad : chord.tetrad;
                return (
                  <div
                    key={idx}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center flex flex-col justify-between shadow-2xs transition-transform hover:-translate-y-0.5 ${
                      chord.quality === 'Maior'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200'
                        : chord.quality === 'Menor'
                        ? 'bg-blue-50/80 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800/70 text-blue-950 dark:text-blue-200'
                        : chord.quality === 'Dominante'
                        ? 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200'
                        : 'bg-purple-50/80 dark:bg-purple-950/25 border-purple-200 dark:border-purple-800/70 text-purple-950 dark:text-purple-200'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase opacity-75">
                      {chord.degree}
                    </span>
                    <span className="text-sm sm:text-base font-black font-mono my-0.5 tracking-tight">
                      {chordName}
                    </span>
                    <span className="text-[8px] font-bold opacity-80 leading-none">
                      {chord.quality}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
