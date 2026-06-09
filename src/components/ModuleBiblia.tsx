import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, ChevronDown, ChevronRight, Plus, Edit, Trash2, Printer, 
  Search, Menu, X, DollarSign, BookOpen, Globe, Calendar, UserCheck, 
  CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Filter, MapPin, Briefcase, Heart, GraduationCap, Shield, Download,
  ClipboardList, Gift, PieChart as PieChartIcon, Upload, Image as ImageIcon, Database, Save, RefreshCw, Trash,
  Phone, Mail, Code, Info, Share2, Home, FileBadge, Stamp, Wifi, WifiOff, Star, HeartHandshake, Camera,
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, User, UserPlus, Video,
  FileSpreadsheet, CheckCheck, Flag, Smile, Copy, Bold, Italic, Type, Activity, Receipt, RotateCcw, Ban, Archive, Printer as PrinterIcon,
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, FileInput, RotateCcw as RestoreIcon,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sun, Moon, Package, Flame, Minus, Newspaper, BookOpenText, IdCard, Badge,
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';

import { preprocessImage, storeMedia, getMedia, clearMedia, getAllKeys } from '../lib/indexedDbService';

import {
  ChurchContext, CachedImage, callGeminiAI, resizeImageAndCompress,
  Button, FormInput, FormSelect, BackupModal, ConfirmModal,
  GenericTable, GenericModal, PageBoundaryIndicators, DocumentPreviewModal, PrintSystem,
  AutocompleteRecipient, SharedEmailModule,
  playMenuSound, playNotificationSound, getTodayDate, formatDateLocal, isValidCPF, formatCPF,
  copyToClipboard, generatePixPayload, safeRender, safeText, ICON_MAP, getIcon, THEME_COLORS, REGRA_DOMINGOS, PortalHeader
} from '../App';

import { BIBLE_BOOKS } from './ModuleDevSuporte';

