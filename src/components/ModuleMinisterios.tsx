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
const ModuleMinisterios = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const ministerios = db.departamentos || [];
    const menuItems = [{id: 1, label: 'Dashboard', icon: LayoutDashboard}, {id: 2, label: 'Cadastros', icon: Building2}, {id: 3, label: 'Componentes', icon: Users}, {id: 4, label: 'Agenda & Tarefas', icon: Calendar}];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);
    const handleDeleteMember = async (ministerioId, membroIndex) => { const ministerio = ministerios.find(m => m.id === ministerioId); if (!ministerio) return; const novosMembros = [...(ministerio.membros || [])]; novosMembros.splice(membroIndex, 1); await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'departamentos', ministerioId), { membros: novosMembros }, { merge: true }); addToast("Membro removido.", "success"); };

    // Dashboard Calculations
    const totalMinisterios = ministerios.length;
    const totalComponentes = ministerios.reduce((acc, m) => acc + (m.membros?.length || 0), 0);
    const totalAgenda = ministerios.reduce((acc, m) => acc + (m.agenda?.length || 0), 0);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100"><Briefcase size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ministérios e Departamentos</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de líderes, componentes e agendas</p>
                    </div>
                </div>
            </div>
            <div className="glass-modern p-4 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-3 border border-white/50">{menuItems.map(item => <TabButton key={item.id} item={item} />)}</div>
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-white border-indigo-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Briefcase size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalMinisterios}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Ministérios</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border-blue-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalComponentes}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Componentes Totais</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-white border-amber-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><Calendar size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalAgenda}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Programações</p></div>
                            </div>
                        </div>
                        <div className="glass-modern p-8 rounded-[2.5rem]">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><Star size={20} className="text-amber-500"/> Visão Detalhada por Ministério</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ministerios.map(min => (
                                    <div key={min.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
                                        <h4 className="font-black text-lg text-indigo-700 uppercase mb-1 relative z-10">{min.nome}</h4>
                                        <p className="text-xs text-slate-500 mb-5 relative z-10">Líder: <span className="font-bold text-slate-700">{db.membros.find(m=>m.id===min.lider1_id)?.nome || 'Não definido'}</span></p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 relative z-10">
                                            <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-blue-700"><Users size={14}/> {(min.membros?.length || 0)}</div>
                                            <div className="bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-amber-700"><Calendar size={14}/> {(min.agenda?.length || 0)}</div>
                                        </div>
                                    </div>
                                ))}
                                {ministerios.length === 0 && <p className="text-slate-400 italic text-sm">Nenhum ministério cadastrado no sistema.</p>}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 2 && (<GenericTable title="Gestão de Ministérios" type="ministerio" data={ministerios} columns={[{header:'Ministério', key:'nome'}, {header:'Líder Principal', key:'lider1_id', render: m => db.membros.find(mem=>mem.id===m.lider1_id)?.nome || '-'}]} />)}
                {tab === 3 && (<div className="h-full flex flex-col"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-700">Membros</h3><Button onClick={() => openModal('ministerio_membro')} variant="primary"><Plus size={18}/> Adicionar</Button></div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">{ministerios.map(min => (<div key={min.id} className="glass-panel p-6 rounded-3xl"><h4 className="font-bold text-lg text-indigo-700 mb-4">{min.nome}</h4><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="p-3">Nome</th><th className="p-3">Função</th><th className="p-3 text-right">Ação</th></tr></thead><tbody>{(min.membros || []).map((mm, idx) => { const membroRef = db.membros.find(m => m.id === mm.membro_id); return (<tr key={idx} className="border-b border-slate-100"><td className="p-3 font-bold">{membroRef?.nome || 'Membro'}</td><td className="p-3 text-indigo-600 font-medium">{mm.funcao}</td><td className="p-3 text-right"><button onClick={() => handleDeleteMember(min.id, idx)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button></td></tr>); })}</tbody></table></div></div>))}</div></div>)}
                {tab === 4 && (<div className="h-full flex flex-col"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-700">Agenda</h3><Button onClick={() => openModal('ministerio_evento')} variant="primary"><Plus size={18}/> Novo</Button></div><div className="flex-1 overflow-y-auto custom-scrollbar grid md:grid-cols-2 lg:grid-cols-3 gap-4">{ministerios.flatMap(min => (min.agenda || []).map(evt => ({...evt, min_nome: min.nome}))).map((evt, idx) => (<div key={idx} className="glass-card p-5 rounded-3xl border-l-4 border-l-indigo-500"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-600 px-2 py-1 rounded">{evt.min_nome}</span><span className="text-xs font-bold text-slate-400">{formatDateLocal(evt.data)}</span></div><h4 className="font-bold text-slate-800 leading-tight mb-1">{evt.titulo}</h4><p className="text-sm text-slate-500 mb-4">{evt.hora}h</p></div>))}</div></div>)}
            </div>
        </div>
    );
};


export default ModuleMinisterios;
