import React, { useState, useEffect, useContext } from 'react';
import { 
  Tv, Radio, ChevronLeft, ChevronRight, Eye, EyeOff, 
  Maximize2, Bell, BookOpen, Shield, X, Minimize2, AlertTriangle, 
  Car, Baby, Sliders, ExternalLink, Sparkles, Music, Check, Clock, Flame,
  Type, Image as ImageIcon
} from 'lucide-react';
import { 
  holyricsService, 
  HolyricsState, 
  HolyricsSlide, 
  ALERTAS_PRE_CONFIGURADOS,
  LISTA_FUNDOS_ANIMADOS,
  HolyricsAnimatedBg
} from '../services/holyricsService';
import { ChurchContext } from '../App';
import { BibliaProjecaoModal } from './BibliaProjecaoModal';
import { TextoLivreProjecaoModal } from './TextoLivreProjecaoModal';
import { MidiaProjecaoModal } from './MidiaProjecaoModal';

interface Props {
  onOpenFullStudio?: () => void;
}

export const HolyricsOperatorDock: React.FC<Props> = ({ onOpenFullStudio }) => {
  const { db, addToast } = useContext(ChurchContext) || {};
  const church = db?.igreja;
  const [state, setState] = useState<HolyricsState>(holyricsService.getState());
  const [minimized, setMinimized] = useState<boolean>(false);

  // Controle de Medida / Tamanho do Painel Flutuante (Compacto, Padrão, Amplo, Máximo)
  const [dockSize, setDockSize] = useState<'compact' | 'normal' | 'wide' | 'full'>(() => {
    const saved = localStorage.getItem('holyrics_dock_size');
    if (saved === 'compact' || saved === 'normal' || saved === 'wide' || saved === 'full') {
      return saved;
    }
    return 'wide';
  });

  const cycleDockSize = (direction: 'smaller' | 'larger') => {
    const order: Array<'compact' | 'normal' | 'wide' | 'full'> = ['compact', 'normal', 'wide', 'full'];
    const idx = order.indexOf(dockSize);
    const nextIdx = direction === 'smaller' ? Math.max(0, idx - 1) : Math.min(order.length - 1, idx + 1);
    const nextSize = order[nextIdx];
    setDockSize(nextSize);
    localStorage.setItem('holyrics_dock_size', nextSize);
  };
  
  // Modais de Controle
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showBibleModal, setShowBibleModal] = useState<boolean>(false);
  const [showTextoLivreModal, setShowTextoLivreModal] = useState<boolean>(false);
  const [showMidiaModal, setShowMidiaModal] = useState<boolean>(false);
  const [showFundosModal, setShowFundosModal] = useState<boolean>(false);

  // Alerta Rápido
  const [alertText, setAlertText] = useState<string>('');
  const [alertType, setAlertType] = useState<'carro' | 'bercario' | 'aviso' | 'urgente'>('carro');

  useEffect(() => {
    const unsubscribe = holyricsService.subscribe((s) => {
      setState(s);
    });
    return () => unsubscribe();
  }, []);

  // Atualiza informações completas e logo da igreja no serviço a partir do banco de dados
  useEffect(() => {
    if (church) {
      holyricsService.updateIgrejaInfo(church.nome, church.logo || church.logo_url, {
        pastor: church.pastor,
        cidade: church.cidade,
        uf: church.uf,
        endereco: church.endereco,
        telefone: church.telefone,
        email: church.email,
        site: church.site,
        cnpj: church.cnpj,
        subtitulo: church.subtitulo || 'Comunhão • Palavra • Louvor • Adoração'
      });
    }
  }, [church]);

  // Se a projeção não estiver ativa e não estivermos minimizados, não exibe
  if (!state.ativo && !minimized) {
    return null;
  }

  const currentSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual] || state.slides[0];

  const handleOpenTelaoWindow = () => {
    const win = holyricsService.openTelaoWindow();
    if (!win) {
      if (addToast) {
        addToast('Pop-up bloqueado pelo navegador! Permita pop-ups para abrir o telão no segundo monitor.', 'error');
      }
    } else {
      if (addToast) addToast('Janela do Telão aberta para o 2º Monitor!', 'success');
    }
  };

  const handleOpenPulpitoWindow = () => {
    const win = holyricsService.openPulpitoWindow();
    if (!win) {
      if (addToast) {
        addToast('Pop-up bloqueado pelo navegador! Permita pop-ups para abrir o púlpito no segundo monitor.', 'error');
      }
    } else {
      if (addToast) addToast('Janela do Púlpito aberta para o 2º Monitor!', 'success');
    }
  };

  const handleSendCustomAlert = () => {
    if (!alertText.trim()) return;
    holyricsService.sendAlert(alertText, alertType, undefined, 30);
    setShowAlertModal(false);
    setAlertText('');
    if (addToast) addToast('Alerta enviado para o telão!', 'success');
  };

  const handleSendPredefinedAlert = (template: string, tipo: 'carro' | 'bercario' | 'aviso' | 'oracao') => {
    let customText = template;
    if (template.includes('[PLACA]')) {
      const placa = prompt('Digite a placa do veículo (Ex: ABC-1234):');
      if (!placa) return;
      customText = template.replace('[PLACA]', placa.toUpperCase());
    } else if (template.includes('[NOME]')) {
      const nome = prompt('Digite o nome da criança no berçário:');
      if (!nome) return;
      customText = template.replace('[NOME]', nome);
    } else if (template.includes('[CHAVE]')) {
      customText = template.replace('[CHAVE]', (church as any)?.chave_pix || 'Chave PIX Oficial');
    }

    holyricsService.sendAlert(customText, tipo, undefined, 35);
    setShowAlertModal(false);
    if (addToast) addToast('Alerta transmitido no telão!', 'success');
  };

  // Versão Super Minimizada (Pílula Flutuante)
  if (minimized) {
    return (
      <div className="fixed bottom-3 right-4 z-[999999] flex items-center gap-2 bg-slate-950/95 text-white px-3 py-2 rounded-2xl shadow-2xl border border-teal-500/40 backdrop-blur-md animate-in fade-in select-none">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
            {state.blackout ? 'BLACKOUT' : 'AO VIVO'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <span className="text-xs font-mono font-bold text-amber-300">
          {state.indiceAtual + 1}/{state.slides.length}
        </span>

        <button
          onClick={() => holyricsService.prevSlide()}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Slide Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.nextSlide()}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Próximo Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.toggleBlackout()}
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer ${
            state.blackout ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Blackout (B)"
        >
          B
        </button>

        <button
          onClick={() => setMinimized(false)}
          className="p-1 rounded-lg hover:bg-slate-800 text-teal-400 hover:text-teal-300 transition-all ml-1 cursor-pointer"
          title="Expandir Barra do Operador"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.toggleAtivo(false)}
          className="p-1 rounded-lg hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer ml-0.5"
          title="Fechar Barra de Projeção"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const sizeWidthClass =
    dockSize === 'compact'
      ? 'w-[92vw] max-w-4xl'
      : dockSize === 'normal'
      ? 'w-[95vw] max-w-6xl'
      : dockSize === 'wide'
      ? 'w-fit max-w-[98vw]'
      : 'w-[98vw] max-w-[98vw]';

  const isCompactMode = dockSize === 'compact';

  // Versão Dock Completa do Operador - Totalmente Enquadrada no Box com Barra de Rolagem Inteligente e Ajuste de Medida
  return (
    <>
      <aside 
        aria-label="Controle de Projeção Holyrics"
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-[999990] ${sizeWidthClass} bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white px-3 py-2 select-none transition-all duration-200 overflow-hidden`}
      >
        <div
          className="flex items-center justify-between gap-2 overflow-x-auto pb-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #0f172a'
          }}
        >
          
          {/* GRUPO 1 (ESQUERDA): STATUS AO VIVO & MINI PRÉVIA DO SLIDE */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Indicador AO VIVO */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl h-9 shrink-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 whitespace-nowrap">
                {isCompactMode ? 'AO VIVO' : 'TELÃO AO VIVO'}
              </span>
            </div>

            {/* Thumbnail Mini Preview */}
            <div 
              className={`${isCompactMode ? 'w-28' : 'w-36'} h-9 rounded-xl px-2 py-1 flex flex-col justify-center border text-left overflow-hidden transition-all shrink-0 ${
                state.blackout 
                  ? 'bg-black border-rose-500/50 text-rose-400' 
                  : state.limparTexto 
                    ? 'bg-slate-900 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              {state.blackout ? (
                <span className="text-[9px] font-black text-rose-400 leading-none uppercase">⚠️ Blackout</span>
              ) : state.limparTexto ? (
                <span className="text-[9px] font-black text-amber-400 leading-none uppercase">✨ Texto Oculto</span>
              ) : currentSlide?.tipo === 'midia_imagem' || currentSlide?.imagemUrl ? (
                <div className="flex items-center gap-1.5 h-full">
                  <img src={currentSlide.imagemUrl} alt="Img" className="w-6 h-6 rounded object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-amber-400 truncate leading-none block">
                      {currentSlide.titulo || 'Mídia Projetada'}
                    </span>
                    <span className="text-[8px] text-emerald-400 truncate leading-tight block">
                      🖼️ {currentSlide.ajusteImagem === 'cover' ? 'Preenchido' : currentSlide.ajusteImagem === 'fill' ? '100% Espaço' : 'Ajustado'}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-[9px] font-bold text-amber-400 truncate leading-none">
                    {currentSlide?.titulo || state.tituloApresentacao}
                  </span>
                  <span className="text-[8px] text-slate-400 truncate leading-tight mt-0.5">
                    {currentSlide?.versiculo ? currentSlide.versiculo.texto : currentSlide?.texto || currentSlide?.subtitulo || 'Em exibição'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* GRUPO 2 (CENTRO): NAVEGAÇÃO DE SLIDES COM CONTADOR INTEGRADO */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 h-9 shrink-0">
            <button
              onClick={() => holyricsService.prevSlide()}
              disabled={state.indiceAtual <= 0}
              className="h-8 px-2 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Slide Anterior (Seta Esquerda / PageUp)"
            >
              <ChevronLeft className="w-4 h-4" />
              {!isCompactMode && <span className="text-[11px]">Ant</span>}
            </button>

            <div className="flex items-center px-2 font-mono text-xs font-black text-amber-300 border-x border-slate-800/80 whitespace-nowrap">
              <span>{state.indiceAtual + 1}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{state.slides.length}</span>
            </div>

            <button
              onClick={() => holyricsService.nextSlide()}
              disabled={state.indiceAtual >= state.slides.length - 1}
              className="h-8 px-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
              title="Próximo Slide (Espaço / Seta Direita / PageDown)"
            >
              {!isCompactMode && <span className="text-[11px]">Próx</span>}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* GRUPO 3 (AÇÕES RÁPIDAS): BLACKOUT, LIMPAR, LOGO, ALERTA, BÍBLIA, TEXTO, MÍDIAS, FUNDOS */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Blackout */}
            <button
              onClick={() => holyricsService.toggleBlackout()}
              className={`h-9 px-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                state.blackout 
                  ? 'bg-rose-600 text-white shadow-md animate-pulse border border-rose-500' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Tela Preta Imediata no Telão (B)"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Blackout</span>
            </button>

            {/* Limpar Texto */}
            <button
              onClick={() => holyricsService.toggleClearText()}
              className={`h-9 px-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                state.limparTexto 
                  ? 'bg-amber-500 text-black shadow-md border border-amber-400 font-black' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Ocultar Texto Mantendo o Fundo (C)"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Limpar</span>
            </button>

            {/* Logo da Igreja */}
            <button
              onClick={() => {
                holyricsService.toggleShowLogo(church ? {
                  nome: church.nome,
                  logoUrl: church.logo || church.logo_url,
                  pastor: church.pastor,
                  cidade: church.cidade,
                  uf: church.uf,
                  endereco: church.endereco,
                  telefone: church.telefone,
                  email: church.email,
                  site: church.site,
                  cnpj: church.cnpj,
                  subtitulo: church.subtitulo || 'Comunhão • Palavra • Louvor • Adoração'
                } : undefined);
              }}
              className={`h-9 px-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                state.exibirLogo 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-400' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title={state.exibirLogo ? "Ocultar Logo Oficial da Igreja no Telão (L)" : "Exibir Logo e Dados Oficiais da Igreja no Telão (L)"}
            >
              <Shield className={`w-3.5 h-3.5 shrink-0 ${state.exibirLogo ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Logo</span>
            </button>

            {/* Alerta Rápido */}
            <button
              onClick={() => setShowAlertModal(true)}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Enviar Alerta no Rodapé do Telão (Veículos / Berçário)"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Alerta</span>
            </button>

            {/* Bíblia Sagrada Offline */}
            <button
              onClick={() => setShowBibleModal(true)}
              className="h-9 px-2.5 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 hover:border-sky-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
              title="Selecionar / Pesquisar Versículo Bíblico Offline para o Telão"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Bíblia</span>
            </button>

            {/* Área de Texto Livre */}
            <button
              onClick={() => setShowTextoLivreModal(true)}
              className="h-9 px-2.5 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-500/40 hover:border-amber-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
              title="Digitar Texto Livre com Formatação para o Projetor"
            >
              <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isCompactMode ? 'Texto' : 'Texto Livre'}</span>
            </button>

            {/* Área de Mídias / Cartazes / Congressos */}
            <button
              onClick={() => setShowMidiaModal(true)}
              className="h-9 px-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/40 hover:border-indigo-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
              title="Projetar Imagens de Anúncios, Congressos, Conferências e Santa Ceia"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Mídias</span>
            </button>

            {/* Fundos Animados 60 FPS (Estilo Holyrics) */}
            <button
              onClick={() => setShowFundosModal(true)}
              className={`h-9 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap ${
                state.fundoAnimado && state.fundoAnimado !== 'none'
                  ? 'bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-md'
                  : 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/40 hover:border-purple-500/80'
              }`}
              title="Selecionar Fundo Animado Dinâmico para o Telão (Estilo Holyrics)"
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${state.fundoAnimado && state.fundoAnimado !== 'none' ? 'text-slate-950' : 'text-purple-400'}`} />
              <span>Fundos</span>
            </button>
          </div>

          {/* GRUPO 4 (DIREITA): JANELAS DE 2º MONITOR, AJUSTE DE MEDIDA DO PAINEL & CONTROLES */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Janela Telão (2º Monitor) */}
            <button
              onClick={handleOpenTelaoWindow}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-teal-500/40 hover:border-teal-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Abrir Janela do Telão no Segundo Monitor (Datashow)"
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span>{isCompactMode ? 'Telão' : 'Telão Ext.'}</span>
            </button>

            {/* Janela Púlpito (2º Monitor) */}
            <button
              onClick={handleOpenPulpitoWindow}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Abrir Janela do Púlpito / Stage Display no Segundo Monitor"
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{isCompactMode ? 'Púlpito' : 'Púlpito Ext.'}</span>
            </button>

            {/* Controle para Diminuir ou Aumentar a Medida do Painel Flutuante */}
            <div
              className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 h-9 shrink-0"
              title="Diminuir ou Aumentar a medida/largura do painel flutuante"
            >
              <button
                type="button"
                onClick={() => cycleDockSize('smaller')}
                disabled={dockSize === 'compact'}
                className="h-7 w-6 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white font-black text-xs flex items-center justify-center cursor-pointer"
                title="Diminuir medida do painel"
              >
                -
              </button>
              <span className="px-1 text-[9px] font-mono font-bold text-slate-400 uppercase select-none">
                {dockSize === 'compact' ? 'P' : dockSize === 'normal' ? 'M' : dockSize === 'wide' ? 'G' : 'MAX'}
              </span>
              <button
                type="button"
                onClick={() => cycleDockSize('larger')}
                disabled={dockSize === 'full'}
                className="h-7 w-6 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white font-black text-xs flex items-center justify-center cursor-pointer"
                title="Aumentar medida do painel"
              >
                +
              </button>
            </div>

            {/* Abrir Console Holyrics Completo */}
            {onOpenFullStudio && (
              <button
                onClick={onOpenFullStudio}
                className="h-9 w-9 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Abrir Painel Completo de Mídia Holyrics"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Minimizar */}
            <button
              onClick={() => setMinimized(true)}
              className="h-9 w-9 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Minimizar Barra do Operador"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* Fechar Dock */}
            <button
              onClick={() => holyricsService.toggleAtivo(false)}
              className="h-9 w-9 bg-slate-900/90 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Fechar Barra de Projeção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL 1: BÍBLIA SAGRADA OFFLINE (SELEÇÃO & PESQUISA) */}
      <BibliaProjecaoModal
        isOpen={showBibleModal}
        onClose={() => setShowBibleModal(false)}
      />

      {/* MODAL 2: TEXTO LIVRE FORMATADO PARA O TELÃO */}
      <TextoLivreProjecaoModal
        isOpen={showTextoLivreModal}
        onClose={() => setShowTextoLivreModal(false)}
      />

      {/* MODAL 3: MÍDIAS & IMAGENS DO CULTO */}
      <MidiaProjecaoModal
        isOpen={showMidiaModal}
        onClose={() => setShowMidiaModal(false)}
      />

      {/* MODAL 5: GALERIA DE FUNDOS ANIMADOS 60FPS (HOLYRICS MOTION BACKGROUNDS) */}
      {showFundosModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">Fundos Animados Dinâmicos (Estilo Holyrics)</h3>
                  <p className="text-xs text-slate-400">Escolha o fundo animado em 60 FPS para versículos bíblicos, hinos da Harpa e louvores</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFundosModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {LISTA_FUNDOS_ANIMADOS.map((item) => {
                const isSelected = (state.fundoAnimado || 'none') === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      holyricsService.setAnimatedBackground(item.id);
                      if (addToast) addToast(`Fundo "${item.nome}" ativado no telão!`, 'success');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between bg-gradient-to-br ${item.corPreview} ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-xl'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-2xl shrink-0">
                        {item.icone}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                          <span className="truncate">{item.nome}</span>
                          {item.id !== 'none' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                              60fps
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                          {item.descricao}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 ml-2 shadow">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                ✨ A troca de fundo ocorre instantaneamente no telão mantendo o slide ativo.
              </span>
              <button
                onClick={() => setShowFundosModal(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ALERTA RÁPIDO NO TELÃO (Carro, Berçário, etc.) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-lg">Alerta Rápido no Telão</h3>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              O aviso aparecerá como um banner animado no rodapé do telão sem interromper os slides ou a pregação.
            </p>

            {/* Modelos rápidos */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Modelos Rápidos da Igreja:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALERTAS_PRE_CONFIGURADOS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPredefinedAlert(item.template, item.tipo)}
                    className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-amber-300 hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {item.tipo === 'carro' ? (
                      <Car className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : item.tipo === 'bercario' ? (
                      <Baby className="w-4 h-4 text-pink-400 shrink-0" />
                    ) : (
                      <Bell className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem Personalizada */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Ou Digite uma Mensagem Própria:
              </label>
              <textarea
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="Ex: Atenção motorista do Fiat Uno prata placa XYZ-9876, favor comparecer ao veículo..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-hidden focus:border-amber-400 resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {state.alertaAtivo ? (
                <button
                  onClick={() => { holyricsService.clearAlert(); setShowAlertModal(false); }}
                  className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Remover Alerta Atual
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendCustomAlert}
                  disabled={!alertText.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Transmitir Alerta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
