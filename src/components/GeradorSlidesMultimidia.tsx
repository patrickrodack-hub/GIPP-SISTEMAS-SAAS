import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Maximize, Minimize, ChevronLeft, ChevronRight, Play, Sparkles, 
  Download, Printer, X, Monitor, Palette, BookOpen, Flame, 
  HelpCircle, Eye, EyeOff, LayoutTemplate, Sliders, Type, 
  FileText, Share2, Check, Copy, RefreshCw, Layers
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { MODULES_TEOLOGIA } from '../data/ModuleTeologiaData';
import { holyricsService, HolyricsSlide } from '../services/holyricsService';
import { Tv, ExternalLink } from 'lucide-react';

export interface SlideItem {
  id: string;
  tipo: 'capa' | 'versiculo' | 'topico' | 'doutrina' | 'aplicacao' | 'quiz' | 'conclusao';
  titulo: string;
  subtitulo?: string;
  versiculo?: { texto: string; referencia: string };
  pontos?: string[];
  conteudo?: string;
  referenciaDoutrinaria?: string;
  notasProfessor?: string;
}

export interface GeradorSlidesProps {
  isOpen: boolean;
  onClose: () => void;
  moduloInicial?: string;
  tituloCustom?: string;
  slidesIniciais?: SlideItem[];
  callGeminiAI?: (prompt: string) => Promise<string>;
}

