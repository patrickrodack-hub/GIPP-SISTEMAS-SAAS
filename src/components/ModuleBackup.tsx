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
const ModuleBackup = () => {
    const { startExport, handleImportRequest, db, dbFirestore, appId, addToast, setDoc, updateDoc, doc, collection, logAction, setConfirmDialog, user } = useContext(ChurchContext);
    
    const [cloudBackups, setCloudBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [restoreProgress, setRestoreProgress] = useState(0);

    const autoHabilitado = db.igreja?.backup_auto_habilitado !== false;
    const autoFrequencia = db.igreja?.backup_auto_frequencia || 'diario';
    const ultimoAuto = db.igreja?.backup_auto_ultimo || '';

    const fetchCloudBackups = async () => {
        setLoading(true);
        try {
            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'cloud_backups');
            const snapList = await getDocs(colRef);
            const list: any[] = [];
            snapList.forEach((d: any) => {
                list.push({ id: d.id, ...d.data() });
            });
            list.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());
            setCloudBackups(list);
        } catch (err) {
            console.error("Erro ao obter backups da nuvem:", err);
            addToast("Falha ao listar pontos de restauração.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCloudBackups();
    }, []);

    const handleCreateCloudBackup = async () => {
        setCreating(true);
        try {
            const cleanDb = JSON.parse(JSON.stringify(db));
            const cleanObject = (obj: any) => {
                if (!obj || typeof obj !== 'object') return;
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'string' && (obj[key].startsWith('data:image') || obj[key].length > 10000)) {
                        obj[key] = "[IMAGEM_PESADA_REMOVIDA_DO_CLOUD_BACKUP]";
                    } else if (typeof obj[key] === 'object') {
                        cleanObject(obj[key]);
                    }
                });
            };
            cleanObject(cleanDb);

            const dadosJsonStr = JSON.stringify(cleanDb);
            const backupSizeKb = Math.round(dadosJsonStr.length / 1024);

            const backupDoc = {
                id: 'backup_manual_' + Date.now(),
                data_criacao: new Date().toISOString(),
                responsavel: user?.nome || 'Administrador',
                tipo: 'manual',
                tamanho_kb: backupSizeKb,
                observacao: 'Ponto de restauração manual criado pelo painel de controle.',
                dados_json: dadosJsonStr
            };

            const ref = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'cloud_backups', backupDoc.id);
            await setDoc(ref, backupDoc);
            
            addToast("Ponto de restauração em Nuvem criado!", "success");
            logAction('SISTEMA', `Criou backup em nuvem (${backupSizeKb} KB)`, 'cloud_backups', backupDoc.id);
            
            fetchCloudBackups();
        } catch (err) {
            console.error("Erro ao gravar backup na nuvem:", err);
            addToast("Falha ao salvar backup na nuvem.", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleRestoreCloudBackup = async (backup: any) => {
        setConfirmDialog({
            isOpen: true,
            title: "⚠ RESTAURAÇÃO DE SISTEMA CRÍTICA",
            message: `ATENÇÃO: Você está prestes a restaurar a base de dados para o ponto de ${new Date(backup.data_criacao).toLocaleString('pt-BR')} (criado por ${backup.responsavel}). Esta ação substituirá seus membros, registros financeiros, escalas e configurações atuais pelos dados contidos neste backup. Deseja prosseguir?`,
            onConfirm: async () => {
                setRestoring(true);
                setRestoreProgress(0);
                try {
                    const targetData = JSON.parse(backup.dados_json);
                    const docsToWrite: any[] = [];
                    
                    if (targetData.igreja) {
                        docsToWrite.push({ collection: 'settings', id: 'config', data: targetData.igreja });
                    }
                    
                    const simpleCollections = ['membros', 'celulas', 'celulas_relatorios', 'congregacoes', 'fornecedores', 'departamentos', 'usuarios', 'agenda', 'tarefas', 'financeiro', 'carnes', 'centro_custo', 'projetos_midia', 'solicitacoes', 'patrimonio', 'visitantes', 'emails', 'mural', 'orcamentos'];
                    simpleCollections.forEach(col => {
                        if (targetData[col]) {
                            targetData[col].forEach((item: any) => {
                                docsToWrite.push({ 
                                    collection: col, 
                                    id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), 
                                    data: item 
                                });
                            });
                        }
                    });
                    
                    if (targetData.ebd) {
                        if (targetData.ebd.turmas) targetData.ebd.turmas.forEach((item: any) => docsToWrite.push({ collection: 'ebd_turmas', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                        if (targetData.ebd.alunos) targetData.ebd.alunos.forEach((item: any) => docsToWrite.push({ collection: 'ebd_alunos', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                        if (targetData.ebd.licoes) targetData.ebd.licoes.forEach((item: any) => docsToWrite.push({ collection: 'ebd_licoes', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                    }
                    if (targetData.missoes) {
                        if (targetData.missoes.missionarios) targetData.missoes.missionarios.forEach((item: any) => docsToWrite.push({ collection: 'missoes_missionarios', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                        if (targetData.missoes.agencias) targetData.missoes.agencias.forEach((item: any) => docsToWrite.push({ collection: 'missoes_agencias', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                        if (targetData.missoes.colaboradores) targetData.missoes.colaboradores.forEach((item: any) => docsToWrite.push({ collection: 'missoes_colaboradores', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                        if (targetData.missoes.agenda) targetData.missoes.agenda.forEach((item: any) => docsToWrite.push({ collection: 'missoes_agenda', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
                    }

                    const batchSize = 100;
                    for (let i = 0; i < docsToWrite.length; i += batchSize) {
                        const batch = writeBatch(dbFirestore);
                        const chunk = docsToWrite.slice(i, i + batchSize);
                        
                        for (const docObj of chunk) {
                            const { collection: colName, id, data: itemData } = docObj;
                            const dataToSave = { ...itemData };
                            delete dataToSave.id;
                            const ref = doc(dbFirestore, 'artifacts', appId, 'public', 'data', colName, String(id));
                            batch.set(ref, dataToSave, { merge: true });
                        }
                        
                        await batch.commit();
                        setRestoreProgress(Math.round(((i + chunk.length) / docsToWrite.length) * 100));
                    }
                    
                    addToast("Ponto de restauração em Nuvem aplicado com sucesso!", "success");
                    logAction('SISTEMA', `Restaurou banco de dados da nuvem para o ponto: ${backup.data_criacao}`, 'cloud_backups', backup.id);
                } catch (err) {
                    console.error("Erro ao aplicar backup da nuvem:", err);
                    addToast("Falha ao restaurar dados da nuvem.", "error");
                } finally {
                    setRestoring(false);
                }
            }
        });
    };

    const handleDeleteCloudBackup = async (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Remover Ponto de Restauração",
            message: "Tem certeza de que deseja excluir permanentemente este ponto de restauração da nuvem? Esta ação é irreversível.",
            onConfirm: async () => {
                try {
                    const ref = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'cloud_backups', id);
                    await deleteDoc(ref);
                    addToast("Ponto de restauração excluído da nuvem.", "success");
                    fetchCloudBackups();
                } catch (err) {
                    console.error("Erro ao excluir backup da nuvem:", err);
                    addToast("Falha ao excluir ponto de backup.", "error");
                }
            }
        });
    };

    const handleToggleAutoBackup = async (checked: boolean) => {
        try {
            const configRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config');
            await updateDoc(configRef, {
                backup_auto_habilitado: checked
            });
            addToast(checked ? "Backup automático habilitado!" : "Backup automático desativado.", "success");
        } catch (err) {
            console.error("Erro ao atualizar config de backup:", err);
            addToast("Falha ao salvar alterações.", "error");
        }
    };

    const handleUpdateAutoFreq = async (freq: string) => {
        try {
            const configRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config');
            await updateDoc(configRef, {
                backup_auto_frequencia: freq
            });
            addToast(`Frequência ajustada para: ${freq.toUpperCase()}`, "success");
        } catch (err) {
            console.error("Erro ao atualizar frequencia de backup:", err);
            addToast("Falha ao salvar frequência.", "error");
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
                        <Database size={28}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 text-gradient">Central de Backups GIPP</h2>
                        <p className="text-sm text-slate-500 font-medium">Garanta a integridade, segurança absoluta e restore simplificado da sua igreja.</p>
                    </div>
                </div>
                <Button variant="ghost" onClick={fetchCloudBackups} className="bg-white border border-slate-200">
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Backup Local */}
                <div className="bg-white/70 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
                            <DownloadCloud size={24}/>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-1">Backup Local (Ficheiro JSON)</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
                            Gere e faça download imediato de uma cópia em texto estruturado criptograficamente seguro diretamente para o seu computador ou smartphone. Ideal para segurança offline extra rápida.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                        <Button className="flex-1 justify-center items-center gap-2" variant="primary" onClick={startExport}>
                            <DownloadCloud size={16}/> Exportar JSON
                        </Button>
                        <Button className="flex-1 justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200" variant="ghost" onClick={handleImportRequest}>
                            <UploadCloud size={16}/> Importar Local
                        </Button>
                    </div>
                </div>

                {/* 2. Backup Inteligente (Automático) */}
                <div className="bg-white/70 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col justify-between col-span-1 lg:col-span-2">
                    <div>
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl w-fit mb-4">
                                <Clock size={24}/>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 font-medium">Status do Agendador:</span>
                                <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${autoHabilitado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                    {autoHabilitado ? 'Ativado e Ativo' : 'Pausado'}
                                </span>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-800 mb-1">Backup Automático Silencioso</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6 flex items-start">
                            O GIPP executa backups silenciados de forma autônoma em background na nuvem, sem interferir na usabilidade do operador. Defina a periodicidade abaixo:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/55">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Habilitar Rotina</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="toggle_auto" 
                                        checked={autoHabilitado} 
                                        onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                                        className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer relative checked:bg-indigo-600 transition-colors duration-200 before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform before:duration-205 shadow-inner" 
                                    />
                                    <span className="text-xs font-bold text-slate-705">{autoHabilitado ? 'Rotina Autônoma Ativada' : 'Rotina Autônoma Desativada'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Frequência de Backup</label>
                                <select 
                                    value={autoFrequencia} 
                                    onChange={(e) => handleUpdateAutoFreq(e.target.value)}
                                    disabled={!autoHabilitado}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none w-full shadow-xs focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="diario">Diário (A cada 24 Horas)</option>
                                    <option value="semanal">Semanal (A cada 7 Dias)</option>
                                    <option value="mensal">Mensal (A cada 30 Dias)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Último backup silencioso:</span>
                        <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {ultimoAuto ? new Date(ultimoAuto).toLocaleString('pt-BR') : 'Sem registros na nuvem.'}
                        </span>
                    </div>
                </div>

            </div>

            <div className="bg-white/70 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Cloud className="text-indigo-600" size={20}/> Pontos de Restauração em Nuvem</h3>
                        <p className="text-xs text-slate-500 font-medium">Pontos guardados com segurança mútua no Cloud Firestore e passíveis de reconstituição com 1 clique.</p>
                    </div>
                    <Button 
                        onClick={handleCreateCloudBackup} 
                        disabled={creating}
                        variant="primary" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 py-2 px-5 text-xs font-black rounded-xl"
                    >
                        {creating ? <Loader2 size={14} className="animate-spin mr-2"/> : <Sparkles size={14} className="mr-2"/>}
                        Criar Ponto de Restauração
                    </Button>
                </div>

                <div className="overflow-x-auto min-h-[150px]">
                    <table className="w-full text-left text-xs border-collapse font-medium">
                        <thead>
                            <tr className="border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <th className="pb-3 text-left">Data</th>
                                <th className="pb-3 text-left">Tipo</th>
                                <th className="pb-3 text-left">Criado Por</th>
                                <th className="pb-3 text-right">Peso (KB)</th>
                                <th className="pb-3 text-center w-40">Ações de Recuperação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cloudBackups.map((bc: any) => (
                                <tr key={bc.id} className="hover:bg-slate-50/50">
                                    <td className="py-3 font-bold text-slate-800 font-mono text-[11px]">
                                        {new Date(bc.data_criacao).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono ${bc.tipo === 'agendado' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                            {bc.tipo === 'agendado' ? 'Silencioso' : 'Manual'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-700 font-bold uppercase text-[10px]">
                                        {bc.responsavel}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold text-slate-600">
                                        {bc.tamanho_kb} KB
                                    </td>
                                    <td className="py-3 text-center flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleRestoreCloudBackup(bc)}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-black px-2.5 py-1.5 rounded-lg border border-emerald-200/50 transition-all text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                        >
                                            <RefreshCw size={11}/> Restaurar
                                        </button>
                                        <button 
                                            onClick={() => bc.id && handleDeleteCloudBackup(bc.id)}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-1.5 rounded-lg border border-rose-200/50 transition-all cursor-pointer"
                                            title="Excluir ponto"
                                        >
                                            <Trash2 size={13}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {cloudBackups.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center italic text-slate-400 font-medium">Nenhum ponto de restauração em nuvem encontrado.</td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-slate-400"/> Sincronizando pontos...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {restoring && createPortal(
                <div className="fixed inset-0 bg-slate-900/90 z-[11000] flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-entrance">
                        <div className="relative mx-auto w-20 h-20 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center animate-pulse">
                            <Database className="text-emerald-500" size={40}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Gravando em Lotes</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Não feche nem atualize esta aba. Sobrescrevendo tabelas estruturais de forma segura...</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden shadow-inner">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${restoreProgress}%` }}></div>
                        </div>
                        <p className="text-xs font-mono font-black text-emerald-650 bg-emerald-50 py-1.5 px-4 rounded-xl inline-block">{restoreProgress}% Processado</p>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleBackup;
