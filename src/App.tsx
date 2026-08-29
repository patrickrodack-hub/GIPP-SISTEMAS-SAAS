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
        const Box = ({ label, value, span = 1 }: { label: string; value?: any; span?: number }) => (
            <div className={`border border-slate-300 p-2 ${span > 1 ? `col-span-${span}` : ''}`}>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
     xúÏ}]s7í‡ª¨õp7˜ÿMRí52Eä«/i∏#ä5ÌŸÖÇFwÅ›eUWï´™˘·ﬁ~∫_2∑ª~öªó}<˛±ÀL †
U›‘»;3f8¨.|$ÄD"ëôH$+ˇvR6äxûøÂS±˚Ë*âãﬁ0âVà€¢wõÀÛà¢˜|sìÕ“Td#û	ÑÒ∏ó«≥1ªôÑÖ»S>Ω4Ωõåßè^ŒØy4Ï_ˇïuﬁﬁˇœ3vÚˆ’Ÿª”˝£≥Œbg#}˘≥˛v6Ç⁄$≠Ω¯¢¸ùâbñ≈¨Îñ?ÁcqΩÂa,2VÑE›é&úÚÄÁE∆#vÁê3ÖI_r‚˚ˇá#˛àÂ≥°™ÙNåC(û∞≥´pBπÄ≥ìq&~‡l ¡6¥ﬂc~ˇÁ˚KπßŒ@ﬂm,JD‹ıûy ÍÚ˛ ù<µÅÈâêSÒ—Gk¨Ÿ˘fgòdÅ»z√ﬁc˝SÊ=Åºtÿ€bS»jËî˛€Í≥#$9{-2ÊÑâ∆ê∆ﬂ‹Ôç…”ñQUp4Œ¬Ä·ˇz£$ {OŸòßK˚∂sê‹≤àE”∆Çﬁ∞ABs∂¡ﬁ&S°ß#“€ùá4è{˝2Ê%ﬁù?^∞ç’õ9|{˛œ5p£8˝·APéx¡–“´Y(2™¬†eèxÇk∆Nøº“{@Ÿî PºIF<Í>®˛€fùŒÉ∫~â˚?'∞¶i$
”ıÔSˆ^P©µ¨3ìœ¶"ìÉç∑ù≈˜ü6<Ã≤:⁄Üî¸∞)=>Øœ®H#8ÒÜo_˘–1íŸP ‰ÃÆTÍ˜jÔBD8Ä‚F/Íò(TëáÕno √
£¨AXfµY´qO÷?G|‹goB®
õ«ü9Ï"G!lIIrv<äDﬁˇ	ê7‚øc|Ú`∆xõ_í±Û∫à∏@öπÄ…çxVõŸî >àb∂˛Ô¬æ8‹ˇ)⁄&Í$ìS	∂lfdí‹ÊÖ»ìY&¬¨©…¢,‡4ií∂¿ì¯Zƒƒ™Ÿq^`ÊirDÖÄØ^
UƒnπÃ•x¢œÒ‡¸¯aÏ◊Óá‹¶1Wíµ˜zˇËÄıX ÏË9€? Yú∞ÉåÁaÙ∞ïÚíM˝uvî©bóÇäq*E=SõÙîhSAë≠Ωˇ?2ñ'Z‘z∆<!çÊ(•N¯µ`Á'ˇÚ˜"j9Ú;ÄÆ‚“ÁûΩ8=lïÌèÔˇ#y@ÅtèÈ]* e&YÜîÂ['≈Íâhî+GX‚2oÌuüø)õÌxM1+íK‡≥i¬æ˙™¢9[ ï¯€.¸{⁄>@c9ñcì[ã⁄j≥'ë∑°u=h4ÿ£î›ıÙ6\èÍ˚[»ÚË∏•úâàﬂä`Ö°™Y¨N‚b…¯⁄ŸXsˆZ∞ßÙŒÜ£N;z8˛≥êY”ƒ´XM{œ%÷F∏3ÉOÉa¡£pTA“;@]qˇúÔd∆Çd4√ç!a1ÚödZ⁄” -¬4A5*ú¬‰9ñÅÂLSÄÛµà˙¶gfê0Ü≈ã/æÿÿ`˚ÄÔëTb„q¿ûâÄì|ö≥H|!n”$+pãºpjºÉû§!ÙçÌ≤Óê°>ÛuŸÕBÎ,âÙΩ”‰Z¨≥ëò$‹.{téÅêå5Vï ºﬂÔ?bãmË◊›€}…Ê‘yŸç˜?ŒDváÌ¿_ Œ, !—Ìt‘,©≤a~ñäò
ü–OßÙèr°Õ+≤∆U¡d®ÿ)Ù∫€µ∫Ä·Î~IùË√rúv◊÷41ºˇ¢,%¡˝pT—‰Mr#≤C‡›5SLìë¡ rœ˜÷˙≤'›nf–‡–J7#M9û¸Â6—bàfÅ»ª?Bfµ2)2≤6˝lØ^≠=Àg(π ˙Í£ÇYD˝»^t7◊ŸsΩ†÷À95X¯†ßeÈ:CvSÑ∞7›ÙÆfQTYQ’“Wë∏e¯?…≥p˜ﬂÍ¨∏ˆ∏Gld¬Ï„6|UyªÀ!C∫,iß¢]0Kfq Çﬁmƒ¶a‹õÙﬁ?}öﬁ~Ä%/¶πbÓ8ÔÍ•£I` ”nk	¨≥0∏›fÒl:—Éß€A›î}w∞5∞˚Z£„xZèê`˜F‚Å•∑Ω«àå;¯„„ 'ΩØ7Kå®îoæﬁ‹x∂)9öJ˙≠∆Üù¯ƒBF4fŒn:A8õV0´ÍUQ´í∑-õ
˚Âá%J!¯!	]}-v6®\3ò·¨(íòw)nçÙÒÿ!êÌ«›πdöü—‰¨9(û@r&± ¨ Ï¢@]Œ√x7JùIñ?zπÛ/,á≠|wæıx±ÒrgC6‘$˘ªºÊ€–¬8ùÃG	ªˆ»_@	t¥˛"Äà	è«PJW,Ÿp¯œ∆¢ËîµÜÁvãå˛ç=â_¡Fók‹V™˘ÎX€»Ó\/õΩ~$‚q1a{¨”a€v!?î
_@÷ÎMÔ˝÷„M\∞@Ò4u)G)Ziå¶ßdV–R¢èÜÛ≥d⁄ T¶O€ÆD®÷≈ç™`RìUÊrC.¨7.çÉól”/W9"ÊI4∂W$)qP‰Æä¨‹p<¡ßÖdüù9Êen◊O»dp·\Eê0	É 5Â∑¿;ü>7w=2Hòó¯4∂Y‚¶U˙4lµµXÖ_ÃKYHråfŸ†ƒb—ºIö÷ä˛s‰L‰ŸíÌ‘ôv5Y7‰çfYûdΩ4	â˝◊7Ñf†Ê^›ıÜ¢∏0öƒµñ„N˜V”tc[–’Bgx®\ˇ-—YhS´ûŒÂbö∫Êï˜wœ÷†ó•õÇ∑ˇ˝qä RVm9;OÏQü	,›ÖZ¥ò’‘´T]˛w‰z)¯ì‹/≈~)”É¯õ¡⁄…˜`äêDîâBπÃ¢µıBÁÔmA$†∆lQìÿÁ,í~ˇ ∏HÄ"ÿBäÿ®hÚ∫áìY6ö®/Wà/∏¨~¡á∂¯æ”	„ar€aÄ—®ñ~†Ç€nÁeWÂ∫†ÙVA£%†;≈„{ŸçÅ!∫ T	U?‘_’™Ô?ºÏæˇ‡≠:ò µ»‘WI≠∫å™}êwvU¸n≠óòUÉ≈üı“Vqú[©R°lœPqW~k—è}ˇõ9&ïÀË‰aîŒ˚RØˇÿT^%´“(5ë∑Ë\ZÜ™?π##£#uÁŒ2Ém&˙!â‘ßºòÙa?P⁄@YÄ˙èªkÎNç´,ôb¸W‘…ûwÍ≈O∫Ï±FSá„ä®ÿ≠]$X≠êÏ‡"	íºV†Æ~b—rr‹¬π§,¨~ba—V5ãU#›Åò≤}ô∞Vil$ÑïÒ_Ys*‚úèÖD@•t dÉ•Ò_YèUÒW,n∆vOg~gÇ”§‡øÏÀ]òtÆ@ò
Ä§TÚ6C·ØÇq)5!∫•˝ ˚&yYn±f)ïÜX÷Ê>∏îGıﬂ¿T-'>	™‘ÀE’<°ˇ$‡)/Fëõì°C≥QBóû–››]kπ©¨2uØ‹™ dE)/öõì¸RÆzY]Eì~.ã∫πk≤&ˆÉ™Ω®L5aŒ∆»§N__Xsg¶NOõ¬õ5ÎrêßCsÁî £«kΩq±2„‡àø¥òli›qßWo`{˝nÁ<Ÿ›l¶◊ö`úÈ’”Ô¨≥é»≤$ÎxcçΩb7Çï§ôpùü}Oÿπ¸Õ◊ ‚¶ª∂¯ﬁ«ƒ\2Í*ÂÙ®ëù50dYÂﬁg4-ìÑú∏@deìÖ\k˝@–Ï"6»ÈÇ»ò¡∞‹ÜY3Ô[µπrá*ÙVTm±¿€Yr…D+ª¥áS⁄;±á5>ÑíTÂÁs5ﬁf˘Å©Ω:≈•ËÇªÁ{M6Î¨ﬂÔ◊7KÀ<I“êp7ÕƒµΩ{bML[W¸nª“ ¬^„ˆZ8’[ÜàØCpƒ u$Ú<˘'~„áΩjê^‹lDuSﬁEb-ïíbE˛[¨jNL{OŸ4ÿFÎ=*†7Ωﬂ¢Ôñ4O6ÈΩÒh‘}Áz“€z
≤ˇ⁄flä£d%˚cUπr4ØÈ–Î+◊|vµ3y\SKCß≠C´FıHÍÙ~{‡ì6c€)Æ∏j´J«|Ê≥¢Zƒ6^ #IêO∞ù8AÜ‹˜@F1äéW◊:“E´¡*6y‹Äê‘wÜg· mrñÚ—ÀCﬁrƒTêk$PÓ=#ëK	˚`?Ø˘j ûxÁ∆;ım«Õ⁄ÙX3hä÷ ç¥8öãRTÿ¬1F¶∑@ÕÈù4n[≥cÕΩeè©;ºV≠hÂUVõi–@6mgú;Á—,◊Üœg á∑…5göu4Ãsìm‘{xW?3^‚∞ÖÀ›˙|L£x∆,ã‡§∑Ÿf ”(|8|ò1ÃX¿*∆Øk°◊–·⁄zOtÉ+∑ålNªÊ~2=jª5Œøó'4+Xõ‰Ÿ"L˜û‘X‘9@¸Õº‡C)"+õ pìû`4q-‚AÛxÊ±/·ÅnπV*&±J: ˝óúc‘¯ÜoôÌú‡XùÂ$Y ÿqL~DKÌL’∆˘û!+ŸÏ]NÕ¶eCªó÷ßî»÷jÈZrÏÒπŸaFˇ≤”}˘G&<‘òN@≤t(Í8Å4(˙ÎòÙÉÿŸ7ÆHbM€râﬁ9YbÚw‰øg%c|™7Å’N Jêì'-˜HÚÈ2q¨¥±ß‰1‰lë ı<YÓ›≥‹ıfá‹∫úï%ZRtiﬁïõ@<›zÙÚH √éπÙM©à†≠–™ﬂádi=¸3æªÛ˜ZΩôJRÈ7FÌQj`©¯¥ü¶Ë?mﬁùójÊjıÈ®Ú‹If-’*L|_™XX¯C√gΩyÊºZ¯Ø6U›b¬-ô⁄ËÙi≈Ì3÷GG"ºÏöˇ¢{ 3.µºåqF™uÛ±é˛[ÊjÿÓ’EE˛+[YHWßhyﬁn≠´St◊å∞®ûú◊Uﬂ ˙¬ùÄã˚üãYî‡$m^zdèRmmï-Ïa‚hãå[Cﬂ£œ4£ûC¯6}˙òr:s∫ˇœ‡ìépx&8†˙ÿ—ÛEe“—\—2„dÕhünπÌr|¨úo∆úÖ‰˜7òwöö_j“K m∂d{`i±í∑lÉêX—P™J1˘8·±˘RY]∏≤–èÖx$"ûµK∏≠1VÏjÔüÈﬁ7
Îıa’›.¢±WΩ∏RÔå¢*C>%RÓ˚„$kæTÇX	eÖ0à’Œ1É≈√v·TäàFÜ\&,>ÿ@hãáÀ†SçKƒ£2-|¶≥ Í∞hNRíVÜÓP‘≥µ"ı|+&{¡æK"`çRÃ‡,eÚsQïl„ÿÚ˙qî∂|ádËÏsçéæF©4wÄgºn≥í;…gx\mÉF k{uÎØºó0w®NCÀı›”lÆzMlˆø^ïü§/w‚T<ïc*≥JoÒÙj‰Sºd–Ø≈W„‚Ö◊zª§Ÿs†¬ÊÜãƒ€¨:¡ZΩ—U®··[+˘ - ≤E®Ì˝k≥g=∂Ãï´Uì:ıVÆzxØÉ(aÆAA#àﬂcÏYõìØ˛´‡èÂ~±[#∞_¨æ?¯ˆÜÓ 4k^7ªF	nï]†¡m~ıçù¸	|é£‰/˙Ñ¸GüT9®mKZ≠°FÖJûı˚ƒjŸ∑%ıπ»A|Œacqéw¥tÁMíu‘˚‘iÎ •a=Uº[ır≤=Öó œÑÅ_Ñ¯-YJÖd˝£"Ê:©´ZÕL∆∏ÕV)´≠„)…¥\§“xˆ^®j˚{+‚…lj©W1g#m?“~ﬁ_≠ÀÀßˇ⁄9â˝gPXso[yxÑGrWFˇ∑≈RÒOT¥$ ¯∫SÒFõ_Òìö_qÌ‚√
g?(0Æ"÷÷∆∫Ù»‰ârÔﬂ‘⁄Ï√Ò5t”{L˛π{"b∞b¸¢mD≠d˝o¡î˙¨◊ÊêC?ˆVY•æøπÙ˜zø˘a$òoÒ¢´ÙÍínêÁ≠ËZma‘™Uœ˛⁄i#†^Ø Ø‚Ôìíãlè $e°ÂÕ!Ãˆã◊ÙC”D	ò*—ö¥ÑïÖ“‰’b‹Æì®ÙIm~¬d~Jï’›Ï-z7zö®Ëfò¯)˙Ÿ'√∫ÍÿX‰o}øŸIÚ_.∆ØaW‡√$$∫ê3Ú“%néÅóXƒÔ@∂…+óÑﬂºπ‹ˇnˇ‰Õ˛¡õ„À”≥£oﬂ–5çZòìˇb'‡˘dò,Ë¨Àêvé∑≠#ïíC ∑ÕﬁPG∫¯:£]JA¿Î∞≈∫{¡£K∆≈Ç¸ö4,a∆ê$Â˝`ó„%°¿&xä›m C´ºå…¬≥ê[›èÉ)_Lq|AµêE/µSb	⁄äªfz<#‘º/È2îgc¿w†ëÄhS:]*òËñõxrÚTájƒoÛô<d_±}ÚÙs¡Nƒ»=≠‹*d.Î]J,[¿@∆vÆÛ$Ë¡$QP>∫„qˆu“á›2∑‡~W&BØ—m¨‹ÕJ¯ø}¢0ê3:DÆ„#ÂË!úƒJŒ)#ÎxÁ|Ù$Ãï»`$¢Ydì¡·˝øc
vˆ¸ı©¡ÔHb:À“»€À@§0NÅ,∞ß‰hwˇÔjˆé¨RπΩ˛⁄HÅ›V€ê{‡\F…Ï⁄YzV#HyotæÑ~:À√ë~&ë(Z¿O√ ¥1szˇ3$@ÁOaçâñÖ°ÕG‡Yz!ÄÄöa_Òiπ–ÌæsˆäOÔé¨≈MDÚ;X·˘ÑÌ‘|ÛRiVG˜?ˇÙÉËWÓ:Û˚Yñ‹|õÜŸ(ZN8?Á°]‰©»ân0U~î‹ƒUM}2aÛ•‚Ë›1¿?‡∆3ˇ*åƒáÂÔ¨#”FËPeÑ»qõ@Uj%–éôb‹›ó±-œ≥ÿa áêpˇà<˙À¬!EÛ˘?¬ Ëùâ0µ∫~5Mrh‹~V@/)åó›∆∑î™ò£“®l‚è<j_¬á∏"¬©˜@¶∏Ò¶J†o≈H6)^‹”pa√ã«u¿·–•ˆÉ˚ü1HeåÑ»ˆ_mÏø;t∂ %{Hl∏öÄ°^Ú–Ê„e:¨$∫ˇÀÉ_ùÏ∑,V?+ê◊BÈ8ÏPät)µ∑CæKèKó∂¸@+˜&lræ[Feå7N˝W8¿†Ã÷Q¿ùEto˚≤ZâÙCiÿ≤Gb%#ß”(ô⁄‹‡∆≠‰â¨ ˙„	øÃãY‡lyJ@òÅ∞Ç±™B˛$8t‡˚ˆêëÆ¡RÿºÊƒD∑Sÿ@
K‚ÅΩß˙w@=bhÀõ«9T‰L“˝à≥ÓÒ¡—ZM2tÒﬂ@@9è1√¿∆˚@&≥ﬂC22Iëó˘Sf…|x◊Œ|ïËyïâgÑ ˛+Lî!√êïM¯‘¶íé?Çƒ&⁄e§iRñ ˘ãp?q¢‘≈êG≤Ó‡¯tﬂB’Î(.ŸBÇÙíéÅ'b,P{ó:Wl∏ÃtI\e°∏¬∏[Kˆì,)∏=Øl‚ˇF‘˘äÚ†ΩÔƒ˝œ£Ydqc —%¨8
Ø≥‰íª¿ﬂ`"£ FúdÎ˝¬ZXÉQñDëKBﬁ’Ö‘ôS^á°ôöP"Œ£t≈ﬁ`e`¨™ .Ó[a„0M/Éd‰†Ê‰¸úA
 AXXÃm5ﬁC@Sÿ˚√h¬kêœu¨≠[k◊ËÉ/@Â!ñ/∞1K.…∏ÿ0∑áîπòe6s{ùa(J‘Yy∫å[ì¢õÄ¢•∆ŒZ˚6ØAñ≥QÓb¿5(≤dùo,ôpä[åQ*ìa¶≈ÇrYcûz†≠3U ZzuˆŒ4$U†e‹oú$„HÄ&õ©Ö6JÍ°T	Ôª0I˚*V¿h Ú:∏sã>qöeU*ï‡èdÍÉ»S¬É%˘—8„ï’€ï¶ã‚g¨yåoëóQüÇ;FqƒJ>*~yœïoZ&	ŒÉ§µY$•T”ﬂ(L…‹Ç+RŸÎ≤$ô÷€Ämê6ê}©÷∂.À¬†≥ §"aíBE\◊($»(ΩŒyF„RG_Ö„À!®Í≥‘å)¿æC&4S¶ˆœÉ≥∑e—|ËlM·3b≥kyìåsâïá
õœdàe£nÜhº∫[∫K›ªp¿Àâ&Ö÷≤!d<ü<^≤yã\ƒ◊It-G∑áM;)‰£JEGI∞#†¿è„D^Æ≥≈LæˇãåìãÏ=â≈≠m¢Ÿ·uX‹µ/U5©πé‡`w2‰l¢PÉ(√<h+
4),∑å…6∆ÙB@KØu>¬0⁄y;S∞Ø√|ÊàÁPÉá?)r¸Nó–'Püä•¬ÒàŒ—aØ≥@ø%âDôôi†EWkPçs‹⁄liøY¬H4P∏∂îÑ¯ ⁄}º∂ª88•ú9mÖlŸÖ˝S«ß0ö‰2c◊H…Ï&£t™ ∞ê‡öd:Ú9OÆ
–∞\ääh®l¥Eæ=?i“ ÌªPUõé¬ú∆«	/Ú˝4eLF∑∑»;ñÆŒ≥ÀnãÆfå)Ω0f†ú∞?º£u^Ç˝CÊ.˚VAã3z°∏T:8)Û@æéÔˇ◊‘ô πx~ÏÚ'‘¨M∞4|ÒAûe®òF‰z„mì)OAB≥ ·ƒ≥ª/‰ŸÖ<≠∏<<;=?{{¸ˆb@Ü†$–j¨√'˝‘≈]*√Ω,„4îG∏+®ü≤Œ!≈∂Íú4oÀ„	ßò9rpãö¯Ô≤∏9?–Â‰·Å…ïá:Wòle⁄◊˘ﬂ™Î3≤Äk°◊eîy^vH4Êv]»ÿ⁄M[∆l^™L1•§\ó8§/àm’.GUösU¡öizïíde.jÀ≤‘ºjÖïŸX%?e1ÀË[ÊóÜ@SÑÏ∂mÇL¥e[÷”[&	Ì¶®¬[Â…Z•/ìkY3Kb0I≤ú≤JÍ|eíTydX,≥ËKQëm,â®L‹?ë≈#ü.&Éì	‰≥v)≤Ÿ9ed¥*‚3ΩÈ≤∆¥Qö›jïlkö!Cì¶i±j≥0´sTQ◊»Uñ+ìk]√†›¡ë ∂åMÂpdöˆaÃF€ÍÌUô¢IŸ6˛òÂA©≤H’x£ù;fEBdb)…ïædé±üË\2ûÏó,#à.ÒíÏÖW1tÅ◊êÄä°ï]ö#Ï2•n™
⁄ˆÑ≤%J;ÇBék–/‘∑qUï/Ø2¥Øö6yŸ0%°6Óëz∂[h@iN1îd!ƒRÄ›2ò‰“Í¨[Æ‘]Ì¢cùGï3ëÇl]”É∏®4ß∆J{:Y”ÑV¸IËµ®lµ≠d;Ù•ÿéV´Jñ£4]í~dàí>È€zMI˜v¢*g)1∞Ôó_πÒ\∞;´‘ã[KEakNK∆N©[xÀK≠¬)-µ∑¥‘T1-ıóEtÇ‚0H…%k¡µH‡6;#~)AA°⁄ßKlSâ“zJ+r±ôYô°b’®#·˘E•‚ÅÄ,hDU]Ë“˝@Ô5ô≥ï Ì˛Ú.I
ÜRs)Èi'ó´YLB#Êv◊‹∏Ù≈D»êd≈˛rBJÚe-¥\ë›U|© E:/–]e,˙cQú Ut•¡ï⁄ÈHßºõ0ﬁ⁄≤¬-`C*F?Ãzi˙µp£ßΩOÚãr$g˘/;ê*È· Áüåècte
hP˚vä34√tï±IË9ø¶∑ZÜàÌ_«˛p
 ^Õ∆ÎWlOCƒ¯±£B!ÆàìJQ/Bd`W¿zË‘#û~∆°cK≠„ﬁ#;ZXD.∫îÑ>“ßgáøø<:(/Òøﬂ¸∞‚€kz±QÜ¶˝E1(·ßc„aX6ÍÎP‹–∏øÉﬁ’m9ÈU¢Òb¿∑\Ú9˙πJ‰€0å0V‚õdÙQ≠¬'…øı§3zƒ@øÈA˛⁄xá$πb1ø«(4–2Îî—F1.Hô◊O‚7xÅQÆ6ç-i>‡√jÑ›ç)&S{‘ë”Ú”È ú… Ìet‰t±eõI,ø¿ÄÅúú˚Ÿ‚e◊îñQUŸNg]ï#±pÒ!%”ìÛ]ßËZ0lAÓn–ås	õÎ,Õí1ûº”?óÌS™˛"@Àı6{ˇa›˛1B˛†)À`ü´˝$·$õöéZ	KëÜØ”¨MÂπßIHbm[≈˚ºN¬¿èR		qZB¡èÑ˘¢:©´ƒkÍˇy˘πJ‘hUπ4Ã *… åÛí≈/åSûç√mO6ìÍB‚√∏√9À0ö
¬ÿÄ¨d7⁄6íõ2ŒvÑéo#ûR§Ì2«€≈W ‚êFS”êùÓÙyÀZ~|u,≈£W20íËΩ¢\ŸÁ©$‘=æ∫¬(Àô∂√¶sèhµ.[©∞Íñj•t$¶’ÎjÒ`ù)/uG^©‘≈Ëµ∏´ÆµÅ§mw]n&rÖÑWw≤ö\0lVÓ\5ÄPq≠æ+uE5`ÓHıA®èªùW†.¬^á7‰qjâ±‚ó›ÖmhÃF°⁄√÷KªQ+¬ùmÇ·ãÇ@RèÓÿŸÄ]H“)»„O6äó!ñ–è~Ñã.N nˆ5 ‹"ﬁKÚ^Û‰#Ç%…íDáóJ:®÷§¡*ôÜ3†º´Mô
åÃÜÌmv[Oæö¡v¢íŸ©‚€Ì1)⁄tïåA∑C˜®Œ‰	ÓøúL>}”™aÆÏ)y+äõ$˚Hì?ÀÈÜøàE∂d&Ï‡Œr€/√;[¢Äzl∆_ÎÍ™±ö-j‡(ArÉH;æ$ºQ}Ïv*≥m˜d•ä≤uSS~{ÛWP%Óÿ£•ıóvla"s€Û¯*ÃÚåeıäà3øãGHıòÖ«6`sïd…SlÓ`hÍ’_©6ÄõÙciØ’¢g7	Ê@¡ÔƒL7¸ËZp◊ÒËüõ ó_û¶'A]*ærúœÜ˘ñ;“LbûÊì§ËJ¿Î¨õ´œåÈÈ"}qœÎ≈+}∆X˙ª¨¨Öﬂ›JÔlT˛´Øòveu‰	›2´q˚èÙû∂–É .™GIµT7(¶+‰§yTŸ âGÇ2Ù§√b∞˚–˛@P›^-*ﬂŒz≤&≥˚)˚VŸ7&%;u£yø™D¶/?TbKi_á…F)K∆égÙŒ¡U“aªÍáó3Ü®ÉöêÏøª^∏≤IsÛD§√⁄R4ñ}bãjtmòòdV_æ~ÿv$:Ø=îè–o ]O777+Ò∫Â–$€*Qág»÷{NÛñë≠“∫€VÍÇT˙†%[[[∑¥5iÆ©∑nÙ@Kı†ß,ïÑyÈ¿ix%π([^ˆ*ö¢€L 0¯"JxÿÃ(â8ê2ﬁ∂4CEÀﬂıéÿö[ıπ{»NéVºéoG—,ÃJg§J~£î]@ÒN¸ƒÒ	M2∆ˇ¿B∆`)
∫m¢ë›~ØÆÆ÷’Xêó	∂qËHæÇﬁªË˚ √M˙Y•Z§Ô»2∫›[”Í-“ÊÆ§Õ6 *"øz∂D¡íØíT°}πZÅN`oÃ†˙î∞◊¯‡Tø»´å…`ìlèòKŸr¯∆¨uEä¡~—¸f0≤…®Í˛÷üoﬁË4{k,PÎ∂ç„Êj‘Øm9§Æ¡bjæX[o+Q‰øº®≤∫±·üﬁK∫ZÀ∞.¬ ©,zÄDÓu µï¸9l%eè_˜r°0WÁCQî‹êı¥k±ÛöX]>îÍØ◊ﬁ≠µ„>zkÀ˜u:SéÆ˝zíù%Ø¸¥¿⁄œ2~◊s˙WBNE¶ŒÃ◊PÍ™§Yè/V•	’HµB˘ö,“≤èæ¸è¢∫ûeA6›_T^√…œ%<îW œi˘ı{q˜èÖÚá"’Íß /EÁ·#•ì‘F”ö@ ãÇ‰¡\ãÛE}ﬂ4CXkSrìC $f´Í´EÍeoí1à]Ô–ÉC Aü{kéaøÕx∆Ú∆U„÷|$∑b“ßtØ/Á∞£˜Q'€‰‰˘	[±cÜí2ﬂí”$5l<…≤çÆïÏøõı¯PZ≈—˚‘2åÇ|<àøÇˆ
é$`KÅ≤“© 5p…ìdﬁhRÆòbÖ©(êÓàøxkî«d®≤`—ä⁄¢¢
tˇóvØÊP)Åc?*Œë≠Õ+îúgIZ#–¢r≤˛√›p›^G÷ßﬁ:MJ)Ù[ıK9Ÿ§ïáOeä√ úÒdMé
mô\/aT)_æ¸Cóµ≤eXÓ¯’≤0	“ÁËJnä∂™⁄EŒ™iÆ≈’.∫ÔœQÁÖ-»∑¥ª÷1
“≤Yrdì·lÖKÁ∞>ŸïSL{'Yt–Z%ì‡]éÜjê^$Â,1|ÎCYs:Z=qu÷U˝,Á˘’>,5å˚ñô∞÷Ü8+/HÏ›≈|é§möº∞wÁ¡PΩ±∂◊%Ÿ%Ì	ËﬂÒﬂû^=}&æÓ,jo[+(tYgP‹a∏ôƒDÌ>“GLèÿ¥<Ë¬Ñ1¶¿V∫;7«s{}L°)aK®∑•hZ5SÕ≈˚¨∏Q&°}wNˇ ßÏ|„üTàQ8…⁄*Ü·vïπ˛ü6\1ÓÿÒ•ã78ﬁŒ…fõom©6º⁄éywéˇ˜kä‰0|"˝óB"€•«\˝˘¡'’ü7≈Ω
hƒl\˛rïeπ;Ø$¯k9k£b[ü˛úÏgr4{J¯D‚Sb©øí≥≈ÌŒ˝;^√+Ú÷ˆT¢ÅæöFTÊt¥o'±q>]^C3Î&˘k:¥‹˚B“ø¸ÂÔjRnÑvñxgmev∂;w>°Ôªï™)˛z^éª;˜&◊!Tò˙ÁTóÛÛ%À˘˘ØÀ˘◊Â\˛˝∫úKËáÀôÙNñ≤§aMâ(ùÑØ@Ë†<ˇ∫∞]ÿ˙Ô◊Ö]Bˇ{]ÿ£(ƒ∑uÁöiéî¸+Ø äø.˜_óª˛˚uπó–ˇ>ñªgÈz¢JOz9M´ø‰ºìa˛∆Û&∆ñé◊Ω‰’≤¬5∫hè)bx›æ‡≠5ç1Vﬂ'Ω≠gÂ≥]œk]ﬁ‹ƒDÙÄ‚{√hñ·ãÕ|VÇ—cSÀC∂£‚«;z bì˝‘{⁄Ä|µPÌK_Mj|”ô©syaQÕmΩäçãxmMΩ"ÈexáuÍº´ïÙ0¢˝Ü¬∏kÙ∞≤Ñ@!ÓSéÃeï«,ÀXúL…H%£eN«ß˚À¢¨Ø¯:ñ7àˆmNØ¯ˆÈı≥≠¶òıﬁ7kWY_Sw_}QE™t¶íW|V¬⁄»˙+b¢ñº|º$Ãˆj/
|2ô*∂€U¿⁄uOhé¨∑ñÅRÎ1ÎÄky∏=ü6Ω“µ“´L;ßIå˜gœ#~Á<Úõr¬îçÉmm}*ˆ?âÁÓ∆Óõèk/∞TüÚ£DåsdΩ_x¢î⁄„îäO[<›¨øe±
≤†ØghñxzæÏúÂxi!€ùπO4‰NyX{V∏ >h7Â∑ΩõﬁoeÍÕõÈ≠|F?L}´ï©fy*‚\‡ôjÑ€ŒÓ|˘
™ºg≥m  pèùóÜ@~¿YÃÅW9ë~aË	æ0$±”Ú∆5u∂·8sﬁÔ˜1±Ì±ûù=‰¶…@|7>ám'≠-Íß
ÚÇΩäéó\(‹∫Tvt	Y‡@/ò3yzFBswz‚:ÛÈ]“◊Íß#û©§cœXt„á^¸1∆¢®A≥–T$Âaƒ∂3Xn¿N<√£CAä3¢ˇØ<Êyâ˛]ÿ'áªsÎ£>™◊Ë?é§{em$“#`wnnııe“¢^π∞P) „HO)zø Üá	ûrx˙Ôî√O9<Í•¢›¿y˘Ÿr
’.Ø∂∑tP	–Å€;º^0È≤ÈâÛ™¥ﬂôÓŒí¯ß—âxóUê·wÂ3µl7ÀÇÆµµ¯öj“À^ªEÊ c˘],À!˜›#PÂµP¯=	û^gZ]_Í&7Ωmvã⁄	˙DF‰YfµåL˚7öyï)›	}>É¯ÁÛƒ?„;xDQ°s]√?£d Ú≈u˙=µ+zì˚hπ |ÓRÆ.HyOUÆGÎÎÓ‹˙XKt≤n∏%÷..¨ª˛=íÙ1Œ$æ»˚WÇ©BuNéB3˚¶k…FJÆQ∂ˇ9ùíD9ÌóÈ^|ﬁ>P˘J˚î∂–ı+ô*’∞^z›)∑9|ˇΩ‘çÏ⁄±∫9ˇG«Lü≠^‘f˝[˛Èô¸ÚK¥¡‰RõVÀ…O>®Î7ŒU\»c°¡∆Glﬂ*JWÄ6˛Ry°∏¨£.7⁄kŒu˘⁄ù‰Üæ›Ñπ|‹ÿ ©UÀwkπøñànÃ∫†‹l·≤ÎyÔ67≠;…eÉˆEÂ∆ùö˛[ŒÀWQmáLöÎDÔz˘4>f b.£r+˚xîkøTw$kl–¢Òùø#ëy`ÍJ'W|Qúù_¸?   ˇˇ dª