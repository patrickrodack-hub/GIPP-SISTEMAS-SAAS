import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  BookOpen, Sparkles, BookOpenText, Award, 
  Calendar, Check, Quote, Scroll, Image as ImageIcon,
  ShieldCheck, Users, Building2, RefreshCw, Edit3, HelpCircle, CheckCircle2,
  Volume2, VolumeX, Play, Pause, Square, SkipBack, SkipForward, Headphones, X,
  FileEdit, Wand2, Copy, FileText, CheckCircle, ChevronLeft, ChevronRight,
  Layers, GraduationCap, Lightbulb, Compass, Bookmark, ListOrdered, Maximize2,
  Globe, ExternalLink, Search
} from 'lucide-react';
import { BibleReferenceModal } from './BibleReferenceModal';
import {
  ensureCompleteEBDLessonMarkdown,
  resolveDogmaticChapter
} from '../data/ebdCatalogDatabase';
import { getFormattedBiblePassageARC, parseBiblicalReference } from '../data/bibliaOfflineData';
import { findBibleReference } from '../data/bibleReferencesData';
import { useAudioNarration, AudioSegment } from '../hooks/useAudioNarration';

export interface InteractiveMagazineViewProps {
  lessonText: string;
  revista: string;
  subtitulo?: string;
  trimestre?: string;
  turma?: string;
  editora?: string;
  autor?: string;
  licaoNum: string;
  tituloLicao?: string;
  dataLicao?: string;
  capaUrl: string | null;
  leituraBiblica?: string;
  textoAureo?: string;
  verdadePratica?: string;
  loading?: boolean;
  onRegenerate?: () => void;
  onEditLesson?: () => void;
}

export type SpecialBlockCategory =
  | 'subsidio'
  | 'auxilio_professor'
  | 'sinopse'
  | 'vocabulario'
  | 'destaque';

export interface ParsedSpecialBlock {
  id: string;
  category: SpecialBlockCategory;
  title: string;
  paragraphs: string[];
  detectedRefs: string[];
}

export interface ParsedSubtopic {
  code: string;
  title: string;
  baseRef: string;
  paragraphs: string[];
  scriptureQuote: string[];
  classApplication: string;
  detectedRefs: string[];
}

export interface ParsedTopic {
  roman: string;
  title: string;
  introParagraphs: string[];
  topicRefs: string;
  topicVersesARC: string[];
  subtopics: ParsedSubtopic[];
  specialBlocks: ParsedSpecialBlock[];
  synthesis: string;
  detectedRefs: string[];
}

export interface ParsedQuizItem {
  question: string;
  answer: string;
}

interface InlineVerseWindowState {
  referenceQuery: string;
  canonicalRef: string;
  versesText: string;
  explanation: string;
  cgadbChapter: string;
}

// Curated high-quality public domain biblical and spiritual illustrations
const MEMORIZED_THEMED_IMAGES = [
  {
    keywords: ['filósofo', 'filosofo', 'atenas', 'areópago', 'areopago', 'deus desconhecido', 'epicureu', 'estoico', 'grécia', 'grecia', 'sabedoria', 'apologética'],
    url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80',
    caption: 'O contexto histórico greco-romano do Areópago de Atenas, onde o apóstolo Paulo proclamou o Deus Criador e a ressurreição de Cristo.'
  },
  {
    keywords: ['fé', 'oração', 'orar', 'clamor', 'súplica', 'suplica', 'joelhos', 'consagração', 'jejum', 'piedade', 'intercessão'],
    url: 'https://images.unsplash.com/photo-1543189718-40e9d9685b8c?auto=format&fit=crop&w=1000&q=80',
    caption: 'O clamor sincero e a intimidade espiritual no recôndito da graça do Senhor.'
  },
  {
    keywords: ['bíblia', 'biblia', 'livro', 'leitura', 'testamento', 'logos', 'verbo', 'sagradas', 'escrituras', 'escritura', 'texto', 'sagrado'],
    url: 'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=1000&q=80',
    caption: 'O estudo aprofundado e reverente das Sagradas Escrituras como regra inerrante de fé e prática.'
  },
  {
    keywords: ['ensino', 'professor', 'escola', 'teologia', 'doutrina', 'estudo', 'comentário', 'instrução', 'aprender', 'aula', 'capacitação'],
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
    caption: 'A busca diligente pelo conhecimento teológico e pela instrução doutrinária saudável na Escola Bíblica Dominical.'
  },
  {
    keywords: ['comunidade', 'comunhao', 'comunhão', 'membros', 'irmãos', 'irmãs', 'celula', 'célula', 'família da fé', 'partilha', 'ajuda', 'mútuo', 'solidariedade'],
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    caption: 'A edificante comunhão entre irmãos, compartilhando o amor, o ensino bíblico e o serviço cristão.'
  },
  {
    keywords: ['jesus', 'cristo', 'filho de deus', 'messias', 'nazareno', 'mestre', 'salvador'],
    url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80',
    caption: 'A suprema revelação de Deus e Sua magnânima obra redentora manifestada em Cristo Jesus.'
  },
  {
    keywords: ['criação', 'criacao', 'gênesis', 'genesis', 'natureza', 'universo', 'cosmos', 'noé', 'noe', 'arca', 'dilúvio', 'diluvio', 'adão', 'adao', 'eva', 'jardim', 'eden', 'éden', 'estrelas', 'céus', 'obras de deus'],
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    caption: 'A criação majestosa proclamando o eterno poder, a soberania e a glória de Deus Criador.'
  },
  {
    keywords: ['moisés', 'moises', 'êxodo', 'exodo', 'tabernáculo', 'tabernaculo', 'sinai', 'lei', 'mandamentos', 'arão', 'arao', 'sacerdote', 'sacerdócio', 'holocausto', 'propiciatório', 'maná'],
    url: 'https://images.unsplash.com/photo-1519638396419-db2c2539b12f?auto=format&fit=crop&w=1000&q=80',
    caption: 'O Monte Sinai no deserto, cenário da teofania e da entrega dos mandamentos e da Lei de Deus.'
  },
  {
    keywords: ['davi', 'david', 'saul', 'golias', 'harpa', 'salmo', 'pastor', 'ungido', 'israel', 'rei davi', 'realeza', 'coroa', 'trono'],
    url: 'https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?auto=format&fit=crop&w=1000&q=80',
    caption: 'A aliança real de Davi, simbolizando o pacto eterno com Deus e a linhagem do Messias prometido.'
  },
  {
    keywords: ['elias', 'eliseu', 'carmelo', 'fogo do céu', 'profecia', 'profeta', 'altar'],
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    caption: 'O altar restaurado e a manifestação gloriosa do Deus de Israel por meio do fogo pentecostal.'
  },
  {
    keywords: ['cruz', 'crucificação', 'crucificacao', 'calvário', 'calvario', 'gólgota', 'golgota', 'sacrifício', 'sacrificio', 'morte', 'redenção', 'redencao', 'sangue', 'graça', 'salvação'],
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80',
    caption: 'As cruzes do Calvário, simbolizando a expiação substitutiva e redentora de Cristo.'
  },
  {
    keywords: ['ressurreição', 'ressurreicao', 'túmulo', 'tumulo', 'vazio', 'ressuscitou', 'vivo', 'vida', 'vitória', 'vitoria'],
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
    caption: 'O túmulo vazio banhado de luz na manhã pascal, testificando a vitória total de Jesus sobre a morte.'
  },
  {
    keywords: ['pentecostes', 'avivamento', 'espírito santo', 'espirito santo', 'línguas de fogo', 'unção', 'batismo no espírito', 'dons', 'poder', 'cenáculo', 'atos'],
    url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80',
    caption: 'O fogo purificador e o avivamento celestial derramado no Pentecostes para revestir a Igreja de poder.'
  },
  {
    keywords: ['paulo', 'saulo', 'damasco', 'conversão', 'gentios', 'carta', 'cartas', 'epístolas', 'epistolas', 'apostolo', 'apóstolo'],
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    caption: 'Manuscritos e cartas apostólicas de Paulo que moldaram a teologia sistemática e o ensino missionário.'
  },
  {
    keywords: ['apocalipse', 'revelação', 'escatologia', 'fim dos tempos', 'arrebatamento', 'segunda vinda', 'trombeta', 'reino milenar', 'novo céu', 'nova terra', 'trono branco', 'eternidade'],
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
    caption: 'O vislumbre celestial da Revelação Escatológica, apontando para o retorno triunfal do Cordeiro.'
  }
];

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
];

// Expressão regular abrangente para detectar referências bíblicas no texto (padrão CPAD com "." ou ":")
const BIBLE_BOOKS_PATTERN =
  '(?:[1-3]\\s*(?:Samuel|Reis|Cr[ôo]nicas|Cor[íi]ntios|Tessalonicenses|Tim[óo]teo|Pedro|Jo[ãa]o|Sm|Rs|Cr|Co|Ts|Tm|Pe|Jo)|' +
  'G[êe]nesis|[ÊE]xodo|Lev[íi]tico|N[úu]meros|Deuteron[ôo]mio|Josu[ée]|Ju[íi]zes|Rute|Esdras|Neemias|Ester|J[óo]|Salmos?|Prov[ée]rbios|' +
  'Eclesiastes|Cantares|C[âa]nticos|Isa[íi]as|Jeremias|Lamenta[çc][õo]es|Ezequiel|Daniel|Os[ée]ias|Joel|Am[óo]s|Obadias|Jonas|Miqu[ée]ias|' +
  'Naum|Habacuque|Sofonias|Ageu|Zacarias|Malaquias|Mateus|Marcos|Lucas|Jo[ãa]o|Atos(?:\\s+dos\\s+Ap[óo]stolos)?|Romanos|G[áa]latas|Ef[ée]sios|' +
  'Filipenses|Colossenses|Tito|Filemom|Hebreus|Tiago|Judas|Apocalipse|' +
  'Gn|[ÊE]x|Lv|Nm|Dt|Js|Jz|Rt|Ed|Ne|Et|Sl|Pv|Ec|Ct|Is|Jr|Lm|Ez|Dn|Os|Jl|Am|Ob|Jn|Mq|Na|Hc|Sf|Ag|Zc|Ml|Mt|Mc|Lc|Jo|At|Rm|Gl|Ef|Fp|Cl|Tt|Fm|Flm|Hb|Tg|Jd|Ap)';

const INLINE_BIBLE_REF_REGEX = new RegExp(
  `(\\b${BIBLE_BOOKS_PATTERN}\\.?\\s+\\d{1,3}(?:\\s*[:.]\\s*\\d{1,3}[ab]?(?:\\s*[-–,]\\s*\\d{1,3}[ab]?)*))`,
  'gi'
);

function extractAllBibleRefsFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(INLINE_BIBLE_REF_REGEX);
  if (!matches) return [];
  const unique: string[] = [];
  for (const m of matches) {
    const clean = m.trim().replace(/[.;,]+$/, '');
    if (clean && !unique.includes(clean)) {
      unique.push(clean);
    }
  }
  return unique;
}

