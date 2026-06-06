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
const ModuleMissoes = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, logAction, deleteItem, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [subTab, setSubTab] = useState('eventos');
    const [viewModeKanban, setViewModeKanban] = useState('kanban');
    const [msgTemplate, setMsgTemplate] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [externalContacts, setExternalContacts] = useState([]);
    const [newExtName, setNewExtName] = useState('');
    const [newExtPhone, setNewExtPhone] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    // --- CARNÊ DE MISSÕES MODERN MANAGEMENTS ---
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [bulkCampaignTitle, setBulkCampaignTitle] = useState('CARNÊ DE MISSÕES ' + new Date().getFullYear());
    const [bulkValue, setBulkValue] = useState(50);
    const [bulkInstallments, setBulkInstallments] = useState(12);
    const [bulkFirstDue, setBulkFirstDue] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-10`;
    });
    const [bulkSelectedMembers, setBulkSelectedMembers] = useState([]);
    const [bulkSearch, setBulkSearch] = useState('');

    const filterByCong = (item) => congregacaoFilter === 'todas' || item.congregacao_id === congregacaoFilter || (!item.congregacao_id && congregacaoFilter === 'sede');

    // --- CAIXA MISSÕES FILTRO DE DATA E PERÍODO ---
    const [finStartDate, setFinStartDate] = useState('');
    const [finEndDate, setFinEndDate] = useState('');
    const [finPeriod, setFinPeriod] = useState('todos');

    const handlePeriodChange = (val: string) => {
        setFinPeriod(val);
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (val === 'todos') {
            setFinStartDate('');
            setFinEndDate('');
        } else if (val === 'hoje') {
            setFinStartDate(todayStr);
            setFinEndDate(todayStr);
        } else if (val === '7dias') {
            const past = new Date();
            past.setDate(today.getDate() - 7);
            setFinStartDate(past.toISOString().split('T')[0]);
            setFinEndDate(todayStr);
        } else if (val === '30dias') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            setFinStartDate(past.toISOString().split('T')[0]);
            setFinEndDate(todayStr);
        } else if (val === 'este_mes') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setFinStartDate(first.toISOString().split('T')[0]);
            setFinEndDate(last.toISOString().split('T')[0]);
        } else if (val === 'este_ano') {
            const first = new Date(today.getFullYear(), 0, 1);
            const last = new Date(today.getFullYear(), 11, 31);
            setFinStartDate(first.toISOString().split('T')[0]);
            setFinEndDate(last.toISOString().split('T')[0]);
        }
    };

    const handleStartDateChange = (val: string) => {
        setFinStartDate(val);
        setFinPeriod('personalizado');
    };

    const handleEndDateChange = (val: string) => {
        setFinEndDate(val);
        setFinPeriod('personalizado');
    };

    const financeiroMissoes = db.financeiro.filter(f => f.categoria === 'Missões').filter(filterByCong);

    const filteredFinanceiroMissoes = useMemo(() => {
        let list = [...financeiroMissoes];
        
        const parseDate = (dStr: string) => {
            if (!dStr) return null;
            return new Date(dStr + 'T00:00:00');
        };
        
        const start = finStartDate ? parseDate(finStartDate) : null;
        const end = finEndDate ? parseDate(finEndDate) : null;
        
        if (start || end) {
            list = list.filter(item => {
                if (!item.data_competencia) return false;
                const itemDate = parseDate(item.data_competencia);
                if (!itemDate) return false;
                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            });
        }
        
        return list;
    }, [financeiroMissoes, finStartDate, finEndDate]);

    const filteredStats = useMemo(() => {
        let entradas = 0;
        let saidas = 0;
        filteredFinanceiroMissoes.forEach(item => {
            const val = parseFloat(item.valor) || 0;
            const t = (item.tipo || '').toLowerCase();
            if (t === 'entrada' || t === 'receita') {
                entradas += val;
            } else if (t === 'saída' || t === 'saida' || t === 'despesa') {
                saidas += val;
            }
        });
        return {
            entradas,
            saidas,
            saldo: entradas - saidas
        };
    }, [filteredFinanceiroMissoes]);

    const missionariosList = (db.missoes.missionarios || []).filter(filterByCong);
    const agenciasList = (db.missoes.agencias || []).filter(filterByCong);
    const colaboradoresList = (db.missoes.colaboradores || []).filter(filterByCong);
    
    // Extracted Unique campaign titles
    const campaigns = useMemo(() => {
        const list = db.carnes || [];
        return Array.from(new Set(list.map(c => c.titulo || '').filter(Boolean)));
    }, [db.carnes]);

    // Auto-select a missions related campaign as default
    useEffect(() => {
        if (campaigns.length > 0 && !selectedCampaign) {
            const match = campaigns.find(c => c.toLowerCase().includes('miss'));
            if (match) setSelectedCampaign(match);
            else setSelectedCampaign(campaigns[0]);
        }
    }, [campaigns, selectedCampaign]);

    const campaignCarnes = useMemo(() => {
        return (db.carnes || []).filter(c => c.titulo === selectedCampaign).filter(filterByCong);
    }, [db.carnes, selectedCampaign, congregacaoFilter]);

    // General campaign calculations
    const campaignStats = useMemo(() => {
        const total = campaignCarnes.length;
        let totalPrometido = campaignCarnes.reduce((acc, c) => acc + (parseFloat(c.valor_total) || 0), 0);
        let totalPago = 0;
        let totalAtrasado = 0;
        const hoje = new Date().toISOString().split('T')[0];

        campaignCarnes.forEach(c => {
            (c.parcelas || []).forEach(p => {
                const val = parseFloat(p.valor) || 0;
                if (p.status === 'pago') {
                    totalPago += val;
                } else if (p.vencimento < hoje) {
                    totalAtrasado += val;
                }
            });
        });

        const adimplencia = totalPrometido > 0 ? ((totalPago / totalPrometido) * 100).toFixed(1) : '100';

        return {
            total,
            prometido: totalPrometido,
            pago: totalPago,
            atrasado: totalAtrasado,
            adimplencia
        };
    }, [campaignCarnes]);

    // Handler logic for inline installment clicks
    const handleToggleInstallment = async (carne, parcela) => {
        if (!carne || !parcela) return;
        const novasParcelas = (carne.parcelas || []).map(p => {
            if (p.numero === parcela.numero) {
                const novoStatus = p.status === 'pago' ? 'pendente' : 'pago';
                return {
                    ...p,
                    status: novoStatus,
                    data_pagamento: novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null
                };
            }
            return p;
        });

        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes', carne.id), { 
                parcelas: novasParcelas 
            }, { merge: true });
            
            const mNome = db.membros.find(m => m.id === carne.membro_id)?.nome || 'Membro';
            logAction('BAIXA_CARNE', `Alterou status da parcela ${parcela.numero} do carnê ${carne.titulo} de ${mNome}`, 'carnes', carne.id);
            addToast(`Parcela ${parcela.numero} de ${mNome} atualizada!`, "success");
            if (playNotificationSound) playNotificationSound();
        } catch (err) {
            addToast("Erro ao atualizar status da parcela.", "error");
        }
    };

    // Handler for billing message to WhatsApp
    const handleSendReminder = (membro, carne, p = null) => {
        const primeiroNome = miembroName(membro.id).split(' ')[0];
        const contato = membro.telefone || membro.contato || '';
        
        if (!contato) {
            addToast("Membro não possui telefone de contato cadastrado.", "warning");
            return;
        }

        let msg = '';
        if (p) {
            msg = `Olá ${primeiroNome}, a Paz do Senhor! Lembramos do seu voto de carinho com a Obra Missionária na campanha "${carne.titulo}". Segue o lembrete da parcela de R$ ${parseFloat(p.valor).toFixed(2)} com vencimento em ${formatDateLocal(p.vencimento)}. Que Deus multiplique a sua generosidade e sustento! Chave Pix da Igreja se preferir pagamento digital. 🙌🌍`;
        } else {
            msg = `Olá ${primeiroNome}, a Paz do Senhor! Queremos agradecer e abençoar a sua vida por apoiar ativamente o Departamento de Missões na campanha "${carne.titulo}". Seu voto mensal nos ajuda a sustentar famílias em campos transculturais. Caso queira consultar suas parcelas pendentes ou realizar contribuição, fale com nossa tesouraria. Obrigado por semear! 🌍🛡️`;
        }
        
        window.open(`https://wa.me/55${contato.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Assistant helpers
    const miembroName = (id) => db.membros.find(m => m.id === id)?.nome || 'Membro';
    const hasActiveInstallments = (carne) => carne.parcelas && carne.parcelas.length > 0;

    const membersEligibleForBulk = useMemo(() => {
        const list = (db.membros || []).filter(m => m.status !== 'Inativo').filter(filterByCong);
        const alreadyCampaignMemberIds = new Set(
            (db.carnes || [])
                .filter(c => c.titulo === bulkCampaignTitle)
                .map(c => c.membro_id)
        );
        return list.filter(m => !alreadyCampaignMemberIds.has(m.id));
    }, [db.membros, db.carnes, bulkCampaignTitle, congregacaoFilter]);

    const filteredEligibleMembers = useMemo(() => {
        return membersEligibleForBulk.filter(m => 
            m.nome?.toLowerCase().includes((bulkSearch || '').toLowerCase())
        );
    }, [membersEligibleForBulk, bulkSearch]);

    const handleBulkCreateCarnes = async () => {
        if (bulkSelectedMembers.length === 0) {
            return addToast("Selecione pelo menos um membro.", "warning");
        }
        if (!bulkCampaignTitle.trim()) {
            return addToast("Digite o título da campanha.", "warning");
        }
        if (bulkValue <= 0) {
            return addToast("Defina um valor mensal válido.", "warning");
        }
        
        setIsBulkCreating(true);
        addToast(`Gerando ${bulkSelectedMembers.length} carnês em lote...`, "info");
        
        try {
            let count = 0;
            for (let mId of bulkSelectedMembers) {
                const pList = [];
                const base = new Date(bulkFirstDue + 'T12:00:00');
                const valorTotal = bulkValue * bulkInstallments;
                
                for (let i = 0; i < bulkInstallments; i++) {
                    const d = new Date(base);
                    d.setMonth(d.getMonth() + i);
                    pList.push({
                        numero: i + 1,
                        valor: bulkValue,
                        vencimento: d.toISOString().split('T')[0],
                        status: 'pendente'
                    });
                }
                
                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes'), {
                    titulo: bulkCampaignTitle.trim(),
                    membro_id: mId,
                    valor_total: valorTotal,
                    parcelas: pList,
                    congregacao_id: congregacaoFilter === 'todas' ? 'sede' : congregacaoFilter,
                    data_criacao: new Date().toISOString()
                });
                count++;
            }
            
            logAction('CRIAÇÃO_LOTADA', `Criou ${count} carnês da campanha "${bulkCampaignTitle}" em lote`, 'carnes', 'lote');
            addToast(`${count} carnês de Missões gerados com sucesso!`, "success");
            setBulkSelectedMembers([]);
            setBulkSearch('');
        } catch (err) {
            console.error("Erro ao gerar carnês em massa:", err);
            addToast("Erro ao gerar registros em massa.", "error");
        } finally {
            setIsBulkCreating(false);
        }
    };
    
    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard}, 
        {id: 2, label: 'Missionários', icon: Users}, 
        {id: 3, label: 'Agências', icon: Building2}, 
        {id: 4, label: 'Colaboradores', icon: HeartHandshake}, 
        {id: 6, label: 'Carnê de Missões', icon: CreditCard},
        {id: 5, label: 'Financeiro', icon: DollarSign}, 
        {id: 7, label: 'Agenda & Tarefas', icon: Calendar}
    ];
    
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);


    // Dashboard Calculations
    const totalMissionarios = missionariosList.length;
    const totalAgencias = agenciasList.length;
    const totalMembros = (db.membros || []).filter(filterByCong).length;
    const totalColaboradores = colaboradoresList.length;
    const participantesCarne = new Set((db.carnes || []).filter(filterByCong).map(c => c.membro_id)).size;

    const pLineForMonth = (carne, monthIdx) => {
        const parcelas = carne.parcelas || [];
        return parcelas.find(p => {
            if (!p.vencimento) return false;
            try {
                const date = new Date(p.vencimento + 'T12:00:00');
                return date.getMonth() === monthIdx;
            } catch {
                return false;
            }
        });
    };

    const nextPendingInstallment = (carne) => {
        const parcelas = carne.parcelas || [];
        const hoje = new Date().toISOString().split('T')[0];
        const pending = parcelas.filter(p => p.status !== 'pago');
        if (pending.length === 0) return null;
        const overdue = pending.find(p => p.vencimento < hoje);
        if (overdue) return overdue;
        return pending[0];
    };

    // Agenda & Tarefas Lógica
    const agendaGeral = (db.missoes.agenda || []).filter(filterByCong).sort((a,b) => new Date(a.data || '9999-12-31').getTime() - new Date(b.data || '9999-12-31').getTime());
    const totalAgenda = agendaGeral.length;
    const eventosList = agendaGeral.filter(a => a.tipo === 'Evento' || !a.tipo); // Compatibilidade com antigos
    const tarefasList = agendaGeral.filter(a => a.tipo === 'Tarefa' || a.tipo === 'Escala Missionária' || a.tipo === 'Lembrete');

    const allContacts = useMemo(() => {
        return [
            ...(db.missoes.missionarios || []).map(m => ({ ...m, source: 'Missionário' })),
            ...(db.missoes.colaboradores || []).map(m => ({ ...m, source: 'Colaborador', telefone: m.contato || m.telefone })),
            ...(db.membros || []).map(m => ({ ...m, source: 'Membro' })),
            ...externalContacts
        ].filter(c => c.telefone);
    }, [db.missoes, db.membros, externalContacts]);

    const filteredContacts = allContacts.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.telefone.includes(searchTerm));

    const handleAddExternal = () => {
        if(!newExtName || !newExtPhone) return addToast("Preencha nome e telefone.", "warning");
        setExternalContacts([...externalContacts, { id: 'ext_'+Date.now(), nome: newExtName, telefone: newExtPhone, source: 'Contato Externo' }]);
        setNewExtName(''); setNewExtPhone('');
        addToast("Contato externo adicionado à lista temporária.", "success");
    };

    const handleNotifyEquipe = (item) => {
        let contacts = [];
        if (item.equipe) contacts.push(...item.equipe.filter(m => m.telefone));
        if (item.numero_whatsapp) contacts.push({ nome: 'Contato Externo', telefone: item.numero_whatsapp });
        
        if (contacts.length === 0) return addToast("Nenhum contato com telefone na equipe deste evento.", "warning");
        
        contacts.forEach(c => {
            const msg = encodeURIComponent(`Olá ${c.nome.split(' ')[0]}!\n\nLembrete de Missões: *${item.titulo}*\nData: ${formatDateLocal(item.data)} às ${item.hora || '--:--'}\nStatus: ${item.status || 'Agendado'}\n${item.descricao ? `\nDetalhes: ${item.descricao}` : ''}`);
            window.open(`https://wa.me/${c.telefone.replace(/\D/g,'')}?text=${msg}`, '_blank');
        });
        addToast("Mensagens abertas no WhatsApp!", "success");
    };

    const handleDragStartMissoes = (e, id) => { e.dataTransfer.setData('taskId', id); };
    const handleDragOverMissoes = (e) => { e.preventDefault(); };
    const handleDropMissoes = async (e, newStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('taskId');
        if (!id) return;
        const task = db.missoes.agenda.find(t => t.id === id);
        if (task && task.status !== newStatus) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'missoes_agenda', id), { status: newStatus }, { merge: true });
                logAction('EDIÇÃO', `Moveu tarefa missionária "${task.titulo}" para: ${newStatus}`, 'missoes_agenda', id);
                addToast("Status atualizado!", "success");
            } catch (err) { addToast("Erro ao mover a tarefa.", "error"); }
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shadow-sm border border-rose-100"><Globe size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Departamento de Missões</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de missionários, agências e apoio transcultural</p>
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
            <div className="glass-modern p-4 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-3 border border-white/50">{menuItems.map(item => <TabButton key={item.id} item={item} />)}</div>
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] flex items-center justify-between border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="text-4xl font-black text-indigo-600 tracking-tight">{totalMissionarios}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Missionários</p>
                                </div>
                                <div className="p-4 bg-indigo-50 text-indigo-300 rounded-full"><Globe size={40} /></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] flex items-center justify-between border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="text-4xl font-black text-blue-600 tracking-tight">{totalAgencias}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Agências</p>
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-300 rounded-full"><Building2 size={40} /></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] flex items-center justify-between border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="text-4xl font-black text-amber-600 tracking-tight">{totalAgenda}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Programações</p>
                                </div>
                                <div className="p-4 bg-amber-50 text-amber-300 rounded-full"><Calendar size={40} /></div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200">
                                <h4 className="font-black text-slate-700 mb-6 flex items-center gap-2"><HeartHandshake size={20} className="text-emerald-500"/> Engajamento no Departamento</h4>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-3xl font-black text-emerald-600 block">{totalColaboradores}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Colaboradores</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-600 block">{totalMembros}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Igreja Toda</span>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${totalMembros > 0 ? (totalColaboradores/totalMembros)*100 : 0}%`}}></div>
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-4 text-center bg-slate-50 py-2 rounded-xl">Representa <span className="text-emerald-600">{totalMembros > 0 ? ((totalColaboradores/totalMembros)*100).toFixed(1) : 0}%</span> dos membros cadastrados.</p>
                            </div>

                            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200">
                                <h4 className="font-black text-slate-700 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-pink-500"/> Contribuintes em Carnês</h4>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-3xl font-black text-pink-600 block">{participantesCarne}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contribuintes</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-600 block">{totalMembros}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Igreja Toda</span>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                                    <div className="h-full bg-pink-500 transition-all duration-1000" style={{width: `${totalMembros > 0 ? (participantesCarne/totalMembros)*100 : 0}%`}}></div>
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-4 text-center bg-slate-50 py-2 rounded-xl">Participação financeira de <span className="text-pink-600">{totalMembros > 0 ? ((participantesCarne/totalMembros)*100).toFixed(1) : 0}%</span> da igreja.</p>
                            </div>
                        </div>
                    </div>
                )}
                {tab === 2 && <GenericTable title="Missionários" type="missionario" data={missionariosList} columns={[{header:'Nome', key:'nome'}, {header:'Campo', key:'campo'}, {header:'Agência', key:'agencia'}]} />}
                {tab === 3 && <GenericTable title="Agências" type="agencia_missoes" data={agenciasList} columns={[{header:'Agência', key:'nome'}, {header:'Responsável', key:'responsavel'}]} />}
                {tab === 4 && <GenericTable title="Colaboradores" type="missoes_colaborador" data={colaboradoresList} columns={[{header:'Nome', key:'nome'}, {header:'Tipo Apoio', key:'tipo'}]} />}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-2 pb-16">
                        {/* Painel de Filtros */}
                        <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between bg-white/70">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                <div className="text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Período / Atalhos</label>
                                    <select
                                        value={finPeriod}
                                        onChange={e => handlePeriodChange(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="todos">📅 Todo o Período</option>
                                        <option value="hoje">☀️ Hoje</option>
                                        <option value="7dias">🔄 Últimos 7 dias</option>
                                        <option value="30dias">🗓️ Últimos 30 dias</option>
                                        <option value="este_mes">🌸 Este Mês</option>
                                        <option value="este_ano">✨ Este Ano</option>
                                        <option value="personalizado">🛠️ Personalizado</option>
                                    </select>
                                </div>
                                <div className={`text-left ${finPeriod === 'personalizado' ? "opacity-100" : "opacity-70"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={finStartDate}
                                        onChange={e => handleStartDateChange(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div className={`text-left ${finPeriod === 'personalizado' ? "opacity-100" : "opacity-70"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Final</label>
                                    <input
                                        type="date"
                                        value={finEndDate}
                                        onChange={e => handleEndDateChange(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                            
                            {(finPeriod !== 'todos' || finStartDate || finEndDate) && (
                                <button
                                    onClick={() => handlePeriodChange('todos')}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:text-rose-600 tracking-wider transition duration-200 flex items-center gap-1.5 self-center md:self-end"
                                >
                                    <RotateCcw size={12} /> Limpar
                                </button>
                            )}
                        </div>

                        {/* Badges de Métricas Financeiras Filtradas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0">
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Entradas</p>
                                    <h3 className="text-2xl font-black text-emerald-600 tracking-tight mt-1.5">R$ {filteredStats.entradas.toFixed(2)}</h3>
                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">no período selecionado</span>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><TrendingUp size={24} /></div>
                            </div>

                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Saídas</p>
                                    <h3 className="text-2xl font-black text-rose-600 tracking-tight mt-1.5">R$ {filteredStats.saidas.toFixed(2)}</h3>
                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">no período selecionado</span>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><TrendingDown size={24} /></div>
                            </div>

                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex items-center justify-between bg-white">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Saldo Líquido</p>
                                    <h3 className={`text-2xl font-black tracking-tight mt-1.5 ${filteredStats.saldo >= 0 ? "text-indigo-600" : "text-rose-650"}`}>
                                        R$ {filteredStats.saldo.toFixed(2)}
                                    </h3>
                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">sobra em caixa</span>
                                </div>
                                <div className={`p-3 rounded-2xl ${filteredStats.saldo >= 0 ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-500"}`}><Landmark size={24} /></div>
                            </div>
                        </div>

                        {/* Tabela do Caixa de Missões */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <GenericTable 
                                title="Caixa Missões" 
                                type="missoes_financeiro" 
                                data={filteredFinanceiroMissoes} 
                                columns={[
                                    {header:'Data', key:'data_competencia', render: d=>formatDateLocal(d.data_competencia)}, 
                                    {header:'Descrição', key:'descricao'}, 
                                    {header:'Valor', key:'valor', render: v=>`R$ ${parseFloat(v.valor).toFixed(2)}`}, 
                                    {header:'Tipo', key:'tipo'}
                                ]} 
                            />
                        </div>
                    </div>
                )}
                
                {/* --- NOVO: ABA CARNÊ DE MISSÕES --- */}
                {tab === 6 && (
                    <div className="h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-2 pb-16">
                        {/* Upper Stats Panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><Users size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{campaignStats.total}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contribuintes Ativos</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><DollarSign size={20}/></div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">R$ {campaignStats.prometido.toFixed(2)}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Total Prometido</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><Activity size={20}/></div>
                                <div>
                                    <h3 className="text-2xl font-black text-emerald-600 tracking-tight mb-1">R$ {campaignStats.pago.toFixed(2)}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Arrecadado</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4"><CheckCircle size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-purple-600 tracking-tight mb-1">{campaignStats.adimplencia}%</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Taxa de Adimplência</p>
                                </div>
                            </div>
                        </div>

                        {/* Control actions & Campaign selector */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                            <div className="lg:col-span-1 glass-modern p-6 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Campanha Ativa</label>
                                    <select 
                                        value={selectedCampaign} 
                                        onChange={e => setSelectedCampaign(e.target.value)} 
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {campaigns.length === 0 && <option value="">Nenhum carnê no sistema</option>}
                                        {campaigns.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Toque nos quadradinhos da matriz para registrar as contribuições mensais.</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                    <Button onClick={() => openModal('carne_novo')} variant="secondary" className="w-full text-xs py-2">
                                        <Plus size={14}/> Criar Carnê Unitário
                                    </Button>
                                </div>
                            </div>

                            {/* Inscrição em Lote Wizard (Bulk Creator) */}
                            <div className="lg:col-span-2 glass-modern p-6 rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/20 via-white to-white flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={16} className="text-indigo-500"/> Assistente de Inscrição em Massa</h4>
                                            <p className="text-xs text-slate-500 font-medium">Cadastre vários contribuintes no Carnê de Missões de uma vez só em 3 segundos.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[9px] font-black text-rose-500 uppercase mb-1">Título do Lote</label>
                                            <input 
                                                type="text" 
                                                value={bulkCampaignTitle} 
                                                onChange={e => setBulkCampaignTitle(e.target.value.toUpperCase())} 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none uppercase shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Valor Parcela (R$)</label>
                                            <input 
                                                type="number" 
                                                value={bulkValue} 
                                                onChange={e => setBulkValue(parseFloat(e.target.value) || 0)} 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Primeiro Venc.</label>
                                            <input 
                                                type="date" 
                                                value={bulkFirstDue} 
                                                onChange={e => setBulkFirstDue(e.target.value)} 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Member selection checkboard */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{filteredEligibleMembers.length} membros elegíveis</span>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setBulkSelectedMembers(membersEligibleForBulk.map(m=>m.id))} 
                                                    className="text-[9px] font-black text-indigo-600 hover:underline uppercase"
                                                >
                                                    Marcar Todos
                                                </button>
                                                <span className="text-slate-300">|</span>
                                                <button 
                                                    onClick={() => setBulkSelectedMembers([])} 
                                                    className="text-[9px] font-black text-slate-500 hover:underline uppercase"
                                                >
                                                    Limpar
                                                </button>
                                            </div>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Buscar membros..." 
                                            value={bulkSearch} 
                                            onChange={e => setBulkSearch(e.target.value)} 
                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs mb-2 outline-none uppercase font-semibold"
                                        />
                                        <div className="max-h-24 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1">
                                            {filteredEligibleMembers.map(m => {
                                                const isSelected = bulkSelectedMembers.includes(m.id);
                                                return (
                                                    <button 
                                                        key={m.id} 
                                                        onClick={() => {
                                                            if (isSelected) setBulkSelectedMembers(bulkSelectedMembers.filter(id => id !== m.id));
                                                            else setBulkSelectedMembers([...bulkSelectedMembers, m.id]);
                                                        }}
                                                        className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        <span className="truncate pr-1">{m.nome}</span>
                                                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                                            {isSelected && <Check size={10} strokeWidth={4}/>}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                            {filteredEligibleMembers.length === 0 && (
                                                <p className="text-[11px] text-slate-400 italic col-span-full text-center py-2">Nenhum membro ativo restante.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 flex justify-between items-center bg-slate-50/50 p-2 rounded-xl">
                                    <span className="text-xs font-bold text-slate-600">
                                        {bulkSelectedMembers.length} membros selecionados • Total: R$ {(bulkSelectedMembers.length * bulkValue * bulkInstallments).toFixed(2)}
                                    </span>
                                    <Button 
                                        onClick={handleBulkCreateCarnes} 
                                        disabled={isBulkCreating || bulkSelectedMembers.length === 0} 
                                        variant="primary" 
                                        className="text-xs py-2 px-5 bg-gradient-to-r from-indigo-600 to-rose-600 select-none shadow text-white font-bold"
                                    >
                                        {isBulkCreating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Gerar Carnês em Lote
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Matrix Grid (The Showpiece) */}
                        <div className="glass-modern p-6 rounded-[2.5rem] border border-slate-200 overflow-hidden flex flex-col">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 shrink-0">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Globe size={20} className="text-indigo-500" /> Matriz do Carnê de Missões
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Mapa anual de recolhimento de parcelas e votos missionários.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pago
                                    </span>
                                    <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-200">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Atrasado
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Pendente
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                                            <th className="py-3 px-4 font-black">Contribuinte / Membro</th>
                                            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((label, idx) => (
                                                <th key={idx} className="py-3 px-1 text-center font-black w-[60px]">{label}</th>
                                            ))}
                                            <th className="py-3 px-2 text-center font-black w-[100px]">Arrecadado</th>
                                            <th className="py-3 px-3 text-right font-black">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {campaignCarnes.map((carne) => {
                                            const memberObj = db.membros.find(m => m.id === carne.membro_id) || { id: carne.membro_id, nome: 'Não localizado', telefone: '' };
                                            
                                            // Calculate paid / total for this booklet
                                            const totalPromisedLine = parseFloat(carne.valor_total) || 0;
                                            const paidCountLine = (carne.parcelas || [])
                                                .filter(p => p.status === 'pago')
                                                .reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
                                                
                                            const progressPct = totalPromisedLine > 0 ? Math.round((paidCountLine / totalPromisedLine) * 100) : 0;

                                            return (
                                                <tr key={carne.id} className="hover:bg-slate-50/60 transition-colors group">
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shadow-sm shrink-0">
                                                                {memberObj.nome ? memberObj.nome.substring(0, 2).toUpperCase() : 'M'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 leading-snug">{memberObj.nome}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{carne.titulo}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Month Matrix Cells */}
                                                    {Array.from({ length: 12 }).map((_, mIdx) => {
                                                        const p = pLineForMonth(carne, mIdx);
                                                        if (!p) {
                                                            return (
                                                                <td key={mIdx} className="py-3 text-center text-slate-200">
                                                                    <span className="text-[10px] font-bold text-slate-300">—</span>
                                                                </td>
                                                            );
                                                        }

                                                        const isPago = p.status === 'pago';
                                                        const isAtrasado = !isPago && p.vencimento < new Date().toISOString().split('T')[0];

                                                        return (
                                                            <td key={mIdx} className="py-3 px-1 text-center">
                                                                <button 
                                                                    onClick={() => handleToggleInstallment(carne, p)}
                                                                    title={`Parcela ${p.numero} - Vencimento: ${formatDateLocal(p.vencimento)} - clique para alternar status`}
                                                                    className={`w-11 h-8 rounded-xl font-bold text-[9px] flex flex-col items-center justify-center transition-all border outline-none shadow-sm ${
                                                                        isPago 
                                                                            ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' 
                                                                            : isAtrasado 
                                                                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                                                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    <span>M{mIdx + 1}</span>
                                                                    <span className="text-[7.5px] font-bold opacity-90">R${Math.round(p.valor)}</span>
                                                                </button>
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="py-3.5 px-2 text-center">
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-bold text-slate-800">R$ {paidCountLine}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold">({progressPct}%)</span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end gap-2 shrink-0">
                                                            <button 
                                                                onClick={() => {
                                                                    setPrintData({ 
                                                                        igreja: db.igreja, 
                                                                        carne: carne, 
                                                                        membro: db.membros.find(m => m.id === carne.membro_id) || memberObj 
                                                                    }); 
                                                                    setPrintMode('carne_print'); 
                                                                    setPreviewOpen(true);
                                                                }}
                                                                className="p-1 px-2.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 flex items-center gap-1 shadow-sm"
                                                                title="Imprimir Carnê"
                                                            >
                                                                <PrintIcon size={12}/> Carnê
                                                            </button>
                                                            
                                                            <button 
                                                                onClick={() => handleSendReminder(memberObj, carne, nextPendingInstallment(carne))}
                                                                className="p-1 px-2 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200 flex items-center gap-1 shadow-sm"
                                                                title="Contatar Prazos no WhatsApp"
                                                            >
                                                                <MessageCircle size={12}/> Cobrar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {campaignCarnes.length === 0 && (
                                            <tr>
                                                <td colSpan={15} className="py-12 text-center text-slate-400 italic">
                                                    Nenhum contribuinte vinculado a esta campanha. Use o assistente acima para criar o lote de Missões.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- NOVO: ABA AGENDA, TAREFAS E WHATSAPP --- */}
                {tab === 7 && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 bg-white/40 p-3 rounded-2xl border border-white/50">
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
                                <button onClick={()=>setSubTab('eventos')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab==='eventos'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Eventos</button>
                                <button onClick={()=>setSubTab('tarefas')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab==='tarefas'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Tarefas & Escalas</button>
                                <button onClick={()=>setSubTab('whatsapp')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab==='whatsapp'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Disparo WhatsApp</button>
                            </div>
                            <Button onClick={() => openModal('missoes_agenda')} variant="primary" className="py-2 px-4 text-xs shadow-md"><Plus size={16}/> Novo Registo</Button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {subTab === 'eventos' && (
                                <GenericTable 
                                    title="Eventos Missionários" 
                                    type="missoes_agenda" 
                                    data={eventosList} 
                                    columns={[
                                        {header:'Evento', key:'titulo', render: r => <div><span className="font-bold text-slate-800">{r.titulo}</span><div className="text-[10px] text-slate-500">{r.descricao}</div></div>}, 
                                        {header:'Data', key:'data', render: d=> <span className="font-medium text-slate-700">{formatDateLocal(d.data)} às {d.hora || '--:--'}</span>}, 
                                        {header:'Status', key:'status', render: r => <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">{r.status || 'Agendado'}</span>}
                                    ]} 
                                    customActions={(row) => (
                                        <button onClick={() => handleNotifyEquipe(row)} className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Notificar Equipe via WhatsApp"><MessageCircle size={18}/></button>
                                    )}
                                />
                            )}
                            
                            {subTab === 'tarefas' && (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-end gap-3 mb-4">
                                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                                            <button onClick={() => setViewModeKanban('lista')} className={`p-2 rounded-lg transition-all ${viewModeKanban === 'lista' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Modo Lista"><List size={16}/></button>
                                            <button onClick={() => setViewModeKanban('kanban')} className={`p-2 rounded-lg transition-all ${viewModeKanban === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Modo Kanban"><LayoutTemplate size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    {viewModeKanban === 'lista' ? (
                                        <GenericTable title="" type="missoes_agenda" data={tarefasList} columns={[{header:'Descrição', key:'titulo'}, {header:'Tipo', key:'tipo', render: c => <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{c.tipo}</span>}, {header:'Equipe', key:'equipe', render: t => (<div className="flex -space-x-2">{(t.equipe || []).slice(0, 4).map((m, i) => (<div key={i} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600" title={`${m.nome} - ${m.funcao_escala}`}>{m.nome ? m.nome.charAt(0) : '?'}</div>))}{(t.equipe || []).length > 4 && <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">+{t.equipe.length-4}</div>}{(!t.equipe || t.equipe.length === 0) && <span className="text-xs text-slate-400">-</span>}</div>)}, {header:'Data', key:'data', render:d=>formatDateLocal(d.data)}, {header:'Status', key:'status'}]} customActions={(item) => (
                                            <button onClick={() => handleNotifyEquipe(item)} className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Notificar Equipe via WhatsApp"><MessageCircle size={18}/></button>
                                        )}/>
                                    ) : (
                                        <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-2 pt-2 items-start h-[calc(100vh-250px)]">
                                            {[
                                                { id: 'Pendente', label: 'Pendente', color: 'amber', icon: Clock },
                                                { id: 'Em Andamento', label: 'Em Andamento', color: 'blue', icon: Activity },
                                                { id: 'Concluido', label: 'Concluído', color: 'emerald', icon: CheckCircle }
                                            ].map(col => (
                                                <div key={col.id} className={`w-[340px] shrink-0 h-full flex flex-col bg-${col.color}-50/60 rounded-[2rem] border border-${col.color}-200/60 shadow-inner`} onDragOver={handleDragOverMissoes} onDrop={(e) => handleDropMissoes(e, col.id)}>
                                                    <div className={`p-5 border-b border-${col.color}-200/60 flex justify-between items-center bg-${col.color}-100/50 rounded-t-[2rem]`}>
                                                        <h4 className={`font-black text-${col.color}-800 flex items-center gap-2 tracking-tight text-sm uppercase`}><col.icon size={18} className={`text-${col.color}-600`}/> {col.label}</h4>
                                                        <span className={`bg-${col.color}-200 text-${col.color}-800 text-xs font-black px-3 py-1 rounded-full shadow-sm`}>{tarefasList.filter(t => t.status === col.id).length}</span>
                                                    </div>
                                                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                                        {tarefasList.filter(t => t.status === col.id).map(task => (
                                                            <div key={task.id} draggable onDragStart={(e) => handleDragStartMissoes(e, task.id)} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 hover:border-${col.color}-400 transition-all duration-300 group relative overflow-hidden`}>
                                                                <div className={`absolute top-0 left-0 w-1.5 h-full bg-${col.color}-400`}></div>
                                                                <div className="flex justify-between items-start mb-3 pl-2">
                                                                    <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded bg-slate-100 text-slate-500 tracking-wider shadow-sm`}>{task.tipo}</span>
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => handleNotifyEquipe(task)} className="text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"><MessageCircle size={16}/></button>
                                                                        <button onClick={() => openModal('missoes_agenda', task)} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"><Edit size={16}/></button>
                                                                        <button onClick={() => deleteItem('missoes_agenda', task.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                                    </div>
                                                                </div>
                                                                <h5 className="font-bold text-slate-800 text-sm mb-2 pl-2 leading-snug">{task.titulo}</h5>
                                                                <p className="text-xs text-slate-500 mb-5 pl-2 line-clamp-2">{task.descricao}</p>
                                                                <div className="flex justify-between items-end pl-2">
                                                                    <div className="flex -space-x-2">
                                                                        {(task.equipe || []).slice(0, 3).map((m, i) => (
                                                                            <div key={i} className={`w-8 h-8 rounded-full bg-${col.color}-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-${col.color}-700 shadow-sm`} title={`${m.nome} - ${m.funcao_escala}`}>{m.nome ? m.nome.charAt(0) : '?'}</div>
                                                                        ))}
                                                                        {(task.equipe || []).length > 3 && <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">+{task.equipe.length-3}</div>}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {task.data && <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg border ${new Date(task.data) < new Date() && task.status !== 'Concluido' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}><Calendar size={12}/> {formatDateLocal(task.data)}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {tarefasList.filter(t => t.status === col.id).length === 0 && (
                                                            <div className="h-28 border-2 border-dashed border-slate-300/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                                                <Move size={20} className="opacity-50"/>
                                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Solte aqui</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {subTab === 'whatsapp' && (
                                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                                     <div className="lg:col-span-1 glass-modern p-6 rounded-[2.5rem] flex flex-col h-full overflow-hidden">
                                         <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-indigo-500"/> Lista de Contatos</h3>
                                         <input type="text" placeholder="Buscar contato..." value={searchTerm} onChange={e=>setSearchTerm(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4 shadow-sm uppercase"/>
                                         
                                         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                            {filteredContacts.map((c, i) => (
                                                <label key={i} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedContacts.includes(c.id || c.telefone) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800 truncate max-w-[150px]">{c.nome}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{c.source} • {c.telefone}</p>
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={selectedContacts.includes(c.id || c.telefone)} onChange={(e) => {
                                                        const id = c.id || c.telefone;
                                                        if (e.target.checked) setSelectedContacts([...selectedContacts, id]);
                                                        else setSelectedContacts(selectedContacts.filter(x => x !== id));
                                                    }} />
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedContacts.includes(c.id || c.telefone) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                                        {selectedContacts.includes(c.id || c.telefone) && <Check size={14}/>}
                                                    </div>
                                                </label>
                                            ))}
                                         </div>
                                         
                                         <div className="mt-4 pt-4 border-t border-slate-200">
                                             <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Adicionar Contato Avulso</p>
                                             <div className="flex gap-2">
                                                 <input type="text" placeholder="Nome" value={newExtName} onChange={e=>setNewExtName(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none uppercase"/>
                                                 <input type="text" placeholder="Telefone" value={newExtPhone} onChange={e=>setNewExtPhone(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="w-1/2 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none uppercase"/>
                                             </div>
                                             <Button onClick={handleAddExternal} variant="secondary" className="w-full mt-2 text-xs py-2"><Plus size={14}/> Adicionar</Button>
                                         </div>
                                     </div>

                                     <div className="lg:col-span-2 glass-modern p-6 rounded-[2.5rem] flex flex-col h-full overflow-y-auto">
                                         <div className="mb-6">
                                             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4"><MessageCircle size={20} className="text-emerald-500"/> Disparo de Mensagens</h3>
                                             <p className="text-sm text-slate-500 font-medium mb-4">Escreva a mensagem ou selecione um template. Use <strong className="text-indigo-600">{`{nome}`}</strong> para personalizar com o nome do destinatário.</p>
                                             <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
                                                 <button onClick={()=>setMsgTemplate("Olá {nome}, a Paz do Senhor! Lembramos do nosso evento missionário que acontecerá em breve. Contamos com sua presença! 🙏")} className="shrink-0 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold text-slate-600 p-2 rounded-lg transition-colors">Lembrete de Evento</button>
                                                 <button onClick={()=>setMsgTemplate("A Paz do Senhor, {nome}! Você está escalado para a nossa próxima missão. Confirme sua presença assim que possível. Deus abençoe! 🛡️")} className="shrink-0 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold text-slate-600 p-2 rounded-lg transition-colors">Escala Missionária</button>
                                                 <button onClick={()=>setMsgTemplate("Querido parceiro(a) {nome}, muito obrigado por contribuir com Missões este mês! O seu apoio leva a palavra aos confins da Terra. 🌍")} className="shrink-0 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold text-slate-600 p-2 rounded-lg transition-colors">Agradecimento</button>
                                             </div>
                                         </div>
                                         <div className="flex-1 flex flex-col">
                                             <textarea className="flex-1 w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-4 shadow-inner uppercase" value={msgTemplate} onChange={e => setMsgTemplate(((e.target.value || "").toUpperCase() || "").toUpperCase())} placeholder="Digite sua mensagem aqui... Use {nome} para personalizar."></textarea>
                                             <div className="flex gap-2 mb-6">
                                                 <Button onClick={async () => { if (!msgTemplate) return addToast("Digite uma mensagem primeiro.", "warning"); setLoadingAi(true); addToast("✨ A processar com IA...", "info"); const result = await callGeminiAI(`Melhore a seguinte mensagem de WhatsApp missionária. Estilo: Encorajador e Espiritual. Mantenha a variável {nome}. Remova aspas. Mensagem original: "${msgTemplate}"`); setMsgTemplate(result.replace(/^"|"$/g, '').trim()); setLoadingAi(false); addToast("✨ Mensagem aprimorada!", "success"); }} disabled={loadingAi} variant="ghost" className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 py-2.5 flex-1 shadow-sm">
                                                     {loadingAi ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} ✨ IA Encorajador
                                                 </Button>
                                                 <Button onClick={async () => { if (!msgTemplate) return addToast("Digite uma mensagem primeiro.", "warning"); setLoadingAi(true); addToast("✨ A processar com IA...", "info"); const result = await callGeminiAI(`Melhore a seguinte mensagem de WhatsApp missionária. Estilo: Formal e Informativo. Mantenha a variável {nome}. Remova aspas. Mensagem original: "${msgTemplate}"`); setMsgTemplate(result.replace(/^"|"$/g, '').trim()); setLoadingAi(false); addToast("✨ Mensagem aprimorada!", "success"); }} disabled={loadingAi} variant="ghost" className="text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 py-2.5 flex-1 shadow-sm">
                                                     {loadingAi ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} ✨ IA Formal
                                                 </Button>
                                             </div>
                                             <div className="bg-emerald-50 p-4 rounded-xl mb-4 border border-emerald-100 flex items-center justify-between">
                                                 <div>
                                                    <p className="text-xs text-emerald-800 font-black mb-1">{selectedContacts.length} contatos selecionados</p>
                                                    <p className="text-[10px] text-emerald-600 font-medium">O sistema abrirá janelas do WhatsApp Web com a mensagem pronta.</p>
                                                 </div>
                                                 <Button onClick={() => {
                                                     if(selectedContacts.length === 0) return alert("Selecione pelo menos um contato.");
                                                     if(!msgTemplate) return alert("Digite a mensagem.");
                                                     selectedContacts.forEach(id => {
                                                         const c = allContacts.find(x => x.id === id || x.telefone === id);
                                                         if (c && c.telefone) {
                                                             const text = encodeURIComponent(msgTemplate.replace('{nome}', c.nome.split(' ')[0]));
                                                             const num = c.telefone.replace(/\D/g, '');
                                                             window.open(`https://wa.me/${num}?text=${text}`, '_blank');
                                                         }
                                                     });
                                                 }} variant="success" className="shadow-lg shadow-emerald-500/30 px-8 py-3"><Send size={18}/> Disparar</Button>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ModuleMissoes;
