import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  BookOpen, ChevronRight, ChevronLeft, Award, 
  Loader2, DownloadCloud, Copy, Book, TrendingUp, User, CheckCheck, AlertTriangle, X,
  Database, Sparkles, Search, Monitor, Check, Zap, RefreshCw
} from 'lucide-react';

import { 
  collection, doc, setDoc, getDocs
} from 'firebase/firestore';

import { storeMedia, getMedia, getAllKeys } from '../lib/indexedDbService';

import {
  ChurchContext, CachedImage, callGeminiAI,
  Button, playMenuSound, playNotificationSound,
  copyToClipboard
} from '../App';

import { BIBLE_BOOKS } from './ModuleDevSuporte';
import { bibleDatabaseService } from '../services/bibleDatabaseService';
import { ALL_BIBLE_BOOKS, BibleVerseItem } from '../data/bibliaOfflineData';
import { holyricsService } from '../services/holyricsService';

// Mapeamento de Livros em Português para Inglês para a API gratuita bible-api.com
const PORTUGUESE_TO_ENGLISH_BOOKS: Record<string, string> = {
    'Gênesis': 'Genesis', 'Êxodo': 'Exodus', 'Levítico': 'Leviticus',
    'Números': 'Numbers', 'Deuteronômio': 'Deuteronomy', 'Josué': 'Joshua',
    'Juízes': 'Judges', 'Rute': 'Ruth', '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel', '1 Reis': '1 Kings', '2 Reis': '2 Kings',
    '1 Crônicas': '1 Chronicles', '2 Crônicas': '2 Chronicles', 'Esdras': 'Ezra',
    'Neemias': 'Nehemiah', 'Ester': 'Esther', 'Jó': 'Job',
    'Salmos': 'Psalms', 'Provérbios': 'Proverbs', 'Eclesiastes': 'Ecclesiastes',
    'Cânticos': 'Song of Solomon', 'Cantares': 'Song of Solomon', 'Isaías': 'Isaiah', 'Jeremias': 'Jeremiah',
    'Lamentações': 'Lamentations', 'Ezequiel': 'Ezekiel', 'Daniel': 'Daniel',
    'Oseias': 'Hosea', 'Joel': 'Joel', 'Amós': 'Amos',
    'Obadias': 'Obadiah', 'Jonas': 'Jonah', 'Miqueias': 'Micah',
    'Naum': 'Nahum', 'Habacuque': 'Habakkuk', 'Sofonias': 'Zephaniah',
    'Ageu': 'Haggai', 'Zacarias': 'Zechariah', 'Malaquias': 'Malachi',
    
    'Mateus': 'Matthew', 'Marcos': 'Mark', 'Lucas': 'Luke',
    'João': 'John', 'Atos': 'Acts', 'Romanos': 'Romans',
    '1 Coríntios': '1 Corinthians', '2 Coríntios': '2 Corinthians', 'Gálatas': 'Galatians',
    'Efésios': 'Ephesians', 'Filipenses': 'Philippians', 'Colossenses': 'Colossians',
    '1 Tessalonicenses': '1 Thessalonians', '2 Tessalonicenses': '2 Thessalonians', '1 Timóteo': '1 Timothy',
    '2 Timóteo': '2 Timothy', 'Tito': 'Titus', 'Filemom': 'Philemon',
    'Hebreus': 'Hebrews', 'Tiago': 'James', '1 Pedro': '1 Peter',
    '2 Pedro': '2 Peter', '1 João': '1 John', '2 João': '2 John',
    '3 João': '3 John', 'Judas': 'Jude', 'Apocalipse': 'Revelation'
};

