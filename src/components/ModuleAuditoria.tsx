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
const ModuleAuditoria = memo(() => {
    const { db } = useContext(ChurchContext);
    
    // Ordenar do mais recente para o mais antigo
    const logsOrdenados = [...(db.auditoria || [])].sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());

    const columns = [
        { header: 'Data/Hora', key: 'data_hora', render: l => { const d = new Date(l.data_hora); return <div className="text-xs"><b>{d.toLocaleDateString('pt-BR')}</b><br/><span className="text-slate-400">{d.toLocaleTimeString('pt-BR')}</span></div>; } },
        { header: 'Usuário', key: 'usuario_nome', render: l => <span className="font-bold text-slate-700 uppercase">{l.usuario_nome}</span> },
        { header: 'Ação', key: 'acao', render: l => {
            const colors = {
                'CRIAÇÃO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'EDIÇÃO': 'bg-blue-100 text-blue-700 border-blue-200',
                'EXCLUSÃO_LÓGICA': 'bg-amber-100 text-amber-700 border-amber-200',
                'RESTAURAÇÃO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                'EXCLUSÃO_PERMANENTE': 'bg-rose-100 text-rose-700 border-rose-200',
                'BAIXA_FINANCEIRA': 'bg-teal-100 text-teal-700 border-teal-200',
                'BAIXA_CARNE': 'bg-teal-100 text-teal-700 border-teal-200',
                'LOGIN': 'bg-slate-100 text-slate-700 border-slate-200'
            };
            return <span className={`text-[10px] font-black px-2 py-1 rounded-md border shadow-sm uppercase ${colors[l.acao] || 'bg-slate-100 text-slate-700'}`}>{l.acao.replace('_', ' ')}</span>;
        } },
        { header: 'Módulo/Tabela', key: 'tipo_item', render: l => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{l.tipo_item}</span> },
        { header: 'Detalhes', key: 'detalhes', render: l => <span className="text-sm text-slate-600 font-medium">{l.detalhes}</span> }
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-sm"><ShieldCheck size={28}/></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Auditoria & Logs</h2>
                    <p className="text-sm text-slate-500 font-medium">Rastreamento de atividades e alterações de dados no sistema.</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GenericTable title="" type="auditoria" data={logsOrdenados} columns={columns} customActions={() => null} showDeleted={true} />
            </div>
        </div>
    );
});


export default ModuleAuditoria;
