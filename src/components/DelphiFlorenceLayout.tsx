import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, Plus, Edit, Trash2, Printer, Search, X, BookOpen, GraduationCap, Shield, Database, Save, RefreshCw, 
  Phone, Mail, Code, Info, Home, Wifi, Sparkles, Palette,
  CheckCircle2, Minus, Maximize2, FileSpreadsheet, Lock, AlertTriangle,
  Play, Square, Terminal, Cpu, HardDrive, HelpCircle, Layers, Sliders,
  QrCode, BookOpenText, DollarSign, ArrowUpCircle, ArrowDownCircle, Briefcase,
  History, ShieldCheck, Newspaper, Award, Calendar, FolderTree, Check
} from 'lucide-react';

interface DelphiFlorenceLayoutProps {
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

export const DelphiFlorenceLayout: React.FC<DelphiFlorenceLayoutProps> = ({
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isFormMaximized, setIsFormMaximized] = useState(true);
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [isFormClosed, setIsFormClosed] = useState(false);
  const [windowScale, setWindowScale] = useState<'normal' | 'compact' | 'wide'>('normal');
  const [showObjectInspector, setShowObjectInspector] = useState(false);
  const [isRunningAnimation, setIsRunningAnimation] = useState(false);
  const [delphiSubTheme, setDelphiSubTheme] = useState<'gipp_retro' | 'delphi_classic' | 'high_contrast'>(() => {
    return (localStorage.getItem('gipp_delphi_subtheme') as any) || 'gipp_retro';
  });
  const menuBarRef = useRef<HTMLDivElement>(null);

  // When view changes, automatically reopen and unminimize the active form
  useEffect(() => {
    setIsFormMinimized(false);
    setIsFormClosed(false);
  }, [view]);

  const handleCloseForm = () => {
    if (view !== 'dashboard') {
      setView('dashboard');
      setIsFormMinimized(false);
      setIsFormClosed(false);
    } else {
      setIsFormClosed(true);
    }
  };

  const handleSetDelphiSubTheme = (sub: 'gipp_retro' | 'delphi_classic' | 'high_contrast') => {
    setDelphiSubTheme(sub);
    try {
      localStorage.setItem('gipp_delphi_subtheme', sub);
    } catch {}
  };

  // Color schemes based on Delphi sub-theme
  const isClassic = delphiSubTheme === 'delphi_classic';
  const isHighContrast = delphiSubTheme === 'high_contrast';

  const themeClasses = {
    bgRoot: isHighContrast ? 'bg-black text-yellow-300' : isClassic ? 'bg-[#D4D0C8] text-black' : 'bg-[#E2E6EA] text-[#102A43]',
    titleBar: isHighContrast 
      ? 'bg-black border-b-2 border-yellow-400 text-yellow-300' 
      : isClassic 
        ? 'bg-[#000080] text-white border-b border-[#000040]' 
        : 'bg-gradient-to-r from-[#003B73] via-[#004E98] to-[#1D65A6] text-white border-b border-[#002855]',
    menuNav: isHighContrast
      ? 'bg-black border-b-2 border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#ECE9D8] border-b border-[#ACA899] text-black'
        : 'bg-[#DFE3E8] border-b border-[#BAC7D5] text-[#102A43]',
    toolBar: isHighContrast
      ? 'bg-black border-b-2 border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#ECE9D8] border-b border-[#ACA899] text-black'
        : 'bg-[#ECEFF4] border-b border-[#BAC7D5] text-[#102A43]',
    paletteHeader: isHighContrast
      ? 'bg-black border-b border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#ECE9D8] border-b border-[#ACA899] text-black'
        : 'bg-[#DFE3E8] border-b border-[#7B8794] text-[#102A43]',
    paletteContent: isHighContrast
      ? 'bg-black border-t border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#F0EDE0] border-t border-white text-black'
        : 'bg-[#ECEFF4] border-t border-white text-[#102A43]',
    formWorkspace: isHighContrast
      ? 'bg-black border-2 border-yellow-400 text-yellow-300 shadow-none'
      : isClassic
        ? 'bg-[#ECE9D8] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] text-black shadow-lg'
        : 'bg-[#ECEFF4] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] text-[#102A43] shadow-xl',
    statusBar: isHighContrast
      ? 'bg-black border-t-2 border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#ECE9D8] border-t border-[#ACA899] text-black'
        : 'bg-[#DFE3E8] border-t border-[#BAC7D5] text-[#102A43]',
    statusPanel: isHighContrast
      ? 'bg-black border border-yellow-400 text-yellow-300 shadow-none'
      : isClassic
        ? 'bg-[#ECE9D8] border-t border-l border-t-[#808080] border-l-[#808080] border-r border-b border-r-white border-b-white text-black shadow-inner'
        : 'bg-[#ECEFF4] border-t border-l border-t-[#7B8794] border-l-[#7B8794] border-r border-b border-r-white border-b-white text-[#102A43] shadow-inner',
    button3D: isHighContrast
      ? 'bg-black border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-950'
      : isClassic
        ? 'bg-gradient-to-b from-[#FFFFFF] via-[#ECE9D8] to-[#D8D4C4] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] text-black hover:bg-[#F5F2E6]'
        : 'bg-gradient-to-b from-white via-[#E6E9ED] to-[#D2D7DF] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] text-[#102A43] hover:bg-[#F0F3F7]',
    menuDropdown: isHighContrast
      ? 'bg-black border-2 border-yellow-400 text-yellow-300'
      : isClassic
        ? 'bg-[#ECE9D8] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] text-black shadow-2xl'
        : 'bg-[#ECEFF4] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] text-[#102A43] shadow-2xl'
  };

  // Clock for Delphi TStatusBar
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

  // Listen to sub-theme change events from visual config module
  useEffect(() => {
    const handleSubThemeEvent = (e: any) => {
      if (e.detail?.subTheme) {
        setDelphiSubTheme(e.detail.subTheme);
      }
    };
    window.addEventListener('gipp_subtheme_changed', handleSubThemeEvent);
    return () => window.removeEventListener('gipp_subtheme_changed', handleSubThemeEvent);
  }, []);

  // Close menus on outside click & Delphi Hotkeys (F9, F11, Ctrl+F, Esc)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleDelphiHotkeys = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName;
      const isTyping = activeEl === 'INPUT' || activeEl === 'TEXTAREA' || activeEl === 'SELECT';

      // Global Ctrl+N: Novo Registro / Novo Módulo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        // Dispara clique no botão Novo da tela se existir ou abre tela de cadastro
        const newBtn = document.querySelector('button[title*="Novo"], button[title*="novo"], button:has(svg.lucide-plus), button:has(svg.lucide-user-plus)') as HTMLButtonElement | null;
        if (newBtn && typeof newBtn.click === 'function') {
          newBtn.click();
        } else {
          setView('cad_membro');
        }
        return;
      }

