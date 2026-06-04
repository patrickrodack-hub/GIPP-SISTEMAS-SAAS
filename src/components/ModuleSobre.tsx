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
const ModuleSobre = () => {
    const { db } = useContext(ChurchContext);
    
    return (
        <div className="glass-modern p-10 rounded-[2.5rem] animate-entrance max-w-5xl mx-auto space-y-10">
            <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform">
                    <Building2 size={48} className="text-white"/>
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">GIPP - GESTÃO DE IGREJA</h2>
                <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">Versão 6.3.0 (SaaS Gold Edition)</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/70 p-8 rounded-3xl border border-white/60 shadow-sm transition-all hover:shadow-md hover:bg-white/90">
                    <h3 className="font-black text-xl text-indigo-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-200/50"><Cpu size={24}/> Arquitetura e Tecnologias</h3>
                    <ul className="space-y-5 text-sm text-slate-700">
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0 border border-indigo-100"><Code size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5">Frontend & SPA</strong>Construído em React.js (Single Page Application) garantindo fluidez, velocidade e ausência de recarregamentos na navegação.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0 border border-emerald-100"><Database size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5">Banco de Dados & Cloud</strong>Firebase Firestore (NoSQL em tempo real) aliado ao Firebase Auth para segurança robusta e sincronização em nuvem.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600 shrink-0 border border-pink-100"><Palette size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5">Design, Visual & UI/UX</strong>Tailwind CSS para estilização moderna, com efeitos Glassmorphism, animações dinâmicas e ícones vetorizados do Lucide React.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shrink-0 border border-purple-100"><Sparkles size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5">Inteligência Artificial (IA)</strong>Integração direta com a API do Google Gemini (LLM Generativo) para consultoria financeira, esboços de sermões e melhoria de textos.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0 border border-amber-100"><FileBarChart size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5">Gráficos & Relatórios</strong>Recharts para visualização de dados (Data Visualization) e motor nativo HTML2Canvas para geração de PDFs/Imagens de alta resolução.</div>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white/70 p-8 rounded-3xl border border-white/60 shadow-sm flex-1 flex flex-col justify-center items-center text-center transition-all hover:shadow-md hover:bg-white/90">
                        <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-2 w-full justify-center pb-4 border-b border-slate-200/50"><UserCheck size={24} className="text-emerald-500"/> Desenvolvedor & Criador</h3>
                        <div className="relative mb-5 hover:scale-105 transition-transform duration-300 cursor-default">
                            <div className="w-28 h-28 rounded-full border-4 border-indigo-100 shadow-2xl overflow-hidden bg-white flex items-center justify-center text-white font-black text-4xl">
                                <img src={db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"} alt="Ícone do Aplicativo" className="w-full h-full object-contain p-2" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-lg" title="Desenvolvedor Verificado"><Check size={12} className="text-white" strokeWidth={4}/></div>
                        </div>
                        <div>
                            <h4 className="font-black text-3xl text-slate-900">PATRICK PESSOA</h4>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2 bg-indigo-50 py-1.5 px-4 rounded-full inline-block">Software Creator & Engineer</p>
                            <p className="text-sm text-slate-500 mt-6 leading-relaxed max-w-sm mx-auto font-medium">Aplicativo idealizado, arquitetado e desenvolvido com excelência para modernizar a administração eclesiástica, aliando fé a tecnologia de ponta.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="p-4 bg-rose-500 text-white rounded-2xl shrink-0 animate-pulse shadow-lg shadow-rose-500/30 relative z-10"><AlertTriangle size={36}/></div>
                <div className="relative z-10 text-center md:text-left">
                    <h4 className="font-black text-rose-700 text-xl uppercase tracking-wider mb-2">Aviso Legal de Direitos Autorais</h4>
                    <p className="text-sm font-bold text-rose-800 leading-relaxed text-justify">
                        É estritamente <strong>PROIBIDA</strong> a cópia, clonagem, modificação, distribuição, revenda ou comercialização deste software, total ou parcialmente, sob qualquer pretexto, sem a prévia, expressa e documentada autorização do seu criador e desenvolvedor exclusivo, <strong>PATRICK PESSOA</strong>. O uso não autorizado está sujeito às penalidades da lei de proteção de propriedade intelectual e direitos de autor vigentes.
                    </p>
                </div>
            </div>
        </div>
    );
};


export default ModuleSobre;
