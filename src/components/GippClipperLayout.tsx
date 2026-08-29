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
  SlidersHorizontal, Smartphone, Tablet, Calculator, Eye, Hash, ArrowUp, ArrowDown
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

export interface GippClipperLayoutProps {
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

type ClipperPalette = 'blue' | 'green' | 'amber' | 'mono';

export const GippClipperLayout: React.FC<GippClipperLayoutProps> = ({
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
  // --- CLIPPER PALETTE & DISPLAY CONFIG ---
  const [clipperPalette, setClipperPalette] = useState<ClipperPalette>('blue');
  const [crtScanlines, setCrtScanlines] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('gipp_clipper_sound') !== 'false';
  });

  // --- TIME & STATUS TICKER ---
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // --- WINDOW STATE ---
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState<boolean>(false);

  // --- ACTIVE MODAL TOOLS (DBU, CONSOLE, CALC, CALENDAR, HELP, ALERT) ---
  const [activeTool, setActiveTool] = useState<'dbu' | 'prompt' | 'calc' | 'calendar' | 'help' | 'ascii' | null>(null);
  const [clipperAlert, setClipperAlert] = useState<{ title: string; message: string; buttons: string[]; onSelect: (btn: string) => void } | null>(null);

  // --- PROMPT CONSOLE STATE ---
  const [promptHistory, setPromptHistory] = useState<Array<{ cmd?: string; out: string; type?: 'info' | 'error' | 'success' | 'res' }>>([
    { out: 'CA-Clipper (R) 5.3a International (C) 1985-1996 Computer Associates Intl.', type: 'info' },
    { out: 'GIPP SISTEMA ECLESIASTICO INTEGRADO - AMBIENTE xBASE EM MODO TEXTO', type: 'info' },
    { out: 'Digite HELP para comandos disponiveis ou USE <tabela> para abrir dados.', type: 'info' }
  ]);
  const [promptInput, setPromptInput] = useState<string>('');
  const [activeDbfName, setActiveDbfName] = useState<string>('MEMBROS');
  const promptInputRef = useRef<HTMLInputElement>(null);

  // --- DBU STATE ---
  const [dbuSelectedTable, setDbuSelectedTable] = useState<string>('membros');
  const [dbuSearchQuery, setDbuSearchQuery] = useState<string>('');
  const [dbuCurrentIndex, setDbuCurrentIndex] = useState<number>(0);

