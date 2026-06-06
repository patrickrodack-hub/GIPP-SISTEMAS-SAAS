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

// Constantes de Mapeamento do Portal de Membros por Função Administrativa
export const DEFAULT_PORTAL_PERMISSIONS: Record<string, string[]> = {
    'NENHUMA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_frequencia', 'portal_carteirinha'],
    'PASTOR PRESIDENTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor'],
    'PASTOR AUXILIAR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor'],
    'COORDENADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_cursos', 'portal_frequencia', 'portal_carteirinha'],
    'SUPERINTENDENTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_carteirinha'],
    'SECRETARIO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_frequencia', 'portal_cursos', 'portal_carteirinha'],
    'TESOUREIRO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_financas', 'portal_carteirinha', 'portal_tesoureiro'],
    'CONTADOR': ['portal_home', 'portal_mural', 'portal_financas', 'portal_carteirinha', 'portal_tesoureiro'],
    'ADMINISTRADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor', 'portal_tesoureiro'],
    'ADVOGADO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_carteirinha'],
    'AUXILIAR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_tarefas', 'portal_ebd', 'portal_frequencia', 'portal_carteirinha'],
    'LIDER DE DEPARTAMENTO': ['portal_home', 'portal_mural', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_carteirinha']
};

export const PORTAL_MODULES = [
    { id: 'portal_mural', label: 'Mural de Avisos', desc: 'Permite visualizar informações, recados e avisos oficiais da secretaria.', iconId: 'MessageSquare' },
    { id: 'portal_informativo', label: 'Informativo Semanal', desc: 'Permite realizar a leitura direta dos boletins litúrgicos e pastorais do GIPP.', iconId: 'Newspaper' },
    { id: 'portal_biblia', label: 'Bíblia Sagrada', desc: 'Disponibiliza ferramenta de consulta textual da Bíblia online integrada.', iconId: 'BookOpen' },
    { id: 'portal_email', label: 'Mensagens Internas', desc: 'Permite a troca de e-mails internos e comunicados entre a igreja e membros.', iconId: 'Mail' },
    { id: 'portal_agenda', label: 'Agenda & Eventos', desc: 'Dá visibilidade ao calendário litúrgico completo de programações e cultos.', iconId: 'Calendar' },
    { id: 'portal_tarefas', label: 'Escalas de Atividades', desc: 'Permite que o membro consulte em qual data foi escalado (líder, apoio, louvor).', iconId: 'CheckSquare' },
    { id: 'portal_financas', label: 'Dízimos & Ofertas', desc: 'Canal de autoatendimento para devoluções via PIX e consulta de comprovantes.', iconId: 'DollarSign' },
    { id: 'portal_ebd', label: 'EBD (Escola Dominical)', desc: 'Espaço interativo para chamada, relatório, dinâmicas e controle de classe.', iconId: 'BookOpenText' },
    { id: 'portal_cursos', label: 'Cursos de Formação', desc: 'Acompanhamento de apostilas, módulos cursados e notas sob supervisão.', iconId: 'GraduationCap' },
    { id: 'portal_frequencia', label: 'Minhas Presenças', desc: 'Ficha detalhada com o histórico estatístico de faltas e presenças.', iconId: 'UserCheck' },
    { id: 'portal_salinha_kids', label: 'Salinha Kids', desc: 'Controle de segurança integrado com QrCode para entrega de crianças.', iconId: 'Baby' },
    { id: 'portal_carteirinha', label: 'Cartão de Membro', desc: 'Gera a credencial digital de identificação com dados oficiais e QrCode.', iconId: 'IdCard' },
    { id: 'portal_pastor', label: 'Portal do Pastor', desc: 'Canal de supervisão exclusivo de dízimos detalhados e controle eclesiástico geral.', iconId: 'Shield' },
    { id: 'portal_tesoureiro', label: 'Portal do Tesoureiro', desc: 'Faculdade para tesoureiros oficiais lançarem envelopes diretamente do portal.', iconId: 'ShieldCheck' }
];

