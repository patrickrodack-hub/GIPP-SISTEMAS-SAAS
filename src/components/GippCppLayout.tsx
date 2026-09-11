import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, FileText, CheckSquare, DollarSign, Calculator, Package, 
  ShoppingBag, FileSpreadsheet, QrCode, ArrowLeftRight, Truck, Database, 
  Boxes, Key, Code, Search, X, Minus, Maximize2, Minimize2, 
  Folder, Calendar, Users, Settings, LogOut, HelpCircle, RefreshCw, 
  Plus, Trash2, Shield, HardDrive, Terminal, Palette, Layers, 
  Check, ChevronRight, LayoutDashboard, Sliders, Sparkles, BookOpen,
  GraduationCap, Building2, UserCheck, Heart, AlertCircle, Save,
  Lock, Award, Car, Share2, Briefcase, Music, Video, Baby, Globe,
  ArrowUpCircle, ArrowDownCircle, Activity, FileCheck, CreditCard,
  Newspaper, Book, Mail, ClipboardList, IdCard, ImagePlus, Gamepad2,
  MessageCircle, ShieldCheck, History, Info
} from 'lucide-react';
import { requestAppFullscreen } from '../lib/performanceHelpers';
import { isDeveloperUser } from '../constants/systemDivisions';

interface GippCppLayoutProps {
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
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// 3D Embossed Silver Metallic Logo matching the classic desktop wall
const GippCpp3DWallLogo: React.FC<{ churchName?: string; onOpenModule?: (id: string) => void }> = ({
  churchName
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-auto p-4 max-w-5xl mx-auto">
      {/* 3D Wall Logo Composition */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Left Stylized 3D Sculpted Metallic Shield / S Emblem */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 shrink-0 filter drop-shadow-[14px_22px_26px_rgba(0,0,0,0.65)] drop-shadow-[2px_3px_5px_rgba(0,0,0,0.5)]">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            <defs>
              {/* Metallic Silver 3D Gradient for outer body */}
              <linearGradient id="chromeOuter" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="18%" stopColor="#e6e8eb" />
                <stop offset="42%" stopColor="#b5bac2" />
                <stop offset="68%" stopColor="#8d949e" />
                <stop offset="85%" stopColor="#cfd4dc" />
                <stop offset="100%" stopColor="#6e747e" />
              </linearGradient>

              {/* Glossy Bevel Inner Highlight */}
              <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#d2d7df" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#7a828d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
              </linearGradient>

              {/* Drop Shadow for cutout depth */}
              <filter id="cutoutShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="6" dy="10" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.75" />
                </feComponentTransfer>
                <feMerge> 
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Back Cast Shadow Shape */}
            <path
              d="M 40 30 C 95 10 165 25 170 85 C 172 110 155 130 130 145 C 105 160 85 165 60 180 L 30 180 C 15 135 20 80 40 30 Z"
              fill="#000000"
              opacity="0.35"
              transform="translate(10, 16)"
            />

            {/* Outer Sculpted Metallic "S" / Church Curved Emblem (matches reference shape exactly) */}
            <path
              d="M 50 32 C 105 15 165 30 168 85 C 170 115 140 135 110 145 C 80 155 60 162 45 178 L 28 178 C 18 128 20 75 50 32 Z"
              fill="url(#chromeOuter)"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Inner Curvature & Specular Highlight Channel */}
            <path
              d="M 52 42 C 95 30 148 42 152 82 C 154 104 132 120 102 130 C 72 140 54 148 38 165 C 32 120 32 80 52 42 Z"
              fill="url(#chromeBevel)"
              opacity="0.9"
            />

            {/* Top Gloss Reflection Flare */}
            <path
              d="M 56 38 C 90 28 135 36 155 68 C 125 50 85 52 56 68 Z"
              fill="#ffffff"
              opacity="0.85"
            />

            {/* Inset Core Geometric Accent */}
            <rect
              x="62"
              y="74"
              width="26"
              height="44"
              rx="4"
              fill="#8d949e"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Right 3D Embossed Metallic Typography: "GIPP" and "Sistemas Eclesiásticos" */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left select-none">
          {/* Main 3D Chrome Text: GIPP */}
          <div className="relative">
            {/* Dark cast shadow layer (cast to bottom right like on a real office wall) */}
            <span 
              className="absolute left-3 top-4 sm:left-4 sm:top-5 md:left-5 md:top-6 text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tight uppercase text-black/60 blur-[3px] select-none pointer-events-none"
              aria-hidden="true"
            >
              GIPP.
            </span>
            <span 
              className="absolute left-1.5 top-2 sm:left-2 sm:top-2.5 md:left-3 md:top-3 text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tight uppercase text-black/80 select-none pointer-events-none"
              aria-hidden="true"
            >
              GIPP.
            </span>

            {/* 3D Embossed Chrome Lettering */}
            <h1 className="relative text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tight uppercase font-sans leading-none">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-b from-[#ffffff] via-[#dcdfe4] to-[#7f8895] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
                style={{
                  WebkitTextStroke: '1px #ffffff',
                  textShadow: '0 1px 0 #fff, 0 2px 0 #e5e8ed, 0 3px 0 #ccd2db, 0 4px 0 #b3bac5, 0 5px 0 #9ca4b1, 0 6px 0 #858e9c, 0 7px 8px rgba(0,0,0,0.6)'
                }}
              >
                GIPP.
              </span>
            </h1>
          </div>

          {/* Subtitle: "SISTEMAS" in matching 3D silver relief */}
          <div className="relative mt-1 sm:mt-2 md:mt-3">
            {/* Shadow layer */}
            <span 
              className="absolute left-1.5 top-2 sm:left-2 sm:top-2.5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-normal text-black/60 blur-[2px] select-none pointer-events-none"
              aria-hidden="true"
            >
              SISTEMAS
            </span>

            {/* Embossed Text */}
            <h2 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-normal font-sans leading-none">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-b from-[#ffffff] via-[#d8dce2] to-[#788290]"
                style={{
                  WebkitTextStroke: '0.6px #ffffff',
                  textShadow: '0 1px 0 #ffffff, 0 2px 0 #ccd2db, 0 3px 4px rgba(0,0,0,0.5)'
                }}
              >
                SISTEMAS
              </span>
            </h2>
          </div>

          {/* Sub-label for Church Name or System Tag */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#4a5568] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              {churchName || 'Sistema Eclesiástico Integrado'} • GIPP.® SISTEMAS Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Pop-up Calculator for the toolbar
const MiniCalculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNum = (num: string) => {
    if (display === '0' || resetNext) {
      setDisplay(num);
      setResetNext(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (operator: string) => {
    setPrev(parseFloat(display));
    setOp(operator);
    setResetNext(true);
  };

  const handleEqual = () => {
    if (prev !== null && op) {
      const current = parseFloat(display);
      let res = 0;
      if (op === '+') res = prev + current;
      if (op === '-') res = prev - current;
      if (op === '*') res = prev * current;
      if (op === '/') res = current !== 0 ? prev / current : 0;
      setDisplay(String(res));
      setPrev(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
  };

  return (
    <div className="absolute top-16 left-32 z-[9999] w-56 bg-[#f0f0f0] border-2 border-[#0078d7] shadow-2xl rounded-xs select-none">
      {/* Title */}
      <div className="bg-[#0078d7] text-white px-2 py-1 text-xs font-bold flex items-center justify-between">
        <span className="flex items-center gap-1.5"><Calculator size={12} /> Calculadora C++</span>
        <button onClick={onClose} className="hover:bg-red-600 px-1.5 text-xs font-bold">✕</button>
      </div>
      {/* Display */}
      <div className="p-2">
        <div className="bg-white border border-[#7f9db9] p-2 text-right font-mono text-lg font-bold text-slate-800 shadow-inner overflow-x-auto">
          {display}
        </div>
        {/* Buttons */}
        <div className="grid grid-cols-4 gap-1 mt-2 text-xs font-bold">
          <button onClick={handleClear} className="p-1.5 bg-[#e1e1e1] hover:bg-white border border-[#adadad]">C</button>
          <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-1.5 bg-[#e1e1e1] hover:bg-white border border-[#adadad]">±</button>
          <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="p-1.5 bg-[#e1e1e1] hover:bg-white border border-[#adadad]">%</button>
          <button onClick={() => handleOp('/')} className="p-1.5 bg-[#d6d6d6] hover:bg-white border border-[#adadad]">÷</button>

          <button onClick={() => handleNum('7')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">7</button>
          <button onClick={() => handleNum('8')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">8</button>
          <button onClick={() => handleNum('9')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">9</button>
          <button onClick={() => handleOp('*')} className="p-1.5 bg-[#d6d6d6] hover:bg-white border border-[#adadad]">×</button>

          <button onClick={() => handleNum('4')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">4</button>
          <button onClick={() => handleNum('5')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">5</button>
          <button onClick={() => handleNum('6')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">6</button>
          <button onClick={() => handleOp('-')} className="p-1.5 bg-[#d6d6d6] hover:bg-white border border-[#adadad]">-</button>

          <button onClick={() => handleNum('1')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">1</button>
          <button onClick={() => handleNum('2')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">2</button>
          <button onClick={() => handleNum('3')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">3</button>
          <button onClick={() => handleOp('+')} className="p-1.5 bg-[#d6d6d6] hover:bg-white border border-[#adadad]">+</button>

          <button onClick={() => handleNum('0')} className="col-span-2 p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">0</button>
          <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="p-1.5 bg-white hover:bg-[#e8e8e8] border border-[#adadad]">.</button>
          <button onClick={handleEqual} className="p-1.5 bg-[#0078d7] text-white hover:bg-[#0063b1] border border-[#005a9e]">=</button>
        </div>
      </div>
    </div>
  );
};

export const GippCppLayout: React.FC<GippCppLayoutProps> = ({
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
  addToast
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const menuBarRef = useRef<HTMLDivElement>(null);

  // Clock update (formatted as 09/09/2026 as in screenshot)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setCurrentDate(`${dd}/${mm}/${yyyy}`);
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Win32 keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        if (e.key === 'Escape') {
          setActiveDropdown(null);
          setSearchOpen(false);
          setShowCalculator(false);
        }
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setView('fin_entrada');
        addToast?.('Módulo Dízimos & Ofertas [F2]', 'info');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setView('fin_saida');
        addToast?.('Módulo Despesas & Saídas [F3]', 'info');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setView('cad_membro');
        addToast?.('Módulo Cadastro de Membros [F4]', 'info');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setView('cad_patrimonio');
        addToast?.('Módulo Patrimônio & Estoque [F5]', 'info');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setView('cad_membro');
        addToast?.('Consulta de Membros [F7]', 'info');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setView('relatorios');
        addToast?.('Central de Relatórios [F8]', 'info');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setIsWindowMaximized(prev => !prev);
      } else if (e.key === 'Escape') {
        setActiveDropdown(null);
        setSearchOpen(false);
        setShowCalculator(false);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsScreenLocked(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setView('cad_membro');
        addToast?.('Novo cadastro de membro', 'info');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setView('biblia');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setView('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setView, setIsScreenLocked, addToast]);

  // Reset minimized/maximized state when switching views
  useEffect(() => {
    setIsWindowMinimized(false);
  }, [view]);

  // System developer identification check
  const isDeveloper = isDeveloperUser(user);

  // Menu structure organized by official module divisions:
  // "Início", "Administrativo", "Financeiro", "Secretaria", "Ministérios", "Ensino", "Mídia & Artes", "Google Workspace", "Pastoral & IA", "Sistema", "Desenvolvedor" (dev only), "Janelas", "Ajuda"
  const menus = [
    {
      id: 'inicio',
      label: 'Início',
      items: [
        { header: 'Visão Geral & Início' },
        { label: 'Área de Trabalho (Desktop 3D)', shortcut: 'Ctrl+D', icon: LayoutDashboard, action: () => setView('dashboard') },
        { label: 'Painel Pastoral Executivo', icon: Users, action: () => setView('portal_pastor') },
        { label: 'Boletim Digital & Mural', icon: Newspaper, action: () => setView('boletim') },
        { label: 'Bíblia Sagrada de Estudo', shortcut: 'Ctrl+B', icon: Book, action: () => setView('biblia') },
        { label: 'Pastoral IA (Inteligência Artificial)', icon: Sparkles, action: () => setView('assistente_ai') },
        { separator: true },
        { header: 'Sessão & Segurança' },
        { label: 'Salvar / Sincronizar Registros', shortcut: 'Ctrl+S', icon: Save, action: () => addToast?.('Todos os dados foram sincronizados com sucesso!', 'success') },
        { label: 'Bloquear Terminal', shortcut: 'Ctrl+L', icon: Lock, action: () => setIsScreenLocked(true) },
        { label: 'Sair do GIPP.® SISTEMAS', shortcut: 'Alt+F4', icon: LogOut, action: handleLogoutRequest }
      ]
    },
    {
      id: 'administrativo',
      label: 'Administrativo',
      items: [
        { header: 'Pessoas & Famílias' },
        { label: 'Membros da Igreja & Acessos', shortcut: 'F4', icon: Users, action: () => setView('cad_membro') },
        { label: 'Visitantes, CRM & Acolhimento', icon: UserCheck, action: () => setView('visitantes') },
        { label: 'Células & Grupos Familiares', icon: Share2, action: () => setView('cad_celula') },
        { label: 'Ministério da Família & Casais', icon: Heart, action: () => setView('ministerio_familia') },
        { separator: true },
        { header: 'Patrimônio & Estrutura' },
        { label: 'Patrimônio & Inventário', shortcut: 'F5', icon: Package, action: () => setView('cad_patrimonio') },
        { label: 'Controle de Frotas & Veículos', icon: Car, action: () => setView('controle_frotas') },
        { label: 'Igreja Sede & Congregações', icon: Building2, action: () => setView('cad_igreja') },
        { label: 'Usuários & Permissões do Sistema', icon: Key, action: () => setView('cad_usuario') }
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      items: [
        { header: 'Receitas & Entradas' },
        { label: 'Lançamento de Dízimos & Ofertas', shortcut: 'F2', icon: ArrowUpCircle, action: () => setView('fin_entrada') },
        { label: 'Doações Especiais & Campanhas', icon: DollarSign, action: () => setView('fin_entrada') },
        { label: 'Carnês de Contribuição & Campanhas', icon: CreditCard, action: () => setView('fin_carnes') },
        { separator: true },
        { header: 'Despesas & Contabilidade' },
        { label: 'Lançamento de Despesas & Saídas', shortcut: 'F3', icon: ArrowDownCircle, action: () => setView('fin_saida') },
        { label: 'DRE - Demonstrativo de Resultados', icon: Activity, action: () => setView('fin_dre') },
        { label: 'Conciliação Bancária & Tarifas', icon: FileCheck, action: () => setView('fin_conciliacao') },
        { label: 'Plano de Contas & Utilitários', icon: Settings, action: () => setView('fin_utilitarios') },
        { label: 'Recursos Humanos / RH (Folha & DP)', icon: Users, action: () => setView('dp_contabilidade') }
      ]
    },
    {
      id: 'secretaria',
      label: 'Secretaria',
      items: [
        { header: 'Documentos Eclesiásticos' },
        { label: 'Secretaria Integrada & Membresia', icon: ClipboardList, action: () => setView('secretaria_integrada') },
        { label: 'Livro Oficial de Atas da Igreja', icon: BookOpen, action: () => setView('secretaria_livro_atas') },
        { label: 'Certificados de Batismo e Apresentação', icon: Award, action: () => setView('secretaria_certificados') },
        { separator: true },
        { header: 'Comunicação & Relatórios' },
        { label: 'Central Geral de Relatórios', shortcut: 'F8', icon: Printer, action: () => setView('relatorios') },
        { label: 'Informativo & Boletim Litúrgico', icon: Newspaper, action: () => setView('boletim') },
        { label: 'Webmail & Mensagens Internas', icon: Mail, action: () => setView('email_interno') },
        { label: 'Bíblia de Estudo & Doutrinas', icon: Book, action: () => setView('biblia') }
      ]
    },
    {
      id: 'ministerios',
      label: 'Ministérios',
      items: [
        { header: 'Departamentos & Cuidado' },
        { label: 'Departamentos & Lideranças', icon: Briefcase, action: () => setView('cad_departamento') },
        { label: 'Ministério de Louvor & Coral', icon: Music, action: () => setView('ministerio_louvor') },
        { label: 'Ministério de Mídia & Comunicação', icon: Video, action: () => setView('ministerio_midia') },
        { label: 'Ministério da Família & Casais', icon: Heart, action: () => setView('ministerio_familia') },
        { label: 'Salinha Kids (Ministério Infantil)', icon: Baby, action: () => setView('salinha_kids') },
        { label: 'Departamento de Missões Globais', icon: Globe, action: () => setView('missoes_painel') }
      ]
    },
    {
      id: 'ensino',
      label: 'Ensino',
      items: [
        { header: 'Educação Bíblica & Teológica' },
        { label: 'Escola Bíblica Dominical (EBD)', icon: GraduationCap, action: () => setView('secretaria_ebd') },
        { label: 'Universidade Teológica GIPP (CGADB/CPAD)', icon: BookOpen, action: () => setView('curso_teologia') },
        { label: 'Formação & Consagração de Obreiros', icon: Award, action: () => setView('formacao_obreiros') },
        { label: 'Cursos EAD & Capacitação de Líderes', icon: GraduationCap, action: () => setView('gestao_cursos') }
      ]
    },
    {
      id: 'midia',
      label: 'Mídia & Artes',
      items: [
        { header: 'Suíte de Produtividade GIPP' },
        { label: 'GIPP DOCs (Editor de Textos & Ofícios)', icon: FileText, action: () => setView('docs_editor') },
        { label: 'GIPP Planilhas (Planilhas Financeiras)', icon: FileSpreadsheet, action: () => setView('sheets_editor') },
        { label: 'Estúdio de Criação de Artes & Mídias', icon: ImagePlus, action: () => setView('rede_social') },
        { separator: true },
        { header: 'Comunicação & Identificação' },
        { label: 'Estúdio de Carteirinhas Eclesiásticas', icon: IdCard, action: () => setView('carteirinha_studio') },
        { label: 'Impressão de Credenciais em Lote', icon: Award, action: () => setView('credencial_lote') },
        { label: 'Terminal de Check-in & QR Code', icon: QrCode, action: () => setView('qr_checkin') },
        { label: 'Disparador WhatsApp em Lote', icon: MessageCircle, action: () => setView('mensagens_lote') },
        { label: 'Central Interativa & Gamificação', icon: Gamepad2, action: () => setView('interativo') }
      ]
    },
    {
      id: 'google',
      label: 'Google Workspace',
      items: [
        { header: 'Google Workspace Integrado' },
        { label: 'Google Meet (Videoconferências)', icon: Video, action: () => setView('google_meet') },
        { label: 'Google Sheets (Planilhas Google)', icon: FileSpreadsheet, action: () => setView('google_sheets') },
        { label: 'Google Docs (Documentos Google)', icon: FileText, action: () => setView('google_docs') },
        { label: 'Google Tasks (Tarefas & Prazos)', icon: CheckSquare, action: () => setView('google_tasks') },
        { label: 'Google Calendar (Agenda Eclesiástica)', icon: Calendar, action: () => setView('google_calendar') },
        { label: 'Gmail Eclesiástico Oficial', icon: Mail, action: () => setView('gmail_oficial') },
        { label: 'Google Forms (Formulários & Pesquisas)', icon: ClipboardList, action: () => setView('google_forms') },
        { label: 'Google Classroom (Salas de Aula)', icon: GraduationCap, action: () => setView('google_classroom') }
      ]
    },
    {
      id: 'pastoral',
      label: 'Pastoral & IA',
      items: [
        { header: 'Gabinete Pastoral & IA' },
        { label: 'Painel Pastoral Executivo', icon: Users, action: () => setView('portal_pastor') },
        { label: 'Pastoral IA (Assistente Ministerial)', icon: Sparkles, action: () => setView('assistente_ai') }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      items: [
        { header: 'Configuração & Governança' },
        { label: 'Configurações Gerais do Sistema', icon: Settings, action: () => setView('config_sistema') },
        { label: 'Personalização Visual & Temas', icon: Palette, action: () => setView('config_visual') },
        { label: 'Dados da Igreja Sede & Logotipo', icon: Building2, action: () => setView('cad_igreja') },
        { separator: true },
        { header: 'Segurança & Legislação' },
        { label: 'Backup Geral & Restauração da Base', icon: Database, action: () => setView('config_backup') },
        { label: 'Auditoria de Usuários & Segurança', icon: ShieldCheck, action: () => setView('auditoria') },
        { label: 'Lixeira Virtual de Registros', icon: Trash2, action: () => setView('lixeira') },
        { label: 'Amparo Legal & Estatuto da Igreja', icon: Shield, action: () => setView('amparo_legal') },
        { label: 'Registro de Software & Direitos', icon: Award, action: () => setView('registro_software') },
        { label: 'Suporte Técnico Especializado GIPP', icon: HelpCircle, action: () => setView('suporte_dev') }
      ]
    },
    ...(isDeveloper ? [{
      id: 'desenvolvedor',
      label: 'Desenvolvedor',
      items: [
        { header: 'Engenharia C++ & Painel Master SaaS' },
        { label: 'Painel Master do Desenvolvedor (C++)', shortcut: 'Ctrl+Shift+D', icon: Code, action: () => setView('desenvolvedor') },
        { label: 'Central de Suporte do Desenvolvedor', icon: HelpCircle, action: () => setView('suporte_dev') },
        { label: 'Marketing, Licenciamento & Divulgação', icon: Award, action: () => setView('marketing_social') }
      ]
    }] : []),
    {
      id: 'janelas',
      label: 'Janelas',
      items: [
        { header: 'Gerenciamento de Janelas (MDI)' },
        { label: 'Maximizar Janela Atual', shortcut: 'F10', icon: Maximize2, action: () => { setIsWindowMaximized(true); setIsWindowMinimized(false); } },
        { label: 'Restaurar em Janela Flutuante', icon: Minimize2, action: () => { setIsWindowMaximized(false); setIsWindowMinimized(false); } },
        { label: 'Minimizar para a Barra', icon: Minus, action: () => setIsWindowMinimized(true) },
        { separator: true },
        { label: 'Fechar Janela Atual', shortcut: 'Ctrl+W', icon: X, action: () => setView('dashboard') },
        { label: 'Exibir Área de Trabalho (Logo 3D)', shortcut: 'Ctrl+D', icon: LayoutDashboard, action: () => setView('dashboard') }
      ]
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      items: [
        { header: 'Documentação & Ensino' },
        { label: 'Manual do Usuário GIPP C++ (Guia)', icon: HelpCircle, action: () => setView('manual') },
        { label: 'Declaração de Fé CGADB / CPAD', icon: BookOpen, action: () => setView('curso_teologia') },
        { label: 'Formação & Consagração de Obreiros', icon: Award, action: () => setView('formacao_obreiros') },
        { label: 'Bíblia Sagrada de Consulta', icon: Book, action: () => setView('biblia') },
        { separator: true },
        { header: 'Versão & Exibição' },
        { label: 'Histórico de Atualizações (Changelog)', icon: History, action: () => setView('changelog') },
        { label: 'Sobre o GIPP.® SISTEMAS', icon: Info, action: () => setView('sobre') },
        { label: 'Modo Tela Cheia', shortcut: 'F11', icon: Maximize2, action: requestAppFullscreen }
      ]
    }
  ];

  // Quick search filter for modules
  const filteredModules = ALL_AVAILABLE_MODULES.filter(m => 
    isModuleAllowed(m.id) && 
    (m.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isHomeView = view === 'dashboard';

  return (
    <div className="h-screen w-full flex flex-col font-sans select-none overflow-hidden bg-[#e0e0e0] text-slate-900">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP WINDOW TITLE BAR (Windows/MFC C++ Blue Bar)             */}
      {/* ------------------------------------------------------------- */}
      <div className="h-8 bg-gradient-to-r from-[#005a9e] via-[#0078d7] to-[#0063b1] text-white flex items-center justify-between px-2 shrink-0 border-b border-[#004578] shadow-xs">
        {/* Left: GIPP Official Icon + Window Title */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Official GIPP Emblem */}
          <div className="h-5 px-1.5 bg-gradient-to-r from-[#0a192f] via-[#0c2e59] to-[#004e8c] rounded-xs flex items-center justify-center gap-0.5 shadow-xs shrink-0 border border-white/40 select-none">
            <span className="text-white font-black text-[10px] leading-none font-sans tracking-tight">GIPP</span>
            <span className="text-[#38bdf8] text-[9px] font-black leading-none">.</span>
            <span className="text-[7px] text-white/90 font-bold leading-none ml-0.5">®</span>
          </div>
          
          <span className="text-xs font-bold tracking-wide truncate drop-shadow-xs">
            {isHomeView 
              ? 'GIPP.® SISTEMAS' 
              : `GIPP.® SISTEMAS - [${mMeta.label}]`}
          </span>
        </div>

        {/* Right: Windows standard minimize, maximize, close buttons */}
        <div className="flex items-center h-full shrink-0">
          <button
            type="button"
            onClick={() => setIsWindowMinimized(!isWindowMinimized)}
            className="h-full px-3 hover:bg-[#0063b1] text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Minimizar"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          
          <button
            type="button"
            onClick={() => setIsWindowMaximized(!isWindowMaximized)}
            className="h-full px-3 hover:bg-[#0063b1] text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isWindowMaximized ? "Restaurar" : "Maximizar"}
          >
            {isWindowMaximized ? (
              <span className="text-xs font-bold leading-none select-none">🗗</span>
            ) : (
              <span className="text-xs font-bold leading-none select-none">🗖</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isHomeView) setView('dashboard');
              else handleLogoutRequest();
            }}
            className="h-full px-3.5 hover:bg-[#e81123] text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MENU BAR (Win32 Standard Classic Menu Bar)                 */}
      {/* ------------------------------------------------------------- */}
      <div 
        ref={menuBarRef}
        className="min-h-6 bg-[#f0f0f0] border-b border-[#d8d8d8] flex items-center flex-wrap px-1 text-xs shrink-0 relative z-[999] text-slate-800 select-none overflow-visible"
      >
        {menus.map((m, menuIdx) => {
          const isOpen = activeDropdown === m.id;
          const alignRight = menuIdx >= menus.length - 4;
          return (
            <div key={m.id} className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(isOpen ? null : m.id);
                }}
                onMouseEnter={() => {
                  if (activeDropdown) setActiveDropdown(m.id);
                }}
                className={`px-2 py-0.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isOpen 
                    ? 'bg-[#0078d7] text-white' 
                    : 'hover:bg-[#0078d7] hover:text-white text-[#004b91]'
                }`}
              >
                {m.label}
              </button>

              {/* Dropdown Menu with Sections & Division Headers */}
              {isOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full mt-0.5 min-w-[280px] max-w-[340px] bg-white border border-[#adadad] shadow-2xl py-1 z-[9999] text-slate-800 text-xs max-h-[80vh] overflow-y-auto`}
                >
                  {m.items.map((item: any, idx: number) => {
                    if (item.header) {
                      return (
                        <div key={idx} className="px-3 py-1 bg-[#f1f3f7] border-y border-[#dce0e6] text-[10px] font-extrabold uppercase tracking-wider text-[#005a9e] flex items-center justify-between mt-1.5 first:mt-0 select-none">
                          <span>{item.header}</span>
                        </div>
                      );
                    }
                    if (item.separator) {
                      return <div key={idx} className="h-[1px] bg-[#e5e5e5] my-1" />;
                    }
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(null);
                          item.action?.();
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-[#0078d7] hover:text-white flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {Icon ? (
                            <Icon size={14} className="text-[#0078d7] group-hover:text-white shrink-0" />
                          ) : (
                            <span className="w-3.5" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-[10px] text-slate-400 group-hover:text-white font-mono shrink-0 ml-3">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. TOOLBAR STRIP (Row of Win32 16x16 / 20x20 Enterprise Icons) */}
      {/* ------------------------------------------------------------- */}
      <div className="h-9 bg-[#f7f7f7] border-b border-[#d8d8d8] flex items-center justify-between px-2 shrink-0 shadow-xs select-none">
        
        {/* Left: Toolbar button strip */}
        <div className="flex items-center gap-0.5">
          {/* Subtle 3D handle divider */}
          <div className="flex flex-col gap-0.5 px-1 mr-1 border-r border-[#d4d4d4] py-1 cursor-grab">
            <span className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
            <span className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
            <span className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
          </div>

          {/* 1. Impressora (Relatórios) */}
          <button
            type="button"
            onClick={() => setView('relatorios')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Central Geral de Relatórios [F8]"
          >
            <Printer size={16} className="text-[#333333]" />
          </button>

          {/* 2. Formulário / Nova Ficha (Membros) */}
          <button
            type="button"
            onClick={() => setView('cad_membro')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Cadastro de Membros [F4]"
          >
            <FileText size={16} className="text-[#0078d7]" />
          </button>

          {/* 3. Edição / Checklist (Secretaria Integrada) */}
          <button
            type="button"
            onClick={() => setView('secretaria_integrada')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Secretaria Geral & Cartas"
          >
            <CheckSquare size={16} className="text-emerald-600" />
          </button>

          {/* 4. Saco de Dinheiro (Dízimos & Ofertas) */}
          <button
            type="button"
            onClick={() => setView('fin_entrada')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Dízimos & Ofertas [F2]"
          >
            <DollarSign size={16} className="text-amber-600 font-bold" />
          </button>

          {/* 5. Calculadora Financeira */}
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className={`p-1.5 rounded-xs border transition-all cursor-pointer ${
              showCalculator 
                ? 'bg-[#0078d7] text-white border-[#005a9e]' 
                : 'hover:bg-[#e5e5e5] active:bg-[#d0d0d0] border-transparent hover:border-[#adadad] text-slate-700'
            }`}
            title="Calculadora Financeira"
          >
            <Calculator size={16} className={showCalculator ? 'text-white' : 'text-purple-600'} />
          </button>

          {/* Vertical Toolbar Separator */}
          <div className="h-5 w-[1px] bg-[#d4d4d4] mx-1" />

          {/* 6. Caixa de Papelão (Patrimônio) */}
          <button
            type="button"
            onClick={() => setView('cad_patrimonio')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Patrimônio & Bens [F5]"
          >
            <Package size={16} className="text-[#a05a2c]" />
          </button>

          {/* 7. Vendas / Despesas Financeiras */}
          <button
            type="button"
            onClick={() => setView('fin_saida')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Despesas & Saídas [F3]"
          >
            <ShoppingBag size={16} className="text-emerald-700" />
          </button>

          {/* 8. Nota Fiscal / Recibo Pastoral */}
          <button
            type="button"
            onClick={() => setView('docs_editor')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="GIPP DOCs (Documentos Oficiais)"
          >
            <FileSpreadsheet size={16} className="text-red-600" />
          </button>

          {/* 9. Código de Barras / Carnê */}
          <button
            type="button"
            onClick={() => setView('fin_carnes')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Carnês de Contribuição"
          >
            <QrCode size={16} className="text-slate-800" />
          </button>

          {/* 10. Transferências & Conciliação */}
          <button
            type="button"
            onClick={() => setView('fin_conciliacao')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Conciliação Bancária & Transferências"
          >
            <ArrowLeftRight size={16} className="text-cyan-600" />
          </button>

          {/* 11. Caminhão / Logística e Frotas */}
          <button
            type="button"
            onClick={() => setView('controle_frotas')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Controle de Frotas & Veículos"
          >
            <Truck size={16} className="text-blue-600" />
          </button>

          {/* Vertical Toolbar Separator */}
          <div className="h-5 w-[1px] bg-[#d4d4d4] mx-1" />

          {/* 12. Banco de Dados / Backup */}
          <button
            type="button"
            onClick={() => setView('config_backup')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Backup Geral & Restauração"
          >
            <Database size={16} className="text-[#0078d7]" />
          </button>

          {/* 13. Caixas / Palete */}
          <button
            type="button"
            onClick={() => setView('cad_patrimonio')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Inventário de Bens do Templo"
          >
            <Boxes size={16} className="text-amber-700" />
          </button>

          {/* 14. Segurança & Usuários */}
          <button
            type="button"
            onClick={() => setView('cad_usuario')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Usuários & Permissões do Sistema"
          >
            <Key size={16} className="text-yellow-600" />
          </button>

          {/* 15. Auditoria & Logs */}
          <button
            type="button"
            onClick={() => setView('auditoria')}
            className="p-1.5 hover:bg-[#e5e5e5] active:bg-[#d0d0d0] rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 transition-all cursor-pointer"
            title="Auditoria & Histórico de Operações"
          >
            <Code size={16} className="text-rose-600" />
          </button>
        </div>

        {/* Right: Quick Search Magnifying Glass Input (as shown in screenshot) */}
        <div className="relative flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="h-6 w-32 sm:w-48 pl-2 pr-7 text-xs bg-white border border-[#adadad] rounded-xs shadow-inner focus:outline-hidden focus:border-[#0078d7] focus:w-60 transition-all"
            />
            <Search 
              size={13} 
              className="absolute right-2 top-1.5 text-slate-500 pointer-events-none" 
            />
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#adadad] shadow-2xl rounded-xs py-1 z-50 max-h-60 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Módulos e Recursos ({filteredModules.length})
                </div>
                {filteredModules.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">Nenhum resultado</div>
                ) : (
                  filteredModules.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setView(m.id);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-[#0078d7] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-bold">{m.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{m.id}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN WORKSPACE CANVAS (Studio Metallic Wall & MDI Area)    */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4"
        style={{
          backgroundColor: '#8a8f96',
          backgroundImage: `
            radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.45) 0%, rgba(220,225,230,0.2) 35%, rgba(110,118,128,0.5) 75%, rgba(60,65,72,0.85) 100%),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 2px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 2px)
          `,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)'
        }}
      >
        {/* Ambient Top Light Beam Effect */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pop-up Calculator */}
        {showCalculator && <MiniCalculator onClose={() => setShowCalculator(false)} />}

        {/* IF ON DASHBOARD OR MINIMIZED: SHOW THE 3D EMBOSSED WALL LOGO */}
        {(isHomeView || isWindowMinimized) && (
          <div className="w-full h-full flex items-center justify-center">
            <GippCpp3DWallLogo 
              churchName={db?.igreja?.nome} 
            />
          </div>
        )}

        {/* IF A MODULE IS OPEN AND NOT MINIMIZED: RENDER MDI CHILD WINDOW */}
        {!isHomeView && !isWindowMinimized && (
          <div 
            className={`transition-all duration-200 flex flex-col bg-white shadow-2xl border border-[#7f9db9] rounded-xs overflow-hidden z-20 ${
              isWindowMaximized 
                ? 'w-full h-full' 
                : 'w-[94%] h-[92%] max-w-6xl max-h-[85vh]'
            }`}
          >
            {/* MDI Window Title Bar */}
            <div className="h-7 bg-gradient-to-r from-[#005a9e] to-[#0078d7] text-white px-2 flex items-center justify-between shrink-0 select-none shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold truncate">
                <mMeta.icon size={14} className="shrink-0 text-white" />
                <span>{mMeta.label} - [GIPP C++ Form]</span>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setIsWindowMinimized(true)}
                  className="w-5 h-5 hover:bg-white/20 text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                  title="Minimizar Form"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsWindowMaximized(!isWindowMaximized)}
                  className="w-5 h-5 hover:bg-white/20 text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                  title={isWindowMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isWindowMaximized ? (
                    <span className="text-[10px] font-bold leading-none select-none">🗗</span>
                  ) : (
                    <span className="text-[10px] font-bold leading-none select-none">🗖</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="w-5 h-5 hover:bg-red-600 text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                  title="Fechar Form"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* MDI Sub-Toolbar with Quick Form Actions */}
            <div className="h-7 bg-[#f0f0f0] border-b border-[#d8d8d8] flex items-center justify-between px-2 text-xs shrink-0 select-none">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => addToast?.('Novo registro preparado', 'info')}
                  className="px-2 py-0.5 hover:bg-white rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <Plus size={12} className="text-emerald-600" /> Novo
                </button>
                <button 
                  onClick={() => addToast?.('Dados salvos no banco C++', 'success')}
                  className="px-2 py-0.5 hover:bg-white rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <Save size={12} className="text-[#0078d7]" /> Salvar
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-2 py-0.5 hover:bg-white rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <Printer size={12} className="text-slate-600" /> Imprimir
                </button>
                <button 
                  onClick={() => setView('dashboard')}
                  className="px-2 py-0.5 hover:bg-white rounded-xs border border-transparent hover:border-[#adadad] text-slate-700 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  <LayoutDashboard size={12} className="text-amber-600" /> Desktop
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                Módulo ID: <span className="font-bold text-slate-700">{view}</span>
              </div>
            </div>

            {/* Form Content Area */}
            <div className="flex-1 overflow-y-auto bg-white p-3 sm:p-4 custom-scrollbar">
              {CurrentModule ? (
                <CurrentModule {...currentProps} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Selecione um módulo para começar.
                </div>
              )}
            </div>

            {/* MDI Child Window Status Bar */}
            <div className="h-5 bg-[#f5f5f5] border-t border-[#d8d8d8] flex items-center justify-between px-2 text-[10px] font-mono text-slate-600 shrink-0">
              <div className="flex items-center gap-3">
                <span>Status: <strong className="text-emerald-700">Ativo</strong></span>
                <span>Modo: Leitura / Gravação</span>
              </div>
              <div className="text-slate-400">
                GIPP C++ VCL Subsystem
              </div>
            </div>
          </div>
        )}

        {/* Minimized Window Taskbar Button inside MDI Desktop */}
        {!isHomeView && isWindowMinimized && (
          <div className="absolute bottom-3 left-3 z-30">
            <button
              type="button"
              onClick={() => setIsWindowMinimized(false)}
              className="bg-[#0078d7] text-white text-xs font-bold px-3 py-1.5 rounded-xs border border-[#005a9e] shadow-lg flex items-center gap-2 hover:bg-[#0063b1] cursor-pointer transition-all"
            >
              <mMeta.icon size={13} />
              <span>{mMeta.label}</span>
              <Maximize2 size={11} className="ml-1 opacity-75" />
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. BOTTOM STATUS BAR (Exact layout from the uploaded image)    */}
      {/* ------------------------------------------------------------- */}
      <div className="h-6 bg-[#f0f0f0] border-t border-[#c0c0c0] flex items-center justify-between px-1 text-xs shrink-0 select-none text-slate-700">
        
        {/* Left Panel: Status Message */}
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <div className="px-2 py-0.5 bg-[#e0e0e0]/70 border-t border-l border-[#808080] border-b border-r border-white text-[11px] font-medium truncate flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Conectado • {db?.igreja?.nome || 'GIPP'}</span>
          </div>
        </div>

        {/* Right Inset Panels (Matching exact screenshot: Date | User | Version) */}
        <div className="flex items-center gap-1 shrink-0 text-[11px] font-sans">
          {/* Panel 1: Date (matching 09/09/2026 format) */}
          <div className="px-2.5 py-0.5 bg-[#e0e0e0]/70 border-t border-l border-[#808080] border-b border-r border-white min-w-[80px] text-center font-mono font-medium text-slate-800">
            {currentDate || '09/09/2026'}
          </div>

          {/* Panel 2: User Name (matching Patrick Pessoa in screenshot) */}
          <div className="px-3 py-0.5 bg-[#e0e0e0]/70 border-t border-l border-[#808080] border-b border-r border-white min-w-[110px] text-center font-medium text-slate-800">
            {user?.nome || 'Patrick Pessoa'}
          </div>

          {/* Panel 3: Version (Versão Original & Atual do Sistema GIPP) */}
          <div 
            className="px-2.5 py-0.5 bg-[#e0e0e0]/70 border-t border-l border-[#808080] border-b border-r border-white min-w-[70px] text-center text-slate-800 flex items-center justify-center gap-1.5 select-none"
            title="GIPP.® SISTEMAS — Versão Atual: 10.0.0 Ultimate Platinum v15 (Versão Original: 1.1.8689)"
          >
            <span className="hidden sm:inline font-bold text-[#005a9e] tracking-tight">
              {db?.igreja?.saas_versao_sistema || "Versão 10.0.0 Ultimate Platinum v15"}
            </span>
            <span className="sm:hidden font-bold text-[#005a9e]">
              v10.0.0 v15
            </span>
            <span className="text-slate-500 font-mono text-[10px] hidden md:inline font-semibold">
              • 1.1.8689
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GippCppLayout;
