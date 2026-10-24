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
  ALERTAS_PRE_CONFIGURADOS
} from '../services/holyricsService';
import { ChurchContext } from '../App';
import { BibliaProjecaoModal } from './BibliaProjecaoModal';
import { TextoLivreProjecaoModal } from './TextoLivreProjecaoModal';
import { MidiaProjecaoModal } from './MidiaProjecaoModal';

interface Props {
  onOpenFullStudio?: () => void;
}

export const HolyricsOperatorDock: React.FC<Props> = ({ onOpenFullStudio }) => {
  const { igreja, addToast } = useContext(ChurchContext) || {};
  const [state, setState] = useState<HolyricsState>(holyricsService.getState());
  const [minimized, setMinimized] = useState<boolean>(false);
  
  // Modais de Controle
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showBibleModal, setShowBibleModal] = useState<boolean>(false);
  const [showTextoLivreModal, setShowTextoLivreModal] = useState<boolean>(false);
  const [showMidiaModal, setShowMidiaModal] = useState<boolean>(false);

  // Alerta Rápido
  const [alertText, setAlertText] = useState<string>('');
  const [alertType, setAlertType] = useState<'carro' | 'bercario' | 'aviso' | 'urgente'>('carro');

  useEffect(() => {
    const unsubscribe = holyricsService.subscribe((s) => {
      setState(s);
    });
    return () => unsubscribe();
  }, []);

  // Atualiza nome da igreja no serviço se disponível
  useEffect(() => {
    if (igreja?.nome) {
      holyricsService.updateIgrejaInfo(igreja.nome, igreja.logo);
    }
  }, [igreja?.nome, igreja?.logo]);

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
      customText = template.replace('[CHAVE]', (igreja as any)?.chave_pix || 'Chave PIX Oficial');
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

  // Versão Dock Completa do Operador - Layout Sem Sobreposição e Botões Uniformes
  return (
    <>
      <aside 
        aria-label="Controle de Projeção Holyrics"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[999990] w-[96%] max-w-6xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white p-2.5 select-none transition-all duration-200"
      >
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
          
          {/* GRUPO 1 (ESQUERDA): STATUS AO VIVO & MINI PRÉVIA DO SLIDE */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Indicador AO VIVO */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl h-9">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 whitespace-nowrap">
                TELÃO AO VIVO
              </span>
            </div>

            {/* Thumbnail Mini Preview */}
            <div 
              className={`w-36 h-9 rounded-xl px-2 py-1 flex flex-col justify-center border text-left overflow-hidden transition-all shrink-0 ${
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

          {/* GRUPO 2 (CENTRO): NAVEGAÇÃO DE SLIDES COM CONTADOR INTEGRADO (SEM SOBREPOSIÇÃO) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 h-9 shrink-0">
            <button
              onClick={() => holyricsService.prevSlide()}
              disabled={state.indiceAtual <= 0}
              className="h-8 px-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Slide Anterior (Seta Esquerda / PageUp)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Ant</span>
            </button>

            <div className="flex items-center px-2.5 font-mono text-xs font-black text-amber-300 border-x border-slate-800/80">
              <span>{state.indiceAtual + 1}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{state.slides.length}</span>
            </div>

            <button
              onClick={() => holyricsService.nextSlide()}
              disabled={state.indiceAtual >= state.slides.length - 1}
              className="h-8 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
              title="Próximo Slide (Espaço / Seta Direita / PageDown)"
            >
              <span className="hidden sm:inline text-[11px]">Próx</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* GRUPO 3 (AÇÕES RÁPIDAS): BLACKOUT, LIMPAR, LOGO, ALERTA, BÍBLIA, TEXTO, MÍDIAS (TODOS NO MESMO PADRÃO H-9) */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {/* Blackout */}
            <button
              onClick={() => holyricsService.toggleBlackout()}
              className={`h-9 px-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                state.blackout 
                  ? 'bg-rose-600 text-white shadow-md animate-pulse border border-rose-500' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Tela Preta Imediata no Telão (B)"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Blackout</span>
            </button>

            {/* Limpar Texto */}
            <button
              onClick={() => holyricsService.toggleClearText()}
              className={`h-9 px-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                state.limparTexto 
                  ? 'bg-amber-500 text-black shadow-md border border-amber-400 font-black' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Ocultar Texto Mantendo o Fundo (C)"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Limpar</span>
            </button>

            {/* Logo da Igreja */}
            <button
              onClick={() => holyricsService.toggleShowLogo()}
              className={`h-9 px-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                state.exibirLogo 
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-500' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Exibir Logo Oficial no Telão (L)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Logo</span>
            </button>

            {/* Alerta Rápido */}
            <button
              onClick={() => setShowAlertModal(true)}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Enviar Alerta no Rodapé do Telão (Veículos / Berçário)"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Alerta</span>
            </button>

            {/* NOVO: Bíblia Sagrada Offline */}
            <button
              onClick={() => setShowBibleModal(true)}
              className="h-9 px-2.5 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 hover:border-sky-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Selecionar / Pesquisar Versículo Bíblico Offline para o Telão"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Bíblia</span>
            </button>

            {/* NOVO: Área de Texto Livre */}
            <button
              onClick={() => setShowTextoLivreModal(true)}
              className="h-9 px-2.5 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-500/40 hover:border-amber-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Digitar Texto Livre com Formatação para o Projetor"
            >
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Texto Livre</span>
              <span className="sm:hidden">Texto</span>
            </button>

            {/* NOVO: Área de Mídias / Cartazes / Congressos */}
            <button
              onClick={() => setShowMidiaModal(true)}
              className="h-9 px-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/40 hover:border-indigo-500/80 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Projetar Imagens de Anúncios, Congressos, Conferências e Santa Ceia"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Mídias</span>
              <span className="sm:hidden">Mídia</span>
            </button>
          </div>

          {/* GRUPO 4 (DIREITA): JANELAS DE 2º MONITOR & CONTROLES DA BARRA */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Janela Telão (2º Monitor) */}
            <button
              onClick={handleOpenTelaoWindow}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-teal-400 hover:text-teal-300 border border-teal-500/40 hover:border-teal-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Abrir Janela do Telão no Segundo Monitor (Datashow)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Telão Ext.</span>
            </button>

            {/* Janela Púlpito (2º Monitor) */}
            <button
              onClick={handleOpenPulpitoWindow}
              className="h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Abrir Janela do Púlpito / Stage Display no Segundo Monitor"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Púlpito Ext.</span>
            </button>

            {/* Abrir Console Holyrics Completo */}
            {onOpenFullStudio && (
              <button
                onClick={onOpenFullStudio}
                className="h-9 w-9 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                title="Abrir Painel Completo de Mídia Holyrics"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Minimizar */}
            <button
              onClick={() => setMinimized(true)}
              className="h-9 w-9 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer"
              title="Minimizar Barra do Operador"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* Fechar Dock */}
            <button
              onClick={() => holyricsService.toggleAtivo(false)}
              className="h-9 w-9 bg-slate-900/90 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer"
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
