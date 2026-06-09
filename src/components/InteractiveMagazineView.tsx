import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Sparkles, BookOpenText, Layers, Share2, Award, 
  MapPin, Clock, Calendar, Check, Info, ArrowRight, Quote, Scroll, Image as ImageIcon, Volume2, HelpCircle
} from 'lucide-react';

interface InteractiveMagazineViewProps {
  lessonText: string;
  revista: string;
  licaoNum: string;
  capaUrl: string | null;
}

// Curated high-quality, lightweight public domain biblical and spiritual images
const MEMORIZED_THEMED_IMAGES = [
  {
    keywords: ['fé', 'oração', 'orar', 'espirito', 'alma', 'deus', 'religiao'],
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80',
    caption: 'Momento de oração, reflexão e comunhão com a glória celestial.'
  },
  {
    keywords: ['bíblia', 'livro', 'leitura', 'estudo', 'palavra', 'texto', 'sagrado'],
    url: 'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=1000&q=80',
    caption: 'Estudo aprofundado das Sagradas Escrituras como lâmpada para os caminhos.'
  },
  {
    keywords: ['conselho', 'ensino', 'igreja', 'sabedoria', 'teologia', 'história', 'professor'],
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
    caption: 'Busca incessante pelo conhecimento bíblico e aprofundamento teológico.'
  },
  {
    keywords: ['comunidade', 'comunhao', 'ajuda', 'membros', 'irmãos', 'amor', 'reuniao', 'celula'],
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    caption: 'Comunhão perfeita no corpo de Cristo, compartilhando ensinamentos edificantes.'
  },
  {
    keywords: ['jesus', 'salvação', 'cruz', 'graça', 'vida', 'cristo', 'luz', 'esperança'],
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80',
    caption: 'A glória resplandecente da graça que regenera e ilumina o entendimento.'
  },
  {
    keywords: ['culto', 'templo', 'louvor', 'adoração', 'altar', 'assembleia'],
    url: 'https://images.unsplash.com/photo-1470489241940-bf7f6e3eed35?auto=format&fit=crop&w=1000&q=80',
    caption: 'Sanctuário de adoração e rendição em espírito e em verdade.'
  },
  {
    keywords: ['antigo', 'israel', 'caminho', 'histórico', 'deserto', 'jornada'],
    url: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1000&q=80',
    caption: 'A milenar jornada de fé e promessas descrita nas antigas revelações.'
  }
];

// Fallback images dictionary to prevent broken/empty states
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
];

