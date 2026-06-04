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
const ModuleVisitantes = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, deleteItem, logAction } = useContext(ChurchContext);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    const visitantes = (db.visitantes || []).filter(v => 
        congregacaoFilter === 'todas' || 
        v.congregacao_id === congregacaoFilter || 
        (!v.congregacao_id && congregacaoFilter === 'sede')
    );

    const handleDragStart = (e, id) => { e.dataTransfer.setData('visitanteId', id); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('visitanteId');
        if (!id) return;
        const vis = visitantes.find(v => v.id === id);
        if (vis && vis.status !== newStatus) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitantes', id), { status: newStatus }, { merge: true });
                logAction('EDIÇÃO', `Moveu visitante "${vis.nome}" para o funil: ${newStatus}`, 'visitantes', id);
                addToast("Status no funil atualizado!", "success");
            } catch (err) { addToast("Erro ao atualizar o funil.", "error"); }
        }
    };

    const columns = [
        { id: '1ª Visita', label: '1ª Visita', color: 'rose', icon: UserPlus },
        { id: 'Contato Feito', label: 'Contato Feito', color: 'amber', icon: MessageCircle },
        { id: 'Em Discipulado', label: 'Em Discipulado', color: 'blue', icon: BookOpen },
        { id: 'Integrado', label: 'Integrado', color: 'emerald', icon: CheckCircle }
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shadow-sm border border-rose-100"><HeartHandshake size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Visitantes & Consolidação</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Acompanhamento de novos visitantes (CRM)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Filtro: Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <Button onClick={() => openModal('visitante', {status: '1ª Visita', data_visita: getTodayDate()})} variant="primary" className="shadow-lg shadow-rose-500/30 bg-gradient-to-r from-rose-500 to-pink-600 px-6"><Plus size={18}/> Novo Visitante</Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-2 pt-2 items-start min-h-[500px]">
                {columns.map(col => (
                    <div key={col.id} className={`w-[340px] shrink-0 h-full max-h-[calc(100vh-220px)] flex flex-col bg-${col.color}-50/60 rounded-[2rem] border border-${col.color}-200/60 shadow-inner`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                        <div className={`p-5 border-b border-${col.color}-200/60 flex justify-between items-center bg-${col.color}-100/50 rounded-t-[2rem]`}>
                            <h4 className={`font-black text-${col.color}-800 flex items-center gap-2 tracking-tight text-sm uppercase`}><col.icon size={18} className={`text-${col.color}-600`}/> {col.label}</h4>
                            <span className={`bg-${col.color}-200 text-${col.color}-800 text-xs font-black px-3 py-1 rounded-full shadow-sm`}>{visitantes.filter(v => v.status === col.id).length}</span>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {visitantes.filter(v => v.status === col.id).map(vis => (
                                <div key={vis.id} draggable onDragStart={(e) => handleDragStart(e, vis.id)} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 hover:border-${col.color}-400 transition-all duration-300 group relative overflow-hidden`}>
                                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-${col.color}-400`}></div>
                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md shadow-sm border border-slate-200">{formatDateLocal(vis.data_visita)}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal('visitante', vis)} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"><Edit size={16}/></button>
                                            <button onClick={() => deleteItem('visitante', vis.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-base mb-2 pl-2 leading-snug">{vis.nome}</h5>
                                    {vis.obs && <p className="text-xs text-slate-500 mb-4 pl-2 line-clamp-3 italic leading-relaxed">"{vis.obs}"</p>}
                                    <div className="pl-2 mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Phone size={14}/> {vis.telefone}</span>
                                        {vis.telefone && (
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                const msg = encodeURIComponent(`A Paz do Senhor, ${vis.nome.split(' ')[0]}! Aqui é da ${db.igreja.nome}. Ficamos muito felizes com a sua visita. Como podemos orar por você hoje?`);
                                                window.open(`https://wa.me/${vis.telefone.replace(/\D/g,'')}?text=${msg}`, '_blank');
                                            }} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2.5 rounded-xl transition-all shadow-sm border border-emerald-100" title="Chamar no WhatsApp"><MessageCircle size={18}/></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {visitantes.filter(v => v.status === col.id).length === 0 && (
                                <div className="h-28 border-2 border-dashed border-slate-300/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <Move size={20} className="opacity-50"/>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Solte aqui</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default ModuleVisitantes;