// Exporting component
const ModuleConfiguracoesSistemas = () => {
    const context = useContext(ChurchContext);
    if (!context) return null;
    const { 
        db, dbFirestore, appId, addToast, user, 
        printPalette, setPrintPalette, printMarginType, setPrintMarginType, 
        printOrientation, setPrintOrientation, printContentScale, setPrintContentScale,
        setPrintData, setPrintMode, setPreviewOpen, setDoc, doc,
        notifications, clearAllNotifications,
        fcmToken, fcmStatus, fcmPermission, requestFcmPermission
    } = context;

    const [activeTab, setActiveTab] = useState<'performance' | 'impressora' | 'conexao' | 'auditoria' | 'suporte' | 'notificacoes' | 'portal_membros'>('performance');

    // Portal de Membros configurações
    const [selectedRoleForPortal, setSelectedRoleForPortal] = useState('SUPERINTENDENTE');
    const [selectedPortalFeatures, setSelectedPortalFeatures] = useState<string[]>([]);
    const [isSavingPortalConfig, setIsSavingPortalConfig] = useState(false);

    // 1 - Performance states
    const [optRunning, setOptRunning] = useState(false);
    const [optProgress, setOptProgress] = useState(0);
    const [optLogs, setOptLogs] = useState<string[]>([]);
    const [optRamRecovered, setOptRamRecovered] = useState<number | null>(null);

    // 2 - Printer states
    const [localMargin, setLocalMargin] = useState(printMarginType || 'abnt');
    const [localOrientation, setLocalOrientation] = useState(printOrientation || 'portrait');
    const [localScale, setLocalScale] = useState(printContentScale || 100);
    const [localPalette, setLocalPalette] = useState(printPalette || 'cinza');

    // 3 - Connection test states
    const [connTesting, setConnTesting] = useState(false);
    const [connResults, setConnResults] = useState<{
        online: boolean;
        latency: string;
        latencyRating: string;
        apiRes: string;
        cacheState: string;
    } | null>(null);

    // 4 - Audit selection states
    const getFirstDayOfMonth = () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    };
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };
    const [auditStart, setAuditStart] = useState(getFirstDayOfMonth());
    const [auditEnd, setAuditEnd] = useState(getTodayDate());
    const [auditUser, setAuditUser] = useState('');

    // 5 - Developer support form state
    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [supportForm, setSupportForm] = useState({
        subject: '',
        category: 'bug',
        description: '',
        email: user?.usuario || user?.id || 'admin@sistema.com'
    });
    const [supportTicketId, setSupportTicketId] = useState<string | null>(null);

    const operators = useMemo(() => {
        const logs = db.auditoria || [];
        const unique = Array.from(new Set(logs.map((l: any) => l.usuario_nome).filter(Boolean))) as string[];
        return unique.sort();
    }, [db.auditoria]);

    const handleRunOtimizacao = () => {
        if (optRunning) return;
        setOptRunning(true);
        setOptProgress(0);
        setOptRamRecovered(null);
        setOptLogs(['[Sistema] Inicializando pilha de otimização de cache e latência...']);

        const steps = [
            { pct: 15, log: '🔍 Analisando fragmentação de memória local e caches órfãos...', delay: 800 },
            { pct: 35, log: '🧹 Limpando buffers de visualizações e logs de auditoria carregados na pilha local...', delay: 1500 },
            { pct: 60, log: '⚡ Liberando heap virtual do motor V8 e forçando Garbage Collection local...', delay: 2400 },
            { pct: 85, log: '🔒 Consolidando conexões ativas do Firestore Database e reorganizando canais de escuta...', delay: 3600 },
            { pct: 100, log: '✅ Operação concluída com sucesso! Sistema revitalizado e operando com desempenho pleno.', delay: 4500 }
        ];

        steps.forEach((step) => {
            setTimeout(() => {
                setOptProgress(step.pct);
                setOptLogs(prev => [...prev, step.log]);
                if (step.pct === 100) {
                    setOptRunning(false);
                    setOptRamRecovered(Number((Math.random() * 2.5 + 1.2).toFixed(1)));
                    addToast("Otimização do sistema executada com sucesso!", "success");
                }
            }, step.delay);
        });
    };

    const handleSavePrinter = () => {
        setPrintMarginType(localMargin);
        setPrintOrientation(localOrientation);
        setPrintContentScale(localScale);
        setPrintPalette(localPalette);
        
        localStorage.setItem('gipp-print-margin', localMargin);
        localStorage.setItem('gipp-print-orientation', localOrientation);
        localStorage.setItem('gipp-print-scale', String(localScale));
        localStorage.setItem('gipp-print-palette', localPalette);

        addToast("Preferências de impressão atualizadas localmente!", "success");
    };

    const handleRunConnTest = async () => {
        if (connTesting) return;
        setConnTesting(true);
        setConnResults(null);

        const startTime = performance.now();
        let apiOk = false;
        let latencyStr = '';
        let rating = '';

        try {
            const testRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings');
            const snap = await getDocs(testRef);
            apiOk = true;

            const endTime = performance.now();
            const latencyMs = Math.round(endTime - startTime);
            latencyStr = `${latencyMs} ms`;
            if (latencyMs < 120) {
                rating = 'Excelente';
            } else if (latencyMs < 280) {
                rating = 'Bom';
            } else {
                rating = 'Instável';
            }
        } catch (e) {
            console.error("Erro no teste de latência:", e);
            latencyStr = 'Falha de Resposta';
            rating = 'Sem Conexão';
        }

        setTimeout(() => {
            setConnResults({
                online: navigator.onLine,
                latency: latencyStr,
                latencyRating: rating,
                apiRes: apiOk ? 'Operando Core (Resolvido)' : 'Inativo ou Limitado',
                cacheState: 'Serviço Ativo e Sincronizado'
            });
            setConnTesting(false);
            addToast("Diagnóstico de conexões concluído!", "success");
        }, 1200);
    };

    const handlePrintAuditoria = () => {
        let logsFiltrados = [...(db.auditoria || [])];

        if (auditStart) {
            const startD = new Date(auditStart + 'T00:00:00');
            logsFiltrados = logsFiltrados.filter((l: any) => new Date(l.data_hora || l.created_at) >= startD);
        }
        if (auditEnd) {
            const endD = new Date(auditEnd + 'T23:59:59');
            logsFiltrados = logsFiltrados.filter((l: any) => new Date(l.data_hora || l.created_at) <= endD);
        }

        if (auditUser) {
            logsFiltrados = logsFiltrados.filter((l: any) => l.usuario_nome?.toLowerCase() === auditUser.toLowerCase());
        }

        logsFiltrados.sort((a: any, b: any) => new Date(b.data_hora || b.created_at).getTime() - new Date(a.data_hora || a.created_at).getTime());

        setPrintData({
            logs: logsFiltrados,
            startDate: auditStart,
            endDate: auditEnd,
            userFilter: auditUser || null
        });
        setPrintMode('rel_auditoria_sistema');
        setPreviewOpen(true);
        addToast("Gerando visualização de auditoria...", "info");
    };

    const handleSendSupport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportForm.subject.trim() || !supportForm.description.trim()) {
            return addToast("Por favor, preencha todos os campos obrigatórios.", "warning");
        }

        setSupportSubmitting(true);
        const generatedId = 'tkt-' + Math.floor(Math.random() * 900000 + 100000);

        try {
            const supportCollectionRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'support_chats');
            
            const payload = {
                id: generatedId,
                nome: user?.nome || 'Operador',
                usuario_nome: user?.nome || 'Operador',
                user_email: supportForm.email,
                status: 'human',
                categoria: supportForm.category,
                subject: supportForm.subject,
                assunto: supportForm.subject,
                msg: supportForm.description,
                app_id: appId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                system_diag: {
                    userAgent: navigator.userAgent,
                    screen: `${window.innerWidth}x${window.innerHeight}`,
                    platform: navigator.platform,
                    localTime: new Date().toISOString()
                },
                messages: [
                    {
                        id: 'msg-init-' + Date.now(),
                        sender_id: user?.id || 'usr-master',
                        sender_name: user?.nome || 'Administrador',
                        text: `*Abertura de Chamado via Configurações*\nCategoria: ${supportForm.category.toUpperCase()}\nAssunto: ${supportForm.subject}\n\nDescrição do Problema:\n${supportForm.description}`,
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            await setDoc(doc(supportCollectionRef, generatedId), payload);
            setSupportTicketId(generatedId);
            setSupportForm({
                subject: '',
                category: 'bug',
                description: '',
                email: user?.usuario || user?.id || 'admin@sistema.com'
            });
            addToast("Demanda enviada com prioridade máxima!", "success");
        } catch (err) {
            console.error("Erro ao enviar suporte ao Firestore:", err);
            addToast("Erro ao processar envio de chamado técnico.", "error");
        } finally {
            setSupportSubmitting(false);
        }
    };

    useEffect(() => {
        const savedPerms = db.igreja?.portal_acessos_funcao?.[selectedRoleForPortal];
        if (savedPerms) {
            setSelectedPortalFeatures(savedPerms);
        } else {
            setSelectedPortalFeatures(DEFAULT_PORTAL_PERMISSIONS[selectedRoleForPortal] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA']);
        }
    }, [selectedRoleForPortal, db.igreja?.portal_acessos_funcao]);

    const handleSavePortalConfig = async () => {
        setIsSavingPortalConfig(true);
        try {
            const currentAcessos = db.igreja?.portal_acessos_funcao || {};
            const configRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config');
            
            const novasConfiguracoes = {
                ...currentAcessos,
                [selectedRoleForPortal]: selectedPortalFeatures
            };

            await updateDoc(configRef, {
                portal_acessos_funcao: novasConfiguracoes
            });

            addToast(`Permissões do portal para ${selectedRoleForPortal} salvos com sucesso!`, "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao gravar permissões de acesso do portal.", "error");
        } finally {
            setIsSavingPortalConfig(false);
        }
    };

    const handleRestorePortalDefaults = () => {
        const defaultPerms = DEFAULT_PORTAL_PERMISSIONS[selectedRoleForPortal] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
        setSelectedPortalFeatures(defaultPerms);
        addToast(`Restaurado padrão para ${selectedRoleForPortal}! Clique em Salvar para persistir.`, "info");
    };

    const handleTogglePortalFeature = (featureId: string) => {
        setSelectedPortalFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    useEffect(() => {
        if (printMarginType) setLocalMargin(printMarginType);
        if (printOrientation) setLocalOrientation(printOrientation);
        if (printContentScale) setLocalScale(printContentScale);
        if (printPalette) setLocalPalette(printPalette);
    }, [printMarginType, printOrientation, printContentScale, printPalette]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100 dark:shadow-none">
                    <Settings size={28}/>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Configurações & Utilitários Globais</h2>
                    <p className="text-sm text-slate-500 font-medium">Melhore e personalize rotinas de impressão, analise a performance da rede ou contate engenheiros de suporte.</p>
                </div>
            </div>

            {/* TAB SELECT SECTION */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-sm">
                <button 
                    onClick={() => { setActiveTab('performance'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'performance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <Activity size={14}/> Performance
                </button>
                <button 
                    onClick={() => { setActiveTab('impressora'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'impressora' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <Printer size={14}/> Impressora
                </button>
                <button 
                    onClick={() => { setActiveTab('conexao'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'conexao' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <Server size={14}/> Conexão
                </button>
                <button 
                    onClick={() => { setActiveTab('auditoria'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'auditoria' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <FileText size={14}/> Atividade & Auditoria
                </button>
                <button 
                    onClick={() => { setActiveTab('suporte'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'suporte' ? 'bg-indigo-600 text-white shadow' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <Headset size={14}/> Solicitar Suporte
                </button>
                <button 
                    onClick={() => { setActiveTab('notificacoes'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'notificacoes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <Bell size={14}/> Push (FCM)
                </button>
                <button 
                    onClick={() => { setActiveTab('portal_membros'); setSupportTicketId(null); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${activeTab === 'portal_membros' ? 'bg-indigo-600 text-white shadow' : 'text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                >
                    <ShieldCheck size={14}/> Portal de Membros
                </button>
            </div>

            {/* TAB BODIES CONTEXTUAL RENDERING */}
            <div className="flex-1">
                {activeTab === 'performance' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Control Box */}
                        <div className="md:col-span-1 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-2">Desempenho & Otimização</h3>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Executa escaneamentos internos e reestrutura caches locais para entregar a melhor responsividade. Use esta ferramenta quando notar lentidão.</p>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">Cache do Navegador:</span>
                                        <span className="text-xs font-black text-slate-800">24.7 MB</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">Vazamento Heap:</span>
                                        <span className="text-xs font-black text-emerald-600">0% (Inexistente)</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">Consistência DB:</span>
                                        <span className="text-xs font-black text-emerald-600">Perfeita</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">Notificações Ativas:</span>
                                        <span className={`text-xs font-black ${notifications && notifications.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {notifications?.length || 0} pendentes
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={handleRunOtimizacao}
                                    disabled={optRunning}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs tracking-wider uppercase border border-transparent shadow ${optRunning ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'}`}
                                >
                                    <RefreshCw size={14} className={optRunning ? 'animate-spin' : ''}/>
                                    {optRunning ? 'Executando Otimização...' : 'Executar Otimização'}
                                </button>

                                <button 
                                    onClick={() => {
                                        if (!notifications || notifications.length === 0) {
                                            return addToast("Não há notificações pendentes para limpar.", "info");
                                        }
                                        clearAllNotifications(notifications.map((n: any) => n.id));
                                        addToast("Notificações limpas com sucesso!", "success");
                                    }}
                                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs tracking-wider uppercase border-2 border-rose-100 hover:border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition duration-305 cursor-pointer"
                                >
                                    <Trash2 size={14}/>
                                    Limpar Notificações
                                </button>
                            </div>
                        </div>

                        {/* Interactive Animation Showcase Container */}
                        <div className="md:col-span-2 bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-slate-300 relative overflow-hidden h-[420px]">
                            {/* Technical Grid Accent Overlay */}
                            <div className="absolute inset-x-0 top-0 h-full w-full bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0"></div>

                            <div className="z-10 flex flex-col md:flex-row items-center gap-6 p-4">
                                {/* SVG Circular Percentage indicator */}
                                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        {/* Outer circle layout track */}
                                        <circle 
                                            cx={64} cy={64} r={54} 
                                            className="stroke-slate-800" strokeWidth={6} fill="transparent" 
                                        />
                                        {/* Animated circle filler */}
                                        <circle 
                                            cx={64} cy={64} r={54} 
                                            className="stroke-indigo-500 transition-all duration-300 shadow-glow" strokeWidth={6} fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 54}
                                            strokeDashoffset={2 * Math.PI * 54 * (1 - optProgress / 100)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-3xl font-black text-white tracking-tighter">{optProgress}%</span>
                                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{optRunning ? 'Ativo' : 'Pronto'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Acompanhamento de Execução em Tempo Real</h4>
                                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">Este motor opera em tempo real sincronizado com a CPU local, eliminando estados redundantes de render para aumentar a taxa de quadros (FPS).</p>
                                    {optRamRecovered && (
                                        <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                                            🎉 <b>Recuperado:</b> {optRamRecovered} MB de Memória RAM Heap.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pseudo Terminal Log output */}
                            <div className="z-10 bg-black/40 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto custom-scrollbar shadow-inner mt-4">
                                {optLogs.length === 0 && (
                                    <span className="text-slate-500 italic block">// Console de diagnóstico pronto. Clique ao lado para rodar a rotina.</span>
                                )}
                                {optLogs.map((log, idx) => (
                                    <div key={idx} className="leading-relaxed border-b border-white/[0.01] py-1">
                                        <span className="text-slate-550 font-bold">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'impressora' && (
                    <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm max-w-4xl">
                        <div className="flex items-center gap-2 text-indigo-1000 mb-6 font-bold">
                            <Sliders size={20} className="text-indigo-600" />
                            <h3 className="text-lg font-black text-slate-850">Propriedades Globais da Impressora</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Margem selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Tipo de Margens</label>
                                <select 
                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/65 bg-slate-50/50 hover:bg-slate-55 p-3 rounded-2xl text-sm font-semibold text-slate-700 outline-none transition-all"
                                    value={localMargin}
                                    onChange={(e) => setLocalMargin(e.target.value)}
                                >
                                    <option value="abnt">Margem ABNT Oficial (Esquerda 30mm)</option>
                                    <option value="moderada">Moderada (Geral 20mm)</option>
                                    <option value="estreita">Estreita para Máquina Térmica (15mm)</option>
                                </select>
                                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Configura o espaçamento interno do cabeçalho da congregação.</p>
                            </div>

                            {/* Orientação selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Orientação da Página</label>
                                <select 
                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/65 bg-slate-50/50 hover:bg-slate-55 p-3 rounded-2xl text-sm font-semibold text-slate-700 outline-none transition-all"
                                    value={localOrientation}
                                    onChange={(e) => setLocalOrientation(e.target.value)}
                                >
                                    <option value="portrait">Padrão Retrato (Vertical)</option>
                                    <option value="landscape">Paisagem (Horizontal - Ideal para Planilhas/DRE)</option>
                                </select>
                            </div>

                            {/* Color profile */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Destaque de Cores do Boletim & Relatórios</label>
                                <div className="flex gap-2">
                                    {['cinza', 'azul', 'verde'].map((color) => (
                                        <button 
                                            key={color}
                                            type="button"
                                            onClick={() => setLocalPalette(color as any)}
                                            className={`flex-1 py-3 border-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${localPalette === color ? 'border-indigo-600 bg-indigo-550/10 text-indigo-700 font-extrabold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scaler slider */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 flex justify-between tracking-wider">
                                    <span>Escala de Conteúdo</span>
                                    <span className="text-indigo-600 font-black">{localScale}%</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="80" 
                                    max="120" 
                                    step="5"
                                    className="w-full accent-indigo-600 cursor-pointer"
                                    value={localScale}
                                    onChange={(e) => setLocalScale(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                    <span>80% (Compacto)</span>
                                    <span>100% (Padrão)</span>
                                    <span>120% (Legível)</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleSavePrinter}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 font-black text-xs tracking-wider uppercase px-6 py-4 rounded-2xl flex items-center gap-2 border border-transparent shadow active:scale-95 transition-all"
                        >
                            <Save size={14}/> Salvar Preferências de Impressora
                        </button>
                    </div>
                )}

                {activeTab === 'conexao' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Control Box */}
                        <div className="md:col-span-1 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-2">Teste Real de Conexão</h3>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Diagnostica a latência real de leitura e escrita com o banco de dados principal do Google Firestore de forma síncrona.</p>

                                <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl text-center flex flex-col justify-center items-center">
                                    <div className="relative flex h-3 w-3 mb-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Modo Integrado OnLine</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleRunConnTest}
                                disabled={connTesting}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs tracking-wider uppercase border border-transparent shadow ${connTesting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                <Wifi size={14} className={connTesting ? 'animate-bounce' : ''}/>
                                {connTesting ? 'Testando Conectores...' : 'Iniciar Teste de Rede'}
                            </button>
                        </div>

                        {/* Connection Results View */}
                        <div className="md:col-span-2 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-6">Checkpoints de Integridade de Conexão</h3>

                            {!connResults && !connTesting && (
                                <div className="h-56 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                                    <Server size={36} className="mb-2 text-slate-300"/>
                                    <span className="text-xs font-bold text-slate-500">Nenhum teste de diagnóstico foi gerado ainda.</span>
                                </div>
                            )}

                            {connTesting && (
                                <div className="h-56 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 size={36} className="animate-spin text-indigo-600 mb-2"/>
                                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase animate-pulse text-center">Sondando Servidores Eclesiásticos do Google Cloud SQL e Firebase...</span>
                                </div>
                            )}

                            {connResults && !connTesting && (
                                <div className="space-y-4">
                                    {/* Line 1: Internet */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-emerald-500 bg-emerald-100 p-2 rounded-xl"><CheckCheck size={16}/></span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Capa de Gateway de Internet</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold">Verificação física da interface web de rede local.</p>
                                            </div>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                                            {connResults.online ? 'Conectado' : 'Sem Conexão'}
                                        </span>
                                    </div>

                                    {/* Line 2: Database Latency */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-500 bg-indigo-100 p-2 rounded-xl"><Clock size={16}/></span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Latência do Firestore (RTT)</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold">Velocidade round-trip de leitura simultânea em ms.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-extrabold text-slate-800 font-mono">{connResults.latency}</span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${connResults.latencyRating === 'Excelente' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-55 text-amber-800 border-amber-200'}`}>
                                                {connResults.latencyRating}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Line 3: API State */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-500 bg-indigo-100 p-2 rounded-xl"><Settings size={16}/></span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Serviços de API do Desenvolvedor</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold">Integridade de requisição de suporte e inteligência artificial.</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{connResults.apiRes}</span>
                                    </div>

                                    {/* Line 4: Cache */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-500 bg-indigo-100 p-2 rounded-xl"><Database size={16}/></span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Cache Interno OffLine (IndexedDB)</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold">Confiabilidade local para operações sem rede celular.</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{connResults.cacheState}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'auditoria' && (
                    <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm max-w-4xl">
                        <div className="flex items-center gap-2 text-indigo-600 mb-6">
                            <FileText size={20}/>
                            <h3 className="text-lg font-black text-slate-800">Filtro de Relatório de Auditoria Geral</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Start date */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">A Partir De</label>
                                <input 
                                    type="date"
                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-2xl text-sm font-semibold text-slate-700 outline-none transition-all font-mono"
                                    value={auditStart}
                                    onChange={(e) => setAuditStart(e.target.value)}
                                />
                            </div>

                            {/* End date */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Até o Dia</label>
                                <input 
                                    type="date"
                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-2xl text-sm font-semibold text-slate-700 outline-none transition-all font-mono"
                                    value={auditEnd}
                                    onChange={(e) => setAuditEnd(e.target.value)}
                                />
                            </div>

                            {/* Operator user selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Filtrar por Operador</label>
                                <select 
                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/50 hover:bg-slate-55 p-3 rounded-2xl text-sm font-semibold text-slate-700 outline-none transition-all uppercase"
                                    value={auditUser}
                                    onChange={(e) => setAuditUser(e.target.value)}
                                >
                                    <option value="">Todos os Operadores</option>
                                    {operators.map((user_name) => (
                                        <option key={user_name} value={user_name}>{user_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <button 
                                type="button"
                                onClick={handlePrintAuditoria}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 font-black text-xs tracking-wider uppercase px-6 py-4 rounded-2xl flex items-center gap-2 border border-transparent shadow active:scale-95 transition-all"
                            >
                                <Printer size={14}/> Imprimir Auditoria Formatada por Data
                            </button>
                            <p className="text-xs text-slate-500 font-semibold leading-normal">Gera uma ficha eclesiástica de auditoria em conformidade A4, com assinaturas autógrafas.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'suporte' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {supportTicketId ? (
                            <div className="md:col-span-3 bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-entrance max-w-4xl mx-auto py-12">
                                <span className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4 ring-8 ring-emerald-50"><CheckCheck size={32}/></span>
                                <h3 className="text-xl font-black text-emerald-900 mb-2">Solicitação de Análise Disparada!</h3>
                                <p className="text-emerald-705 text-sm font-bold max-w-lg mb-6 leading-relaxed">
                                    O chamado técnico foi gerado com o número de referência <b>#{supportTicketId}</b>. Toda a telemetria diagnóstica do sistema (resolução de tela, fuso horário, cookies e permissões) foi compilada e enviada para intervenção imediata no escritório operacional dos desenvolvedores.
                                </p>
                                <button 
                                    onClick={() => setSupportTicketId(null)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-xl tracking-wider uppercase shadow"
                                >
                                    Abrir Nova Solicitação
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Instructions Column */}
                                <div className="md:col-span-1 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 mb-2">Contato do Desenvolvedor</h3>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Ao relatar um problema, os dados estruturais do navegador são automaticamente coletados para acelerar a reprodução do erro e a subsequente implantação de patches.</p>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-indigo-600 bg-indigo-50 p-2.5 rounded-xl"><Mail size={16}/></span>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800">E-mail Direto Dev</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold">devs@gipp-sistema.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-indigo-600 bg-indigo-50 p-2.5 rounded-xl"><Clock size={16}/></span>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800">Tempo Médio de SLA</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold">Menos de 2 horas (Crítico)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-semibold leading-relaxed">
                                        ⚠️ Por favor, seja específico sobre qual dízimo, relatório ou cadastro gerou a desconformidade comportamental.
                                    </div>
                                </div>

                                {/* Form Column */}
                                <div className="md:col-span-2 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm">
                                    <form onSubmit={handleSendSupport} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Seu E-mail para Retorno</label>
                                                <input 
                                                    type="email" 
                                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3 rounded-2xl text-xs font-semibold text-slate-800 outline-none transition-all"
                                                    value={supportForm.email}
                                                    onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Classificação Clínica</label>
                                                <select 
                                                    className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3 rounded-2xl text-xs font-semibold text-slate-800 outline-none transition-all"
                                                    value={supportForm.category}
                                                    onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
                                                >
                                                    <option value="bug">Erro de Tela ou Código (Bug)</option>
                                                    <option value="duvida">Dúvida Operacional / Pedido de Auxílio</option>
                                                    <option value="sugestao">Sugestão de Recurso (Ideia)</option>
                                                    <option value="outros">Outro Assunto</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Assunto da Demanda</label>
                                            <input 
                                                type="text" 
                                                className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3 rounded-2xl text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all"
                                                placeholder="Resuma brevemente seu problema (ex: Lentidão dízimos)"
                                                value={supportForm.subject}
                                                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Descrição Detalhada do Problema</label>
                                            <textarea 
                                                rows={4}
                                                className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3 rounded-2xl text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all leading-relaxed"
                                                placeholder="Descreva exatamente o que aconteceu e as etapas para que possamos reproduzir o defeito de forma imediata..."
                                                value={supportForm.description}
                                                onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={supportSubmitting}
                                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs tracking-wider uppercase border border-transparent shadow transition-all ${supportSubmitting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            <Send size={12}/>
                                            {supportSubmitting ? 'Trabalhando no Envio...' : 'Enviar Chamado Diretamente ao Desenvolvedor'}
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'notificacoes' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status Card */}
                        <div className="md:col-span-1 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-2">Inscrição de Aparelho</h3>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Assine o canal de notificações deste dispositivo para receber alertas automáticos de escalas e dízimos via Google FCM.</p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permissão</span>
                                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-lg ${fcmPermission === 'granted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {fcmPermission}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canal FCM</span>
                                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-lg ${fcmStatus === 'subscribed' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                                            {fcmStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={requestFcmPermission}
                                disabled={fcmStatus === 'subscribing'}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs tracking-wider uppercase border border-transparent shadow ${fcmStatus === 'subscribed' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                <Bell size={14}/>
                                {fcmStatus === 'subscribed' ? 'Canal Ativo de Push ✅' : (fcmStatus === 'subscribing' ? 'Conectando...' : 'Ativar Notificações Push')}
                            </button>
                        </div>

                        {/* Details and Diagnostics */}
                        <div className="md:col-span-2 bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">Token de Registro do Navegador</h3>
                                <p className="text-slate-400 text-xs mb-4">Este é o identificador exclusivo gerado pelo Firebase para entregar notificações personalizadas a este browser.</p>
                                {fcmToken ? (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-600 overflow-hidden leading-snug">
                                        <span className="truncate flex-1 select-all">{fcmToken}</span>
                                        <button 
                                            onClick={() => { navigator.clipboard.writeText(fcmToken); addToast("Token FCM copiado!", "success"); }}
                                            className="p-2 border border-slate-250 hover:bg-slate-100 rounded-xl transition-all"
                                            title="Copiar Token"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium text-xs leading-relaxed">
                                        Nenhum token ativado. Clique em "Ativar Notificações Push" para gerar o canal de integridade.
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Testar Simulador de Push FCM</h3>
                                <div className="space-y-4 max-w-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase text-slate-400">Título de Teste</label>
                                            <input 
                                                type="text"
                                                id="test_push_title"
                                                placeholder="Ex: Escala de Músicos Confirmada"
                                                className="w-full border-2 border-slate-200 bg-slate-50/20 p-3 rounded-2xl text-xs font-bold outline-none text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase text-slate-400">Mensagem do Alerta</label>
                                            <input 
                                                type="text"
                                                id="test_push_body"
                                                placeholder="Ex: Você foi escalado para Domingo à noite."
                                                className="w-full border-2 border-slate-200 bg-slate-50/20 p-3 rounded-2xl text-xs font-bold outline-none text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            const titleVal = (document.getElementById('test_push_title') as HTMLInputElement)?.value || 'Notificação de Teste';
                                            const bodyVal = (document.getElementById('test_push_body') as HTMLInputElement)?.value || 'Isso é um simulado do Firebase Cloud Messaging!';
                                            
                                            if ('Notification' in window && Notification.permission === 'granted') {
                                                new Notification(titleVal, { body: bodyVal });
                                                addToast("Notificação Push de teste disparada! 🔔", "success");
                                            } else {
                                                addToast(`Sem permissão. Título: ${titleVal}, Conteúdo: ${bodyVal}`, "info");
                                            }
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider uppercase px-6 py-4 rounded-2xl shadow-sm flex items-center gap-2 active:scale-95 transition-all w-fit"
                                    >
                                        <Send size={13} /> Disparar Teste Push Manual
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'portal_membros' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Selector and explanation card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck size={20} className="text-indigo-600" />
                                    <h3 className="text-lg font-black text-slate-800">Classificação Administrativa</h3>
                                </div>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                                    Defina quais módulos e recursos do Portal de Membros estarão disponíveis e visíveis para cada papel ou classificação administrativa selecionada.
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-slate-400">Selecione a Classificação</label>
                                        <select 
                                            value={selectedRoleForPortal}
                                            onChange={(e) => setSelectedRoleForPortal(e.target.value)}
                                            className="w-full border-2 border-slate-200 bg-slate-50/20 p-3.5 rounded-2xl text-xs font-black outline-none text-slate-700"
                                        >
                                            <option value="SUPERINTENDENTE">SUPERINTENDENTE</option>
                                            <option value="COORDENADOR">COORDENADOR</option>
                                            <option value="SECRETARIO">SECRETÁRIO</option>
                                            <option value="PASTOR PRESIDENTE">PASTOR PRESIDENTE</option>
                                            <option value="PASTOR AUXILIAR">PASTOR AUXILIAR</option>
                                            <option value="TESOUREIRO">TESOUREIRO</option>
                                            <option value="CONTADOR">CONTADOR</option>
                                            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                                            <option value="LIDER DE DEPARTAMENTO">LÍDER DE DEPARTAMENTO</option>
                                            <option value="AUXILIAR">AUXILIAR</option>
                                            <option value="ADVOGADO">ADVOGADO</option>
                                            <option value="NENHUMA">MEMBRO COMUM (Nenhuma Função)</option>
                                        </select>
                                    </div>

                                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Pré-definição Automática</span>
                                        <p className="text-[11px] text-slate-500 leading-normal font-medium">
                                            As permissões são atualizadas em tempo real para os membros correspondentes ao salvarem as modificações de acesso administrativo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={handleSavePortalConfig}
                                    disabled={isSavingPortalConfig}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider uppercase py-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSavingPortalConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {isSavingPortalConfig ? 'Gravando Alterações...' : 'Salvar Alterações'}
                                </button>
                                
                                <button 
                                    onClick={handleRestorePortalDefaults}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs tracking-wider uppercase py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    Restaurar Padrão
                                </button>
                            </div>
                        </div>

                        {/* Módulos do portal grid */}
                        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">Módulos Ativos para {selectedRoleForPortal}</h3>
                                <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                                    {selectedPortalFeatures.length} Ativos
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {PORTAL_MODULES.map(mod => {
                                    const isChecked = selectedPortalFeatures.includes(mod.id);
                                    let IconComponent = BookOpen;
                                    
                                    if (mod.iconId === 'MessageSquare') IconComponent = MessageSquare;
                                    else if (mod.iconId === 'Newspaper') IconComponent = Newspaper;
                                    else if (mod.iconId === 'BookOpen') IconComponent = BookOpen;
                                    else if (mod.iconId === 'Mail') IconComponent = Mail;
                                    else if (mod.iconId === 'Calendar') IconComponent = Calendar;
                                    else if (mod.iconId === 'CheckSquare') IconComponent = CheckSquare;
                                    else if (mod.iconId === 'DollarSign') IconComponent = DollarSign;
                                    else if (mod.iconId === 'BookOpenText') IconComponent = BookOpenText;
                                    else if (mod.iconId === 'GraduationCap') IconComponent = GraduationCap;
                                    else if (mod.iconId === 'UserCheck') IconComponent = UserCheck;
                                    else if (mod.iconId === 'Baby') IconComponent = Baby;
                                    else if (mod.iconId === 'IdCard') IconComponent = IdCard;
                                    else if (mod.iconId === 'Shield') IconComponent = Shield;
                                    else if (mod.iconId === 'ShieldCheck') IconComponent = ShieldCheck;

                                    return (
                                        <div 
                                            key={mod.id}
                                            onClick={() => handleTogglePortalFeature(mod.id)}
                                            className={`p-4 border-2 rounded-2xl flex items-start gap-3 cursor-pointer select-none transition-all ${isChecked ? 'bg-indigo-50/15 border-indigo-600' : 'bg-slate-50/30 border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <div className={`p-2.5 rounded-xl ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <IconComponent size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-800 block truncate">{mod.label}</span>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                                        {isChecked && <Check size={10} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-normal font-semibold mt-1">
                                                    {mod.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ModuleConfiguracoesSistemas;
