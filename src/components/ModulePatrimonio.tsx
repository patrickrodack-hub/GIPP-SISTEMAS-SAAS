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
const ModulePatrimonio = () => {
    const { db, openModal, addToast } = useContext(ChurchContext);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    const bens = (db.patrimonio || []).filter(b => 
        congregacaoFilter === 'todas' || 
        b.congregacao_id === congregacaoFilter || 
        (!b.congregacao_id && congregacaoFilter === 'sede')
    );
    
    const totalBens = bens.length;
    const valorTotal = bens.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
    const manutencao = bens.filter(b => b.estado === 'Ruim' || b.estado === 'Em Manutenção').length;
    
    const handleDownloadAnexo = (base64Str) => {
        const a = document.createElement('a');
        a.href = base64Str;
        a.download = `anexo_patrimonio_${Date.now()}`;
        a.click();
        addToast("A transferir anexo...", "success");
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100"><Package size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Patrimônio & Inventário</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Controle de bens e equipamentos da igreja</p>
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

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-indigo-500 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalBens}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bens Registados</p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={24}/></div>
                    </div>
                    
                    <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-emerald-500 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-emerald-600 tracking-tight mb-1">R$ {valorTotal.toFixed(2)}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Estimado Total</p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={24}/></div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-amber-500 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="text-4xl font-black text-amber-600 tracking-tight mb-1">{manutencao}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avariados / Manutenção</p>
                        </div>
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24}/></div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <GenericTable 
                        title="Inventário de Bens" 
                        type="patrimonio" 
                        data={bens} 
                        columns={[
                            {header: 'Tombo/Série', key: 'tombo', render: b => <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{b.tombo || '-'}</span>},
                            {header: 'Nome do Bem', key: 'nome', render: b => <div className="flex items-center gap-2"><span className="font-bold text-slate-800">{b.nome}</span>{b.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(b.comprovante); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Ver Anexo/Recibo"><Paperclip size={12}/></button>}</div>},
                            {header: 'Categoria', key: 'categoria', render: b => <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">{b.categoria}</span>},
                            {header: 'Localização', key: 'localizacao'},
                            {header: 'Estado', key: 'estado', render: b => {
                                let color = 'bg-slate-100 text-slate-600 border-slate-200';
                                if (b.estado === 'Novo' || b.estado === 'Bom') color = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                                if (b.estado === 'Regular') color = 'bg-amber-50 text-amber-600 border-amber-200';
                                if (b.estado === 'Ruim' || b.estado === 'Em Manutenção') color = 'bg-rose-50 text-rose-600 border-rose-200';
                                return <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm uppercase tracking-wider ${color}`}>{b.estado}</span>;
                            }},
                            {header: 'Valor', key: 'valor', render: b => <span className="font-medium text-emerald-600">R$ {parseFloat(b.valor || 0).toFixed(2)}</span>}
                        ]} 
                    />
                </div>
            </div>
        </div>
    );
};

// --- NOVO: MÓDULO DE CÉLULAS E PEQUENOS GRUPOS ---

export default ModulePatrimonio;
