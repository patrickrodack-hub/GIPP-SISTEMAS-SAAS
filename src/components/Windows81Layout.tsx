import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, Plus, Search, X, BookOpen, GraduationCap, Shield, Database, 
  RefreshCw, Lock, Sliders, ChevronDown, ChevronUp, ChevronRight,
  Wifi, Volume2, Bell, Sun, Monitor, Share2, Grid, Check, Trash2,
  Maximize, Minus, Power, Palette, Info, History, ArrowRight, ExternalLink,
  Book, Sparkles, ImagePlus, MessageCircle, QrCode, ShieldCheck, Newspaper,
  Award, Calendar, Gamepad2, Music, Video, Heart, Globe, Baby, Car, Package,
  FileSpreadsheet, FileCheck, CheckSquare, Activity, ArrowUpCircle, ArrowDownCircle,
  HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestAppFullscreen } from '../lib/performanceHelpers';

export const Win81Logo = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`}>
    <polygon points="2,4.8 10.4,3.6 10.4,11.2 2,11.2" />
    <polygon points="11.8,3.4 22,2 22,11.2 11.8,11.2" />
    <polygon points="2,12.8 10.4,12.8 10.4,20.4 2,19.2" />
    <polygon points="11.8,12.8 22,12.8 22,22 11.8,20.6" />
  </svg>
);

interface Windows81LayoutProps {
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
  animBgEnabled?: boolean;
  setAnimBgEnabled?: (enabled: boolean) => void;
  ALL_AVAILABLE_MODULES: any[];
  userShortcuts?: { id: string; label: string; x: number; y: number }[];
  addShortcutToDesktop?: (moduleId: string, x?: number, y?: number) => void;
  removeShortcutFromDesktop?: (moduleId: string) => void;
  autoArrangeWin11Shortcuts?: () => void;
  pinnedTaskbarModules?: string[];
  setPinnedTaskbarModules?: React.Dispatch<React.SetStateAction<string[]>>;
  pinnedStartModules?: string[];
  setPinnedStartModules?: React.Dispatch<React.SetStateAction<string[]>>;
  openedModules?: string[];
  setOpenedModules?: React.Dispatch<React.SetStateAction<string[]>>;
  minimizedModules?: string[];
  setMinimizedModules?: React.Dispatch<React.SetStateAction<string[]>>;
  addToast?: (msg: string, type?: any) => void;
}

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
  ALL_AVAILABLE_MODULES,
  userShortcuts = [],
  addShortcutToDesktop = (_moduleId?: string, _x?: number, _y?: number) => {},
  removeShortcutFromDesktop = (_moduleId?: string) => {},
  autoArrangeWin11Shortcuts = () => {},
  pinnedTaskbarModules,
  setPinnedTaskbarModules,
  pinnedStartModules,
  setPinnedStartModules,
  openedModules,
  setOpenedModules,
  minimizedModules,
  setMinimizedModules,
  addToast = (_msg?: string, _type?: any) => {}
}) => {
  // Safe local fallback states if not provided by parent
  const [localMinimized, setLocalMinimized] = useState<string[]>([]);
  const [localOpened, setLocalOpened] = useState<string[]>([]);
  const [localPinnedTaskbar, setLocalPinnedTaskbar] = useState<string[]>(['dashboard', 'curso_teologia', 'formacao_obreiros', 'cad_membro', 'secretaria_ebd']);
  const [localPinnedStart, setLocalPinnedStart] = useState<string[]>(['dashboard', 'curso_teologia', 'formacao_obreiros', 'secretaria_ebd', 'cad_membro', 'visitantes', 'cad_igreja', 'fin_entrada', 'assistente_ai']);

  const activeMinimized = minimizedModules || localMinimized;
  const setActiveMinimized = setMinimizedModules || setLocalMinimized;
  
  const activeOpened = openedModules || localOpened;
  const setActiveOpened = setOpenedModules || setLocalOpened;

  const activePinnedTaskbar = pinnedTaskbarModules || localPinnedTaskbar;
  const setActivePinnedTaskbar = setPinnedTaskbarModules || setLocalPinnedTaskbar;

  const activePinnedStart = pinnedStartModules || localPinnedStart;
  const setActivePinnedStart = setPinnedStartModules || setLocalPinnedStart;

  // Start Screen visibility: by default open if no active module or if user explicitly opened it
  const [startScreenOpen, setStartScreenOpen] = useState<boolean>(!view || view === 'dashboard' || activeMinimized.includes(view));
  const [startScreenTab, setStartScreenTab] = useState<'tiles' | 'allApps'>('tiles');
  const [startSearchQuery, setStartSearchQuery] = useState('');
  
  // Charms Bar visibility & flyouts
  const [charmsBarOpen, setCharmsBarOpen] = useState(false);
  const [activeCharmFlyout, setActiveCharmFlyout] = useState<'search' | 'share' | 'settings' | 'devices' | null>(null);

  // Time and Date state for Live Tiles, Clock, and Charms Bar
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDayNumber, setCurrentDayNumber] = useState('');
  const [currentMonthStr, setCurrentMonthStr] = useState('');

  // Window positioning and size for Desktop mode
  const [windowPos, setWindowPos] = useState({ x: 50, y: 30 });
  const [windowSize, setWindowSize] = useState({ width: 1100, height: 680 });
  const [isMaximized, setIsMaximized] = useState(true);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  // Desktop active drag shortcut
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragPos, setActiveDragPos] = useState<{ x: number; y: number } | null>(null);

  // Right-click Context Menu
  const [contextMenu, setContextMenu] = useState<{
    type: 'desktop' | 'desktop-icon' | 'start-tile' | 'start-app' | 'taskbar-item';
    x: number;
    y: number;
    moduleId?: string;
  } | null>(null);

  // User Profile popup in Start Screen
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);

  // Flip ticker for live tiles animation
  const [tileFlipStep, setTileFlipStep] = useState(0);

  // Sound effects simulation toggle
  const [volumeLevel, setVolumeLevel] = useState(85);
  const [brightnessLevel, setBrightnessLevel] = useState(100);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
      setCurrentDayNumber(String(now.getDate()));
      setCurrentMonthStr(now.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic flip for live tiles (every 6 seconds)
  useEffect(() => {
    const flipInterval = setInterval(() => {
      setTileFlipStep(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(flipInterval);
  }, []);

  // Sync window state on view change
  useEffect(() => {
    if (view && view !== 'dashboard') {
      if (!activeOpened.includes(view)) {
        setActiveOpened(prev => [...prev, view]);
      }
      setActiveMinimized(prev => prev.filter(m => m !== view));
      // In Windows 8.1, launching an app shifts from Start Screen to the app window
      setStartScreenOpen(false);
    }
  }, [view]);

  // Pinning helpers
  const isPinnedToTaskbar = (id: string) => activePinnedTaskbar.includes(id);
  const isPinnedToStart = (id: string) => activePinnedStart.includes(id);

  const togglePinTaskbar = (id: string) => {
    if (isPinnedToTaskbar(id)) {
      setActivePinnedTaskbar(prev => prev.filter(m => m !== id));
      addToast("Desafixado da barra de tarefas", "info");
    } else {
      setActivePinnedTaskbar(prev => [...prev, id]);
      addToast("Fixado na barra de tarefas", "success");
    }
  };

  const togglePinStart = (id: string) => {
    if (isPinnedToStart(id)) {
      setActivePinnedStart(prev => prev.filter(m => m !== id));
      addToast("Desafixado da tela Iniciar", "info");
    } else {
      setActivePinnedStart(prev => [...prev, id]);
      addToast("Fixado na tela Iniciar", "success");
    }
  };

  const handleLaunchModule = (moduleId: string) => {
    setView(moduleId);
    setStartScreenOpen(false);
    if (!activeOpened.includes(moduleId)) {
      setActiveOpened(prev => [...prev, moduleId]);
    }
    setActiveMinimized(prev => prev.filter(m => m !== moduleId));
    setContextMenu(null);
  };

  const handleCloseModule = (moduleId: string) => {
    const nextOpened = activeOpened.filter(m => m !== moduleId);
    setActiveOpened(nextOpened);
    setActiveMinimized(prev => prev.filter(m => m !== moduleId));
    if (view === moduleId) {
      if (nextOpened.length > 0) {
        setView(nextOpened[nextOpened.length - 1]);
      } else {
        setView('dashboard');
        setStartScreenOpen(true);
      }
    }
  };

  // Drag and Drop: Start Screen item dropped to Desktop
  const handleDragStartFromMenu = (e: React.DragEvent, moduleId: string) => {
    e.dataTransfer.setData('application/gipp-module', moduleId);
    e.dataTransfer.setData('text/plain', moduleId);
  };

  const handleDesktopDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const moduleId = e.dataTransfer.getData('application/gipp-module') || e.dataTransfer.getData('text/plain');
    if (moduleId && ALL_AVAILABLE_MODULES.some(m => m.id === moduleId)) {
      const container = e.currentTarget.getBoundingClientRect();
      const dropX = Math.max(2, Math.min(88, ((e.clientX - container.left) / container.width) * 100 - 4));
      const dropY = Math.max(3, Math.min(85, ((e.clientY - container.top) / container.height) * 100 - 4));
      addShortcutToDesktop(moduleId, dropX, dropY);
    }
  };

  // Desktop icon drag handling
  const handleDesktopIconMouseDown = (e: React.MouseEvent, shortcutId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    let dragDist = 0;

    const container = document.getElementById('win81-desktop-area');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const currentShortcut = userShortcuts.find(s => s.id === shortcutId);
    const initX = currentShortcut ? currentShortcut.x : 2;
    const initY = currentShortcut ? currentShortcut.y : 3;

    setActiveDragId(shortcutId);
    setActiveDragPos({ x: initX, y: initY });

    const onMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      dragDist = Math.sqrt(dx * dx + dy * dy);

      const relX = ((me.clientX - rect.left) / rect.width) * 100;
      const relY = ((me.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(1, Math.min(92, relX - 4));
      const clampedY = Math.max(1, Math.min(88, relY - 4));
      setActiveDragPos({ x: clampedX, y: clampedY });
    };

    const onMouseUp = (ue: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      setActiveDragId(null);
      setActiveDragPos(null);

      if (dragDist < 5) {
        handleLaunchModule(shortcutId);
      } else {
        const finalRelX = ((ue.clientX - rect.left) / rect.width) * 100;
        const finalRelY = ((ue.clientY - rect.top) / rect.height) * 100;
        const clampedX = Math.max(1, Math.min(92, finalRelX - 4));
        const clampedY = Math.max(1, Math.min(88, finalRelY - 4));
        addShortcutToDesktop(shortcutId, clampedX, clampedY);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Window drag handling
  const handleWindowDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDraggingWindow(true);
    const startX = e.clientX - windowPos.x;
    const startY = e.clientY - windowPos.y;

    const onMove = (me: MouseEvent) => {
      setWindowPos({
        x: Math.max(0, Math.min(window.innerWidth - 200, me.clientX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - 100, me.clientY - startY))
      });
    };

    const onUp = () => {
      setIsDraggingWindow(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Window resize handling
  const handleWindowResizeStart = (e: React.MouseEvent, direction: 'r' | 'b' | 'br') => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const onMove = (me: MouseEvent) => {
      let newW = startWidth;
      let newH = startHeight;
      if (direction === 'r' || direction === 'br') {
        newW = Math.max(500, startWidth + (me.clientX - startX));
      }
      if (direction === 'b' || direction === 'br') {
        newH = Math.max(350, startHeight + (me.clientY - startY));
      }
      setWindowSize({ width: newW, height: newH });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // All combined taskbar items (pinned + opened)
  const taskbarItemIds = Array.from(new Set([...activePinnedTaskbar, ...activeOpened])).filter(id => isModuleAllowed(id));

  // Pre-categorized modules for Live Tiles Start Screen
  const tileCategories = [
    {
      title: "GESTÃO & MEMBROS",
      modules: [
        { id: 'dashboard', size: 'large', bg: 'bg-[#0078d7]', live: true },
        { id: 'cad_membro', size: 'medium', bg: 'bg-[#2b5797]', live: true },
        { id: 'visitantes', size: 'medium', bg: 'bg-[#b91d47]', live: false },
        { id: 'cad_igreja', size: 'wide', bg: 'bg-[#00a300]', live: false },
        { id: 'cad_patrimonio', size: 'medium', bg: 'bg-[#00aba9]', live: false },
        { id: 'controle_frotas', size: 'medium', bg: 'bg-[#1e7145]', live: false }
      ]
    },
    {
      title: "ENSINO & TEOLOGIA (CGADB / CPAD)",
      modules: [
        { id: 'curso_teologia', size: 'large', bg: 'bg-[#107c41]', live: true },
        { id: 'formacao_obreiros', size: 'wide', bg: 'bg-[#008272]', live: true },
        { id: 'secretaria_ebd', size: 'medium', bg: 'bg-[#603cba]', live: false },
        { id: 'biblia', size: 'medium', bg: 'bg-[#d83b01]', live: true },
        { id: 'gestao_cursos', size: 'medium', bg: 'bg-[#004e8c]', live: false }
      ]
    },
    {
      title: "FINANÇAS & SECRETARIA",
      modules: [
        { id: 'fin_entrada', size: 'medium', bg: 'bg-[#008a00]', live: true },
        { id: 'fin_saida', size: 'medium', bg: 'bg-[#da532c]', live: true },
        { id: 'fin_dre', size: 'wide', bg: 'bg-[#0072c6]', live: false },
        { id: 'secretaria_integrada', size: 'wide', bg: 'bg-[#7e3878]', live: false },
        { id: 'relatorios', size: 'medium', bg: 'bg-[#666666]', live: false }
      ]
    },
    {
      title: "COMUNICAÇÃO & FERRAMENTAS",
      modules: [
        { id: 'assistente_ai', size: 'wide', bg: 'bg-[#5c2d91]', live: true },
        { id: 'rede_social', size: 'medium', bg: 'bg-[#d13438]', live: false },
        { id: 'mensagens_lote', size: 'medium', bg: 'bg-[#008272]', live: false },
        { id: 'config_sistema', size: 'medium', bg: 'bg-[#464646]', live: false },
        { id: 'config_visual', size: 'medium', bg: 'bg-[#a4373a]', live: false }
      ]
    }
  ];

  // Filtered list for "All Apps" view
  const allAppsFiltered = ALL_AVAILABLE_MODULES.filter(m => {
    if (!isModuleAllowed(m.id)) return false;
    if (!startSearchQuery) return true;
    const q = startSearchQuery.toLowerCase();
    return m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  }).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

  // Group apps by letter
  const groupedApps: { [key: string]: typeof ALL_AVAILABLE_MODULES } = {};
  allAppsFiltered.forEach(app => {
    const firstLetter = app.label.charAt(0).toUpperCase();
    if (!groupedApps[firstLetter]) groupedApps[firstLetter] = [];
    groupedApps[firstLetter].push(app);
  });

  const isWindowMinimized = activeMinimized.includes(view) || !view;

  return (
    <div 
      className="fixed inset-0 overflow-hidden select-none font-sans text-white bg-[#004f7c]"
      style={{
        // Windows 8.1 Signature Ribbon Background
        backgroundImage: `
          radial-gradient(ellipse at 85% 15%, rgba(240, 185, 11, 0.28) 0%, transparent 45%),
          radial-gradient(ellipse at 15% 85%, rgba(0, 164, 228, 0.45) 0%, transparent 55%),
          linear-gradient(135deg, #002b44 0%, #004f7c 50%, #006097 100%)
        `
      }}
      onClick={() => {
        setContextMenu(null);
        setUserMenuOpen(false);
        setPowerMenuOpen(false);
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP WORKSPACE AREA (Underneath or Visible when Start Screen is closed) */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="win81-desktop-area"
        className="absolute inset-0 pb-10 overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={handleDesktopDrop}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ type: 'desktop', x: e.clientX, y: e.clientY });
        }}
      >
        {/* Desktop Shortcuts */}
        <div className="absolute inset-0 p-4 pointer-events-auto">
          {userShortcuts.filter(s => isModuleAllowed(s.id)).map(s => {
            const mInfo = ALL_AVAILABLE_MODULES.find(m => m.id === s.id);
            if (!mInfo) return null;
            const ShortcutIcon = mInfo.icon || LayoutDashboard;
            const isDragging = activeDragId === s.id;
            const curX = isDragging && activeDragPos ? activeDragPos.x : s.x;
            const curY = isDragging && activeDragPos ? activeDragPos.y : s.y;

            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${curX}%`,
                  top: `${curY}%`,
                  zIndex: isDragging ? 50 : 10
                }}
                onMouseDown={(e) => handleDesktopIconMouseDown(e, s.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ type: 'desktop-icon', x: e.clientX, y: e.clientY, moduleId: s.id });
                }}
                className={`flex flex-col items-center justify-center p-1.5 rounded-none transition-all duration-100 w-22 border border-transparent hover:border-white/40 hover:bg-white/15 active:bg-white/25 cursor-default group select-none`}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-1 bg-black/20 border border-white/20 shadow-md">
                  <ShortcutIcon size={28} className="text-white drop-shadow-md" />
                </div>
                {/* White text label with dark shadow as requested in instructions */}
                <span className="text-[11px] font-medium leading-tight text-center break-words line-clamp-2 w-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] font-sans pointer-events-none">
                  {s.label}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShortcutFromDesktop(s.id);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-none flex items-center justify-center text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Remover atalho"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Application Window (Windows 8.1 Straight-Edged Frame) */}
        {view && view !== 'dashboard' && !isWindowMinimized && (
          <div
            style={isMaximized ? undefined : {
              position: 'absolute',
              left: `${windowPos.x}px`,
              top: `${windowPos.y}px`,
              width: `${windowSize.width}px`,
              height: `${windowSize.height}px`,
              zIndex: 30
            }}
            className={`${
              isMaximized ? 'absolute inset-0 pb-10 z-30' : ''
            } flex flex-col shadow-2xl transition-all duration-150 animate-fadeIn`}
          >
            {/* Windows 8.1 Window Container: Strict sharp edges (rounded-none) */}
            <div className="flex-1 flex flex-col border border-white/20 bg-[#1e1e1e] text-slate-100 overflow-hidden relative rounded-none shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
              {/* Window Title Bar */}
              <div 
                onMouseDown={handleWindowDragStart}
                onDoubleClick={() => setIsMaximized(!isMaximized)}
                className={`h-8 px-3 flex items-center justify-between select-none shrink-0 bg-[#004f7c] border-b border-black/30 ${
                  isMaximized ? 'cursor-default' : 'cursor-move'
                }`}
              >
                <div className="flex items-center gap-2 pointer-events-none">
                  {mMeta.icon && React.createElement(mMeta.icon, { size: 15, className: "text-white shrink-0" })}
                  <span className="text-xs font-semibold tracking-wide text-white drop-shadow-xs">
                    {mMeta.label} - GIPP Sistema Eclesiástico
                  </span>
                </div>

                {/* Windows 8.1 Controls: Straight buttons, red hover on close */}
                <div className="flex items-center h-full">
                  {/* Minimize */}
                  <button
                    onClick={() => setMinimizedModules(prev => [...prev, view])}
                    className="w-11 h-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors cursor-pointer text-xs"
                    title="Minimizar"
                  >
                    <Minus size={14} />
                  </button>
                  {/* Maximize / Restore */}
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="w-11 h-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors cursor-pointer text-xs"
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                  >
                    <span className="border border-white w-3 h-3 block" />
                  </button>
                  {/* Close button: bright red hover */}
                  <button
                    onClick={() => handleCloseModule(view)}
                    className="w-12 h-full flex items-center justify-center text-white/90 hover:bg-[#e81123] hover:text-white transition-colors cursor-pointer text-xs"
                    title="Fechar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Window Content Area */}
              <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-6 custom-scrollbar relative">
                {hasPermission(access) ? (
                  <Suspense fallback={
                    <div className="h-64 flex flex-col items-center justify-center text-center text-slate-300">
                      <RefreshCw size={32} className="animate-spin mb-3 text-sky-400" />
                      <p className="text-sm font-semibold">Carregando no Windows 8.1...</p>
                    </div>
                  }>
                    <CurrentModule {...currentProps} />
                  </Suspense>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <Lock size={64} className="text-rose-500 mb-6" />
                    <h2 className="text-2xl font-bold">Acesso Restrito</h2>
                    <p className="text-sm text-slate-400 mt-2">Você não possui permissão para este módulo.</p>
                  </div>
                )}
              </div>

              {/* Resize Handles (When not maximized) */}
              {!isMaximized && (
                <>
                  <div 
                    onMouseDown={(e) => handleWindowResizeStart(e, 'r')}
                    className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-sky-500/20 z-20" 
                  />
                  <div 
                    onMouseDown={(e) => handleWindowResizeStart(e, 'b')}
                    className="absolute left-0 bottom-0 w-full h-2 cursor-ns-resize hover:bg-sky-500/20 z-20" 
                  />
                  <div 
                    onMouseDown={(e) => handleWindowResizeStart(e, 'br')}
                    className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-30"
                  >
                    <div className="w-2 h-2 border-r-2 border-b-2 border-white/60" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 8.1 FULLSCREEN "START SCREEN" (TELA INICIAR COM LIVE TILES) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {startScreenOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[#004f7c]/98 overflow-x-auto overflow-y-hidden custom-scrollbar select-none flex flex-col pb-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 85% 20%, rgba(240, 185, 11, 0.35) 0%, transparent 45%),
                radial-gradient(circle at 10% 75%, rgba(0, 164, 228, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, #002b44 0%, #004f7c 50%, #006097 100%)
              `
            }}
          >
            {/* Top Bar (Start Screen Header: Title + User Avatar + Power + Search) */}
            <div className="h-20 px-8 md:px-14 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white drop-shadow-sm font-sans">
                  {startScreenTab === 'tiles' ? 'Iniciar' : 'Aplicativos'}
                </h1>
                {startScreenTab === 'allApps' && (
                  <button
                    onClick={() => setStartScreenTab('tiles')}
                    className="flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-white px-2 py-1 rounded-none border border-sky-400/30 hover:border-white transition-all cursor-pointer ml-4"
                  >
                    <ChevronUp size={14} />
                    <span>Voltar à Tela Inicial</span>
                  </button>
                )}
              </div>

              {/* User Profile, Power, and Search Icons */}
              <div className="flex items-center gap-4">
                {/* Search Bar if on allApps or quick button */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={startSearchQuery}
                    onChange={(e) => {
                      setStartSearchQuery(e.target.value);
                      if (startScreenTab !== 'allApps' && e.target.value) {
                        setStartScreenTab('allApps');
                      }
                    }}
                    className="w-44 md:w-64 pl-8 pr-3 py-1.5 text-xs bg-black/30 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-all rounded-none"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/70" />
                </div>

                {/* Power Options Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPowerMenuOpen(!powerMenuOpen);
                      setUserMenuOpen(false);
                    }}
                    className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer border border-transparent hover:border-white/30"
                    title="Opções de Energia"
                  >
                    <Power size={18} />
                  </button>
                  {powerMenuOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 w-48 bg-[#1f1f1f] border border-white/20 shadow-2xl z-50 p-1 rounded-none text-xs animate-fadeIn"
                    >
                      <button
                        onClick={() => {
                          setPowerMenuOpen(false);
                          setIsScreenLocked(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0078d7] text-white transition-colors cursor-pointer"
                      >
                        <Lock size={14} />
                        <span>Suspender / Bloquear</span>
                      </button>
                      <button
                        onClick={() => {
                          setPowerMenuOpen(false);
                          window.location.reload();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0078d7] text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        <span>Reiniciar GIPP</span>
                      </button>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        onClick={() => {
                          setPowerMenuOpen(false);
                          handleLogoutRequest();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Desligar / Sair</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                      setPowerMenuOpen(false);
                    }}
                    className="flex items-center gap-3 hover:bg-white/15 px-2.5 py-1.5 rounded-none border border-transparent hover:border-white/30 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-semibold hidden md:inline text-white">
                      {user?.nome || 'Usuário GIPP'}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#0078d7] text-white font-bold flex items-center justify-center overflow-hidden border border-white/40 shadow-sm shrink-0">
                      {user?.fotoUrl || user?.foto ? (
                        <img src={user.fotoUrl || user.foto} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        user?.nome?.charAt(0) || 'U'
                      )}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 w-56 bg-[#1f1f1f] border border-white/20 shadow-2xl z-50 p-1 rounded-none text-xs animate-fadeIn"
                    >
                      <div className="p-3 border-b border-white/10 mb-1">
                        <p className="font-bold text-white leading-tight">{user?.nome}</p>
                        <p className="text-[10px] text-sky-400 mt-0.5">{user?.funcao_administrativa || user?.cargo || 'Administrador'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setView('config_visual');
                          setStartScreenOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0078d7] text-white transition-colors cursor-pointer"
                      >
                        <Palette size={14} />
                        <span>Mudar imagem da conta</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsScreenLocked(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0078d7] text-white transition-colors cursor-pointer"
                      >
                        <Lock size={14} />
                        <span>Bloquear sessão</span>
                      </button>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogoutRequest();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB 1: LIVE TILES VIEW */}
            {startScreenTab === 'tiles' ? (
              <div className="flex-1 px-8 md:px-14 flex items-start gap-12 overflow-x-auto custom-scrollbar pt-2 pb-16">
                {tileCategories.map((cat, cIdx) => (
                  <div key={cat.title} className="flex flex-col shrink-0">
                    {/* Category Title (Windows 8.1 Uppercase font-semibold) */}
                    <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-3 pl-1">
                      {cat.title}
                    </div>

                    {/* Tiles Grid for this category */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cat.modules.map(tile => {
                        const mInfo = ALL_AVAILABLE_MODULES.find(m => m.id === tile.id);
                        if (!mInfo || !isModuleAllowed(tile.id)) return null;
                        const TileIcon = mInfo.icon || LayoutDashboard;

                        const isWide = tile.size === 'wide' || tile.size === 'large';
                        const isLarge = tile.size === 'large';

                        return (
                          <div
                            key={tile.id}
                            draggable
                            onDragStart={(e) => handleDragStartFromMenu(e, tile.id)}
                            onClick={() => handleLaunchModule(tile.id)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({ type: 'start-tile', x: e.clientX, y: e.clientY, moduleId: tile.id });
                            }}
                            className={`relative cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-white/10 overflow-hidden ${tile.bg} ${
                              isLarge ? 'col-span-2 row-span-2 w-72 h-72' :
                              isWide ? 'col-span-2 w-72 h-34' : 'w-34 h-34'
                            }`}
                          >
                            {/* Live Tile Content Flip Simulator */}
                            <div className="w-full h-full p-3.5 flex flex-col justify-between relative z-10 text-white select-none">
                              {/* Top Icon & Live indicator badge */}
                              <div className="flex justify-between items-start">
                                <TileIcon size={isLarge ? 36 : 24} className="text-white drop-shadow-md" />
                                {tile.live && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/30 border border-white/20 uppercase tracking-widest text-white/90">
                                    Ao Vivo
                                  </span>
                                )}
                              </div>

                              {/* Live Dynamic Middle Content (Flip Effect) */}
                              {isLarge && (
                                <div className="my-auto py-2">
                                  {tile.id === 'curso_teologia' ? (
                                    <div className="text-left space-y-1">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                                        Declaração de Fé CPAD/CGADB
                                      </span>
                                      <p className="text-xs font-semibold text-white/95 line-clamp-2 leading-tight">
                                        Cap. 19: Distintivos Pentecostais & Atualidade dos Dons
                                      </p>
                                      <p className="text-[10px] text-white/70">Níveis: Básico, Médio e Avançado</p>
                                    </div>
                                  ) : tile.id === 'dashboard' ? (
                                    <div className="text-left space-y-1">
                                      <span className="text-2xl font-light tracking-tight">{currentTime}</span>
                                      <p className="text-xs font-bold capitalize text-sky-200">{currentDate}</p>
                                      <p className="text-[10px] opacity-80">{db?.igreja?.nome || 'Igreja Sede GIPP'}</p>
                                    </div>
                                  ) : null}
                                </div>
                              )}

                              {isWide && !isLarge && (
                                <div className="text-left">
                                  {tile.id === 'assistente_ai' && (
                                    <p className="text-[11px] font-semibold text-purple-200 line-clamp-1">
                                      Pastoral IA pronta para estudos bíblicos
                                    </p>
                                  )}
                                  {tile.id === 'formacao_obreiros' && (
                                    <p className="text-[11px] font-semibold text-teal-200 line-clamp-1">
                                      Módulos ministeriais e liturgia pastoral
                                    </p>
                                  )}
                                  {tile.id === 'fin_dre' && (
                                    <p className="text-[11px] font-semibold text-sky-200 line-clamp-1">
                                      Demonstrativo de Resultado do Exercício
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Bottom Label (Classic Windows 8.1 Segoe UI styling) */}
                              <div className="text-left">
                                <span className="text-xs font-bold leading-tight line-clamp-1 text-white drop-shadow-xs font-sans">
                                  {mInfo.label}
                                </span>
                              </div>
                            </div>

                            {/* Subtle glossy gradient reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Additional Desktop Tile */}
                <div className="flex flex-col shrink-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-3 pl-1">
                    ÁREA DE TRABALHO
                  </div>
                  <div
                    onClick={() => setStartScreenOpen(false)}
                    className="w-72 h-34 bg-[#005a9e] border border-white/20 p-3.5 flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start">
                      <Monitor size={28} className="text-white drop-shadow-md" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/30 border border-white/20">
                        Desktop
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Área de Trabalho</p>
                      <p className="text-[10px] text-white/70">Alternar para o ambiente tradicional</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: ALL APPS SCREEN (TODOS OS APLICATIVOS) */
              <div className="flex-1 px-8 md:px-14 overflow-y-auto custom-scrollbar pt-2 pb-16">
                <div className="mb-4 text-xs font-bold uppercase tracking-wider text-white/70">
                  {allAppsFiltered.length} Aplicativos Disponíveis
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.keys(groupedApps).sort().map(letter => (
                    <div key={letter} className="bg-black/20 border border-white/10 p-3.5 rounded-none">
                      <div className="text-lg font-light text-sky-400 border-b border-white/10 pb-1 mb-2">
                        {letter}
                      </div>
                      <div className="space-y-1.5">
                        {groupedApps[letter].map(app => {
                          const Icon = app.icon || LayoutDashboard;
                          const isPinned = isPinnedToStart(app.id);
                          const isTaskbar = isPinnedToTaskbar(app.id);

                          return (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStartFromMenu(e, app.id)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({ type: 'start-app', x: e.clientX, y: e.clientY, moduleId: app.id });
                              }}
                              className="flex items-center justify-between p-1.5 hover:bg-white/15 transition-colors cursor-pointer group"
                            >
                              <div 
                                onClick={() => handleLaunchModule(app.id)}
                                className="flex items-center gap-2.5 flex-1 min-w-0 pr-2"
                              >
                                <div className="w-7 h-7 bg-[#0078d7] flex items-center justify-center shrink-0 shadow-xs">
                                  <Icon size={16} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold text-white truncate">
                                  {app.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addShortcutToDesktop(app.id);
                                  }}
                                  className="p-1 hover:bg-white/20 text-white text-[10px]"
                                  title="Adicionar à Área de Trabalho"
                                >
                                  +Desktop
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinTaskbar(app.id);
                                  }}
                                  className={`p-1 hover:bg-white/20 text-[10px] ${isTaskbar ? 'text-sky-300' : 'text-white'}`}
                                  title={isTaskbar ? "Desafixar da Barra" : "Fixar na Barra"}
                                >
                                  {isTaskbar ? '✓Barra' : '+Barra'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Circular Arrow to toggle between Tiles and All Apps */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <button
                onClick={() => setStartScreenTab(startScreenTab === 'tiles' ? 'allApps' : 'tiles')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-md"
                title={startScreenTab === 'tiles' ? "Ver todos os aplicativos" : "Voltar aos blocos dinâmicos"}
              >
                {startScreenTab === 'tiles' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 mt-1">
                {startScreenTab === 'tiles' ? 'Aplicativos' : 'Iniciar'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 8.1 CHARMS BAR (SLIDES OUT FROM RIGHT EDGE) */}
      {/* ------------------------------------------------------------- */}
      {/* Mouse hover trigger on right border */}
      <div 
        onMouseEnter={() => setCharmsBarOpen(true)}
        className="fixed top-0 right-0 w-2 h-full z-45"
      />

      <AnimatePresence>
        {charmsBarOpen && (
          <>
            {/* Backdrop to close charms */}
            <div 
              className="fixed inset-0 z-45 cursor-default bg-black/10"
              onClick={() => {
                setCharmsBarOpen(false);
                setActiveCharmFlyout(null);
              }}
            />

            {/* Bottom-left Clock / Battery Overlay (Iconic Win8.1 Charms Indicator) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-14 left-6 z-50 bg-black/90 border border-white/20 p-4 shadow-2xl text-white select-none pointer-events-none rounded-none w-64"
            >
              <div className="text-4xl font-light tracking-tight">{currentTime}</div>
              <div className="text-xs font-semibold text-sky-400 capitalize mt-0.5">{currentDate}</div>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/10 text-[10px] text-white/80">
                <span className="flex items-center gap-1"><Wifi size={12} className="text-emerald-400" /> Conectado</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-sky-400" /> GIPP Seguro</span>
              </div>
            </motion.div>

            {/* The Charms Bar (5 Iconic Vertical Buttons) */}
            <motion.div
              initial={{ x: 80 }}
              animate={{ x: 0 }}
              exit={{ x: 80 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-10 w-20 bg-black/90 backdrop-blur-md border-l border-white/15 z-50 flex flex-col items-center justify-center gap-6 select-none shadow-2xl"
            >
              {/* 1. Pesquisar (Search) */}
              <button
                onClick={() => setActiveCharmFlyout(activeCharmFlyout === 'search' ? null : 'search')}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                  activeCharmFlyout === 'search' ? 'text-sky-400' : 'text-white/80 hover:text-white'
                }`}
                title="Pesquisar (Win+Q)"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Search size={22} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider">Pesquisar</span>
              </button>

              {/* 2. Compartilhar (Share) */}
              <button
                onClick={() => setActiveCharmFlyout(activeCharmFlyout === 'share' ? null : 'share')}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                  activeCharmFlyout === 'share' ? 'text-sky-400' : 'text-white/80 hover:text-white'
                }`}
                title="Compartilhar"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Share2 size={22} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider">Compartilhar</span>
              </button>

              {/* 3. Iniciar (Start) */}
              <button
                onClick={() => {
                  setStartScreenOpen(!startScreenOpen);
                  setCharmsBarOpen(false);
                  setActiveCharmFlyout(null);
                }}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white group cursor-pointer"
                title="Tela Inicial (Win)"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:bg-[#0078d7] transition-colors">
                  <Win81Logo size={24} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider">Iniciar</span>
              </button>

              {/* 4. Dispositivos (Devices) */}
              <button
                onClick={() => setActiveCharmFlyout(activeCharmFlyout === 'devices' ? null : 'devices')}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                  activeCharmFlyout === 'devices' ? 'text-sky-400' : 'text-white/80 hover:text-white'
                }`}
                title="Dispositivos"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Monitor size={22} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider">Dispositivos</span>
              </button>

              {/* 5. Configurações (Settings) */}
              <button
                onClick={() => setActiveCharmFlyout(activeCharmFlyout === 'settings' ? null : 'settings')}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                  activeCharmFlyout === 'settings' ? 'text-sky-400' : 'text-white/80 hover:text-white'
                }`}
                title="Configurações (Win+I)"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Settings size={22} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider">Configurações</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* CHARM FLYOUT PANELS (Settings / Search / Share / Devices) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeCharmFlyout && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-20 top-0 bottom-10 w-80 bg-[#1e1e1e] border-l border-white/20 z-50 p-6 flex flex-col justify-between shadow-2xl text-white select-none rounded-none"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                <h2 className="text-xl font-light capitalize tracking-wide">
                  {activeCharmFlyout === 'settings' ? 'Configurações' :
                   activeCharmFlyout === 'search' ? 'Pesquisa do GIPP' :
                   activeCharmFlyout === 'share' ? 'Compartilhar' : 'Dispositivos'}
                </h2>
                <button
                  onClick={() => setActiveCharmFlyout(null)}
                  className="p-1 hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content for Settings Charm */}
              {activeCharmFlyout === 'settings' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    GIPP Eclesiástico
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setView('config_visual');
                        setActiveCharmFlyout(null);
                        setCharmsBarOpen(false);
                      }}
                      className="w-full p-2 text-left bg-white/5 hover:bg-[#0078d7] transition-colors flex items-center justify-between text-xs font-semibold"
                    >
                      <span>Personalizar Telas & Papel de Parede</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setView('config_sistema');
                        setActiveCharmFlyout(null);
                        setCharmsBarOpen(false);
                      }}
                      className="w-full p-2 text-left bg-white/5 hover:bg-[#0078d7] transition-colors flex items-center justify-between text-xs font-semibold"
                    >
                      <span>Painel de Controle do Sistema</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setView('sobre');
                        setActiveCharmFlyout(null);
                        setCharmsBarOpen(false);
                      }}
                      className="w-full p-2 text-left bg-white/5 hover:bg-[#0078d7] transition-colors flex items-center justify-between text-xs font-semibold"
                    >
                      <span>Informações do Computador (Sobre)</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Windows 8.1 Settings Grid Quick Toggles */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer">
                        <Wifi size={18} className="text-emerald-400 mb-1" />
                        <span className="text-[10px]">Wi-Fi</span>
                        <span className="text-[8px] text-emerald-300">Conectado</span>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer">
                        <Volume2 size={18} className="text-sky-400 mb-1" />
                        <span className="text-[10px]">Volume</span>
                        <span className="text-[8px] text-sky-300">{volumeLevel}%</span>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer">
                        <Sun size={18} className="text-amber-400 mb-1" />
                        <span className="text-[10px]">Brilho</span>
                        <span className="text-[8px] text-amber-300">{brightnessLevel}%</span>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer">
                        <Bell size={18} className="text-purple-400 mb-1" />
                        <span className="text-[10px]">Avisos</span>
                        <span className="text-[8px] text-purple-300">Ativo</span>
                      </div>

                      <div 
                        onClick={() => requestAppFullscreen()}
                        className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer"
                      >
                        <Maximize size={18} className="text-sky-400 mb-1" />
                        <span className="text-[10px]">Tela Cheia</span>
                        <span className="text-[8px] text-sky-300">Alternar</span>
                      </div>

                      <div 
                        onClick={() => handleLogoutRequest()}
                        className="p-3 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center hover:bg-rose-600 cursor-pointer"
                      >
                        <Power size={18} className="text-rose-400 mb-1" />
                        <span className="text-[10px]">Desligar</span>
                        <span className="text-[8px] text-rose-300">Sair</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content for Search Charm */}
              {activeCharmFlyout === 'search' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Pesquisar tudo no GIPP..."
                    value={startSearchQuery}
                    onChange={(e) => setStartSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                    autoFocus
                  />
                  <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                    {ALL_AVAILABLE_MODULES.filter(m => 
                      m.label.toLowerCase().includes(startSearchQuery.toLowerCase()) || 
                      m.id.toLowerCase().includes(startSearchQuery.toLowerCase())
                    ).map(m => {
                      const Icon = m.icon || LayoutDashboard;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            handleLaunchModule(m.id);
                            setActiveCharmFlyout(null);
                            setCharmsBarOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 text-left hover:bg-[#0078d7] transition-colors cursor-pointer text-xs"
                        >
                          <Icon size={16} className="text-white shrink-0" />
                          <span className="truncate">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content for Share Charm */}
              {activeCharmFlyout === 'share' && (
                <div className="space-y-3 text-xs">
                  <p className="text-white/80 leading-relaxed">
                    Compartilhe relatórios e informações eclesiásticas com lideranças e membros:
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      addToast("Link do sistema copiado para a área de transferência!", "success");
                    }}
                    className="w-full p-2.5 bg-[#0078d7] hover:bg-[#005a9e] text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Share2 size={14} /> Copiar Link do GIPP
                  </button>
                </div>
              )}

              {/* Content for Devices Charm */}
              {activeCharmFlyout === 'devices' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Projetor / Telão do Templo</p>
                      <p className="text-[10px] text-emerald-400">Pronto para transmissão</p>
                    </div>
                    <Monitor size={18} />
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Impressora de Certificados</p>
                      <p className="text-[10px] text-white/70">Padrão do Sistema</p>
                    </div>
                    <FileText size={18} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status */}
            <div className="text-[10px] text-white/60 text-center border-t border-white/10 pt-3">
              Windows 8.1 Pro - GIPP Teológico
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 8.1 TASKBAR (BARRA DE TAREFAS CLÁSSICA INFERIOR) */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#00395d]/95 backdrop-blur-md border-t border-white/20 z-50 flex items-center justify-between px-0 select-none shadow-2xl">
        {/* Left: Windows 8.1 Start Button (Angled 4-pane logo) */}
        <button
          onClick={() => setStartScreenOpen(!startScreenOpen)}
          className={`h-full px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-white/10 ${
            startScreenOpen 
              ? 'bg-[#68217a] text-white' 
              : 'hover:bg-[#68217a] text-white/90 hover:text-white'
          }`}
          title="Iniciar"
        >
          <Win81Logo size={18} />
        </button>

        {/* Center: Running & Pinned Applications */}
        <div className="flex-1 flex items-center gap-1 px-2 h-full overflow-x-auto custom-scrollbar">
          {taskbarItemIds.map(mid => {
            const mInfo = ALL_AVAILABLE_MODULES.find(m => m.id === mid);
            if (!mInfo) return null;
            const Icon = mInfo.icon || LayoutDashboard;
            const isOpen = activeOpened.includes(mid);
            const isActive = view === mid && !activeMinimized.includes(mid) && !startScreenOpen;

            return (
              <button
                key={mid}
                onClick={() => {
                  if (startScreenOpen) {
                    setStartScreenOpen(false);
                  }
                  if (view === mid && !activeMinimized.includes(mid)) {
                    // Minimize
                    setActiveMinimized(prev => [...prev, mid]);
                  } else {
                    setView(mid);
                    if (!activeOpened.includes(mid)) setActiveOpened(prev => [...prev, mid]);
                    setActiveMinimized(prev => prev.filter(m => m !== mid));
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ type: 'taskbar-item', x: e.clientX, y: e.clientY - 80, moduleId: mid });
                }}
                className={`h-full px-3 flex items-center gap-2 transition-all cursor-pointer border-b-2 text-xs font-medium max-w-44 truncate ${
                  isActive 
                    ? 'bg-white/20 border-sky-400 text-white shadow-inner' 
                    : isOpen 
                    ? 'bg-white/10 border-white/40 text-white/90 hover:bg-white/15' 
                    : 'border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={mInfo.label}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate hidden sm:inline text-[11px]">
                  {mInfo.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Notification Area / System Tray + Aero Peek */}
        <div className="flex items-center h-full shrink-0">
          {/* Charms toggle button */}
          <button
            onClick={() => setCharmsBarOpen(!charmsBarOpen)}
            className="h-full px-2.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Barra de Atalhos (Charms Bar)"
          >
            <Sliders size={14} />
          </button>

          {/* Tray Icons (Network, Volume) */}
          <div className="flex items-center gap-2 px-2 text-white/80 text-xs">
            <Wifi size={14} className="text-emerald-400" />
            <Volume2 size={14} />
          </div>

          {/* Clock and Date (Classic Windows 8.1 vertical stack) */}
          <div 
            onClick={() => setStartScreenOpen(!startScreenOpen)}
            className="h-full px-3 hover:bg-white/10 cursor-pointer flex flex-col justify-center text-right leading-none border-l border-white/10"
          >
            <span className="text-[11px] font-semibold text-white">
              {currentTime || '14:32'}
            </span>
            <span className="text-[9px] text-white/80 mt-0.5">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>

          {/* Aero Peek (Show Desktop sliver at extreme right) */}
          <button
            onClick={() => {
              if (startScreenOpen) {
                setStartScreenOpen(false);
              }
              // Minimize all active windows to reveal desktop
              setMinimizedModules(openedModules);
            }}
            className="w-3 h-full border-l border-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            title="Mostrar Área de Trabalho"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* UNIFIED CONTEXT MENU (WINDOWS 8.1 MODERN FLAT DESIGN) */}
      {/* ------------------------------------------------------------- */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50 cursor-default"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            style={{
              left: `${Math.min(window.innerWidth - 240, Math.max(10, contextMenu.x))}px`,
              top: `${Math.min(window.innerHeight - 260, Math.max(10, contextMenu.y))}px`
            }}
            className="fixed z-50 w-60 bg-[#1f1f1f] border border-white/25 shadow-2xl p-1 text-xs select-none rounded-none text-white animate-fadeIn font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Context menu for Desktop Empty Space */}
            {contextMenu.type === 'desktop' && (
              <>
                <button
                  onClick={() => {
                    autoArrangeWin11Shortcuts();
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Grid size={14} className="text-sky-400" />
                  <span>Organizar ícones automaticamente</span>
                </button>

                <button
                  onClick={() => {
                    addToast("Área de trabalho atualizada!", "info");
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className="text-emerald-400" />
                  <span>Atualizar</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={() => {
                    setStartScreenOpen(true);
                    setStartScreenTab('allApps');
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Plus size={14} className="text-amber-400" />
                  <span>Adicionar atalho à Área de Trabalho</span>
                </button>

                <button
                  onClick={() => {
                    setView('config_visual');
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Palette size={14} className="text-purple-400" />
                  <span>Alterar Papel de Parede</span>
                </button>

                <button
                  onClick={() => {
                    setView('sobre');
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Info size={14} className="text-teal-400" />
                  <span>Propriedades do Sistema</span>
                </button>
              </>
            )}

            {/* Context menu for Desktop Icon / Shortcut */}
            {contextMenu.type === 'desktop-icon' && contextMenu.moduleId && (
              <>
                <button
                  onClick={() => handleLaunchModule(contextMenu.moduleId!)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer font-bold"
                >
                  <ArrowRight size={14} className="text-emerald-400" />
                  <span>Abrir aplicativo</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={() => {
                    togglePinTaskbar(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Sliders size={14} className="text-sky-400" />
                  <span>
                    {isPinnedToTaskbar(contextMenu.moduleId!) ? 'Desafixar da barra de tarefas' : 'Fixar na barra de tarefas'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    togglePinStart(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Win81Logo size={14} className="text-amber-400" />
                  <span>
                    {isPinnedToStart(contextMenu.moduleId!) ? 'Desafixar da tela Iniciar' : 'Fixar na tela Iniciar'}
                  </span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={() => {
                    removeShortcutFromDesktop(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-600 text-left transition-colors cursor-pointer text-rose-300 hover:text-white"
                >
                  <Trash2 size={14} />
                  <span>Remover da Área de Trabalho</span>
                </button>
              </>
            )}

            {/* Context menu for Start Tile / Start App */}
            {(contextMenu.type === 'start-tile' || contextMenu.type === 'start-app') && contextMenu.moduleId && (
              <>
                <button
                  onClick={() => handleLaunchModule(contextMenu.moduleId!)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer font-bold"
                >
                  <ArrowRight size={14} className="text-emerald-400" />
                  <span>Abrir aplicativo</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={() => {
                    togglePinStart(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Win81Logo size={14} className="text-amber-400" />
                  <span>
                    {isPinnedToStart(contextMenu.moduleId!) ? 'Desafixar da tela Iniciar' : 'Fixar na tela Iniciar'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    togglePinTaskbar(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Sliders size={14} className="text-sky-400" />
                  <span>
                    {isPinnedToTaskbar(contextMenu.moduleId!) ? 'Desafixar da barra de tarefas' : 'Fixar na barra de tarefas'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    addShortcutToDesktop(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Plus size={14} className="text-emerald-400" />
                  <span>Criar atalho na Área de Trabalho</span>
                </button>
              </>
            )}

            {/* Context menu for Taskbar item */}
            {contextMenu.type === 'taskbar-item' && contextMenu.moduleId && (
              <>
                <div className="p-2 border-b border-white/10 mb-1 text-[11px] font-bold text-sky-400 truncate">
                  {ALL_AVAILABLE_MODULES.find(m => m.id === contextMenu.moduleId)?.label || contextMenu.moduleId}
                </div>

                <button
                  onClick={() => handleLaunchModule(contextMenu.moduleId!)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer font-bold"
                >
                  <ArrowRight size={14} className="text-emerald-400" />
                  <span>Abrir</span>
                </button>

                <button
                  onClick={() => {
                    togglePinTaskbar(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0078d7] text-left transition-colors cursor-pointer"
                >
                  <Sliders size={14} className="text-sky-400" />
                  <span>
                    {isPinnedToTaskbar(contextMenu.moduleId!) ? 'Desafixar da barra de tarefas' : 'Fixar na barra de tarefas'}
                  </span>
                </button>

                {contextMenu.moduleId && activeOpened.includes(contextMenu.moduleId) && (
                  <>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => {
                        handleCloseModule(contextMenu.moduleId!);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-600 text-left transition-colors cursor-pointer text-rose-300 hover:text-white"
                    >
                      <X size={14} />
                      <span>Fechar janela</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
