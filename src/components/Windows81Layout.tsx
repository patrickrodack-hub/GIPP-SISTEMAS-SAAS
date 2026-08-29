import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, Plus, Edit, Trash2, Printer, Search, X, BookOpen, GraduationCap, Shield, Database, Save, RefreshCw, 
  Phone, Mail, Code, Info, Home, Wifi, Sparkles, Palette,
  CheckCircle2, Minus, Maximize2, FileSpreadsheet, Lock, AlertTriangle,
  Play, Square, Terminal, Cpu, HardDrive, HelpCircle, Layers, Sliders,
  QrCode, BookOpenText, DollarSign, ArrowUpCircle, ArrowDownCircle, Briefcase,
  History, ShieldCheck, Newspaper, Award, Calendar, FolderTree, Check,
  Gamepad2, Music, Video, Heart, Globe, Baby, Car, Package, Share2, HeartHandshake, Book, MessageCircle, Badge,
  CheckSquare, Activity, FileCheck, ImagePlus, UserCheck, ChevronDown, ChevronRight, Volume2, VolumeX,
  Power, ArrowLeft, ArrowRight, CornerDownRight, Monitor, Folder, ExternalLink, ChevronUp, Bell, BatteryCharging,
  SlidersHorizontal, Smartphone, Tablet
} from 'lucide-react';
import {
  GoogleGLogo,
  GoogleMeetIcon,
  GoogleSheetsIcon,
  GoogleDocsIcon,
  GoogleTasksIcon,
  GoogleCalendarIcon,
  GoogleGmailIcon,
  GoogleFormsIcon,
  GoogleClassroomIcon
} from './GoogleIcons';

// Windows 8.1 4-Pane angled Start Button Logo
export const Windows81Logo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 18 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 88 88" 
      fill="currentColor" 
      className={`shrink-0 transition-transform ${className}`}
    >
      <path d="M0,12.5 L35.5,7.5 L35.5,41.5 L0,41.5 Z M0,46.5 L35.5,46.5 L35.5,80.5 L0,75.5 Z M39.5,7 L88,0 L88,41.5 L39.5,41.5 Z M39.5,46.5 L88,46.5 L88,88 L39.5,81 Z" />
    </svg>
  );
};

export interface Windows81LayoutProps {
  view: string;
  setView: (view: string) => void;
  user: any;
  db: any;
  mMeta: {
    id?: string;
    label: string;
    icon?: any;
    color?: string;
  };
  isModuleAllowed: (id: string) => boolean;
  hasPermission: (access: string) => boolean;
  access: string;
  CurrentModule: any;
  currentProps: any;
  handleLogoutRequest: () => void;
  setIsScreenLocked: (locked: boolean) => void;
  theme: string;
  setTheme: (t: string) => void;
  osTheme: string;
  setOsTheme: (t: string) => void;
  animBgEnabled: boolean;
  setAnimBgEnabled: (enabled: boolean) => void;
  ALL_AVAILABLE_MODULES: any[];
}

// Windows 8.1 Accent Color Themes
export interface Win81Accent {
  id: string;
  name: string;
  primary: string;
  darkBg: string;
  lightBg: string;
  tileBg: string;
  taskbarBg: string;
  windowBorder: string;
  highlight: string;
}

export const WIN81_ACCENTS: Win81Accent[] = [
  { id: 'teal', name: 'Turquesa Oficial', primary: '#008272', darkBg: '#004B40', lightBg: '#00A896', tileBg: '#008272', taskbarBg: '#005A4E', windowBorder: '#008272', highlight: '#00BFA5' },
  { id: 'cyan', name: 'Azul Windows 8.1', primary: '#0078D7', darkBg: '#003E73', lightBg: '#0099FF', tileBg: '#0078D7', taskbarBg: '#004D8C', windowBorder: '#0078D7', highlight: '#33B0FF' },
  { id: 'cobalt', name: 'Azul Cobalto', primary: '#004E98', darkBg: '#00264D', lightBg: '#1D65A6', tileBg: '#004E98', taskbarBg: '#003366', windowBorder: '#004E98', highlight: '#3A86FF' },
  { id: 'purple', name: 'Roxo Real', primary: '#68217A', darkBg: '#3B0D47', lightBg: '#8A2BE2', tileBg: '#68217A', taskbarBg: '#4A1559', windowBorder: '#68217A', highlight: '#A855F7' },
  { id: 'magenta', name: 'Magenta Vibrante', primary: '#B4009E', darkBg: '#610055', lightBg: '#D80073', tileBg: '#B4009E', taskbarBg: '#7D006E', windowBorder: '#B4009E', highlight: '#F43F5E' },
  { id: 'crimson', name: 'Vermelho Carmesim', primary: '#C42B1C', darkBg: '#6A1009', lightBg: '#E81123', tileBg: '#C42B1C', taskbarBg: '#8B140B', windowBorder: '#C42B1C', highlight: '#FF4D4F' },
  { id: 'orange', name: 'Laranja Mango', primary: '#D83B01', darkBg: '#731F00', lightBg: '#EA580C', tileBg: '#D83B01', taskbarBg: '#962900', windowBorder: '#D83B01', highlight: '#FB923C' },
  { id: 'emerald', name: 'Verde Esmeralda', primary: '#107C41', darkBg: '#084021', lightBg: '#16A34A', tileBg: '#107C41', taskbarBg: '#0B572D', windowBorder: '#107C41', highlight: '#4ADE80' },
  { id: 'charcoal', name: 'Grafite Escuro', primary: '#2B2B2B', darkBg: '#171717', lightBg: '#3F3F46', tileBg: '#2B2B2B', taskbarBg: '#1E1E1E', windowBorder: '#3F3F46', highlight: '#71717A' },
  { id: 'navy', name: 'Azul Marinho', primary: '#1B365D', darkBg: '#0B192C', lightBg: '#2A5298', tileBg: '#1B365D', taskbarBg: '#12243E', windowBorder: '#1B365D', highlight: '#60A5FA' }
];

export const WIN81_PATTERNS = [
  { id: 'waves', name: 'Ondas Ribbon (Oficial)', css: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,0,0,0.3) 0%, transparent 70%)' },
  { id: 'circuit', name: 'Geometria Moderna', css: 'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0.08)), linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0.08))' },
  { id: 'mesh', name: 'Gradiente Suave', css: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.25) 0%, transparent 50%)' },
  { id: 'clean', name: 'Metro Puro', css: 'none' }
];

