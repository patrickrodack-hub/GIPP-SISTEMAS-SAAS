import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { 
  Search, X, Grid, Sliders, ExternalLink, Shield, Info, BookOpen, 
  Settings, Lock, LogOut, ChevronRight, Plus, Check, RefreshCw, 
  Minus, Wifi, WifiOff, Volume2, VolumeX, Battery, BatteryCharging, 
  Sun, Moon, Eye, Bell, BellOff, Calendar as CalendarIcon, 
  Layers, CheckSquare, Clock, CloudSun, CloudRain, Zap, Cloud, 
  Maximize2, ArrowLeft, ArrowRight, UserCheck, AlertCircle, 
  ChevronDown, Monitor, Laptop, Sparkles, Folder, Play, Pause, RotateCcw,
  Pin, LayoutGrid, Trash2, XCircle
} from 'lucide-react';
import { Win11PropertiesModal } from './Win11PropertiesModal';
import { Win11NewShortcutModal } from './win11/Win11NewShortcutModal';
import { Win11ContextMenu, DesktopContextMenuState, ItemContextMenuState } from './win11/Win11ContextMenu';
import { win11Audio } from './win11/Win11Audio';

// Componentes auxiliares de ícone Windows 11
export const Win11Logo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ width: `${size}px`, height: `${size}px` }} 
    className="grid grid-cols-2 gap-[2px] transition-transform duration-200 group-hover:scale-105"
  >
    <div className="bg-[#00a4ef] rounded-[1px] shadow-[0_0_3px_rgba(0,164,239,0.5)]"></div>
    <div className="bg-[#00a4ef] rounded-[1px] shadow-[0_0_3px_rgba(0,164,239,0.5)]"></div>
    <div className="bg-[#00a4ef] rounded-[1px] shadow-[0_0_3px_rgba(0,164,239,0.5)]"></div>
    <div className="bg-[#00a4ef] rounded-[1px] shadow-[0_0_3px_rgba(0,164,239,0.5)]"></div>
  </div>
);

export const SquareOutlineIcon = ({ size = 12 }: { size?: number }) => (
  <div 
    style={{ width: `${size}px`, height: `${size}px` }} 
    className="border-[1.5px] border-current rounded-[2px]" 
  />
);

export const RestoreOutlineIcon = ({ size = 12 }: { size?: number }) => (
  <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
    <div className="absolute top-0 right-0 w-[70%] h-[70%] border-[1.5px] border-current rounded-[1px]" />
    <div className="absolute bottom-0 left-0 w-[70%] h-[70%] border-[1.5px] border-current bg-transparent rounded-[1px]" />
  </div>
);

// Papéis de Parede Oficiais do Windows 11
const WIN11_WALLPAPERS = [
  {
    id: 'bloom_dark',
    name: 'Windows 11 Bloom (Dark)',
    type: 'gradient_dark',
    preview: 'bg-gradient-to-tr from-[#020d20] via-[#080d1e] to-[#010310]',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'bloom_light',
    name: 'Windows 11 Bloom (Light)',
    type: 'gradient_light',
    preview: 'bg-gradient-to-tr from-[#eef2f7] via-[#f3f4f6] to-[#ffffff]',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'glow_purple',
    name: 'Windows 11 Glow (Neon)',
    type: 'image',
    preview: 'bg-gradient-to-tr from-[#1b082e] via-[#2f1052] to-[#090214]',
    img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'flow_blue',
    name: 'Windows 11 Flow (Ondas)',
    type: 'image',
    preview: 'bg-gradient-to-tr from-[#0a192f] via-[#172a45] to-[#203a43]',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'sunrise',
    name: 'Windows 11 Sunrise',
    type: 'image',
    preview: 'bg-gradient-to-tr from-[#2b1055] via-[#7597de] to-[#ffbe76]',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop'
  }
];