export const InteractiveMagazineView: React.FC<InteractiveMagazineViewProps> = ({
  lessonText,
  revista,
  licaoNum,
  capaUrl
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'magazine'>('magazine');
  const [customNotes, setCustomNotes] = useState<string>('');

  // 1. Smart Image Selection: Returns relevant illustrations matching keywords in text
  const illustrations = useMemo(() => {
    const textLower = (lessonText + ' ' + revista).toLowerCase();
    const matches: Array<{ url: string; caption: string }> = [];

    MEMORIZED_THEMED_IMAGES.forEach(theme => {
      const isMatch = theme.keywords.some(kw => textLower.includes(kw));
      if (isMatch) {
         matches.push({ url: theme.url, caption: theme.caption });
      }
    });

    // Fill with default stunning placeholders if not enough matches found
    while (matches.length < 3) {
      const idx = matches.length % MEMORIZED_THEMED_IMAGES.length;
      matches.push({
        url: MEMORIZED_THEMED_IMAGES[idx].url,
        caption: MEMORIZED_THEMED_IMAGES[idx].caption
      });
    }
    return matches;
  }, [lessonText, revista]);

  // 2. Robust Markdown Parser into Magazine editorial blocks
  const parsedMagazine = useMemo(() => {
    const lines = lessonText.split('\n');
    let title = `Lição ${licaoNum}`;
    let goldenText = '';
    let practicalTruth = '';
    let bibleReading = '';
    let intro = '';
    const topics: Array<{ title: string; paragraphs: string[] }> = [];
    let conclusion = '';

    let currentSection: 'none' | 'golden' | 'bible' | 'intro' | 'topic' | 'conclusion' = 'none';
    let currentTopicTitle = '';
    let currentTopicParagraphs: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect Title (Usually first major header in Markdown)
      if (trimmed.startsWith('# ') && !trimmed.toLowerCase().includes('revista') && currentSection === 'none') {
        title = trimmed.replace('#', '').trim();
        return;
      }

      // Section Headings Detector
      const lower = trimmed.toLowerCase();
      if (lower.includes('texto áureo') || lower.includes('texto aureo')) {
        currentSection = 'golden';
        goldenText = trimmed.replace(/^[#*\s-]+/g, '').replace(/texto áureo:?/i, '').trim();
        return;
      }
      if (lower.includes('verdade prática') || lower.includes('verdade pratica')) {
        currentSection = 'golden';
        practicalTruth = trimmed.replace(/^[#*\s-]+/g, '').replace(/verdade prática:?/i, '').trim();
        return;
      }
      if (lower.includes('leitura bíblica') || lower.includes('leitura biblica')) {
        currentSection = 'bible';
        return;
      }
      if (lower.includes('introdução') || lower.includes('introducao')) {
        currentSection = 'intro';
        return;
      }
      if (lower.includes('conclusão') || lower.includes('conclusao')) {
        currentSection = 'conclusion';
        return;
      }

      // Check for main Topicos (usually starts with ##, ###, Roman Numerals)
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || /^[I|V|X]+\s*[-–]/.test(trimmed)) {
        // Save previous topic if there is one
        if (currentTopicTitle && currentTopicParagraphs.length > 0) {
          topics.push({ title: currentTopicTitle, paragraphs: [...currentTopicParagraphs] });
        }
        currentSection = 'topic';
        currentTopicTitle = trimmed.replace(/^[#*\s]+/g, '').trim();
        currentTopicParagraphs = [];
        return;
      }

      // Content accumulation based on state
      const cleanLine = trimmed.replace(/^[#*\s-]+/g, '').trim();
      
      if (currentSection === 'golden') {
        if (lower.includes('verdade')) {
          practicalTruth = cleanLine.replace(/verdade prática:?/i, '').trim();
        } else if (!goldenText) {
          goldenText = cleanLine;
        } else if (!practicalTruth) {
          practicalTruth = cleanLine;
        }
      } else if (currentSection === 'bible') {
        bibleReading += (bibleReading ? '\n' : '') + trimmed;
      } else if (currentSection === 'intro') {
        intro += (intro ? '\n\n' : '') + trimmed;
      } else if (currentSection === 'conclusion') {
        conclusion += (conclusion ? '\n\n' : '') + trimmed;
      } else if (currentSection === 'topic') {
        currentTopicParagraphs.push(trimmed);
      } else {
        // Baseline accumulation
        if (trimmed.length > 30 && !trimmed.startsWith('URL_CAPA')) {
          intro += (intro ? '\n\n' : '') + trimmed;
        }
      }
    });

    // Capture last topic
    if (currentTopicTitle && currentTopicParagraphs.length > 0) {
      topics.push({ title: currentTopicTitle, paragraphs: currentTopicParagraphs });
    }

    // Default Fallbacks
    if (!intro && topics.length > 0) {
      intro = topics[0].paragraphs.join('\n\n');
      topics.shift();
    }

    return {
      title,
      goldenText: goldenText || '“Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.” - Salmos 119:105',
      practicalTruth: practicalTruth || 'O estudo contínuo das escrituras enriquece a nossa mente e solidifica o caráter cristo nos nossos afazeres diários.',
      bibleReading: bibleReading || 'Disponível no material de leitura recomendada da Harpa e bíblia integrada.',
      intro: intro || 'Estudo teológico aprofundado para fortificar as bases bíblicas da fé.',
      topics: topics.length > 0 ? topics : [
        { 
          title: 'I - Compreendendo as Bases da Lição', 
          paragraphs: [lessonText.substring(0, 1000) + '...'] 
        }
      ],
      conclusion: conclusion || 'Aprofundar-se no estudo dominical edifica a nossa alma e estabelece famílias firmes no altar do Senhor.'
    };
  }, [lessonText, licaoNum]);

  // Selected Cover Image
  const finalCoverImage = useMemo(() => {
    if (capaUrl && capaUrl !== 'null' && !capaUrl.includes('URL_CAPA')) return capaUrl;
    return DEFAULT_COVERS[parseInt(licaoNum) % DEFAULT_COVERS.length];
  }, [capaUrl, licaoNum]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Visual Subheader: Magazine Mode Selector */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <BookOpen size={18} />
          </span>
          <div>
            <h4 className="font-black text-sm text-slate-800">Modo de Aprendizagem</h4>
            <p className="text-[10px] text-slate-500 font-medium">Escolha a experiência ideal para sua leitura</p>
          </div>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab('reading')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reading'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpenText size={14} />
            Texto Corrido
          </button>
          
          <button
            onClick={() => setActiveTab('magazine')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'magazine'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} className="animate-pulse" />
            Revista Ilustrada ✨
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'reading' ? (
          /* Plain Text Mode */
          <div className="max-w-3xl mx-auto px-6 py-12 md:px-12 bg-white my-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-serif prose-headings:font-black prose-headings:text-slate-900 prose-a:text-emerald-600 prose-strong:text-slate-800">
              {lessonText}
            </div>
          </div>
        ) : (
          /* Luxurious Illustrated Magazine view with zero memory cost */
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-12">
            
            {/* 1. Header/Capa da Revista */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white shadow-2xl border border-white/10">
              {/* Cover Background Graphic */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img 
                  src={finalCoverImage} 
                  alt="Background Cover" 
                  className="w-full h-full object-cover blur-xs"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              
              {/* Diagonal accent line */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

              {/* Cover Content Layout */}
              <div className="relative z-10 px-8 py-16 md:p-20 flex flex-col md:flex-row items-center gap-10">
                <div className="w-48 sm:w-56 shrink-0 aspect-[2/3] bg-white rounded-2xl rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl overflow-hidden border-4 border-white/90 ring-1 ring-emerald-500/50">
                  <img src={finalCoverImage} alt="Cover image" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-500/30">
                    <Award size={12} /> SÉRIE ESPECIAL INTERATIVA GIPP
                  </span>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-[Outfit] leading-tight text-white tracking-tight drop-shadow-md">
                    {parsedMagazine.title}
                  </h1>
                  
                  <div className="h-1 w-20 bg-emerald-400 rounded-full mx-auto md:mx-0"></div>
                  
                  <p className="text-emerald-150/90 text-sm font-medium font-sans leading-relaxed max-w-lg">
                    {revista} • Comentado sob a égide dos grandes teólogos assembleianos com ilustrações inspiradoras gratuitas.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2 text-xs text-white/75 font-mono">
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <BookOpenText size={14} className="text-emerald-400" /> Edição Lição {licaoNum}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> Leitura Imersiva Ativa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Golden Passage (Texto Áureo & Verdade Prática) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Texto Áureo */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 p-8 rounded-[2rem] border border-amber-200/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-amber-200/40 select-none group-hover:scale-110 transition-transform duration-500">
                  <Quote size={80} className="stroke-[1.5]" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full border border-amber-300/30">
                    <Sparkles size={12} className="text-amber-600 fill-amber-600" /> texto áureo
                  </div>
                  <blockquote className="font-serif italic text-base sm:text-lg text-amber-950 leading-relaxed font-semibold">
                    {parsedMagazine.goldenText}
                  </blockquote>
                </div>
              </div>

              {/* Verdade Prática */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-8 rounded-[2rem] border border-emerald-200/40 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-emerald-200/30 select-none group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={85} className="stroke-[1.3]" />
                </div>
                <div className="relative z-10 space-y-4">
                  <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full border border-emerald-300/30">
                    <Award size={12} className="text-emerald-600" /> verdade prática
                  </span>
                  <p className="font-sans text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    {parsedMagazine.practicalTruth}
                  </p>
                </div>
              </div>

            </div>

            {/* 3. Leitura Bíblica Scroll */}
            <div className="bg-[#FAF5ED] rounded-[2.5rem] border border-[#E3DAC9] p-8 md:p-12 shadow-inner relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#8B5A2B] text-[#FCF9F2] text-[10px] font-black uppercase tracking-widest rounded-full shadow-md border border-[#704822] flex items-center gap-1.5">
                <Scroll size={12} /> Leitura Bíblica em Classe
              </div>
              
              <div className="prose prose-stone max-w-none text-serif text-[#4A3C31] text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-loose font-serif font-medium bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] p-4 md:p-6 rounded-2xl border border-[#EBE3D3] shadow-inner">
                {parsedMagazine.bibleReading}
              </div>
            </div>

            {/* Illustration Banner 1 */}
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-21/9 relative group">
              <img 
                src={illustrations[0].url} 
                alt="Reflexão" 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                <p className="text-[#F8FAFC] text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 flex items-center gap-1">
                  <ImageIcon size={10} className="text-emerald-400" /> Ilustração Especial
                </p>
                <h4 className="text-white text-xs sm:text-sm font-sans font-medium drop-shadow-md">
                  {illustrations[0].caption}
                </h4>
              </div>
            </div>

            {/* 4. Introdução */}
            <div className="space-y-4 bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-xs">
              <div className="inline-block bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
                Introdução Teológica
              </div>
              <h3 className="text-xl md:text-2xl font-black font-sans text-slate-900">Ementa e Portal Editorial</h3>
              <p className="font-serif text-slate-800 text-sm sm:text-base md:text-lg leading-loose first-letter:text-5xl first-letter:font-black first-letter:text-emerald-600 first-letter:float-left first-letter:mr-3 first-letter:pt-1 whitespace-pre-wrap font-medium">
                {parsedMagazine.intro}
              </p>
            </div>

            {/* 5. Tópicos da Revista */}
            <div className="space-y-12">
              {parsedMagazine.topics.map((topic, index) => {
                const topicIllustration = illustrations[(index + 1) % illustrations.length];
                return (
                  <div key={index} className="space-y-6">
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/80 shadow-xs space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full translate-x-12 -translate-y-12 opacity-50"></div>
                      
                      {/* Topic Title */}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black font-sans text-emerald-950 flex items-center gap-3 pb-3 border-b border-slate-150">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0">
                          {index + 1}
                        </span>
                        {topic.title}
                      </h3>
                      
                      {/* Editorial Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 font-serif font-medium text-slate-800 text-sm sm:text-base leading-loose whitespace-pre-wrap">
                        {topic.paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="first-letter:font-black first-letter:text-slate-900">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Illustration after topic */}
                    <div className="rounded-[2.5rem] overflow-hidden shadow-lg aspect-[16/7] relative group">
                      <img 
                        src={topicIllustration.url} 
                        alt={topic.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                          <ImageIcon size={10} className="text-emerald-400" /> Ilustração Contextualizada
                        </p>
                        <h4 className="text-white text-xs sm:text-sm font-sans font-medium drop-shadow-md">
                          {topicIllustration.caption}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 6. Conclusão */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-emerald-800 relative">
              <div className="absolute -top-3 left-8 px-4 py-1 bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                Conclusão & Mensagem Pastoral
              </div>
              <div className="prose prose-invert max-w-none space-y-4">
                <p className="font-serif italic text-emerald-100 text-sm sm:text-base md:text-lg leading-loose first-letter:text-4xl first-letter:font-black first-letter:text-amber-400 first-letter:float-left first-letter:mr-2">
                  {parsedMagazine.conclusion}
                </p>
              </div>
            </div>

            {/* 7. Bloco de Estudo Prático - Diário de Anotações */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-12 shadow-xs space-y-4">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BookOpenText size={20} className="text-emerald-600" /> Diário de Estudo / Anotações
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Escreva abaixo suas reflexões, anotações de estudo ou dúvidas sobre esta lição para o debate na classe. Essas notas ficam salvas no seu aparelho localmente.
              </p>
              
              <textarea
                value={customNotes}
                onChange={(e) => {
                  setCustomNotes(e.target.value);
                  localStorage.setItem(`gipp_notes_ebd_${licaoNum}`, e.target.value);
                }}
                placeholder="Exemplo: Aprendi que perseverar sob dificuldades fortalece nosso caráter..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 p-4 font-sans text-sm outline-hidden transition-all bg-slate-50/50"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Atualizado localmente</span>
                <span>{customNotes.trim().split(/\s+/).filter(Boolean).length} palavras</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