export const Windows81Layout: React.FC<Windows81LayoutProps> = ({
  view,
  setView,
  user,
  db,
  mMeta,
  isModuleAllowed,
  hasPermission,
  access,
  CurrentModule,
  currentProps,
  handleLogoutRequest,
  setIsScreenLocked,
  theme,
  setTheme,
  osTheme,
  setOsTheme,
  animBgEnabled,
  setAnimBgEnabled,
  ALL_AVAILABLE_MODULES,
}) => {
  // Navigation & View States
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [startScreenView, setStartScreenView] = useState<'tiles' | 'all_apps'>('tiles');
  const [isCharmsBarOpen, setIsCharmsBarOpen] = useState(false);
  const [activeCharm, setActiveCharm] = useState<'search' | 'share' | 'settings' | 'devices' | null>(null);
  const [isWindowMaximized, setIsWindowMaximized] = useState(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [isMetroAppMode, setIsMetroAppMode] = useState(false); // Immersive full-screen modern app mode
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Customization: Accent color & pattern
  const [accentId, setAccentId] = useState<string>(() => {
    return localStorage.getItem('gipp_win81_accent') || 'teal';
  });
  const [patternId, setPatternId] = useState<string>(() => {
    return localStorage.getItem('gipp_win81_pattern') || 'waves';
  });
  const [wallpaperMode, setWallpaperMode] = useState<'accent' | 'desktop_hero' | 'custom'>(() => {
    return (localStorage.getItem('gipp_win81_wallmode') as any) || 'accent';
  });

  // System Tray & Flyouts
  const [trayFlyout, setTrayFlyout] = useState<'calendar' | 'volume' | 'network' | 'power' | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [liveFlipIndex, setLiveFlipIndex] = useState(0);

  // Desktop Context Menu
  const [desktopMenuPos, setDesktopMenuPos] = useState<{ x: number; y: number } | null>(null);

  const activeAccent = useMemo(() => {
    return WIN81_ACCENTS.find(a => a.id === accentId) || WIN81_ACCENTS[0];
  }, [accentId]);

  const activePattern = useMemo(() => {
    return WIN81_PATTERNS.find(p => p.id === patternId) || WIN81_PATTERNS[0];
  }, [patternId]);

  // Handle accent change
  const handleAccentChange = (id: string) => {
    setAccentId(id);
    try {
      localStorage.setItem('gipp_win81_accent', id);
    } catch {}
    playAudioFeedback('click');
  };

  const handlePatternChange = (id: string) => {
    setPatternId(id);
    try {
      localStorage.setItem('gipp_win81_pattern', id);
    } catch {}
    playAudioFeedback('click');
  };

  // Sound Synthesizer for Windows 8.1 Audio Effects
  const playAudioFeedback = (type: 'click' | 'navigation' | 'start' | 'charm' | 'notification') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'click' || type === 'navigation') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'start') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.06, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.12);
        });
      } else if (type === 'charm') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {}
  };

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Tiles flipping animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFlipIndex(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Hotkeys: Win/Super, Win+C (Charms), Win+F (Search), Win+I (Settings), Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '');

      // Win+C: Charms Bar
      if ((e.metaKey || e.altKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCharmsBarOpen(prev => !prev);
        playAudioFeedback('charm');
        return;
      }

      // Win+F or Ctrl+F (when not inside editor): Search Charm
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !isInput) {
        e.preventDefault();
        setIsCharmsBarOpen(true);
        setActiveCharm('search');
        playAudioFeedback('charm');
        return;
      }

      // Win+I: Settings Charm
      if ((e.metaKey || e.altKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsCharmsBarOpen(true);
        setActiveCharm('settings');
        playAudioFeedback('charm');
        return;
      }

      // Escape key closes start screen, charms bar or tray flyouts
      if (e.key === 'Escape') {
        if (isCharmsBarOpen) {
          setIsCharmsBarOpen(false);
          setActiveCharm(null);
        } else if (isStartOpen) {
          setIsStartOpen(false);
        } else if (trayFlyout) {
          setTrayFlyout(null);
        } else if (desktopMenuPos) {
          setDesktopMenuPos(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCharmsBarOpen, isStartOpen, trayFlyout, desktopMenuPos]);

  // When view changes, unminimize window and close start screen
  useEffect(() => {
    setIsWindowMinimized(prev => prev ? false : prev);
    setIsStartOpen(prev => prev ? false : prev);
  }, [view]);

  // Dynamic Live Data stats from Church Context
  const totalMembros = db?.membros?.length || 0;
  const totalEntradas = db?.financeiro_entradas?.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0) || 0;
  const totalSaidas = db?.financeiro_saidas?.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0) || 0;
  const saldoCaixa = totalEntradas - totalSaidas;
  const totalVisitantes = db?.visitantes?.length || 0;

  // Filtered modules for All Apps & Search
  const filteredModules = useMemo(() => {
    return ALL_AVAILABLE_MODULES.filter(m => {
      if (!isModuleAllowed(m.id)) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.id.startsWith('google_') && 'google'.includes(q))
      );
    });
  }, [ALL_AVAILABLE_MODULES, isModuleAllowed, searchQuery]);

  // Grouped modules for "All Apps" Screen (Alphabetical)
  const groupedModules = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredModules.forEach(m => {
      const char = m.label.charAt(0).toUpperCase();
      const letter = /^[A-Z]$/.test(char) ? char : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(m);
    });
    return Object.keys(groups).sort().map(letter => ({
      letter,
      modules: groups[letter]
    }));
  }, [filteredModules]);

  // Pinned taskbar shortcuts
  const taskbarShortcuts = [
    { id: 'dashboard', label: 'Dashboard GIPP', icon: LayoutDashboard, color: '#0078D7' },
    { id: 'secretaria_integrada', label: 'Secretaria & Agenda', icon: FileText, color: '#107C41' },
    { id: 'cad_membro', label: 'Rol de Membros', icon: Users, color: '#D83B01' },
    { id: 'fin_entrada', label: 'Livro Caixa', icon: ArrowUpCircle, color: '#008272' },
    { id: 'assistente_ai', label: 'Pastoral IA', icon: Sparkles, color: '#68217A' },
    { id: 'google_meet', label: 'Google Meet', icon: GoogleMeetIcon, isGoogle: true },
    { id: 'google_sheets', label: 'Google Sheets', icon: GoogleSheetsIcon, isGoogle: true },
    { id: 'google_docs', label: 'Google Docs', icon: GoogleDocsIcon, isGoogle: true },
    { id: 'curso_teologia', label: 'Universidade Teológica', icon: BookOpen, color: '#B4009E' }
  ];

  const handleOpenModule = (moduleId: string) => {
    playAudioFeedback('navigation');
    setView(moduleId);
    setIsStartOpen(false);
    setIsCharmsBarOpen(false);
    setActiveCharm(null);
    setIsWindowMinimized(false);
  };

  const toggleStartScreen = () => {
    playAudioFeedback('start');
    setIsStartOpen(prev => !prev);
    setStartScreenView('tiles');
    setTrayFlyout(null);
    setIsCharmsBarOpen(false);
  };

  const WindowIcon = mMeta.icon || LayoutDashboard;

  return (
    <div 
      className="h-screen w-full flex flex-col font-sans select-none overflow-hidden relative text-white"
      style={{
        backgroundColor: activeAccent.darkBg,
        backgroundImage: activePattern.css !== 'none' ? activePattern.css : undefined,
        backgroundSize: activePattern.id === 'circuit' ? '40px 40px' : 'cover'
      }}
      onContextMenu={(e) => {
        // Desktop context menu when clicking on empty desktop
        if ((e.target as HTMLElement).classList.contains('win81-desktop-area')) {
          e.preventDefault();
          setDesktopMenuPos({ x: e.clientX, y: e.clientY });
        }
      }}
      onClick={() => {
        if (desktopMenuPos) setDesktopMenuPos(null);
      }}
    >
      {/* =========================================================================
          1. WINDOWS 8.1 START SCREEN (Modern UI / Metro Live Tiles)
          ========================================================================= */}
      {isStartOpen && (
        <div 
          className="absolute inset-0 z-50 flex flex-col animate-fadeIn overflow-hidden text-white"
          style={{
            backgroundColor: activeAccent.darkBg,
            backgroundImage: activePattern.css !== 'none' ? activePattern.css : undefined,
            backgroundSize: activePattern.id === 'circuit' ? '40px 40px' : 'cover'
          }}
        >
          {/* Top Start Screen Header: Title & User Profile / Power Controls */}
          <div className="flex items-center justify-between px-8 md:px-16 pt-8 pb-4 shrink-0">
            <div className="flex items-baseline gap-4">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white/95 drop-shadow-xs">
                {startScreenView === 'tiles' ? 'Iniciar' : 'Aplicativos'}
              </h1>
              {startScreenView === 'all_apps' && (
                <button
                  onClick={() => setStartScreenView('tiles')}
                  className="text-xs text-white/70 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} /> Voltar à tela inicial
                </button>
              )}
            </div>

            {/* Right: User Profile Avatar, Name, Power & Search */}
            <div className="flex items-center gap-3">
              {/* Search Charm trigger */}
              <button
                onClick={() => {
                  setIsCharmsBarOpen(true);
                  setActiveCharm('search');
                }}
                className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/90"
                title="Pesquisar [Win+F]"
              >
                <Search size={20} />
              </button>

              {/* Power Options Button */}
              <div className="relative">
                <button
                  onClick={() => setTrayFlyout(trayFlyout === 'power' ? null : 'power')}
                  className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/90"
                  title="Opções de Energia"
                >
                  <Power size={20} />
                </button>

                {trayFlyout === 'power' && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1F1F1F] border border-white/20 shadow-2xl p-1 z-50 animate-fadeIn">
                    <button
                      onClick={() => {
                        setIsScreenLocked(true);
                        setTrayFlyout(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#0078D7] text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Lock size={14} /> Bloquear Estação
                    </button>
                    <button
                      onClick={() => {
                        handleLogoutRequest();
                        setTrayFlyout(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-rose-700 text-white flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} /> Sair / Desconectar
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar & Name */}
              <div 
                onClick={() => {
                  setIsCharmsBarOpen(true);
                  setActiveCharm('settings');
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm hover:bg-white/10 cursor-pointer transition-colors"
                title="Configurações da Conta e Personalização"
              >
                <span className="text-sm font-semibold hidden sm:inline text-white/90">
                  {user?.nome || 'Operador GIPP'}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center font-bold text-xs">
                  {user?.fotoUrl || user?.foto ? (
                    <img src={user.fotoUrl || user.foto} alt={user?.nome} className="w-full h-full object-cover" />
                  ) : (
                    user?.nome?.charAt(0) || 'U'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              START SCREEN CONTENT: LIVE TILES GRID
              ========================================================================= */}
          {startScreenView === 'tiles' ? (
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 md:px-16 py-4 flex gap-10 items-start custom-scrollbar">
              
              {/* GROUP 1: GIPP & ADMINISTRAÇÃO ECLESIÁSTICA */}
              <div className="flex flex-col gap-3 shrink-0">
                <div className="text-xs font-semibold tracking-wider text-white/70 uppercase flex items-center gap-1.5">
                  <span>GIPP Eclesiástico</span>
                  <ChevronRight size={12} className="opacity-50" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 auto-rows-[120px]">
                  {/* Large / Wide Live Tile: Dashboard Geral */}
                  <div
                    onClick={() => handleOpenModule('dashboard')}
                    className="col-span-2 row-span-1 bg-[#0078D7] hover:brightness-110 active:scale-[0.98] transition-all p-3.5 flex flex-col justify-between cursor-pointer shadow-md relative overflow-hidden group border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <LayoutDashboard size={28} className="text-white group-hover:scale-110 transition-transform" />
                      <span className="bg-white/20 px-2 py-0.5 text-[10px] font-bold rounded-xs uppercase tracking-wider">
                        Ativo
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-bold truncate">Visão Geral & Dashboard</div>
                      <div className="text-xs text-white/80 flex items-center gap-2">
                        <span>{totalMembros} membros</span>
                        <span>•</span>
                        <span>R$ {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Secretaria Integrada */}
                  <div
                    onClick={() => handleOpenModule('secretaria_integrada')}
                    className="col-span-1 row-span-1 bg-[#107C41] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <FileText size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Secretaria & Atas</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Agenda & Certificados</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Rol de Membros */}
                  <div
                    onClick={() => handleOpenModule('cad_membro')}
                    className="col-span-1 row-span-1 bg-[#D83B01] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10 relative"
                  >
                    <Users size={24} className="text-white" />
                    <div className="absolute top-2 right-2 text-xl font-black opacity-85">{totalMembros}</div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Rol de Membros</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Membros & Obreiros</div>
                    </div>
                  </div>

                  {/* Wide Live Tile: Livro Caixa & Dízimos (Flipping content) */}
                  <div
                    onClick={() => handleOpenModule('fin_entrada')}
                    className="col-span-2 row-span-1 bg-[#008272] hover:brightness-110 active:scale-[0.98] transition-all p-3.5 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <CreditCard size={26} className="text-white" />
                      <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-xs">
                        R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Livro Caixa & Dízimos</div>
                      <div className="text-[11px] text-white/80">Entradas, saídas e conciliação bancária</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Pastoral IA */}
                  <div
                    onClick={() => handleOpenModule('assistente_ai')}
                    className="col-span-1 row-span-1 bg-[#68217A] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Sparkles size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Pastoral IA</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Assistente Bíblico</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Bíblia Sagrada */}
                  <div
                    onClick={() => handleOpenModule('biblia')}
                    className="col-span-1 row-span-1 bg-[#B4009E] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Book size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Bíblia de Estudo</div>
                      <div className="text-[10px] text-white/75 mt-0.5">66 Livros Offline</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GROUP 2: GOOGLE WORKSPACE & INTERATIVIDADE */}
              <div className="flex flex-col gap-3 shrink-0">
                <div className="text-xs font-semibold tracking-wider text-white/70 uppercase flex items-center gap-1.5">
                  <GoogleGLogo size={14} />
                  <span>Google & Produtividade</span>
                  <ChevronRight size={12} className="opacity-50" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 auto-rows-[120px]">
                  {/* Wide Live Tile: Google Meet */}
                  <div
                    onClick={() => handleOpenModule('google_meet')}
                    className="col-span-2 row-span-1 bg-[#00897B] hover:brightness-110 active:scale-[0.98] transition-all p-3.5 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <GoogleMeetIcon size={26} />
                      <span className="bg-white/20 px-2 py-0.5 text-[10px] font-bold rounded-xs uppercase">
                        Videoconferência
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Google Meet Eclesiástico</div>
                      <div className="text-[11px] text-white/80">Salas de oração, reuniões de obreiros e cultos online</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Google Sheets */}
                  <div
                    onClick={() => handleOpenModule('google_sheets')}
                    className="col-span-1 row-span-1 bg-[#0F9D58] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <GoogleSheetsIcon size={24} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Google Sheets</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Planilhas na Nuvem</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Google Docs */}
                  <div
                    onClick={() => handleOpenModule('google_docs')}
                    className="col-span-1 row-span-1 bg-[#4285F4] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <GoogleDocsIcon size={24} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Google Docs</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Documentos Oficiais</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Google Calendar */}
                  <div
                    onClick={() => handleOpenModule('google_calendar')}
                    className="col-span-1 row-span-1 bg-[#EA4335] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <GoogleCalendarIcon size={24} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Google Calendar</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Agenda Integrada</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Google Tasks */}
                  <div
                    onClick={() => handleOpenModule('google_tasks')}
                    className="col-span-1 row-span-1 bg-[#1A73E8] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <GoogleTasksIcon size={24} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Google Tasks</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Tarefas & Metas</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Gmail */}
                  <div
                    onClick={() => handleOpenModule('gmail_oficial')}
                    className="col-span-1 row-span-1 bg-[#D93025] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <GoogleGmailIcon size={24} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Gmail Eclesiástico</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Comunicação Oficial</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Gamificação & Quiz */}
                  <div
                    onClick={() => handleOpenModule('interativo')}
                    className="col-span-1 row-span-1 bg-[#8E24AA] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Gamepad2 size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Interatividade</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Quiz & Gamificação</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GROUP 3: CAPACITAÇÃO & TEOLOGIA */}
              <div className="flex flex-col gap-3 shrink-0">
                <div className="text-xs font-semibold tracking-wider text-white/70 uppercase flex items-center gap-1.5">
                  <GraduationCap size={14} />
                  <span>Capacitações & Ensino</span>
                  <ChevronRight size={12} className="opacity-50" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 auto-rows-[120px]">
                  {/* Wide Live Tile: Universidade Teológica */}
                  <div
                    onClick={() => handleOpenModule('curso_teologia')}
                    className="col-span-2 row-span-1 bg-[#004E98] hover:brightness-110 active:scale-[0.98] transition-all p-3.5 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <BookOpen size={26} className="text-white" />
                      <span className="bg-white/20 px-2 py-0.5 text-[10px] font-bold rounded-xs">
                        CGADB / CPAD
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Universidade Teológica GIPP</div>
                      <div className="text-[11px] text-white/80">Estudos Básico, Médio e Avançado</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Formação de Obreiros */}
                  <div
                    onClick={() => handleOpenModule('formacao_obreiros')}
                    className="col-span-1 row-span-1 bg-[#C42B1C] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Award size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Formação Obreiros</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Ministério & Liderança</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: EBD */}
                  <div
                    onClick={() => handleOpenModule('secretaria_ebd')}
                    className="col-span-1 row-span-1 bg-[#E65100] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <BookOpenText size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Escola Dominical</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Classes & Frequência</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Estúdio de Carteirinhas */}
                  <div
                    onClick={() => handleOpenModule('carteirinha_studio')}
                    className="col-span-1 row-span-1 bg-[#00838F] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Users size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Carteirinhas</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Estúdio de Impressão</div>
                    </div>
                  </div>

                  {/* Medium Live Tile: Configurações Visuais */}
                  <div
                    onClick={() => {
                      setIsCharmsBarOpen(true);
                      setActiveCharm('settings');
                    }}
                    className="col-span-1 row-span-1 bg-[#37474F] hover:brightness-110 active:scale-[0.98] transition-all p-3 flex flex-col justify-between cursor-pointer shadow-md border border-white/10"
                  >
                    <Palette size={24} className="text-white" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Personalização</div>
                      <div className="text-[10px] text-white/75 mt-0.5">Cores Windows 8.1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               START SCREEN: "ALL APPS" (TODOS OS APLICATIVOS) VIEW
               ========================================================================= */
            <div className="flex-1 overflow-y-auto px-8 md:px-16 py-4 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Search in All Apps */}
                <div className="relative max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar em todos os aplicativos..."
                    className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {groupedModules.map(group => (
                    <div key={group.letter} className="space-y-3">
                      <div className="text-2xl font-light border-b border-white/20 pb-1 text-white/80">
                        {group.letter}
                      </div>
                      <div className="space-y-1">
                        {group.modules.map(mod => {
                          const ModIcon = mod.icon || Folder;
                          return (
                            <button
                              key={mod.id}
                              onClick={() => handleOpenModule(mod.id)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-white/15 text-left transition-colors cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded-xs bg-[#0078D7] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                <ModIcon size={16} className="text-white" />
                              </div>
                              <span className="text-xs font-semibold text-white/90 truncate">
                                {mod.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Start Screen Switcher Arrow (⬇ / ⬆) */}
          <div className="h-12 flex items-center justify-center shrink-0">
            <button
              onClick={() => {
                playAudioFeedback('click');
                setStartScreenView(prev => prev === 'tiles' ? 'all_apps' : 'tiles');
              }}
              className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/80"
              title={startScreenView === 'tiles' ? 'Todos os Aplicativos' : 'Voltar aos Blocos'}
            >
              {startScreenView === 'tiles' ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. WINDOWS 8.1 CHARMS BAR (Slide-in Right Sidebar)
          ========================================================================= */}
      {/* Charms Trigger Zone (Hover in top-right or bottom-right corner) */}
      <div 
        onMouseEnter={() => {
          setIsCharmsBarOpen(true);
          playAudioFeedback('charm');
        }}
        className="fixed top-0 right-0 w-3 h-screen z-40 pointer-events-auto"
      />

      {isCharmsBarOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex items-center animate-slideLeft">
          {/* Main Dark Charms Strip */}
          <div className="w-20 h-[380px] bg-black/90 backdrop-blur-md border-l border-white/15 shadow-2xl flex flex-col justify-around items-center py-2 text-white select-none">
            {/* 1. Search Charm */}
            <button
              onClick={() => {
                setActiveCharm('search');
                playAudioFeedback('click');
              }}
              className={`flex flex-col items-center gap-1 w-16 py-2 rounded-sm transition-colors cursor-pointer ${
                activeCharm === 'search' ? 'bg-[#0078D7] text-white' : 'hover:bg-white/15 text-white/80'
              }`}
              title="Pesquisar [Win+F]"
            >
              <Search size={22} />
              <span className="text-[10px] font-medium">Pesquisar</span>
            </button>

            {/* 2. Share Charm */}
            <button
              onClick={() => {
                setActiveCharm('share');
                playAudioFeedback('click');
              }}
              className={`flex flex-col items-center gap-1 w-16 py-2 rounded-sm transition-colors cursor-pointer ${
                activeCharm === 'share' ? 'bg-[#0078D7] text-white' : 'hover:bg-white/15 text-white/80'
              }`}
              title="Compartilhar"
            >
              <Share2 size={22} />
              <span className="text-[10px] font-medium">Partilhar</span>
            </button>

            {/* 3. Start Charm */}
            <button
              onClick={toggleStartScreen}
              className="flex flex-col items-center gap-1 w-16 py-2 rounded-sm hover:bg-white/15 text-white/80 transition-colors cursor-pointer"
              title="Iniciar [Win]"
            >
              <Windows81Logo size={22} className="text-[#00A4EF]" />
              <span className="text-[10px] font-medium">Iniciar</span>
            </button>

            {/* 4. Devices Charm */}
            <button
              onClick={() => {
                setActiveCharm('devices');
                playAudioFeedback('click');
              }}
              className={`flex flex-col items-center gap-1 w-16 py-2 rounded-sm transition-colors cursor-pointer ${
                activeCharm === 'devices' ? 'bg-[#0078D7] text-white' : 'hover:bg-white/15 text-white/80'
              }`}
              title="Dispositivos"
            >
              <Monitor size={22} />
              <span className="text-[10px] font-medium">Dispositivos</span>
            </button>

            {/* 5. Settings Charm */}
            <button
              onClick={() => {
                setActiveCharm('settings');
                playAudioFeedback('click');
              }}
              className={`flex flex-col items-center gap-1 w-16 py-2 rounded-sm transition-colors cursor-pointer ${
                activeCharm === 'settings' ? 'bg-[#0078D7] text-white' : 'hover:bg-white/15 text-white/80'
              }`}
              title="Configurações [Win+I]"
            >
              <Settings size={22} />
              <span className="text-[10px] font-medium">Ajustes</span>
            </button>
          </div>

          {/* Charm Close button */}
          <button
            onClick={() => {
              setIsCharmsBarOpen(false);
              setActiveCharm(null);
            }}
            className="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-12 bg-black/80 hover:bg-black text-white/80 hover:text-white flex items-center justify-center text-xs cursor-pointer border-l border-t border-b border-white/20"
            title="Ocultar Barra de Amuletos"
          >
            ✕
          </button>
        </div>
      )}

      {/* Windows 8.1 Bottom-Left Huge Clock & Wifi Charm Widget (shown when charms bar is active) */}
      {isCharmsBarOpen && (
        <div className="fixed bottom-12 left-12 z-50 bg-black/85 backdrop-blur-md p-6 border border-white/15 shadow-2xl text-white animate-fadeIn flex flex-col gap-1 pointer-events-none">
          <div className="text-6xl font-light tracking-tight font-mono">{currentTime}</div>
          <div className="text-sm font-semibold capitalize text-white/80">{currentDate}</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15 text-xs text-white/70">
            <span className="flex items-center gap-1"><Wifi size={14} className="text-emerald-400" /> Conectado</span>
            <span>•</span>
            <span className="flex items-center gap-1"><BatteryCharging size={14} className="text-emerald-400" /> 100% CA</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2.1 CHARM FLYOUT PANELS (Slide-in Panels from Right)
          ========================================================================= */}
      {activeCharm === 'search' && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#1F1F1F] z-50 border-l border-white/15 shadow-2xl p-6 flex flex-col gap-4 animate-slideLeft text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light">Pesquisar</h2>
            <button onClick={() => setActiveCharm(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome do módulo..."
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#0078D7]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            <div className="text-xs font-bold text-white/50 uppercase">Módulos Encontrados ({filteredModules.length})</div>
            {filteredModules.map(m => {
              const ModIcon = m.icon || Folder;
              return (
                <button
                  key={m.id}
                  onClick={() => handleOpenModule(m.id)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-[#0078D7] text-left transition-colors cursor-pointer rounded-xs"
                >
                  <div className="w-7 h-7 bg-white/20 flex items-center justify-center shrink-0">
                    <ModIcon size={16} />
                  </div>
                  <span className="text-xs font-semibold truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeCharm === 'settings' && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#1F1F1F] z-50 border-l border-white/15 shadow-2xl p-6 flex flex-col gap-6 animate-slideLeft text-white overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light">Ajustes do PC</h2>
            <button onClick={() => setActiveCharm(null)} className="text-white/60 hover:text-white">✕</button>
          </div>

          {/* 1. Accent Color Palette Selector */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">
              Cor de Destaque do Windows 8.1
            </div>
            <div className="grid grid-cols-5 gap-2">
              {WIN81_ACCENTS.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleAccentChange(acc.id)}
                  className={`h-9 w-full rounded-xs flex items-center justify-center transition-all cursor-pointer ${
                    accentId === acc.id ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: acc.primary }}
                  title={acc.name}
                >
                  {accentId === acc.id && <Check size={16} className="text-white drop-shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Start Screen Pattern Motif */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">
              Padrão de Fundo da Tela Inicial
            </div>
            <div className="grid grid-cols-2 gap-2">
              {WIN81_PATTERNS.map(pat => (
                <button
                  key={pat.id}
                  onClick={() => handlePatternChange(pat.id)}
                  className={`p-2 text-left text-xs font-semibold border transition-all cursor-pointer ${
                    patternId === pat.id ? 'border-white bg-white/20' : 'border-white/20 hover:border-white/50 bg-white/5'
                  }`}
                >
                  {pat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Audio / Sounds Switch */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">Efeitos Sonoros do Windows 8.1</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${
                  soundEnabled ? 'bg-[#0078D7] justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* 4. Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setIsScreenLocked(true);
                setActiveCharm(null);
              }}
              className="w-full text-left p-3 bg-white/5 hover:bg-white/15 border border-white/10 flex items-center gap-3 text-xs font-semibold cursor-pointer"
            >
              <Lock size={16} /> Bloquear Estação de Trabalho
            </button>
            <button
              onClick={() => {
                handleLogoutRequest();
                setActiveCharm(null);
              }}
              className="w-full text-left p-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 flex items-center gap-3 text-xs font-semibold cursor-pointer text-rose-300"
            >
              <LogOut size={16} /> Encerrar Sessão (Logout)
            </button>
          </div>

          {/* System Info Footnote */}
          <div className="mt-auto pt-4 border-t border-white/10 text-[11px] text-white/50 font-mono">
            <div>GIPP Eclesiástico Windows 8.1 Pro</div>
            <div>Build 9600.Win81_GIPP_VCL</div>
          </div>
        </div>
      )}

      {activeCharm === 'share' && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#1F1F1F] z-50 border-l border-white/15 shadow-2xl p-6 flex flex-col gap-4 animate-slideLeft text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light">Partilhar</h2>
            <button onClick={() => setActiveCharm(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <p className="text-xs text-white/70">Compartilhe o registro ou relatório ativo com a liderança ou membros:</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                window.open(`https://wa.me/?text=Acesso%20ao%20GIPP%20Eclesi%C3%A1stico:%20${encodeURIComponent(window.location.href)}`, '_blank');
                setActiveCharm(null);
              }}
              className="w-full flex items-center gap-3 p-3 bg-emerald-800 hover:bg-emerald-700 text-left text-xs font-bold cursor-pointer"
            >
              <MessageCircle size={18} /> Enviar via WhatsApp
            </button>
            <button
              onClick={() => {
                window.print();
                setActiveCharm(null);
              }}
              className="w-full flex items-center gap-3 p-3 bg-[#0078D7] hover:bg-[#0063B1] text-left text-xs font-bold cursor-pointer"
            >
              <Printer size={18} /> Imprimir Relatório Ativo
            </button>
          </div>
        </div>
      )}

      {activeCharm === 'devices' && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#1F1F1F] z-50 border-l border-white/15 shadow-2xl p-6 flex flex-col gap-4 animate-slideLeft text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light">Dispositivos</h2>
            <button onClick={() => setActiveCharm(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                window.print();
                setActiveCharm(null);
              }}
              className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 text-left text-xs font-bold cursor-pointer border border-white/10"
            >
              <Printer size={18} /> Imprimir (Impressora / PDF)
            </button>
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen?.();
                }
                setActiveCharm(null);
              }}
              className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 text-left text-xs font-bold cursor-pointer border border-white/10"
            >
              <Monitor size={18} /> Projetor / Telão da Igreja (Tela Cheia)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. DESKTOP WORKSPACE & AERO LITE / METRO WINDOW
          ========================================================================= */}
      <div 
        className="flex-1 flex flex-col p-2 md:p-3 overflow-hidden relative win81-desktop-area z-10"
        style={{
          backgroundColor: wallpaperMode === 'accent' ? activeAccent.darkBg : '#171717'
        }}
      >
        {/* Desktop Icons (When window is minimized or partial) */}
        {isWindowMinimized && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-xl animate-fadeIn">
            {[
              { id: 'dashboard', label: 'Este Computador (GIPP)', icon: Monitor, color: '#0078D7' },
              { id: 'secretaria_integrada', label: 'Secretaria Geral', icon: FileText, color: '#107C41' },
              { id: 'cad_membro', label: 'Rol de Membros', icon: Users, color: '#D83B01' },
              { id: 'fin_entrada', label: 'Livro Caixa', icon: ArrowUpCircle, color: '#008272' },
              { id: 'curso_teologia', label: 'Universidade Teológica', icon: BookOpen, color: '#004E98' },
              { id: 'google_meet', label: 'Google Meet', icon: GoogleMeetIcon, isGoogle: true },
              { id: 'config_visual', label: 'Painel de Controle', icon: Settings, color: '#68217A' },
              { id: 'lixeira', label: 'Lixeira', icon: Trash2, color: '#71717A' }
            ].map(item => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  onDoubleClick={() => handleOpenModule(item.id)}
                  onClick={() => handleOpenModule(item.id)}
                  className="flex flex-col items-center justify-center p-3 rounded-xs hover:bg-white/10 active:bg-white/20 cursor-pointer text-center group border border-transparent hover:border-white/20"
                >
                  <div 
                    className="w-12 h-12 flex items-center justify-center mb-1.5 shadow-md rounded-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.isGoogle ? 'white' : item.color }}
                  >
                    <ItemIcon size={24} className={item.isGoogle ? '' : 'text-white'} />
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow-md truncate max-w-[110px]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Windows 8.1 Aero Lite Window Container */}
        {!isWindowMinimized && (
          <div 
            className={`flex-1 flex flex-col overflow-hidden transition-all duration-150 shadow-2xl border ${
              isWindowMaximized ? 'w-full h-full' : 'w-[96%] h-[95%] mx-auto my-auto'
            }`}
            style={{
              borderColor: activeAccent.windowBorder,
              backgroundColor: '#F3F3F3'
            }}
          >
            {/* Windows 8.1 Window Title Bar (Sharp rectangular styling) */}
            <div 
              className="h-9 flex items-center justify-between px-3 select-none shrink-0"
              style={{
                backgroundColor: activeAccent.primary,
                color: 'white'
              }}
            >
              {/* Left: Window Icon, Title & Breadcrumb */}
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <WindowIcon size={16} className="text-white" />
                </div>
                <span className="text-xs font-semibold truncate tracking-tight">
                  {mMeta.label} - GIPP Eclesiástico
                </span>
              </div>

              {/* Right: Window Controls (_, ▢, ✕) Windows 8.1 style */}
              <div className="flex items-center gap-0.5">
                {/* Minimize Button */}
                <button
                  onClick={() => {
                    playAudioFeedback('click');
                    setIsWindowMinimized(true);
                  }}
                  className="w-8 h-7 flex items-center justify-center hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs cursor-pointer transition-colors"
                  title="Minimizar"
                >
                  <Minus size={14} />
                </button>

                {/* Maximize / Restore Button */}
                <button
                  onClick={() => {
                    playAudioFeedback('click');
                    setIsWindowMaximized(!isWindowMaximized);
                  }}
                  className="w-8 h-7 flex items-center justify-center hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs cursor-pointer transition-colors"
                  title={isWindowMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isWindowMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
                </button>

                {/* Close Button (Iconic Red Hover) */}
                <button
                  onClick={() => {
                    playAudioFeedback('click');
                    if (view !== 'dashboard') {
                      setView('dashboard');
                    } else {
                      setIsWindowMinimized(true);
                    }
                  }}
                  className="w-10 h-7 flex items-center justify-center hover:bg-[#E81123] active:bg-[#B8101C] text-white font-bold text-xs cursor-pointer transition-colors"
                  title="Fechar Janela"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Windows 8.1 File Explorer Style Ribbon Navigation Toolbar */}
            <div className="bg-[#F5F6F7] border-b border-[#D9D9D9] px-3 py-1.5 flex items-center justify-between gap-3 text-xs text-slate-800 shrink-0">
              {/* Back / Forward / Up navigation */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenModule('dashboard')}
                  className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer disabled:opacity-40"
                  title="Voltar ao Início"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                  title="Atualizar Módulo"
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              {/* Breadcrumb Address Bar */}
              <div className="flex-1 bg-white border border-[#D9D9D9] px-2.5 py-1 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Monitor size={13} className="text-[#0078D7]" />
                <span className="text-slate-400">Este Computador</span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-slate-400">GIPP</span>
                <span className="text-slate-400">&gt;</span>
                <span className="font-bold text-slate-900 truncate">{mMeta.label}</span>
              </div>

              {/* Quick Action Buttons (Ribbon Buttons) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#D9D9D9] text-[11px] font-semibold flex items-center gap-1 cursor-pointer text-slate-800"
                  title="Imprimir [Ctrl+P]"
                >
                  <Printer size={12} className="text-slate-600" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                <button
                  onClick={() => {
                    setIsCharmsBarOpen(true);
                    setActiveCharm('search');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#D9D9D9] text-[11px] font-semibold flex items-center gap-1 cursor-pointer text-slate-800"
                  title="Pesquisar Módulo [Win+F]"
                >
                  <Search size={12} className="text-slate-600" />
                  <span className="hidden sm:inline">Pesquisar</span>
                </button>
              </div>
            </div>

            {/* Active Module Body Render */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 p-2 sm:p-4 custom-scrollbar">
              <CurrentModule {...currentProps} />
            </div>

            {/* Windows 8.1 Status Bar */}
            <div className="h-6 bg-[#F5F6F7] border-t border-[#D9D9D9] px-3 flex items-center justify-between text-[10px] text-slate-600 font-medium shrink-0">
              <div className="flex items-center gap-3">
                <span>Status: Pronto</span>
                <span>•</span>
                <span>Módulo: {view}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>GIPP VCL Engine</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. WINDOWS 8.1 BOTTOM TASKBAR (Barra de Tarefas)
          ========================================================================= */}
      <footer 
        className="h-10 border-t flex items-center justify-between px-1 select-none shrink-0 z-40 relative text-white"
        style={{
          backgroundColor: activeAccent.taskbarBg,
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Left: Windows 8.1 Start Button + Running / Pinned Apps */}
        <div className="flex items-center gap-1 h-full">
          {/* Windows 8.1 Start Button (Angled Cyan Quad Logo) */}
          <button
            onClick={toggleStartScreen}
            className={`h-full px-3 flex items-center justify-center transition-all cursor-pointer group ${
              isStartOpen ? 'bg-black/30' : 'hover:bg-white/15 active:bg-black/20'
            }`}
            title="Iniciar (Alternar Tela Inicial) [Win]"
          >
            <Windows81Logo 
              size={18} 
              className={`transition-colors ${
                isStartOpen ? 'text-[#00B4FF]' : 'text-[#00A4EF] group-hover:text-white'
              }`} 
            />
          </button>

          <div className="h-5 w-px bg-white/20 mx-0.5" />

          {/* Pinned & Running Taskbar Icons */}
          <div className="flex items-center gap-0.5 h-full overflow-x-auto no-scrollbar">
            {taskbarShortcuts.map(item => {
              const ItemIcon = item.icon;
              const isActive = view === item.id && !isWindowMinimized;
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenModule(item.id)}
                  className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer relative ${
                    isActive 
                      ? 'bg-white/20 border-white font-bold' 
                      : 'border-transparent hover:bg-white/10 hover:border-white/40 opacity-90 hover:opacity-100'
                  }`}
                  title={item.label}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <ItemIcon size={16} className={item.isGoogle ? '' : 'text-white'} />
                  </div>
                  <span className="text-xs hidden md:inline truncate max-w-[120px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Notification Area / System Tray (Relógio, Som, Rede, Idioma, Notificações) */}
        <div className="flex items-center gap-1 h-full pr-1">
          {/* Audio Volume Button */}
          <button
            onClick={() => setTrayFlyout(trayFlyout === 'volume' ? null : 'volume')}
            className="p-1.5 hover:bg-white/15 rounded-xs transition-colors cursor-pointer text-white/90"
            title={`Volume: ${volumeLevel}%`}
          >
            {volumeLevel > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Network Wifi Button */}
          <button
            onClick={() => setTrayFlyout(trayFlyout === 'network' ? null : 'network')}
            className="p-1.5 hover:bg-white/15 rounded-xs transition-colors cursor-pointer text-white/90"
            title="Rede Eclesiástica: Conectado"
          >
            <Wifi size={16} />
          </button>

          {/* Action Center / Notifications */}
          <button
            onClick={() => {
              setIsCharmsBarOpen(true);
              setActiveCharm('search');
            }}
            className="p-1.5 hover:bg-white/15 rounded-xs transition-colors cursor-pointer text-white/90"
            title="Central de Ações / Pesquisa"
          >
            <Bell size={16} />
          </button>

          {/* Language PTB Badge */}
          <div className="px-1 text-[11px] font-bold text-white/80 hidden sm:inline">
            POR
          </div>

          {/* Digital Clock & Calendar Flyout */}
          <button
            onClick={() => setTrayFlyout(trayFlyout === 'calendar' ? null : 'calendar')}
            className={`h-full px-2 flex flex-col justify-center items-end text-right transition-colors cursor-pointer ${
              trayFlyout === 'calendar' ? 'bg-white/20' : 'hover:bg-white/15'
            }`}
            title="Data e Hora do Sistema"
          >
            <span className="text-[11px] font-bold font-mono leading-none">{currentTime}</span>
            <span className="text-[9px] text-white/80 leading-none mt-0.5">{new Date().toLocaleDateString('pt-BR')}</span>
          </button>

          {/* Show Desktop Peek (Far right corner strip) */}
          <button
            onClick={() => {
              playAudioFeedback('click');
              setIsWindowMinimized(prev => !prev);
            }}
            className="w-1.5 h-full hover:bg-white/30 active:bg-white/50 border-l border-white/20 cursor-pointer ml-1"
            title="Mostrar Área de Trabalho"
          />
        </div>
      </footer>

      {/* =========================================================================
          5. SYSTEM TRAY FLYOUTS (Calendar, Volume, Network)
          ========================================================================= */}
      {trayFlyout === 'volume' && (
        <div className="absolute bottom-11 right-20 w-64 bg-[#1F1F1F] border border-white/20 shadow-2xl p-4 z-50 animate-fadeIn text-white">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase">Alto-Falantes</span>
            <span className="text-xs font-mono font-bold">{volumeLevel}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 size={18} />
            <input
              type="range"
              min="0"
              max="100"
              value={volumeLevel}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              className="flex-1 accent-[#0078D7] cursor-pointer"
            />
          </div>
        </div>
      )}

      {trayFlyout === 'calendar' && (
        <div className="absolute bottom-11 right-2 w-72 bg-[#1F1F1F] border border-white/20 shadow-2xl p-4 z-50 animate-fadeIn text-white">
          <div className="text-2xl font-light font-mono mb-1">{currentTime}</div>
          <div className="text-xs font-semibold text-white/80 capitalize pb-3 border-b border-white/20 mb-3">
            {currentDate}
          </div>
          <div className="text-xs space-y-1 text-white/70">
            <div className="font-bold text-white">Cultos & Agenda Ministerial:</div>
            <div>• Quarta-feira: Culto de Doutrina (19h30)</div>
            <div>• Domingo: Escola Dominical (09h00)</div>
            <div>• Domingo: Culto da Família (18h30)</div>
          </div>
          <button
            onClick={() => handleOpenModule('google_calendar')}
            className="w-full mt-3 p-2 bg-[#0078D7] hover:bg-[#0063B1] text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Abrir Agenda Completa
          </button>
        </div>
      )}

      {trayFlyout === 'network' && (
        <div className="absolute bottom-11 right-14 w-64 bg-[#1F1F1F] border border-white/20 shadow-2xl p-4 z-50 animate-fadeIn text-white space-y-2">
          <div className="text-xs font-bold uppercase">Conexão de Rede</div>
          <div className="p-2 bg-white/10 border border-white/20 text-xs flex items-center justify-between">
            <span className="font-bold">GIPP Cloud Sync</span>
            <span className="text-emerald-400 font-bold">Conectado</span>
          </div>
          <div className="text-[10px] text-white/60">
            Banco de Dados FireDAC Firestore ativo e sincronizado em tempo real.
          </div>
        </div>
      )}

      {/* Desktop Context Menu (Right Click on Desktop) */}
      {desktopMenuPos && (
        <div 
          className="fixed bg-[#1F1F1F] border border-white/20 shadow-2xl p-1 z-50 animate-fadeIn text-xs text-white min-w-[180px]"
          style={{ top: desktopMenuPos.y, left: desktopMenuPos.x }}
        >
          <button 
            onClick={() => {
              toggleStartScreen();
              setDesktopMenuPos(null);
            }} 
            className="w-full text-left px-3 py-1.5 hover:bg-[#0078D7] flex items-center gap-2 cursor-pointer"
          >
            <Windows81Logo size={14} className="text-[#00A4EF]" /> Tela Inicial
          </button>
          <button 
            onClick={() => {
              handleOpenModule('dashboard');
              setDesktopMenuPos(null);
            }} 
            className="w-full text-left px-3 py-1.5 hover:bg-[#0078D7] flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard size={14} /> Abrir Visão Geral
          </button>
          <div className="my-1 border-t border-white/15" />
          <button 
            onClick={() => {
              window.location.reload();
              setDesktopMenuPos(null);
            }} 
            className="w-full text-left px-3 py-1.5 hover:bg-[#0078D7] flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} /> Atualizar
          </button>
          <button 
            onClick={() => {
              setIsCharmsBarOpen(true);
              setActiveCharm('settings');
              setDesktopMenuPos(null);
            }} 
            className="w-full text-left px-3 py-1.5 hover:bg-[#0078D7] flex items-center gap-2 cursor-pointer"
          >
            <Palette size={14} /> Personalizar Windows 8.1
          </button>
        </div>
      )}
    </div>
  );
};

export default Windows81Layout;
