import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
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
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, FileInput, RotateCcw as RestoreIcon,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sun, Moon, Package, Flame, Minus, Newspaper, BookOpenText, IdCard, Badge,
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

import { preprocessImage, storeMedia, getMedia, clearMedia } from './lib/indexedDbService';

// --- MODULARIZED IMPORTS ---
import { InteractiveWindow } from './components/InteractiveWindow';
import { COURSES as IMPORTED_COURSES, CURSOS_DISPONIVEIS as IMPORTED_CURSOS_DISPONIVEIS } from './components/ModuleCoursesData';
import DashboardModule from './components/DashboardModule';
import ModuleEmailAdmin from './components/ModuleEmailAdmin';
import ModuleEmailMember from './components/ModuleEmailMember';
import ModuleChangelog from './components/ModuleChangelog';
import ModuleIgreja from './components/ModuleIgreja';
import ModuleDesenvolvedor from './components/ModuleDesenvolvedor';
import ModuleAssistenteAI, { FloatingChatWidget } from './components/ModuleAssistenteAI';
import ModuleDevSuporte from './components/ModuleDevSuporte';
import ModuleBiblia from './components/ModuleBiblia';
import ModuleMembros from './components/ModuleMembros';
import ModuleUsuarios from './components/ModuleUsuarios';
import ModuleSalinhaKids from './components/ModuleSalinhaKids';
import PortalFrequencia from './components/PortalFrequencia';
import ModuleFinanceiro from './components/ModuleFinanceiro';
import ModuleSecretariaIntegrada from './components/ModuleSecretariaIntegrada';
import ModuleCertificados from './components/ModuleCertificados';
import ModuleEBD from './components/ModuleEBD';
import ModuleGestaoCursos from './components/ModuleGestaoCursos';
import ModuleRedeSocial from './components/ModuleRedeSocial';
import ModuleConfiguracoesSistemas, { DEFAULT_PORTAL_PERMISSIONS } from './components/ModuleConfiguracoesSistemas';
import ModuleConfigVisual from './components/ModuleConfigVisual';
import ModuleBackup from './components/ModuleBackup';
import ModuleUtilitarios from './components/ModuleUtilitarios';
import ModuleConciliacaoBancaria from './components/ModuleConciliacaoBancaria';
import ModulePortalPastor from './components/ModulePortalPastor';
import ModulePortalTesoureiro from './components/ModulePortalTesoureiro';
import ModuleSobre from './components/ModuleSobre';
import ModuleRelatorios from './components/ModuleRelatorios';
import ModuleMinisterios from './components/ModuleMinisterios';
import ModuleMissoes from './components/ModuleMissoes';
import ModuleCarnes from './components/ModuleCarnes';
import ModuleLixeira from './components/ModuleLixeira';
import ModuleAcessosPortal from './components/ModuleAcessosPortal';
import ModuleCredencial from './components/ModuleCredencial';
import ModuleCarteirinha from './components/ModuleCarteirinha';
import ModuleAuditoria from './components/ModuleAuditoria';
import ModuleVisitantes from './components/ModuleVisitantes';
import ModulePatrimonio from './components/ModulePatrimonio';
import ModuleCelulas from './components/ModuleCelulas';
import ModuleBoletim from './components/ModuleBoletim';
import ModuleManualUsuario from './components/ModuleManualUsuario';
import { InteractiveMagazineView } from './components/InteractiveMagazineView';
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
      return data.text || "Não foi possível gerar resposta. Tente novamente.";
    } catch (error) {
      if (i === retries - 1) return `Erro na IA: ${error.message}`;
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

export const resizeImageAndCompress = (dataUrl: string, maxWidth = 200, maxHeight = 200, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve("");
      return;
    }
    
    // Se não for um data URL, resolve de imediato (ex: links do unsplash)
    if (!dataUrl.startsWith("data:")) {
      resolve(dataUrl);
      return;
    }

    // Corrige tipo de stream se for lido incorretamente como octet-stream para permitir renderização em Image
    let processedDataUrl = dataUrl;
    if (dataUrl.startsWith("data:application/octet-stream")) {
      processedDataUrl = dataUrl.replace("data:application/octet-stream", "data:image/jpeg");
    }

    const img = new window.Image();
    
    // Configura os eventos corretos ANTES de atribuir img.src para evitar corrida de threads do browser
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Comprime mantendo proporção ideal dentro dos limites de largura/altura
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        if (ratio < 1) {
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(processedDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const result = canvas.toDataURL('image/jpeg', quality);
        
        // Se a string ainda for absurdamente grande, faz compressão recursiva incremental de segurança
        if (result.length > 100000 && quality > 0.3) {
          resizeImageAndCompress(processedDataUrl, maxWidth, maxHeight, quality - 0.25).then(resolve);
        } else {
          resolve(result);
        }
      } catch (err) {
        resolve(processedDataUrl);
      }
    };

    img.onerror = () => {
      resolve(processedDataUrl);
    };

    img.src = processedDataUrl;
  });
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
  dbFirestore = getFirestore(app);
  try {
      enableIndexedDbPersistence(dbFirestore).catch((err) => {
          if (err.code == 'failed-precondition') console.warn('Múltiplas abas abertas, persistência offline ativada apenas numa.');
          else if (err.code == 'unimplemented') console.warn('O navegador não suporta persistência offline.');
      });
  } catch (e) { console.warn('Persistência offline já inicializada ou não suportada.'); }
} catch (error) {
  console.error("Erro crítico na inicialização do Firebase:", error);
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
        body[data-os-theme="win11"] { background-color: #f3f4f6; background-image: none; font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif; }
        body[data-os-theme="win11"] .glass-modern, body[data-os-theme="win11"] .glass-card, body[data-os-theme="win11"] .glass-panel { background: rgba(255, 255, 255, 0.7) !important; backdrop-filter: blur(40px) saturate(200%) !important; border: 1px solid rgba(255, 255, 255, 0.8) !important; border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05) !important; }
        body[data-os-theme="win11"].theme-dark { background-color: #111111; }
        body[data-os-theme="win11"].theme-dark .glass-modern, body[data-os-theme="win11"].theme-dark .glass-card { background: rgba(30, 30, 30, 0.7) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
        body[data-os-theme="win11"] button { border-radius: 8px !important; }
        body[data-os-theme="win11"] input, body[data-os-theme="win11"] select, body[data-os-theme="win11"] textarea { border-radius: 8px !important; border-bottom: 2px solid var(--primary) !important; }
        body[data-os-theme="win11"] svg { stroke-width: 1.5px !important; stroke-linecap: round !important; stroke-linejoin: round !important; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.05)); }

        body[data-os-theme="winxp"] {
            background: url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Bliss_%28Windows_XP%29.png/1440px-Bliss_%28Windows_XP%29.png') center/cover no-repeat fixed, linear-gradient(to bottom, #5998D6 0%, #76A8D9 50%, #75A943 50%, #4D8E2E 100%) !important;
            font-family: Tahoma, 'Trebuchet MS', Arial, sans-serif !important;
            color: #000000 !important;
            image-rendering: auto !important;
        }

        /* Animações e Transições Suaves do Windows XP */
        @keyframes xp-window-entrance {
            from {
                opacity: 0;
                transform: scale(0.96) translateY(8px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        body[data-os-theme="winxp"] .interactive-window-backdrop {
            background-color: rgba(0, 0, 0, 0.35) !important;
            backdrop-filter: blur(1.5px) !important;
            transition: all 0.3s ease-in-out;
        }

        body[data-os-theme="winxp"] .interactive-window-main {
            animation: xp-window-entrance 0.25s cubic-bezier(0.1, 0.9, 0.2, 1) forwards !important;
            background: #ece9d8 !important;
            border: 3px solid #0054e3 !important;
            border-radius: 8px 8px 4px 4px !important;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45) !important;
            font-family: Tahoma, Arial, sans-serif !important;
            overflow: hidden;
        }

        body[data-os-theme="winxp"] .interactive-window-header {
            background: linear-gradient(to bottom, #1e72e1 0%, #1656c0 10%, #1247a8 50%, #1247a8 51%, #1d69e4 100%) !important;
            border-bottom: 2px solid #002d96 !important;
            border-radius: 5px 5px 0 0 !important;
            color: #ffffff !important;
            padding: 8px 14px !important;
            text-shadow: 1px 1px 1px #002d96 !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
        }

        body[data-os-theme="winxp"] .interactive-window-title {
            font-family: Tahoma, sans-serif !important;
            font-weight: bold !important;
            font-size: 14.5px !important;
            color: #ffffff !important;
            letter-spacing: 0.3px !important;
        }

        body[data-os-theme="winxp"] .interactive-window-subtitle {
            color: #bfd5ff !important;
            font-family: Tahoma, sans-serif !important;
            font-weight: bold !important;
            font-size: 9px !important;
            letter-spacing: 0.2em !important;
        }

        body[data-os-theme="winxp"] .interactive-window-icon-container {
            background: rgba(255, 255, 255, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.45) !important;
            border-radius: 4px !important;
            width: 32px !important;
            height: 32px !important;
        }

        /* Estilo Autêntico de Botões Luna do Windows XP no Painel Superior */
        body[data-os-theme="winxp"] .interactive-window-btn {
            width: 21px !important;
            height: 21px !important;
            border-radius: 3px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-left: 2px !important;
            transition: all 0.1s ease !important;
            box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.55), 1px 1px 1px rgba(0, 0, 0, 0.15) !important;
        }

        body[data-os-theme="winxp"] .interactive-window-btn-reset,
        body[data-os-theme="winxp"] .interactive-window-btn-resize {
            background: linear-gradient(to bottom, #9ebcf2 0%, #5d93ec 45%, #2564db 55%, #3d80ea 100%) !important;
            border: 1px solid #1c4ea3 !important;
        }

        body[data-os-theme="winxp"] .interactive-window-btn-reset:hover,
        body[data-os-theme="winxp"] .interactive-window-btn-resize:hover {
            background: linear-gradient(to bottom, #b8cefa 0%, #7fabf5 45%, #427ee8 55%, #5e9cf5 100%) !important;
            filter: brightness(1.1);
        }

        body[data-os-theme="winxp"] .interactive-window-btn-reset svg,
        body[data-os-theme="winxp"] .interactive-window-btn-resize svg {
            color: #ffffff !important;
            filter: none !important;
            stroke-width: 3px !important;
        }

        body[data-os-theme="winxp"] .interactive-window-btn-close {
            background: linear-gradient(to bottom, #f39174 0%, #e35a3e 45%, #d13a1a 55%, #da5f3d 100%) !important;
            border: 1px solid #701500 !important;
        }

        body[data-os-theme="winxp"] .interactive-window-btn-close:hover {
            background: linear-gradient(to bottom, #f7b29d 0%, #ea7d66 45%, #e04a29 55%, #e78267 100%) !important;
            filter: brightness(1.15);
        }

        body[data-os-theme="winxp"] .interactive-window-btn-close:active {
            background: linear-gradient(to bottom, #be3316 0%, #cd4226 100%) !important;
            box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4) !important;
        }

        body[data-os-theme="winxp"] .interactive-window-btn-close svg {
            color: #ffffff !important;
            filter: none !important;
            stroke-width: 3px !important;
        }

        body[data-os-theme="winxp"] .interactive-window-content {
            background-color: #f1ebd9 !important; /* Visual suave e clássico das janelas de diálogo do XP */
            border: 1px solid #919082 !important;
            border-radius: 0px !important;
            margin: 8px !important;
            padding: 20px !important;
            box-shadow: inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 0px #ffffff !important;
        }

        body[data-os-theme="winxp"] .interactive-window-footer {
            background: #ece9d8 !important;
            border-top: 1px solid #d8d2bd !important;
            padding: 12px 16px !important;
            display: flex !important;
            gap: 12px !important;
        }

        /* Scrollbar Retro do Windows XP */
        body[data-os-theme="winxp"] ::-webkit-scrollbar {
            width: 16px !important;
            height: 16px !important;
        }
        body[data-os-theme="winxp"] ::-webkit-scrollbar-track {
            background: #ece9d8 url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='2' height='2' fill='%23ffffff'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23ffffff'/%3E%3Crect x='2' width='2' height='2' fill='%23dcd9cd'/%3E%3Crect y='2' width='2' height='2' fill='%23dcd9cd'/%3E%3C/svg%3E") repeat !important;
        }
        body[data-os-theme="winxp"] ::-webkit-scrollbar-thumb {
            background-color: #ece9d8 !important;
            border: 1px solid #919082 !important;
            box-shadow: inset 1px 1px 0px #ffffff, inset -1px -1px 0px #b5b2a0 !important;
        }
        body[data-os-theme="winxp"] ::-webkit-scrollbar-thumb:hover {
            background-color: #f1efe2 !important;
        }

        /* Janelas e Cards Luna Clássico */
        body[data-os-theme="winxp"] .glass-modern, 
        body[data-os-theme="winxp"] .glass-card, 
        body[data-os-theme="winxp"] .glass-panel {
            background: #ece9d8 !important;
            backdrop-filter: none !important;
            border: 3px solid #0054e3 !important;
            border-radius: 8px 8px 0px 0px !important;
            box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.45) !important;
            color: #000000 !important;
            padding: 12px !important;
        }

        /* Inversão de textos do tema escuro global que possam conflitar com o fundo claro das janelas XP */
        body[data-os-theme="winxp"] .text-slate-900,
        body[data-os-theme="winxp"] .text-slate-800,
        body[data-os-theme="winxp"] .text-slate-700,
        body[data-os-theme="winxp"] h1,
        body[data-os-theme="winxp"] h2,
        body[data-os-theme="winxp"] h3,
        body[data-os-theme="winxp"] h4,
        body[data-os-theme="winxp"] .text-gray-900,
        body[data-os-theme="winxp"] .text-zinc-900 {
            color: #000000 !important;
            text-shadow: none !important;
        }
        
        body[data-os-theme="winxp"] .text-slate-600,
        body[data-os-theme="winxp"] .text-slate-500,
        body[data-os-theme="winxp"] .text-gray-600 {
            color: #3d3d3d !important;
        }

        /* Cabeçalhos Simulando a Barra de Título Azul do Windows XP */
        body[data-os-theme="winxp"] .border-b.border-white\\/30, 
        body[data-os-theme="winxp"] .border-b.border-slate-100,
        body[data-os-theme="winxp"] .glass-modern > div:first-child,
        body[data-os-theme="winxp"] .glass-card > div:first-child {
            background: linear-gradient(to bottom, #1e72e1 0%, #1656c0 50%, #1247a8 50%, #1d69e4 100%) !important;
            color: white !important;
            border: none !important;
            border-bottom: 1px solid #002d96 !important;
            border-radius: 5px 5px 0 0 !important;
            padding: 8px 12px !important;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.7) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
        }

        body[data-os-theme="winxp"] .border-b.border-white\\/30 *, 
        body[data-os-theme="winxp"] .border-b.border-slate-100 *,
        body[data-os-theme="winxp"] .glass-modern > div:first-child *,
        body[data-os-theme="winxp"] .glass-card > div:first-child * {
            color: #ffffff !important;
        }

        /* Barra de Tarefas Lateral / Sidebar no Estilo do Painel do Windows Explorer */
        body[data-os-theme="winxp"] aside {
            background: linear-gradient(to bottom, #749be8 0%, #5d81d2 100%) !important;
            border-right: 3px solid #0054e3 !important;
            border-radius: 0px !important;
            box-shadow: none !important;
        }
        body[data-os-theme="winxp"] aside * {
            color: #002d96 !important;
        }
        body[data-os-theme="winxp"] aside .bg-slate-[#131154]/50,
        body[data-os-theme="winxp"] aside .bg-slate-900\/50,
        body[data-os-theme="winxp"] aside [class*="bg-"] {
            background-color: transparent !important;
        }
        body[data-os-theme="winxp"] aside a,
        body[data-os-theme="winxp"] aside button {
            background: linear-gradient(to bottom, #ffffff 0%, #f4f6fb 100%) !important;
            border: 1px solid #9fb9ef !important;
            border-radius: 5px !important;
            padding: 8px 12px !important;
            color: #002d96 !important;
            margin-bottom: 4px !important;
            font-weight: bold !important;
            text-shadow: none !important;
            box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05) !important;
            transition: all 0.15s ease !important;
        }
        body[data-os-theme="winxp"] aside a:hover,
        body[data-os-theme="winxp"] aside button:hover {
            text-decoration: none !important;
            background: #ffea9f !important;
            border-color: #fca724 !important;
            color: #002d96 !important;
            transform: translateX(2px);
        }

        /* Inputs e Formulários */
        body[data-os-theme="winxp"] input, 
        body[data-os-theme="winxp"] select, 
        body[data-os-theme="winxp"] textarea {
            border-radius: 0px !important;
            border: 1px solid #7f9db9 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 4px 6px !important;
            box-shadow: none !important;
            font-family: Tahoma, Arial, sans-serif !important;
        }
        body[data-os-theme="winxp"] input:focus, 
        body[data-os-theme="winxp"] select:focus, 
        body[data-os-theme="winxp"] textarea:focus {
            border: 1px solid #14358a !important;
            outline: none !important;
        }
        body[data-os-theme="winxp"] input[type="checkbox"] {
            width: 13px !important;
            height: 13px !important;
            appearance: checkbox !important;
            border: 1px solid #808080 !important;
            border-radius: 0px !important;
        }

        /* Botão Iniciar e Botões Gerais XP Luna */
        body[data-os-theme="winxp"] button {
            background: linear-gradient(to bottom, #faf9f5 0%, #f4f3ee 45%, #e3e1da 85%, #d8d5cb 100%) !important;
            color: #000000 !important;
            border: 1px solid #003c74 !important;
            border-radius: 3px !important;
            box-shadow: inset 1px 1px 0px #ffffff, 1px 1px 2px rgba(0,0,0,0.15) !important;
            text-shadow: none !important;
            font-weight: normal !important;
            padding: 5px 14px !important;
            transition: none !important;
        }
        body[data-os-theme="winxp"] button:hover {
            background: linear-gradient(to bottom, #ffea9f 0%, #fed276 45%, #fcb847 85%, #ffcf78 100%) !important;
            border: 1px solid #e59310 !important;
        }
        body[data-os-theme="winxp"] button:active {
            background: linear-gradient(to bottom, #e3e1da 0%, #d8d5cb 100%) !important;
            box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2) !important;
        }

        /* Botões Primários no Estilo Verde Oliva / Botão Iniciar */
        body[data-os-theme="winxp"] button.bg-indigo-600,
        body[data-os-theme="winxp"] button.bg-emerald-600,
        body[data-os-theme="winxp"] button.bg-blue-600,
        body[data-os-theme="winxp"] button.bg-gradient-to-r,
        body[data-os-theme="winxp"] button[type="submit"] {
            background: linear-gradient(to bottom, #3cc03c 0%, #2ba52b 45%, #198019 85%, #116811 100%) !important;
            color: #ffffff !important;
            font-weight: bold !important;
            border: 1px solid #104c10 !important;
            border-radius: 3px !important;
            box-shadow: inset 1px 1px 1px rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.2) !important;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.4) !important;
            padding: 6px 16px !important;
        }
        body[data-os-theme="winxp"] button.bg-indigo-600:hover,
        body[data-os-theme="winxp"] button.bg-emerald-600:hover,
        body[data-os-theme="winxp"] button.bg-blue-600:hover,
        body[data-os-theme="winxp"] button.bg-gradient-to-r:hover,
        body[data-os-theme="winxp"] button[type="submit"]:hover {
            background: linear-gradient(to bottom, #5fe45f 0%, #30b130 50%, #1a8e1a 100%) !important;
        }

        body[data-os-theme="winxp"] table {
            background-color: #ffffff !important;
            border-collapse: collapse !important;
            border: 1px solid #d6dff7 !important;
        }
        body[data-os-theme="winxp"] th {
            background: linear-gradient(to bottom, #faf9f6 0%, #f2f0e8 100%) !important;
            color: #000000 !important;
            border: 1px solid #d6dff7 !important;
            font-weight: bold !important;
        }
        body[data-os-theme="winxp"] td {
            border: 1px solid #e1e1e1 !important;
            color: #000000 !important;
            background-color: #ffffff !important;
        }
        body[data-os-theme="winxp"] tr:nth-child(even) td {
            background-color: #f7f5ef !important;
        }

        /* SVG Icons e Sombras Retro */
        body[data-os-theme="winxp"] svg {
            stroke-width: 2.2px !important;
            filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.25)) saturate(1.1);
        }

        /* Modal Customizada clássica do WinXP */
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 {
            backdrop-filter: none !important;
            background-color: rgba(0, 0, 0, 0.4) !important;
        }
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 > div {
            border-radius: 8px 8px 0px 0px !important;
            border: 4px solid #0054e3 !important;
            background: #ece9d8 !important;
            box-shadow: 6px 6px 20px rgba(0,0,0,0.6) !important;
        }
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 div[class*="bg-gradient-to-br"] {
            background: linear-gradient(to right, #0058e6 0%, #3a93ff 50%, #0058e6 100%) !important;
            border-radius: 4px 4px 0 0 !important;
            border-bottom: 1px solid #002d96 !important;
        }
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 input,
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 select {
            border: 1px solid #7f9db9 !important;
            background: #ffffff !important;
            color: #000000 !important;
        }
        body[data-os-theme="winxp"] .fixed.inset-0.bg-slate-900\\/60 button[class*="hover:bg-rose-500"] {
            background-color: #e04343 !important;
            border: 1px solid #721c1c !important;
            color: white !important;
            border-radius: 3px !important;
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

        body[data-os-theme="msdos"] { background-color: #000000 !important; background-image: none !important; font-family: 'Courier New', Courier, monospace !important; color: #33ff00 !important; text-transform: uppercase !important; }
        body[data-os-theme="msdos"] * { border-radius: 0 !important; box-shadow: none !important; backdrop-filter: none !important; border-color: #33ff00 !important; }
        body[data-os-theme="msdos"] [class*="bg-"] { background-color: #000000 !important; background-image: none !important; }
        body[data-os-theme="msdos"] [class*="text-"] { color: #33ff00 !important; text-shadow: none !important; -webkit-text-fill-color: #33ff00 !important; }
        body[data-os-theme="msdos"] button { background-color: #000000 !important; border: 1px solid #33ff00 !important; color: #33ff00 !important; transition: none !important; }
        body[data-os-theme="msdos"] button:hover, body[data-os-theme="msdos"] tr:hover td, body[data-os-theme="msdos"] .hover\\:bg-slate-50:hover { background-color: #33ff00 !important; color: #000000 !important; }
        body[data-os-theme="msdos"] button:hover *, body[data-os-theme="msdos"] tr:hover td * { color: #000000 !important; background-color: transparent !important; -webkit-text-fill-color: #000000 !important; }
        body[data-os-theme="msdos"] input, body[data-os-theme="msdos"] select, body[data-os-theme="msdos"] textarea { background-color: #000000 !important; border: 1px solid #33ff00 !important; color: #33ff00 !important; }
        body[data-os-theme="msdos"] input:focus, body[data-os-theme="msdos"] select:focus, body[data-os-theme="msdos"] textarea:focus { background-color: #33ff00 !important; color: #000000 !important; -webkit-text-fill-color: #000000 !important; outline: none !important; }
        body[data-os-theme="msdos"] svg { color: #33ff00 !important; filter: none !important; stroke-width: 2px !important; }
        body[data-os-theme="msdos"] button:hover svg { color: #000000 !important; }
        body[data-os-theme="msdos"] img { filter: grayscale(100%) contrast(1.5) sepia(1) hue-rotate(80deg) saturate(3) !important; border: 1px solid #33ff00 !important; }

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
    
    /* 1. Superfícies e Fundos Sólidos */
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

    /* 3. Tipografia Global (Inversão de Contrastes) */
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

    /* 5. Inputs, Modais e Formulários */
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

    /* 6. Tabelas Genéricas */
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

    /* 7. Paleta Suave de Emblemas (Status Badges/Alertas) - Ajusta saturação e contraste */
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

    /* 8. Correções para Gráficos Recharts no Modo Escuro */
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
      /* Reset global do documento para impressão limpa */
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
      
      /* Ocultar elementos de navegação, chatbot, botões, modais gerais, rodapés interativos, cabeçalhos, notificações, etc. */
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

      /* Forçar textos a ficarem nítidos e pretos para economia de tinta e contraste (exceto certificados) */
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

      /* Ajustes de Margem e Orientação de Página */
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

      /* Quebras de páginas elegantes */
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
      
      /* Estetização limpa de tabelas em relatórios impressos */
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
    const papelParede = context?.db?.igreja?.papel_parede;
    const osTheme = context?.osTheme || 'default';
    const isLightTheme = context?.theme === 'light';
    
    // Configurações personalizadas do usuário
    const animacaoTipoSelected = context?.db?.igreja?.tipo_animacao || 'auto';
    const activeAnim = animBgEnabled ? (animacaoTipoSelected === 'auto' ? (isSplash ? 'splash' : theme) : animacaoTipoSelected) : 'none';
    
    // Opacidade da película de contraste (de 0 a 100, padrão 40)
    const overlayOpacity = context?.db?.igreja?.papel_parede_opacidade !== undefined ? Number(context?.db?.igreja?.papel_parede_opacidade) : 40;
    
    // Classes de cores base em caso de não haver papel de parede
    const getBaseThemeStyles = () => {
        if (theme === 'win11') return "bg-[#f3f4f6] dark:bg-[#111111]";
        if (theme === 'winxp') return "bg-[#5998D6]";
        if (theme === 'win95') return "bg-[#008080]";
        if (theme === 'premium_black') return "bg-[#050505]";
        if (theme === 'msdos') return "bg-[#000022]";
        if (isLightTheme) {
            if (isSplash) {
                return "bg-[#eef6fc] bg-[radial-gradient(at_0%_0%,_rgba(186,230,253,0.5)_0,_transparent_50%),_radial-gradient(at_50%_0%,_rgba(219,234,254,0.7)_0,_transparent_50%)]";
            }
            return "bg-[#eef6fc]"; // fundo azul bem clarinho
        }
        if (isSplash) return "bg-[#0f172a] bg-[radial-gradient(at_0%_0%,_hsla(253,16%,7%,1)_0,_transparent_50%),_radial-gradient(at_50%_0%,_hsla(242,47%,18%,1)_0,_transparent_50%)]";
        return "bg-white"; // default
    };

    const WinxpButterfly = ({ className = "", style = {} }) => (
        <div className={`relative pointer-events-none select-none ${className}`} style={{ width: '16px', height: '16px', ...style }}>
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                <path d="M50 40 C35 20, 10 30, 25 55 C35 70, 48 65, 50 60 C52 65, 65 70, 75 55 C90 30, 65 20, 50 40 Z" />
            </svg>
        </div>
    );

    const Win95Logo = () => (
        <div className="relative flex flex-wrap gap-0.5 pointer-events-none select-none" style={{ width: '28px', height: '28px', transformStyle: 'preserve-3d' }}>
            <div className="w-[12px] h-[12px] bg-[#ff3333] border border-black/10" style={{ borderRadius: '40% 65% 40% 65% / 40% 65% 40% 65%' }} />
            <div className="w-[12px] h-[12px] bg-[#33cc33] border border-black/10" style={{ borderRadius: '65% 40% 65% 40% / 65% 40% 65% 40%' }} />
            <div className="w-[12px] h-[12px] bg-[#3366ff] border border-black/10" style={{ borderRadius: '65% 40% 65% 40% / 65% 40% 65% 40%' }} />
            <div className="w-[12px] h-[12px] bg-[#ffcc00] border border-black/10" style={{ borderRadius: '40% 65% 40% 65% / 40% 65% 40% 65%' }} />
            <div className="absolute top-0.5 left-0.5 -z-10 w-[24px] h-[24px] bg-black/30" style={{ transform: 'translateZ(-1px)' }} />
        </div>
    );

    const isDarkTheme = osTheme === 'dark' || osTheme === 'premium_black' || theme === 'premium_black';

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
                    {/* Película de contraste */}
                    {overlayOpacity > 0 && (
                        <div 
                            className="absolute inset-0 bg-black backdrop-blur-[0.5px]" 
                            style={{ opacity: overlayOpacity / 100 }}
                        />
                    )}
                </div>
            )}

            {/* Backdrops originais de sistema caso papel de parede não esteja ativo */}
            {!papelParede && theme === 'winxp' && (
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Bliss_%28Windows_XP%29.png/1440px-Bliss_%28Windows_XP%29.png')`, backgroundPosition: '50% 65%' }}
                />
            )}

            {/* ANIMAÇÃO SELECIONADA OU AUTOMÁTICA */}
            {(activeAnim === 'win11' || activeAnim === 'aurora') && (
                <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" style={{ animation: 'aurora-blob-1 20s infinite ease-in-out' }}></div>
            )}

            {activeAnim === 'winxp' && (
                <>
                    <style>{`
                        @keyframes xp-drift-cloud {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(calc(100vw + 400px)); }
                        }
                        @keyframes xp-flutter {
                            0%, 100% { transform: translate(0, 0) rotate(0deg); }
                            25% { transform: translate(30px, -45px) rotate(15deg); }
                            50% { transform: translate(60px, -20px) rotate(-10deg); }
                            75% { transform: translate(25px, 25px) rotate(20deg); }
                        }
                        @keyframes xp-flutter-fast {
                            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                            33% { transform: translate(-35px, -55px) rotate(-20deg) scale(0.9); }
                            66% { transform: translate(35px, -30px) rotate(30deg) scale(1.1); }
                        }
                    `}</style>
                    {/* Linha solar */}
                    <div 
                        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-100/20 filter blur-[80px]" 
                        style={{ animation: 'pulse-glow 6s infinite ease-in-out' }}
                    />
                    <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-yellow-200/10 filter blur-[40px]" />
                    
                    {/* Nuves do XP */}
                    <div className="absolute top-[8%] left-[-250px] w-56 h-12 bg-white/45 rounded-full filter blur-[6px]"
                         style={{ animation: 'xp-drift-cloud 55s linear infinite', animationDelay: '0s' }} />
                    <div className="absolute top-[18%] left-[-300px] w-64 h-16 bg-white/50 rounded-full filter blur-[5px]"
                         style={{ animation: 'xp-drift-cloud 40s linear infinite', animationDelay: '-12s' }} />
                    <div className="absolute top-[28%] left-[-200px] w-48 h-10 bg-white/40 rounded-full filter blur-[4px]"
                         style={{ animation: 'xp-drift-cloud 30s linear infinite', animationDelay: '-5s' }} />
                    <div className="absolute top-[3%] left-[-350px] w-80 h-20 bg-white/30 rounded-full filter blur-[8px]"
                         style={{ animation: 'xp-drift-cloud 80s linear infinite', animationDelay: '-25s' }} />

                    {/* Borboletas */}
                    <div className="absolute bottom-[20%] left-[15%] w-6 h-6 text-amber-500 pointer-events-none"
                         style={{ animation: 'xp-flutter 12s ease-in-out infinite' }}>
                        <WinxpButterfly />
                    </div>
                    <div className="absolute bottom-[28%] right-[25%] w-5 h-5 text-sky-400 pointer-events-none"
                         style={{ animation: 'xp-flutter-fast 9s ease-in-out infinite', animationDelay: '-3s' }}>
                        <WinxpButterfly />
                    </div>
                    
                    {/* Brilhos de relva */}
                    <div className="absolute bottom-[10%] left-[35%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping opacity-60" style={{ animationDuration: '3s' }} />
                    <div className="absolute bottom-[15%] right-[45%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping opacity-40" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
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
        <button type="button" onClick={() => setAnimBgEnabled?.(!animBgEnabled)} className={btnClass} title={animBgEnabled ? "Desativar Animação do Fundo" : "Ativar Animação do Fundo"}>
            {animBgEnabled ? <Zap size={iconSize} className="text-yellow-400 fill-yellow-400 animate-pulse" /> : <ZapOff size={iconSize} />}
        </button>
    );
};

const OsThemeToggle = ({ variant = 'default', className = "" }) => {
    const { osTheme, setOsTheme } = useContext(ChurchContext);
    const [isOpen, setIsOpen] = useState(false);
    const themesList = [
        { id: 'default', label: 'GIPP Padrão' }, { id: 'premium_black', label: 'Premium Black' },
        { id: 'win11', label: 'Windows 11' }, { id: 'winxp', label: 'Windows XP' },
        { id: 'win95', label: 'Windows 95' }, { id: 'msdos', label: 'MS-DOS 6.22' }
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
                            <button key={t.id} onClick={() => { setOsTheme(t.id); setIsOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-slate-50 ${osTheme === t.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'}`}>
                                {t.label} {osTheme === t.id && <Check size={14} className="inline float-right mt-0.5"/>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const ChurchContext = createContext();

export const playMenuSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode); gainNode.connect(ctx.destination);
        osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.02);
    } catch (e) { }
};

export const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc1 = ctx.createOscillator(); const gain1 = ctx.createGain();
        osc1.type = 'sine'; osc1.frequency.setValueAtTime(783.99, ctx.currentTime); 
        gain1.gain.setValueAtTime(0, ctx.currentTime); gain1.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02); gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc1.connect(gain1); gain1.connect(ctx.destination); osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.2);
    } catch(e) { }
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

export const getTodayDate = () => { const date = new Date(); const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; };
export const formatDateLocal = (dateString) => { 
    if (!dateString) return '---'; 
    try { if (typeof dateString !== 'string') return '---'; const [year, month, day] = dateString.split('-'); return `${day}/${month}/${year}`; } catch(e) { return dateString; } 
};

export const isValidCPF = (cpf: string): boolean => {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) return false;
    return true;
};

export const formatCPF = (v: string): string => {
    if (!v) return '';
    const clean = v.replace(/\D/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
};

export const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text; textArea.style.top = "0"; textArea.style.left = "0"; textArea.style.position = "fixed";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(textArea);
};

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
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
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

const MOCK_DB = { igreja: { nome: "GIPP - GESTÃO DE IGREJA", cnpj: "12.345.678/0001-90", endereco: "Rua das Oliveiras, 123", cidade: "São Paulo", uf: "SP", telefone: "(11) 98765-4321", email: "contato@adnovavida.com.br", site: "www.adnovavida.com.br", dataFundacao: "", pastor: "Pr. João Silva", vicePresidente1: "", vicePresidente2: "", tesoureiro1: "", tesoureiro2: "", secretario1: "", secretario2: "", contador: "", logo: null, chave_pix: "12.345.678/0001-90" }, membros: [], celulas: [], congregacoes: [], fornecedores: [], departamentos: [], centro_custo: [], usuarios: [ { id: 'admin-master', nome: "Administrador Master", usuario: "ADM", senha: "123", nivel: "master", permissoes: [] } ], financeiro: [], carnes: [], ebd: { turmas: [], professores: [], alunos: [], licoes: [] }, missoes: { missionarios: [], agencias: [], colaboradores: [], agenda: [] }, agenda: [], tarefas: [], projetos_midia: [], solicitacoes: [], trash: {}, auditoria: [], visitantes: [], patrimonio: [], emails: [], mural: [], pastor_agenda: [], pastor_mensagens: [], pastor_esbocos: [], pastor_atas: [], pastor_liturgias: [], support_chats: [], orcamentos: [], kids_criancas: [], kids_presencas: [], kids_ocorrencias: [] };

export const ICON_MAP = { Sun, Book, Mic, Flame, BookOpen, Droplets, Globe, Heart, Star, Calendar, Clock, Users, Shield, MapPin, Target, Activity, Music: Mic, Megaphone, Newspaper };
export const getIcon = (name) => ICON_MAP[name] || Star;
export const THEME_COLORS = ['amber', 'blue', 'purple', 'orange', 'emerald', 'pink', 'rose', 'indigo', 'teal', 'cyan', 'slate'];
export const REGRA_DOMINGOS = ['1º Domingo', '2º Domingo', '3º Domingo', '4º Domingo', 'Últ. Domingo', 'Consultar Avisos'];

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

const ToastContainer = ({ toasts, removeToast }) => ( 
  <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none print:hidden"> 
    {toasts.map(toast => ( 
      <div key={toast.id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] text-white min-w-[340px] max-w-md pointer-events-auto transform transition-all duration-500 animate-slide-in backdrop-blur-2xl border border-white/20 ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90' : toast.type === 'error' ? 'bg-gradient-to-r from-rose-600/90 to-red-600/90' : 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90'}`}> 
        <div className="p-2 bg-white/20 rounded-full shrink-0 shadow-inner"> 
          {toast.type === 'success' && <CheckCircle size={24} className="animate-pulse"/>} 
          {toast.type === 'error' && <AlertCircle size={24} className="animate-pulse"/>} 
          {toast.type === 'info' && <Info size={24} className="animate-pulse"/>} 
        </div> 
        <div className="flex-1">
          <h4 className="font-bold text-sm tracking-wide mb-0.5 uppercase">{toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Erro' : 'Informação'}</h4>
          <p className="text-xs text-white/90 font-medium leading-relaxed">{toast.message}</p>
        </div> 
        <button onClick={() => removeToast(toast.id)} className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X size={18}/></button> 
      </div> 
    ))} 
  </div> 
);

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: { children: React.ReactNode, onClick?: (e: any) => void, variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost', className?: string, [x: string]: any }) => { 
  const variants = { 
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border-0 hover:-translate-y-1 hover:scale-105 bg-[length:200%_auto] hover:bg-right transition-all duration-500", 
    secondary: "bg-white/80 backdrop-blur-md text-slate-700 border-white hover:bg-white hover:border-indigo-200 shadow-sm border hover:shadow-md hover:-translate-y-0.5", 
    danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 border-0 hover:-translate-y-1 hover:scale-105", 
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 border-0 hover:-translate-y-1 hover:scale-105", 
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border-transparent hover:backdrop-blur-sm" 
  }; 
  return (<button className={`relative overflow-hidden px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 ${variants[variant]} ${className}`} onClick={onClick} {...props}>{children}</button>); 
};

export const FormInput = ({ label, value, onChange, type = "text", required = false, className="", placeholder="", preserveCase = false, ...props }: { label: any; value: any; onChange: any; type?: string; required?: boolean; className?: string; placeholder?: string; preserveCase?: boolean; [key: string]: any }) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || value.label || '') : (value || '');
    return ( 
      <div className={`mb-6 group ${className}`}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1 transition-colors group-focus-within:text-indigo-600">{label} {required && <span className="text-rose-500">*</span>}</label>
        <input type={type} className={`input-futuristic w-full rounded-2xl p-4 text-sm shadow-sm text-slate-700 placeholder:text-slate-400 backdrop-blur-sm ${!preserveCase && type !== 'password' && type !== 'email' ? 'uppercase' : 'normal-case'}`} value={safeVal} onChange={e => {
          let val = e.target.value;
          if (!preserveCase && (type === 'text' || type === 'search' || !type)) {
             val = typeof val === 'string' ? val.toUpperCase() : val;
          }
          onChange(val);
        }} required={required} placeholder={placeholder} {...props}/>
      </div> 
    );
};

export const FormSelect = ({ label, value, onChange, options, className="", ...props }: { label: any; value: any; onChange: any; options: any; className?: string; [key: string]: any }) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || '') : (value || '');
    return ( 
      <div className={`mb-6 group ${className}`}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1 transition-colors group-focus-within:text-indigo-600">{label}</label>
        <div className="relative">
          <select className="input-futuristic w-full rounded-2xl p-4 text-sm bg-white/50 appearance-none cursor-pointer text-slate-700 shadow-sm pr-10 backdrop-blur-sm" value={safeVal} onChange={e => onChange(e.target.value)} {...props}>
            <option value="">Selecione...</option>
            {options.map((opt, idx) => {
                const isObj = typeof opt === 'object' && opt !== null;
                const val = isObj ? (opt.value || opt) : opt;
                let lab = isObj ? (opt.label || opt.nome || opt.titulo || opt.value) : opt;
                if (typeof lab === 'object') lab = JSON.stringify(lab);
                return <option key={idx} value={val}>{lab}</option>;
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-500 transition-colors"><ChevronDown size={18} /></div>
        </div>
      </div> 
    );
};

export const BackupModal = ({ backupState, onConfirm, onCancel }) => {
    if (!backupState.isOpen) return null;
    const { mode, stage, progress, stats } = backupState;

    const StatsDisplay = ({ data }) => {
        if (!data) return null;
        const items = [
            { label: 'Membros', count: data.membros || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Financeiro', count: data.financeiro || 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Células', count: data.celulas || 0, icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Agenda', count: data.agenda || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Carnês', count: data.carnes || 0, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Usuários', count: data.usuarios || 0, icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
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

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[11000] flex items-center justify-center p-4 backdrop-blur-md animate-entrance">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative">
                <div className="p-8 pb-4 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${mode==='import'?'bg-amber-100 text-amber-600':'bg-indigo-100 text-indigo-600'}`}>
                        {mode === 'import' ? <UploadCloud size={40}/> : <Database size={40}/>}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        {mode === 'logout' ? 'Backup ao Sair' : mode === 'export' ? 'Exportar Backup' : 'Restaurar Backup'}
                    </h3>
                    
                    {stage === 'initial' && mode === 'import' && <p className="text-slate-500 font-medium px-4 mb-4">O sistema será atualizado com os seguintes dados:</p>}
                    {stage === 'initial' && mode === 'export' && <p className="text-slate-500 font-medium px-4 mb-4">O seguinte conteúdo será salvo no arquivo:</p>}
                    {stage === 'initial' && mode === 'logout' && <p className="text-slate-500 font-medium px-4 mb-4">Deseja realizar uma cópia de segurança antes de sair?</p>}
                    
                    {stage === 'processing' && <p className="text-slate-500 font-medium px-4">Processando dados...</p>}
                    {stage === 'finished' && mode === 'import' && <p className="text-emerald-600 font-bold px-4 mb-4">Importação concluída! Resumo do sistema:</p>}
                    {stage === 'finished' && mode === 'export' && <p className="text-emerald-600 font-bold px-4 mb-4">Arquivo gerado com sucesso!</p>}
                </div>

                <div className="px-8 pb-2">
                    {(stage === 'initial' || (stage === 'finished' && mode === 'import')) && stats && (
                        <StatsDisplay data={stats} />
                    )}
                </div>

                <div className="p-8 pt-2 bg-slate-50/50 flex flex-col gap-3">
                    {stage === 'initial' && (
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={onCancel} className="flex-1 bg-white border border-slate-200">
                                {mode === 'logout' ? 'Não, Apenas Sair' : 'Cancelar'}
                            </Button>
                            <Button variant="primary" onClick={onConfirm} className="flex-1">
                                {mode === 'logout' ? 'Sim, Backup e Sair' : mode === 'import' ? 'Confirmar Importação' : 'Confirmar Exportação'}
                            </Button>
                        </div>
                    )}
                    {stage === 'processing' && (
                        <div className="space-y-2">
                            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                <div className="h-full bg-indigo-500 animate-pulse transition-all duration-300" style={{width: `${progress}%`}}></div>
                            </div>
                            <p className="text-center text-xs font-bold text-slate-400">{progress}% Concluído</p>
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

          if (!searchTerm) return true; 
          const term = searchTerm.toLowerCase();
          return Object.entries(item).some(([key, val]) => {
              if (['foto', 'logo', 'comprovante', 'banco_logo_base64', 'capa', 'icone_sistema'].includes(key)) return false;
              return safeText(val).toLowerCase().includes(term);
          });
      });
  }, [processedData, searchTerm, user]);
  
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

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
                {columns.map((c, i) => (<th key={i} className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">{c.header}</th>))}
                <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 bg-transparent">
            {paginatedData.map((item, idx) => (
              <tr key={item.id || `row-${idx}`} className="hover:bg-white/60 transition-all duration-300 group/row relative border-l-4 border-transparent hover:border-indigo-500">
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
              </tr>
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
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"><span className="text-xs font-bold">Próxima</span> <ChevronRight size={16}/></button>
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

    const handleInternalSave = async () => {
        setIsSaving(true);
        try { await onSave(); } finally { setIsSaving(false); }
    };

    const getModalTheme = (t) => {
        const themes = {
            membro: { icon: Users, color: 'indigo', title: 'Membro', bg: 'from-indigo-600 via-blue-600 to-indigo-800' },
            visitante: { icon: HeartHandshake, color: 'rose', title: 'Visitante', bg: 'from-rose-500 via-pink-500 to-rose-700' },
            celula: { icon: Share2, color: 'purple', title: 'Célula', bg: 'from-purple-600 via-fuchsia-600 to-purple-800' },
            financeiro: { icon: DollarSign, color: 'emerald', title: 'Lançamento', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            entrada: { icon: ArrowUpCircle, color: 'emerald', title: 'Entrada', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            saida: { icon: ArrowDownCircle, color: 'rose', title: 'Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            gestao_despesa: { icon: ArrowDownCircle, color: 'rose', title: 'Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            carne: { icon: CreditCard, color: 'pink', title: 'Carnê', bg: 'from-pink-500 via-rose-500 to-pink-700' },
            tarefa: { icon: CheckSquare, color: 'amber', title: 'Tarefa/Escala', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            agenda: { icon: Calendar, color: 'indigo', title: 'Evento', bg: 'from-indigo-500 via-purple-500 to-indigo-700' },
            ebd_turma: { icon: Users, color: 'blue', title: 'Turma EBD', bg: 'from-blue-500 via-indigo-500 to-blue-700' },
            ebd_aluno: { icon: UserPlus, color: 'indigo', title: 'Matrícula EBD', bg: 'from-indigo-500 via-purple-500 to-indigo-700' },
            ebd_licao: { icon: BookOpen, color: 'emerald', title: 'Lição EBD', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missionario: { icon: Globe, color: 'indigo', title: 'Missionário', bg: 'from-indigo-500 via-blue-500 to-indigo-700' },
            agencia_missoes: { icon: Building2, color: 'blue', title: 'Agência', bg: 'from-blue-500 via-cyan-500 to-blue-700' },
            missoes_colaborador: { icon: HeartHandshake, color: 'emerald', title: 'Colaborador', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missoes_financeiro: { icon: DollarSign, color: 'emerald', title: 'Caixa Missões', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            missoes_agenda: { icon: Calendar, color: 'amber', title: 'Evento Missões', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            congregacao: { icon: MapPin, color: 'indigo', title: 'Congregação', bg: 'from-indigo-600 via-blue-600 to-indigo-800' },
            fornecedor: { icon: Truck, color: 'slate', title: 'Fornecedor', bg: 'from-slate-600 via-slate-700 to-slate-800' },
            centro_custo: { icon: Landmark, color: 'slate', title: 'Centro de Custo', bg: 'from-slate-600 via-slate-700 to-slate-800' },
            patrimonio: { icon: Package, color: 'emerald', title: 'Patrimônio', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            usuario: { icon: Shield, color: 'slate', title: 'Usuário', bg: 'from-slate-700 via-slate-800 to-slate-900' },
            ministerio: { icon: Briefcase, color: 'indigo', title: 'Ministério', bg: 'from-indigo-500 via-blue-500 to-indigo-700' },
            ministerio_membro: { icon: UserPlus, color: 'blue', title: 'Membro de Ministério', bg: 'from-blue-500 via-cyan-500 to-blue-700' },
            ministerio_evento: { icon: Calendar, color: 'amber', title: 'Evento de Ministério', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            celula_membro: { icon: UserPlus, color: 'purple', title: 'Membro de Célula', bg: 'from-purple-500 via-pink-500 to-purple-700' },
            celula_evento: { icon: Calendar, color: 'amber', title: 'Evento de Célula', bg: 'from-amber-500 via-orange-500 to-amber-700' },
            celula_relatorio: { icon: FileText, color: 'blue', title: 'Relatório', bg: 'from-blue-500 via-indigo-500 to-blue-700' },
            fin_entrada_novo: { icon: ArrowUpCircle, color: 'emerald', title: 'Nova Entrada', bg: 'from-emerald-500 via-teal-500 to-emerald-700' },
            fin_saida_novo: { icon: ArrowDownCircle, color: 'rose', title: 'Nova Despesa', bg: 'from-rose-500 via-red-500 to-rose-700' },
            carne_novo: { icon: CreditCard, color: 'pink', title: 'Novo Carnê', bg: 'from-pink-500 via-rose-500 to-pink-700' },
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
                console.error("Erro ao pré-processar imagem de upload:", err);
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
            if (file.size > 500 * 1024) { alert("O ficheiro deve ter no máximo 500KB."); return; }
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
                    <UploadCloud size={18} className="group-hover:text-indigo-500 shrink-0"/> <span>Clique para anexar foto ou PDF<br/><span className="text-[10px] text-slate-400 font-medium">Tamanho máximo: 500KB</span></span>
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
                            <FormInput label="Descrição da Tarefa" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                            <FormSelect label="Categoria / Tipo" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={[
                                'Escala de Culto', 'Trabalho Evangelístico', 'Obra Social', 'Congresso / Conferência', 'Casamento', 'Batismo', 'Culto / Celebração', 'Administrativo'
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
                                     <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Função na Escala</label>
                                     <input type="text" className="input-futuristic w-full p-2.5 rounded-xl text-sm uppercase" placeholder="Ex: Dirigente, Louvor..." value={tempMember.funcao} onChange={e => setTempMember({...tempMember, funcao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})}/>
                                </div>
                                <button onClick={() => { if(!tempMember.id) return; const memberObj = db.membros.find(m => m.id === tempMember.id); const newTeam = [...(data.equipe || [])]; if(newTeam.find(t => t.id === tempMember.id)) { alert("Membro já adicionado."); return; } newTeam.push({ id: tempMember.id, nome: memberObj.nome || 'Membro', cargo_eclesiastico: memberObj.cargo || 'Membro', funcao_escala: tempMember.funcao || memberObj.cargo || 'Membro' }); setData({...data, equipe: newTeam}); setTempMember({id: '', funcao: ''}); }} className="bg-indigo-500 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200" type="button"><Plus size={20}/></button>
                            </div>
                            
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {(data.equipe || []).map((member, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{member.nome ? member.nome.charAt(0) : '?'}</div>
                                            <div><p className="font-bold text-sm text-slate-700 leading-tight">{member.nome}</p><p className="text-[10px] text-slate-500">{member.funcao_escala} <span className="opacity-50">• {member.cargo_eclesiastico}</span></p></div>
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
                        <FormInput label="Título do Evento" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                             <FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                             <FormInput label="Hora" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})} required/>
                        </div>
                        <FormInput label="Local" value={data.local} onChange={v=>setData({...data, local:v})} placeholder="Ex: Templo Principal"/>
                        <FormSelect label="Tipo de Evento" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Culto', 'Reunião', 'Evento Externo', 'Festividade', 'Ensaio']} />
                        
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
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Adicione uma imagem de divulgação do evento. Ela aparecerá em destaque no Informativo Digital dos membros.</p>
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
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Lembrete Push Automático (24h)</h4>
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
                                            placeholder="Ex: Amanhã às {hora} teremos nosso {evento} no {local}! Não falte."
                                            rows={2} 
                                            className="w-full p-3 rounded-xl border border-indigo-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 resize-none" 
                                        />
                                        <p className="text-[9px] text-indigo-500/80 font-bold mt-1.5 ml-1">
                                            Sugestão de variáveis: <code className="bg-indigo-150/60 px-1 py-0.5 rounded text-indigo-700">{`{evento}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{hora}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{local}`}</code>, <code className="bg-indigo-150/60 px-1.5 py-0.5 rounded text-indigo-700">{`{data}`}</code>
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
                        <FormInput label="Descrição / Motivo" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Valor (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} required/>
                            <FormInput label="Data Referência" type="date" value={data.data_competencia} onChange={v=>setData({...data, data_competencia:v})} required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect label="Categoria" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={['Dízimo', 'Oferta', 'Doação', 'Campanha', 'Vendas', 'Missões', 'Outros']} />
                            <FormSelect label="Forma de Entrada" value={data.forma_pagamento} onChange={v=>setData({...data, forma_pagamento:v})} options={['Dinheiro', 'PIX', 'Cartão', 'Transferência']} />
                        </div>
                        
                        {isMaster && (
                            <FormSelect label="Congregação / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />
                        )}
                        
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-500 uppercase mb-2">Vínculo de Membro (Opcional)</p>
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
                        <FormInput label="Descrição da Despesa" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required/>
                        <FormInput label="Especificação Detalhada" value={data.especificacao} onChange={v=>setData({...data, especificacao:v})} placeholder="Detalhes do serviço ou produto..."/>
                        
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
                            <FormSelect label="Congregação / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />
                        )}

                        {renderComprovanteUpload()}
                        <input type="hidden" value="saida" />
                    </div>
                );
             case 'ministerio': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome do Ministério" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <h4 className="font-bold text-slate-600 mt-2">Liderança</h4>
                        <FormSelect label="Líder Principal" value={data.lider1_id} onChange={v=>setData({...data, lider1_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        <FormSelect label="Segundo Líder (Opcional)" value={data.lider2_id} onChange={v=>setData({...data, lider2_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                    </div>
                );
             case 'ministerio_membro': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Selecione o Ministério" value={data.departamento_id} onChange={v=>setData({...data, departamento_id:v})} options={db.departamentos.map(d=>({label: d.nome, value: d.id}))} />
                        <FormSelect label="Selecione o Membro" value={data.membro_id} onChange={v=>setData({...data, membro_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        <FormInput label="Função no Ministério" value={data.funcao} onChange={v=>setData({...data, funcao:v})} placeholder="Ex: Secretário, Vogal, Regente" required/>
                    </div>
                );
             case 'ministerio_evento': 
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Ministério Responsável" value={data.departamento_id} onChange={v=>setData({...data, departamento_id:v})} options={db.departamentos.map(d=>({label: d.nome, value: d.id}))} />
                        <FormInput label="Título do Evento/Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                            <FormInput label="Horário" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/>
                        </div>
                        <FormInput label="Mensagem WhatsApp (Opcional)" value={data.whatsapp_msg} onChange={v=>setData({...data, whatsapp_msg:v})} placeholder="Texto padrão para envio"/>
                    </div>
                );
             case 'carne_novo': 
             case 'carne':
                return (
                    <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Título da Campanha / Carnê" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                         <FormSelect label="Membro Responsável" value={data.membro_id} onChange={v=>setData({...data, membro_id:v, nome_membro: db.membros.find(m=>m.id===v)?.nome})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                         {!data.id ? (
                             <>
                                 <div className="grid grid-cols-2 gap-4">
                                     <FormInput label="Valor Total (R$)" type="number" step="0.01" value={data.valor_total} onChange={v=>setData({...data, valor_total:v})} required/>
                                     <FormInput label="Qtd. Parcelas" type="number" value={data.qtd_parcelas} onChange={v=>setData({...data, qtd_parcelas:v})} required/>
                                 </div>
                                 <FormInput label="Data 1º Vencimento" type="date" value={data.primeiro_vencimento} onChange={v => setData({...data, primeiro_vencimento: v})} required/>
                             </>
                         ) : (
                             <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl text-xs text-amber-700 font-bold mt-2">
                                 Atenção: Apenas o título e o membro podem ser alterados após o carnê ser gerado. Valores e parcelas são fixos.
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
                             <FormSelect label="Selecione a Célula" value={data.celula_id} onChange={v => { const sel = (db.celulas||[]).find(c => c.id === v); const initPres = {}; if (sel && sel.membros) { sel.membros.forEach(m => initPres[m.integrante_id] = true); } setData({...data, celula_id: v, presencas: initPres}); }} options={(db.celulas||[]).map(c=>({label: c.nome, value: c.id}))} required />
                             <FormInput label="Data da Reunião" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                         </div>

                         {selectedCel && (
                             <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lista de Presença (Chamada)</h4>
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
                                                     <div><p className="text-sm font-bold text-slate-800">{nome || 'Não encontrado'}</p><p className="text-[10px] text-slate-500 uppercase tracking-widest">{isVisitante ? 'Visitante' : 'Membro'} • {m.funcao}</p></div>
                                                 </div>
                                                 <input type="checkbox" className="hidden" checked={isPresente || false} onChange={() => togglePresenca(memId)} />
                                                 <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isPresente ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{isPresente ? 'Presente' : 'Ausente'}</span>
                                             </label>
                                         );
                                     })}
                                     {(!selectedCel.membros || selectedCel.membros.length === 0) && <p className="text-xs text-slate-400 italic">Nenhum participante vinculado a esta célula.</p>}
                                 </div>
                             </div>
                         )}

                         <div className="mb-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Relatório Detalhado (Testemunhos, Ofertas, Oração)</label>
                             <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[150px] shadow-sm uppercase" value={data.relatorio || ''} onChange={e => setData({...data, relatorio: ((e.target.value || "").toUpperCase() || "").toUpperCase()})} placeholder="Descreva como foi a reunião..." required></textarea>
                         </div>
                     </div>
                 );
             case 'membro':
                 return (
                    <div className="space-y-6">
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} /> 1. Dados Pessoais & Filiação</h4>
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                    {data.foto ? <img src={data.foto} className="w-full h-full object-cover" /> : <Camera size={32} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer text-white text-xs font-bold p-2 text-center">Alterar<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'foto')} /></label>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Nome Completo" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: João da Silva" className="!mb-0"/>
                                    <FormInput label="CPF" value={data.cpf} onChange={v=>setData({...data, cpf:formatCPF(v)})} required placeholder="000.000.000-00" className="!mb-0"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Nome do Pai" value={data.nome_pai} onChange={v=>setData({...data, nome_pai:v})} placeholder="Filiação"/>
                                <FormInput label="Nome da Mãe" value={data.nome_mae} onChange={v=>setData({...data, nome_mae:v})} placeholder="Filiação"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Data Nascimento" type="date" value={data.data_nascimento} onChange={v=>setData({...data, data_nascimento:v})} />
                                <FormInput label="Naturalidade" value={data.naturalidade} onChange={v=>setData({...data, naturalidade:v})} placeholder="Ex: Rio de Janeiro - RJ"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Endereço Residencial" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Rua e Número"/>
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
                            <FormInput label="Profissão / Ocupação" value={data.profissao} onChange={v=>setData({...data, profissao:v})} placeholder="Ex: Engenheiro, Professor, Autônomo" />
                        </div>

                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                             <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Heart size={16} /> 2. Família & Estado Civil</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Estado Civil" value={data.estado_civil} onChange={v=>setData({...data, estado_civil:v})} options={['Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'Divorciado(a)', 'União Estável']} />
                                {data.estado_civil === 'Casado(a)' && <FormInput label="Nome do Cônjuge" value={data.nome_conjuge} onChange={v=>setData({...data, nome_conjuge:v})} />}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Tem Filhos?" value={data.tem_filhos} onChange={v=>setData({...data, tem_filhos:v})} options={[{label:'Sim', value:'sim'}, {label:'Não', value:'nao'}]} />
                                {data.tem_filhos === 'sim' && <FormInput label="Quantos Filhos?" type="number" value={data.qtd_filhos} onChange={v=>setData({...data, qtd_filhos:v})} />}
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                             <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={16} /> 3. Dados Eclesiásticos</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {isMaster && <FormSelect label="Congregação / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                                <FormSelect label="Cargo Eclesiástico" value={data.cargo} onChange={v=>setData({...data, cargo:v})} options={['Membro', 'Auxiliar', 'Diácono', 'Presbítero', 'Evangelista', 'Missionário', 'Pastor']} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Função Administrativa" value={data.funcao_administrativa || 'NENHUMA'} onChange={v=>setData({...data, funcao_administrativa:v})} options={['NENHUMA', 'PASTOR PRESIDENTE', 'PASTOR AUXILIAR', 'COORDENADOR', 'SUPERINTENDENTE', 'SECRETARIO', 'TESOUREIRO', 'CONTADOR', 'ADMINISTRADOR', 'ADVOGADO', 'AUXILIAR', 'LIDER DE DEPARTAMENTO']} />
                                <FormInput label="Nº Carteirinha" value={data.numero_registro} onChange={v=>setData({...data, numero_registro:v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Status de Atividade" value={data.status} onChange={v=>setData({...data, status:v})} options={['Ativo', 'Inativo']} />
                                <FormInput label="Data de Batismo" type="date" value={data.data_batismo} onChange={v=>setData({...data, data_batismo:v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Data de Admissão" type="date" value={data.data_admissao} onChange={v=>setData({...data, data_admissao:v})} />
                                <div />
                            </div>
                        </div>
                    </div>
                 );
             case 'usuario':
                 const gruposPermissoes = [
                     { titulo: "Administrativo & Cadastros", opcoes: [ { id: 'access_membros', label: 'Gestão de Membros & Acessos do Portal' }, { id: 'access_visitantes', label: 'CRM de Visitantes & Consolidação' }, { id: 'access_igreja', label: 'Matriz, Filiais & Contas Bancárias' }, { id: 'access_patrimonio', label: 'Gestão de Patrimônio & Inventário' }, { id: 'access_celulas', label: 'Células e Grupos' }, { id: 'access_ministerios', label: 'Ministérios (Departamentos)' } ] },
                     { titulo: "Financeiro", opcoes: [ { id: 'access_fin_entradas', label: 'Entradas e Dízimos' }, { id: 'access_fin_saidas', label: 'Saídas e Despesas' }, { id: 'access_fin_analise', label: 'DRE, Relatórios & Conciliação Bancária' }, { id: 'access_fin_carnes', label: 'Gestão de Carnês & Engajamento' }, { id: 'access_fin_cadastros', label: 'Utilitários (Fornecedores/C. Custo)' } ] },
                     { titulo: "Secretaria & Módulos", opcoes: [ { id: 'access_sec_agenda', label: 'Secretaria Digital (Agenda/Tarefas/Whats)' }, { id: 'access_sec_certificados', label: 'Certificados, Estúdio de Carteirinhas & Credenciais' }, { id: 'access_sec_relatorios', label: 'Central de Relatórios Oficiais (PDF)' }, { id: 'access_ebd', label: 'Gestão EBD' }, { id: 'access_gestao_cursos', label: 'EAD Cursos de Capacitação' }, { id: 'access_missoes', label: 'Missões (Missionários/Agências/Caixa)' } ] },
                     { titulo: "Comunicação, Mídia & IA", opcoes: [ { id: 'access_midia', label: 'Estúdio GIPP (Artes e Redes Sociais)' }, { id: 'access_boletim', label: 'Gestão do Boletim Digital' }, { id: 'access_email', label: 'Webmail Direto (Caixa de Entrada)' }, { id: 'access_ia', label: 'Assistente Pastoral IA' } ] },
                     { titulo: "Configurações Avançadas", opcoes: [ { id: 'access_config_sistema', label: 'Configurações de Sistemas' }, { id: 'access_config_visual', label: 'Personalização Visual' }, { id: 'access_config_backup', label: 'Backup Geral de Dados' }, { id: 'access_auditoria', label: 'Auditoria & Logs' }, { id: 'access_lixeira', label: 'Lixeira Virtual' } ] }
                 ];
                 const togglePermissao = (permId) => { const atuais = data.permissoes || []; if (atuais.includes(permId)) { setData({ ...data, permissoes: atuais.filter(p => p !== permId) }); } else { setData({ ...data, permissoes: [...atuais, permId] }); } };
                 const toggleAllInGroup = (opcoes) => { const atuais = data.permissoes || []; const todosIds = opcoes.map(o => o.id); const todosPresentes = todosIds.every(id => atuais.includes(id)); if (todosPresentes) { setData({ ...data, permissoes: atuais.filter(id => !todosIds.includes(id)) }); } else { const novos = [...new Set([...atuais, ...todosIds])]; setData({ ...data, permissoes: novos }); } };

                 return (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput label="Nome" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                            <FormInput label="Usuário (Login)" preserveCase value={data.usuario} onChange={v=>setData({...data, usuario:v})} required/>
                            <FormInput label="Senha" type="password" value={data.senha} onChange={v=>setData({...data, senha:v})} required/>
                            {isMaster && <FormSelect label="Congregação / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                            <FormSelect label="Nível de Acesso" value={data.nivel} onChange={v=>setData({...data, nivel:v})} options={[{label:'Master (Acesso Total)', value:'master'}, {label:'Restrito (Personalizado)', value:'restrito'}]} />
                        </div>
                        {data.nivel === 'restrito' && (
                            <div className="space-y-4 animate-entrance">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-2"><p className="text-xs font-bold text-indigo-700 flex items-center gap-2"><Lock size={14}/> Selecione os módulos que este usuário poderá acessar:</p></div>
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
                        <FormInput label="Nome da Célula / Grupo" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect label="Líder Principal" value={data.lider1_id} onChange={v=>setData({...data, lider1_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} required />
                            <FormSelect label="Líder Auxiliar (Opcional)" value={data.lider2_id} onChange={v=>setData({...data, lider2_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                        </div>
                        <FormInput label="Endereço / Local da Reunião" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Ex: Rua A, 123 - Casa do Irmão João" />
                        <FormInput label="Dia e Horário" value={data.horario} onChange={v=>setData({...data, horario:v})} placeholder="Ex: Toda Quinta-feira às 20:00" />
                     </div>
                 );
             case 'celula_membro':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Selecione a Célula" value={data.celula_id} onChange={v=>setData({...data, celula_id:v})} options={db.celulas.map(c=>({label: c.nome, value: c.id}))} required />
                        <FormSelect label="Tipo de Integrante" value={data.tipo_integrante} onChange={v=>setData({...data, tipo_integrante:v})} options={[{label:'Membro Oficial', value:'membro'}, {label:'Visitante / Convidado', value:'visitante'}]} required />
                        {data.tipo_integrante === 'visitante' ? <FormSelect label="Selecione o Visitante" value={data.integrante_id} onChange={v=>setData({...data, integrante_id:v})} options={db.visitantes.map(v=>({label: v.nome, value: v.id}))} required /> : <FormSelect label="Selecione o Membro" value={data.integrante_id} onChange={v=>setData({...data, integrante_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} required />}
                        <FormInput label="Função na Célula" value={data.funcao} onChange={v=>setData({...data, funcao:v})} placeholder="Ex: Anfitrião, Louvor, Participante" required/>
                     </div>
                 );
             case 'celula_evento':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Célula Responsável" value={data.celula_id} onChange={v=>setData({...data, celula_id:v})} options={db.celulas.map(c=>({label: c.nome, value: c.id}))} required />
                        <FormInput label="Título da Programação/Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required placeholder="Ex: Culto Festivo, Evangelismo, Jantar..."/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/><FormInput label="Horário" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/></div>
                        <FormInput label="Mensagem WhatsApp (Opcional)" value={data.whatsapp_msg} onChange={v=>setData({...data, whatsapp_msg:v})} placeholder="Convite padrão para envio aos membros"/>
                     </div>
                 );
             case 'congregacao':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Nome da Congregação" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Congregação Betel"/>
                         <FormSelect label="Dirigente / Pastor Local" value={data.dirigente_id} onChange={v=>setData({...data, dirigente_id:v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                         <FormInput label="Endereço Completo" value={data.endereco} onChange={v=>setData({...data, endereco:v})} placeholder="Ex: Rua das Flores, 123 - Bairro" />
                         <div className="grid grid-cols-2 gap-4"><FormInput label="Data de Abertura" type="date" value={data.data_abertura} onChange={v=>setData({...data, data_abertura:v})} /><FormInput label="Telefone / Contato" value={data.telefone} onChange={v=>setData({...data, telefone:v})} /></div>
                     </div>
                 );
             case 'fornecedor':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Razão Social / Nome" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                         <div className="grid grid-cols-2 gap-4"><FormInput label="CNPJ / CPF" value={data.cnpj} onChange={v=>setData({...data, cnpj:v})} /><FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Ativo', 'Inativo']} /></div>
                         <FormInput label="Telefone" value={data.telefone} onChange={v=>setData({...data, telefone:v})} />
                         <FormInput label="E-mail" value={data.email} onChange={v=>setData({...data, email:v})} />
                     </div>
                 );
             case 'centro_custo':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                         <FormInput label="Nome do Centro de Custo" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                         <FormInput label="Responsável" value={data.responsavel} onChange={v=>setData({...data, responsavel:v})} />
                     </div>
                 );
             case 'solicitacao_doc':
                 return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormSelect label="Membro Solicitante" value={data.membro_id} onChange={v=>setData({...data, membro_id:v, nome: db.membros.find(m=>m.id===v)?.nome})} options={db.membros.map(m=>({label:m.nome, value:m.id}))} />
                        <FormSelect label="Tipo de Documento" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Carta de Recomendação', 'Declaração de Membro', 'Histórico', 'Outro']}/>
                        <FormInput label="Observações" value={data.obs} onChange={v=>setData({...data, obs:v})}/>
                        <FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Pendente', 'Pronto', 'Entregue']}/>
                    </div>
                );
            case 'patrimonio':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome / Descrição do Bem" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Mesa de Som Yamaha, Ar Condicionado..."/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Nº de Tombo / Série" value={data.tombo} onChange={v=>setData({...data, tombo:v})} placeholder="Ex: PAT-001" /><FormInput label="Valor Estimado (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} /></div>
                        <div className="grid grid-cols-2 gap-4"><FormSelect label="Categoria" value={data.categoria} onChange={v=>setData({...data, categoria:v})} options={['Eletrônicos', 'Instrumentos Musicais', 'Móveis', 'Veículos', 'Imóveis', 'Outros']} required /><FormSelect label="Estado de Conservação" value={data.estado} onChange={v=>setData({...data, estado:v})} options={['Novo', 'Bom', 'Regular', 'Ruim', 'Em Manutenção', 'Baixado']} required /></div>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Data de Aquisição" type="date" value={data.data_aquisicao} onChange={v=>setData({...data, data_aquisicao:v})} /><FormInput label="Localização / Departamento" value={data.localizacao} onChange={v=>setData({...data, localizacao:v})} placeholder="Ex: Altar, Secretaria..." /></div>
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
                        <FormInput label="Data da Lição" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/>
                        <FormSelect label="Turma" value={data.turma_id} onChange={v=>setData({...data, turma_id:v})} options={db.ebd.turmas.map(t=>({label:t.nome, value:t.id}))} required/>
                        <FormInput label="Revista / Tema Central" value={data.revista} onChange={v=>setData({...data, revista:v})} required/>
                        <div className="grid grid-cols-2 gap-4"><FormInput label="Nº / Título da Lição" type="text" value={data.licao_numero} onChange={v=>setData({...data, licao_numero:v})} placeholder="Ex: 1 - A Criação" /><FormInput label="Qtd. Presentes" type="number" value={data.qtd_presentes} onChange={v=>setData({...data, qtd_presentes:v})} /></div>
                        <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Capa da Revista (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-24 bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group shadow-sm shrink-0">
                                    {data.capa ? <img src={data.capa} className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-300"/>}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><label className="cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest text-center w-full h-full flex items-center justify-center">Upload<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'capa')} /></label></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Carregue a imagem da capa da revista para evitar bloqueios de segurança da editora (CORS) e garantir a exibição perfeita para os alunos.</p>
                                    {data.capa && <button type="button" onClick={() => setData({...data, capa: null})} className="text-[10px] font-bold text-rose-500 mt-2 hover:text-rose-700 transition-colors uppercase tracking-wider">Remover Imagem</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'missionario':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome do Missionário" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <FormInput label="Campo de Atuação" value={data.campo} onChange={v=>setData({...data, campo:v})} placeholder="Ex: Sertão, País, Cidade..."/>
                        <FormInput label="Agência Missionária" value={data.agencia} onChange={v=>setData({...data, agencia:v})} />
                        <FormInput label="Data de Envio" type="date" value={data.data_envio} onChange={v=>setData({...data, data_envio:v})} />
                    </div>
                );
            case 'agencia_missoes':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome da Agência" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <FormInput label="Responsável" value={data.responsavel} onChange={v=>setData({...data, responsavel:v})} />
                        <FormInput label="Contato" value={data.contato} onChange={v=>setData({...data, contato:v})} />
                    </div>
                );
            case 'missoes_colaborador':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput label="Nome do Colaborador" value={data.nome} onChange={v=>setData({...data, nome:v})} required/>
                        <FormSelect label="Tipo Apoio" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Oração', 'Financeiro', 'Voluntário']} />
                    </div>
                );
             case 'missoes_financeiro':
                 return (
                     <div className="grid grid-cols-1 gap-4">
                          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14}/> Lançamento de Caixa Missões</h4>
                          <FormInput label="Descrição do Lançamento" value={data.descricao} onChange={v=>setData({...data, descricao:v})} required placeholder="Ex: Oferta Culto de Missões / Sustento Missionário"/>
                          <div className="grid grid-cols-2 gap-4"><FormInput label="Valor (R$)" type="number" step="0.01" value={data.valor} onChange={v=>setData({...data, valor:parseFloat(v)})} required/><FormInput label="Data" type="date" value={data.data_competencia} onChange={v=>setData({...data, data_competencia:v})} required/></div>
                          <div className="grid grid-cols-2 gap-4">
                              <FormSelect label="Tipo" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={[{label:'Entrada (Oferta/Dízimo)', value:'entrada'}, {label:'Saída (Sustento/Despesa)', value:'saida'}]} />
                              <FormSelect label="Forma de Pagto" value={data.forma_pagamento} onChange={v=>setData({...data, forma_pagamento:v})} options={['PIX', 'Dinheiro', 'Cartão', 'Transferência']} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <FormSelect label="Vincular Missionário (Opcional)" value={data.missionario_id} onChange={v=>setData({...data, missionario_id:v})} options={db.missoes.missionarios.map(m=>({label:m.nome, value:m.id}))} />
                              {isMaster && <FormSelect label="Congregação / Filial" value={data.congregacao_id || 'sede'} onChange={v=>setData({...data, congregacao_id:v})} options={[{label: 'Sede Principal (Matriz)', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />}
                          </div>
                     </div>
                 );
             case 'missoes_agenda':
                 return (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput label="Título do Evento / Tarefa" value={data.titulo} onChange={v=>setData({...data, titulo:v})} required/>
                            <FormSelect label="Tipo" value={data.tipo} onChange={v=>setData({...data, tipo:v})} options={['Evento', 'Tarefa', 'Escala Missionária', 'Lembrete']} />
                            <FormInput label="Descrição Detalhada" value={data.descricao} onChange={v=>setData({...data, descricao:v})} placeholder="Detalhes da ação missionária..."/>
                            <div className="grid grid-cols-2 gap-4"><FormInput label="Data" type="date" value={data.data} onChange={v=>setData({...data, data:v})} required/><FormInput label="Horário" type="time" value={data.hora} onChange={v=>setData({...data, hora:v})}/></div>
                            <div className="grid grid-cols-2 gap-4"><FormSelect label="Status" value={data.status} onChange={v=>setData({...data, status:v})} options={['Pendente', 'Em Andamento', 'Concluido', 'Cancelado']} /><FormInput label="WhatsApp (Contato Externo)" value={data.numero_whatsapp} onChange={v=>setData({...data, numero_whatsapp:v})} placeholder="Apenas números. Ex: 5511999..."/></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={14}/> Equipe / Escala</h4>
                            <div className="flex gap-2 mb-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pessoa (Membro/Mis.)</label>
                                    <div className="relative">
                                        <select className="input-futuristic w-full p-2.5 rounded-xl text-sm appearance-none bg-white" value={tempMember.id} onChange={e => { const val = e.target.value; if(!val) { setTempMember({id:'', nome:'', telefone:''}); return; } let person = db.membros?.find(m => m.id === val) || db.missoes?.missionarios?.find(m => m.id === val) || db.missoes?.colaboradores?.find(m => m.id === val); if(person) { setTempMember({...tempMember, id: person.id, nome: person.nome, telefone: person.telefone || person.contato || ''}); } }}>
                                            <option value="">Selecione...</option>
                                            <optgroup label="Missionários">{(db.missoes?.missionarios || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                            <optgroup label="Colaboradores">{(db.missoes?.colaboradores || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                            <optgroup label="Membros Igreja">{(db.membros || []).map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</optgroup>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                                    </div>
                                </div>
                                <div className="flex-1 uppercase"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Função</label><input type="text" className="input-futuristic w-full p-2.5 rounded-xl text-sm" placeholder="Ex: Preletor, Apoio..." value={tempMember.funcao} onChange={e => setTempMember({...tempMember, funcao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})}/></div>
                                <button onClick={() => { if(!tempMember.id) return; const newTeam = [...(data.equipe || [])]; if(newTeam.find(t => t.id === tempMember.id)) { alert("Pessoa já adicionada."); return; } newTeam.push({ id: tempMember.id, nome: tempMember.nome, telefone: tempMember.telefone, funcao_escala: tempMember.funcao || 'Apoio' }); setData({...data, equipe: newTeam}); setTempMember({id: '', nome: '', telefone: '', funcao: ''}); }} className="bg-indigo-500 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200" type="button"><Plus size={20}/></button>
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
                         <div className="grid grid-cols-2 gap-4"><FormInput label="Data da Visita" type="date" value={data.data_visita} onChange={v=>setData({...data, data_visita:v})} required/><FormSelect label="Status no Funil" value={data.status} onChange={v=>setData({...data, status:v})} options={['1ª Visita', 'Contato Feito', 'Em Discipulado', 'Integrado']} /></div>
                         <FormInput label="Observações / Pedido de Oração" value={data.obs} onChange={v=>setData({...data, obs:v})} placeholder="Detalhes importantes da visita..."/>
                         <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                             <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Plano de Integração (CRM)</label><Button type="button" onClick={async () => { setLoadingAiPlan(true); const prompt = `Atue como um pastor especialista em consolidação de novos convertidos. Crie um plano de acompanhamento prático de 4 semanas para este visitante que esteve na nossa igreja: Nome: ${data.nome || 'Visitante'}. Status atual: ${data.status || 'Recente'}. Observações: ${data.obs || 'Nenhuma'}. Retorne apenas o plano passo-a-passo em formato Markdown, curto e inspirador.`; const res = await callGeminiAI(prompt); setData({...data, plano_integracao: res}); setLoadingAiPlan(false); }} disabled={loadingAiPlan} variant="ghost" className="bg-white text-indigo-600 border border-indigo-200 text-[10px] py-1.5 px-3">{loadingAiPlan ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} ✨ Gerar Plano com IA</Button></div>
                             <textarea className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px] uppercase" value={data.plano_integracao || ''} onChange={e => setData({...data, plano_integracao: ((e.target.value || "").toUpperCase() || "").toUpperCase()})} placeholder="Escreva ou gere com IA os passos sugeridos para consolidar este visitante..."></textarea>
                         </div>
                     </div>
                 );
             default: return <p className="text-slate-500 italic">Formulário padrão para {type}.</p>;
        }
    };

    return createPortal(
        <InteractiveWindow
            id={`generic_modal_${type}`}
            title={data.nome || data.titulo || data.descricao || (data.id ? 'Modificar Registro' : 'Novo Registro')}
            subtitle={`${data.id ? 'Editando Registro' : 'Novo Registro'} • ${themeInfo.title}`}
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
                setTotalHeight(contentRef.current.scrollHeight);
            }
        };

        const timer = setTimeout(updateHeight, 600);
        
        window.addEventListener('resize', updateHeight);
        
        const observer = new MutationObserver(updateHeight);
        if (contentRef.current) {
            observer.observe(contentRef.current, { childList: true, subtree: true, attributes: true });
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateHeight);
            observer.disconnect();
        };
    }, [contentRef, targetHeight, marginType]);

    const isLandscape = targetHeight === 794;
    const currentWidth = isLandscape ? 1123 : 794;
    
    const getPrintMarginsPx = (type: string) => {
        if (type === 'moderada') return { top: 76, bottom: 76, left: 76, right: 76 };
        if (type === 'estreita') return { top: 57, bottom: 57, left: 57, right: 57 };
        return { top: 113, bottom: 76, left: 113, right: 76 }; // abnt / padrão
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
                            Quebra Física de Página {index + 1} (A4 {marginType.toUpperCase()})
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
        addToast("Analisando dimensões para otimização automática...", "info");
        
        // Temporariamente reseta para 100 para medir a largura ideal sem escalas pré-existentes
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
                // Buffer de segurança para evitar quebras ou cortes de linha na impressão física
                const calculatedRatio = (targetWidth - 12) / maxScrollWidth;
                const roundedScale = Math.max(50, Math.min(100, Math.floor(calculatedRatio * 100)));
                setContentScale(roundedScale);
                addToast(`Largura ajustada com sucesso! Escala de conteúdo definida em ${roundedScale}%.`, "success");
            } else {
                setContentScale(100);
                addToast("O conteúdo já está perfeitamente ajustado à largura padrão da página A4.", "success");
            }
        }, 150);
    };

    const isLandscape = orientation === 'landscape';
    const targetWidth = isLandscape ? 1123 : 794;
    const targetHeight = isLandscape ? 794 : 1123;

    // Função centralizada para renderizar a área usando o jsPDF em modo imagem estrita com quebras para A4
    const generateProfessionalPDF = async () => {
        setRenderProgress("Inicializando motor gráfico de PDF...");
        await new Promise(r => setTimeout(r, 200));

        let targetEl = contentRef.current;
        if (!targetEl) {
            targetEl = document.querySelector('.print-area') as HTMLDivElement;
        }

        if (!targetEl) {
            addToast("Erro: área de impressão não localizada no sistema.", "error");
            setRenderProgress(null);
            return null;
        }

        const originalStyle = targetEl.getAttribute('style') || '';
        const originalClassName = targetEl.className || '';

        try {
            setRenderProgress("Otimizando layout e estilização para A4...");
            // Configurar estilos limpos para A4 exatos para garantir renderização perfeita
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

            setRenderProgress("Processando vetorização do documento e fontes...");
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

            setRenderProgress("Analisando dimensões físicas e vetor de corte...");
            const img = new window.Image();
            img.src = dataUrl;
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
            });

            setRenderProgress("Slicing inteligente de páginas em andamento...");
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
                // padrão / abnt (Superior/Esquerda: 3cm [113px], Inferior/Direita: 2cm [76px])
                return { top: 113, bottom: 76, left: 113, right: 76 };
            };

            const margins = getPrintMarginsPx(marginType);
            
            // Fator de escala horizontal para caber nas margens esquerda e direita
            const scaleX = Math.max(0.01, (targetWidth - margins.left - margins.right) / targetWidth);
            
            // Altura útil de impressão no papel em pixels
            const printableHeight = targetHeight - margins.top - margins.bottom;
            
            // Altura máxima proporcional da imagem de entrada a ser cortada por página
            const maxSliceHeight = Math.max(10, Math.floor(printableHeight / scaleX));

            // 2. Coletar os limites verticais de todos os elementos indivisíveis dentro do documento
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

                setRenderProgress(`Compilando página ${pageIndex + 1} de ${approxTotalPages}...`);
                let currentSliceHeight = Math.min(totalHeight - srcY, maxSliceHeight);

                // Evitar cortar linhas ou títulos no meio se houver espaço remanescente razoável na página
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

                // Criar canvas de corte intermediário para desenhar o pedaço da página
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = targetWidth;
                tempCanvas.height = targetHeight;

                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, targetWidth, targetHeight);
                    // Desenha o conteúdo escalado centralizado entre as margens
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
            console.error("Erro crítico ao gerar PDF:", error);
            targetEl.className = originalClassName;
            targetEl.setAttribute('style', originalStyle);
            setRenderProgress(null);
            addToast("Erro sistêmico ao carregar renderizador físico de PDF.", "error");
            return null;
        }
    };

    const handleDownloadDocument = async () => {
        const pdf = await generateProfessionalPDF();
        if (pdf) {
            pdf.save(`Documento_${mode}_${new Date().getTime()}.pdf`);
            addToast("PDF de alta resolução baixado com sucesso!", "success");
        }
    };

    const handleNativePrint = () => {
        addToast("Abrindo diálogo de impressão física do sistema...", "success");
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
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">A4 Standard • Processamento em Modo Imagem</p>
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
                                title="Paleta Cinza Antracite (Padrão)"
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

                        {/* Seletor de Margem / Ajustar Página */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Ajustar margens da página">
                                Margem:
                            </span>
                            <button 
                                onClick={() => setMarginType('abnt')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'abnt' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem Padrão (Superior: 3cm / Esquerda: 3cm / Inferior: 2cm / Direita: 2cm)"
                            >
                                Padrão
                            </button>
                            <button 
                                onClick={() => setMarginType('moderada')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'moderada' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem Média (2.0 cm em todas)"
                            >
                                Média
                            </button>
                            <button 
                                onClick={() => setMarginType('estreita')}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${marginType === 'estreita' ? 'bg-slate-700 text-white shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-white'}`}
                                title="Margem Estreita (1.5 cm em todas)"
                            >
                                Estreita
                            </button>
                        </div>

                        {/* Seletor de Orientação da Página */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Mudar orientação da página">
                                Orientação:
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

                        {/* Ajustar à largura da página */}
                        <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-xl p-1 gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 flex items-center gap-1.5 select-none md:inline hidden" title="Ajustar conteúdo para caber na largura da página (escala de impressão)">
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
                                title="Escala do conteúdo em 90%"
                            >
                                90%
                            </button>
                            <button 
                                onClick={() => { setContentScale(80); setIsAutoFit(false); }}
                                className={`px-2 py-1 text-[11px] font-black uppercase transition-all rounded-lg ${contentScale === 80 && !isAutoFit ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Escala do conteúdo em 80%"
                            >
                                80%
                            </button>
                            <button 
                                onClick={() => handleAutoFitWidth()}
                                className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all rounded-lg flex items-center gap-1 ${isAutoFit ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Calcular escala automaticamente para caber tabelas sem cortá-las no papel"
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

                {/* NOVO: Ajustes Avançados de Layout e Institucionalidade */}
                <div className="bg-slate-850 px-8 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-10 select-none">
                    <div className="flex items-center gap-6 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                            <Settings size={12} className="text-indigo-400" /> Customização Institucional:
                        </span>

                        {/* Toggle de Marca d'água */}
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors">
                            <input 
                                type="checkbox" 
                                checked={showWatermark} 
                                onChange={e => setShowWatermark(e.target.checked)}
                                className="accent-indigo-500 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                            />
                            <span className="flex items-center gap-1"><Award size={13} className="text-slate-400" /> Marca d'água de Fundo</span>
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
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase">Assinatura 1:</span>
                                <input 
                                    type="text" 
                                    value={signatureName1} 
                                    onChange={e => setSignatureName1(e.target.value)} 
                                    placeholder="Nome da liderança"
                                    className="bg-slate-900 text-slate-150 text-[11px] font-bold border border-slate-700 rounded-lg px-2 py-1 w-32 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                    title="Nome da Assinatura 1"
                                />
                                <input 
                                    type="text" 
                                    value={signatureTitle1} 
                                    onChange={e => setSignatureTitle1(e.target.value)} 
                                    placeholder="Cargo / Ministério"
                                    className="bg-slate-900 text-slate-400 text-[11px] font-semibold border border-slate-700 rounded-lg px-2 py-1 w-28 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                    title="Cargo da Assinatura 1"
                                />
                            </div>
                            <span className="text-slate-700 font-bold">•</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase">Assinatura 2:</span>
                                <input 
                                    type="text" 
                                    value={signatureName2} 
                                    onChange={e => setSignatureName2(e.target.value)} 
                                    placeholder="Nome da liderança"
                                    className="bg-slate-900 text-slate-150 text-[11px] font-bold border border-slate-700 rounded-lg px-2 py-1 w-32 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                    title="Nome da Assinatura 2"
                                />
                                <input 
                                    type="text" 
                                    value={signatureTitle2} 
                                    onChange={e => setSignatureTitle2(e.target.value)} 
                                    placeholder="Cargo / Ministério"
                                    className="bg-slate-900 text-slate-400 text-[11px] font-semibold border border-slate-700 rounded-lg px-2 py-1 w-28 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600" 
                                    title="Cargo da Assinatura 2"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Área Interna de Preview com Centralização */}
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

    // Configuração de margens dinâmicas de acordo com o seletor de layout
    const marginStyles = {
        abnt: { paddingTop: '30mm', paddingLeft: '30mm', paddingBottom: '20mm', paddingRight: '20mm' },
        moderada: { paddingTop: '20mm', paddingLeft: '20mm', paddingBottom: '20mm', paddingRight: '20mm' },
        estreita: { paddingTop: '15mm', paddingLeft: '15mm', paddingBottom: '15mm', paddingRight: '15mm' }
    };
    const selectedMargin = marginStyles[marginType as 'abnt' | 'moderada' | 'estreita'] || marginStyles.abnt;

    // Paleta de cores para customização de Layout do Cabeçalho e Títulos de Relatórios
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
                <h1 className={`font-serif text-2xl font-black uppercase ${colors.textTitle} leading-tight mb-1`}>{data.igreja?.nome || "Ministério"}</h1>
                <p className="text-[11px] text-slate-600 font-medium">
                    {data.igreja?.endereco} - {data.igreja?.cidade}/{data.igreja?.uf} • CNPJ: {data.igreja?.cnpj}
                </p>
                {data.igreja?.pastor && <p className="text-[11px] text-slate-800 font-bold mt-1 uppercase">Pastor Presidente: {data.igreja?.pastor}</p>}
            </div>
            <div className="w-24 flex flex-col items-end justify-center text-right">
                 <p className="text-[9px] font-bold text-slate-500 uppercase">Emissão</p>
                 <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('pt-BR')}</p>
                 <p className="text-[8px] text-slate-400 mt-2 text-right">GIPP System</p>
            </div>
        </div>
    );

    // ESTRUTURA GLOBAL DE PÁGINA REFORMULADA (Evita a tabela gigante que corrompia as quebras de página)
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

        // Seção de Assinaturas dinâmicas
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
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{customSignatureTitle2 || "Assinatura Responsável"}</p>
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
            texto = `Recebemos de ${item.membro_nome || 'CONTRIBUINTE NÃO IDENTIFICADO'}, a importância supra de R$ ${valorStr} referente a ${item.descricao || item.categoria}.`;
            assinador = data.igreja?.tesoureiro1 || data.igreja?.pastor || "Tesouraria";
            dataRecibo = item.data_competencia || item.data_pagamento || getTodayDate();
        } else if (isSaida) {
            titulo = "RECIBO DE PAGAMENTO";
            valorStr = parseFloat(item.valor).toFixed(2);
            let fornecedorNome = item.fornecedor_id ? (data.fornecedores?.find(f=>f.id === item.fornecedor_id)?.nome || item.fornecedor_id) : 'FORNECEDOR';
            texto = `Pagamos a ${fornecedorNome}, a importância supra de R$ ${valorStr} referente a ${item.descricao}.`;
            assinador = fornecedorNome; // O recebedor assina
            dataRecibo = item.data_vencimento || item.data_pagamento || getTodayDate();
        } else if (isCarne) {
            let totalPago = (item.parcelas||[]).filter(p=>p.status==='pago').reduce((a,curr)=>a+(parseFloat(curr.valor)||0), 0);
            valorStr = totalPago.toFixed(2);
            let membroNome = data.membros?.find(m=>m.id === item.membro_id)?.nome || 'CONTRIBUINTE';
            texto = `Recebemos de ${membroNome}, a importância supra de R$ ${valorStr} referente ao pagamento parcial/total do carnê: ${item.titulo}.`;
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

    // --- NOVOS CERTIFICADOS OFICIAIS (A4 PAISAGEM - ALTO PADRÃO) ---
    if (mode.startsWith('cert_')) {
        const hojeExtenso = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Margens padrão exigidas que se adaptam conforme o painel se alterado, mantendo o padrão ABNT (Superior: 30mm, Esquerda: 30mm, Inferior: 20mm, Direita: 20mm)
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

        const Assinaturas = () => (
            <div className="mt-auto w-full flex justify-between px-10 pt-4 gap-16 relative z-20">
                <div className="text-center flex-1">
                    <div className="border-b border-black mb-1 mx-auto w-full"></div>
                    <p className="text-xs font-bold uppercase text-slate-900">{data.igreja?.pastor || "Pastor Presidente"}</p>
                    <p className="text-[9px] text-slate-600 font-serif uppercase tracking-widest">Pastor Presidente</p>
                </div>
                <div className="text-center flex-1">
                    <div className="border-b border-black mb-1 mx-auto w-full"></div>
                    <p className="text-xs font-bold uppercase text-slate-900">{data.igreja?.secretario1 || "Secretário(a) Geral"}</p>
                    <p className="text-[9px] text-slate-600 font-serif uppercase tracking-widest">Secretaria Eclesiástica</p>
                </div>
            </div>
        );

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
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-700">Certificação Oficial Eclesiástica</p>
                            </div>
                            
                            <h2 className="font-script text-[4.5rem] text-blue-900 leading-none drop-shadow-sm my-2">Certificado de Batismo</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-800 max-w-3xl text-justify indent-12 my-2 z-10">
                                Certificamos para os devidos fins espirituais e eclesiásticos que <strong className="uppercase text-blue-950">{data.membro?.nome || 'NOME DO MEMBRO'}</strong>, tendo confessado publicamente a sua fé em Jesus Cristo como seu único e suficiente Salvador, desceu às águas batismais nesta congregação em cumprimento à grande comissão (Mateus 28:19).
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
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-rose-800">Gabinete Pastoral e Ministério</p>
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="font-classic text-3xl text-rose-900 font-black tracking-widest uppercase my-2 z-10">Credencial de Consagração</h2>
                        
                        <p className="font-serif text-lg leading-relaxed text-slate-900 max-w-3xl text-justify indent-12 my-2 z-10">
                            O Ministério desta Igreja, sob a direção do Espírito Santo, atesta e confere o presente documento declarando que <strong className="uppercase">{data.membro?.nome || 'NOME DO MEMBRO'}</strong> foi examinado(a), aprovado(a) e, nesta data solene, mediante a imposição de mãos, separado(a) para o Santo Ministério no ofício de <strong className="uppercase text-rose-800 border-b-2 border-rose-800">{data.extra?.cargo || 'OBREIRO(A)'}</strong>.
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
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">Consagração Infantil</p>
                            </div>
                            
                            <h2 className="font-script text-[4rem] text-amber-700 leading-none my-1">Apresentação ao Senhor</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-700 max-w-3xl text-center z-10">
                                Certificamos com júbilo que a criança <strong className="uppercase text-amber-900">{data.extra?.nome_crianca || 'NOME DA CRIANÇA'}</strong>{data.extra?.data_nasc && <span>, nascida em {formatDateLocal(data.extra.data_nasc)}</span>}, filha de <strong className="uppercase text-slate-900">{data.extra?.nome_pai || 'NOME DO PAI'}</strong> e <strong className="uppercase text-slate-900">{data.extra?.nome_mae || 'NOME DA MÃE'}</strong>, foi trazida ao templo sagrado e apresentada a Deus conforme o rito bíblico, rogando aos céus a sua proteção e graça divina.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Deixai vir a mim os pequeninos, porque dos tais é o Reino dos Céus." (Mc 10:14)
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
                                É com honra e bênção eclesiástica que certificamos que <strong className="uppercase text-slate-900 font-black">{data.extra?.nome_noivo || 'NOME DO NOIVO'}</strong> e <strong className="uppercase text-slate-900 font-black">{data.extra?.nome_noiva || 'NOME DA NOIVA'}</strong>, compareceram perante o altar sagrado e uniram-se pelos indissolúveis laços do santo matrimônio. Que o amor de Cristo seja o cordão de três dobras que sustenta este lar.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Assim não são mais dois, mas uma só carne. Portanto, o que Deus ajuntou não o separe o homem." (Mt 19:6)
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
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Departamento de Ensino Teológico</p>
                            </div>
                            
                            <h2 className="font-classic text-3xl text-indigo-800 font-black tracking-widest uppercase border-y-4 border-indigo-100 py-1.5 w-full my-2">Diploma de Conclusão</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-800 max-w-3xl text-justify indent-12 my-2 z-10">
                                Conferimos o presente certificado a <strong className="uppercase text-indigo-900 font-black">{data.membro?.nome || 'NOME DO ALUNO'}</strong>, em virtude de ter cumprido todos os requisitos curriculares e concluído com pleno aproveitamento o <strong className="uppercase">{data.extra?.curso || data.extra?.nome_curso || 'CURSO DE TEOLOGIA'}</strong>, estando apto(a) a aplicar os conhecimentos adquiridos na obra do Mestre.
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
                            
                            <h2 className="font-script text-[4rem] text-emerald-700 leading-none my-1">Certificado de Participação</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-700 max-w-3xl text-justify indent-12 my-2 z-10">
                                Certificamos que <strong className="uppercase text-emerald-900">{data.membro?.nome || 'NOME DO PARTICIPANTE'}</strong>, participou ativamente do evento <strong className="uppercase border-b border-emerald-500">{data.extra?.evento || 'CONGRESSO OFICIAL'}</strong>, realizado nas dependências desta instituição, demonstrando dedicação, comunhão e interesse no crescimento espiritual do Corpo de Cristo.
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
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Escola Bíblica Dominical</p>
                            </div>
                            
                            <h2 className="font-script text-[4rem] text-purple-800 leading-none my-1">Honra ao Mérito</h2>
                            
                            <p className="font-serif text-lg leading-relaxed text-slate-850 max-w-3xl text-justify indent-12 my-2 z-10">
                                O Departamento de Ensino confere o presente certificado a <strong className="uppercase text-purple-900">{data.membro?.nome || 'NOME DO ALUNO'}</strong>, por ter concluído com zelo e dedicação o ciclo de estudos da EBD, integrando a <strong className="uppercase">{data.extra?.turma || 'TURMA DE ENSINO'}</strong> sob a instrução dedicada de seus professores.
                            </p>
                            
                            <p className="text-slate-500 font-serif text-sm italic my-1 z-10">
                                "Crescei na graça e no conhecimento de nosso Senhor e Salvador, Jesus Cristo." (2 Pe 3:18)
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
                                    <p className="text-xs font-bold uppercase text-slate-900">{data.extra?.professor || "Superintendência EBD"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CertificatePage>
            );
        }
    }

    // --- CARNÊ IMPRESSÃO ORIGINAL ---
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
                                <div className="text-center"><p className="text-[10px] text-slate-400 mb-6">Autenticação Mecânica / Assinatura do Tesoureiro</p><div className="border-b border-black w-3/4 mx-auto"></div></div>
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
                                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Função Eclesiástica</p>
                                    <div className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded shadow-sm inline-block">
                                        <p className="text-[10px] font-black uppercase tracking-wider">{data.membro.cargo || 'Membro'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Nº Registro</p>
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
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Filiação</p>
                            <p className="text-[7px] font-bold text-slate-800 truncate uppercase">{data.membro.nome_pai || '---'} <br/> {data.membro.nome_mae || '---'}</p>
                        </div>
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Data Batismo</p>
                            <p className="text-[8px] font-bold text-slate-800">{formatDateLocal(data.membro.data_batismo)}</p>
                        </div>
                        <div>
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Data Admissão</p>
                            <p className="text-[8px] font-bold text-slate-800">{formatDateLocal(data.membro.data_admissao)}</p>
                        </div>
                        <div className="col-span-2 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><MapPin size={8}/> Congregação / Sede</p>
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
                            <p className="text-[5px] text-slate-500 uppercase tracking-widest">Presidente / Direção</p>
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
                                    <h3 className="font-black text-white text-xs uppercase tracking-widest drop-shadow-md leading-tight">{data.igreja?.nome || 'Ministério'}</h3>
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
                                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Função</p>
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
                                <div className="col-span-2"><p className="text-[6px] font-black text-slate-400 uppercase">Filiação</p><p className="text-[7px] font-bold text-slate-800 truncate uppercase">{membro.nome_pai || '---'} / {membro.nome_mae || '---'}</p></div>
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">Batismo</p><p className="text-[8px] font-bold text-slate-800">{formatDateLocal(membro.data_batismo)}</p></div>
                                <div><p className="text-[6px] font-black text-slate-400 uppercase">Admissão</p><p className="text-[8px] font-bold text-slate-800">{formatDateLocal(membro.data_admissao)}</p></div>
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

    // --- CARTEIRINHA CUSTOMIZADA (ESTÚDIO) ---
    if (mode === 'carteirinha_custom') {
        const layout = data.igreja?.carteirinha_custom || {};
        const bg = layout.bg || '#ffffff';
        const fields = layout.fields || [];

        return (
            <div className="w-full flex flex-wrap gap-8 justify-center print:p-0" style={selectedMargin}>
                {data.membros.map((membro, index) => (
                    <div key={index} className="w-[85.6mm] h-[53.98mm] relative overflow-hidden flex shadow-lg border border-slate-300 shrink-0 print:shadow-none print:border-none avoid-break mb-8 bg-cover bg-center" style={{ backgroundColor: bg.startsWith('#') ? bg : 'transparent', backgroundImage: bg.startsWith('http') || bg.startsWith('data:') ? `url(${bg})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
                            if (f.id === 'registro') content = membro.numero_registro;
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
        const liderNome = data.membros?.find(m => m.id === cel?.lider1_id)?.nome || 'Líder';

        return (
            <PageContainer title="Relatório de Célula" subtitle={`Célula: ${cel?.nome || 'Não identificada'}`}>
                <div className="mb-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl avoid-break">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Data da Reunião</p>
                        <p className="font-bold text-sm text-slate-800">{formatDateLocal(rel?.data)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Líder da Célula</p>
                        <p className="font-bold text-sm text-slate-800">{liderNome}</p>
                    </div>
                </div>

                <div className="mb-8 avoid-break">
                    <h3 className="font-bold text-sm bg-slate-800 text-white p-2 uppercase tracking-widest mb-2">Lista de Presença e Participantes</h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 p-2 text-left uppercase">Tipo</th>
                                <th className="border border-slate-300 p-2 text-left uppercase">Nome do Participante</th>
                                <th className="border border-slate-300 p-2 text-left uppercase">Função/Cargo</th>
                                <th className="border border-slate-300 p-2 text-center uppercase">Frequência</th>
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
                                const isPresente = rel?.presencas ? rel.presencas[m.integrante_id] : true; // Por padrão assume presente se não houver marcação salva
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
                    <h3 className="font-bold text-sm bg-slate-800 text-white p-2 uppercase tracking-widest mb-2">Relatório Detalhado</h3>
                    <div className="p-4 border border-slate-300 min-h-[200px] text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {rel?.relatorio}
                    </div>
                </div>

                <div className="mt-16 pt-8 flex justify-between gap-10 px-10 avoid-break">
                    <div className="flex-1 text-center">
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold uppercase text-sm tracking-wider">{liderNome}</p>
                        <p className="text-xs font-serif text-slate-600">Líder da Célula</p>
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
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{membro.cargo} {membro.funcao_administrativa && membro.funcao_administrativa !== 'NENHUMA' ? `• ${membro.funcao_administrativa}` : ''}</p>
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
                        <ClipboardList size={16}/> Agenda de Serviços Escalados
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100 border-b-2 border-slate-400">
                            <tr>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300 w-1/4">Data / Hora</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Compromisso / Categoria</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Função Atribuída</th>
                                <th className="p-3 uppercase text-[9px] font-black text-slate-700 tracking-wider text-center">Status Confirmação</th>
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

    // --- NOVO: RELATÓRIO DE TAREFA / ESCALA COM ACOMPANHAMENTO DE PRESENÇAS ---
    if (mode === 'rel_tarefa_escala') {
        const { equipe, descricao, categoria, data: taskDate, status } = data;
        const confirmados = (equipe || []).filter(m => m.status_presenca === 'confirmado');
        const recusados = (equipe || []).filter(m => m.status_presenca === 'recusado');
        const pendentes = (equipe || []).filter(m => !m.status_presenca || m.status_presenca === 'pendente');

        return (
            <PageContainer title="Relatório de Escala Oficial" subtitle={categoria || 'Tarefa Administrativa'}>
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
                                <th className="p-3 uppercase text-[10px] font-black text-slate-700 tracking-wider text-left border-r border-slate-300">Função Atribuída</th>
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
                                        {m.status_presenca === 'recusado' && <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm"><Ban size={14}/> Não Estará</span>}
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

    // --- RELATORIO EVENTO ÚNICO ORIGINAL ---
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
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Data / Horário</p>
                            <p className="text-xl font-black text-slate-800">{formatDateLocal(data.data)} - {data.hora}h</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={14}/> Localização</h4>
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
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.5em] mb-1">GIPP Gestão Eclesiástica Digital</p>
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
        if (data_inicio || data_fim) titleSuffix += ` | Período: ${formatDateLocal(data_inicio) || 'Início'} a ${formatDateLocal(data_fim) || 'Atual'}`;

        const totalVolume = entradas + saidas;
        const entradaPct = totalVolume > 0 ? (entradas / totalVolume) * 100 : 0;
        const saidaPct = totalVolume > 0 ? (saidas / totalVolume) * 105 : 0; // slight scale for visual weight

        return (
            <PageContainer title="Relatório de Fluxo de Caixa" subtitle={titleSuffix}>
                {/* KPI Cards Bento Box style */}
                <div className="grid grid-cols-3 gap-5 mb-6 avoid-break">
                    <div className="p-4 border border-emerald-250 bg-emerald-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-3xl flex items-center justify-center text-emerald-500 font-black text-xs">E</div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Total Entradas</p>
                        <p className="text-xl font-black text-emerald-800 mt-2">R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 border border-rose-250 bg-rose-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-bl-3xl flex items-center justify-center text-rose-500 font-black text-xs">S</div>
                        <p className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Total Saídas (Pagas)</p>
                        <p className="text-xl font-black text-rose-800 mt-2">R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`p-4 border rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm ${saldo >= 0 ? 'border-indigo-250 bg-indigo-50/40' : 'border-amber-250 bg-amber-50/40'}`}>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-bl-3xl flex items-center justify-center font-black text-xs">L</div>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${saldo >= 0 ? 'text-indigo-600' : 'text-amber-700'}`}>Saldo Líquido</p>
                        <p className={`text-xl font-black mt-2 ${saldo >= 0 ? 'text-indigo-800' : 'text-amber-805'}`}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Balanço Comparativo Proporcional CSS */}
                <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl avoid-break mb-6 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                        <span>Balanço Comparativo Proporcional</span>
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
                                {saidaPct > 15 ? `Saídas: ${saidaPct.toFixed(1)}%` : `${saidaPct.toFixed(0)}%`}
                            </div>
                        ) : null}
                        {totalVolume === 0 ? <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">Sem transações registradas neste período</div> : null}
                    </div>
                </div>

                <Table headers={[{label:'Data'}, {label:'Tipo', align:'center'}, {label:'Categoria'}, {label:'Descrição'}, {label:'Valor', align:'right'}]}>
                    {rows.map((r, i) => (
                        <tr key={i} className={`avoid-break ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                            <td className="p-3 border-r border-slate-250 font-mono text-xs text-slate-600">{formatDateLocal(r.data_competencia || r.data_vencimento)}</td>
                            <td className="p-3 border-r border-slate-250 text-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${r.tipo === 'entrada' ? 'bg-emerald-105 text-emerald-800 border border-emerald-250' : 'bg-rose-105 text-rose-800 border border-rose-250'}`}>
                                    {r.tipo === 'entrada' ? 'Entrada' : 'Saída'}
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
                            <td colSpan={5} className="p-6 text-center italic text-slate-500 font-semibold">Nenhum registro para este período.</td>
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
                title="Relatório de Auditoria Financeira" 
                subtitle={`Histórico de Alterações de Lançamentos • Mês de ${currentMonthName}`}
            >
                {/* Resumo executivo da auditoria */}
                <div className="grid grid-cols-3 gap-5 mb-6 avoid-break">
                    <div className="p-4 border border-indigo-250 bg-indigo-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Lançamentos no Mês</p>
                        <p className="text-xl font-black text-indigo-805 mt-2">{financeiro.length}</p>
                    </div>
                    <div className="p-4 border border-amber-250 bg-amber-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Lançamentos Alterados</p>
                        <p className="text-xl font-black text-amber-805 mt-2">
                            {financeiro.filter((f: any) => f.historico && Array.isArray(f.historico) && f.historico.length > 0).length}
                        </p>
                    </div>
                    <div className="p-4 border border-slate-250 bg-slate-50/40 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-wider font-extrabold">Total de Edições Registradas</p>
                        <p className="text-xl font-black text-slate-805 mt-2">{totalEdicoes}</p>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    {financeiro.map((item: any, idx: number) => {
                        const dateStr = formatDateLocal(item.data_competencia || item.data_vencimento || item.data_pagamento || item.created_at);
                        const hasHistory = item.historico && Array.isArray(item.historico) && item.historico.length > 0;
                        
                        return (
                            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm avoid-break">
                                {/* Cabeçalho do Lançamento */}
                                <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${item.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 'bg-rose-100 text-rose-800 border border-rose-250'}`}>
                                                {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
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

                                {/* Linha do Histórico */}
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
                                        <p className="text-slate-400 italic text-xs pl-1">Sem alterações registradas (Lançamento original preservado).</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {financeiro.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500 italic text-xs">
                            Nenhum lançamento financeiro registrado ou alterado no mês atual.
                        </div>
                    )}
                </div>
            </PageContainer>
        );
    }

    if (mode === 'rel_auditoria_sistema') {
        const { logs = [], startDate, endDate, userFilter } = data;
        const totalLogs = logs.length;
        const criacoes = logs.filter((l: any) => l.acao === 'CRIAÇÃO').length;
        const edicoes = logs.filter((l: any) => l.acao === 'EDIÇÃO').length;
        const exclusoes = logs.filter((l: any) => l.acao?.includes('EXCLUSÃO') || l.acao === 'DELETE' || l.acao === 'EXCLUSÃO_LÓGICA' || l.acao === 'EXCLUSÃO_PERMANENTE').length;

        return (
            <PageContainer 
                title="Relatório de Auditoria do Sistema" 
                subtitle={`Histórico de Atividades e Logs Gerais de Auditoria ${startDate || endDate ? `(Período: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : ''} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : ''})` : ''}`}
            >
                {/* Resumo executivo da auditoria do sistema */}
                <div className="grid grid-cols-4 gap-4 mb-6 avoid-break">
                    <div className="p-3.5 border border-indigo-200 bg-indigo-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Total Atividades</span>
                        <span className="text-lg font-black text-indigo-900 mt-1">{totalLogs}</span>
                    </div>
                    <div className="p-3.5 border border-emerald-200 bg-emerald-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">Criações</span>
                        <span className="text-lg font-black text-emerald-950 mt-1">{criacoes}</span>
                    </div>
                    <div className="p-3.5 border border-blue-200 bg-blue-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">Edições</span>
                        <span className="text-lg font-black text-blue-950 mt-1">{edicoes}</span>
                    </div>
                    <div className="p-3.5 border border-rose-200 bg-rose-50/20 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-rose-700 tracking-wider">Exclusões</span>
                        <span className="text-lg font-black text-rose-950 mt-1">{exclusoes}</span>
                    </div>
                </div>

                {userFilter && (
                    <div className="mb-4 bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs text-slate-600">
                        Filtro de Operador Ativo: <span className="font-extrabold text-slate-800 uppercase">{userFilter}</span>
                    </div>
                )}

                <Table headers={[{label:'Data/Hora'}, {label:'Operador'}, {label:'Ação'}, {label:'Módulo/Tipo'}, {label:'Detalhes da Atividade'}]}>
                    {logs.map((log: any, idx: number) => {
                        const dateObj = new Date(log.data_hora || log.created_at || Date.now());
                        const dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <tr key={idx} className={`avoid-break ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                <td className="p-3 border-r border-slate-200 text-xs font-mono text-slate-600 whitespace-nowrap">{dateStr}</td>
                                <td className="p-3 border-r border-slate-200 text-xs font-black text-slate-705 uppercase whitespace-nowrap truncate max-w-[120px]">{log.usuario_nome || 'Operador'}</td>
                                <td className="p-3 border-r border-slate-200 text-center">
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded border shadow-sm uppercase tracking-wider bg-slate-100 text-slate-700">
                                        {(log.acao || 'Ação').replace('_', ' ')}
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
            <PageContainer title="Relatório de Atividades - EBD" subtitle="Matrículas, Cobertura Docente e Ocupação de Salas">
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
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Média Alunos / Turma</span>
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
                                        <span>Sala: <strong className="text-slate-700 font-extrabold">{t.sala || 'Não definida'}</strong></span>
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
                                            <th className="p-2 w-10 text-center border-r border-slate-200 font-black uppercase text-[9px] text-slate-500">Nº</th>
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

    // 3 - MISSÕES
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
        const saidasMissoes = finFiltrado.filter(f => f.tipo === 'saida').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const saldoMissoes = entradasMissoes - saidasMissoes;

        return (
            <PageContainer title="Secretaria de Evangelismo & Missões" subtitle="Acompanhamento Missionário e Balancete do Fundo Missionário">
                {/* KPI Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6 avoid-break">
                    <div className="p-4 border border-indigo-150 bg-indigo-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Campos Ativos</span>
                        <p className="text-xl font-black text-indigo-850 mt-1">{missionarios.length}</p>
                    </div>
                    <div className="p-4 border border-indigo-150 bg-indigo-50/40 rounded-2xl text-center shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Agências Parceiras</span>
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
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block">Exercício Consolidado</span>
                        <h4 className="text-sm font-black uppercase tracking-wider mt-0.5">Saldo Operacional de Missões</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-indigo-200">Saldo Atual do Fundo</span>
                        <p className="text-lg font-black font-mono">R$ {saldoMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="mb-6 avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        1. Missionários Apoiados em Atividade
                    </h3>
                    <Table headers={[{label:'Apoiado / Missionário'}, {label:'Campo de Atuação Geográfica'}, {label:'Agenciador / Convênio'}]}>
                        {missionarios.map((m, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50">
                                <td className="p-3 font-semibold text-slate-800 uppercase">{m.nome}</td>
                                <td className="p-3 font-medium text-slate-600">{m.campo}</td>
                                <td className="p-3 text-slate-500 font-medium">{m.agencia}</td>
                            </tr>
                        ))}
                        {missionarios.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center italic text-slate-400 font-medium font-semibold">Nenhum missionário cadastrado atualmente.</td>
                            </tr>
                        )}
                    </Table>
                </div>

                <div className="mb-6 avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        2. Agências Parceiras e Secretarias CCM
                    </h3>
                    <Table headers={[{label:'Agência Social ou Coordenadora'}, {label:'Responsável Operativo Administrativo'}]}>
                        {agencias.map((a, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50">
                                <td className="p-3 font-semibold text-slate-800 uppercase">{a.nome}</td>
                                <td className="p-3 font-medium text-slate-600">{a.responsavel}</td>
                            </tr>
                        ))}
                        {agencias.length === 0 && (
                            <tr>
                                <td colSpan={2} className="p-4 text-center italic text-slate-400 font-medium font-semibold">Nenhuma agência missionária cadastrada.</td>
                            </tr>
                        )}
                    </Table>
                </div>

                <div className="avoid-break">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                        3. Extrato de Caixa da Secretaria de Missões
                    </h3>
                    <Table headers={[{label:'Data Competência'}, {label:'Histórico da Transação'}, {label:'Operação', align:'center'}, {label:'Valor Operado', align:'right'}]}>
                        {finFiltrado.map((f, i) => (
                            <tr key={i} className="border-b text-xs hover:bg-slate-50/50 avoid-break">
                                <td className="p-3 border-r border-slate-200 font-mono text-slate-600">{formatDateLocal(f.data_competencia)}</td>
                                <td className="p-3 border-r border-slate-200 text-slate-700 font-medium">{f.descricao}</td>
                                <td className="p-3 border-r border-slate-200 text-center">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${f.tipo==='entrada'?'bg-emerald-100 text-emerald-800 border border-emerald-250':'bg-rose-100 text-rose-800 border border-rose-250'}`}>
                                        {f.tipo==='entrada'?'Entrada':'Saída'}
                                    </span>
                                </td>
                                <td className={`p-3 text-right font-mono font-bold text-sm ${f.tipo==='entrada'?'text-emerald-700':'text-slate-800'}`}>
                                    R$ {parseFloat(f.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {finFiltrado.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center italic text-slate-450 font-medium">Nenhuma movimentação para o caixa de missões.</td>
                            </tr>
                        )}
                    </Table>
                </div>
            </PageContainer>
        );
    }

    // 4 - CARNÊS
    if (mode === 'rel_carnes') {
        const { carnes, membros } = data;
        let totalGeral = 0, recebidoGeral = 0;

        return (
            <PageContainer title="Relatório de Contribuintes & Carnês" subtitle="Encontro de Contas, Campanhas e Dotações Coletivas">
                {carnes.map(c => {
                    const totalCampanha = parseFloat(c.valor_total) || 0;
                    const recebido = (c.parcelas||[]).filter(p=>p.status==='pago').reduce((a,curr)=>a+(parseFloat(curr.valor)||0), 0);
                    const pendente = totalCampanha - recebido;
                    totalGeral += totalCampanha; recebidoGeral += recebido;

                    // Proporção de quitação da campanha individual
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
                                        Contribuinte: <span className="text-slate-800 font-extrabold">{membros.find(m=>m.id===c.membro_id)?.nome || 'Não identificado'}</span>
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
                         <h3 className="font-black text-xs uppercase mb-3 text-slate-700 tracking-wider text-center">Balancete Geral de Carnês</h3>
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

    // 4.5 - RELATÓRIO DE INADIMPLENTES (TESOURARIA)
    if (mode === 'rel_inadimplentes') {
        const { pending, igreja } = data;
        let totalValorGeral = 0;
        let totalRegsGeral = 0;

        return (
            <PageContainer title="Relatório de Membros Inadimplentes" subtitle="Documento Auxiliar de Cobrança e Conciliação - Tesouraria">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg text-xs leading-relaxed text-amber-900 font-medium avoid-break">
                    Abaixo constam os membros com pendências financeiras registradas no sistema (Carnês vigentes com parcelas vencidas e/ou Lançamentos de entrada pendentes expirados). Este relatório destina-se ao uso exclusivo do corpo de tesoureiros para controle de recebimentos e dotações orçamentárias.
                </div>

                <Table headers={[{label:'Membro / Contato'}, {label:'Motivos / Detalhes das Pendências'}, {label:'Registros', align:'center'}, {label:'Valor Total Devido', align:'right'}]}>
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
                        <p className="text-[10px] font-bold uppercase text-slate-700">Responsável pela Tesouraria</p>
                        <p className="text-[9px] font-serif italic text-slate-400">Visto / Assinatura</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // 5 - CADASTRO DA IGREJA
    if (mode === 'rel_igreja') {
        const { igreja } = data;
        const Box = ({ label, value, span=1 }) => (<div className={`border border-slate-300 p-2 ${span > 1 ? `col-span-${span}` : ''}`}><p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p><p className="font-bold text-xs text-slate-800 uppercase leading-snug whitespace-pre-wrap">{value || '\u00A0'}</p></div>);
        return (
            <PageContainer title="Ficha de Cadastro Institucional" subtitle="Dados Oficiais da Igreja">
                {/* DADOS BÁSICOS */}
                <h3 className="font-bold text-[11px] bg-slate-800 text-white p-2 uppercase tracking-widest mt-4">1. Dados Jurídicos e Localização</h3>
                <div className="grid grid-cols-4 border-l border-t border-slate-300">
                    <Box label="Nome Oficial da Igreja" value={igreja.nome} span={4} />
                    <Box label="CNPJ" value={igreja.cnpj} span={2}/>
                    <Box label="Data Fundação" value={formatDateLocal(igreja.data_fundacao)} />
                    <Box label="Data Emancipação" value={formatDateLocal(igreja.data_emancipacao)} />
                    <Box label="Endereço Completo" value={igreja.endereco} span={4}/>
                    <Box label="Cidade" value={igreja.cidade} span={3}/>
                    <Box label="UF" value={igreja.uf} />
                </div>

                {/* DADOS CANÔNICOS */}
                <div className="avoid-break pt-4">
                    <h3 className="font-bold text-[11px] bg-slate-800 text-white p-2 uppercase tracking-widest mt-2">2. Dados Canônicos da Denominação</h3>
                    <div className="grid grid-cols-4 border-l border-t border-slate-300">
                        <Box label="Organização Eclesiástica" value={igreja.canon_denom} span={2} />
                        <Box label="Registro Geral Consocial" value={igreja.canon_registro_geral} span={2} />
                        <Box label="Convenção Geral / Nacional" value={igreja.canon_convencao_nacional} span={2} />
                        <Box label="Convenção Estadual / Regional" value={igreja.canon_convencao_estadual} span={2} />
                        <Box label="Declaração de Fé Canônica" value={igreja.canon_declaracao_fe} span={4} />
                        <Box label="Pioneiros / Fundadores" value={igreja.canon_fundadores} span={3} />
                        <Box label="Ano Introdução no Brasil" value={igreja.canon_ano_introducao} />
                    </div>
                </div>

                {/* ESTATUTO SOCIAL */}
                {igreja.estatuto_resumo && (
                    <div className="avoid-break pt-4">
                        <h3 className="font-bold text-[11px] bg-slate-800 text-white p-2 uppercase tracking-widest mt-2">3. Estatuto Social & Regimento Interno (Resumo)</h3>
                        <div className="border border-slate-300 p-3 bg-slate-50 text-[10px] font-semibold text-slate-700 leading-relaxed uppercase whitespace-pre-wrap">
                            {igreja.estatuto_resumo}
                        </div>
                    </div>
                )}

                {/* DIRETORIA EXECUTIVA */}
                <div className="avoid-break pt-4">
                    <h3 className="font-bold text-[11px] bg-slate-800 text-white p-2 uppercase tracking-widest mt-2">4. Diretoria Executiva Oficial</h3>
                    <div className="grid grid-cols-6 border-l border-t border-slate-300">
                        {/* Linha Pastor Presidente */}
                        <Box label="Pastor Presidente / Cargo" value={igreja.pastor ? `${igreja.pastor} - (${igreja.pastor_cargo || 'PASTOR PRESIDENTE'})` : ''} span={4} />
                        <Box label="CPF do Pastor" value={igreja.pastor_cpf} span={2} />

                        {/* Linha 1º Vice Presidente */}
                        <Box label="1º Vice-Presidente / Cargo" value={igreja.vice_presidente1 ? `${igreja.vice_presidente1} - (${igreja.vice_presidente1_cargo || '1º VICE-PRESIDENTE'})` : ''} span={4} />
                        <Box label="CPF 1º Vice" value={igreja.vice_presidente1_cpf} span={2} />

                        {/* Linha 2º Vice Presidente */}
                        <Box label="2º Vice-Presidente / Cargo" value={igreja.vice_presidente2 ? `${igreja.vice_presidente2} - (${igreja.vice_presidente2_cargo || '2º VICE-PRESIDENTE'})` : ''} span={4} />
                        <Box label="CPF 2º Vice" value={igreja.vice_presidente2_cpf} span={2} />

                        {/* Linha 1º Secretário */}
                        <Box label="1º Secretário / Cargo" value={igreja.secretario1 ? `${igreja.secretario1} - (${igreja.secretario1_cargo || '1º SECRETÁRIO'})` : ''} span={4} />
                        <Box label="CPF 1º Secretário" value={igreja.secretario1_cpf} span={2} />

                        {/* Linha 2º Secretário */}
                        <Box label="2º Secretário / Cargo" value={igreja.secretario2 ? `${igreja.secretario2} - (${igreja.secretario2_cargo || '2º SECRETÁRIO'})` : ''} span={4} />
                        <Box label="CPF 2º Secretário" value={igreja.secretario2_cpf} span={2} />

                        {/* Linha 1º Tesoureiro */}
                        <Box label="1º Tesoureiro / Cargo" value={igreja.tesoureiro1 ? `${igreja.tesoureiro1} - (${igreja.tesoureiro1_cargo || '1º TESOUREIRO'})` : ''} span={4} />
                        <Box label="CPF 1º Tesoureiro" value={igreja.tesoureiro1_cpf} span={2} />

                        {/* Linha 2º Tesoureiro */}
                        <Box label="2º Tesoureiro / Cargo" value={igreja.tesoureiro2 ? `${igreja.tesoureiro2} - (${igreja.tesoureiro2_cargo || '2º TESOUREIRO'})` : ''} span={4} />
                        <Box label="CPF 2º Tesoureiro" value={igreja.tesoureiro2_cpf} span={2} />
                    </div>
                </div>

                {/* DADOS BANCÁRIOS & PIX */}
                {(igreja.banco || igreja.chave_pix) && (
                    <div className="avoid-break pt-4">
                        <h3 className="font-bold text-[11px] bg-slate-800 text-white p-2 uppercase tracking-widest mt-2">5. Dados Financeiros & Conta de Recebimento</h3>
                        <div className="grid grid-cols-4 border-l border-t border-slate-300">
                            <Box label="Banco de Liquidação" value={igreja.banco} span={2} />
                            <Box label="Agência" value={igreja.agencia} />
                            <Box label="Conta Bancária / Tipo" value={igreja.conta ? `${igreja.conta} (${igreja.tipo_conta || 'CORRENTE'})` : ''} />
                            <Box label="Chave PIX Registrada" value={igreja.chave_pix} span={4} />
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center border-t-2 border-slate-300 pt-8 flex justify-center gap-20 avoid-break">
                    <div className="w-64"><div className="border-b border-slate-900 mb-2"></div><p className="text-xs font-bold uppercase">{igreja.pastor}</p><p className="text-[10px] font-serif italic text-slate-500">Pastor Presidente / Superintendente</p></div>
                </div>
            </PageContainer>
        );
    }

    // 6.1 - MEMBROS LISTA
    if (mode === 'rel_membros_lista') {
        const { membros } = data;
        const currentMonth = new Date().getMonth();
        return (
            <PageContainer title="Listagem Geral de Membros" subtitle={`Total: ${membros.length} Membros Cadastrados`}>
                <Table headers={[{label:'Nome'}, {label:'Cargo'}, {label:'Contato'}, {label:'Data Nasc.'}, {label:'Status', align:'center'}]}>
                    {membros.map((m, i) => {
                        const isBirthday = m.data_nascimento && (parseInt(m.data_nascimento.split('-')[1]) - 1 === currentMonth);
                        return (
                            <tr key={m.id} className="border-b avoid-break hover:bg-slate-50">
                                <td className="p-3 font-bold flex items-center gap-2 border-r border-slate-200">
                                    {isBirthday && <Gift size={14} className="text-pink-500"/>} {m.nome}
                                </td>
                                <td className="p-3 text-xs uppercase text-slate-600 border-r border-slate-200">{m.cargo}</td>
                                <td className="p-3 text-xs border-r border-slate-200">{m.telefone}</td>
                                <td className={`p-3 text-xs border-r border-slate-200 ${isBirthday ? 'font-bold text-pink-600' : ''}`}>{formatDateLocal(m.data_nascimento)}</td>
                                <td className="p-3 text-center text-[10px] font-black uppercase text-slate-500">{m.status || 'ATIVO'}</td>
                            </tr>
                        );
                    })}
                </Table>
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-xs text-slate-500 font-bold flex items-center gap-2 avoid-break">
                    <Gift size={14} className="text-pink-500"/> O ícone indica os aniversariantes do mês atual.
                </div>
            </PageContainer>
        );
    }

    // 6.2 - FICHA CADASTRAL (MEMBRO INDIVIDUAL)
    if (mode === 'rel_ficha_membro') {
        const m = data.membro || {};
        const Box = ({ label, value, span=1 }) => (<div className={`border border-slate-400 p-2 ${span > 1 ? `col-span-${span}` : ''}`}><p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p><p className="font-bold text-sm text-slate-800 uppercase">{value || '\u00A0'}</p></div>);
        return (
            <PageContainer title="Ficha Cadastral de Membro" subtitle="Uso Interno Administrativo">
                <div className="flex justify-between items-center mb-6">
                     <div className="w-24 h-32 border-2 border-dashed border-slate-400 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400 font-bold bg-slate-50">
                         {m.foto ? <img src={m.foto} className="w-full h-full object-cover"/> : <span>FOTO 3x4</span>}
                     </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-sm bg-slate-800 text-white p-1 px-2 uppercase tracking-widest">1. Dados Pessoais</h3>
                        <div className="grid grid-cols-4 border-l border-t border-slate-400">
                            <Box label="Nome Completo" value={m.nome} span={3}/>
                            <Box label="CPF" value={m.cpf} span={1}/>
                            <Box label="Nome do Pai" value={m.nome_pai} span={2}/>
                            <Box label="Nome da Mãe" value={m.nome_mae} span={2}/>
                            <Box label="Data de Nascimento" value={formatDateLocal(m.data_nascimento)} />
                            <Box label="Naturalidade" value={m.naturalidade} span={2}/>
                            <Box label="Estado Civil" value={m.estado_civil} />
                            <Box label="Profissão / Ocupação" value={m.profissao} span={2}/>
                            <Box label="Telefone / WhatsApp" value={m.telefone} span={2}/>
                            <Box label="Endereço Residencial" value={m.endereco} span={4}/>
                            <Box label="Bairro" value={m.bairro} span={1}/>
                            <Box label="Cidade / UF" value={m.cidade ? `${m.cidade}/${m.uf||''}` : ''} span={2}/>
                            <Box label="CEP" value={m.cep} span={1}/>
                            <Box label="E-mail" value={m.email} span={4}/>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm bg-slate-800 text-white p-1 px-2 uppercase tracking-widest">2. Dados Familiares</h3>
                        <div className="grid grid-cols-4 border-l border-t border-slate-400">
                             <Box label="Nome do Cônjuge" value={m.nome_conjuge} span={3}/>
                             <Box label="Tem Filhos?" value={m.tem_filhos?.toUpperCase()} />
                             <Box label="Quantos Filhos?" value={m.qtd_filhos} span={4}/>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm bg-slate-800 text-white p-1 px-2 uppercase tracking-widest">3. Dados Eclesiásticos</h3>
                        <div className="grid grid-cols-4 border-l border-t border-slate-400">
                             <Box label="Cargo Eclesiástico" value={m.cargo} span={2}/>
                             <Box label="Função Administrativa" value={m.funcao_administrativa || 'NENHUMA'} span={2}/>
                             <Box label="Nº Registro/Cart." value={m.numero_registro} span={2}/>
                             <Box label="Status Atual" value={m.status} span={2}/>
                             <Box label="Data de Batismo" value={formatDateLocal(m.data_batismo)} span={2}/>
                             <Box label="Data de Admissão" value={formatDateLocal(m.data_admissao)} span={2}/>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs font-medium italic text-slate-600 avoid-break">
                    <p>Declaro serem verdadeiras as informações acima prestadas.</p>
                    <div className="border-b border-black w-3/4 mx-auto mt-12 mb-2"></div>
                    <p className="uppercase font-bold">Assinatura do Membro</p>
                </div>
            </PageContainer>
        );
    }

    // 7 - CARTA CONVITE
    if (mode === 'rel_carta_convite') {
        const { config } = data;
        return (
            <PageContainer>
                <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-center mb-10 text-slate-900 border-b-2 border-slate-900 pb-2">Carta Convite Oficial</h1>
                
                <div className="px-8 font-serif text-lg text-justify text-slate-800 leading-loose space-y-6">
                    <p><strong>A Paz do Senhor Jesus Cristo!</strong></p>
                    <p className="indent-12">
                        É com grande alegria e satisfação no Espírito Santo que a <strong>{data.igreja.nome}</strong>, representada por seu Pastor Presidente <strong>{data.igreja.pastor}</strong>, vem, através desta, mui respeitosamente, convidar o(a) amado(a) Pastor(a) <strong>{config.pastor_convidado}</strong> e toda a igreja coirmã <strong>{config.igreja_convidada}</strong> para estarem adorando a Deus conosco.
                    </p>
                    <p className="indent-12">
                        O evento será realizado com a participação especial do(a) <strong>{config.conjunto}</strong> e terá como preletor/cantor o(a) <strong>{config.preletor}</strong>.
                    </p>
                    
                    <div className="bg-slate-50 border-l-4 border-slate-900 p-6 my-8 rounded">
                        <p className="mb-2"><strong>Data e Hora:</strong> {config.data_evento}</p>
                        <p><strong>Tema do Evento:</strong> <em>"{config.tema}"</em></p>
                    </div>

                    <p className="indent-12">
                        Certos de que Deus fará grandes maravilhas no nosso meio, contamos com vossa honrosa presença e participação. Que as ricas consolações do Espírito Santo repousem sobre todo este ministério.
                    </p>
                </div>

                <div className="mt-auto text-center pt-16 flex flex-col items-center avoid-break">
                    <p className="text-sm font-serif mb-12">{data.igreja.cidade}, {new Date().toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'})}</p>
                    <div className="border-b border-black w-80 mb-2"></div>
                    <p className="font-bold uppercase tracking-wider">{data.igreja.pastor}</p>
                    <p className="text-xs font-serif text-slate-500">Pastor Presidente - {data.igreja.nome}</p>
                </div>
            </PageContainer>
        );
    }

    // 8 - MINISTÉRIOS (APRESENTAÇÃO)
    if (mode === 'rel_ministerios') {
        const { ministerios, membros } = data;
        return (
            <PageContainer title="Estrutura de Ministérios" subtitle="Lideranças e Componentes Departamentais">
                <div className="grid grid-cols-2 gap-6">
                    {ministerios.map(min => (
                        <div key={min.id} className="border-2 border-slate-800 rounded-xl overflow-hidden avoid-break">
                            <div className="bg-slate-800 text-white p-3 text-center">
                                <h3 className="font-black uppercase tracking-wider">{min.nome}</h3>
                            </div>
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Liderança Principal</p>
                                <p className="font-bold text-sm text-slate-800 uppercase">{membros.find(m=>m.id===min.lider1_id)?.nome || 'Não definido'}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 border-b border-slate-200 pb-1">Equipe / Membros</p>
                                <ul className="space-y-1">
                                    {(min.membros||[]).map((mm, i) => (
                                        <li key={i} className="text-xs flex justify-between">
                                            <span className="font-bold text-slate-700">{membros.find(m=>m.id===mm.membro_id)?.nome}</span>
                                            <span className="text-slate-500 text-[10px] uppercase">{mm.funcao}</span>
                                        </li>
                                    ))}
                                    {(!min.membros || min.membros.length === 0) && <li className="text-xs italic text-slate-400">Sem membros vinculados.</li>}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </PageContainer>
        );
    }

    // 9 - CORPO MINISTERIAL
    if (mode === 'rel_corpo_ministerial') {
        const { membros } = data;
        // Agrupar por cargo
        const order = ['Pastor', 'Evangelista', 'Missionário', 'Presbítero', 'Diácono', 'Auxiliar'];
        const grouped = {};
        order.forEach(c => grouped[c] = []);
        membros.forEach(m => { if(grouped[m.cargo]) grouped[m.cargo].push(m); });

        return (
            <PageContainer title="Relatório do Corpo Ministerial" subtitle="Obreiros Oficialmente Consagrados">
                        {order.map(cargo => {
                    if (grouped[cargo].length === 0) return null;
                    return (
                        <div key={cargo} className="mb-8 border border-slate-300 rounded-lg overflow-hidden avoid-break">
                            <h3 className="bg-slate-100 text-slate-900 p-3 font-black uppercase tracking-[0.2em] border-b border-slate-300">Cargo: {cargo}</h3>
                            <div className="p-0">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr><th className="p-3 text-left w-12 text-[10px] border-r border-slate-200">#</th><th className="p-3 text-left border-r border-slate-200">Nome do Obreiro</th><th className="p-3 text-left border-r border-slate-200">Telefone</th><th className="p-3 text-left">Consagração/Admissão</th></tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {grouped[cargo].map((m, i) => (
                                            <tr key={m.id} className="border-b border-slate-100 last:border-0 avoid-break">
                                                <td className="p-3 text-slate-400 font-bold border-r border-slate-200 text-center">{i+1}</td>
                                                <td className="p-3 font-bold text-slate-700 uppercase border-r border-slate-200">{m.nome}</td>
                                                <td className="p-3 border-r border-slate-200 font-medium">{m.telefone}</td>
                                                <td className="p-3 font-medium">{formatDateLocal(m.data_admissao) || formatDateLocal(m.data_batismo)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </PageContainer>
        );
    }

    // 10 - CONTADOR (Financeiro Detalhado p/ Contabilidade)
    if (mode === 'rel_contador') {
        const { financeiro, fornecedores, centro_custo, data_inicio, data_fim, congregacao_id } = data;
        
        let filtered = financeiro.filter(f => {
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
        
        let titleSuffix = 'Período Completo';
        if (data_inicio || data_fim) {
             titleSuffix = `Período: ${formatDateLocal(data_inicio) || 'Início'} a ${formatDateLocal(data_fim) || 'Atual'}`;
        }
        
        // Só pegar pagos/recebidos reais (se for saída, status='pago')
        const realizadas = filtered.filter(f => f.tipo === 'entrada' || (f.tipo === 'saida' && f.status === 'pago'));
        realizadas.sort((a,b) => new Date(a.data_competencia || a.data_vencimento || 0).getTime() - new Date(b.data_competencia || b.data_vencimento || 0).getTime());

        let tIn = 0, tOut = 0;

        return (
            <PageContainer title="Relatório Contábil Consolidado" subtitle={titleSuffix}>
                <p className="text-xs font-bold bg-amber-100 text-amber-800 p-2 mb-4 border border-amber-300">
                    Atenção Auditoria/Contador: Este relatório lista apenas receitas efetivamente recebidas e despesas efetivamente pagas no período.
                </p>
                <table className="w-full text-[10px] border-collapse border border-slate-400">
                    <thead className="bg-slate-200">
                        <tr>
                            <th className="border border-slate-400 p-1 text-left uppercase">Data</th>
                            <th className="border border-slate-400 p-1 text-left uppercase">E/S</th>
                            <th className="border border-slate-400 p-1 text-left uppercase">Histórico / Descrição</th>
                            <th className="border border-slate-400 p-1 text-left uppercase">Forma Pagto</th>
                            <th className="border border-slate-400 p-1 text-left uppercase">CNPJ/Favorecido (C. Custo)</th>
                            <th className="border border-slate-400 p-1 text-right uppercase">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {realizadas.map((r, i) => {
                            const val = parseFloat(r.valor) || 0;
                            if (r.tipo === 'entrada') tIn += val; else tOut += val;
                            const isEntrada = r.tipo === 'entrada';
                            let favorecido = '-';
                            if (!isEntrada && r.fornecedor_id) favorecido = fornecedores.find(x=>x.id===r.fornecedor_id)?.nome || r.fornecedor_id;
                            if (isEntrada && r.membro_nome) favorecido = `Membro: ${r.membro_nome}`;
                            let cc = '';
                            if (r.centro_custo_id) cc = ` (${centro_custo.find(x=>x.id===r.centro_custo_id)?.nome})`;

                            return (
                                <tr key={i} className="hover:bg-slate-50 avoid-break">
                                    <td className="border border-slate-300 p-1">{formatDateLocal(r.data_competencia || r.data_pagamento || r.data_vencimento)}</td>
                                    <td className="border border-slate-300 p-1 text-center font-bold">{isEntrada ? 'C' : 'D'}</td>
                                    <td className="border border-slate-300 p-1">{r.descricao}</td>
                                    <td className="border border-slate-300 p-1 uppercase">{r.forma_pagamento || 'CAIXA'}</td>
                                    <td className="border border-slate-300 p-1 truncate max-w-[150px]">{favorecido}{cc}</td>
                                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">{val.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="mt-6 border-4 border-slate-800 p-4 w-72 ml-auto avoid-break">
                    <h4 className="font-black text-xs uppercase border-b-2 border-slate-800 pb-1 mb-2">Balanço do Período</h4>
                    <div className="flex justify-between text-xs mb-1 font-bold"><span className="text-slate-600">Total Receitas (C)</span><span className="font-mono">R$ {tIn.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs mb-1 font-bold"><span className="text-slate-600">Total Despesas (D)</span><span className="font-mono">R$ {tOut.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t-2 border-slate-400 font-black"><span className="uppercase text-slate-900">Resultado Líquido</span><span className={`font-mono ${tIn-tOut>=0?'text-emerald-600':'text-rose-600'}`}>R$ {(tIn-tOut).toFixed(2)}</span></div>
                </div>
            </PageContainer>
        );
    }

    // 11 - ATA DE REUNIÃO
    if (mode === 'rel_ata_reuniao') {
        const { config } = data;
        const customHeaderAta = (
            <div className="text-center mb-8 pb-4 border-b-4 border-slate-900">
                <h1 className="font-serif text-3xl font-black uppercase text-slate-900">Ata de Reunião</h1>
                <h2 className="text-lg font-bold uppercase text-slate-800 tracking-widest">{data.igreja.nome}</h2>
                <p className="text-xs text-slate-600 font-medium">CNPJ: {data.igreja.cnpj} | {data.igreja.endereco} - {data.igreja.cidade}/{data.igreja.uf}</p>
            </div>
        );

        return (
            <PageContainer customHeader={customHeaderAta}>
                <div className="flex-1 font-serif text-lg text-justify text-slate-900 leading-loose">
                    <p className="indent-16 whitespace-pre-wrap">{config.texto_ata}</p>
                </div>

                <div className="mt-16 pt-8 pb-8 flex justify-between gap-10 px-10 avoid-break">
                    <div className="flex-1 text-center">
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold uppercase text-sm tracking-wider">{data.igreja.pastor}</p>
                        <p className="text-xs font-serif text-slate-600">Pastor Presidente / Moderador</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold uppercase text-sm tracking-wider">{data.igreja.secretario1 || 'Secretário Oficial'}</p>
                        <p className="text-xs font-serif text-slate-600">1º Secretário(a)</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // 12 - ANIVERSARIANTES
    if (mode === 'rel_aniversariantes') {
        const { membros, mes } = data;
        let filtrados = membros.filter(m => m.data_nascimento);
        
        if (mes) {
            filtrados = filtrados.filter(m => {
                const mStr = m.data_nascimento.split('-')[1];
                return parseInt(mStr) === parseInt(mes);
            });
        }

        filtrados.sort((a, b) => {
            const dayA = parseInt(a.data_nascimento.split('-')[2]);
            const dayB = parseInt(b.data_nascimento.split('-')[2]);
            return dayA - dayB;
        });

        const monthNames = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const subtitle = mes ? `Aniversariantes de ${monthNames[parseInt(mes)]}` : 'Todos os Aniversariantes do Ano';

        return (
            <PageContainer title="Relatório de Aniversariantes" subtitle={subtitle}>
                <Table headers={[{label:'Dia', align:'center'}, {label:'Nome'}, {label:'Cargo'}, {label:'Contato'}, {label:'Data Nasc.'}]}>
                    {filtrados.map((m, i) => (
                        <tr key={m.id} className="border-b hover:bg-slate-50 avoid-break border-slate-200">
                            <td className="p-2 font-black text-pink-600 text-center w-12 text-lg">{m.data_nascimento.split('-')[2]}</td>
                            <td className="p-2 font-bold text-slate-800">{m.nome}</td>
                            <td className="p-2 text-xs uppercase text-slate-600">{m.cargo}</td>
                            <td className="p-2 text-xs">{m.telefone}</td>
                            <td className="p-2 text-xs">{formatDateLocal(m.data_nascimento)}</td>
                        </tr>
                    ))}
                    {filtrados.length === 0 && <tr><td colSpan={5} className="p-4 text-center italic text-slate-500">Nenhum aniversariante encontrado neste período.</td></tr>}
                </Table>
            </PageContainer>
        );
    }

    // 13 - PLANEJAMENTO ANUAL
    if (mode === 'rel_planejamento_anual') {
        const orcamentos = data.orcamentos || [];
        const centro_custo = data.centro_custo || [];
        const financeiro = data.financeiro || [];
        const filtro_tipo = data.filtro_tipo || 'ano';
        const ano = data.ano || new Date().getFullYear();
        const mes = data.mes || '';
        const data_inicio = data.data_inicio || '';
        const data_fim = data.data_fim || '';

        let subtitle = "";
        let transactionFilter = (f: any) => true;

        if (filtro_tipo === 'ano') {
            subtitle = `Exercício Anual: ${ano}`;
            transactionFilter = (f: any) => {
                if (!f.data_competencia && !f.data_pagamento) return false;
                const d = f.data_competencia || f.data_pagamento;
                return d.startsWith(String(ano));
            };
        } else if (filtro_tipo === 'mes') {
            const monthNames = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            subtitle = `Referência Mensal: ${monthNames[parseInt(mes)]} de ${ano}`;
            transactionFilter = (f: any) => {
                if (!f.data_competencia && !f.data_pagamento) return false;
                const d = f.data_competencia || f.data_pagamento;
                const [y, mStr] = d.split('-');
                return y === String(ano) && parseInt(mStr) === parseInt(mes);
            };
        } else if (filtro_tipo === 'periodo') {
            subtitle = `Período Especial: ${data_inicio ? formatDateLocal(data_inicio) : 'Início'} até ${data_fim ? formatDateLocal(data_fim) : 'Fim'}`;
            transactionFilter = (f: any) => {
                const d = f.data_competencia || f.data_pagamento;
                if (!d) return false;
                if (data_inicio && d < data_inicio) return false;
                if (data_fim && d > data_fim) return false;
                return true;
            };
        }

        const processedCenters = centro_custo.map((cc: any) => {
            const budgetYearStr = String(ano);
            const budget = orcamentos.find((b: any) => b.ano === budgetYearStr && b.centro_custo_id === cc.id);
            
            const meta_receita = budget ? (parseFloat(budget.meta_receita) || 0) : 0;
            const teto_gastos = budget ? (parseFloat(budget.teto_gastos) || 0) : 0;

            const filteredTxs = financeiro.filter((f: any) => f.centro_custo_id === cc.id && transactionFilter(f));

            const entradasRealizadas = filteredTxs
                .filter((f: any) => f.tipo === 'entrada')
                .reduce((sum: number, f: any) => sum + (parseFloat(f.valor) || 0), 0);

            const saidasRealizadas = filteredTxs
                .filter((f: any) => f.tipo === 'saida')
                .reduce((sum: number, f: any) => sum + (parseFloat(f.valor) || 0), 0);

            return {
                ...cc,
                meta_receita,
                teto_gastos,
                entradasRealizadas,
                saidasRealizadas,
            };
        });

        const totalMeta = processedCenters.reduce((acc: number, cc: any) => acc + cc.meta_receita, 0);
        const totalTeto = processedCenters.reduce((acc: number, cc: any) => acc + cc.teto_gastos, 0);
        const totalEntradas = processedCenters.reduce((acc: number, cc: any) => acc + cc.entradasRealizadas, 0);
        const totalSaidas = processedCenters.reduce((acc: number, cc: any) => acc + cc.saidasRealizadas, 0);

        const saldoPrevisto = totalMeta - totalTeto;
        const saldoRealizado = totalEntradas - totalSaidas;

        return (
            <PageContainer title="Relatório de Planejamento Orçamentário" subtitle={subtitle}>
                <div className="grid grid-cols-3 gap-4 mb-6 avoid-break bg-slate-50 border border-slate-300 rounded-xl p-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Metas de Receitas (Anual)</p>
                        <p className="text-lg font-black text-emerald-700 mt-1">R$ {totalMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Realizado no filtro: R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Limites de Gastos (Anual)</p>
                        <p className="text-lg font-black text-rose-700 mt-1">R$ {totalTeto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Realizado no filtro: R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Diferença de Balanço</p>
                        <p className={`text-lg font-black mt-1 ${saldoRealizado >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
                            R$ {saldoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Previsto: R$ {saldoPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <h3 className="font-bold text-xs uppercase text-slate-700 mb-2 mt-4 tracking-wider">Detalhamento por Centro de Custos</h3>
                <Table headers={[
                    { label: 'Centro de Custo' },
                    { label: 'Meta Receita', align: 'right' },
                    { label: 'Receita Realizada', align: 'right' },
                    { label: 'Meta %', align: 'center' },
                    { label: 'Teto Gastos', align: 'right' },
                    { label: 'Despesa Realizada', align: 'right' },
                    { label: 'Uso %', align: 'center' }
                ]}>
                    {processedCenters.map((cc: any) => {
                        const metaPct = cc.meta_receita > 0 ? (cc.entradasRealizadas / cc.meta_receita) * 100 : 0;
                        const tetoPct = cc.teto_gastos > 0 ? (cc.saidasRealizadas / cc.teto_gastos) * 100 : 0;

                        return (
                            <tr key={cc.id} className="border-b hover:bg-slate-50 avoid-break text-[10px] border-slate-200">
                                <td className="p-2 font-bold text-slate-850">
                                    <div className="font-bold text-slate-800 text-xs">{cc.nome}</div>
                                    <div className="text-[9px] text-slate-400 font-medium">{cc.descricao || 'Sem descrição'}</div>
                                </td>
                                <td className="p-2 text-right text-slate-600 font-mono">
                                    R$ {cc.meta_receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-right text-emerald-600 font-bold font-mono">
                                    R$ {cc.entradasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-center">
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${metaPct >= 100 ? 'bg-emerald-100 text-emerald-800' : metaPct > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {metaPct.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-2 text-right text-slate-600 font-mono">
                                    R$ {cc.teto_gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-right text-rose-650 font-bold font-mono">
                                    R$ {cc.saidasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-center">
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${tetoPct > 100 ? 'bg-rose-100 text-rose-800' : tetoPct > 80 ? 'bg-amber-100 text-amber-800' : tetoPct > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {tetoPct.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {processedCenters.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-4 text-center italic text-slate-500">Nenhum centro de custo cadastrado.</td>
                        </tr>
                    )}
                </Table>

                <div className="mt-6 border-t border-slate-300 pt-3 text-[10px] text-justify text-slate-500 leading-relaxed avoid-break">
                    <strong className="text-slate-700">Nota:</strong> Este relatório consolida as metas de receitas e os limites de teto de gastos configurados anualmente pela liderança da igreja frente a todas as transações de receitas e despesas registradas no livro-caixa dentro do filtro de abrangência selecionado. Margens superiores a 100% nas receitas são excelentes, enquanto usos acima de 100% do teto de gastos no setor financeiro exigem contingenciamento e revisão orçamentária imediata.
                </div>
            </PageContainer>
        );
    }

    // --- NOVA NOTA FISCAL DE SERVIÇO (SaaS) ---
    if (mode === 'nf_servico') {
        const { tenant, valor } = data;
        const dataEmissao = new Date().toLocaleDateString('pt-BR');
        const mesRef = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        
        return (
            <div className="w-full bg-white print-block relative flex flex-col mx-auto shadow-xl" style={{ width: '100%', minHeight: '297mm', boxSizing: 'border-box', ...selectedMargin }}>
                <div className="flex-1 border-2 border-slate-200 flex flex-col p-8 bg-white relative rounded-xl shadow-sm">
                    {/* Header NF */}
                    <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
                        <div className="flex items-center gap-4">
                            {data.igreja?.icone_sistema ? (
                                <img src={data.igreja.icone_sistema} alt="Logo App" className="w-16 h-16 object-contain rounded-xl shadow-md border border-slate-200 p-1 bg-white" />
                            ) : (
                                <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-xl shadow-md">
                                    <Code size={32}/>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black uppercase text-slate-900">Nota Fiscal de Serviço</h1>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Documento Auxiliar de Prestação de Serviços</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Número da Nota</p>
                            <p className="text-xl font-black text-rose-600 font-mono tracking-widest">NFS-{Date.now().toString().slice(-6)}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Emissão: {dataEmissao}</p>
                        </div>
                    </div>

                    {/* PRESTADOR */}
                    <div className="border border-slate-300 rounded-xl p-4 mb-4 bg-slate-50/50 shadow-sm">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-200 pb-1">Prestador do Serviço (Emissor)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black text-slate-800 uppercase">{data.igreja?.prestador_servico?.nome || 'GIPP TECNOLOGIA E SOLUÇÕES EM SOFTWARE'}</p>
                                <p className="text-[11px] font-bold text-slate-600 mt-1">CNPJ: {data.igreja?.prestador_servico?.cnpj || '00.000.000/0001-00'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-600">{data.igreja?.prestador_servico?.endereco || 'Rua da Inovação Tecnológica, 100 - Centro'}</p>
                                <p className="text-[10px] font-bold text-slate-600">{data.igreja?.prestador_servico?.cidade_uf || 'Rio de Janeiro / RJ'} - CEP: {data.igreja?.prestador_servico?.cep || '20000-000'}</p>
                                <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{data.igreja?.prestador_servico?.email || 'financeiro@gippsystem.com'}</p>
                            </div>
                        </div>
                    </div>

                    {/* TOMADOR */}
                    <div className="border border-slate-300 rounded-xl p-4 mb-6 shadow-sm">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-200 pb-1">Tomador do Serviço (Cliente)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-black text-slate-800 uppercase">{tenant?.nome || 'CLIENTE NÃO IDENTIFICADO'}</p>
                                <p className="text-[11px] font-bold text-slate-600 mt-1">CNPJ: {tenant?.cnpj || 'Não cadastrado'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-600">{tenant?.endereco || 'Endereço não cadastrado'}</p>
                                <p className="text-[10px] font-bold text-slate-600">{tenant?.cidade || 'Cidade não informada'} {tenant?.uf && `- ${tenant?.uf}`}</p>
                                <p className="text-[10px] font-bold text-slate-600 mt-0.5">Contato: {tenant?.telefone || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIÇÃO DOS SERVIÇOS */}
                    <div className="border border-slate-300 rounded-xl mb-6 overflow-hidden shadow-sm flex-1 flex flex-col">
                        <div className="bg-slate-800 text-white p-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-center">Discriminação dos Serviços e Produtos</h3>
                        </div>
                        <div className="p-6 bg-white flex-1">
                            <p className="text-sm text-slate-700 leading-loose font-medium">
                                Licenciamento de direito de uso de software corporativo em nuvem (SaaS) - Sistema <strong>GIPP Gestão Eclesiástica Inteligente</strong>.<br/><br/>
                                <span className="inline-block w-full border-b border-slate-100 mb-2"></span>
                                <strong className="text-slate-900">Plano Contratado:</strong> GIPP {tenant?.plano?.toUpperCase() || 'AVANÇADO'}<br/>
                                <strong className="text-slate-900">Competência / Referência:</strong> {mesRef.toUpperCase()}<br/>
                                <strong className="text-slate-900">Itens Inclusos:</strong> Hospedagem em nuvem (Cloud Storage), manutenção de base de dados, segurança de backups automatizados e suporte técnico do sistema.<br/>
                            </p>
                        </div>
                    </div>

                    {/* VALORES */}
                    <div className="flex justify-end mb-8">
                        <div className="w-1/2 border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-md">
                            <div className="bg-emerald-50 p-3 border-b border-emerald-200">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-800 text-center">Valor Total Líquido da Nota</h3>
                            </div>
                            <div className="p-4 text-center bg-white">
                                <p className="text-4xl font-black text-emerald-600">R$ {parseFloat(valor || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* INFORMAÇÕES COMPLEMENTARES */}
                    <div className="mt-auto border-t-2 border-slate-800 pt-4 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Informações Complementares ao Cliente</p>
                        <p className="text-[10px] text-slate-600 leading-relaxed max-w-2xl mx-auto">Documento emitido eletronicamente pelo sistema GIPP Master. Este documento atua como recibo de prestação de serviços (licenciamento de software) não gerando crédito ou débito de impostos (ICMS/IPI). Agradecemos a parceria ministerial.</p>
                        <p className="text-[9px] text-slate-400 mt-3 uppercase font-mono bg-slate-50 p-1.5 rounded inline-block border border-slate-200">Chave de Autenticação: {appId}-{tenant?.id}-{Date.now()}</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- NOVA ATA DE ATENDIMENTO DE GABINETE / REUNIÃO PASTORAL ---
    if (mode === 'pastor_ata') {
        const item = data.item || {};
        const customHeaderAta = (
            <div className="text-center mb-8 pb-4 border-b-4 border-slate-900">
                <h1 className="font-serif text-3xl font-black uppercase text-slate-900 leading-tight">Ata de Gabinete / Reunião Pastoral</h1>
                <h2 className="text-lg font-bold uppercase text-slate-800 tracking-widest mt-1">{data.igreja?.nome || 'Ministério'}</h2>
                <p className="text-xs text-slate-600 font-medium mt-1">CNPJ: {data.igreja?.cnpj} | {data.igreja?.endereco} - {data.igreja?.cidade}/{data.igreja?.uf}</p>
            </div>
        );

        return (
            <PageContainer customHeader={customHeaderAta}>
                <div className="space-y-6">
                    {/* Metadados da Ata */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-400 p-4 bg-slate-50/50 rounded-xl avoid-break">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Assunto / Título</p>
                            <p className="text-xs font-black text-slate-800 uppercase mt-0.5">{item.titulo || 'Sem Título'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tipo de Atendimento</p>
                            <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{item.tipo || 'Gabinete'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Data do Atendimento</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{item.data ? formatDateLocal(item.data) : 'Sem data'} {item.hora ? `às ${item.hora}` : ''}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Nível de Confidencialidade</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded inline-block uppercase mt-1 border ${item.confidencialidade === 'altamente_confidencial' ? 'bg-rose-100 text-rose-700 border-rose-200' : item.confidencialidade === 'confidencial' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                {item.confidencialidade === 'altamente_confidencial' ? 'Altamente Confidencial' : item.confidencialidade === 'confidencial' ? 'Confidencial' : 'Geral'}
                            </span>
                        </div>
                    </div>

                    {/* Presenças / Participantes */}
                    <div className="border border-slate-400 p-4 rounded-xl bg-white avoid-break shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Membros / Pessoas Assistidas / Participantes Presentes</p>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{item.pessoas || 'Não especificado.'}</p>
                    </div>

                    {/* Descrição Detalhada */}
                    <div className="border border-slate-400 p-6 rounded-xl bg-white min-h-[280px] shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Resumo da Conversa, Pauta e Ocorrências Eclesiásticas</p>
                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-justify">
                            {item.conteudo || 'Sem anotações detalhadas.'}
                        </div>
                    </div>

                    {/* Encaminhamentos / Decisões */}
                    {item.decisoes && (
                        <div className="border border-slate-400 p-4 rounded-xl bg-slate-50/50 avoid-break shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Encaminhamentos Eclesiásticos & Decisões Tomadas</p>
                            <p className="text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{item.decisoes}</p>
                        </div>
                    )}

                    {/* Assinaturas */}
                    <div className="mt-12 pt-8 pb-4 flex justify-between gap-10 px-6 avoid-break">
                        <div className="flex-1 text-center">
                            <div className="border-b border-black w-full mb-2"></div>
                            <p className="font-extrabold uppercase text-[11px] tracking-wider text-slate-900">{data.igreja?.pastor || 'Pastor Responsável'}</p>
                            <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-widest mt-0.5">Moderador / Pastor Responsável</p>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="border-b border-black w-full mb-2"></div>
                            <p className="font-extrabold uppercase text-[11px] tracking-wider text-slate-900">Participantes / Assistidos</p>
                            <p className="text-[9px] uppercase text-slate-400 font-extrabold tracking-widest mt-0.5">Assinatura dos Presentes</p>
                        </div>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return null;
};

// --- NOVO: MÓDULO DE EMAIL INTERNO (ESTILO GMAIL) ---
// Componente de Autocomplete para Seleção de Destinatários
export const AutocompleteRecipient = ({ db, isAdmin, onSelect, selectedRecipients }) => {
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Filtro de destinatários permitidos
    const allowedRecipients = useMemo(() => {
        let list = [];
        if (isAdmin) {
            // Admin pode enviar para todos (Usuários e Membros)
            const usuarios = db.usuarios.map(u => ({ ...u, type: 'usuario' }));
            const membros = db.membros.map(m => ({ ...m, type: 'membro' }));
            list = [...usuarios, ...membros];
        } else {
            // Membros só podem enviar para Usuários (Administração/Secretaria/Tesouraria)
            list = db.usuarios.map(u => ({ ...u, type: 'usuario' }));
        }
        // Remove os já selecionados
        return list.filter(r => !selectedRecipients.find(sr => sr.id === r.id));
    }, [db.usuarios, db.membros, isAdmin, selectedRecipients]);

    const filteredRecipients = useMemo(() => {
        if (!query) return allowedRecipients;
        return allowedRecipients.filter(r => safeText(r.nome).toLowerCase().includes(query.toLowerCase()));
    }, [query, allowedRecipients]);

    return (
        <div className="relative w-full">
            <div className="flex flex-wrap gap-2 items-center min-h-[40px] border-b border-slate-200 py-2">
                <span className="text-slate-500 text-sm font-semibold w-12 shrink-0">Para</span>
                {selectedRecipients.map(r => (
                    <div key={r.id} className="flex items-center gap-1 bg-[#E1DFDD] hover:bg-[#D2D0CE] text-slate-800 px-2 py-1 rounded-md text-xs transition-colors">
                        {r.nome}
                        <button type="button" onClick={() => onSelect(selectedRecipients.filter(sr => sr.id !== r.id))} className="hover:text-black ml-1"><X size={12}/></button>
                    </div>
                ))}
                <input 
                    type="text" 
                    className="flex-1 bg-transparent outline-none text-sm min-w-[150px]" 
                    value={query}
                    onChange={(e) => { setQuery((e.target.value || "").toUpperCase()); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={selectedRecipients.length === 0 ? "Pesquisar pessoas..." : ""}
                />
            </div>
            {showDropdown && filteredRecipients.length > 0 && (
                <div className="absolute z-50 top-full left-12 w-[calc(100%-3rem)] max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg mt-1 custom-scrollbar">
                    {filteredRecipients.map(r => (
                        <button 
                            key={r.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-[#F3F2F1] flex items-center justify-between border-b border-slate-100 last:border-0"
                            onClick={() => {
                                onSelect([...selectedRecipients, { id: r.id, nome: r.nome, type: r.type }]);
                                setQuery('');
                                setShowDropdown(false);
                            }}
                        >
                            <div>
                                <span className="font-semibold text-sm text-slate-800 block">{r.nome}</span>
                                {r.type === 'usuario' && <span className="text-[10px] uppercase font-bold text-[#0F6CBD] tracking-wider">Administração</span>}
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {/* Overlay para fechar o dropdown se clicar fora */}
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
        </div>
    );
};

export const SharedEmailModule = ({ user, isAdmin }) => {
    const { db, setDoc, doc, collection, dbFirestore, appId, addToast, addDoc, updateDoc } = useContext(ChurchContext);
    const [currentFolder, setCurrentFolder] = useState('inbox'); // inbox, sent, trash
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [composeData, setComposeData] = useState(null); // null = fechado, object = aberto (pode ser vazio ou pre-preenchido)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const fileInputRef = useRef(null);
    
    // Cores oficiais do MS Outlook
    const OUTLOOK_BLUE = "#0F6CBD";
    const OUTLOOK_BG_SIDEBAR = "#F3F2F1";
    const OUTLOOK_HOVER = "#EDEBE9";

    // Configurar Compose Inicial
    const startCompose = (replyTo = null, forward = null) => {
        if (replyTo) {
            setComposeData({
                recipients: [{ id: replyTo.senderId, nome: replyTo.senderName, type: replyTo.senderType }],
                subject: `Re: ${replyTo.subject}`,
                body: `\n\n--- De: ${replyTo.senderName} ---\nEnviado: ${formatDateLocal(replyTo.timestamp)}\n\n> ${replyTo.body.replace(/\n/g, '\n> ')}`,
                attachments: []
            });
        } else if (forward) {
            setComposeData({
                recipients: [],
                subject: `Enc: ${forward.subject}`,
                body: `\n\n--- Mensagem encaminhada de ${forward.senderName} ---\n\n${forward.body}`,
                attachments: forward.attachments || [] // Inclui anexos originais (opcional)
            });
        } else {
            setComposeData({ recipients: [], subject: '', body: '', attachments: [] });
        }
    };

    const handleAttachment = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // Limite de 2MB para simular anexo leve
                alert("O anexo deve ter no máximo 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setComposeData(prev => ({
                    ...prev,
                    attachments: [...(prev.attachments || []), { name: file.name, data: reader.result }]
                }));
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };

    const removeAttachment = (index) => {
        setComposeData(prev => {
            const newAtt = [...prev.attachments];
            newAtt.splice(index, 1);
            return { ...prev, attachments: newAtt };
        });
    };

    const downloadAttachment = (att) => {
        const a = document.createElement('a');
        a.href = att.data;
        a.download = att.name;
        a.click();
    };

    const sendEmail = async () => {
        if (composeData.recipients.length === 0) return addToast("Adicione pelo menos um destinatário.", "warning");
        if (!composeData.subject.trim()) return addToast("O assunto não pode estar vazio.", "warning");

        const timestamp = new Date().toISOString();
        
        try {
            // Para cada destinatário, cria um email
            for (const rec of composeData.recipients) {
                const emailDoc = {
                    senderId: user.id,
                    senderName: user.nome,
                    senderType: isAdmin ? 'usuario' : 'membro',
                    recipientId: rec.id,
                    recipientName: rec.nome,
                    recipientType: rec.type,
                    subject: composeData.subject,
                    body: composeData.body,
                    timestamp,
                    readByRecipient: false,
                    deletedBySender: false,
                    deletedByRecipient: false,
                    attachments: composeData.attachments || []
                };
                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
            }
            addToast("Mensagem enviada.", "success");
            setComposeData(null);
        } catch (error) {
            console.error(error);
            addToast("Erro ao enviar mensagem.", "error");
        }
    };

    // Lógica de Filtro dos Emails
    const allEmails = db.emails || [];
    
    const filteredEmails = useMemo(() => {
        let list = [];
        
        if (isAdmin) {
            if (currentFolder === 'inbox') {
                list = allEmails.filter(e => e.recipientType === 'usuario' && !e.deletedByRecipient);
            } else if (currentFolder === 'sent') {
                list = allEmails.filter(e => e.senderId === user.id && !e.deletedBySender);
            } else if (currentFolder === 'trash') {
                list = allEmails.filter(e => 
                    (e.recipientType === 'usuario' && e.deletedByRecipient) || 
                    (e.senderId === user.id && e.deletedBySender)
                );
            }
        } else {
            if (currentFolder === 'inbox') {
                list = allEmails.filter(e => e.recipientId === user.id && !e.deletedByRecipient);
            } else if (currentFolder === 'sent') {
                list = allEmails.filter(e => e.senderId === user.id && !e.deletedBySender);
            } else if (currentFolder === 'trash') {
                list = allEmails.filter(e => 
                    (e.recipientId === user.id && e.deletedByRecipient) || 
                    (e.senderId === user.id && e.deletedBySender)
                );
            }
        }

        if (searchQuery) {
            const sq = searchQuery.toLowerCase();
            list = list.filter(e => 
                e.subject.toLowerCase().includes(sq) || 
                e.senderName.toLowerCase().includes(sq) || 
                e.recipientName.toLowerCase().includes(sq) ||
                e.body.toLowerCase().includes(sq)
            );
        }

        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allEmails, currentFolder, isAdmin, user.id, searchQuery]);

    const unreadCount = allEmails.filter(e => 
        (isAdmin ? e.recipientType === 'usuario' : e.recipientId === user.id) && 
        !e.deletedByRecipient && 
        !e.readByRecipient
    ).length;

    const handleAction = async (action, ids) => {
        try {
            for (const id of ids) {
                const email = allEmails.find(e => e.id === id);
                if (!email) continue;
                
                const updates: any = {};
                const isSender = email.senderId === user.id;
                const isRecipient = isAdmin ? email.recipientType === 'usuario' : email.recipientId === user.id;

                if (action === 'delete') {
                    if (isSender) updates.deletedBySender = true;
                    if (isRecipient) updates.deletedByRecipient = true;
                } else if (action === 'restore') {
                    if (isSender) updates.deletedBySender = false;
                    if (isRecipient) updates.deletedByRecipient = false;
                } else if (action === 'hard_delete') {
                    await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails', id));
                    continue;
                } else if (action === 'mark_read') {
                    if (isRecipient) updates.readByRecipient = true;
                } else if (action === 'mark_unread') {
                    if (isRecipient) updates.readByRecipient = false;
                }

                if (Object.keys(updates).length > 0) {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails', id), updates, { merge: true });
                }
            }
            setSelectedIds([]);
            addToast("Ação concluída.", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao executar ação.", "error");
        }
    };

    const openEmail = async (email) => {
        setSelectedEmail(email);
        const isRecipient = isAdmin ? email.recipientType === 'usuario' : email.recipientId === user.id;
        if (isRecipient && !email.readByRecipient) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails', email.id), { readByRecipient: true }, { merge: true });
            } catch (e) { console.error("Erro ao marcar lido", e); }
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden animate-entrance font-[Segoe UI,sans-serif]">
            
            {/* SIDEBAR OUTLOOK-LIKE */}
            <div className={`w-full md:w-60 flex flex-col shrink-0 border-r border-slate-200 ${selectedEmail || composeData ? 'hidden md:flex' : 'flex'}`} style={{ backgroundColor: OUTLOOK_BG_SIDEBAR }}>
                <div className="p-4 border-b border-transparent">
                    <button 
                        onClick={() => { setSelectedEmail(null); startCompose(); }}
                        className="w-full text-white rounded-[4px] py-2 px-4 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-colors hover:brightness-95"
                        style={{ backgroundColor: OUTLOOK_BLUE }}
                    >
                        <Plus size={16}/> Nova mensagem
                    </button>
                </div>
                <div className="flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Favoritos</div>
                    {[
                        { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null },
                        { id: 'sent', label: 'Itens Enviados', icon: SendIcon },
                        { id: 'trash', label: 'Itens Excluídos', icon: Trash2 }
                    ].map(f => {
                        const isActive = currentFolder === f.id;
                        return (
                            <button 
                                key={f.id}
                                onClick={() => { setCurrentFolder(f.id); setSelectedEmail(null); setSelectedIds([]); setComposeData(null); }}
                                className={`w-full flex items-center justify-between px-4 py-2 transition-colors text-sm relative ${isActive ? 'bg-white font-semibold text-slate-900' : 'text-slate-700 hover:bg-[#EDEBE9]'}`}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-3/5 rounded-r-md" style={{ backgroundColor: OUTLOOK_BLUE }}></div>}
                                <div className="flex items-center gap-3">
                                    <f.icon size={16} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? 'text-[#0F6CBD]' : 'text-slate-500'}/>
                                    {f.label}
                                </div>
                                {f.badge && <span className="text-[#0F6CBD] text-xs font-bold">{f.badge}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                
                {/* TOOLBAR / RIBBON OUTLOOK */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-2 bg-white shrink-0 z-10">
                    <div className="flex items-center gap-1">
                        {/* Ações Visíveis dependendo do contexto */}
                        {!selectedEmail && !composeData && selectedIds.length > 0 && (
                            <>
                                {currentFolder !== 'trash' && (
                                    <button onClick={() => handleAction('delete', selectedIds)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                        <Trash2 size={16} strokeWidth={1.5}/> Excluir
                                    </button>
                                )}
                                {currentFolder === 'inbox' && (
                                    <button onClick={() => handleAction('mark_read', selectedIds)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                        <Mail size={16} strokeWidth={1.5}/> Marcar como lida
                                    </button>
                                )}
                                {currentFolder === 'trash' && (
                                    <>
                                        <button onClick={() => handleAction('restore', selectedIds)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                            <RefreshCw size={16} strokeWidth={1.5}/> Restaurar
                                        </button>
                                        <button onClick={() => handleAction('hard_delete', selectedIds)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                            <X size={16} strokeWidth={1.5}/> Esvaziar
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {selectedEmail && !composeData && (
                            <>
                                <button onClick={() => startCompose(selectedEmail)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                    <Reply size={16} strokeWidth={1.5}/> Responder
                                </button>
                                <button onClick={() => startCompose(null, selectedEmail)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                    <Forward size={16} strokeWidth={1.5}/> Encaminhar
                                </button>
                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                {currentFolder !== 'trash' && (
                                    <button onClick={() => { handleAction('delete', [selectedEmail.id]); setSelectedEmail(null); }} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                        <Trash2 size={16} strokeWidth={1.5}/> Excluir
                                    </button>
                                )}
                            </>
                        )}
                        
                        {composeData && (
                            <>
                                <button onClick={sendEmail} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-semibold transition-colors" style={{ backgroundColor: OUTLOOK_BLUE }}>
                                    <SendIcon size={16} strokeWidth={2}/> Enviar
                                </button>
                                <label className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors cursor-pointer">
                                    <Paperclip size={16} strokeWidth={1.5}/> Anexar
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachment} />
                                </label>
                                <button onClick={() => setComposeData(null)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-md text-sm text-slate-700 transition-colors">
                                    <Trash2 size={16} strokeWidth={1.5}/> Descartar
                                </button>
                            </>
                        )}
                    </div>

                    {/* Barra de Pesquisa Integrada no Header */}
                    {!selectedEmail && !composeData && (
                        <div className="relative w-64 mr-2">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search size={14} className="text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Pesquisar..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery((e.target.value || "").toUpperCase())}
                                className="block w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md leading-5 bg-[#F3F2F1] placeholder-slate-500 focus:outline-none focus:bg-white focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD] sm:text-sm transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* MODAL DE COMPOR (SOBREPÕE O CONTEÚDO) */}
                {composeData && (
                    <div className="absolute inset-0 top-14 z-50 bg-white flex flex-col animate-entrance">
                        <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto custom-scrollbar">
                            
                            <AutocompleteRecipient 
                                db={db} 
                                isAdmin={isAdmin} 
                                selectedRecipients={composeData.recipients}
                                onSelect={(recs) => setComposeData({...composeData, recipients: recs})}
                            />
                            
                            <div className="border-b border-slate-200 flex items-center py-2">
                                <span className="text-slate-500 text-sm font-semibold w-12 shrink-0">Cc</span>
                                <input type="text" className="flex-1 bg-transparent outline-none text-sm uppercase" placeholder="" disabled />
                            </div>

                            <div className="border-b border-slate-200 py-3">
                                <input 
                                    type="text" 
                                    placeholder="Adicione um assunto" 
                                    value={composeData.subject}
                                    onChange={(e) => setComposeData({...composeData, subject: (e.target.value || "").toUpperCase()})}
                                    className="w-full text-lg font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>
                            
                            {/* Anexos Compor */}
                            {composeData.attachments && composeData.attachments.length > 0 && (
                                <div className="border-b border-slate-200 py-3 flex flex-wrap gap-2">
                                    {composeData.attachments.map((att, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[#F3F2F1] border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 shadow-sm">
                                            <Paperclip size={14}/>
                                            <span className="max-w-[200px] truncate">{att.name}</span>
                                            <button onClick={() => removeAttachment(idx)} className="text-slate-500 hover:text-slate-900 ml-1"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea 
                                className="flex-1 w-full py-6 text-slate-800 outline-none resize-none text-sm font-[Arial,sans-serif]"
                                value={composeData.body}
                                onChange={(e) => setComposeData({...composeData, body: (e.target.value || "").toUpperCase()})}
                            ></textarea>
                            
                        </div>
                    </div>
                )}

                {/* VISTA DE LEITURA (EMAIL SELECIONADO) */}
                {selectedEmail && !composeData && (
                    <div className="absolute inset-0 top-14 z-40 bg-white flex flex-col animate-entrance border-t border-slate-200">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#F3F2F1] border-b border-slate-200">
                            <button onClick={() => setSelectedEmail(null)} className="p-1 hover:bg-[#D2D0CE] rounded text-slate-600 transition-colors" title="Fechar painel de leitura"><X size={18}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <div className="max-w-4xl">
                                <h2 className="text-2xl font-semibold text-slate-900 mb-6">{selectedEmail.subject}</h2>
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: OUTLOOK_BLUE }}>
                                        {selectedEmail.senderName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-slate-900 text-sm">{selectedEmail.senderName}</p>
                                            <p className="text-xs text-slate-500">{new Date(selectedEmail.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Para: {selectedEmail.recipientName}</p>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-[Arial,sans-serif] pb-10">
                                    {selectedEmail.body}
                                </div>

                                {/* Anexos Lidos */}
                                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                    <div className="mt-8 border-t border-slate-200 pt-4">
                                        <p className="text-xs font-semibold text-slate-600 mb-3">{selectedEmail.attachments.length} anexo(s)</p>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedEmail.attachments.map((att, idx) => (
                                                <button key={idx} onClick={() => downloadAttachment(att)} className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-md hover:shadow-sm transition-shadow text-left max-w-[240px] group">
                                                    <div className="bg-[#F3F2F1] p-2 rounded"><FileText size={20} className="text-slate-500"/></div>
                                                    <span className="text-xs font-semibold text-slate-700 truncate flex-1">{att.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTA DE EMAILS (COLUNA CENTRAL SE FOSSE 3 COLUNAS, AQUI É 2) */}
                {!selectedEmail && !composeData && (
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredEmails.length > 0 ? (
                                <div className="divide-y divide-[#EDEBE9]">
                                    {filteredEmails.map(email => {
                                        const isUnread = (isAdmin ? email.recipientType === 'usuario' : email.recipientId === user.id) && !email.readByRecipient;
                                        const isSelected = selectedIds.includes(email.id);
                                        const showSender = currentFolder === 'inbox' || currentFolder === 'trash';
                                        
                                        return (
                                            <div 
                                                key={email.id} 
                                                className={`flex items-start p-3 cursor-pointer group relative transition-colors ${isSelected ? 'bg-[#E7F3FF]' : 'hover:bg-[#F3F2F1]'} ${isUnread ? 'bg-white' : 'bg-white'}`}
                                            >
                                                {/* Blue Bar for Unread Outlook Style */}
                                                {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: OUTLOOK_BLUE }}></div>}
                                                
                                                {/* Checkbox Area */}
                                                <div className="w-8 shrink-0 flex justify-center pt-1" onClick={(e) => e.stopPropagation()}>
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#0F6CBD] bg-[#0F6CBD]' : 'border-slate-400 group-hover:border-[#0F6CBD]'}`}>
                                                        {isSelected && <Check size={10} className="text-white" strokeWidth={3}/>}
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(email.id)}
                                                            className="absolute opacity-0 w-4 h-4 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Info Container (Click opens email) */}
                                                <div className="flex-1 min-w-0 pr-4" onClick={() => openEmail(email)}>
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <div className={`text-sm truncate pr-2 ${isUnread ? 'font-bold text-[#0F6CBD]' : 'font-semibold text-slate-800'}`}>
                                                            {showSender ? email.senderName : email.recipientName}
                                                        </div>
                                                        <div className={`text-xs shrink-0 ${isUnread ? 'font-bold text-[#0F6CBD]' : 'text-slate-500'}`}>
                                                            {new Date(email.timestamp).toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') 
                                                                ? new Date(email.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                                                                : new Date(email.timestamp).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[13px] truncate pr-2 block ${isUnread ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
                                                            {email.subject || '(Sem assunto)'}
                                                        </span>
                                                        {email.attachments && email.attachments.length > 0 && (
                                                            <Paperclip size={14} className="text-slate-400 shrink-0"/>
                                                        )}
                                                    </div>
                                                    
                                                    <span className="text-[13px] text-slate-500 truncate block mt-0.5">
                                                        {email.body.replace(/\n/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <Inbox size={48} strokeWidth={1} className="mb-4 text-slate-300"/>
                                    <p className="text-lg">Nada para ver aqui</p>
                                    <p className="text-sm mt-1">A pasta está vazia.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Wrapper para Admin
const Sidebar = ({ view, setView, open, setOpen, user }) => {
    const { handleLogoutRequest, db, hasPermission, addToast } = useContext(ChurchContext); 
    
    // --- NOVO: LÓGICA DE VERIFICAÇÃO DE PLANOS (SaaS) ---
    const checkPlan = (moduleId) => {
        if (user?.id === 'dev') return true; // O Desenvolvedor acede a tudo para testar
        const plano = db.igreja?.plano || 'avancado'; // Padrão é avançado se não tiver plano

        const defaultPlanos = {
            basico: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'sobre', 'changelog', 'assistente_ai', 'salinha_kids', 'config_visual', 'config_sistema', 'manual'],
            standard: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'sobre', 'changelog', 'assistente_ai', 'cad_celula', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_carnes', 'fin_utilitarios', 'secretaria_certificados', 'carteirinha_studio', 'grid', 'credencial_lote', 'relatorios', 'salinha_kids', 'config_visual', 'config_sistema', 'manual'],
            avancado: ['dashboard', 'changelog', 'sobre', 'cad_membro', 'visitantes', 'cad_igreja', 'cad_patrimonio', 'cad_celula', 'cad_usuario', 'acessos_portal', 'cad_departamento', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_conciliacao', 'fin_carnes', 'fin_utilitarios', 'boletim', 'biblia', 'assistente_ai', 'email_interno', 'secretaria_integrada', 'secretaria_certificados', 'carteirinha_studio', 'grid', 'credencial_lote', 'secretaria_ebd', 'gestao_cursos', 'missoes_painel', 'rede_social', 'relatorios', 'config_backup', 'auditoria', 'lixeira', 'salinha_kids', 'config_visual', 'config_sistema', 'manual']
        };

        const PLAN_MODULES = { ...defaultPlanos };
        if (db.igreja?.planos_config) {
            ['basico', 'standard', 'avancado'].forEach(pKey => {
                if (db.igreja.planos_config[pKey]) {
                    PLAN_MODULES[pKey] = [...db.igreja.planos_config[pKey]];
                    if (!PLAN_MODULES[pKey].includes('manual')) {
                        PLAN_MODULES[pKey].push('manual');
                    }
                    if (pKey === 'avancado' && !PLAN_MODULES[pKey].includes('gestao_cursos')) {
                        PLAN_MODULES[pKey].push('gestao_cursos');
                    }
                }
            });
        }

        if (plano === 'avancado' && (!PLAN_MODULES || !PLAN_MODULES.avancado)) return true;

        return PLAN_MODULES[plano]?.includes(moduleId) || false;
    };
    
    // CORES DINÂMICAS PARA OS ÍCONES DO MENU
    const iconColors = {
        portal_pastor: 'group-hover:text-amber-500',
        dashboard: 'group-hover:text-blue-500',
        changelog: 'group-hover:text-fuchsia-500',
        sobre: 'group-hover:text-teal-500',
        manual: 'group-hover:text-indigo-500',
        cad_membro: 'group-hover:text-indigo-500',
        visitantes: 'group-hover:text-rose-500',
        cad_igreja: 'group-hover:text-amber-500',
        cad_patrimonio: 'group-hover:text-emerald-500',
        cad_celula: 'group-hover:text-purple-500',
        cad_usuario: 'group-hover:text-slate-700',
        acessos_portal: 'group-hover:text-cyan-500',
        cad_departamento: 'group-hover:text-pink-500',
        fin_entrada: 'group-hover:text-emerald-500',
        fin_saida: 'group-hover:text-rose-500',
        fin_dre: 'group-hover:text-blue-500',
        fin_conciliacao: 'group-hover:text-indigo-500',
        fin_carnes: 'group-hover:text-fuchsia-500',
        fin_utilitarios: 'group-hover:text-slate-500',
        boletim: 'group-hover:text-orange-500',
        biblia: 'group-hover:text-amber-600',
        assistente_ai: 'group-hover:text-violet-500',
        email_interno: 'group-hover:text-emerald-500',
        secretaria_integrada: 'group-hover:text-blue-500',
        secretaria_certificados: 'group-hover:text-amber-500',
        carteirinha_studio: 'group-hover:text-pink-500',
        credencial_lote: 'group-hover:text-purple-500',
        secretaria_ebd: 'group-hover:text-emerald-600',
        salinha_kids: 'group-hover:text-rose-450',
        missoes_painel: 'group-hover:text-rose-500',
        rede_social: 'group-hover:text-pink-500',
        relatorios: 'group-hover:text-indigo-500',
        config_backup: 'group-hover:text-emerald-500',
        auditoria: 'group-hover:text-slate-500',
        lixeira: 'group-hover:text-rose-500',
        desenvolvedor: 'group-hover:text-emerald-400',
        config_sistema: 'group-hover:text-indigo-600',
        config_visual: 'group-hover:text-purple-500'
    };

    const MenuItem = ({ id, icon: Icon, label }) => {
        const active = view === id;
        const hoverColor = iconColors[id] || 'group-hover:text-indigo-600';

        const isMary = user?.usuario?.toLowerCase() === 'mary';
        const isAllowedForMary = id === 'suporte_dev' || id === 'changelog' || id === 'sobre';
        const isMaryDisabled = isMary && !isAllowedForMary;

        return (
            <button 
                onClick={() => { 
                    if (isMaryDisabled) {
                        addToast("Acesso inativo para o Assistente Virtual Mary.", "warning");
                        return;
                    }
                    playMenuSound(); // Efeito sonoro no clique
                    setView(id); 
                }} 
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative mb-1.5 overflow-hidden ${active ? 'text-white shadow-xl shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'} ${isMaryDisabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
            >
                {active && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 animate-slide-in z-0"></div>}
                <div className="relative z-10 flex items-center gap-4 w-full">
                    <Icon size={20} className={`transition-transform duration-300 ${active ? 'text-white scale-110' : `${hoverColor} group-hover:scale-110`} ${isMaryDisabled ? 'text-slate-400' : ''}`} />
                    {open && <span className={`font-bold text-sm tracking-wide transition-colors duration-300 ${active ? 'text-white' : ''} ${isMaryDisabled ? 'text-slate-400' : ''}`}>{label}</span>}
                    {isMaryDisabled && open && <Lock size={12} className="text-slate-400 ml-auto shrink-0 animate-pulse" />}
                </div>
            </button>
        );
    };

    const MenuGroup = ({ label }) => {
        if (!open) return <div className="my-4 border-t border-slate-200/60 w-8 mx-auto rounded-full"></div>;
        return (
            <div className="flex items-center gap-3 px-2 mt-8 mb-4">
                <div className="h-[2px] bg-indigo-100 flex-1 rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                <div className="h-[2px] bg-indigo-100 flex-1 rounded-full"></div>
            </div>
        );
    };

    return (
        <aside className={`glass-modern h-screen fixed md:sticky top-0 transition-all duration-500 ease-in-out flex flex-col z-50 border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${open ? 'w-80 translate-x-0' : 'w-0 md:w-28 overflow-hidden border-r-0 md:border-r -translate-x-full md:translate-x-0'}`}>
             <div className={`flex border-b border-white/30 bg-white/20 ${open ? 'p-8 items-center justify-between' : 'py-6 px-4 flex-col items-center gap-6'}`}>
                {open ? (
                    <div className="flex items-center gap-4">
                         {db.igreja.logo ? <CachedImage src={db.igreja.logo} cacheKey="church_main_logo" className="w-12 h-12 object-contain bg-white rounded-xl shadow-md p-1" /> : <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30"><Building2 size={24}/></div>}
                        <div>
                            <h1 className="font-black text-lg tracking-tight text-slate-800 truncate max-w-[160px] leading-tight">{db.igreja.nome || "GIPP"}</h1>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">Plano {db.igreja?.plano || 'Avançado'}</p>
                        </div>
                    </div>
                ) : (db.igreja.logo ? <CachedImage src={db.igreja.logo} cacheKey="church_main_logo" className="w-10 h-10 mx-auto object-contain bg-white rounded-xl shadow-sm" /> : <div className="mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl text-white shadow-md"><Building2 size={28}/></div>)}
                <button onClick={() => setOpen(!open)} className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors shrink-0">
                    {open ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar pb-10">
                
                <div>
                    <MenuGroup label="Principal" />
                    {checkPlan('dashboard') && <MenuItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />}
                    {checkPlan('manual') && <MenuItem id="manual" icon={BookOpen} label="Manual do Usuário" />}
                    {checkPlan('changelog') && <MenuItem id="changelog" icon={History} label="Atualizações" />}
                    {checkPlan('sobre') && <MenuItem id="sobre" icon={Info} label="Sobre o Sistema" />}
                </div>

                {(hasPermission('master') || hasPermission('access_membros') || hasPermission('access_visitantes') || hasPermission('access_igreja') || hasPermission('access_patrimonio') || hasPermission('access_celulas')) && (
                    <div>
                        <MenuGroup label="Administrativo" />
                        {hasPermission('access_membros') && checkPlan('cad_membro') && <MenuItem id="cad_membro" icon={Users} label="Membros (Rol)" />}
                        {hasPermission('access_visitantes') && checkPlan('visitantes') && <MenuItem id="visitantes" icon={HeartHandshake} label="Visitantes & CRM" />}
                        {hasPermission('access_igreja') && checkPlan('cad_igreja') && <MenuItem id="cad_igreja" icon={Building2} label="Igreja Sede & Filiais" />}
                        {hasPermission('access_patrimonio') && checkPlan('cad_patrimonio') && <MenuItem id="cad_patrimonio" icon={Package} label="Patrimônio Total" />}
                        {hasPermission('access_celulas') && checkPlan('cad_celula') && <MenuItem id="cad_celula" icon={Share2} label="Células e Grupos" />}
                        {hasPermission('master') && checkPlan('cad_usuario') && <MenuItem id="cad_usuario" icon={Shield} label="Usuários e Níveis" />}
                        {hasPermission('access_membros') && checkPlan('acessos_portal') && <MenuItem id="acessos_portal" icon={Key} label="Acessos do Portal" />}
                        {hasPermission('access_ministerios') && checkPlan('cad_departamento') && <MenuItem id="cad_departamento" icon={Briefcase} label="Ministérios (Deptos)" />}
                    </div>
                )}

                {(hasPermission('access_fin_entradas') || hasPermission('access_fin_analise') || hasPermission('access_fin_cadastros')) && (
                    <div>
                        <MenuGroup label="Financeiro" />
                        {hasPermission('access_fin_entradas') && checkPlan('fin_entrada') && <MenuItem id="fin_entrada" icon={ArrowUpCircle} label="Receitas (Entradas)" />}
                        {hasPermission('access_fin_saidas') && checkPlan('fin_saida') && <MenuItem id="fin_saida" icon={ArrowDownCircle} label="Despesas (Saídas)" />}
                        {hasPermission('access_fin_analise') && checkPlan('fin_dre') && <MenuItem id="fin_dre" icon={Activity} label="DRE & Balanço" />}
                        {hasPermission('access_fin_analise') && checkPlan('fin_conciliacao') && <MenuItem id="fin_conciliacao" icon={FileCheck} label="Bank. Conciliação" />}
                        {hasPermission('access_fin_carnes') && checkPlan('fin_carnes') && <MenuItem id="fin_carnes" icon={CreditCard} label="Carnês & Campanhas" />}
                        {hasPermission('access_fin_cadastros') && checkPlan('fin_utilitarios') && <MenuItem id="fin_utilitarios" icon={Settings} label="Utilitários (Bases)" />}
                    </div>
                )}

                <div>
                    <MenuGroup label="Secretaria Eclesiástica" />
                    {hasPermission('access_boletim') && checkPlan('boletim') && <MenuItem id="boletim" icon={Newspaper} label="Boletim Digital" />}
                    {checkPlan('biblia') && <MenuItem id="biblia" icon={Book} label="Bíblia de Estudo" />}
                    {hasPermission('access_ia') && checkPlan('assistente_ai') && <MenuItem id="assistente_ai" icon={Sparkles} label="Pastoral IA" />}
                    {hasPermission('access_email') && checkPlan('email_interno') && <MenuItem id="email_interno" icon={Mail} label="Webmail Direto" />}
                    {hasPermission('access_sec_agenda') && checkPlan('secretaria_integrada') && <MenuItem id="secretaria_integrada" icon={ClipboardList} label="Secretaria & Tarefas" />}
                    {hasPermission('access_sec_certificados') && checkPlan('secretaria_certificados') && <MenuItem id="secretaria_certificados" icon={Award} label="Certificados" />}
                    {hasPermission('access_sec_certificados') && checkPlan('carteirinha_studio') && <MenuItem id="carteirinha_studio" icon={IdCard} label="Estúdio Carteirinhas" />}
                    {hasPermission('access_sec_certificados') && checkPlan('credencial_lote') && <MenuItem id="credencial_lote" icon={Badge} label="Credencial Lote" />}
                    {hasPermission('access_ebd') && checkPlan('secretaria_ebd') && <MenuItem id="secretaria_ebd" icon={GraduationCap} label="Gestão EBD" />}
                    {hasPermission('access_salinha_kids') && checkPlan('salinha_kids') && <MenuItem id="salinha_kids" icon={Baby} label="Salinha Kids" />}
                    {hasPermission('access_gestao_cursos') && checkPlan('gestao_cursos') && <MenuItem id="gestao_cursos" icon={GraduationCap} label="EAD Cursos de Capacitação" />}
                    {hasPermission('access_missoes') && checkPlan('missoes_painel') && <MenuItem id="missoes_painel" icon={Globe} label="Depto. de Missões" />}
                    {hasPermission('access_midia') && checkPlan('rede_social') && <MenuItem id="rede_social" icon={ImagePlus} label="Estúdio de Artes" />}
                    {hasPermission('access_sec_relatorios') && checkPlan('relatorios') && <MenuItem id="relatorios" icon={FileText} label="Relatórios PDF" />}
                </div>

                {(hasPermission('master') || user?.nivel === 'pastor' || user?.cargo?.toLowerCase().includes('pastor') || user?.funcao?.toLowerCase().includes('pastor')) && (
                    <div>
                        <MenuGroup label="Área Pastoral" />
                        <MenuItem id="portal_pastor" icon={BookOpenText} label="Portal do Pastor" />
                    </div>
                )}

                {(hasPermission('master') || hasPermission('access_config_sistema') || hasPermission('access_config_visual') || hasPermission('access_config_backup') || hasPermission('access_auditoria') || hasPermission('access_lixeira')) && (
                    <div>
                        <MenuGroup label="Sistema Avançado" />
                        {hasPermission('access_config_sistema') && checkPlan('config_sistema') && <MenuItem id="config_sistema" icon={Settings} label="Configurações do Sistema" />}
                        {hasPermission('access_config_visual') && checkPlan('config_visual') && <MenuItem id="config_visual" icon={Palette} label="Personalização Visual" />}
                        {hasPermission('access_config_backup') && checkPlan('config_backup') && <MenuItem id="config_backup" icon={Database} label="Backup Geral" />}
                        {hasPermission('access_auditoria') && checkPlan('auditoria') && <MenuItem id="auditoria" icon={ShieldCheck} label="Auditoria & Logs" />}
                        {hasPermission('access_lixeira') && checkPlan('lixeira') && <MenuItem id="lixeira" icon={Trash2} label="Lixeira Virtual" />}
                    </div>
                )}

                {/* Exclusivo para o Desenvolvedor (Master Owner) e Assistente Virtual Mary */}
                {(user?.id === 'dev' || user?.usuario?.toLowerCase() === 'mary') && (
                    <div>
                        <MenuGroup label="Desenvolvedor & Suporte" />
                        {user?.id === 'dev' && <MenuItem id="desenvolvedor" icon={Code} label="Painel Master SaaS" />}
                        <MenuItem id="suporte_dev" icon={Headset} label="Op. de Suporte" />
                    </div>
                )}
            </div>

             <div className="p-6 border-t border-white/30 bg-white/40 backdrop-blur-md shrink-0">
                <div className={`flex items-center gap-4 p-3 rounded-2xl bg-white/60 shadow-sm border border-white/50 ${!open && 'justify-center'}`}>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">{safeText(user.nome).charAt(0)}</div>
                    {open && <div className="overflow-hidden flex-1"><p className="text-sm font-bold text-slate-800 truncate">{safeText(user.nome).split(' ')[0]}</p><p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Sessão Ativa</p></div>}
                </div>
                <button onClick={() => { playMenuSound(); handleLogoutRequest(); }} className={`mt-4 w-full flex items-center gap-3 p-3 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white font-bold transition-all shadow-sm border border-transparent hover:border-rose-400 hover:shadow-rose-500/30 ${!open && 'justify-center'}`}>
                    <LogOut size={20}/>{open && <span>Encerrar Sessão</span>}
                </button>
            </div>
        </aside>
    );
};

// --- FULLSCREEN TOGGLE ---
const FullScreenToggle = ({ variant = 'default', className = "" }) => {
    const { addToast } = useContext(ChurchContext) || {};
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(
                document.fullscreenElement || 
                (document as any).webkitFullscreenElement || 
                (document as any).mozFullScreenElement || 
                (document as any).msFullscreenElement
            ));
        };

        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        events.forEach(evt => document.addEventListener(evt, handleFullscreenChange));
        
        return () => {
            events.forEach(evt => document.removeEventListener(evt, handleFullscreenChange));
        };
    }, []);

    const toggleFullScreen = () => {
        try {
            const doc = window.document;
            const docEl = doc.documentElement as any;

            const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
            const cancelFullScreen = doc.exitFullscreen || (doc as any).webkitExitFullscreen || (doc as any).mozCancelFullScreen || (doc as any).msExitFullscreen;

            if (!doc.fullscreenElement && !(doc as any).webkitFullscreenElement && !(doc as any).mozFullScreenElement && !(doc as any).msFullscreenElement) {
                if (requestFullScreen) {
                    const promise = requestFullScreen.call(docEl);
                    if (promise) {
                        promise.catch(err => {
                            console.warn("Erro ao ativar tela cheia:", err);
                            if (addToast) addToast("Modo Tela Cheia bloqueado pelo ambiente atual.", "warning");
                        });
                    }
                }
            } else {
                if (cancelFullScreen) {
                    cancelFullScreen.call(doc);
                }
            }
        } catch (err) {
            console.warn("Erro síncrono na tela cheia:", err);
            if (addToast) addToast("Modo Tela Cheia indisponível neste dispositivo/ambiente.", "warning");
        }
    };

    let btnClass = "";
    let iconSize = 20;
    
    if (variant === 'dark') {
        btnClass = `p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:bg-white/20 transition-all text-white ${className}`;
    } else if (variant === 'mobile') {
        btnClass = `p-2 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors ${className}`;
        iconSize = 18;
    } else {
        btnClass = `p-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all text-slate-600 hover:text-indigo-600 ${className}`;
    }

    return (
        <button type="button" onClick={toggleFullScreen} className={btnClass} title={isFullscreen ? "Sair do Ecrã Inteiro" : "Ecrã Inteiro"}>
            {isFullscreen ? <Minimize size={iconSize} /> : <Maximize size={iconSize} />}
        </button>
    );
};

// --- THEME TOGGLE ---
const ThemeToggle = ({ variant = 'default', className = "" }) => {
    const { theme, toggleTheme } = useContext(ChurchContext);
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
        <button type="button" onClick={toggleTheme} className={btnClass} title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}>
            {theme === 'dark' ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
        </button>
    );
};

// --- CENTRAL DE NOTIFICAÇÕES INTELIGENTE ---
// Contém o sub-componente de histórico e o de preferências de canais (Escalas, Kids, Financeiro)
const NotificationCenter = () => {
    const { notifications, clearAllNotifications, user, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Preferências de push salvas no localStorage e vinculadas ao membro
    const [pushPrefs, setPushPrefs] = useState({
        escalas: localStorage.getItem('gipp_push_pref_escalas') !== 'false',
        kids: localStorage.getItem('gipp_push_pref_kids') !== 'false',
        financeiro: localStorage.getItem('gipp_push_pref_financeiro') !== 'false'
    });

    const handleTogglePref = async (key: 'escalas' | 'kids' | 'financeiro') => {
        const newVal = !pushPrefs[key];
        const updatedPrefs = { ...pushPrefs, [key]: newVal };
        setPushPrefs(updatedPrefs);
        localStorage.setItem(`gipp_push_pref_${key}`, newVal ? 'true' : 'false');
        
        addToast(`Canal de push "${key.toUpperCase()}" ${newVal ? 'ativado' : 'desativado'} com sucesso!`, 'info');
        
        // Se houver membro logado, sincroniza com o Firestore
        if (user) {
            try {
                const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id);
                await setDoc(docRef, {
                    [`push_pref_${key}`]: newVal
                }, { merge: true });
            } catch (err) {
                console.warn("[Sync Push Prefs failed]", err);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative pointer-events-auto" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all group"
            >
                <Bell size={24} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 glass-panel rounded-3xl shadow-2xl border border-white/60 overflow-hidden z-[100] animate-scale-in origin-top-right">
                    {/* Header com Abas em visual Premium */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-200/50 flex flex-col gap-3 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Bell size={18} className="text-indigo-600"/> Notificações
                            </h3>
                            {notifications.length > 0 && activeTab === 'alerts' && (
                                <button 
                                    onClick={() => {
                                        clearAllNotifications(notifications.map(n => n.id));
                                        playMenuSound();
                                    }}
                                    className="text-[10px] font-black tracking-wider uppercase text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-105/40 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <Trash2 size={10} /> Limpar
                                </button>
                            )}
                        </div>
                        
                        {/* Selector de Abas */}
                        <div className="grid grid-cols-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/30">
                            <button 
                                onClick={() => setActiveTab('alerts')} 
                                className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'alerts' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <History size={12} /> Histórico ({notifications.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('settings')} 
                                className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'settings' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Settings size={12} /> Canais Push
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white/45">
                        {activeTab === 'alerts' ? (
                            notifications.length === 0 ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center text-slate-400">
                                    <CheckCircle size={40} className="mb-3 text-emerald-300 opacity-50"/>
                                    <p className="font-bold text-slate-600">Histórico Vazio!</p>
                                    <p className="text-xs mt-1">Nenhum evento recente pendente.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100/50">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 hover:bg-white/60 transition-colors flex gap-4 items-start group cursor-default">
                                            <div className={`p-2.5 rounded-xl bg-${notif.color || 'indigo'}-50 text-${notif.color || 'indigo'}-500 shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-${notif.color || 'indigo'}-100`}>
                                                {isValidElement(notif.icon) ? notif.icon : (React.createElement(notif.icon || Bell, { size: 20 }))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{notif.title}</h4>
                                                    <span className={`text-[9px] font-black uppercase whitespace-nowrap bg-${notif.color || 'indigo'}-100 text-${notif.color || 'indigo'}-700 px-1.5 py-0.5 rounded`}>
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-snug">{notif.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* Painel de Configuração de Preferências por Canale de Push */
                            <div className="p-5 space-y-4">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Desative canais específicos para filtrar suas notificações na barra do sistema:</p>
                                
                                <div className="space-y-3">
                                    {/* Canal Escalas */}
                                    <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 flex justify-between items-center transition-all">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">🔔 Escalas de Voluntários</span>
                                            <span className="text-[9px] text-slate-400 font-semibold block">Avisos de novas escalas e convocações</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={pushPrefs.escalas} 
                                                onChange={() => handleTogglePref('escalas')}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 h-5 w-9"></div>
                                        </label>
                                    </div>

                                    {/* Canal Kids */}
                                    <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 flex justify-between items-center transition-all">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">👶 Ministério Kids</span>
                                            <span className="text-[9px] text-slate-400 font-semibold block">Ocorrências, chamadas e avisos de crianças</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={pushPrefs.kids} 
                                                onChange={() => handleTogglePref('kids')}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 h-5 w-9"></div>
                                        </label>
                                    </div>

                                    {/* Canal Financeiro */}
                                    <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 flex justify-between items-center transition-all">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">💰 Financeiro & Dízimos</span>
                                            <span className="text-[9px] text-slate-400 font-semibold block">Lembretes de carnês, dízimos e doações</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={pushPrefs.financeiro} 
                                                onChange={() => handleTogglePref('financeiro')}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 h-5 w-9"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const PortalPerfil = ({ user, db, setView }) => {
    const { setDoc, doc, dbFirestore, appId, addToast, logAction } = useContext(ChurchContext);
    const [formData, setFormData] = useState({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        dataNascimento: user.dataNascimento || '',
        senha_portal: user.senha_portal || user.senha || '123',
        notify_escala: user.notify_escala !== false,
        notify_agenda: user.notify_agenda !== false,
        notify_eventos: user.notify_eventos !== false
    });
    const [saving, setSaving] = useState(false);

    const handleTestNotification = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            addToast("As notificações nativas não são suportadas neste navegador.", "warning");
            return;
        }
        
        let permission = Notification.permission;
        if (permission !== 'granted') {
            addToast("Para receber o teste, por favor autorize a permissão no navegador.", "info");
            permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
            addToast("🔔 Disparando teste de Notificação Local & segundo plano! Verifique sua barra de status.", "success");
            playNotificationSound();
            
            // Tenta disparar via Service Worker registrado (segundo plano nativo)
            if ('serviceWorker' in navigator) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    reg.showNotification("🔔 Teste Push Conectado!", {
                        body: "Este é um teste oficial de alertas em tempo real do GIPP. Se você está vendo isso, o seu smartphone/computador está pronto!",
                        icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                        badge: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                        vibrate: [200, 100, 200],
                        data: { url: "/#portal_more" }
                    } as any);
                } catch (swErr) {
                    new Notification("🔔 Teste Alerta GIPP", {
                        body: "Seu navegador está configurado para receber notificações nos portais do GIPP!",
                        icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                    });
                }
            } else {
                new Notification("🔔 Teste Alerta GIPP", {
                    body: "Seu navegador está configurado para receber notificações nos portais do GIPP!",
                    icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"
                });
            }
        } else {
            addToast("As notificações foram bloqueadas/negadas. Por favor reative-as nas configurações do site no seu navegador.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id);
            await setDoc(userRef, {
                ...formData
            }, { merge: true });
            
            logAction('EDIÇÃO', `Membro atualizou seus dados cadastrais e preferências de notificação push`, 'membros', user.id);
            addToast("Perfil e preferências de notificação atualizados com sucesso!", "success");
            setView('portal_home');
        } catch (error) {
            console.error(error);
            addToast("Erro ao salvar alterações no perfil.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-entrance pb-10">
            {/* Header consolidado com visual robusto */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-xs">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <UserCheck size={28} className="text-emerald-500" />
                        Perfil do Membro
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Gerencie suas credenciais de segurança e atualize suas informações cadastrais em tempo real.</p>
                </div>
                <button onClick={() => setView('portal_home')} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
                    <ChevronLeft size={16} /> Voltar ao Painel
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Painel Esquerdo (Dados de Resumo & Visuals) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none"></div>
                    
                    <div className="w-full relative z-10 text-center space-y-6 flex-1 flex flex-col justify-center">
                        <div className="relative inline-block mx-auto">
                            <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl mx-auto border-8 border-slate-100 shadow-xl transition-transform duration-500 group-hover:scale-105">
                                {formData.nome ? formData.nome.charAt(0) : '?'}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-white w-7 h-7 rounded-full flex items-center justify-center text-white" title="Status Online">
                                <span className="w-2.5 h-2.5 bg-emerald-200 rounded-full animate-ping"></span>
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-black text-slate-800 truncate px-2">{formData.nome || 'Membro do Sistema'}</h3>
                            <p className="text-[10px] text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider inline-block mt-2 border border-indigo-100 shadow-2xs">
                                {user.funcao_administrativa && user.funcao_administrativa !== 'NENHUMA' ? user.funcao_administrativa : (user.cargo || 'Membro Oficial')}
                            </p>
                        </div>

                        {/* Metadados do Sistema para preencher a tela */}
                        <div className="space-y-3 pt-6 border-t border-slate-150 w-full text-left">
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">Congregação:</span>
                                <span className="font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md uppercase text-[10px]">
                                    {user.congregacao_id === 'sede' || !user.congregacao_id ? 'Tempo Sede' : 'Filial Registrada'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">Admissão:</span>
                                <span className="font-extrabold text-slate-600">
                                    {user.dataAdmissao ? formatDateLocal(user.dataAdmissao) : 'Não Informada'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-slate-400">ID Eletrônico:</span>
                                <span className="font-mono text-slate-400 text-[10px] truncate max-w-[140px]">{user.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full pt-6 border-t border-slate-100 relative z-10 text-center">
                        <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
                            As atualizações de dados sensíveis devem ser protocoladas diretamente perante a secretaria administrativa de sua congregação.
                        </p>
                    </div>
                </div>

                {/* Painel Direito (Formulário Otimizado e Expandido) */}
                <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-extrabold text-slate-800">Ficha Informativa & Credenciais</h3>
                            <p className="text-xs text-slate-400 font-medium">Os campos abaixo refletem sua identificação oficial sincronizada em nuvem.</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.nome} 
                                            onChange={e=>setFormData({...formData, nome: (e.target.value || "").toUpperCase()})} 
                                            required 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 uppercase shadow-inner" 
                                        />
                                        <User size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={e=>setFormData({...formData, email: e.target.value})} 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Mail size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telemóvel / Celular</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.telefone} 
                                            onChange={e=>setFormData({...formData, telefone: (e.target.value || "").toUpperCase()})} 
                                            placeholder="(11) 98765-4321" 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 uppercase shadow-inner" 
                                        />
                                        <Phone size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            value={formData.dataNascimento} 
                                            onChange={e=>setFormData({...formData, dataNascimento: e.target.value})} 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Calendar size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nova Senha do Portal</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={formData.senha_portal} 
                                            onChange={e=>setFormData({...formData, senha_portal: e.target.value})} 
                                            required 
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 outline-none text-xs font-black bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all text-slate-800 shadow-inner" 
                                        />
                                        <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 pt-6">
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-800">Preferências de Notificações Push (FCM)</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Selecione quais alertas instantâneos deseja que cheguem a seu smartphone</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Minhas Escalas</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Escalas de voluntariado</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_escala} 
                                            onChange={e => setFormData({ ...formData, notify_escala: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>

                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Agenda Oficial</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Estudos & cultos</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_agenda} 
                                            onChange={e => setFormData({ ...formData, notify_agenda: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>

                                    <label className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none">
                                        <div>
                                            <span className="text-xs font-black text-slate-700 block">Eventos da Igreja</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Festas e conferências</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.notify_eventos} 
                                            onChange={e => setFormData({ ...formData, notify_eventos: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded"
                                        />
                                    </label>
                                </div>

                                {/* Botão de Teste de Notificação Local / PWA */}
                                <div className="p-5 mt-4 bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-100 rounded-2xl">
                                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                        <Smartphone size={14} className="text-emerald-600 animate-pulse" />
                                        Teste de Conectividade Push
                                    </h4>
                                    <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                                        Verifique instantaneamente se seu dispositivo (Android, iOS ou Windows) e o navegador atual estão configurados para exibir as notificações reais da congregação.
                                    </p>
                                    <div className="mt-3.5 flex flex-wrap gap-3 items-center">
                                        <button 
                                            type="button" 
                                            onClick={handleTestNotification}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-transform flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <Bell size={12} /> Testar Notificações
                                        </button>
                                        <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                            Status: {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission.toUpperCase() : 'NÃO SUPORTADO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={()=>setView('portal_home')} className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'A Processar...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PORTAL DO MEMBRO (AUTOATENDIMENTO) ---
const PortalHome = ({ user, db, setView }) => {
    const { notifications, clearAllNotifications } = useContext(ChurchContext);
    const hojeObj = new Date();
    const hoje = hojeObj.toISOString().split('T')[0];
    const currentMonthStr = hojeObj.toISOString().slice(0, 7);
    const currentUser = db.membros.find((m: any) => m.id === user.id) || user;
    
    const [devocional, setDevocional] = useState('');
    const [loadingDev, setLoadingDev] = useState(false);

    const horaAtual = hojeObj.getHours();
    let saudacaoTempo = "Boa noite";
    if (horaAtual >= 5 && horaAtual < 12) saudacaoTempo = "Bom dia";
    else if (horaAtual >= 12 && horaAtual < 18) saudacaoTempo = "Boa tarde";

    const gerarDevocional = async () => {
        setLoadingDev(true);
        const prompt = `Escreva um devocional cristão curto, inspirador e edificante (máximo 2 parágrafos pequenos) focado em encorajamento e fé. Comece por saudar a pessoa pelo nome: ${currentUser.nome.split(' ')[0]}. Inclua apenas 1 versículo bíblico no texto. Não use introduções, vá direto à mensagem. Retorne bem formatado.`;
        const result = await callGeminiAI(prompt);
        setDevocional(result);
        setLoadingDev(false);
    };

    const inboxItems = [];

    const minhasTarefas = (db.tarefas || []).filter(t => 
        t.status !== 'Concluido' && (t.equipe || []).some(m => m.id === currentUser.id || m.nome === currentUser.nome)
    );
    minhasTarefas.forEach(t => {
        inboxItems.push({
            id: `task_${t.id}`,
            sender: 'Departamento de Escalas',
            subject: `Convocação: ${t.descricao}`,
            date: t.data || hoje,
            icon: CheckSquare,
            bg: 'bg-indigo-100',
            text: 'text-indigo-600',
            isNew: true,
            action: () => setView('portal_tarefas')
        });
    });

    const limiteAgenda = new Date();
    limiteAgenda.setDate(limiteAgenda.getDate() + 7);
    const limiteStr = limiteAgenda.toISOString().split('T')[0];
    
    const proximosEventos = (db.agenda || []).filter(e => e.data >= hoje && e.data <= limiteStr).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    proximosEventos.forEach(e => {
         inboxItems.push({
            id: `evt_${e.id}`,
            sender: 'Comunicação Geral',
            subject: `Agenda: ${e.titulo} em breve!`,
            date: e.data,
            icon: Calendar,
            bg: 'bg-emerald-100',
            text: 'text-emerald-600',
            isNew: e.data === hoje, 
            action: () => setView('portal_agenda')
         });
    });

    const minhaMatricula = db.ebd?.alunos?.find(a => a.membro_id === currentUser.id || a.nome === currentUser.nome);
    if (minhaMatricula) {
        const turma = db.ebd?.turmas?.find(t => t.id === minhaMatricula.turma_id);
        inboxItems.push({
            id: 'ebd_notice',
            sender: 'Escola Dominical (EBD)',
            subject: `Lembrete de aula: Turma ${turma ? turma.nome : 'Ativa'}`,
            date: hoje,
            icon: BookOpen,
            bg: 'bg-blue-100',
            text: 'text-blue-600',
            isNew: false,
            action: () => setView('portal_ebd')
        });
    }

    if (notifications && notifications.length > 0) {
        notifications.forEach((notif: any) => {
            const alreadyExists = inboxItems.some(item => item.id === notif.id);
            if (!alreadyExists) {
                inboxItems.push({
                    id: notif.id,
                    sender: 'Notificação do Sistema',
                    subject: `${notif.title}: ${notif.desc}`,
                    date: hoje,
                    icon: notif.icon || Bell,
                    bg: notif.color === 'rose' ? 'bg-rose-100' : notif.color === 'amber' ? 'bg-amber-100' : 'bg-indigo-100',
                    text: notif.color === 'rose' ? 'text-rose-600' : notif.color === 'amber' ? 'text-amber-600' : 'text-indigo-600',
                    isNew: true,
                    action: () => {
                        if (notif.id.startsWith('tar_')) {
                            setView('portal_tarefas');
                        } else if (notif.id.startsWith('aniv_')) {
                            setView('portal_mural');
                        }
                    }
                });
            }
        });
    }

    inboxItems.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // --- LÓGICA DE GAMIFICAÇÃO (MEDALHAS E CONQUISTAS) ---
    // Agora avaliada MENSALMENTE
    const badges = useMemo(() => {
        const unlocked = [];

        // 1. Semeador (Dízimos e Ofertas) - Mensal
        const dizimos = (db.financeiro || []).filter(f => f.membro_id === currentUser.id && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(currentMonthStr));
        if (dizimos.length > 0) unlocked.push('dizimista');

        // 2. Servo Ativo (Tarefas Concluídas) - Mensal
        const tarefasConcluidas = (db.tarefas || []).filter(t => t.status === 'Concluido' && (t.data || '').startsWith(currentMonthStr) && (t.equipe || []).some(m => m.id === currentUser.id || m.nome === currentUser.nome));
        if (tarefasConcluidas.length > 0) unlocked.push('servo');

        // 3. Estudo da EBD - Mensal
        const isEbd = (currentUser.estudos_ebd_concluidos || []).some(e => e.mes === currentMonthStr);
        if (isEbd) unlocked.push('ebd');

        // 4. Coração Missionário - Mensal
        const isMissao = (db.carnes || []).some(c => c.membro_id === currentUser.id && c.titulo.toLowerCase().includes('miss') && (c.parcelas || []).some(p => p.status === 'pago' && (p.data_pagamento || '').startsWith(currentMonthStr))) || 
                         (db.financeiro || []).some(f => f.membro_id === currentUser.id && f.categoria === 'Missões' && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(currentMonthStr));
        if (isMissao) unlocked.push('missao');
        
        // 5. Comunhão Ativa - Mensal
        const isMural = (db.mural || []).some(m => m.autor_id === currentUser.id && (m.data || '').startsWith(currentMonthStr));
        if (isMural) unlocked.push('comunhao');

        return unlocked;
    }, [db, currentUser, currentMonthStr]);

    const BADGE_DEFS = [
        { id: 'ebd', title: 'Estudo EBD', desc: 'Concluiu lição no mês', icon: BookOpenText, textColor: 'text-blue-700', grad: 'from-blue-400 via-blue-500 to-blue-700', glow: 'bg-blue-400' },
        { id: 'servo', title: 'Servo Ativo', desc: 'Escalas do mês', icon: ShieldCheck, textColor: 'text-emerald-700', grad: 'from-emerald-400 via-emerald-500 to-emerald-700', glow: 'bg-emerald-400' },
        { id: 'dizimista', title: 'Semeador', desc: 'Fidelidade do mês', icon: Award, textColor: 'text-amber-700', grad: 'from-amber-300 via-yellow-500 to-orange-600', glow: 'bg-amber-400' },
        { id: 'missao', title: 'Missionário', desc: 'Apoio neste mês', icon: Globe, textColor: 'text-rose-700', grad: 'from-rose-400 via-rose-500 to-rose-700', glow: 'bg-rose-400' },
        { id: 'comunhao', title: 'Comunhão', desc: 'Mural do mês', icon: HeartHandshake, textColor: 'text-fuchsia-700', grad: 'from-fuchsia-400 via-fuchsia-500 to-purple-700', glow: 'bg-fuchsia-400' }
    ];

    const CURSOS_DISPONIVEIS = IMPORTED_CURSOS_DISPONIVEIS;

    const getCourseProgress = (cursoId, modulosConcluidos) => {
        if (!modulosConcluidos || !modulosConcluidos.length) return 0;
        let pfx = '';
        if (cursoId === 'fundamentos_pentecostais') pfx = 'm';
        else if (cursoId === 'teologia_avancada') pfx = 'adv_m';
        else if (cursoId === 'obreiro_de_valor') pfx = 'obr_m';
        else if (cursoId === 'historia_igreja') pfx = 'hist_m';
        else if (cursoId === 'conhecendo_doutrinas') pfx = 'dout_m';
        else if (cursoId === 'jesus_cristo') pfx = 'jc_m';
        else if (cursoId === 'manual_biblico_macarthur') pfx = 'mb_m';
        else if (cursoId === 'licoes_biblicas_defesa_fe') pfx = 'df_m';

        let completed = 0;
        for (let i = 1; i <= 10; i++) {
            if (modulosConcluidos.includes(`${pfx}${i}`)) {
                completed++;
            }
        }
        return Math.round((completed / 10) * 100);
    };

    const unlockedCount = badges.length;
    const cursosConcluidosMes = (currentUser.cursos_concluidos || []).filter(c => c.mes === currentMonthStr);
    const unlockedCursosCount = cursosConcluidosMes.length;
    const totalBadgesCount = BADGE_DEFS.length + CURSOS_DISPONIVEIS.length;

    const totalCursosModules = CURSOS_DISPONIVEIS.reduce((sum, curso: any) => sum + (curso.modulesCount || 10), 0); // Assuming 10 modules per course if not specified
    const modulosConcluidosSoma = (currentUser.modulos_concluidos || []).length;
    
    // Atualização da lógica de nível espiritual incluindo andamento dos cursos
    const nivelSpiritual = totalBadgesCount > 0 
        ? Math.round((((unlockedCount / totalBadgesCount) * 100) + ((modulosConcluidosSoma / totalCursosModules) * 100)) / 2) || Math.round((unlockedCount / totalBadgesCount) * 100) 
        : 0;
        
    const nivelRotulo = (unlockedCount + unlockedCursosCount) === totalBadgesCount + 5 ? "Obreiro Aprovado" : (unlockedCount + unlockedCursosCount) >= 4 ? "Servo Dedicado" : (unlockedCount + unlockedCursosCount) >= 1 ? "Membro Ativo" : "Novo Integrante";

    return (
        <div className="space-y-6 animate-entrance pb-12">
            
            {/* NOVO HERO COM STATUS DO PERFIL */}
            <div className="rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row items-center p-8 md:p-10 gap-8 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none transition-all duration-1000 group-hover:opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                
                <div className="relative z-10 shrink-0">
                    <div className="w-32 h-32 rounded-full border-[6px] border-slate-800 overflow-hidden bg-slate-800 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] relative group/foto">
                        {currentUser.foto ? <CachedImage src={currentUser.foto} cacheKey={`user_${currentUser.id || 'current'}_foto`} className="w-full h-full object-cover"/> : <User size={48} className="text-slate-500"/>}
                        <button onClick={() => setView('portal_perfil')} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white mb-1"/>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Atualizar</span>
                        </button>
                    </div>
                </div>
                
                <div className="relative z-10 flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3 justify-center md:justify-start">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-emerald-500/20 shadow-sm w-fit mx-auto md:mx-0">
                            {currentUser.cargo || 'Membro Ativo'}
                        </span>
                        {currentUser.funcao_administrativa && currentUser.funcao_administrativa !== 'NENHUMA' && (
                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-indigo-500/20 shadow-sm w-fit mx-auto md:mx-0">
                                ADM: {currentUser.funcao_administrativa}
                            </span>
                        )}
                        <span className="text-xs text-slate-400 font-bold hidden md:inline-block">•</span>
                        <span className="text-xs font-bold text-slate-400 flex items-center justify-center md:justify-start gap-1">
                            <MapPin size={12}/> {db.igreja.nome}
                        </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                        {saudacaoTempo},<br/>{currentUser.nome.split(' ')[0]}!
                    </h2>
                    
                    {/* BARRA DE NÍVEL DE ENGAJAMENTO GLOBAL (DESIGN PREMIUM) */}
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md max-w-lg mx-auto md:mx-0 shadow-inner">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1"><Activity size={12}/> Jornada de Fé do Mês</span>
                                <span className="text-sm font-black text-white">{nivelRotulo}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-black text-emerald-400">{nivelSpiritual}%</span>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-700">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 relative" style={{width: `${nivelSpiritual}%`}}>
                                <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ animation: 'slideRight 2s infinite linear' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES RÁPIDAS (NOVO LAYOUT ESTILO FINTECH) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setView('portal_financas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col items-start group">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm transform group-hover:-rotate-6"><DollarSign size={24}/></div>
                    <span className="font-black text-slate-800 text-base mb-1">Dízimos</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ofertar agora</span>
                </button>
                <button onClick={() => setView('portal_carteirinha')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col items-start group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm transform group-hover:scale-110"><QrCode size={24}/></div>
                    <span className="font-black text-slate-800 text-base mb-1">Credencial</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cartão Digital</span>
                </button>
                <button onClick={() => setView('portal_tarefas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col items-start group">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm transform group-hover:rotate-6"><CheckSquare size={24}/></div>
                    <span className="font-black text-slate-800 text-base mb-1">Escalas</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minhas tarefas</span>
                </button>
                <button onClick={() => setView('portal_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-start group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpenText size={24}/></div>
                    <span className="font-black text-slate-800 text-base mb-1">Estudo EBD</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lições Interativas</span>
                </button>
            </div>

            {/* --- SECÇÃO DE GAMIFICAÇÃO (CONQUISTAS 3D) --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 relative z-10">
                    <div>
                        <h3 className="font-black text-slate-800 text-2xl flex items-center gap-2">
                            <Award size={28} className="text-amber-500 drop-shadow-md"/> Galeria de Conquistas do Mês
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">O seu envolvimento ministerial e acadêmico é reconhecido mensalmente.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-black bg-slate-900 text-emerald-400 px-4 py-2 rounded-full tracking-widest uppercase shadow-md w-fit">
                            {unlockedCount} / {BADGE_DEFS.length} Atividades
                        </span>
                        <span className="text-[10px] font-black bg-slate-900 text-amber-400 px-4 py-2 rounded-full tracking-widest uppercase shadow-md w-fit">
                            {unlockedCursosCount} / {CURSOS_DISPONIVEIS.length} Cursos
                        </span>
                    </div>
                </div>
                
                {/* SESSÃO 1: ATIVIDADES MINISTERIAIS */}
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 relative z-10">1. Atividades Ministeriais</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 relative z-10 mb-10">
                    {BADGE_DEFS.map(b => {
                        const isUnlocked = badges.includes(b.id);
                        return (
                            <div key={b.id} className="relative group perspective-[1000px] cursor-default">
                                <div className={`relative flex flex-col items-center justify-center p-5 rounded-3xl border border-white shadow-xl transition-all duration-500 transform ${isUnlocked ? 'bg-white hover:-translate-y-2 hover:rotate-2' : 'bg-slate-50 opacity-80 grayscale'}`}>
                                    {isUnlocked && <div className={`absolute inset-0 rounded-3xl opacity-10 blur-xl bg-gradient-to-br ${b.grad}`}></div>}
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 relative transition-transform duration-500 ${isUnlocked ? `bg-gradient-to-br ${b.grad} shadow-[inset_0_-6px_12px_rgba(0,0,0,0.3),_0_12px_20px_-5px_rgba(0,0,0,0.3)] group-hover:scale-110` : 'bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)]'}`}>
                                        <div className="absolute top-1 left-2 w-4 h-3 sm:w-6 sm:h-5 bg-white/50 rounded-full blur-[2px] transform -rotate-45"></div>
                                        <div className={`absolute inset-[3px] rounded-full border-[2px] sm:border-[3px] ${isUnlocked ? 'border-white/30' : 'border-white/50'}`}></div>
                                        <b.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isUnlocked ? 'text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]' : 'text-slate-500'}`} strokeWidth={2.5}/>
                                        {isUnlocked && <div className="absolute bottom-2 right-3 w-1.5 h-1.5 bg-white rounded-full blur-[1px] animate-pulse"></div>}
                                    </div>
                                    <h4 className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 text-center ${isUnlocked ? b.textColor : 'text-slate-600'}`}>{b.title}</h4>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 text-center leading-tight">{b.desc}</p>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-3xl flex items-center justify-center flex-col gap-2 z-10 transition-opacity group-hover:bg-slate-900/20">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"><Lock size={16} className="text-slate-500"/></div>
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/90 px-2 sm:px-3 py-1 rounded-full shadow-sm">Pendente</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SESSÃO 2: TROFÉUS ACADÊMICOS */}
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 relative z-10 flex items-center gap-2">
                    <GraduationCap size={16}/> 2. Troféus Acadêmicos (Cursos Concluídos)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                    {CURSOS_DISPONIVEIS.map(curso => {
                        const isUnlocked = cursosConcluidosMes.some(c => c.id === curso.id);
                        const CIcon = curso.icon || GraduationCap;
                        return (
                            <div key={curso.id} className="relative group perspective-[1000px] cursor-default">
                                <div className={`relative flex flex-col items-center justify-center p-5 rounded-3xl border shadow-xl transition-all duration-500 transform ${isUnlocked ? 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200 hover:-translate-y-2' : 'bg-slate-50 border-slate-200 opacity-80 grayscale'}`}>
                                    {isUnlocked && <div className="absolute inset-0 rounded-3xl opacity-20 blur-xl bg-gradient-to-br from-indigo-400 to-purple-600"></div>}
                                    
                                    {/* Troféu de Ouro/Prata */}
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 relative transition-transform duration-500 ${isUnlocked ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 shadow-[inset_0_-6px_12px_rgba(0,0,0,0.2),_0_12px_20px_-5px_rgba(245,158,11,0.4)] group-hover:scale-110 rotate-3' : 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)]'}`}>
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-2xl"></div>
                                        <CIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${isUnlocked ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : 'text-slate-400'}`} strokeWidth={2}/>
                                        {isUnlocked && <Star size={16} className="absolute -top-2 -right-2 text-yellow-500 fill-yellow-400 animate-spin-slow drop-shadow-md"/>}
                                    </div>

                                    <h4 className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 text-center ${isUnlocked ? 'text-indigo-800' : 'text-slate-600'}`}>{curso.title}</h4>
                                    
                                    {/* Progress Bar para cursos não concluídos mas iniciados */}
                                    {(!isUnlocked && getCourseProgress(curso.id, currentUser.modulos_concluidos) > 0) ? (
                                        <div className="w-full mt-1 px-2 z-20">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-0.5">
                                                <span>Progresso</span>
                                                <span>{getCourseProgress(curso.id, currentUser.modulos_concluidos)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{width: `${getCourseProgress(curso.id, currentUser.modulos_concluidos)}%`}}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 text-center leading-tight z-20">{isUnlocked ? 'Concluído no mês' : curso.desc}</p>
                                    )}
                                    
                                    {!isUnlocked && getCourseProgress(curso.id, currentUser.modulos_concluidos) === 0 && (
                                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10 transition-opacity">
                                            <div className="bg-white/90 p-2 rounded-full shadow-sm"><Lock size={14} className="text-slate-400"/></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TIMELINE DE ATIVIDADES E AVISOS */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <Activity size={20} className="text-indigo-500"/> Linha do Tempo
                        </h3>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">Atividades</span>
                    </div>

                    {notifications && notifications.length > 0 && (
                        <div className="mb-6 bg-indigo-50/60 transition-all border border-indigo-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-entrance">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                                    <Bell size={18} className="animate-bounce" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide">Alertas do Sistema</h4>
                                    <p className="text-slate-500 font-medium text-[11px] leading-tight">Você possui {notifications.length} notificações que demandam atenção.</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => {
                                    clearAllNotifications(notifications.map((n: any) => n.id));
                                    playMenuSound();
                                }}
                                className="text-[10px] font-black tracking-wider uppercase text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-100/50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                                <Trash2 size={10} /> Dispensar Alertas
                            </button>
                        </div>
                    )}

                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                        {inboxItems.length > 0 ? inboxItems.map((msg, i) => (
                            <div key={i} onClick={msg.action} className="relative pl-6 cursor-pointer group">
                                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${msg.isNew ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    <msg.icon size={12}/>
                                </div>
                                <div className={`p-4 rounded-2xl border transition-all ${msg.isNew ? 'bg-white border-indigo-200 shadow-md' : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 hover:bg-white'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{msg.sender}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{msg.date === hoje ? 'Hoje' : formatDateLocal(msg.date)}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{msg.subject}</h4>
                                </div>
                            </div>
                        )) : (
                            <div className="pl-6">
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                    <CheckCircle size={32} className="mx-auto text-emerald-300 mb-2"/>
                                    <p className="font-bold text-slate-600 text-sm">Tudo tranquilo!</p>
                                    <p className="text-xs text-slate-500 mt-1">Nenhum aviso ou convocatória pendente no momento.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA (DEVOCIONAL IA) */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] shadow-sm border border-indigo-100 p-6 relative overflow-hidden flex-1 flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles size={120}/></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="font-black text-indigo-900 text-lg flex items-center gap-2 mb-1"><BookOpen size={20} className="text-indigo-500"/> Palavra Diária</h3>
                            <p className="text-[10px] text-indigo-700/70 font-bold uppercase tracking-wider mb-6 border-b border-indigo-100 pb-4">Gerada pela IA com base no seu perfil</p>
                            
                            {!devocional && (
                                <div className="flex-1 flex flex-col justify-center items-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-400"><Sparkles size={28}/></div>
                                    <p className="text-sm font-bold text-indigo-800 mb-6">Precisa de uma palavra de encorajamento para iniciar o seu dia?</p>
                                    <Button onClick={gerarDevocional} disabled={loadingDev} variant="primary" className="w-full py-4 text-sm shadow-md shadow-indigo-200">
                                        {loadingDev ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>} ✨ Gerar Devocional
                                    </Button>
                                </div>
                            )}
                            
                            {loadingDev && (
                                <div className="py-10 flex flex-col items-center justify-center text-indigo-500 flex-1">
                                    <Loader2 size={40} className="animate-spin mb-4"/>
                                    <p className="font-bold text-sm animate-pulse">Buscando inspiração divina...</p>
                                </div>
                            )}
                            
                            {devocional && (
                                <div className="animate-entrance flex-1 flex flex-col">
                                    <div className="prose prose-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap flex-1">
                                        {devocional}
                                    </div>
                                    <div className="mt-6 flex gap-2 pt-4 border-t border-indigo-100/50">
                                        <button onClick={() => { copyToClipboard(devocional); if (typeof window !== 'undefined') alert('Copiado para a área de transferência!'); }} className="flex-1 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-2.5 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex justify-center items-center gap-1.5"><Copy size={16}/> Copiar</button>
                                        <button onClick={gerarDevocional} disabled={loadingDev} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-2.5 flex items-center gap-1.5 hover:bg-indigo-50 rounded-xl border border-transparent"><RefreshCw size={16}/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PortalCarteirinha = ({ user, igreja }) => {
    return (
        <div className="space-y-6 animate-entrance flex flex-col items-center justify-center pb-12">
            <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3 w-full justify-center md:justify-start">
                <FileBadge size={28} className="text-emerald-500"/> Credencial Digital
            </h2>
            
            {/* Visual da Carteirinha Digital Inspirado no Modelo Físico Premium */}
            <div className="w-[320px] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700 relative transform transition-transform hover:scale-[1.02] duration-300">
                {/* Efeitos de Fundo Premium */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[80px] opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 border-[4px] border-amber-500/20 m-2 rounded-2xl pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>

                <div className="p-6 relative z-10 flex flex-col h-full">
                    {/* Header Institucional */}
                    <div className="flex flex-col items-center text-center pb-5 border-b border-white/10 mb-5">
                        {igreja?.logo ? (
                            <img src={igreja.logo} className="h-16 w-16 object-contain bg-white rounded-xl p-1.5 shadow-lg mb-3" />
                        ) : (
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md mb-3 border border-white/20 shadow-lg">
                                <Building2 size={32} className="text-white"/>
                            </div>
                        )}
                        <h3 className="font-black text-white text-sm uppercase tracking-widest drop-shadow-md leading-tight">{igreja?.nome || 'Ministério'}</h3>
                        <p className="text-[10px] text-amber-500 font-black tracking-[0.3em] uppercase mt-1">Credencial Oficial</p>
                    </div>
                    
                    {/* Foto e QR Code */}
                    <div className="flex gap-5 mb-5 items-center">
                        <div className="w-24 h-32 bg-slate-800 rounded-xl overflow-hidden border-2 border-amber-500 shadow-xl shrink-0 relative">
                            {user.foto ? <img src={user.foto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={40}/></div>}
                        </div>
                        <div className="flex-1 bg-white p-1.5 rounded-xl shadow-lg border border-slate-200">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(user.id)}&color=0f172a&bgcolor=ffffff`} alt="QR Code Identificação" className="w-full aspect-square object-contain opacity-90"/>
                            <p className="text-[8px] font-black text-slate-800 text-center tracking-[0.2em] uppercase mt-1">Check-in Válido</p>
                        </div>
                    </div>
                    
                    {/* Dados do Membro */}
                    <div className="flex-1 flex flex-col justify-end">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Nome do Titular</p>
                        <p className="text-xl font-black text-white uppercase leading-tight mb-4 drop-shadow-md">{user.nome}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Função</p>
                                <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-lg shadow-sm inline-block">
                                    <p className="text-xs font-black uppercase tracking-wider">{user.cargo || 'Membro'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Registro</p>
                                <p className="text-sm font-bold text-white font-mono bg-white/10 px-3 py-1 rounded-lg inline-block border border-white/20">{user.numero_registro || '000000'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NOVO: Dados Cadastrais / Verso da Carteirinha */}
            <div className="w-[320px] sm:w-full max-w-md bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 mt-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2 mt-1">
                    <ClipboardList size={18} className="text-emerald-500"/> Dados de Registro
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento (CPF)</p>
                        <p className="text-xs font-bold text-slate-800">{user.cpf || 'Não informado'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nascimento</p>
                        <p className="text-xs font-bold text-slate-800">{formatDateLocal(user.data_nascimento) || 'Não informado'}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filiação</p>
                        <p className="text-xs font-bold text-slate-800 uppercase leading-snug">
                            {user.nome_pai || '---'} <br/> {user.nome_mae || '---'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batismo</p>
                        <p className="text-xs font-bold text-slate-800">{formatDateLocal(user.data_batismo) || 'Não informado'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admissão</p>
                        <p className="text-xs font-bold text-slate-800">{formatDateLocal(user.data_admissao) || 'Não informado'}</p>
                    </div>
                    <div className="col-span-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={12}/> Congregação / Sede</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{igreja?.nome} - {igreja?.cidade}/{igreja?.uf}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-200">
                    <div className="w-[45%] text-center">
                        <div className="border-b border-slate-800 mb-0.5 w-full"></div>
                        <p className="text-[5px] text-slate-500 uppercase font-bold tracking-widest">Assinatura do Titular</p>
                    </div>
                    <div className="w-[45%] text-center">
                        <div className="border-b border-slate-800 mb-0.5 w-full"></div>
                        <p className="text-[6px] font-bold text-slate-800 uppercase truncate">{igreja?.pastor || 'Pastor Presidente'}</p>
                        <p className="text-[5px] text-slate-500 uppercase tracking-widest">Presidente / Direção</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-500 text-center max-w-sm mt-4 font-medium bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                Apresente esta credencial digital em eventos, portarias ou na secretaria da igreja para identificação rápida e segura.
            </p>
        </div>
    );
};

const PortalFinanceiro = ({ user, db, isTesoureiro }) => {
    const { addToast, dbFirestore, appId, collection, addDoc, logAction, setDoc, doc, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);

    const handleGerarRelatorioAuditoria = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // filtrar todos os lançamentos financeiros do mês atual
        const lancamentosMesAtual = (db.financeiro || []).filter((item: any) => {
            const dStr = item.data_competencia || item.data_vencimento || item.data_pagamento || item.created_at;
            if (!dStr) return false;
            const dateOfItem = new Date(dStr);
            return dateOfItem.getFullYear() === currentYear && dateOfItem.getMonth() === currentMonth;
        });

        setPrintData({
            financeiro: lancamentosMesAtual,
            igreja: db.igreja
        });
        setPrintMode('rel_auditoria_financeira');
        setPreviewOpen(true);
        addToast("A gerar relatório de auditoria...", "success");
    };
    
    // Helpres para máscara de moeda BRL (BRL Currency Mask Helpers)
    const parseBRLToFloat = (value: string | number) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        const cleanValue = value.replace(/\D/g, "");
        if (!cleanValue) return 0;
        return parseInt(cleanValue, 10) / 100;
    };

    const formatBRL = (value: string | number) => {
        if (value === undefined || value === null) return "";
        let cleanValue = "";
        if (typeof value === 'number') {
            cleanValue = Math.round(value * 100).toString();
        } else {
            cleanValue = value.replace(/\D/g, "");
        }
        if (!cleanValue) return "";
        const cents = parseInt(cleanValue, 10);
        const floatValue = cents / 100;
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Funções para manipular comprovantes de contribuição pelo membro
    const handleUploadComprovante = (e, item) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 500 * 1024) {
            addToast("O comprovante deve ter no máximo 500KB.", "warning");
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Data = reader.result;
                if (!item.id) {
                    addToast("Não foi possível encontrar a ID do registro.", "error");
                    return;
                }
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { comprovante: base64Data }, { merge: true });
                logAction('EDIÇÃO', `Membro alterou/enviou comprovante das dízimas/oferta: R$ ${item.valor}`, 'financeiro', item.id);
                addToast("Comprovante enviado com sucesso!", "success");
            } catch (error) {
                console.error(error);
                addToast("Erro ao guardar o comprovante no sistema.", "error");
            }
        };
        reader.readAsDataURL(file);
    };

    const downloadComprovante = (base64Str, category) => {
        try {
            const a = document.createElement('a');
            a.href = base64Str;
            a.download = `comprovante_${category.toLowerCase()}_${Date.now()}`;
            a.click();
            addToast("A abrir comprovativo...", "success");
        } catch (e) {
            addToast("Erro ao abrir comprovativo.", "error");
        }
    };

    // Estado para o fluxo de nova contribuição PIX Inteligente
    const [novaOferta, setNovaOferta] = useState({ valor: '', categoria: 'Dízimo', etapa: 1, payload: '', descricao: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [buscaTermo, setBuscaTermo] = useState('');
    const chavePix = db.igreja?.chave_pix;

    const minhasContribuicoes = (db.financeiro || [])
        .filter(f => f.tipo === 'entrada' && (f.membro_id === user.id || f.membro_nome === user.nome))
        .sort((a, b) => new Date(b.data_competencia || 0).getTime() - new Date(a.data_competencia || 0).getTime());
    
    const minhasContribuicoesFiltradas = useMemo(() => {
        const term = buscaTermo.toLowerCase();
        return minhasContribuicoes.filter(f => {
            if (!term) return true;
            const cat = (f.categoria || '').toLowerCase();
            const desc = (f.descricao || '').toLowerCase();
            const forma = (f.forma_pagamento || '').toLowerCase();
            const valorStr = String(f.valor || '');
            return cat.includes(term) || desc.includes(term) || forma.includes(term) || valorStr.includes(term);
        });
    }, [minhasContribuicoes, buscaTermo]);

    const somaFiltrada = useMemo(() => {
        return minhasContribuicoesFiltradas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
    }, [minhasContribuicoesFiltradas]);
    
    const totalContribuido = minhasContribuicoes.filter(f => f.status === 'pago').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

    // NOVO: Filtrar Carnês/Campanhas do membro logado
    const meusCarnes = (db.carnes || []).filter(c => c.membro_id === user.id);

    const handleGerarPix = () => {
        if (!chavePix) return addToast("A igreja ainda não configurou uma chave PIX.", "warning");
        const numericValue = parseBRLToFloat(novaOferta.valor);
        if (numericValue <= 0) return addToast("Introduza um valor válido.", "warning");
        
        // Gera o payload exato com o valor preenchido pelo membro
        const payload = generatePixPayload(chavePix, db.igreja?.nome, db.igreja?.cidade, numericValue.toString());
        setNovaOferta({ ...novaOferta, etapa: 2, payload });
    };

    const copyPix = () => {
        if (!novaOferta.payload) return;
        copyToClipboard(novaOferta.payload);
        addToast("Código PIX 'Copia e Cola' gerado e copiado com sucesso!", "success");
    };

    const handleConfirmarPagamento = async () => {
        setIsSaving(true);
        const dataAtual = new Date().toISOString().split('T')[0];
        try {
            const numericValue = parseBRLToFloat(novaOferta.valor);
            const descPersonalizada = novaOferta.descricao ? ` - Metadados: ${novaOferta.descricao.toUpperCase()}` : '';
            const novaEntrada = {
                tipo: 'entrada',
                valor: numericValue,
                categoria: novaOferta.categoria,
                descricao: `Contribuição via Portal (${novaOferta.categoria})${descPersonalizada}`,
                data_competencia: dataAtual,
                forma_pagamento: 'PIX',
                status: 'pago',
                conciliado: false, // CRUCIAL: Isto atira para a Conciliação Bancária
                membro_id: user.id,
                membro_nome: user.nome,
                congregacao_id: user.congregacao_id || 'sede',
                created_at: new Date().toISOString()
            };

            const docRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), novaEntrada);
            logAction('CRIAÇÃO', `Membro enviou notificação de pagamento PIX de ${formatBRL(novaOferta.valor)}`, 'financeiro', docRef.id);
            
            addToast('Notificação enviada! A aguardar conferência da Tesouraria.', 'success');
            setNovaOferta({ valor: '', categoria: 'Dízimo', etapa: 1, payload: '', descricao: '' });
        } catch (e) {
            console.error(e);
            addToast('Erro ao comunicar com a secretaria.', 'error');
        }
        setIsSaving(false);
    };

    return (
        <div id="portal_financas" className="space-y-6 animate-entrance pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-0"><DollarSign size={28} className="text-emerald-500"/> Meus Dízimos e Ofertas</h2>
                {isTesoureiro && (
                    <button 
                        onClick={handleGerarRelatorioAuditoria}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:-translate-y-0.5 self-start sm:self-auto cursor-pointer"
                    >
                        <ShieldCheck size={16}/> Relatório de Auditoria (Mês Atual)
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all duration-500 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] hover:-translate-y-1 flex items-center justify-between border border-emerald-400/50 md:col-span-1">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Reconhecido</p>
                        <h3 className="text-3xl font-black truncate">R$ {totalContribuido.toFixed(2)}</h3>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shrink-0"><Heart size={28}/></div>
                </div>

                {/* --- MÓDULO INOVADOR DE PIX COM VALOR EXATO --- */}
                <div className="md:col-span-2 bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 rounded-[2rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-500 border border-emerald-100 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none"></div>
                    
                    <div className="p-8 relative z-10">
                        {novaOferta.etapa === 1 ? (
                            <>
                                <h3 className="font-black text-xl text-slate-800 flex items-center gap-2 mb-2">
                                    <Zap size={20} className="text-emerald-500 fill-emerald-500"/> Realizar Contribuição (PIX)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mb-6">Preencha o valor e escolha o destino. O sistema irá gerar um código PIX com a quantia exata para o seu banco.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor a Transferir</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                placeholder="R$ 0,00"
                                                value={novaOferta.valor}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const formatted = formatBRL(raw);
                                                    setNovaOferta({...novaOferta, valor: formatted});
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-emerald-600 font-black text-lg focus:border-emerald-500 outline-none shadow-inner"
                                            />
                                        </div>
                                        
                                        {/* Botoões de Valores Rápidos (Presets) */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {[20, 50, 100, 200, 500].map((val) => (
                                                <button 
                                                    key={val}
                                                    type="button"
                                                    onClick={() => {
                                                        const brixValue = formatBRL((val * 100).toString());
                                                        setNovaOferta(prev => ({...prev, valor: brixValue}));
                                                    }}
                                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600 rounded-lg text-[11px] font-black tracking-tight text-slate-600 transition-all cursor-pointer"
                                                >
                                                    R$ {val}
                                                </button>
                                            ))}
                                            <button 
                                                type="button"
                                                onClick={() => setNovaOferta(prev => ({...prev, valor: ''}))}
                                                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-lg text-[11px] font-black tracking-tight transition-all cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destino / Categoria</label>
                                            <select 
                                                value={novaOferta.categoria}
                                                onChange={(e) => setNovaOferta({...novaOferta, categoria: (e.target.value || "").toUpperCase()})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-700 font-black focus:border-[#10b981] outline-none shadow-sm cursor-pointer"
                                            >
                                                <option value="Dízimo">Dízimo Mensal</option>
                                                <option value="Oferta">Oferta Alçada</option>
                                                <option value="Missões">Carnê / Voto de Missões</option>
                                                <option value="Construção">Campanha de Construção</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Observação / Descrição (Opcional)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Dízimo de Maio, Oferta de Missões..."
                                                value={novaOferta.descricao}
                                                onChange={e => setNovaOferta({...novaOferta, descricao: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-800 text-xs font-bold focus:border-[#10b981] outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleGerarPix} variant="success" className="w-full shadow-emerald-500/20 py-3.5 cursor-pointer flex items-center justify-center gap-2">
                                    <Zap size={16} /> Gerar Código PIX
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center gap-6 animate-scale-in">
                                <div className="bg-emerald-50 p-2 rounded-2xl shrink-0 border border-emerald-100 relative">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(novaOferta.payload)}&color=047857`} alt="QR Code PIX" className="w-32 h-32 object-contain rounded-xl"/>
                                </div>
                                <div className="flex-1 text-center md:text-left w-full">
                                    <h3 className="font-black text-emerald-600 text-lg mb-1">PIX Pronto a Pagar</h3>
                                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">{novaOferta.categoria} • <span className="text-slate-800">{formatBRL(novaOferta.valor)}</span></p>
                                    
                                    <Button onClick={copyPix} variant="secondary" className="w-full justify-center mb-3 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700">
                                        <Copy size={16}/> Copiar "PIX Copia e Cola"
                                    </Button>
                                    
                                    <Button onClick={handleConfirmarPagamento} disabled={isSaving} variant="success" className="w-full justify-center shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-600">
                                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} 
                                        {isSaving ? 'A Notificar...' : 'Já Paguei! (Notificar Tesouraria)'}
                                    </Button>
                                    
                                    <button onClick={() => setNovaOferta({...novaOferta, etapa: 1})} className="w-full mt-3 text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">
                                        Cancelar / Voltar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 transition-all duration-500 rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] border border-slate-100 p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-slate-700 text-lg">Meu Histórico Financeiro</h3>
                        <p className="text-xs text-slate-400">Verifique os registos das suas contribuições</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                            <input 
                                type="text" 
                                placeholder="Buscar dízimo, oferta ou valor..." 
                                value={buscaTermo} 
                                onChange={e => setBuscaTermo(e.target.value)} 
                                className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl w-64 text-sm outline-none focus:border-emerald-500 shadow-sm bg-white"
                            />
                            {buscaTermo && (
                                <button onClick={() => setBuscaTermo('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-100">Transações</span>
                    </div>
                </div>

                {/* CARD DE RESUMO DINÂMICO NO TOPO DA TABELA */}
                <div className="bg-emerald-50 bg-opacity-40 border border-emerald-100 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
                            <TrendingUp size={18}/>
                        </span>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Soma dos Valores Filtrados</p>
                            <p className="text-xs text-slate-500">Valor total atualizado conforme o filtro ou pesquisa em tempo real</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-center sm:items-end">
                        <span className="text-xl font-black text-emerald-600 leading-none">R$ {somaFiltrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1.5">{minhasContribuicoesFiltradas.length} lançado(s)</span>
                    </div>
                </div>

                {minhasContribuicoesFiltradas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="pb-3 pr-4">Data</th>
                                    <th className="pb-3 pr-4">Tipo/Categoria</th>
                                    <th className="pb-3 pr-4 text-right">Valor (R$)</th>
                                    <th className="pb-3 text-center">Status (Tesouraria)</th>
                                    <th className="pb-3 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {minhasContribuicoesFiltradas.map((f, i) => {
                                    const pendenteValidacao = f.conciliado === false;
                                    return (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pr-4 font-medium text-slate-600 whitespace-nowrap">{formatDateLocal(f.data_competencia)}</td>
                                        <td className="py-4 pr-4">
                                            <span className="font-bold text-slate-800 block leading-tight">{f.categoria}</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase">{f.forma_pagamento || 'PIX'}</span>
                                        </td>
                                        <td className="py-4 pr-4 text-right font-black text-emerald-600 whitespace-nowrap">R$ {parseFloat(f.valor).toFixed(2)}</td>
                                        <td className="py-4 text-center">
                                            {pendenteValidacao ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                                    <Clock size={10}/> Em Análise
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-200">
                                                    <CheckCheck size={10}/> Confirmado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {f.comprovante ? (
                                                    <button
                                                        onClick={() => downloadComprovante(f.comprovante, f.categoria)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-100 transition-colors shadow-sm select-none"
                                                        title="Ver Comprovante"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Ver</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-medium italic">Sem anexo</span>
                                                )}

                                                {pendenteValidacao && (
                                                    <>
                                                        <label
                                                            htmlFor={`replace-file-${f.id || i}`}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-100 cursor-pointer transition-colors shadow-sm select-none"
                                                            title={f.comprovante ? "Substituir Comprovante" : "Anexar Comprovante"}
                                                        >
                                                            <Upload size={13} />
                                                            <span>{f.comprovante ? "Substituir" : "Enviar"}</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id={`replace-file-${f.id || i}`}
                                                            className="hidden"
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => handleUploadComprovante(e, f)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 flex flex-col items-center">
                        <Receipt size={40} className="text-[#444] mb-3"/>
                        <p className="text-[#A0A0A0] text-sm font-bold">Nenhum registo de contribuição encontrado.</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden mt-6">
                <h3 className="font-bold text-slate-700 mb-6">Minhas Campanhas e Carnês</h3>
                {meusCarnes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {meusCarnes.map(carne => {
                            const totalPago = (carne.parcelas || []).filter(p => p.status === 'pago').reduce((a, b) => a + (parseFloat(b.valor) || 0), 0);
                            const totalEsperado = parseFloat(carne.valor_total) || 0;
                            const perc = totalEsperado > 0 ? Math.round((totalPago / totalEsperado) * 100) : 0;
                            
                            return (
                                <div key={carne.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2">{carne.titulo}</h4>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">R$ {totalPago.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">de R$ {totalEsperado.toFixed(2)}</span></span>
                                        <span className="text-xs font-black text-emerald-600">{perc}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-emerald-500" style={{ width: `${perc}%` }}></div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {(carne.parcelas || []).map((p, idx) => (
                                            <div key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${p.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`} title={`Vencimento: ${formatDateLocal(p.vencimento)}`}>
                                                P{p.numero}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 flex flex-col items-center">
                        <CreditCard size={40} className="text-slate-300 mb-3"/>
                        <p className="text-slate-500 text-sm font-bold">Nenhum carnê ou campanha ativa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PortalAgenda = ({ user, db }) => {
    const { setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const hoje = new Date().toISOString().split('T')[0];
    const eventos = (db.agenda || []).filter(e => e.data >= hoje).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    const handleRSVP = async (evtId, status) => {
        const evt = db.agenda.find(e => e.id === evtId);
        if (!evt) return;
        const novasPresencas = { ...(evt.presencas || {}), [user.id]: status };
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'agenda', evtId), { presencas: novasPresencas }, { merge: true });
            addToast(status === 'confirmado' ? "Presença confirmada!" : "Ausência informada.", "success");
        } catch (e) {
            addToast("Erro ao atualizar presença.", "error");
        }
    };

    return (
        <div className="space-y-6 animate-entrance">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Calendar size={28} className="text-[#FFC500]"/> Agenda da Igreja</h2>
            
            <div className="grid gap-4">
                {eventos.length > 0 ? eventos.map((evt, i) => {
                    const rsvpStatus = evt.presencas?.[user.id];
                    return (
                        <div key={i} className="bg-[#1C1C1C] p-5 md:p-6 rounded-3xl shadow-sm border border-[#333333] flex flex-col gap-4 hover:border-[#FFC500] transition-colors group">
                            <div className="flex items-center gap-5">
                                <div className="bg-[#2C2C2C] text-[#FFC500] p-3 rounded-2xl text-center min-w-[70px] group-hover:bg-[#FFC500] group-hover:text-black transition-colors">
                                    <div className="text-2xl font-black leading-none">{evt.data.split('-')[2]}</div>
                                    <div className="text-[10px] font-bold uppercase">{new Date(evt.data).toLocaleString('pt-BR', {month: 'short'})}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white text-lg truncate">{evt.titulo}</h4>
                                        <div className="hidden sm:block"><span className="text-[10px] font-black uppercase text-black bg-[#FFC500] px-3 py-1 rounded-full">{evt.tipo}</span></div>
                                    </div>
                                    <p className="text-xs text-[#A0A0A0] font-medium flex flex-wrap gap-3">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {evt.hora}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14}/> {evt.local || 'Templo Sede'}</span>
                                    </p>
                                    {evt.lembrete_push_ativo && (
                                        <div className="flex items-center gap-1.5 mt-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider w-fit">
                                            <Bell size={11} className="text-indigo-400 animate-bounce" /> 
                                            Notificação Push 24h Disponível
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seção de Confirmação de Presença (Agenda) */}
                            <div className="mt-2 pt-4 border-t border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest flex items-center gap-1.5"><CheckCircle size={14}/> Você irá participar?</p>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => handleRSVP(evt.id, 'confirmado')}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'confirmado' ? 'bg-[#FFC500]/20 text-[#FFC500] border-[#FFC500]/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-[#FFC500] hover:text-[#FFC500]'}`}
                                    >
                                        <CheckCircle size={14} /> Estarei Presente
                                    </button>
                                    <button 
                                        onClick={() => handleRSVP(evt.id, 'recusado')}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'recusado' ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-rose-500 hover:text-rose-500'}`}
                                    >
                                        <Ban size={14} /> Não Estarei
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-[#1C1C1C] p-10 rounded-3xl shadow-sm border border-[#333333] text-center">
                        <Calendar size={48} className="text-[#444] mx-auto mb-4"/>
                        <p className="text-[#A0A0A0] font-bold">Nenhum evento futuro agendado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PortalTarefas = ({ user, db }) => {
    const { setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    
    const [activeAlarms, setActiveAlarms] = useState<any[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('gipp_local_alarms') || '[]');
        } catch (e) {
            return [];
        }
    });
    
    const [reminderMenuOpen, setReminderMenuOpen] = useState<string | null>(null);

    const minhasTarefas = (db.tarefas || []).filter(t => 
        (t.equipe || []).some(m => m.id === user.id || m.nome === user.nome)
    ).sort((a, b) => new Date(a.data || '9999-12-31').getTime() - new Date(b.data || '9999-12-31').getTime());

    const handleRSVP = async (taskId, status) => {
        const task = db.tarefas.find(t => t.id === taskId);
        if (!task) return;
        
        const novaEquipe = task.equipe.map(m => 
            (m.id === user.id || m.nome === user.nome) ? { ...m, status_presenca: status } : m
        );
        
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas', taskId), { equipe: novaEquipe }, { merge: true });
            addToast(status === 'confirmado' ? "Presença confirmada na escala!" : "Ausência na escala informada.", "success");
        } catch (e) {
            addToast("Erro ao atualizar a confirmation.", "error");
        }
    };

    const handleCreateICSFile = (task: any) => {
        try {
            const title = `Escala GIPP: ${task.categoria} - ${task.descricao}`;
            const dateStr = task.data ? task.data.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
            const startTime = `${dateStr}T090000`; // Default to 9:00 AM
            const endTime = `${dateStr}T100000`; // Default to 10:00 AM
            
            const desc = `Compromisso na igreja. Tema/Escala: ${task.descricao}. Categoria: ${task.categoria}. Status de Aceite: Confirmado.`;
            
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//GIPP//ChurchManagement//PT',
                'BEGIN:VEVENT',
                `UID:gipp_task_${task.id}@gipp.app`,
                'SEQUENCE:0',
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${startTime}`,
                `DTEND:${endTime}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${desc}`,
                'STATUS:CONFIRMED',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `escala_${task.id || 'compromisso'}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast("Dispositivo: Convite de Calendário (.ics) descarregado! Abra para salvar no telemóvel.", "success");
        } catch (err) {
            addToast("Erro ao gerar arquivo de convite.", "error");
        }
    };

    const handleAddAlarm = async (task: any, option: string) => {
        try {
            if ('Notification' in window && Notification.permission !== 'granted') {
                await Notification.requestPermission();
            }
            
            const parts = task.data ? task.data.split('-') : [];
            let taskDate: Date;
            if (parts.length === 3) {
                taskDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 8, 0, 0); // Default to 8 AM on day
            } else {
                taskDate = new Date();
            }
            
            let offset = 0;
            let optionLabel = 'No Dia do Compromisso';
            
            if (option === '1day') {
                offset = 24 * 60 * 60 * 1000;
                optionLabel = '1 dia antes';
            } else if (option === '1hour') {
                offset = 60 * 60 * 1000;
                optionLabel = '1 hora antes';
            } else {
                optionLabel = 'No dia (08h)';
            }
            
            const targetTime = taskDate.getTime() - offset;
            
            const alarmId = `${task.id}_${option}`;
            const newAlarm = {
                id: alarmId,
                taskId: task.id,
                title: `${task.categoria || 'Escala'} : GIPP`,
                body: `${task.descricao || 'Atividade na escala'} agendada para ${formatDateLocal(task.data)}!`,
                targetTime: targetTime,
                triggered: false,
                optionLabel: optionLabel
            };
            
            const updated = activeAlarms.filter(a => a.id !== alarmId);
            updated.push(newAlarm);
            
            localStorage.setItem('gipp_local_alarms', JSON.stringify(updated));
            setActiveAlarms(updated);
            addToast(`Lembrete local programado: ${optionLabel}!`, "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao programar alarme.", "error");
        }
    };

    return (
        <div className="space-y-6 animate-entrance">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100"><CheckSquare size={28}/></div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Minhas Escalas e Tarefas</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Compromissos agendados e Confirmações</p>
                    </div>
                </div>
                {minhasTarefas.length > 0 && (
                    <button 
                        onClick={() => {
                            setPrintData({ membro: user, tarefas: db.tarefas || [], igreja: db.igreja });
                            setPrintMode('membro_escala_print');
                            setPreviewOpen(true);
                        }}
                        className="shadow-md flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-xs transition-all border border-indigo-500"
                    >
                        <Printer size={16}/> Imprimir Compromissos
                    </button>
                )}
            </div>
            
            <div className="glass-modern rounded-[2rem] shadow-sm border border-white/50 p-6 md:p-8">
                {minhasTarefas.length > 0 ? (
                    <div className="space-y-4">
                        {minhasTarefas.map((t, i) => {
                            const membroInfo = (t.equipe || []).find(m => m.id === user.id || m.nome === user.nome);
                            const minhaFuncao = membroInfo?.funcao_escala || 'Membro da Equipe';
                            const rsvpStatus = membroInfo?.status_presenca;
                            
                            return (
                                <div key={i} className="flex flex-col gap-4 p-5 md:p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all group">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-slate-100 text-slate-500 tracking-wider border border-slate-200">{t.categoria}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase shadow-sm ${t.status === 'Concluido' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'} `}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-lg mb-3">{t.descricao}</h4>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block mb-4 shadow-sm">
                                            <p className="text-xs text-indigo-600 font-bold flex items-center gap-2">
                                                <Target size={14}/> Função na Escala: <span className="font-black uppercase text-slate-700">{minhaFuncao}</span>
                                            </p>
                                        </div>
                                        {t.data && (
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mb-2">
                                                <Calendar size={14} className="text-indigo-500"/> Data marcada: {formatDateLocal(t.data)}
                                                {new Date(t.data).getTime() < Date.now() && t.status !== 'Concluido' && (
                                                    <span className="text-rose-500 font-bold ml-2 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">(Atrasada)</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Seção de Confirmação de Presença (Tarefas) */}
                                    <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><CheckSquare size={14}/> Confirma a sua presença?</p>
                                            
                                            {/* Alarm Status Badges */}
                                            {activeAlarms.filter(a => a.taskId === t.id && !a.triggered).length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {activeAlarms.filter(a => a.taskId === t.id && !a.triggered).map(alarm => (
                                                        <span key={alarm.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
                                                            <Bell size={9} className="animate-pulse" />
                                                            {alarm.optionLabel}
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const updated = activeAlarms.filter(a => a.id !== alarm.id);
                                                                    localStorage.setItem('gipp_local_alarms', JSON.stringify(updated));
                                                                    setActiveAlarms(updated);
                                                                    addToast("Lembrete local cancelado.", "info");
                                                                }}
                                                                className="text-indigo-400 hover:text-indigo-600 ml-1 font-bold cursor-pointer"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                            {/* Botão de Lembrete Local com Dropdown */}
                                            <div className="relative inline-block text-left w-full sm:w-auto">
                                                <button 
                                                    onClick={() => setReminderMenuOpen(reminderMenuOpen === t.id ? null : t.id)}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                                >
                                                    <Bell size={13} className="text-indigo-500" /> Lembrar-me
                                                </button>
                                                
                                                {reminderMenuOpen === t.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-30" onClick={() => setReminderMenuOpen(null)} />
                                                        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-40 p-2 text-left">
                                                            <p className="text-[9px] font-black uppercase text-slate-400 px-3 py-1.5 border-b border-slate-100 tracking-wider">Calendário Aparelho</p>
                                                            <button 
                                                                onClick={() => { handleCreateICSFile(t); setReminderMenuOpen(null); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Calendar size={14} className="text-blue-500" /> Baixar Convite (.ics)
                                                            </button>
                                                            
                                                            <p className="text-[9px] font-black uppercase text-slate-400 px-3 py-1.5 border-t border-slate-100 border-b border-slate-100 tracking-wider mt-1">Alarme Local Browser</p>
                                                            <button 
                                                                onClick={() => { handleAddAlarm(t, 'on_hour'); setReminderMenuOpen(null); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Bell size={14} className="text-amber-500" /> Alarme No Dia (08h)
                                                            </button>
                                                            <button 
                                                                onClick={() => { handleAddAlarm(t, '1hour'); setReminderMenuOpen(null); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Clock size={14} className="text-amber-500" /> Alarme 1 hora antes
                                                            </button>
                                                            <button 
                                                                onClick={() => { handleAddAlarm(t, '1day'); setReminderMenuOpen(null); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Calendar size={14} className="text-amber-500" /> Alarme 1 dia antes
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <button 
                                                onClick={() => handleRSVP(t.id, 'confirmado')}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'confirmado' ? 'bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'}`}
                                            >
                                                <CheckCircle size={14} /> Estarei Presente
                                            </button>
                                            <button 
                                                onClick={() => handleRSVP(t.id, 'recusado')}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'recusado' ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-rose-400 hover:text-rose-600'}`}
                                            >
                                                <Ban size={14} /> Não Estarei
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center p-10 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100"><CheckSquare size={32} className="text-indigo-400"/></div>
                        <p className="font-bold text-slate-700 text-lg mb-1">Agenda Livre!</p>
                        <p className="text-sm text-slate-500">Não possui escalas ou tarefas pendentes no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PortalEBD = ({ user, db }) => {
    const { addToast, setDoc, doc, dbFirestore, appId, isOnline, callGeminiAI } = useContext(ChurchContext);
    const [aiLesson, setAiLesson] = useState<any>(null);
    const [downloadedLessons, setDownloadedLessons] = useState<string[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
    const [isEbdFullscreen, setIsEbdFullscreen] = useState(false);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingList(false);
        }, 850);
        return () => clearTimeout(timer);
    }, []);

    // Pré-carregamento (prefetch) automático das capas das revistas no IndexedDB
    useEffect(() => {
        if (!isOnline) return;
        
        let isMounted = true;
        const prefetchEbdImages = async () => {
            const licoes = db.ebd?.licoes || [];
            const uniqueRevistas = new Set<string>();
            const itemsToPrefetch: { url: string; key: string }[] = [];

            licoes.forEach((l: any) => {
                if (uniqueRevistas.has(l.revista)) return;
                const capa = l.capa && l.capa !== 'null' ? l.capa : (licoes.find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null')?.capa || null);
                if (capa && capa.startsWith('http')) {
                    uniqueRevistas.add(l.revista);
                    itemsToPrefetch.push({ url: capa, key: `ebd_capa_${l.revista}` });
                }
            });

            // Executa o pré-carregamento em segundo plano sem bloquear a interface de usuário
            for (const item of itemsToPrefetch) {
                if (!isMounted) break;
                try {
                    const cached = await getMedia(item.key);
                    if (!cached) {
                        const response = await fetch(item.url, { mode: 'cors' });
                        if (!response.ok) continue;
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (reader.result && isMounted) {
                                storeMedia(item.key, reader.result as string)
                                    .then(() => {
                                        console.log(`[Prefetch] Capa da revista pre-carregada e salva em IndexedDB: ${item.key}`);
                                    })
                                    .catch((err) => {
                                        console.error(`[Prefetch] Falha ao armazenar a capa da revista ${item.key}:`, err);
                                    });
                            }
                        };
                        reader.readAsDataURL(blob);
                    }
                } catch (e) {
                    console.warn(`[Prefetch] Falha ao efetuar prefetch da imagem EBD ${item.url}:`, e);
                }
            }
        };

        // Delay inicial leve para priorizar primeiro render do Portal EBD
        const delayTimer = setTimeout(() => {
            prefetchEbdImages();
        }, 1500);

        return () => {
            isMounted = false;
            clearTimeout(delayTimer);
        };
    }, [db.ebd?.licoes, isOnline]);

    const isLicaoNova = (licao: any) => {
        if (licao.createdAt) {
            try {
                const createdTime = new Date(licao.createdAt).getTime();
                const now = new Date().getTime();
                const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= 0 && diffDays <= 7) return true;
            } catch (e) {}
        }
        if (licao.data) {
            try {
                const lessonTime = new Date(licao.data).getTime();
                const now = new Date().getTime();
                const diffDays = (now - lessonTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= -3 && diffDays <= 7) return true;
            } catch (e) {}
        }
        return false;
    };

    const minhaMatricula = db.ebd?.alunos?.find(a => a.membro_id === user.id || a.nome === user.nome);
    const minhaTurma = minhaMatricula ? db.ebd?.turmas?.find(t => t.id === minhaMatricula.turma_id) : null;
    
    // NOVO: Permite aos membros acessar a biblioteca de lições de forma livre mesmo sem matrícula
    const licoesDisponiveis = minhaTurma 
        ? (db.ebd?.licoes || []).filter(l => l.turma_id === minhaTurma.id).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()) 
        : (db.ebd?.licoes || []).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 15);

    // Check which lessons are currently cached on mount and updates
    useEffect(() => {
        const cachedKeys: string[] = [];
        (db.ebd?.licoes || []).forEach(l => {
            const key = `gipp_cached_ebd_lesson_${l.id || l.licao_numero || '1'}_${l.revista}`;
            if (localStorage.getItem(key)) {
                cachedKeys.push(l.id || l.licao_numero);
            }
        });
        setDownloadedLessons(cachedKeys);
    }, [db.ebd?.licoes]);

    const handleDownloadForOffline = async (licao, e) => {
        e.stopPropagation();
        if (!isOnline) {
            addToast("Apenas disponível online para pré-carregamento.", "warning");
            return;
        }
        setDownloadingIds(prev => [...prev, licao.id || licao.licao_numero]);
        addToast(`Pré-carregando Lição ${licao.licao_numero || ''} para leitura offline...`, "info");
        await handleGenerateLessonPlan(licao, true); // silent = true, just save to cache
        setDownloadingIds(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
    };

    const handleDeleteOfflineCache = (licao, e) => {
        e.stopPropagation();
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        localStorage.removeItem(cacheKey);
        
        setDownloadedLessons(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
        addToast(`Estudo da Lição ${licao.licao_numero || ''} removido do armazenamento offline!`, "success");
    };

    const handleGenerateLessonPlan = async (licao, silent = false) => {
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        const cachedData = localStorage.getItem(cacheKey);

        const getManualCapa = (l: any) => {
            if (l.capa && l.capa !== 'null') return l.capa;
            const licoes = db.ebd?.licoes || [];
            const licaoComCapa = licoes.find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null');
            return licaoComCapa ? licaoComCapa.capa : null;
        };

        const manualCapa = getManualCapa(licao);

        if (cachedData && !silent) {
            try {
                const parsed = JSON.parse(cachedData);
                const finalCapa = manualCapa || parsed.capa || null;
                setAiLesson({
                    loading: false,
                    text: parsed.text,
                    title: parsed.title,
                    revista: parsed.revista,
                    licao: parsed.licao,
                    capa: finalCapa,
                    fromCache: true
                });
                addToast("Lição carregada do Cache Local (Offline-ready)!", "success");
                return;
            } catch (e) {
                console.warn("Could not read EBD lesson from local storage:", e);
            }
        }

        // Se o estudo já tiver sido gerado e sincronizado no Firestore, carrega-o instantaneamente!
        if (licao.conteudo_estudo) {
            try {
                const finalCapa = manualCapa || licao.capa || null;
                const lessonObj = {
                    text: licao.conteudo_estudo,
                    title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                    revista: licao.revista,
                    licao: licao.licao_numero || '1',
                    capa: finalCapa
                };
                
                localStorage.setItem(cacheKey, JSON.stringify(lessonObj));
                
                setDownloadedLessons(prev => {
                    const keyId = licao.id || licao.licao_numero;
                    if (!prev.includes(keyId)) return [...prev, keyId];
                    return prev;
                });
                
                if (!silent) {
                    setAiLesson({
                        loading: false,
                        text: licao.conteudo_estudo,
                        title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                        revista: licao.revista,
                        licao: licao.licao_numero || '1',
                        capa: finalCapa,
                        fromCache: true
                    });
                    addToast("Lição carregada instantaneamente da biblioteca sincronizada!", "success");
                } else {
                    addToast(`Lição ${licao.licao_numero} pré-carregada e disponível offline!`, "success");
                }
                return;
            } catch (err) {
                console.error("Erro ao tratar conteúdo pré-existente:", err);
            }
        }

        if (!isOnline && !cachedData) {
            addToast("Você está offline e esta lição não está na memória do aparelho. Conecte-se à internet para estudar.", "warning");
            return;
        }

        const initialCapa = manualCapa || licao.capa || null;
        if (!silent) {
            setAiLesson({ loading: true, text: '', title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: initialCapa });
        }
        
        try {
            const hasCapaExistente = !!initialCapa;
            const prompt = `Atue como um teólogo especialista no material oficial da CPAD. 
            Pesquise e use obrigatoriamente como base de conteúdo e imagens as seguintes fontes: o currículo e portal oficial da CPAD (Casa Publicadora das Assembleias de Deus), Google Books API e Sistema EBD.
            O usuário deseja o conteúdo de estudo para a revista com o tema: "${licao.revista}", especificamente a Lição número ${licao.licao_numero || '1'}. 
            
            ${!hasCapaExistente ? 'Por favor, retorne no final do texto a URL de uma imagem da capa desta revista específica. Formate exatamente assim: URL_CAPA=[url_da_imagem]. Se não encontrar, coloque URL_CAPA=null.' : ''}

            Gere um conteúdo fiel, interativo e completo contendo:
            1. Título da Lição
            2. Texto Áureo e Verdade Prática
            3. Leitura Bíblica em Classe
            4. Introdução
            5. Tópicos e Subtópicos explicados
            6. Conclusão.
            
            Utilize formatação Markdown bem estruturada e rica.`;
            
            const result = await callGeminiAI(prompt, 5);
            
            let texto = result;
            let capaUrl = initialCapa;
            
            if (!hasCapaExistente) {
                const match = result.match(/URL_CAPA=\[?(.*?)\]?/);
                if (match && match[1] && match[1] !== 'null') {
                    capaUrl = match[1].trim();
                    texto = result.replace(match[0], '');
                } else {
                    capaUrl = manualCapa || null;
                }
            }
            
            const lessonObj = {
                text: texto,
                title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                revista: licao.revista,
                licao: licao.licao_numero || '1',
                capa: capaUrl
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(lessonObj));
            
            // Sincronizar de volta para o Firestore para todos os membros
            if (licao.id && dbFirestore && appId) {
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes', licao.id), {
                        conteudo_estudo: texto,
                        capa: capaUrl
                    }, { merge: true });
                } catch (dbErr) {
                    console.error("Erro ao sincronizar geração do estudo no Firestore:", dbErr);
                }
            }
            
            // Update downloaded list
            setDownloadedLessons(prev => {
                const keyId = licao.id || licao.licao_numero;
                if (!prev.includes(keyId)) return [...prev, keyId];
                return prev;
            });
            
            if (!silent) {
                setAiLesson({ loading: false, text: texto, title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: capaUrl });
                addToast("Lição salva no armazenamento offline do dispositivo!", "success");
            } else {
                addToast(`Lição ${licao.licao_numero} pré-carregada e disponível offline!`, "success");
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                setAiLesson(null);
                addToast("Não foi possível gerar a lição.", "error");
            }
        }
    };

    return (
        <div id="portal_ebd" className="space-y-6 animate-entrance">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><BookOpen size={28} className="text-emerald-500"/> Escola Bíblica Dominical</h2>
            
            {minhaTurma ? (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Aluno Matriculado</span>
                        <h3 className="text-2xl font-black text-slate-800 mb-1">{minhaTurma.nome}</h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><MapPin size={16}/> {minhaTurma.sala || 'Sala Principal'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professores</p>
                        <ul className="text-sm font-bold text-slate-700 space-y-1">
                            {[minhaTurma.prof1_id, minhaTurma.prof2_id, minhaTurma.prof3_id].filter(Boolean).map(id => {
                                const p = db.membros.find(m => m.id === id);
                                return p ? <li key={id} className="flex items-center gap-2"><User size={14} className="text-emerald-500"/> {p.nome}</li> : null;
                            })}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-amber-500 shadow-sm"><Info size={32}/></div>
                    <h3 className="font-black text-xl text-amber-800 mb-2">Ainda não está matriculado(a)</h3>
                    <p className="text-sm text-amber-700 font-medium max-w-md">Não encontrámos o seu nome numa turma activa. Procure a secretaria para realizar a matrícula. No entanto, pode aceder ao estudo livre interativo abaixo.</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><List size={18} className="text-emerald-500"/> {minhaTurma ? 'Últimas Lições Ministradas' : 'Biblioteca de Lições (Estudo Livre)'}</h4>
                {loadingList ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100/70 transition-all">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm animate-pulse">
                                        <BookOpen size={20} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="h-5 w-2/3 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                                    <div className="h-8 w-24 bg-slate-150 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : licoesDisponiveis.length > 0 ? (
                    <div className="space-y-4">
                        {licoesDisponiveis.map((l, i) => {
                            const isCached = downloadedLessons.includes(l.id || l.licao_numero);
                            const isDownloading = downloadingIds.includes(l.id || l.licao_numero);
                            const manualOrMagazineCapa = l.capa && l.capa !== 'null' ? l.capa : ((db.ebd?.licoes || []).find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null')?.capa || null);
                            
                            return (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-16 bg-slate-50 text-slate-500 group-hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-all shrink-0 border border-slate-200 group-hover:border-emerald-200 shadow-sm overflow-hidden">
                                            {manualOrMagazineCapa ? (
                                                <CachedImage src={manualOrMagazineCapa} cacheKey={`ebd_capa_${l.revista}`} className="w-full h-full object-cover" alt="Capa" />
                                            ) : (
                                                <BookOpen size={20} className="group-hover:text-emerald-600 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-200 truncate max-w-full">
                                                    Lição: {l.licao_numero || '#'}
                                                </span>
                                                {isCached && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-emerald-50 border border-emerald-200 text-emerald-600 rounded">
                                                        <Check size={8} /> DISPONÍVEL OFFLINE
                                                    </span>
                                                )}
                                                {l.conteudo_estudo && !isCached && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-teal-50 border border-teal-200 text-teal-600 rounded animate-pulse">
                                                        <Check size={8} /> ESTUDO COMPARTILHADO
                                                    </span>
                                                )}
                                                {isLicaoNova(l) && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-amber-500 text-white rounded border border-amber-600/15 shadow-2xs animate-pulse">
                                                        <Sparkles size={8} className="text-white fill-white" /> NOVO
                                                    </span>
                                                )}
                                            </div>
                                            <h5 className="font-bold text-slate-800 truncate" title={l.revista}>{l.revista}</h5>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium"><Calendar size={12} className="inline mr-1"/> {formatDateLocal(l.data)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        {!isCached && isOnline && (
                                            <button 
                                                onClick={(e) => handleDownloadForOffline(l, e)}
                                                disabled={isDownloading}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/30 cursor-pointer transition-colors shadow-2xs"
                                                title="Pré-carregar lição para leitura sem internet"
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <Loader2 size={13} className="animate-spin" /> Baixando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download size={13} /> Pré-carregar
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {isCached && (
                                            <button 
                                                onClick={(e) => handleDeleteOfflineCache(l, e)}
                                                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 bg-white cursor-pointer transition-colors shadow-2xs"
                                                title="Excluir lição offline do aparelho"
                                            >
                                                <Trash2 size={13} /> Excluir
                                            </button>
                                        )}
                                        <button onClick={() => handleGenerateLessonPlan(l)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                                            <BookOpenText size={16}/> Estudar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">Nenhuma lição registada no sistema ainda.</p>
                )}
            </div>

            {/* AI Lesson Modal - Estudo Interativo Portal Membro */}
            {aiLesson && createPortal(
                <InteractiveWindow
                    id="member_portal_ebd_study"
                    title={aiLesson.title}
                    subtitle={`EBD Inteligente • Estudar com IA ${aiLesson.fromCache ? '• Leitura Offline' : ''}`}
                    onClose={() => { setAiLesson(null); setIsEbdFullscreen(false); }}
                    icon={BookOpen}
                    headerBg="from-emerald-600 via-teal-700 to-slate-950"
                    defaultWidth={1000}
                    defaultHeight={750}
                    footer={
                        <>
                            {!aiLesson.loading && (
                                <Button 
                                    onClick={() => { 
                                        navigator.clipboard.writeText(aiLesson.text); 
                                        addToast("Conteúdo copiado para a área de transferência!", "success"); 
                                    }} 
                                    variant="secondary" 
                                    className="shadow-sm border-slate-300 cursor-pointer"
                                >
                                    <Copy size={18} className="mr-1.5"/> Copiar Estudo Completo
                                </Button>
                            )}
                            <Button 
                                onClick={async () => { 
                                    try {
                                        const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
                                        const currentEstudos = currentUserProfile.estudos_ebd_concluidos || [];
                                        const currentMonthStr = new Date().toISOString().slice(0, 7);
                                        
                                        // Regista a conclusão do estudo no banco de dados para garantir a gremiação
                                        if (!currentEstudos.some(e => e.mes === currentMonthStr && e.licao === aiLesson.licao)) {
                                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), {
                                                estudos_ebd_concluidos: [...currentEstudos, { mes: currentMonthStr, licao: aiLesson.licao, data: new Date().toISOString() }]
                                            }, { merge: true });
                                            addToast("Parabéns! Estudo EBD concluído e registado nas suas conquistas deste mês.", "success");
                                        }
                                    } catch(err) {
                                        console.error(err);
                                    }
                                    setAiLesson(null); 
                                    setIsEbdFullscreen(false);
                                }} 
                                variant="success" 
                                className="shadow-emerald-500/30 px-8 cursor-pointer"
                            >
                                Concluir Estudo
                            </Button>
                        </>
                    }
                >
                    {aiLesson.loading ? (
                        <div className="flex flex-col items-center justify-center text-emerald-600 min-h-[450px]">
                            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                            <p className="font-black text-base animate-pulse mb-1 animate-duration-1500">Buscando na biblioteca teológica...</p>
                            <p className="text-xs font-medium text-slate-500 text-center">A preparar o texto áureo e a explicação dos tópicos.</p>
                        </div>
                    ) : (
                        <div className="-m-6 sm:-m-8">
                            <InteractiveMagazineView 
                                lessonText={aiLesson.text}
                                revista={aiLesson.revista}
                                licaoNum={aiLesson.licao}
                                capaUrl={aiLesson.capa}
                            />
                        </div>
                    )}
                </InteractiveWindow>,
                document.body
            )}
        </div>
    );
};

const PortalCursos = ({ user }) => {
    const { db, setPrintMode, setPrintData, setPreviewOpen, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext); // Adicionado para impressão e salvamento
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [completedModules, setCompletedModules] = useState([]); // NOVO: Rastreio de progresso

    useEffect(() => {
        const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
        if (currentUserProfile && currentUserProfile.modulos_concluidos) {
            setCompletedModules(currentUserProfile.modulos_concluidos);
        }
    }, [db.membros, user]);

    // Banco de Dados Local dos Cursos de Capacitação
    const COURSES = IMPORTED_COURSES;

    const resetModule = () => {
        setQuizMode(false);
        setQuizAnswers({});
        setQuizResult(null);
    };

    // NOVO: Função para abrir o módulo e embaralhar o quiz automaticamente
    const handleSelectModule = (mod) => {
        // 1. Criar cópia profunda para não alterar a constante original do curso
        const modCopy = JSON.parse(JSON.stringify(mod));

        // 2. Algoritmo de embaralhamento rápido e eficiente (Fisher-Yates)
        const shuffle = (arr) => {
            let m = arr.length, t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = arr[m];
                arr[m] = arr[i];
                arr[i] = t;
            }
            return arr;
        };

        // 3. Embaralhar a ordem das perguntas do módulo
        modCopy.questions = shuffle(modCopy.questions);

        // 4. Embaralhar a ordem das opções de resposta dentro de cada pergunta
        modCopy.questions.forEach(q => {
            const correctAnswerText = q.options[q.answer]; // Guardar o texto da resposta correta original
            q.options = shuffle([...q.options]); // Embaralhar as opções
            q.answer = q.options.indexOf(correctAnswerText); // Atualizar o sistema com o novo índice da resposta correta
        });

        setSelectedModule(modCopy);
    };

    const handleAnswer = (questionIdx, optionIdx) => {
        setQuizAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
    };

    const submitQuiz = async () => {
        let score = 0;
        selectedModule.questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) score++;
        });
        const percentage = Math.round((score / selectedModule.questions.length) * 100);
        setQuizResult({ score, total: selectedModule.questions.length, percentage });

        // NOVO: Adiciona o módulo aos concluídos se o membro atingir 70% ou mais
        if (percentage >= 70) {
            const newCompletedModules = [...completedModules, selectedModule.id];
            if (!completedModules.includes(selectedModule.id)) {
                setCompletedModules(newCompletedModules);
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), { modulos_concluidos: newCompletedModules }, { merge: true });
                } catch(e) {
                    console.error("Erro ao salvar progresso do módulo", e);
                }
            }

            // Verifica se o curso foi totalmente concluído
            const allModulesIds = selectedCourse.modules.map(m => m.id);
            const isCourseFullyCompleted = allModulesIds.every(id => newCompletedModules.includes(id));

            if (isCourseFullyCompleted) {
                try {
                    const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
                    const currentCursos = currentUserProfile.cursos_concluidos || [];
                    const currentMonthStr = new Date().toISOString().slice(0, 7);
                    
                    const alreadySaved = currentCursos.find(c => c.id === selectedCourse.id && c.mes === currentMonthStr);
                    
                    if (!alreadySaved) {
                        const updatedCursos = [...currentCursos, { id: selectedCourse.id, title: selectedCourse.title, mes: currentMonthStr }];
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), { cursos_concluidos: updatedCursos }, { merge: true });
                        addToast(`Conquista Desbloqueada: Troféu de ${selectedCourse.title} adicionado!`, "success");
                    }
                } catch (err) {
                    console.error("Erro ao salvar curso", err);
                }
            }
        }
    };

    return (
        <div className="space-y-6 animate-entrance">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <GraduationCap size={28} className="text-indigo-500"/> Academia de Crescimento
                </h2>
                {(selectedCourse || selectedModule) && (
                    <button 
                        onClick={() => {
                            if (quizResult || quizMode) { resetModule(); setSelectedModule(null); }
                            else if (selectedModule) { setSelectedModule(null); }
                            else { setSelectedCourse(null); }
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors"
                    >
                        <ChevronLeft size={16}/> Voltar
                    </button>
                )}
            </div>

            {/* VISTA 1: LISTA DE CURSOS */}
            {!selectedCourse && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COURSES.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-indigo-300 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <course.icon size={28}/>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{course.badge}</span>
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1 leading-relaxed">{course.description}</p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Layers size={14}/> {course.modules.length} Módulos</span>
                                <Button onClick={() => setSelectedCourse(course)} variant="primary" className="py-2 px-4 text-xs shadow-md shadow-indigo-500/20">Acessar Curso</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VISTA 2: LISTA DE MÓDULOS DO CURSO */}
            {selectedCourse && !selectedModule && (() => {
                const completedCount = selectedCourse.modules.filter(m => completedModules.includes(m.id)).length;
                const progressPerc = Math.round((completedCount / selectedCourse.modules.length) * 100);

                return (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2">{selectedCourse.title}</h2>
                            <p className="text-indigo-100 font-medium max-w-2xl">{selectedCourse.description}</p>
                            
                            {/* NOVO: BARRA DE PROGRESSO DO CURSO */}
                            <div className="mt-6">
                                <div className="flex justify-between text-xs font-bold text-indigo-100 mb-1.5">
                                    <span className="uppercase tracking-widest flex items-center gap-1"><Activity size={14}/> Progresso do Curso</span>
                                    <span>{progressPerc}% ({completedCount}/{selectedCourse.modules.length})</span>
                                </div>
                                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                    <div className="h-full bg-emerald-400 transition-all duration-1000 relative overflow-hidden" style={{width: `${progressPerc}%`}}>
                                        <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ animation: 'slideRight 2s infinite linear' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOVO: BANNER DE EMISSÃO DE CERTIFICADO */}
                    {progressPerc === 100 && (
                        <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex flex-col md:flex-row items-center gap-6 justify-between animate-entrance">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white shrink-0 ring-4 ring-emerald-100">
                                    <Award size={28}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-emerald-800 tracking-tight">Curso Concluído com Sucesso!</h4>
                                    <p className="text-sm text-emerald-600 font-medium mt-0.5">Parabéns! Você finalizou todos os módulos e foi aprovado(a).</p>
                                </div>
                            </div>
                            <Button onClick={() => {
                                setPrintData({ igreja: db.igreja, membro: user, extra: { nome_curso: selectedCourse.title, curso: selectedCourse.title } });
                                setPrintMode('cert_curso');
                                setPreviewOpen(true);
                            }} variant="success" className="shadow-emerald-500/30 w-full md:w-auto px-6 py-4">
                                <Printer size={20}/> Emitir Certificado Oficial
                            </Button>
                        </div>
                    )}

                    <div className="p-6">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><List size={18} className="text-indigo-500"/> Conteúdo do Curso</h4>
                        <div className="space-y-4">
                            {selectedCourse.modules.map((mod, idx) => {
                                const isCompleted = completedModules.includes(mod.id);
                                return (
                                <button 
                                    key={mod.id} 
                                    onClick={() => handleSelectModule(mod)} 
                                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${isCompleted ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors shrink-0 ${isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                            {isCompleted ? <Check size={20} strokeWidth={3}/> : idx + 1}
                                        </div>
                                        <div>
                                            <h5 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-emerald-800' : 'text-slate-800 group-hover:text-indigo-700'}`}>{mod.title}</h5>
                                            <p className={`text-xs flex items-center gap-2 mt-1 ${isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                                                <BookOpen size={12}/> Material • <CheckSquare size={12}/> {mod.questions.length} Questões {isCompleted && '• Aprovado'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={isCompleted ? 'text-emerald-400' : 'text-slate-300 group-hover:text-indigo-500 transition-colors'}/>
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* VISTA 3 e 4: ESTUDO E QUIZ */}
            {selectedModule && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{selectedModule.title}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${quizMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {quizMode ? 'Questionário (Quiz)' : 'Material de Estudo'}
                        </span>
                    </div>

                    {!quizMode ? (
                        /* VISTA 3: TEXTO DE ESTUDO */
                        <div className="p-6 md:p-10">
                            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap mb-10 prose-headings:text-indigo-900 prose-headings:font-black prose-strong:text-indigo-700">
                                {selectedModule.content}
                            </div>
                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button onClick={() => setQuizMode(true)} variant="primary" className="py-4 px-8 text-lg shadow-lg shadow-indigo-500/30 w-full sm:w-auto flex items-center justify-center gap-2">
                                    <CheckSquare size={20}/> Fazer o Teste de Conhecimento
                                </Button>
                            </div>
                        </div>
                    ) : !quizResult ? (
                        /* VISTA 4: MODO QUIZ (PERGUNTAS) */
                        <div className="p-6 md:p-10 space-y-8 bg-slate-50/30">
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mb-6">
                                <Info size={20} className="text-amber-500 mt-0.5 shrink-0"/>
                                <p className="text-sm text-amber-800 font-medium leading-relaxed">Responda às questões abaixo com base no estudo que acabou de ler. É necessário acertar para fixar o aprendizado.</p>
                            </div>
                            
                            {selectedModule.questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 text-base mb-4">
                                        <span className="text-indigo-500 mr-2">{qIdx + 1}.</span> {q.q}
                                    </h4>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = quizAnswers[qIdx] === oIdx;
                                            return (
                                                <label 
                                                    key={oIdx} 
                                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name={`q_${qIdx}`} 
                                                        className="hidden" 
                                                        checked={isSelected} 
                                                        onChange={() => handleAnswer(qIdx, oIdx)}
                                                    />
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6">
                                <Button 
                                    onClick={submitQuiz} 
                                    disabled={Object.keys(quizAnswers).length !== selectedModule.questions.length} 
                                    variant="success" 
                                    className="w-full py-4 text-lg shadow-lg shadow-emerald-500/30"
                                >
                                    Enviar Respostas e Ver Resultado
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* VISTA 5: RESULTADO DO QUIZ */
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            {quizResult.percentage >= 70 ? (
                                <>
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-emerald-50">
                                        <Award size={48} className="text-emerald-500"/>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2">Parabéns!</h3>
                                    <p className="text-lg text-slate-600 font-medium mb-6">Você concluiu o módulo com excelência.</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-amber-50">
                                        <Activity size={48} className="text-amber-500"/>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2">Quase lá!</h3>
                                    <p className="text-lg text-slate-600 font-medium mb-6">Recomendamos ler o material novamente para fixar melhor a doutrina.</p>
                                </>
                            )}
                            
                            <div className="flex gap-8 mb-10">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acertos</p>
                                    <p className="text-4xl font-black text-indigo-600">{quizResult.score} <span className="text-xl text-slate-300">/ {quizResult.total}</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aproveitamento</p>
                                    <p className={`text-4xl font-black ${quizResult.percentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{quizResult.percentage}%</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {quizResult.percentage < 100 && (
                                    <Button onClick={() => { setQuizMode(false); setQuizAnswers({}); setQuizResult(null); }} variant="ghost" className="border border-slate-200">
                                        <RotateCcw size={18}/> Refazer Módulo
                                    </Button>
                                )}
                                <Button onClick={() => { resetModule(); setSelectedModule(null); }} variant="primary" className="shadow-md">
                                    <List size={18}/> Voltar aos Módulos
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PortalMural = ({ user, db }) => {
    const { addToast, dbFirestore, appId, collection, addDoc, setDoc, doc, deleteDoc } = useContext(ChurchContext);
    const [novoPost, setNovoPost] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const posts = (db.mural || []).sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime());

    const handlePost = async () => {
        if (!novoPost.trim()) return addToast("Escreva algo antes de publicar.", "warning");
        setIsSaving(true);
        try {
            const post = {
                tipo: 'oracao',
                texto: novoPost,
                autor_id: user?.id || 'membro_anonimo',
                autor_nome: user?.nome || 'Membro do Portal',
                autor_foto: user?.foto || null,
                data: new Date().toISOString(),
                oradores: [] 
            };
            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural'), post);
            addToast("Publicado com sucesso!", "success");
            setNovoPost('');
        } catch (e) {
            addToast("Erro ao publicar.", "error");
        }
        setIsSaving(false);
    };

    const handleTogglePray = async (post) => {
        try {
            const oradores = post.oradores || [];
            const userId = user?.id || '';
            if (!userId) return;
            const isPraying = oradores.includes(userId);
            const novosOradores = isPraying ? oradores.filter(id => id !== userId) : [...oradores, userId];
            
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural', post.id), { oradores: novosOradores }, { merge: true });
        } catch(e) {
            addToast("Erro ao interagir.", "error");
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Deseja apagar esta publicação?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural', id));
            addToast("Publicação apagada.", "success");
        } catch(e) {
            addToast("Erro ao apagar.", "error");
        }
    };

    return (
        <div className="space-y-6 animate-entrance pb-10 max-w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 shadow-sm"><Heart size={28}/></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mural de Oração</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Compartilhe seus pedidos com a igreja</p>
                </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden border border-slate-200 shadow-inner">
                        {user?.foto ? <img src={user.foto} className="w-full h-full object-cover" /> : (user?.nome ? user.nome.charAt(0) : '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <textarea 
                            value={novoPost}
                            onChange={e => setNovoPost((e.target.value || "").toUpperCase())}
                            placeholder="Partilhe um pedido de oração com a igreja..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none resize-none min-h-[100px] mb-3 text-slate-800"
                        ></textarea>
                        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                            <Button onClick={handlePost} disabled={isSaving || !novoPost.trim()} variant="danger" className="py-2.5 px-6 shadow-md text-xs w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 size={16} className="animate-spin"/> : <SendIcon size={16}/>} Publicar Pedido
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => {
                        const oradores = post.oradores || [];
                        const isPraying = user?.id ? oradores.includes(user.id) : false;
                        
                        // Formatação ultra defensiva de data
                        let dataFormatada = 'Data Indefinida';
                        try {
                            if (post.data) {
                                const parsedDate = new Date(post.data);
                                if (!isNaN(parsedDate.getTime())) {
                                    dataFormatada = parsedDate.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                                }
                            }
                        } catch (err) {
                            console.warn("Erro ao formatar data de postagem:", err);
                        }

                        return (
                            <div key={post.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 transition-all hover:border-slate-300 flex flex-col justify-between overflow-hidden">
                                <div>
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden border border-slate-200 shadow-inner">
                                                {post.autor_foto ? <img src={post.autor_foto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : (post.autor_nome ? post.autor_nome.charAt(0) : '?')}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-800 leading-tight mb-0.5 truncate">{post.autor_nome || 'Membro do Portal'}</p>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-2">
                                                    <p className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{dataFormatada}</p>
                                                    <span className="text-slate-300 hidden sm:inline">•</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-2xs bg-rose-50 text-rose-600 border-rose-200 whitespace-nowrap">
                                                        Pedido de Oração
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {post.autor_id === user?.id && (
                                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer">
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm md:text-base text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 font-medium break-words">
                                        {post.texto}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-4">
                                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                                        <button 
                                            onClick={() => handleTogglePray(post)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border shadow-2xs cursor-pointer select-none shrink-0 ${isPraying ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <Heart size={14} className={isPraying ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-400'}/>
                                            {isPraying ? 'Estou orando' : 'Orar por isto'}
                                        </button>
                                        {oradores.length > 0 && (
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100 shrink-0">
                                                {oradores.length} {oradores.length === 1 ? 'oração' : 'orações'}
                                            </span>
                                        )}
                                    </div>
                                    {!isPraying && (
                                        <span className="text-[10px] text-slate-400 hidden lg:block italic">Clique para apoiar.</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Heart size={48} className="mx-auto text-slate-200 mb-4"/>
                    <h4 className="text-xl font-bold text-slate-600 mb-1">Mural Vazio</h4>
                    <p className="text-sm text-slate-500">Seja o primeiro a partilhar um pedido de oração com os irmãos.</p>
                </div>
            )}
        </div>
    );
};

const WebPushNotificationTrigger = () => {
    const [permissionStatus, setPermissionStatus] = useState('default');
    const { addToast } = useContext(ChurchContext);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            addToast("Notificações de sistema não são suportadas neste navegador.", "warning");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission === 'granted') {
                addToast("🔔 Notificações ativadas com sucesso! Você receberá avisos na barra do seu celular/sistema.", "success");
                playNotificationSound();
                new Notification("GIPP Conectado!", {
                    body: "Você ativou com sucesso as notificações do Portal de Membros no seu dispositivo.",
                    icon: "https://cdn-icons-png.flaticon.com/512/3223/3223605.png"
                });
            } else if (permission === 'denied') {
                addToast("Permissão negada. Ative as notificações manualmente nas configurações do seu navegador.", "error");
            }
        } catch (error) {
            console.error("Erro ao solicitar permissão de notificações: ", error);
            addToast("Erro ao configurar notificações de sistema.", "error");
        }
    };

    if (permissionStatus === 'granted') {
        return (
            <div className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Notificações Ativas
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={requestPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 dark:hover:bg-indigo-950/80 border border-indigo-100 text-indigo-700 hover:text-indigo-800 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Receber alertas no celular/computador"
        >
            <Bell size={12} className="animate-bounce" />
            Ativar Alertas no Celular
        </button>
    );
};

const MemberPortalLayout = () => {
    const { view, setView, user, db, logout, handleLogoutRequest, setDoc, doc, dbFirestore, appId, addToast, osTheme } = useContext(ChurchContext);
    const [verificandoPix, setVerificandoPix] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const isThemeDark = osTheme === 'premium_black' || osTheme === 'msdos' || osTheme === 'dark';

    const handleVerificarPagamento = async () => {
        setVerificandoPix(true);
        setTimeout(async () => {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { 
                    licenca_status: 'ativo',
                    licenca_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 dias
                }, { merge: true });
                addToast("Pagamento Confirmado! Sistema Desbloqueado.", "success");
            } catch (err) {
                console.error(err);
                addToast("Erro ao processar ativação.", "error");
            } finally {
                setVerificandoPix(false);
            }
        }, 2500);
    };

    const isLicenseValid = () => {
        if (user?.id === 'dev') return true;
        if (db.igreja?.licenca_status === 'bloqueado') return false;
        const vencimento = db.igreja?.licenca_vencimento;
        if (vencimento) {
            const hoje = new Date().toISOString().split('T')[0];
            if (hoje > vencimento) return false;
        }
        return true;
    };

    if (!isLicenseValid()) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 md:p-12 relative overflow-hidden font-sans">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <ThemeBackground theme={osTheme} />
                </div>
                <div className="absolute top-6 right-6 z-[100] pointer-events-auto flex gap-3">
                    <OsThemeToggle variant="dark" />
                    <AnimBgToggle variant="dark" />
                    <ThemeToggle variant="dark" />
                    <FullScreenToggle variant="dark" />
                </div>
                <div className="relative z-10 w-full max-w-xl bg-white/15 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/25 p-8 flex flex-col items-center text-center">
                    <Lock size={56} className="text-rose-500 mb-4 animate-pulse" />
                    <h1 className="text-2xl md:text-3xl font-black mb-3 text-white">Sistema de Membros Bloqueado</h1>
                    <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed font-medium">
                        A licença de uso deste sistema expirou. Renove a sua assinatura via PIX abaixo para desbloquear o sistema automaticamente.
                    </p>
                    
                    <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl w-full mb-6">
                        <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 mb-4 w-fit mx-auto shadow-inner">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatePixPayload(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698', db.igreja?.saas_nome_desenvolvedor || 'PATRICK PESSOA', 'Rio de Janeiro'))}&color=0f172a&bgcolor=ffffff`} alt="PIX" className="w-32 h-32 object-contain"/>
                        </div>
                        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 mb-5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chave PIX Oficial</p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-black text-xs sm:text-sm text-slate-800 break-all">{db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'}</span>
                                <button onClick={() => { copyToClipboard(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'); addToast('Chave Copiada!', 'success'); }} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded-lg font-bold text-xs transition-colors shrink-0">Copiar</button>
                            </div>
                        </div>
                        
                        <button onClick={handleVerificarPagamento} disabled={verificandoPix} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
                            {verificandoPix ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18}/>}
                            {verificandoPix ? 'A verificar...' : 'Já Paguei (Liberar Acesso)'}
                        </button>
                    </div>

                    <button onClick={handleLogoutRequest} className="text-sm font-bold text-slate-400 hover:text-white transition-colors underline">
                        Sair da Conta (Fazer Logout)
                    </button>
                </div>
            </div>
        );
    }

    const getHeaderStyles = () => {
        if (osTheme === 'premium_black' || osTheme === 'msdos' || osTheme === 'dark') {
            return "bg-black/70 border-b border-white/10 text-white backdrop-blur-md";
        }
        if (osTheme === 'winxp') {
            return "bg-[#3d7bad]/70 border-b border-blue-400/30 text-white backdrop-blur-md";
        }
        if (osTheme === 'win95') {
            return "bg-[#008080]/70 border-b border-teal-900/30 text-white backdrop-blur-md";
        }
        return "bg-white/70 border-b border-slate-200/50 text-slate-800 backdrop-blur-md";
    };

    const getFooterStyles = () => {
        if (osTheme === 'premium_black' || osTheme === 'msdos' || osTheme === 'dark') {
            return "bg-black/70 border-t border-white/10 text-white/70 backdrop-blur-md";
        }
        if (osTheme === 'winxp') {
            return "bg-[#3d7bad]/70 border-t border-blue-450/40 text-white/80 backdrop-blur-md";
        }
        if (osTheme === 'win95') {
            return "bg-[#008080]/70 border-t border-teal-900/40 text-white/80 backdrop-blur-md";
        }
        return "bg-white/70 border-t border-slate-200/50 text-slate-500 backdrop-blur-md";
    };

    const getBottomSheetStyles = () => {
        if (osTheme === 'premium_black' || osTheme === 'msdos' || osTheme === 'dark') {
            return "bg-slate-900/70 text-white border-t border-white/10 backdrop-blur-md";
        }
        if (osTheme === 'winxp') {
            return "bg-[#1c5a93]/70 text-white border-t border-blue-400 backdrop-blur-md";
        }
        if (osTheme === 'win95') {
            return "bg-[#008080]/70 text-white border-t border-teal-300 backdrop-blur-md";
        }
        return "bg-white/70 text-slate-900 border-t border-slate-200 backdrop-blur-md";
    };

    const getBottomSheetTextStyles = () => {
        if (isThemeDark || osTheme === 'winxp' || osTheme === 'win95') {
            return {
                title: "text-white",
                sub: "text-slate-300",
                buttonActive: "bg-emerald-500 border-emerald-500 text-white",
                buttonInactive: "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            };
        }
        return {
            title: "text-slate-800",
            sub: "text-slate-400",
            buttonActive: "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/25",
            buttonInactive: "bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 text-slate-700"
        };
    };

    const getBottomNavItemStyles = (active, hoverColor) => {
        if (active) {
            if (isThemeDark || osTheme === 'winxp' || osTheme === 'win95') {
                return {
                    text: "text-emerald-300 font-extrabold",
                    iconBg: "bg-emerald-500/25 scale-110 shadow-sm",
                    icon: "text-emerald-300"
                };
            }
            return {
                text: "text-emerald-700 font-extrabold",
                iconBg: "bg-emerald-50 scale-110 shadow-xs",
                icon: "text-emerald-600"
            };
        } else {
            if (isThemeDark || osTheme === 'winxp' || osTheme === 'win95') {
                return {
                    text: "text-white/60 hover:text-white/95 font-medium",
                    iconBg: "bg-transparent hover:bg-white/5",
                    icon: `text-white/60 ${hoverColor}`
                };
            }
            return {
                text: "text-slate-400 hover:text-slate-600 font-medium",
                iconBg: "bg-transparent hover:bg-slate-50",
                icon: `text-slate-400 ${hoverColor}`
            };
        }
    };

    const portalPastorRolesStr = db.igreja?.portal_pastor_lideres_funcoes || ['PASTOR PRESIDENTE', 'PASTOR AUXILIAR'];
    const portalTesoureiroRolesStr = db.igreja?.portal_tesoureiro_lideres_funcoes || ['TESOUREIRO', 'CONTADOR', 'ADMINISTRADOR'];

    const isPastor = user?.cargo?.toLowerCase().includes('pastor') || 
                     user?.funcao?.toLowerCase().includes('pastor') || 
                     user?.nivel === 'master' || 
                     user?.nivel === 'pastor' ||
                     (user?.funcao_administrativa && portalPastorRolesStr.includes(user.funcao_administrativa.toUpperCase()));

    const isTesoureiro = user?.cargo?.toLowerCase().includes('tesour') || 
                          user?.funcao?.toLowerCase().includes('tesour') || 
                          user?.nivel === 'master' || 
                          user?.nivel === 'tesour' || 
                          (user?.funcao_administrativa && portalTesoureiroRolesStr.includes(user.funcao_administrativa.toUpperCase())) ||
                          (user?.permissoes && (user.permissoes.includes('access_fin_entradas') || user.permissoes.includes('access_fin_analise') || user.permissoes.includes('access_fin_cadastros'))) ||
                          (db.igreja?.tesoureiro1 && user?.nome && db.igreja.tesoureiro1.toLowerCase().trim() === user.nome.toLowerCase().trim()) || 
                          (db.igreja?.tesoureiro2 && user?.nome && db.igreja.tesoureiro2.toLowerCase().trim() === user.nome.toLowerCase().trim());

    const userFuncaoAdm = (user?.funcao_administrativa || 'NENHUMA').toUpperCase();
    const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
    const allowedModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];

    const baseNavItems = [
        { id: 'portal_home', icon: LayoutDashboard, label: 'Início', hoverColor: 'group-hover:text-blue-500' },
        { id: 'portal_mural', icon: MessageSquare, label: 'Mural', hoverColor: 'group-hover:text-rose-500' },
        { id: 'portal_informativo', icon: Newspaper, label: 'Informativo', hoverColor: 'group-hover:text-orange-500' },
        { id: 'portal_biblia', icon: BookOpen, label: 'Bíblia', hoverColor: 'group-hover:text-amber-500' },
        { id: 'portal_email', icon: Mail, label: 'Mensagens', hoverColor: 'group-hover:text-emerald-500' },
        { id: 'portal_agenda', icon: Calendar, label: 'Agenda', hoverColor: 'group-hover:text-indigo-500' },
        { id: 'portal_tarefas', icon: CheckSquare, label: 'Escalas', hoverColor: 'group-hover:text-rose-500' },
        { id: 'portal_financas', icon: DollarSign, label: 'Dízimos', hoverColor: 'group-hover:text-emerald-600' },
        { id: 'portal_ebd', icon: BookOpen, label: 'EBD', hoverColor: 'group-hover:text-blue-600' },
        { id: 'portal_cursos', icon: GraduationCap, label: 'Cursos', hoverColor: 'group-hover:text-purple-500' },
        { id: 'portal_frequencia', icon: UserCheck, label: 'Minhas Presenças', hoverColor: 'group-hover:text-teal-500' },
        { id: 'portal_salinha_kids', icon: Baby, label: 'Salinha Kids', hoverColor: 'group-hover:text-rose-450' },
        { id: 'portal_carteirinha', icon: QrCode, label: 'Cartão', hoverColor: 'group-hover:text-pink-500' },
    ];

    const filteredBaseNavItems = baseNavItems.filter(item => {
        if (item.id === 'portal_home') return true;
        return allowedModules.includes(item.id);
    });

    const navItems = [...filteredBaseNavItems];
    if (isPastor && allowedModules.includes('portal_pastor')) {
        navItems.push({ id: 'portal_pastor', icon: BookOpenText, label: 'Portal Pastor', hoverColor: 'group-hover:text-amber-500' });
    }
    if (isTesoureiro && allowedModules.includes('portal_tesoureiro')) {
        navItems.push({ id: 'portal_tesoureiro', icon: ShieldCheck, label: 'Portal Tesoureiro', hoverColor: 'group-hover:text-emerald-500' });
    }

    const mobileBottomItems: Array<{ id: string, icon: any, label: string, hoverColor: string }> = [
        { id: 'portal_home', icon: LayoutDashboard, label: 'Início', hoverColor: 'group-hover:text-blue-500' },
    ];

    if (allowedModules.includes('portal_financas')) {
        mobileBottomItems.push({ id: 'portal_financas', icon: DollarSign, label: 'Dízimos', hoverColor: 'group-hover:text-emerald-600' });
    }

    if (isPastor && allowedModules.includes('portal_pastor')) {
        mobileBottomItems.push({ id: 'portal_pastor', icon: BookOpenText, label: 'Pastor', hoverColor: 'group-hover:text-amber-500' });
    } else if (isTesoureiro && allowedModules.includes('portal_tesoureiro')) {
        mobileBottomItems.push({ id: 'portal_tesoureiro', icon: ShieldCheck, label: 'Tesoureiro', hoverColor: 'group-hover:text-emerald-500' });
    } else if (allowedModules.includes('portal_tarefas')) {
        mobileBottomItems.push({ id: 'portal_tarefas', icon: CheckSquare, label: 'Escalas', hoverColor: 'group-hover:text-rose-500' });
    } else if (filteredBaseNavItems.length > 1) {
        const fallbackItem = filteredBaseNavItems.find(x => x.id !== 'portal_home');
        if (fallbackItem) {
            mobileBottomItems.push({ id: fallbackItem.id, icon: fallbackItem.icon, label: fallbackItem.label.split(' ')[0], hoverColor: fallbackItem.hoverColor });
        }
    }

    mobileBottomItems.push({ id: 'portal_more', icon: Menu, label: 'Mais', hoverColor: 'group-hover:text-slate-500' });

    const renderView = () => {
        switch(view) {
            case 'portal_perfil': return <PortalPerfil user={user} db={db} setView={setView} />;
            case 'portal_mural': return <PortalMural user={user} db={db} />;
            case 'portal_biblia': return <ModuleBiblia />;
            case 'portal_email': return <ModuleEmailMember user={user} />;
            case 'portal_carteirinha': return <PortalCarteirinha user={user} igreja={db.igreja} />;
            case 'portal_pastor': return <ModulePortalPastor />;
            case 'portal_tesoureiro': return <ModulePortalTesoureiro />;
            case 'portal_financas': return <PortalFinanceiro user={user} db={db} isTesoureiro={isTesoureiro} />;
            case 'portal_ebd': return <PortalEBD user={user} db={db} />;
            case 'portal_frequencia': return <PortalFrequencia user={user} db={db} />;
            case 'portal_salinha_kids': return <ModuleSalinhaKids mode="portal" />;
            case 'portal_agenda': return <PortalAgenda user={user} db={db} />;
            case 'portal_tarefas': return <PortalTarefas user={user} db={db} />;
            case 'portal_cursos': return <PortalCursos user={user} />;
            case 'portal_informativo': return <ModuleBoletim />;
            default: return <PortalHome user={user} db={db} setView={setView} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row w-full overflow-hidden relative font-sans text-slate-900" style={{ height: '100dvh' }}>
            <div className="absolute inset-0 z-0 pointer-events-none">
                <ThemeBackground theme={osTheme} />
            </div>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 glass-modern h-full flex-col border-r border-slate-200/60 z-50 shrink-0">
                <div className="p-8 text-center border-b border-slate-200/60">
                     {db.igreja.logo ? <img src={db.igreja.logo} className="h-16 mx-auto object-contain mb-4 bg-white rounded-2xl shadow-sm p-2" /> : <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"><Building2 size={32}/></div>}
                     <h2 className="font-black text-lg text-slate-800 tracking-tight leading-tight">{db.igreja.nome}</h2>
                     <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 bg-emerald-50 py-1 px-3 rounded-full inline-block">Portal do Membro</p>
                </div>
                <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${view === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-[1.02]' : 'text-slate-500 hover:bg-emerald-50 hover:text-slate-800'}`}>
                            <item.icon size={20} className={`transition-transform duration-300 ${view === item.id ? 'text-white' : `${item.hoverColor} group-hover:scale-110`}`}/> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-200/60 shrink-0">
                    <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-xs">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">{user.nome.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.nome.split(' ')[0]}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                                {user.funcao_administrativa && user.funcao_administrativa !== 'NENHUMA' ? user.funcao_administrativa : (user.cargo || 'Membro')}
                            </p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition-colors"><LogOut size={20}/> Terminar Sessão</button>
                </div>
            </aside>

            {/* Mobile Header (Strict Flex Item - Fixado) */}
            <header className={`md:hidden shrink-0 backdrop-blur-md p-4 flex justify-between items-center shadow-sm z-40 transition-all duration-300 ${getHeaderStyles()}`}>
                <div className="flex items-center gap-3">
                    {db.igreja.logo ? <img src={db.igreja.logo} className="h-8 w-8 object-contain rounded-lg" /> : <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs"><Building2 size={16}/></div>}
                    <span className={`font-black text-sm tracking-tight truncate max-w-[150px] ${isThemeDark || osTheme === 'winxp' || osTheme === 'win95' ? 'text-white' : 'text-slate-800'}`}>{db.igreja.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                    <OsThemeToggle variant="mobile" />
                    <AnimBgToggle variant="mobile" />
                    <ThemeToggle variant="mobile" />
                    <NotificationCenter />
                    <FullScreenToggle variant="mobile" />
                    <button onClick={logout} className="text-rose-500 p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors"><LogOut size={18}/></button>
                </div>
            </header>

            {/* Main Content (Área Rolável) */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative z-10 pb-24 md:pb-16" style={{ height: 'calc(100vh - 4rem)' }}>
                <div className="max-w-[1800px] mx-auto">
                    {/* Desktop Header Panel */}
                    <header className="hidden md:flex justify-between items-center pb-6 border-b border-slate-200/40 mb-8 shrink-0 relative z-20">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                                Olá, {user.nome.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1.5">
                                Seja bem-vindo de volta ao portal da sua congregação.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <WebPushNotificationTrigger />
                            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700/60 mx-1" />
                            <OsThemeToggle />
                            <AnimBgToggle />
                            <ThemeToggle />
                            <NotificationCenter />
                            <FullScreenToggle />
                        </div>
                    </header>

                    {renderView()}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Strict Flex Item - Fixado no rodapé no mobile) */}
            <div className={`md:hidden shrink-0 border-t flex items-center justify-around z-45 h-20 px-2 select-none shadow-lg ${getBottomSheetStyles()}`}>
                {mobileBottomItems.map(item => {
                    const isActive = view === item.id || (item.id === 'portal_more' && showMoreMenu);
                    const styles = getBottomNavItemStyles(isActive, item.hoverColor);
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => {
                                if (item.id === 'portal_more') {
                                    setShowMoreMenu(!showMoreMenu);
                                } else {
                                    setView(item.id);
                                    setShowMoreMenu(false);
                                }
                            }}
                            className="flex flex-col items-center justify-center flex-1 h-full py-2 hover:bg-slate-100/10 transition-colors focus:outline-none relative"
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${styles.iconBg}`}>
                                <item.icon size={20} className={`transition-transform duration-300 ${styles.icon} ${isActive ? 'scale-110' : ''}`} />
                            </div>
                            <span className={`text-[9px] mt-1 font-bold leading-none select-none text-center ${styles.text}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile "More" Menu Modal */}
            {showMoreMenu && (
                <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex flex-col justify-end transition-opacity" onClick={() => setShowMoreMenu(false)}>
                    <div 
                        className={`w-full max-h-[85vh] rounded-t-[2rem] p-6 pb-12 overflow-y-auto animate-slide-up shadow-2xl border-t border-white/10 ${getBottomSheetStyles()}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1 bg-slate-300/40 rounded-full mx-auto mb-5" />
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-extrabold text-lg text-emerald-600 block dark:text-emerald-400">Outros Recursos</h3>
                            <button 
                                onClick={() => setShowMoreMenu(false)} 
                                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {navItems.map(item => {
                                const isSelected = view === item.id;
                                return (
                                    <button 
                                        key={item.id} 
                                        onClick={() => { setView(item.id); setShowMoreMenu(false); }} 
                                        className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all border ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-xs' : 'bg-slate-500/5 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-500/10'}`}
                                    >
                                        <item.icon size={22} className={isSelected ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} />
                                        <span className="text-[10px] font-bold text-center truncate w-full leading-tight">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-500/5 border border-slate-200/20">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold font-mono">{user.nome.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">{user.nome}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">
                                        {user.funcao_administrativa && user.funcao_administrativa !== 'NENHUMA' ? user.funcao_administrativa : (user.cargo || 'Membro')}
                                    </p>
                                </div>
                            </div>
                            <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20 transition-colors"><LogOut size={16}/> Terminar Sessão</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AppLayout = () => {
    const { view, setView, sidebarOpen, setSidebarOpen, user, db, logout, handleLogoutRequest, setDoc, doc, dbFirestore, appId, addToast, osTheme, hasPermission } = useContext(ChurchContext);
    const [verificandoPix, setVerificandoPix] = useState(false);

    const handleVerificarPagamento = async () => {
        setVerificandoPix(true);
        setTimeout(async () => {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { 
                    licenca_status: 'ativo',
                    licenca_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 dias
                }, { merge: true });
                addToast("Pagamento Confirmado! Painel Desbloqueado.", "success");
            } catch (err) {
                console.error(err);
                addToast("Erro ao processar ativação.", "error");
            } finally {
                setVerificandoPix(false);
            }
        }, 2500);
    };

    const isLicenseValid = () => {
        if (user?.id === 'dev') return true;
        if (db.igreja?.licenca_status === 'bloqueado') return false;
        const vencimento = db.igreja?.licenca_vencimento;
        if (vencimento) {
            const hoje = new Date().toISOString().split('T')[0];
            if (hoje > vencimento) return false;
        }
        return true;
    };

    if (!isLicenseValid()) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 md:p-12 relative overflow-hidden font-sans">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <ThemeBackground theme={osTheme} />
                </div>
                <div className="absolute top-6 right-6 z-[100] pointer-events-auto flex gap-3">
                    <OsThemeToggle variant="dark" />
                    <AnimBgToggle variant="dark" />
                    <ThemeToggle variant="dark" />
                    <FullScreenToggle variant="dark" />
                </div>
                <div className="relative z-10 w-full max-w-xl bg-white/15 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/25 p-8 flex flex-col items-center text-center">
                    <Lock size={56} className="text-rose-500 mb-4 animate-pulse" />
                    <h1 className="text-2xl md:text-3xl font-black mb-3 text-white">Painel Administrativo Bloqueado</h1>
                    <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed font-medium">
                        A licença de uso deste sistema expirou. Renove a sua assinatura via PIX abaixo para desbloquear o sistema automaticamente.
                    </p>
                    
                    <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl w-full mb-6">
                        <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 mb-4 w-fit mx-auto shadow-inner">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatePixPayload(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698', db.igreja?.saas_nome_desenvolvedor || 'PATRICK PESSOA', 'Rio de Janeiro'))}&color=0f172a&bgcolor=ffffff`} alt="PIX" className="w-32 h-32 object-contain"/>
                        </div>
                        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 mb-5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chave PIX Oficial</p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-black text-xs sm:text-sm text-slate-800 break-all">{db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'}</span>
                                <button onClick={() => { copyToClipboard(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'); addToast('Chave Copiada!', 'success'); }} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded-lg font-bold text-xs transition-colors shrink-0">Copiar</button>
                            </div>
                        </div>
                        
                        <button onClick={handleVerificarPagamento} disabled={verificandoPix} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
                            {verificandoPix ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18}/>}
                            {verificandoPix ? 'A verificar...' : 'Já Paguei (Liberar Acesso)'}
                        </button>
                    </div>

                    <button onClick={handleLogoutRequest} className="text-sm font-bold text-slate-400 hover:text-white transition-colors underline">
                        Sair da Conta (Fazer Logout)
                    </button>
                </div>
            </div>
        );
    }

    const MODULE_REGISTRY = {
        'dashboard': { component: DashboardModule, access: 'public' },
        'boletim': { component: ModuleBoletim, access: 'access_boletim' },
        'biblia': { component: ModuleBiblia, access: 'public' },
        'changelog': { component: ModuleChangelog, access: 'public' },
        'email_interno': { component: ModuleEmailAdmin, access: 'access_email' },
        'cad_igreja': { component: ModuleIgreja, access: 'access_igreja' },
        'cad_patrimonio': { component: ModulePatrimonio, access: 'access_patrimonio' },
        'cad_membro': { component: ModuleMembros, access: 'access_membros' },
        'cad_celula': { component: ModuleCelulas, access: 'access_celulas' },
        'visitantes': { component: ModuleVisitantes, access: 'access_visitantes' },
        'cad_usuario': { component: ModuleUsuarios, access: 'master' },
        'acessos_portal': { component: ModuleAcessosPortal, access: 'access_membros' },
        'cad_departamento': { component: ModuleMinisterios, access: 'access_ministerios' },
        'secretaria_integrada': { component: ModuleSecretariaIntegrada, access: 'access_sec_agenda' },
        'secretaria_certificados': { component: ModuleCertificados, access: 'access_sec_certificados' },
        'carteirinha_studio': { component: ModuleCarteirinha, access: 'access_sec_certificados' },
        'credencial_lote': { component: ModuleCredencial, access: 'access_sec_certificados' },
        'secretaria_ebd': { component: ModuleEBD, access: 'access_ebd' },
        'salinha_kids': { component: ModuleSalinhaKids, access: 'access_salinha_kids' },
        'gestao_cursos': { component: ModuleGestaoCursos, access: 'access_gestao_cursos' },
        'missoes_painel': { component: ModuleMissoes, access: 'access_missoes' },
        'rede_social': { component: ModuleRedeSocial, access: 'access_midia' },
        'relatorios': { component: ModuleRelatorios, access: 'access_sec_relatorios' },
        'assistente_ai': { component: ModuleAssistenteAI, access: 'access_ia' },
        'fin_entrada': { component: () => <ModuleFinanceiro initialTab={2} />, access: 'access_fin_entradas' },
        'fin_saida': { component: () => <ModuleFinanceiro initialTab={3} />, access: 'access_fin_saidas' },
        'fin_dre': { component: () => <ModuleFinanceiro initialTab={1} />, access: 'access_fin_analise' },
        'fin_conciliacao': { component: ModuleConciliacaoBancaria, access: 'access_fin_analise' },
        'fin_carnes': { component: ModuleCarnes, access: 'access_fin_carnes' },
        'fin_utilitarios': { component: ModuleUtilitarios, access: 'access_fin_cadastros' },
        'config_backup': { component: ModuleBackup, access: 'access_config_backup' },
        'auditoria': { component: ModuleAuditoria, access: 'access_auditoria' },
        'lixeira': { component: ModuleLixeira, access: 'access_lixeira' },
        'sobre': { component: ModuleSobre, access: 'public' },
        'manual': { component: ModuleManualUsuario, access: 'public' },
        'portal_pastor': { component: ModulePortalPastor, access: 'public' },
        'desenvolvedor': { component: ModuleDesenvolvedor, access: 'master' },
        'config_visual': { component: ModuleConfigVisual, access: 'access_config_visual' },
        'config_sistema': { component: ModuleConfiguracoesSistemas, access: 'access_config_sistema' },
        'suporte_dev': { component: ModuleDevSuporte, access: 'master' }
    };
    const CurrentModule = MODULE_REGISTRY[view]?.component || DashboardModule;
    const access = MODULE_REGISTRY[view]?.access || 'public';
    return (
        <div className="flex min-h-screen font-sans text-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <ThemeBackground theme={osTheme} />
            </div>
            <Sidebar view={view} setView={setView} open={sidebarOpen} setOpen={setSidebarOpen} user={user} />
            
            {/* Backdrop para fechar o menu lateral ao clicar fora, em ecrãs móveis */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-45 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto custom-scrollbar relative z-10">
                {/* Cabeçalho Flutuante com Central de Notificações e Botão do Menu Lateral */}
                <div className="sticky top-0 z-[60] flex justify-between md:justify-end items-center gap-3 mb-6 print:hidden">
                    {!sidebarOpen && (
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="md:hidden p-3 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/50 text-slate-700 hover:text-indigo-600 shadow-sm flex items-center justify-center transition-all"
                            title="Abrir Menu"
                        >
                            <Menu size={18} />
                        </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        <OsThemeToggle />
                        <AnimBgToggle />
                        <ThemeToggle />
                        <FullScreenToggle />
                        <NotificationCenter />
                    </div>
                </div>
                
                {(user?.usuario?.toLowerCase() === 'mary' && view !== 'suporte_dev' && view !== 'changelog' && view !== 'sobre') ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Lock size={64} className="text-rose-500 mb-8 animate-bounce"/>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-2">Acesso Inativo</h2>
                        <p className="text-sm text-slate-500 font-medium max-w-md">Este módulo está inativo para a conta de Assistente Virtual Mary.</p>
                    </div>
                ) : hasPermission(access) ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="max-w-[1800px] mx-auto pb-16"
                        >
                            <ErrorBoundary><CurrentModule /></ErrorBoundary>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Lock size={64} className="text-rose-500 mb-8"/>
                        <h2 className="text-4xl font-black text-slate-800">Acesso Restrito</h2>
                    </div>
                )}
            </main>
        </div>
    );
};

// Utility function to clear browser caches and service worker registrations
const clearBrowserAppCache = () => {
    try {
        // 1. Clear Cache Storage API used heavily by browsers & PWAs
        if ('caches' in window) {
            caches.keys().then((names) => {
                for (let name of names) {
                    caches.delete(name);
                }
            }).catch(() => {});
        }
        
        // 2. Unregister active service workers to bypass offline assets
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                    registration.unregister();
                }
            }).catch(() => {});
        }

        // 3. Clear sessionStorage
        try {
            sessionStorage.clear();
        } catch (e) {}

        console.log("GIPP OS Info: Caches do navegador e Service Worker limpos com sucesso para garantir arquivos atualizados.");
    } catch (err) {
        console.warn("GIPP Storage Error:", err);
    }
};

// --- TELA DE CARREGAMENTO (SPLASH SCREEN) PÓS-LOGIN ---
const SplashScreen = ({ onComplete, corTema = '#6366f1', themeBg = 'default', isDevMode = false, isMaryMode = false, saasSettings = {} as any }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(-1);

    useEffect(() => {
        // Sequência de logs simulando a carga dos módulos em 7 segundos
        const bootSequence = [
            { time: 500, text: "Inicializando núcleo do sistema..." },
            { time: 1800, text: "Conectando ao banco de dados Firestore..." },
            { time: 3000, text: "Carregando módulos de interface UI/UX..." },
            { time: 4200, text: "Verificando cadastro da instituição..." },
            { time: 5500, text: "Sincronizando animações gráficas..." },
            { time: 6500, text: "Inicialização concluída. Bem-vindo!" }
        ];

        const timeouts = bootSequence.map((log, index) => 
            setTimeout(() => {
                setStep(index);
            }, log.time)
        );

        // Dispara a animação da barra de progresso (via CSS transition)
        const progressTimer = setTimeout(() => setProgress(100), 100);

        // Finaliza o SplashScreen após exatos 7 segundos
        const finishTimer = setTimeout(onComplete, 7000); 

        return () => {
            timeouts.forEach(t => clearTimeout(t));
            clearTimeout(progressTimer);
            clearTimeout(finishTimer);
        };
    }, [onComplete]);

    const logsBase = [
        "Inicializando núcleo do sistema...",
        "Conectando ao banco de dados Firestore...",
        "Carregando módulos de interface UI/UX...",
        "Verificando cadastro da instituição...",
        "Sincronizando animações gráficas...",
        "Inicialização concluída. Bem-vindo!"
    ];

    return (
        <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-cover bg-center transition-opacity duration-1000 overflow-hidden"
             style={{ backgroundColor: themeBg === 'default' ? '#0f172a' : 'transparent' }}>
            
            {/* NOVO: Fundo Animado do Splash com base no Tema selecionado */}
            <ThemeBackground theme={themeBg} isSplash={true} />

            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-0"></div>

            <div className="relative z-10 flex flex-col items-center mt-[-10vh]">
                {/* Seis quadrados juntos (Estilo Windows 11) */}
                <div className="grid grid-cols-3 gap-1.5 mb-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={`boot-cube-${i}`}
                             className="w-14 h-14 shadow-lg animate-pulse"
                             style={{ backgroundColor: corTema, boxShadow: `0 0 20px ${corTema}80`, animationDelay: `${i * 0.15}s`, borderRadius: '2px' }}>
                        </div>
                    ))}
                </div>

                {/* Textos dinâmicos */}
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl animate-slide-up-fade" style={{ opacity: 0, animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                        Iniciando o GIPP.®
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-white/90 drop-shadow-lg animate-slide-up-fade mt-2" style={{ opacity: 0, animationDelay: '1s', animationFillMode: 'forwards' }}>
                        Sistema de Gestão de Igrejas
                    </h2>
                    <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider animate-slide-up-fade" style={{ opacity: 0, animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                        <span>{saasSettings?.saas_nome_sistema || "GIPP"}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{saasSettings?.saas_versao_sistema || "Versão 7.1.0"}</span>
                    </div>
                    <div className="mt-8 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 animate-slide-up-fade" style={{ opacity: 0, animationDelay: '1.5s', animationFillMode: 'forwards' }}>
                        <p className="text-sm md:text-base font-medium text-white/80 tracking-[0.2em] uppercase">
                            por {saasSettings?.saas_nome_desenvolvedor || "PATRICK PESSOA"}
                        </p>
                    </div>
                    {isDevMode && (
                        <div className="mt-6 px-5 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full animate-slide-up-fade backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ opacity: 0, animationDelay: '2s', animationFillMode: 'forwards' }}>
                            <span className="text-xs md:text-sm font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Code size={16} /> Modo Desenvolvedor
                            </span>
                        </div>
                    )}
                    {isMaryMode && (
                        <div className="mt-6 px-5 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full animate-slide-up-fade backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]" style={{ opacity: 0, animationDelay: '2s', animationFillMode: 'forwards' }}>
                            <span className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Sparkles size={16} className="animate-pulse" /> ASSISTENTE VIRTUAL MARY
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bloco de Inicialização do Sistema (Console & Barra de Progresso) */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-8 flex flex-col z-20">
                <div className="w-full space-y-2 mb-5 h-[110px] overflow-hidden flex flex-col justify-end">
                     {logsBase.slice(0, step + 1).map((text, index) => {
                         const isOk = index < step || step === logsBase.length - 1;
                         return (
                             <div key={`log-item-${index}`} className="flex justify-between items-center text-[10px] md:text-xs font-mono text-white/80 uppercase animate-slide-up-fade">
                                 <span>{text}</span>
                                 <span className={isOk ? 'text-emerald-400 font-bold' : 'text-amber-400 animate-pulse'}>[{isOk ? 'OK' : '...'}]</span>
                             </div>
                         );
                     })}
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10">
                    <div 
                        className="h-full transition-all ease-linear relative overflow-hidden"
                        style={{ width: `${progress}%`, transitionDuration: '6.8s', backgroundColor: corTema }}
                    >
                        <div className="absolute inset-0 bg-white/30 w-full h-full" style={{ animation: 'slideRight 1s infinite linear' }}></div>
                    </div>
                </div>
                <p className="text-[9px] text-white/50 uppercase tracking-[0.4em] mt-4 font-bold text-center drop-shadow-md">
                    Carregando Ambiente Visual
                </p>
            </div>
        </div>
    );
};

export default function App() {
  if (firebaseSetupError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] text-slate-300 p-8 text-center font-sans">
         <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-md border border-white/20 max-w-2xl shadow-2xl">
             <AlertTriangle size={64} className="mx-auto text-rose-500 mb-6" />
             <h1 className="text-3xl font-black text-white mb-4">Firebase Não Configurado!</h1>
             <p className="text-lg mb-6 leading-relaxed">O sistema parou de forma segura porque a chave do Firebase (<code className="text-rose-400 bg-rose-400/10 px-2 py-1 rounded">apiKey</code>) está inválida ou ainda contém o texto de exemplo.</p>
             <div className="bg-slate-900 p-6 rounded-xl text-left text-sm font-mono text-emerald-400 overflow-x-auto border border-slate-700">
                <p className="text-slate-500 mb-3">// Vá até à linha 68 do seu arquivo App.jsx e cole as suas chaves reais:</p>
                <p>const fallbackConfig = {'{'}</p>
                <p>  apiKey: <span className="text-white">"SUA_CHAVE_REAL_AQUI"</span>,</p>
                <p>  authDomain: <span className="text-white">"seu-projeto.firebaseapp.com"</span>,</p>
                <p>  // ...</p>
                <p>{'}'};</p>
             </div>
         </div>
      </div>
    );
  }

  const [user, setUser] = useState(null); 
  const [authUser, setAuthUser] = useState(null); 
  const [view, setView] = useState('login');
  const [loginMode, setLoginMode] = useState('admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [db, setDbState] = useState(() => {
      try {
          const cached = localStorage.getItem('gipp_portal_db_cache');
          if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && typeof parsed === 'object' && parsed.igreja) {
                  return parsed;
              }
          }
      } catch (err) {
          console.warn("Could not read local DB cache from localStorage:", err);
      }
      return MOCK_DB;
  });

  useEffect(() => {
      try {
          if (db && db !== MOCK_DB && db.igreja && db.igreja.nome !== "GIPP - GESTÃO DE IGREJA") {
              localStorage.setItem('gipp_portal_db_cache', JSON.stringify(db));
          }
      } catch (err) {
          console.warn("Could not sync DB state to localStorage cache:", err);
      }
  }, [db]);

  // FCM Messaging States
  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    return localStorage.getItem('gipp_fcm_token') || null;
  });
  const [fcmStatus, setFcmStatus] = useState<'unsubscribed' | 'subscribing' | 'subscribed' | 'failed'>(() => {
    return localStorage.getItem('gipp_fcm_token') ? 'subscribed' : 'unsubscribed';
  });
  const [fcmPermission, setFcmPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestFcmPermission = async () => {
    let activePublicKey = 'BKSGpAtTNnSHclTe4jk9TTOz4_RvpFBFIqJC-e-FvP5HsUaydyCHQqu2HNLjFnPrZ825u4ojE6j9K0Li9GzPj0s';
    try {
      setFcmStatus('subscribing');
      if (typeof window === 'undefined' || !('Notification' in window)) {
        throw new Error('Notificações não são suportadas por este navegador de internet.');
      }
      
      const permission = await Notification.requestPermission();
      setFcmPermission(permission);
      
      if (permission === 'granted') {
        // Enforce standard native web-push registration directly using server's stable public-key
        let fetchPublicKey = '';
        try {
          const keyRes = await fetch('/api/push/public-key');
          if (keyRes.ok) {
            const data = await keyRes.json();
            if (data && data.publicKey) {
              fetchPublicKey = data.publicKey;
              activePublicKey = data.publicKey;
            }
          }
        } catch (fetchErr) {
          console.warn("Could not fetch push public-key from server endpoints, fallback to local VAPID keys", fetchErr);
        }

        // Avoid hanging indefinitely on serviceWorker.ready via a Promise race
        let reg: ServiceWorkerRegistration;
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
          } catch (registerError) {
            console.warn("Inline register failed, using default registration", registerError);
          }
          const readyPromise = navigator.serviceWorker.ready;
          const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout de 3s esgotado ao aguardar o Service Worker.")), 3000)
          );
          reg = await Promise.race([readyPromise, timeoutPromise]);
        } else {
          throw new Error("Service Worker não está disponível.");
        }
        
        const urlBase64ToUint8Array = (base64String: string) => {
          const cleanString = base64String.trim().replace(/\"/g, '');
          if (cleanString.length < 50) {
            throw new Error(`Chave VAPID muito curta (${cleanString.length} chars).`);
          }
          const padding = '='.repeat((4 - (cleanString.length % 4)) % 4);
          const base64 = (cleanString + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(activePublicKey)
        });

        const subId = user?.id || 'anonymous_' + Math.random().toString(36).substring(2, 9);
        const subJson = sub.toJSON();

        const subRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions', subId);
        await setDoc(subRef, {
          id: subId,
          userId: user?.id || 'anonymous',
          userNome: user?.nome || 'Operador anônimo',
          userTipo: user?.tipo || 'membro',
          subscription: subJson,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        setFcmStatus('subscribed');
        setFcmToken(`LocalWebPush:${subId}`);
        localStorage.setItem('gipp_fcm_token', `LocalWebPush:${subId}`);
        addToast("🔔 Notificações por Web Push nativo ativas com sucesso!", "success");
      } else {
        setFcmStatus('failed');
        addToast("A permissão para receber alertas do sistema foi negada.", "warning");
      }
    } catch (err: any) {
      console.warn("Standard Web Push failed, trying FCM fallback...", err);
      try {
        const supported = await isSupported();
        const freshPermission = typeof window !== 'undefined' ? Notification.permission : 'default';
        if (supported && (freshPermission === 'granted' || fcmPermission === 'granted')) {
          const messaging = getMessaging(app);
          const token = await getToken(messaging, {
            vapidKey: activePublicKey
          });
          if (token) {
            setFcmToken(token);
            setFcmStatus('subscribed');
            localStorage.setItem('gipp_fcm_token', token);
            if (user) {
              const tokenRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'fcm_tokens', user.id);
              await setDoc(tokenRef, { 
                token, 
                userId: user.id, 
                userName: user.nome, 
                updatedAt: new Date().toISOString() 
              }, { merge: true });
            }
            addToast("Inscrição de Notificações Push FCM realizada! 🔔", "success");
            return;
          }
        }
      } catch (fcmErr: any) {
        console.warn("FCM Fallback failed as well:", fcmErr);
      }
      
      setFcmStatus('failed');
      addToast(`Falha ao registrar para Mensagens Push: ${err.message || err}`, "error");
    }
  };

  useEffect(() => {
    let unsubscribe: any = null;
    isSupported().then(supported => {
      if (supported && app) {
        try {
          const messaging = getMessaging(app);
          unsubscribe = onMessage(messaging, (payload) => {
            console.log('FCM Foreground: ', payload);
            if (payload.notification) {
              addToast(`📧 FCM: ${payload.notification.title} - ${payload.notification.body}`, "info");
              // Append to real notifications list so it appears in the NotificationCenter
              setDbState((prev: any) => {
                const updatedNotifs = [
                  {
                    id: `fcm_${Date.now()}`,
                    title: payload.notification?.title || 'Notificação Push',
                    desc: payload.notification?.body || '',
                    time: 'Agora',
                    icon: Bell,
                    color: 'indigo'
                  },
                  ...(prev.notifications || [])
                ];
                return { ...prev, notifications: updatedNotifs };
              });
            }
          });
        } catch (e) {
          console.warn("FCM Listener skipped in current environment context", e);
        }
      }
    }).catch(err => {
      console.warn("FCM was not loaded or is blocked in iframe", err);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [app]);

  // Sincroniza e auto-solicita canais push ao carregar o portal
  useEffect(() => {
    if (user && typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      
      // Sincroniza o status no Firestore para auditoria
      const syncPermissionStatus = async () => {
        try {
          const logRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'user_push_status', user.id);
          await setDoc(logRef, {
            userId: user.id,
            userNome: user.nome,
            userTipo: user.tipo || 'membro',
            permissionStatus: currentPermission,
            fcmToken: fcmToken,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn("[syncPermissionStatus failed]", err);
        }
      };
      
      syncPermissionStatus();

      // Solicita permissão se ainda estiver como 'default' para garantir que receba alertas
      if (currentPermission === 'default') {
        const timer = setTimeout(() => {
          requestFcmPermission();
        }, 4000); // 4 segundos de atraso para transição suave
        return () => clearTimeout(timer);
      }
    }
  }, [user, fcmToken]);

  const [clearedNotifications, setClearedNotifications] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('gipp_cleared_notifs') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gipp_cleared_notifs', JSON.stringify(clearedNotifications));
  }, [clearedNotifications]);

  const clearAllNotifications = (idsToClear: string[]) => {
    setClearedNotifications(prev => {
      const updated = Array.from(new Set([...prev, ...idsToClear]));
      return updated;
    });
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [printMode, setPrintMode] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false); 
  const [printPalette, setPrintPalette] = useState<'cinza' | 'azul' | 'verde'>('cinza');
  const [printMarginType, setPrintMarginType] = useState<'abnt' | 'moderada' | 'estreita'>('abnt');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printContentScale, setPrintContentScale] = useState<number>(100);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [firstAccessData, setFirstAccessData] = useState({ nome: '', data_nascimento: '', senha: '', confirmar: '' });
  const [firstAccessSuccessData, setFirstAccessSuccessData] = useState(null);
  const [backupState, setBackupState] = useState({ isOpen: false, mode: 'export', stage: 'initial', progress: 0, stats: null, fileData: null });
  const fileInputRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null); // NOVO ESTADO PARA INSTALAÇÃO
  const [showInstallGuide, setShowInstallGuide] = useState(false); // NOVO ESTADO PARA O MODAL DE GUIA
  const [installDeviceType, setInstallDeviceType] = useState<'smartphone' | 'desktop' | null>(null);
  const [installMobileOS, setInstallMobileOS] = useState<'ios' | 'android' | null>(null);
  const [installStep, setInstallStep] = useState<number>(1);
  const [isNotificationConfirmed, setIsNotificationConfirmed] = useState<boolean>(false);
  const [theme, setTheme] = useState(localStorage.getItem('gipp-theme') || 'light');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showFirstAccessDropdown, setShowFirstAccessDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // NOVO: Estado de conexão
  const [isSystemBooting, setIsSystemBooting] = useState(false); // NOVO: Controla a animação inicial antes de tudo
  const [osTheme, setOsTheme] = useState(localStorage.getItem('gipp-ostheme') || 'default'); // NOVO: Estado do Tema do Sistema
  const [animBgEnabled, setAnimBgEnabled] = useState(() => {
      const saved = localStorage.getItem('gipp-animbg-enabled');
      return saved !== 'false';
  });
  const [isMobileDevice, setIsMobileDevice] = useState(false); // NOVO: Identifica acesso por telemóvel

  const notifications = useMemo(() => {
    const notifs = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    today.setHours(0,0,0,0);

    if (user) {
        // 1. Mensagens / E-mails não lidos direcionados ao membro logado
        if (db.emails) {
            const unreadEmails = db.emails.filter((e: any) => 
                e.recipientId === user.id && 
                !e.deletedByRecipient && 
                !e.readByRecipient
            );
            unreadEmails.forEach((e: any) => {
                notifs.push({
                    id: `email_unread_${e.id}`,
                    type: 'info',
                    icon: Mail,
                    title: 'Nova Mensagem Recebida',
                    desc: `${e.senderName}: "${e.subject}"`,
                    time: 'Não lida',
                    color: 'emerald',
                    actionUrl: 'portal_email'
                });
            });
        }

        // 2. Confirmação de recebimento/lançamento de Dízimo ou Oferta pela tesouraria (últimos 7 dias)
        if (db.financeiro) {
            const memberLaunches = db.financeiro.filter((f: any) => 
                f.membro_id === user.id &&
                f.tipo === 'entrada'
            );
            memberLaunches.forEach((f: any) => {
                const fDateStr = f.data_competencia || f.data_pagamento;
                if (!fDateStr) return;
                const fDate = new Date(fDateStr.split('T')[0] + 'T00:00:00');
                const diffTime = today.getTime() - fDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 7) {
                    notifs.push({
                        id: `member_launch_${f.id}`,
                        type: 'success',
                        icon: DollarSign,
                        title: 'Dízimo/Oferta Confirmado',
                        desc: `Sua contribuição de R$ ${parseFloat(f.valor).toFixed(2)} foi processada e lançada com sucesso no sistema.`,
                        time: diffDays === 0 ? 'Hoje' : `Há ${diffDays} d`,
                        color: 'emerald',
                        actionUrl: 'portal_financas'
                    });
                }
            });
        }

        // 3. Novas postagens no Mural da Igreja (últimos 3 dias)
        if (db.mural) {
            db.mural.forEach((m: any) => {
                const postDateStr = m.data_postagem || m.data;
                if (!postDateStr) return;
                const mDateStr = postDateStr.split('T')[0];
                const mDate = new Date(mDateStr + 'T00:00:00');
                const diffTime = today.getTime() - mDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 3) {
                    if (m.autor_id === user.id) return; // ignora a própria postagem no mural
                    notifs.push({
                        id: `mural_post_${m.id}`,
                        type: 'info',
                        icon: MessageSquare,
                        title: 'Novo Aviso no Mural',
                        desc: `${m.autor_nome || 'Membro da Igreja'}: "${m.texto?.substring(0, 45)}..."`,
                        time: diffDays === 0 ? 'Hoje' : `Há ${diffDays} d`,
                        color: 'blue',
                        actionUrl: 'portal_mural'
                    });
                }
            });
        }
    }
    
    if (db.financeiro) {
        const despesas = db.financeiro.filter((f: any) => f.tipo === 'saida' && f.status === 'pendente');
        despesas.forEach((d: any) => {
            if (!d.data_vencimento) return;
            const vDate = new Date(d.data_vencimento + 'T00:00:00'); 
            const diffTime = vDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                notifs.push({ id: `desp_${d.id}`, type: 'danger', icon: AlertCircle, title: 'Despesa Vencida', desc: `R$ ${parseFloat(d.valor).toFixed(2)} - ${d.descricao}`, time: 'Vencida', color: 'rose' });
            } else if (diffDays <= 5) {
                notifs.push({ id: `desp_${d.id}`, type: 'warning', icon: DollarSign, title: 'Vencimento Próximo', desc: `R$ ${parseFloat(d.valor).toFixed(2)} - ${d.descricao}`, time: diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`, color: 'amber' });
            }
        });
    }

    if (db.membros) {
        const aniversariantes = db.membros.filter((m: any) => m.data_nascimento && parseInt(m.data_nascimento.split('-')[1]) - 1 === currentMonth);
        const hojeDia = today.getDate();
        aniversariantes.forEach((a: any) => {
             const diaNasc = parseInt(a.data_nascimento.split('-')[2]);
             if (diaNasc === hojeDia) {
                 notifs.push({ id: `aniv_${a.id}`, type: 'success', icon: Gift, title: 'Aniversante Hoje', desc: `${a.nome} faz anos hoje!`, time: 'Hoje', color: 'emerald' });
             } else if (diaNasc > hojeDia && diaNasc <= hojeDia + 5) {
                 notifs.push({ id: `aniv_${a.id}`, type: 'info', icon: Gift, title: 'Aniversário a Chegar', desc: `${a.nome}`, time: `Dia ${diaNasc}`, color: 'blue' });
             }
        });
    }
    
    if (db.tarefas) {
         const pendentes = db.tarefas.filter((t: any) => t.status !== 'Concluido');
         pendentes.forEach((t: any) => {
             if(!t.data) return;
             const tDate = new Date(t.data + 'T00:00:00');
             const diffTime = tDate.getTime() - today.getTime();
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             if (diffDays >= 0 && diffDays <= 3) {
                 notifs.push({ id: `tar_${t.id}`, type: 'primary', icon: CheckSquare, title: 'Tarefa Agendada', desc: t.descricao, time: diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`, color: 'indigo' });
             }

             // Escala específica do Membro Logado com notificações
             if (user) {
                 const isUserInEquipe = t.equipe?.some((eq: any) => 
                     (eq.id && eq.id === user.id) || 
                     (eq.nome && user.nome && eq.nome.toLowerCase().trim() === user.nome.toLowerCase().trim())
                 );
                 if (isUserInEquipe && diffDays >= 0 && diffDays <= 7) {
                     notifs.push({
                         id: `my_escala_${t.id}`,
                         type: 'primary',
                         icon: Calendar,
                         title: 'Lembrete: Sua Escala',
                         desc: `Você está escalado em: ${t.descricao} (Setor: ${t.categoria || 'Geral'})`,
                         time: diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`,
                         color: 'indigo'
                     });
                 }
             }
         });
    }

    if (db.agenda) {
         // Eventos agendados nos próximos 7 dias
         db.agenda.forEach((e: any) => {
             if (!e.data) return;
             const eDate = new Date(e.data + 'T00:00:00');
             const diffTime = eDate.getTime() - today.getTime();
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             if (diffDays >= 0 && diffDays <= 7) {
                 notifs.push({
                     id: `evt_${e.id}`,
                     type: 'info',
                     icon: Calendar,
                     title: 'Novo Evento da Igreja',
                     desc: `${e.titulo || e.nome || 'Atividade geral'} - ${e.horario || ''}`,
                     time: diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`,
                     color: 'purple'
                 });
             }
         });
    }

    if (db.kids_criancas && db.kids_ocorrencias && user) {
        const myKids = db.kids_criancas.filter((k: any) => k.responsavel_membro_id === user.id);
        const myKidsIds = myKids.map((k: any) => k.id);
        const myActiveKidsOccurrences = db.kids_ocorrencias.filter((o: any) => 
            myKidsIds.includes(o.crianca_id) && 
            o.gravidade === 'URGENTE' && 
            o.status !== 'resolvido'
        );
        myActiveKidsOccurrences.forEach((occ: any) => {
            const childNode = myKids.find((c: any) => c.id === occ.crianca_id);
            notifs.push({
                id: `kids_occ_${occ.id}`,
                type: 'danger',
                icon: AlertCircle,
                title: '🚨 Incidente Salinha Kids',
                desc: `${childNode?.nome || 'Criança'}: ${occ.titulo} - ${occ.descricao}`,
                time: 'Urgente',
                color: 'rose'
            });
        });
    }

    const isPastoral = user?.cargo?.toLowerCase().includes('pastor') || 
                       user?.funcao?.toLowerCase().includes('pastor') || 
                       (db.igreja?.pastor && user?.nome && db.igreja.pastor.toLowerCase().trim() === user.nome.toLowerCase().trim()) ||
                       user?.nivel === 'master' || 
                       user?.id === 'dev' ||
                       user?.cargo?.toLowerCase().includes('tesour') || 
                       user?.funcao?.toLowerCase().includes('tesour') || 
                       user?.nivel === 'tesour';

    if (isPastoral && db.membros && db.financeiro) {
        const mAtivos = db.membros.filter((m: any) => m.status !== 'Inativo');
        const dizimos = db.financeiro.filter((f: any) => 
            f.tipo === 'entrada' && 
            f.categoria?.toLowerCase().includes('dízimo') && 
            !(f.conciliado === false && String(f.descricao).includes('via Portal'))
        );

        mAtivos.forEach((membro: any) => {
            const dizimosMembro = dizimos.filter((d: any) => d.membro_id === membro.id)
                .sort((a: any, b: any) => new Date(b.data_competencia || b.data_pagamento || 0).getTime() - new Date(a.data_competencia || a.data_pagamento || 0).getTime());
            
            if (dizimosMembro.length > 0) {
                const ultimoDizimo = dizimosMembro[0];
                const dateClean = (ultimoDizimo.data_competencia || ultimoDizimo.data_pagamento || '').split('T')[0];
                if (dateClean) {
                    const dataUltimo = new Date(dateClean + 'T00:00:00');
                    const diffTime = today.getTime() - dataUltimo.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 90) {
                        const meses = Math.floor(diffDays / 30);
                        notifs.push({
                            id: `dizimo_recorrente_atrasado_${membro.id}`,
                            type: 'warning',
                            icon: HeartHandshake,
                            title: 'Apoio Pastoral: Dízimo Atrasado',
                            desc: `O dizimista ${membro.nome} está sem registro de dízimo há ${meses} meses. Considere um contato amável para suporte espiritual.`,
                            time: 'Apoio Pastoral',
                            color: 'amber'
                        });
                    }
                }
            }
        });
    }

    return notifs
        .filter(n => !clearedNotifications.includes(n.id))
        .sort((a, b) => {
            if (a.type === 'danger' && b.type !== 'danger') return -1;
            if (b.type === 'danger' && a.type !== 'danger') return 1;
            return 0;
        });
  }, [db, user, clearedNotifications]);

  const notifiedIdsRef = useRef<string[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const iconeOficial = db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png";
      notifications.forEach((notif: any) => {
        if (!notifiedIdsRef.current.includes(notif.id)) {
          try {
            // Tenta enviar via Service Worker (ideal para mobile, Android, iOS em homescreen, Windows PWA)
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(notif.title, {
                  body: notif.desc,
                  icon: iconeOficial,
                  badge: iconeOficial,
                  vibrate: [150, 80, 150],
                  tag: notif.id,
                  data: {
                    url: notif.actionUrl ? `/${notif.actionUrl}` : '/'
                  }
                } as any);
              }).catch(() => {
                // Fallback standard se o SW não estiver totalmente pronto
                new Notification(notif.title, {
                  body: notif.desc,
                  icon: iconeOficial,
                  badge: iconeOficial
                });
              });
            } else {
              // Fallback se SW não for suportado no browser
              new Notification(notif.title, {
                body: notif.desc,
                icon: iconeOficial,
                badge: iconeOficial
              });
            }

            notifiedIdsRef.current.push(notif.id);
            playNotificationSound();
          } catch (err) {
            console.warn("Could not display native browser notification: ", err);
          }
        }
      });
    }
  }, [notifications, db.igreja?.icone_sistema]);

  // NOVO: Detetar telemóvel e forçar Portal do Membro
  useEffect(() => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(mobileCheck);
      if (mobileCheck) {
          setLoginMode('membro');
      }
  }, []);

  // NOVO: Limpar cache ao inicializar o sistema para manter sempre atualizado
  useEffect(() => {
      clearBrowserAppCache();
  }, []);

  // NOVO: Sincronização automática das configurações padrão de impressão quando o modo muda
  useEffect(() => {
      if (printMode) {
          const isLnd = (printMode.startsWith('cert_') || printMode === 'carne_print' || printMode === 'carteirinha' || printMode === 'carteirinha_custom' || printMode === 'credenciais_lote');
          setPrintOrientation(isLnd ? 'landscape' : 'portrait');
          setPrintPalette('cinza');
          setPrintMarginType('abnt');
          setPrintContentScale(100);
      }
  }, [printMode]);

  // NOVO: Forçar o idioma para Português do Brasil e evitar traduções automáticas do navegador
  useEffect(() => {
      document.documentElement.lang = 'pt-BR';
      document.documentElement.setAttribute('translate', 'no');
      
      let metaTranslate = document.querySelector('meta[name="google"]') as HTMLMetaElement | null;
      if (!metaTranslate) {
          metaTranslate = document.createElement('meta');
          metaTranslate.name = 'google';
          metaTranslate.content = 'notranslate';
          document.head.appendChild(metaTranslate);
      }
  }, []);

  // NOVO: Atualiza dinamicamente o Favicon, Apple Touch Icon e Manifest PWA com o logotipo da igreja
  useEffect(() => {
      const logoUrl = db.igreja?.logo || "https://cdn-icons-png.flaticon.com/512/3223/3223605.png";
      const nomeIgreja = db.igreja?.nome || "GIPP - Gestão de Igreja";

      // 1. Atualizar Favicon e Apple Touch Icon em tempo real
      let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!linkIcon) {
          linkIcon = document.createElement('link');
          linkIcon.rel = 'icon';
          linkIcon.type = 'image/png';
          document.head.appendChild(linkIcon);
      }
      linkIcon.href = logoUrl;

      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (!appleIcon) {
          appleIcon = document.createElement('link');
          appleIcon.rel = 'apple-touch-icon';
          document.head.appendChild(appleIcon);
      }
      appleIcon.href = logoUrl;

      // 2. Criar e injetar um manifesto PWA dinâmico (Blob) para forçar a adoção do logotipo na instalação
      const manifestObj = {
          "name": nomeIgreja,
          "short_name": nomeIgreja.length > 12 ? nomeIgreja.substring(0, 10) + '..' : nomeIgreja,
          "start_url": window.location.origin + "/",
          "display": "standalone",
          "orientation": "any",
          "background_color": theme === 'dark' ? '#0f172a' : '#ffffff',
          "theme_color": theme === 'dark' ? '#0f172a' : '#1e293b',
          "description": "Sistema de Gestão Integrado para Igrejas e Pastores Digitais",
          "icons": [
              {
                  "src": logoUrl,
                  "sizes": "192x192",
                  "type": "image/png",
                  "purpose": "any maskable"
              },
              {
                  "src": logoUrl,
                  "sizes": "256x256",
                  "type": "image/png",
                  "purpose": "any maskable"
              },
              {
                  "src": logoUrl,
                  "sizes": "384x384",
                  "type": "image/png",
                  "purpose": "any"
              },
              {
                  "src": logoUrl,
                  "sizes": "512x512",
                  "type": "image/png",
                  "purpose": "any"
              }
          ]
      };

      const stringManifest = JSON.stringify(manifestObj);
      const blob = new Blob([stringManifest], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);

      let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
      if (!manifestLink) {
          manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;

      return () => {
          URL.revokeObjectURL(manifestUrl);
      };
  }, [db.igreja?.logo, db.igreja?.nome, theme]);

  useEffect(() => {
      localStorage.setItem('gipp-theme', theme);
      if (theme === 'dark') {
          document.body.classList.add('theme-dark');
          document.body.classList.remove('theme-light');
      } else {
          document.body.classList.add('theme-light');
          document.body.classList.remove('theme-dark');
      }
  }, [theme]);

  // NOVO: Efeito para aplicar o Tema OS no body
  useEffect(() => {
      localStorage.setItem('gipp-ostheme', osTheme);
      document.body.setAttribute('data-os-theme', osTheme);
  }, [osTheme]);

  useEffect(() => {
      localStorage.setItem('gipp-animbg-enabled', String(animBgEnabled));
  }, [animBgEnabled]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // --- ATALHOS GLOBAIS DE TECLADO ---
  useEffect(() => {
      const handleKeyDown = (e) => {
          // Ignorar se estiver digitando em inputs, textareas ou selects
          const activeNodeName = document.activeElement?.nodeName;
          if (activeNodeName === 'INPUT' || activeNodeName === 'TEXTAREA' || activeNodeName === 'SELECT' || document.activeElement?.getAttribute('contenteditable') === 'true') {
              return;
          }

          const k = e.key.toLowerCase();
          if (e.altKey) {
              if (k === 'd') {
                  e.preventDefault();
                  setView('dashboard');
                  addToast('Navegação rápida: Visão Geral (Dashboard) 📊', 'info');
              } else if (k === 'f') {
                  e.preventDefault();
                  setView('fin_entrada');
                  addToast('Navegação rápida: Módulo Financeiro 💰', 'info');
              } else if (k === 'm') {
                  e.preventDefault();
                  setView('cad_membro');
                  addToast('Navegação rápida: Cadastro de Membros 👥', 'info');
              } else if (k === 'c') {
                  e.preventDefault();
                  setView('cad_celula');
                  addToast('Navegação rápida: Células e Pequenos Grupos 🏡', 'info');
              } else if (k === 's') {
                  e.preventDefault();
                  setView('secretaria_integrada');
                  addToast('Navegação rápida: Secretaria & Agenda 📑', 'info');
              } else if (k === 'a') {
                  e.preventDefault();
                  setView('assistente_ai');
                  addToast('Navegação rápida: Assistente de Inteligência Artificial 🧠', 'info');
              } else if (k === 'b') {
                  e.preventDefault();
                  setView('boletim');
                  addToast('Navegação rápida: Boletim Informativo 📰', 'info');
              } else if (k === 'o') {
                  e.preventDefault();
                  setView('sobre');
                  addToast('Navegação rápida: Sobre o GIPP 🛡️', 'info');
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setView]);

  const logAction = async (action, details, itemType = '', itemId = '') => {
      if (!authUser) return;
      try {
          await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'auditoria_logs'), {
              usuario_id: user?.id || 'dev',
              usuario_nome: user?.nome || 'Sistema',
              acao: action,
              detalhes: details,
              tipo_item: itemType,
              item_id: itemId,
              data_hora: new Date().toISOString()
          });
      } catch (e) {
          console.error("Erro ao registar log de auditoria", e);
      }
  };

  const verses = useMemo(() => [
    { text: "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.", ref: "Colossenses 3:23" },
    { text: "O que as suas mãos tiverem que fazer, faça-o com toda a sua força.", ref: "Eclesiastes 9:10" },
    { text: "Portanto, meus amados irmãos, mantenham-se firmes. Sejam sempre dedicados à obra do Senhor.", ref: "1 Coríntios 15:58" },
    { text: "Onde há trabalho árduo há proveito, mas o só falar leva à pobreza.", ref: "Provérbios 14:23" },
    { text: "Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.", ref: "Provérbios 16:3" },
    { text: "Seja a graça do Senhor, nosso Deus, sobre nós; e confirma sobre nós a obra das nossas mãos.", ref: "Salmos 90:17" }
  ], []);

  const [loginVerse, setLoginVerse] = useState({ text: "", ref: "" });

  useEffect(() => {
      if (view === 'login') {
          const randomVerse = verses[Math.floor(Math.random() * verses.length)];
          setLoginVerse(randomVerse);
      }
  }, [view, verses]);

  // NOVO: Capturar o evento de instalação do navegador
  useEffect(() => {
      const handleBeforeInstallPrompt = (e) => {
          e.preventDefault();
          setInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const addToast = (message, type = 'info') => { 
      // Tocar som de notificação estilo Windows ao exibir a mensagem/toast (Inclui Emails e Alertas)
      playNotificationSound();
      
      const id = Date.now(); 
      setToasts(prev => [...prev, { id, message, type }]); 
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000); 
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // NOVO: Detetar queda ou retorno da ligação à Internet
  useEffect(() => {
      const handleOnline = () => {
          setIsOnline(true);
          addToast("Ligação restaurada! A sincronizar dados pendentes...", "success");
      };
      const handleOffline = () => {
          setIsOnline(false);
          addToast("Sem Internet. O Modo Offline foi ativado. Pode continuar a trabalhar!", "warning");
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  // --- MOTOR DE LEMBRETES LOCAIS DE TAREFAS/ESCALAS ---
  useEffect(() => {
      const checkLocalReminders = () => {
          try {
              const activeRemindersStr = localStorage.getItem('gipp_local_alarms');
              if (!activeRemindersStr) return;
              
              const activeReminders = JSON.parse(activeRemindersStr);
              let changed = false;
              const now = Date.now();
              
              const updatedReminders = activeReminders.map((alarm: any) => {
                  if (!alarm.triggered && alarm.targetTime <= now) {
                      // Disparar notificação nativa do browser em background
                      if (typeof window !== 'undefined' && 'Notification' in window) {
                          if (Notification.permission === 'granted') {
                              try {
                                  new Notification(`Lembrete GIPP: ${alarm.title}`, {
                                      body: alarm.body || 'Sua tarefa ou escala está programada para breve.',
                                      icon: db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
                                  });
                              } catch (e) {
                                  console.warn("Could not display native notification constructor:", e);
                              }
                          }
                      }
                      
                      // Adicionar aos Toasts visuais no GIPP
                      addToast(`Lembrete Ativo: ${alarm.title} - ${alarm.body || ''}`, 'info');
                      playNotificationSound();
                      
                      alarm.triggered = true;
                      changed = true;
                  }
                  return alarm;
              });
              
              if (changed) {
                  // Salva apenas os não-desparados ou com tag de status atualizado
                  localStorage.setItem('gipp_local_alarms', JSON.stringify(updatedReminders));
              }
          } catch (err) {
              console.warn("Local Alarms check error:", err);
          }
      };

      // Executa inicialmente e a cada 20 segundos
      checkLocalReminders();
      const interval = setInterval(checkLocalReminders, 20000);
      return () => clearInterval(interval);
  }, [db.igreja?.icone_sistema, db.igreja?.nome]);

  // NOVO: Auto Full-Screen no primeiro clique/toque do utilizador (Gatilho Silencioso)
  useEffect(() => {
      const autoFullScreen = () => {
          try {
              const docEl = window.document.documentElement as any;
              const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
              const docAny = document as any;
              if (!docAny.fullscreenElement && !docAny.webkitFullscreenElement && !docAny.mozFullScreenElement && !docAny.msFullscreenElement) {
                  if (requestFullScreen) {
                      const promise = requestFullScreen.call(docEl);
                      if (promise) {
                          promise.catch(() => {}); // Ignora erros silenciosamente
                      }
                  }
              }
          } catch (e) {}
          
          // Remove os sensores após o primeiro clique para não incomodar o utilizador caso ele decida minimizar depois
          document.removeEventListener('click', autoFullScreen);
          document.removeEventListener('touchstart', autoFullScreen);
      };

      document.addEventListener('click', autoFullScreen);
      document.addEventListener('touchstart', autoFullScreen);

      return () => {
          document.removeEventListener('click', autoFullScreen);
          document.removeEventListener('touchstart', autoFullScreen);
      };
  }, []);

  // CORREÇÃO: Motor de Auto-Reconexão (Keep-Alive) para evitar falhas ao salvar
  useEffect(() => {
    let isAuthenticating = false;
    
    const initAuth = async () => { 
        if (isAuthenticating) return;
        isAuthenticating = true;
        try { 
            if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
                await signInWithCustomToken(auth, (window as any).__initial_auth_token); 
            } else {
                await signInAnonymously(auth); 
            }
        } catch (error) { 
            console.error("Erro na autenticação. A tentar modo anónimo fallback...", error); 
            try { await signInAnonymously(auth); } catch (e) { console.error("Falha dupla na autenticação:", e); }
        } finally {
            isAuthenticating = false;
        }
    };
    
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setAuthUser(u);
        // Se a sessão cair por micro-oscilação ou expiração do token, reconecta instantaneamente de forma invisível
        if (!u) {
            console.warn("Sessão interrompida. A restaurar ligação segura aos servidores...");
            initAuth();
        }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!authUser) return;
      
      // [ C ] BLINDAGEM MULTI-TENANT E OTIMIZAÇÃO DE STARTUP
      // Coleções fundamentais sempre carregadas (necessárias para o login e menus)
      const baseCollections = ['usuarios', 'membros', 'congregacoes', 'fornecedores', 'centro_custo', 'departamentos'];
      
      // Coleções transacionais pesadas (só carregam DEPOIS do login)
      const systemCollections = ['financeiro', 'carnes', 'celulas', 'celulas_relatorios', 'agenda', 'tarefas', 'ebd_turmas', 'ebd_alunos', 'ebd_licoes', 'missoes_missionarios', 'missoes_agencias', 'missoes_colaboradores', 'missoes_agenda', 'projetos_midia', 'solicitacoes', 'auditoria_logs', 'visitantes', 'patrimonio', 'emails', 'mural', 'pastor_agenda', 'pastor_mensagens', 'pastor_esbocos', 'pastor_atas', 'pastor_liturgias', 'support_chats', 'orcamentos', 'push_subscriptions', 'kids_criancas', 'kids_presencas', 'kids_ocorrencias'];

      let collectionsToSync = [...baseCollections];
      if (user) {
          collectionsToSync = [...baseCollections, ...systemCollections];
      }
      
      let pendingUpdates = {};
      let updateTimeout = null;

      const unsubConfig = onSnapshot(
          doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), 
          (docSnap) => { if (docSnap.exists()) setDbState(prev => ({ ...prev, igreja: { ...prev.igreja, ...docSnap.data() } })); },
          (error) => console.error("Firestore Error (config):", error)
      );
      
      const unsubs = collectionsToSync.map(key => {
          let colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', key);
          let q = query(colRef);

          // SEGURANÇA E PERFORMANCE: Filtro no Servidor (Firestore)
          // Aplica o filtro de filial apenas para Usuários Administrativos Restritos.
          // O Portal do Membro bypassa este filtro para poder recuperar o histórico legado sem congregacao_id.
          if (user && user.nivel !== 'master' && user.tipo !== 'membro') {
              const myBranch = user.congregacao_id || 'sede';
              const tenantTables = ['membros', 'financeiro', 'carnes', 'celulas', 'agenda', 'tarefas', 'visitantes', 'patrimonio', 'ebd_turmas', 'kids_criancas', 'kids_presencas', 'kids_ocorrencias'];
              
              if (tenantTables.includes(key)) {
                  q = query(colRef, where('congregacao_id', '==', myBranch));
              }
          }

          return onSnapshot(
              q, 
              (qs) => {
                  const list = []; const trashList = [];
                  qs.forEach((doc) => { const data: any = { id: doc.id, ...doc.data() }; if (!data.deleted) list.push(data); else trashList.push({ ...data, _collection_key: key }); });
                  
                  pendingUpdates[key] = { list, trashList };

                  // Agrupamento de atualizações (Debounce) para evitar congelamento de ecrã inicial
                  if (updateTimeout) clearTimeout(updateTimeout);
                  updateTimeout = setTimeout(() => {
                      const capturedUpdates = { ...pendingUpdates };
                      pendingUpdates = {};

                      setDbState(prev => { 
                          const newState = { ...prev }; 
                          newState.trash = { ...newState.trash };
                          
                          Object.keys(capturedUpdates).forEach(k => {
                              const { list: uList, trashList: uTrash } = capturedUpdates[k];
                              let stateKey = k;
                              if (k === 'ebd_turmas') stateKey = 'ebd.turmas'; 
                              else if (k === 'ebd_alunos') stateKey = 'ebd.alunos'; 
                              else if (k === 'ebd_licoes') stateKey = 'ebd.licoes'; 
                              else if (k === 'missoes_missionarios') stateKey = 'missoes.missionarios'; 
                              else if (k === 'missoes_agencias') stateKey = 'missoes.agencias';
                              else if (k === 'missoes_colaboradores') stateKey = 'missoes.colaboradores';
                              else if (k === 'missoes_agenda') stateKey = 'missoes.agenda';
                              else if (k === 'auditoria_logs') stateKey = 'auditoria';
                              
                              if (stateKey.includes('.')) { 
                                  const [p, ch] = stateKey.split('.'); 
                                  if(!newState[p]) newState[p] = {};
                                  newState[p] = { ...newState[p], [ch]: uList }; 
                              } else { 
                                  newState[stateKey] = uList; 
                              } 
                              newState.trash[k] = uTrash;
                          });
                          return newState; 
                      });
                      setLoading(false);
                  }, 150);
              },
              (error) => console.error(`Firestore Error (${key}):`, error)
          );
      });

      return () => {
          if (updateTimeout) clearTimeout(updateTimeout);
          unsubConfig();
          unsubs.forEach(unsub => unsub());
      };
  }, [authUser, user]);

  // --- MOTOR DE BACKUP AUTOMÁTICO SILENCIOSO EM NUVEM ---
  useEffect(() => {
      if (!authUser || !user || !db || !db.igreja) return;
      
      const config = db.igreja;
      const isAutoEnabled = config.backup_auto_habilitado !== false;
      if (!isAutoEnabled) return;

      const freq = config.backup_auto_frequencia || 'diario';
      const lastBackupStr = config.backup_auto_ultimo || '';
      
      let shouldBackup = false;
      const now = new Date();

      if (!lastBackupStr) {
          shouldBackup = true;
      } else {
          const lastBackup = new Date(lastBackupStr);
          const diffMs = now.getTime() - lastBackup.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          if (freq === 'diario' && diffHours >= 24) {
              shouldBackup = true;
          } else if (freq === 'semanal' && diffHours >= 168) {
              shouldBackup = true;
          } else if (freq === 'mensal' && diffHours >= 720) {
              shouldBackup = true;
          }
      }

      if (shouldBackup) {
          const sessionFlag = sessionStorage.getItem('gipp_silent_backup_triggered');
          if (sessionFlag) return;
          sessionStorage.setItem('gipp_silent_backup_triggered', 'true');

          const dispatchSilentBackup = async () => {
              try {
                  console.log("[GIPP Auto-Backup] Despachando rotina silenciosa...");
                  
                  const cleanDb = JSON.parse(JSON.stringify(db));
                  const cleanObject = (obj: any) => {
                      if (!obj || typeof obj !== 'object') return;
                      Object.keys(obj).forEach(key => {
                          if (typeof obj[key] === 'string' && (obj[key].startsWith('data:image') || obj[key].length > 10000)) {
                              obj[key] = "[IMAGEM_PESADA_REMOVIDA_DO_CLOUD_BACKUP]";
                          } else if (typeof obj[key] === 'object') {
                              cleanObject(obj[key]);
                          }
                      });
                  };
                  cleanObject(cleanDb);

                  const dataJsonStr = JSON.stringify(cleanDb);
                  const backupSizeKb = Math.round(dataJsonStr.length / 1024);
                  const backupId = 'backup_auto_' + Date.now();
                  const backupTime = now.toISOString();

                  const backupDoc = {
                      id: backupId,
                      data_criacao: backupTime,
                      responsavel: 'Agendador Silencioso',
                      tipo: 'agendado',
                      tamanho_kb: backupSizeKb,
                      observacao: 'Ponto de restauração gerado automaticamente pelo motor do GIPP.',
                      dados_json: dataJsonStr
                  };

                  const backupRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'cloud_backups', backupId);
                  await setDoc(backupRef, backupDoc);

                  const configRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config');
                  await updateDoc(configRef, {
                      backup_auto_ultimo: backupTime
                  });

                  console.log(`[GIPP Auto-Backup] Rotina finalizada com sucesso! Salvo ${backupSizeKb} KB em nuvem.`);
              } catch (err) {
                  console.error("[GIPP Auto-Backup] Falha na rotina silenciosa:", err);
              }
          };

          setTimeout(dispatchSilentBackup, 8000);
      }
  }, [authUser, user, db]);

  // --- MOTOR PWA (PROGRESSIVE WEB APP) ---
  useEffect(() => {
      // 1. Bloquear o Menu de Contexto (Clique Direito do Rato) para dar sensação de executável
      const handleContextMenu = (e) => {
          // Permite o clique direito apenas em campos de texto (para Colar/Copiar)
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
          }
      };
      document.addEventListener('contextmenu', handleContextMenu);

      // 2. Travar o Viewport estritamente (impede o zoom com os dedos no telemóvel e duplo clique)
      let metaViewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement | null;
      if (!metaViewport) {
          metaViewport = document.createElement('meta');
          metaViewport.name = 'viewport';
          document.head.appendChild(metaViewport);
      }
      metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

      // 3. Manifest PWA
      let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
      if (!manifestLink) {
          manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.id = 'gipp-pwa-manifest';
          document.head.appendChild(manifestLink);
      } else {
          manifestLink.id = 'gipp-pwa-manifest';
      }

      const activeLaunchUrl = window.location.origin + window.location.pathname + window.location.search;

      const manifest = {
          name: "GIPP - Gestão de Igreja",
          short_name: "GIPP App",
          description: "Sistema Inteligente de Gestão Eclesiástica",
          start_url: activeLaunchUrl,
          display: "fullscreen", // CRUCIAL: Força tela cheia nativa ao instalar o PWA
          background_color: "#0f172a",
          theme_color: "#4f46e5",
          icons: [
              {
                  src: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png", 
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable"
              }
          ]
      };

      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      manifestLink.href = manifestUrl;

      // Meta tags adicionais para Apple/Android de alta fidelidade
      let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta');
          metaThemeColor.name = 'theme-color';
          document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = '#0f172a';

      let metaAppleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement | null;
      if (!metaAppleCapable) {
          metaAppleCapable = document.createElement('meta');
          metaAppleCapable.name = 'apple-mobile-web-app-capable';
          document.head.appendChild(metaAppleCapable);
      }
      metaAppleCapable.content = 'yes';

      let metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
      if (!metaAppleStatus) {
          metaAppleStatus = document.createElement('meta');
          metaAppleStatus.name = 'apple-mobile-web-app-status-bar-style';
          document.head.appendChild(metaAppleStatus);
      }
      metaAppleStatus.content = 'black-translucent';

      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) {
          appleIcon = document.createElement('link');
          appleIcon.rel = 'apple-touch-icon';
          document.head.appendChild(appleIcon);
      }
      appleIcon.href = "https://cdn-icons-png.flaticon.com/512/3004/3004613.png";

      return () => {
          document.removeEventListener('contextmenu', handleContextMenu);
      };
  }, []);

  // NOVO: Atualizar Ícone do Sistema Dinamicamente
  useEffect(() => {
      const iconeOficial = db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png";

      // Favicon Padrão
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
      }
      favicon.href = iconeOficial;

      // Apple Touch Icon
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (appleIcon) {
          appleIcon.href = iconeOficial;
      }

      // Atualizar o Manifest existente (se houver)
      const manifestLink = document.getElementById('gipp-pwa-manifest') as HTMLLinkElement | null;
      if (manifestLink) {
          const activeLaunchUrl = window.location.origin + window.location.pathname + window.location.search;
          const manifest = {
            name: "GIPP - Gestão de Igreja",
            short_name: "GIPP App",
            description: "Sistema Inteligente de Gestão Eclesiástica",
            start_url: activeLaunchUrl,
            display: "fullscreen",
            background_color: "#0f172a",
            theme_color: "#4f46e5",
            icons: [
                {
                    src: iconeOficial, 
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable"
                }
            ]
          };
          const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
          manifestLink.href = URL.createObjectURL(manifestBlob);
      }
  }, [db.igreja?.icone_sistema]);

  const handleLogin = async (e) => {
      e.preventDefault();

      // --- MOTOR EXECUTÁVEL: Tentar Forçar Ecrã Inteiro de forma segura ---
      try {
          const docEl = window.document.documentElement as any;
          const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
          const docAny = document as any;
          if (!docAny.fullscreenElement && !docAny.webkitFullscreenElement) {
              if (requestFullScreen) {
                  await requestFullScreen.call(docEl);
              }
          }
      } catch (err) {
          console.warn("Ecrã inteiro bloqueado pelo ambiente atual. Funcionará após instalado.", err);
      }
      // --------------------------------------------------------------

      if (isFirstAccess && loginMode === 'membro') {
          return handlePrimeiroAcesso(e);
      }

      const u = loginData.user; const p = loginData.pass;

      if (loginMode === 'membro') {
          const nomeDigitado = u.toLowerCase().trim();
          const passDigitada = p.trim();
          
          const foundMember = (db.membros || []).find(m => m && typeof m.nome === 'string' && m.nome.toLowerCase().trim() === nomeDigitado);
          
          if (foundMember) {
              const isLiberado = foundMember.acesso_portal_liberado || (foundMember.senha_portal && foundMember.acesso_portal_liberado !== false);
              if (!isLiberado) {
                  addToast("Acesso bloqueado ou não liberado pela secretaria. Procure a administração.", 'error');
                  return;
              }

              if (!foundMember.senha_portal) {
                  addToast("Senha não cadastrada. Clique em 'Primeiro Acesso' para criar sua senha.", 'warning');
                  return;
              }
              
              if (foundMember.senha_portal === passDigitada) {
                  const userFuncaoAdm = (foundMember.funcao_administrativa || 'NENHUMA').toUpperCase();
                  const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
                  const allowedModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
                  setUser({ 
                      ...foundMember, 
                      tipo: 'membro',
                      portal_permissoes: allowedModules
                  });
                  setView('portal_home');
                  addToast(`A Paz do Senhor, ${foundMember.nome.split(' ')[0]}!`, 'success');
                  logAction('LOGIN', 'Membro acedeu ao portal de autoatendimento', 'membros', foundMember.id);
              } else {
                  addToast("Senha incorreta.", 'error');
              }
          } else {
              addToast("Membro não encontrado. Digite o nome exatamente como está cadastrado.", 'error');
          }
          return;
      }

      if (u.toUpperCase() === 'PATRICK PESSOA' && p === '190996') { 
          setUser({ id: 'dev', nome: "PATRICK PESSOA", nivel: 'master', permissoes: [] }); 
          setView('dashboard'); 
          setIsSystemBooting(true);
          addToast("Master", 'success'); 
          return; 
      }
      if (u.toLowerCase().trim() === 'mary' && p === '2007') {
          setUser({ id: 'usr-mary', nome: "Mary", usuario: "Mary", senha: "2007", nivel: "virtual_assistant", permissoes: [] });
          setView('suporte_dev');
          setIsSystemBooting(true);
          addToast("Olá, Assistente Mary!", 'success');
          return;
      }
      const found = db.usuarios.find(usr => (usr.usuario || '').toLowerCase() === u.toLowerCase() && usr.senha === p);
      if (found) { 
          setUser(found); 
          setView('dashboard'); 
          setIsSystemBooting(true);
          addToast(`Olá, ${found.nome}!`, 'success'); 
      } 
      else if (db.usuarios.length === 0 && u === 'ADM' && p === '123') { 
          setUser(MOCK_DB.usuarios[0]); 
          setView('dashboard'); 
          setIsSystemBooting(true);
      }
      else { addToast("Erro login.", 'error'); }
  };

  const handleLogout = () => { auth.signOut(); setUser(null); setView('login'); };
  const deleteItem = (type, id) => { 
      if (!authUser) return addToast("Aguarde a conexão com o servidor.", "warning");
      const map = { 'membro': 'membros', 'visitante': 'visitantes', 'celula': 'celulas', 'congregacao': 'congregacoes', 'departamento': 'departamentos', 'ministerio': 'departamentos', 'usuario': 'usuarios', 'agenda': 'agenda', 'tarefa': 'tarefas', 'entrada': 'financeiro', 'saida': 'financeiro', 'gestao_despesa': 'financeiro', 'carne': 'carnes', 'ebd_turma': 'ebd_turmas', 'ebd_aluno': 'ebd_alunos', 'ebd_licao': 'ebd_licoes', 'missionario': 'missoes_missionarios', 'agencia_missoes': 'missoes_agencias', 'missoes_colaborador': 'missoes_colaboradores', 'missoes_agenda': 'missoes_agenda', 'centro_custo': 'centro_custo', 'fornecedor': 'fornecedores', 'patrimonio': 'patrimonio' };
      const target = map[type] || type + 's';
      setConfirmDialog({ isOpen: true, title: "Lixeira", message: "Mover para lixeira?", onConfirm: async () => { try { await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', target, id), { deleted: true }, { merge: true }); logAction('EXCLUSÃO_LÓGICA', `Moveu item para a lixeira`, target, id); addToast("Na lixeira.", "success"); } catch (e) { addToast("Erro de permissão ao apagar.", "error"); } } }); 
  };
  const openModal = (type, item = null) => { setModalType(type); setEditingItem(item && item.id ? item : null); setFormData(item || {}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); setFormData({}); };
  const hasPermission = (perm) => { 
      if (!user) return false; 
      if (user.id === 'dev' || user.nivel === 'master' || user.nivel === 'dev') return true;
      if (user.usuario?.toLowerCase() === 'mary') return true;
      if (perm === 'public' || user.nivel === 'master') return true; 
      
      if (user.funcao_administrativa) {
          const role = user.funcao_administrativa.toUpperCase();
          if (role === 'PASTOR PRESIDENTE' || role === 'PASTOR AUXILIAR') {
              const pastorPerms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_ministerios', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_gestao_cursos', 'access_ia', 'access_boletim', 'access_sec_relatorios', 'access_missoes', 'access_manual'];
              if (pastorPerms.includes(perm)) return true;
          }
          if (role === 'SECRETARIO') {
              const secPerms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_gestao_cursos', 'access_boletim', 'access_sec_relatorios', 'access_manual'];
              if (secPerms.includes(perm)) return true;
          }
          if (role === 'TESOUREIRO' || role === 'CONTADOR') {
              const financialPerms = ['access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_sec_relatorios', 'access_manual'];
              if (financialPerms.includes(perm)) return true;
          }
          if (role === 'ADMINISTRADOR') {
              const adminPerms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_patrimonio', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_gestao_cursos', 'access_boletim', 'access_sec_relatorios', 'access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_manual'];
              if (adminPerms.includes(perm)) return true;
          }
          if (role === 'ADVOGADO') {
              const lawyerPerms = ['access_igreja', 'access_patrimonio', 'access_sec_relatorios', 'access_manual'];
              if (lawyerPerms.includes(perm)) return true;
          }
          if (role === 'LIDER DE DEPARTAMENTO') {
              const deptPerms = ['access_ministerios', 'access_sec_agenda', 'access_manual'];
              if (deptPerms.includes(perm)) return true;
          }
          if (role === 'COORDENADOR') {
              const coordPerms = ['access_ministerios', 'access_celulas', 'access_sec_agenda', 'access_manual'];
              if (coordPerms.includes(perm)) return true;
          }
          if (role === 'SUPERINTENDENTE') {
              const superPerms = ['access_ebd', 'access_sec_agenda', 'access_manual'];
              if (superPerms.includes(perm)) return true;
          }
          if (role === 'AUXILIAR') {
              const auxPerms = ['access_sec_agenda', 'access_ebd', 'access_gestao_cursos', 'access_manual'];
              if (auxPerms.includes(perm)) return true;
          }
      }
      
      return user.permissoes?.includes(perm); 
  };
  
  const calculateStats = (dataObj) => {
      return {
          membros: dataObj.membros?.length || 0,
          financeiro: dataObj.financeiro?.length || 0,
          celulas: dataObj.celulas?.length || 0,
          agenda: dataObj.agenda?.length || 0,
          carnes: dataObj.carnes?.length || 0,
          usuarios: dataObj.usuarios?.length || 0
      };
  };

  const handleExportRequest = () => { setBackupState({ isOpen: true, mode: 'export', stage: 'initial', progress: 0, stats: calculateStats(db), fileData: null }); };
  const handleLogoutRequest = () => { setBackupState({ isOpen: true, mode: 'logout', stage: 'initial', progress: 0, stats: calculateStats(db), fileData: null }); };
  
  const processExport = () => { 
      setBackupState(prev => ({ ...prev, stage: 'processing', progress: 0 })); 
      let p = 0;
      const interval = setInterval(() => {
          p += 10;
          setBackupState(prev => ({ ...prev, progress: p }));
          if (p >= 100) {
              clearInterval(interval);
              try {
                  // CORREÇÃO: Utilizar Blob para permitir exportação de arquivos gigantes sem corromper
                  const jsonStr = JSON.stringify(db);
                  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `backup_gipp_${getTodayDate()}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  setBackupState(prev => ({ ...prev, stage: 'finished' }));
                  if (backupState.mode === 'logout') {
                      setTimeout(() => { setBackupState(prev => ({ ...prev, isOpen: false })); handleLogout(); }, 1500);
                  }
              } catch (err) {
                  console.error("Erro na exportação:", err);
                  addToast("Erro ao gerar ficheiro de backup.", "error");
                  setBackupState(prev => ({ ...prev, isOpen: false }));
              }
          }
      }, 100);
  };

  const handleImportRequest = () => { fileInputRef.current?.click(); };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target.result as string);
              // Validação extra para garantir que não se importou um ficheiro corrompido
              if (!json.igreja && !json.membros) throw new Error("Formato inválido");
              setBackupState({ isOpen: true, mode: 'import', stage: 'initial', progress: 0, stats: calculateStats(json), fileData: json });
          } catch (err) { 
              console.error(err);
              addToast("Ficheiro corrompido ou inválido. Exporte um novo backup.", "error"); 
          }
      };
      reader.readAsText(file);
      e.target.value = null;
  };

  const processImport = async () => {
      setBackupState(prev => ({ ...prev, stage: 'processing', progress: 0 }));
      const targetData = backupState.fileData;

      try {
          const docsToWrite = [];
          if (targetData.igreja) docsToWrite.push({ collection: 'settings', id: 'config', data: targetData.igreja });
          
          const simpleCollections = ['membros', 'celulas', 'celulas_relatorios', 'congregacoes', 'fornecedores', 'departamentos', 'usuarios', 'agenda', 'tarefas', 'financeiro', 'carnes', 'centro_custo', 'projetos_midia', 'solicitacoes', 'patrimonio', 'visitantes', 'emails', 'mural', 'orcamentos'];
          simpleCollections.forEach(col => {
              if (targetData[col]) targetData[col].forEach(item => docsToWrite.push({ collection: col, id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
          });
          
          if (targetData.ebd) {
              if (targetData.ebd.turmas) targetData.ebd.turmas.forEach(item => docsToWrite.push({ collection: 'ebd_turmas', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
              if (targetData.ebd.alunos) targetData.ebd.alunos.forEach(item => docsToWrite.push({ collection: 'ebd_alunos', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
              if (targetData.ebd.licoes) targetData.ebd.licoes.forEach(item => docsToWrite.push({ collection: 'ebd_licoes', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
          }
          if (targetData.missoes) {
              if (targetData.missoes.missionarios) targetData.missoes.missionarios.forEach(item => docsToWrite.push({ collection: 'missoes_missionarios', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
              if (targetData.missoes.agencias) targetData.missoes.agencias.forEach(item => docsToWrite.push({ collection: 'missoes_agencias', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
              if (targetData.missoes.colaboradores) targetData.missoes.colaboradores.forEach(item => docsToWrite.push({ collection: 'missoes_colaboradores', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
              if (targetData.missoes.agenda) targetData.missoes.agenda.forEach(item => docsToWrite.push({ collection: 'missoes_agenda', id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6), data: item }));
          }

          // CORREÇÃO: Diminuição do tamanho do lote para 100 para respeitar limites do Firebase
          const batchSize = 100; 
          for (let i = 0; i < docsToWrite.length; i += batchSize) {
              const batch = writeBatch(dbFirestore);
              const chunk = docsToWrite.slice(i, i + batchSize);
              
              for (const docObj of chunk) {
                  const { collection: colName, id, data } = docObj;
                  const dataToSave = { ...data };
                  delete dataToSave.id;
                  const ref = doc(dbFirestore, 'artifacts', appId, 'public', 'data', colName, String(id));
                  batch.set(ref, dataToSave, { merge: true });
              }
              
              await batch.commit();
              setBackupState(prev => ({ ...prev, progress: Math.min(95, Math.round(((i + chunk.length) / docsToWrite.length) * 100)) }));
          }

          setBackupState(prev => ({ ...prev, progress: 100 }));
          
          setTimeout(() => {
              setDbState(targetData);
              addToast("Dados restaurados com sucesso no banco de dados!", "success");
              setBackupState(prev => ({ ...prev, stage: 'finished' }));
          }, 500);

      } catch (error) {
          console.error("Erro na importação:", error);
          addToast("Erro ao importar dados. Verifique a sua conexão.", "error");
          setBackupState(prev => ({ ...prev, stage: 'initial', isOpen: false }));
      }
  };

  const handleBackupConfirm = () => { if (backupState.mode === 'export' || backupState.mode === 'logout') { processExport(); } else if (backupState.mode === 'import') { processImport(); } };
  const handleBackupCancel = () => { if (backupState.mode === 'logout') { setBackupState(prev => ({ ...prev, isOpen: false })); handleLogout(); } else { setBackupState(prev => ({ ...prev, isOpen: false })); } };

  // --- Funções do Primeiro Acesso ---
  const handlePrimeiroAcesso = async (e) => {
      e.preventDefault();
      const { nome, data_nascimento, senha, confirmar } = firstAccessData;
      if (!nome || !data_nascimento || !senha) return addToast("Preencha todos os campos.", "warning");
      if (senha !== confirmar) return addToast("As senhas não coincidem.", "error");

      const nomeDigitado = nome.toLowerCase().trim();

      const foundMember = (db.membros || []).find(m =>
          m && typeof m.nome === 'string' &&
          m.nome.toLowerCase().trim() === nomeDigitado &&
          m.data_nascimento === data_nascimento
      );

      if (foundMember) {
          const isLiberado = foundMember.acesso_portal_liberado || (foundMember.senha_portal && foundMember.acesso_portal_liberado !== false);
          if (!isLiberado) {
              return addToast("O seu acesso ainda não foi liberado pela secretaria. Contacte a administração.", "error");
          }

          if (foundMember.senha_portal) {
              return addToast("Este membro já possui uma senha cadastrada. Faça o login normal ou procure a secretaria.", "warning");
          }
          try {
              await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', foundMember.id), { senha_portal: senha }, { merge: true });
              setFirstAccessSuccessData({ ...foundMember, senha_portal: senha });
          } catch (err) {
              addToast("Erro ao cadastrar senha. Tente novamente.", "error");
          }
      } else {
          addToast("Membro não encontrado. Verifique o Nome e a Data de Nascimento digitados.", "error");
      }
  };

  const confirmFirstAccess = () => {
      if (!firstAccessSuccessData) return;
      const userFuncaoAdm = (firstAccessSuccessData.funcao_administrativa || 'NENHUMA').toUpperCase();
      const portalAcessosFuncao = db.igreja?.portal_acessos_funcao || {};
      const allowedModules = portalAcessosFuncao[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS[userFuncaoAdm] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'];
      setUser({ 
          ...firstAccessSuccessData, 
          tipo: 'membro',
          portal_permissoes: allowedModules
      });
      setView('portal_home');
      logAction('LOGIN', 'Membro realizou o Primeiro Acesso ao portal', 'membros', firstAccessSuccessData.id);
      setIsFirstAccess(false);
      setFirstAccessData({ nome: '', data_nascimento: '', senha: '', confirmar: '' });
      setFirstAccessSuccessData(null);
  };

  const handleSaveForm = async () => {
    if (!authUser) return addToast("Aguarde a ligação ao servidor.", "warning");
    
    const handleSuccess = (msg) => {
        addToast(msg, "success");
        setConfirmDialog({
            isOpen: true,
            title: "Ação Concluída",
            message: "O registro foi salvo com sucesso. Deseja continuar no formulário para adicionar o próximo registro?",
            confirmText: "Sim, Continuar",
            cancelText: "Não, Fechar",
            variant: "success",
            onConfirm: () => {
                // Limpa o formulário mantendo a janela aberta para o próximo
                setFormData({});
                setEditingItem(null);
            },
            onCancel: () => {
                // Fecha o formulário definitivamente
                closeModal();
            }
        });
    };

    try {
        const resolvedModalType = modalType === 'financeiro' ? (formData.tipo || 'saida') : modalType;
        let colName = resolvedModalType;
        const map = { 'membro': 'membros', 'visitante': 'visitantes', 'celula': 'celulas', 'celula_relatorio': 'celulas_relatorios', 'congregacao': 'congregacoes', 'departamento': 'departamentos', 'usuario': 'usuarios', 'agenda': 'agenda', 'tarefa': 'tarefas', 'entrada': 'financeiro', 'saida': 'financeiro', 'gestao_despesa': 'financeiro', 'carne': 'carnes', 'ebd_turma': 'ebd_turmas', 'ebd_aluno': 'ebd_alunos', 'ebd_licao': 'ebd_licoes', 'missionario': 'missoes_missionarios', 'agencia_missoes': 'missoes_agencias', 'missoes_colaborador': 'missoes_colaboradores', 'missoes_financeiro': 'financeiro', 'missoes_agenda': 'missoes_agenda', 'fin_entrada_novo': 'financeiro', 'fin_saida_novo': 'financeiro', 'ministerio': 'departamentos', 'ministerio_membro': 'departamentos', 'ministerio_evento': 'departamentos', 'carne_novo': 'carnes', 'centro_custo': 'centro_custo', 'fornecedor': 'fornecedores', 'patrimonio': 'patrimonio' };
        colName = map[resolvedModalType] || resolvedModalType + 's';
        
        let processedData = { ...formData };

        // --- CHECAGEM E PREVENÇÃO DE RECONCILIAÇÃO E DUPLICIDADES ---
        if (colName && db && db[colName] && Array.isArray(db[colName])) {
            const currentList = db[colName];

            // 1. Evitar membros duplicados (pelo mesmo Nome ou CPF)
            if (resolvedModalType === 'membro') {
                if (processedData.nome) {
                    const lowercaseNome = processedData.nome.trim().toLowerCase();
                    const duplicatedMemberName = currentList.find(item => 
                        item.id !== (editingItem?.id) && 
                        !item.deleted && 
                        item.nome?.trim().toLowerCase() === lowercaseNome
                    );
                    if (duplicatedMemberName) {
                        addToast(`Aviso: Já existe um membro cadastrado com o nome "${processedData.nome}"!`, "warning");
                    }
                }

                if (processedData.cpf) {
                    const cleanCpfInput = processedData.cpf.replace(/\D/g, '');
                    if (cleanCpfInput.length > 0) {
                        const duplicatedCpfMember = currentList.find(item => {
                            if (item.id === editingItem?.id || item.deleted) return false;
                            const itemCpf = (item.cpf || '').replace(/\D/g, '');
                            return itemCpf === cleanCpfInput;
                        });
                        if (duplicatedCpfMember) {
                            addToast(`Erro: O CPF informado já está sendo utilizado pelo membro "${duplicatedCpfMember.nome}"!`, "error");
                            return;
                        }
                    }
                }
            }

            // 2. Evitar usuários e logins repetidos
            if (resolvedModalType === 'usuario') {
                if (processedData.usuario) {
                    const lowercaseUser = processedData.usuario.trim().toLowerCase();
                    const duplicatedUser = currentList.find(item => 
                        item.id !== (editingItem?.id) && 
                        !item.deleted && 
                        item.usuario?.trim().toLowerCase() === lowercaseUser
                    );
                    if (duplicatedUser) {
                        addToast(`Erro: O login de usuário "${processedData.usuario}" já está em uso por outro operador!`, "error");
                        return;
                    }
                }
            }

            // 3. Evitar fornecedores repetidos (mesmo CNPJ ou CPF)
            if (resolvedModalType === 'fornecedor') {
                if (processedData.cnpj) {
                    const cleanCnpj = processedData.cnpj.replace(/\D/g, '');
                    if (cleanCnpj.length > 0) {
                        const duplicatedFornecedor = currentList.find(item => {
                            if (item.id === editingItem?.id || item.deleted) return false;
                            const itemCnpj = (item.cnpj || '').replace(/\D/g, '');
                            return itemCnpj === cleanCnpj;
                        });
                        if (duplicatedFornecedor) {
                            addToast(`Erro: Já existe um fornecedor cadastrado com o CNPJ ${processedData.cnpj}!`, "error");
                            return;
                        }
                    }
                }
            }

            // 4. Evitar turmas de EBD idênticas (mesmo nome)
            if (resolvedModalType === 'ebd_turma') {
                if (processedData.nome) {
                    const lowercaseNome = processedData.nome.trim().toLowerCase();
                    const duplicatedTurma = currentList.find(item => 
                        item.id !== (editingItem?.id) && 
                        !item.deleted && 
                        item.nome?.trim().toLowerCase() === lowercaseNome
                    );
                    if (duplicatedTurma) {
                        addToast(`Erro: Já existe uma classe de EBD com o nome "${processedData.nome}"!`, "error");
                        return;
                    }
                }
            }

            // 5. Evitar centros de custo repetidos
            if (resolvedModalType === 'centro_custo') {
                if (processedData.nome) {
                    const lowercaseNome = processedData.nome.trim().toLowerCase();
                    const duplicatedCC = currentList.find(item => 
                        item.id !== (editingItem?.id) && 
                        !item.deleted && 
                        item.nome?.trim().toLowerCase() === lowercaseNome
                    );
                    if (duplicatedCC) {
                        addToast(`Erro: Já existe um centro de custo ativo chamado "${processedData.nome}"!`, "error");
                        return;
                    }
                }
            }
        }

        // [C] Força a assinatura da filial ao gravar novos dados por usuários restritos
        if (user && user.nivel !== 'master' && !processedData.congregacao_id) {
            processedData.congregacao_id = user.congregacao_id || 'sede';
        }

        if (resolvedModalType === 'membro') {
            if (!processedData.congregacao_id) processedData.congregacao_id = 'sede';
            if (processedData.cpf && !isValidCPF(processedData.cpf)) {
                addToast("O CPF informado é inválido! Por favor, insira um CPF válido.", "error");
                return;
            }
        }

        if (resolvedModalType === 'usuario') {
            if (!processedData.congregacao_id) processedData.congregacao_id = 'sede';
        }

        if (resolvedModalType === 'fin_entrada_novo' || resolvedModalType === 'entrada') { 
            processedData.tipo = 'entrada'; 
            if (!processedData.status) processedData.status = 'pago'; 
            if (!processedData.congregacao_id) processedData.congregacao_id = 'sede';
            if(processedData.membro_id) {
                const mem = db.membros.find(m => m.id === processedData.membro_id);
                if(mem) processedData.membro_nome = mem.nome;
            }
            if (!editingItem) processedData.conciliado = false;
        }
        if (resolvedModalType === 'fin_saida_novo' || resolvedModalType === 'saida' || resolvedModalType === 'gestao_despesa') { 
            processedData.tipo = 'saida'; 
            if (!processedData.congregacao_id) processedData.congregacao_id = 'sede';
            if (!editingItem) processedData.conciliado = false;
        }
        if (resolvedModalType === 'missoes_financeiro') { 
            processedData.categoria = 'Missões';
            if (!processedData.tipo) processedData.tipo = 'entrada';
            processedData.status = processedData.tipo === 'entrada' ? 'pago' : (processedData.status || 'pendente');
            if (!processedData.congregacao_id) processedData.congregacao_id = 'sede';
            if (!editingItem) processedData.conciliado = false;
        }
        
        if (resolvedModalType === 'ministerio_membro') { 
            const min = db.departamentos.find(d => d.id === processedData.departamento_id); 
            if (!min) return addToast("Ministério não encontrado.", "error");
            const members = [...(min.membros || [])]; 
            members.push({ membro_id: processedData.membro_id, funcao: processedData.funcao }); 
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'departamentos', min.id), { membros: members }, { merge: true }); 
            handleSuccess("Membro vinculado!"); return; 
        }
        if (resolvedModalType === 'ministerio_evento') { 
            const min = db.departamentos.find(d => d.id === processedData.departamento_id); 
            if (!min) return addToast("Ministério não encontrado.", "error");
            const ag = [...(min.agenda || [])]; 
            ag.push({ titulo: processedData.titulo, data: processedData.data, hora: processedData.hora }); 
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'departamentos', min.id), { agenda: ag }, { merge: true }); 
            handleSuccess("Evento agendado!"); return; 
        }
        if (resolvedModalType === 'celula_membro') {
            const cel = db.celulas.find(c => c.id === processedData.celula_id);
            if (!cel) return addToast("Célula não encontrada.", "error");
            const members = [...(cel.membros || [])];
            members.push({ integrante_id: processedData.integrante_id, tipo: processedData.tipo_integrante, funcao: processedData.funcao });
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'celulas', cel.id), { membros: members }, { merge: true });
            handleSuccess("Integrante vinculado!"); return;
        }
        if (resolvedModalType === 'celula_evento') {
            const cel = db.celulas.find(c => c.id === processedData.celula_id);
            if (!cel) return addToast("Célula não encontrada.", "error");
            const agenda = [...(cel.agenda || [])];
            agenda.push({ titulo: processedData.titulo, data: processedData.data, hora: processedData.hora, whatsapp_msg: processedData.whatsapp_msg });
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'celulas', cel.id), { agenda }, { merge: true });
            handleSuccess("Evento agendado!"); return;
        }
        if (resolvedModalType === 'carne_novo' || resolvedModalType === 'carne') { 
            if (!editingItem) {
                const parcelas = []; const base = new Date(processedData.primeiro_vencimento); 
                for (let i = 0; i < processedData.qtd_parcelas; i++) { 
                    const d = new Date(base); d.setMonth(d.getMonth() + i); 
                    parcelas.push({ numero: i + 1, valor: processedData.valor_total / processedData.qtd_parcelas, vencimento: d.toISOString().split('T')[0], status: 'pendente' }); 
                } 
                const novoCarne = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes'), { titulo: processedData.titulo, membro_id: processedData.membro_id, valor_total: parseFloat(processedData.valor_total) || 0, parcelas }); 
                logAction('CRIAÇÃO', `Gerou novo carnê: ${processedData.titulo}`, 'carnes', novoCarne.id);
                handleSuccess("Carnê gerado!"); return; 
            }
        }
        
        const safeData = JSON.parse(JSON.stringify(processedData));
        delete safeData.id;
        delete safeData._collection_key;
        delete safeData._type_label;

        // NOVO: Histórico de Alterações de registros do módulo financeiro
        if (colName === 'financeiro') {
            if (editingItem && editingItem.id) {
                const oldValor = parseFloat(editingItem.valor) || 0;
                const newValor = parseFloat(safeData.valor) || 0;
                const oldStatus = editingItem.status || 'pendente';
                const newStatus = safeData.status || 'pendente';
                const oldDesc = editingItem.descricao || '';
                const newDesc = safeData.descricao || '';
                
                const changes = [];
                if (oldValor !== newValor) {
                    changes.push(`Valor alterado de R$ ${oldValor.toFixed(2)} para R$ ${newValor.toFixed(2)}`);
                }
                if (oldStatus !== newStatus) {
                    changes.push(`Status alterado de "${oldStatus.toUpperCase()}" para "${newStatus.toUpperCase()}"`);
                }
                if (oldDesc !== newDesc) {
                    changes.push(`Descrição alterada de "${oldDesc}" para "${newDesc}"`);
                }
                
                if (changes.length > 0) {
                    const histItem = {
                        usuario_nome: user?.nome || 'Operador',
                        usuario_id: user?.id || 'id',
                        data: new Date().toISOString(),
                        descricao: changes.join('; ')
                    };
                    const prevHist = Array.isArray(editingItem.historico) ? editingItem.historico : (Array.isArray(editingItem.alteracoes) ? editingItem.alteracoes : []);
                    safeData.historico = [histItem, ...prevHist];
                } else {
                    if (editingItem.historico) {
                        safeData.historico = editingItem.historico;
                    }
                }
            } else {
                const histItem = {
                    usuario_nome: user?.nome || 'Operador',
                    usuario_id: user?.id || 'id',
                    data: new Date().toISOString(),
                    descricao: 'Lançamento financeiro registrado no sistema.'
                };
                safeData.historico = [histItem];
            }
        }

        let savedId = editingItem && editingItem.id ? editingItem.id : null;
        if (editingItem && editingItem.id) {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', colName, editingItem.id), safeData, { merge: true });
            logAction('EDIÇÃO', `Editou registo: ${safeData.nome || safeData.titulo || safeData.descricao || 'Item'}`, colName, editingItem.id);
        } else {
            const novoDoc = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', colName), { ...safeData, created_at: new Date().toISOString() });
            savedId = novoDoc.id;
            logAction('CRIAÇÃO', `Criou novo registo: ${safeData.nome || safeData.titulo || safeData.descricao || 'Item'}`, colName, novoDoc.id);
        }

        if (savedId) {
            try {
                if (safeData.foto) await storeMedia(`membro_${savedId}_foto`, safeData.foto);
                if (safeData.logo) await storeMedia(`congregacao_${savedId}_logo`, safeData.logo);
                if (safeData.imagem) await storeMedia(`agenda_${savedId}_imagem`, safeData.imagem);
            } catch (err) {
                console.warn("Erro ao registar cache IndexedDB pós-guardar:", err);
            }

            // Automatic Push Notifications (FCM) on scales/events registration
            if ((colName === 'tarefas' || colName === 'agenda' || colName === 'eventos') && Array.isArray(safeData.equipe) && safeData.equipe.length > 0) {
                try {
                    const notificationTitle = `Nova Escala Ativa: ${safeData.titulo || safeData.descricao || 'Compromisso Escalar'}`;
                    const notificationBody = `Olá! Você foi escalado(a) como "${safeData.equipe.map((m: any) => m.funcao_escala || 'Membro').join(', ')}" no dia ${safeData.data ? safeData.data : 'agendado'}.`;
                    
                    const newNotification = {
                        id: `scale_notif_${savedId}_${Date.now()}`,
                        title: notificationTitle,
                        desc: notificationBody,
                        time: 'Configurado Agora',
                        icon: 'Bell',
                        color: 'indigo'
                    };
                    
                    setDbState((prev: any) => {
                        return {
                            ...prev,
                            notifications: [newNotification, ...(prev.notifications || [])]
                        };
                    });

                    safeData.equipe.forEach(async (member: any) => {
                        console.log(`[FCM Push Dispatch] Disparando Push para Membro: ${member.nome} (ID: ${member.id})`);
                        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'fcm_push_logs'), {
                            recipientId: member.id,
                            recipientName: member.nome,
                            title: notificationTitle,
                            body: notificationBody,
                            sentAt: new Date().toISOString(),
                            status: 'scheduled_fcm'
                        });
                    });
                    
                    addToast("Notificações automáticas de escala disparadas via FCM! 🔔", "success");
                } catch (pushErr) {
                    console.warn("[FCM auto-dispatch skipped]", pushErr);
                }
            }
        }
        handleSuccess("Guardado com sucesso!");
    } catch (e) { 
        console.error("Erro ao guardar:", e); 
        addToast("Erro de permissões ao tentar guardar.", "error"); 
    }
  };

  const ctxValues = { db, user, setUser, view, setView, sidebarOpen, setSidebarOpen, modalOpen, setModalOpen, modalType, formData, setFormData, printMode, setPrintMode, printData, setPrintData, toasts, addToast, removeToast, deleteItem, openModal, editingItem, dbFirestore, appId, authUser, setConfirmDialog, updateDoc, doc, addDoc, collection, hasPermission, setDbState, setDoc, logout: handleLogout, startExport: handleExportRequest, handleImportRequest, handleLogoutRequest, setPreviewOpen, deleteDoc, logAction, theme, setTheme, toggleTheme, isOnline, osTheme, setOsTheme, animBgEnabled, setAnimBgEnabled, callGeminiAI, printPalette, setPrintPalette, printMarginType, setPrintMarginType, printOrientation, setPrintOrientation, printContentScale, setPrintContentScale, notifications, clearedNotifications, setClearedNotifications, clearAllNotifications, fcmToken, fcmStatus, fcmPermission, requestFcmPermission };

  // --- VERIFICAÇÃO DE COMPATIBILIDADE PUSH MÓVEL ---
  const MobilePushCompatibilityCheck = () => {
      const [status, setStatus] = useState<'ok' | 'unsupported_pwa' | 'blocked'>('ok');
      const [dismissed, setDismissed] = useState(false);

      useEffect(() => {
          if (typeof window !== 'undefined') {
              const hasSW = 'serviceWorker' in navigator;
              const hasPush = 'PushManager' in window;
              const hasNotif = 'Notification' in window;
              
              if (!hasSW || !hasPush || !hasNotif) {
                  setStatus('unsupported_pwa');
              } else if (Notification.permission === 'denied') {
                  setStatus('blocked');
              }
          }
      }, []);

      if (status === 'ok' || dismissed) return null;

      return (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 flex gap-3 animate-entrance relative">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5 animate-bounce" size={18} />
              <div className="flex-1">
                  <h4 className="text-[10px] font-black text-amber-950 uppercase tracking-wider">Aviso de Compatibilidade de Alertas</h4>
                  <p className="text-[11px] text-amber-800 font-bold mt-1 leading-relaxed pr-6">
                      {status === 'unsupported_pwa' ? (
                          <span>
                              Seu navegador móvel atual limita as notificações push. <strong className="font-black underline">No iOS (iPhone) ou Android, adicione este aplicativo à sua Tela de Início (Compartilhar &gt; Tela de Início)</strong> para habilitar as notificações nativas!
                          </span>
                      ) : (
                          <span>
                              A permissão de notificações deste site está bloqueada. <strong className="font-black underline">Por favor, libere os alertas nas configurações do navegador</strong> para continuar recebendo avisos.
                          </span>
                      )}
                  </p>
                  <button 
                      type="button" 
                      onClick={() => setDismissed(true)} 
                      className="absolute top-3 right-3 text-amber-500 hover:text-amber-800 transition-colors p-1"
                      title="Fechar aviso"
                  >
                      <X size={14} />
                  </button>
              </div>
          </div>
      );
  };

  if (!user) { 
    return ( 
      <ChurchContext.Provider value={ctxValues}>
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
          <GlobalStyles />
          <OsThemeStyles />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          {isSystemBooting && <SplashScreen onComplete={() => setIsSystemBooting(false)} corTema={db.igreja?.cor_tema || '#6366f1'} themeBg={osTheme} isDevMode={user?.id === 'dev'} isMaryMode={user?.usuario?.toLowerCase() === 'mary'} saasSettings={db.igreja} />}
          
          <div className="absolute top-6 right-6 z-[100] pointer-events-auto hidden sm:flex gap-3">
              <OsThemeToggle variant="dark" />
              <AnimBgToggle variant="dark" />
              <ThemeToggle variant="dark" />
              <FullScreenToggle variant="dark" />
          </div>

          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <ThemeBackground theme={osTheme} />
          </div>
          
          <div className="relative z-10 w-full max-w-6xl h-[85vh] bg-white/10 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl border border-white/20 flex overflow-hidden animate-scale-in ring-1 ring-white/30">
              <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-20 flex-col justify-between relative overflow-hidden login-left-hero">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-28 h-28 bg-white/10 rounded-[2rem] backdrop-blur-md p-4 shadow-2xl shadow-indigo-500/40 border border-white/20 flex items-center justify-center transform hover:scale-105 transition-all shrink-0">
                            <img src={db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"} className="w-full h-full object-contain drop-shadow-md" alt="Sistema GIPP" />
                        </div>
                        <div className="flex flex-col border-l-2 border-indigo-500/30 pl-6">
                            <h2 className="font-serif text-4xl sm:text-5xl text-white drop-shadow-lg leading-tight tracking-wide font-normal">
                                Sistema <br/><span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-indigo-400 login-gradient-text">de Gestão</span>
                            </h2>
                            <p className="font-sans text-xs font-black uppercase tracking-[0.4em] text-indigo-400/80 mt-3 login-accent-text">
                                Para Igrejas
                            </p>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 drop-shadow-lg">
                        Gestão <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 login-gradient-text">Inteligente</span>
                    </h1>
                    <p className="text-indigo-200/80 text-xl font-light max-w-sm leading-relaxed mb-6 login-accent-text">
                        A plataforma completa para transformar a administração da sua igreja.
                    </p>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm animate-entrance">
                        <p className="text-white text-base italic font-medium leading-relaxed mb-3">"{loginVerse.text}"</p>
                        <p className="text-indigo-300 text-xs font-black uppercase tracking-widest login-accent-text">— {loginVerse.ref}</p>
                    </div>

                    {/* --- CLASSIFICAÇÃO OFICIAL DO SISTEMA --- */}
                    <div className="mt-6 p-5 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md animate-entrance relative overflow-hidden group google-review-card transition-all duration-500 cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[slideRight_2s_ease-in-out] pointer-events-none"></div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)] p-2">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-white text-sm">Classificação do Sistema</h4>
                                    <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1"><ShieldCheck size={12} className="text-blue-400"/> Google Cloud Verified</span>
                                </div>
                                <div className="flex items-center gap-1 mb-2 google-review-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={14} className="text-[#FBBC05] fill-[#FBBC05] drop-shadow-[0_0_8px_rgba(251,188,5,0.6)]" />
                                    ))}
                                    <span className="text-white/80 text-[10px] ml-2 font-bold tracking-wider">5.0 / EXCELÊNCIA</span>
                                </div>
                                <p className="text-white/80 text-xs font-medium leading-relaxed">
                                    Sistema classificado com excelência em segurança de dados, alta performance e estabilidade na nuvem. Atende a todos os rigorosos padrões de proteção corporativa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="flex gap-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-800/50 backdrop-blur-sm flex items-center justify-center text-[10px] text-white font-bold">{i}</div>)}
                        </div>
                        <div className="text-xs text-indigo-300 font-medium flex items-center gap-1">
                            Desenvolvedor : {db.igreja?.saas_nome_desenvolvedor || "PATRICK PESSOA"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/2 bg-white/80 backdrop-blur-xl p-8 sm:p-16 flex flex-col justify-center relative">
                <div className="mb-8 flex flex-col text-center lg:text-left animate-entrance gap-6">
                    <div className="flex flex-col lg:flex-row items-center gap-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] shadow-xl shadow-indigo-500/20 flex items-center justify-center p-3 border-2 border-white shrink-0 transform hover:scale-105 transition-all animate-float">
                            {db.igreja?.logo ? <img src={db.igreja.logo} alt="Logo Igreja" className="w-full h-full object-contain drop-shadow-md" /> : <Building2 className="text-indigo-400" size={32}/>}
                        </div>
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1.5">{db.igreja?.nome || "Igreja Local"}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70 inline-block bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">GIPP v7.1.0</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Acesso ao Painel</h3>
                        <p className="text-slate-500 font-medium text-sm">Informe as suas credenciais para continuar.</p>
                    </div>
                </div>
                
                {/* MODIFICADO: Oculta a barra de abas se for um dispositivo móvel */}
                {!isMobileDevice && (
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                        <button type="button" onClick={() => { setLoginMode('admin'); setIsFirstAccess(false); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Administração</button>
                        <button type="button" onClick={() => setLoginMode('membro')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${loginMode === 'membro' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sou Membro</button>
                    </div>
                )}

                <MobilePushCompatibilityCheck />

                <form onSubmit={handleLogin} className="space-y-6">
                    {!isFirstAccess ? (
                        <>
                            <div className="space-y-2 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{loginMode === 'admin' ? 'Utilizador' : 'Nome do Membro'}</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
                                        placeholder={loginMode === 'admin' ? "O seu login de acesso" : "Ex: João da Silva"} 
                                        value={loginData.user} 
                                        onChange={e => { setLoginData({...loginData, user: e.target.value}); if(loginMode==='membro') setShowMemberDropdown(true); }} 
                                        onFocus={() => { if(loginMode==='membro') setShowMemberDropdown(true); }}
                                        onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                                    />
                                </div>
                                {loginMode === 'membro' && showMemberDropdown && loginData.user && (
                                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                        {(db.membros || []).filter(m => m && typeof m.nome === 'string' && m.nome.toLowerCase().includes((loginData.user || '').toLowerCase())).map(m => (
                                            <div key={m.id} onClick={() => { setLoginData({...loginData, user: m.nome}); setShowMemberDropdown(false); }} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm font-bold text-slate-700">
                                                {m.nome}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{loginMode === 'admin' ? 'Palavra-passe' : 'Senha do Portal'}</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                                    <input 
                                        type="password" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
                                        placeholder={loginMode === 'admin' ? "••••••••" : "A sua senha criada"} 
                                        value={loginData.pass} 
                                        onChange={e => setLoginData({...loginData, pass: e.target.value})} 
                                    />
                                </div>
                                {loginMode === 'membro' && (
                                    <div className="text-right mt-2">
                                        <button type="button" onClick={() => setIsFirstAccess(true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Primeiro Acesso? Crie sua senha aqui.</button>
                                    </div>
                                )}
                            </div>
                            <button className={`w-full text-white font-bold py-5 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-8 group ${loginMode === 'admin' ? 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/30'}`}>
                                Aceder ao Sistema <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </>
                    ) : firstAccessSuccessData ? (
                        <div className="space-y-6 animate-entrance text-center pb-4">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg shadow-emerald-500/20">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Cadastro feito com sucesso!</h3>
                            <p className="text-sm text-slate-500 font-medium">Os seus dados de acesso ao portal foram validados e a senha gravada.</p>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 mt-6">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-200 pb-2">Dados Registados</p>
                                <p className="text-sm font-bold text-slate-800">Nome: <span className="font-medium text-slate-600">{firstAccessSuccessData.nome}</span></p>
                                <p className="text-sm font-bold text-slate-800">Nascimento: <span className="font-medium text-slate-600">{formatDateLocal(firstAccessSuccessData.data_nascimento)}</span></p>
                            </div>
                            
                            <Button type="button" onClick={confirmFirstAccess} variant="success" className="w-full py-4 mt-8 shadow-lg shadow-emerald-500/30 text-base">
                                OK, Continuar
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-entrance">
                             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-4">
                                 <p className="text-xs font-bold text-emerald-800 flex items-center gap-2"><Lock size={14}/> Validação de Segurança</p>
                                 <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed">Informe o seu Nome Exato e Data de Nascimento para criar a sua senha de acesso ao portal.</p>
                             </div>
                             <div className="space-y-2 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none" 
                                    placeholder="Ex: João da Silva" 
                                    value={firstAccessData.nome} 
                                    onChange={e => { setFirstAccessData({...firstAccessData, nome: e.target.value}); setShowFirstAccessDropdown(true); }}
                                    onFocus={() => setShowFirstAccessDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowFirstAccessDropdown(false), 200)}
                                />
                                {showFirstAccessDropdown && firstAccessData.nome && (
                                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
                                        {(db.membros || []).filter(m => m && typeof m.nome === 'string' && m.nome.toLowerCase().includes((firstAccessData.nome || '').toLowerCase())).map(m => (
                                            <div key={m.id} onClick={() => { setFirstAccessData({...firstAccessData, nome: m.nome}); setShowFirstAccessDropdown(false); }} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm font-bold text-slate-700">
                                                {m.nome}
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Data de Nascimento</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none" value={firstAccessData.data_nascimento} onChange={e => setFirstAccessData({...firstAccessData, data_nascimento: e.target.value})} />
                             </div>
                             <div className="grid grid-cols-2 gap-4 pt-2">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nova Senha</label>
                                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none" value={firstAccessData.senha} onChange={e => setFirstAccessData({...firstAccessData, senha: e.target.value})} />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar Senha</label>
                                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none" value={firstAccessData.confirmar} onChange={e => setFirstAccessData({...firstAccessData, confirmar: e.target.value})} />
                                 </div>
                             </div>
                             <div className="flex gap-3 pt-4">
                                 <Button type="button" onClick={() => { setIsFirstAccess(false); setFirstAccessSuccessData(null); }} variant="ghost" className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50">Voltar</Button>
                                 <Button type="submit" variant="success" className="flex-1 shadow-emerald-500/30">Criar Senha</Button>
                             </div>
                        </div>
                    )}
                </form>
                
                {/* NOVO: Botão dedicado de instalação com Modal de Fallback */}
                <button 
                    type="button"
                    onClick={() => {
                        setInstallStep(1);
                        setInstallDeviceType(null);
                        setInstallMobileOS(null);
                        setIsNotificationConfirmed(false);
                        setShowInstallGuide(true);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-slate-100 to-indigo-50/50 hover:from-indigo-100 hover:to-indigo-50/50 text-slate-700 hover:text-indigo-800 font-bold py-4 rounded-2xl transition-all shadow-sm border border-slate-200 hover:border-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <DownloadCloud size={20} className="text-indigo-600 animate-pulse"/> 
                    Instalar Sistema GIPP
                </button>
                
                {loginMode === 'admin' ? (
                    <p className="text-center mt-8 text-xs text-slate-400 font-medium">
                        Esqueceu a sua palavra-passe? Contacte o administrador master.
                    </p>
                ) : (
                    <div className="mt-8 p-5 bg-emerald-50/80 backdrop-blur-sm rounded-3xl border border-emerald-200/50 items-center gap-5 animate-entrance shadow-inner hidden md:flex">
                        <div className="bg-white p-2 rounded-2xl shadow-sm shrink-0 border border-emerald-100">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}&color=047857`} 
                                alt="QR Code Portal do Membro" 
                                className="w-16 h-16 object-contain" 
                            />
                        </div>
                        <div>
                            <h4 className="font-black text-emerald-800 text-sm mb-1 flex items-center gap-1"><Smartphone size={16}/> Aceder pelo Smartphone / Tablet</h4>
                            <p className="text-xs text-emerald-600/90 font-medium leading-relaxed">
                                Faça scan ao QR Code com a câmara do seu Smartphone / Tablet para abrir o Portal do Membro exatamente neste link.
                            </p>
                        </div>
                    </div>
                )}

                {/* NOVO: Atalho discreto para administradores logarem pelo telemóvel, caso precisem */}
                {isMobileDevice && loginMode === 'membro' && (
                    <button 
                        type="button" 
                        onClick={() => { setLoginMode('admin'); setIsFirstAccess(false); }} 
                        className="w-full mt-6 text-[10px] font-bold text-slate-300 hover:text-indigo-500 transition-colors uppercase tracking-widest text-center"
                    >
                        Acesso Administrativo
                    </button>
                )}
            </div>
        </div>

        {/* MODAL DE GUIA DE INSTALAÇÃO DA APP */}
        {showInstallGuide && (
            <div className="fixed inset-0 bg-slate-900/85 z-[11000] flex items-center justify-center p-4 backdrop-blur-md animate-entrance overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative border border-white/20 flex flex-col my-8"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl"></div>
                        
                        <button 
                            type="button" 
                            onClick={() => setShowInstallGuide(false)} 
                            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 bg-white/10 rounded-xl">
                                <DownloadCloud size={24} className="text-white animate-bounce" />
                            </span>
                            <span className="text-xs font-bold tracking-widest uppercase bg-indigo-500/55 px-2.5 py-1 rounded-full text-indigo-100">Portal SaaS Certificado</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mt-1">Assistente de Instalação GIPP</h3>
                        <p className="text-indigo-100/90 text-xs font-medium mt-1 leading-relaxed">
                            Configure seu aplicativo dedicado ao seu domínio SaaS e ative notificações em tempo real.
                        </p>

                        {/* Step indicators */}
                        <div className="flex items-center justify-between mt-8 relative">
                            {/* Line connector */}
                            <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-indigo-400/30 z-0"></div>
                            {/* Line connector progress */}
                            <div 
                                className="absolute top-4 left-[10%] h-[2px] bg-indigo-200 transition-all duration-350 z-0"
                                style={{ width: installStep === 1 ? '0%' : installStep === 2 ? '40%' : '85%' }}
                            ></div>

                            <div className="flex flex-col items-center z-10 relative cursor-pointer" onClick={() => setInstallStep(1)}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 1 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                                    1
                                </div>
                                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Dispositivo</span>
                            </div>

                            <div className="flex flex-col items-center z-10 relative cursor-pointer" onClick={() => installDeviceType ? setInstallStep(2) : null}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 2 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                                    2
                                </div>
                                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Notificações</span>
                            </div>

                            <div className="flex flex-col items-center z-10 relative cursor-pointer" onClick={() => (installDeviceType && isNotificationConfirmed) ? setInstallStep(3) : null}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 3 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                                    3
                                </div>
                                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Instalação</span>
                            </div>
                        </div>
                    </div>

                    {/* Body contents */}
                    <div className="p-8 flex-1 bg-slate-50/50">
                        <AnimatePresence mode="wait">
                            {installStep === 1 && (
                                <motion.div 
                                    key="step1" 
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h4 className="text-slate-800 font-black text-lg">Qual o seu dispositivo de acesso?</h4>
                                        <p className="text-slate-500 text-xs font-medium mt-1">Escolha a plataforma abaixo para que o assistente possa gerar as instruções exatas e o instalador específico.</p>
                                    </div>

                                    {/* Main Selection Options */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Smartphone/Tablet Card */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInstallDeviceType('smartphone');
                                            }}
                                            className={`p-6 rounded-[2rem] text-left border-2 transition-all cursor-pointer flex flex-col gap-4 relative group hover:shadow-lg ${installDeviceType === 'smartphone' ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        >
                                            <div className={`p-4 rounded-xl w-fit ${installDeviceType === 'smartphone' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'} transition-all`}>
                                                <Smartphone size={24} />
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-slate-800 text-base">Smartphone / Tablet</h5>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Dispositivos móveis, telefones celulares e tablets Android ou Apple iOS.</p>
                                            </div>
                                            {installDeviceType === 'smartphone' && (
                                                <div className="absolute top-6 right-6 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                                                    <Check size={14} className="stroke-[3]" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Desktop Card */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInstallDeviceType('desktop');
                                                setInstallMobileOS(null);
                                                setInstallStep(2); // Automatically forward to stage 2 since desktop needs no OS splits
                                            }}
                                            className={`p-6 rounded-[2rem] text-left border-2 transition-all cursor-pointer flex flex-col gap-4 relative group hover:shadow-lg ${installDeviceType === 'desktop' ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        >
                                            <div className={`p-4 rounded-xl w-fit ${installDeviceType === 'desktop' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'} transition-all`}>
                                                <Cpu size={24} />
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-slate-800 text-base">Computador / Portátil</h5>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Computadores de secretária ou laptops rodando Windows, macOS ou Linux.</p>
                                            </div>
                                            {installDeviceType === 'desktop' && (
                                                <div className="absolute top-6 right-6 bg-indigo-500 text-white rounded-full p-1 shadow-sm">
                                                    <Check size={14} className="stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Sub options if Smartphone is selected */}
                                    {installDeviceType === 'smartphone' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3 p-5 bg-emerald-50/20 rounded-[2rem] border border-emerald-100/70"
                                        >
                                            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Especifique o Sistema Operacional:</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInstallMobileOS('android');
                                                        setInstallStep(2);
                                                    }}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${installMobileOS === 'android' ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                                >
                                                    <Smartphone size={16} /> Android (Samsung/Outros)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInstallMobileOS('ios');
                                                        setInstallStep(2);
                                                    }}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${installMobileOS === 'ios' ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                                >
                                                    <Apple size={16} /> Apple iOS (iPhone/iPad)
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* SaaS Context Alert */}
                                    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200/60 leading-relaxed text-left">
                                        <strong className="text-slate-800 text-xs flex items-center gap-1.5 font-bold mb-1">
                                            <Globe size={14} className="text-indigo-500" /> Domínio SaaS Identificado
                                        </strong>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Como o GIPP é uma solução SaaS, sua instalação está acoplada a este link exclusivo do sistema. Pode partilhar ou salvar o link abaixo:
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-200/80">
                                            <code className="text-xs text-indigo-705 font-mono font-bold select-all truncate flex-1">{window.location.href}</code>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    addToast("Link SaaS copiado com sucesso!", "success");
                                                }}
                                                className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[10px] uppercase tracking-wider font-extrabold rounded-lg border border-indigo-150 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                            >
                                                <Copy size={12} /> Copiar
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {installStep === 2 && (
                                <motion.div 
                                    key="step2" 
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h4 className="text-slate-800 font-black text-lg">Habilitar Alertas e Notificações</h4>
                                        <p className="text-slate-500 text-xs font-medium mt-1">Esteja sempre atualizado com eventos urgentes, tarefas, comunicados da igreja e relatórios emitidos diretamente no seu dispositivo.</p>
                                    </div>

                                    {/* Live notification mock layout */}
                                    <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 relative overflow-hidden max-w-sm mx-auto">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center border border-indigo-500/20 text-white text-xs shrink-0 font-black animate-pulse">
                                                GIPP
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-slate-200">Avisos da Comunidade</span>
                                                    <span className="text-[9px] font-medium text-slate-500 font-mono">Agora</span>
                                                </div>
                                                <p className="text-xs text-slate-200 font-bold mt-0.5 truncate">🔔 Alerta Importante!</p>
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">Dispositivo configurado. O aplicativo está pronto para receber notificações de alta prioridade.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prompter box */}
                                    <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                            <Bell size={24} className="animate-bounce" />
                                        </div>
                                        <div>
                                            <h5 className="font-extrabold text-slate-800 text-sm">Passo Importante: Ativar Alertas do Navegador</h5>
                                            <p className="text-xs text-slate-500 leading-relaxed mt-1">Clique no botão abaixo para autorizar o navegador a exibir alertas na sua tela de bloqueio e central de atividades.</p>
                                        </div>
                                        
                                        <button 
                                            type="button" 
                                            onClick={async () => {
                                                try {
                                                    if ('Notification' in window) {
                                                        const res = await Notification.requestPermission();
                                                        if (res === 'granted') {
                                                            setIsNotificationConfirmed(true);
                                                            addToast("Notificações autorizadas com sucesso no dispositivo!", "success");
                                                        } else {
                                                            setIsNotificationConfirmed(true); // Força a confirmação visual de aceitação no fluxo
                                                            addToast("Seu navegador requer desbloqueio manual de notificações.", "info");
                                                        }
                                                    } else {
                                                        setIsNotificationConfirmed(true);
                                                        addToast("Modo offline simulado de notificações ativado!", "success");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    setIsNotificationConfirmed(true);
                                                }
                                            }}
                                            className={`py-3 px-6 rounded-2xl font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 ${isNotificationConfirmed ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-indigo-500/20'}`}
                                        >
                                            {isNotificationConfirmed ? <CheckCircle size={16} /> : <Bell size={16} />} 
                                            {isNotificationConfirmed ? 'Notificações Autorizadas & Confirmadas' : 'Testar & Ativar Notificações no Dispositivo'}
                                        </button>
                                    </div>

                                    {/* Obligatory confirmation checklist for forcing the confirmation */}
                                    <div className={`p-4 rounded-2xl border transition-all text-left ${isNotificationConfirmed ? 'bg-emerald-50/40 border-emerald-250 text-emerald-800' : 'bg-amber-50/40 border-amber-250 text-amber-800'}`}>
                                        <label className="flex items-start gap-3 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={isNotificationConfirmed} 
                                                onChange={(e) => setIsNotificationConfirmed(e.target.checked)} 
                                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                                            />
                                            <div className="text-left">
                                                <strong className="text-xs font-black block">Declaro que desejo receber alertas</strong>
                                                <span className="text-[11px] font-medium leading-relaxed block text-slate-500 mt-0.5">
                                                    Ao marcar, declaro consentimento para o recebimento de avisos de reuniões, escala e comunicados oficiais no Smartphone / Tablet. (Dispositivo atual: <b className="text-slate-700 capitalize">{installDeviceType || 'Computador'}</b>)
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Action row with back and continue buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setInstallStep(1)} 
                                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            Voltar
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setInstallStep(3)} 
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5 ${isNotificationConfirmed ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-250'}`}
                                        >
                                            Seguinte <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {installStep === 3 && (
                                <motion.div 
                                    key="step3" 
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="text-left">
                                        <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full tracking-wider uppercase">Fase Final</span>
                                        <h4 className="text-slate-800 font-black text-lg mt-1">Siga o Guia do Dispositivo</h4>
                                        <p className="text-slate-500 text-xs font-medium mt-0.5">O seu acesso exclusivo já foi otimizado para o seu domínio SaaS específico.</p>
                                    </div>

                                    {/* COMPLEMENTARY LINK AND QR CONTAINER */}
                                    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 leading-relaxed text-left space-y-2">
                                        <strong className="text-slate-800 text-xs flex items-center gap-1.5 font-bold">
                                            <ShieldCheck size={14} className="text-indigo-600" /> Confirmação de Link de Segurança SaaS
                                        </strong>
                                        <code className="text-xs text-indigo-800 font-mono font-bold block select-all bg-white p-2 rounded-xl text-center border border-slate-200/50 truncate">
                                            {window.location.href}
                                        </code>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                addToast("Link do sistema copiado!", "success");
                                            }}
                                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <Copy size={12} /> Copiar Link Ativo para Colar no Smartphone
                                        </button>
                                    </div>

                                    {/* CONDITIONAL INSTALL GUIDES */}
                                    {installDeviceType === 'desktop' ? (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                                    <span className="p-1 px-2.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg">Computador (PC/Mac)</span>
                                                    <span className="text-xs font-semibold text-slate-500">Chrome / Edge / Safari</span>
                                                </div>
                                                
                                                {/* PWA Direct install button trigger if available */}
                                                {installPrompt && (
                                                    <div className="bg-white p-4 rounded-xl border border-indigo-200 flex items-center justify-between gap-3 shadow-inner">
                                                        <div className="min-w-0">
                                                            <strong className="text-xs font-black text-slate-800 block">Atalho de um Clique Ativo</strong>
                                                            <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">O navegador suporta e ativou a instalação automática nesta sessão.</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={async () => {
                                                                if (installPrompt) {
                                                                    try {
                                                                        installPrompt.prompt();
                                                                        const { outcome } = await installPrompt.userChoice;
                                                                        if (outcome === 'accepted') setInstallPrompt(null);
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors shrink-0"
                                                        >
                                                            <DownloadCloud size={14} /> Instalar Agora
                                                        </button>
                                                    </div>
                                                )}

                                                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                        <p>Verifique a barra de endereços do navegador no topo, ao lado direito do link.</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                        <p>Clique no ícone de <b>Instalação</b> de aplicativo (geralmente uma caixa com uma seta para baixo ou sinal de mais <kbd className="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-[9px] text-slate-600 inline-block align-middle font-mono font-bold shadow-sm">[+]</kbd>).</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                        <p>Alternativamente, toque nos <b>Três Pontos</b> de ferramentas adicionais de configuração e clique em <b>"Instalar Aplicação..."</b>.</p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : installMobileOS === 'android' ? (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-slate-50 to-emerald-50/30 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                                    <span className="p-1 px-2.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg">Android Smartphone / Tablet</span>
                                                    <span className="text-xs font-semibold text-slate-500">Navegador Chrome</span>
                                                </div>

                                                {installPrompt && (
                                                    <div className="bg-white p-4 rounded-xl border border-emerald-250 flex items-center justify-between gap-3 shadow-inner">
                                                        <div className="min-w-0">
                                                            <strong className="text-xs font-black text-slate-800 block">Autodetecção Android Ativa</strong>
                                                            <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">Toque no atalho certificado para efetuar a instalação instantânea.</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={async () => {
                                                                if (installPrompt) {
                                                                    try {
                                                                        installPrompt.prompt();
                                                                        const { outcome } = await installPrompt.userChoice;
                                                                        if (outcome === 'accepted') setInstallPrompt(null);
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors shrink-0"
                                                        >
                                                            <DownloadCloud size={14} /> Instalar Agora
                                                        </button>
                                                    </div>
                                                )}

                                                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                        <p>Abra o <b>Google Chrome</b> do aparelho e use exatamente o link do seu SaaS corporativo.</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                        <p>Toque no ícone de <b>Menu (Três Pontos)</b> no canto superior direito do navegador Chrome.</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                        <p>Selecione a opção <b>"Instalar Aplicativo"</b> ou <b>"Adicionar ao Ecrã Inicial"</b>.</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                                                        <p>Confirme a operação de atalho seguro e o aplicativo funcionará isolado das abas normais!</p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/20 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                                    <span className="p-1 px-2.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg">Apple iOS (iPhone / iPad)</span>
                                                    <span className="text-xs font-semibold text-slate-500">Navegador Safari Estrito</span>
                                                </div>

                                                <div className="bg-white p-3.5 rounded-xl border border-indigo-150 leading-relaxed">
                                                    <p className="text-[10px] text-amber-700 flex items-start gap-1 font-extrabold leading-normal">
                                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Atenção: No iPhone/iPad, a Apple restringe a instalação PWA automática. Obrigatoriamente, utilize o navegador Safari nativo para habilitar.
                                                    </p>
                                                </div>

                                                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                        <p>Abra o navegador oficial de sistema <b>Safari</b> no seu iPhone/iPad.</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                        <p>Aceda ao link da igreja (exibido e copiado acima no assistente).</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                        <p>Clique no botão central de <b>Partilha / Compartilhamento <Share2 size={12} className="inline inline-block text-indigo-600 ml-1" /></b> (ícone de um quadrado com uma seta vertical para cima).</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                                                        <p>Role o menu inferior para baixo e toque em <b>"Adicionar ao Ecrã Principal"</b> (Add to Home Screen).</p>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                                                        <p>Escolha o nome desejado e clique em <b>"Adicionar"</b> no canto superior direito para fixar.</p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action row with back and close buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setInstallStep(2)} 
                                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            Voltar ao Alerta
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setShowInstallGuide(false);
                                                addToast("Assistente concluído! Siga os passos acima no seu dispositivo para concluir o acesso completo.", "success");
                                            }} 
                                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 text-center flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCheck size={16} /> Entendi e Concluí
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        )}

        </div> 
      </ChurchContext.Provider>
    ); 
  }

  return (
    <ChurchContext.Provider value={ctxValues}>
        <GlobalStyles />
        <OsThemeStyles />
        <DynamicTheme color={db.igreja?.cor_tema} />
        <DynamicPrintStyles orientation={printOrientation} marginType={printMarginType} mode={printMode} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <FloatingChatWidget />
        {isSystemBooting && <SplashScreen onComplete={() => setIsSystemBooting(false)} corTema={db.igreja?.cor_tema || '#6366f1'} themeBg={osTheme} isDevMode={user?.id === 'dev'} isMaryMode={user?.usuario?.toLowerCase() === 'mary'} saasSettings={db.igreja} />}
        {confirmDialog.isOpen && <ConfirmModal isOpen={confirmDialog.isOpen} onClose={()=>setConfirmDialog({...confirmDialog, isOpen:false})} onConfirm={confirmDialog.onConfirm} onCancel={confirmDialog.onCancel} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={confirmDialog.cancelText} variant={confirmDialog.variant} />}
        {modalOpen && <GenericModal isOpen={modalOpen} onClose={closeModal} type={modalType} data={formData} setData={setFormData} onSave={handleSaveForm} />}
        <BackupModal backupState={backupState} onConfirm={handleBackupConfirm} onCancel={handleBackupCancel} />
        {previewOpen && (
            <DocumentPreviewModal 
                isOpen={previewOpen} 
                onClose={() => setPreviewOpen(false)} 
                mode={printMode} 
                data={printData} 
                palette={printPalette}
                setPalette={setPrintPalette}
                marginType={printMarginType}
                setMarginType={setPrintMarginType}
                orientation={printOrientation}
                setOrientation={setPrintOrientation}
                contentScale={printContentScale}
                setContentScale={setPrintContentScale}
            />
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileSelect} />
        <div className={`print-area ${printOrientation === 'landscape' ? 'print-landscape' : 'print-portrait'} ${printMode?.startsWith('cert_') ? 'cert-colorized' : ''}`}>
            <PrintSystem mode={printMode} data={printData} palette={printPalette} marginType={printMarginType} contentScale={printContentScale} orientation={printOrientation} />
        </div>
        <div className="screen-content">
            {user.tipo === 'membro' ? <MemberPortalLayout /> : <AppLayout />}
        </div>
    </ChurchContext.Provider>
  );
}