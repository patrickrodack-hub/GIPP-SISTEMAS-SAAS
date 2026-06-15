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
const DashboardModule = () => {
    const { db, addToast, isOnline, user } = useContext(ChurchContext);
    const [isExporting, setIsExporting] = useState(false);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    const dashboardRef = useRef(null);

    const isPastorOrTesoureiro = useMemo(() => {
        if (!user) return false;
        
        const isMaster = user?.nivel === 'master';
        
        const portalPastorRolesStr = db.igreja?.portal_pastor_lideres_funcoes || ['PASTOR PRESIDENTE', 'PASTOR AUXILIAR'];
        const portalTesoureiroRolesStr = db.igreja?.portal_tesoureiro_lideres_funcoes || ['TESOUREIRO', 'CONTADOR', 'ADMINISTRADOR'];

        const isPastor = user?.cargo?.toLowerCase().includes('pastor') || 
                         user?.funcao?.toLowerCase().includes('pastor') || 
                         user?.nivel === 'pastor' ||
                         (user?.funcao_administrativa && portalPastorRolesStr.includes(user.funcao_administrativa.toUpperCase())) ||
                         (db.igreja?.pastor && user?.nome && db.igreja.pastor.toLowerCase().trim() === user.nome.toLowerCase().trim());
                         
        const isTesoureiro = user?.cargo?.toLowerCase().includes('tesour') || 
                             user?.funcao?.toLowerCase().includes('tesour') || 
                             user?.nivel === 'tesour' || 
                             (user?.funcao_administrativa && portalTesoureiroRolesStr.includes(user.funcao_administrativa.toUpperCase())) ||
                             (db.igreja?.tesoureiro1 && user?.nome && db.igreja.tesoureiro1.toLowerCase().trim() === user.nome.toLowerCase().trim()) || 
                             (db.igreja?.tesoureiro2 && user?.nome && db.igreja.tesoureiro2.toLowerCase().trim() === user.nome.toLowerCase().trim());
                             
        return isMaster || isPastor || isTesoureiro;
    }, [user, db.igreja]);

    useEffect(() => {
        // Nothing here anymore
    }, []);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentMonthStr = today.toISOString().slice(0, 7);
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const filterByCongregacao = (item) => {
        if (congregacaoFilter === 'todas') return true;
        if (congregacaoFilter === 'sede') return !item.congregacao_id || item.congregacao_id === 'sede';
        return item.congregacao_id === congregacaoFilter;
    };

    const totalMembros = (db.membros || []).filter(filterByCongregacao).length || 0;
    const alunosFiltrados = (db.ebd?.alunos || []).filter(a => {
        const m = db.membros.find(mem => mem.id === a.membro_id);
        return m ? filterByCongregacao(m) : true;
    });
    const totalAlunosEBD = alunosFiltrados.length || 0;
    
    const carnesFiltrados = (db.carnes || []).filter(c => {
        const m = db.membros.find(mem => mem.id === c.membro_id);
        return m ? filterByCongregacao(m) : true;
    });
    const totalParticipantesCarnes = new Set(carnesFiltrados.map(c => c.membro_id)).size || 0;

    const dataEngajamento = [
        { name: 'Total Membros', valor: totalMembros, fill: '#6366f1' },
        { name: 'Alunos EBD', valor: totalAlunosEBD, fill: '#ec4899' },
        { name: 'Missões (Carnês)', valor: totalParticipantesCarnes, fill: '#10b981' },
    ];

    let criancas = 0, jovens = 0, adultos = 0, idosos = 0;
    (db.membros || []).filter(filterByCongregacao).forEach(m => {
        if (m.data_nascimento) {
            const birth = new Date(m.data_nascimento);
            let age = today.getFullYear() - birth.getFullYear();
            const mdiff = today.getMonth() - birth.getMonth();
            if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) age--;
            if (age <= 12) criancas++;
            else if (age <= 25) jovens++;
            else if (age < 60) adultos++;
            else idosos++;
        }
    });
    
    const dataIdade = [
        { name: 'Crianças (0-12)', value: criancas, fill: '#3b82f6' },
        { name: 'Jovens (13-25)', value: jovens, fill: '#8b5cf6' },
        { name: 'Adultos (26-59)', value: adultos, fill: '#f59e0b' },
        { name: 'Idosos (60+)', value: idosos, fill: '#ef4444' },
    ];

    const estadoCivilCount = { Casado: 0, Solteiro: 0, Viuvo: 0, Outros: 0 };
    (db.membros || []).filter(filterByCongregacao).forEach(m => {
        const ec = m.estado_civil ? m.estado_civil.toLowerCase().trim() : 'não informado';
        if (ec.includes('casad')) estadoCivilCount.Casado++;
        else if (ec.includes('solteir')) estadoCivilCount.Solteiro++;
        else if (ec.includes('viuv')) estadoCivilCount.Viuvo++;
        else estadoCivilCount.Outros++;
    });
    
    const dataEstadoCivil = [
        { name: 'Casados', value: estadoCivilCount.Casado, fill: '#ec4899' },
        { name: 'Solteiros', value: estadoCivilCount.Solteiro, fill: '#06b6d4' },
        { name: 'Viúvos', value: estadoCivilCount.Viuvo, fill: '#64748b' },
        { name: 'Outros', value: estadoCivilCount.Outros, fill: '#94a3b8' },
    ];

    const dizimosAnoCorrente = useMemo(() => {
        return (db.financeiro || []).filter(filterByCongregacao).filter((f: any) => {
            const cat = (f.categoria || '').toLowerCase();
            const matchCategory = cat.includes('dízimo') || cat.includes('dizimo');
            const isEntrada = f.tipo === 'entrada';
            const isPago = f.status === 'pago';
            const dateStr = f.data_pagamento || f.data_vencimento || f.data || '';
            const matchYear = dateStr.startsWith(String(currentYear));
            return matchCategory && isEntrada && isPago && matchYear;
        });
    }, [db.financeiro, currentYear, congregacaoFilter]);

    const dataDizimosMensal = useMemo(() => {
        const monthNamesAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return monthNamesAbbr.map((label, idx) => {
            const mNum = String(idx + 1).padStart(2, '0');
            const total = dizimosAnoCorrente
                .filter((f: any) => {
                    const dateStr = f.data_pagamento || f.data_vencimento || f.data || '';
                    return dateStr.includes(`-${mNum}-`) || dateStr.startsWith(`${currentYear}-${mNum}`);
                })
                .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
            
            return {
                mes: label,
                "Dízimos (R$)": parseFloat(total.toFixed(2))
            };
        });
    }, [dizimosAnoCorrente, currentYear]);

    const aniversariantes = (db.membros || []).filter(filterByCongregacao).filter(m => {
        if (!m.data_nascimento) return false;
        const [y, month, d] = m.data_nascimento.split('-');
        return parseInt(month) - 1 === currentMonth;
    }).sort((a,b) => parseInt(a.data_nascimento.split('-')[2]) - parseInt(b.data_nascimento.split('-')[2]));

    const despesasVencer = (db.financeiro || []).filter(filterByCongregacao).filter(f => {
        return f.tipo === 'saida' && f.status === 'pendente' && f.data_vencimento && f.data_vencimento.startsWith(currentMonthStr);
    }).sort((a,b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    const totalDespesasVencer = despesasVencer.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
    const agendaMes = (db.agenda || []).filter(filterByCongregacao).filter(a => a.data && a.data.startsWith(currentMonthStr)).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    const tarefasMes = (db.tarefas || []).filter(t => t.data && t.data.startsWith(currentMonthStr)).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    const handleExportDashboard = async () => {
        setIsExporting(true);
        addToast("A gerar resumo visual. Aguarde...", "info");
        try {
            await new Promise(r => setTimeout(r, 400));
            const dataUrl = await toPng(dashboardRef.current, {
                pixelRatio: 2,
                backgroundColor: "#f0f4f8",
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });
            const link = document.createElement('a');
            link.download = `Resumo_GIPP_${monthNames[currentMonth]}_${currentYear}.png`;
            link.href = dataUrl;
            link.click();
            addToast("Resumo exportado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao exportar o dashboard.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-entrance pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight text-gradient">Dashboard Interativo</h2>
                    <p className="text-sm text-slate-500 font-medium">Visão geral • {monthNames[currentMonth]} {currentYear}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white/80 p-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Matriz (Visão Global)</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <button onClick={handleExportDashboard} disabled={isExporting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-xs font-bold transition-colors disabled:opacity-50">
                        {isExporting ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                        <span className="hidden sm:inline">{isExporting ? 'A Exportar...' : 'Exportar Resumo'}</span>
                        <span className="sm:hidden">{isExporting ? '...' : 'Exportar'}</span>
                    </button>
                    <div className={`px-4 py-2 rounded-2xl shadow-sm border flex items-center gap-2 ${isOnline ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                        <span className={`text-xs font-bold uppercase hidden sm:inline ${isOnline ? 'text-slate-600' : 'text-amber-700'}`}>
                            {isOnline ? 'Sistema Online' : 'Modo Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <div ref={dashboardRef} className="space-y-8 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Users size={24}/></div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Ativos</span>
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 mb-1">{totalMembros}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Total de Membros</p>
                            <div className="bg-white/60 p-2 rounded-xl border border-white/50">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                    <span>Alunos EBD</span>
                                    <span className="text-indigo-600">{totalAlunosEBD} ({totalMembros > 0 ? ((totalAlunosEBD/totalMembros)*100).toFixed(0) : 0}%)</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: `${totalMembros > 0 ? (totalAlunosEBD/totalMembros)*100 : 0}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                         <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><DollarSign size={24}/></div>
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">{despesasVencer.length} Pendentes</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {totalDespesasVencer.toFixed(2)}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">A Vencer ({monthNames[currentMonth]})</p>
                            <p className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded-lg inline-block">
                                 Próx: {despesasVencer[0] ? formatDateLocal(despesasVencer[0].data_vencimento) : 'Sem pendências'}
                            </p>
                         </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Gift size={24}/></div>
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 mb-1">{aniversariantes.length}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aniversariantes ({monthNames[currentMonth]})</p>
                            <div className="mt-4 flex -space-x-2 overflow-hidden">
                                 {aniversariantes.slice(0, 5).map((a, i) => (
                                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-800" title={`${a.nome} - Dia ${a.data_nascimento.split('-')[2]}`}>
                                         {a.nome.charAt(0)}
                                     </div>
                                 ))}
                                 {aniversariantes.length > 5 && <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-50">+{aniversariantes.length-5}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Globe size={24}/></div>
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 mb-1">{totalParticipantesCarnes}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contribuintes Missões</p>
                             <div className="bg-white/60 p-2 rounded-xl border border-white/50">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                    <span>Engajamento</span>
                                    <span className="text-emerald-600">{totalMembros > 0 ? ((totalParticipantesCarnes/totalMembros)*100).toFixed(0) : 0}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: `${totalMembros > 0 ? (totalParticipantesCarnes/totalMembros)*100 : 0}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass-modern p-6 rounded-[2.5rem] lg:col-span-2">
                        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-indigo-600"/> Comparativo de Engajamento
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataEngajamento} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                                    <XAxis type="number" hide/>
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} interval={0}/>
                                    <RechartsTooltip 
                                        contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                        cursor={{fill: 'transparent'}}
                                    />
                                    <Bar dataKey="valor" radius={[0, 10, 10, 0]} barSize={25} animationDuration={1500}>
                                        {dataEngajamento.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-modern p-6 rounded-[2.5rem]">
                        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-blue-500"/> Faixa Etária
                        </h3>
                        <div className="h-64 w-full relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={dataIdade} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={50} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {dataIdade.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-300 opacity-50">{totalMembros}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evolução de Dízimos */}
                {isPastorOrTesoureiro && (
                    <div className="glass-modern p-6 rounded-[2.5rem]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-emerald-500" /> Evolução Mensal de Entradas de Dízimos
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Histórico acumulado mês a mês do ano de {currentYear}</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                <DollarSign size={13} />
                                Total Geral: R$ {dizimosAnoCorrente.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dataDizimosMensal} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDizimos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                                    <YAxis tickLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 10, fontWeight: 'medium', fill: '#64748b' }} axisLine={false} />
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Dízimos']}
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                                    />
                                    <Area type="monotone" dataKey="Dízimos (R$)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDizimos)" animationDuration={1600} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass-modern p-6 rounded-[2.5rem]">
                         <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <Heart size={20} className="text-pink-500"/> Estado Civil
                        </h3>
                        <div className="h-48 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={dataEstadoCivil} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={40} 
                                        outerRadius={70} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {dataEstadoCivil.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-modern p-6 rounded-[2.5rem] lg:col-span-2 flex flex-col">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600"/> Agenda & Tarefas ({monthNames[currentMonth]})
                        </h3>
                        <div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden">
                            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 overflow-y-auto custom-scrollbar max-h-60">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 sticky top-0 bg-white/0 backdrop-blur-sm">Eventos</h4>
                                {agendaMes.length > 0 ? (
                                    <div className="space-y-3">
                                        {agendaMes.map((evt, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-xl flex flex-col items-center justify-center leading-none shrink-0">
                                                    <span className="text-[9px] font-bold uppercase">{monthNames[currentMonth].slice(0,3)}</span>
                                                    <span className="text-sm font-black">{evt.data.split('-')[2]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{evt.titulo}</p>
                                                    <p className="text-[10px] text-slate-500">{evt.hora} • {evt.local}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-slate-400 italic">Nenhum evento este mês.</p>}
                            </div>
                            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 overflow-y-auto custom-scrollbar max-h-60">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 sticky top-0 bg-white/0 backdrop-blur-sm">Tarefas</h4>
                                {tarefasMes.length > 0 ? (
                                    <div className="space-y-3">
                                        {tarefasMes.map((task, i) => (
                                            <div key={i} className="flex gap-3 items-center border-l-2 border-slate-300 pl-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{task.descricao}</p>
                                                    <p className="text-[10px] text-slate-500">
                                                        <span className={`uppercase font-bold ${task.status === 'Concluido' ? 'text-emerald-500' : 'text-amber-500'}`}>{task.status}</span>
                                                        {task.data && ` • ${formatDateLocal(task.data)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-slate-400 italic">Nenhuma tarefa este mês.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashboardModule;

