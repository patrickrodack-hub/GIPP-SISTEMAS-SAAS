import React, { useState, useMemo, useCallback } from 'react';
import { 
  BookOpen, Sparkles, BookOpenText, Award, 
  Calendar, Check, Quote, Scroll, Image as ImageIcon,
  ShieldCheck, Users, Building2, RefreshCw, Edit3, HelpCircle, CheckCircle2
} from 'lucide-react';
import { BibleReferenceModal } from './BibleReferenceModal';
import {
  ensureCompleteEBDLessonMarkdown,
  resolveDogmaticChapter
} from '../data/ebdCatalogDatabase';
import { getFormattedBiblePassageARC } from '../data/bibliaOfflineData';

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

interface ParsedSubtopic {
  code: string;
  title: string;
  baseRef: string;
  paragraphs: string[];
  scriptureQuote: string[];
  classApplication: string;
}

interface ParsedTopic {
  roman: string;
  title: string;
  introParagraphs: string[];
  topicRefs: string;
  topicVersesARC: string[];
  subtopics: ParsedSubtopic[];
  synthesis: string;
}

interface ParsedQuizItem {
  question: string;
  answer: string;
}

// Curated high-quality, lightweight public domain biblical and spiritual images
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
  const [activeTab, setActiveTab] = useState<'reading' | 'magazine'>('magazine');
  const [customNotes, setCustomNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(`gipp_notes_ebd_${licaoNum}_${revista}`) || '';
    } catch {
      return '';
    }
  });
  const [selectedBibleRef, setSelectedBibleRef] = useState<string | null>(null);
  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState<Record<number, boolean>>({});

  // Normalizar número e título da lição para evitar duplicações como "Lição LIÇÃO 05"
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

  // Garante que o texto da lição esteja sempre completo, profundo e 100% fiel aos dados informados
  const completeLessonMarkdown = useMemo(() => {
    return ensureCompleteEBDLessonMarkdown(lessonText, {
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
    lessonText,
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

  // Parser estruturado de alta precisão para todos os blocos da revista
  const parsedMagazine = useMemo(() => {
    const dogmatic = resolveDogmaticChapter(`${revista} ${subtitulo} ${cleanTituloLicao} ${leituraBiblica}`);
    const lines = completeLessonMarkdown.split('\n');

    let headerTitle = cleanTituloLicao
      ? `Lição ${cleanLicaoNum}: ${cleanTituloLicao}`
      : `Lição ${cleanLicaoNum} — ${revista}`;
    let goldenText = textoAureo.trim() || '';
    let practicalTruth = verdadePratica.trim() || '';
    let bibleReadingLines: string[] = [];
    let introParagraphs: string[] = [];
    let doctrinalParagraphs: string[] = [];
    const topics: ParsedTopic[] = [];
    let applicationItems: string[] = [];
    let conclusionParagraphs: string[] = [];
    const quizItems: ParsedQuizItem[] = [];

    type SectionType =
      | 'header'
      | 'golden'
      | 'truth'
      | 'bible'
      | 'intro'
      | 'doctrinal'
      | 'topics'
      | 'application'
      | 'conclusion'
      | 'quiz';

    let currentSection: SectionType = 'header';
    let currentTopic: ParsedTopic | null = null;
    let currentSubtopic: ParsedSubtopic | null = null;
    let inTopicVersesBlock = false;
    let currentQuizQuestion = '';
    let currentQuizAnswer = '';

    const flushSubtopic = () => {
      if (currentTopic && currentSubtopic) {
        currentTopic.subtopics.push(currentSubtopic);
        currentSubtopic = null;
      }
    };

    const flushTopic = () => {
      flushSubtopic();
      if (currentTopic) {
        topics.push(currentTopic);
        currentTopic = null;
      }
      inTopicVersesBlock = false;
    };

    const flushQuiz = () => {
      if (currentQuizQuestion.trim()) {
        quizItems.push({
          question: currentQuizQuestion.trim(),
          answer: currentQuizAnswer.trim() || 'Resposta fundamentada na exposição bíblica da lição e na Declaração de Fé da CGADB/CPAD.'
        });
        currentQuizQuestion = '';
        currentQuizAnswer = '';
      }
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed === '---' || trimmed.startsWith('URL_CAPA=')) continue;

      const lower = trimmed.toLowerCase();

      // 1. Cabeçalhos principais (# ...)
      if (/^#\s+/.test(trimmed) && !/^##/.test(trimmed)) {
        const h1Text = trimmed.replace(/^#\s+/, '').trim();
        const h1Lower = h1Text.toLowerCase();

        if (h1Lower.includes('introdução') || h1Lower.includes('introducao')) {
          currentSection = 'intro';
          continue;
        }
        if (h1Lower.includes('fundamentação doutrinária') || h1Lower.includes('fundamentacao doutrinaria')) {
          currentSection = 'doctrinal';
          continue;
        }
        if (h1Lower.includes('referências bíblicas') || h1Lower.includes('exegese dos tópicos') || h1Lower.includes('tópicos')) {
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
        if (h1Lower.includes('validação') || h1Lower.includes('validacao') || h1Lower.includes('perguntas de fixação')) {
          flushTopic();
          currentSection = 'quiz';
          continue;
        }
        if (currentSection === 'header') {
          headerTitle = h1Text.replace(/^1\.\s*/, '').trim();
          continue;
        }
      }

      // 2. Marcadores explícitos de sub-blocos da Introdução (apenas quando iniciam a linha)
      if (/^(?:\*\*|#+\s*)texto\s+[áa]ureo\s*:?\*?\*?/i.test(trimmed)) {
        currentSection = 'golden';
        const inlineVal = trimmed.replace(/^(?:\*\*|#+\s*)texto\s+[áa]ureo\s*:?\*?\*?/i, '').trim();
        if (inlineVal) goldenText = inlineVal.replace(/^["“]|["”]$/g, '').trim();
        continue;
      }

      if (/^(?:\*\*|#+\s*)verdade\s+pr[áa]tica\s*:?\*?\*?/i.test(trimmed)) {
        currentSection = 'truth';
        const inlineVal = trimmed.replace(/^(?:\*\*|#+\s*)verdade\s+pr[áa]tica\s*:?\*?\*?/i, '').trim();
        if (inlineVal) practicalTruth = inlineVal;
        continue;
      }

      if (/^(?:\*\*|#+\s*)leitura\s+b[íi]blica(?:\s+em\s+classe)?\s*:?\*?\*?/i.test(trimmed)) {
        currentSection = 'bible';
        const inlineVal = trimmed.replace(/^(?:\*\*|#+\s*)leitura\s+b[íi]blica(?:\s+em\s+classe)?\s*:?\*?\*?/i, '').trim();
        if (inlineVal) bibleReadingLines.push(inlineVal);
        continue;
      }

      if (/^(?:\*\*|#+\s*)contextualiza[cç][aã]o/i.test(trimmed)) {
        currentSection = 'intro';
        continue;
      }

      // 3. Tópicos Principais (## I — ..., ## II — ..., ## III — ...)
      if (/^##\s+/.test(trimmed) && !/^###/.test(trimmed)) {
        const h2Text = trimmed.replace(/^##\s+/, '').trim();
        // Verificar se não é uma seção administrativa
        if (/^(?:[IVX]+|\d+)\s*[-–—.:]/i.test(h2Text) || currentSection === 'topics' || currentSection === 'doctrinal' || currentSection === 'intro') {
          flushTopic();
          currentSection = 'topics';
          const romanMatch = h2Text.match(/^([IVX]+|\d+)\s*[-–—.:]\s*(.*)$/i);
          currentTopic = {
            roman: romanMatch ? romanMatch[1].toUpperCase() : String(topics.length + 1),
            title: romanMatch ? romanMatch[2].trim() : h2Text,
            introParagraphs: [],
            topicRefs: '',
            topicVersesARC: [],
            subtopics: [],
            synthesis: ''
          };
          continue;
        }
      }

      // 4. Subtópicos (### 1.1 ..., ### 1.2 ...)
      if (/^###\s+/.test(trimmed)) {
        const h3Text = trimmed.replace(/^###\s+/, '').trim();
        if (!currentTopic) {
          currentSection = 'topics';
          currentTopic = {
            roman: String(topics.length + 1),
            title: `Desenvolvimento Bíblico e Exegético`,
            introParagraphs: [],
            topicRefs: leituraBiblica || dogmatic.leituraPadrao,
            topicVersesARC: [],
            subtopics: [],
            synthesis: ''
          };
        }
        flushSubtopic();
        inTopicVersesBlock = false;
        const subMatch = h3Text.match(/^(\d+(?:\.\d+)?)\s*[.-–—:]?\s*(.*)$/);
        currentSubtopic = {
          code: subMatch ? subMatch[1] : `${currentTopic.roman}.${currentTopic.subtopics.length + 1}`,
          title: subMatch && subMatch[2] ? subMatch[2].trim() : h3Text,
          baseRef: '',
          paragraphs: [],
          scriptureQuote: [],
          classApplication: ''
        };
        continue;
      }

      // 5. Acúmulo de conteúdo conforme a seção ativa
      if (currentSection === 'golden') {
        if (!goldenText) {
          goldenText = trimmed.replace(/^["“]|["”]$/g, '').trim();
        }
        continue;
      }

      if (currentSection === 'truth') {
        if (!practicalTruth) {
          practicalTruth = trimmed;
        } else {
          practicalTruth += ' ' + trimmed;
        }
        continue;
      }

      if (currentSection === 'bible') {
        bibleReadingLines.push(trimmed);
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
        if (/^(?:\*\*)?Quest[aã]o\s*\d+/i.test(trimmed) || /^(?:\*\*)?Pergunta\s*\d+/i.test(trimmed)) {
          flushQuiz();
          currentQuizQuestion = trimmed.replace(/\*\*/g, '').trim();
        } else if (/^\*?Gabarito/i.test(trimmed) || /^\*?Resposta/i.test(trimmed)) {
          currentQuizAnswer = trimmed.replace(/^\*?(?:Gabarito Teol[óo]gico Comentado|Gabarito|Resposta)\s*:?\*?\s*/i, '').trim();
        } else if (currentQuizAnswer) {
          currentQuizAnswer += ' ' + trimmed;
        } else if (currentQuizQuestion) {
          currentQuizQuestion += ' ' + trimmed;
        }
        continue;
      }
    }

    flushTopic();
    flushQuiz();

    // Garantir Leitura Bíblica completa com versículos reais da ARC
    let finalBibleReading = bibleReadingLines.join('\n').trim();
    if (!finalBibleReading || finalBibleReading.length < 35) {
      const refToUse = leituraBiblica.trim() || dogmatic.leituraPadrao;
      const arcText = getFormattedBiblePassageARC(refToUse, 15);
      finalBibleReading = `Referência Base: ${refToUse} (Almeida Revista e Corrigida - ARC)\n${arcText}`;
    }

    return {
      title: headerTitle,
      dogmaticCap: dogmatic.capitulo,
      dogmaticTitle: dogmatic.titulo,
      goldenText: goldenText || dogmatic.textoAureoPadrao,
      practicalTruth: practicalTruth || dogmatic.verdadePraticaPadrao,
      bibleReading: finalBibleReading,
      bibleRefHeader: leituraBiblica.trim() || dogmatic.leituraPadrao,
      intro: introParagraphs.join('\n\n') || `Estudo exegético aprofundado da Lição ${cleanLicaoNum} (${cleanTituloLicao || revista}).`,
      doctrinal: doctrinalParagraphs.length > 0 ? doctrinalParagraphs : [dogmatic.fundamentacao, `Termos Originais: ${dogmatic.termosOriginais}`],
      topics,
      application: applicationItems,
      conclusion: conclusionParagraphs.join('\n\n') || `Que a Palavra de Deus estudada nesta Lição ${cleanLicaoNum} produza frutos permanentes para a glória de Cristo.`,
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

  const finalCoverImage = useMemo(() => {
    if (capaUrl && capaUrl !== 'null' && !capaUrl.includes('URL_CAPA')) return capaUrl;
    return DEFAULT_COVERS[(parseInt(cleanLicaoNum, 10) || 1) % DEFAULT_COVERS.length];
  }, [capaUrl, cleanLicaoNum]);

  // Renderizador rico de markdown inline (**negrito** e *itálico*)
  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-emerald-900 font-semibold">{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
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
          Estruturando Revista de Estudo Bíblico e Exegese Completa
        </h4>
        <p className="text-xs font-semibold text-slate-500 max-w-md leading-relaxed mx-auto">
          Sincronizando dados da revista "{revista}", versículos da Bíblia ARC, tópicos comentados e fundamentação doutrinária CGADB/CPAD...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Barra Editorial Superior: Modo de Leitura + Ações de Atualização e Edição */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200/60">
            <BookOpen size={18} />
          </span>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-800">
              Revista de Estudo EBD • {editora || 'CPAD'} {trimestre ? `• ${trimestre}` : ''}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Conteúdo exegético integral gerado com base nos dados cadastrados da revista e da lição
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onEditLesson && (
            <button
              type="button"
              onClick={onEditLesson}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
              title="Editar informações da Revista, Lição, Turma ou Capa"
            >
              <Edit3 size={13} /> Editar Dados da Lição
            </button>
          )}

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer border border-indigo-200"
              title="Regerar estudo aprofundado sincronizando todos os dados informados da lição"
            >
              <RefreshCw size={13} /> Atualizar Conteúdo da Lição
            </button>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reading'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpenText size={14} />
              Texto Corrido
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('magazine')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'magazine'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} />
              Revista Ilustrada ✨
            </button>
          </div>
        </div>
      </div>

      {/* Área Principal de Leitura */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'reading' ? (
          <div className="max-w-4xl mx-auto px-6 py-10 md:px-12 bg-white my-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed font-serif text-sm sm:text-base">
              {completeLessonMarkdown}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-10 space-y-10">
            
            {/* 1. CAPA E FICHA EDITORIAL COMPLETA DA REVISTA E LIÇÃO */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white shadow-2xl border border-white/10">
              <div className="absolute inset-0 opacity-35 mix-blend-overlay">
                <img 
                  src={finalCoverImage} 
                  alt="Background Cover" 
                  className="w-full h-full object-cover blur-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent"></div>

              <div className="relative z-10 px-6 py-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
                {/* Capa da Revista / Lição */}
                <div className="w-44 sm:w-52 shrink-0 aspect-[2/3] bg-white rounded-2xl rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl overflow-hidden border-4 border-white/90 ring-1 ring-emerald-500/50">
                  <img src={finalCoverImage} alt={revista} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Metadados Editoriais Completos */}
                <div className="flex-1 text-center md:text-left space-y-3.5">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-400/30">
                      <Building2 size={12} /> Editora {editora || 'CPAD'}
                    </span>
                    {trimestre && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/25 text-indigo-200 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-400/30">
                        <Calendar size={12} /> {trimestre}
                      </span>
                    )}
                    {turma && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-200 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-400/30">
                        <Users size={12} /> Turma: {turma}
                      </span>
                    )}
                    {dataLicao && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/15">
                        <Calendar size={12} /> Aula: {dataLicao.split('-').reverse().join('/')}
                      </span>
                    )}
                  </div>

                  {/* Título e Subtítulo da Revista */}
                  <div className="space-y-1">
                    <p className="text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest">
                      Revista: {revista}
                    </p>
                    {subtitulo && (
                      <p className="text-slate-300 text-xs font-semibold italic">
                        {subtitulo}
                      </p>
                    )}
                  </div>

                  {/* Número e Título da Lição */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Outfit'] leading-tight text-white tracking-tight drop-shadow-md">
                    {parsedMagazine.title}
                  </h1>

                  <div className="h-1 w-20 bg-emerald-400 rounded-full mx-auto md:mx-0"></div>

                  <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                    {autor ? `Comentarista / Autor: ${autor} • ` : ''}
                    Material de estudo bíblico, exegético e doutrinário alinhado a <strong className="text-emerald-300">{parsedMagazine.dogmaticCap}</strong>.
                  </p>

                  <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1 text-[11px] text-white/85 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <BookOpenText size={14} className="text-emerald-400" /> Lição Nº {cleanLicaoNum}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <Scroll size={14} className="text-amber-400" /> Base Bíblica: {parsedMagazine.bibleRefHeader}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <ShieldCheck size={14} className="text-sky-400" /> {parsedMagazine.topics.length} Tópicos Exegéticos Completos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TEXTO ÁUREO & VERDADE PRÁTICA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Texto Áureo */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-7 sm:p-8 rounded-[2rem] border border-amber-200/70 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-amber-200/40 select-none">
                  <Quote size={72} className="stroke-[1.5]" />
                </div>
                <div className="relative z-10 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300/50">
                      <Sparkles size={12} className="text-amber-600" /> Texto Áureo da Lição {cleanLicaoNum}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBibleRef(parsedMagazine.goldenText)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen size={12} /> Explicar Versículo
                    </button>
                  </div>
                  <blockquote className="font-serif italic text-base sm:text-lg text-amber-950 leading-relaxed font-semibold">
                    “{parsedMagazine.goldenText}”
                  </blockquote>
                </div>
              </div>

              {/* Verdade Prática */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-7 sm:p-8 rounded-[2rem] border border-emerald-200/60 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-emerald-200/35 select-none">
                  <Award size={76} className="stroke-[1.3]" />
                </div>
                <div className="relative z-10 space-y-3.5">
                  <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-300/50">
                    <Award size={12} className="text-emerald-600" /> Verdade Prática
                  </span>
                  <p className="font-sans text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
                    {parsedMagazine.practicalTruth}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. LEITURA BÍBLICA EM CLASSE (TEXTO BÍBLICO ARC INTEGRAL) */}
            <div className="bg-[#FAF5ED] rounded-[2.5rem] border border-[#E3DAC9] p-7 md:p-10 shadow-inner relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E3DAC9]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5A2B] text-[#FCF9F2] text-xs font-black uppercase tracking-wider rounded-full shadow-xs">
                  <Scroll size={14} /> Leitura Bíblica em Classe • {parsedMagazine.bibleRefHeader}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBibleRef(parsedMagazine.bibleRefHeader)}
                  className="px-3 py-1.5 rounded-xl bg-[#8B5A2B]/15 hover:bg-[#8B5A2B]/25 text-[#6E451F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen size={14} /> Ver Comentário Exegético da Passagem
                </button>
              </div>

              <div className="prose prose-stone max-w-none text-[#3D3026] text-xs sm:text-sm md:text-base whitespace-pre-wrap leading-loose font-serif font-medium bg-white/80 p-5 md:p-7 rounded-2xl border border-[#EBE3D3] shadow-2xs">
                {parsedMagazine.bibleReading}
              </div>
            </div>

            {/* 4. INTRODUÇÃO CONTEXTUAL, HISTÓRICA E TEOLÓGICA DA LIÇÃO */}
            <div className="space-y-4 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-emerald-200">
                  <BookOpen size={12} /> Introdução & Contextualização da Lição {cleanLicaoNum}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {revista} {trimestre ? `• ${trimestre}` : ''}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black font-sans text-slate-900">
                Visão Geral e Contexto Bíblico-Histórico
              </h3>
              <div className="font-serif text-slate-800 text-sm sm:text-base leading-loose space-y-4">
                {parsedMagazine.intro.split('\n\n').map((para, idx) => (
                  <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:text-emerald-700 first-letter:mr-1' : ''}>
                    {renderFormattedInline(para)}
                  </p>
                ))}
              </div>
            </div>

            {/* 5. FUNDAMENTAÇÃO DOUTRINÁRIA (DECLARAÇÃO DE FÉ CGADB / CPAD & EXEGESE LÉXICA) */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-indigo-800/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/25 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-indigo-400/30">
                  <ShieldCheck size={13} className="text-indigo-300" /> Fundamentação Doutrinária Oficial (CGADB / CPAD)
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {parsedMagazine.dogmaticCap}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white">
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

            {/* 6. DESENVOLVIMENTO EXEGÉTICO COMPLETO DOS TÓPICOS E SUBTÓPICOS (I, II e III) */}
            <div className="space-y-10">
              {parsedMagazine.topics.map((topic, index) => {
                const topicIllustration = getIllustrationForTopic(
                  topic.title,
                  [
                    ...topic.introParagraphs,
                    ...topic.subtopics.flatMap(s => s.paragraphs)
                  ],
                  index + 1
                );

                return (
                  <div key={index} className="space-y-6">
                    <div className="bg-white p-7 sm:p-9 md:p-11 rounded-[2.5rem] border border-slate-200/90 shadow-xs space-y-6 relative overflow-hidden">
                      {/* Cabeçalho do Tópico */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-emerald-100">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                            {topic.roman}
                          </span>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                              Tópico {topic.roman} • Exegese e Comentário da Lição {cleanLicaoNum}
                            </span>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black font-sans text-slate-900 leading-snug">
                              {topic.title}
                            </h3>
                          </div>
                        </div>

                        {topic.topicRefs && (
                          <button
                            type="button"
                            onClick={() => setSelectedBibleRef(topic.topicRefs.split(';')[0].trim())}
                            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                          >
                            <BookOpen size={13} /> {topic.topicRefs}
                          </button>
                        )}
                      </div>

                      {/* Introdução Exegética do Tópico */}
                      {topic.introParagraphs.length > 0 && (
                        <div className="space-y-3 font-serif text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
                          {topic.introParagraphs.map((p, pIdx) => (
                            <p key={pIdx}>{renderFormattedInline(p)}</p>
                          ))}
                        </div>
                      )}

                      {/* Subtópicos Detalhados (1.1, 1.2, 1.3...) */}
                      {topic.subtopics.length > 0 && (
                        <div className="space-y-6">
                          {topic.subtopics.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-6 sm:p-7 rounded-3xl bg-slate-50/60 border border-slate-200/90 space-y-4 hover:border-emerald-300/80 transition-all"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                                <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-black">
                                    {sub.code}
                                  </span>
                                  <span>{sub.title}</span>
                                </h4>

                                {sub.baseRef && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBibleRef(sub.baseRef.split(';')[0].trim())}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                                    title="Abrir versículo e comentário exegético"
                                  >
                                    <Scroll size={12} /> {sub.baseRef}
                                  </button>
                                )}
                              </div>

                              {/* Parágrafos Densos de Exegese do Subtópico */}
                              <div className="space-y-3 font-serif text-slate-800 text-sm sm:text-base leading-loose">
                                {sub.paragraphs.map((sp, spIdx) => (
                                  <p key={spIdx}>{renderFormattedInline(sp)}</p>
                                ))}
                              </div>

                              {/* Citação Direta dos Versículos Bíblicos do Subtópico (ARC) */}
                              {sub.scriptureQuote.length > 0 && (
                                <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-1 font-serif text-xs sm:text-sm text-amber-950">
                                  {sub.scriptureQuote.map((qLine, qIdx) => (
                                    <p key={qIdx} className={qIdx === 0 ? 'font-bold not-italic' : 'italic'}>
                                      {renderFormattedInline(qLine)}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {/* Aplicação Pedagógica do Subtópico para a Turma */}
                              {sub.classApplication && (
                                <div className="bg-emerald-50/70 border border-emerald-200/70 p-4 rounded-2xl flex items-start gap-2.5">
                                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                  <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
                                    <strong className="font-black uppercase text-[10px] tracking-wider text-emerald-800 block mb-0.5">
                                      Aplicação Prática na Classe ({turma || 'EBD'}):
                                    </strong>
                                    {renderFormattedInline(sub.classApplication)}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Caixa de Sustentação Bíblica do Tópico */}
                      {topic.topicVersesARC.length > 0 && (
                        <div className="bg-[#FAF5ED] border border-[#E3DAC9] p-5 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5A2B] flex items-center gap-1.5">
                              <Scroll size={13} /> Sustentação Bíblica do Tópico {topic.roman} ({topic.topicRefs} - ARC)
                            </span>
                          </div>
                          <div className="font-serif text-xs sm:text-sm text-[#4A3C31] space-y-1 leading-relaxed">
                            {topic.topicVersesARC.map((vLine, vIdx) => (
                              <p key={vIdx}>{vLine}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Síntese Teológica do Tópico */}
                      {topic.synthesis && (
                        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-start gap-3">
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

                    {/* Ilustração Temática Contextual do Tópico */}
                    <div className="rounded-[2.5rem] overflow-hidden shadow-lg aspect-[16/6] relative group">
                      <img 
                        src={topicIllustration.url} 
                        alt={topic.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>
                      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                          <ImageIcon size={10} className="text-emerald-400" /> Subsídio Visual • Tópico {topic.roman}: {topic.title}
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

            {/* 7. APLICAÇÃO PRÁTICA PASTORAL E MINISTERIAL */}
            {parsedMagazine.application.length > 0 && (
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-emerald-200/80 shadow-xs space-y-5">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-emerald-200">
                  <Check size={12} /> Aplicação Prática para a Vida Cristã, Família e Igreja
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  Vivenciando a Lição {cleanLicaoNum} durante a Semana
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

            {/* 8. CONCLUSÃO & MENSAGEM PASTORAL */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 md:p-11 rounded-[2.5rem] shadow-xl border border-emerald-800 relative">
              <div className="absolute -top-3 left-8 px-4 py-1 bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                Conclusão & Síntese Pastoral
              </div>
              <div className="prose prose-invert max-w-none space-y-4">
                <p className="font-serif italic text-emerald-100 text-sm sm:text-base md:text-lg leading-loose">
                  {renderFormattedInline(parsedMagazine.conclusion)}
                </p>
              </div>
            </div>

            {/* 9. VALIDAÇÃO PEDAGÓGICA (PERGUNTAS DE FIXAÇÃO COM GABARITO COMENTADO) */}
            {parsedMagazine.quiz.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-indigo-200/80 p-8 md:p-10 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200 mb-2">
                      <HelpCircle size={12} /> Validação Pedagógica & Fixação
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900">
                      Questionário de Revisão da Lição {cleanLicaoNum}
                    </h4>
                  </div>
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
                            {isRevealed ? 'Ocultar Gabarito' : 'Ver Gabarito'}
                          </button>
                        </div>
                        {isRevealed && (
                          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-xs sm:text-sm text-indigo-950 font-serif leading-relaxed">
                            <strong className="font-black uppercase text-[10px] tracking-wider text-indigo-700 block mb-1">
                              Gabarito Teológico Comentado:
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

            {/* 10. DIÁRIO DE ANOTAÇÕES DO ALUNO / PROFESSOR */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-10 shadow-xs space-y-4">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BookOpenText size={20} className="text-emerald-600" /> Diário de Estudo / Anotações Pessoais da Aula
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Registre abaixo suas anotações, aplicações pastorais ou dúvidas sobre a Lição {cleanLicaoNum} ({revista}) para compartilhar em classe.
              </p>

              <textarea
                value={customNotes}
                onChange={(e) => {
                  setCustomNotes(e.target.value);
                  localStorage.setItem(`gipp_notes_ebd_${licaoNum}_${revista}`, e.target.value);
                }}
                placeholder="Escreva aqui seus apontamentos sobre os tópicos da lição..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 p-4 font-sans text-sm outline-hidden transition-all bg-slate-50/50"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Salvo automaticamente neste dispositivo</span>
                <span>{customNotes.trim().split(/\s+/).filter(Boolean).length} palavras</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal de Explicação e Exegese Bíblica Integrado */}
      <BibleReferenceModal
        isOpen={!!selectedBibleRef}
        referenceQuery={selectedBibleRef || ''}
        onClose={() => setSelectedBibleRef(null)}
      />
    </div>
  );
};