      // Global Ctrl+P: Imprimir Relatório / Documento
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const printBtn = document.querySelector('button[title*="Imprimir"], button[title*="imprimir"], button:has(svg.lucide-printer)') as HTMLButtonElement | null;
        if (printBtn && typeof printBtn.click === 'function') {
          printBtn.click();
        } else {
          window.print();
        }
        return;
      }

      if (e.key === 'F9') {
        e.preventDefault();
        handleRunModule();
      } else if (e.key === 'F11') {
        e.preventDefault();
        setShowObjectInspector(prev => !prev);
      } else if (e.key === 'F1' && !isTyping) {
        e.preventDefault();
        setView('manual');
      } else if (e.key === 'F2' && !isTyping) {
        e.preventDefault();
        setView('cad_membro');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setActiveMenu(null);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleDelphiHotkeys);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleDelphiHotkeys);
    };
  }, [setView]);

  const handleRunModule = () => {
    setIsRunningAnimation(true);
    setTimeout(() => setIsRunningAnimation(false), 600);
  };

  const menuStructure = [
    {
      id: 'arquivo',
      label: 'Arquivo',
      accessKey: 'A',
      items: [
        { 
          label: 'Novo Registro (Formulário)', 
          shortcut: 'Ctrl+N', 
          icon: Plus, 
          action: () => {
            const newBtn = document.querySelector('button[title*="Novo"], button[title*="novo"], button:has(svg.lucide-plus), button:has(svg.lucide-user-plus)') as HTMLButtonElement | null;
            if (newBtn && typeof newBtn.click === 'function') {
              newBtn.click();
            } else {
              setView('cad_membro');
            }
          } 
        },
        { label: 'Novo / Visão Geral (Dashboard)', shortcut: 'Ctrl+H', icon: LayoutDashboard, action: () => setView('dashboard') },
        { label: 'Secretaria Integrada', shortcut: 'Ctrl+S', icon: FileText, action: () => setView('secretaria_integrada') },
        { label: 'Cadastro Geral de Membros', shortcut: 'Ctrl+M', icon: Users, action: () => setView('cad_membro') },
        { type: 'separator' },
        { 
          label: 'Imprimir Relatório / Documento', 
          shortcut: 'Ctrl+P', 
          icon: Printer, 
          action: () => {
            const printBtn = document.querySelector('button[title*="Imprimir"], button[title*="imprimir"], button:has(svg.lucide-printer)') as HTMLButtonElement | null;
            if (printBtn && typeof printBtn.click === 'function') {
              printBtn.click();
            } else {
              window.print();
            }
          } 
        },
        { label: 'Financeiro: Livro Caixa', shortcut: 'Ctrl+E', icon: ArrowUpCircle, action: () => setView('fin_entrada') },
        { label: 'Financeiro: Despesas & Saídas', shortcut: 'Ctrl+D', icon: ArrowDownCircle, action: () => setView('fin_saida') },
        { type: 'separator' },
        { label: 'Bloquear Estação de Trabalho', shortcut: 'Alt+L', icon: Lock, action: () => setIsScreenLocked(true) },
        { label: 'Encerrar Sessão (Logout)', shortcut: 'Alt+F4', icon: LogOut, action: handleLogoutRequest, isDanger: true }
      ]
    },
    {
      id: 'editar',
      label: 'Editar',
      accessKey: 'E',
      items: [
        { label: 'Desfazer Última Ação', shortcut: 'Ctrl+Z', icon: RefreshCw, action: () => {} },
        { label: 'Refazer Ação', shortcut: 'Ctrl+Y', icon: RefreshCw, action: () => {} },
        { type: 'separator' },
        { label: 'Recortar', shortcut: 'Ctrl+X', icon: Edit, action: () => {} },
        { label: 'Copiar Registro', shortcut: 'Ctrl+C', icon: FileText, action: () => {} },
        { label: 'Colar Registro', shortcut: 'Ctrl+V', icon: Save, action: () => {} },
        { type: 'separator' },
        { label: 'Localizar Módulo ou Registro...', shortcut: 'Ctrl+F', icon: Search, action: () => setSearchOpen(true) }
      ]
    },
    {
      id: 'exibir',
      label: 'Exibir',
      accessKey: 'X',
      items: [
        { 
          label: `Inspetor de Objetos (${showObjectInspector ? 'Ocultar' : 'Exibir'})`, 
          shortcut: 'F11', 
          icon: Sliders, 
          action: () => setShowObjectInspector(!showObjectInspector),
          checked: showObjectInspector
        },
        { label: 'Paleta de Componentes VCL', shortcut: 'Ctrl+Alt+P', icon: Layers, action: () => {} },
        { label: 'Gerenciador de Estrutura FireDAC', shortcut: 'F12', icon: Database, action: () => setView('config_backup') },
        { label: 'Auditoria de Logs & Acessos', shortcut: 'Ctrl+L', icon: Shield, action: () => setView('auditoria') },
        { type: 'separator' },
        { label: 'Maximizar/Restaurar Janela', shortcut: 'Alt+Enter', icon: Maximize2, action: () => setIsFormMaximized(!isFormMaximized) }
      ]
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      accessKey: 'C',
      items: [
        { label: 'Rol de Membros & Obreiros', shortcut: 'F2', icon: Users, action: () => setView('cad_membro') },
        { label: 'Dados da Igreja & Congregações', shortcut: '', icon: Building2, action: () => setView('cad_igreja') },
        { label: 'Células & Pequenos Grupos', shortcut: '', icon: Home, action: () => setView('cad_celula') },
        { label: 'Patrimônio & Bens Tombados', shortcut: '', icon: Award, action: () => setView('cad_patrimonio') },
        { label: 'Controle de Frotas & Veículos', shortcut: '', icon: Sliders, action: () => setView('controle_frotas') },
        { label: 'Departamentos & Ministérios', shortcut: '', icon: FolderTree, action: () => setView('cad_departamento') },
        { label: 'Visitantes & Novos Convertidos', shortcut: '', icon: Users, action: () => setView('visitantes') },
        { type: 'separator' },
        { label: 'Gestão de Usuários (Acessos)', shortcut: 'Ctrl+U', icon: Lock, action: () => setView('cad_usuario') }
      ]
    },
    {
      id: 'secretaria',
      label: 'Secretaria',
      accessKey: 'S',
      items: [
        { label: 'Secretaria Integrada & Agenda', shortcut: '', icon: FileText, action: () => setView('secretaria_integrada') },
        { label: 'Escola Bíblica Dominical (EBD)', shortcut: '', icon: BookOpenText, action: () => setView('secretaria_ebd') },
        { label: 'Universidade Teológica (CGADB/CPAD)', shortcut: '', icon: GraduationCap, action: () => setView('curso_teologia') },
        { label: 'Formação & Capacitação de Obreiros (GIPP)', shortcut: '', icon: Award, action: () => setView('formacao_obreiros') },
        { label: 'Livro de Atas Eclesiásticas', shortcut: '', icon: FileText, action: () => setView('secretaria_livro_atas') },
        { label: 'Certificados & Diplomas', shortcut: '', icon: Award, action: () => setView('secretaria_certificados') },
        { label: 'Carteirinhas de Membros', shortcut: '', icon: Users, action: () => setView('carteirinha_studio') },
        { label: 'Credenciais de Ministros em Lote', shortcut: '', icon: ShieldCheck, action: () => setView('credencial_lote') },
        { label: 'Salinha Kids & Berçário', shortcut: '', icon: Sparkles, action: () => setView('salinha_kids') }
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      accessKey: 'F',
      items: [
        { label: 'Livro Caixa: Entradas & Dízimos', shortcut: '', icon: ArrowUpCircle, action: () => setView('fin_entrada') },
        { label: 'Livro Caixa: Saídas & Despesas', shortcut: '', icon: ArrowDownCircle, action: () => setView('fin_saida') },
        { label: 'Demonstrativo de Resultado (DRE)', shortcut: '', icon: FileSpreadsheet, action: () => setView('fin_dre') },
        { label: 'Conciliação Bancária DDA', shortcut: '', icon: CreditCard, action: () => setView('fin_conciliacao') },
        { label: 'Carnês de Contribuição & Dízimo', shortcut: '', icon: DollarSign, action: () => setView('fin_carnes') },
        { label: 'D.P. & Contabilidade eSocial', shortcut: '', icon: Briefcase, action: () => setView('dp_contabilidade') },
        { label: 'Utilitários & Balancetes Fiscais', shortcut: '', icon: Sliders, action: () => setView('fin_utilitarios') }
      ]
    },
    {
      id: 'database',
      label: 'Database',
      accessKey: 'D',
      items: [
        { label: 'TFDConnection: FDConnGIPP [Conectado]', shortcut: '', icon: Database, action: () => {} },
        { label: 'Backup e Restauração de Dados', shortcut: '', icon: Save, action: () => setView('config_backup') },
        { label: 'Auditoria de Transações e SQL', shortcut: '', icon: Shield, action: () => setView('auditoria') },
        { label: 'Lixeira de Registros Excluídos', shortcut: '', icon: Trash2, action: () => setView('lixeira') }
      ]
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      accessKey: 'T',
      items: [
        { label: 'Pastoral IA (Inteligência Artificial)', shortcut: '', icon: Sparkles, action: () => setView('assistente_ai') },
        { label: 'GIPP Docs (Processador de Textos)', shortcut: '', icon: FileText, action: () => setView('docs_editor') },
        { label: 'GIPP Planilhas (Spreadsheets)', shortcut: '', icon: FileSpreadsheet, action: () => setView('sheets_editor') },
        { label: 'Estúdio de Artes & Mídias Sociais', shortcut: '', icon: Palette, action: () => setView('rede_social') },
        { label: 'Disparo de Mensagens em Lote', shortcut: '', icon: Mail, action: () => setView('mensagens_lote') },
        { type: 'separator' },
        { label: 'Configurações do Sistema GIPP', shortcut: '', icon: Settings, action: () => setView('config_sistema') },
        { label: 'Personalização Visual & Temas', shortcut: '', icon: Palette, action: () => setView('config_visual') },
        { type: 'separator' },
        { 
          label: 'Variação: GIPP Retro (Florence)', 
          shortcut: '', 
          icon: Palette, 
          action: () => handleSetDelphiSubTheme('gipp_retro'),
          checked: delphiSubTheme === 'gipp_retro'
        },
        { 
          label: 'Variação: Delphi Classic (VCL 7)', 
          shortcut: '', 
          icon: Palette, 
          action: () => handleSetDelphiSubTheme('delphi_classic'),
          checked: delphiSubTheme === 'delphi_classic'
        },
        { 
          label: 'Variação: High Contrast (Acessibilidade)', 
          shortcut: '', 
          icon: Palette, 
          action: () => handleSetDelphiSubTheme('high_contrast'),
          checked: delphiSubTheme === 'high_contrast'
        }
      ]
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      accessKey: 'J',
      items: [
        { label: 'Manual Completo do Usuário', shortcut: 'F1', icon: HelpCircle, action: () => setView('manual') },
        { label: 'Bíblia Sagrada de Estudos Offline', shortcut: '', icon: BookOpen, action: () => setView('biblia') },
        { label: 'Amparo Legal & Conformidade', shortcut: '', icon: ShieldCheck, action: () => setView('amparo_legal') },
        { label: 'Registro Oficial de Software', shortcut: '', icon: Award, action: () => setView('registro_software') },
        { label: 'Histórico de Versões (Changelog)', shortcut: '', icon: History, action: () => setView('changelog') },
        { type: 'separator' },
        { label: 'Sobre o GIPP Delphi 13 Florence...', shortcut: '', icon: Info, action: () => setView('sobre') },
        { label: 'Suporte Direto com o Desenvolvedor', shortcut: '', icon: Code, action: () => setView('suporte_dev') }
      ]
    }
  ];

  const filteredModules = ALL_AVAILABLE_MODULES.filter(m => {
    if (!isModuleAllowed(m.id)) return false;
    if (!searchQuery) return true;
    return m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const WindowIcon = mMeta.icon || LayoutDashboard;

  return (
    <div className={`h-screen w-full flex flex-col font-sans select-none overflow-hidden ${themeClasses.bgRoot}`} style={{
      backgroundImage: isHighContrast ? undefined : isClassic ? 'radial-gradient(#808080 1px, transparent 1px)' : 'radial-gradient(#9AA5B1 1.2px, transparent 1.2px)',
      backgroundSize: '8px 8px'
    }}>
      {/* =========================================================================
          1. TOP WINDOW TITLE BAR (Embarcadero Delphi 13 Florence IDE Title)
          ========================================================================= */}
      <header className={`h-8 flex items-center justify-between px-2.5 shrink-0 shadow-xs select-none z-50 ${themeClasses.titleBar}`}>
        {/* Left: Delphi Icon & Project / Form Info */}
        <div className="flex items-center gap-2">
          {/* Delphi Florence VCL Red/Blue Badge */}
          <div className="w-5 h-5 bg-gradient-to-br from-[#E63946] via-[#D62828] to-[#004E98] border border-white/40 rounded-xs flex items-center justify-center shadow-xs font-black text-[10px] text-white tracking-tighter">
            D13
          </div>
          <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            <span className="font-extrabold">GIPP SISTEMAS PARA IGREJA</span>
            <span className="opacity-60">•</span>
            <span className="font-semibold truncate max-w-[280px] sm:max-w-md opacity-90">
              GIPP.dproj - [Form_{view || 'Principal'}.pas] {delphiSubTheme === 'delphi_classic' ? '(Classic)' : delphiSubTheme === 'high_contrast' ? '(High Contrast)' : '(Florence)'}
            </span>
          </span>
        </div>

        {/* Right: Quick actions and Window Control Buttons (Delphi Florence Style) */}
        <div className="flex items-center gap-1.5">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-2 bg-black/25 px-2 py-0.5 rounded-xs border border-white/10 text-[10px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FireDAC: VCL Connected</span>
          </div>

          <div className="flex items-center gap-0.5 ml-2">
            {/* Minimize */}
            <button
              onClick={() => setIsFormMaximized(false)}
              className={`w-5 h-4.5 text-[9px] font-black flex items-center justify-center rounded-2xs cursor-pointer ${themeClasses.button3D}`}
              title="Minimizar Form"
            >
              _
            </button>
            {/* Maximize / Restore */}
            <button
              onClick={() => setIsFormMaximized(!isFormMaximized)}
              className={`w-5 h-4.5 text-[9px] font-black flex items-center justify-center rounded-2xs cursor-pointer ${themeClasses.button3D}`}
              title={isFormMaximized ? "Restaurar Form" : "Maximizar Form"}
            >
              {isFormMaximized ? '❐' : '▢'}
            </button>
            {/* Close / Return to Dashboard */}
            <button
              onClick={() => setView('dashboard')}
              className="w-5 h-4.5 bg-[#E63946] hover:bg-[#D62828] active:bg-[#9B2226] border-t border-l border-t-rose-300 border-l-rose-300 border-r border-b border-r-[#780000] border-b-[#780000] text-[9px] font-black text-white flex items-center justify-center rounded-2xs cursor-pointer"
              title="Fechar Módulo Ativo"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. DELPHI TOP MAIN MENU BAR (TMainMenu - Standard VCL Dropdowns)
          ========================================================================= */}
      <nav ref={menuBarRef} className={`px-1 py-0.5 flex items-center justify-between text-xs font-semibold select-none shrink-0 shadow-xs relative z-40 ${themeClasses.menuNav}`}>
        <div className="flex items-center flex-wrap">
          {menuStructure.map(menu => {
            const isOpen = activeMenu === menu.id;
            return (
              <div key={menu.id} className="relative">
                <button
                  onClick={() => setActiveMenu(isOpen ? null : menu.id)}
                  onMouseEnter={() => {
                    if (activeMenu) setActiveMenu(menu.id);
                  }}
                  className={`px-2.5 py-1 rounded-2xs text-[11px] font-bold cursor-pointer transition-all duration-150 ${
                    isOpen 
                      ? isHighContrast ? 'bg-yellow-400 text-black font-black border-2 border-white' : 'bg-[#004E98] text-white border border-[#003366]' 
                      : isHighContrast ? 'hover:bg-yellow-950 text-yellow-300' : 'hover:bg-[#CBD5E1] text-inherit'
                  }`}
                >
                  <span className={`underline decoration-1 ${isHighContrast ? 'decoration-yellow-400' : 'decoration-[#004E98]'}`}>{menu.label.charAt(0)}</span>
                  {menu.label.slice(1)}
                </button>

                {/* Dropdown Menu (Delphi Florence VCL Menu Style com transição suave) */}
                {isOpen && (
                  <div className={`absolute left-0 top-full mt-0.5 w-68 py-1 z-50 text-[11px] font-semibold transition-all duration-150 animate-fadeIn ${themeClasses.menuDropdown}`}>
                    {menu.items.map((item: any, idx: number) => {
                      if (item.type === 'separator') {
                        return <div key={`sep-${idx}`} className={`my-1 border-t ${isHighContrast ? 'border-yellow-400' : 'border-[#BAC7D5] border-b border-white'}`} />;
                      }
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={`item-${idx}`}
                          onClick={() => {
                            item.action();
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-left cursor-pointer transition-colors duration-100 ${
                            item.isDanger 
                              ? 'hover:bg-[#E63946] hover:text-white' 
                              : isHighContrast 
                                ? 'hover:bg-yellow-400 hover:text-black group' 
                                : 'hover:bg-[#004E98] hover:text-white group'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-4 h-4 flex items-center justify-center shrink-0">
                              {item.checked ? (
                                <Check size={13} className={isHighContrast ? 'text-yellow-400 group-hover:text-black' : 'text-[#004E98] group-hover:text-white'} />
                              ) : ItemIcon ? (
                                <ItemIcon size={13} className={isHighContrast ? 'text-yellow-300 group-hover:text-black' : 'text-[#334E68] group-hover:text-white'} />
                              ) : null}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.shortcut && (
                            <span className={`text-[10px] opacity-75 font-mono ml-3 shrink-0 ${isHighContrast ? 'group-hover:text-black text-yellow-200' : 'group-hover:text-white'}`}>
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

        {/* Right side: Quick Search, User badge & Logout */}
        <div className="flex items-center gap-2 pr-1 ml-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-2xs cursor-pointer shadow-inner ${
              isHighContrast 
                ? 'bg-black text-yellow-300 border border-yellow-400' 
                : 'bg-white border-t border-l border-t-[#7B8794] border-l-[#7B8794] border-r border-b border-r-white border-b-white text-[#334E68]'
            }`}
            title="Buscar Módulo [Ctrl+F]"
          >
            <Search size={11} className={isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'} />
            <span className="font-mono text-[10px] hidden sm:inline">Buscar Módulo [Ctrl+F]</span>
          </button>

          <div className={`hidden md:flex items-center gap-2 px-2 py-0.5 rounded-2xs text-[11px] font-bold ${
            isHighContrast 
              ? 'bg-black border border-yellow-400 text-yellow-300' 
              : 'bg-[#ECEFF4] border border-[#BAC7D5] text-[#102A43]'
          }`}>
            <div className="w-4 h-4 rounded-full bg-[#004E98] text-white flex items-center justify-center text-[9px] font-black overflow-hidden">
              {user?.fotoUrl || user?.foto ? (
                <img src={user.fotoUrl || user.foto} alt={user?.nome} className="w-full h-full object-cover" />
              ) : (
                user?.nome?.charAt(0) || 'U'
              )}
            </div>
            <span className="truncate max-w-[120px]">{user?.nome || 'Operador'}</span>
            <span className={`text-[9px] font-mono uppercase ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>
              [{user?.funcao_administrativa || user?.cargo || 'ADMIN'}]
            </span>
          </div>

          <button
            onClick={handleLogoutRequest}
            className="p-1 text-rose-700 hover:bg-rose-100 border border-transparent hover:border-rose-300 rounded-2xs transition-colors cursor-pointer"
            title="Sair do Sistema [Alt+F4]"
          >
            <LogOut size={13} />
          </button>
        </div>
      </nav>

      {/* =========================================================================
          3. MAIN MDI WORKSPACE CONTAINER (Form View Area)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2 relative">
        {/* Optional Delphi Object Inspector Sidebar (F11) */}
        {showObjectInspector && (
          <div className="w-64 bg-[#ECEFF4] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] shadow-md flex flex-col shrink-0 text-xs animate-fadeIn">
            {/* Inspector Header */}
            <div className="bg-gradient-to-r from-[#004E98] to-[#1D65A6] text-white px-2 py-1 font-bold text-[11px] flex justify-between items-center">
              <span>Object Inspector [F11]</span>
              <button onClick={() => setShowObjectInspector(false)} className="text-white hover:text-rose-200">✕</button>
            </div>
            {/* Active Component Dropdown */}
            <div className="p-1.5 bg-[#DFE3E8] border-b border-[#BAC7D5]">
              <div className="bg-white border-t border-l border-t-[#7B8794] border-l-[#7B8794] border-r border-b border-r-white border-b-white px-2 py-1 text-[11px] font-mono text-[#004E98] font-bold truncate">
                Form_{view}: TForm
              </div>
            </div>
            {/* Properties Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              <table className="w-full text-[10px] font-mono border-collapse">
                <tbody>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA] w-24">Name</td><td className="p-1 text-[#004E98] font-bold">Form_{view}</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">Caption</td><td className="p-1">{mMeta.label}</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">Engine</td><td className="p-1 text-emerald-700 font-bold">Delphi 13 VCL</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">DataSet</td><td className="p-1">qry_{view}</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">AutoCommit</td><td className="p-1 text-blue-700">True</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">Position</td><td className="p-1">poScreenCenter</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">WindowState</td><td className="p-1">{isFormMinimized ? 'wsMinimized' : isFormMaximized ? 'wsMaximized' : 'wsNormal'}</td></tr>
                  <tr className="border-b border-[#CBD5E1]"><td className="p-1 font-bold text-[#334E68] bg-[#E2E6EA]">FireDAC</td><td className="p-1 text-emerald-700">FDConnGIPP [Active]</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty Workspace / Closed Form State */}
        {isFormClosed && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 animate-fadeIn">
            <div className={`p-6 max-w-md rounded-xs border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] shadow-2xl ${
              isHighContrast ? 'bg-black text-yellow-300' : 'bg-[#ECEFF4] text-[#102A43]'
            }`}>
              <div className="w-12 h-12 rounded-xs bg-[#004E98] text-white mx-auto flex items-center justify-center mb-3 shadow-md">
                <WindowIcon size={24} />
              </div>
              <h3 className="text-base font-black mb-1">MDI Desktop (Delphi 13 Florence)</h3>
              <p className="text-xs text-[#334E68] mb-4">
                O formulário <strong>Form_{view} ({mMeta.label})</strong> foi fechado.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormClosed(false);
                    setIsFormMinimized(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${themeClasses.button3D}`}
                >
                  Reabrir Form_{view}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('dashboard');
                    setIsFormClosed(false);
                    setIsFormMinimized(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${themeClasses.button3D}`}
                >
                  Abrir Painel Principal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized Workspace State Notice */}
        {isFormMinimized && !isFormClosed && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 animate-fadeIn select-none pointer-events-none">
            <div className="opacity-40 flex flex-col items-center">
              <WindowIcon size={40} className="text-[#004E98] mb-2" />
              <p className="text-xs font-mono font-bold text-[#102A43]">
                Formulário Minimizado • Clique na barra abaixo ou no botão restaurar
              </p>
            </div>
          </div>
        )}

        {/* Active Delphi Form Window (Maximized or Windowed MDI) */}
        {!isFormClosed && !isFormMinimized && (
          <div className={`flex-1 flex flex-col min-h-0 w-full h-full relative ${
            isFormMaximized 
              ? '' 
              : 'items-center justify-center p-1 sm:p-2.5 overflow-hidden'
          }`}>
            <div className={`flex flex-col rounded-xs overflow-hidden relative transition-all duration-150 ${themeClasses.formWorkspace} ${
              isFormMaximized 
                ? 'flex-1 min-h-0 w-full h-full' 
                : `${windowScale === 'compact' ? 'w-[88%] max-w-4xl h-[82%]' : windowScale === 'wide' ? 'w-[98%] max-w-7xl h-[95%]' : 'w-[94%] max-w-6xl h-[88%]'} shadow-2xl my-auto`
            }`}>
              {/* Form Title Bar */}
              <div 
                onDoubleClick={() => setIsFormMaximized(!isFormMaximized)}
                className={`px-3 py-1.5 flex items-center justify-between select-none shrink-0 shadow-xs border-b cursor-default ${
                  isHighContrast 
                    ? 'bg-black text-yellow-300 border-yellow-400' 
                    : isClassic 
                      ? 'bg-[#000080] text-white border-[#000040]' 
                      : 'bg-gradient-to-r from-[#003B73] via-[#004E98] to-[#1D65A6] text-white border-[#003366]'
                }`}
                title="Clique duplo para Maximizar / Restaurar formulário"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <WindowIcon size={14} className={isHighContrast ? 'text-yellow-400' : 'text-sky-200'} />
                  <span className="tracking-wide">
                    Form_{view}: TForm ({mMeta.label})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`hidden sm:inline-block text-[10px] font-mono font-normal px-2 py-0.5 rounded-2xs mr-1 ${
                    isHighContrast ? 'bg-yellow-950 text-yellow-300 border border-yellow-400' : 'bg-black/20 text-sky-200'
                  }`}>
                    DataSet: qry{view} [dsBrowse]
                  </span>

                  {/* Form Window Controls */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFormMinimized(true);
                    }}
                    className={`w-5 h-4.5 text-[9px] font-black flex items-center justify-center cursor-pointer active:translate-y-0.5 transition-transform ${themeClasses.button3D}`}
                    title="Minimizar Formulário [_]"
                  >
                    _
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFormMaximized(!isFormMaximized);
                    }}
                    className={`w-5 h-4.5 text-[9px] font-black flex items-center justify-center cursor-pointer active:translate-y-0.5 transition-transform ${themeClasses.button3D}`}
                    title={isFormMaximized ? "Restaurar Janela [❐]" : "Maximizar Janela [▢]"}
                  >
                    {isFormMaximized ? '❐' : '▢'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseForm();
                    }}
                    className="w-5 h-4.5 bg-[#E63946] hover:bg-[#D62828] active:bg-[#B71C1C] border-t border-l border-t-rose-300 border-l-rose-300 border-r border-b border-r-[#780000] border-b-[#780000] text-[9px] font-black text-white flex items-center justify-center cursor-pointer active:translate-y-0.5 transition-transform"
                    title="Fechar Formulário [✕]"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Form Toolbar / Sub-ribbon */}
              <div className={`px-3 py-1 flex items-center justify-between text-[10px] font-mono shrink-0 border-b ${
                isHighContrast ? 'bg-black border-yellow-400 text-yellow-300' : isClassic ? 'bg-[#ECE9D8] border-[#ACA899] text-black' : 'bg-[#DFE3E8] border-[#BAC7D5] text-[#334E68]'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 font-bold ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>
                    <Database size={11} />
                    <span>FDTable: tb_{view}</span>
                  </span>
                  <span>•</span>
                  <span>State: <strong className={isHighContrast ? 'text-yellow-300 font-bold' : 'text-emerald-700 font-bold'}>dsBrowse</strong></span>
                  <span>•</span>
                  <span>Trans: <strong>InTransaction=False</strong></span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Resize presets when in windowed mode */}
                  {!isFormMaximized && (
                    <div className="hidden md:flex items-center gap-1 bg-white/60 px-1.5 py-0.5 rounded border border-[#BAC7D5] text-[9px]">
                      <span className="font-bold text-[#004E98]">Redimensionar:</span>
                      <button
                        type="button"
                        onClick={() => setWindowScale('compact')}
                        className={`px-1 rounded cursor-pointer ${windowScale === 'compact' ? 'bg-[#004E98] text-white font-bold' : 'hover:bg-slate-200'}`}
                        title="Tamanho Compacto"
                      >
                        80%
                      </button>
                      <button
                        type="button"
                        onClick={() => setWindowScale('normal')}
                        className={`px-1 rounded cursor-pointer ${windowScale === 'normal' ? 'bg-[#004E98] text-white font-bold' : 'hover:bg-slate-200'}`}
                        title="Tamanho Normal"
                      >
                        90%
                      </button>
                      <button
                        type="button"
                        onClick={() => setWindowScale('wide')}
                        className={`px-1 rounded cursor-pointer ${windowScale === 'wide' ? 'bg-[#004E98] text-white font-bold' : 'hover:bg-slate-200'}`}
                        title="Tamanho Expandido"
                      >
                        98%
                      </button>
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-[9px] opacity-75 font-sans">Delphi VCL Florence 64-bit Engine</span>
                </div>
              </div>

              {/* Actual Module Content */}
              <div className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative ${
                isHighContrast ? 'bg-black text-yellow-300' : isClassic ? 'bg-[#ECE9D8] text-black' : 'bg-[#ECEFF4] text-[#102A43]'
              }`}>
                {/* Subtle Delphi Florence GIPP Watermark across all modules */}
                <div className="absolute bottom-6 right-8 pointer-events-none select-none z-0 opacity-[0.06] flex flex-col items-end text-right">
                  <div className="flex items-center gap-3">
                    <svg className="w-16 h-16 text-[#004E98] stroke-current" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="50,10 88,28 88,72 50,90 12,72 12,28" strokeWidth="2" />
                      <circle cx="50" cy="50" r="32" strokeWidth="1.5" strokeDasharray="4 2" />
                      <path d="M50 22 L50 78 M35 45 L65 45" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-black text-5xl tracking-[0.25em] text-[#004E98] font-sans">GIPP</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#102A43] uppercase mt-1">
                    Delphi 13 Florence VCL Architecture
                  </span>
                </div>

                {(user?.usuario?.toLowerCase() === 'mary' && view !== 'suporte_dev' && view !== 'marketing_social' && view !== 'changelog' && view !== 'sobre') ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 relative z-10">
                    <Lock size={48} className="text-rose-600 mb-4 animate-bounce"/>
                    <h2 className="text-2xl font-black mb-1">Acesso Inativo</h2>
                    <p className="text-xs opacity-75">Este módulo está inativo para a conta de Assistente Virtual Mary.</p>
                  </div>
                ) : hasPermission(access) ? (
                  <div className="delphi-form-workspace relative z-10">
                    <CurrentModule {...currentProps} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 relative z-10">
                    <Lock size={48} className="text-rose-600 mb-4"/>
                    <h2 className="text-2xl font-black">Acesso Restrito [Access Denied]</h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delphi VCL Minimized Form Dock Bar at Bottom-Left */}
        {isFormMinimized && !isFormClosed && (
          <div 
            onClick={() => setIsFormMinimized(false)}
            className={`absolute bottom-3 left-3 z-30 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xs shadow-2xl cursor-pointer hover:brightness-105 border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] animate-slideUp ${
              isHighContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-gradient-to-r from-[#003B73] via-[#004E98] to-[#1D65A6] text-white'
            }`}
            style={{ width: '290px' }}
            title="Clique para Restaurar Formulário"
          >
            <div className="flex items-center gap-2 min-w-0 font-bold text-xs">
              <WindowIcon size={14} className={isHighContrast ? 'text-yellow-400' : 'text-sky-200'} />
              <span className="truncate">Form_{view}: TForm</span>
            </div>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsFormMinimized(false);
                  setIsFormMaximized(false);
                }}
                className={`w-4.5 h-4 text-[8px] font-black flex items-center justify-center cursor-pointer ${themeClasses.button3D}`}
                title="Restaurar Janela Normal"
              >
                ❐
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormMinimized(false);
                  setIsFormMaximized(true);
                }}
                className={`w-4.5 h-4 text-[8px] font-black flex items-center justify-center cursor-pointer ${themeClasses.button3D}`}
                title="Maximizar Janela"
              >
                ▢
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="w-4.5 h-4 bg-[#E63946] hover:bg-[#D62828] border-t border-l border-t-rose-300 border-l-rose-300 border-r border-b border-r-[#780000] border-b-[#780000] text-[8px] font-black text-white flex items-center justify-center cursor-pointer"
                title="Fechar Janela"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. DELPHI MULTI-PANEL STATUS BAR (TStatusBar - Standard Florence VCL)
          ========================================================================= */}
      <footer className={`h-6 px-1 flex items-center gap-1 text-[10px] font-mono select-none shrink-0 shadow-inner overflow-x-auto no-scrollbar ${themeClasses.statusBar}`}>
        {/* Panel 1: FireDAC SQLite / Firestore Database Connection */}
        <div className={`px-2 py-0.5 flex items-center gap-1.5 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={`font-bold ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>FDConn_GIPP:</span>
          <span className={isHighContrast ? 'text-yellow-300' : 'text-emerald-800 font-semibold'}>ONLINE (SQLite/Firestore)</span>
        </div>

        {/* Panel 2: User & Role */}
        <div className={`px-2 py-0.5 flex items-center gap-1 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="font-bold opacity-75">Usuário:</span>
          <span className="font-bold truncate max-w-[120px]">{user?.nome || 'Admin'}</span>
          <span className={`text-[9px] ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>({user?.funcao_administrativa || user?.cargo || 'Membro'})</span>
        </div>

        {/* Panel 3: Active View Module */}
        <div className={`px-2 py-0.5 flex items-center gap-1 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="font-bold opacity-75">View:</span>
          <span className={`font-extrabold ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>{mMeta.label}</span>
        </div>

        {/* Panel 4: Modified Status */}
        <div className={`hidden sm:flex px-2 py-0.5 items-center gap-1 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="font-bold opacity-75">Modificado:</span>
          <span className="opacity-60">NÃO</span>
        </div>

        {/* Panel 5: Network / Latency */}
        <div className={`hidden md:flex px-2 py-0.5 items-center gap-1 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="font-bold opacity-75">Latência:</span>
          <span className={isHighContrast ? 'text-yellow-300 font-bold' : 'text-emerald-700 font-bold'}>14ms</span>
        </div>

        {/* Panel 6: Keyboard Keys */}
        <div className={`hidden lg:flex px-2 py-0.5 items-center gap-1.5 shrink-0 text-[9px] opacity-75 ${themeClasses.statusPanel}`}>
          <span className={`font-black ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>CAPS</span>
          <span>|</span>
          <span className={`font-black ${isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}`}>NUM</span>
          <span>|</span>
          <span className="opacity-40">SCRL</span>
        </div>

        {/* Panel 7: Time & Date */}
        <div className={`ml-auto px-2 py-0.5 flex items-center gap-2 shrink-0 ${themeClasses.statusPanel}`}>
          <span className="font-bold">{currentTime}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-75">{currentDate}</span>
        </div>

        {/* Panel 8: Delphi 13 Florence Signature */}
        <div className={`hidden xl:flex px-2 py-0.5 items-center gap-1 shrink-0 font-black text-[9px] ${themeClasses.statusPanel}`}>
          <span className={isHighContrast ? 'text-yellow-400' : 'text-[#004E98]'}>⚡ Delphi 13 Florence ({delphiSubTheme})</span>
        </div>
      </footer>

      {/* =========================================================================
          7. GLOBAL QUICK SEARCH DIALOG (TFindDialog / Module Search)
          ========================================================================= */}
      {searchOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-[100] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#ECEFF4] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] shadow-2xl rounded-xs overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Find Dialog Title */}
            <div className="bg-gradient-to-r from-[#004E98] to-[#1D65A6] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
              <span className="flex items-center gap-2">
                <Search size={13} />
                <span>Localizar Módulo / Tabela (TFindDialog)</span>
              </span>
              <button onClick={() => setSearchOpen(false)} className="text-white hover:text-rose-300 font-bold">✕</button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#102A43] mb-1 block">Pesquisar por nome ou ID do módulo:</label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ex: membros, caixa, teologia, ebd..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-t-2 border-l-2 border-t-[#6E7A8A] border-l-[#6E7A8A] border-r border-b border-r-[#CBD5E1] border-b-[#CBD5E1] text-xs font-bold text-[#0F172A] rounded-2xs focus:outline-none focus:border-[#004E98]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                  )}
                </div>
              </div>

              {/* Filtered list */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar border border-[#BAC7D5] bg-white rounded-2xs">
                {filteredModules.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-bold">Nenhum módulo encontrado.</div>
                ) : (
                  filteredModules.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setView(m.id);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#E6F0FA] flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="text-[#004E98]" />
                          <div>
                            <p className="text-xs font-bold text-[#102A43] group-hover:text-[#004E98]">{m.label}</p>
                            <p className="text-[10px] font-mono text-slate-400">ID: {m.id}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#004E98] opacity-0 group-hover:opacity-100 transition-opacity">Abrir →</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#BAC7D5]">
                <button
                  onClick={() => setSearchOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold bg-gradient-to-b from-white via-[#E6E9ED] to-[#D2D7DF] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#5A6578] border-b-[#5A6578] text-[#102A43] rounded-2xs hover:bg-[#F0F3F7] cursor-pointer"
                >
                  Fechar [Esc]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
