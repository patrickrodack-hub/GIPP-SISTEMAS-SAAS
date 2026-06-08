import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import { createPortal } from 'react-dom';
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
const ModuleEBD = () => {
    const { db, dbFirestore, appId, user, openModal, addToast, deleteItem } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [aiLesson, setAiLesson] = useState<any>(null);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    // --- ESTADOS DE GESTÃO DE CHAMADA (PRESENÇA) INTERATIVA ---
    const [chamadaModalOpen, setChamadaModalOpen] = useState(false);
    const [selectedTurmaForChamada, setSelectedTurmaForChamada] = useState<any>(null);
    const [chamadaDate, setChamadaDate] = useState(getTodayDate());
    const [chamadaRevista, setChamadaRevista] = useState('');
    const [chamadaLicaoNum, setChamadaLicaoNum] = useState('');
    const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, { presente: boolean; trouxeBiblia: boolean; trouxeRevista: boolean; oferta: boolean }>>({});

    // --- ESTADOS DO FILTRO TRIMESTRAL DE LIÇÕES ---
    const [licaoPeriod, setLicaoPeriod] = useState('todos');
    const [licaoStartDate, setLicaoStartDate] = useState('');
    const [licaoEndDate, setLicaoEndDate] = useState('');

    // --- ESTADOS DO HISTÓRICO INDIVIDUAL DO ALUNO ---
    const [alunoHistoryModalOpen, setAlunoHistoryModalOpen] = useState(false);
    const [selectedAlunoForHistory, setSelectedAlunoForHistory] = useState<any>(null);

    // --- ESTADOS PEDAGÓGICOS DA LIÇÃO DE IA ---
    const [aiGeneratingQuiz, setAiGeneratingQuiz] = useState(false);
    const [aiQuizText, setAiQuizText] = useState('');

    const turmasFiltradas = (db.ebd?.turmas || []).filter(t => congregacaoFilter === 'todas' || t.congregacao_id === congregacaoFilter || (!t.congregacao_id && congregacaoFilter === 'sede'));
    
    // Os alunos e lições são baseados nas turmas filtradas
    const alunosFiltrados = (db.ebd?.alunos || []).filter(a => turmasFiltradas.some(t => t.id === a.turma_id));
    const licoesFiltradasTotal = (db.ebd?.licoes || []).filter(l => turmasFiltradas.some(t => t.id === l.turma_id));

    // --- FILTRAGEM EFETIVA DE LIÇÕES POR TIPO DE DATA/PERÍODO ---
    const filteredLicoesPeriodoFull = useMemo(() => {
        let list = [...licoesFiltradasTotal];
        
        const parseDate = (dStr: string) => {
            if (!dStr) return null;
            return new Date(dStr + 'T00:00:00');
        };
        
        const start = licaoStartDate ? parseDate(licaoStartDate) : null;
        const end = licaoEndDate ? parseDate(licaoEndDate) : null;
        
        if (start || end) {
            list = list.filter(item => {
                if (!item.data) return false;
                const itemDate = parseDate(item.data);
                if (!itemDate) return false;
                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            });
        }
        
        return list;
    }, [licoesFiltradasTotal, licaoStartDate, licaoEndDate]);

    // --- GESTÃO DE FILTRO DE DATA/PERÍODO ---
    const handleLicaoPeriodChange = (val: string) => {
        setLicaoPeriod(val);
        const today = new Date();
        const currYear = today.getFullYear();
        
        if (val === 'todos') {
            setLicaoStartDate('');
            setLicaoEndDate('');
        } else if (val === '1_trimestre') {
            setLicaoStartDate(`${currYear}-01-01`);
            setLicaoEndDate(`${currYear}-03-31`);
        } else if (val === '2_trimestre') {
            setLicaoStartDate(`${currYear}-04-01`);
            setLicaoEndDate(`${currYear}-06-30`);
        } else if (val === '3_trimestre') {
            setLicaoStartDate(`${currYear}-07-01`);
            setLicaoEndDate(`${currYear}-09-30`);
        } else if (val === '4_trimestre') {
            setLicaoStartDate(`${currYear}-10-01`);
            setLicaoEndDate(`${currYear}-12-31`);
        } else if (val === 'este_mes') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setLicaoStartDate(first.toISOString().split('T')[0]);
            setLicaoEndDate(last.toISOString().split('T')[0]);
        } else if (val === '30_dias') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            setLicaoStartDate(past.toISOString().split('T')[0]);
            setLicaoEndDate(today.toISOString().split('T')[0]);
        }
    };

    // --- SALVAR CHAMADA DE EBD ---
    const handleSaveChamada = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTurmaForChamada || !chamadaDate || !chamadaRevista || !chamadaLicaoNum) {
            addToast('Por favor, preencha a Revista, número da lição e data.', 'error');
            return;
        }

        const countOfPresent = Object.values(studentAttendanceMap).filter((st: any) => st.presente).length;

        const payload = {
            data: chamadaDate,
            turma_id: selectedTurmaForChamada.id,
            revista: chamadaRevista,
            licao_numero: chamadaLicaoNum,
            qtd_presentes: countOfPresent,
            detalhes_chamada: studentAttendanceMap,
            conteudo_estudo: '',
            congregacao_id: selectedTurmaForChamada.congregacao_id || user?.congregacao_id || 'sede'
        };

        try {
            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes');
            await addDoc(colRef, payload);
            addToast(`Chamada registrada com sucesso! ${countOfPresent} alunos presentes.`, 'success');
            setChamadaModalOpen(false);
            setStudentAttendanceMap({});
            setChamadaRevista('');
            setChamadaLicaoNum('');
        } catch (err: any) {
            addToast(`Erro ao registrar chamada: ${err.message}`, 'error');
        }
    };

    // --- ACIONAR MODAL DE CHAMADA ---
    const openChamadaModal = (turma: any) => {
        setSelectedTurmaForChamada(turma);
        const alunosDaTurma = (db.ebd?.alunos || []).filter(a => a.turma_id === turma.id);
        const map: any = {};
        alunosDaTurma.forEach(a => {
            map[a.id] = { presente: true, trouxeBiblia: true, trouxeRevista: true, oferta: false };
        });
        setStudentAttendanceMap(map);
        setChamadaDate(getTodayDate());
        setChamadaRevista('');
        setChamadaLicaoNum('');
        setChamadaModalOpen(true);
    };

    // --- INDÍCES DO ALUNO INDIVIDUAL ---
    const getStudentStats = (alunoId: string) => {
        const licoesComChamada = licoesFiltradasTotal.filter(l => l.detalhes_chamada);
        const totalAulas = licoesComChamada.length;
        if (totalAulas === 0) return { taxaPresenca: 0, biblias: 0, revistas: 0, ofertas: 0, presencas: 0 };

        let presencas = 0;
        let biblias = 0;
        let revistas = 0;
        let ofertas = 0;

        licoesComChamada.forEach(lic => {
            const det = lic.detalhes_chamada[alunoId];
            if (det) {
                if (det.presente) {
                    presencas++;
                    if (det.trouxeBiblia) biblias++;
                    if (det.trouxeRevista) revistas++;
                    if (det.oferta) ofertas++;
                }
            }
        });

        return {
            taxaPresenca: Math.round((presencas / totalAulas) * 100),
            presencas,
            biblias,
            revistas,
            ofertas,
            totalAulas
        };
    };

    // --- CÁLCULO DOS DADOS DO GRÁFICO DE PRESENÇA RECENTE ---
    const chartData = useMemo(() => {
        const grouped: Record<string, number> = {};
        licoesFiltradasTotal.forEach(l => {
            if (!l.data) return;
            const dStr = l.data.split('-').reverse().slice(0, 2).join('/');
            grouped[dStr] = (grouped[dStr] || 0) + (parseInt(l.qtd_presentes) || 0);
        });
        const sorted = Object.entries(grouped)
            .map(([date, qtd]) => ({ date, qtd }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-8); // últimas 8 chamadas registradas
        return sorted;
    }, [licoesFiltradasTotal]);

    // --- CÁLCULO DE MEMBROS NÃO MATRICULADOS NA EBD (RECRUTAMENTO) ---
    const membrosNaoMatriculados = useMemo(() => {
        const matriculadosIds = new Set((db.ebd?.alunos || []).map(a => a.membro_id).filter(Boolean));
        return (db.membros || [])
            .filter(m => !matriculadosIds.has(m.id))
            .filter(m => congregacaoFilter === 'todas' || m.congregacao_id === congregacaoFilter || (!m.congregacao_id && congregacaoFilter === 'sede'))
            .slice(0, 5); // sugerir até 5 membros
    }, [db.ebd?.alunos, db.membros, congregacaoFilter]);

    const menuItems = [{id: 1, label: 'Dashboard', icon: LayoutDashboard}, {id: 2, label: 'Turmas & Profs', icon: Users}, {id: 3, label: 'Matrícula Alunos', icon: UserPlus}, {id: 4, label: 'Controle de Lições', icon: BookOpen}, {id: 5, label: 'Mural de Turmas', icon: Layers}];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);

    const handleGenerateLessonPlan = async (licao) => {
        setAiLesson({ loading: true, text: '', title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: licao.capa || null });
        
        const prompt = `Atue como um teólogo especialista no material oficial da CPAD. 
        Pesquise e use obrigatoriamente como base de conteúdo e imagens as seguintes fontes: o currículo e portal oficial da CPAD (Casa Publicadora das Assembleias de Deus), Google Books API e Sistema EBD.
        O usuário deseja o conteúdo de estudo para a revista com o tema: "${licao.revista}", especificamente a Lição número ${licao.licao_numero || '1'}. 
        
        ${!licao.capa ? 'Por favor, retorne no final do texto a URL de uma imagem da capa desta revista específica encontrada nas suas buscas. Formate a URL exatamente assim: URL_CAPA=[url_da_imagem]. Se não encontrar nenhuma capa, coloque URL_CAPA=null.' : ''}

        Gere um conteúdo fiel, interativo e completo contendo:
        1. Título da Lição
        2. Texto Áureo e Verdade Prática
        3. Leitura Bíblica em Classe
        4. Introdução
        5. Tópicos e Subtópicos explicados
        6. Conclusão.
        
        Utilize formatação Markdown bem estruturada e rica.`;
        
        const result = await callGeminiAI(prompt, 5);
        
        let texto = result;
        let capaUrl = licao.capa || null;
        
        if (!licao.capa) {
            const match = result.match(/URL_CAPA=\[?(.*?)\]?/);
            if (match && match[1] && match[1] !== 'null') {
                capaUrl = match[1].trim();
                texto = result.replace(match[0], ''); // Remove a URL do texto final para não aparecer no UI
            }
        }
        
        setAiLesson({ loading: false, text: texto, title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: capaUrl });
    };

    // Cálculos do Dashboard EBD
    const totalTurmas = turmasFiltradas.length || 0;
    const totalAlunos = alunosFiltrados.length || 0;
    const totalMembros = (db.membros || []).filter(m => congregacaoFilter === 'todas' || m.congregacao_id === congregacaoFilter || (!m.congregacao_id && congregacaoFilter === 'sede')).length || 0;
    const percAlunos = totalMembros > 0 ? ((totalAlunos / totalMembros) * 100).toFixed(1) : 0;

    const licoesFiltradas = licoesFiltradasTotal.filter(l => l.data && l.data.startsWith(filterDate));
    const totalLicoesPeriodo = licoesFiltradas.length;
    const totalPresentesPeriodo = licoesFiltradas.reduce((acc, l) => acc + (parseInt(l.qtd_presentes) || 0), 0);
    const mediaPresenca = totalLicoesPeriodo > 0 ? Math.round(totalPresentesPeriodo / totalLicoesPeriodo) : 0;

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance relative">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100"><BookOpen size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Escola Bíblica Dominical</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de turmas, lições e frequência</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Filtro: Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 w-full md:w-auto">
                    {menuItems.map(item => <TabButton key={item.id} item={item} />)}
                </div>
                {tab === 1 && (
                    <div className="flex items-center gap-3 bg-white/40 p-2 rounded-2xl border border-white/50">
                        <Calendar size={18} className="text-indigo-600 ml-2"/>
                        <input type="month" value={filterDate} onChange={e => setFilterDate(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 uppercase"/>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Turmas */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-blue-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><Users size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalTurmas}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Turmas Ativas</p>
                                </div>
                            </div>
                            
                            {/* Card 2: Alunos */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-indigo-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><UserPlus size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalAlunos}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alunos Matriculados</p>
                                </div>
                            </div>
                            
                            {/* Card 3: Lições no Período */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-amber-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><BookOpen size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalLicoesPeriodo}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lições Aplicadas</p>
                                    <div className="bg-amber-50 p-2 rounded-lg mt-2">
                                        <p className="text-[10px] font-bold text-amber-700 text-center">Média de {mediaPresenca} presentes/aula</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Alunos x Membros */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-emerald-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><GraduationCap size={20}/></div>
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{totalAlunos}</h3>
                                        <span className="text-lg font-bold text-slate-400 mb-1">/ {totalMembros}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Engajamento EBD</p>
                                    <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden flex"><div className="h-full bg-emerald-500" style={{width: `${percAlunos}%`}}></div></div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{percAlunos}% da igreja</p>
                                </div>
                            </div>
                        </div>

                        {/* NOVO: Seção Gráficas e Analytics do Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Gráfico de Frequência Recrente */}
                            <div className="lg:col-span-2 glass-card p-6 rounded-[2rem] border border-slate-200/80 bg-white/50 backdrop-blur-sm shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Frequência Semanal (Presença)</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">Total de presentes nas últimas lições registradas</p>
                                    </div>
                                    <span className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><Activity size={18} /></span>
                                </div>
                                <div className="h-64 w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold"/>
                                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold"/>
                                                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="qtd" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorQtd)" name="Presentes" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <BookOpen size={36} className="opacity-30 mb-2" />
                                            <p className="text-xs font-bold">Nenhum dado de frequência registrado no período.</p>
                                            <p className="text-[10px]">Realize a chamada das classes para alimentar o gráfico.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Campanha de Matrícula (Membros Não Matriculados) */}
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 bg-white/50 backdrop-blur-sm shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Campanha de Integração</h4>
                                            <p className="text-[10px] text-slate-400 font-bold">Membros ativos sem matrícula na EBD</p>
                                        </div>
                                        <span className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Sparkles size={18} /></span>
                                    </div>
                                    <div className="space-y-3">
                                        {membrosNaoMatriculados.map(m => (
                                            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors shadow-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 font-bold text-[10px] flex items-center justify-center border border-slate-200">{m.nome.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 leading-tight">{m.nome}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold">{m.cargo_ministerial || 'Membro'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => openModal('ebd_aluno', { membro_id: m.id, nome: m.nome })}
                                                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                                                >
                                                    Matricular
                                                </button>
                                            </div>
                                        ))}
                                        {membrosNaoMatriculados.length === 0 && (
                                            <div className="py-8 text-center text-slate-400 italic text-xs">
                                                ✨ Incrível! 100% dos membros estão integrados à EBD.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 bg-indigo-50/50 p-3 rounded-2xl text-[10px] text-indigo-800 font-bold border border-indigo-100 flex items-center gap-2">
                                    <Info size={14} className="shrink-0 text-indigo-600" />
                                    <span>Ao matricular membros sem classe, você aumenta o engajamento e a retenção teológica da igreja!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {tab === 2 && <GenericTable title="Gestão de Turmas" type="ebd_turma" data={turmasFiltradas} columns={[{header:'Turma', key:'nome'}, {header:'Sala', key:'sala'}, {header:'Professores', key:'prof1_id', render: (t) => [t.prof1_id, t.prof2_id, t.prof3_id].map(id => db.membros.find(m=>m.id===id)?.nome?.split(' ')[0]).filter(Boolean).join(', ') || 'Sem professor'}]} />}
                {tab === 3 && (
                    <div className="h-full flex flex-col space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-3xl flex justify-between items-center shrink-0">
                            <div>
                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Ficha de Desempenho e Matrícula</h4>
                                <p className="text-[10px] text-slate-500 font-bold">Consulte a taxa de estudos concluídos, bíblia, revista e presença geral dos alunos.</p>
                            </div>
                            <Button onClick={() => openModal('ebd_aluno')} variant="primary" className="shadow-blue-500/20"><Plus size={16}/> Matricular Novo Aluno</Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <GenericTable 
                                title="Matrícula de Alunos" 
                                type="ebd_aluno" 
                                data={alunosFiltrados} 
                                columns={[
                                    {header:'Aluno', key:'nome'}, 
                                    {header:'Turma', key:'turma_id', render: a => turmasFiltradas.find(t=>t.id===a.turma_id)?.nome || '-'},
                                    {
                                        header: 'Presença Geral', 
                                        key: 'id', 
                                        render: a => {
                                            const st = getStudentStats(a.id);
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                                        <div className="bg-indigo-600 h-full" style={{ width: `${st.taxaPresenca}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-650">{st.taxaPresenca}% ({st.presencas}/{st.totalAulas})</span>
                                                </div>
                                            );
                                        }
                                    }
                                ]} 
                                customActions={(item) => (
                                    <button 
                                        onClick={() => { setSelectedAlunoForHistory(item); setAlunoHistoryModalOpen(true); }} 
                                        className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5" 
                                        title="Visualizar Ficha do Aluno"
                                    >
                                        <FileBarChart size={14}/> 
                                        <span className="text-[10px] font-black uppercase">Ver Ficha</span>
                                    </button>
                                )}
                            />
                        </div>
                    </div>
                )}
                {tab === 4 && (
                    <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar p-2">
                        {/* Painel de Filtros EBD Quarterly/Trimestrais */}
                        <div className="glass-card p-6 rounded-[2.2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between bg-white/70 shrink-0">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Revista / Período (Trimestre)</label>
                                    <select
                                        value={licaoPeriod}
                                        onChange={e => handleLicaoPeriodChange(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="todos">📅 Todo o Período</option>
                                        <option value="1_trimestre">🌸 1º Trimestre (Jan-Mar)</option>
                                        <option value="2_trimestre">☀️ 2º Trimestre (Abr-Jun)</option>
                                        <option value="3_trimestre">🍂 3º Trimestre (Jul-Set)</option>
                                        <option value="4_trimestre">❄️ 4º Trimestre (Out-Dez)</option>
                                        <option value="este_mes">🗓️ Este Mês</option>
                                        <option value="30_dias">🔄 Últimos 30 dias</option>
                                    </select>
                                </div>
                                <div className={`text-left ${licaoPeriod === 'personalizado' ? "opacity-100" : "opacity-75"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={licaoStartDate}
                                        onChange={e => setLicaoStartDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                                <div className={`text-left ${licaoPeriod === 'personalizado' ? "opacity-100" : "opacity-75"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Final</label>
                                    <input
                                        type="date"
                                        value={licaoEndDate}
                                        onChange={e => setLicaoEndDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                            </div>
                            
                            {(licaoPeriod !== 'todos' || licaoStartDate || licaoEndDate) && (
                                <button
                                    onClick={() => handleLicaoPeriodChange('todos')}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:text-rose-600 tracking-wider transition duration-200 flex items-center gap-1.5 self-center md:self-end"
                                >
                                    <RotateCcw size={12} /> Limpar Filtros
                                </button>
                            )}
                        </div>

                        {/* Tabela do Controle de Lições Aplicadas */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <GenericTable 
                                title="Registro de Lições" 
                                type="ebd_licao" 
                                data={filteredLicoesPeriodoFull} 
                                columns={[
                                    {header:'Data', key:'data', render: d=>formatDateLocal(d.data)}, 
                                    {header:'Turma', key:'turma_id', render: l => turmasFiltradas.find(t=>t.id===l.turma_id)?.nome}, 
                                    {header:'Revista/Tema', key:'revista'}, 
                                    {header:'Lição', key:'licao_numero'}, 
                                    {header:'Presentes', key:'qtd_presentes'}
                                ]} 
                                customActions={(item) => (
                                    <button 
                                        onClick={() => handleGenerateLessonPlan(item)} 
                                        className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1" 
                                        title="Estudar Lição Interativa"
                                    >
                                        <BookOpenText size={18}/> 
                                        <span className="hidden lg:inline text-[10px] font-bold uppercase">Estudar com IA</span>
                                    </button>
                                )}
                            />
                        </div>
                    </div>
                )}
                {tab === 5 && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">Mural Detalhado das Turmas</h3>
                                <p className="text-xs text-slate-500 font-medium">Informações completas de professores e alunos por classe.</p>
                            </div>
                            <Button onClick={() => openModal('ebd_turma')} variant="primary" className="shadow-blue-500/20"><Plus size={18}/> Nova Turma</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {turmasFiltradas.map(turma => {
                                const profs = [turma.prof1_id, turma.prof2_id, turma.prof3_id].filter(Boolean).map(id => db.membros.find(m => m.id === id));
                                const alunosDaTurma = alunosFiltrados.filter(a => a.turma_id === turma.id);
                                return (
                                    <div key={turma.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                        <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
                                            <div>
                                                <h4 className="font-black text-xl tracking-tight">{turma.nome}</h4>
                                                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin size={12}/> {turma.sala || 'Sala Principal'}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                                <Users size={24}/>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col gap-5">
                                            {/* Ações Rápidas da Turma */}
                                            <div className="grid grid-cols-2 gap-2 shrink-0 pb-3 border-b border-slate-100">
                                                <button
                                                    onClick={() => openChamadaModal(turma)}
                                                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                                    title="Realizar chamada interativa na classe"
                                                >
                                                    <UserCheck size={14}/> Fazer Chamada
                                                </button>
                                                <button
                                                    onClick={() => openModal('ebd_aluno', { turma_id: turma.id })}
                                                    className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 font-black text-[10px] uppercase tracking-wider border border-slate-200/85 hover:border-indigo-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                    title="Matricular novo aluno nesta turma"
                                                >
                                                    <UserPlus size={14}/> Matricular +
                                                </button>
                                            </div>

                                            <div>
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><Briefcase size={14} className="text-blue-500"/> Corpo Docente</h5>
                                                <div className="space-y-2">
                                                    {profs.map((p, idx) => p && (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">{p.nome.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800 leading-none">{p.nome}</p>
                                                                <p className="text-[10px] text-slate-500">Professor(a)</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {profs.length === 0 && <p className="text-xs text-slate-400 italic">Sem professores definidos.</p>}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14} className="text-emerald-500"/> Alunos Matriculados</h5>
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{alunosDaTurma.length}</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                                    {alunosDaTurma.map((aluno, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                            <span className="font-bold text-xs text-slate-700">{aluno.nome}</span>
                                                            <button onClick={() => deleteItem('ebd_aluno', aluno.id)} className="text-rose-400 hover:text-rose-600 p-1" title="Remover Matrícula"><X size={14}/></button>
                                                        </div>
                                                    ))}
                                                    {alunosDaTurma.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum aluno matriculado nesta turma.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {turmasFiltradas.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <Layers size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p className="font-bold text-lg">Sem turmas cadastradas.</p>
                                    <p className="text-sm mt-1">Crie uma nova turma para começar a organizar a sua EBD.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* AI Lesson Modal - Estudo Interativo */}
            {aiLesson && createPortal(
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance">
                    <div className="glass-modern rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/40 border-0 relative">
                        {/* Modal Header inside gradient wrapper */}
                        <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 bg-[length:200%_200%] animate-pulse-glow"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }} />
                            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                                    <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Sparkles size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10 text-rose-300 animate-pulse"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                                        EBD Inteligente • Estudar com IA
                                    </p>
                                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white">
                                        {aiLesson.title}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setAiLesson(null); setAiQuizText(''); }} 
                                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row bg-white/45 backdrop-blur-md">
                            {/* Coluna Esquerda: Capa da Revista */}
                            <div className="w-full lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-slate-200/50 flex flex-col items-center bg-white/10 shrink-0">
                                <div className="w-full max-w-[250px] aspect-[2/3] bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900 rounded-[2rem] shadow-xl p-6 flex flex-col justify-between text-center border-4 border-white ring-1 ring-slate-200/40 relative overflow-hidden mb-6">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-1 border-b border-white/20 pb-2">Lições Bíblicas Adultos</span>
                                        <h3 className="font-extrabold text-lg text-white uppercase mt-4 leading-snug drop-shadow-md line-clamp-4">{aiLesson.revista}</h3>
                                    </div>
                                    <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">Lição</div>
                                        <div className="text-5xl font-black text-white">{aiLesson.licao}</div>
                                    </div>
                                </div>
                                <div className="w-full text-center">
                                    <span className="bg-indigo-50/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-200/40">Material de Apoio (IA)</span>
                                    <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">Este conteúdo interativo é gerado com base no currículo oficial de escolas bíblicas.</p>
                                </div>
                            </div>

                            {/* Coluna Direita: Conteúdo da Lição */}
                            <div className="flex-1 p-8 md:p-12 bg-white/80 relative">
                                {aiLesson.loading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-indigo-600 min-h-[400px]">
                                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                        <p className="font-black text-lg animate-pulse mb-1">Buscando na biblioteca teológica...</p>
                                        <p className="text-sm font-medium text-slate-500">A preparar o texto áureo e a explicação dos tópicos.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 text-left">
                                        <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose font-serif prose-headings:font-black prose-headings:text-slate-900 prose-a:text-indigo-600 prose-strong:text-indigo-800">
                                            {aiLesson.text}
                                        </div>

                                        {aiQuizText && (
                                            <div className="mt-8 p-6 bg-rose-50/40 border-2 border-dashed border-rose-200/80 rounded-3xl animate-fadeIn">
                                                <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider mb-3">
                                                    <Sparkles size={16} className="text-rose-500 animate-bounce" />
                                                    <span>Dinâmica Pedagógica & Quiz do Professor (IA)</span>
                                                </div>
                                                <div className="text-slate-705 whitespace-pre-wrap font-sans text-xs leading-relaxed bg-white/85 p-4 rounded-2xl border border-rose-100/50">
                                                    {aiQuizText}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex flex-wrap gap-3 justify-end items-center shrink-0">
                            {!aiLesson.loading && (
                                <>
                                    <button 
                                        onClick={async () => {
                                            setAiGeneratingQuiz(true);
                                            const prom = `Atue como um pedagogo especializado em Ensino Bíblico e Escorla de Líderes. Com base na revista de EBD "${aiLesson.revista}", Lição "${aiLesson.licao}", elabore: 
1. 3 Perguntas quebra-gelo divertidas.
2. 3 Perguntas de fixação bíblica profunda com respostas rápidas para o professor.
3. Uma dinâmica de grupo criativa de 10 minutos para fixar o tema central na mente dos alunos.
Gere em formatação simples e amigável.`;
                                            try {
                                                const res = await callGeminiAI(prom, 5);
                                                setAiQuizText(res);
                                                addToast("Dinâmica e Quiz gerados com IA desenvolvidos para os professores!", "success");
                                            } catch (e: any) {
                                                addToast("Não foi possível gerar a dinâmica agora.", "error");
                                            } finally {
                                                setAiGeneratingQuiz(false);
                                            }
                                        }}
                                        disabled={aiGeneratingQuiz}
                                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 text-rose-750 disabled:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Sparkles size={14} className="text-rose-500 animate-pulse" /> {aiGeneratingQuiz ? "Gerando Dinâmica..." : "Gerar Dinâmica + Quiz (IA)"}
                                    </button>

                                    <button 
                                        onClick={() => {
                                            const copyText = `📚 *SUBSÍDIO PARA EBD (ESCOLA BÍBLICA)* 📚\n📖 *Revista:* ${aiLesson.revista}\n🎯 *Lição:* ${aiLesson.licao}\n\n${aiLesson.text.slice(0, 1500)}...\n\n⭐ _Subsídio teológico do Portal EBD_`;
                                            navigator.clipboard.writeText(copyText);
                                            addToast("Resumo formatado p/ WhatsApp copiado!", "success");
                                        }}
                                        className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-black text-[10px] uppercase tracking-wider rounded-xl border border-emerald-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="Copiar resumo curto com emojis para grupos de classe"
                                    >
                                        <Smartphone size={14} className="text-emerald-500" /> Copiar para WhatsApp
                                    </button>

                                    <button 
                                        onClick={() => {
                                            const doc = new jsPDF();
                                            doc.setFont("helvetica", "bold");
                                            doc.setFontSize(22);
                                            doc.setTextColor(79, 70, 229);
                                            doc.text("ESTUDO EBD COMPACTO", 20, 25);
                                            doc.setFontSize(12);
                                            doc.setTextColor(30, 41, 59);
                                            doc.text(`Revista: ${aiLesson.revista}`, 20, 35);
                                            doc.text(`Licao: ${aiLesson.licao}`, 20, 42);
                                            doc.line(20, 46, 190, 46);
                                            doc.setFont("helvetica", "normal");
                                            doc.setFontSize(10);
                                            doc.setTextColor(71, 85, 105);
                                            const splitted = doc.splitTextToSize(aiLesson.text, 170);
                                            let y = 55;
                                            for(let i=0; i<splitted.length; i++) {
                                                if (y > 275) {
                                                    doc.addPage();
                                                    y = 20;
                                                }
                                                doc.text(splitted[i], 20, y);
                                                y += 6;
                                            }
                                            doc.save(`estudo_ebd_licao_${aiLesson.licao}.pdf`);
                                            addToast("Guia de Estudo em PDF baixado com sucesso!", "success");
                                        }}
                                        className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-750 font-black text-[10px] uppercase tracking-wider rounded-xl border border-blue-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Download size={14} className="text-blue-500" /> Salvar PDF
                                    </button>

                                    <Button onClick={() => { navigator.clipboard.writeText(aiLesson.text); addToast("Estudo completo copiado!", "success"); }} variant="secondary" className="shadow-sm border-slate-300 text-[10px] font-black uppercase"><Copy size={16}/> Copiar Completo</Button>
                                </>
                            )}
                            <Button onClick={() => { setAiLesson(null); setAiQuizText(''); }} variant="primary" className="shadow-indigo-500/30 px-8 text-[10px] font-black uppercase">Concluir</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 1: REGISTRO DE CHAMADA (CONTROLE DE PRESENÇA) */}
            {chamadaModalOpen && selectedTurmaForChamada && createPortal(
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance">
                    <form onSubmit={handleSaveChamada} className="glass-modern rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/40 border-0">
                        <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 bg-[length:200%_200%] animate-pulse-glow"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.14] mix-blend-overlay pointer-events-none"></div>
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }} />
                            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                                    <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <ClipboardList size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                                        Controle de Lições • Frequência
                                    </p>
                                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white">
                                        Turma: {selectedTurmaForChamada.nome}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setChamadaModalOpen(false)} 
                                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 bg-white/40 backdrop-blur-md">
                            {/* Inputs de Configuração da Lição Ministrada */}
                            <div className="bg-white/60 p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm space-y-4">
                                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Dados da Lição de EBD</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormInput
                                        label="Data da Aula"
                                        type="date"
                                        value={chamadaDate}
                                        onChange={(e: any) => setChamadaDate(e.target.value)}
                                        required
                                    />
                                    <FormInput
                                        label="Revista / Tema Central"
                                        placeholder="Ex: Fruto do Espírito"
                                        value={chamadaRevista}
                                        onChange={(e: any) => setChamadaRevista(e.target.value)}
                                        required
                                    />
                                    <FormInput
                                        label="Lição Número"
                                        placeholder="Ex: Lição 10"
                                        value={chamadaLicaoNum}
                                        onChange={(e: any) => setChamadaLicaoNum(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tabela de Alunos com Chamada Dinâmica */}
                            <div className="bg-white/60 p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={14} className="text-indigo-500" /> Alunos Matriculados</h4>
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                                        Presentes hoje: {Object.values(studentAttendanceMap).filter((st: any) => st.presente).length}
                                    </span>
                                </div>

                                <div className="space-y-2.5 max-h-[38vh] overflow-y-auto custom-scrollbar pr-1">
                                    {(db.ebd?.alunos || []).filter(a => a.turma_id === selectedTurmaForChamada.id).map(aluno => {
                                        const cur = studentAttendanceMap[aluno.id] || { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false };
                                        
                                        const toggleProp = (prop: 'presente' | 'trouxeBiblia' | 'trouxeRevista' | 'oferta') => {
                                            setStudentAttendanceMap(prev => {
                                                const currentItem = prev[aluno.id] || { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false };
                                                const updatedValue = !currentItem[prop];
                                                
                                                // Se desmarcou presença, zera outros indicadores também por padrão teológico
                                                if (prop === 'presente' && !updatedValue) {
                                                    return {
                                                        ...prev,
                                                        [aluno.id]: { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false }
                                                    };
                                                }
                                                // Se marcou Bíblia/Revista/Oferta, força presente para true
                                                if (prop !== 'presente' && updatedValue) {
                                                    return {
                                                        ...prev,
                                                        [aluno.id]: {
                                                            ...currentItem,
                                                            presente: true,
                                                            [prop]: true
                                                        }
                                                    };
                                                }

                                                return {
                                                    ...prev,
                                                    [aluno.id]: {
                                                        ...currentItem,
                                                        [prop]: updatedValue
                                                    }
                                                };
                                            });
                                        };

                                        return (
                                            <div key={aluno.id} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${cur.presente ? 'bg-indigo-50/40 border-indigo-250' : 'bg-slate-50/50 border-slate-200/60'}`}>
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleProp('presente')}
                                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${cur.presente ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                                                    >
                                                        {cur.presente && <Check size={12} strokeWidth={3} />}
                                                    </button>
                                                    <div>
                                                        <p className={`text-xs font-black transition-colors ${cur.presente ? 'text-indigo-950' : 'text-slate-500'}`}>{aluno.nome}</p>
                                                        <span className="text-[9px] text-slate-400 font-bold">Matrícula EBD</span>
                                                    </div>
                                                </div>

                                                {/* Indicadores de engajamento da aula */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleProp('trouxeBiblia')}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.trouxeBiblia ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                        title="Trouxe Bíblia Sagrada"
                                                    >
                                                        📖 <span className="hidden sm:inline">Bíblia</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleProp('trouxeRevista')}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.trouxeRevista ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                        title="Trouxe Revista de Lição"
                                                    >
                                                        📚 <span className="hidden sm:inline">Revista</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleProp('oferta')}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.oferta ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                        title="Contribuição de Oferta para Classe"
                                                    >
                                                        🪙 <span className="hidden sm:inline">Oferta</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(db.ebd?.alunos || []).filter(a => a.turma_id === selectedTurmaForChamada.id).length === 0 && (
                                        <p className="text-xs text-slate-400 italic text-center py-6">Nenhum aluno matriculado nesta turma para responder à chamada.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex justify-end gap-3 shrink-0">
                            <Button type="button" onClick={() => setChamadaModalOpen(false)} variant="ghost" className="border border-white/60 bg-white/40 hover:bg-white">Cancelar</Button>
                            <Button type="submit" variant="primary" className="shadow-indigo-500/25 px-8">Salvar Frequência</Button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {/* MODAL 2: FICHA DE DESEMPENHO E HISTÓRICO DO ALUNO (INDIVIDUAL) */}
            {/* MODAL 2: FICHA DE DESEMPENHO E HISTÓRICO DO ALUNO (INDIVIDUAL) */}
            {alunoHistoryModalOpen && selectedAlunoForHistory && createPortal(
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance">
                    <div className="glass-modern rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/40 border-0">
                        <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 bg-[length:200%_200%] animate-pulse-glow"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.14] mix-blend-overlay pointer-events-none"></div>
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }} />
                            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative font-extrabold text-2xl font-['Outfit']">
                                    {selectedAlunoForHistory.nome.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                                        EBD • Ficha do Aluno
                                    </p>
                                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white truncate">
                                        {selectedAlunoForHistory.nome}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => setAlunoHistoryModalOpen(false)} 
                                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 bg-white/40 backdrop-blur-md">
                            {/* Cartões de Indicadores Chave de Frequência */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Presenças</p>
                                    <h4 className="text-3xl font-black text-indigo-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).presencas}</h4>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-1">/{getStudentStats(selectedAlunoForHistory.id).totalAulas} aulas</span>
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Bíblias</p>
                                    <h4 className="text-3xl font-black text-emerald-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).biblias}</h4>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Trouxe nas aulas</span>
                                </div>
                                <div className="bg-blue-50/50 border border-blue-105/60 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Revistas</p>
                                    <h4 className="text-3xl font-black text-blue-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).revistas}</h4>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Estudou a lição</span>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-105/60 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Ofertas</p>
                                    <h4 className="text-3xl font-black text-amber-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).ofertas}</h4>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Aulas ofertadas</span>
                                </div>
                            </div>

                            {/* Desempenho e Medalhas de Aproveitamento */}
                            <div className="bg-white/60 border border-white/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-xs">
                                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                    <svg className="absolute w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                                        <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                                                strokeDasharray={2 * Math.PI * 40}
                                                strokeDashoffset={2 * Math.PI * 40 * (1 - getStudentStats(selectedAlunoForHistory.id).taxaPresenca / 100)} />
                                    </svg>
                                    <span className="text-xl font-extrabold text-indigo-950 font-['Outfit']">{getStudentStats(selectedAlunoForHistory.id).taxaPresenca}%</span>
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-800 text-sm">Status Dominical: {
                                        getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 90 ? '🏅 Aluno Ouro' :
                                        getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 75 ? '🥈 Aluno Prata' :
                                        getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 50 ? '🥉 Aluno Integrado' : '🌱 Aluno Iniciante'
                                    }</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Considerando a assiduidade histórica na leitura doutrinária das lições, pontualidade e engajamento geral no trimestre corrente.</p>
                                </div>
                            </div>

                            {/* Registro Fino de Lições Ministradas */}
                            <div className="bg-white/60 border border-white/80 rounded-3xl p-5 shadow-xs">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> Histórico de Presenças</h4>
                                <div className="space-y-2 max-h-[25vh] overflow-y-auto custom-scrollbar pr-1">
                                    {(db.ebd?.licoes || []).filter(l => {
                                        const t = turmasFiltradas.find(tf=>tf.id===l.turma_id);
                                        return t && t.id === selectedAlunoForHistory.turma_id;
                                    }).map(licao => {
                                        const det = licao.detalhes_chamada?.[selectedAlunoForHistory.id];
                                        return (
                                            <div key={licao.id} className="p-3 bg-white/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-250 transition-all">
                                                <div>
                                                    <p className="font-extrabold text-xs text-slate-800">{licao.revista || 'Revista EBD'}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">{licao.licao_numero || 'Lição'} • {formatDateLocal(licao.data)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {det?.presente ? (
                                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-750 font-black text-[9px] uppercase tracking-wider rounded-md border border-emerald-100">✔ Presente</span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-750 font-black text-[9px] uppercase tracking-wider rounded-md border border-rose-100">❌ Ausente</span>
                                                    )}
                                                    {det?.trouxeBiblia && <span className="text-xs select-none" title="Trouxe Bíblia">📖</span>}
                                                    {det?.trouxeRevista && <span className="text-xs select-none" title="Trouxe Revista">📚</span>}
                                                    {det?.oferta && <span className="text-xs select-none" title="Ofertou">🪙</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(db.ebd?.licoes || []).filter(l => {
                                        const t = turmasFiltradas.find(tf=>tf.id===l.turma_id);
                                        return t && t.id === selectedAlunoForHistory.turma_id;
                                    }).length === 0 && (
                                        <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma aula registrada para esta turma ainda.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex justify-end shrink-0">
                            <Button onClick={() => setAlunoHistoryModalOpen(false)} variant="primary" className="px-8 text-xs font-black uppercase tracking-wider">Fechar Ficha</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleEBD;