export const GeradorSlidesMultimidia: React.FC<GeradorSlidesProps> = ({
  isOpen,
  onClose,
  moduloInicial,
  tituloCustom,
  slidesIniciais,
  callGeminiAI
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(moduloInicial || 'teontologia');
  const [slides, setSlides] = useState<SlideItem[]>(slidesIniciais || []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  
  // Modos de exibição
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'navy' | 'amber' | 'dark' | 'clean'>('navy');
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(1);
  const [blackout, setBlackout] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  
  // Gerador com IA
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza índice do slide com Holyrics quando a projeção estiver ativa
  useEffect(() => {
    if (holyricsService.getState().ativo) {
      holyricsService.goToSlide(currentSlideIndex);
    }
  }, [currentSlideIndex]);

  // Carrega slides baseados no módulo selecionado caso não tenham vindo prontos
  useEffect(() => {
    if (slidesIniciais && slidesIniciais.length > 0) {
      setSlides(slidesIniciais);
      return;
    }

    const mod = MODULES_TEOLOGIA.find(m => m.id === selectedModuleId) || MODULES_TEOLOGIA[0];
    if (!mod) return;

    const firstLesson = mod.lessons[0];
    const generated: SlideItem[] = [
      {
        id: 'slide-1',
        tipo: 'capa',
        titulo: firstLesson ? firstLesson.title : mod.title,
        subtitulo: `Escola Bíblica Dominical & Faculdade Teológica • ${mod.title}`,
        referenciaDoutrinaria: 'Declaração de Fé das Assembleias de Deus (CGADB / CPAD)',
        notasProfessor: 'Boas-vindas aos alunos e membros. Apresente o tema e convide a classe a orar antes de iniciar a lição.'
      },
      {
        id: 'slide-2',
        tipo: 'versiculo',
        titulo: 'Texto Áureo da Lição',
        versiculo: {
          texto: 'Porque dele, e por ele, e para ele são todas as coisas; glória, pois, a ele eternamente. Amém!',
          referencia: 'Romanos 11:36'
        },
        subtitulo: 'Verdade Prática / Princípio Regente',
        notasProfessor: 'Peça para a congregação ler o versículo em uníssono. Enfatize a soberania e suficiência divina.'
      }
    ];

    // Converte as páginas da lição em tópicos de apresentação
    if (firstLesson && firstLesson.pages) {
      firstLesson.pages.forEach((page, idx) => {
        generated.push({
          id: `slide-topic-${idx + 3}`,
          tipo: idx === 0 ? 'topico' : (idx === 1 ? 'doutrina' : 'aplicacao'),
          titulo: page.pageTitle,
          subtitulo: page.subtitle || `Tópico ${idx + 1}`,
          pontos: [
            'Fundamentação bíblica e histórica do ensino apostólico.',
            'Preservação da sã doutrina pentecostal contra os desvios contemporâneos.',
            'Ação contínua e vivificadora do Espírito Santo no ministério cristão.'
          ],
          conteudo: typeof page.text === 'string' ? page.text : undefined,
          referenciaDoutrinaria: 'CGADB / CPAD - Artigo Oficial',
          notasProfessor: `Destaque a aplicação prática do tópico "${page.pageTitle}" na vida da igreja local.`
        });
      });
    }

    // Slide de Fixação / Quiz
    if (mod.quiz && mod.quiz.length > 0) {
      const q = mod.quiz[0];
      generated.push({
        id: 'slide-quiz',
        tipo: 'quiz',
        titulo: 'Fixação & Interação da Classe',
        subtitulo: q.question,
        pontos: q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`),
        notasProfessor: `Gabarito correto: ${String.fromCharCode(65 + q.correctIndex)}. Explicar o porquê aos alunos.`
      });
    }

    // Slide Final
    generated.push({
      id: 'slide-final',
      tipo: 'conclusao',
      titulo: 'Conclusão & Oração Final',
      subtitulo: 'Que a graça do Senhor Jesus Cristo, o amor de Deus e a comunhão do Espírito Santo sejam com todos nós.',
      pontos: [
        'Pratique a palavra aprendida durante toda a semana.',
        'Compartilhe a fé cristã com fidelidade bíblica.',
        'Nos vemos no próximo domingo na Escola Bíblica!'
      ],
      notasProfessor: 'Momento de oração com a igreja/classe. Agradecer a Deus pelas revelações da Palavra.'
    });

    setSlides(generated);
    setCurrentSlideIndex(0);
  }, [selectedModuleId, slidesIniciais]);

  // Atalhos de teclado para o preletor / professor
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'b' || e.key === 'B') {
        setBlackout(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, isFullscreen]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Gerador de Slides com Gemini AI
  const handleGenerateAiSlides = async () => {
    if (!aiPrompt.trim() || !callGeminiAI) return;
    setGeneratingAi(true);

    try {
      const prompt = `Você é um doutor em teologia bíblica e professor da Escola Bíblica Dominical da Assembleia de Deus (CPAD / CGADB).
Crie uma apresentação estruturada de 5 a 6 slides para projeção em telão/datashow sobre o tema: "${aiPrompt}".
Retorne EXCLUSIVAMENTE um array JSON puro (sem markdown, sem prefixo) no seguinte formato:
[
  {
    "id": "1",
    "tipo": "capa",
    "titulo": "Título Nobre e Preciso",
    "subtitulo": "Subtítulo exegético",
    "referenciaDoutrinaria": "Capítulo correspondente da Declaração de Fé da CGADB / CPAD",
    "notasProfessor": "Dicas para o pregador/professor"
  },
  {
    "id": "2",
    "tipo": "versiculo",
    "titulo": "Texto Áureo",
    "versiculo": { "texto": "Texto do versículo na íntegra", "referencia": "Livro Cap:Vers" },
    "subtitulo": "Verdade Prática",
    "notasProfessor": "Instrução"
  },
  {
    "id": "3",
    "tipo": "topico",
    "titulo": "I - Primeiro Ponto Principal",
    "subtitulo": "Explicação teológica",
    "pontos": ["Ponto A", "Ponto B", "Ponto C"],
    "notasProfessor": "Notas do preletor"
  },
  {
    "id": "4",
    "tipo": "topico",
    "titulo": "II - Segundo Ponto Principal",
    "subtitulo": "Fundamento doutrinário",
    "pontos": ["Ponto A", "Ponto B", "Ponto C"],
    "notasProfessor": "Notas do preletor"
  },
  {
    "id": "5",
    "tipo": "aplicacao",
    "titulo": "Aplicação Prática e Conclusão",
    "subtitulo": "Como viver essa verdade",
    "pontos": ["Aplicação 1", "Aplicação 2"],
    "notasProfessor": "Conclusão"
  }
]`;

      const response = await callGeminiAI(prompt);
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      cleanJson = cleanJson.trim();

      const parsed: SlideItem[] = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSlides(parsed);
        setCurrentSlideIndex(0);
        setShowAiModal(false);
      }
    } catch (e: any) {
      alert('Falha ao gerar slides por IA: ' + e.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Exportar Apostila / Handout em PDF
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [1920, 1080] });
      
      slides.forEach((s, idx) => {
        if (idx > 0) doc.addPage([1920, 1080], 'landscape');

        // Background
        doc.setFillColor(15, 23, 42); // Navy
        doc.rect(0, 0, 1920, 1080, 'F');

        // Header decorativo
        doc.setFillColor(234, 179, 8); // Gold
        doc.rect(0, 0, 1920, 20, 'F');

        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(54);
        doc.text(s.titulo, 120, 180, { maxWidth: 1680 });

        if (s.subtitulo) {
          doc.setTextColor(234, 179, 8);
          doc.setFontSize(32);
          doc.text(s.subtitulo, 120, 260, { maxWidth: 1680 });
        }

        // Conteúdo
        if (s.versiculo) {
          doc.setTextColor(226, 232, 240);
          doc.setFontSize(40);
          doc.text(`"${s.versiculo.texto}"`, 120, 420, { maxWidth: 1600 });
          doc.setTextColor(234, 179, 8);
          doc.setFontSize(36);
          doc.text(`— ${s.versiculo.referencia}`, 120, 580);
        } else if (s.pontos && s.pontos.length > 0) {
          doc.setTextColor(241, 245, 249);
          doc.setFontSize(36);
          let yPos = 380;
          s.pontos.forEach((pt) => {
            doc.text(`• ${pt}`, 120, yPos, { maxWidth: 1600 });
            yPos += 90;
          });
        }

        // Rodapé
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(22);
        doc.text(`Escola Bíblica & Universidade Teológica • Slide ${idx + 1} de ${slides.length}`, 120, 1000);
      });

      doc.save(`Apresentacao_Slides_${selectedModuleId}_${Date.now()}.pdf`);
    } catch (e: any) {
      alert('Erro ao exportar PDF: ' + e.message);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Esquema de Cores do Tema
  const themeStyles = {
    navy: {
      bg: 'bg-slate-950',
      text: 'text-white',
      accent: 'text-amber-400',
      cardBg: 'bg-slate-900/90 border-slate-800',
      footerText: 'text-slate-400',
      tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950',
      text: 'text-amber-50',
      accent: 'text-orange-400',
      cardBg: 'bg-amber-950/40 border-amber-800/40',
      footerText: 'text-amber-300/70',
      tagBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    },
    dark: {
      bg: 'bg-black',
      text: 'text-slate-100',
      accent: 'text-cyan-400',
      cardBg: 'bg-zinc-950 border-zinc-800',
      footerText: 'text-zinc-500',
      tagBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    clean: {
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      accent: 'text-indigo-600',
      cardBg: 'bg-white border-slate-200 shadow-xl',
      footerText: 'text-slate-500',
      tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  }[theme];

  return createPortal(
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999999] flex flex-col ${themeStyles.bg} select-none transition-colors duration-300 overflow-hidden font-sans`}
    >
      {/* Blackout State for Prayer or Quiet Moments */}
      {blackout && (
        <div 
          onClick={() => setBlackout(false)}
          className="absolute inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
        >
          <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase">
            [ Blackout Ativo — Pressione B ou clique para reativar projeção ]
          </p>
        </div>
      )}

      {/* TOP CONTROL BAR (Visible when not in pure distraction-free mode or hovered) */}
      <header className="px-6 py-3 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Monitor size={20} className="text-amber-400" />
            <span className="font-black text-sm tracking-tight hidden sm:inline">
              Telão Multimídia & Slides EBD
            </span>
          </div>

          {/* Module Selector */}
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            {MODULES_TEOLOGIA.map(m => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Holyrics Dual-Screen Transmission Button */}
          <button
            onClick={() => {
              const holyricsSlides: HolyricsSlide[] = slides.map((s, idx) => ({
                id: s.id || `slide-${idx}`,
                tipo: s.tipo as any,
                titulo: s.titulo,
                subtitulo: s.subtitulo,
                texto: s.conteudo,
                versiculo: s.versiculo,
                pontos: s.pontos,
                notas: s.notasProfessor
              }));
              const currentTitle = tituloCustom || (MODULES_TEOLOGIA.find(m => m.id === selectedModuleId)?.title) || 'Apresentação Teológica';
              holyricsService.loadPresentation(currentTitle, holyricsSlides, 'slides', false);
              holyricsService.goToSlide(currentSlideIndex);
              holyricsService.openTelaoWindow();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
            title="Transmitir no Telão / 2º Monitor (Estilo Holyrics) de forma independente"
          >
            <Tv size={14} className="text-teal-200" />
            <span className="hidden sm:inline">Transmitir no Telão (Holyrics)</span>
          </button>

          {/* AI Generator Button */}
          {callGeminiAI && (
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all"
              title="Gerar slides de qualquer tema com IA"
            >
              <Sparkles size={14} />
              <span className="hidden md:inline">Criar c/ IA</span>
            </button>
          )}

          {/* Theme Selector */}
          <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
            {(['navy', 'amber', 'dark', 'clean'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  theme === t ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-white/70 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showNotes ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
            }`}
            title="Notas do Professor / Pregador"
          >
            <BookOpen size={16} />
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
            title="Baixar Slides em PDF"
          >
            <Download size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
            title="Alternar Tela Cheia (F)"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl border border-rose-500/30 transition-all cursor-pointer"
            title="Fechar Projeção (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* MAIN PRESENTATION STAGE (16:9 Widescreen Ratio Container) */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        
        {/* The Slide Canvas */}
        <div className="w-full max-w-6xl aspect-[16/9] flex flex-col justify-between p-8 sm:p-14 rounded-3xl relative overflow-hidden shadow-2xl transition-all border border-white/10 bg-black/20">
          
          {/* Top Metadata Header on Slide */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${themeStyles.tagBg}`}>
                {currentSlide?.tipo === 'capa' ? 'Abertura da Lição' : 
                 currentSlide?.tipo === 'versiculo' ? 'Texto Sagrado' : 
                 currentSlide?.tipo === 'doutrina' ? 'Declaração de Fé' : 
                 currentSlide?.tipo === 'quiz' ? 'Fixação da Classe' : 'Tópico Teológico'}
              </span>
              {currentSlide?.referenciaDoutrinaria && (
                <span className={`text-xs font-semibold ${themeStyles.footerText} hidden sm:inline`}>
                  {currentSlide.referenciaDoutrinaria}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${themeStyles.footerText}`}>
                {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Slide Content Body */}
          <div className="my-auto space-y-6">
            
            {/* CAPA */}
            {currentSlide?.tipo === 'capa' && (
              <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                  <Flame size={44} />
                </div>
                <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${themeStyles.text}`}>
                  {currentSlide.titulo}
                </h1>
                {currentSlide.subtitulo && (
                  <p className={`text-base sm:text-xl font-medium max-w-3xl mx-auto leading-relaxed ${themeStyles.accent}`}>
                    {currentSlide.subtitulo}
                  </p>
                )}
              </div>
            )}

            {/* TEXTO ÁUREO / VERSÍCULO */}
            {currentSlide?.tipo === 'versiculo' && currentSlide.versiculo && (
              <div className="text-center space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
                <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Palavra do Senhor
                </p>
                <blockquote className={`text-2xl sm:text-4xl lg:text-5xl font-serif italic leading-relaxed ${themeStyles.text}`}>
                  "{currentSlide.versiculo.texto}"
                </blockquote>
                <div className={`text-lg sm:text-2xl font-black ${themeStyles.accent}`}>
                  — {currentSlide.versiculo.referencia}
                </div>
                {currentSlide.subtitulo && (
                  <div className="pt-4 border-t border-white/10 max-w-2xl mx-auto">
                    <p className={`text-sm sm:text-base font-bold ${themeStyles.footerText}`}>
                      {currentSlide.subtitulo}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TÓPICO / DOUTRINA / APLICAÇÃO */}
            {(currentSlide?.tipo === 'topico' || currentSlide?.tipo === 'doutrina' || currentSlide?.tipo === 'aplicacao' || currentSlide?.tipo === 'conclusao') && (
              <div className="space-y-6 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight ${themeStyles.text}`}>
                    {currentSlide.titulo}
                  </h2>
                  {currentSlide.subtitulo && (
                    <p className={`text-base sm:text-xl font-semibold mt-2 ${themeStyles.accent}`}>
                      {currentSlide.subtitulo}
                    </p>
                  )}
                </div>

                {currentSlide.pontos && currentSlide.pontos.length > 0 && (
                  <ul className="space-y-4 pt-4">
                    {currentSlide.pontos.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className={`w-3 h-3 rounded-full mt-2.5 shrink-0 ${themeStyles.tagBg}`} />
                        <span className={`text-lg sm:text-2xl font-medium leading-snug ${themeStyles.text}`}>
                          {pt}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {currentSlide.conteudo && (
                  <div className={`text-base sm:text-lg leading-relaxed pt-2 ${themeStyles.text}`}>
                    {currentSlide.conteudo}
                  </div>
                )}
              </div>
            )}

            {/* QUIZ / FIXAÇÃO */}
            {currentSlide?.tipo === 'quiz' && (
              <div className="space-y-6 text-left animate-in fade-in duration-300">
                <h2 className={`text-2xl sm:text-3xl font-black ${themeStyles.text}`}>
                  {currentSlide.subtitulo || currentSlide.titulo}
                </h2>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {currentSlide.pontos?.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-2xl border ${themeStyles.cardBg} text-base sm:text-xl font-bold ${themeStyles.text} flex items-center gap-3`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-black shrink-0">
                        {opt.slice(0, 2)}
                      </span>
                      <span>{opt.slice(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Slide Footer */}
          <div className="flex justify-between items-center border-t border-white/10 pt-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.footerText}`}>
              Igreja Evangélica Assembleia de Deus • Ministério do Belém / CGADB
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
              <span className="hidden sm:inline">Use as setas [←] [→] ou [Espaço] para navegar</span>
              <span>[B] Blackout</span>
            </div>
          </div>

        </div>

        {/* SIDE DRAWER: NOTAS DO PROFESSOR / PREGADOR */}
        {showNotes && (
          <aside className="absolute right-4 top-4 bottom-4 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-2xl z-40 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <BookOpen size={18} />
                  Notas do Professor
                </div>
                <button 
                  onClick={() => setShowNotes(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Objetivo Pedagógico</h4>
                  <p className="font-medium text-slate-200">{currentSlide?.titulo}</p>
                </div>

                {currentSlide?.notasProfessor ? (
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-1">Dica de Ministração</h4>
                    <p className="leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs">
                      {currentSlide.notasProfessor}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhuma anotação adicional para este slide.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Dica: Mantenha contato visual com a classe e abra espaço para dúvidas no final.
            </div>
          </aside>
        )}

      </main>

      {/* BOTTOM CONTROLLER BAR */}
      <footer className="px-6 py-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex justify-between items-center shrink-0 z-30">
        
        {/* Left: Previous Button */}
        <button
          type="button"
          disabled={currentSlideIndex === 0}
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Center: Slide Navigator Thumbnails / Indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2 py-1">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === idx 
                  ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/30' 
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Slide ${idx + 1}: ${s.titulo}`}
            />
          ))}
        </div>

        {/* Right: Next Button and Dual-screen Liberar Sistema */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const holyricsSlides: HolyricsSlide[] = slides.map((s, idx) => ({
                id: s.id || `slide-${idx}`,
                tipo: s.tipo as any,
                titulo: s.titulo,
                subtitulo: s.subtitulo,
                texto: s.conteudo,
                versiculo: s.versiculo,
                pontos: s.pontos,
                notas: s.notasProfessor
              }));
              const currentTitle = tituloCustom || (MODULES_TEOLOGIA.find(m => m.id === selectedModuleId)?.title) || 'Apresentação Teológica';
              holyricsService.loadPresentation(currentTitle, holyricsSlides, 'slides', false);
              holyricsService.goToSlide(currentSlideIndex);
              holyricsService.openTelaoWindow();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-900/40 hover:bg-teal-800/60 border border-teal-500/50 text-teal-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            title="Abre o telão no 2º monitor e libera o sistema para você usar outras abas (com a barra flutuante de controle)"
          >
            <Tv size={14} />
            <span className="hidden md:inline">Liberar Sistema (Operar pelo Dock)</span>
          </button>

          <button
            type="button"
            disabled={currentSlideIndex === slides.length - 1}
            onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-30 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </footer>

      {/* MODAL GERADOR IA */}
      {showAiModal && (
        <div className="fixed inset-0 z-[99999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles size={20} />
                Gerador de Slides Teológicos com IA
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Digite o tema da aula, sermão ou lição da EBD. A inteligência artificial criará a apresentação completa com base na Declaração de Fé da CGADB/CPAD.
            </p>

            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: A Doutrina do Batismo no Espírito Santo e a Atualidade dos Dons Espirituais (1 Coríntios 12)"
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={generatingAi || !aiPrompt.trim()}
                onClick={handleGenerateAiSlides}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/25"
              >
                {generatingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {generatingAi ? 'Gerando Apresentação...' : 'Gerar Slides Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
};