export const InteractiveMagazineView: React.FC<InteractiveMagazineViewProps> = ({
  lessonText,
  revista,
  subtitulo = '',
  trimestre = '',
  turma = '',
  editora = 'CPAD',
  autor = '',
  licaoNum,
  tituloLicao = '',
  dataLicao = '',
  capaUrl,
  leituraBiblica = '',
  textoAureo = '',
  verdadePratica = '',
  loading = false,
  onRegenerate,
  onEditLesson
}) => {
  const storageKeyCustom = `gipp_ebd_custom_content_${licaoNum}_${revista}`;
  const [customContentInput, setCustomContentInput] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKeyCustom) || '';
    } catch {
      return '';
    }
  });
  const [appliedCustomContent, setAppliedCustomContent] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKeyCustom) || '';
    } catch {
      return '';
    }
  });
  const [customCoverUrl, setCustomCoverUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(`${storageKeyCustom}_cover`) || '';
    } catch {
      return '';
    }
  });
  const [customNotification, setCustomNotification] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'magazine' | 'custom_input' | 'online_source'>(() => {
    try {
      const saved = localStorage.getItem(storageKeyCustom) || '';
      if (!saved.trim() && !lessonText.trim()) return 'custom_input';
    } catch {}
    return 'magazine';
  });

  // Estados para busca e visualização integrada de https://escolabiblicadominical.org
  const [onlinePortalSubMode, setOnlinePortalSubMode] = useState<'search' | 'site'>('search');
  const [onlineSearchQuery, setOnlineSearchQuery] = useState<string>(() =>
    [revista, tituloLicao, licaoNum ? `Lição ${licaoNum}` : ''].filter(Boolean).join(' ')
  );
  const [onlineSpecificUrl, setOnlineSpecificUrl] = useState<string>('');
  const [onlineSearching, setOnlineSearching] = useState<boolean>(false);
  const [onlineArticles, setOnlineArticles] = useState<any[]>([]);

  const handleSearchEscolaBiblicaOrg = useCallback(async (overrideQuery?: string, overrideUrl?: string) => {
    setOnlineSearching(true);
    try {
      const resp = await fetch('/api/ebd/escolabiblicadominical-acervo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: overrideQuery !== undefined ? overrideQuery : onlineSearchQuery,
          revista,
          temaCentral: subtitulo,
          licaoNum,
          tituloLicao,
          specificUrl: overrideUrl !== undefined ? overrideUrl : onlineSpecificUrl
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success && Array.isArray(data.articles)) {
          setOnlineArticles(data.articles);
          if (data.bestCoverUrl && !customCoverUrl) {
            setCustomCoverUrl(data.bestCoverUrl);
          }
        }
      }
    } catch {
      // Silencioso
    } finally {
      setOnlineSearching(false);
    }
  }, [onlineSearchQuery, revista, subtitulo, licaoNum, tituloLicao, onlineSpecificUrl, customCoverUrl]);

  const handleImportFromEscolaBiblicaArticle = useCallback((article: any) => {
    const contentToApply = (article.conteudoCompleto || article.resumo || '').trim();
    if (!contentToApply) return;
    setCustomContentInput(contentToApply);
    setAppliedCustomContent(contentToApply);
    if (article.capa) {
      setCustomCoverUrl(article.capa);
      try {
        localStorage.setItem(`${storageKeyCustom}_cover`, article.capa);
      } catch {}
    }
    try {
      localStorage.setItem(storageKeyCustom, contentToApply);
    } catch {}
    setCurrentPageIndex(0);
    setActiveTab('magazine');
    setCustomNotification(`Conteúdo e capa de "${article.titulo}" (escolabiblicadominical.org) aplicados na Revista Paginada!`);
    setTimeout(() => setCustomNotification(null), 4500);
  }, [storageKeyCustom]);

  // Paginação interativa estilo revista física ("folhear páginas") ou visualização contínua
  const [readingFormat, setReadingFormat] = useState<'paginated' | 'continuous'>('paginated');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const [customNotes, setCustomNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(`gipp_notes_ebd_${licaoNum}_${revista}`) || '';
    } catch {
      return '';
    }
  });

  // Modal completo de referência bíblica (para estudo expandido ou projeção no telão)
  const [selectedBibleRef, setSelectedBibleRef] = useState<string | null>(null);

  // Pequena janela de versículo dentro da própria revista
  const [inlineVersePopup, setInlineVersePopup] = useState<InlineVerseWindowState | null>(null);
  const [inlineVerseAudioPlaying, setInlineVerseAudioPlaying] = useState<boolean>(false);
  const [inlineVerseCopied, setInlineVerseCopied] = useState<boolean>(false);

  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState<Record<number, boolean>>({});

  // Normalizar número e título da lição
  const { cleanLicaoNum, cleanTituloLicao } = useMemo(() => {
    const rawNum = String(licaoNum || '1').trim();
    const matchCombined = rawNum.match(/^(?:LI[CÇ][AÃ]O\s*)?0*(\d{1,2})(?:\s*[-–:]\s*(.*))?$/i);
    const numOnly = matchCombined ? matchCombined[1] : (rawNum.replace(/li[cç][aã]o\s*/i, '').trim() || '1');
    const titleFromNum = matchCombined && matchCombined[2] ? matchCombined[2].trim() : '';
    const rawTit = (tituloLicao || titleFromNum || '').replace(/^(?:LI[CÇ][AÃ]O\s*)?\d{1,2}\s*[-–:]\s*/i, '').trim();
    return {
      cleanLicaoNum: numOnly,
      cleanTituloLicao: rawTit
    };
  }, [licaoNum, tituloLicao]);

  const activeSourceText = appliedCustomContent.trim() ? appliedCustomContent : lessonText;

  const completeLessonMarkdown = useMemo(() => {
    if (appliedCustomContent.trim()) {
      return appliedCustomContent.trim();
    }

    return ensureCompleteEBDLessonMarkdown(activeSourceText, {
      revista: revista || 'Lições Bíblicas EBD',
      temaCentral: subtitulo,
      subtitulo,
      trimestre: trimestre || '1º Trimestre',
      licaoNum: cleanLicaoNum,
      tituloLicao: cleanTituloLicao,
      dataLicao,
      editora: editora || 'CPAD',
      autor: autor || 'Comentarista Oficial EBD',
      faixaEtaria: turma || 'Adultos',
      turma: turma || 'Adultos',
      textoBiblico: leituraBiblica,
      textoAureo,
      verdadePratica
    });
  }, [
    appliedCustomContent,
    activeSourceText,
    revista,
    subtitulo,
    trimestre,
    turma,
    editora,
    autor,
    cleanLicaoNum,
    cleanTituloLicao,
    dataLicao,
    leituraBiblica,
    textoAureo,
    verdadePratica
  ]);

  // Abrir versículo na Pequena Janela dentro da Revista
  const handleOpenInlineVerse = useCallback((refQuery: string) => {
    if (!refQuery || !refQuery.trim()) return;
    const normalizedRef = refQuery.trim().replace(/(\d+)\.(\d+)/g, '$1:$2');
    const arcPassage = getFormattedBiblePassageARC(normalizedRef, 20);
    const detail = findBibleReference(normalizedRef);
    const parsed = parseBiblicalReference(normalizedRef);

    let canonicalLabel = detail.reference;
    if (parsed) {
      const startV = parsed.verse || 1;
      const endV = parsed.endVerse && parsed.endVerse >= startV ? parsed.endVerse : startV;
      canonicalLabel = `${parsed.book.name} ${parsed.chapter}:${startV}${endV > startV ? `-${endV}` : ''}`;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setInlineVerseAudioPlaying(false);
    }

    setInlineVerseCopied(false);
    setInlineVersePopup({
      referenceQuery: refQuery.trim(),
      canonicalRef: canonicalLabel,
      versesText: arcPassage && arcPassage.trim().length > 10 ? arcPassage : detail.text,
      explanation: detail.explanation,
      cgadbChapter: detail.cgadbChapter
    });
  }, []);

  const handleToggleInlineVerseAudio = useCallback(() => {
    if (!inlineVersePopup || !('speechSynthesis' in window)) return;
    if (inlineVerseAudioPlaying) {
      window.speechSynthesis.cancel();
      setInlineVerseAudioPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${inlineVersePopup.canonicalRef}. ${inlineVersePopup.versesText.replace(/\n/g, ' ')}`
    );
    utterance.lang = 'pt-BR';
    utterance.rate = 0.96;
    utterance.onend = () => setInlineVerseAudioPlaying(false);
    utterance.onerror = () => setInlineVerseAudioPlaying(false);
    setInlineVerseAudioPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [inlineVersePopup, inlineVerseAudioPlaying]);

  const handleCopyInlineVerse = useCallback(async () => {
    if (!inlineVersePopup) return;
    try {
      await navigator.clipboard.writeText(
        `📖 ${inlineVersePopup.canonicalRef} (Bíblia ARC)\n${inlineVersePopup.versesText}\n\n💡 ${inlineVersePopup.explanation}`
      );
      setInlineVerseCopied(true);
      setTimeout(() => setInlineVerseCopied(false), 2200);
    } catch {}
  }, [inlineVersePopup]);

  const handleApplyCustomContent = () => {
    const trimmed = customContentInput.trim();
    if (!trimmed) {
      setCustomNotification('Por favor, cole ou digite o conteúdo do estudo antes de montar a revista.');
      return;
    }
    setAppliedCustomContent(trimmed);
    try {
      localStorage.setItem(storageKeyCustom, trimmed);
    } catch {}
    setCustomNotification('Revista Interativa montada com 100% do seu conteúdo organizado em páginas, tópicos e subsídios!');
    setActiveTab('magazine');
    setCurrentPageIndex(0);
    setTimeout(() => setCustomNotification(null), 4500);
  };

  const handleResetToOriginal = () => {
    setAppliedCustomContent('');
    setCustomContentInput('');
    try {
      localStorage.removeItem(storageKeyCustom);
    } catch {}
    setCustomNotification('Conteúdo restaurado para o material original da revista.');
    setActiveTab('magazine');
    setCurrentPageIndex(0);
    setTimeout(() => setCustomNotification(null), 3000);
  };

  const getIllustrationForTopic = useCallback((title: string, paragraphs: string[], index: number) => {
    const combinedLower = `${title} ${(paragraphs || []).join(' ')} ${revista} ${cleanTituloLicao}`.toLowerCase();

    for (const theme of MEMORIZED_THEMED_IMAGES) {
      if (theme.keywords.some(kw => combinedLower.includes(kw))) {
        return { url: theme.url, caption: theme.caption };
      }
    }

    const defaultIdx = (index + (parseInt(cleanLicaoNum, 10) || 1)) % MEMORIZED_THEMED_IMAGES.length;
    return {
      url: MEMORIZED_THEMED_IMAGES[defaultIdx].url,
      caption: MEMORIZED_THEMED_IMAGES[defaultIdx].caption
    };
  }, [revista, cleanTituloLicao, cleanLicaoNum]);

  // PARSER COMPLETO DE ALTA PRECISÃO E ZERO PERDA (100% DO CONTEÚDO INFORMADO)
  const parsedMagazine = useMemo(() => {
    const dogmatic = resolveDogmaticChapter(`${revista} ${subtitulo} ${cleanTituloLicao} ${leituraBiblica} ${completeLessonMarkdown.slice(0, 600)}`);
    const lines = completeLessonMarkdown.split('\n');

    let extractedLessonNum = '';
    let extractedTheme = '';
    let extractedTitle = '';
    let bibleRefDetected = '';
    let goldenText = textoAureo.trim() || '';
    let practicalTruth = verdadePratica.trim() || '';
    let centralPoint = '';
    let keyWord = '';
    const objectivesList: string[] = [];
    const dailyReadings: string[] = [];
    const teacherInteraction: string[] = [];
    const bibleReadingLines: string[] = [];
    let introParagraphs: string[] = [];
    const doctrinalParagraphs: string[] = [];
    const topics: ParsedTopic[] = [];
    const generalSpecialBlocks: ParsedSpecialBlock[] = [];
    const applicationItems: string[] = [];
    const conclusionParagraphs: string[] = [];
    const quizItems: ParsedQuizItem[] = [];

    type SectionType =
      | 'header'
      | 'golden'
      | 'truth'
      | 'objectives'
      | 'daily_reading'
      | 'interaction'
      | 'bible'
      | 'intro'
      | 'doctrinal'
      | 'topics'
      | 'special_block'
      | 'application'
      | 'conclusion'
      | 'quiz';

    let currentSection: SectionType = 'header';
    let currentTopic: ParsedTopic | null = null;
    let currentSubtopic: ParsedSubtopic | null = null;
    let currentSpecialBlock: ParsedSpecialBlock | null = null;
    let inTopicVersesBlock = false;
    let currentQuizQuestion = '';
    let currentQuizAnswer = '';
    let specialCounter = 1;

    const flushSpecialBlock = () => {
      if (currentSpecialBlock) {
        if (currentSpecialBlock.paragraphs.length > 0) {
          currentSpecialBlock.detectedRefs = extractAllBibleRefsFromText(
            `${currentSpecialBlock.title} ${currentSpecialBlock.paragraphs.join(' ')}`
          );
          if (currentTopic) {
            currentTopic.specialBlocks.push(currentSpecialBlock);
          } else {
            generalSpecialBlocks.push(currentSpecialBlock);
          }
        }
        currentSpecialBlock = null;
      }
    };

    const flushSubtopic = () => {
      flushSpecialBlock();
      if (currentTopic && currentSubtopic) {
        currentSubtopic.detectedRefs = extractAllBibleRefsFromText(
          `${currentSubtopic.baseRef} ${currentSubtopic.paragraphs.join(' ')} ${currentSubtopic.scriptureQuote.join(' ')}`
        );
        currentTopic.subtopics.push(currentSubtopic);
        currentSubtopic = null;
      }
    };

    const flushTopic = () => {
      flushSubtopic();
      flushSpecialBlock();
      if (currentTopic) {
        currentTopic.detectedRefs = extractAllBibleRefsFromText(
          `${currentTopic.topicRefs} ${currentTopic.introParagraphs.join(' ')} ${currentTopic.synthesis}`
        );
        topics.push(currentTopic);
        currentTopic = null;
      }
      inTopicVersesBlock = false;
    };

    const flushQuiz = () => {
      if (currentQuizQuestion.trim()) {
        quizItems.push({
          question: currentQuizQuestion.trim(),
          answer:
            currentQuizAnswer.trim() ||
            'Consulte os tópicos comentados e os subsídios teológicos desta lição para conferir a fundamentação bíblica completa.'
        });
        currentQuizQuestion = '';
        currentQuizAnswer = '';
      }
    };

    const startSpecialBlock = (category: SpecialBlockCategory, title: string, firstParagraph?: string) => {
      flushSpecialBlock();
      currentSpecialBlock = {
        id: `special-${specialCounter++}`,
        category,
        title: title.replace(/[*_#]/g, '').trim(),
        paragraphs: firstParagraph && firstParagraph.trim() ? [firstParagraph.trim()] : [],
        detectedRefs: []
      };
      currentSection = 'special_block';
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed === '---' || trimmed.startsWith('URL_CAPA=')) continue;

      // 0. Reconhecimento de Aula / Lição e Número
      const matchAula = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:li[cç][aã]o|aula)\s*0*(\d{1,2})(?:\s*[-–—:.]\s*(.*))?$/i);
      if (matchAula && trimmed.length < 140) {
        extractedLessonNum = matchAula[1];
        if (matchAula[2] && matchAula[2].trim()) {
          extractedTitle = matchAula[2].replace(/[*_#]/g, '').trim();
        }
        continue;
      }

      // Reconhecimento de Tema Central
      const matchTema = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:tema\s*central|tema\s*da\s*aula|tema|assunto)\s*[:–—-]\s*(?:\*\*)?(.*)$/i);
      if (matchTema) {
        extractedTheme = matchTema[1].replace(/[*_#]/g, '').trim();
        continue;
      }

      // Reconhecimento de Título da Lição explícito
      const matchTitulo = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:t[íi]tulo\s*da\s*li[cç][aã]o|t[íi]tulo|titulo)\s*[:–—-]\s*(?:\*\*)?(.*)$/i);
      if (matchTitulo) {
        extractedTitle = matchTitulo[1].replace(/[*_#]/g, '').trim();
        continue;
      }

      // Reconhecimento de Ponto Central & Palavra-Chave
      const matchPontoCentral = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:ponto\s*central|ideia\s*central)\s*[:–—-]\s*(?:\*\*)?(.*)$/i);
      if (matchPontoCentral) {
        centralPoint = matchPontoCentral[1].replace(/[*_#]/g, '').trim();
        continue;
      }

      const matchPalavraChave = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:palavra[-\s]*chave|termo[-\s]*chave)\s*[:–—-]\s*(?:\*\*)?(.*)$/i);
      if (matchPalavraChave) {
        keyWord = matchPalavraChave[1].replace(/[*_#]/g, '').trim();
        continue;
      }

      // Reconhecimento de Objetivos da Lição
      const matchObjetivos = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:objetivos?(?:\s*da\s*li[cç][aã]o|\s*geral|\s*espec[íi]ficos?)?)\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchObjetivos && trimmed.length < 130) {
        flushSpecialBlock();
        currentSection = 'objectives';
        const inlineObj = matchObjetivos[1].replace(/[*_#]/g, '').trim();
        if (inlineObj) objectivesList.push(inlineObj);
        continue;
      }

      // Reconhecimento de Leitura Diária
      const matchLeituraDiaria = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:leitura\s*di[áa]ria|leituras?\s*da\s*semana)\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchLeituraDiaria && trimmed.length < 100) {
        flushSpecialBlock();
        currentSection = 'daily_reading';
        const inlineDaily = matchLeituraDiaria[1].replace(/[*_#]/g, '').trim();
        if (inlineDaily) dailyReadings.push(inlineDaily);
        continue;
      }

      // Reconhecimento de Interação Inicial (Professor/Aluno)
      const matchInteracao = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:intera[cç][aã]o|caro\(a\)\s*professor\(a\))\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchInteracao && !currentTopic) {
        flushSpecialBlock();
        currentSection = 'interaction';
        const inlineInt = matchInteracao[1].replace(/[*_#]/g, '').trim();
        if (inlineInt) teacherInteraction.push(inlineInt);
        continue;
      }

      // 1. Reconhecimento de SUBSÍDIOS (Subsídio Teológico, Bibliológico, Apologético, Exegético, Histórico, Doutrinário, etc.)
      const matchSubsidio = trimmed.match(
        /^(?:#+\s*)?(?:\*\*)?(subs[íi]dios?(?:\s+(?:teol[óo]gico|bibliol[óo]gico|apolog[ée]tico|exeg[ée]tico|hist[óo]rico|doutrin[áa]rio|pedag[óo]gico|devocional|mission[áa]rio|antropol[óo]gico|cristol[óo]gico|escatol[óo]gico|pneumatol[óo]gico|para\s+o\s+professor|da\s+li[cç][aã]o|\d+))?|aprofundamento\s+teol[óo]gico)\s*[:–—.-]?\s*(?:\*\*)?(.*)$/i
      );
      if (matchSubsidio && trimmed.length < 180) {
        const subTitle = matchSubsidio[1].trim();
        const restText = matchSubsidio[2] ? matchSubsidio[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
        if ( restText.length < 85 && restText.length > 0 && !restText.endsWith('.') ) {
          startSpecialBlock('subsidio', `${subTitle}: ${restText}`);
        } else {
          startSpecialBlock('subsidio', subTitle, restText);
        }
        continue;
      }

      // 2. Reconhecimento de AUXÍLIO AO PROFESSOR / ORIENTAÇÃO PEDAGÓGICA / DIDÁTICA
      const matchAuxilio = trimmed.match(
        /^(?:#+\s*)?(?:\*\*)?(aux[íi]lio\s+(?:ao\s+professor|pedag[óo]gico|did[áa]tico|teol[óo]gico|devocional)|orienta[cç][aã]o\s+(?:pedag[óo]gica|did[áa]tica|ao\s+professor)|dica\s+(?:ao\s+professor|pedag[óo]gica|did[áa]tica)|guia\s+do\s+professor|sugest[aã]o\s+(?:did[áa]tica|pedag[óo]gica)|din[âa]mica\s+de\s+(?:aula|classe)|intera[cç][aã]o\s+com\s+a\s+classe)\s*[:–—.-]?\s*(?:\*\*)?(.*)$/i
      );
      if (matchAuxilio && trimmed.length < 180) {
        const auxTitle = matchAuxilio[1].trim();
        const restText = matchAuxilio[2] ? matchAuxilio[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
        startSpecialBlock('auxilio_professor', auxTitle, restText);
        continue;
      }

      // 3. Reconhecimento de SINOPSE / SÍNTESE DO TÓPICO
      const matchSinopse = trimmed.match(
        /^(?:#+\s*)?(?:\*\*)?(sinopse(?:\s+do\s+t[óo]pico\s*[IVX\d]*)?|s[íi]ntese\s+(?:teol[óo]gica|do\s+t[óo]pico(?:\s*[IVX\d]*)?)|resumo\s+do\s+t[óo]pico(?:\s*[IVX\d]*)?)\s*[:–—.-]?\s*(?:\*\*)?(.*)$/i
      );
      if (matchSinopse) {
        const sinTitle = matchSinopse[1].trim();
        const restText = matchSinopse[2] ? matchSinopse[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
        if (currentTopic && restText) {
          currentTopic.synthesis = restText;
        }
        startSpecialBlock('sinopse', sinTitle, restText);
        continue;
      }

      // 4. Reconhecimento de VOCABULÁRIO / GLOSSÁRIO
      const matchVocabulario = trimmed.match(
        /^(?:#+\s*)?(?:\*\*)?(vocabul[áa]rio(?:\s+b[íi]blico|\s+teol[óo]gico)?|gloss[áa]rio|dicion[áa]rio\s+b[íi]blico|termos?\s+no\s+original)\s*[:–—.-]?\s*(?:\*\*)?(.*)$/i
      );
      if (matchVocabulario && trimmed.length < 160) {
        const vocTitle = matchVocabulario[1].trim();
        const restText = matchVocabulario[2] ? matchVocabulario[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
        startSpecialBlock('vocabulario', vocTitle, restText);
        continue;
      }

      // 5. Reconhecimento de QUADROS DE DESTAQUE / REFLEXÃO (Pense!, Para Refletir, Importante, Curiosidade, Conhecendo + de Deus)
      const matchDestaque = trimmed.match(
        /^(?:#+\s*)?(?:\*\*)?(pense\s*!|para\s+refletir|reflita\s*:?|conhecendo\s*\+?\s*de\s+deus|curiosidade\s+b[íi]blica|importante\s*!|aten[cç][aã]o\s*!|nota\s+teol[óo]gica|saiba\s+mais)\s*[:–—.-]?\s*(?:\*\*)?(.*)$/i
      );
      if (matchDestaque && trimmed.length < 180) {
        const destTitle = matchDestaque[1].trim();
        const restText = matchDestaque[2] ? matchDestaque[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
        startSpecialBlock('destaque', destTitle, restText);
        continue;
      }

      // 6. Cabeçalhos principais Markdown (# ...)
      if (/^#\s+/.test(trimmed) && !/^##/.test(trimmed)) {
        const h1Text = trimmed.replace(/^#\s+/, '').trim();
        const h1Lower = h1Text.toLowerCase();

        if (h1Lower.includes('introdução') || h1Lower.includes('introducao') || h1Lower.includes('comentário') || h1Lower.includes('comentario')) {
          flushSpecialBlock();
          currentSection = 'intro';
          continue;
        }
        if (h1Lower.includes('fundamentação doutrinária') || h1Lower.includes('fundamentacao doutrinaria') || h1Lower.includes('declaração de fé')) {
          flushSpecialBlock();
          currentSection = 'doctrinal';
          continue;
        }
        if (h1Lower.includes('referências bíblicas') || h1Lower.includes('exegese dos tópicos') || h1Lower.includes('tópicos')) {
          flushSpecialBlock();
          currentSection = 'topics';
          continue;
        }
        if (h1Lower.includes('aplicação prática') || h1Lower.includes('aplicacao pratica')) {
          flushTopic();
          currentSection = 'application';
          continue;
        }
        if (h1Lower.includes('conclusão') || h1Lower.includes('conclusao')) {
          flushTopic();
          currentSection = 'conclusion';
          continue;
        }
        if (h1Lower.includes('validação') || h1Lower.includes('validacao') || h1Lower.includes('perguntas') || h1Lower.includes('questionário') || h1Lower.includes('revisão')) {
          flushTopic();
          currentSection = 'quiz';
          continue;
        }
        if (currentSection === 'header' && !extractedTitle) {
          extractedTitle = h1Text.replace(/^1\.\s*/, '').trim();
          continue;
        }
      }

      // 7. Marcadores explícitos de Texto Áureo, Verdade Prática e Leitura Bíblica
      const matchAureo = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:texto\s*[áa]ureo|vers[íi]culo\s*chave|[áa]ureo)\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchAureo && trimmed.length < 280) {
        flushSpecialBlock();
        currentSection = 'golden';
        const inlineVal = matchAureo[1].replace(/[*_]/g, '').trim();
        if (inlineVal) goldenText = inlineVal.replace(/^["“]|["”]$/g, '').trim();
        continue;
      }

      const matchVerdade = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:verdade\s*pr[áa]tica|verdade\s*b[íi]blica)\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchVerdade && trimmed.length < 280) {
        flushSpecialBlock();
        currentSection = 'truth';
        const inlineVal = matchVerdade[1].replace(/[*_]/g, '').trim();
        if (inlineVal) practicalTruth = inlineVal;
        continue;
      }

      const matchLeitura = trimmed.match(/^(?:#+\s*)?(?:\*\*)?(?:leitura\s*b[íi]blica(?:\s*em\s*classe)?|texto\s*b[íi]blico|passagem\s*b[íi]blica)\s*[:–—-]?\s*(?:\*\*)?(.*)$/i);
      if (matchLeitura && trimmed.length < 220) {
        flushSpecialBlock();
        currentSection = 'bible';
        const inlineVal = matchLeitura[1].replace(/[*_]/g, '').trim();
        if (inlineVal) {
          if (!bibleRefDetected) bibleRefDetected = inlineVal;
          bibleReadingLines.push(inlineVal);
        }
        continue;
      }

      if (/^(?:#+\s*)?(?:\*\*)?(?:contextualiza[cç][aã]o|introdu[cç][aã]o|vis[aã]o\s*geral|coment[áa]rio\s*inicial)\b/i.test(trimmed) && trimmed.length < 140) {
        flushSpecialBlock();
        currentSection = 'intro';
        const inlineIntro = trimmed.replace(/^(?:#+\s*)?(?:\*\*)?(?:contextualiza[cç][aã]o|introdu[cç][aã]o|vis[aã]o\s*geral|coment[áa]rio\s*inicial)\s*[:–—.-]?\s*(?:\*\*)?/i, '').trim();
        if (inlineIntro) introParagraphs.push(inlineIntro);
        continue;
      }

      // Reconhecimento de Aplicação Prática
      if (/^(?:#+\s*)?(?:\*\*)?(?:aplica[cç][aã]o\s*pr[áa]tica|aplica[cç][aã]o\s*pessoal|discipulado|para\s*a\s*(?:nossa\s*)?vida)\b/i.test(trimmed) && trimmed.length < 140) {
        flushTopic();
        currentSection = 'application';
        const inlineApp = trimmed.replace(/^(?:#+\s*)?(?:\*\*)?(?:aplica[cç][aã]o\s*pr[áa]tica|aplica[cç][aã]o\s*pessoal|discipulado|para\s*a\s*(?:nossa\s*)?vida)\s*[:–—.-]?\s*(?:\*\*)?/i, '').trim();
        if (inlineApp) applicationItems.push(inlineApp);
        continue;
      }

      // Reconhecimento de Conclusão
      if (/^(?:#+\s*)?(?:\*\*)?(?:conclus[aã]o|considera[cç][õo]es\s*finais|encerramento)\b/i.test(trimmed) && trimmed.length < 140) {
        flushTopic();
        currentSection = 'conclusion';
        const inlineConc = trimmed.replace(/^(?:#+\s*)?(?:\*\*)?(?:conclus[aã]o|considera[cç][õo]es\s*finais|encerramento)\s*[:–—.-]?\s*(?:\*\*)?/i, '').trim();
        if (inlineConc) conclusionParagraphs.push(inlineConc);
        continue;
      }

      // Reconhecimento de Perguntas de Fixação / Questionário / Hora da Revisão
      if (/^(?:#+\s*)?(?:\*\*)?(?:perguntas(?:\s*de\s*fixa[cç][aã]o)?|question[áa]rio|hora\s*da\s*revis[aã]o|revis[aã]o\s*da\s*li[cç][aã]o|valida[cç][aã]o|exerc[íi]cios?)\b/i.test(trimmed) && trimmed.length < 140) {
        flushTopic();
        currentSection = 'quiz';
        continue;
      }

      // 8. Tópicos Principais (## I — ..., I — ..., I., Tópico I:, TÓPICO 1 - ...)
      const topicMatch = trimmed.match(/^(?:##\s+)?(?:\*\*)?(?:t[óo]pico\s+)?([IVX]{1,4}|\d{1,2})\s*[-–—.:]\s*(?:\*\*)?(.*)$/i);
      if (topicMatch && trimmed.length < 160) {
        const romanOrNum = topicMatch[1].toUpperCase();
        const rawTitle = topicMatch[2].replace(/[*_#]/g, '').trim();
        const isRoman = /^[IVX]{1,4}$/.test(romanOrNum);
        const isExplicitTopic = /t[óo]pico/i.test(trimmed) || /^##\s+/.test(trimmed);
        const isAllCapsHeading = rawTitle.length > 3 && rawTitle === rawTitle.toUpperCase() && /[A-ZÀ-Ÿ]/.test(rawTitle);

        if (isRoman || isExplicitTopic || (!currentTopic && isAllCapsHeading)) {
          flushTopic();
          currentSection = 'topics';
          currentTopic = {
            roman: romanOrNum,
            title: rawTitle || `Tópico ${romanOrNum}`,
            introParagraphs: [],
            topicRefs: '',
            topicVersesARC: [],
            subtopics: [],
            specialBlocks: [],
            synthesis: '',
            detectedRefs: []
          };
          continue;
        }
      }

      // 9. Subtópicos dentro de um Tópico (### 1.1 ..., 1.1 ..., 1. Título curto..., 2. Título curto..., a) ...)
      if (currentTopic && currentSection !== 'quiz') {
        const subMatch = trimmed.match(/^(?:###\s+)?(?:\*\*)?(\d+\.\d+|\d{1,2}|[a-d]\))\s*[.-–—:)]?\s*(?:\*\*)?(.*)$/);
        if (subMatch) {
          const codeStr = subMatch[1].replace(/\)$/, '');
          const restSub = subMatch[2] ? subMatch[2].replace(/^\*\*|\*\*$/g, '').trim() : '';
          const isDecimalSub = /^\d+\.\d+$/.test(codeStr) || /^###\s+/.test(trimmed);
          // No padrão CPAD: "1. O significado da palavra. O termo..." -> separa título na primeira frase curta!
          const firstDotIdx = restSub.indexOf('. ');
          const hasShortLeadSentence = firstDotIdx > 3 && firstDotIdx < 85;
          const isShortTitleLine = restSub.length > 2 && restSub.length < 95 && !restSub.endsWith('.');

          if (isDecimalSub || hasShortLeadSentence || isShortTitleLine) {
            flushSubtopic();
            inTopicVersesBlock = false;

            let subTitle = restSub;
            let firstParagraph = '';
            if (!isDecimalSub && hasShortLeadSentence && restSub.length >= 90) {
              subTitle = restSub.slice(0, firstDotIdx).replace(/[*_#]/g, '').trim();
              firstParagraph = restSub.slice(firstDotIdx + 2).trim();
            } else {
              subTitle = restSub.replace(/[*_#]/g, '').trim() || `Subtópico ${codeStr}`;
            }

            currentSubtopic = {
              code: codeStr,
              title: subTitle,
              baseRef: '',
              paragraphs: firstParagraph ? [firstParagraph] : [],
              scriptureQuote: [],
              classApplication: '',
              detectedRefs: []
            };
            currentSection = 'topics';
            continue;
          }
        }
      }

      // 10. Acúmulo de conteúdo com garantia de 100% de preservação
      if (currentSpecialBlock) {
        currentSpecialBlock.paragraphs.push(trimmed);
        continue;
      }

      if (currentSection === 'objectives') {
        objectivesList.push(trimmed.replace(/^[-•*]\s*/, ''));
        continue;
      }

      if (currentSection === 'daily_reading') {
        dailyReadings.push(trimmed.replace(/^[-•*]\s*/, ''));
        continue;
      }

      if (currentSection === 'interaction') {
        teacherInteraction.push(trimmed);
        continue;
      }

      if (currentSection === 'golden') {
        if (!goldenText) {
          goldenText = trimmed.replace(/^["“]|["”]$/g, '').trim();
        } else {
          // Se já preencheu o Texto Áureo e veio um parágrafo longo sem marcador, preserva na introdução!
          if (trimmed.length > 120) {
            currentSection = 'intro';
            introParagraphs.push(trimmed);
          } else {
            goldenText += ' ' + trimmed.replace(/^["“]|["”]$/g, '').trim();
          }
        }
        continue;
      }

      if (currentSection === 'truth') {
        if (!practicalTruth) {
          practicalTruth = trimmed;
        } else if (trimmed.length > 140) {
          currentSection = 'intro';
          introParagraphs.push(trimmed);
        } else {
          practicalTruth += ' ' + trimmed;
        }
        continue;
      }

      if (currentSection === 'bible') {
        // Verifica se a linha da Leitura Bíblica já é o início de um comentário longo sem marcador de "Introdução"
        const looksLikeVerseLine =
          /^(?:\[?\d{1,3}\s*[-–.:]|\[?[1-3]?\s?[A-Za-zÀ-ÿ]+\s+\d+)/.test(trimmed) ||
          trimmed.length < 180;
        if (looksLikeVerseLine || bibleReadingLines.length < 2) {
          bibleReadingLines.push(trimmed);
        } else {
          currentSection = 'intro';
          introParagraphs.push(trimmed);
        }
        continue;
      }

      if (currentSection === 'intro') {
        introParagraphs.push(trimmed);
        continue;
      }

      if (currentSection === 'doctrinal') {
        doctrinalParagraphs.push(trimmed);
        continue;
      }

      if (currentSection === 'topics' && currentTopic) {
        if (currentSubtopic) {
          if (/^\*\*Base B[íi]blica de Apoio:\*\*/i.test(trimmed)) {
            currentSubtopic.baseRef = trimmed.replace(/^\*\*Base B[íi]blica de Apoio:\*\*/i, '').trim();
          } else if (/^\*\*Aplica[cç][aã]o Pedag[óo]gica/i.test(trimmed)) {
            currentSubtopic.classApplication = trimmed.replace(/^\*\*Aplica[cç][aã]o Pedag[óo]gica[^:]*:\*\*/i, '').trim();
          } else if (trimmed.startsWith('>')) {
            const cleanQuote = trimmed.replace(/^>\s*/, '').trim();
            if (cleanQuote) currentSubtopic.scriptureQuote.push(cleanQuote);
          } else if (/^\*\*S[íi]ntese Teol[óo]gica/i.test(trimmed)) {
            currentTopic.synthesis = trimmed.replace(/^\*\*S[íi]ntese Teol[óo]gica[^:]*:\*\*/i, '').trim();
          } else {
            currentSubtopic.paragraphs.push(trimmed);
          }
        } else {
          if (/^\*\*Refer[êe]ncias B[íi]blicas do T[óo]pico/i.test(trimmed)) {
            currentTopic.topicRefs = trimmed.replace(/^\*\*Refer[êe]ncias B[íi]blicas do T[óo]pico[^:]*:\*\*/i, '').trim();
            inTopicVersesBlock = false;
          } else if (/^\*\*Sustenta[cç][aã]o B[íi]blica na [ÍI]ntegra/i.test(trimmed)) {
            inTopicVersesBlock = true;
          } else if (/^\*\*S[íi]ntese Teol[óo]gica/i.test(trimmed)) {
            inTopicVersesBlock = false;
            currentTopic.synthesis = trimmed.replace(/^\*\*S[íi]ntese Teol[óo]gica[^:]*:\*\*/i, '').trim();
          } else if (inTopicVersesBlock) {
            currentTopic.topicVersesARC.push(trimmed);
          } else {
            currentTopic.introParagraphs.push(trimmed);
          }
        }
        continue;
      }

      if (currentSection === 'application') {
        applicationItems.push(trimmed);
        continue;
      }

      if (currentSection === 'conclusion') {
        conclusionParagraphs.push(trimmed);
        continue;
      }

      if (currentSection === 'quiz') {
        if (
          /^(?:\*\*)?(?:Quest[aã]o|Pergunta)\s*\d+/i.test(trimmed) ||
          /^\d{1,2}\s*[.-–—)]\s*.*\?$/.test(trimmed)
        ) {
          flushQuiz();
          currentQuizQuestion = trimmed.replace(/\*\*/g, '').trim();
        } else if (/^\*?(?:Gabarito|Resposta|R:)/i.test(trimmed)) {
          currentQuizAnswer = trimmed.replace(/^\*?(?:Gabarito Teol[óo]gico Comentado|Gabarito|Resposta|R)\s*:?\*?\s*/i, '').trim();
        } else if (currentQuizAnswer) {
          currentQuizAnswer += ' ' + trimmed;
        } else if (currentQuizQuestion) {
          currentQuizQuestion += ' ' + trimmed;
        } else {
          currentQuizQuestion = trimmed;
        }
        continue;
      }

      // GARANTIA DE 100% DO CONTEÚDO: se ainda estiver em 'header', título curto vira título e qualquer outro texto entra na Introdução!
      if (currentSection === 'header') {
        if (!extractedTitle && trimmed.length < 110 && !trimmed.endsWith('.')) {
          extractedTitle = trimmed.replace(/[*_#]/g, '').trim();
        } else {
          introParagraphs.push(trimmed);
        }
      }
    }

    flushTopic();
    flushQuiz();

    const finalLessonNum = extractedLessonNum || cleanLicaoNum;
    const finalTheme = extractedTheme || subtitulo;
    let finalTitle = extractedTitle || cleanTituloLicao;
    if (!finalTitle && finalTheme) {
      finalTitle = finalTheme;
    }
    if (!finalTitle) {
      finalTitle = 'Estudo Bíblico EBD';
    }

    let headerTitle = finalTitle;
    if (!finalTitle.toLowerCase().startsWith('lição') && !finalTitle.toLowerCase().startsWith('aula')) {
      headerTitle = `Lição ${finalLessonNum}: ${finalTitle}`;
    }

    // Se o usuário inseriu um texto livre sem marcadores de Tópico I/II/III, estruturamos 100% dos parágrafos em tópicos didáticos
    if (topics.length === 0 && introParagraphs.length > 0) {
      const totalP = introParagraphs.length;
      if (totalP <= 3) {
        topics.push({
          roman: 'I',
          title: finalTitle || 'Exposição Geral da Lição',
          introParagraphs: [...introParagraphs],
          topicRefs: bibleRefDetected || leituraBiblica.trim() || dogmatic.leituraPadrao,
          topicVersesARC: [],
          subtopics: [],
          specialBlocks: [],
          synthesis: '',
          detectedRefs: extractAllBibleRefsFromText(introParagraphs.join(' '))
        });
        introParagraphs = [];
      } else {
        const romans = ['I', 'II', 'III', 'IV'];
        const remainingP = [...introParagraphs];
        introParagraphs = remainingP.splice(0, Math.min(2, Math.max(1, Math.floor(totalP / 5))));
        const chunkSize = Math.ceil(remainingP.length / 3);

        let rIdx = 0;
        while (remainingP.length > 0 && rIdx < romans.length) {
          const chunk = remainingP.splice(0, chunkSize);
          const firstLine = chunk[0] || '';
          const topicTitle =
            firstLine.length < 90
              ? firstLine.replace(/[*_#]/g, '').trim()
              : `Desenvolvimento Exegético ${romans[rIdx]}`;
          topics.push({
            roman: romans[rIdx],
            title: topicTitle,
            introParagraphs: chunk,
            topicRefs: bibleRefDetected || leituraBiblica.trim() || dogmatic.leituraPadrao,
            topicVersesARC: [],
            subtopics: [],
            specialBlocks: [],
            synthesis: '',
            detectedRefs: extractAllBibleRefsFromText(chunk.join(' '))
          });
          rIdx++;
        }
      }
    }

    // Garantir Leitura Bíblica completa com versículos reais da ARC
    let finalBibleReading = bibleReadingLines.join('\n').trim();
    if (!finalBibleReading || finalBibleReading.length < 35) {
      const refToUse = bibleRefDetected || leituraBiblica.trim() || dogmatic.leituraPadrao;
      const arcText = getFormattedBiblePassageARC(refToUse, 18);
      finalBibleReading = `Referência Base: ${refToUse} (Almeida Revista e Corrigida - ARC)\n${arcText}`;
    }

    return {
      title: headerTitle,
      lessonNum: finalLessonNum,
      extractedTheme: finalTheme,
      extractedTitle: finalTitle,
      centralPoint,
      keyWord,
      objectives: objectivesList,
      dailyReadings,
      teacherInteraction,
      dogmaticCap: dogmatic.capitulo,
      dogmaticTitle: dogmatic.titulo,
      goldenText: goldenText || dogmatic.textoAureoPadrao,
      practicalTruth: practicalTruth || dogmatic.verdadePraticaPadrao,
      bibleReading: finalBibleReading,
      bibleRefHeader: bibleRefDetected || leituraBiblica.trim() || dogmatic.leituraPadrao,
      intro: introParagraphs.join('\n\n') || `Estudo exegético aprofundado da Lição ${finalLessonNum} (${finalTitle || revista}).`,
      doctrinal:
        doctrinalParagraphs.length > 0
          ? doctrinalParagraphs
          : [dogmatic.fundamentacao, `Termos Originais: ${dogmatic.termosOriginais}`],
      topics,
      generalSpecialBlocks,
      application: applicationItems,
      conclusion:
        conclusionParagraphs.join('\n\n') ||
        `Que a Palavra de Deus estudada nesta Lição ${finalLessonNum} produza frutos permanentes para a glória de Cristo.`,
      quiz: quizItems
    };
  }, [
    completeLessonMarkdown,
    revista,
    subtitulo,
    cleanLicaoNum,
    cleanTituloLicao,
    leituraBiblica,
    textoAureo,
    verdadePratica
  ]);

  // DEFINIÇÃO DAS PÁGINAS DA REVISTA INTERATIVA (100% DO CONTEÚDO DISTRIBUÍDO EM PÁGINAS)
  const magazinePages = useMemo(() => {
    const pages: Array<{
      id: string;
      pageNumber: number;
      shortLabel: string;
      fullTitle: string;
      subtitle: string;
      type: 'cover' | 'intro_bible' | 'topic' | 'general_subsidios' | 'conclusion_review';
      topicIndex?: number;
    }> = [];

    // Página 1: Capa e Sumário
    pages.push({
      id: 'page-cover',
      pageNumber: 1,
      shortLabel: 'Capa',
      fullTitle: `Capa • ${parsedMagazine.title}`,
      subtitle: parsedMagazine.extractedTheme || revista,
      type: 'cover'
    });

    // Página 2: Fundamentos, Leitura Bíblica & Introdução
    pages.push({
      id: 'page-intro',
      pageNumber: 2,
      shortLabel: 'Pág. 2 • Introdução',
      fullTitle: 'Texto Áureo, Leitura Bíblica & Introdução',
      subtitle: `Base Bíblica: ${parsedMagazine.bibleRefHeader}`,
      type: 'intro_bible'
    });

    // Páginas dos Tópicos (1 Tópico Completo por Página com seus Subtópicos, Subsídios e Auxílios ao Professor)
    parsedMagazine.topics.forEach((t, idx) => {
      const pNum = pages.length + 1;
      pages.push({
        id: `page-topic-${idx}`,
        pageNumber: pNum,
        shortLabel: `Pág. ${pNum} • Tópico ${t.roman}`,
        fullTitle: `Tópico ${t.roman} — ${t.title}`,
        subtitle: `${t.subtopics.length} subtópico(s) • ${t.specialBlocks.length} subsídio(s)/auxílio(s)`,
        type: 'topic',
        topicIndex: idx
      });
    });

    // Página de Subsídios e Auxílios Gerais (se houver blocos especiais fora dos tópicos)
    if (parsedMagazine.generalSpecialBlocks.length > 0) {
      const pNum = pages.length + 1;
      pages.push({
        id: 'page-general-subsidios',
        pageNumber: pNum,
        shortLabel: `Pág. ${pNum} • Subsídios`,
        fullTitle: 'Subsídios Teológicos & Auxílio ao Professor',
        subtitle: `${parsedMagazine.generalSpecialBlocks.length} quadro(s) de aprofundamento`,
        type: 'general_subsidios'
      });
    }

    // Página Final: Aplicação Prática, Conclusão, Revisão e Diário de Aula
    const finalPNum = pages.length + 1;
    pages.push({
      id: 'page-conclusion',
      pageNumber: finalPNum,
      shortLabel: `Pág. ${finalPNum} • Conclusão`,
      fullTitle: 'Aplicação Prática, Conclusão & Revisão',
      subtitle: 'Encerramento da Aula e Questionário',
      type: 'conclusion_review'
    });

    return pages;
  }, [parsedMagazine, revista]);

  // Garante que currentPageIndex seja válido quando o conteúdo muda
  useEffect(() => {
    if (currentPageIndex >= magazinePages.length) {
      setCurrentPageIndex(0);
    }
  }, [magazinePages.length, currentPageIndex]);

  // Navegação por setas do teclado quando em modo paginado
  useEffect(() => {
    if (activeTab !== 'magazine' || readingFormat !== 'paginated') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        setCurrentPageIndex(prev => Math.min(magazinePages.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, readingFormat, magazinePages.length]);

  // Segmentos de Áudio da Lição EBD (sincronizados com as páginas da revista)
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [activeAudioSectionId, setActiveAudioSectionId] = useState<string | null>(null);

  const ebdAudioSegments: AudioSegment[] = useMemo(() => {
    const list: AudioSegment[] = [];

    list.push({
      id: 'section-header',
      label: `Capa • Lição ${parsedMagazine.lessonNum}: ${parsedMagazine.title}`,
      sublabel: parsedMagazine.extractedTheme ? `Tema: ${parsedMagazine.extractedTheme}` : 'Capa da Revista',
      text: `Aula e Lição ${parsedMagazine.lessonNum}. ${parsedMagazine.title}. ${parsedMagazine.extractedTheme ? `Tema: ${parsedMagazine.extractedTheme}. ` : ''}Base bíblica: ${parsedMagazine.bibleRefHeader}. Doutrina: ${parsedMagazine.dogmaticCap}, ${parsedMagazine.dogmaticTitle}.`
    });

    if (parsedMagazine.goldenText) {
      list.push({
        id: 'section-golden',
        label: `Texto Áureo da Lição ${parsedMagazine.lessonNum}`,
        sublabel: 'Página 2 • Memória e Meditação',
        text: `Texto Áureo: ${parsedMagazine.goldenText}`
      });
    }

    if (parsedMagazine.practicalTruth) {
      list.push({
        id: 'section-truth',
        label: 'Verdade Prática',
        sublabel: 'Página 2 • Fundamento Ético',
        text: `Verdade Prática: ${parsedMagazine.practicalTruth}`
      });
    }

    if (parsedMagazine.bibleReading) {
      list.push({
        id: 'section-bible',
        label: `Leitura Bíblica: ${parsedMagazine.bibleRefHeader}`,
        sublabel: 'Página 2 • Passagem ARC',
        text: `Leitura Bíblica em Classe, ${parsedMagazine.bibleRefHeader}. ${parsedMagazine.bibleReading.replace(/Referência Base:[^]+?\n/gi, '')}`
      });
    }

    if (parsedMagazine.intro) {
      list.push({
        id: 'section-intro',
        label: 'Introdução da Lição',
        sublabel: 'Página 2 • Contextualização',
        text: `Introdução da Lição: ${parsedMagazine.intro}`
      });
    }

    if (parsedMagazine.doctrinal && parsedMagazine.doctrinal.length > 0) {
      list.push({
        id: 'section-doctrinal',
        label: `Fundamentação CGADB/CPAD: ${parsedMagazine.dogmaticCap}`,
        sublabel: 'Página 2 • Doutrina Oficial',
        text: `Fundamentação Doutrinária Oficial das Assembleias de Deus, ${parsedMagazine.dogmaticCap}, ${parsedMagazine.dogmaticTitle}. ${parsedMagazine.doctrinal.join(' ')}`
      });
    }

    parsedMagazine.topics.forEach((topic, tIdx) => {
      list.push({
        id: `section-topic-${tIdx}`,
        label: `Tópico ${topic.roman}: ${topic.title}`,
        sublabel: `Página ${tIdx + 3} • Tópico ${topic.roman}`,
        text: `Tópico ${topic.roman}: ${topic.title}. ${topic.introParagraphs.join(' ')}`
      });

      topic.subtopics.forEach((sub, sIdx) => {
        list.push({
          id: `section-subtopic-${tIdx}-${sIdx}`,
          label: `${sub.code} ${sub.title}`,
          sublabel: `Página ${tIdx + 3} • Tópico ${topic.roman}`,
          text: `Subtópico ${sub.code}: ${sub.title}. ${sub.paragraphs.join(' ')} ${sub.classApplication ? 'Aplicação na Classe: ' + sub.classApplication : ''}`
        });
      });

      topic.specialBlocks.forEach((sp, spIdx) => {
        list.push({
          id: `section-special-${tIdx}-${spIdx}`,
          label: sp.title,
          sublabel: `Página ${tIdx + 3} • Subsídio / Auxílio`,
          text: `${sp.title}. ${sp.paragraphs.join(' ')}`
        });
      });

      if (topic.synthesis) {
        list.push({
          id: `section-synthesis-${tIdx}`,
          label: `Sinopse do Tópico ${topic.roman}`,
          sublabel: `Página ${tIdx + 3} • Resumo`,
          text: `Sinopse do Tópico ${topic.roman}: ${topic.synthesis}`
        });
      }
    });

    if (parsedMagazine.application && parsedMagazine.application.length > 0) {
      list.push({
        id: 'section-application',
        label: 'Aplicação Prática e Discipulado',
        sublabel: 'Página Final • Vida Cristã',
        text: `Aplicação Prática para a Vida Cristã, Família e Igreja: ${parsedMagazine.application.join('. ')}`
      });
    }

    if (parsedMagazine.conclusion) {
      list.push({
        id: 'section-conclusion',
        label: 'Conclusão da Lição',
        sublabel: 'Página Final • Encerramento Pastoral',
        text: `Conclusão da Lição: ${parsedMagazine.conclusion}`
      });
    }

    return list;
  }, [parsedMagazine]);

  // Mapeia um ID de seção de áudio para o índice da página correspondente
  const findPageIndexForSection = useCallback((sectionId: string): number => {
    if (sectionId === 'section-header') return 0;
    if (
      sectionId === 'section-golden' ||
      sectionId === 'section-truth' ||
      sectionId === 'section-bible' ||
      sectionId === 'section-intro' ||
      sectionId === 'section-doctrinal'
    ) {
      return 1;
    }
    const topicMatch = sectionId.match(/^section-(?:topic|subtopic|special|synthesis)-(\d+)/);
    if (topicMatch) {
      const tIdx = parseInt(topicMatch[1], 10);
      const foundPage = magazinePages.findIndex(p => p.type === 'topic' && p.topicIndex === tIdx);
      if (foundPage >= 0) return foundPage;
    }
    if (sectionId === 'section-application' || sectionId === 'section-conclusion') {
      return magazinePages.length - 1;
    }
    return currentPageIndex;
  }, [magazinePages, currentPageIndex]);

  const audioNarration = useAudioNarration(ebdAudioSegments, {
    onSegmentChange: (seg) => {
      const sId = String(seg.id);
      setActiveAudioSectionId(sId);
      const targetPage = findPageIndexForSection(sId);
      if (readingFormat === 'paginated') {
        setCurrentPageIndex(targetPage);
      }
      setTimeout(() => {
        const el = document.getElementById(`ebd-${sId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    },
    onFinish: () => {
      setActiveAudioSectionId(null);
    }
  });

  const handlePlaySectionAudio = (sectionId: string) => {
    setShowAudioPlayer(true);
    const idx = ebdAudioSegments.findIndex(s => String(s.id) === sectionId);
    if (idx >= 0) {
      audioNarration.jumpTo(idx);
    } else {
      audioNarration.play(0);
    }
  };

  const finalCoverImage = useMemo(() => {
    if (customCoverUrl && customCoverUrl.trim()) return customCoverUrl.trim();
    if (capaUrl && capaUrl !== 'null' && !capaUrl.includes('URL_CAPA')) return capaUrl;
    return DEFAULT_COVERS[(parseInt(cleanLicaoNum, 10) || 1) % DEFAULT_COVERS.length];
  }, [customCoverUrl, capaUrl, cleanLicaoNum]);

  // RENDERIZADOR INLINE INTELIGENTE: Formata **negrito**, *itálico* E transforma qualquer versículo citado em um botão que abre a Pequena Janela dentro da Revista!
  const renderFormattedInline = useCallback((text: string) => {
    if (!text) return null;
    const refSplitParts = text.split(INLINE_BIBLE_REF_REGEX);

    return refSplitParts.map((chunk, chunkIdx) => {
      if (!chunk) return null;
      // Verifica se este chunk é exatamente uma referência bíblica detectada
      if (chunkIdx % 2 === 1) {
        const cleanRef = chunk.trim();
        return (
          <button
            key={`ref-${chunkIdx}`}
            type="button"
            onClick={() => handleOpenInlineVerse(cleanRef)}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-lg bg-amber-100/90 hover:bg-amber-300/90 text-amber-950 font-sans font-black text-[0.82em] border border-amber-300 shadow-2xs transition cursor-pointer align-baseline"
            title={`Abrir ${cleanRef} na pequena janela de versículo dentro da revista`}
          >
            <BookOpen size={11} className="text-amber-700 shrink-0" />
            <span>{cleanRef}</span>
          </button>
        );
      }

      // Renderiza **negrito** e *itálico* normalmente nos trechos de texto
      const mdParts = chunk.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
      return (
        <React.Fragment key={`txt-${chunkIdx}`}>
          {mdParts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={idx} className="italic text-emerald-900 font-semibold">{part.slice(1, -1)}</em>;
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          })}
        </React.Fragment>
      );
    });
  }, [handleOpenInlineVerse]);

  // Renderizador de Quadros Especiais (Subsídio Teológico, Auxílio ao Professor, Sinopse, Vocabulário, Destaque)
  const renderSpecialBlockCard = (block: ParsedSpecialBlock, topicIndex?: number, spIndex?: number) => {
    const audioId = topicIndex !== undefined && spIndex !== undefined ? `section-special-${topicIndex}-${spIndex}` : block.id;
    const isPlayingThis = activeAudioSectionId === audioId && audioNarration.isPlaying;

    const stylesByCategory: Record<
      SpecialBlockCategory,
      {
        wrapper: string;
        badge: string;
        badgeText: string;
        icon: React.ReactNode;
        titleColor: string;
        bodyColor: string;
      }
    > = {
      subsidio: {
        wrapper: 'bg-gradient-to-br from-[#FDFBF7] to-[#F7F1E3] border-2 border-[#DECBA4] shadow-sm',
        badge: 'bg-[#8B5A2B] text-white',
        badgeText: 'Subsídio de Aprofundamento',
        icon: <Layers size={14} className="text-amber-200" />,
        titleColor: 'text-[#4A3219]',
        bodyColor: 'text-[#3D2B1F]'
      },
      auxilio_professor: {
        wrapper: 'bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-white border-2 border-indigo-200 shadow-sm',
        badge: 'bg-indigo-700 text-white',
        badgeText: 'Auxílio ao Professor & Didática',
        icon: <GraduationCap size={14} className="text-indigo-200" />,
        titleColor: 'text-indigo-950',
        bodyColor: 'text-slate-800'
      },
      sinopse: {
        wrapper: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 text-white shadow-md',
        badge: 'bg-emerald-500 text-slate-950',
        badgeText: 'Sinopse / Síntese',
        icon: <Compass size={14} className="text-slate-950" />,
        titleColor: 'text-emerald-300',
        bodyColor: 'text-emerald-50'
      },
      vocabulario: {
        wrapper: 'bg-gradient-to-br from-slate-100 to-teal-50/50 border-2 border-teal-200/80 shadow-xs',
        badge: 'bg-teal-800 text-white',
        badgeText: 'Vocabulário & Léxico Bíblico',
        icon: <Bookmark size={14} className="text-teal-200" />,
        titleColor: 'text-teal-950',
        bodyColor: 'text-slate-800'
      },
      destaque: {
        wrapper: 'bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-l-4 border-amber-500 border border-amber-200/80 shadow-xs',
        badge: 'bg-amber-600 text-white',
        badgeText: 'Quadro de Reflexão & Destaque',
        icon: <Lightbulb size={14} className="text-amber-100" />,
        titleColor: 'text-amber-950',
        bodyColor: 'text-amber-950'
      }
    };

    const st = stylesByCategory[block.category];

    return (
      <div
        key={block.id}
        id={`ebd-${audioId}`}
        className={`rounded-3xl p-6 sm:p-7 space-y-4 transition-all ${st.wrapper} ${
          isPlayingThis ? 'ring-4 ring-emerald-400 scale-[1.005]' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-current/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${st.badge}`}>
              {st.icon}
              <span>{st.badgeText}</span>
            </span>
            <h4 className={`text-base sm:text-lg font-black ${st.titleColor}`}>
              {block.title}
            </h4>
          </div>

          {topicIndex !== undefined && spIndex !== undefined && (
            <button
              type="button"
              onClick={() => handlePlaySectionAudio(audioId)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                block.category === 'sinopse'
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-300/70'
              }`}
            >
              <Volume2 size={12} className={isPlayingThis ? 'animate-bounce' : ''} />
              <span>{isPlayingThis ? 'Ouvindo...' : 'Ouvir Quadro'}</span>
            </button>
          )}
        </div>

        <div className={`space-y-3 font-serif text-sm sm:text-base leading-relaxed ${st.bodyColor}`}>
          {block.paragraphs.map((p, idx) => (
            <p key={idx}>{renderFormattedInline(p)}</p>
          ))}
        </div>

        {block.detectedRefs.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-current/10">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-75 mr-1">
              Versículos neste quadro:
            </span>
            {block.detectedRefs.map((ref, rIdx) => (
              <button
                key={rIdx}
                type="button"
                onClick={() => handleOpenInlineVerse(ref)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-current text-[11px] font-black flex items-center gap-1 cursor-pointer transition border border-current/15"
              >
                <BookOpen size={11} />
                <span>{ref}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div id="interactive_magazine_loader" className="flex flex-col items-center justify-center min-h-[500px] w-full bg-slate-50/50 p-8 text-center animate-fadeIn font-sans">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100/50 animate-ping opacity-75"></div>
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin relative z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Sparkles className="text-emerald-500 animate-pulse" size={20} />
          </div>
        </div>
        <h4 className="font-['Outfit'] font-extrabold text-lg text-slate-800 tracking-tight mb-2 animate-pulse">
          Diagramando Páginas da Revista de Estudo Bíblico
        </h4>
        <p className="text-xs font-semibold text-slate-500 max-w-md leading-relaxed mx-auto">
          Organizando capa, tópicos, subtópicos, subsídios teológicos, auxílio ao professor e versículos interativos da Bíblia ARC...
        </p>
      </div>
    );
  }

  // Renderizadores das Páginas Individuais da Revista
  const renderCoverPage = (pageNum: number, totalPages: number) => (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. CAPA OFICIAL DA REVISTA INTERATIVA */}
      <div
        id="ebd-section-header"
        className={`relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white shadow-2xl border transition-all ${
          activeAudioSectionId === 'section-header'
            ? 'border-emerald-400 ring-4 ring-emerald-400/40'
            : 'border-white/10'
        }`}
      >
        <div className="absolute inset-0 opacity-35 mix-blend-overlay">
          <img
            src={finalCoverImage}
            alt="Capa da Revista"
            className="w-full h-full object-cover blur-xs"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent"></div>

        {/* Topo Editorial da Capa */}
        <div className="relative z-10 px-6 pt-6 md:px-12 md:pt-8 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold">
            <Building2 size={14} className="text-emerald-400" />
            <span>{editora || 'CPAD'}</span>
            {trimestre && <span>• {trimestre}</span>}
            {turma && <span>• Turma: {turma}</span>}
          </div>
          <div className="font-mono text-[11px] text-emerald-300 font-bold">
            CAPA DA REVISTA • PÁGINA {pageNum} DE {totalPages}
          </div>
        </div>

        <div className="relative z-10 px-6 py-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {/* Arte da Capa */}
          <div className="w-44 sm:w-52 shrink-0 aspect-[2/3] bg-white rounded-2xl rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl overflow-hidden border-4 border-white/90 ring-1 ring-emerald-500/50">
            <img src={finalCoverImage} alt={revista} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>

          {/* Dados Principais da Lição e Tema */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" />
                  Tema: {parsedMagazine.extractedTheme || subtitulo || 'Ensino Sistemático das Escrituras'}
                </span>
              </div>
              {revista && (
                <p className="text-slate-300 text-xs font-semibold">
                  Revista: {revista} {dataLicao ? `• Aula: ${dataLicao.split('-').reverse().join('/')}` : ''}
                </p>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Outfit'] leading-tight text-white tracking-tight drop-shadow-md">
              {parsedMagazine.title}
            </h1>

            <div className="h-1 w-20 bg-emerald-400 rounded-full mx-auto md:mx-0"></div>

            {/* Destaque do Texto Áureo na Capa */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 text-left space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  Texto Áureo da Lição {parsedMagazine.lessonNum}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenInlineVerse(parsedMagazine.goldenText)}
                  className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                >
                  Abrir Versículo
                </button>
              </div>
              <p className="font-serif italic text-xs sm:text-sm text-white/95 leading-relaxed">
                “{renderFormattedInline(parsedMagazine.goldenText)}”
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <button
                type="button"
                onClick={() => handlePlaySectionAudio('section-header')}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-2 border border-white/20 transition cursor-pointer"
              >
                <Volume2 size={15} className="text-emerald-300" />
                <span>Ouvir Apresentação</span>
              </button>

              {readingFormat === 'paginated' && totalPages > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex(1)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <span>Abrir Revista • Ir para Página 2</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMÁRIO INTERATIVO DAS PÁGINAS DA REVISTA */}
      <div className="bg-white rounded-[2rem] border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ListOrdered size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Sumário das Páginas desta Edição (100% do Conteúdo Organizado)
              </h3>
              <p className="text-xs text-slate-500">
                Clique em qualquer página abaixo para folhear diretamente para o tópico, subsídio ou conclusão desejada
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {magazinePages.length} Páginas Diagramadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {magazinePages.map((pg, idx) => (
            <button
              key={pg.id}
              type="button"
              onClick={() => {
                setReadingFormat('paginated');
                setCurrentPageIndex(idx);
              }}
              className={`p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                currentPageIndex === idx && readingFormat === 'paginated'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono text-xs font-black flex items-center justify-center shrink-0">
                  {pg.pageNumber}
                </span>
                <div className="min-w-0">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                    {pg.fullTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {pg.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntroAndBiblePage = (pageNum: number, totalPages: number) => (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho Corrido da Página da Revista */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-600 shadow-2xs">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={14} className="text-emerald-600" />
          <span>{revista} • {parsedMagazine.title}</span>
        </div>
        <div className="font-mono font-black text-emerald-700">
          PÁGINA {pageNum} DE {totalPages} • FUNDAMENTOS & INTRODUÇÃO
        </div>
      </div>

      {/* TEXTO ÁUREO & VERDADE PRÁTICA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          id="ebd-section-golden"
          className={`bg-gradient-to-br from-amber-50 to-amber-100/50 p-7 sm:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden transition-all ${
            activeAudioSectionId === 'section-golden'
              ? 'border-amber-500 ring-4 ring-amber-400/50'
              : 'border-amber-200/80'
          }`}
        >
          <div className="absolute top-0 right-0 p-6 text-amber-200/40 select-none">
            <Quote size={68} className="stroke-[1.5]" />
          </div>
          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                Texto Áureo • Lição {parsedMagazine.lessonNum}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePlaySectionAudio('section-golden')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Volume2 size={12} /> Ouvir
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenInlineVerse(parsedMagazine.goldenText)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <BookOpen size={12} /> Abrir na Janela
                </button>
              </div>
            </div>
            <blockquote className="font-serif italic text-base sm:text-lg text-amber-950 leading-relaxed font-semibold">
              “{renderFormattedInline(parsedMagazine.goldenText)}”
            </blockquote>
          </div>
        </div>

        <div
          id="ebd-section-truth"
          className={`bg-gradient-to-br from-emerald-50 to-teal-50/60 p-7 sm:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden transition-all ${
            activeAudioSectionId === 'section-truth'
              ? 'border-emerald-500 ring-4 ring-emerald-400/50'
              : 'border-emerald-200/80'
          }`}
        >
          <div className="absolute top-0 right-0 p-6 text-emerald-200/35 select-none">
            <Award size={72} className="stroke-[1.3]" />
          </div>
          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                Verdade Prática
              </span>
              <button
                type="button"
                onClick={() => handlePlaySectionAudio('section-truth')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-950 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Volume2 size={12} /> Ouvir
              </button>
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
              {renderFormattedInline(parsedMagazine.practicalTruth)}
            </p>
          </div>
        </div>
      </div>

      {/* OBJETIVOS DA LIÇÃO / PONTO CENTRAL / PALAVRA-CHAVE / LEITURA DIÁRIA (SE PRESENTES NO CONTEÚDO) */}
      {(parsedMagazine.objectives.length > 0 ||
        parsedMagazine.centralPoint ||
        parsedMagazine.keyWord ||
        parsedMagazine.dailyReadings.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(parsedMagazine.objectives.length > 0 || parsedMagazine.centralPoint || parsedMagazine.keyWord) && (
            <div className="bg-white rounded-3xl border border-indigo-200/80 p-6 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" />
                <span>Objetivos Pedagógicos & Síntese da Aula</span>
              </h4>
              {parsedMagazine.centralPoint && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-950">
                  <strong className="font-black block text-[10px] uppercase tracking-wider text-indigo-700 mb-0.5">
                    Ponto Central:
                  </strong>
                  {renderFormattedInline(parsedMagazine.centralPoint)}
                </div>
              )}
              {parsedMagazine.keyWord && (
                <div className="text-xs sm:text-sm text-slate-800 font-bold">
                  <span className="text-indigo-700 uppercase text-[10px] font-black tracking-wider mr-2">
                    Palavra-Chave:
                  </span>
                  {parsedMagazine.keyWord}
                </div>
              )}
              {parsedMagazine.objectives.length > 0 && (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-serif list-disc list-inside">
                  {parsedMagazine.objectives.map((obj, oIdx) => (
                    <li key={oIdx} className="leading-relaxed">
                      {renderFormattedInline(obj)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {parsedMagazine.dailyReadings.length > 0 && (
            <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Calendar size={15} className="text-amber-600" />
                <span>Leitura Diária da Semana</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-serif">
                {parsedMagazine.dailyReadings.map((dr, dIdx) => (
                  <div key={dIdx} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                    {renderFormattedInline(dr)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERAÇÃO DO PROFESSOR (SE PRESENTE NO TEXTO) */}
      {parsedMagazine.teacherInteraction.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-sky-50/60 border-2 border-indigo-200 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-900">
            <GraduationCap size={16} className="text-indigo-700" />
            <span>Interação & Orientação Inicial ao Professor</span>
          </div>
          <div className="space-y-2.5 font-serif text-sm sm:text-base text-slate-800 leading-relaxed">
            {parsedMagazine.teacherInteraction.map((line, idx) => (
              <p key={idx}>{renderFormattedInline(line)}</p>
            ))}
          </div>
        </div>
      )}

      {/* LEITURA BÍBLICA EM CLASSE */}
      <div
        id="ebd-section-bible"
        className={`bg-[#FAF5ED] rounded-[2.5rem] border p-7 md:p-9 shadow-inner relative transition-all ${
          activeAudioSectionId === 'section-bible'
            ? 'border-amber-600 ring-4 ring-amber-500/40'
            : 'border-[#E3DAC9]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E3DAC9]">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6E451F]">
            <Scroll size={15} className="text-[#8B5A2B]" />
            <span>Leitura Bíblica em Classe • {parsedMagazine.bibleRefHeader}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handlePlaySectionAudio('section-bible')}
              className="px-3 py-1.5 rounded-xl bg-[#8B5A2B]/15 hover:bg-[#8B5A2B]/25 text-[#6E451F] text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 size={13} />
              <span>Ouvir Leitura</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenInlineVerse(parsedMagazine.bibleRefHeader)}
              className="px-3 py-1.5 rounded-xl bg-[#8B5A2B] hover:bg-[#6E451F] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <BookOpen size={13} />
              <span>Abrir Passagem na Janela</span>
            </button>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-[#3D3026] text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-loose font-serif font-medium bg-white/85 p-5 md:p-7 rounded-2xl border border-[#EBE3D3] shadow-2xs">
          {renderFormattedInline(parsedMagazine.bibleReading)}
        </div>
      </div>

      {/* INTRODUÇÃO COMPLETA DA LIÇÃO */}
      <div
        id="ebd-section-intro"
        className={`space-y-4 bg-white p-7 md:p-10 rounded-[2.5rem] border shadow-xs transition-all ${
          activeAudioSectionId === 'section-intro'
            ? 'border-emerald-500 ring-4 ring-emerald-400/40'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-600" />
            <span>Introdução & Contextualização da Lição {parsedMagazine.lessonNum}</span>
          </span>
          <button
            type="button"
            onClick={() => handlePlaySectionAudio('section-intro')}
            className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 size={12} />
            <span>Ouvir Introdução</span>
          </button>
        </div>

        <div className="font-serif text-slate-800 text-sm sm:text-base leading-loose space-y-4">
          {parsedMagazine.intro.split('\n\n').map((para, idx) => (
            <p
              key={idx}
              className={idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:text-emerald-700 first-letter:mr-1' : ''}
            >
              {renderFormattedInline(para)}
            </p>
          ))}
        </div>
      </div>

      {/* FUNDAMENTAÇÃO DOUTRINÁRIA CGADB / CPAD */}
      <div
        id="ebd-section-doctrinal"
        className={`bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-7 md:p-9 rounded-[2.5rem] shadow-xl border space-y-4 transition-all ${
          activeAudioSectionId === 'section-doctrinal'
            ? 'border-amber-400 ring-4 ring-amber-400/40'
            : 'border-indigo-800/60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-amber-300" />
            <span>Fundamentação Doutrinária • {parsedMagazine.dogmaticCap}</span>
          </span>
          <button
            type="button"
            onClick={() => handlePlaySectionAudio('section-doctrinal')}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 size={12} />
            <span>Ouvir Doutrina</span>
          </button>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white">
          {parsedMagazine.dogmaticTitle}
        </h3>
        <div className="space-y-3 text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed font-serif">
          {parsedMagazine.doctrinal.map((line, idx) => (
            <p key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10">
              {renderFormattedInline(line)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopicPage = (topic: ParsedTopic, topicIndex: number, pageNum: number, totalPages: number) => {
    const topicIllustration = getIllustrationForTopic(
      topic.title,
      [
        ...topic.introParagraphs,
        ...topic.subtopics.flatMap(s => s.paragraphs),
        ...topic.specialBlocks.flatMap(b => b.paragraphs)
      ],
      topicIndex + 1
    );

    return (
      <div key={`topic-page-${topicIndex}`} className="space-y-8 animate-fadeIn">
        {/* Cabeçalho Corrido da Página do Tópico */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-600 shadow-2xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={14} className="text-emerald-600" />
            <span>Lição {parsedMagazine.lessonNum} • Tópico {topic.roman}: {topic.title}</span>
          </div>
          <div className="font-mono font-black text-emerald-700">
            PÁGINA {pageNum} DE {totalPages} • EXEGESE & SUBSÍDIOS
          </div>
        </div>

        {/* Banner Visual Ilustrado do Tópico */}
        <div className="rounded-[2.25rem] overflow-hidden shadow-md aspect-[16/5] relative group border border-slate-200">
          <img
            src={topicIllustration.url}
            alt={topic.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <ImageIcon size={12} /> Ilustração Editorial • Tópico {topic.roman}
            </p>
            <h4 className="text-white text-xs sm:text-sm font-sans font-medium drop-shadow-md">
              {topicIllustration.caption}
            </h4>
          </div>
        </div>

        {/* Corpo Principal do Tópico */}
        <div
          id={`ebd-section-topic-${topicIndex}`}
          className={`bg-white p-7 sm:p-9 md:p-11 rounded-[2.5rem] border shadow-xs space-y-7 relative overflow-hidden transition-all ${
            activeAudioSectionId === `section-topic-${topicIndex}`
              ? 'border-emerald-500 ring-4 ring-emerald-400/40'
              : 'border-slate-200/90'
          }`}
        >
          {/* Cabeçalho do Tópico */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-emerald-100">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-base font-black shrink-0 shadow-sm">
                {topic.roman}
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 block">
                  Tópico {topic.roman} • Lição {parsedMagazine.lessonNum}
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-sans text-slate-900 leading-snug">
                  {topic.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePlaySectionAudio(`section-topic-${topicIndex}`)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 size={13} />
                <span>Ouvir Tópico {topic.roman}</span>
              </button>

              {topic.topicRefs && (
                <button
                  type="button"
                  onClick={() => handleOpenInlineVerse(topic.topicRefs.split(';')[0].trim())}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>{topic.topicRefs}</span>
                </button>
              )}
            </div>
          </div>

          {/* Parágrafos Introdutórios do Tópico */}
          {topic.introParagraphs.length > 0 && (
            <div className="space-y-3.5 font-serif text-slate-800 text-sm sm:text-base leading-loose bg-slate-50/80 p-6 rounded-3xl border border-slate-200/70">
              {topic.introParagraphs.map((p, pIdx) => (
                <p key={pIdx}>{renderFormattedInline(p)}</p>
              ))}
            </div>
          )}

          {/* Versículos detectados na introdução do tópico */}
          {topic.detectedRefs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 mr-1">
                📖 Versículos citados no Tópico {topic.roman} (clique para abrir na janela):
              </span>
              {topic.detectedRefs.map((ref, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenInlineVerse(ref)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-black transition cursor-pointer shadow-2xs"
                >
                  {ref}
                </button>
              ))}
            </div>
          )}

          {/* SUBTÓPICOS ORGANIZADOS (1.1, 1.2, 1., 2., etc.) */}
          {topic.subtopics.length > 0 && (
            <div className="space-y-6">
              {topic.subtopics.map((sub, sIdx) => (
                <div
                  key={sIdx}
                  id={`ebd-section-subtopic-${topicIndex}-${sIdx}`}
                  className={`p-6 sm:p-7 rounded-3xl bg-slate-50/70 border space-y-4 transition-all ${
                    activeAudioSectionId === `section-subtopic-${topicIndex}-${sIdx}`
                      ? 'border-indigo-500 ring-4 ring-indigo-400/40 bg-indigo-50/40'
                      : 'border-slate-200/90 hover:border-emerald-300/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black">
                        {sub.code}
                      </span>
                      <span>{sub.title}</span>
                    </h4>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handlePlaySectionAudio(`section-subtopic-${topicIndex}-${sIdx}`)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Volume2 size={12} />
                        <span>Ouvir</span>
                      </button>

                      {sub.baseRef && (
                        <button
                          type="button"
                          onClick={() => handleOpenInlineVerse(sub.baseRef.split(';')[0].trim())}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-black flex items-center gap-1 cursor-pointer transition"
                        >
                          <Scroll size={12} /> {sub.baseRef}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Parágrafos completos do Subtópico */}
                  <div className="space-y-3.5 font-serif text-slate-800 text-sm sm:text-base leading-loose">
                    {sub.paragraphs.map((sp, spIdx) => (
                      <p key={spIdx}>{renderFormattedInline(sp)}</p>
                    ))}
                  </div>

                  {/* Citação Direta de Versículos do Subtópico */}
                  {sub.scriptureQuote.length > 0 && (
                    <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-1.5 font-serif text-xs sm:text-sm text-amber-950">
                      {sub.scriptureQuote.map((qLine, qIdx) => (
                        <p key={qIdx} className={qIdx === 0 ? 'font-bold not-italic' : 'italic'}>
                          {renderFormattedInline(qLine)}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Aplicação Pedagógica na Classe */}
                  {sub.classApplication && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
                        <strong className="font-black uppercase text-[10px] tracking-wider text-emerald-800 block mb-0.5">
                          Aplicação Prática na Classe ({turma || 'EBD'}):
                        </strong>
                        {renderFormattedInline(sub.classApplication)}
                      </p>
                    </div>
                  )}

                  {/* Barra rápida de versículos detectados neste subtópico */}
                  {sub.detectedRefs.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">
                        Abrir versículo na janela:
                      </span>
                      {sub.detectedRefs.map((ref, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleOpenInlineVerse(ref)}
                          className="px-2.5 py-0.5 rounded-lg bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <BookOpen size={10} />
                          <span>{ref}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* QUADROS DE SUBSÍDIOS, AUXÍLIO AO PROFESSOR, VOCABULÁRIO E DESTAQUES DO TÓPICO */}
          {topic.specialBlocks.length > 0 && (
            <div className="space-y-5 pt-2">
              {topic.specialBlocks.map((spBlock, spIdx) =>
                renderSpecialBlockCard(spBlock, topicIndex, spIdx)
              )}
            </div>
          )}

          {/* Sustentação Bíblica em bloco */}
          {topic.topicVersesARC.length > 0 && (
            <div className="bg-[#FAF5ED] border border-[#E3DAC9] p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5A2B] flex items-center gap-1.5">
                <Scroll size={13} /> Sustentação Bíblica do Tópico {topic.roman} ({topic.topicRefs} - ARC)
              </span>
              <div className="font-serif text-xs sm:text-sm text-[#4A3C31] space-y-1.5 leading-relaxed">
                {topic.topicVersesARC.map((vLine, vIdx) => (
                  <p key={vIdx}>{renderFormattedInline(vLine)}</p>
                ))}
              </div>
            </div>
          )}

          {/* Síntese Teológica do Tópico (caso não tenha sido exibida como bloco sinopse) */}
          {topic.synthesis && !topic.specialBlocks.some(b => b.category === 'sinopse') && (
            <div
              id={`ebd-section-synthesis-${topicIndex}`}
              className="bg-slate-900 text-white p-5 rounded-2xl flex items-start gap-3"
            >
              <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                <strong className="text-emerald-300 font-black uppercase tracking-wider text-[10px] block mb-0.5">
                  Síntese Teológica do Tópico {topic.roman}:
                </strong>
                {renderFormattedInline(topic.synthesis)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGeneralSubsidiosPage = (pageNum: number, totalPages: number) => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-600 shadow-2xs">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <Layers size={14} className="text-amber-700" />
          <span>Subsídios Gerais & Auxílio Pedagógico ao Professor</span>
        </div>
        <div className="font-mono font-black text-emerald-700">
          PÁGINA {pageNum} DE {totalPages} • SUBSÍDIOS & APOIO DIDÁTICO
        </div>
      </div>

      <div className="space-y-6">
        {parsedMagazine.generalSpecialBlocks.map(block => renderSpecialBlockCard(block))}
      </div>
    </div>
  );

  const renderConclusionAndReviewPage = (pageNum: number, totalPages: number) => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-600 shadow-2xs">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <Award size={14} className="text-emerald-600" />
          <span>Lição {parsedMagazine.lessonNum} • Aplicação, Conclusão & Revisão</span>
        </div>
        <div className="font-mono font-black text-emerald-700">
          PÁGINA {pageNum} DE {totalPages} • ENCERRAMENTO DA REVISTA
        </div>
      </div>

      {/* APLICAÇÃO PRÁTICA */}
      {parsedMagazine.application.length > 0 && (
        <div
          id="ebd-section-application"
          className={`bg-white p-7 md:p-10 rounded-[2.5rem] border shadow-xs space-y-5 transition-all ${
            activeAudioSectionId === 'section-application'
              ? 'border-emerald-500 ring-4 ring-emerald-400/40'
              : 'border-emerald-200/80'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              <span>Aplicação Prática para a Vida Cristã, Família e Igreja</span>
            </span>
            <button
              type="button"
              onClick={() => handlePlaySectionAudio('section-application')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 size={13} />
              <span>Ouvir Aplicação</span>
            </button>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900">
            Vivenciando a Lição {parsedMagazine.lessonNum} durante a Semana
          </h3>
          <div className="space-y-3">
            {parsedMagazine.application.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-slate-800 text-sm sm:text-base leading-relaxed font-serif">
                {renderFormattedInline(item)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONCLUSÃO PASTORAL */}
      <div
        id="ebd-section-conclusion"
        className={`bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 md:p-11 rounded-[2.5rem] shadow-xl border relative transition-all ${
          activeAudioSectionId === 'section-conclusion'
            ? 'border-emerald-300 ring-4 ring-emerald-400/50'
            : 'border-emerald-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
            Conclusão & Síntese Pastoral da Lição {parsedMagazine.lessonNum}
          </span>
          <button
            type="button"
            onClick={() => handlePlaySectionAudio('section-conclusion')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 size={13} />
            <span>Ouvir Conclusão</span>
          </button>
        </div>
        <div className="prose prose-invert max-w-none space-y-4">
          {parsedMagazine.conclusion.split('\n\n').map((cPara, cIdx) => (
            <p key={cIdx} className="font-serif italic text-emerald-100 text-sm sm:text-base md:text-lg leading-loose">
              {renderFormattedInline(cPara)}
            </p>
          ))}
        </div>
      </div>

      {/* QUESTIONÁRIO / HORA DA REVISÃO */}
      {parsedMagazine.quiz.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-indigo-200/80 p-7 md:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1.5 mb-1">
              <HelpCircle size={14} /> Hora da Revisão & Fixação Pedagógica
            </span>
            <h4 className="text-lg sm:text-xl font-black text-slate-900">
              Questionário da Lição {parsedMagazine.lessonNum}
            </h4>
          </div>

          <div className="space-y-4">
            {parsedMagazine.quiz.map((qItem, qIdx) => {
              const isRevealed = revealedQuizAnswers[qIdx] !== false;
              return (
                <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                      {renderFormattedInline(qItem.question)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRevealedQuizAnswers(prev => ({ ...prev, [qIdx]: !isRevealed }))}
                      className="px-3 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer transition"
                    >
                      {isRevealed ? 'Ocultar Resposta' : 'Ver Resposta'}
                    </button>
                  </div>
                  {isRevealed && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-xs sm:text-sm text-indigo-950 font-serif leading-relaxed">
                      <strong className="font-black uppercase text-[10px] tracking-wider text-indigo-700 block mb-1">
                        Resposta / Gabarito Comentado:
                      </strong>
                      {renderFormattedInline(qItem.answer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIÁRIO DE ANOTAÇÕES DO PROFESSOR / ALUNO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-7 md:p-10 shadow-xs space-y-4">
        <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
          <BookOpenText size={20} className="text-emerald-600" /> Diário de Estudo & Apontamentos da Aula
        </h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Registre abaixo suas anotações, ilustrações extras ou dúvidas sobre a Lição {parsedMagazine.lessonNum} para ministrar em classe.
        </p>

        <textarea
          value={customNotes}
          onChange={(e) => {
            setCustomNotes(e.target.value);
            localStorage.setItem(`gipp_notes_ebd_${licaoNum}_${revista}`, e.target.value);
          }}
          placeholder="Escreva aqui seus apontamentos sobre os tópicos e subsídios da lição..."
          rows={4}
          className="w-full rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 p-4 font-sans text-sm outline-hidden transition-all bg-slate-50/50"
        />
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>Salvo automaticamente neste dispositivo</span>
          <span>{customNotes.trim().split(/\s+/).filter(Boolean).length} palavras</span>
        </div>
      </div>
    </div>
  );

  const renderPageByMetadata = (pg: typeof magazinePages[number]) => {
    if (pg.type === 'cover') {
      return renderCoverPage(pg.pageNumber, magazinePages.length);
    }
    if (pg.type === 'intro_bible') {
      return renderIntroAndBiblePage(pg.pageNumber, magazinePages.length);
    }
    if (pg.type === 'topic' && pg.topicIndex !== undefined) {
      const topicObj = parsedMagazine.topics[pg.topicIndex];
      if (topicObj) {
        return renderTopicPage(topicObj, pg.topicIndex, pg.pageNumber, magazinePages.length);
      }
    }
    if (pg.type === 'general_subsidios') {
      return renderGeneralSubsidiosPage(pg.pageNumber, magazinePages.length);
    }
    return renderConclusionAndReviewPage(pg.pageNumber, magazinePages.length);
  };

  const activePageMeta = magazinePages[currentPageIndex] || magazinePages[0];

  return (
    <div className="flex flex-col h-full bg-slate-100/80 relative">
      {/* Barra Editorial Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200/60">
            <BookOpen size={18} />
          </span>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-800">
              Revista Interativa EBD • {editora || 'CPAD'} {trimestre ? `• ${trimestre}` : ''}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Paginação real com 100% do conteúdo: capa, tópicos, subtópicos, subsídios, auxílio ao professor e janela de versículos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onEditLesson && (
            <button
              type="button"
              onClick={onEditLesson}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
            >
              <Edit3 size={13} /> Editar Dados
            </button>
          )}

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer border border-indigo-200"
            >
              <RefreshCw size={13} /> Atualizar Lição
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowAudioPlayer(prev => !prev);
              if (!showAudioPlayer && !audioNarration.isPlaying) {
                audioNarration.play(0);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
              audioNarration.isPlaying
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400 border-transparent'
                : showAudioPlayer
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            <Headphones size={13} className={audioNarration.isPlaying ? 'animate-bounce text-white' : 'text-emerald-700'} />
            <span>{audioNarration.isPlaying ? 'Ouvindo Revista...' : 'Ouvir em Áudio'}</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('magazine')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'magazine'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'magazine' ? 'text-amber-300' : 'text-emerald-600'} />
              <span>Revista Paginada ✨</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom_input')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'custom_input'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                  : 'text-indigo-900/80 hover:text-indigo-950 hover:bg-white/60'
              }`}
            >
              <FileEdit size={14} className={activeTab === 'custom_input' ? 'text-white' : 'text-indigo-600'} />
              <span>Inserir Conteúdo / Tema</span>
              {appliedCustomContent.trim() && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white inline-block ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('online_source');
                if (onlineArticles.length === 0) {
                  handleSearchEscolaBiblicaOrg();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'online_source'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-50/80'
              }`}
              title="Abrir ou buscar revistas, capas e subsídios em https://escolabiblicadominical.org"
            >
              <Globe size={14} className={activeTab === 'online_source' ? 'text-white' : 'text-amber-600'} />
              <span>Fonte: escolabiblicadominical.org</span>
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DO REPRODUTOR DE ÁUDIO DA REVISTA */}
      {showAudioPlayer && (
        <div className="bg-slate-900 border-b border-emerald-500/30 text-white px-4 md:px-8 py-3 shrink-0 z-30 shadow-lg animate-fadeIn font-sans">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shrink-0 shadow-md">
                <Headphones size={20} className={audioNarration.isPlaying ? 'animate-pulse' : ''} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans font-black text-emerald-300 text-xs sm:text-sm truncate">
                    {audioNarration.currentSegment?.label || parsedMagazine.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300/80">
                    • Bloco {audioNarration.currentIndex + 1} de {ebdAudioSegments.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-md mt-0.5">
                  {audioNarration.currentSegment
                    ? audioNarration.currentSegment.text.slice(0, 110) + '...'
                    : 'Selecione Play para ouvir toda a revista'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={audioNarration.prev}
                disabled={audioNarration.currentIndex === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition cursor-pointer"
              >
                <SkipBack size={15} />
              </button>

              {audioNarration.isPlaying ? (
                <button
                  type="button"
                  onClick={audioNarration.pause}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Pause size={15} className="fill-current" />
                  <span>Pausar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => audioNarration.play()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Play size={15} className="fill-current" />
                  <span>{audioNarration.isPaused ? 'Continuar' : 'Ouvir'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={audioNarration.stop}
                disabled={!audioNarration.isPlaying && !audioNarration.isPaused}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 disabled:opacity-40 text-slate-300 hover:text-rose-300 transition cursor-pointer"
              >
                <Square size={14} className="fill-current" />
              </button>

              <button
                type="button"
                onClick={audioNarration.next}
                disabled={audioNarration.currentIndex >= ebdAudioSegments.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition cursor-pointer"
              >
                <SkipForward size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  audioNarration.stop();
                  setShowAudioPlayer(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer ml-1"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO E MUDANÇA DE PÁGINAS DA REVISTA */}
      {activeTab === 'magazine' && (
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 shrink-0 z-20 shadow-2xs">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Botões Anterior / Próxima Página */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setReadingFormat('paginated');
                  setCurrentPageIndex(prev => Math.max(0, prev - 1));
                }}
                disabled={readingFormat === 'paginated' && currentPageIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-black flex items-center gap-1 transition cursor-pointer border border-slate-200"
              >
                <ChevronLeft size={15} />
                <span>Pág. Anterior</span>
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 font-mono text-xs font-black">
                {readingFormat === 'paginated'
                  ? `Pág. ${currentPageIndex + 1} / ${magazinePages.length}`
                  : `Todas as ${magazinePages.length} Páginas`}
              </span>

              <button
                type="button"
                onClick={() => {
                  setReadingFormat('paginated');
                  setCurrentPageIndex(prev => Math.min(magazinePages.length - 1, prev + 1));
                }}
                disabled={readingFormat === 'paginated' && currentPageIndex >= magazinePages.length - 1}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <span>Próxima Pág.</span>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Seletor Rápido de Páginas */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
              {magazinePages.map((pg, idx) => (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => {
                    setReadingFormat('paginated');
                    setCurrentPageIndex(idx);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    readingFormat === 'paginated' && currentPageIndex === idx
                      ? 'bg-emerald-600 text-white font-black shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pg.shortLabel}
                </button>
              ))}
            </div>

            {/* Alternador Folhear Páginas vs Visão Contínua */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setReadingFormat('paginated')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  readingFormat === 'paginated'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Folhear Páginas
              </button>
              <button
                type="button"
                onClick={() => setReadingFormat('continuous')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  readingFormat === 'continuous'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão Contínua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PEQUENA JANELA FLUTUANTE DE VERSÍCULO DENTRO DA PRÓPRIA REVISTA */}
      {inlineVersePopup && (
        <div className="fixed bottom-5 right-5 z-40 w-[92vw] max-w-md bg-white border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 px-5 py-3.5 text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <BookOpen size={16} />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                  Leitura do Versículo na Revista • ARC
                </span>
                <h5 className="font-black text-sm sm:text-base text-white truncate">
                  {inlineVersePopup.canonicalRef}
                </h5>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleInlineVerseAudio}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  inlineVerseAudioPlaying
                    ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Ouvir versículo"
              >
                {inlineVerseAudioPlaying ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={handleCopyInlineVerse}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Copiar versículo"
              >
                {inlineVerseCopied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setInlineVerseAudioPlaying(false);
                  setInlineVersePopup(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
                title="Fechar pequena janela"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="p-5 max-h-72 overflow-y-auto space-y-3.5 bg-[#FFFDF9]">
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 font-serif text-xs sm:text-sm text-amber-950 whitespace-pre-wrap leading-relaxed">
              {inlineVersePopup.versesText}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <strong className="font-black text-[10px] uppercase tracking-wider text-emerald-800 block mb-0.5">
                Síntese Exegética ({inlineVersePopup.cgadbChapter}):
              </strong>
              {inlineVersePopup.explanation}
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const refToOpen = inlineVersePopup.referenceQuery;
                setInlineVersePopup(null);
                setSelectedBibleRef(refToOpen);
              }}
              className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Abrir Estudo Completo / Telão</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setInlineVerseAudioPlaying(false);
                setInlineVersePopup(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Notificação */}
      {customNotification && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle size={15} />
          <span>{customNotification}</span>
        </div>
      )}

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'custom_input' ? (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-10 space-y-6">
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl border border-indigo-700/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <FileEdit size={15} /> Gerador Editorial de Revista Interativa (100% do Conteúdo)
                </span>
                {appliedCustomContent.trim() && (
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Conteúdo Próprio Ativo na Revista
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-['Outfit'] text-white">
                  Cole o Conteúdo Completo da Aula para Gerar a Revista Paginada
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  O sistema realiza a leitura integral de <strong>100% do material adicionado</strong> e identifica automaticamente: <strong>Capa, Título, Tema, Texto Áureo, Verdade Prática, Objetivos, Leitura Bíblica, Introdução, Tópicos (I, II, III...), Subtópicos (1.1, 1.2, 1., 2.), Subsídios Teológicos, Auxílio ao Professor, Vocabulário, Sinopses, Conclusão e Questionário</strong>, além de tornar todos os versículos clicáveis em uma pequena janela dentro da revista.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-800">
                    Conteúdo Completo da Lição (Tópicos, Subtópicos, Subsídios, Auxílio ao Professor)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('online_source');
                      if (onlineArticles.length === 0) {
                        handleSearchEscolaBiblicaOrg();
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black transition cursor-pointer border border-amber-300 flex items-center gap-1.5"
                  >
                    <Globe size={13} className="text-amber-700" />
                    <span>Buscar em escolabiblicadominical.org</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomContentInput(lessonText || completeLessonMarkdown);
                      setCustomNotification('Conteúdo atual carregado no editor para edição.');
                      setTimeout(() => setCustomNotification(null), 3000);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Carregar Texto da Lição
                  </button>

                  {appliedCustomContent.trim() && (
                    <button
                      type="button"
                      onClick={handleResetToOriginal}
                      className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200"
                    >
                      Restaurar Original
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={customContentInput}
                onChange={(e) => setCustomContentInput(e.target.value)}
                placeholder="Cole aqui 100% do conteúdo da sua lição!

Exemplo de estrutura que o sistema reconhece automaticamente:
Lição 05: O Deus Criador e Sustentador
Tema: A Soberania de Deus na Criação
Texto Áureo: No princípio criou Deus os céus e a terra. (Gn 1.1)
Verdade Prática: Deus é o Soberano Criador de todas as coisas.
Leitura Bíblica em Classe: Gênesis 1.1-5, 26, 27

Introdução
A doutrina da criação é o fundamento de toda a teologia bíblica (Hb 11.3)...

I - A OBRA CRIADORA DE DEUS
1. Criação a partir do nada. Deus chamou à existência o que não existia (Rm 4.17)...
2. O poder da Palavra. Pela Palavra do Senhor foram feitos os céus (Sl 33.6,9)...

Subsídio Teológico
A expressão hebraica 'bara' indica uma ação exclusiva de Deus...

Auxílio ao Professor
Inicie a aula perguntando aos alunos como a criação revela a glória divina (Sl 19.1)...

Sinopse I: Deus criou o universo pelo poder da Sua Palavra.

Conclusão
Louvemos ao Criador e Salvador Jesus Cristo (Cl 1.16,17).

Questionário
1. Qual o significado do verbo criar no texto bíblico?"
                rows={16}
                className="w-full rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 p-5 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed outline-hidden transition bg-slate-50/50 resize-y"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
                  <span>{customContentInput.trim().split(/\s+/).filter(Boolean).length} palavras</span>
                  <span>•</span>
                  <span>{customContentInput.length} caracteres</span>
                  {appliedCustomContent.trim() && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">100% Ativo na Revista</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('magazine')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Voltar à Revista
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyCustomContent}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Wand2 size={16} className="text-amber-300" />
                    <span>Analisar e Gerar Revista Paginada Completa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'online_source' ? (
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 md:py-8 space-y-6">
            {/* Banner do Portal https://escolabiblicadominical.org */}
            <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-emerald-950 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-amber-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <Globe size={20} />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                      Fonte Oficial de Dados, Capas e Subsídios Online
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      https://escolabiblicadominical.org
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-white/10 p-1 rounded-xl border border-white/15">
                    <button
                      type="button"
                      onClick={() => setOnlinePortalSubMode('search')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        onlinePortalSubMode === 'search'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <Search size={13} />
                      <span>Buscar Revistas, Capas & Subsídios</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlinePortalSubMode('site')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        onlinePortalSubMode === 'site'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <Globe size={13} />
                      <span>Abrir Site na Janela</span>
                    </button>
                  </div>

                  <a
                    href="https://escolabiblicadominical.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition"
                  >
                    <ExternalLink size={13} />
                    <span>Abrir escolabiblicadominical.org em Nova Guia</span>
                  </a>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Consulte o banco de dados online de <strong>escolabiblicadominical.org</strong> para buscar lições bíblicas, capas de revistas trimestrais, subsídios teológicos e auxílios ao professor, ou abra o site diretamente como fonte de dados para gerar a Revista Interativa Paginada.
              </p>

              {onlinePortalSubMode === 'search' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                  <div className="md:col-span-5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-200 block mb-1">
                      Pesquisar Revista / Lição / Tema em escolabiblicadominical.org
                    </label>
                    <input
                      type="text"
                      value={onlineSearchQuery}
                      onChange={(e) => setOnlineSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchEscolaBiblicaOrg()}
                      placeholder="Ex: Lição 1, Promessas de Deus, Atos, Família..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-200 block mb-1">
                      Ou Cole o Link Direto de uma Lição do Site (Opcional)
                    </label>
                    <input
                      type="url"
                      value={onlineSpecificUrl}
                      onChange={(e) => setOnlineSpecificUrl(e.target.value)}
                      placeholder="https://escolabiblicadominical.org/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div className="md:col-span-3 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleSearchEscolaBiblicaOrg()}
                      disabled={onlineSearching}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Search size={14} className={onlineSearching ? 'animate-spin' : ''} />
                      <span>{onlineSearching ? 'Consultando Site...' : 'Buscar no Site'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onlinePortalSubMode === 'site' ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-[680px]">
                <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <Globe size={14} className="text-emerald-400" />
                    <span>https://escolabiblicadominical.org</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom_input')}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-pointer"
                    >
                      Colar Conteúdo Copiado na Revista
                    </button>
                    <a
                      href="https://escolabiblicadominical.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Abrir Externo</span>
                    </a>
                  </div>
                </div>
                <iframe
                  src="https://escolabiblicadominical.org"
                  title="Portal Escola Bíblica Dominical - escolabiblicadominical.org"
                  className="w-full flex-1 border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-600" />
                    <span>Revistas, Capas e Subsídios Encontrados em escolabiblicadominical.org</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {onlineArticles.length} material(is) disponível(is)
                  </span>
                </div>

                {onlineSearching ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
                    <RefreshCw size={28} className="text-amber-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-600">
                      Consultando https://escolabiblicadominical.org para extrair capas, tópicos e subsídios...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onlineArticles.map((art, idx) => (
                      <div
                        key={art.id || idx}
                        className="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
                      >
                        <div className="flex gap-4 items-start">
                          <img
                            src={art.capa || finalCoverImage}
                            alt={art.titulo}
                            className="w-20 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] uppercase">
                              <Globe size={10} /> escolabiblicadominical.org
                            </span>
                            <h4 className="font-black text-sm text-slate-900 leading-snug">
                              {art.titulo}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {art.resumo}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                          <a
                            href={art.url || 'https://escolabiblicadominical.org'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            <span>Ver Fonte no Site</span>
                          </a>

                          <div className="flex items-center gap-2">
                            {art.capa && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomCoverUrl(art.capa);
                                  try {
                                    localStorage.setItem(`${storageKeyCustom}_cover`, art.capa);
                                  } catch {}
                                  setCustomNotification('Capa da revista atualizada a partir de escolabiblicadominical.org!');
                                  setTimeout(() => setCustomNotification(null), 3500);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer"
                              >
                                Usar Capa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleImportFromEscolaBiblicaArticle(art)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                              <Sparkles size={12} />
                              <span>Gerar Revista com este Conteúdo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 md:py-8 space-y-8">
            {/* Banner de status quando conteúdo próprio está ativo */}
            {appliedCustomContent.trim() && (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md text-white">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
                    <Sparkles size={16} className="text-amber-300" />
                  </span>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-emerald-200">
                      Revista Paginada Gerada com 100% do Conteúdo Adicionado ({magazinePages.length} Páginas)
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Clique em qualquer versículo destacado no texto para abri-lo na pequena janela dentro da revista.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom_input')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileEdit size={12} /> Editar Conteúdo
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Restaurar Original
                  </button>
                </div>
              </div>
            )}

            {/* RENDERIZAÇÃO DAS PÁGINAS DA REVISTA (MODO PAGINADO OU CONTÍNUO) */}
            {readingFormat === 'paginated' ? (
              <div className="space-y-8">
                {renderPageByMetadata(activePageMeta)}

                {/* RODAPÉ DE MUDANÇA DE PÁGINA (COMO UMA REVISTA REAL) */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPageIndex(prev => Math.max(0, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPageIndex === 0}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200"
                  >
                    <ChevronLeft size={16} />
                    <span>
                      {currentPageIndex > 0
                        ? `Voltar: ${magazinePages[currentPageIndex - 1].shortLabel}`
                        : 'Início da Revista (Capa)'}
                    </span>
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-700 block">
                      Página {currentPageIndex + 1} de {magazinePages.length}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {activePageMeta.fullTitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPageIndex(prev => Math.min(magazinePages.length - 1, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPageIndex >= magazinePages.length - 1}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <span>
                      {currentPageIndex < magazinePages.length - 1
                        ? `Avançar: ${magazinePages[currentPageIndex + 1].shortLabel}`
                        : 'Fim da Revista'}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {magazinePages.map(pg => (
                  <div key={pg.id} className="space-y-8 pb-8 border-b-2 border-dashed border-slate-300 last:border-b-0">
                    {renderPageByMetadata(pg)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Completo de Estudo Bíblico e Projeção no Telão */}
      <BibleReferenceModal
        isOpen={!!selectedBibleRef}
        referenceQuery={selectedBibleRef || ''}
        onClose={() => setSelectedBibleRef(null)}
      />
    </div>
  );
};
