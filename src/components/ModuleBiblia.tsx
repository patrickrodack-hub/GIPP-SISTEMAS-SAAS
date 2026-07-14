import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  BookOpen, ChevronDown, ChevronRight, ChevronLeft, Award, HelpCircle, 
  Loader2, DownloadCloud, Copy, Book, TrendingUp, User, Star, CheckCheck, AlertTriangle, X
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

// Mapeamento de Livros em Português para Inglês para a API gratuita bible-api.com
const PORTUGUESE_TO_ENGLISH_BOOKS: Record<string, string> = {
    'Gênesis': 'Genesis', 'Êxodo': 'Exodus', 'Levítico': 'Leviticus',
    'Números': 'Numbers', 'Deuteronômio': 'Deuteronomy', 'Josué': 'Joshua',
    'Juízes': 'Judges', 'Rute': 'Ruth', '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel', '1 Reis': '1 Kings', '2 Reis': '2 Kings',
    '1 Crônicas': '1 Chronicles', '2 Crônicas': '2 Chronicles', 'Esdras': 'Ezra',
    'Neemias': 'Nehemiah', 'Ester': 'Esther', 'Jó': 'Job',
    'Salmos': 'Psalms', 'Provérbios': 'Proverbs', 'Eclesiastes': 'Ecclesiastes',
    'Cânticos': 'Song of Solomon', 'Isaías': 'Isaiah', 'Jeremias': 'Jeremiah',
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

// Função para buscar texto na API gratuita do bible-api.com com tradução Almeida (JFA)
const fetchFreeBibleText = async (bookName: string, chapter: number): Promise<string> => {
    const englishBook = PORTUGUESE_TO_ENGLISH_BOOKS[bookName] || bookName;
    try {
        const url = `https://bible-api.com/${encodeURIComponent(englishBook)}+${chapter}?translation=almeida`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.verses && data.verses.length > 0) {
                return data.verses.map((v: any) => `**${v.verse}** ${v.text.trim()}`).join('\n\n');
            }
        }
    } catch (e) {
        console.error("Erro ao carregar texto da Bíblia gratuita:", e);
    }
    return "";
};

// Gerador de Estudo e Esboço Local Inteligente de Contingência
const generateLocalStudy = (bookName: string, chapter: number, bibleText: string): string => {
    return `[TEXTO]
# 📖 ${bookName} ${chapter} (Almeida)

${bibleText || "Texto bíblico temporariamente indisponível. Por favor, verifique sua conexão com a internet."}

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico de ${bookName}
Este capítulo faz parte do livro de ${bookName}. O estudo e a leitura de cada capítulo ampliam nossa compreensão doutrinária sobre a Revelação Divina e a providência do Senhor para com Seu povo, em consonância com a Declaração de Fé da denominação.

Ao lermos ${bookName} capítulo ${chapter}, somos convidados a meditar nos ensinamentos eternos do Senhor, compreendendo as exortações práticas, os eventos históricos e as promessas de salvação e edificação que se cumprem na comunhão da Igreja.

[ESBOCO]
## 📝 Esboço Homilético para ${bookName} ${chapter}
**Tema Sugerido:** Aliança, Fidelidade e Edificação em ${bookName}
**Texto-Base:** ${bookName} ${chapter}

**I. Buscando a Vontade Divina**
- A importância de se submeter à vontade de Deus revelada nas Escrituras.
- Aplicação prática de fidelidade no testemunho cristão diário.

**II. Perseverança em Meio às Provações**
- Como a fé viva nos fortalece para superar as adversidades e crescer na graça.
- Oração incessante e confiança inabalável nas promessas do Altíssimo.

**III. O Caminho de Santificação e Serviço**
- O compromisso de servir ao próximo e glorificar a Deus com nossas ações e palavras.
- Santidade pessoal e dedicação à obra do Reino.

[CONCLUSAO]
## 💡 Conclusão e Aplicação Prática
O estudo detalhado de ${bookName} ${chapter} nos ensina que a Palavra de Deus é viva, eficaz e apta a guiar cada passo do crente sincero. Que possamos guardar estas verdades em nossos corações, servindo à Igreja do Senhor com dedicação, alegria e reverência.

[QUIZ]
[
  {
    "q": "Qual é a atitude do coração que mais edifica ao ler, pregar ou estudar as Escrituras Sagradas em ${bookName} ${chapter}?",
    "options": [
      "Efetuar a leitura de forma rápida, puramente acadêmica ou fria",
      "Meditar profundamente com espírito submisso, aplicando os preceitos éticos na retidão e prática diária",
      "Desprezar o estudo histórico das notas ou debater vazios literários",
      "Simplesmente acumular pontos para autoafirmação teológica"
    ],
    "answer": 1
  },
  {
    "q": "Segundo as exposições teológicas, de que forma o crente sincero obtém crescimento e edificação espiritual?",
    "options": [
      "Dedicando-se à leitura assídua das escrituras, comunhão viva na igreja, oração e Escola Dominical",
      "Afastando-se de qualquer tipo de comunhão pastoral ou eclesiástica",
      "Debatendo apenas as traduções gregas sem demonstrar amor ao irmão",
      "Não assumindo nenhum compromisso litúrgico"
    ],
    "answer": 0
  },
  {
    "q": "Qual o principal propósito para o estudo sistematizado dos Esboços de Pregação gerados no livro de ${bookName}?",
    "options": [
      "Capacitar o obreiro e o crente a compreender e anunciar em fidelidade as mensagens eternas de Deus",
      "Disputar com outras igrejas em retórica teórica fria",
      "Estimular discussões vazias sobre versos soltos",
      "Excluir-se de cultos pastorais presenciais"
    ],
    "answer": 0
  }
]`;
};