// Função para buscar texto com prioridade máxima no motor bíblico 100% offline (ARC)
const fetchFreeBibleText = async (bookName: string, chapter: number, translationId: string): Promise<string> => {
    // 1. Prioridade absoluta: motor local com os 66 livros e 1.189 capítulos autênticos (ARC)
    const localText = bibleDatabaseService.getFormattedChapterText(bookName, chapter, translationId);
    if (localText && localText.trim()) {
        return localText;
    }

    // 2. Fallback de contingência caso específico
    const englishBook = PORTUGUESE_TO_ENGLISH_BOOKS[bookName] || bookName;
    try {
        let apiTranslation = "almeida";
        if (translationId.toLowerCase() === "kjv") {
            apiTranslation = "kjv";
        }
        const url = `https://bible-api.com/${encodeURIComponent(englishBook)}+${chapter}?translation=${apiTranslation}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.verses && data.verses.length > 0) {
                return data.verses.map((v: any) => `**${v.verse}** ${v.text.trim()}`).join('\n\n');
            }
        }
    } catch (e) {
        // Sem impacto quando offline
    }
    return localText || "";
};

const ModuleBiblia = () => {
    const { db, setDoc, doc, dbFirestore, appId, user, addToast, isOnline } = useContext(ChurchContext);
    
    // Perfil de Gamificação e Preferências de Tradução
    const profile = db.membros?.find((m: any) => m.id === user?.id) || user || {};
    const [selectedTranslation, setSelectedTranslation] = useState<string>('arc');

    // Opção de utilizar nosso Banco da Bíblia Offline (Ativado por padrão para leitura instantânea)
    const [useOfflineBibleDb, setUseOfflineBibleDb] = useState<boolean>(() => {
        const savedMode = localStorage.getItem('biblia_use_offline_db');
        return savedMode !== null ? savedMode === 'true' : true;
    });

    const handleToggleOfflineDbMode = (enabled: boolean) => {
        setUseOfflineBibleDb(enabled);
        localStorage.setItem('biblia_use_offline_db', String(enabled));
        if (enabled) {
            addToast("Banco da Bíblia Offline ativado: leitura e estudos instantâneos (66 livros / 31.102 versículos)!", "success");
            if (selectedBook && selectedChapter) {
                handleSelectChapter(selectedBook, selectedChapter, selectedTranslation, true);
            }
        } else {
            addToast("Modo IA Online ativado para geração de estudos complementares.", "info");
        }
    };

    useEffect(() => {
        if (profile?.biblia_traducao) {
            setSelectedTranslation(profile.biblia_traducao);
        } else {
            const saved = localStorage.getItem('biblia_pref_traducao');
            if (saved) {
                setSelectedTranslation(saved);
            }
        }
    }, [profile?.biblia_traducao]);

    const handleSetTranslation = async (translationId: string) => {
        setSelectedTranslation(translationId);
        localStorage.setItem('biblia_pref_traducao', translationId);
        if (user?.id && dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), {
                    biblia_traducao: translationId
                }, { merge: true });
                addToast(`Tradução preferida salva: ${translationId.toUpperCase()}`, "success");
            } catch (err) {
                console.error("Erro ao salvar tradução preferida:", err);
            }
        }

        // Se o usuário já estiver lendo um capítulo, recarrega-o automaticamente na nova tradução
        if (selectedBook && selectedChapter) {
            handleSelectChapter(selectedBook, selectedChapter, translationId);
        }
    };

    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [readingData, setReadingData] = useState<any>(null); // Text and Study
    const [readingPages, setReadingPages] = useState<string[]>([]);
    const [currentReadingPage, setCurrentReadingPage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGeneratingAiUpgrade, setIsGeneratingAiUpgrade] = useState<boolean>(false);
    const [studySource, setStudySource] = useState<'offline_db' | 'ai_enhanced'>('offline_db');
    const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
    const [readingFontSize, setReadingFontSize] = useState<number>(20);
    const [readingContrast, setReadingContrast] = useState<'normal' | 'high' | 'sepia'>('normal');
    const [projectedVerseKey, setProjectedVerseKey] = useState<string | null>(null);

    // Pesquisa no Banco da Bíblia Offline
    const [bookFilter, setBookFilter] = useState<string>('');
    const [offlineSearchQuery, setOfflineSearchQuery] = useState<string>('');
    const [highlightedVerseNumber, setHighlightedVerseNumber] = useState<number | null>(null);

    // Recursos de Caching & Modo Offline
    const [cachedChapters, setCachedChapters] = useState<Set<string>>(new Set());
    const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

    // Estados de Gamificação (Modo Gremiação/Estudos)
    const [sidebarTab, setSidebarTab] = useState<'books' | 'search' | 'achievements'>('books');
    const [currentQuizQuestions, setCurrentQuizQuestions] = useState<any[] | null>(null);
    const [activeQuizMode, setActiveQuizMode] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState<number>(0);
    const [quizComplete, setQuizComplete] = useState<boolean>(false);
    const [quizFailed, setQuizFailed] = useState<boolean>(false);

    const dbSummary = useMemo(() => bibleDatabaseService.getDatabaseSummary(), []);

    const searchResults: BibleVerseItem[] = useMemo(() => {
        if (!offlineSearchQuery.trim()) {
            return bibleDatabaseService.searchVerses('', 12);
        }
        return bibleDatabaseService.searchVerses(offlineSearchQuery, 30);
    }, [offlineSearchQuery]);

    const updateCachedChapters = async () => {
        try {
            const keys = await getAllKeys();
            const bibleKeys = keys.filter(k => k.startsWith('bible_study_') || k.startsWith('bible_offline_arc_'));
            setCachedChapters(new Set(bibleKeys));
        } catch (e) {
            console.error("Erro ao obter cache do IndexedDB:", e);
        }
    };

    useEffect(() => {
        updateCachedChapters();
    }, []);

    // Sincronização Inteligente do Cache Bíblico Compartilhado
    useEffect(() => {
        if (!isOnline || !dbFirestore || !appId) return;

        const syncSharedBibleCache = async () => {
            try {
                const keys = await getAllKeys();
                const localKeysSet = new Set(keys.filter(k => k.startsWith('bible_study_')));

                const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'biblia_estudo_cache');
                const snapshot = await getDocs(colRef);

                let docAdded = 0;
                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data();
                    if (data && data.key && data.content && !localKeysSet.has(data.key)) {
                        await storeMedia(data.key, data.content);
                        docAdded++;
                    }
                }
                if (docAdded > 0) {
                    updateCachedChapters();
                }
            } catch (err) {
                console.error("Erro na sincronização da Bíblia offline compartilhada:", err);
            }
        };

        const timer = setTimeout(() => {
            syncSharedBibleCache();
        }, 1500);

        return () => clearTimeout(timer);
    }, [isOnline, dbFirestore, appId]);

    const vtBooks = useMemo(() => {
        const list = BIBLE_BOOKS.filter(b => b.test === 'VT');
        if (!bookFilter.trim()) return list;
        const q = bookFilter.toLowerCase().trim();
        return list.filter(b => b.name.toLowerCase().includes(q));
    }, [bookFilter]);

    const ntBooks = useMemo(() => {
        const list = BIBLE_BOOKS.filter(b => b.test === 'NT');
        if (!bookFilter.trim()) return list;
        const q = bookFilter.toLowerCase().trim();
        return list.filter(b => b.name.toLowerCase().includes(q));
    }, [bookFilter]);

    const parseStudyContent = (content: string) => {
        let texto = "";
        let contexto = "";
        let esboco = "";
        let conclusao = "";
        let quizList = null;

        try {
            let cleanContent = content;
            if (content.includes('[QUIZ]')) {
                const parts = content.split('[QUIZ]');
                cleanContent = parts[0];
                try {
                    const jsonText = parts[1].trim();
                    let cleanJson = jsonText;
                    if (cleanJson.includes('```json')) {
                        cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
                    } else if (cleanJson.includes('```')) {
                        cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
                    }
                    quizList = JSON.parse(cleanJson);
                } catch (err) {
                    console.error("Falha ao parsear quiz JSON:", err);
                }
            }

            const p1 = cleanContent.split('[CONTEXTO]');
            texto = p1[0].replace('[TEXTO]', '').trim();
            
            const p2 = p1[1].split('[ESBOCO]');
            contexto = p2[0].trim();
            
            const p3 = p2[1].split('[CONCLUSAO]');
            esboco = p3[0].trim();
            conclusao = p3[1].trim();
        } catch (e) {
            texto = content;
        }

        // Dividir o texto bíblico em páginas de 50 linhas
        const textLines = texto.split('\n');
        const textPages = [];
        const LINES_PER_PAGE = 50;
        
        for (let i = 0; i < textLines.length; i += LINES_PER_PAGE) {
            textPages.push(textLines.slice(i, i + LINES_PER_PAGE).join('\n'));
        }

        // Configurar Quiz Questions
        if (quizList && Array.isArray(quizList) && quizList.length === 3) {
            setCurrentQuizQuestions(quizList);
        } else {
            setCurrentQuizQuestions([
                {
                    "q": "Qual é a atitude do coração que mais edifica ao ler, pregar ou estudar as Escrituras Sagradas?",
                    "options": [
                        "Efetuar a leitura de forma rápida, puramente acadêmica ou fria",
                        "Meditar profundamente com espírito submisso, aplicando os preceitos éticos na retidão e prática diária",
                        "Desprezar o estudo histórico das notas ou debater vazios literários",
                        "Simplesmente acumular pontos para autoafirmação teológica"
                    ],
                    "answer": 1
                },
                {
                    "q": "Segundo as exposições e estudos oferecidos, de que forma o crente obtém crescimento em sua caminhada?",
                    "options": [
                        "Dedicando-se à leitura assídua das escrituras, comunhão viva na igreja, oração e Escola Dominical",
                        "Afastando-se de qualquer tipo de comunhão pastoral ou eclesiástica",
                        "Debatendo apenas as traduções gregas sem demonstrar amor ao irmão",
                        "Não assumindo nenhum compromisso litúrgico"
                    ],
                    "answer": 0
                },
                {
                    "q": "Qual o principal propósito para o estudo sistematizado dos Esboços de Pregação gerados em cada capítulo?",
                    "options": [
                        "Capacitar o obreiro e o crente a compreender e anunciar em fidelidade as mensagens eternas de Deus",
                        "Disputar com outras igrejas em retórica teórica fria",
                        "Estimular discussões vazias sobre versos soltos",
                        "Excluir-se de cultos pastorais presenciais"
                    ],
                    "answer": 0
                }
            ]);
        }

        return [
            ...textPages,
            contexto,
            esboco,
            conclusao
        ].filter(page => page && page.trim() !== '');
    };

    const handleSelectChapter = async (
        book: any,
        chapter: number,
        translationOverride?: string,
        forceOfflineDbOverride?: boolean,
        targetVerseHighlight?: number
    ) => {
        const activeTranslation = translationOverride || selectedTranslation;
        const shouldUseOfflineDb = forceOfflineDbOverride !== undefined ? forceOfflineDbOverride : useOfflineBibleDb;

        setSelectedBook(book);
        setSelectedChapter(chapter);
        setHighlightedVerseNumber(targetVerseHighlight || null);
        setActiveQuizMode(false);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setQuizScore(0);
        setQuizComplete(false);
        setQuizFailed(false);

        const bookSlug = book.name.toLowerCase().replace(/\s+/g, '_');
        const cacheKey = `bible_study_${bookSlug}_${chapter}_${activeTranslation.toLowerCase()}`;
        const cacheKeyArc = `bible_study_${bookSlug}_${chapter}_arc`;

        // MODO 1: BANCO DA BÍBLIA OFFLINE (INSTANTÂNEO, ZERO LATÊNCIA)
        if (shouldUseOfflineDb || !isOnline) {
            try {
                // Gera/obtém direto do nosso banco de dados bíblico offline (31.102 versículos + estudo CPAD/CGADB)
                const offlineStudy = bibleDatabaseService.getStudyInLegacyFormat(book.name, chapter, activeTranslation);
                const parsedPages = parseStudyContent(offlineStudy);
                setReadingPages(parsedPages);
                setReadingData(offlineStudy);
                setCurrentReadingPage(0);
                setStudySource('offline_db');
                setIsLoading(false);

                // Salva silenciosamente no IndexedDB em segundo plano
                storeMedia(cacheKey, offlineStudy).catch(() => {});
                storeMedia(cacheKeyArc, offlineStudy).catch(() => {});
                return;
            } catch (err) {
                console.error("Erro ao carregar capítulo do banco offline:", err);
            }
        }

        // MODO 2: COMPLEMENTO COM IA ONLINE
        setIsLoading(true);
        setReadingData(null);
        setReadingPages([]);
        setCurrentReadingPage(0);
        
        try {
            const cachedStudy = await getMedia(cacheKey);
            if (cachedStudy) {
                const parsedPages = parseStudyContent(cachedStudy);
                setReadingPages(parsedPages);
                setReadingData(cachedStudy);
                setStudySource('offline_db');
                setIsLoading(false);
                return;
            }

            const bibleText = await fetchFreeBibleText(book.name, chapter, activeTranslation);
            let result = "";

            if (isOnline) {
                const prompt = `Atue como a Bíblia Sagrada na versão ${activeTranslation.toUpperCase()} e como a Bíblia de Estudo do Pregador (CPAD). O usuário deseja estudar: ${book.name} capítulo ${chapter}.
                
${bibleText ? `O texto bíblico completo do capítulo (${activeTranslation.toUpperCase()}) é o seguinte:\n${bibleText}\n\n` : `Por favor, transcreva o texto bíblico completo de ${book.name} capítulo ${chapter} na versão ${activeTranslation.toUpperCase()}.\n\n`}

POR FAVOR, SIGA ESTA ESTRUTURA RIGOROSAMENTE EM MARKDOWN E USE AS TAGS ABAIXO PARA SEPARAR CADA SEÇÃO:

[TEXTO]
# 📖 ${book.name} ${chapter} (${activeTranslation.toUpperCase()})
${bibleText ? bibleText : `[Transcreva aqui o texto bíblico completo de ${book.name} ${chapter} na versão ${activeTranslation.toUpperCase()}, separando os versículos por quebra de linha com números em negrito, ex: **1** No princípio...]`}

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico
[Explique brevemente o cenário deste capítulo na tradução ${activeTranslation.toUpperCase()} e sua consonância doutrinária na teologia pentecostal tradicional]

[ESBOCO]
## 📝 Esboço Homilético
**Tema Sugerido:** [Título impactante para pregar sobre este capítulo]
**Texto-Base:** [Versículo chave do capítulo]

**I. [Primeiro Tópico Principal]**
- [Breve explicação pentecostal]
- [Referência cruzada]

**II. [Segundo Tópico Principal]**
- [Breve explicação]

**III. [Terceiro Tópico Principal]**
- [Breve explicação]

[CONCLUSAO]
## 💡 Conclusão e Aplicação
[Resumo de como aplicar a mensagem hoje na igreja]

[QUIZ]
[Escreva uma lista com exatamente 3 perguntas de múltipla escolha baseadas rigorosamente no texto bíblico e notas de estudo geradas acima, no formato JSON estrito, sem textos adicionais antes ou depois da lista JSON.]`;

                try {
                    result = await callGeminiAI(prompt, 2);
                    if (result && !result.startsWith("Erro na IA:")) {
                        setStudySource('ai_enhanced');
                    }
                } catch (e) {
                    console.warn("Erro ao chamar Gemini AI no estudo do capítulo:", e);
                }
            }

            if (!result || result.trim() === "" || result.startsWith("Erro na IA:")) {
                result = bibleDatabaseService.getStudyInLegacyFormat(book.name, chapter, activeTranslation);
                setStudySource('offline_db');
            }
            
            await storeMedia(cacheKey, result);

            if (dbFirestore && appId) {
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'biblia_estudo_cache', cacheKey), {
                        key: cacheKey,
                        content: result,
                        bookName: book.name,
                        chapter: chapter,
                        translation: activeTranslation,
                        cachedBy: user?.nome || 'Membro',
                        createdAt: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Erro ao salvar cache de estudos no Firestore:", e);
                }
            }

            updateCachedChapters();

            const parsedPages = parseStudyContent(result);
            setReadingPages(parsedPages);
            setReadingData(result);
        } catch (error) {
            console.error(error);
            const fallbackStudy = bibleDatabaseService.getStudyInLegacyFormat(book.name, chapter, activeTranslation);
            const parsedPages = parseStudyContent(fallbackStudy);
            setReadingPages(parsedPages);
            setReadingData(fallbackStudy);
            setStudySource('offline_db');
            addToast("Capítulo carregado com sucesso da Base Bíblica Offline!", "info");
        } finally {
            setIsLoading(false);
        }
    };

    // Enriquecer o estudo do capítulo atual sob demanda com IA mantendo o texto bíblico do banco offline
    const handleEnhanceCurrentChapterWithAI = async () => {
        if (!selectedBook || !selectedChapter) return;
        if (!isOnline) {
            addToast("Você está offline. Utilizando o estudo completo do Banco da Bíblia Offline.", "warning");
            return;
        }
        setIsGeneratingAiUpgrade(true);
        try {
            const bibleText = bibleDatabaseService.getFormattedChapterText(selectedBook.name, selectedChapter, selectedTranslation);
            const prompt = `Atue como a Bíblia de Estudo do Pregador Pentecostal (CPAD / CGADB). O usuário está estudando ${selectedBook.name} capítulo ${selectedChapter} (${selectedTranslation.toUpperCase()}).

MANTENHA O TEXTO BÍBLICO ABAIXO INTACTO NA SEÇÃO [TEXTO] E GERE UM ESTUDO APROFUNDADO NAS DEMAIS SEÇÕES:

[TEXTO]
# 📖 ${selectedBook.name} ${selectedChapter} (${selectedTranslation.toUpperCase()})

${bibleText}

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico, Exegético e Teológico
[Explique detalhadamente o cenário histórico, autor, destinatários e a consonância doutrinária com a Declaração de Fé das Assembleias de Deus - CGADB/CPAD]

[ESBOCO]
## 📝 Esboço Homilético Expositor
**Tema Sugerido:** [Título impactante para pregação]
**Texto-Base:** [Versículo chave de ${selectedBook.name} ${selectedChapter}]

**I. [Primeiro Ponto Principal]**
- [Explicação exegética e prática]

**II. [Segundo Ponto Principal]**
- [Explicação exegética e prática]

**III. [Terceiro Ponto Principal]**
- [Explicação exegética e prática]

[CONCLUSAO]
## 💡 Conclusão e Aplicação Prática
[Aplicação pastoral para a vida cristã e ministério]

[QUIZ]
[Lista JSON estrita com 3 perguntas de múltipla escolha sobre ${selectedBook.name} ${selectedChapter} no formato [{"q":"...","options":["...","...","...","..."],"answer":0}]]`;

            const result = await callGeminiAI(prompt, 2);
            if (result && !result.startsWith("Erro na IA:") && result.includes('[CONTEXTO]')) {
                const parsedPages = parseStudyContent(result);
                setReadingPages(parsedPages);
                setReadingData(result);
                setStudySource('ai_enhanced');
                const cacheKey = `bible_study_${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${selectedChapter}_${selectedTranslation.toLowerCase()}`;
                await storeMedia(cacheKey, result);
                addToast(`Estudo de ${selectedBook.name} ${selectedChapter} enriquecido com sucesso!`, "success");
            } else {
                addToast("Mantido o estudo oficial do Banco da Bíblia Offline.", "info");
            }
        } catch (err) {
            addToast("Mantido o estudo oficial do Banco da Bíblia Offline.", "info");
        } finally {
            setIsGeneratingAiUpgrade(false);
        }
    };

    // Projetar um versículo específico no Telão Holyrics e sincronizar com o Púlpito
    const handleProjectSingleVerse = (verseNum: number, verseText: string) => {
        if (!selectedBook || !selectedChapter) return;
        const reference = `${selectedBook.name} ${selectedChapter}:${verseNum}`;
        const versionLabel = selectedTranslation.toUpperCase() === 'ARC'
            ? 'Almeida Revista e Corrigida (ARC)'
            : selectedTranslation.toUpperCase();

        holyricsService.projectBibleVerse(reference, verseText, versionLabel);
        holyricsService.syncVerseToPulpito(reference, verseText);
        setProjectedVerseKey(`${selectedBook.name}_${selectedChapter}_${verseNum}`);
        addToast(`Projetado no Telão: ${reference}`, "success");
        setTimeout(() => setProjectedVerseKey(null), 2500);
    };

    // Enviar o capítulo inteiro como apresentação de slides para o Telão Holyrics
    const handleProjectEntireChapterToTelao = () => {
        if (!selectedBook || !selectedChapter) return;
        const verses = bibleDatabaseService.getChapterVerses(selectedBook.name, selectedChapter);
        if (!verses.length) return;

        const slides = verses.map((v) => ({
            id: `biblia-${selectedBook.name}-${selectedChapter}-${v.verse}`,
            tipo: 'versiculo' as const,
            titulo: `${selectedBook.name} ${selectedChapter}:${v.verse}`,
            subtitulo: `Bíblia Sagrada (${selectedTranslation.toUpperCase()})`,
            versiculo: {
                referencia: `${selectedBook.name} ${selectedChapter}:${v.verse}`,
                texto: v.text
            },
            notas: `Leitura Contínua: ${selectedBook.name} ${selectedChapter}`
        }));

        holyricsService.loadPresentation(
            `Leitura Bíblica: ${selectedBook.name} ${selectedChapter}`,
            slides,
            'biblia',
            true
        );
        holyricsService.syncVerseToPulpito(`${selectedBook.name} ${selectedChapter}:1`, verses[0].text);
        addToast(`${selectedBook.name} ${selectedChapter} (${verses.length} versículos) enviado para o Telão Holyrics!`, "success");
    };

    const handleDownloadBookOffline = async (book: any) => {
        if (downloadingBook) {
            addToast("Já existe um download em andamento.", "info");
            return;
        }

        setDownloadingBook(book.name);
        setDownloadProgress({ current: 1, total: book.chapters });
        addToast(`Salvando ${book.name} (${book.chapters} capítulos) na base de dados offline do sistema...`, "info");

        let successCount = 0;
        
        for (let cap = 1; cap <= book.chapters; cap++) {
            setDownloadProgress({ current: cap, total: book.chapters });
            const bookSlug = book.name.toLowerCase().replace(/\s+/g, '_');
            const cacheKey = `bible_study_${bookSlug}_${cap}_${selectedTranslation.toLowerCase()}`;
            
            try {
                const cached = await getMedia(cacheKey);
                if (cached) {
                    successCount++;
                    continue;
                }

                const result = bibleDatabaseService.getStudyInLegacyFormat(book.name, cap, selectedTranslation);
                await storeMedia(cacheKey, result);
                successCount++;
            } catch (err) {
                console.error(`Erro ao salvar cap ${cap} de ${book.name}:`, err);
            }
        }

        await updateCachedChapters();
        setDownloadingBook(null);
        addToast(`Livro de ${book.name} salvo 100% offline (${successCount}/${book.chapters} capítulos)!`, "success");
    };

    const [isDownloadingAllBible, setIsDownloadingAllBible] = useState(false);
    const [allBibleProgress, setAllBibleProgress] = useState({ current: 0, total: 1189, percent: 0, bookName: '' });

    const handleDownloadEntireBible = async () => {
        if (isDownloadingAllBible) return;
        setIsDownloadingAllBible(true);
        addToast("Iniciando indexação offline de todos os 66 livros da Bíblia Sagrada no sistema...", "info");

        const success = await bibleDatabaseService.downloadFullBibleToIndexedDB((prog) => {
            setAllBibleProgress(prog);
        });

        if (success) {
            await updateCachedChapters();
            addToast("Toda a Bíblia Sagrada (66 livros, 1.189 capítulos) foi baixada e indexada offline no sistema com sucesso!", "success");
        } else {
            addToast("Houve uma falha ao indexar alguns capítulos. Tente novamente.", "error");
        }
        setIsDownloadingAllBible(false);
    };

    // Metricas do perfil de gamificação
    const biblePoints = profile.biblia_pontos || 0;
    const completedChapters = profile.biblia_capitulos_concluidos || [];

    const getFaithLevel = (xp: number) => {
        if (xp >= 5000) return { title: "Doutor da Lei (Bereia)", color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-500/10", nextXp: 10000 };
        if (xp >= 2000) return { title: "Bereano Sábio", color: "text-emerald-500", border: "border-emerald-500", bg: "bg-emerald-500/10", nextXp: 5000 };
        if (xp >= 800) return { title: "Discípulo Fiel", color: "text-indigo-500", border: "border-indigo-500", bg: "bg-indigo-500/10", nextXp: 2000 };
        if (xp >= 200) return { title: "Buscador da Verdade", color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-500/10", nextXp: 800 };
        return { title: "Estudante e Recruta", color: "text-slate-500", border: "border-slate-300", bg: "bg-slate-500/10", nextXp: 200 };
    };

    const faithLevel = getFaithLevel(biblePoints);
    const progressToNextLevel = Math.min(100, Math.round((biblePoints / faithLevel.nextXp) * 100));

    // Ranking de Outros Membros (Gremiação/Gamificação)
    const leaderboard = useMemo(() => {
        return (db.membros || [])
            .map((m: any) => ({
                id: m.id,
                nome: m.nome,
                foto: m.foto,
                pontos: m.biblia_pontos || 0,
                caps: (m.biblia_capitulos_concluidos || []).length
            }))
            .filter((m: any) => m.pontos > 0)
            .sort((a: any, b: any) => b.pontos - a.pontos);
    }, [db.membros]);

    // Responder alternativa do Quiz
    const handleAnswerQuestion = (idx: number) => {
        if (quizComplete || quizFailed) return;
        setSelectedOption(idx);
    };

    // Submete a pergunta atual do Quiz
    const handleNextQuestion = async () => {
        if (selectedOption === null) {
            addToast("Selecione uma alternativa antes de continuar.", "warning");
            return;
        }

        const currentQ = currentQuizQuestions ? currentQuizQuestions[currentQuestionIndex] : null;
        if (!currentQ) return;
        const isCorrect = selectedOption === currentQ.answer;
        
        let newScore = quizScore;
        if (isCorrect) {
            newScore += 1;
            setQuizScore(newScore);
            addToast("Correto! Muito bem!", "success");
            playNotificationSound();
        } else {
            addToast("Alternativa incorreta. Continue estudando!", "warning");
        }

        const nextIdx = currentQuestionIndex + 1;
        if (currentQuizQuestions && nextIdx < currentQuizQuestions.length) {
            setCurrentQuestionIndex(nextIdx);
            setSelectedOption(null);
        } else {
            if (newScore >= 2) {
                setQuizComplete(true);
                const bookKey = selectedBook?.name ? selectedBook.name.toLowerCase().replace(/\s+/g, '_') : '';
                const chapterKey = `${bookKey}_${selectedChapter}`;
                
                if (!completedChapters.includes(chapterKey)) {
                    const updatedChapters = [...completedChapters, chapterKey];
                    const updatedPoints = biblePoints + 100;
                    
                    try {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), {
                            biblia_pontos: updatedPoints,
                            biblia_capitulos_concluidos: updatedChapters
                        }, { merge: true });
                        addToast("Parabéns! Capítulo estudado de forma aprovada (+100 XP)", "success");
                    } catch (err) {
                        console.error("Erro ao salvar progresso bíblico do membro:", err);
                    }
                }
            } else {
                setQuizFailed(true);
                addToast("Você necessita pelo menos acertar 2 questões para concluir.", "warning");
            }
        }
    };

    const handleStartQuiz = () => {
        if (!currentQuizQuestions) {
            addToast("Os desafios bíblicos não estão prontos para este capítulo.", "warning");
            return;
        }
        playMenuSound();
        setActiveQuizMode(true);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setQuizScore(0);
        setQuizComplete(false);
        setQuizFailed(false);
    };

    // Abrir resultado da busca diretamente no livro e capítulo correspondente
    const handleOpenSearchResultInStudy = (item: BibleVerseItem) => {
        const foundBook = BIBLE_BOOKS.find(
            b => b.name.toLowerCase() === item.book.toLowerCase() ||
                 (item.book === 'Cantares' && b.name === 'Cânticos')
        ) || { name: item.book, chapters: ALL_BIBLE_BOOKS.find(ab => ab.name === item.book)?.chaptersCount || 50 };

        setSidebarTab('books');
        handleSelectChapter(foundBook, item.chapter, selectedTranslation, true, item.verse);
    };

    // Renderizador rico e interativo de páginas do estudo bíblico e versículos
    const renderFormattedStudyPage = (pageContent: string, isFullscreen = false) => {
        if (!pageContent) return null;
        const lines = pageContent.split('\n');

        const formatInlineBold = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={idx} className="font-black text-slate-900 dark:text-amber-300">{part.slice(2, -2)}</strong>;
                }
                return <span key={idx}>{part}</span>;
            });
        };

        return (
            <div className="space-y-3">
                {lines.map((rawLine, idx) => {
                    const line = rawLine.trim();
                    if (!line) return <div key={idx} className="h-1.5" />;

                    // Título Principal (# ...)
                    if (line.startsWith('# ')) {
                        return (
                            <h1 key={idx} className="font-serif text-2xl md:text-3xl font-black text-slate-900 border-b-2 border-amber-500/30 pb-3 mb-4">
                                {line.replace(/^#\s+/, '')}
                            </h1>
                        );
                    }

                    // Subtítulo (## ...)
                    if (line.startsWith('## ')) {
                        return (
                            <h2 key={idx} className="font-serif text-xl md:text-2xl font-black text-amber-800 mt-4 mb-2 flex items-center gap-2">
                                {line.replace(/^##\s+/, '')}
                            </h2>
                        );
                    }

                    // Versículo bíblico no formato "**1** No princípio..."
                    const verseMatch = line.match(/^\*\*(\d+)\*\*\s+(.+)$/);
                    if (verseMatch) {
                        const vNum = parseInt(verseMatch[1], 10);
                        const vText = verseMatch[2];
                        const isHighlighted = highlightedVerseNumber === vNum;
                        const isJustProjected = projectedVerseKey === `${selectedBook?.name}_${selectedChapter}_${vNum}`;

                        return (
                            <div
                                key={idx}
                                className={`group relative rounded-xl p-2.5 -mx-2.5 transition-all border ${
                                    isHighlighted
                                        ? 'bg-amber-100/90 border-amber-400 shadow-sm'
                                        : isJustProjected
                                        ? 'bg-emerald-50 border-emerald-300'
                                        : 'border-transparent hover:bg-amber-50/70 hover:border-amber-200/70'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="leading-relaxed flex-1">
                                        <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 mr-2 rounded-md bg-amber-500/15 text-amber-800 font-sans font-black text-xs select-none border border-amber-500/30">
                                            {vNum}
                                        </span>
                                        <span>{vText}</span>
                                    </p>

                                    {!isFullscreen && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 font-sans">
                                            <button
                                                type="button"
                                                onClick={() => handleProjectSingleVerse(vNum, vText)}
                                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                                                title="Projetar este versículo no Telão Holyrics"
                                            >
                                                <Monitor size={11} />
                                                <span>Telão</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    copyToClipboard(`${vText} (${selectedBook?.name} ${selectedChapter}:${vNum})`);
                                                    addToast(`Versículo ${selectedBook?.name} ${selectedChapter}:${vNum} copiado!`, "success");
                                                }}
                                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold shadow-xs cursor-pointer"
                                                title="Copiar versículo"
                                            >
                                                <Copy size={11} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Item de lista (- ...)
                    if (line.startsWith('- ')) {
                        return (
                            <div key={idx} className="flex items-start gap-2.5 pl-2 text-slate-700 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2.5 shrink-0" />
                                <p className="flex-1">{formatInlineBold(line.slice(2))}</p>
                            </div>
                        );
                    }

                    // Parágrafo normal ou tópico em negrito
                    return (
                        <p key={idx} className="leading-relaxed text-slate-800">
                            {formatInlineBold(line)}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 animate-entrance bg-[#f4f1ea] rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* SIDEBAR DE NAVEGAÇÃO (ÍNDICE E BANCO DA BÍBLIA OFFLINE) */}
            <div className="w-full md:w-88 bg-white border-r border-[#e5e0d8] flex flex-col shrink-0 z-10 h-1/3 md:h-full shadow-md">
                <div className="p-5 bg-slate-900 text-[#f4f1ea] border-b-4 border-amber-600 flex flex-col items-center text-center shrink-0 relative">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={28} className="text-amber-500"/>
                        <h2 className="font-serif text-xl font-black uppercase tracking-widest leading-none">Bíblia de Estudo</h2>
                    </div>
                    <p className="text-[10px] text-amber-400/90 uppercase tracking-widest font-bold">
                        {selectedTranslation.toUpperCase()} • Edição Pentecostal CPAD / CGADB
                    </p>

                    {/* SELETOR DE MODO: BANCO DA BÍBLIA OFFLINE VS IA ONLINE */}
                    <div className="mt-3 w-full bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => handleToggleOfflineDbMode(true)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                useOfflineBibleDb
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-700/60'
                            }`}
                            title="Utilizar o nosso Banco da Bíblia Offline integrado (66 livros, 1.189 capítulos, 31.102 versículos) com carregamento instantâneo"
                        >
                            <Database size={12} />
                            <span>Banco Offline</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleOfflineDbMode(false)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                !useOfflineBibleDb
                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-700/60'
                            }`}
                            title="Gerar estudos complementares utilizando IA online quando houver internet"
                        >
                            <Sparkles size={12} />
                            <span>Estudo IA</span>
                        </button>
                    </div>

                    {/* Dropdown de Traduções da Bíblia */}
                    <div className="mt-2.5 w-full">
                        <label htmlFor="bible-translation-select" className="sr-only">Tradução da Bíblia</label>
                        <select 
                            id="bible-translation-select"
                            value={selectedTranslation}
                            onChange={(e) => handleSetTranslation(e.target.value)}
                            className="w-full bg-slate-800 text-[#f4f1ea] text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:bg-slate-750 transition-colors"
                        >
                            <option value="arc">ARC — Banco da Bíblia Offline (CPAD)</option>
                            <option value="acf">ACF (Almeida Corrigida Fiel)</option>
                            <option value="almeida">ARA (Almeida Revista e Atualizada)</option>
                            <option value="nvi">NVI (Nova Versão Internacional)</option>
                            <option value="kjv">KJV (King James Version)</option>
                        </select>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{dbSummary.totalBooks} Livros • {dbSummary.totalChapters} Caps • 31.102 Versículos Offline</span>
                    </div>
                </div>

                {/* TAB SELECTOR DA BARRA LATERAL (LIVROS / BUSCA OFFLINE / CONQUISTAS) */}
                <div className="flex bg-slate-100 border-b border-[#e5e0d8] p-1.5 gap-1 select-none text-[10px] font-black tracking-wider uppercase">
                    <button 
                        type="button"
                        onClick={() => setSidebarTab('books')}
                        className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${sidebarTab === 'books' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        📖 Livros
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSidebarTab('search')}
                        className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'search' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <Search size={12} /> Busca Offline
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSidebarTab('achievements')}
                        className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${sidebarTab === 'achievements' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        🏆 Ranking
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                    {sidebarTab === 'books' ? (
                        <>
                            {/* PAINEL DO BANCO DA BÍBLIA 100% OFFLINE DO SISTEMA */}
                            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-slate-500/10 border border-emerald-500/30 text-xs">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 font-black text-slate-800">
                                  <Database size={14} className="text-emerald-600" />
                                  <span>Nosso Banco da Bíblia Offline</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 flex items-center gap-1">
                                  <Check size={10} /> {useOfflineBibleDb ? 'Ativo' : 'Pronto'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mb-2 leading-tight">
                                Base local completa com os <strong>66 livros, 1.189 capítulos e 31.102 versículos</strong> + Esboços do Pregador (CPAD/CGADB) sem depender de internet.
                              </p>

                              {!useOfflineBibleDb && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleOfflineDbMode(true)}
                                  className="w-full mb-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                >
                                  <Zap size={13} />
                                  <span>Ativar Leitura pelo Banco Offline</span>
                                </button>
                              )}

                              {isDownloadingAllBible ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <Loader2 size={10} className="animate-spin text-amber-500" /> Indexando {allBibleProgress.bookName}...
                                    </span>
                                    <span className="font-mono text-amber-600">{allBibleProgress.current} / {allBibleProgress.total} ({allBibleProgress.percent}%)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 transition-all duration-200" style={{ width: `${allBibleProgress.percent}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleDownloadEntireBible}
                                  className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                  title="Sincronizar todos os 1.189 estudos homiléticos no armazenamento permanente IndexedDB do navegador"
                                >
                                  <DownloadCloud size={13} />
                                  <span>
                                    {cachedChapters.size >= 1189
                                      ? 'Todos os 1.189 Caps Salvos no Dispositivo'
                                      : 'Salvar Todos os 1.189 Estudos no Dispositivo'}
                                  </span>
                                </button>
                              )}
                            </div>

                            {!selectedBook ? (
                                <div className="space-y-5 pb-6">
                                    {/* Filtro rápido de livro */}
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={bookFilter}
                                            onChange={(e) => setBookFilter(e.target.value)}
                                            placeholder="Filtrar livro (ex: Salmos, João, Romanos)..."
                                            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                                        />
                                        {bookFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setBookFilter('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {vtBooks.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2 flex items-center justify-between">
                                                <span>Antigo Testamento</span>
                                                <span className="text-[10px] text-emerald-600 font-black">39 Livros Offline</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {vtBooks.map(b => (
                                                    <button
                                                        type="button"
                                                        key={b.name}
                                                        onClick={() => setSelectedBook(b)}
                                                        className="text-left p-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-slate-100 hover:border-amber-200 flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="truncate">{b.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono ml-1">{b.chapters}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {ntBooks.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2 flex items-center justify-between">
                                                <span>Novo Testamento</span>
                                                <span className="text-[10px] text-emerald-600 font-black">27 Livros Offline</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {ntBooks.map(b => (
                                                    <button
                                                        type="button"
                                                        key={b.name}
                                                        onClick={() => setSelectedBook(b)}
                                                        className="text-left p-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-slate-100 hover:border-amber-200 flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="truncate">{b.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono ml-1">{b.chapters}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="animate-entrance">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedBook(null); setSelectedChapter(null); setReadingData(null); setReadingPages([]); }}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 mb-4 px-3 py-2 bg-slate-50 rounded-xl w-full border border-slate-200 cursor-pointer"
                                    >
                                        <ChevronLeft size={16}/> Voltar aos 66 Livros
                                    </button>
                                    
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div>
                                            <h3 className="font-serif text-2xl font-black text-slate-800 leading-none">{selectedBook.name}</h3>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                ⚡ {selectedBook.chapters} Capítulos no Banco Offline
                                            </span>
                                        </div>
                                        {downloadingBook === selectedBook.name ? (
                                            <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                                <Loader2 size={10} className="animate-spin" />
                                                <span>{downloadProgress.current}/{downloadProgress.total}</span>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={() => handleDownloadBookOffline(selectedBook)} 
                                                className="text-xs flex items-center gap-1 font-bold text-amber-600 hover:text-amber-750 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors shadow-xs cursor-pointer"
                                                title="Salvar cópia dedicada de todos os capítulos deste livro no IndexedDB"
                                            >
                                                <DownloadCloud size={14} /> <span className="hidden sm:inline">Salvar Livro</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-5 gap-2">
                                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(cap => {
                                            const bookSlug = selectedBook.name.toLowerCase().replace(/\s+/g, '_');
                                            const keyToCheckLegacy = `${bookSlug}_${cap}`;
                                            const keyToCheckWithTranslation = `${bookSlug}_${cap}_${selectedTranslation.toLowerCase()}`;
                                            const isStudied = completedChapters.includes(keyToCheckLegacy) || completedChapters.includes(keyToCheckWithTranslation);
                                            
                                            const cacheKey = `bible_study_${bookSlug}_${cap}_${selectedTranslation.toLowerCase()}`;
                                            const cacheKeyArc = `bible_study_${bookSlug}_${cap}_arc`;
                                            const isChapterAvailableOffline = useOfflineBibleDb || cachedChapters.has(cacheKey) || cachedChapters.has(cacheKeyArc);

                                            return (
                                                <button 
                                                    type="button"
                                                    key={cap} 
                                                    onClick={() => handleSelectChapter(selectedBook, cap)}
                                                    className={`relative aspect-square rounded-xl font-bold flex flex-col items-center justify-center transition-all border shadow-sm cursor-pointer ${
                                                        selectedChapter === cap
                                                            ? 'bg-slate-900 text-white border-slate-900 scale-105'
                                                            : 'bg-white text-slate-700 hover:bg-amber-100 hover:border-amber-300 border-slate-200'
                                                    }`}
                                                >
                                                    <span className={`${isStudied ? "text-amber-500 line-through decoration-amber-500 mr-1" : ""}`}>{cap}</span>
                                                    {isChapterAvailableOffline && (
                                                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500" title="Disponível no Banco da Bíblia Offline" />
                                                    )}
                                                    {isStudied && (
                                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 flex items-center justify-center border border-white text-[6px] text-white font-serif">★</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : sidebarTab === 'search' ? (
                        /* ABA DE BUSCA INSTANTÂNEA NO BANCO DA BÍBLIA OFFLINE (31.102 VERSÍCULOS) */
                        <div className="space-y-4 pb-6 animate-entrance">
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs mb-1">
                                    <Database size={14} />
                                    <span>Pesquisa no Banco da Bíblia Offline</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 leading-tight">
                                    Digite uma referência (ex: <strong>Jo 3:16</strong>, <strong>Sl 23</strong>, <strong>Rm 8:28</strong>) ou palavra-chave (ex: <strong>Espírito Santo</strong>, <strong>graça</strong>, <strong>fé</strong>).
                                </p>
                                <div className="relative mt-2.5">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                                    <input
                                        type="text"
                                        value={offlineSearchQuery}
                                        onChange={(e) => setOfflineSearchQuery(e.target.value)}
                                        placeholder="Ex: João 3:16, Salmos 91, salvação..."
                                        className="w-full pl-8 pr-8 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    {offlineSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setOfflineSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                                    <span>{offlineSearchQuery.trim() ? `Resultados (${searchResults.length})` : 'Versículos Chave Sugeridos'}</span>
                                    <span className="text-emerald-600">100% Offline</span>
                                </div>

                                {searchResults.map((item, idx) => (
                                    <div
                                        key={`${item.reference}_${idx}`}
                                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                {item.reference}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenSearchResultInStudy(item)}
                                                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer"
                                                    title="Abrir este capítulo na Bíblia de Estudo"
                                                >
                                                    Estudar Cap.
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        holyricsService.projectBibleVerse(item.reference, item.text, 'Almeida Revista e Corrigida (ARC)');
                                                        holyricsService.syncVerseToPulpito(item.reference, item.text);
                                                        addToast(`Projetado no Telão: ${item.reference}`, "success");
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                                    title="Projetar versículo no Telão Holyrics"
                                                >
                                                    <Monitor size={10} /> Telão
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs font-serif text-slate-700 leading-relaxed">
                                            “{item.text}”
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // MODO GREMIAÇÃO: LISTA DE DESAFIOS E PLACAR DA IGREJA
                        <div className="space-y-6 pb-6 animate-entrance">
                            {/* MEU RANKING */}
                            <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Meu Medalheiro</span>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/30">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-lg font-black leading-none">{biblePoints} <span className="text-xs text-slate-400">XP</span></h4>
                                        <p className="text-[10px] font-bold text-slate-300">{completedChapters.length} capítulos estudados</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mb-1">
                                        <span>Nível: {faithLevel.title}</span>
                                        <span>{progressToNextLevel}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${progressToNextLevel}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* PLACAR DE LIDERANÇA DA IGREJA */}
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5 border-b pb-2">
                                    <TrendingUp size={14} className="text-[#c2410c]" /> Placar de Estudiosos
                                </h4>
                                {leaderboard.length === 0 ? (
                                    <p className="text-[10px] font-medium text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-200">Comece a fazer desafios e inaugure este ranking!</p>
                                ) : (
                                    <div className="space-y-2">
                                        {leaderboard.map((m: any, index: number) => (
                                            <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-amber-200 transition-all shadow-xs">
                                                <div className="flex items-center gap-2 font-serif">
                                                    <div className="text-xs font-black w-5 text-center text-slate-500">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        {m.foto ? <CachedImage src={m.foto} cacheKey={`user_${m.id}_foto`} className="w-full h-full object-cover"/> : <User size={14} className="text-slate-400"/>}
                                                    </div>
                                                    <div className="max-w-[120px] truncate">
                                                        <p className="text-xs font-black text-slate-800 leading-tight truncate font-sans">{m.nome}</p>
                                                        <p className="text-[9px] font-medium text-slate-400 font-sans">{m.caps} Capítulos</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-serif font-black text-amber-600">{m.pontos} XP</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ÁREA DE LEITURA (PÁGINA DO LIVRO / COMPONENT DE QUIZ) */}
            <div className="flex-1 flex flex-col h-2/3 md:h-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-amber-700 p-10 text-center animate-entrance">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-amber-100 mb-6 relative">
                            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
                            <BookOpen size={32} className="animate-pulse"/>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 font-serif">Buscando as Escrituras...</h3>
                        <p className="text-slate-600 font-medium max-w-md mb-4">Preparando notas do pregador, comentários hermenêuticos e o desafio bíblico.</p>
                        <button
                            type="button"
                            onClick={() => selectedBook && selectedChapter && handleSelectChapter(selectedBook, selectedChapter, selectedTranslation, true)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                        >
                            <Zap size={14} /> Abrir Imediatamente pelo Banco Offline
                        </button>
                    </div>
                ) : activeQuizMode && currentQuizQuestions ? (
                    /* INTERFACE DO DESAFIO DO CAPÍTULO (BÍBLIA DE ESTUDOS) */
                    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 md:p-12 items-center justify-center">
                        <div className="max-w-2xl w-full bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-entrance">
                            
                            {/* Header de progresso do Desafio */}
                            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                                <div className="flex items-center gap-2 font-serif">
                                    <Award size={20} className="text-amber-500 animate-bounce" />
                                    <span className="text-xs font-black uppercase tracking-wider font-sans">Desafio Bíblico • {selectedBook?.name} {selectedChapter}</span>
                                </div>
                                <span className="text-xs font-black text-slate-400 bg-slate-800 px-3 py-1 rounded">Questão {currentQuestionIndex + 1}/3</span>
                            </div>

                            <div className="p-8">
                                {!quizComplete && !quizFailed ? (
                                    <>
                                        <h3 className="font-serif text-lg md:text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                                            {currentQuizQuestions[currentQuestionIndex]?.q}
                                        </h3>

                                        <div className="space-y-3 font-serif">
                                            {currentQuizQuestions[currentQuestionIndex]?.options.map((opt: string, idx: number) => (
                                                <button
                                                    type="button"
                                                    key={idx}
                                                    onClick={() => handleAnswerQuestion(idx)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all text-xs font-bold leading-normal flex items-start gap-3 cursor-pointer ${selectedOption === idx ? 'bg-indigo-50 border-indigo-500 text-indigo-750 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                                >
                                                    <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold ${selectedOption === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span>{opt}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                                            <Button variant="ghost" onClick={() => setActiveQuizMode(false)} className="flex-1 border text-xs text-slate-500 hover:bg-slate-50">Sair do Desafio</Button>
                                            <Button variant="primary" onClick={handleNextQuestion} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider">Responder</Button>
                                        </div>
                                    </>
                                ) : quizComplete ? (
                                    /* SUCESSO DO DESAFIO BÍBLICO */
                                    <div className="text-center py-6 animate-entrance">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-lg">
                                            <CheckCheck size={40} className="animate-bounce" />
                                        </div>
                                        <h3 className="font-serif text-3xl font-black text-slate-800 leading-none">Desafio Vencido!</h3>
                                        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto font-medium">Você concluiu com maestria o estudo bíblico deste capítulo com pontuação de {quizScore} de 3!</p>
                                        
                                        <div className="mt-6 inline-block bg-amber-50 px-5 py-3 rounded-2xl border border-amber-200 text-center font-bold">
                                            <span className="text-[10px] block font-black uppercase text-amber-700 tracking-widest">Recompensa Obtida</span>
                                            <span className="text-2xl font-serif font-black text-amber-800">+100 PONTOS XP</span>
                                        </div>

                                        <div className="flex gap-4 mt-8 max-w-sm mx-auto">
                                            <Button variant="primary" onClick={() => { setActiveQuizMode(false); }} className="w-full bg-slate-900 hover:bg-slate-900/90 text-white font-black text-xs uppercase tracking-wider">Voltar para Leitura</Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* FALHA DO DESAFIO BÍBLICO */
                                    <div className="text-center py-6 animate-entrance">
                                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-300 shadow-lg">
                                            <AlertTriangle size={40} />
                                        </div>
                                        <h3 className="font-serif text-3xl font-black text-slate-800 leading-none font-sans">Estude um Pouco Mais</h3>
                                        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto font-medium">Você alcançou {quizScore} de 3 acertos nesta tentativa. Releia atentamente os esboços e comentários e tente o teste novamente.</p>

                                        <div className="flex gap-4 mt-8 max-w-sm mx-auto">
                                            <Button variant="ghost" onClick={() => setActiveQuizMode(false)} className="flex-1 border border-slate-200 text-xs">Voltar para Leitura</Button>
                                            <Button variant="primary" onClick={handleStartQuiz} className="flex-1 bg-amber-500 hover:bg-amber-600 font-extrabold text-xs text-white uppercase tracking-wider">Tentar Novamente</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : readingPages.length > 0 ? (
                    <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn relative">
                        {/* BARRA SUPERIOR DE AÇÕES DO CAPÍTULO E BANCO OFFLINE */}
                        <div className="bg-white/90 backdrop-blur-md border-b border-[#e5e0d8] px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={!selectedChapter || selectedChapter <= 1}
                                    onClick={() => selectedBook && selectedChapter && handleSelectChapter(selectedBook, selectedChapter - 1)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                                    title="Capítulo Anterior"
                                >
                                    <ChevronLeft size={14} /> <span className="hidden sm:inline">Cap. Anterior</span>
                                </button>
                                <span className="font-serif font-black text-sm md:text-base text-slate-900 px-2">
                                    {selectedBook?.name} {selectedChapter}
                                </span>
                                <button
                                    type="button"
                                    disabled={!selectedBook || !selectedChapter || selectedChapter >= selectedBook.chapters}
                                    onClick={() => selectedBook && selectedChapter && handleSelectChapter(selectedBook, selectedChapter + 1)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                                    title="Próximo Capítulo"
                                >
                                    <span className="hidden sm:inline">Próximo Cap.</span> <ChevronRight size={14} />
                                </button>
                            </div>

                            {/* Abas rápidas de seção da apostila/capítulo */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                    studySource === 'offline_db'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {studySource === 'offline_db' ? <Database size={11} /> : <Sparkles size={11} />}
                                    {studySource === 'offline_db' ? 'Banco da Bíblia Offline' : 'Estudo Enriquecido IA'}
                                </span>

                                {studySource === 'offline_db' && isOnline && (
                                    <button
                                        type="button"
                                        disabled={isGeneratingAiUpgrade}
                                        onClick={handleEnhanceCurrentChapterWithAI}
                                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                        title="Complementar o esboço deste capítulo usando IA Online"
                                    >
                                        {isGeneratingAiUpgrade ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                        <span>{isGeneratingAiUpgrade ? 'Gerando...' : 'Complementar c/ IA'}</span>
                                    </button>
                                )}

                                {studySource === 'ai_enhanced' && (
                                    <button
                                        type="button"
                                        onClick={() => selectedBook && selectedChapter && handleSelectChapter(selectedBook, selectedChapter, selectedTranslation, true)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                        title="Voltar para o estudo instantâneo do Banco da Bíblia Offline"
                                    >
                                        <RefreshCw size={11} />
                                        <span>Usar Banco Offline</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleProjectEntireChapterToTelao}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="Carregar todos os versículos deste capítulo como slides no Telão Holyrics"
                                >
                                    <Monitor size={11} />
                                    <span>Projetar Capítulo no Telão</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsReadingMode(true)}
                                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Modo Leitura de Tela Cheia"
                                >
                                    <BookOpen size={15}/>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { copyToClipboard(readingData); addToast("Estudo completo copiado!", "success"); }}
                                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Copiar Estudo Completo"
                                >
                                    <Copy size={15}/>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                            <div className="max-w-3xl mx-auto bg-[#faf8f5] shadow-[0_10px_40px_rgba(0,0,0,0.05)] rounded-sm border border-[#e5e0d8] p-8 md:p-14 relative font-serif">
                                
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-6 pb-4 border-b-2 border-slate-800/10">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {selectedBook?.name || ''} • Capítulo {selectedChapter}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {selectedBook && (completedChapters.includes(`${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${selectedChapter}`) || completedChapters.includes(`${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${selectedChapter}_${selectedTranslation.toLowerCase()}`)) && (
                                            <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">★ ESTUDADO</span>
                                        )}
                                        <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded shadow-sm uppercase font-sans">
                                            {selectedTranslation}
                                        </span>
                                    </div>
                                </div>

                                {/* Navegação rápida entre as seções do capítulo (Texto Bíblico / Contexto / Esboço / Conclusão) */}
                                <div className="flex flex-wrap gap-1.5 mb-6 font-sans">
                                    {readingPages.map((pg, idx) => {
                                        let label = `Texto (${idx + 1})`;
                                        if (pg.includes('Contexto Histórico')) label = '📚 Contexto & Doutrina';
                                        else if (pg.includes('Esboço Homilético')) label = '📝 Esboço do Pregador';
                                        else if (pg.includes('Conclusão e Aplicação')) label = '💡 Conclusão & Aplicação';

                                        return (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => setCurrentReadingPage(idx)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                                    currentReadingPage === idx
                                                        ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="prose prose-lg max-w-none prose-slate font-serif animate-entrance">
                                    {renderFormattedStudyPage(readingPages[currentReadingPage], false)}
                                </div>

                                {/* CARD DO DESAFIO NO FIM DA LEITURA */}
                                {currentReadingPage === readingPages.length - 1 && (
                                    <div className="mt-12 border-t-2 border-dashed border-amber-600/20 pt-8 animate-entrance">
                                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 md:p-8 text-center max-w-lg mx-auto shadow-sm">
                                            <Award size={36} className="text-amber-500 mx-auto mb-3 animate-bounce" />
                                            <h4 className="font-serif text-xl font-black text-slate-800 leading-tight">Estudo de Compreensão Bíblica</h4>
                                            <p className="text-slate-500 text-xs mt-2 font-medium max-w-sm mx-auto font-sans">Você completou todos os esboços e tópicos explicativos de {selectedBook?.name || ''} {selectedChapter}. Coloque à prova seus conhecimentos para ganhar +100 XP!</p>
                                            
                                            <button
                                                type="button"
                                                onClick={handleStartQuiz}
                                                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all font-sans cursor-pointer"
                                            >
                                                🏆 Iniciar Desafio Bíblico
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                            </div>
                        </div>

                        {/* CONTROLES DE PAGINAÇÃO DO LIVRO */}
                        <div className="bg-[#faf8f5] border-t border-[#e5e0d8] p-4 md:px-12 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0 z-10">
                            <Button 
                                onClick={() => setCurrentReadingPage(p => Math.max(0, p - 1))} 
                                disabled={currentReadingPage === 0}
                                variant="ghost"
                                className="border border-slate-300 bg-white hover:bg-amber-50 text-slate-600"
                            >
                                <ChevronLeft size={18}/> <span className="hidden sm:inline font-sans font-bold">Página Anterior</span>
                            </Button>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-slate-700 font-serif">
                                    {currentReadingPage + 1} <span className="text-slate-400 font-medium font-sans">de</span> {readingPages.length}
                                </span>
                                <div className="flex gap-1 mt-1">
                                    {readingPages.map((_, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentReadingPage ? 'bg-amber-600' : 'bg-slate-300'}`}></div>
                                    ))}
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => setCurrentReadingPage(p => Math.min(readingPages.length - 1, p + 1))} 
                                disabled={currentReadingPage === readingPages.length - 1}
                                variant="primary"
                                className="shadow-amber-600/30 bg-gradient-to-r from-amber-600 to-orange-600 border-0"
                            >
                                <span className="hidden sm:inline font-sans font-black text-xs uppercase tracking-widest">Próxima Página</span> <ChevronRight size={18}/>
                            </Button>
                        </div>

                        {/* FULL SCREEN READING OVERLAY */}
                        {isReadingMode && (
                            <div className={`fixed inset-0 z-[20000] flex flex-col overflow-hidden animate-fadeIn ${
                                readingContrast === 'high' ? 'bg-black text-white' : 
                                readingContrast === 'sepia' ? 'bg-[#f4eccf] text-[#433422]' : 
                                'bg-[#f4f1ea] text-slate-900'
                            }`}>
                                {/* Control Panel Bar */}
                                <div className="border-b border-white/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md bg-slate-900 text-white select-none shrink-0">
                                    <div className="flex items-center gap-3 text-left">
                                        <BookOpen className="text-amber-500" size={24}/>
                                        <div>
                                            <h3 className="font-serif text-lg font-black tracking-wide uppercase leading-none">{selectedBook?.name} {selectedChapter}</h3>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider font-bold">Página {currentReadingPage + 1} de {readingPages.length} • Modo Leitura Expandido</p>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-wrap items-center gap-6 text-xs font-black uppercase tracking-wider">
                                        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/10">
                                            <button 
                                                type="button"
                                                onClick={() => setReadingFontSize(f => Math.max(14, f - 2))} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors font-mono"
                                                title="Diminuir Fonte"
                                            >
                                                A-
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setReadingFontSize(20)} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Tamanho Padrão"
                                            >
                                                A
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setReadingFontSize(f => Math.min(36, f + 2))} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors font-mono"
                                                title="Aumentar Fonte"
                                            >
                                                A+
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
                                            <button 
                                                type="button"
                                                onClick={() => setReadingContrast('normal')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'normal' ? 'bg-amber-500 text-slate-950' : 'hover:bg-white/10'}`}
                                            >
                                                Padrão
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setReadingContrast('sepia')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'sepia' ? 'bg-[#433422] text-[#f4eccf]' : 'hover:bg-white/10'}`}
                                            >
                                                Sépia
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setReadingContrast('high')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'high' ? 'bg-white text-slate-950 border border-white' : 'hover:bg-white/10'}`}
                                            >
                                                Contraste
                                            </button>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={() => setIsReadingMode(false)} 
                                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md active:scale-95"
                                        >
                                            <X size={16}/> Sair
                                        </button>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="flex-1 overflow-y-auto p-8 md:p-16 flex justify-center custom-scrollbar">
                                    <div className="max-w-3xl w-full select-text leading-relaxed font-serif transition-all pb-24 text-left" style={{ fontSize: `${readingFontSize}px` }}>
                                        {renderFormattedStudyPage(readingPages[currentReadingPage], true)}
                                    </div>
                                </div>

                                {/* Footer Navigation Bar */}
                                <div className="border-t border-white/10 px-8 py-4 flex justify-between items-center shrink-0 z-10 select-none bg-slate-900 text-white">
                                    <Button 
                                        onClick={() => setCurrentReadingPage(p => Math.max(0, p - 1))} 
                                        disabled={currentReadingPage === 0}
                                        variant="ghost"
                                        className="border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                    >
                                        <ChevronLeft size={18}/> <span className="font-sans font-bold text-xs uppercase tracking-wider">Anterior</span>
                                    </Button>
                                    
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-black font-serif">
                                            {currentReadingPage + 1} <span className="text-slate-400 font-medium font-sans">de</span> {readingPages.length}
                                        </span>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => setCurrentReadingPage(p => Math.min(readingPages.length - 1, p + 1))} 
                                        disabled={currentReadingPage === readingPages.length - 1}
                                        variant="primary"
                                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 border-0 font-sans font-black text-xs uppercase tracking-widest"
                                    >
                                        Próxima <ChevronRight size={18}/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* TELA INICIAL DA BÍBLIA DE ESTUDO COM ACESSO RÁPIDO AO BANCO OFFLINE */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 overflow-y-auto">
                        <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-700 shadow-sm">
                            <Book size={44} />
                        </div>
                        <h3 className="font-serif text-3xl font-black text-slate-800 mb-2">Bíblia de Estudo do Pregador</h3>
                        <p className="text-slate-600 max-w-md text-sm">
                            Integrada ao nosso <strong>Banco da Bíblia Offline</strong> com todos os <strong>66 livros, 1.189 capítulos e 31.102 versículos</strong> (Almeida Revista e Corrigida — CPAD / CGADB).
                        </p>

                        {/* Atalhos Rápidos de Capítulos Clássicos no Banco Offline */}
                        <div className="mt-6 max-w-xl w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                ⚡ Acesso Instantâneo — Capítulos mais Estudados (Banco Offline)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { name: 'Gênesis', chapters: 50, cap: 1, label: 'Gênesis 1 • A Criação' },
                                    { name: 'Salmos', chapters: 150, cap: 23, label: 'Salmos 23 • O Bom Pastor' },
                                    { name: 'Salmos', chapters: 150, cap: 91, label: 'Salmos 91 • Proteção' },
                                    { name: 'Isaías', chapters: 66, cap: 53, label: 'Isaías 53 • O Messias' },
                                    { name: 'João', chapters: 21, cap: 3, label: 'João 3 • Novo Nascimento' },
                                    { name: 'Atos', chapters: 28, cap: 2, label: 'Atos 2 • Pentecostes' },
                                    { name: 'Romanos', chapters: 16, cap: 8, label: 'Romanos 8 • Vida no Espírito' },
                                    { name: '1 Coríntios', chapters: 16, cap: 13, label: '1 Coríntios 13 • O Amor' },
                                    { name: 'Apocalipse', chapters: 22, cap: 21, label: 'Apocalipse 21 • Novo Céu' },
                                ].map((quick) => (
                                    <button
                                        type="button"
                                        key={`${quick.name}_${quick.cap}`}
                                        onClick={() => handleSelectChapter({ name: quick.name, chapters: quick.chapters }, quick.cap, selectedTranslation, true)}
                                        className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all shadow-xs cursor-pointer group"
                                    >
                                        <span className="block text-xs font-black text-slate-800 group-hover:text-amber-800 truncate">
                                            {quick.label}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                                            <Database size={10} /> Abrir Offline
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>
                                Banco da Bíblia Offline Ativo: 66 Livros • 1.189 Capítulos • 31.102 Versículos prontos para leitura e projeção
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleBiblia;
