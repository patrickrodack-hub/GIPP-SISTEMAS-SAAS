import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, ChevronDown, ChevronRight, Plus, Edit, Trash2, Printer, 
  Search, Menu, X, DollarSign, BookOpen, Globe, Calendar, UserCheck, 
  CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Filter, MapPin, Briefcase, Heart, GraduationCap, Shield, Download,
  ClipboardList, Gift, PieChart as PieChartIcon, Upload, Image as ImageIcon, Database, Save, RefreshCw, Trash,
  Phone, Mail, Code, Info, Share2, Home, FileBadge, Stamp, Wifi, WifiOff, Star, HeartHandshake, Camera, Apple,
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, User, UserPlus, Video,
  FileSpreadsheet, CheckCheck, Flag, Smile, Copy, Bold, Italic, Type, Activity, Receipt, RotateCcw, Ban, Archive, Printer as PrinterIcon,
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic, HelpCircle, Lightbulb,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud, CloudRain, CloudSun, CloudLightning,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, Scale, FileInput, RotateCcw as RestoreIcon, FileSignature, CheckCircle2,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sun, Moon, Package, Flame, Minus, Newspaper, BookOpenText, IdCard, Badge, Car,
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders, CalendarClock, ArrowRight, Gamepad2, Terminal, Grid, HardDrive, Rocket, SlidersHorizontal
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { 
  getFirestore, initializeFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

import { preprocessImage, storeMedia, getMedia, clearMedia } from './lib/indexedDbService';
import { GippDocsIcon, GippSheetsIcon } from './components/GippOfficeIcons';
import { 
    GoogleGLogo, GoogleMeetIcon, GoogleSheetsIcon, GoogleDocsIcon, 
    GoogleTasksIcon, GoogleCalendarIcon, GoogleGmailIcon, GoogleFormsIcon, 
    GoogleClassroomIcon, GoogleAuthorizedBadge 
} from './components/GoogleIcons';
import { ChurchContext } from './context/ChurchContext';
export { ChurchContext };
export { 
    Button, FormInput, FormSelect, formatDateLocal, getTodayDate, 
    isValidCPF, formatCPF, copyToClipboard, resizeImageAndCompress, 
    playMenuSound, playNotificationSound 
} from './utils/sharedHelpers';
import { 
    Button, FormInput, FormSelect, formatDateLocal, getTodayDate, 
    isValidCPF, formatCPF, copyToClipboard, resizeImageAndCompress, 
    playMenuSound, playNotificationSound 
} from './utils/sharedHelpers';

// --- MODULARIZED IMPORTS ---
import { Win11PropertiesModal } from './components/Win11PropertiesModal';
import { InteractiveWindow } from './components/InteractiveWindow';
import { DelphiFlorenceLayout } from './components/DelphiFlorenceLayout';
import { Windows81Layout } from './components/Windows81Layout';
import { Windows11Layout } from './components/Windows11Layout';
import { GippClipperLayout } from './components/GippClipperLayout';
import { COURSES as IMPORTED_COURSES, CURSOS_DISPONIVEIS as IMPORTED_CURSOS_DISPONIVEIS } from './components/ModuleCoursesData';
import DashboardModule from './components/DashboardModule';
import { DEFAULT_PORTAL_PERMISSIONS } from './constants/portalPermissions';

const ModuleEmailAdmin = lazy(() => import('./components/ModuleEmailAdmin'));
const ModuleEmailMember = lazy(() => import('./components/ModuleEmailMember'));
const ModuleMarketingSocial = lazy(() => import('./components/ModuleMarketingSocial'));
const ModuleChangelog = lazy(() => import('./components/ModuleChangelog'));
const ModuleIgreja = lazy(() => import('./components/ModuleIgreja'));
const ModuleDesenvolvedor = lazy(() => import('./components/ModuleDesenvolvedor'));
const ModuleAssistenteAI = lazy(() => import('./components/ModuleAssistenteAI'));
const FloatingChatWidget = lazy(() => import('./components/ModuleAssistenteAI').then(m => ({ default: m.FloatingChatWidget })));
import { FloatingActionButton } from './components/FloatingActionButton';
const ModuleDevSuporte = lazy(() => import('./components/ModuleDevSuporte'));
const ModuleBiblia = lazy(() => import('./components/ModuleBiblia'));
const ModuleMembros = lazy(() => import('./components/ModuleMembros'));
const ModuleUsuarios = lazy(() => import('./components/ModuleUsuarios'));
const ModuleSalinhaKids = lazy(() => import('./components/ModuleSalinhaKids'));
const PortalFrequencia = lazy(() => import('./components/PortalFrequencia'));
const ModuleFinanceiro = lazy(() => import('./components/ModuleFinanceiro'));
const ModuleSecretariaIntegrada = lazy(() => import('./components/ModuleSecretariaIntegrada'));
const ModuleCertificados = lazy(() => import('./components/ModuleCertificados'));
const ModuleEBD = lazy(() => import('./components/ModuleEBD'));
const ModuleGestaoCursos = lazy(() => import('./components/ModuleGestaoCursos'));
const ModuleTeologia = lazy(() => import('./components/ModuleTeologia'));
const ModuleFormacaoObreiros = lazy(() => import('./components/ModuleFormacaoObreiros'));
const ModuleGoogleMeet = lazy(() => import('./components/ModuleGoogleMeet'));
const ModuleGoogleSheets = lazy(() => import('./components/ModuleGoogleSheets'));
const ModuleGoogleDocs = lazy(() => import('./components/ModuleGoogleDocs'));
const ModuleGoogleTasks = lazy(() => import('./components/ModuleGoogleTasks'));
const ModuleGoogleCalendar = lazy(() => import('./components/ModuleGoogleCalendar'));
const ModuleGmail = lazy(() => import('./components/ModuleGmail'));
const ModuleGoogleForms = lazy(() => import('./components/ModuleGoogleForms'));
const ModuleGoogleClassroom = lazy(() => import('./components/ModuleGoogleClassroom'));
const ModuleRedeSocial = lazy(() => import('./components/ModuleRedeSocial'));
const ModuleGippDocs = lazy(() => import('./components/ModuleGippDocs'));
const ModuleGippPlanilhas = lazy(() => import('./components/ModuleGippPlanilhas'));
const ModuleConfiguracoesGerais = lazy(() => import('./components/ModuleConfiguracoesGerais'));
const DiagnosticsDashboard = lazy(() => import('./components/DiagnosticsDashboard').then(m => ({ default: m.DiagnosticsDashboard })));
const ModuleConfiguracoesSistemas = lazy(() => import('./components/ModuleConfiguracoesSistemas'));
const ModuleConfigVisual = lazy(() => import('./components/ModuleConfigVisual'));
const ModuleBackup = lazy(() => import('./components/ModuleBackup'));
const ModuleUtilitarios = lazy(() => import('./components/ModuleUtilitarios'));
const ModuleConciliacaoBancaria = lazy(() => import('./components/ModuleConciliacaoBancaria'));
const ModulePortalPastor = lazy(() => import('./components/ModulePortalPastor'));
const ModulePortalTesoureiro = lazy(() => import('./components/ModulePortalTesoureiro'));
const ModuleSobre = lazy(() => import('./components/ModuleSobre'));
const ModuleRelatorios = lazy(() => import('./components/ModuleRelatorios'));
const ModuleMinisterios = lazy(() => import('./components/ModuleMinisterios'));
const ModuleFamilia = lazy(() => import('./components/ModuleFamilia'));
const ModuleMissoes = lazy(() => import('./components/ModuleMissoes'));
const ModuleCarnes = lazy(() => import('./components/ModuleCarnes'));
const ModuleLixeira = lazy(() => import('./components/ModuleLixeira'));
const ModuleAcessosPortal = lazy(() => import('./components/ModuleAcessosPortal'));
const ModuleCredencial = lazy(() => import('./components/ModuleCredencial'));
const ModuleCarteirinha = lazy(() => import('./components/ModuleCarteirinha'));
const ModuleDPContabilidade = lazy(() => import('./components/ModuleDPContabilidade'));
const ModuleAuditoria = lazy(() => import('./components/ModuleAuditoria'));
const ModuleVisitantes = lazy(() => import('./components/ModuleVisitantes'));
const ModulePatrimonio = lazy(() => import('./components/ModulePatrimonio'));
const ModuleFrotas = lazy(() => import('./components/ModuleFrotas'));
const ModuleCelulas = lazy(() => import('./components/ModuleCelulas'));
const ModuleBoletim = lazy(() => import('./components/ModuleBoletim'));
const ModuleLivroAtas = lazy(() => import('./components/ModuleLivroAtas'));
const ModuleInterativo = lazy(() => import('./components/ModuleInterativo'));
const ModuleManualUsuario = lazy(() => import('./components/ModuleManualUsuario'));
const ModuleAmparoLegal = lazy(() => import('./components/ModuleAmparoLegal'));
const ModuleRegistroSoftware = lazy(() => import('./components/ModuleRegistroSoftware'));
const ModuleMensagensLote = lazy(() => import('./components/ModuleMensagensLote'));
const ModuleQrCheckin = lazy(() => import('./components/ModuleQrCheckin'));
import { LockScreenModal } from './components/LockScreenModal';
import { MobileBottomDock } from './components/MobileBottomDock';
import { InteractiveMagazineView } from './components/InteractiveMagazineView';
import { requestAppFullscreen } from './lib/performanceHelpers';
// ----------------------------


export const CachedImage = memo(({ src, cacheKey, className, alt = "", referrerPolicy = "no-referrer", ...props }: any) => {
  const [localSrc, setLocalSrc] = useState<string | null>(src);

  useEffect(() => {
    if (!src) {
      setLocalSrc(null);
      return;
    }

    let isMounted = true;
    const finalKey = cacheKey || (src.startsWith('data:') ? `data_hash_${src.substring(0, 80)}` : src);

    if (src.startsWith('data:')) {
      setLocalSrc(src);
      storeMedia(finalKey, src).catch(() => {});
      return;
    }

    getMedia(finalKey)
      .then((cached) => {
        if (!isMounted) return;
        if (cached) {
          setLocalSrc(cached);
        } else {
          setLocalSrc(src);
          if (src.startsWith('http')) {
            fetch(src, { mode: 'cors' })
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (reader.result && isMounted) {
                    storeMedia(finalKey, reader.result as string).catch(() => {});
                  }
                };
                reader.readAsDataURL(blob);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar do cache IndexedDB:", err);
        if (isMounted) setLocalSrc(src);
      });

    return () => {
      isMounted = false;
    };
  }, [src, cacheKey]);

  if (!localSrc) return null;
  return <img src={localSrc} className={className} alt={alt} referrerPolicy={referrerPolicy} {...props} />;
});

export const callGeminiAI = async (prompt, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: String(prompt) })
      });
      
      if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.text || "N√£o foi poss√≠vel gerar resposta. Tente novamente.";
    } catch (error) {
      if (i === retries - 1) return `Erro na IA: ${error.message}`;
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

const fallbackConfig = {
  apiKey: "AIzaSyBFdfMUErNmooLwIosiacr5gRrlrSefdMk",
  authDomain: "gipp-sistemas.firebaseapp.com",
  projectId: "gipp-sistemas",
  storageBucket: "gipp-sistemas.firebasestorage.app",
  messagingSenderId: "229490807877",
  appId: "1:229490807877:web:9ef442ee1012050fcbbf2c"
};

const rawConfig = typeof (window as any).__firebase_config !== 'undefined' ? (window as any).__firebase_config : '{}';
const firebaseConfig = rawConfig !== '{}' ? JSON.parse(rawConfig) : fallbackConfig;

let app, auth, dbFirestore;
let firebaseSetupError = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  dbFirestore = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
  try {
      enableIndexedDbPersistence(dbFirestore).catch((err) => {
          if (err.code == 'failed-precondition') console.warn('M√∫ltiplas abas abertas, persist√™ncia offline ativada apenas numa.');
          else if (err.code == 'unimplemented') console.warn('O navegador n√£o suporta persist√™ncia offline.');
      });
  } catch (e) { console.warn('Persist√™ncia offline j√° inicializada ou n√£o suportada.'); }
} catch (error) {
  console.error("Erro cr√≠tico na inicializa√ß√£o do Firebase:", error);
  firebaseSetupError = true;
}

const urlParams = new URLSearchParams(window.location.search);
let urlAppId = urlParams.get('id');

if (urlAppId) {
    localStorage.setItem('gipp_saved_app_id', urlAppId);
    localStorage.setItem('gipp_saved_saas_url', window.location.origin + window.location.pathname + window.location.search);
} else {
    const savedAppId = localStorage.getItem('gipp_saved_app_id');
    if (savedAppId && savedAppId !== 'default-app-id') {
        urlAppId = savedAppId;
        try {
            const newSearch = new URLSearchParams(window.location.search);
            newSearch.set('id', savedAppId);
            const newUrl = window.location.pathname + '?' + newSearch.toString() + window.location.hash;
            window.history.replaceState(null, '', newUrl);
        } catch (e) {
            console.warn("Could not write dynamic application query parameter:", e);
        }
    }
}

const baseAppId = (typeof (window as any).__app_id !== 'undefined' && (window as any).__app_id) ? String((window as any).__app_id) : 'default-app-id';
const appId = urlAppId || baseAppId;

const DynamicTheme = ({ color }) => {
    if (!color) return null;
    return (
        <style>{`
            :root { --primary: ${color}; }
            .bg-indigo-600, .bg-emerald-600 { background-color: ${color} !important; }
            .bg-indigo-500, .bg-emerald-500 { background-color: ${color} !important; }
            .text-indigo-600, .text-emerald-600 { color: ${color} !important; }
            .text-indigo-500, .text-emerald-500 { color: ${color} !important; }
            .border-indigo-600, .border-emerald-600 { border-color: ${color} !important; }
            .bg-indigo-50, .bg-emerald-50 { background-color: ${color}15 !important; }
            .bg-indigo-100, .bg-emerald-100 { background-color: ${color}25 !important; }
            .border-indigo-100, .border-emerald-100, .border-indigo-200, .border-emerald-200 { border-color: ${color}40 !important; }
            .hover\\:bg-indigo-50:hover, .hover\\:bg-emerald-50:hover { background-color: ${color}20 !important; }
            .hover\\:bg-indigo-600:hover, .hover\\:bg-emerald-600:hover, .hover\\:bg-emerald-500:hover, .hover\\:bg-indigo-500:hover { background-color: ${color} !important; filter: brightness(0.85); }
            .hover\\:text-indigo-600:hover, .hover\\:text-emerald-600:hover { color: ${color} !important; filter: brightness(0.85); }
            .ring-indigo-500, .ring-emerald-500 { --tw-ring-color: ${color} !important; }
            .focus\\:ring-indigo-500:focus, .focus\\:border-emerald-500:focus { --tw-ring-color: ${color} !important; border-color: ${color} !important; }
            .shadow-indigo-500\\/30, .shadow-emerald-500\\/30 { box-shadow: 0 10px 15px -3px ${color}66, 0 4px 6px -4px ${color}66 !important; }
            .from-indigo-600, .from-emerald-500, .from-indigo-500 { --tw-gradient-from: ${color} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
            .to-purple-600, .to-teal-600 { --tw-gradient-to: ${color} !important; filter: brightness(0.8); }
            .via-purple-600 { --tw-gradient-stops: var(--tw-gradient-from), ${color}, var(--tw-gradient-to) !important; }
            .from-indigo-900 { --tw-gradient-from: ${color} !important; filter: brightness(0.3); }
        `}</style>
    );
};

const DynamicPrintStyles = ({ orientation, marginType, mode }: { orientation: 'portrait' | 'landscape'; marginType: string; mode: string | null }) => {
    const isCert = mode && mode.startsWith('cert_');
    let top = '30mm', left = '30mm', bottom = '20mm', right = '20mm';
    
    if (isCert) {
        top = '0mm';
        left = '0mm';
        bottom = '0mm';
        right = '0mm';
    } else if (marginType === 'moderada') {
        top = '20mm'; left = '20mm'; bottom = '20mm'; right = '20mm';
    } else if (marginType === 'estreita') {
        top = '15mm'; left = '15mm'; bottom = '15mm'; right = '15mm';
    }

    const pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';

    return (
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                @page { 
                    margin-top: ${top} !important;
                    margin-left: ${left} !important;
                    margin-bottom: ${bottom} !important;
                    margin-right: ${right} !important;
                    size: ${pageSize} !important; 
                }
                @page landscape-page { 
                    size: A4 landscape !important; 
                    margin-top: ${top} !important;
                    margin-left: ${left} !important;
                    margin-bottom: ${bottom} !important;
                    margin-right: ${right} !important;
                }
                
                .print-landscape { 
                    page: landscape-page !important; 
                }
                
                .print-portrait {
                    page: A4 portrait !important;
                }

                .print-area {
                    display: block !important;
                }

                /* Override padding of standard print blocks inside print area during physical print */
                /* so that printing doesn't double-apply the margins on top of @page */
                .print-area .print-block {
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            }
        `}} />
    );
};

const OsThemeStyles = () => (
    <style>{`
        body[data-os-theme="win11"] { 
            background-color: #f3f4f6; 
            font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif !important; 
        }
        body[data-os-theme="win11"].theme-dark { 
            background-color: #101015 !important; 
        }

        @keyframes win11-start-menu-up {
            from {
                opacity: 0;
                transform: translateY(16px) scale(0.97);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        .animate-slideUp {
            animation: win11-start-menu-up 0.22s cubic-bezier(0.1, 0.9, 0.15, 1) forwards !important;
        }

        body[data-os-theme="win11"] ::-webkit-scrollbar {
            width: 8px !important;
            height: 8px !important;
        }
        body[data-os-theme="win11"] ::-webkit-scrollbar-track {
            background: transparent !important;
        }
        body[data-os-theme="win11"] ::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 100, 0.25) !important;
            border: 2px solid transparent !important;
            background-clip: padding-box !important;
            border-radius: 99px !important;
        }
        body[data-os-theme="win11"] ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 100, 100, 0.45) !important;
            border: 2px solid transparent !important;
            background-clip: padding-box !important;
        }

        /* Fluent Acrylic glass panel styling */
        body[data-os-theme="win11"] .glass-modern, 
        body[data-os-theme="win11"] .glass-card, 
        body[data-os-theme="win11"] .glass-panel,
        body[data-os-theme="win11"] .bg-white/80,
        body[data-os-theme="win11"] .bg-slate-50/80 { 
            background: rgba(255, 255, 255, 0.75) !important; 
            backdrop-filter: blur(40px) saturate(180%) !important; 
            border: 1px solid rgba(255, 255, 255, 0.5) !important; 
            border-radius: 12px !important; 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important; 
            color: #1f2937 !important;
        }
        body[data-os-theme="win11"].theme-dark .glass-modern, 
        body[data-os-theme="win11"].theme-dark .glass-card,
        body[data-os-theme="win11"].theme-dark .glass-panel,
        body[data-os-theme="win11"].theme-dark .bg-[#24242b],
        body[data-os-theme="win11"].theme-dark .bg-[#1a1a1f] { 
            background: rgba(32, 32, 40, 0.8) !important; 
            backdrop-filter: blur(40px) saturate(180%) !important; 
            border: 1px solid rgba(255, 255, 255, 0.07) !important; 
            border-radius: 12px !important; 
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4) !important; 
            color: #f3f4f6 !important;
        }

        body[data-os-theme="win11"] button { 
            border-radius: 6px !important; 
            font-weight: 500 !important;
            transition: all 0.15s ease-out !important;
        }

        /* Fluent Inputs */
        body[data-os-theme="win11"] input, 
        body[data-os-theme="win11"] select, 
        body[data-os-theme="win11"] textarea { 
            background-color: rgba(255, 255, 255, 0.8) !important; 
            border: 1px solid rgba(0, 0, 0, 0.15) !important; 
            border-bottom: 2px solid rgba(0, 0, 0, 0.4) !important; 
            color: #1f2937 !important;
            border-radius: 4px !important; 
            padding: 8px 12px !important;
            transition: all 0.15s ease-out !important;
        }
        body[data-os-theme="win11"].theme-dark input, 
        body[data-os-theme="win11"].theme-dark select, 
        body[data-os-theme="win11"].theme-dark textarea { 
            background-color: rgba(20, 20, 25, 0.7) !important; 
            border: 1px solid rgba(255, 255, 255, 0.1) !important; 
            border-bottom: 2px solid rgba(255, 255, 255, 0.3) !important; 
            color: #f3f4f6 !important;
        }
        body[data-os-theme="win11"] input:focus, 
        body[data-os-theme="win11"] select:focus, 
        body[data-os-theme="win11"] textarea:focus { 
            border-color: #0078d4 !important;
            border-bottom: 2px solid #0078d4 !important;
            outline: none !important;
            box-shadow: none !important;
        }

        body[data-os-theme="win11"] svg { 
            stroke-width: 1.5px !important; 
        }

        body[data-os-theme="win95"] { background-color: #008080 !important; background-image: none !important; font-family: 'Pixelated', 'Courier New', Courier, monospace !important; }
        body[data-os-theme="win95"] * { border-radius: 0 !important; box-shadow: none !important; backdrop-filter: none !important; text-transform: uppercase !important; }
        body[data-os-theme="win95"] .glass-modern, body[data-os-theme="win95"] .glass-card, body[data-os-theme="win95"] .glass-panel, body[data-os-theme="win95"] aside, body[data-os-theme="win95"] .bg-white { background-color: #c0c0c0 !important; border-top: 2px solid #ffffff !important; border-left: 2px solid #ffffff !important; border-right: 2px solid #000000 !important; border-bottom: 2px solid #000000 !important; color: #000000 !important; }
        body[data-os-theme="win95"] .border-b.border-white\\/30, body[data-os-theme="win95"] .border-b.border-slate-100 { background-color: #000080 !important; color: #ffffff !important; border: none !important; }
        body[data-os-theme="win95"] h1, body[data-os-theme="win95"] h2, body[data-os-theme="win95"] h3 { color: #000000 !important; }
        body[data-os-theme="win95"] .border-b.border-white\\/30 h2, body[data-os-theme="win95"] .border-b.border-slate-100 h3 { color: #ffffff !important; }
        body[data-os-theme="win95"] button, body[data-os-theme="win95"] button.bg-gradient-to-r { background: #c0c0c0 !important; border-top: 2px solid #ffffff !important; border-left: 2px solid #ffffff !important; border-right: 2px solid #000000 !important; border-bottom: 2px solid #000000 !important; color: #000000 !important; font-weight: bold !important; }
        body[data-os-theme="win95"] button:active, body[data-os-theme="win95"] button.bg-gradient-to-r:active { border-top: 2px solid #000000 !important; border-left: 2px solid #000000 !important; border-right: 2px solid #ffffff !important; border-bottom: 2px solid #ffffff !important; }
        body[data-os-theme="win95"] input, body[data-os-theme="win95"] select, body[data-os-theme="win95"] textarea { background: #ffffff !important; border-top: 2px solid #000000 !important; border-left: 2px solid #000000 !important; border-right: 2px solid #ffffff !important; border-bottom: 2px solid #ffffff !important; color: #000000 !important; }
        body[data-os-theme="win95"] svg { stroke-width: 2px !important; stroke-linecap: square !important; stroke-linejoin: miter !important; shape-rendering: crispEdges !important; color: #000000 !important; filter: drop-shadow(1px 1px 0px #ffffff); }
        body[data-os-theme="win95"] .border-b.border-white\\/30 svg, body[data-os-theme="win95"] .border-b.border-slate-100 svg, body[data-os-theme="win95"] .bg-slate-900 svg { color: #ffffff !important; filter: drop-shadow(1px 1px 0px #000000); }

        body[data-os-theme="gipp_clipper"], body[data-os-theme="msdos"] { background-color: #0000AA !important; background-image: none !important; font-family: 'VT323', 'Consolas', 'Lucida Console', 'Courier New', monospace !important; color: #ffffff !important; letter-spacing: 0.5px !important; }
        body[data-os-theme="gipp_clipper"] *, body[data-os-theme="msdos"] * { border-radius: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
        body[data-os-theme="gipp_clipper"] [class*="bg-"], body[data-os-theme="msdos"] [class*="bg-"] { background-color: #000088 !important; background-image: none !important; border-color: #00AAAA !important; color: #ffffff !important; }
        body[data-os-theme="gipp_clipper"] [class*="border-"], body[data-os-theme="msdos"] [class*="border-"] { border-color: #00AAAA !important; }
        body[data-os-theme="gipp_clipper"] [class*="text-"], body[data-os-theme="msdos"] [class*="text-"] { color: #ffffff !important; text-shadow: none !important; -webkit-text-fill-color: #ffffff !important; }
        body[data-os-theme="gipp_clipper"] h1, body[data-os-theme="gipp_clipper"] h2, body[data-os-theme="gipp_clipper"] h3, body[data-os-theme="gipp_clipper"] h4, body[data-os-theme="msdos"] h1, body[data-os-theme="msdos"] h2, body[data-os-theme="msdos"] h3, body[data-os-theme="msdos"] h4 { color: #FFFF55 !important; -webkit-text-fill-color: #FFFF55 !important; font-weight: bold !important; text-shadow: none !important; }
        body[data-os-theme="gipp_clipper"] button, body[data-os-theme="msdos"] button { background-color: #00AAAA !important; border: 1px solid #000000 !important; color: #000000 !important; -webkit-text-fill-color: #000000 !important; font-weight: bold !important; transition: none !important; }
        body[data-os-theme="gipp_clipper"] button *, body[data-os-theme="msdos"] button * { color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
        body[data-os-theme="gipp_clipper"] button:hover, body[data-os-theme="msdos"] button:hover { background-color: #ffffff !important; color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
        body[data-os-theme="gipp_clipper"] input, body[data-os-theme="gipp_clipper"] select, body[data-os-theme="gipp_clipper"] textarea, body[data-os-theme="msdos"] input, body[data-os-theme="msdos"] select, body[data-os-theme="msdos"] textarea { background-color: #000055 !important; border: 1px solid #00AAAA !important; color: #55FFFF !important; -webkit-text-fill-color: #55FFFF !important; outline: none !important; }
        body[data-os-theme="gipp_clipper"] input:focus, body[data-os-theme="gipp_clipper"] select:focus, body[data-os-theme="gipp_clipper"] textarea:focus, body[data-os-theme="msdos"] input:focus, body[data-os-theme="msdos"] select:focus, body[data-os-theme="msdos"] textarea:focus { background-color: #002266 !important; color: #FFFF55 !important; -webkit-text-fill-color: #FFFF55 !important; border-color: #FFFF55 !important; }
        body[data-os-theme="gipp_clipper"] table, body[data-os-theme="msdos"] table { border: 2px double #00AAAA !important; background-color: #000088 !important; }
        body[data-os-theme="gipp_clipper"] tr, body[data-os-theme="msdos"] tr { border-bottom: 1px solid #00AAAA !important; }
        body[data-os-theme="gipp_clipper"] tr:hover td, body[data-os-theme="msdos"] tr:hover td { background-color: #00AAAA !important; color: #000000 !important; }
        body[data-os-theme="gipp_clipper"] tr:hover td *, body[data-os-theme="msdos"] tr:hover td * { color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
        body[data-os-theme="gipp_clipper"] th, body[data-os-theme="msdos"] th { color: #FFFF55 !important; -webkit-text-fill-color: #FFFF55 !important; background-color: #000055 !important; border-bottom: 2px solid #00AAAA !important; }
        body[data-os-theme="gipp_clipper"] .glass-modern, body[data-os-theme="gipp_clipper"] .glass-card, body[data-os-theme="gipp_clipper"] .glass-panel, body[data-os-theme="gipp_clipper"] .bg-white, body[data-os-theme="gipp_clipper"] .bg-slate-50, body[data-os-theme="msdos"] .glass-modern, body[data-os-theme="msdos"] .glass-card, body[data-os-theme="msdos"] .glass-panel, body[data-os-theme="msdos"] .bg-white, body[data-os-theme="msdos"] .bg-slate-50 { background-color: #000088 !important; border: 3px double #00AAAA !important; }
        body[data-os-theme="gipp_clipper"] aside, body[data-os-theme="msdos"] aside { border-right: 3px double #00AAAA !important; background-color: #000055 !important; }

        body[data-os-theme="premium_black"] { background-color: #050505; background-image: radial-gradient(circle at top right, #1a1a1a 0%, #000000 70%), radial-gradient(circle at bottom left, #111111 0%, #000000 70%) !important; font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif !important; color: #ffffff !important; }
        body[data-os-theme="premium_black"] .glass-modern, body[data-os-theme="premium_black"] .glass-card, body[data-os-theme="premium_black"] .glass-panel, body[data-os-theme="premium_black"] aside, body[data-os-theme="premium_black"] .bg-white, body[data-os-theme="premium_black"] .bg-slate-50 { background: linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(5, 5, 5, 0.95) 100%) !important; backdrop-filter: blur(30px) saturate(200%) !important; border: 1px solid rgba(212, 175, 55, 0.4) !important; box-shadow: 0 20px 50px -10px rgba(0,0,0,1), inset 0 1px 0 rgba(212, 175, 55, 0.2), 0 0 15px rgba(212, 175, 55, 0.05) !important; color: #ffffff !important; }
        body[data-os-theme="premium_black"] .glass-card:hover, body[data-os-theme="premium_black"] tr:hover td { background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%) !important; border-color: rgba(212, 175, 55, 0.8) !important; box-shadow: 0 0 25px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.1) !important; transform: translateY(-3px); }
        body[data-os-theme="premium_black"] h1, body[data-os-theme="premium_black"] h2, body[data-os-theme="premium_black"] h3, body[data-os-theme="premium_black"] .text-slate-800 { color: #f8f9fa !important; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        body[data-os-theme="premium_black"] .text-slate-600, body[data-os-theme="premium_black"] .text-slate-500 { color: #a1a1aa !important; }
        body[data-os-theme="premium_black"] .text-gradient, body[data-os-theme="premium_black"] .text-indigo-600, body[data-os-theme="premium_black"] .text-emerald-600 { background: linear-gradient(135deg, #FFD700 0%, #FDF5E6 50%, #D4AF37 100%) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; color: transparent !important; text-shadow: 0 0 15px rgba(212, 175, 55, 0.4) !important; }
        body[data-os-theme="premium_black"] svg { color: #D4AF37 !important; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.9)); }
        body[data-os-theme="premium_black"] button.bg-gradient-to-r, body[data-os-theme="premium_black"] .bg-indigo-600, body[data-os-theme="premium_black"] .bg-emerald-500 { background: linear-gradient(to bottom, #1f1f1f 0%, #0a0a0a 100%) !important; border: 1px solid rgba(212, 175, 55, 0.8) !important; color: #FFD700 !important; box-shadow: 0 4px 15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 10px rgba(212,175,55,0.2) !important; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
        body[data-os-theme="premium_black"] button.bg-gradient-to-r:hover { background: linear-gradient(to bottom, #333333 0%, #1a1a1a 100%) !important; border-color: #FFD700 !important; box-shadow: 0 0 25px rgba(212, 175, 55, 0.5) !important; }
        body[data-os-theme="premium_black"] input, body[data-os-theme="premium_black"] select, body[data-os-theme="premium_black"] textarea { background-color: rgba(5, 5, 5, 0.8) !important; border: 1px solid rgba(212, 175, 55, 0.3) !important; color: #FFD700 !important; box-shadow: inset 0 2px 5px rgba(0,0,0,0.8) !important; }
        body[data-os-theme="premium_black"] input:focus, body[data-os-theme="premium_black"] select:focus { border-color: #FFD700 !important; box-shadow: 0 0 15px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(0,0,0,0.5) !important; background-color: rgba(10, 10, 10, 0.9) !important; }
        body[data-os-theme="premium_black"] table th { background-color: rgba(15, 15, 15, 0.9) !important; border-bottom: 2px solid rgba(212, 175, 55, 0.5) !important; color: #FFD700 !important; }
        body[data-os-theme="premium_black"] table td { border-bottom: 1px solid rgba(212, 175, 55, 0.1) !important; color: #e2e8f0 !important; }
        body[data-os-theme="premium_black"] .login-left-hero { background: linear-gradient(to bottom right, #111111, #000000) !important; border-right: 1px solid rgba(212, 175, 55, 0.3) !important; }
        body[data-os-theme="premium_black"] .login-gradient-text { background-image: linear-gradient(to right, #FFD700, #D4AF37) !important; -webkit-background-clip: text !important; color: transparent !important; text-shadow: 0 0 20px rgba(212, 175, 55, 0.3) !important; }
        body[data-os-theme="premium_black"] .login-accent-text { color: #D4AF37 !important; opacity: 0.9 !important; }

        body[data-os-theme="futuristic"] { 
            background-color: #03001e; 
            background-image: radial-gradient(circle at top right, #730075 0%, #03001e 70%), radial-gradient(circle at bottom left, #0575e6 0%, #03001e 70%) !important; 
            font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif !important; 
            color: #e2e8f0 !important; 
        }
        body[data-os-theme="futuristic"] .glass-modern, 
        body[data-os-theme="futuristic"] .glass-card, 
        body[data-os-theme="futuristic"] .glass-panel, 
        body[data-os-theme="futuristic"] aside, 
        body[data-os-theme="futuristic"] .bg-white, 
        body[data-os-theme="futuristic"] .bg-slate-50 { 
            background: linear-gradient(135deg, rgba(10, 10, 25, 0.8) 0%, rgba(3, 3, 10, 0.95) 100%) !important; 
            backdrop-filter: blur(25px) saturate(220%) !important; 
            border: 1px solid rgba(0, 240, 255, 0.4) !important; 
            box-shadow: 0 15px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(0, 240, 255, 0.2), 0 0 15px rgba(0, 240, 255, 0.1) !important; 
            color: #e2e8f0 !important; 
        }
        body[data-os-theme="futuristic"] .glass-card:hover, 
        body[data-os-theme="futuristic"] tr:hover td { 
            background: linear-gradient(135deg, rgba(20, 20, 45, 0.9) 0%, rgba(8, 8, 25, 0.98) 100%) !important; 
            border-color: rgba(255, 0, 127, 0.75) !important; 
            box-shadow: 0 0 25px rgba(255, 0, 127, 0.45), inset 0 1px 0 rgba(255,255,255,0.1) !important; 
            transform: translateY(-3px); 
        }
        body[data-os-theme="futuristic"] h1, 
        body[data-os-theme="futuristic"] h2, 
        body[data-os-theme="futuristic"] h3, 
        body[data-os-theme="futuristic"] .text-slate-800 { 
            color: #ffffff !important; 
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.6) !important; 
        }
        body[data-os-theme="futuristic"] .text-slate-600, 
        body[data-os-theme="futuristic"] .text-slate-500 { 
            color: #94a3b8 !important; 
        }
        body[data-os-theme="futuristic"] .text-gradient, 
        body[data-os-theme="futuristic"] .text-indigo-600, 
        body[data-os-theme="futuristic"] .text-emerald-600 { 
            background: linear-gradient(135deg, #00f0ff 0%, #ff007f 100%) !important; 
            -webkit-background-clip: text !important; 
            -webkit-text-fill-color: transparent !important; 
            color: transparent !important; 
            text-shadow: 0 0 15px rgba(0, 240, 255, 0.35) !important; 
        }
        body[data-os-theme="futuristic"] svg { 
            color: #00f0ff !important; 
            filter: drop-shadow(0px 0px 8px rgba(0, 240, 255, 0.7)); 
        }
        body[data-os-theme="futuristic"] button.bg-gradient-to-r, 
        body[data-os-theme="futuristic"] .bg-indigo-600, 
        body[data-os-theme="futuristic"] .bg-emerald-500 { 
            background: linear-gradient(to right, #00f0ff 0%, #ff007f 100%) !important; 
            border: 1px solid rgba(255, 255, 255, 0.2) !important; 
            color: #ffffff !important; 
            box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important; 
            text-shadow: 0 1px 3px rgba(0,0,0,0.5); 
        }
        body[data-os-theme="futuristic"] button.bg-gradient-to-r:hover { 
            filter: brightness(1.2) !important; 
            box-shadow: 0 0 25px rgba(255, 0, 127, 0.6) !important; 
        }
        body[data-os-theme="futuristic"] input, 
        body[data-os-theme="futuristic"] select, 
        body[data-os-theme="futuristic"] textarea { 
            background-color: rgba(5, 5, 15, 0.85) !important; 
            border: 1px solid rgba(0, 240, 255, 0.35) !important; 
            color: #00f0ff !important; 
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 0 5px rgba(0,240,255,0.1) !important; 
        }
        body[data-os-theme="futuristic"] input:focus, 
        body[data-os-theme="futuristic"] select:focus { 
            border-color: #ff007f !important; 
            box-shadow: 0 0 15px rgba(255, 0, 127, 0.5), inset 0 2px 4px rgba(0,0,0,0.5) !important; 
            background-color: rgba(10, 10, 25, 0.9) !important; 
        }
        body[data-os-theme="futuristic"] table th { 
            background-color: rgba(10, 10, 30, 0.95) !important; 
            border-bottom: 2px solid rgba(0, 240, 255, 0.5) !important; 
            color: #00f0ff !important; 
        }
        body[data-os-theme="futuristic"] table td { 
            border-bottom: 1px solid rgba(0, 240, 255, 0.1) !important; 
            color: #e2e8f0 !important; 
        }
        body[data-os-theme="futuristic"] .login-left-hero { 
            background: linear-gradient(to bottom right, #03001e, #120012) !important; 
            border-right: 1px solid rgba(0, 240, 255, 0.3) !important; 
        }
        body[data-os-theme="futuristic"] .login-gradient-text { 
            background-image: linear-gradient(to right, #00f0ff, #ff007f) !important; 
            -webkit-background-clip: text !important; 
            color: transparent !important; 
            text-shadow: 0 0 20px rgba(0, 240, 255, 0.4) !important; 
        }
        body[data-os-theme="futuristic"] .login-accent-text { 
            color: #ff007f !important; 
            text-shadow: 0 0 8px rgba(255, 0, 127, 0.4) !important; 
            opacity: 0.9 !important; 
        }

        /* THEME: LINUX MODERN UBUNTU / GNOME */
        body[data-os-theme="linux"] { 
            background-color: #1f0b1a !important; 
            color: #f5f0f3 !important; 
            font-family: 'Ubuntu', 'Inter', system-ui, sans-serif !important; 
        }
        
        /* Modern Linux Scrollbar override */
        body[data-os-theme="linux"] ::-webkit-scrollbar {
            width: 8px !important;
            height: 8px !important;
        }
        body[data-os-theme="linux"] ::-webkit-scrollbar-track {
            background: #150d14 !important;
            border-radius: 4px !important;
        }
        body[data-os-theme="linux"] ::-webkit-scrollbar-thumb {
            background: #df542c !important;
            border-radius: 4px !important;
        }
        body[data-os-theme="linux"] ::-webkit-scrollbar-thumb:hover {
            background: #f0643b !important;
        }

        body[data-os-theme="linux"] .glass-modern, 
        body[data-os-theme="linux"] .glass-card, 
        body[data-os-theme="linux"] .glass-panel, 
        body[data-os-theme="linux"] aside, 
        body[data-os-theme="linux"] .bg-white, 
        body[data-os-theme="linux"] .bg-slate-50,
        body[data-os-theme="linux"] .bg-white\/80,
        body[data-os-theme="linux"] .bg-slate-50\/80 { 
            background: rgba(32, 24, 30, 0.90) !important; 
            backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important; 
            border-radius: 12px !important; 
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important; 
            color: #f5f0f3 !important;
        }

        body[data-os-theme="linux"] .glass-card:hover,
        body[data-os-theme="linux"] tr:hover td {
            background-color: rgba(223, 84, 44, 0.05) !important;
        }

        /* Text colors and typography in Linux */
        body[data-os-theme="linux"] h1, 
        body[data-os-theme="linux"] h2, 
        body[data-os-theme="linux"] h3, 
        body[data-os-theme="linux"] .text-slate-800,
        body[data-os-theme="linux"] .text-slate-900,
        body[data-os-theme="linux"] .text-slate-700 { 
            color: #f7f4f6 !important; 
        }
        body[data-os-theme="linux"] .text-slate-600, 
        body[data-os-theme="linux"] .text-slate-500,
        body[data-os-theme="linux"] .text-slate-400 { 
            color: rgba(247, 244, 246, 0.65) !important; 
        }

        /* Replace violet/indigo with Linux Orange / Aubergine gradients */
        body[data-os-theme="linux"] .text-gradient,
        body[data-os-theme="linux"] .text-indigo-600,
        body[data-os-theme="linux"] .text-indigo-500 {
            background: linear-gradient(135deg, #df542c, #aea79f) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            color: #df542c !important;
        }
        
        body[data-os-theme="linux"] .bg-indigo-50,
        body[data-os-theme="linux"] .bg-indigo-100\/50 {
            background-color: rgba(223, 84, 44, 0.08) !important;
            color: #df542c !important;
        }
        
        body[data-os-theme="linux"] .border-indigo-100 {
            border-color: rgba(223, 84, 44, 0.15) !important;
        }

        body[data-os-theme="linux"] svg { 
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
            color: #aea79f !important;
        }
        body[data-os-theme="linux"] .text-indigo-600 svg,
        body[data-os-theme="linux"] .text-indigo-500 svg,
        body[data-os-theme="linux"] .bg-indigo-600 svg {
            color: #ffffff !important;
        }

        /* Linux Buttons */
        body[data-os-theme="linux"] button.bg-gradient-to-r, 
        body[data-os-theme="linux"] .bg-indigo-600, 
        body[data-os-theme="linux"] .bg-indigo-500,
        body[data-os-theme="linux"] .bg-emerald-500,
        body[data-os-theme="linux"] .bg-emerald-600 { 
            background: linear-gradient(180deg, #df542c 0%, #c54421 100%) !important; 
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            box-shadow: 0 4px 12px rgba(223, 84, 44, 0.2) !important; 
            color: #ffffff !important; 
            border-radius: 8px !important;
            transition: all 0.2s ease-in-out !important;
        }
        body[data-os-theme="linux"] button.bg-gradient-to-r:hover,
        body[data-os-theme="linux"] .bg-indigo-600:hover,
        body[data-os-theme="linux"] .bg-indigo-500:hover { 
            background: linear-gradient(180deg, #f0643b 0%, #df542c 100%) !important; 
            box-shadow: 0 6px 16px rgba(223, 84, 44, 0.3) !important; 
            transform: translateY(-1px);
        }

        /* Linux Input Fields */
        body[data-os-theme="linux"] input, 
        body[data-os-theme="linux"] select, 
        body[data-os-theme="linux"] textarea { 
            background-color: #150d14 !important; 
            border: 1px solid rgba(255, 255, 255, 0.1) !important; 
            color: #ffffff !important; 
            border-radius: 8px !important; 
            padding: 10px 14px !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important; 
            transition: all 0.2s ease-in-out !important;
        }
        body[data-os-theme="linux"] input:focus, 
        body[data-os-theme="linux"] select:focus,
        body[data-os-theme="linux"] textarea:focus { 
            border-color: #df542c !important; 
            box-shadow: 0 0 0 3px rgba(223, 84, 44, 0.2) !important; 
            background-color: #150d14 !important; 
        }

        /* Tables */
        body[data-os-theme="linux"] table th { 
            background-color: #1a1119 !important; 
            border-bottom: 2px solid #df542c !important; 
            color: #df542c !important; 
            font-weight: bold !important;
        }
        body[data-os-theme="linux"] table td { 
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; 
            color: #e2e8f0 !important; 
        }

        /* Modern GNOME Shell Windows Decoration for Modals */
        body[data-os-theme="linux"] .interactive-window-backdrop {
            background-color: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(4px) !important;
        }
        body[data-os-theme="linux"] .interactive-window-main {
            background: #221820 !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 12px !important;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5) !important;
            overflow: hidden;
        }
        body[data-os-theme="linux"] .interactive-window-header {
            background: #1b1118 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
            padding: 12px 18px !important;
        }

        /* =========================================================================
           THEME: GIPP RETRO (Embarcadero Delphi 13 Florence - VCL RAD Studio Style)
           ========================================================================= */
        body[data-os-theme="gipp_retro"] {
            background-color: #E2E6EA !important;
            background-image: radial-gradient(#9AA5B1 1.2px, transparent 1.2px) !important;
            background-size: 8px 8px !important;
            font-family: 'Segoe UI', 'Tahoma', 'MS Sans Serif', system-ui, sans-serif !important;
            color: #1A202C !important;
        }

        /* Delphi VCL Bevel Scrollbars */
        body[data-os-theme="gipp_retro"] ::-webkit-scrollbar {
            width: 14px !important;
            height: 14px !important;
        }
        body[data-os-theme="gipp_retro"] ::-webkit-scrollbar-track {
            background: #E4E7EB !important;
            border: 1px solid #CBD5E1 !important;
        }
        body[data-os-theme="gipp_retro"] ::-webkit-scrollbar-thumb {
            background: #D1D5DB !important;
            border-top: 2px solid #FFFFFF !important;
            border-left: 2px solid #FFFFFF !important;
            border-right: 2px solid #6B7280 !important;
            border-bottom: 2px solid #6B7280 !important;
            border-radius: 0px !important;
        }
        body[data-os-theme="gipp_retro"] ::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF !important;
        }

        /* Delphi VCL Panels & Form Containers (TPanel / TGroupBox) */
        body[data-os-theme="gipp_retro"] .glass-modern, 
        body[data-os-theme="gipp_retro"] .glass-card, 
        body[data-os-theme="gipp_retro"] .glass-panel, 
        body[data-os-theme="gipp_retro"] aside, 
        body[data-os-theme="gipp_retro"] .bg-white, 
        body[data-os-theme="gipp_retro"] .bg-slate-50,
        body[data-os-theme="gipp_retro"] .bg-white\/80,
        body[data-os-theme="gipp_retro"] .bg-slate-50\/80 {
            background: #ECEFF4 !important;
            border-top: 2px solid #FFFFFF !important;
            border-left: 2px solid #FFFFFF !important;
            border-right: 2px solid #7B8794 !important;
            border-bottom: 2px solid #7B8794 !important;
            border-radius: 4px !important;
            box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.12), inset 1px 1px 0px #FFFFFF !important;
            backdrop-filter: none !important;
            color: #102A43 !important;
        }

        body[data-os-theme="gipp_retro"] .glass-card:hover {
            background: #F0F3F7 !important;
            border-top-color: #FFFFFF !important;
            border-left-color: #FFFFFF !important;
            border-right-color: #004E98 !important;
            border-bottom-color: #004E98 !important;
            transform: none !important;
            box-shadow: 3px 3px 8px rgba(0, 78, 152, 0.18) !important;
        }

        /* Delphi Header Bars (TForm Title / TToolBar) */
        body[data-os-theme="gipp_retro"] aside {
            background: #DFE3E8 !important;
            border-right: 2px solid #7B8794 !important;
            border-left: none !important;
            border-top: none !important;
            border-bottom: none !important;
            box-shadow: 3px 0px 8px rgba(0, 0, 0, 0.08) !important;
        }

        /* Typography & Headings (Delphi VCL Classic Navy / Steel) */
        body[data-os-theme="gipp_retro"] h1, 
        body[data-os-theme="gipp_retro"] h2, 
        body[data-os-theme="gipp_retro"] h3,
        body[data-os-theme="gipp_retro"] h4 {
            color: #004E98 !important;
            font-family: 'Segoe UI', 'Tahoma', sans-serif !important;
            font-weight: 800 !important;
            letter-spacing: -0.2px !important;
        }

        body[data-os-theme="gipp_retro"] .text-slate-800,
        body[data-os-theme="gipp_retro"] .text-slate-900,
        body[data-os-theme="gipp_retro"] .text-slate-700 {
            color: #102A43 !important;
            font-weight: 600 !important;
        }

        body[data-os-theme="gipp_retro"] .text-slate-600,
        body[data-os-theme="gipp_retro"] .text-slate-500,
        body[data-os-theme="gipp_retro"] .text-slate-400 {
            color: #334E68 !important;
        }

        /* Delphi Primary Accent */
        body[data-os-theme="gipp_retro"] .text-gradient,
        body[data-os-theme="gipp_retro"] .text-indigo-600,
        body[data-os-theme="gipp_retro"] .text-indigo-500 {
            background: linear-gradient(135deg, #004E98, #1D65A6) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            color: #004E98 !important;
            font-weight: 800 !important;
        }

        body[data-os-theme="gipp_retro"] .bg-indigo-50,
        body[data-os-theme="gipp_retro"] .bg-indigo-100\/50,
        body[data-os-theme="gipp_retro"] .bg-slate-100 {
            background-color: #DDE2E8 !important;
            color: #004E98 !important;
            border: 1px solid #BAC7D5 !important;
            border-radius: 3px !important;
        }

        /* Delphi TBitBtn & TButton 3D Controls */
        body[data-os-theme="gipp_retro"] button.bg-gradient-to-r, 
        body[data-os-theme="gipp_retro"] .bg-indigo-600, 
        body[data-os-theme="gipp_retro"] .bg-indigo-500,
        body[data-os-theme="gipp_retro"] .bg-emerald-500,
        body[data-os-theme="gipp_retro"] .bg-emerald-600 {
            background: linear-gradient(180deg, #FFFFFF 0%, #E6E9ED 40%, #D2D7DF 100%) !important;
            border-top: 2px solid #FFFFFF !important;
            border-left: 2px solid #FFFFFF !important;
            border-right: 2px solid #5A6578 !important;
            border-bottom: 2px solid #5A6578 !important;
            border-radius: 3px !important;
            box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15) !important;
            color: #102A43 !important;
            font-weight: 800 !important;
            letter-spacing: 0.2px !important;
            transition: none !important;
            text-shadow: 0 1px 0 #FFFFFF !important;
        }

        body[data-os-theme="gipp_retro"] button.bg-gradient-to-r:hover,
        body[data-os-theme="gipp_retro"] .bg-indigo-600:hover,
        body[data-os-theme="gipp_retro"] .bg-indigo-500:hover,
        body[data-os-theme="gipp_retro"] .bg-emerald-500:hover,
        body[data-os-theme="gipp_retro"] .bg-emerald-600:hover {
            background: linear-gradient(180deg, #FFFFFF 0%, #EDF1F6 50%, #DDE3EB 100%) !important;
            color: #004E98 !important;
            border-right-color: #004E98 !important;
            border-bottom-color: #004E98 !important;
        }

        body[data-os-theme="gipp_retro"] button:active,
        body[data-os-theme="gipp_retro"] button.bg-gradient-to-r:active,
        body[data-os-theme="gipp_retro"] .bg-indigo-600:active {
            border-top: 2px solid #5A6578 !important;
            border-left: 2px solid #5A6578 !important;
            border-right: 2px solid #FFFFFF !important;
            border-bottom: 2px solid #FFFFFF !important;
            background: #CBD2DB !important;
            transform: translate(1px, 1px) !important;
            box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2) !important;
        }

        /* Delphi TEdit Sunken Input Fields */
        body[data-os-theme="gipp_retro"] input, 
        body[data-os-theme="gipp_retro"] select, 
        body[data-os-theme="gipp_retro"] textarea {
            background-color: #FFFFFF !important;
            border-top: 2px solid #6E7A8A !important;
            border-left: 2px solid #6E7A8A !important;
            border-right: 1px solid #CBD5E1 !important;
            border-bottom: 1px solid #CBD5E1 !important;
            border-radius: 2px !important;
            color: #0F172A !important;
            font-weight: 600 !important;
            box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.15) !important;
        }

        body[data-os-theme="gipp_retro"] input:focus, 
        body[data-os-theme="gipp_retro"] select:focus, 
        body[data-os-theme="gipp_retro"] textarea:focus {
            border-top: 2px solid #004E98 !important;
            border-left: 2px solid #004E98 !important;
            border-right: 1px solid #004E98 !important;
            border-bottom: 1px solid #004E98 !important;
            outline: 1px solid #004E98 !important;
            background-color: #FFFFFA !important;
        }

        /* Delphi TDBGrid Table Styling */
        body[data-os-theme="gipp_retro"] table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
            border: 2px solid #7B8794 !important;
            background-color: #FFFFFF !important;
        }

        body[data-os-theme="gipp_retro"] table th {
            background: linear-gradient(180deg, #F0F3F7 0%, #DDE3EA 100%) !important;
            border-top: 1px solid #FFFFFF !important;
            border-left: 1px solid #FFFFFF !important;
            border-right: 1px solid #9AA5B1 !important;
            border-bottom: 2px solid #6E7A8A !important;
            color: #102A43 !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        body[data-os-theme="gipp_retro"] table td {
            border-right: 1px solid #E2E8F0 !important;
            border-bottom: 1px solid #CBD5E1 !important;
            color: #1E293B !important;
            background-color: #FFFFFF !important;
            font-size: 12px !important;
        }

        body[data-os-theme="gipp_retro"] tr:hover td {
            background-color: #E6F0FA !important;
            color: #004E98 !important;
            font-weight: 700 !important;
        }

        /* Delphi Icons */
        body[data-os-theme="gipp_retro"] svg {
            filter: drop-shadow(0.5px 0.5px 0px rgba(0,0,0,0.15));
            color: #243B53 !important;
        }
        body[data-os-theme="gipp_retro"] button svg,
        body[data-os-theme="gipp_retro"] .text-indigo-600 svg {
            color: #004E98 !important;
        }

        /* Modal & Window Headers in Delphi 13 VCL */
        body[data-os-theme="gipp_retro"] .interactive-window-main {
            background: #ECEFF4 !important;
            border-top: 2px solid #FFFFFF !important;
            border-left: 2px solid #FFFFFF !important;
            border-right: 2px solid #5A6578 !important;
            border-bottom: 2px solid #5A6578 !important;
            border-radius: 4px !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25) !important;
        }

        body[data-os-theme="gipp_retro"] .interactive-window-header {
            background: linear-gradient(90deg, #004E98 0%, #1D65A6 100%) !important;
            color: #FFFFFF !important;
            font-weight: 800 !important;
            padding: 8px 14px !important;
            border-bottom: 2px solid #003366 !important;
            text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5) !important;
        }

                /* Windows 8.1 Metro / Modern UI Global Styles */
        body[data-os-theme="win81"] {
            font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
            background-color: #004B40;
        }
        body[data-os-theme="win81"] ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }
        body[data-os-theme="win81"] ::-webkit-scrollbar-track {
            background: #e6e6e6;
        }
        body[data-os-theme="win81"] ::-webkit-scrollbar-thumb {
            background: #cdcdcd;
            border-radius: 0px;
        }
        body[data-os-theme="win81"] ::-webkit-scrollbar-thumb:hover {
            background: #a6a6a6;
        }
        body[data-os-theme="win81"] input,
        body[data-os-theme="win81"] select,
        body[data-os-theme="win81"] textarea {
            border-radius: 0px !important;
            border-color: #ababab;
        }
        body[data-os-theme="win81"] input:focus,
        body[data-os-theme="win81"] select:focus,
        body[data-os-theme="win81"] textarea:focus {
            border-color: #0078D7 !important;
            outline: 1px solid #0078D7 !important;
            box-shadow: none !important;
        }
        body[data-os-theme="win81"] button {
            border-radius: 0px !important;
        }

        /* Delphi Florence Form Workspace Watermark Branding */
        body[data-os-theme="gipp_retro"] .delphi-form-workspace {
            position: relative;
            min-height: 100%;
        }

        body[data-os-theme="gipp_retro"] .delphi-florence-watermark {
            position: fixed;
            bottom: 40px;
            right: 40px;
            pointer-events: none;
            user-select: none;
            opacity: 0.05;
            z-index: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
        }
    `}</style>
);

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Outfit:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');

    :root {
      --primary: #6366f1; --secondary: #ec4899; --accent: #8b5cf6; --success: #10b981; --warning: #f59e0b; --danger: #ef4444; --dark: #0f172a; --light: #f8fafc;
    }

    body { 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      background-color: #0f172a; 
      background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(242, 47%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%);
      background-attachment: fixed;
      color: #1e293b;
      overflow-x: hidden;
      user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; overscroll-behavior-y: none;
    }

    input, textarea, select, .prose, .selectable-text { user-select: auto; -webkit-user-select: auto; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-script { font-family: 'Great Vibes', cursive; }
    .font-classic { font-family: 'Cinzel', serif; }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; transition: background 0.3s; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.8); }

    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
    @keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); filter: blur(5px); } to { opacity: 1; transform: translateX(0); filter: blur(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes move-stars-up { from { background-position: 0 0; } to { background-position: 0 1000px; } }
    
    .star-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; pointer-events: none; transform: translate3d(0, 0, 0); will-change: background-position; }
    .stars-1 { background-image: radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 100px 150px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 250px 200px, #ffffff, rgba(0,0,0,0)); background-size: 300px 300px; animation: move-stars-up 60s linear infinite; opacity: 0.6; filter: brightness(1.2); }
    .stars-2 { background-image: radial-gradient(2px 2px at 150px 180px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 50px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 300px 300px, #ffffff, rgba(0,0,0,0)); background-size: 400px 400px; animation: move-stars-up 40s linear infinite; opacity: 0.85; filter: brightness(1.2); }
    .stars-3 { background-image: radial-gradient(2.5px 2.5px at 80px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 200px 10px, #ffffff, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 400px 250px, #ffffff, rgba(0,0,0,0)); background-size: 500px 500px; animation: move-stars-up 20s linear infinite; opacity: 1.0; filter: brightness(1.5); }
    .stars-silver-1 { background-image: radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 100px 150px, #e2e8f0, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 250px 200px, #cbd5e1, rgba(0,0,0,0)); background-size: 300px 300px; animation: move-stars-up 60s linear infinite; opacity: 0.85; filter: brightness(1.2) drop-shadow(0 0 1px rgba(255,255,255,0.7)); }
    .stars-silver-2 { background-image: radial-gradient(2px 2px at 150px 180px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 50px, #e2e8f0, rgba(0,0,0,0)), radial-gradient(2px 2px at 300px 300px, #ffffff, rgba(0,0,0,0)); background-size: 400px 400px; animation: move-stars-up 40s linear infinite; opacity: 0.95; filter: brightness(1.3) drop-shadow(0 0 1.5px rgba(255,255,255,0.8)); }
    .stars-silver-3 { background-image: radial-gradient(2.5px 2.5px at 80px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 200px 10px, #cbd5e1, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 400px 250px, #ffffff, rgba(0,0,0,0)); background-size: 500px 500px; animation: move-stars-up 20s linear infinite; opacity: 1.0; filter: brightness(1.5) drop-shadow(0 0 2px rgba(255,255,255,0.9)); }
    
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
    .animate-slide-up-fade { animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-entrance { animation: fadeIn 0.6s ease-out forwards; }
    
    body.theme-light { 
      background-color: #eef6fc; 
      background-image: radial-gradient(at 0% 0%, rgba(186,230,253,0.4) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(219,234,254,0.5) 0, transparent 50%); 
      background-attachment: fixed;
    }
    body.theme-dark { background-color: #0f172a; background-image: radial-gradient(at 0% 0%, hsla(253,16%,10%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(242, 47%, 15%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(339,49%,25%,1) 0, transparent 50%); color: #f8fafc; }
    
    /* -----------------------------------------------------------
       MODO ESCURO PROFISSIONAL (NATIVE-APP FEEL)
       ----------------------------------------------------------- */
    
    /* 1. Superf√≠cies e Fundos S√≥lidos */
    body.theme-dark .bg-white,
    body.theme-dark .bg-slate-50,
    body.theme-dark .bg-slate-100,
    body.theme-dark .bg-slate-200,
    body.theme-dark .bg-slate-300,
    body.theme-dark .bg-gray-50,
    body.theme-dark .bg-gray-100,
    body.theme-dark .bg-gray-200,
    body.theme-dark .bg-zinc-50,
    body.theme-dark .bg-zinc-100,
    body.theme-dark .bg-zinc-200,
    body.theme-dark .bg-neutral-50,
    body.theme-dark .bg-neutral-100,
    body.theme-dark .bg-neutral-200 { 
        background-color: #1e293b !important; /* Slate 800 */
        border-color: rgba(255, 255, 255, 0.1) !important; 
    }

    /* 2. Glassmorphism e Fundos Transparentes */
    body.theme-dark .bg-white\/95,
    body.theme-dark .bg-white\/90,
    body.theme-dark .bg-white\/80,
    body.theme-dark .bg-white\/60,
    body.theme-dark .bg-white\/50,
    body.theme-dark .bg-white\/40,
    body.theme-dark .bg-white\/20,
    body.theme-dark .bg-slate-50\/80,
    body.theme-dark .bg-slate-50\/50,
    body.theme-dark .bg-slate-50\/30,
    body.theme-dark .bg-white\/5 {
        background-color: rgba(30, 41, 59, 0.6) !important; 
        backdrop-filter: blur(16px) saturate(180%) !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
    }

    body.theme-dark .glass-modern, 
    body.theme-dark .glass-panel, 
    body.theme-dark .glass-card { 
      background-color: rgba(15, 23, 42, 0.70) !important; /* Slate 900 base */
      backdrop-filter: blur(20px) saturate(150%) !important;
      border-color: rgba(255, 255, 255, 0.1) !important; 
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4) !important; 
    }

    /* Scrollbar estilizada */
    body.theme-dark::-webkit-scrollbar { width: 8px; height: 8px; }
    body.theme-dark::-webkit-scrollbar-track { background: #0f172a; }
    body.theme-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
    body.theme-dark::-webkit-scrollbar-thumb:hover { background: #475569; }

    /* 3. Tipografia Global (Invers√£o de Contrastes) */
    body.theme-dark .text-slate-900, 
    body.theme-dark .text-slate-800,
    body.theme-dark .text-slate-700,
    body.theme-dark .text-gray-950,
    body.theme-dark .text-gray-900,
    body.theme-dark .text-gray-800,
    body.theme-dark .text-gray-700,
    body.theme-dark .text-zinc-900,
    body.theme-dark .text-zinc-800,
    body.theme-dark .text-zinc-700,
    body.theme-dark .text-neutral-900,
    body.theme-dark .text-neutral-800,
    body.theme-dark .text-neutral-700 { color: #f1f5f9 !important; /* Slate 100 */ }
    
    body.theme-dark .text-slate-600, 
    body.theme-dark .text-slate-500,
    body.theme-dark .text-gray-600,
    body.theme-dark .text-gray-500,
    body.theme-dark .text-zinc-600,
    body.theme-dark .text-zinc-500,
    body.theme-dark .text-neutral-600,
    body.theme-dark .text-neutral-500 { color: #94a3b8 !important; /* Slate 400 */ }
    
    body.theme-dark .text-slate-400,
    body.theme-dark .text-gray-400,
    body.theme-dark .text-zinc-400,
    body.theme-dark .text-neutral-400 { color: #64748b !important; /* Slate 500 */ }

    /* 4. Bordas e Divisores */
    body.theme-dark .border-slate-100,
    body.theme-dark .border-slate-200,
    body.theme-dark .border-slate-300,
    body.theme-dark .border-slate-400,
    body.theme-dark .border-gray-100,
    body.theme-dark .border-gray-200,
    body.theme-dark .border-gray-300,
    body.theme-dark .border-zinc-100,
    body.theme-dark .border-zinc-200,
    body.theme-dark .border-neutral-100,
    body.theme-dark .border-neutral-200,
    body.theme-dark .border-white,
    body.theme-dark .border-white\/20,
    body.theme-dark .border-white\/30,
    body.theme-dark .border-white\/40,
    body.theme-dark .border-white\/50 {
        border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    body.theme-dark .divide-slate-50 > :not([hidden]) ~ :not([hidden]),
    body.theme-dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
    body.theme-dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]),
    body.theme-dark .divide-gray-100 > :not([hidden]) ~ :not([hidden]),
    body.theme-dark .divide-gray-200 > :not([hidden]) ~ :not([hidden]),
    body.theme-dark .divide-white\/40 > :not([hidden]) ~ :not([hidden]) {
        border-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* 5. Inputs, Modais e Formul√°rios */
    body.theme-dark input, 
    body.theme-dark select, 
    body.theme-dark textarea { 
      background-color: rgba(15, 23, 42, 0.9) !important; 
      color: #f8fafc !important; 
      border-color: rgba(255, 255, 255, 0.15) !important; 
    }
    body.theme-dark option {
      background-color: #1e293b !important;
      color: #f8fafc !important;
    }
    body.theme-dark input:focus, 
    body.theme-dark select:focus, 
    body.theme-dark textarea:focus { 
      background-color: rgba(15, 23, 42, 1) !important; 
      border-color: var(--primary) !important; 
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3) !important;
    }
    body.theme-dark input::placeholder,
    body.theme-dark textarea::placeholder { color: #64748b !important; }
    body.theme-dark .search-container input { background-color: rgba(15, 23, 42, 0.6) !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
    body.theme-dark input[type="checkbox"] { background-color: rgba(15, 23, 42, 0.8) !important; border-color: rgba(255, 255, 255, 0.3) !important; }

    /* 6. Tabelas Gen√©ricas */
    body.theme-dark table th { 
      background-color: rgba(15, 23, 42, 0.8) !important;
      border-bottom-color: rgba(255,255,255,0.1) !important; 
      color: #cbd5e1 !important; 
    }
    body.theme-dark table td { 
      border-color: rgba(255,255,255,0.05) !important; 
      color: #e2e8f0 !important; 
    }
    body.theme-dark table tr:hover td,
    body.theme-dark .hover\:bg-slate-50:hover,
    body.theme-dark .hover\:bg-gray-100:hover,
    body.theme-dark .hover\:bg-white\/60:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    /* 7. Paleta Suave de Emblemas (Status Badges/Alertas) - Ajusta satura√ß√£o e contraste */
    body.theme-dark .bg-emerald-50, body.theme-dark .bg-emerald-100 { background-color: rgba(16, 185, 129, 0.15) !important; border-color: rgba(16, 185, 129, 0.2) !important; }
    body.theme-dark .text-emerald-500, body.theme-dark .text-emerald-600, body.theme-dark .text-emerald-700, body.theme-dark .text-emerald-800 { color: #34d399 !important; }

    body.theme-dark .bg-rose-50, body.theme-dark .bg-rose-100 { background-color: rgba(244, 63, 94, 0.15) !important; border-color: rgba(244, 63, 94, 0.2) !important; }
    body.theme-dark .text-rose-500, body.theme-dark .text-rose-600, body.theme-dark .text-rose-700, body.theme-dark .text-rose-800 { color: #fb7185 !important; }

    body.theme-dark .bg-amber-50, body.theme-dark .bg-amber-100 { background-color: rgba(245, 158, 11, 0.15) !important; border-color: rgba(245, 158, 11, 0.2) !important; }
    body.theme-dark .text-amber-500, body.theme-dark .text-amber-600, body.theme-dark .text-amber-700, body.theme-dark .text-amber-800 { color: #fbbf24 !important; }

    body.theme-dark .bg-indigo-50, body.theme-dark .bg-indigo-100 { background-color: rgba(99, 102, 241, 0.15) !important; border-color: rgba(99, 102, 241, 0.2) !important; }
    body.theme-dark .text-indigo-500, body.theme-dark .text-indigo-600, body.theme-dark .text-indigo-700, body.theme-dark .text-indigo-800 { color: #818cf8 !important; }

    body.theme-dark .bg-blue-50, body.theme-dark .bg-blue-100 { background-color: rgba(59, 130, 246, 0.15) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
    body.theme-dark .text-blue-500, body.theme-dark .text-blue-600, body.theme-dark .text-blue-700, body.theme-dark .text-blue-800 { color: #60a5fa !important; }

    body.theme-dark .bg-purple-50, body.theme-dark .bg-purple-100 { background-color: rgba(168, 85, 247, 0.15) !important; border-color: rgba(168, 85, 247, 0.2) !important; }
    body.theme-dark .text-purple-500, body.theme-dark .text-purple-600, body.theme-dark .text-purple-700, body.theme-dark .text-purple-800 { color: #c084fc !important; }

    body.theme-dark .bg-pink-50, body.theme-dark .bg-pink-100 { background-color: rgba(236, 72, 153, 0.15) !important; border-color: rgba(236, 72, 153, 0.2) !important; }
    body.theme-dark .text-pink-500, body.theme-dark .text-pink-600, body.theme-dark .text-pink-700, body.theme-dark .text-pink-800 { color: #f472b6 !important; }

    /* 8. Corre√ß√µes para Gr√°ficos Recharts no Modo Escuro */
    body.theme-dark .recharts-text { fill: #94a3b8 !important; }
    body.theme-dark .recharts-cartesian-grid-horizontal line, 
    body.theme-dark .recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,0.1) !important; }
    body.theme-dark .recharts-tooltip-wrapper .recharts-default-tooltip { background-color: rgba(15, 23, 42, 0.95) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important; }
    body.theme-dark .recharts-tooltip-item-name, body.theme-dark .recharts-tooltip-item-value { color: #f8fafc !important; }

    /* 9. Sombras (Shadows) */
    body.theme-dark .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5) !important; }
    body.theme-dark .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3) !important; }
    body.theme-dark .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3) !important; }

    /* Overlay Modal / Telas de Fundo Preto */
    body.theme-dark .bg-slate-900\/60,
    body.theme-dark .bg-slate-900\/80,
    body.theme-dark .bg-slate-900\/90 { background-color: rgba(0, 0, 0, 0.8) !important; }
    /* ----------------------------------------------------------- */
    
    .glass-modern { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); }
    .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); }
    .glass-card { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .glass-card:hover { background: rgba(255, 255, 255, 0.85); transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 40px -5px rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.4); }

    .input-futuristic { background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(148, 163, 184, 0.3); transition: all 0.3s ease; font-weight: 500; }
    .input-futuristic:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15); outline: none; }
    .text-gradient { background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .doc-padding { padding-top: 30mm; padding-left: 30mm; padding-bottom: 20mm; padding-right: 20mm; box-sizing: border-box; }

    @media print {
      /* Reset global do documento para impress√£o limpa */
      body, html { 
        background-color: white !important; 
        background-image: none !important; 
        color: #000000 !important; 
        overflow: visible !important; 
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important;
      }
      
      /* Ocultar elementos de navega√ß√£o, chatbot, bot√µes, modais gerais, rodap√©s interativos, cabe√ßalhos, notifica√ß√µes, etc. */
      body * {
        visibility: hidden !important; 
      }
      
      .screen-content, .no-print, [class*="no-print"] {
        display: none !important;
      }
      
      .print-area, .print-area * {
        visibility: visible !important; 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
      
      .print-area { 
        display: block !important;
        position: absolute !important; 
        left: 0 !important;
        top: 0 !important;
        width: 100% !important; 
        max-width: 100% !important;
        height: auto !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        background: white !important; 
        z-index: 99999 !important; 
      }

      /* For√ßar textos a ficarem n√≠tidos e pretos para economia de tinta e contraste (exceto certificados) */
      .print-area:not(.cert-colorized) p, 
      .print-area:not(.cert-colorized) span, 
      .print-area:not(.cert-colorized) h1, 
      .print-area:not(.cert-colorized) h2, 
      .print-area:not(.cert-colorized) h3, 
      .print-area:not(.cert-colorized) h4, 
      .print-area:not(.cert-colorized) h5, 
      .print-area:not(.cert-colorized) h6, 
      .print-area:not(.cert-colorized) td, 
      .print-area:not(.cert-colorized) th { 
        color: #000000 !important; 
        text-shadow: none !important;
        box-shadow: none !important;
      }

      /* Ajustes de Margem e Orienta√ß√£o de P√°gina */
      @page { 
        margin-top: 30mm;
        margin-left: 30mm;
        margin-bottom: 20mm;
        margin-right: 20mm;
        size: A4 portrait; 
      }
      @page landscape-page { 
        size: A4 landscape; 
        margin-top: 30mm;
        margin-left: 30mm;
        margin-bottom: 20mm;
        margin-right: 20mm;
      }
      
      .print-landscape { 
        page: landscape-page; 
      }
      
      .print-portrait {
        page: A4 portrait;
      }

      .doc-padding { 
        padding-top: 30mm !important;
        padding-left: 30mm !important;
        padding-bottom: 20mm !important;
        padding-right: 20mm !important;
        box-sizing: border-box !important;
      }

      /* Quebras de p√°ginas elegantes */
      table { 
        page-break-inside: auto; 
        border-collapse: collapse; 
        width: 100%; 
      }
      tr, td, th { 
        page-break-inside: avoid !important; 
        break-inside: avoid !important; 
      }
      h1, h2, h3, h4, h5, h6, .avoid-break { 
        page-break-inside: avoid !important; 
        break-inside: avoid !important; 
      }
      
      /* Estetiza√ß√£o limpa de tabelas em relat√≥rios impressos */
      table th {
        background-color: #f1f5f9 !important;
        color: #000000 !important;
        border: 1px solid #cbd5e1 !important;
        font-weight: bold !important;
        font-size: 10px !important;
        padding: 6px 8px !important;
        text-transform: uppercase !important;
      }
      table td {
        border: 1px solid #e2e8f0 !important;
        font-size: 10px !important;
        padding: 6px 8px !important;
        background: transparent !important;
      }
      
      /* Ocultar barra de rolagem horizontal ou vertical impressa */
      body {
        scrollbar-width: none !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
      }
    }
    .print-area { display: none; }
  `}</style>
);

const ThemeBackground = ({ theme, isSplash = false }) => {
    const context = useContext(ChurchContext);
    const animBgEnabled = context ? context.animBgEnabled : true;
    const papelParedeFromDb = context?.db?.igreja?.papel_parede;
    const papelParede = (papelParedeFromDb === undefined || papelParedeFromDb === null) && theme === 'macos_tahoe'
        ? 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1400&auto=format&fit=crop'
        : papelParedeFromDb;
    const osTheme = context?.osTheme || 'default';
    const isLightTheme = context?.theme === 'light';
    
    // Configura√ß√µes personalizadas do usu√°rio
    const animacaoTipoSelected = context?.db?.igreja?.tipo_animacao || 'auto';
    const activeAnim = animBgEnabled ? (animacaoTipoSelected === 'auto' ? (isSplash ? 'splash' : theme) : animacaoTipoSelected) : 'none';
    
    // Opacidade da pel√≠cula de contraste (de 0 a 100, padr√£o 40)
    const overlayOpacity = (papelParedeFromDb === undefined || papelParedeFromDb === null) && theme === 'macos_tahoe'
        ? 15
        : (context?.db?.igreja?.papel_parede_opacidade !== undefined ? Number(context?.db?.igreja?.papel_parede_opacidade) : 40);
    
    const getBaseThemeStyles = () => {
        if (theme === 'macos_tahoe') return "bg-[#0b0c16]";
        if (theme === 'win81') return "bg-[#004B40]";
        if (theme === 'win11') return "bg-[#f3f4f6] dark:bg-[#111111]";
        if (theme === 'win95') return "bg-[#008080]";
        if (theme === 'gipp_retro') return "bg-[#E2E6EA]";
        if (theme === 'premium_black') return "bg-[#050505]";
        if (theme === 'gipp_clipper' || theme === 'msdos') return "bg-[#0000AA]";
        if (theme === 'linux') return "bg-[#1f0b1a]";
        if (theme === 'futuristic') return "bg-[#03001e]";
        if (isLightTheme) {
            if (isSplash) {
                return "bg-[#eef6fc] bg-[radial-gradient(at_0%_0%,_rgba(186,230,253,0.5)_0,_transparent_50%),_radial-gradient(at_50%_0%,_rgba(219,234,254,0.7)_0,_transparent_50%)]";
            }
            return "bg-[#eef6fc]"; // fundo azul bem clarinho
        }
        if (isSplash) return "bg-[#0f172a] bg-[radial-gradient(at_0%_0%,_hsla(253,16%,7%,1)_0,_transparent_50%),_radial-gradient(at_50%_0%,_hsla(242,47%,18%,1)_0,_transparent_50%)]";
        return "bg-white"; // default
    };

    const Win95Logo = () => (
        <div className="relative flex flex-wrap gap-0.5 pointer-events-none select-none" style={{ width: '28px', height: '28px', transformStyle: 'preserve-3d' }}>
            <div className="w-[12px] h-[12px] bg-[#ff3333] border border-black/10" style={{ borderRadius: '40% 65% 40% 65% / 40% 65% 40% 65%' }} />
            <div className="w-[12px] h-[12px] bg-[#33cc33] border border-black/10" style={{ borderRadius: '65% 40% 65% 40% / 65% 40% 65% 40%' }} />
            <div className="w-[12px] h-[12px] bg-[#3366ff] border border-black/10" style={{ borderRadius: '65% 40% 65% 40% / 65% 40% 65% 40%' }} />
            <div className="w-[12px] h-[12px] bg-[#ffcc00] border border-black/10" style={{ borderRadius: '40% 65% 40% 65% / 40% 65% 40% 65%' }} />
            <div className="absolute top-0.5 left-0.5 -z-10 w-[24px] h-[24px] bg-black/30" style={{ transform: 'translateZ(-1px)' }} />
        </div>
    );

    const isDarkTheme = osTheme === 'dark' || osTheme === 'premium_black' || theme === 'premium_black' || osTheme === 'futuristic' || osTheme === 'linux' || theme === 'linux';

    return (
        <div className={`absolute inset-0 overflow-hidden ${papelParede ? '' : getBaseThemeStyles()}`}>
            {/* Renderiza o papel de parede se estiver configurado */}
            {papelParede && (
                <div 
                    className="absolute inset-0"
                    style={{ 
                        backgroundImage: `url(${papelParede})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center', 
                        backgroundRepeat: 'no-repeat' 
                    }}
                >
                    {/* Pel√≠cula de contraste */}
                    {overlayOpacity > 0 && (
                        <div 
                            className="absolute inset-0 bg-black backdrop-blur-[0.5px]" 
                            style={{ opacity: overlayOpacity / 100 }}
                        />
                    )}
                </div>
            )}

            {/* ANIMA√á√ÉO SELECIONADA OU AUTOM√ÅTICA */}
            {(activeAnim === 'win11' || activeAnim === 'aurora') && (
                <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" style={{ animation: 'aurora-blob-1 20s infinite ease-in-out' }}></div>
            )}

            {activeAnim === 'win11' && (
                <>
                    <style>{`
                        @keyframes win11-blob-1 {
                            0%, 100% { transform: translate(0px, 0px) scale(1); }
                            33% { transform: translate(30px, -50px) scale(1.15); }
                            66% { transform: translate(-20px, 20px) scale(0.9); }
                        }
                        @keyframes win11-blob-2 {
                            0%, 100% { transform: translate(0px, 0px) scale(1); }
                            50% { transform: translate(-40px, 40px) scale(1.2); }
                        }
                    `}</style>
                    {isLightTheme ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#eef2f7] via-[#f3f4f6] to-[#ffffff]"></div>
                            <div className="absolute top-[20%] left-[30%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-r from-sky-300 to-indigo-300 opacity-[0.45] blur-[120px]" style={{ animation: 'win11-blob-1 18s infinite ease-in-out' }}></div>
                            <div className="absolute bottom-[20%] right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-violet-200 to-sky-200 opacity-[0.4] blur-[130px]" style={{ animation: 'win11-blob-2 22s infinite ease-in-out', animationDelay: '-6s' }}></div>
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#020d20] via-[#080d1e] to-[#010310]"></div>
                            <div className="absolute top-[20%] left-[30%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-[0.25] blur-[130px]" style={{ animation: 'win11-blob-1 18s infinite ease-in-out' }}></div>
                            <div className="absolute bottom-[20%] right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-[0.22] blur-[140px]" style={{ animation: 'win11-blob-2 22s infinite ease-in-out', animationDelay: '-6s' }}></div>
                        </>
                    )}

                    <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ 
                        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}></div>
                </>
            )}

            {activeAnim === 'win95' && (
                <>
                    <style>{`
                        @keyframes win95-star-1 {
                            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
                            15% { opacity: 0.7; }
                            100% { transform: translate(-40vw, -30vh) scale(3.5); opacity: 0; }
                        }
                        @keyframes win95-star-2 {
                            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
                            15% { opacity: 0.7; }
                            100% { transform: translate(40vw, 30vh) scale(3.5); opacity: 0; }
                        }
                        @keyframes win95-star-3 {
                            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
                            15% { opacity: 0.7; }
                            100% { transform: translate(-30vw, 35vh) scale(3.5); opacity: 0; }
                        }
                        @keyframes win95-star-4 {
                            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
                            15% { opacity: 0.7; }
                            100% { transform: translate(30vw, -35vh) scale(3.5); opacity: 0; }
                        }
                        @keyframes win95-logo-left {
                            0% { transform: translate(-50%, -50%) scale(0.1) rotate(0deg); opacity: 0; }
                            12% { opacity: 1; }
                            100% { transform: translate(-38vw, -12vh) scale(3.8) rotate(-30deg); opacity: 0; }
                        }
                        @keyframes win95-logo-right {
                            0% { transform: translate(-50%, -50%) scale(0.1) rotate(0deg); opacity: 0; }
                            12% { opacity: 1; }
                            100% { transform: translate(38vw, 18vh) scale(3.8) rotate(30deg); opacity: 0; }
                        }
                        @keyframes win95-logo-top {
                            0% { transform: translate(-50%, -50%) scale(0.1) rotate(0deg); opacity: 0; }
                            12% { opacity: 1; }
                            100% { transform: translate(12vw, -42vh) scale(3.2) rotate(45deg); opacity: 0; }
                        }
                    `}</style>
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/95 rounded-none" style={{ animation: 'win95-star-1 4s linear infinite', animationDelay: '0s' }} />
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/90 rounded-none mix-blend-screen" style={{ animation: 'win95-star-2 5s linear infinite', animationDelay: '1.2s' }} />
                    <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-white/80 rounded-none" style={{ animation: 'win95-star-3 3.5s linear infinite', animationDelay: '2.3s' }} />
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/95 rounded-none" style={{ animation: 'win95-star-4 6s linear infinite', animationDelay: '0.5s' }} />
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-teal-200/50 rounded-none" style={{ animation: 'win95-star-1 4.5s linear infinite', animationDelay: '2.5s' }} />
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-200/50 rounded-none" style={{ animation: 'win95-star-2 3.8s linear infinite', animationDelay: '0.8s' }} />
                    
                    <div className="absolute top-1/2 left-1/2" style={{ animation: 'win95-logo-left 6.5s linear infinite', animationDelay: '0s' }}>
                        <Win95Logo />
                    </div>
                    <div className="absolute top-1/2 left-1/2" style={{ animation: 'win95-logo-right 8s linear infinite', animationDelay: '2.5s' }}>
                        <Win95Logo />
                    </div>
                    <div className="absolute top-1/2 left-1/2" style={{ animation: 'win95-logo-top 7.5s linear infinite', animationDelay: '4.8s' }}>
                        <Win95Logo />
                    </div>
                    <div className="absolute top-1/2 left-1/2 scale-110" style={{ animation: 'win95-logo-left 10s linear infinite', animationDelay: '3.8s' }}>
                        <Win95Logo />
                    </div>
                </>
            )}

            {activeAnim === 'premium_black' && (
                <>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(192, 192, 192, 0.08) 0%, transparent 40%)' }}></div>
                    <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[150px] bg-[#D4AF37]/5 animate-pulse-glow" style={{ animationDuration: '8s' }}></div>
                </>
            )}

            {activeAnim === 'futuristic' && (
                <>
                    <style>{`
                        @keyframes cyber-scan {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(100%); }
                        }
                    `}</style>
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px',
                        backgroundPosition: 'center'
                    }}></div>
                    <div className="absolute inset-0" style={{ 
                        background: 'linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.1) 50%, transparent)',
                        height: '100%',
                        animation: 'cyber-scan 12s linear infinite'
                    }}></div>
                    <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full blur-[120px] bg-[#ff007f]/10 animate-pulse-glow" style={{ animationDuration: '6s' }}></div>
                    <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full blur-[120px] bg-[#00f0ff]/10 animate-pulse-glow" style={{ animationDuration: '9s' }}></div>
                </>
            )}

            {activeAnim === 'linux' && (
                <>
                    <style>{`
                        @keyframes linux-drift-wave {
                            0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
                            50% { transform: translateY(-40px) scale(1.15); opacity: 0.35; }
                        }
                    `}</style>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1f0b1a] via-[#24061a] to-[#0c000a]"></div>
                    <div className="absolute top-[15%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-[#df542c]/06 blur-[130px] pointer-events-none" style={{ animation: 'linux-drift-wave 16s infinite ease-in-out' }}></div>
                    <div className="absolute bottom-[15%] left-[8%] w-[48vw] h-[48vw] rounded-full bg-[#601959]/08 blur-[140px] pointer-events-none" style={{ animation: 'linux-drift-wave 20s infinite ease-in-out', animationDelay: '-5s' }}></div>
                    <div className="absolute inset-0 opacity-[0.012] mix-blend-overlay pointer-events-none" style={{ 
                        backgroundImage: 'radial-gradient(circle, #df542c 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </>
            )}

            {activeAnim === 'gipp_retro' && (
                <>
                    <style>{`
                        @keyframes delphi-scan {
                            0% { transform: translateY(-100%); opacity: 0; }
                            50% { opacity: 0.15; }
                            100% { transform: translateY(100vh); opacity: 0; }
                        }
                        @keyframes delphi-badge-float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-8px); }
                        }
                        @keyframes delphi-watermark-pulse {
                            0%, 100% { opacity: 0.07; transform: translate(-50%, -50%) scale(1); }
                            50% { opacity: 0.11; transform: translate(-50%, -50%) scale(1.02); }
                        }
                    `}</style>
                    <div className="absolute inset-0 bg-[#E2E6EA]" style={{ 
                        backgroundImage: 'radial-gradient(#8E9AA8 1.2px, transparent 1.2px)',
                        backgroundSize: '8px 8px'
                    }}></div>
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004E98] via-[#1D65A6] to-[#004E98] shadow-sm"></div>

                    {/* Delphi 13 Florence GIPP Watermark Branding Logo */}
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex flex-col items-center justify-center text-center z-0"
                        style={{ animation: 'delphi-watermark-pulse 12s infinite ease-in-out' }}
                    >
                        {/* Florence Geometric Seal & Delphi Emblem */}
                        <div className="relative mb-3 flex items-center justify-center">
                            <svg className="w-56 h-56 text-[#004E98] stroke-current" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Outer Technical CAD Calibration Rings */}
                                <circle cx="100" cy="100" r="92" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6" />
                                <circle cx="100" cy="100" r="84" strokeWidth="0.8" opacity="0.8" />
                                <circle cx="100" cy="100" r="76" strokeWidth="1.2" opacity="0.5" />
                                
                                {/* Precision Crosshairs */}
                                <line x1="100" y1="4" x2="100" y2="196" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                                <line x1="4" y1="100" x2="196" y2="100" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                                
                                {/* Inner Florence Hexagon / Shield */}
                                <polygon points="100,24 168,58 168,142 100,176 32,142 32,58" strokeWidth="1.5" opacity="0.7" />
                                
                                {/* GIPP Monogram Iconography */}
                                <path d="M70 70 L100 45 L130 70 L130 130 L100 155 L70 130 Z" strokeWidth="1.2" opacity="0.6" />
                                <path d="M100 60 L100 140 M80 90 L120 90" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                            </svg>
                        </div>

                        {/* GIPP Engraved Chiseled Wordmark */}
                        <div className="tracking-[0.35em] font-black text-6xl md:text-7xl font-sans text-[#004E98] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] opacity-90 uppercase ml-[0.35em]">
                            GIPP
                        </div>
                        <div className="text-[11px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#243B53] mt-1 uppercase">
                            Gest√£o Integrada de Portais Pastorais
                        </div>
                        <div className="text-[9px] font-mono tracking-[0.18em] text-[#486581] mt-0.5 uppercase">
                            Delphi 13 Florence VCL ‚Ä¢ Enterprise Edition
                        </div>
                    </div>

                    {/* Delphi Florence VCL floating designer badges */}
                    <div className="absolute top-12 right-16 opacity-30 select-none pointer-events-none text-[10px] font-mono font-bold bg-[#ECEFF4] border border-[#7B8794] px-2 py-1 shadow-xs text-[#004E98] rounded-xs" style={{ animation: 'delphi-badge-float 8s infinite ease-in-out' }}>
                        TFDConnection: FDConnGIPP [Connected]
                    </div>
                    <div className="absolute bottom-20 left-12 opacity-25 select-none pointer-events-none text-[10px] font-mono font-bold bg-[#ECEFF4] border border-[#7B8794] px-2 py-1 shadow-xs text-[#004E98] rounded-xs" style={{ animation: 'delphi-badge-float 10s infinite ease-in-out', animationDelay: '-4s' }}>
                        TFormMain: TForm (Delphi 13 Florence VCL)
                    </div>
                    <div className="absolute top-1/3 left-8 opacity-20 select-none pointer-events-none text-[10px] font-mono font-bold bg-[#ECEFF4] border border-[#7B8794] px-2 py-1 shadow-xs text-[#102A43] rounded-xs" style={{ animation: 'delphi-badge-float 12s infinite ease-in-out', animationDelay: '-2s' }}>
                        TDBGrid: DBGridMembros (DataSet: qryMembros)
                    </div>
                </>
            )}

            {(activeAnim === 'stars' || activeAnim === 'splash' || (activeAnim === 'default' && !papelParede)) && (
                <>
                    {isLightTheme ? (
                        <>
                            <div className="star-layer stars-silver-1"></div>
                            <div className="star-layer stars-silver-2"></div>
                            <div className="star-layer stars-silver-3"></div>
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/35 blur-[100px] animate-float"></div>
                        </>
                    ) : (
                        <>
                            <div className="star-layer stars-1"></div>
                            <div className="star-layer stars-2"></div>
                            <div className="star-layer stars-3"></div>
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-float"></div>
                        </>
                    )}
                </>
            )}

            {activeAnim === 'default' && papelParede && (
                <>
                    <div className="star-layer stars-silver-1"></div>
                    <div className="star-layer stars-silver-2"></div>
                    <div className="star-layer stars-silver-3"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/30 blur-[100px] animate-float"></div>
                </>
            )}
        </div>
    );
};

const AnimBgToggle = ({ variant = 'default', className = "" }) => {
    const { animBgEnabled, setAnimBgEnabled } = useContext(ChurchContext) || {};
    let btnClass = "";
    let iconSize = 20;
    
    if (variant === 'dark') {
        btnClass = `p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:bg-white/20 transition-all text-white ${className}`;
    } else if (variant === 'mobile') {
        btnClass = `p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors ${className}`;
        iconSize = 18;
    } else {
        btnClass = `p-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all text-slate-600 hover:text-indigo-600 ${className}`;
    }

    return (
        <button type="button" onClick={() => setAnimBgEnabled?.(!animBgEnabled)} className={btnClass} title={animBgEnabled ? "Desativar Anima√ß√£o do Fundo" : "Ativar Anima√ß√£o do Fundo"}>
            {animBgEnabled ? <Zap size={iconSize} className="text-yellow-400 fill-yellow-400 animate-pulse" /> : <ZapOff size={iconSize} />}
        </button>
    );
};

const OsThemeToggle = ({ variant = 'default', className = "" }) => {
    const { osTheme, setOsTheme } = useContext(ChurchContext);
    const [isOpen, setIsOpen] = useState(false);
    const themesList = [
        { id: 'default', label: 'GIPP Padr√£o' }, 
        { id: 'win81', label: 'Windows 8.1 (Metro) ü™ü' },
        { id: 'gipp_retro', label: 'GIPP RETRO (Delphi 13) ‚ö°' },
        { id: 'premium_black', label: 'Premium Black' },
        { id: 'macos_tahoe', label: 'macOS 26 Tahoe Ô£ø' },
        { id: 'win11', label: 'Windows 11' },
        { id: 'win95', label: 'Windows 95' }, { id: 'gipp_clipper', label: 'GIPP CLIPPER' },
        { id: 'linux', label: 'Linux Ubuntu' }, { id: 'futuristic', label: 'GIPP Sci-Fi' }
    ];
    let btnClass = variant === 'dark' ? `p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white flex items-center gap-2 ${className}` : variant === 'mobile' ? `p-2 bg-slate-50 text-slate-500 rounded-lg flex items-center gap-2 ${className}` : `p-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-slate-600 flex items-center gap-2 ${className}`;

    return (
        <div className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={btnClass} title="Alterar Tema">
                <Palette size={variant === 'mobile' ? 18 : 20} />
                <span className="text-[10px] font-bold uppercase hidden xl:block">Tema</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
                        {themesList.map(t => (
                            <button key={t.id} onClick={() => { 
                                setOsTheme(t.id); 
                                if (t.id === 'win11') {
                                    requestAppFullscreen();
                                }
                                setIsOpen(false); 
                            }} className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-slate-50 ${osTheme === t.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'}`}>
                                {t.label} {osTheme === t.id && <Check size={14} className="inline float-right mt-0.5"/>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;
  setState: any;
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary caught an error", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-rose-50/50 backdrop-blur-md rounded-3xl m-4">
          <AlertTriangle className="text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h2>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold mt-4">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const generatePixPayload = (pixKey, name = 'Igreja', city = 'Cidade', amount = null) => {
    if (!pixKey) return '';
    const sanitize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const safeName = sanitize(name || 'IGREJA').substring(0, 25);
    const safeCity = sanitize(city || 'CIDADE').substring(0, 15);
    const safeKey = pixKey.trim();
    const payloadFormat = "000201"; const pointOfInitiation = "010211";
    const merchantAccountGui = "0014br.gov.bcb.pix"; const merchantAccountKey = "01" + safeKey.length.toString().padStart(2, '0') + safeKey;
    const merchantAccountInfo = merchantAccountGui + merchantAccountKey; const merchantAccountBlock = "26" + merchantAccountInfo.length.toString().padStart(2, '0') + merchantAccountInfo;
    const merchantCategoryCode = "52040000"; const transactionCurrency = "5303986";
    let transactionAmountBlock = "";
    if (amount && parseFloat(amount) > 0) {
        const amountStr = parseFloat(amount).toFixed(2);
        transactionAmountBlock = "54" + amountStr.length.toString().padStart(2, '0') + amountStr;
    }
    const countryCode = "5802BR"; const merchantNameBlock = "59" + safeName.length.toString().padStart(2, '0') + safeName; const merchantCityBlock = "60" + safeCity.length.toString().padStart(2, '0') + safeCity;
    const additionalDataField = "0504GIPP"; const additionalDataBlock = "62" + additionalDataField.length.toString().padStart(2, '0') + additionalDataField;
    const payloadToCrc = payloadFormat + pointOfInitiation + merchantAccountBlock + merchantCategoryCode + transactionCurrency + transactionAmountBlock + countryCode + merchantNameBlock + merchantCityBlock + additionalDataBlock + "6304";
    let crc = 0xFFFF;
    for (let i = 0; i < payloadToCrc.length; i++) {
        crc ^= payloadToCrc.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) { if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021; else crc = crc << 1; }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payloadToCrc + hex;
};

export const safeRender = (val) => {
    if (val === null || val === undefined) return '';
    if (isValidElement(val)) return val;
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'Sim' : 'N√£o';
    if (typeof val === 'object') {
        if (val.label) return val.label; if (val.nome) return val.nome; if (val.titulo) return val.titulo; if (val.descricao) return val.descricao; if (val.value) return val.value;
        if (val.seconds !== undefined && val.nanoseconds !== undefined) return new Date(val.seconds * 1000).toLocaleDateString('pt-BR');
        if (val.toDate && typeof val.toDate === 'function') { try { return val.toDate().toLocaleDateString('pt-BR'); } catch(e) { return ''; } }
        if (Array.isArray(val)) return `[${val.length} items]`;
        return '';
    }
    return String(val);
};

export const safeText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return val.nome || val.label || val.value || '';
    return String(val);
};

const MOCK_DB = { igreja: { nome: "GIPP - GEST√ÉO DE IGREJA", cnpj: "12.345.678/0001-90", endereco: "Rua das Oliveiras, 123", cidade: "S√£o Paulo", uf: "SP", telefone: "(11) 98765-4321", email: "contato@adnovavida.com.br", site: "www.adnovavida.com.br", dataFundacao: "", pastor: "Pr. Jo√£o Silva", vicePresidente1: "", vicePresidente2: "", tesoureiro1: "", tesoureiro2: "", secretario1: "", secretario2: "", contador: "", logo: null, chave_pix: "12.345.678/0001-90" }, membros: [], celulas: [], congregacoes: [], fornecedores: [], departamentos: [], centro_custo: [], usuarios: [ { id: 'admin-master', nome: "Administrador Master", usuario: "ADM", senha: "123", nivel: "master", permissoes: [] } ], financeiro: [], carnes: [], ebd: { turmas: [], professores: [], alunos: [], licoes: [] }, missoes: { missionarios: [], agencias: [], colaboradores: [], agenda: [] }, agenda: [], tarefas: [], projetos_midia: [], solicitacoes: [], trash: {}, auditoria: [], visitantes: [], patrimonio: [], emails: [], mural: [], pastor_agenda: [], pastor_mensagens: [], pastor_esbocos: [], pastor_atas: [], pastor_liturgias: [], support_chats: [], orcamentos: [], kids_criancas: [], kids_presencas: [], kids_ocorrencias: [], dp_colaboradores: [], dp_folhas: [], frotas_veiculos: [], frotas_motoristas: [], frotas_despesas: [], frotas_multas: [], secretaria_contatos: [], portal_acessos: [] };

export const ICON_MAP = { Sun, Book, Mic, Flame, BookOpen, Droplets, Globe, Heart, Star, Calendar, Clock, Users, Shield, MapPin, Target, Activity, Music: Mic, Megaphone, Newspaper };
export const getIcon = (name) => ICON_MAP[name] || Star;

export const getModuleColor = (id) => {
    const colors = {
        portal_pastor: 'amber',
        dashboard: 'blue',
        changelog: 'fuchsia',
        sobre: 'teal',
        manual: 'indigo',
        amparo_legal: 'amber',
        registro_software: 'indigo',
        cad_membro: 'indigo',
        visitantes: 'rose',
        cad_igreja: 'amber',
        cad_patrimonio: 'emerald',
        cad_celula: 'purple',
        cad_usuario: 'slate',
        acessos_portal: 'cyan',
        cad_departamento: 'pink',
        ministerio_louvor: 'violet',
        ministerio_midia: 'teal',
        ministerio_familia: 'rose',
        fin_entrada: 'emerald',
        fin_saida: 'rose',
        fin_dre: 'blue',
        fin_conciliacao: 'indigo',
        fin_carnes: 'fuchsia',
        fin_utilitarios: 'slate',
        boletim: 'orange',
        biblia: 'amber',
        assistente_ai: 'violet',
        email_interno: 'emerald',
        secretaria_integrada: 'blue',
        secretaria_certificados: 'amber',
        carteirinha_studio: 'pink',
        credencial_lote: 'purple',
        secretaria_ebd: 'emerald',
        salinha_kids: 'rose',
        missoes_painel: 'rose',
        rede_social: 'pink',
        relatorios: 'indigo',
        config_backup: 'emerald',
        auditoria: 'slate',
        lixeira: 'rose',
        desenvolvedor: 'emerald',
        config_sistema: 'indigo',
        config_visual: 'purple'
    };
    return colors[id] || 'indigo';
};

const COLOR_CLASSES = {
    amber: {
        bgActive: 'bg-amber-100 text-amber-700 border-amber-200',
        bgNormal: 'bg-amber-500/10 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border-transparent',
        iosBg: 'bg-amber-500',
        neon: 'text-amber-500 dark:text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-[0_0_8px_rgba(245,158,11,0.12)]',
        neonActive: 'text-amber-400 border-amber-400 bg-slate-900 shadow-[0_0_16px_rgba(245,158,11,0.45)] font-black'
    },
    blue: {
        bgActive: 'bg-blue-100 text-blue-700 border-blue-200',
        bgNormal: 'bg-blue-500/10 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border-transparent',
        iosBg: 'bg-blue-500',
        neon: 'text-blue-500 dark:text-blue-400 border-blue-500/20 bg-blue-500/5 shadow-[0_0_8px_rgba(59,130,246,0.12)]',
        neonActive: 'text-blue-400 border-blue-400 bg-slate-900 shadow-[0_0_16px_rgba(59,130,246,0.45)] font-black'
    },
    fuchsia: {
        bgActive: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
        bgNormal: 'bg-fuchsia-500/10 dark:bg-fuchsia-950/25 text-fuchsia-600 dark:text-fuchsia-400 border-transparent',
        iosBg: 'bg-fuchsia-500',
        neon: 'text-fuchsia-500 dark:text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5 shadow-[0_0_8px_rgba(217,70,239,0.12)]',
        neonActive: 'text-fuchsia-400 border-fuchsia-400 bg-slate-900 shadow-[0_0_16px_rgba(217,70,239,0.45)] font-black'
    },
    teal: {
        bgActive: 'bg-teal-100 text-teal-700 border-teal-200',
        bgNormal: 'bg-teal-500/10 dark:bg-teal-950/25 text-teal-600 dark:text-teal-400 border-transparent',
        iosBg: 'bg-teal-500',
        neon: 'text-teal-500 dark:text-teal-400 border-teal-500/20 bg-teal-500/5 shadow-[0_0_8px_rgba(20,184,166,0.12)]',
        neonActive: 'text-teal-405 border-teal-400 bg-slate-900 shadow-[0_0_16px_rgba(20,184,166,0.45)] font-black'
    },
    indigo: {
        bgActive: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        bgNormal: 'bg-indigo-500/10 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border-transparent',
        iosBg: 'bg-indigo-500',
        neon: 'text-indigo-500 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_8px_rgba(99,102,241,0.12)]',
        neonActive: 'text-indigo-400 border-indigo-400 bg-slate-900 shadow-[0_0_16px_rgba(99,102,241,0.45)] font-black'
    },
    rose: {
        bgActive: 'bg-rose-100 text-rose-700 border-rose-200',
        bgNormal: 'bg-rose-500/10 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border-transparent',
        iosBg: 'bg-rose-500',
        neon: 'text-rose-500 dark:text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_8px_rgba(244,63,94,0.12)]',
        neonActive: 'text-rose-400 border-rose-400 bg-slate-900 shadow-[0_0_16px_rgba(244,63,94,0.45)] font-black'
    },
    emerald: {
        bgActive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        bgNormal: 'bg-emerald-500/10 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border-transparent',
        iosBg: 'bg-emerald-500',
        neon: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.12)]',
        neonActive: 'text-emerald-400 border-emerald-400 bg-slate-900 shadow-[0_0_16px_rgba(16,185,129,0.45)] font-black'
    },
    purple: {
        bgActive: 'bg-purple-100 text-purple-700 border-purple-200',
        bgNormal: 'bg-purple-500/10 dark:bg-purple-950/25 text-purple-600 dark:text-purple-400 border-transparent',
        iosBg: 'bg-purple-500',
        neon: 'text-purple-500 dark:text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[0_0_8px_rgba(168,85,247,0.12)]',
        neonActive: 'text-purple-400 border-purple-400 bg-slate-900 shadow-[0_0_16px_rgba(168,85,247,0.45)] font-black'
    },
    slate: {
        bgActive: 'bg-slate-200 text-slate-800 border-slate-300',
        bgNormal: 'bg-slate-500/10 dark:bg-slate-950/25 text-slate-600 dark:text-slate-400 border-transparent',
        iosBg: 'bg-slate-500',
        neon: 'text-slate-500 dark:text-slate-400 border-slate-500/20 bg-slate-500/5 shadow-[0_0_8px_rgba(100,116,139,0.12)]',
        neonActive: 'text-slate-405 border-slate-400 bg-slate-900 shadow-[0_0_16px_rgba(100,116,139,0.45)] font-black'
    },
    cyan: {
        bgActive: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        bgNormal: 'bg-cyan-500/10 dark:bg-cyan-950/25 text-cyan-600 dark:text-cyan-400 border-transparent',
        iosBg: 'bg-cyan-500',
        neon: 'text-cyan-500 dark:text-cyan-400 border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_8px_rgba(6,182,212,0.12)]',
        neonActive: 'text-cyan-400 border-cyan-400 bg-slate-900 shadow-[0_0_16px_rgba(6,182,212,0.45)] font-black'
    },
    pink: {
        bgActive: 'bg-pink-100 text-pink-700 border-pink-200',
        bgNormal: 'bg-pink-500/10 dark:bg-pink-950/25 text-pink-600 dark:text-pink-400 border-transparent',
        iosBg: 'bg-pink-500',
        neon: 'text-pink-500 dark:text-pink-400 border-pink-500/20 bg-pink-500/5 shadow-[0_0_8px_rgba(236,72,153,0.12)]',
        neonActive: 'text-pink-400 border-pink-400 bg-slate-900 shadow-[0_0_16px_rgba(236,72,153,0.45)] font-black'
    },
    violet: {
        bgActive: 'bg-violet-100 text-violet-700 border-violet-200',
        bgNormal: 'bg-violet-500/10 dark:bg-violet-950/25 text-violet-600 dark:text-violet-400 border-transparent',
        iosBg: 'bg-violet-500',
        neon: 'text-violet-500 dark:text-violet-400 border-violet-500/20 bg-violet-500/5 shadow-[0_0_8px_rgba(139,92,246,0.12)]',
        neonActive: 'text-violet-400 border-violet-400 bg-slate-900 shadow-[0_0_16px_rgba(139,92,246,0.45)] font-black'
    },
    orange: {
        bgActive: 'bg-orange-100 text-orange-700 border-orange-200',
        bgNormal: 'bg-orange-500/10 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400 border-transparent',
        iosBg: 'bg-orange-500',
        neon: 'text-orange-500 dark:text-orange-400 border-orange-500/20 bg-orange-500/5 shadow-[0_0_8px_rgba(249,115,22,0.12)]',
        neonActive: 'text-orange-400 border-orange-400 bg-slate-900 shadow-[0_0_16px_rgba(249,115,22,0.45)] font-black'
    }
};

const THREED_COLORS = {
    amber: { bg: 'bg-amber-500', shadow: 'shadow-[0_4px_0_#b45309,0_8px_16px_rgba(180,83,9,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#b45309,0_3px_6px_rgba(180,83,9,0.25)]', text: 'text-amber-50', textActive: 'text-white' },
    blue: { bg: 'bg-blue-500', shadow: 'shadow-[0_4px_0_#1d4ed8,0_8px_16px_rgba(29,78,216,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#1d4ed8,0_3px_6px_rgba(29,78,216,0.25)]', text: 'text-blue-50', textActive: 'text-white' },
    fuchsia: { bg: 'bg-fuchsia-500', shadow: 'shadow-[0_4px_0_#a21caf,0_8px_16px_rgba(162,28,175,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#a21caf,0_3px_6px_rgba(162,28,175,0.25)]', text: 'text-fuchsia-50', textActive: 'text-white' },
    teal: { bg: 'bg-teal-500', shadow: 'shadow-[0_4px_0_#0f766e,0_8px_16px_rgba(15,118,110,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#0f766e,0_3px_6px_rgba(15,118,110,0.25)]', text: 'text-teal-50', textActive: 'text-white' },
    indigo: { bg: 'bg-indigo-500', shadow: 'shadow-[0_4px_0_#4338ca,0_8px_16px_rgba(67,56,202,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#4338ca,0_3px_6px_rgba(67,56,202,0.25)]', text: 'text-indigo-50', textActive: 'text-white' },
    rose: { bg: 'bg-rose-500', shadow: 'shadow-[0_4px_0_#be123c,0_8px_16px_rgba(190,18,60,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#be123c,0_3px_6px_rgba(190,18,60,0.25)]', text: 'text-rose-50', textActive: 'text-white' },
    emerald: { bg: 'bg-emerald-500', shadow: 'shadow-[0_4px_0_#0479.0.0_8px_16px_rgba(4,120,87,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#0479.0.0_3px_6px_rgba(4,120,87,0.25)]', text: 'text-emerald-50', textActive: 'text-white' },
    purple: { bg: 'bg-purple-500', shadow: 'shadow-[0_4px_0_#6d29.0.0_8px_16px_rgba(109,40,217,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#6d29.0.0_3px_6px_rgba(109,40,217,0.25)]', text: 'text-purple-50', textActive: 'text-white' },
    slate: { bg: 'bg-slate-500', shadow: 'shadow-[0_4px_0_#334155,0_8px_16px_rgba(51,65,85,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#334155,0_3px_6px_rgba(51,65,85,0.25)]', text: 'text-slate-50', textActive: 'text-white' },
    cyan: { bg: 'bg-cyan-500', shadow: 'shadow-[0_4px_0_#0e7490,0_8px_16px_rgba(14,116,144,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#0e7490,0_3px_6px_rgba(14,116,144,0.25)]', text: 'text-cyan-50', textActive: 'text-white' },
    pink: { bg: 'bg-pink-500', shadow: 'shadow-[0_4px_0_#be185d,0_8px_16px_rgba(190,24,93,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#be185d,0_3px_6px_rgba(190,24,93,0.25)]', text: 'text-pink-50', textActive: 'text-white' },
    violet: { bg: 'bg-violet-500', shadow: 'shadow-[0_4px_0_#6d29.0.0_8px_16px_rgba(109,40,217,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#6d29.0.0_3px_6px_rgba(109,40,217,0.25)]', text: 'text-violet-50', textActive: 'text-white' },
    orange: { bg: 'bg-orange-500', shadow: 'shadow-[0_4px_0_#c2410c,0_8px_16px_rgba(194,65,12,0.35)]', activeShadow: 'shadow-[0_1.5px_0_#c2410c,0_3px_6px_rgba(194,65,12,0.25)]', text: 'text-orange-50', textActive: 'text-white' },
};

export const SystemIcon = ({ id, icon: Icon, active, size = 18 }) => {
    // Se for m√≥dulo Google Workspace, renderiza com fidelidade o vetor oficial multi-cor do Google
    if (id === 'google_meet' || id === 'portal_meet') return <GoogleMeetIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_sheets' || id === 'portal_sheets') return <GoogleSheetsIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_docs' || id === 'portal_docs') return <GoogleDocsIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_tasks' || id === 'portal_google_tasks') return <GoogleTasksIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_calendar' || id === 'portal_calendar') return <GoogleCalendarIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'gmail_oficial' || id === 'portal_gmail') return <GoogleGmailIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_forms' || id === 'portal_forms') return <GoogleFormsIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;
    if (id === 'google_classroom' || id === 'portal_classroom') return <GoogleClassroomIcon size={size + 2} className={`shrink-0 ${active ? "drop-shadow-md scale-110" : "hover:scale-105"}`} />;

    const context = useContext(ChurchContext);
    const pack = context?.db?.igreja?.pacote_icones || 'gipp';
    
    if (!Icon) return null;
    
    const color = getModuleColor(id);
    const themeClass = COLOR_CLASSES[color] || COLOR_CLASSES.indigo;

    // GIPP 3D Esf√©rico (Claymorphism)
    if (pack === '3d') {
        const threed = THREED_COLORS[color] || THREED_COLORS.indigo;
        if (active) {
            return (
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-t border-white/40 shadow-inner ${threed.bg} ${threed.textActive} ${threed.activeShadow} translate-y-[2.5px] scale-105 duration-200 transition-all`}>
                    <Icon size={size - 2} strokeWidth={2.6} className="shrink-0 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.35)] animate-pulse" />
                </div>
            );
        }
        return (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-t border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 hover:translate-y-[1px] ${threed.bg} ${threed.text} ${threed.shadow}`}>
                <Icon size={size - 2} strokeWidth={2.2} className="shrink-0 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.3)]" />
            </div>
        );
    }

    // GIPP (Padr√£o Tecnol√≥gico/Neon)
    if (pack === 'gipp') {
        if (active) {
            return (
                <div className={`p-1.5 rounded-[10px] border-2 flex items-center justify-center shrink-0 scale-110 duration-300 font-mono ${themeClass.neonActive}`}>
                    <Icon size={size - 1} strokeWidth={2.4} className="shrink-0 animate-pulse text-white" />
                </div>
            );
        }
        return (
            <div className={`p-1.5 rounded-[10px] border transition-all duration-300 flex items-center justify-center shrink-0 hover:scale-110 ${themeClass.neon}`}>
                <Icon size={size - 1} strokeWidth={1.8} className="shrink-0" />
            </div>
        );
    }

    // Se o pr√≥prio item do sidebar estiver ativo, o fundo do link do sidebar √© roxo/azul gradiente.
    // Nesse caso, o √≠cone precisa de alto contraste sobre o fundo colorido.
    if (active) {
        if (pack === 'android') {
            return (
                <div className="w-8 h-8 rounded-full bg-white text-indigo-700 shadow-md flex items-center justify-center shrink-0 scale-110 duration-300">
                    <Icon size={size} strokeWidth={2.3} className="shrink-0" />
                </div>
            );
        }
        if (pack === 'ios') {
            return (
                <div className="w-8 h-8 rounded-[10px] bg-white text-indigo-700 shadow-md flex items-center justify-center shrink-0 scale-110 duration-300">
                    <Icon size={size - 2} strokeWidth={1.8} className="shrink-0 animate-pulse" />
                </div>
            );
        }
        // Windows 11
        return (
            <div className="p-1.5 rounded-[8px] bg-white/20 border border-white/30 text-white shadow-sm flex items-center justify-center shrink-0 scale-105 duration-300">
                <Icon size={size} strokeWidth={1.6} className="shrink-0" />
            </div>
        );
    }

    if (pack === 'android') {
        return (
            <div className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center border shrink-0 hover:scale-105 ${themeClass.bgNormal}`}>
                <Icon size={size} strokeWidth={2.4} className="shrink-0" />
            </div>
        );
    }

    if (pack === 'ios') {
        return (
            <div className={`w-8 h-8 rounded-[10px] transition-all duration-350 flex items-center justify-center shrink-0 shadow-[0_2.5px_5px_rgba(0,0,0,0.12)] hover:scale-105 ${themeClass.iosBg}`}>
                <Icon size={size - 2} strokeWidth={2.0} className="text-white shrink-0" />
            </div>
        );
    }

    // Windows 11 Default (Fluent Modern)
    return (
        <div className={`p-1.5 rounded-[8px] transition-all duration-300 flex items-center justify-center border shrink-0 hover:scale-105 bg-slate-500/5 dark:bg-slate-900/40 border-slate-200/20 dark:border-slate-800/20 text-slate-500 dark:text-slate-400`}>
            <Icon size={size} strokeWidth={1.5} className="shrink-0" />
        </div>
    );
};
export const THEME_COLORS = ['amber', 'blue', 'purple', 'orange', 'emerald', 'pink', 'rose', 'indigo', 'teal', 'cyan', 'slate'];
export const REGRA_DOMINGOS = ['1¬∫ Domingo', '2¬∫ Domingo', '3¬∫ Domingo', '4¬∫ Domingo', '√ölt. Domingo', 'Consultar Avisos'];

export const PortalHeader = ({ title, subtitle, icon: Icon, gradientTo, children }) => {
    return (
        <div className="relative overflow-hidden p-8 md:p-10 rounded-[2.5rem] shadow-2xl mb-8 border border-white/20 group animate-entrance w-full shrink-0" style={{ background: `linear-gradient(135deg, var(--primary) 0%, ${gradientTo} 100%)` }}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/20 blur-[80px] rounded-full pointer-events-none group-hover:scale-[1.5] transition-transform duration-1000 ease-in-out"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/30 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/30 flex items-center justify-center text-white shadow-xl shrink-0 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                        {Icon && <Icon size={36} className="drop-shadow-md" />}
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg mb-2">{title}</h2>
                        <p className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-[0.2em] drop-shadow-sm">{subtitle}</p>
                    </div>
                </div>
                {children && <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-end">{children}</div>}
            </div>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed z-[9999] flex flex-col gap-3 pointer-events-none print:hidden top-6 right-6">
      {toasts.map(toast => {
        // Standard modern gradient style for other themes
        return (
          <div key={toast.id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] text-white min-w-[340px] max-w-md pointer-events-auto transform transition-all duration-500 animate-slide-in backdrop-blur-2xl border border-white/20 ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90' : toast.type === 'error' ? 'bg-gradient-to-r from-rose-600/90 to-red-600/90' : 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90'}`}> 
            <div className="p-2 bg-white/20 rounded-full shrink-0 shadow-inner"> 
              {toast.type === 'success' && <CheckCircle size={24} className="animate-pulse"/>} 
              {toast.type === 'error' && <AlertCircle size={24} className="animate-pulse"/>} 
              {toast.type === 'info' && <Info size={24} className="animate-pulse"/>} 
            </div> 
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-wide mb-0.5 uppercase">{toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Erro' : 'Informa√ß√£o'}</h4>
              <p className="text-xs text-white/90 font-medium leading-relaxed">{toast.message}</p>
            </div> 
            <button onClick={() => removeToast(toast.id)} className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X size={18}/></button> 
          </div>
        );
      })} 
    </div>
  );
};

export const BackupModal = ({ backupState, onConfirm, onCancel }) => {
    if (!backupState.isOpen) return null;
    const { mode, stage, progress, stats, processedLogs, currentStepText } = backupState;

    const StatsDisplay = ({ data }) => {
        if (!data) return null;
        const items = [
            { label: 'Membros', count: data.membros || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Financeiro', count: data.financeiro || 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'C√©lulas', count: data.celulas || 0, icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Agenda', count: data.agenda || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Carn√™s', count: data.carnes || 0, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Usu√°rios', count: data.usuarios || 0, icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
        ];

        return (
            <div className="grid grid-cols-2 gap-3 mb-4">
                {items.map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${item.bg}`}>
                        <div className={`p-1.5 rounded-lg bg-white ${item.color}`}><item.icon size={16}/></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                            <p className={`text-sm font-black ${item.color}`}>{item.count}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ChecklistDisplay = ({ logs }) => {
        if (!logs || logs.length === 0) return null;
        return (
            <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-50/50 my-3">
                <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200/60 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">M√≥dulo / Tabela do Sistema</span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Status / Registros</span>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 font-sans text-xs">
                    {logs.map((log, idx) => (
                        <div key={idx} className={`px-4 py-2 flex items-center justify-between transition-colors ${log.status === 'processing' ? 'bg-indigo-50/50' : ''}`}>
                            <div className="flex items-center gap-2">
                                {log.status === 'success' && <Check className="text-emerald-500 font-black" size={14}/>}
                                {log.status === 'processing' && <Loader2 className="text-indigo-500 animate-spin" size={14}/>}
                                {log.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>}
                                <span className={`font-bold ${log.status === 'success' ? 'text-slate-700' : log.status === 'processing' ? 'text-indigo-600 font-extrabold' : 'text-slate-400'}`}>
                                    {log.label}
                                </span>
                            </div>
                            <span className={`font-mono font-bold ${log.status === 'success' ? 'text-emerald-600' : log.status === 'processing' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                                {log.status === 'success' ? `${log.count} reg.` : log.status === 'processing' ? 'processando...' : 'aguardando'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[11000] flex items-center justify-center p-4 backdrop-blur-md animate-entrance">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="p-8 pb-4 text-center overflow-y-auto flex-1">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${mode==='import'?'bg-amber-100 text-amber-600':'bg-indigo-100 text-indigo-600'}`}>
                        {mode === 'import' ? <UploadCloud size={40}/> : <Database size={40}/>}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        {mode === 'logout' ? 'Backup ao Sair' : mode === 'export' ? 'Exportar Backup' : 'Restaurar Backup'}
                    </h3>
                    
                    {stage === 'initial' && mode === 'import' && <p className="text-slate-500 font-medium px-4 mb-4">O sistema ser√° atualizado com os seguintes dados:</p>}
                    {stage === 'initial' && mode === 'export' && <p className="text-slate-500 font-medium px-4 mb-4">O seguinte conte√∫do ser√° salvo no arquivo:</p>}
                    {stage === 'initial' && mode === 'logout' && <p className="text-slate-500 font-medium px-4 mb-4">Deseja realizar uma c√≥pia de seguran√ßa antes de sair?</p>}
                    
                    {stage === 'processing' && (
                        <div className="space-y-1">
                            <p className="text-slate-700 font-black px-4 flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-600"/> {currentStepText || 'Processando tabelas do sistema...'}
                            </p>
                            <p className="text-xs text-slate-400 font-bold">Por favor, mantenha esta aba aberta.</p>
                        </div>
                    )}
                    {stage === 'finished' && mode === 'import' && <p className="text-emerald-600 font-extrabold px-4 mb-4">Importa√ß√£o conclu√≠da com sucesso! Relat√≥rio do checklist:</p>}
                    {stage === 'finished' && mode === 'export' && <p className="text-emerald-600 font-extrabold px-4 mb-4">Backup conclu√≠do! Relat√≥rio do checklist:</p>}

                    {/* Initial Summary */}
                    {stage === 'initial' && stats && (
                        <div className="px-2 pb-2">
                            <StatsDisplay data={stats} />
                        </div>
                    )}

                    {/* Checklists for Processing and Finished stage */}
                    {(stage === 'processing' || stage === 'finished') && processedLogs && (
                        <div className="px-2">
                            <ChecklistDisplay logs={processedLogs} />
                        </div>
                    )}
                </div>

                <div className="p-8 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    {stage === 'initial' && (
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={onCancel} className="flex-1 bg-white border border-slate-200">
                                {mode === 'logout' ? 'N√£o, Apenas Sair' : 'Cancelar'}
                            </Button>
                            <Button variant="primary" onClick={onConfirm} className="flex-1">
                                {mode === 'logout' ? 'Sim, Backup e Sair' : mode === 'import' ? 'Confirmar Importa√ß√£o' : 'Confirmar Exporta√ß√£o'}
                            </Button>
                        </div>
                    )}
                    {stage === 'processing' && (
                        <div className="space-y-2">
                            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300" style={{width: `${progress}%`}}></div>
                            </div>
                            <p className="text-center text-xs font-black text-indigo-600">{progress}% Conclu√≠do</p>
                        </div>
                    )}
                    {stage === 'finished' && (
                        <Button variant="success" onClick={onCancel} className="w-full">
                            {mode === 'logout' ? 'Saindo...' : 'Fechar Janela'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, onCancel, title, message, confirmText = "Confirmar", cancelText = "Cancelar", variant = "danger" }) => { 
  if (!isOpen) return null; 
  return ( 
    <div className="fixed inset-0 bg-slate-900/60 z-[10000] flex items-center justify-center p-4 animate-entrance backdrop-blur-md no-print"> 
      <div className="bg-white/90 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50 ring-1 ring-white/20 relative"> 
        <div className="p-10 flex flex-col items-center text-center gap-6 relative z-10">
          <div className={`p-5 rounded-full shadow-lg ${variant === 'danger' ? 'bg-rose-100 text-rose-600' : variant === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{variant === 'danger' ? <Trash2 size={40}/> : variant === 'success' ? <CheckCircle size={40}/> : <Info size={40}/>}</div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-800 mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-base leading-relaxed font-medium">{message}</p>
          </div>
        </div> 
        <div className="p-8 bg-white/60 backdrop-blur-md flex flex-col sm:flex-row gap-4 border-t border-white/50">
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); if (onCancel) onCancel(); onClose(); }} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50">{cancelText}</Button>
          <Button variant={variant as any} onClick={(e) => { e.stopPropagation(); if (onConfirm) onConfirm(); onClose(); }} className="flex-1">{confirmText}</Button>
        </div> 
      </div> 
    </div> 
  ); 
};

export const parseFlexibleDate = (str: any): Date | null => {
    if (!str) return null;
    const s = String(str).trim();
    const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
        const [_, day, month, year] = dmyMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
};

// --- GENERIC TABLE ---
export const GenericTable = ({ 
  data, 
  columns, 
  title, 
  type, 
  onDeleteOverride = undefined, 
  customActions = undefined, 
  showDeleted = false, 
  onSelectionChange = undefined 
}: { 
  data: any; 
  columns: any; 
  title: any; 
  type: any; 
  onDeleteOverride?: any; 
  customActions?: any; 
  showDeleted?: boolean; 
  onSelectionChange?: any; 
}) => { 
  const { openModal, deleteItem, user } = useContext(ChurchContext); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [colFilters, setColFilters] = useState<Record<string, any>>({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
  const [catSearchTerms, setCatSearchTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (activeFilterCol && !(e.target as HTMLElement).closest('.filter-popup-container')) {
        setActiveFilterCol(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeFilterCol]);

  const getUniqueColumnValues = (colKey: string, colSpec: any) => {
      const vals = new Set<string>();
      processedData.forEach(item => {
          let valStr = '';
          let rawVal = item[colSpec.key];
          if (colSpec.render) {
              try {
                  const rendered = colSpec.render(item);
                  if (typeof rendered === 'string' || typeof rendered === 'number') {
                      valStr = String(rendered);
                  } else {
                      valStr = safeText(rawVal);
                  }
              } catch (e) {
                  valStr = safeText(rawVal);
              }
          } else {
              valStr = safeText(rawVal);
          }
          if (valStr.trim() !== '') {
              vals.add(valStr.trim());
          }
      });
      return Array.from(vals).sort();
  };

  const detectColumnDataType = (colKey: string, uniqueVals: string[]) => {
      const lowerKey = colKey.toLowerCase();
      if (lowerKey.includes('status') || lowerKey.includes('tipo') || lowerKey.includes('categoria')) {
          return 'categorical';
      }
      
      if (uniqueVals.length <= 15) {
          return 'categorical';
      }
      
      let numericCount = 0;
      let dateCount = 0;
      let totalCount = uniqueVals.length;
      
      if (totalCount === 0) return 'text';
      
      uniqueVals.forEach(v => {
          const stripped = v.replace(/[^\d.,-]/g, '').replace(',', '.');
          if (stripped !== '' && !isNaN(parseFloat(stripped))) {
              numericCount++;
          }
          const isDate = !isNaN(Date.parse(v)) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v);
          if (isDate) {
              dateCount++;
          }
      });
      
      if (numericCount / totalCount > 0.8) return 'numeric';
      if (dateCount / totalCount > 0.8) return 'date';
      return 'text';
  };

  const renderColumnFilterOptions = (colKey: string, colSpec: any) => {
      const uniqueVals = getUniqueColumnValues(colKey, colSpec);
      const dataType = detectColumnDataType(colKey, uniqueVals);
      const currentFilter = colFilters[colKey] as any;
      const filterValue = typeof currentFilter === 'object' ? (currentFilter?.value || '') : (currentFilter || '');
      const operator = typeof currentFilter === 'object' ? (currentFilter?.operator || '') : '';

      switch (dataType) {
          case 'categorical': {
              const term = catSearchTerms[colKey] || '';
              const filteredVals = uniqueVals.filter(v => v.toLowerCase().includes(term.toLowerCase()));
              const selected = currentFilter?.selectedValues || [];
              
              return (
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Valores √önicos</span>
                      {uniqueVals.length > 5 && (
                          <input 
                              type="text"
                              placeholder="Pesquisar op√ß√µes..."
                              value={term}
                              onChange={e => setCatSearchTerms({ ...catSearchTerms, [colKey]: e.target.value })}
                              className="px-2 py-1 text-[10px] border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-indigo-500 w-full"
                          />
                      )}
                      <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 custom-scrollbar pr-1">
                          {filteredVals.map((v, idx) => {
                              const isChecked = selected.some((sel: string) => sel.toLowerCase() === v.toLowerCase());
                              return (
                                  <label key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-indigo-600 cursor-pointer">
                                      <input 
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={e => {
                                              let updatedSelected = [...selected];
                                              if (e.target.checked) {
                                                  updatedSelected.push(v);
                                              } else {
                                                  updatedSelected = updatedSelected.filter((sel: string) => sel.toLowerCase() !== v.toLowerCase());
                                              }
                                              setColFilters({
                                                  ...colFilters,
                                                  [colKey]: {
                                                      operator: 'in',
                                                      value: '',
                                                      selectedValues: updatedSelected
                                                  }
                                              });
                                          }}
                                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span className="truncate">{v}</span>
                                  </label>
                              );
                          })}
                          {filteredVals.length === 0 && (
                              <span className="text-[10px] text-slate-400 italic">Sem resultados</span>
                          )}
                      </div>
                  </div>
              );
          }
          case 'numeric': {
              const currentOp = operator || 'gt';
              return (
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Condi√ß√£o Num√©rica</span>
                      <select 
                          value={currentOp}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: e.target.value,
                                      value: filterValue,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      >
                          <option value="gt">Maior que (&gt;)</option>
                          <option value="lt">Menor que (&lt;)</option>
                          <option value="eq">Igual a (=)</option>
                      </select>
                      <input 
                          type="number"
                          step="any"
                          placeholder="Valor num√©rico..."
                          value={filterValue}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: currentOp,
                                      value: e.target.value,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      />
                  </div>
              );
          }
          case 'date': {
              const currentOp = operator || 'before';
              return (
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Filtro Temporal</span>
                      <select 
                          value={currentOp}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: e.target.value,
                                      value: filterValue,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      >
                          <option value="before">Antes de</option>
                          <option value="after">Depois de</option>
                          <option value="equals">No dia</option>
                      </select>
                      <input 
                          type="date"
                          value={filterValue}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: currentOp,
                                      value: e.target.value,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      />
                  </div>
              );
          }
          default: {
              const currentOp = operator || 'contains';
              return (
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Regra de Texto</span>
                      <select 
                          value={currentOp}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: e.target.value,
                                      value: filterValue,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      >
                          <option value="contains">Cont√©m</option>
                          <option value="not_contains">N√£o cont√©m</option>
                          <option value="equals">Igual a</option>
                          <option value="starts">Come√ßa com</option>
                          <option value="ends">Termina com</option>
                      </select>
                      <input 
                          type="text"
                          placeholder="Texto para buscar..."
                          value={filterValue}
                          onChange={e => {
                              setColFilters({
                                  ...colFilters,
                                  [colKey]: {
                                      operator: currentOp,
                                      value: e.target.value,
                                      selectedValues: []
                                  }
                              });
                          }}
                          className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-indigo-500 w-full"
                      />
                  </div>
              );
          }
      }
  };

  
  const processedData = useMemo(() => {
      let result = data ? [...data] : []; 
      if (!showDeleted) result = result.filter(item => !item.deleted);
      if (type === 'membro') result.sort((a, b) => safeText(a.nome).localeCompare(safeText(b.nome))); 
      return result;
  }, [data, showDeleted, type]);
  
  const filteredData = useMemo(() => {
      return processedData.filter(item => { 
          const isMaster = String(user?.nivel).toLowerCase() === 'master';
          
          if (!isMaster) {
              const userCongId = user?.congregacao_id || 'sede';
              const itemCongId = item.congregacao_id || 'sede';
              if (itemCongId !== userCongId) return false; 
          }

          if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const matchGlobal = Object.entries(item).some(([key, val]) => {
                  if (['foto', 'logo', 'comprovante', 'banco_logo_base64', 'capa', 'icone_sistema'].includes(key)) return false;
                  return safeText(val).toLowerCase().includes(term);
              });
              if (!matchGlobal) return false;
          }

          // Column filters
          for (const [colKey, filterVal] of Object.entries(colFilters)) {
              if (!filterVal) continue;
              const col = columns.find(c => (c.key === colKey || c.header === colKey));
              if (!col) continue;

              let textToCompare = '';
              let rawVal = item[col.key];
              if (col.render) {
                  try {
                      const rendered = col.render(item);
                      if (typeof rendered === 'string' || typeof rendered === 'number') {
                          textToCompare = String(rendered);
                      } else {
                          textToCompare = safeText(rawVal);
                      }
                  } catch (e) {
                      textToCompare = safeText(rawVal);
                  }
              } else {
                  textToCompare = safeText(rawVal);
              }

              if (typeof filterVal === 'string') {
                  const term = filterVal.toLowerCase();
                  if (!textToCompare.toLowerCase().includes(term)) {
                      return false;
                  }
              } else {
                  const { operator, value, selectedValues } = filterVal as any;
                  
                  if (operator === 'in') {
                      if (selectedValues && selectedValues.length > 0) {
                          const match = selectedValues.some((v: string) => textToCompare.toLowerCase() === v.toLowerCase());
                          if (!match) return false;
                      }
                  } else if (value !== undefined && value !== '') {
                      const valStr = String(value).toLowerCase();
                      const compStr = textToCompare.toLowerCase();
                      
                      switch (operator) {
                          case 'contains':
                              if (!compStr.includes(valStr)) return false;
                              break;
                          case 'not_contains':
                              if (compStr.includes(valStr)) return false;
                              break;
                          case 'equals':
                              if (compStr !== valStr) return false;
                              break;
                          case 'starts':
                              if (!compStr.startsWith(valStr)) return false;
                              break;
                          case 'ends':
                              if (!compStr.endsWith(valStr)) return false;
                              break;
                          case 'gt': {
                              const numItem = parseFloat(textToCompare.replace(/[^\d.,-]/g, '').replace(',', '.'));
                              const numFilter = parseFloat(value);
                              if (isNaN(numItem) || isNaN(numFilter) || numItem <= numFilter) return false;
                              break;
                          }
                          case 'lt': {
                              const numItem = parseFloat(textToCompare.replace(/[^\d.,-]/g, '').replace(',', '.'));
                              const numFilter = parseFloat(value);
                              if (isNaN(numItem) || isNaN(numFilter) || numItem >= numFilter) return false;
                              break;
                          }
                          case 'eq': {
                              const numItem = parseFloat(textToCompare.replace(/[^\d.,-]/g, '').replace(',', '.'));
                              const numFilter = parseFloat(value);
                              if (isNaN(numItem) || isNaN(numFilter) || numItem !== numFilter) return false;
                              break;
                          }
                          case 'before': {
                              const dateItem = parseFlexibleDate(textToCompare);
                              const dateFilter = parseFlexibleDate(value);
                              if (!dateItem || !dateFilter || isNaN(dateItem.getTime()) || isNaN(dateFilter.getTime()) || dateItem >= dateFilter) return false;
                              break;
                          }
                          case 'after': {
                              const dateItem = parseFlexibleDate(textToCompare);
                              const dateFilter = parseFlexibleDate(value);
                              if (!dateItem || !dateFilter || isNaN(dateItem.getTime()) || isNaN(dateFilter.getTime()) || dateItem <= dateFilter) return false;
                              break;
                          }
                      }
                  }
              }
          }

          return true;
      });
  }, [processedData, searchTerm, user, colFilters, columns]);
  
  useEffect(() => { setCurrentPage(1); }, [searchTerm, colFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => { return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); }, [filteredData, currentPage, itemsPerPage]);

  const handleDelete = (e, id) => { e.stopPropagation(); if (onDeleteOverride) onDeleteOverride(id); else deleteItem(type, id); }; 
  const handleSelect = (id) => { const newSelection = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]; setSelectedIds(newSelection); if(onSelectionChange) onSelectionChange(newSelection); };
  const toggleSelectAll = () => { if(selectedIds.length === paginatedData.length) { setSelectedIds([]); if(onSelectionChange) onSelectionChange([]); } else { const all = paginatedData.map(d=>d.id); setSelectedIds(all); if(onSelectionChange) onSelectionChange(all); } };

  const exportToCSV = () => {
      if (filteredData.length === 0) return;
      const headers = columns.map(c => c.header).join(',');
      const rows = filteredData.map(item => {
          return columns.map(c => {
              let val = item[c.key];
              if (val === null || val === undefined) val = '';
              if (typeof val === 'object') val = safeText(val);
              return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
          }).join(',');
      });
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `GIPP_Export_${type}_${getTodayDate()}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="glass-modern rounded-[2.5rem] shadow-xl border border-white/40 flex flex-col h-full animate-entrance overflow-hidden ring-1 ring-white/30 relative group">
      {title && (
          <div className="p-8 border-b border-white/30 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-b from-white/60 to-white/20 backdrop-blur-xl relative z-10">
            <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight text-gradient">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm">
                    {filteredData.length} registros
                </div>
            </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-72 group search-container">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                <input type="text" placeholder="Pesquisar..." className="pl-12 pr-4 py-3 border border-white/50 bg-white/40 rounded-2xl w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none text-sm transition-all shadow-inner backdrop-blur-sm font-medium text-slate-700 placeholder:text-slate-400 uppercase" value={searchTerm} onChange={e=>setSearchTerm(((e.target.value || "").toUpperCase() || "").toUpperCase())}/>
            </div>
            <Button onClick={exportToCSV} variant="secondary" className="shadow-sm whitespace-nowrap px-4" title="Exportar para Excel (CSV)"><DownloadCloud size={20}/></Button>
            {title && !showDeleted && <Button onClick={() => openModal(type)} variant="primary" className="shadow-lg shadow-indigo-500/30 whitespace-nowrap"><Plus size={20}/> Novo</Button>}
            </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1 bg-white/20 relative z-10 custom-scrollbar flex flex-col justify-between">
        <table className="min-w-full divide-y divide-white/40">
          <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-20 shadow-sm">
            <tr>
                {onSelectionChange && <th className="px-4 py-5 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/></th>}
                {columns.map((c, i) => {
                  const colKey = c.key || c.header;
                  const filterVal = colFilters[colKey];
                  const textValue = typeof filterVal === 'object' ? (filterVal?.value || '') : (filterVal || '');
                  const isFiltered = filterVal && (
                      typeof filterVal === 'string' 
                      ? filterVal !== '' 
                      : (filterVal.value !== '' || (filterVal.selectedValues && filterVal.selectedValues.length > 0))
                  );

                  return (
                    <th key={i} className="px-8 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] relative">
                      <div className="flex flex-col gap-1.5 min-w-[140px] relative filter-popup-container">
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="truncate">{c.header}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFilterCol(activeFilterCol === colKey ? null : colKey);
                            }}
                            className={`p-1 rounded-md hover:bg-slate-200/50 transition-colors flex items-center justify-center ${isFiltered ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400'}`}
                            title="Op√ß√µes de filtragem avan√ßada"
                          >
                            <Filter size={12} className={isFiltered ? "fill-indigo-600 text-indigo-600" : "text-slate-400"} />
                          </button>
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="Filtrar..." 
                          value={textValue} 
                          onChange={e => {
                            const val = e.target.value;
                            setColFilters({
                              ...colFilters,
                              [colKey]: typeof filterVal === 'object' 
                                ? { ...filterVal, value: val } 
                                : val
                            });
                          }}
                          className="px-2 py-1 text-[10px] font-semibold border border-slate-200 rounded-lg bg-white/70 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full tracking-normal normal-case"
                          onClick={e => e.stopPropagation()}
                        />

                        {/* Dropdown Menu de Filtro Avan√ßado */}
                        {activeFilterCol === colKey && (
                          <div 
                            className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 text-slate-700 font-sans tracking-normal normal-case flex flex-col gap-3"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Filter size={12} className="text-indigo-500" /> Filtro: {c.header}
                              </span>
                              <button 
                                onClick={() => setActiveFilterCol(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            
                            {renderColumnFilterOptions(colKey, c)}
                            
                            <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
                              <button 
                                onClick={() => {
                                  const newFilters = { ...colFilters };
                                  delete newFilters[colKey];
                                  setColFilters(newFilters);
                                  setActiveFilterCol(null);
                                }}
                                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase"
                              >
                                Limpar
                              </button>
                              <button 
                                onClick={() => setActiveFilterCol(null)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors uppercase shadow-sm"
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="px-8 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] align-top pt-[18px]">A√ß√µes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 bg-transparent">
            {paginatedData.map((item, idx) => (
              <motion.tr 
                key={`${item.id || idx}-${currentPage}-${searchTerm}-${Object.keys(colFilters).length}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                className={`hover:bg-white/60 transition-all duration-300 group/row relative border-l-4 border-transparent hover:border-indigo-500 ${idx % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/10'}`}
              >
                {onSelectionChange && <td className="px-4 py-5"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={()=>handleSelect(item.id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/></td>}
                {columns.map((c, i) => {
                    let cellContent;
                    if (c.render) {
                        const rendered = c.render(item);
                        if (typeof rendered === 'object' && !isValidElement(rendered) && rendered !== null) cellContent = safeRender(rendered);
                        else cellContent = (isValidElement(rendered) || typeof rendered === 'string' || typeof rendered === 'number') ? rendered : safeRender(rendered);
                    } else if (c.key === 'foto') {
                        cellContent = (
                            <div className="h-12 w-12 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-md group-hover/row:scale-110 transition-transform duration-300 relative">
                                {item.foto ? <img src={item.foto} className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={24}/></div>}
                            </div>
                        );
                    } else if (c.key === 'status') {
                        const statusVal = safeText(item[c.key]);
                        const isSuccess = ['pago','Ativo','Concluido','No Campo','Postado','Pronto', 'Validado'].some(v => statusVal.toLowerCase() === v.toLowerCase());
                        const isPending = ['pendente', 'Em Progresso', 'Em Andamento'].some(v => statusVal.toLowerCase() === v.toLowerCase());
                        cellContent = (
                             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center w-fit gap-1.5 transition-all ${isPending ? 'animate-pulse' : ''} ${isSuccess ? 'bg-emerald-400/10 text-emerald-700 border-emerald-400/20' : 'bg-amber-400/10 text-amber-700 border-amber-400/20'}`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                 {statusVal}
                             </span>
                        );
                    } else {
                        cellContent = safeRender(item[c.key]);
                    }
                    return <td key={i} className="px-8 py-5 text-sm text-slate-700 whitespace-nowrap font-medium">{cellContent}</td>;
                })}
                <td className="px-8 py-5 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-3 opacity-60 group-hover/row:opacity-100 transition-all transform translate-x-4 group-hover/row:translate-x-0">
                    {customActions && customActions(item)}
                    {!showDeleted && (
                        <>
                            <button onClick={() => openModal(type, item)} className="p-2.5 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors shadow-sm bg-white border border-indigo-100" title="Editar"><Edit size={18}/></button>
                            <button onClick={(e) => handleDelete(e, item.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors shadow-sm bg-white border border-rose-100" title="Excluir"><Trash2 size={18}/></button>
                        </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {paginatedData.length === 0 && (
                <tr><td colSpan={columns.length + 2} className="px-8 py-10 text-center text-slate-500 italic">Nenhum registro encontrado.</td></tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
            <div className="p-4 border-t border-white/30 bg-white/40 backdrop-blur-md flex items-center justify-between z-20 sticky bottom-0 mt-auto">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
                </span>
                <div className="flex gap-2 mx-auto sm:mx-0">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"><ChevronLeft size={16}/> <span className="text-xs font-bold">Anterior</span></button>
                    <span className="flex items-center justify-center px-4 text-xs font-black text-indigo-700 bg-indigo-50 rounded-xl border border-indigo-100">
                        {currentPage} / {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"><span className="text-xs font-bold">Pr√≥xima</span> <ChevronRight size={16}/></button>
                </div>
            </div>
        )}
      </div>
    </div>
  ); 
};

// --- GENERIC MODAL ---
export const GenericModal = ({ isOpen, onClose, type, data, setData, onSave }) => {
    if (!isOpen) return null;
    const { db, user, addToast } = useContext(ChurchContext); 
    const fileInputRef = useRef(null);
    const [tempMember, setTempMember] = useState({ id: '', funcao: '' });
    const [loadingAiPlan, setLoadingAiPlan] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Crescimento Eclesi√°stico States
    const [membroFormTab, setMembroFormTab] = useState<'dados' | 'crescimento'>('dados');
    const [histDate, setHistDate] = useState('');
    const [histType, setHistType] = useState('Consagra√ß√£o');
    const [histTargetCargo, setHistTargetCargo] = useState('');
    const [histResponsible, setHistResponsible] = useState('');
    const [histAta, setHistAta] = useState('');
    const [editingHistId, setEditingHistId] = useState<string | null>(null);

    const handleAddOrUpdateHistory = () => {
        if (!histDate || !histType || !histResponsible || !histAta) {
            addToast("Por favor, preencha todos os campos obrigat√≥rios do hist√≥rico.", "warning");
            return;
        }

        const currentHistory = Array.isArray(data.crescimento_eclesiastico) ? data.crescimento_eclesiastico : [];

        if (editingHistId) {
            const updated = currentHistory.map(item => {
                if (item.id === editingHistId) {
                    return {
                        ...item,
                        data: histDate,
                        tipo: histType,
                        cargo_alvo: histTargetCargo || '',
                        responsavel: histResponsible,
                        ata: histAta
                    };
                }
                return item;
            });
            setData({ ...data, crescimento_eclesiastico: updated });
            addToast("Hist√≥rico de crescimento eclesi√°stico atualizado com sucesso!", "success");
            setEditingHistId(null);
        } else {
            const newRecord = {
                id: `hist_${Date.now()}`,
                data: histDate,
                tipo: histType,
                cargo_alvo: histTargetCargo || '',
                responsavel: histResponsible,
                ata: histAta
            };
            setData({ ...data, crescimento_eclesiastico: [...currentHistory, newRecord] });
            addToast("Hist√≥rico de crescimento eclesi√°stico adicionado!", "success");
        }

        setHistDate('');
        setHistType('Consagra√ß√£o');
        setHistTargetCargo('');
        setHistResponsible('');
        setHistAta('');
    };

    const handleEditHistory = (record) => {
        setEditingHistId(record.id);
        setHistDate(record.data || '');
        setHistType(record.tipo || 'Consagra√ß√£o');
        setHistTargetCargo(record.cargo_alvo || '');
        setHistResponsible(record.responsavel || '');
        setHistAta(record.ata || '');
    };

    const handleDeleteHistory = (recordId) => {
        const currentHistory = Array.isArray(data.crescimento_eclesiastico) ? data.crescimento_eclesiastico : [];
        const filtered = currentHistory.filter(item => item.id !== recordId);
        setData({ ...data, crescimento_eclesiastico: filtered });
        addToast("Hist√≥rico de crescimento eclesi√°stico removido.", "info");
        if (editingHistId === recordId) {
            setEditingHistId(null);
            setHistDate('');
            setHistType('Consagra√ß√£o');
            setHistTargetCargo('');
            setHistResponsible('');
            setHistAta('');
        }
    };

    const handleInternalSave = async () => {
        setIsSaving(true);
        try { await onSave(); } finally { setIsSaving(false); }
    };

    const getModalTheme = (t) => {
        const themes = {
            membro: { icon: Users, color: 'indigo', title: 'Membro', bg: 'from-indigo-600 via-blue-600 to-indigo-800' },
            visitante: { icon: HeartHandshake, color: 'rose', title: 'Visitante', bg: 'from-rose-500 via-pink-500 to-rose-700' },
            celula: { icon: Share2, color: 'purple', title: 'C√©lula', bg: 'from-purple-600 via-fuchsia-600 to-purple-800' },
            financeiro: { icon: DollarSign, color: 'emerald', title: 'Lan√ßamento', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            entrada: { icon: ArrowUpCircle, color: 'emerald', title: 'Entrada', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            saida: { icon: ArrowDownCircle, color: 'rose', title: 'Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            gestao_despesa: { icon: ArrowDownCircle, color: 'rose', title: 'Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            carne: { icon: CreditCard, color: 'pink', title: 'Carn√™', bg: 'from-pink-500 via-rose-500 to-pink-700' },
            tarefa: { icon: CheckSquare, color: 'amber', title: 'Tarefa/Escala', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            agenda: { icon: Calendar, color: 'indigo', title: 'Evento', bg: 'from-indigo-500 via-purple-500 to-indigo-700' },
            ebd_turma: { icon: Users, color: 'blue', title: 'Turma EBD', bg: 'from-blue-500 via-indigo-500 to-blue-700' },
            ebd_aluno: { icon: UserPlus, color: 'indigo', title: 'Matr√≠cula EBD', bg: 'from-indigo-500 via-purple-500 to-indigo-700' },
            ebd_licao: { icon: BookOpen, color: 'emerald', title: 'Li√ß√£o EBD', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missionario: { icon: Globe, color: 'indigo', title: 'Mission√°rio', bg: 'from-indigo-500 via-blue-500 to-indigo-700' },
            agencia_missoes: { icon: Building2, color: 'blue', title: 'Ag√™ncia', bg: 'from-blue-500 via-cyan-500 to-blue-700' },
            missoes_colaborador: { icon: HeartHandshake, color: 'emerald', title: 'Colaborador', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missoes_financeiro: { icon: DollarSign, color: 'emerald', title: 'Caixa Miss√µes', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missoes_agenda: { icon: Calendar, color: 'amber', title: 'Evento Miss√µes', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            congregacao: { icon: MapPin, color: 'indigo', title: 'Congrega√ß√£o', bg: 'from-indigo-600 via-blue-600 to-indigo-800' },
            fornecedor: { icon: Truck, color: 'slate', title: 'Fornecedor', bg: 'from-slate-600 via-slate-700 to-slate-800' },
            centro_custo: { icon: Landmark, color: 'slate', title: 'Centro de Custo', bg: 'from-slate-600 via-slate-700 to-slate-800' },
            patrimonio: { icon: Package, color: 'emerald', title: 'Patrim√¥nio', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            usuario: { icon: Shield, color: 'slate', title: 'Usu√°rio', bg: 'from-slate-700 via-slate-800 to-slate-900' },
            ministerio: { icon: Briefcase, color: 'indigo', title: 'Minist√©rio', bg: 'from-indigo-500 via-blue-500 to-indigo-700' },
            ministerio_membro: { icon: UserPlus, color: 'blue', title: 'Membro de Minist√©rio', bg: 'from-blue-500 via-cyan-500 to-blue-700' },
            ministerio_evento: { icon: Calendar, color: 'amber', title: 'Evento de Minist√©rio', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            celula_membro: { icon: UserPlus, color: 'purple', title: 'Membro de C√©lula', bg: 'from-purple-500 via-pink-500 to-purple-700' },
            celula_evento: { icon: Calendar, color: 'amber', title: 'Evento de C√©lula', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            celula_relatorio: { icon: FileText, color: 'blue', title: 'Relat√≥rio', bg: 'from-blue-500 via-indigo-500 to-blue-700' },
            fin_entrada_novo: { icon: ArrowUpCircle, color: 'emerald', title: 'Nova Entrada', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            fin_saida_novo: { icon: ArrowDownCircle, color: 'rose', title: 'Nova Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            carne_novo: { icon: CreditCard, color: 'pink', title: 'Novo Carn√™', bg: 'from-pink-500 via-rose-500 to-pink-700' },
        };
        return themes[t] || { icon: Database, color: 'indigo', title: 'Registro', bg: 'from-slate-700 via-slate-800 to-slate-900' };
    };

    const themeInfo = getModalTheme(type);
    const IconComponent = themeInfo.icon;

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedBase64 = await preprocessImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.75 });
                const cacheKey = data?.id ? `modal_${type}_${data.id}_${field}` : `temp_${type || 'misc'}_${field}_${Date.now()}`;
                await storeMedia(cacheKey, compressedBase64);
                setData(prev => ({ 
                    ...prev, 
                    [field]: compressedBase64,
                    [`${field}_cache_key`]: cacheKey
                }));
            } catch (err) {
                console.error("Erro ao pr√©-processar imagem de upload:", err);
                const reader = new FileReader(); 
                reader.onloadend = () => { 
                    setData(prev => ({ ...prev, [field]: reader.result })); 
                }; 
                reader.readAsDataURL(file);
            }
        }
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) { alert("O ficheiro deve ter no m√°ximo 500KB."); return; }
            const reader = new FileReader(); reader.onloadend = () => { setData(prev => ({ ...prev, [field]: reader.result })); }; reader.readAsDataURL(file);
        }
    };

    const renderComprovanteUpload = () => (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2 animate-entrance">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Paperclip size={14}/> Comprovativo / Fatura</h4>
            {data.comprovante ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-2 truncate pr-2"><CheckCircle size={14} className="shrink-0"/> Anexo Guardado</span>
                    <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => { const a = document.createElement('a'); a.href = data.comprovante; a.download = `comprovativo_${Date.now()}`; a.click(); }} className="text-indigo-500 hover:text-indigo-700 text-xs font-bold px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm transition-colors">Ver / Baixar</button>
                        <button type="button" onClick={() => setData({...data, comprovante: null})} className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg shadow-sm transition-colors">Remover</button>
                    </div>
                </div>
            ) : (
                <label className="w-full flex flex-col items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 py-4 rounded-xl cursor-pointer transition-colors text-xs font-bold group px-4 text-center">
                    <UploadCloud size={18} className="group-hover:text-indigo-500 shrink-0"/> <span>Clique para anexar foto ou PDF<br/><span className="text-[10px] text-slate-400 font-medium">Tamanho m√°ximo: 500KB</span></span>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'comprovante')}/>
                </label>
            )}
        </div>
    );

    const renderForm = () => {
        const formType = type === 'financeiro' ? (data.tipo || 'saida') : type;
        const isMaster = String(user?.nivel).toLowerCase() === 'master';
        
        switch(formType) {
             case 'tarefa':
                 return (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput label="Descri√ß√£o da Tarefa" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                            <FormSelect label="Categoria / Tipo" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={[
                                'Escala de Culto', 'Trabalho Evangel√≠stico', 'Obra Social', 'Congresso / Confer√™ncia', 'Casamento', 'Batismo', 'Culto / Celebra√ß√£o', 'Administrativo'
                            ]} />
                            <div className="grid grid-cols-2 gap-4">
                                 <FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} />
                                 <FormSelect label="Prioridade" value={data.prioridade} onChange={v=>setData({...data, prioridade:v})} options={['Alta', 'Normal', 'Baixa']} />
                            </div>
                            <FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Pendente', 'Em Andamento', 'Concluido']} />
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={14}/> Escala / Equipe</h4>
                            <div className="flex gap-2 mb-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Membro</label>
                                    <div className="relative">
                                        <select className="input-futuristic w-full p-2.5 rounded-xl text-sm appearance-none bg-white" value={tempMember.id} onChange={e => setTempMember({...tempMember, id: e.target.value})}>
                                            <option value="">Selecione...</option>
                                            {db.membros.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.cargo})</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                                    </div>
                                </div>
                                <div className="flex-1">
                                     <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fun√ß√£o na Escala</label>
                                     <input type="text" className="input-futuristic w-full p-2.5 rounded-xl text-sm uppercase" placeholder="Ex: Dirigente, Louvor..." value={tempMember.funcao} onChange={e => setTempMember({...tempMember, funcao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})}/>
                                </div>
                                <button onClick={() => { if(!tempMember.id) return; const memberObj = db.membros.find(m => m.id === tempMember.id); const newTeam = [...(data.equipe || [])]; if(newTeam.find(t => t.id === tempMember.id)) { alert("Membro j√° adicionado."); return; } newTeam.push({ id: tempMember.id, nome: memberObj.nome || 'Membro', cargo_eclesiastico: memberObj.cargo || 'Membro', funcao_escala: tempMember.funcao || memberObj.cargo || 'Membro' }); setData({...data, equipe: newTeam}); setTempMember({id: '', funcao: ''}); }} className="bg-indigo-500 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200" type="button"><Plus size={20}/></button>
                            </div>
                            
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {(data.equipe || []).map((member, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{member.nome ? member.nome.charAt(0) : '?'}</div>
                                            <div><p className="font-bold text-sm text-slate-700 leading-tight">{member.nome}</p><p className="text-[10px] text-slate-500">{member.funcao_escala} <span className="opacity-50">‚Ä¢ {member.cargo_eclesiastico}</span></p></div>
                                        </div>
                                        <button onClick={() => { const newTeam = [...data.equipe]; newTeam.splice(idx, 1); setData({...data, equipe: newTeam}); }} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors" type="button"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {(!data.equipe || data.equipe.length === 0) && <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum membro escalado.</p>}
                            </div>
                        </div>
                     </div>
                 );
             case 'agenda':
                 return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="T√≠tulo do Evento" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                             <FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                             <FormInput label="Hora" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})} required/>
                        </div>
                        <FormInput label="Local" value={data.local} onChange={v=>setData({...data, local:v})} placeholder="Ex: Templo Principal"/>
                        <FormSelect label="Tipo de Evento" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Culto', 'Reuni√£o', 'Evento Externo', 'Festividade', 'Ensaio']} />
                        
                        <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-entrance">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Banner / Imagem do Evento (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group shadow-sm shrink-0">
                                    {data.imagem ? <img src={data.imagem} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest text-center w-full h-full flex items-center justify-center">
                                            Upload<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imagem')} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Adicione uma imagem de divulga√ß√£o do evento. Ela aparecer√° em destaque no Informativo Digital dos membros.</p>
                                    {data.imagem && <button type="button" onClick={() => setData({...data, imagem: null})} className="text-[10px] font-bold text-rose-500 mt-2 hover:text-rose-700 transition-colors uppercase tracking-wider">Remover Imagem</button>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 p-5 bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-150 rounded-2xl animate-entrance space-y-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
                                        <Bell size={18} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Lembrete Push Autom√°tico (24h)</h4>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Disparar lembrete push automatizado aos membros inscritos 24h antes</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={data.lembrete_push_ativo || false} onChange={e => setData({...data, lembrete_push_ativo: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            {data.lembrete_push_ativo && (
                                <div className="space-y-3 pt-3 border-t border-indigo-150 animate-entrance">
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-wider mb-2 ml-1">Template de Mensagem Customizado</label>
                                        <textarea 
                                            value={data.lembrete_push_mensagem || ""} 
                                            onChange={e => setData({...data, lembrete_push_mensagem: e.target.value})}
                                            placeholder="Ex: Amanh√£ √†s {hora} teremos nosso {evento} no {local}! N√£o falte."
                                            rows={2} 
                                            className="w-full p-3 rounded-xl border border-indigo-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 resize-none" 
                                        />
                                        <p className="text-[9px] text-indigo-500/80 font-bold mt-1.5 ml-1">
                                            Sugest√£o de vari√°veis: <code className="bg-indigo-150/60 px-1 py-0.5 rounded text-indigo-700">{`{evento}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{hora}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{local}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{data}`}</code>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 );
             case 'fin_entrada_novo':
             case 'entrada':
                 return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Descri√ß√£o / Motivo" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Valor (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} required/>
                            <FormInput label="Data Refer√™ncia" type="date" value={data.data_competencia} onChange={v=>setData({...data, data_competencia:v})} required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect label="Categoria" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={['D√≠zimo', 'Oferta', 'Doa√ß√£o', 'Campanha', 'Vendas', 'Miss√µes', 'Outros']} />
                            <FormSelect label="Forma de Entrada" value={data.forma_pagamento} onChange={v=>setData({...data, forma_pagamento:v})} options={['Dinheiro', 'PIX', 'Cart√£o', 'Transfer√™ncia']} />
                        </div>
                        
                        {isMaster && (
                            <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />
                        )}
                        
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-500 uppercase mb-2">V√≠nculo de Membro (Opcional)</p>
                            <FormSelect label="Selecione o Membro" value={data.membro_id} onChange={v=>setData({...data, membro_id:v})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                        </div>
                        {renderComprovanteUpload()}
                        <input type="hidden" value="entrada" />
                    </div>
                 );
             case 'fin_saida_novo':
             case 'saida':
             case 'gestao_despesa':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Descri√ß√£o da Despesa" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                        <FormInput label="Especifica√ß√£o Detalhada" value={data.especificacao} onChange={v=>setData({...data, especificacao:v})} placeholder="Detalhes do servi√ßo ou produto..."/>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <FormInput label="Valor (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} required/>
                             <FormSelect label="Status Inicial" value={data.status} onChange={v=>setData({...data, status:v})} options={[{label:'Pago', value:'pago'}, {label:'Pendente', value:'pendente'}]} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput 
                                label="Data Vencimento" 
                                type="date" 
                                value={data.data_vencimento} 
                                onChange={v => setData({...data, data_vencimento:v})} 
                                required
                            />
                            {data.status === 'pago' && (
                                <FormInput 
                                    label="Data Pagamento" 
                                    type="date" 
                                    value={data.data_pagamento} 
                                    onChange={v => setData({...data, data_pagamento:v})} 
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect label="Fornecedor" value={data.fornecedor_id} onChange={v=>setData({...data, fornecedor_id:v})} options={db.fornecedores.map(f=>({label: f.nome, value: f.id}))} />
                            <FormSelect label="Centro de Custo" value={data.centro_custo_id} onChange={v=>setData({...data, centro_custo_id:v})} options={db.centro_custo.map(c=>({label: c.nome, value: c.id}))} />
                        </div>

                        {isMaster && (
                            <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />
                        )}

                        {renderComprovanteUpload()}
                        <input type="hidden" value="saida" />
                    </div>
                );
             case 'ministerio': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome do Minist√©rio" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <h4 className="font-bold text-slate-600 mt-2">Lideran√ßa</h4>
                        <FormSelect label="L√≠der Principal" value={data.lider1_id} onChange={v=>setData({...data, lider1_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        <FormSelect label="Segundo L√≠der (Opcional)" value={data.lider2_id} onChange={v=>setData({...data, lider2_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                    </div>
                );
             case 'ministerio_membro': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Selecione o Minist√©rio" value={data.departamento_id} onChange={v=>setData({...data, departamento_id:v})} options={db.departamentos.map(d=>({label: d.nome, value: d.id}))} />
                        <FormSelect label="Selecione o Membro" value={data.membro_id} onChange={v=>setData({...data, membro_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        <FormInput label="Fun√ß√£o no Minist√©rio" value={data.funcao} onChange={v=>setData({...data, funcao:v})} placeholder="Ex: Secret√°rio, Vogal, Regente" required/>
                    </div>
                );
             case 'ministerio_evento': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Minist√©rio Respons√°vel" value={data.departamento_id} onChange={v=>setData({...data, departamento_id:v})} options={db.departamentos.map(d=>({label: d.nome, value: d.id}))} />
                        <FormInput label="T√≠tulo do Evento/Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                            <FormInput label="Hor√°rio" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/>
                        </div>
                        <FormInput label="Mensagem WhatsApp (Opcional)" value={data.whatsapp_msg} onChange={v=>setData({...data, whatsapp_msg:v})} placeholder="Texto padr√£o para envio"/>
                    </div>
                );
             case 'carne_novo': 
             case 'carne':
                return (
                    <div className="grid grid-cols-1 gap-4">
                         <FormInput label="T√≠tulo da Campanha / Carn√™" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                         <FormSelect label="Membro Respons√°vel" value={data.membro_id} onChange={v=>setData({...data, membro_id:v, nome_membro: db.membros.find(m=>m.id===v)?.nome})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                         {!data.id ? (
                             <>
                                 <div className="grid grid-cols-2 gap-4">
                                     <FormInput label="Valor Total (R$)" type="number" step="0.01" value={data.valor_total} onChange={v=>setData({...data, valor_total:v})} required/>
                                     <FormInput label="Qtd. Parcelas" type="number" value={data.qtd_parcelas} onChange={v=>setData({...data, qtd_parcelas:v})} required/>
                                 </div>
                                 <FormInput label="Data 1¬∫ Vencimento" type="date" value={data.primeiro_vencimento} onChange={v => setData({...data, primeiro_vencimento: v})} required/>
                             </>
                         ) : (
                             <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl text-xs text-amber-700 font-bold mt-2">
                                 Aten√ß√£o: Apenas o t√≠tulo e o membro podem ser alterados ap√≥s o carn√™ ser gerado. Valores e parcelas s√£o fixos.
                             </div>
                         )}
                    </div>
                );
             case 'celula_relatorio':
                 const selectedCel = (db.celulas || []).find(c => c.id === data.celula_id);
                 const togglePresenca = (memId) => { setData(prev => ({ ...prev, presencas: { ...(prev.presencas || {}), [memId]: !(prev.presencas || {})[memId] } })); };
                 return (
                     <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormSelect label="Selecione a C√©lula" value={data.celula_id} onChange={v => { const sel = (db.celulas||[]).find(c => c.id === v); const initPres = {}; if (sel && sel.membros) { sel.membros.forEach(m => initPres[m.integrante_id] = true); } setData({...data, celula_id: v, presencas: initPres}); }} options={(db.celulas||[]).map(c=>({label: c.nome, value: c.id}))} required />
                             <FormInput label="Data da Reuni√£o" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                         </div>

                         {selectedCel && (
                             <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lista de Presen√ßa (Chamada)</h4>
                                 <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                     {(selectedCel.membros || []).map((m, idx) => {
                                         const memId = m.integrante_id;
                                         const isVisitante = m.tipo === 'visitante';
                                         const nome = isVisitante ? db.visitantes?.find(v => v.id === memId)?.nome : db.membros?.find(mem => mem.id === memId)?.nome;
                                         const isPresente = data.presencas ? data.presencas[memId] : false;
                                         return (
                                             <label key={idx} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isPresente ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                                 <div className="flex items-center gap-3">
                                                     <div className={`w-5 h-5 rounded border flex items-center justify-center ${isPresente ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{isPresente && <Check size={14} strokeWidth={3}/>}</div>
                                                     <div><p className="text-sm font-bold text-slate-800">{nome || 'N√£o encontrado'}</p><p className="text-[10px] text-slate-500 uppercase tracking-widest">{isVisitante ? 'Visitante' : 'Membro'} ‚Ä¢ {m.funcao}</p></div>
                                                 </div>
                                                 <input type="checkbox" className="hidden" checked={isPresente || false} onChange={() => togglePresenca(memId)} />
                                                 <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isPresente ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{isPresente ? 'Presente' : 'Ausente'}</span>
                                             </label>
                                         );
                                     })}
                                     {(!selectedCel.membros || selectedCel.membros.length === 0) && <p className="text-xs text-slate-400 italic">Nenhum participante vinculado a esta c√©lula.</p>}
                                 </div>
                             </div>
                         )}

                         <div className="mb-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Relat√≥rio Detalhado (Testemunhos, Ofertas, Ora√ß√£o)</label>
                             <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[150px] shadow-sm uppercase" value={data.relatorio || ''} onChange={e => setData({...data, relatorio: ((e.target.value || "").toUpperCase() || "").toUpperCase()})} placeholder="Descreva como foi a reuni√£o..." required></textarea>
                         </div>
                     </div>
                 );
             case 'membro':
                 return (
                    <div className="space-y-6">
                        {/* Navega√ß√£o de Abas do Membro */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner mb-2">
                            <button
                                type="button"
                                onClick={() => setMembroFormTab('dados')}
                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${membroFormTab === 'dados' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
                            >
                                <User size={14} /> Dados Cadastrais
                            </button>
                            <button
                                type="button"
                                onClick={() => setMembroFormTab('crescimento')}
                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${membroFormTab === 'crescimento' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
                            >
                                <TrendingUp size={14} /> Crescimento Eclesi√°stico
                            </button>
                        </div>

                        {membroFormTab === 'dados' ? (
                            <div className="space-y-6 animate-entrance">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                                    <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} /> 1. Dados Pessoais & Filia√ß√£o</h4>
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                    {data.foto ? <img src={data.foto} className="w-full h-full object-cover" /> : <Camera size={32} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer text-white text-xs font-bold p-2 text-center">Alterar<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'foto')} /></label>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Nome Completo" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Jo√£o da Silva" className="!mb-0"/>
                                    <FormInput label="CPF" value={data.cpf} onChange={v=>setData({...data, cpf:formatCPF(v)})} required placeholder="000.000.000-00" className="!mb-0"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Nome do Pai" value={data.nome_pai} onChange={v=>setData({...data, nome_pai:v})} placeholder="Filia√ß√£o"/>
                                <FormInput label="Nome da M√£e" value={data.nome_mae} onChange={v=>setData({...data, nome_mae:v})} placeholder="Filia√ß√£o"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Data Nascimento" type="date" value={data.data_nascimento} onChange={v=>setData({...data, data_nascimento:v})} />
                                <FormInput label="Naturalidade" value={data.naturalidade} onChange={v=>setData({...data, naturalidade:v})} placeholder="Ex: Rio de Janeiro - RJ"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Endere√ßo Residencial" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Rua e N√∫mero"/>
                                <FormInput label="Bairro" value={data.bairro} onChange={v=>setData({...data, bairro:v})} placeholder="Bairro"/>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Cidade" value={data.cidade} onChange={v=>setData({...data, cidade:v})} placeholder="Cidade" className="col-span-2"/>
                                <FormInput label="CEP" value={data.cep} onChange={v=>setData({...data, cep:v})} placeholder="00000-000"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Telefone / WhatsApp" value={data.telefone} onChange={v=>setData({...data, telefone:v})} placeholder="(21) 9..." />
                                <FormInput label="E-mail" value={data.email} onChange={v=>setData({...data, email:v})} />
                            </div>
                            <FormInput label="Profiss√£o / Ocupa√ß√£o" value={data.profissao} onChange={v=>setData({...data, profissao:v})} placeholder="Ex: Engenheiro, Professor, Aut√¥nomo" />
                        </div>

                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                             <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Heart size={16} /> 2. Fam√≠lia & Estado Civil</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Estado Civil" value={data.estado_civil} onChange={v=>setData({...data, estado_civil:v})} options={['Solteiro(a)', 'Casado(a)', 'Vi√∫vo(a)', 'Divorciado(a)', 'Uni√£o Est√°vel']} />
                                {data.estado_civil === 'Casado(a)' && <FormInput label="Nome do C√¥njuge" value={data.nome_conjuge} onChange={v=>setData({...data, nome_conjuge:v})} />}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Tem Filhos?" value={data.tem_filhos} onChange={v=>setData({...data, tem_filhos:v})} options={[{label:'Sim', value:'sim'}, {label:'N√£o', value:'nao'}]} />
                                {data.tem_filhos === 'sim' && <FormInput label="Quantos Filhos?" type="number" value={data.qtd_filhos} onChange={v=>setData({...data, qtd_filhos:v})} />}
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                             <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={16} /> 3. Dados Eclesi√°sticos</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {isMaster && <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                                <FormSelect label="Cargo Eclesi√°stico" value={data.cargo} onChange={v=>setData({...data, cargo:v})} options={['Membro', 'Professor', 'Auxiliar', 'Di√°cono', 'Presb√≠tero', 'Evangelista', 'Mission√°rio', 'Pastor']} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Fun√ß√£o Administrativa" value={data.funcao_administrativa || 'NENHUMA'} onChange={v=>setData({...data, funcao_administrativa:v})} options={['NENHUMA', 'PASTOR PRESIDENTE', 'PASTOR AUXILIAR', 'COORDENADOR', 'SUPERINTENDENTE', 'SECRETARIO', 'TESOUREIRO', 'CONTADOR', 'ADMINISTRADOR', 'ADVOGADO', 'AUXILIAR', 'LIDER DE DEPARTAMENTO', 'PROFESSOR']} />
                                <FormInput label="N¬∫ Carteirinha" value={data.numero_registro} onChange={v=>setData({...data, numero_registro:v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Status de Atividade" value={data.status} onChange={v=>setData({...data, status:v})} options={['Ativo', 'Inativo']} />
                                <FormInput label="Data de Batismo" type="date" value={data.data_batismo} onChange={v=>setData({...data, data_batismo:v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Data de Admiss√£o" type="date" value={data.data_admissao} onChange={v=>setData({...data, data_admissao:v})} />
                                <div />
                            </div>

                            {/* Procedencia, Historico & Funcoes do Membro */}
                            <div className="mt-6 pt-6 border-t border-indigo-100 space-y-4">
                                <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">Proced√™ncia, Hist√≥rico & Fun√ß√µes Anteriores</h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormSelect 
                                        label="Proced√™ncia do Membro" 
                                        value={data.procedencia || 'novo'} 
                                        onChange={v => setData({...data, procedencia: v})} 
                                        options={[
                                            { label: 'Novo Convertido / Decis√£o', value: 'novo' },
                                            { label: 'Veio de outra Congrega√ß√£o', value: 'outra_congregacao' },
                                            { label: 'Veio de outra Igreja (Por Carta)', value: 'outra_igreja' }
                                        ]} 
                                    />
                                    <FormInput 
                                        label="Fun√ß√£o Eclesi√°stica Exercida" 
                                        value={data.funcao_eclesiastica_exercida} 
                                        onChange={v => setData({...data, funcao_eclesiastica_exercida: v})} 
                                        placeholder="Ex: Obreiro, Di√°cono da Casa..." 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput 
                                        label="Desempenhava Fun√ß√£o Administrativa?" 
                                        value={data.funcoes_administrativas_exercidas} 
                                        onChange={v => setData({...data, funcoes_administrativas_exercidas: v})} 
                                        placeholder="Ex: Secret√°rio, Tesoureiro..." 
                                    />
                                    <FormInput 
                                        label="Participava de algum Minist√©rio?" 
                                        value={data.ministerios_anteriores} 
                                        onChange={v => setData({...data, ministerios_anteriores: v})} 
                                        placeholder="Ex: Louvor, Infantil, Jovens..." 
                                    />
                                </div>

                                {data.procedencia === 'outra_igreja' && (
                                    <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-4 animate-entrance">
                                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <Building2 size={14} /> Igreja de Origem & Recomenda√ß√£o
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Nome da Igreja de Origem" 
                                                value={data.igreja_origem} 
                                                onChange={v => setData({...data, igreja_origem: v})} 
                                                required 
                                                placeholder="Ex: Assembleia de Deus Central" 
                                            />
                                            <FormInput 
                                                label="Pastor Presidente" 
                                                value={data.pastor_origem_presidente} 
                                                onChange={v => setData({...data, pastor_origem_presidente: v})} 
                                                required 
                                                placeholder="Ex: Pr. Geraldo de Souza" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Anexar Carta de Recomenda√ß√£o</label>
                                            <div className="flex items-center flex-wrap gap-3">
                                                <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-2 shadow-xs transition-colors">
                                                    <Paperclip size={14} /> {data.carta_recomendacao ? 'Substituir Documento' : 'Escolher Arquivo'}
                                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'carta_recomendacao')} />
                                                </label>
                                                {data.carta_recomendacao ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-indigo-600 font-bold bg-indigo-100/70 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                                            <CheckCircle size={14} className="text-emerald-500" /> Carta Anexada
                                                        </span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setData({...data, carta_recomendacao: null})} 
                                                            className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 font-medium italic">Nenhum arquivo anexado (Limite: 500KB)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        </div>
                        ) : (
                            <div className="space-y-6 animate-entrance">
                                {/* Form para Registrar Crescimento */}
                                <div className="bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 text-left">
                                    <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                                        <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <Award size={14} /> {editingHistId ? 'Editar Cerim√¥nia' : 'Registrar Nova Cerim√¥nia'}
                                        </h4>
                                        {editingHistId && (
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setEditingHistId(null);
                                                    setHistDate('');
                                                    setHistType('Consagra√ß√£o');
                                                    setHistTargetCargo('');
                                                    setHistResponsible('');
                                                    setHistAta('');
                                                }} 
                                                className="text-[10px] font-bold text-rose-500 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer"
                                            >
                                                Cancelar Edi√ß√£o
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput 
                                            label="Data da Cerim√¥nia" 
                                            type="date" 
                                            value={histDate} 
                                            onChange={v => setHistDate(v)} 
                                            required 
                                        />
                                        <FormSelect 
                                            label="Tipo de Cerim√¥nia" 
                                            value={histType} 
                                            onChange={v => setHistType(v)} 
                                            options={['Batismo em √Åguas', 'Consagra√ß√£o', 'Ordena√ß√£o', 'Separa√ß√£o de cargos eclesiais', 'Outro']} 
                                            required 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput 
                                            label="Respons√°vel (Quem Realizou)" 
                                            value={histResponsible} 
                                            onChange={v => setHistResponsible(v)} 
                                            required 
                                            placeholder="Ex: Pr. Geraldo de Souza" 
                                        />
                                        <FormInput 
                                            label="N¬∫ da Ata da Assembleia" 
                                            value={histAta} 
                                            onChange={v => setHistAta(v)} 
                                            required 
                                            placeholder="Ex: Ata 142/2026" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormInput 
                                            label="Cargo Alvo / Detalhes (Opcional)" 
                                            value={histTargetCargo} 
                                            onChange={v => setHistTargetCargo(v)} 
                                            placeholder="Ex: Auxiliar, Di√°cono, Presb√≠tero, etc." 
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            type="button" 
                                            onClick={handleAddOrUpdateHistory} 
                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {editingHistId ? (
                                                <><Check size={14} /> Atualizar Registro</>
                                            ) : (
                                                <><Plus size={14} /> Adicionar ao Hist√≥rico</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Listagem de Crescimento Eclesi√°stico */}
                                <div className="space-y-3 text-left">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Hist√≥rico de Crescimento Eclesi√°stico</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                        {Array.isArray(data.crescimento_eclesiastico) && data.crescimento_eclesiastico.length > 0 ? (
                                            data.crescimento_eclesiastico.map((record, index) => {
                                                const getCeremonyBadgeClass = (tipo) => {
                                                    const t = String(tipo).toLowerCase();
                                                    if (t.includes('batismo')) return 'bg-blue-50 text-blue-600 border-blue-100';
                                                    if (t.includes('consagra')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                                                    if (t.includes('ordena')) return 'bg-purple-50 text-purple-600 border-purple-100';
                                                    if (t.includes('separa')) return 'bg-amber-50 text-amber-600 border-amber-100';
                                                    return 'bg-slate-50 text-slate-600 border-slate-150';
                                                };
                                                return (
                                                    <div 
                                                        key={record.id || index} 
                                                        className="flex items-center justify-between p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:border-slate-300 transition-colors"
                                                    >
                                                        <div className="text-left space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${getCeremonyBadgeClass(record.tipo)}`}>
                                                                    {record.tipo}
                                                                </span>
                                                                <span className="text-xs font-black text-slate-700">
                                                                    {formatDateLocal(record.data)}
                                                                </span>
                                                                {record.cargo_alvo && (
                                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded uppercase">
                                                                        Cargo: {record.cargo_alvo}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-600 font-medium">
                                                                Realizado por: <strong className="text-slate-800 uppercase">{record.responsavel}</strong>
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                Ata da Assembleia: {record.ata}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleEditHistory(record)} 
                                                                className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors border border-indigo-100 bg-white cursor-pointer" 
                                                                title="Editar"
                                                            >
                                                                <Edit size={14}/>
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleDeleteHistory(record.id)} 
                                                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors border border-rose-100 bg-white cursor-pointer" 
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <TrendingUp className="mx-auto text-slate-300 mb-2 animate-pulse" size={32} />
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nenhum registro de crescimento</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Preencha o formul√°rio acima para registrar cerim√¥nias, batismos ou consagra√ß√µes.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 );
             case 'usuario':
                 const gruposPermissoes = [
                     { 
                         titulo: "Administrativo & Cadastros", 
                         opcoes: [ 
                             { id: 'access_membros', label: 'Gest√£o de Membros (Rol & Fichas)' }, 
                             { id: 'access_acessos_portal', label: 'Acessos do Portal de Membros' }, 
                             { id: 'access_visitantes', label: 'CRM de Visitantes & Consolida√ß√£o' }, 
                             { id: 'access_igreja', label: 'Matriz, Filiais & Contas Banc√°rias' }, 
                             { id: 'access_patrimonio', label: 'Gest√£o de Patrim√¥nio & Invent√°rio' }, 
                             { id: 'access_frotas', label: 'Controle de Frotas & Ve√≠culos' }, 
                             { id: 'access_celulas', label: 'C√©lulas e Pequenos Grupos' }, 
                             { id: 'access_ministerios', label: 'Minist√©rios & Departamentos Gerais' } 
                         ] 
                     },
                     { 
                         titulo: "Minist√©rios Espec√≠ficos & Cuidado", 
                         opcoes: [ 
                             { id: 'access_ministerio_louvor', label: 'Minist√©rio de Louvor (M√∫sicas & Escalas)' }, 
                             { id: 'access_ministerio_midia', label: 'Minist√©rio de M√≠dia (Equipamentos & Escalas)' }, 
                             { id: 'access_ministerio_familia', label: 'Minist√©rio da Fam√≠lia & Aconselhamento' }, 
                             { id: 'access_salinha_kids', label: 'Salinha Kids & Ber√ß√°rio (Check-In)' }, 
                             { id: 'access_missoes', label: 'Departamento de Miss√µes & Projetos' } 
                         ] 
                     },
                     { 
                         titulo: "Financeiro, RH & Tesouraria", 
                         opcoes: [ 
                             { id: 'access_fin_entradas', label: 'Receitas (D√≠zimos & Ofertas)' }, 
                             { id: 'access_fin_saidas', label: 'Despesas (Sa√≠das & Pagamentos)' }, 
                             { id: 'access_fin_analise', label: 'DRE Gerencial & Balancetes' }, 
                             { id: 'access_fin_conciliacao', label: 'Concilia√ß√£o Banc√°ria & DDA Boletos' }, 
                             { id: 'access_fin_carnes', label: 'Gest√£o de Carn√™s & Campanhas' }, 
                             { id: 'access_fin_cadastros', label: 'Fornecedores & Centros de Custo' }, 
                             { id: 'access_dp_contabilidade', label: 'Recursos Humanos (RH) & D.P.' } 
                         ] 
                     },
                     { 
                         titulo: "Secretaria, Relat√≥rios & Ensino", 
                         opcoes: [ 
                             { id: 'access_sec_agenda', label: 'Secretaria & Agenda de Tarefas' }, 
                             { id: 'access_sec_livro_atas', label: 'Livro Oficial de Atas' }, 
                             { id: 'access_sec_certificados', label: 'Emiss√£o de Certificados' }, 
                             { id: 'access_carteirinha_studio', label: 'Est√∫dio de Carteirinhas' }, 
                             { id: 'access_credencial_lote', label: 'Credenciais em Lote' }, 
                             { id: 'access_sec_relatorios', label: 'Central de Relat√≥rios Oficiais (PDF)' }, 
                             { id: 'access_ebd', label: 'Gest√£o EBD (Turmas & Chamadas)' }, 
                             { id: 'access_gestao_cursos', label: 'Capacita√ß√µes EAD (Cursos Online)' }, 
                             { id: 'access_teologia', label: 'Estudo de Teologia B√°sico GIPP & Forma√ß√£o' }, 
                             { id: 'access_biblia', label: 'B√≠blia de Estudos & Coment√°rios' } 
                         ] 
                     },
                     { 
                         titulo: "Comunica√ß√£o, Escrit√≥rio & IA Pastoral", 
                         opcoes: [ 
                             { id: 'access_midia', label: 'Est√∫dio de Artes & M√≠dia' }, 
                             { id: 'access_docs_editor', label: 'GIPP DOCs (Editor de Documentos)' }, 
                             { id: 'access_sheets_editor', label: 'GIPP Planilhas (Editor de Tabelas)' }, 
                             { id: 'access_boletim', label: 'Gest√£o do Boletim Digital' }, 
                             { id: 'access_email', label: 'Webmail Direto (Caixa de Entrada)' }, 
                             { id: 'access_ia', label: 'Assistente Pastoral IA & Serm√µes' }, 
                             { id: 'access_interativo', label: 'M√≥dulo Interativo & Gamifica√ß√£o' } 
                         ] 
                     },
                     { 
                         titulo: "Configura√ß√µes Globais, Prote√ß√£o & Governan√ßa", 
                         opcoes: [ 
                             { id: 'access_config_sistema', label: 'Configura√ß√µes Gerais do Sistema' }, 
                             { id: 'access_config_visual', label: 'Personaliza√ß√£o Visual & Temas' }, 
                             { id: 'access_config_backup', label: 'Backup Geral de Dados (Local/Nuvem)' }, 
                             { id: 'access_auditoria', label: 'Auditoria & Logs de Seguran√ßa' }, 
                             { id: 'access_lixeira', label: 'Lixeira Virtual do Sistema' }, 
                             { id: 'access_manual', label: 'Manual do Usu√°rio GIPP' }, 
                             { id: 'access_amparo_legal', label: 'Amparo Constitucional & Jur√≠dico' }, 
                             { id: 'access_registro_software', label: 'Registro do Software & Licen√ßa' } 
                         ] 
                     }
                 ];
                 const togglePermissao = (permId) => { const atuais = data.permissoes || []; if (atuais.includes(permId)) { setData({ ...data, permissoes: atuais.filter(p => p !== permId) }); } else { setData({ ...data, permissoes: [...atuais, permId] }); } };
                 const toggleAllInGroup = (opcoes) => { const atuais = data.permissoes || []; const todosIds = opcoes.map(o => o.id); const todosPresentes = todosIds.every(id => atuais.includes(id)); if (todosPresentes) { setData({ ...data, permissoes: atuais.filter(id => !todosIds.includes(id)) }); } else { const novos = [...new Set([...atuais, ...todosIds])]; setData({ ...data, permissoes: novos }); } };

                 return (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput label="Nome" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                            <FormInput label="Usu√°rio (Login)" preserveCase value={data.usuario} onChange={v=>setData({...data, usuario:v})} required/>
                            <FormInput label="Senha" type="password" value={data.senha} onChange={v=>setData({...data, senha:v})} required/>
                            {isMaster && <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                            <FormSelect label="N√≠vel de Acesso" value={data.nivel} onChange={v=>setData({...data, nivel:v})} options={[{label:'Master (Acesso Total)', value:'master'}, {label:'Restrito (Personalizado)', value:'restrito'}]} />
                        </div>
                        {data.nivel === 'restrito' && (
                            <div className="space-y-4 animate-entrance">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-2"><p className="text-xs font-bold text-indigo-700 flex items-center gap-2"><Lock size={14}/> Selecione os m√≥dulos que este usu√°rio poder√° acessar:</p></div>
                                {gruposPermissoes.map((grupo, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100"><h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{grupo.titulo}</h4><button onClick={(e) => { e.preventDefault(); toggleAllInGroup(grupo.opcoes); }} className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">Selecionar Tudo</button></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {grupo.opcoes.map(perm => (
                                                <label key={perm.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${data.permissoes?.includes(perm.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${data.permissoes?.includes(perm.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>{data.permissoes?.includes(perm.id) && <Check size={12} strokeWidth={4}/>}</div>
                                                    <input type="checkbox" className="hidden" checked={data.permissoes?.includes(perm.id) || false} onChange={() => togglePermissao(perm.id)} />
                                                    <span className={`text-sm font-medium ${data.permissoes?.includes(perm.id) ? 'text-indigo-900' : 'text-slate-600'}`}>{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                 );
             case 'celula':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome da C√©lula / Grupo" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect label="L√≠der Principal" value={data.lider1_id} onChange={v=>setData({...data, lider1_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} required />
                            <FormSelect label="L√≠der Auxiliar (Opcional)" value={data.lider2_id} onChange={v=>setData({...data, lider2_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        </div>
                        <FormInput label="Endere√ßo / Local da Reuni√£o" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Ex: Rua A, 123 - Casa do Irm√£o Jo√£o" />
                        <FormInput label="Dia e Hor√°rio" value={data.horario} onChange={v=>setData({...data, horario:v})} placeholder="Ex: Toda Quinta-feira √†s 20:00" />
                     </div>
                 );
             case 'celula_membro':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Selecione a C√©lula" value={data.celula_id} onChange={v=>setData({...data, celula_id:v})} options={db.celulas.map(c=>({label: c.nome, value: c.id}))} required />
                        <FormSelect label="Tipo de Integrante" value={data.tipo_integrante} onChange={v=>setData({...data, tipo_integrante:v})} options={[{label:'Membro Oficial', value:'membro'}, {label:'Visitante / Convidado', value:'visitante'}]} required />
                        {data.tipo_integrante === 'visitante' ? <FormSelect label="Selecione o Visitante" value={data.integrante_id} onChange={v=>setData({...data, integrante_id:v})} options={db.visitantes.map(v=>({label: v.nome, value: v.id}))} required /> : <FormSelect label="Selecione o Membro" value={data.integrante_id} onChange={v=>setData({...data, integrante_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} required />}
                        <FormInput label="Fun√ß√£o na C√©lula" value={data.funcao} onChange={v=>setData({...data, funcao:v})} placeholder="Ex: Anfitri√£o, Louvor, Participante" required/>
                     </div>
                 );
             case 'celula_evento':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="C√©lula Respons√°vel" value={data.celula_id} onChange={v=>setData({...data, celula_id:v})} options={db.celulas.map(c=>({label: c.nome, value: c.id}))} required />
                        <FormInput label="T√≠tulo da Programa√ß√£o/Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required placeholder="Ex: Culto Festivo, Evangelismo, Jantar..."/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/><FormInput label="Hor√°rio" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/></div>
                        <FormInput label="Mensagem WhatsApp (Opcional)" value={data.whatsapp_msg} onChange={v=>setData({...data, whatsapp_msg:v})} placeholder="Convite padr√£o para envio aos membros"/>
                     </div>
                 );
             case 'congregacao':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Nome da Congrega√ß√£o" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Congrega√ß√£o Betel"/>
                         <FormSelect label="Dirigente / Pastor Local" value={data.dirigente_id} onChange={v=>setData({...data, dirigente_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                         <FormInput label="Endere√ßo Completo" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Ex: Rua das Flores, 123 - Bairro" />
                         <div className="grid grid-cols-2 gap-4"><FormInput label="Data de Abertura" type="date" value={data.data_abertura} onChange={v=>setData({...data, data_abertura:v})} /><FormInput label="Telefone / Contato" value={data.telefone} onChange={v=>setData({...data, telefone:v})} /></div>
                     </div>
                 );
             case 'fornecedor':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Raz√£o Social / Nome" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                         <div className="grid grid-cols-2 gap-4"><FormInput label="CNPJ / CPF" value={data.cnpj} onChange={v=>setData({...data, cnpj:v})} /><FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Ativo', 'Inativo']} /></div>
                         <FormInput label="Telefone" value={data.telefone} onChange={v=>setData({...data, telefone:v})} />
                         <FormInput label="E-mail" value={data.email} onChange={v=>setData({...data, email:v})} />
                     </div>
                 );
             case 'centro_custo':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Nome do Centro de Custo" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                         <FormInput label="Respons√°vel" value={data.responsavel} onChange={v=>setData({...data, responsavel:v})} />
                     </div>
                 );
             case 'solicitacao_doc':
                 return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Membro Solicitante" value={data.membro_id} onChange={v=>setData({...data, membro_id:v, nome: db.membros.find(m=>m.id===v)?.nome})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                        <FormSelect label="Tipo de Documento" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Carta de Recomenda√ß√£o', 'Declara√ß√£o de Membro', 'Hist√≥rico', 'Outro']}/>
                        <FormInput label="Observa√ß√µes" value={data.obs} onChange={v=>setData({...data, obs:v})}/>
                        <FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Pendente', 'Pronto', 'Entregue']}/>
                    </div>
                );
            case 'patrimonio':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome / Descri√ß√£o do Bem" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Mesa de Som Yamaha, Ar Condicionado..."/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="N¬∫ de Tombo / S√©rie" value={data.tombo} onChange={v=>setData({...data, tombo:v})} placeholder="Ex: PAT-001" /><FormInput label="Valor Estimado (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} /></div>
                        <div className="grid grid-cols-2 gap-4"><FormSelect label="Categoria" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={['Eletr√¥nicos', 'Instrumentos Musicais', 'M√≥veis', 'Ve√≠culos', 'Im√≥veis', 'Outros']} required /><FormSelect label="Estado de Conserva√ß√£o" value={data.estado} onChange={v=>setData({...data, estado:v})} options={['Novo', 'Bom', 'Regular', 'Ruim', 'Em Manuten√ß√£o', 'Baixado']} required /></div>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Data de Aquisi√ß√£o" type="date" value={data.data_aquisicao} onChange={v=>setData({...data, data_aquisicao:v})} /><FormInput label="Localiza√ß√£o / Departamento" value={data.localizacao} onChange={v=>setData({...data, localizacao:v})} placeholder="Ex: Altar, Secretaria..." /></div>
                        {renderComprovanteUpload()}
                    </div>
                );
            case 'ebd_turma':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome da Turma" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <FormInput label="Sala / Local" value={data.sala} onChange={v=>setData({...data, sala:v})} />
                        <FormSelect label="Professor 1" value={data.prof1_id} onChange={v=>setData({...data, prof1_id:v})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                        <FormSelect label="Professor 2" value={data.prof2_id} onChange={v=>setData({...data, prof2_id:v})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                        <FormSelect label="Professor 3" value={data.prof3_id} onChange={v=>setData({...data, prof3_id:v})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                    </div>
                );
            case 'ebd_aluno':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Selecione o Membro (Aluno)" value={data.membro_id || ''} onChange={v => setData({...data, membro_id: v, nome: db.membros.find(m => m.id === v)?.nome || ''})} options={db.membros.map(m => ({label: m.nome, value: m.id}))} />
                        <FormSelect label="Turma" value={data.turma_id} onChange={v=>setData({...data, turma_id:v})} options={db.ebd.turmas.map(t=>({label:t.nome, value:t.id}))} required/>
                    </div>
                );
            case 'ebd_licao':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Data da Li√ß√£o" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                        <FormSelect label="Turma" value={data.turma_id} onChange={v=>setData({...data, turma_id:v})} options={db.ebd.turmas.map(t=>({label:t.nome, value:t.id}))} required/>
                        <FormInput label="Revista / Tema Central" value={data.revista} onChange={v=>setData({...data, revista:v})} required/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="N¬∫ / T√≠tulo da Li√ß√£o" type="text" value={data.licao_numero} onChange={v=>setData({...data, licao_numero:v})} placeholder="Ex: 1 - A Cria√ß√£o" /><FormInput label="Qtd. Presentes" type="number" value={data.qtd_presentes} onChange={v=>setData({...data, qtd_presentes:v})} /></div>
                        <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Capa da Revista (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-24 bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group shadow-sm shrink-0">
                                    {data.capa ? <img src={data.capa} className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><label className="cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest text-center w-full h-full flex items-center justify-center">Upload<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'capa')} /></label></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Carregue a imagem da capa da revista para evitar bloqueios de seguran√ßa da editora (CORS) e garantir a exibi√ß√£o perfeita para os alunos.</p>
                                    {data.capa && <button type="button" onClick={() => setData({...data, capa: null})} className="text-[10px] font-bold text-rose-500 mt-2 hover:text-rose-700 transition-colors uppercase tracking-wider">Remover Imagem</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'missionario':
                return (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={16} className="text-indigo-500" /> 1. Identifica√ß√£o Geral
                            </h4>
                            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative group shrink-0 shadow-sm">
                                    {data.foto ? <img src={data.foto} className="w-full h-full object-cover" /> : <Camera size={32} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer text-white text-xs font-bold p-2 text-center">Alterar<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'foto')} /></label>
                                    </div>
                                </div>
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Nome Completo do Mission√°rio" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Pr. Andr√© Valad√£o" className="!mb-0"/>
                                    <FormSelect label="Status" value={data.status || 'No Campo'} onChange={v=>setData({...data, status:v})} options={['Prepara√ß√£o', 'No Campo', 'Licenciado', 'Inativo']} className="!mb-0"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="Nascimento" type="date" value={data.nascimento} onChange={v=>setData({...data, nascimento:v})} />
                                <FormInput label="CPF" value={data.cpf} onChange={v=>setData({...data, cpf:formatCPF(v)})} placeholder="000.000.000-00"/>
                                <FormSelect label="Estado Civil" value={data.estado_civil} onChange={v=>setData({...data, estado_civil:v})} options={['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Vi√∫vo(a)']} />
                            </div>
                            {data.estado_civil === 'Casado(a)' && (
                                <FormInput label="Nome do C√¥njuge" value={data.conjuge_nome} onChange={v=>setData({...data, conjuge_nome:v})} placeholder="Ex: Mission√°ria Maria" />
                            )}
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Globe size={16} className="text-indigo-500" /> 2. Campo Mission√°rio & Envio
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Campo de Atua√ß√£o / Localidade" value={data.campo} onChange={v=>setData({...data, campo:v})} placeholder="Ex: Maputo, Mo√ßambique ou Sert√£o Nordestino" required/>
                                <FormSelect 
                                    label="Ag√™ncia de Miss√µes Vinculada" 
                                    value={data.agencia_id || ''} 
                                    onChange={v => {
                                        const ag = db.missoes?.agencias?.find(a => a.id === v);
                                        setData({
                                            ...data, 
                                            agencia_id: v,
                                            agencia: ag ? ag.nome : ''
                                        });
                                    }} 
                                    options={[
                                        { label: '-- Sem Ag√™ncia / Envio Direto --', value: '' },
                                        ...(db.missoes?.agencias || []).map(a => ({ label: a.nome, value: a.id }))
                                    ]}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="Data de Envio" type="date" value={data.data_envio} onChange={v=>setData({...data, data_envio:v})} />
                                <FormInput label="Previs√£o de Retorno" type="date" value={data.data_retorno_previsto} onChange={v=>setData({...data, data_retorno_previsto:v})} />
                                <FormInput label="Nome do Projeto / Miss√£o" value={data.projeto_nome} onChange={v=>setData({...data, projeto_nome:v})} placeholder="Ex: Projeto √Ågua Viva" />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Phone size={16} className="text-indigo-500" /> 3. Contatos & Informa√ß√µes Gerais
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="WhatsApp / Telefone" value={data.telefone} onChange={v=>setData({...data, telefone:v})} placeholder="Ex: +55 (11) 98765-4321" />
                                <FormInput label="E-mail" type="email" value={data.email} onChange={v=>setData({...data, email:v})} placeholder="Ex: missionario@email.com" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Sustento Alvo Mensal (R$)" type="number" value={data.valor_sustento} onChange={v=>setData({...data, valor_sustento:v})} placeholder="Ex: 1500" />
                                <FormInput label="Tipo de Apoio Requerido" value={data.tipo_apoio_requerido} onChange={v=>setData({...data, tipo_apoio_requerido:v})} placeholder="Ex: Financeiro e Ora√ß√£o" />
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
                                <FormSelect 
                                    label="Oferecer Ajuda Financeira Sistem√°tica?" 
                                    value={data.ajuda_financeira_ativa || 'nao'} 
                                    onChange={v=>setData({...data, ajuda_financeira_ativa: v})} 
                                    options={[{label: 'N√£o - Apenas Apoio Geral / Ora√ß√£o', value: 'nao'}, {label: 'Sim - Registrar Ajuda Financeira', value: 'sim'}]} 
                                />
                                {data.ajuda_financeira_ativa === 'sim' && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Valor de Cada Ajuda (R$)" 
                                                type="number" 
                                                step="0.01" 
                                                value={data.ajuda_financeira_valor} 
                                                onChange={v=>setData({...data, ajuda_financeira_valor: parseFloat(v)})} 
                                                placeholder="Ex: 500" 
                                                required
                                            />
                                            <FormSelect 
                                                label="Per√≠odo da Ajuda" 
                                                value={data.ajuda_financeira_periodo || 'Mensal'} 
                                                onChange={v=>setData({...data, ajuda_financeira_periodo: v})} 
                                                options={['Mensal', 'Trimestral', 'Semestral', 'Anual', '√önico']} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Primeiro Vencimento" 
                                                type="date" 
                                                value={data.ajuda_financeira_vencimento} 
                                                onChange={v=>setData({...data, ajuda_financeira_vencimento: v})} 
                                                required
                                            />
                                            <FormInput 
                                                label="Qtd. de Parcelas / Ajuda" 
                                                type="number" 
                                                value={data.ajuda_financeira_qtd || 12} 
                                                onChange={v=>setData({...data, ajuda_financeira_qtd: parseInt(v) || 12})} 
                                                placeholder="Ex: 12"
                                                disabled={data.ajuda_financeira_periodo === '√önico'}
                                            />
                                        </div>
                                        {data.ajuda_financeira_gerada && (
                                            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                <span>Cronograma financeiro de suporte j√° foi gerado para este cadastro. Se alterar as datas e quiser gerar outras, desmarque a flag interna de controle `ajuda_financeira_gerada` editando o cadastro.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">Desafios do Campo / Pedidos de Ora√ß√£o</label>
                                <textarea 
                                    className="w-full text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                    value={data.descricao_campo || ''} 
                                    onChange={e=>setData({...data, descricao_campo: e.target.value})}
                                    placeholder="Escreva aqui detalhes sobre o campo, necessidades de ora√ß√£o e desafios enfrentados..."
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'agencia_missoes':
                return (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Building2 size={16} className="text-blue-500" /> 1. Identifica√ß√£o da Ag√™ncia
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <FormInput label="Nome da Ag√™ncia" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Junta de Miss√µes Mundiais"/>
                                </div>
                                <FormInput label="Sigla / Abrevia√ß√£o" value={data.sigla} onChange={v=>setData({...data, sigla:v})} placeholder="Ex: JMM"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="CNPJ / Registro" value={data.cnpj} onChange={v=>setData({...data, cnpj:v})} placeholder="00.000.000/0001-00"/>
                                <FormInput label="Respons√°vel / Diretor" value={data.responsavel} onChange={v=>setData({...data, responsavel:v})} placeholder="Ex: Pr. Geraldo Junior" required/>
                                <FormSelect label="Tipo de Ag√™ncia" value={data.tipo_agencia} onChange={v=>setData({...data, tipo_agencia:v})} options={['Denominacional', 'Interdenominacional', 'Junta de Miss√µes', 'Outro']} />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Phone size={16} className="text-blue-500" /> 2. Contato & Localiza√ß√£o Sede
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="Telefone / Celular" value={data.contato} onChange={v=>setData({...data, contato:v})} placeholder="Ex: (11) 4002-8922" required/>
                                <FormInput label="E-mail" type="email" value={data.email} onChange={v=>setData({...data, email:v})} placeholder="Ex: contato@agencia.org" />
                                <FormInput label="Website / Link" value={data.site} onChange={v=>setData({...data, site:v})} placeholder="Ex: www.agenciamissoes.org" />
                            </div>
                            <FormInput label="Endere√ßo da Sede" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Ex: Av. Principal, 1000 - Centro, S√£o Paulo - SP" />
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Wallet size={16} className="text-blue-500" /> 3. Dados Banc√°rios para Ofertas
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Informa√ß√µes de Conta (Banco, Ag√™ncia, Conta)" value={data.banco_info} onChange={v=>setData({...data, banco_info:v})} placeholder="Ex: Bradesco, Ag 1234, CC 56789-0" />
                                <FormInput label="Chave PIX da Ag√™ncia" value={data.chave_pix} onChange={v=>setData({...data, chave_pix:v})} placeholder="Ex: CNPJ, E-mail, Celular..." />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Globe size={16} className="text-blue-500" /> 4. Escopo & Atua√ß√£o
                            </h4>
                            <FormInput label="Pa√≠ses ou Regi√µes em Atua√ß√£o" value={data.paises_atuacao} onChange={v=>setData({...data, paises_atuacao:v})} placeholder="Ex: Angola, √çndia, Bol√≠via, Sert√£o Brasileiro" />
                            <div className="mt-4">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">Descri√ß√£o / Vis√£o Institucional</label>
                                <textarea 
                                    className="w-full text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    value={data.descricao || ''} 
                                    onChange={e=>setData({...data, descricao: e.target.value})}
                                    placeholder="Vis√£o, foco de evangelismo e resumo dos projetos principais da ag√™ncia..."
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <DollarSign size={16} className="text-indigo-500" /> 5. Ajuda / Apoio Financeiro Recorrente
                            </h4>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
                                <FormSelect 
                                    label="Oferecer Ajuda Financeira Sistem√°tica?" 
                                    value={data.ajuda_financeira_ativa || 'nao'} 
                                    onChange={v=>setData({...data, ajuda_financeira_ativa: v})} 
                                    options={[{label: 'N√£o - Apenas Apoio Geral / Ora√ß√£o', value: 'nao'}, {label: 'Sim - Registrar Ajuda Financeira', value: 'sim'}]} 
                                />
                                {data.ajuda_financeira_ativa === 'sim' && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Valor de Cada Ajuda (R$)" 
                                                type="number" 
                                                step="0.01" 
                                                value={data.ajuda_financeira_valor} 
                                                onChange={v=>setData({...data, ajuda_financeira_valor: parseFloat(v)})} 
                                                placeholder="Ex: 500" 
                                                required
                                            />
                                            <FormSelect 
                                                label="Per√≠odo da Ajuda" 
                                                value={data.ajuda_financeira_periodo || 'Mensal'} 
                                                onChange={v=>setData({...data, ajuda_financeira_periodo: v})} 
                                                options={['Mensal', 'Trimestral', 'Semestral', 'Anual', '√önico']} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Primeiro Vencimento" 
                                                type="date" 
                                                value={data.ajuda_financeira_vencimento} 
                                                onChange={v=>setData({...data, ajuda_financeira_vencimento: v})} 
                                                required
                                            />
                                            <FormInput 
                                                label="Qtd. de Parcelas / Ajuda" 
                                                type="number" 
                                                value={data.ajuda_financeira_qtd || 12} 
                                                onChange={v=>setData({...data, ajuda_financeira_qtd: parseInt(v) || 12})} 
                                                placeholder="Ex: 12"
                                                disabled={data.ajuda_financeira_periodo === '√önico'}
                                            />
                                        </div>
                                        {data.ajuda_financeira_gerada && (
                                            <div className="p-2.5 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                <span>Cronograma financeiro de suporte j√° foi gerado para este cadastro. Se alterar as datas e quiser gerar outras, desmarque a flag interna de controle `ajuda_financeira_gerada` editando o cadastro.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'missoes_colaborador':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users size={16} className="text-indigo-500" /> 1. Identifica√ß√£o do Colaborador / Parceiro
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Nome Completo / Raz√£o Social" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Jos√© da Silva ou Empresa XYZ Ltda."/>
                                <FormSelect 
                                    label="Tipo de Pessoa" 
                                    value={data.tipo_pessoa || 'pf'} 
                                    onChange={v=>setData({...data, tipo_pessoa:v})} 
                                    options={[{label: 'Pessoa F√≠sica (PF)', value: 'pf'}, {label: 'Pessoa Jur√≠dica (PJ)', value: 'pj'}]} 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <FormInput 
                                    label={data.tipo_pessoa === 'pj' ? "CNPJ" : "CPF"} 
                                    value={data.documento || ''} 
                                    onChange={v=>setData({...data, documento:v})} 
                                    placeholder={data.tipo_pessoa === 'pj' ? "Ex: 00.000.000/0001-00" : "Ex: 000.000.000-00"}
                                />
                                <FormInput label="E-mail de Contato" value={data.email || ''} onChange={v=>setData({...data, email:v})} placeholder="Ex: contato@exemplo.com"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <FormInput label="Celular / WhatsApp" value={data.telefone || data.contato || data.whatsapp || ''} onChange={v=>setData({...data, telefone:v, contato:v, whatsapp:v})} placeholder="Ex: 5511999999999"/>
                                {isMaster && <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <HeartHandshake size={16} className="text-indigo-500" /> 2. Tipo de Ajuda / Apoio
                            </h4>
                            <FormSelect 
                                label="Como deseja apoiar o Departamento de Miss√µes?" 
                                value={data.tipo || 'Ora√ß√£o'} 
                                onChange={v=>{
                                    const nextAct = v === 'Financeiro' ? 'sim' : 'nao';
                                    setData({...data, tipo:v, ajuda_financeira_ativa: nextAct});
                                }} 
                                options={['Ora√ß√£o', 'Financeiro', 'Volunt√°rio', 'Campanhas', 'Outro']} 
                            />
                        </div>

                        {/* Se o tipo for Financeiro, ou ajuda_financeira_ativa for sim, exibe o cronograma id√™ntico ao da ag√™ncia */}
                        {(data.tipo === 'Financeiro' || data.ajuda_financeira_ativa === 'sim') && (
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <DollarSign size={16} className="text-emerald-500" /> 3. Ajuda Financeira Recorrente / Programada
                                </h4>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
                                    <FormSelect 
                                        label="Deseja registrar contribui√ß√£o financeira programada?" 
                                        value={data.ajuda_financeira_ativa || 'sim'} 
                                        onChange={v=>setData({...data, ajuda_financeira_ativa: v})} 
                                        options={[{label: 'Sim - Ativar Contribui√ß√µes Programadas', value: 'sim'}, {label: 'N√£o - Contribui√ß√£o √önica / Espont√¢nea', value: 'nao'}]} 
                                    />
                                    {data.ajuda_financeira_ativa === 'sim' && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput 
                                                    label="Valor de Cada Contribui√ß√£o (R$)" 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={data.ajuda_financeira_valor} 
                                                    onChange={v=>setData({...data, ajuda_financeira_valor: parseFloat(v)})} 
                                                    placeholder="Ex: 50.00" 
                                                    required
                                                />
                                                <FormSelect 
                                                    label="Per√≠odo da Contribui√ß√£o" 
                                                    value={data.ajuda_financeira_periodo || 'Mensal'} 
                                                    onChange={v=>setData({...data, ajuda_financeira_periodo: v})} 
                                                    options={['Mensal', 'Trimestral', 'Semestral', 'Anual', '√önico']} 
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput 
                                                    label="Primeiro Vencimento" 
                                                    type="date" 
                                                    value={data.ajuda_financeira_vencimento} 
                                                    onChange={v=>setData({...data, ajuda_financeira_vencimento: v})} 
                                                    required
                                                />
                                                <FormInput 
                                                    label="Qtd. de Parcelas / Contribui√ß√µes" 
                                                    type="number" 
                                                    value={data.ajuda_financeira_qtd || 12} 
                                                    onChange={v=>setData({...data, ajuda_financeira_qtd: parseInt(v) || 12})} 
                                                    placeholder="Ex: 12"
                                                    disabled={data.ajuda_financeira_periodo === '√önico'}
                                                />
                                            </div>
                                            {data.ajuda_financeira_gerada && (
                                                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                    <span>Cronograma de contribui√ß√µes j√° foi gerado para este parceiro. Se alterar os dados e quiser gerar outros, desmarque a flag `ajuda_financeira_gerada` na edi√ß√£o para que sejam geradas novas parcelas.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
             case 'missoes_financeiro':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14}/> Lan√ßamento de Caixa Miss√µes</h4>
                          <FormInput label="Descri√ß√£o do Lan√ßamento" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required placeholder="Ex: Oferta Culto de Miss√µes / Sustento Mission√°rio"/>
                          <div className="grid grid-cols-2 gap-4"><FormInput label="Valor (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} required/><FormInput label="Data" type="date" value={data.data_competencia} onChange={v=>setData({...data, data_competencia:v})} required/></div>
                          <div className="grid grid-cols-2 gap-4">
                              <FormSelect label="Tipo" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={[{label:'Entrada (Oferta/D√≠zimo)', value:'entrada'}, {label:'Sa√≠da (Sustento/Despesa)', value:'saida'}]} />
                              <FormSelect label="Forma de Pagto" value={data.forma_pagamento} onChange={v=>setData({...data, forma_pagamento:v})} options={['PIX', 'Dinheiro', 'Cart√£o', 'Transfer√™ncia']} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <FormSelect label="Vincular Mission√°rio (Opcional)" value={data.missionario_id} onChange={v=>setData({...data, missionario_id:v})} options={db.missoes.missionarios.map(m=>({label:m.nome, value:m.id}))} />
                              {isMaster && <FormSelect label="Congrega√ß√£o / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                          </div>
                     </div>
                 );
             case 'missoes_agenda':
                 return (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput label="T√≠tulo do Evento / Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                            <FormSelect label="Tipo" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Evento', 'Tarefa', 'Escala Mission√°ria', 'Lembrete']} />
                            <FormInput label="Descri√ß√£o Detalhada" value={data.descricao} onChange={v=>setData({...data, descricao:v})} placeholder="Detalhes da a√ß√£o mission√°ria..."/>
                            <div className="grid grid-cols-2 gap-4"><FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/><FormInput label="Hor√°rio" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/></div>
                            <div className="grid grid-cols-2 gap-4"><FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Pendente', 'Em Andamento', 'Concluido', 'Cancelado']} /><FormInput label="WhatsApp (Contato Externo)" value={data.numero_whatsapp} onChange={v=>setData({...data, numero_whatsapp:v})} placeholder="Apenas n√∫meros. Ex: 5511999..."/></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={14}/> Equipe / Escala</h4>
                            <div className="flex gap-2 mb-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pessoa (Membro/Mis.)</label>
                                    <div className="relative">
                                        <select className="input-futuristic w-full p-2.5 rounded-xl text-sm appearance-none bg-white" value={tempMember.id} onChange={e => { const val = e.target.value; if(!val) { setTempMember({id:'', nome:'', telefone:''}); return; } let person = db.membros?.find(m => m.id === val) || db.missoes?.missionarios?.find(m => m.id === val) || db.missoes?.colaboradores?.find(m => m.id === val); if(person) { setTempMember({...tempMember, id: person.id, nome: person.nome, telefone: person.telefone || person.contato || ''}); } }}>
                                            <option value="">Selecione...</option>
                                            <optgroup label="Mission√°rios">{(db.missoes?.missionarios || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                            <optgroup label="Colaboradores">{(db.missoes?.colaboradores || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                            <optgroup label="Membros Igreja">{(db.membros || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                                    </div>
                                </div>
                                <div className="flex-1 uppercase"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fun√ß√£o</label><input type="text" className="input-futuristic w-full p-2.5 rounded-xl text-sm" placeholder="Ex: Preletor, Apoio..." value={tempMember.funcao} onChange={e => setTempMember({...tempMember, funcao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})}/></div>
                                <button onClick={() => { if(!tempMember.id) return; const newTeam = [...(data.equipe || [])]; if(newTeam.find(t => t.id === tempMember.id)) { alert("Pessoa j√° adicionada."); return; } newTeam.push({ id: tempMember.id, nome: tempMember.nome, telefone: tempMember.telefone, funcao_escala: tempMember.funcao || 'Apoio' }); setData({...data, equipe: newTeam}); setTempMember({id: '', nome: '', telefone: '', funcao: ''}); }} className="bg-indigo-500 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200" type="button"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {(data.equipe || []).map((member, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{member.nome ? member.nome.charAt(0) : '?'}</div><div><p className="font-bold text-sm text-slate-700 leading-tight">{member.nome}</p><p className="text-[10px] text-slate-500">{member.funcao_escala}</p></div></div>
                                        <button onClick={() => { const newTeam = [...data.equipe]; newTeam.splice(idx, 1); setData({...data, equipe: newTeam}); }} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors" type="button"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {(!data.equipe || data.equipe.length === 0) && <p className="text-xs text-slate-400 text-center py-4 italic">Nenhuma pessoa escalada.</p>}
                            </div>
                        </div>
                     </div>
                 );
             case 'visitante':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Nome do Visitante" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                         <FormInput label="Telefone / WhatsApp" value={data.telefone} onChange={v=>setData({...data, telefone:v})} required placeholder="Ex: 5521999999999"/>
                         <div className="grid grid-cols-2 gap-4"><FormInput label="Data da Visita" type="date" value={data.data_visita} onChange={v=>setData({...data, data_visita:v})} required/><FormSelect label="Status no Funil" value={data.status} onChange={v=>setData({...data, status:v})} options={['1¬™ Visita', 'Contato Feito', 'Em Discipulado', 'Integrado']} /></div>
                         <FormInput label="Observa√ß√µes / Pedido de Ora√ß√£o" value={data.obs} onChange={v=>setData({...data, obs:v})} placeholder="Detalhes importantes da visita..."/>
                         <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                             <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Plano de Integra√ß√£o (CRM)</label><Button type="button" onClick={async () => { setLoadingAiPlan(true); const prompt = `Atue como um pastor especialista em consolida√ß√£o de novos convertidos. Crie um plano de acompanhamento pr√°tico de 4 semanas para este visitante que esteve na nossa igreja: Nome: ${data.nome || 'Visitante'}. Status atual: ${data.status || 'Recente'}. Observa√ß√µes: ${data.obs || 'Nenhuma'}. Retorne apenas o plano passo-a-passo em formato Markdown, curto e inspirador.`; const res = await callGeminiAI(prompt); setData({...data, plano_integracao: res}); setLoadingAiPlan(false); }} disabled={loadingAiPlan} variant="ghost" className="bg-white text-indigo-600 border border-indigo-200 text-[10px] py-1.5 px-3">{loadingAiPlan ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} ‚ú® Gerar Plano com IA</Button></div>
                             <textarea className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px] uppercase" value={data.plano_integracao || ''} onChange={e => setData({...data, plano_integracao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})} placeholder="Escreva ou gere com IA os passos sugeridos para consolidar este visitante..."></textarea>
                         </div>
                     </div>
                 );
             default: return <p className="text-slate-500 italic">Formul√°rio padr√£o para {type}.</p>;
        }
    };

    return createPortal(
        <InteractiveWindow
            id={`generic_modal_${type}`}
            title={data.nome || data.titulo || data.descricao || (data.id ? 'Modificar Registro' : 'Novo Registro')}
            subtitle={`${data.id ? 'Editando Registro' : 'Novo Registro'} ‚Ä¢ ${themeInfo.title}`}
            onClose={onClose}
            icon={themeInfo.icon}
            headerBg={themeInfo.bg}
            defaultWidth={670}
            defaultHeight={670}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isSaving} className="border border-white/60 bg-white/40 hover:bg-white cursor-pointer">Cancelar</Button>
                    <Button variant="primary" onClick={handleInternalSave} disabled={isSaving} className="shadow-indigo-500/40 cursor-pointer flex items-center gap-2">
                        {isSaving ? <Loader2 size={20} className="animate-spin inline" /> : <Save size={20} />} 
                        {isSaving ? 'A Salvar...' : 'Salvar Dados'}
                    </Button>
                </>
            }
        >
            {renderForm()}
        </InteractiveWindow>,
        document.body
    );
};

// --- DYNAMIC PAGE BOUNDARY INDICATORS FOR PREVIEW ---
export const PageBoundaryIndicators = ({ marginType, targetHeight, contentRef }: { marginType: string; targetHeight: number; contentRef: React.RefObject<HTMLDivElement | null> }) => {
    const [totalHeight, setTotalHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            if (contentRef.current) {
                const h = contentRef.current.scrollHeight;
                setTotalHeight(prev => (prev === h ? prev : h));
            }
        };

        const timer = setTimeout(updateHeight, 600);
        
        window.addEventListener('resize', updateHeight);
        
        let observer: MutationObserver | null = null;
        if (typeof MutationObserver !== 'undefined' && contentRef.current) {
            observer = new MutationObserver((mutations) => {
                const isOverlayOnly = mutations.every(m => {
                    const el = m.target as HTMLElement;
                    return el && (el.classList?.contains('page-boundary-overlay') || el.closest?.('.page-boundary-overlay'));
                });
                if (!isOverlayOnly) {
                    updateHeight();
                }
            });
            observer.observe(contentRef.current, { childList: true, subtree: true, attributes: true });
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateHeight);
            if (observer) observer.disconnect();
        };
    }, [contentRef, targetHeight, marginType]);

    const isLandscape = targetHeight === 794;
    const currentWidth = isLandscape ? 1123 : 794;
    
    const getPrintMarginsPx = (type: string) => {
        if (type === 'moderada') return { top: 76, bottom: 76, left: 76, right: 76 };
        if (type === 'estreita') return { top: 57, bottom: 57, left: 57, right: 57 };
        return { top: 113, bottom: 76, left: 113, right: 76 }; // abnt / padr√£o
    };

    const margins = getPrintMarginsPx(marginType);
    const scaleX = (currentWidth - margins.left - margins.right) / currentWidth;
    const printableHeight = targetHeight - margins.top - margins.bottom;
    const maxSliceHeight = Math.floor(printableHeight / (scaleX || 1)) || targetHeight;

    if (totalHeight <= maxSliceHeight) return null;

    const pageCount = Math.ceil(totalHeight / maxSliceHeight);
    const pages = Array.from({ length: pageCount - 1 });

    return (
        <div className="absolute inset-0 pointer-events-none no-print overflow-hidden select-none z-[1000] page-boundary-overlay">
            {pages.map((_, index) => {
                const topPos = (index + 1) * maxSliceHeight;
                return (
                    <div 
                        key={index} 
                        style={{ top: `${topPos}px` }} 
                        className="absolute left-0 right-0 border-t-2 border-dashed border-rose-500 opacity-60 flex justify-end items-center"
                    >
                        <span className="bg-rose-600 text-white font-black font-mono text-[9px] uppercase tracking-[0.2em] py-1 px-3 rounded-l-md shadow-[0_4px_10px_rgba(225,29,72,0.4)] transform -translate-y-1/2">
                            Quebra F√≠sica de P√°gina {index + 1} (A4 {marginType.toUpperCase()})
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// --- PREVIEW SYSTEM & DOCUMENT ---
export const DocumentPreviewModal = ({ 
    isOpen, 
    onClose, 
    mode, 
    data,
    palette,
    setPalette,
    marginType,
    setMarginType,
    orientation,
    setOrientation,
    contentScale,
    setContentScale
}) => {
    const { addToast } = useContext(ChurchContext);
    const contentRef = useRef<HTMLDivElement>(null);
    const [renderProgress, setRenderProgress] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isAutoFit, setIsAutoFit] = useState<boolean>(false);

    const [showWatermark, setShowWatermark] = useState<boolean>(false);
    const [includeSignatures, setIncludeSignatures] = useState<boolean>(false);
    const [signatureName1, setSignatureName1] = useState<string>("");
    const [signatureTitle1, setSignatureTitle1] = useState<string>("");
    const [signatureName2, setSignatureName2] = useState<string>("");
    const [signatureTitle2, setSignatureTitle2] = useState<string>("");

    // States for pre-defined digital signatures tab & manager
    const [previewTab, setPreviewTab] = useState<'layout' | 'signatures_manager'>('layout');
    const [savedSignatures, setSavedSignatures] = useState<Array<{id: string, name: string, title: string}>>(() => {
        try {
            const local = localStorage.getItem("gipp_predefined_signatures");
            if (local) return JSON.parse(local);
        } catch (e) {}
        return [
            { id: '1', name: "Pr. Antonio Silva", title: "Pastor Presidente" },
            { id: '2', name: "Tes. Marcos Oliveira", title: "Coordenador Financeiro" },
            { id: '3', name: "Sec. Sandra Lima", title: "Secret√°ria Geral" }
        ];
    });
    const [newSigName, setNewSigName] = useState("");
    const [newSigTitle, setNewSigTitle] = useState("");

    useEffect(() => {
        if (isOpen && data) {
            setShowWatermark(false);
            setIncludeSignatures(false);
            setSignatureName1(data.igreja?.pastor || "");
            setSignatureTitle1("Pastor Presidente");
            setSignatureName2(data.igreja?.tesoureiro1 || "");
            setSignatureTitle2("Coordenador Financeiro");
        }
    }, [isOpen, data]);

    if (!isOpen) return null;

    const handleAutoFitWidth = () => {
        if (!contentRef.current) return;
        
        setIsAutoFit(true);
        addToast("Analisando dimens√µes para otimiza√ß√£o autom√°tica...", "info");
        
        // Temporariamente reseta para 100 para medir a largura ideal sem escalas pr√©-existentes
        setContentScale(100);
        
        setTimeout(() => {
            if (!contentRef.current) return;
            
            let maxScrollWidth = targetWidth;
            
            // Busca tabelas ou blocos dentro do container que possam ter estourado o limite horizontal
            const elements = contentRef.current.querySelectorAll('table, .print-block, .w-full, div');
            elements.forEach((el: any) => {
                if (el.scrollWidth > maxScrollWidth) {
                    maxScrollWidth = el.scrollWidth;
                }
            });
            
            if (maxScrollWidth > targetWidth) {
                // Buffer de seguran√ßa para evitar quebras ou cortes de linha na impress√£o f√≠sica
                const calculatedRatio = (targetWidth - 12) / maxScrollWidth;
                const roundedScale = Math.max(50, Math.min(100, Math.floor(calculatedRatio * 100)));
                setContentScale(roundedScale);
                addToast(`Largura ajustada com sucesso! Escala de conte√∫do definida em ${roundedScale}%.`, "success");
            } else {
                setContentScale(100);
                addToast("O conte√∫do j√° est√° perfeitamente ajustado √† largura padr√£o da p√°gina A4.", "success");
            }
        }, 150);
    };

    const isLandscape = orientation === 'landscape';
    const targetWidth = isLandscape ? 1123 : 794;
    const targetHeight = isLandscape ? 794 : 1123;

    // Fun√ß√£o centralizada para renderizar a √°rea usando o jsPDF em modo imagem estrita com quebras para A4
    const generateProfessionalPDF = async () => {
        setRenderProgress("Inicializando motor gr√°fico de PDF...");
        await new Promise(r => setTimeout(r, 200));

        let targetEl = contentRef.current;
        if (!targetEl) {
            targetEl = document.querySelector('.print-area') as HTMLDivElement;
        }

        if (!targetEl) {
            addToast("Erro: √°rea de impress√£o n√£o localizada no sistema.", "error");
            setRenderProgress(null);
            return null;
        }

        const originalStyle = targetEl.getAttribute('style') || '';
        const originalClassName = targetEl.className || '';

        try {
            setRenderProgress("Otimizando layout e estiliza√ß√£o para A4...");
            // Configurar estilos limpos para A4 exatos para garantir renderiza√ß√£o perfeita
            targetEl.className = "bg-white flex flex-col";
            targetEl.setAttribute('style', `
                display: block !important;
                width: ${targetWidth}px !important;
                min-width: ${targetWidth}px !important;
                max-width: ${targetWidth}px !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                transform: none !important;
                box-sizing: border-box !important;
                overflow: visible !important;
            `);

            // Delay para o browser recalcular reflow de fontes e imagens
            await new Promise(r => setTimeout(r, 450));

            setRenderProgress("Processando vetoriza√ß√£o do documento e fontes...");
            const dataUrl = await toPng(targetEl, {
                quality: 0.98,
                backgroundColor: '#ffffff',
                filter: (node: any) => {
                    if (node && node.classList && (node.classList.contains('no-print') || node.classList.contains('page-boundary-overlay'))) {
                        return false;
                    }
                    return true;
                },
                style: {
                    transform: 'none',
                    margin: '0',
                    padding: '0',
                },
                width: targetWidth,
                height: targetEl.scrollHeight
            });

            setRenderProgress("Analisando dimens√µes f√≠sicas e vetor de corte...");
            const img = new window.Image();
            img.src = dataUrl;
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
            });

            setRenderProgress("Slicing inteligente de p√°ginas em andamento...");
            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = typeof pdf.internal.pageSize.getWidth === 'function' ? pdf.internal.pageSize.getWidth() : 210;
            const pdfHeight = typeof pdf.internal.pageSize.getHeight === 'function' ? pdf.internal.pageSize.getHeight() : 297;
            
            // 1. Obter margens em pixels com base no marginType selecionado
            const getPrintMarginsPx = (type: string) => {
                if (type === 'moderada') {
                    return { top: 76, bottom: 76, left: 76, right: 76 };
                } else if (type === 'estreita') {
                    return { top: 57, bottom: 57, left: 57, right: 57 };
                }
                // padr√£o / abnt (Superior/Esquerda: 3cm [113px], Inferior/Direita: 2cm [76px])
                return { top: 113, bottom: 76, left: 113, right: 76 };
            };

            const margins = getPrintMarginsPx(marginType);
            
            // Fator de escala horizontal para caber nas margens esquerda e direita
            const scaleX = Math.max(0.01, (targetWidth - margins.left - margins.right) / targetWidth);
            
            // Altura √∫til de impress√£o no papel em pixels
            const printableHeight = targetHeight - margins.top - margins.bottom;
            
            // Altura m√°xima proporcional da imagem de entrada a ser cortada por p√°gina
            const maxSliceHeight = Math.max(10, Math.floor(printableHeight / scaleX));

            // 2. Coletar os limites verticais de todos os elementos indivis√≠veis dentro do documento
            const containerRect = targetEl.getBoundingClientRect();
            const ranges = Array.from(targetEl.querySelectorAll('tr, .avoid-break, h1, h2, h3, h4, h5, h6, img, .print-block'))
                .map((node: any) => {
                    const rect = node.getBoundingClientRect();
                    return {
                        top: rect.top - containerRect.top,
                        bottom: rect.bottom - containerRect.top,
                        height: rect.height
                    };
                })
                .filter(r => r.height > 0 && r.top >= 0)
                .sort((a, b) => a.top - b.top);

            let srcY = 0;
            let pageIndex = 0;
            const totalHeight = img.height || 0;
            const approxTotalPages = Math.max(1, Math.ceil(totalHeight / maxSliceHeight));

            while (srcY + 5 < totalHeight) {
                if (pageIndex > 0) {
                    pdf.addPage();
                }

                setRenderProgress(`Compilando p√°gina ${pageIndex + 1} de ${approxTotalPages}...`);
                let currentSliceHeight = Math.min(totalHeight - srcY, maxSliceHeight);

                // Evitar cortar linhas ou t√≠tulos no meio se houver espa√ßo remanescente razo√°vel na p√°gina
                if (srcY + currentSliceHeight < totalHeight) {
                    const idealCutY = srcY + currentSliceHeight;
                    let adjustedCutY = idealCutY;

                    for (const range of ranges) {
                        if (range.top > srcY && range.top < idealCutY && range.bottom > idealCutY) {
                            if (range.top - srcY > 200) {
                                adjustedCutY = range.top;
                                break;
                            }
                        }
                    }
                    currentSliceHeight = Math.max(1, adjustedCutY - srcY);
                }

                // Criar canvas de corte intermedi√°rio para desenhar o peda√ßo da p√°gina
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = targetWidth;
                tempCanvas.height = targetHeight;

                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, targetWidth, targetHeight);
                    // Desenha o conte√∫do escalado centralizado entre as margens
                    tempCtx.drawImage(
                        img,
                        0, srcY, img.width || targetWidth, currentSliceHeight, 
                        margins.left, margins.top, Math.max(1, targetWidth - margins.left - margins.right), Math.max(1, currentSliceHeight * scaleX)
                    );
                }

                const pageDataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
                if (pdfWidth > 0 && pdfHeight > 0) {
                    pdf.addImage(pageDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, `page_${pageIndex}`, 'FAST');
                }

                pageIndex++;
                srcY += currentSliceHeight;
                await new Promise(r => setTimeout(r, 10)); // aliviar thread
            }

            // Restaura imediatamente os estilos originais
            targetEl.className = originalClassName;
            targetEl.setAttribute('style', originalStyle);
            setRenderProgress(null);
            return pdf;

        } catch (error) {
            console.error("Erro cr√≠tico ao gerar PDF:", error);
            targetEl.className = originalClassName;
            targetEl.setAttribute('style', originalStyle);
            setRenderProgress(null);
            addToast("Erro sist√™mico ao carregar renderizador f√≠sico de PDF.", "error");
            return null;
        }
    };

    const handleDownloadDocument = async () => {
        const pdf = await generateProfessionalPDF();
        if (pdf) {
            pdf.save(`Documento_${mode}_${new Date().getTime()}.pdf`);
            addToast("PDF de alta resolu√ß√£o baixado com sucesso!", "success");
        }
    };

    const handleNativePrint = () => {
        addToast("Abrindo di√°logo de impress√£o f√≠sica do sistema...", "success");
        setTimeout(() => {
            window.print();
        }, 150);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/85 z-[12000] flex items-center justify-center p-4 backdrop-blur-md animate-entrance print:hidden">
            {/* Modal Box */}
            <div className="bg-slate-800 w-full max-w-7xl h-[95vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden border border-slate-700 relative">
                
                {/* Header do Visualizador */}
                <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center px-8 z-20 shadow-lg flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600/20 rounded-xl text-indigo-400">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm md:text-base text-white flex items-center gap-2">
                                Visualizador Oficial de Documentos GIPP <span className="text-[10px] bg-slate-800 font-bold px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700/50">PDF HQ</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">A4 Standard ‚Ä¢ Processamento em Modo Imagem</p>
                        </div>
                    </div>

                    {/* Controles do visualizador */}
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        {/* Seletor de Estilo / Paleta CSS */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden">
                                <Palette size={13} className="text-indigo-400" /> Estilo:
                            </span>
                            <button 
                                onClick={() => setPalette('cinza')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${palette === 'cinza' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Paleta Cinza Antracite (Padr√£o)"
                            >
                                Cinza
                            </button>
                            <button 
                                onClick={() => setPalette('azul')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${palette === 'azul' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Paleta Azul Celestial"
                            >
                                Azul
                            </button>
                            <button 
                                onClick={() => setPalette('verde')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${palette === 'verde' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Paleta Verde Realeza"
                            >
                                Verde
                            </button>
                        </div>

                        {/* Seletor de Margem / Ajustar P√°gina */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Ajustar margens da p√°gina">
                                Margem:
                            </span>
                            <button 
                                onClick={() => setMarginType('abnt')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'abnt' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem Padr√£o (Superior: 3cm / Esquerda: 3cm / Inferior: 2cm / Direita: 2cm)"
                            >
                                Padr√£o
                            </button>
                            <button 
                                onClick={() => setMarginType('moderada')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'moderada' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem M√©dia (2.0 cm em todas)"
                            >
                                M√©dia
                            </button>
                            <button 
                                onClick={() => setMarginType('estreita')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'estreita' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem Estreita (1.5 cm em todas)"
                            >
                                Estreita
                            </button>
                        </div>

                        {/* Seletor de Orienta√ß√£o da P√°gina */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Mudar orienta√ß√£o da p√°gina">
                                Orienta√ß√£o:
                            </span>
                            <button 
                                onClick={() => setOrientation('portrait')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${orientation === 'portrait' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Formato Retrato (Vertical)"
                            >
                                Retrato
                            </button>
                            <button 
                                onClick={() => setOrientation('landscape')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${orientation === 'landscape' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Formato Paisagem (Horizontal)"
                            >
                                Paisagem
                            </button>
                        </div>

                        {/* Ajustar √† largura da p√°gina */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Ajustar conte√∫do para caber na largura da p√°gina (escala de impress√£o)">
                                Ajustar Largura:
                            </span>
                            <button 
                                onClick={() => { setContentScale(100); setIsAutoFit(false); }}
                                className={`px-2 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${contentScale === 100 && !isAutoFit ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Sem Escalar (100%)"
                            >
                                100%
                            </button>
                            <button 
                                onClick={() => { setContentScale(90); setIsAutoFit(false); }}
                                className={`px-2 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${contentScale === 90 && !isAutoFit ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Escala do conte√∫do em 90%"
                            >
                                90%
                            </button>
                            <button 
                                onClick={() => { setContentScale(80); setIsAutoFit(false); }}
                                className={`px-2 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${contentScale === 80 && !isAutoFit ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Escala do conte√∫do em 80%"
                            >
                                80%
                            </button>
                            <button 
                                onClick={() => handleAutoFitWidth()}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg flex items-center gap-1 ${isAutoFit ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Calcular escala automaticamente para caber tabelas sem cort√°-las no papel"
                            >
                                <Sparkles size={11} className={isAutoFit ? 'text-emerald-300 animate-pulse' : 'text-slate-400'} /> 
                                {isAutoFit && contentScale < 100 ? `Auto (${contentScale}%)` : 'Auto'}
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <button 
                                onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                                className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-xs font-bold transition-all"
                                title="Diminuir Zoom"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold font-mono text-slate-300 w-12 text-center select-none">{zoom}%</span>
                            <button 
                                onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                                className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg text-xs font-bold transition-all"
                                  title="Aumentar Zoom"
                            >
                                <Plus size={14} />
                            </button>
                            <button 
                                onClick={() => setZoom(100)}
                                className="p-1 px-2 text-slate-500 hover:text-indigo-400 font-black rounded-lg text-[10px] uppercase transition-all"
                                title="Resetar Zoom"
                            >
                                100%
                            </button>
                        </div>

                        <Button variant="ghost" onClick={onClose} className="border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-transparent py-2 px-4 transition-all text-xs">
                            Fechar
                        </Button>
                        <Button variant="primary" onClick={handleDownloadDocument} className="shadow-lg shadow-indigo-600/10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4.5 rounded-xl text-xs font-bold">
                            <Download size={16}/> Baixar PDF 
                        </Button>
                        <Button variant="success" onClick={handleNativePrint} className="shadow-lg shadow-emerald-600/10 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4.5 rounded-xl text-xs font-bold">
                            <Printer size={16}/> Imprimir
                        </Button>
                    </div>
                </div>

                {/* NOVO: Ajustes Avan√ßados de Layout e Institucionalidade */}
                <div className="bg-slate-850 border-b border-slate-800 flex flex-col z-10 select-none">
                    {/* Tab Navigation Controls */}
                    <div className="flex border-b border-slate-800/85 bg-slate-900/60 overflow-x-auto scrollbar-none shrink-0">
                        <button
                            type="button"
                            onClick={() => setPreviewTab('layout')}
                            className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all shrink-0 ${previewTab === 'layout' ? 'border-indigo-500 text-white bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                        >
                            <Settings size={14} className={previewTab === 'layout' ? 'text-indigo-400' : 'text-slate-400'} /> 
                            Customiza√ß√£o do Layout e √Ågua
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewTab('signatures_manager')}
                            className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all shrink-0 ${previewTab === 'signatures_manager' ? 'border-emerald-500 text-white bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                        >
                            <PenTool size={14} className={previewTab === 'signatures_manager' ? 'text-emerald-400' : 'text-slate-400'} /> 
                            Assinaturas Pr√©-definidas Salvas
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 font-mono">
                                {savedSignatures.length}
                            </span>
                        </button>
                    </div>

                    {/* Tab 1: Layout Controls */}
                    {previewTab === 'layout' && (
                        <div className="px-8 py-3 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
                            <div className="flex items-center gap-6 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                    <Settings size={12} className="text-indigo-400" /> Customiza√ß√£o Institucional:
                                </span>

                                {/* Toggle de Marca d'√°gua */}
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={showWatermark} 
                                        onChange={e => setShowWatermark(e.target.checked)}
                                        className="accent-indigo-500 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                    />
                                    <span className="flex items-center gap-1"><Award size={13} className="text-slate-400" /> Marca d'√°gua de Fundo</span>
                                </label>
                                
                                <div className="w-px h-4 bg-slate-800"></div>

                                {/* Toggle de Assinaturas */}
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={includeSignatures} 
                                        onChange={e => setIncludeSignatures(e.target.checked)}
                                        className="accent-indigo-500 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                    />
                                    <span className="flex items-center gap-1"><PenTool size={13} className="text-slate-400" /> Incluir Assinaturas Oficiais</span>
                                </label>
                            </div>

                            {/* Inputs das assinaturas (Exibidos apenas se "includeSignatures" for verdadeiro) */}
                            {includeSignatures && (
                                <div className="flex items-center gap-3 animate-fadeIn flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase">Assinatura 1:</span>
                                        <input 
                                            type="text" 
                                            value={signatureName1} 
                                            onChange={e => setSignatureName1(e.target.value)} 
                                            placeholder="Nome da lideran√ßa"
                                            className="bg-slate-900 text-slate-150 text-[11px] font-bold border border-slate-700 rounded-lg px-2 py-1 w-32 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                            title="Nome da Assinatura 1"
                                        />
                                        <input 
                                            type="text" 
                                            value={signatureTitle1} 
                                            onChange={e => setSignatureTitle1(e.target.value)} 
                                            placeholder="Cargo / Minist√©rio"
                                            className="bg-slate-900 text-slate-400 text-[11px] font-semibold border border-slate-700 rounded-lg px-2 py-1 w-28 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                            title="Cargo da Assinatura 1"
                                        />
                                    </div>
                                    <span className="text-slate-700 font-bold hidden sm:inline">‚Ä¢</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase">Assinatura 2:</span>
                                        <input 
                                            type="text" 
                                            value={signatureName2} 
                                            onChange={e => setSignatureName2(e.target.value)} 
                                            placeholder="Nome da lideran√ßa"
                                            className="bg-slate-900 text-slate-150 text-[11px] font-bold border border-slate-700 rounded-lg px-2 py-1 w-32 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                            title="Nome da Assinatura 2"
                                        />
                                        <input 
                                            type="text" 
                                            value={signatureTitle2} 
                                            onChange={e => setSignatureTitle2(e.target.value)} 
                                            placeholder="Cargo / Minist√©rio"
                                            className="bg-slate-900 text-slate-400 text-[11px] font-semibold border border-slate-700 rounded-lg px-2 py-1 w-28 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                            title="Cargo da Assinatura 2"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Signatures Manager */}
                    {previewTab === 'signatures_manager' && (
                        <div className="px-8 py-4 bg-slate-850 animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-t border-slate-800">
                            {/* Cadastrar Nova Lideran√ßa / Assinatura */}
                            <form onSubmit={(e) => { e.preventDefault(); }} className="lg:col-span-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
                                <h4 className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                    <Plus size={12} /> Cadastrar Nova Assinatura
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium">Salve novas lideran√ßas pr√©-definidas para que fiquem salvas no navegador para futuras impress√µes do sistema.</p>
                                
                                <div className="space-y-2.5 pt-1">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo do Membro / Lideran√ßa</label>
                                        <input 
                                            type="text"
                                            value={newSigName}
                                            onChange={e => setNewSigName(e.target.value)}
                                            placeholder="Ex: Pr. Geraldo de Alencar"
                                            className="w-full bg-slate-800 text-slate-100 text-xs border border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-600 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo / Minist√©rio / Fun√ß√£o</label>
                                        <input 
                                            type="text"
                                            value={newSigTitle}
                                            onChange={e => setNewSigTitle(e.target.value)}
                                            placeholder="Ex: 2¬∫ Vice-Presidente ou Tesoureiro Oficial"
                                            className="w-full bg-slate-800 text-slate-100 text-xs border border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-600 font-bold"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!newSigName.trim() || !newSigTitle.trim()) {
                                                addToast("Por favor, preencha o nome e o cargo/minist√©rio.", "error");
                                                return;
                                            }
                                            const newSig = {
                                                id: `sig_${Date.now()}`,
                                                name: newSigName.trim(),
                                                title: newSigTitle.trim()
                                            };
                                            const updated = [...savedSignatures, newSig];
                                            setSavedSignatures(updated);
                                            localStorage.setItem("gipp_predefined_signatures", JSON.stringify(updated));
                                            setNewSigName("");
                                            setNewSigTitle("");
                                            addToast("Assinatura salva com sucesso!", "success");
                                        }}
                                        className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border-0 cursor-pointer"
                                    >
                                        <Save size={13} /> Gravar Assinatura na Lista
                                    </button>
                                </div>
                            </form>

                            {/* Listagem de Assinaturas pr√©-definidas */}
                            <div className="lg:col-span-8 space-y-3">
                                <div className="flex justify-between items-center px-1 flex-wrap gap-2">
                                    <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                        <ClipboardList size={13} className="text-emerald-400" /> Assinaturas Pr√©-definidas Salvas
                                    </h4>
                                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                        <span>Slot 1: <strong className="text-indigo-400">{signatureName1 || 'Nenhum'}</strong></span>
                                        <span>‚Ä¢</span>
                                        <span>Slot 2: <strong className="text-emerald-400">{signatureName2 || 'Nenhum'}</strong></span>
                                    </div>
                                </div>
                                
                                {savedSignatures.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
                                        <PenTool className="text-slate-600 mx-auto mb-2 animate-pulse" size={24} />
                                        <p className="text-xs text-slate-400 font-bold uppercase">Nenhuma assinatura pr√©-definida salva.</p>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Cadastre uma assinatura no formul√°rio ao lado para come√ßar.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                                        {savedSignatures.map(sig => (
                                            <div key={sig.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between gap-3 shadow-md transition-colors">
                                                <div>
                                                    <p className="text-xs font-black text-slate-100 uppercase tracking-tight truncate">{sig.name}</p>
                                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider truncate mb-1">{sig.title}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 gap-2 mt-auto">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSignatureName1(sig.name);
                                                                setSignatureTitle1(sig.title);
                                                                setIncludeSignatures(true);
                                                                addToast(`"${sig.name}" definido no Slot 1!`, "success");
                                                            }}
                                                            className="text-[9px] font-black uppercase text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                                                            title="Aplicar no primeiro espa√ßo de assinatura"
                                                        >
                                                            Slot 1
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSignatureName2(sig.name);
                                                                setSignatureTitle2(sig.title);
                                                                setIncludeSignatures(true);
                                                                addToast(`"${sig.name}" definido no Slot 2!`, "success");
                                                            }}
                                                            className="text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                                                            title="Aplicar no segundo espa√ßo de assinatura"
                                                        >
                                                            Slot 2
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = savedSignatures.filter(s => s.id !== sig.id);
                                                            setSavedSignatures(updated);
                                                            localStorage.setItem("gipp_predefined_signatures", JSON.stringify(updated));
                                                            addToast("Assinatura predefinida exclu√≠da.", "info");
                                                        }}
                                                        className="text-rose-500 hover:text-rose-450 hover:bg-rose-500/15 p-1 rounded transition-colors ml-auto border-0 bg-transparent cursor-pointer"
                                                        title="Excluir da lista"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* √Årea Interna de Preview com Centraliza√ß√£o */}
                <div className="flex-1 overflow-auto bg-slate-900/50 custom-scrollbar p-6 flex justify-center items-start">
                    <div 
                        style={{ 
                            transform: `scale(${zoom / 100})`, 
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease-out'
                        }}
                        className="mb-8"
                    >
                        <div 
                            ref={contentRef} 
                            style={{ 
                                width: `${targetWidth}px`, 
                                minHeight: `${targetHeight}px`,
                                boxSizing: 'border-box',
                                position: 'relative'
                            }}
                            className="bg-white shadow-2xl border border-slate-700/30 flex flex-col rounded-sm origin-top animate-fadeIn"
                        >
                            <PrintSystem 
                                mode={mode} 
                                data={data} 
                                palette={palette} 
                                marginType={marginType} 
                                contentScale={contentScale} 
                                orientation={orientation}
                                includeSignatures={includeSignatures}
                                customSignatureName1={signatureName1}
                                customSignatureTitle1={signatureTitle1}
                                customSignatureName2={signatureName2}
                                customSignatureTitle2={signatureTitle2}
                                showWatermark={showWatermark}
                            />
                            <PageBoundaryIndicators marginType={marginType} targetHeight={targetHeight} contentRef={contentRef} />
                        </div>
                    </div>
                </div>

                {/* Progress Overlay */}
                {renderProgress && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-[13000] animate-fadeIn">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={36} />
                            <div className="space-y-1">
                                <h4 className="font-bold text-white text-sm">Processando Documento</h4>
                                <p className="text-xs text-slate-400 font-medium">{renderProgress}</p>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PrintSystem = ({ 
    mode, 
    data, 
    palette = 'cinza', 
    marginType = 'abnt', 
    contentScale = 100, 
    orientation = 'landscape',
    includeSignatures = false,
    customSignatureName1 = '',
    customSignatureTitle1 = '',
    customSignatureName2 = '',
    customSignatureTitle2 = '',
    showWatermark = false
}) => {
    if (!mode || !data) return null;

    // Configura√ß√£o de margens din√¢micas de acordo com o seletor de layout
    const marginStyles = {
        abnt: { paddingTop: '30mm', paddingLeft: '30mm', paddingBottom: '20mm', paddingRight: '20mm' },
        moderada: { paddingTop: '20mm', paddingLeft: '20mm', paddingBottom: '20mm', paddingRight: '20mm' },
        estreita: { paddingTop: '15mm', paddingLeft: '15mm', paddingBottom: '15mm', paddingRight: '15mm' }
    };
    const selectedMargin = marginStyles[marginType as 'abnt' | 'moderada' | 'estreita'] || marginStyles.abnt;

    // Paleta de cores para customiza√ß√£o de Layout do Cabe√ßalho e T√≠tulos de Relat√≥rios
    const colorMap = {
        cinza: {
            borderHeader: 'border-slate-900',
            borderLogo: 'border-slate-900',
            borderAccent: 'border-slate-900',
            textTitle: 'text-slate-950',
            textSubtitle: 'text-slate-800',
            borderTableHead: 'border-slate-400',
            bgTableHead: 'bg-slate-100'
        },
        azul: {
            borderHeader: 'border-indigo-600',
            borderLogo: 'border-indigo-600',
            borderAccent: 'border-indigo-600',
            textTitle: 'text-indigo-950',
            textSubtitle: 'text-indigo-800',
            borderTableHead: 'border-indigo-300',
            bgTableHead: 'bg-indigo-50/65'
        },
        verde: {
            borderHeader: 'border-emerald-600',
            borderLogo: 'border-emerald-600',
            borderAccent: 'border-emerald-600',
            textTitle: 'text-emerald-950',
            textSubtitle: 'text-emerald-800',
            borderTableHead: 'border-emerald-300',
            bgTableHead: 'bg-emerald-50/65'
        }
    };

    const colors = colorMap[palette as 'cinza' | 'azul' | 'verde'] || colorMap.cinza;

    const OfficialHeader = () => (
        <div className={`flex items-center gap-6 border-b-4 ${colors.borderHeader} pb-4 mb-6 avoid-break relative z-10`}>
            {data.igreja?.logo ? (
                <img src={data.igreja.logo} className="h-20 w-20 object-contain" alt="Logo"/>
            ) : (
                <div className={`h-20 w-20 border-2 ${colors.borderLogo} flex items-center justify-center p-2 text-center text-[10px] font-bold`}>Sem Logo</div>
            )}
            <div className="flex-1 text-center">
                <h1 className={`font-serif text-2xl font-black uppercase ${colors.textTitle} leading-tight mb-1`}>{data.igreja?.nome || "Minist√©rio"}</h1>
                <p className="text-[11px] text-slate-600 font-medium">
                    {data.igreja?.endereco} - {data.igreja?.cidade}/{data.igreja?.uf} ‚Ä¢ CNPJ: {data.igreja?.cnpj}
                </p>
                {data.igreja?.pastor && <p className="text-[11px] text-slate-800 font-bold mt-1 uppercase">Pastor Presidente: {data.igreja?.pastor}</p>}
            </div>
            <div className="w-24 flex flex-col items-end justify-center text-right">
                 <p className="text-[9px] font-bold text-slate-500 uppercase">Emiss√£o</p>
                 <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                 <p className="text-[8px] text-slate-400 mt-2 text-right">GIPP System</p>
            </div>
        </div>
    );

    // ESTRUTURA GLOBAL DE P√ÅGINA REFORMULADA (Evita a tabela gigante que corrompia as quebras de p√°gina)
    const PageContainer = ({ title = undefined, subtitle = undefined, customHeader = undefined, children = undefined, ...props }: { title?: any; subtitle?: any; customHeader?: any; children?: any; [key: string]: any }) => {
        const header = customHeader || (
            <div className="mb-6 avoid-break">
                <OfficialHeader />
                {title && (
                    <div className={`mb-4 border-l-4 ${colors.borderAccent} pl-4 py-1`}>
                        <h2 className={`text-2xl font-black uppercase tracking-tight ${colors.textTitle}`}>{title}</h2>
                        {subtitle && <p className="text-sm text-slate-600 font-bold uppercase">{subtitle}</p>}
                    </div>
                )}
            </div>
        );

        const scaleStyle = contentScale !== 100 ? {
            transform: `scale(${contentScale / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / contentScale}%`,
        } : {};

        // Se√ß√£o de Assinaturas din√¢micas
        const SignatureSection = () => {
            if (!includeSignatures) return null;
            return (
                <div className="mt-12 avoid-break pt-8 flex justify-around gap-6 text-center w-full relative z-10 border-t border-slate-200">
                    <div className="flex flex-col items-center max-w-[250px] flex-1">
                        <div className="w-48 border-b-2 border-slate-400 mb-2 h-6"></div>
                        <p className="text-xs font-black uppercase text-slate-800 tracking-tight leading-tight">{customSignatureName1 || data.igreja?.pastor || "Pastor Presidente"}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{customSignatureTitle1 || "Assinatura do Pastor"}</p>
                    </div>
                    <div className="flex flex-col items-center max-w-[250px] flex-1">
                        <div className="w-48 border-b-2 border-slate-400 mb-2 h-6"></div>
                        <p className="text-xs font-black uppercase text-slate-800 tracking-tight leading-tight">{customSignatureName2 || data.igreja?.tesoureiro1 || "Tesouaria Coordenadora"}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{customSignatureTitle2 || "Assinatura Respons√°vel"}</p>
                    </div>
                </div>
            );
        };

        return (
            <div className="w-full bg-white mx-auto print-block relative text-slate-900" style={{ width: '100%', boxSizing: 'border-box', ...selectedMargin }}>
                {showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none z-0" style={{ transform: 'rotate(-25deg)' }}>
                        {data.igreja?.logo ? (
                            <img src={data.igreja.logo} className="w-[380px] h-[380px] object-contain" alt="Watermark Logo" />
                        ) : (
                            <span className="font-serif font-black text-6xl tracking-widest text-slate-950 uppercase">{data.igreja?.nome || "GIPP SYSTEM"}</span>
                        )}
                    </div>
                )}
                <table className="w-full border-collapse relative z-10">
                    <thead className="table-header-group">
                        <tr>
                            <td className="pb-4">
                                <div style={scaleStyle}>
                                    {header}
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="align-top">
                                <div className="w-full flex flex-col gap-2 relative z-10" style={scaleStyle}>
                                     {children}
                                     <SignatureSection />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const Table = ({ headers, children }) => (
        <div className="w-full mb-8">
            <table className="w-full text-sm border-collapse border border-slate-300">
                <thead className={`${colors.bgTableHead} border-b-2 ${colors.borderTableHead}`}>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className={`p-3 uppercase text-[10px] font-black text-slate-700 tracking-wider border-r border-slate-300 last:border-r-0 ${h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'}`}>
                                {h.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                    {children}
                </tbody>
            </table>
        </div>
    );

    // --- RECIBO PROFISSIONAL ---
    if (mode === 'recibo') {
        const item = data.item;
        const isEntrada = item.tipo === 'entrada';
        const isSaida = item.tipo === 'saida';
        const isCarne = item.parcelas !== undefined;

        let titulo = "RECIBO";
        let valorStr = "0,00";
        let texto = "";
        let assinador = "";
        let dataRecibo = "";

        if (isEntrada) {
            valorStr = parseFloat(item.valor).toFixed(2);
            texto = `Recebemos de ${item.membro_nome || 'CONTRIBUINTE N√ÉO IDENTIFICADO'}, a import√¢ncia supra de R$ ${valorStr} referente a ${item.descricao || item.categoria}.`;
            assinador = data.igreja?.tesoureiro1 || data.igreja?.pastor || "Tesouraria";
            dataRecibo = item.data_competencia || item.data_pagamento || getTodayDate();
        } else if (isSaida) {
            titulo = "RECIBO DE PAGAMENTO";
            valorStr = parseFloat(item.valor).toFixed(2);
            let fornecedorNome = item.fornecedor_id ? (data.fornecedores?.find(f=>f.id === item.fornecedor_id)?.nome || item.fornecedor_id) : 'FORNECEDOR';
            texto = `Pagamos a ${fornecedorNome}, a import√¢ncia supra de R$ ${valorStr} referente a ${item.descricao}.`;
            assinador = fornecedorNome; // O recebedor assina
            dataRecibo = item.data_vencimento || item.data_pagamento || getTodayDate();
        } else if (isCarne) {
            let totalPago = (item.parcelas||[]).filter(p=>p.status==='pago').reduce((a,curr)=>a+(parseFloat(curr.valor)||0), 0);
            valorStr = totalPago.toFixed(2);
            let membroNome = data.membros?.find(m=>m.id === item.membro_id)?.nome || 'CONTRIBUINTE';
            texto = `Recebemos de ${membroNome}, a import√¢ncia supra de R$ ${valorStr} referente ao pagamento parcial/total do carn√™: ${item.titulo}.`;
            assinador = data.igreja?.tesoureiro1 || data.igreja?.pastor || "Tesouraria";
            dataRecibo = getTodayDate();
        }

        return (
            <div className="w-full h-full flex items-center justify-center bg-white relative overflow-hidden" style={selectedMargin}>
                <div className="w-[210mm] h-[148mm] bg-white p-8 flex flex-col border-2 border-slate-200 shrink-0">
                    <div className="border-4 border-double border-slate-800 p-8 h-full flex flex-col relative">
                        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-8">
                            <div className="flex gap-4 items-center">
                                 {data.igreja?.logo && <img src={data.igreja.logo} className="w-16 h-16 object-contain"/>}
                                 <div>
                                     <h2 className="font-serif text-2xl font-black uppercase tracking-widest text-slate-900">{data.igreja?.nome}</h2>
                                     <p className="text-xs text-slate-600 font-bold">CNPJ: {data.igreja?.cnpj}</p>
                                 </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-black uppercase text-slate-300 tracking-widest">{titulo}</h1>
                                <div className="mt-2 bg-slate-100 border-2 border-slate-800 px-4 py-2 inline-block">
                                    <span className="text-xl font-black text-slate-800">R$ {valorStr}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center mb-8">
                            <p className="text-lg text-slate-800 leading-loose text-justify font-medium indent-12">
                                {texto}
                            </p>
                            <p className="text-lg text-slate-800 leading-loose mt-4">
                                Para maior clareza, firmamos o presente recibo.
                            </p>
                        </div>

                        <div className="mt-auto flex flex-col items-center pb-4">
                            <p className="text-sm font-bold text-slate-600 mb-12">{data.igreja?.cidade || 'Cidade'}, {new Date(dataRecibo).toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'})}</p>
                            <div className="w-96 border-b-2 border-slate-800 mb-2"></div>
                            <p className="text-sm font-black uppercase text-slate-800">{assinador}</p>
                            <p className="text-xs text-slate-500 uppercase">{isSaida ? 'Assinatura do Recebedor' : 'Emissor'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- NOVOS CERTIFICADOS OFICIAIS (A4 PAISAGEM - ALTO PADR√ÉO) ---
    if (mode.startsWith('cert_')) {
        const hojeExtenso = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Margens padr√£o exigidas que se adaptam conforme o painel se alterado, mantendo o padr√£o ABNT (Superior: 30mm, Esquerda: 30mm, Inferior: 20mm, Direita: 20mm)
        const certificateMargin = {
            ...selectedMargin,
            boxSizing: 'border-box' as const
        };

        const isLandscape = orientation === 'landscape';
        const cardWidth = isLandscape ? 1123 : 794;
        const cardHeight = isLandscape ? 794 : 1123;
        const scale = contentScale / 100;

        const scaledContainerStyle = contentScale !== 100 ? {
            width: `${cardWidth * scale}px`,
            height: `${cardHeight * scale}px`,
            overflow: 'hidden' as const,
            position: 'relative' as const
        } : {
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            position: 'relative' as const
        };

        const cardStyle = {
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            ...certificateMargin,
            transform: contentScale !== 100 ? `scale(${scale})` : 'none',
            transformOrigin: 'top left',
            position: 'absolute' as const,
            top: 0,
            left: 0,
        };

        const CertificatePage = ({ className = '', style = {}, children }) => (
            <div style={scaledContainerStyle}>
                <div 
                    className={`relative overflow-hidden ${className}`} 
                    style={{
                        ...cardStyle,
                        ...style
                    }}
                >
                    {children}
                </div>
            </div>
        );

        const Seal = ({ color }) => (
            <div className={`absolute bottom-8 left-8 w-28 h-28 rounded-full border-8 border-double flex items-center justify-center shadow-lg opacity-90`} style={{ borderColor: color }}>
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-center`} style={{ backgroundColor: color }}>
                    <Stamp size={28} className="text-white mb-0.5"/>
                    <span className="text-[5px] font-black text-white uppercase tracking-[0.2em] leading-tight">Selo<br/>Oficial</span>
                </div>
            </div>
        );

        const Assinaturas = ({ showQR = true }: { showQR?: boolean }) => {
            const hash = data.extra?.docHash || (data.membro?.id ? `GIPP-${data.membro.id.substring(0,6).toUpperCase()}-${new Date().getFullYear()}` : `GIPP-DOC-${Math.random().toString(36).substring(2,8).toUpperCase()}`);
            const validUrl = `https://gipp.app/validar?doc=${hash}&org=${encodeURIComponent(data.igreja?.nome || 'GIPP')}`;

            return (
                <div className="mt-auto w-full flex justify-between items-end px-8 pt-4 gap-6 relative z-20">
                    <div className="text-center flex-1">
                        <div className="border-b border-black mb-1 mx-auto w-full"></div>
                        <p className="text-xs font-bold uppercase text-slate-900">{data.igreja?.pastor || "Pastor Presidente"}</p>
                        <p className="text-[9px] text-slate-600 font-serif uppercase tracking-widest">Pastor Presidente</p>
                    </div>

                    {showQR && (
                        <div className="flex flex-col items-center bg-white/95 p-1 rounded-lg border border-slate-300 shadow-2xs shrink-0">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(validUrl)}&color=0f172a&bgcolor=ffffff`}
                                alt="QR Code Autenticidade"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-[5px] font-mono font-black text-slate-700 mt-0.5 tracking-tighter">C√ìD. {hash}</span>
                            <span className="text-[5px] font-black text-emerald-700 uppercase tracking-widest leading-none">AUTENTICIDADE</span>
                        </div>
                    )}

                    <div className="text-center flex-1">
                        <div className="border-b border-black mb-1 mx-auto w-full"></div>
                        <p className="text-xs font-bold uppercase text-slate-900">{data.igreja?.secretario1 || "Secret√°rio(a) Geral"}</p>
                        <p className="text-[9px] text-slate-600 font-serif uppercase tracking-widest">Secretaria Eclesi√°stica</p>
                    </div>
                </div>
            );
        };

        const Watermark = () => (
            data.igreja?.logo ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
                    <img src={data.igreja.logo} className="w-[100mm] h-[100mm] object-contain grayscale"/>
                </div>
            ) : null
        );

        if (mode === 'cert_batismo') {
            return (
                <CertificatePage className="bg-white">
                    <div className="w-full h-full border-[12px] border-double border-blue-900 p-2 relative flex flex-col justify-between">
                        <div className="w-full h-full border-[4px] border-blue-800/30 p-8 flex flex-col items-center justify-between text-center relative z-10 bg-slate-50/50">
                            <Watermark />
                            <div className="flex flex-col items-center">
                                <h1 className="font-classic text-2xl font-bold uppercase text-blue-950 tracking-[0.3em] mb-1">{data.igreja?.nome}</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-700">Certifica√ß√£o Oficial Eclesi√°stica</p>
                            </div>
                            
                            <h2 className="font-script text-[4.5rem] text-blue-900 leading-none drop-shadow-sm my-2">Certificado de Batismo</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-800 max-w-3xl text-justify indent-12 my-2 z-10">
                                Certificamos para os devidos fins espirituais e eclesi√°sticos que <strong className="uppercase text-blue-950">{data.membro?.nome || 'NOME DO MEMBRO'}</strong>, tendo confessado publicamente a sua f√© em Jesus Cristo como seu √∫nico e suficiente Salvador, desceu √†s √°guas batismais nesta congrega√ß√£o em cumprimento √† grande comiss√£o (Mateus 28:19).
                            </p>
                            
                            <p className="text-slate-700 font-classic text-sm uppercase tracking-widest my-2 z-10">
                                {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                            </p>
                            <Seal color="#1e3a8a" />
                            <Assinaturas />
                        </div>
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_consagracao') {
            return (
                <CertificatePage className="bg-[#faf8f5]">
                    <div className="w-full h-full border-[16px] border-solid border-rose-900 outline outline-4 outline-offset-4 outline-rose-800 p-6 flex flex-col justify-between text-center relative z-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                        <Watermark />
                        <div className="w-full flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-4 border-b border-rose-900/20 pb-2 w-full max-w-2xl">
                                {data.igreja?.logo && <img src={data.igreja.logo} className="w-12 h-12 object-contain"/>}
                                <div>
                                    <h1 className="font-classic text-xl font-black uppercase text-rose-950 tracking-[0.2em] mb-0.5">{data.igreja?.nome}</h1>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-rose-800">Gabinete Pastoral e Minist√©rio</p>
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="font-classic text-3xl text-rose-900 font-black tracking-widest uppercase my-2 z-10">Credencial de Consagra√ß√£o</h2>
                        
                        <p className="font-serif text-lg leading-relaxed text-slate-900 max-w-3xl text-justify indent-12 my-2 z-10">
                            O Minist√©rio desta Igreja, sob a dire√ß√£o do Esp√≠rito Santo, atesta e confere o presente documento declarando que <strong className="uppercase">{data.membro?.nome || 'NOME DO MEMBRO'}</strong> foi examinado(a), aprovado(a) e, nesta data solene, mediante a imposi√ß√£o de m√£os, separado(a) para o Santo Minist√©rio no of√≠cio de <strong className="uppercase text-rose-800 border-b-2 border-rose-800">{data.extra?.cargo || 'OBREIRO(A)'}</strong>.
                        </p>
                        
                        <p className="text-rose-900 font-classic text-xs font-bold uppercase tracking-widest my-1 z-10">
                            {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                        </p>
                        <Seal color="#881337" />
                        <Assinaturas />
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_crianca') {
            return (
                <CertificatePage className="bg-white">
                    <div className="w-full h-full border-[6px] border-solid border-amber-400 rounded-[3rem] p-3 flex flex-col justify-between">
                        <div className="w-full h-full border-[2px] border-dashed border-amber-600/50 rounded-[2.5rem] p-6 flex flex-col items-center justify-between text-center relative z-10 bg-amber-50/10">
                            <Watermark />
                            <div className="flex flex-col items-center">
                                <Baby size={32} className="text-amber-500 mb-1 opacity-80"/>
                                <h1 className="font-serif text-xl font-bold uppercase text-amber-900 tracking-widest mb-1">{data.igreja?.nome}</h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">Consagra√ß√£o Infantil</p>
                            </div>
                            
                            <h2 className="font-script text-[4rem] text-amber-700 leading-none my-1">Apresenta√ß√£o ao Senhor</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-700 max-w-3xl text-center z-10">
                                Certificamos com j√∫bilo que a crian√ßa <strong className="uppercase text-amber-900">{data.extra?.nome_crianca || 'NOME DA CRIAN√áA'}</strong>{data.extra?.data_nasc && <span>, nascida em {formatDateLocal(data.extra.data_nasc)}</span>}, filha de <strong className="uppercase text-slate-900">{data.extra?.nome_pai || 'NOME DO PAI'}</strong> e <strong className="uppercase text-slate-900">{data.extra?.nome_mae || 'NOME DA M√ÉE'}</strong>, foi trazida ao templo sagrado e apresentada a Deus conforme o rito b√≠blico, rogando aos c√©us a sua prote√ß√£o e gra√ßa divina.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Deixai vir a mim os pequeninos, porque dos tais √© o Reino dos C√©us." (Mc 10:14)
                            </p>
                            
                            <div className="w-full max-w-lg mx-auto border-t border-slate-800 pt-1 relative z-20">
                                <p className="text-sm font-bold uppercase text-slate-900">{data.igreja?.pastor || "Pastor Presidente"}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.</p>
                            </div>
                        </div>
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_casamento') {
            return (
                <CertificatePage className="bg-white">
                    <div className="w-full h-full border-[12px] border-double border-slate-200 flex relative z-10">
                        <div className="w-[30px] h-full bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 shrink-0 border-r-4 border-slate-400"></div>
                        <div className="flex-1 h-full p-6 flex flex-col items-center justify-between text-center relative z-10 bg-[url('https://www.transparenttextures.com/patterns/floral-paper.png')]">
                            <Watermark />
                            <h1 className="font-classic text-lg font-bold uppercase text-slate-500 tracking-[0.4em]">{data.igreja?.nome}</h1>
                            <h2 className="font-script text-[4rem] text-slate-800 leading-none my-1 border-b border-slate-200 w-full pb-1">Enlace Matrimonial</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-700 max-w-3xl text-justify indent-12 my-1 z-10">
                                √â com honra e b√™n√ß√£o eclesi√°stica que certificamos que <strong className="uppercase text-slate-900 font-black">{data.extra?.nome_noivo || 'NOME DO NOIVO'}</strong> e <strong className="uppercase text-slate-900 font-black">{data.extra?.nome_noiva || 'NOME DA NOIVA'}</strong>, compareceram perante o altar sagrado e uniram-se pelos indissol√∫veis la√ßos do santo matrim√¥nio. Que o amor de Cristo seja o cord√£o de tr√™s dobras que sustenta este lar.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Assim n√£o s√£o mais dois, mas uma s√≥ carne. Portanto, o que Deus ajuntou n√£o o separe o homem." (Mt 19:6)
                            </p>
                            
                            <p className="text-slate-800 font-classic text-xs uppercase tracking-widest my-1 z-10">
                                {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                            </p>
                            <Seal color="#475569" />
                            <Assinaturas />
                        </div>
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_curso') {
            return (
                <CertificatePage className="bg-slate-50">
                    <div className="w-full h-full border-[10px] border-indigo-900 p-1 relative shadow-inner flex flex-col justify-between">
                        <div className="w-full h-full border-[2px] border-indigo-800 p-8 flex flex-col items-center justify-between text-center relative z-10 bg-white">
                            <Watermark />
                            <div className="absolute top-6 left-6 w-16 h-16 border-2 border-indigo-900 rounded-full flex items-center justify-center opacity-70">
                                <BookOpen size={28} className="text-indigo-900"/>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <h1 className="font-classic text-2xl font-black uppercase text-indigo-900 tracking-[0.2em] mb-1">{data.igreja?.nome}</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Departamento de Ensino Teol√≥gico</p>
                            </div>
                            
                            <h2 className="font-classic text-3xl text-indigo-800 font-black tracking-widest uppercase border-y-4 border-indigo-100 py-1.5 w-full my-2">Diploma de Conclus√£o</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-800 max-w-3xl text-justify indent-12 my-2 z-10">
                                Conferimos o presente certificado a <strong className="uppercase text-indigo-900 font-black">{data.membro?.nome || 'NOME DO ALUNO'}</strong>, em virtude de ter cumprido todos os requisitos curriculares e conclu√≠do com pleno aproveitamento o <strong className="uppercase">{data.extra?.curso || data.extra?.nome_curso || 'CURSO DE TEOLOGIA'}</strong>, estando apto(a) a aplicar os conhecimentos adquiridos na obra do Mestre.
                            </p>
                            
                            <p className="text-indigo-900 font-classic text-xs font-bold uppercase tracking-widest my-1 z-10">
                                Registado em: {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                            </p>
                            <Assinaturas />
                        </div>
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_evento') {
            return (
                <CertificatePage className="bg-white">
                    <div className="w-full h-full border-[12px] border-double border-slate-100 flex relative z-10">
                        <div className="w-[15px] h-full bg-emerald-850 shrink-0"></div>
                        <div className="w-[5px] h-full bg-emerald-600 shrink-0"></div>
                        <div className="flex-1 h-full p-8 flex flex-col items-center justify-between text-center relative z-10">
                            <Watermark />
                            <div className="flex flex-col items-center">
                                <h1 className="font-classic text-2xl font-bold uppercase text-emerald-900 tracking-[0.3em] mb-1">{data.igreja?.nome}</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Secretaria de Eventos</p>
                            </div>
                            
                            <h2 className="font-script text-[4rem] text-emerald-700 leading-none my-1">Certificado de Participa√ß√£o</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-700 max-w-3xl text-justify indent-12 my-2 z-10">
                                Certificamos que <strong className="uppercase text-emerald-900">{data.membro?.nome || 'NOME DO PARTICIPANTE'}</strong>, participou ativamente do evento <strong className="uppercase border-b border-emerald-500">{data.extra?.evento || 'CONGRESSO OFICIAL'}</strong>, realizado nas depend√™ncias desta institui√ß√£o, demonstrando dedica√ß√£o, comunh√£o e interesse no crescimento espiritual do Corpo de Cristo.
                            </p>
                            
                            <p className="text-emerald-900 font-classic text-xs uppercase tracking-widest my-1 z-10">
                                {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                            </p>
                            <Seal color="#047857" />
                            <Assinaturas />
                        </div>
                    </div>
                </CertificatePage>
            );
        }

        if (mode === 'cert_ebd') {
            return (
                <CertificatePage className="bg-white">
                    <div className="w-full h-full border-[8px] border-purple-900 p-1 relative flex flex-col justify-between">
                        <div className="w-full h-full border-[2px] border-dashed border-purple-800 p-8 flex flex-col items-center justify-between text-center relative z-10 bg-purple-50/20">
                            <Watermark />
                            <div className="flex flex-col items-center">
                                <GraduationCap size={32} className="text-purple-800 mb-1"/>
                                <h1 className="font-classic text-2xl font-black uppercase text-purple-900 tracking-[0.2em] mb-1">{data.igreja?.nome}</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Escola B√≠blica Dominical</p>
                            </div>
                            
                            <h2 className="font-script text-[4rem] text-purple-800 leading-none my-1">Honra ao M√©rito</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-850 max-w-3xl text-justify indent-12 my-2 z-10">
                                O Departamento de Ensino confere o presente certificado a <strong className="uppercase text-purple-900">{data.membro?.nome || 'NOME DO ALUNO'}</strong>, por ter conclu√≠do com zelo e dedica√ß√£o o ciclo de estudos da EBD, integrando a <strong className="uppercase">{data.extra?.turma || 'TURMA DE ENSINO'}</strong> sob a instru√ß√£o dedicada de seus professores.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Crescei na gra√ßa e no conhecimento de nosso Senhor e Salvador, Jesus Cristo." (2 Pe 3:18)
                            </p>
                            
                            <p className="text-purple-900 font-classic text-xs uppercase tracking-widest my-1 z-10">
                                {data.igreja?.cidade || 'Cidade'}, {hojeExtenso}.
                            </p>
                            
                            <div className="w-full flex justify-between px-10 pt-2 gap-16 relative z-20">
                                <div className="text-center flex-1">
                                    <div className="border-b border-black mb-1 mx-auto w-full"></div>
                                    <p className="text-xs font-bold uppercase text-slate-900">{data.igreja?.pastor || "Pastor Presidente"}</p>
                                </div>
                                <div className="text-center flex-1">
                                    <div className="border-b border-black mb-1 mx-auto w-full"></div>
                                    <p className="text-xs font-bold uppercase text-slate-900">{data.extra?.professor || "Superintend√™ncia EBD"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CertificatePage>
            );
        }
    }

    // --- CARN√ä IMPRESS√ÉO ORIGINAL ---
    if (mode === 'carne_print') {
        return (
            <div className="w-full bg-white" style={selectedMargin}>
                <div className="text-center mb-8 border-b-2 border-dotted border-slate-300 pb-4">
                    <h2 className="text-2xl font-bold uppercase">{data.igreja?.nome}</h2>
                    <h3 className="text-lg text-slate-600">{data.carne.titulo}</h3>
                    <p className="text-sm mt-2">Membro: <strong>{data.membro?.nome}</strong></p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {data.carne.parcelas.map((p, i) => (
                        <div key={i} className="flex border-2 border-slate-800 h-[80mm] avoid-break">
                            <div className="w-1/3 border-r-2 border-dotted border-slate-800 p-4 flex flex-col justify-between bg-slate-50">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Vencimento</p>
                                    <p className="text-sm font-bold mb-2">{formatDateLocal(p.vencimento)}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Valor</p>
                                    <p className="text-sm font-bold mb-2">R$ {parseFloat(p.valor).toFixed(2)}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-500">Parcela</p>
                                    <p className="text-sm font-bold">{p.numero}/{data.carne.parcelas.length}</p>
                                </div>
                                <div className="text-center text-[10px] text-slate-400">CONTROLE DA IGREJA</div>
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        {data.igreja?.logo && <img src={data.igreja.logo} className="h-10 w-10 object-contain"/>}
                                        <div><h4 className="font-bold uppercase text-sm">{data.igreja?.nome}</h4><p className="text-[10px] text-slate-500">Campanha: {data.carne.titulo}</p></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Vencimento</p>
                                        <p className="text-lg font-bold">{formatDateLocal(p.vencimento)}</p>
                                    </div>
                                </div>
                                <div className="border-t border-b border-slate-200 py-2 my-2">
                                    <div className="flex justify-between"><span className="text-xs font-bold uppercase text-slate-500">Pagador</span><span className="text-xs font-bold">{data.membro?.nome}</span></div>
                                    <div className="flex justify-between mt-1"><span className="text-xs font-bold uppercase text-slate-500">Valor do Documento</span><span className="text-lg font-bold">R$ {parseFloat(p.valor).toFixed(2)}</span></div>
                                </div>
                                <div className="text-center"><p className="text-[10px] text-slate-400 mb-6">Autentica√ß√£o Mec√¢nica / Assinatura do Tesoureiro</p><div className="border-b border-black w-3/4 mx-auto"></div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- CARTEIRINHA ORIGINAL ---
    if (mode === 'carteirinha') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-slate-50 print:bg-white" style={selectedMargin}>
                {/* FRENTE */}
                <div className="w-[85.6mm] h-[53.98mm] bg-slate-900 relative overflow-hidden flex shadow-2xl border border-slate-800 shrink-0 print:shadow-none print:border-none rounded-xl print:rounded-none">
                    {/* Background Art Premium */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-3xl opacity-30 -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-0 border-[3px] border-amber-500/20 m-1 rounded-lg pointer-events-none"></div>

                    {/* Left Sidebar - Photo & QR */}
                    <div className="w-[28%] h-full bg-slate-900/80 backdrop-blur-md border-r border-white/10 flex flex-col items-center justify-center p-2 relative z-10 shadow-lg">
                        <div className="w-[20mm] h-[26mm] bg-slate-200 rounded-md overflow-hidden border-2 border-amber-500 shadow-lg mb-2 relative">
                            {data.membro.foto ? <CachedImage src={data.membro.foto} cacheKey={`membro_${data.membro.id}_foto`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><User size={24} className="text-slate-400"/></div>}
                        </div>
                        <div className="w-full text-center bg-white p-0.5 rounded-sm">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.membro.id)}&color=0f172a&bgcolor=ffffff`} alt="QR Code" className="w-[12mm] h-[12mm] mx-auto object-contain"/>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 h-full flex flex-col justify-between p-3 pl-4 relative z-10">
                        {/* Header Institucional */}
                        <div className="flex items-start gap-2.5 pb-2">
                            {data.igreja.logo ? <img src={data.igreja.logo} className="h-[10mm] w-[10mm] object-contain bg-white rounded p-0.5 shadow-sm" /> : <div className="h-[10mm] w-[10mm] bg-white rounded flex items-center justify-center text-[6px] font-black text-slate-800">LOGO</div>}
                            <div className="flex-1 mt-0.5">
                                <h3 className="font-black text-white text-[11px] uppercase leading-[1.1] tracking-wider drop-shadow-md">{data.igreja.nome}</h3>
                                <p className="text-[7px] text-amber-500 font-bold tracking-[0.2em] uppercase mt-0.5">Credencial Oficial</p>
                            </div>
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 flex flex-col justify-end pb-1">
                            <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Nome do Titular</p>
                            <p className="text-[14px] font-black text-white uppercase leading-none truncate w-full mb-3 drop-shadow-md">{data.membro.nome}</p>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Fun√ß√£o Eclesi√°stica</p>
                                    <div className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded shadow-sm inline-block">
                                        <p className="text-[10px] font-black uppercase tracking-wider">{data.membro.cargo || 'Membro'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">N¬∫ Registro</p>
                                    <p className="text-[10px] font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">{data.membro.numero_registro || '000000'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VERSO */}
                <div className="w-[85.6mm] h-[53.98mm] bg-white relative overflow-hidden flex flex-col shadow-2xl border border-slate-200 shrink-0 print:shadow-none print:border-none p-3.5 rounded-xl print:rounded-none">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>

                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 content-start mt-2">
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Documento (CPF)</p>
                            <p className="text-[8px] font-bold text-slate-800">{data.membro.cpf || '---'}</p>
                        </div>
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Data Nasc.</p>
                            <p className="text-[8px] font-bold text-slate-800">{formatDateLocal(data.membro.data_nascimento)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Filia√ß√£o</p>
                            <p className="text-[7px] font-bold text-slate-800 truncate uppercase">{data.membro.nome_pai || '---'} <br/> {data.membro.nome_mae || '---'}</p>
                        </div>
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Data Batismo</p>
                            <p className="text-[8px] font-bold text-slate-800">{formatDateLocal(data.membro.data_batismo)}</p>
                        </div>
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Data Admiss√£o</p>
                            <p className="text-[8px] font-bold text-slate-800">{formatDateLocal(data.membro.data_admissao)}</p>
                        </div>
                        <div className="col-span-2 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><MapPin size={8}/> Congrega√ß√£o / Sede</p>
                            <p className="text-[7px] font-bold text-slate-800 truncate">{data.igreja.nome} - {data.igreja.endereco}, {data.igreja.cidade}/{data.igreja.uf}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-200">
                        <div className="w-[45%] text-center">
                            <div className="border-b border-slate-800 mb-0.5 w-full"></div>
                            <p className="text-[5px] text-slate-500 uppercase font-bold tracking-widest">Assinatura do Titular</p>
                        </div>
                        <div className="w-[45%] text-center">
                            <div className="border-b border-slate-800 mb-0.5 w-full"></div>
                            <p className="text-[6px] font-bold text-slate-800 uppercase truncate">{data.igreja.pastor || 'Pastor Presidente'}</p>
                            <p className="text-[5px] text-slate-500 uppercase tracking-widest">Presidente / Dire√ß√£o</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CREDENCIAIS LOTE ORIGINAL ---
    if (mode === 'credenciais_lote') {
        return (
            <div className="w-full flex flex-wrap gap-8 justify-center print:p-0" style={selectedMargin}>
                {data.membros.map((membro, index) => (
                    <div key={index} className="flex flex-col gap-4 avoid-break mb-8">
                        {/* FRENTE */}
                        <div className="w-[85.6mm] h-[53.98mm] bg-slate-900 relative overflow-hidden flex shadow-lg border border-slate-800 shrink-0 print:shadow-none print:border-none">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600 rounded-full blur-[80px] opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                            <div className="absolute inset-0 border-[4px] border-amber-500/20 m-2 rounded-2xl pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

                            <div className="p-4 relative z-10 flex flex-col h-full w-full">
                                <div className="flex flex-col items-center text-center pb-3 border-b border-white/10 mb-3">
                                    <h3 className="font-black text-white text-xs uppercase tracking-widest drop-shadow-md leading-tight">{data.igreja?.nome || 'Minist√©rio'}</h3>
                                    <p className="text-[8px] text-amber-500 font-black tracking-[0.3em] uppercase mt-1">Credencial Oficial</p>
                                </div>
                                <div className="flex gap-4 mb-3 items-center">
                                    <div className="w-16 h-20 bg-slate-800 rounded-lg overflow-hidden border border-amber-500 shadow-md shrink-0">
                                        {membro.foto ? <CachedImage src={membro.foto} cacheKey={`membro_${membro.id}_foto`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={24}/></div>}
                                    </div>
                                    <div className="flex-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 self-center max-w-[60px]">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(membro.id)}&color=0f172a&bgcolor=ffffff`} alt="QR Code" className="w-full aspect-square object-contain"/>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Titular</p>
                                    <p className="text-sm font-black text-white uppercase leading-tight mb-2 drop-shadow-md truncate">{membro.nome}</p>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Fun√ß√£o</p>
                                            <p className="text-[10px] font-black text-slate-900 bg-amber-500 px-2 py-0.5 rounded shadow-sm uppercase tracking-wider inline-block">{membro.cargo || 'Membro'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Registro</p>
                                            <p className="text-[10px] font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20 inline-block">{membro.numero_registro || '000000'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* VERSO */}
                        <div className="w-[85.6mm] h-[53.98mm] bg-white relative overflow-hidden flex flex-col shadow-lg border border-slate-200 shrink-0 print:shadow-none print:border-none p-3">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
                            <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1 content-start mt-1">
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">CPF</p><p className="text-[8px] font-bold text-slate-800">{membro.cpf || '---'}</p></div>
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">Data Nasc.</p><p className="text-[8px] font-bold text-slate-800">{formatDateLocal(membro.data_nascimento)}</p></div>
                                <div className="col-span-2"><p className="text-[6px] font-black text-slate-400 uppercase">Filia√ß√£o</p><p className="text-[7px] font-bold text-slate-800 truncate uppercase">{membro.nome_pai || '---'} / {membro.nome_mae || '---'}</p></div>
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">Batismo</p><p className="text-[8px] font-bold text-slate-800">{formatDateLocal(membro.data_batismo)}</p></div>
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">Admiss√£o</p><p className="text-[8px] font-bold text-slate-800">{formatDateLocal(membro.data_admissao)}</p></div>
                                <div className="col-span-2 mt-1"><p className="text-[6px] font-black text-slate-400 uppercase">Igreja</p><p className="text-[7px] font-bold text-slate-800 truncate">{data.igreja.nome} - {data.igreja.cidade}/{data.igreja.uf}</p></div>
                            </div>
                            <div className="flex justify-between items-end mt-1 pt-1 border-t border-slate-200">
                                <div className="w-[45%] text-center"><div className="border-b border-slate-800 mb-0.5 w-full"></div><p className="text-[5px] text-slate-500 uppercase font-bold">Titular</p></div>
                                <div className="w-[45%] text-center"><div className="border-b border-slate-800 mb-0.5 w-full"></div><p className="text-[6px] font-bold text-slate-800 uppercase truncate">{data.igreja.pastor || 'Presidente'}</p><p className="text-[5px] text-slate-500 uppercase">Pastor</p></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- CARTEIRINHA CUSTOMIZADA (EST√öDIO) ---
    if (mode === 'carteirinha_custom') {
        const layout = data.igreja?.carteirinha_custom || {};
        const bg = layout.bg || '#ffffff';
        const bgImage = layout.bgImage || (bg.startsWith('http') || bg.startsWith('data:') ? bg : null);
        const fields = layout.fields || [];

        return (
            <div className="w-full flex flex-wrap gap-8 justify-center print:p-0" style={selectedMargin}>
                {data.membros.map((membro, index) => (
                    <div key={index} className="w-[85.6mm] h-[53.98mm] relative overflow-hidden flex shadow-lg border border-slate-300 shrink-0 print:shadow-none print:border-none avoid-break mb-8 bg-cover bg-center" style={{ backgroundColor: bg.startsWith('#') ? bg : 'transparent', backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {fields.map(f => {
                            if (!f.visible) return null;
                            let content = '';
                            if (f.id === 'nome') content = membro.nome;
                            if (f.id === 'cargo') {
                                const cargoBase = membro.cargo || 'Membro';
                                content = (membro.funcao_administrativa && membro.funcao_administrativa !== 'NENHUMA') 
                                    ? `${cargoBase} (${membro.funcao_administrativa})` 
                                    : cargoBase;
                            }
                            if (f.id === 'cpf') content = membro.cpf;
                            if (f.id === 'registro') content = membro.registro || membro.numero_registro || membro.id || 'N/A';
                            if (f.id === 'igreja') content = data.igreja.nome;

                            if (f.type === 'text') {
                                return (
                                    <div key={f.id} className="absolute whitespace-nowrap" style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color, fontSize: `${f.size}px`, fontWeight: f.bold ? 'bold' : 'normal', transform: 'translate(-50%, -50%)', textShadow: f.shadow ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none' }}>
                                        {content || f.label}
                                    </div>
                                );
                            } else if (f.type === 'image' && f.id === 'foto') {
                                return (
                                    <div key={f.id} className="absolute bg-slate-200 border-2 border-white shadow-sm overflow-hidden" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}mm`, height: `${f.h}mm`, transform: 'translate(-50%, -50%)' }}>
                                        {membro.foto ? <CachedImage src={membro.foto} cacheKey={`membro_${membro.id}_foto`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><User size={24} className="text-slate-400"/></div>}
                                    </div>
                                );
                            } else if (f.type === 'qr' && f.id === 'qr') {
                                return (
                                    <div key={f.id} className="absolute bg-white p-1 rounded shadow-sm" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}mm`, height: `${f.w}mm`, transform: 'translate(-50%, -50%)' }}>
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(membro.id)}&color=000000&bgcolor=ffffff`} className="w-full h-full object-contain"/>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                ))}
            </div>
        );
    }

    // --- RELATORIO DE CELULA (NOVO) ---
    if (mode === 'celula_relatorio') {
        const rel = data.relatorio;
        const cel = data.celula;
        const liderNome = data.membros?.find(m => m.id === cel?.lider1_id)?.nome || 'L√≠der';

        return (
            <PageContainer title="Relat√≥rio de C√©lula" subtitle={`C√©lula: ${cel?.nome || 'N√£o identificada'}`}>
                <div className="mb-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl avoid-break">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Data da Reuni√£o</p>
                        <p className="font-bold text-sm text-slate-800">{formatDateLocal(rel?.data)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">L√≠der da C√©lula</p>
                        <p className="font-bold text-sm text-slate-800">{liderNome}</p>
                    </div>
                </div>

                <div className="mb-8 avoid-break">
                    <h3 className="font-bold text-sm bg-slate-800 text-white p-2 uppercase tracking-widest mb-2">Lista de Presen√ßa e Participantes</h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 p-2 text-left uppercase">Tipo</th>
                                <th className="border border-slate-300 p-2 text-left uppercase">Nome do Participante</th>
                                <th className="border border-slate-300 p-2 text-left uppercase">Fun√ß√£o/Cargo</th>
                                <th className="border border-slate-300 p-2 text-center uppercase">Frequ√™ncia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(cel?.membros || []).map((m, i) => {
                                let nome = '';
                                let cargo = m.funcao || '';
                                if (m.tipo === 'visitante') {
                                    nome = data.visitantes?.find(v => v.id === m.integrante_id)?.nome || 'Visitante';
                                } else {
                                    nome = data.membros?.find(mem => mem.id === m.integrante_id)?.nome || 'Membro';
                                }
                                const isPresente = rel?.presencas ? rel.presencas[m.integrante_id] : true; // Por padr√£o assume presente se n√£o houver marca√ß√£o salva
                                return (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="border border-slate-300 p-2 uppercase font-bold text-slate-500">{m.tipo}</td>
                                        <td className="border border-slate-300 p-2 font-bold text-slate-800">{nome}</td>
                                        <td className="border border-slate-300 p-2">{cargo}</td>
                                        <td className="border border-slate-300 p-2 text-center">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isPresente ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {isPresente ? 'Presente' : 'Ausente'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!cel?.membros || cel.membros.length === 0) && (
                                <tr><td colSpan="4" className="p-4 text-center italic text-slate-500">Nenhum participante registrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-sm bg-slate-800 text-white p-2 uppercase tracking-widest mb-2">Relat√≥rio Detalhado</h3>
                    <div className="p-4 border border-slate-300 min-h-[200px] text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {rel?.relatorio}
                    </div>
                </div>

                <div className="mt-16 pt-8 flex justify-between gap-10 px-10 avoid-break">
                    <div className="flex-1 text-center">
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold uppercase text-sm tracking-wider">{liderNome}</p>
                        <p className="text-xs font-serif text-slate-600">L√≠der da C√©lula</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold uppercase text-sm tracking-wider">{data.igreja?.pastor || 'Pastor Presidente'}</p>
                        <p className="text-xs font-serif text-slate-600">Pastor Presidente</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // --- NOVO: TEMPLATE DE ESCALA INDIVIDUAL DO MEMBRO ---
    if (mode === 'membro_escala_print') {
        const { membro, tarefas } = data;
        
        const minhasTarefas = (tarefas || []).filter(t => 
            (t.equipe || []).some(m => m.id === membro.id || m.nome === membro.nome)
        ).sort((a, b) => new Date(a.data || '9999-12-31').getTime() - new Date(b.data || '9999-12-31').getTime());

        const confirmadasCount = minhasTarefas.filter(t => {
            const mInfo = (t.equipe || []).find(m => m.id === membro.id || m.nome === membro.nome);
            return mInfo?.status_presenca === 'confirmado';
        }).length;

        const pendentesCount = minhasTarefas.filter(t => {
            const mInfo = (t.equipe || []).find(m => m.id === membro.id || m.nome === membro.nome);
            return !mInfo?.status_presenca || mInfo.status_presenca === 'pendente';
        }).length;

        const recusadasCount = minhasTarefas.filter(t => {
            const mInfo = (t.equipe || []).find(m => m.id === membro.id || m.nome === membro.nome);
            return mInfo?.status_presenca === 'recusado';
        }).length;

        return (
            <PageContainer title="Escala de Compromissos e Tarefas" subtitle={`${membro.nome} (${membro.cargo || 'Membro'})`}>
                <div className="border border-slate-200 p-8 rounded-[2rem] bg-slate-50/30 mb-8 avoid-break">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100"><UserCircle size={32}/></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{membro.nome}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{membro.cargo} {membro.funcao_administrativa && membro.funcao_administrativa !== 'NENHUMA' ? `‚Ä¢ ${membro.funcao_administrativa}` : ''}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Membro ID: {membro.id?.slice(0, 8) || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-center scale-95">
                                <span className="block text-2xl font-black text-blue-600">{minhasTarefas.length}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compromissos</span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-center scale-95 border-l-4 border-l-emerald-500">
                                <span className="block text-2xl font-black text-emerald-600">{confirmadasCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Confirmados</span>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm bg-slate-800 text-white p-3 uppercase tracking-widest mb-2 flex items-center gap-2 rounded-t-lg">
                        <ClipboardList size={16}/> Agenda de Servi√ßos Escalados
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100 border-b-2 border-slate-400">
                            <tr>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300 w-1/4">Data / Hora</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Compromisso / Categoria</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Fun√ß√£o Atribu√≠da</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-center">Status Confirma√ß√£o</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {minhasTarefas.map((t, i) => {
                                const mInfo = (t.equipe || []).find(m => m.id === membro.id || m.nome === membro.nome);
                                const funAtribuida = mInfo?.funcao_escala || 'Membro';
                                const rsvp = mInfo?.status_presenca;

                                return (
                                    <tr key={i} className="hover:bg-slate-50 avoid-break">
                                        <td className="p-3 border-r border-slate-200 text-slate-800">
                                            <span className="font-bold block">{t.data ? formatDateLocal(t.data) : 'Sem data'}</span>
                                            {t.hora && <span className="text-[10px] text-slate-400 font-semibold block">{t.hora}h</span>}
                                        </td>
                                        <td className="p-3 border-r border-slate-200">
                                            <span className="font-bold text-slate-800 block text-xs">{t.descricao}</span>
                                            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{t.categoria || 'Geral'}</span>
                                        </td>
                                        <td className="p-3 border-r border-slate-200 font-semibold text-slate-600 uppercase text-[11px]">{funAtribuida}</td>
                                        <td className="p-3 text-center">
                                            {rsvp === 'confirmado' && <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1"><CheckCircle size={11}/> CONFIRMADO</span>}
                                            {rsvp === 'recusado' && <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1"><Ban size={11}/> RECUSADO</span>}
                                            {(!rsvp || rsvp === 'pendente') && <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1"><Clock size={11}/> PENDENTE</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {minhasTarefas.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center italic text-slate-500 font-medium">Nenhum compromisso ou escala agendada para este membro.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-2">
                        <span>Gerado via GIPP - Secretaria Oficial</span>
                        <span>Assinatura do Membro: ___________________________</span>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // --- NOVO: RELAT√ìRIO DE TAREFA / ESCALA COM ACOMPANHAMENTO DE PRESEN√áAS ---
    if (mode === 'rel_tarefa_escala') {
        const { equipe, descricao, categoria, data: taskDate, status } = data;
        const confirmados = (equipe || []).filter(m => m.status_presenca === 'confirmado');
        const recusados = (equipe || []).filter(m => m.status_presenca === 'recusado');
        const pendentes = (equipe || []).filter(m => !m.status_presenca || m.status_presenca === 'pendente');

        return (
            <PageContainer title="Relat√≥rio de Escala Oficial" subtitle={categoria || 'Tarefa Administrativa'}>
                <div className="border-4 border-slate-100 p-8 rounded-[2rem] bg-slate-50/30 mb-8 avoid-break">
                    <div className="flex justify-between items-start mb-6 border-b-2 border-slate-200 pb-6">
                        <div>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">{categoria || 'Geral'}</span>
                            <h2 className="text-3xl font-black text-slate-800 mt-3 leading-tight">{descricao}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Data Agendada</p>
                            <p className="text-xl font-black text-slate-800">{taskDate ? formatDateLocal(taskDate) : 'Sem data'}</p>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-2 inline-block border ${status === 'Concluido' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{status}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm flex flex-col items-center">
                            <h4 className="text-3xl font-black text-emerald-600 mb-1">{confirmados.length}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12}/> Confirmados</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm flex flex-col items-center">
                            <h4 className="text-3xl font-black text-amber-500 mb-1">{pendentes.length}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Pendentes</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-l-4 border-rose-500 shadow-sm flex flex-col items-center relative overflow-hidden">
                            {recusados.length > 0 && <div className="absolute top-0 right-0 bg-rose-500 w-8 h-8 rounded-bl-full animate-pulse"></div>}
                            <h4 className="text-3xl font-black text-rose-600 mb-1">{recusados.length}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Ban size={12}/> Ausentes (Baixas)</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm bg-slate-800 text-white p-3 uppercase tracking-widest mb-2 flex items-center gap-2 rounded-t-lg">
                        <Users size={16}/> Membros Escalados
                    </h3>
                    <table className="w-full text-sm border-collapse border border-slate-300">
                        <thead className="bg-slate-100 border-b-2 border-slate-400">
                            <tr>
                                <th className="p-3 uppercase text-[10px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300 w-1/2">Nome do Colaborador</th>
                                <th className="p-3 uppercase text-[10px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Fun√ß√£o Atribu√≠da</th>
                                <th className="p-3 uppercase text-[10px] font-black text-slate-700 tracking-wider text-center">Status / RSVP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {(equipe || []).map((m, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className={`p-4 border-r border-slate-200 font-bold uppercase text-xs ${m.status_presenca === 'recusado' ? 'text-rose-500 line-through opacity-70' : 'text-slate-800'}`}>{m.nome}</td>
                                    <td className="p-4 border-r border-slate-200 text-slate-600 font-medium text-xs">{m.funcao_escala}</td>
                                    <td className="p-4 text-center">
                                        {m.status_presenca === 'confirmado' && <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm"><CheckCircle size={14}/> Confirmou</span>}
                                        {m.status_presenca === 'recusado' && <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm"><Ban size={14}/> N√£o Estar√°</span>}
                                        {(!m.status_presenca || m.status_presenca === 'pendente') && <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm"><Clock size={14}/> Aguardando</span>}
                                    </td>
                                </tr>
                            ))}
                            {(!equipe || equipe.length === 0) && (
                                <tr><td colSpan="3" className="p-6 text-center italic text-slate-500 font-medium">Nenhum membro escalado nesta tarefa ou evento.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="mt-10 pt-4 border-t-2 border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>Documento Oficial de Secretaria</span>
                        <span>Emitido em: {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // --- RELATORIO EVENTO √öNICO ORIGINAL ---
    if (mode === 'rel_evento_unico') {
        return (
            <PageContainer hideHeader={true} customHeader={<OfficialHeader />}>
                <div className="border-4 border-slate-100 p-8 rounded-[2rem] bg-slate-50/30">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{data.tipo}</span>
                            <h2 className="text-4xl font-black text-slate-800 mt-2">{data.titulo}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Data / Hor√°rio</p>
                            <p className="text-xl font-black text-slate-800">{formatDateLocal(data.data)} - {data.hora}h</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={14}/> Localiza√ß√£o</h4>
                            <p className="text-lg font-bold text-slate-700">{data.local || 'Templo Sede'}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Target size={14}/> Objetivo / Categoria</h4>
                            <p className="text-lg font-bold text-slate-700">{data.tipo}</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[200px]">
                        <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Users size={14}/> Equipe Escalada</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {(data.equipe || []).map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{m.nome.charAt(0)}</div>
                                    <div><p className="text-sm font-bold">{m.nome}</p><p className="text-[10px] text-indigo-500 uppercase font-black">{m.funcao_escala}</p></div>
                                </div>
                            ))}
                            {(!data.equipe || data.equipe.length === 0) && <p className="text-sm text-slate-400 italic">Nenhum membro escalado nesta ficha.</p>}
                        </div>
                    </div>
                    <div className="mt-12 pt-12 border-t border-slate-200 text-center">
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.5em] mb-1">GIPP Gest√£o Eclesi√°stica Digital</p>
                        <p className="text-[10px] text-slate-300">Autenticado pelo Departamento de Secretaria</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // 1 - FLUXO DE CAIXA
    if (mode === 'rel_fluxo') {
        const { financeiro, data_inicio, data_fim, congregacao_id } = data;
        let entradas = 0, saidas = 0;
        const rows = financeiro.filter(f => {
            const d = f.data_competencia || f.data_vencimento || f.data_pagamento;
            if (!d) return true;
            if (data_inicio && d < data_inicio) return false;
            if (data_fim && d > data_fim) return false;
            if (congregacao_id && congregacao_id !== 'todas') {
                if (congregacao_id === 'sede' && f.congregacao_id && f.congregacao_id !== 'sede') return false;
                if (congregacao_id !== 'sede' && f.congregacao_id !== congregacao_id) return false;
            }
            return true;
        }).map(f => {
            const val = parseFloat(f.valor) || 0;
            if (f.tipo === 'entrada') entradas += val;
            if (f.tipo === 'saida' && f.status === 'pago') saidas += val;
            return f;
        }).sort((a,b) => new Date(a.data_competencia || a.data_vencimento || 0).getTime() - new Date(b.data_competencia || b.data_vencimento || 0).getTime());
        const saldo = entradas - saidas;
        
        let titleSuffix = 'Controle Financeiro Geral';
        if (data_inicio || data_fim) titleSuffix += ` | Per√≠odo: ${formatDateLocal(data_inicio) || 'In√≠cio'} a ${formatDateLocal(data_fim) || 'Atual'}`;

        const totalVolume = entradas + saidas;
        const entradaPct = totalVolume > 0 ? (entradas / totalVolume) * 100 : 0;
        const saidaPct = totalVolume > 0 ? (saidas / totalVolume) * 105 : 0; // slight scale for visual weight

        return (
            <PageContainer title="Relat√≥rio de Fluxo de Caixa" subtitle={titleSuffix}>
                {/* KPI Cards Bento Box style */}
                <div className="grid grid-cols-3 gap-5 mb-6 avoid-break">
                    <div className="p-4 border border-emerald-250 bg-emerald-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-3xl flex items-center justify-center text-emerald-500 font-black text-xs">E</div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Total Entradas</p>
                        <p className="text-xl font-black text-emerald-800 mt-2">R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 border border-rose-250 bg-rose-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-bl-3xl flex items-center justify-center text-rose-500 font-black text-xs">S</div>
                        <p className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Total Sa√≠das (Pagas)</p>
                        <p className="text-xl font-black text-rose-800 mt-2">R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`p-4 border rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm ${saldo >= 0 ? 'border-indigo-250 bg-indigo-50/40' : 'border-amber-250 bg-amber-50/40'}`}>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-bl-3xl flex items-center justify-center font-black text-xs">L</div>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${saldo >= 0 ? 'text-indigo-600' : 'text-amber-700'}`}>Saldo L√≠quido</p>
                        <p className={`text-xl font-black mt-2 ${saldo >= 0 ? 'text-indigo-800' : 'text-amber-805'}`}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Balan√ßo Comparativo Proporcional CSS */}
                <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl avoid-break mb-6 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                        <span>Balan√ßo Comparativo Proporcional</span>
                        <span className="text-slate-400 font-bold">Volume Total: R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full h-6 rounded-lg overflow-hidden bg-slate-200 flex border border-slate-300">
                        {entradaPct > 0 ? (
                            <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-extrabold text-white transition-all shadow-inner" style={{ width: `${(entradaPct / (entradaPct + saidaPct)) * 100}%` }}>
                                {entradaPct > 15 ? `Entradas: ${entradaPct.toFixed(1)}%` : `${entradaPct.toFixed(0)}%`}
                            </div>
                        ) : null}
                        {saidaPct > 0 ? (
                            <div className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-extrabold text-white transition-all shadow-inner" style={{ width: `${(saidaPct / (entradaPct + saidaPct)) * 100}%` }}>
                                {saidaPct > 15 ? `Sa√≠das: ${saidaPct.toFixed(1)}%` : `${saidaPct.toFixed(0)}%`}
                            </div>
                        ) : null}
                        {totalVolume === 0 ? <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">Sem transa√ß√µes registradas neste per√≠odo</div> : null}
                    </div>
                </div>

                <Table headers={[{label:'Data'}, {label:'Tipo', align:'center'}, {label:'Categoria'}, {label:'Descri√ß√£o'}, {label:'Valor', align:'right'}]}>
                    {rows.map((r, i) => (
                        <tr key={i} className={`avoid-break ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                            <td className="p-3 border-r border-slate-250 font-mono text-xs text-slate-600">{formatDateLocal(r.data_competencia || r.data_vencimento)}</td>
                            <td className="p-3 border-r border-slate-250 text-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${r.tipo === 'entrada' ? 'bg-emerald-105 text-emerald-800 border border-emerald-250' : 'bg-rose-105 text-rose-800 border border-rose-250'}`}>
                                    {r.tipo === 'entrada' ? 'Entrada' : 'Sa√≠da'}
                                </span>
                            </td>
                            <td className="p-3 border-r border-slate-250 text-xs font-bold text-slate-600 uppercase">{r.categoria || '-'}</td>
                            <td className="p-3 border-r border-slate-250 text-xs text-slate-700">{r.descricao}</td>
                            <td className={`p-3 text-right font-mono font-bold text-sm ${r.tipo === 'entrada' ? 'text-emerald-705' : 'text-slate-800'}`}>
                                {r.tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(r.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-6 text-center italic text-slate-500 font-semibold">Nenhum registro para este per√≠odo.</td>
                        </tr>
                    )}
                </Table>
            </PageContainer>
        );
    }

    if (mode === 'rel_auditoria_financeira') {
        const { financeiro } = data;
        const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        let totalEdicoes = 0;
        financeiro.forEach((f: any) => {
            if (f.historico && Array.isArray(f.historico)) {
                totalEdicoes += f.historico.length;
            }
        });

        return (
            <PageContainer 
                title="Relat√≥rio de Auditoria Financeira" 
                subtitle={`Hist√≥rico de Altera√ß√µes de Lan√ßamentos ‚Ä¢ M√™s de ${currentMonthName}`}
            >
                {/* Resumo executivo da auditoria */}
                <div className="grid grid-cols-3 gap-5 mb-6 avoid-break">
                    <div className="p-4 border border-indigo-250 bg-indigo-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Lan√ßamentos no M√™s</p>
                        <p className="text-xl font-black text-indigo-805 mt-2">{financeiro.length}</p>
                    </div>
                    <div className="p-4 border border-amber-250 bg-amber-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Lan√ßamentos Alterados</p>
                        <p className="text-xl font-black text-amber-805 mt-2">
                            {financeiro.filter((f: any) => f.historico && Array.isArray(f.historico) && f.historico.length > 0).length}
                        </p>
                    </div>
                    <div className="p-4 border border-slate-250 bg-slate-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-wider font-extrabold">Total de Edi√ß√µes Registradas</p>
                        <p className="text-xl font-black text-slate-805 mt-2">{totalEdicoes}</p>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    {financeiro.map((item: any, idx: number) => {
                        const dateStr = formatDateLocal(item.data_competencia || item.data_vencimento || item.data_pagamento || item.created_at);
                        const hasHistory = item.historico && Array.isArray(item.historico) && item.historico.length > 0;
                        
                        return (
                            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm avoid-break">
                                {/* Cabe√ßalho do Lan√ßamento */}
                                <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${item.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 'bg-rose-100 text-rose-800 border border-rose-250'}`}>
                                                {item.tipo === 'entrada' ? 'Entrada' : 'Sa√≠da'}
                                            </span>
                                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.descricao}</h4>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">
                                            Data: {dateStr} | Cat: {item.categoria || '-'} {item.forma_pagamento ? `| Pag: ${item.forma_pagamento}` : ''}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-black ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            R$ {parseFloat(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                            Status: <span className={item.status === 'pago' ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>{item.status || 'pendente'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Linha do Hist√≥rico */}
                                <div className="p-4 bg-white">
                                    {hasHistory ? (
                                        <div className="relative pl-4 border-l-2 border-indigo-200 space-y-3">
                                            {item.historico.map((log: any, logIdx: number) => (
                                                <div key={logIdx} className="text-xs">
                                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                                                        <span className="text-indigo-600 uppercase">Operador: {log.usuario_nome || 'Operador'}</span>
                                                        <span>{log.data ? new Date(log.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-semibold mt-1 pl-1 whitespace-pre-line leading-relaxed">{log.descricao}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic text-xs pl-1">Sem altera√ß√µes registradas (Lan√ßamento original preservado).</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {financeiro.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500 italic text-xs">
                            Nenhum lan√ßamento financeiro registrado ou alterado no m√™s atual.
                        </div>
                    )}
                </div>
            </PageContainer>
        );
    }

    if (mode === 'rel_auditoria_sistema') {
        const { logs = [], startDate, endDate, userFilter } = data;
        const totalLogs = logs.length;
        const criacoes = logs.filter((l: any) => l.acao === 'CRIA√á√ÉO').length;
        const edicoes = logs.filter((l: any) => l.acao === 'EDI√á√ÉO').length;
        const exclusoes = logs.filter((l: any) => l.acao?.includes('EXCLUS√ÉO') || l.acao === 'DELETE' || l.acao === 'EXCLUS√ÉO_L√ìGICA' || l.acao === 'EXCLUS√ÉO_PERMANENTE').length;

        return (
            <PageContainer 
                title="Relat√≥rio de Auditoria do Sistema" 
                subtitle={`Hist√≥rico de Atividades e Logs Gerais de Auditoria ${startDate || endDate ? `(Per√≠odo: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : ''} at√© ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : ''})` : ''}`}
            >
                {/* Resumo executivo da auditoria do sistema */}
                <div className="grid grid-cols-4 gap-4 mb-6 avoid-break">
                    <div className="p-3.5 border border-indigo-200 bg-indigo-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Total Atividades</span>
                        <span className="text-lg font-black text-indigo-900 mt-1">{totalLogs}</span>
                    </div>
                    <div className="p-3.5 border border-emerald-200 bg-emerald-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">Cria√ß√µes</span>
                        <span className="text-lg font-black text-emerald-950 mt-1">{criacoes}</span>
                    </div>
                    <div className="p-3.5 border border-blue-200 bg-blue-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">Edi√ß√µes</span>
                        <span className="text-lg font-black text-blue-950 mt-1">{edicoes}</span>
                    </div>
                    <div className="p-3.5 border border-rose-200 bg-rose-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-rose-700 tracking-wider">Exclus√µes</span>
                        <span className="text-lg font-black text-rose-950 mt-1">{exclusoes}</span>
                    </div>
                </div>

                {userFilter && (
                    <div className="mb-4 bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs text-slate-600">
                        Filtro de Operador Ativo: <span className="font-extrabold text-slate-800 uppercase">{userFilter}</span>
                    </div>
                )}

                <Table headers={[{label:'Data/Hora'}, {label:'Operador'}, {label:'A√ß√£o'}, {label:'M√≥dulo/Tipo'}, {label:'Detalhes da Atividade'}]}>
                    {logs.map((log: any, idx: number) => {
                        const dateObj = new Date(log.data_hora || log.created_at || Date.now());
                        const dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <tr key={idx} className={`avoid-break ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                <td className="p-3 border-r border-slate-200 text-xs font-mono text-slate-600 whitespace-nowrap">{dateStr}</td>
                                <td className="p-3 border-r border-slate-200 text-xs font-black text-slate-705 uppercase whitespace-nowrap truncate max-w-[120px]">{log.usuario_nome || 'Operador'}</td>
                                <td className="p-3 border-r border-slate-200 text-center">
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded border shadow-sm uppercase tracking-wider bg-slate-100 text-slate-700">
                                        {(log.acao || 'A√ß√£o').replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-3 border-r border-slate-200 text-xs text-indigo-700 font-extrabold uppercase whitespace-nowrap">{log.tipo_item || '-'}</td>
                                <td className="p-3 text-xs text-slate-600 leading-relaxed font-semibold">{log.detalhes}</td>
                            </tr>
                        );
                    })}
                </Table>

                {logs.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500 italic text-xs">
                        Nenhuma atividade registrada ou encontrada para os filtros selecionados neste intervalo de datas.
                    </div>
                )}
            </PageContainer>
        );
    }

    // 2 - EBD
    if (mode === 'rel_ebd') {
        const { turmas, alunos, membros } = data;
        const totalAlunosGeral = alunos.length;

        return (
            <PageContainer title="Relat√≥rio de Atividades - EBD" subtitle="Matr√≠culas, Cobertura Docente e Ocupa√ß√£o de Salas">
                {/* Header Metadados EBD */}
                <div className="grid grid-cols-3 gap-4 mb-6 avoid-break bg-slate-50 border border-slate-205 p-4 rounded-2xl">
                    <div className="text-center border-r border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Turmas Ativas</span>
                        <p className="text-xl font-black text-slate-800 mt-1">{turmas.length}</p>
                    </div>
                    <div className="text-center border-r border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Discentes (Alunos)</span>
                        <p className="text-xl font-black text-indigo-700 mt-1">{totalAlunosGeral}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">M√©dia Alunos / Turma</span>
                        <p className="text-xl font-black text-emerald-700 mt-1">
                            {turmas.length > 0 ? (totalAlunosGeral / turmas.length).toFixed(1) : 0}
                        </p>
                    </div>
                </div>

                {turmas.map(t => {
                    const profs = [t.prof1_id, t.prof2_id, t.prof3_id].map(id => membros.find(m=>m.id===id)?.nome).filter(Boolean);
                    const alunosTurma = alunos.filter(a => a.turma_id === t.id);
                    const ocupacaoPct = totalAlunosGeral > 0 ? (alunosTurma.length / totalAlunosGeral) * 100 : 0;

                    return (
                        <div key={t.id} className="mb-6 border border-slate-250 rounded-2xl overflow-hidden shadow-sm avoid-break bg-white">
                            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                <div>
                                    <h3 className="text-base font-black uppercase text-slate-800 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                        {t.nome}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-4">
                                        <span>Sala: <strong className="text-slate-700 font-extrabold">{t.sala || 'N√£o definida'}</strong></span>
                                        <span>Docentes: <strong className="text-slate-700 font-bold">{profs.join(', ') || 'Sem professores vinculados'}</strong></span>
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end w-full md:w-fit">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {alunosTurma.length} Alunos Matriculados
                                    </span>
                                    {/* Mini visual indicator space */}
                                    <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-300" title={`${ocupacaoPct.toFixed(1)}% do total geral`}>
                                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.max(4, ocupacaoPct)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-0">
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/50 border-b border-slate-205">
                                            <th className="p-2 w-10 text-center border-r border-slate-200 font-black uppercase text-[9px] text-slate-500">N¬∫</th>
                                            <th className="p-2 pl-4 text-left font-black uppercase text-[9px] text-slate-500">Nome Oficial do Aluno Matriculado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-105">
                                        {alunosTurma.map((a, i) => (
                                            <tr key={a.id} className="hover:bg-slate-55/70 transition-all avoid-break">
                                                <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-400 font-mono text-[10px]">{i+1}</td>
                                                <td className="p-2 pl-4 font-bold uppercase text-slate-700 text-xs">{a.nome}</td>
                                            </tr>
                                        ))}
                                        {alunosTurma.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="p-4 text-center italic text-slate-400 font-medium">Nenhum discente cadastrado nesta classe.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </PageContainer>
        );
    }

    // 2.1 - EBD IMPRIMIR RESUMO / LI√á√ÉO
    if (mode === 'rel_ebd_imprimir') {
        const { licao, revista, licao_numero, conteudo_estudo, titulo_licao, data_licao, turma_nome } = data || {};
        const activeLicao = licao || data;
        const textoCompleto = conteudo_estudo || activeLicao?.conteudo_estudo || activeLicao?.text || '';
        const tituloFinal = titulo_licao || activeLicao?.titulo_licao || activeLicao?.title || `Li√ß√£o ${licao_numero || activeLicao?.licao_numero || '1'}`;
        const revistaFinal = revista || activeLicao?.revista || 'Li√ß√µes B√≠blicas CPAD';
        const numeroFinal = licao_numero || activeLicao?.licao_numero || activeLicao?.licao || '1';

        return (
            <PageContainer title={`Escola B√≠blica Dominical - Li√ß√£o ${numeroFinal}`} subtitle={`${revistaFinal} ‚Ä¢ Subs√≠dio para Estudo e Impress√£o`}>
                {/* Cabe√ßalho informativo do Estudo */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 avoid-break">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Material de Apoio ao Aluno & Professor
                            </span>
                            <h2 className="text-xl font-black text-slate-900 mt-1.5">{tituloFinal}</h2>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">{revistaFinal}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Li√ß√£o N√∫mero</span>
                            <span className="text-2xl font-black text-slate-800 font-mono">#{numeroFinal}</span>
                            {data_licao && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatDateLocal(data_licao)}</p>}
                        </div>
                    </div>
                </div>

                {/* Conte√∫do Did√°tico Formatado em Folha Limpa */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 text-slate-800">
                    {textoCompleto ? (
                        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-serif">
                            {textoCompleto}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-sm font-semibold text-slate-600">Nenhum texto de estudo gerado para esta li√ß√£o ainda.</p>
                            <p className="text-xs text-slate-400 mt-1">Gere o conte√∫do da revista com a IA no portal de EBD para visualiz√°-lo e imprimi-lo.</p>
                        </div>
                    )}
                </div>

                {/* Bloco de Anota√ß√µes do Aluno para a Aula */}
                <div className="mt-6 p-4 rounded-2xl border border-slate-200 bg-slate-50/70 avoid-break">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Anota√ß√µes do Aluno / D√∫vidas para a Classe:</h4>
                    <div className="h-20 border-b border-dashed border-slate-300"></div>
                </div>
            </PageContainer>
        );
    }

    // 3 - MISS√ïES
    if (mode === 'rel_missoes') {
        const { missionarios, agencias, financeiro, data_inicio, data_fim, congregacao_id } = data;
        
        const finFiltrado = financeiro.filter(f => {
            const d = f.data_competencia || f.data_vencimento || f.data_pagamento;
            if (!d) return true;
            if (data_inicio && d < data_inicio) return false;
            if (data_fim && d > data_fim) return false;
            if (congregacao_id && congregacao_id !== 'todas') {
                if (congregacao_id === 'sede' && f.congregacao_id && f.congregacao_id !== 'sede') return false;
                if (congregacao_id !== 'sede' && f.congregacao_id !== congregacao_id) return false;
            }
            return true;
        });

        const entradasMissoes = finFiltrado.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const saidasMissoes = finFiltrado.filter(f => f.tipo === 'saida' && f.status === 'pago').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const saldoMissoes = entradasMissoes - saidasMissoes;

        return (
            <PageContainer title="Secretaria de Evangelismo & Miss√µes" subtitle="Acompanhamento Mission√°rio e Balancete do Fundo Mission√°rio">
                {/* KPI Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6 avoid-break">
                    <div className="p-4 border border-indigo-150 bg-indigo-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Campos Ativos</span>
                        <p className="text-xl font-black text-indigo-850 mt-1">{missionarios.length}</p>
                    </div>
                    <div className="p-4 border border-indigo-150 bg-indigo-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Ag√™ncias Parceiras</span>
                        <p className="text-xl font-black text-slate-800 mt-1">{agencias.length}</p>
                    </div>
                    <div className="p-4 border border-emerald-150 bg-emerald-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">Entradas Fundo</span>
                        <p className="text-xl font-black text-emerald-800 mt-1">R$ {entradasMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 border border-rose-150 bg-rose-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">Apoio Enviado</span>
                        <p className="text-xl font-black text-rose-800 mt-1">R$ {saidasMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Subtitle balance info */}
                <div className="bg-indigo-950 text-white rounded-2xl p-4.5 flex justify-between items-center mb-6 shadow-sm avoid-break">
                    <div>
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block">Exerc√≠cio Consolidado</span>
                        <h4 className="text-sm font-black uppercase tracking-wider mt-0.5">Saldo Operacional de Miss√µes</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-indigo-200">Saldo Atual do Fundo</span>
                        <p className="text-lg font-black font-mono">R$ {saldoMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="mb-6 avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        1. Mission√°rios Apoiados em Atividade
                    </h3>
                    <Table headers={[{label:'Apoiado / Mission√°rio'}, {label:'Campo de Atua√ß√£o Geogr√°fica'}, {label:'Agenciador / Conv√™nio'}]}>
                        {missionarios.map((m, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50">
                                <td className="p-3 font-semibold text-slate-800 uppercase">{m.nome}</td>
                                <td className="p-3 font-medium text-slate-600">{m.campo}</td>
                                <td className="p-3 text-slate-500 font-medium">{m.agencia}</td>
                            </tr>
                        ))}
                        {missionarios.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center italic text-slate-400 font-medium font-semibold">Nenhum mission√°rio cadastrado atualmente.</td>
                            </tr>
                        )}
                    </Table>
                </div>

                <div className="mb-6 avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        2. Ag√™ncias Parceiras e Secretarias CCM
                    </h3>
                    <Table headers={[{label:'Ag√™ncia Social ou Coordenadora'}, {label:'Respons√°vel Operativo Administrativo'}]}>
                        {agencias.map((a, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50">
                                <td className="p-3 font-semibold text-slate-800 uppercase">{a.nome}</td>
                                <td className="p-3 font-medium text-slate-600">{a.responsavel}</td>
                            </tr>
                        ))}
                        {agencias.length === 0 && (
                            <tr>
                                <td colSpan={2} className="p-4 text-center italic text-slate-400 font-medium font-semibold">Nenhuma ag√™ncia mission√°ria cadastrada.</td>
                            </tr>
                        )}
                    </Table>
                </div>

                <div className="avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        3. Extrato de Caixa da Secretaria de Miss√µes
                    </h3>
                    <Table headers={[{label:'Data Compet√™ncia'}, {label:'Hist√≥rico da Transa√ß√£o'}, {label:'Opera√ß√£o', align:'center'}, {label:'Valor Operado', align:'right'}]}>
                        {finFiltrado.map((f, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50 avoid-break">
                                <td className="p-3 border-r border-slate-200 font-mono text-slate-600">{formatDateLocal(f.data_competencia)}</td>
                                <td className="p-3 border-r border-slate-200 text-slate-700 font-medium">{f.descricao}</td>
                                <td className="p-3 border-r border-slate-200 text-center">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${f.tipo==='entrada'?'bg-emerald-100 text-emerald-800 border border-emerald-250':'bg-rose-100 text-rose-800 border border-rose-250'}`}>
                                        {f.tipo==='entrada'?'Entrada':'Sa√≠da'}
                                    </span>
                                </td>
                                <td className={`p-3 text-right font-mono font-bold text-sm ${f.tipo==='entrada'?'text-emerald-700':'text-slate-800'}`}>
                                    R$ {parseFloat(f.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {finFiltrado.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center italic text-slate-450 font-medium">Nenhuma movimenta√ß√£o para o caixa de miss√µes.</td>
                            </tr>
                        )}
                    </Table>
                </div>
            </PageContainer>
        );
    }

    // 4 - CARN√äS
    if (mode === 'rel_carnes') {
        const { carnes, membros } = data;
        let totalGeral = 0, recebidoGeral = 0;

        return (
            <PageContainer title="Relat√≥rio de Contribuintes & Carn√™s" subtitle="Encontro de Contas, Campanhas e Dota√ß√µes Coletivas">
                {carnes.map(c => {
                    const totalCampanha = parseFloat(c.valor_total) || 0;
                    const recebido = (c.parcelas||[]).filter(p=>p.status==='pago').reduce((a,curr)=>a+(parseFloat(curr.valor)||0), 0);
                    const pendente = totalCampanha - recebido;
                    totalGeral += totalCampanha; recebidoGeral += recebido;

                    // Propor√ß√£o de quita√ß√£o da campanha individual
                    const quitacaoPct = totalCampanha > 0 ? (recebido / totalCampanha) * 100 : 0;

                    return (
                        <div key={c.id} className="mb-6 border border-slate-250 rounded-2xl overflow-hidden shadow-sm avoid-break bg-white">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                    <h3 className="font-extrabold text-slate-850 uppercase text-xs flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                        {c.titulo}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                                        Contribuinte: <span className="text-slate-800 font-extrabold">{membros.find(m=>m.id===c.membro_id)?.nome || 'N√£o identificado'}</span>
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1 w-full md:w-fit">
                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider text-slate-650">
                                        <span>Total: <strong className="text-slate-900 font-extrabold">R$ {totalCampanha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                                        <span className="text-emerald-700">Pago: <strong className="font-extrabold">R$ {recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                                        <span className="text-rose-700">Pendente: <strong className="font-extrabold">R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                                    </div>
                                    {/* Progress campaign bar */}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[9px] font-black text-indigo-600 font-mono">{quitacaoPct.toFixed(0)}% Quitada</span>
                                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden border border-slate-300" title={`${quitacaoPct.toFixed(1)}% integrado`}>
                                            <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: `${quitacaoPct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap p-3 gap-2 bg-slate-50/15">
                                {(c.parcelas||[]).map((p, i) => (
                                    <div key={i} className={`text-[9px] border px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-all ${p.status==='pago'?'border-emerald-200 bg-emerald-50/60 text-emerald-800':'border-slate-200 bg-white text-slate-500'}`}>
                                        <span className="uppercase text-slate-700">P{p.numero}</span> 
                                        <span className="font-mono font-medium">{formatDateLocal(p.vencimento)}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'pago' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        <span className="text-[8px] font-black uppercase">{p.status === 'pago' ? 'PAGO' : 'Pendente'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Resumo Final box */}
                <div className="mt-8 border-t border-slate-300 pt-6 flex justify-end avoid-break">
                    <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5 w-80 shadow-sm">
                         <h3 className="font-black text-xs uppercase mb-3 text-slate-700 tracking-wider text-center">Balancete Geral de Carn√™s</h3>
                         <div className="space-y-2 text-xs">
                             <div className="flex justify-between border-b border-slate-200 pb-1.5"><span className="font-bold text-slate-500">Total Previsto Esperado</span><span className="font-mono font-extrabold text-slate-800">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between border-b border-slate-200 pb-1.5"><span className="font-bold text-slate-500">Total Efetivamente Recebido</span><span className="font-mono font-black text-emerald-700">R$ {recebidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between pt-1"><span className="font-bold text-slate-500">Total Restante em Aberto</span><span className="font-mono font-black text-rose-700">R$ {(totalGeral - recebidoGeral).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                         </div>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // 4.5 - RELAT√ìRIO DE INADIMPLENTES (TESOURARIA)
    if (mode === 'rel_inadimplentes') {
        const { pending, igreja } = data;
        let totalValorGeral = 0;
        let totalRegsGeral = 0;

        return (
            <PageContainer title="Relat√≥rio de Membros Inadimplentes" subtitle="Documento Auxiliar de Cobran√ßa e Concilia√ß√£o - Tesouraria">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg text-xs leading-relaxed text-amber-900 font-medium avoid-break">
                    Abaixo constam os membros com pend√™ncias financeiras registradas no sistema (Carn√™s vigentes com parcelas vencidas e/ou Lan√ßamentos de entrada pendentes expirados). Este relat√≥rio destina-se ao uso exclusivo do corpo de tesoureiros para controle de recebimentos e dota√ß√µes or√ßament√°rias.
                </div>

                <Table headers={[{label:'Membro / Contato'}, {label:'Motivos / Detalhes das Pend√™ncias'}, {label:'Registros', align:'center'}, {label:'Valor Total Devido', align:'right'}]}>
                    {(pending || []).map((m, i) => {
                        totalValorGeral += m.valor_total || 0;
                        totalRegsGeral += m.qtd_atrasos || 0;
                        return (
                            <tr key={i} className="border-b avoid-break hover:bg-slate-50">
                                <td className="p-3 border-r border-slate-200">
                                    <p className="font-bold text-slate-800 text-xs">{m.nome}</p>
                                    {m.telefone && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{m.telefone}</p>}
                                </td>
                                <td className="p-3 text-xs text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{m.descricoes}</td>
                                <td className="p-3 text-center text-xs font-bold text-amber-700 border-r border-slate-200">{m.qtd_atrasos}</td>
                                <td className="p-3 text-right text-xs font-mono font-bold text-rose-600">R$ {m.valor_total.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </Table>

                <div className="mt-8 border-t-4 border-slate-900 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 avoid-break">
                    <div className="text-slate-500 text-[10px] font-bold uppercase leading-relaxed">
                        <p>Total de Contribuintes em Atraso: {(pending || []).length}</p>
                        <p>Total de Registros Pendentes: {totalRegsGeral}</p>
                    </div>
                    <div className="text-right w-72 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                         <h3 className="font-black text-xs uppercase mb-2 text-slate-700 tracking-wider">Acumulado em Atraso</h3>
                         <div className="flex justify-between border-b border-slate-200 py-1"><span className="text-xs font-bold text-slate-500">Valor Total Vencido</span><span className="font-mono font-bold text-rose-600 text-base">R$ {totalValorGeral.toFixed(2)}</span></div>
                    </div>
                </div>

                <div className="mt-16 text-center border-t border-slate-300 pt-8 flex justify-center gap-20 avoid-break">
                    <div className="w-64">
                        <div className="border-b border-slate-900 mb-2"></div>
                        <p className="text-[10px] font-bold uppercase text-slate-700">Respons√°vel pela Tesouraria</p>
                        <p className="text-[9px] font-serif italic text-slate-400">Visto / Assinatura</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // --- RELAT√ìRIO DE FROTAS ---
    if (mode === 'rel_frotas') {
        const { subType, veiculos = [], motoristas = [], despesas = [], multas = [], igreja } = data;
        
        let reportTitle = "Relat√≥rio Geral de Controle de Frotas";
        if (subType === 'despesas') reportTitle = "Relat√≥rio Anal√≠tico de Despesas de Frota";
        if (subType === 'multas') reportTitle = "Relat√≥rio de Infra√ß√µes e Multas de Tr√¢nsito";
        if (subType === 'veiculos') reportTitle = "Relat√≥rio de Invent√°rio e Status de Ve√≠culos";
        if (subType === 'manutencoes') reportTitle = "Relat√≥rio Consolidado de Manuten√ß√µes por Ve√≠culo";

        return (
            <PageContainer title={reportTitle} subtitle="Sistema Integrado de Gest√£o Patrimonial e Frotas">
                {/* Resumo cards */}
                {subType === 'manutencoes' ? (
                    <div className="grid grid-cols-4 gap-4 mb-6 avoid-break bg-indigo-50/40 border border-indigo-200 p-4 rounded-2xl">
                        <div className="text-center border-r border-indigo-200">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Per√≠odo</span>
                            <p className="text-[11px] font-bold text-slate-800 mt-1.5">
                                {data.manutencoesFilters?.startDate ? `${data.manutencoesFilters.startDate.split('-').reverse().join('/')}` : 'In√≠cio'} 
                                <span className="text-slate-400 font-normal"> at√© </span>
                                {data.manutencoesFilters?.endDate ? `${data.manutencoesFilters.endDate.split('-').reverse().join('/')}` : 'Fim'}
                            </p>
                        </div>
                        <div className="text-center border-r border-indigo-200">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Tipo de Servi√ßo</span>
                            <p className="text-xs font-black text-indigo-700 mt-1.5 uppercase">
                                {data.manutencoesFilters?.tipoServico === 'todos' ? 'Todos' : data.manutencoesFilters?.tipoServico}
                            </p>
                        </div>
                        <div className="text-center border-r border-indigo-200">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Estipulado Custo Acumulado M√≠n.</span>
                            <p className="text-xs font-black text-slate-700 mt-1.5">
                                {data.manutencoesFilters?.minCost ? `R$ ${Number(data.manutencoesFilters.minCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem M√≠nimo'}
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Investimento Total Geral</span>
                            <p className="text-lg font-black text-emerald-750 mt-1">
                                R$ {(data.manutencoesFilters?.totalCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 mb-6 avoid-break bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                        <div className="text-center border-r border-slate-200">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ve√≠culos</span>
                            <p className="text-xl font-black text-slate-800 mt-1">{veiculos.length}</p>
                        </div>
                        <div className="text-center border-r border-slate-200">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Condutores Ativos</span>
                            <p className="text-xl font-black text-indigo-700 mt-1">{motoristas.filter((m: any) => m.status === 'Ativo').length}</p>
                        </div>
                        <div className="text-center border-r border-slate-200">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total em Despesas</span>
                            <p className="text-xl font-black text-emerald-700 mt-1">R$ {despesas.reduce((acc: number, d: any) => acc + (parseFloat(d.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Multas Pendentes</span>
                            <p className={`text-xl font-black mt-1 ${multas.filter((m: any) => m.status === 'Pendente').length > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {multas.filter((m: any) => m.status === 'Pendente' || m.status === 'Vencida').length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Relat√≥rios Condicionais por Tipo */}
                {(!subType || subType === 'resumo' || subType === 'veiculos') && (
                    <div className="mb-6 avoid-break">
                        <h4 className="text-xs font-black uppercase text-indigo-950 border-b-2 border-indigo-200 pb-1.5 mb-3 flex items-center gap-2">
                             Invent√°rio e Status da Frota
                        </h4>
                        <table className="w-full text-left text-[10px] font-semibold border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-350 bg-slate-100 text-slate-700">
                                    <th className="p-2">Ve√≠culo / Modelo</th>
                                    <th className="p-2">Placa / Ano</th>
                                    <th className="p-2">Tipo</th>
                                    <th className="p-2">Cor</th>
                                    <th className="p-2">Vencs. IPVA / Licenc.</th>
                                    <th className="p-2 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {veiculos.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-slate-400 italic">Nenhum ve√≠culo registrado.</td>
                                    </tr>
                                ) : veiculos.map((v: any) => (
                                    <tr key={v.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                        <td className="p-2 font-bold text-slate-800">{v.marca} {v.modelo}</td>
                                        <td className="p-2 font-mono font-bold text-slate-700">{v.placa} ({v.ano})</td>
                                        <td className="p-2 text-slate-600">{v.tipo}</td>
                                        <td className="p-2 text-slate-600">{v.cor}</td>
                                        <td className="p-2 text-slate-605">IPVA: {v.data_ipva ? formatDateLocal(v.data_ipva) : 'N/D'} ‚Ä¢ Lic.: {v.data_licenciamento ? formatDateLocal(v.data_licenciamento) : 'N/D'}</td>
                                        <td className="p-2 text-right">
                                            <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] ${
                                                v.status === 'Dispon√≠vel' ? 'bg-emerald-100 text-emerald-800' :
                                                v.status === 'Em Uso' ? 'bg-blue-100 text-blue-800' :
                                                v.status === 'Em Manuten√ß√£o' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                                            }`}>{v.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(!subType || subType === 'resumo' || subType === 'despesas') && (
                    <div className="mb-6 avoid-break pt-4">
                        <h4 className="text-xs font-black uppercase text-emerald-950 border-b-2 border-emerald-200 pb-1.5 mb-3">
                             Hist√≥rico de Despesas / Gastos Realizados
                        </h4>
                        <table className="w-full text-left text-[10px] font-semibold border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-350 bg-slate-100 text-slate-700">
                                    <th className="p-2">Data</th>
                                    <th className="p-2">Ve√≠culo</th>
                                    <th className="p-2">Tipo de Gasto</th>
                                    <th className="p-2">Condutor / Motorista</th>
                                    <th className="p-2">Descri√ß√£o / Obs.</th>
                                    <th className="p-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {despesas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-slate-400 italic">Nenhuma despesa registrada.</td>
                                    </tr>
                                ) : despesas.map((d: any) => {
                                    const v = veiculos.find((ve: any) => ve.id === d.veiculo_id);
                                    const m = motoristas.find((mo: any) => mo.id === d.motorista_id);
                                    return (
                                        <tr key={d.id} className="border-b border-slate-200">
                                            <td className="p-2 text-slate-600">{formatDateLocal(d.data)}</td>
                                            <td className="p-2 font-bold text-slate-800">{v ? `${v.modelo} (${v.placa})` : 'Ve√≠culo Exclu√≠do'}</td>
                                            <td className="p-2">
                                                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-extrabold uppercase text-[8px]">{d.tipo}</span>
                                            </td>
                                            <td className="p-2 text-slate-700">{m ? m.nome : 'N/D'}</td>
                                            <td className="p-2 text-slate-500 italic">{d.descricao || '-'}</td>
                                            <td className="p-2 text-right font-black text-slate-900">R$ {(parseFloat(d.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                                {despesas.length > 0 && (
                                    <tr className="bg-slate-50 border-t border-slate-300">
                                        <td colSpan={5} className="p-2 text-right font-black text-slate-700">Total Acumulado de Despesas:</td>
                                        <td className="p-2 text-right font-black text-emerald-700">R$ {despesas.reduce((acc: number, d: any) => acc + (parseFloat(d.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {(!subType || subType === 'resumo' || subType === 'multas') && (
                    <div className="mb-6 avoid-break pt-4">
                        <h4 className="text-xs font-black uppercase text-rose-950 border-b-2 border-rose-200 pb-1.5 mb-3">
                             Registro de Infra√ß√µes e Multas
                        </h4>
                        <table className="w-full text-left text-[10px] font-semibold border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-350 bg-slate-100 text-slate-700">
                                    <th className="p-2">Data Ocorr.</th>
                                    <th className="p-2">Ve√≠culo autuado</th>
                                    <th className="p-2">Respons√°vel (Condutor)</th>
                                    <th className="p-2">Infra√ß√£o cometida</th>
                                    <th className="p-2">Autua√ß√£o / CNH</th>
                                    <th className="p-2">Situa√ß√£o</th>
                                    <th className="p-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {multas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-slate-400 italic">Nenhuma multa registrada.</td>
                                    </tr>
                                ) : multas.map((m: any) => {
                                    const v = veiculos.find((ve: any) => ve.id === m.veiculo_id);
                                    const mo = motoristas.find((dri: any) => dri.id === m.motorista_id);
                                    return (
                                        <tr key={m.id} className="border-b border-slate-200">
                                            <td className="p-2 text-slate-600">{formatDateLocal(m.data_multa)}</td>
                                            <td className="p-2 font-bold text-slate-800">{v ? `${v.modelo} (${v.placa})` : 'Ve√≠culo Exclu√≠do'}</td>
                                            <td className="p-2 text-slate-800">{mo ? mo.nome : <span className="text-slate-400 italic">-</span>}</td>
                                            <td className="p-2 text-slate-700">{m.infracao}</td>
                                            <td className="p-2">Guia: <span className="font-mono font-bold text-slate-600">{m.auto_infracao || '-'}</span> <br/> {m.pontos ? `Pontos: ${m.pontos}` : ''}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] ${
                                                    m.status === 'Paga' ? 'bg-emerald-100 text-emerald-800' :
                                                    m.status === 'Pendente' ? 'bg-rose-100 text-rose-800 border border-rose-150' :
                                                    m.status === 'Em Recurso' ? 'bg-amber-100 text-amber-800 border border-amber-150' : 'bg-slate-100 text-slate-800'
                                                }`}>{m.status}</span>
                                            </td>
                                            <td className="p-2 text-right font-black text-rose-700">R$ {(parseFloat(m.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                                {multas.length > 0 && (
                                    <tr className="bg-slate-50 border-t border-slate-300">
                                        <td colSpan={6} className="p-2 text-right font-black text-slate-700">Soma das Penalidades Financeiras:</td>
                                        <td className="p-2 text-right font-black text-rose-700">R$ {multas.reduce((acc: number, m: any) => acc + (parseFloat(m.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {subType === 'manutencoes' && (
                    <div className="mb-6 avoid-break pt-4 animate-fadeIn">
                        <h4 className="text-xs font-black uppercase text-indigo-950 border-b-2 border-indigo-200 pb-1.5 mb-4">
                            Hist√≥rico Consolidado de Manuten√ß√µes dos Ve√≠culos
                        </h4>
                        
                        {!data.veiculosManutencao || data.veiculosManutencao.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl">
                                Nenhuma manuten√ß√£o encontrada com os filtros aplicados neste per√≠odo.
                            </div>
                        ) : (
                            data.veiculosManutencao.map((vm: any) => (
                                <div key={vm.id} className="mb-6 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 avoid-break shadow-sm">
                                    <div className="flex justify-between items-center bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/50 mb-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-indigo-950 uppercase">{vm.marca} {vm.modelo} ‚Ä¢ <span className="font-mono font-bold text-slate-600">{vm.placa}</span></p>
                                            <p className="text-[9px] text-slate-400 font-bold">
                                                Ano: {vm.ano} ‚Ä¢ Cor: {vm.cor || '-'} ‚Ä¢ Status Atual: {vm.status}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Acumulado Filtrado</span>
                                            <span className="text-xs font-black text-indigo-800">R$ {vm.totalAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <table className="w-full text-left text-[10px] font-semibold border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-slate-300 bg-slate-100/60 text-slate-650">
                                                <th className="p-2 w-[11%]">Data</th>
                                                <th className="p-2 w-[22%]">Tipo de Servi√ßo</th>
                                                <th className="p-2 w-[16%]">Quilometragem</th>
                                                <th className="p-2 w-[39%]">Descri√ß√£o / Detalhes</th>
                                                <th className="p-2 text-right w-[12%] font-black text-slate-700">Custo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vm.logs.map((log: any) => (
                                                <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50/80">
                                                    <td className="p-2 text-slate-600 font-mono font-bold">{log.data ? log.data.split('-').reverse().join('/') : '-'}</td>
                                                    <td className="p-2 font-bold text-slate-800">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                                            log.tipo === 'Manuten√ß√£o Preventiva' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        }`}>
                                                            {log.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-slate-600 font-mono">
                                                        {log.odometro ? `${log.odometro.toLocaleString('pt-BR')} KM` : '-'}
                                                    </td>
                                                    <td className="p-2 text-slate-500 italic whitespace-normal break-words">{log.descricao || '-'}</td>
                                                    <td className="p-2 text-right font-black text-slate-850">R$ {parseFloat(log.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </PageContainer>
        );
    }

    // 5 - CADASTRO DA IGREJA
    if (mode === 'rel_igreja') {
        const { igreja } = data;
        const Box = ({ label, value, span=1 }) => (<div className={`border border-slate-300 p-2 ${span > 1 ? `col-span-${span}` : ''}`}><p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p><p className="font-bold text-xs text-slate-800 uppercase leading-snug whitespace-prexúÏΩ›s„Fñ'˙>EZÎnQ›"ıYÂ*uï|iä*”W’§™f6Í:T	R∞IÇHYeY€;{#Ó”ÓæØ{&<~ÚÏK?6ˇì˝KÓ9'@&ê ¸P…ûf∑m
ê_'Oûèﬂ9ß¸≠gç◊Ôn¨¡‘fﬂœ÷ˇüÈˆvu{˝˛≈÷¯≈V◊π9‹¯√?0ÒÒÏ…‘±Rx?/Œ≠æ]sGÀŸõ8ìÅ˝rÌÿÈ\[¨k≥ö’µ¸âÁ≤∆»áﬂ¶«YÉ5ÊOØƒ≠GV◊ıY≥ÁtÀÒY◊bçæge≠*Ì‡ÁnÎwÏ®z‘l≥œfj7jÂw[˜â€^\Ô±Œ¿Ú˝3kÙ†sÂ+w–e˚vR~ª≥3æ˝í]ıÀ˛¿öÿÂg€€¸áoØùâÕ∆Â]6èmØc˘6õxVÁkg‘/Îtm¬ÜìÚ˛⁄·NÖÒ^1ıf?uù|µŸâ€±Œw÷Ï_gˇ‚æÿ∫ﬁK‡Ã®‹µæÁt˛´‹q~yü]π^◊ˆ É‡À$¯¬˚∫∑Ω≠ôzÛgÓ-XWˆ‡Â⁄ô;¥≈Ñ§˘d¥Ã/Ô˙≥2ÇªÓô?∂F/ÔˆÔŸV˛{kgÁ_ƒﬂ“çø
ﬁ≤{oí#kb±„È®ÀÁ)|_œıÜ÷~µiK‚˝]∏˝≤á∑w,w√®õ‘B}hç:Œ∏@#∂x¬∏ù˙∆û˝´ÀjÓp<∞'n|rl∫£„F”l2ÀN◊Í⁄ây¶´¡ãˆL^Ù˙8˛íiO;0æ—ˇ!cª’™g≥ˇqñæ·bdm›∏@“Wûm}Õ∆¥cÙù]È>›];‹ˆiÕÕ˛}D˚ˆ√ë¥Ôå≤6™nTÀ€¨Òïjz}kpVÔlﬂô˝ ¸≤ìÿµk‰é.ª8Çh€•Qkºùñ›wàø≤=`¿µ}ôÑæO‹}Ÿ«ªã∑Øø±G|Lº¡-vfÄÆ≈=r$Ó[¨’∫?±∫Sján“∞-)ﬁë¥‚â5ÑìÔxˆcHw©ÀHè`ª=^oÒFd;ıÁ®]◊≥}}SΩ˜àáò∂S·Òî–ùÚ—¡ﬂüyñÔ§Ã&¸Î“·˜√–“y)g;)óµ‹®ﬁæ®^ºæh≤v≥÷®ûhôQ»|a%'”âtÏOá.˚ÌocíKÿ‡|‹ã]5€´„8Xõˆ*˚-—Ú–MhUlV£‘¢1n§33›@9∑J0-Ëÿ^‘È'€¡`∂q04Dﬂ:—0˘}ü¿É€Í‚<{`›⁄]it4b†ªé]{vôÀù©ÕX∆‰zá£”ìS∆O˜)g^£Uøh∂UVˇßzÌıE„MıuÏÌ√±ÁÄ∞ÓzB∑vg:qn¨@"ú˚¿{∫ÿÅá3{‚å@-8ç¿ıÿ9¨(tHX;ªaØdéóxrx¨◊OH^c~„ßÏ›«Í•{Vf•ÿµÀæÇÙüÛjVûù∑ÍÌ∆Q˝Ï¢æ~øÒé∞ıı‚Ïπv~Ã∫Æ≠æÉóùqO=i¶oÁoeoúé=œœñÛßnªá∑Ì(ìˇQù÷¯Ø“SµzyiS)ØˇsÕıÓsΩ;˜\ÔfÕınÊ\ÔJsΩªÙπﬁ5õÎ›πÈ∫mwÄqÕ~∑MÀœ•Ã±O∑XpáJ “uuf•b‹Æ◊‡Ñò˝©’h.Åx•ægÙynÚùgJ„œÂNÈn îÓ¶MiúNó7•ª¶S:?ï^ÿæ;ıPÙ.D§“c):	ÔPiT∫ÆN®ÙCåF/ÍÌÊÎVΩ—ZâF=œËÒ‹:«tÓúŒ›îÈ‹MõŒ8}.m:wßSCù⁄◊W¢ÑµzV£Ì÷ç‚ºÒOz]*∞ê]Y£MF†Ë][7¿Òù€ç_¶^ı$∞;#◊¢À»éç {ÀÓÿW\…*¶S-◊HD-HÙ-ÙÔƒ˘fÍƒM®ÚZôŸ/‚ÔØˆgˇ6%!˛J´o„ÂBÔ‚sâ=F>l¡Ωp∆âŒvË.ys“ï{yS¬có¸>‹çµf´eäÙ
	óË]√¨n“8∑·_ä‚'$†”gú™;(RÖj:êØFc«õ{˚ñ}5ı'NÔ}PﬂÇ›∞Õ§≠ó¶î∆öˇ∂¸6®ﬁbPæR{z0º¬m≈«˚b,?Cc∏ıY¥â√ÕπvSŒ»Ìî|Zµ=xNè9k‡td˚√‹H:˝∞=Ö÷¯>¢+ëg+çi™ó˜VÙ£pãâÖ‹⁄bÂrôµÍ'’ãŸ'¶zTgµÊŸEıøWÖ|SE£‹I¡0JC6ÛÀó/Ÿz=fó°tbqäü∏ÎÏ.lÆÎ∞ó]qnãª˚?ƒÓB¢…JwúÚ79çoräﬁa˜ÏÂ!+≈¯ÓùŒ&¥O6°]ˆÒ>Ã	'¿ﬂ ¯wô_æõÒ›ΩvüÖ7¡¬e±Î´ÚvÂ	
çBC ±w°IÔ~&ø{ÖéN·ÂDwõÕtÖ>ŒªwØ˝»XWÌù±ûâs„Ç¸Å|Ò f∑#±:XU"ãÛ/÷a≤◊Ö˜‘!Üøé3}n˚æk±„ŸOæ”±hﬁsy
7¿Ω/?Õ`ÊP&Ó±Sa‹£ÏaGˇlˆo°3xAªµ˜Æn±ñıv∞≠:P:ÜnU›ãï„1ãŒ⁄çã◊çŸügˇ‹‰¥Po∑õU†ÖˇØ›®U◊Õœ˛l¨∂«ÿΩ¿ß,ªa›¯IÑWº_Útê8~i”Ø˝hÊ»HmÌ¸X~{$kœ˜∫÷+†âıJÔ˜˙ãΩû|⁄¿[Œ,ø√≈RÈÂ‰æÖø¿˙ƒ˝‹â{6∆¨O/rÓ¡wÆÑ0pc‡‡&ﬂ)é¯ë<N¶ÙØkMNf?üê⁄äå\Êõ\◊JÀˆ«pLœ~∏±ÙﬂâC√á”¡!◊ß„À‰√Ô∂Ê≈⁄E+µmvÌNoloCﬁ
îc)±à∑Ê1ûPª°>~kÇ¯ë;˛pgTÿIiyì`îBz·OÄP_+lì_%ı≠bT $ÀL{$h≠ﬂ´÷íb
i≠~.7gèÁ|t8w‹ù‘Ò<yjÆË¬≤¥Ω«H∏{ïà√†ôc8ß‘c¢€{`√‡AÜ∂”Å%3ﬁâ¯i>_|Ï‹"	4ßÖÇ∑_∫¯√|m‘ÀCÀëEAˇûÔ]Õ+–sopÅ˛∑ÌÀ8JÈı.øß„FòéßK6T§QÙ£4Vƒ=‰Y1“_W¿ºë.∆ódYÇ˚ûC/™ıˆyÛ¨=˚”õ˙…:Ik’vªqVΩx›™≤£&;™◊N™≠*Ÿ¡Pá-“[csäÄ4qQHíXll‹ê&S€œ"∏_ JÜõ£*kºj’ø®Æl¬ﬂ8>ùPUﬂwF÷dÍYà êºY%k£Ëlœo’RTû=–òß|ç}Íé?n¬∑¡‘é6WkÅbÿΩ∞_Eó∏ÅéN≠1‹xßÙµkÿBW≠"õ ùÚæÉ'Páà›¡5 h¬]\›íàÒ∑äsﬂ;´bw‚‹JcÒêºÑÕ“ó≠◊«Òw‡Ç/†ì%˛Ù∏wâ";>~ºÖÇ˝zx√˝˛!6ß◊64·˘0£ö%©≠q	ÆìMPX¢exﬂæDÖ∑‹olhÆÄ…¨e¡œ~FøÚ9ÙQô Cw]…vÊ+∆≥vHuÏ»È„÷aˇÁø¸Ö]∏çÏf‚° ¿ı'◊˜ë®ç—ıµ≤Îj`sÛÚN|—‹âü®!úÆRgì9‹äöŒ&˚⁄~èß5àMË>ª◊r1Ÿ5vÌÇ^vê¿ﬂ›˙yÄπ¥u≈ÖÖÆvo©≥wô/¡œ¿û†êî≤æ˛á‹ªëIÂ è¿Ì©0Ñ¨oÉ[ÃÚ€πgˆ ƒ[•9yènv~˚⁄|ùç≥õ•u8)I¥Îß @ºj¥/ZMJ:˚›zcdÌ:´ûü‡–6Ê\¡ãèI<8_≥è-‹l‡ú+IÏ∫p£îÂ9ßÉNâ¬sÅOÕ9‚Z)s#LYd:ï{áˆ\J˚ºòt9ªf©0jBDsfÛçÌ"Ïˆ”As9Oﬂï?Ëê¢Ö/ØÁÖz∏5ÈÊø>gﬂg⁄Â&ûæÅÕS/∂Ë ù◊g˙¥≤ÙZ?˝¨’l≥‡W’¡shØ<◊øÄÄliENqáF∏2Â‘ÛÄAûB∑Æ·ñë˝-C˚xi£“∑˘’“|¿ÏRﬂäËı)Ôä"√Ñ¬äËg(´àõC¢°§Úñ;DH^øﬂd¡ﬂ$¬*ƒ˘(]"o∫*Ú’6Ì˝ıMÚXt∞ŒµÚı˚/”ƒ°`($di(ùÖp¸œor›µﬁ√2ŒÑç-œ∑£I)Òs≈úI	ˆÀ∆€ù/7ÄzvàH‰’Õ†~#n
mC⁄Êê◊ˆ?2ö{âîO2ç8{Ë+Üëtd»pÓ§ôáY~Ò ÈMòÔ|‰π≥üPZ«ŒËk“J∑Ôa≠πc”¿%`¬†4„îp…í)«OÅÀfzG‚Õ˝¬≠g7⁄ ÁiÁÓùQC¿"§uq4f¶eÅ˘X·â®÷ƒÆŸXpb&lW´Ûµ~≈ûà)£ËüŒ∏ÍE„Ms›†+Èg~R∂∑ÓP”OÙC“~πü{“Aav∑∑u8ƒ∞‰o`√¶˘ûdM6˚©Éˆg‘u:É3ƒ9¿ã|‘î°YmG√Ÿø¡ı…‘Tñh¢≥{∏Ôq£ˆyï’™GU–5™'¨ƒs÷8;jºiΩÆûl§úËÔƒèÕÅ>0N¸éøCú§w?8ƒâ-rátÄìÜ‘„€Oq\Ÿìom{§n ò£4–í∆îºªœÆÀ{·â~Å\€›‰ S˚¯/tj©«\H#i,QZî}Ö ¿-{.¡7^8√>ÛΩŒKqÈ^^o:¿ È?Ó’Wv∫ÉBrÖˆIı∏y—d{∑˚/∂ËœîÉ{A∑œ*Òd@ÂÈœ6æÕÚzJ):8NŒÒW„ﬁ/!K$ç*ÿ±‘∫ `¶°f⁄)ÚÍE,:±N]é-'7ÀG˙+-v:˚;˛Œ°eœıŒ,îÅ$Tƒ{F.òÅöêz/]ûkîó¿e5ÁFÚ)‘πÎ^vr°~û{nœÒ}ƒ#n±fgO{2¨å˘26jÔ˘˚«kk‚W«cÈ›Iœ|ë©·4-n¬T‡îCÛ*∫ó«Ä√–£–Ê–`ÜäM/¯Î~øO{ﬂØøÃâ} ÿóB˝é°Ü**!s:? ‘eAÆ&|9∂ÜŒ¿±<˚ÉÛ}-á≠Õ˛}Ù’¥ü`â ÷‚e„3 ∂KáÏÿ\ª˛ß ÓÇ¨MW+˜5Œ]ÊÆîœ	ïóˇq
*≈K≈¯f“¸Jâj/ *ö¸∏+;GLyêÚ‚„©»•£ıñÙÚﬁîÁX Ô‹∑T?˚¸ıi’ú˚©{Âob¥‹-ﬂ§"ÔñÈ–ˆ‹0E—|-pÉ'´¢v,Ωõõ,Ê{e õ|≥‡sì+~€∆bç·“–Èü◊úE7ZÜÌ˝ÚvÍ~ÖÅ(‘±ª<äë˝ñqÚE]ı5«}l'Ç‹ﬂp˘ÚÕπ$—¡É$/q£
"	ñ”á]Å9•»ô˝∆vXAø"0Ç~¬àhàÓi⁄‡ŸYÈ‹ı0*{bmê©ÚÃΩ¡Dy#–S'N’#ª„ ’Æg˜bAæ•dS√l8JiI˛%y∆≠K[‹∂H€Dt
SÙc≠∫∂cõ~ÿÚú¸Áî^6˚(›gﬂLa€¿
8ò÷P·ŸºM‹–Épcò7yóK©Q·j◊]•Ú}Ω5=ßo•aÒ∆/]∫n>]+…H“Dk"ÖoÌ2b÷p^≈#¢XêC?©∞œë@ˆ»^Éi\ä¯≤x*≥|N|Wı<Î}≈ÒÈøpJv¢ﬁ(P rê˛≥pÊ≤C∂m7!gn“®ß∏@´œ8{÷ºÜ@tõ„–Â)œf∞¬;ëﬂ-µÕ«ık˙§:óvuÄ[aQ}3®¶; ©#(	Ωÿö\?û’Äß1˜cê¯‡quOs?Æû°ÿ_˝´	kFJTupSp±≤˝ï±;Õ7Êã…ï€}/è	ò—Ú{&æài3Çüª6F@œÓ0kÙû £4≠+€À¡πÍªÔÈ¡T	¿ƒV°DÔÔj◊;-9eÕ%Ù%ò“òLÁ¶}ã˙ÖN€æKãh3´ãÿ%ÑÕ-πG∫ŸzV®SQlÍ`y}”˘÷áÓ»Uny=É\Ÿ˙ŸCD{u’Ìr®≠|$¿ˆÔÖ9O¡èõóÚV‰)&ëΩ=rBi’,‡;&™çAáñ]®…Pò–{:¥ªŒtgÇ=∫ûY`ÌAπQ‚aÃñÂFfyﬂLAïÍ∫ïú  ¬2Û…àñ€—∏ëÉ$>jÕº‡…iÄ!ã∏-ó˘∂gp[tK8ûÂ3¯ø3"n'4T&—b®ºL(` =∫('ãcÅæ-ÔmÌ≥·mŸ¬å≈|†πY*⁄!‚<·ñ[;T¢8¸@€’Ö0-ü∞2´U[UL›Û¶qQO¡Æt–¨AI√ùé_
ÄÍ9}’ w°‘ıNn≤{;Ha:◊€Ì Æ=¸R!4Xãùmô¶ûK~<X”‚ëá¨7®ËEâÑwí}Õ•~Pü…°p\◊ÈÛˇ
∏E¸4
K\Fò;æ@>1ÍVŸπıè°]É>ˇÖÌO}P:1ŒÓ£[‚Æt¢W(”°R@““ Ïø¡⁄Yﬂ≥‡ffÏ>Ü-Aü—“€≥¬¸Èu<˚…s0≠7:V»Vc±†€w}íuÑ}›¬Ì
=ÅÀ∆0(ﬂûjr*kﬂÊŸ
ﬂvc7ôDs3˚#çÅl≤·‘axÆ€–AﬂB.kc(,◊ÚF!2k,øñÒ[ÿ"ß˛0«1ÆÎFÕ¬ÑL\ËΩ%Ú	¬ªo8˚óƒ+ÑE'xÖ%Ωbl3¿Ó"è√‘ˆ0„¿˝Ÿë+∏>H¥)Ï{iÀ›dˆùA@À≥`ŒÇX6$+≤æÒu«ÂEY\›|ë˜^¶ŒΩ^Á"óF¿à∑’AíÎêòtqSÙíÇì`∆˝8…Ú ≤çKÏ£¸îﬂ√Ü˜‹)Lg7+ƒWô|qhà!êß√fü√"Dìôóo°u»ãÖﬂxaÈ(©”c“K_ÿ√√µ‡Õ∏Î~Ì≈\Àª]A’l›¨¿;ê#-˜,§ ŒQ|6≤øq◊píèêì¯>ú≥∂„nÚ†€°ÎÌ›¿ªvGl`∆∆Ï_qUö¨∞?"ÁÒôÁ¿ÈAÁó;Û$˘0w
JÛ]Bp#YªFñÁW@d"âB>À∆0ïO≥∞{&≤R‚\ıáÚ·ÑÁ%,ó¬C cì›IA$ó4GˇlO<8¨JÎ–¡œZÎp_◊z∞N.Kß1J·`} ÙΩ∑-/˙ı~#ùÑME∞gQi”€≠∑ñréqREºïN˝ÃÃçe¶;ó.ÚQ˙éÍ¨UØ5OÎgGU
˛dÕ◊p±}“xUÖãÕLq6Á¿È[‹¨Çê%¯FU´2ƒM∂îµ‰¯-ÈMºÕYû€ôÚñ–&tEj3˛"x‡ë∫äÿ;?•∞˜0Ì-ˇÅüWB–#ˇ]xœë4Nv8í‡.)‰¸ó)Âj)˘.ò9]x¡/@ n∂Yª˛Ûë∂/0à»˘\gÕ„F≠Qm¿◊⁄IΩ›ò˝	~«_µf£u
ƒﬂﬁú[>÷ï{âá…™ûæ∑@‡¥ªÙj˙*éî›˝8R≤RùhŒû˜∏qT=™ØØÓ‹YÅò® ˚-íôpuaHP
lÜùÃ2i∫7Í◊ÜÆÓ‰¡∞œPÍ£Q.zkNº∆íNU}s´=]√6s2Í¸⁄◊I‘üäõfœ≈∑g 0`F&˘Ñ©õ˛¯∫N) øÃ…Õ4◊ZÍLaîû	/»pΩ|´¶z…TºzÜÒ›ç≥F˚bˆﬂË‹)U1ÕLó∞“¢√$Ää>⁄;˙}3#Ùª@îSŒ∫)üUõ…09 Èâ¡BE
æbá;≤)‘Ó»FΩä§"L›ôÛ√ïÌCL;–Ô§Òíó˛Œ…<ÉÕÒ(fgî«ÑPŒjzƒ.Ù“ıÓ∑Âkß<√‡ËKj:`Dâ/5âõ÷aS“$√pÁ¬˛ñ)°˜∞ç;Ccâ¡%Ã¢¥sRáeá€Í‚
ÅÀF$Ïﬂ°
∑É\¶îÏL°ƒ 1@$¬“Â!“√÷∆Ö`wv.ùÓ∆ßúÖÚ$4T2nw∫Æ	œúkô>ƒÏ¶”*∞>ıo¶Œ„JD"≥µôtqxyájπC˛!"k˝Ôø˚ÂÜ»·0ÃOiïË ¿n˛d∏2dö–Œ¢¿!
…Õ†≈¿≈üAyC1⁄àÓEd‰b]âSÄD1 Ü`¶Ö[}±5pÃÓ6ıﬂï>íV˜üÙgÄd√ÉxõPo∏æöu’zm◊€ˆ0<éoÄ€L9Q°Qò$èò⁄˘?Î”◊, ⁄<GªQ≥uﬁNΩ’®û§Yà\oÏFBç5(ò¬ö´ˆΩ)à‰!ÄAÏqÄ|…ﬁÆsa4ºı˙ç5Í€<g¸yÍÄËËé(ë$˛çÍ¿’Ï'Ë˝y‰Ã~@ø	~ØNo)~j˝À∏!©"¬ÿÓbfF)üZØÙ\ØnuÆKd!‚∆∑ù/±W_J±Á·&∑)mL[)xFÑ¨|π¡‚W*„©Ol¸Å›o38i“b$Æål∆í≈ΩÊï«+C	C9¬®l∂’ßL=Yj<üJ¨H∏≤‘‘8H.·dÒA™ªPn™é>˜EnZõH°@™ßÂô6◊≈û$˙ã»É™‘¶†KcF∫(NûΩ/ñJ8æv‰Ñ…ï˙≤ÇYüÔ"–›_€\“e‘Çwò KÓIò„oCxJ&–äZ˝OïÃ|]∆”A<§ÿhΩ+RŒ}	àÿ¡dÂﬁ
√ß¯ìÊÑe%5®v3∆&‘ƒ[s¬3”≥\)sºKtgE n_ükHõ@#5Yí¢>ﬁ9øﬂY‡oOü…≈ØdãRÊí∫ì>
TÆxñ*”©[».Dë2/ﬁÒ◊	à\@:MÏqãºπd∫≥M¢ÈŸEı®Ÿb•®ƒ%;≤AløF| Xîúπrxã4CÅ
∫ NÍ÷^¯ÊM\Òë›±ªH∂…pKÇ∂’≈~£µ´„Ùú!ÇXE–À≤“ÇcJ‚û3Ä]Níg‘nÖ_-ıí‚ï{‚Ìú¯:ÓplOxƒí(øzÉ∏33∫8∂ÑÉS]úûè∫°@6Ò¶vÚi∞®?uŸy¸·√=k‡ß=≥√=g+Ôπÿ\¬”±+Qû^∑k˘⁄l≠öw¯v◊¶hæ^%ŸD‚⁄G·#Y˝MiÔ£ÏˆgıRVÍﬁ—.ÿΩ.è9RIˇÌiØÁ`z±ıs€õ˝‰íÆ¿3ˆHŒı¯Ç	E+õeıµÔÇ◊bR–8ªT-dç—Ï'¯c˝ûYi∑Sìîg„Ÿ◊ÔﬂI#MéÿD{ˆ3√dÇNiı]À£ö∑òË ét«g%Ç‡zÃ∑f?u≠M∆„‚_Æ„›Î1f ﬂ,üˆ'ﬂ™ ÓÏU"®r∏w˚[í-ßkâı©È:oS…_¥WÒ]oR*YõW$ÖæQKªÎ-›Æﬂ¶$∞p°Ñ)E√W\i_qï˜
Y1%zjå`R∂7Ÿ§9ù‡∑ÖW¸mˆnRF]b·J¡Iâ÷t…ds _Ähja‘O§°Ò?üâ,y†2Ó«TF~CzT`ubâ$¶]g‚Ç™ΩUgÀ´#ÇÃã∆G&fçÌ"”Ä.ù	z\z6Is-\P+9b∫¨Ù„w 'ê‹XÏ4]DÄ S±SU¢@π”*–È®J^∂.˜"Oä)>Èπw$≠J2UöER.⁄J}´Ω˙F§@cL6‡w<GºZuÀ«»ül‚…4ÜÖ?∂éAÉÅâJµ
´°‹µ±¸∂=ß≠4˛∆¿	Qj}ú”X∫Ùû©Eø»ëŒÔ§cÄ/Êg°∆?≥x6zJ6}<p≠I…´‹‡xË›ŒŒ°éøß9—6à€ˇ˛%æ¸<e>q}q≈†Wé_ÁÔÇæÈZ»~I 1ºƒ≥¸ë|5
G/rÖ0ObñÚBY–Á~ñ€óá∑‹œ2ÚÒ≈~…ÔR¨G¬}ÉØãıÁwú°•‹&@i3’ÈT9·K-k44)ÙÏ;¨S/ˇîúë¯É¬˝¥ÒÓzÃx1Æ\⁄fáŸŒa∞âŸ“¨ƒcÙ<&Éhµ“ì”∞§këDUƒ@`ﬁGÍ'ó›E¥Ü`XÇª	⁄,4M0X:ã∏7p£T¬Q+¥*ÍtØ◊™ç™ÆfÄ®cç:X∑ÂoA\zÇÚíG∏iÔÔ:ù.0?§¢êay•ÅW&Ó±skwKª∆i—sMO%“Åï)g[™•I`Ào∆Bo∏†æœæ-“˙Ä]∞´◊˚)ödv˛48ı3Ål†ºœ¨ÇO»◊hº/∂Æ˜Õ"¥â°Éæ æE^‹,Á<Âw†àqÁÍD©∂!ºÒzÑœ⁄aÎcvG∫J5¸)ÛÍÜ´«Q†Ùîéå«í»™‚1‹wó ‘©Â?#≥>Rïf®ZlÕsë±d:†¥π'≥üæô:HF⁄AﬂΩã∂˛«∏teˆ·ÀÌO◊ï»}¨°p¿/yÆOSK©›q¢J¡cÊ”µò`£P™A Î≥∆Ïü”¢M§ÙÏÈ»…å,…®Ér»s™#Sù†ê≥=ƒV<WÒ7˜~¥˚ì1:Ï£Ÿ∑Ó•yƒh†D©¿ËyÂbM¸≈ãÎ›Dˇ˝Ù\041û≠Jëæﬁ5µßƒ"˜'
*m1®?ï_ˇ^Ω•?.ÎÓ∑îã”^;#À¢†	ô\^ﬁ≈àGgZ“0åÄΩôÖª<èáªZ±'Ou±'kájH	O≤XÏ¥DÖå«WÒj∆[§ám·0GQc1sf ŸÂ√Â Ë¢!E Oı·[Ï‘Eú+hóÀ®F¸Îò˚∞ZØª√ÀBFuÑ√–æ%ØÃŒﬂ˛˙¡ „1ä5i™gç7ıVK6ü]‘€i«®Z+'êá:T^‡ï$(3¡ß‰ı X[≤Å∆ÈDΩ≥˝∏«H~w¯]y{“ %™Á¥'ûÆ∫öZ>-©¥à!™øÔŸ†9ã.A?cÆ∂Ÿ”~çz8hÿï∆4'‹¥÷˚*ìZ±≤zæ˚e¨·;>ìﬂqUËbË‘ë2ΩKı∆àÉbÈp[‡‚º][€dk_X#tI„◊ch+¯„‘Ú@¬o’+œK]¯b:∫_¸KµÔo√om{¬´Ï¿wêDß‚Îô{^>≤ø„ﬂ(Õ¿DTÈc}Çjº6îç≈√QºU¯K^∑‡¬E‚s1yr¢∞Tu‰å¯’0Ì¯´e'V≠H9ƒ#«JV0åj.Z-1µbDÌ¶†, V¶	Ø(05ßY§‡µÂCYÑÙ	_îπ´L ªÂ&WEÚ"8™¥,r5ULQ‘UÊõ.ÊW¨Ç+~$‚ïÅ«Ñ˛'¨hø∑)©ÒìX]‹º\n≤(Ú∑©G.≥G.¬vŸàRàÑ~Z çcÈ%gwˆÄªüüTœÍ_ú .ºN≈Ìè¿”ø9¨—T‹wÅ¥Ë?®Y']πÎmÇ;À.Å‡Âöˆ©ı<#]IybÄÔ‰>§‡ëË Ñ÷(ô+Æ∑„W∏M≠ñ{ÇÏ∂-O.ò+NE;ú¸J%≠ô($∏å∏7Ü†IyQQÚ¯∑∏[…§≥omMï÷Ä⁄Fæ’ô8ÓËòƒ(4Ù(›)qkR‰2eë.p∆‚íö‘‰;J1Oh8€¶ºË/<wGÂuE—˙HÉeÉm˙Q∑ñø2«•‡‡»K”Ò&˛?:ìÎíH@ £›àÀàí0OÃÌ–N¢”πº_˛ñ›6∆ÎOú⁄∞ƒºÍs™†≈±_!Å7º}øI⁄u%Q!ï†ﬁ%HîÑ›/®êò€√©ªŸõ9ƒ˛’EÍ6\Lô]}öÄ:+ÿΩ∫7ô˝<éÃ+ÂYÚ¡É«Œp}q¢X|!c®◊@Á¸–WÂ·ØÒ$π2-ƒu8*a·˚v∑F“r≈ïOí|ßì6ª¸%W”.âxrù[¢\ùí oá˚"ÅCJWQ;WtÓ"ë™oáIπä„	x˘ÛË±ˆtL‘&ﬂ˘øXr¨X a`¯≈ä|+«√ MnÎÜ4±°#}4…˘9/ïÓTﬁ©yi !Ω∏ıµÄoôË{ÈsÇSñÿ3•û—åø•≥BOdßÔçî|ﬁ8Ìÿ•í?I÷7ôÙ∏Œ~ØLbOF'ml¬?⁄AÑvyC»F‰>»∏ƒÊNÚ∂J•“Èl&.À¥õ¸U"¬‰èI
Hﬁü‡ÕTÜì4M–u{j”ˆã≥üpÍ,‰9¡‘…¸~Äπ¬VFH¶iÊ¬&ÌbÅf‰©JkE g¸≈Z“Ã{ZÉmö˛≈öK,°Jt¡Ft›sœæq∏ö≠]9ö‡Ñ·jÖi`_∆&©,èaÊ≥sICeM|È+ﬂMMiŸâiˆ»èµO∏UÛS",5=|¯v¿“p‰î#Z^JoÌóœô
Ñî¥t7EJBèrd=ìK†ÉP`.™	Sµ%“¥Q6£·txÏÒSÍ»È;ˇÄÌ≤¨l†ŸìõaòÅnQ©˘à@EÇÒ{PÎ≤{ú„Ä{(8qÜé∞Äø‚RÀÚhÄê$@VÒÀ! Œû~•À‰Ù0O&D¢Bùüf>ÀwÔ4ãèÀ™]å˚æ§Ç`Î±ä/0ï¬j>»£L£1.é˙˙9◊'√pºBŒœÉh ¡•¢ØTLGfùª4ØÌm=¬ ˜ì¥≈„k˘iåôZj§òP°;‘MRjè&ºYz3=ØMàπx’∑Æ≥˚§î™>Abã8ÛBˇ['®¨¡„‚IJLsºÉ∫ÈA·ùÀíYŒ™ÁhW‡$Í˚kﬂ’w=Ò\™É0!≠ÊX‰O§Ωüw–v” Ç∫ÉZ9öm≈oﬂ`øcÿóPÁìM¢6)Î˘Qã	us+vØ“\j{F—°Àît˚y|¶öæB	˙L]ó∆Õ»£O®‰!Ñ¡óhnº¥V¯4ƒã‡%Í.aSa∞ÇÄY7
•[7ÌÑ!–>≈1 ˝Z<%aõçÊ œüÿNXˆ	∫Ù—JXeâ–Êyí7<ŒÒg•ó$–ﬂà∑¨<a„˜(Äàˇ,&,
Ω3Ç©Ç®ÜL
Ñ5`¡¥á·œ¡Ög\xb¡i·“$Í•%ºzb"˜…ü†∑!(}g„˛7f”dòvÒÏSÈyúd*ñ«<Y¬çü¶èsË∫C‰P⁄†4··n¢øƒfãÓ~f≤7£€M˜˛w≥h¸CÓÊÏ–∂î∞∂4K ∏q8Q&Œ 4†ê>Y Ö‘	ï'éµÈ‡>#Ren`UL)◊ﬁ*áÒM4açì 3ö¨ok‚&ûHq¢∆ÜI‘/Òënˆ	O“7ë´n≈sutÇ$XEjÿW£§àD&7$z¸ØP$x\∆î√ú	a%íw@lÂÆÓÜ•‚zî‰ûYTAé*Zr_P≥Ji;Ã"jáíÜ2¬#7û[ÓXŒ-ZÅ8AÜ0|ÖuÔÏáoÏ∞X$vjy}{‰3J¯kh"g˙Srï¯TÔÌ∂è"¨uìŸ£o¶TAkÍªAŸMhàûÏ∫ÒiaE9åqê ^ˆ≠”ÒAs∞∆‰¿ıOYT∞EWˆ ¿î°$èÄ©4´àz…D∑œ ¨U?©^Ã˛{´—dGç≥Ÿ=m‘öòu¨›<¡J%MV¬?.ZØ/ö-÷‹ﬂNK6¥kùé>Æm‚L¶wS85Ë+ÉÈΩ7AeX¯äL«Ái∆^ıÄÊ≤	s>≈0Dˇbî.<M©'©p«{ÅjQ,5Oêêá9£Ÿ_p@k˜	_åxÙsRÚÇ`ül˝°˜¨\◊ù-	frÖÈ˙t—HJ	é˚ùí(‘°ÒËédù≥']}¶„ˇtˆ3N:˚ÃÚÌ”â€"c)Çk£CÙU„¸|˝^*Nî~Ú∆Î¿|0WÑ=!wÇ.b»FΩ®µqœÓ$ÚA(=ˆ>ñ/r¥¸zjrÔ4ÀdÃÏWÙÃ¡ú"';\ãLD•–$ó+Ù54J·«?„ı|Pò∆-Ë¶åYác{#Õ8U
âOi€sø•‡·[ﬂ¥|h®	û”€jdÀL“nS–>ì=}ƒ,íC»NÉ9UåÊ-N3M<£≤Î¯„Åı˛Ω@]#ƒ¶º€nèøπ Ô⁄∫ëîZ√«"ßAQ5a4§*Ôåzp¿JÿsÃÃá¨Œ*õ7¡EÃX-ˇΩæù]ÑkÑr”b„„\(¯AIë[	≈äﬂ´⁄áêûTı„ªƒ~ N.≥◊≠séPHàH≈8y©Åó3ΩŸ°¬°IN≤* æ›£CsgÌ w„EË•,∏
Ê‚£/Àãææj8†áP8Ó∏HÑsﬂº˙ Övá_‚W√y;ÃZçŒ≤Oπ⁄eÿ âºÃÒ£aTê√L1%-cFz∏P˙\“…‹™∑_üÇº⁄l≥7’ì&¸…⁄ÕSV€y:uzÅ≥∞˜{y'îò~‘7;Z:®ﬁ¬¢l"ßú⁄_∞∑>q…M<∫æ4ÃÓÕ-ƒ˘‡_Íâ€J.›¬¢çﬂów2•9\4”K#fDmjEª8&ñï‰åŒº=M
õˇ$ÂDkIæU%+ØtÒ“jsgx.óyÇÁVµ\˚ÀÕÒJ$≠ÍE„êw˝ÎŸÚ¶Ûzª›¨û‡#≠´;æ‰\¨sçı„¥äó?p∆$>Y@$aø)Tqäã¶xRFÎ∑På”kŸπü{ÓM)U¬˜V∆·¡∆µ >‰
q^„»—® ¶|tï∆∫·ïÂ6F?ú8îï£∂Ë⁄Â@\‰	s¥Ãá¢ΩÕ£.öGQ·tnÏX≠“·-OıÑï‰ò?yèÍ&múœmî[@$ŸŸ6¬v∫ro€Œw∞√–¢)‰q˜~®T*t~MÏ.ö:úª7–;”+ !SóÄ†T’~4ÆxñÌ“K[øc<	˚›VJö-ìF °£/∞œ”Ze±¯l›°IMáÕ@1Ò@XæÁ¢åäkçW≠˙U÷Æ’◊R”(çõ"xDzá°d«πh®Ò:˝ÅâΩFhwäå®ksïº4ÍâHöÙÊP_∂∑+€¸ü-¯gß”µ‘Z¶í‡/hb†±”r+ÃÈ
\á“L˙Ú≤MÄΩÃ!~ÉH}˙£y&zÌtˆoFØ7”ËXbá„•˛zü_Z:k©¿ÖXñ¬lS‘u$√Ä™›yıUì4∂Vµ]{}ˆy3//JÓQü ØÍ√Ò¿}o√:z.(∂1Áä·≤wÿ∞{˝π/‰g±»;pQxï'2#.f≈”u⁄á¶À(4•VOO∆”ºÒCLÚ¸Â/fT,®I"˘"[∂ÉsVI¥âjÊç,dı3R;?∆ øØL¶!=3†:˛Œ∏GV÷Ú˙=º[˝ÕÎ?ÂjKèazéß"Â¸£<Ü”ü™ﬁˆK˜o33˚	+0öé[œÁµ∫ˆ”‰æë‚jy˝A‚´û}bÉ≈j¥¢Yd≤)èaÅL4ö`qB √{rëq˜ÿ≥}^òF¥¸ÖÿËë_»äI%»Ê!—†Ù“©4ç—g€8ñ3G‰c“˛ÒÏgﬂô†ﬂh‘·âÀ∂ÿ∫{C1e^ﬁàï	≤Œ6·(Û~Ω¬wÿ= @.˝ÃΩg’~¸´F_Øó≠m’‚wP’%Òª-Ë÷ÿπ≈N±ÔŸy„ü‚ØÜÕ^˘ëf®òI@”‘˙ë3∫&5rZÙ©œ~Ú—ëõ€–§ö+iYﬁ\ÑtÅî@”G„êœ∏◊-UÏ ¨˛!!kH2WfÈé¸jÅË7”y∂-pR\cNÕ($„XTÇŒ+V-qW+¢Ì. Ä¿j≥üªï¸R≈⁄¡PäeÃêúÑGÃ/ªµXæ´›}‘∑$≥ä÷∏>	ç=√ ô¿V˙ΩA’éEõãc•≤IëêLåXnÃº¯¡Ì
jH
^óµ≠ÅÂΩgWH’iª4|0≈äH&ı–ê∑…úÆ©Î:Í∂paø√óó?æÉW‹ø3(îi^åUØ4™t©«Ïì,ø≥M˝ú;π~vñ!¥ä.°öÅÒ»◊˜∂Y◊±¸U6%πxuBÈåË∑êRDÊ·X¬U˜R•Ñµ√Ú“*l‹gó'πK1©/sÁ·À);o˜·vû"≤>Ÿ˛0—@˚C•èãÄ®À=ﬁ›∞HìöÖ	¢ñÀ%ñ±eÒî[ ‰≥	A^ÏöºC˘ám’Û¨˜ïûÁàF∏ÅvjMÆa◊ﬂñv6ŸSVf•î#Y‡~üÊã„øol∞{¡D.Õ[G,√é'ÔëgqD-\óüÆÄk`éÔU–ﬁﬂﬂ[ÏΩf€&„Èt·5,‘ì™Å∂ß√°ÖPèyç¸<˘äY≥0¢|Õ3÷H˙ƒÓ+Ã-œùµcO§Uem∫‰πz^>"#«¿ˇDäú˘-¬◊«jª,nÒˇ%Mr®.2…A·úƒáo_˘ÀŒŸ»ﬂµÃYçPÒ:-üV^3Vôh∫}∆ñ˘ú ì•ÕiûÌÿuQË=≤°ìû≈≠gÀqWÓc£*a°–∞÷u'ìôñ‰v€≈∏]à8…£â§£Ÿ0 *¶ÁûI|>1Ê« ìø∆ƒWGÅ¨»Q˛ˇ∫-≈E0ˇªﬁdˆ≤68qZàH=aËå∞‡!œºÌÖËÇ®P :F35qn‹ML∏j¡;øô"ˇpßlõ≈lÊxû}„ˆg?‹ÿ¯’ôXd¥ÀæÊπ˝sä™DT!Ã≥HIπÖUR÷9^2¬,myµDîƒ1÷´æs:ô¬4©^j¥äªÓ8ß<üñyÅ)*, 8Ÿ£ÆÑ∏{˘õ¿,õCJ}öx‰ UNê!+ŸéhÆ®ÂA?çBtt?ˇû≠_ÏÏlo√ˇ◊#Ù(ﬁã„·¡Q∑Lé3v– 8rnwrΩ¢ïf7òZƒ=’;€wf?¿≤t\vtN$!j∏ÁÔ¢.∞]vv∂v¢™êèmﬂ¥lÁg'•€w·œ…($î3E©˘ütêÒZi¯v{“º@V´¬o€`n/p»¶o}yãÅ§Üÿ€msaMs•Oy∆A©¡ﬂJ@<(◊:9åU{!^…KÑ$J'Hlı•:5"è≤îQâ2 „úÁênæLdK>îÏZ∫3L<ç±L)˘ãﬁ¨m¯!†Œ…Ü√ûÂOnHëh&G"ãµä…†2o’∆BÄ¸ôCÁq6⁄µ¸Î∏d∫'
ﬁÓäΩñ∆‹∆¯ïB^ V¯eN/¥Ï≤|’|kΩ˜◊≤«±<Lwj3s4´~Àü‹ ·YÉY!8<ﬁ¨yX‡ç+y4 ÚeÙji`r•3¶d[»\i„°ÁJ„øyﬁx>8]È†i*æt£è¸)VWxl¿ı¨ŒôÉÿï∑|8@ª⁄ç’Ä€ï6ä±¥áùAs |f€+√+m?ÊÈ,òOÙaºÚ≤«<O≈ˆô}¯è∂W¶·1Øp@~¢Ò¡˘ ˚Êó'ÕA˚â<6 f ÛÀüG
ÏOÔ‚R@˛ Î/V∞
I∑s(≠≠*X@m$?p@ΩˇÉƒ∫¸ Ûµπå‡Ç9GªÑ@ÉEZ^0Ë`YM@PöÕ≈sIwöÔì ˘≥∫∏µW+èAPõ˚Òs˜gi±	Àòë9‚kˆCƒ,,£« ∂√¶ç9~rA“Úgu1  VÔ†6˜·cÊÓœ™‚ ñ1A´çâX¨áK€mã4ˇ`±JgW»m<Ñ2°∂∏ö¯Äø∑Ò8€(æ≈ﬂj&ìg«a»≥òÂ›üë’‡í¬î&E‹Ü⁄£ä·Pùﬂ∂˙KZîBqjè&ÊCis±5ô+DÛèQªÛ@1"J£À7¥â#Q⁄x,1%Yù2ç/QﬁÒ`±&ÚÁÔq'Í"Bˇ¨,EiÂ«¶®S∑ú€íbV‚≠^ˇÉƒ≤§èy…q-’ÈƒZ¬∑b≥`˝≈vZ¡-≥˙»óú©{<Q0sL£…1ûïñ˛≥&| ^oƒ$ÊF*∆éäÊ∑ó†.˛Â Kl„Ÿxf]º€âàõûÎêáﬂC=¨ˆuåoÅo}´„⁄Téﬂu◊ê\[~jZ|8ﬂ&∑°º˘”ä?8ìíZGT¬j^}èG%ÆB¥∆hR¢_ﬁnπAÁß|mÁÀVf;õlÁ	≤ë®˛Uº™.E–‹óAì,â
4`œ±‹L\xo[ﬁï4B8÷üÇÁ_„f®¡f¿√WüGTÍˆ≠ëüí˜˘'ÀHçü∏êî0Ç6Í‚
Õ·U™›.˚Ä‘∆˝\¿¯ÛîX^∞±m√nƒ≥c@ÚbX˛∏Ú´2◊µ√Ÿaƒ.ù‹Ù∑;∞πVåªAúªÁ∂Ôª ]ÚòLÎ °Ú}ŸßñQW˜ì~…c^b2Í.‹9˛/‹éı¨h»Tq,ØxN⁄xCM˚y`ßëÒ%D4„[qãÇøAÂôî•˙∆-ç»àAPT±Ÿs`¶π…Bı˝LEÈáæŒD8Jø1D∏£/ jÍj‰±LP_ZıøîìŸEãÜß€9Pœ#~ÜiY…]tàÒ„OÛ‡∫yï'ÕVù§Üò®ÇtÜ4îÍ‰D¶∂ÀÈÅãïƒLpÛ≥ùÄÖXÓµ:ΩÖÕkaQ÷*jè>+›)s º*˜Ÿ°OÈ√]•µÔÂzqM`È¿/ec∆·^RÈmsõÇ!¸áßƒ7òÇ}
5p~ºöG Ôïtõ¿ÒU≈ﬁ±öñ$8ÛÚ_Øº€÷Ä√|±“++µ>6ÕgõÎC2¬sô‚∏b\Åó
ïÍ¨Në¨v( ŸØë,sZƒ∏Q)°≈AwEPG_Ò∆©>f¢—	ÉjŒêï;£ûÎaäb!
ı'a°êòÅî?0îÃ8
®0àπò'–¢^rEì ◊2åÔ9µáWºä˙Ö3¥Wπö‘pU!iø“’9Liv7ésIØ˚âå◊©¯òı⁄q/)Ì5ÊMò7ì∞ë3ﬁƒ	ü&N<ŸNÔûá5@#øãÑ62‰©Râ◊'˜≥lÑZ'7®Ûù*7Z>;Ê6Æ"N¶XFÀ?X(]•ñB?©1y!q®î6{GgÍ≈ìwîdööz
Ump≤⁄åëñ)U-%Ÿf.®#sËL+£ô´EÌ∞±‡À˛eAxfTÏ°ekO	'ˆ>Kñ@OûgA8ÙÌ ∑‰‹^∫zñ“¥3ÑÏìÔ64Î∑ß˛Ñå'†ï9}–æ\vNG l∞RÀÓOd\€]‹z®uÌÂtÿ‘wårÂ=óD´æ‚ùÙ…ÒË3TE!Üªîã†„éz\dF€"çêr.·!‹@_‡&^¡EFw≥ë≈H∂·–NFõ¨6˚wxpj1wM¢≠∏Q|>«>B‰VÇ°â0Õ}k2˚	Ñ	\•+kpMﬂΩb;±ù`∫ŸËoeœ*ª;ª[œw∞ã>ºËõ©-∆LéUzÂ√”‹4*!d˝ÚôÙÎuyÌh˚∂3ò˙» +¨Ó	¢∏qÕ≈.öÃ‡qxb‚Ùúé≈(ﬂı>‹B§ÃsS<òÈl_∂E†ãkˆÊ2Ò£ΩÄ∂æ‡j©≠ÃÒ)ëÃﬂè≈
ëü3uA+ƒÛhÖ¿¡Òı`[bπXm0˚éÍ®ƒO∏IB¨¥∑™HÙÚk¬/#AçdÂé¯“äZæ∂nl;eRÑÔ*öR-∞ã`ÂÄ·ÑÅÓøÛBœ¿Üè•¶KËéø^3DúX;ƒ∂∆—x;DqC§_ˆ’á2hÿ¨úÌò—
y˚¡‡áµÂ^ä$âÎ>àdx¿Ï`ÏU˝¨ﬁ™ûp€CÛÏU´˛™:˚ÛÏüõ≈R–=ÿ
ßdòÇc‡:Œ£ö|Äç0ıòsk≠÷†•ˇ_∞	`'ug/›∞_ƒ,’¿uqÇ¯Aäáµ@>˘≠OÜ¯ÓÍÏ ˛0ôºlªÄÈ…Úw˚ˇqn˚¡ﬁA§Át›Kâ}özbµˇrΩ±™e≠è‘›¿Ñ€´Í∂èqm†7:Cû≤ct‘˛#)@“ãÉ„3ŒQ.´Ubi.ˆûÆ˛qjç&dX‡Pââ≠XsÄÏÔß¿ëÌ€Cò_Å¨è‹E˘ñdÑ;ìÒÖBMËK,øíˇ∆ó‚áF˜Ä˘‰‰»»¶ˇŸµCŒD…	_2xõ^8¢aIÈœ¿}ıÏ6»¿ÔŸê¢÷X@ÛN"å•=±z=MƒiXJà∫ÿ<f#ËÚ‡éíèì\ÒÎ<˚Q•kÏâùñ0<˛A¸iÿ√ »_∫míJ\?b:$Z}ç}Ÿ'∫ar≥v«?ër⁄0‘MßZíS\%˝y"ÕÁM¨ê„/¯øM›´¥OÜ[wé|#Àqe

ù?Tﬂ<Üÿ`∆1Ê⁄?ºj≥ª∞jgëoì5Ωæ5
≥VËé ÓÔπ‹Â¨PøYæ>ìÀôˇÆﬁàÁVoˆxò¬•5©~Ç#µ&ˆ–/Nùy"º:π†{ìÇr∞áx^s$_T‡á˝üˇÚé8`Uò©ŸO4ø1ïIÄ–ÕJ«•√ú”å~lÑÊÕAô'Ë|c{‰d‹ŸÆ¿ˇÿÎjf†ìúcÏv≥Û$l=üÍÜîGë1∞s=Eõ!V{ÁI{∆úú˜ ıñ?a„Ú^:O±búV~‡e*_N-mË†ì¶Öπ¨û€ﬁÏ'óáÔ€ùk… 0ﬁÓ@¨››:3ÄäÂÊ#évö∞Zë&;O~»;92JŒê›˜1a1∞èwör ¨ÙqÏ—°Ìﬂo≈/Z#˜~„ùÀNÌ
hNrûËŒE¯w≤¡Ωˆ˝ﬂ˛ ÇI√]I◊¨—4Ë’gprç∞zFØ≈‚0˝\JÎ@êo…xñÁª#2Âï`¡*âÅ;#ß„`∂‹…Ï«ƒè=gh‘/#ÆXºJZ°LÊ[Vb«RR‰WSÑõú TÉ€óŸ¢Ü wä»xw[ﬁIÑ‚Äz¡É?VÖå‹<f±°ÈßÅéí‚ﬂÇ≤mˆiéû9øp{˛`ﬁpëÃ¢ã¬!¯⁄Œõé∑HòÄ¿™Èä«@k6f,‹yJ9q& ~‡hÖõ}cç&ò+‹ﬂ¬<F◊n„¨›~¿÷Z≠„≠∆yÎ¯·ölN	øáôà*’jƒ_ü°ï=»ı‚ã»∞R¨fÜ„‰∆Efl^íQ˜·À+nÆî‘m^Û(··%ãΩ}ÅRã„,ìÄ(_®òEM{VpŒ»œ(÷»ÌË›®Ø›(´)äTù¡˛.≠„Ü^ﬂ(–À®Ò7 5æ‰›¯Tôº§Ã;(≤BEª‚yΩ%Ã∞öuÍnÍÁ«ÛLÙNLˆ36QpÈ·&jÅ*ü›,öÔ.@Ûºg.1]Ïü™0Íˆ¶⁄ÎrHxÂ`f76Àç∆yK≤Úh¿\åõ(Ï›¿OË·+ëŒá¿ñTªÎLãÿP£n¨á6œT°W=ûƒ≤™›%™Ô
ÿ_·\Mi·Õ}RyZu¢‘	Òÿ?ç8ç…"íùÃÆ±$+‹Øÿg˜Aˇgî÷ô,~…WFhæ@®^üw6µµôãJ_kÒ¡3L«Òû°ìÍj!’í˚f—a”ç†ÄÈYM?`/)ŸgÿE¡ækÔ¯ëÚ∏z˜4ËùrJÆ§èß‰ åéû≠ ˚@ó<t≈È†Õ$ ó.~Ãù≠ﬂEÓL⁄˜∞‘!B>
)f§º~Ôc=Ê_€ˆƒ(_)~r˝ ∞
û1–§/Bˆ3«S<ô{öy_2ΩÕ„€Ú^äÀYM»£5IqHï„Ké,ååsY˝ﬁB·iúÃawÛi∫†ÙÇt-[≠t‹Àíé{i*Î|~bÂJpÊ…3eUìdn
>"œö∫@qÈ•kÍ„jä™é?,QW>BﬁÁÀéΩ*ˆä˚«H—ô¯ÿ 0yÙ–ﬁ|îï.ôZ=
6Ùwz0¸®¶üEËaÈvü‡#CÎœØÜ`ä≈•‡ÁÜ‰≥£í	ÌVSL_›‰≤àÌKÌ⁄á‰m´∑È∆ZzÃ˚vıv€‡£pàòÕ…t1k'~{àÎí∑æblSî ‚V∆ÂÙ4ÛÔCÍ∆>ª|_\&¿?H≠9∞àDRôgä-O(î°fŸµ@√Ì&-Qíôx≤àDjóTÑbF*ﬂ3{t=Z#¢ñã`b/ Q,Ô¿ùÿ£È∫Í≈Úº2ØlèRæ@œ ùk˚õ©-Úß Ô”·fH;∏ãé›uBèßñ	Äm˘}Õ±ß–sA(∞(–“v˙îÇﬁf>L§æFK¢Œ<Ã’\yñéGoy¨pØ‘‘}ta›∏˚ïg[_g‰ÆN…æ_ «íﬁ%√ÏmÌG9√'òD;ﬂî_="#≠íR )„*)◊P[ÛQ#á–˝ERK&#¥—ÿÉÎx∂Q•Œ¿““Iˇ⁄ñD§^¿tåp«(ßûEˆBHeÇ4ÏswË‹0≥ÿ*Ëv&5Œöo™Øã*;n¥k’¨‰”Æ∑ﬁ4fn≤R€≤⁄¨÷<el’öf{—óXı.}€ªq:Æ∂Æ¬ƒY£…&£Û9µ^´ã‹ç/ôY“Ì¯;Ü∂ﬂ≤{˙«Á(VΩ>¸SwDVNóÚë;¡@≥R«´∆˘y¨Sæe˘î/Á‹πcØâÚÒ∑À˛xdßÿÔ>ˆÙYw∑¸ÏYÔìÚ~é_´˚ÏìÚ”nØ≥◊Ÿ∑Ïßœü≠«éÔ9≤oDƒ¶“DòP4X£(3Ÿ¸Â∂Ä=∫q76Ú <RΩh5jˇ∑®¥°mΩ∆#{ÛÔ–çóSûy•Â–Å¯Ö5B~óx3L πı‰ªÓ.kﬂú‡LäÀ%yv7Âyÿî∫µ)C8∆ìkË{’5)¸kòöo1Ö_Té8ÂŒˆˆoÄ(WPùBWm¢ºìê	•êI•Û(KÜÉ(IäbT©a`R1å≥„Tß √÷ƒHm±p«ùBˇ@Ò#˚SøŸ ªÊ°ô©Œ∞œ|ØÛR~ë˙û{f&/◊N\L>Ø©‘¢ÿ5˛ÀΩ˙
(°å´îê\†aWm$à8“ÉX„5∂ï=‚|uD7ªQG”–…˘ñ_¸©íif/ﬂ˘ˆ‹ﬁÓ}ŒÈâ|êFébi§©ø≤#4*¿rÊÇ∫qÏ¯ëÌyÓÏ_›Ïí+aÀ≈KØƒÂ&)÷·»ÌLπæTdI0˝âîBTt–_T ˚yﬁ®èÇ:ÏìL©¯Ëëg≥ø1˜,h´∏\˘#OvA%i õr*Ùqª|áR ﬂíd$d¢çä?p:v©¸ù˝≈˚ì^^Ö&ıCô4Í¢¡gñBËÀn9K…0°P√VΩ}Q=j∂åœö4ƒ∑ƒp∆¸<Ÿèa(r?jNìëW›åorùr"Y'§Oü™à.Ã#è2j∞ÎXâ¶ﬁıríÚÊ‘`›]fP§Üÿ”¢}nÌŒTÍ]Gù]‘kgÕìÊ´FïÅ÷”<y=˚ÛÏ÷€¨~
_¸cµU_œﬂ)}IÜRÎrãRÌÏ¸ãñ€ÔŒh¸ı{{ª≤ÕˇŸÇv €€=\yL\1…aÇyC∂GòM∑√Åí≠©ÖÃ≤1roƒ…qawFÓ`ˆsﬂÈXõa5eV≥±¥◊"K∂hß≥∂≈Z_Pæ∆Z˝‹dÕÌ1Ωvˆ6,¥…JòÑéj{ÊØ –r‘≠û}ˆıùÒÿèri•„'»˝EÛtEl˛ÈcÂÎÓ0…’k‰_WÁ∆#â{◊Nı≥ã:;õ˝sì5é‡{„∏QÉÖ vt(dÀî<∂ÉΩò7“Ñ=JûåK·Ωu˙©jTxî˜Ñ3TæË¸ÎHÆd?ÔÆã1Èeˆ±tÈ˛›™z2M2œc%Ë∞Ÿâ=∞·1ﬁÔÚeàGıv≠’†åΩÏ®ŸçªÌe≤Hbè…“ Éºv∫]{±K&¨Kä©à_ %u‚≠ÚŸ”™„∆Ú™ö∞„¿èqÆ∫´ÎG +%êuª”	Í±ô,∑òñ:.?ç,m|ã´´A∂Ÿ(CN‡…∏ncrtj":-COf◊Òláù˙ÙﬂÌMæµ»WÍç]·d≤ál4ΩÅ∑BôµÖMLT>=$°¸L<NØZíﬂSXq∑ã∏ΩÚ‚ €:§ÂoÔxÍg4pF∂∞—ˆ[ÌIª#bt9ô%ºN´‰*YiŒ÷»
¡>9GEÓÉàïåÒ∆O’4âƒV™o™g≥?Û3œp
r{Usác;®P±•îßç˙w«=,jóñ◊áå‹áı∆J#Æ/µ˚πÎèÌÆ’
äH©6pß]÷∆ä3}{cì≠—^ZóØç4ä¨€›üzò1≈‚?væûé}fQ≠˙	Â/¡ùÏO1;	∞ÉŸèùfR—Jÿ]+˘„\ï„Mı§ŸBÌî˝±≈Boú)èâv;lÿ=HHzyÊqÏ∆_WèZMj˚H∏ejäπ∞˙SÈDŸR70æ‡Á'€[˚€s0Ô∂âdÆÌL?:J‰ÛL=ÚÇ>†»ŸÕ˝kœ}]6JÇˆ|#õ4˝ﬂ]O&cˇ`kÀ;ïo<‘Ωl5´≠õù≠ég„V˘≥ôtÌ≠O…~ΩÛd˚˛˘-jo/?æˆøΩn5p?ÉÇUﬂ%'⁄∆˝oa—]ÔÂˆ˛'œû|Ú€´>ˇ≥Güw˜f]%ˇR"Z—ëé…üΩfˆ¥‚ÿ›g◊¯/’]±ñ˚¢‹çXXƒí
ÚÂoÕñ÷»aÑπv∏Â◊Ã3ÒGOÚMÏ®πÔïË∞]zi~ëiH	.9ÒWçë?ÅÛjˆóëÌ≤8=Ä"åèK≥ÿW#ﬂDd˛&q&t&bƒ5@âΩ
ªvΩ≈:≥ø‡xê¡wÏ¡t`y≥∆cb˘ˆéÿK‹øˇÕ‘ô¿Ô„Y H90”-LÿŒ†ü¡vîHj≥ÂN3—ﬁyr•ü∞ª¡®ìΩ0IWE»Ø≤“wc„W*ñ\¸Ü
›¸Twe®Øhû∏M‡ÿ∫qAYv@àKŸdrÇa	ùd÷ZívhrjÉ–@bƒRèÓ'±£;EÑ3SEƒ<˘≈œnYvAå‹am‚d’ÈÜ;ÛÈÜoO¬ìÀá©Ä	Ù™?®PÍQ–º™éò2”‚ÊM©Ì‰Ÿ”∏Â’ê¢4cımÙ»õEm4©~«¯f}É™+?≤@}∞0·P`±ˆ#V0ÉãAÖÙf±iú7[ßU·ã™5OœOÍßı≥ã*
ˇ¶‚>åñ‡Eiƒàô®DîeíYÄKÍ\‡xãZ[†™˝o√áá„ÅM≈B	? 17aEYÍeÇDùPÎ$<‰Và%£Ä&∏Å1Ø4ËûNáÑ8ÆÌA®r5˝‘¬é¢f7|÷f ∞c’–ésEöËXÖ=¯°Â®4àTÛ…7vˆmåK	≈õ˝ÿECã;e›ŸèW¬Ê‚ïUJç⁄i{´qﬁÿ®∞jﬂÒ§c·∫ÖÚKKMä‚¶Tu2s^ øœ≠B'ºú“Ü¿AÓ]≈ÚíÇ>
d^ıy¥—‘∞;êŒ›˚rh!qè“êŒJ≤°≥ó“ê≥Mÿùg≠Í¨c ,≠u…–Zg'çZ˝¨÷®‚6n≤vµ⁄NA—ÚÿÇâ{âbB>êvìBjÉ€?≠‡ıK[¸ Ïx>∞-Yß‚¥§ò¨ùQk·•uÎ$jt§ñ˛„ƒ'.Í•JØ£´ÆwµãV∑a˘câ>@ñÌMˆtCg8;≠∂/Í≠ı{x*Û.ﬁ+öıSíˇ’‹S·±ı5º¥Û¸˘¨”ÄL≈R≠ºkwHêè}SC'ó¶7¢†yk=p1Âøy~$Än4§∑ΩÓ-àRÊŒ|›∏»An0®¿ëû\√»«.ëqªnXKó«⁄Ï±8êï	ó=§6T˛ÌKqøcS!C‡ë4ãÚ˝ÏƒÓ√FÔzd|Må¨3ÓÈZÖÀÒ∂‚ı;o¬§[⁄w·â∑%Ç=`¡£òú‰Ù\[˛uõó;ñÚ~¸Â“ä‚=êqµ?ØÓ>y
(‰gi‹hÁiåO&yRÙÓWûEE∑ÂÊ£_/˚‚gÖK%ûñÜˆ`ÿw.7¯÷»º(¯Á†‡Srrß‹©öA≠˙Y}ˆÁÍ…ÁË çdè’√Áüˇ>ˇÿ·ÛRÙı¢¯y%ªìôôØçÚ‚/Ko•è◊	«‹‘Y;ƒŒ–∑˝!∞ˆ	Ø|;¡√wü˙#≈ﬁ«Ì©iÅ"EÅv„€Ú./Ä∞Ó‹ÕtlqWMd≠ﬁÖ≤ëeZ„wT8ayóÑÄÚ„AôñA˜Ñ⁄äÒyµuQ¿–µ4ø∂8N´GÛ≈s §{@jrê¿”‹"≥Fi6T¿VÚ9—gSgÄÊ±›ó£T™⁄ÑΩ/iká;ï,c±•H@Ø¸HœÅ∫RßÏÏö∞q]⁄Ãÿ°Å≤‹]7tÎÃ±S”=ôæ=tÇé71\5_bs
<“œØ~'ÈÕ7'°Œı√´óIˇ›bmÆ˝Ú°í^mƒàåv9¢áˇ√mÛ◊>’Z[™`{<hí6˘n¥…Q„.5HrgfXvÍ—j7xáﬁx’™QM¿–´&àﬂ• =ΩVà^î;hL8!ÑÛ.≤›G–Ω“ùl~πﬂX~ßjÁ«"oUÚÅ©âLG˜Ï{vaÊ≈g/ ﬂ‘Nfz›~}RmåÁuµa.€≈1˜ò,H∆]Y1h/a±së¬©Îò\M…ÅQJé8àTY∏P¶Z“3ü_Ÿá¶6ò˝0ıßf√⁄zCûs∏⁄˛H⁄è™qƒqv©JÍñyIMqåÌ™°*ÁV«•+tå‰ñOÀ;µíûˇ=ñ_ÓR9ô:⁄≈ùí≥Ôå1ºá!q≥ùø˝H	GM÷¸Ïã˙ES¬Ï6ô‡v‰©*ap∞ìu}•¯K«&µWéº°†Kpr7NÆ†«Kπ™ÓF‘;–≈∏c*‰^ ≤Òkõº]]∞≥ˇ•Hˆ€•°Õ~Ma0@á√Ÿœ›È¿•‚ï}—õ0XŒBr«≥'˙`7Ÿêj≠˘õ8#±ï
é¬¨8˚Xöè~`¢i«ØÃ@ûïwÉUÊ¢:ŒƒQC¯ê–ˇY}≈ú“˙WïÈ¬tmﬁÏyA€rER ´É©∫%::Ä¯…Ì&ü*ûm!¢¥Uå™bJ~˙∆´Û”≠∆y≠∫QaM?JáÎrc{∏* 1ªgO¶Ñ˚®EV‚Æg°Ù√—Ü`Z=å-ÆæGv∏'º∆¢TZQr“¿ùáË…ñÇ€ ÅÜºº˜FB© %åÅ—u›≤Ë{|—· k~÷jº™FÀ]Ω®√Úsèvùµ_ü7AoN{R›– ¨t«é=K˛Ç@É@Jãd‹ÆÉŸ«ú+ác*ets˙X◊¶…üR·Qƒ_>˛VQÚp∂~#ÜÇ'èª±)ê∏]ÅéÇî{X?ÓV8Eh⁄yÄƒ ŸµÎÒıÄ^{RÄ◊y÷ÕÏGüB:÷S?Ö9†JˇxmM¸Íxº…lÆ¡ —\[CzrÀŸÉç≤ä˚bY„¨
kv~2˚é@Î÷>ØüµAÄU∏6é‘wy∑à/NÒ8(8,-«Œ6+uÌÔ68å
X¥Á‡ê-˘àœ¡ÜYÄ?Üå€Ä1ü\ãÒ;ëãÊ'0Û0èÄ 	éº%[+rœ!.W”ŸOﬂQ:`ºõ»;q)7óœc>§xEº"Û£≤Oh)Œ[Õãz9™bd^È‰’˘—Á´«®M¿
ù4‡∑∫È~Ç1"Bñ®OK0∂∫Å´hGÖë/Á ˆF≥Èd¥É]Ë;}ÿ¶uÂªrŒπWp‚Ü”Øœ™	9BÒÉ«AYãOÏ&†pb¨tù2`^·2Õ˛B±Epúÿœg»ÕÈ 6Ö+»≥´ÒRË∏≥pb`“â—ﬂ˛ vˆ*ül?ﬂ⁄›ﬁyˆa∂”SZ√7çW·6j’€µFl&,îz∆ÆÔO8d˙"ºJw∞Üp»GhäEö˝@kÉvR≤@‡–qnÖUáWàW§¥sÃ@
g…êaÒçé@®√ñË8>?‚ÜlˆÔ£©ΩZúé<lüŸèxÚ¡¥Ô¡FFØÛƒ‚{yÅπ]@g™∂€¿•.^∑‡Ã9jºj\†∆õ‚ÛÍõ∫¿/√¶‡{ßXkdHëÑwMÃQxÑoÌë:ïÂØ\JÑ©‰ªÉÊˆ‘í[y<_í'ÿ;[JÏögÊ}J& ÆZ!m(…)a◊K	,ÎàíCä=&bl]†	«X◊11ÓgŸıÒ£“î©ô_◊)lcORáÒbu…+©∆CœÉ:fËòÕ50Í®)œ-Ÿ…âài¢ﬁ‘ÆÌŒ◊5«%'t5Ï›ùÒ›ÇÔ¯+Îf#4/úgb˙—¬ÿ¢$2µÔÎÃAM&>4π…ı8SnB˚F⁄fıË∞◊tÚ¢∫ª‘@ò$Ç|!‚!”ú$¬¢Ez¶∫DU%≈SÄ‡«ôÕ´⁄yπ’Æ≤ÔüjÒLòÅ<+~R8Iû+Å^ˇwVÚP¨‰ÛÊ)Ç\ëôú◊AX„6˙"ºƒË^$Üz˚ºäyíA˙´∑ﬁPãU âF^µfBóÄq›∏ª$öœÚé æâπÂñ`q'í.·ˇ^ rÀà¢ËÿÎÚ€˝gÊ—àaˇå#°Âaπcß,Ù%â.B\aØ@≈W/Ài≤Ø1ó=,y;©∫hD≥¸1åÎ≈OÅCP5˚ˇ  ˇˇÏΩÀr‰Fñ(∏ØØpÒ÷Uß»‡#…Ïïô≤H>≤ÿE&Y$S]fYi ÉËDB ÇIäóf∑Ô,∆z—´ûŸ‹’hz—¶6”Js7µú¯ì˚%sŒÒ‹éWêYíÏ∫K… é„Ó«œÀœ£™„R|*JV‚S°ê¯‘"∫U¡Wa∞wπΩ≥¡%Fv]Üï¢.Ë¥◊äœ6ãdV`µXG-gó^åsπO+øòá}Ë?†ú>nÙnQhYG°ëÙg[∂è˜
'èXö€ü–úFáß‰ ˇ»¢KÕ„∆:…}Õc∏•ì9“Èñ¶◊f”•”ﬂcÙv"!ÁáÄ2tåõï±üﬂèÆëüä_á}`|≤CÊì£ù˛ÒÏüÁr	∑√Dã‘{ÇËPÔ9^CjìK=üº‘∂y—¢ôzÒ(¢C«<‹õµAa*{w<˚~ÏÅ≠·'◊–|Æ¸Aøû}Q|®∂πÎ¢œÊ;	Û¨o¡¿œ◊˝W˚ovAYâÙÌõ}¥ê˜OœéN˙%ÒÜ<2ÁfŸlà¨‚âÔˇÚ_ÿ›}!∞–"Òd˛˝ÉO™„Et=ˆÔ3X†"6L¸¬IÆ-ßn¡õ+:Ω‘¡€HÚ@F˜kÔ"ÒsL«!¢B‚·ÚÏ∂ºË+Ë$·
Ü∂∏µM–(H›ÄPﬁFáºã’b»Ø«ÂÃ‡Œ≤Yë•<1∫!ˇ2ÔÜ[†—û®Ï˝äywÍp,¢π˙€qtÏÉm.B“Ë˜‚ŒBøQ>“¢Ãpà4ı0@?SqdÑx1ß;Ú:ãÜö≈rC∏#ª|66(h§êL\cæı•±$D‚¿∂TY¡Ç¢ßHWÿŸÏ«l5»ú0o&ÿ‹?©Q/Òs¥3NÅ8âœœÔÃı3LﬁY8·ÇJ~N˝†È+Ú±äŸõπì‰ÓW5qh	$áØO3qœtghö.$jÏ+F≤HÜÅö"ﬂUœP≠&4ƒòîñû\œÄ∑æô˝ﬂ)˚m~Î˛l˝´ö7≥—…pÒ%Üƒ¢4F$ø~‚-%˝Ó70ìÉ¶Ö’≤df2IE≈ƒl∏∏Ñ„EœﬁqÆ7Ë¿™tÄ“R…å5©ø»ö«í0”o–n:∞\UﬂpıÏaπ“ºk˛SÎõﬂù„—TÖ~iÕÈ7∂æˇ∆¡‚ÏkﬁÈÀG∆*∑æ˝ráŒ˘;5&Úf~íèJπ˘1˘ Œ˛›KÅM{	™Ñ<w◊∂§.¯ˇKé≠Î«Ro÷xu≥ºÒÌ6kUæ6ï`Áê˚k‡ò…ï"•S[–ñ|«D?ÕÍ2<-i®Ì™Ls√ÂØI,Lºâ$∞¢rbáv¡@(ÛΩ
ZYõ õ
KÛ£§Î¢+¥Ï=|›ü:◊]ÿ2◊üë˘˜gX˘çÇ]÷YGˇ˝t:"◊)ÿß◊AízKÄSÚ•;B˜-Ó†íö˙u^∏î<SÛhàÃVÊÑŸ°Óî_®,ò˙πPËç„Lûû˙rÒ”^)z ôŸ<Xˇ+Èg∫¯Ün8ˇ£ÇŒÈ€≈–ÏÛœ+åÛÛ”$]°hKôËÀüÄ:Ÿ≥•c¸¸\õ<™pQÉÅ%`Vâ∆-®ì\†πE∂23?ù)´sàÊ¸†u^oôÏ'Nù¿í#Ú” £##FÎÆ€ÛÍ"ócº<ﬂ∫Ã™>O–@îx.„ä8˚pEèh&%´–Mû†F$~—+"œDıÖq„<é ·0ëˆqÙTﬁeÖ9@{®ÒøƒZõÇŒäíÇöî¸TÎ™ù=íØk3È´ñ75∏˝|≈0ß’õõè∂ÿ˛!&∑;Ó ˚ovˆøﬁﬂy{täg˚_Ûƒ≤˝≥˛)ŒÓÈ)&´$´tYöª(ºNb¥:ü'‹ÄÓ*›Ã¸Ã∑∞ôˆ ›2¬d//ƒ=˙ÖæòÀÈg±h◊≈$"Ω[Ì≠o£
rÖííã∏Ÿ›ko<ú˝·È‡hQ¿ù vÇ)≈$ºñ∫âHçâΩa9R;ˇ67oã%p∂yÊ6èhÆ”‘^k‡ﬁt∏Añàº$èÿõ˝Äˇ ·3◊πgˇÛø˛?LX≈Ebãr%>Íêu\<5Ï‚Úiø…∂p{›ÚÑ\%Ù¶bL*µê*È£6¸“ÖlöiEö]xÙU!¡ãV‰•`Ü—∏Ü›ùÌû±£Ω}åÀ`'ªØ˜OœN–Èk˜P¡£∑x£Ç~◊ò8™Œë™…ç’€‰YY)Lö)ƒ8±>Ü0^©-UÖ‘V5–Ó§õÖT8bWÈ†ˇ5≠«È—+ˆfˆﬂw9_:û˝”Î˝7}1‚âáß∫Á„)‡≈ÅØâÌÀò€zc™2˙™F ˙ªC÷ﬂäÈö√àQê”,R¸nm≥4,\hNE€“ÕÎé≈“é∏)Ê¿Sú•S≠æ∫∆"?Zóéﬁ5∞)cZFTÇÃZV¶Õ¿4ú(…t÷‘mÿéºŒ0≤^Fô¢*ˇ©6ØkVJ‰çrøö‹bXﬂdj¯ÙºîëJ∫“∞D¡EÇ¢Ø^¬â¶e$õµÒS9•0f"©´$Öœ®xÁÜ”n}Gâ∆BOˆç¢Pb$‹“y.ÉÕ”Ûoß0dJ3/„÷0çbüÆP‡qõ–∂:∂Ë¡~XUé~ˆæ¿n:|Ö¡\≈…/b_qß…f€ããIÒà0◊≤Ä¥…◊£‹Ω%,Ω8Oy„©áqΩ€$™bISúÇ*pq":äLb˘”^åáŸ{…VÎgªl÷)°~N T⁄Ö6~Ì5e(]ê:∂≤ÌØìòé˜‰°¡6.÷êœ\_ãåÓñ Ãã[ÕGŸîPcW‡+àçÒI"+M≈ÊÍ ˙j9uïg~-Áßµz#o“Ìé&[Ãﬂ.±–øŸb `Ädπ»^ºl·n≠ÜLÇá‡ˆ≈›h“}úgËµ≠W(Qö£Ü:ípç~s’fˇÓÑà-ÁH^ÔlÚÊ˙MZÁ˛=√˚‰‹~JZ∫`„µXìA‘Ïøy$L≥¶>^C@⁄KñßÀ%ˇb©È$KTıË¡íF¿]Œ~ÑÒcÀí–ÂÚ≈8FÍáÅwE!¶Z¬0$ ˘rˆÎ∂∂9,≥mo“ckãøHôƒKπr¯KG"ÔõŸ)'I®<ì;¶˝»)QﬁªX‰/e¢xh
o^É∏…ÛJEŸÏGê>GËÛKãMyÊπÑLpÄë¸ò{m¬—ÿ˙û±∂∆Ç.Oº‡±=o4˚1
=Ãh]á√b›Xµ¡Ú‘E÷Œ”3ÚÊ3Ø—ÿX0ÄŒGòËÅÁ*‡{· √t,±|úPÄìpÑ21¿ƒDº&Ã«Dí¿ [î∆ NQ"Ö5låIY§ıµnœ°†πÀ◊≥™™´cFG∑fµÈ k^âØÓº√ï∫‡´c~¨Ó◊&9™œµWå}r˙E¡7nåﬂ;Wò\ﬁh(ªªa(∑ñ°yÖﬁh–‰µò
R¡‡∞-|Ï˝ï÷›˚E≠ª˜◊_˜9’JhR. Y2û‰~c¥EFÌe∑≥ „j@BÆ_~Ç^ùä∞ö∞hR…¥<ï∆ ∂R…√°ï˙,sıÄzFYÛê{üHSÓ62Æ¢¥
mAË”(ÿq2˚iÇ/ã†£œEıÒ9§–Ì ÙH_»ªúóòToF$_ŸñL‘ªxrNLY7kkqád∂&øŒÜãˆ◊ï,/º,LGí+^cñQº©–X&|∂Dì≠,nïe‚aÈ2S-/˘v
<*5Ö¶î};§d…Ì`X√ΩÙDR~*?§”îm'∞¥î]Îv‹X∂µˆ#1é(•Êe k<¶Sº83¶ ”‰”µ5x∆6áê∫xc‡,∂EPyˇ|lÂ—azÚ§`vS:M°Áúxó∫îæ@0F(ÇÚ2åÆb>ÛuxzO„yÂ(xœ“A0eË∂?˚~8≈T[T˙—CÿRoêô÷«ºçÑº,∏D”XêHA	b7ÄñÑwTvÏëèBçAæ_uÃ$⁄î2•Ã§ ûÕd¥öµ.ÿ…wûo∫9…∑4≈ çïçëw@˜ºÿ…Y0öD⁄ë˝#àıè©∞⁄„Çe˛%®¨Û–êcùl À4àì$æÊﬁ‡ögáûmUG=u:>∆qUÍdÄÃ)ß,@Ä–5ö;rµxÇÍ`(uc™∆“›ÎêJåjThÆöÓªJ≥ ¯n:	ÒÿO¿4OèE¥˚…ˇWÒòû6P:5‡À(à`˙’`≥–[‹-ò<#ﬂcíp≥µ).“	ÆºÉ[+◊Ç1}hÄT‹è•ÊÀ©¡HÛ]«ºÃúûæV…√ÿUåRI
‰O§?L‡¸Îù]ÓyäË™(–∂é)àà§∂›+â©÷ŒIPÁí‚†œ YÕ°Æ/*^¿Wá1q öü«™97ìßòíÜí—Ÿó;\◊¬ûER0â+˘ürÔÇÛ{1π7P;ÄÆÀkàvÿÔX∑Ñ,6,„m˘fˆZ˝ ó‘eÚe6Èpq>z˛Ö∂Éêf$/õ˙k πoï∫|üy£	zJ%q|	"DB)¶W06 '0È¢USwpÀ5¡ùŒaΩP¡0m—ﬂI¸±$ΩéIÜÌäU¸
÷Mc/ı˛∑è2¨‡Ñ§eçìñ∫2Ñp2∂3A‰•®u)ô;™K˚¢¸TÙµ.úâfûÈIF,ã’ÂH$Ö€„@XΩ˛Î<´ﬁ√ÉOai¥≈O¢õîtk3ıßôóÅzsòó-om™;∂…Tt*“Rﬁx∂j◊RêO÷≈Ò®õ ›	õîÆUÂ0fı„Ú»ª¡˝4äDŸ˘Ü>)ü	\“]^û˛Áãßú7`Â)Xi´RÎàÍ˙÷/7í¡Èø—0bEPòb¨J^§¯—#U6©íˆøFú #¨n~®Ω&Tí¸,\”~ÆE^˚ˇ˛¬¨„˘~VGÛ≥E≠úÏÙœfˇz≤œU˜ﬂÏüûÕ˛~c)ÑΩ˛·Ï_ˆ˚¨ªﬂ_,âS)Â<ÙŒ=!∞ãÛÔb® É&KÕ≠Y0º]bóﬁ-LK,¬’^íQ*˜"N%Mi‚‰üÖYÀ∏K›œ~bùëèà¿ÄéÌ˜X:Ω‡/›}#Oë∑ÿoÔTZJ!˘îºŒÇ5Û∞>=ïaFœùu†Q0Å Ià…j[ò]n/.[dT
m„êkÎ¥KÜì(Ø∫Ú§Zñ†ÿZÜö(zÕ'+BÅDõÑÆÛˆhÀ%ËÍAG˚Ü\‰<¸_ˇF)H#jƒ’›%ìuu¬+ëHe|Dg˘†7yï^”∏º}äuÜ›»ØN:§ßSÔ„9Ard?õöJ%Å$D+i4DSîÆD"¯5˚n°‡≈˙c_PÅ˘2Ãcft’∏@|tó$˚BÀbej\SI úƒ8#€⁄ÓM0§!qu—≈BIr3Œ s∑‘’´3-KO›:ﬂ¶Q®°.¥E“·GèÚw®›œ+€À„’F∏mÚ2œî– sØ	Å¡–tyßvX’ŒZ¬$n∑[:7‘ÕÏj´¡˛Ä_∑Åó‰OÔk<uÇVûUÚ„Ú”ëÚªN˙´°’"¢Hì,£•πåä>ç9Æ•-ú('¨È´°Y ˜£ãHN	g0çPÊÜG|πD?∏∆‘!QÜÁc◊«I|F¡„à6íÏ†•!a;Òhˆ˜%C∑:K¶¡4E	˙«!„J@rÈ˚ﬁ$ì¶yar øÍ%¡è’ª+Á+√%÷aùEKÙ˘ydõ™,-µW¿†òk3«vŸ/Ô‘˙~%¬œ·N< pI∫I∫Q±ˆäæ»ó(ÖƒµÕ2!±•ÄHﬂr€ëlá˚\V|ZïıÑL@/:ncØf?^P\ˆIÄÂÂ@®‡BY≠ã{”4‡2«πæ™ˇ¯˘EHﬂ~X1Ìí•»k'CìA>Òrh%∆Î‰èSÙå]~ç«˚+ Ü◊úïÓè’DÀ5±ƒ=›íÑÃ’˘ñ 9$ü$UtE[o[M∂fã∂Xß˙ƒÉrô^a$£
†C¨)«˙ìHï0€âß(‘PA¡⁄sl ±:÷¬5eÕn&<8À¨ Pπ«Zâô|oM¶…$r:Ò»‹[è¥J¢oS&mí‡éÉd8≈ò=:ﬂ	gﬂSrX'e|x¨U1g|">|Ó√VÖO>Œl"&%O\ÀßJ4Zø∂k®‡©;¶†5=å3Ó¢⁄ºÿfß”!hÛÛ©”±¸˘$â'1hÂüÑC…≈U»Sv~í5»ÛT4ZÅù ı.√™I	˚NÉë7˛î‡Ûè¬
x¯Õø
#™Q¢J¬ı±äbjπ^.ÏN(∆¸t√¬+'¡à◊©ÂQ…Ï˛◊ˇì˝}úNg?∞ıç≠µÕøû∑≤¬æ@ÕÁ¯ËÙlˇ†O%ôœv±Úö¥Ovˇ¯vˇtˇÏ+ÕÓÌûûùËK4A∑]πä‹q]m	x ®´ËWï%±?†≥(ÑÒ Y∞Ì·ŒÒ¯M!gF'¡%U.∞Ã9L:∫ßE˝	qKﬁÚ€i¯›|dsÕÌYäm?·Ú‹î‹ı,îg€i[âTÀê£)g∂Êßyg5LﬂÁ$Gf"©fµHïË U⁄=o0ç§3÷Z_9O8AgˆJ:çÍ$YI•Zeí*Ë´Ñè® /Ù⁄í}öaPXºPíI™tŒåî”πJ£ƒo4˝ƒëb®òy2wÕ)?MxùxS∂=MíÊ⁄K∂ÿm5>¬k*›Ï”h Á∏Ó‡~üoZævMQ∂ôâ∫¬Q0PoÆ}ïlSµ∞Ñ¨9 áQƒ[∆ú/‰r!yx|—'≤,~MLΩ9çøGΩü`—º
FYô%…ïJ+◊CÚijj‘pó›NÇ¯“ ◊úﬁßdÓ4*/®ø›KÅpg›Œü«ùEû¯Ä›x¿å‹¯¨á°£›EÙ¡6MY¬{s«ë«4Z¥µˆ$|,V¬÷¨òù}uwü$-ﬁTú9‘’ˆõPÁÄ—hª˛EÌKtxˆ3lŒuπ9+ßªª˝∫øÛ™©~;’!Jµﬂ∞éN~}˚÷1àüa˚íÙ*S¢KªmEBÔ¢‘ãXº€8„–#ëÍÍI≤O@ûH¶W'€h‹Îß’”VI®≈4ö7x»Å0|{&¡eŸÓlòû*
]ª∂hÓ]é
Í»3À≥&A<ëdMœ¶ë?ûL˛¶ S≥0xd”‡⁄(¨Ô∑.„œÛïi4óA£2ªfã÷öø1ˆG€≈r”,]V‰|ˇí9∫ÀÊ—û•ªz˘ıÒt◊(~¶˛«)::ƒcÂ≈∫ﬁx’jÒ©`ﬁﬂO¬ºaÅÜÅ∏s\∆…ﬂÿπN6%!®Xº‹ıPÜ^Íˇ—0¨ë–ÖÔ…oe^¿yx8¬·b‚%Á¥ìÂM›S.œ(Pó⁄¯xeVòëm°”ÏÖ|ª{zÜÂÓBˆ;∂vøÛÅ'‹¥n-”¬‘œâêQ„hSyHÒJø‚ør⁄	?ˆû»Q-ÔÆò¡Q%ƒV[@ÛòÀÙU
ãΩ'?Æ\¡ˇäüë¡9‚ßŸûh«dπ—≥ò´4ΩÇÈ¸∞‹6€¶~›qü≈ﬁeè∂Øºd;ˆÉÓ”M@,>©-≤<Û1GFIı.ΩäãZiè≠˛|´lQx}¢|ñx¡^@ˇoÃ•ì∆)p’Áä·^Îz¶µ‹/à‹|ü(‹âÜ•nB+«≤xŸ¯Tÿ ⁄âﬂkÔ¬£4€1Ÿé¸Xû≤ZS”◊ZÆB√ımöÄ¥V™ˆºùO⁄ã„¨≈Åÿ$œØ£óí7»¢”m®˙0∑·yŸD;Ÿ“Œ≤∞ñ<OæC¡Ωx +ÃàË±'¢ÿ1¬;@GÖø¢˚Æ8…˝Ú7˜_˛Ê7F»”·Ï_wﬁPŸÉ›√˛˛€s∂{ÚÊàuwÒò¯àΩ∆ª<‹i˝ùGìx,√É1Õ≥H·p_û” 
TR†‰ﬁ∞	HÏJ{"N2q:¨øz¬	FÄ`·ú;Ê_Ä‰ìˆ˝Q8¶:∆.f≠¡_µNŸ=1Y~Ãª}"Crãç≥?‚_Ô°Ài`4G–ÌtƒÃà∂ÈU¸q'â'~¸qLØúj7å7/Ω(d©òÜΩ0 ∏˜±oåÛnÚX€T˚êEÒGpÍS«vª⁄Ç˘`Qò‚Tº{ül„…ªò˝§]ÄC˜ŸOÊÉÒ5z8”bd1Âﬂ~õNt*Y∑©òq(ßÈ‘£V/`zÚ…9SíeÓXØ◊õ.1TR∑XG¥Ë¿*,~ÈËO&—ßÓƒÍmî˜6RΩÒéŒ‰d‡∑LKÙ*ÔQõ£{¿*gGÊÌMg?—çåI gßK”H)–ÖWNeh•∑r§Ò4¡?]–=`¬r¢∑Çy6FÒuÄ©Uˇqˆ=«xÙ¶ˆ5s£ÿŒ¯·ﬁ%†aêt¸⁄g≈˝œ«~7•«iÇY¡—ÜÄH Óóÿ;ˆ%m©¥=XÏ˘Ω‹|©91Q˘3⁄¶ãr0ÖRË(¥0∆ûzó¡˙nB—<~Â£Lõ”1&6jóæj>‘gB–é¬∑‘hÓ%6oBWê,Ñ‰±¡#iîóﬁ´Eqÿíë+ ‹%‹ŒV˛â ÎÎ|Dˆö·òQ™LbΩs‡¢RÆ˚‰˙‚·}a:
 UAy˜üv◊vˆvvﬁ≥+ÿ…›⁄YﬂY›ﬁ5¸µd^z€êj& Ñ(ñ°2'U¶Áª§&Û¸ÛãiñÅÏã˚l˙± k;
^‹qƒó¨Î‹üÑ√˙˝LÌPcn¯∞y iI£àB°˛ƒ“ª‡≈›⁄˙˝ ÀÁ+ÜVÇÖKÊ{é'”å9ª·ÉEH‹äÅ˜∞Z4Ôò;ò<»E‰/3AB· b˙GL¬à®^“ÛµMa¨¥M›´sÂçá–®p≤£$Ån7Ë-Yè˙!/ôÖE3√÷‚ó∂–Õí)p~v_ˆ¡Ωx0MÂb;_vøI!FW∞·∞õ7ÑΩ)ˆ*˚ä-È∑”0E∂≈_oY`[0Übˇ+∂†XX˘;]ˆAÂ≠H¬k-ñ69Û.“8öÇ$¯eÒÑ´˘QpI;¨Ó¿ã]–”˛ÛÚì$-æg#ÔË€”UÜË}	dw˘ñíúî’¢(Ü¿ﬁ«H†R¬^”n9$qÅéVÊäÁqÌ¢Aã=_©'ÂÙ≠≤ôA7*[6ò‹xÇSãÙnÉ8ÄN˜ûÏ≠Ô≠ΩØ∞‘»4*nÆÇækÕlK‹]≠Üœ¢ywïç˘Ç*¢\Wƒ˛%ÿ∏°øEîpâ!∆øÒ_)M%=¸ó›ø∑ƒE◊•HÄR jZ{X ˛UÔîPºÍ≠∆s«MéÌ∞ÆRn"	#ŸXS≥”ùòZ:oR2+ˇTπÆÁäµ•{ø˚O´{O∑_Ìÿ	M^Z‚∂ÄÔÅà*Ëdu≈≠Vh¢8Ççy∑"+o0∏2Íü§ü0ÍûM%òE∞xí[ ∂A0Dˇ·p®∑º
‰scµ F∏±Ú^CÁﬂ”∆≥»’}CÌ>»w‰Ö—aÏO£Ä´‹ ´'J‡w®’\)v‚˘nc-àw-wÊæÿì Xazì…>lZœ˜œÄKeÙΩ6ù¯Äö'9n√'—tÅR˚ˆ’4\â_¶ä>ò&(3Ïü$∂ı;¶zé/‚ÿ‚®I—ﬂîÍ  KØÕ_PöÆ˙Îwån—pbÖFêÉ„=R˛€Ò&BÉ¡¬?^bÒ≈?¬◊‡éw$¿Ó∫§ª√"ÄåÛ]ÉàÑ)T1å,ÆB?^4°˜`æ˛®,ß˘Ôj{á„æücÜﬂ∆{ÔäÍ]∞è·Ip…€¡˙ºH≥»6 @*áî„‰îÅ∏«¥˛éﬁû˝·¸’¡€]ËoAPàÖ/]m^üüÓÔÏæÍüPKŒ◊ú-Ùı.o¥ÌwøX»Õ5ÄZó·ıw&÷JÜkj˝P‚B˘vFÅﬂûahÈnÌè^‚ãﬂ•Vº`€gLÈyc¢ÿﬁ{'¯Ô™óRï‡˝ú˜ëx(~h<9„ºq©≠tJò∑≈æ9	0Ï]Ω∆ÔﬂS|Â"ˆo°˝ü«£Ÿp«|Orè&¬?èw—¥‚«î<» ®*ﬂ…BL‡ç&ã˜ÿÈK≠;¸V~ˇÁ1≈ﬂcìŒ¢4/Àº¡’HL›{„˘˝b¡2Ñã$VÒaãT9±ª„Å=~®≈ÃÊ¡™„ÅGÅD>(h}Ÿ≥˝Áq˛{´ù$ŸXªâä–ª˜∏Mˆ)ìÛ∆¡M€8	±-Ï„n<·A˝ãu3\=©ˆ$Êì÷È,âŸ¿ø¨e5?ƒ≠5}ïœèÇæzwo`m–úí¡S•	‚ÔÙ›™eh≈ª6Ç»˚=‘∑A'Zgˇ[[]ﬂˇ@sú¡Épr”¯˙·+.-§·É3¯¨R,TqÖ"`›Ö#—∆«»e’«1Õæø¡"R–]o¡!Ñrãîyﬂ>¯¿tÙÇ“(Ì¡8NËF◊Íí7Î≈„(Ü?∆HÏ $zkq1„77z:E/êÚ±E;i¸∆zCSÍ≠à£ã®å=$Ñ¥c¢∂%!O(,H_·C√ÚΩsË¯O?≈!Ω=9‡ò‡≤’Jtêl±'ïEÊ∫+, Owæ‰f^ò=FF:'d6—ù¨n¨ï(YÅ;«Ú√™C¬ånOÓ{s"x[r"L^bkD!KËùZXs≈˜¥)ñ{ÿ*ä≤àjÊ`°+ÁÓı–“.≤≠˜∞RY∞¯´€Òt’ŒÎ]%$™@O=3B–Î…oä«àD˙c‰?tù–"˘%˘_Mo«É¬Ê@¥–§√^‚∂Á‰Üo!$w˙~à46‡u#`L@Åß#Ûx©∑∞ƒÄ|èAâ“âY‘ıœ
∫*\Ò_Rì¶S*≤Ügu¸‰ .⁄≤÷A1pAOT“®˝”#ë-JÉN˝ë%∑≈√*X0‡úN*Ë}3‡Ño√YÊ[e ‚&sOπM¬ÛPü®àº(1UHπkã4#4BT4{CâíÖ¢¢È…jRœ˙J”ØÛ#0˜˚jX˚$JaR9Xÿ¥*’¯Lë“˝KÜ πµ’‹opñÆ7«;Ó∂
©  ı¸W∑ B `w[?¿Seh~Jìﬁ¨m≥Æ*ß¨¿¨ä®»ΩΩè^ò	˝∏õ+‘]CüÓ`·‡Koê••\w&SÄ$o¯/·t⁄Y\RÿmÛ;„WN4±Ewè6:Ç4µEãÂh* }6r6∏·+I‚ƒﬁ~∏ıb‡⁄ÙP4˘≤¶]xäQÛ‚†v$@$–ËÕÖRë•0·îAéû¸†„8hÇ4rÓEø«p˘Ú≈”‘ZÛÑSΩ–Ú¸ﬁ†’%˘ƒ<tÎ7¡	´ÜÉRâÔ®q»Û§ A
z∆Ê.öÛ>zE‰∑q&Wúê°qe¿$u•^Åµ!‚[∑8dÂièsüwkßœ9{à=e˝ïç∫8ËB•;Ÿ©v}2<™^±ø·PqÕ+¶ÓóÅ?ø1ìfXtQoêÄøÖ)–ZôæN«›Q≈=WA.Ø∫›6“o›hëˆÔÇRıÎé∑…RU˛íÒÜ¡´‘ü∫#O'Y∑Î-±b'J®æ–åeΩaêù¡/‡8ÀZ6dgÕ©E!,à‘¶1]˘˜HW_YÀ<£ ∂O«6A7p´…ËV9u°Ä#’£ìŒÿ-,ë-
ΩÀe/©§*Áâ√å–O-û^T\46!fKÎ‘k⁄∆æ§d¬-Ü\I≥£◊©ÿv8û≈V%üÂÁ-)≈í†¶„@≈RN8–2ÜﬂríöÚóu˜MmÂ©ßö’7€ÿtNáße§‡8·$◊≤π€¢úõZ–Ë•·>ﬂÂ=hÙπ–â>xw?√—aÚ˝ÉÅ'eÂ1†/È®¸+/ÒœkÊü´7ºj8>˛o~’∑¶mƒìW˘Ê(Å‰%Œëb‘,Äcˆ,:”v·ÈÀúû>∆∑ÀñÕΩ{é8£˝‹¶]—Á¢ÊËSΩí¸¸˜QñQûìß«(HÜ¡Õ¢aÎœ«R˛À<∆‰Gó‰πÖç˚•dÜ˛RE˜®±7¡`ä÷5ÓÈ–DçÂƒ5ûcÀ‚(∏Åm	6ŒØE£ºÔON™u”?Cπx’3E]sZã<ˆÒÒéBÿwW4(qÙ´√«9»«Dµﬁ∞≈—$
˝ñö‹+ó9ãá√(‡KH÷~ø|ÅÀ•©ü,˘JÏƒ∑æ‚˜ÑXb£ê|JÒ·ñ2ˇ„|oŸ∏kùõØræÎ´Â5tJF>Ó¢¸tï«ÒF~^-PyÙiq\2Ñªn*ø¿´–˜É1à2·üX@x<ﬁFÔNÉa∞∑˚K˝√≥ıΩ∑¸˛åË”#›
Ñˇ¿Ú¡˛vÆ;÷‹}#ã>˘[—o—™é(º¶U6Ò¢ﬂ‚oÔﬂ‘M43"öÑ≈H≈‹ëeò˛∏ˇÊû•Ÿ-Ê≥øcﬁ‡√êfr›ò∑\˛˜≤‘OÚ< PÛ’-KM_Ái˚)îç—ù.∫Ân∂¥U‹>ê&RΩ€@,$oHÚã¨çTÂN˜nOxÅûËYgªçK_K™_8≤¸≈fπãdÉeCWòí¡W∏ªG”TzÄ?Ω_y…ﬁƒ◊û2ó∫◊Æ‘EÆ,ÚÃ]MçÊX∆àcëC€Ö∑°n#ï;´^≠upÃ@ycÄfZ·3x˜Ætnπ#é∞ö-±»ª"¯ΩÌÖ7<m$R LD|ãÌsá≥œGﬁ°ÎÀ/…Å[ø≥≈¬Ó›g⁄◊…:ñ|?∞@6w±I’ßQÿáøt»Ì[ÖoD—¢ºœ3l∏Œ‹˘û<•/´]}•ÃÅzˆ5~ÕmóNΩR^ŒdÆˆ’»/Ú…æ¨ı…∆ÀEΩ∑√.ˆ#búT≠(î∫èN™Ëùº‹ßﬁ´[€E“%âù
V˙ÌùZ%‡?äQªúåeÍbKVÚÕ˝ú{‡ΩGûU9æﬁ»
4áﬂ¨ä8†s∞∂"∆åÓgå33Òñ}“uµ¸deSKT5ÚöìËÇ«mŸÂåˆ*Ñ75ÕÆÒP∑∏"ˆòv"˛¸CËgW/ÙƒT([l≠∑©+l˙e€K	Tµsø“*ÿPDIÃF≥tËê(hÖøyÓOn'Õ]x)_øoËL^Â-éWâµ·æô#π+ßJûá˝˝7l˚ËÕŸÓõ3÷?ŸÌ◊âùíÁZ“5ÖL≠jíµÿ–î*‹†ö‚GG((Æ∞ì˝WØéﬁHTwÜ‚µÅµ¢ËhU2´#QÎZ∂):∑ºVñ™°Ÿé™™C…◊@ˇA æ”Ÿè◊˙)™yÌ„A1ôí ≥ Û:QGüôb<Íπ∫ø5oÎ∆…ühîvâ…J?ÀOÆöÁ·êå”bv∫mº+¨K˙`õmb:&ôÍ˛vD&Ÿ¡ôi°ûJõXÕ¬ËÑ¸RB.ë:Ç¥LrOò4õØZb!Ø99ÓJœgys3ÁØpqgUØ‡!∑¥¿÷ã—‹RùƒKu¸©ó≤ı^l1)MV]û-¸˙÷úÜx\¬Æ∂?÷,˛	û{bTGÛŸkºÚ≠Ê[?˘ïŒ˘üÍHeäû°ül™ü78kìU»q%Èá∫´Â‰Ê◊%Hdø(~Òx{t›÷ÔœIå«î¥É¶»“d*yº÷ØlB˜DxYÕ6î°Aè:ßvMÊÂ…(…OÛ:hä›4(æ+ØO(°ﬁï…®fTgèN8JM4˜øtÑ†¯ÂJ±5‘∂ÏQ9˛‰4WEoÃ±ÚeÀÏ4îºÖq©Ÿ"*Éo	b¨sRq›Ñ_∑ dÍ˘π∂öè”8YûƒaMe7Êcœ¢pR≥â˙„‡¶°t#≤„ÏÓµ`ÿEË¯nÅ%¡Âã;=Ï^ÀNcG,ﬁ€)[‹+E0?ètX†ÈT∞‹	R–≥G√ˆ9à[]˛W^í–πëÃ„£•å«uE·òõög◊íî=›`£§æ4VôŸùg¨∏]^ï¯I¥ºÓ0˝â=ª\c|%~jíúÁ5êkøQLÖ¨Úz.‘ÌübKU“+˝™MÄ•_zñß<Ö•n™}W§ª“úr]ô	∞ÃÙÕí`µ9ìZ‡UÔƒ¡¨ˇ36IrbQó(Ü,ê∞…ö¢Õúv‹{âŸ∂∂åb¸ñvjE?˘Û√~c—éûˇ»[§£-EºrjÂEQuÍ£
ƒ´Œá[“⁄i©?<⁄È`é÷Ì£√„£÷==zu≤{<˚øvŸ?Iò˝˜ù£E'˝h&Y’Ïqq∂∂¡s{ÂìmHÿŒ9-J;8ÄÎ<CDz:ØoÅº™˜Ω;mÌ/^‹˘˜ıÖ£ù¡·^)fƒzqÁrmB∏$^K]¢¿$#©çû®_rxÈWım≈]⁄ú)ï$æ,|‚1anöf–2DŒ(ÊKä®ú[LF≤¿|`#Q‡7‰{è¥ ìf’ örRºZqSºåâPQÛ”ëåhoÿç`ÆéPÊf’]å∂rK©ËÈ&,∏nø…´,/‡∞“y√D6mB∑Ë≠1ÊÌâå˚ñ¥U€√•± átåÀ≥‘–úóŒÍç≤Xm`à%èZ⁄“®ZÌ#ç◊ÂŸjEe£·EI‡˙˜ﬁ¥¨@¢é± éîïˆ1‰µíûÆE™ÑºfŒBÂrŸˆ¸¢†Áo4ıaQ]ÿLìì~\~∑Œ=õ≥d: ò/Ôd⁄êπ*yî(Áv“ó..`ô∆≥©º≠¨çmgﬁ®Õ
Ï±yä& BÉÓ™Œg®'0JØû∏9≠‘MPê¥–Õ ÑIÄ≥fr`Ó^ﬁOB/2|Àõ*ovÓã˘4∏J∆¬ìl<WTëÛ<'qÆ/∞fﬂv≠<í˜Ø˜Oœ˙®ÒÏÓüΩ=È≥./Oq∫{∞ªΩÙ¶_™ÓÃi)iÆ m4VÄîG}Å¥Tç\‘7wÒt–a◊©3ÚîÁ'a¬Ìé¥ÏÇÎ[Ó©”»≤0ã†ü=ûWuÇ’L"4ïEAòMO'hœ¥∫,±nÂ≥N…dì˙rñvQ#b!7v% Áªé⁄|Î≤8_ô$7∫X~
…<˘íÇl}—:ºZÀ5nÑ‹@XöT˙su	™p4¸èQ!¨6z√>Ñ…ß(>˙±^ˆLÁ˘w˚Ywıq+2π&ã£kõcD◊⁄Óò|ö/ÄQ Gl+~Î˛ïa¨‡¨E§Õs[∂™ˆW¸ºC¥‹DÚwßí&ò_÷(`BáÅ"ãYgí-ø:È`L†Ôar ıe?Üí1Ç1^aÑ∆Uú‡Ô€¿ºÍåß#0¸*û&Ê·ÿ…ñ∫søÿ≤¨aª `MÊÊØˆ6yëè-πçÕamgÀµs‹-$;'"¿√ë0s2©T“≤åò`ªDò£˙•MÀ√Ys‘L¶k:VMØ=¿Rµj≠"Kπ-}ÿZΩ•Åãˆ=+rÿ§YÂS’ªeK©…SŒˇûHIqî˜<µj7]|P%Qá ﬁ¶:*^†>DyW).◊„-yÆòqì“m6–˜üP∆ ¬ñæœÖBg%ø©U±ê 6/uÑÃz2o’R€cú*Å∏, ±·b›(!]ÆØV(‹+M}üú@9-–UÿÕOÕπÕÅIñˇ0”“⁄Ä◊'™#⁄¥,Âß™JŸR'=ê:)©¢ß¨ª}tˆMümÔæ9;È£n ˆéN·øOr∫ƒ˙|ªœfˇÃ÷K¥’yˆ†…Õ⁄˛ ÓÅnwfæDù◊4©\o?C?Xæe‚`ÿîi[‡ •Iôö´ëóåh}K°ºî®·Òrh,ñÁ ®ØYcC(Uv ÷ñá!©T*F€Æ±íâJ=TƒÇY ¬"ö≤q√Fë¬ˆEH÷ö~cï”◊‡$◊æÙh^çœíˇ21X”Õçs¬<T∑Ëá¡ªjπy¯.lèøÜ∑«C;ã˛Zù{zK†±ÚKÌ’è∫‡]˚jœå»1
≠ïØxÈ&@%Cÿ)*çÑ‡Bœjx√Ü1gGÜ$nœ}?E<∞}Õ5[€W¡‡l1÷Gc¯<3S4Ω<ÀÉ/ÀÄ<cœp>r1í[•É0Ñ…qOº!ïπÓ.∂0£T ÑAÓÏ
˛gòÇÑ∏Yo™ﬂ ∂k–≈–
Ü6dZ¨MõpYl$Îu‹&Û/6ƒTZ_iÏtà£úùõNêOÓWÊ@?5˝-ÎÀ.~à?∏ŸæÏ¢nˇÖ65Ûè/ÌDÖPWœ∂îs¬á}√E]`k¬Ïñ(
«hÀÖyÓ/∂<Ÿî◊ú˙KSÎÖ}!Ω⁄_∆Lï(ââ•5Kô»dˆDLH≠2"~í,o± \j";⁄„ê´&∆T¥Rêôm˛Mj”»‹SQhà0‰uã´ó‚„)• ÙŒgò˛·!$Ø;MN¸ H*äEa≤0Œ?;ÛÎÂÙ∫srA7Wl±≈º⁄â4<ì hî´Ò©i∞^$y€(ÕQﬁÙA‡·ı´á”åÍL‰n´p≈Y‡™˛M¥\◊CÃHÛø˙xƒÆ*´«Chúe"˚›⁄›˝Ü:ÓtÓÿñ”=ëÙ”V‘y;›”@9".vÇ"ÛY˜,–¨≥Ä¬ÕπŒ Jav∏`ïGl‰éµs
3xÕπ	ˇÍª®§p.GlÀY‚9Gqy@˜PLpVƒ™äsN‡º∆Á÷ﬂÚïÜ≠&‰ªâ€êïˆ÷Ã+ÕπAôjkΩ¥ÉÏf∂uJH(∂‚∆3;pŒÿö ünË_y≤⁄x[:ŒÏ¢·¬À7◊FıAgfﬁ∑”∞˘˘q±Gt±¥˚¬À>Ù	ÃkïÕæßZe^ØQ«Õ|Áxª¸°¢U±HÛ 
˚áƒCW=>kdV˛ç®Ÿ˙∫Q•ÊÎ0¯H≈{ø¶?P©°üGÙ⁄íùÂõy¿ÈA<å1ı€iÄÖô±¶Ûïó…(LS*~ sW◊îhÊtê˛êcÒ“7G_m±ÉŸøæﬁﬂ¶3íØwOˆ˜‡ÔŸˇ1˚ﬂè∆ÒAˇÕ—)ÎûzﬁÈ"æ£H:ˇq‰a9ÜÓà
SÔ€9ê±≤wq<†±lkf†©îpù™åIüGÒÙ:N»>]⁄f˙°W›‰“Ö4*$±∂¡Î<L3¡‡T‰∏q«Œ˜ÌôÏhÒçÄ`9o/:◊⁄‘√·Qñs˝ù2@ÖæíE):~p›Qı)Õ=.¯F‹„Î8∫¸ˆ˜ Ê±lÍ«3™&®:Ê´‹gåıîª˛E/&¡?z_ı¯=îùºk8ü£±™ 2Å~ÇŸ€g?0l7˚whàe◊©|!Z∆ﬁª]™–.Ωiî!j≈i°‹(Ë· ﬁbÔ:æó^]ƒ^Çy≤h—8|Úó,Õ«:◊afLc*ü…ÃGéìßÁ|ÖN`Ú‡πGs?)cı˚QxùƒÁ^ÊQèi|Aâõ:≤YEÒê:ÜÌ	∏=ú{!5Û"Ãr˛!Ù9 T·˙†õÚãÙ⁄à>9Ú∆‚(?|2
Ü¸wC‰Ái|ô}Ù¯˜Ëæ‰¬#´2,˚ÿáy¸5N*~xD”àzª«ÁÅJÚK?S/Ã¯ºK¸s‡%c;˛öf0[FúZPLXDˆﬁ≠aB+ô¬Ê·&!ü±v’´î›¢':äUœü	¸…9¶CÙ.BLÆÊ¢ShÁóI,ÊóÏöÁY√Ãr<°⁄ﬂ/>«ôÔú(%	C•Ù’Ã◊∏µL$úxX$5Û©wçÕ@äZ‹,¸ñò√Ç√ƒ¿‘5B.–uÉ,—ü·ÖúQ±I‡3<éÁ€AèàƒZ_¡5"∑àœ	ç⁄!Ã~ ”O.„ã˝ 0øW‹/b;‡âﬁtB–‚c˙Bﬁ@«ﬁœ∑±oèúsJÛ¢êu~x¥Ûˆ`˜Ÿ÷g6y‡Ω)*Ÿ¨8=Ác≥EäwŒ,izç'$◊~ﬂÉ%⁄ıW›…Ç[∑cÖÒAÛ{Ô≠˜eıgÙaÒñ¢ñueoÔ›  ’*ˆò{G»≈\,«Ro2MØÚóKRœ	íÅUÛfvÒ∏‡ë|>˝¥î£
Ø
7…µ¶~ìÕª’G[∏ùÄÉ`úﬂV˚n±~@ùoDv'?Ôêä,`æQ9˙i:0´ïª∞#!!Wu
Xhn#ú„FO6^4ïÆB’Hsp¯±˜_ÂSeÍT S+vØU7’j˚Ë ŸŸ3˚oá†Øü≤„˛IüÅ¶>˚óÌ£7¯ËàÓæy´©Îòâ~õ{WË*ïPL—DÉé2›mÇÏ8ﬁË"HË\,óîDÁz·"öV{%Ùπ⁄_NWiËYØêhËjû^dµÂ‘€’8˚·0∂öÎ4µ|ƒOçw
4Æ‚kÊõπh€¿\˛uΩ»_ò_%"7]ASåvΩå@vâ|«{\≤vΩ3ô&ì»úø]Ô(œi}Ö›ı÷‡÷;æ£KÒN Ò¯¬B€“‰zÔ:DôΩ¸M≤?5≈÷Ç»ÿpï5ï§˘Ç)≈•≈G|7z;6∂•˛4∆\GjN,M™óÃ◊Ñ∂Âj'HñÏˆ§í5•Ü⁄÷sÜq<ÖuYÛïî∫›K‚KÈºÂú2˘⁄S◊∑⁄æ&æÊ«ÁKÑ@ŒµxC|t‹n¯pÎ˛F˚≈ËnÄO√=!>◊Ú≠!©˚1ËË°õ‚ÅñÏ˛ΩŸÏ1 ¶úS Ë∑s˙⁄Ω$ßÖí8vnøJ‘õ„M√b“|ã∏Ï*≠ƒ¬“ú	€VòÜ<∑Ày@vê¶òi“iÃºMªOÛµ–≠1•úgc”‰ã∫a®!ª“lGÁ.7/5ÊVÜ™9b)KUSV%¨YMÖ>C—k!ÿ™TÛUıı§™◊6\Û',oÕ%g›ÇWÉ±RI“û√`<›áÚ3ÿ–WEˇxh Û"ﬂ[Áï¸MOVø√É[QË›ÆÀK`ê>Öeyïnı.Ùﬂ”…X’¿0=Ùí[~zõ|’“ÚWÊôö™D}€±Å	”~AK/NDOÚ00ù"Aû\ì/Ôcëêã∆Ciy’ÊFz˝.∑÷øç_‹ëπÌ^»¡†i¿Ü´®õû•ÖÈ‰KÕ&8U∂≠ 4©,ì≠ñÜ∆¨ØD;ˆuòdÄÉXπÊñ
AÉ8Üπ[®p]·lc}ôDﬁ-"Ì)∆Pà3‘›À hh√„8â1È 
øùŒ˜ÖÉAó Õ é¿ßFe
E±»∂ÆeV«L'f⁄UÊOä,°∞b+jt°)äíπøΩÛÃw≤¥ ÁıÜs¬º≤^ptÊ÷z¶ó7§^WÄﬂ0*e·À“ÌcU˙˚è„Ñ»õ˜¢%$
·VEß9º™ê&ô≠æÄ“:W/gÒr¬.ìx§†Gû&n1h#‘¸%•Ü[Ücˆf¿,ãt*M0çµ‹ ∞ ÷û£IY±∑”[$ÒîÊ>ƒhˇûh„ã;ºu/Î1'˜ZwâÁ“˙ ∏Í
ﬁ}„pE˜oë¯&˝ùY\÷dd‡j	*øq±ﬁNÏ1Ω$fºº„u+Î⁄›¡X’ò‚<Æh≠ /sÒà_Â¸.qa2ç0©+÷»Y˚–é3∑ çÁåı5mm‚¨nNJ«8e-‰°∏ÕÎXÛP¨<≈úgX¡ÑÜ¶ñI¨˛≤Üõ4+Ê…ãRVÙ©s†∂£®˙:∫Å¬~õsMd∫Á¥ÿ£€ªÙãºlr∏À¨ev‘M~∑⁄[FÔ,\˚ƒC∞n’•˜R‹Å˙Ó‚ﬂÀ£÷|ÃÆ0FCp.CL˘2Ú∑“∏˝≠Ú,c1Hıò¡r<Õ,ÁLûÙ⁄™ÈŒŸ¿Ü Yâ•«œWœ◊Òüdx·uWóËˇz´ÎãÔaØ”VÑò(‡†≈∏YÊª„ñ®™¸˙≥cìüÊM Àz/≤,ΩŸs—…ΩÌBCµ≥∆Ò¡=…3›ß‘∆0Ø
†Q¬EUÖΩËÂä;Ê©€_~®yÓGB≤*GŸª¸‡D”>ı|€\˛˛»Ç»ê^XMÄfbÉ?∑ÈàﬁêÁ#–.œÒŸÇPª∂éπÃ÷YLÅÀ˛¶’i{DÅ;ò£lW^¬ƒ9òË¨¸¢»À·Æ∆ 'E¡™ô0Ùy¸´ia÷$YscùÁ≠éq~^_]·j≠ê"L#L è¢CY8º Ï¸N /^$äY{Jâbdä'z(Wæf„xƒ≥`æﬁ?>^¿\xk5˝éﬂ≠—GJjÃ˚≤B¡Úπ\xIÓÏÆÅØ£û°≥“ôy7dtPˇ§®.“ˆI÷⁄Â”Q	∫ÀÆ⁄£˝ì§˘.¸~¶€Uî°4+&:\©ƒ ÜπnEÆWeLZ◊sÁ ÅTEÏËß¿!éÊYÎ+D·Ø(‹¸:â«òÅI†qYP43n∫‰>W2!ìoñeò≈&OiZÃΩYí£Õ)ùîÏë\ÿ$Á≈¬1Ã“ úxQi˝ò;Âôﬁ’|…Y·π2
Åz≤†.-Â¿ªAbGﬁæóﬂƒ≤”ˇ≥◊h‹rK”ˆw•CQÒ£¸â¸‚´8˛ÄX©>uHè±¶ı€t:˚>	„äÅ ]Èvf˙Q∂Ù∞‚C<˝πÚœ2Ñ}jÅ‚ >dSÃÂ_9+n NC§%-LpçÃWa˘îöAA~"„Ïû™ˆMñ37à9`PÂ∑¢3≈m>ch<
øÛxÛf_‰∆6«◊ËÅ¸ÜÍ´œú‚C„v÷JµØ(Ωu≠uyxH›!G˜rØÜ¥™âÊ…[—Jx˜V¥–<~+Zq«Ñ O	·≈≈Í,]¸º@ê(ÏÒä¨áïU≠JˆB>ëÊ–º¢]hßûJlxõIöSﬁ+Îûƒ—b9“U¿e¨û	ö˝»-™∂D‡%ŸÔΩ±åÛC†V—ê}Œ∂OÁS°OqˆÙG≈Ÿ„O)ñBÜÇnüû≥Sî˘úÌ°ìCX±}+@4∑¶˝∏jﬁBÇ{R-»Ç
ÿcj1˚°	;$Ø …Ä ˝ai˘ÿª†4õH0∑ΩDÅ∏-ö`û=—jÛm^úI·ı_2ã¸iŒ"Ä˛Á´Ω=˚Å˙e{ùL'qK‡Ω,%ÉJ†èMŒ•¿íb ¬ıfˆ„u0'
ñ+¬%-$ò†i‰é∑@æz,ïAÿ&}£Õí‰Hîï ı%Ìåà {ÿÊ√™n0ﬁ°∂Q˘æ8◊.ÙaB,>&O:§)ö˝ f'òdqo.÷dÃuµç∞ô¸÷€(bõÑ¡%™Á˜êYó NÁ„ZU √J]∫›H}8M√Å` h¢ÈßÉòπVLm$º_á~ó¡{8˚ëö~:xÛà€*àE+CPp√Ï±=o4˚1öÍ‰¿!ukœ{9	<Âÿ®¡‡5!3∏å≤◊âÁO…HæÌMàØ1‘ÿ›W;s.{3BÊZnΩÖÇ2ä/Ú˝œia&¥ÆVîÅâhŒ¥’
¥Û@¡”†ÆŸ ˚ Då√£ëÚΩpåei¬d.’¬¶πpzå£c’¥«r…˙I|;ŸìÅf8	 >êÊXwW|j> ≠|ï›†Ú¯À@È°ÊN¸ql∫§ì E@O= Å3«â"†æ[sèêxﬁf9	Ÿ9Ÿ5„ïa¨|ÖŸÁêÈ°™%jM$§òr›¥§ºÚ∆zh¢¶≥≤27º"V÷	Æˆ»)=UäFÇë€∫Ÿ~ågˇA™%öµÄ<œGö≠ÕÌ Tè-ÅVk¢$˝ C¨\eKmÑ∏ﬂ}‚—„Ô§B´À0jµq≈>FŸﬂãÿ
;˘˝£êÏ6÷‡S≈ˇÿ.ÏÙ4ú}èg«^πqÿ=a2&€û-„æ9I‚ëúõ7¡«tÇŸ¥ÚM¬∞ÃF◊‘p,"¬]ﬂ£'∫·8ˇ“ÏG|ÜÃsâ€€å…w∫0z3›ì—@â…pOÅˆ¡%mﬂ	aù⁄√ÚÕπ7DG˙*·(èáØëT;E4¢pB¶˛3ÔHı9;Ûí‡≤äp<r-bøÙºaÈ—¡6ëÿÜ∏–Ø¥∞T¿m§®ÄæÿÆ~Ω©‚Äjm¥òj-q@Ò,¡|d"»ß:«√"#öàMf?a>ﬁŸkk[/B≠ËcËB|sπç!˜%¡SÁN≈¿Y ÙØ©Òv‘ÒcJØú°4Ù±‘A⁄2µV≥U\e£Aµ¶¥€ﬂa€‘∑ë˘úbéπ<5´SîÏFÓ˝≥áÕF˙H¥e‰JÒ®@€„∞˙-J	GÑˆL4eØÄCÎ®[÷ÄŸ9õpèxx{M—Ilü≥>gŒJ/˙N“Çˆ
{»≥+{äQ;eœ(*≠Ï°%+>◊É∆ ﬁ¶¿≠“ÆeòU≠Œj¯Kdïµ´=¡ :≠ÕS´5ˇéJà±(ößMÔÁw^cZ>Èõ˚¥‘πvIV—’r«O¨)kˇAwm_/u]€FÔK‹∑◊Z%%uÏëfClòg¥i…AGö]á˛._y˛0†˙Ôﬁ {qá©Ó©ƒÕ> ôêLLëØÁ˘’∆ì‘ßm‰ﬂL°y5ÓÕÓä∑Õê}.Ù¨{Ô(%êE˛õ?V‹ón¬ ïı>Zj¢z;M).ÉÉ70!9•{.X¯÷≈oÑ—’<	Ú_>6°ŸÅ;.X>Î¬ßt§2(í€î¡BœM`Œñz¿∫BMjã∆‹ ¿ëMLà∂≈]PÚÎˆIkñ≈Sã@ÈLê^„#R~u”DùYŒ¿À¶áûõÄ†,Ë\-z¿∫˚„têÑ\üc…r°°|Õdk—‰mÁ™…áÄNSf´@{Ñ# á¶[ÓÎ$Œﬁ }òÙÃÆ–™òí5ø[ﬂÈ¯åt/xD›el∂ãà¿5[ˆπv(ÿ˙t≠Œl‡H9Ë</∂[)W7ﬂ∞ÌÇÓ0˚<Ü≠Æﬁò”1"?V5,yRBß…@=V ¢kˆq4Mã0¢-&…™N¥Z√ß• pZpÛ«jÜìIë• Ïm?&hú≥V g4–¡sÒ_Pq›˘¸√Ù≠iÇj?2·Ãü* A≤õx~Ó4t8˚…üF1â…º)Ï"hE€`~ÉA˝n≤Rt∫∂íŸ$?µˆ5Ø±m’à¡k‘ÓSê‹zoRI^9âá◊A$RgSj2ç|ç⁄ƒSK9'⁄kù]bJÉ7ë∂Œ˛	k˝S«ÆÍµsıÀúc‹
·åTr∂—«∞¶r'1rç+ÊßJ˚®@%ÀÀÕHØÎrr”®∫	(ﬁ ∫iNñ|AŸ~ˇÁ⁄'V€˙ñ"n}Cëc∑¢aû{∑¢ëÃ…˚ò€I∏¥≥æÃ#?èàRòπÇèk·q¡≈UkQzäªMÕ¶â0uSÿ»úNõˆ:!÷ü:Êr«· ÷áÉ$≈†o1˚Z4ü^ÖINxıßNxy	/÷‘æ–=_—„∫hú
(u4∂»Ñ˘ƒ"ÚaUåI_69‡ Œ∑ÏjY‡˜M‡ƒ#	⁄ñm^◊éÈ©LdÚhñı›‡©ñ4≈¨1—=$r∆é>éÉdëe9UJåÔ÷°
‹Sd√È<"i2G¸9;Âü®&PéëExΩcu`˚∫À?∫”11…X£•€Ï@43Pâ[¸°lc;a±˙ËŒÙÛ‰Cößüπ(p4!üø∫YkU≤«lV8ºX~Z0ÀCÁ7V©ä¥üƒ4⁄&Ó]°Èé–/∆∑"^’üÍA•fÿ©L^√~{˜ôL“1Ì√ÂïÒäô÷®\ˆ™ﬂ[∑ªYà€≠/ÈÏH°¢Œ€…jb_’éπå≥¯mi¬,‹®<izéÜ<^_∞;†ﬂ˜Ãã2Ò\F†wdÿEÁﬁû&Ω®¶ßa4ª¢˙Ë ı.…’†´æøÿ¿Ïg›’≤Rö%"qÖ?O§c°ÉΩ< w·•ª¢ó;_ı_xyÁP:â¬¨ã≈Îﬁ≠æßÄ˘Ú»};ˇúv“•üêôQ˝/OÅq¢Ù“%‹£/îe>*I…‚éø+¶Âr‘Â¬€˜˜e∞€Îíjiƒ@FøÀLy`πu«πµ¨)eîDK`%˚âI(£˙Üx_~)„\¥&Èh™Ö©Øº43:Ω‹Ç$ÒÄ{ÒÂ+Õï‘(l˝˘
eö±´¥a≠≥Ω∑ß€'ªªoÿŸ—Î◊ªTÕå'4⁄É5:•4gTf\TmCø%ò'b–Tç£≥îØ0‹^XpñmkVéâÃù»ÍŒﬂ|¶OÖCı·ˆµÔygßV≈•CŒEënÓÓ^^b]ÙÆ3õ!G◊º'^X«∏X¨¯a}µ˚ŸgE Âãìßﬁ•j∑xUhﬁïÌôó2o|ªÿ˚\|≥Ω9ﬂ≈ﬂÂ÷Ú’¥Q„≠EΩ8@!KcpMEY_∞wù|‰<¯´™Qπû ƒÆ€áßˆ¢t¥Í'¸k™@Kpù·j©π,€≈$O	6X*Yk}XÍô•…Å5üNÇâπæ.˛~âΩ{øh$ÀhÁÂÎ¿œP˛* ≠?Ç∞ÏI(øt7‹E ˇUÌ$q˘Ú7é◊N„ÿ®´ûˆDd∞<‰è86úî7 §8)tú?MØ∫F4¿–ê»Ü¨‹Ñ÷7q/X˚o∑∫¿∑m˜^hìöùX”G9‡û"°¿Ï†òä4°––π˝ã≠ä;›ï!,,oY“P>Âå√Èg·≈ﬁ xoó∞$1(ï·T•&M†ø˜_í∏K3Ÿ¿≈Q–√Ã§›Ö›$âôˇè¬J„ëávÑ–€ZXb–_M…]S≤±E-QÍaÏ«Ï;€∆Œ∞ﬁ1Lñuú|mtínÔ°fﬂ4QÍ˝ºï\X \∞dQÌçQ∫¶V;µÑ†¨œÁDç—:1\(˚;éeIg?éI<éŸÿ´]ô¶+ÅöZ:â« ±1†e¿Ë
Ö◊Òä\ö≤E·£ë<À∂^dc:è'AÁKuµ¯SÁ‡ˆ˙™VîU5º‰CGü≠√oPUöÔöC’v)¿Î´ÜÊÏH¡§⁄Y‚∞&2ˇˆNâp˜ﬂnƒ©0ÇQ|FA≈÷Y≥¥O∫2c•ã¬¨ãrP<üöï /Mwækœåa4òß'¸YıÑÁÍºπ ŒŸÁ√}ZöÀµ.eÈ$Ö¶ñ›N0”˝X»ı6[í0‘29'˜,≥nËB7˚ä-úzaÇSªÉdˆot¨Këó[l¡ºci<v?œ1ryÑƒuπ^*QówSˆ8',¶ŒcÍ3gøﬂ=‹-™2gWÄlè°≈dÿ—íÀ®◊öÚ“#èO8¥˝Ò7∫Ò◊°ÑÍ’$É∂ÜÜ´H6˙\–"∂≠…–ÔÓ¶É©Én8:{~:óëç8v=jF2~ø{pÃ~ˇˆï§ü≥√£ù˛Îæ=};˚ßì˝#v∞ªˇ˙hQ#'ø¢…Ôß:Ai@;“ ;Ωä?äóõ–ç“µ2&À\8„QΩ’Œ™ã~„‹hg köO•Dõ¿e!We]–@û◊ì“	ác+(‘œ3ªZ∏_k`Ô£k,ÉMëZ]‹¯b3œíå±"ß˝$&è&sœX¿q\¶!‘‹öˆzä!¶ZbBı¢eî√9Êë˜Z.J=ÒΩùù‹|›éëPyÚó1ÙZoì-'ò:ñ˛ÃX?ï”˛ÓôMëê'7Ù“‰vyUK∑K6Zm≈4MÆ‹MjZû«â≈Î∑˚}ÀJiÜD87©±·Äbxë(\í¢˚ÃaxC(ŸpX˘aâ
ñ,)5aâ˘çvü∞?r:Û.»¯ÿóøtÀ„ÛNO—˚À)è0yÀwˇ9‡R rı≤Àôù„≠”,òPﬂg‚áa‘\5_H ˝„4HnÈù”¸∑ÒZß”Œ˙á‡3C‡‰[~Q¸/Y≥¶0‰ÌAÔÉ,}
D‹õ g´—-⁄∂∂®ÇçÆ¡Éqg…FÎ≈0Àâ~\∑öÆ–¬&`,⁄¯‹ì!S}ˆÆHÄΩ
FÀ◊⁄§ŒÓ…1ÖÁ}∂`ñ|OßÚΩ”`™U∆£`Öì¿P§°Ò∆Ïat®û∞™guÏË£<Aj}E≥Ô?cGlÚê%∫"#vü¬ŒMC¸ ˆ;¡Ûq˜00>–Å ù;AFô˜èSå∏é≥ˇXb—ÏGxoâq_6OÅ<§0q(˙√˛*8
«–`üà|¥a .Ò(MM≈çR‹&KfﬂOBﬂc®è˚≥Ô19¡È(P˘˜ÿÁ∑[¬Ç†U·Ï?–''é&oö¡í†03º†ëÙR3üëÛU≈¶¨Ó≤píniH!/ûóÑFèmSBä.5ÖÕ¿0â¸û tË¬‚!≤lgIÙª?Â∆îÊÍ[`(ﬂ¬ˆ»¬-XG˛?†)Ï±—áOÉÙØbz¸Ÿ_Æ1≠≈íò9\_‡}¯eXr&Ybc$E¥¿Q8SÈqgZtt°LeË-_÷jµ/’lê<S¿£|õA‚RüƒQ˘Óÿ©D`˝á BÛpDÛ'vÖr‹î‚∞Ü5{¢ˇÌ4"“0¢/ AÈîDP¿¡tÍâ=◊c_ÁÛ'rõ¿é„kh)R˙·˘í,-ÄçÚLn∞∞} èStû}?ú“NF ≈$∆ ≤˙√o‡F“<¸aÛ‰ægÿçﬁît§∑M'Y˚ŒÍ
y[<F&	ØiôS]≠–3öÌ'Ö’zÂìŸt„hì<p˙-è ∆£g≥)(Hü9ÕÔ?)fÁŒC4A˙BézŒ”O≠ÜΩ0Öı˘„…∂Ñ…˘4ãAÉè–ﬁ„„hÈ9Wﬁà/…º[#œ[ÖI4àzRFç¿\‰8@Ø|ìÏÃ~¸.!ñYÕp«c~§¿L:ƒ^¡7Pıym¨öΩÚ:H/Å†ƒàëà≥"iÎ è¬gƒW—iÕóY£M◊é—LÉ4b<b]R%ãÿ¿Ä©Tª∑◊—ﬁüÄ`:î¶S‡ï0
§∏:–’ÖHÖôaÃ∞qy¶⁄ Z?ŒL‹õ&œÜT±s¥˙Ä∏ud≠‚™≠£Ák¥w$NiiÃÓùrıÂ¥ˆÕ NhæSŒ™Gb™=Œ<ÉV~@ÃÖÿ/ºñ"ÈQsÁ‹,G:≠#9,".¨6#†j_Û≈0˝)9⁄(·≈T–ÕøGxéâ%Ã»«¥$€Ø˚;Ø ∑ÜÃ„á)Ú.å &D+m`VE9Ä}	ÍM≠8ïACﬁtöÇÓx!ÏöÒºB¿Âw‰'ñG˘˛ë$bâq™ãÖ«ªˆ8÷£Î3í0/öCÓ1
ÂñÅ@2˚aƒ≤ŸåDµoX…)`ˆ[Ù÷LRJ;E32˚iàíÀDëòyÜ~¡¥uaJí0‘låT»$ﬂ|{≥hf›;∆»R±iÚ¢ì‰'
åVÌ+Gcìm#ó@∆lçwí∂|n25y
8ÉÉñ»êÕ+\¨?ﬁŸìÚ3,ìÃ4Ç≈7àsˇ(Zö#œƒÂ1OSº%≥yÄl4˚„‡ÄÖ)˛á]Ë\èΩ∞>7xî7Ω¬mŒl*%H%©«¸/@ïÒÙ∆`qEÌƒ¨F‡¬#GSb‘ú]sKêk¿9–b—
ËıM8…ÎàâˆÉBüÜt"®<5ÚŒ∆›·sXq+Å(‡Q‰çÜ∏k∏Hù¬8P¬FÕEèÅvN'$}ÆIá˝\v™‰·^±Ú∞¯è/jÑ/√«ø!1‚)P˜pΩ›D
ª¬ò9•TåÉoÄø?=z4Hi)£òXèõo0 ‘ƒ”ï∑øîêq@jæ#©öâ•qdòï]…\/)ﬂÙ◊{CuN—◊±Åﬁæ]"–+nhÔ¥8ßnõD*úüéQO†É€eÑ’fpÕQ#$ú¯Ó	;Í!ñß∏àâ¥ïá	Ï¸éı˝PËo¸‘ı 8.»Fà∑∞Åq√í≈8^UHÑ¬Ò•»ÇD‹Å»
vob<Ã:¢‡ÄXBc ä¡€·uëàGª7–√Ù›Ôh¬Îù£YÇ	«äSASq'íC≤ã)ÁÔÈ"yÕ¸t^OAhÛíïS/∫ˆíéËÅdGZORÎD"#{ÃûØk¥ùrı
ñt'∑ÜÇª–ú@ü(m—ì¬5n?óÆc.]œÉÜéd≥d,±%D¡ÄÊ8ê4OG¢%)>”(#FÂ«bÔ¢Ùœ'ª≤Sµ‰J:DQ§#P ¯¢‹≥NåFXDÃ’›˛8I !*N»“‰e»<!¯˚®´πT˙
 7IÔˇiâB·bw◊⁄
cöÑ-,◊ÛaF/£È¸W	Óç∞≠\A‡Ëfd.E;M[hév|8	mC°≥≠ê:@S÷◊Ú%ÌÛÁ®&Ì~nº≥=V‰›–#òË≤„|k'¿Ÿ&zAS|•ª{≥≈¶ﬂ-±Ÿ?ßﬁÎGSPS@ﬂF’Ñ0B§ˇIºè™%–Üê^ÏFE3¶ûA_◊(–qÙ
ƒÕXCπ$(∞¬\°Ê‚köÚ$ELÿD!Sa–kH%ÖîÜ89iÃÕ»`û$∫-Ûå—èãò{xJ"ı•ïH†©¶5ç]b~9Ü~=˚ûÔ„<°{éó(iV”©É≈=~–FFê|Åp >˘H·è˝Ò%,#0ÀöÉ5∫Xg[ËÜlÖ´a∫q˛Vö∑ÀÇ‚Hß??ºËßOËD±9¬\…Ieπ,;$R^ èªñRˆ*û¢ñﬂ%öÃãëmR∞%îì¯¥‘íRŒ•ôoG“@-	}¬”‹‚«h∞8√f§¥Ro¨WZs§µ¥˘ò˚ö‘î"X{œ»‘ÿ%]z±“¬D¸ »ÅV’Qéπ™≤Èâ∞¥≥ˇ¡0ùK@C"˙%\%¶ b∑JÁt/ßÏ“ ê˘c]‰ÈÄS§{JôéÂNâπò:öê}ÈPÖQ∂¸0"L`^ê∑O#íó‘\”∆É,ÙqP€G>$¥'eËÂ
?GaN†óË,"ÖtËÖÑ ¸$GdÎÃM:ç§O3®âeäàR¸ï®“qAgGã%èåyå´º˘RÙÛ•¿√£∆Ë|LS«£Vµ≥ƒ%S–boá[‚∂.MÚ˘ôÎŒ~ ˝D5	£´8WÇ@ß1î ÏñˆKGã¶ÓÔóHî;ì—*!ŒŒp•# BSoçÅß¢˙FdüıŸ•á∂g!#D¬ƒ)3êi∞∫…Ï«ìﬂ¨≠„8àYSüèôPüW+Ä≈…Ì‡æ“«P•Û„)lÄ±óüÖiq!¥¢Á3zl KÑi≈y¢f	ò¶¸¸ñﬁNëÍSg.ÊQúüﬂx¿-bæôQ§≈¡mé¯e®⁄b#ÏﬁPZñÑÂ¨yÊò].ó8m)Âàﬂø 1èóraW…BÅÈdr‘´#27|Œrû[((àœﬁw”\ê£c5GI5∆é6‹ò„Ó˘H	®  ˛ëAà'!Ê z¯iƒ»¸ÙùŒ.©~ú[hÂ®%€Ñbh@ÑÛ ø Û$L3.& ≈é¡]Ìë{m¬¡Ïß	¨˘ÂÏ«îyöê⁄
ÀZÖ9OWˆÂ™hÊ≤Cq_ü[”î/·…›….aSEb¿ødId¬KdM%CÅ¬…\Õ$é7E™o!åb2¨•Dƒ˘NN´Ëã··!‹À}å∫t…|4˚˛:Ãqz«dtH]ª˛Ï‹KŸ‚Ÿàè‹\‘ô`~ÊG$Çõz∆~ì«5rP€»o∆|‹|ßa@´É—EÑ¸Äeç— –´ƒK√®'˝YP†ˇû≠≠Æ˛g∆ÎIq-äπŸ>Zûá¸ƒ&•ìë¸√ÕtŒóê∞‚û˝K2‰v.Á®H!ëc*=B»ı˙nÇß0Î@(*âwŸº…®”åÃÉ∞Ã);ıÜ¸÷£"Ç$"”4¡é∏ö˝[	Ñ¶É∂ Úº^8z,!#E≥ù±Recö‘‹jØO®öIJà∞
œﬂøìﬁà
ËÄBh÷#©è'Gòhîœ˛Xag„$ï‡ç˚$;–™å{Ñ`∂„Ñ‘â‡e	ÆàìûBéuûo1ƒH?F«@ıB:¯ê+‚-±!Ù ›XÏ∑q0æYMΩk‹ôxœ∏*,;∫5ó™/Ë‹—ﬁüÚÅPjzÚˇÚÅør†âfâX¸?∑8EG∫·ë´@&L
˙i9ëWTiÎ∆É 9A¿§öçá¡Ò5ô4§CA*èá£K,∏∆
¥»®p_^§ªdà«˚o(eI~’≈™o]€û˝Ñ>)l<°>@˝!#6I6êÜfa≈,¯¨@E7œß#&nÚ,Ñ∫äπ±çk˝∞∆‡˜·±^Æ«˙˘≥tˆÁF)…4YHÊXNTÙ!˚ƒ¶`l8j—ø#‡øñá¸4¢«ÔwáËØ®Êjÿ#˘£,«úÊ€i6¡∞x≠…õ⁄˜Cùòéè‹Ω]1£@yB*Á‘˜∫*ﬁ¿Tî–“|µáÃÙÀ≤ ;€|x¯¥Ô≤ÂUˆ›Úª/‡reh∑Û}cÚpÌÒ≈Ê™3¯B:R_z~∞Ø«2◊O+ÿ¿ÜMv|±YÏ[§Æy7Àó7n0È…ªg´◊WÔï€ÙªıﬁfÇÈÊMiï¢„@Ñ€4˙æª2çt#¿[‘P»Å˝ÌDKÄòÙ“,ûÄﬁêÏ›EGŒ	LIÖ	Ü
·¬ÿWb©äÑ@Ê ÷d™ªÅ±rZ,œ fY
õfUûT§x/Ç˝¯Q	‚Ø¸ïïµÚú<¨¢∑ˇFe¬˘ödÛˆ0	Ê(∏ÃÍ‡∏Z/ºcsU‡)kÑÜ¡/ã!üãêáÄ€’üØ\≠◊¿PLjÉf|AÏ4§ƒ-é2"ÆÄ π5äù¢;3w	*Ø^˙Ä|ïÉsﬁÃ3ÈUèÏú8íÆòxt@‰Ü¨eGp©ÌÇ$b”+∆±ô°+U€„OZ∞Ii1Wmú•Å"™8ä÷◊Ñ¶–ˆ.'*:…x≤ 0"∞&ñ3 Jøå‡®“Vç‚§TËáä‰(ƒIÈóùˆlylû0âˇŒH€ç,H-#°®z˚Ìù
_·°<PÂ+÷Q·Öy¢DX∆¿6W;l∫*–Ã›_¨P“çUÃä‰ú≤
ñ!£r√h
I>9f›cè˚ —øÓ¸`ÂXNOD“¬Ö~ïË§á;˝∫êäÚìû~;ıí¿ƒ+P@G†rLÖ¡KØ◊˚ ΩÊøH§ ÉŒ~ï8ïÉˇ+C)=©∑âSØqH\Õ5äû<";¶ÿ≈Ÿ_0y∏:0Duˆ$éËD£){P*…-Ø¬Ñö¿»ﬂö,?πé®#IE^¢¢‡K¯≥õ˝TfP/fÊÃì*Ω»÷<“	HÑ Ô”:qÿÍ}U˛{MaÏ0NÌÁ:·Ë3ãaãl4®9Öãr‡Qà;w‹¢j öŒ˛Öµ\+R/Äê-c‡,h¬Êú@~ãøÂ‰4Å⁄Ò—ªop
ä:ï‹∏  @≤ÈΩKùz∑N±åV∫U§ÑY+à~‡qºó—&˚R¸4ÚP‰çUL˜ì’’≤îãŒa*Sﬂ´O7ú·ÿCåÚØ-î¶zmV¿Õ1œ\:%ÈlZây3[î©ªSVúﬁ»õtªÁK,Ùoà}T◊.(¿X«¬ Æf¨≠Ï˙‹æ∏à+òWŸ’à[ PÎ.ŒJ5ì,ªÙr®jÜÕõ¨PGQÿ7rqà&»Á>¢πEè⁄'ﬁıQOä≤^T°øRNUv5Ddº+™LËW”™Ö%¸ÀæÈ‹·g˚[Y™ªi·ÛYN
YSäÍ∑aç A	CÃ5±eìkªÍ¶`xB’M<2E—TÂ§Ä´F9Œ˝é≠›£ÒF#Q0fWMó∫Y!Kj{ı§0cÎï÷ß( ìülCÊÛ˚Á+WOPûÆôNZÏúÕ≤T¯®ñπØ4%’÷2˚ò/9ptØ∏	¸6§ﬁW…i∫¢ì{“ı)-©/ác|´hkóVY4Â)‡‘Á≠÷WÖahCÌd*}€¥Lm%≈o˘íÒO!óÃBúõ¥Â∑È˚àﬂ”Ë¬‘vÀTOìx´›àöãÍïi§œA¶Ÿ≤¶`òÀõÃa¶-b≠\Ñ&5XÌÀÖL\XÅø@\!Ó˝<
Ö,pˇÚÓ√å¬óπíË 4j!6üIW˝◊e5è¸jπ{Ê∆ÊƒlI™ı€íWÎDünÈ¸Õ—ß#GM”K%˝ÊçwÈ|ÌC[E]HãŸªˇf	K¨PõNÀØﬁ∑√t]Ó¡D˚ U<%ìO	•+pf-ãßÖZ\–‘€‰víºÂﬂô«g6c˙—ƒpîÁ˚*ÍÖ≈ÏÉeƒ⁄:i<qÌHW’B≥Á0qÇƒ]ˆÍS?˚™∂'⁄W:ÿÄö5ë •Ö	˝£…3ào Â∆F∆¯:Ò‹…u´œê≠Ç4˘Q—$C£TF™&¿€PŒˆ≥^ÁƒåYJ…V-T=Yfk-‘Q‡÷ﬁE¯/Lçrµ—–+oñ)˝€∫ñ˛≠ Çï*°≈dù∞≠Ñ0}Kªßﬁ÷ÀnX%Tl¬a>	h(Œo_◊	lr–My≠èü	„§¡6l∫ØÛ•|Œl—£≤¨èÒ…∂¬¬|ÇB;sãÆÖ∂¥ªòË ŸöïÁPañ∆±÷»é≥∂YÀ«>;j°’'≥ün0A"ß¡tû6f:Õ≥∫^ì—Á/ÛrQOœœZ–Õ4öŒ~Ù„œ0˘ªêœ	)ùπÕÂÕh©Â"˙u‡%ü÷0·?e•ˇ|R‘¨ë;j\´ ó)xU«‡≠∑öû[°¸ı K∏ØÎ1&ï¿Ã&>œ>ÎˆΩ©˙¨píSÏªÏ’2…¥˜ŒS <•Óƒ∑÷yn££ñÁ·x2Õ⁄»s¯ïÖf/ !W å	ÇÂ≥ù∞lJIM(3±ÂRÑÁâyÆÉ%%÷Îı~Ú⁄ã¶03öÎn3!.ÂÑÑC®ô∂Ù Œaêı®˚Üfì‚Å∞%´	4„!¶Ì=®õXïô(ûfQ8¯⁄‰Íß∞µ‡5@}
õ[Wjí†scMnß≥hy¸≠5Ú˜À‘∑∞ö)?æ
Âc–Z
Öix@ï™„˘Y|£ìw”)ü…/??mfÃ‚.Ô‘çyßn»’À>ÂNæÕÃ:ø¯∫ã¶(?5∞-W’ûîÎjËmnî4ÃœêòÌZ“Ñ]ä¿%S‘:a¥9®VÉt0≈'≠È™z≠∞6 ÷&èÊ¯}Ã}:¯Öu8h{.ï«Ï≥¡uûû}MØnÒgÉˆu«—[ò¥3>™πhqBXx∑ ®T©±U–d<œ∑Ø.ÇŒq`¬7ﬂkW.⁄†£≤É–t<6!÷En<|;®£ƒ¨hÆºdiÓjíÚtˆ˚sπõ &⁄áù›;=e÷M_E%qXxbùÆ>àÆ :∑Ω∂¡ı*œ“ëùÜC«ΩálË¶˝˛°˝Õâ›x5uy‡Áö∫êÔ¸<>L>>√Î¡Ghx…c4æWØÁ;7√ÎggxïùüQà˙O>&Õ±§î≈Öp~ÜWÀ34ºäµÕÖq\ÁE∂µq”UåIŸzr˘ø∆™^”Lol3:ÍÅﬁ◊H¸≠*8äNµö¥ˆ4Éc@ûD«„uüÔﬁ c/: ($√^ouÜÜWªs4˛FÛcˇzºo‚`Î)¬»OG8-TWã±+o∑uí◊ùÆ¿m‰‹5Ô…Íîbê†¨s!7˙Ça·XhÏQUáÈü≤a˚ß,º<„y¸sNêå(S!YFâÁ)±»BÇµ)ÿœuÜQr1∂0¬ÙGhÒYPŸözÕ¡ö!’œnø‘B.Ê2_÷i|sDÄé.§p«Â¥JáÀc(03_Hå›Fò£Bœ(E	ΩıDﬂæJÎ∞Uªv•⁄ho≥âÌAfÅVá∂~◊U
ˇFÖú;àrs’RŸG˛˝ùƒÖ¸å6#<tUx˘∏†oóË8cÑo\^[Ÿ–Ö„aóˆæ•hËèÆ“
û:¥Á… AÅnîm†h∫’?Â^/i]∏è∂∫ìÿ˜&≥0Ö%•!¡»Ófi6G.Û“Qéyï>EøjkÈêÃOnñü	Æã∂U4”ÊÚˇ  ˇˇÏΩmo„H∂&¯}~”õ€íoŸ≤%øTñ;”	•≠ÃÙø‰XŒÏπÎõpRm±ä"’§dßÀm`.ããπ¿Œ`ßgÊ√b≥}g±wªÅË≈`0_˝OÓÿ˘	{Œâ íA…ôUYevWZ¢»xèÁı9bh˘Å”∑}J*É.ò>e@Éü4x©R$ce*ì∏CU8DΩN≠:á¢'<B
t∫;Ï@=w˙C;Ãkìfπ(∑ÑØ<„^ú≥Ωﬂ9>iw≠›éı¶˝™}–9<9ÍZkß}|x˜w]Î]Ápßs∏{$‰≈DÃ!'|c_#NK€ÉìQÍö‘|”—¯,ß9Bö'‰ãSˇ¡õ{ÙQJ|wn{ë#ø0Ä9u£»∞&—õªÚ=)õBK˙ßÔ∑ÎßÔ•í	≥À;ÁÏy¯Ùı…¡˛Æ{ŸÒÏµı;Àyaªéˇñß‡C∑ ãÁw†Kí>±"‡ìPA&u'Ah_8çË:Ïô˙áw<>≥=¬g=ÎS.ÛËÏÒ	%ﬁ~–‰Mßuâﬂ'·5Kö®åMa„∞⁄@c/£ë<…ÓEÂ¶ÄßOòt/Ó£íuèÂË„ı·R°ÆÏ∂,6⁄ÑÖ”Ò f	«‰¥—hd&óÒ>Ìπ¶KºaxäfB˚»tÏóoØ¡z‰.©47¡ºY™F“*M'P- ◊à∑¨É _/Hÿ(¨ﬁ}d nÔëÊ~É≥\?bÖs+"ÇFgQ∑zí›(Ì@ÕöH˝)ÓMF»vFJ‰(ˆ:/1dR†65§Qô∏XìEä£ˆÁm=4ØòÜ«„È¨m(≥|fb˘µ?üZ[å€çTB…C9∞Øªì&÷™∏ã$m±1	ˆ∫G]ZH-{Ó§^;©-ûÆJÿLÙÚâKIàì∑„ëj‡èı∏{@Ë;I¬æ˙àHÁéO8æò áyE÷ö5p÷õèG'T<r¶—@XıAØ—g_` `4c0¨zÀ≤˝kö™~ÉŸ œ‹ﬂ5B¬tÁ„ÿŸ¯(Ï‡Ë9Ω|äî˙4∆‡JÎm ”±˚C©uˇ Î;(-<É˙ì/‘»tE≈˜”«∫„ı1n`æ∫iƒgÜé!t√Œ7)˛,≈é◊Ì÷2|Fù∏ÏÎ‚ÍÀ∏ÁÁªˆ5MCRÊr∫0≠´‹ƒ™ı÷⁄&˝i≠kJ#zóıÙôµ¶kzZ-ßπò˝ÒM©¬q√á›b¢uµéG
˘NAÃxëZZ_ô%“O£aΩX” ŒbïJ›¬Eu6q»w˚T¸F„‚'‚Õ}Ë6GµîeÀsè‹òéâ4,;N¢™IGå≤oDA«íΩdıh#$´‘.X•∞ÚíÁzœ-ö¬∆≈π«‡—Ûg7¬…•b∫Â©¸≥.¸‘zƒÿJç•©ü†âDa\ÒànfµæÇj8"v/Îÿå…ÓEå¶{JOtﬁ2<Iy€„p˝éı.m˘iç§@où <‚ÖQÇr16n#«i+?g9•,∑xærÎätÎ√X√N„≥ëh —,ÊßÒê§ÕoS0jÎ∂uQ™ñnﬂ∞â◊+æ‘òtÄ5}C÷†˝Oo
÷>a¶$?˙/∑D”«ØŸﬂ£ ©b¢,ZÜó@À\ür¬Se¡ÂÈÿâèÀ˘¶8zõ±¿Ø59pAø∆Ø…n≠HΩƒ∆^FØÀÛÅ5qX‹Å—ÚavÄ˘óùWÖ]%~ÿ˘4ùJ+çX÷hHŸ0ã Xl´®Ö‹·ºpcInVª6+ˆ˝¨Qe0púñ‰Ω¨¡
äı´B4IF≥ëîï8‡˚Ö@vx›‰d∑2^>&
57vÂ§Ä˝qy∏¸u+îìA«A?[ìã¶c§>õ™èã‘∆≤´ØLùæaT%Oó¨%C¢—19/‡fi)ÀRØ¨Qœÿ7EÎdì*3>6Ía€¢#yÍ£·ˆR©S∂4É„Ü»3öFﬁõzÚËM‰móÚHöK‘¢⁄> ≥∂ÁOº∆·i√ßÆ◊∆ìÂ« 4ﬂX—‰”'‘òö†7„èp˜≈Ò~œS(◊Y! ∆P.-s(3S»ë 1ázÎ‘¨(!4?#g‡NG€oòhi•¢Qáx+…¨U„@0mª‰≈ínïî˝J(E¸B4io2WDÅ∏/l”â8¨·›¨õ{2l £TO€ªxÀœ#Ûﬁb∏ë–afüøÀÏP›T˚≥4Ißß§◊ò5Î[ßj«ÊÌÖb4e∂n÷g$.˜z¥X©Å˜ULè1Ü€®VE0ì4√∞íbu@ÂI‰†¯V‚‹ã¡y#M¡∫ é∏eˆT|∑)Kq¸∂â,¿ºä@¯IqÛÉ¥ß∞ô	Äÿ<Ö i™Ô366Âè◊oQq|Á¸∆LÜœn÷åwÃúuJ÷\ﬁ˘RÖ±Sx%ÙùœL ﬁ‘€<KD∑"·«ƒA±≤;a±F>ÁÚ¨Q∫Ôåeü±KΩÓJ<Ï ΩÈæYUGZÂTX6Â˛ÊjÅ@ÇÙ=ﬂI.tê¯Œ	h«‹~Ø›8g˜›ﬂÑém%Ÿ2ÌÍÄ%Ä≥˙=¢π-Ïñ¨	ò[Äw:á'«Ì}¥ ùÏΩ‹€iﬂ˝Ì›øÔt≠Ω√ìŒ˛ﬁ+¯ΩCÊ_xMµò‚	”S˜ñ15K‡ìÛ’ éHÃª˘Áêeö!Î˙8tŒûÏõ%ﬂ≥}ÃËQÔ†ös∂b∆é•t®ÇEnc>‚d+∞!ÿ‘ËMÃæ î‘˜;l{ﬁ°|;6DøÒç6Œíeè«{É•ƒYıSZ¶7¨%	¬W≤F◊ËËãj÷Ô¨<4·0™m◊„€˜b†^°Ñ§Úå†*ùeA§¥8¢fÒ“ı˚Sèg'‚qèbœm,íY€ﬂƒﬂ§IIò√f}KoÂÆë•K<√us∆üÆ-Zè–ÊB„ZK5Ôﬂ¡ 1,	Õ+&MΩeXX˙B^ë∂?∞ãcÁ5¬ÙÑÜ%—≥π9~ÑUôYÚ|^ÅNo`:èΩA^!‰îl⁄$ˆ∞\îlÕÁ'‚π‚jƒ6—µﬂ∑Íﬂ9(ø∆Î
w≠¸ Ã*~Â≥ÇŸ∞“ßdLvˇ&Õ“X"A“~g{–ÄG…F9ÖFfH…◊ÅÄßo»»în-zg+.M0≠ã{Æ."ú‰^Èÿ>æÅ*–óÅ◊Ò‹™M¬©C‡§l§Ö”Öû8˙Ô`&ÀÑú,PqçIù∞XR¢€ÎÒMZ:˘o™`‡DÒ◊[≥é¶<¬à ◊?¥ï1Î&…åyˆy/∏ÄRÄŸ
ﬂ˝û'≥∫üº;Ç®ÜGrè…3ª}Fr·C]:Ljî‘Ë|TKNñ⁄xä˘‚‡Fmb¯ó5üë·‚e_ŸÓÑúY∞™q)á<˝êô¡dôdMâ®Ÿ9·Ö≥ÖÍ/'cÖL}}¬Ã®ƒcxN„ ˝˙¬i∑Æ>ã-€s€ıú¡˚Ö%ﬂœıa;ˆãÛÑ…Á≤ç<]ØîÖ{Ût1+SÚt1∂ºZ<NdôÜ#b¯[ü–õ}Goé]KdnmJ0ùÌ·…™.›»·j¥ú@ï!òÊªÃº˙¬Aq#I•WË†$#jT]D∆^¨µ∫ﬁHúolÍﬂ.ä)…7‘í!±e-s≠âdûUÖÆ,2ÇZ·?IÈQô§7˚¶Û#Ÿ°ã¨*∫Å»”ËıcäR·Sôê◊ô	9m]-≥)Ÿsçl«…¬W-√ﬂ„§¨æWå¿Æü1ÁÂoHS«·yI9üúpˇb(}πS}n	]◊ﬂqAï“”™Rdr¬öQ∂v4™êÆT˜_öK≠–ùj)Ê0;t¢˘§%ge;ëÖYœ9-–ÖdCâäER£ µJ·∑3ÕjÂ˚∫‹'¥©˙‰ΩÑVÖP“ô¢p„NÀ!Âl!ÄAÚ&L7…âE7ö´ÜDëUû?ø±≤ÆÛN“ØÎÊßÇ]<	ÌhÿäwÂØ≥ˆ]Ã˘{O*ÂkBâ∂9ˇÃÇŸu<‡\ÉêR$ˆJÄpJ@p¯ã&S>èÖxë'¢µ“ï¶€2À§	π¶b-îfûîQ&≥3k?≈YœEIô5‰9ìr*¶gö|S±%8[3M*Uöò√‡8xÌ¢y-B[ØSuj]œ„Ë3‡%•öŸ[Óe}$À/|Ö$˝¯È≠ë.oöºHvòBÂ9CyíT#ÊèyMùnR≤‰Rœ©4[Q‘m˛>.fK¥¨éπãAñØ}RîãKYcb<æÄW≈Ê*%^ó=uGΩ<+]LŸ»<ö’4.r®äe÷ÖmÅ"Ω≥øwÉGÛ§JaééÕHÄ4Å:}ÃœB,Ã¢<Ã2‘9áØ@añØ-˛!=£MΩ‚uìÂN√Z8)u˛£∑1¸Bï∫î¸Üõπ‹aÏ…∞h®êàYºÅsnOΩ™∞IöÑr*“¯≈ÚcﬁzjÂ‘9≠›&±≥Öè§.oíÖIºÕfNÚ∏<ÔãÇ™ö’“Ã%≥ÌFÔlœp;\ùœU?ÅË§ﬂp5;@ÿ˝–Å5ï}õÉr"y‰¡ˆﬂ≤Z´÷mU ¶Y¿óÙ˘"GÆø|U…”∞®¿˚ÚÕ‘%{á‚ò<Q<AAtÁÎa6jÖ¢iª˘†G
L9⁄±ÃâÿÆB{\≤YáÒÇgæ^Õqjõea«W2B#ÁÛŒä…gJ¬¸7-¬∞ÖWF®U ˙Xﬂ9hDPõ⁄_©Ë~|˘Ú≈âÚ≥‰·7∂ãöLêÜwˇ‹ΩòÜq‚Gq;√B%ã!πçêÈ/VäŸ◊+∂Q	áT≥∏à°*…Öåò5€ªÃjô¯¥¿Êu˙w?¿Aè!⁄‡zsM…∑BT‚Yæmı–wÃº*s0	∞ç)ªrjºDo,Ÿ¢æƒ·ŒˇOˇÓﬂY‹…á"‘oÍO÷√Oµ/›(†ﬂ˝Ä–|¯öˇ.Éx∞j÷mq¿•ÆMdŸÙø˛ÎÄ∞ÉÓ˛à‡Bˇî˝Œ[r‘¬xy.Y˝°="ü«≤ì&ˆ1hÓÓÏŸö#¯àç˙∑ˇè‡˚d˝*âÛI[∂è&cg‚p˜)äJê«±ÖÉ`ûa‚ébõ~ˇ?[m∫Ìy!ØA?sÆ‹b ÌKœCÎ–eÁ|ñ∂1œ©iˇŸ:¿õ§r£&§Mn∞bÿow?µ	`€π∏C°Gë‹∞Æ=[ãê¥Uˇ¯ˇ’ˇ˜_ˇçuˇD82°oM€	FSˆ˛ÄZ}∏–6àﬁ›@XfúBtDëÈ?‡Œ<€⁄-ˆîUÔºÿ]‘MüÁ≤©Zb1>(›Q#ô4FcF¥ƒô©i‹7Fl›ø˛ΩµCwauÌÿ$™≤c"mùlÔ¿V⁄„ òEr‰ílo£ù.~£÷ΩgÚ2õ3ã_¯rΩ-Tßb	∑K!)ix‚B¬W$ç◊Ç⁄åîipRÍ⁄€√®J`õhƒbûzFÓØ zªPnÁ‹™7a1 √lqZG◊'&3´ßTL,3SÖÑÍ≈pp˚®uÍ3Z®Ωéπ Rè∑xø†;¸	Œ©&¯ì<Ú~Üƒ‹x•i1ƒpí‘ıØ.Vç‡≥I,"7.æwmçòûÍçÆàoäó œ]-có7‰|·ÿúÂÛ†?ç∂§,r
<ƒû‰ì¥eüOPWç¥Ñä˙ò>®<#˘h∞[Ë2Ö!„ßµ⁄{~+qz‡„Â”ÓPˆ°•âÜ]™$≈DoÛ/Rèÿ≠°C.Î¸ÎUÚI1H›RRä¡Ä¬¿.ÃÇˇtÖ6˙OY≤+™)å©1∏]f¿\˘ﬁP¨…'©ù¯¥‡pˇ~ÊπÑÆp≈¸KË˝Ÿ¶4ù|˘ëgƒü‘àó¸Ké˚∫åÄáaPOët-¢GÙ»v=˛;}Vò8∞`WÚg‚ØÍcË,zhG{Ä?,ﬂT_âhü±p˛Çx+A®¢õÙr≥µ&ºO¬È5˜∏O∫(‹#ükÚ|Ãº{ªã/±{/qˆR©äÛú…kÙ÷≠<aHd˛MWó>jÉ/Ñ7¯ô ´FÙIù¬5P}¸x∫\1ìê·ú¡}=™◊ƒ¬jp†Ûß3@FiF∫∂F	¿Pl}‘íDÙœîfeOZb·gÇ∞Å(≈Ëz]^P\Sò[ß
7áWÚ°∂∆Nàañ¨˜b˚È/2Rû9›Él{›˘Û:˘h√È≈`…C'ñH·sn_¬ø6%◊˙(~‹Ï∂(EØoµóRÛôó¥‘â–˘Ì™{ì<&z…J«ûôuå4ª.&«"@{Í•»MÁz≤èﬁˆ ⁄DŒ≈îpÔ=€YÔúÇˆ°2(÷¸¿¬k»ô	ÂN{ˆµÿK≠kíÙee≈B8l3±bcCÎ“µ≠Æ^∫}«˙M~áYôùBQÜ÷•¶≤5»™@±ZƒJ`–äá)s/lòœ\òIÌ±¬∂%¥ ô∆§†ÜT	Ã®=∏÷{a¡Îçh\âc√'ÈÑfÜ¥ä@Úù>l'J˛òÔd÷ ≠.tΩª?Z”ü]¶9 mÄDØH`)«hßƒVl#.É˛›ü‚˛ÓàÛ?¡ñ0RŒôZ—»'„!¥gÉÊ¶ÿ®ê?=·d¬&Ê6ÕA[p˙5‹ã–˘÷~Nˆ!Áå+ë"-'ìq¥µ≤“¯À¯k¥<ˆ/Á(p¿∑T∫≤—l≠ WµNˇl6◊DA•={Ä±üπ÷K∑%ﬂ≤NÅØ]≤ö¯|züˇç[6¬Ÿ∑∞Ú?®÷0	9ZÅ€X».Æ$
"∫ÍË„ Bç‹•«êπheò,ª.,èÑ˙Ò%—è5Ë1¢~LR’$ m˙Ñ‘[l1˛§÷ëÈN¡¥≥ÑÀé“‹C¸yá˜mvÛ√kt£YƒÇ ˇkèPGg≤+>î5êaÁg6⁄ß›Kgô;J/÷œ°YFÈ‰É‹	√ \XTyì[ãÏúì≤eé¬ó9çqH‚.ÛMœ¿Ñ¨c`ìCˆ‚ÒvpŒ|⁄H.)äãWß[®çF#A‰)-ã÷íæ$íOΩ÷Ÿ›ª˚€ªy-˚p¿¢‚Ä«∞=˜˚`äÛÉ*]‘>«ŸL—rïç”ˆ%¶ı4L:ù≤ÅLŒ+-ô7çµHà¸+‡àTÙÇ!àbbÄ†∆ñeM‚ 6˙ë?í◊	†ˇÜ=Stt»≤â§î˘QËcŒ*ß∏bœSó_∫R3ad“æ(‘B7ª´ÂÕèû5˙»|Îí√IàÉêø3Ó-7Uø)‰«ƒ≈uAì¿√>¬†áÓz∑f≠7á6ıD°ã«`+„bæ^›5BåN[°3züãhñxljT®˘⁄Ôß√VF√L	ë+ÜÄôZüæÖ≠#¢©¥4ÒB>¬4…|õ¡º§°˘ôWÜ≠ú˛Vuç`{ØÑsfÿÓáŒ ø“Èê‡í°-4l{Û']f°„;H$@"S≠w¯À”EqÔÂ¨s≤ÜF»ˆöèÀÄífé§%cº*¿xä[éﬁLÈŸsÊ÷…%˚Œ˘D¡¶º	í§Ä{]h∆KÁÔ´s‰-MœÎ]Èyõ,?ÔMãoRêNÏDà¬Â.3u:÷±MGh‚~G‘%Z4JCu'âÆRÍ`°'n5JÄ.`ÂÆª1°BW∑·Ú),‘U'fõ kbn< *≈Wì®¿´Âµñ5ƒ†sÈ∂Oz◊Û∏J^é«EÂ~°≤⁄®M¶'Èﬂ˜ÀÕUm±Mã˚ Í3óÜ’ÂÜsCŸË‚ì¨,†%”â÷~íác+SD≤ù çQ¡ÑîµT?†Î¬9ÃW‡ì¸C…”˚®¶!	:‘PçoÎ™Qb™òõd*ÍÁñÙΩÅYd⁄ì˙*:t’û◊ÊJRDè‰G˜Ç	˙˙7„†‚¶º¬ìò–u9˛˜j˘kòÕØ+∆ßsπÉ°u^ˇ≠01µ+
\u‹ÙñäÓñƒ)£fVIùÿ‚gfçJ´åÆÃÄ]08©{ÏGrèïóZ∏êƒæÀd›⁄ÌL8»¢?û`ôSSdØe√Ÿ1p‹ì©Õ$	=œ¶aJc∞u§z±d0Á8R¡ôú¢cg~%≠˙aÁı€É6∆≥<∫≈Jˆ"G˛ài)k•)« Q¢s«≥˝¿A√Á…\3Ì	y¿—FãF.ªR$dö~<ÅÉ&'—ÿï4—¶IÎ¥bJ·©≥p∏ºf!yiÃ∂wˇ"t.ò–ªeå}´≠ áSùmD.6·πG5¨òÌ:S◊P∂ ygpçÚ¥.µd f”=Ú‹™ùﬂ•«‡ËyÈz®X?éÕv…QD√aDYÀI‡Oh]¥‹ˆ)÷ƒ¶q§ŸMbbf±Ç1ˆìzêM´ûyÜxàC‘‚p◊À_Í,ÓÌZœôÑwˇØÔˆÁù Q‡™Cõt>∆2” ù6◊ŸNí›√ ﬂS(håZ@÷ëó ì>ä‰	MÆbÌh•ì¶d-YÌ(QM¶^®Ïã?∫˚·“!u«•3≤0qÿ8&˙‹¢Âû{Ìc$À≤%∫+YlIk2E§2·êhLNŒ9^ÏÆS$ÆÔBÉ]]ÍË 3ıXˆ›£â;"Õ¨ÂXùè∞§Ó ®.µ?ë•ˆ—`kåÛ<ßÙnñq§òŒ®T{•© tÏs¨““`L‡≥˝“±K»¿äéı;©÷l&n9'%vAÑ˙58qa˜l˜#j÷`Ï&∏Za•πY+h·c;w
õ7∞Q)ÁOa}‡ñ1éOI¥¸Ó¥7r'œnRSœ≠é	,ùÄ2eÊ9P5(ÁÒ˘*ílX`öj›4r;„˘ÀDé“ú∑(ÁH/ò~œ£piºvÇ—Ê3®‰{òõf´ÇÎ‚Ó≈Ã≠{Y—aˆ“ˆ¶Œ3Y‰¨Ë(ú:;œ∂ø˙ç`x[‚û}uá„˛5®f≤Ÿ.,*0ñ& ‚Ö^IòÛ•⁄[ŸStà™◊1¨Ä&F™Æ`√Xí'∞∆Y_M!NÓ√	µÊ_Y°íM÷p+
Ét˘JÃª_¡Eöl)Çb\ßá"ü„u“∫Æ´úõi]¶yJhaÚ\±˘)êóéèëHwˇ@aõùeÙc˝ràπ›ŒIe®åOCf∏á∞Lf*Sî/ó6|äpÄ~◊·>)¬â„9£ª?cn„k«Ò¶f¢ˇRH¬=±£˛ß!
iT¿'·?∆∞ùù!Lª>[®7õã÷7Oæﬁ‹X^_k5+éÀóKx>+SÚΩ|h–Ω“ ‹*‰lüÑ¿|9Q˘Á§@rÙœß°Cjÿ—óÚÈHDúuˆÅJ‹≥j‰#]0∆mà√/áNå°⁄+X¨s“
1Ô”P
9⁄pN:ÒK”è|Í≤/ß≤˛iPÉG*i~Ùß”ZûïøÜ]. óÀ◊ˇgrn) '™Vπs∞X!Sp5@´BÙ‹8ﬂ8Zª∏~;E∑‹8ÊÕı£âÌOÓ˛ﬁw»ó3ræµ-åeÏùã©3"„ñ‚v_êùÒ‰j¸£ë†Ò_c~‰3FcÅrdÛ/§æ(
iP|Ü7té·™=Zˆ ÜD4qÓÿiæ◊´£Ãå‚r‡ŸèbTØô@TÙ.≥≠€Öm_Ïí≈–∏:™∂¨*.ﬂÃ¸å»*	¢ä`BÛg?„πß|z [äQDHŒyﬁÎ∂"öätfo‰Ü›«Õ!ùûq⁄Â˚>>Å2‰Ω13e‡pq‹Ò'A&”Aå1`∫_I`¿üö$ƒê$·Å$‰êÑNä∏G—?™“â&1∫h êˇbhá◊˘‰¸BÌÛs°Âö©Œ–·ÓE0·à»'E¯1+÷õﬂ¥ΩËì 5¿»îiN	Ü ƒB%°P@î÷U0 ¯±Ê™î<—T¨“H…öWÚM°f/'Uc#ÒË¨Jªâú*‰bœã¿≈9aUL2…àSHÿÒ⁄pŒ•h&t2ÓRh‚ï12+å^
dƒµ∂ÔpWW¥Æ9SÇ
PˇuXı∂?w∞dπG]+òZø!ê¨hëƒß®‰kKÿˇ9¡98ê∂Û—Ìπ°ïE—éÎkË;+è≠iÓ’OtBAH©C*°ı≥¥Ö“JUT…ù_Ïî`oV<#ípi=8⁄Ãdz¸(UãsõbPµ∏YVﬁ¯ÕÜA¢—\ñò?J[ôOETŒ*0Éä<çò˙ëÂp¬·∑√*i•ç“|Io@ÈÊf‹Ê.I=ﬂx¬é(∂"9ê´ç◊‹≤ndΩG
¯ﬁØ~eÂAÔYœÛ@Ìd
∂Ú/è¨Ó€7G«'Ì›#É∞ït¥Õπ≈WA.‰˘)é¿0—ês˙$ìtÅÃEeê<Ü…ö∫†»Œ5⁄(yîu™w‡5J	ÖÑçvëa°S»’…t…£ë«˚ûávœCÜúAWI)—à‰˝ıùS=†ûRRlÅÕ^iâ©’°-‘ãÏ·ß˚¢“¥ÙÃYí·xÏ˙»ä¡f~J¿Q"<ÜŸvN´¨µ1—ÇŸ!à4°ÿe†?mÙ«(∫Õ(ÁbY¯ûY≥˘‹ ‚ÚÆ¨XÀÀÀ—¿}k˜»:Ëº8>¶ÌÌ…Q˚§s∏ªw–9<9Zƒ«$ﬂ◊ÇP√WJÄ∂§œ·kéŸ;æuézﬂ¬„áäıÃÔ#hˇ^˜®;	ti±ç=wRØù‘OWﬂão¡™a@ÖCx:ø  yN}u…˙zQÛ:9§?C8éï’ÄskPØè∂náf‘‡A≥1ÜVåŒ+A¢·çóﬁå‚Ò*…	«∞8ú\Ò[Àhtõ∞∂"VØC ∞„Ñ‹fOù±
±Üõ[±,û+Ó L='‚≈‰TpöÈ÷{,p∑Û≤˝vˇ‰å-≈≥7ù„ÉΩnwÔË∞[˝Ö§˚“ÏëÆúÅ‹Ha8ìﬁr¶!p"¸>É'—#ŸIœ5]n`Æ'ÑâﬁlY-ömq  ™h∏~ﬂõÇ‘ã•,¶¨[ö
•≈‚F@æŒq¨Cuô§h¥ˆa¯zHk´ç„∑k¥s	ìf~¬¢uk˚j+Ú]Ùj¶ˆë¢zà1Ï˘mÑÕ·Ùœìièc-ßÔÅ"¿t‘ÎìtáOÿñf/V∑‡-ˆ@´ÏÅ5˝ãÍ‹€]®£fìOØó⁄Â:ó®6Ù`˛ÏJÖÆ+£Vó/*ö˚7ÌÓ…—±ıÊ∏”›€Ö#ØSªœb€oˇ˘ﬁ˛^˚∏B°ŸuôŸÔN‘V,füw,¢l gö˘qØQµ\Sb2CìKàâpB
5·Rx±w“9>™©€≠ÌM˝‡h∫C—ˆ$ûÄA lçü"6Jõ6:Î«œüΩê≤}âΩ∂±Ç3
ÊcÚO¥3öã∏Ze‘™D≠"Pà¢¢ÃÊ1ØQ@_ìaä‚qRËl?•≥“®˜ëv˛ÍW¸ÉûÆˆ9[∂Wˆ@Â]Tè®¨?>«j•Â∑ËÉZ‹”√2F(•7ŸGyD3Ekû—UE–MJM…=Ü&œ∞3#MuπO¶¨ãT=Œoº¨”˝0ø_Ú¸∆•(
Ÿ~õê{_ÚπÊ2át¬¨H<˚.üo¸^Ã„‚Dñqq&á å«i≠Ω{∞w∏◊=9nÔ#¥s˜-»{á( / ∑vééé·=Ò>%d•5»ÁÀ"ó¡Ñ±:8ó˙\⁄â–ª…W)≠I≠&'AÒ2}¡”Ù÷~Ú5?
óˆ;]Txv≠N¬ñt∫(˚øÜ∏˚˝ÒﬁŒW÷Ag∑Ωˇ∫›%…_®◊çú»ˇ.Œ÷ı—ÿÒ©˛ΩÃmm;rz9ıº®è bö‚“•B§Ô839E8É¯=í»X¢›/biO·xÛ`’Xµ+w2<aıQmª.}ïk£õ®Ò °Ã°Zƒ;rÈò,]Õ©
DÔπB◊°íü‰Mt·0UDª?teQ?ëÕq˝Ñ$d¶”\y‡£Ü$ÎØSµ1¨Å&Ê™9du´Ô¶YDèŒ…◊w—Zfô,=•»ÅÀû|∆®xö≥îo.ˇûcsŒâ,Ó∫ÛÀ|¬6ÌÿæH≥_?ßHß3Ãê·LÀÁw·1[»~¥ÿ  ÈË70E…∞,
à⁄òµÑ7ª·9˛≈dhm[´ã…Ë4÷º^£Gòî"U´AYS´Õlô'vbxÑ∂\ÿˇw?
Ük¬ûeè∫®>`«Ô+£6aR£8&Òõ|`&4EÁèa4≈ÿëé‘ë§u ûâ#v8Ë®ø:úôn,Êr	‘A]kXÃ9≠∂ùªyËFùﬁ@ïkÊ÷wB8¨>@2ˇ@N*,@6é…»˝†“3∆D™Js◊0›qÎfMbHπÌ>` jœ8;˙é‹¬>©ÖJ∑HÛeNΩ óâFRmësDc;DcÖ\”kÁlµqïMU&økIµ¡ò ƒTëÀŒ8ä,ØÎÁ$ÒÏeñCº”à´dW…hÍqï¥âµ»_îøò≠Jp¨€´î%+¥Í£RrêÌ÷ïÈWüömg∂)O—€èI]Á#›˝)R˙ƒí¸NîQD–OöΩ 	_≤2ª5©ÉgBê”(ƒ ©X(aÊî„}îemŸõõ¸Œ⁄∑Íåli≥Eq¥gˆO{‚zÏ«”˜øVœMçôØs<1)õ¨˛˛<µö-¯˚’W∫îk$4h@„ê1˙+«ÎãK›†v÷ÒLró¨¶í÷Çó¬L££Nˇ¬_¡µ|p ;A`'Ÿ∫…$ıVù-|R7§ç⁄πOﬁ¥¶ÕÈ5ttâÕ;≤VÒK±=gY‹öº´NDRNg_˚K€ÁYÿk/Å±
„/vx˜Ù©›]è›rÈ∆_¬	jKJ9So»øÄ´$¡÷z¨∏£Èd ?ó…Ì]Á{ˆ9),≥b®k{˛¿˘àv;åú=¬F	”a·Ù6≠¯á«7‘ﬂ”ÙÌ˜∑Ëxˆ¯GÓˆÉn6&¡$Ê≤1I¯⁄>;¡‘ü0Êı¿uuΩ„ö•i›Í⁄éÉÆŸ;‚Ígœ°2†c˜áåÍ…ãûUÒ’3-#\-6ÿfÁ¸á∞3cCEÒ˛/Åƒ’[IÍ˚≈¢1Å—Ä	H≈å∏≈mRãmìøìaÓÛg>·0sÎXhÂé¥LF0Å«Â·Gˆ;è?∞Që¯¬l÷#ÍŸW_Âf± N"Ωa:â\ã^\Ô0∂‚:órõé•ÚZËDSèD2πwµó	T€Rh^˙TeÓ`À}Ü1¬µGœ.øÂ<Ü)Œ	ay‡xÃ›˛üïÙ0ÉÊ9•∞tfÌ+;‰¥∆˘8Ÿ	º Ëvç<OÏQœ	—E%ßDÙFÜg…ô=ãû/]{˘⁄AÎlúüÿmˇÇú{Ú
Çá°†ﬁ/f=˜I6∑ø¡ûúæG˜Qv¬úæœ<}õ-†`¶87X<M¢¥P<UË‰∫Ω©Àƒ«jèW7LfÎïÙ√Ÿ
É»1ú,ztùœ}·3UVF2Oq	ÛOìtG…	Yq≤ÍûCëØxπ¥äeóM"˜ÓﬂÁsâBnÑ∏¿÷ãª0áúmÌ®!D/ì9}ﬂ°BÌ&Õpj{ﬁ‘tjÈ—xjÈü⁄≤2í©çK¯ƒS€(≈A≈Ÿeà2jö®x™L∞√cèùX’c1ΩØR",ì©Ì¬1Î(ò·Ã
~Äì?œØí«†∞dñÖ¢>3©M‘‚YLƒÔ‚9‹Ûπ7ëŸ1¶zÙÜ6Õâ‚∞]ô˜ì—æŒzÚ⁄ˆ—–˛ŒîûO˚√f√l„ß„9åøÛ9O√±g∂QÖíÓ{ØäbÙß‰=æ3.∂á:µ`ºêOÌ≈Ÿ)oÃ∏ùäå⁄˚”’˜ç§˚\ƒ’dÆï
çUB9%6´óH˙«¥8<rfjWº¶%qÍ9Sa©ÜHS^y'EV˛V£◊·eÍƒ”!pÇm
J}1aùºFë,ÊÃQLäÏÈ Õå,≈»3k·EÄ˚sA±á∞?ia€œ¨T¢•wPÛ≤®+fd\õByu3%5[ô¢ûhã≤Òú`ã$9%¥√‘‰ó&øU$…ƒßÊ∏Âù@-∆(,~Ë†±Ï“∆,Ê©q—Íá.èÆöÜì`	£∑∆n»R"[ŒÄ¸p1à´>∫˚√Gê¨í«ª? 1:«0,Á∑S«¢EÑ=¢ú #ÀÒ˚–Ôoπí’±ŒÔ˛HzP3éBπ4
òhåV[¸„i˚ÒM∆ŒÃ99Êﬁ6¨=<mmÀﬁHQ”∫t¬ËÓá˛ Ë1Väòb§©A√¢4$Sú!`•É¡î9l/Yów`ÈÎÓˇ∞F®íΩpFÎÓÑæcıúWJAß‘Qe´3…SGæ˜ ¡ÉæΩWg#.g!NÁ≤Œ^ï&Q¥â Àﬁı{¡«=Ù≤Õw\X%ñÿUjRJÍNlKè¥∂•{6QµºoRã≤=ë◊w⁄eFDdré|¿êXø;{|3¡'‰Û+r≤zïkx¢ÛıàË’åGSéªh⁄˚÷ÈO†Lò.ûî…¬¬ëM@ΩO†÷1†îÙ©Èë¸c	àõÎ˛v
˝Ut”ÏNSå)Õ¬ÖÛi˙3Â!7:tÆXBh˘õ≤?oY˙Ùß|â‘%Rˇ÷ó«‰ƒ·pY≈µ¯só;˛&›º‡7≠ØyˆS?KØî˙ÁÖ¿ûC‚≈Ël08
epC Mÿ6;@pµÛ;Oü•¬NÍu{©G£óÙö·n.bßN‹ëCöı‰«û˙#Ô≠“ƒd…;
üb∞ÊùÀ	,yßh…ﬂõèøB.=wπ∑9j…lã∑H∆{òV˝ëvΩ≥¡“Æs`©_‰B†`¡*BùÙÀúœ“⁄oVÖ%œ÷Ñ∞‚Ûñ<®÷ú-6ãÄ 'orxåû≥ Î∞ãÕò® -†ä)/"WπòQIí{π–ÊnŒ[¬}x‰¢ÿìgR^ˆÚuÜ|ÁÜËÙuÌƒÀåÎ0R’Eò”≈‹ï∂è√‰∞»w{ä‡Q'‘% ±Ù˜9Î",(ûL¶5=ÕÕ£¥±bDøI-Qº¸Ëë‹µGÁsKÃ{ñæ˛ìd÷• ($E“çÖπ¸LLKXY©£§VÆÚB«\w>ﬂáÑRXt¿cæã„’D≈6§Â∑˛ëTûNß_º–íß`¡≈’Ë≈–d—…¿B~—ú˜íÂ˜¯Ü’@ Å[$xÏ;ûÓÍ"ãØº≈ñ¥õo9|∆›éë‹˙ßq≤g˚(˚3I
µ†ò„3—à‚˙¥4íZ;~íÈ∏˘£ÖD|±Eû_}™ˇ›,mÄ†ŸÁóp(…xÂq*Ò%Ô&˝b°Ç‚≠FÙt®¡«≥⁄¢n%äW.+î{„Î6ïı¥€æ{9CÕ§a*¨W˚KˆÓ≠*bÁRqÀ3«Í)√MˆºÕ“§G=ˆy1ñœó[3£È√Í≥Y≥¥ÃJ9E¨î¯£rPs◊’˝ªﬂø⁄€i£Í´ˆ¡ﬁK¯|˜∑«_O‹U;÷Œ—·?{ª◊=iwÁUxø}¢™e_⁄ûãπÕ:á›ˆ>F∑vVÄÈñ
å≤øTÔJ%6ˆÁd©ˆˇ¡◊RÁk©é“ÉÀeuóÀÃN˚πy^ñêí/ﬁ≥ºÊ~ò¸çÕı~YR∑û‚Û¢Ω˚™s∂€yŸï‹·n∏÷‹-[>›©Âq´vb”©ã“Uçœ:C≥h@ºëÏºzõn‹ã-ZiºhÜ-1πŒl^Õ1•j∫"8i~tŒ=JwòÀN°{ŒLÆ8Z∑Mbﬂò?ò∏Ã≈%ı)N⁄œúXäV™:ßËQ4O-Õ:´r‹nF=‘AW,¡%VﬂY-º9÷\. »ñÇù∑«›£ÓŸÓ^˜Õ—·ﬁªŒÓ˝ΩÃËÏûeU˝Áò„„õ0∏ù(ˆÎéÇΩ:·‡êL4
eDäGôáêVfÔrû&!WG4Ìçœ—	∂Vìâ(o	;ìŒß˛Äù6ß·Oú~ ª«≈söø=^O$;©åâsu·⁄g  ¯}Ãcüºl.œ ‡° gÁD¬%‡Ô√/Ôô√©}∆º“◊ÒÉ˜a⁄Ä~9˛ öLQónÄ∑
˘÷â¶—
ÉÙÂo˚Øél
"nœ%ª‹F}Üì·TáQœ†|Ÿâx1v√yÓDˆŸπ#ÙÂú ëVIü%C&âLX@íã}ì\Ï·Ô™÷«û‘≤ô≈ôp~ﬂ@˝∑èo‹€Z¡?iBÅS´zÆÿìaÉ0πÍı¥+‰„˝Ô™÷<s±±∆ZÀH{3xÜû¡Wö≈keç”¥A”RréñΩœSñ%ñzæ“ê¥\Ok÷
ó≈i^ù¡¥Ô‘Î—t¥ƒ⁄ôÍS·‘«÷fcƒJa-ÉÒÅÈY	å‚$⁄<äbÕUã?gçùΩïC∂¿˝`bEcßÔûªŒ@4;®ã≠êŒ_ö˛PÅã9òË8–¡˝ﬁN<Ωª?_†«!p	˛›#Ì†—ﬂ%OZ€àõΩƒ6S˘°°ZJ—’›‰ΩgŸÈBÔÔdq?ó÷uΩ.Ø◊ïÃ€ÒZ«œnAïÕ§∆Ø-¬Ø-íƒjç+MöΩ%Rµ˜«äÖ8;r¡_Èñ=ã£œ“W÷åÕ¬ˇhè√‡ò∫®Ÿ¨‘Ìg÷:ñ¿ò€]g‡ˆ´æﬂƒ˜H d‹1æΩp@yËlâ?I\T8ïJMÚ20m& …∞àBE≠qoπ©fÑìæ ˆ·—ª#ÎuÁ¯»⁄9:∞∫'Ìì∑ä˛¶s¸ro?É~ù…Õ∆—◊y?Fé¸FFH‰8ÜŒßr≥‡ô‹°;8æhMS|ﬂ~‡Y£¡}É+qº¸/	@¸√'¿›”±ˆPÌ@íå≥p≠Z°{1ú¿ﬂ+®›‚?
Ñw/É·ùÇxo
@›îƒ•t	A7Äôr'◊¿Â[À£pπÖ&¯ác4.f{ƒ°…–êÉiH÷'48¨≤æ-3ê»∏‘ç’ÖÌ<X¬º.˜Ç…∫≤ ëaß„$n+-µﬂ÷m>¡π9∂ëRÍ:QΩAÆ9ÿ®˚tzı⁄p2G[++WWW°6\\S`âpbØåm¯˙—J⁄É[cˇ¢∂òéˆÈjcuÌ}•Êï∂7Y≈ﬂ„zãÜ¿È}∑úá‡™æ|µº÷Ç!Ü‰•¬V˛È&.ïÃ6»lóuè!ÇÚx∫z∂z∂kÒ,ºËŸıÊÊRÛ…∆R≥ıÕ“j£Cñtã÷◊ y0	
pC%Á1|QCwÏ˛–ÏçÏÿˆaˇYÊ°[´èè¸SÁ˙ŸÕÑ<ìΩ–òÇ∂∆o’nœ•∑Ú ÚUJ≤7uÄZ`H§ˇ»êH◊üdAÂìLñE•1å¨ Ø´38ülö±´[œùΩ≤©R¥¢iãó∞¥·iZí]ﬂî3Ú€%hØ0KHº¯µ4∏˚ånè‡¸X(¡Ÿ/E±.ÑGN1©oa;Êù¬2|ÁbÄWstVº*ÓvéLÕÊÛ}E* i®!-»?›‡s(}gdM]%d|á4†ìüô,AÜË¬MQ|ù!äØ¢xcC&X’¿·…•íÚ|≤L≥˙L‚ò”´hÑ£Èõ˛qU¡ÿU¯Xï-—ìUM‰∏
0ÑÀñûL—Ú ç "–%ï¥Ÿ’ˆYÍÉ ŒøıŸ&Nh¬‹ÛÜW{˜`À`àã!†À¶∞ Nn™•‹<G¸@∆˝*”¬ˆ?˛ãø/•b≈yùî$¶Î&'ΩJXÇÖ≤Û‡¿øq˝4£7	1ôEg€/€˙Áá≠Ãp†`ÿ¯,¨X†ÜõÈbù Á.•£a£'2©∞i˙û;^∆rrÛÃıµBd˛)∆‡vÈi/\Ÿ.Û™î3V√VÖ°¢4FÌ„crƒ8º˚_ﬁuˆÒSÁU˚/€nΩ⁄?z—ﬁ∑ÍªùÓﬁ´CƒU=ÿ{{∞òõ–H=úDìô$Z˚zïí´ı`N!T$ ç÷»˛∏L»ˆ
Iê1l›¡©¶gc√Ò∏2 R°õ•a+Ã}VöÏ,foä6púÖò≠ÌßÑN ,ú¥ˇ2}tò8÷Àª?¢›„‡ÓO∆)”Ù}à&©†8v#h[nM*1Iù°Ã3&·é5…{°ßì^n.+ÃüÕªë®Ãnˇ«{ËJŸœQèK*-1”∆7™ñ@Óhëà#o´,q±9\b*ÀIñÍ3÷≥y‘eEDÃ/X—‰⁄ÉızÀ~2dﬁü ∏Ω≠ûgZ'I—2EvC”&pE˘5÷"ˆ·1-Ã°}\f^áì⁄k¥…<ÒÀ?WNë—œ°w›øÔt≠„ªøy≥∑€ÓZu“ÿÌ∑ˇÍËÌ	IÓÌY/(sÁuñ∂+„yÛAI‹›‚πiﬂà»ûœ≠–ÁÙ©Mr9ïnm‘n?hÊÛ&Ò/"G3ôôπ ÿ±è~‡ÃƒÔ¥®[ÂËbÁ¯8ÑxØù∂BgÙ>7•M ºJŸWÄÃ0≤®≤ñ›:…ûsa(øõßd…“ë&™åöRBØEXïèx<óÛä=òxQï(KÉ“ObR0m“∂4œó¯&H≥Já€n‡yvÿu/¸T˜∞R∂3‘_üıÙI¨sÓ·1ÃN”ÿ˜s6F<s +gyÓ°ø∞Õ<MCÀFá◊b9Oë°Rå6⁄| ∫˛–æá˝%ïˆπ∂*¥ñµíL}/˚+ïóÔi{±¥}Õ&jˇˇY∏úœ≥µvBg@á•â∆Ô}sÌ¿|£mu◊Ωp'≈ıW€^z»lÿBf˚é√iﬂÀÆK R˜úŒïà¨)ıF!¨tc∆è√÷\yR˘ ‘0á’∂gÆ1∞¬æï¨wk‹z∑ñ§A\Uu_%
œÕx•õ*∞U÷\VdñÁ;Ø⁄ª/ÓO÷¯‹<¬Ê'!bØ`ÅOâ{ﬂ±«üáñ—vÁ±ª{oﬁ¸m4ûF÷Ø0˝›eq*Ù˚ÁíP¨π©VR“Á‚RßŸÖM`’«[,	œõÉ≈ﬂ◊ˆ8p·ÛÏ-ÓÔ˝Ÿ˜‘!^ƒ¡IüwK1°y∑ïÚπ∂˘ıˇh;âáXRD¯¸˚(âf∏'Iñn”»^ìÆV∏¯\ª)é˘Ïä∞1€;CoC+‹˝m+√-1rú…Ï,ÒÊœè%˛Ÿ∞√ØÇ‡¬s¨ò‡™ñƒü+#¸∆30$+sêa‰∑Û}”Í^?œùÓO®H»•&˘îDRZœ{ﬁ&ôK?Ô…{Èû3ôÈÏºe1ÿ€£¡VÚ≠yOá2oXºs¯◊{Ÿ8I—?≤,.Zeì≈¯ŸOgå+cªæs?Í∞<c@t;;!ã ë¬>XkªÑ¸PÍ?ûÏ,eW•3û∑øT´)nMríö%Ápˇﬁ\áù ˇà‡/Œ›Œ›≥;˙™Ó:¬u\±È ëKcoQ∞ÇákˆäûR`ÉJ›4(í6ﬁ∆oﬁTX&áænFÙ~T#Í"Y¸väΩQÏ>Q†xÆt|úÎ±5rÓt$ 6ñêà#8o¶ñ„_ﬁ•À‚|R®jœr,ªoÓ˛4B@Õª?¬±`Bc\)ÇﬂqOW∆ï]≠¥ãà∆û-•´Ë§81U<Hsú	≥° äOÈ:Ú£äºÍ;ì“ªdVôcaô®âsk≠X7ôH∂[r•‡Ì¢ï07œç$x˚ÛçEÖD#í«wÀ”NÕ>*Ïê)lñ¬ãc8·•Õo©ÇÊ]cœæ>p¸ió‚“J^∏-v.5öm¡d®ö˛æÜ{6•†·\À7b¨‘ºÀ°¿√L·©…SbR%∑ﬁÖ‹Ò(!›|¶RW6h2ﬁº˚sàtnáÖ€?éõ?Ú3›N∑ãúKsÀjüÏΩ€€mÔv∫ÀD€9ﬁkÔuµﬁíOáÎ˘nªÍ!X»π1ˆ8V¬…L2„Æ˘¥n6⁄e	‡‰Z/gy2.@—HpÏY≥d?Z>õràÌÕ„DZ;≤«ı^Òèaﬁ¶x^<ò:—´ˆ≤`à‚ï	ë‘]4ﬂa‘ñ&±rÿFc®0ﬁ!Óé∂7ﬂ,Á‹ûzF>ã™„URãy¸œx9U◊¨en•ÿ è^Æ£ﬁF,Yí‘Ñé^…P3lCVêF«Ÿ≤$˚A+∆>åyõÑÈ}Çrú}MÙLÔ¶ªƒñÄû±åÔü8i „√?f¸{!t∂◊¿[ÿ$Fäi{Ó‰Å`ºâÇÒ&Óï+dÎ·ÔˇJT⁄LNVÇ0cÈIÛ¶Ã÷áÇ.&A~4Zg´gÀõ„ègÕVÌ∑∫Dˇk¨-.¡ètøÖ°ÄÀŸ'ﬁÎÖÎ|˛u
◊T.K\Á◊S%H⁄®u®mS≠±π¯ﬁ|Ÿh&Hñ‚ö,úµ" pklŒ6Ÿîm§§ZyÆÖ€=ùéÿ}m}#Wj3^E Ç>]√™¥A†‘ho¸ùûÃl]Å¨¨qdRÒﬁ∆j-]˘ÊÕÓ1hUy˝?¡`h6íMæ˙õôıYQ;]=É–“ºo¿º'`¶âƒÑç∆¨'¡wŒo–õ‰æ∆∆mI¢xñL¯s+—ì_ü4§3ä	QÊ«Èà√Ì«S/JDzC˙b>#2´qÛA‰9a4¨GÆjm)nQôΩ^#LR&eìM 6–ÜÊ´g4¥ÌœäÀÃò7æLÈ%68Óô∞¿hÅ	Á
≈ÍuÛH^≈,É‘øÙDƒC;ä√6¥x~ï	á¿$ubª≤ëæ™f5mC©˜QYÛˆ|B?ø©z˙qj‡]îiqµ'#l±}@‰“ƒfq`wE¢G†óÊüH´µb`s≤§a#{ôÑh ôË>∂ﬂ 7ûi¨O“ÛÓDCV(≠‰ëˆ˝Vg÷ËûÒÂµ÷ñur|ÙÚÓ_ΩÌZÌùˆÓ›ﬂÏÌÕ%¨	ë≥˜(≠U‘zjç∞‘Ann5¨ì08ø˚„4≤⁄âÆ0≤Í<I¯Nö$|Q3¶ÛÜÎ:I0O‘hóP$1™≤<®√ØeSÄ–((9*ﬂÚ7…G^˙{ì6„F}—Á=ôíÃ¿D¡Õ>‡ºñ –J‘g≤XöëC≥∂°O(òfœ~ù\⁄*íK≈ÓØKìõ´´’XI≥È‰ƒm!G”0Xy"tn^,∞zÕ õ[ágàÛ§Q-úÍ∫ß∫°ìNı"s+Wdn≠o,57û,5õÿzû‹lqr≠VMÄ^˚ëË\<®X‘LÊò,{’cFÄÔW¿ƒŸYW«e=+`ÆkÃyƒÀ.Fziπ“dTóqX[ãxÜ‘Â˜‹ı<qô∆≤e4v}hwpï5nVí4j¢¶îæ‰âò“D8ŸÒYUË4&ä	≤Óò¬±⁄ú◊∞|J“ò≤T÷»∆Ëa∑Ô⁄¯Õîlﬁ‘â3ÉÈ[è	K\É9π»2<üChÂ€“L˘~yn)Qƒ NZπûÃ‚=tG¨X;µÄ$°x¸Ç™íë\ÃÕbÜ(ê©w¡4V†)¬
¥J`fÍ\ !éQ¨Sá0◊0–œ4º‚ÅTAZF§OÛÇ?ôˆãÔ]Ö¨¶B`í ⁄À∆ªö™Ã@+Ä◊Lj∑yà 
z´üRw∑°™ÓöïUw9∫∫9)≠§@R˝ïë§%”`˚%ã´∫ñÏg¶U“ﬁ+÷â4-ÔB2ñìND3≥$rÌtˆ˜;Ë))∏¿ówòlUØ≠RÍáÍ?ﬂŸΩ%SÔ»*–ÑzÑ•Tv€,VÜ≠yíUr Ù.fˆîïZ´ŸëfË4∏èëcË$Hò^≥z	ö9¯&îßw4eêrî√N¿©Wà(õ^ogú≥ò´ãâ-Åm¿`Eó§l2<1QßÄN¨≤F”ƒ>kIsºÇé¶
ï]HIø◊™+È∆14T⁄ﬂ\–âè^‘p¶6Ãç≤Ôl<=(˙o»øÜ‘?3˜ ¬^ô7πí∂˛õ|m=lè“˝	9KÁ2[¶;3„Ï{⁄$&A1Oæ˙w≤∆AM]eg%Æñ~ö]cÎ~;≈lΩ# `Au>E•Á{˝VúìGx∞LiuìÎ12%Ùtæá`|Uˆ˜ƒ´∂=ÔP:9É/YÍ~ö4¬GÄÅK(^ï‹BÒ*qem.sUT%¬ÚïWôßâµo≠8ó“ÜÌÕ<v@
Aä”‡"•à2•¢ç
J“Ñ8í¡B>	ÌhÿäÈ÷*πçÓ∫—˝‡CãoÎíÖ^‰8 û»›
ã∑˙√1ö£áö ç<8Æ‚O ò¢!Y¨p÷>ì»“äEKñK+ﬁ‘Âﬁ¶ª^o∞‘øzª‘ÿÉÛZôﬁºÑ
%√$∏=@6ÏàØ…≈äÕ±ﬁWÁµ.{:ö∫ƒAb™AØöLc¡íÈ>3;oH9,dìS+√≠ôkﬂüR}®ˇ>?—Ÿ{Û!≥UaΩ≤ÉêgéK4–™nE5√5U*ì⁄4‚≈Ü÷|ËÃE'…¢ÛÃ≈[√p-…Ê±ﬂ2GN„ R©!©VlMVaƒ´ƒLŒ§*¡TÍ8•Ø·/NÓ{Ç˘û˜ÿı¯·≈JÕõŸmA€ÓD É≠ÛPë?Ωà«è•î7‘ˇﬂÉV°\«óa„=≠†Ù5†|¢ÜèÔî‰¿9Ë≤ß∑∞£MŸj~ŸqC‡©8·YkI¥?fñÇµ÷ò¢æUñ"©f\:ŸõÈd/lü ö£ﬂN]/xd¨ù‘·iÔ|∫}ÈFÅL—®s	KübPlkÃ˝´H]P\ﬁÁ‚∂s4d≈Q-Z=”Œ—˛€√∂µªw‹Ÿ;i#‡˜ª£ùΩ£√ˆæµ◊÷„}ÁgëíDkC]Q±á√FöNVÂK4WÇ<,9È∞íóõF≠÷µ<'¸èM!¬@√€€·wòk.>»WÇÃMrãòvÜ
,V£	rrâ- èAmåıeolœæm‡–1π¨]¨£&kå"ÏTKG$˘ØWÀ1÷sÙê‚˙!û˚P¥nxœÜ]Å©"-ä‡áçèëπ,èOÈ÷/¸ÒÊ—¿⁄\ïÌôô(tç∫ T6Wö:·Ù0=	≤ò‹ëGÔÒnÊ¬#ﬁ≤3evü¥ûîo©¡UÃHeÄRWZ€oBßÔF˙=¡¥ÛE
_øÑˆ∑6¬&£?3Ïá[
◊~n~ΩP¿E.`ùÖª…:∏Ö‚"ªÁ9Ég7^@º¸xk]⁄∞W¸	 °;≤√ÎçÅƒ˘ıÑ1J„<ÂÕV)ºx	m¿t]˚Õ	[≈*BtB·ôµTíáSyk˝„¸ø-‹^°ïˆ€êè|Q"¶ßOñÆóãSÒŒÜe¶ç;æNú}ç-: )øÈñßm}5w⁄hsﬁÛ6R^^L#ƒ©–å:v√8·©{È˙v£qo\‘\”:/=Œ§‘ú·ÑŒ+{åj7ã˛MËfíŸA“1«22A *Õ8∂qË0¸ÜJHõ˚ZRM ìò±d¨∆xí*w&ZãO©]ÔtG¸¯˙$Äõ„^`áÉz⁄·≈_S™iTaÁ÷ÊﬂΩb	π‡;w}<dRØÌct˙b'Ömì„–9¬4K1z’£z{´9ÃeÜzbIZ]-‹lÅ-Aª˚—À@L…ÿÂzMn7¡ªà
c'Ö–(ÑÂz’“Ÿ1<sm@W2AS.åj∂ˇ‚(Êkµ5C)π<EBn)¥cÁ<t¢·Œï8r’ÜÃTœ7›¸§˘Jév€òäÍ§Ωˇ∫Ω{Ñ©Ñ_ÔuOÓ~º∑CòQù]¸)Î˛¥Õ®-∞n0ié\ﬂçõÅˇ–”Ùß£ 'ΩÅ4H€GÃ „⁄fä·2ﬁñµög€·'ÄÙp3ÔaÁ£;1+6]ú¯|Ï‚/4÷Ú^’∫Á.û±ˇ“˜ã∆◊Lèì:5mÄ •z5Y ÿ?VÜ¸%§Q?D%Îs´‚2ÈÄ	S
K6QëõiyŒ2+õ£‹yZ≤Hwè#ıdcâ{÷oYÀÕ%gf£»FßùÀ§¿fZ⁄*ñ;yxeß:ße&ìWK[÷BíÅ± ≈¬§ú˚NmY≠T3∞G¿⁄]‡∑¢B≈ıíú0™˙DHÕ≠36WU¶ñi0—i^(–”»_:r_Ù.Û_Yû8Jﬁ]¸¬Ú—oõ–‘ÿënóOøYΩæWÙJ⁄µàW>—Ã7 U{Ì «M–at´–ºD;&≈{|√‚=b5ÕÜhsÌb€j¥]QraÓ÷—˛ˇ$0wÎzXÑ' ]ã°‹5[Ñr™†‹µ≥‹ÎÃ$¸∞¥Üô|wt•°3Q‚òŸîï2WÉﬂÇiÃd@∞*úØ∞ÑâúMEΩjº|Ö&…Í»XÁ'TrˆI©;∂h®"“¬FCwºØ\ª(µFßil&ö∆‘")H[àtÕ 'Ë ’˜SÏ@ <t≤C«"‹NÇÒ!¿≥Dp¬ SÄôÈÕ5H˜∆Ú—cFÀΩÃk2)Õ‘(æfÚÛâ/=∆€πÌE& o‚UŸ≥'æ<|‚Kˆ‚Så⁄"-à‹iDYÇ\≈◊∏],ılq¡FòK›ÏÕ
õ
JûFÇy¿òÊTÑ~‹ïó2,¡•ˇÂaMV\ìEL·¬±väJ‰{d˚√`xæÖ4◊Ï◊^0ÖJaúπ≠y wè#-s‘Äÿ≥?ò*–æ†Eíﬁ–a©û¸ÿƒ˜•”~ ˚œ?%’Ω∑<∏ÖÇ‘‡¸`èØX]è	µÑÛS%Qµπ……Sø35ÖR‡mêıD®∫âÑsπŒ·±=ÏsaÃMí§cÀrƒêj#ö'ò†,3ïπ€êÑæm∂Í*0™Üç–;¬QeÍ háe˜ ≈GØáqàâIÖ4ÃÛ·$òÄ`/ï<‚¥mÏ•”E61©#ÉÖÌõ	÷ŒhØ€∑ΩÅ –öçÛºo‡/xióÁf5_‹⁄L?ÔEûã˙1W9ã~XÊŸení∑®ÇÛßÌ9˛ A)˘ôØÒR≈`0‰è±∫)ﬁ‘9Ä€√møŸzX›¬ÍéÉñ‰‡¶ÍÎZ@ﬁ˘ôØÈ7‰ûhu˙ûπwà&nøÚâæôπòı‰ëN˝>∆∞F1ÎÀisÑÃì 5 G Ü^Ì¿ı¬†ˆ	ày…œÖB«K◊õ¿2cöd¯‰9ïd61ÇúÚÚ£ﬁÛ3ÙZ5d·#1)î%˜@HLS(Ñƒ∏“úøs£©Ìπﬂsó¨2∞¢‚$CbpuVè˚96∆∂Æ»Ú<´MÜ¸/Ñàxﬂö¢ÔØâ0¬k¢⁄Úëà◊ºäí0µÃáSØM‹ë„πæS˚I+Rn>pw•xæπı]HHR%”6!µ8ıH©'BÏöÛ¯f$é-E8•„+«Ô%q&Rû∏ñÔ@î–ø\≤zU–ﬂ(|œàb8!ï4ã*Ò«⁄ xà\ √ÔD[‡”laÑ˙õ@T)ÒŒØﬁ˚”®5KüK˘kÕAÏ,kŸjèM–›¶bsF n5B,¶Z∆XVFßÊÍ}ùöTcE¬Å◊\ƒ/  »”Ù'Œ 6Õ¿¥8aΩvÂNÜg4ñï)	^3Sº*PºÃ®JÇÿP	[æYy|ÈÜí-Aq8•∞o)rlc5ï˘Ã»∆Ü9Ÿ¿À|9‚ï∫ÇòØ‚Yùñ*Î&ˆaΩœøﬁqøòu~BéEÕñE⁄¨O¥÷µ!%!8•øo∏€f⁄a 3óA`-Îôı·∏≥ﬂ&oÙ#kÁË∞{¥è®|≤c˙2¨#QΩ·#ß1	ﬁ‚Ú‹ÅÂY_º˝kˇÉŸ~JÎ˛
*ß Tb#ﬂ¯ŒïÖ@ıE(õ–¸⁄ù†€oΩ6û,ø8ÆÕ\”≥j◊_˚3÷Ûèˇ‚Ô≠åÂ?ß`t[–ŸÛ÷}Tú5kh*ï¨s‘ ÙÀPk«øH‚HI›úT™Q√Û∞õc7A€s#¥yœ<Ó<¿‚†sxrd‹˝]◊j”ü-„Úå∫p&oÏh“l±æÏ√`¬z=¬é›÷G’N:ñ}#ÑxÜSëÌ˛–u.ƒ®>™pHa ˙YÚdëZ“Ô~áu4í∑√b≈CYøˆOﬂ0¯j¯æ›s<h±BﬁèiG™∂7€fHôvO‚BÍ§4ùòEe€íwû√—»≤wˆ‚+–‚s«é√å_ﬂ¬Ÿ[Ø-YUhU|Uc2‚ëö{fÒ éTñàXı8ÂŒb<bºnJf√≤œ–h|Æa0{Ú÷p˘ˆ•{Å£–Ë«Qíç´X£`sÍ…ñfRyå%£ßw 8TìÍZrµñ„.ˇÜ«]ûÑvVt»Ñ'ÆÜÿßä ÇÊßHOFR∞nIº™ˆ»X)TÃ'1>—‹»|bX(S›∞∏PKò—“¨ŒTí)@_°]è#€zSﬂsN ]@•&ãW®Ñ´Åd∂ûk∫^5ÓN⁄Q‡—∆A¨¡ÚàLdÀCŒóÀû„N¶°]¢ó)5Ω€ÎæmÔÔ˝OÌªø≈ioéé≠ùˆIÁ’—Ò^ªTMUÆU¨<ü`
jú (÷Z/]#Ó›–L«¶k@N\uGÎ6°≈˛Çò-6ªhıôYËQ1Üˆ√p®&=~zœ@©6I•˚ƒÿ75y∂î34¥Jﬁˆ'Eô ∂ˇ˚˙7ˇóvπöÉKM+E“Ç/l;p`ùæÀ¡l–[˛H™ÉrÊ‡ÓáÔ›Q-Y¡9ÉCv¨hä§»±Fn¡ôÅ∞MÅux ß–gÛÿ•§ıü,è ^3o∏xøî–∞≈¨Ó<Ê3°#zqÕßˇ∫æxZK@Ì=«h]≤‹¡«µÅLV"aÚf7˙e,5F$á¡7Œ˛VWj, ’ C]ΩT£¥ày◊”¬8≤ãéÒÂXúπU…(3–LS ’ôk∆Kòåπ ¡KÉﬂö˚úI2∑Üöœπ†‡¬65∏∞qÒ∫òûqÊä´(a≈´:ëé/æ`æy/A8X ÷L.s¯Éyk“·‘ûA≠ œ†π_‡Év·¥˛F`ı…ºmÅù‡9Øq›?ìì%›$=o4º®ñÕúµ*©2[à∞ß§Ï1¿≥Êﬁ`)Ù€út/i>dë;)≈[∑Ç„¿á2ÙÎπZ5Î˛≈kˆ=å◊”ëàƒç.§rV»∆Fe^V*~%•≥ó2{ızp…j˘8™ÆC•J°lŒ˙®Œ·Ü.Ae”Lü¢Ê†5˝åÃö˚Xˆ…Qöyrc˛Ê+yCgcï2c¢:ˆ
¡I2ô¯F¥-Êf,÷AQû»Ò5Êjî3˝Õ?Òï®l∂u#±¢∑ÔgåfL©^Ü9ÒÚõ1†"ÚÚ	Ê&MhÍî‘4∞≤´•ÃªÓïÜ@[[3•Õ¨¶':è|UÊœÄ¯áRLâ®_ú{Ëí)“=QÑ\wnä$ùÒ=ÓﬁQ&erowd&©z1J«Ñ=®·V!zJ4p6¢EáAü°É@ÓP°ÆºëÄ>}èC_≥"a#{Ó§^√eW[<]}?˘QØ˚¢äÒµ8'yåØ{ ì‘úJâZîGMrâÆgò€_ÿÓ:#+t.‹à¢O|¯ÔÓøyT«%æ ’um⁄Œ˛®'”Øœ¯jUg∂
„S´BruŸ∏—y±˚`’∏?´Fú[Çl‚ó˘mq4Öˇ‚Løˇﬂƒ≈ıœ∂vÉ‚‰€ûUáÂª¯„ö9–á&gHN–hÃ#”ª˚°Á!xπÙΩiDÄ‰éÂπ<Ω‚ €ô[G¡ïgÎÄ˘0rTΩåFé#«Éë„¡»Ò`‰®v=9
™0r<9åFé#«Éë„¡»Ò`‰êØ#áiÉÊ2r$∂~<e?ÿ;ÓÒ’/›ﬁ—˙+ö˙CT≤§“ÛGNÕâ˘„|⁄FÆùX@‚Ô_œmyÌÿ·‰µÌ`‡æs~qfêˇÛ/\√?v§Ã´€Á ~`ıß#L&LøìU§oC=K÷ƒùs
¸mÎ<Ñ‚Cü≈á`"%_M√SH·ïg
a´‚¡Rız∞Ü<XC¨!÷êk»É5§⁄ı`)®˛¡Ú`y∞Ü<XC¨!÷êk»É5Dæ¨!¶∫ßêáÚµÿnD™∂áê˚|ıK∑âp∏¡_Y'0§pÁ¡$ro&ëK7úIb·_Á7àËR˛rÏ!ˇ˙˜¬˙m˜Ì¡›üFnﬂ÷Á4âƒÿú¥ıÓá…‘à]s>ˆÔÓO~⁄8Åf›˝˘€L'AxAyf1øÉ!Ú€)Ù0Ü¬ä–NÚ÷w/ù0";…k)B@&®‹™Ë,ññµô¯˚õ∫î`åhÂõ4Áwø≥Nﬂ/2Ó≥øeŸ˛5ô^∂,ä†v3ö`b∆™Ò(t/\ﬂˆ¨g÷Œ€„ÓQ˜lwØ˚ÊËpÔ]gè„„¬s;cå‹>|ò≠?≠zgØOñ©	œô⁄
∫-ë†ŸÍôÀrÉW
üâΩ≈V¡ÿg–15g £Œ•å;û¢	&µVÃ´√∫'5>^üWïè◊ÁSÁ„ıSRÈ„%™ıÛ5˘Û◊#7õ®«o¶ÿôÎ≤*ÛFÃ≠„ÁÎ?FÊπˇÊÍ»=hTÑÏö»‚àõ€ı<°ˇÚp,Ã£?ßäÔEáN%©⁄¶{—ÉS…í^ZbYrx´ç\ﬁ*…¥âY5SpuÖ¸ﬂßZ⁄Tº≤àÂjãô∂qa˚(ÊØu4´ﬁË7@‘˝ˇ  ˇˇÏΩ›r‹Hí&z?OÅbk*ì”Ã_˛H≈&••H™ƒYQ‰êîŒÃjdò	2—ïô»êUÏ4[€Ω8pÓŒ]ùõ∂≥æj€'‡õÏìwè "¯MPRM7X%2ë@¸zx∏{∏æ∫ºıÒÎ©©ˆÙ2:'^%[Wﬁﬁ°/öeŒófü≤Z„DC;9√tçí¸#òÎ∫¥™ıæ¬r&∑^[ZRË∆ :cø√1,ÅH/“Ã;[®øv¶£˘ƒ∫`ä%	 5dËU"Ë¬˙,ÆœºL,>+Oogcœw¢@w€≤Éÿ◊ªrds“‘R“∏6D†˙ﬁ%ÌG®P!◊•\’)∏"äÊiŒ¨ÿ"Yª‹ò(•®êS2õ
^La∞£:2™‡≈5ÉÚöúá˛∂5Y+˝rª›Ü>î3ÁïHZbÆX 5îﬂ œ&¿(òoØZ∆ölõ9Î}ìHéÚêYxì@Äqf>Hø«~UPËŸ‚£¯À#!ë–h	≤-πLÑCÂ>≥Q@ÒJiÃ¿æ;Ê˜™T@Êñ+Îb‰Tî®K°Ä Ö3#t¢pÖà˛PÃ∫-Æ ∆)'á<ò≈Ñ[≤,⁄	GÕxûî‰∏äß"øG≤
∑}ˆ+z¥€Èw‹'™îß%πïTwë-îó˛6jú"’¸Côﬂı÷.)⁄Î~-)Fµ®oI≥¯e∫è¿kÔàì,™Y∏ıK¢…ﬂ¥_–d(åR≠Ÿ|\ÎQ˘1f`ﬁÁˆ¯?óG–ÚÕHWÚ|Çÿ˘â7ıdÁÜ3Áj€“xÓRz˙í:z≠ﬁè"G÷≤vcmm	OƒÙ≈É´ÖπïÙT!O©oÎÏ8¶ë∑fUãπ¯∂üÜ‚∞€S≠îÀÏCÚel˚¬ÍXõR¬œØæ@Óå≤ép-Ã6¡hÛh!2G”¬>&'î›Gi"ï~Ãªb∑/:Íùd˜5ò}E)•#qi≥Ø∏åì∑HôS¥{∏nËZÏë∆ÚÁ uP‚ª≈Ú5µHù¬Úïe√4/XÕΩæm”òtÒÏ£ã'œç∫˙Ó%[_ﬁBù}FﬁWœ»7ôp^√⁄ΩìR∑í⁄|πf]UéF4]Ü8BYu—	¸øyY˝\øñ>™÷/Èx˘¿7˘"ÕırπòD”ıÂèôÂÎÀ9ÀWÒ„ÁÂ¯y+:~FÍgÁœu7ÆlàŸV-!f˙ïaM*Àœ⁄óºﬁ¢pV‰ècÁ*¨9∞’t’Ïj∫2`„Ù∑‹B√oì"_Móª˘‡—∞¶kô;˝™◊˝]€1XÚâ5Çˇ+∫Q¸&È’Öyià¬|p
≠;¥SøjQ;ıkÁRé‚Ïm‘≈i¨≤û•»sOI‘d£¸°`•O—√)/Û√)/kı[It´tòF‘7ı¶N‰√¢vØG)2ÕÚ˘ÿ˚yÓ‡ßÂ˝X]©óºÍÛ°WÚ|Yw˝™«˜ßÚ˚hUJƒ1ÑÒyMò(\ry}öá¥Ï8¯ª…=fÇ’ZñLÅH«:Œá∫ìOB?Û¡Q-éÊ¶Î+:üß7Á·“MWÌö?^¶˝„•8ƒ#ë‘l	¿´å5`ΩvùØØg¿´™S˙FdDVÅ⁄ç%x•y©˜c@˝ıJL—ùé›©”J√ÁàN#dÂ4q —°0å>ûC¨ÀÊb~kÊπX‰rNÍ˙ı ¢∂_|jmÅÆπïÓŒ/˘∂éØãk° ≥SÛÎÂjNøv•ÜÍ®_±°bÕádô>ÚÈ~ÊÖ\„ÎnßN‘.F„U”Ω¨8çW %ÀQ±UÖ˘
≠-1]8%_÷_8≈Î˜Ô.Ø≈Ø/‚Ú*Zá√RAaÃ	‹Ëı5˝¨J∆ﬁ'€ÚΩf„I^ÙEüE_¨k˛_À«bıŒâ\ıc) „åcm`wtúK(ˇoå≤AP>uEj®H	"J›®Ï1åÍLtöÃ√1÷0÷"tÓÃ°¸Éœ÷,ùÏ?∆–ª…ÅËΩ∂@ÌeC'∏d6'–∞yÁæ˚"4äÑ]§óí«∫&„ÖÁ!i=ÎÿÉ~gBc‡0¥ „ÑÖd€ç¯Å‰<!⁄9”aŒÚŸπúá°7Õ'–à«Ó‡ß›ªf	3A‡ÑGë2g®òÖ¥y,‘)∏Õ@œ9v¶Ûsdõ^*†éò∆˜áÿÈ˘Z·‚„›KòùIﬁÇ.iq,¨™_Ëáìˆ toúmR´Z?lf´˘4ˇ¬å`m·@ﬂˇ’w^ˆ¥wÿºßóõE⁄Ÿ≤d˙∑⁄J⁄ÈÏ1Ü{ÍWõú¯iiY¬§/˛ˇ¿Ï7ßûèÜK`Cé?≤≠]´ygÕ«^tÌ;¿âÖ&,/©—QÛáù&j‡X™ìzñÍ4ªÑmK[h;£~Çﬂbàa∫æÄ^Î).qÎ÷'vñ®U<nã;AÉbXÏ; ƒ8‰Â(ÄB’˝PqÀDÁ∑ŒSkﬂwÜŒî0‚@3	5øÂùŒ®ØV§|@¶˜÷Ê6ÏÚ\Ò¬¨£i0s}∞ùWƒ$∏/Óˇ`∆[†Öâª°Œ&ìÍÔªı>i` "é¢)˙KÅK˙jÀq‰°KÒ	˙ÿÿ@®:ŒÆ∂^1÷F^πÒM~OÀ˜]Ø›Ìø∑Ü∞“SÎF±Ê qCÜÓÚZöﬁ_SüÌÀ¿œÅÖﬁ¨Ö—◊£~jmm†)`√í\nÂ¥—D:ó„πﬂz˜ÑÜL⁄Øw≠÷m$+ƒ_úWµ@˛ÈõéîVû¶Ïë©≠ªÙÄµL†aËìAÌ£åZΩôl‰”‚–∫Ú·Y)ﬂccRÜ‘“ w
;Q+⁄BﬂmŸ»V"cM$ˇ§ëZjgì•èÖbºÍF•ÊãaAâ˛“Íu5>5 8E
|ÈÿH˜∞C7úÄ\3ÑíÏ¿ÖO)r¸ek3§C˚(∆)£ÀÚΩc|¸Y{Ï]{π∏>;Ó‰⁄
¸¡.çﬁR8–›å;¸„]˛‘ªäµ∂;µ"Gi˜&{¡&∆◊§dj˘AπIŒ’CÀ]o+j ä‘Ü\S›%ÏC»ä÷4H§Ω®ç‹Ô∆})†HÌ<üªc<LÓõC◊cyh%G9 ë´≥dÍ—zBáíˆK6cBïJ≈¯≤h|bYLáê46ı&dákªSù˛óÔ“ô¯h=C4 éyè› Â∂ãÊΩÎ∂◊qgä[Œt.iœ=°®˜q™vî1∂©´˛Öb6˘9≥ˆaø-∑ﬁQŸ§U´Pe=%Iæè;‘zﬂRƒkâÊıçZGoàU†¸çcùG√
øC1±}Ö#ÒL‚—›Ö⁄dŒ®ÈWƒ9†ô(!m∫(?üªÑUΩÿ?ÇÉ	ãEw—·˚AÆÍYt8|zƒÚüK™-¿ÚR†Û…h<?é¬plw:ˆÃmˇÏCøn˜ÃõtnzùÅÔ`y?˚0ñCßÛåzJÏ-¸ˇ˝–Ì›Gw∞‡ª7gG˚ﬁd[Ó4l“π√’≈˜Ù—ŸÌ^ı˜ÌÔ/ØŸ«+∫>.,{ÓÆ"?BÇ1âÖV”e3ú◊‡Á9à˙˛ §§∫π‹.€{«$ÌÀ€•Ã˙FÊ0r?µ†IoÔÁAudPFŒq@@Éhæp&ó~z∂≥äS%ÜbÜâB†" ã§ûk-Úàzçú∫qRœÿˆ≥á–`+K™nl%≈mPˆ¶Œ©ªÏ;D»∏È0ø´¬Î7zQ$ÛS±`ï∫GËTZrÖ|£óô´wtÑ´í√äº†-~\|âéoÌ∆YË9ôAƒb2∂b*â¥@
z‘0<yƒdL˜ôåÛ5&^ÿ∞ãA≤~òCÕ–&Yﬂ(⁄Wñôç‘ ”@äL≠√9(ÀﬁrMìÿ•´¿$Êm¿•π∞·∂I)Dû¸˙‰Ì…6ÁÃ˚ˆ–Ü÷#JR«zÎ¯Åßõ]äõRÇ…6ﬂR˙ÈJ∑¨HÄÀ0iipÕhUà’UM»3Y´ )—=¬ôT£Â™JÖJk•¿É_œ†HÛWaªπô(ˆ«ÓÏ“≥˝!†ö¡
M∂:æ=;—ÒëÅÆL L°Ê3tﬂ¶n5Ÿ[LÖ˛‘Êo0g9!õ˚ß/≤Ω0KÄ¢B8ÁÂ≥+bØLŸù–N¶èt÷*ˇÇ#Û⁄x:ÕzÖ!¿çWﬁ¿31•Ù”®∆’ZGLn ba2˝`Î»ÓÿµÛEóriÉÈ<œãäf∂KÉ‹jµkÁ“áu/}=±ù¯ÎåÈ€¶·Á∞Gì/F¿ó¨∫z©˜Kç’ﬁp‚AΩTö9Z6Uhë≈ŒÑ˘Ë{¶˙m°∂3%G3O Ë•Ï∞πÔ€≥SWrtƒÛ4ozB&œo‹±Œù°S'ëPweªÊ¬j≈∆Ùö,:—ç˘UÈy+xÚ°∏ ‡.6V†˜≥ÈùÖ±m/,jk2Æõˇ¯^∂•î0Jöe8~ãCü¯QJû§o ÆMj-
Vv∏S;ú£ÀLæ≠¢ƒ˙˙v«j+uÍÇxÇ g6∫ïO:e¢+Åãv?'GÖ+?kâπäÎÇ5}‡˙N∂‡∞ú⁄gVñµ∆ F≈k7DøÇ8›à|JÃΩá9¢5X¶^ly&¬ŸõëGà…⁄C€ƒßC~ËÔL,:Fı–è›8|◊,oéÿæÅ/–‘]π˘çπ™◊ÚÔù'≥xÁVI[8iÏ≥}H^¿2õ@Eˆdí·ÂöÂN‡Õ}˙Nv&aØﬂYˆpx·π·„/`⁄ëú5ÀûÕéÜk‘ùH]o∫ÜOÇ“≤fçΩÎ=~+pB∫5ƒ‡√)ËË!˙@ƒü`∂˘'Á∆u>°◊îµÄfBa+¡InÓèÊ˛`ƒ?≠r\K÷¿ë=éùaﬁ¸3‘º=ﬂıˆÊC7§\7–YÕÉ+
‘¬w‹¸·ô©Û…¬?eó+ÂπCGæ]˘≠ˆµæ Äﬂ§æ&†9µ˜ËvsUÇÁÏt,ÙÊÖ>ÄÍè.¸7∂ß˜∂IÈÄÕ0ö?2NObœV ˆh*0ˆŒ±é¡≤ó R∞pˇar ¶ 9ÉØ+uH–®Ãgó§Å7ô9!ë|‰ÃK_‹‡=¶µ*˜gˆµ≠ﬁfG#√v®∫π°cÚwCJK»›ô»ÉÓ¶fA'WG‰ˇœ·0â
ÀäüWgOF}•ô˛˛{ÌY>c	xÿ∏öÖ<ù2i7’çßa€4Y*3c€∞⁄ÏO•:Ω6\VÕÜÔå?ÿÇ˛?D’Ÿ˝çh±5—%Z˙V,¯Ê ûuçÎäô¥–œéºu£“€Ìˆ öµÃ'Vx‡˘8]øt∆»,õ‹ˇòÉ¨5Ò‡lœœ^YM¸á°j>[«vΩÂ¯¡™¥–°Ä¿Å'/ºcœFËﬁÊç=û;€! ïı'sd'=Qî‰géﬂb0öwe—3Ã˝ù‘à^†Øã‘€È[ˆ{¢Ì;≥±=pöù?Ë\√–¨¨™5}øcjøC==öÜÕ¯È5´◊]Ö}6¶hî•±a™côQâ;å˚!êäCêÒÌ),ë®ù++qC«é÷}˘Àú!’å\ ±é⁄¥;Û∂˝vxµzÁ‘ô—.,ÿBVi˘S≤»ùπ_|÷—7
JOõ$˝˘+$V—$ˆ≤4ç“¨«BI#uxØ†><?k¨!FQ¯√æZ‡¶¯qŒ^5"÷ (÷ ;†˙ﬂ—*¥ßÓ%m˘∏Ô›ÿ∞ØíUUvÅÒcÜÆä:ÁIÏ∏of–ﬁ·~\ íÅÛõÑ;∆g†w∂,∑'x÷~◊}Ø≠¸BL@¸ïÚ>“Fù”zj°$àt“ﬂ–i+fd'rO°£ËÔRzÒﬂˇzÎN<,Âø>'vˆ…ˆß0Í+∆=ƒD;Z?}Êq∆v$tG=£2Ì≤G⁄ﬁáïƒ]À>O	aØ–ˇlp@gu!ÙÒ÷n3P/òÌ|¨m™—ÿ“÷Î”Bz‚#£«ïÁÇ˜πq@§ùy Ÿÿ÷—ä!‚(â∆ÕÒ}œ◊G-mÙí£5·ìÌÜ\nlÒYÍl`H∆ï=ÉF$Ç6fÛÀ±;Äî5wºÀ6Ebüq˝Hd∞-èﬁø·ˇn„v®l∞‚ä‰⁄f„‡Ë˛ˇæˇü'P¸GÓ)`£4ÂÕ;ŒÙ∆9_!8˝á˜˘≈ùÿA«ªr@"ﬂ∂Œ!,∂ïÁ/>¶µ;Ÿêxö‰ıá£ó1‘l¡û[≤˜ùaéÜﬁır0ÇEãg¢§1=¿ÀjÃ°è√‡Y◊s€ôx  ¿bÄZúâùN.19,´Ì8[oŒ^X5mÖ†≥MúâÕ50‘5Ï6f¬‘≈›‰:„I:‡ı!?ã·RÎ·ò‚ıöE™¢¡hè|Á
ﬁàÍ”øÌÉg>J√Û·—ùh±ˇOéøE4W)SÔ|˙®ó7¿@=VD·ÏKﬂç9=f36Àm*M§ÛR1ÀÜrçÛ∫–w£CÊ·ôl`€õﬂíX9ÖRÙËÙË_-ÿcù±{ç⁄∂4ÕÔÒZJ§<æé>æg™„9ÜÏÉ¶Kãˆ∆F4Ò.,æ∆-G\f†âœl¬?òŸüqfÿ√C'`ÓM?FÏÄWÓÁˆlk,Ëá}P*ñ√~¯Kósê}/‚—kœ£è ãçÜÚ÷`dﬂ8ßÓ-°–ûµÈÓáô{´ê˛œøÉ}1Ñœ	“îøhvÑxÖã·™∫3è…k2¥Úx’fR¿éV¬‘∞∞Ë+Ú-çæƒOR0k;¸∞ŸÑπ∫§eikóFÖd>.@ìÑ±?mÁ>Ω*i©£ÚÇtm‰ ‘Z`‡^”l'Ä°AÂ2û:uq&Ñ8Ce ´ãä∂d¨b5=:ïìSxÆ⁄ì∞±ö÷û¯U$dˆnD“Öﬂ%ΩÇΩL™z|°"h˝1˚gØÿÜ«K0jÍ–Àîñ<çÌ7‹¶ñÓãöµØTùù~ØYÔ∑&M˚{’Ëx[Q•EDÅ∞≠aØÜ•10Yû ÄO÷Ô≠&)§ÓRV]6p´åÊ◊¨nv˚£:ﬁ'CƒO—*òG∫Wm‡€·<`Ï¡ÉÈ_≤ıbK`>/∏	l$˚ˇ:˚ˆdfc£»‰≈§,ê¡`Ûêó∑3Öà◊ÿ’»5 ∏%3Kµ'2∂´O*S9[éÆº„rãÆÌNÅ:¶∏èA—WÓıƒCkäﬁ∆Õ-M·`M!á-w îGÕ “åw@>≤™•ºΩ≥„ùl+Ï≠æ7úˇbC≥ÿz±nòœmZÀdì%íÂâm”rnÌêIü/kÊ;¿§GH_∫*˜Rºéâ–¶Pbà„z n6≈8Ø…ªÓ- v⁄∑¶òd4P-_±§ “àB≤ ¡eÅ~$$¥iŒéΩŸÁÍêfÜóì‘g±à/rÉjﬁ1ô‰ˆÔˇäâçH2jÏ{3ˆΩ1l‘h´√,ûXtE`a†˚}$T`ß˛iƒË”tSIÚ—-àëy÷Ëÿ¬Ûrt~"¶¶Ã∆.“çU≈ê&åW_Rª`9Eœ¡)∆˝3.ΩÔíœ¨è |Q—ÌlÙ5”s–£7xl∆Âıèà8Ÿ0Uå/N≈¶ë‘∑P¯⁄é%Ød:>.À Éê|Hír•÷Fwì/HíÓ«}U˛Öí YM•ÛQqã’Gwâ]6Yã&∏m«Ùë|X6`PÄﬁ¬v§mæ∆¬É™∆∏∂Ÿ1¬Ú≠˝≥7˚G{Ø∂≠£ ËTüøŸÑÄ9EYœAhæˇzô(8⁄H∂≈.í¨\íã∑c°ÿÿHÚóÄàToí¨8C«‘«Ë e;uô©J∂ñNËÕÉ3“\ôÜùÂ5„„ΩeÌ0∞„KÙØ-L…≤≤v¥ßõV∏IeÍ…g£†2∆“(≤√!‚‹Fñ$/HZXXüì6≥Ê€x≠‘œÃ-ˆw®ÿ¬‚Å˚º„ﬂˇi&∞ Ÿ—*ûÙ∂q88÷Ö^}S™We•)O’Î5Oö°!¥~X¡Û)‘Aöø%üeS©òFB˚ÁΩåˆY;‰h/páª+t~>ÊgYv†D6e  NÅÓ[SojæÙ1eö-áêÜÑÄ'+Ow`⁄˛π{=-ékpå˘Å9— 0˙
íxx›)~ ©0G@%3BN…<óO˜€ÃÃ"®E2/ÛŸmkS†ìƒ9"∑dà~Ô±„D√+∫“”ËI>y∏IxÀˇäÅÅ¨,–ü&ú•‚úÒ≤@b£OÑ’T®1√”Á|‰:„!≈–	∑º-tÀ;SqcâfúØœ>ñéûí@8I¯ˆd.>Õ	øá Ò«uö_„ÍJÄ<—„5í(˝º ≠Ç^pÏ±D) #—mÒ‡&COñ'>Ç¿ÿTIãì¡ªÓáçŸÌá-¯ø’É¸ÎKªŸ]£üvou≠˚°wÒëV?˘ı{5ÌÜNúzõ¯¸∫˛|?z^!4ìÔ¶Œ Ã>PJÊ$rVMçÊ(Îó»îß¯{f;£Æ<Ω@„–3Ï]@Âπ¢Ü`òuçGævgèZxlQÍÖ{Îõ˝’åP˘Œâ∏qDÅ]}∏DA;&RÈŒKáòÖÿ :©Ò?)ËL’jÅJsˇˇºyubΩ>yªwprfíµrlΩ›{7ˇuÔ‚Ñû-Ç‘"”H?é°ä¯Ø∂•’&?_∆ÎIO[”ﬂŒ¢BÓù≈	“ù
ı¿ˇ(XÏ:;+Ëú
å≥ﬁè`$óG1åócFae`^*H”OT†ñ,»I4'Q6 ò-R »2N∑Ó"rWü„‚Á÷Gu˛7{&e7S*≥(£&¶1¯A4{™∫wVd>h6vGÙT4DŸiñ…µßÃ~gG=ÙwÖïNwê!ªSØmùàs]ÀıÔÂ.cP∆@2U1e·Áπ=—buãgÓ¸ 0pÊ¿Ù¶Ø](å6øØ•§˘∑ï&»©†J¢≈¥2 Ê@ÿ°‹÷uÜ{åqá}K≥˙+·9æÎÔt®¶í≠sß≥yXKΩ«XOV øLu¢/‰Ó
7îï«:'ó±ú„ÔÆÄL {A∑|)‰Ä∂{ß" „&ÉRÍ‘5îÖ
|Âº‹?…˛$ªaiÆçÂÀcóêíJ∆÷®•"Z∂f—,Ù‹6UjÚ”…ª*Ä¯'±Tí`•…xpiÎ3ÔﬂÇ‰ßl
[nÂˆªÜ[Éy∞≠…∏pΩyHÒ˛î˝(R6ßeÒ¸K`˝ñ°-¸  ¢œΩ–#∑DPHâÂ¿ügÚÄ	h'3V31dÕ-êg√±“Tô‘Êæ√¥õ]ÙÒÑ˙]˙‘}œÃ U“∫,üÛ$◊†íuQﬁ®ª;„≤¨˛jÈ *¡‰ö.ÓÕËª∑‚d'Ê$8∏IG‡%†¯U3Ûùö:‰4¯!‚1QsUk´ò-D´o[Î<ô83o≈–ëv%â˙iåà?õ»=/4/ù%I #\ûËÈ¯NBn`?í|±ï4ì,õz§Zí‘Â+-é|∏`”µZ2!BÂïø‹∫’÷l—≈–h, vØ,RˆΩÄvœàêÈF/°?G∑*¶ªQL˙TçrÎ#’Úd˙ ùÄTélJgâºƒ£Wïò™t¿‘`´cÌã≥∫j∫À∆Qû$µå¯p~yM#[óé'UÖ¨WV™$∫©E“f@ıZÓ	ô(ˆªﬂı∫ó?<ÈΩ7 ◊¡‰sÖoÜ¸àœÏ
?¬RcX«Œ4@¿Tˆÿ“Â≥…\y ~[{„˚?€Cª∂‚èªÑ¸ïßÃØqªîÛ~Øj´kÂHŒ 0ü
ˇA¨J˛¶Zu;∂BK3ﬁˇ,úÓ‰¡M#XèÚ6‡∂ ìÉ÷^˝Ìÿâœ·Ì∂8*'¬¥]oçòÀÑäë50Ë»QcÌ‰≥g…!Deœﬂc~b<,¡üø˚G¡Gã>ˆúÈ&èäS˜vtÔ4‹ç¸:SƒáH2!·Å#ü	-cK1ãÚá"Ω-LHﬁ¬æ%˘Ø®ÁD›ùZ·ÍUá†…0vJ≈.G,-ÜkÇxÃ´OG'Q32DòﬂÈ'ä—¿£˙óÆ~“ΩÖˇ3Ä´NÃÜı∆„'õèu–j çl≈¶ÜNÛë<tjÍe¡%fqVpeÜÃ:ÇXúÏO±ëŒ>äîÕ-¬ÏÀ‹ºÏ‘˜–≠—∂–€/v»Gï>Ë#.KËûêøF•¬˙?ˇ˝ˇK…öÑW3{bÚîüÖ3¢ÎªŒ0πóæÃ)—gdh˚üMºRœ6DY&å∑x{KÏwz∂ª‚˚Ã>¥Vqÿ"Ô~ﬂZ!œ…”øÿVWåyä´⁄ ß≈,¨°ÿócg∏{'B%ãÌWâ,ΩâÌkΩ´;we˚vïòÇ®≠ò0·ÜÊ˚}34mƒ¯g¿ÙYÇr∏€w˝¡ÿâﬂÈ<-ëI\Ææ±g	ocÑ∫∆¸Û˝Ø»Êé˚ù’åæï|åW30ïy| “∏‘H√d]‘≈S·∆“®Å&!¨øB–ëíõ€≥î…‡G;SPÇBˆ—±Å3PááMw≈MvÀ√§ßˆK¢±%Öñ™^ë¬êÂ?%6˚ı8S«óˆ˙JA›¥–œ©<∞w∫T	Ww3Uv~4.°«±≤ÚÙÿôKY≠7Ætí UÓ†‘∂oò÷œsÒÕx‚ôŸÅÃ·-k8ê)Ó]%∞  ◊;ÁéÌFF7=¬q_'o=tR◊FEﬁÛ≥´(h%)eQ¨ I‡s®oÕbP%àZHrZ?ÚK‰Êé8v∫¿ò¥jƒËM’t±Z†8˘‘i‹˙¡ö˘∞j1D†àôÇÚ
ƒI≈ﬁêÍï!e‡ú1[FÀôhiÏä%úNﬂ}•al4‘m6"OÊ?Jîi§P”˛ZT˙WA›y‘Mè⁄(Û3ß~≠+-™ˆm÷ÀÈÉÙ∑Ÿ-KÖ˚Y…*˙[∫–ë™øØ<%;[∞<“ã*l·â˚Ë_≥øwvÄæ›gáÁoéO¨É£◊˜ˇ„¯hˇƒz}b]úú¬ù=ÎbÔ˘·´ΩBnﬁöØ¡uK§å⁄»4P»&Ÿ^∂i•«]ÿ≥êYMÌNâ≠ ⁄tBôâ"EÀà>åë⁄K¶_4’|·;SÕ3ì’àäOß195÷à’!˛ødÊåsoÇËŒA‰·≈q)º¸ƒÓE¨¬Yï¢6&*∆ 3Ãœü8à1Ñ5z∏èÕú‡Á9Ë¶àœ1C≥å‹ÉlÑ´$KOUîïi9
:Ã…f4æ‚ef&OtëQL20'.hªÛ…ﬂ¶]JkH¬ƒæ5~c-"O…>ò32I´yÓ ”ªLLï±3ΩG°;Ùö¡jùúµ@›÷S´õœ†”F§O‹R `÷ƒáhU1(À±çíK.yl&9§øª]ùí‘î@El‡°_P|ÅöíÅ,∑±Úa‡v:·hŸr.‹ô◊ë7ñ-—íSí1∆‘<{¥∫\¡
à˝9·iJfüKﬂ„‰E
ÑßrÊÀ2À#≈Ko¯Yn,ÿMZü-˛á‡ıH+{míØÓ’öÂñpWÂ 5¿êqà`J›!Ç2†ãj;Üó†&Pu⁄ïvœ∫`Ω0W_WÕÙ¨ö£UõJi”÷N®∞É&√"äñ√Ç47Oí}òó¬‘CˇjCVï´dÓaQiYYØ}√IM¬¿íÈÈ9î%Ïµ‹Õ≠P˝å„˛`»¬`Ö•ò0ÿ•t{Íô Kj2$ô†¯!¡ÉqH∏U5‘vŸ6K˛a∫ÓíÎ=/8—ÿ(} y∂∆ît:ñD∆îú iîF3®î*Ÿ!+f6NÌÀ>≠
Æì`ŒfÎpbÌM.,p MÖîöo¨©˛I»≤‰ÕÉ‰}_y&Ë®IxËÚºKt7L&EÃ-≤ lî ˘äK9ﬂ∞Ñóã|·!aW·‘^f´Ù.^ö– á‹T∫fI[∑0qï\`…_	‡˘.mÀêÀf€•«ó^“.óHÚ#Ωëò$S.ÛˆdÍrÂQ	›p#Ú÷¡ÓhÃ´ïWç[‡µs¯9:î^_îÒ~KîD|∫SÖcDÖTäØ¡´⁄@uñ57pâì9πPªúâeOù[Øj«aiïg)I1§–yÄÈ* ûê˙*πÙV~ØQ8ø¸›ªè<G‹[èÓÆ8å¥ª¯Xù˜‡µ4ˇë7qCXÁ@“÷ü¿+¡É‰W47ÃÁIx1æîÿ≤VŒÁó∞ÜsWÂW∞ÏVˆÄ˙mıvı´NåxÌ∞‰#ı∞4*ê÷t÷p–"‰üøRI˝S™´‚$Ø@G¡ÀQ ù„*\éí‹·óY‘‹◊b©‚Ï¡¿ôÖ¿ &ˆµ”˘ß5{6ÊN~'ùŸjπ¬°S)yr0IŒ’ÇVERœrìNª F¥ñÉ
(Æ‰[≈U P;/ˆ*CÉd÷ÅY·Kù%§.∆É"æ_·.“Õ8/ :)8sé;ha`¢wø€ÿÿxO~ÆY>’¶Û¡ﬂÌuÒGHNìx/]y˙⁄ôé@p‚Ó=Ü¨R"è–0Ò'mçÄÉ≈|’NeË∞ë‚ÇÓ˝:X◊$L˚,Êc≈ú∏é…@m≈ÿˆé¿ª7{X›≈ ˜UŒñä†eYRÂÍ—|NË˙˘÷s)À¿©}MIGÈÕˆÃˆ—ÉR«Áüaë≥Ã"uà≠•∏L…äP†iá¡åa¶s$qû´ÄJÖ~†«X—EJE¶Œ¶K m◊å«•£>ª Å.Ä[‰‘ó˘e·”¢:Z`ùvá
õ †¬è)J¢{]ÊåÜ*mdGò"k~º\ågHmº(¨ç=Ñi‹(ÿêíŸºã√¬QÈÊ(ââ˘\ï"J§Ÿû≠¬RÅS<'$ÄG•
JS-Ì<£‰!ÇŸ!»:Äâ¬˘\¸cô  Ñ‡%ÚÄ”Ò¯HÖOëÈóæOp˙ÀL˜†ºZGQ|§åı«í7Óﬁ›Y@¡·h€˙¯à∆Gk±»À%^”Äê @!›•∞q:Yù≠Å6p[)fCæÃÅÓ>2¢∫#Åí›cJv7V≤ßÇAMÓ#Rëc∏O⁄Á)Í"íÃA5@◊jı«∑Q‰Ìì>>ùµ„4…´Zy¡¸˙H‡v%#àKJËE_Í|Õÿª”‰ˆ∫%Ó'Ó}êT‹D•aÜÃÕ»eùIÉe≈Ó¯∞/]Ï0åL@)––}›ÆI‘6|4dõﬂªv¶î„D 4oÃ-Ø§á7•ó	Ú¬«Öéº?:%Œ¸|Ëƒv„\ÿóîûoO|í≥ÛÌ4–E#]‡)≤c–qÏ∆”¶|_Õ˙'Â~ßr˜„œJﬁø∏¡Í˚Ã‰Á£Œ•J€X¬ÁßM5ß!˝z"AñÕfásÓ¥ƒ|,’^JæK˝K•ÕWs?Ì‡0™ï◊/Ñ}“*¬z∫k%€Àúx.lﬂπ≤E´C˛IK^∆ôÎ#‚lÜmÁÁπ;s‚>BõRí{Ã´™'2ú¥ÖÀFfù≥Û∑ßqj$Á&Dje€é1ë <¡R8≤—«ååC1º-Tàû0nörGâtBÅ$bVÃ(ÑÈ¨∞-›≈ÔB«Ó†Ω„=}øÕ[)gXMf[™%/Î*Ê+°û°/i‘∞mΩ˘πx£\$ÚÊ>àŒºqã_a≈›ˇŸ∂¢/ÏÔòız¥,.π£ÀkIPπø±œ{U…Ç*S“9≤ïúB;¯)áûFP|a0ä
ÒŸPP+G')ºõESálÌ∞◊˘Jbﬁƒ∞ÿh¡^O0ID•—πÇ"b∫ÑÈöD≈Ø>8ïÚÒÉ?˘p!!≤^oÀ„QÅ"TÑLùjí∂Jµ¶6o√õD≥Z%®wü%DF¥N9‡o$ûúü^ôDfLÜÃ∂Î«£”Söëçqm^ÀyeósXZQ|íˆíg—üm~ —Ï¥:◊kòf‘JOé•ä…WMµS⁄‹˙∞ÂèÓxcèÓàˇé<ü%hÌ˝∞™¡j\Ë6/t—Ìª≥@±˝^·bMC«2¬~dáHOÒ∂Eöä∏;∆TÒÖ3ôç=ÎSë¡Sî±Nº:ÉÛkw‰ûìmxóê;œ<zΩ˝vÔ’·ÎÉΩ3C∆≥∆€√≥Û£ì◊€˝v◊ÙıÈŸ…¡—¡v´”AbÍtò∞xlOaCB•´”9Ω0Ω«k>|{¯⁄Ù˝«7PËµ;õ}ÄÓ~`ùváãˇÇ∑⁄¿_IÔÁáˇÚÊı˛·∂©°.Œ/ˆéO∑›•“f4√ÔZ€Ô˘$Çm¡.˛õ°bVÙŸë™)+<£ºç`.√‘gŒﬂÔù˝<Eã’\Œ·˘˛Ÿ—ÈNÀh|Ï’…˛&É∞L#âÕLùˆmD2 ˜Ô€Ù‹i≥ÒÔ˛øO´∆‹wócÔíÎœ·œÊªòFﬂ#◊«≥“mÿ)@◊ËAˇÉöå√›yx’z“HÏ¨‰πèŸ/ﬂúΩ‚ô„O’ÿcù∆W∆ÓÙß2)ÁÒyëu™3|â⁄LH'0ò_\xÑa~=&òê◊æö—9¶ø~O‰˜òL∆Á£÷å®ΩxxÜÀFi‰éáMlÉ©Õ∆Ãıj1æ3Ònú‘b§ΩÌñíƒâ¥ÚòSÇM¶oƒ¨¡…îØ2{'Kna˚ ‹∞≥≠∏ñ"[gßCIu•Z?ûX?æ><€ª89√Ô§ˆ≥c„˛&iê®pΩòè«ˇﬂ4ùk‰:J>|å∑õ™3¥?G”c˛Bƒy∞∂5^ŒÔ1∑ K´Œ∏í¢ﬁπ~ ∑?ü\eï±fı¯˚üµ˙≈
Çoíﬁ°˚ÓΩî§ÜÈÖã©j|3?ºY3ò`ãÙ»Ü÷åÿO0CkRÀÍ˝æ Â≤ø[≠’Ñ¸å%cìS[ﬂrì	môºÅf[˛∂:ã÷£;Œ∏Â¯‡†Æ∂°Á»êõ}XK∞Ößº√-…«•˝U«ˆlåö*ı¢Ù∞utM˚Ós¸U\°˛P»√∑©ÔÍ∑n¿M‘?û_5&{ë›Òî	Â‰…Á)19ô4u;ª2ù¬ùﬂˇ>9âXZÊ$fÕ°x9uÂäŒ°¸N}s(J5Ã°ªÃî°ì7cSÿÙÀÔdu•ˆÛ„È¥[ﬂÌR¬q}¬∞∞å	c|«TfÀ∞ƒe>ÜÛí>’¢⁄‘©ñ(:’Ú;ıMµ(’0’…
lπÚ=¥√@“ˇlOyÓ‹∆|Ò·ÿˆÔˇLÌ]˙Óò›rÈ∆?œß#973‹èÿ£◊®Í¯◊πR¶_¸˚dŒ˘üØaÛ∑ú_ÿﬂT–{É*z
ÏLÏHÜdÂí·5¬πèào®‘±fâ{Ç ZHú=aÍ4)√ØaÜ≤øœm‰Ö‘íﬂÄÑΩô?#õóÖ)YÆçÒÖ¶~h	€4“ßÖ¶p©=‚;RÎså¿h)ëÌ‹ä∏!æ∏∞Éü∞≈8,J„vØ¥“®8sÇ·BπÑµsƒ÷xÈ >úıΩı÷Öë<ˇ‰Ç	üuç‚	áÕNQ~ÿÑ#≥…k'Ì°hFbû∑<b∆>go˘âﬂ˝Ó≈ã}LöÉêy¸å˛;∫ˆù?&S¨S©∆\≈ÙM:4DÏù¶d¥ÀŒ˘Û÷»*Ê:]„1t–¬4wÛXSOQ,º9"I–)êÂ˘◊@7ø†e9•3Ü∏î”7„Ã&ËËÚ:€ﬂƒü˜÷,9cN9ä„Œªﬂ≠”ı^ 'jneN¸Qc(:)SO¡ä‰xæ˚Hh–Õ$ßWNzË´hqiY›Eáx‹¸*◊1ÄàY-åÙπ?‡¯:ÇõOuzõ‰†Qñ @+¶ëÊÈ\`≈(Åïõ…'Q˚O!®¨8ö•&íùk~s»⁄ÚÕMﬂ+7ïY;ıÔˇzKπ÷˘…g…I+∆òM‚Ióá\è–Òu°¨€T7l|L¿˘K!gá¥ÏlzΩPçö$¯›Ôz˚¯É¨k˝R—ÁVˆ“M„` öÂªäXb["HËaf6πﬁÄ1Jp^ﬁPì∞£¶ùó<å0qëí°®ÍJÍÔHázø@≥‘jUy~Óy†“∆—([&éUBl1Á#-≈î)ÙJﬁ&£®-†ß.˛ºOLA◊J°…¸–ëb^W/A‡Œ⁄‚x≤’'!“¶ œ¬2„_”h„≈coèÔˇ#∞ˆp±∫^Å4›*˜GŒçÔM_!‰RQ OzÒKÃ]§á˛÷ÁNl©Nb›swF¿%ıO^eNV ‹µ˛/«˘	uÍW&XnÀ“∂˜«<Ë√>ä&6ø{◊8&Ã.sçø.˝À‹fø\ˆ›-˝∫ˇı≤¡”†¥Rô»7©(ÚΩUsíÁûÓ"#CR›KKd@[BA'Áªa˛ö)‚«öRöI h$d2Vçsü7ÌäÖíM®˝9ˆÈŒ«ÀäŒóoäò|‡¡vl¥,∫ï_ T±7¶0Kµ'
-^&	6d†Sã†R—ﬁˆá|úÄrËa%E"?¸¬o$5I≈à®çÒreS¿pÛ,ñÃ0>¯yìü©©KÔlá#mCÕµ£m_è e3∆N™&vTX%S“B7Èzﬂ(\¡¢lk$⁄-ı^UılãeAz◊kwAG˚Ö"W#Œ• „ôçc‘(ﬂ≤mﬁ≤>]Ô;2‹›√π?í;t¥£U˝˝˜÷w“‡√X"Õ#•·Øh∏àJ¥®`}ıÿ-hÉ·t|{ç¢ÿÃ;„+nã~tßv0¶èò∆#£JIÿ5∆*
*~‘FV¯‹\i_=ö1ÙÒ5ñŒ/œ∂YGJ·BqNìÑWcõ˘é*«ˇV¬Åa≥^˙5ºdR˘D,t§®
‘=ù4`]∆Ñ!3
ñ™‘aıHî7∫5É’
ò%±J‚"‹	âÂ7?Å"8nÉ«ª-?ÖÚ∏¿“ëÀ∑6á•"3ã™˜9rhJE‚ïÉÁk•¥Ñ7∞faÛ›
≥LØQ¯ËF“hñgM ±¶®˙]££^Ú'Bc—ø
•À‹h”Säh•Ï…x
Ú√óøënJkñ:zé©v˘Ÿf«‚ ”éﬁj¢ü<øπñ’\¿˙‹< ©G&KEÒ¿	mwXÁÓ–)wÇR€ôâ%<≤ê?µkàÔqŸ≥¸h˘|ÏfUıH&T°CSña"óÇ§@X‡ûu‡÷∞∫Èß:óÿ%Q:ˇX'Ú—QÃø∑›Ó6˝◊Xç7D*∂úºÅ<«+NaOÊ˝’{S4Ì·1ëÙ}p§,`çºç)%ﬂjÑæô§„ò:1¡Dk‘z∑æIt2æﬁÊ76û–çH‹ﬁ§|o<æ§Ä¶\z∏SìÑHÜ÷ w#ı€"êÆypN:ˇ+b∫(Ö{´;‚¨oôqh›RzQπ…èn@è◊y«∞Ä7Ú áuÎXC7#]©∞ÄïµhA‰À£ÊûkEµ√¬*-Îßy•ï$°rFõÂÆj3◊¯/§∏lPBñÚ™åFßΩıÖ$Öa≤p7∞öÊA]¨ñâŒh≥§∆≠UK∆pÁ&,c◊/fˆÉõO·¡"£àËgÌ(FªX	˘*e÷Ø¯,ÜÖ¥t£
ƒ≤"oÔ)áW?3nö”d±N2ıgUOt°ò„≥bUE˘Œ™t‚N[üRÎJï<⁄ ÄîìÒh&Ëƒ?E Ôïßr'–¸VÌ0ÂÎEê…Ò.Üﬁï&ÂñCÃ?ÄÀmR1=™S3ÙëΩ‹â(⁄•!\+6Èÿûù∫”dõ‚@HYWÛ
gXO/†bê±ûùrÈŒhÁL¶ td“K`´äKıàêS<2>8ƒ’bà?âu°;RÙ,›XÓ+±7tP,Ü'zäi√5Wó´ßJ<‡qß•2ÇfñXF>.![_…ªPd$‰éÁƒi ú#$ö¢Ì%†¡ıŸ·Ù0=T¿îBsÈç/_õèΩ6íÓ+OﬂzÉ˚ˇ∞nlÉË~=´ÉÁ•œ¥7Ÿ!Vvf≈¬ı,ô•Cæål…™…ƒ±5E§ÓÜóÊø-0Î‹…I5zy=∫ì€$âr˙”Èwuı¬ &∆áFΩ>˛$xkAâSÊ¡ ‘“„XèÙ÷õ◊∞Õ/À
£íæ,a˚Œ`¸ñ»:j0'jë;¢iqCêgÙ¿“ïl»«˝—Ûkƒ¯˛vàzIvâ◊+æZ¿AMæÚ,∂[T4]M¬jFpfÏ`	}ÙJ[œñ;(O5û·¡fY±ßöt˙ˆ 6¥ÁæÎ\Q›≤M9·kGˆÀY–X≠d@C|µÂ-hg–$Ñ∫g Ø „≥∂F˜’p‘°±¿…YËŒ∑$Ø.nˆZy ∆
ë¶|w`◊aÒ2Zª‚ÂÆùÓ)+;$$Í4V +'ê]÷.Sﬁ2g2H-øIål‘W¥≤}pßhì ªVóêVK˛˛ ù0ò<¬≥[NÇYjHˇn	®ÿÿe-"i©œO
ˇnêï•∂…7ÜﬂÜ-@⁄¢Õ¶ y3Íwì¸‘∏g-©>IÖôÚ˚}[JT¥,æ-äJ˙‘˛Õ4Zˇª} Ô:pcw˙ÕPˆﬂÌïZT†‘ºåÉ˘Œ%æ2‹6{°o4"wl”˝∆H`KñhÆÃHóvßÊ=P≥µiﬂI%9 p-n#Ö¥”¥ê‹"nßi	ı“‰TÊ8ûb∞Of¿ΩÜ∫fy®\©} =ô/j{1:‰ˆ˜ÒÁΩ~¢1k≠´·Öí# sy˜ò∂Í[K:J%»_HAx…‰Íâ™L0`¬Kïí3üÇTÁ†”≠∆Íª˛˚EŸ\ü¶ä{¨§ƒæØº{äﬂk¬ÁU∏∏†bÜç≈jô∂.ôYÉ≠K;ïˆ]*Ëı¨‘a ∑ó
?ì‚PT0•^Zøxn5PK…yªäΩ≥ö9ª©¨≠)F	 ®®∆˜Â{TA€-ùf∑‹„eÅı^_•]U+˙tm,Ô”UŸwk√‡ª•ÄÿóNßX∆~≈*F@T't> öÏè˜ á€!)f>$u	÷ë;∫◊i-ΩÆ∂„Kﬂ	ïáﬂZó≤.õëµØúÌ@?Y˘‘∫rãP$˙˙‹A[7õ¿^“/û7-B÷∏ÑÉ§ÅD•´{Ìw6K{|
ìdı7F÷ÅÃºÈ˝_n3¨_jÎK&Ô{à‹}πœiÜ–&É˘\-d5$ˆã$V1f≈?)-À>»¥q&BóÍ8D£¡O˚Æ?;
GbûUÆˇ´ÏZUê
2†t\8Ácˇ©l§{%7—ıùímE\∫Ü¬±a"5 6&’‡1ˇ´Jn’Fößÿ]îã◊bÈﬂ¬|Ω®»“&§á¢“™vŒoìFˇ3XAKÁs{™%˘Aq | Ç¨/ÔnŒ#)6«Ev ^N¸rØ[“Ñ$ôPÚ¬çµ‡≤#˘∆∆∆{krÀÇNA©ﬁ» «K≈ƒ U'RB!¸3˝yÀÜ9Ù≤£3&¬¿LVœ¯©Ï$ΩRz’∫≤ÙR~⁄SﬂE¨°:∞Cõrn\Á”…‰Ø}•VÏº{c€üRÇ^vC…ÉKÖû6ı¸…Ñ‹*˙œÁ'Ø1°y‡4Iï;áæ¡da‚Ö#`úÕÂ|£Ø>ÿT]cï‘ΩwÔÖ“HÒzﬁIZû –OﬂôÄ‚¯«Œté„D}=”nÚ˛Z≤¶ z=m‚øj
·ëã”ıÊƒGEæ‘n*…à)9à91˙sΩ|˛∫íëX˝JüSÀÆ<ÿ'ÿãîÔ‘	_»w u6Xo„œ¸ÏT)ˆÃ¸]Å
®ÜN«¢g TDÖ\œ1ÿ+ÆÇ[G„<*£~¶ﬂ-9Ï‚}”∏ãÔä<ãúo`Ê?ûúZø≠¥oe≈‹8Ò¬…E•mÍWjiΩë7ß\iRôKçí>3@Égòñê’ıLπl˘3"ù-Àj£'
±DñH…≥òƒMp¶≠˝=X‘8·ˇWÎ¯∏up¿“«EÖÚ™¢§òhó◊`JÃR<ôuX ãı§B˙ÍúﬂƒÀ~Ä´’Î∑÷{çÃúﬂÁß…˛yçµÚ3OæRf„å=Í€Jqå„úí›XﬂÙJgºÕƒJÔ 9yÛ0±É,öí∞1b¸K¢ò#dÖÀ®∂j®F†◊ÔvµoT¡´j"Ú8…≤ûË9˙‚°íì«Õ@.\-«Û—˛˘óR5”‰UÀÒÃz)r<kN±¿mÈ^Ω9πüŸ”,˘sÙ˜WÀ˛‹˝°€≈Ã∏}¿äõèqÛ±–Û’⁄;6dŒˆ‹ÎãÈuÂòF'ôﬁ)Ã%T≥∂u·LÏõàÌ‰x∑≠}1Üj[\À:÷ﬁ¿q1c›~D˘…üqH><û˙OˇÃ )î˛πç∫xsæΩÚ˙≈—ŸÒ·Aj*Á•=ˇç¶yâùqÌ≥Ì$&S€$h¶À·¸ıS8„ò˘Œç˜ì4f–Ω‘DœtxÜ&»èXœz.êûx@|–ˆ}ÁX”w÷ﬁ•œa®{|{‚‘≥BPR&˜Ωq∆˘€-äÂ≥C≥ñ›pY6ÎΩÒˆ\C&«‰6ãrôäÖ/óôD≥∏ÒÏƒhä÷JŸ`Ó ^GÓbÈµ}Í»'€üwZ1àO∫wS\—6 ùj…E≈ı7®Ú´›˛ÒÏ«ì≥£Ω◊¶ßé/^ûlüæy˛ÍË¸•∆Ñ2∂@-[ÅÁ⁄ÉQ~X\›2T\Ê◊ì£cÉ&Ä¶ÌÍ•7«F≠0yj%˘*>	À]<◊Î•<áÎ"ä6BﬂàËC€ù∆s£fcª±jZ!Ò0çfbÑËMﬁ—mSü§ó0	ÏhÜc°gŒzm2aØıäæ&ë£—‚—›d≤@˘1£<xÅO^ì¨üG∞ÔåFòe∂øj˝£’ﬂHÊ36œƒGí$^f4!i√N°Õ4õK4Xa:aõÂj÷∏ÃRv6Tö$XŒYÇhU(5åæ˙xöå*¢IcQ5∑(YrÕØ∑.A∂`M∫\[‰5MÃÕ%!ı®≈ i]&ŒEëuK≈j∆˛c*%⁄dçB™¢ÆEØÀbvjes"7€›?¨¡h≠˝6el¥¿f>Ê ™ÿ!‚w"ø¢5…≥∞è(1Z =ÉÏ}Wã$-Œ®	$Üb]eeÈΩ·êŒU+4YØ÷,èN%ƒ√Fëq`ø¬€KlXÓ‘˙‰NÅ>PÍêøjœ˜¯”˙-á◊æÎah4†2ÎØÚ∫Ô¸<wÇ4*E'çE˙öD±	ï[ÏAñõO.ˇâgÿ∞PÚ9∂Ü8‰jdÒˆ∑á“H6∞˜ †öz7I>°Q_ãèí‹QmÓ«óûœÙ¿CÃuˇ:˜„¥íS	vvø5tØ›P¬ŒéÔ‡ñ˙à;ù£Q,∫µX’ÖçÖÂå'UŒGØΩ U"èÉ0@gà¯aS¸Ñ›¶Óö•b™F÷◊”d`,qƒƒª'f˘üÄé√]ÛÀä·ÒËåNÂ·)$é„≈€ãπTtêü“-ºX∑Ù˜zÏΩîﬁö]åƒ§»$ï;ÕY≥¥{XUÀÍ%Ó˜ÒYÏ—‹ö•YPC“(-≠=¶2ä©mﬁ’Ïÿf
–YC÷ïë€·‘ﬂ∞˛…⁄ÍäP√3∑∆¨zà0n!KÊv#ÜA9ÛdçH–DápÚ{T©3¥b¥7)≠VÚ⁄£a⁄;K¥ö›'£’jM #≤åå1r¬92ÌNÿ·A›am∆ø®¬©˜©ô‡æ¸ÿ˘$ÑÇd˜›·∂®"i¸aâ€ñàPO>Ä⁄¬v‘≤Hˇ#,SxåˆÉâÂπ¯ÌH∑§∑˜B˜∆⁄C'>0Ñ¢∏_7n>∫cÇé mkÕhÛX]|g®Pñ‚øœ˘Óıµ„;–wr≤H>!ëÃ∂¸Aù‹\ïa>CÖgWv˘>6 bvõüÁ~«èvπí˚Ï'√xKam–èyy˘L	Ñê•…(NaA∫SÿÛ$c2£{ıπ…k“†˘ÆEè•à„##h4Û=ÒºÖiúqzKãﬁ8ÊﬁÿiìDM§iB4ı˚lëî7nOÌÀ±s‡?ÖﬁLmÉànÚ˘IµÚC‹¯sgãÊÜŒ|fÏÊ§bX”8JÁ;x≤I3˜
/›∆≥´˜HIﬂMS	íÓe‘•Üöu≠-ªymA°BÆº˘ëY¨_´√ÕÈ¿Bﬁf@¿ÊÌà≥EvVÅé~†∑‹ˇjŸ7.ûQ,+⁄õÄAb"›mk%a¢[1p@Í› ’¿·eõY˙ûµ«ﬁ51]ÙOærßŒ0πi1i≥IP5Qnoê”ÿNo&È5&ﬂîAC«eﬂ˝Ö©‰ñMC•Z√ë¶êS“DÄ∏jN,∏bp„Q¬˝¸aÔq∆^º¿≤éâƒñ‡qw‡Üt∞W|Ag∞©°“tùpIœjr° 6L—ïY∂ ]⁄la~P∑≥ÈPlf‹√åØªµ—Ì§_[äª‹3ìø—^¬kÆ¢Rö•åSBBkz⁄í™0óAéÇd`˚iäê¡§Úöíêa.2È§°a¶àÃ2Ùß‚zS!}I“tÙ⁄ç N!%ßòrcú≥:¢+!Ü9À§¨í§Í	e#ñt}C+¨ê`Î2°6…róvªMÔ®€™2q÷4˙Œ¸sEzIúœì´Î£ÛEËTÒŸæ^PvV∑†=ÔzÏàÿ¢7të*´™«ˆŒt‡ù7gG∏ﬁΩ)8T9…Oˆ˚ÖGÒ%œ„ É¯ê€!ú ;Ú-v>œ	î‹Û”zs±ﬂπ{ ªLØ˘ôÇ^	œói√9®ï: ù˝?é¬plw¢C™ˆ5—B{‡M¢{ﬂ¡Pág∏ºΩÈÓ≈·ÒÈ´Ωã√ÔÒtkWú#~OÉ∂ÀÜ'Äè¨{xÉ˝µ¯>∏⁄EÔÎÔΩy8õáª∑ìÒGï pNi∞◊[yòI∆PÓÍ·ÙA`2ùçnL1{l≥«˝b˙äÅS§EÒ'êT[Î
zÖÇN±%°SÙ3¬˘„@—àFÇ…Á?œAˆ‚ëÜ˝'ãŒ”,¯≤Ã8ÀùQﬂœ4≤@÷u™âa!èq~ütª1– O0zL'í∏#r˝ÓtF˝å6§¿∞™0∏6	&|·t‡c%ı™Åƒ∂∑a&•ß∆Dá{K•óõ&ôç8 ÕËLóãF_(8\O?ÒóEŸƒ¯ÿœ`ˇb!õ\Ïﬂ∂Ù®¢5Œ%≠÷®≤¶’ÜúÕ´åjò·YÁ,J!Q®gπY^æÛÏ¿lô∑±Ö9çmèó¸Vﬂ{‹Ì  XR¯;Ü√#@Õmk~i@∏$å¡	å5	<ø5Û\ä\NÌgNÏ1Õä•À‹B¥è#X\Óƒıï«È‰ô\û<EñB“ÌıA…A`˛*Ù n>A»√5QÑûAïH‚PxND	 »∫f¢Ë¸ìı‹πQË‹ù|oÍ˛¬ëéÆ«ﬁ%H⁄ãÙ“SÄT•,;õ®–ag˜ÆÅÕ o6î˝åIÓ«Œ<∞Œˇ∆Ωˇ3‹)Ùàÿmc5ˆ™J‹í8]Ω&~Kí¶πc”`>ñ]nê°ßòÖwËÒMá:Lae@∑ÿ—ìKﬂnC9∞LΩ‹]˘ bÀÙßÏLÑæ3ﬁ]ôzÏ⁄Ú`6ﬂœZ%x-…ÿRèXÅêsÚHœ~ºÓ<yØ≠hˆT_íÀÛàö8Aps-¡'ƒVÖˇØ‹Ò∏Ö°éË¿ßˆe≈¬›˘πwªª“Ö◊ﬂÄˇä‡©ŒlX£√›ï„ﬁ÷˙®’{€µ˙7˝óOﬁˆ^n¡ÔÕA´◊Óı¨.¸˙·áˆÙÀÍøZ∑z?∫|◊~üÒg‘€¿g¨Ω’Ü{≠˛€Õæ◊Éè≠>˛¸2ÅW∂^næ}ﬂÙ÷9~lı∫£ÕõÕóè…EÎË¿∞d?s.ü|ÿòÇo1–≤ñi/É–aÇRª∞ƒﬁ∑Y¡`‰Ácg»Ã<í‡¶wä1)èâíÄÏ¬¸—&¡m.Œá1TmØhX-◊æ=tÅrZ°◊Ú≠+‡z-˝≈hax¸ÔK'É∞¿bºÎ˚ŒD_,ÏiX,ù≠HÂÉÂP“wg¥ûÑ/5™@|ô•£Øa“˚∂¨d
t‡VMFåLå8õèÉ‡@ö4'∞†¯Ïit≤ãiõÛöíµ	Ùπıb0√∞ÜPΩ≠v∏ÏÁÇw™ç¬êy~∏ëß«‰úV\—q≈UŒyEv¡ÿCnã`ë˚ƒ∂(m0Ÿ%Œ‰„e≥≤›°õÕ∂ïl;Hº06ÂÖëæwU¬/4bóÁ3¥Ì-^ÜcwÍ¥‡Ö	!ßﬁâÈ)óˆ®òÒßOàegŸÊ¯Cî?âÕ ñbÈÄ	ç¯Çó‚^èYü¯‹Áÿ£åj]™ëxq“í-’Â:Z$Æ>8&3ê,5ÂN$:UíæÑ≥	qvaƒtY]zÉ{„h;πKÛÏï{t&æhπiM#äü ¡ò34†r»à7ˆxÓƒTË2@óÈΩ'ß7o˙ÅN•!GˆÙ F§åtQ;’oää◊,áìEõöTÖ1í\^yjÇ#Pdˆ-cDÉy∞ÌÕCbÆ‹ën!—bé∑¯Cl|*ûıΩ$è‡˛Øl˛V¯$≠<ïfw:Ï°•JfQO{#vN\OôC˚3|ó/V3Q˚óÕ∑ÎW≈ìg¯P2Õ^u;Jπä9Sπbó"&ñ[TH∆àkÇÆCàÃc
yœ∫rå⁄˙•Uı@zü(ËFØ+É©™≤äƒJTnCœˆ≈õúO©VCÜëR› {weüüp}(N$™)±tøƒjÌ§…%rexn&î@¸≥5ÒÄ¶∫“ûvÍù÷b‚ ˇÛƒBbº√”,±áATH∑>K—ØÙ∂Fu‹Ê¡âÔÑËV¨¿«SÂ-Æj¬oêûmÅPŒ”»ä˛ùèÌY‡‰ÓÕ®¿ièàë˙ñOé{XÄ™B_”(UÀd,àÀ´9∂}(¿ÕrﬁΩÀ™Ú8t@ÂV<{åsÆ<eÛmub/ãùN8™£d<µÎ‘∑ÒÍ*Û≈| é-ˆ`?∫úﬂˇeXCsJ1ÉÀ™±ºπ-üúC´õ±∏∫|>Ûÿãºf#l”be√S~û=∂ ŸÔÑËÍ-∑pàA/NÎ≥≈ˇ`¥⁄+D´bY»ÛsÆ…óH:éÁG êÀóÜÃIF¨r»ú≈		AÙ&e¬⁄„¶<k_—M~<OÍ“1;®⁄√tL	—2W§dôìÎ©î] ∫ÃÅÈ —]õ,£W©A@ìÒ
EË#N¿˜ﬂcXPΩT™N7‡pƒP•U_Æ¥b%îõÇZ,’P®ä“˘ÁwŒ≈ˆ÷HÄßüh!ãí
ñ≤Q›}‘NπÜsüb@(–£;”@<≥¬pÓ£ 2∆•Ó¢ *ûP“wG©∆q~9óØµ-MÀB©≈òÜ ˘∂‰≤m‰îå q.àY
Ké^xÃì‹+•ﬂ	áØòΩ,€pŸ<ÒÃòX˘uº4%X	o ”Ã·]ëéóLúû-O;m!R6wÎ îîÜ"·ÖÑ"•è/R^¶g	Z™[B9ª?œ+-A@DØzŸÀ%·∆{ÁVßµ%S«NÖ∂dÍ¯,ª.ºìÒ–hPøé%°Ñ6`íˆì:O£É;?/=Ü_<2àï√â…ÙY±¨N‘ƒÑ’§9Å3qu∆±UÈ‘Éö
˜˛r)˛îgq˚∫È:#ç£Ê∫÷OM∆áFlÃ¥òkÁ1ÌÀ,^Ò/U
⁄±‚‡Ç.·¬0ã∆f0ûªà˙]:Ûb°!T≥%Iå¬òÓt"èXy⁄]÷∆¿Ã’:Ügâùt	vÄÅ*Ê·`Î≥4∫°¢®≈∞·ƒÒﬁV…√ZôâÏ_Y†3ZÚ∏^Gî®91g™9É0˘⁄P ÇÂNI0‚Ÿ~Ô$5∂Ú™]bû∏b['õ/îã*µPmö@k2ÆÓÏÈHÕë˙Ë.‚Tªßb⁄P¨,±Œ»N—ö>’ÔFYŸb0’MB˜fi,¨*
í∏¢∆Wc=_ÉºR,sﬂ¡Âä∑˜ÿÂ§›Jáû˙ïû=qÈü˙•gSÃyy∆“9•Q7gâ≠úÂ≥ƒz]ÔJaubÂJIﬁ„4°(πÂÚ$=V™πTFE”%ÙQﬁ]ﬂä2ß|-]‘îf¥OKßM]:›h¢Ñ/≤†™&#’Øog9•$$’ŒœÂ3Ú∫÷PTòûè¥∆’sƒ≤˘VîRË´-)*[4–§Ø∏fæºM¡pÄf9ﬁàSß@¿OÌ¿Àñ*(Èuà%¬rW®ßfºpVﬁ∫ÀÖ≈D3ò4wZúõVô•upeºæé©ØØ≈™5k9m$ˆ,›ë‚4MqΩˇV^ÔÎjØ^@dWç\ö_„≈yˆ!Fºê·=Ö6õoa<0fo<ra{6Ü¡O‹LÛ∫ﬁˇ’wﬁÍráÀ≠/ºîi€9vßÓ6±Ùh'ÿÜ/Ï€‰À©J4/êßA§yüo4ñ\Á—^¥4CzÕ›∑ŒÑ ;ùöÆ‘4¡Õ∞ÇØfJzN„"¿EÆí~ú¶´¥ﬁ]{M»¶≤ôvÆ≠$m%’£–6®`9ÜÉÁÉ“B Œ7[^˚√kyÜ∂√iIeaqcø>b E˝7 PD™È:9J2!v3:ÑC<8˙{q—}≤›Ì~ƒ§Æe]ƒ3Í6ß–ñ“f◊TO"'˘ﬂŸ¶nÕVbˇ"∂á¯I∆«%=ä^≤ëL[ÎßT5%Òq∏Ñ˚^50M9H∫ó$ç‡»L›˘V∏™å†`‘∆[s@Lä\ËƒK∞=•hGë´∞Gë+ﬂ„ ù+¿2æœUqànDÀ:˛Éû“#iRÀ±ÑL ãØŒ∞$Î÷—já%)‘öﬂtI°˛‰√õπ$
Zí˚¶Ä¢{9	âRÊ"√+öX˝4|˘&à‰CX√πcˆzµ≥Ÿ®N…≥}iﬂüáíµÛR.‘≤ST8SFÜº^HHc(/öîV—O”a„7˛WÏg÷ÈóàóNª8cŒ¶∆°gΩ`˘_ùKÀBõÍáóÑ≤…ÏVM“[’Äíób gŒ5®˜$bÒ@ì# X(¿9\ ø°cùyüñ„qKaºª"WŒìÅ©U:^©a_ï˚£†-Ô	I›"©tàÓ`ñ%ÙÈn”å¡<I¢3ƒFG∑~7\ì\Bï÷‡≤4-¸íZS˛†x≠.πo,·J’Wı[‚8∏‰~IyY–·-LŒêôyºá?jº-Õy§cëJf'/¢3˝≈!h#„sËÃÓù
ñ6ku—«“Åõ•µ‘ëÛƒ£îG»ó"Tw
rá=ﬁΩª≥ºô=p√œ€ò>d‰‡…;¸π¨ïãÔ±J˘Ω∏¸ÜΩ7ñ≠ƒπu√ÎA,úa"÷
nØ/[¥B8[â¿˚d®⁄¶Ÿ˝µ\`
ªY
$7s4>.áŸe&_·&ç6íNÙì$˘t¯ƒÚ»â•ö‘7Å-J{∞UÉ&çó˘~D[~ Ø¶Í©A{m‘0±&Z´uBÍ“K≈e‘O˜)˚—˛˘wÏ‘¢íä´H4_ö.™˙‹&p¬#°n∆¸˛jVBq	üì8´z(2à∆ô’Î©ÆF°¯¿˚4{ˆP=Éç:ÅmÆI&^VıTJ{‡%ìp
CG∞áY2ö£´‰¡*√“)AE	ö4G°úı¥%ß ÈÙo*˜r¯TiW}î+y }c∫§⁄USµ WE0çÎ8C–Î-àÔQº|çd-R4’∂S'zìªç∫û”≥ˆP0>ÖßΩ%…£Iú
QèÒÍkEqÄ·∫fâ™ÕˇO≥I%6”Ç1M6ØÙyÆ5Ù?ØüYé)p¡ﬂnt„«≈”8F±Œë´ÅΩäH6kâLW"©,é8ªÖz‚›π)π€2◊Kœøˇ’wIQ;öﬁˇe‡zÜhq#Cy5Ãõz¥pêÍß˛˙Ê±&·zÍ]éc<Phû*¯™	ìvçö9*µ†Œ˝Ôµ⁄Ï|'lºrr‘’ÿdum±°Íqúu=©”YﬂÆH-˚¶àwYÔÄ®úZ%∏oOn√‹&∞¨œˇ5¥≠Êù¿+|&ˇÙ'´ªX}0AJ»∂hPôÿ∑≠tiã˙Yp?û´5ıZ ÷y„Ò•]5¨›t›% 	˙q≤fπ√€’˙(≈ßÅÚÂ¨ø(aJ	§ÚÄ‚ã_VÍ@æ(¸ 5õjˇ‘⁄≤FøBÏÕåÃJÿ≤πîôÁé"ÂÊ∏c8ùœ⁄®ªÔÖÕ.b’∆M]~òí©Ù‚ÈZì~≈˙û∫â¸ˇ   ˇˇ –!ætxúÏΩÀr„H∂ ∏ØØ@∞Û©,ë"©GF*%Ö)äL›
ÖTí"≥f¢√ ë® & Íëlöu€¨∆∆f16ΩöMwˆ,Æ›kV´kΩÈ≠˛§ø†?aŒÒ‡Óp«ÉbdfM™RA<¸}¸º¸<,k◊ﬁ‘˙vøµ'Ó~#qÔìˆ˚Øß˜,Ú3ˆÌƒmouª÷l:u£°ª÷M¿w‚BﬂiÃ'ùõY0¥√k7⁄æm˝ªg5O›… 
õãΩçÈ¡ÔV—Õ\∑7ÔvıUÆj„©Û<ˇ(L4ôœÅo?	ì<Ωo˜:€÷Ù°›Ö¢p8Æc}ì'v2ãØßëª0Ì÷˛˛æ’Ü¡çMl'lZ/¨Ê`‘v'nd˚N{ªKWíﬂÔtªMk◊2‘π√Y,‘Ö±õVAnXy|IÅ£◊Ì*∞“\|\|ûU◊°Ì‹ÖŸ	∑π¯ ÅK∑⁄—¨»÷÷V3Ïuk’¨†ä'ûo|i}Á≈…„øFﬁ0¥Nﬂ\ÎÀçßÕÛJƒµ∞ÉÓ∆^{ΩΩ≈wxªÔ[É0r‹à˝√∂Uø€›ÿÈZÒ6Á|7V∞R‘ﬂÎf(	–ªô
$ ,/Ä1xÿŸ…†›oìÊ∏÷9Ÿ£èˇd«V‡¬æµÔ÷sl«]	YPÁsyéÖ⁄√–è€=+ûÏf∑}k‚∑õ÷»ûbóW≤uÊ≠÷öµ`ÕW∂©°«â5Ü˘¥ˆ≠ñ3Ë$v‰ﬁ¿Læ{ˇa≠s„˘âµ |&ÿJÒV⁄qÄö√B⁄!!âpˇ˚ﬂØ∂92àé˚„Ãõ∫|xq8q[´in“8¡AÕb7¬ﬂ–Ê§@ãŸSº[[˘HÒ*'‡+mrmud%JZ-{›`‹;Î Ü÷†„ÿ	•ƒΩØøÍ∂ª=¯s≠3rì+÷qÕjg€eØ}≥≤.Ø¨"Ô∆j·^Ï¯n0J∆d…∫k+‹ÓxEn2ãVæèU<Ï%∂Ôo›`<õÿü«z¸CÇ6∂°“‹D∂cwÈÆnnW«j≠¨"6Åd°bò∑’]∑v÷:{⁄"Hf›ü8˜x[´ÂËê}rˆÁÿ¿B\¿ﬂΩ'5nëGç(·±¯¬¶|4pŸ:¬èÏ5g¸ëÖE	uû∏é7õ¨à~Ic9≤ ;≤bÔ'Uz˝E 3·¢€∞6>øº‘¿ˇ+òêî?ÒÛ&∏O∑º	A˛§‘qÃ⁄‚s0ÔÊÓQiNëì©\ßJ`ñ,†°∞ßäzømœí∞qpîRÜø	Yd5f±÷ZÅTÛÎã"{ì0Ò¬†≥t-{âSø$îäÍï™1›{Æ=L:Ø#{4úV≠°
ê±(Èåj:Êˆ‡{‡ª˙KπfÌ®Å*`ê]Ãê¯≥Ep;˛AôBFÚá˜˘«é«∞´Uô.EÌõ(˜1Åpcª[Ä◊’^Å4ÿµ∆¯ {Å„çBƒ)º‚õôÔ[y"ÙóYúx7¸ƒ∑-Ö¸∞™Ä˛4ˆé∆Ó”Âè3BYÿ‘êVî∆∆A…ŒëŸ≠¿˘◊,›Éˆá#§L÷Ô6rü
ë.*ûàï#È:xã‹“4å„ôgQÌelÖ3ãÀZS¶W˘5¥&!¬zÿ16kÇ/¶ŸW“3‘7úÜéÌ£‘lê°sÍá9Ú9aÙ@
ûAWQ\â]ﬂ&Æse«ü^á—wÙ|3å\ˆ9∞@#sù‹;A0ÄMÌ›∫?¿2Üw⁄!zŒ~ÉŒS*æ\”n@wØ'ÿìÜ∂`‚%>™=≥¡ÌZ_ÃıΩÕDÕ≈G=>àgZa„Ç≤∑d™h>∂‡ˇ∑ÓO∞d?Œ\Œ√íN”y§™∫ƒ˙ŒÜ¡ë∆–›2°>vìÔîEh›ÿ~Ï‡:(s©v+Äùj(∏–œ√ÿµaßæ¡˛â¬	ﬂ~»_‹z6ø%ª(‰wœÏµu903?˘¡síÒ˛|{ª´oí}ˆùÎç∆	|◊’|gÿ
ﬁö∂wä∞\ô-¨U¬ﬂ{Ñg+‰¢ê ∞·˚ﬁM∑˝0úX∂E°ê
T9ÜœàØ(o¿∏5 ·ª¡X:¨∑·Ò_t €)†wE(Pô÷çn¸Æ=ˆ@k&5£¨ä‰:J¶x,’;Ó,”'BÇ("woﬁ êLﬂûüÃÓãh^V;Ç|5~c/âmk*g)¬¥®˘TŸw≤ƒ≤™ìıwêõπ¬Dﬁ « ¬ÿ¿¿åüVÀtf¯xU]E’SÎagGà/ÄÄì˝TΩ j|,÷W	.ˆˇ(v–Aç¥€~∞ÿèTËÆ∏òı5øT≥À…gºzıÆF}[Üàjk:W¨≥˝Ã:ŸÎ\´ÎTAùiÂ>°.3Öæ')4ôæ≠æ*mØÆpöt`ˇ¯ó@3˜Á[”<∑D≠Dq∫¥Dœ5ÆdEll £Tˇ
¬	Ã+P¢q˝m¸’55ãÍ–≈`"0A˘Í-•{E:NT´û¢Y#C≥+—ı»bı-»]Ñ—2á§ƒ4@I2|Qø2E‰RkjË
eU@*Wπ“È}ªØÍMv€)≥J…&n∆E∆1‰lW™˛∫C*∞n7yL¸õûxé≠—ØÆvdåÒYÿÀéåÅüÿüÖ¯6GæÀï˙Ô"
òO–Æ´’Ó7Ææ|“KìUÆ»ı˜AÇ‘ãÑ–a7ä‹h˘÷¢n
Ñ"ÒÈs	l4bÉ‰2úE@≈€”–£ö=QÀñ‚†L[fqêÌ• Îíˆ¿áKŒ◊ÚÙä.øE5gK${)zTs’£`U™$î*ñŸGfÂ2˝¿®Ò4º⁄€»È›÷s_9·pÜ∫«ˆQzª∂(P$ƒ6öEvdΩAsL7…€0Õ# g £QëÒÇ}Û9‘à>ÎYπÚ∞°è˛˚T=8ˇx#0∂≠g6*Å@‡qˇb√¯"ã4l„3Æ‘h$˘»ÀUíutÜÍú/°4‰u<]khO@∑ô“êﬁÌPù!Ω˘™ö pÎy5ï·Vˇ)*CHÙ‰ıB≈_Âa	IÊ¿ÊZ¿†F â˙»÷·Q@ÏŒ¨¿æuG ?¿7ê-`,‚0 )„'ÑÆ©Åò¿ ¨∫Q£=‘¿"W.© ¨¨9‰sæY¶¸ÛÌÅÎÎÊ^k„¨™·$5[„Ä@<a◊
≠+w2Ö≠¶;oÉ¥U“ü2¡™6ÄπÅÕ?ÍÌ:6-¸èkP3[NÖáP8åÔE>õ‚K™¶Ëç√YD≤•ìπÌÆ|‰∑±Õ,≥UÖn™ƒÕIL’-µ˜º`:K™≥£…√&¨6™ó
»2qötíY®Q˛÷ˆgPô±≈Üx∫È:˚ñ°:€al#$	.°	óÎoπ SwHˇk∞ÊÜX*gÒnÑ˚)ÉójÃgEÉûΩZ6zú¨≈xFu–hç®Ü%Æe.l∂jV	¿Ö;tÅ¿Î≈°%∂â»Óé<¿‚Q8älîÕ«øπ~T≥©Ñ»»áø*rÏáø£†*GA0a+«@∏G@Èıπê„˝‚¯'m2K˛'≈8 <I8˘;Œ©r1úCßl’Xá-ƒﬂÒNz}^ºÛg:‹xÍˇzCÏT86¯L®Ëï{„AEàÇ\ π˜v∆TÜçCD]&
ˇ:8©Ã¢PcY'^ï–ÕÔ_r<eíç—[◊º	NÈçÌ∏'¡2r•∆Øû–ÃçI6æ√E<Ùvu‹_ÒQ§Á@óo‚∂âö§"¢òkNgüØûiWC:Tsî´k94c0aíˆnôÛÜhNd©$EO·,!G™7å’_}ï†Æí≠£Íë•¢
¿Ä˙∞p#b7p¨iíZ∑ìúKô‚h0Kÿä•√D5´7¸TÆfØ•TÆJK®_≈À†ä/˘–sOê˙ÚÈ≠¬«ÙÂ]˘ËSÄ∫Tˇ©ûé+¸Y1êï£å#;∫@J ë.ı™·¡éÇ°U*Ï;€K,@éÔ:Œ!∂ñAÁ∫nÈiáÈπ ¬ÊÒp¨∏@Ä¨]ß:˛ÕÅÒv
∆πÛ◊ÏYjÁOŸı™@å23Kù8¸WÜ37˙›U8≥»ŒüûÍø Å°¶X˘≈7ø˚µL§g{«/_°e‚úòﬁ≠[Œ¿Z{ã~9∑l«π
Ì8¡}êº
áÎÿ4~˝⁄ã\¥1t◊-{:=q÷-/>#ß‡Îp˛∑xﬁ·	)x‘.êv≥;d_ÿù{Îπw‰draK@XÑÜ÷—x«Ïé/Ìÿ{€{„∆1›ü…!ª˘@ã£U´ªg"‘≥Ç0üÅ˚Ê–21ôÚT™*NêZøˇp–zˇA_º>q‰™Ë£äıxÒÒ¿yùçáëÎ“Qù»œƒö$§¿™`mæÒÿbΩ…Ó•¢I4sπ5!<<æπ|ë≥q•ï"∑Yh]JÃÅß—√ ≠Â0÷b›zæ›p≥BR’–wÌà◊Nd_B12M‰fc√:èˇπ=¥£»ŸƒQáX9ﬁ∏…pºf°'Â‰ÒÁÑäR@¯Ï©ì_^qbü@6˜ÆÛÍe…Ë—ÇÚáÁ5÷ﬂ¨ˇÈﬂM ÏOâ∆Öy¬π˝FôCﬁGXÃìâ=r—ÿLÀh†x!˘–t‹ÅÛ¢√;‹o4fÅ˜„ÃΩ‡C›'ñ•ón¬@Ó†µ¶+E‘<W·9Î·.Ï˜Y‰ÔZ¥–7hî«o¨≈{Ñ"l]™àv¨sF«ˆp‹jAiÿx"ç”*˜¥3∂„ñﬂak¥ñüjπ√∏™–øC~Ä$«~=Cbå{I1{∂kµxÁ ã∂Z˜YœÓyÉÑäßÕcÖ˜i’˜j’k/ËX1≈ÒÒ‚¯/%GI¸Éóå[ÕqíLõk&\eZ Ì
”¢'€ Íu¶≥x‹b+à≠Ø”ı˚ tç˜◊_Ã”*€Á´ïâˇB5:ÜMx|Ôg0Uxb¢nGwò`4C3å©oìSÙâ5CPT€"$˙Ñi¥]ô≈3¢ë 0ÇLa”
o‘QÍÊèÌV∂◊, ‹ˆß¸‡íË¡0˘∏Üc≤ã)ﬂ“‰©Îx6µÚÑ©4-∂NÀôW”6ÄfN·áõ∂BEõÄÖ[á82πã¶ÎQ‹‘.í‘0Ø∞~Z√6/Qêæ∞&É¥i¯T≈∫†m	√0Ø=`§E:!•∞Nq6««äBg~Ç€JXÊr!Ä'Ú"Æ[rïÄ,)Ç´fÚﬂI∆¿í/„˙n«G≠èÔ9( yjäfÊúD!©‡;
ÕÃ≠ÿˆom‹V)›B&>î≈« r’∆6¥[n-9>(F“_€hõeáà^ˆOn@¿P∂0§›èÎ∂_u`≈ﬂôeôE)¥‚?á1r©Ô.ﬁ¥poòl∞ÚX‘"3i°∆ åpp¬ÓÏ(–œ>ò¡lqÓÁÀCˆab!„Œ¶Pù≤r\ûqcRÑ˛
˙@Õﬁ–≥}`hn]™û¢◊É˜È0e^ÑÓïƒF–;ï ∞'
≥„`mW’∏∆c‘íy∆àx"í∏Fπ*ë#‹ß¬Ìà,f÷E±πåÂîYÆL¨IYQFü‚7h°ı6ºEéY;‘Ò>à≈»À5¨t*ÙÑâ%Zà(ˆ3!µ∆ÃQ»ƒ:·ùXAÖéwsÛ ~ ˛kX∫-vfÕ⁄∞ZΩ.»ı_Z;Èü˛ñÅ+JÎ:ÿ∑∫à«”{˚÷WúÌS¯g≤"‚^ÄX3øƒ£∆‘˙D“”œ,©Îóô‘¨Oò”ˆÊJ'ïï∂“B~Ì«ˆ©Ñs8ÛmAN±˝Y∆/(Àm„N∞;)ˆ:Ô˛gÎ‹ˇæQõπöÈÄ&î6_§m&¯o3¡6Ók(ó°_BG0 ≤¥-._æ=˚˛lS&®£≤√ÿ¢=è-`Y„òêÆÅ7Ω0qáË=¬œ„?=˛W< Gùv”«∏P.ûPÓwm?˛ÜE1À+˘.Ô÷ıb>::‘t^ø—ú¸ó˙é˙8V?U6bRÃAÊú®ıM,ÙE}≥.Ìö∫¥öÜ≤†^ΩmAÚ'±I¨ª±0K∑¨	ÃÛpºRê¯úw`üÅ v¨Ÿ¨‚JäZ˛èÓCÃﬁT‹Âö÷ÇIææIñ∂j˙8Ú¶”k⁄Ã5JdtD&£ª¡Ô‘sÃÄ4Ö‘¥πêÖ6y‘áGqó¿Á≈â<∂†Ö¬äéı»FIÖE}”
∫ÉFß3keıØôË©BE©rû◊Ù:åŒnnH(÷TGBzÜé<ø.»÷·Ù<
ßˆ»&ñBÁıç<\£ŸjNÅ!ÖÕK6‚„_o] à¥Œ8 E¿Ì4÷≠≤l eñTΩ≈B7ST%àZ´[Õ˚NßÉø◊-Jtÿbêﬂ‚Ç|⁄J{ˇQTá°»˝ÜE≤ Ä…’@†©π†„Ú]˙
"<ùjËpê/∏	≈Aâá'ﬂ¢ˇz=íu>Ÿû/U&‚çA¶['á ø‹b–
w&ˇM„|Q”*û†5Ó+¥–óÎªâÀ‡Í{íÚk5¡J@,€‘Ö˝77y©Ÿ‡“∆é‹IxÎíΩÕõ˙Uº)W6π2¯«…å˙÷T<2 œ!˛\§J#Öœ„Ÿ)m£`5Û†òC)$R=¥›˛5iJí®∫‘·kaMï≤®Ñ≤ÉôÌQÕßYøJàÅY/örÉÙçN\[ÈL∆}NXﬂV¨m’·Wπ…“-◊˙fåùCYØ'‚|JÛKH\™–Mó˙˘åBW9ênL$”º<{€!wB•FIÊ1Ì¶–gXZ°§åŒW"ãµÙJÜÄwÈ>…ü1íqπ˜….ooü°3^ˆﬁÈ?dkü~ Óı3ôö}Jw∑^ù3±õMò˛#tÖ#Ëóê®ºæD≥Ø¿ë\¶ûLF©	â`µÖi£‚ËaÌY#èœ‰â»üsÎç$ùQ„(ú˘»üT!KtBqëq2G∂ò‚ô›F^C$J}¢:Ë}±\ä€ˇÚ¯≥Öß–'nG.Ò¶ƒÄ¡0—Ö∏ø°%≥Èiáñ0ló z˜ôN#Ç'ª–“5m∞Œ¶2ÔVu·Ê gÉø@˙-B¡_€Ÿ¬ç¿©#= á90.%ì@L>ñÏâ“ncïvP~s‰Á0˜@"m±B⁄÷)ˆ£≤ïwÛ–J'_ÁÁ≠√ffŒ¶ËPD°áßb^p≤Cÿ& xÊ∏qãTóS
<yÒA_O1ÂV£¶≠2|“=Âf®ﬂ„UÁ„UI°œ¸x’Ÿ dòKmº*ëº »	^¶Ûâ"≤¢‚M‰∞≠ìÄ{Ì2≥∞\Xdºdú|—⁄,$)òJI‚≤ôyó:Rì¸·îô “S¶∆1¸É'%	¿òM‚3%Ó„sÿ¡¥{ÇÛGà_ÓDIK˛$µaˆ6Õ®E¯ûuÑΩ‘íÕáÖ1'õÍaf¸Cøl‘*blJ¬A àEÆ?;hzÜv{mX∞«ˇLè 7°;ŸxvTOˇ†∞Ω^‡%ﬁ$≥ ıH('C-T@1H≥π˛t¥`⁄˛Â€úmgqÏ‚ûÃ† ˝ëÁ9∏ÙcÒcV0áœû	ıÍ‰£)†à)
¢™v¢˚ÄÈø˙·àπ@y"a¸acçŸ∏≠ËiÏ∑£Û√Wô úªÒè3/F(õ¡ﬂpy#Ù2ÑA⁄†'Å„
€¬•Áá	†ãvÒBC[L7ﬁÆµ©DWçﬂNÈ	ü“´ud«∂u>‡l;Ë|Ä&VáqÏNæÎŸD˛ ù≈kÎ<.ÕÀ0¸üúü@≠ó8{ŸU9¢¡Yj¬#xÑB◊IW<,ÿ!1é+` ®r◊j®Ç8n|2√065ô≤"x¸oPä OôwÈÊã˘≥Hº∞öÁa§ı6åhaM ¿¬rÇ€7lzÎ›≈b3Iu~,N_Ê dw¨◊$˙òK|v¯x‚ÿõÏbu◊GáÁá˚ÔgëÌÿ◊¥“dÁ)Úa!Î†_hé¡h”B∏ﬂ;ƒ¡Æ©8	|Î“ËŸJ‹xÆøN±Ÿ¬∑©Ô&lΩ'‹ïÍËu¨´«ø&UôÆH˙¢_êyy¸≥»≈*øw#Ã!Öh—'≥£õÎ”`æ|¸+D4ë8B´dôouŸD°3À7∫ç›˙◊©71.Âlê§w˜S
‹±T`á†h`c®™cåwâÁ{?±Û†Ñ•k9µ£Oh*j†ß∞¬—˚O»)∆˘Ë(ä}.aÊ*‹hG¥∞mQ<≥nmØTÉ¶ä¸ˆYeﬂ‰ﬁ#æã|¯¬àŸr:ß‹60ën‘º yÁÕw»mk#Ö√˚˛E´ÛÂãµ˚·≈Ü·»ì÷ îô¸xﬂ˚ ˝µ]ô  /‘Ådb2^íÁÀ‘∑á.Ì≈˚Óáuÿ1uŸ.±"	÷À©&ºt
πBÅñRd2¶<[ªzﬁΩ*œ^üWßDùÕ§<CE`5‚©tÉ
ìî!è•ﬂÜ>r!ô#ÙAR±≤sÂº˛ñ©xñüYÿ„-±±◊ÅµŸ™ëb
j∂ﬂr?—høiGâwcì∏ôZ7ßÑ∞√É&ûÃ‚øD#NªÕÏò
à{°°£(.!.˝ﬁ∏ö¸Z≥H71YKo∫ •gp¨óXÁt2D,,"™π(¿;©&LTr°@A€x¬~¿yGéß≠Ã¡BFPe∞Îh=û¶ÒXÖ∂√®ÈPW,OFÃ⁄ÉòA5V˚àøW”&Sœ¿p&Ü H§mtá∫ãƒ}#Õ˘•ƒ|A†.„ÂÌóÀk@Ç¡?õcí˘Â&ÙHˆ:‹⁄h≈√‰r"OìÆåÜ¸‚ßHπxÿƒuÉRy	:ﬂÒù‘s‹E6<∫äøÏﬁ∏üs«Ùjä±4å ¶∆ÿ—§˝!—:{(vü*öÃßˇº8«€∆ÅE")
Lı´˘K ö{„˛Åy˚Œ€•ﬂ˙Ç¨∏;ò≤„zãIíòü_låX¨deÇ*»Ô(ºK˝ïnrÁ¬‡È‘7¸.7S¶%≈ rA˛Ñx≈if˛ ı},Ù˘ù¸Qupè!WÑ≥‘?÷|Sé5{pàwVj„VûCnoºY“zò>3-CKΩÄ≈Ê”“3I·©iîOÌÈπ«π∑≥ X;ÛîÙó¯ùáﬁ‘ˆR”yeÊÅ5ıˇØí≈óü xªc˛ÍÃ“í	öQæ"öœ£QdT’hoñK+dÃ{ìÜ¡(ÒÙüø÷D”õﬁµº•Ú∞Ø{∏	?p@`æk4π'5X13ù¸bä7jƒ¿ÿljë@“V§I(º*.Ÿúõ¨∂Á{<D}ï‹ü ¥Ôb7ÕØπUä{ÁSæß|Ô gƒ†ªä2ÈÌmÃ@åN«π«˙§yöÌ¡£ÀÊ‚—àØU_êUO…Z'‰{(¿‘r$èﬁé5∆?)ùY"Qi7ãõõí$Xÿì‡&Ã2‰f¡SP≠äaπ”;máaZÄùCS‡	áìª∑Ï53ﬁ-¿πi†_	ÁNÏ˚6˙÷≥<yLK¯¯ÛÂT-¥TT3cã¯•€@≥·cÁb®Â!l4àîπ$ÚYôıs«zã’„…∞È”$e¿&à=ÌT»¢∂”Çn—ÿﬁΩ!£bÌ•ëÔ®«lËômÃî§„I∆í¿o-∏q∆·ÊL>ﬁ*(¸úsE:\d∆ËÆÕëT9É(3zÕ«ˇ«OÄßç©hÖfß¿/“T‘1—'øî¨Â”œZL<#I◊q«  ∑ÛAÉ.GU+Ç%<∆ï-PÀ ƒg9—IeF^™¸Äö_¢&î/∞u/wg~xÕ}èxÈ˚+eË≤¢&´¿hË%ï'oZh®≥ØEÊí-¯>¸DV∑ﬁdÁjzﬂ˝∞ÏƒkÎ?©ª⁄
≈OñXmùïç3“j…™ÈÎ*4x‡jáâîBçÖn¶àÉã¶19å,∞‚‡óº ÖÜ¸í◊±…P’∑àâø|UúJ,Á4Ø^b îñåxJxR1êJ´πD›pÌM–A”ãtGπ“i®§®Ñ`„‡≈3B’ôbœí1TLÓ≤SU4C¥Å—H®mäÍSêõ+3käï%§JÉäﬁ˙AJÿ6MÃ∆¬1RÀπâ˛=û∞˚7LÒ  πCY>Å%¸‘.¯∆íaú∞u%ßO‘:,æâÔa®|wbùøzç≥œÕLbNËØæˆNÄ V&±l/, ¯i.Ht⁄…¿œÖ@5Z})kà¡Xîb˛æ∑nı◊≠Õ4%l˚
…»HKD¥ÉÔÛ≤›X∫äÍÇçØ∫
¥U	+©c?s πEªﬂC9¯¸™/5"UE*%Xù∞JÖ*ıF.;„√π¢t:ÛcUKZÿkU„ŸÕ3¥¥ΩM`g+GÇ≠›T7mÚ‹ß˙ì*Ÿ(ä™¨«‚W©uÄr«$Ê\TKu=jLi´ÊÁπÆmC◊˙õü•o˙yÎ≠§± !r´}V((¬p+ú˛ÍQ 'Á9Æƒñ<az õ⁄^AS>+¢j–πä°
≠DﬁY!ıÀ∑D® ökUñÉΩ¯àA ≈…ÀéÖ+πõ\?ÖV®#ËJö†v5g—©=≤".üµbÜ]Ó°b‚U¯≤rnﬁå√Ò~˛ÜÛÈy<«¿ow76Uf»A”%ë÷JŸ"]ú5⁄ëE+ß\dmÕhk±Pπ∏®%ï‘j~Ú3Üø∏Ò·˜ÿs∑JPsÒök˜õ	≥Œ-≈=$êG√}m’ã‘ywnm∑êWà®˝«Ùüpê∑‡aÃÀˆì˝VZô‰ó˛t§tÑ≈,™∏bπú∑˘Ã«µ˚\=˘¬©•∑ó©2{CπãÏ);üÆøÀù‚]Á?üŸÿ®éH¢YÄ9òŸ°ÇÎíIÖô6fxÇº©“ø©ëÁ#ù©ì”5O˘â“§∆¶’Eb÷z®Ë·úcû6Ît≈û++&„‡ÇQ˜ [ƒ'‰ñﬂ£°lËˆNî,ØN.œœﬁ>˛üﬂø±Œ^ø~sÚˆxπôZrëñ»p•Ëùâ∑‘ovµ◊ˆÛKMû¶ÎLÓvÃ‚ﬁ*ó¸¯ÚÍ›´3ÎËÏÙ¸‚Í‰ÕwáØŒ~Ûk.ºk˘køπ5ŒÎÖ@Ûz¨õf¿›Ëmã*€ï≠¯Â‘é>˘ <§ãÆ*¢X|œ˜ÈO$Ê$ Ÿojr§»xª“Ÿ5'~¶˝ÿπ·˜ﬁ∆xªf*$
∂&	Å-¡2¢q ‹®è	’SïxëZkÎÅG„‘›√öëp ¿íÿff¥'Nıí´◊·5óHÄËI[UTN¢^Ÿ—?ç˚c
/ÜZë:…»¯Âx1&àw@îı+™Ç˛˘/≈ÜõÙ0¨¯¯JŒ#»Bñì‰(…åÏ{}∫Ω,Eﬂ¶öäCìå&Cµ’íµâ;ÉûEÈ¡ó÷√.r˜ÈzÌ,≈‡ä˙¨e§^ºˆû@k0ÒÇı9ñ⁄î∞ßhÒ‘âyi{˜-Æ”1g/lÆ¶Ãâ◊r≤2iÌ	Û¬◊Eòø?ø‹‘•≥U2(-Ÿ¿d≤U£Â\`æe—Ú/ÇM£0Œ!SÚÏ+QïIû‰DÚ4áZ…”M±˛(Ù¯~Ëœºy
ŒF<≈ÁFõ{Wëè˚Ú÷d˝˙ÌÏÓä=°9$Ê⁄¬†M⁄÷Ë4Í`	¥òãLj˚"®6CVﬁva∏ >Ëg d%ùVM^õ´7—ù_r◊8¶Lj0¬u÷uuÁE∂Jıœ˛á{UcºƒòkºuÉÒlíô¯ ›BA»!NÉ1ã¶a£Ω∏ﬁLZÈ¥.ÅÍ|„KÎƒbˆÆ$Ôú’∂rî<Êˇ)q™∞æ‹êkûß≥ò˚Üƒâß4>πg⁄yBØ:Ù‡p£ÎÃπÓªı†«OLrîÕ`ıãœÏÎèh≤ÜÚΩ	©Òﬂˇ˝·‡J¬ãúZ_du¶Qü– ?Â°(ca4>ÍõEL8?µL÷84jÒ|Z&s9o˚sæ˜ÙﬂåIRãó#ê˛`"∫ıl™¸"*Óê·◊€5«Ω±g~ÚÉÁ$cÿﬁ›nWﬂ"˚Ó;◊çì˝˘W€ÜÔX§âl∏˚s4M‘|Ü :˚Ê£Ïéq˛,3±f<{%.hÔeŒGµ?Øì%¸ñÜÚÈ}o:Ì»È‹EÄæ°∂$Ûl á ’fvúGi óa8ıÏ,†Œ„œ∞e—Æì–ñ7z¸ó`Ë©∆™5πXTÕyvêÏ7b ˆ€C≈î¬¢eÑ‚æëYx’ âWEZsNÙ.®Íl£6Ë'7‚8Ùà»©@†^V†z%LeP’'V≠ò⁄tBw±0»4X?˙≈°ã¢Áª•^z,Wƒ\·Ôró=mìt0≤qæz~‚2$~<¸VÙ∏r{ß∞À∆ó	Oí≈RÉ$·…ÂŸ%	0“|U1◊^ï?‹ÿ∞.(ßÄÈñ“∞ErDãÅâ-∑É¡é(& ©∂§áŒ[£»ùxv>rR—Es°I≥ﬁâCÃœçÎÍ¬Z«da’â$Ï“£JÚZˆÉ1ÊÃ3]+	|¬¿~r(,
zb∫Ù–µKBi»ÛDcú¿+en“–äsÒ√ÿ5òµ¯P´≥ïb¨]ë9<˛s?„y,:˙«øíHtúç8ƒ`t3Lÿ’.!!‰b<¸ó∏S·“8öjÑäF™0≈õ4]eA,û÷)KXµúÅo,-^Ö`gƒö≠Fyë<ôD]TÉp˚|ı	ú©vÉB^1•,%∑&]_~%ıﬂÕs‹fëÜ∏ÿ•¥‘KZ‰È—Úf‹~øµç°J§¯j Rm©∂ΩÙÏ†≠µè†¶V¢Óôπ∑V±¿ùÊœ3èi’R:¶%∆?È#gë¨h0‹mºú≈Cí%êbË&nË?˛ÎÔuÙb≥πGírêyQ+≤ª‰≥~à¡êê¥Fˇ¯¯3shÛXÉ<‹TlÒ(Ñ≈›*ò«beª∫÷ÌI{è˚‡ﬂÁe`"HÌ‹Ô{®OÈûd	Œ`Ï¢p∑Âëù˚
Â¯Ipy´ƒXa6 íGÚ€”NBA|R\Æ‡P†h±Úï˛bÈﬂèÔ∆YxmˆwgP'}{ÖÒúK(…ÙéÏ°„Qg6&§
á,3*	ñ%Ù˜=˜¶<
ap¥≥ó“#)z>7</Cù˘ry˙®§<00?•”Ù'vSñ∑Òù≈i9v/ù/ÚÂ.H` ¥Ω-È$ã◊ áD=RJu`ˆ,Aﬁ,_‰í@Ω·xÑãVK'øRê‰f…WàÍ«ºî7¡aûÒ‡ö`÷Í$h™◊U§∆ìfIœÿ†®¸ Ê±…ÂÆWDÓ¢ÈC€ímíá^"H_tèŒﬁ]\_¬¨ùúûü]\ø∫fè§TI∞$nB°…µ,¿féEî·/É9·2∞Ÿÿ(àºû¬¡º=à<§~ì«uhpiòx·è	QD8∂–5(8‘,åÖ∑–mò	ñA4ﬁÎXG*^ÜHE1Å[x3√P*§$ûäç°Öh‚ê⁄w≠0ÚF<@3·F®Ö∂à“GJ‡£Ñ≈˛¨…âu˚Î–AÂ…ÑF∞ÊÉ¶1˛¢«üßÜ\å±Mtœ≠◊^<ÆÍ¡ºÖkJ7‚ÒÏÊÜéﬁ÷fh∆æå]EÃ…h›‹‡…¿›wIk¢M§•OÌd‹πÒCm»œ®	¿–ó÷§›÷H	mÚ˝D£.°œŸû·?P¢ÀÑëπ∫¿«˙ƒN0€õÎ8É*€BˆtBÇìOA®ùDÆLa0-…÷∂Û„ïáy%˜˘D∑rÔîﬁ26N≥º†$Ω:*bå¸G aàÁ7º[ÊÆ§©%4•ñÜÄüÜ	›≠‰–mﬂ˙±NIÒ˜?vlÚ‚AﬁﬂŒÏ»∏Píõuç‘ìÿÈNêöJ+¶’ÈsFƒπ»¶@©äˆHÏf«√‹Êg7≠‹`êÃX<°Ï¿ãÜ}¬[`¶ˇ ü‡ÍÜìÅä∏p9öŒ◊π È‹!Ôuã/Œâsøn—¿O=ÇÂHîlF+†˙^®Ë√nVÙU€èx6òx§÷,›ù“*nˇxà·Ç˜≠Æàµ≈¡j†´ı#‡à‹B
+p'Ô·´Ñ(Ûu\£˛·ﬂHs-)zG`‰ßëÀ±[-⁄Ÿs)CÃ”#ô¿ï˘eÑhN;∏.∂v∑¨∫u±CeKSÚ≈9OÅfa6‡LÉÖ—%=
≤D ≤æÍ˛ÉŒ¨âÌePèS(¥w∞_ÈÇ¢&®»S˘L@ãzB√&—SCÒR5¨R,sÆÃ◊jXuë¶ì:äyCRk5≥Vû1€’Œiù`“˙Dl|Õtq§Q,â2∂X 9öl§%ÖÏI∑ ëﬂª…_A!é∞'$®-vûÔÉ√•¨lﬂg#?qó‰! Œ∫‘U8eºïn¶Æ¡§Í“YEl$∂–qo›ËÅÖk‘LÑûÃ0·Ö`´o¶^‡Ûœ|ﬁ$Uüä—YÅ¨V\ÒTiı'HÕÿ>…Rxiﬂí%î∆B'fà3‰£@çP?4Á‘ÈAUbwä4Ò¥Û4Ø∑ìŒºpñBü·˜ú›|Ø” · 0M{¸b-
N?#:À¡ŒÆ2ÓZ6Y#~ÃbΩr„…‹ËÆu0˚¯œ3dOøòÎ¶gïpÖLYæ/ºÚ™≠≤¸^|ÖÕxïLä6üWæ≈z!ºó
Ÿ]®ØJTjc8»˙Q¬ç¬µ”ø˜md;3¢B?≤ß°√S√Ú$<,&™Äˇ°ó©Ê§ÍsÅƒÒö∑dxC,)≥(ﬁf•6…µ¢Aréó≤ñÿÆ“Ä’*-j©•HÏºÆXULıcCÍÁO™qû◊vñóÆÄÕ‰0T2z€Ïv2*2n-»ö˜Ñ◊¢@#4vo£0x„ﬁ»f™ﬂcÚΩï™Ÿ"µ¢âÂ˜'óWáVo◊zC~º:∂éﬁ] 9œ[R>S∂ÉˆU‰3äÄ(„úìùÔù›Ï∂_Ï~ŒtàÑ“F„¶eEÜú¥™¶œKF⁄UBCS b%'é÷3i≥ªT»-ˆ.D‘É¬¯;¶zŸZ¢ßî•n1Ñä"⁄æ€Óı§—QÛº0öTà¬kÜŒ+∏∞Tµ©˛%2!Ù©˚Øú°q¿Åo`;#åú^Ó[Â¸πZ»n)9B?Îeïä3#êf™Åß>`ËæK⁄ëÎ€˜ÇÄ∑ì4å<¢?*w6-wUw ?Áœáıô&’ˆÉ
!ÖŒä[FñM+ˆﬁÿngqı—ıv(ã≤TÕ≥∞N©‹WuéÊÜì
√êß™¥ΩµEfÉQ2â˘™∏ÔëÆ
«ú°1ˆ+c¢6˙›∆¡!≤”¿Âøö-h	@=kœûKc™gî¨/P≤”«ˇ˚’ª7@À0®Rµ<QÀ”¥g2ˇC»úâG„Ín¶ÄJÇƒ¨Ã`	$àlo÷ÇM«óº4ë¶p%öús¿Nä˙RÈÕÜ©7™3◊í1ê◊äÿWãÔ§il¬ Lµì∞ëÑ◊"›Çá”YS@:¶x/ öBÜ¡•‘ÿêg	fÄ=ÿ&|#Ê7m5«I2çw76ÓÓÓ:Ñ ¢€Zê`Û3X,TònLÌ]Ä„ç·l è¶¡®πˆ¡
…±*êín©1í⁄ùtD?ë“%D$/¶m b#ZI[/&I‰…[ôû6√˘∆jQé¬óà®Í¸Â·≈A	Ágﬂ^_*0‚Ñ‹†îü$Féµ®òñë3a“–éIL5∂J%jf˛≈@Õ ˛—∆†Q¢fÁ¢ÍòQÇÍ¡=HøÊ"÷Z¸É’öÀ∏j±°ÇÇB;◊*”ÃÂ"ñ¶1Ÿê≥ÉmM∂–@ŸÄPA÷ >r¢p
üœ¢<¬#àg£toö˙ƒƒ	¸ÎV^∞»Ïª»πõêú'Ë\6øC/©]Î„ í|\,ñèÆ¶Cåt˝4˜M÷¶ÀÇÆÔZÕÿ–º@ø,´C-7ËÉÂZËøfGM˙ˆ´ƒ∂]ûô—…‹¸q”€∑«àúéOO./ˇ∑3"Ö_\ùº>9:|e∆PsôÿﬂGR^Ï9ñIàHIùÑC%TU{†≥Ω5+Û˘Ìrò∞D©Y6CDÕ%Ù]ª∑Öv∆[ñ‚]/]„¸ë•72òí‘ÀOP0x)˛#LlUÃqxgGŒgë¶´Ô:]N†ºò GC,1¬î‡Œo‚¬Êâ[ZU\ŒP	üô≥Ô‰zbñdE”pâ'!·ñÇ£»˜·Ò_¨4>Ò~
gB™d&≈Y.9ˆ¥a'ﬁ“4XÂñ€gæ 'zŸ∞‹gDJˆ1∑<¿"±wÒí˛\gFª‰g›Çiã‡˝ú‰›∫&Á¶”™Çó÷¢í˚éúOdËF	m±,ìHZ∂V6ë≈B„DRÍ#¢ÊRDëzµAïPéú’¢ﬂ%±&:∏πx:Á—æ¯-l}ÚÈ¥Æ
ﬁ"EÜﬁïÑ.≥éñ|]1…`gŒLXíÙK>⁄…<Ü3~¥5,∫/GJbò√ç…FIweôïBÅ tÚ6∫´z¿Ì:qràùˆ°¢ﬂ¥6âh K¨Q+Vñ-’¸#€k
|<ô∂∑uæ¶∏\âH‘⁄÷sqI^XM9Úw∆ÙhbÑÀ/6ª]h°R‰≤-1ÿJ∞lªk” ^+ç;æ|†q\ú^Ÿ•∫¸ë»h¬	1é®xm.JQcäªœFÃQ]¡sÒØ3mÆUÕ∏‰ÚÄ§(¨w;N¢ìÀ¬Xl"aÿEc˝¡Í}÷8ŸOâü9ˇ®‡|‡zÛãö[Kï$K§–”‹≈Êû†®T=ıî úÛèÊ‡DÙ\¯√^…(RñÁBœˆ2B˙©ƒgÔa~WT˙∫¿∑¯$4Ö£Àgv‰J_ë	RçM÷ü	±ó∆≤#	s»¯ŸöAπQEŸ!:’#À[¥l[y‡€, æm›i≥ö¿U5ÄT◊ZòfπL#QÒ±“á≈ZÀ|Ó≤	í–÷.!}l˝È›…ˇj>nŒV~s«i∫U◊°±–Ãó®≠{ö+(…ôqtï]U,`∏]ÛHÉÚ!∂È‹;Ù«-è5¶A´SzöÊsÊÙv‡œrKÓæ™Ç•v˛ƒ◊„œëZ-¥≤_#§8S`◊˙åU§=.T’=˙bf≥≥≠∞k]ˇ˘ä®Òÿ~¯r£ñFƒ iÖ„µ$n¥»_
:Ïî%W(<SŒÌ-≤√®P4ç‹,Eó’7¶ﬂ«¸∫õ{-Ä2Î3¡H•›8N‚Idˇ†ƒ9ªäŒ§Ë\√LOìˆéŸæ†äxo<±O˝â^¢¸§~ã∆¢‡<UNß(ú‘g:âx¬u’¢,VU/Ê9™∏xmˇ‰¢‘	èÇ¶ña ül-Û+ˆô
 M<l'+Ì` dßg∞m	kù_|˚ÓÌ’·Â⁄í˚8Õ±¯\L«KVsÉÈ§,Wπ$WÙ´æl¥BÕ≈àômQZw©'¡MXê∑2Kn¿B’ßYd´Bf-≠˜π¢üÕŸ]†g:“>˛Áÿ˙1ÂhÌÅÌ›SΩ1	Ã§—•‡À⁄Éêî˚n‘±ˇw+pQÈGiãçÍFtïA◊‹Ôû¯˜ŸÄaß˝{ÆB\érTM„îs#:ß◊≠πk_ùkXHoâÄZñ/M ÃUaTTfT*ö2¶hM∏}c:ëü;å Ê¢Ûc5…¶∆ÅÉA√h≤i◊]ÛÃ˝î,6‹¨[aﬁì≥ ≈µç‹Jù[ßIúÍ5âı◊ã©UY„®^{æ=p˝˙Å∫Ò"P(^™º§Æ–cE=N5øF-#Í“)¶,qfS+k¸∂≈Mƒ˘c∫+i7ª’tÉÍµ\¥˙ú¶è°¯ªˆ∂5∞‘<Åv¥_#„≤^A$M•4zf¢/Ëﬁr™÷Õe,¸; ≤i˛hì*ˆ≠úDJ)ÊØø>d∂ÎÁ∞Iãz¡tñ,∑)J¶hG¥5¨ËTwH~º˛ÇíöèKnSºDÛfπ≤|]»µ“Ã(|iü–3`È«v0rÂCäS[?RÔ{D◊À¡)2»˘‹ÜqOÍÓR9Uˇ≈ï€s†Aïåÿµ=€ ø^¡:Ò+NÙ
#±óÖπU•Ää∆ÇKrŒ¢/TÈ,O–I8⁄¢ã±∏›1I\±†v8Â Ò õÂyÿ(
ÀÁÛ´
´|‹b‡û¬Õ=æw…=»ívI Gº~	Ò∂Ç@ªΩk]_æ{sÖÊd\∞≠%ÃˆT˚Æ“¿èï“tÕ3—º£§®î∑®b.)G+ØædÂ’´mÂE\aReLêâMπ‡î€µ“9ã¶\[c⁄´à⁄§Œg(≤zZg'Æı6 ß =ç“∂ÚZ <=îÛÑIVZDuA≥ò˙LààÇRø{?t})æ™5V	÷Øî*j†ò©”Wà\WSeSp$¶*†ﬂ˛iÜ⁄ˇÒÁœá. ÊcúÑ1*î˘ôD“XêÆ®Mö`"#ÀÂÑ3ô±*-fKÍkƒQ"~Nè ñ0¢≠N “Ã·luŒxf«öu˚ıxËdWÒ@Z”¸ñ“2ÈıJÈ"°û&ßBÈ8oÀnHÑèÕ·Lˆ™ÃGõÀÇvÆó–`ÉÀ≠oîÂ˘¢Ñìh™t3xRFm=ãX±YÔr;≤äz‘0{ÂŒR¶≈∫0ù∫ú⁄∞úí±Ìh,µt‚e–<◊°X!ÜÜ=ﬁeñ§¿ØﬂêC™S%ÃbaUï8wº*°∆Ÿ¨ª£‰∞0µ~´∫Øek€4»â(«]î}È¶™3∞Ê≠&∂ÙÈ6ZCAk√KÛ∞D˙X— ¸‡
Å$L‚Fì¿“rÄií@í??
É/öºé ïƒózÒ√Hûá1ç¢¸ñ›HÒèõMπÑ_⁄∑Är◊i“z£Û,îBπñÑ€∆dd~H0∞µNS÷jŸÎ÷`çM£Òæ$É4~’]Îå‹‰ õ ËZÌÏ[˚≈ö&Ä%…8íÑ‡‚≥–^iï§1W”¥«òU‚÷∂lZ8óÑ7•Ò¨ÏàdÍ a*Ä©h»±˘©N˘ nŸLAg5ﬂºi¥$ägáÕ|Ttÿt◊J4˜÷G◊¡Ú∆1É…c∏ÆÌ ºâÆbZ]2xI¸M ≤txœèg,}&!/çø±4‚Mp˜¬ƒ.˘Ôa>ÿ7òUÊÉÃÄ.dWF∑R+€]ÀE-CnÆ≠ì’R4âB*
Ãπ(fŒEI]Ñ-òm;2î4xò:LÄP-LÇIILlf°ÖM1∂.ÏU8¡>äÏálë°À{…”|ç†0ñÍ§˜öàÄ, @ âCëJ™MM†O˙%ﬂ±˙ÿçÿqÃ?≤üˆ$sÄ`Âuq+≈gYﬂ≥ä^d±p4Ê#¸}∆")büh¶#˛È:{ÆX§Oç©G†ì'è®ómyTÖÅÙåÅ@ÛPGN-ÌëWv:–¢yêeÌ©·ÕU◊RBı∆h∂L cÒ∞q8µ1e:€ë$<{C˛rÇ·GpØÄY˙ãçÈÄ±àã—ßBπJ¡!Ì∆lNR?AWSü}qDnrﬂ0æ>pËG},mg◊@«“óÑüMŸÜ'Éça™mIEÅ4>ôQ«.KkU~6}t≠Ù†óV˚;˝›B¡{OëhMâ-#µá§ßµR£’eåvSÜ‡Z<È∂h]ìÂÁﬁñmjˆæs—Apﬂ5kõ≠ªkáaTùo)á¸†!ÊòzÕÄ‚Tì)
å≈ËU—8@€|rÏNôax|áÑ¶Em3U≠Æô%ùàm¥*Gg2bß∑Sœ¿ºîäÌﬂsÊL%y*-„Y•	{òö^‰"X[|}rÅ\9∏«÷û7Yq4‹'è…”ÖÊ4è≈µ…9d{à]jXƒ€©%∞≤/hY¸›éÌË0iuëz7_4ÎÂΩ6-F$Ù@
EZÜ=úH3— π∑∂?ÉΩÀ˘¸b≠@fI‡2„‡î¡lπhß©¨FŸÌw∏áé`µ é°ß∞Ÿ›1¿ÄÌc‚C∫±f∂≠pááláK;ò¢‚£”¸BÊ=&ÚÄ$UMÖ»cRcw‚hΩ	á≥xó?Ëã7)≤g	∆°ˆÏ@S“ﬂ,≠lﬂ8zSıü0é	ê,_‹ÍŒ√ÚAh<…G‘E;r—ææ©Ìvô”e2ÛB8…ÁR?Çâ*.J#∆ª®°‡0Ñ·}vt4q“≈…Yì+vp+3.œF »„Mà	¡˚Y¯S)¬åê∫ØAp≈ﬁ%ÃÙIDíƒK]pnÿJÓ%⁄©'8–W˜ß“∆_% nrq`ÈOºWRï∂à∆•TùQdUZ_DÃóEºTb|aêˆHå˚]ã»ºÊäç/66¨◊a¬€ÃVæªAÏ›⁄4•∞êEΩ0S	~¿*qlËs#dX'ÄΩ0ëc7Õ˝*O>M≤n‡b+URª2≈fvrPÈ"∆›œ**∑ó"Ú∏Û∂ïU&®Ê™¶ôUgG®,	I¬0óÈÉö”§˝Ú¢â2¨c? ¡Ó∑o‰%dÇ!Ï1‹”8å~Œ"˘/ò%Æ®R‘êbÇXk∫B¯w~Ò0®PÃdú:#ô¢|D[°ë;Ÿ5∆Ñœ∫e|U…»:≥Ôg*ìâˇr<ÆjÏ,Y%g~≤2=T}"´áZGıÑ e—íkπ=[—Iá•údï⁄A@3„^ˇoJ0]03]≥$!(Ô*À	‡Ù(r£Û»¸√~#€¸"Ñ™ô$°<©(OW≠æ¡v.ê‰R‡Bj“∫Nô≈|Ó9E§|‹h»üD≥ Pü€8ò´ì•=A(∆Ye–Æ >¶π]ÑÆ»¯Ô}≠Z29R`oÕ¶º_É˚s"—∫Â∆Nz£5	…p'€}( (›4˛˚øˇ/À⁄[õ|ˇu≠»Êhlã0¬ë»?0t–	A–peZ≠ù,	7πÔÎßw©°·uû
∞\Eµ‹,-m—^€◊∆RÔsqÔ
È¢^∞dHı|¥xÑ(m(ßÏ<†≈œ/≤“≥Øö	°3R‡H#Ï®⁄QTéö#…“Á28Û*≤„q_k.c’–¸Z≠s^’Í”`ˇ2GK%ÄŒ˘_@É˛ˆèÉ»µ?µÔ`´«u<	ËêÒ™≥≥:s∏Jåß‚Ω±eP!¬ÿ$°∫ì:a∂™qõ}·0c	;m¨NL8~i—CvM†Î±SÔLi¿<Vâîóá—˜ûBﬂeπ%Oªeuu°⁄D)¯XvÆ‹¨LÓd◊Àb°PaL±)6π~fj’ZNü5ëöxË‘€Òπ<¯œ˜3M¨|à≈’r”ôª™ÜV™ãjÂ¶è„$ú°∆(pBR˚f ûÜëÂ¡õ™Ícy™ßttı©™û#À¡¨Ãìäzı,ŸLﬂÙ!√KiÜ%ƒ5eƒã¸ê8”∏0¸Å,
Ω˘Øn\;dX=FlıDu˛,∑ZkkZW"k®úeÛ˝—Ó¿Å˝ˆ@¢ÚÜç@§îÇ&§ldGù:3R≈ÙÙ…ëÜMô+Zgj}g
,”I8™ùºìıÊΩ‡gŒ~8¿“πNUãa	€)Œ,ì{J©ÖuÎ≥òµ&œ%¿∑ı◊ÓËñ Å±oˇ‰Ñ¨≠íá©qpâ÷0°Öˆ¿Æá∫Hãù°~4üıÖ±ÂE∏ãıÆ'ÀYÿ˛‡ŒgÒ¯mH£#ÈΩäº—àÊ'œŸæÈs‚≈1|Ü¶©3í=:9W ÊÆé{cœ¸D∂zÕ¨uÀlkI!x|s¥>ó”u‰Ë
ﬁXwêö;b0÷úQ’øÎ4IpDq|MÀÿ∑™‚X3ññX¥ì?oãµéˆ∑íAV‰Á€¨ B£Yy˚ (ò∞eáŸûåó†X°äßΩ≤bÚg6E]ÏJ+ —†˚÷!˘0Ÿ·‚•
Jq£-Æ4ƒ|Jöﬁ‹ÑµÚùπ“Æ	üT±Eú—QÑ∂∆NSwdêM⁄ˇ¯OˇÒ?Z Ãan2E¢Ì)ã4πCw‡Fè?[ˆ≠áÈt€ÿcÖhc]Ê€—õ˚2ã≠©o?àsIrDi>ƒc%Ò√V„€ìÛsÂ{SÎBC˙≥ëAË<ÏZ⁄0k¬»,Ñt∏JÅà™Ò2>«COk´È4Ú6≈d5Üò-§¡≥-ù†çè‚ˆ4un0ı	‹ëdK€Ω˛∆føøI˛Ït∑1›Rﬁ@=\Zd©P’EÓïÆ9É+‹ÅKÃÍ¨Cíé%?;òÒtÈÅà‡∆Õ"a¶pR‰]§µ£¨ÊÑÛ¨0w¢eJdåätèæ zÔ∏Ja÷…ÅV®iÂÌ˛“ëDπ’OGÉTyËF5o@ÌôY.£N™q5‰@í‰sE:vÙiW¯ÊÎÌÓ∆{,}ºô~,˚Ç›ÌnÏt≥ÿõ%öNΩdîë"g…1≠<®çœG≥-Ix]ú«!¿€≤ˇê¬Vp€Nìi'’§h†˙Bﬁ∆©B"á˜eµT´“£ˆ0È≤H—út±¡9,@**(…`EH»‚Æ  ê7jÌX’s’§JhYâ®©Ij¸\=5¨Wä≈Fopó%Ä˝z;ßC°⁄ï{%Ô11Ùﬁo\P fAŸ(!ò0•eòaÜD& J*∆3/]4E‚a≠u6AË0õ#Î0kıà∂*0¥¢V@‚ië6·!#“™7ˆC8K¥ºÏ‹¬|#ÑÅ˝û¸‡ŒeÎñé†‘:SëΩ!wFUß1çßYÊá∆Wcÿê5‹« »ÜÆÓ‹ªßùìi√Ñ
‚qxw
Ω9uÉ)~)<(Û*Ûh_`£oÎ=¡€”»ùx≥…5Å=¬é∂§˜#o:Ω˙%y-ΩùƒNŒWü„ }3¥ƒ∆Êﬂ˘^0ªoj¸¯4EÁˆà˙)πÌ‹§™æd15±ÅUoôùÙÜC+q8Å‚	∆Â≈ﬂî$7â”âñ±Ç≤n0¥ØcBew°d√4ûc‚«∑óÜz|√àEPﬁ¡hˇ`mv≠/≠˛¸ŸÈÚ?òßNq ÎƒSﬂKZÕ´Ê⁄˚Ó4Ê˙ît<;ÔÜZËìŒ_∆ê•Î»<5êüµ.ôÙÚ ç~[£{∞”evB2g•7˚—¯ÑE!KØKƒ"•py4ïØÉó<,äõ:≠!„≥÷≠˛6…¸JÓîÌ˚ó7vø∑}<T‘äôÈ1#cçoõ©w&. 7“«if©ÃhÈt≤:+@⁄±⁄†Sö:≥˜rÛŸsC;?¸ãd\Wõy·ê?∞ƒVÙ£»¶?7S"«˚L^Ä÷Zm&óöD£k,∞∫wçÜRïÛ◊€4∆=ç_‹7fîd‹¿%TÜ»Âá¸	˛cÃC€ÖπKbr cRﬁ‹˝à∆à05VÇ˜˚sÜ‘:Æ¥¿ÉF€≥$$&rh%ˇ˛DL ?®}ÃBk´/SwœhøË±òhá}“r–§–!p3/Gı ,—Ãk áKïÀUúJ)qö%çúTﬁ˚YF–ﬁ∂í6^rVı}ø≥<¬áÏ∏N=È`YE∑IvÁÇ®dÂ·NˆﬁÑiˆùÌù|t£ÙåãÿñãA§ŒqOÎÖ≈O‡Ûó7Ö<FçNòÂ»Ké˜6∆ΩÍ„‘»Hk@NÙ’c~·Ñø‡ÙËêíˇ«"ΩúaV`¢Ó„A˜~Í¡rv¨7QÛa≈3x®® /f€:?˘3’Mé?úîc%^Ó6Ã;§°î:˙¡õåÙ_õ\¡ÑY˚öe˘–òÀ¬/◊≈Q‘Û^Å}ÈTØJ–mw–∞Ç¸Ñ¢ÜAffi˘ë´ÀÏ©◊˘1“òú(…n{Ä	∞Ω#ÿBéªÒÇÏáﬁv˜˛˚=≤í˚_ÃÅ¥¡ªw'Ë©X:HZ#z Å◊8∑¸–vD2€v|=€∑Óı‘ª'&Ö[Œ◊œwû;˝ˆÛÁ7_µ∑n`Ï∂Û¸´ˆés3‹nŸÓŒ◊œõÎñZ	…9	–·∑°ÎÇúHj;?ºÇﬁ¸—:«tﬁá»·^xDiıèvÄ«!Õµµ≈Ôâ—~˜¶˜Uﬂ˛˝`Doo»ıq¬(†<Ä√Ü¨ŸDç¸IçNÉƒ&'Ê•Æó¥]2ÏEÀ·íC]	ei¿ó∞|,ÿtÑH∂*KFYˇæ‘|%óÜØ¢9vNuEëUÑ9”◊˚ı{ös3‘âPÀ%ùÄÁ+ ÿ —q÷us‡AßW!<úB;Z….Z˚&6ötè¬©g;ˆ3"RßI#BËÔµJíZl*(˝ë
jËl¥ÍCø_ËTTÕ2c˘8BxôÀ©ÀbRà^w≤zEg∏Æ®PSıûò*.#˚bJ¶áˆ¶†ñÕ"ã[JÊRe!rK≥ #‘¯Ê=/ÛÕªpo"7I±∏äÚ≠6-˛,Ít:ƒ÷‰∂`UfÆgµﬁxO…i”Za˙ß" +
ÀfÄIùóﬂE©Eæ&Nû∞≠Îë€#∏˙µ7È“ˆ–Îàd√µ≠ÕƒCªµf•iÃ.ã¸V÷ÿSπy‰&ﬂπó…ÉO|uöÇﬂ∞˛OU0·∫A2óA7æ ÁÅc"å¥}eif‚4t2n.Óº‡ÎÌ¢>ºˇ7›Ós¯ﬂ]?◊ˆ…¬f˝Æm–·hÍOyèçÌnéÜÍë’H Ø√0˘ü:íË ü˝r í‰ dKÍÕÛäΩ)Äë§F∂k¿»ÀP“‰rÏ∫…ˇ%ï'q˙ƒmjÇõ_R
˙AÄf”º|Â0¢à—FêY@0TS!êà'OÍZŒë.ÆQ%(gÚg!Òl¿?…‚˚Ê?£d˜êû†íÈô√\¨xqÖåµù∂Pù˛Ì8•åß1…'µãÇVN¨ƒô…¢l»ÕÕÃVÓÛ¨Ï‰gEaòŸ€˛∂∂%y∆‘DØôHÆÒs÷XÊ˜rXÔ+1‘»¢öﬂ⁄∑'¿¬g∞L{∂N9BP›Ù#ÇóÉ{„Í¶´L√¢ÂLZW#Y€+≠ó£®£÷ñÙzb¯´BS/µ.”)W· u¸™  ıÉÀÏ>6V[›Q%ÓEjèˆã/9≈;yae„ÎmIO\ D∫ô⁄àß*>R7™<KÂû|1œv«‚„gÄ≠Ñ¶çˇ_⁄sÑcäèJ'
∆õC÷%¨/≠ú€h.päπL"˘»î~q=%ü\˚h„∆◊7≥`≤‡.ÕÛ√À´≥Î¸‚¯Ú‰’Ò€´cT±ááÔ˛|ÚÊ‰¢˘·õ\≥WnŒ"‘¡6ù§üÈõø:æ<{wq|rqÜÌùΩ≈Ï5S§y¯ÍÙ‰Ì…Â’yA9ª¶£NŒÌhæ JÓx¯¨,ÓLìN ÂıÇ6oÜﬁÚ+®' Ó3.ä0Ó¥b	÷î–hâ}Ω∂ùâ ﬂ€¥_◊ÅÖÉG[V	>ñ3ˆIW≤Í¨”µ/ö≠S_´≤:ÛØ/∆ö+)Vm)Ú[eôÂ0¬ÉÿfFã€›úHÌŸ3a:m¢ææÒÇk?”±ô®T©àÿæª5J±Ö$BÅ¨t(…–G$DÑªÙ;Ò3Ähå¥‘eûF‘}RX˙^ı´ı™øtØ§M8úEHlﬁA`-)æ•ƒ1r‡¥Z†6x LÂ§£Ñ
HKDÊxˇöÄﬂ°3AUn√€xFÒˆ¯ÌwÔNõJ‘¬<©†j€ò6£•6˝‚ö6Üµœb=Ã+à¶K†Q røóÜÚ+yu¸˙›õ´ÎÛ≥ã´√7◊Á«ß'óó'go/Î}úU¢É∂Ô√z9Yß‘©„‘7›¯3qÔ¸DúCRp{°åê«µnMNú]+&JdQÂ&J[»ˆ"T¥ñ©ãwïˆT‚Ö78≥ƒ≠K@ı4¯öô<Úr%hZBõü•RºÆ†çÍbÓÄª;p kÃ"¯<KΩ0q[≠$€ØI{—À¯ÄÔÈ´æ˘’¶˙J%ﬁÁ¿xÄ¡&ƒªﬁíB¡2™[´¬AßbuU¡£zK`C@bB»ø<π:Uù’CÑg≥#;p<«&ˆä/C ÒvêÓ±âØá¸´Îp@Ÿ(±ÀÙ3+º&±Êÿ–ß°“Û¶îi©SÈ	âzßØ§⁄‚ò:‚∞l>b>! ﬁf{CZŸ÷ê«Ω™$+2íxb~ï€-9é™No2‚ŒnË”¨(‹Èä∫€Û≥¬È-{#OóPùÊ≠ÆzŒi»|«–ÃEMò9çÏPlí,»ÜˇæTøç•"ø&—	ﬂ˝ö£ë}™Ç9N•h˙;#Ïû3åm4âUeB–{EîŸ˛Ú∞W'oØéﬂ¶*á£≥≥∏°¬˛ì≈U4~d⁄W‰Ãﬁß36∑0Oì1NcòbÃ•@3‘˚ÁïèâÖŒ∫EÚZ√«'¡„_á^ÿı∂ªËúŒ¶mAá4g.Õ:∑X74òfo -û“¨ó?ŒlÙ˜‡Ìù≤èä[„f´≠y[J<<Xõo›ªxjO—y)ü¯Yq´¢eT÷nä&“Vø	sFúéèÏi÷2Qµ ]ëK[óR˚õxﬂ≥”∂Å$¬%Y≥/ˇ æ(n.Khnå ÇlE·FXH7¿ı‚Îr≤ÅŸ>ﬁ+y»?(n-µÎ*j„•ﬂÿq÷⁄ÿ~RAı’·v˘¯* +zΩ¿6œ|˙æ]z#aÂ^=˛ı'oVü–ù‚≈8`r¸ÚUµ=_‹H*\HÕvƒ%L'qûO%íäãY‹‚∆ó5~ƒø*nq:ã¶~Èr7]Lœú∂äR+Å"aáx¡d"§=ƒ‘ººqrt]‹t‚/T{˝…s≤!ø¥“4„'÷È'Äwkª„E	∞∞Xg⁄‚ü†FGÿ+GFR*ù^4õ,CÏòÔI¬Îﬂ⁄wj;}≠≥è ;nU8⁄ñïÓ£0˘U®Íƒuì¨_§‘)<¬˛YÔËsÎî}”{ÓÎg\Z¥àï â—@¨≠˛2˝æbN8T´è¥ïøbﬂV¨öŒ‡’¯ì⁄ƒ>”∂q≈øÆÿ»ê—•N*¥m	e™éE¢z¥Ã∑¯LiÄ∞”«CﬂçΩ«ü—∏&¨—r%ÍL!«†ü©◊¸Î™3Ö¶úQN‘©‚œıs%ñ“∂$o™»sùó2C*Úßi;∏—ÿ∫¿”‘Sd[	óÆy)‡Ü_M]IôPLh¡¿d≥§´;c	ıÊƒñCYÛö	¨anƒ∫¶]âoU4&„5ÛjTl◊≈ÙçÑ!◊ä+Ì˜v:l155`‚»`e‚õ‚‚÷:”Y<n)<˝^Âù–r+€2, –9ˇ∂:≥ùö!gcé+å';z©>&°◊Âÿs}G·Yÿ∞ÆƒœÎp˜:ÎI8|óZëÓZáQd?Ï—.“ ﬁ+;»8˛FÏ }f-~=…˜É‡Ë\∂V)„/≠TnFtKˆ9eyôV±°*©⁄ŒZ~KeÅØVµß*´ÍÊzÚÆ ∆W:&‡.1òœ$Á«†CÒYú⁄ûÿsFÂ`‘hr{B»óñ˝†G≈˜H‹Ó;,gÆÑ÷dVA¨R%ﬁÖ”%ÑÜ¯l…èE&KzCûÒ†	  O•ÙuˆBŒ°+Ó·Jk;	£1“∏8©∞j{ÂÀôö∆7UÍπËÌÉ—É4fÕÒùáYW1»P.zzn¶Ë¡ç`MõªúŸ£‘Ëú<&‹Õ…∏∞ú¡˛‹,xƒ¢˝9˚ÅAæ17@5îj˝4†©Æ˙¬ ò&.´çn∆ó‰qqQ™WSK„S≤IÍMaU¢pÆÏ({'UHˆ3ﬂ—í6⁄V˚{.ÿbW  H}%≤.¨(•âÍP_ì§›Bä‰ Égw%CGaAmÎ¯Â´˙–"Àπ•á*·„,ˆÁ(ÿî‘*(¢r3íæ™ﬂYI…§ˆï©óPªX«¡∏ §T£dÔ°X†÷ï)PJ:DU˙‚TR\Q}Ëã£¶£∏∞§‹–WBTe;ïi"Ù5pEEIW¥òÉ™"ä!ÖhÙMÌBIÁS’Ä°˜¸}q5L…Ø¬*UÌ◊áSŒ´®ı]—Áı+Ã$˘¥JMËÔÀY<≈ÿF)ïﬁüÁCe<ó£∑§Œ«ócKÂ“y∏ås>ﬁÏßµ`∫ \«p∆º¿K<€G˙xJˆk: Ü≈∫ÔÑ©B7a`‹∏?£≠-ôè2ƒ+‚s£ƒﬂ.ös™òœ/Ú∏:!œs49Ù›ƒ+ÅMA∑§ñOµÕaıπë[b&iÍ ø√CÛ˙åçŒ`ﬁã≥^‚2vKÿ1Ω˙¨jJz9:—ƒ…RÎS∑d°∂“–Zä? 4˙ÌœÁ÷ÿ≈HU¿iˆ∫]Áv\•⁄+¡U7¸ñ∆ü|æÒ%F€˚îÑSÎ“s‹`Î/7d/L∆†,Ñ6'√ûCö∞æläazøÍ[#|›F*ã4Œ¢†ë≈‡i[ÚÆ¨;81€•y4JêVÅ?ıNaÙÖå±Ï`¸P)c¢¸J
:0∆¨	<Hê∫ÜÜ eTËK9@1Mûòãòå5ﬂ±§£»v<`;	€É»∫â¬âÏ∏“s8≈]Ol≥4ÄÈviãΩó3œ«(V}Æ7OÛﬁ∏ü&#ÑêÅˆü˜4BM£(%UC…Îú≈ﬁ∆∏_∞»ÊX=9JV)kﬂ$…Æ∆∆4ö±òÊlì<$çâ=d¡∆åÒ}ä≤`vÈa”Ìmãf√º5)¢{‡ÈƒAô`à¬πÄ¢PVÛT5ãâ´πˆΩ$3.ãŸAí„2˝˚BΩ√…◊œK˘è>√&íl^$ìΩ’¶ÏSD`}1OÈ	?°I•ñÒo›d©yëf3∑√˜ΩN∑ˇAMø§=≥≠qo{ﬁ%y¶*D1Ú∏nÜÌ∂~Wû6aÙYùYDl
à©~*≤±„ >~AWMPﬁÉ“Ö%™URèÀè–w¿]¥Q ö)è8¥∂Vêúôê2Ô÷#qÚŸÒí≠O¥§9T
'U£?x™ïmJó≥ÆbéÂza∫H^PåV∏“<vΩNYT3©Nvúå1nxT°m-+m¨°(iì>ÉnÛ_…däõ^3Ìñ|™è¶FÆ®)±ÿ4Œíq¡,;/mg‰bZ@Á	W≠`Ñp<ﬂüì(∑™›ob2Rt2	ç12óËó
Nú≤T ”n´NT§˛,ì9Q¶FµäñíÆZµU¶säLåP¯õ•t;⁄ yB˜u˜≥&T,¶éçT§®É≥H≈ZºE¢Î•iº‚W7≠^Ω‹àkøLﬁ9}#{¿Vï»v
"ÌT îXçåm“p∫b,ƒæx'KíÚ[¯Pÿx[Œí∆m…D5%vrY^uwõyåÑMôÊ#aAKÖ∂+®:ç ˘(ÁÃ] L¬wëüŸ¿‡¿!Â»9î©sÄ\πßQ_ÁÇ◊ÚïÔ‚Ÿ„œë6u°ôÊ ï©axˆØ>Ò°zµîéºhÆuÜc;:LZ]≈Ò¨¨Ω2é∑|?j@‰8å%W)õ®>m°6
"®S‘•NC∫kÚ1Ô¢Z>ËzÅp∑fé˜™WavC·ﬁ=Ü∑‰pùªx|∫À¸ı3ˇ<*≠7+!‚≤àΩOä´öéIsﬁËˆQ•¿•õj@d9ªö>æãòQÀê–8ö‰Ë`t6K2zr‚zEvd]∫$◊Y•ÿ†˘«D	ôKïôSzû„ãF ¥ZòUbòXØq6à-F€zÌ›n_[^:¶uãl›ƒŸUo.‡—aêUQÖ=iï2¬ÛS{´´2}ähØÑm≠µ
)këbhYMÈsÎ˛Sî§YcÉÀ`Y3++∆AÆN/+ß—dˆv*h2U÷p˛1'«NTÂ%Gr,7√˚ﬁ6AèòÚº,®T^W”‘ËëÚÍP3CZ§Z¨#E—√Mâ8®≈O!7§„®RrÈ&YŒ1˚CNì¥eq·˜b“Œ#:#Eüõ3TÈ\T/ckñÚ@ƒ’¬…„Ú~∑Éì0“K"lä&+`lƒ$ØZêX≠«ˇπ∂u˙è?ﬂ∫~KÔMÛ\s¬éÃaÒV¶%ÔZìv7w»‘‰rBû“ßª.´Ä'ÍÈñ*ŸïÍ¶Évã¥{;çÅù5j˙Ø;~Ñ^	èAX∂‡›Ì(‹V‰N÷ÑRj¢4°åvÊ$∂úL«bÄ}çÒ≥·"Q>∑◊¨´≠JÜ”A‰»±z<YHoßÉLn’únëdœ3≤.,jøåMﬂ´¶l3‰∞—+HüK
“4†πÓ∞¨ ¡ìzù¡v[gÏ5ÒwóÅg÷ˇ¯Oˇ◊ˇQÅ˚5eÃëæ ˜±*"®:‡m9" 9Ç´¨å$π€Ó§}ãâ∑1m…mË'6…	«é‰h÷‡NÄåéXj∏œŒÌìOûÃò•5§ÖØ¢ŒD„9Ù˚ÓÒTì“Ô™∫ïØ®n∞@ØöZf™îê8É*Í6PìHÀ’„“b9æ†§P©Ã®£¥¸2ù¨ëY≈ÑBƒÂwË2˚HLÑYƒ‡MBíÛ:Tÿe¢{GÕt±»ÃÃΩ–æ&ú⁄C/yÿµ∫Î¸Ìm´‰KΩòEöT∂G vÀä∫˜^¢i≥]ﬁh∆0ay.çAù˛ˆ∫Â⁄1Ü;∆N`¢e’Âƒˆ|¥]~ïd…å⁄[jäΩçl˝L‹ú≥W Wv`î∆©≠øı÷æıFd∆
s<ŒçB«û>˛3˛§¨Ú§uÖ«—äÍ\mmñ#mjà2˘6fÓ“⁄ÿıQ®EB+ú¨π<hø@8üÁ="ƒs2}¯`º“ X$TµhF«É0.åŒî∏W‡åâ©á5YTÂñbA[Zª≈{≤n)ˆ5mW•U¨z XÛ–OMUâù0˘÷í9’ÖÅ6]J¢Á÷≥äã!^⁄à’%çJáô’ö—uWóÛ÷ÿÕ“ØJP%^F[œB’ï‹ÿπ¬Õ£4±Â{aNêÈvAÍ&F\dósˆﬂå®Ò™ÕmÕ?ÎåÇDT_ÃÈÊÎ–»◊ïÃáHC´0!ö^ΩC8/¨fjDîS®éZ•BN€Fœæ&Ç'Z·eä=QÍë≥h&öVû√ ñNthÂß¡,¢Ù€j°!Óöπ,På7p˚6àG<r4FSsU"™çå¶ﬁxòŸîõ<ßπ{vT}8H|<ÂØºï˘ÓuÈÄÅ±jçiÜ')¡Õ$.o¶Å™éq˚˝ÛÌ€Òáto¸ıIŒ\T°2'ooôzK`¨ıˆlöOØ´…ES¿6˚úŒÜãìb{Nœaím fôx¡Í'w8º15wMsÆ†VD2slà∑ãµö:i∑P?S%Áx3g\úfîêå•î'hî+(¯;Lùr ‹;˙£\∏‘Âd¨ÕíNTÂP™py=¶d∑Ωúà˛º´,ó¢WQu-⁄î©ﬁ©<ùﬁìi„ü≥ôrŸ∏ì÷L;äÄ´√?8ò∏ΩYI˝¢7ö.Á…8ˇ~I» Œ<_Œ^Ub†”·÷µ§[“ä.ów5«vöÿILíZπÈ Æ2KHsvN•‘ü˝<À≈ÏÖêﬂIH6Æc«,˘îRiö@·hQçí 'ÀfC¯)!ëI7À7%&<Q¨Ú‘Ωºô∑‘£ùÆlóW√Æ-«jˆÚÒÇ8ç˘ÿÚ·¶A‹\µrJ#x"{~ZÀx ’ıdI√øÍF%ïéÃ1'V≈´ä)=„iSz‡ÊÅõJ⁄€FÑ€ïÏ¢j€œß)*∞Wil_%ÀvZ£∆‘æúˆI5òLV´ü"˝›ƒ˛◊4±_äÔ‡Wk˚Í¢ïp%¸™≈ùk){ºû`Ûè◊/ƒµÎW‚^xî0ÅuIqæÖ«”∞yÙ∑¿±´ﬁ¬+œ¡l≠∆£ÄT˛õ·E“’rD¿´™∂˜◊ÙY %ó‚.UT\’cAuÎ—nì|üJMLt}¯‹.‘#^qiÁºûÏÄ@∆˛rB¿´ö#^´sF ÌÆd√ëœûÍò@*1;'(ö9?öŸö^∆ı´‰•`ËTôßBäÄ3ÊPI∑ñÌoﬁiÅÃM%Wè'£lÚ…ÍùÚÿU4ÉïÌd≥≈^“&vßæWC…‘mhu';ö∑@ñ1¬e‹Ç^èHí˚VkN:øz;÷-FÒˆ≈ÆÃHÏæ≈ZÊàªﬂé,ê¯íÒ˛øZ0ÎR~á2¿À~ø—˘æøˇo`\KêêX6<r“ﬂ»o¸Odﬁ5ƒa/¸jAï˝Üı@˛“ˆ_√„Õ”õM©^ﬂ,Qê6Gã/◊bµ≤¿î›é~∑ñÆNzFOîQÿî◊®ø“5Ç%ÔÌ5"∆†í8¸‰™+Fü˛@”ÎÙZû∑¬≤ı˙Ÿ<‡Ôß¨h>.\å»¯∑?!S;[Œ~„tÀ⁄˙@„ÛÒ?“¨µçw„Á ”ﬁ∂üﬁ>∑•«mv˜]ØoÄA2È[Ÿ§˜ÑIÔ	ì.é”¥ á”)ç:≠ƒB•oÁd˛÷π?h()öüEaÒ	–∫Â÷-ä—◊≠±8æ˚Ü‹]`å«8!≈^ÖC¯ê¸ºˆ"
Îñ=ùû8è„\Ö6~ <bHô3˛€&Ê†«Å=]áº:îüåÌ¯úf‚Ù0®≠„≈¯€uÉ hƒ–E+O⁄˝õ$m3k˝$¶õo¬·'lœÈkAÛ0Ü˚§u4ûE√1ªì≤∞æjCÏE'<˜ÓÈ¥Jè>–™.`9RÛR√∆Ü’n∑≠7'oﬂ˝Ÿz˜Ú›€´w÷ÜıÌ€≥”cÎ’ÒÂØŒŒ≠√ã£ÔNÆéèÆﬁ][ø∑~8y˚ÍÏáK´◊√¢b?BXÆ4 3ù\Òâÿã=ƒ¸˝áÉ÷˚¶√#ì7?»CVdÇä5±ŒSÂ°©Z•.@≥˚76,«ÿÕ Ìç˙T;Ub5Ï€K◊ÜÂ†uHè§
öMπÙ°°j'~PüñuÇT#Ù‡áÏæºyjcse≤¢È#i.õS/Ä’kZ¿ıŸæﬂ<hÒ'r‡cZ-ÉLRôW,<î™û[˜ÌYéÅ°© ¥É˛’Ùm‹(Ò‹Xû<˘π‹Y]6Ô´»ù∞ù.<–¿SA∑≤™Œ√X©û,5jæ3@∑Çªw4Ô'ƒC∞;±Í˘}G> ≤µ«π…:âOÌ{∫U≤ôJ”Ñ∫jÕÑ”.°˝ =í ì±=ßœ€›4HwæÆKhZ≠ü)µ"¥k}›á*π7“N__ÒIL¶Í,"ER&d#Œø-É
la|·ﬁ–/·GKû©tC¬(Loﬁﬂ‹ ’m©÷°B≥∆9@mrª,Ü¸∫∫@*Vœz©Ø_j +§çâ=<ª¥˙;÷ï=]ï¿€0¶Hmj;Èv=Õ=.Cv§"Ÿùf˜Ö»éîCÖ>ı¢ê;ë{U©#Í¶:Uñl*Ráº©N•G˘M’Î“]µì~°≤tWù œªj[‹Uõ˙äçªÍ‘Ù∂“èˆÈ;ê]ÁÎ˚¨JıçÑ;Æ‘aJñb´P∑¨<›Ro(X©[Vô“Ú=%4+l)π›lG…œ+lY±ó˙˙Â-´º¯ œÂõ¡5Ñ˘çõÓÓôz÷9±CJvÔª´”7Øº€cü∞0ˇÙì´p6k?YÀÁ∏R7œ[%Á°hREG”Úã8]∏¶—A}U7+îñ¢ÉÇÓè\Ä€a?Ìÿ¬N±…≠–O:Cå`'i£$Yì˙Œ¶≥DˇäÎﬂ!«“∏-g¡K∂`N[¥Ø8Q>Ù1ÜÎüa‰Õó√çŸ‹Ω¿©†Oﬁw?t¯wªò˝Ü.¸   ˇˇÏΩ]o‰Hí ¯>ø¬K]]ÍVÑ"B©Tï2°îîYöñRjIY=yâÑíä†"ÿAFì˙(çÄn˜Ì˜∞òó√∞=Ω@còßﬁÓˆÂÙOÍÏ_83s'ÈÓtíŒPduUo≤ªîÈn˛ennfnPo-AΩï@ΩÕt+B|¬^≈Ì6Lõ§y£˜ÅÍΩMÍΩÕ©wõiP`5"Ìa@Ó*ı¸Kÿπ…Rd‰M—÷‡ó!¶bf¶4Ûë¸nû‚Ùsf™ï62smŸ∆[CÚ§ç¯Ó5‰–ôö#Á¶ﬁ0—í&ùÏ◊¨çå/Î˘uöÑÜX %¡g6ë˘I{ﬂ†¬¢”<n˜≠‹Æ˜m˜≠
˜[:é‡„FkqQPÊî‰'#éê3“ÿ§í¶Iﬁå	ZÈ›)RåfË&S|‡Eêa√zmÑuÒ}mIG9m,‡L«*î7„J0-Ê–é^~Ø§3ÖƒIw◊ëÁ>i›ÈıföŒ2 ÖÛXPŸnÀ ‰œ‹}ÒπKìÁ&'o“‡|é‡4%fœCÌπí÷B‰/¯œ∞∆¸ü¸∞NF÷áù~óß®/ ﬂ2˛_ˇÕûåú~n9;Nçç£ è9ı8/o¨∏ìÃEŒ•R“È˚˘îµ;e{Óp‚–ÏJGÊN~ß®¸[^˛≠Z^o`Ë“a#Lä=_õä%"°ã7nB∏ãiHyfµó@LÓ¶R_í√}uC>ﬁ%ˇµò3Û`dë©X◊yä˚≤\TA2M…V:ô!àBbyåäë;ÕD;É{9Õ„INÂÛ¥”ü9úœŒOö√ëT∫?éfA◊s÷,ƒ(™Oπzü!ˇ§js+ÕÇ©ﬁgÕ¬¨ö”≈¬œF≥†^j}÷,¸ÿÁn>q˙|ÓV?w¬öÖ9÷…»£Y¯[:c·,ükåı>k>k~Nö#C¯s”,πSKÕÇfVÛY≥ô√˘Ys8ª{/∑ﬂúùü~{tr∂ÛÊÏîk¬¯Öµƒª§Õ;ÊıÄIÌIó∏≥ı&[ÿÉ∆ŸN0π€È·¬≤˘‚ÒWÿ˝íbË›∏^ËH ¯ˆùN¶ŒPÄ>N—Ä'Óπ„Ipé¥JvÜl[Ü—yjÄAAÇŒ'n0˙û‹ô7æw’dg··/}ØÎ»êV;Hó"#ˆy RbK¿([6è”'Ãñ·≠≠ô‡y˛9å-tzé26CpøÙ|«Ô" Œ˙ÜiÑÅÈıœi™F2®˙0%OˇˇÊ*⁄h«Äﬁ/±wöâÀ;¥?·§;ùp´7ÚÕ ;¡m<ì¶„?Õ∂öâi1µôo∏ÉÁ	vE?,x/ÒãÔåà◊¡ﬂQ±‰¯∑ãÕi4uBè<≠‘<ÊfM$—ÆôÄ»π"ß˙a–uÜßàd}∑Ÿw'Ë≥_ˇ–˜∆c.®7¢x2_ﬁ≈=πˇ†—- A4wì6«Ò_üÔ˙ﬂüΩnéù0r8ÉØÔ=Î:ìÓÄ’›º0ó8¬`Ë6›0¬˙¬¸Éa∂ªNàqµaö&ŒpDõÄ'y°#3=ÀPSœ‘”6/(feÿ)\#Ãºƒö=≠åÊ^‹5"”ò∂'pﬁpàv	 ]ﬁdì€±\2e˜¸5QZA‚»âó·ﬂ√ﬁÂ≠:Ã≈Ï$*5˜Ä,ƒ„Ã„å´ÀtïC)m@Q¸ó6aôUDA5On·m„˛≈Rb#¢@nq8XJ¡x«öÕf¥d–QÅ\È¨áæÓu—àVNƒ“•)2»ëo;øœı
Vi3 jêEº\NA≥&è2¬áÎE‹≠c{8Æ›^á//õÄ»€«Ÿ“Ä”ƒ’aÜ<4!ÕóÉaÃ©_ )Tú-≥u£Ê1Æ°8/ÛK∂n*r:¿ÿ◊ÙØXªct•V∞BÑR+Ê•Hñß__|Ú—,û©pÖb©˙¬√ˇ›u#Ñ}«ß5¶7 .ÇM}qø bªMª]7äÃ®“Î≈ûq∂Ôqâ˜ì=eƒ^Ë–ù8Pe˚‡‡|˚ªÌ˝ÉÌ{ÁáGªoˆNq¸^ù¢–$Aìc–“∞ên}ëB3\˜ƒî-≈¢(π⁄˛K ÎÙ/ù6b2˘Qƒ~ˇGÊF¯È;ågüÅ<ù¸LsÁ˘ó¡Çå9ÀÀÏxËt]$	êl:Ú‚¯hÙP¡w¬<8!yPjÍOtµS0‹¡◊*˙´£∑‘›`–˝ÉTª±∂î†=áK∏o™˜6∆}sk∞Ø„-ë≠,Sèw∞946O]§÷Òr-)_èóbs¢äâ´ÚR⁄taﬁ´öDuw…=.‹Ü9ú˙∞Õ—	8(á-|yß˜¸~ z]8¶0∆˝√6†⁄á≤m ≈€∏/√`TuØjîOﬁi7}aﬁßünƒ$“@=òßn0b0%0#Ÿùœl∑]‡`»S/0ôY¯v°.≥˚—¨á'av7∏ˆsnæóíö;©E*mÌ*4WΩú\zJZ„d∏¬e	U8H◊†h+´ÔÊyıÄk€J%zê)ƒÖ¿ã€˝^Ω∆≤«ôø†÷»o'´øèq∞ã$))◊§†≈S"n\âyÇbñA#œ©^º˛ÏÉ3B•‰È¸gÊUdjWs˝MÛxÆNÑ∑Vn¬äJGdWƒ∫±ß∫è!ø≤å{N,a“â{y¬ £1∆ÈüÈB87Ü∑ñœŒJég’8AÔ∂IQŒõ¢Í´ıÅ∆\@’⁄ÃJ˝\≠áUFü\5‡∑Ü*È≠∞Z≈Ñˇt™E'uh˝WÿÖ_#P¯ÌVø8é±ñáÌG|©◊MΩEºÜÓ∫Ãˇ u,ùt≠ñë◊0ﬂaæça¬VK@rÖn”ƒÔù—ÿÌ)◊ˆmI9˝¥≥$¶¡VÕ7Ã€<0KRˇ]≤5 o‹=Bﬁ§ëäZÈÈÿª~íäj„Ê™M…9wve?π¯IÓbÏˇÜ≠ôî/q§B#%í!~°xˇ7=ø;ú¬ë WÃSÓËÅ9=¸]>2ﬂ⁄œ∆"2ƒ	H†í|-ò.<G"wTS÷‰©}8"¬	„OJ PqF:ê˙≠¥90É∂°⁄»d!Øê4h√…Åg÷¬Hà¥$—ã∏Ÿ|˝⁄O‚J%◊jÉn¥≥ÜíÈE∑ª(¨eH≤A.Ôò÷(e"3EM‹$u˙3K˘?K)„3-øÅŸ≥0⁄ ÙRò7˙¶Ââ9§"ˆå°\ºê)4°Ò#9CΩ´èÂ
ı±|Ê54‹Û{DO˝ûV5H0˝qqOgdå^£?s{≥r{1©äQÉ´¢˝,á`≈3FıäÆ7çå‰cGŸ®H>˘1ìòs`(ÒôSâèv!\ïÕ,†%KÏéç—j‰
∏@¥>U®]sâÆ»]a{vˆ∑Ÿ;>Ÿ˚nˇÙ·;b{áÏlÔ¯àùÏmËq|x fo;3˛B/ìtv‚é∆¿«¥S:œá[˚˚¿ÛØº·ÜüÚXæù:¿ß±éeXU©¿`:ÚzTˇ…F˙Á¢±ÎS‹Ó§Øù1∆ª }πÊ]Ó=hm%}èaŸ—eL{R´√Äb¢o2≤—Jﬂì¬&Ö°¡õl%@ün1Ì ¸y=`>µ†e“À≤»98}<‰—oßnxK0v‘wÖ±ê"*á|/T‚Â7e·∞.›Iw ñ¸eÓAÿC=ø›˙]VáÌóﬁáq6„?∞ﬂ›2Ω<ß’ñ_ë¶C;ì≥Ê%ﬁ%‘ΩN7•¸‘HV7œí≤P˜fÊ%§§≥&ßÊc¨L&„hsyŸ{M<„#w‚Õn0Zæj/_@ùhÚ)ŒNº≠/Ô‡◊˚Ø`‘˝‰E‡ﬂ%ÿÚsÅu[ÿßØ¡4ﬁn≈¸–yåŸÁù—Rå∏Á∏y0˝4tM69_@ßõ¡«E6‡≤Ô^≥=…(¶áπD£q Û¨_-
^ÿ°U>hÑı˚àõ≈ÎQ¡Øæ¢
Mm8¶sLëùP∂3‘ÀS‡òc:OóÎ±Ÿ´4˘™Ã“ú»FMi£gkd^†Ù*î‡ülM,/z≤f>Áiÿ|°ìŸ„6'ﬁ®–¿i¬¸‡˙tÇÇ1.Î.ÓFŸæztJ{˛ä∆CoRØm÷Å” !§∂Ÿj’äéQèd%ΩM≤e8∫¨ÛsM Hıëaj¥ãRk3(-§‹≤	«ﬂA&./~§)óAôˆÅ2C*Mg¸à¿:†Ø&ºô”08@Ç—P<âYÒ`;ª„÷ßõc˘ˆ·Œ5rùhÍj–<bµw¿å[∑Ú>Â˛“‚b∂·F®’µ%∂∫a© Ùhm˛hÎ˚:¸æø£'¡¸Ω—)n!tº‚n>`O◊·øß≈ÄÜ»6˚⁄ΩX¸ËGô'ùñÃ€öX°¯d5ó<UrÿöK≈8g˛*1X∫ú|]4◊ñ˜S|ô√üÊbú=ãg◊\&èWìâ»n†ÎÃÿ254⁄=J6©b=9#=ÒÜ0uƒá‰∏X13|Hq˜kÒ!èˆY7
j*oc≤j‰Ãﬂ∂ﬂ{â=C~/Ój¬¡˘Cf∞˙¸ø7·Î®æò’∂Í‹§ˆü,7W }ı› 0Sô˘0>§Áÿ-`∏\—ÁÕ…>⁄˜√º¯–"pahë¥’˛j"˙‘Èª[„…Wdƒ6ŸB∂g6˛Jt√kì’¸<˘,(8N"˝o)b>Î≈À∆å®i‘G∂Iê®¡7q÷ÚJ'¥$-NπB⁄dƒk õ“¬Í¢C] àπË•b¬Fß¢É$2ÿ*jlˆWºüvºûkÍ£˜‚QÍ”†l¿¨1çx„ı£ÈC.=(Ó˘=WôÚï∫á3ûI
a)ˆ{·ıπ√…øü93Z4:ÎÕï2ç’çÊ∆Íúµ≤Œ £$–5ûÀÀlÔ∆ÌN·3iSÖ˜]„‡≥q≤ó(ä ˚N¿úã–YÄß≠#Ö€V`Ü<¡¿ˆxåï#™[74¸ 	°sû⁄ÜÔ∞1êMÚÚ0–∞p¥ÅÓLE¶!¿û(Ä>¯Œï€Gﬂ$Ã Mz.ôZèáŒ≠ÅºpMœK/å&Ø†w¿áÊ8ÊA/'úç⁄k≤xKTLr√ë∫ä._ÊÌ£{ﬂ|P˜⁄ö	∞YÖZ˛PQG¯]ìÇÆb…òg[4xL≠yÕî˘õGÖ‰WNÿñÿ;A∂,ùªT*GŸ%»_ÿH¸‡8«å':ÃΩ
°KãD¬‡Uü”[∂)›ì‡]v.Ω1Ç5‹êœõÙŸË|ƒs∏<f÷–ùÁ∞	ì†e'oıÇ(Í»Ï{∆©‚ˆ¥Á;<ÈèhÄÿ¢ºE7$ë7!vD∫v/>zπîYPñKÎq*9πöπ¢âÓ¶É®Gù3!∞J6∞@G…∑b}c_sïò·|…´k|ôvß9âµîj*GÂ$ïø§C«Ôﬁ¢˜÷wŒpÍnOŒ‡$¨?¡‡Ûi«∏<â_ø6w"O—°µöÌ<h3¶–G‰çÕìÙ).ütv÷Xº]ö±DÛñI)åÎ¶°≥_3òñ5w∆"∑Àòu˝˙a0C^Ñ	”t∑gµº∑ ´2ˇ≤ÉëÕ8ïRΩÏrºnΩÑ¬Ítñ|yö}ãJhSPj©™◊»™sâ4•u∆s?ßó»tÒU|Z·]∂nÉµu˙_$@…=ælıî3∫`°7NRÀ‡~œµ7<ÿn¸>ıÚ˛Œ√áÏ¶ét¢ƒà !ÕΩ÷jîã˛¶ûa∫f„.œ[˘Õõ`⁄#±ÈLf/˛Aqˆjˇ¯XÔIú⁄VÌåÙ6ß?&ß{ﬁ•Ìke$|ËSÏÑ_ÿóuc_÷s˚“≤=°)J˚Ò
Ñ›)—™g,Õœˆ.€°íÿ¯‰Ä4.îZ‡$ı˙Å÷ùÙeNo"$î·ús˜¢W÷‰·pnˆ^Ï≤˙^Ì;ã9˝X3ı£ cúﬁ˘à'4ç˚ÄûEQ⁄6Ow±Øÿ6πEÛi¯ ã`FÅä¶kÒ≠ãÒaÄ,FÁ£´ÏQ:±sr®w N2*5/%)Õµ◊›ﬂK{dÍQi–I€›ßÏ‘¯äΩÙÜû„eFÔ‡=Ø÷zÚÆ†˘±É⁄ƒ¿˜“â?v∫ùæ+Gì¿2ˇ
Aˆ}<uHb÷;1qù°÷á¯U^xÓ˜¸2&N∫;N®Ñ††B∏^R9#âZœí®|ƒ«±w›·tòN˝È ¯)iﬁw˛øGÃÖ˝0g1n<«C}…”ó-˜‹1‡òÉv$Èºø=˜SKHO)Ä˛Ê:€:&©‘⁄ØrZÊ	Ö] v>¶WAò4}8öklÁ¸Ä
ÎÌ_y∞$≠ÈÀÚ>‡ùG:˚ﬂy=7»Ì¬·√øCaΩ"Û¨‘æxSﬁ¯•3¬ç§n˙úÊˆ“=¸˚0€⁄ﬂÎŸ-_@pêPŒ˘GØób˚Á‚6m˚îaøÅ"∆E_Õ.˙j¡òÅX∫lt	ìR¯ap!!⁄Æ;ûMöi(/ΩÃÂºS‘àS7ÉÎ7„/Ï•Nú∏](lgØeNóô9 ËE‰xz–;TÔ≈Æç›{qÍ ÷:Qù–cÛΩ–MGìQ≤ JZ•îû/ú°„?¸9CXª∑éØµø*höÍ"íÁì¥«áª3pªÚJ≈8ﬂÛ¬ÒªH‹3∏>€˘J˝pB_:_wB∑ÁMv∆˛Ú˛çVg4v ˝3xâ**œ—: Ω-Ë¡tD6GbπN›	˙K,∆*E'[$≈N ÙÑßè◊O¸.ßΩÒ9˘?\@x—ë«Ê¿‡¸ﬁ∑”ë„√øÀÏ‰€˘zHöΩQ“Úk˜:;cW:i_"l◊Î√te$ÅÄ"Uh#O_ÊµÎ]5)@jÒ·ﬂÒ+R.òõucì?Rw‰x√sRÛ˚)Í¬À¥·ﬂπX
Ü
p¶’YÈåƒOcÛ}ÖÏÌΩ1…]®*ïË}R–ˇxêÀßí&ıdË]Ö¡π#ÛWYQÏ ·2l¯´Y∏K©]L	ã◊¥Ω|—kG*£7Îb≠˝ÙeN»§'Pˆ<Rø3Ä(Ô7(Ù⁄Ú«ª/Õ[}›∞’ãXÀptÉéyDiâµﬁÔ©dP˛·ø£Bg'≠3F¨{]œI¸˝Ù«√idhW⁄œ¥\˝†„Wkp∏•c~lÓÿÈ…MR>K7¯s9szA7:«3F‚p_y„Ò.º«Ùí@Ç=€=⁄ô«~∏ÓƒÿÏ)}14|áΩ74¨¯¨‘ß}ê•xW§?áÆ”£R'®8„˝õõ~É˜◊†`€â¶qE/Àâ&Ån}î∏drNIGûiˆKöÑâıå0Q⁄j◊∫~œIó|Gº»¥x<ÆıÈ|.=eá´Á€+:›ˆÄµçºá?F(ìŸﬁÆéb‚MÒàQõïjbÃ®PÀìõ◊Mrs˘|ÉDÖAêÚ1y *1Îq˘9#¯6Mû*ö>Ñ"¸∫t√áF{~ªΩãd!Aúü§Âß'kovíbÃÅ,?qÁ#…ÎqUW=v¬èÄsyqVÁ°@—CïÊÒÛ;jËR“ng5g≥1”#◊è‡@ı#uÓ›_gdJ/¬∏QhSÚªÅ3â∂«c8˙cÛ¬à?ÑÁ]${ûütË∑·Zt&=9s√±ﬂû†∞Ö•a∞sP˘ÛEπÚ¢©DíéÅ‰M&n˛í|áÂ≥k2Ö}∏p∫…ˇü˜aﬂE´ˆÇ
ò/;fùzº˛CfSV'zÓ∞ß…⁄€q1ò¸É†?—2ëÃ>ùh–ë9{=`Úc’÷‰h9˙©ˆÃ√=.©3∂±%Ô˚4h\D˘ÔoRé÷øîhÓ)~cÊ{£ÍziêΩe<ŒäKáT Õ«ﬁÛ±ôxWj˜ΩrΩ◊w'árƒ≈≤ÀÿK4ØôQπê÷GÜ5§"&üò˛
ß ßIQØósΩ[˜®◊óD°êı=¿»≤ëÌ–ÖÇ'‡:Y∂NΩÛ%»n%£ÔF£ì‹2\]X$÷gLaÙÓeµ¸∫·éπÀí¸îÌ»8 hBØ¡Àî˜√°pÉrùºé`hçÁ1é‘zÓU-∂0'√5…&ÑØ„ñ0¿ÂÎ]4˘%÷Û&áv»Œï„£,_Cø©É‡⁄wÄb|à®√àAÑQW∫Aÿ˚&ıRƒﬂΩ©CíH∑…ﬁ)◊‹Íïöz≠®ﬁı—7ˇt¯≠‚9üd|ì£À…’¨$‰I!ê>Iø»ùY'%G5‘éBìC∑œˇ›>É7Qp9πvx˚∆{*,È≤rFä’∏›åÑ©â{∫(fí2¬ã.Vd˝˜™#	FN XΩü„⁄+◊é⁄›àrI!]®:tÉ>ª@’fVF’˙°«g,#B®Z≥Wäq√≠p÷§ƒh‘Ò7é˘1QÕbæåt)*ñÏ uØ(ñ ∆%Pp∑tÓπ+!ºryUæ“€çÙ¬!ªˇÙõÅ6˙˜Z∆˙&cdè˜⁄-Ø¶÷∂µ.))‚ã$P¸ïˆˇﬂ⁄.N9Æ˚s|∞˝Z≤·#«"Ö%íM‰…KM„∂¢sæ:+¯Æ∆9$öqb“,∆åŸ˚&ÙxœÈÍ„ﬂ∏∑fÁ•AµΩwXÎ}ûıµ<,^RÑ/Ñfê”e˚w]àQEÔüßVˆ*oLi}…∑ $£h…ÏCÂ;„1y|Ÿÿ,+ìËÕ√˘ã®¶ôÄßee™û-(|Z<&˘Ÿ¢˘OãÀgÇVE;“:ÒÅëmBiQ˛¬X6>ZHGZ†“ú®~ea+ßí4Ì	’…Ù(+Iö™%VUπïπài¨+¨°r´∆Ñ–X9°íjuÖzßU¢ÆUQè§¥PzÔîCGÓ}–ÀÀßøÑ/È[cŒ ®ÂÈù±4rjY«á·FÆ©∞Ãc®ïÓ√Pës"Z¡ûdãÀ¨ä^∆11lˆÃ±ò÷Àûòj’òJk$ºëVêÛIR9¡8©≈TûI¬|_Ä?)?%°û€=Gïw/ã´FÜK≠)sbπµÆL≠Ø2l:a»0o°2pvZuçªìÍÍ|üZQÂ¯“j'®µ¶rÖi≠îQ‘∞0√4ñ◊ëXFue^R√ZâìVÊ—¥uS¯5©ïè”;ñ≤∂2—1PâYîAâÉ‘E^êjdèLïÔïñ[càç’ˇú©Û’∆JÇ[œTäπxm(	G/ç)óØé9˛¥h"h$ü3˜“¨n_k\Ê¸•ˆÅ@_T]8HÎΩ[·Goˇ$¥0≥—˘`¯›´¸B¿.∫˛U0ºr{+E±>>tˇ∞MùE›4Áﬂ≈,#E™çß@\ªµåÍ}‡D«x)®¯ı˘™™∫Ú∫ñ´≈Àz7Ë~ƒm;ËL|kÓıA‚$Ei`≤^R±ü“»”ÉèŒ‡ü5R¥åŒQ§◊‡¶¸;A0ªS=≤3π*ü: ƒåˇó¶gWWÎ ˝î•Ï>FqBÑ›VR.)m‰Y’<∫r¸ø≤∑æh\._àIÕ®≤¥¡ÿaA≥á0ﬁ¨4P%Õ™~1Wµ≠ÍâXç÷&Ÿ{∆Ç63˙û‘}©ÿnÄËﬂï¨®5qóX–û]Í[›p√t_–à™h*≤-Ã"fÔ°ãêCS=©&M…î@≥=0;P»≠º∑ |®mŒwæÔ4]r¯Âö#ÄJ5)nZs7˘3[3©öÔŒüÊ±uwÜ'˝9%∫qÑC%ºaVı¢å	„“M™¬§◊µÒ§Ò‚§ÜA.0íLsß—CÎÒEJe„WŸ‡=¢ùtîv§◊R;◊Æ˚±Á`[åRØ¯˛6=∞–.HGÉÙÛ≠ÎÑ“wC!ıOiıi⁄!‰ØËÓ¢äøÍRΩ%∂“Ç«òRP¨Kw›JÍ∆ Â#RŒ©,WW`~”ÛÆ©10”÷¬†qâQo.áÓ˝h`ÃﬂO#ê{n‰–Œ<`¢F…B»∏{	ˇ}‹Xá«~‡ªÃÅcMO.A»‹˜ûeVNo|4i¥◊ŸË‡Î4∆za0nDê∫Æ√æ¡¥ePT˝…åN&‡qŸ$t–∂©ﬂò`XøÖgwÈ$´˝t≥˝§vˇÕÚ†ù”∆8”D4-√ìLp:≠É·tX◊£+ˇ–`∫q©¡»ÌOAîm\"´ºƒ⁄+HÌ~?≈wKß’Y«ﬁå∑3˜,íPü–kæö#Á¶q›XΩÊÕùV-ù˚Âı’ªvk|Û^ûÕ)˚@w√t^Ø=öÄ∏æåßÍã–˝-ì PÙﬂ¶/x˝¡bbç6”?Wÿ®'˝πŒ˙baå∞1sFçœùŒ"•˘zÛCå‚√wr\ç≥q7ìuK~ÏP|åª–8”…$KÀ·Û—Ω›∫√s&S‘Ù 7ÄÏ˝÷'%I≤ <®Ï H§í
Ö8®À ÙaïQI∑◊Ë¿÷$´@@ùÂNàˇïn&oV[Ï"{Pâˇ#∞q-.'øl∑}æ· æ˜¶!Ò<†¢¸rk¢nÉ^–&Ωm¥≈ÀèãFªµ®L«"©^cae	Òa(,=f7l‹DLl1'#›„AUJÁ0#Â'ªù€6¿Ò4ÚYå'áñ¢h`gÆ6îq´SòÃX¡∆…tUŸ
iüÔ>|	àI,‘Ω“≤Dﬂ•¶©`Ù·ûE@0∑Ó:´˜lŸrÆÚIJ¶h4v¸Ω{◊nß.°Ê|jüÆ18n)ée‰O˚Ú©Waé`"x™WÀa7À°≥Ã	Eq…Çà∆˜9{>gFØµW©zˇ·Ÿ
*>≤®K!ÀD]/:¿CÉ~À¡º‡UMgüÁô≈<˘F˘™$l∫H¡…5.lÑ¶ò∞£∞sl‰…nƒ∏ˆã"tiùpxn≈û”⁄Nì«˝>#_ Ø”’;ñ§Îç%ã’bI_≤MUtY˘,fçº–≥Lr∞Öl¡,s*Hn>´ô$*bHj.—Õo‡ızÆè"Ec–xÏı,ôÜÉë˜:t˝)ènéÑOQn_˘âÉÄJêyf§$„/•FJ≤˚f¢‚sØn—ÏÆº”∞:,D·¿ŸÛ~C?`úã(ÇÃ"
tª—bˆáª*l∞ÄbÕ‹6V◊
(‰7áÅèÂcåG≈I˛Í∆Ω"\ À'kX(::—	I_xñ·DŸwŒ˜ûcd≤Ärnx‹ã–a:bLŸ>≈'Y„n·Ÿ¬=;z¿¸¬ˇù1Zt[Ò‰ﬂqöÔPdòèæ»m>ác4?ÛÇÍX`¡Õ
À¥ÜØB]àÊ*ÅôÄ&V¿±;øÇë°& ‹dËòFì `aµ§Z	 ¢a$y)·?±›5HÊ‹ÍÛ$'éî—+ôâ≤æréyï$`_}%A;¸xÆ˛MY·ß%Ù∑°ﬂÙ€Ç·[	+HDJπî

•œ›∫ª3«◊”ü±» ÖÍJAΩ‡≥™äÈ∑60®ÒÍ‹ˇÚÉeU8Ø‰öo±¶e≈iwÄß:ıœÆö]≈Ô˜1—«¶º¿œŸZñ∞›≤l:a≥5(º5^0#¨’Ï¨EÄS^∑q·~Ô/Øñ‡˝˛Äﬂ⁄ãK8V%k•}ª/Gâ¿ß,¨n%9ï•‹´…«:F∑ìb?ÕÿjÇô~≠ Tñ{™»≈mY†ìƒ!.w¶Ú,jïTπò
Û¿u:9Úó≈⁄å¯âπhkëê'ë‹πL"˜ÚJKVÖm óhqSÇÀµ©$fÅMBÇóπ√/ÔT|“}úÙ>ÔiàØ¬ä≤vˇ°x›-$41ﬁFvoõd˜÷öQvgBw— 5¢â∞îUãd˘‰PΩœäÌä¢v‘K§¯ïñïo)¡ÁIÔ©~r‰ˆºÈ(ëÿI€´ß¿~$M—ƒüe	6S»Ú(bÓ1Ç°>bFÌ%[©ÆÍCyu),Ì1ÃÖ”'‚S∑T	Î#†≈™ "YÃÙö,÷Ã èKÔÉóa0
àz	ﬂ+?>&˘´Åqõ5Bƒ]¯Â∫±
cïI‚Rï)Ωy“j…w&1eIosJÖ∑wöÜ?·Z
Ÿâﬂ∂[Ω´Yk:Í±Ô·‰*Wä‚3Ò&¿¸-ú–¸áå_"ÃKü˙√?ˇ”ú‘i%¥*AÓ≥¢ú!Á◊›ÚØÿ	-nÖ#4\Ã¨ßŸ-–æ√Î˚ãÏWÀYLªª÷î(‰h
d_£ÓF~‰õ Ô∆Ì%™ÉÔ´-¶û•Ìé¸dØ%2ä é\º≠™Ëp‰«Vü#?π],ÆZ@äî•ka/9%¢èé%Õõ˚ÒççK@ ∑†∏~	aT∏h¬©ÔAN∏æ*sLÇº–MÁâÅd6◊¥+†>±rê¶}_a””›ÇEÆƒ?óÇ/ ≠ƒ;¡ï'7ƒÀ:£*Â•◊lôg ‡›/⁄N€È¥ﬁKÌ•◊dÈ˘ ⁄·∑m≠bæ∫à.°ìñ\à∂ıÌNyÃ™≥R¯@⁄Öâ⁄Àˆ§üq˚‚cq∂Àh|ùw„}ı
ﬂ‡è€F*≈%I‰ä"3rG›OißmñØ(Ùeeπé¿?ÉLf!à=^nzÖwˇ\ÜhØﬁgm/,4¬	,b´è¬>ÉÔùê=¸;2nD8ƒ¡Îí;èk√~ß¬_ıì ™U€gºˇõ¿{azXÄ˙iê´
ÿøç˜öÄ˚«Œÿ‚%»±É∆óÛƒyU”q˜aÑ&±™äÙ0…úCöqÌ–B˝ÒØ∫◊h∑'˜∂h1¨'«¥Åyø˝4˜€È–îã
ˆ[¨∂¬vC|	=]Ï"ÙÑë•™Ìµ¸˘ÊsÜÓÂ…òÑì,EkvÙú!Êëˆ'àqd≠†2ê¡Bëƒ©Óí°S€S‘vÓà…bø∑uócQxø$√8@m\>òeù“ò≠Ç˛¿W;8§TÕƒ-®r!ë—À÷˝ì_
…_π∫Ä≠6û14ä‡=∂Óƒ/Êíf<îˇ¸¥VC¸*Á;7$áÕÿÈsáÌ4W≤v‡hDiø{7:ÖˆÏ¡tR7C†Ö0&µ„)t—P=Ë÷{¯ﬂ≈K/t—ã¬≈ò
ËV
»Ä>$Œxºﬂ[J‹Ω0DÖ3!ExÄ 4lFmÌŸç”u]øãﬁ¶Œd·Â®¡_Q/|Ö~¶4Kõ©e?˛h˙¡5åˆ◊l•≈~≈:´cΩˇh£•zsÏü	c˚≈f4zìzÌ¨∂¯ÆıÛ◊P≥Á9Q¶˝{¬»˚yI3i˛zΩ≥¿â&ıÖt…o#Å˚fLªnƒSÆ¬ÀÊ¬[à¶‰ß'v.JÙcPöÏ7õ◊WÌeÓu¥Î¬∆»Æ√ª‚˛?‘ìÌÉ9Å/>YT‘≥¯Ñ‰/ò√ŒZ‚.†á¢8¿’ç‹Ôú°◊3ÿœŸƒnS
KDT,„µìHaHq2“é•»ÜôÆ≥0”ÔZ^∂‰Ω)G3l¸‡˜Æ‚ôRÑöÍå"x™˛å…≠òGëNf¶‚ #uÍä¢ïK∑Y„…~Y.ÉßiÙﬁÍÈZã3FΩÕ1]9Êô∆%ö0Gçåùÿ˜ü˝ıÿ7îH√®ˆâçè/ëa–x[ògçö◊3º@Yg¸˛d˙˜»‘{Ωè(˝Ûπ$˛8ØªGº_gA=Ø–œül-Ùúc.?¯Õ∂Ôç^Ù´’ô°LÕsT[◊≥ú Sæo¥[Lq%ëÕŒ€∫∆>∆“≈ªNs-tGÔ∫ZEÃÎ¨ëÕ`Å…Dπ≈ı7Ë∂∆Y¯µı,•≈ãÙ’D'<û¬¶Œü]ÉSé6˝æ¢:ëy}™d]x&Œ•Ìèµ"íºà)d5O£X%Ãb«£∏ùòúní+o\:‘õK◊·7’€úx¯3YFN#Ù>äH˝@1ò{3ˆ`EõÏƒıÅj0áESá°s®d?tÿïÁ∞„˝`ŒÖ„›‹ ±óú≈òó=•©€ö92Lé9§π¥Ü∂1b öıß-Ncº\IØn{bÓ∂T|˝"µÉRte’≥E¡q…#Qöfpt√©èËÜÁ˚•æﬂx£>ã¬.»˘É…dm./;cØ˘áNo Ê #åñØ⁄À<Ep„!Ï¢ûª¸ú∂D{≠uˇ}ÖÃ‰÷ówp∫¡∑7'˚;¡hÑ⁄ü‘˚ò|*ªqÏ‹ß'üÙë„DÁ›ÅsÂûèΩ≤°\Ì=›XﬂËuóO´ó0vß∑Ò§±ﬁªÏÆtWw˝ÈzWj@¸`Ñ·§	Ìx˚zÛvºwzz¥ç<Ó	˜˛˝{«GÍ⁄‚‚˝W$mµ.€O:ŒW}˛Á%=Óô3™x∏†€¨†±¸.~è◊>B∫](∫i+æ›5`\rÕ√PÕ"{Á‰cBëa45ìgwlˆ8D“VËì◊^x∂ÉH[ıà«ü+4|6ç5üÒ∏p'◊»°‡I⁄±∞ã…ÿÒpb¯Å‚≥)TR—h3&{⁄çYbÃÉ˛ïèGÿ{køÆ•…ËÅﬂûI^ãyÏ¢≈ØSy£∆q'{Nœ˘Ç$C.Ê`±˚Ï¡óÊ"`íÎïxK3(≈gcU9®°¨DVˇBÙäo~aß¬πòPî|ŒØß/Kû"‡‰—»π∫Ω≠ª+E⁄∫WÈjˇ‘ˆF ˜!_Ø¶”6æm¨4◊rÏ;Vû6î‰Ç(~ìs
¨¥J6ú6BˆŸ%HR'Vz™n…ï˘ò(%€dﬂú∏ó°vÆ”ÀœäUØŸVk€,~6õMR˘˛˝√AÄÔO]è’º∫¢‡9zk˘ãë,œA∫ CÇ~0ùú`≤˚hb∏lÃqÙ^U∑UéG#√’—⁄∞`°N/Dwiº&pX˝•Û=¨>ÔV÷p®xÏùÙd]w˜8?Ÿ{µzvÚV	7)πèmë|&»∏∫râÒ®KõâKï!EóSÄ∫"†Bã@ßÇä„œô —∑íæ§aèç0v‚œ%`Ù wP{XÑƒÄÏÿx<µcrÏM8û“9J‘…¿RÇs‡'ﬂ≥0•∫*‹LO`ûn9T‘…t4âejÄ%2xgÅ≈ÒN3–íÄ°¶≈Â±C≥–‚†¢
4%v™Zö€;P™õÈa¶‘ Ùˇ(ÉÅƒ8ôH¶P"Á˘1©0ÉZ®S”™§QOó»µ5¬brÏÂôs±…⁄®üÃ¥(KUZ5ÖJù©ŸµYõçÉ¨Œ‘Í˙¨≠¶ÒYM€à¨ 9'é¶vö>t?.òmGäªô◊åu”–%›6RËZTN„ÜNKòõP`h®nﬁij#-WπâLÄO¸§PUô∏ª¶CË≈Æ·ÙÅ“*$5ËØ	cx	Ã/nË¶\]¨G*5@~EEv®D¥
@ù]=†©¯ô¯öú‘S`öbûöˆ¶(Gz≥üâ~l§7T∆¥ÔyÑd¢◊‘ Ó
úfÙŸãdxJSí|7p"R""¶·’Ñ"—™UıØ9íD©V@’ˇf†TÑ'>-aÂ∞¥!@‚π
@QvR;XI^Çpi>“bàJZ3ºeµÈOÜP–+Jj9»$ëB—(„Bv0)Üe∏CJî[I	èl‹¨ÒwÛY ’WŸA-±âLälÔ∂Æ∂°ƒ0wèw‰Bñ?çªÆíY%™ªâ¿zæ„wë∂Ê\œ•ÑÖœ4Öü•πïºÊÚF«c œ“îëuñÉ“g⁄RC“õXå¥¿Ã‰öƒ‚&‚‡ıf…7ùWRΩ<5∫ΩIJ‰Aé£‡Î™˜⁄§&†o!P©™Ó/)0∂io≈ü≥@”ö
¿4x∂ëkæ·¡u`q-ı<§‘Mf¶?ïê§$:∑â°oB$-Å£ÖÔ6Õï8¿Üyí´k43‰€H:y±SQ*€Dê“é»î8¶8∑9**¬#·ñLá‹D=Â"%Úæﬁº…°E¥5ÃØ
¿;Kü|:]‡@yN‰‹6b@*ö©πèsî=¢&ú∂ó•∆F∞øw¯Á*Çã!:ºqÉàR€¥àjy#F\ùÚ2&H±ô˛√u∑;‹pîWf[∫.˜F{ˇºô¥ÉóOöÊV'ÏP—44 áFáÖS˙‚ƒëÏs™âÔJT˚ƒ`Jqc≤>pÔ¿¿yxØIMK>+_Gä…ä¡ïv$B©)©r)ñ}6≥≠fõÖ‚ƒoêá# ®ﬁØ»6ˆ h[n:ãñx[w¯3˚≠w±u◊ª»æß·l›—?ŸØZª≠;ÌE∂ÜíQ ØG§?≥•˘bn›Ò≥ﬂƒ‹∫S˛ÃññÒ.±Ü¶øL˝Ã‹€ò/sLÎ∞q´)¥¬Y…º ÷*6≤FÛ`^ ˛-[F†gjÈfÇr•péÚ 9d]∂ÁãLÂO#‘mµÇ˛&[«	lÎŒ¯Z≠ΩúwÀîŸﬁ◊ûø—ÆÕuÉ
˜¯çˆÁÌIœÁÌô¿¸º=È1mO¸i>|aóÖ¡|∑ËÆ;ºó√ êßÎ~ﬁßÙ|ﬁß	Ãœ˚îûJ«h˚”£Ìœ«(>oœÊÁÌIè˝ˆ9› :ü8É¿5lR@‘8?™ÕÕ_ñÑÛ˛”Ω©¨∂zO∂va7qS5FÿM™./äGì`ƒ0i
,Lèa2ë.¢‡Ê0Œ£SÑHk2?YPú˜f(Õ
ÑeÁì.»ÿPöHk®,_PÑf
ÒÔ‘¨<qòS˝:yhòÈ°]©«”≈sk#ˆ≤‡ÀEãZØ{ `{<Æíø≠Ü—Ë13aY<˜À0%ô€ÿ$‡øØWÃ‚V;‰”∑QRJ5lÖRù¥íó ≠Ü©‹‹0äsΩÁ•q£6„|jÿ†d®;CJ∑⁄Q˙™0≥ö2÷5i¨O™ßu´ÌΩÿµjÔ CÛ»x§©Ωw≈ºn5)Ø[-?Ø5ô ¡&)+⁄Z≈o5 ÎV+»ÎF-‡)\Ï≈U1À[mÜÒohZSÀM∆&º—∞¯ ã–TÀ÷ö∂áF‹“ËNÖÛ∂÷Z?tn„÷æR/⁄JöJ2ÀY0Â£Ä◊zv9$8"Y‘u#9ê+$Éç£gë·%Œ°0$
d‹<t∫û?	¢˚6E“oÅ¥ÏÜ∞Aó(∂æRSI§j1gJπÎyÔBjå€ª6Èo	HµÉ~oπI&¥y-ÒÎÆÛqÔR•‰¿`Ic85gÓÕ$∑1qq∂(Ø\ıÃköãoôN≤6oswçwøhu[ΩˆÍ˚|w^%»ùÏWi0@ß` Œp8v∆nhåÌÒ„8 /HúRëÁ™q çFÉù≥√Ω◊oÿãÌza3ñAcùœi{Ω˝§›{è9œ–w6ÕFµb*(<∫.ÙUÂR„õ∆j‚êúI=îÑ›ëÉıIkô:€òg∂‘_›IVã¸Ö{Dn|≤°:qÈú©ﬂåù^!…6‘„BÍ]°∆ô›P¬Ãä∑9é⁄ô`E‹u£8Ä¨à9õt>øt±ìÕˇ¯”ˇó?´ÂA}Ã˛d& y_4oR⁄*uÍbOîƒGPù´R"Lı¸\D-Y fŒÍßC%åΩÖc8‡˘?ñy‰ïÕ\Lùïiã…‰hÛÇÚù™”ñÒË—Á
Œ˜ûÛ¯E’¯áπvÒ8t/]¡ÙD≥ªK!m›!K™!„©aMDï†‰ßë|∫¶ÑfOé;÷h/wòîïÔÜ^‰l"¬EXrßâx•˛úEË∑
Ë˜√ˇ˙/ïA(î|AÙ)c˚T∂'	«ÑNdΩ"9q·ä&ıwﬁ•{¸u≤nqíXWúô©(jø4„O`∆·`¸eŸîÁ~ tÂÛBhc<÷∑ü√ÿ$˝{ƒ©'ö„≠—…˜≈»¯ﬁ˛0îRÇ0-$^€D‘µΩos‹≈{∫Á∆ÛUê∑≤ƒïW–˚6ΩÔ—
tcL;ã1Ç î†KyºI;‹¶Ä–úCf‚!èá•ûÍ3≈~I*œ&©˚àfgà	ì‘-
-Xî2ó'ﬂ›;˝ÚÂ€'{€÷<9	+ÌT∫¡‘±Ê\~-
O≥êu√œﬂù"òªø7î®¨ã|M™ùB2ãDåií#ÊΩæ{tH2v}Ë}t4néìHM‘eµo¨‘]Ãóhö$%÷—FÎHç¢√"Û}c‚©JX=Y#@)‰PëÄ≥˙	≤#ËÍâã©∆?i¬‚s¬‚ˆöû∞xeÕÿhñÑ≈◊∞BÊ4ƒr§“Qœúb∏ÖπâZZäaÙƒÙî‘áåîWiPÃ‡úÍÀƒu>D·Uû &€Qß<S1E˝∞'çï„öö‘H:îîÃ?ÔZÁùÒÕ˘*¸ˆ/úzkâ˛◊\Y|ø ≈L¯Ò≤õ"øn´âé‘$LïŒÔ‚MW+UIWL”ı◊ÀX\¿-Lß)ÿ->Òqt∏Ωst ∂wŒˆø€c€««˚;€g˚GØŸÔˆ_Ô˝.˜Ñ"$ó”Ë¬qâ$ƒ!ÓGáŒç8û[Ñ£6&;,≠E©:j„ã≤<1àea:q¨K_∞Ë#,æjU^ŒW(f+N‚vû∏∞ıÙÖHJ[Õ’LJ¬ˆ˙kcF¬ïÚåÑ˜ ËS-DíuÖÜ√Ôa)Õ'Â\±[«lÌ[ª⁄◊^/)’˙ßÄzM˙bd‡Ú%7@·ü,GÚ◊Y⁄
ig!’ªR^ïå8ëD=l7;r‘C8JVÄzü?iÈá…˙⁄‚˚æJ5çaÈƒ \•ÕÜ9N”|Ò3ˆâH(H ò€∆ª%À6i˜Ì3”»I√‚ºÖü,Èåàméô3øu1»[fg(Ù^8≈J | 	8> ıAª-0ƒÌ¥:Oﬂ?ˆj¿§ÌO%!-£ViOï‹~‹lË0›π∏Î(S_˘	ØÊı{§›`zÅ>∑eät$
5äÙ¶DÅRŒz jpªã≥–πºÙ∫åÁ$xAIæ"M~ÏJÄfõq”F˚$?ö¥ÀWÉÇªÛ˚an˘c«∂·£Lƒxâj¡8À‡Z&Ô >≥Ã/¯$—ıQMåL,Ò≥™D§íÿ∏%4ôàdª‹Ç¯Â◊K∑;p,Ñ(|*:Î^ûA1u∏Ïá˛'[öZ≥b£ì“èD1‹üömZÊ·∑wÕ&%œ["≥–˜Û≈ª$ıFäx¸’Lò«´V@Ω§≠π·ûò∆ü˙5~⁄»˜ÿ√A~,–Æ4⁄£%Í≠'®WÆÄ|R{ÛC?>_?9Ù˚·øîﬁ≥)≠Y#`—Öö¸»ùƒ.Œƒhñ17LyD™n;^§äíL2ŒœáîjÛ¨"%¿st[m-Û∞ΩXâ®n›>w#õl>ôNV¬BªúÂPêﬂÔû‚¿πÇ{æ\©t∑÷bf›bŒU_Qa:Ù∂ïΩMs¨âüb{9¡™·∂ˆçÒXgùù°aòΩñ±tilñód{<ÊIò˝âù¸òΩ…JÑ¸[ˆ/¥(%«Pu¥´GÎø`8D5ëı“$@ˇ≠ñ‰5¿0fäwIÈ’°ÂåêéñJX ∞Å;D”Ag"¥|‚&¨l≤Ó2áx±v5È¶ïêéèâ2Û.¢PM7f≠$ª∫8_A÷i|<Ô∞¥ì-¶›¯˚—‹ÓU‰pëî:#DÛi%1∫éâ°.¬ö%W£JÁÛÖoK	Æ˙\…∏µ∞± 4ÖÙ+
/Çõ≠Ök±∂±êc–i°≈Ú∞!0∂ °5v&÷Êfö8ÿ‡?6ÿAãˇXg´¸«*;Xáˇãı±‰Ê™?j3Û}FNÈ‹˜≥o˜ƒ5«Ó—Œo*ÿ¡vZ©¬i¶ÖI)c÷
-TsgB>Iπz‡tY£ñh÷—Á&ÛO){§f≤ª⁄“LvÛRœ®z€'ôt5⁄Ó'ÎŸ¬Î[∫π‰¨Æà˝.˛∏i¨Áìä$u˚EpsJ≠o≤ZãuV«7lég÷hw‡ß–3ÒˇÊì≈%Œh∆EˇQôŒ⁄&ã¥öÌµ≈Zû<o•ªX:â1,¥§21"∆Îˆ2”õŸí∫Œlãåèzﬁf§‹M£’‹ Ù(Ω«å8öãL&ÉPÉw÷dl¢_—Iä˜_∫5±0ŸÑñÚ°Ω˘3>§=K'BzË¥rL¿ÙãjªåLJC:Ôôú¥ài«W-ì!A´eû˜ÑÇlhÑô-ëµë.u§,∞jÙ:ÿuÅ4^áŒXŒ	1≥ºó,í≈Å4èL≥∆iÜùÅ#eÎ;-U}2öê›]"ˇ/<+µ†-·;ëÌzW$T!>◊ àdŒ"€OFÓ2°A6MÛÄrnËå˝8ã≥ªÿkì,®–SIuœΩ±H=Õ≥†≤“%7/¯µ8_tÏO|2ı}Ó‹Jˆ
ËÉÃ˝ƒÏ™z~°#≤9˚∫XJ0˙<ôZ22„ÄÔÁrx$–+ÿ£·3SÜ¯°ÙîÍîõ“ã⁄Ä°eò•2>E∫z¸7v*·ã˚"Ì≠eBs˘πg.ÏO–”ÙVÅwÓ˝,ù´TcÊ°ƒ˛…÷ò¿è≥bˆbëy>~‘Ùÿ¶/iœÛ‹÷?.[Tí4>~*à†1µ6ÊS e{ß>˝€gx‚áÂì*r´‹g!O∞}#p≥›†\”ï¥£-!m‚¶Lî&g~yóÓœY-Õ€Ürgjl‘:ﬂﬂúˇb£Ω—Ω‹xOÊSPî`ç‘¨‘Ó?‹ó≤dÈÃîk6Úi–}é–5£3¡Œ—Î≥ì£∂≥˜˙lÔÑ}∑wr∞˝ñoøﬁ;»Ut‹ôΩqÚUçﬂÿÁ~ºÙ0œjÍ˝ÓÈ∆˚å3Bô+¬˝≥ä'y´\}π*ÃˇØO:¬©€ÓuVm,’:iT¸ªˇÙ=È¶e#§$z˘4ÄÆ\:Une,ù–rÕ¶∆òUSÎ⁄ËøKÕŸ„˚›T«õUÌ °¸pIiõ—Ã=∂âG∞@3Œ˘≈N‹˙s«Û≥_ì‡M8DwëÙÇr;ôû$É,–“ﬂ<ç*ˇé©Z)JÔõh˙GÃSeJç8‡ˇ$ÈUa¨÷ß⁄"'˚ÓÛQcØû7—~g{Roô3„e⁄±∏@≥º ≥7‰¨fXÄõ(ì‹Tl°ªtp î3L[Ûó>àòõt∞jŸ∏!yÏ”‰ ó0=ΩÖÀªìŒ]¢+ApÓ»È¨›ªNÿ®Û<Uˆ∑$Ω¨Âƒ€^KÌ°À"ÓåX˘¶éÛ.∑q
Ôõhz3é5”1Ò M,
<Êû_∑UËO¯;;kiÚ4!Ô‹ÔÄ„›¶ËÀL8ZÖ— oåRˇfxN…“¿ 1XißÇ◊MÊ‡àä‰–Ã0iUØ2€Ÿ“íÚX‘ÿaß (Êké?!vc"ÜpfÉÄ2±ø˘î∏-;œ?k7;ød^ohm‡@≠˝å0\±®ãQ¸]ªÛÀ˜üq¸G≈Ò7QÄ^ˇpH?¸%Ùäuı)—\\ÑñØv_∞e∂÷ÜˇV]∫¯KÒ|„ì¢πEër+'am∂ÃNo1MF£*#’Ω√®¥è–èó,œFì¬∏S	¥*∂¬&ØsdùØ≠Tµ) Pãl∞é2˙aÁ!.π~3{ˆ8∆lÜ√ñàá6,0%;s(Î%ãÚ•€õÁTıñ&
(¢3Œ◊aôJ>yK0‘˜π˛8ƒç›zà,*û=Báëãør!áì+?'4ÜI=öN
êòÜeDb˙≤“2Ê˘$x7∑—ñæò\¶ç,äì}oÚ»èıπ€o^Ô|{ºΩÀ^æ98húÓúÏÌΩ∆¥Q€eÍ\≈ºß@ï[®ØïCi.?—£<
ï(Hù≠˜6ÿ°]%√p+dŸ€Ó$öSTòÓ+19BúõS◊	ªˆ¢ƒa5á’97≤©a<ò‰‚À®«]HMœ¯w@ﬁ]®ÅÆ[Õ6¶BÀ	ììtBt÷t/EÒ›VÒ&Ôß‘8o∑ÙBç∂oøırKeœ√v-∑n∫ã›TN)Æú·4Õ¿e„Ã∫3¿ ≈â—mLƒ9Ä∫€¨Ëªì&∑–CéáN◊¿fw√≠Ö”®8‡õì+‰Æcu`≥Ÿ,R9∆CƒÃqÿX≈õºôy…π-êÔ˛“ŒâÔ+ÍmÇ™ÂDí'’–Û]â6ËN£MUWæ Ì7≈'sò3<;ƒEÖÁ˚e·oJPG^`K{ÛGÎ>‘l-∫M€I‹¯XÔßLê»yùñ?¸Û?ÕÈ¨)∑ä.$î¸ §•ò˙UÌRATHÊ⁄øzÌd¸52N„;VÌÊKåV0¥g˙'9Ñ§Æ≥a_˙sCDÚRY#y úÀ¬jï´=Ù¯à¨O™√Òk|J∫pÌÜ;N‰÷SÎ2io™El€"kª—Ûz6ñvÚ£[›çÚÛbT[ΩÏ`çπ«sÉhyZø8]¬ÊLvV“ì∂≠¶HöŒÌ?«ñ”X∆I´ÊslSÀz˚º$ﬁˇ£[Ê‡IÚS……4B∑G k3J˘©jÙ?dÖ9≤é∆'?è≤õåüXy3öÕàNÄ0XˇÒ˘Q”Û{v8V&~à∞@&·4ÛÕjñY}Á#QSÄelò_ô‘
M5U[3«?t¢1 O—¶Nò'ŒTuÆ¯Û·À;ÄÿØÒ$aøb≠f´s}®:±’Ã‹—∏≤CˇD¯!y*µsM*’”Êﬁ*÷‚Jy¨Eì¶Y`¯P"0Ê<>zÌ'Ö…™uF•-{MºR≠\MSË¿æ¸¥•Ë¿‚–çë?Ì[+GıòéhåYÂ¶H~ÓFU≠*ì©®xcƒÎT±≤ƒ«íÚÂô¶€h¥
%ÃV"‚DÕ=í¯]Òπe:ÉÏ£Ÿ°K˛:9M™w`*°Œl5àˇ∆¥Yâ_“kƒ_£Á©Ûê†Á»bt·±ú,\£¨r ËØ5ƒ“Jïd˛z˛ÙÊ'úÛØjé":J™%*j_∂.⁄é]¢"˚ë—BUN9tËx~íl/m‡ÔºJ#,õU?®åñ‰?›N.èı	CÕ√zŒ¯∞Wg–TcJ∆WØè˜XØvØ`∫en<v|wòú<Îæ!÷≤›~è'òÍ&¯LHq"$ÖåX…>>€A±’Óe5{à7±jFGcâ¢æ˚Ö˚tmµ”RRb<]{d¬áÚ”v—3*F%ß®ÕÒm%9Xò{Ö„ÇèYm„VWã¯c√¬ÃµÅ>óß√ëÃÄæñg∆)ﬁüfYù^”{#¯G‰gù€‰Ê9(ÃKês›¨ÃûÎÜ`fŸ¨⁄Á2ïß,!ÄèI[B ë∫ÑÍ?≤˘G§0°˙è∏¡.Nø$˜ÍwA¯ë,«ŸvË:ï21Y&8)π*ﬁøLHGæP‹0Äâtx	ö†L&òû§‚f ∞\§\–µ7$©MJ‹⁄s2óîπ°X1re∑.6òOGr<∆«°	zß¯Äà9)h:Ñ·L∑9]8yvGcFîô,≤ßC#ÉUçÉÃ”∂°
⁄u"∑L'úª¸[ã&Æ4S[º∫oáëc'æ∏≥
ˇªxü'@Áx€UﬂÓÚÉà˜ÊbÍO¶Ï≠N„HÁ÷~®Y≥U`ﬁv;´˘Ãâ_'£Årﬁ~∂Ù•∂Î`àlÿ¥µƒŒÉÀX…£YRbóÈPg–æ…Å63
≈XHb÷*k9g–pöŸÒX(ÉﬂC'éY´k7©Üôò-L'u∏™’∫•S@“3ÿd¥ª™ƒáOõ{lVÇZ5îr¸¸(Òº„G1;B{ï˝¸±Ω%G=∏w¨ä◊dgÎ ﬂ’/ìfÒ?’∑Œ˘'VøS≠Y1Œ	Êi˚iA§m+L(å∂=;.Tã∑?’q·áˇÚ/?elòw ä¯±ƒ≤«ßØêçñø¬
ªÚsXÃåZU≤XƒœxeaÎ'?’Ò™∫[î5ãº=/ã`»B>À
Ó≥ÚÃÂ°ùÈ@ª…˚\%E_ù{ﬁO£©z¡s’béﬂAçú∂Ü2'…ûhRRã¶cı›Ûû{•}Å¬]ÙÊ9èÇÆávR Á.ô:Éæ0∏›Zπ†lF≈çáΩıâ¨:Eã˚Y¯ÃiŒŸÏı<∑è5ÿu#1:π Ú“uf±<t2m¨‹Õq!RVõ'wƒ‡≤œ∂ªnlﬂ'ìoñù∫ëçd]âÛ3àúÌ±S¡¬≥Ω:6z¯Ï™Äπ—‰·èÃ„]ac'tòCa¡Ù1›NLŸw^8ô:Cv¯ÿ¥
°t∑ö4ÉöõÅª·»É.~›È‚§ÕÄ¢{aÑ/4Åéœ0œß”hÏ˙_√¡}é'‡l÷1ôΩ≤∫Òàùb\j–&Î˚ºí<Y(4 wî Æí 'ãdW=£ï
çˇƒΩ›h∞s≠®c#∞±Á„ÓXefz•3ìôP“∏Q2ÜA'”∂lﬂ˜Äd¬ìÏ?‡∞ NÕb-ì4>õ≠“¨VXèL!`ÑπÔÇ™ª~∆›W-Æ5ıs;ä>˘Ÿìú3'@„Co2√ASïj€Êû≥k|≈˛î]Ω$CnzÒÇß√ ãV?s¢è¿Í-Ô¬:€€_pü≈$k›ß…+çˆ∫0œXÉˇ9R‹∑∆$CÆ≠å2÷)‹ö_uçı°‡%GÚï<t˝)[Vc*'=ü»÷ŒhµÒ≈PUÇãôvbmyGK•n2Ú»hXÖ‚UªŒId◊wø∏º\wVûºóåq„ ê1x4ÈÀ‹â≈)[¨∏¿≈A.q>å(T»¨vzﬂh^4í´µ’e:ıá≤•˛Œ©ZàÖ‰;ÃÂ¬XJ<s.0ÓP∂èãZ=ŸÅ¡ÅpÅ≥DÔ÷[øîí˛
Ó»dﬂ2å∞jySr¿R”AÙ~Âl¶0#‹˜/Éå·» ÉC¿…ämòE¨Ú¥≤â˚S)\9é Ã/Ú-#Ì∫W…{¶™◊˜ñ©‚,cTÅ—‰∆–'◊lÅó%S92o÷WÒ¿(’}1,ÓéÂ'Y‚ èr+NØ\eŸ3ÿÚY~6Y-„µ¢∂$«Œµ_î¿Z8…Ω„ªß¬EX[≤IMy9Óí%ÇW%(ä¨ƒO…qT®U*›¡âãnr’¡$
"rØB‡eöÉLÂ4Ä∂`Ø
¯ö~îÎ‡Xç,ﬁªj÷˝ìü⁄3HV¥¸ÀZ˙a5?±¶1˛w%‘µœèe´Ì-°◊∆Ä≈%ZåÂdä'¯oß@OYúhLxl„4óC=k≤¨∫JXû‡ﬂÏS±Ì≠∏°ybZô)òÎv`òˇhdFkkcË£JÜ÷jS¸û|ªÀ«Y`„#∏Í3TI˙¿‰ùÇl˝ß‡—Ÿñ‘∏EÑ>Ï‘Ò¬¡∑l◊ñõHf_£èCé´óÜAÔÊË‹¶ü1ÿOF0+âıì;†¢ @"Ç Ñ*ˇßJ¯ü	 „$Dk—l¢pÿ»™"fºFâ¡¥≠H´≈XΩ—‘`≈(õÅ«√qõ—$£Ó–È” Ì⁄Y«>2R2diT	áåë5[j‰TqMµçëiY»#ª -kI¿£éùz⁄6Ë>U·ÉCâ1x¨J+Qäé›ËS/RE,π#äÄQ#ÕÅUƒ"|D ¶°@{€XL¯ò‚1(p™ád¬«Hi)µ)·Òä≤ù„MπññD¶0¿“j)?êR îÚ◊»4:Ú©R(ìœ>Æ>X™≠õù+>ïmK‰R]jÎhK¯‰G\≤›ŒÔÿLD¿yÀuˇ eö?œnÂV]J¥_a‡£‡œˇÍq˘sÃ,ênÔ÷÷ÆÔ·ôDrõà≥ÊIJ–";y˝ø0«IäUQtx€˘¥4u+%`–À–ä®PuImFºÑ^U‰YÒLïèË~±9t˝˛d@j¬ñımæ—Oæ∏Kh-Í^´‹›≈¨ ﬂÑ´j⁄Ø‰Ó/¶c˘|≠‹{Li k®ÅŸœ“{Á◊Æ?òé‰ÅÆOyŸÅ¨W≤≥0¥“-ﬁ€/<˚ŒΩK§.Ê0°É~Ë\zÎîqÎÃÅ¡	√ë}õñ˜xˆwπ?âxkÒ37™?Û•.
‘GSô¯˘+Põ¯˘ÑT'~Ä˙–˝Jıµ„W®~›	F„$∂\µ…çÔKéË∆Ä®W?È›HıY3Ö√g÷Pc¯<"‹>s	9Üœ¬é	0y¬˙„ÄfX⁄Ÿ¿Õª®`ÚÅj∫2™n„<£ıR6‹:7ëê/S¿~Âﬁ<Á¢IV´Î≤	j°∂r.|£(Í¯v—”Ã¡ªf0(ŒLgB≤‰[ì/a◊ä§≠∂1´>‹«Üx≠G‚›%‰œZ™Ã[n6’¯.à]É1ê82∑@ï89˝ô¡ŸÅ˙=õ9 U-t3\a‰,/È! Ãà¸êπY√”5tèêö=ÔfKF√ú—ÿr6èòjÑ‡ˇ^:„œ◊‚mN“˙À @ZÖb4¯›§EÒM⁄WlHó0ï˘\£416PqæŒ ≥"I¯πﬁ ^¡Õê≥/7izH$¶\ÕOñÍ¶ -\8K÷bˆÈIôzîpb^ÈGi‹?µ§¯T7û=)µ7◊mOEM
ºä®¢ » ˇÜâë¢í≥‘.’gAKô<„x;Rîx‘yt‚QÍ…‹lâ©ÿ\‚ë%–©Ø&ÂgŒ™
ÊÒRPQ≈H-èLŒÔ:üJZ¬Lí¨ÂgËãS<˝√ü˛[IµT%&e.&	∞!Á#Oõìf}bd¸Îõ‡S;3πØllHí⁄ˆŸ—ÌëQ›*•J¸÷åÃHœyú’¸Ùi´ïÔT£˝såoö€ÙND§Õà›Ü	˚Ê‘Îπ»˜£%ˆE´∫èÜ≠;ÒÀ=È·O^∑%:‚o›…©¸OhŒÀe:†¸áXFÎÓFz…„˙lÑÜˇ8±°3dN ”Âuy|Sgâπ#Êv√á?EhmpÂzŸ˚Eπ£f≠Aæmå|ó”€,t∆|(Yu‘©&D¿5}ﬂXU∂¥∏2o‚Ïç∂4õπ¶?⁄ƒÍ◊ÚÇœ¶© ZiTﬂ“Ã7JêZ“Jnø~Ωw¬v˜ÿŒ—·õ◊˚;€ªGÏ’¡—ãÌV?uúSˆ‚‰h{wg˚ÙÃÏu◊ªxﬁÙ˙°˚{Áy3rúË‹Ò}ÚπlòúãwË#–Û"ÙÒu{€RÎÑpw»]ˇ¢±nrvMù[%bÕÌºàë+TœiÊ_˘êÖD∆∆Ô$F≤‚ﬁÖò√ƒ†’˜˚˜¸À†&Ë)° ZKÚ£7ùñê†È/§Zb¿¢|ky≠(ä]?Æù–Œ'ÓJÚGÍïtFDÒI{ìD	öGw\t(ç;#*•æ–õ§+<ŒG⁄ì$≥eaGjJP	x¸≤≥÷ ™MH—p†cÖ—ÎrT|√ÕF@µJÉ•›UD≤˛√ˇ˚?˛üˇ≥4mNuî˘·ˇ˙œÛú.˛ˇ˜ˇNFı?¸Û¨Ÿùó∏ôôMU(¨F!D^.ƒ—Rl£b¬∞ŸCÜe]§ IíªÔt<v√ÆπjP∑hB4–ˇ1Üœ“πaF*’^ìi“Ü}*¶GP£§M˛Á∆⁄úÕ“ú§E˙´BÉ2miÎd·îõ–ÿ¶g)&hÕN*ÈÄ«ˇÔùÓΩ˛ÓË‡ªΩ›£ìÇù?÷âkãØH¨˜j "ı•MP|·ŸˆïáqSF˛∆Å˝dÂØ`!¥gRl|)Ç, ≤é‹§¶tÃÖpÙnÀ‘˝:∞29ÀF“Á∆º§≠MxÃ’Óö∏6õ‡˘&Y	ç3—¸ñk‚oôXû…5/7ı_”qF–˘À'∆tŒ≈Û¡=<é∫”!∞à¨å¶>H*Ωèº˙áT$/–fœö◊ƒ»πÔ8Ó√üù· `/arß∏Mp(≥ë£ ÷sŸÎ`‚]¬»∏÷äπÂ‡·OöyììˆÅê’åâ0¥#.ö b‹“¢∞˚n=v∂(º‚74ƒ∂À\s^÷ªü¢ê_î
ëJÉ≥gîê≈=æ °•T=1[rùµaN‡3©˝;<)Ø∂!§]"í˜Æ∑Zf))'Hänznè ±∑∂/B/$${¥ﬂa™µÈtπí´»}—>ºo3	±B≤yD÷OÃ9¨¡ﬂLﬂ†Í°#VKº¬Â¢RÚKKsÔ/Eôv\Q}ΩgiV#≈àz{˘eÇ'e\p~†ôpƒ∏cÂ/©‹π{¥È˘h…∞Ï·?Ìæ98⁄åŸëªæ;yπ°àLâ⁄´ŸRU}2!	◊°36πF&ﬁSÆ_t›≠•Ä(:?î\Emf≤7˛÷éøù^Xîåœ§;|fräÁ∫(_g¬üI\≈y≠*B•O"—éj’éä@ú#ì√!∆åı¨¡KÉ Æ˝UÇ Ê±lïÉ“ŒÜqán‰¬b∞Q–C´	«+≤¯f‡kB'
	+ŸÔ“Aa1œáﬂbäU°˙ﬁd≠%?€ù≤À5ÅKJ›6’mïUuoºâ°ÕFy£)ìÇıcù. hÆ,QçMÈ·ü£)∫Œ[ã+¬NÆΩ¡3`ƒæ!<ù€¨B≈¯x3G£¸Ñ—'◊Ã—'3W)£^A< 4ÆÓ'HY) •§∆ù1en»IiÍ÷Â©[x∂„Ñ°€WBPˆ–U4Ú¸á¡·9C0 * úUâîR∏©¸‡¬≥£	≈E«ﬁ{Ëé /AËÙ(¿◊∞íYÇùqé•⁄kÒ/m„]Z«∑¸f9•…ygÜFÎÕÁ«œáèò+„P!ñ•≠va®µ¯ıﬂ›˝w∑ºÃﬁLº!=Õ◊pı^ßœT+ÆÅ√d]ß;I9·œ+éËÎ XEºeÌK∑¿è˛éª˛P›ºÍˆxºÉïŸìçk&·≠df}h7Ÿ5…KüNÇ–ÈOrºèWÛ=6pù+oxÀ.n„N°ÖÔÒÔ∂Sk$t´Òû÷`≤k
ò∑®ôÛM`
"I3p˝z›áÂârL0=i}ËNBÁ`Qÿ|	Ë=j∏◊`¡£.—˝bDÖÓ†.ÊÁ^™ëñîÁ™”do|>Òòäëﬂ1´Î·^‹é˜†œó(>2¯›ùh”%j˝é*—¨˘0œ}[•1˘–T*5A=ëë ôU5 fW.å≥¨U6œ∂\®9M¶ƒd5UeŒÂπ^âÒ2râóàôQµ`ì6É‹#†'ÿ4√∏wRc∏wÇ°€Ò™æÄa(ÿ—)√@kõ|OPx
X89{0k∞GƒäÛu`Co4"“ÅFSNEà√Ô√‚¢ÑòRƒy{8“zA‘\àMãí^Ö°û{ÖR¢[Òﬁ§3asxM®(	í“h4ÿŸﬁ¡6ôVlüúÏΩ⁄>‹{}vƒÍß«€ßﬂ≤”ùìΩΩ◊ãÏ¯·?ù6é^Ìø∆:ÇÄúéÅh∏déÑ„éqÔ‹TK–•ÃaFÈ⁄/÷W÷◊/€µ%nDÙ¢è/{Ó•3b)/⁄uØ‡ÄDÍC6)¯
eıﬁZ$Üè[∞(∞UÄ÷›.ëUê8`∑ÿ¬‡Mä∆º´Ô∆a–á£,ZB≠Ë±¯„=á∫‰À≠∑ƒ‰à
Ä°c^˙SäæKÊ˝éy=‡ﬂa¨.éNâM∂¿£ä7‚?¸w@.Rg#X\ê)¥TÜì≈NÃòÍF]xb¿íﬁBÔ"Öø¯nwB¿ éﬂ%Œ¨áò¬^z02XzwñV¶û‘JÜ˝ã∞≤ªƒDoˆóﬂ¸√,≠x0¡ﬁdä‰ méªÑw©ΩÆ”s"Ù Ô9Lˆ˛¸ß`ñ÷ê•5∑<%ã(%ÏVº}àËÓ·Ë7≥4’ùÒ¿ÎJmùz~7|Å
ƒ›ãké~¯GÏEd—µÛ~Q‰W4‹ªº®Îv∞H°Ωh¬…ßW∏p+t®¯‘ÁÒÌ^¡dœÔ„±≥ªÈ÷Ô2ìm-Päc)U{ìï!7´ñbâùl.Ò£ñ¡›èãNˆaΩΩ¶ùÒ∂Kíà·ø‰.]áMÈın®óoπ·é¡DF“DÚf¯‘H˜ÀvPi¡0ËÙa‰E.É@@1n,›õ`Ïª`:âﬂ.±çñfi≤c7˜Ø’ã0>·'¢òz1Mﬁ¢€N8?áÚ[R“°Hz	“´}m¥n‹ﬁÓãäóº≤ !¯≤Ì>∂% ∂ASõ≤”∏b3¬ôVo-1X:¥|Ÿd|XeÿGµ«ØeÜ1‡ãõyù¨6ú•xò÷e¯>˙pÙ÷l+≠•ﬁÓ≈&e+èå∂…æºìgË˛É
0¡&ÛÈl2ï:øà©ÛÆJùY˝ÃEùﬂâÎÛ˜≈ „ˆE˚”Ôãµ˜í™ﬁ»O¿ Ó G†·Mñg√G».¡ƒΩÑJFãGıeÔ"ô›%f%åQ¬è˜{n<ΩR*ÚZœô8¯oÏÜhÚK·-Mxl˘-äéŸÙÉk€ ßXÏ›†’yÁr!¢ÈwoêÄöº°l%mñ>¿¬\π»Z‚B≈gÚo>eƒ]¸~}»Çöˆ§˚åo+•wFîíY÷M‰◊LbÇ ø‚¶`∏D®ÙÈyNﬂf?Q3¢ÿD§ìEúv™¸m¡ÙÏ∑á¡	S»N'?ïiÀ°0+(gÿpfπDeÌqD•ÛS?láÅ”s{;¡îŒ∑ï’ØqÚ"§»x˚˚f6‡-0ÑèûÇOpF¡˛M;Ç°Á?¸´±¡mƒg‡Ë$±±⁄¡¥∫…¨8Ï\¨yÚ8¨Y˘ÈE"¸@˝†å,h>O|Ü’∑dBáübœF,¬Ô€N<KiNŸ+‘ﬁ/<~˙>∆ á§∞Ä¥ÚÂ]<)◊È,ﬁ£àR›÷Rt„Sê/h±˙Œ¿>2NˆIõòœ=m=
W∫xà,Vg`à&≠EH~.™N¯ê.]T≠’ñù±∑<Ä©üÚπ ﬁØÉŒ•ï≠ÜCÜ∆ö¡«<≠†2‘{7c\^“$#N|yß4	¸Ã¢Å°·pΩ˛˙È,uÕà¯‹3Ôm∆∂õﬁGΩë7ÅÕ∆Í"≤¸ów8Kº'˜üpà±•z•!VÁ„îÅ/ú∫#ƒ∏10o©ƒˆgı√ ˛‹ûN˛+––`Ò—L◊\ñ5èÂZﬂdzVﬂ]xdóÑ¬ásbh<Zè£cküàé˝ˇ   ˇˇÏΩ›n#Iñ&x_O·¡ŒNRùCR¸T¶"#îDE∞R’"#™f4√I∫$œp“ôÓ§""£¥ÿ∆\4∞¿`0”}5{Qù”X‘VµX†Êb17¨ﬁd_`Íˆ¸òôõôõ;I)≤*ª∑Yï!“›˛éùsÏúÔ|.Ï6˘Ù'[Â0FmÜòûòŒwüO∫J¡Q¶?º€–·Ï:∆Óû1x˘›ì©œm
ûm≈Îú6oµ'»∂h…+¯‡$7ñúÙNv®˚Lb∂ëÓJdUTª~o"ÆÍﬁ©~†sOJìâc¢nÿ∞mß˝ô£ù⁄«\cçf∏€eûŒµø±$⁄æ¯I9è‡˛ô√…6Û»ƒ¢¯b;õ∏lKäLœãÒ¯ä˙KymMN‰Ù-í÷lõôøH`∏ç˛Fkc˙æü\¸⁄÷£Gu˘ﬂF„·£µ33_ˆΩÚÏ¸„ˇ]fQë#zàhDßÍ•√ö¯Dã«”®°-ØQ€¸@Vk[ç£Ì’:¨‰rp
Ñ\Ô¬—ÏíD5y•t˝óoÍZ°{ ¬´
„òñ⁄t≠foJØ‹∆3ô#^6Ò*ê<õ…ún4∂„3›§:CÔx@∂6+œ`v∫ﬁ÷cØáª∞hö]ﬁ˛w√B¯$õó∞öËKŒA`π-lvTM˙@¡ Ï¢ÁŒ∂gP-yìâ.y±qæ˘Û-ü√\iqæ`,Ä+8ÍºÓl{˚sd0»¯fD◊*|…JÇ?i√&±G◊™¥!°òÃˆå)¬n≠æ
œ≈¬#†ÓdÑTJZs8 ıi”∂´;›ƒ•¯=BÇπ‚
£h†˚Ÿd√Í<Ö$Wóg ]Dk¯nÓè“¥;üÃ‡O≠k$äEX∆‘€‹t#,{V>Éb;øèßõpÃ÷ΩuÔ!»ÅuÔÒÛ=!ù≤≈^>T;¿æ¿âΩ>úÇuê∆}3±I"6ÈC-àßa≥∏¿-¶x±ãõ¸∫7àﬂw©l†ﬁÜáßH0‚˝ıó@πJ§É0≥àPÜﬁ_yçÕG◊Èõ∫∞∞<ÒG!Òq[”˜˘ΩaM1-\sxQ°‚
ÈπCU©∞]å›¡ ¿›ã◊g—Å}πÈ4-ì.èã¬%G5:\)À–(ÎÛ)AT≤Y”ìÌ9ÄÉË›É»Á˚a°qº:èêGi˘,d—»EÏïˇÁˇ(8π.7ãF"od∑•çD8⁄¬˝ d[¥Umà≠e«cÛn£—*?®ıÖ–c¡◊69◊∫a∑J≠ÂFØÏI¥^¯áu’›∏6ÚqbƒªáyáÆ≠ã˘ ˚∏^%w[äõç≠ªæX∑¨:∂≤0]é•*ãÿ(-±jê,L]ü-Uè≥·hü‚«F”_√#\Wõ¯ü˜*öQ]ﬁ1óì˘ÿª⁄|Tﬁµú≈1ÉåIﬂ@>‹ÀåÊy@‹¿÷w\ w§Un7Ig é\8·ò≈ªlpÀl˚ßq‚.J¥Hü\°n µ_8ø«ÕﬁI{˜Ô∏’Ìvöï2w¿’‹zÛQ3à+ı.÷|s ≈©bØõá@¬—£Â´G+∏‡î≥#—}t&Ê-L&ö∫Y_ò2cÉécñ!∂Ω” ∆_zè6˛≤R˜*@A˘˚Ÿeeå”È¬ƒ¯© {µ	‚≤G¬˘W_°N	8À≠á0(»≠U◊™
zPX–£’
*o—¬rŒJS¨‰Gµ¸‚1}Æ£2òÕf„K›ÑØËS^BùÏß∂ΩJä¿‰o—O>\¶x±Ã*\˘#H‰”¿ü°=ﬂ9nÓu≠•cZŸ?©,UM∂∆ÀKWno¸”ûtÊ≥äW>˜Àª≈eQ Œ¥/µhz ¢Ü~}Ø3üƒcx U W°ßy2ç»
œ?Hi&A!ç⁄F
–GÁØ≥b∂ÎÒÜ	õ`G5É*»~Y@„çCbzºGRè˜%nÀç∆Éµ≥JÒVYÄŸS£¯y„¯
ûÉL vhÌÕû
√$NST.∞wj8)ª™ñ>r£ùzÖı6ä˛VŒñ¡S5)GŸ“‹¬Ìñ[úuëGp(õÀ‘Y,≥!√A`ƒPå¯Á^ñöÍà•
¯IÙw.,œ“∂-p7+ü:õQ6ï72òòBo(mÇr[ƒn-ƒ¸XÑ≠¢ÎÜ}¿–®6w®¡YòNûKÉB8G«=≥ôk)<„X1Í,£p∫é‚±“ßY„W3xâ•¡Æƒé£ˆ-u÷Ø¬§…∂y5G~à≥På≈Ê„G¿Y|âñ'è∂ê≥x∏,ábî∑Y\‡óKÛ<À∑pÈ‚ Y ˘Y$z¬Ê<sWéU[zÜ‚2FZïæ˝¿Öbyñ.π¿ôPXwT[p∞})∑ç:˝ØÒŒµÖm_ó.ìïñ¡ó”ˆ“"g‹⁄ÄÖ>∏13w©rŸ./‰CÙH	˘:8h.JïÅjÈä‹
∏ú™@gP6É≤˘∏æ˘Â£˙Ê÷WíAYN/pGµIQ¿"yd!ËîudÈ
˜¡ı¿}n-ç≠πãS)@âX:Y«ÏÈ:É;.µ[¨1Âw«E¶©'skL{˜IóXû˛I/±L\¯ëVX®Ï€(HµUÊ¿ú`5&Æøf∑€ÓˆZGΩñ˜∫}“{’<õ'ˇÊO∏ãÔós˜¶;QÃ6ôgõú‚Â©ÙI€eˇÔso«O“‹KS¨8!Xx˝)Cπmë8¬ªïî¶Û~OØD8!Ü
∆ò§QÛ
È˚ı≠"–sŸ‰É¯¬kΩÜÛŸÕW¡r0à¢fâºÖ∑ñ®—>›|D&∂@i6JC+◊#fπ!›∫’¡ÍÊ¶h≠~$g€ÃD›ŸÖ¯v©óÒ;4}îÏº&](Q—Z£¬ºg¿¿!£zN˘—∫∑yÊÃF1c99§ïƒˆ £.lÉ
r;Åq/…∞\dTÌ:8äÅÑ¬∆€`l“ıõÎúA—‚gy\=ñ(‚IlÈø3‰V‚/¡T…{éñ|ì€@ã<~7q‘OX∆vYßå#ƒµ≠â¸◊kÇ¬,ºœ1¢£V´eÚîÒ’ÿÑÕ6r…Æ¡Úàvf)“ÊR¬†œπÎ!6—£ÂTØüùñ¥®ÛMi]çFÉä¸e≥›´^ü-5&ãêmä¢ÿ\/G†È±õÒ]ZÜó[n¯ï70é˜áP@r ê[˚ü7+∞+é∆RXˆÌÕ«ÍÖˆEÚ€Ú Û.≥ef√”8(≈°.“Ü20‹L°<9†ßü≥¥:öe—cGê∑/≠oK(4»Ò^ÇJÍBÁ∏8‹ûdA÷≈AÍ‚;–ç≈—´©ìùq¸à?|¿–°≤1∂˜Ít§3hÆ† Õﬂú¥öﬁÒÕŸ9hÔ6Öe=&ö7¬ë4Xª™fêu`ÙÄÛ;1≤-ƒ≠Ã  séFI≥pã|Zœ∆0ôyú—6‹q˙∞ØpíE+(N_ÎpÁ§£yÀ`m≤ ¨Ì®uÙÚ’aì8Ç{¸"k3ÁÆ‰L£9ù4cƒÈü˚˜Ω£õﬂSl £eq™£ `T≠„ÓêÉp$Ω∫ß7€=Já˛tPÉ—◊C5π@W ¸˚·Qå’V=ÜiÖŸ=>iu€{8?Uÿæ/ö;Ì£ÃømTMΩXµ€⁄=iıö'Ì&Wøöﬁãñ#uØ’Ìº:iµO(5ˇ¬‘v∫Êﬁa˚ñ…IQ˝∑ı7{ÛÔ;Ó“õ{Ø;/ fÿk7Oz´ÊØNn˛√^{∑cÁÿÌıdÙ}ß}–ﬁkÓµÏÑî√ÈÂb.z—<∫˘€¶˝∂õkﬁ´_AÈMÓœqß›Ò≤^ı⁄Ø;Y(ÖkÁJÉŸ<-XÊä?£HïÀ§Ã-]^ãì≈±{à© %jœ©Tﬁ-‚y∂]^t^∑NéxPå.JZÛ3≠g"∑›.~
kÔ°‚ôÁO«Púú+Ô¯U˜•wxÛwØ[ˆ–a<£‡xû^¢èt~@‡hªà3bÅò)@d§¢~’!}æÆ∆o°ø|ë¬Ç∏ª£˛ÙùOœ aæF’g5Le¬©xQu#Å$£RæbÙÚÜ`4∆D≥°8ri§˚KÙ,	+Ä¡·√ú¯˜–ü¯"W_êâ`ì1óéü\òÕ¯AG∑óñlÅ¯NÂπù ƒå’r”ì√ ß<¨Go]c™@nÂ8	jU&ÁΩÿá7X›;5\Ztñùñ’Ø=µL,AQﬂ+≈∆Ò(gk¡Æ,¶7x•À‚ÕÄƒCén •äªÄ‡ΩíâµC6£ ôıí–ü Ä∂Õsqeå”oDÄ≤Åöã¡›aé\ﬁ3óã`Bm6ND˘z‰d …jQÜkÜM£#‘*¢À1v⁄Oøæ˘p9÷ssSÒû"Ãè!4íß®e
Wd9ÆØô*ãä˝ıb¡ØÃ5D:
l1∫úGE µâÖc
≥·!_O.åŸ“¢=¡bKÚ˛(ˆ¬N◊´Ö«óÒ$XÛ‚π◊ú S]ÑA@GÖ¿#¿—ÆºäΩõÄ≥Ùz0<ÃGﬂ¸¢≤Ê'ôÖl¸¸bˆƒNÇ™ jÿ3∆ŒªÙâ˙CÍ|GE€OÔï(&ãG∞<í˜CﬂÙÈ6¬V„F4$) L˙$Áª9,Ö±?ÜI=˜Ø‚§”	Kë<Ì}^––}ƒ4‚ Ö÷H…quNqá¡  oW‹7i„vË“8KCúëÅ‹IJBï∆=)åˇ#£ˇË[¸ë≥$€˜˘ªS hÓæp‰ë}éFJCõOX /ˇ ©ÎXWPëÖrfIç'úò2tŸÊtZ„í§©0	–t∂g’î %Â·iù^π!=æÌ;	x±&yRê–xë<]ˇ“›ï◊õNZÌVË>á†‘¿˛∂ı⁄.•“÷ÜP‰oQÙCÈóa”sÎ¯t¢K»JÒ„º°âÀÅ‰A°e"ÜWûÌãπ9®éä
>äÔ9‹3á⁄ ˜`ù_ïg%ﬁ± Ø‡¿” +@h†^¨‡Ë“’î⁄◊CºL,i-CŸ=d7»b¢*œ¸i¯M·Î˚XŒ≥5$·ÍÊ<∆ÒƒÒÅˇdvÛª±«„KT7xåßQÏë‡X'Y–Â©∆ı}§≈^4.Ú2%∫Æ?VöA1◊.|˘üo∏ï.ÛuÖlÛÚ†ÚDß◊–y˙âá(óæ˜¯KÜXòKY‹¡ço”˜öÁE,å«m ìì¬æı√t€MçßœÑöA‡mÒB≠Bıcı∫(èÁÒmó˘)WûU∫Øö˝›óÕ◊≠˛I´y–o˛ı´vE"ıí≤Á≥ÀΩq≤ïc∞>M‚oÉY‹êtÀá±∆„%ÍÅ¡%P{˜{Ë~ı˙âc!YZK„∑ItÖS¨ Áïô≤öœQBX{‚eIq^…‰MÒ£<∆”®Àò€F“j_ÄåOÌâ√4`mR0kõœ\r-iƒ»yñ	0Ü+ëˇ®0¯=å˝F
”Ÿ|ÎµæÙ£ô†€‚áS~VY»èï“ì£´ëXG‘D–Î64æVΩß”u ∆◊{UÚä7z/õS±"ÿ—≤«©^¥t÷˜)&Rk‚"—”¶˛ƒ®»‘à{Nÿ≤∆P“¨çz∏ƒLhÁ3ó@O“ñ^Îmºà‚Åa®∏˝0‚qxa<2&ΩÛ-◊9-õ®WGÒ0%ï	Z	œ–\~‡¢|&ñ¶>Ì¨¬ŸPi!&_T2&ö¶§∑‘îÌ≈ ‹B…ØﬂÉN˜◊,≠¿ˇƒ£_Ô‡Å∫$…á_∑[‹ò_CÔ·h;ÑU|?l¿
û’x®j¥ØÕQ¯ª4“Ÿ>iè …û/ ¿cº©çŒ≤Q¬ªe—ä5WŸÔÚ-{ôXÆRa»≠¨=*œŒk°¯…ß_[Ÿ√Âã¯Îyê|»ïAOM¢dl¢PhÅC9‰Ø^/k≈eﬁ◊≤fµ`µhoçù©Eã¨[Qç¡ IGÀÁfo**ı7ÂÛâ»ÑÚT8‡Ô•ïœb?ù±æµG_Mı3£°∞∫˚ÿ¨Ω-ôaM¿¡"ég9}ÏSîﬁ®?Ù)µ©’√Ö√Ö‰uÇ\pº)UÒãnÁ®Aød˚⁄…?ˇ\,À¸§|gùçã¿ºn®4,Æô$˛áFò“_QxÉóU∫VÑ∞Êyf¬F
CP´˘€åö?»nkæÇ9Ñ-ÿ†QX‘⁄;—ù≠Ôú¿óè0≥$ı^ë=]π, ¯. 1JÃXÙ‹F;ìûA~/
~`√«Ó∆ÛhÑ™‰qG(voG@ë£…≤±NlÏXkSvvøÈÔÌ»M©m∂\Òæ· èÏãYO_“5B√ '¡÷ Ë®QÜ»%Újë9Í·!Ñä)¯n/aU
¨,s…»7%ãFkÇk=S,S∏¨ÁEπ€ﬁ©ñP÷vVºÙ
VÓß\ëé*Ïg◊OÎM[≤Cjç0OÀ°ËF«&U8A£N¸ãáíXY¸Dê „wìJd—≠nO‹ìµ_ú¥~—¨‰Á—†Åi)¨35„[„¸¥œ‹ø∑ﬂzL :ó“ëxÕÍû™wm<ºLƒu j#+Ì9-∫ !œº>Ò¥è|¬—Ωág≥
åI;LàBîü8ÁˆÇ”%´¨/™sG‚vàãsm!v£“·êäA⁄]˚ó<úú ’NFµ1…Xu»b]‘óxYô≈ÁÖÄ¬MPèå»BOı∂4òYï´(íâ–ÃROª“©p†ó(◊x∆q∏>å=®f´WY‹Ω¨ã∏ˆÈΩ9„ÎÖπ-2ê⁄(É◊E{Y}‹2éñÓKmÕä··I˚¬xÍ¸xΩ∏t!q≤ëº:™;5∫LF{≠˝Ê´É^ˇ∏s“kÙè['áÌn∑›9ÍÆñXÀŸ‚¶˙QøFYSıÅÉ ÆL‚ ≈Øi<·0H~∫»Ìπ5∞O"4U∑G€¬6Ü…*ï6¬…0öèÇKYs&˙g€jBŸà‡ß‰µ–	’:·¡Å´uh!am+°dë'\nx∂≠9,…]∫3ÑV™VU\∆„¿Ö@, ZÇ´º”ÿæŒß≈π‚›®p*>gÍ^F™9*UùNô3ùo‘Âbê≤∏”;‰Ÿ{9A∫y\[S¶ßjﬂqﬂa"áÜQππu+æ[\áﬂµ —˛^ex∑)ªAÌ˛Èøõo<ÿÿX«?èœœÓÉËW©¨ôU%™Y#åcµ—uß–è^‰ÇÉ1Ö©BH˜j [w≠¬#)FÚYÉ	ÕÇã8ÊÆrD7ò§aÑ·ÌQmó_µ ´sÁÊ˜É(§ÂVä »‘ÎpΩ¨÷AàIWπ«oQ/™ÎE„=–a <˛k€cºåÿëfı]P:‡ÇôY)ºÛâÇQˇ‹;º˘˝à∆ıSô*Ôí2Œ´G˛/’SØ=ÅÚ§nkπ&∞ÍŒlD+&·ÏÊIËhj ªSµ(ÎÇ∆`ÑòËx8Gï} ÉO∑˙é∂†>q≈ñ »€Ç&Ù¸Ù-¥°¢ƒπèÒ)…j,Ç£ﬁ—Ñ&^°TV˜ª9æ†ª —`L
êÓ/ã◊¬N	o~¿P'~æ%Cë~ï∆»*äZ2Rg‘√lê∫^´ıcıxŸ ±ÏÚ!ÿ‚3ÅÊ—ÕPNG{Ç≈≤±B~∆q•	â¬)ëÉò‡ESÇ7JIèauÃÅ.bkZ RNb«t»¥v[ò¢‡¸íØ°∞∫PÌy˚nNfiê†®=áÇﬂØùƒ÷¸h˙£>ü6ãÈ‘+
≈ZP€~8Aì∞0æ†Öˆa»k¡VΩ˘˝˜·8÷®»˝Ä,Æ≤ô$ÒªW”›0Åˆ/Su◊áô£öÒ"…∑ÍM˝pÈZ˜‚wìÚz°Üaû…*FÈ¬ÂÁ{{{M≥⁄°H¨∞Yy÷Úl©%¡(úÌñ=º:‰È1Úæ∑ã˚é¿Í≤πù⁄üâD+.±EáÓ7È$	‰wê`/R´t≥èrP,ﬁØÿàÊª≤qhÓyªÿE∫‘J†ôî-HgP?≈™µ/µÀÄn‡m%ÛCò¸%>‘÷Z;{⁄NKÉ!Z>,ê~0XÇëPvÌﬁ¸.öG¥‹è`Ÿ&8…|™Ô7‹·√ ì-ÆÛ%Íä
ÍÍ™ˆgG?ê6>wú›e≤≈/:uõ)YçP`ü‚uE^[€eæzﬂ˜√≈’)gÊÇÍˆ«<”ëÑ(œ†õá⁄h⁄Í)ñò”$Œ…∞¥ò§ÿfv¬ˇXõPJ#ëóË¨åw[4∂s 8q¬ÃÏA|°≠_æZ¢ñÀ0à
˜jwN∂®^ÔÊw√	R™Ω‡J[3¸∂?¢áã÷(2â»"ääŒT0îtƒ<©≥*§UCƒê<+®Ä0ﬁéSÿ˝ñÓã–EL7
áÜT∑ºpÌ⁄¬âcî_ı:≠_µv;Õ∆jù‰õÕ≠/Ω¡áY†ç{Åº“F90OŸ™07êBz√õıÃ5mπuéˆ€/›”5õ¥ıËÒü´IÑeçQ„°w∏≥∞5∫è˚q¬©;•ÀÍ°˛a‚G+é—¥®u“8hÔòm˙Ú·Ü˜Õ‚6Ì†œÇa62{",°›´9Uò–‘AŸ›ju1öFQ¬8Ï1E ˆ¯%Ï˜ö∏”»iC§ƒÔæü¬69“ìv∏F!b∆ >ÉTı°xÛı^˚‰‰ˇÏ£h‹5~7Ë}#ùF·¨Vı™kßg¶÷Û˙ﬁˆπ& RrsïçãÊÆao‹À ö:vnIˇµ†}bŒ6r˛~XCJBA$/X|H€ËﬁYºÏÜ„ëk’,^à]ªI„)⁄IÕ–≤ù1Ä,˙^ÏMìx<Õ´ ñiî?dØ‹ 0J6ËuÀ£÷˚pÄ¶õWx8Ûe¸”å–À÷¡±´E»zM ⁄èrÌ¢Y;ËºËÏÔ[≠ûD–ËïÕ˙…ì‚n3L~|~æxåö÷˘≥§QxÅÁ.ì•⁄qÈG,Œe˜,,ù€nY∫ﬁ‹ÎtΩ´≠∆ÊÜ∑Ó’v◊ºÕØæ|DBâ«6à©Ÿ˜^å ˙ÉÄÇ™$‹E…Ühò„`oÀ/ê[n¡[EéT#J 9–†ﬂÓ	Z:_ÑÜ÷‰≤!%I)˘Ñ„ñ]k¯ñΩvmµO˝0˘D€Ó∂ánó[v8øótwƒ[˝é]^fá[v0‚èd.Œ„§Â/ô¡∞˘o…6‹Ìé!ªrÀF‹m∞ÇóÙU+‡t¨+(’µ5Î≤BXH„£™ÏπÍ{mÏ∂‰¡3zhπ!Ø``T§Ω
vÓ”‹øò’ßÁZmKV¶J˚w{Â¯…E¨Åøú„X´·qN5÷+{Tú@µx…Âí_2WçbCÚ¨›èj4rÀjº™¨∫≠^{ˇÔˇ¸_âëFªﬁs‹÷¯CbˆƒÉÍıõ¢“ﬁÇîbõÛ]da*çb’ra“L_\î#≥√∏.dsìm\…ÊLÏÃ›«öÆ¸Óœ≥›7\i˜Ù›á(8âV˝Óˇxµ.∑É≤V˝Hd∏Ï9∏˘=4eCEYcS=b%4ç‰¶Ÿ}N;
˝~
|€ƒW{-∑m§⁄¥|€`îÀe6çT÷.ÿ5/K∆ÉwÕNªF|…åiÆT¨Ó/Ÿ*±Ó4æWVu˜Ô{˚ªáﬁ!B] ∞;®¶ @·Ù|8Ó≈oÖ≠˘æ¯a8∞)çÚÌ–çD€JLÂ†¯˛ãdâògXºCönÜ◊±/ôêË'?¿´øA0bØÒì¡ˇ≤ﬂ‚5€uTÔ“ﬁÁf°€ûŸW?éˆÑÏKˆƒ1®fÎbÇ†!\G∂√E'01x}]Î√°úòrfœ	ﬁU§f70§8Ÿ{ÍMG´f¨;û„ı 7ØÓ|”}1mŒzGìÓÀa‘~˚ˆ´^ØÛ˝√˛…’tgø˝›/v◊Éı˝´„G/”W˛á—á›ó˝›|ÎÂ—¡∑˚ì„‰ﬂ~πıh˛0˛∂ı¯€ØæŸ8øzÒ˝Ò∑©p©–-CıÖS3÷Ü⁄Q˘·}j/bì‘
Xß°≥ÀÚ£Zè‹£≥Là ))XeNó¨Ë˜C >√·ÿfA2	fçj—â)¨
ç† ≈∆ãπ &*3U¥Wb-+À≈€ *	zÛôŒ4@WZ8£á˝¢Ÿ¡à—Ô]0X«VœÖ∞®ÑíPnŒ¢∞êöpxÓjäπH=¥l÷ﬂT∏¶(lΩ±§4‡/∑{qR¯[u?´)Ô¬yqÏïB◊Wã¥ﬂ¶˙HgEQZ¥ÔÜøç©ÏA˛Œı–Ã`˘MVñﬁe#ßY…Q›≠eçº)5aÖh≥≈<õ^0Qå
 ‰“ôXÉ{Øõ«Ì=5‘Ï®ö≥ˆjŸaq5Ø‚p‰]˙:¥Bﬁ£!p◊<XL˙Q≠ë> ΩÁÀò›^ñ±í`1‚õñÔD[ûY3pÓ –ïÃ±≤ó†
Æú√Ï¶bùå˚È;X;ÊT#ìÿÓ˘iSÙ@OÊˆåu±Õ$–Éæ+uœ,ø»Bû0∫rXüñÙí=…Âûq‰p-X˝Î¬ÈÄs±è≠Dœ)<eå˛k°œ˘‚tµåWƒ{$ØR†πÒÌ»}¯ˇ≈Hïüx±\ûË@em≠Ó;æ°[˝c£¶vøËB◊YÌT£∫’Á3}ç≥z…XA÷IR1õ≈'	„å¬tOé0jTåù#ø©/¬=âv@y¸∞øÇm˘%y°‘2†ß|˝dÿJÁ…)∆üpJ»©gñ©ö÷°Ç"L’·lóï—‡pJﬁ◊ﬁ£{a€CÒfóê%òpåÁ!êí·ŒRØÚBÆ»kƒ:H“µ∆õzÍèF‹õÍ”jÉi‘jQÌhË_z·‰«ÛãõGÉƒ@mîæê5òÊ„Ÿ8≠”0}Q-zﬂß˜˜´éˇ›BÃî4`'ƒt:í√*úŒgr⁄qd≥uPeâéπ·`˜jH5C1±·œ◊ûô¸â˜≈°=ÅZuß!≤ª2ŒF>hŒja·ÏnT+D[‚O~f≠m`Ò‘fÑçI2¨Äµk(&›j—D˚uòÜ¿nt&zË$§p˛T¿U≈ì.ho·‹D5ÎŒ¶ÚzÕ’TÚ(¬<Gîo˝I<˘0éÁiø
+Ê–ü]-Å)”±∏~xç:√ø∂ÍﬁW⁄Ë©¬ëOﬂ '˙x’úm8	…ok£Bµ†uP´*¢oùC(¬t⁄°óu˝ÌêΩ ø;ﬂæÿ)Q 7ÀÜO:BB-\e›T£kf™[É>ÓÒ©⁄Iè@ÓñâïjÅ¸≥ë£ˆ'7ˇmé„\∂yBp6Ç¶≈løΩè€rxç¬¶xw>jŒ∂Õ{˝v∑#¶M[Ë®8íãÄóõπ<‹Bã	B®IÂµ7d:À`ÄHä€ü}§ëº÷È]â;`&Ÿ÷Ω≈#GÓZÂèø˘˚ø˜,Ò%»Ì¢„Ñﬁzçb◊ßsrF∫úFE¿úgÁUÓ4GA»ÌŒ¶ ktO¬¿eâB@”@yœ„ÊÁ·’∞»-aDEK»“=FÑ¢Q∂Ã‰≥∫R Q˝ñúÄHˆQÕ"πﬁFÎ‘=JLFQÓI¸ßYòvÂ≥Znßü√ñΩ4‰re¡Û" j2të_lMtWT-¬@0π
ua∑œπ©0d≈ºL1Éç µPOÎZ)•j@vß≠V56-Äª@ïR∑éü+êÒFD≥-ÍÏT∞…>S-ˆI¶Ô:NƒÒæ|ÁÆ∞]U~oÍr‡‘FÁn4]5ìa]@|sÍIÉ¶ÀJë¨Âîõ3÷#ÊûÎÙΩÅ ëŒàÌ$“ê¶Ÿëj1·µ39ÈØë¿ﬁ©Qn	l6m—?⁄ˇ∏·ÅÒgœ¡{“I'¡„s7nﬁ'Áæ” —#õ"a˝˚RÃfbÑ∞_ÔÇ(Bgk.£HßTNt’8ºÅ
.}ú§ô0·=ÑEkz¬cÅ|†vﬁöt"√œÎ70≤Úr0»ØÆƒ€YNM«JÄå´ä≥b»∆Ï∂ßFEM_:Éò!Ö—ıwN’—“ÙIk#$ç'ú2–ISmÍ@«≈ïú∆(æ®Uia”r–†ÃuOÊÃ”Ò¶1—{û>d≥˜«ﬂ¸›oqù‚¸∏Ú6°ÚDüÇ˜ÉxÙÅ¶1úú«˘ª)T‘L1î™yp/xzÓîLπº4ˆÄÄ¿ û°.c»ÍG”.a;ZE/á¶°œû Tr°ôØ„s•oê~ˆâ
¡;¥xt_Ó–êm{Æ·zŒ„…w]≈ Çõ§¿˚„›á√/ê/
⁄Ç4≥⁄ºÄ¶ â∞g¢‡~?‰0#UéKVu§q⁄©áC”“0'ú!rÈæ‚B⁄#K,®n.ùmk:séÒeÑ\ó1xeZN‹Ö‰òÄQèﬂ¢!˙óÍpûP» `r&ÒΩ	s2xèfõ:ÄÅiHsΩ÷†jë≠¥ﬁÃZﬂ1ä±á≥uc¶û #«ÑÁ	å7©dâ∆ös#÷Ë”öN¨Tò yuª2ª(ÏÜì!tŒ3/@∆x⁄¢øå·ƒ(É°√rAZ4ˆÁ.§Ëíã—¿ëÓr∑%tR<+/\z›•é=≥ó±'ê∏'^J‹üo °¬®ÔΩ≤Zª∆€qÜ˜DˇnLéfü•q™øÄu3ÿ6Æ‘Êómæ,˜2ì¥óˇ¶L]*R{⁄Â⁄v~ÕÚZz[}≥j_A_¿.pÍú}fùŒ,qO£÷
t¢ÈkpÅ Mß	ª¢ç oa±Ñx’bvúIqºfaCÇ&à	¿í±/cç686GI@ñ91tb»È›ı°r›Î",Ã¿C‘≠0‚C¬F”n‰≠}‡*S!œ3∏6üôÈ‹ø ÓpZáÍ÷D6Ü⁄gãıÇæ1,É\B4√)"yÏ–≠˝Æ„Ö„Ú˛ÙÃºæ◊˜ªh≠Wbs “ß0¿¢ßgíóÎ”*[b0PWÀ îJdP´ÊBîkà÷î›âÎ≠1ƒî†EF
Tóá£¥GÊ|âº} Æ!kq¡√ëáK§  e4ºë§À†n0´ù*ˆæd’ûe»W2xóíù∞bÎä≈2éGåçJ+‰P˛*GQ§L=8ı≤L¯´≈Ωäa@pñ([+˚Ì»òÂC^T∂≥·â¯a‰¯hX´êw"§
}8x›ÎOÃú¿î`w∑∑…4{ô¬¸ÕrÁ±¸U⁄X £Z{,-»†…óöÑ„Ï∑©ÿ™ÌH·l¶5R<0ÕåÜ·‰{‰?èËê€QÄÒÄ¯]æÎ~"üöÊcÛôYº?òÃ®PX®∞Ê™Äp¢SÉèïPä\ù√∞”6»*—öµ Oñ¿ÒOÖG˛dî˝)uAΩ…’Ä.¥PZ}”≤*ÙßFì9ö†>´m"Mœä"d5ØÚóµòê*oúﬂ‘OS¸fÆ®0∂(ù5Ië"‡lµ'ÂõÓ<KòmÛô’ú	±9ÿ‰±˙?ÜÑW¬	nåøä=„'˘6k’vÁÖµkØJ◊:ÍtÊSzGEÏdøÀ6f˜±/Á?C–KÔÄä¯πEIQ±ëÖÑoX}ù0û˜»p›√WÌ…t>cﬁÍá/yòg¯◊è¢crk„y”ü∏ËûÄIˆZ]åﬁÊ7Oö^˚~pê∞¨pDG≈ΩòáÇ⁄t≠áeêÂFÔ∞≥◊<@l≈Ø⁄Õ\ñZmÍ∂˝‘‹p),âŸaÑiÀÅHˇvO´≈xÿ\cw∫zÚôYA3‘∂œ»≈KÓŒÇ©^*˛vÔ_sﬂj^Ï
P⁄˘Œ(t«x˛,ø)qÚ±l/âß “M‘ÙôèÀ˜6£Ôeª,«ªE»Ÿ≤ü]‰Ê:Uˆ.Ò‰ ^Í–ﬁ≠îÃJ»Uqº¶5„}&œ„¬¸“RÍ®ZRø?R∑ˆ,ﬁËoÙ£∫Qbd+ÈÅL O°g/„yí P∫kZÙ2˚Ç∫∂Ÿ–îª˜Ω÷:"	ã∆(	<ÚÑæw®`â%[ü∞˛3Yc4hî›mO7ü†·Lã+ ÑDN≠†¸ÇËÿ†Å≠ò‚ÿfTL!«¢&!ó˙^–pﬁ£ù'2_QJlïñÃHb©ùÙ.d>Aô∂íÁªÃËûÙë4}.øˇŸ« zV®íd7(‘—ñj§©T©Y=äØînåÒFÉA8*R-≤ÊÚ∂Œ»_·\o{z2'‹ÎÎJ°ï›#±¨äÍêÍIn• {ºΩJ"H) i¯ÚÍÃú⁄∞–q´·	*ó°ÁêPÕº¡}‡´n~Î”w|%ì–ëØsé27àÔ˙i¶∞˜å•vÛﬂ£B,y?GœÜtÕﬁ*Á
d»Ω]ÿÌÁ¿üOÜóÅÿ0YµiŒK6ÕπnÎáˆñq$Õ¯
®jŸN0[óÌÖÛ≈ö˚Û=Öîpﬁ l¸lVƒÕ£ãf~:ı/x¿ÛÍdOîÂ¨9n€rıÈ§Ufî=B@æ™Ωççm˙ø¨RXáÁÁ®ã–…0˛JøŒUeO  ÿÛ?‡§í)–y«IMï|ﬂCF{√˚+Ô±˙gÎ°}ùñí,ÏŸSoÉlêÂÉØüz?/BÃ]Lñ®|$M3¢π⁄t^Bõ#Ëìåx_úP†nƒQ‰'›bRR§ Xb€›{NÓÿQ÷©†[›9«èJ¬¡<ªÈ=˘åÓ¬í4ÿèbV;o\Å8ú†nq?|åj[k◊d[2¬Q)Á11†ÄT ¸µ ¬•Q68D≥'ÌπW}†”…õó7? ^áHpÌçJ
[é\‚«A2ôñ¯©Î»çÔzΩ$-}–dA√!H&§r?ú#:Zõ—–3˘¿M «ò¡^øÚ˘R˛∫Ds:ÀàŒXên‹)?*†3ZÓE§fú’¢Â2ÈLi^ùL©¬>aˇ‘”É"¬ƒÆÊxïX«ñ|\c@.bÇÍò&7ò‚Å´Ê÷-ë;”=,ÑñI}}ó"z%LïÀå€0íËb¢{)ˆ8¬≠‹Fã…∂òQM≤wp∂´Ãº°Û˚Y¸\3=›®{≠]£]€üöî¢y∞£i˙ÙDÏa√6¢Ø2$ê‹QH¯J¬¯óìµÏÚå.DeÙ éa≈;(üô #Å˛∞ƒmZP1H”‡ ˛lìz=ÉÂúm¨êe∂·íV›óR7(Ëüi[Åˆ®ô∆©Ê B8ûüéuïk1¥.êÚÑsÕ1µqRÑÌF2$ ÆIÅ2ú≈ÛuºÈî%·.í‡∏ËﬁµKnﬁ…bn ΩﬁˆŒØâΩÜ˜√ó∞Ï†c[Î£"D›È8úÃgÅˆàΩ⁄\y{„’.M∫6Z{É6∂U'^$u~'KR7.ÇW¬ß°oŸøJ%T(àä]§” ıó?uí}âÆù7Ù¯Áh=Üˆ_:#Î»ËŸ®àö%1ˇvÖÚ"…ánr∆∏≤…X.∑Õ^yéR4ÍserRH}Lz‰jÖM|`£UiOn 2ö„Âú´cê&+8‘@GFLEThGr$UÖÓãF±\œ$/û$Ô5éÍo‰Ó∂%®ëKÇBãC¯ ÌíÜ~Lu≥F(+OÓålÉ˚PM:≠}tßé/’sMUù-îc`5ﬂì≥…ßÈ|	Î‘õú0o≤!¢‰é1 ∂∫≤¿’7∫âóß?A+ìıV»ı©å$≠dõRHPŸ’ô
w◊ûÃjπ∑R˛Y˘gÛ∑Ã&uY◊jÁ¸.a(ˆB_?ÔuΩ8~¨fk¸P!7$∑£≠C)M6⁄/kÙ÷ôMhyäR†+¢µŒìﬂ±±ÂxûõÀQiL$–ux>ÀbSÙ¡ñiù‘µñé◊kÔ‹ˇzÁ'∂Á^∂ÀDz[_ê?@åm∆›{¶¶Ç¯~¯µÍ2êOÁ&\æ€Ã¨îıô¬Ä¨∑{âfàéé´ûæ¡·Œ°f^k{ÜGá{ˇ’˜Õå£IΩî(|úâ-#™-3À÷·LÉƒ˜5åÊã£∑Gïñ≠‰Y·Jœk˜f¥h∏y¡ê€ÁÁ)◊)‰YÓ’ΩOxÍ›ñ›v¨>òX|3sÒMìÿ‡j˝i1>≤e»·D¶∫v¯Õ2™~gö.,≤]+‘¸çX)µh8Ü7øß`√¿í˝Ä.ÊH591ÿ¸∏∫é‘¸Ö)BÖµ'≠ÔÊ·îñA#†Øœ)Ï∫Z-¯nQ∞GH"ÓË¯ã°Œ˘ıØKrë⁄Ú){TQ~µ0∑ÿ3=+ª0â#¬óÉÉÒËåæÎkn%=˚íBü–8}Ë4µŸ:-Œa/‡í≤áz¿ò≤"≈z?¿ï†0ÑZs^mer¸:ﬁ¸ì@/‡~¿:∆Ëé¢ÌîkØ÷fq¬è_¸T)VTız≠¥ﬂ∑⁄g≈Â-vâ
¬ù]%¸óOÙ√X)∏ôØ8Xø≈Kv<¿ßÇ◊î◊áYU–2–$0ãèâ¿>&Ç€¡O¯òpÔ–%v'_œ_Õ‹ /£zYj#j_^öŒ∂ ìv9˘ÁÁô√|#ÁR∏åﬁb$ïçÀo´Ÿîø|ÔSn9π›¶ÛdéÌV¬¢Ï´∑·(ÌQ
bX'“•“≥x£ÑÅ·ÿ‰Qí~∆æÅ¥Ã¿%)6Óm∂Ωﬁb¸„)‰ÛØÇ®Ôº]œI2\AõÍ‡ÔÑ‚oÎÃ◊$«fÃ—≤∞4Ùñj˝Sççéd’ä12nàÆˆÒ4∂≠c‚∆E‚ãEC∫õW'/Ω∏ÍH©Û∂Oy[ïHÎZAß2ZÎ≤Ö-‘eçéblïNäô´Cá%Ø•Èù4WV˘Êß}/Üyõ?.TæZjî|I9µJæ±Èˇ¯õˇÚø{mTâPPùÆÖìKﬂ√^:
Vª^çâÜë±ã›æ˘-]ÛpÎô2÷«ﬂ∫J¬—"í_%§ØÀ'0Ù5≈JGs«J∆REí8)≤˚‹‚⁄‘J≠N)}µÑgÙDA^˜n%Èß9Ω$œ+öEÚÊ∑ÊI°!Â=BXƒã˚à„U]<
b˘WG¡Uua∆ûçö>≈ÿ/_í÷gëI3c‘ñOÑº{„_e˙Ï1ÑÒ2.ù§µÙ§ö#—£ê¢Ë≠lúÂ≤∂ ë’Ûå9.“[ƒTÛÙ˚^
ÓF\ªs@Bqrûë ΩLº|ó;ö»§CŸàa‘å0h(À	∑,!¶>ïø’`iZˇëe∏∆øêÃ-EìôT˘’ΩAVà‚eN+≥ÅeeÜœ6÷Ó5ªXrñ‡/(a±_â@ˆÃ≠Ã&¥tµºG˘≤‰JLK–◊IaXÎe8ªïO`Ù∞Z][d–"1XÌf¨U”¸WT°qI£º»ˆE_^%7ƒY5e7≈fa∑∫-vñi
'ﬁWŒ60“¿Q;ïpﬂ{‡∫(óü%5û`qxıìÄôI’á.ö@3–ÏEnºRUÑÁÂnT Îäàq…Ï%˙+]˙oKÓ†©x©û∆ ≠HÚø≠Ïpõ¢…*SáwER}d:k/“`,!P»LPPYèo~inÆyä»l8E‡Û¿õè…¬–á}‚è9⁄G3Qˆ@rìC
ï›isw«˘ﬁ.Ëõy9Tò¥(p{>ªuì\ƒ“	èJ^u*ë§Í§ƒ˜\æ£ŸÅ3A¬ûQvI—Åò\˚\nÇ√aÆOµ?æß=VÅ‘◊7ü‰ä∏ãÒKä±JO7l~ó£…À8Ò=gYOå@:”=Æ4œ„SæÅ*F]∏5⁄æ+B+¿ÉL<qàà“Ã Iñôﬁ»@ò&·r6õ¶€˜ÔGìu|õÆO'@÷|{<6e|ˇ—Ê÷˝Èü«õê¢"«’pØ…∏zÏb:HÌeéjC‹6jÀﬂ”“[ Ú{ˇæ◊C◊K¬Ò2N±p[k@|±›«‰”U˜öÏΩU˜¬N◊Çr	∏≠ ZIcüz«ølÆÂ÷ÂÚÄƒ46eΩöT”ÅåƒÙ$Ùº“Ö+¢¬6ÆªfõÁâòJ≠b≤ØØW™Å?B∆E…Æ¬4ûn>¬¯|9s%ù˘≤i6Ó8~É˚¨ú£5gVÊ9htˇ≥è÷”k2∫Ô’…WÔ¬ÖkScÖ%ìG]‡∆xê8`
åÿ˙ÿÎ˛R·jƒ,~LäÑiSú+Æü–<ÁG…1<Nªª©∆ jdÈVBÙì5-¸Ô“’™√≤xPñí≈í7¯»Î≥ÚèAEÏÃ¶ëˇAÔia…L÷∏0•<±´°d#@å≤A∆∑Ωàä$O«íÉS’8	ÍÖßØËàΩ78ñﬁ≤9ƒh‡!¡˘%YàEA¿Ò¿Kê	ú&«ÄD‘ø∏ ˆ¯àﬂ·n6ß”]¨•¶XÅtâ€íÅ±#
j√8£ã\BU5√MO˝Q"VBl£ƒ|7Gah¸8°…˚»/i ·…I∞ZgòLU#KÖ*êdñ˛2ú]÷™√ ôıYs£00Ñπ˙Ù∞Í~=ÄÌù\˙^˜ás`t«ŒT¿>ë|¶˝(6Õ=BBçªÛ\DÑÕxÜà` 0"Ï;MÜı†£7ÿ©t$Öö†Øc’A{mÏ«…ÕoiMÜ£0ñK’1Ûã˘Õ?ËÌ;a‰ÅDq¬!éŒh.÷ä∂ñ(≠ä>R≤8FÒpéÁDC~iE˝Ü¡#‰t6õ}≤(9Ùæ9#+DB˜-è™M{&˛ ¸„8ò˘=ôéa≤∏häf’"4NjULw:Ò«¡” E_DAÂ#ÙeÔ‡^ä&xø÷‡#h‘a.˝¬Ía¡¡Q(WoN¥ë≥Å-√q‚∂Uãy]`Z†djÄÙ™ó¿¿5|\‹E˝~ÕÏàΩ¢ÏÖ‘tà14ñs1åWH+ÎÊ^/ûuo√XPá˛$<˛S2!!GÔò¥ï#ﬂcZ[F•ˇ@ålí!‡√ïÑÅ≠≠Ùœ„çGÜ0 e¶q <…åjTh6ä.ªÓΩ@âûi''ØËË[õ5NâÜ¸»å=8¶{©≠ﬂ(úº•ÖK∑ÇINì ˙üûV±ÙÍYE-‹xU≤pe·ÊöuUi-WLb.Wô	§únâ3ãƒêbÏ_˜a‹ó\ú™±˙∫4JæLH∂ãCÕì¬Ò^rüV)ı˙gg}≈!UôcÍ¨·†™\rTs[nË≤FŸcó’P0x¬s=A±ÉK}‡y0#C9¶ù$‡ÊøàΩ⁄N÷¯P9GçÔ¡˘ \bµ˝>Å˝Nx"Ã•ªOﬂ|≠“á≤Ç¥∞"‚>1ı* UQÚ˘ç>\Zº@43íH„$Ñc◊˚¬´‹73	VKdi(6–Lg|&©À|èRÚˆIââ@l+ÕPÚ·’´±qæ˘Û-ü¯àø8ßè°í´P¶Âãÿ∂æz00ã‡˚ò©l™nçƒK“±6Ò~¿s»4ﬂ≥ö8Ä=Ù^N…Ï$QZ(Û‘í)\B^%MÜêT,6óVI√Ô,Æ≤˘’÷{¯œ=±Çƒ)b‚NÜ∂ qà…Å≈ïæ≈0a[¸±3ﬂµÌ[èøáˇ˛Y∂˝¡óﬂ√ü∞Ì?zì·Tˇ˝òM÷~üIZ™à%ì.V™*FÁ©çÇ®ë∂5ìÂ È∑THEkßfQgËV&ÓA¥‡2˜1fún◊kRPÊì^ùàÛ¶C@*ªÜ’≠«§ÃÉá‹R'•Ã∞¬	©◊a1Àµ/<'ıåÚ®T-[íı’[eüíF˘‚†‘ÜW°@?8˙Ipø’F_+ ´0”Ìlm›f@ÎL˝œ Ä:À†:◊){U≥¶Oê}¨X!ïÂ¢J™1å¸4E†ÎÜ?Å@ÜY◊9ósÿ≠LI0éØô/
/.5i◊°x[¢r´êÂk7[-e}î3úÆÛ Éá1∞3mCî¶{xév∫§ÙÉän7-q*'&N{∆‘òΩ0aT/C÷uW^ÏÖ¯}˚’Ku<∏X&xÚå†aﬂÅœw.Z¸8Cr5Q≥¯‰◊/1±Q(<V˛ãêgÊp∂Â#5#ÎÎÎ^≥◊<x	#ˇ‚†≥”lwÑØ◊⁄=@p>xΩPòº¶.
æ	>Ï≈Ô»Ä!(à]áD)hº>ò∆2˙Z”æ‚^™Å@>K"å¨IÊ≤(`SÿŒœ?«“∞ãˆ√O@≥0Ÿ{å¢ú7%Ä1{°ÖiFÃF5|˜K.á+`à’ZÍ∑™≈≠|”\g0xŒ¢añ⁄¶ÅOuw@.–§_—7D,»®Q]ú‡ âÁêœõ47ççèX+¢∂øJNÚƒÍß] Y`øÍëf–ı∂◊˙UØy“j&Ë∂Zªúø®5∆ñzDÁ≈]R]∂h…‹5ÍKMûÕú!a)≠ Ëé≤Ò≥x¡âπÔêﬁ§óÉÿOrÒâ¯£ÜTèH7»í_rÛ√4˘€ﬁÎê¥À‰ä·’ˆdYkﬁÛwˇ™Ú»¬=1ìyäﬁúöﬁúáìæ¥ëªMo˛0BÉ¯}eû=˘œˇÁ*=öû`ÏzÅ¯qõéÏbXiaê"q˛¯õˇÙø≠“ì·ßÎ…ê‡n◊ìõﬂa^íZI^^$Û)uË?˛∞Já“O”°4 .vÜûƒ˝Pÿ∑ÎZW‰}.q„¸ßU˙‰ö>#E1N–¢+ºUgö™Rü¬_8ﬁo˛âõ	]ƒ°Ò«Û€X•ÉO”øA2Q8æUœv8/Ù	Å‘9§!L”JT!˛DK/$¡Ì÷Ê÷ñ4›¸Õˇ˙√ˇ¯ø˛„*àÓ‘ÅRRŸ≈v⁄%ãóäpS√Û≥–r1ÎmW‹pÇ‘Åˆ0%p——%QøY0$ﬂ¬?˛ÊÔˇsqá©”%
-fá¯&£ÏéF‰w%C’™¿x!∫0‘ep£™JC≤•∞¸≤BA»öãUQw1rlNñI;Ì	±0·ÏáÔ¡(B"|GÌ¡‚ŸxÒ9n*’ªÀ`Çööä5¥V&k`0`ïQÑﬁ C+Sâë:≠jxÍÆçËπBçY”√›ç•„‡õÏ¢-YqY^c|pi‹ªπ±aö‹Æ∞x0¨-≠Öj›0U‰+oÂ¨tA:ı€‰Ç‡¸÷ôQ≠y„Emm±ûeÖ•P∂âñ–Ee,◊E%,5ºã
)eµºÙ–6Êû0Dwÿ◊M≤DÀ"T±eÇÃ∞≤œÇqO‹ÔU˘'Ö™Ê`£8m
,é@èˆÇi g9ìí{@y._—)`
A∂%®ÇeÜ™ÜqÑ≤#⁄i‹&&ñä÷’áNò7…ößstkÌávúiÙá≤ı 2ÒƒiZ‹¿‰2˘C?ﬁÄ]ˆ;ÔË2H∑’»[	z≠è£ø≠¶ƒNÇœ©˘<Iπ*pj˙{≥≠O›s=ë•ÿŒí≠≠y"
Ñ≥ÿM˘∂1ˇÊt%%œ¸>z/¡KS3ñÙ£Ä£µJ˛dqK˝∑EõíK≈àﬂó& aA¬ﬁ&l?_ï}$µ«∂WÈÕ…⁄
√mùáﬂ	FÏ9˜úxíòﬁ„ÑŸ¥:Ì"-db¡:m`;D~öíI$≈Ë—IpUÏ∆Qú¶ZÛ`{ÎAE^¬®Ft®~ù`—¶ﬁ
K=“ÿcnôˇ=≈¿¬v≠3
z√xËÖ o|≥˙Z@ë”ù
SÔ´ÌÕç|}‰6ôAw∆¡<ı¸1!Ñ	’\gSπ…•?F$?äë6†≥ﬂ¬òÛπQ0
áîÈÊ<`X	™Ñá#k«¶∑-˚˝vSÍm>⁄~Ù•£Áet¿ò%˛Ä8¡õí—úù2¶	–÷êöâ⁄)/Ω˘zª·BÆ|¨zäÃÚ˜Zﬂè!ÀÕÔíU˘–9ÿË⁄·_$d/»MˆfŸ"∏"∏púV($≈öFÑøDÑÿ f>Ñ!Ä(®˙Ò∂£fBò≥\L⁄àaÿLƒöﬁÉ™ÄG$˛rÛáÙâ®h5⁄c(ÅGú¢N¶©\1YK∫~Ñ˛ã_mlo˛ºB˚‚,3%jQ~^„1Be8B∫QÀÓòõÁœ±Å~ZõËœ¥ë˛ºõÈ'≤°sf	ä∏ON5◊>˙ö†∫ù∆ˇäﬁá–5 {m›qÌ˙”öÄ—ÆdP
›ZgY”O˝ée'ÄÂAú‹˜-Â
;T-0ŸY¸äjÉàk4•¸JXv¥ou	¸6\€4Q™*pxDtF#À9“F–òiÅh{1ﬁC¶Òòq§ıp—xÁ≈ 'ˆG>Ñhò5¡YÓœ®∫Zõp„<D'`PâdzÅ9ø1ÁËZÌe∞üh±‚©oY ∆,™""©’=≥«◊gf^C˛ŒFa§Ös‡åëÒ†%Ë∞ÜûX*nËœåÄå<ìj»√—≠
7∑–^0#c9†>@ﬁ„9.°8ôêùkJe<‘{&ì`∂‰.‚®RNUàu*ØsPÍØ Å™%#é Ë{^”Kï€@¬ºπÜÿ@Tíï¸Ü3Zx~æTÛáYª¡XL„´·	.∆Ä®SÖ66º„ò#fÕ¬…úå≈±„'˜∞…¬cÿhÚ""S˚‘∂ÂÊ.Viƒ‹º,ˇ^BqQFP ≥0waõ¥	4ÕªÒN˝∞”Îú‡M˙AÎpÁ§’kuΩÉŒÆº]oû¥ˆõ›˚≠ÓnÛ†Ÿ]Íñ}à∏áÑó}åCÔî:◊Gﬁ;“º˜Uπ9
FI\z’G÷búÊï∑≥ﬁ.≤π~ôIS/ñae€Ö¢txâ¿H*i7ÿI§-˙;ìñ.”:ÇVoû’&Üâ¢*É˜óÉÖÈTÊ‚òY¬\è¸D` ⁄D∞n`uÌÖ)2ÿâuFë'1N“ô@f8[Pﬁù<ìÀ@∏Ë˝ñã>Æ5Ì˙‰‹ﬂH†D∫ÇAò%1‚Ë(à £Àîäv ‰Ã¯ùUO o0¢,ûNÅƒ¸ú1ó›”ÕJCd« ≤{#˛(€À4°Ç@KQ†ı)˙,Èá®;Ú.LÊh2πmhá
UÚæË]—Û‚˝◊I£-¬I	<Û7ﬁU¬gHaîp•‰Vßs∂.	ß«^ò f-6ˇ+ªH√œŒ¢KÙ—¶SO=dÖä
…ËoQ*◊ãÉú™ ›Î,"œHYDµÓ’≥bﬁZîí9^Ê:ÇÃ˚	1f∞aIs‡ìR`Iû§ˆß$nªqRÊ¢∂€ÁH>fâqÈY‚ÕkÔ#b@ƒ¿zôAH›∫]‚π{≠ª¶¥ﬁ√˘Ãóæ∂ÏÄ 8D µµ‹Ê,°Xë9òêly	©yŒ+Bú 9ì’9ÎPÅ~kg0wt•rÀB5Ï7iÃ˙ÊúÓÊ äÔœ£hù/jp«"B/ô£ÑÂP·'Èƒ>ZâW{;
U1›0BG◊8çÀÓgïa]¢™’ÿµQ<l·(
Ê¥»ßS¿∏˘ûçw“ô—*∑°Ωa»azØﬁÉ∑·Ï§8¡8˛˛$Wpˆ6Õeu7í7'4˚√ÇÆpLJ‹8We Ó„M¥x…ﬂ/KMœ⁄ÏzüÊ≤ªI6*7∫≈g°@£Ob‡ÄPÆÀem¿Œàj4ÇÖÙö]ƒ©àÚSW$2q*Æ9T2õíùHA`ãô}OW8#KÌ6tÊ@°}Öñúê∏≈∫D†jËÂOQáó€ëÃCën$ÏxèH±¶mœ°ü∆^°"£ï†mE8f9úÆΩ¥ö’F*ΩÔ5∑Æ€~Ò≠sA)Œå]Ô˜ (…YﬁÑE¢ÙOc|lôz∑sr“¢Ù€ﬁaåÄüpl#1_?	Ü"⁄∑W˚&¶ÎÕXI·A)¸ÔœQùAäª˘Çb}+Ÿ’§PÓ%4ö∏(ÚØ◊DK˙Gu·ìf˙¶RQÇaö≈Â%dGÖ&/EáDûPn5!π	ºöFøèë#Åb˚≥¯-êgáX∑L>ùaKÅ4ºò¥'à=±K®=L^√úıÂJ∂‚8‡ƒò’5'Ò‰ZóD®™\!?ÀäÀÿ(e Gç≤oß'>ÆGûí©^”√ﬂ∞Ä¡√ü‹¸aÇ(sÁπÜïz\É’û≤m7•›¶}\≥ﬁhL}æiB 2:å¶Qd≥Â´9¥kmyÀÖ-y;mÕœ'ÖròÑ<∆‚	&£Î∆]f»Â
ò[tnÑ%
ºÀ*GVŒTX˝0!c¬q8L‚ı8ÜÚ¬eÏ˜”0…ÓOh!·≈Œê√ﬁÒLÿ$`
#‘u‚Q8ÌÊ˜WAdlŒ{ÛrƒiËH(ﬁ7¿·ÇÀBÍ}Mçº2z4ÒÖl'¨˜µt{tµ9–«€ –⁄∞ÁPk e
Õ2‡‘€ıŒºùÉˆ—^ÛEÎ–;|u–kØ˜ZGÕ£û◊Ú:Ωˆa˚ﬂ6âÙ¢Ó≤€kûÙ^g˘wa¥¥…9xÖ≈ÕË–Oº‰ZPÉI¬Ò¸!AºwqwLó◊ÜÁúÃ’5âpÁÙ”`WY"°˛Ì¥*lÅPÃ¡9È+d∏¿jÜq@øa“±2özè
1ÿê•R ’œ35≠ûÂGEÎ°Ä¯$Ûá®—Oπ3xÒ*:7ÜÅ9Ó¥ª¬;üM7≥~§P6±{í°S§G4ïLÔµØ˝$à?NtõÉK‡7ŒøÉQÊwú˝Ú£˘$Vø‡ÿCÉøXW≈É¶)ºÈ’\6∏‚9÷Ü¯ı˙≥a˘Éi1ºzbn∞†ﬂ0∂PÓ(§'∞´@»ú©)≤åƒ‡	ÏPtiöÒ˚©è¯€Ò$§Ò	ËBçÍ‚¯∫û 
◊Î‰‚JníjœÇtc˝â?ÛıüQ£w!˙ôŒßàC‘^˙dÈVçì°\+dñ^ˆ≈~$$ zjÑ&P*0ûh1h%NÛ√	œŒc‰Xh)'14µÑ√yÎè∆»°5ï˛Pk‘”Õ#ëFÛ¢@®‹!#l-n±~I¡û≠€^‹E6Á)]8ZªSÌ!∑Ÿ˘í•‘=xñ€/™ÏksübÛÜéµW§d¡ùıQ]©·kVæd»ÏNmlO¢≠ªÑËEGZw‚O”ÀxV3y⁄[YB¬±ááÆ§QPZCj£»á
ŒëÄà˘I#x‚’È⁄û{6Íë©µèû∫Ùe}«∂ß	¶,[Á√52»7Ëj`…#°⁄≈‚Adá=‰êØ∆}X€Vlè(∆}ÉÕßjnˆÈÊÑº%M·C,8YΩõ*în"Ï@—ﬂA©‰ã_„J2qHê˝nÎ≈´ìÊ—Õﬂ6·Ë;nùÏwNõGª≠mo?å–µk3≤(ÈÑTõ÷ÃRö‰‘á€9gB.Qﬁ#©ê§≥ÔU:ß∏y©◊°º ‡û~†ˆ6g√,∑£Ò™`bÉ@¿R∫vduT˙4	≤FÛi¿v(óP√Õôâ»ÏÑPî’…È£5Æ^°nÏœ!ÛˇûÁ@æ EÃv´.1f ß√KW¢aVOöÓ4ôÄ[Yn`Å·|Ë°«'¢∞ƒyÍ<9KOù‹©™ùú∑$¯üåûÁp›z3}¿2`]‹níΩAÍËìí∞ø≠6OÿòßO·_9ùt⁄˙.|≠õŒRÍvOjﬂ•ÖW´¶]„ŸπR?Ω<PO]]’„«CAÄ3–{∫—≈ÛÑPÿ!b”
ä™®È°ùÑüçQ $Ø$»8å@=)¨◊ñlUãdÃC,
ﬁ◊Ω~FË˙05€H∫P(∏ás<2¡S»F-«ñ‘µ±∏6Ëù¸ ≈∫HÊSB`îAj
∏∂‚9l.S´Çk8Sïòãõîw	:S„<^3NÃwÆÆ€ß˘RÓDŸ*íQ^0“ò:2M‚⁄Us~î´Qê÷qd,∫pÀ8	ﬁQ’2Ãz˝§,£Ã“†Yñ≠ßÖ]¬O…+F[AXÉ¥fﬁö⁄=oÀﬁÏØ»mo~`.Lx“„Ü‚±oVt˙÷π}ıÌxÖáﬁzP¿€EÈ5Kç¬ØÈe‡ãÜxQ:˛¯±˝65Ò+_®xq´BÖó/Tº∏U°ÚHÀó*ﬂ¨\¨S®4ÀIFí[W§§Tw%Íı¢ïQTæ)¢π+1”‹∂&¡£˜^ÆZ∂Ìèeî≠^.,vâ]%÷Ç5™k9ı´˚#‹¶uoxâÁó*LD≥Åí.nHÌû$Äß”≥5O˚aàe+èNT·Q›;Ö6
B∂ÄB„Gj∑óiæ™Fˆüº:∞¢%™Yê¿<Ä¥b—DzÀ∆§‹H∆E6≤∏8,bDØr&≠*;≈px€Ãbë4˚&'Õ~ˆN∂ÎµÌ7ñ4ãüÏ2jâ;≥€s6öÚ°ñë±®ÙSiÇµ–UÍÆLjzm/t¥F}ŸjûÙvZÕjp;GÌ^Á§yÿ:Íuº=*;'ΩÊΩBc’Œ"É‘ú`ò≈JsJB°ßàaÚGŒTh¢≤¥¶±1€ŸKó±iÆﬁÉ„∆Œ)lí&Áå-eól2ÂÍ£óø€fV/’-ÉÈ&´ô+¶kKXÌ‘”’ÁÕÈ∫¡P≈≤˚Ôku=ÆU⁄bÎRÖk°‘º˚ÏÉø¨»Rf”)ÆÕÄÖFµ€-UoñR≥Æ-@áC≤˛É“ó∆O€˙0ïŸOØ4ÎKÒæ?√êÔL⁄≤ÏlÖÜ‡îÃ∞àå¢ó«8H0^–’e,4Õª.æpúƒﬁ%∆˝>öËx<å≈ò•Ü D≤-`Üº*`°≈ó,W˙Ÿò⁄Ô4wøyuÏ5_ı:á7”kÔvºn˚†u¥€Ót;^Î–;zı˛]L‹‘≠Í£ÓÕÂó—@¸˙’Ç;5!kJÖ≤JnŸ…·Ωl,0˛HŸâÈx≠<ü‚=y‹øÙ!0>®©ª˜‘∫∂•fed≠1Í9OÇÔ‹≈üìí*XÖ»ÉWÕV‚äﬁ°<L≈p4B∂QµFÇ‰≤K4ˆÂ2ÏªÁ"Jß˜—hÅπî≠¢uõ	á5Å›!ÉZï<…Â¬»~áÑ±`SBï—∂0À˛2ûìÅ(*†–TEc◊yÊvéßFFLÁ¢û=≈àÜyÄ¡‚A—∆,?∆˛ƒèÚl>˛Ú”‘@wré
~æÂµ∏®E¥u¢Á)·>ˆ#ˇ¢‰,'k^2äõı≈Wv–yND+”≈âXï§KURóÜ∆rêÀ(ù"M'‘lóq2Eß¨§¸pí◊*ßÑOE∆T\Ëô∑áñ“hc¥'âg·ƒ◊l6¸)d3ê∂Oˆ¶ÉèR1pÛZ	¨éB;⁄xmπ«çú£{êiì∞ï¬_tMSQ’"w%˘—`êESzÂÔÆ\’g’
•,m7Í3€`…7F,R?Œ6ÙQâT⁄M≤ú^Ï{ëUÏUN€áh‡—?nuõ{Õ˛IÎ∞Û∫_ˆ:˝›ÉŒ´Ω>üügï¢¡¿è∂ªù}S„∫P!òM®ÑR1≥–É√Õñ8óíVßXíkNnvãwpíG!œÚeÁΩ›øæHÊö|±jZ¡rJë{ræ®4F“èﬂ™˜Eâcõù_ä	6[Z2
ú8q+éÑ˛¡Ÿ¿"ó#'!ÛdÕ)J¸˛	ÆÇ#≠íÊo]3¸Bw*îG∑Âu_IÃŸôÁﬁe‹;ÿ6f´(}<@√.Ó@ı8◊“å≠¿Äå#√FQû–K¢MÉ„Äë·*˚{É1»¢“oÎk–Ω Ãﬂ§ﬂVÜFÒ|$)L)ÁÿÜ®Km™ˆz∂Ä V3ñwk≠Àÿ¢∏°¨ìa¥+Qw±Xògxı%Ïöô‚Œ s˜ç„‹=·≥ñL9—¥›'/%’ !ˆy5≈ﬁgı≈zÌ}≥Éæûì˘U0nºq¿Jñ9ÈçFéf	—–œÛ.W#™Ugÿå°–ÓÏ\F
uÑc3µ[ËÊ„1îNÌ¯§Û‚§’Ì∂_∑º_∂vºÊÒÒ⁄°èMÌ0ö%⁄Jì9ÓÌ]Ñô~˚º∂Àû{∞*º6Òâ?ã≈ÖËà∞πÅX	”‘¿»≥äbL¬;ëãb©'Ä4Ë›e)òpÇâ™Ö	⁄n¯cÑ‰%¿Mj$5f7é¸‰˛n<©A◊h2 5;√üBﬂæßÅw?‚~Ø‡ªWÖZ◊úŒ¯Kôøè	⁄Å*g{mú÷tøµ≠Ü◊K¸+ö*Ñ„D%Ö«F3Çﬁ÷¬Ò4·Ë}«céîÜ#Öæì∆+
∆7@{ñÄl¨Â(Àì±ÔTÈÀÑæªâW}'´»GæsUæT‡;ôQ≈Ωì-[!êùjñm|gT0Ã‚ÂΩG≥Àß£ CØ”è∫'Ï˛◊Ò"1x∫Ÿÿ@ÿ¢˜·x>÷·ñ¶ﬂ®»x:âÎûlÔ˙y8{:åØÇ§™œˇÉÜOü≥·XåÑ§JÁ”w˛˙'	ŸíWú¨TÂµ©}b¿Ñ>^r ù¬∏aˆ8.i˘Ê_•πk)∫∆Y¿ ΩıXÑ+òYÎÃıVÛ•E˘ €“≥@F¸bå±õRd˜ÃJd¿¥m{$å ÿ	ﬁ
ê¶˚ÁÿÃ˚…£;¬(ê–2d≈7ìÑQﬁ√vL…j«òí;òT+¢ûM◊b•aäáÁèåÑ:∞\º≤4nﬂ≤¿•X††UbVq¨ß´D¿™E·¡¥ﬂEÅ´‰
‹±√P∞Z˚‘©Ù®ÃÀ_ÇÂÜá∫ƒßû/@Ba´JÒ6Ô7'£$
Äb—Ÿ‘ÏWùcT\<˜ó,unr`æuÃ∑b‹XUì#p¨≥ÀEéUY’™µqïp∞Y˚\Á®Vèví (Ñfl1HN”∞ÎOqÖ.7≤ÒrÄ≈^÷·¡˙êKXq®ı ÛÉ]‘¥•Ü[œ¨º¨È+ÃÄ—l◊ïk≥Å¨x\3–e∏à€O ﬂÙ≠’ÜØn7‹àÇâ»∑p˘y‡ºÂ”`w`’˘ç/ú—m6ú[ÎëyéÓ\Ê‹,†∂™òæäVˇ·jo}
ﬂŸs|°|'Z.Zä‚e'ﬁÕ@áO	úŸûBªD–wØòΩ#Ç£<˝qpñÙsU∆≠>ˆGI®óÌπxÛcDßeõÎ‘Q·¬U*ÚÜ¶.^ó≤	ˆ™î%ä5©œá>nvîÔ’ˆ˚'	HΩhªªª {´uE-ﬁ8]…√ã’ s]∆sêsM◊—"ÅÚ"ê¯/;⁄£öC [≤≈≤ÏüBÄ≥k+ê·ä•∏Er‹'ì‰ñïÂä§9#…í"ÿ2BX°ÊƒÑ(¶ØVßtµú|µ§Ñµ¨åeﬂÒùiøÆãÀ'∑„íöñπ§“∫Ë`1†ä˘$< 7xuôojÑ]J÷å¥dÍÔ÷ØZªØz7Û∫u∞Ìıπb_ƒêoësÆ˚Px$.Ç -`ı8Õ®e1†∞ön	F5¸©Q©é-°∫+ ï;§‰íËQ|Yµ^î3ÜV·-êiÿ>\ºLd|ØòÔ/˝Ò $íI˛ao>a(ƒõtì@8≈Î^Ë⁄XØw¯ËF?a∫&È¨Iò 8dòzàx∆≈÷»Ç}Âmw,Ä¶öt¡¶°[>‚ﬁS.|=˝P_-ß∆t∆5Ï◊ñië4É{‘Ü˚©77É‰"„ÿe[Ü5äl>dõ:ÊÚú„—ÉƒjFj@¶Ñ-n‡ªÁ∞Õkc$AcVaÈ1Ê®;∂?v6ó“Í+jYãe≠*Ú”Ép¿ÏOı^4ÿ ∑/l~#ô∫£|«‰“©∞ÈK°,/›»Yã
∂Ø‰Ê%¶m©xŒêf™*ÿcHê%DC√;NÄ(a@(Fzà32Q›ëÒ∫÷}√Ì6j∫∂o§YL(üE˝¡¯îm»ÅO}ƒ∆˜§¡ÿ´ ÕÂq◊´¨JDêÑbuPm‘Å1æZgÃﬂéÆŒ<ÆJ}ﬂîŸ·„^G:Á«Õ—wã^Í9ΩË˚∫ˇ>[”µé^æ:lV1Ñ“+êà±ÆÕz∏i<R)Whä¶¶={ü´∆∫‹˛L‚xcÜ–ú]Ê’ú]<√"˜Z˚ÕWΩ>{ÜÙè['áÌn∑›9ÍÆñXÉ”ÖSHQtcî5Q`—iç˛qÿ5aë˘=∑z.c‘∆Ì—∂«ƒãX¨U*Àú⁄†îµµÇ™∑≠™ó4îDıªÈò”Úöª≠n∑„5.:Ö√INóMOŸZL˙=òñb£Jèå–&∞ZÖIÿÉ«kÙ@‚_[uÔÁ%ãJd#π¢–aKBôSHë9mﬁe®nBâﬂŸREj.=u—’ª9¶«ç’ó`xÁ∆äíQ ∂ ∆sÿmïƒ≈Zok
 =nò˝†pzÊhîπÀ`D∏ÓÌ\GK›th>Ö{LÊÇ¥Ò|∆âQÛÙOﬁmhcoü“í…¶íÓñIRË¥¿®» ?ñX.^b¢‡“#¥á"´/™Œµ¬`uÙ_°l£—–¶∞@'°,;]4f9Bæmù2Æf;;CxLŸ,6ô2–[·xñ¿ÖgŸW•.hßZÙ£Æ-àV˝¶È˚ﬂÎA∂>˚ho ÈtÌU◊N7ŒÆÔΩ!\4í¥‹•´¯¶µÍAÁE˚©Ç )™0
Ê∏úFÅg1ìQH+ ƒÛ[0ÖX°y˛ÒÇd®ÀXfºÿYvVÆË1æ¡o5
£CÃ$úëêº˜•)opX≈(rzSL∆◊pwôõl%Àd«ÕﬁI{˜ÔπÜ&…fS~≥˘’∆W_=ÆZ~¯Ÿ¶D¬À°W=≤Z1ÀÇ∆¯”∂B~™{˙Ó:=#º≥l^ï–·ÀAÏ'£j.A;Ì“€NåV•eó©÷ä±ÛûÑÍ—µ5Tí)t&˘†è”÷∆∆œ-·‹§yö¨S.5Rá´RóAj≥$q¿O,3ø Uò†Ú§‚GH`•◊P∫F2ù„Ó	˙8OväÜ≤›¸P˜öT=≠OlÔΩJ—ˆ∂!ˇ’Ù,•H\NV¿(H¸ïoÿApÕúukÇÿ´\Hl,™©)©ŒZ…ÍyCâ◊y ún€^+%À™	¸ãÜ¢S¬±Sµ»ˆ(ï[Ú∑¥·øWBTÚbÎµcYqo~ƒ≠ÛÜÁ[x"Ì61WªF~Q.>˙ƒ
Gúêö#ﬁ2ÕΩCÉ“l=("3áù›o˙{;™D8V>q«Øıˆ¥&úŸ>ÉÓÊ‚+]<√K9QΩ?ö¡ßÜ–¸±MRÍX0p`Å?	†Äˆ’%+˛ôÄt!aáˇïî¨†Cr ` ‡ ¨‚ΩKBÇõœ:vÓi†  Éµ†Ÿ.d)§èÂsn,_B∆Ñﬂ≠ íπÛ7Ü$†óR,db:˙Ω4@æ3◊|+$IEëTx /"Ä]AE¨‰‘Ä◊¿o:èâµªëÖ9ÃBŒz?2wŒGÉ_á"Ùn"ÀÕämÎó2ûèYkwûUn˜ÑÌ–¥È≥õﬂqTµ{^ÉÎ—@0`H‰_%˛:vùÆ:˝±ÖË-ì√©Ö1eGú‘Ù‚µG›±L˝w¬™Î-ªÄ„mDAîd\
Ú>Q†gTMyß=%¥))·n(Á
™üõ∏•åräœu¸¥ìﬁX È:zu€E'Xo‰yƒpΩyu€3`ŸHŸvoüÈòÂ$:—Sº5ıC◊„t¥å%"j˛=aæRG¯´Ç˜√«ÈÚU0›WØ\ËÈÚùÖ•.∞ÏhÊ
†’]_º◊ì.@[◊ì.aﬂv¡≤8¯€y\¸7üÜ◊B—◊¿q∑ç_v[v"#CÛÈ)n£3ÈÉèjÁ6˙.SíΩ–GüHê≤“Œ4òV˜(HM·{òeø¢b£úÖnA|ßÒÎÁ>ûà∑-ˆÕà»q'Å{Gî]Å˚*è]«9¨ÎFZø⁄=x’Ω˘˜ù˛¡ÕﬂΩhÔ6°¿7ÿïπ"›°˛®Ω1j{¢ëô#ï∆¢hVTã	R⁄D¬‰£Wâ·3M¢ÛüK∏ñgÖFAB¬õl2ôî¥ë)%Ôë‰p€(D"⁄!	
ò«≈èB«a1≤vÖ..0aCiÜq—ìpîÁ:a∆@¶V7⁄ŸÖ∂~ìMæKtÛßWîCı–Àr`ì3ÉtÆ¶ÆÛmŸRµFƒ?—IoÈHª√‡#∏—hù…´%epõ‰Â>¸Kû◊?3À†^‡<åÅﬁtöa1k8ÄœyŒYn≤≤îÄÓ%ç˜v£≠’5å‚4PÀK¨&#õ`%ÏäÜ√H‡…YŸó~z¨üıj∏ß˙\?—©HOXwbë∂{©!£?’ë—ØHq#ã◊QmT·‚}Ó–í∞Æ™0;ˆà”	rU“6≥ŸCÒá"'≥¢≈Î°zÌÊfz´ÁŸ›(ç≠’Œ¨ÏI<ü™ JZ©≥3,v®KoÊª3ÿygd&…8Ÿç…Í…Wîq<¿ìœØbû»≤dﬂdQ™så ™kK6]Â,k~Æ¬4´rÙí¢õ,Wfí†≥+åXh#¢YE:õèêp¬0	Fƒ”D0¢≥`Ÿ¿VÉÑcŸéVúE8◊”~@∞∂ÓF•óA0SIñûúÈ¶Œ≥2ƒôGfrπj0¢qÖi∞JeGf2#»8Ù»[°6b∑WZhÉpÆz«óM©l“·¥úq±IL˛d≈ôäl» í≤ÛÌHó "NZ›ˆ^Î®◊¢ÊÁﬁ7_˝™}–nûF∞‡ÄAxûp
ã⁄‘ãàVˆ¬î‹ƒCæb‘Ëq+ÚT¡ıTí,Á;á©ò8’=M®QÛÖ±WÎeT¢^H≤7 WÈÂ√f¿0öÜˆXàÉ√yíuŒÇız”çòÚY8∂:`≈ÿíÉƒZ›^›⁄,èÅüÑ°πZÃ˜Ê"çœg ÏÎΩ„0yõ(⁄jŸÍ*?R≥l◊ÖKæ€⁄=iıö'ÌN·jÜÆˇ9ñÚø¥∂ ö∫ı
r.9Åw_-ΩV∑ÛÍ§’>ÈXîq∑s‘kÓuäI"´a`òsK	è°Ê—«@;uÃáÚ‡3üÍá®ıFizåátÀnåzÓx\~¶ú√nv˘ÓÉﬂ‹;lµªΩì“Å¶ìÔ«ﬂØf$ìj˝Îıß°ˆpË<≠V≥¡».±¶ˇ9lH∆cìŒR˘∞àM
*û3*öæThãÏôPö˝x9€£üÇ*ºÓº äPH"ˇ›á œå.∑£ˇTGî÷»ª…0ÔÑˆΩ◊:nûÙÿX∫p|F¡tñßó^2Uv¨®ˆﬁ}†v;ùêsJœìa'£%«gI&Æ¨wYuüÄ∑}u‹:iÉwƒ¬\!ÉãÒs]¥Ë˜™…
˝{|ë¿ÈœﬂÁ⁄Ôl±Ÿ©¢”ß¨_≤™U{e≈eÕiPIõ©z˝hKiF()y†¡Å›|k8ΩäBÙ1å£¢Bz©Â.çìÄm5lÆ≥˚¡,Oˆ¨0õXÍYÒ†0OEñûóOá§V<˝.L./W≥ÚâëEŒ≈À®iØŸkÓ4ª≠>àÉ=tÀ¡ÖDâ?zn∞™éã»êë']°]0¶-Aâ˘^õ“xü{·0ò‹¸÷Ø –;≤îåï≈úƒdÍ{(ú?˜ˆ√·•üönˆiÆ ÉIUeâ≥|≠@ôª'áπ¥Îhô_E[≠{aÍGŸ≈≈ v3WåuaÆç=ÉÉ›≤ÊÛ€7Ê≤Ä=˝9‰?$Ç{Û;
˚Á(ãœ§˛xûÜ\Tv@/∂Ω√õˇNØpH¬Ûƒ1Æ¢àÏ¬⁄.¢≈ohŒ®¥∏º±´t1Á˚Í⁄Çrí`LI‡lÕ8RüL‰ú!:çY	˙P_√á7øáw€ﬁéz…˝¬ßEﬂÕ√i~ædQ-Ì54´á`D‚*µ¨¿¿Qî±[ú™†à´¬Êd”’âÏ"raÿe«‚É‹éa|á¬¥ıs1Fπ≤,k Y“æˆ◊ûà+é•…–π/,´µØË17	_¡æí§⁄—3ù£UΩ¢á7ˇûBSöMYØ|ètÛ’üh˛û®ÃÆæ˜ΩZKHKP`◊áëÒ”µ|á§‘£∫n˛â∫≤~é)™/ér“ìK«ç|ñcã‘ê†≈S≥≠E"ÜdxoØÈÌàÙvYF∏zYTq ƒ⁄ÂIü∫àÑ#Ω"[ç„Ó∆ó€“Û_ƒØﬁUnŒÚT,{WAÙtÏ_S§‹4Â"&´π¢7€ﬁÎ‡Ê˜ÙÆ¥)Æ0ÀvIáÍ•˜RÖﬂ),JŒl¥'^—ñkÜá¶ãPòAùÛÈﬂ!' Ô'…ö´usÛ;z‰¡∏Rî<Xí˘‘—ëŸî≥Sb–p±hD±πB/*32^?fëF†p@Õ»Ï¬d=˜G‹ÌøCJ)Œ.;wÊ5œZsÈw’€mO4¨D¡9äaû,§qa‚≠cø+´cü‡EípÏ&Ωô&äïRE:†ó£ÒÑ4ÃM◊$kÂIπª®HπdTaﬁZCé•≤Ã iÌÏm{=2ë´{M≤á´#
¡9™ôæÑ‹WI÷ÇJ‘*≠∞\	v@u’5VØyﬂ¿˚mo )”ˆ∫£_πXÏÓ¬x´S√0≠ãØuqw÷¡47ˇDâ¯>÷±.®∏´wfÛ®fq=.Ê5%eJÎ`‰ïb3§å+$◊€ºM£Â√ˇs±rÂf˙HYÓ?ˆéÄÉÜòÒ¢¸R˚a§7Í%≤∑@EÜL≈)Í≈˙0qæc |Dz∑ÊÇê®ñÍ”`b¸å8ÍI≈,§ì(fá"Œ°`Ï¢Õ|◊œQ∑p4LÇY†»…1%tÖ(a,ªÏ,$Ï‡4[§Éÿdª≥RZÓÊ∑‹¡.H5e2è≠;∏Dgåõ»ß‚<π 8â	<Hqë„@œ;ã+÷ˇÇ«Äﬁ†y‚±rRdæ∞yzŸG§	Û¶x≥“üi
'òLPpX{ﬁ1‰ŒüföﬁXhÚ— .ag!Õ¿√ IQ†ô_†N‰L√/ÇŸI b¥œ	“Tj=(êUù´÷ê)XÒ¡ÿSR="t"O‘;äCÖj$!√ØŸ˙©2‡˜ﬁso”€ñ\Áã¡Û +CXÛ“ÅÄvï¢,HÙ\G74¶T;7¨º⁄´íÿ €ŒÀOK≤±±∂ùçü:≥IÂwÛ£·_»V|! -9IäÌ—”≠øµF)ì˝}Ÿ`ÀpWÚ]IvÉßwïa$X–Bör∂¬RzY#l≈Yóæ∞ö˜Ö®•p¨≥ö[Ô5•Éìiå!ÓI>	≈E7”Èuã¢õI‚hÑ)˝ïÖp‡2ú—~ÀíƒNª6…¿^<LAjém&ÏQÅ}˝&€˛“ÊmYÛQÓn]JÔN1∂€©“Ê
ìÄo
…ÇLîU°¢ô⁄Íg¨£Å‰µˆ'(‚ˆnÅñ»)öÔﬂ™Ï6¥ÌÂä∂}—§¶2s4’õlí G{!ÅRœL#(‘öÁ|¨"˘ëΩr6ÃÖù6ºG∞€“$!ê¨N†≥∂∂Œ„59vd<}ùèÑËËûF¶r}‘ﬁ›™£Z˛üHoôÁ: èo’GÂÔÛSË.πÓÒ„[uO˘,˝Iª∑`oÁI«xàD˜∏Hgú†∆∫¨<ñ^\ÓE#˚&Qg«ÂÀ[wZÛG˚©tÿ`úΩ6R‹∫Î∂Ùß“fç
ß{‰ﬂi≤IÃ˝)Q´áQÄ‹¨6*=y:ûØ«@ß∂±∏…‡a:Gà]|\4ƒ.pÄ¬a7[Ù'v{Åïre˘±∆RÃ¡>ÂâZ0éîœ1êÙ¸∂#ÈxÕ-ÕòW%ˆ#åvAM⁄$8R,=/ñ\ÉaÀ£ ÚÀ∫6N—Aè=a0º„8âaü5 fqt‡c-ßxZ˜p¶rÄ(≠˜®±h⁄¶{ÌDCé Áº;éG'PnXﬂÈåw´"( <6Ñî†Ú‰æô÷!ºÓùáQ¿“Åa>‘#T≈ fR›ŒQ?;ÎŒÇi/x?€ñxÜ`ÜÓr€Œ0 ∆üµ3?”,òëgßÆF¥ÚÄ…eŒ"§1ˆßHu	¥Iﬂz¨î
Ü]7IZ1|C_Î‘om[˙.Ëz]d`¢(håBê“¿.W˝ZÜÖaÕb‚sÉım’hXæ±Â\â√Zå˜∆Ãôœıô——Ëon≤⁄ºÀí·„©?åÖ©¢F¸	+¡)»34∂ÍË(;©”nÆ=§`∏‚KØÜ·OBò≈ç'Ák«d≤Úﬁ~ÒÖÎÃLïﬁ!óı44hπT±æ“=°œ'’ÚÎö*∑ÅGbâ≈y
ÉB∆hÚúŸö8–ΩGW±¨8rˇnOF¡˚ZÑıG©B2[nô1^X ÄØo∫Åµ™NUé≥F*£oÈ+.GÂ≠ﬂ{7˘ëk⁄Ò*∑¯ﬁsï¥¸>˚(˚IªÙ⁄´}ˆë¶Û⁄SwàkP˙g`Dsık}-H-ˆêËæz˜Ëö˜Wàd„(h÷Vm}c<ﬁ¯◊%ÁZr◊Ì«Yo≈ãb—4 V‹ïògèÒ&Oà˜\ÓÖaå¥xñ¯˘…wsº≈§p1@à^&üËÎÌÅNà›QR0ê#πY!hFÉµ<]ÿqkDv-LM≈SÛdxÈ'0tOÁ≥Ûı/+´(÷va|–Å§&ÀïG+∂‚FZDúyÂ^ç‚wì(ˆ¡„{dÙ	ËÍ≥èàÌè¸å7w›¿Ω—Û´‚—#êX§«(VUalﬁö>øfå∂UPé,Æ¯≠6B–°•®
#u⁄î‹≈9Zq^£™-·‚ÊdÖ4∆*à‡&ù0#í5/‡O]-ë+^S+û∑Üd›€|¥±Q ˘-ä£ÉCO|è9{ﬁQ.Hh{∆èÅáH¸8‡·•Cƒc‡œ¨6¸˘NkS‹±=vÀ2»ï∑'SîŒÇí<W+ÃQ–>d‡XsXJ‡∏£¡"·]–`:ç1DΩ‘ÔjÓ·Cy±kﬁ¥¡.Tk;°ŸzÁçXn∑ôäÊƒgPbFØ$±ö"]·d{Å Œ#
à$Æ•]ß÷=,DﬁÛ`,$˙-l¡◊ºŸeø£¥xÌÏìıÜ∞æ∫˘!
Gq%WÏríX8æãXâ≠4d1|∞ä,¶ÔsﬂÿBæπy\∞ÈŸ>Ÿó;Mâ‡¿
9Nå¨Ü«“^‡Õ«ﬁ$æä]˚«sÌmk—‡üfä™—
îØ’bΩÚ£y ∞ùl=É%ﬁJ∂‡i¨·LW…t(ﬁÿYÍlG¸ƒƒÿ¨âˇg/ˇJ2PBÑEº‰dsuy÷&Mwîo≥Ö≤ºåõÂAçZ/Ó˙®À_”◊4ˆ]ø†œG‘XR…*æì0íÛI¸,/î‡Á.≤0~\±Jd¸î»)4,9Ÿ¯}‚ÊI°lú-±»ÆCY"(„g5aY‰¯43ûKáÏ8≠sÙû°MLÒ⁄‡…÷ø«=uª&Nm⁄oy”~õ6W>˛‚iV\y Q/úL¬Y∞É?t§∆¬ 9Bcu9óçlE
å\P˚∂éÕ–ZQTN¡cÍ™¢ 6xÒ9◊V‹ü¨YÊ˝|?Ú«0À˜4¿G<≈5++3(bE‹0QñìÅ*µ¨ñ¢ª&ñÙn	ï©:)ÆM¬Q˛ûSˇ–Ã`∏îT[◊öZén≠\t?è˘l‚záÒxŒ‹—™ÏbÀbêZG¥ë=0skMb˛Ÿ›Nã•5[T˝¢;ª•dX´Ø'ZV†Ò¬Oπ÷Àq«”ÊSh◊ˆm†´º∏¶Ï^§˙]⁄pwNHÀÆDö=‚qÚ‚wÑ√Üπ%Ôâ}%r/áœΩx©b˙çx9ôÜÜ#^§„yq≈„ΩíúÇb˙ˆR¬ÇﬂAÁëy-»
rÏm	7D *k⁄íbïñ∏ÌEÍ≥HÁe^`íñ%≥qgBøñôÖPŒúªÎÕG'œh©÷kç˚D˙6å‰v≈˝Ï]Õn7æ˜)°Hd¿pê∂'â·JÎ4A*˘ª§E!H´tI+hΩnÄ@ßÚπÊöG–ãef8¸'W+ET†:ññ‰í≥ÛœÂ|+~&Û}Qœ’â¸Rx™å·m/ﬂE7ﬁ]‹∫-®Ác0ÄÖ@ÃƒEp‚{B∆∆∏„Eø—hëz˙Ww=˙{(nJT®?Ü∫êPF_æ>Ñá®–¸Ë©≈ÍÙWrcÿñ≈|TåÛô+ñ%<àÊ$Ï±◊≠=‹≤•6/€ç∑Ä`ˆ{˙œ€{øq˚#ßågÆ˘¿†ö7¬4ú!Ò$Ü|©¿„ƒ"ì≤h k¶ÉÔ£õZsL—;^B`qã9g‹Y≤ï∏^  U]àz∆0ÀFÛ≈œ,1"0H»”åç7m-,*f b®œw„IbìN54:Âun¿¡¡OÖ‰CÄCΩESˆ7ô⁄UÓÅzK∆øØÖm^ﬁJº¿4∑®˚Å«fpB„Éîb@¯Ñê)-ño`ÑÃJ¢äÕ¬wXªZ¥46÷›‚à;æÈ¬mG;ÔéºΩ?¥ÌEÿN°j«È∏¿v{PÌ›Óï∆◊NajGaeQÑ£pBß4íl[ÙXı®Çµuô„⁄AÛÜﬁúKı¥`ú¥HÍVL˚~⁄ÑÏFòÿ¡˝¿ËR{ú•iÒé„€a3 “F>xµV[≥Íù∑s™oó‚1i_„hg€“π¢`mŒÂ¥± À¥∆⁄2∑ùªπ‘/lëRß∑•Hü`¡‹ÇEù_ÃÅ4Z„Q˝zJ Xf\åËp‹bπ˛Úæòïz‰3ÔÓ¸¨e¥ÿyYÃé……°—˝¶bqÀ¨ÈX\‰¯Æä◊Ó]
‹V”‰tØ[Ë=›ƒ{‡
=á0˝{y3¨8Eq=úf'p0p¥n≥⁄`<8$÷ ƒqZ≠ÇE9◊@‰Ò÷ Jé"zˆÇn#≈œQ_L≠`≈Œ∫Îô©î.ΩÌ=÷0à‘d˛«0√*çzø;a
ù†⁄$3+1∫é@5ÎûfJ∏¿©_:∏›Co>{F=£M=Î≤WÓÙ[Ò—˛@;H 4ã(â⁄Ä§Y5íˇ¬w,¬Qtπ‰ƒı¿yv9YÕÒM≠d∏h+z‘zÊ¡w§7aI8¬ºRNÆk®j 8k[uÜN[Ú#èI›£UkPLàı~ÀzÁO≤ﬂEÜ¿o≤¡˙„˙ﬂK,¸"Î]zXYU˛îâ˛Î´ÁO{O˚Á˝Ï%'À‰Gñ¶ïkπ{¢ ˘˜-ˇˆ'~ıŒ˛õã¡¡&éçd∂ÎQ`°€{€≤∞é'"ª-0a¨“B„öﬁ˙ƒtWwëOKÙf∏Å≥ÿª∫p˜Ä©†l®”È¿-#îEå¡Mÿß$RjøFù∑˚'_é †¢π<aN;ππ®¯^Pr±79«‹ÃRe~LbÕ=NÌ„	}ò”@›‹XÏ3ÙéÒ&{ﬁ°Æå„◊ÿí‚2œ¢Î$ö;4äéî†m–G®—¥∑lpæ©0“©x∂˛$Ú˜®81ŒÈ‰è¬"•|bÁ«·Û[u<ûÒ1üp˚-ÿ’å1ÿh1iÊØ—4Œ{ã	Ωât?YÊã)DÂ›˚ÙÔÉ[~/ﬂ37wF€¯¬É=Û†ªN›&y≤iÔ_NE1'2à«õŸê–C†k⁄úÃÑybCù»Gªw‘ö\Í√∑÷#b›¶b∫wzGﬁÁlM“Êó&lÊ∆‰Ÿ©∏D’'
YÅl,ù‡¡ﬂä\,XkÛõGÓm3{$€ñ¢L√˙[ä˚Õ7?isP´í≈"ó©Z‹F]‰7X≈¨≠˛W.j;¿≠[⁄ ÃÂ!æ¡∞l L„FÄãŸ›»‘GÌØD¶Ù«πfûPÀÛÏWK~Ä≤uE'p00…Pr}‚vÚ—$€K¿œZl∑‘æËJ®7∏z∂≠?dπΩÌDb4_\∑±Y–,¥W„{Ìf¨L-ÊC∑Ví\lÆÀÏç©|€á±2$›÷Zπûòaº–#Fˆ≈©≤:<ÛÙãNÆóá≈}Ìãbº˛<ßz˛J<)öh+ó&OÒüU®FÓæç‘W   ˇˇÏ}Ÿr€HñËØd±kJRIqeY-©Bñdó¶mKc©‹=·pÿ ë®	 j)#Ê˘>˜”}ôËôá3˝4ü‡?ô/òO∏ÁúÃ2ÅPíó.£´-K"óìg_æD)Ö&¢
â“vÖ{’Ç5ë@TR8˘»Ù®É¸ …POäîÍ¸ò¶Ü˘"@˝‡‡+ú„,,‰j†·…ì#ãÑòOË…ô™W{sñ’C¯lXﬁÉŒ£Xã¿£@Nå
(-Å@»<&":zn§ÏY˚7.LÃ+ì£VM« ¬LtÙÔ‹Lﬁ«¢ge’‡‘U2^8∂£Ë ïÒWW•ëù≤∏œzôÓél5£¸†Èq√◊ñÁ⁄¿Ùî+& Uõt˘˘√&ëÖﬂ`™e`‚.˝†WCV`_ê±á9é)¸0A¢¬ñVÔäÀı'c0k¥9#l9ô PΩgd?Sˇ[4RÓü°Ve˝Õ‹L¶ éÔ√∂ƒCòˆêL∞ƒÂ1Òud±Ñë◊h»†p;›yÒ˜ëƒ/
Õ≈x~¢dò*ª¬ùu¡f^rQ‹pS_¡)£_I¯‚Õ~$∞x‡…4ÿıÃíÏ!%‹M*"ò∫ùùºtÔ3∂‡≥Ò¶45°"	ˆΩÿ∑l;çÊEH•0Ñ˝ “2ÁºåÂ÷3m˛Ã,ßLù>·»C≥zrbSJK3
Q'Dbÿ–∂¡©H©ƒñq¢Ã%1¶Î;AêÌß‹ºﬂ¶∫!^êcº∑ùáÎåª!¶ŒâÛÙ8Ô≈7mp∆q	˜€∏£∫…˜VÔíÊvª´^∫ÃÕ Lf/ú´ä$“÷Úø†≤Ü*<â‹˚fp≤Üí"7öy(·WeJ–‘ÿ»;r‰ô;xÌ„Cñ¨ß	√ØSº“îh‚N %âr¯~°¸•¿"Ä&·aƒ·à2PÃp$ZÕ7@p” @¢ÏV
x¨ä	⁄Œ`§"Ñ‰∆ÖHIªYﬁ¥Y≤˜.yn1ˆ∫Kº¬pU–VÑ%.Õòk)(Kê÷eqAê»Rh*Ö•(Eıa™:ªYQ Òn”O®˜>"ºâÈ®
ex¨"Ä%bb˜Ã–Ã,Wò'È2áASÅö7@õdá–¨yÿ£∫ S·Û˛Óù˛à§ë;¶¨0zCøDˆ;˘}ô∆¨6⁄MµOÿG¯¨çi^ –èVÌÊPûb
h◊‘)<‰'%8Of∞æ Œ.º‘Æ≥KÀ√:∂zWÈ‚ª»«∞∂ıÇa¿ÎÒ§lCÁ"ˇ¯ÏDÊ•nÜSœçVWŒW÷ﬁ¥ﬁ÷ı¨C$2d…$¡KˆíålºÙ±f).ﬂ	Äp'$+ñ€‹ëˆAÒf/√˛*s∑Õ(aŸSœ∑¢’‹^„µ¥ÿ4Œä†qJ¯BÁﬂ?É≈úÒ,[™Á∫ù1“Òﬁœﬂ◊◊Àx.õFFjõÛJ±î/èY°ï+íµDŒ#Î¬~ìJF∑T&J≠˚jƒøH"—RÉ§ÔΩK†‚›œŒM¡É¿˙éÚÎËæõ/O^ül3Ω,‡>≈«ù$C-;è?¸∑3≠Tt◊P_ÏäöÚ]7ilÜ
UÂg≥HìÂ{ˆkÑ,Ô–Sﬂ&¿[”
_eˆôseh$ûØ-@7Œ§öA˝∏IoP–ã∏ç¯€UÄN:· ’€¡‚z"Nn•ËÎ‚Â¯€ﬂÃij õiËÑZ,}±„UC3Éú˝\koé£Û˜¸=ã†“&}ı-  Ÿ"`‰ßÓµcØv÷Ê<»ÑnÀo®∑ﬂ–@÷:#∫+VFÙ˜LhÀtXº©ˆ∏F˝Â7Ùx»yçw∫F]6?Q©ﬂ¥¶¢◊x^Æœáé(»à—[º„V“qº´wî_)◊1cOÂÁ;ÿà@1¿AÑ*vÏ¬pÒé«—°’È˚¶Lv∞"KΩØ‰eûIﬁGÍ«ﬂÜ*◊.xãÛ«1≥¶ÛÔ…›∂/∆Oæ‘Ôl≈î\ÃêÓFù!ÃÒ˜s◊Ω‰U‹Ä”Ë#¶«Ry∆®
Õü√Øë•7ê‹aòË$«X£ö‰{Ä4‰‚÷eáì${ –u®˘cÏè±ï%çªy=.	’wÅËÍ–º$+PºÚú™∞ÚˆÑ˙Kq·ƒg!Í«Vú°Rô,C–_!º§@ƒhÁDÅ%¥@–:∂ı•Õ2)àÜ€qﬁU~TÊ[ÓCúçì∑•>UèggëH´p÷Gá«1cç·î¿YÛÂÒë´éß[¬X|Åsÿ⁄%ù[¿^≠ û”]Ìw“u•ß∆Ωí»E0É˜+âéíPx'ôLûx›~gE˘õ!3«	åâŒf≤˙Â…7∞IÖ|ÛPKët©.™›òÊ_7∆ã•!⁄îbDæ zs·GÄtË„äºÄ•∑Vﬂ«FMœﬂ·ìÔìŒ7Õd¸ÊÜ2µÆZ◊îO‡„Í'Ëıüp«÷u,Ÿèp5ê⁄>V˝Çx;Öõ
”ì$âœ0‡'IR¬·=ﬁ¨¡»aîd∆'l˙·ø√Eﬁ[Å)Âª…Óô#À≠Ôœ"¸·ØË&ó:gOÑMå^^›zrıVc>3í]ëYÜ•®¿“a©èöBS…´-^Îß¨WLå¨w<C	∑˘ªcÓÍ§˘≈eﬁrnÃoñ?î/∂ÇHô#lfö*!}N—¿f´¢[¶˛GTÿﬁÀï¬"^0£†W±,Øô_",z&ªÜ¸·ˇNÄbØàjÁ´4˙„I—ÿâlyªcÿ£∆Mã“-∫G±$ÅzFƒË™Ó1ûÅd+ÁÌŒv´ˇÂ˘ºÀËíÁ·å‰	æxòî¶0Q9Y≥”˛û«…∑“=ó£Y‡HØÆäÄÜE~ÙÊo'⁄Ÿú˚iïmÓ7î$ÉjÔŒQç‹‚«È·™À~œ∫EŸps˙yÊ|Ùnn.—Õ˝…ÏN]|
‹¬ø8VP–À¯ëÖ+û{g¡6 ÜÕ·+–y7Øª∫˘¸N≈ŸïÖ2¨•)ú“ÔÅ±C”ù€ü	Ω )jøëº6ÿ∑r¿„Q¸ï˘[LÇN÷ã˘˙∑∑Ä.ÊkÔ?∂ÕﬁÔ#*E"ﬁÑˆøΩ-CÇøÁNYí»£‘ä$Û+Ûe:ô?ÕÊÆf°vE⁄KñØ_¡Cÿ~‡OÒs(º√“TNDÃ«∂s%^÷ÃDÂﬂÂ˚
@á´˚ØmK√‚èƒ~x€ä^Ò+YSVÒÛ‰À¸nj-ô∞ÍÙ¯œã∫•˘√m'ÃGû´xqsr∂0πeW≤e≥ƒ™W9gmJ¯Á…,¿Öè«zçmˆ¶ÙÒ∏´Ç3›N5Eß<ñUx∆Ô'õ¯Ω™2‚∆7f°tb°pBÈóxπE2ä¢T¢l‹∫—,∆çÛ∑˘i	|•Ú}\y.pWÈπÕÉåˆ'¨≥†Ûñ01Z®DÈëœp&,*VFPõ+üπGã≥j¸´/@ÍÕfª∏`_ïP ‰/ÙΩ,Œèîã´¡î≤rÿπCÃÚó'¡’iúìÿ- ÏâXπKvØJB©∂)öÙÈïkÕU¶√¢ æ}π±Ÿ)Ïˆ“áqâ™ä![}zbç˘Üi¨úpùÊ0åu«ô…#EÉfoñΩëi7DJ©ÃuÓÎrçÅnÛàIëÛÀÃù:∫NÅ_[`∫2Î…ê*ÕdÙÁòá5æÙ/-vDâºÿ>**4M‡B≈ﬂ00T_<ÙE+¡ <á)Àˆ‚âo£ ˇ˛ƒ˚◊oÿk·ø(…!O,f˚´÷FÜR®\z.∞‚◊™R7~,3√ÚóÖÇ;p
+¿.Z?'òÌ÷Ráâ\é˛;Œ‚fÎŸÃS—@ù+ﬁ
M§äÔ	ﬂ—¸®Íæoo„
ıÛ‹2Dqj…Ã*õ∑3RÙJJâáT“ÅÌìWƒõ1ÅWû8ûWÏ‰ôW‹âÌ}≥îìC9Õ6ø§JÂ€O†$	‘·«ÇJ"¸P'K0§ ÅLéºlãˆ§tõ¨ ;
>Ò#ΩcÄNYÉ—™»∏ ù`ÀLç‘c¢”˜o krlzËÜS‘0øÂgº∏›·⁄\⁄|àN∆Jﬁ∂z|®\smê·
¯{e„w»>°Ç>\Ã#Œ¿ù∫(Ù€“c≠ÂﬁAîøEU»dU˜.XÈ∂ ˛≈#ÑŒÌ04%e¥p0r0%≤˝f5_-ëÀÂ\73+±£≤‹F¬UÃJå
‰7&0øÕ°sX_ûx˝Ü˝Ôø˝Â/πıeDü§Ωa‰»l3¡C∑õ–v¿é4l±X¯≥;ù:ˆ[¯ûlj1Áí=Kπ>#”ã≠Â˛˝Fé#±ıh˛Ø¶⁄6¬≠XqT∑»T z!JÖÕg€g è»˜•G3â‚£Î◊XN4‰!ŸÄ|Q÷xıñŸ˝:âÇuôÕªÎÂ\’eVm8˘W?8ﬁÙáYüÆûiø]€È[fZÊ7’ﬂ∞ÿq«ﬁüL|‡®¢5=vhæCπl„∂^$ø‚$∑u&ÛQ÷’‘¡Xr«ù‡]?M~—ç¯Ö”‰WÑ≥÷„	Ø3^ØZ¸‡Œî‹jÌC'®7)k∂Ü Œì9≥Îô¸‘uQ’
∞h%á∫@©uE∂´ƒÖß|¡ÈgBEÎBT®3^&g[´vSÁf^ÃGﬁ‚øDµÂ∫©s]k$æH3Â  àï§…êﬂ]QhÃªuŒœ"8ÙÒ√O&û;Å3?<èü<ëÁ÷ƒ?M¨> 0∫µØ_4‚=s0∞lˇX,„)fQ§,q|Å/øÄX∆¡$Â=t iLÄ|JªHè°Î5!;ò<ß_’8á:%>
˚•~°¿xÉﬂ˜º‘e@ÂÁ˛œ8Èp∆ÈTäÄØ”S˝Í–Û˚|√`πj˙Ú≥‘%7<`AüÁ˛‡g1Î«©K¸ÂWdÌÃC´(
¢+DùΩI«•[î¿„ª|j‹ rÛj€1ŸzQ.¶¿nZEYà1 G)0(≥¨È‘WÎ-g1)AX¯˙›≈NÇm^Dd«v/yj‰ÄvkË	ãÍ 'j¥XÿË{÷‡gˆk„Õc:ﬁ≤œπ¶Ää(±Kÿ¿º)N¿~öÖ0ê˘ÛÜﬁ˚ æfAËçâ?q D—y-)£¥3U{9◊Q„ÕÔ..˙≠VÎ-£ü◊«€t⁄ÅÛ±Õœ7‡ú>‘˜=DjË-,r„
¿	'‚#¢;∏úÄ”Z¡Ï¿ü6¬Ë´∆õ÷ª÷ª≠Èıª`ÿ∑V;Ω^Ω˝h≥ﬁ™∑ö[kok{«ÁÏ¯åΩ<˘;€zƒŒOÿ˘èØ^≤ìßOŸøú¸¯äúº8˝Ò¸Ë’Œ˙ThgÊïˇ‡‰r|3„âô∂í§Ôåf¡`D0s5Oˇ“≈ ÚT‚{˜6¶Œse‚RH∞1jÑÏ™q1Û<ædE+E…÷›KáM.<òíÎ∆»µmh"ær”@Æ	A‚ÕÔZÌGÎ-õ6:∏(”∆Æ«¥±YScÌpîr›`aìuÌñ¿Ì∆{DU©HÏ«@Ïﬂ›[˛wÆíﬁ›[Â«\oÊ∂ƒ˙>Ò}‹˜®üŸ9õ¬Lç¯V°„)R´›[}©oâös,Û~Óå≠›[•ÙÃ £W‡"È.~∑Ÿ›‹ºhØÃ9Fy2‹ΩòdªÛ–πDƒ¥{Î“Iød;ó+x…çz?…[ôIì¥2Üg·•–≤¬3¿E–…PÈ’úP,Ø≤{;‰åˇI9}÷pöTfVù˘,Y}‡FgëK kÀw8ä‡/ É6nÀ©O%*\«¡C@ ›–ö6∫P®´N<Ä,5±[ıÁöæäÙ8ßˆeüÆ‘4Z¶98îxCÏÍ≤3÷bûsÅhTl√ˇÔ(1Wø¬©©L!Gu`XöpH%®9ú)PfÍk©ué∑ˇØçv‹€±u›∏jl^cøiiÒ¬®ÒŸ`÷ˇr‘h√Ó[{ããùΩ◊·˜∆	⁄∏
Zá`AGBø}o2ßÒ8v„MßŸÉ˜®…¯ZW^„»üÔ˚¢E˛G4‹iq<óû^âˆI[◊p'ÂÊFõˇ·Øv[Ÿ…NMëhÃr∏æj¥◊;8®!»≠HÚ PˆÅ‰˛∏¡µbç«≠ ≥@o@2Ù
=Ï˛¿-uÌ÷Ñ)ÈìNBX%ÜÓ;—"´,ä3Kô ∆àÒA2 ä'ñmËç√ıÁFvå‡´0 ofÅ∑∫2ä¢i∏Ωæ~uu’";AâÜçdjbd^ü¢1;òÑÎÉY√F&√Ä j‹ËFY€À e˘n®Òy&÷dΩG”™Ù©Ùgt∞á∑LÍ.ä¸±iò4SSY
ãòèö¬ìM6ÓÛ_7ØMSª Ó-ÿº?®ç˛U7TºU⁄Õ-⁄*˙€ k]uˇàS®ΩVk}£U∏©äòözd¬Ÿasõo¥v´«Ô∏»’6@@+Dm‹ÒêÖ¡@#µ®óvﬁâ¿ §∑5	ë{“¿ªa ÆyÅK
ø {ÌÏÌ÷˝≥ŸÓ"H÷Ê˙¸jòπˇ≤¶Œzh,‚ÿÆa‘”nÌLt·ŸÒÈ©Å†(√0a!≈ª_,Ç¸ï8U÷™∏√„‡ã¿â>4ÍhﬂA^9ƒ"Éú9Ó8@C1/M'¥¯⁄¯Ω!3ÿÅÄ3#dtNõs‡º<ÂÇÓ‡!Ápß¨ÔÌ¿^õ®=t#ÀsºIè˚§Ïp˛ÅÁNx#çt$‹·XW¸⁄Ä_=&o@µ=¬3ÃØ˝˛Œ:ˆg¡îÆè:ûòfÁ∫œG‹”Ù˙m<Î◊°`H“öaXf¡Lf¯M´Ÿ≈]ç/(◊6µêån}´≈∆  ™Å≈£µÉd¨óÁ≠«¥ÒL’’yò.ˇE∑FÌå ∏°ÄhŒ;Ú«f,˚—‘)†+a0b˚≠Ü|SP]0 8îÊ3æw ÷¨Sƒíπ†ä9M`[ Ó-ÇUÄ—vŒù¨®ùl ∫D˘ ‰D√ÓW∂#Á√q<ÀHHQm†Õs»€ÑfEyà°æÖ2Q.¶.¿ŸdÍıb¶S,‘Œ©D3g"rÄ4çÅΩû6z	qÌ©¢Br;6ÂOƒ¶:ÒÖií(˘‰MYŒæpm8@”)¥%WÑñG≈îc«vg∆%È‘ˆj∑¥Øù tö¯˛ºVºwsA§€j-áƒÑB∆ ˇÛØajˇÁbûøh,9n◊œKM=ﬂ?;;~z| 
Jù¿ÈÒ˛svx¬ŒéœŒè^Ï”cø_7˚ˆd4*àG9>Ì1H8ö√;UÅ`—“Pb‡¯ÖÇ‚ﬂî}‰’WΩ7V`ß˘-{∆ùbêiê*8Qùµ∫à(L≈x(ı»˝£ÛÊåˇ Ëö3]4ögÂº	= óWàmﬁu¬w@ `√üE≠ïóa∂8OK¶Æßê‹˙∆"é*√§∑ëIo&Ω›·L:¸ïNïHe1G-e¶Í'€=UA)ˇﬂjv÷HWÇÆÔÑóC˚0Ì÷@Hˇá98≈Ú“ˇz∑÷b ën¿5v=ˆ&·.1€B˙ªÍ6˝`íh∞ƒwÈ€ éòΩ[{—ìµ;ÕNo–j4m5ö≠Gçv≥◊m4;º¸Cªsπ—ÏlézÕ«ù\Ö«õ]|¶ù¬·©6Î6ªÌÀNÛ—£Q∑Ÿ{4Ë4[[»„‹Ël56öè6¯ŸV≥ı¯◊fƒˆvkø€Ëlıûn‘
(∫π€∞öù.|‰Ò#òú^sc≥—|º≈·:ÕÕMØÅùh`wx.a/ª–Û÷&‹{‘ÊgùÊ÷&k5zÕŒcÏl∑±ŸloBg{›:Õˆågk„†€|¸òuZp>àa+¯ıd›ç˝≠^∑˙ z–:ko¿Ñ‡¥vÿÀf∑=ÈÚòƒ«a≥›Ö+]y·ı#X!Íﬁ^f[Õ^è¡x ˆ:¯∑‚’nsÆ¬Cl∆Â¡@mXÌ≠6|ßìt˛Èì'≠ﬁR+–kv∑mh÷†”âê¥Å∞ ◊6ºn≥›k‡?ÌGÿÏ;éñ{	ˇ‡l"‡¿ÙBwafõÌ«Õåﬁ›‹d8˘ÉÊ.„&Ç≠ãW(¬—˛F∑[j;∏GIÖ∏ã1‡ØFªÃñ_®ßHÎôÄa(”05>⁄»H9‹
ì‚[Ä9ê|B8ÆÌ‡;“/ô8_JÑ¿¥nî¸∂ëÌÊÑe#ÊQ´,ä‡XTn…¨∂ÅÒÔúç\«≥Fp3°˚´≥{€ÓÃ3ﬂ⁄MüH`œà≥œüŸÏ5
ÿÆcóë&i8ãa†‹rRˇiõΩãÄî.,π¥∑o⁄u÷©≥nùm‘YÔ-yoRò1∫ÇîjÇ˙{ÜØ¸Ï‹Ïﬁ‚Às9ï›ÏTæx·-Ì1Âgë°Æ]oom’ë
nÆΩ-‘∆®«⁄Z~òô÷{#åq∆f´ƒ∆MéY2®Ìıö-∂Œé˛|pÙ¸√ˇy	ÃÈ}√Iéëtª›6qÔf!¢$ÃH≠Œ ﬁﬁ¬˘…π8è√Úe°Éæ®”ÅKTë¢é∫5ΩóH“CÓΩ√"´Ô#h¡cãMfóŒ∏…ˆ±x8ìè|¨eÅ,@0	¸[Xv ìíM?r8Ç¯¡‘(¨€,#ÍS\ ïXÉÍzè•‘’ çl©§ííöÎ•UúQA†\9~m0ÏÈ"ëNΩ[ﬂ‡Ë√E‹A-BpSäÿ-`°∑8˝ò3–èS¸3Æ“Q4• k-~mW⁄KõòB¶Ok±ï˝´–Øx◊ˆ†«|•
–GE9$g/¶ÓR$´p)ù–ô\Rêö∞m¶™÷—êL·bXπ@y
ïÏß˚ÁØé˛»NèŒŒNˆkKº<‘õ.ed-Ço∏õ‡bÃ¶/:»ÿ(•ì{¬SÌk˜ad´`TªìaIS©ÈùW}[`>∏¢Œπà≤öÕ’´∫ﬂ„
„g#Ø≤xÈy•ÁMa‚j	WF—ê2Ørªﬂ•ò‡å¶Æ26-®õΩ∆·ã•Û“Ü/π ò÷£5Uw':p≤ÔMF1∫5ÁV)Ù…*˚⁄“ˆ-`b∑ŸŒìôÎ!ıÔ‰© ëﬂå\gkÆ;ìñª∫tìÿe‰ùQ∂€)«1âgª„Abúè96nÌ“m_\FRWIFÿ÷¯∞Á>¿BmæÿPDù6¯æÂJ.ã¨Çôn∑˙è∑⁄oôKNçñoëÔ÷EÎ¬æÿxÀ¶◊„”õF˛»4∂S∫Ã7øÎ˜/Ÿ≠∑µ=4y¢d"O“?¸è˝ËE€Ï1Á‘eª˜Ä,›^Q£nfJΩaBb5ó¡d·Åy¿µ≈˘–◊ø∂∑O˛˚ËSä^i¨l∑ä	P˘J/E—M"Ú1U˛.7D˚Fà°≠6epCn¡=”mÕ0¬Âj◊_úí^˝dõùf»≥[@vÉÄXy´è›u(æ∆ÖÒ>b¡KJ
å‰ÚTÓ∑ﬂ∏·ò}ÁdU†Xﬂ}W e©¿6üﬁ6π÷¥5›{IÔjº?ã"¬0Únçˇ®°´†Á~ñ~Ç∑Ë)¯MË¥∑∫Bf©ïµ?p¬ßnF˚<Ñª˛ÅÕUn˜ˆ=W‡‡Ê√=àÃ…P–,$(p*«É6zùº’æPå≥oπ1{&Ç[©wò"VA´¯|≥+ö√1%åH+ßn ≈G≠÷ ¸˝|o_∑∆Ì¨ÛÈ∫á	÷ßW÷ı¯Ñs(∫êùDgÏñgﬂaœ¸ôàΩ[<Åõvmn∂äÌçÖq~ËÓ
XÖÍËÜÎ∂÷sli;ƒ◊¯ì≥YÏFª∑qËá;ôS¯TÏ:[Û/.j˘›^çK}Ò¥ŒÛâÿ@ŸC0Á≈ßùÍä3Ÿ-T”H¶ø¨÷ìí§óê‚å$!!áx§7æ"w˚˛¡ ˝ sº ÄQY€¿≥‹u≠‰0Ú¥dè+9‘:Ü‰ÇHP@g=räÌÚΩäßÍƒ†“ñõ/|ê∂`F¢ë;ŸN#*e€Rr(Y—6≤¢Â;ÌN¶≥(?ÖáÈ»≤’1ÕÈ•-¿¸2:©dàî@T»zy¬Và'l‡i¯!À':É˘ŸˆgqvS¡/ëGÎÜ˙Cëz⁄-q#„Oñu”X¨Vm~®¸‡›	vsa∏v∏}∆› àg æ™‡\;∫ﬁfˇ‰Øé3◊ª¥jÜ*Eáì†∆)êﬁ+∂Ñà2mÔﬁ::•«WoõÕf‹<èf⁄fN3≤Ç°5È˚X∏¬ΩXç' ∆ü§1ë/(Œ¯‰/òÈ	èë"°bWü‚ä&L…≤ü≠¯’'ﬁ,Pıπ;v W„ÜOq6®Œ`GîTæ„Q÷DXN)éGY«‹ô^„Uñä˘“LøÚ<)~Â ã©–eiA„xöò≈XÑUà7‹	ck°ˆ™vßI[M™¬ä§ÕìπãÚ∞8-»Œ˘åWt…S)Dù&w,jõ´—,Mw2f ¥ÆÆ¶fôJK§JÑØ≠ëy\Õ •-1 òhzûœœÁÔr>Ñ9gÚsA<≈È◊@ ﬁê,*Á am%œÿk•˘N±–}}≈Q§Å&#âª[,À⁄ÍÑ£‚
«+-Y}~ÀoAyîµ¬UlæD´K[ûÒÛgO-œ∫¨∆>Ì∑xÊLF≤ãß~Yﬁ'c1Bı∑¿.r˘Áˇ
vmE^Í+ØY|î„5ˇÁ_ˇ›¯±õ˚‰9“ÆÆeﬂù›ƒ≈æªYDÜ∞ı,≥Y·{ïùZûM"ÿ∏¢=™Äm„ˆJ*òtE1√Y∑î,rV>äNG^~dƒ:{ß¢Ä"„ä‰ÔŸA‡:
ZøÃ‹f9ö6÷OB≈´ 8Å•Lñs&PGFñJ°aGã9Z˛[ÒÊ∆
kÄ§Gÿ€˜õÛ∏ÅRuôN‘ïTß˘ÅõJ‡FY”c∑E§ÿ‹V¬ÚàF«Ú≤ç)ak®?,µ˙ vH2,?	æ:9óÅ?!/kÓUál’[ª≠ÆVl˚,ÁYJ1\–“L€E≤[Eí•CûpÅv0◊ü±ì´Ü«iøúOun¿¶¬Á∑•C¢∫ƒöoÀB_ã Ï> ≤ ´iª¥‹6XÈî	vH/|‡œº“Fk^Üvî≈€\Æ)vEôPú]8n§Á”ZlÜ£OfMq“À∆hí´Ìù†!krÔ¥DOÖ˚gJÏ3π¨1≤ .=“8*á≠}â’òZAÒ®`*8Ma”<æ0që¿ﬂ!dX⁄wﬂ ¬$éR	CûH+Íj¶‘fª9ÌsjH˙ä∂Å”RôøŒy¶ﬁ⁄ﬁK ëùqÛÃ2¬Ù &ærk∆B\l^ú◊_+å»WÏ5•ö«¸Å‰ô∞ö3
JS?âø≤ViD%˜ˇ‚vûÚoû'M·›ÊI“ô.– @ë@D§øQvcÂJ…›qÚ«:;ê÷¯ìÙ§),úJ§ÜÀ=‰√*Ñ#Ê∂ß+±∏òÆË$uD$üÏp˜äEn£…GÀlŸ8˙nò}#Åås•Éê¸7@ÚgØ	qã¯áù≈>…•7Ô"¥® 	§‘ÕxUK'üL"dÕ;∫∂Ä¬9å8ËW≤„Ö€¿9∆¡&ÇÉÅ6ï£<•eáá∑ùﬁAF≥&l—~5çVEùŒ›T2\#CW◊¥[tKjß‡¿U•KÌà™1ô‘ ∑$‘
©H(]˘VLˆ¥ßzì§ËH}SÂ!qŒ⁄÷Ñˆ]mcyÉV Ñ∂®Ì*ó±íô>T›TVRØsöøà⁄”"∆Æ÷ógÏ2Œıß1yUÿàÛW>ÏÊ⁄¿æZ¿¥„”Y¿ÓÉˆ2íüÂçñ°˚\∫¿À&a·cíˆ:õí≈ÊSA©Ìõj«dA(C@ñÖòa‡⁄ˇAUx8ÄÎbßQÈ0„{ Bj%œ´¯÷/√^gÖúx% §©Äòÿ	?K`$Yci§∑ó<ö™
»ısÜë„D∏øê»±.6qtñ≈oIö[ƒiÂu≈J.ÖG3«Ës®ËV±x;g¡b≠ÿp‰áQ-›kdΩã∆i◊u¶$ÁÄS€{Ì{∞@Âî[9síßy≠Xó'˙]†∑S:u@ ±”J˜¨L¿⁄ı\N^©uT˜‰ÆzyÚ˙dõ=Ò#Æî≤yΩ-ã˝Y2ò}Ã®¿ﬁyj°å3¯9?ôï∞’ÊvV¿‹ß“ÄY8=¥ºû‡Y‰LW€ÂÇÙ«y¶”P\Ú=·prVˆ≠PM∏/p≤cÀΩµËu~ƒáüÕ πµCÓkÍà,‚Víçm‰d⁄J$¢$±eè¢ﬁ˘>U”ÌƒI!ıl ˘GÒdH"ÈS6|≈ù®¿ÜªÙ‰bÅN4ﬂ†éQ}k0„w“£!|Œ8ﬂA5á ªzæeÛ‹-±ÉX^ ,jtµbò˛%∑u*ààîÃ±9Bö…Õ("œ7° R.´¢ñˆd’¢(Ab›”§Öõ‰(¸eÊúôPTOU_ƒÔ…Xb"‘{'È1·¿|'»œ–ë´÷.∂áÚ˘%Cè=ß|ø%$%õQ @∫(°_ûÕwõ!5t∆˚ v¡¢"’ﬂÿ¶ê˚ä!ı±F∑ã¬Ê)=V≤@√∞‚êvÛ ⁄•‘)¢^äÚS˚{ô¿Ÿö∫Õ_Ç–	 +P⁄ÊÀˆ:/Â⁄¯% ©—v÷øß=ŸÓµÆ·ˇﬂ°Dª˚Ì≠3¡{?æ:Fı?p¢ìhı
v®’Ù|é⁄õ£¿πXõGNXª≠çG[ΩGÔKÍÆ)¨˛ü_¥¬~„.≥I¨UI-∫ûÂ†√F¬Û
]0yé¿çTP~âñpæ%ÓÀ8j“{%™·Õt)‚®2lcMGTÜc‹ÊÑ£UtVYgÁXÜ'*ó!,ﬂ4óFoäïn˝±Óª\§ß&6
÷rÄêi≥ÿ‡√øè—ägsãüax‹ gı7`~Ïòs†œK^Oú}¶a€~“îFyQß	?ªCaW¨I#Ìò‚wB≥±gÃó=r<áåceØê %‹nÁ∆èg√«óÒL]»,„°KlÖèﬁG‘x·å¸„[®™Ë9æî6w]]îjBÏjù)À$ÚÅLdXHb 1q¿>)}« yïI3îN*,R` ‡#ˆÏ«„}¸{¸ÚÏ|ˇπH)|∏œˆOO5x$Ûö*dama±≠8ˇ»˙Vè Ï¥©˛Uât5%
ß,e¶‘EcüË&ˆ”8ı∞4ëkyª∑∑≤Æ«6k’yAn8k>Ó’\Í¥Ú§—)≠Åv‹@õﬁŒ}Ÿπ∆PÙe?ùÄ6∂!ì#„´›:√√€¨ÜNfQ-Øìï-^ì⁄–jÈ\gkˇƒa4E≈7‚L„õ∆Vvkô∑¬@¡†—≤âÆÀ∏8+¬°‚Îç∂Ú“U/ìjöWO‚ı¶–X‹Eﬁ©€QÛ≤kÓ≥çqÄ9ÒhOÜçƒ”UŒ
æÔGhBVÍ7u6ò^u%”èw†_•üäôî≤ŒYYzìSLœ5©–a‚W™÷ƒZ≈⁄y÷-mbã”t`&ƒehÕÒüIø∞éK°TNèîJÀ⁄…¯ã{ïvÎDŒTÎÁ∫L°£f£≥ë’l’ë£O57ÊS-U*≈òCU∑˛¶ÿäÑ·ËkQeΩûí≥™ùÖç!iU∞Œgñu∆ú ˘Huy∆0¯ÆwRŒÎz‚∞1Ÿ9˜C™\Ñ|;«™:µA≈^Ï˘≈⁄\h1•p5{.)Bá≥¿!·ƒöz§ ΩTT—ó[l¸·o◊Á≥`Ch¢◊˙v–‰r†ñ∑@ßì{âÍêzÉ¸h5£÷™ßªé“µ(ü)ÙÊπ;Ain2ô›œ'≠y“∞Êß/¿®ˇ√[Å@˘˘x	‰›¯ﬂ‡é_˘E‘Ùt¯√ ≥ÈîÍÚBÃRjLŸqt≤!†qïänèp·∑C,ä<’2ÿÊ26ê∞◊∆x≠÷?`®U˙Vom{+[=¯ª¿Yp/-‰NYn⁄L˛(woÃ*•§&Sê¢fH)ÏïÍFÊ=fô\∫Â“·¶—¥AÕr∆∑∑Í,Ôâ˘7¶ã√å·Z`Òî\<ê8BúD ©†•µ÷iUÄkó–íîSã)ZF⁄&úrPDÈ4Ω:LíÂï´@ˆÈ†“MÎ`πSê⁄Aç<„æÄÌ|é €˘ºˆ•FÓ?wò]ÕÌwﬂ1◊l^Àt˜ÀËÓÁ–›œ†UÆº8/q{Q≥'æ}C	^±¿UiÌÍ`§[O‚©+V§ÄŸÁﬂiÄôﬂcÊ∞⁄ïÂ.J∂|õe∫JÖ,‘0¶Ù`ØÅÏ4mó4∫Â®(ØÖj∞§ıœ¨¶ºÊ …rmò¥ï–@#_Cô>Ú5ñù≤M!7sÿÂsU]‘Õâ©¥ÀiÎ"VÊ¸ÁHB‰Tr	«oﬂó/D(J»ú'C◊ˆéB =ò°C≠Qiı-˜Zÿ≤~ôë+C"‚COCãù CıB‚óÇôã—Çá—‚æÙÍBœ'ú:ÉJ‰óﬁcÂË©<»¢Å9ﬂœ‰AÄ"v2≈?ãÂ¡¯s≈é›mL≤ûˆÛ.a.ªòXD◊Ö=Ù ÎñÌ"uìkÎJ?èG98”Q…/ŒtùﬂV¬xV¯£•èä…U6Ö‘∏±-#à´S‚Ä∏B±BVÁ◊∏£ãû*,ì„%f^ﬁåGT%ì@ÏL÷Y˜◊ŸP0sn¶√ˇËy08WìˆIãô%Õ9-∂ñ"óSzb+¶+J≥ãjVnBr£Ú≥4‘Û»ƒ ]…Ã)ﬁÉ:T”æƒœuR7“È´S‡Pñ‘∆üqAuÖ‰l‘HıË´j‘+~k‘À8≈$¨tä®—O¨‘[€3ª≤ÙñË@≈\&Ÿä¿D’}C»≥Ûªaù</‡]†S«õy∫f ´L›Ÿ˛ƒ|@˙˛åÌOßû√‹ì≥Ú‰*@ı•*˚ïÇU„æ©g£VÓ¶“E∫i‚ô^:{D¶GZ…A›RÉ9p~vo∫ÂK›iM/°X%@q°ô,} ≈?t¬üa≤£tﬁÊ£ØJ‰ı´xø∑$tw`ÎÎl˘ π∏~ÉŸéÆ®¬4∞„ë5tX@F16q;düùú±pÍπQ¯[e[‰ö*<ã‚_•™SÚ9≠Z’ﬂ√¢ÕœPÛ=˚òïÉÈÏÔòKAOÍYD"È:yü~¯k‰züîQI∫ƒÀzÜ∫ë~¯k‡Z»àx÷Ä)¯≥≠âÌ≥?ë8∞2ck ®ûxÓNf◊üîMâ!˛Åy„V˙ ¢(≠WIØZUΩr6Î3_ËT‹’π€≈dÇ®vq ≥8˜ŒÚVVº #Gü
ˇ¢¶"·Œ—´9}Ê¶ÏfTÒS◊
tZiÓ 7∆e˝Q	ÁyTƒ&ôpr^ëO7Ú§≥_n.é(?BÕ°{·r%§1;Åw`v˝âÂmW2ß˛⁄·¬qRî<€ñ¿$ÀÔÚXûèó«ù˘yyÿãÀ…ÀpıŸf%OæTS∑î<ÃU÷∫å˘(ú^*∂ ·∏\gI∂<Ê!Â‹ä¿G1ø}óAI®êBc^‹ƒé*πN5ï9(>âòULmïXny,IÇ≥¡Sõ»ç∆*ö’3kŒ&√ıìP‰pm	J\5y¸ÊﬂÔ∆v˝Î¶~†Mçsõ⁄–õŸΩY∏°7ø‹Õ™˙^ñ:V∂ÍûíMÃ=µÏèµï+≤‚;Î	Y:MYyﬁö‹∏—#‚:b˚ûDKõ-5≠ÇV0%ŒßûÅîıÕVF:çuLUí
°x4ò¡Û∑ÖÕb@m‚ﬂ“/üBKv‡ôÁ˜≥Ëñä§r‡áöß˜±]éÙ É˙Nvzëõ†(c{•y8«>„æ˜Ï√≤∞Ã(Tsè|kùhyWú0˙Wf¸©gŸË‡2Áz‡ÕBÚMY»y&;≈‡”)–i◊Y™"BÀªƒ3˛˜!ÿÆ0ìTÜ§›º¸»â.@…dPπÈúìm±U5À‚ŒÄÇ°s‘B±ãöÄÚ±?ÒxÁ24ëî(òMXuú≤⁄ﬁ≠)Úæ≥éﬂ´ÿ≈2°W¶„nºÀΩ-Î“bîDs‡π”æovÛ*ÄÖ=áÈ5'GXé±l˚‹∑¬hµˆ!ô∞lÉD‘Úµ:ã”8-Ò©%8Õ!Æ-ÜTÂXBÁï9ZzÈ‰(<
s%¥•ÿ0ﬁ0µa‰wz¶ÍLüÊödÜéjêµåÇ€üﬁH—!>‰ vqf{≠ïá,dT÷K¥4G≤à…¯:v⁄◊±Û’◊Ò7ÊÎ¯ÉEUŸÅ; ˆñ\”.ˆ≈Ÿ1r~¬“„iÄÅ}3ã'¨Ó\bŸêÕÇ!b*Ù±ÄÜX!¶jœ&ƒbÕÊl∆·F‘ˇ∏X!gÀK∏Åß1…¯w>ú‰s5Lë| «®Éı¨v≈cÉ@!D—
Å!/l^‰¿L:◊yÈ v1W/¢⁄ex˝à{åÁá˛ãÇdä⁄¨TbQè™®ƒπe‘»Ÿ⁄[<Œ"!ÌH U’∆"EÜën5°¢vê˚'Nõ•Ïh=1\uúõ.wñ3*≤jé›	@\k)—∂®È¬‹eçê91 Ì$$mMÈ ‹Ó_∫!«QÑ≤lÀv D{TÏ«„∏ŸäLâË
ÚÙhË÷≤]XbÒÈµE∂˘éñ¸hÊÚíRWmÔˇÌ/Ñäè©Í¨Ì7ïçÏ9}1W[‡+–¢“aJú¿@ƒ≥n≤5†ùãÚ”¿èÎÍŒ¿Èp¶Çÿ1‘¿É1NÅÄ+ÓHPù.MˇNßO9öªæπ”Úà¢≈µ–¿™HY—|j.©™ëY: sÌerÙt PÅtÆœºå¶jÙX5êx‚`¸û)G≈Z´’Ir≈nWˆ*BìS”z%X3¬πó
£‹ÂKÎ“¢èOuW£RnF9ÆEôÕÅÌÛúÀjT≤\æ®Æõ»Ó°÷Ô⁄Ìªp":?·)N#h±EﬂÛ°IKx(ÔeiF¨Cÿ#¨Ü>*ÆhUﬂŸeÍôóJ7î>bÂñﬁLlYW‹,©s/ÿÍäÎª¢3„
±µ;	ÅƒÑCœ¥]fa‘$S?“ Ü0:uÇ±Üpeı÷C}	≠e¿¨√V≤WÓ“y<
≤a/»j]ÊH‘Ñ∫(o.vê¢/ƒ≠®HÇwU cŒ‡≈z¶–i˙©`ˆO+.]¿M¿sŒ&8 ‰Û´®‹ˆf◊ÂM)¶#ô‚3£DE††{våí∆÷DÙBÁrö8ÕÓ‰¬ø”/g æÎ <¸&˚¬
Â_\`… ⁄„ô'“ÚßòEƒÚpÁ>†∂˙laEÉ[uÇ`Y§ÄÿÃ˜ú&4·‘–rΩøˇE©6w	&õ:«h‡trç¥Ÿıyi“eÏøΩÕIHaã»TR{T¬’)ï–AkGﬂz¶fÙxÑá-(ò C]r·'±≠Ò”¸bÖïæªí"]˚
È˙é…Ç>ã&˜‹Au‹<nÍe@˘äÑ∫Úπ∏.üÙ=n7ºâ	©G8Âû,ŒÖèÊÆ` L4ãFé˛ÿí¢§8¢‘/Omò$ößÏ·°5ÈL¸≤ïƒÂrCXc˛ı◊¯•¯%˛s´Jær∆Ô◊¨˘Ãò˚∏≠õ
,Uîá*ñµïgÔi≈˚˛uEz’±wÛ÷®‚ñƒ#©µÍƒ	—r(K\!JÙcQ*S„TBèç’K«WeîºXV*zKjŒ f«6UcåR ê;)ss¸ïtáuÚdØÌ:X‡S:`;ùü¸X´&ÑÂÍÆ@IGi{sÙÇäó}¢ê ¬•òõ}d§ÉÅ‘aî|ƒ»7°gîRß[å]\B∆_Ëù—$6õ∏HÍÃA“èf2’|ÊlªñKƒ¬5ﬁd´™íìLt@˚9Ê>d÷Ñ»cmœWÇ•gì(´ï9–öΩeº´k∞+´F´î˘¨H˜yVi∏r£•Sg÷ƒ¶DLÓÄöS‡Â¶Ëï‚%÷Z˙T˙öº4î’öÀZöåé«%ä—mjf	âãRéªmcÉeQp5àÊuà≠£7>+PË.
Uù–ãù ì∏ÏRŒÍËHªàô,ítYK7ÑnÕ¿å6-1åâO~ç˛UÃi§∂AEgÙj@{Êg8ç$c]Ö~E©´/·JFà%ï≈è=ò+W˜°]π∫_]π>CWÆªr»Õ˛â∂(ﬂ——:®"
l
W÷ˆû¢+ÍSwbyUyÆ™ni¬NvÊë£}6s©tïñ™¯°}“àQ?·Èπç q∂ˇÈ√_·qó¡÷s/5¡{í‘å{'/NüΩ8zyæˇÍ_ÿÛ„ód˚/©ÿ	\;~yÙÍ£Ü≠‰«¨0π©*q°˜ΩRU´q6rœ.»<êí«k‹sYµ¬ÄÏEﬁÍ) )¥’ xT†nïÉY D<l©A
Ô√•W%Ó!Ø∞£Í=ë¨AﬁÁ“Åßöv‘\Qa“™Ea‹ù≈Ωá[›tÚQ¢.RIúëåª∏ãŸi˘Ã¢æÜU≤H£¸r!F—ÆÀˇë$¿‹ 
é|ˆIkCtÍ¿«™¿öñÁ3± π:<>?>yπˇ\îΩ{éeèŒÓúøD…˛T!wIäJÍU≈IÃ‘NQ}Ì^™ºvWwuÎ,RXhd∂jGMù]\Àf⁄O¢∞˚¶ ÷˚Úµ5FVô∏€lbvb/ìmÆ•úZ==Xa÷ÓﬂW"ô–ªig5rg?¡ £íı»‚ü3Î¬
‹èÏï[˘rÍ¸”>p‰p≤0áPT¢táC ˜ÇYóñÎ°˙∏Rä≈¯3¢aÓ?∫\+<
 T(Kàó[Ä´W’J⁄K¬º©ø¬?˛-R´•å*)ŒZÿXd-]áÅt$‹˜EÕò%M+z◊

+‰∏TN0∫'X’D`K<ë¬y~ä:a>Ö◊‚™—låyÊ5∆Ë£0Ñ;Õª‡Œr€0~}ŸH`ı∏ÉÍ5}‹ìe˙@øBmÉﬂ’ßPÀªkö≠ãÕ)˝πã;e˙‡Æú∑ÃüE$Ûÿ•SˇÚ,tÇÉëLÕ˝}ó@~óg86~ ˝;ç;Ô¿≤Y^MG‚4v_kéG çÏæ˙zÁVÓ÷¬íYw‰°rOhÎHILfW¨ûje09°	xNÑ∫*NÂÖô'ﬁh˘^kBÃZ.]=ÓHùL≈LπyBñ‘ES›Åb,õıäøΩΩ)õG˚‘Ã3	D›fèi
¶îŸt©d)Ò7=◊hŒÓ®ÓLwa∑“‹G á´Ú¨iÜ¬VöÙ±HG«rJ¶}gˆc∫˜⁄	DnFãı≠ †8˛üO°/	£4Ò1>◊ØcôUÓblΩQRLS=Ù,Ó…∫Á~]Ûkﬁπá5O¢ä>¸mÄû;∞‰;˝Ty±˛9%!â´X.»„1Òòéh`π◊≈FPr"ÉQiƒ#î0óÄ∞ë1˙
Ì¸‹∑sÕ&=E71#†(ﬂÊUï[pKV
Ö∏tÅopVﬂÚ‹·§1vm€sÃÈzí4√o˛ÒÌŒ:ÙpoÌ+?8wÔÜ˜=hzBíu¿L®CÑÂÛ‡√ÖÏ√gC	À¿Ó—√V»@2§‰≥.9º≈q∏"èLÌgåm’“MªÅj6õ5l¯cÉÀŒ˙¨j¢‹ãÓ]K Á¶?˝T®äSˆWjûU…B≠;©ó‘¢ ºØ∆2C]õáÛ2ÆWΩ£ıSX™_5ñ≥»∑ù»p‰/·î¬c>3•Âπ qÃ‚Z÷Å»lóú˜r.úhÜ5u&˝òD˛}‚X_uñ˙ÒUg˘Ug˘Ug˘©Zx ùeï8‘ØZÀØZÀ‰S_µñ_Ç÷røO^¥ ú?Û˝°Áƒ\<J˙¿3‰ É‰0 ,º¢5W\âƒ÷6˜¿YÅÉ©X’;f˙ÙU˜ÛÒÙó1¨©/_8ì[U?k‹¿¬«pÿ‹ëO—ZORr‡W¯"¥T#ﬁ≈µ40ÂBéASá{ö¥t®é∆˚˚BÌ†„h|¯†pÃÍ}eΩ˘€Z˝ç˚∞_à88Z|'HúÁÖX¢Ô<"_µ_\Ã&|Ì?¸ïπ¿Jì˝
U¡}LíÜ‚∂.óí∫ıw°Õ˝¥µâ√kÁ´≤ˆA^3e}ÿ:£¬>üTQÀ^ŸQ@º?∂¬∂@—⁄-*E¢TVH≈:-ªÚ≈…hyòG∫+jí∆•ù∆Ê∫æÒ.tÜíeûÆ5z9|“‘ÄjHEŒÑ¯6{È3•åT–;áƒ¿¡5üù¥^=ãÁÃ&;È<–≈ïV¡Y‰bZ	-E¶Ä§âïD:ådr˚Êíÿô¥¬ÀÇ‚oYF-¿lü´îö OúB>26
∏RÈ…œeîKï]õfI?÷bﬂáP∫?p∞ÊñT0ƒ&V)ØM^¢˛ê5paÂ—å@ß~€n'kùÔCÙÃ§dV≤(√f>’‘Äe¬∏!Òã'Y⁄9YÅ”QBÔîπ·ÆK∫S:ë
*—$\±öh?fcˆÀÃ≤Y%v»∫D· :GD¡Ó+†}@ª)˜ïÔ!€2Fµñ;π‡™+≈√ŒO¬I…†⁄8Ö^‹©Pn∞’}∆Â≥– v6@>˘
z˜ G·¿G¥ÇIô«"}ùeg}’b0®-P~$]∏◊¿Ú˛ñïJºÊÁ_Û¸kÚµ§hÙ◊‰kyOæÜöóñ® “_X∂Íé Fg#ˇJÄ“≥ôk;´ñ.„Íê‰¢ÿèYlÙ†x≥≥˝oO1ÈeÃëß*Ω	æâ^t±ŒÜ»L÷‘s"øyßî≥M™‰Ö[>â]~F9-’KŸ\wóÎÇrr´IyxJÓ#¯:ÙËÁÅ ã⁄ãë@.øë}û^Ì4 ˛`2»Iiì”•¸.§^Pâ&ø%!yg˝`4#QΩy¯óòåøªˆ|é^úhLÑΩa«¸ª¥º¨ÿ ∫~çg°í’ö Ñ[@pn<'T≥ˇÌúÑÁ#gÏÓﬁL¨±;†€å–˛Ó≠›or9˝˚Ê¿ﬁ°Jfnz	YÈH¥Èhù∞xˆ∏)ﬁ8IÆÃ1˜Ó–ù`>q˜E|n˙v|Nıo ¬Y∞@ÄUáü·Ó-ˇ;á9√¶£ávoïz#O=:2å¨ËOÆ=t"„mŒÃ<·4By‡÷œnP5ıƒ˜Ò9tMﬁ9õÓqë=«~é  Ëo	ƒ=GÁäsòS„DSZﬂﬂmv77/⁄+sL⁄>vûwo}æÇsÊÜáŒÂö1Ù¸æÈ⁄2EÀÂ
ﬁÜôΩQÔœ¬ôLÓ˜Õ»Ó_9¡Å:ÿE|ñÂ^
-+<s"Ïd®Ùjéé"¥5Û†5ò¥„ü´xgçRˆ'≥$≤À∫ñÁõnx2Öô¡©∂Ix§n~}◊¯Ùú(&0é8ãª{0áÍS´∑ÕfS{Ø.ö€¶πùØQ¸ÅÙ‚Ùåà¿3<B◊aﬁ›«¨ﬂ¶ã Æ@◊¨aÊÆ∏<óIˆ1çT˙Â:D‚∑åè≈wÊ∞ﬂ—zêyD\N≠¿g8ûˆgÏw†O{¸à2◊ƒ´”csŒÌß¯Ó¥≠@ı¬áO√Ÿ˚ê.¡…”¯™?9≥.·≈˛ûÉÁxOÔﬁŒfSﬁü>ùüEî˜R˘°≠ oçøfX=Ì∂X9u€Ü¿:˝‡x”f}öqÆOàÚê~bü%∑„¨Õ˘4p.]ÁJŒ∫n-ﬁ9Ù3TtùÚß¯ß3TFˆEiÀ¿e;wö<w.ÛZΩfû‡KLO’Ã<1µ ∑E≤ôS˛+Ks±KÚIÍ^—√E4¡‘ÚÂyŸx—+≈$…ÙÖı˘â¬ó0À8‹=√Z0‚# %„W¥w‰gÚ_[◊òy*
Fp·‰¬ıú–¬ÿ®pzå∑^9ö.ï◊'Æ1ÓΩ[k˛¢<ìk‡ªÈ)ºOûD)ö)ÇùnXÅc±o3≥À©ãÜkÍ`Ã€
Aπ∂-Øa¢ô¿r#†Dﬂ&p˙}ìt^·ü‹h¥∫ÇQÔV÷∞!<Â*Æ6µì≠Ó±√ô¢øŸêx3|≥-ã÷~O§ŒÆŒKf¸Hà…hà¢ˇD{ìçÌm8I˚J—J5ıÖw∆˝¿«ÿy·†¸≥˙xœyÒl^Üg:çœ”}J›˙Ôèhƒ∫èhQ∆Ö>Dïº™›° "L:Úç⁄ë,ä‰ç>ÒÅÎSsº¿“k@lª∑àﬁ-„/	®∞e^”e7‹ÁŸ∑%∫ˆ6„qBé#+TÍ˜πˆ⁄<µè¥qùødÎK^^˘ÅÕûc/g«1∂6B‡È>Êÿr¨Üë·¸—x_o—ÄÒú°3“Ö'h—YO•¡|⁄‡√CXyπ˚˘ØWº bÍ˘º˘r©√±@\…°Çi≠ûãim›	t¥—bø6ﬁ<Ü„m÷9#%OI›|9zÀ≥Á∆‹E `Ï¿ü6˙ﬁ,¿™Ø≤&ÎÖeF¨4tœR=óÛds<]÷˜R€Ld◊‰ï‡—Kj"∫˘ªı≠∏`-æëÆ*Øó‡≈ñGç7èh.‰0©ŸèSeú”4ÍOA|úZ|ÀÆö∆gcí¢8Ì•’nôB$πö6^™3\†∞›·Û.ÎÈvä“ß ≥e∂/SHâM¸∆}àxg‰{0Ù›⁄ìL1„0CıﬁŸÍ©˛2sCáΩ Ï÷Ÿ¡áˇÙf0tÆ=w‡$ñµ_"Ω∫è˛yÊ7≈*ÛÑp;p¶íÍJÙâ%	oèŒÜΩàk+1òÃi˛Ï‹pZÉÍ£Ä0º:îWN8Û¢∞È9ìa4b{¨U6å«…”ˇÓö⁄|”z[NΩà•vö÷ ·O^X©´qäWVJ™8E—LsW@§Û/.Ó“ïWπê~Ÿ@«¬·å,/˙ËÉ!≤˜|πZ¡ Ã@êÂ®ÿwdG‘∑+u˙>~∏ƒ#6ºÁÆ•;Ω9ïpöøØ≥°Ÿ/ˆü*~bA0d÷  àÙıÓÃ≤ \XíœXÎºèëåâ 6˘ö–Û
˙ﬂNUÄI
;v1übâπ‹ßäHô∞V•≠HE@ìh[—}£•od2*n¿HS¶Bëî^Mcø»pX¨ªﬂ˘≥fÖ(P‰ô
L
•∏=1„u”¿µ#Nñ/B˚A‡{^ﬂ
Êg ˛´”CﬂáÇ—›~ì°ÈMQ∆´kì¿·1Xd<öﬁ ¶ŸõbgÿÊÛ,ÿ’3ƒ´úYO/jQ€KÒt[sÚÀ*gÎ1ïw.ﬁú™‚eNúÃ8o6ı`∫≈Rˆ´Y«q›Swg‰·z∫0áÊ•_€;tá.ÖS
otA„boùy˛fSao6‡b=~ v–#éª√’ëÈÄÇπ37pë|L-@÷WÓ>»$÷ƒ·æ›Â‹Válp∑¯lXD*gGÛ!êuq⁄ZÏD9õ`⁄C)â&v]•ÿNÆ„Cí“LHS◊amÔËÏ@x	g0*QÓ≠-x√á
xa‰ïZå
:FTP∆ì∆T˜glÜï‚LF Òçë‹∞&®±
‚D,5ÉàS+∞e∂ij7™I˝ ÚáÅu·Z|GQ‘Û,
|8∆%BúK¨sµE¨qeDçŸh•<Eœ” ≤Óß⁄ﬁ+πN!9Â∫ùÆﬁÊ√Î|mI\.€.]æ’ÿã±5]]∞´k_Wt®·≤‰ÒÄjÅπõ†L	ç5]∏ÜVW˛≠Ú<≥f≠/{,ùË”›¬∞ó+«|7'$<P<¬Ÿ∫ã¸ú>Ó.∑®á"«•;∫ÑtΩ†ØK…iÈ„“w˙(|eY<}<ƒ–óî’”GjÿU%wCØHíè€∫” b“Óqø‡Q$˜„$,-ıßèÍçñHÇî-pïD8£ìˆ˚Îa¨±∞6ióµËÈîÛüŒx™ö—|¶ÚUâdÇΩÈù™Õ?Dÿ6ÈÛóçÃàë";	Z◊S¸—4LÂ«‘;i≥ÄY	ÅÀsˇFI°ç¸ÍéŒDô5o‰˜ñ	Úˆ˝1∏ó??è{&óÓooWÖ+ßCw:}á¶®∫6Hª;Å'‚Ò›wƒ*Eq=∞¡òŸÆHªﬁ°‚yA∆tE2Á '˛U`MµpÆƒ|Ø úªfS4NbJ`(òπM„ÃÈ!˘ü˘<Ü≥>M%ˆc˘»°Ú÷] {πWó}≠ú–£H9)≈î∂∫∏ö¥Ó®JP÷ñN—∑-]∏W£f≈Ü9´Â‡®aËkZ¡£Ø÷PVø¿ »?~gùá˘#w’œí"R›¨5:CYi≠à‹•È∞F˛`≈{IÿZé4]§€&Ö÷ﬁS◊C=“tœíÊ¡•ø
√ﬂ¯€Q‡˝„ãûÕı[/·∞ŒØÊ{ß\Õˇ?   ˇˇ ‹—3>