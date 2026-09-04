import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, Plus, Search, X, BookOpen, GraduationCap, Shield, Database, 
  RefreshCw, Lock, Sliders, ChevronDown, ChevronUp, ChevronRight,
  Wifi, Volume2, Bell, Sun, Moon, Monitor, Share2, Grid, Check, Trash2,
  Maximize, Minus, Power, Palette, Info, History, ArrowRight, ExternalLink,
  Sparkles, ImagePlus, MessageCircle, QrCode, ShieldCheck, Newspaper,
  Award, Calendar, Gamepad2, Music, Video, Heart, Globe, Baby, Car, Package,
  FileSpreadsheet, FileCheck, CheckSquare, Activity, ArrowUpCircle, ArrowDownCircle,
  HelpCircle, Eye, EyeOff, Folder, Terminal, Battery, CloudSun, CloudRain,
  CloudLightning, Cloud, MapPin, Maximize2, Minimize2, SlidersHorizontal,
  Airplay, Bluetooth, Radio, Coffee, Laptop, HardDrive, Smartphone, Layers,
  Pin, PinOff, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestAppFullscreen } from '../lib/performanceHelpers';
import { Win11PropertiesModal } from './Win11PropertiesModal';

export const Win11Logo = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path d="M2 2H11V11H2V2Z" fill="#0078D4" />
    <path d="M13 2H22V11H13V2Z" fill="#0078D4" />
    <path d="M2 13H11V22H2V13Z" fill="#0078D4" />
    <path d="M13 13H22V22H13V13Z" fill="#0078D4" />
  </svg>
);

const RestoreOutlineIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1.5" y="4.5" width="10" height="10" rx="1.5" />
    <path d="M4.5 4.5V2.5C4.5 1.94772 4.94772 1.5 5.5 1.5H13.5C14.0523 1.5 14.5 1.94772 14.5 2.5V10.5C14.5 11.0523 14.0523 11.5 13.5 11.5H11.5" />
  </svg>
);

const SquareOutlineIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="12" height="12" rx="2" />
  </svg>
);

// High-fidelity Windows 11 Wallpapers collection
export const WIN11_WALLPAPERS = [
  {
    id: 'bloom-light',
    name: 'Windows 11 Bloom (Claro)',
    category: 'Oficial',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'light',
    accent: '#0078d4'
  },
  {
    id: 'bloom-dark',
    name: 'Windows 11 Bloom (Escuro)',
    category: 'Oficial',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'dark',
    accent: '#0078d4'
  },
  {
    id: 'glow',
    name: 'Glow (Captured Light)',
    category: 'Abstrato',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'dark',
    accent: '#8764b8'
  },
  {
    id: 'captured-motion',
    name: 'Captured Motion (Seda Fluida)',
    category: 'Movimento',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'dark',
    accent: '#d83b01'
  },
  {
    id: 'sunrise',
    name: 'Sunrise (Dunas Douradas)',
    category: 'Natureza',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'light',
    accent: '#c28b57'
  },
  {
    id: 'flow',
    name: 'Flow (Ondas Suaves)',
    category: 'Líquido',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'dark',
    accent: '#00b7c3'
  },
  {
    id: 'spotlight',
    name: 'Windows Spotlight (Montanhas)',
    category: 'Spotlight',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
    recommendedTheme: 'dark',
    accent: '#107c41'
  }
];

export const WIN11_ACCENT_COLORS = [
  { id: 'blue', label: 'Azul Windows', hex: '#0078d4' },
  { id: 'desert', label: 'Dourado Deserto', hex: '#c28b57' },
  { id: 'emerald', label: 'Verde Floresta', hex: '#107c41' },
  { id: 'iris', label: 'Íris Violeta', hex: '#5c2d91' },
  { id: 'coral', label: 'Coral Pôr do Sol', hex: '#d83b01' },
  { id: 'mint', label: 'Ciano Menta', hex: '#00b7c3' },
  { id: 'rose', label: 'Magenta Rosa', hex: '#e3008c' },
  { id: 'slate', label: 'Cinza Ardósia', hex: '#5c5c5c' },
  { id: 'amber', label: 'Âmbar Solar', hex: '#ffaa00' }
];

interface Windows11LayoutProps {
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
  updateShortcutPosition?: (id: string, x: number, y: number) => void;
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

export const Windows11Layout: React.FC<Windows11LayoutProps> = ({
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
  updateShortcutPosition = (_id?: string, _x?: number, _y?: number) => {},
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
  // Local fallbacks if parent states are not provided
  const [localMinimized, setLocalMinimized] = useState<string[]>([]);
  const [localOpened, setLocalOpened] = useState<string[]>([]);
  const [localPinnedTaskbar, setLocalPinnedTaskbar] = useState<string[]>([
    'dashboard', 'cad_membro', 'curso_teologia', 'formacao_obreiros', 'fin_entrada', 'secretaria_ebd'
  ]);
  const [localPinnedStart, setLocalPinnedStart] = useState<string[]>([
    'dashboard', 'curso_teologia', 'formacao_obreiros', 'secretaria_ebd', 'cad_membro', 
    'visitantes', 'cad_igreja', 'fin_entrada', 'fin_saida', 'patrimonio', 'escala_culto', 'assistente_ai'
  ]);

  const activeMinimized = minimizedModules || localMinimized;
  const setActiveMinimized = setMinimizedModules || setLocalMinimized;
  const activeOpened = openedModules || localOpened;
  const setActiveOpened = setOpenedModules || setLocalOpened;
  const activePinnedTaskbar = pinnedTaskbarModules || localPinnedTaskbar;
  const setActivePinnedTaskbar = setPinnedTaskbarModules || setLocalPinnedTaskbar;
  const activePinnedStart = pinnedStartModules || localPinnedStart;
  const setActivePinnedStart = setPinnedStartModules || setLocalPinnedStart;

  // Window State & Positioning
  const [windowPos, setWindowPos] = useState({ x: 60, y: 35 });
  const [windowSize, setWindowSize] = useState({ width: 1100, height: 680 });
  const [isMaximized, setIsMaximized] = useState(true);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [snapPreview, setSnapPreview] = useState<{ x: string; y: string; w: string; h: string } | null>(null);
  const [snapFlyoutOpen, setSnapFlyoutOpen] = useState(false);
  const snapFlyoutTimeoutRef = useRef<any>(null);

  // Windows 11 Personalization States
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    return localStorage.getItem('win11_wallpaper') || 'bloom-dark';
  });
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string>(() => {
    return localStorage.getItem('win11_custom_wallpaper') || '';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('win11_accent_color') || '#0078d4';
  });
  const [taskbarAlign, setTaskbarAlign] = useState<'center' | 'left'>(() => {
    return (localStorage.getItem('win11_taskbar_align') as any) || 'center';
  });
  const [micaTransparency, setMicaTransparency] = useState<boolean>(() => {
    return localStorage.getItem('win11_mica') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('win11_sound') !== 'false';
  });
  const [nightLightEnabled, setNightLightEnabled] = useState<boolean>(() => {
    return localStorage.getItem('win11_night_light') === 'true';
  });
  const [volumeLevel, setVolumeLevel] = useState(85);
  const [brightnessLevel, setBrightnessLevel] = useState(100);

  // Dialogs & Flyouts
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [startActiveTab, setStartActiveTab] = useState<'pinned' | 'all'>('pinned');
  const [startSearch, setStartSearch] = useState('');
  const [actionCenterOpen, setActionCenterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'personalization' | 'system' | 'apps' | 'accounts'>('personalization');
  const [propertiesModalModuleId, setPropertiesModalModuleId] = useState<string | null>(null);
  const [lockScreenActive, setLockScreenActive] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    type: 'desktop' | 'desktop-icon' | 'taskbar' | 'taskbar-item' | 'start-item';
    x: number;
    y: number;
    moduleId?: string;
  } | null>(null);

