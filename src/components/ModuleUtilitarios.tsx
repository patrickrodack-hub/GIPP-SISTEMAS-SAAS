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
const ModuleUtilitarios = () => {
    const { db, openModal } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    
    // Processamento de dados: calcular o balanço de entradas e saídas de cada centro de custo
    const ccData = db.centro_custo.map(cc => {
        const entradas = db.financeiro.filter(f => f.centro_custo_id === cc.id && f.tipo === 'entrada').reduce((a, b) => a + (parseFloat(b.valor) || 0), 0);
        const saidas = db.financeiro.filter(f => f.centro_custo_id === cc.id && f.tipo === 'saida').reduce((a, b) => a + (parseFloat(b.valor) || 0), 0);
        return { 
            ...cc, 
            total_entradas: entradas, 
            total_saidas: saidas, 
            saldo: entradas - saidas 
        };
    });

    const menuItems = [
        {id: 1, label: 'Centros de Custo', icon: Landmark}, 
        {id: 2, label: 'Fornecedores', icon: Truck}
    ];

    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><Settings size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 text-gradient">Utilitários Financeiros</h2>
                        <p className="text-sm text-slate-500 font-medium">Gestão consolidada de Centros de Custo e Fornecedores.</p>
                    </div>
                </div>
            </div>
            
            <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 w-full md:w-auto">
                {menuItems.map(item => <TabButton key={item.id} item={item} />)}
            </div>

            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <GenericTable
                        title="Painel de Centros de Custo"
                        type="centro_custo"
                        data={ccData}
                        columns={[
                            {header: 'Nome do Centro', key: 'nome', render: c => <span className="font-bold text-slate-700 uppercase tracking-wider">{c.nome}</span>},
                            {header: 'Responsável', key: 'responsavel'},
                            {header: 'Total Entradas', key: 'total_entradas', render: c => <span className="font-bold text-emerald-600">R$ {c.total_entradas.toFixed(2)}</span>},
                            {header: 'Total Saídas', key: 'total_saidas', render: c => <span className="font-bold text-rose-600">R$ {c.total_saidas.toFixed(2)}</span>},
                            {header: 'Balanço', key: 'saldo', render: c => <span className={`font-black px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider ${c.saldo >= 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>R$ {c.saldo.toFixed(2)}</span>}
                        ]}
                    />
                )}
                {tab === 2 && (
                    <GenericTable 
                        title="Painel de Fornecedores" 
                        type="fornecedor" 
                        data={db.fornecedores} 
                        columns={[
                            {header: 'Razão Social / Nome', key: 'nome', render: f => <span className="font-bold text-slate-700 uppercase tracking-wider">{f.nome}</span>}, 
                            {header: 'CNPJ/CPF', key: 'cnpj'}, 
                            {header: 'Contato', key: 'telefone'}, 
                            {header: 'E-mail', key: 'email'}, 
                            {header: 'Status', key: 'status', render: f => <span className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border shadow-sm uppercase tracking-wider ${f.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{f.status || 'Ativo'}</span>}
                        ]} 
                    />
                )}
            </div>
        </div>
    );
};

// --- NOVO: MÓDULO DE CONCILIAÇÃO BANCÁRIA (INTERNET BANKING) ---

export default ModuleUtilitarios;
