import React, { useState, useEffect, useContext } from 'react';
import { 
  Tv, Radio, Play, Pause, ChevronLeft, ChevronRight, Eye, EyeOff, 
  Maximize2, Bell, BookOpen, Shield, X, Sparkles, Sliders, ExternalLink, 
  Music, Check, Clock, Plus, Trash2, Palette, Type, RefreshCw, 
  Download, Upload, Volume2, Flame, Layers, LayoutTemplate, Car, Baby, Search
} from 'lucide-react';
import { 
  holyricsService, 
  HolyricsState, 
  HolyricsSlide, 
  HolyricsTheme,
  HARPA_CRISTAL_HINOS,
  VERSICULOS_RAPIDOS,
  ALERTAS_PRE_CONFIGURADOS,
  DEFAULT_HOLYRICS_SLIDES 
} from '../services/holyricsService';
import { MODULES_TEOLOGIA } from '../data/ModuleTeologiaData';
import { ChurchContext } from '../App';

export const ModuleHolyricsStudio: React.FC = () => {
  const { igreja, addToast, callGeminiAI } = useContext(ChurchContext) || {};
  const [state, setState] = useState<HolyricsState>(holyricsService.getState());
  
  // Abas da Biblioteca Lateral
  const [libraryTab, setLibraryTab] = useState<'apresentacoes' | 'harpa' | 'biblia' | 'alertas' | 'cronometro' | 'config'>('apresentacoes');
  
  // Busca na Harpa
  const [harpaSearch, setHarpaSearch] = useState<string>('');
  
  // Bíblia Personalizada
  const [bibliaLivro, setBibliaLivro] = useState<string>('João');
  const [bibliaCapitulo, setBibliaCapitulo] = useState<string>('3');
  const [bibliaVersiculo, setBibliaVersiculo] = useState<string>('16');
  const [bibliaTexto, setBibliaTexto] = useState<string>('Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.');

  // Criação / Edição de Slide Rápido
  const [showAddSlideModal, setShowAddSlideModal] = useState<boolean>(false);
  const [newSlideTitulo, setNewSlideTitulo] = useState<string>('');
  const [newSlideTexto, setNewSlideTexto] = useState<string>('');
  const [newSlideTipo, setNewSlideTipo] = useState<HolyricsSlide['tipo']>('topico');

  // Gerador de Sermão com IA
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiSermonPrompt, setAiSermonPrompt] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Alerta Personalizado
  const [customAlertText, setCustomAlertText] = useState<string>('');
  const [customAlertType, setCustomAlertType] = useState<'carro' | 'bercario' | 'aviso'>('carro');

  // Cronômetro
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [timerLabel, setTimerLabel] = useState<string>('Contagem para Início');

  useEffect(() => {
    const unsubscribe = holyricsService.subscribe((s) => {
      setState(s);
    });
    return () => unsubscribe();
  }, []);

  const currentSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual] || state.slides[0];
  const nextSlide: HolyricsSlide | undefined = state.slides[state.indiceAtual + 1];

  const handleOpenTelaoWindow = () => {
    const win = holyricsService.openTelaoWindow();
    if (!win) {
      if (addToast) addToast('Pop-up bloqueado! Por favor permita pop-ups para abrir o telão no segundo monitor.', 'error');
    } else {
      if (addToast) addToast('Janela do Telão aberta no 2º monitor!', 'success');
    }
  };

  // Carregar Apresentação de Teologia / EBD da CGADB
  const handleLoadTheologyModule = (modId: string) => {
    const mod = MODULES_TEOLOGIA.find(m => m.id === modId);
    if (!mod) return;

    const firstLesson = mod.lessons[0];
    const slides: HolyricsSlide[] = [
      {
        id: `mod-${mod.id}-capa`,
        tipo: 'capa',
        titulo: firstLesson ? firstLesson.title : mod.title,
        subtitulo: `Escola Bíblica & Faculdade Teológica • ${mod.title}`,
        texto: 'Declaração de Fé das Assembleias de Deus (CPAD / CGADB)'
      },
      {
        id: `mod-${mod.id}-verso`,
        tipo: 'versiculo',
        titulo: 'Texto Áureo da Lição',
        subtitulo: 'Verdade Prática',
        versiculo: {
          texto: 'Porque dele, e por ele, e para ele são todas as coisas; glória, pois, a ele eternamente. Amém!',
          referencia: 'Romanos 11:36'
        },
        notas: 'Pedir para toda a igreja ou classe ler o texto áureo em uníssono.'
      }
    ];

    if (firstLesson && firstLesson.pages) {
      firstLesson.pages.forEach((page, idx) => {
        slides.push({
          id: `mod-${mod.id}-page-${idx + 1}`,
          tipo: idx === 0 ? 'topico' : (idx === 1 ? 'doutrina' : 'aplicacao'),
          titulo: page.pageTitle,
          subtitulo: page.subtitle || `Tópico ${idx + 1}`,
          pontos: [
            'Fundamentação bíblica e histórica do ensino apostólico.',
            'Preservação da sã doutrina pentecostal contra desvios contemporâneos.',
            'Vivência prática da Palavra e frutificação do Espírito Santo.'
          ],
          notas: `Aplicação prática do tópico: ${page.pageTitle}`
        });
      });
    }

    // Conclusão
    slides.push({
      id: `mod-${mod.id}-conclusao`,
      tipo: 'conclusao',
      titulo: 'Conclusão & Oração Final',
      subtitulo: 'A graça do Senhor Jesus seja com todos os santos.',
      texto: 'Pratique a palavra ensinada durante a semana e compartilhe a fé cristã com fidelidade.'
    });

    holyricsService.loadPresentation(mod.title, slides, 'slides', true);
    if (addToast) addToast(`Apresentação "${mod.title}" carregada no Telão!`, 'success');
  };

  // Carregar Hino da Harpa Cristã
  const handleLoadHarpaHino = (hino: typeof HARPA_CRISTAL_HINOS[0]) => {
    holyricsService.projectSong(`Hino ${hino.numero} - ${hino.titulo}`, 'Harpa Cristã', hino.estrofes);
    if (addToast) addToast(`Hino ${hino.numero} da Harpa Cristã transmitido para o Telão!`, 'success');
  };

  // Gerar Slides com IA
  const handleGenerateAiSlides = async () => {
    if (!aiSermonPrompt.trim() || !callGeminiAI) return;
    setLoadingAi(true);

    try {
      const prompt = `Você é um doutor em teologia bíblica pentecostal da Assembleia de Deus (CPAD / CGADB).
Crie uma apresentação estruturada de 5 slides para projeção no telão estilo Holyrics sobre o tema: "${aiSermonPrompt}".
Retorne EXCLUSIVAMENTE um JSON puro no formato:
[
  {
    "id": "1",
    "tipo": "capa",
    "titulo": "Título Nobre do Sermão",
    "subtitulo": "Subtítulo Bíblico",
    "notas": "Instruções ao preletor"
  },
  {
    "id": "2",
    "tipo": "versiculo",
    "titulo": "Texto Áureo",
    "subtitulo": "Verdade Bíblica",
    "versiculo": { "texto": "Texto do versículo", "referencia": "Livro Cap:Vers" },
    "notas": "Leitura com a congregação"
  },
  {
    "id": "3",
    "tipo": "topico",
    "titulo": "I - Primeiro Princípio",
    "subtitulo": "Exposição Teológica",
    "pontos": ["Ponto A", "Ponto B", "Ponto C"],
    "notas": "Explicação"
  },
  {
    "id": "4",
    "tipo": "topico",
    "titulo": "II - Segundo Princípio",
    "subtitulo": "Doutrina Pentecostal",
    "pontos": ["Ponto A", "Ponto B", "Ponto C"],
    "notas": "Explicação"
  },
  {
    "id": "5",
    "tipo": "conclusao",
    "titulo": "Aplicação & Apelo",
    "subtitulo": "Oração Final",
    "pontos": ["Entregue sua vida a Cristo", "Busque o poder do Espírito Santo"],
    "notas": "Momento de oração"
  }
]`;

      const response = await callGeminiAI(prompt);
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      cleanJson = cleanJson.trim();

      const parsed: HolyricsSlide[] = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        holyricsService.loadPresentation(aiSermonPrompt, parsed, 'slides', true);
        setShowAiModal(false);
        setAiSermonPrompt('');
        if (addToast) addToast('Apresentação gerada por IA carregada no Telão!', 'success');
      }
    } catch (e: any) {
      alert('Erro ao gerar com IA: ' + e.message);
    } finally {
      setLoadingAi(false);
    }
  };

  // Filtragem da Harpa
  const filteredHinos = HARPA_CRISTAL_HINOS.filter(h => 
    h.titulo.toLowerCase().includes(harpaSearch.toLowerCase()) || 
    h.numero.toString().includes(harpaSearch)
  );

  return (
    <div className="min-h-[85vh] flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-sans select-none">
      
      {/* BARRA SUPERIOR DO ESTÚDIO HOLYRICS */}
      <header className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-900/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Central de Projeção & Telão Holyrics</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                Multitelas Ativo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transmita para o projetor ou TV do templo enquanto opera o sistema livremente no segundo monitor.
            </p>
          </div>
        </div>

        {/* Ações Globais do Telão */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTelaoWindow}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-teal-900/40 flex items-center gap-2 transition-all active:scale-95"
            title="Abre a janela sem bordas para arrastar para o Projetor / Telão"
          >
            <Tv className="w-4 h-4" />
            <span>Abrir Telão no 2º Monitor (Projetor)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            onClick={() => holyricsService.toggleStageDisplay()}
            className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
              state.modoRetornoPalco 
                ? 'bg-amber-500 text-black border-amber-400 shadow-md' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Alternar Modo Retorno de Palco (Horário, Slide Atual e Próximo para Músicos/Pregador)"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Retorno de Palco</span>
          </button>

          <button
            onClick={() => holyricsService.toggleLowerThird()}
            className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
              state.modoLowerThird 
                ? 'bg-purple-600 text-white border-purple-400 shadow-md' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Modo Terço Inferior para OBS e Live Streaming"
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Lower Third (OBS)</span>
          </button>
        </div>
      </header>

      {/* ÁREA DE TRABALHO EM 3 COLUNAS ESTILO HOLYRICS */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* COLUNA 1: BIBLIOTECA DE CONTEÚDOS (ESQUERDA - 3 COLUNAS) */}
        <div className="col-span-12 lg:col-span-3 border-r border-slate-800 bg-slate-900/40 flex flex-col overflow-hidden">
          {/* Navegação de Abas da Biblioteca */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 p-1.5 gap-1 overflow-x-auto text-[11px] font-bold">
            <button
              onClick={() => setLibraryTab('apresentacoes')}
              className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                libraryTab === 'apresentacoes' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Apresentações</span>
            </button>
            <button
              onClick={() => setLibraryTab('harpa')}
              className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                libraryTab === 'harpa' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Harpa</span>
            </button>
            <button
              onClick={() => setLibraryTab('biblia')}
              className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                libraryTab === 'biblia' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bíblia</span>
            </button>
            <button
              onClick={() => setLibraryTab('alertas')}
              className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                libraryTab === 'alertas' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alertas</span>
            </button>
          </div>

          {/* Conteúdo da Biblioteca */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            
            {/* ABA: APRESENTAÇÕES & MÓDULOS TEOLÓGICOS */}
            {libraryTab === 'apresentacoes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Módulos Doutrinários CGADB:
                  </span>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="text-[10px] font-black uppercase text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20"
                  >
                    <Sparkles className="w-3 h-3" />
                    Gerar com IA
                  </button>
                </div>

                {/* Lista de Módulos Oficiais */}
                <div className="space-y-2">
                  {MODULES_TEOLOGIA.map((mod) => (
                    <div 
                      key={mod.id}
                      onClick={() => handleLoadTheologyModule(mod.id)}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300">
                          {mod.title}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {mod.lessons?.length || 0} aulas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Apresentação Padrão do Culto */}
                <button
                  onClick={() => holyricsService.loadPresentation('Culto de Celebração e Louvor', DEFAULT_HOLYRICS_SLIDES, 'slides', true)}
                  className="w-full p-3 bg-teal-950/30 hover:bg-teal-900/40 border border-teal-800/40 rounded-xl text-left transition-all"
                >
                  <div className="text-xs font-black text-teal-300 uppercase">
                    Apresentação Padrão de Culto
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Boas-vindas, Texto Áureo, Hino 15, Doutrina e Oração
                  </div>
                </button>
              </div>
            )}

            {/* ABA: HARPA CRISTÃ & HINÁRIO */}
            {libraryTab === 'harpa' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={harpaSearch}
                    onChange={(e) => setHarpaSearch(e.target.value)}
                    placeholder="Buscar hino por número ou título..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  {filteredHinos.map((hino) => (
                    <div
                      key={hino.numero}
                      onClick={() => handleLoadHarpaHino(hino)}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">
                          Hino {hino.numero}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {hino.estrofes.length} estrofes
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 mt-0.5">
                        {hino.titulo}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 italic">
                        {hino.estrofes[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA: BÍBLIA SAGRADA INSTANTÂNEA */}
            {libraryTab === 'biblia' && (
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Versículos Rápidos:
                </span>
                
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {VERSICULOS_RAPIDOS.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => holyricsService.projectBibleVerse(item.ref, item.texto)}
                      className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-xs font-black text-sky-400">{item.ref}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-2 italic mt-0.5">"{item.texto}"</div>
                    </div>
                  ))}
                </div>

                {/* Digitação Livre de Versículo */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Projeção Sob Demanda:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={bibliaLivro}
                      onChange={(e) => setBibliaLivro(e.target.value)}
                      placeholder="Livro"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={bibliaCapitulo}
                      onChange={(e) => setBibliaCapitulo(e.target.value)}
                      placeholder="Cap."
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={bibliaVersiculo}
                      onChange={(e) => setBibliaVersiculo(e.target.value)}
                      placeholder="Vers."
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                  </div>
                  <textarea
                    value={bibliaTexto}
                    onChange={(e) => setBibliaTexto(e.target.value)}
                    placeholder="Texto do versículo..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white resize-none"
                  />
                  <button
                    onClick={() => holyricsService.projectBibleVerse(`${bibliaLivro} ${bibliaCapitulo}:${bibliaVersiculo}`, bibliaTexto)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow transition-all"
                  >
                    Projetar Versículo no Telão
                  </button>
                </div>
              </div>
            )}

            {/* ABA: ALERTAS & AVISOS DE TELÃO */}
            {libraryTab === 'alertas' && (
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Modelos Prontos de Alerta:
                </span>
                
                <div className="space-y-2">
                  {ALERTAS_PRE_CONFIGURADOS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        let text = item.template;
                        if (text.includes('[PLACA]')) {
                          const p = prompt('Digite a placa do carro:');
                          if (!p) return;
                          text = text.replace('[PLACA]', p.toUpperCase());
                        } else if (text.includes('[NOME]')) {
                          const n = prompt('Nome da criança:');
                          if (!n) return;
                          text = text.replace('[NOME]', n);
                        } else if (text.includes('[CHAVE]')) {
                          text = text.replace('[CHAVE]', (igreja as any)?.chave_pix || 'PIX Oficial');
                        }
                        holyricsService.sendAlert(text, item.tipo, undefined, 30);
                      }}
                      className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center gap-2 text-slate-200 transition-all"
                    >
                      {item.tipo === 'carro' ? <Car className="w-4 h-4 text-amber-400 shrink-0" /> : <Baby className="w-4 h-4 text-pink-400 shrink-0" />}
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Mensagem de Texto Avulsa:
                  </span>
                  <textarea
                    value={customAlertText}
                    onChange={(e) => setCustomAlertText(e.target.value)}
                    placeholder="Digite o recado para o telão..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!customAlertText.trim()) return;
                        holyricsService.sendAlert(customAlertText, customAlertType, undefined, 30);
                        setCustomAlertText('');
                      }}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow transition-all"
                    >
                      Enviar Alerta
                    </button>
                    {state.alertaAtivo && (
                      <button
                        onClick={() => holyricsService.clearAlert()}
                        className="px-3 py-2 bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl"
                        title="Limpar Alerta"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* COLUNA 2: GRADE DE SLIDES ATIVOS (CENTRO - 5 COLUNAS) */}
        <div className="col-span-12 lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
          {/* Header da Apresentação */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                {state.categoria} • {state.slides.length} slides
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md">
                {state.tituloApresentacao}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                {state.indiceAtual + 1} / {state.slides.length}
              </span>
            </div>
          </div>

          {/* Grade de Slides da Apresentação */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {state.slides.map((slide, idx) => {
              const isLive = state.indiceAtual === idx;

              return (
                <div
                  key={slide.id || idx}
                  onClick={() => holyricsService.goToSlide(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none relative ${
                    isLive 
                      ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-950/30 ring-2 ring-rose-500/50' 
                      : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {/* Badge de Posição & Ao Vivo */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        isLive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90">
                        {slide.tipo}
                      </span>
                    </div>

                    {isLive && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white rounded-md text-[9px] font-black tracking-widest uppercase animate-pulse">
                        NO TELÃO
                      </span>
                    )}
                  </div>

                  {/* Título & Subtítulo */}
                  <div className="text-sm font-bold text-white mb-1">
                    {slide.titulo}
                  </div>

                  {slide.subtitulo && (
                    <div className="text-xs text-amber-400/80 mb-2 font-medium">
                      {slide.subtitulo}
                    </div>
                  )}

                  {/* Conteúdo Resumido do Slide */}
                  {slide.versiculo ? (
                    <p className="text-xs text-slate-300 italic line-clamp-3 bg-black/30 p-2 rounded-lg border border-slate-800/80">
                      "{slide.versiculo.texto}"
                      <span className="block text-right font-bold text-amber-400 mt-1 not-italic">
                        — {slide.versiculo.referencia}
                      </span>
                    </p>
                  ) : slide.texto ? (
                    <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-line bg-black/20 p-2 rounded-lg">
                      {slide.texto}
                    </p>
                  ) : slide.pontos ? (
                    <ul className="text-xs text-slate-300 space-y-1 bg-black/20 p-2 rounded-lg">
                      {slide.pontos.map((p, pIdx) => (
                        <li key={pIdx} className="line-clamp-1">• {p}</li>
                      ))}
                    </ul>
                  ) : null}

                  {slide.notas && (
                    <div className="text-[10px] text-slate-500 italic mt-2 border-t border-slate-800/80 pt-1">
                      Nota: {slide.notas}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA 3: CONTROLES MASTER & PREVIEWS (DIREITA - 4 COLUNAS) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900/30 flex flex-col justify-between overflow-y-auto p-4 space-y-4">
          
          {/* PREVIEW DO QUE ESTÁ AO VIVO NO TELÃO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-widest uppercase text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                AO VIVO (TELÃO DO TEMPLO)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Tema: {state.tema}
              </span>
            </div>

            {/* Caixa de Espelhamento do Telão */}
            <div className={`w-full aspect-video rounded-2xl p-4 flex flex-col justify-between border shadow-2xl relative overflow-hidden transition-all ${
              state.blackout 
                ? 'bg-black border-rose-500/80' 
                : state.tema === 'dark' 
                  ? 'bg-black border-zinc-800' 
                  : state.tema === 'amber' 
                    ? 'bg-gradient-to-br from-amber-950 to-slate-950 border-amber-800/50' 
                    : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-slate-700'
            }`}>
              {state.blackout ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-950/40 px-3 py-1 rounded-full border border-rose-900/50">
                    ⚠️ Blackout Ativo (Tela Cortada)
                  </span>
                </div>
              ) : state.limparTexto ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Shield className="w-10 h-10 text-amber-400/40 mb-2" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Texto Oculto • Fundo Ativo
                  </span>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    {currentSlide?.subtitulo && (
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                        {currentSlide.subtitulo}
                      </span>
                    )}
                  </div>

                  <div className="my-auto text-center px-2">
                    {currentSlide?.versiculo ? (
                      <p className="text-xs font-bold text-white leading-tight italic">
                        "{currentSlide.versiculo.texto}"
                        <span className="block text-[10px] text-amber-400 not-italic mt-1">
                          — {currentSlide.versiculo.referencia}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-white leading-snug whitespace-pre-line">
                        {currentSlide?.texto || currentSlide?.pontos?.join('\n') || currentSlide?.titulo}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                    <span>{state.igrejaNome}</span>
                    <span>Slide {state.indiceAtual + 1} / {state.slides.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PREVIEW DO PRÓXIMO SLIDE (A SEGUIR) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400 flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5" />
              A SEGUIR (PRÓXIMO SLIDE)
            </span>

            <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              {nextSlide ? (
                <div>
                  <div className="text-xs font-bold text-slate-200">{nextSlide.titulo}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {nextSlide.versiculo ? nextSlide.versiculo.texto : nextSlide.texto || nextSlide.pontos?.join(' • ')}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  [ Fim da apresentação ]
                </div>
              )}
            </div>
          </div>

          {/* BOTÕES MASTER DE DISPARO RÁPIDO */}
          <div className="space-y-2">
            <span className="text-[11px] font-black tracking-widest uppercase text-slate-400">
              Comandos de Transmissão:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => holyricsService.prevSlide()}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior (◄)</span>
              </button>

              <button
                onClick={() => holyricsService.nextSlide()}
                className="py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-teal-950/50 transition-all active:scale-95"
              >
                <span>Próximo (►)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => holyricsService.toggleBlackout()}
                className={`py-2.5 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  state.blackout ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>Blackout (B)</span>
              </button>

              <button
                onClick={() => holyricsService.toggleClearText()}
                className={`py-2.5 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  state.limparTexto ? 'bg-amber-500 text-black shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Limpar Texto (C)</span>
              </button>

              <button
                onClick={() => holyricsService.toggleShowLogo()}
                className={`col-span-2 py-2.5 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  state.exibirLogo ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Brasão / Logo da Igreja no Telão</span>
              </button>
            </div>
          </div>

          {/* AJUSTES VISUAIS DE TEMA E TIPOGRAFIA */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-black tracking-widest uppercase text-slate-400">
              Temas do Telão:
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              {(['navy', 'dark', 'amber', 'clean', 'royal', 'cinema'] as HolyricsTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => holyricsService.setTheme(thm)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    state.tema === thm 
                      ? 'bg-amber-500 text-black border-amber-400 font-black' 
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>

            {/* Escala de Tamanho de Fonte */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] uppercase text-slate-400">Tamanho da Fonte:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => holyricsService.setFontSizeRatio(state.tamanhoFonteRatio - 0.1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {Math.round(state.tamanhoFonteRatio * 100)}%
                </span>
                <button
                  onClick={() => holyricsService.setFontSizeRatio(state.tamanhoFonteRatio + 0.1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE GERADOR COM INTELIGÊNCIA ARTIFICIAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg">Gerador de Slides Teológicos com IA</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Insira o tema do sermão ou estudo bíblico. A IA estruturará slides com capa, texto áureo, tópicos doutrinários e conclusão alinhados à Declaração de Fé da CPAD/CGADB.
            </p>

            <textarea
              value={aiSermonPrompt}
              onChange={(e) => setAiSermonPrompt(e.target.value)}
              placeholder="Ex: A Eficácia da Oração e o Batismo no Espírito Santo com evidência inicial de falar em outras línguas..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-hidden focus:border-amber-400 resize-none mb-4"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateAiSlides}
                disabled={!aiSermonPrompt.trim() || loadingAi}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loadingAi ? 'Gerando Slides...' : 'Gerar Slides Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ModuleHolyricsStudio;
