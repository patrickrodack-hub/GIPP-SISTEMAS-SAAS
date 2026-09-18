import React, { useState, useEffect, useContext } from 'react';
import { 
  Tv, Radio, Play, Pause, ChevronLeft, ChevronRight, Eye, EyeOff, 
  Maximize2, Bell, BookOpen, Shield, X, Minimize2, Move, AlertTriangle, 
  Car, Baby, Sliders, ExternalLink, Sparkles, Music, Check, Clock, Flame
} from 'lucide-react';
import { 
  holyricsService, 
  HolyricsState, 
  HolyricsSlide, 
  ALERTAS_PRE_CONFIGURADOS,
  VERSICULOS_RAPIDOS 
} from '../services/holyricsService';
import { ChurchContext } from '../App';

interface Props {
  onOpenFullStudio?: () => void;
}

export const HolyricsOperatorDock: React.FC<Props> = ({ onOpenFullStudio }) => {
  const { igreja, addToast } = useContext(ChurchContext) || {};
  const [state, setState] = useState<HolyricsState>(holyricsService.getState());
  const [minimized, setMinimized] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showBibleModal, setShowBibleModal] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [alertType, setAlertType] = useState<'carro' | 'bercario' | 'aviso' | 'urgente'>('carro');

  // Bíblia Rápida
  const [bibleQuery, setBibleQuery] = useState<string>('');
  const [selectedQuickVerse, setSelectedQuickVerse] = useState<{ ref: string; texto: string } | null>(null);

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

  // Se a projeção não estiver ativa e não estivermos exibindo o dock, podemos ocultar ou mostrar quando o usuário ativa
  if (!state.ativo && !minimized) {
    return null;
  }

  const currentSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual] || state.slides[0];
  const nextSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual + 1];

  const handleOpenTelaoWindow = () => {
    const win = holyricsService.openTelaoWindow();
    if (!win) {
      if (addToast) {
        addToast('Pop-up bloqueado pelo navegador! Permita pop-ups para abrir o telão em tela separada.', 'error');
      } else {
        alert('Pop-up bloqueado pelo navegador! Por favor, autorize pop-ups para abrir o telão no segundo monitor.');
      }
    } else {
      if (addToast) addToast('Janela do Telão aberta para o 2º Monitor!', 'success');
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

  const handleProjectQuickVerse = (ref: string, texto: string) => {
    holyricsService.projectBibleVerse(ref, texto);
    setShowBibleModal(false);
    if (addToast) addToast(`Versículo ${ref} projetado no telão!`, 'success');
  };

  // Versão Super Minimizada (Pílula Flutuante)
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[999999] flex items-center gap-2 bg-slate-950/95 text-white px-3 py-2 rounded-2xl shadow-2xl border border-teal-500/40 backdrop-blur-md animate-in fade-in select-none">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
            {state.blackout ? 'BLACKOUT' : 'AO VIVO'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <span className="text-xs font-mono font-bold text-amber-300">
          {state.indiceAtual + 1}/{state.slides.length}
        </span>

        <button
          onClick={() => holyricsService.prevSlide()}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          title="Slide Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.nextSlide()}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          title="Próximo Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.toggleBlackout()}
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${state.blackout ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          title="Blackout (B)"
        >
          B
        </button>

        <button
          onClick={() => setMinimized(false)}
          className="p-1 rounded-lg hover:bg-slate-800 text-teal-400 hover:text-teal-300 transition-all ml-1"
          title="Expandir Barra do Operador"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => holyricsService.toggleAtivo(false)}
          className="p-1 rounded-lg hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-all ml-0.5"
          title="Fechar Barra de Projeção"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Versão Dock Completa do Operador (Não Bloqueante)
  return (
    <>
      <aside 
        aria-label="Controle de Projeção Holyrics"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[999990] w-[95%] max-w-5xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-white p-3 select-none transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* LADO ESQUERDO: INDICADOR DE STATUS & PRÉVIA DO SLIDE ATUAL */}
          <div className="flex items-center gap-3 min-w-0 max-w-sm">
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  TELÃO AO VIVO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={state.tituloApresentacao}>
                {state.tituloApresentacao}
              </div>
            </div>

            {/* Thumbnail Mini Preview */}
            <div 
              className={`w-28 h-12 rounded-lg p-1.5 flex flex-col justify-center border text-left overflow-hidden transition-all shrink-0 ${
                state.blackout 
                  ? 'bg-black border-rose-500/50 text-rose-400' 
                  : state.limparTexto 
                    ? 'bg-slate-900 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {state.blackout ? (
                <span className="text-[9px] font-black text-rose-400 leading-tight uppercase">⚠️ Blackout</span>
              ) : state.limparTexto ? (
                <span className="text-[9px] font-black text-amber-400 leading-tight uppercase">✨ Texto Oculto</span>
              ) : (
                <>
                  <span className="text-[9px] font-bold text-amber-400 truncate leading-none mb-0.5">
                    {currentSlide?.titulo || 'Slide'}
                  </span>
                  <span className="text-[8px] text-slate-300 line-clamp-2 leading-tight">
                    {currentSlide?.versiculo ? currentSlide.versiculo.texto : currentSlide?.texto || currentSlide?.subtitulo || ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CENTRO: NAVEGAÇÃO DE SLIDES & CONTADOR */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => holyricsService.prevSlide()}
              disabled={state.indiceAtual <= 0}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
              title="Slide Anterior (Seta Esquerda / PageUp)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex flex-col items-center px-2">
              <span className="text-xs font-black font-mono text-amber-300 tracking-wider">
                {state.indiceAtual + 1} / {state.slides.length}
              </span>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${((state.indiceAtual + 1) / Math.max(1, state.slides.length)) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => holyricsService.nextSlide()}
              disabled={state.indiceAtual >= state.slides.length - 1}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-lg shadow-teal-900/40 transition-all active:scale-95"
              title="Próximo Slide (Espaço / Seta Direita / PageDown)"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* LADO DIREITO: BOTÕES DE AÇÃO RÁPIDA ESTILO HOLYRICS */}
          <div className="flex items-center gap-1.5">
            {/* Blackout */}
            <button
              onClick={() => holyricsService.toggleBlackout()}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1 transition-all ${
                state.blackout 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 animate-pulse' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Tela Preta Imediata no Telão (B)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Blackout</span>
            </button>

            {/* Limpar Texto */}
            <button
              onClick={() => holyricsService.toggleClearText()}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1 transition-all ${
                state.limparTexto 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/50' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Ocultar Texto Mantendo o Fundo (C)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Limpar</span>
            </button>

            {/* Logo da Igreja */}
            <button
              onClick={() => holyricsService.toggleShowLogo()}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1 transition-all ${
                state.exibirLogo 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Exibir Logo Oficial no Telão (L)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Logo</span>
            </button>

            {/* Alerta Rápido (Placas / Berçário) */}
            <button
              onClick={() => setShowAlertModal(true)}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
              title="Enviar Alerta no Rodapé do Telão"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce text-amber-400" />
              <span className="hidden md:inline">Alerta</span>
            </button>

            {/* Bíblia Rápida */}
            <button
              onClick={() => setShowBibleModal(true)}
              className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
              title="Projetar Versículo Bíblico Instantâneo"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Bíblia</span>
            </button>

            {/* Janela Telão (2º Monitor) */}
            <button
              onClick={handleOpenTelaoWindow}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Abrir / Focar Janela do Telão no Segundo Monitor"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Telão Ext.</span>
            </button>

            {/* Janela Púlpito (2º Monitor) */}
            <button
              onClick={() => {
                const win = holyricsService.openPulpitoWindow();
                if (win) {
                  if (addToast) addToast('Janela do Púlpito aberta para o 2º Monitor!', 'success');
                } else {
                  if (addToast) addToast('Permita pop-ups no navegador para abrir o púlpito.', 'error');
                }
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Abrir Janela do Púlpito / Stage Display no Segundo Monitor"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Púlpito Ext.</span>
            </button>

            {/* Abrir Console Holyrics Completo */}
            {onOpenFullStudio && (
              <button
                onClick={onOpenFullStudio}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all"
                title="Abrir Painel Completo de Mídia Holyrics"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Minimizar */}
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Minimizar para Pílula Flutuante"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* Fechar Dock */}
            <button
              onClick={() => holyricsService.toggleAtivo(false)}
              className="p-1.5 bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Fechar Barra de Controle do Telão"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL DE ALERTA RÁPIDO NO TELÃO (Carro, Berçário, etc.) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="font-black text-lg">Alerta Rápido no Telão</h3>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              O aviso aparecerá como um banner animado no rodapé do telão sem interromper os slides ou a pregação.
            </p>

            {/* Alertas Pré-configurados mais comuns */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Modelos Rápidos da Igreja:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALERTAS_PRE_CONFIGURADOS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPredefinedAlert(item.template, item.tipo)}
                    className="text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:text-amber-300 hover:border-amber-500/40 transition-all flex items-center gap-2"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-hidden focus:border-amber-400 resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {state.alertaAtivo ? (
                <button
                  onClick={() => { holyricsService.clearAlert(); setShowAlertModal(false); }}
                  className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-xl text-xs font-bold transition-all"
                >
                  Remover Alerta Atual
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendCustomAlert}
                  disabled={!alertText.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow-lg transition-all"
                >
                  Transmitir Alerta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE BÍBLIA RÁPIDA NO TELÃO */}
      {showBibleModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <h3 className="font-black text-lg">Bíblia Rápida para o Telão</h3>
              </div>
              <button 
                onClick={() => setShowBibleModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Projete o versículo citado pelo pregador instantaneamente no telão:
            </p>

            {/* Versículos Áureos Mais Frequentes */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-1">
              {VERSICULOS_RAPIDOS.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleProjectQuickVerse(item.ref, item.texto)}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-amber-400 group-hover:text-sky-300">
                      {item.ref}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider group-hover:text-sky-400">
                      Projetar Agora ➔
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{item.texto}"
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowBibleModal(false)}
                className="px-5 py-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
