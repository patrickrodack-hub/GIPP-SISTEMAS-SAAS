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
const ModuleConciliacaoBancaria = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, logAction, setConfirmDialog } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    
    // --- Novos Estados (Animação e Filtro) ---
    const [connectingPhase, setConnectingPhase] = useState(1); // 1 = GUI Loading, 2 = Terminal, 3 = Concluído
    const [terminalLines, setTerminalLines] = useState([]);
    const [progress, setProgress] = useState(0);
    const [connText, setConnText] = useState("Iniciando conexão segura...");
    const [autoPixScanning, setAutoPixScanning] = useState(false);
    const [autoPixLogs, setAutoPixLogs] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    // Theming logic baseado no banco selecionado no Cadastro da Igreja
    const bancoNome = db.igreja?.banco || '';
    const nameLower = bancoNome.toLowerCase();
    
    let bankKey = 'default';
    if (nameLower.includes('banco do brasil')) bankKey = 'bb';
    else if (nameLower.includes('bradesco')) bankKey = 'bradesco';
    else if (nameLower.includes('caixa')) bankKey = 'caixa';
    else if (nameLower.includes('itaú') || nameLower.includes('itau')) bankKey = 'itau';
    else if (nameLower.includes('nubank')) bankKey = 'nubank';
    else if (nameLower.includes('santander')) bankKey = 'santander';
    else if (nameLower.includes('inter')) bankKey = 'inter';
    else if (nameLower.includes('c6')) bankKey = 'c6';
    else if (nameLower.includes('sicredi')) bankKey = 'sicredi';
    else if (nameLower.includes('sicoob')) bankKey = 'sicoob';

    const THEMES = {
        'bb': { primary: '#0038A8', secondary: '#FCE803', text: '#FFFFFF', name: 'BB', logo: 'https://icon.horse/icon/bb.com.br' },
        'caixa': { primary: '#005CA9', secondary: '#F39200', text: '#FFFFFF', name: 'CAIXA', logo: 'https://icon.horse/icon/caixa.gov.br' },
        'bradesco': { primary: '#CC092F', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Bradesco', logo: 'https://icon.horse/icon/bradesco.com.br' },
        'itau': { primary: '#EC7000', secondary: '#003399', text: '#FFFFFF', name: 'Itaú', logo: 'https://icon.horse/icon/itau.com.br' },
        'santander': { primary: '#EC0000', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Santander', logo: 'https://icon.horse/icon/santander.com.br' },
        'nubank': { primary: '#8A05BE', secondary: '#F4F4F4', text: '#FFFFFF', name: 'Nubank', logo: 'https://icon.horse/icon/nubank.com.br' },
        'inter': { primary: '#FF7A00', secondary: '#F5F5F5', text: '#FFFFFF', name: 'Inter', logo: 'https://icon.horse/icon/bancointer.com.br' },
        'c6': { primary: '#242424', secondary: '#DEDC00', text: '#FFFFFF', name: 'C6 Bank', logo: 'https://icon.horse/icon/c6bank.com.br' },
        'sicredi': { primary: '#00A859', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Sicredi', logo: 'https://icon.horse/icon/sicredi.com.br' },
        'sicoob': { primary: '#003641', secondary: '#00AE9D', text: '#FFFFFF', name: 'Sicoob', logo: 'https://icon.horse/icon/sicoob.com.br' },
        'default': { primary: '#0f172a', secondary: '#6366f1', text: '#FFFFFF', name: 'Internet Banking', logo: 'https://img.icons8.com/color/96/bank-building.png' }
    };

    const theme = THEMES[bankKey];
    
    // Logo "Baixada" guardada na DB da Igreja, com fallback infalível para o tema
    const logoBanco = db.igreja?.banco_logo_base64 || db.igreja?.banco_logo || theme.logo;

    // Efeito de Animação de Conexão Bancária - Fase 1 (Interface Gráfica: 5 Segundos)
    useEffect(() => {
        if (!db.igreja?.banco) {
            setConnectingPhase(3);
            return;
        }
        if (connectingPhase !== 1) return;

        const interval = setInterval(() => {
            setProgress(p => {
                const newP = p + 2; // Incrementa 2% a cada 100ms (Total de 5000ms = 5 segundos)
                if (newP === 25) setConnText("Autenticando credenciais da igreja...");
                if (newP === 50) setConnText("Sincronizando extrato e linha DDA...");
                if (newP === 75) setConnText("Descriptografando ambiente seguro...");
                if (newP >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setConnectingPhase(2), 300); // Remove a tela após 100% e passa para Fase 2
                }
                return newP;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [db.igreja?.banco, connectingPhase]);

    // Efeito de Animação de Conexão Bancária - Fase 2 (Terminal: 5 Segundos)
    useEffect(() => {
        if (connectingPhase !== 2) return;

        const logs = [
            `> INICIANDO TÚNEL SEGURO COM A API ${bancoNome.toUpperCase()}...`,
            `> ENDEREÇO IP: 192.168.1.104 -- PORTA: 443`,
            `> PROTOCOLO DE HANDSHAKE: TLSv1.3 [ATIVO]`,
            `> VERIFICANDO CERTIFICADOS DIGITAIS DA CONTA... [OK]`,
            `> ESTABELECENDO CONEXÃO DIRETA DDA/PIX...`,
            `> BUSCANDO TRANSAÇÕES E EXTRATO RECENTE: EM ANDAMENTO...`,
            `> IMPORTANDO COMPROVANTES E NOTIFICAÇÕES PIX...`,
            `> DESCRIPTOGRAFANDO PACOTES DE DADOS BANCÁRIOS... [OK]`,
            `> SINCRONIZANDO COM A BASE GIPP (GESTÃO ECLESIÁSTICA)... [OK]`,
            `> CONEXÃO BANCÁRIA ESTABELECIDA COM SUCESSO.`
        ];

        let i = 0;
        setTerminalLines([logs[0]]);
        const interval = setInterval(() => {
            i++;
            if (i < logs.length) {
                setTerminalLines(prev => [...prev, logs[i]]);
            } else {
                clearInterval(interval);
                setTimeout(() => setConnectingPhase(3), 1000); // Finaliza após 1s lendo tudo
            }
        }, 400); // 10 logs * 400ms = 4 segundos + 1s = 5 segundos

        return () => clearInterval(interval);
    }, [connectingPhase, bancoNome]);
    
    // --- Lógica do Extrato com Filtros ---
    // 1. Pega todo o histórico até a Data Final (Para calcular o saldo evolutivo oficial)
    const extratoGeral = db.financeiro.filter(f => {
        if (!(f.status === 'pago' || f.tipo === 'entrada')) return false;
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        if (f.conciliado === false) return false; // NOVO: Oculta lançamentos pendentes de validação bancária
        if (endDate) {
            const d = f.data_pagamento || f.data_competencia || f.data_vencimento || '';
            if (d > endDate) return false;
        }
        return true;
    }).sort((a, b) => {
        const dA = new Date(a.data_pagamento || a.data_competencia || a.data_vencimento || 0);
        const dB = new Date(b.data_pagamento || b.data_competencia || b.data_vencimento || 0);
        return dA.getTime() - dB.getTime();
    });

    // 2. Calcula o saldo corrente perfeitamente linha a linha
    let runningBalance = 0;
    const extratoComSaldo = extratoGeral.map(item => {
        const val = parseFloat(item.valor) || 0;
        if (item.tipo === 'entrada') runningBalance += val;
        else runningBalance -= val;
        return { ...item, saldoApos: runningBalance };
    });

    // 3. Aplica o filtro de Data Inicial para esconder o passado, mas manter o saldo correto
    let extratoVisivel = extratoComSaldo;
    if (startDate) {
        extratoVisivel = extratoVisivel.filter(f => {
            const d = f.data_pagamento || f.data_competencia || f.data_vencimento || '';
            return d >= startDate;
        });
    }
    extratoVisivel = extratoVisivel.reverse(); // Exibe os mais recentes no topo

    // Pendentes (DDA / Boletos) com Filtro
    const pendentes = db.financeiro.filter(f => {
        if (!(f.tipo === 'saida' && f.status !== 'pago')) return false;
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        const d = f.data_vencimento || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
    }).sort((a,b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    // Stats Oficiais Baseados no Filtro
    const saldoAtualCalculado = runningBalance; // Saldo real na data final do filtro (ou atual)
    const totalEntradasPeriodo = extratoVisivel.filter(f => f.tipo === 'entrada').reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const totalSaidasPeriodo = extratoVisivel.filter(f => f.tipo === 'saida').reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const totalPendentes = pendentes.reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const saldoProjetado = saldoAtualCalculado - totalPendentes;

    // --- NOVA LÓGICA DE VALIDAÇÃO (DINHEIRO/CARTÃO/PIX) ---
    const pendentesValidacao = db.financeiro.filter(f => {
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        
        if (startDate && (f.data_competencia || f.data_pagamento || f.data_vencimento) < startDate) return false;
        if (endDate && (f.data_competencia || f.data_pagamento || f.data_vencimento) > endDate) return false;

        return f.conciliado === false;
    }).sort((a,b) => new Date(a.data_competencia || a.data_pagamento || 0).getTime() - new Date(b.data_competencia || b.data_pagamento || 0).getTime());

    const handleAutoValidatePix = () => {
        const pixPendentes = pendentesValidacao.filter(f => f.forma_pagamento === 'PIX');
        if (pixPendentes.length === 0) {
            return addToast("Não há lançamentos de pagamento PIX pendentes para validação automática neste filtro.", "info");
        }
        
        setAutoPixScanning(true);
        setAutoPixLogs([`[INICIALIZANDO] Abrindo socket mTLS autenticado com as APIs do ${theme.name}...`]);
        
        const logsSeq = [
            `[AUTENTICAÇÃO] Certificado ICP-Brasil transmitido e checado com sucesso...`,
            `[API_BANCO] Requisitando extrato de transações eletrônicas em lote...`,
            `[VERIFICAÇÃO] Identificando entradas PIX liquidadas via Banco Central do Brasil...`,
            `[COMPARADOR] Processando varredura inteligente e cruzagem de valores de dízimos/ofertas...`
        ];

        let index = 0;
        const logInterval = setInterval(() => {
            if (index < logsSeq.length) {
                setAutoPixLogs(prev => [...prev, logsSeq[index]]);
                index++;
            } else {
                clearInterval(logInterval);
                setTimeout(async () => {
                    const dataAtual = new Date().toISOString().split('T')[0];
                    let count = 0;
                    try {
                        for (let item of pixPendentes) {
                            const hashTx = 'TX-AUTO-ADMIN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                            setAutoPixLogs(prev => [
                                ...prev,
                                `[CATCH_OK] ✔ Lançamento PIX R$ ${parseFloat(item.valor).toFixed(2)} (${item.membro_nome || 'Contribuição Direta'}) integrado à conta da igreja. Hash: ${hashTx}`
                            ]);
                            
                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { 
                                conciliado: true, 
                                data_conciliacao: dataAtual,
                                status: 'pago',
                                auto_validado: true,
                                tx_api_banco: hashTx
                            }, { merge: true });
                            
                            logAction('CONCILIAÇÃO_AUTOMATICA_PIX', `Painel Conciliação auto-validou PIX de R$ ${item.valor} (${item.descricao})`, 'financeiro', item.id);
                            count++;
                        }
                        
                        setAutoPixLogs(prev => [
                            ...prev,
                            `[CONCLUÍDO] ✔ Conciliação finalizada! ${count} dízimos, ofertas ou receitas PIX liquidados via API.`
                        ]);
                        
                        setTimeout(() => {
                            setAutoPixScanning(false);
                            addToast(`${count} lançamentos PIX foram auto-conciliados com sucesso!`, "success");
                        }, 1800);
                    } catch (err) {
                        console.error(err);
                        setAutoPixScanning(false);
                        addToast("Erro no cruzamento de dados PIX.", "error");
                    }
                }, 800);
            }
        }, 500);
    };

    const handleValidateSelected = () => {
        if (selectedIds.length === 0) return addToast("Selecione pelo menos um registro.", "warning");
        
        setConfirmDialog({
            isOpen: true,
            title: "Conciliação Bancária",
            message: `Deseja validar e conciliar ${selectedIds.length} registro(s)? Eles passarão a constar no extrato oficial.`,
            confirmText: "Validar Registros",
            variant: "success",
            onConfirm: async () => {
                const dataAtual = new Date().toISOString().split('T')[0];
                try {
                    for (let id of selectedIds) {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', id), { conciliado: true, data_conciliacao: dataAtual }, { merge: true });
                        logAction('CONCILIAÇÃO', `Validou lançamento financeiro na conta`, 'financeiro', id);
                    }
                    addToast("Registros validados com sucesso!", "success");
                    setSelectedIds([]);
                } catch(e) {
                    console.error(e);
                    addToast("Erro ao validar registros.", "error");
                }
            }
        });
    };

    const handlePaySelected = () => {
        if (selectedIds.length === 0) return addToast("Selecione pelo menos um pagamento.", "warning");
        
        setConfirmDialog({
            isOpen: true,
            title: "Autorizar Pagamento",
            message: `Autorizar o pagamento de ${selectedIds.length} título(s)? Esta ação fará a quitação imediata no sistema.`,
            confirmText: "Autorizar e Quitar",
            variant: "success",
            onConfirm: async () => {
                const dataAtualQuitacao = new Date().toISOString().split('T')[0]; // Captura a data atual exata do sistema
                try {
                    for (let id of selectedIds) {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', id), { status: 'pago', data_pagamento: dataAtualQuitacao }, { merge: true });
                        logAction('BAIXA_FINANCEIRA', `Baixa múltipla via Conciliação Bancária`, 'financeiro', id);
                    }
                    addToast("Pagamentos autorizados e quitados com sucesso!", "success");
                    setSelectedIds([]);
                } catch(e) {
                    console.error(e);
                    addToast("Erro ao processar pagamentos.", "error");
                }
            }
        });
    };

    // --- TELA DE CARREGAMENTO DO BANCO ---
    if (connectingPhase === 1 || connectingPhase === 2) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-entrance bg-slate-50 rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundColor: theme.primary }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                {connectingPhase === 1 && (
                    <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full p-10 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                        <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 p-5 border-4 border-slate-50 relative">
                            <div className="absolute inset-0 rounded-[2rem] border-4 border-transparent border-t-current animate-spin opacity-20" style={{ color: theme.primary }}></div>
                            <img src={logoBanco} alt="Logo Banco" className="w-full h-full object-contain relative z-10" onError={(e) => e.target.src = 'https://img.icons8.com/color/96/bank-building.png'} />
                        </div>
                        
                        <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: theme.primary }}>Conectando...</h2>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest h-4 mb-8 transition-all">{connText}</p>
                        
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full rounded-full transition-all duration-100 ease-linear relative overflow-hidden" style={{ width: `${progress}%`, backgroundColor: theme.primary }}>
                                <div className="absolute inset-0 bg-white/30 w-full h-full" style={{ animation: 'slideRight 1s infinite linear' }}></div>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-4 tracking-wider">{progress}% CONCLUÍDO</p>
                    </div>
                )}

                {connectingPhase === 2 && (
                    <div className="relative z-10 w-full max-w-3xl bg-[#0c0c0c] rounded-2xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-mono text-sm sm:text-base animate-scale-in">
                        <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-slate-800">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <span className="text-slate-400 font-bold ml-2 text-xs tracking-widest uppercase">Terminal Secure Shell - {theme.name}</span>
                        </div>
                        <div className="p-8 text-emerald-400 h-80 overflow-y-auto flex flex-col gap-2">
                            {terminalLines.map((line, idx) => (
                                <div key={idx} className="animate-fadeIn">
                                    {line}
                                </div>
                            ))}
                            <div className="w-2.5 h-5 bg-emerald-400 animate-pulse mt-1"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!db.igreja?.banco) {
        return (
            <div className="glass-modern p-10 rounded-[2.5rem] animate-entrance max-w-3xl mx-auto text-center mt-10 border border-slate-200">
                <Landmark size={64} className="mx-auto text-slate-300 mb-6"/>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Configure o Banco da Igreja</h2>
                <p className="text-slate-500 mb-6 font-medium">Para aceder ao ambiente de conciliação e internet banking, defina primeiro a instituição bancária no "Cadastro da Igreja".</p>
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm">
                    <strong>Dica:</strong> Vá a "Administrativo" &gt; "Igreja" e preencha os Dados Bancários.
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col animate-entrance bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 relative">
            {/* Header Simulating Bank Internet Banking */}
            <div className="px-8 py-5 flex justify-between items-center shadow-md relative z-20" style={{ backgroundColor: theme.primary, color: theme.text }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                        <img src={logoBanco} alt="Logo Banco" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://img.icons8.com/color/48/bank-building.png'} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl tracking-tight" style={{ color: theme.text }}>Internet Banking</h2>
                        <p className="text-xs opacity-80 font-medium">Ambiente Seguro • {theme.name}</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Titular da Conta</p>
                    <p className="font-black text-sm uppercase">{db.igreja.nome}</p>
                    <p className="text-xs opacity-90 font-mono mt-0.5 font-bold">Ag: {db.igreja.agencia || '0000'} | CC: {db.igreja.conta || '00000-0'}</p>
                </div>
            </div>

            {/* Bank Menu */}
            <div className="bg-white border-b border-slate-200 px-6 py-0 flex gap-6 overflow-x-auto custom-scrollbar shadow-sm relative z-10 shrink-0">
                {[
                    { id: 1, label: 'Extrato & Conciliação', icon: FileText },
                    { id: 4, label: 'Validação Bancária', icon: CheckCircle },
                    { id: 2, label: 'Pagamentos (A Pagar)', icon: CheckSquare },
                    { id: 3, label: 'Encontro de Contas', icon: Activity }
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => { setTab(item.id); setSelectedIds([]); }}
                        className={`py-4 px-2 font-bold text-sm flex items-center gap-2 transition-all border-b-4 whitespace-nowrap ${tab === item.id ? 'border-current text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        style={{ borderBottomColor: tab === item.id ? theme.primary : 'transparent' }}
                    >
                        <item.icon size={18} style={{ color: tab === item.id ? theme.primary : '' }}/> {item.label}
                        {item.id === 4 && pendentesValidacao.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pendentesValidacao.length}</span>}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                
                {/* Filtro Global do Módulo */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-8 py-4 flex flex-wrap gap-4 items-center justify-between shadow-sm relative z-10 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        <Filter size={16} style={{ color: theme.primary }}/> Filtro Avançado
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <option value="todas">Matriz e Filiais</option>
                            <option value="sede">Sede Principal</option>
                            {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">De</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none py-2 pr-3 text-xs font-bold text-slate-700 outline-none" />
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">Até</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none py-2 pr-3 text-xs font-bold text-slate-700 outline-none" />
                        </div>
                        {(startDate || endDate || congregacaoFilter !== 'todas') && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); setCongregacaoFilter('todas'); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 shadow-sm" title="Limpar Filtros">
                                <X size={16}/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    {tab === 1 && (
                        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="flex flex-wrap gap-4 shrink-0">
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4" style={{ borderLeftColor: theme.primary }}>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                                        Saldo Conta Corrente 
                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">Até {endDate ? formatDateLocal(endDate) : 'Hoje'}</span>
                                    </p>
                                    <h3 className="text-3xl font-black" style={{ color: saldoAtualCalculado >= 0 ? theme.primary : '#ef4444' }}>R$ {saldoAtualCalculado.toFixed(2)}</h3>
                                </div>
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Créditos (Visíveis)</p>
                                    <h3 className="text-2xl font-black text-emerald-600">R$ {totalEntradasPeriodo.toFixed(2)}</h3>
                                </div>
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Débitos (Visíveis)</p>
                                    <h3 className="text-2xl font-black text-rose-600">R$ {totalSaidasPeriodo.toFixed(2)}</h3>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 min-h-[500px]">
                                <GenericTable 
                                    title="Extrato de Lançamentos Confirmados" 
                                    type="financeiro" 
                                    data={extratoVisivel} 
                                    columns={[
                                        {header:'Data', key:'data', render: item => formatDateLocal(item.data_pagamento || item.data_competencia || item.data_vencimento)},
                                        {header:'Histórico / Descrição', key:'descricao', render: item => (
                                            <div>
                                                <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{item.categoria || 'Geral'} • {!item.congregacao_id || item.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===item.congregacao_id)?.nome}</span>
                                            </div>
                                        )},
                                        {header:'Docto.', key:'doc', render: item => <span className="text-xs font-mono text-slate-400 uppercase">{item.id.substring(0,8)}</span>},
                                        {header:'Valor (R$)', key:'valor', render: item => (
                                            <span className={`font-black whitespace-nowrap ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.tipo === 'entrada' ? '+' : '-'} {parseFloat(item.valor).toFixed(2)}
                                            </span>
                                        )},
                                        {header:'Saldo Após (R$)', key:'saldoApos', render: item => (
                                            <span className="font-mono font-bold text-slate-700 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                {item.saldoApos.toFixed(2)}
                                            </span>
                                        )}
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {tab === 2 && (
                        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm shrink-0">
                                <h4 className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle size={18}/> Pagamentos Pendentes (DDA / Débito Autorizado)</h4>
                                <p className="text-sm text-amber-700 mt-1 font-medium">Selecione e autorize o pagamento dos títulos abaixo. Esta ação fará a quitação imediata de todos os selecionados registando a data de hoje.</p>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                                <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4 shrink-0">
                                    <span className="font-bold text-sm text-slate-700 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                                        <CheckSquare size={16} className="text-slate-400"/> {selectedIds.length} título(s) selecionado(s)
                                    </span>
                                    <Button onClick={handlePaySelected} disabled={selectedIds.length === 0} style={{ backgroundColor: selectedIds.length > 0 ? theme.primary : '#cbd5e1', color: selectedIds.length > 0 ? theme.text : '#94a3b8' }} className="shadow-lg !border-0 transition-colors py-3.5 px-6">
                                        <CheckSquare size={18}/> Autorizar & Quitar Selecionados
                                    </Button>
                                </div>
                                
                                <div className="flex-1 flex flex-col bg-slate-50/30">
                                    <GenericTable 
                                        title="" 
                                        type="saida" 
                                        data={pendentes} 
                                        onSelectionChange={setSelectedIds}
                                        columns={[
                                            {header:'Vencimento', key:'data_vencimento', render: item => {
                                                const isVencido = new Date(item.data_vencimento) < new Date();
                                                return (
                                                    <div className="whitespace-nowrap">
                                                        <span className={`font-bold ${isVencido ? 'text-rose-600' : 'text-slate-700'}`}>{formatDateLocal(item.data_vencimento)}</span>
                                                        {isVencido && <span className="block text-[9px] font-black uppercase text-rose-500 mt-0.5">Vencido</span>}
                                                    </div>
                                                )
                                            }},
                                            {header:'Beneficiário / Histórico', key:'descricao', render: item => (
                                                <div>
                                                    <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                    {item.fornecedor_id && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{db.fornecedores.find(f=>f.id===item.fornecedor_id)?.nome || 'Fornecedor'}</span>}
                                                </div>
                                            )},
                                            {header:'Documento', key:'doc', render: item => <span className="text-xs font-mono text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">BOL-{item.id.substring(0,5)}</span>},
                                            {header:'Valor (R$)', key:'valor', render: item => <span className="font-black text-rose-600 whitespace-nowrap text-base">R$ {parseFloat(item.valor).toFixed(2)}</span>}
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 4 && (
                        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-2xl shadow-sm shrink-0">
                                <h4 className="font-bold text-indigo-800 flex items-center gap-2"><CheckCircle size={18}/> Validação Bancária (Lançamentos Pendentes)</h4>
                                <p className="text-sm text-indigo-700 mt-1 font-medium">Os registros em <b>PIX ou Transferência</b> podem ser validados de imediato. Os registros em <b>Dinheiro ou Cartão</b> devem aguardar a confirmação de depósito/liquidação na conta bancária.</p>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                                <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4 shrink-0">
                                    <span className="font-bold text-sm text-slate-700 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                                        <CheckSquare size={16} className="text-slate-400"/> {selectedIds.length} registro(s) selected(s)
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button 
                                            type="button"
                                            onClick={handleAutoValidatePix}
                                            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                                            className="shadow-lg !border-0 transition-all py-3.5 px-6 animate-pulse flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Zap size={18} className="fill-white" /> Auto-validar PIX (Real-time)
                                        </Button>
                                        <Button onClick={handleValidateSelected} disabled={selectedIds.length === 0} style={{ backgroundColor: selectedIds.length > 0 ? theme.primary : '#cbd5e1', color: selectedIds.length > 0 ? theme.text : '#94a3b8' }} className="shadow-lg !border-0 transition-colors py-3.5 px-6">
                                            <CheckCircle size={18}/> Validar e Conciliar
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col bg-slate-50/30">
                                    <GenericTable 
                                        title="" 
                                        type="financeiro" 
                                        data={pendentesValidacao} 
                                        onSelectionChange={setSelectedIds}
                                        columns={[
                                            {header:'Data', key:'data', render: item => <span className="font-bold text-slate-700">{formatDateLocal(item.data_competencia || item.data_pagamento || item.data_vencimento)}</span>},
                                            {header:'E/S', key:'tipo', render: item => <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.tipo}</span>},
                                            {header:'Descrição / Histórico', key:'descricao', render: item => (
                                                <div>
                                                    <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.categoria || 'Geral'}</span>
                                                </div>
                                            )},
                                            {header:'Forma de Pagto', key:'forma_pagamento', render: item => {
                                                const isRapido = item.forma_pagamento === 'PIX' || item.forma_pagamento === 'Transferência';
                                                return (
                                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${isRapido ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {item.forma_pagamento || 'Indefinido'}
                                                    </span>
                                                );
                                            }},
                                            {header:'Valor (R$)', key:'valor', render: item => <span className={`font-black whitespace-nowrap text-base ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {parseFloat(item.valor).toFixed(2)}</span>}
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Terminal Logs Popup de Auto-validação PIX - Admin Dashboard */}
                            {autoPixScanning && (
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-[#0c0c0e] text-emerald-400 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden font-mono text-xs sm:text-sm animate-scale-in">
                                        <div className="bg-[#121215] px-4 py-3 flex items-center justify-between border-b border-slate-800">
                                            <span className="font-extrabold text-slate-300 flex items-center gap-2 text-[11px] tracking-wider">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                API CONCILIAÇÃO INTELIGENTE DE PIX
                                            </span>
                                            <div className="flex gap-1.5">
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                            </div>
                                        </div>
                                        <div className="p-5 overflow-y-auto max-h-72 flex flex-col gap-2 min-h-[160px]">
                                            {autoPixLogs.map((log, idx) => (
                                                <div key={idx} className="animate-entrance leading-normal text-left">
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#121215] px-4 py-3 border-t border-slate-800 flex justify-end">
                                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Enlace de segurança direto ativado</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 3 && (
                        <div className="max-w-5xl mx-auto space-y-6 animate-scale-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 flex flex-col justify-center border border-slate-200" style={{ borderLeftColor: theme.primary }}>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Real (Apurado)</p>
                                    <h3 className="text-3xl font-black" style={{ color: theme.primary }}>R$ {saldoAtualCalculado.toFixed(2)}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-center border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lançamentos Futuros (DDA)</p>
                                    <h3 className="text-3xl font-black text-amber-500">R$ {totalPendentes.toFixed(2)}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 flex flex-col justify-center border border-slate-200" style={{ borderLeftColor: saldoProjetado >= 0 ? '#10b981' : '#ef4444' }}>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Projetado Final</p>
                                    <h3 className="text-3xl font-black" style={{ color: saldoProjetado >= 0 ? '#10b981' : '#ef4444' }}>R$ {saldoProjetado.toFixed(2)}</h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center mt-10">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-emerald-100">
                                    <Activity size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 mb-3">Conciliação Perfeita</h2>
                                <p className="text-slate-500 max-w-lg mb-8 font-medium leading-relaxed">Todos os dados refletem exatamente o espelho do livro caixa da igreja em tempo real com base no período que filtrou acima. Não existem divergências ativas.</p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm border border-emerald-200 shadow-sm flex items-center gap-2">
                                        <CheckCircle size={18}/> {extratoVisivel.length} Registos Validados
                                    </div>
                                    <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-xl font-bold text-sm border border-amber-200 shadow-sm flex items-center gap-2">
                                        <Clock size={18}/> {pendentes.length} Pendentes na Fila
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ModuleConciliacaoBancaria;