  // Time & Weather
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('Joinville');
  const [searchingCity, setSearchingCity] = useState(false);
  const [weatherData, setWeatherData] = useState({
    city: 'Joinville',
    temp: '23',
    apparentTemp: '24',
    humidity: '72',
    windspeed: '14',
    condition: 'Ensolarado',
    icon: 'sun',
    loading: false,
    error: null as string | null
  });

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Sound Generator for Windows 11 Soft Chimes
  const playSound = (type: 'click' | 'open' | 'chime' | 'error' = 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'open' || type === 'chime') {
        // Windows 11 signature soft chord
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.05);
          osc.stop(ctx.currentTime + idx * 0.05 + 0.4);
        });
      }
    } catch (e) {
      // AudioContext muted/blocked
    }
  };

  // Sync opened modules on view change
  useEffect(() => {
    if (view && view !== 'dashboard') {
      if (!activeOpened.includes(view)) {
        setActiveOpened(prev => [...prev, view]);
      }
      setActiveMinimized(prev => prev.filter(m => m !== view));
      setStartMenuOpen(false);
    }
  }, [view]);

  // Persist Personalization
  const handleSelectWallpaper = (wpId: string) => {
    setWallpaperId(wpId);
    localStorage.setItem('win11_wallpaper', wpId);
    const found = WIN11_WALLPAPERS.find(w => w.id === wpId);
    if (found?.recommendedTheme) {
      setTheme(found.recommendedTheme);
    }
    if (found?.accent) {
      setAccentColor(found.accent);
      localStorage.setItem('win11_accent_color', found.accent);
    }
    playSound('click');
    addToast(`Papel de parede "${found?.name || wpId}" aplicado`, 'success');
  };

  const handleSetCustomWallpaper = (url: string) => {
    setCustomWallpaperUrl(url);
    setWallpaperId('custom');
    localStorage.setItem('win11_custom_wallpaper', url);
    localStorage.setItem('win11_wallpaper', 'custom');
    playSound('chime');
    addToast('Papel de parede personalizado aplicado com sucesso', 'success');
  };

  const handleSelectAccent = (hex: string) => {
    setAccentColor(hex);
    localStorage.setItem('win11_accent_color', hex);
    playSound('click');
    addToast('Cor de destaque atualizada', 'info');
  };

  const handleToggleTaskbarAlign = () => {
    const next = taskbarAlign === 'center' ? 'left' : 'center';
    setTaskbarAlign(next);
    localStorage.setItem('win11_taskbar_align', next);
    playSound('click');
  };

  const handleToggleNightLight = () => {
    const next = !nightLightEnabled;
    setNightLightEnabled(next);
    localStorage.setItem('win11_night_light', String(next));
    playSound('click');
  };

  // Weather fetching
  const fetchWeather = async (city: string) => {
    setSearchingCity(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        const wData = await weatherRes.json();
        const cur = wData.current;
        let cond = 'Ensolarado';
        let iconType = 'sun';
        if (cur.weather_code >= 61 && cur.weather_code <= 67) { cond = 'Chuvoso'; iconType = 'rain'; }
        else if (cur.weather_code >= 95) { cond = 'Tempestade'; iconType = 'lightning'; }
        else if (cur.weather_code >= 1 && cur.weather_code <= 3) { cond = 'Parcialmente Nublado'; iconType = 'cloud-sun'; }
        else if (cur.weather_code >= 45) { cond = 'Nublado'; iconType = 'cloud'; }

        setWeatherData({
          city: place.name,
          temp: Math.round(cur.temperature_2m).toString(),
          apparentTemp: Math.round(cur.apparent_temperature).toString(),
          humidity: Math.round(cur.relative_humidity_2m).toString(),
          windspeed: Math.round(cur.wind_speed_10m).toString(),
          condition: cond,
          icon: iconType,
          loading: false,
          error: null
        });
      } else {
        setWeatherData(prev => ({ ...prev, error: 'Cidade não encontrada', loading: false }));
      }
    } catch (e) {
      setWeatherData(prev => ({ ...prev, error: 'Erro de conexão meteorológica', loading: false }));
    } finally {
      setSearchingCity(false);
    }
  };

  // Launch and Close Module
  const handleLaunchModule = (moduleId: string) => {
    playSound('open');
    setView(moduleId);
    setStartMenuOpen(false);
    setContextMenu(null);
    if (!activeOpened.includes(moduleId)) {
      setActiveOpened(prev => [...prev, moduleId]);
    }
    setActiveMinimized(prev => prev.filter(m => m !== moduleId));
  };

  const handleCloseModule = (moduleId: string) => {
    playSound('click');
    const nextOpened = activeOpened.filter(m => m !== moduleId);
    setActiveOpened(nextOpened);
    setActiveMinimized(prev => prev.filter(m => m !== moduleId));
    if (view === moduleId) {
      if (nextOpened.length > 0) {
        setView(nextOpened[nextOpened.length - 1]);
      } else {
        setView('dashboard');
      }
    }
  };

  const handleToggleMinimize = (moduleId: string) => {
    playSound('click');
    if (activeMinimized.includes(moduleId)) {
      setActiveMinimized(prev => prev.filter(m => m !== moduleId));
      setView(moduleId);
    } else {
      if (view === moduleId) {
        setActiveMinimized(prev => [...prev, moduleId]);
      } else {
        setView(moduleId);
      }
    }
  };

  // Drag and drop states for Windows 11 pinning & shortcuts
  const [isDraggingOverDesktop, setIsDraggingOverDesktop] = useState(false);
  const [isDraggingOverTaskbar, setIsDraggingOverTaskbar] = useState(false);
  const [addShortcutsModalOpen, setAddShortcutsModalOpen] = useState(false);
  const [shortcutsSearch, setShortcutsSearch] = useState('');
  const [shortcutsCategory, setShortcutsCategory] = useState<string>('all');
  const [draggingModuleId, setDraggingModuleId] = useState<string | null>(null);

  // Pinning & Shortcut Helpers
  const isDesktopShortcut = (moduleId: string) => {
    return userShortcuts.some(s => s.id === moduleId);
  };

  const togglePinTaskbar = (moduleId: string) => {
    const meta = ALL_AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (activePinnedTaskbar.includes(moduleId)) {
      setActivePinnedTaskbar(prev => prev.filter(m => m !== moduleId));
      addToast(`"${meta?.label || moduleId}" desafixado da Barra de Tarefas`, 'info');
      playSound('click');
    } else {
      setActivePinnedTaskbar(prev => [...prev, moduleId]);
      addToast(`"${meta?.label || moduleId}" fixado na Barra de Tarefas!`, 'success');
      playSound('chime');
    }
  };

  const togglePinStart = (moduleId: string) => {
    const meta = ALL_AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (activePinnedStart.includes(moduleId)) {
      setActivePinnedStart(prev => prev.filter(m => m !== moduleId));
      addToast(`"${meta?.label || moduleId}" desafixado do Iniciar`, 'info');
      playSound('click');
    } else {
      setActivePinnedStart(prev => [...prev, moduleId]);
      addToast(`"${meta?.label || moduleId}" fixado no Iniciar!`, 'success');
      playSound('chime');
    }
  };

  const toggleDesktopShortcut = (moduleId: string) => {
    const meta = ALL_AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (isDesktopShortcut(moduleId)) {
      removeShortcutFromDesktop(moduleId);
      addToast(`Atalho "${meta?.label || moduleId}" removido da Área de Trabalho`, 'info');
      playSound('click');
    } else {
      addShortcutToDesktop(moduleId);
      addToast(`Atalho "${meta?.label || moduleId}" adicionado à Área de Trabalho!`, 'success');
      playSound('chime');
    }
  };

  const handleDesktopDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverDesktop(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = Math.max(2, Math.min(88, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const dropY = Math.max(2, Math.min(88, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    const exists = userShortcuts.some(s => s.id === rawData);
    if (exists && updateShortcutPosition) {
      updateShortcutPosition(rawData, dropX, dropY);
      addToast(`Atalho reposicionado na Área de Trabalho!`, 'info');
      playSound('click');
    } else {
      addShortcutToDesktop(rawData, dropX, dropY);
      playSound('chime');
    }
  };

  const handleTaskbarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTaskbar(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    if (!activePinnedTaskbar.includes(rawData)) {
      setActivePinnedTaskbar(prev => [...prev, rawData]);
      const meta = ALL_AVAILABLE_MODULES.find(m => m.id === rawData);
      addToast(`"${meta?.label || rawData}" fixado na Barra de Tarefas!`, 'success');
      playSound('chime');
    } else {
      addToast('Este aplicativo já está na Barra de Tarefas!', 'info');
    }
  };

  // Window drag
  const handleWindowDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDraggingWindow(true);
    const startX = e.clientX - windowPos.x;
    const startY = e.clientY - windowPos.y;

    const onMove = (me: MouseEvent) => {
      setWindowPos({
        x: Math.max(0, Math.min(window.innerWidth - 250, me.clientX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - 150, me.clientY - startY))
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

  // Snap window layout action
  const handleApplySnap = (type: 'left-half' | 'right-half' | 'left-major' | 'right-minor' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    playSound('click');
    setIsMaximized(false);
    const sw = window.innerWidth;
    const sh = window.innerHeight - 48; // minus taskbar

    if (type === 'left-half') {
      setWindowPos({ x: 0, y: 0 });
      setWindowSize({ width: Math.floor(sw / 2), height: sh });
    } else if (type === 'right-half') {
      setWindowPos({ x: Math.floor(sw / 2), y: 0 });
      setWindowSize({ width: Math.floor(sw / 2), height: sh });
    } else if (type === 'left-major') {
      setWindowPos({ x: 0, y: 0 });
      setWindowSize({ width: Math.floor(sw * 0.65), height: sh });
    } else if (type === 'right-minor') {
      setWindowPos({ x: Math.floor(sw * 0.65), y: 0 });
      setWindowSize({ width: Math.floor(sw * 0.35), height: sh });
    } else if (type === 'top-left') {
      setWindowPos({ x: 0, y: 0 });
      setWindowSize({ width: Math.floor(sw / 2), height: Math.floor(sh / 2) });
    } else if (type === 'top-right') {
      setWindowPos({ x: Math.floor(sw / 2), y: 0 });
      setWindowSize({ width: Math.floor(sw / 2), height: Math.floor(sh / 2) });
    } else if (type === 'bottom-left') {
      setWindowPos({ x: 0, y: Math.floor(sh / 2) });
      setWindowSize({ width: Math.floor(sw / 2), height: Math.floor(sh / 2) });
    } else if (type === 'bottom-right') {
      setWindowPos({ x: Math.floor(sw / 2), y: Math.floor(sh / 2) });
      setWindowSize({ width: Math.floor(sw / 2), height: Math.floor(sh / 2) });
    }
    setSnapFlyoutOpen(false);
  };

  // Wallpaper computed style
  const getWallpaperBackground = () => {
    if (wallpaperId === 'custom' && customWallpaperUrl) {
      return {
        backgroundImage: `url(${customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    const found = WIN11_WALLPAPERS.find(w => w.id === wallpaperId);
    if (found) {
      return {
        backgroundImage: `url(${found.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    // Fallback Bloom gradient
    return {
      backgroundImage: theme === 'light'
        ? 'radial-gradient(circle at 50% 30%, #bde0fe 0%, #dbeafe 35%, #f1f5f9 100%)'
        : 'radial-gradient(circle at 50% 30%, #002b5b 0%, #081226 50%, #01040a 100%)'
    };
  };

  const isLight = theme === 'light';
  const isWindowMinimized = activeMinimized.includes(view) || !view;
  const WindowIcon = mMeta.icon || LayoutDashboard;

  return (
    <div 
      className={`fixed inset-0 overflow-hidden select-none font-sans ${isLight ? 'text-slate-800' : 'text-slate-100'}`}
      style={{
        ...getWallpaperBackground(),
        filter: `${nightLightEnabled ? 'sepia(0.28) hue-rotate(-12deg)' : ''} brightness(${brightnessLevel}%)`
      }}
      onClick={() => {
        setContextMenu(null);
        setUserMenuOpen(false);
        setPowerMenuOpen(false);
      }}
    >
      {/* Subtle Desktop Mica / Contrast Tint */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
        micaTransparency 
          ? (isLight ? 'bg-white/10 backdrop-blur-[0.5px]' : 'bg-black/20 backdrop-blur-[0.5px]')
          : (isLight ? 'bg-white/30' : 'bg-black/40')
      }`} />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SHORTCUTS & ICONS AREA */}
      {/* ------------------------------------------------------------- */}
      <div 
        className={`absolute inset-0 pb-12 p-4 overflow-hidden z-10 transition-colors ${
          isDraggingOverDesktop ? 'bg-sky-500/10 ring-2 ring-sky-400/50 ring-inset' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!isDraggingOverDesktop) setIsDraggingOverDesktop(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setIsDraggingOverDesktop(false);
          }
        }}
        onDrop={handleDesktopDrop}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ type: 'desktop', x: e.clientX, y: e.clientY });
        }}
      >
        {/* Drag over desktop helper banner */}
        {isDraggingOverDesktop && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-sky-400 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 pointer-events-none animate-bounce">
            <Monitor size={16} className="text-sky-400" />
            <span>Solte aqui para criar atalho na Área de Trabalho</span>
          </div>
        )}

        {/* System Fixed Icons */}
        <div 
          draggable={false}
          onDoubleClick={() => handleLaunchModule('dashboard')}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ type: 'desktop-icon', x: e.clientX, y: e.clientY, moduleId: 'dashboard' });
          }}
          style={{ position: 'absolute', left: '2%', top: '2%' }}
          className="w-20 h-22 flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:backdrop-blur-md cursor-pointer transition-all group text-center select-none"
          title="Este Computador (Painel Geral)"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Laptop size={24} className="text-sky-400 drop-shadow-md" />
          </div>
          <span className="text-[11px] font-medium mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1">
            Este Computador
          </span>
        </div>

        <div 
          draggable={false}
          onDoubleClick={() => setSettingsOpen(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ type: 'desktop', x: e.clientX, y: e.clientY });
          }}
          style={{ position: 'absolute', left: '2%', top: '15%' }}
          className="w-20 h-22 flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:backdrop-blur-md cursor-pointer transition-all group text-center select-none"
          title="Configurações & Personalização"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-500/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Settings size={24} className="text-slate-200 drop-shadow-md" />
          </div>
          <span className="text-[11px] font-medium mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1">
            Configurações
          </span>
        </div>

        <div 
          draggable={false}
          onDoubleClick={() => {
            addToast('Lixeira vazia - nenhum item excluído recentemente.', 'info');
            playSound('click');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ type: 'desktop', x: e.clientX, y: e.clientY });
          }}
          style={{ position: 'absolute', left: '2%', top: '28%' }}
          className="w-20 h-22 flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:backdrop-blur-md cursor-pointer transition-all group text-center select-none"
          title="Lixeira"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-500/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Trash2 size={22} className="text-slate-300 drop-shadow-md" />
          </div>
          <span className="text-[11px] font-medium mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1">
            Lixeira
          </span>
        </div>

        <div 
          draggable={false}
          onClick={() => {
            playSound('click');
            setAddShortcutsModalOpen(true);
          }}
          style={{ position: 'absolute', left: '2%', top: '41%' }}
          className="w-20 h-22 flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:backdrop-blur-md cursor-pointer transition-all group text-center select-none border border-dashed border-white/30 hover:border-sky-400"
          title="Adicionar ou Fixar Atalhos no Windows 11"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 backdrop-blur-md flex items-center justify-center shadow-md group-hover:scale-105 transition-transform text-sky-400">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-semibold mt-1 text-sky-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1">
            Novo Atalho
          </span>
        </div>

        {/* Dynamic User Desktop Shortcuts */}
        {userShortcuts
          .filter(s => isModuleAllowed(s.id) && s.id !== 'dashboard')
          .map(s => {
            const meta = ALL_AVAILABLE_MODULES.find(m => m.id === s.id) || { label: s.label || s.id, icon: LayoutDashboard };
            const IconComp = meta.icon || LayoutDashboard;

            return (
              <div
                key={s.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', s.id);
                  e.dataTransfer.effectAllowed = 'copyMove';
                  setDraggingModuleId(s.id);
                }}
                onDragEnd={() => setDraggingModuleId(null)}
                onDoubleClick={() => handleLaunchModule(s.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ type: 'desktop-icon', x: e.clientX, y: e.clientY, moduleId: s.id });
                }}
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`
                }}
                className="w-20 h-22 flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 hover:backdrop-blur-md cursor-pointer transition-all group text-center select-none"
                title={`${meta.label} (Dê dois cliques para abrir, ou arraste para reposicionar)`}
              >
                <div 
                  className="w-11 h-11 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform relative"
                  style={{ backgroundColor: `${accentColor}25` }}
                >
                  <IconComp size={22} className="drop-shadow-md text-white" style={{ color: accentColor }} />
                  {/* Genuine Windows Shortcut Arrow Overlay */}
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-white/95 rounded-xs shadow-xs flex items-center justify-center text-slate-800 border border-slate-300">
                    <ArrowRight size={8} className="-rotate-45" />
                  </div>
                </div>
                <span className="text-[11px] font-medium mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2 px-1">
                  {meta.label}
                </span>
              </div>
            );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE APP WINDOW (WINDOWS 11 MICA & ACRYLIC DESIGN) */}
      {/* ------------------------------------------------------------- */}
      {view && (
        <div
          style={isMaximized ? undefined : {
            position: 'absolute',
            left: `${windowPos.x}px`,
            top: `${windowPos.y}px`,
            width: `${windowSize.width}px`,
            height: `${windowSize.height}px`,
            transition: isDraggingWindow 
              ? 'none' 
              : 'left 0.18s cubic-bezier(0.1, 0.9, 0.2, 1), top 0.18s cubic-bezier(0.1, 0.9, 0.2, 1), width 0.18s cubic-bezier(0.1, 0.9, 0.2, 1), height 0.18s cubic-bezier(0.1, 0.9, 0.2, 1)'
          }}
          className={`${
            isMaximized ? 'absolute inset-0 pb-12 p-1.5 md:p-3' : ''
          } flex flex-col z-20 ${
            isWindowMinimized
              ? 'opacity-0 scale-95 translate-y-[80px] pointer-events-none'
              : 'opacity-100 scale-100 translate-y-0 transition-all duration-250 ease-out'
          }`}
        >
          <div className={`flex-1 flex flex-col rounded-xl shadow-2xl overflow-hidden min-h-0 border transition-colors duration-200 ${
            isLight 
              ? 'bg-[#f8f9fc]/90 border-slate-300/70 shadow-slate-900/15 backdrop-blur-3xl text-slate-800'
              : 'bg-[#1b1c24]/90 border-white/10 shadow-black/80 backdrop-blur-3xl text-white'
          }`}>
            {/* Windows 11 Titlebar */}
            <div
              onMouseDown={handleWindowDragStart}
              onDoubleClick={() => setIsMaximized(!isMaximized)}
              className={`h-9 px-3 flex items-center justify-between select-none shrink-0 border-b relative ${
                isLight ? 'bg-slate-100/70 border-slate-200/60' : 'bg-[#181920]/80 border-white/5'
              } ${isMaximized ? 'cursor-default' : 'cursor-move'}`}
            >
              {/* App Icon & Title */}
              <div className="flex items-center gap-2 pointer-events-none">
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  <WindowIcon size={13} />
                </div>
                <span className="text-xs font-semibold tracking-tight">
                  {mMeta.label}
                </span>
                <span className="text-[10px] opacity-40 font-normal ml-1">
                  - GIPP Windows 11
                </span>
              </div>

              {/* Windows 11 Window Controls (Minimize, Maximize/Snap, Close) */}
              <div className="flex items-center h-full">
                {/* Minimize */}
                <button
                  onClick={() => setActiveMinimized(prev => [...prev, view])}
                  className={`w-11 h-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-black/5 text-slate-700' : 'hover:bg-white/5 text-slate-300'
                  }`}
                  title="Minimizar"
                >
                  <Minus size={13} />
                </button>

                {/* Maximize / Restore & Snap Layouts Hover Menu */}
                <div 
                  className="relative h-full"
                  onMouseEnter={() => {
                    clearTimeout(snapFlyoutTimeoutRef.current);
                    setSnapFlyoutOpen(true);
                  }}
                  onMouseLeave={() => {
                    snapFlyoutTimeoutRef.current = setTimeout(() => {
                      setSnapFlyoutOpen(false);
                    }, 250);
                  }}
                >
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className={`w-11 h-full flex items-center justify-center transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-black/5 text-slate-700' : 'hover:bg-white/5 text-slate-300'
                    }`}
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                  >
                    {isMaximized ? <RestoreOutlineIcon size={12} /> : <SquareOutlineIcon size={12} />}
                  </button>

                  {/* Windows 11 Snap Layouts Popover */}
                  <AnimatePresence>
                    {snapFlyoutOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute right-0 top-10 w-64 p-3 rounded-xl shadow-2xl border backdrop-blur-2xl z-50 ${
                          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#1f2029]/95 border-white/10 text-white'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 px-1">
                          Layouts de Encaixe (Snap)
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Layout 1: 50 / 50 */}
                          <div className="flex gap-1 h-14 p-1 rounded-lg border border-white/10 bg-black/10 hover:border-sky-500 transition-colors cursor-pointer">
                            <div 
                              onClick={() => handleApplySnap('left-half')}
                              className="flex-1 rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              50%
                            </div>
                            <div 
                              onClick={() => handleApplySnap('right-half')}
                              className="flex-1 rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              50%
                            </div>
                          </div>

                          {/* Layout 2: 65 / 35 */}
                          <div className="flex gap-1 h-14 p-1 rounded-lg border border-white/10 bg-black/10 hover:border-sky-500 transition-colors cursor-pointer">
                            <div 
                              onClick={() => handleApplySnap('left-major')}
                              className="w-[65%] rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              65%
                            </div>
                            <div 
                              onClick={() => handleApplySnap('right-minor')}
                              className="w-[35%] rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              35%
                            </div>
                          </div>

                          {/* Layout 3: 4 Quadrants (2x2) */}
                          <div className="grid grid-cols-2 gap-1 h-14 p-1 rounded-lg border border-white/10 bg-black/10 hover:border-sky-500 transition-colors cursor-pointer col-span-2">
                            <div 
                              onClick={() => handleApplySnap('top-left')}
                              className="rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              TL
                            </div>
                            <div 
                              onClick={() => handleApplySnap('top-right')}
                              className="rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              TR
                            </div>
                            <div 
                              onClick={() => handleApplySnap('bottom-left')}
                              className="rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              BL
                            </div>
                            <div 
                              onClick={() => handleApplySnap('bottom-right')}
                              className="rounded-sm bg-sky-500/20 hover:bg-sky-500/60 transition-colors flex items-center justify-center text-[9px] font-bold"
                            >
                              BR
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => handleCloseModule(view)}
                  className="w-11 h-full flex items-center justify-center transition-colors hover:bg-rose-600 hover:text-white cursor-pointer"
                  title="Fechar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* App Workspace Body */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative ${
              isLight ? 'bg-white/95' : 'bg-[#16171f]/95'
            }`}>
              {hasPermission(access) ? (
                <Suspense fallback={
                  <div className="h-48 flex flex-col items-center justify-center text-center p-12 text-slate-400 font-bold bg-white/5 rounded-3xl border border-white/10 animate-pulse max-w-md mx-auto mt-12">
                    <RefreshCw className="animate-spin mb-4 text-sky-500" size={32} />
                    <span className="text-sm font-semibold">Carregando no Windows 11...</span>
                  </div>
                }>
                  <CurrentModule {...currentProps} />
                </Suspense>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <Lock size={64} className="text-rose-500 mb-6" />
                  <h2 className="text-2xl font-black">Acesso Restrito ao Módulo</h2>
                  <p className="text-sm opacity-60 mt-1 max-w-md">
                    Seu perfil não possui autorização para este aplicativo. Contate o Administrador.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 TASKBAR (CENTERED OR LEFT ALIGNED) */}
      {/* ------------------------------------------------------------- */}
      <div 
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ type: 'taskbar', x: e.clientX, y: e.clientY });
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!isDraggingOverTaskbar) setIsDraggingOverTaskbar(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setIsDraggingOverTaskbar(false);
          }
        }}
        onDrop={handleTaskbarDrop}
        className={`fixed bottom-0 left-0 right-0 h-12 flex items-center justify-between px-3 z-40 shadow-2xl backdrop-blur-3xl select-none border-t transition-colors duration-200 ${
          isDraggingOverTaskbar
            ? 'ring-2 ring-sky-400 bg-sky-950/80'
            : isLight 
              ? 'bg-slate-100/80 border-slate-200/70 text-slate-800' 
              : 'bg-[#0f1015]/85 border-white/10 text-white'
        }`}
      >
        {/* Drag over taskbar helper prompt */}
        {isDraggingOverTaskbar && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-600 text-white text-[11px] font-bold rounded-md shadow-lg pointer-events-none animate-bounce flex items-center gap-1.5 z-50">
            <Pin size={12} />
            <span>Solte para fixar na Barra de Tarefas</span>
          </div>
        )}

        {/* Left Side: Widgets board button (Weather simulator) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSound('click');
              setWidgetsOpen(!widgetsOpen);
            }}
            className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              widgetsOpen 
                ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
            }`}
            title="Widgets & Informações (Win+W)"
          >
            {weatherData.icon === 'sun' ? <Sun size={15} className="text-amber-500" /> : <CloudSun size={15} className="text-sky-400" />}
            <div className="text-left leading-none hidden sm:block">
              <span className="block text-[10px] opacity-70">{weatherData.city}</span>
              <span className="text-[11px] font-bold">{weatherData.temp}°C {weatherData.condition}</span>
            </div>
          </button>
        </div>

        {/* Center Taskbar Icons (Start, Search, Task View, Pinned Apps) */}
        <div className={`${
          taskbarAlign === 'center' 
            ? 'absolute left-1/2 -translate-x-1/2' 
            : 'flex-1 ml-4'
        } flex items-center gap-1 shrink-0`}>
          {/* Start Button */}
          <button
            onClick={() => {
              playSound('click');
              setStartMenuOpen(!startMenuOpen);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              startMenuOpen 
                ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
            }`}
            title="Iniciar (Win)"
          >
            <Win11Logo size={20} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              playSound('click');
              setStartMenuOpen(true);
              setStartActiveTab('all');
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              isLight ? 'hover:bg-white/60' : 'hover:bg-white/10'
            }`}
            title="Pesquisar (Win+S)"
          >
            <Search size={17} className="text-sky-500" />
          </button>

          {/* Settings Shortcut Button */}
          <button
            onClick={() => {
              playSound('click');
              setSettingsOpen(true);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              settingsOpen 
                ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
            }`}
            title="Configurações & Personalização"
          >
            <Settings size={18} className="text-slate-400" />
          </button>

          {/* Small divider line */}
          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Dock Apps List */}
          <div className="flex items-center gap-1">
            {(() => {
              const fullList = [...activePinnedTaskbar];
              activeOpened.forEach(id => {
                if (!fullList.includes(id)) fullList.push(id);
              });

              return fullList.filter(mid => isModuleAllowed(mid)).map(mid => {
                const info = ALL_AVAILABLE_MODULES.find(m => m.id === mid) || { label: mid, icon: LayoutDashboard };
                const IconComp = info.icon || LayoutDashboard;
                const isOpen = activeOpened.includes(mid);
                const isActive = view === mid && !activeMinimized.includes(mid);

                return (
                  <button
                    key={mid}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', mid);
                      e.dataTransfer.effectAllowed = 'copyMove';
                      setDraggingModuleId(mid);
                    }}
                    onDragEnd={() => setDraggingModuleId(null)}
                    onClick={() => handleToggleMinimize(mid)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({ type: 'taskbar-item', x: e.clientX, y: e.clientY - 140, moduleId: mid });
                    }}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all group cursor-pointer ${
                      isActive 
                        ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                        : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
                    }`}
                    title={`${info.label} (Arraste para mover ou clique com botão direito para opções)`}
                  >
                    <IconComp size={18} className={isActive ? 'text-sky-500' : 'opacity-80 group-hover:opacity-100'} />
                    
                    {/* Active / Running Indicator Pill */}
                    <span 
                      className={`absolute bottom-0.5 rounded-full transition-all duration-200 ${
                        isActive 
                          ? 'w-4 h-[3px]' 
                          : isOpen 
                            ? 'w-1.5 h-[3px] opacity-70' 
                            : 'w-0 h-0 opacity-0'
                      }`}
                      style={{ backgroundColor: accentColor }}
                    />
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Right Side: System Tray (Tray Icons, Battery/Wifi/Volume, Clock, Show Desktop) */}
        <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
          {/* Fullscreen Button */}
          <button
            onClick={() => requestAppFullscreen()}
            className={`p-1.5 rounded-md transition-colors cursor-pointer text-sky-400 ${
              isLight ? 'hover:bg-white/60' : 'hover:bg-white/10'
            }`}
            title="Tela Cheia"
          >
            <Maximize size={14} />
          </button>

          {/* Quick Settings Action Center Trigger (Wifi, Volume, Battery) */}
          <button
            onClick={() => {
              playSound('click');
              setActionCenterOpen(!actionCenterOpen);
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              actionCenterOpen 
                ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
            }`}
            title="Configurações Rápidas (Win+A)"
          >
            <Wifi size={14} className="text-sky-400" />
            <Volume2 size={14} className="opacity-80" />
            <Battery size={14} className="opacity-80" />
          </button>

          {/* Clock & Date Trigger (Calendar flyout) */}
          <button
            onClick={() => {
              playSound('click');
              setCalendarOpen(!calendarOpen);
            }}
            className={`px-2.5 py-1 rounded-lg text-right leading-tight transition-all cursor-pointer ${
              calendarOpen 
                ? (isLight ? 'bg-white shadow-xs' : 'bg-white/15')
                : (isLight ? 'hover:bg-white/60' : 'hover:bg-white/10')
            }`}
            title="Notificações e Calendário (Win+N)"
          >
            <span className="block text-[11px] font-semibold">{currentTime}</span>
            <span className="block text-[9px] opacity-70 font-normal">{currentDate}</span>
          </button>

          {/* Show Desktop Line at Far Right */}
          <div 
            onClick={() => {
              playSound('click');
              if (view && !activeMinimized.includes(view)) {
                setActiveMinimized(prev => [...prev, view]);
              } else if (view) {
                setActiveMinimized(prev => prev.filter(m => m !== view));
              }
            }}
            className="w-1.5 h-7 border-l border-white/20 hover:bg-white/30 cursor-pointer ml-1 rounded-xs"
            title="Mostrar Área de Trabalho"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 START MENU (FLOATING CENTERED ACRYLIC) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {startMenuOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-center pb-14 bg-black/10 backdrop-blur-[0.5px]"
            onClick={() => setStartMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xl rounded-2xl border p-6 flex flex-col shadow-2xl backdrop-blur-3xl ${
                isLight 
                  ? 'bg-slate-100/95 border-slate-300/80 text-slate-800 shadow-slate-900/20' 
                  : 'bg-[#1c1d26]/95 border-white/10 text-white shadow-black/80'
              }`}
            >
              {/* Search Bar */}
              <div className="relative mb-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Pesquisar aplicativos, configurações e arquivos..."
                  value={startSearch}
                  onChange={(e) => setStartSearch(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2 text-xs rounded-lg border outline-none transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                      : 'bg-black/30 border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  }`}
                />
                {startSearch && (
                  <button 
                    onClick={() => setStartSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Tabs: Pinned vs All Apps */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    {startActiveTab === 'pinned' ? 'Fixados' : 'Todos os Aplicativos'}
                  </span>
                  <button
                    onClick={() => setAddShortcutsModalOpen(true)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 text-sky-400 cursor-pointer"
                    title="Adicionar ou gerenciar aplicativos fixados"
                  >
                    <Plus size={12} />
                    <span>Adicionar</span>
                  </button>
                </div>
                <button
                  onClick={() => setStartActiveTab(startActiveTab === 'pinned' ? 'all' : 'pinned')}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{startActiveTab === 'pinned' ? 'Todos os Aplicativos' : 'Voltar aos Fixados'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Apps Grid */}
              <div className="max-h-[360px] overflow-y-auto custom-scrollbar pr-1 mb-5">
                {startActiveTab === 'pinned' ? (
                  <div className="grid grid-cols-6 gap-3">
                    {ALL_AVAILABLE_MODULES.filter(m => {
                      if (!isModuleAllowed(m.id)) return false;
                      if (startSearch) {
                        return m.label.toLowerCase().includes(startSearch.toLowerCase());
                      }
                      return activePinnedStart.includes(m.id);
                    }).map(m => {
                      const IconComp = m.icon || LayoutDashboard;
                      return (
                        <button
                          key={m.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', m.id);
                            e.dataTransfer.effectAllowed = 'copyMove';
                            setDraggingModuleId(m.id);
                          }}
                          onDragEnd={() => setDraggingModuleId(null)}
                          onClick={() => handleLaunchModule(m.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({ type: 'start-item', x: e.clientX, y: e.clientY, moduleId: m.id });
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer group text-center select-none relative"
                          title={`${m.label} (Arraste para o Desktop ou Barra de Tarefas, ou clique com botão direito)`}
                        >
                          <div 
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform mb-1.5"
                            style={{ backgroundColor: accentColor }}
                          >
                            <IconComp size={20} />
                          </div>
                          <span className="text-[10px] font-medium leading-tight line-clamp-2">
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {ALL_AVAILABLE_MODULES.filter(m => {
                      if (!isModuleAllowed(m.id)) return false;
                      if (startSearch) {
                        return m.label.toLowerCase().includes(startSearch.toLowerCase());
                      }
                      return true;
                    }).map(m => {
                      const IconComp = m.icon || LayoutDashboard;
                      const isPinnedStart = activePinnedStart.includes(m.id);
                      const isPinnedBar = activePinnedTaskbar.includes(m.id);
                      const isOnDesktop = isDesktopShortcut(m.id);

                      return (
                        <div
                          key={m.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', m.id);
                            e.dataTransfer.effectAllowed = 'copyMove';
                            setDraggingModuleId(m.id);
                          }}
                          onDragEnd={() => setDraggingModuleId(null)}
                          onClick={() => handleLaunchModule(m.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({ type: 'start-item', x: e.clientX, y: e.clientY, moduleId: m.id });
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer text-left group"
                          title={`${m.label} (Arraste para o Desktop ou Barra de Tarefas)`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                              style={{ backgroundColor: accentColor }}
                            >
                              <IconComp size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-semibold truncate">{m.label}</span>
                              <span className="block text-[10px] opacity-50 truncate">{m.category || 'Módulo GIPP'}</span>
                            </div>
                          </div>

                          {/* Quick Pin Buttons on Hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinStart(m.id);
                              }}
                              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                                isPinnedStart ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                              }`}
                              title={isPinnedStart ? "Desafixar do Iniciar" : "Fixar no Iniciar"}
                            >
                              {isPinnedStart ? <PinOff size={13} /> : <Pin size={13} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinTaskbar(m.id);
                              }}
                              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                                isPinnedBar ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                              }`}
                              title={isPinnedBar ? "Desafixar da Barra de Tarefas" : "Fixar na Barra de Tarefas"}
                            >
                              <Laptop size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDesktopShortcut(m.id);
                              }}
                              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                                isOnDesktop ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                              }`}
                              title={isOnDesktop ? "Remover da Área de Trabalho" : "Adicionar à Área de Trabalho"}
                            >
                              <Monitor size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommended Recent Activities */}
              <div className="border-t border-white/10 pt-3 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2 px-1">
                  Recomendados
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => handleLaunchModule('curso_teologia')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <BookOpen size={16} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-medium truncate">Apostila de Bibliologia</span>
                      <span className="block text-[9px] opacity-50">Declaração de Fé CPAD</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleLaunchModule('fin_entrada')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <CreditCard size={16} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-medium truncate">Lançamentos de Dízimos</span>
                      <span className="block text-[9px] opacity-50">Tesouraria Paroquial</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Menu Footer: User Profile & Power Controls */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between px-1">
                {/* User Avatar & Name */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white shadow-xs">
                      {user?.usuario ? user.usuario.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <span className="block text-xs font-bold">{user?.usuario || 'Administrador'}</span>
                      <span className="block text-[9px] opacity-60">Conta Local GIPP</span>
                    </div>
                  </button>

                  {/* User Popup */}
                  {userMenuOpen && (
                    <div className={`absolute left-0 bottom-12 w-48 p-1.5 rounded-xl shadow-2xl border backdrop-blur-2xl z-50 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-[#1f2029] border-white/10'
                    }`}>
                      <button 
                        onClick={() => {
                          setLockScreenActive(true);
                          setUserMenuOpen(false);
                          setStartMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-white/10 text-left cursor-pointer"
                      >
                        <Lock size={14} />
                        <span>Bloquear (Win+L)</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSettingsOpen(true);
                          setSettingsTab('accounts');
                          setUserMenuOpen(false);
                          setStartMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-white/10 text-left cursor-pointer"
                      >
                        <Settings size={14} />
                        <span>Configurações da Conta</span>
                      </button>
                      <button 
                        onClick={() => handleLogoutRequest()}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-rose-500/20 text-rose-400 text-left cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sair da Sessão</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Power Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setPowerMenuOpen(!powerMenuOpen)}
                    className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Ligar / Desligar"
                  >
                    <Power size={18} />
                  </button>

                  {/* Power Popup */}
                  {powerMenuOpen && (
                    <div className={`absolute right-0 bottom-12 w-44 p-1.5 rounded-xl shadow-2xl border backdrop-blur-2xl z-50 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-[#1f2029] border-white/10'
                    }`}>
                      <button 
                        onClick={() => {
                          setLockScreenActive(true);
                          setPowerMenuOpen(false);
                          setStartMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-white/10 text-left cursor-pointer"
                      >
                        <Moon size={14} />
                        <span>Suspender</span>
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-white/10 text-left cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        <span>Reiniciar Sistema</span>
                      </button>
                      <button 
                        onClick={() => handleLogoutRequest()}
                        className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-rose-500/20 text-rose-400 text-left cursor-pointer"
                      >
                        <Power size={14} />
                        <span>Desligar / Encerrar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* ACTION CENTER / QUICK SETTINGS FLYOUT */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {actionCenterOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-end p-4 pb-14 bg-black/10"
            onClick={() => setActionCenterOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-3xl ${
                isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#1c1d26]/95 border-white/10 text-white'
              }`}
            >
              {/* Quick Action Toggles */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button 
                  onClick={() => addToast('Rede Wi-Fi Conectada à Internet', 'info')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 cursor-pointer"
                >
                  <Wifi size={18} className="mb-1" />
                  <span className="text-[10px] font-semibold">Wi-Fi</span>
                  <span className="text-[8px] opacity-70">Conectado</span>
                </button>

                <button 
                  onClick={() => addToast('Bluetooth ativado', 'info')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 cursor-pointer"
                >
                  <Bluetooth size={18} className="mb-1" />
                  <span className="text-[10px] font-semibold">Bluetooth</span>
                  <span className="text-[8px] opacity-70">Ativo</span>
                </button>

                <button 
                  onClick={handleToggleNightLight}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors cursor-pointer ${
                    nightLightEnabled 
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <Sun size={18} className="mb-1" />
                  <span className="text-[10px] font-semibold">Luz Noturna</span>
                  <span className="text-[8px] opacity-70">{nightLightEnabled ? 'Ativada' : 'Desativada'}</span>
                </button>

                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                >
                  {theme === 'light' ? <Sun size={18} className="text-amber-400 mb-1" /> : <Moon size={18} className="text-sky-400 mb-1" />}
                  <span className="text-[10px] font-semibold">Tema</span>
                  <span className="text-[8px] opacity-70">{theme === 'light' ? 'Claro' : 'Escuro'}</span>
                </button>

                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors cursor-pointer ${
                    soundEnabled ? 'bg-sky-500/20 border-sky-500/30 text-sky-400' : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <Volume2 size={18} className="mb-1" />
                  <span className="text-[10px] font-semibold">Sons OS</span>
                  <span className="text-[8px] opacity-70">{soundEnabled ? 'Ligado' : 'Mudo'}</span>
                </button>

                <button 
                  onClick={() => {
                    setSettingsOpen(true);
                    setSettingsTab('personalization');
                    setActionCenterOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                >
                  <Palette size={18} className="text-pink-400 mb-1" />
                  <span className="text-[10px] font-semibold">Papéis</span>
                  <span className="text-[8px] opacity-70">Personalizar</span>
                </button>
              </div>

              {/* Brightness Slider */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] font-medium mb-1 opacity-80">
                  <span className="flex items-center gap-1"><Sun size={12} /> Brilho da Tela</span>
                  <span>{brightnessLevel}%</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="120"
                  value={brightnessLevel}
                  onChange={(e) => setBrightnessLevel(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Volume Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] font-medium mb-1 opacity-80">
                  <span className="flex items-center gap-1"><Volume2 size={12} /> Volume do Sistema</span>
                  <span>{volumeLevel}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  onChange={(e) => setVolumeLevel(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Footer: Battery percentage and Open Settings Gear */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 opacity-80">
                  <Battery size={16} className="text-emerald-400" />
                  <span className="font-semibold">98% Conectado</span>
                </div>

                <button 
                  onClick={() => {
                    setSettingsOpen(true);
                    setActionCenterOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Abrir Todas as Configurações"
                >
                  <Settings size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* CALENDAR & NOTIFICATIONS FLYOUT */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {calendarOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-end p-4 pb-14 bg-black/10"
            onClick={() => setCalendarOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-3xl ${
                isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#1c1d26]/95 border-white/10 text-white'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <div>
                  <span className="block text-sm font-bold">{currentTime}</span>
                  <span className="block text-[10px] opacity-60">{currentDate}</span>
                </div>
                <button 
                  onClick={() => setCalendarOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Monthly Calendar Simulator */}
              <div className="text-center mb-4">
                <div className="text-xs font-bold mb-2 text-sky-400">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] opacity-60 font-bold mb-1">
                  <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    const isToday = day === new Date().getDate();
                    return (
                      <div 
                        key={day}
                        className={`h-7 flex items-center justify-center rounded-lg text-[11px] font-semibold cursor-pointer ${
                          isToday 
                            ? 'bg-sky-500 text-white shadow-xs font-black' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notifications list */}
              <div className="border-t border-white/10 pt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2">
                  Notificações do Sistema
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                    <span className="block text-xs font-bold text-sky-400">Culto de Doutrina Hoje</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">Às 19:30 no Templo Central. Estudo de Teologia Bíblica CPAD.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                    <span className="block text-xs font-bold text-emerald-400">Backups de Dados Realizados</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">Base eclesiástica criptografada e salva com segurança.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 WIDGETS BOARD */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {widgetsOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-start p-4 pb-14 bg-black/15"
            onClick={() => setWidgetsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-96 max-h-[80vh] overflow-y-auto custom-scrollbar rounded-2xl border p-4 shadow-2xl backdrop-blur-3xl ${
                isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#181922]/95 border-white/10 text-white'
              }`}
            >
              {/* Weather Widget */}
              <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-sky-600/30 to-blue-700/20 mb-3 text-left">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-black tracking-tight">{weatherData.city}</h3>
                    <p className="text-[10px] opacity-70">Previsão Meteorológica</p>
                  </div>
                  <Sun size={28} className="text-amber-400" />
                </div>
                <div className="text-3xl font-black mb-1">{weatherData.temp}°C</div>
                <div className="text-xs opacity-80 flex items-center gap-2">
                  <span>Sensação: {weatherData.apparentTemp}°C</span>
                  <span>•</span>
                  <span>Umidade: {weatherData.humidity}%</span>
                </div>
              </div>

              {/* Devocional & Versículo do Dia */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-3 text-left">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400">
                  <Sparkles size={16} />
                  <span>Versículo do Dia</span>
                </div>
                <p className="text-xs italic leading-relaxed opacity-90">
                  "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus."
                </p>
                <span className="block text-[10px] font-bold text-right opacity-60 mt-1">Efésios 2:8</span>
              </div>

              {/* Atividades e Próximos Cultos */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-left">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-400">
                  <Calendar size={16} />
                  <span>Agenda da Semana</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>Quarta-feira • Culto de Oração</span>
                    <span className="font-bold text-sky-400">19:30</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>Sábado • Reunião de Jovens</span>
                    <span className="font-bold text-sky-400">19:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Domingo • Escola Bíblica & Ceia</span>
                    <span className="font-bold text-sky-400">09:00 / 18:30</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 SETTINGS APP ("CONFIGURAÇÕES") */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-4xl h-[80vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl ${
                isLight ? 'bg-slate-50/95 border-slate-300 text-slate-800' : 'bg-[#1b1c24]/95 border-white/10 text-white'
              }`}
            >
              {/* Settings Header */}
              <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                  <Settings size={18} className="text-sky-400" />
                  <span className="text-xs font-bold">Configurações do Windows 11</span>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Settings Layout: Sidebar + Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-56 border-r border-white/10 p-3 space-y-1 overflow-y-auto">
                  <button
                    onClick={() => setSettingsTab('personalization')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      settingsTab === 'personalization' 
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold' 
                        : 'hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <Palette size={16} />
                    <span>Personalização</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab('system')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      settingsTab === 'system' 
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold' 
                        : 'hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <Laptop size={16} />
                    <span>Sistema</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab('apps')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      settingsTab === 'apps' 
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold' 
                        : 'hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <Layers size={16} />
                    <span>Aplicativos</span>
                  </button>

                  <button
                    onClick={() => setSettingsTab('accounts')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      settingsTab === 'accounts' 
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold' 
                        : 'hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <Users size={16} />
                    <span>Contas & Usuários</span>
                  </button>
                </div>

                {/* Main Settings Panel */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  {settingsTab === 'personalization' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Personalização</h2>
                        <p className="text-xs opacity-60">
                          Escolha o papel de parede oficial do Windows 11, cores de destaque, tema claro/escuro e estilo da barra de tarefas.
                        </p>
                      </div>

                      {/* Official Wallpapers Gallery */}
                      <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <ImagePlus size={16} className="text-sky-400" />
                          <span>Papéis de Parede do Windows 11</span>
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {WIN11_WALLPAPERS.map(wp => (
                            <div 
                              key={wp.id}
                              onClick={() => handleSelectWallpaper(wp.id)}
                              className={`group rounded-xl overflow-hidden border-2 cursor-pointer transition-all shadow-md relative ${
                                wallpaperId === wp.id ? 'border-sky-500 scale-[1.02]' : 'border-transparent hover:border-white/40'
                              }`}
                            >
                              <img 
                                src={wp.thumbnail} 
                                alt={wp.name}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="p-2 text-left bg-black/60 backdrop-blur-sm">
                                <span className="block text-[11px] font-bold text-white truncate">{wp.name}</span>
                                <span className="block text-[9px] text-sky-300">{wp.category}</span>
                              </div>
                              {wallpaperId === wp.id && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Wallpaper Input */}
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <h4 className="text-xs font-bold mb-2">Papel de Parede Personalizado (URL da Imagem)</h4>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="https://exemplo.com/imagem-papel-de-parede.jpg"
                            value={customWallpaperUrl}
                            onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none ${
                              isLight ? 'bg-white border-slate-300' : 'bg-black/30 border-white/10'
                            }`}
                          />
                          <button
                            onClick={() => handleSetCustomWallpaper(customWallpaperUrl)}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>

                      {/* Accent Colors Palette */}
                      <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <Palette size={16} className="text-sky-400" />
                          <span>Cor de Destaque do Windows</span>
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {WIN11_ACCENT_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleSelectAccent(c.hex)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform cursor-pointer shadow-md ${
                                accentColor === c.hex ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                            >
                              {accentColor === c.hex && <Check size={16} className="text-white drop-shadow-md" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Taskbar Alignment & Options */}
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                        <h3 className="text-sm font-bold">Comportamentos da Barra de Tarefas</h3>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-semibold">Alinhamento da Barra de Tarefas</span>
                            <span className="block text-[10px] opacity-60">Escolha entre centralizada (Padrão Win11) ou à esquerda</span>
                          </div>
                          <button
                            onClick={handleToggleTaskbarAlign}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            {taskbarAlign === 'center' ? 'Centralizada' : 'À Esquerda'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div>
                            <span className="block text-xs font-semibold">Efeitos de Transparência (Mica/Acrílico)</span>
                            <span className="block text-[10px] opacity-60">Janelas e menus translúcidos</span>
                          </div>
                          <button
                            onClick={() => {
                              const next = !micaTransparency;
                              setMicaTransparency(next);
                              localStorage.setItem('win11_mica', String(next));
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              micaTransparency ? 'bg-sky-500 text-white' : 'bg-white/10'
                            }`}
                          >
                            {micaTransparency ? 'Ativado' : 'Desativado'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'system' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-2">Sobre este Sistema</h2>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="opacity-60">Edição:</span>
                          <span className="font-bold">Windows 11 Pro Eclesiástico (Build 24H2)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="opacity-60">Plataforma GIPP:</span>
                          <span className="font-bold">Universidade Teológica & Gestão Paroquial</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="opacity-60">Doutrina e Matriz:</span>
                          <span className="font-bold">CGADB / CPAD 24 Capítulos</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="opacity-60">Experiência:</span>
                          <span className="font-bold">Windows Feature Experience Pack 1000.22631</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'apps' && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold mb-2">Aplicativos Instalados ({ALL_AVAILABLE_MODULES.length})</h2>
                      <div className="space-y-1.5">
                        {ALL_AVAILABLE_MODULES.map(m => (
                          <div key={m.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                                {React.createElement(m.icon || LayoutDashboard, { size: 15 })}
                              </div>
                              <span className="font-bold">{m.label}</span>
                            </div>
                            <button
                              onClick={() => {
                                setSettingsOpen(false);
                                handleLaunchModule(m.id);
                              }}
                              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-sky-500 hover:text-white transition-colors font-semibold"
                            >
                              Abrir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsTab === 'accounts' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-2">Conta do Usuário</h2>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
                          {user?.usuario ? user.usuario.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <h3 className="text-base font-bold">{user?.usuario || 'Administrador Geral'}</h3>
                          <p className="text-xs opacity-60">Conta de Administrador Paroquial</p>
                          <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Autenticado e Conectado</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 LOCK SCREEN SIMULATION */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {lockScreenActive && (
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: -window.innerHeight }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            onClick={() => {
              playSound('chime');
              setLockScreenActive(false);
            }}
            className="fixed inset-0 z-[100] flex flex-col justify-between p-12 text-center text-white cursor-pointer select-none"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
            <div className="relative z-10 pt-16">
              <div className="text-7xl md:text-8xl font-light font-sans drop-shadow-lg">
                {currentTime}
              </div>
              <div className="text-lg md:text-xl font-medium mt-2 drop-shadow-md opacity-90">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>

            <div className="relative z-10 pb-8 animate-bounce flex flex-col items-center">
              <ChevronUp size={24} className="mb-1" />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                Clique em qualquer lugar para desbloquear
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT-CLICK CONTEXT MENU (WINDOWS 11 STYLE) */}
      {/* ------------------------------------------------------------- */}
      {contextMenu && (
        <div
          style={{ 
            left: `${Math.min(window.innerWidth - 250, Math.max(10, contextMenu.x))}px`, 
            top: `${Math.min(window.innerHeight - 320, Math.max(10, contextMenu.y))}px` 
          }}
          onClick={(e) => e.stopPropagation()}
          className={`fixed z-50 w-60 p-1.5 rounded-xl border shadow-2xl backdrop-blur-2xl text-xs select-none animate-fadeIn ${
            isLight ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/15' : 'bg-[#1f2029]/95 border-white/10 text-white shadow-black/80'
          }`}
        >
          {contextMenu.type === 'desktop' && (
            <>
              <button 
                onClick={() => {
                  setContextMenu(null);
                  setAddShortcutsModalOpen(true);
                  playSound('click');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer font-bold text-sky-400"
              >
                <Plus size={14} />
                <span>Adicionar Atalhos...</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  autoArrangeWin11Shortcuts();
                  addToast('Atalhos da Área de Trabalho auto-organizados!', 'info');
                  playSound('click');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Grid size={14} />
                <span>Organizar Ícones Automaticamente</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  window.location.reload();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Atualizar</span>
              </button>

              <div className="h-px bg-white/10 my-1" />

              <button 
                onClick={() => {
                  setContextMenu(null);
                  setSettingsOpen(true);
                  setSettingsTab('personalization');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Palette size={14} />
                <span>Personalizar Fundo & Cores</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  setSettingsOpen(true);
                  setSettingsTab('system');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Monitor size={14} />
                <span>Configurações de Tela</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  requestAppFullscreen();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Maximize size={14} />
                <span>Modo Tela Cheia</span>
              </button>
            </>
          )}

          {(contextMenu.type === 'taskbar-item' || contextMenu.type === 'start-item' || contextMenu.type === 'desktop-icon') && contextMenu.moduleId && (
            <>
              <button 
                onClick={() => {
                  handleLaunchModule(contextMenu.moduleId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer font-bold text-sky-400"
              >
                <ExternalLink size={14} />
                <span>Abrir Aplicativo</span>
              </button>

              <div className="h-px bg-white/10 my-1" />

              {/* Pin/Unpin from Start */}
              <button 
                onClick={() => {
                  togglePinStart(contextMenu.moduleId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                {activePinnedStart.includes(contextMenu.moduleId) ? (
                  <>
                    <PinOff size={14} className="text-amber-400" />
                    <span>Desafixar do Iniciar</span>
                  </>
                ) : (
                  <>
                    <Pin size={14} className="text-amber-400" />
                    <span>Fixar no Iniciar</span>
                  </>
                )}
              </button>

              {/* Pin/Unpin from Taskbar */}
              <button 
                onClick={() => {
                  togglePinTaskbar(contextMenu.moduleId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                {activePinnedTaskbar.includes(contextMenu.moduleId) ? (
                  <>
                    <PinOff size={14} className="text-sky-400" />
                    <span>Desafixar da Barra de Tarefas</span>
                  </>
                ) : (
                  <>
                    <Laptop size={14} className="text-sky-400" />
                    <span>Fixar na Barra de Tarefas</span>
                  </>
                )}
              </button>

              {/* Add/Remove from Desktop */}
              <button 
                onClick={() => {
                  toggleDesktopShortcut(contextMenu.moduleId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                {isDesktopShortcut(contextMenu.moduleId) ? (
                  <>
                    <Trash2 size={14} className="text-rose-400" />
                    <span>Remover da Área de Trabalho</span>
                  </>
                ) : (
                  <>
                    <Monitor size={14} className="text-emerald-400" />
                    <span>Adicionar à Área de Trabalho</span>
                  </>
                )}
              </button>

              <div className="h-px bg-white/10 my-1" />

              <button 
                onClick={() => {
                  setPropertiesModalModuleId(contextMenu.moduleId!);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Info size={14} />
                <span>Propriedades do Módulo</span>
              </button>

              {activeOpened.includes(contextMenu.moduleId) && (
                <button 
                  onClick={() => {
                    handleCloseModule(contextMenu.moduleId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 text-left cursor-pointer"
                >
                  <X size={14} />
                  <span>Fechar Janela</span>
                </button>
              )}
            </>
          )}

          {contextMenu.type === 'taskbar' && (
            <>
              <button 
                onClick={() => {
                  setContextMenu(null);
                  setAddShortcutsModalOpen(true);
                  playSound('click');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer font-bold text-sky-400"
              >
                <Plus size={14} />
                <span>Gerenciar Fixações...</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  setSettingsOpen(true);
                  setSettingsTab('personalization');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <Settings size={14} />
                <span>Configurações da Barra de Tarefas</span>
              </button>

              <button 
                onClick={() => {
                  setContextMenu(null);
                  setTaskbarAlign(taskbarAlign === 'center' ? 'left' : 'center');
                  localStorage.setItem('win11_taskbar_align', taskbarAlign === 'center' ? 'left' : 'center');
                  playSound('click');
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 text-left cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Alinhar Ícones ao {taskbarAlign === 'center' ? 'Início (Esquerda)' : 'Centro'}</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WINDOWS 11 SHORTCUTS & PINNING MANAGER MODAL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {addShortcutsModalOpen && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            onClick={() => setAddShortcutsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl max-h-[85vh] rounded-2xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden ${
                isLight 
                  ? 'bg-slate-50/95 border-slate-200 text-slate-800' 
                  : 'bg-[#1e1f2b]/95 border-white/10 text-white'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white" style={{ backgroundColor: accentColor }}>
                    <Win11Logo size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Gerenciador de Atalhos & Fixações</h2>
                    <p className="text-xs opacity-60">Personalize o Iniciar, Barra de Tarefas e Área de Trabalho do Windows 11</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddShortcutsModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-5 pb-3 border-b border-white/10 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={shortcutsSearch}
                    onChange={(e) => setShortcutsSearch(e.target.value)}
                    placeholder="Pesquisar módulos por nome ou categoria..."
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-white border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500' 
                        : 'bg-black/30 border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                    }`}
                  />
                  {shortcutsSearch && (
                    <button 
                      onClick={() => setShortcutsSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Quick Category filter selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  {['all', 'pinned-start', 'pinned-bar', 'on-desktop'].map(fKey => {
                    const labels: Record<string, string> = {
                      'all': 'Todos os Módulos',
                      'pinned-start': 'No Iniciar',
                      'pinned-bar': 'Na Barra',
                      'on-desktop': 'No Desktop'
                    };
                    const isActive = shortcutsCategory === fKey;
                    return (
                      <button
                        key={fKey}
                        onClick={() => setShortcutsCategory(fKey)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-sky-500 text-white shadow-sm' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {labels[fKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modules Grid */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_AVAILABLE_MODULES
                    .filter(m => {
                      if (!isModuleAllowed(m.id)) return false;
                      if (shortcutsSearch) {
                        const q = shortcutsSearch.toLowerCase();
                        const matchName = m.label.toLowerCase().includes(q);
                        const matchCat = (m.category || '').toLowerCase().includes(q);
                        if (!matchName && !matchCat) return false;
                      }
                      if (shortcutsCategory === 'pinned-start') return activePinnedStart.includes(m.id);
                      if (shortcutsCategory === 'pinned-bar') return activePinnedTaskbar.includes(m.id);
                      if (shortcutsCategory === 'on-desktop') return isDesktopShortcut(m.id);
                      return true;
                    })
                    .map(m => {
                      const IconComp = m.icon || LayoutDashboard;
                      const isPinnedStart = activePinnedStart.includes(m.id);
                      const isPinnedBar = activePinnedTaskbar.includes(m.id);
                      const isOnDesktop = isDesktopShortcut(m.id);

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                            isLight 
                              ? 'bg-white border-slate-200 hover:border-sky-300 shadow-xs' 
                              : 'bg-white/5 border-white/10 hover:border-sky-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                              style={{ backgroundColor: accentColor }}
                            >
                              <IconComp size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold truncate">{m.label}</h3>
                              <p className="text-[11px] opacity-60 truncate">{m.category || 'Módulo do Sistema'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {isPinnedStart && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-0.5">
                                    <Pin size={9} /> Iniciar
                                  </span>
                                )}
                                {isPinnedBar && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 flex items-center gap-0.5">
                                    <Laptop size={9} /> Barra
                                  </span>
                                )}
                                {isOnDesktop && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                                    <Monitor size={9} /> Desktop
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 3 Action Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-white/5 text-[11px]">
                            {/* Toggle Start */}
                            <button
                              onClick={() => togglePinStart(m.id)}
                              className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isPinnedStart
                                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                              title={isPinnedStart ? "Desafixar do Iniciar" : "Fixar no Iniciar"}
                            >
                              {isPinnedStart ? <PinOff size={12} /> : <Pin size={12} />}
                              <span>{isPinnedStart ? 'No Iniciar' : '+ Iniciar'}</span>
                            </button>

                            {/* Toggle Taskbar */}
                            <button
                              onClick={() => togglePinTaskbar(m.id)}
                              className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isPinnedBar
                                  ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                              title={isPinnedBar ? "Desafixar da Barra de Tarefas" : "Fixar na Barra de Tarefas"}
                            >
                              <Laptop size={12} />
                              <span>{isPinnedBar ? 'Na Barra' : '+ Barra'}</span>
                            </button>

                            {/* Toggle Desktop */}
                            <button
                              onClick={() => toggleDesktopShortcut(m.id)}
                              className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isOnDesktop
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                              title={isOnDesktop ? "Remover da Área de Trabalho" : "Criar Atalho na Área de Trabalho"}
                            >
                              <Monitor size={12} />
                              <span>{isOnDesktop ? 'No Desktop' : '+ Desktop'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Pin size={13} className="text-amber-400" />
                    <strong>{activePinnedStart.length}</strong> no Iniciar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Laptop size={13} className="text-sky-400" />
                    <strong>{activePinnedTaskbar.length}</strong> na Barra
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Monitor size={13} className="text-emerald-400" />
                    <strong>{userShortcuts.length}</strong> no Desktop
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      autoArrangeWin11Shortcuts();
                      addToast('Atalhos da Área de Trabalho organizados!', 'info');
                      playSound('click');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Grid size={13} />
                    <span>Auto-Organizar Desktop</span>
                  </button>

                  <button
                    onClick={() => setAddShortcutsModalOpen(false)}
                    className="px-5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all cursor-pointer shadow-md"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Module Properties Modal */}
      {propertiesModalModuleId && (
        <Win11PropertiesModal
          activeModuleId={propertiesModalModuleId}
          activeModuleLabel={ALL_AVAILABLE_MODULES.find(m => m.id === propertiesModalModuleId)?.label || propertiesModalModuleId}
          activeModuleIcon={ALL_AVAILABLE_MODULES.find(m => m.id === propertiesModalModuleId)?.icon || LayoutDashboard}
          activeModuleColor={accentColor}
          theme={theme}
          onClose={() => setPropertiesModalModuleId(null)}
          setView={setView}
        />
      )}
    </div>
  );
};
