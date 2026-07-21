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

import { GALLERY_WALLPAPERS, ANIMATION_OPTIONS } from './ModuleRedeSocial';

// Exporting component
const ModuleConfigVisual = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, theme, setTheme, osTheme, setOsTheme } = useContext(ChurchContext);
    const configData = db.igreja || {};
    
    const [selectedWall, setSelectedWall] = useState(configData.papel_parede || null);
    const [selectedAnim, setSelectedAnim] = useState(configData.tipo_animacao || 'auto');
    const [opacityFilter, setOpacityFilter] = useState(configData.papel_parede_opacidade !== undefined ? Number(configData.papel_parede_opacidade) : 40);
    const [selectedIconPack, setSelectedIconPack] = useState(configData.pacote_icones || 'gipp');
    const [customUrl, setCustomUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewTheme, setPreviewTheme] = useState(osTheme || 'default');

    // Sincroniza estados caso d_igreja mude externamente
    useEffect(() => {
        if (configData.papel_parede !== undefined) {
             setSelectedWall(configData.papel_parede);
        }
        if (configData.tipo_animacao !== undefined) {
             setSelectedAnim(configData.tipo_animacao);
        }
        if (configData.papel_parede_opacidade !== undefined) {
             setOpacityFilter(Number(configData.papel_parede_opacidade));
        }
        if (configData.pacote_icones !== undefined) {
             setSelectedIconPack(configData.pacote_icones || 'gipp');
        }
    }, [db.igreja]);

    const handleSaveConfig = async (wall = selectedWall, anim = selectedAnim, opacity = opacityFilter, iconPack = selectedIconPack) => {
        setSaving(true);
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                papel_parede: wall,
                tipo_animacao: anim,
                papel_parede_opacidade: opacity,
                pacote_icones: iconPack
            }, { merge: true });
            addToast("Preferências visuais atualizadas com sucesso!", "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao gravar novas configurações visuais.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 800 * 1024) { 
                alert("Para melhor performance, escolha imagens de até 800KB.");
                return; 
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setSelectedWall(base64);
                handleSaveConfig(base64, selectedAnim, opacityFilter);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
            addToast("Insira um endereço web de imagem válido (começando com http ou https).", "error");
            return;
        }
        setSelectedWall(customUrl);
        handleSaveConfig(customUrl, selectedAnim, opacityFilter);
        setCustomUrl('');
    };

    return (
        <div className="h-full flex flex-col space-y-8 animate-entrance font-sans text-slate-800 pb-12">
            {/* Header decorativo */}
            <div className="flex justify-between items-center bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl text-white shadow-md shadow-indigo-200">
                        <Palette size={32}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Experiência Visual & Temas</h2>
                        <p className="text-sm text-slate-500 font-medium">Personalize a atmosfera visual do sistema com papéis de parede e estilos de animação.</p>
                    </div>
                </div>
            </div>

            {/* SEÇÃO: SELETOR DE TEMAS COM PRÉ-VISUALIZAÇÃO */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <MonitorPlay className="text-indigo-600" size={24}/>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Seletor de Temas do Sistema (OS Themes)</h3>
                        <p className="text-xs text-slate-500 font-semibold">Escolha um dos sistemas operacionais retrô ou modernos abaixo e veja como a interface GIPP ficará antes de salvar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Lista de Temas */}
                    <div className="lg:col-span-5 flex flex-col space-y-2.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { id: 'default', name: 'GIPP Padrão (Moderno)', label: 'Default', desc: 'Interface moderna com cantos arredondados, gradientes e estética minimalista.' },
                            { id: 'macos_tahoe', name: 'macOS 26 Tahoe (Elegante) ', label: 'macOS', desc: 'Tema exuberante com barra superior translúcida, dock flutuante com zoom, Launchpad e cantos super-arredondados.' },
                            { id: 'win11', name: 'Windows 11 (Fluent)', label: 'Win11', desc: 'Abordagem contemporânea com translucidez sutil e cantos super suavizados.' },
                            { id: 'winxp', name: 'Windows XP (Luna)', label: 'WinXP', desc: 'Retrô vibrante dos anos 2005, com cabeçalhos azuis e botões verdes.' },
                            { id: 'win95', name: 'Windows 95 (Retro 95)', label: 'Win95', desc: 'Bordas chanfradas clássicas de 16 bits, cinza neutro e estética industrial.' },
                            { id: 'msdos', name: 'Sistema COBOL (Mainframe)', label: 'COBOL', desc: 'Visual clássico de terminal AS/400 ou mainframe IBM, fontes mono espaçadas em fósforo verde com destaques coloridos.' },
                            { id: 'linux', name: 'Linux Ubuntu (GNOME)', label: 'Linux', desc: 'Soberbo tema inspirado na elegância do Ubuntu e do ecossistema GNOME, com gradientes aubergine e detalhes em laranja Yaru.' },
                            { id: 'premium_black', name: 'Premium Black & Gold', label: 'Luxo', desc: 'Tema escuro requintado com contrastes profundos e acabamentos em dourado.' },
                            { id: 'futuristic', name: 'GIPP Sci-Fi Futurista', label: 'Futurista', desc: 'Estética cibernética de alta performance com realces neon ciano/rosa e acabamento holográfico.' }
                        ].map((t) => {
                            const isSelected = previewTheme === t.id;
                            const isActive = osTheme === t.id || (t.id === 'default' && !osTheme);
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setPreviewTheme(t.id)}
                                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex justify-between items-center group cursor-pointer ${
                                        isSelected 
                                            ? 'border-indigo-600 bg-indigo-50/25 shadow-sm' 
                                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                                    }`}
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-800 text-sm leading-none">{t.name}</span>
                                            {isActive && (
                                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider leading-none">
                                                    Em Uso
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed mt-1">{t.desc}</p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                                    }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Janela de Pré-visualização Viva */}
                    <div className="lg:col-span-7 flex flex-col space-y-4">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Prévia Interativa de Interface</div>
                        
                        {/* Desktop Simulador */}
                        <div 
                          className={`w-full h-[330px] rounded-[1.5rem] overflow-hidden relative flex flex-col p-4 shadow-inner border border-slate-200/60 transition-all duration-300 ${
                            previewTheme === 'default' ? 'bg-[#0f172a]' :
                            previewTheme === 'macos_tahoe' ? 'bg-[#0b0c16]' :
                            previewTheme === 'win11' ? 'bg-gradient-to-tr from-[#9ec2e6] to-[#d6e5f5]' :
                            previewTheme === 'winxp' ? 'bg-[#0050e6]' : /* Bliss classic blue */
                            previewTheme === 'win95' ? 'bg-[#008080]' : /* classic teal */
                            previewTheme === 'msdos' ? 'bg-black' :
                            previewTheme === 'linux' ? 'bg-[#1f0b1a]' : /* aubergine */
                            previewTheme === 'premium_black' ? 'bg-[#1a1a1a]' :
                            previewTheme === 'futuristic' ? 'bg-[#03001e]' : 'bg-slate-100'
                          }`}
                        >
                            {/* Papel de Parede simulado */}
                            {previewTheme === 'winxp' && (
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80')`, filter: 'brightness(0.95)' }}></div>
                            )}

                            {/* Janela simulada */}
                            <div 
                              className={`w-full max-w-md mx-auto mt-6 relative flex flex-col transition-all duration-300 z-10 ${
                                previewTheme === 'macos_tahoe' ? 'bg-[#16171e]/95 rounded-[1.2rem] border border-white/10 p-1.5 shadow-2xl text-slate-100' :
                                previewTheme === 'win95' ? 'bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] outline-1 outline-black p-0.5' :
                                previewTheme === 'winxp' ? 'bg-[#d4d0c8] rounded-t-lg border-2 border-[#0054e3] p-0.5' :
                                previewTheme === 'win11' ? 'bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/50 p-1.5 shadow-lg text-slate-800' :
                                previewTheme === 'msdos' ? 'bg-black border-4 border-double border-green-500 p-2 text-green-500 font-mono text-[11px]' :
                                previewTheme === 'linux' ? 'bg-[#221820] rounded-2xl border border-white/10 p-1 shadow-2xl text-slate-100' :
                                previewTheme === 'premium_black' ? 'bg-[#0a0a0a] border border-[#D4AF37] p-2 text-slate-100' :
                                previewTheme === 'futuristic' ? 'bg-black/90 border border-[#00f0ff] p-2 text-slate-100 shadow-[0_0_15px_rgba(0,240,255,0.25)]' :
                                'bg-white/95 rounded-3xl border border-slate-100 p-3 shadow-xl text-slate-800'
                              }`}
                              style={{ 
                                fontFamily: previewTheme === 'win95' || previewTheme === 'winxp' ? "'Tahoma', sans-serif" : 
                                             previewTheme === 'msdos' ? "'Consolas', 'Lucida Console', 'Courier New', monospace" : "inherit"
                              }}
                            >
                                {/* Barra de título simulada */}
                                <div 
                                  className={`flex items-center justify-between px-2 py-1 select-none ${
                                    previewTheme === 'macos_tahoe' ? 'bg-[#1e2029] rounded-t-xl p-2 border-b border-white/5 text-white font-bold flex-row-reverse' :
                                    previewTheme === 'win95' ? 'bg-[#000080] text-white font-bold' :
                                    previewTheme === 'winxp' ? 'bg-gradient-to-r from-[#0054e3] to-[#278df1] text-white font-bold rounded-t-md' :
                                    previewTheme === 'win11' ? 'bg-slate-50/50 rounded-lg p-1.5 text-slate-700 font-bold' :
                                    previewTheme === 'msdos' ? 'bg-black border-b border-green-500 pb-1 mb-2 font-mono text-yellow-400 font-bold uppercase tracking-wider' :
                                    previewTheme === 'linux' ? 'bg-[#1b1118] rounded-t-xl p-2 border-b border-white/5 text-white font-bold' :
                                    previewTheme === 'premium_black' ? 'bg-gradient-to-r from-[#111] to-[#222] border-b border-[#D4AF37]/40 pb-1 mb-2 text-[#D4AF37] font-bold' :
                                    previewTheme === 'futuristic' ? 'bg-gradient-to-r from-[#03001e] to-[#120012] border-b border-[#00f0ff]/40 pb-1 mb-2 text-[#00f0ff] font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]' :
                                    'bg-slate-50/80 p-2 rounded-2xl text-slate-800 font-bold'
                                  }`}
                                >
                                    <span className="text-[11px] truncate uppercase tracking-wide">
                                        {previewTheme === 'msdos' ? 'C:\\GIPP\\DASHBOARD.EXE' : 'GIPP - Visual Preview'}
                                    </span>
                                    {/* Botões de controle simulados */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {previewTheme === 'macos_tahoe' ? (
                                            <div className="flex gap-1.5">
                                                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full flex items-center justify-center border border-rose-600/30"></span>
                                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full flex items-center justify-center border border-amber-600/30"></span>
                                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center border border-emerald-600/30"></span>
                                            </div>
                                        ) : previewTheme === 'win95' ? (
                                            <div className="flex gap-0.5">
                                                <span className="w-4 h-3.5 bg-[#d4d0c8] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-[8px] flex items-center justify-center font-bold text-black select-none">_</span>
                                                <span className="w-4 h-3.5 bg-[#d4d0c8] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-[8px] flex items-center justify-center font-bold text-black select-none">▢</span>
                                                <span className="w-4 h-3.5 bg-[#d4d0c8] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-[8px] flex items-center justify-center font-bold text-black select-none">✕</span>
                                            </div>
                                        ) : previewTheme === 'winxp' ? (
                                            <div className="flex gap-0.5">
                                                <span className="w-4 h-4 bg-blue-600 rounded-full border border-blue-900 text-white text-[8px] flex items-center justify-center font-bold select-none">_</span>
                                                <span className="w-4 h-4 bg-green-600 rounded-full border border-green-900 text-white text-[8px] flex items-center justify-center font-bold select-none">▢</span>
                                                <span className="w-4 h-4 bg-red-600 rounded-full border border-red-900 text-white text-[8px] flex items-center justify-center font-bold select-none">✕</span>
                                            </div>
                                        ) : previewTheme === 'linux' ? (
                                            <div className="flex gap-1.5">
                                                <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center font-bold text-black/45 text-[7px] select-none cursor-default">✕</span>
                                                <span className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-black/45 text-[7px] select-none cursor-default">_</span>
                                                <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center font-bold text-black/45 text-[7px] select-none cursor-default">⤢</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Conteúdo simulado */}
                                <div className={`p-4 mt-1 flex flex-col space-y-3.5 ${
                                    previewTheme === 'macos_tahoe' ? 'bg-[#16171e] text-slate-100' :
                                    previewTheme === 'msdos' ? 'bg-black text-green-500 font-mono' :
                                    previewTheme === 'premium_black' ? 'bg-[#050505] text-slate-100' :
                                    previewTheme === 'futuristic' ? 'bg-[#03001e] text-slate-100' :
                                    previewTheme === 'linux' ? 'bg-[#221820] text-slate-100' :
                                    previewTheme === 'win95' || previewTheme === 'winxp' ? 'bg-[#d4d0c8] text-black' :
                                    'bg-white text-slate-800'
                                }`}>
                                    <div className="text-[11px] font-bold">Secretaria GIPP (Demonstração)</div>
                                    
                                    {/* Campo de input simulado */}
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-[10px] font-bold opacity-85">Nome do Membro:</span>
                                        <div className={`p-1.5 text-[10px] truncate ${
                                            previewTheme === 'macos_tahoe' ? 'border border-white/10 bg-white/5 text-white rounded-lg' :
                                            previewTheme === 'win95' ? 'bg-white border-t-1.5 border-l-1.5 border-t-[#404040] border-l-[#404040] border-r-1.5 border-b-1.5 border-r-white border-b-white text-black' :
                                            previewTheme === 'winxp' ? 'bg-white border border-blue-600 text-black rounded' :
                                            previewTheme === 'msdos' ? 'border-b-2 border-cyan-400 bg-black text-cyan-400 font-mono font-bold' :
                                            previewTheme === 'linux' ? 'border border-white/10 bg-[#150d14] text-white rounded-lg' :
                                            previewTheme === 'premium_black' ? 'border border-[#D4AF37]/40 bg-black text-[#D4AF37]' :
                                            previewTheme === 'futuristic' ? 'border border-[#00f0ff]/50 bg-slate-950 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.15)]' :
                                            'bg-slate-50 border border-slate-200 rounded-xl'
                                        }`}>
                                            JOÃO SOUZA SANTOS (MEMBRO ATIVO)
                                        </div>
                                    </div>

                                    {/* Botões simulados */}
                                    <div className="flex gap-2">
                                        <div className={`text-[10px] font-bold px-3 py-1.5 text-center flex-1 cursor-default select-none ${
                                            previewTheme === 'macos_tahoe' ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-400/20 text-white rounded-lg text-center shadow-md' :
                                            previewTheme === 'win95' ? 'bg-[#d4d0c8] border-t-1.5 border-l-1.5 border-t-white border-l-white border-r-1.5 border-b-1.5 border-r-[#404040] border-b-[#404040] text-black' :
                                            previewTheme === 'winxp' ? 'bg-gradient-to-b from-[#eaeaea] to-[#cccccc] border border-slate-400 text-black rounded shadow-xs' :
                                            previewTheme === 'msdos' ? 'border-2 border-white bg-blue-900 text-white font-mono text-center font-bold tracking-widest uppercase' :
                                            previewTheme === 'linux' ? 'bg-gradient-to-b from-[#e95420] to-[#df3812] border border-transparent text-white rounded-lg text-center font-bold shadow-[0_4px_10px_rgba(223,56,18,0.3)]' :
                                            previewTheme === 'premium_black' ? 'bg-gradient-to-r from-[#111] to-[#222] border border-[#D4AF37] text-[#D4AF37] text-center font-bold' :
                                            previewTheme === 'futuristic' ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff007f] border border-white/10 text-white text-center font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)] rounded-lg' :
                                            'bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 text-center'
                                        }`}>
                                            Gravar Registro
                                        </div>
                                        <div className={`text-[10px] font-bold px-3 py-1.5 text-center flex-1 cursor-default select-none ${
                                            previewTheme === 'macos_tahoe' ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg text-center' :
                                            previewTheme === 'win95' ? 'bg-[#d4d0c8] border-t-1.5 border-l-1.5 border-t-white border-l-white border-r-1.5 border-b-1.5 border-r-[#404040] border-b-[#404040] text-black' :
                                            previewTheme === 'winxp' ? 'bg-gradient-to-b from-[#eaeaea] to-[#cccccc] border border-slate-400 text-black rounded' :
                                            previewTheme === 'msdos' ? 'border-2 border-white bg-blue-900 text-white font-mono text-center font-bold tracking-widest uppercase' :
                                            previewTheme === 'linux' ? 'bg-[#3a3a44] border border-white/5 text-white rounded-lg text-center font-bold' :
                                            previewTheme === 'premium_black' ? 'bg-black border border-slate-700 text-slate-400 text-center' :
                                            previewTheme === 'futuristic' ? 'bg-slate-900/80 border border-[#ff007f]/40 text-[#ff007f] text-center rounded-lg shadow-[0_0_8px_rgba(255,0,127,0.15)]' :
                                            'bg-slate-100 text-slate-500 rounded-xl font-bold text-center'
                                        }`}>
                                            Cancelar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botão para aplicar o tema */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <span className="text-[11px] text-slate-500 font-bold">
                                {previewTheme === osTheme ? 'Este tema já está ativo no seu navegador.' : 'Modificações não salvas ainda.'}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setOsTheme(previewTheme);
                                    addToast(`Tema do sistema alterado para: ${previewTheme.toUpperCase()}`, "success");
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-xs hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                            >
                                <Save size={14} /> Aplicar Tema do Sistema
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Quadrante 1: Papel de Parede */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                        <ImageIcon className="text-indigo-600" size={24}/>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">1. Papel de Parede do Portal</h3>
                            <p className="text-xs text-slate-550 font-medium">Selecione uma imagem para cobrir os fundos das páginas do sistema.</p>
                        </div>
                    </div>

                    {/* Previa e Controles de Contraste */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                        <div className="md:col-span-5 relative h-36 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200/60 bg-slate-200 flex items-center justify-center">
                            {selectedWall ? (
                                <>
                                    <div className="absolute inset-0 bg-cover bg-center transition-all duration-300" style={{ backgroundImage: `url(${selectedWall})` }} />
                                    {opacityFilter > 0 && <div className="absolute inset-0 bg-black transition-all duration-300" style={{ opacity: opacityFilter / 100 }} />}
                                    <span className="relative z-10 px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest leading-none">Live Prévia</span>
                                </>
                            ) : (
                                <div className="text-center text-slate-400 p-4">
                                    <ImageIcon className="mx-auto mb-2 opacity-40" size={28}/>
                                    <span className="text-[11px] font-bold">Fundo Padrão Sólido</span>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-7 flex flex-col space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-700 block mb-1">Película de Contraste (Opacidade Escura)</label>
                                <p className="text-[11px] text-slate-450 leading-relaxed mb-3">Escurece o papel de parede para garantir que os textos do menu e os cards fiquem perfeitamente visíveis.</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="90" 
                                        step="10" 
                                        value={opacityFilter} 
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setOpacityFilter(val);
                                            handleSaveConfig(selectedWall, selectedAnim, val);
                                        }}
                                        className="flex-1 h-2 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                                    />
                                    <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 font-mono w-12 text-center">{opacityFilter}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Galeria de presets */}
                    <div>
                        <h4 className="text-xs font-black text-slate-550 uppercase tracking-wider mb-3">Galeria de Fundos de Alta Qualidade</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {GALLERY_WALLPAPERS.map((item, idx) => {
                                const isSelected = selectedWall === item.value;
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => {
                                            setSelectedWall(item.value);
                                            handleSaveConfig(item.value, selectedAnim, opacityFilter);
                                        }}
                                        className={`group relative flex flex-col h-24 rounded-2xl overflow-hidden border-2 text-left transition-all ${isSelected ? 'border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <div className="absolute inset-0 bg-cover bg-center bg-slate-100 group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url(${item.thumb})` }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                                            <span className="text-[10px] font-bold text-white leading-tight truncate w-full">{item.name}</span>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                                                <CheckCircle size={12} className="fill-white text-indigo-600"/>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Envios personalizados */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-xs font-black text-slate-700 block mb-2">Upload de Imagem Própria</span>
                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer transition-all text-center">
                                <Upload className="text-indigo-500 mb-2" size={24}/>
                                <span className="text-xs font-black text-slate-700">Escolher arquivo JPG/PNG</span>
                                <span className="text-[10px] text-slate-400 mt-1">Máximo 800 KB recomendado</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden"/>
                            </label>
                        </div>

                        <div>
                            <span className="text-xs font-black text-slate-700 block mb-2">Endereço de Imagem Web (URL)</span>
                            <form onSubmit={handleUrlSubmit} className="flex flex-col space-y-2">
                                <input 
                                    type="text" 
                                    placeholder="https://exemplo.com/imagem.jpg" 
                                    value={customUrl} 
                                    onChange={(e) => setCustomUrl((e.target.value || "").toUpperCase())}
                                    className="w-full text-xs px-4 py-3.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 rounded-2xl outline-none font-medium transition-all"
                                />
                                <Button type="submit" variant="ghost" className="border border-slate-200 py-3 text-xs flex justify-center items-center gap-2 hover:bg-slate-50 font-bold">
                                    <ImagePlus size={16}/> Configurar via Link URL
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Coluna da Direita: Estilos de Animação & Tema do Sistema */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-8">
                    {/* Quadrante 2: Efeito de Animação de Fundo */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <Sparkles className="text-indigo-600" size={24}/>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">2. Estilos de Animação</h3>
                                <p className="text-xs text-slate-550 font-medium">Decida quais efeitos visuais flutuarão sobre o fundo escolhido.</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {ANIMATION_OPTIONS.map((opt) => {
                                const isSelected = selectedAnim === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            setSelectedAnim(opt.id);
                                            handleSaveConfig(selectedWall, opt.id, opacityFilter);
                                        }}
                                        className={`flex items-start gap-4 p-4 rounded-3xl border-2 text-left transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'}`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            <opt.icon size={20}/>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-sm font-black text-slate-800 leading-none">{opt.name}</span>
                                                {isSelected && <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md leading-none tracking-wider">Ativo</span>}
                                            </div>
                                            <p className="text-[11px] text-slate-555 leading-relaxed mt-1.5 font-medium">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quadrante 3: Pacote de Ícones do Sistema */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <Sliders className="text-indigo-600" size={24}/>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">3. Pacote de Ícones do Sistema</h3>
                                <p className="text-xs text-slate-550 font-medium">Escolha a identidade visual dos ícones do menu e botões do portal.</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4">
                            {[
                                {
                                    id: '3d',
                                    name: 'GIPP 3D Esférico (Claymorphism)',
                                    desc: 'Ícones volumétricos com profundidade de camadas, brilho de vidro e sombra de base tátil simulada que saltam aos olhos.',
                                    previewStyle: (
                                        <div className="flex gap-2 items-center">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-[0_3px_0_#1d4ed8,0_6px_12px_rgba(29,78,216,0.3)] border-t border-white/30"><Calendar size={14} strokeWidth={2.5} className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]"/></div>
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-[0_3px_0_#4338ca,0_6px_12px_rgba(67,56,202,0.3)] border-t border-white/30"><Users size={14} strokeWidth={2.5} className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]"/></div>
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_3px_0_#047857,0_6px_12px_rgba(4,120,87,0.3)] border-t border-white/30"><CreditCard size={14} strokeWidth={2.5} className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]"/></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'gipp',
                                    name: 'GIPP Tecnológico (Padrão)',
                                    desc: 'Ícones cibernéticos de alta precisão, realces em neon dinâmico e contornos radiantes que se adaptam inteligentemente às cores de cada departamento do portal.',
                                    previewStyle: (
                                        <div className="flex gap-2 items-center">
                                            <div className="p-1.5 rounded-[10px] border border-blue-500/20 bg-slate-900 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.35)]"><Calendar size={14} strokeWidth={2.0}/></div>
                                            <div className="p-1.5 rounded-[10px] border border-indigo-500/20 bg-slate-900 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.35)]"><Users size={14} strokeWidth={2.0}/></div>
                                            <div className="p-1.5 rounded-[10px] border border-emerald-500/20 bg-slate-900 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]"><CreditCard size={14} strokeWidth={2.0}/></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'windows11',
                                    name: 'Windows 11 (Fluent Design)',
                                    desc: 'Linhas finas e modernas com grid minimalista, leves contornos e cantos levemente suavizados no estilo Segoe Fluent.',
                                    previewStyle: (
                                        <div className="flex gap-2 items-center">
                                            <div className="p-1.5 rounded-[8px] bg-slate-50 border border-slate-200 text-slate-600"><Calendar size={16} strokeWidth={1.45}/></div>
                                            <div className="p-1.5 rounded-[8px] bg-slate-50 border border-slate-200 text-slate-600"><Users size={16} strokeWidth={1.45}/></div>
                                            <div className="p-1.5 rounded-[8px] bg-slate-50 border border-slate-200 text-slate-600"><CreditCard size={16} strokeWidth={1.45}/></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'android',
                                    name: 'Android 14 (Material Design You)',
                                    desc: 'Linhas encorpadas, formas circulares amigáveis e descontraídas com realces pastéis dinâmicos do Google.',
                                    previewStyle: (
                                        <div className="flex gap-2 items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center"><Calendar size={16} strokeWidth={2.4}/></div>
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center"><Users size={16} strokeWidth={2.4}/></div>
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><CreditCard size={16} strokeWidth={2.4}/></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'ios',
                                    name: 'iOS 17 (Apple SF Symbols)',
                                    desc: 'Ícones vibrantes de alta resolução em blocos contínuos "Squircle", com cores contrastantes e ricas no clássico sistema Apple.',
                                    previewStyle: (
                                        <div className="flex gap-2 items-center">
                                            <div className="w-8 h-8 rounded-[10px] bg-blue-500 text-white flex items-center justify-center shadow-xs"><Calendar size={14} strokeWidth={2.0}/></div>
                                            <div className="w-8 h-8 rounded-[10px] bg-indigo-500 text-white flex items-center justify-center shadow-xs"><Users size={14} strokeWidth={2.0}/></div>
                                            <div className="w-8 h-8 rounded-[10px] bg-emerald-500 text-white flex items-center justify-center shadow-xs"><CreditCard size={14} strokeWidth={2.0}/></div>
                                        </div>
                                    )
                                }
                            ].map((pack) => {
                                const isSelected = selectedIconPack === pack.id;
                                return (
                                    <button
                                        key={pack.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedIconPack(pack.id);
                                            handleSaveConfig(selectedWall, selectedAnim, opacityFilter, pack.id);
                                        }}
                                        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl border-2 text-left transition-all ${isSelected ? 'border-indigo-600 bg-indigo-55/15 shadow-xs' : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm font-black text-slate-800 leading-none">{pack.name}</span>
                                                {isSelected && <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md leading-none tracking-wider">Ativo</span>}
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 font-semibold pr-2">{pack.desc}</p>
                                        </div>
                                        <div className="shrink-0 bg-white/70 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-100/50 flex items-center justify-center">
                                            {pack.previewStyle}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quadrante 4: Tema do Sistema (Claro / Escuro) */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            {theme === 'dark' ? <Moon className="text-indigo-600" size={24}/> : <Sun className="text-indigo-600" size={24}/>}
                            <div>
                                <h3 className="text-lg font-black text-slate-800">4. Tema do Sistema</h3>
                                <p className="text-xs text-slate-550 font-medium">Selecione o estilo visual padrão para a sua navegação permanente.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('light');
                                    addToast("Modo Claro ativado permanente!", "success");
                                }}
                                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all space-y-3 ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/20 hover:border-indigo-100 hover:bg-slate-50/50'}`}
                            >
                                <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Sun size={24}/>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs sm:text-sm font-black text-slate-800">Modo Claro</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Design nítido e limpo</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('dark');
                                    addToast("Modo Escuro ativado permanente!", "success");
                                }}
                                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all space-y-3 ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/20 hover:border-indigo-100 hover:bg-slate-50/50'}`}
                            >
                                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Moon size={24}/>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs sm:text-sm font-black text-slate-800">Modo Escuro</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Atmosfera elegante e noturna</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ModuleConfigVisual;
