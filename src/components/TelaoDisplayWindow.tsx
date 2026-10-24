import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Maximize, Minimize, Bell, Clock, Shield, Flame, 
  Volume2, Eye, EyeOff, Radio, Tv, Sparkles, ChevronRight, AlertTriangle, Car, Baby,
  BookOpen, Music, CheckCircle2, MessageSquare, Monitor, RefreshCw, UserCheck, Check
} from 'lucide-react';
import { 
  holyricsService, 
  HolyricsState, 
  HolyricsSlide, 
  HolyricsAlert,
  HolyricsTheme,
  DEFAULT_HOLYRICS_SLIDES
} from '../services/holyricsService';

interface TelaoDisplayWindowProps {
  initialMode?: 'telao' | 'pulpito';
}

export const TelaoDisplayWindow: React.FC<TelaoDisplayWindowProps> = ({ initialMode }) => {
  const [state, setState] = useState<HolyricsState>(() => {
    const s = holyricsService.getState();
    // Garante que haja slides para nunca ficar em branco
    if (!s.slides || s.slides.length === 0) {
      s.slides = DEFAULT_HOLYRICS_SLIDES;
    }
    return s;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHud, setShowHud] = useState(true);
  const hudTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determina modo inicial de visualização (Púlpito / Stage Display vs Telão Completo)
  const isPulpitoDefault = useMemo(() => {
    if (initialMode === 'pulpito') return true;
    if (initialMode === 'telao') return false;
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      return (
        search.includes('mode=pulpito') || 
        search.includes('pulpito=true') || 
        hash.includes('pulpito') ||
        window.location.pathname.endsWith('/pulpito')
      );
    }
    return false;
  }, [initialMode]);

  const isTelaoExplicit = useMemo(() => {
    if (initialMode === 'telao') return true;
    if (initialMode === 'pulpito') return false;
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      return (
        search.includes('mode=telao') || 
        search.includes('telao=true') || 
        hash.includes('telao') ||
        window.location.pathname.endsWith('/telao')
      );
    }
    return false;
  }, [initialMode]);

  const [viewMode, setViewMode] = useState<'pulpito' | 'telao'>(() => {
    if (isTelaoExplicit) return 'telao';
    if (isPulpitoDefault) return 'pulpito';
    return state.modoRetornoPalco ? 'pulpito' : 'telao';
  });

  // Sincronização em tempo real bidirecional com o motor Holyrics
  useEffect(() => {
    const unsubscribe = holyricsService.subscribe((newState) => {
      setState(newState);
      // Se não for telão explícito e o painel solicitar retorno de palco, acompanha
      if (!isTelaoExplicit && !initialMode && newState.modoRetornoPalco && viewMode !== 'pulpito') {
        setViewMode('pulpito');
      }
    });

    // Envia handshake e ping para a janela principal (window.opener / window.parent)
    const sendHandshake = () => {
      try {
        const msg = { 
          type: 'HOLYRICS_CLIENT_HELLO', 
          role: viewMode, 
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: Date.now() 
        };
        if (typeof window !== 'undefined') {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(msg, '*');
            window.opener.postMessage({ type: 'PING' }, '*');
          }
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(msg, '*');
            window.parent.postMessage({ type: 'PING' }, '*');
          }
        }
      } catch (e) {
        // Ignora erros cross-origin
      }
    };

    // Handshake imediato e periódico
    sendHandshake();
    const handshakeInterval = setInterval(sendHandshake, 1500);

    // Polling ativo ultrarrápido (200ms) para detectar mudanças no localStorage instantaneamente
    const pollInterval = setInterval(() => {
      holyricsService.syncFromStorageIfNewer();
    }, 200);

    // Listener direto para postMessage de comandos e sincronização
    const handleDirectMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'HOLYRICS_STATE_SYNC' || event.data.type === 'STATE_UPDATE') {
        if (event.data.payload) {
          setState(event.data.payload);
        }
      }
    };
    window.addEventListener('message', handleDirectMessage);

    return () => {
      unsubscribe();
      clearInterval(handshakeInterval);
      clearInterval(pollInterval);
      window.removeEventListener('message', handleDirectMessage);
    };
  }, [initialMode, viewMode, isTelaoExplicit]);

  // Relógio oficial do Templo / Púlpito
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
    }, 4000);
  };

  // Atalhos de teclado no 2º monitor (Projeção / Púlpito)
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
      } else if (e.key === 'p' || e.key === 'P') {
        // Atalho rápido 'P' para alternar modo Púlpito / Telão
        setViewMode(prev => prev === 'pulpito' ? 'telao' : 'pulpito');
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

  // Slides seguros com fallback
  const slides = (state.slides && state.slides.length > 0) ? state.slides : DEFAULT_HOLYRICS_SLIDES;
  const currentIdx = Math.max(0, Math.min(state.indiceAtual || 0, slides.length - 1));
  const currentSlide: HolyricsSlide = slides[currentIdx] || slides[0];
  const nextSlide: HolyricsSlide | undefined = slides[currentIdx + 1];

  // Informações do Púlpito e Liturgia
  const pulpito = state.pulpito || (holyricsService as any).getDefaultPulpitoState();
  const blocoAtivo = pulpito.blocos?.[pulpito.blocoAtivoIndex] || pulpito.blocos?.[0];
  const proximoBloco = pulpito.blocos?.[pulpito.blocoAtivoIndex + 1];

  // Avisos pendentes para o Púlpito
  const avisosPulpito = pulpito.avisos || [];
  const avisoUrgente = avisosPulpito.find(a => !a.lido);

  // Formatação de Tempo (mm:ss)
  const formatTimer = (seconds: number) => {
    const sAbs = Math.abs(seconds);
    const m = Math.floor(sAbs / 60);
    const s = sAbs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Cores do Tema para o Telão
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

  // =========================================================================
  // RENDERIZAÇÃO: MODO RETORNO DE PÚLPITO (STAGE DISPLAY / 2º MONITOR)
  // =========================================================================
  if (viewMode === 'pulpito') {
    return (
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onDoubleClick={toggleFullscreen}
        className="fixed inset-0 bg-[#090d16] text-slate-100 font-sans select-none flex flex-col p-4 sm:p-6 overflow-hidden"
      >
        {/* BARRA SUPERIOR HUD DO RETORNO DE PÚLPITO */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
          {/* Identificação da Transmissão */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> AO VIVO
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-slate-300 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-teal-400" />
                2º MONITOR • HOLYRICS PROJEÇÃO (PÚLPITO)
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Sincronizado
              </span>
            </div>
          </div>

          {/* Bloco Litúrgico Atual / Pregador */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400">{blocoAtivo?.titulo || pulpito.cultoTitulo}</span>
            {pulpito.pregadorNome && (
              <>
                <span className="text-slate-600">•</span>
                <span>Preletor: <strong className="text-slate-200">{pulpito.pregadorNome}</strong></span>
              </>
            )}
          </div>

          {/* Relógio do Templo, Cronômetro e Controles de Exibição */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Cronômetro do Púlpito / Liturgia */}
            {pulpito.isRunning || pulpito.tempoRestante > 0 || state.cronometro?.ativo ? (
              <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border ${
                pulpito.isOvertime 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
                  : pulpito.tempoRestante <= 300 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                <div>
                  <div className="text-[9px] uppercase font-black tracking-wider opacity-80">
                    {pulpito.isOvertime ? 'TEMPO EXCEDIDO' : 'TEMPO DO BLOCO'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono leading-none">
                    {pulpito.isOvertime ? `+${formatTimer(pulpito.tempoExcedido)}` : formatTimer(pulpito.tempoRestante)}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Relógio Oficial com Segundos */}
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">HORÁRIO OFICIAL</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight leading-none">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {/* Alternadores rápidos de Modo e Tela Cheia (aparecem no HUD) */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setViewMode('telao')}
                title="Mudar para visualização do Telão (congregação)"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Projeção Telão</span>
              </button>

              <button 
                onClick={toggleFullscreen}
                title="Alternar Tela Cheia (F11)"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ÁREA CENTRAL DO RETORNO: SLIDE ATUAL + PRÓXIMO SLIDE */}
        <div className="flex-1 grid grid-cols-12 gap-4 sm:gap-6 my-4 overflow-hidden min-h-0">
          {/* COLUNA ESQUERDA (8 COLUNAS): SLIDE PROJETADO NO TELÃO AGORA */}
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl relative">
            <div>
              {/* Badge do Status do Telão */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  [ PROJETADO NO TELÃO AGORA • SLIDE {currentIdx + 1} DE {slides.length} ]
                </span>
                {currentSlide?.tipo && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {currentSlide.tipo === 'versiculo' ? '📖 Versículo Bíblico' : 
                     currentSlide.tipo === 'letra' || currentSlide.tipo === 'refrao' ? '🎵 Harpa / Louvor' :
                     currentSlide.tipo === 'topico' ? '📝 Tópico da Mensagem' :
                     currentSlide.tipo === 'capa' ? '🏛️ Abertura do Culto' : 'Aviso do Culto'}
                  </span>
                )}
              </div>

              {/* Se houver Blackout ativo no Telão */}
              {state.blackout ? (
                <div className="bg-rose-950/30 border-2 border-rose-500/50 text-rose-300 p-8 rounded-2xl text-center my-6">
                  <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-2xl font-black mb-1">BLACKOUT ATIVO NO TELÃO</h3>
                  <p className="text-sm text-rose-300/80">A tela está preta para a congregação no momento. O conteúdo abaixo voltará ao desativar o blackout.</p>
                </div>
              ) : state.limparTexto ? (
                <div className="bg-amber-950/20 border-2 border-amber-500/40 text-amber-300 p-6 rounded-2xl text-center my-6">
                  <EyeOff className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-xl font-black">TEXTO LIMPO NO TELÃO</h3>
                  <p className="text-xs text-amber-200/80">Apenas o fundo ou logotipo da igreja está sendo exibido ao público.</p>
                </div>
              ) : null}

              {/* Título e Subtítulo do Slide */}
              <div className="mb-4">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight mb-2">
                  {currentSlide?.titulo}
                </h2>
                {currentSlide?.subtitulo && (
                  <h3 className="text-base sm:text-xl font-bold text-amber-400 tracking-wide">
                    {currentSlide.subtitulo}
                  </h3>
                )}
              </div>

              {/* Conteúdo Principal do Slide */}
              <div className="my-auto py-2">
                {currentSlide?.versiculo ? (
                  <div className="bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-slate-800">
                    <blockquote className="text-2xl sm:text-4xl font-bold text-white leading-relaxed font-serif italic">
                      "{currentSlide.versiculo.texto}"
                    </blockquote>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 mt-4 text-right">
                      — {currentSlide.versiculo.referencia}
                    </div>
                  </div>
                ) : currentSlide?.texto ? (
                  <div className="bg-slate-950/60 p-6 sm:p-8 rounded-2xl border border-slate-800">
                    <p className={`text-2xl sm:text-4xl font-bold whitespace-pre-line leading-relaxed ${
                      currentSlide.tipo === 'refrao' ? 'text-amber-300' : 'text-slate-100'
                    }`}>
                      {currentSlide.texto}
                    </p>
                  </div>
                ) : currentSlide?.pontos && currentSlide.pontos.length > 0 ? (
                  <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                    {currentSlide.pontos.map((ponto, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-4">
                        <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-1">
                          {pIdx + 1}
                        </span>
                        <span className="text-xl sm:text-3xl font-bold text-white leading-snug">
                          {ponto}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-lg py-8 text-center">
                    [ Nenhum texto adicional para este slide ]
                  </div>
                )}
              </div>
            </div>

            {/* NOTAS E ORIENTAÇÕES DO PRELETOR (SE HOUVER) */}
            {currentSlide?.notas && (
              <div className="mt-6 pt-4 border-t border-slate-800 bg-amber-500/10 -mx-6 -mb-6 p-6 rounded-b-3xl border-t-amber-500/30">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md inline-block mb-1">
                  Notas de Púlpito:
                </span>
                <p className="text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed">
                  {currentSlide.notas}
                </p>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA (4 COLUNAS): A SEGUIR (PRÓXIMO SLIDE) & LITURGIA */}
          <div className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-4">
            {/* PRÓXIMO SLIDE (CARD) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex-1 flex flex-col overflow-hidden shadow-xl">
              <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-400" />
                A SEGUIR NO TELÃO (PRÓXIMO SLIDE):
              </div>

              {nextSlide ? (
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 flex-1 flex flex-col justify-between overflow-y-auto">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">{nextSlide.titulo}</span>
                    {nextSlide.subtitulo && (
                      <span className="text-xs text-amber-400 font-semibold block mb-2">{nextSlide.subtitulo}</span>
                    )}
                    <p className="text-base sm:text-lg text-slate-200 line-clamp-6 leading-relaxed font-medium">
                      {nextSlide.versiculo ? `"${nextSlide.versiculo.texto}"` : nextSlide.texto || nextSlide.pontos?.join(' • ')}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Pronto para transição
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-bold text-sm bg-slate-950/40 rounded-2xl border border-slate-800/40">
                  [ Fim da Apresentação Atual ]
                </div>
              )}
            </div>

            {/* BLOCO LITÚRGICO SEGUINTE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-lg">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                LITURGIA • ETAPA ATUAL DO CULTO
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-200">{blocoAtivo?.titulo || 'Culto em Andamento'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {proximoBloco ? `A seguir: ${proximoBloco.titulo}` : 'Última etapa do culto'}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-slate-800 text-amber-400 text-xs font-black">
                  {blocoAtivo?.duracaoMinutos || 15} min
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO RETORNO: AVISO URGENTE DA SONOPLASTIA / ALERTA DO TELÃO */}
        {avisoUrgente ? (
          <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between font-black text-sm shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-bounce shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded mr-2">
                  AVISO PARA O PÚLPITO ({avisoUrgente.autor} • {avisoUrgente.horario})
                </span>
                <span className="text-base">{avisoUrgente.texto}</span>
              </div>
            </div>
            <button
              onClick={() => holyricsService.markPulpitoAvisoLido(avisoUrgente.id)}
              className="px-3 py-1 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-100 transition-all cursor-pointer shadow-md"
            >
              Ciente (Marcar Lido)
            </button>
          </div>
        ) : state.alertaAtivo ? (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 rounded-2xl flex items-center justify-between font-black text-sm shadow-xl">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              ALERTA PROJETADO NO TELÃO: {state.alertaAtivo.texto}
            </span>
            <span className="text-xs uppercase bg-black/20 px-2 py-0.5 rounded font-bold">Ao Vivo</span>
          </div>
        ) : null}
      </div>
    );
  }

  // =========================================================================
  // RENDERIZAÇÃO: MODO PROJEÇÃO PRINCIPAL (TELÃO / DATASHOW / CONGREGAÇÃO)
  // =========================================================================
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
      {/* HUD DE CONTROLE RÁPIDO DO TELÃO (Auto-hide ao ficar ocioso) */}
      <div 
        className={`absolute top-4 inset-x-4 z-50 flex items-center justify-between transition-opacity duration-300 pointer-events-auto ${
          showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Status de Sincronização em Tempo Real */}
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-2xl">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> TELÃO AO VIVO
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-white hidden sm:inline">
            Holyrics Projeção
          </span>
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
            Slide {currentIdx + 1}/{slides.length}
          </span>
        </div>

        {/* Controles de Disparo e Modo */}
        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
          <button 
            onClick={() => holyricsService.prevSlide()}
            title="Slide Anterior (Seta Esquerda)"
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            ◄
          </button>
          <button 
            onClick={() => holyricsService.nextSlide()}
            title="Próximo Slide (Seta Direita / Espaço)"
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            Próximo ►
          </button>
          <button 
            onClick={() => holyricsService.toggleBlackout()}
            title="Blackout (Tecla B)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              state.blackout ? 'bg-rose-600 text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            B
          </button>
          <button 
            onClick={() => holyricsService.toggleClearText()}
            title="Limpar Texto (Tecla C)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              state.limparTexto ? 'bg-amber-500 text-black shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            C
          </button>
          <button 
            onClick={() => setViewMode('pulpito')}
            title="Alternar para Modo Retorno de Púlpito (Stage Display)"
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Retorno Púlpito</span>
          </button>
          <button 
            onClick={toggleFullscreen}
            title="Alternar Tela Cheia (F11 / F)"
            className="bg-white/10 hover:bg-white/20 text-white text-xs p-1.5 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
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
            {state.igrejaNome || 'ASSEMBLEIA DE DEUS'}
          </h1>
          <p className="text-lg md:text-2xl text-amber-400/90 font-medium tracking-widest mt-3 uppercase">
            Comunhão • Palavra • Louvor • Adoração
          </p>
        </div>
      )}

      {/* ESTADO 3: CONTEÚDO DO SLIDE REGULAR (OU MODO LIMPO) */}
      <div 
        className={`flex-1 flex flex-col ${
          state.modoLowerThird ? 'justify-end pb-12 px-12' : 'justify-center items-center px-8 sm:px-16 md:px-24'
        } z-10 transition-all duration-300 ${
          state.limparTexto || state.exibirLogo ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
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
            key={`${currentSlide?.id || currentIdx}-${state.ultimaAtualizacao}`}
            className={`w-full max-w-6xl mx-auto ${
              state.alinhamentoTexto === 'left' ? 'text-left' : 'text-center'
            } flex flex-col items-center justify-center animate-in fade-in duration-200`}
            style={{ transform: `scale(${state.tamanhoFonteRatio || 1})`, transformOrigin: 'center center' }}
          >
            {/* Header / Subtítulo */}
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
            {currentSlide?.tipo === 'midia_imagem' || currentSlide?.imagemUrl ? (
              /* Mídia / Imagem de Alta Resolução */
              <div className="w-full flex-1 flex flex-col items-center justify-center relative my-auto py-2">
                <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-black">
                  <img
                    src={currentSlide.imagemUrl}
                    alt={currentSlide.titulo || 'Mídia Projetada'}
                    className={`w-full h-full ${
                      currentSlide.ajusteImagem === 'cover' ? 'object-cover' : 'object-contain'
                    }`}
                  />
                  {currentSlide.titulo && currentSlide.titulo !== 'Mídia' && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-6 text-center">
                      <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                        {currentSlide.titulo}
                      </h2>
                      {currentSlide.subtitulo && (
                        <p className="text-xs sm:text-base text-amber-300 drop-shadow-md mt-1 font-bold">
                          {currentSlide.subtitulo}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : currentSlide?.tipo === 'texto_livre' ? (
              /* Texto Livre com Formatação Dinâmica */
              <div className={`my-auto max-w-5xl w-full ${
                currentSlide.estiloTexto?.align === 'left' ? 'text-left' :
                currentSlide.estiloTexto?.align === 'right' ? 'text-right' : 'text-center'
              }`}>
                {currentSlide.titulo && (
                  <h2 className={`font-black tracking-tight mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
                    currentSlide.estiloTexto?.colorTheme === 'cyan' ? 'text-cyan-300' :
                    currentSlide.estiloTexto?.colorTheme === 'emerald' ? 'text-emerald-300' :
                    currentSlide.estiloTexto?.colorTheme === 'amber' ? 'text-orange-400' :
                    currentSlide.estiloTexto?.colorTheme === 'rose' ? 'text-rose-400' :
                    currentSlide.estiloTexto?.colorTheme === 'white' ? 'text-white' : 'text-amber-400'
                  } ${
                    currentSlide.estiloTexto?.fontSize === '3xl' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
                  }`}>
                    {currentSlide.estiloTexto?.uppercase ? currentSlide.titulo.toUpperCase() : currentSlide.titulo}
                  </h2>
                )}

                <p className={`whitespace-pre-line leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
                  currentSlide.estiloTexto?.bold ? 'font-black' : 'font-normal'
                } ${currentSlide.estiloTexto?.italic ? 'italic font-serif' : ''} ${
                  currentSlide.estiloTexto?.fontSize === 'sm' ? 'text-2xl md:text-3xl' :
                  currentSlide.estiloTexto?.fontSize === 'base' ? 'text-3xl md:text-4xl' :
                  currentSlide.estiloTexto?.fontSize === '2xl' ? 'text-4xl md:text-6xl' : 'text-5xl md:text-7xl'
                } ${
                  currentSlide.estiloTexto?.colorTheme === 'cyan' ? 'text-cyan-200' :
                  currentSlide.estiloTexto?.colorTheme === 'emerald' ? 'text-emerald-200' :
                  currentSlide.estiloTexto?.colorTheme === 'amber' ? 'text-orange-300' :
                  currentSlide.estiloTexto?.colorTheme === 'rose' ? 'text-rose-300' :
                  currentSlide.estiloTexto?.colorTheme === 'white' ? 'text-white' : 'text-slate-100'
                }`}>
                  {currentSlide.estiloTexto?.uppercase ? (currentSlide.texto || '').toUpperCase() : currentSlide.texto}
                </p>
              </div>
            ) : currentSlide?.versiculo ? (
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
                  className={`text-3xl md:text-5xl lg:text-6xl font-black whitespace-pre-line leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
                    currentSlide.tipo === 'refrao' ? 'text-amber-300' : 'text-white'
                  }`}
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

      {/* CRONÔMETRO REGRESSIVO DO TELÃO (Se ativado pelo painel principal) */}
      {state.cronometro?.ativo && !state.blackout && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/85 backdrop-blur-md px-8 py-4 rounded-3xl border border-amber-400/50 text-center shadow-2xl animate-in zoom-in-95">
          <div className="text-xs uppercase font-black tracking-widest text-amber-400 mb-1">
            {state.cronometro.rotulo || 'Contagem Regressiva'}
          </div>
          <div className="text-4xl md:text-6xl font-black font-mono text-white tracking-wider">
            {formatTimer(state.cronometro.tempoRestanteSegundos)}
          </div>
        </div>
      )}

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

      {/* Indicador de Rodapé Discreto */}
      <div className="relative z-10 px-8 py-3 flex items-center justify-between text-xs text-slate-500/70 font-mono select-none">
        <span>{state.igrejaNome || 'ASSEMBLEIA DE DEUS'} • Holyrics Projeção</span>
        <span>Slide {currentIdx + 1} / {slides.length}</span>
      </div>
    </div>
  );
};

export default TelaoDisplayWindow;