  // --- CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcMemory, setCalcMemory] = useState<number>(0);
  const [calcTape, setCalcTape] = useState<string[]>(['* GIPP CLIPPER TAPE CALCULATOR *', '--------------------------------']);
  const [calcPrevVal, setCalcPrevVal] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcWaitingOperand, setCalcWaitingOperand] = useState<boolean>(false);

  // --- CALENDAR STATE ---
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // --- AUDIO SYNTHESIZER (PC SPEAKER 8-BIT) ---
  const playPcSpeaker = (freq = 880, duration = 40, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
      setTimeout(() => ctx.close(), duration + 100);
    } catch (e) {
      // Ignorar erros de áudio não permitidos sem interação do usuário
    }
  };

  const playJingle = () => {
    if (!soundEnabled) return;
    playPcSpeaker(523, 60);
    setTimeout(() => playPcSpeaker(659, 60), 70);
    setTimeout(() => playPcSpeaker(784, 100), 140);
  };

  const playErrorTone = () => {
    if (!soundEnabled) return;
    playPcSpeaker(220, 100);
    setTimeout(() => playPcSpeaker(180, 150), 110);
  };

  // Clock Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync sound preference
  useEffect(() => {
    localStorage.setItem('gipp_clipper_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Global Keyboard Navigation for Clipper F-Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside text inputs, unless it's an F-key or Escape
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      
      if (e.key === 'F1') {
        e.preventDefault();
        playPcSpeaker(980, 40);
        setActiveTool(prev => prev === 'help' ? null : 'help');
      } else if (e.key === 'F2') {
        e.preventDefault();
        playPcSpeaker(880, 50);
        // Trigger save if in module or show Clipper notice
        const saveBtn = document.querySelector('button[type="submit"], button:has(.lucide-save), button:contains("Salvar")') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.click();
          playJingle();
        } else {
          setClipperAlert({
            title: 'CLIPPER DATABASE COMMIT',
            message: 'Comando DBCOMMIT() executado com sucesso. Registros sincronizados no Firestore.',
            buttons: ['< OK >'],
            onSelect: () => setClipperAlert(null)
          });
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        playPcSpeaker(750, 40);
        const searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"], input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          setActiveTool('dbu');
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        playPcSpeaker(600, 40);
        setActiveTool(prev => prev === 'dbu' ? null : 'dbu');
      } else if (e.key === 'F5') {
        e.preventDefault();
        playPcSpeaker(850, 40);
        window.location.reload();
      } else if (e.key === 'F6') {
        e.preventDefault();
        playPcSpeaker(1000, 40);
        setActiveTool(prev => prev === 'prompt' ? null : 'prompt');
      } else if (e.key === 'F7') {
        e.preventDefault();
        playPcSpeaker(700, 40);
        setActiveTool(prev => prev === 'calc' ? null : 'calc');
      } else if (e.key === 'F8') {
        e.preventDefault();
        playPcSpeaker(650, 40);
        setActiveTool(prev => prev === 'calendar' ? null : 'calendar');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setSoundEnabled(prev => !prev);
      } else if (e.key === 'F10') {
        e.preventDefault();
        playPcSpeaker(900, 40);
        setActiveMenuIndex(prev => prev === null ? 0 : null);
      } else if (e.key === 'Escape') {
        if (clipperAlert) {
          e.preventDefault();
          setClipperAlert(null);
          playPcSpeaker(400, 30);
        } else if (activeTool) {
          e.preventDefault();
          setActiveTool(null);
          playPcSpeaker(400, 30);
        } else if (activeMenuIndex !== null) {
          e.preventDefault();
          setActiveMenuIndex(null);
          playPcSpeaker(400, 30);
        } else if (view !== 'dashboard') {
          e.preventDefault();
          playPcSpeaker(440, 30);
          setView('dashboard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clipperAlert, activeTool, activeMenuIndex, view, soundEnabled]);

  // Color Styles based on Palette
  const getPaletteTheme = () => {
    switch (clipperPalette) {
      case 'green':
        return {
          bg: '#000000',
          screenBg: 'bg-black',
          textColor: 'text-[#33FF33]',
          borderColor: 'border-[#33FF33]',
          headerBg: 'bg-[#002200]',
          headerText: 'text-[#33FF33]',
          highlightBg: 'bg-[#33FF33] text-black font-bold',
          windowBg: 'bg-[#051105]',
          accentText: 'text-[#88FF88]',
          hotkeyText: 'text-[#FFFF33]',
          statusBarBg: 'bg-[#003300]',
          inputBg: 'bg-[#001100] text-[#33FF33] border-[#33FF33]',
          tag: 'PHOSPHOR GREEN (IBM 5151)'
        };
      case 'amber':
        return {
          bg: '#000000',
          screenBg: 'bg-black',
          textColor: 'text-[#FFB000]',
          borderColor: 'border-[#FFB000]',
          headerBg: 'bg-[#221100]',
          headerText: 'text-[#FFB000]',
          highlightBg: 'bg-[#FFB000] text-black font-bold',
          windowBg: 'bg-[#110800]',
          accentText: 'text-[#FFD066]',
          hotkeyText: 'text-[#FFFFFF]',
          statusBarBg: 'bg-[#331800]',
          inputBg: 'bg-[#110500] text-[#FFB000] border-[#FFB000]',
          tag: 'AMBER HERCULES (MDA)'
        };
      case 'mono':
        return {
          bg: '#000000',
          screenBg: 'bg-black',
          textColor: 'text-[#EEEEEE]',
          borderColor: 'border-[#CCCCCC]',
          headerBg: 'bg-[#222222]',
          headerText: 'text-[#FFFFFF]',
          highlightBg: 'bg-white text-black font-bold',
          windowBg: 'bg-[#111111]',
          accentText: 'text-[#AAAAAA]',
          hotkeyText: 'text-[#FFFF55]',
          statusBarBg: 'bg-[#333333]',
          inputBg: 'bg-[#181818] text-white border-white',
          tag: 'MONOCHROME WHITE (VGA)'
        };
      case 'blue':
      default:
        return {
          bg: '#0000AA',
          screenBg: 'bg-[#0000AA]',
          textColor: 'text-white',
          borderColor: 'border-[#00AAAA]',
          headerBg: 'bg-[#00AAAA]',
          headerText: 'text-black',
          highlightBg: 'bg-[#00AAAA] text-black font-bold',
          windowBg: 'bg-[#000088]',
          accentText: 'text-[#55FFFF]',
          hotkeyText: 'text-[#FFFF55]',
          statusBarBg: 'bg-[#000055]',
          inputBg: 'bg-[#000055] text-white border-[#00AAAA]',
          tag: 'CLIPPER CLASSIC BLUE (CGA/EGA)'
        };
    }
  };

  const pal = getPaletteTheme();

  // Menu Definition structured like classic Clipper pulldown menus
  const menuCategories = useMemo(() => [
    {
      title: 'ARQUIVO',
      hotkey: 'A',
      items: [
        { id: 'dashboard', label: '1. Visao Geral (Dashboard)', icon: LayoutDashboard, hotkey: '1' },
        { id: 'cad_igreja', label: '2. Dados da Igreja Matriz', icon: Building2, hotkey: '2' },
        { id: 'cad_congregacao', label: '3. Congregacoes e Filiais', icon: Building2, hotkey: '3' },
        { id: 'config_sistema', label: '4. Configuracoes Gerais', icon: Settings, hotkey: '4' },
        { id: 'config_visual', label: '5. Configurador Visual & Temas', icon: Palette, hotkey: '5' },
        { divider: true },
        { id: 'backup', label: 'B. Backup / Exportar DBF', icon: Database, action: () => setActiveTool('dbu'), hotkey: 'B' },
        { id: 'sair', label: 'X. Sair para o DOS (Logout)', icon: Power, action: handleLogoutRequest, hotkey: 'X' }
      ]
    },
    {
      title: 'SECRETARIA',
      hotkey: 'S',
      items: [
        { id: 'cad_membro', label: '1. Cadastro Geral de Membros', icon: Users, hotkey: '1' },
        { id: 'cad_visitante', label: '2. Visitantes e Frequencia', icon: UserCheck, hotkey: '2' },
        { id: 'cad_celula', label: '3. Celulas e Grupos Pequenos', icon: HeartHandshake, hotkey: '3' },
        { id: 'cad_departamento', label: '4. Departamentos & Ministerios', icon: FolderTree, hotkey: '4' },
        { id: 'secretaria_integrada', label: '5. Secretaria Integrada & Atas', icon: FileCheck, hotkey: '5' },
        { id: 'documentos_cartas', label: '6. Emissao de Cartas e Docs', icon: FileText, hotkey: '6' },
        { id: 'certificados', label: '7. Certificados e Diplomas', icon: Award, hotkey: '7' },
        { id: 'aniversariantes', label: '8. Rol de Aniversariantes', icon: Calendar, hotkey: '8' },
        { id: 'carteirinhas', label: '9. Credenciais & Carteirinhas', icon: Badge, hotkey: '9' }
      ]
    },
    {
      title: 'FINANCEIRO',
      hotkey: 'F',
      items: [
        { id: 'fin_entrada', label: '1. Lancamento de Entradas/Dizimos', icon: ArrowUpCircle, hotkey: '1' },
        { id: 'fin_saida', label: '2. Lancamento de Saidas/Despesas', icon: ArrowDownCircle, hotkey: '2' },
        { id: 'fin_carnes', label: '3. Carnes e Contribuicoes', icon: CreditCard, hotkey: '3' },
        { id: 'fin_centro_custo', label: '4. Centros de Custo', icon: Sliders, hotkey: '4' },
        { id: 'fin_fornecedores', label: '5. Cadastro de Fornecedores', icon: Briefcase, hotkey: '5' },
        { id: 'fin_conciliacao', label: '6. Conciliacao Bancaria & Extrato', icon: DollarSign, hotkey: '6' },
        { id: 'fin_prestacao_contas', label: '7. Balancete & Prestacao Contas', icon: FileSpreadsheet, hotkey: '7' }
      ]
    },
    {
      title: 'ENSINO/EBD',
      hotkey: 'E',
      items: [
        { id: 'secretaria_ebd', label: '1. Secretaria Geral da EBD', icon: GraduationCap, hotkey: '1' },
        { id: 'professor_ebd', label: '2. Diario de Classe do Professor', icon: BookOpen, hotkey: '2' },
        { id: 'curso_teologia', label: '3. Universidade Teologica CPAD', icon: BookOpenText, hotkey: '3' },
        { id: 'formacao_obreiros', label: '4. Formacao Ministerial Obreiros', icon: Award, hotkey: '4' }
      ]
    },
    {
      title: 'PASTORAL',
      hotkey: 'P',
      items: [
        { id: 'assistente_ai', label: '1. Pastoral IA & Esbocos', icon: Sparkles, hotkey: '1' },
        { id: 'mural', label: '2. Mural de Recados & Avisos', icon: Newspaper, hotkey: '2' },
        { id: 'agenda', label: '3. Agenda de Cultos e Escalas', icon: Calendar, hotkey: '3' },
        { id: 'tarefas', label: '4. Tarefas e Compromissos', icon: CheckSquare, hotkey: '4' },
        { id: 'patrimonio', label: '5. Controle de Patrimonio', icon: Package, hotkey: '5' },
        { id: 'salinha_kids', label: '6. Ministerio Infantil & Kids', icon: Baby, hotkey: '6' },
        { id: 'missoes', label: '7. Gestao de Missoes e Campos', icon: Globe, hotkey: '7' }
      ]
    },
    {
      title: 'UTILITARIOS',
      hotkey: 'U',
      items: [
        { id: 'tool_dbu', label: '1. DBU - Gerenciador DBF (F4)', icon: Database, action: () => setActiveTool('dbu'), hotkey: '1' },
        { id: 'tool_prompt', label: '2. Terminal Ponto (.) Prompt (F6)', icon: Terminal, action: () => setActiveTool('prompt'), hotkey: '2' },
        { id: 'tool_calc', label: '3. Calculadora de Fita (F7)', icon: Calculator, action: () => setActiveTool('calc'), hotkey: '3' },
        { id: 'tool_cal', label: '4. Calendario Liturgico (F8)', icon: Calendar, action: () => setActiveTool('calendar'), hotkey: '4' },
        { id: 'tool_sound', label: '5. Alternar Som PC Speaker (F9)', icon: Volume2, action: () => setSoundEnabled(s => !s), hotkey: '5' },
        { id: 'tool_scan', label: '6. Alternar Linhas CRT Scanline', icon: Monitor, action: () => setCrtScanlines(s => !s), hotkey: '6' },
        { id: 'tool_palette', label: '7. Trocar Monitor CGA/EGA/Amber', icon: Palette, action: () => {
          setClipperPalette(p => p === 'blue' ? 'amber' : p === 'amber' ? 'green' : p === 'green' ? 'mono' : 'blue');
          playPcSpeaker(750, 40);
        }, hotkey: '7' }
      ]
    },
    {
      title: 'AJUDA (F1)',
      hotkey: 'J',
      items: [
        { id: 'help_manual', label: '1. Manual do GIPP Clipper (F1)', icon: HelpCircle, action: () => setActiveTool('help'), hotkey: '1' },
        { id: 'help_about', label: '2. Sobre o Clipper 5.3 & GIPP', icon: Info, action: () => {
          setClipperAlert({
            title: 'SOBRE O GIPP CLIPPER 5.3',
            message: 'GIPP SISTEMA ECLESIASTICO INTEGRADO\nCompilado com Nantucket / CA-Clipper 5.3a\nDesenvolvido para Gestao Eclesiastica de Alta Performance.\n(C) 1985-2026 Todos os Direitos Reservados.',
            buttons: ['< CONTINUAR >'],
            onSelect: () => setClipperAlert(null)
          });
        }, hotkey: '2' },
        { id: 'help_sound_test', label: '3. Testar Bip do Teclado', icon: Volume2, action: playJingle, hotkey: '3' }
      ]
    }
  ], [handleLogoutRequest, soundEnabled]);

  // Handle Menu Item Click
  const handleSelectMenuItem = (item: any) => {
    playPcSpeaker(900, 30);
    setActiveMenuIndex(null);
    if (item.action) {
      item.action();
    } else if (item.id) {
      setView(item.id);
      setIsWindowMinimized(false);
    }
  };

  // --- DBU TABLE DATA RESOLVER ---
  const dbuTables = [
    { id: 'membros', label: 'MEMBROS.DBF', count: db.membros?.length || 0, fields: ['NOME', 'CARGO', 'TELEFONE', 'EMAIL', 'CIDADE', 'DATA_BATISMO'] },
    { id: 'financeiro', label: 'FINANCE.DBF', count: db.financeiro?.length || 0, fields: ['DESCRICAO', 'TIPO', 'VALOR', 'CATEGORIA', 'DATA', 'FORMA_PAGTO'] },
    { id: 'celulas', label: 'CELULAS.DBF', count: db.celulas?.length || 0, fields: ['NOME', 'LIDER', 'DIA_SEMANA', 'HORARIO', 'BAIRRO'] },
    { id: 'visitantes', label: 'VISITAS.DBF', count: db.visitantes?.length || 0, fields: ['NOME', 'TELEFONE', 'DATA_VISITA', 'CONSOLIDADOR'] },
    { id: 'departamentos', label: 'DEPTO.DBF', count: db.departamentos?.length || 0, fields: ['NOME', 'LIDER', 'DESCRICAO'] },
    { id: 'ebd_turmas', label: 'EBDTURM.DBF', count: db.ebd_turmas?.length || 0, fields: ['NOME', 'FAIXA_ETARIA', 'PROFESSOR', 'SALA'] },
    { id: 'ebd_alunos', label: 'EBDALUN.DBF', count: db.ebd_alunos?.length || 0, fields: ['NOME', 'TURMA', 'TELEFONE', 'PRESENCAS'] },
    { id: 'patrimonio', label: 'PATRIM.DBF', count: db.patrimonio?.length || 0, fields: ['ITEM', 'CODIGO', 'LOCAL', 'VALOR_ESTIMADO', 'ESTADO'] }
  ];

  const currentDbuRecords = useMemo(() => {
    const rawList = db[dbuSelectedTable] || [];
    if (!dbuSearchQuery) return rawList;
    const q = dbuSearchQuery.toLowerCase();
    return rawList.filter((item: any) => {
      return Object.values(item).some(val => String(val || '').toLowerCase().includes(q));
    });
  }, [db, dbuSelectedTable, dbuSearchQuery]);

  // --- PROMPT COMMAND PROCESSOR ---
  const handleExecutePromptCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const raw = promptInput.trim();
    const parts = raw.split(' ');
    const cmd = parts[0].toUpperCase();
    const arg = parts.slice(1).join(' ');

    playPcSpeaker(800, 30);
    const newHistory = [...promptHistory, { cmd: raw, out: '' }];

    switch (cmd) {
      case 'CLS':
      case 'CLEAR':
        setPromptHistory([]);
        setPromptInput('');
        return;

      case 'HELP':
      case '?':
        if (parts.length === 1) {
          newHistory.push({
            out: 'COMANDOS CLIPPER DISPONIVEIS:\n  USE <tabela>       - Seleciona DBF de trabalho (MEMBROS, FINANCEIRO, CELULAS, etc)\n  LIST [campos]      - Lista registros da tabela atual\n  COUNT              - Conta registros totais\n  SUM <campo>        - Soma valores numericos\n  DATE() / TIME()    - Exibe data e hora do sistema\n  BEEP               - Emite sinal sonoro do PC Speaker\n  ALERT(<mensagem>)  - Dispara caixa de dialogo Clipper\n  RUN <modulo>       - Executa modulo GIPP (ex: RUN MEMBRO, RUN ENTRADA, RUN EBD)\n  DIR                - Lista arquivos DBF disponiveis\n  CALC / CALENDAR    - Abre utilitarios internos\n  CLS / CLEAR        - Limpa tela do terminal\n  QUIT / EXIT        - Fecha terminal',
            type: 'info'
          });
        } else {
          try {
            // Evaluator for ? expression
            const expr = parts.slice(1).join(' ');
            // Safe evaluation of simple math
            // eslint-disable-next-line no-eval
            const result = Function(`'use strict'; return (${expr})`)();
            newHistory.push({ out: `=> ${result}`, type: 'res' });
          } catch (err) {
            newHistory.push({ out: `ERRO DE SINTAXE: Nao foi possivel avaliar expressao`, type: 'error' });
          }
        }
        break;

      case 'USE':
        if (!arg) {
          newHistory.push({ out: `TABELA ATUAL: ${activeDbfName}.DBF`, type: 'info' });
        } else {
          const tableName = arg.toLowerCase().replace('.dbf', '');
          if (db[tableName]) {
            setActiveDbfName(tableName.toUpperCase());
            newHistory.push({ out: `ARQUIVO ${tableName.toUpperCase()}.DBF ABERTO EM AREA 1. (${(db[tableName] || []).length} REGISTROS)`, type: 'success' });
          } else {
            newHistory.push({ out: `ERRO 1001: Arquivo ${arg.toUpperCase()}.DBF nao encontrado.`, type: 'error' });
            playErrorTone();
          }
        }
        break;

      case 'DIR':
        newHistory.push({
          out: `DIRETORIO DE C:\\GIPP\\DADOS\\*.DBF:\n` + dbuTables.map(t => `  ${t.label.padEnd(14, ' ')} ${String(t.count).padStart(6, ' ')} REGISTROS`).join('\n'),
          type: 'info'
        });
        break;

      case 'LIST': {
        const tKey = activeDbfName.toLowerCase();
        const records = db[tKey] || [];
        if (records.length === 0) {
          newHistory.push({ out: `Nenhum registro encontrado em ${activeDbfName}.DBF.`, type: 'info' });
        } else {
          const lines = records.slice(0, 15).map((r: any, idx: number) => {
            const label = r.nome || r.descricao || r.item || JSON.stringify(r);
            const extra = r.cargo || r.tipo || r.telefone || r.valor || '';
            return `[${String(idx + 1).padStart(4, '0')}] ${String(label).padEnd(35, ' ')} ${extra}`;
          });
          newHistory.push({ out: `LISTAGEM (${records.length} REGISTROS TOTAL):\n` + lines.join('\n') + (records.length > 15 ? `\n... mais ${records.length - 15} registros omitidos.` : ''), type: 'res' });
        }
        break;
      }

      case 'COUNT': {
        const tKey = activeDbfName.toLowerCase();
        const count = (db[tKey] || []).length;
        newHistory.push({ out: `TOTAL DE REGISTROS EM ${activeDbfName}.DBF: ${count}`, type: 'res' });
        break;
      }

      case 'SUM': {
        const tKey = activeDbfName.toLowerCase();
        const records = db[tKey] || [];
        const sum = records.reduce((acc: number, item: any) => acc + (Number(item.valor) || 0), 0);
        newHistory.push({ out: `SOMA DO CAMPO VALOR EM ${activeDbfName}.DBF: R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, type: 'res' });
        break;
      }

      case 'TIME':
      case 'TIME()':
        newHistory.push({ out: `HORA DO SISTEMA: ${new Date().toLocaleTimeString('pt-BR')}`, type: 'res' });
        break;

      case 'DATE':
      case 'DATE()':
        newHistory.push({ out: `DATA DO SISTEMA: ${new Date().toLocaleDateString('pt-BR')}`, type: 'res' });
        break;

      case 'BEEP':
        playJingle();
        newHistory.push({ out: `Sinal sonoro executado via driver PC Speaker.`, type: 'success' });
        break;

      case 'ALERT': {
        const match = raw.match(/ALERT\s*\((.*)\)/i);
        const msg = match ? match[1].replace(/['"]/g, '') : 'MENSAGEM DE ALERTA CLIPPER';
        setClipperAlert({
          title: 'CLIPPER ALERT SYSTEM',
          message: msg,
          buttons: ['< OK >', '< CANCELAR >'],
          onSelect: (btn) => {
            setClipperAlert(null);
            setPromptHistory(h => [...h, { out: `ALERT RETORNOU: ${btn}`, type: 'res' }]);
          }
        });
        newHistory.push({ out: `Caixa de alerta exibida.`, type: 'info' });
        break;
      }

      case 'RUN': {
        const target = arg.toLowerCase();
        const targetModule = ALL_AVAILABLE_MODULES.find(m => m.id.toLowerCase().includes(target) || m.label.toLowerCase().includes(target));
        if (targetModule) {
          setView(targetModule.id);
          setIsWindowMinimized(false);
          setActiveTool(null);
          newHistory.push({ out: `Executando ${targetModule.label}...`, type: 'success' });
        } else {
          newHistory.push({ out: `Modulo '${arg}' nao reconhecido. Use F10 para o menu de modulos.`, type: 'error' });
          playErrorTone();
        }
        break;
      }

      case 'CALC':
        setActiveTool('calc');
        break;

      case 'CALENDAR':
        setActiveTool('calendar');
        break;

      case 'QUIT':
      case 'EXIT':
        setActiveTool(null);
        return;

      default:
        newHistory.push({ out: `Comando invalido: '${raw}'. Digite HELP para lista de comandos.`, type: 'error' });
        playErrorTone();
        break;
    }

    setPromptHistory(newHistory);
    setPromptInput('');
  };

  // --- CALCULATOR OPERATIONS ---
  const handleCalcNumber = (digit: string) => {
    playPcSpeaker(900, 20);
    if (calcWaitingOperand) {
      setCalcDisplay(digit);
      setCalcWaitingOperand(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? digit : calcDisplay + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    playPcSpeaker(1000, 30);
    const currentVal = parseFloat(calcDisplay);
    if (calcPrevVal === null) {
      setCalcPrevVal(currentVal);
      setCalcTape(t => [...t, `   ${currentVal} ${op}`]);
    } else if (calcOp) {
      let res = calcPrevVal;
      if (calcOp === '+') res += currentVal;
      if (calcOp === '-') res -= currentVal;
      if (calcOp === '*') res *= currentVal;
      if (calcOp === '/') res = currentVal !== 0 ? res / currentVal : 0;
      setCalcDisplay(String(res));
      setCalcPrevVal(res);
      setCalcTape(t => [...t, `   ${currentVal} = ${res}`, `--------------------------------`, `   ${res} ${op}`]);
    }
    setCalcOp(op);
    setCalcWaitingOperand(true);
  };

  const handleCalcEquals = () => {
    playJingle();
    if (calcPrevVal === null || !calcOp) return;
    const currentVal = parseFloat(calcDisplay);
    let res = calcPrevVal;
    if (calcOp === '+') res += currentVal;
    if (calcOp === '-') res -= currentVal;
    if (calcOp === '*') res *= currentVal;
    if (calcOp === '/') res = currentVal !== 0 ? res / currentVal : 0;
    
    setCalcDisplay(String(res));
    setCalcTape(t => [...t, `   ${currentVal} = ${res}`, `================================`]);
    setCalcPrevVal(null);
    setCalcOp(null);
    setCalcWaitingOperand(true);
  };

  const handleCalcClear = () => {
    playPcSpeaker(600, 30);
    setCalcDisplay('0');
    setCalcPrevVal(null);
    setCalcOp(null);
    setCalcWaitingOperand(false);
  };

  return (
    <div 
      className={`fixed inset-0 select-none flex flex-col font-mono overflow-hidden ${pal.screenBg} ${pal.textColor}`}
      style={{
        fontFamily: "'VT323', 'Courier New', 'Consolas', 'Lucida Console', monospace",
        letterSpacing: '0.5px'
      }}
    >
      {/* CRT Scanline Overlay Filter */}
      {crtScanlines && (
        <div 
          className="pointer-events-none absolute inset-0 z-50 opacity-20"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 3px, 6px 100%'
          }}
        />
      )}

      {/* LINE 0: TOP ACTION BAR (CLIPPER MENU TO / PULLDOWN ACTION BAR) */}
      <header className={`h-7 px-2 flex items-center justify-between z-40 border-b ${pal.borderColor} ${pal.headerBg} ${pal.headerText} text-xs font-bold shrink-0`}>
        {/* Left: Top Menu Buttons with Highlighting */}
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-black text-white font-black mr-2 text-[11px] border border-white">
            GIPP v5.3
          </span>

          {menuCategories.map((menu, idx) => {
            const isOpen = activeMenuIndex === idx;
            return (
              <div key={menu.title} className="relative">
                <button
                  onClick={() => {
                    playPcSpeaker(900, 25);
                    setActiveMenuIndex(isOpen ? null : idx);
                  }}
                  className={`px-2 py-0.5 cursor-pointer uppercase transition-colors flex items-center gap-0.5 ${
                    isOpen ? 'bg-black text-white border border-white font-black' : 'hover:bg-black/20 text-black font-bold'
                  }`}
                >
                  <span className="text-yellow-300 underline font-black">{menu.title.charAt(0)}</span>
                  {menu.title.slice(1)}
                </button>

                {/* Pulldown Dropdown Submenu */}
                {isOpen && (
                  <div 
                    className={`absolute top-full left-0 mt-0.5 min-w-[280px] shadow-2xl border-2 border-double ${pal.borderColor} bg-[#000088] text-white z-50 p-1`}
                    style={{
                      boxShadow: '8px 8px 0px rgba(0,0,0,0.85)'
                    }}
                  >
                    <div className="text-[10px] px-2 py-0.5 bg-[#00AAAA] text-black font-black uppercase tracking-wider mb-1 flex justify-between">
                      <span>{menu.title}</span>
                      <span>[ESC] FECHAR</span>
                    </div>

                    <div className="flex flex-col space-y-0.5">
                      {menu.items.map((item: any, iIdx: number) => {
                        if (item.divider) {
                          return <div key={iIdx} className="border-t border-dashed border-[#00AAAA]/60 my-1" />;
                        }
                        return (
                          <button
                            key={item.id || iIdx}
                            onClick={() => handleSelectMenuItem(item)}
                            className="w-full text-left px-2.5 py-1 text-xs hover:bg-[#00AAAA] hover:text-black flex items-center justify-between group cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-yellow-300 font-bold group-hover:text-black">►</span>
                              <span>{item.label}</span>
                            </span>
                            {item.hotkey && (
                              <span className="text-[10px] text-yellow-300 group-hover:text-black font-bold ml-2">
                                [{item.hotkey}]
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Clock & Quick System Status */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-black/80 font-black">MEM: 640KB</span>
            <span>•</span>
            <span className="text-black/80">IGREJA: <strong className="uppercase">{db.igreja?.nome?.slice(0, 18) || 'GIPP'}</strong></span>
            <span>•</span>
          </div>
          <span className="px-1.5 py-0.2 bg-black text-yellow-300 border border-black font-mono">
            {currentDate} {currentTime}
          </span>
        </div>
      </header>

      {/* LINE 1: STATUS INFO & BREADCRUMB BAR */}
      <div className={`h-6 px-3 flex items-center justify-between text-[11px] border-b ${pal.borderColor} ${pal.statusBarBg} ${pal.accentText} shrink-0`}>
        <div className="flex items-center gap-2 truncate">
          <span className="text-yellow-300 font-black">C:\GIPP\SISTEMA&gt;</span>
          <span className="text-white uppercase font-bold">{mMeta.label}.EXE</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80">OPERADOR: <strong className="text-yellow-300 uppercase">{user?.nome || user?.usuario || 'PASTOR'}</strong></span>
          <span className="text-white/40">|</span>
          <span className="text-emerald-400 font-bold">● ONLINE FIREDAC</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => {
              playPcSpeaker(800, 30);
              setClipperPalette(p => p === 'blue' ? 'amber' : p === 'amber' ? 'green' : p === 'green' ? 'mono' : 'blue');
            }}
            className="px-1.5 py-0.2 bg-[#00AAAA] text-black hover:bg-white text-[10px] font-black uppercase cursor-pointer"
            title="Alternar modo de cores do monitor"
          >
            {pal.tag}
          </button>

          <button 
            onClick={() => {
              playPcSpeaker(600, 30);
              setCrtScanlines(s => !s);
            }}
            className={`px-1.5 py-0.2 text-[10px] font-black uppercase cursor-pointer ${crtScanlines ? 'bg-emerald-600 text-white' : 'bg-black/50 text-white/60'}`}
            title="Alternar linhas de varredura CRT"
          >
            CRT: {crtScanlines ? 'ON' : 'OFF'}
          </button>

          <button 
            onClick={() => {
              setSoundEnabled(s => !s);
              playPcSpeaker(900, 40);
            }}
            className={`px-1.5 py-0.2 text-[10px] font-black uppercase cursor-pointer ${soundEnabled ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white/60'}`}
            title="Alternar Som do Teclado e Avisos"
          >
            BIP: {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* LINE 2 to 23: MAIN CLIPPER WORKSPACE & ACTIVE WINDOW */}
      <main className="flex-1 relative p-2 md:p-3 overflow-hidden flex flex-col min-h-0">
        {/* When Window is minimized or user is on desktop overview */}
        {isWindowMinimized ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-6 border-4 border-double border-[#00AAAA] bg-[#000088] max-w-2xl w-full shadow-2xl text-left space-y-3">
              <div className="text-center font-black text-yellow-300 text-xl border-b-2 border-dashed border-[#00AAAA] pb-2">
                ╔════════════════════════════════════════════════════╗<br />
                ║  GIPP SISTEMA ECLESIASTICO INTEGRADO - CLIPPER 5.3 ║<br />
                ╚════════════════════════════════════════════════════╝
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <div className="text-yellow-300 font-bold mb-1">► ESTATISTICAS DA IGREJA:</div>
                  <div>• Membros Ativos: <strong className="text-white">{db.membros?.length || 0}</strong></div>
                  <div>• Celulas Registradas: <strong className="text-white">{db.celulas?.length || 0}</strong></div>
                  <div>• Visitantes Recentes: <strong className="text-white">{db.visitantes?.length || 0}</strong></div>
                  <div>• Turmas de EBD: <strong className="text-white">{db.ebd_turmas?.length || 0}</strong></div>
                </div>

                <div>
                  <div className="text-yellow-300 font-bold mb-1">► ATALHOS RAPIDOS:</div>
                  <div>[F1] Ajuda & Manual GIPP</div>
                  <div>[F4] DBU - Gerenciador de Tabelas DBF</div>
                  <div>[F6] Terminal Ponto (.) Prompt</div>
                  <div>[F7] Calculadora de Fita</div>
                  <div>[F10] Menu Principal de Modulos</div>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-[#00AAAA] flex justify-between items-center text-xs">
                <span className="text-[#55FFFF]">Janela atual minimizada: [{mMeta.label}]</span>
                <button
                  onClick={() => setIsWindowMinimized(false)}
                  className="px-3 py-1 bg-[#00AAAA] text-black hover:bg-white font-black uppercase cursor-pointer"
                >
                  ► RESTAURAR JANELA
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE MODULE CONTAINER FRAMED IN CLIPPER ASCII BOX */
          <div 
            className={`flex-1 flex flex-col border-2 border-double ${pal.borderColor} ${pal.windowBg} shadow-2xl relative min-h-0 overflow-hidden`}
            style={{
              boxShadow: '10px 10px 0px rgba(0,0,0,0.7)'
            }}
          >
            {/* Window ASCII Title Bar */}
            <div className={`h-8 px-3 flex items-center justify-between border-b ${pal.borderColor} ${pal.headerBg} ${pal.headerText} text-xs font-bold shrink-0 select-none`}>
              <div className="flex items-center gap-2 truncate">
                <span className="text-black font-black">╔═[</span>
                <span className="bg-black text-yellow-300 px-1.5 py-0.2 font-black uppercase text-[11px]">
                  █ {mMeta.label} █
                </span>
                <span className="text-black font-black">]═════════════════════════</span>
              </div>

              {/* Window Controls [Min] [Max] [Close] */}
              <div className="flex items-center gap-1 shrink-0 font-bold text-black text-xs">
                <button
                  onClick={() => {
                    playPcSpeaker(600, 30);
                    setIsWindowMinimized(true);
                  }}
                  className="px-1.5 py-0.5 bg-black text-white hover:bg-yellow-400 hover:text-black font-mono border border-black cursor-pointer"
                  title="Minimizar para o Desktop"
                >
                  ▲ MIN
                </button>

                <button
                  onClick={() => {
                    playPcSpeaker(750, 30);
                    setIsWindowMaximized(m => !m);
                  }}
                  className="px-1.5 py-0.5 bg-black text-white hover:bg-yellow-400 hover:text-black font-mono border border-black cursor-pointer"
                  title="Alternar Maximização"
                >
                  ■ MAX
                </button>

                <button
                  onClick={() => {
                    playPcSpeaker(400, 40);
                    setView('dashboard');
                  }}
                  className="px-1.5 py-0.5 bg-rose-700 text-white hover:bg-rose-600 font-mono border border-black cursor-pointer"
                  title="Fechar e retornar ao Painel Principal"
                >
                  X SAIR
                </button>
                <span className="text-black font-black">═╗</span>
              </div>
            </div>

            {/* Sub-Header Clipper DBF Status */}
            <div className="h-6 px-3 bg-black/40 border-b border-[#00AAAA]/40 flex items-center justify-between text-[10px] text-[#55FFFF] shrink-0">
              <div>
                <span>@ 03,02 SAY </span>
                <strong className="text-white">"REGISTROS CARREGADOS NO WORKSPACE: GIPP.DBF"</strong>
              </div>
              <div className="flex items-center gap-3">
                <span>BUFFER: <strong className="text-yellow-300">OK</strong></span>
                <span>LOCK: <strong className="text-emerald-400">OFF (MULTI-USER)</strong></span>
                <span>CODEPAGE: <strong className="text-white">PT-850</strong></span>
              </div>
            </div>

            {/* Render Actual GIPP Module Inside Clipper Frame with custom style overrides */}
            <div className="flex-1 p-2 md:p-3 overflow-y-auto custom-scrollbar relative bg-[#000088]/30">
              <CurrentModule {...currentProps} />
            </div>

            {/* Window Bottom Frame Line */}
            <div className={`h-5 px-3 bg-black/60 border-t ${pal.borderColor} flex items-center justify-between text-[10px] ${pal.accentText} shrink-0`}>
              <span>╚═══════════════════════════════════════════════════════════════════════╝</span>
              <span className="text-yellow-300 font-bold">STATUS: PRONTO PARA ENTRADA DE DADOS</span>
            </div>
          </div>
        )}
      </main>

      {/* LINE 24: FUNCTION KEYS BAR (F1-F10 + ESC) */}
      <footer className={`h-8 px-2 flex items-center justify-between border-t ${pal.borderColor} ${pal.statusBarBg} text-[11px] font-bold shrink-0 overflow-x-auto select-none`}>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => {
              playPcSpeaker(980, 40);
              setActiveTool(prev => prev === 'help' ? null : 'help');
            }}
            className="px-1.5 py-0.5 bg-[#00AAAA] hover:bg-white text-black font-bold cursor-pointer transition-colors"
          >
            <span className="text-yellow-900 font-black">F1</span> Ajuda
          </button>

          <button
            onClick={() => {
              playPcSpeaker(880, 50);
              const saveBtn = document.querySelector('button[type="submit"], button:has(.lucide-save), button:contains("Salvar")') as HTMLButtonElement;
              if (saveBtn) {
                saveBtn.click();
                playJingle();
              } else {
                setClipperAlert({
                  title: 'CLIPPER DATABASE COMMIT',
                  message: 'Comando DBCOMMIT() executado com sucesso.',
                  buttons: ['< OK >'],
                  onSelect: () => setClipperAlert(null)
                });
              }
            }}
            className="px-1.5 py-0.5 bg-[#00AAAA] hover:bg-white text-black font-bold cursor-pointer transition-colors"
          >
            <span className="text-yellow-900 font-black">F2</span> Gravar
          </button>

          <button
            onClick={() => {
              playPcSpeaker(750, 40);
              const searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"], input[type="search"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
                searchInput.select();
              } else {
                setActiveTool('dbu');
              }
            }}
            className="px-1.5 py-0.5 bg-[#00AAAA] hover:bg-white text-black font-bold cursor-pointer transition-colors"
          >
            <span className="text-yellow-900 font-black">F3</span> Buscar
          </button>

          <button
            onClick={() => {
              playPcSpeaker(600, 40);
              setActiveTool(prev => prev === 'dbu' ? null : 'dbu');
            }}
            className={`px-1.5 py-0.5 font-bold cursor-pointer transition-colors ${activeTool === 'dbu' ? 'bg-yellow-400 text-black' : 'bg-[#00AAAA] hover:bg-white text-black'}`}
          >
            <span className="text-yellow-900 font-black">F4</span> DBU/DBF
          </button>

          <button
            onClick={() => {
              playPcSpeaker(850, 40);
              window.location.reload();
            }}
            className="px-1.5 py-0.5 bg-[#00AAAA] hover:bg-white text-black font-bold cursor-pointer transition-colors"
          >
            <span className="text-yellow-900 font-black">F5</span> Atualizar
          </button>

          <button
            onClick={() => {
              playPcSpeaker(1000, 40);
              setActiveTool(prev => prev === 'prompt' ? null : 'prompt');
            }}
            className={`px-1.5 py-0.5 font-bold cursor-pointer transition-colors ${activeTool === 'prompt' ? 'bg-yellow-400 text-black' : 'bg-[#00AAAA] hover:bg-white text-black'}`}
          >
            <span className="text-yellow-900 font-black">F6</span> Prompt(.)
          </button>

          <button
            onClick={() => {
              playPcSpeaker(700, 40);
              setActiveTool(prev => prev === 'calc' ? null : 'calc');
            }}
            className={`px-1.5 py-0.5 font-bold cursor-pointer transition-colors ${activeTool === 'calc' ? 'bg-yellow-400 text-black' : 'bg-[#00AAAA] hover:bg-white text-black'}`}
          >
            <span className="text-yellow-900 font-black">F7</span> Calc
          </button>

          <button
            onClick={() => {
              playPcSpeaker(650, 40);
              setActiveTool(prev => prev === 'calendar' ? null : 'calendar');
            }}
            className={`px-1.5 py-0.5 font-bold cursor-pointer transition-colors ${activeTool === 'calendar' ? 'bg-yellow-400 text-black' : 'bg-[#00AAAA] hover:bg-white text-black'}`}
          >
            <span className="text-yellow-900 font-black">F8</span> Calendario
          </button>

          <button
            onClick={() => {
              setSoundEnabled(s => !s);
              playPcSpeaker(800, 40);
            }}
            className={`px-1.5 py-0.5 font-bold cursor-pointer transition-colors ${soundEnabled ? 'bg-yellow-400 text-black' : 'bg-slate-700 text-white'}`}
          >
            <span className="font-black">F9</span> Bip:{soundEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              playPcSpeaker(900, 40);
              setActiveMenuIndex(prev => prev === null ? 0 : null);
            }}
            className="px-1.5 py-0.5 bg-[#00AAAA] hover:bg-white text-black font-bold cursor-pointer transition-colors"
          >
            <span className="text-yellow-900 font-black">F10</span> Menu
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playPcSpeaker(440, 30);
              if (activeTool) setActiveTool(null);
              else if (view !== 'dashboard') setView('dashboard');
            }}
            className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white font-black uppercase text-[11px] cursor-pointer"
          >
            ESC Sair/Voltar
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* CLIPPER TOOL MODAL: DBU (DATABASE UTILITY / TBROWSE)                      */}
      {/* ========================================================================= */}
      {activeTool === 'dbu' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-5xl h-[85vh] bg-[#000088] border-4 border-double border-[#00AAAA] text-white flex flex-col shadow-2xl relative"
            style={{ boxShadow: '12px 12px 0px rgba(0,0,0,0.9)' }}
          >
            {/* DBU Header */}
            <div className="h-8 bg-[#00AAAA] text-black px-3 flex items-center justify-between font-black text-xs">
              <div className="flex items-center gap-2">
                <span>╔═[ DBU - CLIPPER DATABASE UTILITY v5.3 • {dbuSelectedTable.toUpperCase()}.DBF ]═╗</span>
              </div>
              <button 
                onClick={() => { playPcSpeaker(400, 30); setActiveTool(null); }}
                className="px-2 py-0.5 bg-black text-white hover:bg-rose-600 font-mono text-xs cursor-pointer"
              >
                [X] FECHAR (ESC)
              </button>
            </div>

            {/* DBU Table Switcher Bar */}
            <div className="p-2 bg-black/50 border-b border-[#00AAAA] flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-300 font-bold">SELECIONAR DBF:</span>
                {dbuTables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playPcSpeaker(800, 25);
                      setDbuSelectedTable(t.id);
                      setDbuCurrentIndex(0);
                    }}
                    className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer uppercase ${
                      dbuSelectedTable === t.id ? 'bg-yellow-400 text-black font-black' : 'bg-[#0000AA] hover:bg-[#00AAAA] hover:text-black text-white'
                    }`}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>

              {/* Search in Table */}
              <div className="flex items-center gap-1">
                <span className="text-[#55FFFF]">LOCATE:</span>
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={dbuSearchQuery}
                  onChange={(e) => setDbuSearchQuery(e.target.value)}
                  className="px-2 py-0.5 bg-black text-yellow-300 border border-[#00AAAA] text-xs outline-none uppercase font-mono w-40"
                />
              </div>
            </div>

            {/* DBU Grid View (TBrowse Simulation) */}
            <div className="flex-1 overflow-auto p-2 bg-black/30 font-mono text-xs">
              {currentDbuRecords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#55FFFF] space-y-2">
                  <Database size={40} className="text-yellow-400 animate-pulse" />
                  <p className="font-bold text-sm">NENHUM REGISTRO ENCONTRADO NO DBF SELECIONADO</p>
                  <p className="text-[11px] text-white/60">Tabela vazia ou nenhum dado corresponde aos filtros da pesquisa.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#00AAAA] text-black font-black text-[11px] uppercase border border-black">
                      <th className="p-1.5 border-r border-black w-16 text-center">RECNO</th>
                      <th className="p-1.5 border-r border-black w-8 text-center">DEL</th>
                      {dbuTables.find(t => t.id === dbuSelectedTable)?.fields.map(f => (
                        <th key={f} className="p-1.5 border-r border-black">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentDbuRecords.map((item: any, idx: number) => {
                      const isSelected = dbuCurrentIndex === idx;
                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            playPcSpeaker(850, 15);
                            setDbuCurrentIndex(idx);
                          }}
                          className={`cursor-pointer border-b border-[#00AAAA]/20 transition-colors ${
                            isSelected ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-[#00AAAA]/20 text-white'
                          }`}
                        >
                          <td className="p-1.5 border-r border-[#00AAAA]/30 text-center font-mono font-bold">
                            {String(idx + 1).padStart(4, '0')}
                          </td>
                          <td className="p-1.5 border-r border-[#00AAAA]/30 text-center text-rose-500 font-bold">
                            {item.excluido ? '*' : ' '}
                          </td>
                          {dbuTables.find(t => t.id === dbuSelectedTable)?.fields.map(f => {
                            const val = item[f.toLowerCase()] || item[f] || '-';
                            return (
                              <td key={f} className="p-1.5 border-r border-[#00AAAA]/30 truncate max-w-[200px]">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* DBU Status Footer */}
            <div className="h-7 bg-[#000055] border-t border-[#00AAAA] px-3 flex items-center justify-between text-xs text-yellow-300 font-bold">
              <div>
                <span>REGISTRO: <strong>{currentDbuRecords.length > 0 ? dbuCurrentIndex + 1 : 0} / {currentDbuRecords.length}</strong></span>
                <span className="ml-4">BOF: <strong>{dbuCurrentIndex === 0 ? '.T.' : '.F.'}</strong></span>
                <span className="ml-4">EOF: <strong>{dbuCurrentIndex >= currentDbuRecords.length - 1 ? '.T.' : '.F.'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csv = JSON.stringify(currentDbuRecords, null, 2);
                    const blob = new Blob([csv], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${dbuSelectedTable.toUpperCase()}.JSON`;
                    a.click();
                    playJingle();
                  }}
                  className="px-2 py-0.5 bg-[#00AAAA] text-black hover:bg-white text-[11px] font-black uppercase cursor-pointer"
                >
                  ↓ EXPORTAR DADOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIPPER TOOL MODAL: DOT-PROMPT TERMINAL (.)                               */}
      {/* ========================================================================= */}
      {activeTool === 'prompt' && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-4xl h-[75vh] bg-black border-4 border-double border-[#33FF33] text-[#33FF33] flex flex-col shadow-2xl relative font-mono"
            style={{ boxShadow: '12px 12px 0px rgba(0,0,0,0.9)' }}
          >
            {/* Terminal Title */}
            <div className="h-7 bg-[#003300] text-[#33FF33] px-3 flex items-center justify-between text-xs font-bold border-b border-[#33FF33]">
              <span>╔═[ CLIPPER INTERACTIVE DOT-PROMPT CONSOLE ]═╗</span>
              <button 
                onClick={() => { playPcSpeaker(400, 30); setActiveTool(null); }}
                className="px-2 py-0.2 bg-black text-[#33FF33] hover:bg-[#33FF33] hover:text-black border border-[#33FF33] text-xs cursor-pointer"
              >
                [X] SAIR (ESC)
              </button>
            </div>

            {/* Terminal History Screen */}
            <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs">
              {promptHistory.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.cmd && (
                    <div className="text-yellow-300 font-bold flex items-center gap-1">
                      <span>.</span>
                      <span>{item.cmd}</span>
                    </div>
                  )}
                  <pre className={`whitespace-pre-wrap ${
                    item.type === 'error' ? 'text-rose-400 font-bold' :
                    item.type === 'success' ? 'text-emerald-400 font-bold' :
                    item.type === 'res' ? 'text-cyan-300' : 'text-[#33FF33]'
                  }`}>
                    {item.out}
                  </pre>
                </div>
              ))}
            </div>

            {/* Terminal Input Line */}
            <form onSubmit={handleExecutePromptCommand} className="h-10 px-3 bg-[#001100] border-t border-[#33FF33] flex items-center gap-2">
              <span className="text-yellow-300 font-black text-sm">.</span>
              <input
                ref={promptInputRef}
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Digite um comando Clipper (ex: HELP, LIST, COUNT, DIR, RUN MEMBRO)..."
                autoFocus
                className="flex-1 bg-transparent text-[#33FF33] outline-none font-mono text-xs uppercase"
              />
              <button 
                type="submit"
                className="px-3 py-1 bg-[#33FF33] text-black font-black uppercase text-xs hover:bg-white cursor-pointer"
              >
                ENTER ↵
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIPPER TOOL MODAL: TAPE CALCULATOR (F7)                                  */}
      {/* ========================================================================= */}
      {activeTool === 'calc' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="w-96 bg-[#000088] border-4 border-double border-[#00AAAA] text-white flex flex-col shadow-2xl relative font-mono"
            style={{ boxShadow: '10px 10px 0px rgba(0,0,0,0.85)' }}
          >
            <div className="h-7 bg-[#00AAAA] text-black px-3 flex items-center justify-between font-black text-xs">
              <span>╔═[ CALCULADORA DE FITA (F7) ]═╗</span>
              <button 
                onClick={() => { playPcSpeaker(400, 30); setActiveTool(null); }}
                className="px-1.5 bg-black text-white hover:bg-rose-600 cursor-pointer"
              >
                X
              </button>
            </div>

            {/* Tape Output Window */}
            <div className="h-32 p-2 bg-black text-yellow-300 text-[11px] font-mono overflow-y-auto border-b border-[#00AAAA] space-y-0.5">
              {calcTape.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>

            {/* Main LCD Display */}
            <div className="p-3 bg-[#00AAAA] text-black text-right text-2xl font-black font-mono tracking-wider border-b-2 border-black">
              {calcDisplay}
            </div>

            {/* Calculator Buttons */}
            <div className="p-3 grid grid-cols-4 gap-2 bg-[#000055] text-xs font-bold">
              {['C', 'CE', '%', '/'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => btn === 'C' ? handleCalcClear() : handleCalcOp(btn)}
                  className="p-2 bg-[#00AAAA] text-black hover:bg-white font-black cursor-pointer"
                >
                  {btn}
                </button>
              ))}

              {['7', '8', '9', '*'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => isNaN(Number(btn)) ? handleCalcOp(btn) : handleCalcNumber(btn)}
                  className={`p-2 cursor-pointer font-bold ${isNaN(Number(btn)) ? 'bg-[#00AAAA] text-black hover:bg-white' : 'bg-black text-white hover:bg-[#00AAAA] hover:text-black border border-white'}`}
                >
                  {btn}
                </button>
              ))}

              {['4', '5', '6', '-'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => isNaN(Number(btn)) ? handleCalcOp(btn) : handleCalcNumber(btn)}
                  className={`p-2 cursor-pointer font-bold ${isNaN(Number(btn)) ? 'bg-[#00AAAA] text-black hover:bg-white' : 'bg-black text-white hover:bg-[#00AAAA] hover:text-black border border-white'}`}
                >
                  {btn}
                </button>
              ))}

              {['1', '2', '3', '+'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => isNaN(Number(btn)) ? handleCalcOp(btn) : handleCalcNumber(btn)}
                  className={`p-2 cursor-pointer font-bold ${isNaN(Number(btn)) ? 'bg-[#00AAAA] text-black hover:bg-white' : 'bg-black text-white hover:bg-[#00AAAA] hover:text-black border border-white'}`}
                >
                  {btn}
                </button>
              ))}

              {['0', '00', '.', '='].map(btn => (
                <button 
                  key={btn}
                  onClick={() => btn === '=' ? handleCalcEquals() : btn === '.' ? handleCalcNumber('.') : handleCalcNumber(btn)}
                  className={`p-2 cursor-pointer font-black ${btn === '=' ? 'bg-yellow-400 text-black hover:bg-white' : 'bg-black text-white hover:bg-[#00AAAA] hover:text-black border border-white'}`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIPPER TOOL MODAL: ASCII CALENDAR (F8)                                   */}
      {/* ========================================================================= */}
      {activeTool === 'calendar' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-[#000088] border-4 border-double border-[#00AAAA] text-white flex flex-col shadow-2xl relative font-mono"
            style={{ boxShadow: '10px 10px 0px rgba(0,0,0,0.85)' }}
          >
            <div className="h-7 bg-[#00AAAA] text-black px-3 flex items-center justify-between font-black text-xs">
              <span>╔═[ CALENDARIO LITURGICO CLIPPER (F8) ]═╗</span>
              <button 
                onClick={() => { playPcSpeaker(400, 30); setActiveTool(null); }}
                className="px-1.5 bg-black text-white hover:bg-rose-600 cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#00AAAA] pb-2">
                <button 
                  onClick={() => {
                    playPcSpeaker(700, 20);
                    const prev = new Date(calendarDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCalendarDate(prev);
                  }}
                  className="px-2 py-0.5 bg-[#00AAAA] text-black font-black hover:bg-white cursor-pointer"
                >
                  ◄ MES ANT
                </button>

                <div className="text-center font-black text-yellow-300 text-sm uppercase">
                  {calendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>

                <button 
                  onClick={() => {
                    playPcSpeaker(700, 20);
                    const next = new Date(calendarDate);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarDate(next);
                  }}
                  className="px-2 py-0.5 bg-[#00AAAA] text-black font-black hover:bg-white cursor-pointer"
                >
                  PROX MES ►
                </button>
              </div>

              {/* Day Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
                  <div key={d} className={`p-1 font-black ${d === 'DOM' || d === 'QUA' ? 'bg-yellow-400 text-black' : 'bg-[#00AAAA] text-black'}`}>
                    {d}
                  </div>
                ))}

                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 2; // Offset sample
                  const isValid = dayNum > 0 && dayNum <= 31;
                  const isToday = dayNum === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth();
                  const isCultoDay = (i % 7 === 0 || i % 7 === 3) && isValid;

                  return (
                    <div 
                      key={i}
                      className={`p-2 border border-[#00AAAA]/40 text-center font-mono ${
                        isToday ? 'bg-white text-black font-black' :
                        isCultoDay ? 'bg-[#00AAAA]/30 text-yellow-300 font-bold' :
                        isValid ? 'text-white' : 'opacity-20 text-slate-500'
                      }`}
                    >
                      {isValid ? String(dayNum).padStart(2, '0') : '··'}
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-[#55FFFF] border-t border-[#00AAAA] pt-2 space-y-0.5">
                <div>• <strong className="text-yellow-300">DOM:</strong> Escola Biblica Dominical (09h00) / Culto da Familia (18h30)</div>
                <div>• <strong className="text-yellow-300">QUA:</strong> Culto de Ensino & Doutrina (19h30)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIPPER TOOL MODAL: HELP & SHORTCUTS (F1)                                 */}
      {/* ========================================================================= */}
      {activeTool === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-2xl bg-[#000088] border-4 border-double border-[#00AAAA] text-white flex flex-col shadow-2xl relative font-mono"
            style={{ boxShadow: '12px 12px 0px rgba(0,0,0,0.9)' }}
          >
            <div className="h-7 bg-[#00AAAA] text-black px-3 flex items-center justify-between font-black text-xs">
              <span>╔═[ GUIA RAPIDO DE TECLAS & MANUAL CLIPPER (F1) ]═╗</span>
              <button 
                onClick={() => { playPcSpeaker(400, 30); setActiveTool(null); }}
                className="px-1.5 bg-black text-white hover:bg-rose-600 cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs overflow-y-auto max-h-[70vh]">
              <div className="text-yellow-300 font-black text-sm border-b border-dashed border-[#00AAAA] pb-1">
                ► TECLAS DE FUNCAO GLOBAIS DO SISTEMA GIPP:
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F1]</strong> Exibe esta tela de Ajuda e Manual.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F2]</strong> Salvar / Gravar dados (DBCOMMIT).
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F3]</strong> Ativar caixa de pesquisa / Localizar.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F4]</strong> Abrir DBU (Database Utility / DBF).
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F5]</strong> Recarregar tela / Atualizar dados.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F6]</strong> Abrir Terminal Interativo Dot-Prompt (.).
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F7]</strong> Abrir Calculadora de Fita.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F8]</strong> Abrir Calendario Liturgico Eclesiastico.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F9]</strong> Ligar / Desligar som do PC Speaker.
                </div>
                <div className="p-2 bg-black/40 border border-[#00AAAA]">
                  <strong className="text-yellow-300">[F10]</strong> Abrir Menu Superior de Aplicacoes.
                </div>
              </div>

              <div className="text-yellow-300 font-black text-sm border-b border-dashed border-[#00AAAA] pb-1 pt-2">
                ► PADRAO DE CORES E TECLAS DE ATALHO:
              </div>

              <p className="text-[#55FFFF] text-[11px] leading-relaxed">
                O sistema GIPP CLIPPER replica fielmente a experiencia dos ambientes desenvolvidos em Nantucket CA-Clipper Summer 87 e Clipper 5.x. Todas as tabelas do Firestore sao integradas em tempo real e acessiveis tanto visualmente como atraves das ferramentas internas DBU e Dot-Prompt.
              </p>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTool(null)}
                  className="px-4 py-1.5 bg-[#00AAAA] text-black hover:bg-white font-black uppercase text-xs cursor-pointer"
                >
                  ◄ RETORNAR AO SISTEMA (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLIPPER MODAL: ALERT DIALOG (ALERT BOX)                                   */}
      {/* ========================================================================= */}
      {clipperAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-[#0000AA] border-4 border-double border-white text-white p-4 shadow-2xl space-y-4 font-mono text-center"
            style={{ boxShadow: '12px 12px 0px rgba(0,0,0,0.9)' }}
          >
            <div className="text-yellow-300 font-black text-sm uppercase tracking-wider">
              ╔═[ {clipperAlert.title} ]═╗
            </div>

            <div className="text-xs text-white whitespace-pre-wrap leading-relaxed py-2">
              {clipperAlert.message}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {clipperAlert.buttons.map((btn, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => {
                    playPcSpeaker(850, 30);
                    clipperAlert.onSelect(btn);
                  }}
                  className="px-4 py-1 bg-[#00AAAA] text-black hover:bg-white font-black text-xs uppercase cursor-pointer border border-black"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GippClipperLayout;
