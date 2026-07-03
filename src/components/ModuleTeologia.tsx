import React, { useState, useContext, useEffect } from 'react';
import { ChurchContext, Button, playMenuSound, playNotificationSound } from '../App';
import { 
    BookOpen, GraduationCap, ChevronRight, CheckCircle, Lock, Award, ArrowLeft, 
    Shield, Printer, Sparkles, Brain, Trash2, Download, Plus, Search, 
    BookOpenText, FileText, RotateCcw, Check, HelpCircle, Loader2, ClipboardList,
    Play, Pause, Volume2, X
} from 'lucide-react';
import { MODULES_TEOLOGIA } from '../data/ModuleTeologiaData';
import { jsPDF } from 'jspdf';

export default function ModuleTeologia() {
    const { db, user, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<number | null>(null);
    const [quizActive, setQuizActive] = useState<boolean>(false);
    
    // Real persistent progress tracking (Melhoria 1)
    const [courseProgress, setCourseProgress] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('gipp_teologia_progress');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [quizScore, setQuizScore] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('gipp_teologia_quiz_scores');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    
    // Quiz state
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

    // Audio Player States & Dynamic Voices (Melhoria 3)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedVoice, setSelectedVoice] = useState('default_pastor');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [audioProgress, setAudioProgress] = useState(0);

    // Dynamic voice population
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const updateVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                const ptVoices = voices.filter(v => v.lang.toLowerCase().startsWith('pt'));
                setAvailableVoices(ptVoices);
            };
            updateVoices();
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    // Certificate / Diploma Modal State
    const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
    const [certifiedCourse, setCertifiedCourse] = useState<any>(null);

    // E-Reader Specific States (Moved up to prevent hoisting errors)
    const [currentPage, setCurrentPage] = useState<number>(0);

    // Audio Speach Synthesis Controller
    useEffect(() => {
        if (!isPlayingAudio) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return;
        }

        let tempProgressInterval: any;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Extract textual contents to be read
            const contentElement = document.querySelector('.font-serif');
            const rawText = contentElement ? contentElement.textContent || '' : 'Iniciando leitura da aula teológica.';
            
            // Limit to avoid overflow
            const textToSpeak = rawText.substring(0, 1200);
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'pt-BR';
            utterance.rate = playbackSpeed;
            
            // Voice matching heuristics (Melhoria 3)
            const voices = window.speechSynthesis.getVoices();
            let matchedVoice = voices.find(v => v.name === selectedVoice);
            if (!matchedVoice) {
                matchedVoice = voices.find(v => v.lang.startsWith('pt'));
            }
            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            utterance.onend = () => {
                setIsPlayingAudio(false);
                setAudioProgress(100);
            };

            utterance.onerror = () => {
                setIsPlayingAudio(false);
            };

            // Simulating progressive bar for speech tracking
            let simProgress = 0;
            tempProgressInterval = setInterval(() => {
                simProgress += 1.5 * playbackSpeed;
                if (simProgress >= 100) {
                    clearInterval(tempProgressInterval);
                    simProgress = 100;
                }
                setAudioProgress(Math.floor(simProgress));
            }, 500);

            window.speechSynthesis.speak(utterance);
        } else {
            // Simulated Audio playback for unsupported clients
            let simProgress = 0;
            tempProgressInterval = setInterval(() => {
                simProgress += 2 * playbackSpeed;
                if (simProgress >= 100) {
                    clearInterval(tempProgressInterval);
                    setIsPlayingAudio(false);
                    simProgress = 100;
                }
                setAudioProgress(Math.floor(simProgress));
            }, 500);
        }

        return () => {
            if (tempProgressInterval) clearInterval(tempProgressInterval);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, [isPlayingAudio, playbackSpeed, selectedVoice, currentPage]);

    const handleDownloadCertificate = (courseTitle: string) => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Draw golden frame
            doc.setDrawColor(217, 119, 6);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, 277, 190);
            
            doc.setDrawColor(30, 41, 59);
            doc.setLineWidth(0.5);
            doc.rect(13, 13, 271, 184);

            // Watermark text background
            doc.setTextColor(248, 250, 252);
            doc.setFontSize(40);
            doc.setFont('helvetica', 'bold');
            doc.text("CGADB - DOUTRINA OFICIAL", 148, 110, { align: "center", angle: 25 });

            // Title
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(28);
            doc.setFont('times', 'bold');
            doc.text("UNIVERSIDADE TEOLOGICA GIPP", 148, 40, { align: "center" });

            // Subtitle
            doc.setTextColor(180, 83, 9);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text("CONVENCAO GERAL DAS ASSEMBLEIAS DE DEUS NO BRASIL", 148, 50, { align: "center" });

            // Credential Header
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(9);
            doc.text("CREDENCIAIS E REGISTRO DE FORMACAO ACADEMICA ECLESIASTICA", 148, 60, { align: "center" });

            // Body text
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(13);
            doc.text("Certificamos para fins de registro teológico e instrução doutrinária,", 148, 85, { align: "center" });
            
            // Student name
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(22);
            doc.setFont('times', 'italic');
            doc.text(user?.nome ? user.nome.toUpperCase() : "OBREIRO EM FORMACAO ACADEMICA", 148, 100, { align: "center" });

            // Completing course description
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(13);
            doc.setFont('times', 'normal');
            doc.text(`concluiu com aproveitamento e zelo eclesiástico estrito a trilha curricular de:`, 148, 115, { align: "center" });
            
            doc.setTextColor(79, 70, 229);
            doc.setFontSize(17);
            doc.setFont('times', 'bold');
            doc.text(courseTitle.toUpperCase(), 148, 126, { align: "center" });

            // Endorsement footer
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'italic');
            doc.text("Em conformidade doutrinária eclesiástica plena com as Diretrizes da Declaração de Fé da CGADB.", 148, 138, { align: "center" });

            // Signature Lines
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.4);
            doc.line(40, 168, 120, 168);
            doc.line(170, 168, 250, 168);

            doc.setTextColor(71, 85, 105);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text("PASTOR PRESIDENTE DA INSTITUICAO", 80, 174, { align: "center" });
            doc.text("DIRETOR DA BANCA TEOLOGICA", 210, 174, { align: "center" });

            doc.save(`Certificado_Teologia_${courseTitle.replace(/\s+/g, "_")}.pdf`);
            addToast("Certificado de Teologia baixado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao processar as credenciais do PDF.", "error");
        }
    };

    // E-Reader Specific States
    const [readerTheme, setReaderTheme] = useState<'white' | 'sepia' | 'dark'>('white');
    const [readerFontSize, setReaderFontSize] = useState<'base' | 'lg' | 'xl' | '2xl'>('lg');
    const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
    const [showGlossary, setShowGlossary] = useState<boolean>(false);
    const [savingNotes, setSavingNotes] = useState<boolean>(false);

    const handleSaveLessonNotes = (courseId: string, lessonId: number, text: string) => {
        setSavingNotes(true);
        const key = `notes_${courseId}_${lessonId}`;
        const updatedNotes = { ...studentNotes, [key]: text };
        setStudentNotes(updatedNotes);
        localStorage.setItem(key, text);
        setTimeout(() => {
            setSavingNotes(false);
        }, 600);
    };

    // State variables for Custom AI Theological Booklet Generator
    const [activeTab, setActiveTab] = useState<'grade' | 'ai_generator' | 'notes'>('grade');
    const [aiTheme, setAiTheme] = useState<string>('');
    const [aiLevel, setAiLevel] = useState<'Básico' | 'Médio' | 'Avançado'>('Avançado');
    const [generatingBooklet, setGeneratingBooklet] = useState<boolean>(false);
    const [generatedBooklets, setGeneratedBooklets] = useState<Array<any>>(() => {
        try {
            const saved = localStorage.getItem('university_generated_booklets');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [selectedGeneratedIndex, setSelectedGeneratedIndex] = useState<number | null>(null);
    const [generatedAnswers, setGeneratedAnswers] = useState<Record<number, number>>({});
    const [generatedQuizTested, setGeneratedQuizTested] = useState<boolean>(false);

    // Dynamic extraction of saved local notes for the user notebook list
    const [savedNotesList, setSavedNotesList] = useState<Array<{ key: string, label: string, text: string }>>([]);

    useEffect(() => {
        const notes: Array<{ key: string, label: string, text: string }> = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('notes_')) {
                const parts = key.split('_');
                const courseId = parts[1];
                const lessonIdx = parseInt(parts[2], 10);
                
                const course = MODULES_TEOLOGIA.find(c => c.id === courseId);
                const lesson = course?.lessons[lessonIdx];
                const label = course && lesson ? `${course.title} - ${lesson.title}` : `Estudo Teológico ${courseId}`;
                const text = localStorage.getItem(key) || '';
                if (text.trim()) {
                    notes.push({ key, label, text });
                }
            }
        }
        setSavedNotesList(notes);
    }, [studentNotes, activeTab]);

    const handleGenerateBooklet = async (themeToGenerate: string) => {
        if (!themeToGenerate.trim()) {
            addToast("Digite um tema ou selecione um capítulo da lista.", "warning");
            return;
        }

        setGeneratingBooklet(true);
        playMenuSound();
        addToast("Solicitando ao Professor de Teologia IA... Aguarde alguns segundos.", "info");

        const prompt = `Você é um Professor e Doutor de Teologia com profunda erudição, rigor acadêmico e alinhado integralmente com a doutrina ortodoxa da CGADB (Convenção Geral das Assembleias de Deus no Brasil) e a Declaração de Fé da denominação.

Gere uma apostila de estudo teológico completa, didática e profunda sobre o seguinte TEMA CENTRAL: "${themeToGenerate}"
NÍVEL ACADÊMICO: ${aiLevel} (Básico indica foco geral/devocional; Médio indica Escola Dominical / EBD; Avançado indica Seminário Teológico de nível de Bacharelado, usando termos originais em grego e/ou hebraico com transliteração e exegese bíblica robusta).

ATENÇÃO: Você DEVE retornar EXCLUSIVAMENTE um objeto JSON válido do início ao fim, sem nenhum texto introdutório, sem explicações externas ao JSON, e sem tags de formatação adicionais (como \`\`\`json ou \`\`\`). Toda a estrutura do JSON deve respeitar o padrão de ecossistema de dados. O seu output deve ser um único objeto JSON cru contendo exatamente os seguintes campos explicados detalhadamente em português:

{
  "theme": "${themeToGenerate}",
  "level": "${aiLevel}",
  "title": "Título altamente acadêmico, pomposo e reverente da apostila",
  "introduction": "Texto completo de introdução, abordando o panorama histórico do assunto, origens semânticas das heresias associadas ou discussões patrísticas (pelo menos 4 parágrafos robustos).",
  "doctrinalFoundation": "Texto profundo detalhando a fundamentação doutrinária assembleiana oficial sobre esse tema, mencionando de forma explícita o(s) capítulo(s) correspondente(s) da Declaração de Fé da CGADB (pelo menos 4 parágrafos explicativos).",
  "biblicalReferences": [
    "Referência Bíblica #1 com análise exegética profunda detalhada em português",
    "Referência Bíblica #2 com análise exegética profunda detalhada em português",
    "Referência Bíblica #3 com análise exegética profunda detalhada em português"
  ],
  "practicalApplication": "Instruções pastorais de aplicação prática na vida cristã diária, na prática da fé do obreiro, no altar e no testemunho perante a sociedade civil (mínimo de 3 parágrafos explicativos).",
  "quiz": [
    {
      "question": "Pergunta exigente de múltipla escolha para fixação da lição",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctIndex": 0,
      "explanation": "Explicação teológica fidedigna respondendo por que essa opção está correta sob a ótica doutrinária CGADB."
    },
    {
      "question": "Segunda pergunta exigente de múltipla escolha para avaliação de conhecimento do aluno",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctIndex": 1,
      "explanation": "Explicação teológica detalhada justificando a correta resposta."
    }
  ]
}

REGRA CRÍTICA DE FORMATO DE RESPOSTA (SINTAXE JSON): 
1. Para citações de versículos, termos destacados em grego/hebraico ou citações em geral, você deve obrigatoriamente usar aspas simples (') ou aspas angulares (« »). NUNCA coloque aspas duplas (") não-escapadas no interior das strings dos valores das propriedades, pois isso gerará erro fatal de parsing de JSON.
2. Não insira quebras de linha físicas (tecla Enter) no interior dos valores de string do JSON. Para criar novas linhas ou novos parágrafos, use a sequência literal de dois caracteres '\\n'.
3. Certifique-se de que o fechamento de listas ou objetos não contenha vírgulas pendentes (trailing commas) desnecessárias.
4. Respeite com precisão absoluta as regras doutrinárias CGADB explicadas no AGENTS.md e forneça textos maduros, elegantes e de altíssimo nível científico.`;

        try {
            const { callGeminiAI } = await import('../App');
            const resultText = await callGeminiAI(prompt);
            
            let cleanJSON = resultText.trim();
            if (cleanJSON.startsWith('```json')) {
                cleanJSON = cleanJSON.substring(7);
            } else if (cleanJSON.startsWith('```')) {
                cleanJSON = cleanJSON.substring(3);
            }
            if (cleanJSON.endsWith('```')) {
                cleanJSON = cleanJSON.substring(0, cleanJSON.length - 3);
            }
            cleanJSON = cleanJSON.trim();

            // Heuristic JSON repair for robust parsing
            // 1. Remove trailing commas before closing braces/brackets
            cleanJSON = cleanJSON.replace(/,\s*([\]}])/g, '$1');

            // 2. Escape actual physical newlines that the model sometimes leaves unescaped in block strings
            let repairedJSON = "";
            let inString = false;
            let escape = false;
            for (let i = 0; i < cleanJSON.length; i++) {
                const char = cleanJSON[i];
                if (char === '\\' && !escape) {
                    escape = true;
                    repairedJSON += char;
                } else if (char === '"' && !escape) {
                    inString = !inString;
                    repairedJSON += char;
                    escape = false;
                } else if ((char === '\n' || char === '\r') && inString) {
                    repairedJSON += '\\n';
                    escape = false;
                } else {
                    repairedJSON += char;
                    escape = false;
                }
            }

            let parsedBooklet: any;
            try {
                parsedBooklet = JSON.parse(repairedJSON);
            } catch (firstErr: any) {
                console.warn("Standard JSON parse failed, trying fallback with raw cleanJSON...", firstErr);
                parsedBooklet = JSON.parse(cleanJSON);
            }

            const updatedList = [parsedBooklet, ...generatedBooklets];
            setGeneratedBooklets(updatedList);
            localStorage.setItem('university_generated_booklets', JSON.stringify(updatedList));

            playNotificationSound();
            addToast("Apostila teológica oficial gerada com êxito e adicionada à sua biblioteca!", "success");
            setSelectedGeneratedIndex(0); // View it immediately
            setGeneratedAnswers({});
            setGeneratedQuizTested(false);
            setAiTheme('');
        } catch (error: any) {
            console.error("Erro ao gerar apostila:", error);
            addToast(`Falha de sintaxe no compilador IA: ${error.message || error}. Tente novamente com outro termo.`, "error");
        } finally {
            setGeneratingBooklet(false);
        }
    };

    const handleOpenCourse = (courseId: string) => {
        playMenuSound();
        setSelectedCourse(courseId);
        setActiveLesson(null);
        setQuizActive(false);
        setSelectedAnswers({});
    };

    const handleBack = () => {
        playMenuSound();
        setSelectedCourse(null);
    };

    const markLessonCompleted = (courseId: string, lessonNumber: number) => {
        const curProgress = courseProgress[courseId] || 0;
        if (lessonNumber > curProgress) {
            const updated = { ...courseProgress, [courseId]: lessonNumber };
            setCourseProgress(updated);
            localStorage.setItem('gipp_teologia_progress', JSON.stringify(updated));
            playNotificationSound();
            addToast(`Lição ${lessonNumber} concluída com sucesso!`, 'success');
        }
        setActiveLesson(null);
    };

    if (selectedCourse) {
        const course = MODULES_TEOLOGIA.find(c => c.id === selectedCourse);
        if (!course) return null;

        const currentProg = courseProgress[selectedCourse] || 0;
        const allCompleted = currentProg >= course.lessons.length;
        const passedQuiz = quizScore[selectedCourse] !== undefined && quizScore[selectedCourse] >= 70;

        if (activeLesson !== null) {
            const lessonData = course.lessons[activeLesson - 1];
            const pages = lessonData.pages || [];
            const totalPages = pages.length;
            const currentPageData = pages[currentPage] || { pageTitle: "Conteúdo", text: null };
            const noteKey = `notes_${course.id}_${activeLesson}`;
            const currentNotes = studentNotes[noteKey] || '';

            // Glossary Terms list to help the student learn more
            const GLOSSARY_TERMS = [
                { term: "Theos-Logos", definition: "Etimologia grega de Teologia: 'Theos' (Deus) e 'Logos' (Estudo, Razão, Tratado ordendado)." },
                { term: "Exegese", definition: "A arte e ciência de extrair de dentro do texto o sentido real pretendido pelo autor original." },
                { term: "Eisegese", definition: "O erro e perigo teológico de sobrepujar opiniões pessoais particulares ao texto bíblico." },
                { term: "Teopneustia", definition: "Do grego 'Theopneustos' (soprada por Deus), indicando a inspiração verbal e plena divina." },
                { term: "União Hipostática", definition: "A integridade das duas naturezas inteiras (humana e divina) unidas na única Pessoa de Jesus." },
                { term: "Pneuma Hagion", definition: "Nome do Espírito Santo no Grego do Novo Testamento, indicando a Pessoa divina santa." },
                { term: "Ekklesia", definition: "Assembleia dos que de verdade foram convertidos e convocados para fora do secularismo de mundo." },
                { term: "Eschatos", definition: "Termo grego indicando as últimas finais conclusas coisas da história da criação." }
            ];

            return (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto px-4 py-6 print:py-0 print:px-0">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    playMenuSound();
                                    setActiveLesson(null);
                                }} 
                                className="text-slate-600 hover:text-indigo-600 font-bold gap-2"
                            >
                                <ArrowLeft size={16} /> Voltar ao Módulo
                            </Button>
                            <span className="h-4 w-px bg-slate-300"></span>
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{course.title}</h3>
                                <h1 className="text-lg font-black text-slate-800 leading-none">Capítulo {activeLesson}: {lessonData.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progresso da Leitura:</span>
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{currentPage + 1} / {totalPages} Pág.</span>
                        </div>
                    </div>

                    {/* 3-Column Reader Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Column 1: Page Index / Outline */}
                        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit space-y-4 print:hidden">
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 block">Sumário da Lição</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Clique para avançar rapidamente entre as 10 páginas virtuais catalogadas de estudo:</p>
                            </div>
                            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                                {pages.map((p, idx) => {
                                    const isCurrent = idx === currentPage;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                playMenuSound();
                                                setCurrentPage(idx);
                                            }}
                                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 transition-all duration-150 ${
                                                isCurrent 
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' 
                                                    : 'bg-slate-50/50 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div className="leading-tight">
                                                <div className="font-bold truncate max-w-[150px]">{p.pageTitle}</div>
                                                <div className="text-[10px] opacity-75">{p.subtitle || `Página ${idx + 1}`}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Column 2 & 3: Interactive Book Container */}
                        <div className="lg:col-span-2 space-y-4">
                            <div 
                                className={`p-6 md:p-10 rounded-3xl shadow-md border transition-all duration-300 min-h-[500px] flex flex-col justify-between ${
                                    readerTheme === 'white' 
                                        ? 'bg-white border-slate-200 text-slate-800' 
                                        : readerTheme === 'sepia'
                                            ? 'bg-[#fcf8f2] border-[#ebd6bc] text-[#5c4033]'
                                            : 'bg-slate-950 border-slate-800 text-slate-100'
                                }`}
                            >
                                {/* Paged Text Body */}
                                <div>
                                    <div className="flex items-center justify-between border-b pb-4 mb-6 opacity-80 border-slate-200 print:hidden">
                                        <span className="text-xs font-black uppercase tracking-widest">{currentPageData.subtitle || `Página ${currentPage + 1}`}</span>
                                        <span className="text-xs font-serif italic">Universidade Teológica Apostólica</span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black font-sans leading-tight mb-6 tracking-tight">
                                        {currentPageData.pageTitle}
                                    </h2>

                                    <div 
                                        className={`font-serif leading-relaxed text-justify space-y-5 ${
                                            readerFontSize === 'base' ? 'text-base' :
                                            readerFontSize === 'lg' ? 'text-lg' :
                                            readerFontSize === 'xl' ? 'text-xl' : 'text-2xl'
                                        }`}
                                    >
                                        {currentPageData.text}
                                    </div>
                                </div>

                                {/* Pagination Trigger buttons */}
                                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between print:hidden">
                                    <Button
                                        variant="ghost"
                                        disabled={currentPage === 0}
                                        onClick={() => {
                                            playMenuSound();
                                            setCurrentPage(prev => Math.max(0, prev - 1));
                                        }}
                                        className="text-slate-500 font-bold hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        Página Anterior
                                    </Button>

                                    <span className="text-xs font-bold text-slate-400">
                                        Pág. {currentPage + 1} de {totalPages}
                                    </span>

                                    {currentPage < totalPages - 1 ? (
                                        <Button
                                            onClick={() => {
                                                playMenuSound();
                                                setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs gap-1 shadow-md"
                                        >
                                            Próxima Página
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => markLessonCompleted(course.id, activeLesson)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs gap-1 shadow-md animation-pulse"
                                        >
                                            Concluir Cap. {activeLesson} <CheckCircle size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Student Toolbar / Notes & Controls */}
                        <div className="lg:col-span-1 space-y-5 print:hidden">
                            {/* 🔊 Professor Particular de Teologia - Áudio-Aula */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-3xl border border-indigo-200/60 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="text-indigo-600" size={18} />
                                        <span className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">Áudio-Aula Exegética</span>
                                    </div>
                                    {isPlayingAudio && (
                                        <span className="flex gap-0.5 items-end h-3">
                                            <span className="w-0.5 bg-indigo-600 h-2 rounded-full animate-bounce"></span>
                                            <span className="w-0.5 bg-indigo-500 h-3 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-0.5 bg-indigo-600 h-1.5 rounded-full animate-bounce delay-300"></span>
                                        </span>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                    Ouça os ensinamentos, referências exegéticas e fundamentação CGADB desta lição narrados por voz sintetizada de alta fidelidade.
                                </p>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    <button
                                        onClick={() => {
                                            playMenuSound();
                                            setIsPlayingAudio(!isPlayingAudio);
                                        }}
                                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 border-0 shadow-md ${
                                            isPlayingAudio 
                                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-550/10' 
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-550/10'
                                        }`}
                                    >
                                        {isPlayingAudio ? (
                                            <>
                                                <Pause size={14} /> Pausar Aula
                                            </>
                                        ) : (
                                            <>
                                                <Play size={14} /> Ouvir Aula
                                            </>
                                        )}
                                    </button>

                                    <div className="flex gap-1 justify-center">
                                        {[1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => { playMenuSound(); setPlaybackSpeed(speed); }}
                                                className={`px-2 py-1.5 text-[9px] font-bold rounded-lg border transition-all ${
                                                    playbackSpeed === speed 
                                                        ? 'bg-indigo-600 border-indigo-700 text-white' 
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                                                }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {availableVoices.length > 0 && (
                                    <div className="space-y-1.5 pt-2 border-t border-indigo-200/40">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block">Voz do Narrador:</label>
                                        <select
                                            value={selectedVoice}
                                            onChange={(e) => {
                                                playMenuSound();
                                                setSelectedVoice(e.target.value);
                                                if (isPlayingAudio) {
                                                    setIsPlayingAudio(false);
                                                    setTimeout(() => setIsPlayingAudio(true), 150);
                                                }
                                            }}
                                            className="w-full bg-white border border-indigo-200/60 rounded-xl p-2.5 text-[10px] font-extrabold text-indigo-950 outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                                        >
                                            <option value="default_pastor">Voz Padrão (Pastor Virtual)</option>
                                            {availableVoices.map((v) => {
                                                let friendlyName = v.name;
                                                const lowerName = v.name.toLowerCase();
                                                if (v.name.includes("Daniel") || v.name.includes("Google português do Brasil") || v.name.includes("Heloisa")) {
                                                    friendlyName = v.name.includes("Heloisa") ? "Professora Heloisa (Feminino)" : v.name.includes("Daniel") ? "Professor Daniel (Masculino)" : "Pastor Virtual GIPP";
                                                } else if (lowerName.includes("maria") || lowerName.includes("female") || lowerName.includes("zira") || lowerName.includes("francisca") || lowerName.includes("heloisa") || lowerName.includes("solange")) {
                                                    friendlyName = `${v.name.split(" ")[0].replace("Microsoft", "").replace("Google", "").trim()} (Missionária / Feminino)`;
                                                } else {
                                                    friendlyName = `${v.name.replace("Microsoft", "").replace("Google", "").trim()} (Masculino)`;
                                                }
                                                return (
                                                    <option key={v.name} value={v.name}>
                                                        {friendlyName}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}

                                {audioProgress > 0 && (
                                    <div className="space-y-1">
                                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                            <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${audioProgress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] font-extrabold uppercase text-slate-400">
                                            <span>Sintetizador Narrativo</span>
                                            <span>{audioProgress}% Concluído</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Toolbar Panel */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 block">Estilo de Leitura</h4>
                                
                                {/* Theme Picker */}
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-slate-500">Tema do E-livro:</span>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button 
                                            onClick={() => setReaderTheme('white')}
                                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                readerTheme === 'white' ? 'bg-white border-slate-800 text-slate-800 ring-1 ring-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            Dia
                                        </button>
                                        <button 
                                            onClick={() => setReaderTheme('sepia')}
                                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                readerTheme === 'sepia' ? 'bg-[#fcf8f2] border-[#ebd6bc] text-[#5c4033] ring-1 ring-[#ebd6bc]' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            Sépia
                                        </button>
                                        <button 
                                            onClick={() => setReaderTheme('dark')}
                                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                readerTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100 ring-1 ring-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            Noite
                                        </button>
                                    </div>
                                </div>

                                {/* Font Scale Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                                        <span>Tamanho da Fonte:</span>
                                        <span className="capitalize text-indigo-600">{readerFontSize}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            disabled={readerFontSize === 'base'}
                                            onClick={() => setReaderFontSize(readerFontSize === '2xl' ? 'xl' : readerFontSize === 'xl' ? 'lg' : 'base')}
                                            className="w-1/2 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 font-bold text-xs text-slate-600 disabled:opacity-35"
                                        >
                                            A -
                                        </button>
                                        <button 
                                            disabled={readerFontSize === '2xl'}
                                            onClick={() => setReaderFontSize(readerFontSize === 'base' ? 'lg' : readerFontSize === 'lg' ? 'xl' : '2xl')}
                                            className="w-1/2 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 font-bold text-xs text-slate-600 disabled:opacity-35"
                                        >
                                            A +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-Saved Student Notes Pad */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 block">Caderno de Notas</h4>
                                    <span className="text-[9px] font-bold flex items-center gap-1">
                                        {savingNotes ? (
                                            <span className="text-indigo-600 animate-pulse">Gravando...</span>
                                        ) : (
                                            <span className="text-emerald-600">● Salvo</span>
                                        )}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-tight">Suas anotações privadas são persistidas localmente no navegador:</p>
                                <textarea
                                    value={currentNotes}
                                    placeholder="Escreva aqui suas reflexões, anotações de aula, dúvidas ou referências bíblicas..."
                                    onChange={(e) => handleSaveLessonNotes(course.id, activeLesson, e.target.value)}
                                    className="w-full h-32 p-3 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 leading-relaxed resize-none"
                                ></textarea>
                            </div>

                            {/* Key Biblical Glossary */}
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-5 rounded-2xl text-white shadow-md space-y-3 relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 opacity-5">
                                    <BookOpen size={100} />
                                </div>
                                <div className="relative z-10 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-200">Glossário Bíblico</h4>
                                        <button 
                                            onClick={() => setShowGlossary(!showGlossary)}
                                            className="text-[10px] font-black underline text-indigo-300 hover:text-white"
                                        >
                                            {showGlossary ? "Recolher" : "Expandir"}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-indigo-100/85 font-medium leading-relaxed">Conceituação rápida de termos teológicos no decorrer de suas lições acadêmicas universitárias:</p>

                                    {showGlossary && (
                                        <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto pr-1">
                                            {GLOSSARY_TERMS.map((t, idx) => (
                                                <div key={idx} className="bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
                                                    <span className="text-[11px] font-black text-indigo-300 block">{t.term}</span>
                                                    <span className="text-[10px] text-slate-300/90 leading-tight block font-medium">{t.definition}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            );
        }

        if (quizActive && !passedQuiz) {
            
            const submitQuiz = () => {
                let correctCount = 0;
                course.quiz.forEach((q, idx) => {
                    if (selectedAnswers[idx] === q.correctIndex) {
                        correctCount++;
                    }
                });
                const score = Math.round((correctCount / course.quiz.length) * 100);
                
                if (score >= 70) {
                    playNotificationSound();
                    const updatedScores = { ...quizScore, [selectedCourse]: score };
                    setQuizScore(updatedScores);
                    localStorage.setItem('gipp_teologia_quiz_scores', JSON.stringify(updatedScores));
                    addToast(`Aprovado! Nota: ${score}`, "success");
                    setQuizActive(false);
                } else {
                    addToast(`Reprovado. Nota: ${score}. Revise o material e tente novamente.`, "error");
                    setQuizActive(false);
                }
            };

            const allAnswered = Object.keys(selectedAnswers).length === course.quiz.length;

            return (
                <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Avaliação Teológica Final</h2>
                            <p className="text-slate-500 mt-2 font-medium">Módulo: {course.title}</p>
                            <p className="text-xs text-indigo-500 font-bold uppercase mt-2">Nota mínima: 70</p>
                        </div>

                        <div className="space-y-8">
                            {course.quiz.map((q, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                                    <h3 className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</h3>
                                    <div className="space-y-3">
                                        {q.options.map((option, optIdx) => (
                                            <label key={optIdx} className={`flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer transition-colors ${selectedAnswers[idx] === optIdx ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name={`q_${idx}`} 
                                                    checked={selectedAnswers[idx] === optIdx}
                                                    onChange={() => setSelectedAnswers({...selectedAnswers, [idx]: optIdx})}
                                                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" 
                                                />
                                                <span className={`font-medium ${selectedAnswers[idx] === optIdx ? 'text-indigo-700' : 'text-slate-700'}`}>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex gap-4">
                            <Button variant="ghost" onClick={() => setQuizActive(false)}>Cancelar</Button>
                            <Button 
                                className="text-white flex-1 font-bold shadow-md"
                                style={{ backgroundColor: allAnswered ? '#4f46e5' : '#cbd5e1' }}
                                disabled={!allAnswered}
                                onClick={submitQuiz}
                            >
                                Enviar Respostas para Correção
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn py-6 px-4 max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={handleBack} className="text-slate-600">
                            <ArrowLeft size={18} className="mr-2" /> Voltar
                        </Button>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            {course.icon && <course.icon className={`text-${course.color}-600`} size={28} />}
                            {course.title}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-800">Trilha Acadêmica</h3>
                                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Progresso: {Math.round((currentProg / course.lessons.length) * 100)}%
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {course.lessons.map((lesson, i) => {
                                    const lessonNum = i + 1;
                                    const isCompleted = lessonNum <= currentProg;
                                    const isLocked = lessonNum > currentProg + 1;

                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => {
                                                if (isLocked) {
                                                    addToast("Conclua a lição anterior para acessar esta.", "warning");
                                                } else {
                                                    playMenuSound();
                                                    setActiveLesson(lessonNum);
                                                    setCurrentPage(0);
                                                    const key = `notes_${selectedCourse}_${lessonNum}`;
                                                    const saved = localStorage.getItem(key) || '';
                                                    setStudentNotes(prev => ({ ...prev, [key]: saved }));
                                                }
                                            }}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                isCompleted 
                                                    ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200 cursor-pointer' 
                                                    : isLocked
                                                        ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                                                        : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-sm cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                                    isCompleted ? 'bg-emerald-100 text-emerald-600' : isLocked ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                    {isCompleted ? <CheckCircle size={18} /> : lessonNum}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>Lição {lessonNum}: {lesson.title}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{lesson.readingTime}</p>
                                                </div>
                                            </div>
                                            {isLocked ? <Lock className="text-slate-300" size={20} /> : <ChevronRight className={isCompleted ? "text-emerald-400" : "text-indigo-400"} />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border ${allCompleted ? (passedQuiz ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200') : 'bg-slate-50 border-slate-200'}`}>
                            <h3 className={`font-black mb-2 flex items-center gap-2 ${allCompleted ? (passedQuiz ? 'text-emerald-800' : 'text-indigo-900') : 'text-slate-700'}`}>
                                {passedQuiz ? <Award size={20} className="text-emerald-600" /> : <Shield size={20} />} 
                                Avaliação Final
                            </h3>
                            <p className={`text-sm mb-4 ${allCompleted ? (passedQuiz ? 'text-emerald-700' : 'text-indigo-700') : 'text-slate-500'}`}>
                                {passedQuiz 
                                    ? `Você foi aprovado com nota ${quizScore[selectedCourse]}! Seu certificado já pode ser emitido.`
                                    : allCompleted 
                                        ? 'Você completou todas a lições. Realize a prova teológica para obter sua credencial/certificado de conclusão.'
                                        : 'Conclua as lições ativas para desbloquear a avaliação final do módulo.'}
                            </p>
                            {!passedQuiz && (
                                <Button 
                                    className={`w-full font-bold ${allCompleted ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    onClick={() => {
                                        if (allCompleted) setQuizActive(true);
                                    }}
                                >
                                    Realizar Prova (Modo Universitário)
                                </Button>
                            )}
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            {!passedQuiz && (
                                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="bg-white/90 p-3 rounded-full shadow-sm border border-slate-200 text-slate-500">
                                        <Lock size={24} />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-4 text-slate-800">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Diploma</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.title}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                                Certificado de formação reconhecido pela diretoria local. Atribui honras acadêmicas básicas em teologia.
                            </p>
                            <Button 
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all animate-pulse" 
                                onClick={() => {
                                    playMenuSound();
                                    setCertifiedCourse(course);
                                    setShowCertificateModal(true);
                                }}
                            >
                                <Award size={16} /> Emitir Credencial Oficial
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleExportNotes = () => {
        playNotificationSound();
        if (savedNotesList.length === 0) {
            addToast("Nenhuma anotação gravada ainda para exportar.", "warning");
            return;
        }

        let fullText = "--------------------------------------------------------\n";
        fullText += "UNIVERSIDADE TEOLÓGICA - CADERNO OFICIAL DE ANOTAÇÕES\n";
        fullText += "--------------------------------------------------------\n\n";

        savedNotesList.forEach((n, idx) => {
            fullText += `ESTUDO #${idx + 1}: ${n.label}\n`;
            fullText += "--------------------------------------------------------\n";
            fullText += `${n.text}\n\n`;
            fullText += "========================================================\n\n";
        });

        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `universidade_teologia_caderno_anotacoes.txt`;
        link.click();
        URL.revokeObjectURL(url);
        addToast("Caderno de anotações exportado como arquivo TXT!", "success");
    };

    // Render Immersive Reader for AI-generated Booklet
    if (selectedGeneratedIndex !== null) {
        const booklet = generatedBooklets[selectedGeneratedIndex];
        if (booklet) {
            const totalPages = 5;
            const pageTitles = [
                { title: "Introdução Histórica", subtitle: "Visão geral e histórica do assunto" },
                { title: "Fundamentação Doutrinária", subtitle: `Declaração de Fé da CGADB - Nível ${booklet.level || 'Avançado'}` },
                { title: "Referências Bíblicas", subtitle: "Principais versículos exegéticos que embasam o ensino" },
                { title: "Aplicação Prática e Práxis Pastoral", subtitle: "Como o obreiro ou membro aplica esse ensinamento" },
                { title: "Validação de Conhecimento", subtitle: "Responda as questões de fixação finais" }
            ];

            const pageTitleData = pageTitles[currentPage] || pageTitles[0];
            const currentThemeStyle = readerTheme === 'white' 
                ? 'bg-white border-slate-200 text-slate-800' 
                : readerTheme === 'sepia'
                    ? 'bg-[#fcf8f2] border-[#ebd6bc] text-[#5c4033]'
                    : 'bg-slate-950 border-slate-850 text-slate-100';

            const activeIndex = selectedGeneratedIndex;

            const handleAnswerGeneratedQuiz = (qIdx: number, optIdx: number) => {
                setGeneratedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
            };

            const handleDeleteBooklet = () => {
                if (window.confirm("Deseja realmente remover esta apostila de sua biblioteca?")) {
                    const filtered = generatedBooklets.filter((_, idx) => idx !== activeIndex);
                    setGeneratedBooklets(filtered);
                    localStorage.setItem('university_generated_booklets', JSON.stringify(filtered));
                    setSelectedGeneratedIndex(null);
                    setCurrentPage(0);
                    addToast("Apostila teológica removida.", "success");
                }
            };

            const handleDownloadBookletPdf = (bk: any) => {
                try {
                    const docJson = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    // PAGE 1: COVER PAGE
                    docJson.setDrawColor(30, 41, 59);
                    docJson.setLineWidth(1);
                    docJson.rect(10, 10, 190, 277);
                    
                    docJson.setDrawColor(217, 119, 6);
                    docJson.setLineWidth(0.5);
                    docJson.rect(12, 12, 186, 273);

                    // Watermark background
                    docJson.setTextColor(248, 250, 252);
                    docJson.setFontSize(28);
                    docJson.setFont('helvetica', 'bold');
                    docJson.text("UNIVERSIDADE TEOLOGICA GIPP", 105, 145, { align: "center", angle: 45 });

                    // College header
                    docJson.setTextColor(15, 23, 42);
                    docJson.setFontSize(16);
                    docJson.setFont('times', 'bold');
                    docJson.text("UNIVERSIDADE TEOLOGICA GIPP", 105, 45, { align: "center" });

                    docJson.setTextColor(180, 83, 9);
                    docJson.setFontSize(9);
                    docJson.setFont('helvetica', 'bold');
                    docJson.text("CONVENCAO GERAL DAS ASSEMBLEIAS DE DEUS NO BRASIL (CGADB)", 105, 51, { align: "center" });

                    docJson.setDrawColor(226, 232, 240);
                    docJson.setLineWidth(0.5);
                    docJson.line(40, 56, 170, 56);

                    // Title
                    docJson.setTextColor(15, 23, 42);
                    docJson.setFontSize(20);
                    docJson.setFont('times', 'bold');
                    const titleText = (bk.title || bk.theme || "Apostila de Teologia").toUpperCase();
                    const bookletTitleLines = docJson.splitTextToSize(titleText, 160);
                    docJson.text(bookletTitleLines, 105, 95, { align: "center" });

                    // Level and Theme details
                    docJson.setTextColor(100, 116, 139);
                    docJson.setFontSize(11);
                    docJson.setFont('helvetica', 'italic');
                    docJson.text(`Materia de Referencia: ${bk.theme || 'Teologia e Dogmatica'}`, 105, 130, { align: "center" });

                    docJson.setTextColor(15, 23, 42);
                    docJson.setFontSize(11);
                    docJson.setFont('helvetica', 'bold');
                    docJson.text(`PROGRAMA ACADEMICO: RIGOR ${bk.level ? bk.level.toUpperCase() : 'AVANCADO'}`, 105, 140, { align: "center" });

                    // Endorsement
                    docJson.setDrawColor(217, 119, 6);
                    docJson.setLineWidth(0.6);
                    docJson.line(65, 195, 145, 195);

                    docJson.setTextColor(180, 83, 9);
                    docJson.setFontSize(9);
                    docJson.setFont('helvetica', 'bold');
                    docJson.text("DECLARACAO DE FE DA CGADB OFICIAL", 105, 203, { align: "center" });

                    docJson.setTextColor(100, 116, 139);
                    docJson.setFontSize(8);
                    docJson.setFont('helvetica', 'normal');
                    docJson.text("Material desenvolvido e homologado digitalmente para capacitacao", 105, 209, { align: "center" });
                    docJson.text(`Data de Emissao: ${new Date().toLocaleDateString('pt-BR')} - GIPP SISTEMAS`, 105, 215, { align: "center" });

                    // Helper for paginating sections
                    const appendSection = (sectionTitle: string, rawText: string, bullets?: string[]) => {
                        docJson.addPage();
                        
                        // Page border
                        docJson.setDrawColor(226, 232, 240);
                        docJson.setLineWidth(0.5);
                        docJson.rect(10, 10, 190, 277);

                        // Header on content pages
                        docJson.setTextColor(180, 83, 9);
                        docJson.setFontSize(9);
                        docJson.setFont('helvetica', 'bold');
                        docJson.text("UNIVERSIDADE TEOLOGICA GIPP", 15, 19);

                        docJson.setTextColor(148, 163, 184);
                        docJson.setFontSize(8.5);
                        docJson.text("Apostila Eletronica de Capacitacao Pastoral", 195, 19, { align: "right" });

                        docJson.setDrawColor(226, 232, 240);
                        docJson.setLineWidth(0.4);
                        docJson.line(15, 21, 195, 21);

                        // Chapter title
                        docJson.setTextColor(15, 23, 42);
                        docJson.setFontSize(14);
                        docJson.setFont('times', 'bold');
                        docJson.text(sectionTitle, 15, 30);

                        let yCursor = 39;

                        if (rawText) {
                            docJson.setTextColor(51, 65, 85);
                            docJson.setFontSize(10.5);
                            docJson.setFont('times', 'normal');
                            const chunkLines = docJson.splitTextToSize(rawText, 175);
                            chunkLines.forEach((ln: string) => {
                                if (yCursor + 6 > 265) {
                                    docJson.addPage();
                                    // Header on new sheet
                                    docJson.setDrawColor(226, 232, 240);
                                    docJson.setLineWidth(0.5);
                                    docJson.rect(10, 10, 190, 277);
                                    docJson.setTextColor(180, 83, 9);
                                    docJson.setFontSize(9);
                                    docJson.setFont('helvetica', 'bold');
                                    docJson.text("UNIVERSIDADE TEOLOGICA GIPP", 15, 19);
                                    docJson.setDrawColor(226, 232, 240);
                                    docJson.line(15, 21, 195, 21);
                                    yCursor = 30;
                                }
                                docJson.text(ln, 15, yCursor);
                                yCursor += 5.8;
                            });
                        }

                        if (bullets && bullets.length > 0) {
                            bullets.forEach((bull: string, bIdx: number) => {
                                if (yCursor + 12 > 265) {
                                    docJson.addPage();
                                    yCursor = 30;
                                }
                                docJson.setTextColor(180, 83, 9);
                                docJson.setFontSize(11);
                                docJson.setFont('times', 'bold');
                                docJson.text(`Referencia Exegetica #${bIdx + 1}:`, 15, yCursor);

                                docJson.setTextColor(51, 65, 85);
                                docJson.setFontSize(10.5);
                                docJson.setFont('times', 'normal');
                                const linesToFold = docJson.splitTextToSize(bull, 172);
                                linesToFold.forEach((lFold: string) => {
                                    if (yCursor + 6 > 265) {
                                        docJson.addPage();
                                        yCursor = 30;
                                    }
                                    docJson.text(lFold, 17, yCursor + 5);
                                    yCursor += 5.8;
                                });
                                yCursor += 8;
                            });
                        }
                    };

                    // Add content pages
                    appendSection("1. INTRODUCAO HISTORICA", bk.introduction || "Conteudo de introducao.");
                    appendSection("2. FUNDAMENTACAO DOUTRINARIA (CGADB)", bk.doctrinalFoundation || "Conteudo de fundamentacao.");
                    appendSection("3. REFERENCIAS BIBLICAS DO TEMA", "", bk.biblicalReferences);
                    appendSection("4. APLICACAO PRATICA NA VIDA CRISTA", bk.practicalApplication || "Aplicacao pratica pastoral recomendada.");

                    // Quiz Page
                    docJson.addPage();
                    docJson.setDrawColor(226, 232, 240);
                    docJson.setLineWidth(0.5);
                    docJson.rect(10, 10, 190, 277);

                    docJson.setTextColor(180, 83, 9);
                    docJson.setFontSize(9);
                    docJson.setFont('helvetica', 'bold');
                    docJson.text("UNIVERSIDADE TEOLOGICA GIPP", 15, 19);
                    docJson.setDrawColor(226, 232, 240);
                    docJson.line(15, 21, 195, 21);

                    docJson.setTextColor(15, 23, 42);
                    docJson.setFontSize(14);
                    docJson.setFont('times', 'bold');
                    docJson.text("5. QUESTIONARIO E FIXACAO DE DOUTRINA", 15, 30);

                    let qCursorY = 42;
                    if (bk.quiz && bk.quiz.length > 0) {
                        bk.quiz.forEach((qObj: any, qIdx: number) => {
                            if (qCursorY + 45 > 265) {
                                docJson.addPage();
                                qCursorY = 30;
                            }
                            docJson.setTextColor(15, 23, 42);
                            docJson.setFontSize(11);
                            docJson.setFont('times', 'bold');
                            const foldedQText = docJson.splitTextToSize(`Questao ${qIdx + 1}: ${qObj.question}`, 175);
                            docJson.text(foldedQText, 15, qCursorY);
                            qCursorY += (foldedQText.length * 5) + 2;

                            docJson.setFont('times', 'normal');
                            docJson.setTextColor(71, 85, 105);
                            docJson.setFontSize(10.5);
                            qObj.options.forEach((opt: string, oIdx: number) => {
                                const isCorrect = oIdx === qObj.correctIndex;
                                docJson.text(`[ ${isCorrect ? 'X' : ' '} ]  ${opt}`, 20, qCursorY);
                                qCursorY += 5.5;
                            });

                            if (qObj.explanation) {
                                qCursorY += 1.5;
                                docJson.setTextColor(180, 83, 9);
                                docJson.setFontSize(9.5);
                                docJson.setFont('times', 'bold');
                                docJson.text("Gabarito Comentado Oficial:", 15, qCursorY);
                                
                                docJson.setTextColor(115, 115, 115);
                                docJson.setFont('times', 'normal');
                                const explFolded = docJson.splitTextToSize(qObj.explanation, 175);
                                explFolded.forEach((eLine: string) => {
                                    if (qCursorY + 5 > 265) {
                                        docJson.addPage();
                                        qCursorY = 30;
                                    }
                                    docJson.text(eLine, 15, qCursorY + 4.5);
                                    qCursorY += 5.5;
                                });
                            }
                            qCursorY += 10;
                        });
                    }

                    // Save file
                    const slug = (bk.theme || "apostila").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    docJson.save(`Apostila_GIPP_${slug}.pdf`);
                    playNotificationSound();
                    addToast("Apostila Teológica salva em PDF no seu computador!", "success");
                } catch (err) {
                    console.error("Failure exporting pdf", err);
                    addToast("Erro operacional ao exportar PDF.", "error");
                }
            };

            // Calculate quiz score
            let quizScorePercent = 0;
            let answeredCount = Object.keys(generatedAnswers).length;
            let totalQuizCount = booklet.quiz ? booklet.quiz.length : 0;
            let correctCount = 0;
            if (generatedQuizTested && booklet.quiz) {
                booklet.quiz.forEach((q: any, idx: number) => {
                    if (generatedAnswers[idx] === q.correctIndex) {
                        correctCount++;
                    }
                });
                quizScorePercent = totalQuizCount > 0 ? Math.round((correctCount / totalQuizCount) * 100) : 0;
            }

            return (
                <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto px-4 py-6 print:py-0 print:px-0">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    playMenuSound();
                                    setSelectedGeneratedIndex(null);
                                    setCurrentPage(0);
                                }} 
                                className="text-slate-600 hover:text-indigo-600 font-bold gap-2"
                            >
                                <ArrowLeft size={16} /> Voltar ao Painel IA
                            </Button>
                            <span className="h-4 w-px bg-slate-200"></span>
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-indigo-500 animate-pulse shrink-0" size={18} />
                                <h1 className="text-sm font-black text-slate-800 truncate max-w-[280px] md:max-w-[450px]">{booklet.title || booklet.theme}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progresso:</span>
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{currentPage + 1} / {totalPages} Pág.</span>
                        </div>
                    </div>

                    {/* Reader Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Summary / Sidebar navigation */}
                        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit space-y-4 print:hidden">
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 block text-[10px]">Linha de Estudo</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Etapas estruturais exigidas para capacitação ministerial:</p>
                            </div>
                            <div className="space-y-1">
                                {pageTitles.map((p, idx) => {
                                    const isCurrent = idx === currentPage;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                playMenuSound();
                                                setCurrentPage(idx);
                                            }}
                                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 transition-all duration-150 ${
                                                isCurrent 
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' 
                                                    : 'bg-slate-50/50 border-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div className="leading-tight">
                                                <div className="font-semibold truncate max-w-[150px]">{p.title}</div>
                                                <div className="text-[10px] opacity-75">{p.subtitle}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handleDownloadBookletPdf(booklet)}
                                className="w-full mt-2 flex items-center justify-center gap-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md border-0"
                            >
                                <Download size={14} /> Baixar Apostila PDF
                            </button>

                            <button
                                onClick={handleDeleteBooklet}
                                className="w-full mt-1 flex items-center justify-center gap-2 p-2.5 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50/10 text-xs font-bold rounded-xl transition-all"
                            >
                                <Trash2 size={14} /> Excluir Apostila
                            </button>
                        </div>

                        {/* Interactive Reader Center */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className={`p-6 md:p-10 rounded-3xl shadow-sm border transition-all duration-300 min-h-[500px] flex flex-col justify-between ${currentThemeStyle}`}>
                                <div>
                                    <div className="flex items-center justify-between border-b pb-4 mb-6 opacity-80 border-slate-200 print:hidden text-xs">
                                        <span className="font-black uppercase tracking-widest">{pageTitleData.subtitle}</span>
                                        <span className="font-serif italic text-indigo-500 font-bold">Universidade Assembleiana</span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black font-sans leading-tight mb-6 tracking-tight">
                                        {pageTitleData.title}
                                    </h2>

                                    {/* Text display depending on page index */}
                                    <div className={`font-serif leading-relaxed text-justify space-y-5 ${
                                        readerFontSize === 'base' ? 'text-base' :
                                        readerFontSize === 'lg' ? 'text-lg' :
                                        readerFontSize === 'xl' ? 'text-xl' : 'text-2xl'
                                    }`}>
                                        {currentPage === 0 && (
                                            <div className="space-y-4">
                                                {booklet.introduction ? (
                                                    booklet.introduction.split('\n\n').map((para: string, idx: number) => (
                                                        <p key={idx}>{para}</p>
                                                    ))
                                                ) : <p>Processando introdução...</p>}
                                            </div>
                                        )}

                                        {currentPage === 1 && (
                                            <div className="space-y-4">
                                                {booklet.doctrinalFoundation ? (
                                                    booklet.doctrinalFoundation.split('\n\n').map((para: string, idx: number) => (
                                                        <p key={idx}>{para}</p>
                                                    ))
                                                ) : <p>Processando fundamento doutrinário...</p>}
                                            </div>
                                        )}

                                        {currentPage === 2 && (
                                            <div className="space-y-4">
                                                {Array.isArray(booklet.biblicalReferences) ? (
                                                    <div className="space-y-4 font-sans text-sm">
                                                        {booklet.biblicalReferences.map((ref: string, idx: number) => (
                                                            <div key={idx} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/10 text-slate-700 leading-relaxed font-serif text-base space-y-2">
                                                                <span className="font-sans font-black text-xs text-indigo-600 block uppercase">Passagem Bíblica #{idx+1}</span>
                                                                <p className="italic font-medium">{ref}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : typeof booklet.biblicalReferences === 'string' ? (
                                                    booklet.biblicalReferences.split('\n\n').map((para: string, idx: number) => (
                                                        <p key={idx}>{para}</p>
                                                    ))
                                                ) : <p>Processando referências bíblicas...</p>}
                                            </div>
                                        )}

                                        {currentPage === 3 && (
                                            <div className="space-y-4">
                                                {booklet.practicalApplication ? (
                                                    booklet.practicalApplication.split('\n\n').map((para: string, idx: number) => (
                                                        <p key={idx}>{para}</p>
                                                    ))
                                                ) : <p>Processando aplicação prática...</p>}
                                            </div>
                                        )}

                                        {currentPage === 4 && (
                                            <div className="space-y-6 font-sans">
                                                {booklet.quiz && booklet.quiz.length > 0 ? (
                                                    <div className="space-y-6 text-left">
                                                        {booklet.quiz.map((q: any, qIdx: number) => (
                                                            <div key={qIdx} className="p-5 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors border border-black/5 space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <HelpCircle className="text-indigo-600" size={16} />
                                                                    <span className="font-extrabold text-xs text-indigo-700 uppercase tracking-wider">Questão {qIdx + 1} de {booklet.quiz.length}</span>
                                                                </div>
                                                                <p className="text-sm font-black tracking-tight text-slate-800 leading-snug">{q.question}</p>
                                                                <div className="space-y-1.5 pt-2">
                                                                    {q.options.map((opt: string, optIdx: number) => {
                                                                        const isSelected = generatedAnswers[qIdx] === optIdx;
                                                                        const isCorrect = q.correctIndex === optIdx;
                                                                        
                                                                        let optStyle = "border-slate-255 hover:border-indigo-200 text-slate-700 bg-white/50";
                                                                        if (isSelected) {
                                                                            optStyle = "border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50/80 text-indigo-900";
                                                                        }
                                                                        if (generatedQuizTested) {
                                                                            if (isCorrect) {
                                                                                optStyle = "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500";
                                                                            } else if (isSelected) {
                                                                                optStyle = "border-red-600 bg-red-50 text-red-950 ring-2 ring-red-500";
                                                                            }
                                                                        }

                                                                        return (
                                                                            <button
                                                                                key={optIdx}
                                                                                disabled={generatedQuizTested}
                                                                                onClick={() => handleAnswerGeneratedQuiz(qIdx, optIdx)}
                                                                                className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${optStyle}`}
                                                                            >
                                                                                <span className="font-extrabold mr-2 select-none">
                                                                                    {String.fromCharCode(65 + optIdx)})
                                                                                </span>
                                                                                {opt}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {generatedQuizTested && (
                                                                    <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-1 mt-3">
                                                                        <span className="text-[10px] font-black text-indigo-700 block uppercase tracking-wider">Explicação do Professor:</span>
                                                                        <p className="text-[11.5px] font-medium leading-relaxed font-sans text-slate-600">{q.explanation || "A alternativa responde corretamente respaldada na verdade canônica."}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {!generatedQuizTested ? (
                                                            <Button
                                                                disabled={answeredCount < totalQuizCount}
                                                                onClick={() => {
                                                                    playNotificationSound();
                                                                    setGeneratedQuizTested(true);
                                                                    if (quizScorePercent >= 70) {
                                                                        addToast(`Parabéns! Aproveitamento de ${quizScorePercent}% na apostila gerada por IA!`, "success");
                                                                    } else {
                                                                        addToast(`Aproveitamento: ${quizScorePercent}%. Analise o feedback das respostas.`, "warning");
                                                                    }
                                                                }}
                                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl shadow-md disabled:opacity-50 transition-all mt-4"
                                                            >
                                                                Validar Respostas ({answeredCount}/{totalQuizCount})
                                                            </Button>
                                                        ) : (
                                                            <div className="text-center p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1 mt-4">
                                                                <h5 className="font-black text-sm text-indigo-900">Aproveitamento Final: {quizScorePercent}%</h5>
                                                                <p className="text-xs text-indigo-700 font-medium font-sans">Nota mínima de aproveitamento: 70%</p>
                                                                <button
                                                                    onClick={() => {
                                                                        playMenuSound();
                                                                        setGeneratedAnswers({});
                                                                        setGeneratedQuizTested(false);
                                                                    }}
                                                                    className="text-xs font-bold underline mt-2 text-indigo-600 hover:text-indigo-800 font-sans block mx-auto"
                                                                >
                                                                    Refazer Teste de Fixação
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <p>Nenhum exercício gerado para esta apostila.</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pagination Controls */}
                                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between print:hidden text-sans text-xs">
                                    <Button
                                        variant="ghost"
                                        disabled={currentPage === 0}
                                        onClick={() => {
                                            playMenuSound();
                                            setCurrentPage(prev => Math.max(0, prev - 1));
                                        }}
                                        className="text-slate-500 font-bold hover:text-indigo-600 disabled:opacity-30"
                                    >
                                        Pág. Anterior
                                    </Button>

                                    <span className="font-bold text-slate-400">
                                        Página {currentPage + 1} de {totalPages}
                                    </span>

                                    {currentPage < totalPages - 1 ? (
                                        <Button
                                            onClick={() => {
                                                playMenuSound();
                                                setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-md"
                                        >
                                            Próxima Página
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                playNotificationSound();
                                                setSelectedGeneratedIndex(null);
                                                setCurrentPage(0);
                                                addToast("Leitura de apostila concluída!", "success");
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-xl text-xs gap-1 shadow-md"
                                        >
                                            Finalizar <CheckCircle size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Theme and Custom Actions */}
                        <div className="lg:col-span-1 space-y-5 print:hidden">
                            {/* Toolbar */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 block text-[10px]">Configurar Leitura</h4>
                                
                                {/* Theme Selector */}
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-slate-500 font-sans">Paleta Cromática:</span>
                                    <div className="grid grid-cols-3 gap-1.5 font-sans">
                                        <button 
                                            onClick={() => setReaderTheme('white')}
                                            className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                                readerTheme === 'white' ? 'bg-white border-slate-800 text-slate-800 ring-1 ring-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            Alba
                                        </button>
                                        <button 
                                            onClick={() => setReaderTheme('sepia')}
                                            className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                                readerTheme === 'sepia' ? 'bg-[#fcf8f2] border-[#ebd6bc] text-[#5c4033] ring-1 ring-[#ebd6bc]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            Sépia
                                        </button>
                                        <button 
                                            onClick={() => setReaderTheme('dark')}
                                            className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                                readerTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100 ring-1 ring-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            Noctis
                                        </button>
                                    </div>
                                </div>

                                {/* Font Scaling */}
                                <div className="space-y-2 font-sans">
                                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                                        <span>Tamanho do Texto:</span>
                                        <span className="capitalize text-indigo-600">{readerFontSize}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            disabled={readerFontSize === 'base'}
                                            onClick={() => setReaderFontSize(readerFontSize === '2xl' ? 'xl' : readerFontSize === 'xl' ? 'lg' : 'base')}
                                            className="w-1/2 py-1 bg-slate-50 border border-slate-200 hover:border-indigo-300 font-bold text-xs text-slate-600 disabled:opacity-35 rounded"
                                        >
                                            Reduzir
                                        </button>
                                        <button 
                                            disabled={readerFontSize === '2xl'}
                                            onClick={() => setReaderFontSize(readerFontSize === 'base' ? 'lg' : readerFontSize === 'lg' ? 'xl' : '2xl')}
                                            className="w-1/2 py-1 bg-slate-50 border border-slate-200 hover:border-indigo-300 font-bold text-xs text-slate-600 disabled:opacity-35 rounded"
                                        >
                                            Aumentar
                                        </button>
                                    </div>
                                </div>

                                {/* Print Booklet Button */}
                                <Button
                                    onClick={() => {
                                        setPrintData(booklet);
                                        setPrintMode('rel_apostila');
                                        setPreviewOpen(true);
                                    }}
                                    className="w-full bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 border border-indigo-700 mt-2 hover:bg-indigo-700 shadow-sm"
                                >
                                    <Printer size={13} /> Imprimir Estudo PDF
                                </Button>
                            </div>

                            {/* Booklet Info summary */}
                            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-5 rounded-2xl text-white shadow-sm relative overflow-hidden space-y-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block">Selo Acadêmico</span>
                                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                                    Conteúdo elaborado no rigor canônico das Assembleias de Deus e homologado em cooperação pastoral nacional.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }
    }

    return (
        <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen size={200} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black flex items-center gap-4 tracking-tight">
                        <GraduationCap className="text-indigo-400 animate-bounce" size={48} />
                        Universidade Teológica
                    </h1>
                    <p className="text-indigo-200 font-medium mt-4 text-xs sm:text-lg max-w-2xl leading-relaxed">
                        Formação teológica sólida e profissionalizante. Mergulhe nas profundezas da Palavra de Deus com material didático premium gerado exclusivamente para nossos alunos, preparado para a jornada pastoral.
                    </p>
                </div>
            </div>

            {/* Elegant Academico Tab Bar */}
            <div className="flex border-b border-indigo-100 gap-1 sm:gap-4 pb-0.5 print:hidden">
                <button
                    onClick={() => { playMenuSound(); setActiveTab('grade'); }}
                    className={`pb-3 px-3 relative text-xs sm:text-sm font-black transition-all ${
                        activeTab === 'grade' ? 'text-indigo-650 font-extrabold' : 'text-slate-500 hover:text-slate-850'
                    }`}
                >
                    <span className="flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px] sm:text-xs">
                        <BookOpen size={14} /> Grade Curricular
                    </span>
                    {activeTab === 'grade' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fadeIn" />
                    )}
                </button>

                <button
                    onClick={() => { playMenuSound(); setActiveTab('ai_generator'); }}
                    className={`pb-3 px-3 relative text-xs sm:text-sm font-black transition-all ${
                        activeTab === 'ai_generator' ? 'text-indigo-650 font-extrabold' : 'text-slate-500 hover:text-slate-850'
                    }`}
                >
                    <span className="flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px] sm:text-xs">
                        <Sparkles className="text-indigo-500 animate-ping absolute shrink-0 opacity-20" size={14} />
                        <Sparkles className="text-indigo-550 shrink-0" size={14} /> Gerador de Apostila (IA)
                    </span>
                    {activeTab === 'ai_generator' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fadeIn" />
                    )}
                </button>

                <button
                    onClick={() => { playMenuSound(); setActiveTab('notes'); }}
                    className={`pb-3 px-3 relative text-xs sm:text-sm font-black transition-all ${
                        activeTab === 'notes' ? 'text-indigo-650 font-extrabold' : 'text-slate-500 hover:text-slate-850'
                    }`}
                >
                    <span className="flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px] sm:text-xs">
                        <FileText size={14} /> Anotações ({savedNotesList.length})
                    </span>
                    {activeTab === 'notes' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fadeIn" />
                    )}
                </button>
            </div>

            {/* Tab Rendering Content */}
            {activeTab === 'grade' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-slideUp">
                    {MODULES_TEOLOGIA.map((mod) => {
                        const progress = courseProgress[mod.id] || 0;
                        const percent = Math.round((progress / mod.lessons.length) * 100);
                        return (
                            <div 
                                key={mod.id} 
                                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full bg-gradient-to-b from-white to-slate-50"
                                onClick={() => handleOpenCourse(mod.id)}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-${mod.color}-100 text-${mod.color}-600 flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform shadow-inner`}>
                                    <mod.icon size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{mod.title}</h3>
                                <p className="text-xs text-slate-600 mb-6 flex-grow leading-relaxed font-semibold">{mod.description}</p>
                                
                                <div className="space-y-3 mt-auto">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <span>Progresso Acadêmico</span>
                                        <span className="text-indigo-600 font-extrabold">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {activeTab === 'ai_generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 animate-slideUp font-sans text-xs">
                    {/* Left Column: Form block */}
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-indigo-500" size={18} />
                                <h2 className="text-lg font-black text-slate-800">Compilador Teológico AI</h2>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Produza uma apostila sob medida de altíssimo valor de estudo. Escolha um tema personalizado ou selecione as diretrizes históricas homologadas pela CGADB abaixo.
                            </p>
                        </div>

                        {/* Theme text field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 block">Escreva um Tema de Estudo:</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={aiTheme}
                                    placeholder="Ex: Bibliologia, O Batismo com o Espírito Santo..."
                                    onChange={(e) => setAiTheme(e.target.value)}
                                    className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                                />
                                <Search className="absolute right-3.5 top-3.5 text-slate-400" size={15} />
                            </div>
                        </div>

                        {/* CGADB Predefined Chapters list selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 block">Diretrizes de Referência CGADB:</label>
                            <div className="space-y-1 max-h-[180px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/40">
                                {[
                                    "A Inspiração Verbal Plenária e Inerrância da Bíblia (Cap. 1)",
                                    "A Existência do Único Deus Verdadeiro e o Mistério da Trindade (Cap. 2 e 3)",
                                    "A Divindade das Duas Naturezas na Pessoa de Jesus Cristo (Cap. 4 e 5)",
                                    "O Espírito Santo como Terceira Pessoa Divina (Cap. 6)",
                                    "Criacionismo de Alma e Corpo de Adão vs Evolucionismo (Cap. 7)",
                                    "A Soteriologia: A Doutrina da Salvação Gratuita pela Graça (Cap. 10)",
                                    "As Ordenanças: O Batismo por Imersão e a Santa Ceia (Cap. 11-14)",
                                    "O Batismo no Espírito Santo e Evidências Literárias de Línguas (Cap. 19)",
                                    "A Atualidade e Prática dos Dons Espirituais na Igreja (Cap. 20)",
                                    "Cura Divina nos Tempos Modernos: Eficácia da Oração (Cap. 21)",
                                    "O Arrebatamento Pré-Tribulacionista e a Segunda Vinda (Cap. 22 e 23)",
                                    "A Instituição Divina da Família e Matrimônio Tradicional (Cap. 24)"
                                ].map((topic, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            playMenuSound();
                                            setAiTheme(topic);
                                        }}
                                        className={`w-full text-left p-2 rounded-lg hover:bg-white text-[10.5px] font-bold text-slate-600 hover:text-indigo-650 transition-colors border border-transparent hover:border-slate-150 flex items-start gap-1.5 ${
                                            aiTheme === topic ? 'bg-indigo-50/60 border-indigo-150 text-indigo-700' : ''
                                        }`}
                                    >
                                        <BookOpenText size={12} className="shrink-0 mt-0.5 text-indigo-500" />
                                        <span className="truncate">{topic}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theological academic Level selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 block">Nível de Rigor Científico:</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {['Básico', 'Médio', 'Avançado'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => {
                                            playMenuSound();
                                            setAiLevel(lvl as any);
                                        }}
                                        className={`py-2 rounded-xl border text-[11px] font-bold transition-all ${
                                            aiLevel === lvl 
                                                ? 'bg-indigo-650 border-indigo-600 text-white shadow-sm' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Execute compiling trigger */}
                        <Button
                            onClick={() => handleGenerateBooklet(aiTheme)}
                            disabled={generatingBooklet || !aiTheme.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs py-3.5 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {generatingBooklet ? (
                                <>
                                    <Loader2 className="animate-spin text-white" size={14} /> Redigindo Matéria...
                                </>
                            ) : (
                                <>
                                    <Brain size={14} /> Redigir e Formatar Bíblia
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Right column: Library item display */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="text-indigo-600" size={18} />
                                <h3 className="text-sm font-black text-slate-800">Sua Biblioteca Digital Privada ({generatedBooklets.length})</h3>
                            </div>
                            {generatedBooklets.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (window.confirm("Deseja realmente limpar toda a biblioteca gerada por IA?")) {
                                            setGeneratedBooklets([]);
                                            localStorage.removeItem('university_generated_booklets');
                                            addToast("Biblioteca purgada comercialmente.", "success");
                                        }
                                    }}
                                    className="text-xs font-bold text-red-500 hover:text-red-750 underline"
                                >
                                    Limpar Total
                                </button>
                            )}
                        </div>

                        {generatedBooklets.length === 0 ? (
                            <div className="bg-white border border-slate-250 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 text-slate-400 shadow-sm border-dashed min-h-[350px]">
                                <Brain size={44} className="text-indigo-200 animate-pulse" />
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-slate-700 text-sm">Biblioteca Virtual Vazia</h4>
                                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                                        Nenhuma apostila teológica compilada neste terminal. Escolha as diretrizes ou escreva o tema no painel ao lado para começar seu estudo avançado!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {generatedBooklets.map((bk, idx) => (
                                    <div 
                                        key={idx}
                                        className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-sans">
                                                    Rigor {bk.level || 'Avançado'}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold font-sans">{bk.quiz ? `${bk.quiz.length} Exercícios` : 'Fixação'}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">{bk.title || bk.theme}</h4>
                                            <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed font-serif">{bk.introduction?.substring(0, 140)}...</p>
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-50 font-sans">
                                            <button
                                                onClick={() => {
                                                    playMenuSound();
                                                    setSelectedGeneratedIndex(idx);
                                                    setCurrentPage(0);
                                                    setGeneratedAnswers({});
                                                    setGeneratedQuizTested(false);
                                                }}
                                                className="flex-grow bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black text-[11px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <BookOpenText size={13} /> Abrir E-Book
                                            </button>
                                            <button
                                                onClick={() => {
                                                    playMenuSound();
                                                    if (window.confirm(`Excluir "${bk.title || bk.theme}" definitivamente?`)) {
                                                        const filt = generatedBooklets.filter((_, i) => i !== idx);
                                                        setGeneratedBooklets(filt);
                                                        localStorage.setItem('university_generated_booklets', JSON.stringify(filt));
                                                        addToast("Apostila excluída.", "success");
                                                    }
                                                }}
                                                className="p-2 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl hover:text-red-750 transition-all border border-red-100 shrink-0 text-red-500"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="space-y-5 pt-4 animate-slideUp font-sans">
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="text-indigo-600" size={18} />
                            <h3 className="text-base font-black text-slate-850">Seu Caderno Digital de Estudos ({savedNotesList.length})</h3>
                        </div>
                        {savedNotesList.length > 0 && (
                            <Button
                                onClick={handleExportNotes}
                                className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2 rounded-xl flex items-center gap-1.5 shadow"
                            >
                                <Download size={13} /> Exportar Caderno (.TXT)
                            </Button>
                        )}
                    </div>

                    {savedNotesList.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 text-slate-400 shadow-sm border-dashed min-h-[300px]">
                            <FileText size={44} className="text-slate-300 animate-pulse" />
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-slate-700 text-sm">Nenhuma Anotação Realizada</h4>
                                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                                    Para criar anotações, use o leitor digital ao estudar lições da nossa grade curricular. Elas aparecerão centralizadas e prontas para exportar aqui!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedNotesList.map((n) => (
                                <div key={n.key} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 relative flex flex-col justify-between">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                            Matéria de Referência
                                        </span>
                                        <h4 className="text-sm font-black text-slate-700 mt-1.5 leading-tight line-clamp-1">{n.label}</h4>
                                        <div className="mt-2 text-slate-600 text-xs">
                                            <textarea
                                                value={n.text}
                                                onChange={(e) => {
                                                    const newText = e.target.value;
                                                    const key = n.key;
                                                    const updatedNotes = { ...studentNotes, [key]: newText };
                                                    setStudentNotes(updatedNotes);
                                                    localStorage.setItem(key, newText);
                                                }}
                                                placeholder="Sua anotação teológica..."
                                                rows={5}
                                                className="w-full p-3 rounded-xl border border-slate-250 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-serif text-slate-600 leading-relaxed bg-slate-50/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <span className="text-[9px] text-slate-400 font-bold font-mono">Status: Sincronizado</span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(n.text);
                                                    addToast("Copiado com sucesso!", "success");
                                                }}
                                                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-bold text-slate-600 flex items-center gap-1"
                                                title="Copiar texto"
                                            >
                                                Copiar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Deseja apagar esta anotação permanente?")) {
                                                        localStorage.removeItem(n.key);
                                                        const updatedNotes = { ...studentNotes };
                                                        delete updatedNotes[n.key];
                                                        setStudentNotes(updatedNotes);
                                                        addToast("Anotação apagada.", "success");
                                                    }
                                                }}
                                                className="p-1 px-2.5 bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-700 text-[11px] font-bold rounded flex items-center gap-1"
                                                title="Excluir"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Golden Elegant Certificate / Diploma Modal overlay */}
            {showCertificateModal && certifiedCourse && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans text-xs">
                    <div className="bg-white max-w-4xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                        <button 
                            onClick={() => { playMenuSound(); setShowCertificateModal(false); }}
                            className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center space-y-1">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center justify-center gap-2">
                                <Award className="text-amber-500" size={20} /> Credencial Certificada de Formação
                            </h2>
                            <p className="text-xs text-slate-500 font-semibold">Pré-visualização do diploma acadêmico sob os requisitos doutrinários CGADB</p>
                        </div>

                        {/* Interactive Certificate Paper Frame */}
                        <div id="teologia-diploma-paper" className="border-[8px] border-double border-amber-600 p-8 md:p-12 relative bg-neutral-50/50 rounded-2xl flex flex-col justify-between items-center text-center space-y-6 shadow-inner min-h-[360px] select-none">
                            {/* Watermark Seal */}
                            <div className="absolute text-slate-100 font-extrabold text-7xl select-none pointer-events-none uppercase tracking-widest opacity-25 flex items-center justify-center inset-0">
                                GIPP TEOLOGIA
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-black font-serif text-slate-800 leading-tight">UNIVERSIDADE TEOLÓGICA GIPP</h1>
                                <h3 className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-widest">Convenção Geral das Assembleias de Deus no Brasil — CGADB</h3>
                            </div>

                            <div className="space-y-3 max-w-lg relative z-10">
                                <p className="text-xs md:text-sm text-slate-500 italic">Conferimos solenemente ao aluno(a)</p>
                                <h2 className="text-xl md:text-2xl font-black font-serif text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-4">
                                    {user?.nome ? user.nome.toUpperCase() : "OBREIRO EM FORMAÇÃO ACADÊMICA"}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-serif">
                                    o presente diploma de conclusão contendo honras teológicas acadêmicas de excelência, por haver concluído com maestria de estudos o módulo curricular avançado de:
                                </p>
                                <h3 className="text-base md:text-lg font-extrabold text-indigo-700 uppercase tracking-wide">
                                    {certifiedCourse.title}
                                </h3>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 max-w-md uppercase tracking-wider">
                                    Registrado sob os termos da comissão docente acadêmica teológica GIPP — em total fidelidade com os 24 capítulos da Declaração de Fé da CGADB.
                                </p>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-8 pt-8 border-t border-slate-200/50">
                                <div className="space-y-1">
                                    <div className="h-0.5 bg-slate-300 w-32 md:w-48 mx-auto"></div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Presidente Congregacional</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-0.5 bg-slate-300 w-32 md:w-48 mx-auto"></div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Diretor De Cursos</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive UI Action bars (Melhoria 2) */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
                            <Button 
                                variant="ghost" 
                                onClick={() => { playMenuSound(); setShowCertificateModal(false); }}
                                className="font-bold border border-slate-200"
                            >
                                Fechar Lousa
                            </Button>
                            <Button 
                                onClick={() => {
                                    playNotificationSound();
                                    handleDownloadCertificate(certifiedCourse.title);
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-950 text-white font-extrabold gap-2 shadow-md flex items-center justify-center py-2.5"
                            >
                                <Download size={15} /> Baixar PDF Certificado
                            </Button>
                            <Button 
                                onClick={() => {
                                    playNotificationSound();
                                    setPrintData({
                                        igreja: db?.igreja || { nome: "Assembleia de Deus GIPP", cor_tema: "#4f46e5", cidade: "São Paulo" },
                                        membro: { nome: user?.nome || "Obreiro em Formação Acadêmica" },
                                        extra: { curso: certifiedCourse?.title || "Teologia Geral" }
                                    });
                                    setPrintMode('cert_curso');
                                    setPreviewOpen(true);
                                    setShowCertificateModal(false);
                                }}
                                className="flex-1 bg-amber-600 hover:bg-amber-750 text-white font-black gap-2 shadow-md flex items-center justify-center py-2.5"
                            >
                                <Printer size={15} /> Imprimir Alta Resolução
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
