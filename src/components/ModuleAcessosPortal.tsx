import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, ChevronDown, ChevronRight, Plus, Edit, Trash2, Printer, 
  Search, Menu, X, DollarSign, BookOpen, Globe, Calendar, UserCheck, 
  CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Filter, MapPin, Briefcase, Heart, GraduationCap, Shield, Download,
  ClipboardList, Gift, PieChart as PieChartIcon, Upload, Image as ImageIcon, Database, Save, RefreshCw, Trash,
  Phone, Mail, Code, Info, Share2, Home, FileBadge, Stamp, Wifi, WifiOff, Star, HeartHandshake, Camera,
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, User, UserPlus, Video,
  FileSpreadsheet, CheckCheck, Flag, Smile, Copy, Bold, Italic, Type, Activity, Receipt, RotateCcw, Ban, Archive,
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, FileInput, RotateCcw as RestoreIcon,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sliders, Newspaper, BookOpenText, IdCard, Key
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';

import {
  ChurchContext, Button, FormInput, FormSelect, GenericTable, GenericModal,
  playMenuSound, formatDateLocal
} from '../App';

import { DEFAULT_PORTAL_PERMISSIONS, PORTAL_MODULES } from './ModuleConfiguracoesSistemas';

const ModuleAcessosPortal = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    
    const [activeTab, setActiveTab] = useState<'liberacao' | 'monitoramento'>('liberacao');
    
    const [selectedMember, setSelectedMember] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Personalizações de Acesso
    const [selectedMemberForPerms, setSelectedMemberForPerms] = useState(null);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [memberPerms, setMemberPerms] = useState<string[]>([]);

    // Simulações
    const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
    const [simulateMemberId, setSimulateMemberId] = useState('');
    const [simulateDevice, setSimulateDevice] = useState('Celular (iPhone)');

    // Filtros de Monitoramento
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const handleOpenChangePass = (member) => {
        setSelectedMember(member);
        setNewPassword('');
        setIsModalOpen(true);
    };

    const handleSavePassword = async () => {
        if (!newPassword.trim()) return addToast("A senha não pode estar vazia.", "warning");
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', selectedMember.id), { senha_portal: newPassword }, { merge: true });
            addToast(`Senha de ${selectedMember.nome} alterada com sucesso!`, "success");
            setIsModalOpen(false);
        } catch (e) {
            addToast("Erro ao alterar senha.", "error");
        }
    };

    const handleToggleAccess = async (member) => {
        const currentStatus = member.acesso_portal_liberado || (member.senha_portal && member.acesso_portal_liberado !== false) ? true : false;
        const newStatus = !currentStatus;
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', member.id), { acesso_portal_liberado: newStatus }, { merge: true });
            addToast(newStatus ? "Acesso liberado com sucesso!" : "Acesso bloqueado.", "success");
        } catch (e) {
            addToast("Erro ao atualizar status de acesso.", "error");
        }
    };

    const handleOpenPerms = (member) => {
        setSelectedMemberForPerms(member);
        const userFuncaoAdm = (member.funcao_administrativa || 'NENHUMA').toUpperCase();
        const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
        const roleModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
        
        const currentPerms = member.portal_permissoes_personalizadas || roleModules;
        setMemberPerms(currentPerms);
        setIsPermModalOpen(true);
    };

    const handleToggleMemberPerm = (id: string) => {
        setMemberPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleSavePerms = async () => {
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', selectedMemberForPerms.id), { 
                portal_permissoes_personalizadas: memberPerms 
            }, { merge: true });
            addToast(`Acessos de ${selectedMemberForPerms.nome} atualizados com sucesso!`, "success");
            setIsPermModalOpen(false);
        } catch (e) {
            addToast("Erro ao salvar acessos personalizados.", "error");
        }
    };

    const handleResetPerms = async () => {
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', selectedMemberForPerms.id), { 
                portal_permissoes_personalizadas: null 
            }, { merge: true });
            addToast(`Acessos de ${selectedMemberForPerms.nome} redefinidos para o padrão!`, "success");
            setIsPermModalOpen(false);
        } catch (e) {
            addToast("Erro ao redefinir acessos para o padrão.", "error");
        }
    };

    const handleSimulateLogin = async () => {
        if (!simulateMemberId) return addToast("Selecione um membro para simular.", "warning");
        const member = db.membros.find((m: any) => m.id === simulateMemberId);
        if (!member) return;

        const loginSessionId = 'session_sim_' + Date.now();
        const nowStr = new Date().toISOString();

        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_acessos', loginSessionId), {
                membro_id: member.id,
                nome_membro: member.nome,
                login_at: nowStr,
                logout_at: null,
                duracao_segundos: 0,
                status: 'ativo',
                device: simulateDevice
            });

            addToast(`Simulação de login realizada para ${member.nome}!`, "success");
            setIsSimulateModalOpen(false);
        } catch (e) {
            addToast("Erro na simulação.", "error");
        }
    };

    const handleForceLogout = async (session: any, isInactive = false) => {
        const now = new Date();
        const loginTime = new Date(session.login_at);
        const durSeconds = session.duracao_segundos > 0 
            ? session.duracao_segundos 
            : Math.max(12, Math.floor((now.getTime() - loginTime.getTime()) / 1000));

        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_acessos', session.id), {
                logout_at: now.toISOString(),
                duracao_segundos: durSeconds,
                status: isInactive ? 'inativo' : 'finalizado'
            }, { merge: true });

            addToast(isInactive ? `Sessão de ${session.nome_membro} marcada como Inativa por tempo de uso.` : `Sessão de ${session.nome_membro} encerrada via painel administrativo.`, "success");
        } catch (e) {
            addToast("Erro ao encerrar sessão.", "error");
        }
    };

    const handleClearLogs = async () => {
        if (!db.portal_acessos || db.portal_acessos.length === 0) return addToast("Não há logs para limpar.", "info");
        if (!confirm("Tem certeza que deseja apagar permanentemente todo o histórico de monitoramento?")) return;
        
        try {
            for (let s of db.portal_acessos) {
                await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_acessos', s.id));
            }
            addToast("Histórico de monitoramento limpo com sucesso!", "success");
        } catch (e) {
            addToast("Erro ao limpar histórico.", "error");
        }
    };

    const getIconForPortal = (iconId: string) => {
        switch (iconId) {
            case 'MessageSquare': return <MessageSquare size={16} />;
            case 'Newspaper': return <Newspaper size={16} />;
            case 'BookOpen': return <BookOpen size={16} />;
            case 'Mail': return <Mail size={16} />;
            case 'Calendar': return <Calendar size={16} />;
            case 'CheckSquare': return <CheckSquare size={16} />;
            case 'DollarSign': return <DollarSign size={16} />;
            case 'BookOpenText': return <BookOpenText size={16} />;
            case 'GraduationCap': return <GraduationCap size={16} />;
            case 'UserCheck': return <UserCheck size={16} />;
            case 'Baby': return <Baby size={16} />;
            case 'IdCard': return <IdCard size={16} />;
            case 'Shield': return <Shield size={16} />;
            case 'ShieldCheck': return <ShieldCheck size={16} />;
            default: return <BookOpen size={16} />;
        }
    };

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return 'Ativo';
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Estatísticas de Monitoramento
    const totalAcessos = db.portal_acessos?.length || 0;
    const conexoesAtivas = (db.portal_acessos || []).filter((s: any) => s.status === 'ativo');
    const totalAtivos = conexoesAtivas.length;

    const tempoMedioStr = useMemo(() => {
        const finished = (db.portal_acessos || []).filter((s: any) => s.status !== 'ativo' && s.duracao_segundos > 0);
        if (finished.length === 0) return '0s';
        const sum = finished.reduce((acc: number, cur: any) => acc + cur.duracao_segundos, 0);
        const avg = Math.round(sum / finished.length);
        if (avg < 60) return `${avg}s`;
        return `${Math.floor(avg / 60)}m ${avg % 60}s`;
    }, [db.portal_acessos]);

    // Filtragem do Histórico
    const filteredAcessos = useMemo(() => {
        let list = [...(db.portal_acessos || [])];
        
        // Ordenar por data de login decrescente (mais recente primeiro)
        list.sort((a, b) => {
            const da = a.login_at ? new Date(a.login_at).getTime() : 0;
            const dbTime = b.login_at ? new Date(b.login_at).getTime() : 0;
            return dbTime - da;
        });

        if (statusFilter !== 'todos') {
            list = list.filter((s: any) => s.status === statusFilter);
        }

        if (searchQuery.trim()) {
            const queryClean = searchQuery.toLowerCase().trim();
            list = list.filter((s: any) => s.nome_membro?.toLowerCase().includes(queryClean));
        }

        return list;
    }, [db.portal_acessos, statusFilter, searchQuery]);

    // Obter membros elegíveis para simulação de login
    const membrosElegiveis = useMemo(() => {
        return (db.membros || []).filter((m: any) => m.acesso_portal_liberado || (m.senha_portal && m.acesso_portal_liberado !== false));
    }, [db.membros]);

    // Obter módulos liberados na Configuração Geral para a função administrativa do membro selecionado
    const userFuncaoAdm = (selectedMemberForPerms?.funcao_administrativa || 'NENHUMA').toUpperCase();
    const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
    const roleModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
    const availableModules = PORTAL_MODULES.filter(m => roleModules.includes(m.id));

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            {/* Header com Design Premium e Tabs de Navegação */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3.5 bg-slate-800 text-white rounded-2xl shadow-md shadow-slate-900/10"><Key size={26}/></div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Portal do Membro</h2>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">Controle de acessos, segurança, credenciais e monitoramento de sessões ativas.</p>
                    </div>
                </div>
                
                {/* Botões de Ação Rápida */}
                {activeTab === 'monitoramento' && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { playMenuSound?.(); setIsSimulateModalOpen(true); }}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Smartphone size={14} className="animate-bounce" /> Simular Conexão Celular
                        </button>
                        <button 
                            onClick={handleClearLogs}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Trash size={14} /> Limpar Logs
                        </button>
                    </div>
                )}
            </div>

            {/* Abas Estilizadas */}
            <div className="flex border-b border-slate-200 gap-1.5 shrink-0">
                <button
                    onClick={() => { playMenuSound?.(); setActiveTab('liberacao'); }}
                    className={`pb-3.5 pt-1 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2.5 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'liberacao'
                            ? 'border-indigo-600 text-indigo-600 font-extrabold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <UserCheck size={14} />
                    Liberação de Acesso
                </button>
                <button
                    onClick={() => { playMenuSound?.(); setActiveTab('monitoramento'); }}
                    className={`pb-3.5 pt-1 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2.5 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'monitoramento'
                            ? 'border-indigo-600 text-indigo-600 font-extrabold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Activity size={14} className={totalAtivos > 0 ? "text-emerald-500 animate-pulse" : ""} />
                    Monitoramento & Telemetria
                    {totalAtivos > 0 && (
                        <span className="ml-1 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{totalAtivos}</span>
                    )}
                </button>
            </div>

            {/* Renderização Condicional de Conteúdo */}
            <div className="flex-1 min-h-0">
                {activeTab === 'liberacao' ? (
                    <div className="h-full flex flex-col">
                        <GenericTable
                            title="Membros e Acessos"
                            type="membro"
                            data={db.membros}
                            columns={[
                                {header: 'Nome do Membro', key: 'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                {header: 'CPF', key: 'cpf'},
                                {header: 'Status do Acesso', key: 'acesso_portal_liberado', render: m => {
                                    const isLiberado = m.acesso_portal_liberado || (m.senha_portal && m.acesso_portal_liberado !== false);
                                    return isLiberado 
                                        ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Liberado</span> 
                                        : <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Bloqueado / Pendente</span>
                                }}
                            ]}
                            customActions={(item) => {
                                const isLiberado = item.acesso_portal_liberado || (item.senha_portal && item.acesso_portal_liberado !== false);
                                return (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleAccess(item)} className={`p-2 rounded-xl transition-all shadow-sm border cursor-pointer ${isLiberado ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200'}`} title={isLiberado ? "Bloquear Acesso" : "Liberar Acesso"}>
                                            {isLiberado ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                        </button>
                                        {isLiberado && (
                                            <>
                                                <button onClick={() => handleOpenPerms(item)} className="p-2 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl transition-all shadow-sm border border-sky-200 cursor-pointer" title="Personalizar Acessos do Portal"><Sliders size={16}/></button>
                                                <button onClick={() => handleOpenChangePass(item)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-200 cursor-pointer" title="Alterar Senha do Portal"><Key size={16}/></button>
                                            </>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-6 pb-12">
                        {/* Grade de Indicadores de Sessão */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-[1.5rem] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Acessos Registrados</p>
                                    <h3 className="text-2xl font-black text-slate-800">{totalAcessos}</h3>
                                </div>
                                <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center"><Layers size={20}/></div>
                            </div>

                            <div className="bg-white rounded-[1.5rem] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Ativos no Momento</p>
                                    <h3 className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
                                        {totalAtivos}
                                        {totalAtivos > 0 && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />}
                                    </h3>
                                </div>
                                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Wifi size={20} className={totalAtivos > 0 ? "animate-pulse" : ""} /></div>
                            </div>

                            <div className="bg-white rounded-[1.5rem] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tempo Médio de Uso</p>
                                    <h3 className="text-2xl font-black text-indigo-600">{tempoMedioStr}</h3>
                                </div>
                                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Clock size={20}/></div>
                            </div>

                            <div className="bg-white rounded-[1.5rem] p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Canal de Notificação</p>
                                    <h3 className="text-sm font-extrabold text-slate-700">Push & In-App Ativo</h3>
                                </div>
                                <div className="w-11 h-11 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center"><Bell size={20} className={totalAtivos > 0 ? "animate-swing" : ""} /></div>
                            </div>
                        </div>

                        {/* Sessões Ativas Agora */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        <Wifi size={18} className="text-emerald-500" />
                                        Dispositivos Conectados em Tempo Real
                                    </h4>
                                    <p className="text-[11px] text-slate-450">Exibindo os membros que estão com a sessão aberta no momento.</p>
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">{totalAtivos} online</span>
                            </div>

                            {totalAtivos === 0 ? (
                                <div className="text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-150">
                                    <Smartphone className="mx-auto text-slate-300 mb-1" size={32} />
                                    <p className="text-xs font-bold text-slate-500">Nenhum membro conectado neste momento.</p>
                                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Use o simulador acima para simular uma conexão e testar o envio das notificações em tempo real.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                                <th className="py-2.5">Membro</th>
                                                <th className="py-2.5">Conectado em</th>
                                                <th className="py-2.5">Dispositivo</th>
                                                <th className="py-2.5">Status</th>
                                                <th className="py-2.5 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {conexoesAtivas.map((s: any) => (
                                                <tr key={s.id} className="text-xs hover:bg-slate-50/50">
                                                    <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center font-black text-[10px] uppercase">
                                                            {s.nome_membro?.substring(0,2)}
                                                        </div>
                                                        {s.nome_membro}
                                                    </td>
                                                    <td className="py-3.5 text-slate-500 font-medium">{new Date(s.login_at).toLocaleString('pt-BR')}</td>
                                                    <td className="py-3.5 text-slate-500 font-medium flex items-center gap-1.5">
                                                        <Smartphone size={13} className="text-slate-400" />
                                                        {s.device || 'Celular (Dispositivo Móvel)'}
                                                    </td>
                                                    <td className="py-3.5">
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                                            Online
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 text-right space-x-1.5">
                                                        <button 
                                                            onClick={() => handleForceLogout(s, true)}
                                                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200 cursor-pointer transition-all"
                                                            title="Simular perda de rede/inatividade"
                                                        >
                                                            Inatividade
                                                        </button>
                                                        <button 
                                                            onClick={() => handleForceLogout(s, false)}
                                                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 rounded-lg text-[10px] font-bold border border-rose-200 cursor-pointer transition-all"
                                                            title="Forçar o encerramento imediato do acesso"
                                                        >
                                                            Desconectar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Histórico Geral de Logs */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 shadow-xs space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-base font-black text-slate-800">Histórico de Acessos</h4>
                                    <p className="text-[11px] text-slate-450">Log auditável de todas as conexões estabelecidas com o Portal.</p>
                                </div>
                                
                                {/* Filtros de Tabela */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Buscar membro..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all w-48"
                                        />
                                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                                    </div>
                                    <select 
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50 cursor-pointer font-bold"
                                    >
                                        <option value="todos">Todos Status</option>
                                        <option value="ativo">Online</option>
                                        <option value="finalizado">Concluído</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                            <th className="py-2.5">Membro</th>
                                            <th className="py-2.5">Data & Hora Login</th>
                                            <th className="py-2.5">Hora Logout</th>
                                            <th className="py-2.5">Tempo Utilização</th>
                                            <th className="py-2.5">Status</th>
                                            <th className="py-2.5">Dispositivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredAcessos.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-450 font-medium">Nenhum registro encontrado correspondente aos filtros.</td>
                                            </tr>
                                        ) : (
                                            filteredAcessos.map((s: any) => (
                                                <tr key={s.id} className="hover:bg-slate-50/40">
                                                    <td className="py-3 font-bold text-slate-800">{s.nome_membro}</td>
                                                    <td className="py-3 text-slate-500 font-medium">{s.login_at ? new Date(s.login_at).toLocaleString('pt-BR') : '-'}</td>
                                                    <td className="py-3 text-slate-500 font-medium">
                                                        {s.logout_at ? new Date(s.logout_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : s.status === 'ativo' ? '-' : 'Expirada'}
                                                    </td>
                                                    <td className="py-3 font-bold text-indigo-650">
                                                        {s.status === 'ativo' ? (
                                                            <span className="text-emerald-500 font-black animate-pulse flex items-center gap-1">Ativo Agora</span>
                                                        ) : (
                                                            formatDuration(s.duracao_segundos)
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        {s.status === 'ativo' ? (
                                                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Online</span>
                                                        ) : s.status === 'inativo' ? (
                                                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Inativo</span>
                                                        ) : (
                                                            <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Concluído</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-slate-500 font-medium flex items-center gap-1 mt-1">
                                                        <Smartphone size={12} className="text-slate-400" />
                                                        {s.device || 'Celular'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Alterar Senha */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 animate-entrance backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 border border-slate-200">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Alterar Senha</h3>
                        <p className="text-sm text-slate-500 mb-6">Defina uma nova senha de acesso ao portal para o membro <strong className="text-indigo-600">{selectedMember?.nome}</strong>.</p>
                        
                        <FormInput label="Nova Senha do Portal" type="password" value={newPassword} onChange={setNewPassword} required />
                        
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 border border-slate-200 cursor-pointer">Cancelar</Button>
                            <Button variant="primary" onClick={handleSavePassword} className="flex-1 shadow-indigo-500/30 cursor-pointer">Salvar Senha</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal: Personalizar Permissões */}
            {isPermModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 animate-entrance backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden p-8 border border-slate-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="text-indigo-600" size={24} /> 
                                    Personalizar Acessos do Portal
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Membro: <strong className="text-slate-800">{selectedMemberForPerms?.nome}</strong> | 
                                    Função: <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-bold ml-1 uppercase">{selectedMemberForPerms?.funcao_administrativa || 'NENHUMA'}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsPermModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-2xl p-4 mb-6">
                            <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                                Habilite ou desabilite os módulos visíveis para este membro no portal de autoatendimento. 
                                <br />
                                <strong className="text-indigo-800">Importante:</strong> As opções abaixo respeitam estritamente as regras globais definidas para a função <strong className="text-indigo-700">{(selectedMemberForPerms?.funcao_administrativa || 'NENHUMA').toUpperCase()}</strong> em "Portal & Permissões" nas Configurações Gerais.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[250px]">
                            {availableModules.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <AlertCircle className="mx-auto text-amber-500 mb-2 animate-bounce" size={32} />
                                    <p className="text-sm font-bold text-slate-700">Nenhum módulo liberado para esta função</p>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                        Para habilitar a personalização, ative os módulos para a função de <span className="font-extrabold text-indigo-600 uppercase">{(selectedMemberForPerms?.funcao_administrativa || 'NENHUMA').toUpperCase()}</span> em "Portal & Permissões" nas Configurações Gerais do sistema.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {availableModules.map(mod => {
                                        const isChecked = memberPerms.includes(mod.id);
                                        return (
                                            <button 
                                                key={mod.id}
                                                onClick={() => handleToggleMemberPerm(mod.id)}
                                                className={`p-4 border rounded-2xl text-left transition-all flex items-start gap-3.5 relative overflow-hidden group cursor-pointer ${
                                                    isChecked 
                                                    ? 'border-indigo-500 bg-indigo-50/20 text-slate-900 shadow-sm' 
                                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                                    isChecked ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {getIconForPortal(mod.iconId)}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h4 className={`text-xs font-bold leading-none mb-1 transition-colors ${isChecked ? 'text-indigo-950 font-black' : 'text-slate-800'}`}>{mod.label}</h4>
                                                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{mod.desc}</p>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                                                        {isChecked && <Check size={12} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 mt-6 pt-4 border-t border-slate-100 shrink-0">
                            <Button 
                                variant="ghost" 
                                onClick={handleResetPerms} 
                                className="border border-rose-200 text-rose-600 hover:bg-rose-50/60 flex items-center gap-2 text-xs cursor-pointer"
                                disabled={!selectedMemberForPerms?.portal_permissoes_personalizadas}
                            >
                                <RefreshCw size={14} /> Restaurar Padrão do Cargo
                            </Button>
                            <div className="flex-1" />
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button variant="ghost" onClick={() => setIsPermModalOpen(false)} className="flex-1 md:flex-initial border border-slate-200 text-xs cursor-pointer">Cancelar</Button>
                                <Button variant="primary" onClick={handleSavePerms} className="flex-1 md:flex-initial shadow-indigo-500/30 text-xs cursor-pointer" disabled={availableModules.length === 0}>Salvar Alterações</Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal: Simular Conexão de Membro */}
            {isSimulateModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 animate-entrance backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Simulador de Acesso</h3>
                                <p className="text-sm text-slate-500">Crie uma conexão ativa fictícia para fins de testes e homologação.</p>
                            </div>
                            <button onClick={() => setIsSimulateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg bg-slate-50 transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {membrosElegiveis.length === 0 ? (
                            <div className="text-center py-6 bg-amber-50 rounded-2xl border border-amber-200 mb-4">
                                <AlertCircle className="mx-auto text-amber-500 mb-1" size={24} />
                                <p className="text-xs font-bold text-amber-800">Nenhum membro possui acesso liberado</p>
                                <p className="text-[10px] text-amber-600 max-w-xs mx-auto mt-0.5">Primeiro, libere o acesso de pelo menos um membro na primeira aba.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <FormSelect 
                                    label="Selecionar Membro"
                                    value={simulateMemberId}
                                    onChange={setSimulateMemberId}
                                    options={membrosElegiveis.map(m => ({ label: m.nome, value: m.id }))}
                                    required
                                />

                                <FormSelect 
                                    label="Dispositivo do Membro"
                                    value={simulateDevice}
                                    onChange={setSimulateDevice}
                                    options={[
                                        { label: 'Celular (iPhone)', value: 'Celular (iPhone)' },
                                        { label: 'Celular (Samsung Galaxy)', value: 'Celular (Samsung Galaxy)' },
                                        { label: 'Celular (Xiaomi Poco)', value: 'Celular (Xiaomi Poco)' },
                                        { label: 'Tablet (iPad Mini)', value: 'Tablet (iPad Mini)' },
                                        { label: 'Navegador Web (Celular)', value: 'Celular (Safari Mobile)' }
                                    ]}
                                    required
                                />

                                <div className="flex gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsSimulateModalOpen(false)} className="flex-1 border border-slate-200 cursor-pointer">Cancelar</Button>
                                    <Button variant="primary" onClick={handleSimulateLogin} className="flex-1 shadow-indigo-500/30 cursor-pointer">Conectar Membro</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ModuleAcessosPortal;