// Exporting component
const ModuleBiblia = () => {
    const { db, setDoc, doc, dbFirestore, appId, user, addToast, isOnline } = useContext(ChurchContext);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [readingData, setReadingData] = useState<any>(null); // Text and Study
    const [readingPages, setReadingPages] = useState<string[]>([]); // NOVO: Paginação
    const [currentReadingPage, setCurrentReadingPage] = useState<number>(0); // NOVO: Paginação
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
    const [readingFontSize, setReadingFontSize] = useState<number>(20);
    const [readingContrast, setReadingContrast] = useState<'normal' | 'high' | 'sepia'>('normal');

    // Recursos de Caching & Modo Offline
    const [cachedChapters, setCachedChapters] = useState<Set<string>>(new Set());
    const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

    // Estados de Gamificação (Modo Gremiaçao/Estudos)
    const [sidebarTab, setSidebarTab] = useState<'books' | 'achievements'>('books');
    const [currentQuizQuestions, setCurrentQuizQuestions] = useState<any[] | null>(null);
    const [activeQuizMode, setActiveQuizMode] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState<number>(0);
    const [quizComplete, setQuizComplete] = useState<boolean>(false);
    const [quizFailed, setQuizFailed] = useState<boolean>(false);

    const updateCachedChapters = async () => {
        try {
            const keys = await getAllKeys();
            const bibleKeys = keys.filter(k => k.startsWith('bible_study_'));
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
                    console.log(`[Backup Bíblico] ${docAdded} capítulos de estudos bíblicos novos sincronizados para acesso offline do portal!`);
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

    const vtBooks = BIBLE_BOOKS.filter(b => b.test === 'VT');
    const ntBooks = BIBLE_BOOKS.filter(b => b.test === 'NT');

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
            // Fallback default quiz
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

        // Unir todas as páginas (Texto 1..N, Contexto, Esboço, Conclusão)
        return [
            ...textPages,
            contexto,
            esboco,
            conclusao
        ].filter(page => page && page.trim() !== '');
    };

    const handleSelectChapter = async (book: any, chapter: number) => {
        setSelectedChapter(chapter);
        setIsLoading(true);
        setReadingData(null);
        setReadingPages([]);
        setCurrentReadingPage(0);
        setActiveQuizMode(false);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setQuizScore(0);
        setQuizComplete(false);
        setQuizFailed(false);

        const cacheKey = `bible_study_${book.name.toLowerCase().replace(/\s+/g, '_')}_${chapter}`;
        
        try {
            // Tenta obter primeiro do cache offline IndexedDB
            const cachedStudy = await getMedia(cacheKey);
            if (cachedStudy) {
                const parsedPages = parseStudyContent(cachedStudy);
                setReadingPages(parsedPages);
                setReadingData(cachedStudy);
                setIsLoading(false);
                return;
            }

            // Busca texto sagrado na API gratuita para economizar créditos e evitar cota esgotada da IA
            let bibleText = "";
            if (isOnline) {
                bibleText = await fetchFreeBibleText(book.name, chapter);
            }

            // Tenta IA se houver conexão e chave configurada, senão usa o gerador local imediato
            let result = "";
            if (isOnline) {
                const prompt = `Atue como a Bíblia Sagrada na versão Almeida e como a Bíblia de Estudo do Pregador (CPAD). O usuário deseja estudar: ${book.name} capítulo ${chapter}.
                
${bibleText ? `O texto bíblico completo do capítulo (Almeida) é o seguinte:\n${bibleText}\n\n` : `Por favor, transcreva o texto bíblico completo de ${book.name} capítulo ${chapter}.\n\n`}

POR FAVOR, SIGA ESTA ESTRUTURA RIGOROSAMENTE EM MARKDOWN E USE AS TAGS ABAIXO PARA SEPARAR CADA SEÇÃO:

[TEXTO]
# 📖 ${book.name} ${chapter} (Almeida)
${bibleText ? bibleText : `[Transcreva aqui o texto bíblico completo, separando os versículos por quebra de linha com números em negrito, ex: **1** No princípio...]`}

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico
[Explique brevemente o cenário deste capítulo e sua consonância doutrinária na teologia pentecostal tradicional]

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
[Escreva uma lista com exatamente 3 perguntas de múltipla escolha baseadas rigorosamente no texto bíblico e notas de estudo geradas acima, no formato JSON estrito, sem textos adicionais antes ou depois da lista JSON. Exemplo de formato:
[
  {
    "q": "Qual é a primeira pergunta?",
    "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    "answer": 0
  },
  {
    "q": "Qual é a segunda pergunta?",
    "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    "answer": 1
  },
  {
    "q": "Qual é a terceira pergunta?",
    "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    "answer": 2
  }
]
]`;

                try {
                    result = await callGeminiAI(prompt, 2);
                } catch (e) {
                    console.warn("Erro ao chamar Gemini AI no estudo do capítulo:", e);
                }
            }

            // Contingência / Modo Offline sem Cache ou sem Chave de API
            if (!result || result.trim() === "" || result.startsWith("Erro na IA:")) {
                if (bibleText) {
                    result = generateLocalStudy(book.name, chapter, bibleText);
                } else if (!isOnline) {
                    addToast("Este capítulo não está disponível offline. Conecte-se à internet para carregá-lo.", "warning");
                    setIsLoading(false);
                    return;
                } else {
                    throw new Error("Não foi possível obter o texto sagrado.");
                }
            }
            
            // Grava no IndexedDB automaticamente para uso offline futuro
            await storeMedia(cacheKey, result);

            // Grava compartilhado no Firestore para que todos os membros tenham acesso imediato offline!
            if (dbFirestore && appId) {
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'biblia_estudo_cache', cacheKey), {
                        key: cacheKey,
                        content: result,
                        bookName: book.name,
                        chapter: chapter,
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
            addToast("Falha ao buscar o capítulo bíblico com a API.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadBookOffline = async (book: any) => {
        if (!isOnline) {
            addToast("Você precisa de conexão à Internet para fazer o download.", "warning");
            return;
        }
        if (downloadingBook) {
            addToast("Já existe um download em andamento.", "info");
            return;
        }

        setDownloadingBook(book.name);
        setDownloadProgress({ current: 1, total: book.chapters });
        addToast(`Iniciando download completo de ${book.name} (${book.chapters} capítulos) com API Gratuita e IA de Estudo...`, "info");

        let successCount = 0;
        
        for (let cap = 1; cap <= book.chapters; cap++) {
            setDownloadProgress({ current: cap, total: book.chapters });
            const cacheKey = `bible_study_${book.name.toLowerCase().replace(/\s+/g, '_')}_${cap}`;
            
            try {
                const cached = await getMedia(cacheKey);
                if (cached) {
                    successCount++;
                    continue;
                }

                // Busca texto sagrado na API gratuita
                const bibleText = await fetchFreeBibleText(book.name, cap);

                // Tenta IA se houver conexão, senão gera estudo local rápido e economiza cota
                let result = "";
                const prompt = `Atue como a Bíblia Sagrada na versão Almeida e como a Bíblia de Estudo do Pregador (CPAD). O usuário deseja estudar: ${book.name} capítulo ${cap}.
                
${bibleText ? `O texto bíblico completo do capítulo (Almeida) é o seguinte:\n${bibleText}\n\n` : `Por favor, transcreva o texto bíblico completo de ${book.name} capítulo ${cap}.\n\n`}

POR FAVOR, SIGA ESTA ESTRUTURA RIGOROSAMENTE EM MARKDOWN E USE AS TAGS ABAIXO PARA SEPARAR CADA SEÇÃO:

[TEXTO]
# 📖 ${book.name} ${cap} (Almeida)
${bibleText ? bibleText : `[Transcreva aqui o texto bíblico completo, separando os versículos por quebra de linha com números em negrito, ex: **1** No princípio...]`}

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico
[Explique brevemente o cenário deste capítulo]

[ESBOCO]
## 📝 Esboço Homilético
**Tema Sugerido:** [Tema sobre este capítulo]
**Texto-Base:** [Versão homilética do capítulo]

**I. [Primeiro Tópico Principal]**
- [Breve explicação]

**II. [Segundo Tópico Principal]**
- [Breve explicação]

**III. [Terceiro Tópico Principal]**
- [Breve explicação]

[CONCLUSAO]
## 💡 Conclusão e Aplicação
[Resumo de como aplicar a mensagem hoje na igreja]

[QUIZ]
[Escreva exatamente 3 perguntas de múltipla escolha baseadas rigorosamente no texto bíblico e notas de estudo, em JSON estrito. Exemplo:
[
  {
    "q": "Qual é a pergunta?",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "answer": 0
  },
  ... (repetir 3 vezes)
]
]`;

                try {
                    result = await callGeminiAI(prompt, 1); // 1 tentativa apenas em lotes para alta performance
                } catch (e) {
                    console.warn(`Erro IA ao pré-baixar capítulo ${cap} de ${book.name}:`, e);
                }

                if (!result || result.trim() === "" || result.startsWith("Erro na IA:")) {
                    result = generateLocalStudy(book.name, cap, bibleText);
                }

                if (result) {
                    await storeMedia(cacheKey, result);

                    // Sincroniza sincronamente com a nuvem para toda a membresia do portal usar
                    if (dbFirestore && appId) {
                        try {
                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'biblia_estudo_cache', cacheKey), {
                                key: cacheKey,
                                content: result,
                                bookName: book.name,
                                chapter: cap,
                                cachedBy: user?.nome || 'Membro',
                                createdAt: new Date().toISOString()
                            });
                        } catch (e) {
                            console.error("Erro no download compartilhado no Firestore:", e);
                        }
                    }

                    successCount++;
                }
                
                // Leve atraso para consistência nas requisições da API
                await new Promise(r => setTimeout(r, 200));
            } catch (err) {
                console.error(`Erro ao pré-baixar o capítulo ${cap} de ${book.name}:`, err);
            }
        }

        addToast(`Download concluído! ${successCount} de ${book.chapters} capítulos de ${book.name} salvos offline localmente e no portal!`, "success");
        setDownloadingBook(null);
        updateCachedChapters();
    };

    // Metricas do perfil de gamificação
    const profile = db.membros?.find((m: any) => m.id === user?.id) || user || {};
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
            // Fim do Quiz
            if (newScore >= 2) {
                // Aprovado (70% ou mais)
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

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 animate-entrance bg-[#f4f1ea] rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* SIDEBAR DE NAVEGAÇÃO (ÍNDICE) */}
            <div className="w-full md:w-80 bg-white border-r border-[#e5e0d8] flex flex-col shrink-0 z-10 h-1/3 md:h-full shadow-md">
                <div className="p-6 bg-slate-900 text-[#f4f1ea] border-b-4 border-amber-600 flex flex-col items-center text-center shrink-0 relative">
                    <BookOpen size={36} className="text-amber-500 mb-2"/>
                    <h2 className="font-serif text-2xl font-black uppercase tracking-widest leading-none">Bíblia de Estudo</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 font-bold">NVI • Edição do Pregador</p>
                    
                    {!isOnline && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Offline
                        </div>
                    )}
                </div>

                {/* TAB SELECTOR DA BARRA LATERAL (MODO DIRETO / GAMIFICAÇÃO) */}
                <div className="flex bg-slate-100 border-b border-[#e5e0d8] p-1.5 gap-1 select-none text-[11px] font-bold tracking-wider uppercase">
                    <button 
                        onClick={() => setSidebarTab('books')}
                        className={`flex-1 py-2 rounded-lg text-center transition-all ${sidebarTab === 'books' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        📖 Livros
                    </button>
                    <button 
                        onClick={() => setSidebarTab('achievements')}
                        className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${sidebarTab === 'achievements' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        🏆 Conquistas
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                    {sidebarTab === 'books' ? (
                        <>
                            {!selectedBook ? (
                                <div className="space-y-6 pb-6">
                                    <div>
                                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2">Antigo Testamento</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {vtBooks.map(b => (
                                                <button key={b.name} onClick={() => setSelectedBook(b)} className="text-left p-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-transparent hover:border-amber-200">
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2">Novo Testamento</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ntBooks.map(b => (
                                                <button key={b.name} onClick={() => setSelectedBook(b)} className="text-left p-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-transparent hover:border-amber-200">
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-entrance">
                                    <button onClick={() => { setSelectedBook(null); setSelectedChapter(null); setReadingData(null); setReadingPages([]); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 mb-4 px-2 py-1 bg-slate-50 rounded-lg w-full border border-slate-200">
                                        <ChevronLeft size={16}/> Voltar ao Índice
                                    </button>
                                    
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="font-serif text-2xl font-black text-slate-800">{selectedBook.name}</h3>
                                        {downloadingBook === selectedBook.name ? (
                                            <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                                <Loader2 size={10} className="animate-spin" />
                                                <span>{downloadProgress.current}/{downloadProgress.total}</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleDownloadBookOffline(selectedBook)} 
                                                className="text-xs flex items-center gap-1 font-bold text-amber-600 hover:text-amber-750 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors shadow-xs"
                                                title="Baixar todos os capítulos deste livro para estudar offline"
                                            >
                                                <DownloadCloud size={14} /> <span className="hidden sm:inline">Baixar Livro</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-5 gap-2">
                                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(cap => {
                                            const keyToCheck = `${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${cap}`;
                                            const isStudied = completedChapters.includes(keyToCheck);
                                            const cacheKey = `bible_study_${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${cap}`;
                                            const isChapterCached = cachedChapters.has(cacheKey);
                                            return (
                                                <button 
                                                    key={cap} 
                                                    onClick={() => handleSelectChapter(selectedBook, cap)}
                                                    className={`relative aspect-square rounded-xl font-bold flex flex-col items-center justify-center transition-all border shadow-sm ${selectedChapter === cap ? 'bg-slate-900 text-white border-slate-900 scale-110' : 'bg-white text-slate-700 hover:bg-amber-100 hover:border-amber-300 border-slate-200'}`}
                                                >
                                                    <span className={`${isStudied ? "text-amber-500 line-through decoration-amber-500 mr-1" : ""}`}>{cap}</span>
                                                    {isChapterCached && (
                                                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500" title="Disponível Offline" />
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
                        <p className="text-slate-600 font-medium max-w-md">Gerando notas do pregador, comentários hermenêuticos e o desafio bíblico inteligente com o GIPP AI.</p>
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
                                                    key={idx}
                                                    onClick={() => handleAnswerQuestion(idx)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all text-xs font-bold leading-normal flex items-start gap-3 ${selectedOption === idx ? 'bg-indigo-50 border-indigo-500 text-indigo-750 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
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
                                        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto font-medium">Você concluiu com maestria o estudo bíblico deste capítulo com pontuação de **{quizScore} de 3**!</p>
                                        
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
                                        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto font-medium">Você alcançou **{quizScore} de 3** acertos nesta tentativa. Releia atentamente os esboços e comentários e tente o teste novamente.</p>

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
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                            <div className="max-w-3xl mx-auto bg-[#faf8f5] shadow-[0_10px_40px_rgba(0,0,0,0.05)] rounded-sm border border-[#e5e0d8] p-8 md:p-14 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-[1px]/50 font-serif">
                                
                                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-800/10">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedBook?.name || ''} • Capítulo {selectedChapter}</span>
                                    {selectedBook && completedChapters.includes(`${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${selectedChapter}`) && (
                                        <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">★ ESTUDADO</span>
                                    )}
                                    <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded shadow-sm">NVI</span>
                                </div>

                                <div className="prose prose-lg md:prose-xl max-w-none prose-slate font-serif prose-headings:font-black prose-headings:text-slate-900 prose-p:leading-loose prose-strong:text-slate-900 prose-a:text-amber-600 marker:text-amber-500 whitespace-pre-wrap animate-entrance">
                                    {readingPages[currentReadingPage]}
                                </div>

                                {/* CARD DO DESAFIO NO FIM DA LEITURA */}
                                {currentReadingPage === readingPages.length - 1 && (
                                    <div className="mt-12 border-t-2 border-dashed border-amber-600/20 pt-8 animate-entrance">
                                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 md:p-8 text-center max-w-lg mx-auto shadow-sm">
                                            <Award size={36} className="text-amber-500 mx-auto mb-3 animate-bounce" />
                                            <h4 className="font-serif text-xl font-black text-slate-800 leading-tight">Estudo de Compreensão Bíblica</h4>
                                            <p className="text-slate-500 text-xs mt-2 font-medium max-w-sm mx-auto font-sans">Você completou todos os esboços e tópicos explicativos de {selectedBook?.name || ''} {selectedChapter}. Coloque à prova seus conhecimentos para ganhar **+100 XP**!</p>
                                            
                                            <button
                                                onClick={handleStartQuiz}
                                                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all font-sans"
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
                        
                        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20 flex gap-2">
                             <button onClick={() => setIsReadingMode(true)} className="p-3 bg-white border border-slate-300 rounded-full text-slate-600 hover:text-amber-600 hover:bg-amber-50 shadow-lg transition-colors" title="Modo Leitura de Tela Cheia"><BookOpen size={20}/></button>
                             <button onClick={() => { copyToClipboard(readingData); addToast("Estudo completo copiado!", "success"); }} className="p-3 bg-white border border-slate-300 rounded-full text-slate-600 hover:text-amber-600 hover:bg-amber-50 shadow-lg transition-colors" title="Copiar Estudo Completo"><Copy size={20}/></button>
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
                                        {/* Font Size Adjusters */}
                                        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/10">
                                            <button 
                                                onClick={() => setReadingFontSize(f => Math.max(14, f - 2))} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors font-mono"
                                                title="Diminuir Fonte"
                                            >
                                                A-
                                            </button>
                                            <button 
                                                onClick={() => setReadingFontSize(20)} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Tamanho Padrão"
                                            >
                                                A
                                            </button>
                                            <button 
                                                onClick={() => setReadingFontSize(f => Math.min(36, f + 2))} 
                                                className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors font-mono"
                                                title="Aumentar Fonte"
                                            >
                                                A+
                                            </button>
                                        </div>

                                        {/* Contrast Choices */}
                                        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
                                            <button 
                                                onClick={() => setReadingContrast('normal')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'normal' ? 'bg-amber-500 text-slate-950' : 'hover:bg-white/10'}`}
                                            >
                                                Padrão
                                            </button>
                                            <button 
                                                onClick={() => setReadingContrast('sepia')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'sepia' ? 'bg-[#433422] text-[#f4eccf]' : 'hover:bg-white/10'}`}
                                            >
                                                Sépia
                                            </button>
                                            <button 
                                                onClick={() => setReadingContrast('high')} 
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${readingContrast === 'high' ? 'bg-white text-slate-950 border border-white' : 'hover:bg-white/10'}`}
                                            >
                                                Contraste
                                            </button>
                                        </div>

                                        {/* Exit button */}
                                        <button 
                                            onClick={() => setIsReadingMode(false)} 
                                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md active:scale-95"
                                        >
                                            <X size={16}/> Sair
                                        </button>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="flex-1 overflow-y-auto p-8 md:p-16 flex justify-center custom-scrollbar">
                                    <div className="max-w-3xl w-full select-text leading-relaxed font-serif whitespace-pre-wrap transition-all pb-24 text-left" style={{ fontSize: `${readingFontSize}px` }}>
                                        {readingPages[currentReadingPage]}
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
                                        className="bg-amber-500 hover:bg-amber-600 text-slate-955 border-0 font-sans font-black text-xs uppercase tracking-widest"
                                    >
                                        Próxima <ChevronRight size={18}/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-70">
                        <Book size={80} className="text-amber-900/20 mb-6"/>
                        <h3 className="font-serif text-3xl font-black text-slate-800 mb-2">A Palavra Viva</h3>
                        <p className="text-slate-500 max-w-sm">Selecione um livro e um capítulo no índice lateral para iniciar a sua leitura e explorar os esboços do pregador.</p>
                        
                        {cachedChapters.size > 0 && (
                            <div className="mt-8 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-bold text-emerald-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {cachedChapters.size} {cachedChapters.size === 1 ? 'capítulo de estudo disponível' : 'capítulos de estudo disponíveis'} offline neste dispositivo
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleBiblia;