// Exporting component
const ModuleBiblia = () => {
    const { addToast, isOnline } = useContext(ChurchContext);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [readingData, setReadingData] = useState(null); // Text and Study
    const [readingPages, setReadingPages] = useState([]); // NOVO: Paginação
    const [currentReadingPage, setCurrentReadingPage] = useState(0); // NOVO: Paginação
    const [isLoading, setIsLoading] = useState(false);

    // Recursos de Caching & Modo Offline
    const [cachedChapters, setCachedChapters] = useState<Set<string>>(new Set());
    const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

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

    const vtBooks = BIBLE_BOOKS.filter(b => b.test === 'VT');
    const ntBooks = BIBLE_BOOKS.filter(b => b.test === 'NT');

    const parseStudyContent = (content: string) => {
        let texto = "";
        let contexto = "";
        let esboco = "";
        let conclusao = "";

        try {
            const p1 = content.split('[CONTEXTO]');
            texto = p1[0].replace('[TEXTO]', '').trim();
            
            const p2 = p1[1].split('[ESBOCO]');
            contexto = p2[0].trim();
            
            const p3 = p2[1].split('[CONCLUSAO]');
            esboco = p3[0].trim();
            conclusao = p3[1].trim();
        } catch (e) {
            // Fallback de segurança caso a IA omita as tags
            texto = content;
        }

        // Dividir o texto bíblico em páginas de 50 linhas
        const textLines = texto.split('\n');
        const textPages = [];
        const LINES_PER_PAGE = 50;
        
        for (let i = 0; i < textLines.length; i += LINES_PER_PAGE) {
            textPages.push(textLines.slice(i, i + LINES_PER_PAGE).join('\n'));
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

            // Se não houver cache e estiver offline, avisa o usuário
            if (!isOnline) {
                addToast("Este capítulo não está disponível offline. Conecte-se à internet para carregá-lo.", "warning");
                setIsLoading(false);
                return;
            }
            
            const prompt = `Atue como a Bíblia Sagrada na versão NVI (Nova Versão Internacional) e como a Bíblia de Estudo do Pregador (CPAD). O usuário deseja estudar: ${book.name} capítulo ${chapter}.
            
POR FAVOR, SIGA ESTA ESTRUTURA RIGOROSAMENTE EM MARKDOWN E USE AS TAGS ABAIXO PARA SEPARAR CADA SEÇÃO:

[TEXTO]
# 📖 ${book.name} ${chapter} (NVI)
[Transcreva aqui TODO o texto bíblico do capítulo exato na versão NVI, separando os versículos por quebra de linha com números em negrito, ex: **1** No princípio...]

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico
[Explique brevemente o cenário deste capítulo]

[ESBOCO]
## 📝 Esboço Homilético
**Tema Sugerido:** [Título impactante para pregar sobre este capítulo]
**Texto-Base:** [Versículo chave do capítulo]

**I. [Primeiro Tópico Principal]**
- [Breve explicação]
- [Referência cruzada]

**II. [Segundo Tópico Principal]**
- [Breve explicação]

**III. [Terceiro Tópico Principal]**
- [Breve explicação]

[CONCLUSAO]
## 💡 Conclusão e Aplicação
[Resumo de como aplicar a mensagem hoje na igreja]`;

            const result = await callGeminiAI(prompt, 3);
            if (!result) {
                throw new Error("Resposta da IA vazia");
            }
            
            // Grava no IndexedDB automaticamente para uso offline futuro
            await storeMedia(cacheKey, result);
            updateCachedChapters();

            const parsedPages = parseStudyContent(result);
            setReadingPages(parsedPages);
            setReadingData(result);
        } catch (error) {
            console.error(error);
            addToast("Falha ao buscar o capítulo bíblico com a IA.", "error");
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
        addToast(`Iniciando download de ${book.name} (${book.chapters} capítulos)...`, "info");

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

                const prompt = `Atue como a Bíblia Sagrada na versão NVI (Nova Versão Internacional) e como a Bíblia de Estudo do Pregador (CPAD). O usuário deseja estudar: ${book.name} capítulo ${cap}.
                
POR FAVOR, SIGA ESTA ESTRUTURA RIGOROSAMENTE EM MARKDOWN E USE AS TAGS ABAIXO PARA SEPARAR CADA SEÇÃO:

[TEXTO]
# 📖 ${book.name} ${cap} (NVI)
[Transcreva aqui TODO o texto bíblico do capítulo exato na versão NVI, separando os versículos por quebra de linha com números em negrito, ex: **1** No princípio...]

[CONTEXTO]
# 📚 ESTUDO DO PREGADOR
## 🌍 Contexto Histórico e Teológico
[Explique brevemente o cenário deste capítulo]

[ESBOCO]
## 📝 Esboço Homilético
**Tema Sugerido:** [Título impactante para pregar sobre este capítulo]
**Texto-Base:** [Versículo chave do capítulo]

**I. [Primeiro Tópico Principal]**
- [Breve explicação]
- [Referência cruzada]

**II. [Segundo Tópico Principal]**
- [Breve explicação]

**III. [Terceiro Tópico Principal]**
- [Breve explicação]

[CONCLUSAO]
## 💡 Conclusão e Aplicação
[Resumo de como aplicar a mensagem hoje na igreja]`;

                const result = await callGeminiAI(prompt, 3);
                if (result) {
                    await storeMedia(cacheKey, result);
                    successCount++;
                }
                
                // Leve atraso para consistência nas requisições da API
                await new Promise(r => setTimeout(r, 600));
            } catch (err) {
                console.error(`Erro ao pré-baixar o capítulo ${cap} de ${book.name}:`, err);
            }
        }

        addToast(`Download concluído! ${successCount} de ${book.chapters} capítulos estão agora em cache offline!`, "success");
        setDownloadingBook(null);
        updateCachedChapters();
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

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
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
                        <div className="animate-slideRight">
                            <button onClick={() => { setSelectedBook(null); setSelectedChapter(null); setReadingData(null); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 mb-4 px-2 py-1 bg-slate-50 rounded-lg w-full border border-slate-200">
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
                                    const cacheKey = `bible_study_${selectedBook.name.toLowerCase().replace(/\s+/g, '_')}_${cap}`;
                                    const isChapterCached = cachedChapters.has(cacheKey);
                                    return (
                                        <button 
                                            key={cap} 
                                            onClick={() => handleSelectChapter(selectedBook, cap)}
                                            className={`relative aspect-square rounded-xl font-bold flex flex-col items-center justify-center transition-all border shadow-sm ${selectedChapter === cap ? 'bg-slate-900 text-white border-slate-900 scale-110' : 'bg-white text-slate-700 hover:bg-amber-100 hover:border-amber-300 border-slate-200'}`}
                                        >
                                            <span>{cap}</span>
                                            {isChapterCached && (
                                                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500" title="Disponível Offline" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ÁREA DE LEITURA (PÁGINA DO LIVRO) */}
            <div className="flex-1 flex flex-col h-2/3 md:h-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-amber-700 p-10 text-center animate-entrance">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-amber-100 mb-6 relative">
                            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
                            <BookOpen size={32} className="animate-pulse"/>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 font-serif">Buscando as Escrituras...</h3>
                        <p className="text-slate-600 font-medium max-w-md">A preparar o capítulo e a redigir as notas de estudo e o esboço homilético para a sua edificação.</p>
                    </div>
                ) : readingPages.length > 0 ? (
                    <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn relative">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                            <div className="max-w-3xl mx-auto bg-[#faf8f5] shadow-[0_10px_40px_rgba(0,0,0,0.05)] rounded-sm border border-[#e5e0d8] p-8 md:p-14 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-[1px] before:bg-red-200/50 font-serif">
                                
                                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-800/10">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedBook.name} • Capítulo {selectedChapter}</span>
                                    <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded shadow-sm">NVI</span>
                                </div>

                                <div className="prose prose-lg md:prose-xl max-w-none prose-slate font-serif prose-headings:font-black prose-headings:text-slate-900 prose-p:leading-loose prose-strong:text-slate-900 prose-a:text-amber-600 marker:text-amber-500 whitespace-pre-wrap">
                                    {readingPages[currentReadingPage]}
                                </div>
                                
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
                                <ChevronLeft size={18}/> <span className="hidden sm:inline">Página Anterior</span>
                            </Button>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-slate-700 font-serif">
                                    {currentReadingPage + 1} <span className="text-slate-400 font-medium">de</span> {readingPages.length}
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
                                <span className="hidden sm:inline">Próxima Página</span> <ChevronRight size={18}/>
                            </Button>
                        </div>
                        
                        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20">
                             <button onClick={() => { copyToClipboard(readingData); addToast("Estudo completo copiado!", "success"); }} className="p-3 bg-white border border-slate-300 rounded-full text-slate-600 hover:text-amber-600 hover:bg-amber-50 shadow-lg transition-colors" title="Copiar Estudo Completo"><Copy size={20}/></button>
                        </div>
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
