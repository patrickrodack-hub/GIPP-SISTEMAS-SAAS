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
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, Monitor, User, UserPlus, Video,
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

import { DEFAULT_PORTAL_PERMISSIONS, PORTAL_MODULES } from './ModuleConfiguracoesSistemas';

// Exporting component
const ModuleAcessosPortal = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const [selectedMember, setSelectedMember] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Personalizações de Acesso
    const [selectedMemberForPerms, setSelectedMemberForPerms] = useState(null);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [memberPerms, setMemberPerms] = useState<string[]>([]);

    // Telemetria & Monitoramento de Acesso
    const [activeTab, setActiveTab] = useState<'membros' | 'monitoramento'>('membros');
    const [accessLogs, setAccessLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDevice, setFilterDevice] = useState<'all' | 'mobile' | 'desktop'>('all');

    useEffect(() => {
        if (activeTab !== 'monitoramento') return;

        setLoadingLogs(true);
        try {
            const q = query(
                collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedLogs: any[] = [];
                snapshot.forEach((document) => {
                    fetchedLogs.push({ id: document.id, ...document.data() });
                });

                // Sort desc by timestamp
                fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                // Detect new mobile logins within the last 5 seconds to notify the admin real-time
                const now = Date.now();
                fetchedLogs.forEach(log => {
                    const logTime = new Date(log.timestamp).getTime();
                    if (now - logTime < 5000 && !sessionStorage.getItem(`notified_admin_${log.id}`)) {
                        sessionStorage.setItem(`notified_admin_${log.id}`, 'true');
                        addToast(`🔔 Conexão Registrada: ${log.membroNome} acaba de conectar-se ao Portal de Membro (${log.dispositivo})!`, 'info');
                    }
                });

                setAccessLogs(fetchedLogs);
                setLoadingLogs(false);
            }, (err) => {
                console.warn("Firestore error in logs subscription", err);
                // Fallback to local storage
                const localLogs = JSON.parse(localStorage.getItem('portal_access_logs_fallback') || '[]');
                setAccessLogs(localLogs);
                setLoadingLogs(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.warn("Error establishing onSnapshot for portal logs", err);
            setLoadingLogs(false);
        }
    }, [activeTab]);

    const handleForceDisconnect = async (sessionId: string) => {
        if (!confirm("Deseja realmente desconectar esta sessão remotamente?")) return;
        try {
            const logRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs', sessionId);
            await setDoc(logRef, {
                status: 'Desconectado',
                ultimoSinal: Date.now()
            }, { merge: true });
            addToast("Sessão encerrada remotamente.", "success");
        } catch (err) {
            addToast("Erro ao encerrar sessão.", "error");
        }
    };

    const handleDeleteLog = async (sessionId: string) => {
        if (!confirm("Deseja excluir permanentemente este registro de acesso?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs', sessionId));
            setAccessLogs(prev => prev.filter(l => l.id !== sessionId));
            addToast("Registro excluído.", "info");
        } catch (err) {
            addToast("Erro ao remover registro.", "error");
        }
    };

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

    // Obter módulos liberados na Configuração Geral para a função administrativa do membro selecionado
    const userFuncaoAdm = (selectedMemberForPerms?.funcao_administrativa || 'NENHUMA').toUpperCase();
    const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
    const roleModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
    const availableModules = PORTAL_MODULES.filter(m => roleModules.includes(m.id));

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-sm"><Key size={28}/></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Liberação de Acesso</h2>
                    <p className="text-sm text-slate-500 font-medium">Gestão de senhas e acessos ao Portal do Membro.</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GenericTable
                    title="Membros e Acessos"
                    type="membro"
                    data={db.membros}
                    columns={[
                        {header: 'Nome do Membro', key: 'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                        {header: 'CPF', key: 'cpf'},
                        {header: 'Status do Acesso', key: 'acesso_portal_liberado', render: m => {
                            const isLiberado = m.acesso_portal_liberado || (m.senha_portal && m.acesso_portal_liberado !== false);
                            return isLiberado ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Liberado</span> : <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Bloqueado / Pendente</span>
                        }}
                    ]}
                    customActions={(item) => {
                        const isLiberado = item.acesso_portal_liberado || (item.senha_portal && item.acesso_portal_liberado !== false);
                        return (
                            <div className="flex gap-2">
                                <button onClick={() => handleToggleAccess(item)} className={`p-2.5 rounded-xl transition-all shadow-sm border ${isLiberado ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200'}`} title={isLiberado ? "Bloquear Acesso" : "Liberar Acesso"}>
                                    {isLiberado ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                </button>
                                {isLiberado && (
                                    <>
                                        <button onClick={() => handleOpenPerms(item)} className="p-2.5 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl transition-all shadow-sm border border-sky-200" title="Personalizar Acessos do Portal"><Sliders size={18}/></button>
                                        <button onClick={() => handleOpenChangePass(item)} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-200" title="Alterar Senha do Portal"><Key size={18}/></button>
                                    </>
                                )}
                            </div>
                        );
                    }}
                />
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 animate-entrance backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 border border-slate-200">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Alterar Senha</h3>
                        <p className="text-sm text-slate-500 mb-6">Defina uma nova senha de acesso ao portal para o membro <strong className="text-indigo-600">{selectedMember?.nome}</strong>.</p>
                        
                        <FormInput label="Nova Senha do Portal" type="password" value={newPassword} onChange={setNewPassword} required />
                        
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 border border-slate-200">Cancelar</Button>
                            <Button variant="primary" onClick={handleSavePassword} className="flex-1 shadow-indigo-500/30">Salvar Senha</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

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
                            <button onClick={() => setIsPermModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
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
                                                className={`p-4 border rounded-2xl text-left transition-all flex items-start gap-3.5 relative overflow-hidden group ${
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
                                                    <p className="text-[10px] text-slate-450 dark:text-slate-550 leading-tight line-clamp-2">{mod.desc}</p>
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
                                className="border border-rose-200 text-rose-600 hover:bg-rose-50/60 flex items-center gap-2 text-xs"
                                disabled={!selectedMemberForPerms?.portal_permissoes_personalizadas}
                            >
                                <RefreshCw size={14} /> Restaurar Padrão do Cargo
                            </Button>
                            <div className="flex-1" />
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button variant="ghost" onClick={() => setIsPermModalOpen(false)} className="flex-1 md:flex-initial border border-slate-200 text-xs">Cancelar</Button>
                                <Button variant="primary" onClick={handleSavePerms} className="flex-1 md:flex-initial shadow-indigo-500/30 text-xs" disabled={availableModules.length === 0}>Salvar Alterações</Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ModuleAcessosPortal;
