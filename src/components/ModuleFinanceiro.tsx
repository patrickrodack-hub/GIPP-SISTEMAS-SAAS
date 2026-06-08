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
const ModuleFinanceiro = ({ initialTab = 1 }) => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen, logAction, user } = useContext(ChurchContext);
    const [tab, setTab] = useState(initialTab);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [statusFilter, setStatusFilter] = useState('todos');
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    // NOVOS: Estados para Filtro de Pesquisa Avançada com Debounce inteligente
    const [searchFiltroNome, setSearchFiltroNome] = useState('');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [searchFiltroData, setSearchFiltroData] = useState('');

    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    
    // NOVO: Estados para a Análise de Retenção de Dizimistas
    const [aiRetention, setAiRetention] = useState('');
    const [loadingAiRetention, setLoadingAiRetention] = useState(false);

    // Estado para detalhar o Histórico de Auditoria do Lançamento
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // Debounce de 120ms para garantir digitação fluida sem latência perceptível
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchFiltroNome(localSearchTerm);
        }, 120);
        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Mapa de fornecedores para pesquisa rápida em O(1)
    const fornecedoresMap = useMemo(() => {
        const map = new Map();
        (db.fornecedores || []).forEach(forn => {
            if (forn && forn.id) {
                map.set(forn.id, (forn.nome || '').toLowerCase());
            }
        });
        return map;
    }, [db.fornecedores]);

    const baseFinanceiro = useMemo(() => {
        return (db.financeiro || []).filter(f => {
            const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
            
            // NOVO: Oculta entradas do portal que ainda não foram conciliadas pela tesouraria
            const isPortalPendente = f.tipo === 'entrada' && f.conciliado === false && String(f.descricao).includes('via Portal');
            
            return congMatch && !isPortalPendente;
        });
    }, [db.financeiro, congregacaoFilter]);

    const financeiroFiltrado = useMemo(() => {
        return baseFinanceiro.filter(f => {
            const dateToCompare = f.tipo === 'saida' ? (f.data_vencimento || f.data_competencia || '') : (f.data_competencia || '');
            return dateToCompare.startsWith(filterDate);
        });
    }, [baseFinanceiro, filterDate]);

    // NOVO: Tabela filtrada especificamente para as abas 2, 3 e 4 (Tabelas de Lançamentos) com busca ultra-eficiente
    const tabelaFinanceiroFiltrada = useMemo(() => {
        return baseFinanceiro.filter(f => {
            let matchData = true;
            let matchNome = true;
            const dateToCompare = f.tipo === 'saida' ? (f.data_vencimento || f.data_competencia || '') : (f.data_competencia || '');
            
            if (searchFiltroData) {
                matchData = dateToCompare === searchFiltroData;
            } else {
                matchData = dateToCompare.startsWith(filterDate);
            }

            if (searchFiltroNome) {
                const term = searchFiltroNome.toLowerCase();
                const desc = (f.descricao || '').toLowerCase();
                const membro = (f.membro_nome || '').toLowerCase();
                const fornName = f.fornecedor_id ? (fornecedoresMap.get(f.fornecedor_id) || String(f.fornecedor_id).toLowerCase()) : '';
                matchNome = desc.includes(term) || membro.includes(term) || fornName.includes(term);
            }
            return matchData && matchNome;
        });
    }, [baseFinanceiro, searchFiltroData, filterDate, searchFiltroNome, fornecedoresMap]);

    const { entradas, saidas, despesasPendentes, saldoAtual, saldoGeral } = useMemo(() => {
        const ent = financeiroFiltrado.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const sai = financeiroFiltrado.filter(f => f.tipo === 'saida').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const pendentes = (db.financeiro || []).filter(f => f.tipo === 'saida' && f.status === 'pendente' && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const salAtual = ent - sai;
        const salGeral = (db.financeiro || []).filter(f=>f.tipo==='entrada' && !(f.conciliado === false && String(f.descricao).includes('via Portal')) && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((a,c)=>a+(parseFloat(c.valor)||0),0) - (db.financeiro || []).filter(f=>f.tipo==='saida' && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((a,c)=>a+(parseFloat(c.valor)||0),0);

        return {
            entradas: ent,
            saidas: sai,
            despesasPendentes: pendentes,
            saldoAtual: salAtual,
            saldoGeral: salGeral
        };
    }, [financeiroFiltrado, db.financeiro, congregacaoFilter]);

    const contribuintes = new Set(financeiroFiltrado.filter(f => f.tipo === 'entrada' && f.membro_id).map(f => f.membro_id)).size;
    const totalMembros = db.membros?.length || 0;

    const filteredSums = useMemo(() => {
        const entList = tabelaFinanceiroFiltrada.filter(f => f.tipo === 'entrada');
        const entSum = entList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        const saiList = tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida');
        const saiSum = saiList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        const despList = saiList.filter(f => statusFilter === 'todos' || f.status === statusFilter);
        const despSum = despList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        return {
            entradasFiltradasCount: entList.length,
            entradasFiltradasSum: entSum,
            saidasFiltradasCount: saiList.length,
            saidasFiltradasSum: saiSum,
            despesasFiltradasCount: despList.length,
            despesasFiltradasSum: despSum
        };
    }, [tabelaFinanceiroFiltrada, statusFilter]);

    // NOVO: Cálculo Avançado de Retenção e Fidelidade
    const dizimistasData = useMemo(() => {
        if(tab !== 5) return [];
        const hoje = new Date();
        const doisMesesAtras = new Date(); doisMesesAtras.setMonth(hoje.getMonth() - 2);
        const quatroMesesAtras = new Date(); quatroMesesAtras.setMonth(hoje.getMonth() - 4);

        const dizimos = db.financeiro.filter(f => f.tipo === 'entrada' && f.categoria?.toLowerCase().includes('dízimo') && !(f.conciliado === false && String(f.descricao).includes('via Portal')));

        return db.membros.filter(m => m.status !== 'Inativo').map(membro => {
            const dizimosMembro = dizimos.filter(d => d.membro_id === membro.id).sort((a,b) => new Date(b.data_competencia).getTime() - new Date(a.data_competencia).getTime());
            const ultimoDizimo = dizimosMembro.length > 0 ? dizimosMembro[0] : null;
            const totalDizimado = dizimosMembro.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            let status = 'Sem Registo';
            let color = 'slate';

            if (ultimoDizimo && ultimoDizimo.data_competencia) {
                const dataUltimo = new Date(ultimoDizimo.data_competencia);
                if (dataUltimo >= doisMesesAtras) { status = 'Regular'; color = 'emerald'; }
                else if (dataUltimo >= quatroMesesAtras) { status = 'Irregular'; color = 'amber'; }
                else { status = 'Inativo / Alerta'; color = 'rose'; }
            }

            return { ...membro, ultimo_dizimo: ultimoDizimo ? ultimoDizimo.data_competencia : null, total_dizimado: totalDizimado, status_dizimo: status, status_color: color, qtd_dizimos: dizimosMembro.length };
        }).sort((a,b) => b.total_dizimado - a.total_dizimado);
    }, [db.financeiro, db.membros, tab]);

    // NOVO: Cálculo de membros Inadimplentes (Carnês & Entradas Pendentes)
    const lembretesAtrasados = useMemo(() => {
        if(tab !== 6) return [];
        const hoje = new Date().toISOString().split('T')[0];
        let pending = [];
        
        // Extrai todos os carnês e parcelas em atraso
        db.membros.forEach(membro => {
            const carnesMembro = (db.carnes || []).filter(c => c.membro_id === membro.id);
            let atrasosDesc = [];
            let vlAtrasado = 0;
            
            carnesMembro.forEach(c => {
                (c.parcelas || []).forEach(p => {
                    if (p.status !== 'pago' && p.vencimento < hoje) {
                        atrasosDesc.push(`Carne: ${c.titulo} (Parc. ${p.numero})`);
                        vlAtrasado += parseFloat(p.valor) || 0;
                    }
                });
            });

            const entradasMembro = (db.financeiro || []).filter(f => f.membro_id === membro.id && f.tipo === 'entrada' && f.status === 'pendente' && (f.data_competencia || '') < hoje);
            entradasMembro.forEach(e => {
                atrasosDesc.push(`Entrada Pendente: ${e.descricao}`);
                vlAtrasado += parseFloat(e.valor) || 0;
            });
            
            if (atrasosDesc.length > 0) {
                pending.push({
                    membro_id: membro.id,
                    nome: membro.nome,
                    telefone: membro.telefone || '',
                    qtd_atrasos: atrasosDesc.length,
                    descricoes: atrasosDesc.join(', '),
                    valor_total: vlAtrasado
                });
            }
        });
        
        return pending.sort((a,b) => b.valor_total - a.valor_total);
    }, [db.financeiro, db.carnes, db.membros, tab]);

    const [isAgendamentoAutomAtivo, setIsAgendamentoAutomAtivo] = useState(false);

    const currentYear = useMemo(() => {
        return filterDate ? filterDate.split('-')[0] : String(new Date().getFullYear());
    }, [filterDate]);

    const transacoesAnoCorrente = useMemo(() => {
        return (db.financeiro || []).filter(f => {
            const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
            const dateStr = f.data_pagamento || f.data_vencimento || f.data_competencia || f.data || '';
            const matchYear = dateStr.startsWith(String(currentYear));
            return congMatch && matchYear;
        });
    }, [db.financeiro, currentYear, congregacaoFilter]);

    const dataMensalEntradasSaidas = useMemo(() => {
        const monthNamesAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return monthNamesAbbr.map((label, idx) => {
            const mNum = String(idx + 1).padStart(2, '0');
            const mensalTrans = transacoesAnoCorrente.filter((f: any) => {
                const dateStr = f.data_pagamento || f.data_vencimento || f.data_competencia || f.data || '';
                return dateStr.includes(`-${mNum}-`) || dateStr.startsWith(`${currentYear}-${mNum}`);
            });
            
            const entradasTotal = mensalTrans
                .filter((f: any) => f.tipo === 'entrada' && !(f.conciliado === false && String(f.descricao).includes('via Portal')))
                .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            const saidasTotal = mensalTrans
                .filter((f: any) => f.tipo === 'saida')
                .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            return {
                mes: label,
                "Entradas": parseFloat(entradasTotal.toFixed(2)),
                "Saídas": parseFloat(saidasTotal.toFixed(2))
            };
        });
    }, [transacoesAnoCorrente, currentYear]);

    const categoriaEntradasData = useMemo(() => {
        const entries = financeiroFiltrado.filter(f => f.tipo === 'entrada');
        const map = new Map();
        entries.forEach(f => {
            const cat = f.categoria || 'Geral/Outros';
            map.set(cat, (map.get(cat) || 0) + (parseFloat(f.valor) || 0));
        });
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#6366f1', '#64748b'];
        return Array.from(map.entries()).map(([name, value], index) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            fill: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value);
    }, [financeiroFiltrado]);

    const categoriaSaidasData = useMemo(() => {
        const expenses = financeiroFiltrado.filter(f => f.tipo === 'saida');
        const map = new Map();
        expenses.forEach(f => {
            const cat = f.categoria || 'Geral/Outros';
            map.set(cat, (map.get(cat) || 0) + (parseFloat(f.valor) || 0));
        });
        const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#14b8a6', '#e11d48', '#64748b'];
        return Array.from(map.entries()).map(([name, value], index) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            fill: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value);
    }, [financeiroFiltrado]);

    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard}, 
        {id: 2, label: 'Entradas', icon: ArrowUpCircle}, 
        {id: 3, label: 'Saídas', icon: ArrowDownCircle}, 
        {id: 4, label: 'Gestão de Despesas', icon: CreditCard},
        {id: 5, label: 'Análise de Dizimistas', icon: Target},
        {id: 6, label: 'Lembretes & Cobranças', icon: Bell},
        {id: 7, label: 'Relatórios Gerenciais', icon: FileBarChart}
    ];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);
    const StatCard = ({ title, value, sub = undefined, icon: Icon, color, active = undefined }: { title: any; value: any; sub?: any; icon: any; color: any; active?: any }) => (<div className={`glass-card p-6 rounded-3xl relative overflow-hidden group ${active ? 'ring-2 ring-indigo-500 transform scale-[1.02]' : ''}`}><div className={`absolute -right-4 -top-4 text-${color}-100 opacity-20 transform scale-150`}><Icon size={100}/></div><div className="relative z-10"><div className={`w-12 h-12 rounded-2xl bg-${color}-100 text-${color}-600 flex items-center justify-center mb-4`}><Icon size={24}/></div><h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>{sub && <p className={`text-xs font-bold text-${color}-600`}>{sub}</p>}</div></div>);
    const handleBaixarDespesa = async (item) => { 
        if (!window.confirm(`Confirmar pagamento de R$ ${parseFloat(item.valor).toFixed(2)} para ${item.descricao}?`)) return; 
        try { 
            const histItem = {
                usuario_nome: user?.nome || 'Operador',
                usuario_id: user?.id || 'id',
                data: new Date().toISOString(),
                descricao: 'Status de pagamento alterado de "PENDENTE" para "PAGO"'
            };
            const prevHist = Array.isArray(item.historico) ? item.historico : (Array.isArray(item.alteracoes) ? item.alteracoes : []);
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { 
                status: 'pago', 
                data_pagamento: new Date().toISOString().split('T')[0],
                historico: [histItem, ...prevHist]
            }, { merge: true }); 
            logAction('BAIXA_FINANCEIRA', `Marcou despesa como paga: ${item.descricao}`, 'financeiro', item.id); 
            addToast("Despesa baixada com sucesso!", "success"); 
        } catch(e) { console.error(e); addToast("Erro ao baixar despesa.", "error"); } 
    };

    const handleDownloadAnexo = (base64Str, type) => {
        const a = document.createElement('a');
        a.href = base64Str;
        a.download = `comprovativo_${type}_${Date.now()}`;
        a.click();
        addToast("A transferir comprovativo...", "success");
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100"><DollarSign size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão Financeira</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Entradas, Saídas e DRE</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm flex-1 md:flex-none">
                         <option value="todas">Matriz e Filiais</option>
                         <option value="sede">Sede Principal</option>
                         {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                     </select>
                    {tab !== 5 && (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 flex-1 md:flex-none shadow-sm">
                            <Calendar size={18} className="text-indigo-600"/>
                            <input type="month" value={filterDate} onChange={e => setFilterDate(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full uppercase"/>
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 shrink-0">
                {menuItems.map(item => <TabButton key={item.id} item={item} />)}
            </div>

            {/* NOVO: Barra de Filtros Rápidos por Mês e Ano */}
            <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-4 rounded-3xl shadow-xs flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Filter size={12} className="text-indigo-600" /> Ano:
                    </span>
                    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                        {(() => {
                            const currentYearNum = new Date().getFullYear();
                            const years = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1];
                            const selectedYear = filterDate.split('-')[0];
                            return years.map(y => {
                                const isSelected = String(y) === selectedYear;
                                return (
                                    <button
                                        key={y}
                                        onClick={() => {
                                            const currentMonth = filterDate.split('-')[1] || "01";
                                            setFilterDate(`${y}-${currentMonth}`);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            isSelected 
                                            ? 'bg-indigo-600 text-white shadow-sm scale-102 font-black' 
                                            : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto custom-scrollbar whitespace-nowrap py-0.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Mês:</span>
                    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 w-full lg:w-auto justify-between lg:justify-start">
                        {[
                            { value: '01', label: 'Jan' },
                            { value: '02', label: 'Fev' },
                            { value: '03', label: 'Mar' },
                            { value: '04', label: 'Abr' },
                            { value: '05', label: 'Mai' },
                            { value: '06', label: 'Jun' },
                            { value: '07', label: 'Jul' },
                            { value: '08', label: 'Ago' },
                            { value: '09', label: 'Set' },
                            { value: '10', label: 'Out' },
                            { value: '11', label: 'Nov' },
                            { value: '12', label: 'Dez' }
                        ].map(m => {
                            const selectedMonth = filterDate.split('-')[1] || "01";
                            const isSelected = m.value === selectedMonth;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => {
                                        const currentYear = filterDate.split('-')[0] || String(new Date().getFullYear());
                                        setFilterDate(`${currentYear}-${m.value}`);
                                    }}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 lg:flex-none text-center ${
                                        isSelected 
                                        ? 'bg-indigo-600 text-white shadow-sm scale-102 font-black' 
                                        : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-black text-blue-600">DRE & Balanço Financeiro</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Receitas (Mês)" value={`R$ ${entradas.toFixed(2)}`} icon={TrendingUp} color="emerald" />
                            <StatCard title="Despesas (Mês)" value={`R$ ${saidas.toFixed(2)}`} icon={TrendingDown} color="rose" />
                            <StatCard title="Saldo do Período" value={`R$ ${saldoAtual.toFixed(2)}`} sub={saldoAtual >= 0 ? "Positivo" : "Negativo"} icon={Wallet} color={saldoAtual >= 0 ? "indigo" : "amber"} />
                            <StatCard title="A Pagar (Geral)" value={`R$ ${despesasPendentes.toFixed(2)}`} sub={`Saldo Geral Disp: R$ ${saldoGeral.toFixed(2)}`} icon={AlertCircle} color="orange" active={despesasPendentes > saldoGeral} />
                        </div>

                        {/* Evolução Financeira Mensal */}
                        <div className="glass-modern p-6 rounded-[2.5rem]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Activity size={20} className="text-indigo-500" /> Fluxo de Caixa Mensal ({currentYear})
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Comparativo mensal de Entradas vs Saídas do ano corrente</p>
                                </div>
                                <div className="flex gap-3 text-xs font-bold">
                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                        Entradas
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                                        Saídas
                                    </span>
                                </div>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dataMensalEntradasSaidas} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                            </linearGradient>
                                            <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                                        <YAxis tickLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 10, fontWeight: 'medium', fill: '#64748b' }} axisLine={false} />
                                        <RechartsTooltip 
                                            formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                                        />
                                        <Area type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" animationDuration={1000} />
                                        <Area type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSaidas)" animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Distribuição por Categoria */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Entradas */}
                            <div className="glass-modern p-6 rounded-[2.5rem]">
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <ArrowUpCircle size={20} className="text-emerald-500"/> Entradas por Categoria ({filterDate})
                                </h3>
                                <div className="h-64 w-full relative">
                                    {categoriaEntradasData.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie 
                                                        data={categoriaEntradasData} 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        innerRadius={50} 
                                                        outerRadius={80} 
                                                        paddingAngle={5} 
                                                        dataKey="value"
                                                    >
                                                        {categoriaEntradasData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Receitas</span>
                                                    <span className="text-lg font-black text-emerald-600">R$ {entradas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-405 dark:text-slate-400 font-medium text-xs italic">
                                            Nenhuma receita registrada neste mês.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Saídas */}
                            <div className="glass-modern p-6 rounded-[2.5rem]">
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <ArrowDownCircle size={20} className="text-rose-500"/> Saídas por Categoria ({filterDate})
                                </h3>
                                <div className="h-64 w-full relative">
                                    {categoriaSaidasData.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie 
                                                        data={categoriaSaidasData} 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        innerRadius={50} 
                                                        outerRadius={80} 
                                                        paddingAngle={5} 
                                                        dataKey="value"
                                                    >
                                                        {categoriaSaidasData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Despesas</span>
                                                    <span className="text-lg font-black text-rose-600">R$ {saidas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-405 dark:text-slate-400 font-medium text-xs italic">
                                            Nenhuma despesa registrada neste mês.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-card p-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Sparkles size={18}/> Consultoria Financeira IA</h3>
                                    <p className="text-xs text-indigo-600/70">Análise inteligente da saúde financeira da igreja baseada no mês atual.</p>
                                </div>
                                <Button 
                                    onClick={async () => {
                                        setLoadingAi(true);
                                        const prompt = `Atue como um consultor financeiro especialista em administração eclesiástica. Analise estes dados do mês e dê um conselho sábio (máximo 3 parágrafos) com tom encorajador: Receitas: R$ ${entradas.toFixed(2)}, Despesas Pagas: R$ ${saidas.toFixed(2)}, Despesas a Pagar: R$ ${despesasPendentes.toFixed(2)}, Saldo: R$ ${saldoAtual.toFixed(2)}. Formato Markdown.`;
                                        const result = await callGeminiAI(prompt);
                                        setAiAnalysis(result);
                                        setLoadingAi(false);
                                    }} 
                                    disabled={loadingAi} 
                                    variant="ghost" 
                                    className="bg-white/60 hover:bg-white text-indigo-600 border border-indigo-200 shadow-sm text-xs py-2"
                                >
                                    {loadingAi ? <Loader2 size={16} className="animate-spin"/> : <Activity size={16}/>} 
                                    {loadingAi ? 'A analisar...' : '✨ Analisar Agora'}
                                </Button>
                            </div>
                            {aiAnalysis && (
                                <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {aiAnalysis}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {tab === 2 && (
                    <div className="h-full flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md border-t-4 border-emerald-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl sm:text-2xl font-black text-emerald-600">Registro de Entradas</h3>
                                <Button onClick={() => openModal('fin_entrada_novo')} variant="success" className="shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-600"><Plus size={18}/> Nova Entrada</Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-emerald-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou membro..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-emerald-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-emerald-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <GenericTable title="" type="entrada" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'entrada')} columns={[{header:'Data', key:'data_competencia', render: d=>formatDateLocal(d.data_competencia)}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'entrada'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={12}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Membro', key:'membro_id', render: f => f.membro_nome || f.membro_id ? (db.membros.find(m=>m.id===f.membro_id)?.nome || f.membro_nome) : <span className="text-slate-400 italic">-</span>}, {header:'Categoria', key:'categoria', render: c => <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{c.categoria}</span>}, {header:'Valor', key:'valor', render: v => <span className="font-bold text-emerald-600">R$ {parseFloat(v.valor).toFixed(2)}</span>}]} customActions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => { setPrintData({ item, igreja: db.igreja }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                            </div>
                        )} />
                    </div>
                )}
                {tab === 3 && (
                    <div className="h-full flex flex-col">
                         <div className="bg-white/80 backdrop-blur-md border-t-4 border-rose-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl sm:text-2xl font-black text-rose-600">Registro de Saídas</h3>
                                <Button onClick={() => openModal('fin_saida_novo')} variant="danger" className="shadow-lg shadow-rose-500/30"><Plus size={18}/> Nova Despesa</Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-rose-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-rose-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-rose-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <GenericTable title="" type="saida" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida')} columns={[{header:'Vencimento', key:'data_vencimento', render: d=>formatDateLocal(d.data_vencimento)}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'saida'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={12}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Fornecedor', key:'fornecedor_id', render: f => f.fornecedor_id ? (db.fornecedores.find(forn=>forn.id===f.fornecedor_id)?.nome || f.fornecedor_id) : <span className="text-slate-400 italic">-</span>}, {header:'Valor', key:'valor', render: v => <span className="font-bold text-rose-600">R$ {parseFloat(v.valor).toFixed(2)}</span>}, {header:'Status', key:'status', render: s => s.status === 'pago' ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">Pago</span> : <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded uppercase">Pendente</span>}]} customActions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => { setPrintData({ item, igreja: db.igreja, fornecedores: db.fornecedores }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                            </div>
                        )} />
                    </div>
                )}
                {tab === 4 && (
                    <div className="h-full flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md border-t-4 border-slate-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-700 flex items-center gap-2"><CreditCard size={24}/> Gestão de Pagamentos</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setStatusFilter('todos')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${statusFilter === 'todos' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Todos</button>
                                    <button onClick={() => setStatusFilter('pendente')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${statusFilter === 'pendente' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-600'}`}>Pendentes</button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-slate-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-slate-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-slate-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                             <GenericTable title="" type="gestao_despesa" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida' && (statusFilter === 'todos' || f.status === statusFilter))} columns={[{header:'Vencimento', key:'data_vencimento', render: d=> d.data_vencimento ? <span className={d.status==='pendente' && new Date(d.data_vencimento) < new Date() ? 'text-rose-600 font-bold' : ''}>{formatDateLocal(d.data_vencimento)}</span> : '-'}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'despesa'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={14}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Fornecedor', key:'fornecedor_id', render: f => f.fornecedor_id ? (db.fornecedores.find(forn=>forn.id===f.fornecedor_id)?.nome || f.fornecedor_id) : <span className="text-slate-400 italic">-</span>}, {header:'Valor', key:'valor', render: v => `R$ ${parseFloat(v.valor).toFixed(2)}`}, {header:'Status', key:'status'}]} customActions={(item) => (
                                 <div className="flex gap-2">
                                     <button onClick={() => { setPrintData({ item, igreja: db.igreja, fornecedores: db.fornecedores }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                     {item.status !== 'pago' && (<button onClick={() => handleBaixarDespesa(item)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-200" title="Baixar (Pagar)"><CheckCheck size={18}/></button>)}
                                      <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                                 </div>
                             )} />
                        </div>
                    </div>
                )}
                {/* --- NOVO PAINEL DE ANÁLISE DE DIZIMISTAS --- */}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-emerald-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dizimistas Regulares</p>
                                <h3 className="text-3xl font-black text-emerald-600">{dizimistasData.filter(d=>d.status_dizimo==='Regular').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-amber-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Irregulares</p>
                                <h3 className="text-3xl font-black text-amber-600">{dizimistasData.filter(d=>d.status_dizimo==='Irregular').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-rose-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inativos (Alerta)</p>
                                <h3 className="text-3xl font-black text-rose-600">{dizimistasData.filter(d=>d.status_dizimo.includes('Inativo')).length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-slate-400 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sem Registo</p>
                                <h3 className="text-3xl font-black text-slate-600">{dizimistasData.filter(d=>d.status_dizimo==='Sem Registo').length}</h3>
                            </div>
                        </div>

                        <div className="glass-modern p-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Target size={18}/> Análise Pastoral & Retenção</h3>
                                    <p className="text-xs text-indigo-600/80 mt-1">Acompanhamento estratégico para aconselhamento e visitas pastorais.</p>
                                </div>
                                <Button onClick={async () => {
                                        setLoadingAiRetention(true);
                                        const prompt = `Analise os dados de retenção de dizimistas da igreja: Regulares: ${dizimistasData.filter(d=>d.status_dizimo==='Regular').length}, Irregulares: ${dizimistasData.filter(d=>d.status_dizimo==='Irregular').length}, Inativos: ${dizimistasData.filter(d=>d.status_dizimo.includes('Inativo')).length}. Dê conselhos práticos e pastorais (máx 3 parágrafos) sobre como abordar os membros inativos de forma amorosa, sem focar só no dinheiro, mas no cuidado espiritual. Use Markdown.`;
                                        const result = await callGeminiAI(prompt);
                                        setAiRetention(result);
                                        setLoadingAiRetention(false);
                                    }} 
                                    disabled={loadingAiRetention} variant="primary" className="py-2 px-4 text-xs shadow-md">
                                    {loadingAiRetention ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Gerar Plano de Ação
                                </Button>
                            </div>
                            {aiRetention && (
                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-entrance">
                                    {aiRetention}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title="Histórico de Membros" 
                                type="membro" 
                                data={dizimistasData} 
                                columns={[
                                    {header:'Membro', key:'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                    {header:'Status Atual', key:'status_dizimo', render: m => <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${m.status_color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m.status_color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : m.status_color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{m.status_dizimo}</span>},
                                    {header:'Último Registo', key:'ultimo_dizimo', render: m => m.ultimo_dizimo ? formatDateLocal(m.ultimo_dizimo) : <span className="text-slate-400 italic">-</span>},
                                    {header:'Total Global', key:'total_dizimado', render: m => <span className="font-mono font-bold text-indigo-600">R$ {m.total_dizimado.toFixed(2)}</span>}
                                ]} 
                                customActions={(item) => (
                                    <button onClick={() => {
                                        let msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Aqui é da ${db.igreja.nome}. Como tem passado? `;
                                        if (item.status_color === 'rose' || item.status_color === 'amber') {
                                            msg += `Sentimos a sua falta recentemente. Gostaria de receber uma visita ou oração? Estamos aqui para si!`;
                                        } else {
                                            msg += `Passando para agradecer pela sua fidelidade e dedicação à obra do Senhor. Deus abençoe grandemente!`;
                                        }
                                        window.open(`https://wa.me/55${(item.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-200" title="Contactar no WhatsApp">
                                        <MessageCircle size={18}/>
                                    </button>
                                )}
                                onDeleteOverride={() => {}}
                            />
                        </div>
                    </div>
                )}

                {/* --- Lembretes de Pagamento / Cobrança --- */}
                {tab === 6 && (
                    <div className="h-full flex flex-col space-y-6 animate-entrance">
                        <div className="glass-modern p-6 rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-amber-800 flex items-center gap-2"><Bell size={18}/> Gestão de Inadimplência e Lembretes Automáticos</h3>
                                    <p className="text-xs text-amber-600/80 mt-1">Configure o envio de mensagens de aviso via WhatsApp para membros com pagamentos pendentes.</p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setPrintData({ pending: lembretesAtrasados, igreja: db.igreja });
                                            setPrintMode('rel_inadimplentes');
                                            setPreviewOpen(true);
                                        }}
                                        className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
                                    >
                                        <Printer size={14}/> Gerar Relatório de Inadimplentes
                                    </button>

                                    <div className="flex items-center gap-3 bg-amber-50/50 px-3 py-1.5 rounded-2xl border border-amber-200">
                                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Envio Automático (Sábados)</span>
                                        <button 
                                            onClick={() => {
                                                setIsAgendamentoAutomAtivo(!isAgendamentoAutomAtivo);
                                                if(!isAgendamentoAutomAtivo) addToast("Os lembretes agora serão enviados automaticamente aos inadimplentes.", "success");
                                                else addToast("Agendamento automático desativado.", "info");
                                            }}
                                            className={`w-14 h-8 flex items-center rounded-full p-1 shadow-inner transition-colors duration-300 ease-in-out ${isAgendamentoAutomAtivo ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isAgendamentoAutomAtivo ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title={`Membros com Lançamentos Atrasados (${lembretesAtrasados.length})`}
                                type="lembrete" 
                                data={lembretesAtrasados} 
                                columns={[
                                    {header:'Membro', key:'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                    {header:'Motivo(s) do Atraso', key:'descricoes', render: m => <span className="text-xs text-slate-500 truncate max-w-[200px] whitespace-pre-wrap block">{m.descricoes}</span>},
                                    {header:'Qtd. Lançamentos', key:'qtd_atrasos', render: m => <span className="text-amber-600 font-bold">{m.qtd_atrasos} registros</span>},
                                    {header:'Valor P/ Acerto', key:'valor_total', render: m => <span className="font-mono font-bold text-rose-600">R$ {m.valor_total.toFixed(2)}</span>}
                                ]} 
                                customActions={(item) => (
                                    <button onClick={() => {
                                        const msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Aqui é da secretaria da ${db.igreja.nome}. Consta em nosso sistema um lembrete em aberto referente a: ${item.descricoes} no valor total de R$ ${item.valor_total.toFixed(2)}. Precisando de apoio ou de um novo prazo, estamos à inteira disposição. Deus abençoe!`;
                                        window.open(`https://wa.me/55${(item.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm border border-amber-200 flex items-center gap-2" title="Contactar e Enviar Lembrete via WhatsApp">
                                        <Bell size={16}/> <span className="text-xs font-bold uppercase hidden md:inline">Enviar Aviso</span>
                                    </button>
                                )}
                                onDeleteOverride={() => {}}
                            />
                        </div>
                    </div>
                )}

                {/* --- ABA DE RELATÓRIOS GERENCIAIS (BALANCETE MENSAL) --- */}
                {tab === 7 && (() => {
                    // Cáculo agrupado e sumário das Entradas por Categoria
                    const entradasAgrupadas = {};
                    let totalEntradas = 0;
                    financeiroFiltrado.filter((item: any) => item.tipo === 'entrada').forEach((item: any) => {
                        const cat = item.categoria || 'Geral/Outros';
                        const val = parseFloat(item.valor) || 0;
                        entradasAgrupadas[cat] = (entradasAgrupadas[cat] || 0) + val;
                        totalEntradas += val;
                    });

                    // Cálculo agrupado e sumário das Saídas por Categoria
                    const saidasAgrupadas = {};
                    let totalSaidas = 0;
                    financeiroFiltrado.filter((item: any) => item.tipo === 'saida').forEach((item: any) => {
                        const cat = item.categoria || 'Geral/Outros';
                        const val = parseFloat(item.valor) || 0;
                        saidasAgrupadas[cat] = (saidasAgrupadas[cat] || 0) + val;
                        totalSaidas += val;
                    });

                    const saldoFin = totalEntradas - totalSaidas;

                    // Método para formatar o mês do relatório
                    const formatarMesAno = (dateString: string) => {
                        if (!dateString) return '';
                        const [ano, mes] = dateString.split('-');
                        const nomesMeses = [
                            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                        ];
                        return `${nomesMeses[parseInt(mes) - 1]} de ${ano}`;
                    };

                    // Handler profissional para exportação estruturada em PDF
                    const exportarPDFBalancete = () => {
                        const docPdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4'
                        });

                        const pageW = docPdf.internal.pageSize.getWidth();
                        const pageH = docPdf.internal.pageSize.getHeight();

                        // Moldura externa elegante
                        docPdf.setDrawColor(226, 232, 240);
                        docPdf.setLineWidth(0.5);
                        docPdf.rect(10, 10, pageW - 20, pageH - 20);

                        // Barra superior decorativa indigo
                        docPdf.setFillColor(79, 70, 229);
                        docPdf.rect(10, 10, pageW - 20, 5, 'F');

                        // Cabeçalho da Igreja
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(16);
                        docPdf.setTextColor(30, 41, 59);
                        docPdf.text((db.igreja?.nome || 'DIRETORIA ADMINISTRATIVA GIPP').toUpperCase(), pageW / 2, 24, { align: 'center' });

                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.setFontSize(10);
                        docPdf.setTextColor(100, 116, 139);
                        docPdf.text(`DEMONSTRATIVO FINANCEIRO UNIFICADO E PRESTAÇÃO DE CONTAS`, pageW / 2, 29, { align: 'center' });
                        
                        const congRef = congregacaoFilter === 'todas' ? 'Todas as Congregações e Filiais' : (db.congregacoes?.find((c: any) => c.id === congregacaoFilter)?.nome || 'Sede Principal');
                        docPdf.text(`Congregação: ${congRef} | Competência: ${formatarMesAno(filterDate)}`, pageW / 2, 34, { align: 'center' });

                        // Linha divisória fina
                        docPdf.setDrawColor(203, 213, 225);
                        docPdf.setLineWidth(0.3);
                        docPdf.line(15, 38, pageW - 15, 38);

                        // 1. SEÇÃO DE RECEITAS
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(11);
                        docPdf.setTextColor(16, 185, 129);
                        docPdf.text("1. RECEITAS / ENTRADAS", 15, 45);

                        docPdf.setFontSize(9);
                        docPdf.setTextColor(71, 85, 105);
                        let posY = 52;
                        
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("Categoria", 15, posY);
                        docPdf.text("Valor", pageW - 45, posY, { align: 'right' });
                        docPdf.text("Participação %", pageW - 15, posY, { align: 'right' });
                        posY += 3;
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'normal');
                        const entriesReceitas = Object.entries(entradasAgrupadas).sort((a: any, b: any) => b[1] - a[1]);
                        if (entriesReceitas.length === 0) {
                            docPdf.setFont('Helvetica', 'italic');
                            docPdf.text("Nenhum lançamento de receita registrado neste período.", 15, posY);
                            posY += 7;
                        } else {
                            entriesReceitas.forEach(([cat, val]: any) => {
                                docPdf.text(String(cat), 15, posY);
                                docPdf.text(`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                                const percente = totalEntradas > 0 ? ((val / totalEntradas) * 100).toFixed(1) : '0';
                                docPdf.text(`${percente}%`, pageW - 15, posY, { align: 'right' });
                                posY += 6;
                            });
                        }

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("TOTAL RECEITAS ARRECADADAS (A)", 15, posY);
                        docPdf.text(`R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                        docPdf.text("100.0%", pageW - 15, posY, { align: 'right' });
                        posY += 8;

                        // 2. SEÇÃO DE DESPESAS
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 7;
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(239, 68, 68);
                        docPdf.text("2. DESPESAS / SAÍDAS", 15, posY);
                        posY += 7;

                        docPdf.setFontSize(9);
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("Categoria", 15, posY);
                        docPdf.text("Valor", pageW - 45, posY, { align: 'right' });
                        docPdf.text("Participação %", pageW - 15, posY, { align: 'right' });
                        posY += 3;
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'normal');
                        const entriesDespesas = Object.entries(saidasAgrupadas).sort((a: any, b: any) => b[1] - a[1]);
                        if (entriesDespesas.length === 0) {
                            docPdf.setFont('Helvetica', 'italic');
                            docPdf.text("Nenhum lançamento de saída pago registrado neste período.", 15, posY);
                            posY += 7;
                        } else {
                            entriesDespesas.forEach(([cat, val]: any) => {
                                docPdf.text(String(cat), 15, posY);
                                docPdf.text(`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                                const percente = totalSaidas > 0 ? ((val / totalSaidas) * 100).toFixed(1) : '0';
                                docPdf.text(`${percente}%`, pageW - 15, posY, { align: 'right' });
                                posY += 6;
                            });
                        }

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("TOTAL DESPESAS PAGAS (B)", 15, posY);
                        docPdf.text(`R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                        docPdf.text("100.0%", pageW - 15, posY, { align: 'right' });
                        posY += 8;

                        // 3. SEÇÃO DE DEMONSTRATIVO DE SALDO
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 7;

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(79, 70, 229);
                        docPdf.text("3. DEMONSTRATIVO DE CONCILIAÇÃO DE CAIXA", 15, posY);
                        posY += 7;

                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("Total de Receitas no Período (A)", 15, posY);
                        docPdf.text(`R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 6;

                        docPdf.text("Total de Despesas no Período (B)", 15, posY);
                        docPdf.text(`R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 6;

                        const saldoLiq = totalEntradas - totalSaidas;
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(saldoLiq >= 0 ? 16 : 239, saldoLiq >= 0 ? 185 : 68, saldoLiq >= 0 ? 129 : 68);
                        docPdf.text(`SALDO LÍQUIDO ACUMULADO (A - B)`, 15, posY);
                        docPdf.text(`R$ ${saldoLiq.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 18;

                        // Caso passe o limite da folha, quebre e desenhe na segunda página
                        if (posY > pageH - 45) {
                            docPdf.addPage();
                            docPdf.setDrawColor(226, 232, 240);
                            docPdf.setLineWidth(0.5);
                            docPdf.rect(10, 10, pageW - 20, pageH - 20);
                            posY = 35;
                        }

                        // Campos para assinaturas obrigatórias
                        docPdf.setDrawColor(148, 163, 184);
                        docPdf.setLineWidth(0.3);
                        docPdf.line(15, posY, 90, posY);
                        docPdf.line(pageW - 90, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("PRESIDENTE / DIRETOR GIPP", 52.5, posY, { align: 'center' });
                        docPdf.text("TESOUREIRO RESPONSÁVEL", pageW - 52.5, posY, { align: 'center' });
                        posY += 4;
                        
                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.text("Assinatura do Representante", 52.5, posY, { align: 'center' });
                        docPdf.text("Assinatura do Tesoureiro", pageW - 52.5, posY, { align: 'center' });

                        // Rodapé metadata
                        docPdf.setFontSize(7);
                        docPdf.setTextColor(160, 174, 192);
                        docPdf.text(`Documento gerado através do Módulo de Inteligência de Negócios do GIPP em ${new Date().toLocaleString('pt-BR')}`, pageW / 2, pageH - 12, { align: 'center' });

                        docPdf.save(`Balancete_Gerencial_${formatarMesAno(filterDate).replace(/\s+/g, '_')}.pdf`);
                        addToast("Relatório (Balancete) em formato PDF exportado com sucesso!", "success");
                    };

                    return (
                        <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-1 animate-entrance">
                            {/* Dashboard Superior */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-emerald-110 shadow-sm bg-gradient-to-tr from-emerald-50/20 to-white">
                                    <div className="absolute -right-4 -top-4 text-emerald-100 opacity-20 transform scale-150"><ArrowUpCircle size={100}/></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><ArrowUpCircle size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Receitas</p>
                                    </div>
                                </div>
                                
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-rose-110 shadow-sm bg-gradient-to-tr from-rose-50/20 to-white">
                                    <div className="absolute -right-4 -top-4 text-rose-100 opacity-20 transform scale-150"><ArrowDownCircle size={100}/></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4"><ArrowDownCircle size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Despesas</p>
                                    </div>
                                </div>

                                <div className={`glass-card p-6 rounded-3xl relative overflow-hidden group border shadow-sm bg-gradient-to-tr from-indigo-50/20 to-white ${saldoFin >= 0 ? 'border-indigo-100' : 'border-amber-100'}`}>
                                    <div className="absolute -right-4 -top-4 text-indigo-100 opacity-20 transform scale-150"><Wallet size={100}/></div>
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${saldoFin >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}><Wallet size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {saldoFin.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Resultado do Exercício ({saldoFin >= 0 ? "Superavit" : "Deficit"})</p>
                                    </div>
                                </div>
                            </div>

                            {/* Painel Central com Tabelas do Balancete e Botões */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8 glass-modern p-6 sm:p-8 rounded-[2.5rem] border border-white/50 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">Balancete Mensal Unificado</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{formatarMesAno(filterDate)}</p>
                                        </div>
                                        <Button 
                                            onClick={exportarPDFBalancete} 
                                            variant="success" 
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                        >
                                            <Download size={15}/>
                                            Exportar PDF
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        {/* Coluna 1: Entradas */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2 flex items-center gap-2"><ArrowUpCircle size={16}/> Receitas / Entradas</h4>
                                            <div className="space-y-4">
                                                {Object.keys(entradasAgrupadas).length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Sem registros no período.</p>
                                                ) : (
                                                    Object.entries(entradasAgrupadas).map(([cat, val]: any) => {
                                                        const p = totalEntradas > 0 ? ((val / totalEntradas) * 100) : 0;
                                                        return (
                                                            <div key={cat} className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-705">
                                                                    <span>{cat}</span>
                                                                    <span>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${p}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-right text-slate-400 font-extrabold">{p.toFixed(1)}%</p>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-800 font-black text-sm">
                                                    <span>Total Recebido</span>
                                                    <span className="text-emerald-600 font-bold">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna 2: Saídas */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest border-b border-rose-100 pb-2 flex items-center gap-2"><ArrowDownCircle size={16}/> Despesas / Saídas</h4>
                                            <div className="space-y-4">
                                                {Object.keys(saidasAgrupadas).length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Sem registros no período.</p>
                                                ) : (
                                                    Object.entries(saidasAgrupadas).map(([cat, val]: any) => {
                                                        const p = totalSaidas > 0 ? ((val / totalSaidas) * 100) : 0;
                                                        return (
                                                            <div key={cat} className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-705">
                                                                    <span>{cat}</span>
                                                                    <span>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${p}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-right text-slate-400 font-extrabold">{p.toFixed(1)}%</p>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-800 font-black text-sm">
                                                    <span>Total Pago</span>
                                                    <span className="text-rose-600 font-bold">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="glass-modern p-6 rounded-[2rem] border border-white/50 space-y-4 bg-gradient-to-tr from-slate-50/50 to-white text-slate-800">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileBarChart size={18} className="text-indigo-500" /> Prestação de Contas</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">Os demonstrativos mensais facilitam a transparência com os membros do ministério, reunindo todas as arrecadações e pagamentos quitados. Certifique-se de que todas as notas fiscais estejam correspondidas antes de publicar a prestação de contas no painel geral.</p>
                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><CheckCircle size={16}/></div>
                                            <div>
                                                <h4 className="text-xs font-extrabold text-slate-705">Auditoria Completa</h4>
                                                <p className="text-[10px] text-slate-450 font-medium tracking-tight">Balanços e lançamentos protegidos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Modal do Histórico de Alterações */}
            {selectedHistoryItem && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 p-8 space-y-6 my-8 animate-entrance font-sans text-slate-800">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <History size={20}/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Histórico de Alterações</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auditoria do Lançamento Financeiro</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedHistoryItem(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"><X size={18}/></button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                            <p className="text-slate-500 font-bold uppercase tracking-wider">Lançamento Ref.:</p>
                            <p className="font-extrabold text-slate-800 text-sm">{selectedHistoryItem.descricao}</p>
                            <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-semibold gap-4">
                                <span>
                                    Valor: <strong className="text-slate-700 font-bold">R$ {parseFloat(selectedHistoryItem.valor || 0).toFixed(2)}</strong>
                                </span>
                                <span>
                                    Status: <strong className={selectedHistoryItem.status === 'pago' ? "text-emerald-600 uppercase font-black" : "text-rose-600 uppercase font-black"}>{selectedHistoryItem.status || 'pendente'}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {selectedHistoryItem.historico && Array.isArray(selectedHistoryItem.historico) && selectedHistoryItem.historico.length > 0 ? (
                                <div className="relative pl-6 border-l border-slate-200 space-y-4">
                                    {selectedHistoryItem.historico.map((log: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            {/* Timeline Bullet/Dot */}
                                            <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold tracking-wider bg-slate-50 p-1 px-2 rounded-md">
                                                    <span className="uppercase">{log.usuario_nome || 'Operador'}</span>
                                                    <span>{log.data ? new Date(log.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-bold pl-2 leading-relaxed whitespace-pre-line">{log.descricao}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 italic text-xs">
                                    Nenhum histórico detalhado registrado para este lançamento.<br/>
                                    <span className="text-[10px] text-slate-300 font-normal mt-1 block">Auditorias serão geradas automaticamente após novas edições de valores ou status.</span>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setSelectedHistoryItem(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all">Fechar Histórico</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleFinanceiro;
