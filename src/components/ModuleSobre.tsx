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
  Instagram, Facebook,
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
                <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight block uppercase">{db.igreja?.saas_nome_sistema || "GIPP - GESTÃO DE IGREJA"}</h2>
                <p className="text-indigo-600 font-black tracking-widest uppercase text-sm bg-indigo-50 px-4 py-2.5 rounded-full inline-block border border-indigo-200/50 shadow-xs">{db.igreja?.saas_versao_sistema || "Versão 8.3.0 (SaaS Platinum Enterprise - Versão Completa)"}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/70 p-8 rounded-3xl border border-white/60 shadow-sm transition-all hover:shadow-md hover:bg-white/90">
                    <h3 className="font-black text-xl text-indigo-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-200/50"><Cpu size={24}/> Arquitetura Geral</h3>
                    <ul className="space-y-5 text-sm text-slate-700">
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0 border border-indigo-100"><Code size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5 font-bold">Frontend & SPA</strong>Construído em React.js moderno (Single Page Application) garantindo fluidez absoluta, velocidade instantânea e transição de páginas livre de recarregamentos.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0 border border-emerald-100"><Database size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5 font-bold font-sans">Banco de Dados & Cloud Sincronizado</strong>Firebase Firestore (NoSQL em tempo real) com persistência local ativa e sincronização imediata multicliente.</div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600 shrink-0 border border-pink-100"><Palette size={18}/></div>
                            <div><strong className="block text-slate-900 mb-0.5 font-bold">Interface e Visual Design</strong>Tailwind CSS para customização rica em Design Tokens, transição sutil em micro-interações, efeitos Glassmorphism elegantes e ergonomia de visão.</div>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white/70 p-8 rounded-3xl border border-white/60 shadow-sm flex-1 flex flex-col justify-center items-center text-center transition-all hover:shadow-md hover:bg-white/90">
                        <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-2 w-full justify-center pb-4 border-b border-slate-200/50"><UserCheck size={24} className="text-emerald-500"/> Desenvolvedor & Criador</h3>
                        <div className="relative mb-5 hover:scale-105 transition-transform duration-300 cursor-default">
                            <div className="w-28 h-28 rounded-full border-4 border-indigo-100 shadow-2xl overflow-hidden bg-white flex items-center justify-center text-white font-black text-4xl">
                                <img src={db.igreja?.saas_dev_imagem || db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"} alt="Desenvolvedor" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-lg" title="Desenvolvedor Verificado"><Check size={12} className="text-white" strokeWidth={4}/></div>
                        </div>
                        <div>
                            <h4 className="font-black text-3xl text-slate-900 uppercase font-sans">{db.igreja?.saas_nome_desenvolvedor || "PATRICK PESSOA"}</h4>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2 bg-indigo-50 py-1.5 px-4 rounded-full inline-block">Software Creator & Engineer</p>
                            <p className="text-sm text-slate-500 mt-6 leading-relaxed max-w-sm mx-auto font-medium">
                                {db.igreja?.saas_descricao_sistema || "Aplicativo idealizado, arquitetado e desenvolvido com excelência para modernizar a administração eclesiástica, aliando fé a tecnologia de ponta."}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 justify-center mt-6">
                                <a 
                                    href={db.igreja?.saas_site || "https://gipp-site.vercel.app/"} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2 hover:bg-indigo-55 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <Globe size={14} />
                                    Site Oficial
                                </a>

                                {db.igreja?.saas_whatsapp && (
                                    <a 
                                        href={`https://wa.me/${db.igreja.saas_whatsapp}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <Phone size={14} />
                                        WhatsApp
                                    </a>
                                )}

                                {db.igreja?.saas_email && (
                                    <a 
                                        href={`mailto:${db.igreja.saas_email}`} 
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200"
                                    >
                                        <Mail size={14} />
                                        E-mail
                                    </a>
                                )}

                                {db.igreja?.saas_instagram && (
                                    <a 
                                        href={db.igreja.saas_instagram.startsWith('http') ? db.igreja.saas_instagram : `https://instagram.com/${db.igreja.saas_instagram}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <Instagram size={14} />
                                        Instagram
                                    </a>
                                )}

                                {db.igreja?.saas_facebook && (
                                    <a 
                                        href={db.igreja.saas_facebook.startsWith('http') ? db.igreja.saas_facebook : `https://facebook.com/${db.igreja.saas_facebook}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <Facebook size={14} />
                                        Facebook
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ECOSSISTEMA TECNOLÓGICO SELECIONADO (GOLD VALUE METRICS) */}
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200 shadow-sm p-8 mt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 uppercase tracking-tight font-[Outfit]">
                            <Layers size={24} className="text-indigo-600"/>
                            Mapeamento Tecnológico GIPP Gold
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 font-semibold">Os pilares e engenharia de software de classe mundial integrados ao nosso ecossistema eclesiástico.</p>
                    </div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                        Tecnologias de Ponta Ativas: <span className="text-indigo-600 font-extrabold">10 Motores</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* React & Vite */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100"><Cpu size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">React 18 + Vite Engine</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Renderização virtual ultrarrápida com compilação sob demanda e reatividade assíncrona instantânea de componentes.</p>
                    </div>

                    {/* TypeScript Code */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600 border border-sky-100"><Code size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">TypeScript Strict Type</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Tipagem estática que previne erros de tempo de execução em produção, blindando a consistência dos dados internos eclesiásticos.</p>
                    </div>

                    {/* Firebase NoSQL */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><Database size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">Cloud Firestore NoSQL</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium font-sans">Banco de dados serverless estruturado e distribuído mundialmente com sincronização offline persistente nativa (Zero Delay).</p>
                    </div>

                    {/* Authentication Security */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100"><Lock size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">JWT & Security Tokens</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Autenticação militar e de alta conformidade com a LGPD usando persistência de sessão criptografada por token JWT.</p>
                    </div>

                    {/* Cognitive AI Gemini */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100"><Sparkles size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">Google Gemini LLM AI</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Inteligência Artificial de ponta integrada para apoiar a criação de lições EBD, resumos estatísticos pastorais e consultoria de dados.</p>
                    </div>

                    {/* IndexedDB Cache Local */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100"><CheckCircle size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">IndexedDB Local Cache</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Armazenamento local em banco de dados do navegador para salvar permanentemente as mídias, dízimos locais e dados em 0ms.</p>
                    </div>

                    {/* Portal DOM Inject */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600 border border-pink-100"><Layers size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">React Portals & DOM Overlay</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Injeção dinâmica de diálogos no nível da raiz do documento, garantindo estabilidade e sobreposição de 100% em impressões.</p>
                    </div>

                    {/* BI Recharts Viz */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 border border-teal-100"><FileBarChart size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850">Recharts Business Analytics</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Motor de gráficos analíticos sofisticados e interativos focados no Business Intelligence (DRE, Fluxo de Caixa, Balanços).</p>
                    </div>

                    {/* Canvas & PDF HD Spooler */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 border border-yellow-100"><FileText size={20}/></div>
                            <h4 className="font-extrabold text-sm text-slate-850 font-sans">PDF & Canvas HD Spooler</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Geração e captura rasterizada vetorizada em alta resolução para a emissão canônica instantânea de certificados, comprovantes e relatórios.</p>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="p-4 bg-rose-500 text-white rounded-2xl shrink-0 animate-pulse shadow-lg shadow-rose-500/30 relative z-10"><AlertTriangle size={36}/></div>
                <div className="relative z-10 text-center md:text-left">
                    <h4 className="font-black text-rose-700 text-xl uppercase tracking-wider mb-2">Aviso Legal de Direitos Autorais</h4>
                    <p className="text-sm font-bold text-rose-800 leading-relaxed text-justify">
                        É estritamente <strong>PROIBIDA</strong> a cópia, clonagem, modificação, distribuição, revenda ou comercialização deste software, total ou parcialmente, sob qualquer pretexto, sem a prévia, expressa e documentada autorização do seu criador e desenvolvedor exclusivo, <strong>{db.igreja?.saas_nome_desenvolvedor || "PATRICK PESSOA"}</strong>. O uso não autorizado está sujeito às penalidades da lei de proteção de propriedade intelectual e direitos de autor vigentes.
                    </p>
                </div>
            </div>
        </div>
    );
};


export default ModuleSobre;