interface Windows11LayoutProps {
  view: string;
  setView: (view: string) => void;
  user: any;
  db: any;
  mMeta: any;
  isModuleAllowed: (id: string) => boolean;
  hasPermission?: (perm: string) => boolean;
  access?: any;
  CurrentModule: any;
  currentProps: any;
  handleLogoutRequest: () => void;
  setIsScreenLocked: (locked: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
  osTheme: string;
  setOsTheme: (theme: string) => void;
  animBgEnabled: boolean;
  setAnimBgEnabled: (enabled: boolean) => void;
  ALL_AVAILABLE_MODULES: any[];
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
  animBgEnabled,
  setAnimBgEnabled,
  ALL_AVAILABLE_MODULES
}) => {
  // --- ESTADOS DO WINDOWS 11 ---
  const [win11LauncherOpen, setWin11LauncherOpen] = useState(false);
  const [win11Search, setWin11Search] = useState('');
  const [win11ActiveTab, setWin11ActiveTab] = useState<'pinned' | 'all'>('pinned');
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);

  // Janela Fluente
  const [win11IsMaximized, setWin11IsMaximized] = useState(true);
  const [win11IsMinimized, setWin11IsMinimized] = useState(false);
  const [win11WindowPos, setWin11WindowPos] = useState({ x: 80, y: 40 });
  const [win11WindowSize, setWin11WindowSize] = useState({ width: 1040, height: 680 });
  const [win11IsDraggingOrResizing, setWin11IsDraggingOrResizing] = useState(false);

  // Snap Layouts
  const [snapFlyoutOpen, setSnapFlyoutOpen] = useState(false);
  const snapTimerRef = useRef<any>(null);

  // Flyouts do Sistema
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [calendarCenterOpen, setCalendarCenterOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);

  // Context Menus
  const [desktopContextMenu, setDesktopContextMenu] = useState<DesktopContextMenuState | null>(null);
  const [itemContextMenu, setItemContextMenu] = useState<ItemContextMenuState | null>(null);
  const [desktopIconSize, setDesktopIconSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Modais
  const [win11PropertiesOpen, setWin11PropertiesOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [newShortcutModalOpen, setNewShortcutModalOpen] = useState(false);

  // Papel de Parede
  const [activeWallpaperId, setActiveWallpaperId] = useState<string>(() => {
    return localStorage.getItem('gipp_win11_wallpaper') || 'bloom_dark';
  });

  // Quick Settings Toggles
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [nightLight, setNightLight] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [taskbarAlignment, setTaskbarAlignment] = useState<'center' | 'left'>(() => {
    return (localStorage.getItem('gipp_win11_taskbar_align') as 'center' | 'left') || 'center';
  });

  // Pomodoro / Focus Timer
  const [focusTimerRunning, setFocusTimerRunning] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(0);

  // Clima e Data/Hora
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(new Date());
  const [win11Weather, setWin11Weather] = useState({
    temp: 24,
    apparentTemp: 25,
    humidity: 65,
    windspeed: 12,
    city: 'Brasília',
    state: 'DF',
    icon: 'cloud-sun',
    loading: false,
    error: null as string | null
  });

  // Usuário e Chave de Storage
  const username = user?.usuario || user?.nome || 'default';

  // --- ATALHOS NO DESKTOP ---
  const defaultShortcuts = [
    { id: 'dashboard', label: 'Painel Central', x: 2, y: 3 },
    { id: 'cad_membro', label: 'Rol de Membros', x: 2, y: 16 },
    { id: 'fin_entrada', label: 'Dízimos & Ofertas', x: 2, y: 29 },
    { id: 'biblia', label: 'Bíblia de Estudos', x: 2, y: 42 },
    { id: 'ebd', label: 'Escola Dominical', x: 2, y: 55 },
    { id: 'celulas', label: 'Células & PG', x: 2, y: 68 }
  ];

  const [userShortcuts, setUserShortcuts] = useState<Array<{ id: string; label: string; x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem(`gipp-win11-shortcuts-${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultShortcuts;
  });

  // --- FIXAÇÕES NO MENU INICIAR ---
  const [pinnedStartIds, setPinnedStartIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`gipp-win11-start-pinned-${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['dashboard', 'cad_membro', 'fin_entrada', 'fin_saida', 'biblia', 'ebd', 'celulas', 'agenda', 'relatorios', 'assistente_ai', 'formacao_obreiros', 'midia'];
  });

  // --- FIXAÇÕES NA BARRA DE TAREFAS ---
  const [pinnedTaskbarIds, setPinnedTaskbarIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`gipp-win11-taskbar-pinned-${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['dashboard', 'cad_membro', 'fin_entrada', 'biblia', 'ebd', 'assistente_ai'];
  });

  const [draggingShortcutId, setDraggingShortcutId] = useState<string | null>(null);
  const [activeDragPos, setActiveDragPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);

  // Caixa de Seleção Elástica do Desktop
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const isSelectingRef = useRef(false);

  // Desktops Virtuais (Task View)
  const [activeVirtualDesktop, setActiveVirtualDesktop] = useState(1);

  // Cores dinâmicas Windows 11
  const isLight = theme === 'light';

  // Refs de Arraste da Janela
  const win11PosRef = useRef(win11WindowPos);
  win11PosRef.current = win11WindowPos;
  const win11SizeRef = useRef(win11WindowSize);
  win11SizeRef.current = win11WindowSize;

  // Tocar som de inicialização
  useEffect(() => {
    if (soundEnabled) {
      win11Audio.playStartup();
    }
  }, []);

  // Relógio do Sistema em Tempo Real
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

  // Pomodoro Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (focusTimerRunning) {
      timer = setInterval(() => {
        setFocusSeconds((prevSec) => {
          if (prevSec > 0) return prevSec - 1;
          setFocusMinutes((prevMin) => {
            if (prevMin > 0) return prevMin - 1;
            setFocusTimerRunning(false);
            if (soundEnabled) win11Audio.playNotification();
            return 25;
          });
          return 59;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusTimerRunning, soundEnabled]);

  // Sincronização do Clima
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWin11Weather(prev => ({ ...prev, loading: true, error: null }));
        const city = db?.igreja?.cidade || 'Brasília';
        const state = db?.igreja?.estado || 'DF';

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        const geoData = await geoRes.json();

        if (geoData?.results?.[0]) {
          const { latitude, longitude, name, admin1 } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
          const weatherData = await weatherRes.json();
          const cur = weatherData?.current;

          let iconType = 'cloud-sun';
          if (cur?.weather_code <= 1) iconType = 'sun';
          else if (cur?.weather_code >= 51 && cur?.weather_code <= 67) iconType = 'rain';
          else if (cur?.weather_code >= 95) iconType = 'lightning';

          setWin11Weather({
            temp: Math.round(cur?.temperature_2m ?? 24),
            apparentTemp: Math.round(cur?.apparent_temperature ?? 25),
            humidity: Math.round(cur?.relative_humidity_2m ?? 65),
            windspeed: Math.round(cur?.wind_speed_10m ?? 12),
            city: name || city,
            state: admin1 || state,
            icon: iconType,
            loading: false,
            error: null
          });
        } else {
          setWin11Weather(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        setWin11Weather(prev => ({ ...prev, loading: false, error: 'Falha ao sincronizar clima' }));
      }
    };
    fetchWeather();
  }, [db?.igreja?.cidade]);

  // Salvar Atalhos do Desktop
  const saveUserShortcuts = (shortcutsList: typeof userShortcuts) => {
    setUserShortcuts(shortcutsList);
    try {
      localStorage.setItem(`gipp-win11-shortcuts-${username}`, JSON.stringify(shortcutsList));
    } catch {}
  };

  // Salvar Pinned Start
  const savePinnedStartIds = (ids: string[]) => {
    setPinnedStartIds(ids);
    try {
      localStorage.setItem(`gipp-win11-start-pinned-${username}`, JSON.stringify(ids));
    } catch {}
  };

  // Salvar Pinned Taskbar
  const savePinnedTaskbarIds = (ids: string[]) => {
    setPinnedTaskbarIds(ids);
    try {
      localStorage.setItem(`gipp-win11-taskbar-pinned-${username}`, JSON.stringify(ids));
    } catch {}
  };

  // Toggle Atalho no Desktop
  const toggleDesktopShortcut = (moduleId: string) => {
    const existing = userShortcuts.find(s => s.id === moduleId);
    if (existing) {
      saveUserShortcuts(userShortcuts.filter(s => s.id !== moduleId));
    } else {
      const meta = ALL_AVAILABLE_MODULES.find(m => m.id === moduleId);
      if (!meta) return;
      const newIndex = userShortcuts.length;
      const col = Math.floor(newIndex / 6);
      const row = newIndex % 6;
      const newShortcut = {
        id: moduleId,
        label: meta.label,
        x: 2 + col * 10,
        y: 3 + row * 13
      };
      saveUserShortcuts([...userShortcuts, newShortcut]);
    }
    if (soundEnabled) win11Audio.playClick();
  };

  // Toggle Pinned Start
  const togglePinStart = (moduleId: string) => {
    if (pinnedStartIds.includes(moduleId)) {
      savePinnedStartIds(pinnedStartIds.filter(id => id !== moduleId));
    } else {
      savePinnedStartIds([...pinnedStartIds, moduleId]);
    }
    if (soundEnabled) win11Audio.playClick();
  };

  // Toggle Pinned Taskbar
  const togglePinTaskbar = (moduleId: string) => {
    if (pinnedTaskbarIds.includes(moduleId)) {
      savePinnedTaskbarIds(pinnedTaskbarIds.filter(id => id !== moduleId));
    } else {
      savePinnedTaskbarIds([...pinnedTaskbarIds, moduleId]);
    }
    if (soundEnabled) win11Audio.playClick();
  };

  // Auto organizar em grade
  const autoArrangeWin11Shortcuts = () => {
    const arranged = userShortcuts.map((s, index) => {
      const col = Math.floor(index / 6);
      const row = index % 6;
      return {
        ...s,
        x: 2 + col * 10,
        y: 3 + row * 13
      };
    });
    saveUserShortcuts(arranged);
    if (soundEnabled) win11Audio.playSnap();
  };

  // Adicionar atalho em posição específica (Drag & Drop)
  const addShortcutToDesktopAt = (moduleId: string, clientX: number, clientY: number) => {
    const container = document.getElementById('win11-desktop-area');
    const rect = container?.getBoundingClientRect() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight - 48 };
    
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const xPercent = Math.max(1, Math.min(88, (relX / rect.width) * 100));
    const yPercent = Math.max(2, Math.min(82, (relY / rect.height) * 100));

    const meta = ALL_AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (!meta) return;

    const existing = userShortcuts.find(s => s.id === moduleId);
    if (existing) {
      const updated = userShortcuts.map(s => s.id === moduleId ? { ...s, x: Math.round(xPercent * 10) / 10, y: Math.round(yPercent * 10) / 10 } : s);
      saveUserShortcuts(updated);
    } else {
      const newShortcut = {
        id: moduleId,
        label: meta.label,
        x: Math.round(xPercent * 10) / 10,
        y: Math.round(yPercent * 10) / 10
      };
      saveUserShortcuts([...userShortcuts, newShortcut]);
    }
    if (soundEnabled) win11Audio.playSnap();
  };

  // --- ARRASTE DE ATALHOS NO DESKTOP ---
  const handleShortcutMouseDown = (e: React.MouseEvent, shortcutId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedShortcutId(shortcutId);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    let dragDistance = 0;

    const container = document.getElementById('win11-desktop-area');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const targetShortcut = userShortcuts.find(s => s.id === shortcutId);
    if (!targetShortcut) return;

    const startXPercent = targetShortcut.x;
    const startYPercent = targetShortcut.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startClientX;
      const dy = moveEvent.clientY - startClientY;
      dragDistance = Math.sqrt(dx * dx + dy * dy);

      if (dragDistance > 6) {
        setDraggingShortcutId(shortcutId);
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;

        const newX = Math.max(1, Math.min(90, startXPercent + dxPercent));
        const newY = Math.max(2, Math.min(84, startYPercent + dyPercent));
        setActiveDragPos({ x: newX, y: newY });
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (dragDistance >= 6 && activeDragPos) {
        const updated = userShortcuts.map(s => {
          if (s.id === shortcutId) {
            return {
              ...s,
              x: Math.round(activeDragPos.x * 10) / 10,
              y: Math.round(activeDragPos.y * 10) / 10
            };
          }
          return s;
        });
        saveUserShortcuts(updated);
      }

      setDraggingShortcutId(null);
      setActiveDragPos(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- SELEÇÃO EM RETÂNGULO NO DESKTOP (RUBBER BAND) ---
  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('#win11-window, #win11-taskbar, #win11-start-menu, #win11-quick-settings, #win11-calendar-center, #win11-widgets-panel, .win11-desktop-shortcut')) {
      return;
    }
    
    // Fechar menus abertos
    setWin11LauncherOpen(false);
    setQuickSettingsOpen(false);
    setCalendarCenterOpen(false);
    setWidgetsOpen(false);
    setDesktopContextMenu(null);
    setItemContextMenu(null);
    setSelectedShortcutId(null);

    const startX = e.clientX;
    const startY = e.clientY;
    isSelectingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSelectingRef.current) return;
      setSelectionBox({
        startX,
        startY,
        currentX: moveEvent.clientX,
        currentY: moveEvent.clientY
      });
    };

    const onMouseUp = () => {
      isSelectingRef.current = false;
      setSelectionBox(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- ARRASTE E REDIMENSIONAMENTO DA JANELA ---
  const handleWindowDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (win11IsMaximized) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a')) return;

    setWin11IsDraggingOrResizing(true);
    const startX = e.clientX - win11PosRef.current.x;
    const startY = e.clientY - win11PosRef.current.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newX = Math.max(-win11SizeRef.current.width + 150, Math.min(moveEvent.clientX - startX, window.innerWidth - 150));
      const newY = Math.max(0, Math.min(moveEvent.clientY - startY, window.innerHeight - 80));
      setWin11WindowPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setWin11IsDraggingOrResizing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleWindowResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: 'r' | 'b' | 'br' | 'l' | 't' | 'bl' | 'tr' | 'tl') => {
    if (win11IsMaximized) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    setWin11IsDraggingOrResizing(true);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startWidth = win11SizeRef.current.width;
    const startHeight = win11SizeRef.current.height;
    const startPosX = win11PosRef.current.x;
    const startPosY = win11PosRef.current.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      if (direction.includes('r')) newWidth = Math.max(500, startWidth + deltaX);
      if (direction.includes('b')) newHeight = Math.max(360, startHeight + deltaY);
      if (direction.includes('l')) {
        newWidth = Math.max(500, startWidth - deltaX);
        newPosX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('t')) {
        newHeight = Math.max(360, startHeight - deltaY);
        newPosY = startPosY + (startHeight - newHeight);
      }

      setWin11WindowSize({ width: newWidth, height: newHeight });
      setWin11WindowPos({ x: newPosX, y: newPosY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setWin11IsDraggingOrResizing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- SNAP LAYOUTS (Ancoragem Rápida) ---
  const applySnapLayout = (layoutType: 'left-50' | 'right-50' | 'left-65' | 'right-35' | 'quad-tl' | 'quad-tr' | 'quad-bl' | 'quad-br') => {
    setWin11IsMaximized(false);
    setWin11IsMinimized(false);
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 48; // altura menos a taskbar

    switch (layoutType) {
      case 'left-50':
        setWin11WindowPos({ x: 8, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: screenH - 16 });
        break;
      case 'right-50':
        setWin11WindowPos({ x: Math.floor(screenW * 0.5) + 4, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: screenH - 16 });
        break;
      case 'left-65':
        setWin11WindowPos({ x: 8, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.65) - 12, height: screenH - 16 });
        break;
      case 'right-35':
        setWin11WindowPos({ x: Math.floor(screenW * 0.65) + 4, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.35) - 12, height: screenH - 16 });
        break;
      case 'quad-tl':
        setWin11WindowPos({ x: 8, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: Math.floor(screenH * 0.5) - 12 });
        break;
      case 'quad-tr':
        setWin11WindowPos({ x: Math.floor(screenW * 0.5) + 4, y: 8 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: Math.floor(screenH * 0.5) - 12 });
        break;
      case 'quad-bl':
        setWin11WindowPos({ x: 8, y: Math.floor(screenH * 0.5) + 4 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: Math.floor(screenH * 0.5) - 12 });
        break;
      case 'quad-br':
        setWin11WindowPos({ x: Math.floor(screenW * 0.5) + 4, y: Math.floor(screenH * 0.5) + 4 });
        setWin11WindowSize({ width: Math.floor(screenW * 0.5) - 12, height: Math.floor(screenH * 0.5) - 12 });
        break;
    }

    setSnapFlyoutOpen(false);
    if (soundEnabled) win11Audio.playSnap();
  };

  // Módulos fixados no Menu Iniciar
  const pinnedStartModules = useMemo(() => {
    return ALL_AVAILABLE_MODULES.filter(m => pinnedStartIds.includes(m.id) && isModuleAllowed(m.id));
  }, [ALL_AVAILABLE_MODULES, pinnedStartIds, isModuleAllowed]);

  // Módulos na Barra de Tarefas
  const taskbarModules = useMemo(() => {
    const pinned = ALL_AVAILABLE_MODULES.filter(m => pinnedTaskbarIds.includes(m.id) && isModuleAllowed(m.id));
    // Se o módulo atual aberto não estiver nos fixados, inclui na barra para visualização de app em execução
    if (view && !pinnedTaskbarIds.includes(view)) {
      const activeMeta = ALL_AVAILABLE_MODULES.find(m => m.id === view);
      if (activeMeta && isModuleAllowed(view)) {
        pinned.push(activeMeta);
      }
    }
    return pinned;
  }, [ALL_AVAILABLE_MODULES, pinnedTaskbarIds, view, isModuleAllowed]);

  // Papel de parede ativo
  const activeWallpaper = WIN11_WALLPAPERS.find(w => w.id === activeWallpaperId) || WIN11_WALLPAPERS[0];

  return (
    <div 
      className={`fixed inset-0 select-none overflow-hidden font-sans ${
        nightLight ? 'sepia-[0.25]' : ''
      }`}
      style={{ filter: `brightness(${brightnessLevel}%)` }}
    >
      {/* --- PAPEL DE PAREDE OFICIAL DO WINDOWS 11 --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {activeWallpaper.type === 'gradient_dark' ? (
          <div className="absolute inset-0 bg-[#070b19]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e3a8a_0%,#09122c_55%,#030712_100%)] opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#3b82f6_0%,transparent_50%)] opacity-30 blur-2xl" />
          </div>
        ) : activeWallpaper.type === 'gradient_light' ? (
          <div className="absolute inset-0 bg-[#e8eef8]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#bdd4f8_0%,#d8e4f5_50%,#eef2f8_100%)] opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#60a5fa_0%,transparent_50%)] opacity-20 blur-2xl" />
          </div>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${activeWallpaper.img})` }}
          >
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />
          </div>
        )}
      </div>

      {/* --- ÁREA DE TRABALHO (DESKTOP) --- */}
      <div 
        id="win11-desktop-area"
        onMouseDown={handleDesktopMouseDown}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const modId = e.dataTransfer.getData('text/plain');
          if (modId) {
            addShortcutToDesktopAt(modId, e.clientX, e.clientY);
          }
        }}
        onContextMenu={(e) => {
          if ((e.target as HTMLElement).closest('#win11-window, #win11-taskbar, #win11-start-menu, #win11-quick-settings, #win11-calendar-center, #win11-widgets-panel, .win11-desktop-shortcut')) {
            return;
          }
          e.preventDefault();
          setItemContextMenu(null);
          setDesktopContextMenu({ x: e.clientX, y: e.clientY });
        }}
        className="absolute inset-0 z-10 overflow-hidden"
      >
        {/* --- CAIXA DE SELEÇÃO ELÁSTICA (RUBBER-BAND) --- */}
        {selectionBox && (
          <div
            className="absolute z-20 pointer-events-none bg-sky-500/20 border border-sky-400/80 rounded-xs backdrop-blur-[0.5px]"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`
            }}
          />
        )}

        {/* --- ATALHOS NA ÁREA DE TRABALHO (DESKTOP) --- */}
        {userShortcuts.map((s) => {
          const meta = ALL_AVAILABLE_MODULES.find(m => m.id === s.id);
          const ShortcutIcon = meta?.icon || Folder;
          const isDragging = draggingShortcutId === s.id;
          const isSelected = selectedShortcutId === s.id;
          const curPos = isDragging && activeDragPos ? activeDragPos : { x: s.x, y: s.y };

          const sizeClasses = desktopIconSize === 'small' 
            ? 'w-20 p-1.5' 
            : desktopIconSize === 'large' 
              ? 'w-28 p-3' 
              : 'w-24 p-2';

          const iconPixelSize = desktopIconSize === 'small' ? 26 : desktopIconSize === 'large' ? 40 : 32;

          return (
            <div
              key={s.id}
              style={{
                left: `${curPos.x}%`,
                top: `${curPos.y}%`,
                touchAction: 'none'
              }}
              onDoubleClick={() => {
                setView(s.id);
                setWin11IsMinimized(false);
                if (soundEnabled) win11Audio.playClick();
              }}
              onMouseDown={(e) => handleShortcutMouseDown(e, s.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDesktopContextMenu(null);
                setItemContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  moduleId: s.id,
                  type: 'desktop'
                });
              }}
              className={`win11-desktop-shortcut absolute z-20 group flex flex-col items-center text-center cursor-default rounded-xl transition-all select-none ${sizeClasses} ${
                isSelected 
                  ? 'bg-[#0078d4]/25 border border-[#0078d4]/70 shadow-md backdrop-blur-xs' 
                  : isLight
                    ? 'border border-transparent hover:bg-white/40 hover:border-white/60'
                    : 'border border-transparent hover:bg-white/15 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-150 relative">
                <ShortcutIcon size={iconPixelSize} className={`${meta?.color || 'text-sky-500'} drop-shadow-md`} />
              </div>
              
              {/* Legenda do ícone */}
              <div className={`mt-0.5 px-1 py-0.5 text-[11px] font-medium leading-tight line-clamp-2 w-full text-center tracking-tight transition-all ${
                isSelected
                  ? 'bg-[#0078d4] text-white shadow-md rounded-md'
                  : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]'
              }`}>
                {s.label}
              </div>

              {/* Botão de remoção rápida no hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDesktopShortcut(s.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                title="Remover atalho"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* --- JANELA PRINCIPAL DO GIPP (FLUENT WINDOW COM SNAP LAYOUTS) --- */}
      {view && !win11IsMinimized && (
        <div
          id="win11-window"
          style={
            win11IsMaximized 
              ? {
                  position: 'absolute',
                  inset: '8px 8px 56px 8px',
                  width: 'auto',
                  height: 'auto',
                  zIndex: 25
                }
              : {
                  position: 'absolute',
                  left: `${win11WindowPos.x}px`,
                  top: `${win11WindowPos.y}px`,
                  width: `${win11WindowSize.width}px`,
                  height: `${win11WindowSize.height}px`,
                  zIndex: 25,
                  transition: win11IsDraggingOrResizing ? 'none' : 'all 0.18s cubic-bezier(0.1, 0.9, 0.2, 1)'
                }
          }
          className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl border backdrop-blur-3xl transition-shadow ${
            isLight 
              ? 'bg-white/92 border-slate-200/80 shadow-slate-400/30 text-slate-800' 
              : 'bg-[#1e1e24]/90 border-white/15 shadow-black/80 text-white'
          }`}
        >
          {/* BARRA DE TÍTULO FLUENT (MICA HEADER) */}
          <div
            onMouseDown={handleWindowDragStart}
            onDoubleClick={() => setWin11IsMaximized(!win11IsMaximized)}
            className={`h-10 px-3.5 flex items-center justify-between shrink-0 border-b select-none transition-colors ${
              isLight 
                ? 'bg-slate-50/80 border-slate-200/60 text-slate-800' 
                : 'bg-[#181820]/90 border-white/10 text-white'
            }`}
          >
            {/* Ícone e Nome do Módulo */}
            <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
              {mMeta?.icon ? (
                <mMeta.icon size={16} className={mMeta.color || 'text-sky-500'} />
              ) : (
                <Folder size={16} className="text-sky-500" />
              )}
              <span className="text-xs font-bold tracking-tight truncate">
                {mMeta?.label || 'Módulo GIPP'}
              </span>
              <span className="text-[10px] opacity-50 hidden sm:inline">
                — {db?.igreja?.nome || 'Sistema Eclesiástico'}
              </span>
            </div>

            {/* BOTÕES DE CONTROLE DA JANELA (MIN, MAX/SNAP, FECHAR) */}
            <div className="flex items-center h-full -mr-3.5">
              {/* Minimizar */}
              <button
                onClick={() => {
                  setWin11IsMinimized(true);
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`w-11 h-full flex items-center justify-center transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-200/70 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                }`}
                title="Minimizar"
              >
                <Minus size={14} />
              </button>

              {/* Maximizar / Snap Layouts */}
              <div 
                className="relative h-full"
                onMouseEnter={() => {
                  if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
                  setSnapFlyoutOpen(true);
                }}
                onMouseLeave={() => {
                  snapTimerRef.current = setTimeout(() => {
                    setSnapFlyoutOpen(false);
                  }, 300);
                }}
              >
                <button
                  onClick={() => {
                    setWin11IsMaximized(!win11IsMaximized);
                    if (soundEnabled) win11Audio.playSnap();
                  }}
                  className={`w-11 h-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-200/70 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                  }`}
                  title={win11IsMaximized ? "Restaurar" : "Maximizar"}
                >
                  {win11IsMaximized ? <RestoreOutlineIcon size={11} /> : <SquareOutlineIcon size={11} />}
                </button>

                {/* --- FLYOUT DE SNAP LAYOUTS DO WINDOWS 11 --- */}
                {snapFlyoutOpen && (
                  <div 
                    className={`absolute right-0 top-full mt-1 w-64 p-2.5 rounded-2xl shadow-2xl border backdrop-blur-3xl z-50 animate-in fade-in zoom-in-95 duration-100 ${
                      isLight 
                        ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/40' 
                        : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-60 mb-2 px-1">Ancoragem de Janelas (Snap)</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Layout 1: 50/50 */}
                      <div className="border border-slate-500/20 rounded-xl p-1 flex gap-1 h-14 bg-black/5 dark:bg-white/5">
                        <button
                          onClick={() => applySnapLayout('left-50')}
                          className="flex-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/60 border border-sky-400/40 transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold"
                          title="Ancorar à Esquerda (50%)"
                        >
                          Esq
                        </button>
                        <button
                          onClick={() => applySnapLayout('right-50')}
                          className="flex-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/60 border border-sky-400/40 transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold"
                          title="Ancorar à Direita (50%)"
                        >
                          Dir
                        </button>
                      </div>

                      {/* Layout 2: 65/35 */}
                      <div className="border border-slate-500/20 rounded-xl p-1 flex gap-1 h-14 bg-black/5 dark:bg-white/5">
                        <button
                          onClick={() => applySnapLayout('left-65')}
                          className="w-[65%] rounded-lg bg-indigo-500/20 hover:bg-indigo-500/60 border border-indigo-400/40 transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold"
                          title="Largo (65%)"
                        >
                          65%
                        </button>
                        <button
                          onClick={() => applySnapLayout('right-35')}
                          className="w-[35%] rounded-lg bg-indigo-500/20 hover:bg-indigo-500/60 border border-indigo-400/40 transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold"
                          title="Estreito (35%)"
                        >
                          35%
                        </button>
                      </div>

                      {/* Layout 3: 4 Quadrantes */}
                      <div className="border border-slate-500/20 rounded-xl p-1 grid grid-cols-2 gap-1 h-14 bg-black/5 dark:bg-white/5 col-span-2">
                        <button
                          onClick={() => applySnapLayout('quad-tl')}
                          className="rounded-md bg-purple-500/20 hover:bg-purple-500/60 border border-purple-400/40 text-[8px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          ↖ Topo-Esq
                        </button>
                        <button
                          onClick={() => applySnapLayout('quad-tr')}
                          className="rounded-md bg-purple-500/20 hover:bg-purple-500/60 border border-purple-400/40 text-[8px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          Topo-Dir ↗
                        </button>
                        <button
                          onClick={() => applySnapLayout('quad-bl')}
                          className="rounded-md bg-purple-500/20 hover:bg-purple-500/60 border border-purple-400/40 text-[8px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          ↙ Base-Esq
                        </button>
                        <button
                          onClick={() => applySnapLayout('quad-br')}
                          className="rounded-md bg-purple-500/20 hover:bg-purple-500/60 border border-purple-400/40 text-[8px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          Base-Dir ↘
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fechar Janela */}
              <button
                onClick={() => {
                  setView('');
                  if (soundEnabled) win11Audio.playClick();
                }}
                className="w-11 h-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer text-slate-400"
                title="Fechar (Alt+F4)"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* CORPO DO MÓDULO GIPP */}
          <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-transparent">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full p-8 text-center text-xs opacity-60">
                Carregando módulo com Fluent Design...
              </div>
            }>
              <CurrentModule {...currentProps} />
            </Suspense>
          </div>

          {/* BORDAS DE REDIMENSIONAMENTO (QUANDO NÃO MAXIMIZADO) */}
          {!win11IsMaximized && (
            <>
              <div 
                onMouseDown={(e) => handleWindowResizeStart(e, 'r')} 
                className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-30" 
              />
              <div 
                onMouseDown={(e) => handleWindowResizeStart(e, 'b')} 
                className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize z-30" 
              />
              <div 
                onMouseDown={(e) => handleWindowResizeStart(e, 'br')} 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30" 
              />
              <div 
                onMouseDown={(e) => handleWindowResizeStart(e, 'l')} 
                className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-30" 
              />
              <div 
                onMouseDown={(e) => handleWindowResizeStart(e, 't')} 
                className="absolute top-0 left-0 right-0 h-2 cursor-n-resize z-30" 
              />
            </>
          )}
        </div>
      )}

      {/* --- VISÃO DE TAREFAS (TASK VIEW / DESKTOPS VIRTUAIS) --- */}
      {taskViewOpen && (
        <div className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl space-y-6">
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <Monitor size={20} className="text-sky-400" />
                <h2 className="text-base font-black">Visão de Tarefas (Desktops Virtuais)</h2>
              </div>
              <button 
                onClick={() => setTaskViewOpen(false)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
              >
                Fechar (Esc)
              </button>
            </div>

            {/* Lista de Janelas Abertas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {view ? (
                <div 
                  onClick={() => {
                    setWin11IsMinimized(false);
                    setTaskViewOpen(false);
                  }}
                  className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer group flex flex-col justify-between h-40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{mMeta?.label || view}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setView('');
                      }}
                      className="p-1 rounded-full hover:bg-rose-500 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="text-[10px] text-sky-400 font-medium">Janela em Execução</div>
                </div>
              ) : (
                <div className="col-span-full text-center py-10 text-white/50 text-xs">
                  Nenhuma janela de módulo aberta no momento.
                </div>
              )}
            </div>

            {/* Desktops Virtuais */}
            <div className="pt-4 border-t border-white/15 flex items-center gap-3">
              {[1, 2, 3].map(dt => (
                <button
                  key={dt}
                  onClick={() => {
                    setActiveVirtualDesktop(dt);
                    if (soundEnabled) win11Audio.playClick();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeVirtualDesktop === dt
                      ? 'bg-sky-500 text-white shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                >
                  Área de Trabalho {dt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MENU INICIAR OFICIAL DO WINDOWS 11 (START MENU) --- */}
      {win11LauncherOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setWin11LauncherOpen(false)} 
          />
          <div 
            id="win11-start-menu"
            className={`fixed bottom-14 z-50 w-[95vw] sm:w-[580px] max-h-[82vh] rounded-2xl shadow-2xl border flex flex-col backdrop-blur-3xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-150 select-none ${
              taskbarAlignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-4'
            } ${
              isLight 
                ? 'bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-400/40' 
                : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
            }`}
          >
            {/* Campo de Pesquisa Fluente */}
            <div className="p-4 pb-2 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={win11Search}
                  onChange={(e) => setWin11Search(e.target.value)}
                  placeholder="Pesquise aplicativos, configurações e arquivos..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-100/80 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                      : 'bg-white/5 border-white/10 focus:bg-white/10 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30'
                  }`}
                  autoFocus
                />
                {win11Search && (
                  <button 
                    onClick={() => setWin11Search('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Cabeçalho da Seção (Fixados / Todos) */}
            <div className="px-5 py-2 flex items-center justify-between shrink-0">
              <span className="text-xs font-black tracking-tight">
                {win11ActiveTab === 'pinned' && !win11Search ? 'Aplicativos Fixados' : 'Todos os Aplicativos'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewShortcutModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Adicionar ou gerenciar atalhos"
                >
                  <Plus size={12} />
                  <span>Gerenciar Atalhos</span>
                </button>
                {!win11Search && (
                  <button
                    onClick={() => {
                      setWin11ActiveTab(win11ActiveTab === 'pinned' ? 'all' : 'pinned');
                      if (soundEnabled) win11Audio.playClick();
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-slate-500/15 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{win11ActiveTab === 'pinned' ? 'Todos os apps' : 'Voltar aos fixados'}</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Grade de Aplicativos Fixados ou Lista Alfabética */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar max-h-[380px]">
              {win11ActiveTab === 'pinned' && !win11Search ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {pinnedStartModules.map((m) => {
                    const IconComp = m.icon || Folder;
                    const isShortcut = userShortcuts.some(s => s.id === m.id);

                    return (
                      <div
                        key={m.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', m.id);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setItemContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            moduleId: m.id,
                            type: 'start'
                          });
                        }}
                        onClick={() => {
                          setView(m.id);
                          setWin11LauncherOpen(false);
                          setWin11IsMinimized(false);
                          if (soundEnabled) win11Audio.playClick();
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all cursor-pointer group text-center relative ${
                          isLight ? 'hover:bg-slate-100/90' : 'hover:bg-white/10'
                        }`}
                        title={`${m.label} (Arraste para o Desktop ou clique com botão direito)`}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                          <IconComp size={24} className={m.color || 'text-sky-500'} />
                        </div>
                        <span className="text-[11px] font-medium leading-tight line-clamp-2 w-full truncate">
                          {m.label}
                        </span>

                        {/* Botão rápido para Desktop no hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDesktopShortcut(m.id);
                          }}
                          className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                            isShortcut ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
                          }`}
                          title={isShortcut ? "Remover do Desktop" : "Adicionar ao Desktop"}
                        >
                          {isShortcut ? '✕' : '+'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Lista Completa de Aplicativos */
                <div className="space-y-4">
                  {Object.entries(
                    ALL_AVAILABLE_MODULES
                      .filter(m => {
                        if (!isModuleAllowed(m.id)) return false;
                        if (win11Search) {
                          return (
                            m.label?.toLowerCase().includes(win11Search.toLowerCase()) ||
                            m.category?.toLowerCase().includes(win11Search.toLowerCase()) ||
                            m.id?.toLowerCase().includes(win11Search.toLowerCase())
                          );
                        }
                        return true;
                      })
                      .reduce((acc: any, m) => {
                        const letter = (m.label?.[0] || 'A').toUpperCase();
                        if (!acc[letter]) acc[letter] = [];
                        acc[letter].push(m);
                        return acc;
                      }, {})
                  ).map(([letter, modules]: [string, any]) => (
                    <div key={letter}>
                      <div className="text-[10px] font-black text-sky-500 px-2 mb-1">{letter}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {modules.map((m: any) => {
                          const IconComp = m.icon || Folder;
                          return (
                            <button
                              key={m.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', m.id);
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setItemContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  moduleId: m.id,
                                  type: 'start'
                                });
                              }}
                              onClick={() => {
                                setView(m.id);
                                setWin11LauncherOpen(false);
                                setWin11IsMinimized(false);
                                if (soundEnabled) win11Audio.playClick();
                              }}
                              className={`flex items-center gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                              }`}
                            >
                              <IconComp size={20} className={m.color || 'text-sky-500'} />
                              <div className="truncate">
                                <div className="text-xs font-bold leading-tight truncate">{m.label}</div>
                                <div className="text-[9px] opacity-60">{m.category}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção Recomendados / Acesso Rápido */}
            <div className={`p-4 border-t ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-black/20'}`}>
              <div className="text-[11px] font-bold opacity-75 mb-2">Recomendados para Você</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setView('manual');
                    setWin11LauncherOpen(false);
                    if (soundEnabled) win11Audio.playClick();
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isLight ? 'hover:bg-white' : 'hover:bg-white/10'
                  }`}
                >
                  <BookOpen size={16} className="text-sky-500 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold">Manual Geral do GIPP</div>
                    <div className="text-[9px] opacity-60">Instruções de Uso</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setView('config_visual');
                    setWin11LauncherOpen(false);
                    if (soundEnabled) win11Audio.playClick();
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isLight ? 'hover:bg-white' : 'hover:bg-white/10'
                  }`}
                >
                  <Sparkles size={16} className="text-purple-500 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold">Temas & Aparência</div>
                    <div className="text-[9px] opacity-60">Personalizar Sistema</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Rodapé do Menu Iniciar (Perfil do Usuário & Energia) */}
            <div className={`p-3.5 px-4 flex items-center justify-between border-t ${
              isLight ? 'border-slate-200 bg-slate-100/90' : 'border-white/10 bg-black/40'
            }`}>
              {/* Usuário */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                  {user?.nome?.[0] || 'U'}
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold">{user?.nome || 'Usuário'}</div>
                  <div className="text-[10px] opacity-60">{user?.cargo || user?.role || 'Membro GIPP'}</div>
                </div>
              </div>

              {/* Botão de Energia / Logout */}
              <div className="relative">
                <button
                  onClick={() => setPowerMenuOpen(!powerMenuOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Opções de Energia"
                >
                  <LogOut size={16} />
                </button>

                {/* Flyout de Energia */}
                {powerMenuOpen && (
                  <div className={`absolute right-0 bottom-full mb-2 w-44 rounded-2xl shadow-2xl border p-1.5 backdrop-blur-3xl z-50 animate-in fade-in duration-100 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#202028] border-white/15 text-white'
                  }`}>
                    <button
                      onClick={() => {
                        setIsScreenLocked(true);
                        setPowerMenuOpen(false);
                        setWin11LauncherOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 cursor-pointer text-left"
                    >
                      <Lock size={14} className="text-amber-400" />
                      <span>Bloquear Sessão</span>
                    </button>
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 cursor-pointer text-left"
                    >
                      <RefreshCw size={14} className="text-emerald-400" />
                      <span>Reiniciar Sistema</span>
                    </button>
                    <div className="my-1 border-t border-slate-500/20" />
                    <button
                      onClick={() => {
                        handleLogoutRequest();
                        setPowerMenuOpen(false);
                        setWin11LauncherOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-500/15 text-rose-500 cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Desligar / Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- PAINEL DE WIDGETS DO WINDOWS 11 (WIDGETS FLYOUT) --- */}
      {widgetsOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setWidgetsOpen(false)} 
          />
          <div 
            id="win11-widgets-panel"
            className={`fixed bottom-14 left-4 z-50 w-[95vw] sm:w-[460px] max-h-[82vh] rounded-2xl shadow-2xl border p-5 flex flex-col gap-4 backdrop-blur-3xl overflow-y-auto animate-in slide-in-from-left-5 fade-in duration-150 select-none custom-scrollbar ${
              isLight 
                ? 'bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-400/40' 
                : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
            }`}
          >
            {/* Header Widgets */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-sky-500" />
                <h3 className="text-sm font-black tracking-tight">Widgets do Windows 11</h3>
              </div>
              <span className="text-[10px] opacity-60">Atualizado agora</span>
            </div>

            {/* Widget de Clima Completo */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-indigo-600/20 border border-sky-500/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-black">{win11Weather.city}</div>
                  <div className="text-[10px] opacity-60">{win11Weather.state}</div>
                </div>
                <CloudSun size={28} className="text-amber-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black">{win11Weather.temp}°C</span>
                <span className="text-xs opacity-70">Sensação {win11Weather.apparentTemp}°C</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] opacity-80">
                <div className="flex items-center gap-1.5">
                  <Cloud size={12} />
                  <span>Umidade: {win11Weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} />
                  <span>Vento: {win11Weather.windspeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Widget de Versículo Bíblico do Dia */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black">
                <BookOpen size={14} />
                <span>Versículo Inspirador do Dia</span>
              </div>
              <p className="text-xs italic leading-relaxed opacity-90">
                "O Senhor é a minha luz e a minha salvação; de quem terei temor? O Senhor é o refúgio da minha vida; a quem temerei?"
              </p>
              <div className="text-[10px] font-bold text-indigo-400 text-right">Salmos 27:1</div>
            </div>

            {/* Widget de Agenda & Próximos Cultos */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-purple-400 text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Próximos Compromissos Eclesiásticos</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="font-bold">Culto de Celebração & Família</span>
                  <span className="text-[10px] opacity-60">Domingo 19h</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-black/10 dark:bg-white/5">
                  <span className="font-bold">Escola Bíblica Dominical (EBD)</span>
                  <span className="text-[10px] opacity-60">Domingo 09h</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- CENTRAL DE CONTROLES RÁPIDOS (QUICK SETTINGS - WIN+A) --- */}
      {quickSettingsOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setQuickSettingsOpen(false)} 
          />
          <div 
            id="win11-quick-settings"
            className={`fixed bottom-14 right-4 z-50 w-[95vw] sm:w-[380px] rounded-2xl shadow-2xl border p-5 flex flex-col gap-4 backdrop-blur-3xl animate-in slide-in-from-bottom-5 fade-in duration-150 select-none ${
              isLight 
                ? 'bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-400/40' 
                : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
            }`}
          >
            {/* Grid de 6 Toggles Oficiais */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Wi-Fi */}
              <button
                onClick={() => {
                  setWifiEnabled(!wifiEnabled);
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  wifiEnabled 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'
                }`}
              >
                {wifiEnabled ? <Wifi size={18} /> : <WifiOff size={18} />}
                <span className="text-[10px] font-bold">Wi-Fi</span>
              </button>

              {/* Modo Escuro / Claro */}
              <button
                onClick={() => {
                  setTheme(isLight ? 'dark' : 'light');
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isLight 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {!isLight ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-[10px] font-bold">{isLight ? 'Claro' : 'Escuro'}</span>
              </button>

              {/* Luz Noturna */}
              <button
                onClick={() => {
                  setNightLight(!nightLight);
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  nightLight 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'
                }`}
              >
                <Eye size={18} />
                <span className="text-[10px] font-bold">Luz Noturna</span>
              </button>

              {/* Foco / Não Incomodar */}
              <button
                onClick={() => {
                  setFocusMode(!focusMode);
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  focusMode 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'
                }`}
              >
                {focusMode ? <BellOff size={18} /> : <Bell size={18} />}
                <span className="text-[10px] font-bold">Foco</span>
              </button>

              {/* Sons do Sistema */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  soundEnabled 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'
                }`}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span className="text-[10px] font-bold">Sons</span>
              </button>

              {/* Alinhamento da Taskbar */}
              <button
                onClick={() => {
                  const next = taskbarAlignment === 'center' ? 'left' : 'center';
                  setTaskbarAlignment(next);
                  localStorage.setItem('gipp_win11_taskbar_align', next);
                  if (soundEnabled) win11Audio.playClick();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white'
                }`}
              >
                <Layers size={18} />
                <span className="text-[10px] font-bold">{taskbarAlignment === 'center' ? 'Central' : 'À Esquerda'}</span>
              </button>
            </div>

            {/* Sliders de Brilho e Volume */}
            <div className="space-y-3 pt-2 border-t border-slate-500/20">
              {/* Brilho */}
              <div className="flex items-center gap-3">
                <Sun size={16} className="text-amber-400 shrink-0" />
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={brightnessLevel}
                  onChange={(e) => setBrightnessLevel(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 rounded-lg bg-slate-500/30 cursor-pointer"
                />
                <span className="text-[10px] font-bold w-7 text-right">{brightnessLevel}%</span>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-sky-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  onChange={(e) => setVolumeLevel(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 rounded-lg bg-slate-500/30 cursor-pointer"
                />
                <span className="text-[10px] font-bold w-7 text-right">{volumeLevel}%</span>
              </div>
            </div>

            {/* Rodapé Quick Settings (Bateria & Configurações) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-500/20 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <BatteryCharging size={16} className="text-emerald-400" />
                <span>100% (Conectado à Energia)</span>
              </div>
              <button
                onClick={() => {
                  setView('config_visual');
                  setQuickSettingsOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Abrir Todas as Configurações"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- CENTRAL DE NOTIFICAÇÕES & CALENDÁRIO (WIN+N) --- */}
      {calendarCenterOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setCalendarCenterOpen(false)} 
          />
          <div 
            id="win11-calendar-center"
            className={`fixed bottom-14 right-4 z-50 w-[95vw] sm:w-[380px] max-h-[82vh] rounded-2xl shadow-2xl border p-5 flex flex-col gap-4 backdrop-blur-3xl overflow-y-auto animate-in slide-in-from-bottom-5 fade-in duration-150 select-none custom-scrollbar ${
              isLight 
                ? 'bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-400/40' 
                : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
            }`}
          >
            {/* Header Calendário */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
              <div>
                <div className="text-lg font-black">{currentTime}</div>
                <div className="text-xs opacity-70 font-medium">{currentDate}</div>
              </div>
              <CalendarIcon size={20} className="text-sky-500" />
            </div>

            {/* Calendário Mensal */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span>{calendarSelectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCalendarSelectedDate(new Date(calendarSelectedDate.getFullYear(), calendarSelectedDate.getMonth() - 1, 1))}
                    className="p-1 rounded-lg hover:bg-slate-500/20"
                  >
                    <ArrowLeft size={12} />
                  </button>
                  <button 
                    onClick={() => setCalendarSelectedDate(new Date(calendarSelectedDate.getFullYear(), calendarSelectedDate.getMonth() + 1, 1))}
                    className="p-1 rounded-lg hover:bg-slate-500/20"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Grid dos Dias */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <span key={i} className="font-bold opacity-50 py-1">{d}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const isToday = day === new Date().getDate() && calendarSelectedDate.getMonth() === new Date().getMonth();
                  return (
                    <button
                      key={day}
                      className={`h-7 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isToday 
                          ? 'bg-sky-500 text-white shadow-md scale-105' 
                          : isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Temporizador de Foco / Pomodoro */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-400">
                  <Clock size={14} />
                  <span>Sessão de Foco (Pomodoro)</span>
                </div>
                <span className="text-sm font-black font-mono">
                  {String(focusMinutes).padStart(2, '0')}:{String(focusSeconds).padStart(2, '0')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFocusTimerRunning(!focusTimerRunning);
                    if (soundEnabled) win11Audio.playClick();
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    focusTimerRunning ? 'bg-rose-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                  }`}
                >
                  {focusTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                  <span>{focusTimerRunning ? 'Pausar' : 'Iniciar Foco (25 min)'}</span>
                </button>
                <button
                  onClick={() => {
                    setFocusTimerRunning(false);
                    setFocusMinutes(25);
                    setFocusSeconds(0);
                  }}
                  className="p-2 rounded-xl bg-slate-500/20 hover:bg-slate-500/30"
                  title="Reiniciar Timer"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- MENU DE CONTEXTO DO DESKTOP & ITENS (CLIQUE DIREITO FLUENT) --- */}
      <Win11ContextMenu
        desktopMenu={desktopContextMenu}
        itemMenu={itemContextMenu}
        onClose={() => {
          setDesktopContextMenu(null);
          setItemContextMenu(null);
        }}
        isLight={isLight}
        allModules={ALL_AVAILABLE_MODULES}
        desktopShortcuts={userShortcuts}
        pinnedStartIds={pinnedStartIds}
        pinnedTaskbarIds={pinnedTaskbarIds}
        currentView={view}
        desktopIconSize={desktopIconSize}
        setDesktopIconSize={setDesktopIconSize}
        onAutoArrange={autoArrangeWin11Shortcuts}
        onOpenNewShortcutModal={() => setNewShortcutModalOpen(true)}
        onOpenWallpaperModal={() => setWallpaperModalOpen(true)}
        onOpenProperties={() => setWin11PropertiesOpen(true)}
        onOpenVisualConfig={() => setView('config_visual')}
        onOpenModule={(moduleId) => {
          setView(moduleId);
          setWin11IsMinimized(false);
          if (soundEnabled) win11Audio.playClick();
        }}
        onCloseModule={() => {
          setView('');
          if (soundEnabled) win11Audio.playClick();
        }}
        onToggleDesktopShortcut={toggleDesktopShortcut}
        onTogglePinStart={togglePinStart}
        onTogglePinTaskbar={togglePinTaskbar}
      />

      {/* --- MODAL DE GERENCIAMENTO DE ATALHOS --- */}
      <Win11NewShortcutModal
        isOpen={newShortcutModalOpen}
        onClose={() => setNewShortcutModalOpen(false)}
        isLight={isLight}
        allModules={ALL_AVAILABLE_MODULES}
        isModuleAllowed={isModuleAllowed}
        desktopShortcuts={userShortcuts}
        pinnedStartIds={pinnedStartIds}
        pinnedTaskbarIds={pinnedTaskbarIds}
        onToggleDesktopShortcut={toggleDesktopShortcut}
        onTogglePinStart={togglePinStart}
        onTogglePinTaskbar={togglePinTaskbar}
      />

      {/* --- MODAL DE ESCOLHA DE PAPEL DE PAREDE DO WIN11 --- */}
      {wallpaperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#202028] border-white/15 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-500/20">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <h3 className="text-sm font-black">Personalizar Papel de Parede (Windows 11)</h3>
              </div>
              <button onClick={() => setWallpaperModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-500/20 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {WIN11_WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setActiveWallpaperId(wp.id);
                    localStorage.setItem('gipp_win11_wallpaper', wp.id);
                    if (soundEnabled) win11Audio.playClick();
                  }}
                  className={`relative h-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left p-2 flex flex-col justify-end ${
                    activeWallpaperId === wp.id ? 'border-sky-500 shadow-lg scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`absolute inset-0 ${wp.preview}`} />
                  <div className="relative z-10 text-white font-bold text-xs drop-shadow-md">
                    {wp.name}
                  </div>
                  {activeWallpaperId === wp.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setWallpaperModalOpen(false)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE PROPRIEDADES DO SISTEMA GIPP --- */}
      {win11PropertiesOpen && (
        <Win11PropertiesModal
          isOpen={win11PropertiesOpen}
          onClose={() => setWin11PropertiesOpen(false)}
          setView={setView}
        />
      )}

      {/* --- BARRA DE TAREFAS OFICIAL DO WINDOWS 11 (FLUENT TASKBAR) --- */}
      <div 
        id="win11-taskbar"
        className={`fixed bottom-0 inset-x-0 h-12 z-40 px-3 flex items-center justify-between select-none border-t backdrop-blur-2xl transition-all ${
          isLight 
            ? 'bg-slate-100/85 border-slate-300/80 shadow-md' 
            : 'bg-[#181820]/85 border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* WIDGET DO CLIMA NO CANTO ESQUERDO */}
        <div className="flex items-center">
          <button
            onClick={() => {
              setWidgetsOpen(!widgetsOpen);
              setWin11LauncherOpen(false);
              setQuickSettingsOpen(false);
              setCalendarCenterOpen(false);
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              widgetsOpen 
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400' 
                : isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
            title="Widgets & Clima (Win+W)"
          >
            <CloudSun size={18} className="text-amber-400 shrink-0 animate-pulse" />
            <div className="text-left leading-none hidden sm:block">
              <span className="block text-[10px] opacity-70 font-medium">{win11Weather.city}</span>
              <span className="text-[11px] font-bold">{win11Weather.temp}°C</span>
            </div>
          </button>
        </div>

        {/* ÍCONES CENTRAIS DA TASKBAR (WINDOWS 11 STYLE) */}
        <div className={`flex items-center gap-1 transition-all ${
          taskbarAlignment === 'center' ? 'absolute left-1/2 -translate-x-1/2' : 'ml-3'
        }`}>
          {/* Botão Iniciar (Win11 Logo) */}
          <button
            onClick={() => {
              setWin11LauncherOpen(!win11LauncherOpen);
              setWidgetsOpen(false);
              setQuickSettingsOpen(false);
              setCalendarCenterOpen(false);
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
              win11LauncherOpen 
                ? 'bg-sky-500/20 shadow-inner' 
                : isLight ? 'hover:bg-black/5 active:scale-95' : 'hover:bg-white/10 active:scale-95'
            }`}
            title="Iniciar (Win)"
          >
            <Win11Logo size={18} />
          </button>

          {/* Botão de Busca Fluente */}
          <button
            onClick={() => {
              setWin11LauncherOpen(true);
              setWin11ActiveTab('all');
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
              isLight ? 'hover:bg-black/5 active:scale-95' : 'hover:bg-white/10 active:scale-95'
            }`}
            title="Pesquisar (Win+S)"
          >
            <Search size={18} className="text-sky-500" />
          </button>

          {/* Botão Visão de Tarefas (Task View) */}
          <button
            onClick={() => {
              setTaskViewOpen(!taskViewOpen);
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
              taskViewOpen 
                ? 'bg-sky-500/20 shadow-inner text-sky-400' 
                : isLight ? 'hover:bg-black/5 active:scale-95' : 'hover:bg-white/10 active:scale-95'
            }`}
            title="Visão de Tarefas (Win+Tab)"
          >
            <Monitor size={18} className="text-indigo-400" />
          </button>

          {/* Divisor sutil */}
          <div className="w-[1px] h-5 bg-slate-500/20 mx-1" />

          {/* Ícones de Aplicativos na Taskbar (Fixados + Executando) */}
          {taskbarModules.map(m => {
            const IconComp = m.icon || Folder;
            const isOpen = view === m.id;
            const isMinimized = isOpen && win11IsMinimized;

            return (
              <button
                key={m.id}
                onClick={() => {
                  if (isOpen) {
                    setWin11IsMinimized(!win11IsMinimized);
                  } else {
                    setView(m.id);
                    setWin11IsMinimized(false);
                  }
                  if (soundEnabled) win11Audio.playClick();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setItemContextMenu({
                    x: e.clientX,
                    y: e.clientY - 120,
                    moduleId: m.id,
                    type: 'taskbar'
                  });
                }}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer group ${
                  isOpen && !isMinimized
                    ? 'bg-sky-500/20 text-sky-400 shadow-sm' 
                    : isLight ? 'hover:bg-black/5 active:scale-95' : 'hover:bg-white/10 active:scale-95'
                }`}
                title={`${m.label} (Clique com botão direito para opções)`}
              >
                <IconComp size={20} className={m.color || 'text-sky-500'} />
                
                {/* Linha indicadora de app ativo do Win 11 */}
                {isOpen && (
                  <div className={`absolute bottom-1 h-1 rounded-full transition-all ${
                    isMinimized ? 'w-1.5 bg-slate-400' : 'w-4 bg-sky-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* SYSTEM TRAY & ACTION CENTER NO CANTO DIREITO */}
        <div className="flex items-center gap-1.5">
          {/* Grupo de Controles Rápidos (Wi-Fi, Som, Bateria) */}
          <button
            onClick={() => {
              setQuickSettingsOpen(!quickSettingsOpen);
              setCalendarCenterOpen(false);
              setWin11LauncherOpen(false);
              setWidgetsOpen(false);
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              quickSettingsOpen 
                ? 'bg-sky-500/20 border border-sky-500/40' 
                : isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
            title="Configurações Rápidas (Win+A)"
          >
            {wifiEnabled ? <Wifi size={14} className="text-sky-400" /> : <WifiOff size={14} className="text-rose-400" />}
            {soundEnabled ? <Volume2 size={14} className="text-slate-400" /> : <VolumeX size={14} className="text-rose-400" />}
            <Battery size={14} className="text-emerald-400" />
          </button>

          {/* Relógio e Notificações (Data/Hora) */}
          <button
            onClick={() => {
              setCalendarCenterOpen(!calendarCenterOpen);
              setQuickSettingsOpen(false);
              setWin11LauncherOpen(false);
              setWidgetsOpen(false);
              if (soundEnabled) win11Audio.playClick();
            }}
            className={`flex flex-col items-end px-2.5 py-1 rounded-xl transition-all cursor-pointer leading-tight ${
              calendarCenterOpen 
                ? 'bg-sky-500/20 border border-sky-500/40' 
                : isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
            title="Calendário e Notificações (Win+N)"
          >
            <span className="text-[11px] font-bold">{currentTime || '12:00'}</span>
            <span className="text-[9px] opacity-70 font-medium">{currentDate || '01/01/2026'}</span>
          </button>

          {/* Botão Mostrar Área de Trabalho (Aero Peek) */}
          <button
            onClick={() => {
              setWin11IsMinimized(!win11IsMinimized);
              if (soundEnabled) win11Audio.playClick();
            }}
            className="w-1.5 h-8 ml-1 rounded-xs border-l border-slate-500/30 hover:bg-sky-500/40 transition-colors cursor-pointer"
            title="Mostrar Área de Trabalho"
          />
        </div>
      </div>
    </div>
  );
};
