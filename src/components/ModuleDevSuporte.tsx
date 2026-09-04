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

import { preprocessImage, storeMedia, getMedia, clearMedia } from '../lib/indexedDbService';

import {
  ChurchContext, CachedImage, callGeminiAI, resizeImageAndCompress,
  Button, FormInput, FormSelect, BackupModal, ConfirmModal,
  GenericTable, GenericModal, PageBoundaryIndicators, DocumentPreviewModal, PrintSystem,
  AutocompleteRecipient, SharedEmailModule,
  playMenuSound, playNotificationSound, getTodayDate, formatDateLocal, isValidCPF, formatCPF,
  copyToClipboard, generatePixPayload, safeRender, safeText, ICON_MAP, getIcon, THEME_COLORS, REGRA_DOMINGOS, PortalHeader
} from '../App';

// Exporting component
const ModuleDevSuporte = () => {
    const context = useContext(ChurchContext);
    if (!context) return null;
    const { db, setDoc, doc, dbFirestore, appId, addToast, deleteDoc } = context;
    const chats = db.support_chats || [];
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const handleDeleteChat = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir permanentemente esta conversa de suporte?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', id));
            setSelectedChatId(null);
            addToast("Conversa de suporte excluída do sistema!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao excluir conversa.", "error");
        }
    };

    const handleDeleteAllChats = async () => {
        if (!confirm("⚠️ ATENÇÃO CRÍTICA: Isso excluirá permanentemente TODAS as conversas e históricos de mensagens de suporte do banco de dados! Deseja mesmo prosseguir com esta limpeza completa?")) return;
        try {
            const batchPromises = chats.map((c: any) => 
                deleteDoc(doc(doc.firestore || dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', c.id))
            );
            await Promise.all(batchPromises);
            setSelectedChatId(null);
            addToast("Histórico completo de conversas apagado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao excluir todas as conversas.", "error");
        }
    };
    
    // Sort chats by recent
    const sortedChats = [...chats].sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const currentChat = chats.find((c: any) => c.id === selectedChatId);

    // Compute simple support performance metrics
    const totalCalls = chats.length;
    const totalBotCalls = chats.filter((c: any) => c.status === 'bot').length;
    const totalHumanCalls = chats.filter((c: any) => c.status === 'human').length;
    const totalMsgs = chats.reduce((acc: number, cur: any) => acc + (cur.messages || []).length, 0);

    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(currentChat) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentChat?.messages.length, selectedChatId]);

    const handleSendDev = async () => {
        if (!replyText.trim() || !currentChat) return;
        const msg = {
            id: String(Date.now()),
            sender_type: 'dev',
            sender_name: 'Suporte Dev',
            text: replyText,
            timestamp: new Date().toISOString()
        };
        
        const updatedChat = {
            ...currentChat,
            status: 'human', // Developer taking over changes status to human
            updated_at: new Date().toISOString(),
            messages: [...currentChat.messages, msg]
        };
        
        setReplyText("");
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', currentChat.id), updatedChat);
            addToast("Mensagem de suporte enviada e modo manual ativado.", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao enviar mensagem.", "error");
        }
    };

    const handleToggleBot = async (chat: any) => {
        const updatedChat = {
            ...chat,
            status: chat.status === 'bot' ? 'human' : 'bot',
            updated_at: new Date().toISOString()
        };
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats', chat.id), updatedChat);
            addToast(`Resposta Automática do Robô AI foi ${updatedChat.status === 'bot' ? 'habilitada' : 'desabilitada'} para este canal.`, "success");
        } catch (e) {
            console.error(e);
        }
    };
    
    const preProgrammed = [
        "Olá, vou verificar essa situação agora mesmo junto com o sistema.",
        "Poderia me enviar mais detalhes do erro que você obteve, por favor?",
        "O problema de banco de dados foi resolvido pelo suporte! Pode efetuar login novamente.",
        "Obrigado pelo seu retorno! Estamos sempre prontos para apoiar sua igreja.",
        "Sua demanda de backup/financeiro foi registrada e nossa equipe técnica está analisando."
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-50 rounded-2xl text-fuchsia-600 shadow-sm"><Headset size={32}/></div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Portal de Suporte Técnico do Desenvolvedor</h2>
                        <p className="text-slate-500 text-sm font-medium">Controle canais abertos, veja mensagens automáticas e tome controle manual das requisições de suporte.</p>
                    </div>
                </div>
                {chats.length > 0 && (
                    <button 
                        onClick={handleDeleteAllChats}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all font-black text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
                        title="Limpar todas as conversas do suporte"
                    >
                        <Trash2 size={16}/> APAGAR TODAS AS MENSAGENS
                    </button>
                )}
            </div>

            {/* Dashboard Mini metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-1">
                <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 p-4 rounded-2xl border border-fuchsia-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest">Atendimentos Totais</span>
                    <span className="text-2xl font-black text-fuchsia-900 mt-1">{totalCalls}</span>
                </div>
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 p-4 rounded-2xl border border-indigo-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Sob Robô AI</span>
                    <span className="text-2xl font-black text-indigo-900 mt-1">{totalBotCalls}</span>
                </div>
                <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Sob Controle Manual</span>
                    <span className="text-2xl font-black text-amber-900 mt-1">{totalHumanCalls}</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Mensagens Excedidas</span>
                    <span className="text-2xl font-black text-emerald-900 mt-1">{totalMsgs}</span>
                </div>
            </div>
            
            {/* Main view area */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden max-h-[80vh]">
                {/* Lateral left sidebar list */}
                <div className="w-full md:w-1/3 min-w-[320px] bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden h-full">
                    <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                        <span className="font-black text-slate-700 tracking-wide text-xs">LISTAGEM DE TICKETS</span>
                        <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-xs font-bold">{chats.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50/20">
                        {sortedChats.length === 0 && (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                <MessageCircle size={40} className="mb-3 opacity-30"/>
                                <span className="font-semibold text-sm">Nenhum chamado de suporte aberto.</span>
                            </div>
                        )}
                        {sortedChats.map((c: any) => (
                            <button 
                                key={c.id} 
                                onClick={() => setSelectedChatId(c.id)}
                                className={`w-full text-left p-4 rounded-2xl transition-all ${selectedChatId === c.id ? 'bg-fuchsia-50/40 border-fuchsia-200 shadow-sm ring-2 ring-fuchsia-200/50' : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'} border flex flex-col gap-2`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className="font-bold text-sm text-slate-800 truncate flex-1">{c.user_name}</span>
                                    <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black tracking-widest shrink-0 uppercase ${c.status === 'bot' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {c.status === 'bot' ? 'Robô AI' : 'Manual'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 truncate font-medium bg-slate-50 p-2 rounded-lg leading-relaxed">
                                    {c.messages[c.messages.length - 1]?.text || 'Sem mensagens.'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium text-right mt-1">
                                    Última interação: {new Date(c.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Right detailed conversation window */}
                <div className="flex-1 bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden h-full">
                    {currentChat ? (
                        <>
                            {/* Window header */}
                            <div className="p-5 bg-slate-50 border-b flex justify-between items-center z-10 shadow-sm flex-wrap gap-2">
                                <div>
                                    <h3 className="font-black text-slate-800 text-base md:text-lg">Canal: {currentChat.user_name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold">Identificação ID: {currentChat.id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`text-[10px] font-black tracking-wider flex items-center gap-2 cursor-pointer px-4.5 py-2.5 rounded-xl transition-colors border shadow-sm select-none ${currentChat.status === 'bot' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                                        <input type="checkbox" checked={currentChat.status === 'bot'} onChange={() => handleToggleBot(currentChat)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"/>
                                        DEIXAR IA RESPONDER AUTOMATICAMENTE
                                    </label>
                                    <button 
                                        onClick={() => handleDeleteChat(currentChat.id)}
                                        className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all font-black text-[10px] tracking-wider px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                                        title="Excluir este chamado de suporte permanentemente"
                                    >
                                        <Trash2 size={12}/> EXCLUIR TICKET
                                    </button>
                                </div>
                            </div>
                            
                            {/* Conversations Body */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-6 custom-scrollbar relative">
                                <div className="text-center">
                                    <span className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Suporte Iniciado</span>
                                </div>
                                {currentChat.messages.map((m: any, i: number) => (
                                    <div key={m.id || i} className={`flex flex-col gap-1 ${m.sender_type !== 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase px-1">
                                            {m.sender_type === 'user' ? 'Administrador / ' + m.sender_name : m.sender_name}
                                        </div>
                                        <div className={`p-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${m.sender_type === 'bot' ? 'bg-indigo-600 rounded-tr-none text-white' : m.sender_type === 'dev' ? 'bg-fuchsia-600 rounded-tr-none text-white' : 'bg-white border rounded-tl-none text-slate-700'}`}>
                                            <div className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed">{m.text}</div>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold px-1">{new Date(m.timestamp).toLocaleString()}</div>
                                    </div>
                                ))}
                                <div ref={bottomRef}></div>
                            </div>
                            
                            {/* Actions & input trigger */}
                            <div className="p-4 bg-white border-t">
                                {/* Fast preset responses */}
                                <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 self-center tracking-widest shrink-0 mr-1 flex items-center gap-1">Fast Reply:</span>
                                    {preProgrammed.map((pr, i) => (
                                        <button key={i} onClick={() => setReplyText(pr)} className="whitespace-nowrap px-4 py-2 bg-slate-50 border hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-700 rounded-xl text-[11px] font-bold text-slate-600 transition-colors shadow-sm">
                                            {pr}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <textarea
                                        className="flex-1 border bg-slate-50 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none shadow-inner text-slate-800"
                                        rows={2}
                                        placeholder="Digite a resposta manual para o usuário..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendDev())}
                                    />
                                    <button onClick={handleSendDev} disabled={!replyText.trim()} className="bg-fuchsia-600 text-white rounded-2xl px-6 hover:bg-fuchsia-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center shrink-0">
                                        <Send size={24}/>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <Headset size={64} className="mb-4 text-slate-300"/>
                            <p className="font-medium text-slate-500 text-sm">Selecione um chamado de suporte ao lado para visualizar e interagir.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- NOVO: MÓDULO BÍBLIA DE ESTUDO DO PREGADOR ---
export const BIBLE_BOOKS = [
    { name: 'Gênesis', chapters: 50, test: 'VT' }, { name: 'Êxodo', chapters: 40, test: 'VT' }, { name: 'Levítico', chapters: 27, test: 'VT' },
    { name: 'Números', chapters: 36, test: 'VT' }, { name: 'Deuteronômio', chapters: 34, test: 'VT' }, { name: 'Josué', chapters: 24, test: 'VT' },
    { name: 'Juízes', chapters: 21, test: 'VT' }, { name: 'Rute', chapters: 4, test: 'VT' }, { name: '1 Samuel', chapters: 31, test: 'VT' },
    { name: '2 Samuel', chapters: 24, test: 'VT' }, { name: '1 Reis', chapters: 22, test: 'VT' }, { name: '2 Reis', chapters: 25, test: 'VT' },
    { name: '1 Crônicas', chapters: 29, test: 'VT' }, { name: '2 Crônicas', chapters: 36, test: 'VT' }, { name: 'Esdras', chapters: 10, test: 'VT' },
    { name: 'Neemias', chapters: 13, test: 'VT' }, { name: 'Ester', chapters: 10, test: 'VT' }, { name: 'Jó', chapters: 42, test: 'VT' },
    { name: 'Salmos', chapters: 150, test: 'VT' }, { name: 'Provérbios', chapters: 31, test: 'VT' }, { name: 'Eclesiastes', chapters: 12, test: 'VT' },
    { name: 'Cânticos', chapters: 8, test: 'VT' }, { name: 'Isaías', chapters: 66, test: 'VT' }, { name: 'Jeremias', chapters: 52, test: 'VT' },
    { name: 'Lamentações', chapters: 5, test: 'VT' }, { name: 'Ezequiel', chapters: 48, test: 'VT' }, { name: 'Daniel', chapters: 12, test: 'VT' },
    { name: 'Oseias', chapters: 14, test: 'VT' }, { name: 'Joel', chapters: 3, test: 'VT' }, { name: 'Amós', chapters: 9, test: 'VT' },
    { name: 'Obadias', chapters: 1, test: 'VT' }, { name: 'Jonas', chapters: 4, test: 'VT' }, { name: 'Miqueias', chapters: 7, test: 'VT' },
    { name: 'Naum', chapters: 3, test: 'VT' }, { name: 'Habacuque', chapters: 3, test: 'VT' }, { name: 'Sofonias', chapters: 3, test: 'VT' },
    { name: 'Ageu', chapters: 2, test: 'VT' }, { name: 'Zacarias', chapters: 14, test: 'VT' }, { name: 'Malaquias', chapters: 4, test: 'VT' },
    
    { name: 'Mateus', chapters: 28, test: 'NT' }, { name: 'Marcos', chapters: 16, test: 'NT' }, { name: 'Lucas', chapters: 24, test: 'NT' },
    { name: 'João', chapters: 21, test: 'NT' }, { name: 'Atos', chapters: 28, test: 'NT' }, { name: 'Romanos', chapters: 16, test: 'NT' },
    { name: '1 Coríntios', chapters: 16, test: 'NT' }, { name: '2 Coríntios', chapters: 13, test: 'NT' }, { name: 'Gálatas', chapters: 6, test: 'NT' },
    { name: 'Efésios', chapters: 6, test: 'NT' }, { name: 'Filipenses', chapters: 4, test: 'NT' }, { name: 'Colossenses', chapters: 4, test: 'NT' },
    { name: '1 Tessalonicenses', chapters: 5, test: 'NT' }, { name: '2 Tessalonicenses', chapters: 3, test: 'NT' }, { name: '1 Timóteo', chapters: 6, test: 'NT' },
    { name: '2 Timóteo', chapters: 4, test: 'NT' }, { name: 'Tito', chapters: 3, test: 'NT' }, { name: 'Filemom', chapters: 1, test: 'NT' },
    { name: 'Hebreus', chapters: 13, test: 'NT' }, { name: 'Tiago', chapters: 5, test: 'NT' }, { name: '1 Pedro', chapters: 5, test: 'NT' },
    { name: '2 Pedro', chapters: 3, test: 'NT' }, { name: '1 João', chapters: 5, test: 'NT' }, { name: '2 João', chapters: 1, test: 'NT' },
    { name: '3 João', chapters: 1, test: 'NT' }, { name: 'Judas', chapters: 1, test: 'NT' }, { name: 'Apocalipse', chapters: 22, test: 'NT' }
];


export default ModuleDevSuporte;
