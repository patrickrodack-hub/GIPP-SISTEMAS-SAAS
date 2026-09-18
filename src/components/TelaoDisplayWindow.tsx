import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize, Minimize, Bell, Clock, Shield, Flame, 
  Volume2, Eye, EyeOff, Radio, Tv, Sparkles, ChevronRight, AlertTriangle, Car, Baby
} from 'lucide-react';
import { 
  holyricsService, 
  HolyricsState, 
  HolyricsSlide, 
  HolyricsAlert,
  HolyricsTheme 
} from '../services/holyricsService';

export const TelaoDisplayWindow: React.FC = () => {
  const [state, setState] = useState<HolyricsState>(holyricsService.getState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHud, setShowHud] = useState(false);
  const hudTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronização em tempo real com o motor Holyrics
  useEffect(() => {
    const unsubscribe = holyricsService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Relógio do Telão
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // HUD auto-hide ao mover o mouse
  const handleMouseMove = () => {
    setShowHud(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => {
      setShowHud(false);
    }, 3500);
  };

  // Atalhos de teclado no Telão
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        holyricsService.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        holyricsService.prevSlide();
      } else if (e.key === 'b' || e.key === 'B') {
        holyricsService.toggleBlackout();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        holyricsService.toggleShowLogo();
      } else if (e.key === 'c' || e.key === 'C') {
        holyricsService.toggleClearText();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const currentSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual] || state.slides[0];
  const nextSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual + 1];

  // Temas Visuais para Telão
  const getThemeStyles = (theme: HolyricsTheme) => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-black',
          textColor: 'text-white',
          accentColor: 'text-amber-400',
          badgeBg: 'bg-zinc-900/90 text-amber-300 border-zinc-700',
          verseColor: 'text-amber-300',
          glowEffect: 'shadow-[0_0_50px_rgba(0,0,0,0.9)]'
        };
      case 'amber':
        return {
          bg: 'bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950',
          textColor: 'text-amber-50',
          accentColor: 'text-amber-400',
          badgeBg: 'bg-amber-900/50 text-amber-200 border-amber-700/50',
          verseColor: 'text-amber-300',
          glowEffect: 'shadow-[0_0_60px_rgba(245,158,11,0.15)]'
        };
      case 'clean':
        return {
          bg: 'bg-gradient-to-br from-slate-100 via-white to-slate-200',
          textColor: 'text-slate-900',
          accentColor: 'text-indigo-700',
          badgeBg: 'bg-white text-indigo-700 border-slate-300 shadow-md',
          verseColor: 'text-indigo-800',
          glowEffect: 'shadow-[0_0_40px_rgba(0,0,0,0.06)]'
        };
      case 'royal':
        return {
          bg: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950',
          textColor: 'text-white',
          accentColor: 'text-purple-300',
          badgeBg: 'bg-purple-900/50 text-purple-200 border-purple-700/50',
          verseColor: 'text-amber-300',
          glowEffect: 'shadow-[0_0_60px_rgba(168,85,247,0.15)]'
        };
      case 'cinema':
        return {
          bg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black',
          textColor: 'text-slate-100',
          accentColor: 'text-cyan-400',
          badgeBg: 'bg-slate-900/80 text-cyan-300 border-slate-700',
          verseColor: 'text-cyan-300',
          glowEffect: 'shadow-[0_0_70px_rgba(6,182,212,0.1)]'
        };
      case 'navy':
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
          textColor: 'text-white',
          accentColor: 'text-amber-400',
          badgeBg: 'bg-slate-900/80 text-amber-300 border-slate-800',
          verseColor: 'text-amber-300',
          glowEffect: 'shadow-[0_0_60px_rgba(234,179,8,0.12)]'
        };
    }
  };

  const currentTheme = getThemeStyles(state.tema);

  // Formatação de Tempo
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Renderização do Modo Retorno de Palco (Stage Display para Pregador / Louvor)
  if (state.modoRetornoPalco) {
    return (
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onDoubleClick={toggleFullscreen}
        className="fixed inset-0 bg-black text-white font-sans select-none flex flex-col p-6 overflow-hidden"
      >
        {/* Topo do Retorno: Relógio e Cronômetro */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-widest uppercase text-zinc-400">RETORNO DE PALCO • GIPP HOLYRICS</span>
          </div>

          <div className="flex items-center gap-8">
            {state.cronometro.ativo && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 px-5 py-2 rounded-2xl">
                <Clock className="w-5 h-5 text-rose-400 animate-pulse" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-300">{state.cronometro.rotulo}</div>
                  <div className="text-3xl font-black font-mono text-rose-400">
                    {formatTimer(state.cronometro.tempoRestanteSegundos)}
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Horário Oficial</div>
              <div className="text-4xl font-black font-mono text-amber-400">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Centro do Retorno: Slide Atual em Destaque Gigante */}
        <div className="flex-1 grid grid-cols-12 gap-6 my-6 overflow-hidden">
          <div className="col-span-8 flex flex-col justify-center bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 overflow-y-auto">
            <div className="text-xs font-black tracking-widest text-amber-400 uppercase mb-3">
              [ NO TELÃO AGORA • SLIDE {state.indiceAtual + 1} DE {state.slides.length} ]
            </div>
            
            {state.blackout ? (
              <div className="text-3xl font-black text-rose-500 bg-rose-950/20 p-6 rounded-2xl border border-rose-900/40">
                ⚠️ BLACKOUT ATIVO NO TELÃO (TELA PRETA)
              </div>
            ) : state.limparTexto ? (
              <div className="text-2xl font-bold text-zinc-500">
                [ TEXTO LIMPO NO TELÃO — FUNDO / LOGO ATIVO ]
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-black text-zinc-300 mb-4">{currentSlide?.titulo}</h1>
                {currentSlide?.subtitulo && (
                  <h2 className="text-xl font-bold text-amber-400/90 mb-4">{currentSlide.subtitulo}</h2>
                )}
                {currentSlide?.versiculo ? (
                  <div className="text-3xl font-bold text-white leading-relaxed">
                    "{currentSlide.versiculo.texto}"
                    <div className="text-xl text-amber-400 mt-3">— {currentSlide.versiculo.referencia}</div>
                  </div>
                ) : currentSlide?.texto ? (
                  <p className="text-3xl font-bold text-white whitespace-pre-line leading-relaxed">
                    {currentSlide.texto}
                  </p>
                ) : currentSlide?.pontos ? (
                  <ul className="space-y-3">
                    {currentSlide.pontos.map((pt, idx) => (
                      <li key={idx} className="text-2xl font-bold text-white flex items-start gap-3">
                        <span className="text-amber-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            {currentSlide?.notas && (
              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  Notas do Preletor:
                </span>
                <p className="text-sm text-zinc-400 mt-2 italic">{currentSlide.notas}</p>
              </div>
            )}
          </div>

          {/* Lateral do Retorno: Próximo Slide */}
          <div className="col-span-4 flex flex-col justify-between bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
            <div>
              <div className="text-[11px] font-black tracking-widest text-zinc-400 uppercase mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400" />
                A SEGUIR (PRÓXIMO SLIDE):
              </div>
              {nextSlide ? (
                <div className="bg-black/60 p-5 rounded-2xl border border-zinc-800">
                  <div className="text-sm font-bold text-zinc-400 mb-1">{nextSlide.titulo}</div>
                  {nextSlide.subtitulo && (
                    <div className="text-xs text-amber-400/80 mb-2">{nextSlide.subtitulo}</div>
                  )}
                  <p className="text-base text-zinc-200 line-clamp-6 whitespace-pre-line leading-relaxed">
                    {nextSlide.versiculo ? nextSlide.versiculo.texto : nextSlide.texto || nextSlide.pontos?.join('\n')}
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-600 font-bold text-sm">
                  [ Fim da Apresentação ]
                </div>
              )}
            </div>

            <div className="text-xs text-zinc-500 pt-4 border-t border-zinc-800 flex justify-between">
              <span>{state.tituloApresentacao}</span>
              <span>Modo Retorno</span>
            </div>
          </div>
        </div>

        {/* Rodapé Retorno com Alerta */}
        {state.alertaAtivo && (
          <div className="bg-amber-500 text-black px-6 py-2.5 rounded-2xl flex items-center justify-between font-black text-sm">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              ALERTA NO TELÃO: {state.alertaAtivo.texto}
            </span>
            <span className="text-xs uppercase bg-black/20 px-2 py-0.5 rounded">Ativo</span>
          </div>
        )}
      </div>
    );
  }

  // Renderização Principal do Telão / Projetor
  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
      className={`fixed inset-0 ${currentTheme.bg} ${currentTheme.textColor} font-sans select-none flex flex-col justify-between overflow-hidden transition-colors duration-500`}
      style={{
        backgroundImage: state.fundoCustomUrl ? `url(${state.fundoCustomUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* HUD de Controle Rápido (Auto-hide ao ficar ocioso) */}
      <div 
        className={`absolute top-4 right-4 z-50 flex items-center gap-2 transition-opacity duration-300 ${showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={() => holyricsService.toggleStageDisplay()}
          title="Alternar Modo Retorno de Palco"
          className="bg-black/60 hover:bg-black/90 text-white text-xs px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all"
        >
          <Tv className="w-3.5 h-3.5 text-amber-400" />
          Retorno
        </button>

        <button 
          onClick={toggleFullscreen}
          title="Alternar Tela Cheia (F11)"
          className="bg-black/60 hover:bg-black/90 text-white text-xs px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          {isFullscreen ? 'Sair' : 'Tela Cheia'}
        </button>
      </div>

      {/* ESTADO 1: BLACKOUT (Tela Totalmente Preta) */}
      {state.blackout && (
        <div 
          onClick={() => holyricsService.setBlackout(false)}
          className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center cursor-pointer select-none"
        >
          <div className="opacity-0 hover:opacity-100 transition-opacity text-center text-zinc-700 text-xs font-mono tracking-widest uppercase">
            [ BLACKOUT ATIVO NO TELÃO • CLIQUE OU APERTE 'B' PARA RESTAURAR ]
          </div>
        </div>
      )}

      {/* ESTADO 2: EXIBIR LOGO DA IGREJA EM DESTAQUE */}
      {state.exibirLogo && !state.blackout && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center bg-black/40 backdrop-blur-xs">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border-2 border-amber-400/40 flex items-center justify-center p-6 shadow-2xl mb-8 animate-pulse">
            {state.igrejaLogoUrl ? (
              <img src={state.igrejaLogoUrl} alt="Logo Igreja" className="max-h-full object-contain" />
            ) : (
              <Shield className="w-24 h-24 text-amber-400" />
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-wider uppercase text-white drop-shadow-lg">
            {state.igrejaNome}
          </h1>
          <p className="text-lg md:text-2xl text-amber-400/90 font-medium tracking-widest mt-3 uppercase">
            Comunhão • Palavra • Louvor • Adoração
          </p>
        </div>
      )}

      {/* ESTADO 3: CONTEÚDO DO SLIDE REGULAR (OU MODO LIMPO) */}
      <div 
        className={`flex-1 flex flex-col ${state.modoLowerThird ? 'justify-end pb-12 px-12' : 'justify-center items-center px-12 md:px-24'} z-10 transition-all duration-300 ${state.limparTexto || state.exibirLogo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {state.modoLowerThird ? (
          /* Modo Lower Third para OBS e Live Streaming */
          <div className="w-full max-w-5xl mx-auto bg-slate-950/85 backdrop-blur-md border-l-4 border-amber-400 p-6 rounded-r-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                {currentSlide?.titulo}
              </span>
              {currentSlide?.subtitulo && (
                <span className="text-xs text-slate-400">{currentSlide.subtitulo}</span>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white leading-snug drop-shadow-md">
              {currentSlide?.versiculo ? `"${currentSlide.versiculo.texto}"` : currentSlide?.texto || currentSlide?.pontos?.join(' • ')}
            </p>
            {currentSlide?.versiculo && (
              <div className="text-right text-sm text-amber-400 font-bold mt-2">
                — {currentSlide.versiculo.referencia}
              </div>
            )}
          </div>
        ) : (
          /* Modo Telão Padrão de Igreja / Datashow */
          <div 
            className={`w-full max-w-6xl mx-auto ${state.alinhamentoTexto === 'left' ? 'text-left' : 'text-center'} flex flex-col items-center justify-center`}
            style={{ transform: `scale(${state.tamanhoFonteRatio})`, transformOrigin: 'center center' }}
          >
            {/* Header / Identificador de Categoria */}
            {currentSlide?.subtitulo && (
              <div className="mb-4">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm md:text-base font-black tracking-wider uppercase border ${currentTheme.badgeBg} drop-shadow-sm`}>
                  {currentSlide.subtitulo}
                </span>
              </div>
            )}

            {/* Título Principal */}
            {currentSlide?.tipo === 'capa' && (
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-6">
                {currentSlide.titulo}
              </h1>
            )}

            {/* Conteúdo Específico por Tipo */}
            {currentSlide?.versiculo ? (
              /* Versículo Bíblico */
              <div className="my-auto">
                <blockquote className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.8)] font-serif italic max-w-5xl">
                  "{currentSlide.versiculo.texto}"
                </blockquote>
                <div className={`mt-8 text-2xl md:text-4xl font-black ${currentTheme.accentColor} drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}>
                  — {currentSlide.versiculo.referencia}
                </div>
              </div>
            ) : currentSlide?.texto ? (
              /* Letra de Louvor / Texto Principal */
              <div className="my-auto max-w-5xl">
                <p 
                  className={`text-3xl md:text-5xl lg:text-6xl font-black whitespace-pre-line leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${currentSlide.tipo === 'refrao' ? 'text-amber-300' : 'text-white'}`}
                >
                  {currentSlide.texto}
                </p>
                {currentSlide.tipo !== 'capa' && currentSlide.titulo && (
                  <div className="mt-8 text-lg md:text-xl font-bold text-slate-400/90 uppercase tracking-widest">
                    {currentSlide.titulo}
                  </div>
                )}
              </div>
            ) : currentSlide?.pontos && currentSlide.pontos.length > 0 ? (
              /* Tópicos / Lista */
              <div className="my-auto w-full max-w-4xl text-left">
                {currentSlide.tipo !== 'capa' && (
                  <h2 className="text-3xl md:text-4xl font-black text-amber-400 mb-8 text-center drop-shadow-md">
                    {currentSlide.titulo}
                  </h2>
                )}
                <div className="space-y-6">
                  {currentSlide.pontos.map((ponto, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-5">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-lg shadow-md mt-1">
                        {pIdx + 1}
                      </div>
                      <p className="text-2xl md:text-4xl font-bold text-white leading-snug drop-shadow-md">
                        {ponto}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* RODAPÉ DO TELÃO: ALERTA RÁPIDO AO VIVO (Ticker Animado) */}
      {state.alertaAtivo && !state.blackout && (
        <div className="relative z-40 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-black px-8 py-3.5 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
            {state.alertaAtivo.tipo === 'carro' ? (
              <Car className="w-6 h-6 text-black animate-bounce" />
            ) : state.alertaAtivo.tipo === 'bercario' ? (
              <Baby className="w-6 h-6 text-black animate-bounce" />
            ) : (
              <Bell className="w-6 h-6 text-black animate-bounce" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black tracking-widest uppercase opacity-80">
              AVISO DO TEMPLO
            </div>
            <div className="text-lg md:text-2xl font-black tracking-wide truncate">
              {state.alertaAtivo.texto}
            </div>
          </div>
        </div>
      )}

      {/* Discreto Indicador de Rodapé */}
      <div className="relative z-10 px-8 py-3 flex items-center justify-between text-xs text-slate-500/70 font-mono select-none">
        <span>{state.igrejaNome} • Telão Holyrics</span>
        <span>Slide {state.indiceAtual + 1} / {state.slides.length}</span>
      </div>
    </div>
  );
};
