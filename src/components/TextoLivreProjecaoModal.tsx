import React, { useState, useContext } from 'react';
import { 
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Sparkles, Tv, Layers, Trash2, X, Check, Eye
} from 'lucide-react';
import { holyricsService } from '../services/holyricsService';
import { ChurchContext } from '../App';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAttachToLiturgy?: (texto: string) => void;
}

export const TextoLivreProjecaoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAttachToLiturgy
}) => {
  const { addToast } = useContext(ChurchContext) || {};

  const [titulo, setTitulo] = useState<string>('COMUNICADO');
  const [subtitulo, setSubtitulo] = useState<string>('Igreja Evangélica Assembleia de Deus');
  const [texto, setTexto] = useState<string>(
    'Sejam todos bem-vindos à Casa do Senhor!\n\nHoje é noite de louvor, adoração e ministração da Palavra de Deus. Abra o seu coração para receber o que o Espírito Santo tem preparado para sua vida.'
  );

  // Controles de formatação
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'>('2xl');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [colorTheme, setColorTheme] = useState<'gold' | 'white' | 'cyan' | 'emerald' | 'amber' | 'rose'>('gold');

  // Tema de Fundo do Telão
  const [fundoPreset, setFundoPreset] = useState<'navy' | 'dark' | 'royal' | 'amber'>('navy');
  const [justProjected, setJustProjected] = useState<boolean>(false);

  if (!isOpen) return null;

  // Projetar no Telão (mantém a janela aberta para operação contínua)
  const handleProjectLive = () => {
    if (!texto.trim()) {
      if (addToast) addToast('Digite algum texto antes de projetar!', 'error');
      return;
    }

    const finalTexto = isUppercase ? texto.toUpperCase() : texto;
    const finalTitulo = isUppercase ? titulo.toUpperCase() : titulo;

    holyricsService.projectCustomText(finalTitulo, finalTexto, {
      subtitulo,
      fontSize,
      align,
      bold: isBold,
      italic: isItalic,
      uppercase: isUppercase,
      colorTheme
    });

    setJustProjected(true);
    setTimeout(() => setJustProjected(false), 2200);

    if (addToast) {
      addToast('Texto livre projetado no Telão com sucesso!', 'success');
    }
  };

  // Anexar à Liturgia
  const handleAttachToLiturgy = () => {
    if (!texto.trim()) return;
    if (onAttachToLiturgy) {
      onAttachToLiturgy(texto);
    } else {
      const pulpitoState = holyricsService.getState().pulpito;
      holyricsService.attachTextToPulpitoBloco(pulpitoState.blocoAtivoIndex, texto);
    }
    if (addToast) addToast('Texto livre anexado ao roteiro da liturgia!', 'success');
    onClose();
  };

  const handleClear = () => {
    setTexto('');
    setTitulo('');
    setSubtitulo('');
  };

  // Classes de cor baseadas no tema selecionado
  const getColorClasses = () => {
    switch (colorTheme) {
      case 'gold': return 'text-amber-400';
      case 'cyan': return 'text-cyan-300';
      case 'emerald': return 'text-emerald-300';
      case 'amber': return 'text-orange-400';
      case 'rose': return 'text-rose-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div 
        className="bg-slate-950 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Editor Livre de Projeção
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Formatação em Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Digite avisos, mensagens, notas e transmita com estilo personalizado para o projetor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Fechar Janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO: EDITOR + PRÉ-VISUALIZAÇÃO */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* COLUNA ESQUERDA: EDITOR E BARRA DE FERRAMENTAS (6 COLUNAS) */}
          <div className="col-span-12 lg:col-span-6 border-r border-slate-800 p-5 flex flex-col space-y-4 overflow-y-auto">
            
            {/* Título e Subtítulo Opcionais */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Título Principal do Slide
                </label>
                <input
                  type="text"
                  placeholder="Ex: COMUNICADO DA DIRETORIA, AVISO IMPORTANTE..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Subtítulo / Rodapé (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ministério Pastoral • Atenção aos Obreiros"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* BARRA DE FERRAMENTAS DE FORMATAÇÃO */}
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Barra de Formatação Visual:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Alinhamento */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setAlign('left')}
                    className={`p-1.5 rounded-lg text-xs transition-all ${align === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Alinhar à Esquerda"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlign('center')}
                    className={`p-1.5 rounded-lg text-xs transition-all ${align === 'center' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Centralizar"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlign('right')}
                    className={`p-1.5 rounded-lg text-xs transition-all ${align === 'right' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Alinhar à Direita"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Estilos: Negrito, Itálico, Caixa Alta */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${isBold ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    title="Negrito"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`px-2 py-1 rounded-lg text-xs font-serif italic transition-all ${isItalic ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    title="Itálico"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsUppercase(!isUppercase)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${isUppercase ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    title="Caixa Alta (Maiúsculas)"
                  >
                    AA
                  </button>
                </div>

                {/* Tamanho da Fonte */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { val: 'sm', label: 'P' },
                    { val: 'base', label: 'M' },
                    { val: '2xl', label: 'G' },
                    { val: '3xl', label: 'GG' }
                  ].map((sz) => (
                    <button
                      key={sz.val}
                      onClick={() => setFontSize(sz.val as any)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${fontSize === sz.val ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores de Destaque */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Cor do Texto:</span>
                {[
                  { id: 'gold', bg: 'bg-amber-400', label: 'Dourado' },
                  { id: 'white', bg: 'bg-white', label: 'Branco' },
                  { id: 'cyan', bg: 'bg-cyan-400', label: 'Ciano' },
                  { id: 'emerald', bg: 'bg-emerald-400', label: 'Verde' },
                  { id: 'amber', bg: 'bg-orange-400', label: 'Laranja' },
                  { id: 'rose', bg: 'bg-rose-400', label: 'Vermelho' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorTheme(c.id as any)}
                    className={`w-5 h-5 rounded-full ${c.bg} transition-all border-2 ${colorTheme === c.id ? 'border-white scale-125' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* ÁREA DE TEXTO LIVRE */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Corpo do Texto a Projetar:
                </label>
                <button
                  onClick={handleClear}
                  className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              </div>
              <textarea
                rows={8}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Digite aqui livremente o texto que deseja exibir no telão..."
                className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-amber-400 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* COLUNA DIREITA: SIMULADOR DO TELÃO EM TEMPO REAL (6 COLUNAS) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-between p-5 bg-slate-900/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-amber-400" /> Prévia Exata do Telão
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Projetor 16:9
                </span>
              </div>

              {/* SIMULADOR DO TELÃO */}
              <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                {/* Header do Slide */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-2">
                  <span className="font-bold uppercase tracking-widest text-amber-400">
                    {subtitulo || 'Assembleia de Deus'}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">Holyrics AO VIVO</span>
                </div>

                {/* Conteúdo Central */}
                <div className={`my-auto py-2 ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>
                  {titulo && (
                    <h2 className={`font-black tracking-tight mb-3 drop-shadow-md ${getColorClasses()} ${
                      fontSize === '3xl' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                    }`}>
                      {isUppercase ? titulo.toUpperCase() : titulo}
                    </h2>
                  )}

                  <p className={`whitespace-pre-line leading-relaxed drop-shadow-md ${
                    isBold ? 'font-black' : 'font-normal'
                  } ${isItalic ? 'italic font-serif' : ''} ${
                    fontSize === 'sm' ? 'text-xs sm:text-sm' :
                    fontSize === 'base' ? 'text-sm sm:text-base' :
                    fontSize === '2xl' ? 'text-base sm:text-xl' : 'text-lg sm:text-2xl'
                  } ${getColorClasses()}`}>
                    {isUppercase ? texto.toUpperCase() : texto}
                  </p>
                </div>

                {/* Footer do Slide */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-white/10 pt-1.5">
                  <span>Projeção Digital do Culto</span>
                  <span>{texto.length} caracteres</span>
                </div>
              </div>

              {/* Modelos de Textos Frequentes para Igrejas */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Modelos Rápidos Pré-configurados:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Boas-Vindas aos Visitantes',
                      tit: 'SEJAM BEM-VINDOS!',
                      sub: 'Família Assembleia de Deus',
                      txt: 'A paz do Senhor Jesus a todos os irmãos e queridos visitantes! É uma alegria imensa tê-los conosco nesta celebração.'
                    },
                    {
                      label: 'Consagração de Dízimos',
                      tit: 'DÍZIMOS E OFERTAS',
                      sub: 'Momento de Gratidão e Adoração',
                      txt: '“Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.” (2 Co 9:7)'
                    },
                    {
                      label: 'Aviso de Veículo Estacionado',
                      tit: 'COMUNICADO DE ESTACIONAMENTO',
                      sub: 'Atenção Motoristas',
                      txt: 'Pedimos a gentileza de verificar os veículos estacionados na entrada lateral para liberação de passagem dos pedestres.'
                    },
                    {
                      label: 'Santa Ceia do Senhor',
                      tit: 'SANTA CEIA DO SENHOR',
                      sub: 'Em Memória de Cristo',
                      txt: '“Fazei isto em memória de mim. Porque todas as vezes que comerdes este pão e beberdes este cálice anunciais a morte do Senhor, até que venha.”'
                    }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitulo(tpl.tit);
                        setSubtitulo(tpl.sub);
                        setTexto(tpl.txt);
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-bold text-slate-300 hover:text-amber-300 border border-slate-800 transition-all truncate"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AÇÕES DE DISPARO */}
            <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={handleProjectLive}
                className={`w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                  justProjected
                    ? 'bg-emerald-600 text-white shadow-emerald-950/60 ring-2 ring-emerald-400 animate-pulse'
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/60'
                }`}
                title="Transmitir texto livre imediatamente ao Telão (2º monitor)"
              >
                {justProjected ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Texto No Ar no Telão! (Transmitindo)</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Projetar Agora no Telão (Ao Vivo)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAttachToLiturgy}
                  className="flex-1 py-2.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Salvar na Liturgia
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer hover:bg-slate-800 rounded-xl transition-all"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
